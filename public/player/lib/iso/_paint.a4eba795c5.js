// Painted look for the fashion shelf (founder, 7 Nov 2026): colour laid on in brush strokes, a thin loose ink line, one
// brush per fabric. No filters: a stroke is a plain shape, its rough edge worked out once, and strokes of one colour
// share one path, so a drawing stays small on a phone. Not a recipe: defines window.PAINT.
(() => {
  const NS = "http://www.w3.org/2000/svg", INK = "#16233b";
  let seed = 1, uid = 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const rr = (a, b) => a + (b - a) * rnd(), pick = (a) => a[Math.floor(rnd() * a.length)];
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const dk = (c, t) => mix(c, "#0b1a33", t), lt = (c, t) => mix(c, "#ffffff", t);

  function layer(parent, clip) {
    const g = el("g", clip ? { "clip-path": `url(#${clip})` } : {}, parent), buckets = new Map();
    const add = (col, op, d) => { const k = col + "|" + op; buckets.set(k, (buckets.get(k) || "") + d); };
    const poly = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
    return { g,
      // a bent band whose width wanders a little, narrower at both ends
      stroke(x1, y1, x2, y2, w, col, op = 1, bend = 0) {
        const steps = Math.max(3, Math.min(10, Math.round(Math.hypot(x2 - x1, y2 - y1) / 44))), L = [], R = [];
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
        for (let i = 0; i <= steps; i++) { const t = i / steps, b = bend * Math.sin(t * Math.PI);
          const cx = x1 + dx * t + nx * b, cy = y1 + dy * t + ny * b, hw = (w / 2) * (0.86 + rr(0, 0.22)) * (i === 0 || i === steps ? 0.6 : 1);
          L.push([cx + nx * hw, cy + ny * hw]); R.push([cx - nx * hw, cy - ny * hw]); }
        add(col, op, poly([...L, ...R.reverse()]));
      },
      // straight sides, round ends, a slightly uneven edge
      thread(x1, y1, x2, y2, w, col, op = 1) {
        const a = Math.atan2(y2 - y1, x2 - x1), pts = [], arc = (cx, cy, from) => { for (let i = 0; i <= 6; i++) { const t = from + (Math.PI * i) / 6, r = w / 2 + rr(-1, 1); pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } };
        arc(x2, y2, a - Math.PI / 2); arc(x1, y1, a + Math.PI / 2); add(col, op, poly(pts));
      },
      dab(x, y, r, col, op = 1) { const pts = []; for (let i = 0; i < 7; i++) { const t = (i / 7) * 2 * Math.PI, q = r * rr(0.82, 1.15); pts.push([x + Math.cos(t) * q, y + Math.sin(t) * q]); } add(col, op, poly(pts)); },
      flecks(n, x0, y0, x1, y1, col, op) { let d = ""; for (let i = 0; i < n; i++) { const x = rr(x0, x1), y = rr(y0, y1), a = rr(1, 4), b = rr(0.6, 1.6); d += `M${x.toFixed(1)} ${y.toFixed(1)}h${a.toFixed(1)}v${b.toFixed(1)}h${(-a).toFixed(1)}Z`; } add(col, op, d); },
      done() { for (const [k, d] of buckets) { const [fill, op] = k.split("|"); el("path", { d, fill, ...(op === "1" ? {} : { opacity: op }) }, g); } buckets.clear(); return this; },
    };
  }
  // the shape once firmly, once lightly and a little off, so it reads as a hand
  const ink = (d, p, w = 3.2, dash = true) => {
    const free = { "data-free": "1", class: "free" };
    el("path", { d, fill: "none", stroke: INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...(dash ? { "stroke-dasharray": "520 7 240 5 340 9" } : {}), ...free }, p);
    el("path", { d, fill: "none", stroke: INK, "stroke-width": w * 0.5, opacity: 0.4, "stroke-linecap": "round", transform: "translate(2 -1.5)", ...free }, p);
  };
  const clip = (parent, d) => { const id = "pc" + ++uid, c = el("clipPath", { id }, parent); el("path", { d }, c); return id; };
  const base = (parent, cx, cy, k) => { const g = el("g", { transform: `translate(${cx} ${cy}) scale(${k})` }, parent); g.update = () => false; g.set = () => {}; g.anchors = {}; return g; };

  const COLORS = { rose: "#9d3a56", blue: "#28507f", teal: "#1f6f6a", mustard: "#c6952f", cream: "#e4d8bf", black: "#23252b", white: "#eef0ee", grey: "#7c8087", olive: "#6b7239", rust: "#a8562c", plum: "#4a1f5c", camel: "#b08a5e", sage: "#7f9a8c", red: "#a33b36" };
  const DEFAULT = { denim: "#28507f", silk: "#9d3a56", satin: "#1f6f5c", linen: "#cdbb97", cotton: "#dfe5ea", polyester: "#5a6e8c", wool: "#b08a5e", cashmere: "#c8b9a6", flannel: "#a33b36", velvet: "#4a1f5c", corduroy: "#a8672f", fleece: "#7f9a8c" };
  const FABRICS = Object.keys(DEFAULT);
  const colorOf = (fabric, c) => COLORS[c] || DEFAULT[fabric] || DEFAULT.cotton;

  // One brush per fabric: paints the box x0..x1, y0..y1 into parent. flare fans long strokes outward from centre x (a
  // skirt); density scales the count; every brush shows what the cloth is made of, not just its colour.
  function brush(fabric, parent, cl, [x0, x1, y0, y1], col, { flare = 0, mid = (x0 + x1) / 2, density = 1, down = false } = {}) {
    const a = layer(parent, cl), b = layer(parent, cl), c = layer(parent, cl);
    el("rect", { x: x0 - 30, y: y0 - 30, width: x1 - x0 + 60, height: y1 - y0 + 60, fill: col }, a.g);
    const area = ((x1 - x0) * (y1 - y0)) / (334 * 390), n = (m) => Math.round(m * Math.min(area, 3) * density);
    const X = () => rr(x0 - 20, x1 + 20), Y = () => rr(y0 - 20, y1 + 20);
    ({
      denim() { for (let i = 0; i < n(46); i++) { const x = X(), y = Y() - 80, l = rr(120, 320), e = x + (x - mid) * flare * (l / 900);
          a.stroke(x, y, e, y + l, rr(12, 26), pick([dk(col, 0.1), lt(col, 0.05)]), 0.9);
          if (i % 2) b.stroke(x + rr(-14, 14), y + rr(0, 50), e + rr(-14, 14), y + l, rr(8, 18), lt(col, rr(0.08, 0.14)), 0.8);
          if (i % 4 === 0) c.stroke(x + rr(-14, 14), y, e, y + l * 0.7, rr(3, 6), lt(col, 0.45), 0.35); }
        c.flecks(n(170), x0, y0, x1, y1, lt(col, 0.65), 0.45); },
      silk() { if (down) { for (let i = 0; i < n(26); i++) { const x = X(), y = Y() - 120, l = rr(240, 520); a.stroke(x, y, x + rr(-16, 16), y + l, rr(24, 46), pick([dk(col, 0.1), lt(col, 0.05), col]), 0.8, rr(-22, 22)); }
          for (let i = 0; i < n(9); i++) { const x = X(), y = Y() - 100, l = rr(200, 420); b.stroke(x, y, x + rr(-10, 10), y + l, rr(14, 26), lt(col, 0.3), 0.4, rr(-20, 20)); c.stroke(x + 4, y + 40, x + rr(-6, 10), y + l * 0.7, rr(3, 5), lt(col, 0.75), 0.55, rr(-16, 16)); } return; }
        const H = y1 - y0, W = x1 - x0; for (let i = 0; i < n(13); i++) { const y = y0 - 30 + ((i + 0.5) / n(13)) * (H + 60); a.stroke(x0 - 40, y + rr(-20, 20), x1 + 40, y + rr(30, 70), rr(44, 66), pick([dk(col, 0.1), lt(col, 0.05), col]), 0.8, rr(26, 46)); }
        for (let i = 0; i < Math.max(2, n(3)); i++) { const y = y0 + ((i + 0.4) / Math.max(2, n(3))) * H; b.stroke(x0 - 20, y, x1 + 20, y + rr(36, 60), rr(34, 52), lt(col, 0.28), 0.4, rr(28, 40)); b.stroke(x0 + W * 0.09, y + 2, x1 + 10, y + 44, rr(12, 18), lt(col, 0.55), 0.5, rr(28, 40)); c.stroke(x0 + W * 0.27, y + 8, x1 - W * 0.2, y + 36, rr(3, 5), lt(col, 0.85), 0.6, rr(22, 30)); } },
      satin() { const m = Math.max(3, n(4)); for (let i = 0; i < n(22); i++) { const x = X(), y = Y(); a.stroke(x - 90, y - 70, x + 90, y + 70, rr(30, 54), pick([dk(col, 0.08), col, lt(col, 0.06)]), 0.8); }
        for (let i = 0; i < m; i++) { const t = (i + 0.5) / m, x = x0 + t * (x1 - x0), y = y0 + t * (y1 - y0); b.stroke(x - 240, y - 170, x + 240, y + 170, rr(26, 46), lt(col, 0.42), 0.55); c.stroke(x - 200, y - 145, x + 200, y + 145, rr(4, 9), lt(col, 0.9), 0.75); } },
      linen() { for (let i = 0; i < n(90); i++) { const x = X(), y = Y(), l = rr(26, 90); if (i % 2) a.stroke(x, y, x + l, y + rr(-3, 3), rr(3, 7), pick([dk(col, 0.13), lt(col, 0.18)]), 0.75); else b.stroke(x, y, x + rr(-3, 3), y + l, rr(3, 7), pick([dk(col, 0.1), lt(col, 0.2)]), 0.7); }
        for (let i = 0; i < n(14); i++) { const x = X(), y = Y(); c.thread(x, y, x + rr(30, 80), y + rr(-2, 2), rr(4, 7), dk(col, 0.2), 0.5); } },
      cotton() { for (let i = 0; i < n(60); i++) { const x = X(), y = Y(); a.stroke(x, y, x + rr(30, 90), y + rr(-16, 16), rr(16, 30), pick([dk(col, 0.05), lt(col, 0.2), col]), 0.75); }
        c.flecks(n(230), x0, y0, x1, y1, dk(col, 0.28), 0.45); },
      polyester() { for (let i = 0; i < n(9); i++) { const y = y0 + ((i + 0.5) / n(9)) * (y1 - y0); a.stroke(x0 - 30, y, x1 + 30, y + rr(-8, 8), rr(44, 70), pick([col, lt(col, 0.05), dk(col, 0.05)]), 0.85); }
        b.stroke(x0 - 30, y0 + (y1 - y0) * 0.3, x1 + 30, y0 + (y1 - y0) * 0.3 + 18, 18, lt(col, 0.3), 0.4); },
      wool() { for (let i = 0; i < n(150); i++) { const x = X(), y = Y(), t = rr(0, 6.28), l = rr(14, 34); a.stroke(x, y, x + Math.cos(t) * l, y + Math.sin(t) * l, rr(8, 16), pick([dk(col, 0.14), lt(col, 0.1), col]), 0.85, rr(-9, 9)); }
        for (let i = 0; i < n(50); i++) { const x = X(), y = Y(), t = rr(0, 6.28); c.stroke(x, y, x + Math.cos(t) * 22, y + Math.sin(t) * 22, rr(2, 3.5), lt(col, 0.45), 0.55, rr(-7, 7)); } },
      cashmere() { for (let i = 0; i < n(80); i++) { const x = X(), y = Y(), t = rr(0, 6.28), l = rr(30, 70); a.stroke(x, y, x + Math.cos(t) * l, y + Math.sin(t) * l, rr(18, 34), pick([lt(col, 0.1), dk(col, 0.05), col]), 0.55, rr(-14, 14)); }
        for (let i = 0; i < n(60); i++) { const x = X(), y = Y(), t = rr(0, 6.28); c.stroke(x, y, x + Math.cos(t) * 28, y + Math.sin(t) * 28, 1.6, lt(col, 0.6), 0.5, rr(-8, 8)); } },
      flannel() { const S = 74, dark = dk(col, 0.35), pale = lt(col, 0.7); for (let x = x0 - 30; x < x1 + 30; x += S) { a.stroke(x, y0 - 30, x + rr(-3, 3), y1 + 30, 30, dark, 0.65); a.stroke(x + S / 2, y0 - 30, x + S / 2, y1 + 30, 5, pale, 0.5); }
        for (let y = y0 - 30; y < y1 + 30; y += S) { b.stroke(x0 - 30, y, x1 + 30, y + rr(-3, 3), 30, dark, 0.55); b.stroke(x0 - 30, y + S / 2, x1 + 30, y + S / 2, 5, pale, 0.45); }
        for (let i = 0; i < n(240); i++) { const x = X(), y = Y(), t = rr(0, 6.28); c.stroke(x, y, x + Math.cos(t) * rr(6, 15), y + Math.sin(t) * rr(6, 15), 1.8, lt(col, 0.55), 0.5); } },
      velvet() { const deep = dk(col, 0.35); el("rect", { x: x0 - 30, y: y0 - 30, width: x1 - x0 + 60, height: y1 - y0 + 60, fill: deep }, a.g);
        for (let i = 0; i < n(36); i++) { const x = X(), y = Y(); a.stroke(x - 60, y, x + 60, y + rr(-22, 22), rr(30, 60), pick([deep, dk(col, 0.2)]), 0.8, rr(-14, 14)); }
        for (let i = 0; i < 3; i++) { const y = y0 + ((i + 0.5) / 3) * (y1 - y0); b.stroke(x0 - 30, y, x1 + 30, y + rr(-40, 40), rr(70, 110), col, 0.55, rr(-34, 34)); c.stroke(x0 + rr(10, 60), y, x1 - rr(10, 60), y + rr(-30, 30), rr(22, 36), lt(col, 0.22), 0.4, rr(-30, 30)); }
        c.flecks(n(160), x0, y0, x1, y1, lt(col, 0.55), 0.35); },
      corduroy() { const S = 34; for (let x = x0 - 30; x < x1 + 30; x += S) { a.stroke(x, y0 - 30, x + rr(-1, 1), y1 + 30, S * 0.56, dk(col, 0.36), 0.9); b.stroke(x + S / 2, y0 - 30, x + S / 2 + rr(-1, 1), y1 + 30, S * 0.72, lt(col, 0.08), 1); c.stroke(x + S * 0.36, y0 - 30, x + S * 0.36, y1 + 30, 5, lt(col, 0.45), 0.7); }
        c.flecks(n(170), x0, y0, x1, y1, dk(col, 0.4), 0.3); },
      fleece() { for (let i = 0; i < n(230); i++) { const x = X(), y = Y(); (i % 3 ? a : b).dab(x, y, rr(9, 18), pick([dk(col, 0.14), lt(col, 0.14), lt(col, 0.3), col]), 0.9); }
        for (let i = 0; i < n(60); i++) { c.dab(X(), Y(), rr(3, 6), lt(col, 0.6), 0.6); } },
    }[Object.hasOwn(DEFAULT, fabric) ? fabric : "cotton"])();
    a.done(); b.done(); c.done();
  }

  window.PAINT = { el, layer, ink, clip, base, brush, colorOf, FABRICS, COLORS, INK, mix, dk, lt, rr, pick, seed: (s) => { seed = s; } };
})();
