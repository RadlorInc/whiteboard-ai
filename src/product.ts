// The product's public name, in one place until the founder picks the real one (PLAN.md §2 A1).
export const PRODUCT_NAME = "askRadlor"; // founder, 15 Oct 2026

// FOUNDER DECIDES (A11): the real address once the domain exists.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

// Digits in the email sign-in code. Must equal Supabase Auth → Email → "Email OTP Length" (hosted default: 8).
export const OTP_LENGTH = Math.min(10, Math.max(6, Number(process.env.NEXT_PUBLIC_OTP_LENGTH) || 6));
