// The product's public name, in one place until the founder picks the real one (PLAN.md §2 A1).
export const PRODUCT_NAME = "askRadlor"; // founder, 15 Oct 2026

// FOUNDER DECIDES (A11): the real address once the domain exists.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

// Plans and payment (founder, 22 Oct 2026: users first, selling later). false: free videos only, and nothing anywhere
// shows a plan, a price or a buy button; /pricing, /buy and /start go to /ask. The free count is /admin's setting.
export const PLANS_ON = false;

// Digits in the email sign-in code. Must equal Supabase Auth → Email → "Email OTP Length" (hosted default: 8).
export const OTP_LENGTH = Math.min(10, Math.max(6, Number(process.env.NEXT_PUBLIC_OTP_LENGTH) || 6));
