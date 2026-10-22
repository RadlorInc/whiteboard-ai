// First 20 videos free, once, plus 10 per invited friend who made a video (at most 2 friends), then a plan (founder,
// 22 Oct 2026; migration 20261022000100_free_20_friends.sql). 1 credit = 1 video: the free videos come first, then each
// video takes 1 from a plan. Admins never run out.
export type Allowance = {
  admin: boolean;
  freeLeft: number;        // free videos left (they do not come back)
  freeTotal: number;       // ops_settings.free_videos (20) + 10 per friend who made a video
  friends: number;         // friends counted for the bonus (0-2, FRIENDS_MAX)
  plan: number;            // videos from a plan (and old packs or converted credits)
  planLevel: Level | null; // the active plan's level: its videos are taught at it; null = no plan
};
export const FRIEND_BONUS = 10, FRIENDS_MAX = 2;   // = free_videos() in the migration
export const HOLD_CREDITS = 1;
export const canAsk = (a: Allowance) => a.admin || a.freeLeft > 0 || a.plan >= HOLD_CREDITS;
export const videosLeft = (a: Allowance) => a.freeLeft + a.plan;
/** "November 1": the day a monthly limit lifts (dates are UTC on the server). */
export const resetDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
/** The plans and packs (= price_catalog, migration 20261022000300; founder, 22 Oct 2026): one price for every level.
 *  Level "grad" = never capped, so a plan's videos are taught at the chat's level. */
export const PLANS = [
  { key: "plus", level: "grad", name: "Plus", price: "$13.99", videos: 70 },
  { key: "pro", level: "grad", name: "Pro", price: "$25.99", videos: 150 },
] as const satisfies readonly { key: string; level: Level; name: string; price: string; videos: number }[];
export const PACKS = [
  { key: "topup_20", price: "$4.99", videos: 20 },
  { key: "topup_45", price: "$9.99", videos: 45 },
  { key: "topup_100", price: "$19.99", videos: 100 },
] as const;
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
