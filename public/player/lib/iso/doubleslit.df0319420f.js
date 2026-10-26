// "doubleslit cx cy width d=0.25 L=1.5 color=red lab=1" — Young's double slit on an optical bench.
// A laser (red 650 nm or green 532 nm) shines on a slide with two slits d mm apart; on a screen L m away the light
// makes bright and dark fringes spaced λL/d (red, 0.25 mm, 1.5 m: 3.9 mm). Closer slits spread them out; green light
// packs them closer. Each fringe's brightness is the two-slit pattern under the one-slit envelope.
// set({ d, color }) swaps the slide or the laser.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BENCH = { x0: -150, x1: 150 }, BEAM_Z = 44, SLIDE_X = -60, SCREEN_X = 130, SLIT_W = 0.05;   // slit width mm
  const COLORS = { red: { nm: 650, c: "#e5302a" }, green: { nm: 532, c: "#22b04b" } };
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function benchSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -160, y: -30, w: 320, d: 60, r: 6 }, { h: 6, feet: 4 })];
    // The optical bench: a long triangular-section rail on two feet, with a scale along its side.
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [BENCH.x0, BENCH.x1], [-6, 6], [10, 18], "hi")));
    for (const x of [BENCH.x0 + 20, BENCH.x1 - 20]) out.push(ISO.wbox(P, [x - 6, x + 6], [-12, 12], [0, 10], "mid"));
    const minor = [], major = [];
    for (let x = BENCH.x0 + 6; x <= BENCH.x1 - 6; x += 5) ((x - BENCH.x0 - 6) % 25 ? minor : major).push(K.segment([x, 6.05, 18], [x, 6.05, 18 - ((x - BENCH.x0 - 6) % 25 ? 1.5 : 3)], P));
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    // Riders: a carriage on the rail with a post, at x.
    const rider = (x) => ISO.wbox(P, [x - 8, x + 8], [-9, 9], [18, 24], "mid") + S(K.cylinder(x, 0, 2, 24, BEAM_Z - 32, P, 16), { tone: "mid", crease: "none" }) + D([K.iso([x - 5, 9.05, 21], P)], { size: 0.6 });
    out.push(rider(-130), rider(SLIDE_X), rider(SCREEN_X));
    // The laser: a body on a V-mount, aperture at the front, key switch on the back.
    out.push(S(K.cylinder(-130, 0, 7, BEAM_Z - 14, 4, P, 24), { tone: "mid" }));
    const F = xAx([-150, 0, BEAM_Z]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 34, 8, F, P), { tone: "hi" })), S(G.disc(34, 38, 4, F, P), { tone: "mid" }), L(G.circleOf(F, 38, 1.6, P), { tone: "lo" }));
    // The slide holder: a frame with the slide in it (two slits as dark lines), and the screen on its stand.
    out.push(ISO.wbox(P, [SLIDE_X - 2, SLIDE_X + 2], [-14, 14], [BEAM_Z - 12, BEAM_Z + 12], "mid"));
    out.push(ISO.wbox(P, [SCREEN_X - 2, SCREEN_X + 2], [-40, 40], [BEAM_Z - 22, BEAM_Z + 22], "mid"));
    if (lab) out.push(ISO.word(K.iso([-130, 0, BEAM_Z + 10], P), "laser", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([SLIDE_X, 0, BEAM_Z + 14], P), "two slits", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([SCREEN_X, 0, BEAM_Z + 24], P), "screen", "#555", { size: 13, dy: -4 }));
    return out.join("");
  }
  // The fringes on the screen face (x = SCREEN_X − 2), as vertical bands across y: world y = mm on the screen × MMW.
  const MMW = 1.6;
  function fringesSvg(P, d, Lm, color) {
    const lam = COLORS[color].nm * 1e-6, out = [], x = SCREEN_X - 2.05;   // λ in mm
    for (let y = -38; y < 38; y += 0.8) {
      const mm = y / MMW, th = mm / (Lm * 1000);
      const b = Math.PI * SLIT_W * th / lam, env = b === 0 ? 1 : (Math.sin(b) / b) ** 2, I = env * Math.cos((Math.PI * d * th) / lam) ** 2;
      if (I < 0.03) continue;
      out.push(`<path d="${K.pathOf([[x, y, BEAM_Z - 16], [x, y + 0.8, BEAM_Z - 16], [x, y + 0.8, BEAM_Z + 16], [x, y, BEAM_Z + 16]].map((p) => K.iso(p, P)), true)}" fill="${COLORS[color].c}" fill-opacity="${(I * 0.95).toFixed(2)}"/>`);
    }
    return out.join("");
  }
  const beamSvg = (P, color) => `<path d="${K.pathOf([K.iso([-112, 0, BEAM_Z], P), K.iso([SLIDE_X - 2, 0, BEAM_Z], P)])}" stroke="${COLORS[color].c}" stroke-width="1.6" opacity=".9"/>` +
    `<path d="${K.pathOf([K.iso([SLIDE_X + 2, 0, BEAM_Z], P), K.iso([SCREEN_X - 2, -30, BEAM_Z], P)])}${K.pathOf([K.iso([SLIDE_X + 2, 0, BEAM_Z], P), K.iso([SCREEN_X - 2, 30, BEAM_Z], P)])}" stroke="${COLORS[color].c}" stroke-width="0.8" opacity=".35"/>`;

  ISO.add({
    name: "doubleslit", title: "Double slit (Young)", compare: "doubleslit 470 270 480",
    about: "Laser, double slit and screen on an optical bench: fringes spaced λL/d; closer slits or redder light spread them.",
    line: "doubleslit cx cy width d=0.25 L=1.5 color=red|green lab=1",
    demo: { line: "doubleslit 470 270 480", script: [{ set: {}, hold: 1.5 }, { set: { d: 0.15 }, hold: 2.4 }, { set: { color: "green" }, hold: 2.4 }, { set: { d: 0.25, color: "red" }, hold: 2 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.2, H = size * 0.7;
      const { P, g } = ISO.frame([[-160, -40, -10], [160, 40, -10], [-160, -40, BEAM_Z + 30], [160, 40, BEAM_Z + 30]], cx, cy, W, H, { azimuth: 62, elevation: 20 }, parent);
      const m = { d: ISO.clamp(ISO.num(o, "d", 0.25), 0.1, 0.5), L: ISO.clamp(ISO.num(o, "L", 1.5), 0.5, 3), color: o.color === "green" ? "green" : "red" };
      g.innerHTML = `<g>${benchSvg(P, lab)}</g><g data-part="beam"></g><g data-part="fringes"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.beam, m.color, () => beamSvg(P, m.color));
        w.rebuild(el.fringes, `${m.d} ${m.L} ${m.color}`, () => fringesSvg(P, m.d, m.L, m.color));
        if (lab) w.rebuild(el.words, `${m.d} ${m.color}`, () => ISO.word(K.iso([SLIDE_X, 0, BEAM_Z - 14], P), `d = ${m.d} mm`, "#555", { size: 13, dy: 16 }));
      };
      g.set = (p) => { if (p.d !== undefined) m.d = ISO.clamp(+p.d, 0.1, 0.5); if (p.color) m.color = p.color === "green" ? "green" : "red"; if (p.L !== undefined) m.L = +p.L; };
      g.update = () => { draw(); return false; };
      g.readout = () => { const lam = COLORS[m.color].nm; return `${m.color} light ${lam} nm · slits ${m.d} mm apart · screen ${m.L} m away · fringe spacing λL/d = ${((lam * 1e-6 * m.L * 1000) / m.d).toFixed(1)} mm`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
