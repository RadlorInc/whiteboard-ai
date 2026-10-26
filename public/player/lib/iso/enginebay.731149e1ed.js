// "enginebay cx cy width lit=oilcap|dipstick|coolant|battery|washer|hood lab=1" — an open engine bay seen from the front.
// The bay between the fenders and strut towers, the cowl at the back with the hood standing open above it on its prop
// rod (insulation pad, latch striker), the radiator support, headlights and bumper at the front. In it: the engine
// with its rocker cover, four ignition coils, the yellow oil filler cap and the yellow dipstick loop; the coolant tank
// with its MIN and MAX marks and the pink coolant showing between them; the 12 V battery with its red + and black −
// terminals and their cables; the fuse box; the blue washer-fluid cap. set({ lit }) lights one of the things you check,
// and the readout says what it is for. World units are centimetres.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PAN = { x: -96, y: -66, w: 192, d: 136, r: 4 }, FLOOR = 8;
  const HINGE = [0, -80, 60], HOOD_L = 118, HOOD_A = 74 * Math.PI / 180;
  const ENG = { x: -44, y: -36, w: 80, d: 64, r: 3 }, COVER = { x: -40, y: -32, w: 72, d: 54, r: 6 }, TOPZ = 66;
  const TANK = { x: 50, y: -34, w: 26, d: 30, r: 4 }, TANK_Z = [FLOOR, 54], MIN_Z = 28, MAX_Z = 42, COOLANT_Z = 36;
  const BATT = { x: -88, y: 10, w: 34, d: 46, r: 2 }, BATT_Z = 46, TRAY_Z = FLOOR + 14;
  const say = {
    oilcap: "oil filler cap (yellow) · top up engine oil here",
    dipstick: "dipstick (yellow loop) · check the oil, engine off and cool",
    coolant: `coolant tank · level between MIN and MAX when cold · never open it hot`,
    battery: "12 V battery · red + terminal, black − terminal",
    washer: "washer fluid cap (blue) · screen wash only",
    hood: "hood held open by its prop rod",
  };
  const PAINT = ISO.T.paint, BLACK = ISO.T.plastic, YELLOW = ISO.tint("#ffe27a", ["#c9a21c", "#d8b22a", "#e6c23a", "#f2d24f"], "#6b5208");
  const sub = (a, b) => a.map((v, i) => v - b[i]), len = (a) => Math.hypot(...a);
  const rod = (P, a, b, r) => S(G.disc(0, len(sub(b, a)), r, G.frameAlong(a, sub(b, a).map((v) => v / len(sub(b, a)))), P), { tone: "hi" });
  const named = (name, svg) => `<g data-name="${name}">${svg}</g>`;

  // the hood: a panel on the cowl hinges, its underside to the viewer, with the pad, striker and the rod's grommet
  const hoodAt = (u, w, v) => [u, HINGE[1] + w * Math.cos(HOOD_A) - v * Math.sin(HOOD_A), HINGE[2] + w * Math.sin(HOOD_A) + v * Math.cos(HOOD_A)];
  function hoodSvg(P) {
    const out = [ISO.tinted(PAINT, ISO.box(hoodAt, P, [-98, 98], [0, HOOD_L], [0, 2.4], "hi"))];
    const pad = ISO.tinted(ISO.T.road, ISO.box(hoodAt, P, [-80, 80], [16, HOOD_L - 14], [-1.4, 0], "hi"));
    out.push(pad);
    const quilt = [];
    for (let u = -60; u <= 60; u += 20) quilt.push(K.pathOf([K.iso(hoodAt(u, 16, -1.45), P), K.iso(hoodAt(u, HOOD_L - 14, -1.45), P)]));
    out.push(L(quilt.join(""), { tone: "faint" }));
    out.push(ISO.tinted(ISO.T.steel, ISO.box(hoodAt, P, [-5, 5], [HOOD_L - 6, HOOD_L - 3], [-5, 0], "hi")));
    for (const u of [-90, 90]) out.push(ISO.tinted(ISO.T.steel, ISO.box(hoodAt, P, [u - 3, u + 3], [-2, 14], [-3, 0], "hi")));
    out.push(S(G.disc(-1.8, 0, 2.6, G.frameAlong(hoodAt(-80, 84, 0), [0, Math.sin(HOOD_A), -Math.cos(HOOD_A)]), P), { tone: "mid" }));
    return named("hood", out.join(""));
  }
  function baySvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf(PAN, -10, 70, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(PAN, 0, FLOOR, P, 4, 0.6), { tone: "mid" }))];
    // cowl with its vent slots, fenders, strut towers with three bolts each
    const cowl = { x: -100, y: -86, w: 200, d: 16, r: 2 };
    out.push(ISO.tinted(BLACK, S(K.slabOf(cowl, FLOOR, HINGE[2] - FLOOR, P, 2, 0.6), { tone: "hi" }) +
      L([-70, -50, -30, -10, 10, 30, 50, 70].map((x) => K.planOutline({ x: x - 6, y: -80, w: 12, d: 4, r: 1.5 }, HINGE[2], P, 2)).join(""), { tone: "lo" })));
    for (const x of [-100, 86]) {
      const f = { x, y: -70, w: 14, d: 140, r: 2 };
      out.push(ISO.tinted(PAINT, S(K.slabOf(f, FLOOR, 46, P, 2, 0.8), { tone: "hi", inner: L(K.sideSeam(f, FLOOR + 30, P, 2), { tone: "faint" }) })));
    }
    for (const x of [-72, 70]) {
      out.push(ISO.tinted(PAINT, S(K.cylinder(x, -44, 13, FLOOR, 48, P, 40, 0.6), { tone: "mid" })), S(K.cylinder(x, -44, 6, FLOOR + 48, 3, P, 24), { tone: "mid" }));
      out.push(D([0, 2.09, 4.19].map((a) => K.iso([x + Math.cos(a) * 9.4, -44 + Math.sin(a) * 9.4, FLOOR + 48], P)), { size: 0.8 }));
    }
    // the hood's prop rod: from its clip on the left of the radiator support up to the grommet under the hood
    out.push(rod(P, [-82, 60, 50], hoodAt(-80, 84, -1.8), 0.9), S(G.sphereOf([-82, 60, 50], 1.6, P), { tone: "mid" }));
    // fuse box, the brake fluid reservoir behind the battery
    out.push(ISO.tinted(BLACK, S(K.slabOf({ x: -88, y: -20, w: 26, d: 26, r: 2 }, FLOOR, 32, P, 2, 0.6), { tone: "hi", inner: L(K.sideSeam({ x: -88, y: -20, w: 26, d: 26, r: 2 }, FLOOR + 26, P, 2), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(-48, -54, 7, FLOOR + 30, 14, P, 28), { tone: "hi" })), ISO.tinted(BLACK, S(K.cylinder(-48, -54, 5, FLOOR + 44, 4, P, 24), { tone: "hi" })));
    return out.join("");
  }
  function engineSvg(P) {
    const out = [S(K.slabOf(ENG, FLOOR, 44, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(ENG, FLOOR + 30, P, 3), { tone: "faint" }) })];
    const ribs = [];
    for (let x = ENG.x + 8; x < ENG.x + ENG.w - 6; x += 6) if (x < -40 || x > -18) ribs.push(K.segment([x, ENG.y + ENG.d, FLOOR], [x, ENG.y + ENG.d, FLOOR + 30], P));
    out.push(L(ribs.join(""), { tone: "faint" }));
    // the belt end: crank pulley and alternator on the front face
    for (const [x, z, r] of [[-30, FLOOR + 14, 8], [-28, FLOOR + 34, 6]]) {
      const F = G.frameOf([x, ENG.y + ENG.d, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      out.push(S(G.disc(0, 3, r, F, P), { tone: "hi", inner: L(G.ribsOf(F, 0.5, 2.5, r, 30, P, { seams: true }), { tone: "faint" }) }), D([K.iso(G.pointOf(F, 3, 0, 0), P)], { size: 0.7 }));
    }
    out.push(S(K.slabOf(K.insetPlan(ENG, 3), FLOOR + 44, 3, P, 3), { tone: "lo" }));
    out.push(S(K.slabOf(COVER, FLOOR + 47, TOPZ - FLOOR - 47, P, 6, 1), { tone: "hi", inner: L(K.sideSeam(COVER, FLOOR + 51, P, 6), { tone: "faint" }) }));
    const bolts = [[-36, -28], [28, -28], [-36, 18], [28, 18]];
    out.push(D(bolts.map(([x, y]) => K.iso([x, y, TOPZ], P)), { size: 0.7 }));
    for (const x of [-12, 0, 12, 24]) out.push(ISO.tinted(BLACK, S(K.slabOf({ x: x - 4, y: -20, w: 8, d: 16, r: 1.2 }, TOPZ, 5, P, 2, 0.4), { tone: "hi" }) + S(K.slabOf({ x: x - 2.4, y: -6, w: 4.8, d: 4, r: 0.8 }, TOPZ + 5, 2.4, P, 2), { tone: "hi" })));
    return out.join("");
  }
  function oilcapSvg(P, lab) {
    const [x, y] = [-26, 4];
    let svg = ISO.tinted(YELLOW, S(K.cylinder(x, y, 7, TOPZ, 1.6, P, 32), { tone: "hi" }) + S(K.cylinder(x, y, 6, TOPZ + 1.6, 4, P, 32, 0.4), { tone: "hi", inner: L(K.knurl(x, y, 6, TOPZ + 1.6, TOPZ + 5.6, 24, P, 0), { tone: "lo" }) }) +
      S(K.slabOf({ x: x - 4, y: y - 1, w: 8, d: 2, r: 0.6 }, TOPZ + 5.6, 1.4, P, 2), { tone: "hi" }));
    if (lab) svg += ISO.word(K.iso([x - 10, y + 10, TOPZ + 7], P), "Oil cap", "#444", { anchor: "end", dy: 4, size: 14 });
    return named("oilcap", svg);
  }
  function dipstickSvg(P, lab) {
    const base = [26, ENG.y + ENG.d + 2, FLOOR + 30], top = [28, ENG.y + ENG.d + 6, TOPZ + 6];
    let svg = S(G.disc(0, 3, 3, G.frameOf([base[0], base[1] - 2, base[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }) + rod(P, base, top, 1.4);
    const Fl = G.frameOf([top[0], top[1], top[2] + 6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    svg += ISO.tinted(YELLOW, S(G.disc(-1, 1, 2.2, G.frameAlong(top, [0, 0, 1]), P), { tone: "hi" }) + S(G.ringBand(-1, 1, 3.2, 5.6, Fl, P), { tone: "hi" }) + `<path d="${G.circleOf(Fl, 1, 3.2, P)}" fill="#fdfdfb"/>`);
    if (lab) svg += ISO.word(K.iso([top[0] + 8, top[1], top[2] + 6], P), "Dipstick", "#444", { anchor: "start", dy: 4, size: 14 });
    return named("dipstick", svg);
  }
  function coolantSvg(P, lab) {
    const fy = TANK.y + TANK.d, out = [ISO.tinted(ISO.T.glass, S(K.slabOf(TANK, TANK_Z[0], TANK_Z[1] - TANK_Z[0], P, 4, 0.6), { tone: "hi" }))];
    // the coolant seen through the tank's front: pink up to its level, MIN and MAX marks off the right edge
    const x0 = TANK.x + 3, x1 = TANK.x + TANK.w - 3;
    out.push(`<path d="${K.pathOf([[x0, fy + 0.1, TANK_Z[0] + 2], [x1, fy + 0.1, TANK_Z[0] + 2], [x1, fy + 0.1, COOLANT_Z], [x0, fy + 0.1, COOLANT_Z]].map((p) => K.iso(p, P)), true)}" fill="#f4a7c0" stroke="#b0476a" stroke-width="0.6"/>`);
    const right = TANK.x + TANK.w - TANK.r;
    out.push(L(K.segment([right, fy, TANK_Z[0]], [right, fy, TANK_Z[1]], P), { tone: "lo" }));
    out.push(L([MIN_Z, MAX_Z].map((z) => K.segment([right, fy, z], [right - 9, fy, z], P)).join(""), { tone: "mid", free: "end" }));
    out.push(ISO.tinted(YELLOW, S(K.cylinder(64, -22, 6.4, TANK_Z[1], 5, P, 28, 0.4), { tone: "hi", inner: L(K.knurl(64, -22, 6.4, TANK_Z[1], TANK_Z[1] + 5, 22, P, 0), { tone: "lo" }) })));
    out.push(ISO.tinted(BLACK, rod(P, [TANK.x, -24, FLOOR + 12], [ENG.x + ENG.w, -24, FLOOR + 12], 2)));
    let svg = out.join("");
    if (lab) {
      svg += ISO.word(K.iso([right, fy, MAX_Z], P), "MAX", "#2c6a22", { anchor: "start", dy: 4, size: 11 }) + ISO.word(K.iso([right, fy, MIN_Z], P), "MIN", "#c0392b", { anchor: "start", dy: 4, size: 11 });
      svg += ISO.word(K.iso([64, -22, TANK_Z[1] + 6], P), "Coolant", "#444", { dy: -10, size: 14 });
    }
    return named("coolant", svg);
  }
  function batterySvg(P, lab) {
    const out = [S(K.slabOf(K.insetPlan(BATT, -2), FLOOR, TRAY_Z - FLOOR, P, 2, 0.4), { tone: "lo" }), ISO.tinted(BLACK, S(K.slabOf(BATT, TRAY_Z, BATT_Z - TRAY_Z, P, 2, 0.6), { tone: "hi", inner: L(K.sideSeam(BATT, BATT_Z - 4, P, 2), { tone: "faint" }) }))];
    out.push(ISO.tinted(BLACK, S(K.slabOf({ x: BATT.x + 4, y: BATT.y + 18, w: BATT.w - 8, d: 6, r: 1 }, BATT_Z, 1.6, P, 2), { tone: "mid" })));
    const plus = [BATT.x + 9, BATT.y + BATT.d - 8], minus = [BATT.x + BATT.w - 9, BATT.y + BATT.d - 8];
    out.push(ISO.tinted(ISO.T.red, S(K.cylinder(plus[0], plus[1], 4.4, BATT_Z, 4, P, 24, 0.4), { tone: "hi" })), ISO.tinted(ISO.T.steel, S(K.cylinder(minus[0], minus[1], 3, BATT_Z, 4, P, 24, 0.4), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.red, rod(P, [plus[0], plus[1], BATT_Z + 3], [-76, -6, FLOOR + 33], 1.3)));
    out.push(ISO.tinted(BLACK, rod(P, [minus[0], minus[1], BATT_Z + 3], [-70, minus[1] + 4, BATT_Z + 3], 1.3) + S(G.sphereOf([-70, minus[1] + 4, BATT_Z + 3], 1.6, P), { tone: "hi" }) + rod(P, [-70, minus[1] + 4, BATT_Z + 3], [-86, minus[1] + 4, BATT_Z + 14], 1.3)));
    const tm = (at, s) => { const o = K.iso(at, P), a = K.iso([at[0] + 1, at[1], at[2]], P), b = K.iso([at[0], at[1] + 1, at[2]], P); return `<text transform="matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})" text-anchor="middle" style="font:700 7px 'Helvetica Neue',Arial,sans-serif" fill="${s === "+" ? "#c0392b" : "#e8e8e8"}" y="2.5">${s}</text>`; };
    out.push(tm([plus[0], plus[1] - 9, BATT_Z], "+"), tm([minus[0], minus[1] - 9, BATT_Z], "−"));
    let svg = out.join("");
    if (lab) svg += ISO.word(K.iso([BATT.x, BATT.y + 10, BATT_Z], P), "Battery", "#444", { anchor: "end", dy: -4, size: 14 });
    return named("battery", svg);
  }
  function washerSvg(P, lab) {
    const [x, y] = [68, 40];
    let svg = ISO.tinted(BLACK, S(K.cylinder(x, y, 4, FLOOR, 24, P, 24), { tone: "hi" })) +
      ISO.tinted(ISO.T.blue, S(K.cylinder(x, y, 7, FLOOR + 24, 4, P, 28, 0.4), { tone: "hi" }) + L(K.ring(x, y, 4, FLOOR + 28, P, 20), { tone: "mid" }));
    if (lab) svg += ISO.word(K.iso([x, y, FLOOR + 28], P), "Washer fluid", "#444", { dy: -10, size: 14 });
    return named("washer", svg);
  }
  function frontSvg(P) {
    const out = [ISO.tinted(BLACK, S(K.slabOf({ x: -96, y: 66, w: 192, d: 8, r: 1 }, FLOOR, 24, P, 2, 0.6), { tone: "hi" }))];
    for (const x of [-96, 62]) out.push(ISO.tinted(ISO.T.glass, S(K.slabOf({ x, y: 66, w: 34, d: 10, r: 2 }, FLOOR + 10, 14, P, 2, 0.6), { tone: "hi" })));
    out.push(ISO.tinted(PAINT, S(K.slabOf({ x: -104, y: 76, w: 208, d: 14, r: 4 }, 0, 22, P, 4, 1), { tone: "hi", inner: L(K.sideSeam({ x: -104, y: 76, w: 208, d: 14, r: 4 }, 8, P, 4), { tone: "faint" }) })));
    const slots = [];
    for (let x = -50; x <= 50; x += 10) slots.push(K.pathOf([[x - 3, 90, 6], [x + 3, 90, 6], [x + 3, 90, 16], [x - 3, 90, 16]].map((p) => K.iso(p, P)), true));
    out.push(L(slots.join(""), { tone: "lo" }));
    out.push(D([-56, 56].map((x) => K.iso([x, 90, 14], P)), { size: 0.8 }));
    return out.join("");
  }

  ISO.add({
    name: "enginebay", title: "Engine bay", compare: "enginebay 480 280 440",
    about: "An open engine bay from the front: oil cap and dipstick loop, coolant tank with MIN and MAX, battery terminals, washer cap, hood on its prop rod.",
    line: "enginebay cx cy width lit=oilcap|dipstick|coolant|battery|washer|hood lab=1",
    demo: { line: "enginebay 480 280 440", script: ["oilcap", "dipstick", "coolant", "battery", "washer", "hood"].map((lit) => ({ set: { lit }, hold: 1.8 })) },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0";
      const W = size * 1.75, H = size * 1.08;
      const { P, g } = ISO.frame([...K.boxCorners({ x: -104, y: -86, w: 208, d: 176, r: 4 }, -10, 60), hoodAt(-98, HOOD_L, 2.4), hoodAt(98, HOOD_L, 2.4)], cx, cy, W, H, { azimuth: 64, elevation: 30 }, parent);
      g.innerHTML = hoodSvg(P) + baySvg(P, lab) + coolantSvg(P, lab) + batterySvg(P, lab) + engineSvg(P) + oilcapSvg(P, lab) + dipstickSvg(P, lab) + washerSvg(P, lab) + frontSvg(P);
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => w.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; };
      g.update = () => { draw(); return false; };
      g.readout = () => say[lit] || "open hood · the things you check under it";
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
