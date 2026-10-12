-- M1 / PLAN.md §6.3: accounts, the age gate, terms, invites and the price catalogue.
-- Security change: adds SECURITY DEFINER functions (complete_signup, link_stripe_customer, redeem_invite,
-- invite_available, accept_terms), each owned by postgres with search_path = ''.

create table public.profiles (
  id                 uuid primary key,          -- = auth.users.id; no FK on purpose: the row outlives the auth user (§6.10)
  created_at         timestamptz not null default now(),
  age_band           text check (age_band in ('13-17','18+')),   -- null = age screen not done
  age_confirmed_at   timestamptz,
  age_gate_version   text,
  terms_version      text,
  terms_accepted_at  timestamptz,
  stripe_customer_id text unique,
  access_granted_at  timestamptz,               -- invite gate (signup_mode = 'invite')
  signup_source      text check (signup_source in ('tiktok','instagram','youtube','reddit','discord','ref','share','direct')),
  deleted_at         timestamptz,
  check ((age_band is null) = (age_confirmed_at is null)),
  check (deleted_at is null or age_band is null));
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated, service_role;
grant select on public.profiles to authenticated, service_role;
-- Its policy needs is_live_user(), created in 000300.

create table public.invites (code text primary key, max_uses int not null check (max_uses > 0),
  used int not null default 0 check (used <= max_uses), note text, created_at timestamptz not null default now());
alter table public.invites enable row level security;
revoke all on public.invites from public, anon, authenticated, service_role;
grant select on public.invites to service_role;

create table public.price_catalog (
  price_key text primary key, kind text not null check (kind in ('subscription','topup')),
  credits int not null check (credits > 0), unit_amount_cents int not null check (unit_amount_cents > 0),
  active boolean not null default true);
insert into public.price_catalog values
 ('plus','subscription',150,999,true), ('pro','subscription',330,1999,true),
 ('topup_60','topup',60,499,true), ('topup_132','topup',132,999,true), ('topup_282','topup',282,1999,true);
alter table public.price_catalog enable row level security;
revoke all on public.price_catalog from public, anon, authenticated, service_role;
grant select on public.price_catalog to service_role;

-- Changed only by a migration (§11.8 step 2).
create function public.current_terms_version() returns text
language sql immutable set search_path = '' as $$ select '2026-10-13-beta'::text $$;
revoke all on function public.current_terms_version() from public, anon, authenticated, service_role;
grant execute on function public.current_terms_version() to authenticated, service_role;

-- §6.3. 'ok' | 'already_done' | 'under_13' | 'invalid' | 'closed'. Writes only on 'ok'.
create function public.complete_signup(p_user_id uuid, p_birth_year int, p_birth_month int, p_gate_version text,
  p_terms_version text, p_source text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_today    date := (now() at time zone 'Pacific/Pago_Pago')::date;  -- the earliest US calendar date
  v_youngest date;
  v_p        public.profiles;
  v_c        text;
begin
  select * into v_p from public.profiles where id = p_user_id for update;
  if not found or v_p.deleted_at is not null then return 'invalid'; end if;
  if v_p.age_band is not null then return 'already_done'; end if;
  if (select signup_mode from public.ops_settings where id) = 'closed' then return 'closed'; end if;
  if p_birth_month is null or p_birth_month not between 1 and 12
     or p_birth_year is null or p_birth_year not between 1800 and 9999
     or p_gate_version is null or char_length(p_gate_version) not between 1 and 40
     or p_terms_version is distinct from public.current_terms_version() then
    return 'invalid';
  end if;
  -- The youngest possible birth date is the last day of the month.
  v_youngest := (make_date(p_birth_year, p_birth_month, 1) + interval '1 month' - interval '1 day')::date;
  if v_youngest > v_today or v_youngest < (v_today - interval '120 years')::date then return 'invalid'; end if;
  if (v_youngest + interval '13 years')::date > v_today then return 'under_13'; end if;   -- writes nothing
  begin
    update public.profiles set
      age_band = case when (v_youngest + interval '18 years')::date <= v_today then '18+' else '13-17' end,
      age_confirmed_at = now(), age_gate_version = p_gate_version,
      terms_version = p_terms_version, terms_accepted_at = now(),
      signup_source = coalesce(signup_source, case when p_source in
        ('tiktok','instagram','youtube','reddit','discord','ref','share','direct') then p_source end)
    where id = p_user_id;
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return 'ok';
end $$;

-- §6.3. Sets the column only if it is null and returns the stored id (two racing checkouts use the same one).
create function public.link_stripe_customer(p_user_id uuid, p_customer_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_c text; v_id text;
begin
  if p_customer_id is null or p_customer_id !~ '^cus_\w{1,250}$' then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  begin
    update public.profiles set stripe_customer_id = p_customer_id
     where id = p_user_id and stripe_customer_id is null and deleted_at is null;
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  select stripe_customer_id into v_id from public.profiles where id = p_user_id;
  return v_id;
end $$;

-- §6.3, authenticated: the user comes from auth.uid().
create function public.redeem_invite(p_code text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  perform 1 from public.profiles where id = v_uid and access_granted_at is not null;
  if found then return true; end if;
  if p_code is null or char_length(p_code) not between 1 and 64 then return false; end if;
  update public.invites set used = used + 1 where code = p_code and used < max_uses;
  if not found then return false; end if;
  update public.profiles set access_granted_at = now() where id = v_uid;
  return true;
end $$;

-- §6.3, service_role: only checks (the invite screen before the age step).
create function public.invite_available(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.invites where code = p_code and used < max_uses)
$$;

-- §11.8. 'ok' | 'stale_version'.
create function public.accept_terms(p_version text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_version is distinct from public.current_terms_version() then return 'stale_version'; end if;
  update public.profiles set terms_version = p_version, terms_accepted_at = now() where id = auth.uid();
  return 'ok';
end $$;

revoke all on function public.complete_signup(uuid,int,int,text,text,text) from public, anon, authenticated, service_role;
revoke all on function public.link_stripe_customer(uuid,text)              from public, anon, authenticated, service_role;
revoke all on function public.redeem_invite(text)                          from public, anon, authenticated, service_role;
revoke all on function public.invite_available(text)                       from public, anon, authenticated, service_role;
revoke all on function public.accept_terms(text)                           from public, anon, authenticated, service_role;
grant execute on function public.complete_signup(uuid,int,int,text,text,text) to service_role;
grant execute on function public.link_stripe_customer(uuid,text)              to service_role;
grant execute on function public.invite_available(text)                       to service_role;
grant execute on function public.redeem_invite(text)                          to authenticated;
grant execute on function public.accept_terms(text)                           to authenticated;
