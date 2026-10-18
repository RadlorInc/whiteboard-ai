-- PLAN.md §12.3 00_posture: the real relacl / proacl / policies against hand-written maps (§6.9).
-- Every map below is typed by hand from the plan, never read from the migrations.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(15);

-- The tables (§6.9), by hand.
create temp table want_tables (t text primary key);
insert into want_tables values ('profiles'),('invites'),('price_catalog'),('credit_balances'),('generations'),
  ('generation_calls'),('generation_internal'),('credit_ledger'),('prompt_cache_state'),('miss_counts'),('purchases'),
  ('subscriptions'),('stripe_events'),('shares'),('video_feedback'),('reports'),('support_messages'),('admins'),
  ('admin_audit'),('account_flags'),('ops_settings'),('ops_alerts'),('ops_state'),('rate_limits'),('client_errors'),
  ('email_outbox'),('conversations');

select set_eq(
  $$select relname::text from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r','p','v','m','f')$$,
  $$select t from want_tables$$,
  'public holds exactly the 27 hand-listed tables (no views, no unlisted table)');

select is_empty(
  $$select relname from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r','p') and not relrowsecurity$$,
  'RLS is on for every public table');

-- The ONLY table privileges anon, authenticated, service_role and PUBLIC hold (§6.9): SELECT, nothing else.
create temp table want_table_acl (t text, grantee text, priv text);
insert into want_table_acl select t, 'service_role', 'SELECT' from want_tables;
insert into want_table_acl values ('profiles','authenticated','SELECT'), ('credit_balances','authenticated','SELECT'),
  ('credit_ledger','authenticated','SELECT'), ('generations','authenticated','SELECT'),
  ('purchases','authenticated','SELECT'), ('subscriptions','authenticated','SELECT'),
  ('shares','authenticated','SELECT'), ('video_feedback','authenticated','SELECT'),
  ('conversations','authenticated','SELECT');

-- The query the posture rests on: every privilege of the three API roles (and PUBLIC) on public relations.
create function pg_temp.table_acl() returns table(t text, grantee text, priv text) language sql as $$
  select c.relname::text, case when a.grantee = 0 then 'PUBLIC' else pg_get_userbyid(a.grantee)::text end, a.privilege_type
    from pg_class c cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
   where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','p','v','m','f','S')
     and (a.grantee = 0 or pg_get_userbyid(a.grantee) in ('anon','authenticated','service_role')) $$;

select set_eq('select * from pg_temp.table_acl()', 'select * from want_table_acl',
  'table privileges equal the hand-written §6.9 map (SELECT only)');

select is_empty($$select * from pg_temp.table_acl() where priv <> 'SELECT'$$,
  'no API role holds INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES or TRIGGER on any public table or sequence');

select is_empty(
  $$select c.relname, a.attname from pg_attribute a join pg_class c on c.oid = a.attrelid
     where c.relnamespace = 'public'::regnamespace and a.attacl is not null$$,
  'no column-level grants (they would bypass the table map)');

-- Functions: the EXECUTE map (§6.9), by hand. Names are unique in public (checked below), so the name is the key.
create temp table want_fn (f text primary key, grantees text[] not null, definer boolean not null);
insert into want_fn values
  -- anon, authenticated, service_role
  ('get_shared_video', '{anon,authenticated,service_role}', true),
  ('explore_list',     '{anon,authenticated,service_role}', true),
  ('explore_feed',     '{anon,authenticated,service_role}', true), ('explore_series', '{anon,authenticated,service_role}', true),
  ('explore_related',  '{anon,authenticated,service_role}', true),
  ('health_ping',      '{anon,authenticated,service_role}', false),
  -- authenticated
  ('accept_terms','{authenticated}',true), ('redeem_invite','{authenticated}',true), ('is_live_user','{authenticated}',true),
  ('search_my_videos','{authenticated}',false), ('create_share','{authenticated}',true), ('revoke_share','{authenticated}',true),
  ('submit_feedback','{authenticated}',true), ('set_explore','{authenticated}',true),
  ('create_conversation','{authenticated}',true), ('attach_to_conversation','{service_role}',true),
  ('explore_on_finish','{service_role}',true),
  ('admin_adjust_credits','{authenticated}',true), ('admin_refund_generation','{authenticated}',true),
  ('admin_set_flags','{authenticated}',true), ('admin_set_settings','{authenticated}',true),
  ('admin_unpublish_share','{authenticated}',true), ('admin_view_generation','{authenticated}',true),
  ('admin_resolve_report','{authenticated}',true), ('admin_create_invite','{authenticated}',true),
  ('admin_grant_access','{authenticated}',true), ('admin_resolve_stripe_event','{authenticated}',true),
  ('admin_beta_allow','{authenticated}',true), ('admin_change_email','{authenticated}',true),
  ('admin_delete_user','{authenticated}',true), ('admin_lookup_user','{authenticated}',true),
  ('admin_dispute_evidence','{authenticated}',true), ('admin_metrics','{authenticated}',true),
  ('admin_top_misses','{authenticated}',true),
  -- authenticated and service_role (the signed-in layout and checkout compare terms versions, §11.8)
  ('current_terms_version','{authenticated,service_role}',false),
  -- service_role
  ('complete_signup','{service_role}',true), ('link_stripe_customer','{service_role}',true),
  ('invite_available','{service_role}',true), ('reserve_generation','{service_role}',true),
  ('start_generation','{service_role}',true), ('set_generation_stage','{service_role}',true),
  ('finish_generation','{service_role}',true), ('fail_generation','{service_role}',true),
  ('expire_if_stale','{service_role}',true), ('set_generation_voice','{service_role}',true),
  ('mark_voice_purged','{service_role}',true), ('delete_my_video','{service_role}',true),
  ('record_model_call','{service_role}',true), ('record_client_telemetry','{service_role}',true),
  ('stripe_record_event','{service_role}',true), ('stripe_topup_paid','{service_role}',true),
  ('stripe_invoice_paid','{service_role}',true), ('stripe_subscription_sync','{service_role}',true),
  ('stripe_payment_failed','{service_role}',true), ('stripe_reverse','{service_role}',true),
  ('stripe_efw','{service_role}',true), ('hit_rate_limit','{service_role}',true),
  ('submit_report','{service_role}',true), ('submit_support_message','{service_role}',true),
  ('record_client_error','{service_role}',true), ('raise_ops_alert','{service_role}',true),
  ('outbox_claim','{service_role}',true), ('outbox_done','{service_role}',true),
  ('unfinished_signups','{service_role}',true), ('delete_account_data','{service_role}',true),
  ('credit_drift','{service_role}',true),
  -- none (cron runs as postgres; triggers; helpers called only inside DEFINER functions)
  ('sweep','{}',true), ('daily','{}',true), ('check_credit_drift','{}',true), ('is_admin','{}',true),
  ('handle_new_user','{}',true), ('on_auth_user_deleted','{}',true),
  ('narration_chars','{}',false), ('generations_guard','{}',false), ('ledger_append_only','{}',false),
  ('_ledger','{}',false), ('_expire_bucket','{}',false), ('_write_internal','{}',false), ('_clips_ok','{}',false),
  ('_fail_locked','{}',false), ('_stripe_begin','{}',false), ('_stripe_outcome','{}',false),
  ('_stripe_args_ok','{}',false), ('_has_contact_info','{}',false), ('_new_slug','{}',false), ('_explore_items','{}',true),
  ('_admin_check','{}',false), ('_audit','{}',false);

create function pg_temp.fn_acl() returns table(f text, grantee text) language sql as $$
  select p.proname::text, case when a.grantee = 0 then 'PUBLIC' else pg_get_userbyid(a.grantee)::text end
    from pg_proc p cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
   where p.pronamespace = 'public'::regnamespace and a.privilege_type = 'EXECUTE'
     and (a.grantee = 0 or pg_get_userbyid(a.grantee) in ('anon','authenticated','service_role')) $$;

select set_eq($$select proname::text from pg_proc where pronamespace = 'public'::regnamespace$$,
  'select f from want_fn', 'public holds exactly the hand-listed functions (a new one must be added to the map)');
select is_empty($$select proname from pg_proc where pronamespace = 'public'::regnamespace group by proname having count(*) > 1$$,
  'no overloaded function names in public');
select set_eq('select * from pg_temp.fn_acl()', 'select f, unnest(grantees) from want_fn',
  'EXECUTE grants equal the hand-written §6.9 map (no PUBLIC, nothing extra)');
select set_eq($$select proname::text from pg_proc where pronamespace = 'public'::regnamespace and prosecdef$$,
  'select f from want_fn where definer', 'the SECURITY DEFINER catalogue equals the hand-written list');
select is_empty($$select proname from pg_proc where pronamespace = 'public'::regnamespace
                   and not ('search_path=""' = any (coalesce(proconfig, '{}')))$$,
  'every public function (DEFINER or not) pins search_path to ''''');
select is_empty($$select proname from pg_proc where pronamespace = 'public'::regnamespace and pg_get_userbyid(proowner) <> 'postgres'$$,
  'every public function is owned by postgres');

-- Policies, by hand (§6.9): SELECT to authenticated, own rows, live users only. Nothing else.
select set_eq(
  $$select tablename::text, policyname::text, cmd, roles::text, qual, with_check from pg_policies where schemaname = 'public'$$,
  $$values
    ('profiles','profiles_own','SELECT','{authenticated}','((id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null::text),
    ('credit_balances','credit_balances_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('credit_ledger','credit_ledger_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('generations','generations_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('purchases','purchases_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('subscriptions','subscriptions_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('shares','shares_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('video_feedback','video_feedback_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null),
    ('conversations','conversations_own','SELECT','{authenticated}','((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_live_user() AS is_live_user))',null)$$,
  'pg_policies equals the hand-written list');

-- Positive controls: the same queries DO find each defect when one is planted (then rolled back).
savepoint probe;
create table public.zz_probe (x int);
grant insert on public.zz_probe to authenticated;
create function public.zz_probe_fn() returns int language sql security definer as $$ select 1 $$;
grant execute on function public.zz_probe_fn() to anon;
select results_eq(
  $$select (select count(*) from pg_temp.table_acl() where t = 'zz_probe' and grantee = 'authenticated' and priv = 'INSERT')::int,
           (select count(*) from pg_temp.fn_acl() where f = 'zz_probe_fn' and grantee = 'anon')::int,
           (select count(*) from pg_proc where proname = 'zz_probe_fn' and prosecdef
              and not ('search_path=""' = any (coalesce(proconfig, '{}'))))::int$$,
  $$values (1, 1, 1)$$,
  'positive control: a planted INSERT grant, an anon EXECUTE and a DEFINER without search_path are all seen');
rollback to savepoint probe;

-- The extension the jobs need, and the jobs (§6.8).
select ok(exists (select 1 from pg_extension where extname = 'pg_cron'), 'pg_cron is installed');
select set_eq($$select jobname::text, schedule::text, command::text from cron.job$$,
  $$values ('sweep', '* * * * *', 'select public.sweep()'), ('daily', '15 3 * * *', 'select public.daily()')$$,
  'pg_cron runs exactly sweep (every minute) and daily (03:15 UTC)');

select * from finish();
rollback;
