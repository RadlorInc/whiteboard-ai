// "michelson cx cy size d=0 lab=1" — a Michelson interferometer on its base plate.
// A red laser (633 nm) hits a half-silvered beam splitter at 45°; one beam goes to a fixed mirror, the other to a
// mirror on a micrometer slide; they come back together on a screen as circular fringes. Moving the mirror by d
// changes the path by 2d, so N = 2d/λ fringes pass the centre: 1 µm of travel moves about 3 fringes.
// set({ d }) turns the micrometer (µm); the rings grow out of (or shrink into) the centre as it turns.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const LAMBDA = 0.633, BEAM_Z = 26, BS = [0, 0], M1 = [0, -70], M2 = [70, 0], LASER_X = -110, SCREEN = [0, 70];
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -130, y: -90, w: 230, d: 180, r: 8 }, { h: 8 })];
    // A tapped grid of holes on the optical table.
    const holes = [];
    for (let x = -120; x <= 90; x += 15) for (let y = -80; y <= 80; y += 15) holes.push(K.iso([x, y, 0], P));
    out.push(D(holes, { size: 0.45, tone: "lo" }));
    // Laser on two posts.
    for (const x of [LASER_X - 8, LASER_X + 14]) out.push(S(K.cylinder(x, 0, 2.4, 0, BEAM_Z - 8, P, 16), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-24, 18, 8, xAx([LASER_X, 0, BEAM_Z]), P), { tone: "hi" })), S(G.disc(18, 22, 4, xAx([LASER_X, 0, BEAM_Z]), P), { tone: "mid" }));
    // Beam splitter: a glass plate at 45° in a holder on a post.
    out.push(S(K.cylinder(0, 0, 2.4, 0, BEAM_Z - 10, P, 16), { tone: "mid", crease: "none" }), S(K.cylinder(0, 0, 6, BEAM_Z - 12, 2, P, 24), { tone: "mid" }));
    const r = Math.SQRT1_2;
    out.push(ISO.tinted(ISO.T.glass, ISO.poly([[-8 * r, -8 * r, BEAM_Z - 10], [8 * r, 8 * r, BEAM_Z - 10], [8 * r + 1, 8 * r - 1, BEAM_Z - 10], [-8 * r + 1, -8 * r - 1, BEAM_Z - 10], [-8 * r, -8 * r, BEAM_Z + 10], [8 * r, 8 * r, BEAM_Z + 10], [8 * r + 1, 8 * r - 1, BEAM_Z + 10], [-8 * r + 1, -8 * r - 1, BEAM_Z + 10]], ISO.BOX_F, P, "hi")));
    // Fixed mirror M1 on its mount with two adjusting knobs.
    out.push(ISO.wbox(P, [M1[0] - 10, M1[0] + 10], [M1[1] - 6, M1[1] - 2], [0, BEAM_Z + 12], "mid"), ISO.tinted(ISO.T.glass, ISO.wbox(P, [M1[0] - 8, M1[0] + 8], [M1[1] - 2, M1[1]], [BEAM_Z - 8, BEAM_Z + 8], "hi")));
    for (const x of [M1[0] - 6, M1[0] + 6]) out.push(S(G.disc(-10, -6, 1.6, yAx([x, M1[1], BEAM_Z + 9]), P), { tone: "mid" }));
    // Micrometer slide under M2: rails, a carriage and the micrometer barrel with its thimble.
    out.push(ISO.wbox(P, [M2[0] - 6, M2[0] + 26], [-12, -8], [0, 4], "mid"), ISO.wbox(P, [M2[0] - 6, M2[0] + 26], [8, 12], [0, 4], "mid"));
    out.push(S(G.disc(26, 40, 3, xAx([M2[0], 0, 8]), P), { tone: "mid" }));
    // Screen on a post.
    out.push(S(K.cylinder(SCREEN[0], SCREEN[1], 2.4, 0, BEAM_Z - 14, P, 16), { tone: "mid", crease: "none" }), ISO.wbox(P, [SCREEN[0] - 18, SCREEN[0] + 18], [SCREEN[1], SCREEN[1] + 2], [BEAM_Z - 16, BEAM_Z + 16], "mid"));
    if (lab) out.push(ISO.word(K.iso([LASER_X, 0, BEAM_Z + 10], P), "laser 633 nm", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([0, 0, BEAM_Z + 12], P), "beam splitter", "#555", { size: 13, dy: -6, anchor: "start" }),
      ISO.word(K.iso([M1[0], M1[1], BEAM_Z + 14], P), "fixed mirror", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([SCREEN[0], SCREEN[1] + 2, BEAM_Z - 18], P), "screen", "#555", { size: 13, dy: 16 }));
    return out.join("");
  }
  // The moving mirror on its carriage, shifted by d (µm, exaggerated ×2000 so the travel shows).
  const moverSvg = (P, d) => { const x = M2[0] + d * 0.002 * 1000; return ISO.wbox(P, [x, x + 22], [-10, 10], [4, 8], "mid") + ISO.wbox(P, [x, x + 4], [-10, 10], [8, BEAM_Z + 12], "mid") + ISO.tinted(ISO.T.glass, ISO.wbox(P, [x - 2, x], [-8, 8], [BEAM_Z - 8, BEAM_Z + 8], "hi")); };
  const beams = (P) => { const p = (a, b) => K.pathOf([K.iso([a[0], a[1], BEAM_Z], P), K.iso([b[0], b[1], BEAM_Z], P)]); return `<path d="${p([LASER_X + 22, 0], BS)}${p(BS, M1)}${p(BS, M2)}${p(BS, SCREEN)}" stroke="#e5302a" stroke-width="1.4" opacity=".75"/>`; };
  // Circular fringes on the screen's face (y = SCREEN y + 2.05): bright rings where cos²(φ) is high.
  function fringesSvg(P, d) {
    const phase = (2 * d) / LAMBDA, out = [], F = yAx([SCREEN[0], SCREEN[1] + 2.06, BEAM_Z]);
    for (let k = 0; k < 9; k++) {
      const m = k + (phase % 1), r = 4.6 * Math.sqrt(m);
      if (r > 15 || r < 0.4) continue;
      out.push(`<path d="${G.circleOf(F, 0, r, P)}" fill="none" stroke="#e5302a" stroke-width="${(2.4 - k * 0.18).toFixed(2)}" opacity=".85"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "michelson", title: "Michelson interferometer", compare: "michelson 470 270 320",
    about: "Laser, beam splitter, a fixed and a moving mirror: circular fringes on the screen; each λ/2 of mirror travel moves one fringe.",
    line: "michelson cx cy size d=0 lab=1",
    demo: { line: "michelson 470 270 360", script: [{ set: { d: 0 }, hold: 1 }, { set: { d: 1 }, hold: "settle" }, { set: { d: 2.5 }, hold: "settle" }, { set: { d: 0 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, H = size * 1.25;
      const { P, g } = ISO.frame([[-130, -90, -12], [100, 90, -12], [-110, -70, BEAM_Z + 22], [90, 70, BEAM_Z + 22]], cx, cy, W, H, { azimuth: 40, elevation: 38 }, parent);
      const s = { d: ISO.num(o, "d", 0), dT: 0 }; s.dT = s.d;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g>${beams(P)}</g><g data-part="mover"></g><g data-part="fringes"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => { w.rebuild(el.mover, s.d.toFixed(3), () => `<g data-name="mirror">${moverSvg(P, s.d)}</g>`); w.rebuild(el.fringes, s.d.toFixed(3), () => fringesSvg(P, s.d)); };
      g.set = (p) => { if (p.d !== undefined) s.dT = ISO.clamp(+p.d, 0, 5); };
      g.update = (dt) => { s.d = ISO.follow(s.d, s.dT, dt, 0.9, ISO.still()); draw(); return s.d !== s.dT; };
      g.readout = () => `mirror moved ${s.d.toFixed(2)} µm · path changed ${(2 * s.d).toFixed(2)} µm · fringes passed N = 2d/λ = ${((2 * s.d) / LAMBDA).toFixed(1)} (λ = ${LAMBDA * 1000} nm)`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
