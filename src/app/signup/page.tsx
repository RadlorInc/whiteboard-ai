import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AGE_OK_COOKIE, INVITE_COOKIE, SIGNUP_SOURCES, okNext, signupQuery, verify, type AgeOk } from "@/lib/age";
import { createClient } from "@/lib/supabase/server";
import { isInAppBrowser, signupMode } from "@/lib/session";
import { checkInvite } from "@/app/actions";
import { InviteForm } from "@/components/InviteForm";
import { SignInMethods } from "@/components/SignInMethods";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/AppFrame";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign up" };

// §5.3–5.4: (invite code) → age → methods. The age screen always comes before any email is asked for.
export default async function SignUp({ searchParams }: PageProps<"/signup">) {
  const { data } = await (await createClient()).auth.getUser();
  if (data.user) redirect("/ask");

  const q = await searchParams;
  const src = typeof q.src === "string" && SIGNUP_SOURCES.includes(q.src) ? q.src : undefined;
  const jar = await cookies();
  const ageOk = verify<AgeOk>(jar.get(AGE_OK_COOKIE)?.value);
  const next = okNext(q.next);
  const mode = await signupMode();

  let body: React.ReactNode;
  if (mode === "closed") {
    body = <p>Sign-ups are closed for now.</p>;
  } else if (!ageOk && mode === "invite" && !verify(jar.get(INVITE_COOKIE)?.value)) {
    body = (
      <>
        <p>Private beta, invite only. Enter your invite code to continue.</p>
        <InviteForm action={checkInvite} src={src} next={next} />
      </>
    );
  } else if (!ageOk) {
    redirect(`/age${signupQuery(src, next)}`);
  } else {
    const inApp = isInAppBrowser((await headers()).get("user-agent"));
    body = (
      <SignInMethods next={ageOk?.next ?? "/start"} inApp={inApp} showGoogle={process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1" && !inApp} />
    );
  }

  return (
    <>
      <PublicHeader />
      <main className="auth stack" id="main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={64} height={44} className="auth-mark" />
        <h1>Create your account</h1>
        <p className="auth-sub small">
          Already have an account? <Link href="/signin">Sign in here</Link>: no invite code or birth date needed again.
        </p>
        {body}
      </main>
      <Footer />
    </>
  );
}
