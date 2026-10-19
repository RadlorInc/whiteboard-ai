import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ChatList, listChats } from "@/components/Chats";

export const metadata: Metadata = { title: "Chats" };

// Every chat (the sidebar shows the latest 30).
export default async function Chats() {
  await requireAccount("/chats");
  const chats = await listChats(await createClient(), 100);
  return (
    <main className="page narrow stack">
      <div className="page-head">
        <h1>Your chats</h1>
        <a href="/ask" className="btn sm">New chat</a>
      </div>
      <div className="list-card"><ChatList chats={chats} /></div>
    </main>
  );
}
