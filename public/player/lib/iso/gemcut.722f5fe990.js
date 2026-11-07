// "gemcut cx cy k kind=diamond|glass|both light=0..1" — a cut gem seen from the side with rays of light coming in
// through its flat top. The rays are traced for real: they bend as they enter, and at each inside face either bounce
// (when they hit it at a slant past the material's limit) or leave. Diamond bends light much more and its limit is
// small, so the rays bounce back out of the top: sparkle. Glass cut the same way lets most of them out the bottom.
(() => {
  const XS = [-46, -16, 14, 44], F = { class: "free", "data-free": "1" };
  const V = [[-67, -38], [67, -38], [120, 0], [120, 6], [0, 109], [-120, 6], [-120, 0]];
  const GIRDLE = [-120, -70, -25, 25, 70, 120], TABLE = [-67, -40, -13, 13, 40, 67];
  const LOOK = { diamond: { n: 2.42, cols: ["#e4eff7", "#b9d3e6", "#f7fafc", "#9fbfd8", "#d3e4f0"] }, glass: { n: 1.5, cols: ["#d7e7e2", "#bcd3cd", "#e6efec", "#a9c3bc", "#cbded8"] } };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  // trace one ray: from above, through the table, bouncing inside until it leaves; returns the points and where it left
  const trace = (x, dir, n) => {
    let d = [Math.sin(dir), Math.cos(dir)], p = [x - (d[0] * 200) / d[1], -238];
    const pts = [p.slice()];
    // enter through the table (normal up)
    const tIn = (-38 - p[1]) / d[1]; p = [p[0] + d[0] * tIn, -38]; pts.push(p.slice());
    { const eta = 1 / n, c1 = d[1], c2 = Math.sqrt(1 - eta * eta * (1 - c1 * c1)); d = [eta * d[0], eta * d[1] + (eta * c1 - c2) * -1]; }
    let out = "top";
    for (let bounce = 0; bounce < 6; bounce++) {
      let best = 1e9, nn = null;
      for (let i = 0; i < V.length; i++) { const a = V[i], b = V[(i + 1) % V.length], e = [b[0] - a[0], b[1] - a[1]], den = d[0] * e[1] - d[1] * e[0];
        if (Math.abs(den) < 1e-9) continue;
        const t = ((a[0] - p[0]) * e[1] - (a[1] - p[1]) * e[0]) / den, u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
        if (t > 1e-6 && u >= 0 && u <= 1 && t < best) { best = t; const L = Math.hypot(e[0], e[1]); nn = [e[1] / L, -e[0] / L]; } }
      if (!nn) break;
      p = [p[0] + d[0] * best, p[1] + d[1] * best]; pts.push(p.slice());
      const ci = dot(d, nn), s2 = n * n * (1 - ci * ci);
      if (s2 > 1) { d = [d[0] - 2 * ci * nn[0], d[1] - 2 * ci * nn[1]]; continue; }   // bounces back inside
      const c2 = Math.sqrt(1 - s2); d = [n * d[0] + (c2 - n * ci) * nn[0], n * d[1] + (c2 - n * ci) * nn[1]];
      out = p[1] < 0 ? "top" : "bottom"; break;
    }
    pts.push([p[0] + d[0] * 150, p[1] + d[1] * 150]);
    return { pts, out };
  };
  ISO.add({
    name: "gemcut", title: "Diamond and glass gem", compare: null,
    about: "A cut gem from the side with rays of light coming in through its flat top. In a diamond the rays bend sharply and bounce off the inside faces back out of the top (sparkle); in a glass gem cut the same way more rays leak out the bottom. kind=both puts them side by side; light=0..1 traces the rays in. Parts: diamond, glass, rays.",
    line: "gemcut cx cy k=0.2..1.5 kind=diamond|glass|both light=0..1",
    demo: { line: "gemcut 480 280 0.8 kind=both light=0", script: [{ set: { light: 0 }, hold: 1 }, { set: { light: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(127);
      const g = P.base(parent, cx, cy, k), kinds = o.kind === "diamond" || o.kind === "glass" ? [o.kind] : ["diamond", "glass"];
      const rays = [], stars = [];
      kinds.forEach((kind, ki) => {
        const X = kinds.length === 2 ? (ki ? 165 : -165) : 0, s = kinds.length === 2 ? 1 : 1.3, L = LOOK[kind];
        const gem = P.el("g", { "data-name": kind, transform: `translate(${X} 30) scale(${s})` }, g);
        // the facets, painted in light and darker tones
        let pi = 0;
        for (let i = 0; i < 5; i++) {
          const q = `M${GIRDLE[i]} 0L${TABLE[i]} -38L${TABLE[i + 1]} -38L${GIRDLE[i + 1]} 0Z`, tri = `M${GIRDLE[i]} 6L${GIRDLE[i + 1]} 6L0 109Z`;
          P.el("path", { d: q, fill: L.cols[pi++ % 5] }, gem); P.el("path", { d: tri, fill: L.cols[(pi + 2) % 5] }, gem);
        }
        P.el("path", { d: "M-120 0H120V6H-120Z", fill: L.cols[3] }, gem);
        const sh = P.layer(gem); sh.stroke(-50, -30, 10, -30, 5, "#ffffff", 0.7); sh.stroke(-60, 20, -20, 70, 6, "#ffffff", 0.45); sh.done();
        let fl = ""; for (let i = 1; i < 5; i++) fl += `M${GIRDLE[i]} 0L${TABLE[i]} -38M${GIRDLE[i]} 6L0 109`;
        P.el("path", { d: fl + "M-120 0H120M-120 6H120", fill: "none", stroke: P.INK, "stroke-width": 1.4, opacity: 0.45, ...F }, gem);
        P.ink("M" + V.map((v) => v.join(" ")).join("L") + "Z", gem, 3);
        // the rays, drawn in by light
        const rg = P.el("g", { "data-name": "rays" }, gem);
        for (const x of XS) {
          const { pts, out } = trace(x, 0.14, L.n);
          const r = P.el("path", { d: "M" + pts.map((v) => v[0].toFixed(1) + " " + v[1].toFixed(1)).join("L"), fill: "none", stroke: "#e39a22", "stroke-width": 3.4 / s, "stroke-linejoin": "round", "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", ...F }, rg);
          rays.push(r);
          if (out === "top") { const [ex, ey] = pts[pts.length - 1], st = P.el("path", { d: `M${ex} ${ey - 14}L${ex + 3} ${ey - 3}L${ex + 14} ${ey}L${ex + 3} ${ey + 3}L${ex} ${ey + 14}L${ex - 3} ${ey + 3}L${ex - 14} ${ey}L${ex - 3} ${ey - 3}Z`, fill: "#fff3b8", stroke: "#e39a22", "stroke-width": 1.6, opacity: 0 }, rg); stars.push(st); }
        }
      });
      const st = { light: o.light === undefined ? 1 : ISO.clamp(+o.light || 0, 0, 1) }; let v = st.light;
      const draw = () => {
        const off = (1 - v).toFixed(3); for (const r of rays) r.setAttribute("stroke-dashoffset", off);
        const sp = ISO.smooth(0.85, 1, v).toFixed(2); for (const s of stars) s.setAttribute("opacity", sp);
      };
      draw();
      g.set = (q) => { if (q.light !== undefined) st.light = ISO.clamp(+q.light || 0, 0, 1); };
      g.update = (dt) => { const was = v; v = ISO.still() ? st.light : ISO.follow(v, st.light, dt, 0.7); if (Math.abs(v - st.light) < 0.002) v = st.light; if (v !== was) draw(); return v !== st.light; };
      g.readout = () => kinds.map((kd) => { let top = 0; for (const x of XS) if (trace(x, 0.14, LOOK[kd].n).out === "top") top++; return `${kd}: ${top} of 4 rays back out the top`; }).join(", ");
      return g;
    },
  });
})();
