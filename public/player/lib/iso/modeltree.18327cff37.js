// "modeltree cx cy k lab=0 lit=leaves|trunk|base" — a PART (PARTS.md, batch 5): the small model tree of periscope.js
// (the thing seen over the wall), 25 cm tall with a crown 15 cm across, standing on the bench, origin the bench point
// under its trunk. A round wooden base, a tapered trunk with its root flare and two branches, and a crown of eleven
// clumps of foliage, each sitting on a branch or on the clumps under it. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const BARK = ISO.tint("#c9a27a", ["#7a5636", "#8a6442", "#9a7350", "#ab845f"], "#4a3220");
  const LEAF = [ISO.tint("#bfe0a8", ["#5f9a45", "#6eaa52", "#7fb962", "#92c775"], "#2c5a1e"), ISO.tint("#cfe8b6", ["#6fae52", "#80bd61", "#91c972", "#a3d585"], "#2c5a1e")];
  // crown clumps: centre (x, y, z) and radius; together 15 cm across, top at 25 cm
  const CLUMPS = [[0, 0, 14.5, 3.6], [-3.2, -2.4, 16, 3.4], [3.0, -2.6, 16.5, 3.3], [-3.6, 2.4, 15.5, 3.3], [3.4, 2.6, 15.2, 3.2], [0, -3.8, 19, 3.5],
    [-3.0, 0.6, 19.6, 3.6], [3.1, 0.4, 19.4, 3.5], [0, 3.4, 18.6, 3.4], [-0.6, -0.8, 22.2, 3.4], [0.8, 1.2, 21.8, 2.9]];

  // a clump's light: a soft pale patch toward the sun (up, toward the camera's left) and a few leaf flecks on it
  const lightOf = (P, c, r) => {
    const q = K.iso(c, P), s = G.scaleOf(P) * r, h = [q[0] - s * 0.28, q[1] - s * 0.32];
    const fl = [[-0.5, -0.2], [-0.1, -0.55], [0.2, -0.15], [-0.35, 0.25], [0.35, -0.45]].map(([a, b]) => `<circle cx="${(q[0] + a * s).toFixed(1)}" cy="${(q[1] + b * s).toFixed(1)}" r="${(s * 0.07).toFixed(2)}"/>`).join("");
    return `<ellipse cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" rx="${(s * 0.5).toFixed(1)}" ry="${(s * 0.42).toFixed(1)}" fill="#ffffff" opacity=".16"/><g fill="#2c5a1e" opacity=".22">${fl}</g>`;
  };
  function treeSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -4.2, y: -4.2, w: 8.4, d: 8.4, r: 4.2 }, 0, 1.2, P)}"/>`];
    // base: a turned wooden disc with a felt pad under it, a little earth mound round the trunk
    out.push(`<g data-name="base">${ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 3.9, 0, 0.15, P, 36), { tone: "lo" }))}` +
      ISO.tinted(ISO.T.wood, S(K.cylinder(0, 0, 4, 0.15, 1.05, P, 36, 0.25), { tone: "mid", inner: K.lineSvg(K.sideArc(0, 0, 4, 0.6, P, 36), { tone: "faint" }) })) +
      ISO.tinted(ISO.tint("#b39a76", ["#6e5a3e", "#7d684a", "#8c7656", "#9b8563"], "#4a3a26"), S(G.lathe([[0, 2], [0.25, 1.7, 1], [0.5, 1.0, 1], [0.6, 0.6]], G.frameOf([0, 0, 1.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 28 }), { tone: "mid" })) + `</g>`);
    // trunk: root flare, tapered stem up into the crown, two branches off it (each ends inside a clump)
    const Z = G.frameOf([0, 0, 1.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(`<g data-name="trunk">${ISO.tinted(BARK, S(G.lathe([[0, 1.0], [0.4, 0.75, 1], [1.2, 0.6, 1], [8, 0.5], [13.5, 0.4]], Z, P, { steps: 20 }), { tone: "mid", crease: "none" }))}`);
    const branch = (o, d, len, r) => ISO.tinted(BARK, S(G.disc(0, len, r, G.frameAlong(o, d), P), { tone: "mid", crease: "none" }));
    out.push(branch([0, 0, 10.5], G.unit3([-0.6, -0.4, 0.7]), 4.6, 0.22), branch([0, 0, 11.2], G.unit3([0.6, 0.5, 0.65]), 4.4, 0.2), `</g>`);
    // the crown, back to front so each clump sits on what is under it
    const items = CLUMPS.map(([x, y, z, r], i) => [K.depthOf([x, y, z], P), ISO.tinted(LEAF[i % 2], S(G.sphereOf([x, y, z], r, P), { tone: "hi" })) + lightOf(P, [x, y, z], r)]);
    out.push(`<g data-name="leaves">${items.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("")}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "modeltree", title: "Model tree (part)", compare: null,
    about: "A small model tree, 25 cm tall with a 15 cm crown, on a round wooden base; the far object seen through a periscope or a pinhole camera. anchors: top",
    line: "modeltree cx cy k lab=0 lit=leaves|trunk|base",
    demo: { line: "modeltree 480 440 14", script: [{ set: {}, hold: 1 }, { set: { lit: "leaves" }, hold: 1.3 }, { set: { lit: "trunk" }, hold: 1.3 }, { set: { lit: "base" }, hold: 1.3 }] },
    make([cx = 480, cy = 440, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = treeSvg(P) + (lab ? window.LAB.word(P, lab, [0, 0, 26.5], "tree", "#556") : "");
      g.anchors = { top: [0, 0, 25] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "model tree · 25 cm tall, crown 15 cm across";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
