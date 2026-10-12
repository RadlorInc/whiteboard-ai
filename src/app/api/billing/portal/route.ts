// POST /api/billing/portal -> {url} of the Stripe Customer Portal (plan changes, cancel, card) (§8.8).
import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  if (req.headers.get("origin") !== process.env.APP_URL) return NextResponse.json({ code: "forbidden" }, { status: 403 });
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ code: "signed_out" }, { status: 401 });
  const s = stripe();
  if (!s) return NextResponse.json({ code: "payments_not_configured" }, { status: 503 });
  const { data: p } = await createAdminClient().from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  if (!p?.stripe_customer_id) return NextResponse.json({ code: "no_customer" }, { status: 409 });
  const session = await s.billingPortal.sessions.create({ customer: p.stripe_customer_id, return_url: `${process.env.APP_URL}/account` });
  return NextResponse.json({ url: session.url });
}
