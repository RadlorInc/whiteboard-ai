// "density cx cy width lab=1" — floating and sinking in a glass tank of water.
// Three things are dropped in one after another: a wooden block (density 0.6 g/cm³), a hollow plastic ball (0.5) and
// a stone (2.6). Each settles where the water it pushes aside weighs as much as it does: the block floats 60% under,
// the ball half under, the stone sinks to the bottom. They bob into place under real buoyancy and drag.
// set({ drop: n }) drops the first n; set({ drop: 0 }) lifts them out.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, BOARD = { x: -100, y: -46, w: 200, d: 92, r: 6 };
  const TANK = { x0: -80, x1: 80, y0: -34, y1: 34, z0: 6, z1: 96 }, LEVEL = 64;
  const THINGS = [
    { name: "wood", label: "wood 0.6", rho: 0.6, x: -46, kind: "box", size: 22, tint: "wood" },
    { name: "ball", label: "ball 0.5", rho: 0.5, x: 0, kind: "ball", size: 22, tint: "amber" },
    { name: "stone", label: "stone 2.6", rho: 2.6, x: 46, kind: "stone", size: 18, tint: "steel" },
  ];
  const restOf = (th) => (th.rho >= 1 ? TANK.z0 + 3 : LEVEL - th.rho * th.size);   // bottom height at rest

  function tankBack(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 40, y: -42, w: 40, d: 7, r: 1 })];
    // The tank's floor and its back and left glass walls (the far ones), with a metal frame along the edges.
    out.push(ISO.wbox(P, [TANK.x0 - 2, TANK.x1 + 2], [TANK.y0 - 2, TANK.y1 + 2], [0, TANK.z0], "mid"));
    out.push(`<path d="${K.pathOf([[TANK.x0, TANK.y0, TANK.z0], [TANK.x1, TANK.y0, TANK.z0], [TANK.x1, TANK.y0, TANK.z1], [TANK.x0, TANK.y0, TANK.z1]].map((p) => K.iso(p, P)), true)}" fill="#eef6fb" stroke="#5d7f96" stroke-width="0.8"/>`);
    out.push(`<path d="${K.pathOf([[TANK.x0, TANK.y0, TANK.z0], [TANK.x0, TANK.y1, TANK.z0], [TANK.x0, TANK.y1, TANK.z1], [TANK.x0, TANK.y0, TANK.z1]].map((p) => K.iso(p, P)), true)}" fill="#e7f1f8" stroke="#5d7f96" stroke-width="0.8"/>`);
    // A depth scale etched on the back glass, ticks every 5 hanging from a vertical rule.
    const minor = [], major = [];
    for (let z = TANK.z0 + 5; z <= TANK.z1 - 5; z += 5) ((z - TANK.z0) % 25 ? minor : major).push(K.segment([TANK.x1 - 8, TANK.y0 + 0.1, z], [TANK.x1 - 8 - ((z - TANK.z0) % 25 ? 2.5 : 4.5), TANK.y0 + 0.1, z], P));
    out.push(L(K.segment([TANK.x1 - 8, TANK.y0 + 0.1, TANK.z0 + 5], [TANK.x1 - 8, TANK.y0 + 0.1, TANK.z1 - 5], P), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    return out.join("");
  }
  function thingSvg(P, th, z) {
    const T = ISO.T[th.tint], h = th.size;
    if (th.kind === "box") return ISO.tinted(T, ISO.wbox(P, [th.x - h / 2, th.x + h / 2], [-h / 2, h / 2], [z, z + h], "hi"));
    if (th.kind === "ball") return ISO.tinted(T, S(G.sphereOf([th.x, 0, z + h / 2], h / 2, P), { tone: "hi" }));
    // A stone: an irregular convex lump.
    const V = [[-9, -7, 0], [8, -8, 1], [10, 6, 0], [-7, 8, 1], [-6, -4, 14], [7, -5, 15], [6, 5, 13], [-5, 6, 16], [0, 0, 18]].map(([x, y, zz]) => [th.x + x, y, z + zz]);
    return ISO.tinted(T, ISO.poly(V, [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 8], [5, 6, 8], [6, 7, 8], [7, 4, 8]], P, "hi"));
  }
  function waterSvg(P, level) {
    // The water: a tinted volume drawn over what's under it, its surface a lighter sheet, then the near glass edges.
    const box = (pts) => K.pathOf(pts.map((p) => K.iso(p, P)), true);
    return `<path d="${box([[TANK.x0, TANK.y1, TANK.z0], [TANK.x1, TANK.y1, TANK.z0], [TANK.x1, TANK.y1, level], [TANK.x0, TANK.y1, level]])}" fill="#4f93d6" fill-opacity=".22"/>` +
      `<path d="${box([[TANK.x1, TANK.y0, TANK.z0], [TANK.x1, TANK.y1, TANK.z0], [TANK.x1, TANK.y1, level], [TANK.x1, TANK.y0, level]])}" fill="#2b6cc4" fill-opacity=".26"/>` +
      `<path d="${box([[TANK.x0, TANK.y0, level], [TANK.x1, TANK.y0, level], [TANK.x1, TANK.y1, level], [TANK.x0, TANK.y1, level]])}" fill="#bfdcf5" fill-opacity=".5" stroke="#4f93d6" stroke-width="0.8"/>`;
  }
  function tankFront(P) {
    const edge = (a, b) => K.segment(a, b, P), { x0, x1, y0, y1, z0, z1 } = TANK;
    return `<path d="${[edge([x0, y1, z0], [x1, y1, z0]), edge([x1, y1, z0], [x1, y0, z0]), edge([x0, y1, z1], [x1, y1, z1]), edge([x1, y1, z1], [x1, y0, z1]), edge([x0, y0, z1], [x0, y1, z1]), edge([x1, y0, z1], [x0, y0, z1]),
      edge([x0, y1, z0], [x0, y1, z1]), edge([x1, y1, z0], [x1, y1, z1]), edge([x1, y0, z0], [x1, y0, z1])].join("")}" fill="none" stroke="#5d7f96" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  ISO.add({
    name: "density", title: "Float or sink (density)", compare: "density 480 280 360",
    about: "Glass tank of water: wood floats 60% under, a plastic ball half under, a stone sinks — each pushes aside its own weight of water.",
    line: "density cx cy width drop=3 lab=1",
    demo: { line: "density 480 270 360 drop=0", script: [{ set: { drop: 1 }, hold: "settle" }, { set: { drop: 2 }, hold: "settle" }, { set: { drop: 3 }, hold: "settle" }, { set: { drop: 0 }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 1.1;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [TANK.x0, TANK.y0, TANK.z1 + 40], [TANK.x1, TANK.y1, TANK.z1 + 4]], cx, cy, W, H, { azimuth: 60, elevation: 24 }, parent);
      const n0 = ISO.clamp(Math.round(ISO.num(o, "drop", 3)), 0, 3);
      const st = THINGS.map((th, i) => ({ z: i < n0 ? restOf(th) : TANK.z1 + 18, v: 0, in: i < n0 }));
      g.innerHTML = `<g>${tankBack(P)}</g><g data-part="things"></g><g data-part="water"></g><g>${tankFront(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        const key = st.map((s) => s.z.toFixed(2)).join();
        w.rebuild(el.things, key, () => THINGS.map((th, i) => `<g data-name="${th.name}">${thingSvg(P, th, st[i].z)}</g>`).join(""));
        w.rebuild(el.water, "w", () => waterSvg(P, LEVEL));
        if (lab) w.rebuild(el.words, key, () => THINGS.map((th, i) => ISO.word(K.iso([th.x, TANK.y1, st[i].z + th.size + 6], P), th.label, "#445", { size: 13, dy: -4 })).join(""));
      };
      g.set = (p) => { if (p.drop !== undefined) { const n = ISO.clamp(Math.round(+p.drop), 0, 3); st.forEach((s, i) => { s.in = i < n; }); } };
      g.update = (dt) => {
        let moving = false;
        THINGS.forEach((th, i) => {
          const s = st[i], top = TANK.z1 + 18;
          if (!s.in) { s.z = ISO.follow(s.z, top, dt, 0.3, ISO.still()); s.v = 0; moving = moving || s.z !== top; return; }
          const rest = restOf(th);
          if (ISO.still()) { s.z = rest; s.v = 0; return; }
          for (let k = 0; k < 6; k++) {
            const h = dt / 6, under = ISO.clamp((LEVEL - s.z) / th.size, 0, 1), inWater = s.z < LEVEL;
            const a = g9 * 60 * ((under / th.rho) - 1) - (inWater ? 4.5 : 0.2) * s.v;   // world units: 60 per metre, fake scale
            s.v += a * h; s.z += s.v * h;
            if (s.z < TANK.z0 + 3) { s.z = TANK.z0 + 3; s.v = 0; }
          }
          const done = Math.abs(s.z - rest) < 0.05 && Math.abs(s.v) < 0.5;
          if (done) { s.z = rest; s.v = 0; } else moving = true;
        });
        draw();
        return moving;
      };
      g.readout = () => THINGS.map((th, i) => (st[i].in ? `${th.name}: ${th.rho < 1 ? `floats ${Math.round(th.rho * 100)}% under` : "sinks"}` : null)).filter(Boolean).join(" · ") || "water: 1.0 g/cm³ — drop something in";
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
