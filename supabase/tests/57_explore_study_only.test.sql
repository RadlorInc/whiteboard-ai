-- Explore shows study lessons only (20261026000200_explore_study_only.sql): a Home or Car chat's video leaves the feed
-- and the related lists, its share link still opens, and a study chat's video is unchanged.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(5);

create temp table vids (k text primary key, id uuid, slug text);
create function pg_temp.video(p_k text, p_user uuid, p_q text, p_subject text) returns uuid language plpgsql as $$
declare g uuid := pg_temp.gid(pg_temp.reserve(p_user, gen_random_uuid(), 'whiteboard', p_q)); c uuid := gen_random_uuid(); s text;
begin
  if g is null or pg_temp.finish(g, 150, 'whiteboard', '{"steps":[]}'::jsonb) not like 'settled:%' then raise exception 'video % failed', p_k; end if;
  insert into public.conversations (id, user_id, subject) values (c, p_user, p_subject);   -- as the old chats were made
  update public.generations set conversation_id = c where id = g;
  s := split_part(pg_temp.as_user(p_user, format('select outcome || '':'' || coalesce(slug, '''') from public.set_explore(%L, true)', g)), ':', 2);
  insert into vids values (p_k, g, s);
  return g;
end $$;
create function pg_temp.feed(p_subject text default null) returns text language sql as $$
  select pg_temp.anon(format('select coalesce(string_agg(title, ''|'' order by title), '''') from public.explore_feed(null, %L, 0, 48)', p_subject)) $$;

select pg_temp.give(pg_temp.ua(), 0, 100) is null as f \gset
select pg_temp.video('bio', pg_temp.ua(), 'How does the heart pump blood?', 'biology') is not null as f \gset
select pg_temp.video('home', pg_temp.ua(), 'How do I fix a leaking tap?', 'home') is not null as f \gset
select pg_temp.video('car', pg_temp.ua(), 'How do I change a flat tyre?', 'car') is not null as f \gset

select is(pg_temp.feed(), 'How does the heart pump blood?', 'the feed has the study lesson only');
select is(pg_temp.feed('home'), '', 'asking for the home subject finds nothing');
select is(pg_temp.anon(format('select count(*)::text from public.explore_related(%L, 12)', (select slug from vids where k = 'bio'))), '0',
  'a home or car video is never "related"');
select is(pg_temp.anon(format('select count(*)::text from public.explore_series(%L)', (select slug from vids where k = 'home'))), '1',
  'the home video''s share link still opens');
select isnt((select explore_at from public.shares where generation_id = (select id from vids where k = 'home')), null,
  'nothing was deleted: its share is still marked for Explore');

select * from finish();
rollback;
