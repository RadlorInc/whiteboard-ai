import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Subject = "biology" | "physics" | "chemistry" | "home" | "car";
export const SUBJECT_NAME: Record<Subject, string> = { biology: "Biology", physics: "Physics", chemistry: "Chemistry", home: "Home improvements", car: "Auto repairs" };
// The picker's groups (founder, 20 Oct 2026): school subjects, then Everyday fixes with its own Home and Car libraries.
export const SUBJECT_GROUPS: [string, Subject[]][] = [["Study", ["biology", "physics", "chemistry"]], ["Everyday fixes", ["home", "car"]]];
export type ChatRow = { id: string; subject: Subject; title: string };

// The signed-in person's conversations, newest first, each titled by its first question (RLS: only their own).
// A conversation whose first ask never got a video (refused, no credits) has no title and is left out.
export async function listChats(sb: SupabaseClient, limit = 30): Promise<ChatRow[]> {
  const { data: convs } = await sb.from("conversations").select("id, subject").order("created_at", { ascending: false }).limit(limit);
  if (!convs?.length) return [];
  const { data: gens } = await sb.from("generations").select("conversation_id, question")
    .in("conversation_id", convs.map(c => c.id)).not("question", "is", null).order("created_at", { ascending: true });
  const first = new Map<string, string>();
  for (const g of gens ?? []) if (!first.has(g.conversation_id)) first.set(g.conversation_id, g.question);
  return convs.filter(c => first.has(c.id)).map(c => ({ id: c.id, subject: c.subject as Subject, title: first.get(c.id)! }));
}

// The chat list: the sidebar's Recents, and the /chats page. Titles only; the subject shows inside the chat.
export function ChatList({ chats, active }: { chats: ChatRow[]; active?: string }) {
  if (chats.length === 0) return <p className="side-empty">Your chats will show here.</p>;
  return (
    <ul className="chat-list">
      {chats.map(c => (
        <li key={c.id}>
          <Link href={`/c/${c.id}`} title={c.title} aria-current={c.id === active ? "page" : undefined}>{c.title}</Link>
        </li>
      ))}
    </ul>
  );
}
