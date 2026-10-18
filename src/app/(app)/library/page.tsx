import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { VIDEO_COLUMNS, VideoList, type VideoRow } from "@/components/VideoList";

export const metadata: Metadata = { title: "Your videos" };

// §5.9: the signed-in person's own videos. Replays are free.
export default async function Library() {
  await requireAccount("/library");
  const sb = await createClient();
  const { data } = await sb.from("generations").select(VIDEO_COLUMNS)
    .is("content_deleted_at", null).order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as VideoRow[];
  return (
    <main className="page stack">
      <div>
        <h1>Your videos</h1>
        <p className="page-sub">Watching them again is free.</p>
      </div>
      {rows.length === 0
        ? <div className="card"><p>No videos yet. <Link href="/ask">Ask your first question</Link>.</p></div>
        : <VideoList rows={rows} />}
    </main>
  );
}
