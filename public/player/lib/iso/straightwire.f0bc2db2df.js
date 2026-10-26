// "straightwire cx cy k I=-6..6 lab=0 lit=wire|post|card|current" — a PART (PARTS.md, batch 5): wirefield.js's
// straight wire. A thick copper rod 5 mm across stands 25 cm up from a black terminal block on the bench and passes
// through a 7 mm hole in the middle of a white card (whitecard.js's, 22 × 14 cm, 5.6 cm up on four brass posts) where
// plotting compasses stand. A brass strip joins the rod's boss to a terminal post on the block (anchor foot); a lead
// clips to the rod's top (anchor top). Origin: the bench point under the rod. I (A) only draws the current's arrow up
// (I > 0) or down the rod; the field round it is B = μ₀I/(2πr), in the readout. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RR = 2.5, LEN = 250, BLK = { x: -22, y: -15, w: 44, d: 30, r: 2 }, BZ = 12;
  const rod = (P, z0, z1, cap) => ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, RR, z0, z1 - z0, P, 18), { tone: "mid", crease: cap ? "faint" : "none", inner: L(K.sideArc(0, 0, RR, z0 + 0.5, P, 12), { tone: "faint" }) }));
  // under the card: the terminal block, its screws, the brass boss with its hex nut, the side post and the strip
  function footSvg(P, Pc) {
    const out = [`<g data-name="post">${ISO.tinted(ISO.T.plastic, S(K.slabOf(BLK, 0, BZ, P, 3), { tone: "mid", inner: L(K.sideSeam(BLK, 1.5, P, 3), { tone: "faint" }) }))}`];
    out.push([[-1.7, -1], [-1.7, 1], [1.9, -1]].map(([x, y]) => CIRC.screw(Pc, [x, y, BZ / 10], 0.14, 0.5 + x)).join(""));
    out.push(CIRC.strip(Pc, [0.6, 0], [1.45, 0], BZ / 10, 0.45));
    const p = CIRC.post(Pc, [1.45, 0, BZ / 10 + 0.04]);
    out.push(p.svg);
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 7, BZ, 9, P, 28, 0.4), { tone: "mid", inner: L(K.sideArc(0, 0, 7, BZ + 3, P, 20), { tone: "faint" }) }) + S(K.cylinder(0, 0, 5.4, BZ + 9, 4, P, 6, 0.3), { tone: "hi" })), "</g>");
    out.push(`<g data-name="wire">${rod(P, BZ + 13, B30.ZP, false)}</g>`);
    return { svg: out.join(""), foot: p.top };
  }
  // over the card: the rod up to its top, a brass connector sleeve with a knurled thumb screw near the top
  function topSvg(P) {
    const zs = LEN - 26, F = G.frameOf([0, RR + 3, zs + 7], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    return rod(P, B30.ZP + B30.T, zs, false) + ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 5, zs, 14, P, 24, 0.4), { tone: "mid", inner: L(K.knurl(0, 0, 5, zs, zs + 14, 14, P, 0.05), { tone: "faint" }) })) +
      ISO.tinted(ISO.T.brass, S(G.disc(0, 2.5, 1.6, F, P), { tone: "mid" }) + S(G.disc(2.5, 5, 3.4, F, P), { tone: "hi", inner: L(G.ribsOf(F, 2.5, 5, 3.4, 16, P, { seams: true }), { tone: "faint" }) })) + rod(P, zs + 14, LEN, true);
  }

  ISO.add({
    name: "straightwire", title: "Straight wire through a card (part)", compare: null,
    about: "A thick copper rod 25 cm tall standing on a terminal block and passing up through a hole in a white card on four posts (where plotting compasses stand); I sets the current's arrow up or down the rod, B = μ₀I/(2πr) round it. anchors: foot top card",
    line: "straightwire cx cy k I=-6..6 lab=0 lit=wire|post|card|current",
    demo: { line: "straightwire 480 430 12 I=0", script: [{ set: {}, hold: 1 }, { set: { I: 5, lit: "wire" }, hold: 1.2 }, { set: { I: -5, lit: "current" }, hold: 1.2 }, { set: { lit: "post" }, hold: 1 }, { set: { I: 3, lit: "card" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { I: B30.num(o, "I", 5, -6, 6), lit: o.lit || "" };
      const foot = footSvg(Pm, P);
      g.innerHTML = B30.card(Pm, [[0, 0, 3.5]], foot.svg) + `<g data-name="wire">${topSvg(Pm)}</g><g data-name="current"></g><g data-part="words"></g>`;
      g.anchors = { foot: foot.foot.map((v) => +v.toFixed(3)), top: [0, 0, LEN / 10], card: [0, 0, (B30.ZP + B30.T) / 10] };
      const el = { cur: g.querySelector('[data-name="current"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const draw = () => {
        const sg = Math.sign(Math.round(st.I * 10));
        w.rebuild(el.cur, String(sg), () => (sg ? B30.arrow(Pm, [9, 0, sg > 0 ? 130 : 185], [9, 0, sg > 0 ? 185 : 130]) : ""));
        w.rebuild(el.words, lab ? String(sg) : "", () => (lab ? CIRC.word(P, [0.6, 0, 20], "copper wire") + CIRC.word(P, [1.2, 0, 15.5], sg ? (sg > 0 ? "current up" : "current down") : "no current") + CIRC.word(P, [11, 0, 6], "card") : ""));
        B30.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.I !== undefined && p.I !== "" && Number.isFinite(+p.I)) st.I = ISO.clamp(+p.I, -6, 6);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => {
        const B = (B30.MU * Math.abs(st.I)) / (2 * Math.PI * 0.025);
        return Math.abs(st.I) < 0.05 ? "straight copper wire · no current, no field of its own" : `I = ${Math.abs(st.I).toFixed(1)} A ${st.I > 0 ? "up" : "down"} the wire · B = μ₀I/(2πr) = ${(B * 1e6).toFixed(0)} µT at 2.5 cm, in circles ${st.I > 0 ? "anticlockwise" : "clockwise"} seen from above`;
      };
      draw();
      return g;
    },
  });
})();
