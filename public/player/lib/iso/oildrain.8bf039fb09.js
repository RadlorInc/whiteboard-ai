// "oildrain cx cy width flow=1 turns=0-8 lab=1 lit=plug" — draining the old oil, seen under the front of the car.
// A front wheel on its lower arm, the subframe beam, the bottom of the engine block and the oil sump bolted under it:
// a pressed pan with a flange of bolts and a deep well, the drain plug in a boss on its front face, with a copper
// crush washer under its hex head. A round drain pan stands on the floor. set({ turns }) loosens the plug (M14 × 1.5,
// free after 8 turns); set({ flow: 1 }) pulls it and the oil runs out of the hole in an arc into the pan; set({ refit: 1 })
// screws the plug back with a new washer. The jet follows Torricelli: it leaves at √(2gh) for the oil h above the hole,
// so it lands nearer the sump as the level falls, and 4.5 L takes about 2½ minutes warm (shown 20× faster).
// World units are centimetres.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const SUMP = { x: -32, y: -18, w: 64, d: 36, r: 3 }, WELL = { x: 0, y: -12, w: 28, d: 30, r: 3 }, FACE = WELL.y + WELL.d;
  const SUMP_Z = [18, 30], WELL_Z = 9, HOLE = [14, FACE, 11.2], PITCH = 0.15, FREE = 8;
  const PAN = { at: [14, 40], r0: 17, r1: 22, h: 12 }, FLOOR = { x: -110, y: -60, w: 200, d: 130, r: 6 };
  const OIL_L = 4.5, WELL_AREA = 28 * 30, SPEED = 20, G_CM = 981, HOLE_A = 0.6 * Math.PI * 0.6 * 0.6;
  const PLUG_REST = [44, 58, 2.3];                          // where the pulled plug is put down on the floor
  const OIL = "#c98a1a", COPPER = ISO.T.copper;
  let uid = 0;
  // oil height above the hole for the litres still in the sump (the well holds it, the hole sits 2.2 above its floor)
  const headOf = (litres) => Math.max(0, (litres * 1000) / WELL_AREA - 2.2);
  const panDepth = (litres) => (litres * 1000) / (Math.PI * 19 * 19);

  function staticSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -3, 3, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -3, 3, P, 6, 0.6), { tone: "lo" }))];
    // the front wheel standing on the floor at the back left, its lower arm reaching to the subframe
    const Fw = G.frameOf([-82, -10, 30], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.rubber, S(G.solidOf([[-10, 22], [-9.4, 27, 1], [-7, 29.6, 1], [-4, 30, 1], [4, 30, 1], [7, 29.6, 1], [9.4, 27, 1], [10, 22]], Fw, P), { tone: "hi" }) +
      K.fadedSvg(G.ribsOf(Fw, -6, 6, 30.05, 60, P, { fade: [0.1, 0.5], seams: true }), { tone: "faint" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(8, 10.2, 15, 22, Fw, P), { tone: "hi" }) + S(G.disc(6, 8.4, 15, Fw, P), { tone: "mid" }) + S(G.disc(8.4, 12, 5, Fw, P), { tone: "mid" })));
    out.push(ISO.box((u, w, y) => [u, y, w], P, [-70, -36], [24, 28], [-14, -6], "mid"));
    out.push(S(K.slabOf({ x: -60, y: -40, w: 104, d: 12, r: 1.5 }, 26, 8, P, 2, 0.5), { tone: "mid", inner: L(K.sideSeam({ x: -60, y: -40, w: 104, d: 12, r: 1.5 }, 30, P, 2), { tone: "faint" }) }));
    for (const x of [-50, 34]) out.push(S(G.disc(0, 1.6, 2.4, G.frameOf([x, -28, 30], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "lo" }));
    // pressed steel: both parts taper toward the bottom, except the well's front face, which carries the plug boss
    const frustum = (pl, z0, z1, inset, keepFront) => ISO.poly([[pl.x + inset, pl.y + inset, z0], [pl.x + pl.w - inset, pl.y + inset, z0], [pl.x + pl.w - inset, pl.y + pl.d - (keepFront ? 0 : inset), z0], [pl.x + inset, pl.y + pl.d - (keepFront ? 0 : inset), z0],
      [pl.x, pl.y, z1], [pl.x + pl.w, pl.y, z1], [pl.x + pl.w, pl.y + pl.d, z1], [pl.x, pl.y + pl.d, z1]], [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid");
    const sump = [frustum(SUMP, SUMP_Z[0], SUMP_Z[1], 3, false), frustum(WELL, WELL_Z, SUMP_Z[0] + 0.01, 2, true)];
    const ribs = [];
    for (let x = WELL.x + 5; x <= WELL.x + WELL.w - 5; x += 4) if (Math.abs(x - HOLE[0]) > 4) ribs.push(K.segment([x, FACE, WELL_Z], [x, FACE, SUMP_Z[0]], P));
    sump.push(L(ribs.join(""), { tone: "faint" }));
    const Fb = G.frameOf([HOLE[0], FACE, HOLE[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    sump.push(S(G.disc(0, 1.2, 3.4, Fb, P), { tone: "hi" }), `<path d="${G.circleOf(Fb, 1.21, 0.7, P)}" fill="#3a3324"/>`);
    out.push(`<g data-name="sump">${sump.join("")}</g>`);
    // the sump flange with its bolts, then the engine block's bottom above it, ribbed, with the oil filter on its end
    const FLANGE = K.insetPlan(SUMP, -4), BLOCK = K.insetPlan(SUMP, -1);
    out.push(S(K.slabOf(FLANGE, SUMP_Z[1], 1.2, P, 3, 0.4), { tone: "mid" }));
    const bolts = [];
    for (let x = SUMP.x + 4; x <= SUMP.x + SUMP.w - 4; x += 10) bolts.push([x, SUMP.y + SUMP.d + 2.5]);
    for (let y = SUMP.y + 6; y <= SUMP.y + SUMP.d - 4; y += 10) bolts.push([SUMP.x + SUMP.w + 2.5, y]);
    out.push(D(bolts.map(([x, y]) => K.iso([x, y, SUMP_Z[1] + 1.2], P)), { size: 0.9, tone: "mid" }));
    out.push(S(K.slabOf(BLOCK, SUMP_Z[1] + 1.2, 22, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BLOCK, SUMP_Z[1] + 12, P, 3), { tone: "faint" }) }));
    const fr = [];
    for (let x = BLOCK.x + 8; x < BLOCK.x + BLOCK.w - 6; x += 7) fr.push(K.segment([x, BLOCK.y + BLOCK.d, SUMP_Z[1] + 1.2], [x, BLOCK.y + BLOCK.d, SUMP_Z[1] + 12], P));
    out.push(L(fr.join(""), { tone: "lo" }));
    const Ff = G.frameOf([BLOCK.x + BLOCK.w, 2, SUMP_Z[1] + 12], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(S(G.disc(0, 1.4, 6.4, Ff, P), { tone: "mid" }), ISO.tinted(ISO.tint("#d7e6fb", ["#3d6fb3", "#5384c6", "#6d9ad5", "#89b0e2"], "#163a6e"),
      S(G.solidOf([[1.4, 6.6], [2.2, 7.4, 1], [12, 7.4], [13.4, 6.6, 1], [14, 5]], Ff, P), { tone: "hi" }) + K.fadedSvg(G.ribsOf(Ff, 9, 12, 7.4, 28, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" })));
    // the drain pan: a round basin with a rolled rim and a pouring lip
    const Fp = G.frameOf([PAN.at[0], PAN.at[1], 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(`<g data-name="pan">${S(G.solidOf([[0, PAN.r0], [PAN.h, PAN.r1]], Fp, P), { tone: "mid", inner: L(G.arcOf(Fp, 3, PAN.r0 + 3 * (PAN.r1 - PAN.r0) / PAN.h, P, { slope: (PAN.r1 - PAN.r0) / PAN.h }), { tone: "faint" }) })}` +
      `<path data-part="panvoid" d="${G.circleOf(Fp, PAN.h, PAN.r1 - 1, P)}" fill="#c7ccd2"/></g>`);
    if (lab) {
      out.push(ISO.word(K.iso([SUMP.x, SUMP.y + SUMP.d, SUMP_Z[0]], P), "Sump", "#555", { anchor: "end", dy: 4, size: 15 }));
      out.push(ISO.word(K.iso([PAN.at[0], PAN.at[1] + PAN.r1, 0], P), "Drain pan", "#555", { dy: 24, size: 15 }));
      out.push(ISO.word(K.iso([-82, 20, 0], P), "Front wheel", "#555", { dy: 22, size: 15 }));
      out.push(ISO.word(K.iso([HOLE[0] + 6, FACE, HOLE[2]], P), "Drain plug", "#555", { anchor: "start", dy: -14, size: 15 }));
      out.push(ISO.word(K.iso([SUMP.x + SUMP.w + 20, 2, SUMP_Z[1] + 24], P), "Oil filter", "#555", { anchor: "start", size: 15 }));
    }
    return out.join("");
  }
  // The plug: threaded shank (the part out of the boss), copper washer and hex head, turned by `a` and pulled out by `out`.
  function plugSvg(P, at, a, shown) {
    const F = G.frameOf(at, [0, 1, 0], [1, 0, 0], [0, 0, 1]), hex = Array.from({ length: 6 }, (_, i) => [Math.cos(a + i * Math.PI / 3) * 2.2, Math.sin(a + i * Math.PI / 3) * 2.2]);
    const out = [];
    if (shown > 0.01) out.push(S(G.disc(-shown, 0, 0.7, F, P), { tone: "hi", inner: L([0.3, 0.6, 0.9, 1.2].filter((s) => s < shown).map((s) => G.arcOf(F, -s, 0.7, P)).join(""), { tone: "lo" }) }));
    out.push(ISO.tinted(COPPER, S(G.ringBand(0, 0.35, 0.7, 2.6, F, P), { tone: "hi" })));
    out.push(S(G.prismOf(F, hex, 0.35, 1.9, P), { tone: "hi" }), S(G.disc(1.9, 2.3, 1.4, F, P), { tone: "hi" }));
    return `<g data-name="plug">${out.join("")}</g>`;
  }

  ISO.add({
    name: "oildrain", title: "Drain the old oil", compare: "oildrain 480 280 420 flow=1",
    about: "Under the front of the car: the sump's drain plug comes out and the old oil runs in an arc into the drain pan, which fills as the sump empties.",
    line: "oildrain cx cy width flow=0|1 turns=0-8 refit=0|1 lab=1 lit=plug|sump|pan",
    demo: { line: "oildrain 480 280 420", script: [{ set: { turns: 7 }, hold: "settle" }, { set: { flow: 1 }, hold: "settle" }, { set: { refit: 1 }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0";
      const W = size * 1.75, H = size * 1.04;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -3, 0), ...K.boxCorners(K.insetPlan(SUMP, -6), 0, SUMP_Z[1] + 23), [-82, -10, 60]], cx, cy, W, H, { azimuth: 52, elevation: 24 }, parent);
      const id = `drain-clip-${++uid}`;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="panoil"></g><g data-part="stream"></g><g data-part="plug"></g>`;
      const q = (s) => g.querySelector(`[data-part="${s}"]`), plug = q("plug"), stream = q("stream"), panoil = q("panoil"), w = ISO.writer();
      const voidD = q("panvoid").getAttribute("d");
      panoil.innerHTML = `<defs><clipPath id="${id}"><path d="${voidD}"/></clipPath></defs><g clip-path="url(#${id})"></g>`;
      const oilIn = panoil.lastElementChild;
      stream.innerHTML = `<path fill="none" stroke="${OIL}" stroke-linecap="round"/><path fill="none" stroke="#f0c46a" stroke-linecap="round" stroke-dasharray="3 7"/>`;
      const [jet, shine] = stream.children;
      // plug: turns (0..FREE), pulled (0..1 toward the floor spot); oil: litres in the sump and in the pan
      const s = { turns: 0, pulled: 0, sump: OIL_L, pan: 0, dash: 0, fresh: false };
      const want = { turns: ISO.clamp(ISO.num(o, "turns", 0), 0, FREE), pulled: 0 };
      if (o.flow === "1") { s.turns = want.turns = FREE; s.pulled = want.pulled = 1; }
      let lit = o.lit || "plug";
      const draw = () => {
        const e = ISO.ease(s.pulled), out = s.turns * PITCH;
        const base = [HOLE[0], FACE + 1.2 + out, HOLE[2]];
        const lift = Math.sin(Math.PI * Math.min(1, e * 1.4)) * 8;
        const at = base.map((v, i) => v + (PLUG_REST[i] - v) * e + (i === 2 ? lift : 0));
        w.rebuild(plug, `${s.turns.toFixed(3)} ${at.map((v) => v.toFixed(2))}`, () => plugSvg(P, at, -s.turns * Math.PI * 2, s.pulled > 0.02 ? 1.4 : Math.min(1.4, out)));
        const depth = panDepth(s.pan), F = G.frameOf([PAN.at[0], PAN.at[1], 0.6 + depth], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
        w.rebuild(oilIn, depth.toFixed(2), () => (s.pan > 0.01 ? `<path d="${G.circleOf(F, 0, PAN.r0 + (0.6 + depth) * (PAN.r1 - PAN.r0) / PAN.h, P)}" fill="${OIL}" stroke="#8a5a10" stroke-width="0.6"/>` : ""));
        // the jet: a parabola from the hole to the oil in the pan
        const flowing = s.pulled > 0.5 && s.sump > 0.02, h = headOf(s.sump);
        if (flowing) {
          const v = Math.sqrt(2 * G_CM * Math.max(h, 0.15)), zEnd = 0.6 + depth, pts = [];
          const tEnd = Math.sqrt((2 * (HOLE[2] - zEnd)) / G_CM);
          for (let i = 0; i <= 14; i++) { const tt = (tEnd * i) / 14; pts.push(K.iso([HOLE[0], FACE + 1.2 + v * tt, HOLE[2] - (G_CM * tt * tt) / 2], P)); }
          const d = K.pathOf(pts), width = (0.9 + 0.9 * Math.sqrt(Math.min(1, h / 3))) * K.cameraOf(P).k;
          w.attr(jet, "d", d); w.attr(shine, "d", d);
          w.attr(jet, "stroke-width", width.toFixed(2)); w.attr(shine, "stroke-width", (width * 0.35).toFixed(2));
          w.attr(shine, "stroke-dashoffset", (-s.dash).toFixed(1));
        }
        w.shown(stream, flowing);
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.turns !== undefined) { want.turns = ISO.clamp(+p.turns, 0, FREE); if (want.turns < FREE) want.pulled = 0; }
        if (p.flow !== undefined && +p.flow) { want.turns = FREE; want.pulled = 1; }
        if (p.refit !== undefined && +p.refit) { want.pulled = 0; want.turns = 0; s.fresh = true; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), step = dt * 2.2;
        // turn first, then pull away (or bring back first, then screw in)
        if (want.pulled < s.pulled || s.turns === want.turns) s.pulled = calm ? want.pulled : Math.abs(want.pulled - s.pulled) <= dt * 1.2 ? want.pulled : s.pulled + Math.sign(want.pulled - s.pulled) * dt * 1.2;
        if (s.pulled === 0 || (want.pulled > 0 && s.turns < FREE)) s.turns = calm ? want.turns : Math.abs(want.turns - s.turns) <= step ? want.turns : s.turns + Math.sign(want.turns - s.turns) * step;
        // Torricelli: dV/dt = −a·√(2gh), sped up 20×
        let flowing = false;
        if (s.pulled > 0.5 && s.sump > 0.02) {
          const T = calm ? 1e4 : dt * SPEED, dV = Math.min(s.sump, (HOLE_A * Math.sqrt(2 * G_CM * Math.max(headOf(s.sump), 0.15)) * T) / 1000);
          s.sump -= dV; s.pan += dV; flowing = s.sump > 0.02;
          if (!flowing) { s.pan += s.sump; s.sump = 0; }
        }
        s.dash += dt * 60;
        draw();
        return s.turns !== want.turns || s.pulled !== want.pulled || flowing;
      };
      g.readout = () => {
        if (s.pulled > 0.5 && s.sump > 0.02) {
          const h = headOf(s.sump), v = Math.sqrt(2 * G_CM * Math.max(h, 0.15)) / 100;
          return `draining · ${s.pan.toFixed(1)} of ${OIL_L} L in the pan · jet leaves at ${v.toFixed(2)} m/s (shown ${SPEED}× faster)`;
        }
        if (s.pulled > 0.5) return `sump empty · ${s.pan.toFixed(1)} L in the pan`;
        if (s.fresh && s.turns === 0) return `plug back in with a new copper washer · ${s.pan.toFixed(1)} L of old oil to recycle`;
        const tr = Math.round(s.turns * 4) / 4;
        return tr <= 0 ? "drain plug tight · 4.5 L of oil in the sump" : `${tr} of ${FREE} turns out · last turn by hand, then pull it away fast`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
