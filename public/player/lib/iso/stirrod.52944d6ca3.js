// "stirrod cx cy k len=10..30 aim=flat|lean deg=20..85 lab=0 lit=rod" — a PART (PARTS.md, batch 5): a glass stirring
// rod, 5 mm across, its ends fire-polished round. aim=flat lies it along x on a surface (a tile, or across a beaker's
// rim holding a paper strip), origin = its middle on that surface; aim=lean stands its lower end at the origin (a
// beaker's `inside`) and leans it toward +x at deg from the bench, resting on the rim. Reused from beaker.js,
// chroma.js and dissolve.js (their rods). Static. World units: 1 = 1 cm. anchors: tip (the lower or −x end), top, mid.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 0.25;

  ISO.add({
    name: "stirrod", title: "Glass stirring rod (part)", compare: null,
    about: "A glass stirring rod with fire-polished ends: lies flat on a tile or across a beaker's rim, or leans in a beaker. anchors: tip top mid",
    line: "stirrod cx cy k len=10..30 aim=flat|lean deg=20..85 lab=0 lit=rod",
    demo: { line: "stirrod 440 420 22 len=15 aim=lean deg=62", script: [{ set: {}, hold: 1 }, { set: { lit: "rod" }, hold: 1.4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const len = ISO.clamp(ISO.num(o, "len", 15), 10, 30), lean = o.aim === "lean", deg = ISO.clamp(ISO.num(o, "deg", 62), 20, 85) * (Math.PI / 180);
      const dir = lean ? [Math.cos(deg), 0, Math.sin(deg)] : [1, 0, 0];
      // the axis runs from the tip's end point: on the axis height for flat, at the origin (just clear of it) for lean
      const a = lean ? [0, 0, R * Math.cos(deg)] : [-len / 2, 0, R], b = a.map((v, i) => v + dir[i] * len);
      const F = G.frameAlong(a, dir);
      // fire-polished: each end rounds over in a quarter circle of the rod's radius
      const prof = [[0, 0.04], [R * 0.13, R * 0.5, 1], [R * 0.5, R * 0.87, 1], [R, R], [len - R, R], [len - R * 0.5, R * 0.87, 1], [len - R * 0.13, R * 0.5, 1], [len, 0.04]];
      const v = G.viewOf(P), side = G.angleToward(F, v) + 1.1;
      const shine = K.pathOf([0.12, 0.5, 0.88].map((f) => K.iso(G.pointOf(F, R + (len - 2 * R) * f, R * 0.55, side), P)));
      const plan = lean ? { x: -R, y: -R, w: Math.cos(deg) * len + 2 * R, d: 2 * R, r: R } : { x: -len / 2, y: -R, w: len, d: 2 * R, r: R };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>` +
        `<g data-name="rod"><g style="${ISO.T.glass}">${S(G.solidOf(prof, F, P), { tone: "mid" })}</g><path d="${shine}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.6, k * 0.06).toFixed(2)}" stroke-linecap="round" opacity=".85"/></g>` +
        (lab ? LAB.word(P, lab, b.map((x, i) => x + [0.6, 0, 0.6][i]), "glass rod", "#556", { anchor: "start" }) : "");
      g.anchors = { tip: a, top: b, mid: a.map((x, i) => x + dir[i] * len / 2) };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) LAB.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => `glass stirring rod · ${len} cm long, 5 mm across · ${lean ? `leaning at ${Math.round((deg * 180) / Math.PI)}°` : "lying flat"}`;
      LAB.light(w, g, o.lit || "");
      return g;
    },
  });
})();
