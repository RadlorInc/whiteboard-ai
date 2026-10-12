import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { Header } from "@/components/Header";
import { BuyButton } from "@/components/BuyButton";

export const metadata: Metadata = { title: "Buy credits" };
const PLANS = [
  { key: "plus", name: "Plus", price: "$9.99 / month", credits: 150, note: "About 35 short videos a month" },
  { key: "pro", name: "Pro", price: "$19.99 / month", credits: 330, note: "About 80 short videos a month" },
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
    <>
      <Header available={account.available} />
      <main className="page narrow stack">
        <h1>Buy credits</h1>
        <p>1 credit = 10 seconds of video. Most videos use 3 or 4. Failed videos are never charged.</p>
        <p className="muted small">Under 18? Ask a parent or guardian before you buy. Payments: US cards only for now. Prices are in USD, plus tax where applicable.</p>
        <h2>Monthly plans</h2>
        {PLANS.map(p => (
          <section key={p.key} className="card stack">
            <h3>{p.name} · {p.price}</h3>
            <p>{p.credits} credits each month. {p.note}. Cancel any time.</p>
            <BuyButton priceKey={p.key} label={`Get ${p.name}`} />
          </section>
        ))}
        <h2>Credit packs</h2>
        <p className="muted small">One-time. Pack credits never expire.</p>
        {PACKS.map(p => (
          <section key={p.key} className="card row">
            <span>{p.credits} credits · {p.price}</span>
            <BuyButton priceKey={p.key} label="Buy" />
          </section>
        ))}
      </main>
    </>
  );
}
