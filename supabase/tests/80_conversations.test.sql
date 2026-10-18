-- Conversations (20261018000100_conversations.sql): a user starts their own, sees only their own, and the server
-- files a video under a conversation only when both belong to the same user, once. Expected values by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(12);

select pg_temp.give(pg_temp.ua(), 0, 100) is null as f \gset
select pg_temp.give(pg_temp.ub(), 0, 100) is null as f \gset
create temp table k (n text primary key, id uuid);
insert into k values
  ('ca', pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('biology')$$)::uuid),
  ('cb', pg_temp.as_user(pg_temp.ub(), $$select public.create_conversation('physics')$$)::uuid),
  ('ga', pg_temp.gid(pg_temp.reserve(pg_temp.ua(), gen_random_uuid(), 'whiteboard', 'How does the heart pump blood?')));
create function pg_temp.k(p text) returns uuid language sql as $$ select id from k where n = p $$;
create function pg_temp.attach(p_g uuid, p_c uuid, p_u uuid) returns text language sql as $$
  select pg_temp.svc(format('select public.attach_to_conversation(%L, %L, %L)::text', p_g, p_c, p_u)) $$;

select isnt(pg_temp.k('ca'), null, 'A starts a biology conversation');
select is((select subject from public.conversations where id = pg_temp.k('ca')), 'biology', '... with its subject');
select matches(pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('history')$$), '^ERROR 23514', 'an unknown subject is refused');
select matches(pg_temp.anon($$select public.create_conversation('biology')$$), '^ERROR 42501', 'anon cannot start one');

select is(pg_temp.as_user(pg_temp.ua(), 'select count(*)::text from public.conversations'), '1', 'A sees only A''s conversation');
select is(pg_temp.as_user(pg_temp.ub(), format('select count(*)::text from public.conversations where id = %L', pg_temp.k('ca'))), '0',
  'B cannot see A''s conversation');

select is(pg_temp.attach(pg_temp.k('ga'), pg_temp.k('cb'), pg_temp.ua()), 'false', 'A''s video cannot go under B''s conversation');
select is(pg_temp.attach(pg_temp.k('ga'), pg_temp.k('ca'), pg_temp.ub()), 'false', 'nor be filed by naming B as the user');
select is(pg_temp.attach(pg_temp.k('ga'), pg_temp.k('ca'), pg_temp.ua()), 'true', 'A''s video goes under A''s conversation');
select is((select conversation_id from public.generations where id = pg_temp.k('ga')), pg_temp.k('ca'), '... and is filed there');
select is(pg_temp.attach(pg_temp.k('ga'), pg_temp.k('ca'), pg_temp.ua()), 'false', 'a video is filed once');
select matches(pg_temp.as_user(pg_temp.ua(), format('select public.attach_to_conversation(%L, %L, %L)::text', pg_temp.k('ga'), pg_temp.k('ca'), pg_temp.ua())),
  '^ERROR 42501', 'a signed-in user cannot call the filing function');

select * from finish();
rollback;
