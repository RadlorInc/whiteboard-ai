import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Subject = "biology" | "physics" | "chemistry";
export const SUBJECT_NAME: Record<Subject, string> = { biology: "Biology", physics: "Physics", chemistry: "Chemistry" };
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

// The chat list: the left column on laptops, the /chats page on phones.
export function ChatList({ chats, active }: { chats: ChatRow[]; active?: string }) {
  return (
    <nav className="chat-list" aria-label="Your chats">
      {/* a full load, so a chat in progress on /ask starts over clean */}
      <a href="/ask" className="btn secondary block">+ New chat</a>
      {chats.length === 0 && <p className="muted small">Your chats will show here.</p>}
      <ul>
        {chats.map(c => (
          <li key={c.id}>
            <Link href={`/c/${c.id}`} aria-current={c.id === active ? "page" : undefined}>
              <span className="chat-title">{c.title}</span>
              <span className="muted small">{SUBJECT_NAME[c.subject]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
