// Finishing a sign-up (PLAN.md §5.4). Not a "use server" file on purpose: these take a user id, so they must never be
// callable from the browser. Callers pass the id of the user they verified with auth.getUser().
import { cookies } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { AGE_BLOCK_COOKIE, AGE_OK_COOKIE, INVITE_COOKIE, verify, type AgeOk } from "@/lib/age";
import { getAccount, landing, safeNext } from "@/lib/session";

if (typeof window !== "undefined") throw new Error("lib/signup imported in the browser");

const secure = process.env.NODE_ENV === "production";
export const cookieOpts = (maxAge: number) => ({ httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge });

/** Under 13: no account is kept (§5.4, §6.10). The auth.users delete trigger removes the profile rows. */
export async function blockUnder13(userId: string | undefined) {
  const jar = await cookies();
  if (userId) {
    const { error } = await createAdminClient().auth.admin.deleteUser(userId);
    if (error) throw new Error("could not delete the under-13 account");
    await (await createClient()).auth.signOut({ scope: "local" });
  }
  jar.delete(AGE_OK_COOKIE);
  jar.delete(INVITE_COOKIE);
  jar.set(AGE_BLOCK_COOKIE, "1", cookieOpts(86400));
}

/** complete_signup, then the invite. Returns where to go next. */
export async function completeSignup(userId: string, age: AgeOk): Promise<string> {
  const admin = createAdminClient();
  const { data: terms } = await admin.rpc("current_terms_version");
  const { data: result, error } = await admin.rpc("complete_signup", {
    p_user_id: userId, p_birth_year: age.year, p_birth_month: age.month, p_gate_version: age.gate_version,
    p_terms_version: terms, p_source: age.source,
  });
  if (error) throw new Error("complete_signup failed");
  const jar = await cookies();
  if (result === "under_13") {
    await blockUnder13(userId);
    return "/age";
  }
  if (result === "closed") {
    // Nothing was stored; the empty auth user is removed so no account is half-made.
    await admin.auth.admin.deleteUser(userId);
    await (await createClient()).auth.signOut({ scope: "local" });
    jar.delete(AGE_OK_COOKIE);
    return "/signin?e=closed";
  }
  if (result === "invalid") return "/age?e=invalid";
  jar.delete(AGE_OK_COOKIE);
  if (age.invite) await (await createClient()).rpc("redeem_invite", { p_code: age.invite });
  const account = await getAccount();
  if (!account) return "/signin";
  return age.next ? safeNext(age.next) : landing(account);    // back to the shared video it started from
}

/** After a verified sign-in (code or Google): age done → app; age cookie → complete_signup; neither → /age. */
export async function finishSignIn(next: string): Promise<string> {
  const account = await getAccount(); // the verified user, never an id the caller passed
  if (!account) return "/signin?e=failed";
  if (account.ageBand) return landing(account, safeNext(next));
  const age = verify<AgeOk>((await cookies()).get(AGE_OK_COOKIE)?.value);
  return age ? completeSignup(account.user.id, age) : "/age";
}

