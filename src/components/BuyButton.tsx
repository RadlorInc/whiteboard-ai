"use client";
import { useState } from "react";

const MSG: Record<string, string> = {
  payments_not_configured: "Payments aren't switched on yet.",
  access_required: "You need an invite before you can buy.",
  signed_out: "Sign in again to buy.",
};

export function BuyButton({ priceKey, label }: { priceKey: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="stack">
      <button className="btn" type="button" disabled={busy} onClick={async () => {
        setBusy(true); setError(null);
        const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ price_key: priceKey }) });
        const j = await r.json().catch(() => ({}));
        if (j.url) { location.href = j.url; return; }
        setError(MSG[j.code] ?? "Couldn't start checkout. Try again."); setBusy(false);
      }}>{busy ? "Opening checkout…" : label}</button>
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  );
}
