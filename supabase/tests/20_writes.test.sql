-- PLAN.md §12.3 20_writes: no role writes a table directly; every write goes through a named function as the role
-- that holds EXECUTE on it; the ledger is append-only for everyone, the owner included.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(624);

create temp table tbl (t text primary key);
insert into tbl values ('profiles'),('invites'),('price_catalog'),('credit_balances'),('generations'),
  ('generation_calls'),('generation_internal'),('credit_ledger'),('prompt_cache_state'),('miss_counts'),('purchases'),
  ('subscriptions'),('stripe_events'),('shares'),('video_feedback'),('reports'),('support_messages'),('admins'),
  ('admin_audit'),('account_flags'),('ops_settings'),('ops_alerts'),('ops_state'),('rate_limits'),('client_errors'),
  ('email_outbox'),('conversations'),('library_drawings');
create temp table who (r text, sub uuid);
insert into who values ('anon', null), ('authenticated', '00000000-0000-4000-8000-00000000000a'), ('service_role', null);

-- 28 tables x 3 roles x INSERT, UPDATE, DELETE, TRUNCATE = 336. The message names the privilege check, so a planted
-- grant that RLS then blocks (a different error with the same SQLSTATE) still fails here.
select is(pg_temp.q(w.r, w.sub, 'aal1', format(op.sql, t.t, (select attname from pg_attribute
            where attrelid = ('public.' || t.t)::regclass and attnum > 0 and not attisdropped
              and attidentity = '' and attgenerated = '' order by attnum limit 1))),
          format('ERROR 42501: permission denied for table %s', t.t), format('%s cannot %s %s', w.r, op.name, t.t))
  from tbl t cross join who w
  cross join (values ('INSERT', 'insert into public.%I default values'),
                     ('UPDATE', 'update public.%I set %I = %2$I'),
                     ('DELETE', 'delete from public.%I'),
                     ('TRUNCATE', 'truncate public.%I')) op(name, sql)
 order by t.t, w.r, op.name;

-- EXECUTE (§6.9): the functions each role must NOT be able to call, then the twin: each role CAN call what it is
-- granted (any outcome but a permission error on the function itself). Calls pass NULLs; trigger functions excluded.
create temp table fn (f text primary key, roles text[]);
insert into fn values
  ('get_shared_video','{anon,authenticated,service_role}'), ('health_ping','{anon,authenticated,service_role}'),
  ('explore_list','{anon,authenticated,service_role}'), ('set_explore','{authenticated}'),
  ('create_conversation','{authenticated}'), ('attach_to_conversation','{service_role}'),
  ('explore_feed','{anon,authenticated,service_role}'), ('explore_series','{anon,authenticated,service_role}'),
  ('explore_related','{anon,authenticated,service_role}'), ('explore_on_finish','{service_role}'),
  ('save_item','{authenticated}'), ('my_saved','{authenticated}'),
  ('save_drawing_candidates','{service_role}'), ('approved_drawings','{service_role}'),
  ('admin_list_drawings','{authenticated}'), ('admin_review_drawing','{authenticated}'),
  ('accept_terms','{authenticated}'), ('redeem_invite','{authenticated}'), ('is_live_user','{authenticated}'),
  ('search_my_videos','{authenticated}'), ('create_share','{authenticated}'), ('revoke_share','{authenticated}'),
  ('submit_feedback','{authenticated}'), ('admin_adjust_credits','{authenticated}'),
  ('admin_refund_generation','{authenticated}'), ('admin_set_flags','{authenticated}'),
  ('admin_set_settings','{authenticated}'), ('admin_unpublish_share','{authenticated}'),
  ('admin_view_generation','{authenticated}'), ('admin_resolve_report','{authenticated}'),
  ('admin_create_invite','{authenticated}'), ('admin_grant_access','{authenticated}'),
  ('admin_resolve_stripe_event','{authenticated}'), ('admin_beta_allow','{authenticated}'),
  ('admin_change_email','{authenticated}'), ('admin_delete_user','{authenticated}'), ('admin_lookup_user','{authenticated}'),
  ('admin_dispute_evidence','{authenticated}'), ('admin_metrics','{authenticated}'), ('admin_top_misses','{authenticated}'),
  ('current_terms_version','{authenticated,service_role}'),
  ('complete_signup','{service_role}'), ('link_stripe_customer','{service_role}'), ('invite_available','{service_role}'),
  ('reserve_generation','{service_role}'), ('start_generation','{service_role}'), ('set_generation_stage','{service_role}'),
  ('finish_generation','{service_role}'), ('fail_generation','{service_role}'), ('expire_if_stale','{service_role}'),
  ('set_generation_voice','{service_role}'), ('mark_voice_purged','{service_role}'), ('delete_my_video','{service_role}'),
  ('record_model_call','{service_role}'), ('record_client_telemetry','{service_role}'),
  ('stripe_record_event','{service_role}'), ('stripe_topup_paid','{service_role}'), ('stripe_invoice_paid','{service_role}'),
  ('stripe_subscription_sync','{service_role}'), ('stripe_payment_failed','{service_role}'),
  ('stripe_reverse','{service_role}'), ('stripe_efw','{service_role}'), ('hit_rate_limit','{service_role}'),
  ('submit_report','{service_role}'), ('submit_support_message','{service_role}'), ('record_client_error','{service_role}'),
  ('raise_ops_alert','{service_role}'), ('outbox_claim','{service_role}'), ('outbox_done','{service_role}'),
  ('unfinished_signups','{service_role}'), ('delete_account_data','{service_role}'), ('credit_drift','{service_role}'),
  ('sweep','{}'), ('daily','{}'), ('check_credit_drift','{}'), ('is_admin','{}'), ('narration_chars','{}'),
  ('_ledger','{}'), ('_expire_bucket','{}'), ('_write_internal','{}'), ('_clips_ok','{}'), ('_fail_locked','{}'),
  ('_stripe_begin','{}'), ('_stripe_outcome','{}'), ('_stripe_args_ok','{}'), ('_has_contact_info','{}'),
  ('_new_slug','{}'), ('_admin_check','{}'), ('_audit','{}'), ('_explore_items','{}');

create function pg_temp.call_sql(p_f text) returns text language sql as $$
  select format('select public.%I(%s)::text', p_f, coalesce((select string_agg('null::' || format_type(t, null), ', ' order by o)
           from unnest((select proargtypes::oid[] from pg_proc where proname = p_f and pronamespace = 'public'::regnamespace))
           with ordinality x(t, o)), '')) $$;

select set_eq($$select proname::text from pg_proc where pronamespace = 'public'::regnamespace
                 and prorettype <> 'trigger'::regtype$$, 'select f from fn',
  'the matrix below covers every non-trigger function in public');

-- 81 functions x 3 roles = 243: refused where not granted, callable where granted.
select case when w.r = any (fn.roles)
  then unalike(coalesce(pg_temp.q(w.r, w.sub, 'aal1', pg_temp.call_sql(fn.f)), '(null)'),
               'ERROR 42501: permission denied for function%', format('%s CAN call %s', w.r, fn.f))
  else is(pg_temp.q(w.r, w.sub, 'aal1', pg_temp.call_sql(fn.f)), 'ERROR 42501: permission denied for function ' || fn.f,
          format('%s cannot call %s', w.r, fn.f)) end
  from fn cross join who w order by fn.f, w.r;

-- The same change through the named function as its real caller succeeds (positive twins of the table refusals).
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.ua())), 'reserved',
  'service_role: reserve_generation writes generations + credit_ledger + credit_balances');
select is((select count(*)::int from public.credit_ledger where user_id = pg_temp.ua() and kind = 'reserve'), 1,
  '... and exactly one reserve ledger row exists');
select is(pg_temp.svc($$select public.stripe_topup_paid('evt_w_1', 'checkout.session.completed', now(), false, 'cus_seed_b',
  '00000000-0000-4000-8000-00000000000b', 'cs_w_1', 'pi_w_1', 'topup_60', 499, 1, 'usd', 499)$$), 'applied',
  'service_role: stripe_topup_paid writes stripe_events + purchases + credit_ledger');
select is(pg_temp.svc($$select public.hit_rate_limit('test:w', 60, 5)::text$$), 'true', 'service_role: hit_rate_limit writes rate_limits');
select is(pg_temp.svc($$select public.raise_ops_alert('test_w', '{}')::text$$), 'true', 'service_role: raise_ops_alert writes ops_alerts');
select is(pg_temp.svc($$select public.record_client_error('client', 'r1', '/ask', 'E1', null, 'boom', null, null)::text$$), 'false',
  'service_role: record_client_error runs');
select is((select count::int from public.client_errors where route = '/ask' and message = 'boom'), 1, '... and wrote client_errors');
select is(pg_temp.svc($$select public.submit_report('AAAAAAAAAAAAAAAAAAAAAA', 'spam', null, repeat('a', 64))$$), 'ok',
  'service_role: submit_report writes reports');
select is(pg_temp.as_admin('aal2', $$select public.admin_adjust_credits('00000000-0000-4000-8000-00000000000b', 5, 'test grant', gen_random_uuid())::text$$),
  '197', 'admin at aal2: admin_adjust_credits writes admin_audit + credit_ledger (132 + 60 + 5)');

-- Append-only, for the owner too (postgres runs these directly).
select throws_ok($$update public.credit_ledger set uncollected = 0$$, '42501', 'credit_ledger is append-only',
  'UPDATE on credit_ledger as postgres is refused');
select throws_ok($$delete from public.credit_ledger$$, '42501', 'credit_ledger is append-only',
  'DELETE on credit_ledger as postgres is refused');
select throws_ok($$truncate public.credit_ledger cascade$$, '42501', 'credit_ledger is append-only',
  'TRUNCATE on credit_ledger as postgres is refused');

-- generations_guard (§6.4), as the owner.
select throws_ok(format($$update public.generations set user_id = %L where user_id = %L$$, pg_temp.ub(), pg_temp.ua()),
  '42501', 'generations_guard: identity columns never change', 'a generation never changes owner');
select throws_ok(format($$update public.generations set status = 'succeeded' where user_id = %L and status = 'reserved'$$, pg_temp.ua()),
  '23514', null, 'a reserved row cannot become succeeded without a charge (the CHECK binds)');
select is(pg_temp.fail((select id from public.generations where user_id = pg_temp.ua() and status = 'reserved'), 'check_failed'),
  'released:210', 'fixture: A''s open generation is released (150 + 60 back)');
select throws_ok(format($$update public.generations set status = 'running' where user_id = %L and status = 'failed'$$, pg_temp.ua()),
  '42501', 'generations_guard: failed -> running is not allowed', 'a failed row never reopens');
select is(pg_temp.drift(), '0', 'credit_drift() is empty');
select * from finish();
rollback;
