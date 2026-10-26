// "runway cx cy width land=0..1 lab=1 lit=runway|threshold|papi|taxiway|terminal|tower|windsock|plane" — a model
// airfield on a grass base: runway 09/27 with its white paint (threshold "piano keys", the numbers, centre-line dashes,
// touchdown-zone bars and the big aiming-point blocks, edge lines), edge lights (white), threshold lights (green),
// end lights (red), approach lights on poles beyond the 27 end, the four PAPI lights beside the aiming point (two red
// and two white = on the glide path), a parallel taxiway with yellow centre line, blue edge lights and holding-point
// marks, a rapid-exit taxiway, an apron, the terminal with jet bridges, the control tower and a windsock.
// set({ land }) flies the airliner in: 0 on final approach over the approach lights, ~0.3 over the threshold,
// ~0.45 touchdown on the aiming point, then braking and turning off at the rapid exit onto the taxiway (1).
// Runway numbers are the heading in tens of degrees: landing west (270°) the pilot reads 27; the far end is 09.
// The model shortens the runway (1 unit ≈ 1.1 m across, the length about a fifth of a real 3 km runway) and steepens
// the glide path to show it; the readout gives the real numbers.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RX = 110, RW = 20, TY = -52, TW = 7;
  const PK = 1.35, named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const WHITE = "#fbfbf7", YEL = "#f2c230";
  const spline = (pts) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) { const t = k / 8, t2 = t * t, t3 = t2 * t; out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  // the flight: final approach, threshold (about 50 ft), touchdown on the aiming point, roll-out, rapid exit
  const XE = 0, PATH = spline([[150, 0, 24], [RX, 0, 11], [RX - 46, 0, 1.4], [RX - 56, 0, 0], [20, 0, 0], [XE + 6, 0, 0], [XE - 18, -3, 0], [XE - 40, -17, 0], [XE - 58, -37, 0], [XE - 74, -50, 0], [-84, TY, 0]]);
  const LENS = PATH.map((p, i) => (i ? Math.hypot(p[0] - PATH[i - 1][0], p[1] - PATH[i - 1][1], p[2] - PATH[i - 1][2]) : 0)).map(((s) => (v) => (s += v))(0));
  const at = (s) => {
    let i = 1; while (i < PATH.length - 1 && LENS[i] < s) i++;
    const a = PATH[i - 1], b = PATH[i], f = ISO.clamp((s - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1), 0, 1);
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  };
  // the rapid-exit pavement: the plane's path from the runway edge to the taxiway, 8 units either side of it
  const exitStrip = () => {
    const pts = PATH.filter((p) => p[2] === 0 && p[1] < -RW + 4 && p[1] > TY + 2), l = [], r = [];
    pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], k = Math.hypot(dx, dy) || 1; l.push([p[0] - (dy / k) * 8, p[1] + (dx / k) * 8]); r.push([p[0] + (dy / k) * 8, p[1] - (dx / k) * 8]); });
    return [...l, ...r.reverse()];
  };
  const sTD = LENS[3 * 8], sEnd = LENS[LENS.length - 1];
  // land (0..1) → distance along the path: steady on the approach, then braking (speed falls off linearly)
  const sOf = (u) => (u <= 0.45 ? (u / 0.45) * sTD : sTD + (sEnd - sTD) * (1 - (1 - (u - 0.45) / 0.55) ** 2));

  // the airliner, nose toward heading h, centred on its main gear at the origin (a twin-engine narrow-body). The audit
  // reads the fuselage and engines as loose: they hang from the wings and stand on the gear (ISO.poly/ISO.box, unrecorded)
  const PAINT = ISO.tint("#f7f8fa", ["#b9bec6", "#c9cdd4", "#d8dbe1", "#e7e9ed"], "#4a5260"), TAIL = ISO.tint("#3f74c4", ["#1f4482", "#28529a", "#3161b0", "#3a6cbe"], "#122a52");
  const planeSvg = (P, h) => {
    const c = Math.cos(h), n = Math.sin(h), A = (u, w, z) => [(u * c - w * n) * PK, (u * n + w * c) * PK, z * PK], pr = (q) => q.map(([a, r, m]) => [a * PK, r * PK, m]);
    const out = [], zc = 4.2, F = G.frameAlong(A(17, 0, zc), [-c, -n, 0]);
    const nearW = K.depthOf(A(0, 1, 0), P) > K.depthOf(A(0, -1, 0), P) ? 1 : -1;
    const wing = (side) => ISO.poly([A(3, side * 1.6, zc - 1.2), A(-5, side * 1.6, zc - 1.2), A(-9.5, side * 15.5, zc - 0.2), A(-6.8, side * 15.5, zc - 0.2), A(3, side * 1.6, zc - 0.7), A(-5, side * 1.6, zc - 0.7), A(-9.5, side * 15.5, zc + 0.1), A(-6.8, side * 15.5, zc + 0.1)], [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid");
    const engine = (side) => S(G.solidOf(pr([[0, 0.9], [0.4, 1.15, 1], [3.6, 1.1, 1], [4.8, 0.7]]), G.frameAlong(A(4.4, side * 5.8, zc - 2.1), [-c, -n, 0]), P), { tone: "mid" }) + ISO.box(A, P, [-1.6, 1.6], [side * 5.6, side * 6.0].sort((a, b) => a - b), [zc - 1.1, zc - 0.8], "mid");
    const stab = (side) => ISO.poly([A(-13.2, side * 0.6, zc + 1.2), A(-16.4, side * 0.6, zc + 1.2), A(-17.6, side * 6, zc + 1.6), A(-16.2, side * 6, zc + 1.6), A(-13.2, side * 0.6, zc + 1.5), A(-16.4, side * 0.6, zc + 1.5), A(-17.6, side * 6, zc + 1.8), A(-16.2, side * 6, zc + 1.8)], ISO.BOX_F, P, "mid");
    // gear: a nose leg and two main legs, each a strut and a pair of wheels
    for (const [u, w] of [[11.5, 0], [0, -2.6], [0, 2.6]].sort((a, b) => K.depthOf(A(a[0], a[1], 0), P) - K.depthOf(A(b[0], b[1], 0), P))) {
      out.push(ISO.tinted(ISO.T.steel, ISO.box(A, P, [u - 0.2, u + 0.2], [w - 0.2, w + 0.2], [0.9, zc - 1.6], "mid")));
      const k = u ? 0.6 : 1;
      out.push(ISO.tinted(ISO.T.rubber, ISO.box(A, P, [u - 0.85 * k, u + 0.85 * k], [w - 0.9 * k, w + 0.9 * k], [0, 1.6 * k], "hi")));
    }
    out.push(ISO.tinted(PAINT, engine(-nearW) + wing(-nearW) + stab(-nearW)));
    // fuselage from nose (s = 0) to tail cone, with the window line, cockpit glass and a blue cheat line
    out.push(ISO.tinted(PAINT, S(G.solidOf(pr([[0, 0.15], [0.8, 0.95, 1], [2.6, 1.6, 1], [5, 1.85], [23, 1.85], [28.5, 1.1, 1], [31, 0.4]]), F, P), { tone: "mid" })));
    const side = G.angleToward(F, G.viewOf(P)), wins = [];
    for (let s = 5.5; s < 24; s += 1.05) wins.push(K.iso(G.pointOf(F, s * PK, 1.86 * PK, side + 0.1), P));
    out.push(K.dotsSvg(wins, { size: 0.45, tone: "lo" }));
    const cheat = [5, 23].map((s) => K.iso(G.pointOf(F, s * PK, 1.86 * PK, side + 0.55), P));
    out.push(`<path d="${K.pathOf(cheat)}" stroke="#3f74c4" stroke-width="${(G.scaleOf(P) * 0.35).toFixed(2)}" fill="none"/>`);
    out.push(`<path d="${K.pathOf([[1.7, -0.5, 1.32], [1.7, 0.5, 1.32], [2.7, 0.55, 1.62], [2.7, -0.55, 1.62]].map(([s, da, r]) => K.iso(G.pointOf(F, s * PK, r * PK, side + da), P)), true)}" fill="#26303c"/>`);
    // the fin, then the near stabiliser, wing and engine
    out.push(ISO.tinted(TAIL, ISO.poly([A(-11.6, -0.25, zc + 1.6), A(-15.6, -0.25, zc + 1.6), A(-17.4, -0.25, zc + 8), A(-15.4, -0.25, zc + 8), A(-11.6, 0.25, zc + 1.6), A(-15.6, 0.25, zc + 1.6), A(-17.4, 0.25, zc + 8), A(-15.4, 0.25, zc + 8)], ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(PAINT, stab(nearW) + engine(nearW) + wing(nearW)));
    return out.join("");
  };
  // the plane's shadow straight below: a flat outline of wings, body and tail
  const shadowSvg = (P, h) => {
    const c = Math.cos(h), n = Math.sin(h), pt = ([u, w]) => K.iso([(u * c - w * n) * PK, (u * n + w * c) * PK, 0.7], P);
    const poly = (pts) => `<path d="${K.pathOf(pts.map(pt), true)}"/>`;
    return `<g fill="#1d2630" opacity=".16">${poly([[17, 0], [15, 1.7], [-12, 1.7], [-14, 0.4], [-14, -0.4], [-12, -1.7], [15, -1.7]])}${poly([[3, 1.6], [-5, 1.6], [-9.5, 15.5], [-6.8, 15.5]])}${poly([[3, -1.6], [-5, -1.6], [-9.5, -15.5], [-6.8, -15.5]])}${poly([[-13.2, 0], [-16.4, 0], [-17.6, 6], [-16.2, 6], [-17.6, -6], [-16.2, -6]].slice(0, 4))}${poly([[-13.2, 0], [-16.4, 0], [-17.6, -6], [-16.2, -6]])}</g>`;
  };

  ISO.add({
    name: "runway", title: "Airport runway", compare: "runway 480 270 520",
    about: "A model airfield: runway 27 with its markings and lights, PAPI glide-path lights, a taxiway and terminal; an airliner lands and turns off at the rapid exit.",
    line: "runway cx cy width land=0..1 lab=1 lit=runway|threshold|papi|taxiway|terminal|tower|windsock|plane",
    demo: { line: "runway 480 270 520", script: [{ set: { lit: "papi" }, hold: 1.4 }, { set: { land: 0.45, lit: "threshold" }, hold: "settle" }, { set: { land: 1, lit: "taxiway" }, hold: "settle" }, { set: { lit: "" }, hold: 1 }] },
    make([cx, cy, size = 520], o, t, parent) {
      const ROAD = window.ROAD, LAB = window.LAB;
      const lab = o.lab !== "0", W = size * 1.2, H = size * 0.86;
      const BASE = { x: -RX - 22, y: -116, w: 2 * RX + 70, d: 160, r: 4 };
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -10, 0), [150, 0, 30], [-95, -98, 52]], cx, cy, W, H, { azimuth: 66, elevation: 30 }, parent);
      const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -10, 10, P)}"/>`];
      out.push(ISO.tinted(ISO.T.wood, S(K.slabOf(BASE, -10, 7, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(BASE, -7, P, 4), { tone: "faint" }) })));
      out.push(ISO.tinted(ROAD.GRASS, S(K.slabOf(K.insetPlan(BASE, 2), -3, 3, P, 3), { tone: "hi" })));
      // pavements: runway, taxiway, the link at the 27 end, the rapid exit, the apron
      const runway = { x: -RX, y: -RW, w: 2 * RX, d: 2 * RW, r: 0.5 }, taxi = { x: -RX + 6, y: TY - TW, w: 2 * RX - 10, d: 2 * TW, r: 0.5 }, apron = { x: -64, y: -98, w: 170, d: 39, r: 1 };
      out.push(named("taxiway", ISO.tinted(ISO.T.road, S(K.slabOf(apron, 0, 0.4, P, 2), { tone: "hi" }) + S(K.slabOf(taxi, 0, 0.45, P, 2), { tone: "hi" }) + S(K.slabOf({ x: RX - 34, y: TY, w: 16, d: TY * -1 - RW + 1, r: 0.5 }, 0, 0.45, P, 2), { tone: "hi" }) +
        S(K.extrude(exitStrip(), 0, 0.45, P, { convex: false }), { tone: "hi" }))));
      out.push(named("runway", ISO.tinted(ROAD.TARMAC, S(K.slabOf(runway, 0, 0.6, P, 2), { tone: "hi" }))));
      // runway paint (z just above the top)
      const z = 0.62, paint = [], thr = [];
      paint.push(ROAD.bar(P, [-RX + 2, RW - 1.2], [RX - 2, RW - 1.2], 0.6, z), ROAD.bar(P, [-RX + 2, -RW + 1.2], [RX - 2, -RW + 1.2], 0.6, z));
      for (const e of [1, -1]) {
        for (let k = 0; k < 8; k++) { const y = -RW + 3.4 + k * 2.15 + (k >= 4 ? 4.6 : 0); thr.push(ROAD.bar(P, [e * (RX - 3), y], [e * (RX - 17), y], 1.25, z)); }
        // touchdown-zone bars and the aiming point
        for (const [x0, len, ws] of [[30, 6, [6, 8.6]], [56, 14, [9, 13.5]], [84, 6, [6, 8.6]]]) for (const s of [1, -1]) for (const y of len === 14 ? [11.2] : [ws[0], ws[1]]) paint.push(ROAD.bar(P, [e * (RX - x0), s * y], [e * (RX - x0 - len), s * y], len === 14 ? 4 : 1.1, z));
      }
      for (let x = -RX + 48; x < RX - 48; x += 14) paint.push(ROAD.bar(P, [x, 0], [x + 8, 0], 0.7, z));
      // the numbers, read by a pilot landing toward them
      const numberAt = (x, txt, e) => { const o = K.iso([x, 0, z], P), u = K.iso([x, e, z], P), v = K.iso([x + e, 0, z], P); return `<text transform="matrix(${(u[0] - o[0]).toFixed(3)} ${(u[1] - o[1]).toFixed(3)} ${(v[0] - o[0]).toFixed(3)} ${(v[1] - o[1]).toFixed(3)} ${o[0].toFixed(1)} ${o[1].toFixed(1)})" text-anchor="middle" fill="${WHITE}" style="font:700 14px 'Helvetica Neue',Arial,sans-serif;letter-spacing:2px">${txt}</text>`; };
      paint.push(numberAt(RX - 22, "27", 1), numberAt(-RX + 22, "09", -1));
      out.push(named("runway", paint.join("")), named("threshold", thr.join("")));
      // taxiway paint: yellow centre line along the taxiway and round the exits, holding-point bars
      const tpaint = [ROAD.bar(P, [-RX + 8, TY], [RX - 26, TY], 0.7, 0.47, YEL), ROAD.bar(P, [RX - 26, TY], [RX - 26, -RW + 0.5], 0.7, 0.47, YEL)];
      const exitLine = PATH.slice(PATH.findIndex((p) => p[0] < XE + 8), PATH.length - 1).map((p) => [p[0], p[1]]);
      for (let i = 1; i < exitLine.length; i++) tpaint.push(ROAD.bar(P, exitLine[i - 1], exitLine[i], 0.7, 0.47, YEL));
      for (const [a, b] of [[[RX - 33.5, -36], [RX - 18.5, -36]], [[RX - 33.5, -37.4], [RX - 18.5, -37.4]]]) tpaint.push(ROAD.bar(P, a, b, 0.5, 0.47, YEL));
      tpaint.push(ROAD.dashes(P, [[RX - 33.5, -39.2], [RX - 18.5, -39.2]], 0.47, 1.6, 1.2, 0.5, YEL), ROAD.dashes(P, [[RX - 33.5, -40.6], [RX - 18.5, -40.6]], 0.47, 1.6, 1.2, 0.5, YEL));
      out.push(named("taxiway", tpaint.join("")));
      // lights: small fittings with coloured lenses
      const light = (x, y, col, z0 = 0.6) => S(K.cylinder(x, y, 0.9, z0, 0.9, P, 10), { tone: "lo" }) + `<path d="${K.pathOf(K.circleRing(x, y, 0.65, 10).map(([a, b]) => K.iso([a, b, z0 + 0.92], P)), true)}" fill="${col}" stroke="#333" stroke-width="0.3"/>`;
      const lights = [];
      for (let x = -RX + 10; x <= RX - 10; x += 20) for (const y of [RW + 1.6, -RW - 1.6]) lights.push(light(x, y, "#fffbe6", 0));
      for (let y = -RW + 2; y <= RW - 2; y += 4) lights.push(light(RX + 1.6, y, "#3fc26a", 0), light(-RX - 1.6, y, "#e5322b", 0));
      for (let x = -RX + 16; x <= RX - 30; x += 24) lights.push(light(x, TY - TW - 1.4, "#3b6fe0", 0));
      // approach lights: a line of poles beyond the 27 end, each with a cross bar of lamps
      const app = [];
      for (let k = 0; k < 4; k++) {
        const x = RX + 10 + k * 9, hgt = 2 + k * 1.4, wide = k === 2 ? 10 : 4;
        app.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, 0, 0.6, 0, hgt, P, 10), { tone: "mid" }) + ISO.wbox(P, [x - 0.5, x + 0.5], [-wide, wide], [hgt, hgt + 0.8], "mid")));
        for (let y = -wide + 1; y <= wide - 1; y += 2) app.push(`<path d="${K.pathOf(K.circleRing(x, y, 0.4, 8).map(([a, b]) => K.iso([a, b, hgt + 0.82], P)), true)}" fill="#fffbe6" stroke="#555" stroke-width="0.3"/>`);
      }
      out.push(named("runway", lights.join("") + app.join("")));
      // PAPI: four boxes left of the aiming point; from the glide path the two nearest the runway show red
      const papi = [];
      for (let k = 0; k < 4; k++) {
        const y = RW + 5 + k * 4, x = RX - 60;
        papi.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [x - 1.4, x + 1.4], [y - 1.2, y + 1.2], [0, 2.4], "mid")), `<path d="${K.pathOf([[x + 1.42, y - 0.8, 0.7], [x + 1.42, y + 0.8, 0.7], [x + 1.42, y + 0.8, 1.9], [x + 1.42, y - 0.8, 1.9]].map((p) => K.iso(p, P)), true)}" fill="${k < 2 ? "#e5322b" : "#fffbe6"}" stroke="#333" stroke-width="0.3"/>`);
      }
      out.push(named("papi", papi.join("")));
      // terminal: a long block with a glass front, roof plant, three jet bridges on legs
      const term = [ISO.tinted(ISO.T.paint, ISO.wbox(P, [-30, 96], [-112, -103], [0, 14], "mid")), ISO.tinted(ISO.T.glass, ISO.wbox(P, [-28, 94], [-103, -102.2], [5, 11.5], "mid")), ISO.tinted(ISO.T.steel, ISO.wbox(P, [-32, 98], [-114, -101.4], [14, 15.4], "mid"))];
      for (const x of [-4, 30, 64]) term.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 2, x + 2], [-112, -106], [15.4, 18], "mid")));
      for (const x of [4, 38, 72]) term.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [x - 2.4, x + 2.4], [-102.2, -86], [6, 9.4], "mid")), ISO.tinted(ISO.T.steel, S(K.cylinder(x, -88, 0.8, 0.4, 5.6, P, 10), { tone: "mid" }) + ISO.wbox(P, [x - 2.8, x + 2.8], [-86, -84], [5, 10], "mid")));
      out.push(named("terminal", term.join("")));
      // control tower: base, shaft, the glass cab with its roof and a mast
      const TX = -95, TYc = -98;
      out.push(named("tower", ISO.tinted(ISO.T.paint, ISO.wbox(P, [TX - 9, TX + 9], [TYc - 9, TYc + 9], [0, 8], "mid") + S(K.cylinder(TX, TYc, 4, 8, 32, P, 24), { tone: "mid" }) + S(K.cylinder(TX, TYc, 7.5, 40, 1.2, P, 8), { tone: "mid" })) +
        ISO.tinted(ISO.T.glass, S(K.cylinder(TX, TYc, 7, 41.2, 6.4, P, 8), { tone: "mid" })) + ISO.tinted(ISO.T.paint, S(K.cylinder(TX, TYc, 8.4, 47.6, 1.4, P, 8), { tone: "mid" })) + ISO.tinted(ISO.T.steel, S(K.cylinder(TX, TYc, 0.4, 49, 6, P, 8), { tone: "mid" }))));
      // windsock: a mast by the runway and the cone pointing downwind (wind from the west: blowing toward +x)
      const WX = RX + 6, WY = -RW - 14, SZ = 14, Fw = G.frameAlong([WX + 0.6, WY, SZ], [1, 0, -0.12]);
      out.push(named("windsock", ISO.tinted(ISO.T.steel, S(K.cylinder(WX, WY, 0.6, 0, SZ + 1.2, P, 10), { tone: "mid" })) +
        ISO.tinted(ROAD.tint("#f07a2a"), S(G.solidOf([[0, 1.9], [3, 1.6]], Fw, P), { tone: "hi" }) + S(G.solidOf([[6, 1.3], [9, 1.0]], Fw, P), { tone: "hi" })) + ISO.tinted(ROAD.KERB, S(G.solidOf([[3, 1.6], [6, 1.3]], Fw, P), { tone: "hi" }) + S(G.solidOf([[9, 1.0], [11, 0.8]], Fw, P), { tone: "hi" }))));
      if (lab) out.push(ISO.word(K.iso([TX, TYc, 58], P), "control tower", "#445", { size: 12 }), ISO.word(K.iso([33, -108, 22], P), "terminal", "#445", { size: 12 }), ISO.word(K.iso([10, TY - TW, 1], P), "taxiway", "#8a6a10", { size: 12, dy: -6 }),
        ISO.word(K.iso([RX - 60, RW + 22, 3], P), "PAPI lights", "#445", { size: 12, dy: 14 }), ISO.word(K.iso([WX, WY, SZ + 4], P), "windsock", "#445", { size: 12 }));
      g.innerHTML = out.join("") + `<g data-part="shadow"></g><g data-name="plane" data-part="plane"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")], cache = new Map();
      const st = { u: ISO.clamp(ISO.num(o, "land", 0), 0, 1), want: 0, lit: o.lit || "", drawn: null, litDrawn: null };
      st.want = st.u;
      const draw = () => {
        if (st.drawn !== st.u) {
          st.drawn = st.u;
          const [x, y, zz, h] = at(sOf(st.u)), step = Math.round(((h * 180) / Math.PI + 360) % 360 / 2) % 180, key = String(step), hq = (step * 2 * Math.PI) / 180 + 1e-3;   // off the exact axis: ISO.poly can round a face facing straight away from the light to shade -1
          if (!cache.has(key)) cache.set(key, [planeSvg(P, hq), shadowSvg(P, hq)]);
          w.rebuild(el.plane, key, () => cache.get(key)[0]); w.rebuild(el.shadow, key, () => cache.get(key)[1]);
          w.attr(el.plane, "transform", K.translateAlong(P, [x, y, zz + 0.6])); w.attr(el.shadow, "transform", K.translateAlong(P, [x, y, 0]));
          if (lab) w.rebuild(el.words, st.u < 0.25 ? "a" : st.u < 0.42 ? "b" : st.u < 0.75 ? "c" : "d", () => ISO.word(K.iso([x, y, zz + 24], P), ["final approach", "over the threshold", "touchdown · braking", "turning off · taxiway"][st.u < 0.25 ? 0 : st.u < 0.42 ? 1 : st.u < 0.75 ? 2 : 3], "#2b5cc4", { size: 13 }));
        }
        if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => {
        if (p.land !== undefined) st.want = ISO.clamp(+p.land, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) st.u = st.want;
        else st.u += Math.sign(st.want - st.u) * Math.min(Math.abs(st.want - st.u), dt * 0.09);
        draw();
        return st.u !== st.want;
      };
      g.readout = () => {
        const u = st.u;
        if (u < 0.25) return `final approach on a 3° glide path, about 140 knots (260 km/h) · PAPI shows 2 red + 2 white = on the path · about ${Math.round((0.25 - u) / 0.25 * 3 * 318 + 50)} ft up`;
        if (u < 0.42) return "over the threshold at about 50 ft, 135 knots · flare: nose up a little, power to idle";
        if (u < 0.5) return "touchdown on the aiming-point blocks, about 300 m past the threshold · 130 knots";
        if (u < 0.75) return `braking: reverse thrust, spoilers and wheel brakes · about ${Math.round(130 - (u - 0.5) / 0.25 * 90)} knots`;
        return u < 1 ? "turning off at the rapid-exit taxiway (built for up to about 50 knots) · runway clear for the next plane" : "on the taxiway, below 30 knots, following the yellow centre line · runway 27 clear";
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
