// "sofa cx cy width lift=0..1 lab=1 lit=frame|arms|back|cushions|springs|legs" — a three-seat sofa.
// A 2 m sofa, 90 cm deep and 85 cm high (seat 45 cm up): a base on four tapered wooden legs, two rolled arms, the
// back, three back cushions with buttons, three seat cushions with piped edges and an orange throw cushion. Under
// the seat cushions is the deck: zig-zag ("sinuous") springs of flat steel wire hooked to a front and a back rail.
// set({ lift: 1 }) tips the middle seat cushion up on its back edge, front first, to show them; lift: 0 lays it back. 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 1000, Y = 450, LEG = 120, DECK = 420, SEAT = 150, AW = 180, AH = 650, BY = -250, BH = 850, IX = X - AW;
  const FLOOR = { x: -1250, y: -650, w: 2500, d: 1300, r: 20 };
  const BLUE = ["#2f5f9a", "#8fb6e6"], BLUEF = "#6f9bd3", CUSH = ["#3d6fae", "#a6c6ee"], CUSHF = "#86aee2", INK = "#1f4a7a";
  const SEATS = [[-IX + 2, -IX / 3 - 2], [-IX / 3 + 2, IX / 3 - 2], [IX / 3 + 2, IX - 2]];
  const FX = (o) => G.frameOf(o, [0, 0, 1], [0, 1, 0], [1, 0, 0]);          // outlines in (y, z), extruded along x
  const topRound = (y0, z0, y1, z1, r, n = 6) => {
    const pts = [[y0, z0], [y1, z0]];
    for (let i = 0; i <= n; i++) { const a = (i / n) * (Math.PI / 2); pts.push([y1 - r + Math.cos(a) * r, z1 - r + Math.sin(a) * r]); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push([y0 + r + Math.cos(a) * r, z1 - r + Math.sin(a) * r]); }
    return pts;
  };

  function legsSvg(P) {
    const out = [];
    for (const [x, y] of [[-X + 70, -Y + 70], [X - 70, -Y + 70], [-X + 70, Y - 70], [X - 70, Y - 70]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P)))
      out.push(ISO.tinted(ISO.tint("#c79a62", ["#5a3a1a", "#6e4a26", "#835a32", "#986c40"], "#2a1a0a"), S(G.solidOf([[0, 16], [LEG - 10, 24], [LEG, 24]], DAILY.zAx([x, y, 0]), P, { steps: 20 }), { tone: "mid" })));
    return out.join("");
  }
  // The base (an upholstered box), the deck inset in its top with the springs and rails, the back.
  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -X, y: -Y, w: 2 * X, d: 2 * Y, r: 30 }, 0, LEG, P)}"/>`];
    out.push(DAILY.prism(P, FX([-X + AW - 1, 0, 0]), topRound(-Y, LEG, Y, DECK, 30), 0, 2 * IX + 2, BLUE, BLUEF, INK,
      `<path d="${K.pathOf([[SEATS[1][0], BY], [SEATS[1][1], BY], [SEATS[1][1], Y - 14], [SEATS[1][0], Y - 14]].map(([x, y]) => K.iso([x, y, DECK + 0.3], P)), true)}" fill="#2a3442" stroke="${INK}" stroke-width=".8"/>`));
    return out.join("");
  }
  // (audit: the rails sit on the base, a DAILY.prism the audit does not record, so they read as "loose".)
  function springsSvg(P) {
    const out = [], k = K.cameraOf(P).k, x0 = SEATS[1][0], x1 = SEATS[1][1];
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0, x1], [Y - 40, Y - 14], [DECK, DECK + 18], "mid")), ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0, x1], [BY, BY + 26], [DECK, DECK + 18], "mid")));
    let d = "";
    for (let i = 0; i < 5; i++) {
      const x = x0 + 50 + (i * (x1 - x0 - 100)) / 4, pts = [];
      for (let y = BY + 26, j = 0; y <= Y - 40; y += 30, j++) pts.push(K.iso([x + (j % 2 ? 24 : -24), Math.min(y, Y - 40), DECK + 12], P));
      pts[0] = K.iso([x, BY + 26, DECK + 12], P); pts[pts.length - 1] = K.iso([x, Y - 40, DECK + 12], P);
      d += K.pathOf(pts);
    }
    out.push(`<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(9 * k).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c7c9cd" stroke-width="${(4 * k).toFixed(2)}" stroke-linejoin="round"/>`);
    return out.join("");
  }
  function armSvg(P, side) {
    const x0 = side < 0 ? -X : IX, Farm = FX([x0, 0, 0]);
    // the arm with its rolled top, a front panel set into its face, and the piping round the roll
    return DAILY.prism(P, Farm, topRound(-Y, LEG, Y, AH, 80), 0, AW, BLUE, BLUEF, INK);
  }
  function backSvg(P) {
    return DAILY.prism(P, FX([-IX, 0, 0]), topRound(-Y, DECK, BY, BH, 70), 0, 2 * IX, BLUE, BLUEF, INK);
  }
  // A back cushion leaning back 10° on the back, with two buttons pulled into it.
  function backCushionSvg(P, [x0, x1]) {
    const a = 0.17, F = G.frameOf([x0, BY + 6, DECK + SEAT], [0, -Math.sin(a), Math.cos(a)], [0, Math.cos(a), Math.sin(a)], [1, 0, 0]);
    const out = DAILY.prism(P, F, DAILY.rrect(0, 0, 170, 270, 55, 5), 0, x1 - x0, CUSH, CUSHF, INK);
    const btn = [0.33, 0.67].map((f) => K.iso(DAILY.at(F, 172, 150, (x1 - x0) * f), P));
    return out + `<g fill="#2f5f9a" stroke="${INK}" stroke-width=".7">${btn.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(9 * K.cameraOf(P).k).toFixed(2)}"/>`).join("")}</g>`;
  }
  // A seat cushion turned a about its back-bottom edge (0 lying, its front lifting until it leans on the back
  // cushions), its piping a ring round the end face.
  function seatSvg(P, [x0, x1], a = 0) {
    const F = G.frameOf([x0, BY, DECK], [0, -Math.sin(a), Math.cos(a)], [0, Math.cos(a), Math.sin(a)], [1, 0, 0]), D = Y - 8 - BY;
    return DAILY.prism(P, F, DAILY.rrect(0, 0, D, SEAT, 40, 5), 0, x1 - x0, CUSH, CUSHF, INK,
      `<path d="${K.pathOf(DAILY.rrect(14, 14, D - 14, SEAT - 14, 26, 4).map(([u, ss]) => K.iso(DAILY.at(F, u, ss, (x1 - x0) * (G.dot3([1, 0, 0], G.viewOf(P)) > 0 ? 1 : 0) + 0.5 * Math.sign(G.viewOf(P)[0])), P)), true)}" fill="none" stroke="${INK}" stroke-width=".6" opacity=".5"/>`);
  }
  function throwSvg(P) {
    const a = 0.35, x0 = SEATS[0][0] + 80, F = G.frameOf([x0, BY + 175, DECK + SEAT], [0, -Math.sin(a), Math.cos(a)], [0, Math.cos(a), Math.sin(a)], [1, 0, 0]);
    return DAILY.prism(P, F, DAILY.rrect(0, 0, 120, 380, 50, 5), 0, 380, ["#b8650c", "#f8c070"], "#f4a531", "#7a3a08");
  }

  ISO.add({
    name: "sofa", title: "Three-seat sofa", compare: "sofa 480 280 400",
    about: "A three-seat sofa: the middle seat cushion tips up against the back to show the zig-zag steel springs it rests on.",
    line: "sofa cx cy width lift=0..1 lab=1 lit=frame|arms|back|cushions|springs|legs",
    demo: { line: "sofa 480 280 400", script: [{ set: {}, hold: 1 }, { set: { lift: 1 }, hold: "settle" }, { set: { lit: "springs" }, hold: 1.4 }, { set: { lift: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, Hh = size * 1.0;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -20, 0), [0, -Y, BH], [0, Y, DECK + 760]], cx, cy, W, Hh, { azimuth: 62, elevation: 20 }, parent);
      const floor = `<path class="iso-halo" d="${K.haloOf(FLOOR, -20, 20, P)}"/>` + DAILY.prism(P, G.frameOf([0, 0, -20], [0, 1, 0], [1, 0, 0], [0, 0, 1]), DAILY.rrect(FLOOR.x, FLOOR.y, FLOOR.x + FLOOR.w, FLOOR.y + FLOOR.d, 20, 3), 0, 20, ["#b8b0a0", "#ece6da"], "#e8e2d4", "#6a6458",
        // the rug's border, a closed ring inset from its edge
        `<path d="${K.pathOf(DAILY.rrect(FLOOR.x + 60, FLOOR.y + 60, FLOOR.x + FLOOR.w - 60, FLOOR.y + FLOOR.d - 60, 10, 2).map(([x, y]) => K.iso([x, y, 0.3], P)), true)}" fill="none" stroke="#b8ae98" stroke-width="2"/>`);
      const order = [...SEATS].map((s, i) => [s, i]).sort((a, b) => K.depthOf([a[0][0], 0, DECK], P) - K.depthOf([b[0][0], 0, DECK], P));
      const nearArm = G.viewOf(P)[0] > 0 ? 1 : -1;
      g.innerHTML = floor + `<g data-name="legs">${legsSvg(P)}</g><g data-name="frame">${baseSvg(P)}</g><g data-name="springs">${springsSvg(P)}</g>` +
        `<g data-name="arm${-nearArm}">${armSvg(P, -nearArm)}</g><g data-name="back">${backSvg(P)}</g>` +
        `<g data-k="bc">${order.map(([sx]) => backCushionSvg(P, sx)).join("")}</g>` +
        order.map(([sx, i]) => `<g data-k="seat${i}">${i === 1 ? "" : seatSvg(P, sx)}</g>`).join("") +
        `<g data-k="throw">${throwSvg(P)}</g><g data-name="arm${nearArm}">${armSvg(P, nearArm)}</g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["legs", "frame", "springs", "back", "bc", "seat0", "seat1", "seat2", "throw", "words"].map((n) => [n, q(n)]));
      el.arms = [q("arm1"), q("arm-1")];
      const w = ISO.writer(), memo = DAILY.memo();
      const l0 = ISO.clamp(ISO.num(o, "lift", 0), 0, 1);
      const s = { lift: l0, want: l0 };
      let lit = o.lit || "";
      const draw = () => {
        const lk = (Math.round(s.lift * 120) / 120).toFixed(4);
        w.rebuild(el.seat1, lk, () => memo(lk, () => seatSvg(P, SEATS[1], +lk * 1.2)));
        w.rebuild(el.words, lab ? `${s.lift > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-X, Y, AH], P), "arm", "#1f4a7a", { anchor: "end", size: 15, dy: -4 }),
          ISO.word(K.iso([0, BY, BH], P), "back cushions", "#1f4a7a", { size: 15, dy: -10 }),
          s.lift > 0.5 ? ISO.word(K.iso([SEATS[1][1], Y, DECK + 20], P), "zig-zag springs", "#3c3f45", { anchor: "start", size: 15, dy: 18 }) : ISO.word(K.iso([0, Y, DECK + SEAT], P), "seat cushions", "#1f4a7a", { size: 15, dy: 22 }),
          ISO.word(K.iso([X - 70, Y - 70, 0], P), "legs", "#5a3a1a", { anchor: "start", size: 13, dy: 14 })].join(""));
        const want = lit || (s.lift > 0.02 && s.lift < 0.98 ? "cushions" : "");
        const groups = { frame: [el.frame], arms: el.arms, back: [el.back, el.bc], cushions: [el.seat0, el.seat1, el.seat2, el.bc, el.throw], springs: [el.springs], legs: [el.legs] };
        w.light([el.frame, ...el.arms, el.back, el.bc, el.seat0, el.seat1, el.seat2, el.throw, el.springs, el.legs], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.lift !== undefined) s.want = ISO.clamp(+p.lift || 0, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.lift = calm ? s.want : Math.abs(s.want - s.lift) <= dt * 0.9 ? s.want : s.lift + Math.sign(s.want - s.lift) * dt * 0.9;
        draw();
        return s.lift !== s.want;
      };
      g.readout = () => (s.lift > 0.5 ? "under the cushion: 5 zig-zag springs of flat steel wire, hooked to a front and a back rail · they bend under your weight and spring back"
        : s.lift > 0 ? `middle cushion tipped up ${Math.round(s.lift * 69)}° against the back` : "three-seat sofa · 2.0 m wide, 0.9 m deep, 0.85 m high · seat 45 cm off the floor, 70 cm deep");
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
