import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAccount } from "@/lib/session";
import { notNow, redeemInvite } from "@/app/actions";
import { InviteForm } from "@/components/InviteForm";

export const metadata: Metadata = { title: "Choose how to pay" };

// §5.5 numbers. ponytail: inline until src/server/prices.ts / catalog.ts land with payments (M5).
const PLANS = [
  { name: "Plus", price: "$9.99 a month", credits: 150, note: "up to 25 minutes of video a month (about 37 videos)" },
  { name: "Pro", price: "$19.99 a month", credits: 330, note: "up to 55 minutes a month (about 82 videos)" },
];
const PACKS = [
  { price: "$4.99", credits: 60, note: "up to 10 minutes" },
  { price: "$9.99", credits: 132, note: "up to 22 minutes" },
  { price: "$19.99", credits: 282, note: "up to 47 minutes" },
];

// §5.4 /start: the first payment. Checkout arrives in M5; the cards are shown, the buttons are not live yet.
export default async function Start() {
  const account = await requireAccount("/start");
  const country = (await headers()).get("x-vercel-ip-country");
  return (
    <main className="page stack">
      {!account.hasAccess ? (
        <div className="narrow stack">
          <h1>Enter your invite code</h1>
          <p className="muted">This is a private beta. You need an invite code before you can buy credits.</p>
          <InviteForm action={redeemInvite} />
        </div>
      ) : (
        <>
          <div>
            <h1>Choose how to pay</h1>
            <p className="page-sub">Every video uses credits: 1 credit = 10 seconds. Failed videos are not charged.</p>
          </div>
          {country && country !== "US" && <p className="notice">Payments: US cards only for now.</p>}
          <p className="section-label">Plans</p>
          <ul className="grid-cards">
            {PLANS.map((p) => (
              <li key={p.name} className="card plan">
                <h2>{p.name}</h2>
                <p className="price">{p.price.replace(" a month", "")} <small>/ month</small></p>
                <p className="muted small">{p.credits} credits a month, {p.note}.</p>
                <button type="button" className="btn block" disabled aria-describedby="checkout-off" style={{ marginTop: 10 }}>
                  Choose {p.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="section-label" style={{ marginTop: 32 }}>Packs · one-time, never expire</p>
          <div className="list-card">
            {PACKS.map((p) => (
              <div key={p.credits} className="pack-row">
                <span><strong>{p.credits} credits</strong> <span className="muted">· {p.price} · {p.note}</span></span>
                <button type="button" className="btn secondary sm" disabled aria-describedby="checkout-off">Buy</button>
              </div>
            ))}
          </div>
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
