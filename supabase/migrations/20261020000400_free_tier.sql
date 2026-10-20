-- Free 10 a month, then a plan (founder, 20 Oct 2026; STRATEGY.md). Counted in videos, not seconds:
--  * 1 credit = 1 video. Every user gets free_videos_monthly (10) free videos each UTC month; after that a video takes
--    1 from a plan (40 or 100 a month, a pair of plans per level). Packs are no longer sold; invites give no credits.
--  * Admins never need videos and skip the per-user limits (still: kill switch, capacity, spend cap, one at a time).
--  * generations.paid_with says what paid: 'credit' (held 1, or 1-6 on old rows), 'free' or 'admin' (held 0).
--  * Balances left from the old credits (invite grants) become videos at 4 credits = 1 video, rounded up
--    (CREDITS_PER_VIDEO, the old typical video): a ledger 'convert' row each, so credit_drift stays at zero.
--  * user_monthly_cap stops being the free allowance and becomes the fair-use ceiling for everyone (200).
-- Security change: redefines SECURITY DEFINER reserve_generation, finish_generation, redeem_invite,
-- admin_set_settings, admin_refund_generation and the helper _fail_locked; grants unchanged by create or replace.

alter table public.ops_settings add column free_videos_monthly int not null default 10 check (free_videos_monthly >= 0);
update public.ops_settings set user_monthly_cap = greatest(user_monthly_cap, 200) where id;

alter table public.generations add column paid_with text not null default 'credit'
  check (paid_with in ('credit','free','admin'));
alter table public.generations drop constraint generations_credits_reserved_check,
  add constraint generations_credits_reserved_check check (credits_reserved between 0 and 6),
  add constraint generations_paid_hold check ((paid_with = 'credit') = (credits_reserved > 0));
alter table public.generations drop constraint generations_check3,      -- the charge no longer follows the length
  add constraint generations_check3 check (case status
    when 'succeeded' then (credits_charged >= 1 or credits_reserved = 0) and (script is not null or content_deleted_at is not null)
    when 'refunded'  then credits_charged >= 1
    else credits_charged = 0 and script is null end);

alter table public.credit_ledger drop constraint credit_ledger_kind_check;
alter table public.credit_ledger add constraint credit_ledger_kind_check
  check (kind in ('grant_sub','grant_sub_late','expire_sub','grant_topup','reserve','settle','release','admin_refund',
                  'admin_adjust','clawback','dispute_restore','forfeit','invite_grant','convert'));
alter table public.credit_ledger drop constraint credit_ledger_check1;      -- conservation, per kind (+ invite_grant)
alter table public.credit_ledger add constraint credit_ledger_check1 check (case kind   -- conservation, per kind
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
    when 'forfeit'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0
    when 'invite_grant'    then topup_delta > 0 and sub_delta = 0 and held_delta = 0
    when 'convert'         then sub_delta <= 0 and topup_delta <= 0 and held_delta = 0 end);   -- credits -> videos, once

-- Old credits become videos (4 = 1, rounded up). Nobody had a plan or a pack; anyone mid-video keeps credits as they are.
do $$
declare b record;
begin
  for b in select * from public.credit_balances where held = 0 and (sub > 0 or topup > 0) for update loop
    if (b.sub + 3) / 4 - b.sub <> 0 or (b.topup + 3) / 4 - b.topup <> 0 then
      perform public._ledger(b.user_id, 'convert', (b.sub + 3) / 4 - b.sub, (b.topup + 3) / 4 - b.topup, 0);
    end if;
  end loop;
end $$;

-- Plans in videos, one pair per level (founder, 20 Oct 2026): 40 or 100 videos a month at High school $9.99 / $19.99,
-- College and Grad school $13.99 / $25.99 (each keeps >= $3 a month after Stripe, a 10% referral commission and the
-- model cost of its videos plus the 10 free). A plan's videos are taught at its level (generate.ts caps a chat's level
-- to it); the free videos try every level. Packs off sale (existing rows stay for the purchase history).
alter table public.price_catalog add column level text not null default 'school' check (level in ('school','undergrad','grad'));
update public.price_catalog set credits = 40 where price_key = 'plus';
update public.price_catalog set credits = 100 where price_key = 'pro';
update public.price_catalog set active = false where kind = 'topup';
insert into public.price_catalog (price_key, kind, credits, unit_amount_cents, active, level) values
  ('plus_college', 'subscription', 40, 1399, true, 'undergrad'), ('pro_college', 'subscription', 100, 2599, true, 'undergrad'),
  ('plus_grad', 'subscription', 40, 1399, true, 'grad'), ('pro_grad', 'subscription', 100, 2599, true, 'grad');
alter table public.credit_balances drop constraint credit_balances_sub_plan_check,
  add constraint credit_balances_sub_plan_check
  check (sub_plan in ('plus','pro','plus_college','pro_college','plus_grad','pro_grad'));

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

  -- 9. What pays (founder, 20 Oct 2026): the month's free videos first (free_videos_monthly; our failures and the
  --    user's failed asks never use one), then 1 video from a plan. None left: 'insufficient', retry_at = when the
  --    free videos come back.
  if v_admin then c_hold := 0; v_paid := 'admin';
  else
    select count(*) into v_free_used from public.generations where user_id = p_user_id and created_at >= v_month
       and paid_with = 'free' and status <> 'failed';
    if v_free_used < s.free_videos_monthly then c_hold := 0; v_paid := 'free';
    elsif available < 1 then
      outcome := 'insufficient'; retry_at := v_month + interval '1 month'; return next; return;
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

create or replace function public.finish_generation(p_id uuid, p_script jsonb, p_metrics jsonb)
returns table(outcome text, credits_charged int, available int)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  g public.generations; b public.credit_balances; v_user uuid;
  v_chars int; v_secs int; v_c int; v_cs int; v_ct int; v_rel_sub int; v_rel_top int; v_voice text; v_cc text;
begin
  select user_id into v_user from public.generations where id = p_id;
  if not found then outcome := 'not_found'; return next; return; end if;
  select * into b from public.credit_balances where user_id = v_user for update;
  select * into g from public.generations where id = p_id for update;
  if g.status in ('succeeded','refunded') then
    outcome := 'already_final'; credits_charged := g.credits_charged;
    available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup; return next; return;
  end if;
  if g.status = 'failed' then          -- the sweep got there first: nothing is charged
    outcome := 'too_late'; credits_charged := 0;
    available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup; return next; return;
  end if;
  if p_script is null or jsonb_typeof(p_script) <> 'object' or octet_length(p_script::text) > 262144
     or (p_metrics is not null and jsonb_typeof(p_metrics) <> 'object') then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;

  -- The charge (founder, 20 Oct 2026): 1 video = its hold (1 from a plan, 0 free or admin), whatever its length.
  -- Length still bounds it: over 60 s (900 characters) is too_long, as before.
  v_chars := public.narration_chars(g.style, p_script);
  v_secs  := (v_chars + 14) / 15;
  v_c     := g.credits_reserved;
  if v_chars < 1 or (v_secs + 9) / 10 > 6 then
    perform public._fail_locked(p_id, case when v_chars < 1 then 'empty' else 'too_long' end, p_metrics);
    select * into b from public.credit_balances where user_id = v_user;
    outcome := 'rejected'; credits_charged := 0;
    available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup; return next; return;
  end if;
  v_voice := coalesce(p_metrics ->> 'voice', 'browser');
  if v_voice not in ('browser','elevenlabs','mixed') or not public._clips_ok(v_user, p_id, p_metrics -> 'clips') then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;

  -- Plan credits are charged first; the rest of the hold goes back to the buckets it came from.
  v_cs := least(v_c, g.reserved_sub);
  v_ct := v_c - v_cs;
  v_rel_sub := g.reserved_sub - v_cs;
  v_rel_top := g.reserved_topup - v_ct;
  begin
    if g.credits_reserved > 0 then perform public._ledger(v_user, 'settle', v_rel_sub, v_rel_top, -g.credits_reserved, p_id); end if;
    if v_rel_sub > 0 and g.reserved_sub_cycle <> b.sub_cycle then   -- old-cycle credits never leak into a new cycle
      perform public._ledger(v_user, 'expire_sub', -v_rel_sub, 0, 0);
    end if;
    update public.generations set status = 'succeeded', script = p_script, narration_chars = v_chars,
           billable_seconds = v_secs, credits_charged = v_c, finished_at = now(), voice = v_voice,
           voice_clips = p_metrics -> 'clips'
     where id = p_id;
    perform public._write_internal(p_id, p_metrics);
  exception when check_violation or not_null_violation or unique_violation then
    get stacked diagnostics v_cc = constraint_name;
    raise exception 'rejected:%', v_cc using errcode = sqlstate, detail = '';
  end;
  select * into b from public.credit_balances where user_id = v_user;
  outcome := 'settled'; credits_charged := v_c;
  available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup;
  return next;
end $$;

create or replace function public._fail_locked(p_id uuid, p_code text, p_metrics jsonb) returns void
language plpgsql set search_path = '' as $$
declare
  g public.generations; b public.credit_balances;
  v_midnight timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_steps smallint := nullif(p_metrics ->> 'steps_sent', '')::smallint;
begin
  select * into g from public.generations where id = p_id;
  select * into b from public.credit_balances where user_id = g.user_id;
  if g.credits_reserved > 0 then        -- a free or admin video held nothing
    perform public._ledger(g.user_id, 'release', g.reserved_sub, g.reserved_topup, -g.credits_reserved, g.id);
  end if;
  if g.reserved_sub > 0 and g.reserved_sub_cycle <> b.sub_cycle then   -- the reservation crossed a renewal
    perform public._ledger(g.user_id, 'expire_sub', -g.reserved_sub, 0, 0);
  end if;
  update public.generations set status = 'failed', error_code = p_code, steps_sent_before_fail = v_steps,
         finished_at = now() where id = p_id;
  perform public._write_internal(p_id, p_metrics);
  if p_code = 'decline_unsafe' and (select count(*) from public.generations where user_id = g.user_id
       and created_at >= v_midnight and error_code = 'decline_unsafe') >= 5 then
    insert into public.account_flags as f (user_id, generation_blocked_until, reason)
    values (g.user_id, now() + interval '24 hours', 'refusals')
    on conflict (user_id) do update set generation_blocked_until = now() + interval '24 hours',
      reason = case when f.generation_blocked or f.purchases_blocked then f.reason else 'refusals' end,
      updated_at = now();
    perform public.raise_ops_alert('refusal_block:' || g.user_id, '{}');
  end if;
  if p_code = 'provider_config' then
    insert into public.ops_state (key, at) values ('provider_blocked_until', now() + interval '10 minutes')
    on conflict (key) do update set at = excluded.at;
    perform public.raise_ops_alert('provider_config', '{}');
  end if;
  if v_steps > 0 and p_code in ('refusal','decline_unsafe','decline_personal_medical','decline_not_a_question',
       'check_failed','tool_loop','output_budget','too_long','empty')
     and (select count(*) from public.generations where user_id = g.user_id and created_at >= v_midnight
            and steps_sent_before_fail > 0 and error_code in ('refusal','decline_unsafe','decline_personal_medical',
            'decline_not_a_question','check_failed','tool_loop','output_budget','too_long','empty')) >= 3 then
    perform public.raise_ops_alert('failed_after_steps', '{}');
  end if;
end $$;

CREATE OR REPLACE FUNCTION public.redeem_invite(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$;

create or replace function public.admin_set_settings(p_changes jsonb, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_old public.ops_settings; v_new public.ops_settings; v_c text;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'
     or exists (select 1 from jsonb_object_keys(p_changes) k where k not in ('generation_enabled','purchases_enabled',
       'signup_mode','daily_spend_cap_usd','max_open_generations','user_uncharged_cap_usd','smoke_user_id','notice',
       'user_daily_cap','user_monthly_cap','free_videos_monthly','slow_1_after','slow_1_seconds','slow_2_after','slow_2_seconds')) then
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

create or replace function public.admin_refund_generation(p_generation uuid, p_reason text, p_request_id uuid) returns int
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
  if g.status <> 'succeeded' or g.credits_charged = 0 then raise exception 'not refundable' using errcode = 'P0001'; end if;   -- a free video cost nothing
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
