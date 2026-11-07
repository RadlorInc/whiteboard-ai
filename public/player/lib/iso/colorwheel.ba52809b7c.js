// "colorwheel cx cy k show=none|complement|analogous|triad|warm|cool at=<color>" — a painted 12-part color wheel. show
// lifts the parts that go together with the part named by at= (or the warm / cool half) and dims the rest.
(() => {
  const NAMES = ["yellow", "yellow-orange", "orange", "red-orange", "red", "red-violet", "violet", "blue-violet", "blue", "blue-green", "green", "yellow-green"];
  const HUES = ["#e3b23c", "#e0912f", "#d4702a", "#c4502c", "#a83632", "#93335a", "#5e3470", "#3e3f7d", "#28507f", "#1f6f6a", "#4f7f3a", "#93a23a"];
  const R0 = 92, R1 = 250, STEP = Math.PI / 6;
  const ang = (i) => -Math.PI / 2 + i * STEP;
  const pt = (r, a) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  const wedge = (i) => { const a0 = ang(i) - STEP / 2, a1 = ang(i) + STEP / 2; return `M${pt(R0, a0)}L${pt(R1, a0)}A${R1} ${R1} 0 0 1 ${pt(R1, a1)}L${pt(R0, a1)}A${R0} ${R0} 0 0 0 ${pt(R0, a0)}Z`; };
  const pick = (show, at) => {
    const m = (j) => ((j % 12) + 12) % 12;
    if (show === "complement") return [at, m(at + 6)];
    if (show === "analogous") return [m(at - 1), at, m(at + 1)];
    if (show === "triad") return [at, m(at + 4), m(at + 8)];
    if (show === "warm") return [0, 1, 2, 3, 4, 5];
    if (show === "cool") return [6, 7, 8, 9, 10, 11];
    return null;
  };
  ISO.add({
    name: "colorwheel", title: "Color wheel", compare: null,
    about: "A painted 12-part color wheel (yellow at the top, then around through orange, red, violet, blue and green). show=complement lifts the part named by at= and the one straight across; analogous lifts it and its two neighbors; triad lifts three parts evenly spaced; warm lifts the yellow-to-red-violet half, cool the violet-to-yellow-green half. The rest dim. Each part is a named part (yellow, red-orange, …).",
    line: `colorwheel cx cy k=0.2..1.5 show=none|complement|analogous|triad|warm|cool at=${NAMES.join("|")}`,
    demo: { line: "colorwheel 480 270 0.92 at=red", script: [{ set: { show: "none" }, hold: 1 }, { set: { show: "complement" }, hold: "settle" }, { set: { show: "analogous" }, hold: "settle" }, { set: { show: "triad" }, hold: "settle" }, { set: { show: "warm" }, hold: "settle" }, { set: { show: "cool" }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(71);
      const g = P.base(parent, cx, cy, k);
      const guides = P.el("path", { fill: "none", stroke: P.INK, "stroke-width": 3, "stroke-dasharray": "10 9", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0, class: "free", "data-free": "1" }, g);
      const parts = HUES.map((col, i) => {
        const w = P.el("g", { "data-name": NAMES[i] }, g), d = wedge(i), cl = P.clip(w, d);
        P.el("path", { d, fill: col }, w);
        const a = P.layer(w, cl);
        for (let s = 0; s < 7; s++) { const r = P.rr(R0 + 6, R1 - 6), c = ang(i) + P.rr(-0.08, 0.08), h = STEP * 0.75;
          a.stroke(Math.cos(c - h) * r, Math.sin(c - h) * r, Math.cos(c + h) * r, Math.sin(c + h) * r, P.rr(16, 30), P.pick([P.dk(col, 0.12), P.lt(col, 0.1), col]), 0.8, P.rr(-6, 6)); }
        for (let s = 0; s < 3; s++) { const r = P.rr(R0 + 20, R1 - 14), c = ang(i), h = STEP * 0.6;
          a.stroke(Math.cos(c - h) * r, Math.sin(c - h) * r, Math.cos(c + h) * r, Math.sin(c + h) * r, P.rr(3, 6), P.lt(col, 0.4), 0.6, P.rr(-4, 4)); }
        a.done();
        P.ink(d, w, 3.2);
        return w;
      });
      const hub = P.layer(g); hub.dab(0, 0, R0 - 14, "#efe5cf"); hub.dab(-8, -10, R0 - 40, P.lt("#efe5cf", 0.35), 0.7); hub.done();
      P.ink(`M${R0 - 14} 0A${R0 - 14} ${R0 - 14} 0 1 1 ${-(R0 - 14)} 0A${R0 - 14} ${R0 - 14} 0 1 1 ${R0 - 14} 0Z`, g, 3);
      g.appendChild(guides);
      const st = { show: "none", at: 4 }, now = HUES.map(() => ({ op: 1, out: 0 })), goal = HUES.map(() => ({ op: 1, out: 0 }));
      let gNow = 0, gGoal = 0;
      const aim = () => {
        const on = pick(st.show, st.at);
        goal.forEach((q, i) => { q.op = !on || on.includes(i) ? 1 : 0.22; q.out = on && on.includes(i) ? 16 : 0; });
        const mid = (i, r = 170) => pt(r, ang(i));
        const d = st.show === "complement" ? `M${mid(on[0])}L${mid(on[1])}` : st.show === "triad" ? `M${mid(on[0], 150)}L${mid(on[1], 150)}L${mid(on[2], 150)}Z` : st.show === "analogous" ? `M${mid(on[0], 272)}A272 272 0 0 1 ${mid(on[2], 272)}` : "";
        if (d) guides.setAttribute("d", d);
        gGoal = d ? 1 : 0;
      };
      const paint = () => { parts.forEach((w, i) => { const a = ang(i); w.setAttribute("opacity", now[i].op.toFixed(3)); w.setAttribute("transform", `translate(${(Math.cos(a) * now[i].out).toFixed(1)} ${(Math.sin(a) * now[i].out).toFixed(1)})`); }); guides.setAttribute("opacity", gNow.toFixed(3)); };
      g.set = (p) => {
        if (p.at !== undefined && NAMES.includes(p.at)) st.at = NAMES.indexOf(p.at);
        if (p.show !== undefined) st.show = p.show;
        aim();
      };
      g.update = (dt) => {
        let on = false;
        const f = (x, y) => { const v = ISO.still() ? y : ISO.follow(x, y, dt, 0.22); if (Math.abs(v - y) < 0.003) return y; on = true; return v; };
        now.forEach((q, i) => { q.op = f(q.op, goal[i].op); q.out = f(q.out, goal[i].out); });
        gNow = f(gNow, gGoal); paint(); return on;
      };
      g.set({ show: o.show || "none", at: o.at });
      now.forEach((q, i) => Object.assign(q, goal[i])); gNow = gGoal; paint();
      g.readout = () => { const on = pick(st.show, st.at); return on ? `${st.show}: ${on.map((i) => NAMES[i]).join(", ")}` : "all twelve colors"; };
      return g;
    },
  });
})();
