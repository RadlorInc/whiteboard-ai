// "commutator cx cy k rpm=0..300 angle=0..360 lab=0 lit=rings|core|tags" — a PART (PARTS.md, batch 5): the split-ring
// commutator of motor.js, real size: two copper half rings (Ø 1.5 cm, 1 cm long) on a dark fibre core, with two
// 1 mm gaps between them, two solder tags at the −x end where the coil's ends are soldered, and the 4 mm axle through
// it. The origin is its middle on the axle (axis along x); place it at an armaturecoil's `comm`. The brushes press on
// its sides at `b1` (−y) and `b2` (+y), or on top at `top`. It turns with the coil: rpm and angle as armaturecoil
// (the same law, so set them alike); every half turn each brush passes a gap and goes over to the other half ring,
// which reverses the current in the coil. set({ rpm, angle }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 0.75, RC = 0.45, L = 0.5, GAP = 0.07, AR = 0.2;
  const FIBRE = ISO.tint("#6b5446", ["#3d2e25", "#47362c", "#523f33", "#5d483b"], "#21170f");

  const cache = new WeakMap();   // the axle, the core and the copper sleeve look the same at every angle
  const fixedOf = (P) => {
    if (!cache.has(P)) {
      const Fa = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      cache.set(P, {
        back: `<g data-name="axle">${ISO.tinted(ISO.T.steel, S(G.disc(-1.1, -L, AR, Fa, P, { steps: 20 }), { tone: "hi" }))}</g>`,
        core: `<g data-name="core">${ISO.tinted(FIBRE, S(G.disc(-L - 0.08, L + 0.08, RC + 0.05, Fa, P, { steps: 20 }), { tone: "mid" }))}</g>`,
        ring: ISO.tinted(ISO.T.copper, S(G.ringBand(-L, L, RC, R, Fa, P, { steps: 24 }), { tone: "hi" })),
        front: `<g data-name="axle">${ISO.tinted(ISO.T.steel, S(G.disc(L + 0.08, 1.1, AR, Fa, P, { steps: 20 }), { tone: "hi" }))}</g>`,
      });
    }
    return cache.get(P);
  };
  function bodySvg(P, a) {
    const X = [1, 0, 0], r = [0, Math.cos(a), Math.sin(a)], n = [0, -Math.sin(a), Math.cos(a)];
    const F = G.frameOf([0, 0, 0], X, r, n), out = [];
    const d0 = K.depthOf([0, 0, 0], P), toward = (q) => K.depthOf(G.pointOf(F, 0, 1, q), P) - d0 > 0;
    // the axle stub through it (far end first), the solder tags at the −x end, the fibre core, the rings
    const fx = fixedOf(P);
    out.push(fx.back);
    const tags = [Math.PI / 2, -Math.PI / 2].map((q) => {
      const Ft = G.frameOf(G.pointOf(F, -L - 0.12, 0.58, q), X, G.pointOf(G.frameOf([0, 0, 0], X, r, n), 0, 1, q), G.pointOf(G.frameOf([0, 0, 0], X, r, n), 0, 1, q + Math.PI / 2));
      return ISO.tinted(ISO.T.copper, S(G.prismOf(Ft, [[-0.12, -0.18], [0.12, -0.18], [0.12, 0.18], [-0.12, 0.18]], -0.12, 0.14, P), { tone: "hi" }));
    });
    out.push(`<g data-name="tags">${tags.join("")}</g>`);
    out.push(fx.core);
    // the copper sleeve; then the two gaps cut through it, only where they face us
    const gaps = [0.3, Math.PI + 0.3].filter(toward).map((q) => K.pathOf([G.pointOf(F, -L, R + 0.005, q), G.pointOf(F, L, R + 0.005, q)].map((p) => K.iso(p, P))));
    const wear = [0.3 + Math.PI / 2, 0.3 - Math.PI / 2].filter(toward).map((q) => K.pathOf([G.pointOf(F, -0.25, R + 0.005, q), G.pointOf(F, 0.25, R + 0.005, q)].map((p) => K.iso(p, P))));
    const gw = Math.max(0.6, G.scaleOf(P) * GAP);
    out.push(`<g data-name="rings">${fx.ring}` +
      (gaps.length ? `<path d="${gaps.join("")}" stroke="#2b1a10" stroke-width="${gw.toFixed(2)}" stroke-linecap="butt" data-free=""/>` : "") +
      (wear.length ? `<path d="${wear.join("")}" stroke="#a5653f" stroke-width="${(gw * 1.6).toFixed(2)}" stroke-linecap="round" opacity=".45" data-free=""/>` : "") + `</g>`);
    out.push(fx.front);
    return out.join("");
  }

  ISO.add({
    name: "commutator", title: "Split-ring commutator (part)", compare: null,
    about: "A split-ring commutator: two copper half rings (Ø 1.5 cm) on a fibre core on the motor's axle, turning with the coil; every half turn the brushes cross the gaps and the current in the coil reverses. anchors: b1 b2 top coil",
    line: "commutator cx cy k rpm=0..300 angle=0..360 lab=0 lit=rings|core|tags",
    demo: { line: "commutator 480 280 60 angle=20", script: [{ set: {}, hold: 1 }, { set: { lit: "rings" }, hold: 1.2 }, { set: { rpm: 30, lit: "tags" }, hold: 3 }, { set: { lit: "core" }, hold: 1 }, { set: { rpm: 0, lit: "" }, hold: "settle" }, { set: { angle: 110 }, hold: 1 }] },
    make([cx = 480, cy = 280, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), sp = B21.spin(o);
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="body"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      if (lab) el.words.innerHTML = LAB.word(P, lab, [0, R + 0.4, R + 0.5], "split ring");
      g.anchors = { b1: [0, -R, 0], b2: [0, R, 0], top: [0, 0, R], coil: [-L, 0, 0] };
      const draw = () => { w.rebuild(el.body, sp.a.toFixed(4), () => bodySvg(P, sp.a)); B21.light(w, g, lit); };
      g.set = (p) => { sp.set(p); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { const m = sp.step(dt); draw(); return m; };
      g.readout = () => { const q = (((Math.PI / 2 - sp.a - 0.3) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return `split ring Ø 1.5 cm · ${sp.w > 0 ? `turning at ${(sp.w * 60).toFixed(0)} rpm, the current flips ${(sp.w * 2).toFixed(1)} times a second` : "at rest"} · the +y brush on half ring ${q < Math.PI ? 1 : 2}`; };
      draw();
      return g;
    },
  });
})();
