import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { VideoView } from "@/components/VideoView";

export const metadata: Metadata = { title: "Video" };

// §5.9: one of your own videos. Watching it again costs nothing (no generation).
export default async function Video({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const account = await requireAccount(`/videos/${id}`);
  const sb = await createClient();
  const { data: g } = await sb.from("generations")
    .select("id, style, question, status, script, credits_charged, created_at")
    .eq("id", id).is("content_deleted_at", null).maybeSingle();
  if (!g) notFound();
  const { data: share } = await sb.from("shares").select("slug, explore_at").eq("generation_id", id).maybeSingle();
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        <h1>{g.question}</h1>
        {g.status === "succeeded" && g.script
          ? <VideoView id={g.id} style={g.style} script={g.script} slug={share?.slug ?? null} inExplore={!!share?.explore_at} />
          : <p>{g.status === "failed" || g.status === "refunded" ? "This video didn't finish, so nothing was charged." : "This video is still being made. Refresh in a moment."}</p>}
      </main>
    </>
  );
}
