-- Fashion (20261107000100_fashion.sql): a new chat may be Fashion; a made-up subject is still refused; a Fashion
-- video's chat appears in Explore's items like a study one; a profile may tick all eight subjects.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(4);

create temp table c (n text primary key, id uuid);
insert into c values ('f', pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('fashion')$$)::uuid);

select is((select subject from public.conversations where id = (select id from c where n = 'f')), 'fashion', 'a Fashion chat can be started');
select matches(pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('makeup')$$), '^ERROR 22023', 'a subject that does not exist is refused');
select matches(pg_temp.as_user(pg_temp.ua(), $$select public.create_conversation('home')$$), '^ERROR 22023', 'home chats stay closed');
select lives_ok($$update public.profiles set subjects = array['biology','physics','chemistry','cs','finance','fashion','home','car']
  where id = (select user_id from public.conversations where id = (select id from c where n = 'f'))$$, 'a profile may tick all eight subjects');

select * from finish();
rollback;
