-- Free tier (20261020000400_free_tier.sql): free_videos_monthly free videos a month (failed ones do not use one), then 1
-- video from a plan; none left -> insufficient with retry_at = next month; admins pay nothing and skip the per-user
-- limits; a free video cannot be refunded; the catalog is in videos and packs are off sale. Expected values by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(21);

update public.ops_settings set free_videos_monthly = 2, slow_1_after = 1000, slow_2_after = 1000 where id;
select pg_temp.new_user('free1') as u \gset
-- 1 video from a pack, kept for after the free ones
select pg_temp.give(:'u', 0, 1) is null as f \gset
create temp table k (n text primary key, id uuid);
create function pg_temp.k(p text) returns uuid language sql as $$ select id from k where n = p $$;
create function pg_temp.res(p_user uuid, p_n text) returns text language sql as $$
  insert into k values (p_n, pg_temp.gid(pg_temp.reserve(p_user))) on conflict (n) do update set id = excluded.id;
  select (select paid_with || ':' || credits_reserved from public.generations where id = pg_temp.k(p_n)) $$;

select is(pg_temp.res(:'u', 'f1'), 'free:0', 'the 1st video of the month is free: nothing held');
select is(pg_temp.finish(pg_temp.k('f1'), 450), 'settled:0:1', '... and charged 0 (the pack is untouched)');
select is(pg_temp.res(:'u', 'f2'), 'free:0', 'the 2nd is free');
select is(pg_temp.fail(pg_temp.k('f2'), 'timeout'), 'released:1', '... it fails: nothing to give back');
select is(pg_temp.res(:'u', 'f3'), 'free:0', 'a failed free video does not use one up: the next is still free');
select is(pg_temp.finish(pg_temp.k('f3'), 150), 'settled:0:1', '... charged 0');
select is(pg_temp.res(:'u', 'p1'), 'credit:1', 'free ones used: the next holds 1 from the pack');
select is(pg_temp.finish(pg_temp.k('p1'), 900), 'settled:1:0', '... charged 1, whatever its length');
select is(pg_temp.reserve(:'u'), 'insufficient::0:' || (date_trunc('month', now() at time zone 'utc') at time zone 'utc' + interval '1 month'),
  'nothing left -> insufficient, retry_at = the 1st of next month (UTC)');
select is(pg_temp.as_admin('aal2', format('select public.admin_refund_generation(%L, %L, gen_random_uuid())::text', pg_temp.k('f1'), 'testing the free tier')),
  'ERROR P0001: not refundable', 'a free video cannot be refunded (it cost nothing)');

-- Admins: no hold, no per-user limit, no plan needed.
update public.ops_settings set user_daily_cap = 1 where id;
select is(pg_temp.res(pg_temp.uadmin(), 'a1'), 'admin:0', 'an admin with no videos: paid_with admin, nothing held');
select is(pg_temp.finish(pg_temp.k('a1'), 300), 'settled:0:0', '... charged 0');
select is(pg_temp.res(pg_temp.uadmin(), 'a2'), 'admin:0', '... and past the daily cap of 1, still allowed');
select is(pg_temp.finish(pg_temp.k('a2'), 300), 'settled:0:0', '... charged 0');

-- Settings, catalog, conversion kind, drift.
select is(pg_temp.as_admin('aal2', $$select public.admin_set_settings('{"free_videos_monthly": 5}'::jsonb, 'testing the free tier', gen_random_uuid())::text$$),
  'true', 'free_videos_monthly is set from /admin');
select is((select free_videos_monthly from public.ops_settings where id), 5, '... and stored');
select is((select string_agg(price_key || '=' || credits || ':' || unit_amount_cents || ':' || level || ':' || active, ',' order by price_key) from public.price_catalog),
  'plus=40:999:school:true,plus_college=40:1399:undergrad:true,plus_grad=40:1399:grad:true,pro=100:1999:school:true,'
  || 'pro_college=100:2599:undergrad:true,pro_grad=100:2599:grad:true,topup_132=132:999:school:false,topup_282=282:1999:school:false,'
  || 'topup_60=60:499:school:false', 'plans in videos, a pair per level (40, 100); packs off sale');
select is(pg_temp.svc(format('select public._ledger(%L, %L, 0, -1, 0)::text', pg_temp.ua(), 'convert')) ~ '^[0-9]+$', false,
  'service_role cannot write the ledger directly');
select pg_temp.new_user('college1') as c \gset
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_ft_c1', 'invoice.paid', now(), false, %L, 'in_ft_c1', 'sub_ft_c',
  'subscription_create', 'plus_college', 1399, 1399, now() + interval '30 days')$f$, 'cus_t_college1')), 'applied', 'College Plus is bought');
select is((select sub || ':' || sub_plan from public.credit_balances where user_id = :'c'), '40:plus_college', '... 40 videos, plan plus_college');
select is(pg_temp.drift(), '0', 'credit_drift is empty');

select * from finish();
rollback;
