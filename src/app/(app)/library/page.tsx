import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { Icon } from "@/components/Icon";
import { getLang } from "@/lib/lang";
import { LOCALE, tFor, type Lang, type T } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> { return { title: tFor(await getLang())("Your videos") }; }
const PAGE = 24;

type Row = { id: string; created_at: string; style: string; question: string | null; status: string; script: unknown };
const day = (d: string, lang: Lang) => new Date(d).toLocaleDateString(LOCALE[lang], { month: "short", day: "numeric" });
// No credits here (founder, 18 Oct 2026): only what is not a normal finished video says so.
const state = (r: Row, t: T) => r.status === "failed" || r.status === "refunded" ? ` · ${t("Didn't finish, not counted")}` : r.status === "succeeded" ? "" : ` · ${t("Being made")}`;

// §5.9: the signed-in person's own videos, as cards like Explore's. Replays are free. Search: search_my_videos.
export default async function Library({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAccount("/library");
  const lang = await getLang(), t = tFor(lang);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.min(Math.max(Number.parseInt(sp.page ?? "1", 10) || 1, 1), 50);
  const sb = await createClient();
  const cols = "id, created_at, style, question, status, script";
  let rows: Row[];
  if (q) {
    const { data: hits } = await sb.rpc("search_my_videos", { p_q: q });
    const ids = ((hits ?? []) as { id: string }[]).map((h) => h.id);
    const { data } = ids.length ? await sb.from("generations").select(cols).in("id", ids).order("created_at", { ascending: false }) : { data: [] };
    rows = (data ?? []) as Row[];
  } else {
    const { data } = await sb.from("generations").select(cols).is("content_deleted_at", null).not("question", "is", null)
      .order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    rows = (data ?? []) as Row[];
  }
  const items: ExploreItem[] = rows.map((r) => ({ slug: r.id, href: `/videos/${r.id}`, title: r.question ?? t("(deleted)"), style: r.style,
    script: r.status === "succeeded" ? r.script : null, n: 1, subject: null, latest: r.created_at, meta: `${day(r.created_at, lang)}${state(r, t)}` }));

  return (
    <main className="page wide stack">
      <div className="page-head">
        <div>
          <h1>{t("Your videos")}</h1>
          <p className="page-sub">{t("Watching them again is free.")}</p>
        </div>
        <form action="/library" role="search" className="x-search lib-search">
          <Icon name="search" size={18} />
          <label htmlFor="lq" className="sr-only">{t("Search your videos")}</label>
          <input id="lq" name="q" type="search" defaultValue={q} placeholder={t("Search your videos")} maxLength={100} enterKeyHint="search" />
        </form>
      </div>
      {items.length > 0 ? <ExploreGrid items={items} /> : (
        <div className="x-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={72} height={50} />
          <p>{q ? t("None of your videos match “{q}”.", { q }) : t(page > 1 ? "No more videos." : "No videos yet.")}</p>
          <Link className="btn sm" href="/ask">{t(q ? "Ask it" : "Ask your first question")}</Link>
        </div>
      )}
      {!q && items.length === PAGE && <div className="x-more"><Link className="btn secondary" href={`/library?page=${page + 1}`}>{t("More videos")}</Link></div>}
    </main>
  );
}
