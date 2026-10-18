// Shown as videos, kept as credits (founder, 18 Oct 2026: "how many videos are left", not credits). The ledger still
// counts credits (1 per 10 s); a typical video is 30–40 s, so 4 credits, and starting one holds up to 6.
// ponytail: an estimate from the typical length; switch to a real count when pricing moves to 1 question = 1 video.
export const CREDITS_PER_VIDEO = 4;
export const HOLD_CREDITS = 6;
export const videosLeft = (credits: number) => (credits < HOLD_CREDITS ? 0 : Math.max(1, Math.floor(credits / CREDITS_PER_VIDEO)));
export const videos = (n: number) => `${n} ${n === 1 ? "video" : "videos"}`;
