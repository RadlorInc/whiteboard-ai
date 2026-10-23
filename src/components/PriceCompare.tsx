"use client";
// Price against other prompt-to-explainer tools (founder, 23 Oct 2026: show it as motion, name no company). The bars
// grow, the "a third" mark lands, then the three things we give; it plays once, when scrolled into view. Reduced motion:
// the final picture, no movement.
// Numbers (monthly starter plans, read from their own pricing pages on 23 Oct 2026): the cheaper of two prompt-to-
// explainer makers is $39.99 a month for 20 minutes of video; Plus is $13.99 for 70 videos of 20-60 s (23-70 min).
// So about a third of the price for as much video or more, whatever a video's length. Re-check before changing them.
import { useEffect, useRef, useState } from "react";

const PERKS: [string, string, string][] = [
  ["M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", "Ready in under a minute", "Others take minutes"],
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
      <svg viewBox="0 0 640 262" className="pc-chart" role="img"
        aria-label="A month on a starter plan: other explainer tools from 39.99 dollars for 20 minutes of video; Ask Radlor 13.99 dollars for 70 videos, 23 to 70 minutes. About a third of the price.">
        <text x="0" y="34" className="pc-label">Other explainer tools</text>
        <rect x="0" y="48" width="520" height="44" rx="10" className="pc-bar pc-them" />
        <text x="16" y="77" className="pc-price pc-p1">from $39.99 / month</text>
        <text x="0" y="120" className="pc-note pc-p1">20 minutes of video</text>

        <text x="0" y="166" className="pc-label pc-us-label">Ask Radlor</text>
        <rect x="0" y="180" width="182" height="44" rx="10" className="pc-bar pc-us" />
        <text x="198" y="209" className="pc-price pc-p2">$13.99 / month</text>
        <text x="198" y="248" className="pc-note pc-p2">70 videos, 23 to 70 minutes</text>

        <g className="pc-badge" transform="translate(575 190)">
          <circle r="44" />
          <text y="4" className="pc-x">⅓</text>
          <text y="26" className="pc-x-sub">the price</text>
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
      <p className="muted small">Monthly starter plans, from each AI explainer-video maker&apos;s own pricing page, 23 October 2026. Our videos are 20 to 60 second answers. Your first {free} are free.</p>
    </div>
  );
}
