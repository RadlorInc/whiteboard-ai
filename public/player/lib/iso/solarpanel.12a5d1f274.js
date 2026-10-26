// "solarpanel cx cy width sun=0-90 tilt=0-70 lab=1 lit=cells|frame|strut|inverter|sun" — a solar panel on a pole.
// A 400 W panel (60 silicon cells behind glass in an aluminium frame, silver busbars across each cell) on two rails
// and a torque tube, pivoting on a steel pole set in a concrete foot. A telescoping strut sets its tilt. The cable
// from the panel runs down to the inverter on the pole, whose screen shows the watts going out. Sunlight makes each
// cell push electrons (about 0.55 V a cell, 60 in series ≈ 33 V); the power follows how square-on the light hits:
// about 400 W × cos(angle off square). Tilt the panel to face the sun and the watts climb. set({ sun, tilt, lit }).
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // PV is the pivot; the pole, clamp, yoke and strut ends meet each other round it (audit.mjs reports those joins as sunk)
  const PV = [0, 0, 132], HA = 50, HB = 86, GROUND = { x: -90, y: -96, w: 180, d: 192, r: 4 }, SUN_D = 150;
  const rad = (d) => (d * Math.PI) / 180, zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const ALU = ISO.tint("#e4e6e9", ["#9ea3aa", "#afb3b9", "#c0c3c8", "#cfd2d6"], "#4a4f56"), CELL = "#1f3c78", CELL_HI = "#2c5aa8";
  // the panel's own axes at tilt t: u up the slope (toward +x), y along the rails' cross direction, n out of the glass
  const axes = (t) => ({ u: [Math.cos(rad(t)), 0, Math.sin(rad(t))], n: [-Math.sin(rad(t)), 0, Math.cos(rad(t))] });
  const onPanel = (t, a, b, c) => { const { u, n } = axes(t); return [PV[0] + a * u[0] + c * n[0], PV[1] + b, PV[2] + a * u[2] + c * n[2]]; };
  const cosOff = (sun, tilt) => Math.max(0, Math.sin(rad(sun + tilt)));
  const sunAt = (e) => [PV[0] - SUN_D * Math.cos(rad(e)), PV[1] - 30, PV[2] + SUN_D * Math.sin(rad(e)) - 20];
  const STRUT_A = 34, CLAMP_Z = 72;

  function standSvg(P) {
    const out = [ISO.tinted(ISO.tint("#e3e6d8", ["#b5b9a6", "#c0c4b1", "#cbcfbd", "#d6d9c9"], "#5f6352"), S(K.slabOf(GROUND, -6, 6, P, 4), { tone: "lo", halo: true }))];
    out.push(ISO.tinted(ISO.T.road, S(K.cylinder(0, 0, 24, 0, 8, P, 40, 1), { tone: "lo" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(8, 10, 12, zAx([0, 0, 0]), P, { steps: 32 }), { tone: "mid" })));
    for (const a of [45, 135, 225, 315].map(rad)) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(9 * Math.cos(a), 9 * Math.sin(a), 1.4, 10, 1.6, P, 10), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 5, 10, PV[2] - 16, P, 28), { tone: "mid" })));
    // the strut's clamp on the pole
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 6.6, CLAMP_Z - 4, 8, P, 28), { tone: "mid" })));
    // the pivot head: a yoke on the pole top carrying the torque tube's bearings
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-7, 7], [-12, 12], [PV[2] - 6 - 10, PV[2] - 6], "mid")));
    for (const y of [-12, 9]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-5, 5], [y, y + 3], [PV[2] - 6, PV[2] + 4], "mid")));
    return out.join("");
  }
  // the inverter on the pole's near side: a box with cooling fins on top, its screen and two cable glands below
  function inverterSvg(P, watts) {
    const out = [ISO.tinted(ISO.T.paint, ISO.wbox(P, [-15, 15], [5, 21], [34, 70], "mid"))];
    for (let x = -12; x <= 12; x += 4) out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [x - 0.8, x + 0.8], [6, 20], [70, 74], "mid")));
    for (const x of [-7, 7]) out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, 13, 2.2, 30, 4, P, 14), { tone: "mid" })));
    const face = (pts, fill, ink) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 21.05, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width=".6"/>`;
    out.push(face([[-10, 52], [10, 52], [10, 64], [-10, 64]], "#c9dcc0", "#223"));
    const sx = K.iso([1, 21.1, 55], P)[0] > K.iso([0, 21.1, 55], P)[0] ? 1 : -1;           // read left to right from this side
    out.push(`<g transform="${ISO.faceMatrix(P, [0, 21.1, 55], 1).replace(/matrix\(([^ ]+) ([^ ]+)/, (m, x, y) => `matrix(${x * sx} ${y * sx}`)}"><text font-size="7" font-weight="700" fill="#1d2a1a" text-anchor="middle" font-family="Helvetica Neue,Arial">${Math.round(watts)} W</text></g>`);
    out.push(ISO.tinted(ISO.T.green, S(G.disc(21, 22, 1.6, yAx([-8, 0, 44]), P, { steps: 14 }), { tone: "hi" })));
    return out.join("");
  }
  // torque tube, rails, cross bar, the panel itself; one group, rebuilt when the tilt changes
  function panelSvg(P, t, glow) {
    const out = [], at = (a, b, c) => onPanel(t, a, b, c);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-HB + 10, HB - 10, 3.6, yAx(PV), P, { steps: 24 }), { tone: "mid" })));
    out.push(ISO.tinted(ALU, ISO.box((a, b, c) => at(a, b, c), P, [STRUT_A - 3, STRUT_A + 3], [-HB + 12, HB - 12], [-6, -2], "mid")));
    for (const b of [-52, 46]) out.push(ISO.tinted(ALU, ISO.box((a, w, c) => at(a, w, c), P, [-HA + 4, HA - 4], [b, b + 6], [-2, 3.6], "mid")));
    // the frame: four extrusions round the glass, 4 cm deep
    const fr = (a0, a1, b0, b1) => ISO.tinted(ALU, ISO.box((a, b, c) => at(a, b, c), P, [a0, a1], [b0, b1], [3.6, 7.6], "hi"));
    out.push(`<g data-name="frame">${fr(-HA, HA, -HB, -HB + 3)}${fr(HA - 3, HA, -HB, HB)}${fr(-HA, -HA + 3, -HB, HB)}${fr(-HA, HA, HB - 3, HB)}</g>`);
    // the cells: 6 up the slope × 10 across, each with three busbars, glass over them
    const flat = (pts, fill, ink, w = 0.4) => `<path d="${K.pathOf(pts.map(([a, b]) => K.iso(at(a, b, 6.8), P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"/>`;
    const cells = [], bars = [], ca = (2 * HA - 6) / 6, cb = (2 * HB - 6) / 10;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 10; j++) {
      const a0 = -HA + 3 + i * ca + 0.5, b0 = -HB + 3 + j * cb + 0.5, a1 = a0 + ca - 1, b1 = b0 + cb - 1;
      cells.push(K.pathOf([[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([a, b]) => K.iso(at(a, b, 6.8), P)), true));
      for (let k = 1; k <= 3; k++) { const b = b0 + ((b1 - b0) * k) / 4; bars.push(K.pathOf([K.iso(at(a0, b, 6.82), P), K.iso(at(a1, b, 6.82), P)])); }
    }
    out.push(flat([[-HA + 3, -HB + 3], [HA - 3, -HB + 3], [HA - 3, HB - 3], [-HA + 3, HB - 3]], "#e8edf3", "#4a4f56", 0.6));
    out.push(`<g data-name="cells"><path d="${cells.join("")}" fill="${glow > 0.6 ? CELL_HI : CELL}" stroke="#14264d" stroke-width=".4"/><path d="${bars.join("")}" stroke="#c7ccd4" stroke-width=".6"/></g>`);
    // sunlight on the glass: a pale sheen that grows as the light hits it more square-on
    if (glow > 0.02) out.push(`<path d="${K.pathOf([[-HA + 3, -HB + 3], [HA - 3, -HB + 3], [HA - 3, HB - 3], [-HA + 3, HB - 3]].map(([a, b]) => K.iso(at(a, b, 6.9), P)), true)}" fill="#fff6d8" opacity="${(0.28 * glow).toFixed(2)}"/>`);
    return out.join("");
  }
  function strutSvg(P, t) {
    const S0 = [-6, 0, CLAMP_Z], E = onPanel(t, STRUT_A, 0, -6), d = G.sub3(E, S0), len = G.len3(d), F = G.frameAlong(S0, d);
    return ISO.tinted(ISO.T.steel, S(G.disc(0, len * 0.58, 2.4, F, P, { steps: 16 }), { tone: "mid" }) + S(G.disc(len * 0.58, len, 1.6, F, P, { steps: 14 }), { tone: "mid" }) + S(G.disc(len * 0.5, len * 0.58, 3, F, P, { steps: 16 }), { tone: "mid" }));
  }
  function cableSvg(P, t, k) {
    const a = onPanel(t, -HA + 6, 30, 0), pts = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, v = 1 - u; pts.push([0, 1, 2].map((j) => v * v * a[j] + 2 * v * u * [a[0] + 4, 18, a[2] - 30][j] + u * u * [0, 16, 74][j])); }
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#0d0e10" stroke-width="${(2 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#3a3e44" stroke-width="${(1.2 * k).toFixed(2)}" stroke-linecap="round"/>`;
  }
  function sunSvg(P, e, k) {
    const p = K.iso(sunAt(e), P), r = 12 * k;
    return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r * 2.4).toFixed(1)}" fill="#ffe7a0" opacity=".35"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}" fill="#ffd34a" stroke="#c98a10" stroke-width=".8"/>`;
  }

  ISO.add({
    name: "solarpanel", title: "Solar panel", compare: "solarpanel 480 270 480",
    about: "A 400 W solar panel on a tilting pole mount: its 60 silicon cells turn sunlight into current, and the inverter's watts climb as the panel is tilted to face the sun.",
    line: "solarpanel cx cy width sun=0-90 tilt=0-70 lab=1 lit=cells|frame|strut|inverter|sun",
    demo: { line: "solarpanel 480 270 480 sun=50 tilt=8", script: [{ set: {}, hold: 1.2 }, { set: { tilt: 40 }, hold: "settle" }, { set: { sun: 22 }, hold: "settle" }, { set: { tilt: 66 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.98;
      const { P, g } = ISO.frame([...K.boxCorners(GROUND, -6, 0), [0, HB, PV[2] + 52], [0, -HB, PV[2] + 52], [-60, HB, PV[2] - 40], sunAt(12), sunAt(80)], cx, cy, W, H, { azimuth: -38, elevation: 22 }, parent);
      const k = K.cameraOf(P).k;
      g.innerHTML = `<g data-name="sun"></g><g>${standSvg(P)}</g><g data-name="inverter"></g><g data-part="cable"></g><g data-name="strut"></g><g data-part="panel"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { sun: q("sun"), inv: q("inverter"), cable: q("cable"), strut: q("strut"), panel: q("panel"), words: q("words") }, w = ISO.writer();
      const s = { sun: ISO.clamp(ISO.num(o, "sun", 50), 0, 90), tilt: ISO.clamp(ISO.num(o, "tilt", 25), 0, 70) }, goal = { ...s };
      let lit = o.lit || "";
      const watts = () => 400 * cosOff(s.sun, s.tilt);
      const draw = () => {
        const tq = Math.round(s.tilt), eq = Math.round(s.sun), c = cosOff(eq, tq);
        w.rebuild(el.sun, String(eq), () => sunSvg(P, eq, k));
        w.rebuild(el.panel, `${tq} ${Math.round(c * 20)}`, () => panelSvg(P, tq, c));
        w.rebuild(el.strut, String(tq), () => strutSvg(P, tq));
        w.rebuild(el.cable, String(tq), () => cableSvg(P, tq, k));
        w.rebuild(el.inv, String(Math.round(400 * c)), () => inverterSvg(P, 400 * c));
        const off = Math.round(Math.abs(90 - eq - tq));
        w.rebuild(el.words, lab ? `${eq} ${tq}` : "", () => !lab ? "" : [
          ISO.word(K.iso(sunAt(eq), P), `sun ${Math.round(eq)}° up`, "#8a5a10", { size: 13, dy: -22 * k - 6 }),
          ISO.word(K.iso(onPanel(tq, HA, -HB, 8), P), `light ${off}° off square`, "#1f4f8f", { size: 13, anchor: "start", dy: -8 }),
          ISO.word(K.iso([-15, 21, 40], P), "inverter", "#444", { size: 13, anchor: "end", dy: 6 }),
          ISO.word(K.iso(onPanel(tq, -HA, HB, 4), P), "60 silicon cells", "#1f3c78", { size: 13, anchor: "end", dy: 16 }),
          ISO.word(K.iso(G.lerp3([-6, 0, CLAMP_Z], onPanel(tq, STRUT_A, 0, -6), 0.5), P), "tilt strut", "#444", { size: 12, anchor: "start", dy: 4 }).replace('x="', 'dx="8" x="')].join(""));
        w.light(["cells", "frame", "strut", "inverter", "sun"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.sun !== undefined) goal.sun = ISO.clamp(+p.sun, 0, 90);
        if (p.tilt !== undefined) goal.tilt = ISO.clamp(+p.tilt, 0, 70);
        if (p.lit !== undefined) lit = p.lit;
      };
      // the sun creeps, the strut drives the tilt at a few degrees a second
      g.update = (dt) => {
        const calm = ISO.still();
        for (const key of ["sun", "tilt"]) { s[key] = ISO.follow(s[key], goal[key], dt, 0.45, calm); if (Math.abs(s[key] - goal[key]) < 0.05) s[key] = goal[key]; }
        draw();
        return s.sun !== goal.sun || s.tilt !== goal.tilt;
      };
      g.readout = () => `sun ${Math.round(s.sun)}° up · panel tilted ${Math.round(s.tilt)}° · light ${Math.round(Math.abs(90 - s.sun - s.tilt))}° off square · ${Math.round(watts())} W of 400 W (400 × cos ${Math.round(Math.abs(90 - s.sun - s.tilt))}°) · 60 cells × 0.55 V ≈ 33 V`;
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
