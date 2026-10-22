// The plans, one pair per level (founder, 20 Oct 2026), for /pricing, /buy and /start. A plan's lessons are taught at
// its level, and each card says so. buy: live checkout buttons; "off": disabled ones; none: no button (public page).
import { LEVELS, LEVEL_NAME, PLANS } from "@/lib/videos";
import { BuyButton } from "./BuyButton";

export function PlanCards({ buy }: { buy?: "live" | "off" }) {
  return (
    <>
      {LEVELS.map(l => (
        <section key={l} className="stack">
          <p className="section-label">{LEVEL_NAME[l]} lessons</p>
          <ul className="grid-cards">
            {PLANS.filter(p => p.level === l).map(p => (
              <li key={p.key} className="card plan">
                <h2>{p.name}</h2>
                <p className="price">{p.price} <small>/ month</small></p>
                <p className="muted small">{p.videos} videos a month, on top of your free videos. Taught at {LEVEL_NAME[l].toLowerCase()} level. Cancel any time.</p>
                {buy === "live" && <div style={{ marginTop: 10 }}><BuyButton priceKey={p.key} label={`Get ${p.name}`} /></div>}
                {buy === "off" && <button type="button" className="btn block" disabled aria-describedby="checkout-off" style={{ marginTop: 10 }}>Choose {p.name}</button>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
