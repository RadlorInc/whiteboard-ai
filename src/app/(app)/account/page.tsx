import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { resetDay } from "@/lib/videos";
import { SignOutButton } from "@/components/SignOutButton";
import { BillingButton, DeleteAccount } from "@/components/AccountData";
import { getLang } from "@/lib/lang";
import { tFor } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> { return { title: tFor(await getLang())("Account") }; }

// §5.11 /account: email, sign-in methods, credits, your data, sign out. Voice and motion are in /settings.
export default async function Account() {
  const account = await requireAccount("/account");
  const lang = await getLang(), t = tFor(lang);
  const methods = [...new Set((account.user.identities ?? []).map((i) => (i.provider === "google" ? "Google" : t("Email code"))))];
  return (
    <main className="page narrow stack">
      <h1>{t("Account")}</h1>
      <section className="list-card">
        <div className="pack-row"><span className="muted">{t("Email")}</span><span>{account.user.email}</span></div>
        <div className="pack-row"><span className="muted">{t("Sign in with")}</span><span>{methods.join(", ") || t("Email code")}</span></div>
        <div className="pack-row"><span className="muted">{t("Free videos this month")}</span><span>{account.allowance.admin ? t("Unlimited (admin)") : t("{left} of {total} left · back on {day}", { left: account.allowance.freeLeft, total: account.allowance.freeMonthly, day: resetDay(account.allowance.resetsAt, lang) })}</span></div>
        <div className="pack-row"><span className="muted">{t("Videos from your plan")}</span><span>{account.allowance.plan}</span></div>
      </section>
      <section className="card stack">
        <h2>{t("Videos and billing")}</h2>
        <p className="muted small">{t("Each answer is one video. You get {n} free every month; after that each video comes from a plan. Videos that fail are never counted.", { n: account.allowance.freeMonthly })}</p>
        <div className="toolbar">
          <Link className="btn" href="/buy">{t("Get more videos")}</Link>
          <BillingButton />
        </div>
      </section>
      <section className="card stack">
        <h2>{t("Your data")}</h2>
        <div className="toolbar">
          <a className="btn secondary" href="/api/account/export">{t("Download my data")}</a>
          <SignOutButton className="btn secondary" />
          <SignOutButton className="btn secondary" scope="global" label="Sign out of all devices" />
        </div>
      </section>
      <DeleteAccount />
    </main>
  );
}
