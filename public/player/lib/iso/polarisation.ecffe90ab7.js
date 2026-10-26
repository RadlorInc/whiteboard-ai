// "polarisation cx cy width angle=0 lab=1" — Malus's law: a lamp, a polariser, an analyser and a light meter.
// The first filter passes light vibrating one way only (half the lamp's light). The second, turned θ from it, passes
// cos²θ of what reaches it: all at 0°, half at 45°, none at 90°. Each filter sits in a rotating mount with a degree
// scale; the light meter reads the lux that gets through. set({ angle }) turns the analyser.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BEAM_Z = 42, LAMP_X = -120, POL_X = -40, ANA_X = 30, METER_X = 110, LUX0 = 800;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -150, y: -34, w: 300, d: 68, r: 6 }, { h: 6, feet: 4 })];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-140, 140], [-6, 6], [10, 18], "hi")));
    for (const x of [-120, 120]) out.push(ISO.wbox(P, [x - 6, x + 6], [-12, 12], [0, 10], "mid"));
    const rider = (x) => ISO.wbox(P, [x - 8, x + 8], [-9, 9], [18, 24], "mid") + S(K.cylinder(x, 0, 2, 24, BEAM_Z - 38, P, 16), { tone: "mid", crease: "none" });
    out.push(rider(LAMP_X), rider(POL_X), rider(ANA_X), rider(METER_X));
    // Lamp housing with vents and a lens, aimed along the bench.
    const F = xAx([LAMP_X - 14, 0, BEAM_Z]);
    out.push(ISO.wbox(P, [LAMP_X - 14, LAMP_X + 6], [-10, 10], [BEAM_Z - 14, BEAM_Z + 12], "mid"), S(G.disc(20, 24, 7, F, P), { tone: "mid" }), ISO.tinted(ISO.T.glass, S(G.disc(24, 25, 6, F, P), { tone: "hi" })));
    // Vents: closed slots, so they have no loose ends.
    for (let i = 0; i < 4; i++) { const x = LAMP_X - 10 + i * 4; out.push(L(K.pathOf([[x - 0.7, 10.05, BEAM_Z + 2], [x + 0.7, 10.05, BEAM_Z + 2], [x + 0.7, 10.05, BEAM_Z + 9], [x - 0.7, 10.05, BEAM_Z + 9]].map((p) => K.iso(p, P)), true), { tone: "lo" })); }
    // Light meter: a sensor disc facing the lamp on a box with a display.
    out.push(ISO.wbox(P, [METER_X - 4, METER_X + 14], [-12, 12], [BEAM_Z - 14, BEAM_Z + 14], "mid"), ISO.tinted(ISO.T.plastic, S(G.disc(-3, 0, 8, xAx([METER_X - 1, 0, BEAM_Z]), P), { tone: "hi" })));
    if (lab) out.push(ISO.word(K.iso([LAMP_X, 0, BEAM_Z + 14], P), "lamp", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([POL_X, 0, BEAM_Z + 22], P), "polariser", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([ANA_X, 0, BEAM_Z + 22], P), "analyser", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([METER_X + 4, 0, BEAM_Z + 16], P), "light meter", "#555", { size: 13, dy: -4 }));
    return out.join("");
  }
  // A filter in its rotating ring at x, its pass direction (the grey lines) at angle a, with a degree scale on the ring.
  function filterSvg(P, x, a, shade) {
    const F = G.frameOf([x, 0, BEAM_Z], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]), out = [];
    out.push(S(G.ringBand(-1.4, 1.4, 14, 18, xAx([x, 0, BEAM_Z]), P), { tone: "mid" }));
    out.push(`<path d="${G.circleOf(F, 1.45, 14, P)}" fill="#7d8790" fill-opacity="${shade}"/>`);
    const lines = [];
    for (let k = -3; k <= 3; k++) { const c = k * 4, h = Math.sqrt(14 * 14 - c * c); lines.push(K.pathOf([G.pointOf(F, 1.5, Math.hypot(c, h), Math.atan2(h, c)), G.pointOf(F, 1.5, Math.hypot(c, h), Math.atan2(-h, c))].map((p) => K.iso(p, P)))); }
    out.push(`<path d="${lines.join("")}" stroke="#4e555c" stroke-width="0.6"/>`);
    out.push(D([K.iso(G.pointOf(F, 1.5, 16, 0), P)], { size: 1.1, tone: "hi" }));
    const ticks = [];
    for (let d = 0; d < 360; d += 15) { const r = (d * Math.PI) / 180, F0 = xAx([x, 0, BEAM_Z]); ticks.push(K.pathOf([G.pointOf(F0, 1.5, 18, r), G.pointOf(F0, 1.5, d % 90 ? 16.8 : 16, r)].map((p) => K.iso(p, P)))); }
    out.push(`<path d="${ticks.join("")}" stroke="#55575c" stroke-width="0.6"/>`);
    return out.join("");
  }
  const beam = (P, x0, x1, I) => (I > 0.01 ? `<path d="${K.pathOf([K.iso([x0, 0, BEAM_Z], P), K.iso([x1, 0, BEAM_Z], P)])}" stroke="#f2c230" stroke-width="${(1 + 5 * I).toFixed(2)}" opacity="${(0.25 + 0.6 * I).toFixed(2)}" stroke-linecap="round"/>` : "");

  ISO.add({
    name: "polarisation", title: "Polarisation (Malus's law)", compare: "polarisation 480 270 480",
    about: "Two polarising filters: turn the second and the light through falls as cos²θ, to nothing at 90°.",
    line: "polarisation cx cy width angle=0 lab=1",
    demo: { line: "polarisation 480 270 480", script: [{ set: { angle: 0 }, hold: 1.2 }, { set: { angle: 45 }, hold: "settle" }, { set: { angle: 90 }, hold: "settle" }, { set: { angle: 0 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 0.68;
      const { P, g } = ISO.frame([[-150, -34, -10], [150, 34, -10], [-150, -20, BEAM_Z + 26], [150, 20, BEAM_Z + 26]], cx, cy, W, H, { azimuth: 48, elevation: 20 }, parent);
      const s = { a: (ISO.num(o, "angle", 0) * Math.PI) / 180, aT: 0 }; s.aT = s.a;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="optics"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        const I = 0.5 * Math.cos(s.a) ** 2;
        w.rebuild(el.optics, s.a.toFixed(3), () => beam(P, LAMP_X + 12, POL_X, 1) + filterSvg(P, POL_X, 0, 0.12) + beam(P, POL_X, ANA_X, 0.5) + `<g data-name="analyser">${filterSvg(P, ANA_X, s.a, 0.12 + 0.3 * (1 - Math.cos(s.a) ** 2))}</g>` + beam(P, ANA_X, METER_X - 4, I));
        if (lab) w.rebuild(el.words, s.a.toFixed(2), () => ISO.word(K.iso([METER_X + 4, 0, BEAM_Z - 16], P), `${Math.round(LUX0 * I)} lux`, "#a3271b", { size: 15, dy: 16 }) + ISO.word(K.iso([ANA_X, 0, BEAM_Z - 20], P), `${Math.round((s.a * 180) / Math.PI)}°`, "#555", { size: 14, dy: 14 }));
        const parts = [...el.optics.querySelectorAll("[data-name]")];
        w.light(parts, parts);
      };
      g.set = (p) => { if (p.angle !== undefined) s.aT = (ISO.clamp(+p.angle, 0, 180) * Math.PI) / 180; };
      g.update = (dt) => { s.a = ISO.follow(s.a, s.aT, dt, 0.5, ISO.still()); draw(); return s.a !== s.aT; };
      g.readout = () => { const d = (s.a * 180) / Math.PI, I = 0.5 * Math.cos(s.a) ** 2; return `analyser at ${d.toFixed(0)}° · I = I₀ cos²θ = ${(LUX0 / 2).toFixed(0)} × ${(Math.cos(s.a) ** 2).toFixed(2)} = ${(LUX0 * I).toFixed(0)} lux (the first filter already halves the lamp's ${LUX0})`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
