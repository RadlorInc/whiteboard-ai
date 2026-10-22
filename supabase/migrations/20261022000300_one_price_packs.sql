-- One price for every level (founder, 22 Oct 2026): Plus $13.99 = 70 videos a month, Pro $25.99 = 150, taught at the
-- chat's level (level 'grad' = no cap, videos.ts taughtLevel). New keys plus_all / pro_all; the per-level plans go off
-- sale (their rows stay for old webhooks and the purchase history). Packs back on sale as 20 / 45 / 100 videos at
-- $4.99 / $9.99 / $19.99 (the old 60 / 132 / 282 lost money at 1 credit = 1 video). At $0.12 a video every row keeps a
-- profit after Stripe.
update public.price_catalog set active = false where kind = 'subscription';
insert into public.price_catalog (price_key, kind, credits, unit_amount_cents, active, level) values
  ('plus_all', 'subscription', 70, 1399, true, 'grad'), ('pro_all', 'subscription', 150, 2599, true, 'grad'),
  ('topup_20', 'topup', 20, 499, true, 'school'), ('topup_45', 'topup', 45, 999, true, 'school'),
  ('topup_100', 'topup', 100, 1999, true, 'school');
alter table public.credit_balances drop constraint credit_balances_sub_plan_check,
  add constraint credit_balances_sub_plan_check
  check (sub_plan in ('plus','pro','plus_college','pro_college','plus_grad','pro_grad','plus_all','pro_all'));
