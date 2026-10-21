import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAccount } from "@/lib/session";
import { notNow, redeemInvite } from "@/app/actions";
import { InviteForm } from "@/components/InviteForm";
import { LOCALE } from "@/lib/i18n";
import { getLang, getT } from "@/lib/lang";
import { PlanCards } from "@/components/PlanCards";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Get more videos") }; }

// §5.4 /start: shown once the month's free videos are used up (free tier, 20 Oct 2026). Checkout is not live yet.
export default async function Start() {
  const account = await requireAccount("/start");
  const country = (await headers()).get("x-vercel-ip-country");
  const lang = await getLang();
  const t = await getT();
  const day = new Date(account.allowance.resetsAt).toLocaleDateString(LOCALE[lang], { month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <main className="page stack">
      {!account.hasAccess ? (
        <div className="narrow stack">
          <h1>{t("Enter your invite code")}</h1>
          <p className="muted">{t("This is a private beta. You need an invite code to start.")}</p>
          <InviteForm action={redeemInvite} />
        </div>
      ) : (
        <>
          <div>
            <h1>{t("You've used this month's free videos")}</h1>
            <p className="page-sub">{t("Your {n} free videos come back on {day}. Want more now? Pick a plan at the level you study at. Failed videos are never counted.", { n: account.allowance.freeMonthly, day })}</p>
          </div>
          {country && country !== "US" && <p className="notice">{t("Payments: US cards only for now.")}</p>}
          <PlanCards buy="off" />
          <p id="checkout-off" className="muted small">{t("Payments aren't switched on yet.")}</p>
        </>
      )}
      <form action={notNow}>
        <button type="submit" className="btn ghost">
          {t("Not now")}
        </button>
      </form>
    </main>
  );
}
