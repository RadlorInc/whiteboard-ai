-- Public names and referral sources (20261102000100_public_names.sql, 20261102000200_public_name_optional.sql): no name
-- until the user sets one (then no "Asked by"); public_names
-- shows it only for live share links; set_public_name is service_role only and refuses contact details and our name;
-- add_friend_referral keeps the shared video's slug and whether it was the referrer's own. Expected values by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(18);

create function pg_temp.video(p_user uuid, p_q text) returns uuid language plpgsql as $$
declare g uuid := pg_temp.gid(pg_temp.reserve(p_user, gen_random_uuid(), 'whiteboard', p_q));
begin
  if g is null or pg_temp.finish(g, 150, 'whiteboard',
       format('{"clips":[{"path":"%s/%s/0.mp3","durS":3.2,"words":[["Step",0,0.4]]}]}', p_user, g)::jsonb) not like 'settled:%' then
    raise exception 'video failed';
  end if;
  return g;
end $$;
create function pg_temp.share(p_user uuid, p_g uuid) returns text language sql as $$
  select pg_temp.as_user(p_user, format('select slug from public.create_share(%L)', p_g)) $$;
create function pg_temp.setname(p_user uuid, p_name text) returns text language sql as $$
  select pg_temp.svc(format('select public.set_public_name(%L::uuid, %L)', p_user, p_name)) $$;

select pg_temp.new_user('pn_a') as a \gset
select pg_temp.new_user('pn_b') as b \gset
select pg_temp.new_user('pn_f1') as f1 \gset
select pg_temp.new_user('pn_f2') as f2 \gset
select pg_temp.new_user('pn_f3') as f3 \gset
select pg_temp.give(:'a', 0, 10) is null as x \gset
select pg_temp.share(:'a', pg_temp.video(:'a', 'Why is the sky blue?')) as slug \gset

select is((select public_name from public.profiles where id = :'a'), null, 'a new account has no name');
select is(pg_temp.anon(format('select count(*)::text from public.public_names(array[%L])', :'slug')), '0',
  'no name: public_names gives nothing for its share link (no "Asked by")');
select is(pg_temp.anon($$select count(*)::text from public.public_names(array['AAAAAAAAAAAAAAAAAAAAAA'])$$), '0',
  'an unknown slug gives nothing');

select is(pg_temp.setname(:'a', '  Rafi   K.  '), 'ok', 'service_role sets a name');
select is((select public_name from public.profiles where id = :'a'), 'Rafi K.', '... trimmed and single-spaced');
select is(pg_temp.anon(format('select name from public.public_names(array[%L])', :'slug')), 'Rafi K.',
  'anon reads the name of a live share link once it is set');
select is(pg_temp.setname(:'a', 'x'), 'invalid', 'too short is refused');
select is(pg_temp.setname(:'b', '   '), 'ok', 'empty clears the name (none shown)');
select is(pg_temp.setname(:'a', repeat('a', 31)), 'invalid', 'too long is refused');
select is(pg_temp.setname(:'a', '<script>'), 'invalid', 'markup characters are refused');
select is(pg_temp.setname(:'a', 'call 555 123 4567'), 'contact_info', 'a phone number is refused');
select is(pg_temp.setname(:'a', 'Ask Radlor Team'), 'reserved', 'our name is refused');
select is(pg_temp.as_user(:'a', format('select public.set_public_name(%L::uuid, %L)', :'b', 'Hacked')),
  'ERROR 42501: permission denied for function set_public_name', 'a signed-in user cannot call it (nor rename someone else)');

-- Referrals: from A's own video, from someone else's video shared with A's code, from the plain invite link.
select friend_code as code from public.profiles where id = :'a' \gset
select pg_temp.give(:'b', 0, 10) is null as x \gset
select pg_temp.share(:'b', pg_temp.video(:'b', 'What is osmosis?')) as bslug \gset
select is(pg_temp.svc(format('select public.add_friend_referral(%L::uuid, %L, %L)::text', :'f1', :'code', :'slug')), 'true',
  'a sign-up from A''s own video link is kept');
select is(pg_temp.svc(format('select public.add_friend_referral(%L::uuid, %L, %L)::text', :'f2', :'code', :'bslug')), 'true',
  'a sign-up from B''s video shared with A''s code is kept');
select is(pg_temp.svc(format('select public.add_friend_referral(%L::uuid, %L)::text', :'f3', :'code')), 'true',
  'the 2-argument call (plain invite link, the live code) still works');
select is((select string_agg(coalesce(own_video::text, 'null') || '/' || (via_slug is not null)::text, ',' order by
            case friend when :'f1'::uuid then 1 when :'f2'::uuid then 2 else 3 end) from public.friend_referrals where referrer = :'a'),
  'true/true,false/true,null/false', 'own video / someone else''s video / invite link are told apart');
select is(pg_temp.svc(format('select public.add_friend_referral(%L::uuid, %L, %L)::text', :'b', :'code', 'not-a-slug')), 'true',
  'a bad slug never blocks the referral ...');

select * from finish();
rollback;
