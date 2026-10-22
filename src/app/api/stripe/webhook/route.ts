// POST /api/stripe/webhook (PLAN.md §8.4, §8.7): the ONLY way credits enter. The signature is verified first; each
// event is handed to one SECURITY DEFINER function, which is idempotent on the event id and checks amounts against
// price_catalog. A database error answers 500 so Stripe retries; a bad signature answers 400 and changes nothing.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { priceKeyOf, verifyEvent } from "@/lib/stripe";
import { reportRef } from "@/lib/radlorOps";

type Obj = Record<string, unknown>;
const id = (v: unknown): string | null => (typeof v === "string" ? v : (v as Obj | null)?.id as string) ?? null;
// The Stripe account is shared with Radlic (founder, 22 Oct 2026): our checkouts and subscriptions carry price_key in
// their metadata (billing/checkout); anything without it is another app's and is only recorded as ignored.
// ponytail: refunds, disputes and fraud warnings are not filtered (no metadata on charges); a Radlic one shows in review.
const ours = (meta: unknown) => typeof (meta as Obj | null)?.price_key === "string";
const ts = (s: unknown) => (typeof s === "number" ? new Date(s * 1000).toISOString() : null);

// Fields moved between Stripe API versions; read both shapes.
function invoiceFields(inv: Obj) {
  const line = ((inv.lines as Obj)?.data as Obj[] | undefined)?.[0] ?? {};
  const price = (line.price as Obj)?.id ?? ((line.pricing as Obj)?.price_details as Obj)?.price;
  const sub = inv.subscription ?? ((inv.parent as Obj)?.subscription_details as Obj)?.subscription;
  const pi = inv.payment_intent ?? (((inv.payments as Obj)?.data as Obj[] | undefined)?.[0]?.payment as Obj)?.payment_intent;
  const subMeta = ((inv.parent as Obj)?.subscription_details as Obj)?.metadata ?? (inv.subscription_details as Obj)?.metadata ?? {};
  return {
    sub_meta: subMeta as Obj,
    subscription: id(sub), price_key: priceKeyOf(id(price)), line_amount: (line.amount as number) ?? null,
    period_end: ts((line.period as Obj)?.end), payment_intent: id(pi),
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const event = verifyEvent(body, req.headers.get("stripe-signature"));
  if (!event) return NextResponse.json({ code: "bad_signature" }, { status: 400 });

  const base = { p_event_id: event.id, p_event_type: event.type, p_event_created: ts(event.created), p_livemode: event.livemode };
  const o = event.data.object as unknown as Obj;
  let fn = "stripe_record_event", args: Obj = { ...base, p_outcome: "ignored", p_object_id: id(o), p_amount_cents: null, p_customer_id: id(o.customer) };

  switch (event.type as Stripe.Event.Type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      if (o.mode !== "payment" || o.payment_status !== "paid" || !ours(o.metadata)) break;  // plans: invoice.paid
      const meta = o.metadata as Obj;
      fn = "stripe_topup_paid";
      args = { ...base, p_customer_id: id(o.customer), p_client_reference_id: o.client_reference_id ?? null,
        p_session_id: o.id, p_payment_intent_id: id(o.payment_intent), p_price_key: meta.price_key ?? null,
        p_unit_amount: o.amount_subtotal ?? null, p_quantity: 1, p_currency: o.currency ?? null, p_amount_total: o.amount_total ?? null };
      break;
    }
    case "invoice.paid": {
      const f = invoiceFields(o);
      if (!f.subscription || !ours(f.sub_meta)) break;
      fn = "stripe_invoice_paid";
      args = { ...base, p_customer_id: id(o.customer), p_invoice_id: o.id, p_subscription_id: f.subscription,
        p_billing_reason: o.billing_reason ?? null, p_price_key: f.price_key, p_line_amount: f.line_amount,
        p_amount_paid: o.amount_paid ?? null, p_period_end: f.period_end, p_payment_intent_id: f.payment_intent };
      break;
    }
    case "invoice.payment_failed": {
      if (!ours(invoiceFields(o).sub_meta)) break;
      fn = "stripe_payment_failed";
      args = { ...base, p_customer_id: id(o.customer), p_subscription_id: invoiceFields(o).subscription, p_invoice_id: o.id };
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      if (!ours(o.metadata)) break;
      const item = ((o.items as Obj)?.data as Obj[] | undefined)?.[0] ?? {};
      fn = "stripe_subscription_sync";
      args = { ...base, p_customer_id: id(o.customer), p_subscription_id: o.id, p_status: o.status,
        p_price_key: priceKeyOf(id(item.price)), p_current_period_end: ts(o.current_period_end ?? item.current_period_end),
        p_cancel_at_period_end: Boolean(o.cancel_at_period_end), p_canceled_at: ts(o.canceled_at) };
      break;
    }
    case "charge.refunded":
    case "charge.dispute.created":
    case "charge.dispute.closed": {
      const isDispute = event.type.startsWith("charge.dispute");
      fn = "stripe_reverse";
      args = { ...base, p_payment_intent_id: id(o.payment_intent), p_invoice_id: id(o.invoice),
        p_amount_refunded: isDispute ? (o.amount ?? null) : (o.amount_refunded ?? null),
        p_dispute_status: isDispute ? (o.status ?? null) : null, p_object_id: o.id };
      break;
    }
    case "radar.early_fraud_warning.created": {
      fn = "stripe_efw";
      args = { ...base, p_customer_id: null, p_object_id: id(o.charge) ?? o.id };
      break;
    }
  }

  const { data, error } = await createAdminClient().rpc(fn, args);
  if (error) {
    // Bad input from Stripe's side is not retried forever: record it for review instead.
    if (/rejected:invalid_input/.test(error.message)) {
      await createAdminClient().rpc("stripe_record_event", { ...base, p_outcome: "needs_review:invalid_input",
        p_object_id: id(o), p_amount_cents: null, p_customer_id: id(o.customer) });
      return NextResponse.json({ outcome: "needs_review" });
    }
    console.error("stripe webhook: database error", event.type, error.code);  // no payload: it may hold an email
    return NextResponse.json({ code: "retry" }, { status: 500 });
  }
  // A paid invoice of a market rep's referral is reported only after it is recorded here, so a retry reports again
  // (Radlor Ops keeps one row per invoice id).
  if (event.type === "invoice.paid") {
    const f = invoiceFields(o), ref = f.sub_meta.ref, user = f.sub_meta.user_id;
    if (typeof ref === "string" && typeof user === "string" && typeof o.amount_paid === "number" && o.amount_paid > 0) {
      const paidAt = ts((o.status_transitions as Obj)?.paid_at) ?? ts(event.created);
      await reportRef({ kind: "payment", code: ref, app_user: user, amount_cents: o.amount_paid, paid_at: paidAt!, event_key: `invoice:${o.id}` });
    }
  }
  return NextResponse.json({ outcome: data });
}
