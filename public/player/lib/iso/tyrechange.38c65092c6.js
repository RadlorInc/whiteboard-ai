// "tyrechange cx cy size step=0..7" — changing a car wheel, as one Anatomy-style model in seven poses.
// The model is the front-left corner of a car on the road: wing with its wheel arch, the wheel on five studs, a
// bottle jack under the jacking point, an L wrench, the spare standing by, the hubcap used as a tray for the nuts and
// a warning triangle. Each step is a short timeline of moves from the pose the last step left; the part you handle
// in that step is the one lit part. set({ step }) plays a step from the pose the steps before it leave; step=0 is
// the car as it stopped, before anything is done.
// Needs window.K (kit), window.G (kit/lathe.mjs) and the player's mk().
(() => {
  const K = window.K, G = window.G;
  // World units: 1 ≈ 1 cm. The wheel is a 64 cm tyre on a 40 cm rim, five nuts on a 19 cm bolt circle.
  const TYRE_R = 32, RIM_R = 19.5, TYRE_W = 22, BOLT_R = 9.5, NUT_R = 2, WHEEL_Y = -11;
  const LIFT = 9;                       // the tyre clears the road by about 9 cm
  const ARCH = { x: 0, z: TYRE_R, r: 39 };
  const BODY_Y = [-46, 0];
  const JACK = { x: -62, y: -16 }, SILL_Z = 20;
  const TRAY = [-34, 40], SPARE_AT = [118, 34], LIE = [-120, 40], TRI = [-163, -22];
  const STAR = [0, 2, 4, 1, 3];         // tighten across the circle: 1, 3, 5, 2, 4
  const AT = (k) => (90 - k * 72) * Math.PI / 180;   // nut k's angle as you face the wheel, anticlockwise from the right

  const STEPS = [
    { title: "Make it safe", say: "Park on flat ground, handbrake on, hazard lights on. Put the warning triangle out behind the car.", lit: "triangle" },
    { title: "Loosen the nuts", say: "With the wheel still on the ground, loosen each nut half a turn anticlockwise.", lit: "wrench" },
    { title: "Jack it up", say: "Put the jack under the jacking point and raise the car until the tyre is off the ground.", lit: "jack" },
    { title: "Take the wheel off", say: "Take the nuts off and keep them in the hubcap, then pull the wheel straight off.", lit: "wheel" },
    { title: "Fit the spare", say: "Lift the spare onto the studs and put the nuts back on by hand.", lit: "spare" },
    { title: "Lower the car", say: "Lower the jack until the tyre is on the ground again.", lit: "jack" },
    { title: "Tighten in a star", say: "Tighten the nuts in a star pattern, 1, 3, 5, 2, 4, as tight as your car's manual says.", lit: "wrench" },
  ];

  // ── pose: every value the drawing needs. Positions are world offsets from where each part starts.
  const zero = () => ({
    tri: 0, hazard: 0, lift: 0, ram: 0, wrench: { show: 0, at: [0, 60, 20], turn: 0 }, nut: STAR.map(() => [0, 0, 0]), nutTurn: [0, 0, 0, 0, 0],
    wheel: [0, 0, 0], wheelDown: 0, spare: [0, 0, 0], spareUp: 0, label: "",
  });
  const clone = (s) => JSON.parse(JSON.stringify(s));
  const lerp = (a, b, t) => (typeof a === "string" ? (t < 1 ? a : b) : typeof a === "number" ? a + (b - a) * t : Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t)) : Object.fromEntries(Object.keys(a).map((k) => [k, k in b ? lerp(a[k], b[k], t) : a[k]])));
  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  const set = (s, path, v) => { const keys = path.split("."); let o = s; while (keys.length > 1) o = o[keys.shift()]; o[keys[0]] = v; };
  const get = (s, path) => path.split(".").reduce((o, k) => o[k], s);

  // Where the wrench's socket sits for nut k, with the car raised by `lift`.
  const nutAt = (k, lift) => [-Math.cos(AT(k)) * BOLT_R, WHEEL_Y + TYRE_W / 2 + 3.5, TYRE_R + lift + Math.sin(AT(k)) * BOLT_R];
  // The offset that puts nut k in the hubcap tray, from its place on the wheel.
  const inTray = (k) => [TRAY[0] + (k - 2) * 3.2 + Math.cos(AT(k)) * BOLT_R, TRAY[1] - WHEEL_Y - TYRE_W / 2 - 1, 3.4 - TYRE_R - Math.sin(AT(k)) * BOLT_R];

  // Each step: a list of moves, each { t: seconds, set: { path: value } , label }, applied one after another.
  function movesOf(step, s0) {
    const m = [];
    const go = (t, set, label = "") => m.push({ t, set, label });
    if (step === 1) { go(1.2, { tri: 1, hazard: 1 }, "triangle out · hazards on"); go(0.8, {}, "car is safe to work on"); }
    if (step === 2) {
      go(0.7, { "wrench.show": 1, "wrench.at": nutAt(0, 0) }, "wrench on nut 1");
      for (let k = 0; k < 5; k++) {
        if (k) go(0.55, { "wrench.at": nutAt(k, 0) }, `wrench on nut ${k + 1}`);
        go(0.8, { "wrench.turn": Math.PI * (k + 1), [`nutTurn.${k}`]: Math.PI }, `nut ${k + 1} of 5 · ½ turn anticlockwise`);
      }
      go(0.6, { "wrench.show": 0, "wrench.at": [0, 60, 20] }, "all five loose · wheel still on the ground");
    }
    if (step === 3) {
      go(0.8, { ram: 1 }, "jack saddle up to the jacking point");
      const up = { lift: LIFT, wheel: [0, 0, LIFT] };
      for (let k = 0; k < 5; k++) up[`nut.${k}`] = [0, 0, LIFT];
      go(2.2, up, `raising · tyre ${LIFT} cm off the road`);
    }
    if (step === 4) {
      for (let k = 0; k < 5; k++) {
        go(0.35, { [`nut.${k}`]: [0, 9, LIFT] }, `nut ${k + 1} of 5 off`);
        go(0.45, { [`nut.${k}`]: inTray(k) }, `nut ${k + 1} in the hubcap`);
      }
      go(0.9, { wheel: [0, 26, LIFT] }, "wheel pulled straight off the studs");
      go(0.8, { wheel: [-30, 44, 14] }, "flat wheel carried aside");
      go(0.9, { wheel: [LIE[0], LIE[1] - WHEEL_Y, 8] }, "flat wheel carried aside");
      go(0.5, { wheelDown: 1 }, "flat wheel laid down");
    }
    if (step === 5) {
      go(0.7, { spare: [0, 0, 26] }, "spare lifted off the road");
      go(0.5, { spareUp: 1 }, "spare stood up");
      go(1.1, { spare: [-SPARE_AT[0], 26 - SPARE_AT[1] + WHEEL_Y, LIFT] }, "spare lifted to the hub");
      go(0.9, { spare: [-SPARE_AT[0], WHEEL_Y - SPARE_AT[1], LIFT] }, "spare on the studs");
      for (let k = 0; k < 5; k++) {
        go(0.45, { [`nut.${k}`]: [0, 9, LIFT] }, `nut ${k + 1} of 5 picked up`);
        go(0.35, { [`nut.${k}`]: [0, 0, LIFT] }, `nut ${k + 1} on by hand`);
      }
    }
    if (step === 6) {
      const down = { lift: 0, ram: 1, spare: [-SPARE_AT[0], WHEEL_Y - SPARE_AT[1], 0] };
      for (let k = 0; k < 5; k++) down[`nut.${k}`] = [0, 0, 0];
      go(2.2, down, "lowering · tyre back on the road");
      go(0.7, { ram: 0 }, "jack down and clear");
    }
    if (step === 7) {
      go(0.7, { "wrench.show": 1, "wrench.at": nutAt(STAR[0], 0) }, "wrench on nut 1");
      let turn = get(s0, "wrench.turn");
      STAR.forEach((k, i) => {
        if (i) go(0.6, { "wrench.at": nutAt(k, 0) }, `across to nut ${k + 1}`);
        turn -= Math.PI * 0.6;
        go(0.7, { "wrench.turn": turn, [`nutTurn.${k}`]: get(s0, `nutTurn.${k}`) - Math.PI * 1.1 }, `nut ${k + 1} tight · ${i + 1} of 5 in the star`);
      });
      go(0.6, { "wrench.show": 0, "wrench.at": [0, 60, 20] }, "done · check the tyre pressure soon");
    }
    return m;
  }
  // The pose at time t into a step that started from s0.
  function poseAt(step, s0, t) {
    let s = clone(s0), clock = 0;
    for (const move of movesOf(step, s0)) {
      const end = clone(s);
      for (const [path, v] of Object.entries(move.set)) set(end, path, v);
      const k = ease((t - clock) / move.t);
      if (t >= clock) s = k >= 1 ? end : lerp(s, end, k);
      if (t >= clock) s.label = move.label;
      clock += move.t;
      if (t < clock) break;
    }
    return s;
  }
  const lengthOf = (step, s0) => movesOf(step, s0).reduce((a, m) => a + m.t, 0);
  const startOf = (step) => { let s = zero(); for (let i = 1; i < step; i++) s = poseAt(i, s, 1e9); return s; };

  // ── drawing helpers
  const S = (paths, style) => K.solidSvg(paths, style), L = (d, style) => K.lineSvg(d, style), D = (pts, style) => K.dotsSvg(pts, style);
  const tint = (top, shades, edge) =>
    `--anatomy-paper:${top};--anatomy-top:${top};--anatomy-face:${top};--anatomy-lit-top:${top};--anatomy-lit-shade:${shades[2]};` +
    shades.map((c, i) => `--anatomy-shade-${i}:${c}`).join(";") + `;--anatomy-hi:${edge};--anatomy-mid:${edge};--anatomy-lo:${edge}aa;--anatomy-faint:${edge}55`;
  const RUBBER = tint("#55575c", ["#2a2b2f", "#34353a", "#3e3f44", "#48494e"], "#121214");
  const PAINT = tint("#dfe9f4", ["#9fb4cc", "#b3c5d9", "#c6d5e5", "#d5e1ee"], "#33506f");
  const ROAD = tint("#c9c9c6", ["#9d9d9a", "#a9a9a6", "#b5b5b2", "#bfbfbc"], "#5f5f5c");
  const AMBER = "#f2a33a";
  const tinted = (style, svg) => `<g style="${style}">${svg}</g>`;
  const yAxis = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);

  // A prism along y with any outline in x–z (concave allowed), sides shaded smoothly by facing.
  function prismY(P, pts, y0, y1, [dark, light], face, ink) {
    const d0 = K.depthOf([0, 0, 0], P), view = [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0];
    const F = pts.map(([x, z]) => K.iso([x, y1, z], P)), B = pts.map(([x, z]) => K.iso([x, y0, z], P));
    let area = 0;
    pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length]; area += x * z2 - x2 * z; });
    const n = pts.length, quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], len = Math.hypot(bx - ax, bz - az) || 1;
      let nx = (bz - az) / len, nz = -(bx - ax) / len;
      if (area < 0) { nx = -nx; nz = -nz; }
      vis[i] = nx * view[0] + nz * view[2] > 1e-6;
      if (!vis[i]) continue;
      const lit = Math.max(0, Math.min(1, 0.5 + 0.5 * (nx * -0.45 + nz * 0.82)));
      quads.push({ k: K.depthOf([(ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2], P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([B[i], B[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([F[i], B[i]]));
    }
    return quads.map(({ i, fill }) => `<path d="${K.pathOf([F[i], F[(i + 1) % n], B[(i + 1) % n], B[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`).join("") +
      `<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/><path d="${K.pathOf(F, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>`;
  }
  const arc = (cx, cz, r, a0, a1, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });

  // ── static parts
  function roadSvg(P) {
    const road = { x: -170, y: -62, w: 345, d: 128, r: 4 };
    return `<path class="iso-halo" d="${K.haloOf(road, -5, 5, P)}"/>` + tinted(ROAD, S(K.slabOf(road, -5, 5, P, 4, 0.8), { tone: "mid" }) +
      S(K.slabOf({ x: -164, y: 54, w: 333, d: 4, r: 0.5 }, 0, 0.3, P, 2), { tone: "lo", crease: "none" }));
  }
  function carSvg(P) {
    const out = [];
    // The wing and door, with the wheel arch cut out, standing on the sill line.
    const side = [[-150, SILL_Z], [-150, 78], [72, 78], [96, 70], [104, 54], [104, 26], [96, SILL_Z + 2],
      ...arc(ARCH.x, ARCH.z, ARCH.r, -0.05, Math.PI + 0.05, 36).reverse().map(([x, z]) => [x, Math.max(z, SILL_Z)])].reverse();
    out.push(tinted(tint("#2d3238", ["#1d2024", "#23272b", "#2a2e33", "#30353a"], "#111"), prismY(P, arc(ARCH.x, ARCH.z, ARCH.r - 1, 0, Math.PI, 30).concat([[ARCH.x - ARCH.r + 1, ARCH.z]]), BODY_Y[0], BODY_Y[0] + 4, ["#16181b", "#2b2f34"], "#24272b", "#0c0d0f")));
    out.push(prismY(P, side, BODY_Y[0], BODY_Y[1], ["#8ea5bf", "#d6e2ef"], "#c9d8e8", "#33506f"));
    // Glass above the shoulder line, a door seam, the jacking-point notch and the side indicator.
    out.push(prismY(P, [[-150, 78], [-150, 82], [44, 82], [52, 78]], -46, 0, ["#8ea5bf", "#d6e2ef"], "#c9d8e8", "#33506f"));
    out.push(prismY(P, [[-146, 82], [-146, 104], [-34, 104], [28, 82]], -9, -5, ["#5f7891", "#a9bfd4"], "#a3bad0", "#33506f"));
    out.push(`<path d="${K.pathOf([K.iso([-104, -4.9, 82], P), K.iso([-104, -4.9, 104], P)])}" stroke="#33506f" stroke-width="1.4" fill="none"/>`);
    out.push(prismY(P, [[-96, 66], [-84, 66], [-84, 69], [-96, 69]], 0, 2, ["#5f7891", "#a9bfd4"], "#b8c9da", "#33506f"));
    out.push(`<path d="${K.pathOf([K.iso([-104, 0.1, SILL_Z + 1], P), K.iso([-104, 0.1, 78], P)])}" stroke="#33506f" stroke-width="0.9" fill="none"/>`);
    out.push(`<path d="${K.pathOf([[-71, SILL_Z], [-62, SILL_Z + 6], [-53, SILL_Z]].map(([x, z]) => K.iso([x, 0.1, z], P)))}" stroke="#33506f" stroke-width="0.9" fill="none"/>`);
    out.push(`<path data-part="hazard" d="${K.pathOf([[52, 60], [62, 60], [62, 64], [52, 64]].map(([x, z]) => K.iso([x, 0.2, z], P)), true)}" fill="#f6d9a8" stroke="#a5651a" stroke-width="0.8"/>`);
    // Black plastic: a sill strip either side of the arch, a lip round the arch, and the bumper's lower lip.
    const PLASTIC = ["#1f2226", "#4a4f56"], PFACE = "#33373c", PINK = "#0d0e10";
    out.push(prismY(P, [[-148, SILL_Z], [-148, SILL_Z + 5], [-ARCH.r - 1, SILL_Z + 5], [-ARCH.r - 1, SILL_Z]], -1.5, 1.2, PLASTIC, PFACE, PINK));
    out.push(prismY(P, [[ARCH.r + 1, SILL_Z + 2], [ARCH.r + 1, SILL_Z + 6], [88, SILL_Z + 6], [88, SILL_Z + 2]], -1.5, 1.2, PLASTIC, PFACE, PINK));
    const lip = [...arc(ARCH.x, ARCH.z, ARCH.r + 4, Math.asin((SILL_Z - ARCH.z) / (ARCH.r + 4)), Math.PI - Math.asin((SILL_Z - ARCH.z) / (ARCH.r + 4)), 40),
      ...arc(ARCH.x, ARCH.z, ARCH.r, Math.PI - Math.asin((SILL_Z - ARCH.z) / ARCH.r), Math.asin((SILL_Z - ARCH.z) / ARCH.r), 40)];
    out.push(prismY(P, lip, -3, 1.4, PLASTIC, PFACE, PINK));
    // Bumper wrapping the nose: a black lower lip, then the painted part on it, both standing just proud of the wing.
    out.push(prismY(P, [[84, SILL_Z - 1], [84, SILL_Z + 4], [106, SILL_Z + 4], [109, SILL_Z + 1], [106, SILL_Z - 1]], -46, 2.6, PLASTIC, PFACE, PINK));
    out.push(prismY(P, [[86, SILL_Z + 4], [86, 44], [104, 44], [108, 38], [108, 26], [104, SILL_Z + 4]], -46, 2.4, ["#8ea5bf", "#d6e2ef"], "#cbd9e8", "#33506f"));
    out.push(`<path d="${K.pathOf([[90, 38], [102, 38]].map(([x, z]) => K.iso([x, 2.5, z], P)))}" stroke="#33506f" stroke-width="0.9" fill="none"/>`);
    // Headlight: a dark housing with a clear lens and the lamp behind it, set into the corner of the nose.
    out.push(prismY(P, [[84, 50], [100, 50], [104, 54], [100, 62], [86, 62]], -16, 0.8, ["#3b4652", "#7d8c9c"], "#56626e", "#1b2530"));
    out.push(prismY(P, [[86.5, 52], [99, 52], [101.6, 54.5], [98.6, 60], [88, 60]], 0.8, 1.6, ["#c9d6e2", "#f4f8fb"], "#e9f1f8", "#4d6a86"));
    out.push(`<path d="${K.pathOf(arc(93, 56, 2.6, 0, Math.PI * 2, 18).map(([x, z]) => K.iso([x, 1.7, z], P)), true)}" fill="#fff6d8" stroke="#8a7a4a" stroke-width="0.6"/>`);
    // Wing mirror on a short arm at the front of the side window.
    out.push(prismY(P, [[24, 84], [30, 84], [30, 87], [24, 87]], 0, 5, PLASTIC, PFACE, PINK));
    out.push(prismY(P, [[16, 86], [32, 86], [33, 92], [30, 97], [18, 97], [15, 92]], 5, 13, ["#8ea5bf", "#d6e2ef"], "#c9d8e8", "#33506f"));
    out.push(prismY(P, [[18, 88], [30, 88], [31, 92], [29, 95], [19, 95], [17, 92]], 13, 13.4, ["#5f7891", "#a9bfd4"], "#b4c8db", "#33506f"));
    // Shut line between wing and door, just behind the arch.
    out.push(`<path d="${K.pathOf([[-44, SILL_Z + 6], [-44, 60], [-36, 78]].map(([x, z]) => K.iso([x, 0.1, z], P)))}" stroke="#33506f" stroke-width="0.9" fill="none"/>`);
    // Behind the wheel: brake disc, caliper, hub and five studs.
    const F = yAxis(0, 0, TYRE_R);
    out.push(S(G.disc(-27, -25, 16, F, P), { tone: "mid" }), L(G.circleOf(F, -25, 7, P), { tone: "faint" }));
    out.push(S(G.prismOf(F, [[13, -6], [19, -6], [19, 6], [13, 6]].map(([u, v]) => [Math.cos(2.4) * u - Math.sin(2.4) * v, Math.sin(2.4) * u + Math.cos(2.4) * v]), -29, -23, P), { tone: "mid" }));
    out.push(S(G.disc(-25, -22, 7.2, F, P), { tone: "mid" }));
    for (let k = 0; k < 5; k++) {
      const c = G.pointOf(F, 0, BOLT_R, -AT(k) + Math.PI);
      out.push(S(G.disc(-22, WHEEL_Y + TYRE_W / 2 + 3.8, 0.9, yAxis(c[0], 0, c[2]), P), { tone: "mid" }));
    }
    return out.join("");
  }
  // The saddle starts 5 below the sill, rises to it (ram 0 → 1), then carries the car up by `lift`.
  function jackSvg(P, ram, lift) {
    const { x, y } = JACK, top = 13.4 + ram * 5 + lift;
    return [
      S(K.slabOf({ x: x - 8, y: y - 6, w: 16, d: 12, r: 1.5 }, 0, 2.4, P, 3, 0.4), { tone: "mid" }),
      S(K.cylinder(x, y, 5, 2.4, 10, P, 28, 0.4), { tone: "mid", inner: L(K.sideArc(x, y, 5, 7, P, 16), { tone: "faint" }) }),
      S(K.cylinder(x, y, 3.2, 12.4, top - 12.4, P, 24), { tone: "hi", crease: "none" }),
      S(K.cylinder(x, y, 4, top, 1.6, P, 24), { tone: "hi" }),
      S(K.cylinder(x + 6.5, y + 2, 1.4, 4, 3, P, 14), { tone: "mid" }),
    ].join("");
  }
  function wheelSvg(P, spare, turn = 0) {
    const F = yAxis(0, WHEEL_Y, TYRE_R), h = TYRE_W / 2;
    const tyre = G.solidOf([[-h, 25], [-h + 0.8, 29.5, 1], [-h + 3, 31.6, 1], [-h + 6, 32, 1], [h - 6, 32, 1], [h - 3, 31.6, 1], [h - 0.8, 29.5, 1], [h, 25]], F, P);
    const out = [tinted(RUBBER, S(tyre, { tone: "hi" }) + K.fadedSvg(G.ribsOf(F, -h + 4, h - 4, 32.05, 44, P, { fade: [0.1, 0.55], phase: turn, seams: true }), { tone: "faint" }) +
      L(G.circleOf(F, h, 27.5, P), { tone: "faint" }))];
    const rim = spare ? tint("#d9dadd", ["#8d9096", "#a2a5ab", "#b6b9be", "#c7c9cd"], "#3c3f45") : "";
    const metal = [S(G.ringBand(h - 2, h + 0.2, 17, RIM_R, F, P), { tone: "hi" }), S(G.disc(h - 3.2, h - 1.8, 17, F, P), { tone: "mid" })];
    metal.push(L(G.spokesOf(F, h - 1.8, 8.5, 17, spare ? 10 : 5, P, { phase: turn + (spare ? 0 : 0.63) }) + G.circleOf(F, h - 1.8, 8.5, P), { tone: "lo" }));
    metal.push(S(G.disc(h - 1.8, h - 0.4, 6.8, F, P), { tone: "mid" }), L(G.circleOf(F, h - 0.4, 3, P), { tone: "faint" }));
    if (spare) metal.push(D(G.dotsOf(F, h - 1.8, 13, 10, P, { all: true, phase: turn + 0.3 }), { size: 0.6, tone: "lo" }));
    out.push(rim ? tinted(rim, metal.join("")) : metal.join(""));
    return out.join("");
  }
  function nutSvg(P, k, turn) {
    const c = [-Math.cos(AT(k)) * BOLT_R, 0, TYRE_R + Math.sin(AT(k)) * BOLT_R], h = TYRE_W / 2;
    const F = G.frameOf([c[0], WHEEL_Y, c[2]], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
    return S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(turn + i * Math.PI / 3) * NUT_R, Math.sin(turn + i * Math.PI / 3) * NUT_R]), h - 0.4, h + 3, P), { tone: "hi" }) +
      L(G.circleOf(F, h + 3, 0.9, P), { tone: "lo" });
  }
  // The L wrench: a socket and shaft along the wheel's axis, and a handle across it that turns with `turn`.
  function wrenchSvg(P, at, turn) {
    const [x, y, z] = at, F = yAxis(x, y - 3.5, z);
    const dir = [-Math.cos(turn + Math.PI / 2), 0, Math.sin(turn + Math.PI / 2)], end = [x + dir[0] * 26, y + 14, z + dir[2] * 26];
    const arm = G.frameAlong([x, y + 14, z], dir);
    return [
      S(G.disc(0, 5.5, 2.7, F, P), { tone: "hi" }),
      S(G.disc(5.5, 16, 1.6, F, P), { tone: "hi" }),
      S(G.sphereOf([x, y + 14, z], 1.7, P), { tone: "hi" }),
      S(G.disc(0, 26, 1.5, arm, P), { tone: "hi" }),
      S(G.sphereOf(end, 1.6, P), { tone: "hi" }),
    ].join("");
  }
  function triangleSvg(P) {
    const [x, y] = TRI, tri = [[-9, 2], [9, 2], [0, 18]];
    return prismY(P, tri.map(([a, b]) => [x + a, b]), y - 0.8, y + 0.8, ["#a3271b", "#f08a7c"], "#e2513f", "#7a1a10") +
      prismY(P, [[-5, 4.6], [5, 4.6], [0, 13]].map(([a, b]) => [x + a, b]), y + 0.8, y + 0.9, ["#fff", "#fff"], "#fbe3df", "#7a1a10") +
      S(K.slabOf({ x: x - 7, y: y - 4, w: 14, d: 8, r: 1 }, 0, 1, P, 2), { tone: "mid" });
  }
  // A wheel lying face up on the road: the spare before it is stood up, and the flat once it is off.
  function lyingSvg(P, [x, y], spare) {
    return tinted(RUBBER, S(K.cylinder(x, y, TYRE_R, 0, TYRE_W, P, 72, 0.8), { tone: "hi" }) + L(K.ring(x, y, 27.5, TYRE_W, P, 64), { tone: "faint" })) +
      tinted(spare ? tint("#d9dadd", ["#8d9096", "#a2a5ab", "#b6b9be", "#c7c9cd"], "#3c3f45") : "",
        S(K.cylinder(x, y, RIM_R, TYRE_W, 0.8, P, 56), { tone: "hi" }) + L(K.ring(x, y, 13, TYRE_W + 0.8, P, 48), { tone: "lo" }) +
        S(K.cylinder(x, y, 6.8, TYRE_W + 0.8, 1, P, 32), { tone: "mid" }) +
        D(Array.from({ length: 5 }, (_, k) => K.iso([x + Math.cos(k * 1.2566) * BOLT_R, y + Math.sin(k * 1.2566) * BOLT_R, TYRE_W + 0.8], P)), { size: 0.9, tone: "lo" }));
  }
  function traySvg(P) {
    const [x, y] = TRAY;
    return S(K.cylinder(x, y, 9, 0, 1.2, P, 40, 0.4), { tone: "mid" }) + S(K.cylinder(x, y, 8, 1.2, 2.2, P, 40), { tone: "hi" }) + L(K.ring(x, y, 6, 3.4, P, 36), { tone: "faint" });
  }

  ISO.add({
    name: "tyrechange", title: "Change a tyre (7 steps)", compare: "car 480 290 440 k=jacked", steps: STEPS,
    about: "Front corner of a car with its wheel, jack, wrench, spare, hubcap tray and warning triangle; each step is a pose of the same model.",
    line: "tyrechange cx cy size step=0..7",
    demo: { line: "tyrechange 480 280 320", script: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ set: { step: n }, hold: "settle" })) },
      make([cx, cy, size = 320], o, t, p) {
      const W = size * 1.8, H = size * 1.25;
      const P = K.fitProjection([[-170, -62, -5], [175, 66, -5], [-170, -62, 108], [175, 66, 0], [104, -46, 108]], W, H, { pad: 0, azimuth: 66, elevation: 26 });
      const g = mk("g", { class: "iso", "data-theme": "light", transform: `translate(${cx - W / 2} ${cy - H / 2})` }, p);
      const ids = ["triangle", "tray", "lie", "flat", "spare", "wheel", "n0", "n1", "n2", "n3", "n4", "wrench"];
      // The jack stands under the car, behind the side panel's plane, so it is drawn before the car.
      g.innerHTML = `<g>${roadSvg(P)}</g><g data-part="jack"></g><g data-part="car">${tinted(PAINT, carSvg(P))}</g>` +
        ids.map((id) => `<g data-item="${id}"></g>`).join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-item]")].map((e) => [e.dataset.item, e]));
      const car = g.querySelector('[data-part="car"]'), jack = g.querySelector('[data-part="jack"]'), hazard = g.querySelector('[data-part="hazard"]');
      el.triangle.innerHTML = triangleSvg(P);
      el.tray.innerHTML = traySvg(P);
      el.wheel.innerHTML = wheelSvg(P, false);
      el.spare.innerHTML = `<g transform="${K.translateAlong(P, [SPARE_AT[0], SPARE_AT[1] - WHEEL_Y, 0])}">${wheelSvg(P, true)}</g>`;
      el.flat.innerHTML = lyingSvg(P, SPARE_AT, true);
      el.lie.innerHTML = lyingSvg(P, LIE, false);
      // Anchor points for depth sorting the parts that move about.
      const anchor = (s) => ({
        triangle: [TRI[0], TRI[1], 0], lie: [LIE[0], LIE[1], 0], flat: [SPARE_AT[0] + s.spare[0], SPARE_AT[1] + s.spare[1], 0], tray: [TRAY[0], TRAY[1], 0], wrench: s.wrench.at.map((v, i) => v + (i === 1 ? 12 : 0)),
        wheel: [s.wheel[0], WHEEL_Y + s.wheel[1], 0], spare: [SPARE_AT[0] + s.spare[0], SPARE_AT[1] + s.spare[1] + 0.5, 0],
        ...Object.fromEntries(STAR.map((_, k) => [`n${k}`, [s.nut[k][0] - Math.cos(AT(k)) * BOLT_R, WHEEL_Y + TYRE_W / 2 + 2 + s.nut[k][1], 0]])),
      });
      let order = "";
      // Writes only what changed since the last frame: an attribute is set when its value differs, and a part that is
      // rebuilt (the jack, a nut, the wrench) is rebuilt only when its pose does.
      const attr = (e, name, v) => { if (e.getAttribute(name) !== v) e.setAttribute(name, v); };
      const shown = (e, on) => { const v = on ? "" : "hidden"; if (e.style.visibility !== v) e.style.visibility = v; };
      const rebuild = (e, key, svg) => { if (e._key !== key) { e._key = key; e.innerHTML = svg(); e._fresh = true; } };
      const movable = [jack, ...ids.map((id) => el[id])];
      g.draw = (s, step, clock = 0) => {
        attr(car, "transform", K.translateAlong(P, [0, 0, s.lift]));
        rebuild(jack, `${s.ram.toFixed(3)} ${s.lift.toFixed(3)}`, () => jackSvg(P, s.ram, s.lift));
        attr(hazard, "fill", s.hazard && Math.floor(clock * 1.5) % 2 === 0 ? AMBER : "#f6d9a8");
        attr(el.triangle, "transform", K.translateAlong(P, [-30 * (1 - s.tri), 0, 0]));
        attr(el.triangle, "opacity", s.tri.toFixed(2));
        attr(el.wheel, "transform", K.translateAlong(P, s.wheel));
        attr(el.wheel, "opacity", (1 - s.wheelDown).toFixed(2));
        shown(el.wheel, s.wheelDown <= 0.99);
        attr(el.lie, "opacity", s.wheelDown.toFixed(2));
        shown(el.lie, s.wheelDown >= 0.01);
        attr(el.spare, "transform", K.translateAlong(P, s.spare));
        attr(el.spare, "opacity", s.spareUp.toFixed(2));
        shown(el.spare, s.spareUp >= 0.01);
        attr(el.flat, "transform", K.translateAlong(P, s.spare));
        attr(el.flat, "opacity", (1 - s.spareUp).toFixed(2));
        shown(el.flat, s.spareUp <= 0.99);
        STAR.forEach((_, k) => {
          const n = el[`n${k}`];
          rebuild(n, s.nutTurn[k].toFixed(3), () => nutSvg(P, k, s.nutTurn[k]));
          attr(n, "transform", K.translateAlong(P, s.nut[k]));
        });
        const w = s.wrench;
        rebuild(el.wrench, w.show > 0.01 ? `${w.at.map((v) => v.toFixed(2))} ${w.turn.toFixed(3)}` : "off", () => (w.show > 0.01 ? wrenchSvg(P, w.at, w.turn) : ""));
        attr(el.wrench, "opacity", Math.min(1, w.show * 1.6).toFixed(2));
        // Far to near: only re-append when the order changes.
        const a = anchor(s), next = ids.slice().sort((x, y) => K.depthOf(a[x], P) - K.depthOf(a[y], P));
        if (next.join() !== order) { order = next.join(); for (const id of next) g.append(el[id]); }
        // The part handled in this step is lit; marks go on again only where a part was rebuilt or the step changed.
        const want = STEPS[step - 1]?.lit || "";
        const litParts = want === "jack" ? [jack] : want === "spare" ? [el.spare, el.flat] : want === "wheel" ? [el.wheel, el.lie] : el[want] ? [el[want]] : [];
        for (const part of movable) {
          const on = litParts.includes(part);
          if (part._lit === on && !part._fresh) continue;
          part._lit = on; part._fresh = false;
          part.classList.toggle("tc-lit", on);
          part.querySelectorAll(".iso-solid").forEach((n) => n.toggleAttribute("data-lit", on));
        }
      };
      const cur = { step: 0, from: startOf(1), t: 1e9, clock: 0, label: "" };
      const n0 = ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 7);
      if (n0) { cur.step = n0; cur.from = startOf(n0); }
      g.set = (q) => {
        if (q.step === undefined) return;
        cur.step = ISO.clamp(Math.round(+q.step), 0, 7); cur.from = startOf(Math.max(1, cur.step)); cur.t = cur.step ? 0 : 1e9;
      };
      g.update = (dt) => {
        cur.t += dt; cur.clock += dt;
        const s = cur.step ? poseAt(cur.step, cur.from, ISO.still() ? 1e9 : cur.t) : cur.from;
        g.draw(s, cur.step, cur.clock); cur.label = s.label || "";
        return cur.step > 0 && cur.t < lengthOf(cur.step, cur.from) + 0.2;
      };
      g.readout = () => cur.label;
      g.update(0);
      if (t) label(p, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
