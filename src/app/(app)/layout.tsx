import { getAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { listChats } from "@/components/Chats";
import { AppFrame, PublicHeader } from "@/components/AppFrame";
import { Footer } from "@/components/Footer";

// Every page here gets the sidebar when signed in, and the public header and footer when not (Explore, a shared
// video, Help, Pricing, legal). Pages that need an account still redirect themselves (requireAccount).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccount();
  if (!account?.ageBand) return (
    <>
      <PublicHeader />
      <div id="main" tabIndex={-1} className="public-main">{children}</div>
      <Footer />
    </>
  );
  const chats = account.hasAccess ? await listChats(await createClient()) : [];
  return <AppFrame email={account.user.email ?? ""} available={account.available} chats={chats}>{children}</AppFrame>;
}
