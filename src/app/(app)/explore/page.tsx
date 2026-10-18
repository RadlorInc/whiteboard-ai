import type { Metadata } from "next";
import Link from "next/link";
import { getAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { Icon } from "@/components/Icon";
import { SUBJECT_NAME, type Subject } from "@/components/Chats";

// Explore (founder, 13 + 18 Oct 2026): everyone's videos, open without signing in, one card per chat. Search looks in
// the questions and the narration (explore_feed); never the maker. Not indexed for now: user questions.
export const metadata: Metadata = { title: "Explore", robots: { index: false, follow: false } };
const PAGE = 24;

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const subject = sp.subject && sp.subject in SUBJECT_NAME ? (sp.subject as Subject) : null;
  const page = Math.min(Math.max(Number.parseInt(sp.page ?? "1", 10) || 1, 1), 50);
  const account = await getAccount();
  const { data } = await (await createClient()).rpc("explore_feed",
    { p_q: q || null, p_subject: subject, p_offset: (page - 1) * PAGE, p_limit: PAGE });
  const items = (data ?? []) as ExploreItem[];
  const href = (o: { q?: string; subject?: string | null; page?: number }) => {
    const p = new URLSearchParams();
    const nq = o.q ?? q, ns = o.subject === undefined ? subject : o.subject;
    if (nq) p.set("q", nq);
    if (ns) p.set("subject", ns);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    return `/explore${p.size ? `?${p}` : ""}`;
  };

  return (
    <main className="page wide stack">
      <div className="x-head">
        <h1>Explore</h1>
        <p className="page-sub">Lessons people asked for, drawn and explained.</p>
        <form action="/explore" role="search" className="x-search">
          <Icon name="search" size={18} />
          <label htmlFor="xq" className="sr-only">Search videos</label>
          <input id="xq" name="q" type="search" defaultValue={q} placeholder="Search: heart, rainbow, atoms…" maxLength={100} enterKeyHint="search" />
          {subject && <input type="hidden" name="subject" value={subject} />}
        </form>
        <nav className="x-chips" aria-label="Subject">
          <Link href={href({ subject: null })} className={`chip${subject ? "" : " on"}`} aria-current={subject ? undefined : "page"}>All</Link>
          {(Object.keys(SUBJECT_NAME) as Subject[]).map((s) => (
            <Link key={s} href={href({ subject: s })} className={`chip${subject === s ? " on" : ""}`} aria-current={subject === s ? "page" : undefined}>
              {SUBJECT_NAME[s]}
            </Link>
          ))}
        </nav>
      </div>

      {q && <p className="muted small">{items.length ? `Results for “${q}”` : ""}</p>}
      {items.length > 0 ? <ExploreGrid items={items} /> : (
        <div className="x-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={72} height={50} />
          <p>{q ? <>No videos about “{q}” yet.</> : page > 1 ? "No more videos." : "Nothing here yet."}</p>
          <Link className="btn sm" href={account ? "/ask" : "/"}>{q ? "Ask it yourself" : "Make the first one"}</Link>
        </div>
      )}
      {items.length === PAGE && <div className="x-more"><Link className="btn secondary" href={href({ page: page + 1 })}>More videos</Link></div>}
    </main>
  );
}
