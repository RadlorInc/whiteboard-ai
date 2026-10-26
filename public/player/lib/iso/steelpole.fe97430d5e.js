// "steelpole cx cy k lab=0 lit=pole|plate|bolts" — a PART (PARTS.md): the galvanised steel pole a satellite dish
// stands on (satdish.js's mount), its origin the ground point under its middle. A 25 × 25 cm base plate 1.2 cm thick
// on the ground, four anchor bolts at its corners each with a washer, a hex nut and the bolt's threaded end, four
// triangular gussets welded between plate and pole, the weld bead round the pole's foot, the 6 cm tube rising to
// 150 cm with a domed cap. A dishaerial's collar sits at= its `top`, a signalmeter at= its `strap` (the pole's face
// toward +y at 100 cm). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 3, H = 150, PT = 1.2, HP = 12.5, BO = 9.5;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const Z = () => B37.ZINC;

  // a gusset: a 0.6 cm triangle plate standing on the plate, its long edge welded to the pole, facing along dir
  function gusset(P, dir) {
    const tri = [[R, PT], [R + 7, PT], [R, PT + 9]];
    if (dir === "x+" || dir === "x-") { const s = dir === "x+" ? 1 : -1; return ISO.tinted(Z(), ISO.poly(prismPts(tri.map(([u, z]) => [s * u, z]), "y"), PF, P, "mid")); }
    const s = dir === "y+" ? 1 : -1; return ISO.tinted(Z(), ISO.poly(prismPts(tri.map(([u, z]) => [s * u, z]), "x"), PF, P, "mid"));
  }
  // a triangle (u, z) extruded 0.6 cm across: along y for a gusset on the x axis, along x for one on the y axis
  const prismPts = (tri, across) => [-0.3, 0.3].flatMap((c) => tri.map(([u, z]) => (across === "y" ? [u, c, z] : [c, u, z])));
  const PF = [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]];
  // an anchor bolt at a plate corner: washer, hex nut, the bolt's threaded end with two thread rings
  function bolt(P, [x, y]) {
    const F = zAx([x, y, PT]);
    return ISO.tinted(Z(), S(K.cylinder(x, y, 1.5, PT, 0.25, P, 20), { tone: "mid" }) + S(K.cylinder(x, y, 1.05, PT + 0.25, 1.1, P, 6, 0.08), { tone: "mid" })) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 0.6, PT + 1.35, 1.2, P, 12, 0.12), { tone: "hi", inner: K.lineSvg([1.8, 2.2].map((s) => G.arcOf(F, s, 0.6, P)).join(""), { tone: "faint" }) }));
  }

  ISO.add({
    name: "steelpole", title: "Steel mounting pole (part)", compare: null,
    about: "A galvanised steel mounting pole 150 cm tall on a 25 cm base plate held by four anchor bolts, with welded gussets and a domed cap; a dish's collar goes on its top. anchors: top strap",
    line: "steelpole cx cy k lab=0 lit=pole|plate|bolts",
    demo: { line: "steelpole 480 470 2.6 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "bolts" }, hold: 1.2 }, { set: { lit: "pole" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const plan = { x: -HP, y: -HP, w: 2 * HP, d: 2 * HP, r: 1 }, out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, PT, P)}"/>`);
      out.push(`<g data-name="plate">${ISO.tinted(Z(), S(K.slabOf(plan, 0, PT, P, 4, 0.15), { tone: "mid" }))}</g>`);
      // far to near: the bolts and gussets behind the pole, the pole, those in front
      const cornersAt = [[-BO, -BO], [BO, -BO], [-BO, BO], [BO, BO]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      const gus = [["x-", [-5, 0]], ["y-", [0, -5]], ["x+", [5, 0]], ["y+", [0, 5]]].sort((a, b) => K.depthOf([...a[1], 0], P) - K.depthOf([...b[1], 0], P));
      const far = (p) => K.depthOf([...p, 0], P) < K.depthOf([0, 0, 0], P);
      out.push(`<g data-name="bolts">${cornersAt.filter(far).map((c) => bolt(P, c)).join("")}</g>`);
      out.push(`<g data-name="pole">${gus.filter(([, p]) => far(p)).map(([d]) => gusset(P, d)).join("")}`);
      // the tube, the weld bead at its foot, the cap
      out.push(ISO.tinted(Z(), S(K.cylinder(0, 0, R, PT, H - PT, P, 28), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, R + 0.15, H - 0.2, 1.5, P, 28, 0.5), { tone: "mid" })));
      out.push(ISO.tinted(Z(), S(K.cylinder(0, 0, R + 0.35, PT, 0.5, P, 28, 0.2), { tone: "lo", crease: "none" })));
      out.push(gus.filter(([, p]) => !far(p)).map(([d]) => gusset(P, d)).join(""), "</g>");
      out.push(`<g data-name="bolts">${cornersAt.filter((c) => !far(c)).map((c) => bolt(P, c)).join("")}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([0, R, 110], P), "steel pole", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="10" x="');
      g.anchors = { top: [0, 0, H], strap: [0, R, 100] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B37.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "steel pole · 6 cm tube, 150 cm tall · 25 cm base plate on four anchor bolts";
      B37.light(w, g, lit);
      return g;
    },
  });
})();
