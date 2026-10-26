// "hangframe cx cy size step=0..5 lab=1 lit=wall|tape|finder|level|hook|hammer|frame" — hanging a picture frame on
// drywall, as one Anatomy-style model in five steps, one step on the screen at a time. A section of a painted interior
// wall: 2×4 studs (1½ × 3½ in) 16 in (40.6 cm) apart behind ½ in drywall, a baseboard, an outlet and a light switch,
// the rows of drywall screws over each stud showing faintly through the paint. A 20 × 16 in frame whose wire peaks
// 3 in below its top edge hangs with its centre at 57 in (the usual eye height) when its hook is at 62 in.
//   1 a tape measure hooked on the floor reads 62 in and a pencil marks the wall;
//   2 a stud finder slides along at that height, its LEDs light over the stud (the drywall goes see-through), and the
//     stud's centre is marked, 10 cm right of the first mark;
//   3 a level along the two marks settles to level, and the nail spot is marked on the stud;
//   4 a picture hook goes on the mark and a hammer drives its nail in at 45° into the stud, in three blows;
//   5 the frame comes down onto the hook, hangs a little crooked, and is nudged level, a small level on its top.
// Each step zooms to the part it works on (the whole wall for the tape) and shows only its own tool; what a step
// leaves behind (the marks, the hook, the frame) stays. set({ step }). World units: 1 = 1 cm, x along the wall, y
// out of it into the room, z up.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const IN = 2.54, OC = 16 * IN, SW = 3.8, SD = 8.9, DW = 1.27, X0 = -75, X1 = 75, HZ = 200;
  const STUDS = [-1.5, -0.5, 0.5, 1.5].map((k) => k * OC), STUD = STUDS[2];        // the stud the frame hangs on
  const HOOK_Z = 62 * IN, MARK_X = STUD - 10, FW = 20 * IN, FH = 16 * IN, DROP = 3 * IN, FT = 2.4;   // hook 62 in, frame 20×16 in
  const FACE = DW;                                                                 // the wall's room face, y = DW
  const WALL = ISO.tint("#f4f1ea", ["#d3cfc5", "#ddd9cf", "#e6e2d9", "#eeebe4"], "#7a776f"), WOOD = ISO.T.wood, STEEL = ISO.T.steel;
  const OAK = ISO.tint("#e9c99a", ["#a8743c", "#b8854b", "#c7975d", "#d6aa72"], "#5a3a14");
  const YEL = ISO.tint("#fbe27a", ["#d9a92a", "#e3b93f", "#ecc856", "#f3d56b"], "#6b5114");
  const FLOOR = { x: X0 - 8, y: -SD - 4, w: X1 - X0 + 16, d: SD + 70, r: 3 };
  const STEPS = [
    { title: "Mark the height", say: "Hook a tape on the floor and mark 62 inches: with the wire 3 inches below the top, the frame's centre lands at 57.", lit: "tape" },
    { title: "Find a stud", say: "Slide a stud finder along at that height; where its lights come on there is a stud behind the drywall.", lit: "finder" },
    { title: "Level the spot", say: "Lay a level across the marks until the bubble sits between the lines, and mark the nail spot on the stud.", lit: "level" },
    { title: "Nail the hook", say: "Hold a picture hook on the mark and tap its nail in, angled down, into the stud.", lit: "hammer" },
    { title: "Hang and level", say: "Hang the wire on the hook and nudge the frame until a level on top reads straight.", lit: "frame" },
  ];

  // ── frames for parts that turn: rot about the y axis in the wall's plane (frame, level), or about x (the hammer)
  const turnY = ([px, pz], a) => ([x, y, z]) => { const c = Math.cos(a), s = Math.sin(a), dx = x - px, dz = z - pz; return [px + dx * c - dz * s, y, pz + dx * s + dz * c]; };
  // a box in a frame: o + e1·u + e3·w + e2·y over the three ranges (ISO.box's own argument order)
  const fbox = (P, o, e1, e2, e3, U, Wr, Y, tone = "mid", map = (p) => p) =>
    ISO.box((u, w, y) => map([0, 1, 2].map((i) => o[i] + e1[i] * u + e3[i] * w + e2[i] * y)), P, U, Wr, Y, tone);
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const onWall = (x, z, dy = 0) => [x, FACE + dy, z];

  // ── the wall (static): floor, framing, drywall with its joint and screws, baseboard, outlet, switch
  function wallSvg(P, alpha) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -3, 3, P)}"/>`, ISO.tinted(WOOD, S(K.slabOf(FLOOR, -3, 0, P, 3, 0.6), { tone: "lo" }))];
    // framing behind: plate and studs (seen through the drywall in step 2, and at the cut top)
    out.push(`<g data-name="studs">${ISO.tinted(WOOD, ISO.wbox(P, [X0, X1], [-SD, 0], [0, 3.8], "lo") + STUDS.map((x) => ISO.wbox(P, [x - SW / 2, x + SW / 2], [-SD, 0], [3.8, HZ], "mid")).join(""))}</g>`);
    // the drywall sheet; its taped joint on the first stud; screws every 30 cm down each stud, showing faintly
    out.push(`<g data-name="wall" opacity="${alpha.toFixed(2)}">${ISO.tinted(WALL, ISO.wbox(P, [X0, X1], [0, DW], [0.5, HZ], "hi"))}`);
    const j = STUDS[0];
    out.push(`<path d="${K.pathOf([[j - 2.5, 0.5], [j + 2.5, 0.5], [j + 2.5, HZ], [j - 2.5, HZ]].map(([x, z]) => K.iso(onWall(x, z, 0.02), P)), true)}" fill="#ece8de" stroke="none"/>`);
    const heads = [];
    for (const x of STUDS) for (let z = 20; z < HZ - 8; z += 30) heads.push(K.iso(onWall(x, z, 0.03), P));
    out.push(`<g style="--anatomy-dot:#c9c4b8">${D(heads, { size: 0.55, tone: "lo" })}</g></g>`);
    // baseboard with its moulded top, nailed to the plate
    out.push(ISO.tinted(WALL, ISO.wbox(P, [X0, X1], [DW, DW + 1.5], [0, 10], "mid") + ISO.wbox(P, [X0, X1], [DW, DW + 0.9], [10, 11.2], "hi")));
    out.push(D([-50, -10, 30, 60].map((x) => K.iso([x, DW + 1.51, 6], P)), { size: 0.4 }));
    // a duplex outlet near the floor and a light switch by the edge: their plates, faces, slots and screws
    const plate = (x, z, w, h) => ISO.tinted(WALL, ISO.wbox(P, [x - w / 2, x + w / 2], [DW, DW + 0.5], [z - h / 2, z + h / 2], "hi"));
    out.push(plate(-38, 30, 7, 11.4));
    for (const z of [27.2, 32.8]) {
      out.push(ISO.tinted(WALL, ISO.wbox(P, [-40.2, -35.8], [DW + 0.5, DW + 0.9], [z - 1.8, z + 1.8], "mid")));
      out.push(`<path d="${[-39.2, -36.8].map((x) => K.pathOf([K.iso([x, DW + 0.92, z + 0.2], P), K.iso([x, DW + 0.92, z + 1.2], P)])).join("")}" stroke="#55534c" stroke-width="0.9" stroke-linecap="round"/>`);
      out.push(D([K.iso([-38, DW + 0.92, z - 1], P)], { size: 0.45, tone: "hi" }));
    }
    out.push(D([K.iso([-38, DW + 0.52, 30], P)], { size: 0.5 }));
    out.push(plate(-62, 120, 7, 11.4) + ISO.tinted(WALL, ISO.wbox(P, [-62.8, -61.2], [DW + 0.5, DW + 1.6], [119.2, 122.6], "hi")));
    out.push(D([K.iso([-62, DW + 0.52, 115.6], P), K.iso([-62, DW + 0.52, 124.4], P)], { size: 0.45 }));
    return out.join("");
  }

  // ── pencil marks: a small cross at the height, a tick at the stud's centre, the nail spot (each fades in)
  const markSvg = (P, x, z, k, a) => {
    if (a <= 0.01) return "";
    const p = (dx, dz) => K.iso(onWall(x + dx, z + dz, 0.05), P);
    const d = k === "cross" ? K.pathOf([p(-1.4, 0), p(1.4, 0)]) + K.pathOf([p(0, -1.4), p(0, 1.4)]) : k === "tick" ? K.pathOf([p(0, -2.4), p(0, 2.4)]) : K.pathOf([p(-1, -1), p(1, 1)]) + K.pathOf([p(-1, 1), p(1, -1)]);
    return `<path d="${d}" fill="none" stroke="#4a4a4a" stroke-width="0.9" stroke-linecap="round" opacity="${a.toFixed(2)}"/>`;
  };

  // ── 1 the tape measure: case held on the wall at the mark, blade down to its hook on the floor, inch ticks
  function tapeSvg(P, out) {
    const x = MARK_X + 3.2, top = HOOK_Z + 1.2, low = top - out * (top - 0.4), y0 = FACE + 0.15, out_ = [];
    const blade = ISO.tinted(YEL, ISO.wbox(P, [x - 1.27, x + 1.27], [y0, y0 + 0.12], [low, top], "hi"));
    out_.push(blade);
    // inch ticks from the blade's left edge (feet longer), only on the blade that is out
    const ticks = [];
    for (let i = 1; i * IN < top - low - 0.2; i++) {
      const z = low + i * IN, len = i % 12 === 0 ? 1.8 : i % 6 === 0 ? 1.2 : 0.7;
      ticks.push(K.pathOf([K.iso([x - 1.27, y0 + 0.13, z], P), K.iso([x - 1.27 + len, y0 + 0.13, z], P)]));
    }
    out_.push(`<path d="${ticks.join("")}" fill="none" stroke="#3a3216" stroke-width="0.45"/>`);
    // the hook: a bent steel tab at the blade's end, its foot on the floor
    out_.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 1.4, x + 1.4], [y0, y0 + 1.3], [low - 0.4, low], "mid") + ISO.wbox(P, [x - 1.4, x + 1.4], [y0 + 1.1, y0 + 1.3], [low - 0.4, low + 0.9], "hi")));
    // the case above: body, drum boss, belt clip on the wall side, thumb lock, rivets
    const cz = top + 3.6;
    out_.push(ISO.tinted(YEL, ISO.wbox(P, [x - 4, x + 4], [y0 + 0.4, y0 + 4.2], [top - 0.2, cz + 4.2], "mid")));
    out_.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 4.2, x + 4.2], [y0 + 4.2, y0 + 4.6], [top - 0.4, cz + 4.4], "mid")));
    out_.push(ISO.tinted(STEEL, S(G.disc(0, 0.6, 2.6, G.frameAlong([x, y0 + 4.6, cz], [0, 1, 0]), P, { steps: 28 }), { tone: "hi" })));
    out_.push(D([K.iso([x, y0 + 5.21, cz], P)], { size: 0.5, tone: "hi" }));
    out_.push(ISO.tinted(ISO.T.red, ISO.wbox(P, [x + 1.4, x + 3], [y0 + 1.2, y0 + 3.2], [cz + 4.2, cz + 5], "hi")));
    out_.push(D([[x - 3.2, cz - 3.2], [x + 3.2, cz - 3.2], [x - 3.2, cz + 3.4], [x + 3.2, cz + 3.4]].map(([a, b]) => K.iso([a, y0 + 4.61, b], P)), { size: 0.35 }));
    return out_.join("");
  }
  // the pencil, writing on the wall at (x, z): a hex body, its painted end, ferrule and eraser, the cone and the lead
  function pencilSvg(P, x, z, lift) {
    const tip = onWall(x, z, 0.1 + lift), dir = G.unit3([0.35, 0.75, 0.55]), F = G.frameAlong(tip, dir), out = [];
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[0, 0], [0.5, 0.12, 1], [0.6, 0.15]], F, P, { steps: 12 }), { tone: "mid" })));
    out.push(ISO.tinted(WOOD, S(G.lathe([[0.6, 0.15], [2.2, 0.38, 1], [2.3, 0.4]], F, P, { steps: 12 }), { tone: "hi" })));
    out.push(ISO.tinted(YEL, S(G.lathe([[2.3, 0.4], [2.3, 0.45], [15, 0.45], [15, 0]], F, P, { steps: 6 }), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, S(G.disc(15, 16.2, 0.47, F, P, { steps: 12 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.red, S(G.lathe([[16.2, 0], [16.2, 0.44], [17.3, 0.42, 1], [17.6, 0]], F, P, { steps: 12 }), { tone: "hi" })));
    return out.join("");
  }

  // ── 2 the stud finder: a grip body on the wall, its sensing pad, 8 LEDs that light over the wood, a button
  function finderSvg(P, x, z, on) {
    const y0 = FACE + 0.1, out = [];
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 4.2, x + 4.2], [y0, y0 + 0.6], [z - 7.5, z + 7.5], "lo")));
    out.push(ISO.tinted(ISO.T.blue, ISO.wbox(P, [x - 3.8, x + 3.8], [y0 + 0.6, y0 + 3.4], [z - 7, z + 6], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 2.6, x + 2.6], [y0 + 3.4, y0 + 3.6], [z + 0.5, z + 4.5], "mid")));
    // grip ridges across the lower body, each from side to side of the face
    out.push(L([-5.5, -4.5, -3.5, -2.5].map((dz) => K.pathOf([K.iso([x - 3.8, y0 + 3.41, z + dz], P), K.iso([x + 3.8, y0 + 3.41, z + dz], P)])).join(""), { tone: "faint" }));
    // the LED row and the centre notch on the top edge: the stud's centre is under the notch when all are lit
    const leds = Array.from({ length: 8 }, (_, i) => -2.1 + i * 0.6);
    out.push(leds.map((dx, i) => `<circle cx="${K.iso([x + dx, y0 + 3.62, z + 2.5], P)[0].toFixed(1)}" cy="${K.iso([x + dx, y0 + 3.62, z + 2.5], P)[1].toFixed(1)}" r="${(0.24 * G.scaleOf(P)).toFixed(2)}" fill="${i < on ? "#ff6b3d" : "#4a4f57"}" stroke="#1d1f22" stroke-width="0.3"/>`).join(""));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 0.35, x + 0.35], [y0 + 0.6, y0 + 3.4], [z + 6, z + 7.4], "hi")));
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, 0.4, 0.9, G.frameAlong([x, y0 + 3.4, z - 2.5], [0, 1, 0]), P, { steps: 16 }), { tone: "hi" })));
    return out.join("");
  }

  // ── 3 the level, turned by a in the wall's plane about its centre: aluminium body, rubber ends, the centre vial
  // window with its two lines and the bubble (which runs to the high side), a plumb vial and a hand hole
  function levelSvg(P, c, len, a, big = true) {
    const m = turnY([c[0], c[2]], a), y0 = FACE + (big ? 0.2 : c[1] - FACE), h = big ? 4.2 : 2.6, t = big ? 2.6 : 1.8, half = len / 2, out = [];
    const bx = (U, Wr, Yr, tint, tone) => ISO.tinted(tint, ISO.box((u, w, y) => m([c[0] + u, y0 + y, c[2] + w]), P, U, Wr, Yr, tone));
    out.push(bx([-half + 1.6, half - 1.6], [-h / 2, h / 2], [0, t], STEEL, "mid"));
    out.push(bx([-half, -half + 1.6], [-h / 2 - 0.2, h / 2 + 0.2], [0, t + 0.2], ISO.T.rubber, "mid") + bx([half - 1.6, half], [-h / 2 - 0.2, h / 2 + 0.2], [0, t + 0.2], ISO.T.rubber, "mid"));
    out.push(bx([-3, 3], [-h / 2 + 0.6, h / 2 - 0.6], [t, t + 0.25], ISO.T.plastic, "mid"));
    out.push(bx([-2.4, 2.4], [-h / 2 + 0.9, h / 2 - 0.9], [t + 0.25, t + 0.4], YEL, "hi"));
    const p = (u, w) => K.iso(m([c[0] + u, y0 + t + 0.42, c[2] + w]), P);
    out.push(`<path d="${[-0.9, 0.9].map((u) => K.pathOf([p(u, -h / 2 + 0.9), p(u, h / 2 - 0.9)])).join("")}" stroke="#1d1f22" stroke-width="0.5"/>`);
    // the bubble: 1 mm of travel per 0.1° near level, to its stop at 2.2 cm
    const off = ISO.clamp(-a * 180 / Math.PI * 0.9, -1.8, 1.8), b = p(off, 0), r = 0.55 * G.scaleOf(P);
    out.push(`<ellipse cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" rx="${(r * 1.5).toFixed(2)}" ry="${(r * 0.8).toFixed(2)}" fill="#f4fbe8" stroke="#55702a" stroke-width="0.4"/>`);
    if (big) {
      out.push(bx([half - 6.5, half - 4.5], [-h / 2 + 0.6, h / 2 - 0.6], [t, t + 0.3], YEL, "hi"));
      out.push(bx([-half + 4, -half + 10], [-0.6, 0.6], [t, t + 0.05], ISO.T.plastic, "lo"));
    }
    return out.join("");
  }

  // ── 4 the picture hook: a bent brass plate on the wall, its nail through the sleeve at 45° down into the stud,
  // driven in by `depth` (0 = only touching, 1 = home)
  const NAIL = G.unit3([0, -1, -1]), NAIL_LEN = 3.2;
  const nailHead = (depth) => G.add3(onWall(STUD, HOOK_Z + 1.4, 0.55), G.mul3(NAIL, -(1 - depth) * (NAIL_LEN - 0.9)));
  function hookSvg(P, depth) {
    const out = [], x = STUD, z = HOOK_Z;
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [x - 1, x + 1], [FACE, FACE + 0.18], [z - 0.6, z + 2.2], "hi")));
    // the cup the wire sits in: a lip bent out and up at the bottom
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [x - 1, x + 1], [FACE, FACE + 0.9], [z - 0.8, z - 0.6], "mid") + ISO.wbox(P, [x - 1, x + 1], [FACE + 0.75, FACE + 0.95], [z - 0.8, z + 0.3], "hi")));
    // the sleeve the nail goes through, and the nail: shank out of the wall, then its head
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [x - 0.45, x + 0.45], [FACE + 0.18, FACE + 0.6], [z + 1, z + 1.9], "mid")));
    const head = nailHead(depth), F = G.frameAlong(head, NAIL), shown = Math.max(0.3, (1 - depth) * (NAIL_LEN - 0.9) + 0.6);
    out.push(ISO.tinted(STEEL, S(G.disc(0, shown, 0.12, F, P, { steps: 8 }), { tone: "hi" }) + S(G.disc(-0.15, 0, 0.32, F, P, { steps: 14 }), { tone: "hi" })));
    return out.join("");
  }
  // the hammer, swung by `swing` (0 = its face on the nail head, 1 = drawn back), held from the side the way a small
  // nail is tapped: the head on the nail's axis, the handle out to the right along the wall, the swing turning both
  // about the wrist in the plane they share; steel head and neck, round striking face toward the nail, two claws behind
  function hammerSvg(P, depth, swing) {
    const head0 = nailHead(depth), face = G.mul3(NAIL, -1), hdir = G.unit3([1, 0.15, -0.3]);
    const hc = G.add3(head0, G.mul3(face, 3.4)), wrist = G.add3(hc, G.mul3(hdir, 27));
    const k = G.unit3(G.cross3(face, hdir)), a = -swing * 0.7, c = Math.cos(a), sn = Math.sin(a);
    const m = (p) => { const v = G.sub3(p, wrist), kv = G.cross3(k, v), d = G.dot3(k, v); return G.add3(wrist, [0, 1, 2].map((i) => v[i] * c + kv[i] * sn + k[i] * d * (1 - c))); };
    const side = G.unit3(G.cross3(hdir, face)), out = [];
    // the handle: wood with a rubber grip toward the wrist
    out.push(ISO.tinted(WOOD, fbox(P, hc, side, face, hdir, [-0.7, 0.7], [1.4, 19], [-0.55, 0.55], "mid", m)));
    out.push(ISO.tinted(ISO.T.rubber, fbox(P, hc, side, face, hdir, [-0.85, 0.85], [19, 28], [-0.7, 0.7], "mid", m)));
    // head: a steel bar along the nail's axis, the striking face (a disc) toward the nail, the claws away from it
    out.push(ISO.tinted(STEEL, fbox(P, hc, side, hdir, face, [-1.1, 1.1], [-2.4, 3.6], [-1.1, 1.4], "hi", m)));
    const fc = m(G.add3(hc, G.mul3(face, -2.4))), fdir = G.unit3(G.sub3(m(G.add3(hc, G.mul3(face, -3.4))), fc));
    out.push(ISO.tinted(STEEL, S(G.disc(0, 1, 1.25, G.frameAlong(fc, fdir), P, { steps: 20 }), { tone: "hi" })));
    for (const sx of [-0.55, 0.55]) out.push(ISO.tinted(STEEL, fbox(P, G.add3(hc, G.mul3(side, sx)), side, hdir, face, [-0.4, 0.4], [3.6, 7.4], [-0.9, 0.2], "mid", (p) => m(G.add3(p, G.mul3(hdir, -(G.dot3(G.sub3(p, hc), face) - 3.6) * 0.35))))));
    return out.join("");
  }

  // ── 5 the frame, hanging from the hook point turned by a: moulding bars round a white mat, a painted picture
  // (sky, hills, a sun) behind glass, its depth out from the wall, the wire's ends on two D-rings behind
  const HANG = [STUD, HOOK_Z - 0.2];
  function frameSvg(P, a, lift, out_) {
    const top = HOOK_Z + DROP, x0 = STUD - FW / 2, x1 = STUD + FW / 2, z0 = top - FH, z1 = top;
    const m = (p) => { const q = turnY(HANG, a)(p); return [q[0], q[1] + out_, q[2] + lift]; };
    const y0 = FACE + 0.1, y1 = y0 + FT, out = [];
    const bx = (X_, Z_, Y_, tint, tone) => ISO.tinted(tint, ISO.box((u, w, y) => m([u, y, w]), P, X_, Z_, Y_, tone));
    // the back board (seen at the edges) and the four moulding bars, mitre seams at the corners
    out.push(bx([x0 + 1, x1 - 1], [z0 + 1, z1 - 1], [y0, y0 + 0.4], WOOD, "lo"));
    const B = 3.2;
    out.push(bx([x0, x1], [z0, z0 + B], [y0, y1], OAK, "mid") + bx([x0, x0 + B], [z0 + B, z1 - B], [y0, y1], OAK, "mid") + bx([x1 - B, x1], [z0 + B, z1 - B], [y0, y1], OAK, "mid") + bx([x0, x1], [z1 - B, z1], [y0, y1], OAK, "mid"));
    const f = (x, z) => K.iso(m([x, y1 + 0.01, z]), P);
    out.push(`<path d="${[[x0, z0, x0 + B, z0 + B], [x1, z0, x1 - B, z0 + B], [x0, z1, x0 + B, z1 - B], [x1, z1, x1 - B, z1 - B]].map(([a1, b1, a2, b2]) => K.pathOf([f(a1, b1), f(a2, b2)])).join("")}" stroke="#5a3a14" stroke-width="0.5"/>`);
    // the mat, the picture's window and the picture in it
    out.push(bx([x0 + B, x1 - B], [z0 + B, z1 - B], [y0, y1 - 0.6], ISO.tint("#fbfaf6", ["#d6d3ca", "#e0ddd4", "#e9e6de", "#f2f0ea"], "#8a877f"), "hi"));
    const px0 = x0 + B + 3.2, px1 = x1 - B - 3.2, pz0 = z0 + B + 3.2, pz1 = z1 - B - 3.2, pf = (x, z) => K.iso(m([x, y1 - 0.58, z]), P);
    out.push(`<path d="${K.pathOf([pf(px0, pz0), pf(px1, pz0), pf(px1, pz1), pf(px0, pz1)], true)}" fill="#cfe7f5" stroke="#6a8aa0" stroke-width="0.4"/>`);
    const hill = (zs, col) => `<path d="${K.pathOf([pf(px0, pz0), ...zs.map(([u, h]) => pf(px0 + u * (px1 - px0), pz0 + h * (pz1 - pz0))), pf(px1, pz0)], true)}" fill="${col}" stroke="none"/>`;
    out.push(hill([[0, 0.42], [0.18, 0.55], [0.4, 0.38], [0.62, 0.5], [0.85, 0.34], [1, 0.4]], "#a9cf8f") + hill([[0, 0.22], [0.3, 0.3], [0.55, 0.18], [0.8, 0.26], [1, 0.2]], "#7fb36a"));
    const sun = pf(px0 + 0.74 * (px1 - px0), pz0 + 0.76 * (pz1 - pz0));
    out.push(`<circle cx="${sun[0].toFixed(1)}" cy="${sun[1].toFixed(1)}" r="${(2.1 * G.scaleOf(P)).toFixed(2)}" fill="#f6c945" stroke="#c89a1f" stroke-width="0.4"/>`);
    // glass: one pale glint across the window, ending on its sides
    out.push(`<path d="${K.pathOf([pf(px0 + 2, pz1), pf(px0 + 9, pz0 + 2)])}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>`);
    return out.join("");
  }

  // ── pose and steps (as tyrechange): each step is a list of moves from the pose the step before left
  const zero = () => ({ tape: 0, pencil: 0, m1: 0, finder: 0, fx: MARK_X - 26, see: 0, m2: 0, level: 0, tilt: -0.07, m3: 0,
    hook: 0, nail: 0, hammer: 0, swing: 1, frame: 0, flift: 14, fout: 10, ftilt: 0.1, flevel: 0, zoom: 0, label: "" });
  const clone = (s) => ({ ...s });
  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  function movesOf(step) {
    const m = [], go = (t, set, label = "") => m.push({ t, set, label });
    if (step === 1) {
      go(0.6, { zoom: 0, tape: 0.001 }, "tape hooked on the floor");
      go(1.4, { tape: 1 }, `blade up the wall to ${62} in`);
      go(0.5, { pencil: 1 }, "pencil at the 62 in mark");
      go(0.7, { m1: 1 }, "marked: 62 in (157 cm) up");
      go(0.6, { pencil: 0.6 }, "hook at 62 in · frame 16 in tall, wire 3 in below its top → centre at 57 in");
    }
    if (step === 2) {
      go(0.9, { zoom: 1, tape: 0, pencil: 0, m1: 1, finder: 1, see: 0.55 }, "stud finder on the wall, left of the mark");
      go(2.2, { fx: STUD }, "sliding right: LEDs light as the stud comes under it");
      go(0.6, { m2: 1 }, `stud found: its centre ${Math.round(STUD - MARK_X)} cm right of the mark · studs are 16 in apart`);
      go(0.5, {}, "stud centre marked");
    }
    if (step === 3) {
      go(0.7, { zoom: 1, finder: 0, see: 0, level: 1, tilt: -0.07 }, "level across the marks");
      go(1.6, { tilt: 0 }, "bubble moving between the lines");
      go(0.6, { m3: 1 }, "level: nail spot marked on the stud");
      go(0.5, {}, "nail spot at 62 in, on the stud");
    }
    if (step === 4) {
      go(0.6, { zoom: 1, level: 0, hook: 1, hammer: 1, swing: 1, nail: 0 }, "hook held on the mark, nail in its sleeve");
      for (const [n, d] of [[1, 0.35], [2, 0.7], [3, 1]]) { go(0.28, { swing: 0, nail: d }, `blow ${n} of 3`); go(0.42, { swing: 1 }, `blow ${n} of 3`); }
      go(0.5, { swing: 1 }, "nail home at 45° into the stud: a hook like this holds about 30 lb (14 kg)");
    }
    if (step === 5) {
      go(0.6, { zoom: 1, hammer: 0, frame: 1, flift: 14, fout: 10, ftilt: 0.1 }, "frame lifted over the hook");
      go(1.2, { fout: 0, flift: 0 }, "wire on the hook · the frame hangs a little crooked");
      go(0.4, { flevel: 1 }, "small level on its top");
      go(1.4, { ftilt: 0 }, "nudged until the bubble is between the lines");
      go(0.6, {}, "straight: the frame's centre at 57 in, on a stud");
    }
    return m;
  }
  function poseAt(step, s0, t) {
    let s = clone(s0), clock = 0;
    for (const move of movesOf(step)) {
      const end = { ...s, ...move.set }, k = ease((t - clock) / move.t);
      if (t >= clock) { s = k >= 1 ? end : Object.fromEntries(Object.keys(s).map((key) => [key, typeof s[key] === "number" ? s[key] + (end[key] - s[key]) * k : end[key]])); s.label = move.label; }
      clock += move.t;
      if (t < clock) break;
    }
    return s;
  }
  const lengthOf = (step) => movesOf(step).reduce((a, m) => a + m.t, 0);
  const startOf = (step) => { let s = zero(); for (let i = 1; i < step; i++) s = poseAt(i, s, 1e9); return s; };
  let uid = 0;

  ISO.add({
    name: "hangframe", title: "Hang a picture frame (5 steps)", compare: null, steps: STEPS,
    about: "A drywall wall with studs behind it: mark 62 in with a tape, find a stud, level the nail spot, nail a picture hook into the stud, hang the frame and level it; one step on the screen at a time.",
    line: "hangframe cx cy size step=0..5 lab=1 lit=wall|tape|finder|level|hook|hammer|frame",
    demo: { line: "hangframe 480 270 520", script: [1, 2, 3, 4, 5].map((n) => ({ set: { step: n }, hold: "settle" })) },
    make([cx, cy, size = 520], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, H = size, id = `hf${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -3, 0), [X0, -SD, HZ], [X1, DW, HZ], [X1, FLOOR.y + FLOOR.d, 0]], cx, cy, W, H, { azimuth: 66, elevation: 16 }, parent);
      // the view: the whole wall (step 1) or the upper wall round the hook (2–5), as one transform, clipped to the frame
      const near = K.iso([STUD - 5, FACE, HOOK_Z - 4], P), whole = [W / 2, H / 2], ZOOM = 3.4;
      g.innerHTML = `<defs><clipPath id="${id}c"><rect x="0" y="0" width="${W.toFixed(1)}" height="${H.toFixed(1)}"/></clipPath></defs><g clip-path="url(#${id}c)"><g data-part="cam">` +
        `<g data-part="wall"></g><g data-part="marks"></g><g data-name="hook"></g><g data-name="tape"></g><g data-name="finder"></g><g data-name="level"></g>` +
        `<g data-name="frame"></g><g data-name="hammer"></g><g data-part="words"></g></g></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`);
      const el = Object.fromEntries(["cam", "wall", "marks", "hook", "tape", "finder", "level", "frame", "hammer", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      // the wall is the big static part: its own build part, so the first one stays small (ISO.later)
      let wallSee = -1;
      const wall = (see) => { const k = Math.round(see * 20) / 20; if (k !== wallSee) { wallSee = k; el.wall.innerHTML = wallSvg(P, 1 - 0.7 * k); } };
      ISO.later(() => wall(0));
      const draw = (s, step) => {
        const z = s.zoom, k = 1 + (ZOOM - 1) * z, fx = whole[0] + (near[0] - whole[0]) * z, fy = whole[1] + (near[1] - whole[1]) * z;
        w.attr(el.cam, "transform", `translate(${(W / 2 - k * fx).toFixed(2)} ${(H / 2 - k * fy).toFixed(2)}) scale(${k.toFixed(4)})`);
        if (wallSee >= 0) wall(s.see);
        w.rebuild(el.marks, `${s.m1.toFixed(2)} ${s.m2.toFixed(2)} ${s.m3.toFixed(2)}`, () => markSvg(P, MARK_X, HOOK_Z, "cross", s.m1) + markSvg(P, STUD, HOOK_Z - 6, "tick", s.m2) + markSvg(P, STUD, HOOK_Z, "x", s.m3));
        w.rebuild(el.tape, s.tape > 0.002 ? `${s.tape.toFixed(3)} ${s.pencil.toFixed(2)}` : "", () => s.tape > 0.002 ? tapeSvg(P, s.tape) + (s.pencil > 0.01 ? `<g opacity="${s.pencil.toFixed(2)}">${pencilSvg(P, MARK_X, HOOK_Z, (1 - s.pencil) * 3)}</g>` : "") : "");
        w.rebuild(el.finder, s.finder > 0.01 ? `${s.fx.toFixed(2)}` : "", () => {
          if (s.finder <= 0.01) return "";
          // LEDs: how much of the stud lies under the 4.8 cm sensing pad, centred under the notch
          const cover = Math.max(0, Math.min(s.fx + 2.4, STUD + SW / 2) - Math.max(s.fx - 2.4, STUD - SW / 2)) / SW;
          return finderSvg(P, s.fx, HOOK_Z - 6, Math.round(cover * 8));
        });
        w.attr(el.finder, "opacity", Math.min(1, s.finder * 1.5).toFixed(2));
        w.rebuild(el.level, s.level > 0.01 ? s.tilt.toFixed(4) : "", () => (s.level > 0.01 ? levelSvg(P, [(MARK_X + STUD) / 2, FACE, HOOK_Z + 3.2], 40, s.tilt) : ""));
        w.attr(el.level, "opacity", Math.min(1, s.level * 1.5).toFixed(2));
        w.rebuild(el.hook, s.hook > 0.01 ? s.nail.toFixed(3) : "", () => (s.hook > 0.01 ? hookSvg(P, s.nail) : ""));
        w.attr(el.hook, "opacity", Math.min(1, s.hook * 1.5).toFixed(2));
        w.rebuild(el.hammer, s.hammer > 0.01 ? `${s.nail.toFixed(3)} ${s.swing.toFixed(3)}` : "", () => (s.hammer > 0.01 ? hammerSvg(P, s.nail, s.swing) : ""));
        w.attr(el.hammer, "opacity", Math.min(1, s.hammer * 1.5).toFixed(2));
        w.rebuild(el.frame, s.frame > 0.01 ? `${s.ftilt.toFixed(4)} ${s.flift.toFixed(2)} ${s.fout.toFixed(2)} ${s.flevel.toFixed(2)}` : "", () => {
          if (s.frame <= 0.01) return "";
          const lv = s.flevel > 0.01 ? `<g opacity="${s.flevel.toFixed(2)}">${levelSvg(P, turnY(HANG, s.ftilt)([STUD, FACE + 0.1 + FT + s.fout, HOOK_Z + DROP + 1.3 + s.flift]), 24, s.ftilt, false)}</g>` : "";
          return frameSvg(P, s.ftilt, s.flift, s.fout) + lv;
        });
        w.attr(el.frame, "opacity", Math.min(1, s.frame * 1.5).toFixed(2));
        const words = !lab ? [] : step === 1 && s.m1 > 0.5 ? [[[MARK_X + 6, FACE, HOOK_Z + 6], "62 in from the floor", "#1f4f8f", "start"], [[MARK_X - 3, FACE, HOOK_Z], "pencil mark", "#444", "end"]]
          : step === 2 && s.see > 0.2 ? [[[STUD + 4, FACE, HOOK_Z + 12], s.m2 > 0.5 ? "stud found: all lights on" : "stud finder", "#8f2a22", "start"], [[STUD + 22, FACE, HOOK_Z - 24], "stud behind the drywall", "#7a5a2e", "start"]]
          : step === 3 && s.level > 0.5 ? [[[(MARK_X + STUD) / 2, FACE, HOOK_Z + 9], s.tilt === 0 ? "bubble between the lines: level" : "bubble off to the high end", s.tilt === 0 ? "#2c6a22" : "#8f2a22", "middle"]]
          : step === 4 && s.hook > 0.5 ? [[[STUD - 9, FACE, HOOK_Z + 10], "picture hook: nail at 45° into the stud", "#444", "end"]]
          : step === 5 && s.frame > 0.5 ? [[[STUD - FW / 2 - 2, FACE, HOOK_Z - 10], s.ftilt === 0 ? "level: centre at 57 in" : "wire on the hook", "#2c6a22", "end"]] : [];
        w.rebuild(el.words, words.map((x) => x[1]).join("|"), () => words.map(([p, txt, col, anchor]) => ISO.word(K.iso(p, P), txt, col, { size: step > 1 ? 16 / ZOOM : 16, anchor })).join(""));
        const want = o.lit || STEPS[step - 1]?.lit || "";
        const groups = { tape: el.tape, finder: el.finder, level: el.level, hook: el.hook, hammer: el.hammer, frame: el.frame };
        w.light(Object.values(groups), groups[want] ? [groups[want]] : []);
      };
      const cur = { step: 0, from: zero(), t: 1e9, label: "" };
      const n0 = ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 5);
      if (n0) { cur.step = n0; cur.from = startOf(n0); }
      g.set = (p) => {
        if (p.lit !== undefined) o.lit = p.lit;
        if (p.step === undefined) return;
        cur.step = ISO.clamp(Math.round(+p.step), 0, 5); cur.from = startOf(Math.max(1, cur.step)); cur.t = cur.step ? 0 : 1e9;
      };
      g.update = (dt) => {
        cur.t += dt;
        const s = cur.step ? poseAt(cur.step, cur.from, ISO.still() ? 1e9 : cur.t) : cur.from;
        draw(s, cur.step); cur.label = s.label || "";
        return cur.step > 0 && cur.t < lengthOf(cur.step) + 0.2;
      };
      g.readout = () => cur.label || "a drywall wall over studs 16 in apart · step=1..5";
      g.box = [cx - W / 2, cy - H / 2, W, H];     // what shows: the clip, not the zoomed wall behind it (box= fitting)
      g.update(0);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
