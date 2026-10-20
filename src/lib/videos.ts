// Free 10 a month, then a plan (founder, 20 Oct 2026; migration 20261020000400_free_tier.sql). 1 credit = 1 video:
// the month's free videos come first, then each video takes 1 from a plan. Admins never run out.
export type Allowance = {
  admin: boolean;
  freeLeft: number;        // free videos left this UTC month
  freeMonthly: number;     // ops_settings.free_videos_monthly
  plan: number;            // videos from a plan (and old packs or converted credits)
  planLevel: Level | null; // the active plan's level: its videos are taught at it; null = no plan
  resetsAt: string;        // when the free videos come back: the 1st of next month, UTC
};
export const HOLD_CREDITS = 1;
export const canAsk = (a: Allowance) => a.admin || a.freeLeft > 0 || a.plan >= HOLD_CREDITS;
export const videosLeft = (a: Allowance) => a.freeLeft + a.plan;
/** "November 1": the day the free videos come back (dates are UTC on the server). */
export const resetDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
/** The plans (= price_catalog; founder, 20 Oct 2026): 40 or 100 videos a month, one pair per level, each priced to
 *  keep $3 a month after Stripe, a 10% referral commission and the model cost. A plan's videos are taught at its level. */
export const PLANS = [
  { key: "plus", level: "school", name: "Plus", price: "$9.99", videos: 40 },
  { key: "pro", level: "school", name: "Pro", price: "$19.99", videos: 100 },
  { key: "plus_college", level: "undergrad", name: "College Plus", price: "$13.99", videos: 40 },
  { key: "pro_college", level: "undergrad", name: "College Pro", price: "$25.99", videos: 100 },
  { key: "plus_grad", level: "grad", name: "Grad Plus", price: "$13.99", videos: 40 },
  { key: "pro_grad", level: "grad", name: "Grad Pro", price: "$25.99", videos: 100 },
] as const satisfies readonly { key: string; level: Level; name: string; price: string; videos: number }[];
export const planLevel = (key: string | null | undefined): Level | null => PLANS.find(p => p.key === key)?.level ?? null;
/** The level a video is taught at: the chat's, capped to the plan's when a plan pays for it. */
export const taughtLevel = (chat: Level, cap: Level | null): Level =>
  cap && LEVELS.indexOf(chat) > LEVELS.indexOf(cap) ? cap : chat;
// A study chat's level (founder, 20 Oct 2026): what is taught, not how long (same length, same cost, 1 video each).
// Home and car fixes are always school.
export type Level = "school" | "undergrad" | "grad";
export const LEVELS: Level[] = ["school", "undergrad", "grad"];
export const LEVEL_NAME: Record<Level, string> = { school: "High school", undergrad: "College", grad: "Grad school" };
export const videos = (n: number) => `${n} ${n === 1 ? "video" : "videos"}`;
