-- Sign-up channels, part 2 (founder, 1 Nov 2026): adds quora and stackexchange, the two places in
-- marketing "answer where people ask" (radlor-internal/marketing/whiteboard-ai/answer-where-asked.md) that had no
-- channel. Same pattern as 20261101000100: the check, complete_signup() (body unchanged apart from the list) and
-- SIGNUP_SOURCES in src/lib/source.ts must match; tests/auth/source.test.ts checks the latest migration against it.

alter table public.profiles drop constraint if exists profiles_signup_source_check;
alter table public.profiles add constraint profiles_signup_source_check check (signup_source in
  ('tiktok','instagram','youtube','reddit','discord','ref','share','direct','whatsapp','linkedin','friend','quora','stackexchange'));

create or replace function public.complete_signup(p_user_id uuid, p_birth_year int, p_birth_month int, p_gate_version text,
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
        ('tiktok','instagram','youtube','reddit','discord','ref','share','direct','whatsapp','linkedin','friend','quora','stackexchange') then p_source end)
    where id = p_user_id;
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return 'ok';
end $$;
