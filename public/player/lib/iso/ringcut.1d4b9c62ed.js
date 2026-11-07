// "ringcut cx cy k kind=plated|solid green=0..1" — a ring lying on a plain white card, and a round close-up of a cut
// through its metal with a drop of sweat on it. plated: a thin gold-colored layer over a copper-alloy core; where the
// layer has worn through, the salty drop reaches the copper and green copper salts form, and a green mark is left on
// the card. solid: gold all the way through, so nothing turns green.
(() => {
  const F = { class: "free", "data-free": "1" };
  const GOLD = "#d4ad3f", CORE = "#b8714a", GREEN = "#3f9a6b", DROP = "#cfe3ec";
  const RX = 78, RY = 32, H = 18, RCX = -190, RCY = 30;
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  ISO.add({
    name: "ringcut", title: "Ring and its metal", compare: null,
    about: "A ring lying on a white card, with a round close-up of a cut through its metal and a drop of sweat on it. kind=plated: a thin gold-colored layer over a copper-alloy core; where the layer is worn, the salty drop reaches the copper and green copper salts grow (green=0..1), leaving a green mark on the card. kind=solid: gold all through, nothing turns green. Parts: ring, card, zoom, plating, core, drop, salts.",
    line: "ringcut cx cy k=0.2..1.5 kind=plated|solid green=0..1",
    demo: { line: "ringcut 480 270 0.72 kind=plated green=0", script: [{ set: { green: 0 }, hold: 1 }, { set: { green: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, solid = o.kind === "solid";
      P.seed(solid ? 103 : 101);
      const g = P.base(parent, cx, cy, k);
      // the card, a plain surface
      const card = P.el("g", { "data-name": "card" }, g), cd = "M-330 -50 L-60 -60 L-40 150 L-320 160 Z";
      const cc = P.clip(card, cd), ca = P.layer(card, cc); P.el("path", { d: cd, fill: "#f6f3ec" }, ca.g);
      for (let i = 0; i < 8; i++) { const y = P.rr(-60, 160); ca.stroke(-340, y, -40, y + P.rr(-8, 8), P.rr(16, 30), P.pick(["#ece6da", "#fbf9f4"]), 0.7); } ca.done(); P.ink(cd, card, 3);
      // the green mark the salts leave on the card, under the ring
      const mark = P.el("g", { opacity: 0, "data-name": "salts" }, card), ml = P.layer(mark);
      for (let i = 0; i < 40; i++) { const a = (i / 40) * 6.28, r = P.rr(0.96, 1.06); ml.dab(RCX + Math.cos(a) * RX * r, RCY + H + 6 + Math.sin(a) * RY * r, P.rr(5, 9), P.pick([GREEN, "#5fb88a", "#2f7d55"]), 0.55); }
      ml.done();
      // the ring: side band, top face, the inner wall seen through the hole
      const ring = P.el("g", { "data-name": "ring" }, g), gd = P.dk(GOLD, 0.25);
      P.el("path", { d: `M${RCX - RX} ${RCY}V${RCY + H}A${RX} ${RY} 0 0 0 ${RCX + RX} ${RCY + H}V${RCY}Z`, fill: gd, stroke: P.INK, "stroke-width": 3, "stroke-linejoin": "round" }, ring);
      const top = `${ell(RCX, RCY, RX, RY)}${ell(RCX, RCY, RX - 16, RY - 7)}`;
      P.el("path", { d: top, fill: GOLD, "fill-rule": "evenodd", stroke: P.INK, "stroke-width": 3 }, ring);
      const hole = P.clip(ring, ell(RCX, RCY, RX - 16, RY - 7));
      const hw = P.el("g", { "clip-path": `url(#${hole})` }, ring);
      P.el("rect", { x: RCX - RX, y: RCY - RY, width: RX * 2, height: RY * 2, fill: gd }, hw);
      P.el("path", { d: ell(RCX, RCY + H, RX - 16, RY - 7), fill: "#f6f3ec" }, hw);
      const hi = P.layer(ring); hi.stroke(RCX - 54, RCY - 22, RCX + 10, RCY - 30, 6, "#f7e7a8", 0.8, -4); hi.stroke(RCX - 60, RCY + 30, RCX - 20, RCY + 40, 5, P.lt(GOLD, 0.4), 0.6, 3); hi.done();
      const rg = P.el("g", { opacity: 0 }, ring), rl = P.layer(rg, hole); for (let i = 0; i < 9; i++) rl.dab(RCX + P.rr(-50, 50), RCY + P.rr(-18, -6), P.rr(3, 6), P.pick([GREEN, "#5fb88a"]), 0.75); rl.done();
      // a small drop of sweat touching the ring
      P.el("path", { d: `M${RCX + 70} ${RCY + 48} Q${RCX + 74} ${RCY + 30} ${RCX + 94} ${RCY + 32} Q${RCX + 118} ${RCY + 36} ${RCX + 112} ${RCY + 50} Q${RCX + 92} ${RCY + 58} ${RCX + 70} ${RCY + 48} Z`, fill: DROP, stroke: P.INK, "stroke-width": 2.6 }, ring);
      P.ink(`M${RCX + 40} ${RCY + 20} L50 30`, g, 2.4);
      // the close-up: a cut through the band, with the drop on it
      const ZX = 180, ZY = 20, ZR = 140, zoom = P.el("g", { "data-name": "zoom" }, g);
      const zc = P.clip(zoom, ell(ZX, ZY, ZR, ZR)), inner = P.el("g", { "clip-path": `url(#${zc})` }, zoom);
      P.el("rect", { x: ZX - ZR, y: ZY - ZR, width: ZR * 2, height: ZR * 2, fill: "#f4efe4" }, inner);
      const S = ZY - 10, gap = solid ? 0 : 1;
      const core = P.el("g", { "data-name": "core" }, inner), coreCol = solid ? GOLD : CORE, kl = P.layer(core);
      P.el("rect", { x: ZX - ZR, y: S, width: ZR * 2, height: ZR, fill: coreCol }, kl.g);
      for (let i = 0; i < 12; i++) { const y = P.rr(S + 6, ZY + ZR); kl.stroke(ZX - ZR - 20, y, ZX + ZR + 20, y + P.rr(-6, 6), P.rr(10, 22), P.pick([P.dk(coreCol, 0.1), P.lt(coreCol, 0.12)]), 0.55); }
      kl.done();
      if (!solid) {
        const pl = P.el("g", { "data-name": "plating" }, inner);
        P.el("path", { d: `M${ZX - ZR} ${S - 12}H${ZX - 22}L${ZX - 16} ${S}H${ZX - ZR}Z M${ZX + 26} ${S - 12}H${ZX + ZR}V${S}H${ZX + 20}Z`, fill: GOLD, stroke: P.INK, "stroke-width": 2.4, "stroke-linejoin": "round" }, pl);
        P.el("path", { d: `M${ZX - 130} ${S - 7}H${ZX - 40} M${ZX + 40} ${S - 7}H${ZX + 130}`, stroke: "#f7e7a8", "stroke-width": 2.4, opacity: 0.8, ...F }, pl);
      }
      const surf = S - 12 * gap;
      P.ink(`M${ZX - ZR} ${surf}H${ZX - 22 * gap}${gap ? `L${ZX - 16} ${S}H${ZX + 20}L${ZX + 26} ${surf}` : ""}H${ZX + ZR}`, inner, 3, false);
      const drop = P.el("g", { "data-name": "drop" }, inner), dd = `M${ZX - 90} ${surf} Q${ZX - 84} ${surf - 70} ${ZX + 4} ${surf - 72} Q${ZX + 88} ${surf - 68} ${ZX + 92} ${surf} Z`;
      P.el("path", { d: dd, fill: DROP, opacity: 0.9 }, drop); P.ink(`M${ZX - 90} ${surf} Q${ZX - 84} ${surf - 70} ${ZX + 4} ${surf - 72} Q${ZX + 88} ${surf - 68} ${ZX + 92} ${surf}`, drop, 2.8);
      const dl = P.layer(drop); dl.stroke(ZX - 56, surf - 46, ZX - 14, surf - 60, 7, "#ffffff", 0.8, -6); for (let i = 0; i < 7; i++) dl.dab(ZX + P.rr(-60, 60), surf - P.rr(14, 50), 2.6, "#f2f6f8", 0.9); dl.done();
      // the green salts grow out of the worn spot, where the drop touches the copper
      const salts = P.el("g", { opacity: 0 }, inner), sg = P.el("g", {}, salts), sl = P.layer(sg);
      for (let i = 0; i < 26; i++) { const x = P.rr(-58, 60), y = -P.rr(0, 26) * (1 - Math.abs(x) / 80); sl.dab(x, y, P.rr(4, 9), P.pick([GREEN, "#5fb88a", "#2f7d55", "#7cc79e"]), 0.9); }
      sl.done();
      P.el("circle", { cx: ZX, cy: ZY, r: ZR, fill: "none", stroke: "#7a5532", "stroke-width": 10 }, zoom);
      P.el("circle", { cx: ZX, cy: ZY, r: ZR + 5, fill: "none", stroke: P.INK, "stroke-width": 2.4 }, zoom);
      const st = { green: ISO.clamp(+o.green || 0, 0, 1) }; let v = st.green;
      const draw = () => {
        const s = solid ? 0 : v;
        salts.setAttribute("opacity", Math.min(1, s * 3).toFixed(2));
        sg.setAttribute("transform", `translate(${ZX} ${S}) scale(${(0.3 + 0.7 * s).toFixed(3)})`);
        mark.setAttribute("opacity", (s * 0.9).toFixed(2)); rg.setAttribute("opacity", s.toFixed(2));
      };
      draw();
      g.set = (q) => { if (q.green !== undefined) st.green = ISO.clamp(+q.green || 0, 0, 1); };
      g.update = (dt) => { const was = v; v = ISO.still() ? st.green : ISO.follow(v, st.green, dt, 0.5); if (Math.abs(v - st.green) < 0.002) v = st.green; if (v !== was) draw(); return v !== st.green; };
      g.readout = () => (solid ? "solid gold: the drop has no copper to reach, no green" : st.green > 0 ? "plating worn: sweat reaches the copper, green salts form" : "plated ring: thin gold-colored layer over copper alloy");
      return g;
    },
  });
})();
