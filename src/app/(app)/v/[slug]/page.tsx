import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAccount } from "@/lib/session";
import { SeriesGate, SeriesView, type SeriesItem } from "@/components/SeriesView";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { ReportForm } from "@/components/ReportForm";
import { SaveButton } from "@/components/SaveButton";
import { SUBJECT_NAME, type Subject } from "@/components/Chats";
import { PRODUCT_NAME } from "@/product";
import { getT } from "@/lib/lang";

// §5.10: a public share page. No login, no owner identity, not indexed. A video from a chat brings the chat's other
// Explore videos with it, in order (explore_series), and related lessons below (explore_related). Signed out, only the
// opened video plays; the rest of the chat shows blurred behind "Sign up to watch the rest" (founder, 18 Oct 2026),
// and their scripts never leave the server.
// The link preview (messages, socials) names the question: "Shared video" told the receiver nothing.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = /^[A-Za-z0-9_-]{22}$/.test(slug) ? await (await createClient()).rpc("explore_series", { p_slug: slug }) : { data: null };
  const v = (data ?? []).find((r: { slug: string }) => r.slug === slug) as { question: string } | undefined;
  const t = await getT();
  const title = v?.question ?? t("Shared video");
  const description = t("A short lesson, drawn and explained step by step. Ask your own question on askRadlor.");
  return { title, description, robots: { index: false, follow: false },
    openGraph: { title, description, type: "video.other", images: ["/icon.png"] }, twitter: { card: "summary", title, description } };
}

export default async function Shared({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug)) notFound();
  const sb = await createClient();
  const [{ data: rows }, { data: rel }, account, { data: mine }] = await Promise.all([
    sb.rpc("explore_series", { p_slug: slug }),
    sb.rpc("explore_related", { p_slug: slug, p_limit: 6 }),
    getAccount(),
    sb.from("saved_items").select("slug"),                     // RLS: own (none when signed out)
  ]);
  const saved = (mine ?? []).map((r: { slug: string }) => r.slug);
  const items = (rows ?? []) as (SeriesItem & { subject: string | null })[];
  if (!items.length) notFound();
  const related = (rel ?? []) as ExploreItem[];
  const t = await getT();
  const subject = items[0].subject ? t(SUBJECT_NAME[items[0].subject as Subject]) : null;
  const start = Math.max(0, items.findIndex((v) => v.slug === slug));
  const gated = !account && items.length > 1;
  const shown = gated ? [items[start]] : items;
  const locked = gated ? items.filter((_, i) => i !== start).map((v) => v.question) : [];
  return (
    <main className="page stack">
      <div className="v-head">
        <h1>{shown[0].question}</h1>
        {/* the lesson is kept by its first video's slug, the one its Explore card uses */}
        <SaveButton slug={items[0].slug} saved={saved.includes(items[0].slug)} signedIn={!!account} label className="sm" />
        <p className="page-sub small">{[subject, items.length > 1 ? t("{n} videos", { n: items.length }) : null, t("Made with {product}", { product: PRODUCT_NAME })].filter(Boolean).join(" · ")}</p>
      </div>
      <SeriesView items={shown} start={gated ? 0 : start} />
      {gated && <SeriesGate questions={locked} next={`/v/${slug}`} />}
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <p className="muted small">{t("Ask any question and watch it drawn.")}</p>
        <div className="toolbar">
          <Link className="btn sm" href="/">{t("Ask your own")}</Link>
          <Link className="btn secondary sm" href="/explore">{t("Explore more")}</Link>
        </div>
      </div>
      <ReportForm slug={slug} />
      {related.length > 0 && (
        <section className="stack" style={{ marginTop: 40 }}>
          <h2>{t("More like this")}</h2>
          <ExploreGrid items={related} save={{ saved, signedIn: !!account }} />
        </section>
      )}
    </main>
  );
}
