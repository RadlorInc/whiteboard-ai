// "cuplid cx cy k lab=0 lit=lid|holes|tape" — a PART (PARTS.md, batch 5): the coffee-cup calorimeter's lid
// (calorimeter.js's card disc) at real size: a disc of 2 mm grey board 9.2 cm across, cut along a compass line, with
// two punched holes (a 9 mm one for the thermometer, a 6 mm one for the loop stirrer) and a strip of masking tape over
// its edge that holds it to the cup. A flat sheet: origin the middle of its underside, where it rests on a foamcup's
// rim. Static. Built in mm (ISO.mm); anchors in cm: thermo and stir = the holes' middles on top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 46, H = 2, HT = [12, 8, 4.5], HS = [-14, -6, 3];
  const TAPE = ISO.tint("#f3e7b8", ["#c9b77a", "#d6c58a", "#e2d39c", "#ece0ad"], "#7a6a30");

  // a convex polygon clipped to another (Sutherland–Hodgman, both counter- or both clockwise)
  const clip = (poly, by) => {
    const side = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), sg = Math.sign(side(by[0], by[1], by[2])) || 1;
    let out = poly;
    for (let i = 0; i < by.length && out.length; i++) {
      const a = by[i], b = by[(i + 1) % by.length], inp = out; out = [];
      for (let j = 0; j < inp.length; j++) {
        const p = inp[j], q = inp[(j + 1) % inp.length], ip = side(a, b, p) * sg >= 0, iq = side(a, b, q) * sg >= 0;
        if (ip) out.push(p);
        if (ip !== iq) { const t = side(a, b, p) / (side(a, b, p) - side(a, b, q)); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
      }
    }
    return out;
  };
  // the punched hole: its cut wall (the board's thickness, seen on the far side) and, where the top and bottom
  // openings overlap, the dark way through
  function hole(P, [x, y, r]) {
    const ring = (z) => K.circleRing(x, y, r, 28).map(([a, b]) => K.iso([a, b, z], P)), top = ring(H + 0.02), through = clip(ring(0), top);
    return `<path d="${K.pathOf(top, true)}" fill="#b3a383" stroke="#6e5f40" stroke-width="0.6"/>` + (through.length > 2 ? `<path d="${K.pathOf(through, true)}" fill="#3a3324"/>` : "");
  }
  function svg(P) {
    const B09 = window.B09, out = [`<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, H, P)}"/>`];
    out.push(`<g data-name="lid">${ISO.tinted(B09.CARD, S(K.cylinder(0, 0, R, 0, H, P, 64, 0.3), { tone: "hi" }))}${L(K.ring(0, 0, R - 3, H + 0.01, P, 48), { tone: "faint" })}` +
      `</g>`);
    out.push(`<g data-name="holes">${hole(P, HT)}${hole(P, HS)}</g>`);
    // masking tape folded over the edge on the near side: across the top, down the cut edge
    const a = Math.PI * 0.32, ux = Math.cos(a), uy = Math.sin(a), tx = -uy, ty = ux, w = 7;
    const onTop = [[R - 9, -w], [R + 0.3, -w], [R + 0.3, w], [R - 9, w]].map(([r, s]) => K.iso([ux * r + tx * s, uy * r + ty * s, H + 0.05], P));
    const onEdge = [[H + 0.05, -w], [-5, -w], [-5, w], [H + 0.05, w]].map(([z, s]) => K.iso([ux * (R + 0.3) + tx * s, uy * (R + 0.3) + ty * s, z], P));
    out.push(`<g data-name="tape" style="${TAPE}"><path class="iso-fill" d="${K.pathOf(onTop, true)}" fill="#ece0ad" stroke="#7a6a30" stroke-width="0.6"/><path d="${K.pathOf(onEdge, true)}" fill="#d6c58a" stroke="#7a6a30" stroke-width="0.6"/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "cuplid", title: "Card lid for a foam cup (part)", compare: null,
    about: "A 9.2 cm disc of card that closes a coffee-cup calorimeter, with a hole for the thermometer and a hole for the stirrer, taped to the cup. anchors: thermo stir",
    line: "cuplid cx cy k lab=0 lit=lid|holes|tape",
    demo: { line: "cuplid 480 300 40", script: [{ set: {}, hold: 1 }, { set: { lit: "holes" }, hold: 1.2 }, { set: { lit: "tape" }, hold: 1.2 }, { set: { lit: "lid" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = svg(Pm) + (lab ? LAB.word(Pm, lab, [HT[0] + 6, HT[1], 8], "thermometer", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [HS[0] - 6, HS[1], 8], "stirrer", "#556", { anchor: "end" }) : "");
      g.anchors = { thermo: [HT[0] / 10, HT[1] / 10, H / 10], stir: [HS[0] / 10, HS[1] / 10, H / 10] };
      return window.B09.still(g, o, "card lid 9.2 cm · 9 mm thermometer hole · 6 mm stirrer hole");
    },
  });
})();
