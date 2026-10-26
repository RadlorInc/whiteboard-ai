// "gyroscope cx cy size spin=1 lab=1" — a spinning gyroscope resting one end of its axle on a pivot tower.
// The brass rotor spins in a steel frame; its axle lies level with one end on the tower. Instead of falling, the
// whole gyroscope swings slowly round the tower (precession) at Ω = m·g·r / (I·ω): with m = 0.15 kg, r = 4 cm,
// a 3.5 cm-radius rotor at 3000 rpm it goes round about once every 10 s; slow the rotor and it precesses faster.
// set({ rpm }) changes the spin.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, M = 0.15, R_ARM = 0.04, ROT_R = 0.035, PIV = [0, 0, 96], ARM = 46, RR = 22;
  const I = 0.5 * M * ROT_R * ROT_R;                              // a solid disc
  const omegaOf = (rpm) => (rpm * 2 * Math.PI) / 60, precOf = (rpm) => (M * g9 * R_ARM) / (I * omegaOf(rpm));

  function towerSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -70, y: -70, w: 140, d: 140, r: 8 }, { h: 6 }), ISO.plate(P, { x: 20, y: 52, w: 36, d: 10, r: 1 })];
    out.push(S(K.cylinder(0, 0, 14, 0, 6, P, 48, 0.6), { tone: "mid" }), S(K.cylinder(0, 0, 4, 6, PIV[2] - 12, P, 24), { tone: "mid", crease: "none" }));
    out.push(L(K.sideArc(0, 0, 4, 40, P, 14), { tone: "faint" }), S(K.cylinder(0, 0, 6, PIV[2] - 6, 4, P, 24, 0.4), { tone: "mid" }));
    out.push(ISO.poly([[0, 0, PIV[2]], [-3, -3, PIV[2] - 2], [3, -3, PIV[2] - 2], [3, 3, PIV[2] - 2], [-3, 3, PIV[2] - 2]], [[1, 2, 3, 4], [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1]], P, "mid"));
    if (lab) out.push(ISO.word(K.iso([0, 70, 0], P), "pivot tower", "#555", { size: 13, dy: 18 }));
    return out.join("");
  }
  // A cheap disc for parts redrawn while the gyroscope swings: an n-sided prism along F's axis (ISO.poly).
  const quickDisc = (F, s0, s1, r, P, tone, n = 32) => {
    const V = [];
    for (const sx of [s0, s1]) for (let i = 0; i < n; i++) V.push(G.pointOf(F, sx, r, (i / n) * Math.PI * 2));
    const faces = [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => n + i)];
    for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
    return ISO.poly(V, faces, P, tone);
  };
  // The gyroscope pointing along azimuth phi: the axle from the pivot through the rotor, the brass rotor and a hub.
  function gyroBody(P, phi) {
    const a = [Math.cos(phi), Math.sin(phi), 0], c = [PIV[0] + a[0] * ARM, PIV[1] + a[1] * ARM, PIV[2]];
    const F = G.frameOf(c, a, [-a[1], a[0], 0], [0, 0, 1]), Fa = G.frameOf(PIV, a, [-a[1], a[0], 0], [0, 0, 1]);
    const out = [quickDisc(Fa, 0, ARM + 12, 1.1, P, "mid", 10), S(G.sphereOf(PIV, 2, P), { tone: "mid" })];
    out.push(ISO.tinted(ISO.T.brass, quickDisc(F, -4, 4, RR, P, "hi") + L(G.circleOf(F, 4, RR - 2.5, P), { tone: "lo" })));
    out.push(quickDisc(F, 4, 7, 2.6, P, "mid", 14));
    return { svg: out.join(""), F };
  }
  const spokesSvg = (P, F, spin) => L(G.spokesOf(F, 3, 3, RR - 2.5, 8, P, { phase: spin }) + G.circleOf(F, 3, 3, P) + G.circleOf(F, 3, RR - 2.5, P), { tone: "lo" });

  ISO.add({
    name: "gyroscope", title: "Gyroscope (precession)", compare: "gyroscope 480 290 460",
    about: "A spinning gyroscope with one end of its axle on a tower: it doesn't fall, it swings slowly round (Ω = mgr/Iω).",
    line: "gyroscope cx cy size rpm=3000 lab=1",
    demo: { line: "gyroscope 480 280 380", script: [{ set: { rpm: 3000 }, hold: 4 }, { set: { rpm: 1500 }, hold: 4 }, { set: { rpm: 3000 }, hold: 2 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 1.1;
      const { P, g } = ISO.frame([[-70, -70, -10], [70, 70, -10], [-72, -72, PIV[2] + 26], [72, 72, PIV[2] + 26]], cx, cy, W, H, { azimuth: 48, elevation: 32 }, parent);
      const s = { rpm: ISO.clamp(ISO.num(o, "rpm", 3000), 800, 6000), rpmT: 0, phi: 0.6, spin: 0 }; s.rpmT = s.rpm;
      g.innerHTML = `<g>${towerSvg(P, lab)}</g><g data-part="gyro"></g><g data-part="spokes"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let body = null, key = "";
      const draw = () => {
        const k = (Math.round(s.phi / 0.017) * 0.017).toFixed(3);        // the body is rebuilt every 1° of its slow swing
        if (k !== key) { key = k; body = gyroBody(P, +k); el.gyro.innerHTML = body.svg; }
        // At thousands of rpm the spokes blur to a still pattern, so they follow the body, not the spin.
        w.rebuild(el.spokes, k, () => `<g opacity=".55">${spokesSvg(P, body.F, 0)}</g>`);
        if (lab) w.rebuild(el.words, s.rpm.toFixed(0), () => ISO.word(K.iso([0, 0, PIV[2] - 30], P), `${Math.round(s.rpm)} rpm`, "#6b5114", { size: 14, anchor: "end", dy: 0 }));
      };
      g.set = (p) => { if (p.rpm !== undefined) s.rpmT = ISO.clamp(+p.rpm, 800, 6000); };
      g.update = (dt) => {
        s.rpm = ISO.follow(s.rpm, s.rpmT, dt, 0.8, ISO.still());
        if (!ISO.still()) { s.phi += precOf(s.rpm) * dt; s.spin += Math.min(omegaOf(s.rpm), 40) * dt * 0.3; }
        draw();
        return true;
      };
      g.readout = () => { const W0 = precOf(s.rpm); return `${Math.round(s.rpm)} rpm · precession Ω = mgr/(Iω) = ${W0.toFixed(2)} rad/s · once round every ${((2 * Math.PI) / W0).toFixed(1)} s`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
