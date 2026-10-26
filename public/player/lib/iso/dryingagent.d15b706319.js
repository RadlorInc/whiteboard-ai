// "dryingagent cx cy k d=1..5 h=0.5..3 lab=0 lit=granules" — a PART (PARTS.md, batch 5): a layer of anhydrous calcium
// chloride granules (white, irregular 3–4 mm lumps), as rust.js piles them in the bottom of tube 3 to keep its air dry.
// Origin: the bottom point of the layer, on the round floor of the tube it fills (place it at= a boilingtube's
// `inside`); the layer is `d` cm across (the tube's inside) and `h` cm deep, its lumps kept inside the tube's round
// bottom and straight wall. Static. anchors: top (the middle of the layer's top, where cotton wool goes).
(() => {
  const K = window.K;
  const SALT = ISO.tint("#fbfaf6", ["#cfccc2", "#dcd9d0", "#e8e6df", "#f2f1ec"], "#8a877f");

  ISO.add({
    name: "dryingagent", title: "Drying agent granules (part)", compare: null,
    about: "A layer of white anhydrous calcium chloride granules filling the round bottom of a tube, 2 cm across and 1.5 cm deep; it soaks up water vapour so the air above stays dry. anchors: top",
    line: "dryingagent cx cy k d=1..5 h=0.5..3 lab=0 lit=granules",
    demo: { line: "dryingagent 480 380 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "granules" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const R = ISO.clamp(ISO.num(o, "d", 2), 1, 5) * 5, H = ISO.clamp(ISO.num(o, "h", 1.5), 0.5, 3) * 10;
      // the room inside at height z: the round bottom (a hemisphere of radius R), then the straight wall
      const room = (z) => (z < R ? Math.sqrt(Math.max(0, R * R - (R - z) ** 2)) : R);
      const lumps = [];
      let n = 0;
      for (let z = 1.6; z <= H - 1.2; z += 3) {
        const rr = room(z) - 1.9, rings = Math.max(0, Math.floor(rr / 3.2));
        for (let ring = 0; ring <= rings; ring++) {
          const r = ring * 3.2, m = ring === 0 ? 1 : Math.max(3, Math.round((2 * Math.PI * r) / 3.6));
          for (let i = 0; i < m; i++) {
            const a = (i / m) * Math.PI * 2 + z * 0.9 + ring * 0.5, j = n++, s = 1.5 + ((j * 7) % 5) * 0.18;
            lumps.push({ c: [Math.cos(a) * r, Math.sin(a) * r, z], s, j });
          }
        }
      }
      // an irregular lump: a squashed octahedron with each tip pushed in or out a little (a granule, not a crystal)
      const jit = (j, i) => 0.75 + (((j * 13 + i * 7) % 9) / 9) * 0.45;
      const V = (c, s, j) => {
        const tw = j * 1.7, pt = (u, v, w) => [c[0] + (u * Math.cos(tw) - v * Math.sin(tw)) * s, c[1] + (u * Math.sin(tw) + v * Math.cos(tw)) * s, c[2] + w * s * 0.7];
        return [[1, 0.2, 0], [-0.1, 1, 0.1], [-1, -0.2, 0], [0.15, -1, -0.1], [0.1, 0, 1], [0, 0.1, -1]].map(([x, y, z], i) => { const r = jit(j, i); return pt(x * r, y * r, z * r); });
      };
      const FACES = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 5], [2, 1, 5], [3, 2, 5], [0, 3, 5]];
      // painted layer by layer from the bottom, back to front inside each layer
      lumps.sort((p, q) => p.c[2] - q.c[2] || K.depthOf(p.c, Pm) - K.depthOf(q.c, Pm));
      const svg = lumps.map(({ c, s, j }) => ISO.poly(V(c, s, j), FACES, Pm, ["lo", "mid", "hi"][j % 3])).join("");
      g.innerHTML = `<g data-name="granules">${ISO.tinted(SALT, svg)}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      let lit = o.lit || "";
      if (lab) el.words.innerHTML = LAB.word(Pm, lab, [R + 2, 0, H * 0.5], "drying agent", "#556", { anchor: "start" });
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `anhydrous calcium chloride, a layer ${(2 * R / 10).toFixed(1)} cm across and ${(H / 10).toFixed(1)} cm deep · it soaks up water vapour, so the air above it is dry`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
