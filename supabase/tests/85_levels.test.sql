-- Levels (20261020000300_levels.sql): a study chat keeps High school, College or Grad school ('school', 'undergrad',
-- 'grad'). New home and car chats are refused since 26 Oct 2026 (80_conversations). The level changes only what is taught, so reserve_generation is untouched.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(4);

create temp table c (n text primary key, id uuid);
insert into c values
  ('pg', pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('physics', 'grad')$$)::uuid),
  ('bs', pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('biology')$$)::uuid),
  ('fg', pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('finance', 'grad')$$)::uuid);
create function pg_temp.lvl(p text) returns text language sql as $$
  select level from public.conversations where id = (select id from c where n = p) $$;

select is(pg_temp.lvl('pg'), 'grad', 'a physics chat keeps Grad school');
select is(pg_temp.lvl('bs'), 'school', 'no level: high school');
select is(pg_temp.lvl('fg'), 'grad', 'a finance chat keeps its level too (study subjects, 26 Oct 2026)');
select matches(pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('physics', 'phd')$$), '^ERROR 23514', 'an unknown level is refused');

select * from finish();
rollback;
