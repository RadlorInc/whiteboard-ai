// "dam cx cy width level=0..1 gate=0..1 forces=1 lab=1" — a concrete gravity dam as a museum cut-away model.
// The walnut plinth carries a valley block cut through one spillway bay: the reservoir against the dam's vertical
// upstream face, the dam in section (inspection gallery, drain, grout curtain under the heel) standing on rock, the
// ogee spillway crest with a radial gate on its trunnion pier, the stilling basin with baffle blocks and an end sill,
// and the river below. forces=1 draws the water's push on the upstream face as arrows that grow with depth (p = ρgh,
// a triangle), the dam's weight and the rock's push back. Raise the level and the triangle grows; open the gate and
// water pours over the ogee into the basin. World units: 1 m. Bay width 15 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S, D = M.D;
  const Y0 = -50, CUT = 0, CREST = 40, TW = -2, BAY = 15;
  const PLINTH = { x: -136, y: -58, w: 272, d: 80, r: 4 };
  const lvlZ = (lv) => 12 + 36 * lv;                              // level 0..1 → 12..48 m
  // the ogee: z = 40 − 0.05 (x + 30)^1.85 from the crest until the slope reaches 1.25, then straight, then the toe
  const OGEE = [];
  for (let i = 0; i <= 10; i++) { const u = (i / 10) * 21.4; OGEE.push([-30 + u, CREST - 0.05 * Math.pow(u, 1.85)]); }
  OGEE.push([13.4, -2], [18, -8], [24, -10]);
  const HEAD = [[-40, 38], [-38, 39.6], [-34, 40.3], [-30, CREST]];
  const DAM = [[-40, -10], ...OGEE.slice().reverse(), ...HEAD.slice(0, 3).reverse()];
  const ROCK = [[-130, -26], [130, -26], [130, -8], [64, -8], [64, -6], [60, -6], [60, -10], [-40, -10], [-40, -6], [-130, -6]];
  const T = [-14, 42], R = 16.1, A0 = Math.atan2(CREST - T[1], -30 - T[0]), A1 = A0 - (37 * Math.PI) / 180;
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;

  function staticBack(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, -26])}">${M.plinth(P, PLINTH)}</g>`];   // the plinth's top meets the block's floor
    const RIDGE = [[-130, -6], [130, -6], [130, 14], [90, 18], [40, 30], [0, 52], [-40, 60], [-90, 62], [-130, 58]];
    out.push(M.sec(P, RIDGE, Y0, Y0 + 5, "grass"), M.tree(P, -104, Y0 + 2.5, 61.6, 1.1), M.tree(P, -70, Y0 + 2.5, 61, 1), M.tree(P, 96, Y0 + 2.5, 17, 0.9), M.tree(P, 64, Y0 + 2.5, 24, 1));
    out.push(M.sec(P, ROCK, Y0, CUT, "rock", M.grains(P, ROCK, CUT, 60, "#8d939a", 0.7, 5)));
    // grout curtain under the heel: a fan of grouted holes, cut as a row of dots
    out.push(D([...Array(4)].map((_, i) => K.iso([-36, CUT + 0.1, -12.5 - i * 3.4], P)), { size: 0.6, tone: "mid" }));
    return out.join("");
  }
  // the dam goes after the water: its faces against the reservoir and the basin hide the water's inner faces
  function damSvg(P) {
    const out = [];
    out.push(M.named("dam", M.sec(P, DAM, Y0, CUT, "concrete") +
      // the inspection gallery near the heel and its drain hole down to the rock
      face(P, M.rect(-34, -29, -4, 1.5), "#6b6a64", "#3c3c38") + face(P, M.rect(-31.9, -31.1, -10, -4), "#8f8d86", "#5f5f5c", 0.5)));
    // stilling basin: baffle blocks and the end sill, in section
    // the back pier of the bay with the trunnion, and the road bridge over the piers
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [-40, -6], [Y0 + 4, Y0 + 10], [CREST, 54], "mid")));
    return out.join("");
  }
  function bridgeSvg(P) {
    const out = [ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [-44, -2], [Y0 + 4, CUT], [54, 56.4], "mid"))];
    for (let x = -42; x <= -4; x += 6) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 0.3, x + 0.3], [-1.6, -1], [56.4, 59], "hi")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-42.3, -3.7], [-1.6, -1], [59, 59.6], "hi")));
    // the gate hoist on the deck, with its rope drum
    out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [-30, -22], [Y0 + 12, Y0 + 22], [56.4, 61], "mid")), ISO.tinted(ISO.T.steel, S(G.disc(0, 8, 1.6, M.Y([-24, Y0 + 22, 59]), P, { steps: 16 }), { tone: "hi" })));
    return out.join("");
  }
  // the radial gate: a curved skin plate across the bay, opened by turning about its trunnion
  const GATE = new Map();
  function gateSvg(P, phi) {
    const arc = (r, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = A0 - phi + ((A1 - A0) * i) / n; return [T[0] + Math.cos(a) * r, T[1] + Math.sin(a) * r]; });
    const plate = [...arc(R), ...arc(R + 0.9).reverse()];
    const out = [ISO.prismY(P, plate, Y0 + 10, CUT - 0.4, ["#8d9096", "#d0d2d6"], "#dcdee1", "#3c3f45")];
    const ends = [arc(R)[0], arc(R)[12]], k = K.cameraOf(P).k, tp = K.iso([T[0], CUT - 0.2, T[1]], P);
    out.push(`<path d="${ends.map((e) => K.pathOf([tp, K.iso([e[0], CUT - 0.2, e[1]], P)])).join("")}" fill="none" stroke="#3c3f45" stroke-width="${(1.3 * k).toFixed(2)}" stroke-linecap="round"/>`);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-1.6, 0, 1.2, M.Y([T[0], CUT, T[1]]), P, { steps: 16 }), { tone: "hi" })));
    // the hoist rope from the drum to the gate's top
    const top = arc(R + 0.9)[12];
    out.push(`<path d="${K.pathOf([K.iso([-24, Y0 + 22, 57.4], P), K.iso([top[0], -20, top[1]], P)])}" fill="none" stroke="#2f343a" stroke-width="${(0.4 * k).toFixed(2)}"/>`);
    return M.named("gate", out.join(""));
  }
  // where the bottom seal is, so the opening under the gate is known
  const sealZ = (phi) => T[1] + Math.sin(A0 - phi) * R;

  ISO.add({
    name: "dam", title: "Gravity dam", compare: "dam 480 270 500",
    about: "A cut-away model of a concrete gravity dam: the water's push grows with depth; open the radial gate and water pours down the spillway into the stilling basin.",
    line: "dam cx cy width level=0..1 gate=0..1 forces=1 lab=1 lit=dam|gate|reservoir|spillway|basin",
    demo: { line: "dam 480 275 560 level=0.2 gate=0", script: [{ set: { level: 1 }, hold: 4 }, { set: { gate: 1 }, hold: 6 }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.1, H = size * 0.66;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -39, -26), [-130, Y0, 62], [130, CUT, 62], [-20, CUT, 62]], cx, cy, W, H, { azimuth: 64, elevation: 27 }, parent);
      g.innerHTML = `<g>${staticBack(P)}</g><g data-part="water"></g><g>${damSvg(P)}</g><g data-part="gate"></g><g>${bridgeSvg(P)}</g><g data-part="spill"></g><g data-part="flow"></g><g data-part="forces"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      GATE.clear();
      const s = { lv: ISO.clamp(ISO.num(o, "level", 0.8), 0, 1), gate: ISO.clamp(ISO.num(o, "gate", 0), 0, 1), q: 0, ph: 0 };
      const want = { lv: s.lv, gate: s.gate };
      const forces = o.forces !== "0";
      let lit = o.lit || "";
      const phiOf = (gt) => gt * (30 * Math.PI) / 180;
      // spill per bay: under the gate it is an orifice, Cd a b √(2g(H − a/2)); with the gate high it is a weir
      const spill = () => {
        const H = lvlZ(s.lv) - CREST; if (H <= 0) return 0;
        const a = Math.max(0, sealZ(phiOf(s.gate)) - CREST);
        return a >= H ? 2.1 * BAY * Math.pow(H, 1.5) : 0.7 * BAY * a * Math.sqrt(2 * 9.81 * (H - a / 2));
      };
      const draw = () => {
        const L = lvlZ(s.lv);
        w.rebuild(el.water, L.toFixed(1), () => {
          const res = L > 40.5 ? [[-130, -6], [-40, -6], ...HEAD, [-30, L], [-130, L]] : [[-130, -6], [-40, -6], [-40, L], [-130, L]];
          return M.named("reservoir", M.sec(P, res, Y0, CUT, "water", M.grains(P, [[-130, -6], [-40, -6], [-40, -3.5], [-130, -3.5]], CUT, 24, "#6b5a3a", 0.6, 9))) +
            M.named("basin", M.sec(P, [[24, -10], [60, -10], [60, -6], [64, -6], [64, -8], [130, -8], [130, TW], [13.4, TW], [18, -8]], Y0, CUT, "water")) +
            // baffle blocks on the basin floor, cut through
            face(P, M.rect(38, 41, -10, -7), "#e6e4de", "#5f5f5c") + face(P, M.rect(48, 51, -10, -7), "#e6e4de", "#5f5f5c");
        });
        const gk = Math.round(s.gate * 40);
        w.rebuild(el.gate, gk, () => { if (!GATE.has(gk)) GATE.set(gk, gateSvg(P, phiOf(gk / 40))); return GATE.get(gk); });
        // the nappe: a sheet of water on the spillway face, as thick as the flow per metre allows
        const q = s.q, qk = q > 0.5 ? Math.round(q / 20) : 0;
        w.rebuild(el.spill, qk, () => {
          if (!qk) return "";
          const th = Math.min(4, 0.25 + Math.pow(qk * 20 / BAY, 0.6) * 0.45), top = [], bot = [];
          OGEE.forEach(([x, z], i) => { const nx = i ? OGEE[i][1] - OGEE[i - 1][1] : 0, nz = i ? -(OGEE[i][0] - OGEE[i - 1][0]) : -1, l = Math.hypot(nx, nz) || 1; bot.push([x, z]); top.push([x - (nx / l) * th, z - (nz / l) * th]); });
          return M.named("spillway", face(P, [...top, ...bot.reverse()], "#a9cff0", "#2f6fae", 0.7));
        });
        const fk = q > 0.5 ? `${(Math.round(s.ph * 2) / 2 % 14).toFixed(1)} ${qk}` : "";
        w.rebuild(el.flow, fk, () => fk && (M.flow(P, [[-110, CUT + 0.2, L - 4], [-34, CUT + 0.2, CREST + 2], ...OGEE.map(([x, z]) => [x, CUT + 0.3, z + 1]), [44, CUT + 0.3, -4], [126, CUT + 0.3, -4]], s.ph, { amount: Math.min(1, q / 200), color: "#1f4f8f" }) +
          M.flow(P, [[28, CUT + 0.3, -7], [36, CUT + 0.3, -3], [44, CUT + 0.3, -6], [52, CUT + 0.3, -3.4], [60, CUT + 0.3, -5]], s.ph * 1.4, { amount: Math.min(1, q / 200), color: "#fdfdfb", gap: 6, dash: 3 })));
        // the water's push: p = ρ g (L − z) on the upstream face, drawn 1 unit per 20 kPa; weight and the rock's push
        w.rebuild(el.forces, forces ? L.toFixed(1) : "", () => {
          if (!forces) return "";
          const sc = 1 / 20, out = [], y = CUT + 0.4, pz = (z) => (9.81 * (L - z)) * sc;
          out.push(face(P, [[-40, L], [-40, -6], [-40 - pz(-6), -6]], "rgba(192,57,43,.14)", "#c0392b", 0.6, y - 0.1));
          for (let z = L - 6; z > -5; z -= 6) out.push(M.arrow(P, [-40 - pz(z), y, z], [-40.4, y, z], { w: 1.2, head: 3 }));
          out.push(M.arrow(P, [-14, y, 22], [-14, y, 4], { color: "#33506f", w: 2.2, head: 4 }));
          const xr = -14 + (0.5 * 9.81 * (L + 6) ** 2) / 1000 * 0.6;              // the resultant moves toward the toe as the push grows
          out.push(M.arrow(P, [xr, y, -22], [xr, y, -11], { color: "#2c6a22", w: 2.2, head: 4 }));
          return out.join("");
        });
        w.rebuild(el.words, lab ? `${L.toFixed(0)} ${forces}` : "", () => !lab ? "" : [
          M.label(P, [-96, CUT, L + 3], "reservoir", "#1f4f8f"), M.label(P, [-18, CUT, 66], "radial gate"), M.label(P, [-6, CUT, 10], "dam", "#444", { anchor: "start" }),
          M.label(P, [44, CUT, -14], "stilling basin", "#1f4f8f", { dy: 14 }), M.label(P, [100, CUT, TW], "river", "#1f4f8f", { dy: -6 }),
          forces ? M.label(P, [-66, CUT, -6], "water pushes harder deeper", "#a3271b", { dy: 16 }) + M.label(P, [-14, CUT, 24], "weight", "#33506f", { dy: -2 }) : ""].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.level !== undefined) want.lv = ISO.clamp(+p.level, 0, 1);
        if (p.gate !== undefined) want.gate = ISO.clamp(+p.gate, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.lv = ISO.follow(s.lv, want.lv, dt, 0.7, calm); if (Math.abs(s.lv - want.lv) < 2e-3) s.lv = want.lv;
        s.gate = calm ? want.gate : s.gate + Math.sign(want.gate - s.gate) * Math.min(Math.abs(want.gate - s.gate), dt * 0.4);
        const Q = spill();
        s.q = ISO.follow(s.q, Q, dt, 0.6, calm); if (Math.abs(s.q - Q) < 0.3) s.q = Q;
        if (!calm) s.ph += dt * 24 * Math.min(1, s.q / 120);
        draw();
        return s.q > 0.5 || s.lv !== want.lv || s.gate !== want.gate;
      };
      g.readout = () => {
        const L = lvlZ(s.lv), h = L + 6, p = 9.81 * h, F = (0.5 * 1000 * 9.81 * h * h) / 1e6;
        return `water ${h.toFixed(0)} m deep at the heel · pressure there ρgh = ${p.toFixed(0)} kPa · push on the dam ½ρgh² = ${F.toFixed(1)} MN per metre of dam · spill ${s.q.toFixed(0)} m³/s through one ${BAY} m bay`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
