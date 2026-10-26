// "glasstube cx cy k aim=up|flat lab=0 lit=tube" — a PART (PARTS.md, batch 5): the short glass tube of the whirling-
// bung set-up (circular.js's tube in the clamp) at real size: soda glass 10 mm across with a 1.5 mm wall, 12 cm long,
// both ends fire-polished round so a nylon line can run over them without fraying. Origin the tube's middle on its
// axis (place it at= a retortstand's `clamp`, which holds it there); aim=up stands it upright, aim=flat lays it along x
// (origin then the middle of its underside, on the surface). Static. Built in mm (ISO.mm); anchors in cm: top and
// bottom = the middle of each end's mouth (aim=flat: the +x and −x ends).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RO = 5, RI = 3.5, LEN = 120, HL = LEN / 2;
  // the wall's section from end to end: the outer face, a rounded lip at each end, the bore back
  const WALL = [[0, 4.25], [0.35, 4.85, 1], [1.2, RO, 1], [LEN - 1.2, RO, 1], [LEN - 0.35, 4.85, 1], [LEN, 4.25], [LEN - 0.35, 3.65, 1], [LEN - 1.2, RI, 1], [1.2, RI, 1], [0.35, 3.65, 1]];

  ISO.add({
    name: "glasstube", title: "Short glass tube (part)", compare: null,
    about: "A 12 cm glass tube 1 cm across with fire-polished ends, held in a clamp so a line can run through it (the whirling bung's tube). anchors: top bottom",
    line: "glasstube cx cy k aim=up|flat lab=0 lit=tube",
    demo: { line: "glasstube 480 270 30", script: [{ set: {}, hold: 1 }, { set: { lit: "tube" }, hold: 1.2 }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", flat = o.aim === "flat";
      const axis = flat ? [1, 0, 0] : [0, 0, 1], c = flat ? [0, 0, RO] : [0, 0, 0], end = (s) => c.map((v, i) => v + axis[i] * s);
      const F = G.frameAlong(end(-HL), axis), kS = G.scaleOf(Pm);
      // the bore seen through the wall: two faint lines along it, ending at each mouth; a highlight down the near side
      const face = G.angleToward(F, G.viewOf(Pm)), along = (r, a, s0, s1) => K.pathOf([K.iso(G.pointOf(F, s0, r, a), Pm), K.iso(G.pointOf(F, s1, r, a), Pm)]);
      g.innerHTML = window.B09.glassCss("gtube") + `<g data-name="tube" class="gtube" style="${ISO.T.glass}">${S(G.lathe(WALL, F, Pm, { steps: 28 }), { tone: "hi" })}` +
        `<path d="${along(RI, face + Math.PI / 2, 1.5, LEN - 1.5)}${along(RI, face - Math.PI / 2, 1.5, LEN - 1.5)}" stroke="${LAB.GLASS}" stroke-width="0.6" opacity=".55" fill="none"/>` +
        `<path d="${along(RO + 0.05, face + 0.6, LEN * 0.12, LEN * 0.82)}" stroke="#ffffff" stroke-width="${Math.max(0.8, kS * 1.2).toFixed(2)}" stroke-linecap="round" opacity=".8" fill="none"/>` +
        `<path d="${G.circleOf(F, LEN - 0.05, RI + 0.25, Pm, 40)}" stroke="${LAB.GLASS}" stroke-width="0.7" fill="#dfecf4" fill-opacity=".5"/></g>` +
        (lab ? LAB.word(Pm, lab, end(HL * 0.6).map((v, i) => v + (i === 0 ? 10 : 0)), "glass tube", "#556", { anchor: "start" }) : "");
      g.anchors = { top: end(HL).map((v) => v / 10), bottom: end(-HL).map((v) => v / 10) };
      return window.B09.still(g, o, "glass tube 12 cm long · 10 mm across · bore 7 mm · fire-polished ends");
    },
  });
})();
