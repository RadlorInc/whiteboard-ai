import Link from "next/link";
import { redirect } from "next/navigation";
import { SIGNUP_SOURCES } from "@/lib/age";
import { createClient } from "@/lib/supabase/server";
import { signupMode } from "@/lib/session";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { getT } from "@/lib/lang";

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
  const t = await getT();

  return (
    <>
      <PublicHeader />
      <main className="landing" id="main">
        <section className="landing-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={168} height={116} />
          <h1>{t("Ask anything. Watch it drawn.")}</h1>
          <p className="lede">{t("Type a question and get a short voiced video that draws the answer step by step.")}</p>
          {/* Two equal doors: a returning user once took the big button for sign-in and ended up in sign-up
              (invite code, then birth date) with no way through (13 Oct 2026). */}
          <div className="landing-cta">
            <Link href={`/signup${src ? `?src=${src}` : ""}`} className="btn">
              {invite ? t("Join the private beta") : t("Get started")}
            </Link>
            <Link href="/signin" className="btn secondary">{t("I have an account: sign in")}</Link>
          </div>
          <p className="muted small">{t("10 free videos every month. Want more? Plans from $9.99 a month.")}</p>
          <Link href="/explore" className="small">{t("See videos people made")}</Link>
        </section>

        <section className="landing-section">
          <p className="section-label">{t("How it works")}</p>
          <ol className="steps3">
            <li className="card"><h3>{t("Type a question")}</h3><p className="muted small">{t("Biology, physics, chemistry, or a home or car fix. One question per video works best.")}</p></li>
            <li className="card"><h3>{t("Watch it drawn")}</h3><p className="muted small">{t("A whiteboard lesson, voiced, step by step. Ask a follow-up in the same chat.")}</p></li>
            <li className="card"><h3>{t("Replay any time")}</h3><p className="muted small">{t("Your videos stay in your library. Watching again is free.")}</p></li>
          </ol>
        </section>

        <section className="landing-section">
          <p className="section-label">{t("Good to know")}</p>
          <ul className="facts">
            {[
              "10 free videos every month; a plan adds more. A video that fails is never counted.",
              "Replaying your own videos is free. Cancel a plan any time.",
              "For ages 13 and over.",
              "Answers are written by AI and can be wrong.",
            ].map((f) => <li key={f}><Icon name="check" size={16} />{t(f)}</li>)}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
