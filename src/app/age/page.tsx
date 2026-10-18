import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PRODUCT_NAME } from "@/product";
import { AGE_BLOCK_COOKIE, INVITE_COOKIE, SIGNUP_SOURCES, okNext, signupQuery, verify } from "@/lib/age";
import { getAccount, signupMode } from "@/lib/session";
import { AgeForm } from "@/components/AgeForm";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/AppFrame";

export const metadata: Metadata = { title: "Your age" };

// §5.4 (C24). Also the under-13 block page, while the 24 h age_block cookie exists.
export default async function Age({ searchParams }: PageProps<"/age">) {
  const jar = await cookies();
  if (jar.has(AGE_BLOCK_COOKIE)) {
    return (
      <>
        <PublicHeader />
      <main className="auth stack" id="main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={64} height={44} className="auth-mark" />
          <h1>Sorry, you can&apos;t use {PRODUCT_NAME}.</h1>
          <p>
            <Link href="/legal/privacy">Privacy Policy</Link>
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const account = await getAccount();
  if (account?.ageBand) redirect("/ask");
  const q = await searchParams;
  const src = typeof q.src === "string" && SIGNUP_SOURCES.includes(q.src) ? q.src : undefined;
  // Invite mode, signed out: the invite code comes first (§5.3), so no stranger's age or email is collected for nothing.
  if (!account && (await signupMode()) === "invite" && !verify(jar.get(INVITE_COOKIE)?.value)) {
    redirect(`/signup${signupQuery(src, q.next)}`);
  }

  return (
    <>
      <PublicHeader />
      <main className="auth stack" id="main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={64} height={44} className="auth-mark" />
        <h1>What&apos;s your birth month and year?</h1>
        <AgeForm src={src} next={okNext(q.next)} initialError={q.e === "invalid" ? "Choose your birth month and year." : undefined} />
      </main>
      <Footer />
    </>
  );
}
