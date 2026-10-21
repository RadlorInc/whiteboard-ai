import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ExploreGrid, type ExploreItem } from "@/components/ExploreGrid";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Collection") }; }

// Lessons you saved from Explore (founder, 18 Oct 2026), newest saved first. The bookmark takes one out again.
export default async function Saved() {
  await requireAccount("/saved");
  const { data } = await (await createClient()).rpc("my_saved", { p_limit: 200 });
  const items = (data ?? []) as ExploreItem[];
  const t = await getT();
  return (
    <main className="page wide stack">
      <div>
        <h1>{t("Collection")}</h1>
        <p className="page-sub">{t("Lessons you saved from Explore.")}</p>
      </div>
      {items.length > 0 ? <ExploreGrid items={items} save={{ saved: items.map((i) => i.slug), signedIn: true }} /> : (
        <div className="x-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={72} height={50} />
          <p>{t("Nothing saved yet. Tap the bookmark on a lesson in Explore to keep it here.")}</p>
          <Link className="btn sm" href="/explore">{t("Go to Explore")}</Link>
        </div>
      )}
    </main>
  );
}
