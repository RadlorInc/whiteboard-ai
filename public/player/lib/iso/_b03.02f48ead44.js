// Batch b03 helpers (PARTS.md, batch 5): the optical bench's rail section and the rider that clamps it, shared by
// opticalbench, benchrider and whitescreen (rider=1). World units: 1 = 1 cm, origin the rail's top under the rider.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const B03 = (window.B03 = {});
  // the rail: 4 × 4 cm aluminium section (y ±2), its top 7 cm over the bench on the bench's feet; the scale strip on
  // its near (+y) face, from 1.2 to 3.4 cm under the top
  B03.RAIL = { hw: 2, top: 7, h: 4, strip: [-3.3, -1.1] };
  B03.ALU = ISO.tint("#e4e7ea", ["#9aa1a8", "#adb3b9", "#bfc4c9", "#d0d4d8"], "#3f464d");
  B03.BLACK = ISO.T.plastic;
  B03.light = (w, g, lit) => window.LAB.light(w, g, lit);
  B03.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  B03.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  B03.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // a knurled knob on an axis frame F from s0 to s1 (radius r): the knob, its ribs ending on its rims, a chamfered face
  B03.knob = (P, F, s0, s1, r, tint = ISO.T.plastic) => ISO.tinted(tint, S(G.lathe([[s0, 0], [s0, r * 0.92], [s0 + 0.12 * (s1 - s0), r], [s1 - 0.15 * (s1 - s0), r], [s1, r * 0.8], [s1, 0]], F, P), { tone: "mid", inner: L(G.ribsOf(F, s0 + 0.12 * (s1 - s0), s1 - 0.15 * (s1 - s0), r, 18, P, { seams: true }), { tone: "lo" }) }));
  // The rider (carriage) on the rail at x = 0: a saddle over the rail's top, a near cheek down its +y side with the
  // clamp screw and an index pointer over the scale, a post holder with its thumbscrew, and the post up to z = top.
  // (The far cheek is hidden behind the rail, so it is not drawn.) Returns the named pieces.
  B03.rider = (P, top = 10) => {
    const hw = B03.RAIL.hw, carriage = [], screw = [], post = [];
    carriage.push(`<path class="iso-halo" d="${K.haloOf({ x: -2.7, y: -2.9, w: 5.4, d: 5.8, r: 0.6 }, -1.8, 3.2, P)}"/>`);
    // the near cheek and its index pointer: a thin plate hanging over the scale strip, a red line at x = 0
    carriage.push(ISO.tinted(B03.BLACK, ISO.wbox(P, [-2.5, 2.5], [hw, hw + 0.6], [-1.0, 0], "mid")));
    carriage.push(ISO.tinted(B03.ALU, ISO.wbox(P, [-0.5, 0.5], [hw + 0.6, hw + 0.7], [-1.7, -0.2], "hi")));
    carriage.push(`<path d="${K.segment([0, hw + 0.71, -0.2], [0, hw + 0.71, -1.7], P)}" stroke="#d0392b" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.08).toFixed(2)}"/>`);
    // the saddle, its two cap screws
    carriage.push(ISO.tinted(B03.BLACK, ISO.wbox(P, [-2.5, 2.5], [-2.7, hw + 0.7], [0, 1.4], "mid")));
    carriage.push(D([[-1.8, -1.9, 1.41], [1.8, -1.9, 1.41], [-1.8, 1.9, 1.41], [1.8, 1.9, 1.41]].map((p) => K.iso(p, P)), { size: 0.45 }));
    // the clamp screw through the near cheek: threaded stub and a knurled knob (along +y, at z −0.5)
    const Fs = B03.Y([0, hw + 0.6, -0.5]);
    screw.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.4, 0.22, Fs, P), { tone: "mid" })), B03.knob(P, Fs, 0.4, 1.2, 0.7));
    // the post holder: a collar on the saddle, the tube, its thumbscrew (+y); the post rises out of it to `top`
    const ph = Math.min(4.4, top - 0.8);
    post.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.2, 1.4, 0.4, P, 24), { tone: "mid" }) + S(K.cylinder(0, 0, 0.9, 1.8, ph - 1.8, P, 24, 0.12), { tone: "mid", crease: "none" })));
    const Ft = B03.Y([0, 0, ph - 0.8]);
    post.push(ISO.tinted(ISO.T.steel, S(G.disc(0.85, 1.25, 0.2, Ft, P), { tone: "mid" })), B03.knob(P, Ft, 1.25, 1.75, 0.45));
    post.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, ph, top - ph, P, 20, 0.15), { tone: "hi", crease: "none" })));
    return { carriage: carriage.join(""), screw: screw.join(""), post: post.join("") };
  };
  let clipN = 0;
  B03.clipId = () => `b03c${++clipN}`;
})();
