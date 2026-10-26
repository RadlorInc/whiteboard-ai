// "enamelwire cx cy k turns=10..100 lab=0 lit=coil|former|ends" — a PART (PARTS.md, batch 5): a coil of 0.5 mm
// enamelled copper wire wound in one layer on a kraft-paper former, 6 cm long and 1.5 cm across, made to slide over
// an iron bolt (ironbolt's coil anchor: at=<bolt>.coil). Origin: the middle of its axis, which runs along x. A strip of
// tape holds the winding at each end; the two ends of the wire come off on the near side (+y), turning in a little (so they clear the supports), and dip toward the bench,
// the last 6 mm scraped bare of enamel (anchors a at the −x end, b at the +x end: where a crocodile clip bites).
// turns spreads the winding: 10 turns are far apart, 100 lie almost touching (one layer of 0.5 mm wire holds 120 in
// 6 cm); set({ turns }) rewinds it. World: 1 = 1 cm, built from the electromagnet scene's coil.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HALF = 3, RF = 0.68, RW = 0.025, RC = RF + RW, TAPE = 0.32;
  const F = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const PAPER = ISO.tint("#e6cfa3", ["#b48f58", "#c39f68", "#d1b07b", "#ddc08f"], "#6e5228");
  const TAPEC = ISO.tint("#f1ead2", ["#c9c0a2", "#d6cdb0", "#e2dabf", "#ece5cc"], "#77705a");
  const COPPER = { ink: "#5a2a10", body: "#b8662e", shine: "#f2b27a" }, BARE = { ink: "#7a4a1a", body: "#e09a5a", shine: "#ffe0b8" };
  // a wire end: off the winding on the near side, round a bend, down and out toward the bench; the last 0.6 cm bare
  const tail = (x, dir) => LAB.bend([[x, RC, 0], [x + dir * 0.2, RC + 0.9, -0.15], [x + dir * 0.6, RC + 1.6, -1.2], [x + dir * 0.7, RC + 3, -1.9]], 0.5);
  const cut = (pts, keep) => {
    // split a polyline at `keep` cm from its end: [insulated, bare]
    let left = keep, i = pts.length - 1;
    for (; i > 0; i--) { const d = Math.hypot(...pts[i].map((v, n) => v - pts[i - 1][n])); if (d >= left) break; left -= d; }
    const a = pts[i - 1], b = pts[i], d = Math.hypot(...b.map((v, n) => v - a[n])), m = b.map((v, n) => v + (a[n] - v) * (left / d));
    return [[...pts.slice(0, i), m], [m, ...pts.slice(i)]];
  };
  const tails = [tail(-HALF + TAPE + 0.05, 1), tail(HALF - TAPE - 0.05, -1)].map((p) => cut(p, 0.6));

  function coilSvg(P, turns) {
    const c = K.coil(-HALF + TAPE, HALF - TAPE, [0, 0], RC, turns, "x", P, 14);
    return PHYS.wire(P, c.front, RW, COPPER);
  }

  ISO.add({
    name: "enamelwire", title: "Enamelled wire coil (part)", compare: null,
    about: "A one-layer coil of 0.5 mm enamelled copper wire on a paper former, 6 cm long and 1.5 cm across, to slide onto an iron bolt; turns 10 to 100 spread along it, the two bare ends come off toward the bench for the leads. anchors: a b",
    line: "enamelwire cx cy k turns=10..100 lab=0 lit=coil|former|ends",
    demo: { line: "enamelwire 470 250 60 turns=20", script: [{ set: {}, hold: 1 }, { set: { turns: 40, lit: "coil" }, hold: 1.2 }, { set: { turns: 100, lit: "ends" }, hold: 1.2 }, { set: { turns: 60, lit: "former" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { turns: Math.round(ISO.clamp(ISO.num(o, "turns", 40), 10, 100)), lit: o.lit || "" };
      const former = `<path class="iso-halo" d="${K.haloOf({ x: -HALF - 0.1, y: -RC, w: 2 * HALF + 0.2, d: RC + 3.1, r: 0.4 }, -RC, RC, P)}"/>` +
        `<g data-name="former">${ISO.tinted(PAPER, S(G.lathe([[-HALF - 0.1, RF - 0.06], [-HALF - 0.1, RF], [HALF + 0.1, RF], [HALF + 0.1, RF - 0.06]], F, P), { tone: "mid" }))}</g>`;
      const tape = [-1, 1].map((d) => ISO.tinted(TAPEC, S(G.lathe([[d < 0 ? -HALF : HALF - TAPE, RF], [d < 0 ? -HALF : HALF - TAPE, RC + RW + 0.02], [d < 0 ? -HALF + TAPE : HALF, RC + RW + 0.02], [d < 0 ? -HALF + TAPE : HALF, RF]], F, P), { tone: "hi" }))).join("");
      const ends = tails.map(([ins, bare]) => PHYS.wire(P, PHYS.path(P, ins), RW, COPPER) + PHYS.wire(P, PHYS.path(P, bare), RW * 0.9, BARE)).join("");
      g.innerHTML = `${former}<g data-name="coil"></g><g data-name="coil">${tape}</g><g data-name="ends">${ends}</g><g data-part="words"></g>`;
      g.anchors = { a: tails[0][1].at(-1).map((v) => +v.toFixed(3)), b: tails[1][1].at(-1).map((v) => +v.toFixed(3)) };
      const el = { coil: g.querySelector('[data-name="coil"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const draw = () => {
        w.rebuild(el.coil, String(st.turns), () => coilSvg(P, st.turns));
        w.rebuild(el.words, lab ? String(st.turns) : "", () => (lab ? CIRC.word(P, [HALF, 0, RC + 0.3], `${st.turns} turns of enamelled wire`) : ""));
        B13.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.turns !== undefined && p.turns !== "" && Number.isFinite(+p.turns)) st.turns = Math.round(ISO.clamp(+p.turns, 10, 100));
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `${st.turns} turns of 0.5 mm enamelled copper wire on a 6 cm former · about ${(st.turns * Math.PI * 2 * RC / 100).toFixed(1)} m of wire · the more turns, the stronger the magnet for the same current`;
      draw();
      return g;
    },
  });
})();
