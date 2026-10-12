import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAccount } from "@/lib/session";
import { notNow, redeemInvite } from "@/app/actions";
import { Header } from "@/components/Header";
import { InviteForm } from "@/components/InviteForm";
import { Footer } from "@/components/Footer";

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
    <>
      <Header available={account.available} />
      <main className="page stack">
        {!account.hasAccess ? (
          <div className="narrow stack">
            <h1>Enter your invite code</h1>
            <p>This is a private beta. You need an invite code before you can buy credits.</p>
            <InviteForm action={redeemInvite} />
          </div>
        ) : (
          <>
            <h1>Choose how to pay to make your first video.</h1>
            <p>Every video uses credits: 1 credit = 10 seconds. Failed videos are not charged.</p>
            {country && country !== "US" && <p className="muted">Payments: US cards only for now.</p>}
            <h2>Plans</h2>
            <ul className="grid-cards">
              {PLANS.map((p) => (
                <li key={p.name} className="card stack">
                  <p><strong>{p.name}</strong> · {p.price}</p>
                  <p>{p.credits} credits a month, {p.note}.</p>
                  <button type="button" className="btn block" disabled aria-describedby="checkout-off">
                    Choose {p.name}
                  </button>
                </li>
              ))}
            </ul>
            <h2>Packs</h2>
            <p className="muted small">One-time. Credits from packs never expire.</p>
            <ul className="grid-cards">
              {PACKS.map((p) => (
                <li key={p.credits} className="card stack">
                  <p><strong>{p.credits} credits</strong> · {p.price}</p>
                  <p>{p.note}.</p>
                  <button type="button" className="btn secondary block" disabled aria-describedby="checkout-off">
                    Buy {p.credits} credits
                  </button>
                </li>
              ))}
            </ul>
            <p id="checkout-off" className="muted small">Payments aren&apos;t switched on yet.</p>
          </>
        )}
        <form action={notNow}>
          <button type="submit" className="btn secondary">
            Not now
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
