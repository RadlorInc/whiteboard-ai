// "pillview cx cy k rub=0..1 c=…" — a sweater's knit surface from the side while a strap rubs across it. Loose fiber
// ends work out of the yarn, tangle, and roll into a small ball still tied to the sweater by a few fibers.
(() => {
  const X0 = -380, X1 = 380, SY = 70, BX = 30, BY = 14, N = 18;
  const free = { class: "free", "data-free": "1" };
  const sm = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const f1 = (v) => v.toFixed(1);
  const surf = (x) => SY - 18 * Math.abs(Math.sin(((x - X0) * Math.PI) / 76));
  ISO.add({
    name: "pillview", title: "How a pill forms", compare: null,
    about: "A sweater's knit surface seen from the side while a strap rubs across it. rub=0 neat yarn, 0.3 loose fiber ends pulled out, 0.6 ends tangling, 1 a small ball (part pill) held to the sweater by a few fibers. Parts: knit, strap, pill.",
    line: "pillview cx cy k=0.2..1.5 rub=0..1 c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "pillview 480 280 0.6 rub=0", script: [{ set: { rub: 0 }, hold: 1 }, { set: { rub: 0.35 }, hold: "settle" }, { set: { rub: 0.7 }, hold: "settle" }, { set: { rub: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, col = P.COLORS[o.c] || P.COLORS.sage;
      P.seed(97);
      const g = P.base(parent, cx, cy, k);
      // the knit: rows of yarn loops cut through, painted with the wool brush
      let top = `M${X0} 260L${X0} ${surf(X0)}`; for (let x = X0; x <= X1; x += 6) top += `L${x} ${f1(surf(x))}`; top += `L${X1} 260Z`;
      const knit = P.el("g", { "data-name": "knit" }, g), kc = P.clip(knit, top);
      P.brush("wool", knit, kc, [X0, X1, SY - 30, 260], col, { density: 0.9 });
      const loops = P.layer(knit, kc); for (let x = X0 + 38; x < X1; x += 76) for (const y of [120, 196]) { loops.stroke(x - 34, y, x + 34, y, 44, P.dk(col, 0.2), 0.5, -16); loops.stroke(x - 24, y - 12, x + 18, y - 16, 8, P.lt(col, 0.3), 0.6, -6); } loops.done();
      let rim = `M${X0} ${surf(X0)}`; for (let x = X0; x <= X1; x += 6) rim += `L${x} ${f1(surf(x))}`;
      P.ink(rim, knit, 3.4); P.ink(`M${X0} ${surf(X0)}V260H${X1}V${f1(surf(X1))}`, knit, 3, false);
      // short fuzz that is always there
      P.el("path", { d: Array.from({ length: 40 }, (_, i) => { const x = X0 + 10 + i * 19, y = surf(x); return `M${x} ${f1(y)}q${P.rr(-6, 6).toFixed(1)} -6 ${P.rr(-8, 8).toFixed(1)} -${P.rr(8, 14).toFixed(1)}`; }).join(""), fill: "none", stroke: P.lt(col, 0.25), "stroke-width": 2.4, "stroke-linecap": "round", ...free }, knit);
      // the strap that rubs
      const strap = P.el("g", { "data-name": "strap" }, g), sc = P.clip(strap, "M-250 -250H250V-176H-250Z");
      P.brush("denim", strap, sc, [-250, 250, -250, -176], P.COLORS.camel, { density: 1.4 });
      P.ink("M-250 -250H250V-176H-250Z", strap, 3.2);
      P.el("path", { d: "M-236 -188H236M-236 -238H236", fill: "none", stroke: "#e0cc9e", "stroke-width": 3.4, "stroke-dasharray": "12 8", ...free }, strap);
      const arrows = P.el("path", { d: "M-120 -284H120M-120 -284l16 -10M-120 -284l16 10M120 -284l-16 -10M120 -284l-16 10", fill: "none", stroke: P.INK, "stroke-width": 3.4, "stroke-linecap": "round", opacity: 0, ...free }, g);
      // loose fibers (redrawn as they move) and the ball they become
      const R = Array.from({ length: N }, (_, i) => { const x = -230 + i * 27 + P.rr(-6, 6); return { x, y: surf(x) + 4, ang: -Math.PI / 2 + P.rr(-0.7, 0.7), L: P.rr(56, 96), curl: P.rr(-14, 14), th: (i / N) * 9 + P.rr(0, 1), pull: Math.abs(x - BX) < 170 }; });
      const fEdge = P.el("path", { fill: "none", stroke: P.dk(col, 0.35), "stroke-width": 7.5, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, g);
      const fCol = P.el("path", { fill: "none", stroke: P.lt(col, 0.22), "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, g);
      const pill = P.el("g", { "data-name": "pill" }, g), pi = P.el("g", {}, pill), pl = P.layer(pi);
      for (let i = 0; i < 26; i++) { const a = P.rr(0, 6.28), q = Math.sqrt(P.rr(0, 1)) * 34; pl.dab(Math.cos(a) * q, Math.sin(a) * q * 0.85, P.rr(9, 15), P.pick([col, P.dk(col, 0.15), P.lt(col, 0.15)])); }
      for (let i = 0; i < 22; i++) { const a = P.rr(0, 6.28), q = P.rr(4, 30); pl.stroke(Math.cos(a) * q, Math.sin(a) * q * 0.85, Math.cos(a + 1.6) * q, Math.sin(a + 1.6) * q * 0.85, 2.4, P.lt(col, 0.4), 0.7, P.rr(-6, 6)); }
      pl.done(); P.el("path", { d: "M-44 0C-44 -40 44 -40 44 0C44 36 -44 36 -44 0Z", fill: "none", stroke: P.INK, "stroke-width": 3, "stroke-dasharray": "40 8 26 6", ...free }, pi);
      const st = { rub: ISO.clamp(+o.rub || 0, 0, 1) }; let r = st.rub;
      const draw = () => {
        const out = sm(0, 0.35, r), roll = sm(0.35, 0.95, r), ball = sm(0.55, 1, r);
        let d = "";
        for (const F of R) { const L = 14 + F.L * out, pts = [];
          for (let j = 0; j <= 4; j++) { const s = j / 4, w = Math.sin(s * Math.PI) * F.curl * out; let x = F.x + Math.cos(F.ang) * L * s - Math.sin(F.ang) * w, y = F.y + Math.sin(F.ang) * L * s + Math.cos(F.ang) * w;
            if (F.pull && j > 0) { const a = F.th + j * 0.9, rr = 40 * (0.4 + 0.6 * ball), tx = j === 1 ? (F.x + BX) / 2 : BX + Math.cos(a) * rr, ty = j === 1 ? (F.y + BY) / 2 + 10 : BY + Math.sin(a) * rr * 0.85, m = roll * (j === 1 ? 0.8 : 1); x += (tx - x) * m; y += (ty - y) * m; }
            pts.push([x, y]); }
          d += `M${f1(pts[0][0])} ${f1(pts[0][1])}`; for (let j = 1; j < 4; j += 2) d += `Q${f1(pts[j][0])} ${f1(pts[j][1])} ${f1(pts[j + 1][0])} ${f1(pts[j + 1][1])}`; }
        fEdge.setAttribute("d", d); fCol.setAttribute("d", d);
        pill.setAttribute("transform", `translate(${BX} ${BY}) scale(${(ball * 1.25 + 0.001).toFixed(3)})`); pill.setAttribute("opacity", ball > 0.02 ? 1 : 0);
        strap.setAttribute("transform", `translate(${f1(Math.sin(r * Math.PI * 7) * 70)} 0)`);
      };
      draw();
      g.anchors = { pill: [BX, BY], strap: [0, -213] };
      g.set = (p) => { if (p.rub !== undefined) st.rub = ISO.clamp(+p.rub || 0, 0, 1); };
      g.update = (dt) => { r = ISO.still() ? st.rub : ISO.follow(r, st.rub, dt, 0.9); if (Math.abs(r - st.rub) < 0.002) r = st.rub; const on = r !== st.rub; arrows.setAttribute("opacity", on || (r > 0 && r < 1) ? 1 : 0); draw(); return on; };
      g.readout = () => (st.rub < 0.3 ? "neat knit" : st.rub < 0.6 ? "fiber ends pulled loose" : st.rub < 0.9 ? "fiber ends tangling" : "a pill held on by a few fibers");
      return g;
    },
  });
})();
