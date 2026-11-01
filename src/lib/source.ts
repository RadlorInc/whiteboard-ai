// Where a new user came from (founder, 1 Nov 2026: after the launch every profiles.signup_source was null, so nobody
// could tell which channel worked). A channel link is `askradlor.com/?src=<channel>` (or `?utm_source=`) on any page; the proxy keeps the
// FIRST channel a visitor arrived from (60 days), and sign-up stores it once (complete_signup never overwrites it).
// A shared video (/v/…) with no channel counts as "share". At sign-up: the form's src, then this cookie, then a rep's
// ?ref= link ("ref"), then a friend's link ("friend"). Plain values only; nothing personal is stored.
//
// The allowed values must match the profiles check and complete_signup() (migration 20261101000100_signup_sources).
// A new channel = a new migration + this array; tests/auth/source.test.ts checks the array against the migration.
export const SIGNUP_SOURCES = [
  "tiktok", "instagram", "youtube", "reddit", "discord", "ref", "share", "direct", "whatsapp", "linkedin", "friend",
  "quora", "stackexchange",
] as const;
export type SignupSource = (typeof SIGNUP_SOURCES)[number];
export const SRC_COOKIE = "ar_src";

export const isSource = (s: unknown): s is SignupSource =>
  typeof s === "string" && (SIGNUP_SOURCES as readonly string[]).includes(s);

/** The channel a landing request names: `?src=` (or `?utm_source=`) if it is one of ours, else "share" on a shared video. */
export function landingSource(params: URLSearchParams, pathname: string): SignupSource | null {
  const src = (params.get("src") ?? params.get("utm_source"))?.toLowerCase();
  if (isSource(src)) return src;
  return pathname.startsWith("/v/") ? "share" : null;
}

/** The source stored at sign-up, in order of how direct the evidence is. */
export function pickSource(o: { form?: unknown; cookie?: unknown; hasRef?: boolean; hasFriend?: boolean }): SignupSource | null {
  if (isSource(o.form)) return o.form;
  if (isSource(o.cookie)) return o.cookie;
  if (o.hasRef) return "ref";
  if (o.hasFriend) return "friend";
  return null;
}
