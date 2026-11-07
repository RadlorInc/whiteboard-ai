// "spinneret cx cy k kind=melt|pulp run=0|1" — a press pushes a thick liquid through a metal plate with tiny holes;
// fine fibers come out of every hole, are drawn together through a guide and wound onto a spool. kind=melt: melted
// plastic, cooled by a stream of air. kind=pulp: dissolved wood pulp, set in a bath. run=1 the fibers flow and the
// spool turns.
(() => {
  const PY = -104, GY = 160, SY = 250;
  const fill = (P, par, d, [x0, x1, y0, y1], col, o = {}) => {
    const id = P.clip(par, d), a = P.layer(par, id);
    P.el("path", { d, fill: col }, a.g);
    const n = Math.min(44, Math.max(5, Math.round(((x1 - x0) * (y1 - y0)) / 900)));
    for (let i = 0; i < n; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1), t = (o.ang || 0) + P.rr(-0.4, 0.4), L = P.rr(16, 46);
      a.stroke(x, y, x + Math.cos(t) * L, y + Math.sin(t) * L, P.rr(6, 14), P.pick([P.dk(col, 0.12), P.lt(col, 0.16), col]), 0.75, P.rr(-5, 5)); }
    a.done(); if (o.ink !== false) P.ink(d, par, o.iw || 2.8);
  };
  ISO.add({
    name: "spinneret", title: "Spinneret", compare: null,
    about: "A press pushes a thick liquid through a metal plate with tiny holes (a spinneret); a fine fiber comes out of every hole, and the fibers are drawn together through a guide onto a spool. kind=melt: melted plastic cooled by blowing air. kind=pulp: dissolved wood pulp that sets in a bath. run=1 the fibers flow and the spool turns. Parts: press, liquid, plate, holes, fibers, air or bath, guide, spool.",
    line: "spinneret cx cy k=0.2..1.5 kind=melt|pulp run=0|1",
    demo: { line: "spinneret 480 270 0.62 kind=melt run=0", script: [{ set: { run: 0 }, hold: 1 }, { set: { run: 1 }, hold: 3 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, pulp = o.kind === "pulp"; P.seed(pulp ? 131 : 127);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" }, MET = "#a3a9b0", LIQ = pulp ? "#d98f3a" : "#dcc489";
      // the press: rod and piston over a cut-open barrel holding the thick liquid
      const pr = P.el("g", { "data-name": "press" }, g);
      fill(P, pr, "M-14 -330 H14 V-262 H-14 Z", [-14, 14, -330, -262], "#7d838b", { iw: 2.2 });
      const lq = P.el("g", { "data-name": "liquid" }, g), LD = "M-112 -238 H112 V-112 H-112 Z";
      { const id = P.clip(lq, LD), a = P.layer(lq, id); P.el("path", { d: LD, fill: LIQ }, a.g);
        for (let i = 0; i < 16; i++) { const x = P.rr(-110, 110), y = P.rr(-236, -116); a.stroke(x - 30, y, x + 30, y + P.rr(-8, 8), P.rr(6, 12), P.pick([P.lt(LIQ, 0.25), P.dk(LIQ, 0.12)]), 0.7, P.rr(-10, 10)); } a.done(); }
      fill(P, pr, "M-112 -262 H112 V-238 H-112 Z", [-112, 112, -262, -238], "#8a9098", { iw: 2.4 });
      const wall = "M-136 -250 H-112 V-112 H-136 Z M112 -250 H136 V-112 H112 Z"; fill(P, pr, wall, [-136, 136, -250, -112], MET, { ang: 1.57 });
      P.ink("M-112 -238 V-112 M112 -238 V-112", lq, 2, false);
      // the plate, seen a little from below: a thick rim and its face full of tiny holes
      const pg = P.el("g", { "data-name": "plate" }, g), RIM = `M-150 ${PY - 12} H150 V${PY + 4} A150 34 0 0 1 -150 ${PY + 4} Z`;
      fill(P, pg, RIM, [-150, 150, PY - 14, PY + 40], "#8e959d", { ang: 0, iw: 2.6 });
      const FACE = `M-128 ${PY + 4} A128 26 0 0 0 128 ${PY + 4} A128 26 0 0 0 -128 ${PY + 4} Z`; fill(P, pg, FACE, [-128, 128, PY - 24, PY + 32], "#c3c8ce", { ang: 0, iw: 2 });
      const holes = []; for (let j = -2; j <= 2; j++) { const y = PY + 4 + j * 8.5, half = 116 * Math.sqrt(1 - (j / 3) ** 2); for (let x = -half + ((j + 2) % 2) * 6; x <= half; x += 13) holes.push([x, y]); }
      P.el("path", { "data-name": "holes", d: holes.map(([x, y]) => `M${(x - 2.6).toFixed(1)} ${y.toFixed(1)}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z`).join(""), fill: "#2a2f38" }, pg);
      // around the fibers: a funnel of setting bath (pulp) or a box blowing cool air (melt)
      const env = P.el("g", { "data-name": pulp ? "bath" : "air" }, g);
      if (pulp) { const BD = `M-176 ${PY - 6} H176 L40 ${GY - 34} H-40 Z`; P.el("path", { d: BD, fill: "#bcd6dc", opacity: 0.55 }, env);
        const bl = P.layer(env); bl.stroke(-160, PY + 40, -40, GY - 50, 8, "#ffffff", 0.5); bl.stroke(-170, PY - 2, 170, PY - 2, 6, "#e6f1f3", 0.7); bl.done(); P.ink(BD, env, 2.6); }
      else { fill(P, env, "M-300 -60 H-232 V110 H-300 Z", [-300, -232, -62, 112], "#8f969e", { ang: 1.57, iw: 2.6 });
        P.el("path", { d: "M-292 -40 H-240 M-292 -10 H-240 M-292 20 H-240 M-292 50 H-240 M-292 80 H-240", fill: "none", stroke: "#3c434d", "stroke-width": 4, ...free }, env);
        P.el("path", { d: "M-222 -30 q24 -10 48 0 t48 0 M-222 25 q24 -10 48 0 t48 0 M-222 80 q24 -10 48 0 t48 0", fill: "none", stroke: "#4f8fc4", "stroke-width": 3.4, opacity: 0.75, "stroke-linecap": "round", ...free }, env);
        P.el("path", { d: "M-132 -38 l10 8 l-10 8 M-132 17 l10 8 l-10 8 M-132 72 l10 8 l-10 8", fill: "none", stroke: "#4f8fc4", "stroke-width": 3.4, opacity: 0.75, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, env); }
      // the fibers: one dark path under one light path whose dashes flow
      const fd = holes.map(([x, y]) => `M${x.toFixed(1)} ${(y + 2).toFixed(1)}C${x.toFixed(1)} ${(y + 90).toFixed(1)} ${(x * 0.12).toFixed(1)} ${GY - 110} 0 ${GY}`).join("") + `M0 ${GY}L0 ${SY - 26}`;
      const fg = P.el("g", { "data-name": "fibers" }, g);
      P.el("path", { d: fd, fill: "none", stroke: "#5c5546", "stroke-width": 2.6, opacity: 0.55, ...free }, fg);
      P.el("path", { d: fd, fill: "none", stroke: pulp ? "#fbf4e2" : "#fbfbf6", "stroke-width": 1.5, ...free }, fg);
      const flow = P.el("path", { d: fd, fill: "none", stroke: pulp ? "#e9c58c" : "#d8dde2", "stroke-width": 1.5, "stroke-dasharray": "10 26", ...free }, fg);
      // the guide and the spool
      const gd = P.el("g", { "data-name": "guide" }, g); P.el("path", { d: `M-40 ${GY - 4} H-10 M10 ${GY - 4} H60`, stroke: "#7d838b", "stroke-width": 8, "stroke-linecap": "round", ...free }, gd);
      P.el("circle", { cx: 0, cy: GY, r: 9, fill: "none", stroke: "#e4e0d6", "stroke-width": 5 }, gd); P.el("circle", { cx: 0, cy: GY, r: 12, fill: "none", stroke: P.INK, "stroke-width": 1.8 }, gd);
      const sp = P.el("g", { "data-name": "spool" }, g), DR = `M-80 ${SY - 26} H80 V${SY + 26} H-80 Z`;
      const did = P.clip(sp, DR), drum = P.el("g", { "clip-path": `url(#${did})` }, sp);
      P.el("path", { d: DR, fill: pulp ? "#efe0bf" : "#eef0ee" }, drum);
      const wraps = P.el("g", {}, drum); let wd = ""; for (let y = SY - 40; y < SY + 40; y += 7) wd += `M-80 ${y}L80 ${y + 2}`;
      P.el("path", { d: wd, fill: "none", stroke: pulp ? "#c9a96a" : "#b9c0c6", "stroke-width": 2, ...free }, wraps);
      P.el("path", { d: `M-80 ${SY - 18} H80`, stroke: "#ffffff", "stroke-width": 6, opacity: 0.5, ...free }, drum);
      P.ink(DR, sp, 2.4, false);
      for (const x of [-88, 88]) P.el("path", { d: `M${x - 8} ${SY - 44} H${x + 8} V${SY + 44} H${x - 8} Z`, fill: "#8a6a4a", stroke: P.INK, "stroke-width": 2.2, "stroke-linejoin": "round" }, sp);
      const st = { run: String(o.run) === "1" }; let off = 0;
      g.set = (q) => { if (q.run !== undefined) st.run = String(q.run) === "1"; };
      g.update = (dt) => {
        if (!st.run || ISO.still()) return false;
        off = (off + dt * 46) % 36; flow.setAttribute("stroke-dashoffset", (-off).toFixed(1)); wraps.setAttribute("transform", `translate(0 ${((off % 7) - 3.5).toFixed(2)})`);
        return true;
      };
      g.readout = () => `${pulp ? "dissolved pulp setting in a bath" : "melted plastic cooled by air"}${st.run ? ", fibers flowing" : ", stopped"}`;
      return g;
    },
  });
})();
