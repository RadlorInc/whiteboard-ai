// "opticaltable cx cy k lab=0 lit=plate|holes|feet" — a PART (PARTS.md, batch 5): the optical breadboard of
// michelson.js, its origin the bench point under its middle. A 40 × 30 cm steel plate 1.5 cm thick (a 1.2 cm plate on
// four rubber feet 0.3 cm high), its top ground flat with a grid of M6 tapped holes every 2.5 cm (16 × 12, the
// nearest to the middle at ±1.25 cm), four counterbored fixing holes at its corners, eased edges and a maker's plate
// on the front edge. Mounts (beamsplitter, mirrormount, micrometerslide, lablaser) stand on `top` at ax= ay= on the
// grid. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 20, HY = 15, FZ = 0.3, TZ = 1.5, PITCH = 2.5;
  const STEEL = ISO.tint("#e4e6e9", ["#8e9298", "#a3a7ad", "#b8bbc0", "#cacdd1"], "#3c3f45");

  // every hole as two flat ellipses on the top: the chamfer (mid grey) and the tapped bore (dark)
  function holesSvg(P) {
    const ring = (x, y, r, n = 10) => K.pathOf(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return K.iso([x + Math.cos(a) * r, y + Math.sin(a) * r, TZ + 0.005], P); }), true);
    const cham = [], bore = [], cb = [], heads = [];
    for (let i = 0; i < 16; i++) for (let j = 0; j < 12; j++) {
      const x = -HX + PITCH / 2 + i * PITCH, y = -HY + PITCH / 2 + j * PITCH;
      if ((i === 0 || i === 15) && (j === 0 || j === 11)) continue;   // the corners carry the fixing holes
      cham.push(ring(x, y, 0.42)); bore.push(ring(x, y, 0.28));
    }
    for (const [x, y] of [[-HX + 1.25, -HY + 1.25], [HX - 1.25, -HY + 1.25], [-HX + 1.25, HY - 1.25], [HX - 1.25, HY - 1.25]]) { cb.push(ring(x, y, 0.65, 16)); heads.push(ring(x, y, 0.48, 14)); }
    return `<path d="${cham.join("")}" fill="#9a9ea5"/><path d="${bore.join("")}" fill="#2b2d31"/><path d="${cb.join("")}" fill="#3a3d42"/><path d="${heads.join("")}" fill="#7d8188"/>`;
  }
  function tableSvg(P, lab) {
    const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.4 }, out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, TZ, P)}"/>`];
    out.push(`<g data-name="feet">${[[-HX + 2.5, -HY + 2.5], [HX - 2.5, -HY + 2.5], [-HX + 2.5, HY - 2.5], [HX - 2.5, HY - 2.5]].map(([x, y]) => ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 1.6, 0, FZ + 0.02, P, 20), { tone: "mid" }))).join("")}</g>`);
    out.push(`<g data-name="plate">${ISO.tinted(STEEL, S(K.slabOf(plan, FZ, TZ - FZ, P, 3, 0.08), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, FZ + 0.25, P, 3), { tone: "faint" }) }))}` +
      `${plateTag(P)}</g>`);
    out.push(`<g data-name="holes">${holesSvg(P)}</g>`);
    if (lab) out.push(window.LAB.word(P, lab, [HX, HY, TZ], "optical table, holes every 2.5 cm", "#556", { anchor: "start", dy: 16 }));
    return out.join("");
  }
  // the maker's plate on the front (+y) edge: an aluminium tag with two rivets and its printed lines
  const plateTag = (P) => {
    const y = HY + 0.01, at = (x, z) => K.iso([x, y, z], P), z0 = FZ + 0.25, z1 = TZ - 0.2;
    return `<path d="${K.pathOf([at(6, z0), at(13, z0), at(13, z1), at(6, z1)], true)}" fill="#eef0f2" stroke="#55534c" stroke-width="0.5"/>` +
      K.dotsSvg([at(6.4, (z0 + z1) / 2), at(12.6, (z0 + z1) / 2)], { size: 0.35 }) +
      window.LAB.faceText(P, [9.5, y + 0.01, (z0 + z1) / 2 - 0.12], [1, 0, 0], "BREADBOARD 400 × 300 · M6 / 25", 0.34, "#4a4e55");
  };

  ISO.add({
    name: "opticaltable", title: "Optical breadboard (part)", compare: null,
    about: "A 40 × 30 cm steel optical breadboard, 1.5 cm thick on rubber feet, its top a grid of M6 tapped holes every 2.5 cm where post holders bolt down; the base of a Michelson interferometer. anchors: top",
    line: "opticaltable cx cy k lab=0 lit=plate|holes|feet",
    demo: { line: "opticaltable 480 300 15", script: [{ set: {}, hold: 1 }, { set: { lit: "holes" }, hold: 1.3 }, { set: { lit: "feet" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = tableSvg(P, lab);
      g.anchors = { top: [0, 0, TZ] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "optical breadboard 40 × 30 × 1.5 cm · M6 holes on a 2.5 cm grid (nearest the middle at ±1.25 cm) · mounts bolt down anywhere on it";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
