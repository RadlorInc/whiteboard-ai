// Who is signed in, and where they must go (PLAN.md §5.3). Server only.
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import { okNext } from "@/lib/age";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { canAsk, planLevel, type Allowance } from "@/lib/videos";

export const START_SEEN_COOKIE = "wb_start_seen";

/** `?next=` is accepted only as a same-site path (§5.2). */
export function safeNext(next: string | null | undefined, fallback = "/ask") {
  return okNext(next) ?? fallback;
}

export type Account = Awaited<ReturnType<typeof getAccount>>;

/** The verified user plus the profile and balance rows (RLS: own rows only). Null when signed out. Once per request:
 * the (app) layout and its page both ask. */
export const getAccount = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || !user.email_confirmed_at) return null;
  const month = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  const [profile, balance, paid, ops, admin, free] = await Promise.all([
    supabase.from("profiles").select("age_band, access_granted_at").eq("id", user.id).maybeSingle(),
    supabase.from("credit_balances").select("sub, topup, held, sub_plan, sub_expires_at").eq("user_id", user.id).maybeSingle(),
    // invite credits and their conversion to videos are free: they do not make an account "ever paid"
    supabase.from("credit_ledger").select("id").eq("user_id", user.id).not("kind", "in", "(invite_grant,convert)").limit(1),
    settings(),
    createAdminClient().from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    // this month's free videos: the ones that did not fail (= reserve_generation's count)
    supabase.from("generations").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("paid_with", "free")
      .neq("status", "failed").gte("created_at", month.toISOString()),
  ]);
  const b = balance.data;
  const available = b ? b.sub + b.topup - b.held : 0;
  const allowance: Allowance = {
    admin: !!admin.data, freeMonthly: ops.freeMonthly, freeLeft: Math.max(0, ops.freeMonthly - (free.count ?? 0)),
    plan: available, resetsAt: nextMonth.toISOString(),
    planLevel: b?.sub_expires_at && Date.parse(b.sub_expires_at) > Date.now() ? planLevel(b.sub_plan) : null,
  };
  return {
    user,
    ageBand: (profile.data?.age_band as string | null) ?? null,
    hasAccess: ops.signupMode !== "invite" || !!profile.data?.access_granted_at,
    available,
    allowance,
    everPaid: (paid.data?.length ?? 0) > 0,
  };
});

/** Every signed-in page: signed out → /signin, no age → /age. */
export async function requireAccount(path: string) {
  const account = await getAccount();
  if (!account) redirect(`/signin?next=${encodeURIComponent(path)}`);
  if (!account.ageBand) redirect("/age");
  // ponytail: the terms-out-of-date redirect to /legal/accept arrives with that page in M6 (§11.8).
  return account;
}

/** Where a signed-in, age-done user lands: nothing left to ask with and not yet past /start → /start, else `next`. */
export async function landing(account: NonNullable<Account>, next = "/ask") {
  if (!canAsk(account.allowance) && !(await cookies()).has(START_SEEN_COOKIE)) return "/start";
  return next;
}

/** ops_settings, through the service role (the table has no client policy). */
async function settings() {
  const { data } = await createAdminClient().from("ops_settings").select("signup_mode, free_videos_monthly").maybeSingle();
  return { signupMode: (data?.signup_mode as "invite" | "open" | "closed") ?? "invite", freeMonthly: data?.free_videos_monthly ?? 10 };
}
export async function signupMode(): Promise<"invite" | "open" | "closed"> {
  return (await settings()).signupMode;
}

/** Instagram, Facebook, TikTok and Snapchat webviews: Google blocks OAuth there (disallowed_useragent, §5.4). */
export function isInAppBrowser(ua: string | null) {
  return /Instagram|FBAN|FBAV|TikTok|Snapchat|musical_ly/i.test(ua ?? "");
}
