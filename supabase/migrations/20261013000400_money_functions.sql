-- M1 / PLAN.md §6.5, §6.6, §6.8: reserve, then finish or fail; the sweep; drift; per-video delete.
-- Security change: adds SECURITY DEFINER functions (every public one below except search_my_videos), each owned
-- by postgres with search_path = ''. Internal helpers (prefixed _) are SECURITY INVOKER with no EXECUTE grant: only
-- the DEFINER functions (running as postgres) call them.
--
-- Lock order (§6.1 rule 3): the user's credit_balances row first, always. Every money movement goes through
-- _ledger(), which writes the ledger row and moves the cached balance by the same deltas in one place.
-- §10.1: every function validates its inputs before writing and re-raises constraint errors without the row.

create function public._ledger(p_user uuid, p_kind text, p_sub int, p_topup int, p_held int,
  p_generation_id uuid default null, p_stripe_ref text default null, p_admin_audit_id bigint default null,
  p_uncollected int default 0) returns bigint
language plpgsql set search_path = '' as $$
declare v_id bigint;
begin
  insert into public.credit_ledger (user_id, kind, sub_delta, topup_delta, held_delta, generation_id, stripe_ref,
                                    admin_audit_id, uncollected)
  values (p_user, p_kind, p_sub, p_topup, p_held, p_generation_id, p_stripe_ref, p_admin_audit_id, p_uncollected)
  returning id into v_id;
  update public.credit_balances
     set sub = sub + p_sub, topup = topup + p_topup, held = held + p_held, updated_at = now()
   where user_id = p_user;
  if not found then raise exception 'no balance row' using errcode = 'P0002'; end if;
  return v_id;
end $$;

-- Ends the current plan bucket: expire_sub of what is left (attributed to its purchase, §8.6), sub_cycle + 1.
-- Caller holds the balance lock.
create function public._expire_bucket(p_user uuid) returns void
language plpgsql set search_path = '' as $$
declare b public.credit_balances;
begin
  select * into b from public.credit_balances where user_id = p_user;
  if b.sub > 0 then
    update public.purchases set credits_expired = credits_expired + least(b.sub, credits - credits_expired)
     where id = b.sub_purchase_id;
    perform public._ledger(p_user, 'expire_sub', -b.sub, 0, 0);
  end if;
  update public.credit_balances set sub_cycle = sub_cycle + 1, updated_at = now() where user_id = p_user;
end $$;

-- generation_internal from the route's metrics, plus id-free miss counts (§6.4).
-- p_m keys: attempts, repaired, misses[], timings{}, error_detail, refusal_category, response_model.
create function public._write_internal(p_gen uuid, p_m jsonb) returns void
language plpgsql set search_path = '' as $$
declare v_misses text[];
begin
  if p_m is null then return; end if;
  if jsonb_typeof(p_m) <> 'object' then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct left(x, 40)), '{}') into v_misses
    from jsonb_array_elements_text(case when jsonb_typeof(p_m -> 'misses') = 'array' then p_m -> 'misses'
                                        else '[]'::jsonb end) x
   where x <> '';
  v_misses := v_misses[1:40];
  insert into public.generation_internal as gi (generation_id, attempts, repaired, misses, timings, error_detail,
                                               refusal_category, response_model)
  values (p_gen, (p_m ->> 'attempts')::smallint, coalesce((p_m ->> 'repaired')::boolean, false), v_misses,
          case when jsonb_typeof(p_m -> 'timings') = 'object' then p_m -> 'timings' end,
          left(p_m ->> 'error_detail', 4000), left(p_m ->> 'refusal_category', 100), left(p_m ->> 'response_model', 100))
  on conflict (generation_id) do update set attempts = excluded.attempts, repaired = excluded.repaired,
    misses = excluded.misses, timings = excluded.timings, error_detail = excluded.error_detail,
    refusal_category = excluded.refusal_category, response_model = excluded.response_model;
  insert into public.miss_counts as m (name, day, n)
  select x, (now() at time zone 'utc')::date, 1 from unnest(v_misses) x
  on conflict (name, day) do update set n = m.n + 1;
  if p_m ->> 'response_model' is not null and p_m ->> 'response_model' <> 'claude-opus-5-5' then
    perform public.raise_ops_alert('model_mismatch', jsonb_build_object('model', left(p_m ->> 'response_model', 100)));
  end if;
end $$;

-- Voice clip paths must be <user_id>/<generation_id>/<i>.mp3 (§6.6, C35).
create function public._clips_ok(p_user uuid, p_gen uuid, p_clips jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select p_clips is null or (jsonb_typeof(p_clips) = 'array' and not exists (
    select 1 from jsonb_array_elements(p_clips) c
     where jsonb_typeof(c) <> 'object' or coalesce(c ->> 'path', '') !~ ('^' || p_user || '/' || p_gen || '/[0-9]{1,3}\.mp3$')))
$$;

-- The fail_generation path. Caller holds the balance lock and the generation's row lock; the row is open.
create function public._fail_locked(p_id uuid, p_code text, p_metrics jsonb) returns void
language plpgsql set search_path = '' as $$
declare
  g public.generations; b public.credit_balances;
  v_midnight timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_steps smallint := nullif(p_metrics ->> 'steps_sent', '')::smallint;
begin
  select * into g from public.generations where id = p_id;
  select * into b from public.credit_balances where user_id = g.user_id;
  perform public._ledger(g.user_id, 'release', g.reserved_sub, g.reserved_topup, -g.credits_reserved, g.id);
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

-- §6.6.
create function public.reserve_generation(p_user_id uuid, p_client_request_id uuid, p_style text, p_question text,
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

  -- 6. Rate limits, counted from generations. Our own failures and the crisis declines never count.
  select count(*) into v_n from public.generations where user_id = p_user_id
     and created_at > now() - interval '1 hour' and (error_code is null or error_code <> all (c_never_counted));
  if v_n >= 20 then
    outcome := 'rate_limited';
    retry_at := (select created_at + interval '1 hour' from public.generations where user_id = p_user_id
                   and created_at > now() - interval '1 hour' and (error_code is null or error_code <> all (c_never_counted))
                 order by created_at desc offset 19 limit 1);
    return next; return;
  end if;
  select count(*) into v_n from public.generations where user_id = p_user_id
     and created_at >= v_midnight and (error_code is null or error_code <> all (c_never_counted));
  select count(*), count(*) filter (where steps_sent_before_fail > 0) into v_fail, v_fail_steps
    from public.generations where user_id = p_user_id and created_at >= v_midnight
     and status = 'failed' and error_code = any (c_user_codes);
  select coalesce(sum(c.cost_usd), 0) into v_spent
    from public.generation_calls c join public.generations x on x.id = c.generation_id
   where x.user_id = p_user_id and x.created_at >= v_midnight and x.status = 'failed' and x.error_code = any (c_user_codes);
  if v_n >= 60 or v_fail >= 10 or v_fail_steps >= 3 or v_spent >= s.user_uncharged_cap_usd then
    outcome := 'rate_limited'; retry_at := v_midnight + interval '1 day'; return next; return;
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

create function public.start_generation(p_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  select user_id into v_user from public.generations where id = p_id;
  if not found then return false; end if;
  perform 1 from public.credit_balances where user_id = v_user for update;
  update public.generations set status = 'running', started_at = now()
   where id = p_id and status = 'reserved' and lease_expires_at > now();
  return found;
end $$;

create function public.set_generation_stage(p_id uuid, p_stage text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  if coalesce(p_stage, '') not in ('reading','drawings','writing','fixing') then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select user_id into v_user from public.generations where id = p_id;
  if not found then return false; end if;
  perform 1 from public.credit_balances where user_id = v_user for update;
  update public.generations set stage = p_stage where id = p_id and status = 'running';
  return found;
end $$;

-- §6.6. Called only after the full check passed. Idempotent through already_final.
-- p_metrics: as _write_internal, plus voice ('browser'|'elevenlabs'|'mixed') and clips [{path, durS, words}].
create function public.finish_generation(p_id uuid, p_script jsonb, p_metrics jsonb)
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

  -- The charge, from the stored script: ceil(chars/15) seconds, ceil(seconds/10) credits = ceil(chars/150).
  v_chars := public.narration_chars(g.style, p_script);
  v_secs  := (v_chars + 14) / 15;
  v_c     := (v_secs + 9) / 10;
  if v_c < 1 or v_c > g.credits_reserved then
    perform public._fail_locked(p_id, case when v_c < 1 then 'empty' else 'too_long' end, p_metrics);
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
    perform public._ledger(v_user, 'settle', v_rel_sub, v_rel_top, -g.credits_reserved, p_id);
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

-- §6.6. p_metrics: as _write_internal, plus steps_sent.
create function public.fail_generation(p_id uuid, p_error_code text, p_metrics jsonb)
returns table(outcome text, available int)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare g public.generations; b public.credit_balances; v_user uuid; v_c text;
begin
  if p_error_code is null or p_error_code not in ('refusal','decline_unsafe','decline_self_harm',
       'decline_abuse_disclosure','decline_personal_medical','decline_not_a_question','check_failed','tool_loop',
       'output_budget','provider_error','provider_config','timeout','stale','too_long','empty')
     or (p_metrics is not null and jsonb_typeof(p_metrics) <> 'object') then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select user_id into v_user from public.generations where id = p_id;
  if not found then outcome := 'not_found'; return next; return; end if;
  select * into b from public.credit_balances where user_id = v_user for update;
  select * into g from public.generations where id = p_id for update;
  if g.status in ('reserved','running') then
    begin
      perform public._fail_locked(p_id, p_error_code, p_metrics);
    exception when check_violation or not_null_violation or unique_violation then
      get stacked diagnostics v_c = constraint_name;
      raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
    end;
    outcome := 'released';
  else
    outcome := 'already_final';
  end if;
  select * into b from public.credit_balances where user_id = v_user;
  available := case when b.sub_expires_at > now() then b.sub else 0 end + b.topup;
  return next;
end $$;

-- §6.6. 'expired' | 'not_stale' | 'final' | 'not_found'.
create function public.expire_if_stale(p_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare g public.generations; v_user uuid;
begin
  select user_id into v_user from public.generations where id = p_id;
  if not found then return 'not_found'; end if;
  perform 1 from public.credit_balances where user_id = v_user for update;
  select * into g from public.generations where id = p_id for update;
  if g.status not in ('reserved','running') then return 'final'; end if;
  if g.lease_expires_at < now() or (g.status = 'reserved' and g.created_at < now() - interval '60 seconds') then
    perform public._fail_locked(p_id, 'stale', null);
    return 'expired';
  end if;
  return 'not_stale';
end $$;

-- §6.6. 'ok' | 'not_succeeded' | 'bad_path' | 'not_found'.
create function public.set_generation_voice(p_id uuid, p_voice text, p_clips jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare g public.generations; v_user uuid;
begin
  if coalesce(p_voice, '') not in ('browser','elevenlabs','mixed') then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select user_id into v_user from public.generations where id = p_id;
  if not found then return 'not_found'; end if;
  perform 1 from public.credit_balances where user_id = v_user for update;
  select * into g from public.generations where id = p_id for update;
  if g.status <> 'succeeded' then return 'not_succeeded'; end if;
  if not public._clips_ok(g.user_id, p_id, p_clips) then return 'bad_path'; end if;
  update public.generations set voice = p_voice, voice_clips = p_clips where id = p_id;
  return 'ok';
end $$;

-- §6.8 cleanup: the Storage prefix of these generations was removed.
create function public.mark_voice_purged(p_ids uuid[]) returns int
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform 1 from public.credit_balances
   where user_id in (select user_id from public.generations where id = any (p_ids)) order by user_id for update;
  update public.generations set voice_purged_at = now()
   where id = any (p_ids) and voice_purged_at is null and (status = 'failed' or content_deleted_at is not null);
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- One generation_calls row per model, ping or TTS call (C15, C16). Returns the spend alerts it raised (§11.2).
create function public.record_model_call(p_generation_id uuid, p_style text, p_kind text, p_round smallint,
  p_prompt_sha text, p_started_at timestamptz, p_ttft_ms int, p_ms int, p_stop_reason text, p_input_tokens int,
  p_cache_read_tokens int, p_cache_write_1h_tokens int, p_output_tokens int, p_thinking_tokens int, p_tts_chars int,
  p_cost_usd numeric, p_anthropic_request_id text, p_raw_text text) returns text[]
language plpgsql security definer set search_path = '' as $$
declare
  v_midnight timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_spent numeric; v_cap numeric; v_alerts text[] := '{}'; v_c text; t record;
begin
  if coalesce(p_style, '') not in ('whiteboard','paper','matchcut') or coalesce(p_kind, '') not in ('round','repair','ping','tts')
     or p_started_at is null or p_cost_usd is null or p_cost_usd < 0 or p_cost_usd >= 10000 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  begin
    insert into public.generation_calls (generation_id, style, kind, round, prompt_sha, started_at, ttft_ms, ms,
      stop_reason, input_tokens, cache_read_tokens, cache_write_1h_tokens, output_tokens, thinking_tokens, tts_chars,
      cost_usd, anthropic_request_id, raw_text)
    values (p_generation_id, p_style, p_kind, p_round, left(p_prompt_sha, 100), p_started_at, p_ttft_ms, p_ms,
      left(p_stop_reason, 40), p_input_tokens, p_cache_read_tokens, p_cache_write_1h_tokens, p_output_tokens,
      p_thinking_tokens, p_tts_chars, p_cost_usd, left(p_anthropic_request_id, 200), p_raw_text);
    if p_prompt_sha is not null and p_kind <> 'tts' then
      insert into public.prompt_cache_state as pc (style, prompt_sha, last_touch_at, last_real_at)
      values (p_style, left(p_prompt_sha, 100), p_started_at, case when p_kind in ('round','repair') then p_started_at end)
      on conflict (style, prompt_sha) do update set
        last_touch_at = greatest(pc.last_touch_at, excluded.last_touch_at),
        last_real_at  = greatest(pc.last_real_at, excluded.last_real_at);
    end if;
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  select coalesce(sum(cost_usd), 0) into v_spent from public.generation_calls where started_at >= v_midnight;
  select daily_spend_cap_usd into v_cap from public.ops_settings where id;
  for t in select * from (values ('spend_50', 0.5), ('spend_80', 0.8), ('spend_100', 1.0)) x(kind, share) loop
    if v_spent >= v_cap * t.share
       and public.raise_ops_alert(t.kind, jsonb_build_object('spent', v_spent, 'cap', v_cap)) then
      v_alerts := v_alerts || t.kind;
    end if;
  end loop;
  return v_alerts;
end $$;

-- §7.11 client timings: the owner only, ≤4 KB, numbers (and short enum strings such as a stall cause) only.
create function public.record_client_telemetry(p_user_id uuid, p_id uuid, p_timings jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_timings is null or jsonb_typeof(p_timings) <> 'object' or octet_length(p_timings::text) > 4096
     or jsonb_path_exists(p_timings, 'strict $.** ? (@.type() == "string" && !(@ like_regex "^[a-z0-9_]{1,16}$"))')
     or jsonb_path_exists(p_timings, 'strict $.** ? (@.type() == "boolean" || @.type() == "null")') then
    return false;
  end if;
  perform 1 from public.generations where id = p_id and user_id = p_user_id;
  if not found then return false; end if;
  insert into public.generation_internal as gi (generation_id, client_timings) values (p_id, p_timings)
  on conflict (generation_id) do update set client_timings = excluded.client_timings;
  return true;
end $$;

-- §6.8, every minute (pg_cron). Returns how many generations it released.
create function public.sweep() returns int
language plpgsql security definer set search_path = '' as $$
declare v_released int := 0; v_ids uuid[]; v_id uuid; v_user uuid;
begin
  select coalesce(array_agg(id), '{}') into v_ids from (
    select id from public.generations
     where status in ('reserved','running')
       and (lease_expires_at < now() or (status = 'reserved' and created_at < now() - interval '60 seconds'))
     order by lease_expires_at limit 500) s;
  -- Every balance row it may touch, locked in user_id order first (§6.1 rule 3).
  perform 1 from public.credit_balances
   where user_id in (select user_id from public.generations where id = any (v_ids)
                     union select user_id from public.credit_balances where sub > 0 and sub_expires_at <= now())
   order by user_id for update;
  foreach v_id in array v_ids loop      -- re-checked under the locks: a racing finish cleanly wins or loses
    perform 1 from public.generations where id = v_id and status in ('reserved','running')
       and (lease_expires_at < now() or (status = 'reserved' and created_at < now() - interval '60 seconds'))
       for update;
    if found then
      perform public._fail_locked(v_id, 'stale', null);
      v_released := v_released + 1;
    end if;
  end loop;
  for v_user in select user_id from public.credit_balances where sub > 0 and sub_expires_at <= now() limit 500 loop
    perform public._expire_bucket(v_user);
  end loop;
  insert into public.ops_state (key, at) values ('last_sweep', now()) on conflict (key) do update set at = excluded.at;
  if v_released > 0 then
    perform public.raise_ops_alert('stale_released', jsonb_build_object('count', v_released));
  end if;
  return v_released;
end $$;

-- §6.5: the four invariants, in one statement (one snapshot). Empty = no drift.
create function public.credit_drift() returns table(user_id uuid, problem text, detail jsonb)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  return query
  with led as (
    select l.user_id, sum(l.sub_delta)::int s, sum(l.topup_delta)::int t, sum(l.held_delta)::int h
      from public.credit_ledger l group by l.user_id),
  gled as (
    select l.generation_id, sum(l.sub_delta + l.topup_delta + l.held_delta)::int n
      from public.credit_ledger l where l.kind in ('reserve','settle','release') group by l.generation_id),
  open_held as (
    select g.user_id, sum(g.credits_reserved)::int r from public.generations g
     where g.status in ('reserved','running') group by g.user_id)
  select coalesce(b.user_id, led.user_id), 'I1 balance <> ledger sums',
         jsonb_build_object('balance', jsonb_build_array(b.sub, b.topup, b.held),
                            'ledger', jsonb_build_array(led.s, led.t, led.h))
    from public.credit_balances b full join led on led.user_id = b.user_id
   where (b.sub, b.topup, b.held) is distinct from (coalesce(led.s, 0), coalesce(led.t, 0), coalesce(led.h, 0))
  union all
  select g.user_id, 'I2 generation ledger <> -credits_charged',
         jsonb_build_object('generation_id', g.id, 'ledger', coalesce(gled.n, 0), 'charged', g.credits_charged)
    from public.generations g left join gled on gled.generation_id = g.id
   where coalesce(gled.n, 0) <> -g.credits_charged
  union all
  select b.user_id, 'I3 held <> open reservations',
         jsonb_build_object('held', b.held, 'open', coalesce(o.r, 0))
    from public.credit_balances b left join open_held o on o.user_id = b.user_id
   where b.held <> coalesce(o.r, 0)
  union all
  select p.user_id, 'I4 purchase without exactly one grant',
         jsonb_build_object('purchase_id', p.id, 'grants', (select count(*) from public.credit_ledger l
            where l.kind in ('grant_sub','grant_sub_late','grant_topup')
              and l.stripe_ref = coalesce(p.checkout_session_id, p.stripe_invoice_id)))
    from public.purchases p
   where (select count(*) from public.credit_ledger l where l.kind in ('grant_sub','grant_sub_late','grant_topup')
            and l.stripe_ref = coalesce(p.checkout_session_id, p.stripe_invoice_id)) <> 1;
end $$;

create function public.check_credit_drift() returns int
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  select count(*) into v_n from public.credit_drift();
  if v_n > 0 then perform public.raise_ops_alert('credit_drift', jsonb_build_object('rows', v_n)); end if;
  return v_n;
end $$;

-- §5.9 library search (authenticated). SECURITY INVOKER: RLS limits it to the caller's own live rows.
create function public.search_my_videos(p_q text)
returns table(id uuid, created_at timestamptz, style text, question text, status text, billable_seconds int,
              credits_charged int)
language sql stable security invoker set search_path = '' as $$
  select g.id, g.created_at, g.style, g.question, g.status, g.billable_seconds, g.credits_charged
    from public.generations g
   where char_length(p_q) between 1 and 200 and g.content_deleted_at is null
     and g.question_norm like '%' || replace(replace(replace(lower(regexp_replace(btrim(p_q), '\s+', ' ', 'g')),
                                 '\', '\\'), '%', '\%'), '_', '\_') || '%'
   order by g.created_at desc limit 50
$$;

-- §6.10, C7: one video (service_role only; the route passes the verified user and then deletes the clips).
create function public.delete_my_video(p_user_id uuid, p_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.credit_balances where user_id = p_user_id for update;
  perform 1 from public.generations where id = p_id and user_id = p_user_id
     and status in ('succeeded','failed','refunded') for update;
  if not found then return false; end if;
  update public.generations set question = null, script = null, voice_clips = null,
         content_deleted_at = coalesce(content_deleted_at, now()) where id = p_id;
  update public.generation_calls set raw_text = null where generation_id = p_id;
  update public.generation_internal set error_detail = null, misses = '{}' where generation_id = p_id;
  delete from public.video_feedback where generation_id = p_id;
  delete from public.shares where generation_id = p_id;
  return true;
end $$;

-- §6.8 daily (pg_cron 15 3 * * *): the drift check, the 30-day scrub of failed rows (C8), and retention (§10.2).
create function public.daily() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.check_credit_drift();
  perform 1 from public.credit_balances where user_id in (
    select user_id from public.generations where status = 'failed' and created_at < now() - interval '30 days'
       and question is not null) order by user_id for update;
  update public.generations set question = null
   where status = 'failed' and created_at < now() - interval '30 days' and question is not null;
  update public.generation_calls set raw_text = null
   where raw_text is not null and generation_id in (select id from public.generations
           where status = 'failed' and created_at < now() - interval '30 days');
  update public.generation_internal set error_detail = null, misses = '{}'
   where (error_detail is not null or misses <> '{}') and generation_id in (select id from public.generations
           where status = 'failed' and created_at < now() - interval '30 days');
  delete from public.rate_limits where window_start < now() - interval '2 days';
  delete from public.client_errors where hour < now() - interval '30 days';
  delete from public.email_outbox where sent_at < now() - interval '30 days';
  delete from public.support_messages where resolved_at < now() - interval '2 years';
  delete from public.reports where resolved_at < now() - interval '2 years';
end $$;

-- Grants (§6.9). Internal helpers, sweep, daily, check_credit_drift: none (cron runs as postgres).
revoke all on function public._ledger(uuid,text,int,int,int,uuid,text,bigint,int) from public, anon, authenticated, service_role;
revoke all on function public._expire_bucket(uuid)                    from public, anon, authenticated, service_role;
revoke all on function public._write_internal(uuid,jsonb)             from public, anon, authenticated, service_role;
revoke all on function public._clips_ok(uuid,uuid,jsonb)              from public, anon, authenticated, service_role;
revoke all on function public._fail_locked(uuid,text,jsonb)           from public, anon, authenticated, service_role;
revoke all on function public.reserve_generation(uuid,uuid,text,text,text,text,smallint) from public, anon, authenticated, service_role;
revoke all on function public.start_generation(uuid)                  from public, anon, authenticated, service_role;
revoke all on function public.set_generation_stage(uuid,text)         from public, anon, authenticated, service_role;
revoke all on function public.finish_generation(uuid,jsonb,jsonb)     from public, anon, authenticated, service_role;
revoke all on function public.fail_generation(uuid,text,jsonb)        from public, anon, authenticated, service_role;
revoke all on function public.expire_if_stale(uuid)                   from public, anon, authenticated, service_role;
revoke all on function public.set_generation_voice(uuid,text,jsonb)   from public, anon, authenticated, service_role;
revoke all on function public.mark_voice_purged(uuid[])               from public, anon, authenticated, service_role;
revoke all on function public.record_model_call(uuid,text,text,smallint,text,timestamptz,int,int,text,int,int,int,int,int,int,numeric,text,text) from public, anon, authenticated, service_role;
revoke all on function public.record_client_telemetry(uuid,uuid,jsonb) from public, anon, authenticated, service_role;
revoke all on function public.sweep()                                 from public, anon, authenticated, service_role;
revoke all on function public.credit_drift()                          from public, anon, authenticated, service_role;
revoke all on function public.check_credit_drift()                    from public, anon, authenticated, service_role;
revoke all on function public.search_my_videos(text)                  from public, anon, authenticated, service_role;
revoke all on function public.delete_my_video(uuid,uuid)              from public, anon, authenticated, service_role;
revoke all on function public.daily()                                 from public, anon, authenticated, service_role;
grant execute on function public.reserve_generation(uuid,uuid,text,text,text,text,smallint) to service_role;
grant execute on function public.start_generation(uuid)                  to service_role;
grant execute on function public.set_generation_stage(uuid,text)         to service_role;
grant execute on function public.finish_generation(uuid,jsonb,jsonb)     to service_role;
grant execute on function public.fail_generation(uuid,text,jsonb)        to service_role;
grant execute on function public.expire_if_stale(uuid)                   to service_role;
grant execute on function public.set_generation_voice(uuid,text,jsonb)   to service_role;
grant execute on function public.mark_voice_purged(uuid[])               to service_role;
grant execute on function public.record_model_call(uuid,text,text,smallint,text,timestamptz,int,int,text,int,int,int,int,int,int,numeric,text,text) to service_role;
grant execute on function public.record_client_telemetry(uuid,uuid,jsonb) to service_role;
grant execute on function public.credit_drift()                          to service_role;
grant execute on function public.delete_my_video(uuid,uuid)              to service_role;
grant execute on function public.search_my_videos(text)                  to authenticated;
