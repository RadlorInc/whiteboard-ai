import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { START_SEEN_COOKIE, requireAccount } from "@/lib/session";
import { redeemInvite } from "@/app/actions";
import { InviteForm } from "@/components/InviteForm";
import { Chat } from "@/components/Chat";

export const metadata: Metadata = { title: "Ask" };

// §5.3 / §5.6: a new chat (founder, 18 Oct 2026): pick a subject and ask; your chats are in the sidebar.
export default async function Ask() {
  const account = await requireAccount("/ask");
  if (account.hasAccess && !account.everPaid && account.available === 0 && !(await cookies()).has(START_SEEN_COOKIE)) {
    redirect("/start");
  }
  return account.hasAccess ? (
    <Chat conversationId={null} subject={null} turns={[]} available={account.available} firstRun={!account.everPaid} />
  ) : (
    <main className="page narrow stack">
      <h1>Enter your invite code</h1>
      <p className="muted">This is a private beta, invite only.</p>
      <InviteForm action={redeemInvite} />
    </main>
  );
}
