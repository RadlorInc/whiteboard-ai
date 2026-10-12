-- Local seed (PLAN.md §6, §8.1): users A and B, an admin, and credits. LOCAL STACK ONLY.
-- Credits enter exactly as in production: through the stripe_* functions with fake event ids, so the ledger,
-- purchases and balances agree and credit_drift() is empty.
--   A  a@example.test      18+, invited, Plus (sub 150, expires in 33 days) + a 60-credit pack (top-up 60)
--   B  b@example.test      18+, invited, a 132-credit pack (top-up 132)
--   admin@example.test     18+, invited, in public.admins, no credits (admin functions also need aal2)

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token,
  recovery_token, email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email, '', now(), '', '', '', '',
       '{"provider":"email","providers":["email"]}', '{}', now(), now()
  from (values ('00000000-0000-4000-8000-00000000000a'::uuid, 'a@example.test'),
               ('00000000-0000-4000-8000-00000000000b'::uuid, 'b@example.test'),
               ('00000000-0000-4000-8000-0000000000ad'::uuid, 'admin@example.test')) u(id, email);

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now()
  from auth.users where email in ('a@example.test', 'b@example.test', 'admin@example.test');

insert into public.admins (user_id) values ('00000000-0000-4000-8000-0000000000ad');

do $$
declare
  a uuid := '00000000-0000-4000-8000-00000000000a';
  b uuid := '00000000-0000-4000-8000-00000000000b';
  ad uuid := '00000000-0000-4000-8000-0000000000ad';
  v text;
begin
  foreach v in array array[a::text, b::text, ad::text] loop
    if public.complete_signup(v::uuid, 2000, 1, 'age-v1', public.current_terms_version(), 'direct') <> 'ok' then
      raise exception 'seed: complete_signup failed';
    end if;
  end loop;
  -- Invite mode is the default: the seed users are let in (what admin_grant_access does).
  update public.profiles set access_granted_at = now() where id in (a, b, ad);

  perform public.link_stripe_customer(a, 'cus_seed_a');
  perform public.link_stripe_customer(b, 'cus_seed_b');
  v := public.stripe_invoice_paid('evt_seed_a_plus', 'invoice.paid', now(), false, 'cus_seed_a', 'in_seed_a_plus',
         'sub_seed_a', 'subscription_create', 'plus', 999, 999, now() + interval '30 days', 'pi_seed_a_plus');
  if v <> 'applied' then raise exception 'seed: plus %', v; end if;
  v := public.stripe_subscription_sync('evt_seed_a_sub', 'customer.subscription.created', now(), false, 'cus_seed_a',
         'sub_seed_a', 'active', 'plus', now() + interval '30 days', false, null);
  if v <> 'applied' then raise exception 'seed: subscription %', v; end if;
  v := public.stripe_topup_paid('evt_seed_a_top', 'checkout.session.completed', now(), false, 'cus_seed_a', a::text,
         'cs_seed_a_60', 'pi_seed_a_60', 'topup_60', 499, 1, 'usd', 499);
  if v <> 'applied' then raise exception 'seed: topup A %', v; end if;
  v := public.stripe_topup_paid('evt_seed_b_top', 'checkout.session.completed', now(), false, 'cus_seed_b', b::text,
         'cs_seed_b_132', 'pi_seed_b_132', 'topup_132', 999, 1, 'usd', 999);
  if v <> 'applied' then raise exception 'seed: topup B %', v; end if;
  if exists (select 1 from public.credit_drift()) then raise exception 'seed: credit drift'; end if;
end $$;
