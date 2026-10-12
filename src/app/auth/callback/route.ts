// OAuth return (Google, PKCE). Email codes never come here: verifyCode checks them (§5.4).
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finishSignIn } from "@/lib/signup";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const err = q.get("error_code") ?? q.get("error");
  // Fixed copy only; error_description is never passed on.
  if (err) {
    const e = ["access_denied", "admin_policy_enforced"].includes(err) ? "school" : err === "otp_expired" ? "expired" : "failed";
    redirect(`/signin?e=${e}`);
  }
  const code = q.get("code");
  if (!code) redirect("/signin?e=failed");
  const { error } = await (await createClient()).auth.exchangeCodeForSession(code);
  // A missing code verifier means the flow started in another browser (an in-app browser handing off to Safari).
  if (error) redirect(`/signin?e=${/verifier/i.test(error.message) || error.code === "bad_code_verifier" ? "browser" : "failed"}`);
  redirect(await finishSignIn(q.get("next") ?? "/ask"));
}
