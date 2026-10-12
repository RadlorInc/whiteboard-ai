import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAccount } from "@/lib/session";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Preferences } from "@/components/Preferences";
import { SignOutButton } from "@/components/SignOutButton";
import { BillingButton, DeleteAccount } from "@/components/AccountData";
import Link from "next/link";

export const metadata: Metadata = { title: "Account" };

// §5.11 /account, the shell: email, sign-in methods, theme, motion, sign out. Change email, credits, billing and
// data pages arrive with M5/M6.
export default async function Account() {
  const account = await requireAccount("/account");
  const jar = await cookies();
  const methods = [...new Set((account.user.identities ?? []).map((i) => (i.provider === "google" ? "Google" : "Email code")))];
  return (
    <>
      <Header available={account.available} />
      <main className="page narrow stack">
        <h1>Account</h1>
        <section className="card stack">
          <p>
            <span className="muted small">Email</span>
            <br />
            {account.user.email}
          </p>
          <p>
            <span className="muted small">Sign-in methods</span>
            <br />
            {methods.join(", ") || "Email code"}
          </p>
        </section>
        <section className="card stack">
          <h2>Credits</h2>
          <p>{account.available} credits available. A video uses 1 credit per 10 seconds.</p>
          <Link className="btn block" href="/buy">Buy credits</Link>
          <BillingButton />
          <a className="btn secondary block" href="/api/account/export">Download my data</a>
        </section>
        <Preferences theme={jar.get("wb_theme")?.value} motion={jar.get("wb_motion")?.value} />
        <section className="stack">
          <SignOutButton className="btn secondary block" />
          <SignOutButton className="btn link" scope="global" label="Sign out of all devices" />
        </section>
        <DeleteAccount />
      </main>
      <Footer />
    </>
  );
}
