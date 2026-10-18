import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Chat, type Turn } from "@/components/Chat";
import type { Subject } from "@/components/Chats";

export const metadata: Metadata = { title: "Chat" };

// One conversation (founder, 18 Oct 2026): its questions and videos in order, and a box for a follow-up.
export default async function Conversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const account = await requireAccount(`/c/${id}`);
  const sb = await createClient();
  const { data: c } = await sb.from("conversations").select("id, subject").eq("id", id).maybeSingle();   // RLS: own only
  if (!c) notFound();
  const { data: rows } = await sb.from("generations").select("id, question, style, status, script").eq("conversation_id", id)
    .is("content_deleted_at", null).not("question", "is", null).order("created_at", { ascending: true });
  return (
    <Chat key={id} conversationId={id} subject={c.subject as Subject} turns={(rows ?? []) as Turn[]}
      available={account.available} firstRun={false} />
  );
}
