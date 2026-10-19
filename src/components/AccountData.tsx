"use client";
import { useActionState } from "react";
import { deleteAccount } from "@/app/(app)/account/actions";

export function BillingButton() {
  return (
    <button className="btn secondary" type="button" onClick={async () => {
      const r = await fetch("/api/billing/portal", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (j.url) location.href = j.url;
      else alert(j.code === "no_customer" ? "You haven't bought anything yet." : "Billing isn't available right now.");
    }}>Manage plan and payment</button>
  );
}

export function DeleteAccount() {
  const [state, action, pending] = useActionState(deleteAccount, {});
  return (
    <form action={action} className="card stack">
      <h2>Delete account</h2>
      <p className="muted small">This deletes your videos, questions and share links. Unused credits are not refunded. A record of payments is kept for tax law.</p>
      <label>Type DELETE to confirm<input name="confirm" autoComplete="off" className="input" /></label>
      <button className="btn danger" disabled={pending}>Delete my account</button>
      {state?.error && <p role="alert" className="error">{state.error}</p>}
    </form>
  );
}
