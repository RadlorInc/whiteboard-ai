// "bottleflakes cx cy k step=0..2" — a clear plastic bottle (step 0) becomes a heap of small clear flakes (step 1),
// and the flakes melt into a thick shiny pool in a hot pan (step 2). Each state is finished; only opacities move.
(() => {
  const CLEAR = "#d3e6ee", EDGE = "#8fb3c4";
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const shard = (x, y, r, rot) => { const n = 4 + Math.floor(window.PAINT.rr(0, 2)), pts = [];
    for (let i = 0; i < n; i++) { const a = rot + (i / n) * 6.28 + window.PAINT.rr(-0.4, 0.4), q = r * window.PAINT.rr(0.6, 1.1); pts.push((x + Math.cos(a) * q * 1.3).toFixed(1) + " " + (y + Math.sin(a) * q * 0.75).toFixed(1)); }
    return "M" + pts.join("L") + "Z"; };
  ISO.add({
    name: "bottleflakes", title: "Bottle to flakes to melt", compare: null,
    about: "A clear plastic bottle that is cut into flakes and melted. step=0 the empty bottle; step=1 a heap of small clear flakes; step=2 the flakes melt into a thick shiny pool in a hot pan. Parts: bottle, cap, flakes, pan, melt.",
    line: "bottleflakes cx cy k=0.2..1.5 step=0..2",
    demo: { line: "bottleflakes 480 270 0.6 step=0", script: [{ set: { step: 0 }, hold: 1 }, { set: { step: 1 }, hold: "settle" }, { set: { step: 2 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(113);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" };
      // table shadow under whatever stands there
      const sh = P.layer(g); sh.stroke(-210, 196, 210, 196, 22, "#cdbf9f", 0.6); sh.done();
      // 1. the bottle: see-through body, ridges, petal feet, a blue cap
      const bot = P.el("g", { "data-name": "bottle" }, g);
      const BD = "M-26 -196 L26 -196 L26 -176 C26 -150 74 -136 76 -96 L76 -40 C70 -30 70 -20 76 -10 L76 150 C76 176 56 190 40 186 C20 196 -20 196 -40 186 C-56 190 -76 176 -76 150 L-76 -10 C-70 -20 -70 -30 -76 -40 L-76 -96 C-74 -136 -26 -150 -26 -176 Z";
      { const id = P.clip(bot, BD), a = P.layer(bot, id); P.el("path", { d: BD, fill: CLEAR, opacity: 0.75 }, a.g);
        a.stroke(-52, -110, -56, 160, 16, "#ffffff", 0.75, -4); a.stroke(-30, -100, -32, 150, 5, "#ffffff", 0.6, -3); a.stroke(56, -90, 58, 160, 12, EDGE, 0.35, 3);
        for (const y of [20, 70, 120]) a.stroke(-80, y, 80, y + 4, 7, EDGE, 0.5, 5);
        a.stroke(-80, -30, 80, -26, 10, "#ffffff", 0.5, 4); a.done();
        P.ink(BD, bot, 2.8); P.el("path", { d: "M-40 186 Q-30 168 -16 186 M16 186 Q30 168 40 186 M-76 -40 Q0 -50 76 -40 M-76 -10 Q0 -2 76 -10", fill: "none", stroke: EDGE, "stroke-width": 1.8, ...free }, bot);
        const cap = P.el("g", { "data-name": "cap" }, bot), CD = "M-32 -234 H32 V-200 H-32 Z"; P.el("path", { d: "M-36 -200 H36 V-192 H-36 Z", fill: "#7fa9c3", stroke: P.INK, "stroke-width": 2 }, cap);
        { const id2 = P.clip(cap, CD), c = P.layer(cap, id2); P.el("path", { d: CD, fill: "#3f78b0" }, c.g); for (let x = -28; x < 32; x += 8) c.stroke(x, -236, x, -198, 4, "#2c5a88", 0.8); c.stroke(-22, -236, -22, -198, 6, "#7fb0d8", 0.6); c.done(); P.ink(CD, cap, 2.6); } }
      // 2. the flakes: a heap of small clear and pale-blue chips, outlines in one path
      const fl = P.el("g", { "data-name": "flakes", opacity: 0 }, g); let fo = "";
      const byCol = {};
      for (let i = 0; i < 150; i++) { const u = P.rr(-1, 1), x = u * 200, top = 182 - 230 * (1 - u * u) ** 1.3, y = P.rr(top, 182), d = shard(x, y, P.rr(12, 20), P.rr(0, 6.28));
        const col = P.pick([CLEAR, "#c4dce6", "#e4f0f3", "#b8d6cf", "#a9c8dc"]); byCol[col] = (byCol[col] || "") + d; fo += d; }
      for (const col in byCol) P.el("path", { d: byCol[col], fill: col, opacity: 0.92 }, fl);
      const fa = P.layer(fl); for (let i = 0; i < 40; i++) fa.dab(P.rr(-150, 150), P.rr(20, 170), P.rr(2, 4), "#ffffff", 0.8);
      fa.done(); P.el("path", { d: fo, fill: "none", stroke: P.INK, "stroke-width": 1.1, opacity: 0.5, "stroke-linejoin": "round", ...free }, fl);
      // 3. the pan on a hot plate, the thick melt in it, a few flakes still sinking in, heat shimmer above
      const mg = P.el("g", { opacity: 0 }, g), pan = P.el("g", { "data-name": "pan" }, mg);
      const hp = P.layer(pan); hp.stroke(-200, 196, 200, 196, 26, "#5b5f66"); for (let x = -170; x <= 170; x += 34) hp.stroke(x, 192, x + 20, 192, 6, "#e0723c", 0.9); hp.done();
      const PD = "M-230 70 Q0 40 230 70 L210 168 Q0 196 -210 168 Z";
      P.el("path", { d: PD, fill: "#8d939b" }, pan); const pl = P.layer(pan); pl.stroke(-200, 150, 200, 150, 30, "#6f757d", 0.6, -10); pl.stroke(-196, 100, -186, 160, 10, "#c3c8cd", 0.6); pl.done(); P.ink(PD, pan, 3);
      const MD = "M-206 78 Q0 52 206 78 Q190 104 0 110 Q-190 104 -206 78 Z", melt = P.el("g", { "data-name": "melt" }, mg);
      { const id = P.clip(melt, MD), m = P.layer(melt, id); P.el("path", { d: MD, fill: "#d9cf9e" }, m.g);
        m.stroke(-200, 84, 200, 84, 20, "#c4b77c", 0.6, -4); m.stroke(-140, 72, 40, 70, 9, "#fffbea", 0.9, -3); m.stroke(60, 74, 170, 78, 6, "#fffbea", 0.8, -2); m.stroke(-60, 96, 120, 98, 6, "#b0a066", 0.5, 2); m.done();
        P.ink(MD, melt, 2.2); let ld = ""; for (const [x, y, r] of [[-120, 80, 12], [96, 86, 10], [10, 70, 9]]) ld += shard(x, y, r, P.rr(0, 6.28));
        P.el("path", { d: ld, fill: "#d9eaf0", stroke: P.INK, "stroke-width": 1.2, opacity: 0.8, ...free }, melt); }
      P.el("path", { d: "M-120 30 q10 -14 0 -28 q-10 -14 0 -28 M0 20 q10 -14 0 -28 q-10 -14 0 -28 q10 -14 0 -28 M120 30 q10 -14 0 -28 q-10 -14 0 -28", fill: "none", stroke: "#c9774a", "stroke-width": 4, opacity: 0.7, "stroke-linecap": "round", ...free }, mg);
      const st = { step: ISO.clamp(+o.step || 0, 0, 2) }; let p = st.step;
      const paint = () => { const b = 1 - ss(0.2, 0.8, p), m = ss(1.2, 1.8, p); bot.setAttribute("opacity", b.toFixed(3)); fl.setAttribute("opacity", Math.max(0, 1 - b - m).toFixed(3)); mg.setAttribute("opacity", m.toFixed(3)); };
      paint();
      g.set = (q) => { if (q.step !== undefined) st.step = ISO.clamp(+q.step || 0, 0, 2); };
      g.update = (dt) => { p = ISO.still() ? st.step : ISO.follow(p, st.step, dt, 0.5); if (Math.abs(p - st.step) < 0.003) p = st.step; paint(); return p !== st.step; };
      g.readout = () => (st.step < 0.5 ? "a clear plastic bottle" : st.step < 1.5 ? "the bottle cut into small flakes" : "the flakes melted into a thick pool");
      return g;
    },
  });
})();
