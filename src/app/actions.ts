"use server";
// Sign-up, sign-in and the age gate (PLAN.md §5.3–5.4). Every write goes through these server actions, which Next
// checks for a same-origin request.
import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  AGE_BLOCK_COOKIE, AGE_GATE_VERSION, AGE_OK_COOKIE, INVITE_COOKIE, SIGNUP_SOURCES, ageCheck, sign, verify,
  type AgeOk,
} from "@/lib/age";
import { START_SEEN_COOKIE, getAccount, landing } from "@/lib/session";
import { blockUnder13, completeSignup, cookieOpts, finishSignIn } from "@/lib/signup";

function hmac(s: string) {
  const k = process.env.RATE_LIMIT_HMAC_KEY;
  if (!k) throw new Error("RATE_LIMIT_HMAC_KEY is not set");
  return createHmac("sha256", k).update(s).digest("hex").slice(0, 32);
}

async function ipHash() {
  const h = await headers();
  return hmac(h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown");
}

async function allowed(key: string, windowSeconds: number, max: number) {
  const { data, error } = await createAdminClient().rpc("hit_rate_limit", {
    p_key: key, p_window_seconds: windowSeconds, p_max: max,
  });
  if (error) throw new Error("rate limit check failed");
  return data === true;
}

export type FormState = { error?: string } | undefined;

// ---------- Invite (invite mode, before the age screen) ----------

export async function checkInvite(_: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").trim();
  if (!code || code.length > 64) return { error: "Enter your invite code." };
  if (!(await allowed(`invite:${await ipHash()}`, 3600, 10))) return { error: "Too many tries. Wait an hour and try again." };
  const { data } = await createAdminClient().rpc("invite_available", { p_code: code });
  if (data !== true) return { error: "That invite code isn't valid or has been used up." };
  (await cookies()).set(INVITE_COOKIE, sign({ code }, 1800), cookieOpts(1800));
  redirect(`/age${srcQuery(form)}`);
}

export async function redeemInvite(_: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").trim();
  const account = await getAccount();
  if (!account) redirect("/signin");
  if (!code || code.length > 64) return { error: "Enter your invite code." };
  if (!(await allowed(`invite:${account.user.id}`, 3600, 10))) return { error: "Too many tries. Wait an hour and try again." };
  const { data } = await (await createClient()).rpc("redeem_invite", { p_code: code });
  if (data !== true) return { error: "That invite code isn't valid or has been used up." };
  redirect(await landing(account));
}

function srcQuery(form: FormData) {
  const src = String(form.get("src") ?? "");
  return SIGNUP_SOURCES.includes(src) ? `?src=${src}` : "";
}

// ---------- Age ----------

export async function submitAge(_: FormState, form: FormData): Promise<FormState> {
  const jar = await cookies();
  if (jar.has(AGE_BLOCK_COOKIE)) redirect("/age");
  const month = Number(form.get("month"));
  const year = Number(form.get("year"));
  const check = ageCheck(year, month);
  if (check === "invalid") return { error: "Choose your birth month and year." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (check === "under_13") {
    await blockUnder13(data.user?.id);
    redirect("/age");
  }

  const src = String(form.get("src") ?? "");
  const invite = verify<{ code: string }>(jar.get(INVITE_COOKIE)?.value)?.code ?? null;
  const age: AgeOk = {
    month, year, gate_version: AGE_GATE_VERSION, source: SIGNUP_SOURCES.includes(src) ? src : null, invite,
  };

  // Signed in already (Google first, or a code from /signin): finish here.
  if (data.user) redirect(await completeSignup(data.user.id, age));

  jar.set(AGE_OK_COOKIE, sign(age, 1800), cookieOpts(1800));
  jar.delete(INVITE_COOKIE);
  redirect("/signup");
}

// ---------- Email code ----------

export async function verifyCode(emailIn: string, token: string, next: string): Promise<FormState> {
  const email = String(emailIn).trim().toLowerCase();
  if (!/^\d{6,10}$/.test(String(token)) || !email.includes("@") || email.length > 254) {
    return { error: "That code isn't right. Check the latest email." };
  }
  if (!(await allowed(`otp:${hmac(email)}`, 600, 5))) {
    return { error: "Too many tries. Wait a minute and send a new code." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) {
    if (error?.status === 429) return { error: "Too many tries. Wait a minute and send a new code." };
    // GoTrue answers otp_expired for a wrong code and an expired one alike, so one message covers both.
    return { error: "That code isn't right or has expired. Check the latest email, or send a new code." };
  }
  redirect(await finishSignIn(next));
}

// ---------- Session ----------

export async function signOut(form: FormData) {
  const scope = form.get("scope") === "global" ? "global" : "local";
  await (await createClient()).auth.signOut({ scope });
  redirect("/");
}

export async function notNow() {
  (await cookies()).set(START_SEEN_COOKIE, "1", { ...cookieOpts(60 * 60 * 24 * 365), httpOnly: true });
  redirect("/ask");
}
