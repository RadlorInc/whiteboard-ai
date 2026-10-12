-- PLAN.md §12.3 50_shares (+ the storage half that SQL can see; storage.test.mjs drives the HTTP API).
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(40);

create temp table vids (k text primary key, id uuid);
create function pg_temp.v(p_k text) returns uuid language sql as $$ select id from vids where k = p_k $$;
-- A succeeded video of p_user with this question (reserve + finish through the real functions).
create function pg_temp.video(p_k text, p_user uuid, p_q text) returns uuid language plpgsql as $$
declare g uuid := pg_temp.gid(pg_temp.reserve(p_user, gen_random_uuid(), 'whiteboard', p_q));
begin
  if g is null or pg_temp.finish(g, 150, 'whiteboard',
       format('{"clips":[{"path":"%s/%s/0.mp3","durS":3.2,"words":[["Step",0,0.4]]}]}', p_user, g)::jsonb) not like 'settled:%' then
    raise exception 'video % failed', p_k;
  end if;
  insert into vids values (p_k, g);
  return g;
end $$;
create function pg_temp.share(p_user uuid, p_g uuid) returns text language sql as $$
  select pg_temp.as_user(p_user, format('select outcome || '':'' || coalesce(slug, '''') from public.create_share(%L)', p_g)) $$;

select pg_temp.give(pg_temp.ua(), 0, 100) is null as f \gset
select pg_temp.video('url', pg_temp.ua(), 'Visit free-robux.gg for answers') is not null as f \gset
select pg_temp.video('handle', pg_temp.ua(), 'DM @robux_king to claim') is not null as f \gset
select pg_temp.video('email', pg_temp.ua(), 'mail a@b.co about photosynthesis') is not null as f \gset
select pg_temp.video('phone', pg_temp.ua(), 'call (555) 123-4567 about mitosis') is not null as f \gset
select pg_temp.video('www', pg_temp.ua(), 'see www.example about cells') is not null as f \gset
select pg_temp.video('lt', pg_temp.ua(), 'Is x < 5 when x = 3.2?') is not null as f \gset
select pg_temp.video('pi', pg_temp.ua(), 'What is 3.14 × 2?') is not null as f \gset

-- contact_info: refused, and no row.
select is(pg_temp.share(pg_temp.ua(), pg_temp.v(k)), 'contact_info:', format('a question with %s cannot be shared', k))
  from (values ('url'), ('handle'), ('email'), ('phone'), ('www')) x(k);
select is((select count(*)::int from public.shares where user_id = pg_temp.ua()), 0, '... and no share row was made');
-- Maths still shares.
select matches(pg_temp.share(pg_temp.ua(), pg_temp.v('lt')), '^created:[A-Za-z0-9_-]{22}$', '"Is x < 5 when x = 3.2?" shares (a 22-character slug)');
select matches(pg_temp.share(pg_temp.ua(), pg_temp.v('pi')), '^created:[A-Za-z0-9_-]{22}$', '"What is 3.14 × 2?" shares');
select is(pg_temp.share(pg_temp.ua(), pg_temp.v('lt')), 'exists:' || (select slug from public.shares where generation_id = pg_temp.v('lt')),
  'sharing again returns the same slug');

-- B cannot share A's video.
select is(pg_temp.share(pg_temp.ub(), pg_temp.v('lt')), 'not_found:', 'B calling create_share on A''s video -> not_found, no slug');

-- Reading a share.
create temp table s (slug text);
insert into s select slug from public.shares where generation_id = pg_temp.v('lt');
select is(pg_temp.anon('select count(*) from public.shares'), 'ERROR 42501: permission denied for table shares', 'anon cannot SELECT shares');
select is(pg_temp.anon('select count(*) from public.generations'), 'ERROR 42501: permission denied for table generations',
  'anon cannot SELECT generations');
select is(pg_temp.anon(format('select question || ''|'' || style from public.get_shared_video(%L)', (select slug from s))),
  'Is x < 5 when x = 3.2?|whiteboard', 'anon gets the video from a valid slug');
select is(pg_temp.anon(format('select clips::text from public.get_shared_video(%L)', (select slug from s))),
  '[{"durS": 3.2, "words": [["Step", 0, 0.4]]}]', '... its clips carry no Storage path (the path holds the owner''s uid)');
select is((select array_agg(parameter_name::text order by ordinal_position) from information_schema.parameters
            where specific_schema = 'public' and specific_name like 'get_shared_video%' and parameter_mode = 'OUT'),
  '{question,style,script,voice,clips,created_at}', 'get_shared_video returns no user id and no generation id');
select is(pg_temp.anon($$select count(*) from public.get_shared_video('not-a-slug')$$), '0', 'a malformed slug -> empty');
select is(pg_temp.anon($$select count(*) from public.get_shared_video('AAAAAAAAAAAAAAAAAAAAAA')$$), '0', 'an unknown slug -> empty');
select is(pg_temp.as_user(pg_temp.ua(), format('select public.revoke_share(%L)::text', pg_temp.v('lt'))), 'true', 'A unshares');
select is(pg_temp.anon(format('select count(*) from public.get_shared_video(%L)', (select slug from s))), '0', 'a revoked slug -> empty');
select matches(pg_temp.share(pg_temp.ua(), pg_temp.v('lt')), '^created:', 'sharing again ...');
select isnt((select slug from public.shares where generation_id = pg_temp.v('lt')), (select slug from s), '... makes a new slug');
select is(pg_temp.svc(format('select public.delete_my_video(%L, %L)::text', pg_temp.ua(), pg_temp.v('pi'))), 'true', 'A deletes a shared video');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('pi')), 0, '... its share row is gone');
select is(pg_temp.anon(format($$select count(*) from public.get_shared_video(%L) $$,
  (select slug from public.shares where generation_id = pg_temp.v('pi')))), '0', '... and nothing resolves for it');
-- A scrubbed generation whose share row somehow survived still resolves to nothing.
insert into public.shares (slug, generation_id, user_id) values ('BBBBBBBBBBBBBBBBBBBBBB', pg_temp.v('pi'), pg_temp.ua());
select is(pg_temp.anon($$select count(*) from public.get_shared_video('BBBBBBBBBBBBBBBBBBBBBB')$$), '0', 'a scrubbed video''s slug -> empty');

-- 20 shares per user per UTC day: three made above through create_share (lt, pi, lt again), 17 more on the same
-- key, then the 21st.
select is((select hits from public.rate_limits where key = 'share:' || pg_temp.ua()), 3,
  'create_share counted its 3 new shares (not the refusals, not the existing one) on share:<uid>');
select is(pg_temp.svc(format($$select count(*) filter (where public.hit_rate_limit(%L, 86400, 20)) from generate_series(1, 17)$$,
  'share:' || pg_temp.ua())), '17', '17 more hits are still within 20');
select pg_temp.video('more', pg_temp.ua(), 'Why is the sky blue?') is not null as f \gset
select is(pg_temp.share(pg_temp.ua(), pg_temp.v('more')), 'share_limit:', 'the 21st share in a day -> share_limit');
select is((select count(*)::int from public.shares where generation_id = pg_temp.v('more')), 0, '... and no row');

-- Slugs: 128 random bits, base64url, 22 characters.
create temp table slugs as select public._new_slug() s from generate_series(1, 10000);
select is((select count(distinct s)::int from slugs), 10000, '10,000 slugs are distinct');
select is((select count(*)::int from slugs where s !~ '^[A-Za-z0-9_-]{22}$'), 0, '... every one is 22 base64url characters');
select ok((select bool_and(x) from (select exists (select 1 from slugs where s ~ c) x
             from unnest(array['[A-Z]', '[a-z]', '[0-9]', '-', '_']) c) y),
  '... and the whole base64url alphabet appears (upper, lower, digits, - and _), not hex');

-- Storage (§6.9): bucket voice is private, 2 MB, audio/mpeg only; no policies, so no client can touch an object.
select is((select public::text || ':' || file_size_limit || ':' || allowed_mime_types::text from storage.buckets where id = 'voice'),
  'false:2097152:{audio/mpeg}', 'bucket voice: private, 2 MB, audio/mpeg only');
select is((select count(*)::int from pg_policies where schemaname = 'storage' and tablename = 'objects'), 0,
  'storage.objects has no policies at all');
insert into storage.objects (bucket_id, name, owner_id) values ('voice', pg_temp.ua() || '/x/0.mp3', pg_temp.ua()::text);
select is(pg_temp.as_user(pg_temp.ua(), $$select count(*) from storage.objects where bucket_id = 'voice'$$), '0',
  'the owner reads 0 objects in voice (no policy)');
select is(pg_temp.anon($$select count(*) from storage.objects where bucket_id = 'voice'$$), '0', 'anon reads 0 objects in voice');
select is(pg_temp.as_user(pg_temp.ua(), format($$insert into storage.objects (bucket_id, name) values ('voice', '%s/y/0.mp3') returning 1$$, pg_temp.ua())),
  'ERROR 42501: new row violates row-level security policy for table "objects"', 'the owner cannot insert an object');
select is(pg_temp.as_user(pg_temp.ua(), $$with d as (delete from storage.objects where bucket_id = 'voice' returning 1) select count(*) from d$$),
  'ERROR 42501: Direct deletion from storage tables is not allowed. Use the Storage API instead.',
  'the owner cannot delete through SQL (Storage refuses SQL deletes, the §6.10 step 4 assumption, measured locally) ...');
select is(pg_temp.svc($$select count(*) from storage.objects where bucket_id = 'voice'$$), '1', '... the object is still there (service_role sees it)');

select is(pg_temp.drift(), '0', 'credit_drift() is empty');
select * from finish();
rollback;
