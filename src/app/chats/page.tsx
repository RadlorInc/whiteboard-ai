import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ChatList, listChats } from "@/components/Chats";

export const metadata: Metadata = { title: "Chats" };

// Phones: the chat list (laptops show it beside the chat).
export default async function Chats() {
  const account = await requireAccount("/chats");
  const chats = await listChats(await createClient(), 100);
  return (
    <>
      <Header available={account.available} />
      <main className="page stack narrow">
        <h1>Your chats</h1>
        <ChatList chats={chats} />
      </main>
    </>
  );
}
