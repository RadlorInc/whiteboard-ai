-- Library drawings the model made (20261019000100): only the server keeps candidates, only an admin at aal2 lists or
-- reviews them (audited), and only approved ones reach find_drawing. Names are test-only so local data cannot clash.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(14);

create temp table req (k text primary key, id uuid default gen_random_uuid());
insert into req (k) values ('ok'), ('rej');
grant select on req to authenticated;
create function pg_temp.r(p_k text) returns uuid language sql as $$ select id from req where k = p_k $$;
create function pg_temp.item(p_name text) returns text language sql as $$
  select format('[{"name": "%s", "lines": {"new_%s_body": "circle 10 10 5 f=#336633"}}]', p_name, p_name) $$;

-- Who may keep candidates: the server only.
select is(pg_temp.svc(format('select public.save_drawing_candidates(null, %L, %L::jsonb)::text', 'biology', pg_temp.item('zzhog'))), '1',
  'service_role keeps a candidate');
select is(pg_temp.as_user(pg_temp.ua(), format('select public.save_drawing_candidates(null, null, %L::jsonb)::text', pg_temp.item('zzhog'))),
  'ERROR 42501: permission denied for function save_drawing_candidates', 'a user cannot');
select is(pg_temp.svc(format('select public.save_drawing_candidates(null, null, %L::jsonb)::text', pg_temp.item('Bad Name'))), '0',
  'a bad name is skipped');
select is(pg_temp.svc($$insert into public.library_drawings (name, lines) values ('zzx', '{}') returning 'x'$$),
  'ERROR 42501: permission denied for table library_drawings', 'service_role cannot write the table directly');
select pg_temp.svc(format('select public.save_drawing_candidates(null, null, %L::jsonb)::text', pg_temp.item('zzhog'))) from generate_series(1, 3);
select is((select count(*)::int from public.library_drawings where name = 'zzhog' and status = 'pending'), 3, 'at most 3 waiting per name');

-- Who may list and review: an admin at aal2.
select is(pg_temp.as_user(pg_temp.ua(), 'select count(*)::text from public.admin_list_drawings()'), 'ERROR 42501: not allowed', 'a user cannot list');
select is(pg_temp.as_admin('aal1', 'select count(*)::text from public.admin_list_drawings()'), 'ERROR 42501: not allowed', 'the admin at aal1 cannot list');
select ok(pg_temp.as_admin('aal2', $$select count(*)::text from public.admin_list_drawings() where name = 'zzhog'$$)::int = 3, 'the admin at aal2 lists them');

create temp table pick as select id from public.library_drawings where name = 'zzhog' order by created_at limit 2;
grant select on pick to authenticated;
select is(pg_temp.as_admin('aal2', format($$select public.admin_review_drawing(%L, true, 'zz-hog', '{spiny}', '{"w": 10, "h": 1000, "shapes": []}', 'library drawing review', %L)::text$$,
  (select id from pick order by id limit 1), pg_temp.r('ok'))), 'true', 'the admin approves one under a slug');
select is((select count(*)::int from public.admin_audit where action = 'review_drawing' and request_id = pg_temp.r('ok')), 1, '... audited once');
select is(pg_temp.as_admin('aal2', format($$select public.admin_review_drawing(%L, true, 'zz-hog', '{}', '{"w": 1, "h": 1000, "shapes": []}', 'library drawing review', gen_random_uuid())::text$$,
  (select id from pick order by id desc limit 1))), 'ERROR 23505: rejected:slug_taken', 'a taken slug is refused');
select is(pg_temp.as_admin('aal2', format($$select public.admin_review_drawing(%L, false, null, '{}', null, 'library drawing review', %L)::text$$,
  (select id from pick order by id desc limit 1), pg_temp.r('rej'))), 'true', 'the admin rejects another');

-- Only approved drawings reach the generation server, and an approved name takes no more candidates.
select is(pg_temp.svc($$select string_agg(slug || ':' || array_to_string(tags, ','), ' ') from public.approved_drawings() where name = 'zzhog'$$),
  'zz-hog:spiny', 'approved_drawings returns only the approved one');
select is(pg_temp.svc(format('select public.save_drawing_candidates(null, null, %L::jsonb)::text', pg_temp.item('zzhog'))), '0',
  'an approved name takes no new candidates');

select * from finish();
rollback;
