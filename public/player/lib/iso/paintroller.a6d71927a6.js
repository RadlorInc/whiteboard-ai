// "paintroller cx cy width step=0..3 lab=1 lit=…" — a 9" paint roller, its tray on the floor and a wall to paint.
// The roller is a wire frame (handle with its grip, ferrule and a threaded socket for an extension pole, the bent
// frame rod, the cage on its axle with a bearing hub and an end nut) carrying a nap cover. The tray is a pressed pan:
// rolled rims, a deep well holding paint at the back and a ribbed ramp rising to the front lip. A 4 L can of the same
// paint stands beside it, and the wall has its skirting and a socket. Steps: 1 dip the roller in the well and roll it
// to load the nap; 2 roll it up and down the ramp so the ribs spread the paint and squeeze off the excess; 3 roll a W
// on the wall: the paint band appears where the cover has been, thinner on each stroke as the load runs out.
// set({ step }) plays a step from the pose the steps before it leave.
// Local helpers: wire (bent rod with ball bends), the tray from its pressed parts, the W band.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. 9" (23 cm) cover, 3/8" nap: 5.8 cm across.
  const LEN = 23, R = 2.9, CORE = 1.9, TRAY_X = 8, TW = 14, RIM = 7.5, WALL_Y = -34;
  const WELL = [-24, -12], RAMP_END = 10, LIP = 14, FLOOR_Z = 0.8, PAINT_Z = 2.6, RISE = 4.7;
  const ROLL_X = TRAY_X - 1.2;               // the cover sits off centre so the frame arm clears the tray's side
  const PRESS = 0.2;                          // the nap squashes this much against the ribs or the wall
  const rampZ = (y) => (y <= WELL[1] ? FLOOR_Z : FLOOR_Z + ((Math.min(y, RAMP_END) - WELL[1]) / (RAMP_END - WELL[1])) * RISE);
  const W_PTS = [[-4, 46], [8, 22], [20, 42], [32, 22], [44, 46]];
  const W_LEN = W_PTS.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - W_PTS[i][0], p[1] - W_PTS[i][1]), 0);
  const areaOf = (w) => { let done = 0, a = 0; for (let i = 1; i < W_PTS.length; i++) { const l = Math.hypot(W_PTS[i][0] - W_PTS[i - 1][0], W_PTS[i][1] - W_PTS[i - 1][1]), f = ISO.clamp((w * W_LEN - done) / l, 0, 1); a += f * Math.abs(W_PTS[i][1] - W_PTS[i - 1][1]) * LEN; done += l; } return a / 10000; };
  const PAINT = { fill: "#4f86c9", ink: "#24507f", style: ISO.tint("#8db6e6", ["#3f74b5", "#4f86c9", "#6497d2", "#78a8dc"], "#24507f") };
  const TRAY = ISO.tint("#eceef1", ["#a2a5ab", "#b4b7bc", "#c7c9cd", "#d8dade"], "#3c3f45");
  const WALL = ISO.tint("#f1efe9", ["#cfccc3", "#d9d6ce", "#e3e0d9", "#ebe9e3"], "#6a675f");
  const TRAY_PSI = 0.95, WALL_PSI = -1.0;     // handle direction in the y–z plane: up-and-out on the tray, below on the wall

  const STEPS = [
    { title: "Load the roller", say: "Dip the roller into the paint in the deep end of the tray and roll it back and forth so the nap soaks it up.", lit: "cover" },
    { title: "Roll on the ramp", say: "Roll it up and down the ribbed ramp. The ribs spread the paint evenly and squeeze off the extra so it won't drip.", lit: "ramp" },
    { title: "Roll a W", say: "On the wall, roll a big W about a metre wide, then fill it in without lifting the roller.", lit: "wall" },
  ];
  const on = (y) => [ROLL_X, y, rampZ(y) + R + 0.45 - PRESS];   // the ribs stand 0.45 proud of the ramp
  const onWall = ([x, z]) => [x, WALL_Y + R - PRESS, z];
  // The roller is built at its resting pose R0 (on the ramp) and moved by the difference, so its parts sit where the
  // audit expects them in the first pose.
  const R0 = on(6);
  // Pose: axle centre, handle angle, paint on the nap (0–1) and how far along the W (0–1).
  const zero = () => ({ p: [...R0], psi: TRAY_PSI, load: 0, w: 0, label: "" });
  const lerp = (a, b, t) => (typeof a === "string" ? (t < 1 ? a : b) : typeof a === "number" ? a + (b - a) * t : Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t)) : Object.fromEntries(Object.keys(a).map((k) => [k, k in b ? lerp(a[k], b[k], t) : a[k]])));
  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  function movesOf(step) {
    const m = [], go = (t, set, label) => m.push({ t, set, label });
    if (step === 1) {
      go(0.7, { p: [ROLL_X, 2, 14] }, "lift the roller over the well");
      go(0.7, { p: [ROLL_X, -18, 12] }, "over the paint");
      go(0.6, { p: on(-18) }, "into the paint");
      for (const [y, l] of [[-21.2, 0.4], [-14.8, 0.7], [-20.5, 0.9], [-16, 1]]) go(0.55, { p: on(y), load: l }, "rolling in the well · the nap soaks up paint");
    }
    if (step === 2) {
      go(0.6, { p: on(-10) }, "onto the ramp");
      for (const y of [7, -9, 7, -6]) go(0.8, { p: on(y), load: 0.85 }, "rolling on the ribs · even coat, excess runs back to the well");
    }
    if (step === 3) {
      go(0.8, { p: [ROLL_X, 0, 26], psi: (TRAY_PSI + WALL_PSI) / 2 }, "lift the roller off the tray");
      go(1.0, { p: onWall([W_PTS[0][0], W_PTS[0][1] + 6]), psi: WALL_PSI }, "to the wall, top left");
      go(0.4, { p: onWall(W_PTS[0]) }, "roller on the wall");
      let acc = 0;
      for (let i = 1; i < W_PTS.length; i++) {
        acc += Math.hypot(W_PTS[i][0] - W_PTS[i - 1][0], W_PTS[i][1] - W_PTS[i - 1][1]);
        go(0.9, { p: onWall(W_PTS[i]), w: acc / W_LEN, load: 0.85 - 0.17 * i }, `rolling the W · stroke ${i} of 4`);
      }
      go(0.5, { p: onWall([W_PTS[4][0], W_PTS[4][1] + 6]) }, "W done · now fill it in without lifting");
    }
    return m;
  }
  function poseAt(step, s0, t) {
    let s = { ...s0, p: [...s0.p] }, clock = 0;
    for (const mv of movesOf(step)) {
      const end = { ...s, ...mv.set };
      const k = ease((t - clock) / mv.t);
      if (t >= clock) { s = k >= 1 ? end : lerp(s, end, k); s.label = mv.label; }
      clock += mv.t;
      if (t < clock) break;
    }
    return s;
  }
  const lengthOf = (step) => movesOf(step).reduce((a, m) => a + m.t, 0);
  const startOf = (step) => { let s = zero(); for (let i = 1; i < step; i++) s = poseAt(i, s, 1e9); return s; };

  // A bent wire through points with ball bends.
  function wire(P, pts, r, tone = "hi") {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], d = b.map((v, k) => v - a[k]), l = Math.hypot(...d);
      out.push(S(G.disc(0, l, r, G.frameAlong(a, d.map((v) => v / l)), P), { tone }));
      if (i + 2 < pts.length) out.push(S(G.sphereOf(b, r * 1.15, P), { tone }));
    }
    return out.join("");
  }
  const X_AX = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const facing = (P, F) => G.dot3(F.a, G.viewOf(P)) > 0.02;

  // ── the room: floor, wall with its skirting and a socket
  function roomSvg(P) {
    const out = [];
    const floor = { x: -24, y: -38, w: 98, d: 56, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -3, 3, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(floor, -3, 3, P, 3, 0.6), { tone: "lo" })));
    // floorboard joints, edge to edge across the top
    for (const y of [-26, -14, -2, 10]) out.push(L(K.lineOnTop([-24, y], [74, y], 0, P), { tone: "faint" }));
    out.push(`<g data-name="wall">${ISO.tinted(WALL, ISO.wbox(P, [-24, 74], [-38, WALL_Y], [0, 58], "mid"))}</g>`);
    // skirting board and its moulded cap
    out.push(ISO.wbox(P, [-24, 74], [WALL_Y, WALL_Y + 1.2], [0, 8], "mid"), ISO.wbox(P, [-24, 74], [WALL_Y, WALL_Y + 1.6], [8, 9.2], "mid"));
    // a double socket: plate, two outlets with their pin slots, and the plate's screws
    out.push(ISO.wbox(P, [-19.5, -6.5], [WALL_Y, WALL_Y + 0.5], [14, 22], "mid"));
    for (const x of [-18.5, -12.5]) {
      out.push(ISO.wbox(P, [x, x + 5], [WALL_Y + 0.5, WALL_Y + 0.8], [15, 21], "lo"));
      const slot = (u, z, w, h) => `<path d="${K.pathOf([[u, z], [u + w, z], [u + w, z + h], [u, z + h]].map(([a, b]) => K.iso([a, WALL_Y + 0.81, b], P)), true)}" fill="#55595f"/>`;
      out.push(slot(x + 2.2, 19, 0.6, 1.2), slot(x + 1.1, 16.2, 0.5, 1.1), slot(x + 3.4, 16.2, 0.5, 1.1));
    }
    out.push(D([K.iso([-13, WALL_Y + 0.5, 21.2], P), K.iso([-13, WALL_Y + 0.5, 14.8], P)], { size: 0.5 }));
    return out.join("");
  }

  // ── the tray, from its pressed parts: far side, back wall, well floor, ramp, lip, front upstand, rims and ribs
  const x0 = TRAY_X - TW, x1 = TRAY_X + TW;
  const sidePoly = [[WELL[0] - 0.6, 0], [LIP + 0.6, 0], [LIP + 0.6, RIM - 1], [WELL[0] - 0.6, RIM]];
  const yEnd = WELL[1] + ((PAINT_Z - FLOOR_Z) / RISE) * (RAMP_END - WELL[1]);
  const rimBead = (P, a, b) => { const d = b.map((v, i) => v - a[i]), l = Math.hypot(...d); return S(G.disc(0, l, 0.45, G.frameAlong(a, d.map((v) => v / l)), P), { tone: "mid" }); };
  function trayBackSvg(P) {
    const out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: x0 - 0.6, y: WELL[0] - 0.6, w: 2 * TW + 1.2, d: LIP - WELL[0] + 1.2, r: 1 }, 0, 2, P)}"/>`);
    const tray = [];
    tray.push(S(G.prismOf(X_AX([0, 0, 0]), sidePoly, x0 - 0.6, x0, P), { tone: "mid" }));
    tray.push(ISO.wbox(P, [x0, x1], [WELL[0] - 0.6, WELL[0]], [0, RIM], "mid"));
    tray.push(ISO.wbox(P, [x0, x1], [WELL[0], WELL[1]], [0, FLOOR_Z], "mid"));
    tray.push(S(G.prismOf(X_AX([0, 0, 0]), [[WELL[1], 0], [RAMP_END, 0], [RAMP_END, rampZ(RAMP_END)], [WELL[1], FLOOR_Z]], x0, x1, P), { tone: "mid" }));
    tray.push(ISO.wbox(P, [x0, x1], [RAMP_END, LIP], [0, rampZ(RAMP_END)], "mid"));
    tray.push(ISO.wbox(P, [x0, x1], [LIP, LIP + 0.6], [0, rampZ(RAMP_END) + 0.9], "mid"));
    // the rolled rim along the back wall and the far side's top edge
    tray.push(rimBead(P, [x0 - 0.6, WELL[0] - 0.3, RIM + 0.3], [x1 + 0.6, WELL[0] - 0.3, RIM + 0.3]));
    tray.push(rimBead(P, [x0 - 0.3, WELL[0] - 0.6, RIM + 0.3], [x0 - 0.3, LIP + 0.6, RIM - 0.7]));
    out.push(ISO.tinted(TRAY, tray.join("")));
    // Ribs across the ramp: half-round ridges pressed into the sheet, far to near, drawn before the paint so the ones under it are hidden.
    const ribs = [];
    for (let y = WELL[1] + 2.4; y < RAMP_END - 0.8; y += 2.1) ribs.push(S(G.disc(0, 2 * TW - 3, 0.45, X_AX([x0 + 1.5, y, rampZ(y)]), P), { tone: "mid" }));
    out.push(`<g data-name="ramp">${ISO.tinted(TRAY, ribs.join(""))}</g>`);
    // Paint in the well, level at 2.6 cm, from the back wall to where the ramp rises through it.
    out.push(`<g data-name="paint">${ISO.tinted(PAINT.style, S(G.prismOf(X_AX([0, 0, 0]), [[WELL[0], FLOOR_Z], [WELL[1], FLOOR_Z], [yEnd, PAINT_Z], [WELL[0], PAINT_Z]], x0, x1, P), { tone: "mid" }))}` +
      `<path d="${K.pathOf([[x0 + 3, WELL[0] + 2.4], [x1 - 7, WELL[0] + 2.4]].map(([x, y]) => K.iso([x, y, PAINT_Z], P)))}" stroke="#ffffff" stroke-width="0.9" opacity=".55"/></g>`);
    return out.join("");
  }
  const trayFrontSvg = (P) => ISO.tinted(TRAY, S(G.prismOf(X_AX([0, 0, 0]), sidePoly, x1, x1 + 0.6, P), { tone: "mid" }) +
    rimBead(P, [x1 + 0.3, WELL[0] - 0.6, RIM + 0.3], [x1 + 0.3, LIP + 0.6, RIM - 0.7]));

  // ── the can of paint the tray was filled from: body with its label band, rolled beads, rim, lid, ears and bail
  const CAN = [60, 3], CAN_R = 8.2;
  function canSvg(P, lab) {
    const [x, y] = CAN, out = [`<path class="iso-halo" d="${K.haloOf({ x: x - CAN_R, y: y - CAN_R, w: 2 * CAN_R, d: 2 * CAN_R, r: CAN_R }, 0, 2, P)}"/>`];
    const steel = [S(K.cylinder(x, y, CAN_R, 0, 5, P, 48, 0.4), { tone: "mid", inner: L(K.sideArc(x, y, CAN_R, 1.2, P, 32), { tone: "faint" }) })];
    out.push(ISO.tinted(ISO.T.steel, steel.join("")));
    out.push(ISO.tinted(PAINT.style, S(K.cylinder(x, y, CAN_R, 5, 8, P, 48), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, CAN_R, 13, 5, P, 48), { tone: "mid", crease: "none", inner: L(K.sideArc(x, y, CAN_R, 16.8, P, 32), { tone: "faint" }) }) +
      S(K.cylinder(x, y, CAN_R + 0.3, 18, 0.8, P, 48, 0.3), { tone: "mid" }) + S(K.cylinder(x, y, CAN_R - 0.9, 18.8, 0.4, P, 48, 0.2), { tone: "mid" }) +
      L(K.ring(x, y, CAN_R - 2.2, 19.2, P, 48), { tone: "lo" })));
    // ears riveted to the sides and the wire bail standing up over the lid, with its plastic grip
    const ears = [-1, 1].map((s) => ISO.wbox(P, s < 0 ? [x - CAN_R - 1.6, x - CAN_R + 0.1] : [x + CAN_R - 0.1, x + CAN_R + 1.6], [y - 0.8, y + 0.8], [13.5, 15.5], "mid"));
    const BR = 10, arc = Array.from({ length: 15 }, (_, i) => { const a = Math.PI - (i / 14) * Math.PI; return [x + Math.cos(a) * BR, y, 14.5 + Math.sin(a) * BR]; });
    out.push(ISO.tinted(ISO.T.steel, ears.join("") + wire(P, arc, 0.22, "mid")));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-2.2, 2.2, 0.6, X_AX([x, y, 14.5 + BR]), P), { tone: "mid" })));
    if (lab) out.push(ISO.word(K.iso([x, y + CAN_R, 0], P), "Paint can", "#444", { size: 12, dy: 16 }));
    return out.join("");
  }

  // The painted W: one band per stroke, the hull of the cover's swept line, each thinner as the load runs out.
  function bandSvg(P, w) {
    if (w <= 0) return "";
    const out = [];
    let done = 0;
    for (let i = 1; i < W_PTS.length; i++) {
      const a = W_PTS[i - 1], b = W_PTS[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), f = ISO.clamp((w * W_LEN - done) / l, 0, 1);
      done += l;
      if (f <= 0) break;
      const e = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      const pts = [[a[0] - LEN / 2, a[1]], [a[0] + LEN / 2, a[1]], [e[0] + LEN / 2, e[1]], [e[0] - LEN / 2, e[1]]].map(([x, z]) => K.iso([x, WALL_Y + 0.02, z], P));
      out.push(`<path d="${K.pathOf(ISO.hullOf(pts), true)}" fill="${PAINT.fill}" opacity="${(0.82 - 0.14 * (i - 1)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  // ── the roller, built at R0. The frame: bearing hub on the axle, the bent rod, and the handle along d.
  function frameSvg(P, psi) {
    const d = [0, Math.cos(psi), Math.sin(psi)], at = (x, k) => [R0[0] + x, R0[1] + d[1] * k, R0[2] + d[2] * k];
    const out = [];
    // the frame rod: out of the hub along the axle, up the arm, then across to the handle's ferrule
    out.push(ISO.tinted(ISO.T.steel, wire(P, [at(LEN / 2 + 1.6, 0), at(LEN / 2 + 2.7, 0), at(LEN / 2 + 2.7, 7), at(3, 13)], 0.32)));
    const F = G.frameAlong(at(3, 13), d);
    const grip = S(G.solidOf([[2.6, 1.05], [3.4, 1.3, 1], [5.2, 1.22, 1], [7, 1.38, 1], [8.8, 1.24, 1], [10.6, 1.42, 1], [12.4, 1.3, 1], [13.6, 1.18]], F, P, { steps: 28 }), { tone: "mid",
      inner: L([[5.2, 1.22], [8.8, 1.24], [12.4, 1.3]].map(([s, r]) => G.arcOf(F, s, r, P, { trim: 0 })).join(""), { tone: "faint" }) });
    out.push(`<g data-name="handle">${ISO.tinted(ISO.T.steel, S(G.disc(0, 2, 0.75, F, P), { tone: "hi" }))}` +
      ISO.tinted(ISO.T.plastic, S(G.disc(2, 2.6, 1.4, F, P), { tone: "mid" }) + grip) +
      // the threaded socket in the end of the handle, for screwing on an extension pole
      ISO.tinted(ISO.T.brass, S(G.disc(13.6, 14.4, 1.0, F, P), { tone: "mid", inner: L([13.85, 14.1].map((s) => G.arcOf(F, s, 1.0, P, { trim: 0 })).join(""), { tone: "lo" }) }) +
        (facing(P, F) ? L(G.circleOf(F, 14.4, 0.6, P) + G.circleOf(F, 14.4, 0.42, P), { tone: "mid" }) : "")) + "</g>");
    return out.join("");
  }
  const COVER_F = X_AX([R0[0] - LEN / 2, R0[1], R0[2]]);
  const coverSvg = (P, load) => {
    const end = facing(P, COVER_F) ? L(G.circleOf(COVER_F, LEN, CORE + 0.35, P), { tone: "faint" }) : "";
    const nap = S(G.disc(0, LEN, R, COVER_F, P), { tone: "hi", inner: end });
    return `<g data-name="cover">${load > 0.05 ? ISO.tinted(PAINT.style, nap) : nap}</g>`;
  };
  const napSvg = (P, phase, load) => ISO.tinted(load > 0.05 ? PAINT.style : "", K.fadedSvg(G.ribsOf(COVER_F, 0, LEN, R + 0.02, 34, P, { fade: [0.1, 0.55], phase, seams: true }), { tone: "faint" }));
  // The cage's end plates at both ends: the far one with its nut (behind the cover), the near one with its spokes and
  // the plastic bearing hub the frame rod runs in (in front of it).
  const farSvg = (P) => ISO.tinted(ISO.T.steel, S(G.disc(-1.1, -0.6, 0.7, COVER_F, P), { tone: "mid" }) + S(G.disc(-0.6, 0, CORE, COVER_F, P), { tone: "mid" }));
  const nearSvg = (P) => {
    const near = G.spokesOf(COVER_F, LEN + 0.6, 0.95, CORE - 0.12, 6, P, { phase: 0.3 });
    return ISO.tinted(ISO.T.steel, S(G.disc(LEN, LEN + 0.6, CORE, COVER_F, P), { tone: "mid", inner: facing(P, COVER_F) ? L(near, { tone: "lo" }) : "" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(LEN + 0.6, LEN + 1.6, 0.9, COVER_F, P), { tone: "mid" }));
  };

  ISO.add({
    name: "paintroller", title: "Paint roller (3 steps)", compare: "paintroller 480 270 420", steps: STEPS,
    about: "Paint roller (frame, cage, 9 in nap cover, handle with a threaded end for a pole) and a tray with paint in its well and a ribbed ramp: load it, roll it on the ramp, roll a W on the wall.",
    line: "paintroller cx cy width step=0..3 lab=1 lit=cover|ramp|paint|wall|handle",
    demo: { line: "paintroller 480 270 420", script: [1, 2, 3].map((n) => ({ set: { step: n }, hold: "settle" })) },
    make([cx, cy, width = 420], o, t, parent) {
      const lab = o.lab !== "0", W = width * 2.2, H = width * 1.2;
      const { P, g } = ISO.frame([[-24, -38, -3], [74, -38, -3], [-24, 18, -3], [74, 18, -3], [-24, -38, 58], [74, -38, 58]], cx, cy, W, H, { azimuth: 62, elevation: 24 }, parent);
      g.innerHTML = `<g>${roomSvg(P)}</g><g data-part="band"></g><g>${trayBackSvg(P)}</g><g data-slot="in"></g><g>${trayFrontSvg(P)}</g><g data-slot="out"></g><g>${canSvg(P, lab)}</g><g data-part="words"></g>` +
        `<g data-part="roller"><g>${farSvg(P)}</g><g data-part="cover"></g><g data-part="nap"></g><g>${nearSvg(P)}</g><g data-part="frame"></g></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), roller = q("roller"), slotIn = g.querySelector('[data-slot="in"]'), slotOut = g.querySelector('[data-slot="out"]'), w = ISO.writer();
      slotIn.append(roller);
      if (lab) {
        const word = (p, txt, anchor = "middle", dy = 0) => ISO.word(K.iso(p, P), txt, "#444", { anchor, size: 13, dy });
        q("words").innerHTML = word([x1 + 1.5, WELL[0] - 0.6, RIM], "Paint well", "start", -4) + word([x1 + 0.6, 2, 0], "Ribbed ramp", "end", 18) + word([-21, WALL_Y, 53], "Wall", "start", 0);
      }
      const cur = { step: 0, from: zero(), t: 1e9, label: "" };
      const n0 = ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 3);
      if (n0) { cur.step = n0; cur.from = startOf(n0); }
      let lastLit = null;
      const draw = (s) => {
        // In the tray the roller sits between its side plates; out of it, in front of everything.
        const inTray = s.p[1] > WELL[0] - 2 && s.p[2] < RIM + R + 2;
        if (inTray !== (roller.parentNode === slotIn)) (inTray ? slotIn : slotOut).append(roller);
        w.attr(roller, "transform", K.translateAlong(P, s.p.map((v, i) => v - R0[i])));
        w.rebuild(q("frame"), s.psi.toFixed(2), () => frameSvg(P, s.psi));
        const phase = Math.round((-(s.p[1] + s.p[2]) / R) * 16) / 16;   // nap ribs step on a quantised turn
        w.rebuild(q("cover"), `${s.load > 0.05}`, () => coverSvg(P, s.load));
        w.rebuild(q("nap"), `${phase} ${s.load > 0.05}`, () => napSvg(P, phase, s.load));
        w.rebuild(q("band"), s.w.toFixed(2), () => bandSvg(P, s.w));
        const want = STEPS[cur.step - 1]?.lit || o.lit || "";
        if (want !== lastLit || q("cover")._fresh || q("frame")._fresh) { lastLit = want; const parts = [...g.querySelectorAll("[data-name]")]; w.light(parts, parts.filter((p) => p.dataset.name === want)); }
      };
      let last = cur.from;
      g.set = (p) => {
        if (p.step === undefined) return;
        cur.step = ISO.clamp(Math.round(+p.step), 0, 3); cur.from = startOf(Math.max(1, cur.step)); cur.t = cur.step ? 0 : 1e9;
      };
      g.update = (dt) => {
        cur.t += dt;
        const s = cur.step ? poseAt(cur.step, cur.from, ISO.still() ? 1e9 : cur.t) : cur.from;
        last = s; cur.label = s.label || "";
        draw(s);
        return cur.step > 0 && cur.t < lengthOf(cur.step) + 0.2;
      };
      g.readout = () => {
        // Painted area: a level 23 cm cover sweeps 23 cm × the height it travels (overlaps counted once per stroke).
        const area = areaOf(last.w);
        if (cur.step === 3) return `${cur.label} · ${area.toFixed(2)} m² covered`;
        return cur.label || "9 in (23 cm) roller, 3/8 in nap · tray well holds the paint, the ramp spreads it";
      };
      g.update(0);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
