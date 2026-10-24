// "belt cx cy size rpm=0-6000 lab=1 lit=crank|ac|alt|tens|pump|ps|idler|belt" — the serpentine belt on an engine's front.
// One ribbed belt runs round seven pulleys on the timing cover: the crankshaft drives it; the air-con compressor,
// alternator, water pump and power-steering pump are driven; a smooth idler and the spring tensioner press on its back.
// Every pulley's rim moves at the belt's speed, so each turns at crank rpm × (crank radius ÷ its radius): the small
// alternator spins 2.5 times faster than the crank. set({ rpm }) runs the engine; the drawing turns the pulleys at
// a calm 1/20 of the real speed so they don't strobe. World units: 1 = 1 cm, in the plane of the cover (x across, z up).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // The loop, anticlockwise as you face it: +1 = the belt's ribbed side on the pulley, −1 = its back on the pulley.
  const PUL = [
    { id: "crank", name: "crankshaft", x: 0, z: 0, r: 8, s: 1, spokes: 6, label: [7, -7, "start", 8] },
    { id: "idler", name: "idler", x: 13, z: 11, r: 3.5, s: -1, spokes: 0, label: [17.5, 11, "start", 4] },
    { id: "ps", name: "power steering", x: 15, z: 30, r: 6.5, s: 1, spokes: 3, label: [22.5, 30, "start", 4] },
    { id: "alt", name: "alternator", x: 1, z: 40, r: 3.2, s: 1, spokes: 0, label: [1, 47.5, "middle", -4] },
    { id: "tens", name: "tensioner", x: -2, z: 27, r: 3.5, s: -1, spokes: 0, label: [3.5, 22.5, "start", 6] },
    { id: "pump", name: "water pump", x: -13, z: 22, r: 5.5, s: 1, spokes: 4, label: [-19.5, 24, "end", 4] },
    { id: "ac", name: "A/C", x: -14, z: 4, r: 6, s: 1, spokes: 5, label: [-21, 4, "end", 4] },
  ];
  const BW = 2.2, BT = 0.5, Y0 = 0, CRANK = PUL[0];
  const COVER = [[-24, -10], [10, -10], [24, 18], [24, 44], [-8, 50], [-24, 34]];
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, ALU = ISO.tint("#e3e6ea", ["#9aa1a9", "#adb3ba", "#c0c5cb", "#d1d5da"], "#4a525b");
  const yA = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  // The belt's centreline round the loop: tangent from each pulley to the next, arcs round each (signed radii).
  function loop() {
    const n = PUL.length, rs = PUL.map((p) => p.s * (p.r + BT / 2)), outs = [], ins = [];
    for (let i = 0; i < n; i++) {
      const A = PUL[i], B = PUL[(i + 1) % n], dx = B.x - A.x, dz = B.z - A.z, Lh = Math.hypot(dx, dz), phi = Math.atan2(dz, dx);
      const psi = phi + Math.acos((rs[(i + 1) % n] - rs[i]) / Lh), nx = Math.cos(psi), nz = Math.sin(psi);
      outs[i] = [A.x - rs[i] * nx, A.z - rs[i] * nz]; ins[(i + 1) % n] = [B.x - rs[(i + 1) % n] * nx, B.z - rs[(i + 1) % n] * nz];
    }
    const pts = [];
    for (let i = 0; i < n; i++) {
      const p = PUL[i], a0 = Math.atan2(ins[i][1] - p.z, ins[i][0] - p.x), a1r = Math.atan2(outs[i][1] - p.z, outs[i][0] - p.x), R = Math.abs(rs[i]);
      let a1 = a1r;
      if (p.s > 0) { while (a1 < a0) a1 += 2 * Math.PI; } else { while (a1 > a0) a1 -= 2 * Math.PI; }
      const k = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.12));
      for (let j = 0; j <= k; j++) { const a = a0 + ((a1 - a0) * j) / k; pts.push([p.x + Math.cos(a) * R, p.z + Math.sin(a) * R]); }
      p.wrap = Math.abs(a1 - a0);
    }
    return pts;
  }
  const PATH = loop();
  const LEN = PATH.reduce((s, p, i) => s + Math.hypot(PATH[(i + 1) % PATH.length][0] - p[0], PATH[(i + 1) % PATH.length][1] - p[1]), 0);

  function staticSvg(P) {
    const out = [ISO.prismY(P, COVER, -7, -4, ["#8d9096", "#c7c9cd"], "#d4d6d9", "#3c3f45")];
    // cover bolts round its edge, and the accessories' bodies behind their pulleys
    const bolts = [[-21, -7], [7, -7], [21, 18], [21, 41], [-8, 47], [-21, 32], [-21, 14]];
    out.push(D(bolts.map(([x, z]) => K.iso([x, -4, z], P)), { size: 0.7, tone: "mid" }));
    const body = { ac: [6.4, -4, -1.2], alt: [5.4, -4, -1.2], ps: [5.6, -4, -1.2], pump: [4.6, -4, -1.2] };
    for (const p of PUL) {
      const F = yA(p.x, 0, p.z), b = body[p.id];
      if (b) out.push(ISO.tinted(ALU, S(G.disc(b[1], b[2], b[0], F, P), { tone: "mid", inner: p.id === "alt" ? L([-3.4, -2.6].map((s) => G.arcOf(F, s, b[0], P)).join(""), { tone: "faint" }) : "" })));
      // each pulley's shaft boss and the pulley itself: grooved rim for the ribbed side, flanged and smooth for the back
      out.push(S(G.disc(-1.2, 0, Math.min(2.4, p.r * 0.5), F, P), { tone: "mid" }));
      const rim = p.s > 0 ? L([0.5, 0.9, 1.3, 1.7].map((s) => G.arcOf(F, s, p.r, P)).join(""), { tone: "lo" }) : "";
      out.push(`<g data-name="${p.id}">` + ISO.tinted(STEEL, S(G.disc(0, BW, p.r, F, P), { tone: "hi", inner: rim })) + "</g>");
    }
    // the tensioner's arm from its pivot to the idler, the spring case along it
    const T = PUL[4], piv = [-9, 34];
    const dx = T.x - piv[0], dz = T.z - piv[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
    out.push(ISO.box((u, w, y) => [piv[0] + ux * u - uz * w, y, piv[1] + uz * u + ux * w], P, [-1.6, l + 1.6], [-1.3, 1.3], [-1.6, -0.3], "mid"));
    out.push(ISO.box((u, w, y) => [piv[0] + uz * u, y, piv[1] - ux * u + w], P, [2, 9], [-1.2, 1.2], [-3.6, -1.6], "mid"));
    out.push(S(G.disc(-1.2, 0.6, 2.2, yA(piv[0], 0, piv[1]), P), { tone: "mid" }), D([K.iso([piv[0], 0.6, piv[1]], P)], { size: 0.7, tone: "hi" }));
    return out.join("");
  }
  // What turns on each pulley's face at angle a: spokes, holes, the centre bolt.
  function faceSvg(P, p, a) {
    const F = yA(p.x, 0, p.z), out = [];
    if (p.spokes) {
      const holes = Array.from({ length: p.spokes }, (_, k) => { const c = G.pointOf(F, BW, p.r * 0.58, a + (k * 2 * Math.PI) / p.spokes); return `<path d="${G.circleOf(yA(c[0], c[1], c[2]), 0, p.r * 0.2, P)}" fill="#3a3e44" stroke="#1b1d20" stroke-width="0.4"/>`; });
      out.push(holes.join(""));
    } else out.push(L(G.circleOf(F, BW + 0.3, p.r * 0.6, P), { tone: "faint" }));
    const hex = Array.from({ length: 6 }, (_, i) => [Math.cos(a + (i * Math.PI) / 3) * Math.min(1.3, p.r * 0.3), Math.sin(a + (i * Math.PI) / 3) * Math.min(1.3, p.r * 0.3)]);
    out.push(ISO.tinted(STEEL, (p.s < 0 ? S(G.disc(BW, BW + 0.3, p.r + 0.4, F, P), { tone: "hi" }) : "") + S(G.prismOf(F, hex, BW, BW + 0.8, P), { tone: "mid" })));
    return out.join("");
  }
  function beltSvg(P) {
    const n = PATH.length, outer = [], inner = [];
    for (let i = 0; i < n; i++) {
      const a = PATH[(i - 1 + n) % n], b = PATH[(i + 1) % n], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz), nx = -tz / l, nz = tx / l;
      outer.push([PATH[i][0] - nx * BT / 2, PATH[i][1] - nz * BT / 2]); inner.push([PATH[i][0] + nx * BT / 2, PATH[i][1] + nz * BT / 2]);
    }
    const ring = [...outer, outer[0], inner[0], ...inner.slice().reverse()];
    return ISO.tinted(RUBBER, ISO.prismY(P, ring, Y0 + 0.05, Y0 + BW - 0.05, ["#1c1d20", "#4e5055"], "#3a3c40", "#0f1012"));
  }

  ISO.add({
    name: "belt", title: "Serpentine belt", compare: "belt 480 270 380",
    about: "One ribbed belt round the crankshaft and six pulleys: each turns faster the smaller it is, so the alternator spins 2.5 times faster than the crank.",
    line: "belt cx cy size rpm=0-6000 lab=1 lit=crank|ac|alt|tens|pump|ps|idler|belt",
    demo: { line: "belt 480 270 380 rpm=0", script: [{ set: {}, hold: 0.8 }, { set: { rpm: 800 }, hold: 3 }, { set: { rpm: 2400 }, hold: 3 }, { set: { rpm: 0 }, hold: "settle" }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.3;
      const { P, g } = ISO.frame([...COVER.flatMap(([x, z]) => [[x, -7, z], [x, BW + 1, z]]), [-30, 0, 4], [30, 0, 30], [0, 0, -15]], cx, cy, W, H, { azimuth: 72, elevation: 16 }, parent);
      g.innerHTML = `<g>${staticSvg(P)}</g><g data-name="belt">${beltSvg(P)}<path data-part="ribs" fill="none" stroke="#8c8f95" stroke-width="0.7" stroke-dasharray="0.8 3.2"/></g>` +
        PUL.map((p) => `<g data-face="${p.id}"></g>`).join("") + `<g data-part="words"></g>`;
      const ribs = g.querySelector('[data-part="ribs"]'), words = g.querySelector('[data-part="words"]'), w = ISO.writer();
      // ribs on the belt's back edge: a dashed line along the front face's middle, moved by the belt's travel
      ribs.setAttribute("d", K.pathOf([...PATH, PATH[0]].map(([x, z]) => K.iso([x, Y0 + BW - 0.05, z], P))));
      const faces = Object.fromEntries(PUL.map((p) => [p.id, g.querySelector(`[data-face="${p.id}"]`)]));
      const named = [...g.querySelectorAll("[data-name]")];
      const s = { rpm: ISO.clamp(ISO.num(o, "rpm", 800), 0, 6000), turn: 0, travel: 0 }, goal = { rpm: s.rpm };
      let lit = o.lit || "";
      const cache = {};
      const draw = () => {
        for (const p of PUL) {
          const a = (-p.s * s.turn * CRANK.r) / p.r, sym = p.spokes ? (2 * Math.PI) / p.spokes : Math.PI / 3, k = Math.round(((a % sym) + sym) % sym / 0.05);
          w.rebuild(faces[p.id], String(k), () => (cache[p.id + k] ||= faceSvg(P, p, k * 0.05)));
        }
        w.attr(ribs, "stroke-dashoffset", (-(s.travel % 4) * 1).toFixed(2));
        w.rebuild(words, lab ? "1" : "", () => !lab ? "" : PUL.map((p) => ISO.word(K.iso([p.label[0], BW, p.label[1]], P), p.name, "#444", { anchor: p.label[2], size: 14, dy: p.label[3] })).join(""));
        w.light(named, named.filter((n) => n.dataset.name === lit));
      };
      g.set = (p) => { if (p.rpm !== undefined) goal.rpm = ISO.clamp(+p.rpm, 0, 6000); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        s.rpm = ISO.follow(s.rpm, goal.rpm, dt, 0.5, ISO.still());
        if (Math.abs(s.rpm - goal.rpm) < 1) s.rpm = goal.rpm;
        const w20 = (s.rpm / 60) * 2 * Math.PI / 20;          // the drawing turns at 1/20 speed
        s.turn += w20 * dt; s.travel += w20 * CRANK.r * dt * 0.6;
        draw();
        return s.rpm !== goal.rpm || s.rpm > 0;
      };
      g.readout = () => {
        const v = (s.rpm / 60) * 2 * Math.PI * (CRANK.r / 100);
        if (s.rpm < 1) return `engine off · one belt, ${Math.round(LEN)} cm long, round seven pulleys`;
        const r = (id) => Math.round((s.rpm * CRANK.r) / PUL.find((p) => p.id === id).r);
        return `crankshaft ${Math.round(s.rpm)} rpm · belt ${v.toFixed(1)} m/s · alternator ${r("alt")} · A/C ${r("ac")} · water pump ${r("pump")} · power steering ${r("ps")} rpm`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
