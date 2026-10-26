// "goldfoil cx cy width angle=10 lab=1" — Rutherford's gold-foil experiment in its vacuum chamber.
// Alpha particles from a source in a lead block pass a slit and hit a gold foil; a zinc-sulphide screen with a
// microscope on an arm turns round the foil and counts the flashes. Almost all go straight through; the count falls
// as 1/sin⁴(θ/2) with angle, so a few in 10,000 bounce back past 90° — the atom's charge is in a tiny nucleus.
// set({ angle }) swings the detector; the readout gives the counts per minute there.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CH = { r: 62, z0: 8, z1: 52 }, BEAM_Z = 30, FOIL = [0, 0], ARM = 46;
  const countAt = (deg) => { const th = (Math.max(deg, 4) * Math.PI) / 180; return Math.round(5 / Math.pow(Math.sin(th / 2), 4)); };   // per minute, scaled to 1 at 180°·…

  function chamberBack(P, lab) {
    const out = [ISO.baseboard(P, { x: -90, y: -80, w: 180, d: 160, r: 8 }, { h: 6 })];
    out.push(S(K.cylinder(0, 0, CH.r + 4, 0, CH.z0, P, 72, 0.8), { tone: "mid" }));
    // Degree ring on the chamber floor round the foil, ticks every 10°, from the beam's line.
    const minor = [], major = [], arc = [];
    for (let d = -170; d <= 170; d += 2) arc.push(K.iso([Math.cos((d * Math.PI) / 180) * 50, Math.sin((d * Math.PI) / 180) * 50, CH.z0 + 0.1], P));
    for (let d = -170; d <= 170; d += 10) (d % 30 ? minor : major).push(K.segment([Math.cos((d * Math.PI) / 180) * 50, Math.sin((d * Math.PI) / 180) * 50, CH.z0 + 0.1], [Math.cos((d * Math.PI) / 180) * (d % 30 ? 47.5 : 45.5), Math.sin((d * Math.PI) / 180) * (d % 30 ? 47.5 : 45.5), CH.z0 + 0.1], P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    // The source in its lead block and the slit, along −x; the foil in a frame at the centre.
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-58, -40], [-8, 8], [CH.z0, BEAM_Z + 8], "hi")), ISO.wbox(P, [-34, -32], [-6, 6], [CH.z0, BEAM_Z + 6], "mid"));
    out.push(ISO.wbox(P, [-1, 1], [-9, 9], [CH.z0, BEAM_Z + 10], "mid"));
    out.push(`<path d="${K.pathOf([[0.05, -6, BEAM_Z - 6], [0.05, 6, BEAM_Z - 6], [0.05, 6, BEAM_Z + 6], [0.05, -6, BEAM_Z + 6]].map((p) => K.iso(p, P)), true)}" fill="#e8c44a" stroke="#8a6a10" stroke-width="0.6"/>`);
    // Vacuum pump port with a tube going off the base.
    out.push(S(K.cylinder(52, -40, 4, 0, CH.z0 + 4, P, 20), { tone: "mid" }));
    if (lab) out.push(ISO.word(K.iso([-50, 0, BEAM_Z + 10], P), "α source", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([0, 9, BEAM_Z + 10], P), "gold foil", "#8a6a10", { size: 13, dy: -4, anchor: "start" }));
    return out.join("");
  }
  // The detector arm: from the centre post to a ZnS screen and a microscope pointing at the foil, at angle deg.
  function detectorSvg(P, deg) {
    const a = (deg * Math.PI) / 180, c = [Math.cos(a) * ARM, Math.sin(a) * ARM], out = [];
    const at = (u, w, y) => [u * Math.cos(a) - y * Math.sin(a), u * Math.sin(a) + y * Math.cos(a), w];
    out.push(ISO.box(at, P, [4, ARM + 4], [CH.z0 + 1, CH.z0 + 3], [-2.5, 2.5], "mid"));
    out.push(ISO.box(at, P, [ARM - 3, ARM + 3], [CH.z0 + 3, BEAM_Z + 6], [-3, 3], "mid"));
    const F = G.frameOf([c[0], c[1], BEAM_Z], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.tint("#eaf6e6", ["#9fcf95", "#b2d9a9", "#c5e3be", "#d5ebd0"], "#2c6a22"), S(G.disc(-2, 0, 6, F, P), { tone: "hi" })), S(G.disc(0, 22, 3.6, F, P), { tone: "hi", lit: true }), S(G.disc(22, 26, 4.6, F, P), { tone: "mid" }));
    return out.join("");
  }
  // A few α tracks: most straight through, a few deflected; one toward the detector when it sees any.
  function tracksSvg(P, deg) {
    const paths = [];
    for (let i = -3; i <= 3; i++) paths.push(K.pathOf([K.iso([-32, i * 1.2, BEAM_Z], P), K.iso([60, i * 1.2 + i * 0.2, BEAM_Z], P)]));
    const a = (deg * Math.PI) / 180;
    paths.push(K.pathOf([K.iso([-32, 0.6, BEAM_Z], P), K.iso([0, 0.6, BEAM_Z], P), K.iso([Math.cos(a) * (ARM - 4), Math.sin(a) * (ARM - 4), BEAM_Z], P)]));
    return `<path d="${paths.join("")}" fill="none" stroke="#c45a00" stroke-width="0.7" stroke-dasharray="2 2.5" opacity=".8"/>`;
  }
  function chamberFront(P) {
    // The glass wall: its whole top rim, the near half of its foot, and the two side edges where it turns away.
    const view = Math.atan2(K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P));
    const ring = (z, t0, t1) => K.pathOf(Array.from({ length: 49 }, (_, i) => { const t = t0 + (i / 48) * (t1 - t0); return K.iso([Math.cos(t) * CH.r, Math.sin(t) * CH.r, z], P); }));
    const side = (t) => K.pathOf([K.iso([Math.cos(t) * CH.r, Math.sin(t) * CH.r, CH.z0], P), K.iso([Math.cos(t) * CH.r, Math.sin(t) * CH.r, CH.z1], P)]);
    return `<path d="${K.pathOf([[0, 0, 0]].map((p) => K.iso(p, P)))}" fill="none"/>` +
      `<path d="${ring(CH.z1, 0, Math.PI * 2)}${ring(CH.z0, view - Math.PI / 2, view + Math.PI / 2)}${side(view - Math.PI / 2)}${side(view + Math.PI / 2)}" fill="none" stroke="#5d7f96" stroke-width="1.2" opacity=".8"/>`;
  }

  ISO.add({
    name: "goldfoil", title: "Gold-foil experiment (Rutherford)", compare: "goldfoil 480 270 440",
    about: "α particles at a gold foil in a vacuum chamber: a turning detector counts fewer and fewer at bigger angles, a few even bounce back.",
    line: "goldfoil cx cy width angle=10 lab=1",
    demo: { line: "goldfoil 480 270 440", script: [{ set: { angle: 10 }, hold: 1.4 }, { set: { angle: 45 }, hold: "settle" }, { set: { angle: 90 }, hold: "settle" }, { set: { angle: 150 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.05, H = size * 0.9;
      const { P, g } = ISO.frame([[-90, -80, -10], [90, 80, -10], [-60, -60, CH.z1 + 10], [60, 60, CH.z1 + 10]], cx, cy, W, H, { azimuth: 52, elevation: 34 }, parent);
      const s = { a: ISO.clamp(ISO.num(o, "angle", 10), 4, 170), aT: 0 }; s.aT = s.a;
      g.innerHTML = `<g>${chamberBack(P, lab)}</g><g data-part="tracks"></g><g data-part="det"></g><g>${chamberFront(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.tracks, s.a.toFixed(1), () => tracksSvg(P, s.a));
        w.rebuild(el.det, s.a.toFixed(2), () => detectorSvg(P, s.a));
        if (lab) w.rebuild(el.words, s.a.toFixed(0), () => ISO.word(K.iso([Math.cos((s.a * Math.PI) / 180) * (ARM + 10), Math.sin((s.a * Math.PI) / 180) * (ARM + 10), BEAM_Z + 10], P), `${countAt(s.a)} /min`, "#2c6a22", { size: 14 }));
      };
      g.set = (p) => { if (p.angle !== undefined) s.aT = ISO.clamp(+p.angle, 4, 170); };
      g.update = (dt) => { s.a = ISO.follow(s.a, s.aT, dt, 0.6, ISO.still()); draw(); return s.a !== s.aT; };
      g.readout = () => `detector at ${s.a.toFixed(0)}° · ${countAt(s.a)} flashes a minute (∝ 1/sin⁴(θ/2)) · at 10°: ${countAt(10)}, at 90°: ${countAt(90)}, at 150°: ${countAt(150)}`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
