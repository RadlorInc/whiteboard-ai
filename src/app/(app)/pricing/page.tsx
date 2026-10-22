import type { Metadata } from "next";
import Link from "next/link";
import { PlanCards } from "@/components/PlanCards";
import { PLANS_ON } from "@/product";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Pricing" };

// §5.5: public pricing. First 20 free once, then a plan (founder, 22 Oct 2026). Every video is the same quality.
export default function Pricing() {
  if (!PLANS_ON) redirect("/ask");
  return (
    <main className="page stack">
      <div>
        <h1>Pricing</h1>
        <p className="page-sub">Your first 20 videos are free, at any level: try high school, college and grad school. Want more? Pick a plan at your level. Every video is the same quality, and failed videos are never counted.</p>
      </div>
      <ul className="grid-cards">
        <li className="card plan"><h2>Free</h2><p className="price">$0</p><p className="muted small">Your first 20 videos, any level. Invite a friend for 10 more.</p></li>
      </ul>
      <PlanCards />
      <p className="muted small">Prices in USD, plus tax where applicable. US cards only for now. Under 18? Ask a parent or guardian before you buy.</p>
      <div><Link className="btn" href="/signup">Get started free</Link></div>
    </main>
  );
}
