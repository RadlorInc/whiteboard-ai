// Who is signed in, and where they must go (PLAN.md §5.3). Server only.
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const HOLD_CREDITS = 6; // ponytail: belongs in src/billing/constants.ts once M3/M5 add it (§5.6)
export const START_SEEN_COOKIE = "wb_start_seen";

/** `?next=` is accepted only as a same-site path (§5.2). */
export function safeNext(next: string | null | undefined, fallback = "/ask") {
  return next && /^\/[^/\\]/.test(next) ? next : fallback;
}

export type Account = Awaited<ReturnType<typeof getAccount>>;

/** The verified user plus the profile and balance rows (RLS: own rows only). Null when signed out. */
export async function getAccount() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || !user.email_confirmed_at) return null;
  const [profile, balance, paid, ops] = await Promise.all([
    supabase.from("profiles").select("age_band, access_granted_at").eq("id", user.id).maybeSingle(),
    supabase.from("credit_balances").select("sub, topup, held").eq("user_id", user.id).maybeSingle(),
    // invite credits (invite_grant) are free: they do not make an account "ever paid"
    supabase.from("credit_ledger").select("id").eq("user_id", user.id).neq("kind", "invite_grant").limit(1),
    signupMode(),
  ]);
  const b = balance.data;
  return {
    user,
    ageBand: (profile.data?.age_band as string | null) ?? null,
    hasAccess: ops !== "invite" || !!profile.data?.access_granted_at,
    available: b ? b.sub + b.topup - b.held : 0,
    everPaid: (paid.data?.length ?? 0) > 0,
  };
}

/** Every signed-in page: signed out → /signin, no age → /age. */
export async function requireAccount(path: string) {
  const account = await getAccount();
  if (!account) redirect(`/signin?next=${encodeURIComponent(path)}`);
  if (!account.ageBand) redirect("/age");
  // ponytail: the terms-out-of-date redirect to /legal/accept arrives with that page in M6 (§11.8).
  return account;
}

/** Where a signed-in, age-done user lands: never paid and not yet past /start → /start, else `next`. */
export async function landing(account: NonNullable<Account>, next = "/ask") {
  if (!account.everPaid && account.available === 0 && !(await cookies()).has(START_SEEN_COOKIE)) return "/start";
  return next;
}

/** ops_settings.signup_mode, through the service role (the table has no client policy). */
export async function signupMode(): Promise<"invite" | "open" | "closed"> {
  const { data } = await createAdminClient().from("ops_settings").select("signup_mode").maybeSingle();
  return (data?.signup_mode as "invite" | "open" | "closed") ?? "invite";
}

/** Instagram, Facebook, TikTok and Snapchat webviews: Google blocks OAuth there (disallowed_useragent, §5.4). */
export function isInAppBrowser(ua: string | null) {
  return /Instagram|FBAN|FBAV|TikTok|Snapchat|musical_ly/i.test(ua ?? "");
}
