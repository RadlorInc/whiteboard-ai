import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { videosLeft } from "@/lib/videos";
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
        <div className="pack-row"><span className="muted">Videos left</span><span>{videosLeft(account.available)}</span></div>
      </section>
      <section className="card stack">
        <h2>Videos and billing</h2>
        <p className="muted small">Each answer is one short video. Videos that fail are never counted.</p>
        <div className="toolbar">
          <Link className="btn" href="/buy">Get more videos</Link>
          <BillingButton />
        </div>
      </section>
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
