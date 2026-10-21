// Market-rep referrals (Radlor Ops, whiteboard-ai/marketing/rep-flow.md). A market rep's link is `/?ref=<code>`, plus
// `&me=1` on the link they use to make their own account. The proxy keeps the code in a cookie; sign-up stores it on the
// user (app_metadata) and reports it; checkout copies it onto the subscription; the webhook reports each paid invoice.
// Radlor Ops gets only an opaque user id, an amount and a date: never an email, a name or an age.
// Not configured (no RADLOR_OPS_URL / RADLOR_OPS_REF_SECRET) → nothing is sent. A failed report never fails the caller.
if (typeof window !== "undefined") throw new Error("lib/radlorOps imported in the browser");

export const REF_COOKIE = "ar_ref";
export const REF_DAYS = 60;
const CODE = /^[0-9a-f]{10}$/;

/** `?ref=<code>[&me=1]` → the cookie value `<code>` or `<code>.me`; anything else → null. */
export function refCookieValue(params: URLSearchParams): string | null {
  const code = params.get("ref");
  if (!code || !CODE.test(code)) return null;
  return params.get("me") === "1" ? `${code}.me` : code;
}

/** The cookie value back into its parts; null when it is not one of ours. */
export function parseRef(value: string | undefined | null): { code: string; self: boolean } | null {
  const m = value ? /^([0-9a-f]{10})(\.me)?$/.exec(value) : null;
  return m ? { code: m[1], self: Boolean(m[2]) } : null;
}

type RefEvent =
  | { kind: "join" | "signup"; code: string; app_user: string; event_key: string }
  | { kind: "payment"; code: string; app_user: string; amount_cents: number; paid_at: string; event_key: string };

export async function reportRef(event: RefEvent): Promise<void> {
  const url = process.env.RADLOR_OPS_URL, secret = process.env.RADLOR_OPS_REF_SECRET;
  if (!url || !secret) return;
  try {
    const res = await fetch(`${url}/api/ref`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("radlor ops ref: answered", res.status, event.kind);
  } catch {
    console.error("radlor ops ref: unreachable", event.kind);
  }
}
