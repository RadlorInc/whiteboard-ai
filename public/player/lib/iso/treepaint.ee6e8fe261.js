// "treepaint cx cy k kind=leafy|pine" — a painted tree standing on a patch of grass. leafy: a brown trunk with
// branches under a round, bumpy crown of greens; pine: a straight trunk under stacked jagged green tiers. A still drawing.
(() => {
  const free = { class: "free", "data-free": "1" };
  const TRUNK = "M-30 250 Q-22 140 -20 40 L-78 -40 L-62 -52 L-12 4 L-10 -70 L10 -70 L14 -2 L66 -58 L80 -44 L24 40 Q22 140 32 250 Z";
  // the crown's edge: bumps around an ellipse
  const crown = (() => { const cx = 0, cy = -150, rx = 230, ry = 165, n = 13, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI + 0.2; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i <= n; i++) { const p = pts[i % n], q = pts[i - 1], r = Math.hypot(p[0] - q[0], p[1] - q[1]) * 0.56; d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }
    return d + "Z"; })();
  const TIERS = [[-300, 92, -170], [-210, 140, -60], [-110, 190, 60], [-10, 236, 180]];
  const tier = ([top, hw, bot]) => { let d = `M0 ${top}`; const n = 7;
    for (let i = 1; i <= n; i++) { const t = i / n; d += `L${(hw * t).toFixed(1)} ${(top + (bot - top) * t).toFixed(1)}L${(hw * t - 14).toFixed(1)} ${(top + (bot - top) * t - 10).toFixed(1)}`; }
    d += `L${hw} ${bot}Q0 ${bot + 22} ${-hw} ${bot}`;
    for (let i = n; i >= 1; i--) { const t = i / n; d += `L${(-hw * t + 14).toFixed(1)} ${(top + (bot - top) * t - 10).toFixed(1)}L${(-hw * t).toFixed(1)} ${(top + (bot - top) * t).toFixed(1)}`; }
    return d + "Z"; };
  ISO.add({
    name: "treepaint", title: "Tree", compare: null,
    about: "A painted tree on a patch of grass. kind=leafy: a brown trunk and branches under a round, bumpy crown of greens; kind=pine: a straight trunk under stacked jagged green tiers. Parts: trunk crown.",
    line: "treepaint cx cy k=0.2..1.5 kind=leafy|pine",
    demo: { line: "treepaint 480 260 0.78 kind=leafy", script: [{ set: {}, hold: 1 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, pine = o.kind === "pine"; P.seed(pine ? 19 : 23);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const gr = P.layer(g); gr.stroke(-190, 252, 190, 252, 30, "#7f9a5c", 0.85, 4); gr.stroke(-150, 246, 150, 246, 14, "#a3b878", 0.8);
      for (let i = 0; i < 22; i++) { const x = P.rr(-180, 180); gr.stroke(x, 254, x + P.rr(-8, 8), 226 + P.rr(-8, 6), 4, P.pick(["#5f7a3f", "#8aa560"]), 0.9); } gr.done();
      const trunk = P.el("g", { "data-name": "trunk" }, g);
      const TR = pine ? "M-22 250 L-16 0 L16 0 L22 250 Z" : TRUNK;
      fill(trunk, TR, [-80, 80, -70, 250], "#7a4f30", "denim");
      const bark = P.layer(trunk, P.clip(trunk, TR)); for (let i = 0; i < 8; i++) { const x = P.rr(-20, 20); bark.stroke(x, P.rr(60, 120), x + P.rr(-4, 4), P.rr(160, 250), 3, "#4f321f", 0.55); } bark.done();
      P.ink(TR, trunk, 3.4);
      const cr = P.el("g", { "data-name": "crown" }, g);
      if (!pine) {
        const cl = P.clip(cr, crown), a = P.layer(cr, cl), b = P.layer(cr, cl);
        P.el("rect", { x: -260, y: -340, width: 520, height: 380, fill: "#4f7a3a" }, a.g);
        for (let i = 0; i < 140; i++) { const x = P.rr(-240, 240), y = P.rr(-320, 20); a.dab(x, y, P.rr(16, 30), P.pick(["#3f6a2f", "#5d8a42", "#6f9a4b", "#4f7a3a"]), 0.9); }
        for (let i = 0; i < 40; i++) { const x = P.rr(-200, 120), y = P.rr(-300, -120); b.dab(x, y, P.rr(10, 20), P.pick(["#9cbf68", "#86ad57"]), 0.75); }
        for (let i = 0; i < 26; i++) { const x = P.rr(-180, 220), y = P.rr(-80, 10); b.dab(x, y, P.rr(14, 26), "#33572a", 0.6); }
        a.done(); b.done();
        P.ink(crown, cr, 4);
      } else {
        for (const T of [...TIERS].reverse()) { const d = tier(T), cl = P.clip(cr, d), a = P.layer(cr, cl), [top, hw, bot] = T;
          P.el("rect", { x: -hw - 10, y: top - 10, width: 2 * hw + 20, height: bot - top + 40, fill: "#2f5a3c" }, a.g);
          for (let i = 0; i < 26; i++) { const x = P.rr(-hw, hw), y = P.rr(top + 20, bot); a.stroke(x, y - 26, x + (x < 0 ? -1 : 1) * P.rr(14, 30), y + 6, P.rr(6, 11), P.pick(["#24482f", "#3e6e48", "#4f7f52"]), 0.85); }
          a.stroke(-hw * 0.5, bot - 8, -hw * 0.1, top + 40, 10, "#6f9a68", 0.45); a.done(); P.ink(d, cr, 3.4); }
      }
      g.readout = () => (pine ? "pine tree" : "leafy tree");
      return g;
    },
  });
})();
