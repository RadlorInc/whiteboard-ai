// "handcrank cx cy k rpm=0..300 angle=0..360 lab=0 lit=hub|arm|knob" — a PART (PARTS.md, batch 5): the crank that turns
// motor.js's coil when it is used as a generator, real size: a steel hub (Ø 1.1 cm) with a grub screw that grips the
// axle end, a 5 cm flat arm tapering out to a pin, and a turned wooden knob on the pin, pointing +x (away from the
// machine). The origin is the hub's inner face on the axle's line (the axle runs along x); place it at an
// armaturecoil's `crank`. rpm and angle as armaturecoil (the same law, so the coil turns with it; angle = the arm's
// direction about +x, 0 = toward +y). `knob` = the knob's end (where a hand grips, at build time). set({ rpm, angle }).
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const ARM = 5, H0 = 0, H1 = 0.7, A0 = 0.7, A1 = 1.0, RH = 0.55;
  const WOOD = ISO.tint("#f1d6ad", ["#b9874d", "#c89a60", "#d6ad76", "#e3c08e"], "#5f3f16");

  const cache = new WeakMap(), knobs = new WeakMap();   // per camera: the hub looks the same at every angle; the knob too, moved flat
  function crankSvg(P, a) {
    const X = [1, 0, 0], r = [0, Math.cos(a), Math.sin(a)], n = [0, -Math.sin(a), Math.cos(a)], out = [];
    const F = G.frameOf([0, 0, 0], X, r, n), d0 = K.depthOf([0, 0, 0], P);
    // the grub screw sits opposite the arm: behind the hub when it points away from us, in front when toward us
    const sq = Math.PI, sp = G.pointOf(F, (H0 + H1) / 2, 1, sq), sdir = [sp[0] - (H0 + H1) / 2, sp[1], sp[2]];
    const Fs = G.frameAlong(G.pointOf(F, (H0 + H1) / 2, RH - 0.05, sq), sdir);
    const screw = `<g data-name="hub">${ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.1, 0.16, Fs, P, { steps: 20 }), { tone: "mid" }))}</g>`;
    const front = K.depthOf(sdir, P) - d0 > 0;
    if (!front) out.push(screw);
    if (!cache.has(P)) cache.set(P, `<g data-name="hub">${ISO.tinted(ISO.T.steel, S(G.disc(H0, H1, RH, F, P, { bevel: 0.06, steps: 24 }), { tone: "hi" }))}</g>`);
    out.push(cache.get(P));
    if (front) out.push(screw);
    // the arm: a flat bar, rounded at both ends, 1.4 cm wide at the hub tapering to 0.9 at the pin
    const outline = [];
    for (let i = 0; i <= 10; i++) { const q = Math.PI / 2 + (i / 10) * Math.PI; outline.push([Math.cos(q) * 0.7, Math.sin(q) * 0.7]); }
    for (let i = 0; i <= 10; i++) { const q = -Math.PI / 2 + (i / 10) * Math.PI; outline.push([ARM + Math.cos(q) * 0.45, Math.sin(q) * 0.45]); }
    out.push(`<g data-name="arm">${ISO.tinted(ISO.T.steel, S(G.prismOf(F, outline, A0, A1, P), { tone: "hi" }))}</g>`);
    // the pin and the wooden knob on it, turning freely (it does not spin in the hand)
    // the knob is turned about its own axis (parallel to x): any angle is the same drawing moved flat on the board
    if (!knobs.has(P)) {
      const Fk = G.frameOf([0, ARM, 0], X, [0, 1, 0], [0, 0, 1]);
      knobs.set(P, ISO.tinted(ISO.T.steel, S(G.disc(A1, A1 + 0.15, 0.22, Fk, P, { steps: 20 }), { tone: "hi" })) +
        ISO.tinted(WOOD, S(G.lathe([[A1 + 0.12, 0], [A1 + 0.12, 0.34], [A1 + 0.5, 0.44], [A1 + 1.6, 0.5], [A1 + 2.2, 0.44], [A1 + 2.45, 0.28], [A1 + 2.5, 0]], Fk, P, { steps: 24 }), { tone: "hi" })));
    }
    const p0 = K.iso([0, ARM, 0], P), p1 = K.iso([0, Math.cos(a) * ARM, Math.sin(a) * ARM], P);
    out.push(`<g data-name="knob" transform="translate(${(p1[0] - p0[0]).toFixed(2)} ${(p1[1] - p0[1]).toFixed(2)})">${knobs.get(P)}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "handcrank", title: "Hand crank (part)", compare: null,
    about: "A hand crank for a generator: a steel hub with a grub screw on the axle end, a 5 cm arm and a wooden knob; rpm turns it (and the coil, set alike). anchors: hub knob",
    line: "handcrank cx cy k rpm=0..300 angle=0..360 lab=0 lit=hub|arm|knob",
    demo: { line: "handcrank 450 290 40 angle=60", script: [{ set: {}, hold: 1 }, { set: { lit: "knob" }, hold: 1.2 }, { set: { rpm: 60, lit: "arm" }, hold: 3 }, { set: { lit: "hub" }, hold: 1 }, { set: { rpm: 0, lit: "" }, hold: "settle" }, { set: { angle: 200 }, hold: 1 }] },
    make([cx = 480, cy = 290, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), sp = B21.spin(o);
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="crank"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      const knob = () => [A1 + 2.5, +(Math.cos(sp.a) * ARM).toFixed(3), +(Math.sin(sp.a) * ARM).toFixed(3)];
      g.anchors = { hub: [0, 0, 0], knob: knob() };
      const draw = () => {
        w.rebuild(el.crank, sp.a.toFixed(4), () => crankSvg(P, sp.a));
        if (lab) w.rebuild(el.words, sp.a.toFixed(2), () => LAB.word(P, lab, knob().map((v, i) => v + [0.6, 0, 0.6][i]), "crank", "#445", { anchor: "start" }));
        B21.light(w, g, lit);
      };
      g.set = (p) => { sp.set(p); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { const m = sp.step(dt); draw(); return m; };
      g.readout = () => `crank arm 5 cm · ${sp.w > 0 ? `turning at ${(sp.w * 60).toFixed(0)} rpm, the knob moving at ${(2 * Math.PI * 0.05 * sp.w).toFixed(2)} m/s` : "at rest"}`;
      draw();
      return g;
    },
  });
})();
