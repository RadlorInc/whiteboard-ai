// "glassbelljar cx cy k lab=0 lit=glass|rim|knob" — a PART (PARTS.md, batch 5): the bell jar of the bell-jar set-up
// (belljar.js's jar at real size), standing open end down, origin the surface point under its middle (place it at= a
// pumpplate's `top`, over what it covers). Thick clear glass 25 cm across and 40 cm high: a ground flange round the
// open rim, straight walls, a domed shoulder, a short neck and a knob to lift it by, a long glare down the front.
// See-through, so whatever stands inside it shows. Static (the air inside is pumped out, which you can't see).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RW = 117, RF = 125, WALL = 250, DOME = 108, TOP = 402;

  function jarSvg(P) {
    const B08 = window.B08, F = B08.Z([0, 0, 0]), prof = [[0, RW], [WALL, RW, 1]];
    // the dome: a quarter ellipse from the wall up to the neck
    for (let i = 1; i <= 10; i++) { const a = (i / 12) * (Math.PI / 2); prof.push([WALL + DOME * Math.sin(a), RW * Math.cos(a), 1]); }
    prof.push([WALL + DOME * Math.sin((Math.PI / 2) * (10.6 / 12)) + 2, 18]);
    const face = G.angleToward(F, G.viewOf(P)), glare = [], glare2 = [];
    for (let i = 0; i <= 10; i++) { const s = 30 + (i / 10) * (WALL - 40); glare.push(K.iso(G.pointOf(F, s, RW + 0.5, face + 0.55), P)); glare2.push(K.iso(G.pointOf(F, s * 0.7 + 40, RW + 0.5, face + 0.72), P)); }
    const w = (n) => (G.scaleOf(P) * n).toFixed(2);
    return B08.glassCss("gbj-glass") +
      `<g class="gbj-glass" style="${ISO.T.glass}"><g data-name="glass">${S(G.solidOf(prof, F, P), { tone: "hi" })}</g>` +
      `<g data-name="rim">${S(G.ringBand(0, 9, RW - 7, RF, F, P), { tone: "hi" })}</g>` +
      `<g data-name="knob">${S(G.disc(355, 372, 18, F, P), { tone: "hi" })}${S(G.disc(372, 376, 12, F, P), { tone: "hi" })}${S(G.sphereOf([0, 0, TOP - 17], 17, P), { tone: "hi" })}</g></g>` +
      `<path d="${K.pathOf(glare)}" fill="none" stroke="#ffffff" stroke-width="${w(7)}" stroke-linecap="round" opacity=".8"/>` +
      `<path d="${K.pathOf(glare2)}" fill="none" stroke="#ffffff" stroke-width="${w(3)}" stroke-linecap="round" opacity=".6"/>`;
  }

  ISO.add({
    name: "glassbelljar", title: "Glass bell jar (part)", compare: null,
    about: "A thick glass bell jar 25 cm across and 40 cm high, open end down: ground flange round the rim, domed top with a knob to lift it; see-through, so it goes over a bell or a balloon on a pump plate. anchors: knob",
    line: "glassbelljar cx cy k lab=0 lit=glass|rim|knob",
    demo: { line: "glassbelljar 480 470 10", script: [{ set: {}, hold: 1 }, { set: { lit: "rim" }, hold: 1.2 }, { set: { lit: "knob" }, hold: 1.2 }, { set: { lit: "glass" }, hold: 1.2 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RF, y: -RF, w: 2 * RF, d: 2 * RF, r: RF }, 0, 4, Pm)}"/>` + jarSvg(Pm) + (lab ? CIRC.word(P, [RF / 10, 0, TOP / 10], "bell jar") : "");
      g.anchors = { knob: [0, 0, TOP / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (q) => { if (q.lit !== undefined) { lit = q.lit; window.B08.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "glass bell jar · 25 cm across, 40 cm high · its ground flange seals on a greased pump plate";
      window.B08.light(w, g, lit);
      return g;
    },
  });
})();
