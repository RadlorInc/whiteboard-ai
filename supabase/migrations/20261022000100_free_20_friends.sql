-- First 20 videos free, once; refer a friend for 10 more (founder, 22 Oct 2026; replaces "10 free every UTC month").
--  * ops_settings.free_videos = 20, counted once from ops_settings.free_from (= when this
--    migration ran): everyone, old users too, starts with a fresh 20. Failed videos never use one, as before.
--  * Each user has a friend link (/?friend=<profiles.friend_code>). A new account made through it is stored in
--    friend_referrals; once that friend has made a video, the inviter gets 10 more free videos, for at most 2 friends
--    (so 20 + 2 x 10 = 40 free at most). No self-invite, one inviter per account (founder: no other limit).
--  * Market-rep links (/?ref=, lib/radlorOps.ts) are separate and unchanged.
-- Security change: new table friend_referrals (RLS on, service_role SELECT only), new SECURITY DEFINER functions
-- free_videos and add_friend_referral (service_role), and redefines reserve_generation and admin_set_settings.
-- Ships BEFORE the code (expand/contract): the app still live reads free_videos_monthly and calls the same
-- reserve_generation / admin_set_settings, so the old column stays (set to 20 so old screens say 20) and both
-- settings keys are accepted. 20261022000200_drop_free_videos_monthly.sql drops it once the new code is live.

alter table public.ops_settings add column free_videos int not null default 20 check (free_videos >= 0),
  add column free_from timestamptz not null default now();
update public.ops_settings set free_videos_monthly = 20 where id;   -- only what the old screens show, until the drop

alter table public.profiles add column friend_code text not null unique
  default left(replace(gen_random_uuid()::text, '-', ''), 12);    -- volatile default: a different code per row

create table public.friend_referrals (
  friend uuid primary key references public.profiles(id) on delete cascade,   -- one inviter per account
  referrer uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (friend <> referrer));
create index on public.friend_referrals (referrer);
alter table public.friend_referrals enable row level security;
revoke all on public.friend_referrals from public, anon, authenticated, service_role;
grant select on public.friend_referrals to service_role;

-- A user's free videos: total (20 + 10 per friend who made a video, up to 2), used since free_from, friends counted.
create function public.free_videos(p_user uuid) returns table(total int, used int, friends int)
language sql stable security definer set search_path = '' as $$
  with f as (select least(2, count(*))::int as n from public.friend_referrals r where r.referrer = p_user
               and exists (select 1 from public.generations g where g.user_id = r.friend and g.status in ('succeeded','refunded')))
  select s.free_videos + 10 * f.n,
         (select count(*)::int from public.generations g where g.user_id = p_user and g.paid_with = 'free'
             and g.status <> 'failed' and g.created_at >= s.free_from),
         f.n
    from public.ops_settings s, f where s.id $$;
revoke all on function public.free_videos(uuid) from public, anon, authenticated;
grant execute on function public.free_videos(uuid) to service_role;

-- Sign-up through a friend link (lib/signup.ts). Never the inviter's own account; one inviter per account.
create function public.add_friend_referral(p_friend uuid, p_code text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_friend is null or p_code is null or p_code !~ '^[0-9a-f]{12}$' then return false; end if;
  insert into public.friend_referrals (friend, referrer)
  select p_friend, p.id from public.profiles p
   where p.friend_code = p_code and p.id <> p_friend and p.deleted_at is null
  on conflict (friend) do nothing;
  return found;
end $$;
revoke all on function public.add_friend_referral(uuid, text) from public, anon, authenticated;
grant execute on function public.add_friend_referral(uuid, text) to service_role;

create or replace function public.reserve_generation(p_user_id uuid, p_client_request_id uuid, p_style text, p_question text,
  p_build_id text, p_prompt_sha text, p_policy_version smallint)
returns table(outcome text, generation_id uuid, status text, available int, retry_at timestamptz)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  c_hold int;                    -- 1 video from the plan; 0 for a free or an admin video
  v_paid text;                   -- generations.paid_with: 'credit' | 'free' | 'admin'
  v_admin boolean; v_free_used int;
  c_user_codes constant text[] := array['refusal','decline_unsafe','decline_personal_medical','decline_not_a_question',
    'check_failed','tool_loop','output_budget','too_long','empty'];
  c_never_counted constant text[] := array['provider_error','provider_config','timeout','stale',
    'decline_self_harm','decline_abuse_disclosure'];
  v_midnight timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_month timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
  v_last timestamptz; v_wait int;
  b public.credit_balances; p public.profiles; s record; g public.generations;   -- s: ops_settings (000700)
  v_n int; v_fail int; v_fail_steps int; v_spent numeric; v_open int; v_a int; v_id uuid; v_c text;
begin
  if p_user_id is null or p_client_request_id is null or coalesce(p_style, '') not in ('whiteboard','paper','matchcut')
     or coalesce(char_length(p_question), 0) not between 1 and 500
     or p_policy_version is null or p_policy_version < 1 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;

  -- 1. Lock, then (before any other check) a retry of an accepted ask is answered with its row.
  select * into b from public.credit_balances where user_id = p_user_id for update;
  if not found then outcome := 'no_account'; return next; return; end if;
  select * into g from public.generations where user_id = p_user_id and client_request_id = p_client_request_id;
  if found then
    outcome := 'duplicate'; generation_id := g.id; status := g.status;
    available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup;
    return next; return;
  end if;
  available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup;

  -- 2. Profile gates.
  select * into p from public.profiles where id = p_user_id;
  select * into s from public.ops_settings where id;
  if p.deleted_at is not null then outcome := 'deleted'; return next; return; end if;
  if p.age_band is null then outcome := 'age_unconfirmed'; return next; return; end if;
  if p.terms_version is distinct from public.current_terms_version() then
    outcome := 'terms_required'; return next; return;
  end if;
  if s.signup_mode = 'invite' and p.access_granted_at is null then
    outcome := 'access_required'; return next; return;
  end if;

  -- 3. Kill switch, provider block (§7.5).
  if not s.generation_enabled
     or exists (select 1 from public.ops_state where key = 'provider_blocked_until' and at > now()) then
    outcome := 'paused'; return next; return;
  end if;

  -- 4. Account flags.
  if exists (select 1 from public.account_flags where user_id = p_user_id
               and (generation_blocked or generation_blocked_until > now())) then
    outcome := 'blocked'; return next; return;
  end if;

  -- 5. One open generation (C17). A dead one is failed 'stale' inline (the balance lock is held).
  select * into g from public.generations where user_id = p_user_id and status in ('reserved','running') for update;
  if found then
    if g.lease_expires_at < now() or (g.status = 'reserved' and g.created_at < now() - interval '60 seconds') then
      perform public._fail_locked(g.id, 'stale', null);
      select * into b from public.credit_balances where user_id = p_user_id;
      available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup;
    else
      outcome := 'busy'; generation_id := g.id; status := g.status; return next; return;
    end if;
  end if;

  -- Admins (founder, 20 Oct 2026) skip the per-user limits and never need videos from a plan.
  v_admin := exists (select 1 from public.admins where user_id = p_user_id);

  if not v_admin then
  -- 6. Per-user limits (caps in ops_settings), counted from generations. Our own failures and the crisis declines never count.
  select count(*) into v_n from public.generations where user_id = p_user_id
     and created_at >= v_midnight and (error_code is null or error_code <> all (c_never_counted));
  select count(*), count(*) filter (where steps_sent_before_fail > 0) into v_fail, v_fail_steps
    from public.generations where user_id = p_user_id and created_at >= v_midnight
     and status = 'failed' and error_code = any (c_user_codes);
  select coalesce(sum(c.cost_usd), 0) into v_spent
    from public.generation_calls c join public.generations x on x.id = c.generation_id
   where x.user_id = p_user_id and x.created_at >= v_midnight and x.status = 'failed' and x.error_code = any (c_user_codes);
  if v_n >= s.user_daily_cap or v_fail >= 10 or v_fail_steps >= 3 or v_spent >= s.user_uncharged_cap_usd then
    outcome := 'rate_limited'; retry_at := v_midnight + interval '1 day'; return next; return;
  end if;
  -- 6b. The month's cap (20 Oct 2026: free "unlimited" plan, 50 a month).
  if (select count(*) from public.generations where user_id = p_user_id and created_at >= v_month
        and (error_code is null or error_code <> all (c_never_counted))) >= s.user_monthly_cap then
    outcome := 'rate_limited'; retry_at := v_month + interval '1 month'; return next; return;
  end if;
  -- 6c. Slow-down, never over 60 s: past slow_1_after videos today the next starts slow_1_seconds after the last one
  --     ended, past slow_2_after slow_2_seconds. The app waits it out behind the making screen (no error shown).
  v_wait := case when v_n >= s.slow_2_after then s.slow_2_seconds when v_n >= s.slow_1_after then s.slow_1_seconds else 0 end;
  if v_wait > 0 then
    select max(coalesce(finished_at, created_at)) into v_last from public.generations where user_id = p_user_id
       and created_at >= v_midnight and (error_code is null or error_code <> all (c_never_counted));
    if v_last + make_interval(secs => v_wait) > now() then
      outcome := 'slow_down'; retry_at := v_last + make_interval(secs => v_wait); return next; return;
    end if;
  end if;

  end if;

  -- 7. Capacity (soft; no global lock).
  select count(*) into v_open from public.generations where status in ('reserved','running');
  if v_open >= s.max_open_generations then
    perform public.raise_ops_alert('at_capacity', jsonb_build_object('open', v_open));
    outcome := 'at_capacity'; return next; return;
  end if;

  -- 8. Daily spend cap: spent + $0.20 per open generation + $0.20 for this one.
  select coalesce(sum(cost_usd), 0) into v_spent from public.generation_calls where started_at >= v_midnight;
  if v_spent + 0.20 * v_open + 0.20 > s.daily_spend_cap_usd then
    perform public.raise_ops_alert('spend_100', jsonb_build_object('spent', v_spent));
    outcome := 'spend_cap'; return next; return;
  end if;

  -- 9. What pays (founder, 22 Oct 2026): the free videos first (free_videos: 20 once, plus 10 for each of up to 2
  --    friends who made a video; our failures and the user's failed asks never use one), then 1 video from a plan.
  --    None left: 'insufficient', no retry_at (free videos no longer come back).
  if v_admin then c_hold := 0; v_paid := 'admin';
  else
    select f.total - f.used into v_free_used from public.free_videos(p_user_id) f;   -- here: free videos left
    if v_free_used > 0 then c_hold := 0; v_paid := 'free';
    elsif available < 1 then
      outcome := 'insufficient'; return next; return;
    else c_hold := 1; v_paid := 'credit';
    end if;
  end if;

  -- 10. Reserve: the plan bucket first, because it expires.
  v_a := least(case when b.sub_expires_at > now() then b.sub else 0 end, c_hold);
  begin
    insert into public.generations (user_id, client_request_id, style, question, prompt_sha, build_id, policy_version,
                                    credits_reserved, reserved_sub, reserved_topup, reserved_sub_cycle, lease_expires_at, paid_with)
    values (p_user_id, p_client_request_id, p_style, p_question, left(p_prompt_sha, 100), left(p_build_id, 100),
            p_policy_version, c_hold, v_a, c_hold - v_a, b.sub_cycle, now() + interval '330 seconds', v_paid)
    returning id into v_id;
    if c_hold > 0 then perform public._ledger(p_user_id, 'reserve', -v_a, -(c_hold - v_a), c_hold, v_id); end if;
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  outcome := 'reserved'; generation_id := v_id; status := 'reserved'; available := available - c_hold;
  return next;
end $$;

create or replace function public.admin_set_settings(p_changes jsonb, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_old public.ops_settings; v_new public.ops_settings; v_c text;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'
     or exists (select 1 from jsonb_object_keys(p_changes) k where k not in ('generation_enabled','purchases_enabled',
       'signup_mode','daily_spend_cap_usd','max_open_generations','user_uncharged_cap_usd','smoke_user_id','notice',
       'user_daily_cap','user_monthly_cap','free_videos','free_videos_monthly','slow_1_after','slow_1_seconds','slow_2_after','slow_2_seconds')) then
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
      notice = v_new.notice, user_daily_cap = v_new.user_daily_cap, user_monthly_cap = v_new.user_monthly_cap,
      free_videos = v_new.free_videos,
      free_videos_monthly = v_new.free_videos_monthly,
      slow_1_after = v_new.slow_1_after, slow_1_seconds = v_new.slow_1_seconds,
      slow_2_after = v_new.slow_2_after, slow_2_seconds = v_new.slow_2_seconds, updated_at = now(), updated_by = auth.uid()
     where id;
  exception when check_violation or not_null_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  perform public._audit('set_settings', null, 'ops_settings', null, p_request_id, p_reason,
    jsonb_build_object('before', to_jsonb(v_old) - 'updated_at' - 'updated_by', 'after', p_changes));
  return true;
end $$;
