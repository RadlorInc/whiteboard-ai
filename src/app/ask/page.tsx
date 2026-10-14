import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { START_SEEN_COOKIE, requireAccount } from "@/lib/session";
import { redeemInvite } from "@/app/actions";
import { Header } from "@/components/Header";
import { InviteForm } from "@/components/InviteForm";
import { AskComposer } from "@/components/AskComposer";
import { VIDEO_COLUMNS, VideoList, type VideoRow } from "@/components/VideoList";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Ask" };

// §5.3 / §5.6: ask a question; below it the five latest of your videos.
export default async function Ask() {
  const account = await requireAccount("/ask");
  if (account.hasAccess && !account.everPaid && account.available === 0 && !(await cookies()).has(START_SEEN_COOKIE)) {
    redirect("/start");
  }
  const { data } = account.hasAccess
    ? await (await createClient()).from("generations").select(VIDEO_COLUMNS)
        .is("content_deleted_at", null).order("created_at", { ascending: false }).limit(5)
    : { data: [] };
  const recent = (data ?? []) as VideoRow[];
  return (
    <>
      <Header available={account.available} />
      <main className="page stack">
        {account.hasAccess ? (
          <>
            <AskComposer available={account.available} firstRun={!account.everPaid} />
            {recent.length > 0 && (
              <section className="stack" style={{ paddingTop: 16 }}>
                <h2>Your videos</h2>
                <VideoList rows={recent} />
                <Link href="/library" className="btn secondary block">See all your videos</Link>
              </section>
            )}
          </>
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
