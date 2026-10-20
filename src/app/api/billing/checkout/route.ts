// POST /api/billing/checkout {price_key} -> {url} of a Stripe Checkout page (§8.3).
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { ON_SALE, isSubscription, priceId, stripe, type PriceKey } from "@/lib/stripe";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  if (req.headers.get("origin") !== process.env.APP_URL) return json(403, { code: "forbidden" });
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return json(401, { code: "signed_out" });
  const body = await req.json().catch(() => null);
  const key = body?.price_key as PriceKey;
  if (!ON_SALE.includes(key)) return json(400, { code: "bad_request" });
  const s = stripe(), price = priceId(key);
  if (!s || !price) return json(503, { code: "payments_not_configured" });

  const admin = createAdminClient();
  const { data: p } = await admin.from("profiles").select("stripe_customer_id, access_granted_at, deleted_at")
    .eq("id", user.id).maybeSingle();
  if (!p || p.deleted_at) return json(401, { code: "signed_out" });
  if (!p.access_granted_at) return json(403, { code: "access_required" });     // invite-only beta: no Stripe call
  let customer = p.stripe_customer_id as string | null;
  if (!customer) {
    const c = await s.customers.create({ email: user.email, metadata: { user_id: user.id } },
      { idempotencyKey: `customer-${user.id}` });
    const { data: linked } = await admin.rpc("link_stripe_customer", { p_user_id: user.id, p_customer_id: c.id });
    customer = typeof linked === "string" && linked.startsWith("cus_") ? linked : c.id;
  }
  const app = process.env.APP_URL;
  const session = await s.checkout.sessions.create({
    mode: isSubscription(key) ? "subscription" : "payment",
    customer, client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    metadata: { price_key: key, user_id: user.id },
    ...(isSubscription(key) ? { subscription_data: { metadata: { price_key: key, user_id: user.id } } } : {}),
    success_url: `${app}/buy/success`, cancel_url: `${app}/buy`,
  });
  return json(200, { url: session.url });
}
