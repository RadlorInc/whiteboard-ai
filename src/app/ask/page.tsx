import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { START_SEEN_COOKIE, requireAccount } from "@/lib/session";
import { redeemInvite } from "@/app/actions";
import { Header } from "@/components/Header";
import { InviteForm } from "@/components/InviteForm";
import { AskComposer } from "@/components/AskComposer";

export const metadata: Metadata = { title: "Ask" };

// §5.3 / §5.6: the shell only. Generation arrives in M3.
export default async function Ask() {
  const account = await requireAccount("/ask");
  if (account.hasAccess && !account.everPaid && account.available === 0 && !(await cookies()).has(START_SEEN_COOKIE)) {
    redirect("/start");
  }
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        {account.hasAccess ? (
          <AskComposer available={account.available} firstRun={!account.everPaid} />
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
