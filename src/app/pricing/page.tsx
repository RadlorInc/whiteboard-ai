import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Pricing" };

// §5.5: public pricing. No free plan: every video costs credits (founder, 11 Oct).
export default function Pricing() {
  return (
    <>
      <main className="page narrow stack">
        <h1>Pricing</h1>
        <p>1 credit = 10 seconds of video. Most videos are 20–40 seconds, so they use 2–4 credits. Failed videos are free. Watching your own videos again is free.</p>
        <section className="card stack"><h2>Plus · $9.99 / month</h2><p>150 credits a month, about 35–40 videos.</p></section>
        <section className="card stack"><h2>Pro · $19.99 / month</h2><p>330 credits a month, about 80 videos.</p></section>
        <section className="card stack"><h2>Credit packs</h2><p>60 credits $4.99 · 132 credits $9.99 · 282 credits $19.99. Pack credits never expire.</p></section>
        <p className="muted small">Prices in USD, plus tax where applicable. US cards only for now. Under 18? Ask a parent or guardian before you buy.</p>
        <Link className="btn block" href="/signup">Get started</Link>
      </main>
      <Footer />
    </>
  );
}
