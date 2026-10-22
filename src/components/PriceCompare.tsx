"use client";
// Price against other prompt-to-explainer tools (founder, 23 Oct 2026: show it as motion, name no company). The bars
// grow, the "5x" mark lands, then the three things we give; it plays once, when scrolled into view. Reduced motion:
// the final picture, no movement.
// Numbers: their entry plans are $2 to $4 per minute of video (read from their own pricing pages, 23 Oct 2026); ours
// is a ~20¢ video of 30-60 s, so under 40¢ a minute. Re-check before changing them.
import { useEffect, useRef, useState } from "react";

const PERKS: [string, string, string][] = [
  ["M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", "Ready in about 30 seconds", "Others take minutes"],
  ["M12 21a9 9 0 1 1 0-18c5 0 9 3.6 9 8 0 2.2-1.8 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 21ZM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01", "Colour on every plan", "Not an upgrade"],
  ["M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z", "Ask a follow-up", "In the same chat"],
];

export function PriceCompare({ free }: { free: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className={`pc${on ? " pc-on" : ""}`}>
      <svg viewBox="0 0 640 230" className="pc-chart" role="img"
        aria-label="Price per minute of explainer video: other explainer tools 2 to 4 dollars, Ask Radlor under 40 cents. At least 5 times cheaper.">
        <text x="0" y="34" className="pc-label">Other explainer tools</text>
        <rect x="0" y="48" width="560" height="44" rx="10" className="pc-bar pc-them" />
        <text x="16" y="77" className="pc-price pc-p1">$2 – $4 / min</text>

        <text x="0" y="146" className="pc-label pc-us-label">Ask Radlor</text>
        <rect x="0" y="160" width="112" height="44" rx="10" className="pc-bar pc-us" />
        <text x="128" y="189" className="pc-price pc-p2">under 40¢ / min</text>

        <g className="pc-badge" transform="translate(560 182)">
          <circle r="40" />
          <text y="2" className="pc-x">5×</text>
          <text y="20" className="pc-x-sub">cheaper</text>
        </g>
      </svg>
      <ul className="pc-perks">
        {PERKS.map(([d, title, sub], i) => (
          <li key={title} className="card" style={{ transitionDelay: `${1.4 + i * 0.18}s` }}>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d={d} /></svg>
            <span><strong>{title}</strong><span className="muted small">{sub}</span></span>
          </li>
        ))}
      </ul>
      <p className="muted small">Other tools: entry plans of AI explainer-video makers, from their own pricing pages, 23 October 2026. Our videos are 30 to 60 second answers, about 20¢ each on Plus. Your first {free} are free.</p>
    </div>
  );
}
