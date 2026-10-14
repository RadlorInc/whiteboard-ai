import Link from "next/link";
import { redirect } from "next/navigation";
import { PRODUCT_NAME } from "@/product";
import { SIGNUP_SOURCES } from "@/lib/age";
import { createClient } from "@/lib/supabase/server";
import { signupMode } from "@/lib/session";
import { Footer } from "@/components/Footer";

// Landing (§5.5), a placeholder until the demo player exists (M4). A valid session goes to /ask from the server,
// before any HTML (§5.2).
export default async function Home({ searchParams }: PageProps<"/">) {
  const { data } = await (await createClient()).auth.getUser();
  if (data.user) redirect("/ask");

  const q = await searchParams;
  // A sign-in link from an email lands on the Site URL (here) with ?code= (PKCE) or an error. It goes to
  // /auth/callback, which signs the user in; left here it showed the sign-up button, and a returning user on a new
  // phone was walked into invite code and birth date (13 Oct 2026, production's Magic Link email had a link).
  if (typeof q.code === "string" || typeof q.error_code === "string") {
    const fwd = new URLSearchParams();
    for (const k of ["code", "error", "error_code"]) if (typeof q[k] === "string") fwd.set(k, q[k] as string);
    redirect(`/auth/callback?${fwd}`);
  }
  const utm = typeof q.utm_source === "string" ? q.utm_source.toLowerCase() : "";
  const src = SIGNUP_SOURCES.includes(utm) ? utm : q.ref ? "ref" : q.from === "share" ? "share" : "";
  const invite = (await signupMode()) === "invite";

  return (
    <>
      <main className="page stack">
        <p className="muted" style={{ fontWeight: 700 }}>
          {PRODUCT_NAME}
        </p>
        <h1>Ask anything. Watch it drawn.</h1>
        <p style={{ fontSize: "1.125rem" }}>
          Type a question and get a short voiced video that draws the answer step by step.
        </p>
        <div>
          {/* Two equal doors: a returning user once took the big button for sign-in and ended up in sign-up
              (invite code, then birth date) with no way through (13 Oct 2026). */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/signup${src ? `?src=${src}` : ""}`} className="btn">
              {invite ? "New here? Join the private beta" : "Get started"}
            </Link>
            <Link href="/signin" className="btn secondary">I have an account: sign in</Link>
          </div>
          <p className="muted small" style={{ marginTop: 8 }}>
            Plans from $9.99 a month, or $4.99 for 60 credits. No free plan.
          </p>
        </div>
        <p className="small">
          <Link href="/explore">Explore videos people made</Link>
        </p>

        <h2 style={{ paddingTop: 16 }}>How it works</h2>
        <ol style={{ listStyle: "decimal", paddingLeft: 24 }}>
          <li>Type a question.</li>
          <li>Watch it drawn on a whiteboard and voiced, step by step.</li>
          <li>Replay it any time, free.</li>
        </ol>

        <h2 style={{ paddingTop: 16 }}>Good to know</h2>
        <ul style={{ listStyle: "disc", paddingLeft: 24 }}>
          <li>1 credit = 10 seconds of video, rounded up. A video that fails is not charged.</li>
          <li>Replaying your own videos is free. Cancel a plan any time.</li>
          <li>For ages 13 and over.</li>
          <li>Answers are written by AI and can be wrong.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
