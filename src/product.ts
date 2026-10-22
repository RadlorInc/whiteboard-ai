// The product's public name, in one place until the founder picks the real one (PLAN.md §2 A1).
export const PRODUCT_NAME = "Ask Radlor"; // founder, 15 Oct 2026; two words since 23 Oct 2026

// FOUNDER DECIDES (A11): the real address once the domain exists.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

// Plans and payment (founder, 22 Oct 2026). Off: free videos only, and nothing anywhere shows a plan, a price or a buy
// button; /pricing, /buy and /start go to /ask. NEXT_PUBLIC_PLANS_ON=1 per Vercel environment once its Stripe keys,
// price ids and webhook are set (preview first, then production). The free count is /admin's setting.
export const PLANS_ON = process.env.NEXT_PUBLIC_PLANS_ON === "1";

// Digits in the email sign-in code. Must equal Supabase Auth → Email → "Email OTP Length" (hosted default: 8).
export const OTP_LENGTH = Math.min(10, Math.max(6, Number(process.env.NEXT_PUBLIC_OTP_LENGTH) || 6));
