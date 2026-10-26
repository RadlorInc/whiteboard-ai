// "planemirror cx cy k lab=0 lit=mirror|feet" — a PART (PARTS.md, batch 5): the plane mirror of mirror.js, a strip of
// glass 15 × 5 cm, 3 mm thick, silvered on its back and painted grey over the silver, standing on the paper in two
// slotted plastic feet. Its origin is the surface point at the middle of the silvered (reflecting) line, where the
// mirror line on a protractorsheet is drawn (place it at=sheet.centre); the glass is in front of it (+y), the paint
// behind. Light from +y reflects off the silver back to +y (i = r about the normal, +y). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 7.5, HZ = 5, GT = 0.3, PT = 0.06, FX = 5, FW = 1.3, FY = [-0.7, 1.0], FZ = 1.1;
  const SILVER = ISO.tint("#f2f5f8", ["#a9c0bd", "#bccfcc", "#cfdcda", "#e1e9e8"], "#3d5a58");
  const PAINT = ISO.tint("#8e9399", ["#5d6268", "#686d73", "#73787e", "#7e8389"], "#2a2d31");
  const FOOT = ISO.tint("#6a7aa0", ["#34405e", "#3d4a6a", "#475577", "#526184"], "#161d2e");

  function mirrorSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.2, y: FY[0], w: 2 * HX + 0.4, d: FY[1] - FY[0], r: 0.2 }, 0, 0.4, P)}"/>`];
    // each foot: a block with a slot along x; the part behind the glass, then (after the glass) the part in front
    const footBack = (x) => ISO.tinted(FOOT, ISO.wbox(P, [x - FW, x + FW], [FY[0], -PT], [0, FZ], "mid")) + ISO.tinted(FOOT, ISO.wbox(P, [x - FW, x + FW], [-PT, GT], [0, 0.25], "mid"));
    const footFront = (x) => ISO.tinted(FOOT, ISO.wbox(P, [x - FW, x + FW], [GT, FY[1]], [0, FZ], "mid")) + `<path d="${K.pathOf([[x - FW + 0.3, FY[1] + 0.005, 0.25], [x + FW - 0.3, FY[1] + 0.005, 0.25], [x + FW - 0.3, FY[1] + 0.005, FZ - 0.25], [x - FW + 0.3, FY[1] + 0.005, FZ - 0.25]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#161d2e" stroke-width="0.4" opacity=".6"/>`;
    out.push(`<g data-name="feet">${footBack(-FX)}${footBack(FX)}</g>`);
    // the strip: grey paint on the back, the silvered glass, two bright streaks on its face
    const sw = Math.max(0.8, G.scaleOf(P) * 0.22).toFixed(2);
    out.push(`<g data-name="mirror">${ISO.tinted(PAINT, ISO.wbox(P, [-HX, HX], [-PT, 0], [0.25, HZ], "mid"))}${ISO.tinted(SILVER, ISO.wbox(P, [-HX, HX], [0, GT], [0.25, HZ], "hi", true))}` +
      `<path d="${K.pathOf([[-5.2, GT + 0.005, 4.4], [-3.6, GT + 0.005, 1.0]].map((p) => K.iso(p, P)))}M${K.iso([-3.8, GT + 0.005, 4.4], P)}L${K.iso([-2.8, GT + 0.005, 2.2], P)}" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" opacity=".85" data-free=""/></g>`);
    out.push(`<g data-name="feet">${footFront(-FX)}${footFront(FX)}</g>`);
    if (lab) out.push(window.LAB.word(P, lab, [0, 0, HZ + 0.6], "plane mirror", "#556"));
    return out.join("");
  }

  ISO.add({
    name: "planemirror", title: "Plane mirror in two feet (part)", compare: null,
    about: "A plane glass mirror 15 × 5 cm, silvered on the back, standing in two slotted feet on a sheet; its origin is the reflecting (silvered) line, where the mirror line is drawn; it faces +y. anchors: face top",
    line: "planemirror cx cy k lab=0 lit=mirror|feet",
    demo: { line: "planemirror 480 330 38", script: [{ set: {}, hold: 1 }, { set: { lit: "mirror" }, hold: 1.3 }, { set: { lit: "feet" }, hold: 1.3 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = mirrorSvg(P, lab);
      g.anchors = { face: [0, 0, HZ / 2], top: [0, 0, HZ] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "plane mirror 15 × 5 cm, silvered on the back · it reflects from the silver line: angle of incidence = angle of reflection, both from the normal";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
