-- M1 / PLAN.md §6.7, §8.4–8.7: the Stripe mirror and the only way paid credits enter (§8.1).
-- Security change: adds SECURITY DEFINER functions stripe_topup_paid, stripe_invoice_paid, stripe_subscription_sync,
-- stripe_payment_failed, stripe_reverse, stripe_efw, stripe_record_event (service_role), owned by postgres with
-- search_path = ''. Internal helpers (_stripe_*) are SECURITY INVOKER with no EXECUTE grant.
--
-- Every function: records stripe_events and applies its effect in ONE transaction; the event row is inserted first
-- with `on conflict (id) do nothing`, so a replayed event id is 'duplicate' and changes nothing. The user is resolved
-- from profiles.stripe_customer_id inside the function, never from metadata. Credits come from price_catalog only.
-- Outcomes: applied | duplicate | ignored | account_deleted (nothing written; the route refunds, then records
-- account_deleted_refunded) | retry (nothing written; the route answers 500) | needs_review:<reason>.

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  price_key text not null references public.price_catalog(price_key),
  kind text not null check (kind in ('subscription','topup')),
  credits int not null check (credits > 0),
  amount_cents int not null check (amount_cents > 0),   -- the charge total, tax included: the refund fraction's denominator
  checkout_session_id text unique,                       -- top-ups
  stripe_invoice_id text unique,                         -- subscription invoices
  stripe_payment_intent_id text unique,                  -- top-ups at grant; invoices once looked up (§8.6)
  stripe_subscription_id text,
  billing_reason text check (billing_reason in ('subscription_create','subscription_cycle','subscription_update')),
  period_end timestamptz,
  refunded_cents int not null default 0 check (refunded_cents >= 0),
  credits_expired int not null default 0,
  credits_reversed int not null default 0,
  credits_uncollected int not null default 0,            -- the part of credits_reversed that found no credits (C8)
  dispute_status text check (dispute_status in ('warning_needs_response','warning_under_review','needs_response',
    'under_review','won','lost','warning_closed','prevented')),   -- the last four are terminal (§8.6)
  check ((kind = 'topup') = (checkout_session_id is not null)),
  check ((kind = 'subscription') = (stripe_invoice_id is not null)),
  check (credits_expired between 0 and credits),
  check (credits_reversed between 0 and credits),
  check (credits_uncollected between 0 and credits_reversed),
  check (refunded_cents <= amount_cents));
create index purchases_user on public.purchases (user_id, created_at desc);

create table public.subscriptions (
  stripe_subscription_id text primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null check (status in ('incomplete','incomplete_expired','trialing','active','past_due','canceled',
    'unpaid','paused')),
  price_key text references public.price_catalog(price_key),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  last_payment_failed_at timestamptz,
  last_event_created timestamptz not null);             -- an older event never overwrites a newer one (§8.4)
create index subscriptions_user on public.subscriptions (user_id);

create table public.stripe_events (                      -- never pruned (C46); no payloads
  id text primary key,                                   -- evt_…
  type text not null, created timestamptz not null, livemode boolean not null,
  processed_at timestamptz not null default now(),
  outcome text not null,        -- applied | duplicate | ignored | account_deleted_refunded | needs_review:<reason>
  object_id text,               -- the session / invoice / charge / dispute / warning id, for /admin/billing
  amount_cents int, customer_id text,
  resolved_at timestamptz, resolution text check (char_length(resolution) <= 500));
create index stripe_events_open_review on public.stripe_events (processed_at)
  where outcome like 'needs_review%' and resolved_at is null;

alter table public.purchases     enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
revoke all on public.purchases, public.subscriptions, public.stripe_events from public, anon, authenticated, service_role;
grant select on public.purchases, public.subscriptions to authenticated;
grant select on public.purchases, public.subscriptions, public.stripe_events to service_role;
create policy purchases_own on public.purchases for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));
create policy subscriptions_own on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));

-- Inserts the event row first. false = this event id was already recorded (a replay).
create function public._stripe_begin(p_event_id text, p_type text, p_created timestamptz, p_livemode boolean,
  p_object_id text, p_amount_cents int, p_customer_id text) returns boolean
language plpgsql set search_path = '' as $$
begin
  insert into public.stripe_events (id, type, created, livemode, outcome, object_id, amount_cents, customer_id)
  values (p_event_id, p_type, p_created, p_livemode, 'applied', p_object_id, p_amount_cents, p_customer_id)
  on conflict (id) do nothing;
  return found;
end $$;

-- Sets the outcome; every needs_review:* and account_deleted_refunded raises an alert whose kind carries the
-- Stripe object id, so a second one on the same day still emails (§8.7 step 7).
create function public._stripe_outcome(p_event_id text, p_outcome text, p_object_id text) returns text
language plpgsql set search_path = '' as $$
begin
  update public.stripe_events set outcome = p_outcome where id = p_event_id and outcome is distinct from p_outcome;
  if p_outcome like 'needs_review:%' or p_outcome = 'account_deleted_refunded' then
    perform public.raise_ops_alert(p_outcome || ':' || coalesce(p_object_id, p_event_id),
                                   jsonb_build_object('event_id', p_event_id));
  end if;
  return p_outcome;
end $$;

create function public._stripe_args_ok(p_event_id text, p_type text, p_created timestamptz, p_livemode boolean)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(p_event_id ~ '^evt_\w{1,250}$' and char_length(p_type) between 1 and 100
                  and p_created is not null and p_livemode is not null, false)
$$;

-- An event that changes nothing: ignored | account_deleted_refunded | needs_review:<reason> (route-level checks).
create function public.stripe_record_event(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_outcome text, p_object_id text, p_amount_cents int, p_customer_id text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode)
     or coalesce(p_outcome, '') !~ '^(ignored|account_deleted_refunded|needs_review:[a-z_]{1,40})$' then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, left(p_object_id, 255),
                              p_amount_cents, left(p_customer_id, 255)) then
    return 'duplicate';
  end if;
  return public._stripe_outcome(p_event_id, p_outcome, left(p_object_id, 255));
end $$;

-- §8.4 top-up paid (checkout.session.completed with payment_status=paid, or async_payment_succeeded).
create function public.stripe_topup_paid(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_customer_id text, p_client_reference_id text, p_session_id text, p_payment_intent_id text,
  p_price_key text, p_unit_amount int, p_quantity int, p_currency text, p_amount_total int) returns text
language plpgsql security definer set search_path = '' as $$
declare v_p public.profiles; v_cat public.price_catalog; v_pid uuid; v_c text;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode)
     or coalesce(p_session_id, '') !~ '^cs_\w{1,250}$' then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_p from public.profiles where stripe_customer_id = p_customer_id;
  if not found then
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unknown_customer', p_session_id, p_amount_total, p_customer_id);
  end if;
  if v_p.deleted_at is not null then return 'account_deleted'; end if;
  perform 1 from public.credit_balances where user_id = v_p.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, p_session_id, p_amount_total,
                              p_customer_id) then
    return 'duplicate';
  end if;
  if p_client_reference_id is distinct from v_p.id::text then
    return public._stripe_outcome(p_event_id, 'needs_review:user_mismatch', p_session_id);
  end if;
  select * into v_cat from public.price_catalog where price_key = p_price_key and kind = 'topup';
  if not found or p_unit_amount is distinct from v_cat.unit_amount_cents or p_quantity is distinct from 1
     or p_currency is distinct from 'usd' or coalesce(p_amount_total, 0) <= 0 then
    return public._stripe_outcome(p_event_id, 'needs_review:amount_mismatch', p_session_id);
  end if;
  begin
    insert into public.purchases (user_id, price_key, kind, credits, amount_cents, checkout_session_id,
                                  stripe_payment_intent_id)
    values (v_p.id, v_cat.price_key, 'topup', v_cat.credits, p_amount_total, p_session_id, p_payment_intent_id)
    on conflict (checkout_session_id) do nothing
    returning id into v_pid;
    if v_pid is null then    -- the same session under another event id (completed + async_payment_succeeded)
      return public._stripe_outcome(p_event_id, 'duplicate', p_session_id);
    end if;
    perform public._ledger(v_p.id, 'grant_topup', 0, v_cat.credits, 0, null, p_session_id);
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return 'applied';
end $$;

-- §8.4 invoice.paid: the ONLY plan-credit grant. The route has already checked the invoice shape (one non-proration
-- plan line, has_more = false) and passes that line's price_key and amount.
create function public.stripe_invoice_paid(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_customer_id text, p_invoice_id text, p_subscription_id text, p_billing_reason text,
  p_price_key text, p_line_amount int, p_amount_paid int, p_period_end timestamptz,
  p_payment_intent_id text default null) returns text
language plpgsql security definer set search_path = '' as $$
declare
  c_grace constant interval := interval '3 days';     -- RENEWAL_GRACE (C6)
  v_p public.profiles; b public.credit_balances; v_cat public.price_catalog; v_pid uuid; v_exp timestamptz;
  v_outcome text := 'applied'; v_c text;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode)
     or coalesce(p_invoice_id, '') !~ '^in_\w{1,250}$' or coalesce(p_subscription_id, '') !~ '^sub_\w{1,250}$' then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_p from public.profiles where stripe_customer_id = p_customer_id;
  if not found then
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unknown_customer', p_invoice_id, p_amount_paid, p_customer_id);
  end if;
  if v_p.deleted_at is not null then return 'account_deleted'; end if;
  select * into b from public.credit_balances where user_id = v_p.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, p_invoice_id, p_amount_paid,
                              p_customer_id) then
    return 'duplicate';
  end if;
  select * into v_cat from public.price_catalog where price_key = p_price_key and kind = 'subscription';
  if not found or p_line_amount is distinct from v_cat.unit_amount_cents or coalesce(p_amount_paid, 0) <= 0
     or p_period_end is null
     or coalesce(p_billing_reason, '') not in ('subscription_create','subscription_cycle','subscription_update') then
    return public._stripe_outcome(p_event_id, 'needs_review:invoice_shape', p_invoice_id);
  end if;
  v_exp := p_period_end + c_grace;
  begin
    insert into public.purchases (user_id, price_key, kind, credits, amount_cents, stripe_invoice_id,
      stripe_payment_intent_id, stripe_subscription_id, billing_reason, period_end)
    values (v_p.id, v_cat.price_key, 'subscription', v_cat.credits, p_amount_paid, p_invoice_id, p_payment_intent_id,
      p_subscription_id, p_billing_reason, p_period_end)
    on conflict (stripe_invoice_id) do nothing
    returning id into v_pid;
    if v_pid is null then
      return public._stripe_outcome(p_event_id, 'duplicate', p_invoice_id);
    end if;

    -- Case b is tested before case a (§8.4 lists a first): a second subscription whose period ends on or before
    -- the current bucket's expiry would otherwise pass as "late", unflagged, and renew every month.
    if b.sub_expires_at > now() and b.sub_subscription_id is distinct from p_subscription_id then
      -- b. A second subscription while the bucket is valid: to top-up, and the founder looks at it (the route
      --    cancels the newer subscription and refunds its first payment).
      perform public._ledger(v_p.id, 'grant_sub_late', 0, v_cat.credits, 0, null, p_invoice_id);
      v_outcome := 'needs_review:second_subscription';
    elsif v_exp <= now() or v_exp <= b.sub_expires_at then
      -- a. Late: the period (plus grace) is over, or a newer period is already granted (C7).
      perform public._ledger(v_p.id, 'grant_sub_late', 0, v_cat.credits, 0, null, p_invoice_id);
    elsif p_billing_reason = 'subscription_update' and b.sub_expires_at > now() then
      -- c. Upgrade: the leftover is kept, the expiry moves, sub_cycle does not change (B8).
      perform public._ledger(v_p.id, 'grant_sub', v_cat.credits, 0, 0, null, p_invoice_id);
      update public.credit_balances set sub_expires_at = v_exp, sub_plan = v_cat.price_key,
             sub_subscription_id = p_subscription_id, sub_purchase_id = v_pid, updated_at = now()
       where user_id = v_p.id;
    else
      -- d. A new period: the leftover expires, then the plan's credits; sub_cycle + 1 (in _expire_bucket).
      perform public._expire_bucket(v_p.id);
      perform public._ledger(v_p.id, 'grant_sub', v_cat.credits, 0, 0, null, p_invoice_id);
      update public.credit_balances set sub_expires_at = v_exp, sub_plan = v_cat.price_key,
             sub_subscription_id = p_subscription_id, sub_purchase_id = v_pid, updated_at = now()
       where user_id = v_p.id;
      if p_billing_reason = 'subscription_create' then   -- the auto-renewal acknowledgement cannot be lost (§11.7)
        insert into public.email_outbox (user_id, kind, dedupe_key, payload)
        values (v_p.id, 'sub_confirmation', p_invoice_id, jsonb_build_object('plan', v_cat.price_key))
        on conflict (kind, dedupe_key) do nothing;
      end if;
    end if;
    update public.subscriptions set last_payment_failed_at = null where stripe_subscription_id = p_subscription_id;
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return public._stripe_outcome(p_event_id, v_outcome, p_invoice_id);
end $$;

-- §8.4 subscription mirror. This table decides no credits, except that a cancelled wallet subscription ends its
-- plan bucket now (top-up untouched).
create function public.stripe_subscription_sync(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_customer_id text, p_subscription_id text, p_status text, p_price_key text,
  p_current_period_end timestamptz, p_cancel_at_period_end boolean, p_canceled_at timestamptz) returns text
language plpgsql security definer set search_path = '' as $$
declare v_p public.profiles; b public.credit_balances; v_s public.subscriptions; v_price text; v_outcome text := 'applied';
        v_c text;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode)
     or coalesce(p_subscription_id, '') !~ '^sub_\w{1,250}$' then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_p from public.profiles where stripe_customer_id = p_customer_id;
  if not found then
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unknown_customer', p_subscription_id, null, p_customer_id);
  end if;
  select * into b from public.credit_balances where user_id = v_p.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, p_subscription_id, null,
                              p_customer_id) then
    return 'duplicate';
  end if;
  if coalesce(p_status, '') not in ('incomplete','incomplete_expired','trialing','active','past_due','canceled',
                                    'unpaid','paused') then
    return public._stripe_outcome(p_event_id, 'needs_review:unknown_status', p_subscription_id);
  end if;
  select * into v_s from public.subscriptions where stripe_subscription_id = p_subscription_id for update;
  if found and (v_s.status = 'canceled' or p_event_created < v_s.last_event_created) then
    return public._stripe_outcome(p_event_id, 'ignored', p_subscription_id);   -- stale, or cancelled is terminal
  end if;
  select price_key into v_price from public.price_catalog where price_key = p_price_key and kind = 'subscription';
  if v_price is null then v_outcome := 'needs_review:unknown_price'; end if;
  begin
    insert into public.subscriptions as s (stripe_subscription_id, user_id, status, price_key, current_period_end,
      cancel_at_period_end, canceled_at, last_event_created)
    values (p_subscription_id, v_p.id, p_status, v_price, p_current_period_end, coalesce(p_cancel_at_period_end, false),
      p_canceled_at, p_event_created)
    on conflict (stripe_subscription_id) do update set status = excluded.status, price_key = excluded.price_key,
      current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end,
      canceled_at = excluded.canceled_at, last_event_created = excluded.last_event_created
    where s.user_id = v_p.id;
    if p_status = 'canceled' and b.sub_subscription_id = p_subscription_id then
      update public.credit_balances set sub_expires_at = least(sub_expires_at, now()), updated_at = now()
       where user_id = v_p.id;
      perform public._expire_bucket(v_p.id);
    end if;
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  return public._stripe_outcome(p_event_id, v_outcome, p_subscription_id);
end $$;

-- §8.4 invoice.payment_failed: drives the banner; no credit change.
create function public.stripe_payment_failed(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_customer_id text, p_subscription_id text, p_invoice_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_p public.profiles;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_p from public.profiles where stripe_customer_id = p_customer_id;
  if not found then
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unknown_customer', p_invoice_id, null, p_customer_id);
  end if;
  perform 1 from public.credit_balances where user_id = v_p.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, p_invoice_id, null,
                              p_customer_id) then
    return 'duplicate';
  end if;
  update public.subscriptions set last_payment_failed_at = p_event_created
   where stripe_subscription_id = p_subscription_id and user_id = v_p.id;
  return public._stripe_outcome(p_event_id, case when found then 'applied' else 'ignored' end, p_invoice_id);
end $$;

-- §8.6 charge.refunded, charge.dispute.created / .closed. Works on cumulative state, so event order does not matter
-- (C9). The purchase is found by payment intent, else by invoice id (whose PI is then stored).
create function public.stripe_reverse(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_payment_intent_id text, p_invoice_id text, p_amount_refunded int, p_dispute_status text,
  p_object_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  c_terminal constant text[] := array['won','lost','warning_closed','prevented'];
  v_pu public.purchases; b public.credit_balances; v_status text; v_refunded int; v_target int; v_delta int;
  v_take_sub int; v_take_top int; v_short int; v_restore int; v_unc int; v_outcome text := 'applied'; v_c text;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode)
     or (p_dispute_status is not null and p_dispute_status not in ('warning_needs_response','warning_under_review',
         'needs_response','under_review','won','lost','warning_closed','prevented'))
     or p_amount_refunded < 0 then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_pu from public.purchases where stripe_payment_intent_id = p_payment_intent_id;
  if not found and p_invoice_id is not null then
    select * into v_pu from public.purchases where stripe_invoice_id = p_invoice_id;
  end if;
  if v_pu.id is null then
    if p_event_created > now() - interval '24 hours' then
      return 'retry';           -- the grant may still be on its way: 500, so Stripe redelivers
    end if;
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unmatched_payment', coalesce(p_object_id, p_payment_intent_id), p_amount_refunded, null);
  end if;
  select * into b from public.credit_balances where user_id = v_pu.user_id for update;
  select * into v_pu from public.purchases where id = v_pu.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode,
                              coalesce(p_object_id, p_payment_intent_id), p_amount_refunded, null) then
    return 'duplicate';
  end if;

  v_refunded := least(greatest(v_pu.refunded_cents, coalesce(p_amount_refunded, 0)), v_pu.amount_cents);
  v_status := case when v_pu.dispute_status = any (c_terminal) and not (p_dispute_status = any (c_terminal))
                   then v_pu.dispute_status else coalesce(p_dispute_status, v_pu.dispute_status) end;
  v_target := case when v_status is not null and (v_status = 'lost' or not (v_status = any (c_terminal)))
                   then v_pu.credits
                   else (v_pu.credits * v_refunded) / v_pu.amount_cents end;   -- floor
  v_target := least(v_target, v_pu.credits - v_pu.credits_expired);
  v_delta := v_target - v_pu.credits_reversed;
  v_unc := v_pu.credits_uncollected;
  begin
    if v_delta > 0 then
      -- Clawback: the plan bucket first (only if this purchase is the current cycle), then top-up; never below 0.
      v_take_sub := case when b.sub_purchase_id = v_pu.id then least(v_delta, b.sub) else 0 end;
      v_take_top := least(v_delta - v_take_sub, b.topup);
      v_short := v_delta - v_take_sub - v_take_top;
      perform public._ledger(v_pu.user_id, 'clawback', -v_take_sub, -v_take_top, 0, null, p_event_id, null, v_short);
      v_unc := v_unc + v_short;
    elsif v_delta < 0 and v_status in ('won','warning_closed','prevented') then
      -- A dispute closed in our favour: what was taken comes back to top-up (C10); uncollected is simply forgotten.
      v_restore := -v_delta - least(-v_delta, v_unc);
      v_unc := v_unc - least(-v_delta, v_unc);
      if v_restore > 0 then
        perform public._ledger(v_pu.user_id, 'dispute_restore', 0, v_restore, 0, null, p_event_id);
      end if;
    else
      v_target := v_pu.credits_reversed;     -- nothing to move
    end if;
    update public.purchases set refunded_cents = v_refunded, dispute_status = v_status, credits_reversed = v_target,
           credits_uncollected = v_unc, stripe_payment_intent_id = coalesce(stripe_payment_intent_id, p_payment_intent_id)
     where id = v_pu.id;
    if v_status is not null and (v_status = 'lost' or not (v_status = any (c_terminal))) then
      insert into public.account_flags as f (user_id, generation_blocked, purchases_blocked, reason)
      values (v_pu.user_id, true, true, 'dispute')
      on conflict (user_id) do update set generation_blocked = true, purchases_blocked = true, reason = 'dispute',
        updated_at = now();
    end if;
  exception when check_violation or not_null_violation or unique_violation or foreign_key_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  -- A full refund of an older cycle's invoice while the subscription still bills (§8.6).
  if v_pu.kind = 'subscription' and v_refunded = v_pu.amount_cents and b.sub_purchase_id is distinct from v_pu.id
     and exists (select 1 from public.subscriptions where stripe_subscription_id = v_pu.stripe_subscription_id
                   and status in ('active','past_due')) then
    v_outcome := 'needs_review:refund_active_sub';
  end if;
  return public._stripe_outcome(p_event_id, v_outcome, coalesce(p_object_id, p_payment_intent_id));
end $$;

-- §8.6 radar.early_fraud_warning.created: the route has refunded and cancelled; block purchases and asking.
create function public.stripe_efw(p_event_id text, p_event_type text, p_event_created timestamptz,
  p_livemode boolean, p_customer_id text, p_object_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_p public.profiles;
begin
  if not public._stripe_args_ok(p_event_id, p_event_type, p_event_created, p_livemode) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  select * into v_p from public.profiles where stripe_customer_id = p_customer_id;
  if not found then
    return public.stripe_record_event(p_event_id, p_event_type, p_event_created, p_livemode,
      'needs_review:unknown_customer', p_object_id, null, p_customer_id);
  end if;
  perform 1 from public.credit_balances where user_id = v_p.id for update;
  if not public._stripe_begin(p_event_id, p_event_type, p_event_created, p_livemode, left(p_object_id, 255), null,
                              p_customer_id) then
    return 'duplicate';
  end if;
  insert into public.account_flags as f (user_id, generation_blocked, purchases_blocked, reason)
  values (v_p.id, true, true, 'efw')
  on conflict (user_id) do update set generation_blocked = true, purchases_blocked = true, reason = 'efw',
    updated_at = now();
  return public._stripe_outcome(p_event_id, 'applied', p_object_id);
end $$;

revoke all on function public._stripe_begin(text,text,timestamptz,boolean,text,int,text) from public, anon, authenticated, service_role;
revoke all on function public._stripe_outcome(text,text,text)                           from public, anon, authenticated, service_role;
revoke all on function public._stripe_args_ok(text,text,timestamptz,boolean)            from public, anon, authenticated, service_role;
revoke all on function public.stripe_record_event(text,text,timestamptz,boolean,text,text,int,text) from public, anon, authenticated, service_role;
revoke all on function public.stripe_topup_paid(text,text,timestamptz,boolean,text,text,text,text,text,int,int,text,int) from public, anon, authenticated, service_role;
revoke all on function public.stripe_invoice_paid(text,text,timestamptz,boolean,text,text,text,text,text,int,int,timestamptz,text) from public, anon, authenticated, service_role;
revoke all on function public.stripe_subscription_sync(text,text,timestamptz,boolean,text,text,text,text,timestamptz,boolean,timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.stripe_payment_failed(text,text,timestamptz,boolean,text,text,text) from public, anon, authenticated, service_role;
revoke all on function public.stripe_reverse(text,text,timestamptz,boolean,text,text,int,text,text) from public, anon, authenticated, service_role;
revoke all on function public.stripe_efw(text,text,timestamptz,boolean,text,text) from public, anon, authenticated, service_role;
grant execute on function public.stripe_record_event(text,text,timestamptz,boolean,text,text,int,text) to service_role;
grant execute on function public.stripe_topup_paid(text,text,timestamptz,boolean,text,text,text,text,text,int,int,text,int) to service_role;
grant execute on function public.stripe_invoice_paid(text,text,timestamptz,boolean,text,text,text,text,text,int,int,timestamptz,text) to service_role;
grant execute on function public.stripe_subscription_sync(text,text,timestamptz,boolean,text,text,text,text,timestamptz,boolean,timestamptz) to service_role;
grant execute on function public.stripe_payment_failed(text,text,timestamptz,boolean,text,text,text) to service_role;
grant execute on function public.stripe_reverse(text,text,timestamptz,boolean,text,text,int,text,text) to service_role;
grant execute on function public.stripe_efw(text,text,timestamptz,boolean,text,text) to service_role;
