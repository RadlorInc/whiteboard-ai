-- Collection (20261018000300_saved_items.sql): save_item only for Explore slugs, own rows only, my_saved returns the
-- Explore card, and the save goes when the share goes. Expected values are written by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(11);

create temp table who as select pg_temp.new_user('sv_a_' || left(gen_random_uuid()::text, 8)) a, pg_temp.new_user('sv_b_' || left(gen_random_uuid()::text, 8)) b;
create function pg_temp.xa() returns uuid language sql as $$ select a from who $$;
create function pg_temp.xb() returns uuid language sql as $$ select b from who $$;
select pg_temp.give(pg_temp.xb(), 0, 100) is null as f \gset
create temp table v as select pg_temp.gid(pg_temp.reserve(pg_temp.xb(), gen_random_uuid(), 'whiteboard', 'How do magnets attract?')) g;
select pg_temp.finish((select g from v), 150, 'whiteboard', '{}'::jsonb) like 'settled:%' as f \gset
select pg_temp.svc(format('select public.explore_on_finish(%L, %L)', (select g from v), pg_temp.xb())) = 'shown' as f \gset
create temp table s as select slug from public.shares where generation_id = (select g from v);
create function pg_temp.save(p_on boolean) returns text language sql as $$
  select pg_temp.as_user(pg_temp.xa(), format('select public.save_item(%L, %L)', (select slug from s), p_on)) $$;

select is(pg_temp.save(true), 'saved', 'A saves B''s Explore lesson');
select is(pg_temp.save(true), 'saved', 'saving again is fine');
select is((select count(*)::int from public.saved_items where user_id = pg_temp.xa()), 1, '... one row');
select is(pg_temp.as_user(pg_temp.xa(), 'select string_agg(title || '':'' || n, ''|'') from public.my_saved(48)'),
  'How do magnets attract?:1', 'my_saved returns it as an Explore card');
select is(pg_temp.as_user(pg_temp.xb(), 'select count(*) from public.saved_items'), '0', 'B cannot see A''s saves (RLS)');
select is(pg_temp.as_user(pg_temp.xa(), format('select public.save_item(%L, true)', 'AAAAAAAAAAAAAAAAAAAAAA')), 'not_found', 'a slug not on Explore cannot be saved');
select matches(pg_temp.anon(format('select public.save_item(%L, true)', (select slug from s))), '^ERROR 42501', 'anon cannot save');
select is(pg_temp.save(false), 'removed', 'A unsaves it');
select is(pg_temp.save(true), 'saved', 'and saves it again');
select is(pg_temp.as_user(pg_temp.xb(), format('select public.revoke_share(%L)::text', (select g from v))), 'true', 'B stops sharing');
select is((select count(*)::int from public.saved_items where user_id = pg_temp.xa()), 0, '... and A''s save goes too');

select * from finish();
rollback;
