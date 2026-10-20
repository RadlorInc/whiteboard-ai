-- Invites (20261013001300_invite_credits.sql, changed by 20261020000400_free_tier.sql): a good code gives access
-- once; since the free tier (10 free videos a month) it gives no credits. Old invite_grant rows stay in the ledger.
-- Expected values are written by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(9);

-- A new account still waiting for access (new_user grants it; take it back), and two invite codes.
select pg_temp.new_user('inv1') as u1 \gset
update public.profiles set access_granted_at = null where id = :'u1';
insert into public.invites (code, max_uses, note) values ('INV-ONE', 1, 'test'), ('INV-TWO', 5, 'test');
create function pg_temp.redeem(p_user uuid, p_code text) returns text language sql as $$
  select pg_temp.as_user(p_user, format('select public.redeem_invite(%L)::text', p_code)) $$;
create function pg_temp.topup(p_user uuid) returns int language sql as $$
  select topup from public.credit_balances where user_id = p_user $$;

select is(pg_temp.redeem(:'u1', 'NOPE'), 'false', 'a wrong code is refused');
select is((select access_granted_at from public.profiles where id = :'u1'), null::timestamptz, '... and gives no access');
select is(pg_temp.redeem(:'u1', 'INV-ONE'), 'true', 'a good code gives access');
select isnt((select access_granted_at from public.profiles where id = :'u1'), null::timestamptz, '... access is on');
select is(pg_temp.topup(:'u1'), 0, '... and no credits any more (free tier: 10 free videos a month instead)');
select is((select count(*)::int from public.credit_ledger where user_id = :'u1'), 0, '... no ledger row');
select is(pg_temp.redeem(:'u1', 'INV-TWO'), 'true', 'redeeming a second code once you have access returns true');
select is((select used from public.invites where code = 'INV-TWO'), 0, '... and does not use up the second code');

-- The ledger and the balances still agree for everyone.
select is((select count(*)::int from public.credit_drift()), 0, 'credit_drift finds no account whose balance differs from its ledger');

select * from finish();
rollback;
