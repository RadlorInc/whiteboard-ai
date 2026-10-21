"use client";
import { useActionState } from "react";
import { deleteAccount } from "@/app/(app)/account/actions";
import { useT } from "./Lang";

export function BillingButton() {
  const t = useT();
  return (
    <button className="btn secondary" type="button" onClick={async () => {
      const r = await fetch("/api/billing/portal", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (j.url) location.href = j.url;
      else alert(t(j.code === "no_customer" ? "You haven't bought anything yet." : "Billing isn't available right now."));
    }}>{t("Manage plan and payment")}</button>
  );
}

export function DeleteAccount() {
  const t = useT();
  const [state, action, pending] = useActionState(deleteAccount, {});
  return (
    <form action={action} className="card stack">
      <h2>{t("Delete account")}</h2>
      <p className="muted small">{t("This deletes your videos, questions and share links. Unused plan videos are not refunded. A record of payments is kept for tax law.")}</p>
      <label>{t("Type DELETE to confirm")}<input name="confirm" autoComplete="off" className="input" /></label>
      <button className="btn danger" disabled={pending}>{t("Delete my account")}</button>
      {state?.error && <p role="alert" className="error">{state.error}</p>}
    </form>
  );
}
