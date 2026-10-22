-- One price for every level (founder, 22 Oct 2026): Plus $13.99 = 70 videos a month, Pro $25.99 = 150, taught at the
-- chat's level (level 'grad' = no cap, videos.ts taughtLevel). The per-level plans go off sale. Packs back on sale as
-- 20 / 45 / 100 videos at $4.99 / $9.99 / $19.99 (the old 60 / 132 / 282 lost money at 1 credit = 1 video; their rows
-- stay off sale for the purchase history). Planning cost $0.12 a video: every row keeps a profit after Stripe.
update public.price_catalog set credits = 70, unit_amount_cents = 1399, level = 'grad' where price_key = 'plus';
update public.price_catalog set credits = 150, unit_amount_cents = 2599, level = 'grad' where price_key = 'pro';
update public.price_catalog set active = false
  where price_key in ('plus_college', 'pro_college', 'plus_grad', 'pro_grad');
insert into public.price_catalog (price_key, kind, credits, unit_amount_cents, active) values
  ('topup_20', 'topup', 20, 499, true), ('topup_45', 'topup', 45, 999, true), ('topup_100', 'topup', 100, 1999, true);
