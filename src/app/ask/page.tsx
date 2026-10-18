import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { START_SEEN_COOKIE, requireAccount } from "@/lib/session";
import { redeemInvite } from "@/app/actions";
import { Header } from "@/components/Header";
import { InviteForm } from "@/components/InviteForm";
import { Chat } from "@/components/Chat";
import { ChatList, listChats } from "@/components/Chats";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ask" };

// §5.3 / §5.6: a new chat (founder, 18 Oct 2026): pick a subject and ask; your chats are on the left on laptops,
// and on /chats from the menu on phones.
export default async function Ask() {
  const account = await requireAccount("/ask");
  if (account.hasAccess && !account.everPaid && account.available === 0 && !(await cookies()).has(START_SEEN_COOKIE)) {
    redirect("/start");
  }
  const chats = account.hasAccess ? await listChats(await createClient()) : [];
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        {account.hasAccess ? (
          <div className="chat-layout">
            <ChatList chats={chats} />
            <Chat conversationId={null} subject={null} turns={[]} available={account.available} firstRun={!account.everPaid} />
          </div>
        ) : (
          <div className="narrow stack">
            <h1>Enter your invite code</h1>
            <p>This is a private beta, invite only.</p>
            <InviteForm action={redeemInvite} />
          </div>
        )}
      </main>
    </>
  );
}
