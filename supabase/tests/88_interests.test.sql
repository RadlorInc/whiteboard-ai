-- Interests (20261022000400_interests.sql): set_interests writes subjects and study_level for service_role only; the
-- checks refuse an unknown subject, an empty list and an unknown level. Expected values by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(6);

select pg_temp.new_user('int1') as u \gset
select is((select coalesce(array_to_string(subjects, ','), 'null') || ':' || coalesce(study_level, 'null') from public.profiles where id = :'u'),
  'null:null', 'a new profile has no interests (= every subject, high school)');
select is(pg_temp.svc(format($f$select coalesce(public.set_interests(%L, array['physics','car'], 'grad')::text, 'done')$f$, :'u')), 'done',
  'service_role sets them');
select is((select array_to_string(subjects, ',') || ':' || study_level from public.profiles where id = :'u'),
  'physics,car:grad', '... and they are stored');
select isnt(pg_temp.svc(format($f$select public.set_interests(%L, array['history'], 'grad')::text$f$, :'u')), '',
  'an unknown subject is refused');
select isnt(pg_temp.svc(format($f$select public.set_interests(%L, array[]::text[], 'school')::text$f$, :'u')), '',
  'an empty list is refused');
select isnt(pg_temp.as_user(:'u', format($f$select public.set_interests(%L, array['biology'], 'school')::text$f$, :'u')), '',
  'a signed-in user cannot call it directly');

select * from finish();
rollback;
