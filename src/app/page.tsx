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
          <Link href={`/signup${src ? `?src=${src}` : ""}`} className="btn">
            {invite ? "Private beta, invite only" : "Get started"}
          </Link>
          <p className="muted small" style={{ marginTop: 8 }}>
            Plans from $9.99 a month, or $4.99 for 60 credits. No free plan.
          </p>
        </div>
        <p className="small">
          Already have an account? <Link href="/signin">Sign in</Link>
        </p>

        <h2 style={{ paddingTop: 16 }}>How it works</h2>
        <ol style={{ listStyle: "decimal", paddingLeft: 24 }}>
          <li>Type a question.</li>
          <li>Pick a style.</li>
          <li>Watch it drawn and voiced.</li>
          <li>Replay it any time, free.</li>
        </ol>

        <h2 style={{ paddingTop: 16 }}>Three styles</h2>
        <ul className="grid-cards">
          <li className="card"><strong>Whiteboard</strong>: numbered steps on a board. Best for how things work, sums and diagrams.</li>
          <li className="card"><strong>Paper</strong>: cut-paper scenes with no writing. Best for journeys into and out of things.</li>
          <li className="card"><strong>Match-cut</strong>: one object turns into the next. Best for how something changed over time.</li>
        </ul>

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
