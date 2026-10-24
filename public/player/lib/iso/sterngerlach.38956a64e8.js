// "sterngerlach cx cy width field=1 lab=1" — the Stern–Gerlach experiment in its vacuum tube.
// Silver atoms leave an oven, pass two slits into a thin beam, then fly between a sharp and a grooved magnet pole,
// where the field gets stronger toward the sharp pole. Each atom's magnet (its spin) is pushed up or down, never in
// between, so with the field on the deposit on the glass plate splits into two lines; with it off it is one line.
// set({ field: 1|0 }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const AXZ = 40, OVEN_X = -120, MAG = { x0: -30, x1: 50 }, PLATE_X = 110, SPLIT = 9;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -150, y: -46, w: 290, d: 92, r: 6 }, { h: 6 })];
    for (const x of [-100, 0, 100]) out.push(ISO.wbox(P, [x - 5, x + 5], [-12, 12], [0, AXZ - 14], "mid"));
    // Oven: a small furnace with a nozzle, and two slit plates.
    out.push(ISO.tinted(ISO.T.copper, ISO.wbox(P, [OVEN_X - 14, OVEN_X + 6], [-10, 10], [AXZ - 12, AXZ + 10], "hi")), S(G.disc(6, 12, 2, xAx([OVEN_X, 0, AXZ]), P), { tone: "mid" }));
    for (const x of [-80, -55]) out.push(ISO.wbox(P, [x - 1, x + 1], [-10, 10], [AXZ - 10, AXZ - 1], "mid"), ISO.wbox(P, [x - 1, x + 1], [-10, 10], [AXZ + 1, AXZ + 10], "mid"));
    // The magnet: a grooved pole below and a sharp pole above, with its yoke.
    out.push(ISO.tinted(ISO.T.blue, ISO.prismX(P, [[-16, AXZ - 22], [16, AXZ - 22], [16, AXZ - 6], [5, AXZ - 6], [3, AXZ - 9], [-3, AXZ - 9], [-5, AXZ - 6], [-16, AXZ - 6]], MAG.x0, MAG.x1, ["#5d80b8", "#bacde8"], "#91afd8", "#1f4f8f")));
    out.push(ISO.wbox(P, [MAG.x0, MAG.x1], [-26, -16], [AXZ - 22, AXZ + 26], "mid"));
    // The glass plate the atoms land on.
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [PLATE_X, PLATE_X + 2], [-14, 14], [AXZ - 18, AXZ + 18], "hi")));
    if (lab) out.push(ISO.word(K.iso([OVEN_X, 0, AXZ + 12], P), "silver oven", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([(MAG.x0 + MAG.x1) / 2, 16, AXZ - 22], P), "magnet poles", "#1f4f8f", { size: 13, dy: 16 }), ISO.word(K.iso([PLATE_X, 0, AXZ + 20], P), "glass plate", "#555", { size: 13, dy: -4 }));
    return out.join("");
  }
  const topPole = (P) => ISO.tinted(ISO.T.red, ISO.prismX(P, [[-16, AXZ + 22], [-16, AXZ + 6], [-2, AXZ + 6], [0, AXZ + 3], [2, AXZ + 6], [16, AXZ + 6], [16, AXZ + 22]], MAG.x0, MAG.x1, ["#c05a4e", "#f4b8ae"], "#e88e82", "#8a1d16"));
  // The beam (dashes) and the deposit on the plate: one line, or two lines `split` apart.
  function beamSvg(P, split) {
    const pts = (dz) => [[OVEN_X + 12, 0, AXZ], [MAG.x0, 0, AXZ], [MAG.x1, 0, AXZ + dz * 0.4], [PLATE_X, 0, AXZ + dz]].map((p) => K.iso(p, P));
    const out = [`<path d="${K.pathOf(pts(split))}${split > 0.3 ? K.pathOf(pts(-split)) : ""}" fill="none" stroke="#7d8288" stroke-width="1" stroke-dasharray="2 3"/>`];
    for (const dz of split > 0.3 ? [split, -split] : [0]) out.push(`<path d="${K.pathOf([[PLATE_X - 0.05, -9, AXZ + dz], [PLATE_X - 0.05, 9, AXZ + dz]].map((p) => K.iso(p, P)))}" stroke="#55575c" stroke-width="2.4" stroke-linecap="round"/>`);
    return out.join("");
  }

  ISO.add({
    name: "sterngerlach", title: "Stern–Gerlach experiment", compare: "sterngerlach 470 280 480",
    about: "Silver atoms through an uneven magnetic field land in two lines, not a smear: spin comes in two values only.",
    line: "sterngerlach cx cy width field=1 lab=1",
    demo: { line: "sterngerlach 470 280 480 field=0", script: [{ set: {}, hold: 1.4 }, { set: { field: 1 }, hold: "settle" }, { set: { field: 0 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 0.7;
      const { P, g } = ISO.frame([[-150, -46, -10], [140, 46, -10], [-130, 0, AXZ + 30], [130, 0, AXZ + 30]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const s = { f: o.field === "0" ? 0 : 1, fT: 0 }; s.fT = s.f;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="beam"></g><g>${topPole(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => { w.rebuild(el.beam, s.f.toFixed(3), () => beamSvg(P, SPLIT * s.f)); if (lab) w.rebuild(el.words, s.f > 0.5, () => ISO.word(K.iso([PLATE_X + 2, 14, AXZ - 20], P), s.f > 0.5 ? "two lines: spin up, spin down" : "one line", "#55575c", { size: 13, anchor: "start", dy: 14 })); };
      g.set = (p) => { if (p.field !== undefined) s.fT = +p.field ? 1 : 0; };
      g.update = (dt) => { s.f = ISO.follow(s.f, s.fT, dt, 0.4, ISO.still()); draw(); return s.f !== s.fT; };
      g.readout = () => (s.fT ? "field on · the beam splits in two: each atom's spin points up or down, nothing in between" : "field off · one line on the plate");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
