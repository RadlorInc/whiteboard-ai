import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isInAppBrowser, safeNext } from "@/lib/session";
import { SignInMethods } from "@/components/SignInMethods";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/AppFrame";

export const metadata: Metadata = { title: "Sign in" };

// §5.4: fixed copy per error code; error_description is never shown.
const ERRORS: Record<string, string> = {
  school: "Your school Google account can't sign in here. Use a personal Google account or sign in with email.",
  expired: "That link expired. Send a new code.",
  browser: "Sign-in started in a different browser. Start again here.",
  closed: "Sign-ups are closed for now.",
  failed: "Sign-in didn't finish. Try again.",
};

export default async function SignIn({ searchParams }: PageProps<"/signin">) {
  const q = await searchParams;
  const next = safeNext(typeof q.next === "string" ? q.next : null);
  const { data } = await (await createClient()).auth.getUser();
  if (data.user) redirect(next);

  const e = typeof q.e === "string" ? (ERRORS[q.e] ?? ERRORS.failed) : null;
  const inApp = isInAppBrowser((await headers()).get("user-agent"));
  return (
    <>
      <PublicHeader />
      <main className="auth stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={64} height={44} className="auth-mark" />
        <h1>Sign in</h1>
        <p className="auth-sub">Welcome back.</p>
        {e && (
          <p role="alert" className="error">
            {e}
          </p>
        )}
        <SignInMethods next={next} inApp={inApp} showGoogle={process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1" && !inApp} />
        <p className="small muted" style={{ textAlign: "center" }}>
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
