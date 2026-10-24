// "heartsection cx cy size lab=1 open=1 beat=1 slow=4 lit=lv" — a sectioned teaching heart on a stand.
// Same line as the whiteboard recipe. The heart is cut in two through the front: the back half stands on a post and
// shows the four chambers, valves and vessels on its cut face (the whiteboard recipe's own shapes, printed on it); the
// front half rides a carriage on a rail and slides out to open the model. set({ open, beat, lit }) opens or closes it,
// starts or stops the beat, and lights one part: ra, rv, la, lv, valves.
(() => {
  const K = window.K;
  // Face coordinates are the whiteboard recipe's own (x right, y down, about ±200): its chamber shapes are reused as
  // they are, printed on the cut face. One face unit is 0.3 world units; the apex sits 22 above the board.
  const SC = 0.3, Z0 = 22 + 135 * SC, HALF = 18, VESSEL = 14, SLIDE = 118;
  const W3 = (fx, fy, y) => [fx * SC, y, Z0 - fy * SC];
  const BODY = 'M0 135 C-70 115 -150 60 -148 -10 C-146 -70 -120 -112 -70 -112 L70 -112 C120 -112 146 -70 148 -10 C150 60 70 115 0 135 Z';
  const VESSELS = [
    { d: 'M-128 -96 L-128 -176 Q-128 -184 -120 -184 L-106 -184 Q-98 -184 -98 -176 L-98 -100 Z', blue: true, name: "vena cava", at: [-136, -160], anchor: "end" },
    { d: 'M-36 -96 L-36 -140 C-36 -156 -46 -162 -70 -162 L-70 -178 C-36 -180 -6 -168 -6 -140 L-6 -96 Z', blue: true, name: "to lungs", at: [-40, -212] },
    { d: 'M8 -96 C6 -176 70 -206 130 -176 L122 -152 C84 -174 40 -160 40 -96 Z', blue: false, name: "aorta", at: [112, -214] },
    { d: 'M120 -99 L190 -99 L190 -73 L120 -73 Z', blue: false },
    { d: 'M120 -65 L190 -65 L190 -39 L120 -39 Z', blue: false, name: "from lungs", at: [172, -124] },
  ];
  const RA = 'M-125 -55 C-125 -90 -95 -100 -70 -98 C-45 -96 -30 -80 -30 -55 C-30 -30 -50 -18 -75 -18 C-105 -18 -125 -30 -125 -55 Z';
  const LA = RA.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${-x} ${y}`);
  const RV = 'M-122 8 L-34 8 C-30 50 -30 85 -16 112 C-62 96 -112 62 -122 8 Z';
  const LV = 'M34 10 L110 10 C102 52 72 82 22 106 C18 76 26 42 34 10 Z';
  const C = { muscle: ["#a8463f", "#f0aaa3"], muscleFace: "#e58a84", muscleInk: "#5b1a1a", blue: ["#2f5f9e", "#9fc2ec"], red: ["#9b2b22", "#ef8f84"],
    blueFace: "#5d93d6", redFace: "#d9483c", blueInk: "#1f4f8f", redInk: "#7a1f1f", blueBlood: "#a9c8ee", redBlood: "#f4a39a" };

  // The heart cycle at 72 beats a minute (0.83 s). Ventricles squeeze for the first 36% (systole); the atria squeeze
  // in the last 12%. The valves between atria and ventricles shut while the ventricles squeeze; the valves into the
  // arteries open only while blood is being pushed out.
  const BPM = 72, SYSTOLE = 0.36, ATRIA = 0.88;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cycleOf = (t) => ({
    ventricles: smooth(0, 0.08, t) * (1 - smooth(SYSTOLE - 0.08, SYSTOLE, t)),
    atria: smooth(ATRIA, ATRIA + 0.04, t) * (1 - smooth(0.96, 1, t)),
    av: smooth(SYSTOLE - 0.02, SYSTOLE + 0.06, t) * (1 - smooth(0.98, 1, t)),   // 1 = open
    semi: smooth(0.05, 0.09, t) * (1 - smooth(SYSTOLE - 0.05, SYSTOLE - 0.01, t)),
    phase: t < SYSTOLE ? "ventricles squeeze (systole)" : t >= ATRIA ? "atria squeeze" : "filling (diastole)",
  });

  // A prism along y with any outline (face coordinates), its curved sides shaded smoothly by facing.
  function prismY(P, pts, y0, y1, [dark, light], face, ink, frontExtra = "") {
    const d0 = K.depthOf([0, 0, 0], P), view = [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0];
    const Lt = [-0.45, 0.35, 0.82];
    const F = pts.map(([x, y]) => K.iso(W3(x, y, y1), P)), B = pts.map(([x, y]) => K.iso(W3(x, y, y0), P));
    let area = 0;
    pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; area += x * -y2 - x2 * -y; });
    const n = pts.length, quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n];
      const dx = (bx - ax) * SC, dz = -(by - ay) * SC, len = Math.hypot(dx, dz) || 1;
      let nx = dz / len, nz = -dx / len;
      if (area < 0) { nx = -nx; nz = -nz; }
      vis[i] = nx * view[0] + nz * view[2] > 0;
      if (!vis[i]) continue;
      const lit = Math.max(0, Math.min(1, 0.5 + 0.5 * (nx * Lt[0] + nz * Lt[2])));
      const mid = W3((ax + bx) / 2, (ay + by) / 2, (y0 + y1) / 2);
      quads.push({ k: K.depthOf(mid, P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const sides = quads.map(({ i, fill }) => `<path d="${K.pathOf([F[i], F[(i + 1) % n], B[(i + 1) % n], B[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([B[i], B[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([F[i], B[i]]));
    }
    return `${sides.join("")}<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/>` +
      `<path d="${K.pathOf(F, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>${frontExtra}`;
  }
  // A transform that draws face coordinates in the plane y.
  const faceMatrix = (P, y) => {
    const o = K.iso(W3(0, 0, y), P), a = K.iso(W3(1, 0, y), P), b = K.iso(W3(0, 1, y), P);
    return `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`;
  };
  const word = (at, text, color, anchor = "middle") => `<text x="${at[0].toFixed(1)}" y="${at[1].toFixed(1)}" text-anchor="${anchor}" fill="${color}" style="font:600 16px 'Helvetica Neue',Arial,sans-serif">${text}</text>`;
  const printed = (x, y, lines, color, size = 17) => lines.map((t, i) => `<text x="${x}" y="${y + i * size * 1.1}" text-anchor="middle" fill="${color}" style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif">${t}</text>`).join("");

  const S = (paths, style) => K.solidSvg(paths, style), L = (d, style) => K.lineSvg(d, style), D = (pts, style) => K.dotsSvg(pts, style);
  const BASE = { x: -64, y: -30, w: 240, d: 62, r: 6 };
  const RAILS = [3, 14], RAIL = { from: -26, to: 160 };
  const CARRIAGE = { x: -16, y: 0, w: 32, d: 19, r: 2 };

  function standSvg(P) {
    const at3 = (p) => K.iso(p, P), out = [`<path class="iso-halo" d="${K.haloOf(BASE, -12, 12, P)}"/>`];
    const byDepth = (pts) => [...pts].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    for (const [x, y] of byDepth(K.corners(BASE, 15))) {
      out.push(S(K.cylinder(x, y, 6.4, -12, 1.4, P, 28), { tone: "lo" }), S(K.cylinder(x, y, 5, -10.6, 2.6, P, 28), { tone: "mid" }));
    }
    out.push(S(K.slabOf(BASE, -8, 8, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(BASE, -3, P, 8), { tone: "faint" }) }));
    out.push(L(K.planOutline(K.insetPlan(BASE, 4), 0, P), { tone: "faint" }));
    const screws = K.corners(BASE, 9);
    out.push(L(screws.map(([x, y]) => K.ring(x, y, 2, 0, P, 14)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at3([x, y, 0])), { size: 0.5 }));
    const plate = { x: 112, y: -24, w: 44, d: 14, r: 1.2 };
    out.push(S(K.slabOf(plate, 0, 0.8, P, 3), { tone: "lo", crease: "none" }), L(K.planOutline(K.insetPlan(plate, 1.6), 0.8, P, 3), { tone: "faint" }));
    for (const [i, y] of [-20.5, -17, -13.5].entries()) out.push(L(K.lineOnTop([118, y], [[150, 142, 134][i], y], 0.8, P), { tone: "lo", free: true }));
    out.push(D([at3([114, -22, 0.8]), at3([154, -12, 0.8])], { size: 0.4 }));
    // Two rails with end stops carry the front half's carriage.
    for (const y of RAILS) {
      out.push(S(K.slabOf({ x: RAIL.from, y, w: RAIL.to - RAIL.from, d: 3, r: 0.8 }, 0, 2, P, 3, 0.3), { tone: "mid" }));
      out.push(D([RAIL.from + 5, RAIL.to - 5].map((x) => at3([x, y + 1.5, 2])), { size: 0.4 }));
    }
    for (const x of [RAIL.from - 5, RAIL.to]) out.push(S(K.slabOf({ x, y: 1, w: 5, d: 18, r: 1 }, 0, 5, P, 3, 0.4), { tone: "mid" }));
    // The back half's post: a collar on the base, the post, and a saddle under the apex.
    out.push(S(K.cylinder(0, -9, 6, 0, 3, P, 28), { tone: "mid" }), L(K.sideArc(0, -9, 6, 1.5, P, 16), { tone: "faint" }));
    out.push(S(K.cylinder(0, -9, 3, 3, 16, P, 24), { tone: "mid", crease: "none" }));
    out.push(S(K.cylinder(0, -9, 4.6, 19, 3, P, 24), { tone: "mid" }));
    return out.join("");
  }
  // The front half's carriage and post, at its rest position; it moves with the front half.
  function carriageSvg(P) {
    const at3 = (p) => K.iso(p, P);
    return [
      S(K.slabOf(CARRIAGE, 2, 3, P, 3, 0.5), { tone: "mid" }),
      D([[-12, 2.5], [12, 2.5], [-12, 16.5], [12, 16.5]].map(([x, y]) => at3([x, y, 5])), { size: 0.4 }),
      S(K.cylinder(0, 9, 5, 5, 2.4, P, 28), { tone: "mid" }),
      S(K.cylinder(0, 9, 3, 7.4, 11.6, P, 24), { tone: "mid", crease: "none" }),
      S(K.cylinder(0, 9, 4.6, 19, 3, P, 24), { tone: "mid" }),
      S(K.slabOf({ x: -2.4, y: 19, w: 4.8, d: 3, r: 0.8 }, 2.6, 2.6, P, 2), { tone: "mid", crease: "none" }),
      S(K.cylinder(0, 24, 3.2, 1.8, 4.2, P, 20), { tone: "mid" }),
      L(K.knurl(0, 24, 3.2, 1.8, 6, 18, P), { tone: "lo" }),
    ].join("");
  }

  // Valve flaps: hinged at a and b, opening (1) toward the direction the blood goes.
  const flaps = (pairs, open, len) => pairs.map(([ax, ay, bx, by, dir]) => {
    const shut = Math.atan2(by - ay, bx - ax), swing = (Math.PI / 2.4) * open * dir;
    const L1 = len, tipA = [ax + Math.cos(shut + swing) * L1, ay + Math.sin(shut + swing) * L1], tipB = [bx - Math.cos(shut - swing) * L1, by - Math.sin(shut - swing) * L1];
    return `M${ax} ${ay} L${tipA[0].toFixed(1)} ${tipA[1].toFixed(1)} M${bx} ${by} L${tipB[0].toFixed(1)} ${tipB[1].toFixed(1)}`;
  }).join(" ");
  const squeeze = (d, cx, cy, k) => `<path d="${d}" transform="translate(${cx} ${cy}) scale(${(1 - k).toFixed(3)}) translate(${-cx} ${-cy})"`;

  // What is printed on the back half's cut face. The chambers and valves change each frame; the flow lines and the
  // names don't, so the flow's marching dashes keep running. Blood only flows through a valve while it is open.
  function chambersSvg(c, lit) {
    const v = 0.07 * c.ventricles, a = 0.06 * c.atria, on = (n) => (n === lit ? ' class="tc-lit"' : "");
    return [
      `<g${on("ra")}>${squeeze(RA, -77, -58, a)} fill="${C.blueBlood}" stroke="${C.blueInk}" stroke-width="2.4"/></g>`,
      `<g${on("rv")}>${squeeze(RV, -78, 52, v)} fill="${C.blueBlood}" stroke="${C.blueInk}" stroke-width="2.4"/></g>`,
      `<g${on("la")}>${squeeze(LA, 77, -58, a)} fill="${C.redBlood}" stroke="${C.redInk}" stroke-width="2.4"/></g>`,
      `<g${on("lv")}>${squeeze(LV, 70, 54, v)} fill="${C.redBlood}" stroke="${C.redInk}" stroke-width="2.4"/></g>`,
    ].join("");
  }
  const valvesSvg = (c) =>
    `<path fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" d="${flaps([[-106, -16, -50, -16, 1], [50, -16, 106, -16, 1]], c.av, 22)}"/>` +
    `<path fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" d="${flaps([[-34, -96, -8, -96, -1], [10, -96, 38, -96, -1]], c.semi, 12)}"/>`;
  const FLOW = [
    { through: "in", ink: "blue", d: "M-113 -150 L-113 -70" }, { through: "av", ink: "blue", d: "M-80 -45 L-80 60" },
    { through: "semi", ink: "blue", d: "M-52 72 C-36 40 -21 20 -21 -132" }, { through: "in", ink: "red", d: "M184 -60 L96 -60" },
    { through: "av", ink: "red", d: "M78 -40 L66 62" }, { through: "semi", ink: "red", d: "M50 74 C34 40 22 20 22 -140" },
  ];
  const flowSvg = () => `<g class="hs-flow" fill="none" stroke-width="2.6" stroke-linecap="round">${FLOW.map((f) =>
    `<path data-through="${f.through}" stroke="${f.ink === "blue" ? C.blueInk : C.redInk}" d="${f.d}"/>`).join("")}</g>`;
  const namesSvg = () => printed(-77, -64, ["right", "atrium"], C.blueInk) + printed(-80, 30, ["right", "ventricle"], C.blueInk) +
    printed(77, -64, ["left", "atrium"], C.redInk) + printed(72, 32, ["left", "ventricle"], C.redInk) + printed(2, 126, ["septum"], C.muscleInk, 13);

  function build(P, root, lab) {
    const body = ISO.sample(BODY, 120), vessels = VESSELS.map((v) => ({ ...v, pts: ISO.sample(v.d, 48) }));
    const ink = (v) => (v.blue ? C.blueInk : C.redInk), shade = (v) => (v.blue ? C.blue : C.red), face = (v) => (v.blue ? C.blueFace : C.redFace);
    const back = vessels.map((v) => prismY(P, v.pts, -VESSEL, 0, shade(v), face(v), ink(v))).join("") +
      prismY(P, body, -HALF, 0, C.muscle, C.muscleFace, C.muscleInk) +
      vessels.map((v) => `<path d="${K.pathOf(v.pts.map(([x, y]) => K.iso(W3(x, y, 0), P)), true)}" fill="${face(v)}" stroke="${ink(v)}" stroke-width="1"/>`).join("") +
      `<g transform="${faceMatrix(P, 0.05)}"><g data-part="chambers"></g>${flowSvg()}<g data-part="valves"></g>${lab ? namesSvg() : ""}</g>`;
    const coronary = `<g transform="${faceMatrix(P, HALF)}" fill="none" stroke="${C.redInk}" stroke-width="2.4" stroke-linecap="round" opacity=".7">` +
      `<path d="M-20 -112 C-40 -60 -70 -10 -112 60"/><path d="M20 -112 C30 -60 40 0 30 128"/><path d="M-60 -112 C-90 -80 -120 -40 -146 -14"/></g>` +
      `<path d="${K.pathOf(ISO.sample('M-120 -40 C-110 -80 -90 -100 -66 -104', 12).map(([x, y]) => K.iso(W3(x, y, HALF), P)))}" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>`;
    const front = vessels.map((v) => prismY(P, v.pts, 0, VESSEL, shade(v), face(v), ink(v))).join("") +
      prismY(P, body, 0, HALF, C.muscle, C.muscleFace, C.muscleInk, coronary);
    const names = lab ? vessels.filter((v) => v.name).map((v) => word(K.iso(W3(v.at[0], v.at[1], 0), P), v.name, ink(v), v.anchor)).join("") : "";
    root.innerHTML = `<g data-part="stand">${standSvg(P)}</g><g data-part="back">${back}</g><g data-part="names">${names}</g>` +
      `<g data-part="front">${carriageSvg(P)}${front}</g>`;
    return {
      chambers: root.querySelector('[data-part="chambers"]'), valves: root.querySelector('[data-part="valves"]'),
      flow: [...root.querySelectorAll("[data-through]")], front: root.querySelector('[data-part="front"]'),
    };
  }

  const pointsOf = () => [...K.boxCorners(BASE, -12, 0), W3(-150, -214, -VESSEL), W3(-150, -214, HALF), [SLIDE + 190 * SC, VESSEL, Z0 + 214 * SC]];
  ISO.add({
    name: "heartsection", title: "Heart (teaching model)", compare: "heartsection 480 290 320",
    about: "Sectioned heart on a stand: the front half slides off, the chambers squeeze and the valves open and shut at 72 beats a minute.",
    line: "heartsection cx cy size lab=1 open=1 beat=1 slow=4 lit=ra|rv|la|lv|valves",
    demo: { line: "heartsection 480 290 320 open=0 beat=0", script: [{ set: {}, hold: 0.8 }, { set: { open: 1 }, hold: "settle" }, { set: { beat: 1 }, hold: 6.6 }, { set: { lit: "lv" }, hold: 3.4 }, { set: { lit: "valves" }, hold: 3.4 }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.8, H = size * 1.3;
      const { P, g } = ISO.frame(pointsOf(), cx, cy, W, H, { azimuth: 70, elevation: 24 }, parent);
      const parts = build(P, g, lab), w = ISO.writer();
      const s = { open: o.open === "0" ? 0 : 1, target: o.open === "0" ? 0 : 1, rate: 0, beating: o.beat !== "0", clock: 0, slow: Math.max(1, ISO.num(o, "slow", 4)), lit: o.lit || "" };
      const period = 60 / BPM;
      let phase = 0.5;
      const draw = () => {
        w.attr(parts.front, "transform", K.translateAlong(P, [SLIDE * s.open, 0, 0]));
        const c = cycleOf(phase);
        w.rebuild(parts.chambers, `${phase.toFixed(3)} ${s.lit}`, () => chambersSvg(c, s.lit));
        w.rebuild(parts.valves, `${phase.toFixed(3)} ${s.lit}`, () => `<g${s.lit === "valves" ? ' class="tc-lit"' : ""}>${valvesSvg(c)}</g>`);
        for (const f of parts.flow) w.attr(f, "opacity", (f.dataset.through === "in" ? 1 : c[f.dataset.through]).toFixed(2));
      };
      g.set = (p) => {
        if (p.open !== undefined) s.target = +p.open ? 1 : 0;
        if (p.beat !== undefined) s.beating = !!+p.beat;
        if (p.slow !== undefined) s.slow = Math.max(1, +p.slow);
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // The carriage glides on a damped spring and comes to rest against its stop.
        if (calm) s.open = s.target; else { s.rate += ((s.target - s.open) * 40 - s.rate * 11) * dt; s.open = ISO.clamp(s.open + s.rate * dt, 0, 1); }
        if ((s.open === 0 || s.open === 1) && Math.abs(s.rate) < 0.02 && Math.abs(s.target - s.open) < 1e-3) { s.open = s.target; s.rate = 0; }
        const beating = s.beating && s.open > 0.97 && !calm;
        if (beating) { s.clock += dt / s.slow; phase = (s.clock / period) % 1; } else phase = 0.5;
        draw();
        return s.open !== s.target || beating;
      };
      g.readout = () => (s.open < 0.97 ? (s.target ? "opening the model" : "model closed") : `${BPM} beats a minute · shown ${s.slow}× slower · ${cycleOf(phase).phase}`);
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
