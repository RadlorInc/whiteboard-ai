-- Free tier (20261020000400_free_tier.sql, 20261022000100_free_20_friends.sql): free_videos free videos once (failed
-- ones do not use one), plus 10 for each of up to 2 invited friends who made a video, then 1 video from a plan; none
-- left -> insufficient, no retry_at; admins pay nothing and skip the per-user
-- limits; a free video cannot be refunded; the catalog is in videos and packs are off sale. Expected values by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(30);

update public.ops_settings set free_videos = 2, slow_1_after = 1000, slow_2_after = 1000 where id;
select pg_temp.new_user('free1') as u \gset
-- 1 video from a pack, kept for after the free ones
select pg_temp.give(:'u', 0, 1) is null as f \gset
create temp table k (n text primary key, id uuid);
create function pg_temp.k(p text) returns uuid language sql as $$ select id from k where n = p $$;
create function pg_temp.res(p_user uuid, p_n text) returns text language sql as $$
  insert into k values (p_n, pg_temp.gid(pg_temp.reserve(p_user))) on conflict (n) do update set id = excluded.id;
  select (select paid_with || ':' || credits_reserved from public.generations where id = pg_temp.k(p_n)) $$;

select is(pg_temp.res(:'u', 'f1'), 'free:0', 'the 1st video is free: nothing held');
select is(pg_temp.finish(pg_temp.k('f1'), 450), 'settled:0:1', '... and charged 0 (the pack is untouched)');
select is(pg_temp.res(:'u', 'f2'), 'free:0', 'the 2nd is free');
select is(pg_temp.fail(pg_temp.k('f2'), 'timeout'), 'released:1', '... it fails: nothing to give back');
select is(pg_temp.res(:'u', 'f3'), 'free:0', 'a failed free video does not use one up: the next is still free');
select is(pg_temp.finish(pg_temp.k('f3'), 150), 'settled:0:1', '... charged 0');
select is(pg_temp.res(:'u', 'p1'), 'credit:1', 'free ones used: the next holds 1 from the pack');
select is(pg_temp.finish(pg_temp.k('p1'), 900), 'settled:1:0', '... charged 1, whatever its length');
select is(pg_temp.reserve(:'u'), 'insufficient::0', 'nothing left -> insufficient, no retry_at (free videos do not come back)');
select is(pg_temp.as_admin('aal2', format('select public.admin_refund_generation(%L, %L, gen_random_uuid())::text', pg_temp.k('f1'), 'testing the free tier')),
  'ERROR P0001: not refundable', 'a free video cannot be refunded (it cost nothing)');

-- Admins: no hold, no per-user limit, no plan needed.
update public.ops_settings set user_daily_cap = 1 where id;
select is(pg_temp.res(pg_temp.uadmin(), 'a1'), 'admin:0', 'an admin with no videos: paid_with admin, nothing held');
select is(pg_temp.finish(pg_temp.k('a1'), 300), 'settled:0:0', '... charged 0');
select is(pg_temp.res(pg_temp.uadmin(), 'a2'), 'admin:0', '... and past the daily cap of 1, still allowed');
select is(pg_temp.finish(pg_temp.k('a2'), 300), 'settled:0:0', '... charged 0');

-- Settings, catalog, conversion kind, drift.
select is(pg_temp.as_admin('aal2', $$select public.admin_set_settings('{"free_videos": 5}'::jsonb, 'testing the free tier', gen_random_uuid())::text$$),
  'true', 'free_videos is set from /admin');
select is((select free_videos from public.ops_settings where id), 5, '... and stored');
select is((select string_agg(price_key || '=' || credits || ':' || unit_amount_cents || ':' || level || ':' || active, ',' order by price_key) from public.price_catalog),
  'plus=40:999:school:false,plus_all=70:1399:grad:true,plus_college=40:1399:undergrad:false,plus_grad=40:1399:grad:false,'
  || 'pro=100:1999:school:false,pro_all=150:2599:grad:true,pro_college=100:2599:undergrad:false,pro_grad=100:2599:grad:false,'
  || 'topup_100=100:1999:school:true,topup_132=132:999:school:false,topup_20=20:499:school:true,topup_282=282:1999:school:false,'
  || 'topup_45=45:999:school:true,topup_60=60:499:school:false', 'one plan pair for every level (70, 150); packs 20 / 45 / 100 on sale, old ones off');
select is(pg_temp.svc(format('select public._ledger(%L, %L, 0, -1, 0)::text', pg_temp.ua(), 'convert')) ~ '^[0-9]+$', false,
  'service_role cannot write the ledger directly');
select pg_temp.new_user('college1') as c \gset
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_ft_c1', 'invoice.paid', now(), false, %L, 'in_ft_c1', 'sub_ft_c',
  'subscription_create', 'plus_college', 1399, 1399, now() + interval '30 days')$f$, 'cus_t_college1')), 'applied', 'College Plus is bought');
select is((select sub || ':' || sub_plan from public.credit_balances where user_id = :'c'), '40:plus_college', '... 40 videos, plan plus_college');
select is(pg_temp.drift(), '0', 'credit_drift is empty');

-- Friend links (20261022000100): +10 free per invited friend who made a video, at most 2 friends; abuse limits.
create function pg_temp.refer(p_friend uuid, p_code text) returns text language sql as $$
  select pg_temp.svc(format('select public.add_friend_referral(%L::uuid, %L)::text', p_friend, p_code)) $$;
create function pg_temp.fv(p_user uuid) returns text language sql as $$
  select pg_temp.svc(format('select total || '':'' || used || '':'' || friends from public.free_videos(%L::uuid)', p_user)) $$;
select pg_temp.new_user('inv1') as i \gset
select friend_code as code from public.profiles where id = :'i' \gset
select pg_temp.new_user('fr1') as f1 \gset
select pg_temp.new_user('fr2') as f2 \gset
select pg_temp.new_user('fr3') as f3 \gset
select is(pg_temp.refer(:'i', :'code'), 'false', 'no self-invite');
select is(pg_temp.refer(:'f1', 'nope'), 'false', 'a bad code is ignored');
select is(pg_temp.refer(:'f1', :'code'), 'true', 'a new account through a friend link is kept');
select is(pg_temp.refer(:'f1', (select friend_code from public.profiles where id = :'c')), 'false', '... once: one inviter per account');
select is(pg_temp.fv(:'i'), '5:0:0', 'the friend has made no video yet: no bonus');
select pg_temp.finish(pg_temp.gid(pg_temp.reserve(:'f1')), 300) is null as x \gset
select is(pg_temp.fv(:'i'), '15:0:1', 'the friend made a video: +10 free at once');
select pg_temp.refer(:'f2', :'code') is null as x \gset
select pg_temp.refer(:'f3', :'code') is null as x \gset
select pg_temp.finish(pg_temp.gid(pg_temp.reserve(:'f2')), 300) is null as x \gset
select pg_temp.finish(pg_temp.gid(pg_temp.reserve(:'f3')), 300) is null as x \gset
select is(pg_temp.fv(:'i'), '25:0:2', '3 friends made a video: the bonus stops at 2 friends');
select is(pg_temp.svc(format('select count(*)::text from public.friend_referrals where referrer = %L', :'i')), '3', 'service_role reads friend_referrals');
select is(pg_temp.as_user(:'i', 'select count(*)::text from public.friend_referrals'), 'ERROR 42501: permission denied for table friend_referrals',
  'a signed-in user cannot read friend_referrals');

select * from finish();
rollback;
