// The product's public name, in one place until the founder picks the real one (PLAN.md §2 A1).
export const PRODUCT_NAME = "Ask Radlor"; // founder, 15 Oct 2026; two words since 23 Oct 2026

// The public origin, for canonical URLs, the sitemap and link previews. Hard-coded so a preview deploy never names
// itself canonical; the bare askradlor.com 308s here. radlor.com/askradlor names this app by PRODUCT_ID.
export const SITE_URL = "https://www.askradlor.com";
export const PRODUCT_ID = `${SITE_URL}/#app`;
// Search-result wording (founder, 23 Oct 2026: price first, "around 20¢" on purpose so it stays true if prices move a
// little; Pro 17¢, Plus 20¢, packs 20-25¢). First sentence stands alone under ~155 characters.
export const searchDescription = (free: number, plansOn: boolean) =>
  `Your first ${free} videos are free${plansOn ? ", then around 20¢ a video" : ""}. Type any question and watch a short ` +
  "voiced video draw the answer step by step: biology, physics, chemistry, home and car fixes. Ages 13+.";

// FOUNDER DECIDES (A11): the real address once the domain exists.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

// Plans and payment (founder, 22 Oct 2026). Off: free videos only, and nothing anywhere shows a plan, a price or a buy
// button; /pricing, /buy and /start go to /ask. NEXT_PUBLIC_PLANS_ON=1 per Vercel environment once its Stripe keys,
// price ids and webhook are set (preview first, then production). The free count is /admin's setting.
export const PLANS_ON = process.env.NEXT_PUBLIC_PLANS_ON === "1";

// The Anatomy recipes switch, page side (the server's is ANATOMY_RECIPES): the whiteboard player loads only the drawing
// files each board names (lib/wb-load.js lazy=1). Set both per Vercel environment: staging first.
export const ANATOMY_ON = process.env.NEXT_PUBLIC_ANATOMY_RECIPES === "1";
// The whiteboard player's address for a chat subject (it loads that subject's drawing files; none = all of them).
export const boardPage = (subject?: string | null) => {
  const q = [subject ? `subject=${encodeURIComponent(subject)}` : "", ANATOMY_ON ? "lazy=1" : ""].filter(Boolean).join("&");
  return `/player/index.html${q ? `?${q}` : ""}`;
};

// Digits in the email sign-in code. Must equal Supabase Auth → Email → "Email OTP Length" (hosted default: 8).
export const OTP_LENGTH = Math.min(10, Math.max(6, Number(process.env.NEXT_PUBLIC_OTP_LENGTH) || 6));
