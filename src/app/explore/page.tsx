import type { Metadata } from "next";
import Link from "next/link";
import { getAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { PRODUCT_NAME } from "@/product";

// Explore (founder, 13 Oct 2026): videos their makers chose to show, open to everyone without signing in. Each opens
// the public share page /v/[slug]; explore_list never returns who made it. Not indexed for now: user questions.
export const metadata: Metadata = { title: "Explore", robots: { index: false, follow: false } };
const STYLE = { whiteboard: "Whiteboard", paper: "Paper", matchcut: "Match-cut" } as Record<string, string>;
const PAGE = 24;

export default async function Explore({ searchParams }: { searchParams: Promise<{ before?: string }> }) {
  const { before } = await searchParams;
  const at = before && !Number.isNaN(Date.parse(before)) ? new Date(before).toISOString() : null;
  const account = await getAccount();
  const { data } = await (await createClient()).rpc("explore_list", { p_before: at, p_limit: PAGE });
  const rows: { slug: string; question: string; style: string; explore_at: string }[] = data ?? [];
  return (
    <>
      {account && <Header available={account.available} />}
      <main className="page stack">
        <h1>Explore</h1>
        <p className="muted">Videos people made with {PRODUCT_NAME} and chose to show.{" "}
          {account ? <Link href="/ask">Ask your own question</Link> : <Link href="/">Make your own</Link>}.</p>
        {rows.length === 0 && <p>{at ? "No more videos." : "Nothing here yet."}</p>}
        <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
          {rows.map((r) => (
            <li key={r.slug} className="card">
              <Link href={`/v/${r.slug}`}><strong>{r.question}</strong></Link>
              <p className="muted">{STYLE[r.style]} · {new Date(r.explore_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
        {rows.length === PAGE && <Link className="btn secondary" href={`/explore?before=${encodeURIComponent(rows[rows.length - 1].explore_at)}`}>More videos</Link>}
      </main>
    </>
  );
}
