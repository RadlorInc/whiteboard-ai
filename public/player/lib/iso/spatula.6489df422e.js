// "spatula cx cy k lab=0 lit=spatula" — a PART (PARTS.md, batch 5): the dissolve scene's steel spatula, 5 cm long,
// lying flat on a surface along x, origin its middle on that surface. One piece of 0.6 mm stainless sheet: a flat
// blade 8 mm wide with a rounded end (toward −x), a tapered neck and a 3 mm handle with a rounded end,
// brushed lines along the handle that end on its ends, "18/8" stamped on the handle. Static. Built in mm; anchors in cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const LEN = 50, T = 0.6, X0 = -LEN / 2;
  // the outline in plan, from the blade's rounded end round to the handle's rounded end and back (x, y)
  const outline = () => {
    const pts = [], arc = (cx, r, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + Math.cos(a) * r, Math.sin(a) * r]); } };
    arc(X0 + 4, 4, Math.PI / 2, (3 * Math.PI) / 2, 12);          // blade end, near side round to the far side
    pts.push([X0 + 10, -4], [X0 + 13, -1.5]);                       // blade to the neck
    arc(LEN / 2 - 1.5, 1.5, -Math.PI / 2, Math.PI / 2, 8);          // the handle's rounded end
    pts.push([X0 + 13, 1.5], [X0 + 10, 4]);
    return pts;
  };

  ISO.add({
    name: "spatula", title: "Steel spatula (part)", compare: null,
    about: "A 5 cm stainless-steel spatula with a flat 8 mm blade and a narrow handle, lying flat on a surface, to lift a crystal or a little powder from a bottle. anchors: blade",
    line: "spatula cx cy k lab=0 lit=spatula",
    demo: { line: "spatula 480 300 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "spatula" }, hold: 1.5 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const at = (x, y, z = T + 0.01) => K.iso([x, y, z], Pm), ring = outline();
      const brushed = [-0.9, -0.3, 0.3, 0.9].map((y) => K.pathOf([at(X0 + 14, y * (1 + 0.6 * 0)), at(LEN / 2 - 1.6, y)])).join("");
      const bladeLines = [-2.4, 0, 2.4].map((y) => K.pathOf([at(X0 + 2.5, y), at(X0 + 9, y)])).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0 - 0.5, y: -4.5, w: LEN + 1, d: 9, r: 4 }, 0, T, Pm)}"/>` +
        `<g data-name="spatula">${ISO.tinted(ISO.T.steel, S(K.extrude(ring, 0, T, Pm, { convex: false }), { tone: "hi", lit: true }))}` +
        `<path d="${brushed}${bladeLines}" fill="none" stroke="#8b9097" stroke-width="0.35" opacity=".55" data-free=""/>` +
        `<path d="${K.pathOf([at(X0 + 1.5, -1.5), at(X0 + 7.5, -3)])}" stroke="#ffffff" stroke-width="${Math.max(0.8, k * 0.05).toFixed(2)}" stroke-linecap="round" opacity=".7"/>` +
        LAB.faceText(Pm, [X0 + 33, 0.05, T + 0.02], [1, 0, 0], "18/8", 1.6, "#5c6168", [0, -1, 0]) + `</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([LEN / 2, 0, 6], Pm), "spatula", "#445", { size: 14, anchor: "start" });
      g.anchors = { blade: [(X0 + 5) / 10, 0, T / 10] };   // the blade's middle, where a crystal or a pinch of powder sits
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B11.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "stainless-steel spatula · 5 cm long, blade 8 mm wide, 0.6 mm thick";
      B11.light(w, g, lit);
      return g;
    },
  });
})();
