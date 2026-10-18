import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAccount } from "@/lib/session";
import { SeriesGate, SeriesView, type SeriesItem } from "@/components/SeriesView";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { ReportForm } from "@/components/ReportForm";
import { SUBJECT_NAME, type Subject } from "@/components/Chats";
import { PRODUCT_NAME } from "@/product";

// §5.10: a public share page. No login, no owner identity, not indexed. A video from a chat brings the chat's other
// Explore videos with it, in order (explore_series), and related lessons below (explore_related). Signed out, only the
// opened video plays; the rest of the chat shows blurred behind "Sign up to watch the rest" (founder, 18 Oct 2026),
// and their scripts never leave the server.
export const metadata: Metadata = { title: "Shared video", robots: { index: false, follow: false } };

export default async function Shared({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug)) notFound();
  const sb = await createClient();
  const [{ data: rows }, { data: rel }, account] = await Promise.all([
    sb.rpc("explore_series", { p_slug: slug }),
    sb.rpc("explore_related", { p_slug: slug, p_limit: 6 }),
    getAccount(),
  ]);
  const items = (rows ?? []) as (SeriesItem & { subject: string | null })[];
  if (!items.length) notFound();
  const related = (rel ?? []) as ExploreItem[];
  const subject = items[0].subject ? SUBJECT_NAME[items[0].subject as Subject] : null;
  const start = Math.max(0, items.findIndex((v) => v.slug === slug));
  const gated = !account && items.length > 1;
  const shown = gated ? [items[start]] : items;
  const locked = gated ? items.filter((_, i) => i !== start).map((v) => v.question) : [];
  return (
    <main className="page stack">
      <div>
        <h1>{shown[0].question}</h1>
        <p className="page-sub small">{[subject, items.length > 1 ? `${items.length} videos` : null, `Made with ${PRODUCT_NAME}`].filter(Boolean).join(" · ")}</p>
      </div>
      <SeriesView items={shown} start={gated ? 0 : start} />
      {gated && <SeriesGate questions={locked} next={`/v/${slug}`} />}
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <p className="muted small">Ask any question and watch it drawn.</p>
        <div className="toolbar">
          <Link className="btn sm" href="/">Ask your own</Link>
          <Link className="btn secondary sm" href="/explore">Explore more</Link>
        </div>
      </div>
      <ReportForm slug={slug} />
      {related.length > 0 && (
        <section className="stack" style={{ marginTop: 40 }}>
          <h2>More like this</h2>
          <ExploreGrid items={related} />
        </section>
      )}
    </main>
  );
}
