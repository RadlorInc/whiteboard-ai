import { getAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { listChats } from "@/components/Chats";
import { AppFrame, PublicHeader } from "@/components/AppFrame";
import { Footer } from "@/components/Footer";
import { NamePrompt } from "@/components/NamePrompt";

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
  const [chats, { data: me }] = await Promise.all([
    account.hasAccess ? listChats(sb, RECENTS) : Promise.resolve([]),
    sb.from("profiles").select("public_name").maybeSingle(),   // RLS: own row; no name yet -> ask once (NamePrompt)
  ]);
  const email = account.user.email ?? "";
  return (
    <AppFrame email={email} allowance={account.allowance} chats={chats}>
      {me && !me.public_name && <NamePrompt email={email} />}
      {children}
    </AppFrame>
  );
}
