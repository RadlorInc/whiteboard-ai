// "spiritlevel cx cy length k=level|tilted tilt=deg lab=1 lit=level|vial|bubble|board|foot" — a spirit level on a shelf.
// A 60 cm aluminium box-section level with rubber end caps, a hand hole, a plumb vial at one end and the centre vial
// in a window through the body: a slightly curved glass tube of yellow spirit with an air bubble that always rises
// to the top of the curve. Tilt it by θ and the bubble slides R·θ along the tube (R = 0.8 m here: 1° = 14 mm); between
// the two rings means level to within 0.5°. It sits on a shelf board hinged at its left end, whose right end rests on
// a levelling foot: k=tilted raises the foot, set({ tilt }) or set({ k }) turns it. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BL = 60, BH = 7, BD = 2.8, HX = -35, HZ = 8, SPAN = 70, PT = 2, RV = 80, VL = 5.6, BUB = 1.6, RING = 0.75;
  const ALU = ISO.tint("#e6e9ec", ["#9aa1a9", "#aeb4bb", "#c1c6cc", "#d2d6da"], "#4a525b"), WOOD = ISO.T.wood, RUBBER = ISO.T.rubber, STEEL = ISO.T.steel;
  const SPIRIT = "#e8e05a", BENCH = { x: -42, y: -10, w: 84, d: 20, r: 3 };
  // A point on the tilted shelf: u along it from the hinge, w up from its top, y across.
  const shelf = (th) => (u, w, y) => [HX + u * Math.cos(th) - w * Math.sin(th), y, HZ + u * Math.sin(th) + w * Math.cos(th)];

  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BENCH, -4, 4, P)}"/>`, ISO.tinted(WOOD, S(K.slabOf(BENCH, -4, 4, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BENCH, -2, P, 3), { tone: "faint" }) }))];
    // the hinge block at the left: a post with the hinge pin's knuckles
    out.push(ISO.wbox(P, [HX - 3, HX + 3], [-6, 6], [0, HZ - 1.2], "mid"));
    for (const y of [-5, 3]) out.push(ISO.tinted(STEEL, S(G.disc(0, 2, 1.1, G.frameOf([HX, y, HZ - 1], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    // the levelling foot's base plate and threaded rod at the right
    out.push(ISO.wbox(P, [HX + SPAN - 3, HX + SPAN + 3], [-4, 4], [0, 1], "mid"));
    return out.join("");
  }
  function footSvg(P, th) {
    const x = HX + SPAN, top = HZ + SPAN * Math.tan(th) - 1, out = [];
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, 0, 0.6, 1, top - 1, P, 14), { tone: "hi", crease: "none" })));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, 0, 2.4, 3, 1.6, P, 24, 0.3), { tone: "hi", inner: L(K.knurl(x, 0, 2.4, 3, 4.6, 18, P, 0), { tone: "lo" }) })));
    out.push(ISO.tinted(RUBBER, S(K.cylinder(x, 0, 1.6, top - 0.6, 0.6, P, 18), { tone: "hi" })));
    return out.join("");
  }
  function boardSvg(P, th) {
    const at = shelf(th);
    return ISO.tinted(WOOD, ISO.box(at, P, [-2, SPAN + 2], [-PT, 0], [-7, 7], "mid"));
  }
  // The level on the board: its body, the window with the vial, the end vial, caps and hand hole.
  function levelSvg(P, th, bubble) {
    const at = shelf(th), u0 = SPAN / 2 - BL / 2, u1 = SPAN / 2 + BL / 2, y0 = -BD / 2, y1 = BD / 2, out = [];
    out.push(ISO.tinted(RUBBER, ISO.box(at, P, [u0 - 1.2, u0], [0, BH], [y0 - 0.1, y1 + 0.1], "hi")));
    out.push(ISO.tinted(ALU, ISO.box(at, P, [u0, u1], [0, BH], [y0, y1], "hi")));
    out.push(ISO.tinted(RUBBER, ISO.box(at, P, [u1, u1 + 1.2], [0, BH], [y0 - 0.1, y1 + 0.1], "hi")));
    // milled grooves along the face, edge to edge between the caps
    out.push(`<path d="${[1, BH - 1].map((w) => K.pathOf([K.iso(at(u0, w, y1), P), K.iso(at(u1, w, y1), P)])).join("")}" stroke="#7d858e" stroke-width="0.5" fill="none"/>`);
    const face = (pts, fill, stroke = "#4a525b") => `<path d="${K.pathOf(pts.map(([u, w]) => K.iso(at(u, w, y1 + 0.01), P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="0.6"/>`;
    // hand hole and the plumb vial's window near the right end
    out.push(face([[u0 + 6, 2], [u0 + 15, 2], [u0 + 15.8, 3.5], [u0 + 15, 5], [u0 + 6, 5], [u0 + 5.2, 3.5]], "#3a3e44"));
    out.push(face([[u1 - 8, 1.2], [u1 - 4, 1.2], [u1 - 4, 4.8], [u1 - 8, 4.8]], "#3a3e44"), face([[u1 - 6.8, 1.6], [u1 - 5.2, 1.6], [u1 - 5.2, 4.4], [u1 - 6.8, 4.4]], SPIRIT, "#6b6410"));
    out.push(face([[u1 - 6.6, 3.9], [u1 - 5.4, 3.9], [u1 - 5.4, 4.3], [u1 - 6.6, 4.3]], "#fbfbf0", "#6b6410"));
    // the centre window: the vial (spirit), the bubble at R·θ from the middle, and the two rings
    const c = SPAN / 2;
    out.push(face([[c - VL / 2 - 1, 1.2], [c + VL / 2 + 1, 1.2], [c + VL / 2 + 1, 5.8], [c - VL / 2 - 1, 5.8]], "#3a3e44"));
    out.push(face([[c - VL / 2, 2.3], [c + VL / 2, 2.3], [c + VL / 2, 4.7], [c - VL / 2, 4.7]], SPIRIT, "#6b6410"));
    const b = ISO.clamp(bubble, -VL / 2 + BUB / 2, VL / 2 - BUB / 2), bub = [];
    for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2; bub.push([c + b + Math.cos(a) * BUB / 2, 3.9 + Math.sin(a) * 0.65]); }
    out.push(`<g data-name="bubble">${face(bub, "#fffff4", "#8a8420")}</g>`);
    out.push(`<path d="${[-RING, RING].map((d) => K.pathOf([K.iso(at(c + d, 2.3, y1 + 0.02), P), K.iso(at(c + d, 4.7, y1 + 0.02), P)])).join("")}" stroke="#222" stroke-width="0.7"/>`);
    return out.join("");
  }

  ISO.add({
    name: "spiritlevel", title: "Spirit level", compare: "spiritlevel 480 270 440",
    about: "A spirit level on a shelf board: tilt the board and the bubble slides off to the high side; turn the foot until it sits between the rings and the shelf is level.",
    line: "spiritlevel cx cy length k=level|tilted tilt=deg lab=1 lit=level|vial|bubble|board|foot",
    demo: { line: "spiritlevel 480 270 440 k=tilted", script: [{ set: {}, hold: 1.4 }, { set: { tilt: -0.6 }, hold: "settle" }, { set: { k: "level" }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -4, 4), [HX, 0, HZ + BH + 6], [HX + SPAN, 0, HZ + 2.5 + BH]], cx, cy, W, H, { azimuth: 80, elevation: 18 }, parent);
      g.innerHTML = `<g>${standSvg(P)}</g><g data-name="foot"></g><g data-name="board"></g><g data-name="level"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { foot: q("foot"), board: q("board"), level: q("level"), words: q("words") }, w = ISO.writer();
      const t0 = o.tilt !== undefined ? ISO.num(o, "tilt", 0) : o.k === "tilted" ? 1.2 : 0;
      const s = { tilt: t0, bub: 0 }, goal = { tilt: t0 };
      let lit = o.lit || "";
      s.bub = RV * 10 * (t0 * Math.PI) / 180;
      const draw = () => {
        const th = (s.tilt * Math.PI) / 180, key = s.tilt.toFixed(3);
        w.rebuild(el.foot, key, () => footSvg(P, th));
        w.rebuild(el.board, key, () => boardSvg(P, th));
        w.rebuild(el.level, `${key} ${s.bub.toFixed(3)}`, () => levelSvg(P, th, s.bub / 10));
        w.rebuild(el.words, lab ? `${key} ${Math.round(s.bub)}` : "", () => {
          if (!lab) return "";
          const at = shelf(th), c = SPAN / 2, ok = Math.abs(s.tilt) < 0.05;
          return [ISO.word(K.iso(at(c, BH + 0.6, 0), P), ok ? "bubble between the rings: level" : `bubble off toward the high ${s.tilt > 0 ? "right" : "left"} end`, ok ? "#2c6a22" : "#c0392b", { size: 15, dy: -10 }),
            ISO.word(K.iso([HX + SPAN + 3, 0, 3], P), "levelling foot", "#444", { anchor: "start", size: 14, dy: 6 }),
            ISO.word(K.iso(at(8, -PT, 7), P), "shelf board", "#444", { anchor: "start", size: 14, dy: 16 })].join("");
        });
        const want = lit || (Math.abs(s.tilt - goal.tilt) > 0.005 ? "foot" : "bubble");
        w.light([el.foot, el.board, el.level], want === "bubble" || want === "vial" ? [el.level] : [q(want)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.k) goal.tilt = p.k === "tilted" ? 1.2 : 0;
        if (p.tilt !== undefined) goal.tilt = ISO.clamp(+p.tilt, -3, 3);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), step = 0.6 * dt;               // the foot's thread: about 0.6° a second at the knob
        s.tilt = calm || Math.abs(goal.tilt - s.tilt) <= step ? goal.tilt : s.tilt + Math.sign(goal.tilt - s.tilt) * step;
        // bubble shift (mm) = R θ, the bubble follows with a 0.3 s lag
        const want = RV * 10 * (s.tilt * Math.PI) / 180;
        s.bub = ISO.follow(s.bub, want, dt, 0.3, calm);
        if (Math.abs(s.bub - want) < 0.02) s.bub = want;
        draw();
        return s.tilt !== goal.tilt || s.bub !== want;
      };
      g.readout = () => {
        const mm = Math.tan((s.tilt * Math.PI) / 180) * 1000, sh = RV * 10 * (s.tilt * Math.PI) / 180;
        if (Math.abs(s.tilt) < 0.05) return "level · bubble centred between the rings · shelf drops 0 mm per metre";
        return `tilted ${Math.abs(s.tilt).toFixed(1)}° (${Math.abs(mm).toFixed(0)} mm per metre, ${s.tilt > 0 ? "right" : "left"} end high) · bubble ${Math.abs(Math.min(VL * 5, Math.abs(sh))).toFixed(1)} mm toward the high end`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
