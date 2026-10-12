-- Explore (20261013001200_explore.sql): set_explore as the owner only, explore_list readable by anon with no owner
-- identity, and everything that removes a share removing the Explore item. Expected values are written by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(23);

create temp table vids (k text primary key, id uuid);
create function pg_temp.v(p_k text) returns uuid language sql as $$ select id from vids where k = p_k $$;
create function pg_temp.video(p_k text, p_user uuid, p_q text) returns uuid language plpgsql as $$
declare g uuid := pg_temp.gid(pg_temp.reserve(p_user, gen_random_uuid(), 'whiteboard', p_q));
begin
  if g is null or pg_temp.finish(g, 150, 'whiteboard', '{}'::jsonb) not like 'settled:%' then raise exception 'video % failed', p_k; end if;
  insert into vids values (p_k, g);
  return g;
end $$;
create function pg_temp.show(p_user uuid, p_g uuid, p_on boolean) returns text language sql as $$
  select pg_temp.as_user(p_user, format('select outcome || '':'' || coalesce(slug, '''') from public.set_explore(%L, %L)', p_g, p_on)) $$;
create function pg_temp.feed() returns text language sql as $$
  select pg_temp.anon('select coalesce(string_agg(question, ''|'' order by explore_at desc), '''') from public.explore_list(null, 48)') $$;

select pg_temp.give(pg_temp.ua(), 0, 100) is null as f \gset
select pg_temp.give(pg_temp.ub(), 0, 100) is null as f \gset
select pg_temp.video('a1', pg_temp.ua(), 'How does a rainbow form?') is not null as f \gset
select pg_temp.video('a2', pg_temp.ua(), 'Why is the sky blue?') is not null as f \gset
select pg_temp.video('contact', pg_temp.ua(), 'DM @robux_king about volcanoes') is not null as f \gset
select pg_temp.video('b1', pg_temp.ub(), 'How do plants make food?') is not null as f \gset

-- Nothing is on Explore until its maker shows it.
select is(pg_temp.feed(), '', 'Explore starts empty: a finished video is not on it by itself');

-- Showing.
select matches(pg_temp.show(pg_temp.ua(), pg_temp.v('a1'), true), '^shown:[A-Za-z0-9_-]{22}$', 'A shows a video: shown, with a share slug');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('a1') and explore_at is not null), 1,
  '... a share row with explore_at set');
select is(pg_temp.feed(), 'How does a rainbow form?', 'anon sees it in explore_list');
select matches(pg_temp.show(pg_temp.ua(), pg_temp.v('a1'), true), '^shown:', 'showing again is fine (same item)');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('a1')), 1, '... still one share');
select is(pg_temp.show(pg_temp.ua(), pg_temp.v('contact'), true), 'contact_info:', 'a question with contact details cannot go on Explore');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('contact')), 0, '... and no share was made');

-- Only the owner.
select is(pg_temp.show(pg_temp.ub(), pg_temp.v('a2'), true), 'not_found:', 'B cannot put A''s video on Explore');
select is(pg_temp.show(pg_temp.ub(), pg_temp.v('a1'), false), 'not_found:', 'B cannot take A''s video off Explore');
select is(pg_temp.feed(), 'How does a rainbow form?', '... it is still there');
select is(pg_temp.anon(format('select count(*) from public.set_explore(%L, true)', pg_temp.v('a2'))),
  'ERROR 42501: permission denied for function set_explore', 'anon cannot call set_explore');

-- What anon gets: no owner, no generation id; newest first; paged.
select is((select array_agg(parameter_name::text order by ordinal_position) from information_schema.parameters
            where specific_schema = 'public' and specific_name like 'explore_list%' and parameter_mode = 'OUT'),
  '{slug,question,style,explore_at}', 'explore_list returns no user id and no generation id');
select matches(pg_temp.show(pg_temp.ub(), pg_temp.v('b1'), true), '^shown:', 'B shows a video');
select is(pg_temp.feed(), 'How do plants make food?|How does a rainbow form?', 'newest first');
select is(pg_temp.anon(format('select string_agg(question, ''|'') from public.explore_list(%L, 48)',
  (select explore_at from public.shares where generation_id = pg_temp.v('b1')))), 'How does a rainbow form?', 'p_before pages back');
select is(pg_temp.anon('select count(*) from public.explore_list(null, 1)'), '1', 'p_limit caps the page');

-- Removing.
select is(pg_temp.show(pg_temp.ub(), pg_temp.v('b1'), false), 'removed:', 'B takes theirs off Explore');
select is(pg_temp.anon(format('select count(*) from public.get_shared_video(%L)', (select slug from public.shares where generation_id = pg_temp.v('b1')))),
  '1', '... the share link still works');
select is(pg_temp.as_user(pg_temp.ua(), format('select public.revoke_share(%L)::text', pg_temp.v('a1'))), 'true', 'A stops sharing a1');
select is(pg_temp.feed(), '', '... so it is off Explore too');
select matches(pg_temp.show(pg_temp.ua(), pg_temp.v('a2'), true), '^shown:', 'A shows a2, then deletes it');
select pg_temp.svc(format('select public.delete_my_video(%L, %L)::text', pg_temp.ua(), pg_temp.v('a2'))) = 'true' as f \gset
select is(pg_temp.feed(), '', 'a deleted video is off Explore');

select * from finish();
rollback;
