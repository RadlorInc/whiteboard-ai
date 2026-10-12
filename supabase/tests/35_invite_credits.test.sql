-- Invite credits (20261013001300_invite_credits.sql): 100 top-up credits on first access through an invite code,
-- once per user, never for a bad code or for access granted another way; the ledger still adds up. Expected values
-- are written by hand.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(12);

-- A new account still waiting for access (new_user grants it; take it back), and two invite codes.
select pg_temp.new_user('inv1') as u1 \gset
update public.profiles set access_granted_at = null where id = :'u1';
insert into public.invites (code, max_uses, note) values ('INV-ONE', 1, 'test'), ('INV-TWO', 5, 'test');
create function pg_temp.redeem(p_user uuid, p_code text) returns text language sql as $$
  select pg_temp.as_user(p_user, format('select public.redeem_invite(%L)::text', p_code)) $$;
create function pg_temp.topup(p_user uuid) returns int language sql as $$
  select topup from public.credit_balances where user_id = p_user $$;

select is(pg_temp.topup(:'u1'), 0, 'a new account starts with no top-up credits');
select is(pg_temp.redeem(:'u1', 'NOPE'), 'false', 'a wrong code is refused');
select is(pg_temp.topup(:'u1'), 0, '... and gives nothing');
select is(pg_temp.redeem(:'u1', 'INV-ONE'), 'true', 'a good code gives access');
select is(pg_temp.topup(:'u1'), 100, '... and 100 top-up credits');
select is((select count(*)::int from public.credit_ledger where user_id = :'u1' and kind = 'invite_grant' and topup_delta = 100
            and sub_delta = 0 and held_delta = 0), 1, '... written as one invite_grant ledger row');
select is(pg_temp.redeem(:'u1', 'INV-TWO'), 'true', 'redeeming a second code once you have access returns true');
select is(pg_temp.topup(:'u1'), 100, '... and gives no second 100');
select is((select used from public.invites where code = 'INV-TWO'), 0, '... nor uses up the second code');

-- Access granted another way (an admin, or the seed) never brings invite credits.
select pg_temp.new_user('inv2') as u2 \gset
select is(pg_temp.redeem(:'u2', 'INV-TWO'), 'true', 'someone who already has access redeems a code');
select is(pg_temp.topup(:'u2'), 0, '... and gets no credits (access did not come from the invite)');

-- The ledger and the balances still agree for everyone.
select is((select count(*)::int from public.credit_drift()), 0, 'credit_drift finds no account whose balance differs from its ledger');

select * from finish();
rollback;
