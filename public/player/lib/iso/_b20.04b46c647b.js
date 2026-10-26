// Batch b20 helpers (PARTS.md, batch 5): shared by the b20 parts (the Michelson optics, the plane-mirror sheet, the
// knife edge, the curved magnet). Not a recipe: it only defines window.B20. World units: 1 = 1 cm.
(() => {
  const B20 = (window.B20 = {});
  const K = () => window.K, G = () => window.G;
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B20.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the optical axis height over a part's foot (library rule: benchrider post 10 + lensholder 3.5)
  B20.BEAM = 13.5;
  // a horizontal frame: a along the unit vector n (in x–y), b across it (z × n), z up; at(a, b, z) → world
  B20.frame = (n, o = [0, 0, 0]) => { const s = [-n[1], n[0]]; return (a, b, z) => [o[0] + n[0] * a + s[0] * b, o[1] + n[1] * a + s[1] * b, o[2] + z]; };
  B20.aimOf = (v) => ({ "+x": [1, 0], "-x": [-1, 0], "+y": [0, 1], "-y": [0, -1] }[v] || [1, 0]);
  // painter's order for a handful of convex solids that turn with the part: [world centre, svg] sorted far → near
  B20.sorted = (items, P) => items.map(([c, svg]) => [K().depthOf(c, P), svg]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
  // a knurled knob (or any turned piece) along axis dir from o: s0..s1, radius r
  B20.knob = (P, o, dir, s0, s1, r, n = 14, tint = ISO.T.plastic) => {
    const F = G().frameAlong(o, dir);
    return ISO.tinted(tint, K().solidSvg(G().disc(s0, s1, r, F, P), { tone: "hi", inner: K().lineSvg(G().ribsOf(F, s0, s1, r, n, P, { seams: true }), { tone: "lo" }) }));
  };
  // a post stand on a breadboard: a slotted clamping fork with its cap screw, a post holder with a thumbscrew toward
  // the camera (+y), and the 12 mm steel post up to ztop. Origin = the table point under the post. Returns svg pieces.
  B20.stand = (P, ztop, { fork = [1, 0] } = {}) => {
    const k = K(), g = G(), S = (p, s) => k.solidSvg(p, s), at = B20.frame(fork);
    const slot = [];
    for (let i = 0; i <= 12; i++) { const t = (i / 12) * Math.PI; slot.push(at(-1.5 + Math.sin(t) * 0.35, Math.cos(t) * 0.35, 0.605)); }
    for (let i = 0; i <= 12; i++) { const t = (i / 12) * Math.PI; slot.push(at(-3.4 - Math.sin(t) * 0.35, -Math.cos(t) * 0.35, 0.605)); }
    const c = at(-2.6, 0, 0), hex = Array.from({ length: 6 }, (_, i) => { const t = (i / 6) * Math.PI * 2; return k.iso([c[0] + Math.cos(t) * 0.2, c[1] + Math.sin(t) * 0.2, 0.86], P); });
    const base = ISO.tinted(ISO.T.steel, ISO.box(at, P, [-4.2, 1.2], [-1.2, 1.2], [0, 0.6], "mid")) +
      `<path d="${k.pathOf(slot.map((p) => k.iso(p, P)), true)}" fill="#3a3d42"/>` +
      ISO.tinted(ISO.T.steel, S(k.cylinder(c[0], c[1], 0.5, 0.6, 0.25, P, 16, 0.05), { tone: "hi" })) + `<path d="${k.pathOf(hex, true)}" fill="#2a2c30"/>`;
    const holder = ISO.tinted(ISO.T.paint, S(k.cylinder(0, 0, 0.75, 0.6, 5.4, P, 24, 0.08), { tone: "mid" })) +
      ISO.tinted(ISO.T.steel, S(k.cylinder(0, 0, 0.82, 5.6, 0.4, P, 24, 0.06), { tone: "hi" }));
    const thumb = ISO.tinted(ISO.T.steel, S(g.disc(0.7, 1.1, 0.15, g.frameAlong([0, 0, 5.0], [0, 1, 0]), P), { tone: "mid" })) + B20.knob(P, [0, 0, 5.0], [0, 1, 0], 1.1, 1.6, 0.45, 12);
    const post = ISO.tinted(ISO.T.steel, S(k.cylinder(0, 0, 0.6, 6, ztop - 6, P, 24), { tone: "hi", crease: "none" }));
    return { base, holder, thumb, post, all: base + holder + thumb + post };
  };
})();
