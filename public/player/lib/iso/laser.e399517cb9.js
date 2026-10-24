// "laser cx cy width on=1 lab=1" — a helium-neon laser opened up.
// A glass tube of helium and neon between two mirrors: a full mirror at one end and a 99% mirror at the other. A
// power supply (about 1.5 kV across the tube) excites the gas, which glows pink; photons at 633 nm bounce between the
// mirrors, each pass making more by stimulated emission, and about 1% leaks through the front mirror as a thin
// beam of one colour, all in step. set({ on: 1|0 }) switches the supply.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const AXZ = 30, T0 = -90, T1 = 90;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -130, y: -40, w: 260, d: 80, r: 6 }, { h: 6 }), ISO.plate(P, { x: 60, y: -34, w: 40, d: 10, r: 1 })];
    // Cradles for the tube, the mirror mounts at both ends, and the power supply box with its leads.
    for (const x of [-60, 60]) out.push(ISO.wbox(P, [x - 5, x + 5], [-12, 12], [0, AXZ - 10], "mid"));
    for (const [x, refl] of [[T0 - 8, 1], [T1 + 2, 0.99]]) {
      out.push(ISO.wbox(P, [x, x + 6], [-14, 14], [0, AXZ + 14], "mid"));
      out.push(ISO.tinted(refl === 1 ? ISO.T.steel : ISO.T.glass, S(G.disc(x + (refl === 1 ? 6 : -1), x + (refl === 1 ? 7.5 : 0), 7, xAx([0, 0, AXZ]), P), { tone: "hi" })));
    }
    out.push(ISO.wbox(P, [-40, 20], [16, 36], [0, 14], "mid"), D([K.iso([-34, 36.05, 10], P), K.iso([-26, 36.05, 10], P)], { size: 0.9, tone: "hi" }));
    out.push(`<path d="${K.pathOf([[-30, 16, 12], [-74, 4, AXZ - 2]].map((p) => K.iso(p, P)))}${K.pathOf([[10, 16, 12], [74, 4, AXZ - 2]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="1.2"/>`);
    if (lab) out.push(ISO.word(K.iso([T0 - 5, 0, AXZ + 16], P), "100% mirror", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([T1 + 5, 0, AXZ + 16], P), "99% mirror", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([-10, 36, 0], P), "power supply ≈ 1.5 kV", "#555", { size: 13, dy: 16 }));
    return out.join("");
  }
  // The glow and the photons bouncing between the mirrors (redrawn each frame), and the glass tube over them (once).
  function glowSvg(P, glow, t) {
    if (glow <= 0.02) return "";
    const a = K.iso([T0 + 6, 0, AXZ], P), b = K.iso([T1 - 6, 0, AXZ], P), out = [`<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#ff7ab0" stroke-width="${(5 * glow).toFixed(1)}" stroke-linecap="round" opacity="${(0.55 * glow).toFixed(2)}"/>`];
    for (let i = 0; i < 8; i++) {
      const f = (t * 0.9 + i / 8) % 1, dir = i % 2 ? 1 : -1, x = dir > 0 ? T0 + 6 + f * (T1 - T0 - 12) : T1 - 6 - f * (T1 - T0 - 12), p0 = K.iso([x, 0, AXZ + (i % 3 - 1) * 0.8], P), p1 = K.iso([x + dir * 6, 0, AXZ + (i % 3 - 1) * 0.8], P);
      out.push(`<path d="M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]}" stroke="#e5302a" stroke-width="1.4" opacity="${glow.toFixed(2)}"/>`);
    }
    return out.join("");
  }
  const glassSvg = (P) => { const F = xAx([0, 0, AXZ]); return `<g opacity=".5">${ISO.tinted(ISO.T.glass, S(G.disc(T0, T1, 8, F, P, { steps: 40 }), { tone: "hi" }))}</g>` + S(G.ringBand(T0 + 14, T0 + 20, 8, 9.2, F, P, { steps: 40 }), { tone: "mid" }) + S(G.ringBand(T1 - 20, T1 - 14, 8, 9.2, F, P, { steps: 40 }), { tone: "mid" }); };
  const beamSvg = (P, glow) => (glow > 0.6 ? `<path d="${K.pathOf([K.iso([T1 + 3, 0, AXZ], P), K.iso([T1 + 44, 0, AXZ], P)])}" stroke="#e5302a" stroke-width="1.6" opacity="${((glow - 0.6) * 2.5).toFixed(2)}"/>` : "");

  ISO.add({
    name: "laser", title: "Helium-neon laser", compare: "laser 480 270 480",
    about: "A He-Ne tube between a full and a 99% mirror: switched on, the gas glows and photons build up by bouncing, and a thin red beam leaks out.",
    line: "laser cx cy width on=1 lab=1",
    demo: { line: "laser 480 270 480 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: 4 }, { set: { on: 0 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 0.6;
      const { P, g } = ISO.frame([[-130, -40, -10], [140, 40, -10], [-120, 0, AXZ + 22], [140, 0, AXZ + 22]], cx, cy, W, H, { azimuth: 64, elevation: 22 }, parent);
      const s = { on: o.on !== "0", glow: 0, t: 0 }; s.glow = s.on ? 1 : 0;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g>${glassSvg(P)}</g><g data-part="glow"></g><g data-part="beam"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.glow, `${s.glow.toFixed(2)} ${s.glow > 0.02 ? ((s.t * 0.9) % 1).toFixed(2) : ""}`, () => glowSvg(P, s.glow, s.t));
        w.rebuild(el.beam, s.glow.toFixed(2), () => beamSvg(P, s.glow));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = !!+p.on; };
      g.update = (dt) => { s.glow = ISO.follow(s.glow, s.on ? 1 : 0, dt, 0.5, ISO.still()); s.t += dt; draw(); return s.on || s.glow > 0; };
      g.readout = () => (s.on ? "gas excited · photons at 633 nm bounce between the mirrors and multiply · 1% leaks out as the beam (one colour, in step, narrow)" : "supply off · no glow, no beam");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
