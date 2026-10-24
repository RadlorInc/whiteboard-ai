// "oilfilter cx cy height turns=0 lab=1 lit=filter" — a spin-on oil filter on its mount, and a new one beside it.
// An engine wall on a stand carries the filter head: a cast boss on a web with a machined face, a ring of inlet holes
// round a threaded centre stud. The old filter screws onto it: a blue can with grip ridges on its closed end, a rolled
// seam and a printed band. The new filter stands upside down beside it so you see what the old one hides: the base plate
// with its six inlet holes round the threaded centre hole, and the black rubber gasket. set({ turns }) unscrews the old
// can by that many turns, anticlockwise seen from its end (a 20 × 1.5 mm thread: 1.5 mm up per turn, free after 7);
// set({ off: 1 }) lifts it clear. World units are millimetres.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 38, HIGH = 100, PITCH = 1.5, FREE = 7, FACE = 62;           // can radius and height; head face height
  const NEW = [150, 14], WALL = { x: -95, y: -86, w: 190, d: 34, r: 3 }, BOARD = { x: -120, y: -100, w: 330, d: 180, r: 8 };
  const GASKET = 1.6, LIFT_OFF = 46;
  // The can's half-section from the base plate up: plate rim, rolled seam, body, rounded shoulder, flat end.
  const CAN = [[GASKET, 33], [GASKET + 0.4, 36.4], [GASKET + 2, 38.6, 1], [GASKET + 4.6, 38.6, 1], [GASKET + 6, R], [86, R], [91, 37.4, 1], [95.5, 35.4, 1], [98.6, 31.4, 1], [HIGH, 26]];
  const BAND = [30, 66];                    // the printed band
  const up = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const RUBBER = ISO.T.rubber, BLUE = ISO.tint("#d7e6fb", ["#3d6fb3", "#5384c6", "#6d9ad5", "#89b0e2"], "#163a6e");

  function benchSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD, { h: 8 })];
    // the engine wall: a casting with ribs, a seam and four bolts, standing on the stand
    out.push(S(K.slabOf(WALL, 0, 150, P, 3, 1), { tone: "mid", inner: L(K.sideSeam(WALL, 126, P, 3), { tone: "faint" }) }));
    const ribs = [];
    for (let x = -85; x <= 85; x += 10) if (Math.abs(x) > 30) ribs.push(K.segment([x, WALL.y + WALL.d, 0], [x, WALL.y + WALL.d, 126], P));
    out.push(L(ribs.join(""), { tone: "faint" }));
    const bolts = [[-80, 138], [-30, 138], [30, 138], [80, 138]];
    for (const [x, z] of bolts) {
      const F = G.frameOf([x, WALL.y + WALL.d, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      out.push(S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 4, Math.sin(i * 1.047) * 4]), 0, 3, P), { tone: "mid" }));
    }
    // the filter head: a web out of the wall, the boss, its machined face with a seal ring, inlet holes and the stud
    out.push(S(K.slabOf({ x: -22, y: WALL.y + WALL.d, w: 44, d: 40, r: 2 }, FACE - 30, 22, P, 3, 0.6), { tone: "mid" }));
    const Fh = up([0, 0, FACE - 26]);
    const head = [S(G.solidOf([[0, 30], [14, 33, 1], [20, 40], [26, 40]], Fh, P), { tone: "mid" }), S(G.disc(26, 26.6, 37, Fh, P), { tone: "hi" })];
    head.push(L(G.circleOf(Fh, 26.6, 31, P) + G.circleOf(Fh, 26.6, 26, P), { tone: "faint" }));
    for (let k = 0; k < 6; k++) {
      const c = G.pointOf(Fh, 26.6, 18, k * Math.PI / 3 + 0.5);
      head.push(`<path d="${G.circleOf(up(c), 0, 3.2, P)}" fill="#3b3f46"/>`);
    }
    // the oil pressure switch screwed into the side of the web, with its plug
    const Fp = G.frameOf([22, WALL.y + WALL.d + 22, FACE - 19], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    head.push(S(G.prismOf(Fp, Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 5, Math.sin(i * 1.047) * 5]), 0, 4, P), { tone: "mid" }), S(G.disc(4, 11, 3.6, Fp, P), { tone: "hi" }));
    head.push(ISO.tinted(ISO.T.plastic, S(G.disc(11, 17, 4.4, Fp, P), { tone: "hi" })));
    out.push(`<g data-name="head">${head.join("")}</g>`);
    const Fs = up([0, 0, FACE]), stud = [S(G.disc(0, 16, 9.4, Fs, P), { tone: "hi", inner: L([3, 6, 9, 12].map((s) => G.arcOf(Fs, s, 9.4, P)).join(""), { tone: "lo" }) }), L(G.circleOf(Fs, 16, 5.6, P), { tone: "lo" })];
    out.push(`<g data-name="stud">${stud.join("")}</g>`);
    if (lab) {
      out.push(ISO.word(K.iso([-44, WALL.y + WALL.d + 40, FACE - 34], P), "Filter mount", "#555", { anchor: "end", size: 15 }));
      out.push(ISO.word(K.iso([WALL.x + WALL.w - 30, WALL.y + WALL.d, 150], P), "Engine", "#555", { dy: -8, size: 15 }));
    }
    return out.join("");
  }

  // One filter can on frame F (its axis points from the base plate to the closed end).
  function canSvg(P, F) {
    const out = [ISO.tinted(RUBBER, S(G.ringBand(0, GASKET, 27, 32, F, P), { tone: "hi" }))];
    out.push(S(G.solidOf(CAN, F, P), { tone: "hi", inner: L(G.arcOf(F, GASKET + 6, R, P), { tone: "faint" }) + L(G.arcOf(F, BAND[0], R, P) + G.arcOf(F, BAND[1], R, P), { tone: "mid" }) }));
    return ISO.tinted(BLUE, out.join(""));
  }
  // What turns with the can: the grip ridges on the shoulder and the edges of the printed band.
  function turnSvg(P, F, a, lit) {
    const out = [K.fadedSvg(G.ribsOf(F, 86, 95, R, 30, P, { phase: a, fade: [0.12, 0.5], r1: 35.6, seams: true }), { tone: "lo" })];
    return ISO.tinted(BLUE, out.join(""));
  }
  // The new filter upside down: base plate up, six inlet holes, threaded centre hole and the gasket.
  function newSvg(P, lab) {
    const F = G.frameOf([NEW[0], NEW[1], HIGH], [0, 0, -1], [1, 0, 0], [0, -1, 0]), top = up([NEW[0], NEW[1], HIGH - GASKET + 0.6]);
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: NEW[0] - R, y: NEW[1] - R, w: 2 * R, d: 2 * R, r: R }, 0, HIGH, P)}"/>`];
    const body = [S(G.solidOf(CAN, F, P), { tone: "hi" })];
    body.push(K.fadedSvg(G.ribsOf(F, 86, 95, R, 30, P, { phase: 0.3, fade: [0.12, 0.5], r1: 35.6, seams: true }), { tone: "lo" }));
    body.push(L(G.arcOf(F, BAND[0], R, P) + G.arcOf(F, BAND[1], R, P), { tone: "mid" }));
    out.push(ISO.tinted(BLUE, body.join("")));
    // base plate: a pressed steel disc inside the seam, six holes, the threaded centre and its rings
    const plate = [S(G.disc(GASKET - 0.6, GASKET, 33, F, P), { tone: "hi" }), `<g data-name="gasket">${ISO.tinted(RUBBER, S(G.ringBand(-GASKET, GASKET - 0.6, 26, 32, F, P), { tone: "hi" }))}</g>`,
      `<path d="${G.circleOf(top, 0, 26, P)}" class="iso-fill" style="fill:#e3e5e8"/>`, L(G.circleOf(top, 0, 22, P), { tone: "faint" })];
    for (let k = 0; k < 6; k++) plate.push(`<path d="${G.circleOf(up(G.pointOf(top, 0, 16, k * Math.PI / 3)), 0, 3, P)}" fill="#3b3f46"/>`);
    plate.push(`<path d="${G.circleOf(top, 0, 9.6, P)}" fill="#3b3f46"/>`, L(G.circleOf(top, 0, 9.6, P) + G.circleOf(top, 0, 8, P), { tone: "lo" }));
    out.push(`<g data-name="plate">${ISO.tinted(ISO.T.steel, plate.join(""))}</g>`);
    if (lab) {
      out.push(ISO.word(K.iso([NEW[0] + 34, NEW[1] + 34, HIGH], P), "Gasket", "#333", { anchor: "start", dy: 4, size: 15 }));
      out.push(ISO.word(K.iso([NEW[0], NEW[1] + R, 0], P), "New filter, base plate up", "#555", { dy: 26, size: 15 }));
    }
    return out.join("");
  }

  ISO.add({
    name: "oilfilter", title: "Spin-on oil filter", compare: "oilfilter 480 270 260",
    about: "Old filter on its mount and a new one upside down beside it; the old can unscrews anticlockwise, rises on its thread and lifts off.",
    line: "oilfilter cx cy height turns=0-7 off=0|1 lab=1 lit=filter|head|stud|gasket|plate",
    demo: { line: "oilfilter 480 270 260", script: [{ set: { turns: 3 }, hold: "settle" }, { set: { turns: FREE }, hold: "settle" }, { set: { off: 1 }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0";
      const W = size * 2.75, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), ...K.boxCorners(WALL, 0, 150), [0, 0, FACE + FREE * PITCH + LIFT_OFF + HIGH + 4], [NEW[0] + R, NEW[1] + R, 0]], cx, cy, W, H, { azimuth: 58, elevation: 26 }, parent);
      g.innerHTML = `<g>${benchSvg(P, lab)}</g><g data-part="old"><g data-name="filter"><g data-part="can"></g><g data-part="turn"></g></g></g><g>${newSvg(P, lab)}</g>`;
      const q = (s) => g.querySelector(`[data-part="${s}"]`), old = q("old"), turn = q("turn"), w = ISO.writer();
      const F0 = up([0, 0, FACE]);
      q("can").innerHTML = canSvg(P, F0);
      const s = { turns: ISO.clamp(ISO.num(o, "turns", 0), 0, FREE), off: +(o.off === "1") };
      const want = { ...s };
      let lit = o.lit || "filter";
      const draw = () => {
        w.attr(old, "transform", K.translateAlong(P, [0, 0, s.turns * PITCH + s.off * LIFT_OFF]));
        w.rebuild(turn, s.turns.toFixed(3), () => turnSvg(P, F0, s.turns * Math.PI * 2, lit === "filter"));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.turns !== undefined) want.turns = ISO.clamp(+p.turns, 0, FREE);
        if (p.off !== undefined) { want.off = +p.off ? 1 : 0; if (want.off) want.turns = FREE; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // a hand turns the can at about one turn a second; it only lifts off once the thread is free
        const step = dt * 1.1;
        s.turns = calm ? want.turns : Math.abs(want.turns - s.turns) <= step ? want.turns : s.turns + Math.sign(want.turns - s.turns) * step;
        const target = s.turns >= FREE ? want.off : 0;
        s.off = ISO.follow(s.off, target, dt, 0.35, calm);
        if (Math.abs(s.off - target) < 2e-3) s.off = target;
        draw();
        return s.turns !== want.turns || s.off !== target;
      };
      g.readout = () => {
        const tr = Math.round(s.turns * 4) / 4, mm = (s.turns * PITCH).toFixed(1);
        if (s.off > 0.02) return `free after ${FREE} turns · old filter off · new one: oil its gasket, screw on, ¾ turn after it touches`;
        return tr <= 0 ? "screwed on · gasket pressed to the mount" : `${tr} of ${FREE} turns anticlockwise · can up ${mm} mm on a 1.5 mm thread`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
