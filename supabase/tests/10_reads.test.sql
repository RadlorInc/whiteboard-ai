-- PLAN.md §12.3 10_reads: who can SELECT what, driven as the real roles (anon, user A, user B, admin, service_role).
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(108);

-- Fixtures through the real functions: A has one succeeded and one failed video, a share and feedback; B has one
-- succeeded video. With the seed (A: Plus + a 60 pack, B: a 132 pack) the hand counts are:
--   A: profiles 1, credit_balances 1, credit_ledger 2 + 2 + 2 = 6, generations 2, purchases 2, subscriptions 1,
--      shares 1, video_feedback 1
--   B: profiles 1, credit_balances 1, credit_ledger 1 + 2 = 3, generations 1, purchases 1, subscriptions 0,
--      shares 0, video_feedback 0
create temp table fx (k text primary key, v uuid);
do $$
declare r text;
begin
  insert into fx values ('a1', pg_temp.gid(pg_temp.reserve(pg_temp.ua())));
  r := pg_temp.finish((select v from fx where k = 'a1'), 450);
  if r not like 'settled:1:%' then raise exception 'fixture a1: %', r; end if;
  insert into fx values ('a2', pg_temp.gid(pg_temp.reserve(pg_temp.ua())));
  r := pg_temp.fail((select v from fx where k = 'a2'), 'check_failed');
  if r not like 'released:%' then raise exception 'fixture a2: %', r; end if;
  insert into fx values ('b1', pg_temp.gid(pg_temp.reserve(pg_temp.ub())));
  r := pg_temp.finish((select v from fx where k = 'b1'), 150);
  if r not like 'settled:1:%' then raise exception 'fixture b1: %', r; end if;
  r := pg_temp.as_user(pg_temp.ua(), format('select outcome from public.create_share(%L)', (select v from fx where k = 'a1')));
  if r <> 'created' then raise exception 'fixture share: %', r; end if;
  r := pg_temp.as_user(pg_temp.ua(), format('select public.submit_feedback(%L, 1::smallint, null, null)', (select v from fx where k = 'a1')));
  if r <> 'true' then raise exception 'fixture feedback: %', r; end if;
end $$;
select is((select count(*)::int from fx where v is not null), 3, 'fixtures: three generations reserved');

create temp table tbl (t text primary key, owner_col text, policy boolean, a_n int, b_n int);
insert into tbl values
  ('profiles','id',true,1,1), ('credit_balances','user_id',true,1,1), ('credit_ledger','user_id',true,6,3),
  ('generations','user_id',true,2,1), ('purchases','user_id',true,2,1), ('subscriptions','user_id',true,1,0),
  ('shares','user_id',true,1,0), ('video_feedback','user_id',true,1,0),
  ('invites',null,false,0,0), ('price_catalog',null,false,0,0), ('generation_calls',null,false,0,0),
  ('generation_internal',null,false,0,0), ('prompt_cache_state',null,false,0,0), ('miss_counts',null,false,0,0),
  ('stripe_events',null,false,0,0), ('reports',null,false,0,0), ('support_messages',null,false,0,0),
  ('admins',null,false,0,0), ('admin_audit',null,false,0,0), ('account_flags',null,false,0,0),
  ('ops_settings',null,false,0,0), ('ops_alerts',null,false,0,0), ('ops_state',null,false,0,0),
  ('rate_limits',null,false,0,0), ('client_errors',null,false,0,0), ('email_outbox',null,false,0,0);

-- anon: no grant on any table (26).
select is(pg_temp.anon(format('select count(*) from public.%I', t)), format('ERROR 42501: permission denied for table %s', t),
          format('anon cannot SELECT %s', t))
  from tbl order by t;

-- authenticated: no grant on the 18 internal tables.
select is(pg_temp.as_user(pg_temp.ua(), format('select count(*) from public.%I', t)),
          format('ERROR 42501: permission denied for table %s', t), format('user A cannot SELECT %s', t))
  from tbl where not policy order by t;

-- Own rows only, by hand count (8 + 8), and none of the other user's (8 + 8).
select is(pg_temp.as_user(pg_temp.ua(), format('select count(*) from public.%I', t)), a_n::text,
          format('A sees exactly its own %s rows (%s)', t, a_n)) from tbl where policy order by t;
select is(pg_temp.as_user(pg_temp.ub(), format('select count(*) from public.%I', t)), b_n::text,
          format('B sees exactly its own %s rows (%s)', t, b_n)) from tbl where policy order by t;
select is(pg_temp.as_user(pg_temp.ub(), format('select count(*) from public.%I where %I = %L', t, owner_col, pg_temp.ua())), '0',
          format('B sees 0 of A''s %s rows', t)) from tbl where policy order by t;
select is(pg_temp.as_user(pg_temp.ua(), format('select count(*) from public.%I where %I = %L', t, owner_col, pg_temp.ub())), '0',
          format('A sees 0 of B''s %s rows', t)) from tbl where policy order by t;

-- An admin is just a user for table reads, at either assurance level.
select is(pg_temp.as_admin('aal2', format('select count(*) from public.generations where user_id = %L', pg_temp.ua())), '0',
          'the admin (aal2) reads 0 of A''s generations through the API');
select is(pg_temp.as_admin('aal2', 'select count(*) from public.admins'), 'ERROR 42501: permission denied for table admins',
          'the admin (aal2) cannot SELECT admins');

-- service_role sees everything postgres sees (26), and the hand counts for A and B.
select is(pg_temp.svc(format('select count(*) from public.%I', t)),
          (select (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from public.%I', t), false, true, '')))[1]::text),
          format('service_role sees every %s row', t)) from tbl order by t;
select is(pg_temp.svc(format('select count(*) from public.generations where user_id = %L', pg_temp.ua())), '2',
          'service_role sees A''s 2 generations');
select is(pg_temp.svc(format('select count(*) from public.credit_ledger where user_id = %L', pg_temp.ub())), '3',
          'service_role sees B''s 3 ledger rows');

select is(pg_temp.drift(), '0', 'credit_drift() is empty');
select * from finish();
rollback;
