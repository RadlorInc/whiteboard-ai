-- M1 / PLAN.md §11.9 (D13): metrics from our own tables, pre-registered here with their SQL.
-- Security change: adds SECURITY DEFINER functions admin_metrics and admin_top_misses (authenticated, is_admin()
-- first), owned by postgres with search_path = ''.
--
-- Pre-registered meanings (by weekly sign-up cohort and signup_source; the smoke user is left out):
--   conversion = paid_7d / signups          sign-ups whose first payment came within 7 days of sign-up
--   activation = activated / payers         payers with >= 3 succeeded videos within 7 days of their first payment
--   retention  = retained_m2 / subscribers  subscribers with a subscription_cycle invoice paid within 62 days of
--                                           their first subscription_create invoice (month 2)
--   packs      = pack_repeat_30d / pack_buyers   a second top-up within 30 days of the first
-- Read: a ratio under half of the one before it in this list is the first thing to fix.
create function public.admin_metrics(p_weeks int)
returns table(cohort_week date, source text, signups int, paid_7d int, payers int, activated int, subscribers int,
              retained_m2 int, pack_buyers int, pack_repeat_30d int)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return query
  with u as (
    select p.id, date_trunc('week', p.created_at at time zone 'utc')::date wk, coalesce(p.signup_source, 'unknown') src,
           p.created_at,
           (select min(x.created_at) from public.purchases x where x.user_id = p.id) first_pay,
           (select min(x.created_at) from public.purchases x where x.user_id = p.id
              and x.billing_reason = 'subscription_create') first_sub,
           (select min(x.created_at) from public.purchases x where x.user_id = p.id and x.kind = 'topup') first_pack
      from public.profiles p
     where p.created_at >= now() - make_interval(weeks => least(greatest(coalesce(p_weeks, 12), 1), 104))
       and p.id is distinct from (select smoke_user_id from public.ops_settings where id))
  select u.wk, u.src, count(*)::int,
         count(*) filter (where u.first_pay <= u.created_at + interval '7 days')::int,
         count(u.first_pay)::int,
         count(*) filter (where u.first_pay is not null and (select count(*) from public.generations g
             where g.user_id = u.id and g.status in ('succeeded','refunded')
               and g.created_at between u.first_pay and u.first_pay + interval '7 days') >= 3)::int,
         count(u.first_sub)::int,
         count(*) filter (where exists (select 1 from public.purchases x where x.user_id = u.id
             and x.billing_reason = 'subscription_cycle' and x.created_at <= u.first_sub + interval '62 days'))::int,
         count(u.first_pack)::int,
         count(*) filter (where (select count(*) from public.purchases x where x.user_id = u.id and x.kind = 'topup'
             and x.created_at <= u.first_pack + interval '30 days') >= 2)::int
    from u group by u.wk, u.src order by u.wk desc, u.src;
end $$;

-- The library's growth list (/admin/misses): id-free daily counts, so it survives every deletion.
create function public.admin_top_misses(p_days int default 30) returns table(name text, n bigint)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return query select m.name, sum(m.n)::bigint from public.miss_counts m
    where m.day >= (now() at time zone 'utc')::date - least(greatest(coalesce(p_days, 30), 1), 366)
    group by m.name order by 2 desc, 1 limit 50;
end $$;

revoke all on function public.admin_metrics(int)    from public, anon, authenticated, service_role;
revoke all on function public.admin_top_misses(int) from public, anon, authenticated, service_role;
grant execute on function public.admin_metrics(int)    to authenticated;
grant execute on function public.admin_top_misses(int) to authenticated;
