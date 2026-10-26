// "eyemodel cx cy k lab=0 lit=eye|post|base" — a PART (PARTS.md, batch 5): the model eye of periscope.js, a 3 cm
// eyeball on a post, standing on the bench, its origin the bench point under the post. A weighted base with a rubber
// ring, a 6 mm steel post, a collar with a set screw, a cup that holds the ball, and the ball itself: white with a
// blue iris, a black pupil and a clear cornea, looking along +x (toward the light; on the bench light travels −x).
// The pupil's centre is 10.5 cm up, the ball's top 12 cm. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 1.5, EZ = 10.5, PZ = 8.6;
  const SCLERA = ISO.tint("#fbfaf6", ["#d9d6cd", "#e3e0d8", "#ecebe4", "#f5f3ee"], "#6c675c");
  const IRIS = ISO.tint("#6f9fd2", ["#2e5f96", "#3b6ea6", "#4a7db4", "#5a8dc2"], "#1b3a63");
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function eyeSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -2.4, y: -2.4, w: 4.8, d: 4.8, r: 2.4 }, 0, 0.6, P)}"/>`];
    // base: a cast disc on a rubber ring, its top bevelled
    out.push(`<g data-name="base">${ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 2.3, 0, 0.15, P, 32), { tone: "lo" }))}` +
      ISO.tinted(ISO.T.paint, S(K.cylinder(0, 0, 2.2, 0.15, 0.55, P, 32, 0.12), { tone: "mid", inner: K.lineSvg(K.sideArc(0, 0, 2.2, 0.35, P, 32), { tone: "faint" }) })) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.55, 0.7, 0.35, P, 20, 0.05), { tone: "mid" })) + `</g>`);
    // post, collar and its set screw toward the room (+y)
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.3, 1.05, PZ - 1.05, P, 16), { tone: "hi", crease: "none" }) +
      S(K.cylinder(0, 0, 0.5, PZ - 0.9, 0.7, P, 20, 0.06), { tone: "mid" }) + S(G.disc(0.5, 0.75, 0.13, G.frameAlong([0, 0, PZ - 0.55], [0, 1, 0]), P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.plastic, S(G.disc(0.75, 1.0, 0.3, G.frameAlong([0, 0, PZ - 0.55], [0, 1, 0]), P), { tone: "hi", inner: K.lineSvg(G.ribsOf(G.frameAlong([0, 0, PZ - 0.55], [0, 1, 0]), 0.75, 1.0, 0.3, 10, P, { seams: true }), { tone: "lo" }) })) + `</g>`);
    // the cup: a short flared ring the ball rests in (its back half shows under the ball)
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0.45], [0.3, 0.55, 1], [0.9, 0.95, 1], [1.05, 1.05]], G.frameOf([0, 0, PZ - 0.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 28 }), { tone: "mid" }))}</g>`);
    // the ball, the optic-nerve stub at its back (−x) and, on +x, the iris, the pupil and the cornea with a highlight
    const F = X([0, 0, EZ]);
    out.push(`<g data-name="eye">${ISO.tinted(SCLERA, S(G.sphereOf([0, 0, EZ], R, P), { tone: "hi" }))}`);
    const veins = [[0.5, 0.9, 1.2], [-0.4, 1.0, -0.9], [0.9, 0.3, -1.05]].map(([b, c, d]) => K.pathOf([[0.35, b, c], [0.9, b * 0.8, c * 0.75], [1.15, b * 0.55, c * 0.55]].map(([x, y, z]) => { const n = Math.hypot(x, y, z); return K.iso([(x / n) * (R + 0.01), (y / n) * (R + 0.01), EZ + (z / n) * (R + 0.01)], P); })));
    out.push(`<path d="${veins.join("")}" fill="none" stroke="#d07a74" stroke-width="${Math.max(0.4, G.scaleOf(P) * 0.025).toFixed(2)}" opacity=".7" data-free=""/>`);
    const iz = Math.sqrt(R * R - 0.72 * 0.72);
    out.push(ISO.tinted(IRIS, S(G.disc(iz - 0.03, iz + 0.02, 0.72, F, P), { tone: "hi" })));
    const rays = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; rays.push(K.pathOf([G.pointOf(F, iz + 0.03, 0.34, a), G.pointOf(F, iz + 0.03, 0.66, a)].map((p) => K.iso(p, P)))); }
    out.push(`<path d="${rays.join("")}" stroke="#1b3a63" stroke-width="${Math.max(0.3, G.scaleOf(P) * 0.02).toFixed(2)}" opacity=".55" data-free=""/>`);
    out.push(`<path d="${G.circleOf(G.frameOf([iz + 0.04, 0, EZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 0.3, P)}" fill="#14161a"/>`);
    out.push(`<g style="${ISO.T.glass}" opacity=".45">${S(G.lathe([[0, 0], [0.12, 0.45, 1], [0.2, 0.7, 1], [0.22, 0.78]], X([iz - 0.05, 0, EZ]), P, { steps: 28 }), { tone: "hi" })}</g>`);
    const hl = K.iso(G.pointOf(F, iz + 0.2, 0.36, 2.2), P);
    out.push(`<circle cx="${hl[0].toFixed(1)}" cy="${hl[1].toFixed(1)}" r="${Math.max(0.6, G.scaleOf(P) * 0.08).toFixed(2)}" fill="#ffffff" opacity=".9"/>`);
    out.push(`</g>`);
    return out.join("");
  }

  ISO.add({
    name: "eyemodel", title: "Model eye on a post (part)", compare: null,
    about: "A 3 cm model eyeball (blue iris, pupil, cornea) in a cup on a post on a weighted base, looking along +x, pupil 10.5 cm up; the eye at a periscope's eyepiece or in front of a lens. anchors: eye top",
    line: "eyemodel cx cy k lab=0 lit=eye|post|base",
    demo: { line: "eyemodel 480 420 30", script: [{ set: {}, hold: 1 }, { set: { lit: "eye" }, hold: 1.3 }, { set: { lit: "post" }, hold: 1.3 }, { set: { lit: "base" }, hold: 1.3 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = eyeSvg(P) + (lab ? window.LAB.word(P, lab, [0, 0, EZ + R + 1.2], "eye", "#556") : "");
      g.anchors = { eye: [R, 0, EZ], top: [0, 0, EZ + R] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "model eye · 3 cm ball on a post · pupil 10.5 cm up, looking along +x";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
