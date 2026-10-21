import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAccount } from "@/lib/session";
import { notNow, redeemInvite } from "@/app/actions";
import { InviteForm } from "@/components/InviteForm";
import { resetDay } from "@/lib/videos";
import { PlanCards } from "@/components/PlanCards";
import { PLANS_ON } from "@/product";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Get more videos" };

// §5.4 /start: shown once the month's free videos are used up (free tier, 20 Oct 2026). Checkout is not live yet.
export default async function Start() {
  if (!PLANS_ON) redirect("/ask");
  const account = await requireAccount("/start");
  const country = (await headers()).get("x-vercel-ip-country");
  return (
    <main className="page stack">
      {!account.hasAccess ? (
        <div className="narrow stack">
          <h1>Enter your invite code</h1>
          <p className="muted">This is a private beta. You need an invite code to start.</p>
          <InviteForm action={redeemInvite} />
        </div>
      ) : (
        <>
          <div>
            <h1>You&apos;ve used this month&apos;s free videos</h1>
            <p className="page-sub">Your {account.allowance.freeMonthly} free videos come back on {resetDay(account.allowance.resetsAt)}. Want more now? Pick a plan at the level you study at. Failed videos are never counted.</p>
          </div>
          {country && country !== "US" && <p className="notice">Payments: US cards only for now.</p>}
          <PlanCards buy="off" />
          <p id="checkout-off" className="muted small">Payments aren&apos;t switched on yet.</p>
        </>
      )}
      <form action={notNow}>
        <button type="submit" className="btn ghost">
          Not now
        </button>
      </form>
    </main>
  );
}
