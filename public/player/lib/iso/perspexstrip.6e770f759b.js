// "perspexstrip cx cy k lab=0 lit=strip|ends" — a PART (PARTS.md, batch 5): the long perspex strip of refraction.js
// (a model optical fibre), lying flat on the paper, its origin the surface point under its middle. 30 × 1 × 1 cm along
// x, its long faces smooth and its two ends polished flat (a ray goes in at one end, reflects totally off the walls
// all the way along and comes out of the other), edges eased, its far edges seen through it. Static.
// Anchors (cm): left, right (the middle of each end face), top (the middle of the top face). Built in mm (ISO.mm).
(() => {
  const K = window.K, HX = 150, HY = 5, H = 10;

  ISO.add({
    name: "perspexstrip", title: "Perspex strip (part)", compare: null,
    about: "A long clear perspex strip 30 × 1 × 1 cm with polished ends, a model optical fibre: light that goes in at one end reflects totally off its walls all the way along. anchors: left right top",
    line: "perspexstrip cx cy k lab=0 lit=strip|ends",
    demo: { line: "perspexstrip 480 290 16 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ends" }, hold: 1.2 }, { set: { lit: "strip" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, B26 = window.B26;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 };
      // the polished ends: a bright rim just inside each end face's edge (the near end over the strip, the far one under)
      const end = (x) => `<path d="${K.pathOf([[x, -HY + 0.8, 0.8], [x, HY - 0.8, 0.8], [x, HY - 0.8, H - 0.8], [x, -HY + 0.8, H - 0.8]].map((p) => K.iso(p, Pm)), true)}" fill="#ffffff" fill-opacity=".35" stroke="#ffffff" stroke-width="0.8"/>`;
      g.innerHTML = B26.GLASS_CSS + `<path class="iso-halo" d="${K.haloOf(plan, 0, 0.1, Pm)}"/>` +
        `<g data-name="ends">${end(-HX - 0.05)}</g>` +
        B26.glass("strip", B26.farEdges(Pm, [[-HX, -HY], [HX, -HY], [HX, HY], [-HX, HY]], H) + S(K.slabOf(plan, 0, H, Pm, 2, 0.4), { tone: "hi" })) +
        `<g data-name="ends">${end(HX + 0.05)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, -HY, H + 8], "perspex strip", "#556");
      g.anchors = { left: [-HX / 10, 0, H / 20], right: [HX / 10, 0, H / 20], top: [0, 0, H / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B26.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "perspex strip 30 × 1 × 1 cm · n ≈ 1.5, critical angle 42° · light inside meets the walls past 42° and reflects totally, like an optical fibre";
      B26.light(w, g, lit);
      return g;
    },
  });
})();
