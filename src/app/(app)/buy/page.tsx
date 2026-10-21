import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { LOCALE } from "@/lib/i18n";
import { getLang, getT } from "@/lib/lang";
import { PlanCards } from "@/components/PlanCards";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Get more videos") }; }

// Free 10 a month, then a plan (founder, 20 Oct 2026): plans renew monthly (unused plan videos end 3 days after the
// period). Packs are no longer sold.
export default async function Buy() {
  const { allowance: a } = await requireAccount("/buy");
  const lang = await getLang();
  const t = await getT();
  const day = new Date(a.resetsAt).toLocaleDateString(LOCALE[lang], { month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <main className="page stack">
      <div>
        <h1>{t("Get more videos")}</h1>
        <p className="page-sub">
          {t("{left} of {total} free videos left this month (they come back on {day})", { left: a.freeLeft, total: a.freeMonthly, day })}
          {a.plan > 0 ? t(a.plan === 1 ? ", plus 1 video from your plan" : ", plus {n} videos from your plan", { n: a.plan }) : ""}{t(". Videos that fail are never counted.")}
        </p>
      </div>
      <p className="muted small">{t("Pick the level you study at: a plan's lessons are taught at its level. Your free videos try every level.")}</p>
      <PlanCards buy="live" />
      <p className="muted small">{t("Under 18? Ask a parent or guardian before you buy. US cards only for now. Prices in USD, plus tax where applicable.")}</p>
    </main>
  );
}
