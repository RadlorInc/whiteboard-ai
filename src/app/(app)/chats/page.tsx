import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ChatList, listChats } from "@/components/Chats";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Chats") }; }

// Every chat (the sidebar shows the latest 30).
export default async function Chats() {
  await requireAccount("/chats");
  const chats = await listChats(await createClient(), 100);
  const t = await getT();
  return (
    <main className="page narrow stack">
      <div className="page-head">
        <h1>{t("Your chats")}</h1>
        <a href="/ask" className="btn sm">{t("New chat")}</a>
      </div>
      <div className="list-card"><ChatList chats={chats} empty={t("Your chats will show here.")} /></div>
    </main>
  );
}
