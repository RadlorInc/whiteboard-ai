// The Stripe webhook against the LOCAL stack, with events signed by our own secret (no Stripe keys, PLAN.md §8.10).
// Run: WB_LOCAL_DB=1 npx vitest run tests/billing   (refuses any database but 127.0.0.1)
import { beforeAll, describe, expect, it } from "vitest";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const on = process.env.WB_LOCAL_DB === "1";
const env = Object.fromEntries(readFileSync(new URL("../../.env.local", import.meta.url), "utf8").split("\n")
  .filter(l => l.includes("=")).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const SEED_A = "00000000-0000-4000-8000-00000000000a";       // seed.sql user A, customer cus_seed_a

describe.skipIf(!on)("Stripe webhook on the local stack", () => {
  const secret = "whsec_test_webhook_suite";
  const signer = new Stripe("sk_test_signer");
  let POST: (r: Request) => Promise<Response>;
  const db = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const topup = async () => (await db().from("credit_balances").select("topup").eq("user_id", SEED_A).single()).data!.topup as number;
  const send = (event: object, sig?: string) => {
    const payload = JSON.stringify(event);
    return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: payload,
      headers: { "stripe-signature": sig ?? signer.webhooks.generateTestHeaderString({ payload, secret }) } }));
  };
  const session = (evt: string, amount: number, key = "topup_60") => ({
    id: evt, object: "event", type: "checkout.session.completed", created: Math.floor(Date.now() / 1000), livemode: false,
    data: { object: { id: `cs_${evt.slice(4)}`, object: "checkout.session", mode: "payment", payment_status: "paid",
      customer: "cus_seed_a", client_reference_id: SEED_A, payment_intent: `pi_${evt.slice(4)}`, currency: "usd",
      amount_subtotal: amount, amount_total: amount, metadata: { price_key: key } } },
  });

  beforeAll(async () => {
    if (!/^http:\/\/127\.0\.0\.1:/.test(env.NEXT_PUBLIC_SUPABASE_URL)) throw new Error("refusing: not the local stack");
    Object.assign(process.env, { NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      STRIPE_WEBHOOK_SECRET: secret });
    ({ POST } = await import("@/app/api/stripe/webhook/route"));
  });

  it("grants a paid 60-credit pack exactly once, even when Stripe sends the event twice", async () => {
    const before = await topup(), evt = `evt_pack_${Date.now()}`;
    const r1 = await send(session(evt, 499));
    expect(r1.status).toBe(200);
    expect(await topup()).toBe(before + 60);
    const r2 = await send(session(evt, 499));                       // Stripe retries deliver the same event id
    expect(r2.status).toBe(200);
    expect(await topup()).toBe(before + 60);
  });

  it("rejects a forged signature and changes nothing", async () => {
    const before = await topup();
    const r = await send(session(`evt_forged_${Date.now()}`, 499), "t=1,v1=deadbeef");
    expect(r.status).toBe(400);
    expect(await topup()).toBe(before);
  });

  it("does not grant credits when the amount paid is not the pack's price", async () => {
    const before = await topup();
    const r = await send(session(`evt_cheap_${Date.now()}`, 1));
    expect(r.status).toBe(200);
    expect((await r.json()).outcome).toBe("needs_review:amount_mismatch");
    expect(await topup()).toBe(before);
  });
  it("ignores another app's checkout on the shared Stripe account (no price_key in metadata)", async () => {
    const before = await topup(), e = session(`evt_radlic_${Date.now()}`, 499);
    e.data.object.metadata = {} as typeof e.data.object.metadata;
    const r = await send(e);
    expect(r.status).toBe(200);
    expect((await r.json()).outcome).toBe("ignored");
    expect(await topup()).toBe(before);
  });
});
