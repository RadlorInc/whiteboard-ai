import { getAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { listChats } from "@/components/Chats";
import { AppFrame, PublicHeader, type Resume } from "@/components/AppFrame";
import { Footer } from "@/components/Footer";

// Every page here gets the sidebar when signed in, and the public header and footer when not (Explore, a shared
// video, Help, Pricing, legal). Pages that need an account still redirect themselves (requireAccount).
// Recents shows the latest 10 chats (founder, 18 Oct 2026); "All chats" opens the rest.
const RECENTS = 10;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccount();
  if (!account?.ageBand) return (
    <>
      <PublicHeader />
      <div id="main" tabIndex={-1} className="public-main">{children}</div>
      <Footer />
    </>
  );
  const sb = await createClient();
  const chats = account.hasAccess ? await listChats(sb, RECENTS) : [];
  // "Continue learning" (founder, 18 Oct 2026): the latest chat, with a still of its first video. RLS: own only.
  let resume: Resume = null;
  if (chats[0]) {
    const { data } = await sb.from("generations").select("style, script").eq("conversation_id", chats[0].id)
      .eq("status", "succeeded").is("content_deleted_at", null).order("created_at", { ascending: true });
    if (data?.length) resume = { ...chats[0], n: data.length, style: data[0].style, script: data[0].script };
  }
  return <AppFrame email={account.user.email ?? ""} available={account.available} chats={chats} resume={resume}>{children}</AppFrame>;
}
