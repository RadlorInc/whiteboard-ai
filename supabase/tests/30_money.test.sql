-- PLAN.md §12.3 30_money: reserve, then finish or fail (§6.4–6.6), as service_role through the real functions.
-- Every expected number is typed by hand. now() is fixed for the whole transaction, so "in the last hour" and
-- "since UTC midnight" include every row made here.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(133);

create temp table users (k text primary key, id uuid);
create temp table gens (k text primary key, id uuid);
create function pg_temp.u(p_k text) returns uuid language sql as $$ select id from users where k = p_k $$;
create function pg_temp.g(p_k text) returns uuid language sql as $$ select id from gens where k = p_k $$;
-- Keep a reservation's id under a name; return 'outcome:available'.
create function pg_temp.keep(p_k text, p_r text) returns text language sql as $$
  insert into gens values (p_k, pg_temp.gid(p_r)) on conflict (k) do update set id = excluded.id;
  select split_part(p_r, ':', 1) || ':' || split_part(p_r, ':', 3) $$;
create function pg_temp.mk(p_k text, p_sub int, p_topup int) returns uuid language plpgsql as $$
declare v uuid := pg_temp.new_user(p_k);
begin insert into users values (p_k, v); perform pg_temp.give(v, p_sub, p_topup); return v; end $$;
create function pg_temp.admin_settings(p_changes jsonb) returns text language sql as $$
  select pg_temp.as_admin('aal2', format('select public.admin_set_settings(%L::jsonb, %L, gen_random_uuid())::text',
                                         p_changes, 'test settings')) $$;

select is((select count(*)::int from public.generations where status in ('reserved','running')), 0,
  'precondition: no open generation anywhere');
select is((select coalesce(sum(cost_usd), 0) from public.generation_calls
            where started_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'), 0::numeric,
  'precondition: no model spend recorded today');

-- ---- §6.4, row by row: spoken characters -> billable seconds -> credits (and the balance after, from 100).
create temp table charge (chars int, secs int, credits int, avail int);
insert into charge values (1,1,1,99), (150,10,1,98), (151,11,2,96), (450,30,3,93), (451,31,4,89), (512,35,4,85),
                          (600,40,4,81), (601,41,5,76), (900,60,6,70);
select pg_temp.mk('table', 0, 100) is not null as fixture \gset
create temp table charged (chars int, r text, secs int);
do $$ declare c record; v uuid; r text;
begin
  for c in select * from charge order by chars loop
    v := pg_temp.gid(pg_temp.reserve(pg_temp.u('table')));
    r := pg_temp.finish(v, c.chars);
    insert into charged values (c.chars, r, (select billable_seconds from public.generations where id = v));
  end loop;
end $$;
select is(d.r || ':' || d.secs, format('settled:%s:%s:%s', c.credits, c.avail, c.secs),
          format('%s characters -> %s s -> %s credits', c.chars, c.secs, c.credits))
  from charge c join charged d using (chars) order by c.chars;
select is(pg_temp.keep('t0', pg_temp.reserve(pg_temp.u('table'))), 'reserved:64', '0 characters: reserved first');
select is(pg_temp.finish(pg_temp.g('t0'), 0), 'rejected:0:70', '0 characters -> rejected, the whole hold back');
select is((select error_code from public.generations where id = pg_temp.g('t0')), 'empty', '... failed as empty');
select is(pg_temp.keep('t901', pg_temp.reserve(pg_temp.u('table'))), 'reserved:64', '901 characters: reserved first');
select is(pg_temp.finish(pg_temp.g('t901'), 901), 'rejected:0:70', '901 characters -> rejected, the whole hold back');
select is((select error_code || ':' || (select count(*) from public.credit_ledger l where l.generation_id = g.id and kind = 'release')
             from public.generations g where id = pg_temp.g('t901')), 'too_long:1', '... failed as too_long with one release row');
select is(public.narration_chars('whiteboard', '{"steps":[{"say":"ab"},{"say":"cde"},{"draw":"x"}]}'), 5,
  'narration_chars sums say over steps');
select is(public.narration_chars('matchcut', '{"objects":[{"say":"abcd"},{"say":"é"}],"steps":[{"say":"zzzz"}]}'), 5,
  'narration_chars: match-cut sums objects, counts code points, ignores steps');
select is(public.narration_chars('paper', '{"steps":{"say":"abc"}}'), 0, 'narration_chars: steps that are not an array -> 0');
select is(pg_temp.keep('mc', pg_temp.reserve(pg_temp.u('table'), gen_random_uuid(), 'matchcut')), 'reserved:64',
  'match-cut reserves the same 6');
select is(pg_temp.finish(pg_temp.g('mc'), 700, 'matchcut'), 'settled:5:65', 'match-cut, 700 characters -> 5 credits');
select is(pg_temp.drift(), '0', 'drift empty after the charge table');

-- ---- Refusals that reserve nothing.
select pg_temp.mk('ins', 0, 5) is not null as fixture \gset
select is(pg_temp.reserve(pg_temp.u('ins')), 'insufficient::5', '5 spendable -> insufficient');
select is((select count(*)::int from public.credit_ledger where user_id = pg_temp.u('ins')), 1,
  '... no ledger row beyond the fixture grant');
select is((select count(*)::int from public.generations where user_id = pg_temp.u('ins')), 0, '... no generation row');
select is(pg_temp.reserve(gen_random_uuid()), 'no_account::', 'an unknown user -> no_account');
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'ffffffff-0000-4000-8000-00000000a6e0', 'authenticated', 'authenticated',
        'noage@example.test', '{}', '{}', now(), now());
select is(pg_temp.reserve('ffffffff-0000-4000-8000-00000000a6e0'), 'age_unconfirmed::0', 'no age band -> age_unconfirmed');

select pg_temp.mk('busy', 0, 20) is not null as fixture \gset
select is(pg_temp.keep('busy1', pg_temp.reserve(pg_temp.u('busy'))), 'reserved:14', 'first ask reserved');
select is(pg_temp.reserve(pg_temp.u('busy')), 'busy:' || pg_temp.g('busy1') || ':14', 'a second open ask -> busy with the open id');
select is(pg_temp.reserve(pg_temp.u('busy'), (select client_request_id from public.generations where id = pg_temp.g('busy1'))),
  'duplicate:' || pg_temp.g('busy1') || ':14', 'the same client_request_id again -> duplicate, same id, no second charge');
select is((select count(*)::int || '/' || (select count(*) from public.credit_ledger where user_id = pg_temp.u('busy') and kind = 'reserve')
             from public.generations where user_id = pg_temp.u('busy')), '1/1', '... one generation and one reserve row');
select is(pg_temp.finish(pg_temp.g('busy1'), 450), 'settled:3:17', 'finish 450 characters -> 3 credits');
select is(pg_temp.finish(pg_temp.g('busy1'), 450), 'already_final:3:17', 'finish again -> already_final');
select is((select count(*)::int from public.credit_ledger where generation_id = pg_temp.g('busy1') and kind = 'settle'), 1,
  '... exactly one settle row');
select is(pg_temp.drift(), '0', 'drift empty after busy/duplicate/finish twice');

-- ---- The sweep, too_late, stale rows.
select pg_temp.mk('late', 0, 20) is not null as fixture \gset
select is(pg_temp.keep('late1', pg_temp.reserve(pg_temp.u('late'))), 'reserved:14', 'reserved');
update public.generations set lease_expires_at = now() - interval '1 second' where id = pg_temp.g('late1');
select is(public.sweep(), 1, 'sweep releases the one row whose lease passed');
select is((select status || ':' || error_code from public.generations where id = pg_temp.g('late1')), 'failed:stale', '... failed stale');
select is(pg_temp.finish(pg_temp.g('late1'), 450), 'too_late:0:20', 'finish after the sweep -> too_late, charged 0');
select is((select string_agg(kind, ',' order by id) from public.credit_ledger where generation_id = pg_temp.g('late1')),
  'reserve,release', '... the ledger has a reserve and a release, no settle');
select ok(exists (select 1 from public.ops_alerts where kind = 'stale_released')
          and (select at from public.ops_state where key = 'last_sweep') = now(), 'sweep alerted stale_released and stamped last_sweep');

select pg_temp.mk('stale', 0, 20) is not null as fixture \gset
select is(pg_temp.keep('st1', pg_temp.reserve(pg_temp.u('stale'))), 'reserved:14', 'reserved');
update public.generations set lease_expires_at = now() - interval '1 second' where id = pg_temp.g('st1');
select is(pg_temp.keep('st2', pg_temp.reserve(pg_temp.u('stale'))), 'reserved:14',
  'a row whose lease passed 1 s ago does not block the next ask');
select is((select status || ':' || error_code || ':' || (select count(*) from public.credit_ledger l where l.generation_id = g.id and kind = 'release')
             from public.generations g where id = pg_temp.g('st1')), 'failed:stale:1', '... the old row failed stale with one release');
alter table public.generations disable trigger generations_guard;    -- fixture only: age the row's created_at
update public.generations set created_at = now() - interval '61 seconds' where id = pg_temp.g('st2');
alter table public.generations enable trigger generations_guard;
select is(pg_temp.keep('st3', pg_temp.reserve(pg_temp.u('stale'))), 'reserved:14',
  'a row still reserved 61 s after created_at (server died before the model) does not block');
select is((select status || ':' || error_code from public.generations where id = pg_temp.g('st2')), 'failed:stale', '... it failed stale');
select is(pg_temp.svc(format('select public.expire_if_stale(%L)', pg_temp.g('st3'))), 'not_stale', 'expire_if_stale on a live row -> not_stale');
update public.generations set lease_expires_at = now() - interval '1 second' where id = pg_temp.g('st3');
select is(pg_temp.svc(format('select public.expire_if_stale(%L)', pg_temp.g('st3'))), 'expired', '... after its lease -> expired');
select is(pg_temp.svc(format('select public.expire_if_stale(%L)', pg_temp.g('st3'))), 'final', '... then final');
select is(pg_temp.bal(pg_temp.u('stale')), '0/20/0', 'all three holds came back');

select pg_temp.mk('run', 0, 20) is not null as fixture \gset
select is(pg_temp.keep('run1', pg_temp.reserve(pg_temp.u('run'))), 'reserved:14', 'reserved');
select is(pg_temp.svc(format('select public.start_generation(%L)::text', pg_temp.g('run1'))), 'true', 'start_generation: reserved -> running');
select is(pg_temp.svc(format('select public.set_generation_stage(%L, %L)::text', pg_temp.g('run1'), 'writing')), 'true', 'set_generation_stage while running');
select is(pg_temp.svc(format('select public.start_generation(%L)::text', pg_temp.g('run1'))), 'false', 'start_generation twice -> false');
select is(pg_temp.fail(pg_temp.g('run1'), 'timeout'), 'released:20', 'fail_generation -> released, all 6 back');
select is(pg_temp.fail(pg_temp.g('run1'), 'timeout'), 'already_final:20', 'fail again -> already_final');

select pg_temp.mk('exp', 150, 0) is not null as fixture \gset
update public.credit_balances set sub_expires_at = now() - interval '1 second' where user_id = pg_temp.u('exp');
select is(pg_temp.reserve(pg_temp.u('exp')), 'insufficient::0', 'plan credits past their expiry are not spendable before the sweep');
select is(public.sweep(), 0, 'the sweep releases nothing here ...');
select is((select sub || ':' || sub_cycle || ':' || (select string_agg(sub_delta::text, ',') from public.credit_ledger
             where user_id = pg_temp.u('exp') and kind = 'expire_sub') from public.credit_balances where user_id = pg_temp.u('exp')),
  '0:2:-150', '... but expires the bucket: expire_sub -150, sub_cycle + 1');
select is(pg_temp.drift(), '0', 'drift empty after the sweep cases');

-- ---- Gates: kill switch, provider block, invite, terms, flags.
select pg_temp.mk('gate', 0, 30) is not null as fixture \gset
select is(pg_temp.keep('gate1', pg_temp.reserve(pg_temp.u('gate'))), 'reserved:24', 'reserved before the switch flips');
select is(pg_temp.admin_settings('{"generation_enabled": false}'), 'true', 'admin turns generation off');
select is(pg_temp.reserve(pg_temp.u('gate'), (select client_request_id from public.generations where id = pg_temp.g('gate1'))),
  'duplicate:' || pg_temp.g('gate1') || ':24', 'a retry of the accepted ask -> duplicate, not paused');
select is(pg_temp.fail(pg_temp.g('gate1'), 'provider_error'), 'released:30', 'release it');
select is(pg_temp.reserve(pg_temp.u('gate')), 'paused::30', 'kill switch off -> paused');
select is((select count(*)::int from public.generations where user_id = pg_temp.u('gate')), 1, '... nothing reserved');
select is(pg_temp.admin_settings('{"generation_enabled": true}'), 'true', 'admin turns generation back on');
select is(pg_temp.keep('gate2', pg_temp.reserve(pg_temp.u('gate'))), 'reserved:24', 'reserved again');
select is(pg_temp.fail(pg_temp.g('gate2'), 'provider_config'), 'released:30', 'a provider_config failure releases');
select is(pg_temp.reserve(pg_temp.u('gate')), 'paused::30', '... and blocks the provider for 10 minutes -> paused');
delete from public.ops_state where key = 'provider_blocked_until';      -- fixture: the 10 minutes pass
update public.profiles set access_granted_at = null where id = pg_temp.u('gate');
select is(pg_temp.reserve(pg_temp.u('gate')), 'access_required::30', 'invite mode without access -> access_required');
select is(pg_temp.as_admin('aal2', format('select public.admin_grant_access(%L, %L)::text', pg_temp.u('gate'), 'let them in')), 'true',
  'admin grants access');
update public.profiles set terms_version = '2026-01-01-old' where id = pg_temp.u('gate');
select is(pg_temp.reserve(pg_temp.u('gate')), 'terms_required::30', 'terms out of date -> terms_required');
select is(pg_temp.as_user(pg_temp.u('gate'), $$select public.accept_terms(public.current_terms_version())$$), 'ok', 'accept_terms');
select is(pg_temp.as_admin('aal2', format('select public.admin_set_flags(%L, true, false, null, %L, %L, gen_random_uuid())::text',
  pg_temp.u('gate'), 'abuse', 'blocking for test')), 'true', 'admin blocks the account');
select is(pg_temp.reserve(pg_temp.u('gate')), 'blocked::30', 'account flag -> blocked');
select is((select count(*)::int from public.generations where user_id = pg_temp.u('gate')), 2, '... nothing reserved by any refusal');
select is(pg_temp.as_admin('aal2', format('select public.admin_set_flags(%L, false, false, null, null, %L, gen_random_uuid())::text',
  pg_temp.u('gate'), 'clearing for test')), 'true', 'admin clears the flags');
select is(pg_temp.keep('gate3', pg_temp.reserve(pg_temp.u('gate'))), 'reserved:24', 'every gate open again -> reserved');
select is(pg_temp.fail(pg_temp.g('gate3'), 'provider_error'), 'released:30', 'release it');

-- ---- Capacity: N = 2 open generations across users (set by hand) -> at_capacity, nothing reserved.
select is(pg_temp.admin_settings('{"max_open_generations": 2}'), 'true', 'capacity set to 2');
select pg_temp.mk('cap1', 0, 6) is not null as fixture \gset
select pg_temp.mk('cap2', 0, 6) is not null as fixture \gset
select pg_temp.mk('cap3', 0, 6) is not null as fixture \gset
select is(pg_temp.keep('cap1', pg_temp.reserve(pg_temp.u('cap1'))) || ' ' || pg_temp.keep('cap2', pg_temp.reserve(pg_temp.u('cap2'))),
  'reserved:0 reserved:0', 'two users hold the two slots');
select is(pg_temp.reserve(pg_temp.u('cap3')), 'at_capacity::6', 'a third user -> at_capacity');
select is(pg_temp.bal(pg_temp.u('cap3')) || ':' || exists (select 1 from public.ops_alerts where kind = 'at_capacity'),
  '0/6/0:true', '... nothing reserved, and at_capacity alerted');
select is(pg_temp.fail(pg_temp.g('cap1'), 'provider_error') || ' ' || pg_temp.fail(pg_temp.g('cap2'), 'provider_error'),
  'released:6 released:6', 'free the slots');
select is(pg_temp.admin_settings('{"max_open_generations": 4}'), 'true', 'capacity back to 4');

-- ---- Rate limits (D2, B19), counted from generations.
select pg_temp.mk('cost', 0, 30) is not null as fixture \gset
select pg_temp.mk('cost2', 0, 30) is not null as fixture \gset
select is(pg_temp.keep('c1', pg_temp.reserve(pg_temp.u('cost'))) || ' ' || pg_temp.keep('c2', pg_temp.reserve(pg_temp.u('cost2'))),
  'reserved:24 reserved:24', 'two users reserve');
select is(pg_temp.svc(format($f$select public.record_model_call(%L, 'whiteboard', 'round', 1::smallint, 'sha-test', now(), 900,
  20000, 'end_turn', 100, 0, 0, 2000, 500, null, 0.50, 'req_1', 'text')::text$f$, pg_temp.g('c1'))), '{}',
  'a $0.50 model call on c1');
select is(pg_temp.svc(format($f$select public.record_model_call(%L, 'whiteboard', 'round', 1::smallint, 'sha-test', now(), 900,
  20000, 'end_turn', 100, 0, 0, 2000, 500, null, 0.49, 'req_2', 'text')::text$f$, pg_temp.g('c2'))), '{}',
  'a $0.49 model call on c2');
select is(pg_temp.fail(pg_temp.g('c1'), 'check_failed') || ' ' || pg_temp.fail(pg_temp.g('c2'), 'check_failed'),
  'released:30 released:30', 'both fail with a user-caused code');
select is(pg_temp.reserve(pg_temp.u('cost')), 'rate_limited::30:' || ((date_trunc('day', now() at time zone 'utc') + interval '1 day') at time zone 'utc'),
  '$0.50 of uncharged spend today -> rate_limited until the next UTC midnight')
  from (select 1) x;
select is(pg_temp.outcome(pg_temp.keep('c3', pg_temp.reserve(pg_temp.u('cost2')))), 'reserved', '$0.49 -> still allowed');
select is(pg_temp.fail(pg_temp.g('c3'), 'provider_error'), 'released:30', 'release it');

select pg_temp.mk('steps', 0, 30) is not null as fixture \gset
do $$ declare i int;
begin
  for i in 1..2 loop
    perform pg_temp.fail(pg_temp.gid(pg_temp.reserve(pg_temp.u('steps'))), 'check_failed', '{"steps_sent": 2}');
  end loop;
end $$;
select is(pg_temp.keep('s3', pg_temp.reserve(pg_temp.u('steps'))), 'reserved:24', 'two failures after steps were shown: still allowed');
select is(pg_temp.fail(pg_temp.g('s3'), 'check_failed', '{"steps_sent": 1}'), 'released:30', 'a third one');
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.u('steps'))), 'rate_limited', 'the 4th ask after 3 failures with steps shown -> rate_limited');
select ok(exists (select 1 from public.ops_alerts where kind = 'failed_after_steps'), '... and failed_after_steps alerted on the 3rd');

select pg_temp.mk('tenfail', 0, 30) is not null as fixture \gset
do $$ declare i int;
begin
  for i in 1..12 loop perform pg_temp.fail(pg_temp.gid(pg_temp.reserve(pg_temp.u('tenfail'))), 'provider_error'); end loop;
  for i in 1..9 loop perform pg_temp.fail(pg_temp.gid(pg_temp.reserve(pg_temp.u('tenfail'))), 'tool_loop'); end loop;
end $$;
select is(pg_temp.keep('tf10', pg_temp.reserve(pg_temp.u('tenfail'))), 'reserved:24',
  '12 provider errors (ours) and 9 user-caused failures: still allowed');
select is(pg_temp.fail(pg_temp.g('tf10'), 'tool_loop'), 'released:30', 'the 10th user-caused failure');
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.u('tenfail'))), 'rate_limited', '10 uncharged failures today -> rate_limited');

select pg_temp.mk('hour', 0, 40) is not null as fixture \gset
do $$ declare i int;
begin
  for i in 1..20 loop perform pg_temp.finish(pg_temp.gid(pg_temp.reserve(pg_temp.u('hour'))), 150); end loop;
end $$;
select is(pg_temp.bal(pg_temp.u('hour')), '0/20/0', '20 asks in the hour, 1 credit each');
select is(pg_temp.reserve(pg_temp.u('hour')), 'rate_limited::20:' || (now() + interval '1 hour'),
  'the 21st ask in an hour -> rate_limited, retry when the oldest of the 20 is an hour old');

select pg_temp.mk('decl', 0, 30) is not null as fixture \gset
do $$ declare c text;
begin
  foreach c in array array['decline_unsafe','decline_unsafe','decline_unsafe','decline_unsafe','decline_self_harm','refusal'] loop
    perform pg_temp.fail(pg_temp.gid(pg_temp.reserve(pg_temp.u('decl'))), c);
  end loop;
end $$;
select is((select count(*)::int from public.account_flags where user_id = pg_temp.u('decl')), 0,
  '4 unsafe declines + a self-harm decline + an API refusal: no block (they do not count)');
select is(pg_temp.keep('d5', pg_temp.reserve(pg_temp.u('decl'))), 'reserved:24', '... asking still works');
select is(pg_temp.fail(pg_temp.g('d5'), 'decline_unsafe'), 'released:30', 'the 5th unsafe decline today');
select is((select generation_blocked_until from public.account_flags where user_id = pg_temp.u('decl')), now() + interval '24 hours',
  '... blocks asking for 24 h');
select ok(exists (select 1 from public.ops_alerts where kind = 'refusal_block:' || pg_temp.u('decl')), '... and alerts refusal_block:<id>');
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.u('decl'))), 'blocked', '... the next ask -> blocked');
select is(pg_temp.drift(), '0', 'drift empty after the rate-limit cases');

-- ---- Splits and renewals.
select pg_temp.mk('split4', 4, 100) is not null as fixture \gset
select is(pg_temp.finish(pg_temp.gid(pg_temp.reserve(pg_temp.u('split4'))), 451), 'settled:4:100', 'sub 4 + top-up 100, charge 4');
select is(pg_temp.bal(pg_temp.u('split4')), '0/100/0', '... sub 0, top-up 100 (plan credits first)');
select pg_temp.mk('split2', 2, 100) is not null as fixture \gset
select is(pg_temp.finish(pg_temp.gid(pg_temp.reserve(pg_temp.u('split2'))), 451), 'settled:4:98', 'sub 2 + top-up 100, charge 4');
select is(pg_temp.bal(pg_temp.u('split2')), '0/98/0', '... sub 0, top-up 98');

select pg_temp.mk('cross', 0, 0) is not null as fixture \gset
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_m_c1', 'invoice.paid', now(), false, %L, 'in_m_c1', 'sub_m_c',
  'subscription_create', 'plus', 999, 999, now() + interval '30 days')$f$, 'cus_t_cross')), 'applied', 'Plus starts: sub 150');
select is(pg_temp.keep('x1', pg_temp.reserve(pg_temp.u('cross'))), 'reserved:144', 'reserve 6 from the plan bucket');
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_m_c2', 'invoice.paid', now(), false, %L, 'in_m_c2', 'sub_m_c',
  'subscription_cycle', 'plus', 999, 999, now() + interval '60 days')$f$, 'cus_t_cross')), 'applied', 'renewal while the video is made');
select is(pg_temp.finish(pg_temp.g('x1'), 451), 'settled:4:150', 'finish charges 4 of the old cycle''s 6');
select is((select string_agg(sub_delta::text, ',' order by id) from public.credit_ledger where user_id = pg_temp.u('cross') and kind = 'expire_sub')
            || ' ' || pg_temp.bal(pg_temp.u('cross')), '-144,-2 150/0/0',
  'a reservation crossing a renewal: the 2 returned old-cycle credits expire; the new 150 are intact');

select pg_temp.mk('upg', 0, 0) is not null as fixture \gset
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_m_u1', 'invoice.paid', now(), false, %L, 'in_m_u1', 'sub_m_u',
  'subscription_create', 'plus', 999, 999, now() + interval '30 days')$f$, 'cus_t_upg')), 'applied', 'Plus starts');
select is(pg_temp.keep('u1', pg_temp.reserve(pg_temp.u('upg'))), 'reserved:144', 'reserve 6');
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_m_u2', 'invoice.paid', now(), false, %L, 'in_m_u2', 'sub_m_u',
  'subscription_update', 'pro', 1999, 1999, now() + interval '31 days')$f$, 'cus_t_upg')), 'applied', 'upgrade to Pro meanwhile');
select is(pg_temp.fail(pg_temp.g('u1'), 'provider_error') || ' ' || pg_temp.bal(pg_temp.u('upg')) || ' '
  || (select count(*) from public.credit_ledger where user_id = pg_temp.u('upg') and kind = 'expire_sub'),
  'released:480 480/0/0 0', 'reserve, upgrade, fail -> all 6 back in sub (144 + 330 + 6), no expire_sub');
select is(pg_temp.drift(), '0', 'drift empty after the split and renewal cases');

-- ---- The daily spend cap (§6.6 step 8, worked example), last: it leaves today's spend at $24.70.
select pg_temp.mk('sc1', 0, 30) is not null as fixture \gset
select pg_temp.mk('sc2', 0, 30) is not null as fixture \gset
select is(pg_temp.keep('sc1', pg_temp.reserve(pg_temp.u('sc1'))), 'reserved:24', 'one generation in flight');
select is(pg_temp.svc($f$select public.record_model_call(null, 'whiteboard', 'ping', null, 'sha-test', now(), null, null, null,
  null, null, null, null, null, null, 23.61, null, null)::text$f$), '{spend_50,spend_80}',
  'today: $0.99 (the rate-limit case) + $23.61 = $24.60 spent: spend_50 and spend_80 alert once');
select is(pg_temp.keep('sc2', pg_temp.reserve(pg_temp.u('sc2'))), 'reserved:24',
  '24.60 + 0.20 x 1 in flight + 0.20 = 25.00, exactly the $25 cap -> allowed');
select is(pg_temp.fail(pg_temp.g('sc2'), 'provider_error'), 'released:30', 'release it');
select is(pg_temp.svc($f$select public.record_model_call(null, 'whiteboard', 'ping', null, 'sha-test', now(), null, null, null,
  null, null, null, null, null, null, 0.10, null, null)::text$f$), '{}', '$0.10 more: $24.70, no new spend alert');
select is(pg_temp.reserve(pg_temp.u('sc2')), 'spend_cap::30', '24.70 + 0.20 + 0.20 = 25.10 > 25 -> spend_cap');
select is(pg_temp.bal(pg_temp.u('sc2')) || ':' || exists (select 1 from public.ops_alerts where kind = 'spend_100'),
  '0/30/0:true', '... nothing reserved, spend_100 alerted');
select is(pg_temp.fail(pg_temp.g('sc1'), 'provider_error'), 'released:30', 'release the one in flight');

select is(pg_temp.drift(), '0', 'credit_drift() is empty at the end');
select * from finish();
rollback;
