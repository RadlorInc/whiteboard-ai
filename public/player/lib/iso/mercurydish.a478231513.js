// "mercurydish cx cy k lab=0 lit=dish|mercury" — a PART (PARTS.md, batch 5): the dish of mercury of pressure.js's
// barometer: a thick-walled glass dish 10 cm across and 4 cm deep, standing on the bench, its origin the bench point
// under its middle. Mercury stands 2.5 cm deep in it (about 150 mL, 2 kg at 13.6 g/cm³); its surface is a mirror,
// flat in the middle and rounding down to the glass at the edge (mercury does not wet glass, so its meniscus is
// convex). A barometer tube stands upended in it (place the tube at=dish.surface). Static. Built in mm with the lab
// helpers; anchors in cm: surface (the mercury's middle) rim.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 50, H = 40, WALL = 3, BASE = 4, LEVEL = 25;   // mm
  const HG = ISO.tint("#eef0f3", ["#6f757d", "#8a9098", "#a7acb3", "#c4c8cd"], "#2c3036");

  ISO.add({
    name: "mercurydish", title: "Dish of mercury (part)", compare: null,
    about: "A thick glass dish 10 cm across holding mercury 2.5 cm deep, its mirror surface rounding down at the glass (a convex meniscus); a barometer tube stands upended in it. anchors: surface rim",
    line: "mercurydish cx cy k lab=0 lit=dish|mercury",
    demo: { line: "mercurydish 480 360 34", script: [{ set: {}, hold: 1 }, { set: { lit: "mercury" }, hold: 1.4 }, { set: { lit: "dish" }, hold: 1.4 }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", w = ISO.writer();
      const V = LAB.vessel(Pm, [0, 0, 0], [[0, R - 4], [3, R - 0.8, 1], [6, R - 0.3], [H, R]], { wall: WALL, base: BASE });
      const F = LAB.Z([0, 0, 0]), ri = (s) => V.rAt(s) - WALL;
      // the mercury: a body of revolution, its edge rolling down to the glass, then the mirror surface's reflections
      const hg = S(G.solidOf([[BASE, ri(BASE)], [LEVEL - 2.2, ri(LEVEL - 2.2)], [LEVEL - 0.9, ri(LEVEL) - 0.7, 1], [LEVEL - 0.15, ri(LEVEL) - 2.6, 1], [LEVEL, ri(LEVEL) - 5], [LEVEL, 0]], F, Pm), { tone: "hi" });
      const a0 = V.facing + 2.1, streak = (r, from, to) => { const q = []; for (let i = 0; i <= 12; i++) q.push(K.iso(G.pointOf(F, LEVEL + 0.02, r, a0 + from + ((to - from) * i) / 12), Pm)); return K.pathOf(q); };
      const shine = `<path d="${streak(30, 0, 0.9)}M${K.iso(G.pointOf(F, LEVEL + 0.02, 18, a0 + 0.2), Pm)}L${K.iso(G.pointOf(F, LEVEL + 0.02, 18, a0 + 0.75), Pm)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.8, G.scaleOf(Pm) * 2.4).toFixed(2)}" stroke-linecap="round" opacity=".9" data-free=""/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 4, Pm)}"/>` +
        `<g data-name="dish">${V.back()}</g><g data-name="mercury">${ISO.tinted(HG, hg)}${shine}</g><g data-name="dish">${V.front()}` +
        `<path d="${G.circleOf(F, H - 0.6, R - WALL, Pm)}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.6" opacity=".6"/></g>` +
        `<g data-part="words">${LAB.word(Pm, lab, [R + 6, 0, LEVEL], "mercury", "#556", { anchor: "start" })}</g>`;
      g.anchors = { surface: [0, 0, LEVEL / 10], rim: [0, 0, H / 10] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `glass dish ${2 * R / 10} cm across, ${H / 10} cm deep · mercury ${LEVEL / 10} cm deep (about ${Math.round(V.vol(LEVEL))} mL, ${(V.vol(LEVEL) * 13.6 / 1000).toFixed(1)} kg) · convex meniscus: mercury does not wet glass`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
