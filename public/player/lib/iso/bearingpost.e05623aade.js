// "bearingpost cx cy k lab=0 lit=post|bearing|foot" — a PART (PARTS.md, batch 5): one of the two bearing posts of
// motor.js, real size (2 × 2 × 8 cm). A 2 × 2 cm steel foot screwed down with two screws, a 1 cm thick upright with a
// rounded top, a gusset each side, and a pressed-in brass bush 7 cm up with its flange and a 4 mm hole along x (where
// the axle runs), an oil hole drilled down into it from the top. The origin is the surface point under the middle;
// `axle` = the bearing's centre (place an armaturecoil's left/right there). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const Z = 7, T = 0.5, HY = 0.8, FOOT = 1, FT = 0.35;
  const STEEL = ["#8d9096", "#d3d5d9"];

  function postSvg(P) {
    const out = [], X = [1, 0, 0];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -FOOT - 0.2, y: -FOOT - 0.2, w: 2 * FOOT + 0.4, d: 2 * FOOT + 0.4, r: 0.2 }, 0, 0.4, P)}"/>`);
    // the foot and its two countersunk screws either side of the upright
    let foot = ISO.tinted(ISO.T.steel, ISO.wbox(P, [-FOOT, FOOT], [-FOOT, FOOT], [0, FT], "mid"));
    for (const x of [-0.76, 0.76]) {
      const F = G.frameOf([x, 0, FT], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
      foot += ISO.tinted(ISO.T.steel, S(G.disc(0, 0.04, 0.17, F, P), { tone: "hi" })) + K.lineSvg(K.pathOf([G.pointOf(F, 0.045, 0.13, 0.5), G.pointOf(F, 0.045, 0.13, 0.5 + Math.PI)].map((p) => K.iso(p, P))), { tone: "mid", free: true });
    }
    out.push(`<g data-name="foot">${foot}</g>`);
    const Fb = G.frameOf([0, 0, Z], X, [0, 1, 0], [0, 0, 1]);
    // the upright: a prism along x with a rounded top, a gusset on each face
    const prof = [[-HY, FT], [HY, FT], ...ISO.arc(0, Z, HY, 0, Math.PI, 16)];
    let post = ISO.tinted(ISO.T.steel, ISO.prismY(P, [[-T - 0.5, FT], [-T, FT], [-T, FT + 1.1]], -0.08, 0.08, STEEL, "#e2e4e7", "#3c3f45"));
    post += ISO.prismX(P, prof, -T, T, STEEL, "#e2e4e7", "#3c3f45");
    post += ISO.tinted(ISO.T.steel, ISO.prismY(P, [[T, FT], [T + 0.5, FT], [T, FT + 1.1]], -0.08, 0.08, STEEL, "#e2e4e7", "#3c3f45"));
    // the oil hole on top (a dark dot on the rounded crown)
    const oil = [];
    for (let i = 0; i < 16; i++) { const q = (i / 16) * Math.PI * 2; oil.push(K.iso([Math.cos(q) * 0.12, Math.sin(q) * 0.12, Z + HY + 0.002], P)); }
    post += `<path d="${K.pathOf(oil, true)}" fill="#2a2c30"/>`;
    out.push(`<g data-name="post">${post}</g>`);
    // the near half of the bush: its flange on the +x face and the bore, dark, along x
    out.push(`<g data-name="bearing">${ISO.tinted(ISO.T.brass, S(G.ringBand(T, T + 0.14, 0.2, 0.55, Fb, P), { tone: "hi" }) + S(G.ringBand(T + 0.14, T + 0.22, 0.2, 0.36, Fb, P), { tone: "hi" }))}` +
      ISO.tinted(ISO.T.rubber, S(G.disc(T + 0.215, T + 0.225, 0.2, Fb, P), { tone: "lo", flat: true })) + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "bearingpost", title: "Bearing post (part)", compare: null,
    about: "A steel bearing post 8 cm tall on a 2 × 2 cm foot with a brass bush 7 cm up, its 4 mm hole along x carrying a motor's axle; two of them hold the coil. anchors: axle top",
    line: "bearingpost cx cy k lab=0 lit=post|bearing|foot",
    demo: { line: "bearingpost 480 420 40", script: [{ set: {}, hold: 1 }, { set: { lit: "bearing" }, hold: 1.2 }, { set: { lit: "post" }, hold: 1.2 }, { set: { lit: "foot" }, hold: 1.2 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = postSvg(P) + LAB.word(P, lab, [T + 0.4, HY + 0.4, Z + 1.2], "bearing", "#445", { anchor: "start" });
      g.anchors = { axle: [0, 0, Z], top: [0, 0, Z + HY] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B21.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "bearing post 8 cm · brass bush 7 cm up, 4 mm bore along x · the axle turns in it with a drop of oil";
      B21.light(w, g, lit);
      return g;
    },
  });
})();
