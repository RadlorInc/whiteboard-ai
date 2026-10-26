// "cartridgefuse cx cy k amps=3|5|13 lab=0 lit=fuse|clips|base" — a PART (PARTS.md, batch 24): a BS 1362 cartridge
// fuse (25.4 mm × 6.35 mm) held in two brass spring clips on a fibre strip, lying along x, its origin the surface point
// under the strip's middle. The fuse: two nickel end caps crimped on a ceramic body in the rating's colour (3 A red,
// 5 A black, 13 A brown) with the rating and "BS 1362" printed on it. Each clip: a tab riveted to the strip, two spring
// arms that rise either side of the cap and curl over it, an end stop that keeps the fuse from sliding, and a solder
// tag out past the end (anchors a, b: where the wires go; in a plug, live comes in on one and leaves for the pin on
// the other). Reused from plug3.js (the fuse). Static. World units: 1 = 1 cm. anchors: a b fuse.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HL = 1.27, R = 0.3175, RB = 0.3, CAP = 0.55, ZB = 0.15, TAB = 0.1, ZA = ZB + TAB + 0.04 + R, CLIP = 0.55, SW = 0.45;
  const BODY = {
    3: ISO.tint("#f4b4a8", ["#b8473a", "#c85a4c", "#d66e60", "#e48a7e"], "#5a1a12"),
    5: ISO.tint("#7a7d82", ["#25272a", "#2e3034", "#383a3e", "#45474c"], "#0c0d0f"),
    13: ISO.tint("#d9b08c", ["#7a4a24", "#8a5a32", "#9a6a42", "#ad7e56"], "#3a200c"),
  };
  const FIBRE = ISO.tint("#efe2c4", ["#b89a68", "#c6aa7a", "#d4ba8e", "#e1caa4"], "#5e4a26");
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  // one clip at x = c (sg = −1 the −x end, +1 the +x end): back part (far arm) and front part (near arm), drawn either side of the fuse
  function clip(P, c, sg) {
    const B = (x, y, z, tone = "mid") => ISO.tinted(ISO.T.brass, ISO.wbox(P, x, y, z, tone));
    const x0 = c - CLIP / 2, x1 = c + CLIP / 2, xo = sg > 0 ? x1 : x0;
    const lip = (y) => ISO.tinted(ISO.T.brass, S(G.disc(x0 + 0.04, x1 - 0.04, 0.06, X([0, y, ZA + R * 0.62]), P), { tone: "hi" }));
    const back = B([x0, x1], [-SW, SW], [ZB, ZB + TAB]) + ISO.tinted(ISO.T.brass, S(K.cylinder(c, 0, 0.11, ZB + TAB, 0.05, P, 14), { tone: "hi" })) +
      B(sg > 0 ? [x1, x1 + 0.6] : [x0 - 0.6, x0], [-0.22, 0.22], [ZB, ZB + TAB]) + B([x0 + 0.06, x1 - 0.06], [-R - 0.1, -R - 0.04], [ZB + TAB, ZA + R * 0.55]) + lip(-R * 0.82) +
      (sg < 0 ? B([xo - 0.05, xo], [-0.2, 0.2], [ZB + TAB, ZA - 0.05]) : "");
    const front = B([x0 + 0.06, x1 - 0.06], [R + 0.04, R + 0.1], [ZB + TAB, ZA + R * 0.55]) + lip(R * 0.82) + (sg > 0 ? B([xo, xo + 0.05], [-0.2, 0.2], [ZB + TAB, ZA - 0.05]) : "");
    const hole = K.iso([sg > 0 ? x1 + 0.38 : x0 - 0.38, 0, ZB + TAB + 0.005], P);
    return { back: back + `<circle cx="${hole[0].toFixed(2)}" cy="${hole[1].toFixed(2)}" r="${(G.scaleOf(P) * 0.08).toFixed(2)}" fill="#6b5114"/>`, front };
  }
  function fuseSvg(P, amps) {
    const F = X([0, 0, ZA]), body = BODY[amps], out = [];
    const cap = (s0, s1) => ISO.tinted(ISO.T.steel, S(G.solidOf(s0 < 0 ? [[s0, R - 0.03], [s0 + 0.03, R], [s1, R]] : [[s0, R], [s1 - 0.03, R], [s1, R - 0.03]], F, P), { tone: "hi", inner: L(G.arcOf(F, s0 < 0 ? s1 - 0.08 : s0 + 0.08, R, P), { tone: "faint" }) }));
    out.push(cap(-HL, -HL + CAP));
    out.push(ISO.tinted(body, S(G.solidOf([[-HL + CAP - 0.02, RB], [HL - CAP + 0.02, RB]], F, P), { tone: "mid" })));
    // the print along the body, on the side that faces us
    const face = G.angleToward(F, G.viewOf(P)), up = G.tangentOf(F, face), at = (s) => G.pointOf(F, s, RB + 0.01, face);
    const ink = amps === 5 ? "#e8e8e8" : "#fff4e8";
    out.push(window.LAB.faceText(P, at(-0.32), [1, 0, 0], `${amps}A`, 0.26, ink, up), window.LAB.faceText(P, at(0.34), [1, 0, 0], "BS 1362", 0.13, ink, up));
    out.push(cap(HL - CAP, HL));
    return out.join("");
  }

  ISO.add({
    name: "cartridgefuse", title: "Cartridge fuse in clips (part)", compare: null,
    about: "A BS 1362 cartridge fuse (25 × 6 mm, ceramic body in its rating's colour, nickel end caps, rating printed) held in two brass spring clips on a fibre strip, lying along x; a thin wire inside melts if more than the rating flows. anchors: a b fuse",
    line: "cartridgefuse cx cy k amps=3|5|13 lab=0 lit=fuse|clips|base",
    demo: { line: "cartridgefuse 480 300 60 amps=13", script: [{ set: {}, hold: 1 }, { set: { lit: "fuse" }, hold: 1.2 }, { set: { lit: "clips" }, hold: 1.2 }, { set: { lit: "base" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const amps = BODY[o.amps] ? +o.amps : 13, c0 = -HL + CAP / 2, c1 = HL - CAP / 2, A = clip(P, c0, -1), B = clip(P, c1, 1);
      const plan = { x: -2.0, y: -0.6, w: 4.0, d: 1.2, r: 0.12 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>` +
        `<g data-name="base">${ISO.tinted(FIBRE, S(K.slabOf(plan, 0, ZB, P, 3, 0.02), { tone: "mid" }))}</g>` +
        `<g data-name="clips">${A.back}${B.back}</g><g data-name="fuse">${fuseSvg(P, amps)}</g><g data-name="clips">${A.front}${B.front}</g>` +
        (lab ? window.CIRC.word(P, [HL, 0, ZA + R + 0.3], `${amps} A fuse`) : "");
      g.anchors = { a: [c0 - CLIP / 2 - 0.38, 0, ZB + TAB], b: [c1 + CLIP / 2 + 0.38, 0, ZB + TAB], fuse: [0, 0, ZA + R] };
      let lit = o.lit || "";
      const light = window.CIRC.lighter(g);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `${amps} A cartridge fuse (BS 1362, 25 × 6 mm) · its thin wire melts if more than ${amps} A flows, breaking the live side`;
      light(lit);
      return g;
    },
  });
})();
