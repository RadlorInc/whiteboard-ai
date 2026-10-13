import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { VIDEO_COLUMNS, VideoList, type VideoRow } from "@/components/VideoList";

export const metadata: Metadata = { title: "Library" };

// §5.9: the signed-in person's own videos. Replays are free.
export default async function Library() {
  const account = await requireAccount("/library");
  const sb = await createClient();
  const { data } = await sb.from("generations").select(VIDEO_COLUMNS)
    .is("content_deleted_at", null).order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as VideoRow[];
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        <h1>Your videos</h1>
        {rows.length === 0 && <p>No videos yet. <Link href="/ask">Ask your first question</Link>.</p>}
        <VideoList rows={rows} />
      </main>
    </>
  );
}
