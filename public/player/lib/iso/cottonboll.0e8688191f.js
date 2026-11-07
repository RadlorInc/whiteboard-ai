// "cottonboll cx cy k open=0..1" — a cotton plant stem with leaves and three bolls. open=0 all bolls closed and green;
// as open rises they split one after another, dry brown, and the white fiber puffs out with dark seeds inside it.
(() => {
  const EGG = "M0 -58 C30 -48 40 -10 36 10 C32 32 14 40 0 40 C-14 40 -32 32 -36 10 C-40 -10 -30 -48 0 -58Z";
  const BOLLS = [{ x: -40, y: -232, s: 1.5, d: 0 }, { x: -178, y: -76, s: 1.75, d: 0.5 }, { x: 170, y: -6, s: 1.65, d: 1 }];
  const LEAVES = [[150, -150, 100, -0.5], [-150, 70, 104, 3.6], [140, 120, 92, 0.2], [-130, -210, 74, 3.9]];
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const fill = (P, par, d, [x0, x1, y0, y1], col, o = {}) => {
    const id = P.clip(par, d), a = P.layer(par, id);
    P.el("path", { d, fill: col }, a.g);
    const n = Math.min(40, Math.max(5, Math.round(((x1 - x0) * (y1 - y0)) / 700)));
    for (let i = 0; i < n; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1), t = (o.ang || 0) + P.rr(-0.5, 0.5), L = P.rr(14, 40);
      a.stroke(x, y, x + Math.cos(t) * L, y + Math.sin(t) * L, P.rr(5, 12), P.pick([P.dk(col, 0.14), P.lt(col, 0.16), col]), 0.75, P.rr(-5, 5)); }
    a.done(); if (o.ink !== false) P.ink(d, par, o.iw || 2.8);
  };
  const leafD = (x, y, s, r) => {
    const pts = []; for (let i = 0; i <= 44; i++) { const th = -2.2 + (4.4 * i) / 44, lobe = Math.pow((1 + Math.cos(7 * th)) / 2, 1.4);
      const q = s * (0.42 + 0.58 * lobe) * (1 - 0.32 * Math.abs(th) / 2.2); pts.push([Math.cos(th + r) * q, Math.sin(th + r) * q]); }
    return "M" + x + " " + y + "L" + pts.map(([a, b]) => (x + a).toFixed(1) + " " + (y + b).toFixed(1)).join("L") + "Z";
  };
  ISO.add({
    name: "cottonboll", title: "Cotton plant", compare: null,
    about: "A cotton plant stem with leaves and three bolls. open=0 the bolls are closed and green; 0.5 they split open; 1 the dry brown shells hold white fluffy fiber with dark seeds inside. The bolls open one after another: at open=0.5 one is open, one opening, one closed. Parts: stem, leaf, boll, fiber, seed.",
    line: "cottonboll cx cy k=0.2..1.5 open=0..1",
    demo: { line: "cottonboll 480 280 0.55 open=0", script: [{ set: { open: 0 }, hold: 1 }, { set: { open: 0.5 }, hold: "settle" }, { set: { open: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(71);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" };
      // soil and stem with its side branches
      const soil = P.layer(g); for (let i = 0; i < 9; i++) soil.stroke(-110 + i * 22, 262 + P.rr(-4, 4), -60 + i * 22, 262 + P.rr(-4, 4), P.rr(14, 22), P.pick(["#7a5a3c", "#8d6b48", "#6a4c31"]), 0.85); soil.done();
      const stem = P.el("g", { "data-name": "stem" }, g), sl = P.layer(stem), SC = "#6f6a35";
      const twigs = [[0, 255, 6, -60, 22], [6, -60, -40, -200, 14], [2, 30, -168, -60, 12], [4, 110, 160, 16, 12], [4, -10, 150, -150, 9], [2, 120, 140, 120, 8], [4, 170, -150, 70, 8], [-6, -110, -120, -200, 8]];
      for (const [x1, y1, x2, y2, w] of twigs) { sl.stroke(x1, y1, x2, y2, w, SC, 1, 6); sl.stroke(x1 + 2, y1, x2 + 2, y2, w * 0.35, P.lt(SC, 0.3), 0.7, 6); }
      sl.done();
      const leafG = P.el("g", { "data-name": "leaf" }, g);
      for (const [x, y, s, r] of LEAVES) { const d = leafD(x, y, s, r); fill(P, leafG, d, [x - s, x + s, y - s, y + s], P.pick(["#4f7a3a", "#5a8442", "#47703a"]), { ang: r });
        let v = ""; for (const a of [-1.8, -0.9, 0, 0.9, 1.8]) v += `M${x} ${y}L${(x + Math.cos(r + a) * s * 0.78).toFixed(1)} ${(y + Math.sin(r + a) * s * 0.78).toFixed(1)}`;
        P.el("path", { d: v, fill: "none", stroke: "#b8cf8a", "stroke-width": 2.2, opacity: 0.8, "stroke-linecap": "round", ...free }, leafG); }
      // each boll: three finished states stacked; only their opacity moves
      // each boll is its own build part (ISO.later), so a slow phone builds the plant in slices
      const bolls = [], makeBoll = (b) => {
        const B = P.el("g", { "data-name": "boll", transform: `translate(${b.x} ${b.y}) scale(${b.s})` }, g);
        const st = (fn) => { const s = P.el("g", { opacity: 0 }, B); fn(s); return s; };
        const bracts = (par, col) => { const d = "M-40 26 L-50 4 L-38 10 L-44 -12 L-28 6 L-22 30 Z M40 26 L50 4 L38 10 L44 -12 L28 6 L22 30 Z M-24 38 L-10 30 L0 42 L10 30 L24 38 L12 52 L-12 52 Z"; fill(P, par, d, [-52, 52, -14, 54], col, { iw: 2.2 }); };
        const closed = st((s) => { bracts(s, "#4c7a35"); fill(P, s, EGG, [-40, 40, -60, 42], "#6f9a45", { ang: 1.5, iw: 3 });
          P.el("path", { d: "M0 -56 Q4 -10 0 38 M0 -56 Q-22 -16 -24 26 M0 -56 Q22 -16 24 26", fill: "none", stroke: "#3f5f2a", "stroke-width": 1.8, opacity: 0.7, ...free }, s); });
        const opening = st((s) => { bracts(s, "#6b7a3a");
          const sh = "M0 -62 C34 -52 44 -10 40 12 C36 34 16 44 0 44 C-16 44 -36 34 -40 12 C-44 -10 -34 -52 0 -62Z"; fill(P, s, sh, [-44, 44, -64, 46], "#9a9448", { ang: 1.5, iw: 3 });
          const cr = "M0 -58 Q9 -14 0 36 Q-9 -14 0 -58Z M-4 -54 Q-24 -24 -27 22 Q-30 -20 -4 -54Z M4 -54 Q24 -24 27 22 Q30 -20 4 -54Z";
          P.el("path", { d: cr, fill: "#f7f4ec", stroke: P.INK, "stroke-width": 1.8, "stroke-linejoin": "round", ...free }, s); });
        const open = st((s) => {
          // dry shells curled back behind the fiber
          let sd = ""; for (const a of [-155, -105, -25, 25, 90, 150]) { const r = (a * Math.PI) / 180, tx = Math.cos(r) * 64, ty = Math.sin(r) * 58 + 8, nx = -Math.sin(r) * 18, ny = Math.cos(r) * 18;
            sd += `M${(nx * 0.6).toFixed(1)} ${(8 + ny * 0.6).toFixed(1)}Q${(tx * 0.6 + nx).toFixed(1)} ${(ty * 0.6 + ny).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(tx * 0.6 - nx).toFixed(1)} ${(ty * 0.6 - ny).toFixed(1)} ${(-nx * 0.6).toFixed(1)} ${(8 - ny * 0.6).toFixed(1)}Z`; }
          fill(P, s, sd, [-66, 66, -54, 70], "#7a5634", { iw: 2.4 });
          const F = P.el("g", { "data-name": "fiber" }, s), locks = [[-26, -20, 31], [24, -24, 30], [-18, 16, 29], [22, 14, 30]];
          let od = ""; for (const [x, y, r] of locks) { for (let i = 0; i <= 28; i++) { const th = (i / 28) * 2 * Math.PI, q = r * (1 + 0.1 * Math.sin(th * 7 + x)); od += (i ? "L" : "M") + (x + Math.cos(th) * q).toFixed(1) + " " + (y + Math.sin(th) * q).toFixed(1); } od += "Z"; }
          const fl = P.layer(F);
          for (const [x, y, r] of locks) { fl.dab(x, y, r * 1.02, "#eeebe3"); fl.dab(x + r * 0.25, y + r * 0.3, r * 0.6, "#c9cbd0", 0.55);
            for (let i = 0; i < 16; i++) { const a = P.rr(0, 6.28), q = P.rr(0, r * 0.75); fl.dab(x + Math.cos(a) * q - r * 0.1, y + Math.sin(a) * q - r * 0.1, P.rr(5, 11), P.pick(["#ffffff", "#f6f4ee", "#dcdcd8"]), 0.8); }
            for (let i = 0; i < 6; i++) { const a = P.rr(3.4, 5.6); fl.stroke(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, 3, "#ffffff", 0.7, P.rr(-4, 4)); } }
          fl.done(); P.ink(od, F, 2.2);
          const sdg = P.el("g", { "data-name": "seed" }, s); let seeds = "";
          for (const [x, y, a] of [[-50, -2, 0.4], [48, -8, -0.5], [2, 40, 1.4], [0, -48, 1.2], [-4, -2, 0.8]]) { const c = Math.cos(a), si = Math.sin(a); seeds += `M${(x - c * 7).toFixed(1)} ${(y - si * 7).toFixed(1)}Q${(x - si * 5).toFixed(1)} ${(y + c * 5).toFixed(1)} ${(x + c * 7).toFixed(1)} ${(y + si * 7).toFixed(1)}Q${(x + si * 5).toFixed(1)} ${(y - c * 5).toFixed(1)} ${(x - c * 7).toFixed(1)} ${(y - si * 7).toFixed(1)}Z`; }
          P.el("path", { d: seeds, fill: "#2e2620", stroke: P.INK, "stroke-width": 1.4 }, sdg); });
        return { b, closed, opening, open };
      };
      const st = { open: ISO.clamp(+o.open || 0, 0, 1) }; let p = st.open;
      const paint = () => { for (const B of bolls) { const q = ISO.clamp(p * 2 - B.b.d, 0, 1), c = 1 - ss(0.2, 0.45, q), op = ss(0.55, 0.8, q);
        B.closed.setAttribute("opacity", c.toFixed(3)); B.opening.setAttribute("opacity", (1 - c - op).toFixed(3)); B.open.setAttribute("opacity", op.toFixed(3)); } };
      for (const b of BOLLS) ISO.later(() => { bolls.push(makeBoll(b)); paint(); });
      paint();
      g.set = (q) => { if (q.open !== undefined) st.open = ISO.clamp(+q.open || 0, 0, 1); };
      g.update = (dt) => { p = ISO.still() ? st.open : ISO.follow(p, st.open, dt, 0.5); if (Math.abs(p - st.open) < 0.002) p = st.open; paint(); return p !== st.open; };
      g.readout = () => (st.open < 0.2 ? "bolls closed and green" : st.open < 0.8 ? "bolls splitting open" : "bolls open: white fiber with seeds inside");
      return g;
    },
  });
})();
