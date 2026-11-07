// "clothesmoth cx cy k eat=0..1" — a wool patch on the table with a clothes moth's larva chewing it; the grown moth
// rests beside it and eats nothing. eat grows the hole and moves the larva along its edge.
(() => {
  const W = 252, H = 168, T = 14, HX = 60, HY = 10, HR = 100, TABLE = "#eadfc8";
  const free = { class: "free", "data-free": "1" };
  const f1 = (v) => v.toFixed(1);
  const zig = []; for (let x = -W; x < W; x += T * 2) zig.push([x, -H], [x + T, -H - T]);
  for (let y = -H; y < H; y += T * 2) zig.push([W, y], [W + T, y + T]);
  for (let x = W; x > -W; x -= T * 2) zig.push([x, H], [x - T, H + T]);
  for (let y = H; y > -H; y -= T * 2) zig.push([-W, y], [-W - T, y - T]);
  const PATCH = "M" + zig.map(([x, y]) => `${x} ${y}`).join("L") + "Z";
  ISO.add({
    name: "clothesmoth", title: "Clothes moth", compare: null,
    about: "A wool patch on the table. A clothes moth's larva (part larva) chews the wool and leaves crumbs; the grown moth (part moth) rests beside it and eats nothing. eat=0..1 grows the hole (part hole).",
    line: "clothesmoth cx cy k=0.2..1.5 eat=0..1",
    demo: { line: "clothesmoth 480 280 0.68 eat=0", script: [{ set: { eat: 0 }, hold: 1 }, { set: { eat: 0.5 }, hold: "settle" }, { set: { eat: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, col = P.COLORS.camel;
      P.seed(113);
      const g = P.base(parent, cx, cy, k), S = P.el("g", { transform: "rotate(-3)" }, g), cl = P.clip(S, PATCH);
      P.brush("wool", S, cl, [-W, W, -H, H], col);
      P.el("path", { d: PATCH, fill: "none", stroke: P.INK, "stroke-width": 3.4, "stroke-linejoin": "round", ...free }, S);
      // the hole: table showing through a ragged edge with broken fiber ends; it grows by scale
      const hole = P.el("g", { "data-name": "hole" }, S), hi = P.el("g", {}, hole), pts = [];
      for (let i = 0; i < 16; i++) { const a = (i / 16) * 2 * Math.PI, r = HR * P.rr(0.72, 1.08); pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.82]); }
      const HD = "M" + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join("L") + "Z", hc = P.clip(hi, HD);
      P.el("path", { d: HD, fill: TABLE }, hi);
      const sh = P.layer(hi, hc); sh.stroke(-HR, -HR * 0.7, HR, -HR * 0.7, 26, P.dk(TABLE, 0.18), 0.6, 10); sh.done();
      P.el("path", { d: pts.map(([x, y]) => { const a = Math.atan2(y, x); return `M${f1(x)} ${f1(y)}q${f1(-Math.cos(a) * 14 + P.rr(-5, 5))} ${f1(-Math.sin(a) * 14 + P.rr(-5, 5))} ${f1(-Math.cos(a) * 22)} ${f1(-Math.sin(a) * 20)}`; }).join(""), fill: "none", stroke: P.lt(col, 0.2), "stroke-width": 3, "stroke-linecap": "round", ...free }, hi);
      P.ink(HD, hi, 3);
      // crumbs the larva leaves
      const crumbs = P.el("g", { opacity: 0 }, S), cr = P.layer(crumbs); for (let i = 0; i < 30; i++) { const a = P.rr(1.6, 3.6), r = P.rr(HR * 1.05, HR * 1.5); cr.dab(HX + Math.cos(a) * r, HY + Math.sin(a) * r * 0.8, P.rr(2.5, 4.5), P.pick(["#6b5236", "#8a6c48", P.dk(col, 0.3)])); } cr.done();
      // the larva: pale soft segments, a brown head
      const larva = P.el("g", { "data-name": "larva" }, S), ll = P.layer(larva); let seg = "", legs = "";
      for (let i = 7; i >= 0; i--) { const x = -i * 15, r = 15 - Math.max(0, i - 3) * 1.6; ll.dab(x, 0, r, i % 2 ? "#efe6d0" : "#e6dbc0"); seg += `M${x + 3} ${f1(-r * 0.9)}Q${x + 7} 0 ${x + 3} ${f1(r * 0.9)}`; }
      for (let i = 0; i < 3; i++) legs += `M${-i * 15} 12l-3 9M${-i * 15} -12l-3 -9`;
      ll.stroke(-100, -5, 4, -7, 4, "#ffffff", 0.5); ll.dab(14, 0, 11, "#7a4a26"); ll.dab(17, -3, 3.5, "#b98a5a"); ll.done();
      P.el("path", { d: legs, fill: "none", stroke: "#7a4a26", "stroke-width": 2.6, "stroke-linecap": "round", ...free }, larva);
      P.el("path", { d: seg, fill: "none", stroke: "#a99573", "stroke-width": 1.8, ...free }, larva);
      P.ink("M18 -12C40 -10 40 10 18 12C8 14 0 14 -12 15C-60 18 -100 16 -112 4C-118 -2 -114 -12 -100 -14C-70 -17 -30 -16 -12 -15C0 -14 8 -14 18 -12Z", larva, 2.8);
      // the grown moth: narrow folded wings, a fringe at the back, resting on the table
      const moth = P.el("g", { "data-name": "moth", transform: `translate(${W + 90} ${-H + 60}) rotate(-14) scale(1.25)` }, g), ml = P.layer(moth), MC = "#c8a967";
      const wing = "M0 -50C28 -34 62 34 56 66Q28 56 0 72Q-28 56 -56 66C-62 34 -28 -34 0 -50Z", mc = P.clip(moth, wing);
      P.el("path", { d: wing, fill: MC }, moth); const mw = P.layer(moth, mc); for (let i = 0; i < 26; i++) { const x = P.rr(-50, 50), y = P.rr(-40, 60); mw.stroke(x, y, x + P.rr(-4, 4), y + P.rr(12, 22), 3, P.pick([P.dk(MC, 0.15), P.lt(MC, 0.3)]), 0.7); } mw.stroke(-22, -20, -40, 54, 7, P.lt(MC, 0.4), 0.6); mw.stroke(0, -44, 0, 66, 16, P.dk(MC, 0.28), 0.8); mw.done();
      P.el("path", { d: Array.from({ length: 19 }, (_, i) => { const x = -54 + i * 6; return `M${x} ${f1(68 - Math.abs(x) * 0.1 + (Math.abs(x) < 6 ? 4 : 0))}l${f1(x * 0.08)} 13`; }).join(""), fill: "none", stroke: P.dk(MC, 0.1), "stroke-width": 2, "stroke-linecap": "round", ...free }, moth);
      ml.dab(0, -60, 11, "#d9bf86"); ml.dab(0, -66, 7, "#e6d3a4"); ml.done(); moth.appendChild(ml.g);
      P.el("path", { d: "M-4 -68C-14 -90 -30 -100 -44 -104M4 -68C14 -90 30 -100 44 -104", fill: "none", stroke: "#8a6c48", "stroke-width": 2.4, "stroke-linecap": "round", ...free }, moth);
      P.ink(wing, moth, 2.8); P.el("path", { d: "M-8 -40l-16 -4M8 -40l16 -4M-10 -26l-20 4M10 -26l20 4", fill: "none", stroke: "#8a6c48", "stroke-width": 2.4, "stroke-linecap": "round", ...free }, moth);
      const st = { eat: ISO.clamp(+o.eat || 0, 0, 1) }; let e = st.eat;
      const paint = () => { const s = 0.06 + e * 0.94, a = 3.5 - e * 0.5, r = HR * s * 0.95 + 8;
        hole.setAttribute("transform", `translate(${HX} ${HY}) scale(${s.toFixed(3)})`); crumbs.setAttribute("opacity", Math.min(1, e * 2).toFixed(3));
        larva.setAttribute("transform", `translate(${f1(HX + Math.cos(a) * (r + 30))} ${f1(HY + Math.sin(a) * (r + 30) * 0.82)}) rotate(${f1((a * 180) / Math.PI + 180)})`); };
      paint();
      g.anchors = { larva: [HX - 150, HY], moth: [W + 90, -H + 60], hole: [HX, HY] };
      g.set = (p) => { if (p.eat !== undefined) st.eat = ISO.clamp(+p.eat || 0, 0, 1); };
      g.update = (dt) => { e = ISO.still() ? st.eat : ISO.follow(e, st.eat, dt, 0.7); if (Math.abs(e - st.eat) < 0.003) e = st.eat; paint(); return e !== st.eat; };
      g.readout = () => `the larva eats the wool; hole ${Math.round(st.eat * 100)}% grown`;
      return g;
    },
  });
})();
