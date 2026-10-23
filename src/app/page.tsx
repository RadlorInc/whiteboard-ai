import Link from "next/link";
import { redirect } from "next/navigation";
import { SIGNUP_SOURCES } from "@/lib/age";
import { createClient } from "@/lib/supabase/server";
import { freeVideos, signupMode } from "@/lib/session";
import { PLANS_ON } from "@/product";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { PriceCompare } from "@/components/PriceCompare";

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
  const free = await freeVideos();

  return (
    <>
      <PublicHeader />
      <main className="landing" id="main">
        <section className="landing-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={168} height={116} />
          <h1>Ask anything. Watch it drawn.</h1>
          <p className="lede">Type a question and get a short voiced video that draws the answer step by step.</p>
          {/* Two equal doors: a returning user once took the big button for sign-in and ended up in sign-up
              (invite code, then birth date) with no way through (13 Oct 2026). */}
          <div className="landing-cta">
            <Link href={`/signup${src ? `?src=${src}` : ""}`} className="btn">
              {invite ? "Join the private beta" : "Get started"}
            </Link>
            <Link href="/signin" className="btn secondary">I have an account: sign in</Link>
          </div>
          <p className="muted small">Your first {free} videos are free.{PLANS_ON && " Want more? Packs from $4.99, plans from $13.99 a month."}</p>
          <Link href="/explore" className="small">See videos people made</Link>
        </section>

        {PLANS_ON && (
          <section className="landing-section" aria-labelledby="price-title">
            <p className="section-label">Price</p>
            <h2 id="price-title" className="price-head">Explainer videos for a fraction of the price.</h2>
            <PriceCompare free={free} />
          </section>
        )}

        <section className="landing-section">
          <p className="section-label">How it works</p>
          <ol className="steps3">
            <li className="card"><h3>Type a question</h3><p className="muted small">Biology, physics, chemistry, home improvements or auto repairs. One question per video works best.</p></li>
            <li className="card"><h3>Watch it drawn</h3><p className="muted small">A whiteboard lesson, voiced, step by step. Ask a follow-up in the same chat.</p></li>
            <li className="card"><h3>Replay any time</h3><p className="muted small">Your videos stay in your library. Watching again is free.</p></li>
          </ol>
        </section>


        <section className="landing-section">
          <p className="section-label">Good to know</p>
          <ul className="facts">
            {[
              `Your first ${free} videos are free${PLANS_ON ? "; a plan adds more" : ""}. Invite a friend for 10 more. A video that fails is never counted.`,
              PLANS_ON ? "Replaying your own videos is free. Cancel a plan any time." : "Replaying your own videos is free.",
              "For ages 13 and over.",
              "Answers are written by AI and can be wrong.",
            ].map((t) => <li key={t}><Icon name="check" size={16} />{t}</li>)}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
