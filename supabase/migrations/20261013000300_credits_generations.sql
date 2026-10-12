-- M1 / PLAN.md §6.4, §6.5, §6.9: balances, generations, metering, the append-only ledger.
-- Security change: adds SECURITY DEFINER functions is_live_user() and handle_new_user() (a trigger on auth.users),
-- owned by postgres with search_path = ''.

create table public.credit_balances (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  sub     int not null default 0 check (sub   >= 0),   -- current plan period's credits
  topup   int not null default 0 check (topup >= 0),   -- packs, late grants, refunds: never expire
  held    int not null default 0 check (held  >= 0),   -- reserved by the open generation
  sub_expires_at timestamptz,                          -- period end + 3 days (RENEWAL_GRACE, C6)
  sub_plan text check (sub_plan in ('plus','pro')),
  sub_subscription_id text,
  sub_purchase_id uuid,
  sub_cycle bigint not null default 0,                 -- +1 on every new-period grant (case d) and every bucket expiry
  updated_at timestamptz not null default now());

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  client_request_id uuid not null,                       -- one per Ask press, reused on a network retry
  created_at timestamptz not null default now(),
  style text not null check (style in ('whiteboard','paper','matchcut')),
  question text check (char_length(question) between 1 and 500),        -- null after a scrub
  question_norm text generated always as (lower(regexp_replace(btrim(question), '\s+', ' ', 'g'))) stored,
  status text not null default 'reserved'
    check (status in ('reserved','running','succeeded','failed','refunded')),
  stage text check (stage in ('reading','drawings','writing','fixing')),
  model text not null default 'claude-opus-5-5' check (model = 'claude-opus-5-5'),  -- the request constant
  prompt_sha text, build_id text,                         -- prompt version; deploy git sha (library + player)
  policy_version smallint not null,                       -- checkPolicy version the script was made under (§7.4)
  script jsonb check (octet_length(script::text) <= 262144),
  narration_chars int not null default 0 check (narration_chars >= 0),
  billable_seconds int not null default 0 check (billable_seconds = (narration_chars + 14) / 15),
  credits_reserved int not null check (credits_reserved between 1 and 6),
  reserved_sub int not null check (reserved_sub >= 0),
  reserved_topup int not null check (reserved_topup >= 0),
  reserved_sub_cycle bigint not null,                     -- credit_balances.sub_cycle at reserve time
  credits_charged int not null default 0 check (credits_charged between 0 and credits_reserved),
  lease_expires_at timestamptz not null,
  started_at timestamptz, finished_at timestamptz,
  error_code text check (error_code in ('refusal','decline_unsafe','decline_self_harm','decline_abuse_disclosure',
    'decline_personal_medical','decline_not_a_question','check_failed','tool_loop','output_budget','provider_error',
    'provider_config','timeout','stale','too_long','empty')),
  steps_sent_before_fail smallint,
  voice text not null default 'browser' check (voice in ('browser','elevenlabs','mixed')),
  voice_clips jsonb,                                      -- [{path, durS, words:[[w,t0,t1],…]}] per step
  content_deleted_at timestamptz,
  voice_purged_at timestamptz,                            -- its Storage prefix was removed (§6.8 cleanup)
  unique (user_id, client_request_id),
  check (reserved_sub + reserved_topup = credits_reserved),
  check (case status
    when 'succeeded' then credits_charged = (billable_seconds + 9) / 10 and credits_charged >= 1
                          and (script is not null or content_deleted_at is not null)
    when 'refunded'  then credits_charged = (billable_seconds + 9) / 10 and credits_charged >= 1
    else credits_charged = 0 and script is null end));
create unique index generations_one_open on public.generations (user_id) where status in ('reserved','running');
create index generations_user_recent on public.generations (user_id, created_at desc);
create index generations_open_lease  on public.generations (lease_expires_at) where status in ('reserved','running');
create index generations_owned       on public.generations (user_id, style, question_norm) where status = 'succeeded';

create table public.generation_calls (             -- internal; RLS on, no policies (C16)
  id bigint generated always as identity primary key,
  generation_id uuid references public.generations(id),          -- null for keep-warm pings
  style text not null, kind text not null check (kind in ('round','repair','ping','tts')), round smallint,
  prompt_sha text, started_at timestamptz not null, ttft_ms int, ms int, stop_reason text,
  input_tokens int, cache_read_tokens int, cache_write_1h_tokens int, output_tokens int, thinking_tokens int,
  tts_chars int, cost_usd numeric(10,6) not null, anthropic_request_id text,
  raw_text text);                                  -- the call's own text output
create index generation_calls_day on public.generation_calls (started_at);
create index generation_calls_gen on public.generation_calls (generation_id);

create table public.generation_internal (           -- internal; RLS on, no policies
  generation_id uuid primary key references public.generations(id),
  attempts smallint check (attempts between 1 and 2), repaired boolean not null default false,
  misses text[] not null default '{}',             -- drawings asked for but missing; '{}' after any deletion
  timings jsonb,                                   -- server timings, ms
  client_timings jsonb,                            -- §7.11, numbers only
  error_detail text,                               -- check errors / provider message; never shown to users
  refusal_category text,                           -- API refusals: stop_details.category, may be null (§9.6)
  response_model text);                            -- the model id the API response named

create table public.prompt_cache_state (
  style text not null, prompt_sha text not null, last_touch_at timestamptz, last_real_at timestamptz,
  primary key (style, prompt_sha));

create table public.miss_counts (                  -- internal; no ids, so it outlives deletions
  name text not null, day date not null, n int not null check (n > 0), primary key (name, day));

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('grant_sub','grant_sub_late','expire_sub','grant_topup','reserve','settle',
                                     'release','admin_refund','admin_adjust','clawback','dispute_restore','forfeit')),
  sub_delta int not null default 0, topup_delta int not null default 0, held_delta int not null default 0,
  generation_id uuid references public.generations(id),
  stripe_ref text,                  -- invoice / checkout session / Stripe event id
  admin_audit_id bigint,
  uncollected int not null default 0 check (uncollected >= 0),   -- a clawback that found too few credits (C8)
  check (sub_delta <> 0 or topup_delta <> 0 or held_delta <> 0 or uncollected > 0),
  check (case kind   -- conservation, per kind
    when 'grant_sub'       then sub_delta > 0 and topup_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'grant_sub_late'  then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'expire_sub'      then sub_delta < 0 and topup_delta = 0 and held_delta = 0
    when 'grant_topup'     then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'reserve'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = -(sub_delta + topup_delta)
                                and held_delta > 0 and generation_id is not null
    when 'settle'          then held_delta < 0 and sub_delta >= 0 and topup_delta >= 0
                                and sub_delta + topup_delta < -held_delta and generation_id is not null
    when 'release'         then held_delta < 0 and sub_delta >= 0 and topup_delta >= 0
                                and sub_delta + topup_delta = -held_delta and generation_id is not null
    when 'admin_refund'    then topup_delta > 0 and sub_delta = 0 and held_delta = 0
                                and generation_id is not null and admin_audit_id is not null
    when 'admin_adjust'    then sub_delta = 0 and held_delta = 0 and admin_audit_id is not null
    when 'clawback'        then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0 and stripe_ref is not null
    when 'dispute_restore' then topup_delta > 0 and sub_delta = 0 and held_delta = 0 and stripe_ref is not null
    when 'forfeit'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0 end));
create unique index ledger_one_reserve on public.credit_ledger (generation_id) where kind = 'reserve';
create unique index ledger_one_close   on public.credit_ledger (generation_id) where kind in ('settle','release');
create unique index ledger_one_refund  on public.credit_ledger (generation_id) where kind = 'admin_refund';
create unique index ledger_stripe_once on public.credit_ledger (kind, stripe_ref)
  where kind in ('grant_sub','grant_sub_late','grant_topup','clawback','dispute_restore');
create index ledger_user on public.credit_ledger (user_id, id desc);

-- RLS on every table; SELECT only (§6.9). No role has INSERT, UPDATE, DELETE or TRUNCATE.
alter table public.credit_balances     enable row level security;
alter table public.generations         enable row level security;
alter table public.generation_calls    enable row level security;
alter table public.generation_internal enable row level security;
alter table public.prompt_cache_state  enable row level security;
alter table public.miss_counts         enable row level security;
alter table public.credit_ledger       enable row level security;
revoke all on public.credit_balances, public.generations, public.generation_calls, public.generation_internal,
  public.prompt_cache_state, public.miss_counts, public.credit_ledger from public, anon, authenticated, service_role;
grant select on public.credit_balances, public.generations, public.credit_ledger to authenticated;
grant select on public.credit_balances, public.generations, public.generation_calls, public.generation_internal,
  public.prompt_cache_state, public.miss_counts, public.credit_ledger to service_role;

-- §6.9: the live-user check every policy and every authenticated DEFINER function uses. A token issued before a
-- deletion stays valid for up to its expiry; a bare user_id = auth.uid() would still match the tombstone's rows.
create function public.is_live_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
$$;
revoke all on function public.is_live_user() from public, anon, authenticated, service_role;
grant execute on function public.is_live_user() to authenticated;

create policy profiles_own on public.profiles for select to authenticated
  using (id = (select auth.uid()) and (select public.is_live_user()));
create policy credit_balances_own on public.credit_balances for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));
create policy credit_ledger_own on public.credit_ledger for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));
create policy generations_own on public.generations for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));

-- §6.4: the charge is computed in SQL from the stored script.
create function public.narration_chars(p_style text, p_script jsonb) returns int
language sql immutable set search_path = '' as $$
  select coalesce(sum(char_length(e ->> 'say')), 0)::int
    from jsonb_array_elements(case
           when jsonb_typeof(p_script -> (case when p_style = 'matchcut' then 'objects' else 'steps' end)) = 'array'
           then p_script -> (case when p_style = 'matchcut' then 'objects' else 'steps' end)
           else '[]'::jsonb end) e
$$;
revoke all on function public.narration_chars(text, jsonb) from public, anon, authenticated, service_role;

-- §6.5: append-only, for every role including the owner and DEFINER functions. Also used by admin_audit (§11.3).
create function public.ledger_append_only() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = '42501';
end $$;
revoke all on function public.ledger_append_only() from public, anon, authenticated, service_role;
create trigger credit_ledger_append_only before update or delete on public.credit_ledger
  for each row execute function public.ledger_append_only();
create trigger credit_ledger_no_truncate before truncate on public.credit_ledger
  for each statement execute function public.ledger_append_only();

-- §6.4 generations_guard.
create function public.generations_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.user_id <> old.user_id or new.client_request_id <> old.client_request_id
     or new.created_at <> old.created_at then
    raise exception 'generations_guard: identity columns never change' using errcode = '42501';
  end if;
  if new.status <> old.status and not (
       (old.status = 'reserved' and new.status = 'running')
    or (old.status in ('reserved','running') and new.status in ('succeeded','failed'))
    or (old.status = 'succeeded' and new.status = 'refunded')) then
    raise exception 'generations_guard: % -> % is not allowed', old.status, new.status using errcode = '42501';
  end if;
  if old.status in ('succeeded','failed','refunded') and (
       new.credits_charged <> old.credits_charged or new.credits_reserved <> old.credits_reserved
    or new.reserved_sub <> old.reserved_sub or new.reserved_topup <> old.reserved_topup
    or new.reserved_sub_cycle <> old.reserved_sub_cycle) then
    raise exception 'generations_guard: charge columns of a finished row never change' using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.generations_guard() from public, anon, authenticated, service_role;
create trigger generations_guard before update on public.generations
  for each row execute function public.generations_guard();

-- §6.3 handle_new_user: the profile and balance rows, nothing else; raw_user_meta_data is ignored (client-controlled).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.credit_balances (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
