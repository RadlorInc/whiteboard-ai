// "jack cx cy height up=0-100 lab=1 lit=screw|saddle|arms|crank|base" — a car's scissor jack on the road.
// A stamped base, four arms (each two steel plates) on six pins, the saddle with its slot for the car's sill seam on
// top, and the lead screw across the middle: it is held at the right joint by a thrust washer and threads through a
// nut in the left joint, so every turn of the crank pulls the joints 3 mm closer and the diamond grows taller.
// Screw pull = load × half-width ÷ half-height, which is why the first turns are the hardest. up=0 is folded
// (saddle 13 cm high), up=100 fully raised (37 cm). set({ up }) cranks it there at 8 turns a second.
// World units: 1 = 1 cm. Arms 17 cm between pins; pins at the base and saddle 3.2 cm apart (geared pairs).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ARM = 17, GAP = 1.6, ZB = 4, H0 = 3, H1 = 15, PITCH = 0.3, LOAD = 400, EFF = 0.35, CRANK_R = 12;
  const SCREW_LEN = 2 * (GAP + ARM) + 4, ROAD_PLAN = { x: -26, y: -13, w: 68, d: 26, r: 3 };
  const STEEL = ISO.T.steel, ROAD = ISO.T.road, PAINT = ISO.tint("#e9eef3", ["#9aa6b2", "#adb8c3", "#c0c9d2", "#d1d8df"], "#3b4652");
  const xAxis = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAxis = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  // Geometry for a lift fraction u (0–1): half-height h of the diamond, half-width a of each side.
  const geo = (u) => { const h = H0 + (H1 - H0) * u, a = Math.sqrt(ARM * ARM - h * h); return { h, a, zt: ZB + 2 * h, zm: ZB + h, xs: GAP + a }; };
  const turnsAt = (u) => (2 * (geo(0).xs - geo(u).xs)) / PITCH;
  const pull = (u) => { const { h, a } = geo(u); return (LOAD * 9.81 * a) / h; };          // N, along the screw
  const hand = (u) => (pull(u) * (PITCH / 100)) / (2 * Math.PI * EFF) / (CRANK_R / 100); // N, on the crank grip

  // A box along the segment A→B in the x–z plane, w across it in that plane, y through it.
  const bar = (P, A, B, [w0, w1], [y0, y1], tone = "mid", ext = 1.4) => {
    const dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
    return ISO.box((u, w, y) => [A[0] + ux * u - uz * w, y, A[1] + uz * u + ux * w], P, [-ext, l + ext], [w0, w1], [y0, y1], tone);
  };
  const pin = (P, x, z, y) => S(G.disc(y, y + 0.6, 0.95, yAxis([x, 0, z]), P), { tone: "hi" }) + D([K.iso([x, y + 0.6, z], P)], { size: 0.5, tone: "mid" });

  function baseSvg(P, back) {
    if (back) return ISO.wbox(P, [-13, 13], [-5.2, 5.2], [0, 1], "mid") + ISO.wbox(P, [-9, 9], [-4, -3.3], [1, ZB + 1.6], "mid") +
      D([[-11, 3.6], [11, 3.6], [-11, -3.6], [11, -3.6]].map(([x, y]) => K.iso([x, y, 1], P)), { size: 0.5 }) + L(K.planOutline({ x: -12, y: -4.4, w: 24, d: 8.8, r: 1 }, 1, P, 2), { tone: "faint" });
    return ISO.wbox(P, [-9, 9], [3.3, 4], [1, ZB + 1.6], "mid") + D([-GAP, GAP].map((x) => K.iso([x, 4, ZB], P)), { size: 0.55, tone: "hi" });
  }
  // The four arms: a back plate pair (y −3…−2.2) or a front pair (2.2…3), with a lip along each arm's outer edge.
  function armsSvg(P, g, side) {
    const y = side === "back" ? [-3, -2.2] : [2.2, 3], out = [];
    for (const sx of [-1, 1]) {
      const joint = [sx * g.xs, g.zm];
      out.push(bar(P, [sx * GAP, ZB], joint, [-1.3, 1.3], y), bar(P, [sx * GAP, g.zt], joint, [-1.3, 1.3], y));
      if (side === "front") {
        // stiffening rib pressed into each plate: a closed slot, so it ends on nothing
        for (const A of [[sx * GAP, ZB], [sx * GAP, g.zt]]) {
          const dx = joint[0] - A[0], dz = joint[1] - A[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
          const slot = [[3, -0.45], [l - 3, -0.45], [l - 3, 0.45], [3, 0.45]].map(([u, w]) => K.iso([A[0] + ux * u - uz * w, 3.02, A[1] + uz * u + ux * w], P));
          out.push(L(K.pathOf(slot, true), { tone: "faint" }));
        }
      }
    }
    return out.join("");
  }
  // The screw between the joints: trunnion blocks in both joints, thrust washer on the right, the nut on the left.
  // The screw rides with the right joint (thrust washer there); the nut and left trunnion ride with the left joint.
  // Both are built once at the folded pose and translated; rings every 0.6 stand for the 3 mm thread.
  function screwSvg(P, g) {
    const xr = g.xs, Fs = G.frameOf([xr + 3, 0, g.zm], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
    const rings = []; for (let s = 2; s < SCREW_LEN - 0.6; s += 0.6) rings.push(G.arcOf(Fs, s, 0.8, P));
    return ISO.wbox(P, [xr - 1.2, xr + 1.2], [-2.2, 2.2], [g.zm - 1.3, g.zm + 1.3], "mid") +
      S(G.disc(0, SCREW_LEN, 0.8, Fs, P), { tone: "hi", inner: L(rings.join(""), { tone: "lo" }) }) + S(G.disc(-1.8, -0.8, 1.9, xAxis([xr + 3, 0, g.zm]), P), { tone: "mid" });
  }
  function nutSvg(P, g) {
    return ISO.wbox(P, [-g.xs - 1.2, -g.xs + 1.2], [-2.2, 2.2], [g.zm - 1.3, g.zm + 1.3], "mid") +
      S(G.prismOf(xAxis([-g.xs - 1.2, 0, g.zm]), Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 1.7, Math.sin(i * 1.047) * 1.7]), -1.4, 0, P), { tone: "mid" });
  }
  function saddleSvg(P, g, back) {
    const z = g.zt;
    if (back) return ISO.wbox(P, [-4.5, 4.5], [-3.9, -3.2], [z - 1.8, z + 1.4], "mid");
    return ISO.wbox(P, [-4.5, 4.5], [3.2, 3.9], [z - 1.8, z + 1.4], "mid") + ISO.wbox(P, [-5.5, 5.5], [-3.9, 3.9], [z + 1.4, z + 2.8], "hi") +
      ISO.wbox(P, [-5.5, 5.5], [-3.9, -1.1], [z + 2.8, z + 4.2], "hi") + ISO.wbox(P, [-5.5, 5.5], [1.1, 3.9], [z + 2.8, z + 4.2], "hi");
  }
  // The crank: a rod from the eye along the screw, an arm at angle `turn` round it, and a grip.
  function crankSvg(P, g, turn) {
    const x0 = g.xs + 3, z = g.zm, eye = yAxis([x0 + 0.9, 0, z]);
    const out = [S(G.ringBand(-0.8, 0.8, 0.7, 1.5, eye, P), { tone: "hi" })];
    const r = [0, -Math.sin(turn), Math.cos(turn)], a = [x0 + 0.9, 0, z], b = [x0 + 9, 0, z], c = G.add3(b, G.mul3(r, CRANK_R));
    out.push(S(G.disc(0, 8.1, 0.55, xAxis(a), P), { tone: "hi" }), S(G.sphereOf(b, 0.75, P), { tone: "hi" }));
    out.push(S(G.disc(0, CRANK_R, 0.55, G.frameAlong(b, r), P), { tone: "hi" }), S(G.sphereOf(c, 0.75, P), { tone: "hi" }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0.4, 6, 1, xAxis(c), P), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "jack", title: "Scissor jack", compare: "jack 480 280 240 up=60",
    about: "A scissor jack: each turn of the crank pulls the two side joints 3 mm closer on the screw and the diamond lifts the saddle.",
    line: "jack cx cy height up=0-100 lab=1 lit=screw|saddle|arms|crank|base",
    demo: { line: "jack 480 280 240 up=15", script: [{ set: {}, hold: 1 }, { set: { up: 55 }, hold: "settle" }, { set: { up: 100 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 3.2, BH = size * 2.05;
      const top = geo(1), wide = geo(0);
      const { P, g } = ISO.frame([...K.boxCorners(ROAD_PLAN, -4, 0), [0, 0, top.zt + 5], [-wide.xs - 3, 0, 8], [wide.xs + 30, 0, wide.zm + CRANK_R + 1]], cx, cy, BW, BH, { azimuth: 72, elevation: 20 }, parent);
      const names = ["base0", "saddle0", "arms0", "nut", "screw", "arms", "pinB", "pinL", "pinR", "base", "saddle", "crank", "words"];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(ROAD_PLAN, -4, 4, P)}"/>` + ISO.tinted(ROAD, S(K.slabOf(ROAD_PLAN, -4, 4, P, 4, 0.8), { tone: "mid" })) +
        `<path class="iso-halo" d="${K.haloOf({ x: -14, y: -6, w: 28, d: 12, r: 2 }, 0, 1, P)}"/><g style="${PAINT}">` + names.map((n) => `<g data-k="${n}"></g>`).join("") + "</g>";
      const el = Object.fromEntries(names.map((n) => [n, g.querySelector(`[data-k="${n}"]`)])), w = ISO.writer();
      const g0 = geo(0);
      el.base0.innerHTML = baseSvg(P, true); el.base.innerHTML = baseSvg(P, false);
      el.screw.setAttribute("style", STEEL); el.nut.setAttribute("style", STEEL);
      el.screw.innerHTML = screwSvg(P, g0); el.nut.innerHTML = nutSvg(P, g0); el.saddle0.innerHTML = saddleSvg(P, g0, true); el.saddle.innerHTML = saddleSvg(P, g0, false) + D([-GAP, GAP].map((x) => K.iso([x, 3.9, g0.zt], P)), { size: 0.55, tone: "hi" });
      el.pinB.innerHTML = pin(P, -GAP, ZB, 3) + pin(P, GAP, ZB, 3); el.pinL.innerHTML = pin(P, -g0.xs, g0.zm, 3); el.pinR.innerHTML = pin(P, g0.xs, g0.zm, 3);
      const crankCache = []; el.crank.setAttribute("style", STEEL);
      const s = { up: ISO.clamp(ISO.num(o, "up", 60), 0, 100) / 100 }, goal = { up: s.up };
      let lit = o.lit || "";
      const groups = { base: [el.base0, el.base], saddle: [el.saddle0, el.saddle], arms: [el.arms0, el.arms, el.pinB, el.pinL, el.pinR], screw: [el.screw, el.nut], crank: [el.crank] };
      const draw = () => {
        const gm = geo(s.up), key = s.up.toFixed(4), turn = turnsAt(s.up) * 2 * Math.PI;
        w.rebuild(el.arms0, key, () => armsSvg(P, gm, "back"));
        w.rebuild(el.arms, key, () => armsSvg(P, gm, "front"));
        const dz = gm.zm - g0.zm, dx = gm.xs - g0.xs;
        for (const e of [el.saddle0, el.saddle]) w.attr(e, "transform", K.translateAlong(P, [0, 0, 2 * dz]));
        w.attr(el.screw, "transform", K.translateAlong(P, [dx, 0, dz])); w.attr(el.nut, "transform", K.translateAlong(P, [-dx, 0, dz]));
        // the crank turns with the screw: 10° steps, each built once at the folded pose and cached
        const step = ((Math.round(turn / (Math.PI / 18)) % 36) + 36) % 36;
        w.rebuild(el.crank, String(step), () => crankCache[step] || (crankCache[step] = crankSvg(P, g0, (step * Math.PI) / 18)));
        w.attr(el.crank, "transform", K.translateAlong(P, [dx, 0, dz]));
        w.attr(el.pinL, "transform", K.translateAlong(P, [-dx, 0, dz])); w.attr(el.pinR, "transform", K.translateAlong(P, [dx, 0, dz]));
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" : [
          ISO.word(K.iso([0, 0, gm.zt + 4.2], P), "saddle", "#444", { size: 15, dy: -10 }),
          ISO.word(K.iso([-gm.xs - 2, 3, gm.zm], P), "screw", "#444", { anchor: "end", size: 15, dy: 5 }),
          ISO.word(K.iso([gm.xs + 7, 0, gm.zm - 1], P), "crank", "#444", { size: 15, dy: 18 }),
          ISO.word(K.iso([-(GAP + gm.xs) / 2, 3, (ZB + gm.zm) / 2], P), "arm", "#444", { anchor: "end", size: 15, dy: 10 }),
        ].join(""));
        const moving = s.up !== goal.up, want = lit || (moving ? "crank" : "saddle");
        const all = Object.values(groups).flat();
        w.light(all, groups[want] || []);
      };
      g.set = (p) => { if (p.up !== undefined) goal.up = ISO.clamp(+p.up, 0, 100) / 100; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // a hand cranks steadily at 8 turns a second: move the lift by whatever that many turns gives here
        if (ISO.still()) s.up = goal.up;
        else {
          const want = turnsAt(goal.up), now = turnsAt(s.up), step = 8 * dt;
          const next = Math.abs(want - now) <= step ? want : now + Math.sign(want - now) * step;
          let lo = 0, hi = 1;                     // invert turnsAt (rising in u) by bisection
          for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; turnsAt(m) < next ? (lo = m) : (hi = m); }
          s.up = Math.abs(want - next) < 1e-6 ? goal.up : (lo + hi) / 2;
        }
        draw();
        return s.up !== goal.up;
      };
      g.readout = () => {
        const gm = geo(s.up);
        return `saddle ${(gm.zt + 4.2).toFixed(1)} cm high · ${Math.round(turnsAt(s.up))} turns from folded (3 mm each) · ` +
          `holding ${LOAD} kg the screw pulls ${(pull(s.up) / 1000).toFixed(1)} kN · ${Math.round(hand(s.up))} N on the crank`;
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
