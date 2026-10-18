import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

// §5.5: public pricing. No free plan: every video costs credits (founder, 11 Oct).
export default function Pricing() {
  return (
    <main className="page stack">
      <div>
        <h1>Pricing</h1>
        <p className="page-sub">1 credit = 10 seconds of video. Most videos are 20–40 seconds, so they use 2–4 credits. Failed videos and replays are free.</p>
      </div>
      <ul className="grid-cards">
        <li className="card plan"><h2>Plus</h2><p className="price">$9.99 <small>/ month</small></p><p className="muted small">150 credits a month, about 35–40 videos.</p></li>
        <li className="card plan"><h2>Pro</h2><p className="price">$19.99 <small>/ month</small></p><p className="muted small">330 credits a month, about 80 videos.</p></li>
      </ul>
      <section className="card stack">
        <h2>Credit packs</h2>
        <p className="muted small">60 credits $4.99 · 132 credits $9.99 · 282 credits $19.99. Pack credits never expire.</p>
      </section>
      <p className="muted small">Prices in USD, plus tax where applicable. US cards only for now. Under 18? Ask a parent or guardian before you buy.</p>
      <div><Link className="btn" href="/signup">Get started</Link></div>
    </main>
  );
}
