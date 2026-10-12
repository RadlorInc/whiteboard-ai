import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

export const metadata: Metadata = { title: "Library" };
const STYLE = { whiteboard: "Whiteboard", paper: "Paper", matchcut: "Match-cut" } as Record<string, string>;

// §5.9: the signed-in person's own videos (RLS returns only their rows). Replays are free.
export default async function Library() {
  const account = await requireAccount("/library");
  const sb = await createClient();
  const { data } = await sb.from("generations")
    .select("id, created_at, style, question, status, credits_charged")
    .is("content_deleted_at", null).order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        <h1>Your videos</h1>
        {rows.length === 0 && <p>No videos yet. <Link href="/ask">Ask your first question</Link>.</p>}
        <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
          {rows.map(r => (
            <li key={r.id} className="card">
              <Link href={`/videos/${r.id}`}><strong>{r.question ?? "(deleted)"}</strong></Link>
              <p className="muted">
                {STYLE[r.style]} · {new Date(r.created_at).toLocaleDateString()} ·{" "}
                {r.status === "succeeded" ? `${r.credits_charged} credits` : r.status === "failed" || r.status === "refunded" ? "Not charged" : "Being made"}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
