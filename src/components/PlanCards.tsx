// The plans and packs (founder, 22 Oct 2026: one price for every level), for /pricing, /buy and /start.
// buy: live checkout buttons; none: no button (public page).
import { PACKS, PLANS } from "@/lib/videos";
import { BuyButton } from "./BuyButton";

export function PlanCards({ buy }: { buy?: "live" }) {
  return (
    <>
      <section className="stack">
        <p className="section-label">Plans</p>
        <ul className="grid-cards">
          {PLANS.map(p => (
            <li key={p.key} className="card plan">
              <h2>{p.name}</h2>
              <p className="price">{p.price} <small>/ month</small></p>
              <p className="muted small">{p.videos} videos a month, on top of your free videos. Any level. Cancel any time.</p>
              {buy === "live" && <div style={{ marginTop: 10 }}><BuyButton priceKey={p.key} label={`Get ${p.name}`} /></div>}
            </li>
          ))}
        </ul>
      </section>
      <section className="stack">
        <p className="section-label">Packs, paid once</p>
        <ul className="grid-cards">
          {PACKS.map(p => (
            <li key={p.key} className="card plan">
              <h2>{p.videos} videos</h2>
              <p className="price">{p.price}</p>
              <p className="muted small">Paid once, no plan. Any level.</p>
              {buy === "live" && <div style={{ marginTop: 10 }}><BuyButton priceKey={p.key} label={`Get ${p.videos} videos`} /></div>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
