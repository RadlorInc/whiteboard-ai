// "microphone cx cy k lab=0 lit=mic|clip|stand|lead" — a PART (PARTS.md, batch 5): a microphone on a small desk stand,
// its origin the floor (or bench) point under the middle of the stand's base. A cast round base 10 cm across on a
// rubber ring, a 20 cm steel pole, a swivel knuckle with its thumb screw (+y), and a clip ring that holds the mic
// pointing along +x, tipped 15° up: a 3 cm ball grille (its holes in rows), a band, a tapered body 12 cm long and the
// plug at its tail, its lead looping down behind the pole and off along the floor to a plug. Static.
// Reused from echo.js (its mic stand and grille dots) and mic.js. World units: 1 = 1 cm. anchors: head (the grille's
// front, where it listens) plug.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ZK = 20.6, TIP = (15 * Math.PI) / 180, AX = [Math.cos(TIP), 0, Math.sin(TIP)];
  const PAINT = ISO.tint("#d5dde6", ["#7d8b99", "#909dab", "#a3afbb", "#b8c2cc"], "#2b3640");
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // the mic's axis: s along AX from its tail; the clip ring holds it at s = 6, over the knuckle
  const O = [-6 * AX[0], 0, ZK + 1.5 - 6 * AX[2]], on = (s) => [O[0] + AX[0] * s, 0, O[2] + AX[2] * s];

  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -5, y: -5, w: 10, d: 10, r: 5 }, 0, 1.5, P)}"/>`];
    out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 4.8, 0, 0.3, P, 32), { tone: "lo" })));
    out.push(ISO.tinted(PAINT, S(G.lathe([[0, 0], [0, 5], [0.4, 5], [1.1, 3.6, 1], [1.4, 1], [1.4, 0]], G.frameOf([0, 0, 0.3], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 32 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.5, 1.7, ZK - 0.6 - 1.7, P, 16), { tone: "hi", crease: "none" })));
    // the knuckle: a block on the pole top, its thumb screw out toward +y
    out.push(ISO.tinted(ISO.T.plastic, S(G.sphereOf([0, 0, ZK], 0.75, P), { tone: "mid" })));
    const F = Y([0, 0, ZK]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0.6, 1.1, 0.18, F, P), { tone: "mid" })), window.B03.knob(P, F, 1.1, 1.6, 0.5));
    return out.join("");
  }
  // the clip: a stem from the knuckle up to a ring round the body (its back half, then its front half over the mic)
  function clipSvg(P, half) {
    const F = G.frameAlong(on(5.4), AX), out = [];
    if (half === "back") out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-0.3, 0.3], [-0.35, 0.35], [ZK + 0.4, on(6)[2] - 1.1], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, S(G.ringBand(0, 1.2, 1.25, 1.55, F, P), { tone: half === "back" ? "lo" : "mid" })));
    return out.join("");
  }
  // the mic: plug tail, tapered body, band, ball grille with rows of holes
  function micSvg(P) {
    const F = G.frameAlong(O, AX), out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[-0.8, 0], [-0.8, 0.55], [0, 0.7], [0, 0]], F, P, { steps: 20 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[0, 0], [0, 1.05], [0.4, 1.15, 1], [11.6, 1.42], [12, 1.42], [12, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[12, 0], [12, 1.5], [12.6, 1.5], [12.6, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[12.6, 0], [12.6, 1.5], [13.4, 1.5, 1], [14.6, 1.25, 1], [15.4, 0.7, 1], [15.65, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    [[13, 1.5], [13.6, 1.47], [14.2, 1.37], [14.8, 1.16], [15.25, 0.86]].forEach(([s, r], i) => out.push(D(G.dotsOf(F, s, r + 0.01, 16 - i * 2, P, { phase: (i % 2) * 0.5, least: 0.12 }), { size: 0.42 })));
    out.push(`<path d="${G.arcOf(F, 13.2, 1.52, P)}" fill="none" stroke="#5a5d63" stroke-width="0.5"/>`);
    out.push(D([K.iso(G.pointOf(F, 7, 1.32, G.angleToward(F, G.viewOf(P)) + 0.3), P)], { size: 0.5, tone: "hi" }));
    return out.join("");
  }
  // the lead: out of the plug, down behind the pole, along the floor toward −x to its plug
  const leadPts = () => [on(-0.8), on(-2.2), [-2.8, -0.8, ZK - 3], [-1, -0.8, 6], [-1.3, -0.8, 1.8], [-3.4, -1, 1.55], [-5.2, -1.3, 0.85], [-6.2, -1.5, 0.35], [-16, -2, 0.35]];
  const leadSvg = (P) => `<path d="${K.pathOf(window.LAB.bend(leadPts(), 1.2).map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="${Math.max(0.7, G.scaleOf(P) * 0.4).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    ISO.tinted(ISO.T.steel, S(G.disc(0, 2.2, 0.45, G.frameOf([-16, -2, 0.45], [-1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));

  ISO.add({
    name: "microphone", title: "Microphone on a stand (part)", compare: null,
    about: "A microphone (3 cm ball grille, 16 cm long) held in a clip on a small 20 cm desk stand, pointing along +x; its lead runs off along the floor to a plug. anchors: head plug",
    line: "microphone cx cy k lab=0 lit=mic|clip|stand|lead",
    demo: { line: "microphone 470 400 15 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "mic" }, hold: 1.3 }, { set: { lit: "clip" }, hold: 1.3 }, { set: { lit: "stand" }, hold: 1.3 }, { set: { lit: "lead" }, hold: 1.3 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = `<g data-name="lead">${leadSvg(P)}</g><g data-name="stand">${standSvg(P)}</g><g data-name="clip">${clipSvg(P, "back")}</g><g data-name="mic">${micSvg(P)}</g><g data-name="clip">${clipSvg(P, "front")}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, on(15.6), "microphone", "#556", { anchor: "start", dy: -8 }) + LAB.word(P, lab, [5, 0, 1], "stand", "#556", { anchor: "start" });
      const head = on(15.65);
      g.anchors = { head: head.map((v) => +v.toFixed(3)), plug: [-18.2, -2, 0.45] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "microphone on a desk stand · 3 cm grille about 25 cm over the floor · pointing along +x";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
