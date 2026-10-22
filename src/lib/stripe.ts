import "server-only";
// Stripe (PLAN.md §8). Credits enter ONLY through the signature-verified webhook; nothing here grants credits.
import Stripe from "stripe";

export const PRICE_KEYS = ["plus", "pro", "plus_college", "pro_college", "plus_grad", "pro_grad", "topup_60", "topup_132", "topup_282",
  "topup_20", "topup_45", "topup_100"] as const;
export type PriceKey = (typeof PRICE_KEYS)[number];
// On sale (founder, 22 Oct 2026): one plan pair for every level, and three packs. The rest stay in PRICE_KEYS so their
// old webhooks still map.
export const ON_SALE: PriceKey[] = ["plus", "pro", "topup_20", "topup_45", "topup_100"];
const ENV: Record<PriceKey, string> = {
  plus: "STRIPE_PRICE_PLUS", pro: "STRIPE_PRICE_PRO",
  plus_college: "STRIPE_PRICE_PLUS_COLLEGE", pro_college: "STRIPE_PRICE_PRO_COLLEGE",
  plus_grad: "STRIPE_PRICE_PLUS_GRAD", pro_grad: "STRIPE_PRICE_PRO_GRAD",
  topup_60: "STRIPE_PRICE_TOPUP_60", topup_132: "STRIPE_PRICE_TOPUP_132", topup_282: "STRIPE_PRICE_TOPUP_282",
  topup_20: "STRIPE_PRICE_TOPUP_20", topup_45: "STRIPE_PRICE_TOPUP_45", topup_100: "STRIPE_PRICE_TOPUP_100",
};
export const priceId = (k: PriceKey) => process.env[ENV[k]] || null;
export const priceKeyOf = (id: string | null | undefined): PriceKey | null =>
  (id && PRICE_KEYS.find(k => priceId(k) === id)) || null;
export const isSubscription = (k: PriceKey) => !k.startsWith("topup_");

// null when payments are not set up (no key yet): the routes answer 503 instead of failing later.
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (process.env.VERCEL_ENV === "production" ? !/^(rk|sk)_live_/.test(key) : /^(rk|sk)_live_/.test(key))
    throw new Error("Stripe key mode does not match this environment");           // live keys only in production
  return new Stripe(key);
}

// Verifying a webhook needs only the signing secret, never an API key.
const verifier = new Stripe("sk_test_signature_check_only");
export function verifyEvent(body: string, signature: string | null): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return null;
  try { return verifier.webhooks.constructEvent(body, signature, secret); } catch { return null; }
}
