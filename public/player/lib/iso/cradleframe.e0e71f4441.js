// "cradleframe cx cy k half=all|far|near lab=0 lit=base|legs|rails|eyes" — a PART (PARTS.md, batch 5): the stand of a
// Newton's cradle (cradle.js) without its balls, 20 × 10 × 18 cm, its origin the surface point under the base's middle.
// A walnut base 20 × 10 × 1.6 cm with a printed brass plate on its front, two A-frames of chromed 6 mm steel rod (each
// end: two legs splaying out to turned sockets on the base, joined at the top by a cross bar with ball knuckles), and
// the two top rails along x, 5 cm apart (y = ±2.5) at 17.6 cm. Under each rail five small eyes, 2.5 cm apart, where
// the threads tie: anchors hang1…hang5 are the middle points between the two eyes, so a steelball hangs there with
// `steelball … d=2.5 line=13 span=5 at=<frame>.hang3` (13 cm from the eyes to the ball's centre, its bottom 1.5 cm over
// the base) and swings along x through the A-frames' openings. Balls hang between the rails: draw the frame twice
// round them, half=far before the balls, half=near after, so the near rail and legs come in front. Static.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const BASE = { x: -10, y: -5, w: 20, d: 10, r: 0.8 }, BH = 1.6, FX = 9.2, RY = 2.5, FOOT = 4.2, RZ = 17.6, RR = 0.3, PITCH = 2.5;
  const WALNUT = ISO.tint("#c9a27a", ["#7a5232", "#8a603c", "#9a6e48", "#aa7d56"], "#3e2614");
  const CHROME = ISO.tint("#eef0f3", ["#9aa0a8", "#b0b5bc", "#c6cad0", "#d9dce0"], "#3a3e44");
  const XS = [-2, -1, 0, 1, 2].map((i) => i * PITCH);

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, 0, BH, P)}"/>`];
    out.push(ISO.tinted(WALNUT, S(K.slabOf(BASE, 0, BH, P, 4, 0.25), { tone: "mid", inner: K.lineSvg(K.sideSeam(BASE, BH * 0.45, P, 4), { tone: "faint" }) })));
    // the brass plate on the front face, two pins and its words
    const y = BASE.y + BASE.d + 0.01;
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [-4, 4], [y, y + 0.06], [0.35, 1.25], "hi")));
    out.push(D([K.iso([-3.6, y + 0.07, 0.8], P), K.iso([3.6, y + 0.07, 0.8], P)], { size: 0.4 }));
    out.push(`<g transform="${ISO.faceMatrix(P, [0, y + 0.07, 0.95], 1)}"><text text-anchor="middle" style="font:700 0.42px 'Helvetica Neue',Arial,sans-serif" fill="#4a3a10">NEWTON'S CRADLE</text></g>`);
    return out.join("");
  }
  // one leg of an A-frame end at x = ex on side sy: a turned socket on the base and the rod up to the cross bar's end
  const legSvg = (P, ex, sy) => ISO.tinted(CHROME, S(K.cylinder(ex, sy * FOOT, 0.55, BH, 0.35, P, 20, 0.1), { tone: "mid" }) +
    S(K.cylinder(ex, sy * FOOT, 0.38, BH + 0.35, 0.5, P, 16), { tone: "mid", crease: "none" }) + B10.rod(P, [ex, sy * FOOT, BH + 0.6], [ex, sy * RY, RZ], RR));
  const barSvg = (P, ex) => ISO.tinted(CHROME, B10.rod(P, [ex, -RY, RZ], [ex, RY, RZ], RR) + S(G.sphereOf([ex, -RY, RZ], RR * 1.6, P), { tone: "mid" }) + S(G.sphereOf([ex, RY, RZ], RR * 1.6, P), { tone: "mid" }));
  const railSvg = (P, sy) => ISO.tinted(CHROME, B10.rod(P, [-FX, sy * RY, RZ], [FX, sy * RY, RZ], RR, "hi"));
  // the five thread eyes under a rail: a wire ring square to the rail, its top in the rail (drawn before the rail)
  const eyesSvg = (P, sy) => XS.map((x) => {
    const c = [x, sy * RY, RZ - RR - 0.1], q = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; q.push(K.iso([x + Math.cos(a) * 0.13, sy * RY, c[2] + Math.sin(a) * 0.13], P)); }
    return `<path d="${K.pathOf(q, true)}" fill="none" stroke="#3c3f45" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.05).toFixed(2)}"/>`;
  }).join("");

  ISO.add({
    name: "cradleframe", title: "Newton's cradle stand (part)", compare: null,
    about: "The stand of a Newton's cradle: walnut base, two chromed A-frames and two top rails 5 cm apart with five thread eyes each; hang steelball d=2.5 line=13 span=5 at its hang points. anchors: hang1 hang2 hang3 hang4 hang5 top",
    line: "cradleframe cx cy k half=all|far|near lab=0 lit=base|legs|rails|eyes",
    demo: { line: "cradleframe 480 420 20", script: [{ set: {}, hold: 1 }, { set: { lit: "rails" }, hold: 1.2 }, { set: { lit: "legs" }, hold: 1.2 }, { set: { lit: "eyes" }, hold: 1.2 }, { set: { lit: "base" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", half = ["far", "near"].includes(o.half) ? o.half : "all";
      const far = half !== "near", near = half !== "far";
      // painted back to front: base, the far end's legs, far rail and eyes, the cross bars, the near rail and eyes, the near legs
      g.innerHTML = (far ? `<g data-name="base">${baseSvg(P)}</g><g data-name="legs">${legSvg(P, -FX, -1)}${legSvg(P, FX, -1)}</g>` +
        `<g data-name="eyes">${eyesSvg(P, -1)}</g><g data-name="rails">${railSvg(P, -1)}${barSvg(P, -FX)}</g>` : "") +
        (near ? `<g data-name="legs">${legSvg(P, -FX, 1)}</g><g data-name="eyes">${eyesSvg(P, 1)}</g><g data-name="rails">${barSvg(P, FX)}${railSvg(P, 1)}</g><g data-name="legs">${legSvg(P, FX, 1)}</g>` : "") +
        (lab ? CIRC.word(P, [FX, RY, RZ + 1.2], "Newton's cradle stand") : "");
      const z = RZ - RR - 0.23;
      g.anchors = { ...Object.fromEntries(XS.map((x, i) => [`hang${i + 1}`, [x, 0, +z.toFixed(3)]])), top: [0, 0, BH] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B10.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "Newton's cradle stand · rails 5 cm apart at 17.6 cm · five hang points 2.5 cm apart (one ball's width), so the balls just touch";
      B10.light(w, g, lit);
      return g;
    },
  });
})();
