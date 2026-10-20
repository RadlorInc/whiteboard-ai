-- Free "unlimited" plan, fair use (founder, 20 Oct 2026; handoff.md). Per-user caps move into ops_settings so /admin can
-- change them without a deploy: 30 a day (was 60, hard-coded), 50 a month (new). The 20-an-hour cap goes; the
-- slow-down replaces it: past 10 videos today the next waits 30 s after the last ended, past 20 it waits 60 s. A wait
-- is never over 60 s (founder). reserve_generation answers 'slow_down' + retry_at; the app waits it out silently.

alter table public.ops_settings
  add column user_daily_cap int not null default 30 check (user_daily_cap > 0),
  add column user_monthly_cap int not null default 50 check (user_monthly_cap > 0),
  add column slow_1_after int not null default 10 check (slow_1_after >= 0),
  add column slow_1_seconds int not null default 30 check (slow_1_seconds between 0 and 60),
  add column slow_2_after int not null default 20 check (slow_2_after >= 0),
  add column slow_2_seconds int not null default 60 check (slow_2_seconds between 0 and 60),
  add constraint ops_settings_slow_order check (slow_2_after >= slow_1_after);

create or replace function public.reserve_generation(p_user_id uuid, p_client_request_id uuid, p_style text, p_question text,
  p_build_id text, p_prompt_sha text, p_policy_version smallint)
returns table(outcome text, generation_id uuid, status text, available int, retry_at timestamptz)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  c_hold constant int := 6;      -- HOLD_CREDITS (C4): 900 characters = 60 s = 6 credits
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

  -- 9. The full hold must be available (B3).
  if available < c_hold then outcome := 'insufficient'; return next; return; end if;

  -- 10. Reserve: the plan bucket first, because it expires.
  v_a := least(case when b.sub_expires_at > now() then b.sub else 0 end, c_hold);
  begin
    insert into public.generations (user_id, client_request_id, style, question, prompt_sha, build_id, policy_version,
                                    credits_reserved, reserved_sub, reserved_topup, reserved_sub_cycle, lease_expires_at)
    values (p_user_id, p_client_request_id, p_style, p_question, left(p_prompt_sha, 100), left(p_build_id, 100),
            p_policy_version, c_hold, v_a, c_hold - v_a, b.sub_cycle, now() + interval '330 seconds')
    returning id into v_id;
    perform public._ledger(p_user_id, 'reserve', -v_a, -(c_hold - v_a), c_hold, v_id);
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
       'user_daily_cap','user_monthly_cap','slow_1_after','slow_1_seconds','slow_2_after','slow_2_seconds')) then
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
