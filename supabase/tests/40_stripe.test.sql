-- PLAN.md §12.3 40_stripe and the DB side of §8.10A: the stripe_* functions as service_role (the webhook route's
-- only DB calls). Expected credits are typed by hand from §8.4–8.6.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(100);

create temp table users (k text primary key, id uuid);
create function pg_temp.u(p_k text) returns uuid language sql as $$ select id from users where k = p_k $$;
create function pg_temp.mk(p_k text) returns uuid language plpgsql as $$
declare v uuid := pg_temp.new_user(p_k); begin insert into users values (p_k, v); return v; end $$;
-- "Spent" credits as a fixture: a forfeit through _ledger (keeps ledger and cache equal).
create function pg_temp.spend(p_k text, p_sub int, p_topup int) returns void language sql as $$
  select public._ledger(pg_temp.u(p_k), 'forfeit', -p_sub, -p_topup, 0)::int; select null::void $$;

create function pg_temp.topup(p_evt text, p_k text, p_cs text, p_pi text, p_key text, p_unit int,
  p_type text default 'checkout.session.completed', p_ref text default null) returns text language sql as $$
  select pg_temp.svc(format('select public.stripe_topup_paid(%L, %L, now(), false, %L, %L, %L, %L, %L, %L, 1, %L, %L)',
    p_evt, p_type, 'cus_t_' || p_k, coalesce(p_ref, pg_temp.u(p_k)::text), p_cs, p_pi, p_key, p_unit, 'usd', p_unit)) $$;
create function pg_temp.invoice(p_evt text, p_k text, p_in text, p_sub text, p_reason text, p_key text, p_line int,
  p_period_end timestamptz, p_pi text default null) returns text language sql as $$
  select pg_temp.svc(format('select public.stripe_invoice_paid(%L, %L, now(), false, %L, %L, %L, %L, %L, %L, %L, %L::timestamptz, %L)',
    p_evt, 'invoice.paid', 'cus_t_' || p_k, p_in, p_sub, p_reason, p_key, p_line, p_line, p_period_end, p_pi)) $$;
create function pg_temp.subsync(p_evt text, p_k text, p_sub text, p_status text, p_key text, p_created timestamptz,
  p_type text default 'customer.subscription.updated') returns text language sql as $$
  select pg_temp.svc(format('select public.stripe_subscription_sync(%L, %L, %L::timestamptz, false, %L, %L, %L, %L, now() + interval ''30 days'', false, null)',
    p_evt, p_type, p_created, 'cus_t_' || p_k, p_sub, p_status, p_key)) $$;
create function pg_temp.rev(p_evt text, p_type text, p_pi text, p_in text, p_refunded int, p_dispute text,
  p_created timestamptz default now()) returns text language sql as $$
  select pg_temp.svc(format('select public.stripe_reverse(%L, %L, %L::timestamptz, false, %L, %L, %L, %L, %L)',
    p_evt, p_type, p_created, p_pi, p_in, p_refunded, p_dispute, coalesce(p_pi, p_in))) $$;
create function pg_temp.kinds(p_k text) returns text language sql as $$
  select string_agg(kind || coalesce('(' || nullif(sub_delta, 0) || ')', '') || coalesce('[' || nullif(topup_delta, 0) || ']', '')
                    || coalesce('{u' || nullif(uncollected, 0) || '}', ''), ',' order by id)
    from public.credit_ledger where user_id = pg_temp.u(p_k) $$;

-- 1–3. Top-up paid; the same event twice; completed + async_payment_succeeded for one session.
select pg_temp.mk('s1') is not null as f \gset
select is(pg_temp.topup('evt_s1', 's1', 'cs_s1', 'pi_s1', 'topup_60', 499), 'applied', '1. topup_60 paid -> applied');
select is(pg_temp.bal(pg_temp.u('s1')) || ' ' || pg_temp.kinds('s1'), '0/60/0 grant_topup[60]', '... top-up 60, one grant_topup +60');
select is(pg_temp.topup('evt_s1', 's1', 'cs_s1', 'pi_s1', 'topup_60', 499), 'duplicate', '2. the same event id again -> duplicate');
select is(pg_temp.topup('evt_s1b', 's1', 'cs_s1', 'pi_s1', 'topup_60', 499, 'checkout.session.async_payment_succeeded'),
  'duplicate', '3. async_payment_succeeded for the same session (new event id) -> duplicate');
select is(pg_temp.bal(pg_temp.u('s1')) || ' ' || (select count(*) from public.purchases where user_id = pg_temp.u('s1')),
  '0/60/0 1', '... still 60, one purchase');
select is((select string_agg(id || '=' || outcome, ',' order by id) from public.stripe_events where id like 'evt_s1%'),
  'evt_s1=applied,evt_s1b=duplicate', '... the replay wrote nothing; the second event id is recorded as duplicate');

-- 4 and 30. A mis-mapped price grants nothing and alerts, once per object.
select is(pg_temp.topup('evt_s4a', 's1', 'cs_s4a', 'pi_s4a', 'topup_282', 499), 'needs_review:amount_mismatch',
  '4. topup_282 paid at 499 -> needs_review:amount_mismatch');
select is(pg_temp.topup('evt_s4b', 's1', 'cs_s4b', 'pi_s4b', 'topup_60', 498), 'needs_review:amount_mismatch',
  '30. a second mismatch the same day');
select is(pg_temp.bal(pg_temp.u('s1')), '0/60/0', '... 0 credits from either');
select is((select string_agg(kind, ',' order by kind) from public.ops_alerts where kind like 'needs_review:amount_mismatch:%'),
  'needs_review:amount_mismatch:cs_s4a,needs_review:amount_mismatch:cs_s4b', '... two alerts, each naming its object');
select is((select count(*)::int from public.stripe_events where outcome like 'needs_review%' and resolved_at is null
            and id in ('evt_s4a','evt_s4b')), 2, '... two open rows in the /admin/billing queue');
select is(pg_temp.topup('evt_s1u', 's1', 'cs_s1u', 'pi_s1u', 'topup_60', 499, 'checkout.session.completed', gen_random_uuid()::text),
  'needs_review:user_mismatch', 'client_reference_id of another user -> needs_review:user_mismatch, no grant');

-- 5, 18, 6. invoice.paid before customer.subscription.created; payment failed; renewal with 40 left.
select pg_temp.mk('s5') is not null as f \gset
select is(pg_temp.invoice('evt_s5a', 's5', 'in_s5a', 'sub_s5', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s5a'),
  'applied', '5. invoice.paid (subscription_create, Plus) before the subscription exists -> applied');
select is((select sub || ':' || (sub_expires_at = now() + interval '33 days') || ':' || sub_plan || ':' || sub_cycle
             from public.credit_balances where user_id = pg_temp.u('s5')), '150:true:plus:1', '... sub 150, expiry = period end + 3 d');
select is((select count(*)::int from public.subscriptions where user_id = pg_temp.u('s5')), 0, '... no subscription row yet');
select is(pg_temp.subsync('evt_s5b', 's5', 'sub_s5', 'active', 'plus', now(), 'customer.subscription.created'), 'applied',
  'then customer.subscription.created -> applied');
select is((select status || ':' || price_key from public.subscriptions where user_id = pg_temp.u('s5')), 'active:plus', '... the row appears');
select is((select count(*)::int from public.email_outbox where kind = 'sub_confirmation' and dedupe_key = 'in_s5a'), 1,
  'the first subscription_create queues one sub_confirmation email');
select is(pg_temp.invoice('evt_s5a', 's5', 'in_s5a', 'sub_s5', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s5a'),
  'duplicate', '... a replay of that invoice event -> duplicate');
select is((select count(*)::int from public.email_outbox where kind = 'sub_confirmation' and dedupe_key = 'in_s5a'), 1, '... still one email');
select is(pg_temp.svc(format($f$select public.stripe_payment_failed('evt_s5f', 'invoice.payment_failed', now(), false, %L, 'sub_s5', 'in_s5x')$f$,
  'cus_t_s5')), 'applied', '18. invoice.payment_failed -> applied');
select is((select (last_payment_failed_at = now())::text from public.subscriptions where stripe_subscription_id = 'sub_s5')
  || ' ' || pg_temp.bal(pg_temp.u('s5')), 'true 150/0/0', '... last_payment_failed_at set, no credit change');
select pg_temp.spend('s5', 110, 0) is null as f \gset
select is(pg_temp.invoice('evt_s5c', 's5', 'in_s5c', 'sub_s5', 'subscription_cycle', 'plus', 999, now() + interval '60 days', 'pi_s5c'),
  'applied', '6. renewal (subscription_cycle) with 40 left');
select is(pg_temp.kinds('s5'), 'grant_sub(150),forfeit(-110),expire_sub(-40),grant_sub(150)', '... expire_sub -40, then grant_sub +150');
select is((select sub || ':' || sub_cycle || ':' || (sub_expires_at = now() + interval '63 days') from public.credit_balances
             where user_id = pg_temp.u('s5')), '150:2:true', '... sub 150, sub_cycle + 1, new expiry');
select is((select credits_expired from public.purchases where stripe_invoice_id = 'in_s5a'), 40, '... the old purchase records 40 expired');
select is((select last_payment_failed_at from public.subscriptions where stripe_subscription_id = 'sub_s5'), null::timestamptz,
  '... and the paid invoice clears last_payment_failed_at');

-- 7, 8. Upgrade with 40 left (carry over); downgrade changes no credits.
select pg_temp.mk('s7') is not null as f \gset
select is(pg_temp.invoice('evt_s7a', 's7', 'in_s7a', 'sub_s7', 'subscription_create', 'plus', 999, now() + interval '30 days'),
  'applied', 'Plus starts');
select pg_temp.spend('s7', 110, 0) is null as f \gset
select is(pg_temp.invoice('evt_s7b', 's7', 'in_s7b', 'sub_s7', 'subscription_update', 'pro', 1999, now() + interval '31 days'),
  'applied', '7. upgrade (subscription_update, Pro) with 40 left');
select is((select sub || ':' || sub_plan || ':' || sub_cycle || ':' || (sub_expires_at = now() + interval '34 days')
             from public.credit_balances where user_id = pg_temp.u('s7')), '370:pro:1:true', '... sub 370, Pro, same cycle, new expiry');
select is(pg_temp.subsync('evt_s7c', 's7', 'sub_s7', 'active', 'plus', now()), 'applied', '8. downgrade: subscription.updated to Plus');
select is(pg_temp.bal(pg_temp.u('s7')) || ' ' || (select price_key from public.subscriptions where stripe_subscription_id = 'sub_s7'),
  '370/0/0 plus', '... credits unchanged; the mirror shows the pending plan');

-- 9, 20. Cancelled: the plan bucket ends now, top-up stays; a later update never revives it; a stale one is ignored.
select pg_temp.mk('s9') is not null as f \gset
select is(pg_temp.invoice('evt_s9a', 's9', 'in_s9a', 'sub_s9', 'subscription_create', 'plus', 999, now() + interval '30 days')
  || ' ' || pg_temp.subsync('evt_s9b', 's9', 'sub_s9', 'active', 'plus', now() - interval '1 minute', 'customer.subscription.created')
  || ' ' || pg_temp.topup('evt_s9c', 's9', 'cs_s9c', 'pi_s9c', 'topup_60', 499), 'applied applied applied', 'Plus + a 60 pack');
select pg_temp.spend('s9', 60, 0) is null as f \gset
select is(pg_temp.subsync('evt_s9d', 's9', 'sub_s9', 'canceled', 'plus', now(), 'customer.subscription.deleted'), 'applied',
  '9. customer.subscription.deleted with sub 90 and top-up 60');
select is(pg_temp.bal(pg_temp.u('s9')) || ' ' || (select string_agg(sub_delta::text, ',') from public.credit_ledger
            where user_id = pg_temp.u('s9') and kind = 'expire_sub'), '0/60/0 -90', '... sub 0 (expire_sub -90), top-up 60');
select is(pg_temp.subsync('evt_s9e', 's9', 'sub_s9', 'active', 'plus', now() + interval '1 minute'), 'ignored',
  '20. subscription.updated after deleted -> ignored');
select is((select status from public.subscriptions where stripe_subscription_id = 'sub_s9'), 'canceled', '... status stays canceled');
select is(pg_temp.subsync('evt_s5d', 's5', 'sub_s5', 'past_due', 'plus', now() - interval '1 day'), 'ignored',
  '20. a stale subscription.updated (older than the stored one) -> ignored');
select is((select status from public.subscriptions where stripe_subscription_id = 'sub_s5'), 'active', '... status stays active');

-- 10. Past period end + 3 d, then a late invoice for that period: the leftover expires; 150 to top-up.
select pg_temp.mk('s10') is not null as f \gset
select is(pg_temp.invoice('evt_s10a', 's10', 'in_s10a', 'sub_s10', 'subscription_create', 'plus', 999, now() + interval '30 days'),
  'applied', 'Plus starts');
update public.credit_balances set sub_expires_at = now() - interval '1 day' where user_id = pg_temp.u('s10');  -- the clock moves on
select is(public.sweep(), 0, 'the sweep runs');
select is(pg_temp.invoice('evt_s10b', 's10', 'in_s10b', 'sub_s10', 'subscription_cycle', 'plus', 999, now() - interval '4 days'),
  'applied', '10. a late invoice.paid for a period that ended over 3 days ago');
select is(pg_temp.kinds('s10') || ' ' || pg_temp.bal(pg_temp.u('s10')), 'grant_sub(150),expire_sub(-150),grant_sub_late[150] 0/150/0',
  '... the leftover expired; 150 went to top-up (grant_sub_late)');

-- 11, 26. A second subscription while the bucket is valid; its refund claws the 150 back from top-up.
select pg_temp.mk('s11') is not null as f \gset
select is(pg_temp.invoice('evt_s11a', 's11', 'in_s11a', 'sub_s11a', 'subscription_create', 'plus', 999, now() + interval '30 days'),
  'applied', 'Plus starts');
select is(pg_temp.invoice('evt_s11b', 's11', 'in_s11b', 'sub_s11b', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s11b'),
  'needs_review:second_subscription', '11. a second subscription''s invoice.paid -> needs_review:second_subscription');
select is(pg_temp.bal(pg_temp.u('s11')) || ' ' || exists (select 1 from public.ops_alerts where kind = 'needs_review:second_subscription:in_s11b'),
  '150/150/0 true', '... +150 to top-up, alerted');
select is(pg_temp.rev('evt_s11r', 'charge.refunded', 'pi_s11b', null, 999, null), 'applied',
  '26. the newer subscription''s payment refunded in full');
select is(pg_temp.bal(pg_temp.u('s11')), '150/0/0', '... the 150 clawed back from top-up; the first plan untouched');

-- 12. Full refund of a pack after spending 50: never negative; the shortfall is recorded.
select pg_temp.mk('s12') is not null as f \gset
select is(pg_temp.topup('evt_s12a', 's12', 'cs_s12', 'pi_s12', 'topup_60', 499), 'applied', 'topup_60');
select pg_temp.spend('s12', 0, 50) is null as f \gset
select is(pg_temp.rev('evt_s12r', 'charge.refunded', 'pi_s12', null, 499, null), 'applied', '12. full refund after spending 50');
select is(pg_temp.bal(pg_temp.u('s12')) || ' ' || pg_temp.kinds('s12'), '0/0/0 grant_topup[60],forfeit[-50],clawback[-10]{u50}',
  '... top-up 0, clawback -10 with uncollected 50');
select is((select credits_reversed || ':' || credits_uncollected || ':' || refunded_cents from public.purchases where checkout_session_id = 'cs_s12'),
  '60:50:499', '... the purchase records 60 reversed, 50 of them uncollected');
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.u('s12'))), 'insufficient', '... reserve -> insufficient');

-- 13. Partial refunds work on the cumulative amount: $2.00 then $4.00 total on a $9.99 Plus.
select pg_temp.mk('s13') is not null as f \gset
select is(pg_temp.invoice('evt_s13a', 's13', 'in_s13a', 'sub_s13', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s13'),
  'applied', 'Plus starts');
select is(pg_temp.rev('evt_s13r1', 'charge.refunded', 'pi_s13', null, 200, null), 'applied', '13. $2.00 refunded');
select is(pg_temp.bal(pg_temp.u('s13')), '120/0/0', '... floor(150 x 200/999) = 30 taken');
select is(pg_temp.rev('evt_s13r2', 'charge.refunded', 'pi_s13', null, 400, null), 'applied', '13. $4.00 refunded in total');
select is(pg_temp.bal(pg_temp.u('s13')), '90/0/0', '... target floor(60.06) = 60, so 30 more');
select is(pg_temp.rev('evt_s13r1', 'charge.refunded', 'pi_s13', null, 200, null), 'duplicate', 'the first refund event again -> duplicate');
select is(pg_temp.rev('evt_s13r0', 'charge.refunded', 'pi_s13', null, 200, null) || ' ' || pg_temp.bal(pg_temp.u('s13')),
  'applied 90/0/0', 'an older cumulative amount under a new event id changes nothing (greatest)');

-- 14. Dispute created, then closed:won: clawed back (limited to what is there), flags on; restored to top-up.
select pg_temp.mk('s14') is not null as f \gset
select is(pg_temp.invoice('evt_s14a', 's14', 'in_s14a', 'sub_s14', 'subscription_create', 'pro', 1999, now() + interval '30 days', 'pi_s14'),
  'applied', 'Pro starts: 330');
select pg_temp.spend('s14', 30, 0) is null as f \gset
select is(pg_temp.rev('evt_s14d', 'charge.dispute.created', 'pi_s14', null, 0, 'needs_response'), 'applied', '14. dispute created');
select is(pg_temp.bal(pg_temp.u('s14')) || ' ' || (select string_agg(kind || '(' || sub_delta || '){u' || uncollected || '}', ',')
            from public.credit_ledger where user_id = pg_temp.u('s14') and kind = 'clawback'), '0/0/0 clawback(-300){u30}',
  '... all 330 targeted: 300 taken, 30 uncollected');
select is((select generation_blocked || ':' || purchases_blocked || ':' || reason from public.account_flags where user_id = pg_temp.u('s14')),
  'true:true:dispute', '... both flags on');
select is(pg_temp.rev('evt_s14w', 'charge.dispute.closed', 'pi_s14', null, 0, 'won'), 'applied', '14. dispute closed: won');
select is(pg_temp.bal(pg_temp.u('s14')) || ' ' || (select string_agg(kind || '[' || topup_delta || ']', ',') from public.credit_ledger
            where user_id = pg_temp.u('s14') and kind = 'dispute_restore'), '0/300/0 dispute_restore[300]',
  '... what was taken (300) comes back to top-up');
select is((select generation_blocked || ':' || purchases_blocked from public.account_flags where user_id = pg_temp.u('s14')),
  'true:true', '... the flags stay until the founder clears them');

-- 15. closed:won delivered before created: no reversal at all.
select pg_temp.mk('s15') is not null as f \gset
select is(pg_temp.invoice('evt_s15a', 's15', 'in_s15a', 'sub_s15', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s15'),
  'applied', 'Plus starts');
select is(pg_temp.rev('evt_s15w', 'charge.dispute.closed', 'pi_s15', null, 0, 'won') || ' '
  || pg_temp.rev('evt_s15d', 'charge.dispute.created', 'pi_s15', null, 0, 'needs_response'), 'applied applied',
  '15. closed:won, then created');
select is(pg_temp.bal(pg_temp.u('s15')) || ' ' || pg_temp.kinds('s15') || ' ' ||
  (select count(*) from public.account_flags where user_id = pg_temp.u('s15')), '150/0/0 grant_sub(150) 0',
  '... no clawback, no flags (a terminal status is never overwritten)');

-- 16, 19. Unknown customer.
select is(pg_temp.svc($f$select public.stripe_topup_paid('evt_s16', 'checkout.session.completed', now(), false, 'cus_nobody',
  'x', 'cs_s16', 'pi_s16', 'topup_60', 499, 1, 'usd', 499)$f$), 'needs_review:unknown_customer', '16. top-up from an unknown customer');
select is(pg_temp.svc($f$select public.stripe_invoice_paid('evt_s16b', 'invoice.paid', now(), false, null, 'in_s16b', 'sub_s16',
  'subscription_create', 'plus', 999, 999, now() + interval '30 days', null)$f$), 'needs_review:unknown_customer',
  '19. an invoice with no customer mapping');
select is((select count(*)::int from public.credit_ledger where stripe_ref in ('cs_s16','in_s16b')) || ':' ||
  (select count(*) from public.stripe_events where id in ('evt_s16','evt_s16b')), '0:2', '... no ledger rows; both events recorded');

-- 23. charge.refunded before its invoice.paid: retry (nothing recorded), then the grant, then the clawback.
select pg_temp.mk('s23') is not null as f \gset
select is(pg_temp.rev('evt_s23r', 'charge.refunded', 'pi_s23', 'in_s23', 999, null), 'retry', '23. refund first -> retry (the route answers 500)');
select is((select count(*)::int from public.stripe_events where id = 'evt_s23r'), 0, '... nothing recorded');
select is(pg_temp.invoice('evt_s23a', 's23', 'in_s23', 'sub_s23', 'subscription_create', 'plus', 999, now() + interval '30 days'),
  'applied', '... then invoice.paid grants 150');
select is(pg_temp.rev('evt_s23r', 'charge.refunded', 'pi_s23', 'in_s23', 999, null), 'applied', '... the redelivered refund applies');
select is(pg_temp.bal(pg_temp.u('s23')) || ' ' || (select stripe_payment_intent_id from public.purchases where stripe_invoice_id = 'in_s23'),
  '0/0/0 pi_s23', '... net 0 credits; the purchase now carries its payment intent');
select is(pg_temp.rev('evt_s23old', 'charge.refunded', 'pi_unknown', null, 100, null, now() - interval '25 hours'),
  'needs_review:unmatched_payment', 'an unmatched payment older than 24 h -> needs_review:unmatched_payment');

-- 27. A full refund of the current Plus invoice takes the plan bucket.
select pg_temp.mk('s27') is not null as f \gset
select is(pg_temp.invoice('evt_s27a', 's27', 'in_s27a', 'sub_s27', 'subscription_create', 'plus', 999, now() + interval '30 days', 'pi_s27'),
  'applied', 'Plus starts');
select is(pg_temp.rev('evt_s27r', 'charge.refunded', 'pi_s27', null, 999, null) || ' ' || pg_temp.bal(pg_temp.u('s27')),
  'applied 0/0/0', '27. full refund of the current cycle''s invoice -> sub 0');

-- A full refund of an OLDER cycle's invoice while the subscription still bills -> founder review.
select is(pg_temp.rev('evt_s5r', 'charge.refunded', 'pi_s5a', null, 999, null), 'needs_review:refund_active_sub',
  'refund of an older cycle''s invoice while the plan is active -> needs_review:refund_active_sub');
select is((select credits_reversed || ':' || credits_uncollected from public.purchases where stripe_invoice_id = 'in_s5a')
  || ' ' || pg_temp.bal(pg_temp.u('s5')), '110:110 150/0/0',
  '... 150 - 40 expired = 110 targeted, none from the new cycle''s bucket, so all uncollected');

-- 28. Early fraud warning: both flags on; a replay changes nothing.
select is(pg_temp.svc($f$select public.stripe_efw('evt_s28', 'radar.early_fraud_warning.created', now(), false, 'cus_t_s27', 'issfr_1')$f$),
  'applied', '28. early fraud warning');
select is((select generation_blocked || ':' || purchases_blocked || ':' || reason from public.account_flags where user_id = pg_temp.u('s27')),
  'true:true:efw', '... purchases and asking blocked');
select is(pg_temp.svc($f$select public.stripe_efw('evt_s28', 'radar.early_fraud_warning.created', now(), false, 'cus_t_s27', 'issfr_1')$f$),
  'duplicate', '... the same warning again -> duplicate');

-- 24, 25. A payment for a deleted account grants nothing; the route refunds and records it.
select pg_temp.mk('s24') is not null as f \gset
select is(pg_temp.svc(format('select public.delete_account_data(%L)', pg_temp.u('s24'))), 'deleted', 'the account is deleted');
select is(pg_temp.topup('evt_s24', 's24', 'cs_s24', 'pi_s24', 'topup_60', 499), 'account_deleted', '24. a top-up for it -> account_deleted');
select is(pg_temp.invoice('evt_s25', 's24', 'in_s25', 'sub_s25', 'subscription_cycle', 'plus', 999, now() + interval '30 days'),
  'account_deleted', '25. an invoice.paid for it -> account_deleted');
select is((select count(*)::int from public.credit_ledger where user_id = pg_temp.u('s24')) || ':' ||
  (select count(*) from public.stripe_events where id in ('evt_s24','evt_s25')), '0:0', '... 0 ledger rows, nothing recorded yet');
select is(pg_temp.svc($f$select public.stripe_record_event('evt_s24', 'checkout.session.completed', now(), false,
  'account_deleted_refunded', 'cs_s24', 499, 'cus_t_s24')$f$), 'account_deleted_refunded', '... the route refunds, then records it');
select is((select count(*)::int from public.ops_alerts where kind = 'account_deleted_refunded:cs_s24'), 1, '... one alert');

-- 31. checkout.session.expired is recorded as ignored with its type.
select is(pg_temp.svc($f$select public.stripe_record_event('evt_s31', 'checkout.session.expired', now(), false, 'ignored', 'cs_s31',
  null, 'cus_t_s1')$f$), 'ignored', '31. checkout.session.expired -> ignored');
select is((select type || ':' || outcome from public.stripe_events where id = 'evt_s31'), 'checkout.session.expired:ignored', '... type kept');

-- Invoice shape: a plan line that does not match the catalogue grants nothing.
select is(pg_temp.invoice('evt_s7x', 's7', 'in_s7x', 'sub_s7', 'subscription_cycle', 'plus', 998, now() + interval '90 days'),
  'needs_review:invoice_shape', 'a plan line of 998 cents for Plus -> needs_review:invoice_shape');
select is(pg_temp.invoice('evt_s7y', 's7', 'in_s7y', 'sub_s7', 'subscription_cycle', 'topup_60', 499, now() + interval '90 days'),
  'needs_review:invoice_shape', 'a top-up price on a subscription invoice -> needs_review:invoice_shape');
select is(pg_temp.bal(pg_temp.u('s7')), '370/0/0', '... credits unchanged');

-- 22. Privileges: another user's purchases are invisible; the ledger cannot be written directly; the function can.
select is(pg_temp.as_user(pg_temp.ua(), format('select count(*) from public.purchases where user_id = %L', pg_temp.u('s1'))), '0',
  '22. authenticated reads 0 of another user''s purchases');
select is(pg_temp.svc(format($f$insert into public.credit_ledger (user_id, kind, topup_delta, stripe_ref) values (%L, 'grant_topup', 60, 'x')$f$,
  pg_temp.u('s1'))), 'ERROR 42501: permission denied for table credit_ledger', '22. service_role INSERT into credit_ledger -> 42501');

select is(pg_temp.drift(), '0', '21. credit_drift() is empty after every scenario');
select * from finish();
rollback;
