import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { videos } from "@/lib/videos";
import { PlanCards } from "@/components/PlanCards";
import { PLANS_ON } from "@/product";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Get more videos" };

// First 20 free once, then a plan (founder, 22 Oct 2026): plans renew monthly (unused plan videos end 3 days after the
// period). Packs are no longer sold.
export default async function Buy() {
  if (!PLANS_ON) redirect("/ask");
  const { allowance: a } = await requireAccount("/buy");
  return (
    <main className="page stack">
      <div>
        <h1>Get more videos</h1>
        <p className="page-sub">
          {a.freeLeft} of {a.freeTotal} free videos left
          {a.plan > 0 ? `, plus ${videos(a.plan)} from your plan` : ""}. Videos that fail are never counted.
        </p>
      </div>
      <p className="muted small">Pick the level you study at: a plan&apos;s lessons are taught at its level. Your free videos try every level.</p>
      <PlanCards buy="live" />
      <p className="muted small">Under 18? Ask a parent or guardian before you buy. US cards only for now. Prices in USD, plus tax where applicable.</p>
    </main>
  );
}
