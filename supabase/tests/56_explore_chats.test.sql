-- Explore by chat (20261018000200_explore_chats.sql): the server puts a finished video on Explore (explore_on_finish),
-- the feed has one item per chat with search and a subject filter, a shared video brings its chat (explore_series) and
-- related items (explore_related). Expected values are written by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(22);

create temp table vids (k text primary key, id uuid);
create function pg_temp.v(p_k text) returns uuid language sql as $$ select id from vids where k = p_k $$;
create function pg_temp.slug(p_k text) returns text language sql as $$ select slug from public.shares where generation_id = pg_temp.v(p_k) $$;
-- A finished video, filed under conversation p_conv when given (as the generation server does).
create function pg_temp.video(p_k text, p_user uuid, p_q text, p_conv uuid) returns uuid language plpgsql as $$
declare g uuid := pg_temp.gid(pg_temp.reserve(p_user, gen_random_uuid(), 'whiteboard', p_q));
begin
  if p_conv is not null then perform pg_temp.svc(format('select public.attach_to_conversation(%L, %L, %L)::text', g, p_conv, p_user)); end if;
  if g is null or pg_temp.finish(g, 150, 'whiteboard', '{}'::jsonb) not like 'settled:%' then raise exception 'video % failed', p_k; end if;
  insert into vids values (p_k, g);
  return g;
end $$;
create function pg_temp.done(p_k text, p_user uuid) returns text language sql as $$
  select pg_temp.svc(format('select public.explore_on_finish(%L, %L)', pg_temp.v(p_k), p_user)) $$;
create function pg_temp.feed(p_q text, p_subject text) returns text language sql as $$
  select pg_temp.anon(format('select coalesce(string_agg(title || '':'' || n || '':'' || coalesce(subject, ''-''), ''|''), '''') from public.explore_feed(%L, %L, 0, 48)', p_q, p_subject)) $$;

-- Fresh users, and an empty Explore even on a dev database with videos in it (all rolled back at the end).
create temp table who as select pg_temp.new_user('xc_a_' || left(gen_random_uuid()::text, 8)) a, pg_temp.new_user('xc_b_' || left(gen_random_uuid()::text, 8)) b;
create function pg_temp.xa() returns uuid language sql as $$ select a from who $$;
create function pg_temp.xb() returns uuid language sql as $$ select b from who $$;
update public.shares set explore_at = null;
select pg_temp.give(pg_temp.xa(), 0, 100) is null as f \gset
select pg_temp.give(pg_temp.xb(), 0, 100) is null as f \gset
create temp table convs as select
  pg_temp.as_user(pg_temp.xa(), $$select public.create_conversation('biology')$$)::uuid heart,
  pg_temp.as_user(pg_temp.xb(), $$select public.create_conversation('biology')$$)::uuid flow;
select pg_temp.video('heart', pg_temp.xa(), 'How does the heart pump blood?', (select heart from convs)) is not null as f \gset
select pg_temp.video('valves', pg_temp.xa(), 'Why are there valves in it?', (select heart from convs)) is not null as f \gset
select pg_temp.video('rainbow', pg_temp.xb(), 'How does a rainbow form?', null) is not null as f \gset
select pg_temp.video('contact', pg_temp.xb(), 'DM @robux_king about volcanoes', null) is not null as f \gset

-- The server shows a finished video; only the maker's own, never one with contact details; nobody else may call it.
select is(pg_temp.feed(null, null), '', 'nothing is on Explore before the server shows it');
select is(pg_temp.done('heart', pg_temp.xb()), 'not_found', 'not under another user''s id');
select is(pg_temp.done('heart', pg_temp.xa()), 'shown', 'the maker''s finished video is shown');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('heart') and explore_at is not null), 1, '... one share, on Explore');
select is(pg_temp.done('heart', pg_temp.xa()), 'shown', 'again is fine');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('heart')), 1, '... still one share');
select is(pg_temp.done('contact', pg_temp.xb()), 'contact_info', 'a question with contact details stays off');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('contact')), 0, '... with no share');
select matches(pg_temp.as_user(pg_temp.xa(), format('select public.explore_on_finish(%L, %L)', pg_temp.v('valves'), pg_temp.xa())),
  '^ERROR 42501', 'a user cannot call explore_on_finish');
select matches(pg_temp.anon('select count(*) from public._explore_items()'), '^ERROR 42501', 'anon cannot read _explore_items');

select is(pg_temp.done('valves', pg_temp.xa()), 'shown', 'the follow-up is shown');
select is(pg_temp.done('rainbow', pg_temp.xb()), 'shown', 'B''s standalone video is shown');

-- The feed: one item per chat titled by its first question, newest activity first; no ids.
select is(pg_temp.feed(null, null), 'How does a rainbow form?:1:-|How does the heart pump blood?:2:biology', 'one item per chat, newest first');
select is((select array_agg(parameter_name::text order by ordinal_position) from information_schema.parameters
            where specific_schema = 'public' and specific_name like 'explore_feed%' and parameter_mode = 'OUT'),
  '{slug,title,style,script,n,subject,latest}', 'explore_feed returns no user, generation or conversation id');
select is(pg_temp.feed(null, 'biology'), 'How does the heart pump blood?:2:biology', 'the subject filter');
select is(pg_temp.feed('valves', null), 'How does the heart pump blood?:2:biology', 'search finds a chat by a follow-up''s question');
select is(pg_temp.feed('zebra', null), '', 'a search with no match is empty');

-- A shared video brings its chat, in order.
select is(pg_temp.anon(format('select string_agg(question, ''|'') from public.explore_series(%L)', pg_temp.slug('valves'))),
  'How does the heart pump blood?|Why are there valves in it?', 'explore_series: the chat in order');

-- Related: the item sharing a word first, then the rest; never itself.
select pg_temp.video('flow', pg_temp.xb(), 'Where does blood go after the heart?', (select flow from convs)) is not null as f \gset
select is(pg_temp.done('flow', pg_temp.xb()), 'shown', 'B''s blood chat is shown');
select is(pg_temp.anon(format('select string_agg(title, ''|'') from public.explore_related(%L, 6)', pg_temp.slug('heart'))),
  'Where does blood go after the heart?|How does a rainbow form?', 'related: the word match first, never itself');

-- Taken off Explore: the follow-up leaves the chat's item and its series.
select is(pg_temp.as_user(pg_temp.xa(), format('select outcome from public.set_explore(%L, false)', pg_temp.v('valves'))), 'removed', 'A takes the follow-up off');
select is(pg_temp.anon(format('select string_agg(question, ''|'') from public.explore_series(%L)', pg_temp.slug('heart'))),
  'How does the heart pump blood?', '... it is gone from the series of the first video');

select * from finish();
rollback;
