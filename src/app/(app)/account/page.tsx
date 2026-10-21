import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { resetDay } from "@/lib/videos";
import { PLANS_ON } from "@/product";
import { SignOutButton } from "@/components/SignOutButton";
import { BillingButton, DeleteAccount } from "@/components/AccountData";

export const metadata: Metadata = { title: "Account" };

// §5.11 /account: email, sign-in methods, credits, your data, sign out. Voice and motion are in /settings.
export default async function Account() {
  const account = await requireAccount("/account");
  const methods = [...new Set((account.user.identities ?? []).map((i) => (i.provider === "google" ? "Google" : "Email code")))];
  return (
    <main className="page narrow stack">
      <h1>Account</h1>
      <section className="list-card">
        <div className="pack-row"><span className="muted">Email</span><span>{account.user.email}</span></div>
        <div className="pack-row"><span className="muted">Sign in with</span><span>{methods.join(", ") || "Email code"}</span></div>
        <div className="pack-row"><span className="muted">Free videos this month</span><span>{account.allowance.admin ? "Unlimited (admin)" : `${account.allowance.freeLeft} of ${account.allowance.freeMonthly} left · back on ${resetDay(account.allowance.resetsAt)}`}</span></div>
        {PLANS_ON && <div className="pack-row"><span className="muted">Videos from your plan</span><span>{account.allowance.plan}</span></div>}
      </section>
      {PLANS_ON && <section className="card stack">
        <h2>Videos and billing</h2>
        <p className="muted small">Each answer is one video. You get {account.allowance.freeMonthly} free every month; after that each video comes from a plan. Videos that fail are never counted.</p>
        <div className="toolbar">
          <Link className="btn" href="/buy">Get more videos</Link>
          <BillingButton />
        </div>
      </section>}
      <section className="card stack">
        <h2>Your data</h2>
        <div className="toolbar">
          <a className="btn secondary" href="/api/account/export">Download my data</a>
          <SignOutButton className="btn secondary" />
          <SignOutButton className="btn secondary" scope="global" label="Sign out of all devices" />
        </div>
      </section>
      <DeleteAccount />
    </main>
  );
}
