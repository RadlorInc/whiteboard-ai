import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { BuyButton } from "@/components/BuyButton";

export const metadata: Metadata = { title: "Buy credits" };
const PLANS = [
  { key: "plus", name: "Plus", price: "$9.99", credits: 150, note: "About 35 short videos a month" },
  { key: "pro", name: "Pro", price: "$19.99", credits: 330, note: "About 80 short videos a month" },
];
const PACKS = [
  { key: "topup_60", price: "$4.99", credits: 60 },
  { key: "topup_132", price: "$9.99", credits: 132 },
  { key: "topup_282", price: "$19.99", credits: 282 },
];

// §5.11 / §8.2: plans renew monthly (unused plan credits end 3 days after the period); pack credits never expire.
export default async function Buy() {
  const account = await requireAccount("/buy");
  return (
    <main className="page stack">
      <div>
        <h1>Buy credits</h1>
        <p className="page-sub">You have {account.available} credits. 1 credit = 10 seconds of video; most videos use 3 or 4. Failed videos are never charged.</p>
      </div>
      <p className="section-label">Monthly plans</p>
      <ul className="grid-cards">
        {PLANS.map(p => (
          <li key={p.key} className="card plan">
            <h2>{p.name}</h2>
            <p className="price">{p.price} <small>/ month</small></p>
            <p className="muted small">{p.credits} credits each month. {p.note}. Cancel any time.</p>
            <div style={{ marginTop: 10 }}><BuyButton priceKey={p.key} label={`Get ${p.name}`} /></div>
          </li>
        ))}
      </ul>
      <p className="section-label" style={{ marginTop: 32 }}>Credit packs · one-time, never expire</p>
      <div className="list-card">
        {PACKS.map(p => (
          <div key={p.key} className="pack-row">
            <span><strong>{p.credits} credits</strong> <span className="muted">· {p.price}</span></span>
            <BuyButton priceKey={p.key} label="Buy" />
          </div>
        ))}
      </div>
      <p className="muted small">Under 18? Ask a parent or guardian before you buy. US cards only for now. Prices in USD, plus tax where applicable.</p>
    </main>
  );
}
