-- M1 / PLAN.md §11.2, §11.3, §11.5, §11.7, §11.10: admin, settings and switches, alerts, rate limits, client errors,
-- the email outbox.
-- Security change: adds SECURITY DEFINER functions is_admin, every admin_* (authenticated; each starts with the
-- is_admin() check), hit_rate_limit, record_client_error, raise_ops_alert, outbox_claim, outbox_done,
-- unfinished_signups (service_role), owned by postgres with search_path = ''.

create table public.admins (user_id uuid primary key references public.profiles(id) on delete restrict,
  added_at timestamptz not null default now());

create table public.admin_audit (id bigint generated always as identity primary key, at timestamptz not null default now(),
  admin_id uuid not null,                          -- plain uuids, no FK (§6.10): rows outlive any profile
  action text not null check (action in ('grant_credits','revoke_credits','refund_generation','set_flags','clear_flags',
    'unpublish_share','set_settings','view_generation','resolve_report','delete_user','resolve_stripe_event',
    'beta_allow','change_email','grant_access','dispute_evidence')),
  target_user_id uuid, target_id text, delta int, request_id uuid unique,
  reason text not null check (char_length(reason) between 5 and 500), detail jsonb);
create trigger admin_audit_append_only before update or delete on public.admin_audit
  for each row execute function public.ledger_append_only();
create trigger admin_audit_no_truncate before truncate on public.admin_audit
  for each statement execute function public.ledger_append_only();

create table public.account_flags (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  generation_blocked boolean not null default false,
  generation_blocked_until timestamptz,
  purchases_blocked boolean not null default false,
  reason text check (reason in ('dispute','efw','refusals','abuse','support','other')),
  updated_at timestamptz not null default now());

create table public.ops_settings (
  id boolean primary key default true check (id),
  generation_enabled boolean not null default true,
  purchases_enabled boolean not null default true,
  signup_mode text not null default 'invite' check (signup_mode in ('invite','open','closed')),
  daily_spend_cap_usd numeric(8,2) not null default 25,
  max_open_generations int not null default 4 check (max_open_generations > 0),        -- §6.6 step 7, D14
  user_uncharged_cap_usd numeric(6,2) not null default 0.50 check (user_uncharged_cap_usd > 0),   -- B19
  smoke_user_id uuid,                                  -- §11.5 smoke test; left out of metrics and the digest
  notice text check (char_length(notice) <= 280),
  updated_at timestamptz not null default now(), updated_by uuid);
insert into public.ops_settings default values;

create table public.ops_alerts (id bigint generated always as identity primary key, at timestamptz not null default now(),
  day date not null default (now() at time zone 'utc')::date, kind text not null, detail jsonb not null default '{}',
  resolved_at timestamptz, unique (day, kind));
create table public.ops_state (key text primary key, at timestamptz not null, value jsonb);

create table public.rate_limits (key text not null, window_start timestamptz not null, hits int not null check (hits > 0),
  primary key (key, window_start));

create table public.client_errors (source text not null default 'client' check (source in ('client','server')),
  release text, route text, code text, generation_id uuid, message text check (char_length(message) <= 500),
  stack text check (char_length(stack) <= 2000), ua text, hour timestamptz, count int not null default 1,
  unique nulls not distinct (source, release, route, message, hour));

create table public.email_outbox (id bigint generated always as identity primary key,
  user_id uuid,                                      -- plain uuid, no FK (§6.10)
  kind text not null check (kind in ('sub_confirmation','account_deleted','refund_notice','terms_change','breach_notice')),
  dedupe_key text not null, to_email text, payload jsonb not null default '{}',
  created_at timestamptz not null default now(), sent_at timestamptz, attempts smallint not null default 0,
  last_error text check (char_length(last_error) <= 500),
  unique (kind, dedupe_key));

alter table public.admins        enable row level security;
alter table public.admin_audit   enable row level security;
alter table public.account_flags enable row level security;
alter table public.ops_settings  enable row level security;
alter table public.ops_alerts    enable row level security;
alter table public.ops_state     enable row level security;
alter table public.rate_limits   enable row level security;
alter table public.client_errors enable row level security;
alter table public.email_outbox  enable row level security;
revoke all on public.admins, public.admin_audit, public.account_flags, public.ops_settings, public.ops_alerts,
  public.ops_state, public.rate_limits, public.client_errors, public.email_outbox
  from public, anon, authenticated, service_role;
grant select on public.admins, public.admin_audit, public.account_flags, public.ops_settings, public.ops_alerts,
  public.ops_state, public.rate_limits, public.client_errors, public.email_outbox to service_role;

-- §11.3: identity from a verified JWT, never a parameter; aal2 (TOTP) required.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid()) and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- §11.2: one row per (UTC day, kind). true only for a new row; the caller emails only then.
create function public.raise_ops_alert(p_kind text, p_detail jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(char_length(p_kind), 0) not between 1 and 300 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  insert into public.ops_alerts (kind, detail) values (p_kind, coalesce(p_detail, '{}'))
  on conflict (day, kind) do nothing;
  return found;
end $$;

-- §11.10: one atomic upsert per fixed window (aligned to the epoch, so a 86400 s window is a UTC day).
create function public.hit_rate_limit(p_key text, p_window_seconds int, p_max int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_hits int;
begin
  if coalesce(char_length(p_key), 0) not between 1 and 300 or coalesce(p_window_seconds, 0) not between 1 and 2678400
     or coalesce(p_max, 0) < 1 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds), 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;

create function public.health_ping() returns boolean language sql stable set search_path = '' as $$ select true $$;

-- §11.5. Messages and stacks only, never question text; at most 1,000 new rows a UTC day.
-- Returns true when this call raised server_5xx:<route> (the caller then emails).
create function public.record_client_error(p_source text, p_release text, p_route text, p_code text,
  p_generation_id uuid, p_message text, p_stack text, p_ua text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_hour timestamptz := date_trunc('hour', now() at time zone 'utc') at time zone 'utc';
  v_midnight timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_route text := left(p_route, 200); v_msg text := left(p_message, 500); v_n int;
begin
  if coalesce(p_source, '') not in ('client','server') then return false; end if;
  if not exists (select 1 from public.client_errors where source = p_source and release is not distinct from left(p_release, 100)
                   and route is not distinct from v_route and message is not distinct from v_msg and hour = v_hour)
     and (select count(*) from public.client_errors where hour >= v_midnight) >= 1000 then
    return false;
  end if;
  insert into public.client_errors as e (source, release, route, code, generation_id, message, stack, ua, hour)
  values (p_source, left(p_release, 100), v_route, left(p_code, 100), p_generation_id, v_msg, left(p_stack, 2000),
          left(p_ua, 300), v_hour)
  on conflict (source, release, route, message, hour) do update set count = e.count + 1;
  if p_source = 'server' and (v_route like '/api/billing/%' or v_route = '/api/stripe/webhook'
       or v_route = '/api/generate' or v_route like '/api/account/%') then
    select coalesce(sum(count), 0) into v_n from public.client_errors
     where source = 'server' and route = v_route and hour = v_hour;
    if v_n >= 3 then return public.raise_ops_alert('server_5xx:' || v_route, jsonb_build_object('count', v_n)); end if;
  end if;
  return false;
end $$;

-- §11.7: unsent rows, skip locked, attempts + 1.
create function public.outbox_claim(p_limit int) returns setof public.email_outbox
language plpgsql security definer set search_path = '' as $$
begin
  return query
  update public.email_outbox set attempts = attempts + 1
   where id in (select id from public.email_outbox where sent_at is null and attempts < 5
                 order by id limit least(greatest(coalesce(p_limit, 10), 1), 100) for update skip locked)
  returning *;
end $$;

create function public.outbox_done(p_id bigint, p_error text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_attempts smallint;
begin
  if p_error is null then
    update public.email_outbox set sent_at = now(), to_email = null, last_error = null
     where id = p_id and sent_at is null;
    return found;
  end if;
  update public.email_outbox set last_error = left(p_error, 500) where id = p_id and sent_at is null
  returning attempts into v_attempts;
  if v_attempts >= 5 then perform public.raise_ops_alert('email_failed', jsonb_build_object('outbox_id', p_id)); end if;
  return false;
end $$;

-- §6.8 cleanup: auth users to hard-delete (email never confirmed after 24 h; confirmed, no age band, no credits,
-- after 7 days).
create function public.unfinished_signups(p_limit int) returns table(user_id uuid)
language sql stable security definer set search_path = '' as $$
  select u.id from auth.users u left join public.profiles p on p.id = u.id
   where (u.email_confirmed_at is null and u.created_at < now() - interval '24 hours')
      or (u.email_confirmed_at is not null and p.age_band is null and p.deleted_at is null
          and u.created_at < now() - interval '7 days'
          and not exists (select 1 from public.credit_ledger l where l.user_id = u.id))
   order by u.created_at limit least(greatest(coalesce(p_limit, 100), 1), 1000)
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Admin (§11.3). Every function: is_admin() first; a reason of 5–500 characters; an audit row in the same
-- transaction; a repeated p_request_id returns the first result and writes nothing.

create function public._admin_check(p_reason text) returns uuid
language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if coalesce(char_length(p_reason), 0) not between 5 and 500 then
    raise exception 'rejected:reason' using errcode = '22023';
  end if;
  return auth.uid();
end $$;

create function public._audit(p_action text, p_target_user uuid, p_target_id text, p_delta int, p_request_id uuid,
  p_reason text, p_detail jsonb) returns bigint
language plpgsql set search_path = '' as $$
declare v_id bigint;
begin
  insert into public.admin_audit (admin_id, action, target_user_id, target_id, delta, request_id, reason, detail)
  values (auth.uid(), p_action, p_target_user, left(p_target_id, 300), p_delta, p_request_id, p_reason, p_detail)
  returning id into v_id;
  return v_id;
end $$;

-- Top-up bucket only; a negative delta past the top-up writes nothing. Returns the new top-up.
create function public.admin_adjust_credits(p_user uuid, p_delta int, p_reason text, p_request_id uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare b public.credit_balances; v_prior public.admin_audit; v_audit bigint;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_delta is null or p_delta = 0 or abs(p_delta) > 1000 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into b from public.credit_balances where user_id = p_user for update;
  if not found then raise exception 'no such user' using errcode = 'P0002'; end if;
  select * into v_prior from public.admin_audit where request_id = p_request_id;
  if found then return (v_prior.detail ->> 'topup_after')::int; end if;
  if exists (select 1 from public.profiles where id = p_user and deleted_at is not null) then
    raise exception 'account deleted' using errcode = 'P0001';
  end if;
  if b.topup + p_delta < 0 then raise exception 'would go negative' using errcode = 'P0001'; end if;
  v_audit := public._audit(case when p_delta > 0 then 'grant_credits' else 'revoke_credits' end, p_user, null,
                           p_delta, p_request_id, p_reason, jsonb_build_object('topup_after', b.topup + p_delta));
  perform public._ledger(p_user, 'admin_adjust', 0, p_delta, 0, null, null, v_audit);
  return b.topup + p_delta;
end $$;

-- succeeded -> refunded, admin_refund +credits_charged to top-up (never expires). Returns the credits refunded.
create function public.admin_refund_generation(p_generation uuid, p_reason text, p_request_id uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare g public.generations; v_user uuid; v_prior public.admin_audit; v_audit bigint;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  select user_id into v_user from public.generations where id = p_generation;
  if not found then raise exception 'no such generation' using errcode = 'P0002'; end if;
  perform 1 from public.credit_balances where user_id = v_user for update;
  select * into v_prior from public.admin_audit where request_id = p_request_id;
  if found then return v_prior.delta; end if;
  select * into g from public.generations where id = p_generation for update;
  if g.status = 'refunded' then raise exception 'already refunded' using errcode = 'P0001'; end if;
  if g.status <> 'succeeded' then raise exception 'not refundable' using errcode = 'P0001'; end if;
  if exists (select 1 from public.profiles where id = v_user and deleted_at is not null) then
    raise exception 'account deleted' using errcode = 'P0001';
  end if;
  v_audit := public._audit('refund_generation', v_user, p_generation::text, g.credits_charged, p_request_id, p_reason, null);
  update public.generations set status = 'refunded' where id = p_generation;
  perform public._ledger(v_user, 'admin_refund', 0, g.credits_charged, 0, p_generation, null, v_audit);
  insert into public.email_outbox (user_id, kind, dedupe_key, payload)
  values (v_user, 'refund_notice', p_generation::text, jsonb_build_object('credits', g.credits_charged))
  on conflict (kind, dedupe_key) do nothing;
  return g.credits_charged;
end $$;

create function public.admin_set_flags(p_user uuid, p_generation_blocked boolean, p_purchases_blocked boolean,
  p_generation_blocked_until timestamptz, p_flag_reason text, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_before jsonb; v_clear boolean;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_generation_blocked is null or p_purchases_blocked is null
     or (p_flag_reason is not null and p_flag_reason not in ('dispute','efw','refusals','abuse','support','other')) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  perform 1 from public.credit_balances where user_id = p_user for update;
  if not found then raise exception 'no such user' using errcode = 'P0002'; end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  select to_jsonb(f) - 'user_id' - 'updated_at' into v_before from public.account_flags f where user_id = p_user;
  v_clear := not p_generation_blocked and not p_purchases_blocked and p_generation_blocked_until is null;
  insert into public.account_flags as f (user_id, generation_blocked, purchases_blocked, generation_blocked_until, reason)
  values (p_user, p_generation_blocked, p_purchases_blocked, p_generation_blocked_until, p_flag_reason)
  on conflict (user_id) do update set generation_blocked = excluded.generation_blocked,
    purchases_blocked = excluded.purchases_blocked, generation_blocked_until = excluded.generation_blocked_until,
    reason = excluded.reason, updated_at = now();
  perform public._audit(case when v_clear then 'clear_flags' else 'set_flags' end, p_user, null, null, p_request_id,
    p_reason, jsonb_build_object('before', v_before, 'after', jsonb_build_object('generation_blocked', p_generation_blocked,
      'purchases_blocked', p_purchases_blocked, 'generation_blocked_until', p_generation_blocked_until,
      'reason', p_flag_reason)));
  return true;
end $$;

-- §11.2: the only way ops_settings changes. p_changes holds only the keys to change.
create function public.admin_set_settings(p_changes jsonb, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_old public.ops_settings; v_new public.ops_settings; v_c text;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'
     or exists (select 1 from jsonb_object_keys(p_changes) k where k not in ('generation_enabled','purchases_enabled',
       'signup_mode','daily_spend_cap_usd','max_open_generations','user_uncharged_cap_usd','smoke_user_id','notice')) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  select * into v_old from public.ops_settings where id for update;
  v_new := jsonb_populate_record(v_old, p_changes);
  begin
    update public.ops_settings set generation_enabled = v_new.generation_enabled,
      purchases_enabled = v_new.purchases_enabled, signup_mode = v_new.signup_mode,
      daily_spend_cap_usd = v_new.daily_spend_cap_usd, max_open_generations = v_new.max_open_generations,
      user_uncharged_cap_usd = v_new.user_uncharged_cap_usd, smoke_user_id = v_new.smoke_user_id,
      notice = v_new.notice, updated_at = now(), updated_by = auth.uid()
     where id;
  exception when check_violation or not_null_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  perform public._audit('set_settings', null, 'ops_settings', null, p_request_id, p_reason,
    jsonb_build_object('before', to_jsonb(v_old) - 'updated_at' - 'updated_by', 'after', p_changes));
  return true;
end $$;

create function public.admin_unpublish_share(p_slug text, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  delete from public.shares where slug = p_slug returning user_id into v_user;
  if not found then return false; end if;
  perform public._audit('unpublish_share', v_user, p_slug, null, p_request_id, p_reason, null);
  return true;
end $$;

-- "Open one": the question and script for a replay; every view is audited.
create function public.admin_view_generation(p_generation uuid, p_reason text)
returns table(question text, style text, status text, script jsonb, voice text, voice_clips jsonb,
              content_deleted_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  perform public._admin_check(p_reason);
  select g.user_id into v_user from public.generations g where g.id = p_generation;
  if not found then return; end if;
  perform public._audit('view_generation', v_user, p_generation::text, null, null, p_reason, null);
  return query select g.question, g.style, g.status, g.script, g.voice, g.voice_clips, g.content_deleted_at, g.created_at
                 from public.generations g where g.id = p_generation;
end $$;

-- p_kind: feedback (p_id = generation id) | report (reports.id) | support (support_messages.id).
create function public.admin_resolve_report(p_kind text, p_id text, p_resolution text, p_reason text,
  p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or coalesce(p_kind, '') not in ('feedback','report','support')
     or p_id !~ '^[0-9a-f-]{36}$' or char_length(p_resolution) > 500 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  if p_kind = 'feedback' then
    update public.video_feedback set resolved_at = now(), resolution = p_resolution
     where generation_id = p_id::uuid returning user_id into v_user;
  elsif p_kind = 'report' then
    update public.reports set resolved_at = now(), resolution = p_resolution where id = p_id::uuid;
  else
    update public.support_messages set resolved_at = now() where id = p_id::uuid returning user_id into v_user;
  end if;
  if not found then return false; end if;
  perform public._audit('resolve_report', v_user, p_kind || ':' || p_id, null, p_request_id, p_reason,
                        jsonb_build_object('resolution', p_resolution));
  return true;
end $$;

-- Invite codes live under /admin/settings, so they are audited as set_settings.
create function public.admin_create_invite(p_code text, p_max_uses int, p_note text, p_reason text, p_request_id uuid)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or coalesce(p_code, '') !~ '^[A-Za-z0-9_-]{4,64}$' or coalesce(p_max_uses, 0) not between 1 and 10000
     or char_length(p_note) > 200 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  insert into public.invites (code, max_uses, note) values (p_code, p_max_uses, p_note) on conflict (code) do nothing;
  if not found then return false; end if;
  perform public._audit('set_settings', null, 'invite:' || p_code, p_max_uses, p_request_id, p_reason, null);
  return true;
end $$;

create function public.admin_grant_access(p_user uuid, p_reason text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  update public.profiles set access_granted_at = coalesce(access_granted_at, now())
   where id = p_user and deleted_at is null;
  if not found then return false; end if;
  perform public._audit('grant_access', p_user, null, null, null, p_reason, null);
  return true;
end $$;

create function public.admin_resolve_stripe_event(p_event_id text, p_resolution text, p_reason text, p_request_id uuid)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or coalesce(char_length(p_resolution), 0) not between 1 and 500 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  update public.stripe_events set resolved_at = now(), resolution = p_resolution
   where id = p_event_id and resolved_at is null;
  if not found then return false; end if;
  perform public._audit('resolve_stripe_event', null, p_event_id, null, p_request_id, p_reason, null);
  return true;
end $$;

-- B14: returns the Stripe customer id for radar.valueListItems.create (null: the page creates the customer first).
create function public.admin_beta_allow(p_user uuid, p_reason text, p_request_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_cus text;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  select stripe_customer_id into v_cus from public.profiles where id = p_user and deleted_at is null;
  if not found then raise exception 'no such user' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.admin_audit where request_id = p_request_id) then
    perform public._audit('beta_allow', p_user, v_cus, null, p_request_id, p_reason, null);
  end if;
  return v_cus;
end $$;

-- Audit only: the page then uses the Auth admin API (§11.3).
create function public.admin_change_email(p_user uuid, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  if p_request_id is null then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  if not exists (select 1 from public.admin_audit where request_id = p_request_id) then
    perform public._audit('change_email', p_user, null, null, p_request_id, p_reason, null);
  end if;
  return true;
end $$;

-- Audit only: the page then runs the self-deletion path (§6.10) for that user.
create function public.admin_delete_user(p_user uuid, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_check(p_reason);
  if p_request_id is null then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  if not exists (select 1 from public.admin_audit where request_id = p_request_id) then
    perform public._audit('delete_user', p_user, null, null, p_request_id, p_reason, null);
  end if;
  return true;
end $$;

-- §11.3: an exact email, a user or generation UUID, or a Stripe id by prefix. Never a list of emails.
create function public.admin_lookup_user(p_query text) returns table(user_id uuid, matched_by text)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare q text := btrim(p_query);
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if q is null or char_length(q) not between 3 and 320 then return; end if;
  if q ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    return query select p.id, 'user_id'::text from public.profiles p where p.id = q::uuid
      union all select g.user_id, 'generation_id' from public.generations g where g.id = q::uuid;
  elsif q like 'cs\_%' then
    return query select p.user_id, 'checkout_session'::text from public.purchases p where p.checkout_session_id = q;
  elsif q like 'pi\_%' then
    return query select p.user_id, 'payment_intent'::text from public.purchases p where p.stripe_payment_intent_id = q;
  elsif q like 'in\_%' then
    return query select p.user_id, 'invoice'::text from public.purchases p where p.stripe_invoice_id = q;
  elsif q like 'sub\_%' then
    return query select s.user_id, 'subscription'::text from public.subscriptions s where s.stripe_subscription_id = q;
  elsif q like 'cus\_%' then
    return query select p.id, 'customer'::text from public.profiles p where p.stripe_customer_id = q;
  elsif q like '%@%' then
    return query select u.id, 'email'::text from auth.users u where lower(u.email) = lower(q);
  end if;
end $$;

-- §11.3: plain text for Stripe's dispute form, with no question text. Audited.
create function public.admin_dispute_evidence(p_user uuid, p_reason text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_p public.profiles; v_out text; v_last timestamptz;
begin
  perform public._admin_check(p_reason);
  select * into v_p from public.profiles where id = p_user;
  if not found then raise exception 'no such user' using errcode = 'P0002'; end if;
  select last_sign_in_at into v_last from auth.users where id = p_user;
  perform public._audit('dispute_evidence', p_user, null, null, null, p_reason, null);
  v_out := format(E'Account created: %s\nTerms version: %s, accepted at %s\nLast sign-in: %s\n\nPurchases:\n',
                  v_p.created_at, coalesce(v_p.terms_version, '-'), coalesce(v_p.terms_accepted_at::text, '-'),
                  coalesce(v_last::text, '-'));
  v_out := v_out || coalesce((select string_agg(format('  %s  %s  %s.%s USD  %s', created_at, price_key,
             amount_cents / 100, lpad((amount_cents % 100)::text, 2, '0'),
             coalesce(stripe_invoice_id, checkout_session_id)), E'\n' order by created_at)
           from public.purchases where user_id = p_user), '  none');
  v_out := v_out || E'\n\nVideos made:\n' || coalesce((select string_agg(format('  %s  %s  %s  %s credits',
             created_at, style, status, credits_charged), E'\n' order by created_at)
           from public.generations where user_id = p_user), '  none');
  return v_out;
end $$;

revoke all on function public.is_admin()                                from public, anon, authenticated, service_role;
revoke all on function public.raise_ops_alert(text,jsonb)               from public, anon, authenticated, service_role;
revoke all on function public.hit_rate_limit(text,int,int)              from public, anon, authenticated, service_role;
revoke all on function public.health_ping()                             from public, anon, authenticated, service_role;
revoke all on function public.record_client_error(text,text,text,text,uuid,text,text,text) from public, anon, authenticated, service_role;
revoke all on function public.outbox_claim(int)                         from public, anon, authenticated, service_role;
revoke all on function public.outbox_done(bigint,text)                  from public, anon, authenticated, service_role;
revoke all on function public.unfinished_signups(int)                   from public, anon, authenticated, service_role;
revoke all on function public._admin_check(text)                        from public, anon, authenticated, service_role;
revoke all on function public._audit(text,uuid,text,int,uuid,text,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.admin_adjust_credits(uuid,int,text,uuid)  from public, anon, authenticated, service_role;
revoke all on function public.admin_refund_generation(uuid,text,uuid)   from public, anon, authenticated, service_role;
revoke all on function public.admin_set_flags(uuid,boolean,boolean,timestamptz,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.admin_set_settings(jsonb,text,uuid)       from public, anon, authenticated, service_role;
revoke all on function public.admin_unpublish_share(text,text,uuid)     from public, anon, authenticated, service_role;
revoke all on function public.admin_view_generation(uuid,text)          from public, anon, authenticated, service_role;
revoke all on function public.admin_resolve_report(text,text,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.admin_create_invite(text,int,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.admin_grant_access(uuid,text)             from public, anon, authenticated, service_role;
revoke all on function public.admin_resolve_stripe_event(text,text,text,uuid) from public, anon, authenticated, service_role;
revoke all on function public.admin_beta_allow(uuid,text,uuid)          from public, anon, authenticated, service_role;
revoke all on function public.admin_change_email(uuid,text,uuid)        from public, anon, authenticated, service_role;
revoke all on function public.admin_delete_user(uuid,text,uuid)         from public, anon, authenticated, service_role;
revoke all on function public.admin_lookup_user(text)                   from public, anon, authenticated, service_role;
revoke all on function public.admin_dispute_evidence(uuid,text)         from public, anon, authenticated, service_role;
grant execute on function public.health_ping()                          to anon, authenticated, service_role;
grant execute on function public.raise_ops_alert(text,jsonb)            to service_role;
grant execute on function public.hit_rate_limit(text,int,int)           to service_role;
grant execute on function public.record_client_error(text,text,text,text,uuid,text,text,text) to service_role;
grant execute on function public.outbox_claim(int)                      to service_role;
grant execute on function public.outbox_done(bigint,text)               to service_role;
grant execute on function public.unfinished_signups(int)                to service_role;
grant execute on function public.admin_adjust_credits(uuid,int,text,uuid)  to authenticated;
grant execute on function public.admin_refund_generation(uuid,text,uuid)   to authenticated;
grant execute on function public.admin_set_flags(uuid,boolean,boolean,timestamptz,text,text,uuid) to authenticated;
grant execute on function public.admin_set_settings(jsonb,text,uuid)       to authenticated;
grant execute on function public.admin_unpublish_share(text,text,uuid)     to authenticated;
grant execute on function public.admin_view_generation(uuid,text)          to authenticated;
grant execute on function public.admin_resolve_report(text,text,text,text,uuid) to authenticated;
grant execute on function public.admin_create_invite(text,int,text,text,uuid) to authenticated;
grant execute on function public.admin_grant_access(uuid,text)             to authenticated;
grant execute on function public.admin_resolve_stripe_event(text,text,text,uuid) to authenticated;
grant execute on function public.admin_beta_allow(uuid,text,uuid)          to authenticated;
grant execute on function public.admin_change_email(uuid,text,uuid)        to authenticated;
grant execute on function public.admin_delete_user(uuid,text,uuid)         to authenticated;
grant execute on function public.admin_lookup_user(text)                   to authenticated;
grant execute on function public.admin_dispute_evidence(uuid,text)         to authenticated;
