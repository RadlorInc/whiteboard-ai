// Batch 24 helpers (window.B24): the bench mount shared by polarfilter and luxmeter. mount=post: a steel sleeve that
// slides over a benchrider's post (origin = the post's top) with a thumbscrew toward +y; mount=stand: the same sleeve
// on its own 10 cm post in a cast round foot (origin = the bench under the foot). Either way the device sits on the
// sleeve's top at z0 + 0.6 and its optical centre is at z0 + 3.5 (13.5 cm over the foot, the bench's beam height).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B24 = (window.B24 = {});
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  B24.Z0 = (stand) => (stand ? 10 : 0);
  B24.mount = (P, stand) => {
    const z0 = B24.Z0(stand), out = [];
    if (stand) {
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -4, y: -4, w: 8, d: 8, r: 4 }, 0, 0.02, P)}"/>`);
      out.push(`<g data-name="post">${ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, 4, 0, 1.1, P, 48, 0.25), { tone: "mid", inner: L(K.sideArc(0, 0, 4, 0.35, P, 40), { tone: "faint" }) }))}` +
        ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, 1.1, 1.1, 0.8, P, 24, 0.15), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, 1.9, z0 - 1.4 - 1.9, P, 18), { tone: "hi", crease: "none" })) + `</g>`);
    } else out.push(`<path class="iso-halo" d="${K.haloOf({ x: -0.9, y: -0.9, w: 1.8, d: 1.8, r: 0.9 }, -1.4, 0.02, P)}"/>`);
    // the sleeve over the post's top and its thumbscrew
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.85, z0 - 1.4, 2, P, 24, 0.1), { tone: "mid" }) + S(G.disc(0.85, 1.25, 0.18, Y([0, 0, z0 - 0.6]), P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.plastic, S(G.disc(1.25, 1.65, 0.45, Y([0, 0, z0 - 0.6]), P), { tone: "hi", inner: L(G.ribsOf(Y([0, 0, z0 - 0.6]), 1.25, 1.65, 0.45, 10, P, { seams: true }), { tone: "lo" }) })) + `</g>`);
    return { svg: out.join(""), z0 };
  };
})();
