// "jumpstart cx cy width lab=0 step=0..4" — jump-starting a car, as two engine-bay corners nose to nose.
// Left: the DEAD car's bay (battery in its back corner, engine with a bare-metal lift bracket). Right: the GOOD car.
// A red and a black jumper cable lie in the gap with their clamps. set({ step }) puts the clamps on in the safe
// order: 1 red on dead +, 2 red on good +, 3 black on good −, 4 black on bare metal of the dead car's engine (never
// its battery − : the last clamp can spark, and a battery gives off hydrogen). The clamp going on is the lit part.
// Local helpers: clampSvg (a clamp in any pose from one frame), cableSvg (a cable as a stroked 3D route: a disc
// chain rebuilt per frame cost ~2 ms a cable, so the route is drawn as one tube stroke with a shine line).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Group-24 batteries 26 × 17 × 22 cm, posts 2.6 cm tall; the cars stand nose to nose.
  const ROAD = { x: -192, y: -66, w: 384, d: 132, r: 4 };
  const BAT = { w: 26, d: 17, y: -48, z: 6, top: 28 };
  const POST_H = 2.6, POST_Y = -34.4;
  const RED = ISO.tint("#e3685c", ["#a3271b", "#b8342a", "#cc4639", "#dc5649"], "#5e140d");
  const COPPER = ISO.T.copper, STEEL = ISO.T.steel, PLASTIC = ISO.T.plastic, PAINT = ISO.T.paint;
  // The four clamp ends: where each goes on, where it lies before, the cable it belongs to and the gap point its cable
  // passes. side = −1 dead car, +1 good car.
  const BRACKET = [-112, 17.5, 47];
  const ENDS = [
    { id: "c1", cable: "red", on: [-77.5, POST_Y, BAT.top + POST_H - 2.2], rest: [-30, -50], via: [-14, -22], side: -1 },
    { id: "c2", cable: "red", on: [77.5, POST_Y, BAT.top + POST_H - 2.2], rest: [30, -50], via: [14, -22], side: 1 },
    { id: "c3", cable: "black", on: [96.5, POST_Y, BAT.top + POST_H - 2.2], rest: [30, 50], via: [14, 26], side: 1 },
    { id: "c4", cable: "black", on: BRACKET, rest: [-30, 50], via: [-14, 26], side: -1 },
  ];
  const STEPS = [
    { title: "Red on the dead +", say: "Clip one red clamp onto the + post of the dead battery.", lit: "c1" },
    { title: "Red on the good +", say: "Clip the other red clamp onto the + post of the good battery.", lit: "c2" },
    { title: "Black on the good −", say: "Clip one black clamp onto the − post of the good battery.", lit: "c3" },
    { title: "Black on bare metal", say: "Clip the last black clamp onto bare metal on the dead car's engine, away from its battery. If it sparks, the spark is far from the battery's gas.", lit: "c4" },
  ];
  const READ = [
    "nothing connected · dead battery 11.8 V (too flat to crank) · good battery 12.6 V",
    "1 of 4 · red on the dead + · no circuit yet",
    "2 of 4 · red joins both + posts · still no circuit",
    "3 of 4 · black on the good − · one clamp left: it can spark",
    "4 of 4 · circuit closed · good car running at 14.2 V charges the dead one · wait 3 min, then start it",
  ];

  // ── static: road, two bays
  function baySvg(P, side, lab) {
    const sx = (x) => side * x, xs = (a, b) => [Math.min(sx(a), sx(b)), Math.max(sx(a), sx(b))], out = [];
    const at3 = (p) => K.iso(p, P);
    const apron = { x: Math.min(sx(40), sx(184)), y: -58, w: 144, d: 116, r: 3 };
    out.push(ISO.tinted(PAINT, S(K.slabOf(apron, 0, 4, P, 3, 0.5), { tone: "mid" }) + L(K.planOutline(K.insetPlan(apron, 4), 4, P, 3), { tone: "faint" })));
    // Inner wing along the back with a strut tower and its three bolts.
    out.push(ISO.tinted(PAINT, ISO.wbox(P, xs(60, 182), [-58, -52], [4, 34])));
    out.push(ISO.tinted(PAINT, S(K.cylinder(sx(132), -44, 8, 4, 30, P, 32, 0.5), { tone: "mid", inner: L(K.sideArc(sx(132), -44, 8, 26, P, 24), { tone: "faint" }) })));
    const bolts = [0, 2.1, 4.2].map((a) => [sx(132) + Math.cos(a) * 4.6, -44 + Math.sin(a) * 4.6]);
    out.push(S(K.cylinder(sx(132), -44, 3, 34, 1.2, P, 18), { tone: "lo" }), D(bolts.map(([x, y]) => at3([x, y, 34])), { size: 0.6 }));
    // Coolant tank in the far corner.
    const coolant = [];
    coolant.push(ISO.tinted(ISO.T.glass, S(K.cylinder(sx(170), 38, 7, 4, 16, P, 28, 0.4), { tone: "mid", inner: L(K.sideArc(sx(170), 38, 7, 10, P, 24), { tone: "faint" }) })));
    coolant.push(S(K.cylinder(sx(170), 38, 3, 20, 2.4, P, 18), { tone: "mid" }));
    // Battery tray, battery, hold-down bar with its two J bolts, vent caps, posts and the + / − on the lid.
    const bat = out.length, b0 = side < 0 ? -100 : 74, bx = [b0, b0 + BAT.w];
    out.push(S(K.slabOf({ x: b0 - 3, y: BAT.y - 3, w: BAT.w + 6, d: BAT.d + 6, r: 1 }, 4, 2, P, 2, 0.3), { tone: "mid" }));
    out.push(ISO.tinted(PLASTIC, ISO.wbox(P, bx, [BAT.y, BAT.y + BAT.d], [BAT.z, BAT.top - 2], "mid") + ISO.wbox(P, [bx[0] - 0.6, bx[1] + 0.6], [BAT.y - 0.6, BAT.y + BAT.d + 0.6], [BAT.top - 2, BAT.top], "mid")));
    const fm = ISO.faceMatrix(P, [b0 + BAT.w / 2, BAT.y + BAT.d + 0.01, 16], 1);
    out.push(`<g style="--anatomy-mid:#c9ccd1">${K.faceTextSvg(fm, "12 V · 60 Ah", { size: 3.4, tone: "mid", anchor: "middle" })}</g>`);
    const mid = b0 + BAT.w / 2;
    for (const k of [-2, -1, 1, 2]) out.push(ISO.tinted(PLASTIC, S(K.cylinder(mid + k * 4.6, -42.5, 1.4, BAT.top, 0.7, P, 14), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [mid - 1.4, mid + 1.4], [BAT.y - 1.4, BAT.y + BAT.d + 1.4], [BAT.top, BAT.top + 1.2], "mid")));
    for (const y of [BAT.y - 0.9, BAT.y + BAT.d + 0.9]) out.push(ISO.tinted(STEEL, S(K.cylinder(mid, y, 0.5, 6, BAT.top - 6, P, 10), { tone: "mid", crease: "none" })), D([at3([mid, y, BAT.top + 1.2])], { size: 0.7, tone: "lo" }));
    const plus = side < 0 ? -77.5 : 77.5, minus = side < 0 ? -96.5 : 96.5;
    for (const [x, tint] of [[plus, RED], [minus, PLASTIC]]) {
      out.push(ISO.tinted(tint, S(K.cylinder(x, POST_Y, 2.3, BAT.top, 0.6, P, 18), { tone: "mid" })));
      out.push(ISO.tinted(STEEL, S(K.cylinder(x, POST_Y, 1.1, BAT.top + 0.6, POST_H - 0.6, P, 16), { tone: "hi" })));
    }
    for (const [x, t, c] of [[plus, "+", "#b8342a"], [minus, "−", "#c9ccd1"]]) out.push(`<g style="--anatomy-mid:${c}">${K.faceTextSvg(K.topMatrix([x, -40], BAT.top, P), t, { size: 4.4, tone: "mid", anchor: "middle" })}</g>`);
    const engine = [];
    // Engine: block, head, valve cover with four coils, oil cap, and the lift bracket (bare metal) on its inner side.
    engine.push(ISO.wbox(P, xs(120, 172), [-30, 26], [4, 34], "mid"));
    engine.push(ISO.wbox(P, xs(122, 170), [-27, 23], [34, 39], "mid"));
    engine.push(ISO.tinted(PLASTIC, ISO.wbox(P, xs(125, 167), [-23, 19], [39, 45], "mid")));
    for (const x of [132, 142, 152, 162]) engine.push(ISO.tinted(PLASTIC, ISO.wbox(P, xs(x - 3, x + 3), [-3, 3], [45, 49], "mid")), D([at3([sx(x), 0, 49])], { size: 0.5, tone: "lo" }));
    engine.push(S(K.cylinder(sx(132), 12, 3.4, 45, 1.8, P, 20, 0.3), { tone: "hi" }), L(K.ring(sx(132), 12, 2, 46.8, P, 16), { tone: "faint" }));
    engine.push(ISO.tinted(STEEL, ISO.wbox(P, xs(108, 120), [16, 19], [33, BRACKET[2]], "hi")));
    engine.push(D([at3([sx(117), 19, 37]), at3([sx(117), 19, 43])], { size: 0.55, tone: "lo" }), L(K.sideRing([sx(112), 19.02, 42], 1.6, "y", P, 16), { tone: "lo" }));
    // Far to near: the dead bay's battery is nearer than its engine, the good bay's engine nearer than its battery.
    out.splice(side > 0 ? out.length : bat, 0, ...engine, ...coolant);
    // Radiator behind the bumper, fins edge to edge on its inner face, cap on top; bumper with two headlamps.
    const rx = xs(52, 60), face = side < 0 ? rx[1] + 0.02 : rx[0] - 0.02;
    const fins = [];
    if (side < 0) for (let y = -40; y <= 40; y += 4) fins.push(K.segment([face, y, 4], [face, y, 30], P));
    out.push(S(K.slabOf({ x: rx[0], y: -46, w: 8, d: 92, r: 0.6 }, 4, 26, P, 2, 0.4), { tone: "mid", inner: L(fins.join(""), { tone: "faint" }) }));
    out.push(S(K.cylinder(sx(56), 34, 2.4, 30, 1.6, P, 16), { tone: "hi" }));
    out.push(ISO.tinted(PAINT, S(K.slabOf({ x: Math.min(sx(38), sx(46)), y: -54, w: 8, d: 108, r: 2 }, 4, 10, P, 3, 0.5), { tone: "mid", inner: L(K.sideSeam({ x: Math.min(sx(38), sx(46)), y: -54, w: 8, d: 108, r: 2 }, 9, P, 3), { tone: "faint" }) })));
    for (const y of [-42, 42]) out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, xs(39, 45), [y - 7, y + 7], [14, 18], "mid")));
    // Grille slots on the dead car's nose (the good car's nose faces away from us).
    if (side < 0) out.push(L([-24, -16, -8, 0, 8, 16, 24].map((y) => K.pathOf([[y - 3, 6.5], [y + 3, 6.5], [y + 3, 11.5], [y - 3, 11.5]].map(([v, z]) => K.iso([-37.98, v, z], P)), true)).join(""), { tone: "lo" }));
    if (lab) {
      out.push(ISO.word(at3([sx(112), 58, 0]), side < 0 ? "DEAD" : "GOOD", side < 0 ? "#8f2a22" : "#2c6a22", { dy: 26, size: 18 }));
      if (side < 0) out.push(ISO.word(at3([sx(114), 19, 33]), "bare metal", "#555", { dy: 18, size: 14, anchor: "middle" }));
    }
    return out.join("");
  }

  // ── a clamp in any pose: tip at o, a = tip → tail, s = the axis the jaws open along.
  function clampSvg(P, o, a, s, black, lit) {
    const n = G.unit3(G.cross3(a, s)), at = (u, w, y) => G.add3(o, G.add3(G.mul3(s, u), G.add3(G.mul3(a, w), G.mul3(n, y))));
    const grip = black ? PLASTIC : RED, out = [];
    for (const u of [[-3.8, -1.6], [1.6, 3.8]]) out.push(ISO.tinted(COPPER, ISO.box(at, P, u, [0, 7], [-2, 2], "hi", lit)));
    out.push(ISO.tinted(STEEL, S(G.disc(-4.6, 4.6, 1.3, G.frameAlong(at(0, 8, 0), s), P, { steps: 16 }), { tone: "hi", lit })));
    for (const u of [[-4.2, -1.4], [1.4, 4.2]]) out.push(ISO.tinted(grip, ISO.box(at, P, u, [9, 23], [-2.6, 2.6], "hi", lit)));
    out.push(ISO.tinted(grip, ISO.box(at, P, [-1.4, 1.4], [20, 22], [-1.6, 1.6], "mid", lit)));
    return out.join("");
  }
  // Where a clamp is and how it lies, for progress p (0 lying in the gap, 1 on its terminal).
  function poseOf(end, p) {
    const e = ISO.ease(p), d = G.unit3([end.via[0] - end.rest[0], end.via[1] - end.rest[1], 0]);
    const tilt = (Math.PI / 2) * (1 - ISO.smooth(0.05, 0.75, p));
    const a = G.unit3([Math.sin(tilt) * d[0], Math.sin(tilt) * d[1], Math.cos(tilt)]);
    const sRest = [-d[1], d[0], 0], s0 = G.unit3(G.lerp3(sRest, [0, 1, 0], ISO.smooth(0.05, 0.75, p)));
    const n = G.unit3(G.cross3(a, s0)), s = G.unit3(G.cross3(n, a));
    const rest = [end.rest[0], end.rest[1], 2.7];
    const o = G.add3(G.lerp3(rest, end.on, e), [0, 0, 34 * Math.sin(Math.PI * e)]);
    return { o, a, s, tail: G.add3(o, G.mul3(a, 21.5)) };
  }
  // A cable between two clamp tails, through the gap: a filleted 3D route drawn as one stroked tube with a shine.
  function cableSvg(P, A, B, ea, eb, pa, pb, black) {
    const over = (pose, end, p) => {
      const near = G.lerp3(G.add3(pose.tail, G.mul3(pose.a, 6)), [end.via[0], end.via[1], 1], 0.5);
      return G.lerp3(near, [end.side * 49, (end.on[1] + end.via[1]) / 2, 42], ISO.smooth(0.2, 0.8, p));
    };
    const pts = [A.tail, G.add3(A.tail, G.mul3(A.a, 6)), over(A, ea, pa), [ea.via[0], ea.via[1], 1], [eb.via[0], eb.via[1], 1], over(B, eb, pb), G.add3(B.tail, G.mul3(B.a, 6)), B.tail];
    const route = G.fillet(pts, 9, 6).map((p) => K.iso(p, P)), d = K.pathOf(route), k = G.scaleOf(P), w = 2 * 1.0 * k;
    const [edge, body, shine] = black ? ["#0d0e10", "#3a3d42", "#7b8088"] : ["#5e140d", "#cf4a3c", "#f3a197"];
    return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${edge}" stroke-width="${(w + 1.2).toFixed(2)}"/><path d="${d}" stroke="${body}" stroke-width="${w.toFixed(2)}"/>` +
      `<path d="${d}" stroke="${shine}" stroke-width="${(w * 0.28).toFixed(2)}" transform="translate(${(-w * 0.18).toFixed(2)} ${(-w * 0.22).toFixed(2)})"/></g>`;
  }

  ISO.add({
    name: "jumpstart", title: "Jump-start a car (4 steps)", compare: "jumpstart 480 280 460", steps: STEPS,
    about: "Dead and good cars' battery corners nose to nose, red and black jumper cables with clamps; the clamps go on in the safe order, the last on bare metal.",
    line: "jumpstart cx cy width lab=0 step=0..4",
    demo: { line: "jumpstart 480 280 460", script: [1, 2, 3, 4].map((n) => ({ set: { step: n }, hold: "settle" })) },
    make([cx, cy, W = 460], o, t, parent) {
      const lab = o.lab !== "0", Wd = W * 1.62, H = Wd * 0.6;
      const { P, g } = ISO.frame([...K.boxCorners(ROAD, -5, 0), [-150, -58, 55], [150, -58, 55], [0, -50, 66]], cx, cy, Wd, H, { azimuth: 58, elevation: 36 }, parent);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(ROAD, -5, 5, P)}"/>` +
        ISO.tinted(ISO.T.road, S(K.slabOf(ROAD, -5, 5, P, 4, 0.8), { tone: "mid" }) + L(K.planOutline(K.insetPlan(ROAD, 5), 0, P, 4), { tone: "faint" })) +
        baySvg(P, -1, lab) + baySvg(P, 1, lab) +
        `<g data-part="red"></g><g data-name="c1"></g><g data-name="c2"></g><g data-part="black"></g><g data-name="c3"></g><g data-name="c4"></g><g data-part="nums"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-name]")].map((e) => [e.dataset.name, e]));
      const red = g.querySelector('[data-part="red"]'), black = g.querySelector('[data-part="black"]'), nums = g.querySelector('[data-part="nums"]');
      const w = ISO.writer(), parts = Object.values(el);
      const s = { step: ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 4), p: [0, 0, 0, 0] };
      s.p = s.p.map((_, i) => (i < s.step ? 1 : 0));
      const draw = () => {
        const poses = ENDS.map((e, i) => poseOf(e, s.p[i]));
        ENDS.forEach((e, i) => w.rebuild(el[e.id], s.p[i].toFixed(4), () => clampSvg(P, poses[i].o, poses[i].a, poses[i].s, e.cable === "black", false)));
        w.rebuild(red, `${s.p[0].toFixed(4)} ${s.p[1].toFixed(4)}`, () => cableSvg(P, poses[0], poses[1], ENDS[0], ENDS[1], s.p[0], s.p[1], false));
        w.rebuild(black, `${s.p[3].toFixed(4)} ${s.p[2].toFixed(4)}`, () => cableSvg(P, poses[3], poses[2], ENDS[3], ENDS[2], s.p[3], s.p[2], true));
        w.rebuild(nums, lab ? s.p.map((p) => (p > 0.98 ? 1 : 0)).join("") : "", () => lab ? ENDS.map((e, i) => (s.p[i] > 0.98 ? ISO.word(K.iso(poses[i].tail, P), String(i + 1), e.cable === "black" ? "#222" : "#b8342a", { dy: -8, size: 17 }) : "")).join("") : "");
        const lit = STEPS[s.step - 1]?.lit;
        w.light(parts, lit ? [el[lit]] : []);
      };
      g.set = (q) => { if (q.step !== undefined) s.step = ISO.clamp(Math.round(+q.step), 0, 4); };
      g.update = (dt) => {
        let moving = false;
        s.p = s.p.map((p, i) => {
          const target = i < s.step ? 1 : 0;
          if (ISO.still()) return target;
          // One clamp at a time: a clamp starts only when the ones before it have landed.
          if (target > p && i > 0 && s.p[i - 1] < 1) return p;
          const next = target > p ? Math.min(target, p + dt / 1.9) : Math.max(target, p - dt / 1.2);
          if (next !== target) moving = true;
          return next;
        });
        draw();
        return moving;
      };
      g.readout = () => {
        const going = s.p.findIndex((p, i) => p > 0 && p < 1 && i < s.step);
        return going >= 0 ? `clamp ${going + 1} going on · ${STEPS[going].title.toLowerCase()}` : READ[s.p.filter((p) => p >= 1).length];
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
