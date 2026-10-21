import type { Metadata } from "next";
import Link from "next/link";
import { PlanCards } from "@/components/PlanCards";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Pricing") }; }

// §5.5: public pricing. Free 10 a month, then a plan (founder, 20 Oct 2026). Every video is the same quality.
export default async function Pricing() {
  const t = await getT();
  return (
    <main className="page stack">
      <div>
        <h1>{t("Pricing")}</h1>
        <p className="page-sub">{t("Every account gets 10 free videos a month, at any level: try high school, college and grad school. Want more? Pick a plan at your level. Every video is the same quality, and failed videos are never counted.")}</p>
      </div>
      <ul className="grid-cards">
        <li className="card plan"><h2>{t("Free")}</h2><p className="price">$0</p><p className="muted small">{t("10 videos a month, any level.")}</p></li>
      </ul>
      <PlanCards />
      <p className="muted small">{t("Prices in USD, plus tax where applicable. US cards only for now. Under 18? Ask a parent or guardian before you buy.")}</p>
      <div><Link className="btn" href="/signup">{t("Get started free")}</Link></div>
    </main>
  );
}
