// "mirrorstrip cx cy k type=concave|convex R=10..18 lab=0 lit=mirror|holder|screws" — a PART (PARTS.md, batch 5): the
// curved mirror strip of curvedmirror.js, standing on the bench or a paper sheet in its slotted wooden block, its
// origin the surface point under the strip's vertex (the middle of its face). A strip of polished steel 8 cm long,
// 3 cm tall and 1 mm thick, bent to a circle of radius R cm about a vertical axis; its polished face looks toward +x
// (light on a bench comes from +x, so a raybox on the +x side aimed −x lights it). concave: it curves round toward
// +x (the centre of curvature C and the focus F, f = R/2, are in front of it); convex: it bulges toward +x (F and C
// are virtual, behind it). The block: beech, its front cut to the strip's curve, a low lip in front of the slot, two
// screws in its top. set({ type }) swaps the strip. Built in mm (ISO.mm); anchors in cm: face (the vertex, half way
// up), focus and centre (on the bench, on the axis; behind the strip for convex). World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HALF = 40, HT = 30, TH = 1, BK = 16, BZ = 10, LIP = 3, LZ = 5, N = 24;
  const BEECH = ISO.tint("#f6e3c4", ["#d2a46c", "#dbb37f", "#e3c294", "#ebd0aa"], "#74511f");
  const POLISH = ISO.tint("#f2f4f7", ["#9ea4ad", "#b4b9c0", "#c9cdd3", "#dde0e4"], "#3a3e44");
  // the face: x on the circle of radius R (mm) through the vertex (0, 0); concave edges come toward +x, convex go back
  const faceX = (y, R, cave) => (cave ? 1 : -1) * (R - Math.sqrt(R * R - y * y));
  const curve = (R, cave, dx, h = HALF) => Array.from({ length: N + 1 }, (_, i) => { const y = -h + (2 * h * i) / N; return [faceX(y, R, cave) + dx, y]; });

  function stripSvg(P, R, cave, lab) {
    const front = curve(R, cave, 0), back = curve(R, cave, -TH), out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -BK - 2, y: -HALF - 2, w: BK + LIP + 8, d: 2 * HALF + 4, r: 2 }, 0, 2, P)}"/>`);
    // the block behind the strip, its front cut to the curve, two screws in its top
    out.push(`<g data-name="holder">${ISO.tinted(BEECH, S(K.extrude([...back, [-BK, HALF], [-BK, -HALF]], 0, BZ, P, { convex: false }), { tone: "mid" }))}</g>`);
    out.push(`<g data-name="screws">${[-HALF + 9, HALF - 9].map((y) => screwTop(P, [-BK / 2 - 1, y, BZ])).join("")}</g>`);
    // the strip: a thin curved band of polished steel, with a bright streak down its face
    const ring = [...front, ...back.slice().reverse()];
    const streak = [[-24, 26], [-10, 6]].map(([y, z]) => K.iso([faceX(y, R, cave) + 0.2, y, z], P));
    out.push(`<g data-name="mirror">${ISO.tinted(POLISH, S(K.extrude(ring, 0, HT, P, { convex: false }), { tone: "hi", lit: true }))}` +
      `<path d="${K.pathOf(streak)}" stroke="#fff" stroke-width="${Math.max(1, G.scaleOf(P) * 1.6).toFixed(2)}" stroke-linecap="round" opacity=".8" data-free=""/></g>`);
    // the lip in front of the slot, following the curve
    const lipF = curve(R, cave, LIP, HALF - 1), lipB = curve(R, cave, 0.05, HALF - 1);
    out.push(`<g data-name="holder">${ISO.tinted(BEECH, S(K.extrude([...lipF, ...lipB.slice().reverse()], 0, LZ, P, { convex: false }), { tone: "mid" }))}</g>`);
    if (lab) out.push(LAB.word(P, lab, [0, HALF, HT + 8], cave ? "concave mirror" : "convex mirror", "#556"));
    return out.join("");
  }
  // a flat slot-head screw head on the block's top (the slot along x)
  const screwTop = (P, [x, y, z], r = 2.6) => ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, r, z, r * 0.3, P, 16, 0.3), { tone: "hi" })) +
    `<path d="${K.segment([x - r * 0.75, y, z + r * 0.31], [x + r * 0.75, y, z + r * 0.31], P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(P) * r * 0.22).toFixed(2)}" data-free=""/>`;

  ISO.add({
    name: "mirrorstrip", title: "Curved mirror strip (part)", compare: null,
    about: "A curved strip of polished steel (8 × 3 cm) standing in a slotted wooden block, its face toward +x: concave brings parallel rays to F in front (f = R/2), convex spreads them from a virtual F behind; swaps between the two. anchors: face focus centre",
    line: "mirrorstrip cx cy k type=concave|convex R=10..18 lab=0 lit=mirror|holder|screws",
    demo: { line: "mirrorstrip 470 330 60 type=concave R=14", script: [{ set: {}, hold: 1 }, { set: { lit: "mirror" }, hold: 1.2 }, { set: { type: "convex", lit: "holder" }, hold: 1.2 }, { set: { type: "concave", lit: "screws" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const R = ISO.clamp(ISO.num(o, "R", 14), 10, 18) * 10;
      let cave = o.type !== "convex", lit = o.lit || "";
      const w = ISO.writer();
      const build = () => {
        g.innerHTML = stripSvg(Pm, R, cave, lab);
        const sg = cave ? 1 : -1;
        g.anchors = { face: [0, 0, HT / 20], focus: [(sg * R) / 20, 0, 0], centre: [(sg * R) / 10, 0, 0] };
        B10.light(w, g, lit);
      };
      g.set = (p) => {
        if ((p.type === "concave" || p.type === "convex") && (p.type === "concave") !== cave) { cave = p.type === "concave"; build(); }
        if (p.lit !== undefined) { lit = p.lit; B10.light(w, g, lit); }
      };
      g.update = () => false;
      g.readout = () => (cave ? `concave mirror strip · R = ${R / 10} cm · parallel rays reflect through F, f = R/2 = ${R / 20} cm in front`
        : `convex mirror strip · R = ${R / 10} cm · parallel rays spread as if from a virtual F ${R / 20} cm behind · f = −${R / 20} cm`);
      build();
      return g;
    },
  });
})();
