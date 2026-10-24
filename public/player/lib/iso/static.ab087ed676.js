// "static cx cy size k=electroscope|balloon lab=1" — static charge: a gold-leaf electroscope, or two rubbed balloons.
// electroscope: a brass cap on a rod through an insulating plug into a glass case, two gold leaves at its foot.
// A rubbed polythene rod (negative) brought near pushes electrons down the rod, so the leaves (same charge) spread;
// take it away and they fall. Touch the cap with it and charge flows on, so they stay apart after it leaves; touch the
// earth wire and the charge drains and they fall. balloon: two balloons on threads, both rubbed on wool, push apart.
// set({ rod: "away"|"near"|"touch", earth: 1 }) moves the rod or earths the cap.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BASE = { x: -60, y: -40, w: 120, d: 80, r: 6 }, CASE = { x0: -26, x1: 26, y0: -18, y1: 18, z0: 10, z1: 70 }, CAP = [0, 0, 92], FOOT = 34;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  function scopeStatic(P, lab) {
    const out = [ISO.baseboard(P, BASE), ISO.plate(P, { x: 20, y: -34, w: 34, d: 10, r: 1 })];
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [CASE.x0 - 4, CASE.x1 + 4], [CASE.y0 - 4, CASE.y1 + 4], [0, CASE.z0], "mid")));
    // Back and side glass, and the metal frame of the case.
    const pane = (pts, fill) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="#5d7f96" stroke-width="0.7"/>`;
    out.push(pane([[CASE.x0, CASE.y0, CASE.z0], [CASE.x1, CASE.y0, CASE.z0], [CASE.x1, CASE.y0, CASE.z1], [CASE.x0, CASE.y0, CASE.z1]], "#eef6fb"));
    out.push(pane([[CASE.x0, CASE.y0, CASE.z0], [CASE.x0, CASE.y1, CASE.z0], [CASE.x0, CASE.y1, CASE.z1], [CASE.x0, CASE.y0, CASE.z1]], "#e7f1f8"));
    // Earth wire from the case foot to an earth terminal on the base.
    out.push(S(K.cylinder(46, 24, 3, 0, 4, P, 18), { tone: "mid" }), `<path d="${K.pathOf([[CASE.x1, CASE.y1 - 4, CASE.z0 + 2], [46, 24, 4]].map((p) => K.iso(p, P)))}" stroke="#2c9a3a" stroke-width="1.2" fill="none"/>`);
    if (lab) out.push(ISO.word(K.iso([46, 24, 0], P), "earth", "#2c6a22", { size: 13, dy: 16 }));
    return out.join("");
  }
  function scopeFront(P) {
    const { x0, x1, y0, y1, z0, z1 } = CASE, e = (a, b) => K.segment(a, b, P);
    const out = [`<path d="${K.pathOf([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]].map((p) => K.iso(p, P)), true)}" fill="#cfe2f2" fill-opacity=".18"/>`];
    out.push(`<path d="${[e([x0, y1, z0], [x1, y1, z0]), e([x1, y1, z0], [x1, y0, z0]), e([x0, y1, z1], [x1, y1, z1]), e([x1, y1, z1], [x1, y0, z1]), e([x0, y0, z1], [x0, y1, z1]), e([x1, y0, z1], [x0, y0, z1]), e([x0, y1, z0], [x0, y1, z1]), e([x1, y1, z0], [x1, y1, z1]), e([x1, y0, z0], [x1, y0, z1])].join("")}" fill="none" stroke="#5d7f96" stroke-width="1.6"/>`);
    // Insulating plug in the lid, the brass rod and the cap disc.
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, 5, z1, 5, P, 24, 0.4), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 1.2, z1 + 5, CAP[2] - z1 - 5, P, 12), { tone: "hi", crease: "none" }) + S(K.cylinder(0, 0, 11, CAP[2], 2, P, 40, 0.5), { tone: "hi" })));
    return out.join("");
  }
  // The rod inside the case and the two leaves hanging from the foot plate, spread by angle a either side.
  function leavesSvg(P, a, charge) {
    const out = [ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 1.2, FOOT, CASE.z1 - FOOT, P, 12), { tone: "hi", crease: "none" }) + ISO.wbox(P, [-2, 2], [-1, 1], [FOOT - 2, FOOT + 6], "hi"))];
    for (const side of [-1, 1]) {
      const tip = [side * Math.sin(a) * 18, 0, FOOT - Math.cos(a) * 18], w = [Math.cos(a) * 2.2 * side, 0, Math.sin(a) * 2.2];
      const pts = [[side * 1.6, 0, FOOT], [side * 1.6 + w[0], 0, FOOT + w[2] * 0.2], [tip[0] + w[0], 0, tip[2] + w[2]], [tip[0], 0, tip[2]]];
      out.push(`<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#e8c44a" stroke="#8a6a10" stroke-width="0.5"/>`);
    }
    if (charge) for (const side of [-1, 1]) out.push(ISO.word(K.iso([side * (Math.sin(a) * 18 + 6), 0, FOOT - 10], P), "−", "#1f4f8f", { size: 14, halo: false }));
    return out.join("");
  }
  // The polythene rod held at distance d from the cap (a short grey rod with − marks).
  function rodSvg(P, d) {
    const F = G.frameOf([12 + d, 0, CAP[2] + 1], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    return ISO.tinted(ISO.tint("#e9eaec", ["#a6a9ae", "#b8babf", "#c9cbcf", "#d8dadd"], "#3c3f45"), S(G.disc(0, 60, 2.6, F, P), { tone: "hi" })) +
      [12, 22, 32].map((s) => ISO.word(K.iso(G.pointOf(F, s, 2.6, Math.PI / 2), P), "−", "#1f4f8f", { size: 13, halo: false, dy: -3 })).join("");
  }

  function balloonSvg(P, x, a, tint) {
    const top = [x, 0, 120], len = 70, c = [x + Math.sin(a) * len, 0, top[2] - Math.cos(a) * len];
    return `<path d="${K.pathOf([K.iso(top, P), K.iso(c, P)])}" stroke="#55575c" stroke-width="0.8" fill="none"/>` +
      ISO.tinted(tint, S(G.lathe([[0, 0], [2, 4, 1], [6, 9, 1], [13, 11, 1], [20, 9, 1], [25, 4, 1], [27, 0]], G.frameOf([c[0], 0, c[2] - 27], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" }));
  }

  ISO.add({
    name: "static", title: "Static charge (electroscope)", compare: "static 480 270 300 k=electroscope",
    about: "A gold-leaf electroscope: a charged rod near the cap spreads the leaves; touching charges it; earthing drains it.",
    line: "static cx cy size k=electroscope|balloon lab=1",
    demo: { line: "static 480 270 320", script: [{ set: { rod: "near" }, hold: "settle" }, { set: { rod: "away" }, hold: "settle" }, { set: { rod: "touch" }, hold: "settle" }, { set: { rod: "away" }, hold: "settle" }, { set: { earth: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", k = o.k === "balloon" ? "balloon" : "electroscope", W = size * 1.5, H = size * 1.1;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -12, 0), [0, 0, CAP[2] + 12], [80, 0, CAP[2]], [0, 0, 124]], cx, cy, W, H, { azimuth: 70, elevation: 18 }, parent);
      const s = { d: 70, dT: 70, charge: 0, a: 0.06, bal: 0 };
      const w = ISO.writer();
      if (k === "balloon") {
        g.innerHTML = `<g>${ISO.baseboard(P, BASE)}${ISO.wbox(P, [-50, 50], [-4, 4], [120, 124], "mid")}${ISO.wbox(P, [-50, -44], [-4, 4], [0, 120], "mid")}</g><g data-part="b"></g>`;
        const el = g.querySelector('[data-part="b"]');
        g.set = (p) => { if (p.rubbed !== undefined) s.balT = +p.rubbed; };
        g.update = (dt) => { s.bal = ISO.follow(s.bal, s.balT ?? 1, dt, 0.4, ISO.still()); w.rebuild(el, s.bal.toFixed(3), () => balloonSvg(P, -14, -0.32 * s.bal, ISO.T.red) + balloonSvg(P, 14, 0.32 * s.bal, ISO.T.blue)); return s.bal !== (s.balT ?? 1); };
        g.readout = () => "both rubbed on wool, both pick up extra electrons (−): like charges repel, so they hang apart";
        g.update(0);
        return g;
      }
      g.innerHTML = `<g>${scopeStatic(P, lab)}</g><g data-part="leaves"></g><g>${scopeFront(P)}</g><g data-part="rod"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      if (lab) el.words.innerHTML = ISO.word(K.iso([0, 0, CAP[2] + 2], P), "brass cap", "#6b5114", { size: 13, anchor: "end", dy: -8 }) + ISO.word(K.iso([CASE.x1, CASE.y1, FOOT - 8], P), "gold leaves", "#8a6a10", { size: 13, anchor: "start" });
      const wantAngle = () => { const near = ISO.clamp(1 - s.d / 50, 0, 1); return 0.06 + Math.min(0.7, 0.62 * Math.max(near, s.charge)); };
      g.set = (p) => {
        if (p.rod === "near") s.dT = 6; if (p.rod === "away") s.dT = 70; if (p.rod === "touch") s.dT = 0;
        if (p.earth) s.charge = 0;
      };
      g.update = (dt) => {
        s.d = ISO.follow(s.d, s.dT, dt, 0.35, ISO.still());
        if (s.d < 0.5) s.charge = 1;                       // touching passes charge to the cap
        const want = wantAngle();
        s.a = ISO.follow(s.a, want, dt, 0.25, ISO.still());
        w.rebuild(el.rod, s.d.toFixed(2), () => rodSvg(P, s.d));
        w.rebuild(el.leaves, s.a.toFixed(3), () => leavesSvg(P, s.a, s.a > 0.2));
        return s.d !== s.dT || s.a !== want;
      };
      g.readout = () => `${s.d < 0.5 ? "rod touching the cap" : s.d < 20 ? "charged rod near the cap" : "rod away"} · electroscope ${s.charge ? "charged (−)" : "uncharged"} · leaves ${Math.round((s.a * 2 * 180) / Math.PI)}° apart${s.charge ? "" : s.a > 0.2 ? " (charge pushed down to them)" : ""}`;
      g.update(0);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
