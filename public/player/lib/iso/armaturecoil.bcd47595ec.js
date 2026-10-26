// "armaturecoil cx cy k rpm=0..300 angle=0..360 lab=0 lit=coil|axle|hubs" — a PART (PARTS.md, batch 5): the turning
// coil of motor.js, real size. A rectangular coil of enamelled copper wire, 6 cm along the axle and 4 cm across, its
// two long sides parallel to the axle, wound round two plastic hubs on a 12 cm steel axle (Ø 4 mm), with two paper
// tape bands on each side holding the turns together and the coil's two ends led along the axle toward +x to where
// the split-ring commutator sits (anchor `comm`). The origin is the middle of the axle (the axle runs along x); it
// rests in two bearing posts at `left`/`right` (x = ±5) and a crank fits on `crank`. rpm = turns a minute, eased
// (a rotor's inertia); angle = the coil's tilt about the axle (deg, 0 = flat). The commutator and handcrank take the
// same rpm and angle and turn with the same law, so set them alike. set({ rpm, angle }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 3, HW = 2, BW = 0.45, BT = 0.32, AX = 6, AR = 0.2, HUB = 0.55;
  const ENAMEL = ISO.tint("#f2c9a6", ["#b8693e", "#c97b4e", "#d98f62", "#e6a47a"], "#5e2d12");
  const TAPE = ISO.tint("#f6f1e3", ["#cfc6ad", "#dad2bb", "#e4ddc9", "#eee8d7"], "#6d6650");

  const cache = new WeakMap();   // the hubs and the axle look the same at every angle: built once per camera
  const fixedOf = (P, X) => {
    if (!cache.has(P)) cache.set(P, {
      hubs: [-HX, HX].map((x) => `<g data-name="hubs">${ISO.tinted(ISO.T.plastic, S(G.disc(-0.3, 0.3, HUB, G.frameOf([x, 0, 0], X, [0, 1, 0], [0, 0, 1]), P, { steps: 20 }), { tone: "mid" }))}</g>`),
      axle: [[-AX, -HX - 0.3], [-HX + 0.3, HX - 0.3], [HX + 0.3, AX]].map(([x0, x1]) => `<g data-name="axle">${ISO.tinted(ISO.T.steel, S(G.disc(x0, x1, AR, G.frameOf([0, 0, 0], X, [0, 1, 0], [0, 0, 1]), P, { steps: 20 }), { tone: "hi" }))}</g>`),
    });
    return cache.get(P);
  };
  function rotorSvg(P, a) {
    const r = [0, Math.cos(a), Math.sin(a)], n = [0, -Math.sin(a), Math.cos(a)], X = [1, 0, 0];
    const add = (p, d, k) => p.map((v, i) => v + d[i] * k), items = [];
    const rect = (w, t) => [[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2], [-w / 2, t / 2]];
    const d0 = K.depthOf([0, 0, 0], P), faces = (d) => K.depthOf(d, P) - d0 > 0;
    // the two long sides: a bundle of turns, the wire lines along the face toward us, two tape bands round it
    for (const sg of [-1, 1]) {
      const c = add([0, 0, 0], r, sg * HW), F = G.frameOf(c, X, r, n), vs = faces(n) ? 1 : -1;
      const lines = [-0.12, 0.04, 0.18].map((u) => K.pathOf([-HX + 0.25, HX - 0.25].map((s) => K.iso(add(add(add(c, X, s), r, u), n, vs * (BT / 2 + 0.005)), P)))).join("");
      let svg = ISO.tinted(ENAMEL, S(G.prismOf(F, rect(BW, BT), -HX - BW / 2, HX + BW / 2, P), { tone: "hi" })) + K.lineSvg(lines, { tone: "lo", free: true });
      for (const s of [-1.6, 1.6]) svg += ISO.tinted(TAPE, S(G.prismOf(F, rect(BW + 0.08, BT + 0.08), s - 0.35, s + 0.35, P), { tone: "hi" }));
      items.push([c, `<g data-name="coil">${svg}</g>`]);
    }
    // the short ends: from each hub out to the corners, each half on its own so the axle sorts between them
    for (const x of [-HX, HX]) for (const sg of [-1, 1]) {
      const F = G.frameOf([x, 0, 0], r, X, n);
      items.push([add([x, 0, 0], r, sg * 1.3), `<g data-name="coil">${ISO.tinted(ENAMEL, S(G.prismOf(F, rect(BW, BT), sg > 0 ? HUB - 0.1 : -HW - BW / 2, sg > 0 ? HW + BW / 2 : -HUB + 0.1, P), { tone: "hi" }))}</g>`]);
    }
    // the plastic hubs the coil is wound on and the axle in three pieces (outside each hub, and the middle)
    const fx = fixedOf(P, X);
    [-HX, HX].forEach((x, i) => items.push([[x, 0, 0], fx.hubs[i]]));
    [[-AX, -HX - 0.3], [-HX + 0.3, HX - 0.3], [HX + 0.3, AX]].forEach(([x0, x1], i) => items.push([[(x0 + x1) / 2, 0, 0], fx.axle[i]]));
    // the coil's two ends: out of the +x hub, along the axle to the commutator's solder tags
    for (const q of [Math.PI / 2, -Math.PI / 2]) {
      const rad = add([0, 0, 0], r, Math.cos(q)), dir = add(rad, n, Math.sin(q)), pt = (x, k) => [x, dir[1] * k, dir[2] * k];
      items.push([pt(3.6, 0.4), `<g data-name="coil">${PHYS.wire(P, PHYS.path(P, [pt(HX + 0.3, 0.45), pt(3.45, 0.42)]), 0.04, { ink: "#5e2d12", body: "#c97b4e", shine: "#f2c9a6" })}</g>`]);
    }
    return B21.sorted(items, P);
  }

  ISO.add({
    name: "armaturecoil", title: "Motor coil on its axle (part)", compare: null,
    about: "The rectangular copper coil of a DC motor or generator (6 × 4 cm) wound on two hubs on a 12 cm steel axle; rpm spins it, angle tilts it; place it on two bearing posts. anchors: left right comm crank",
    line: "armaturecoil cx cy k rpm=0..300 angle=0..360 lab=0 lit=coil|axle|hubs",
    demo: { line: "armaturecoil 480 280 48", script: [{ set: {}, hold: 1 }, { set: { lit: "coil" }, hold: 1.2 }, { set: { rpm: 60, lit: "axle" }, hold: 3 }, { set: { lit: "hubs" }, hold: 1.2 }, { set: { rpm: 0, lit: "" }, hold: "settle" }, { set: { angle: 90 }, hold: 1 }] },
    make([cx = 480, cy = 280, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), sp = B21.spin(o);
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="rotor"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      if (lab) el.words.innerHTML = LAB.word(P, lab, [0, HW + 0.8, HW + 0.6], "coil") + LAB.word(P, lab, [-AX + 0.3, 0, -0.9], "axle");
      g.anchors = { left: [-5, 0, 0], right: [5, 0, 0], comm: [3.9, 0, 0], crank: [5.85, 0, 0] };
      const draw = () => { w.rebuild(el.rotor, sp.a.toFixed(4), () => rotorSvg(P, sp.a)); B21.light(w, g, lit); };
      g.set = (p) => { sp.set(p); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { const m = sp.step(dt); draw(); return m; };
      g.readout = () => `coil 6 × 4 cm, about 40 turns of enamelled copper · ${sp.w > 0 ? `turning at ${(sp.w * 60).toFixed(0)} rpm` : "at rest"} · tilted ${Math.round((((sp.a * 180) / Math.PI) % 360 + 360) % 360)}° from flat`;
      draw();
      return g;
    },
  });
})();
