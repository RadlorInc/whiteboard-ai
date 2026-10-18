import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Your videos" };
const PAGE = 24;

type Row = { id: string; created_at: string; style: string; question: string | null; status: string; credits_charged: number | null; script: unknown };
const day = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const cost = (r: Row) => r.status === "succeeded" ? `${r.credits_charged} credits` : r.status === "failed" || r.status === "refunded" ? "Not charged" : "Being made";

// §5.9: the signed-in person's own videos, as cards like Explore's. Replays are free. Search: search_my_videos.
export default async function Library({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAccount("/library");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.min(Math.max(Number.parseInt(sp.page ?? "1", 10) || 1, 1), 50);
  const sb = await createClient();
  const cols = "id, created_at, style, question, status, credits_charged, script";
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
  const items: ExploreItem[] = rows.map((r) => ({ slug: r.id, href: `/videos/${r.id}`, title: r.question ?? "(deleted)", style: r.style,
    script: r.status === "succeeded" ? r.script : null, n: 1, subject: null, latest: r.created_at, meta: `${day(r.created_at)} · ${cost(r)}` }));

  return (
    <main className="page wide stack">
      <div className="page-head">
        <div>
          <h1>Your videos</h1>
          <p className="page-sub">Watching them again is free.</p>
        </div>
        <form action="/library" role="search" className="x-search lib-search">
          <Icon name="search" size={18} />
          <label htmlFor="lq" className="sr-only">Search your videos</label>
          <input id="lq" name="q" type="search" defaultValue={q} placeholder="Search your videos" maxLength={100} enterKeyHint="search" />
        </form>
      </div>
      {items.length > 0 ? <ExploreGrid items={items} /> : (
        <div className="x-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={72} height={50} />
          <p>{q ? <>None of your videos match “{q}”.</> : page > 1 ? "No more videos." : "No videos yet."}</p>
          <Link className="btn sm" href="/ask">{q ? "Ask it" : "Ask your first question"}</Link>
        </div>
      )}
      {!q && items.length === PAGE && <div className="x-more"><Link className="btn secondary" href={`/library?page=${page + 1}`}>More videos</Link></div>}
    </main>
  );
}
