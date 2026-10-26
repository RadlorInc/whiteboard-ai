// "bernoulli cx cy width flow=1 lab=1" — a venturi tube with three manometer tubes (Bernoulli's principle).
// Water runs through a glass pipe that narrows in the middle to half its diameter (a quarter of the area). Where it
// narrows it must go 4× faster (A₁v₁ = A₂v₂), and faster water has lower pressure: ½ρ(v₂² − v₁²) less, so the water in
// the middle manometer tube stands lower. With no flow all three read the same. set({ flow: 0..1 }) sets the flow.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -130, y: -40, w: 260, d: 80, r: 6 }, AXZ = 30, R1 = 9, R2 = 4.5, TUBES = [-60, 0, 60], RHO = 1000, G9 = 9.81;
  const V1_MAX = 0.6;                                        // m/s in the wide part at full flow
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const radiusAt = (x) => { const a = Math.abs(x); return a < 16 ? R2 : a < 44 ? R2 + (R1 - R2) * ISO.smooth(16, 44, a) : R1; };
  const MM = 0.5;                                            // world units per mm of water column

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 70, y: -34, w: 40, d: 10, r: 1 })];
    // Pipe supports and the pipe: a glass profile, wide – narrow – wide, with flanges at both ends.
    for (const x of [-100, 100]) out.push(ISO.wbox(P, [x - 5, x + 5], [-10, 10], [0, AXZ - R1], "mid"));
    for (const x of [-30, 30]) out.push(ISO.wbox(P, [x - 3, x + 3], [-6, 6], [0, AXZ - radiusAt(x)], "mid"));
    // A backboard behind the manometer tubes with a millimetre scale.
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-80, 80], [-16, -13], [AXZ + 10, 150], "mid")));
    const minor = [], major = [];
    for (let z = AXZ + 14; z <= 146; z += 2.5) ((z - AXZ - 14) % 25 ? minor : major).push(K.segment([-78, -12.95, z], [-78 + ((z - AXZ - 14) % 25 ? 2.5 : 4.5), -12.95, z], P));
    out.push(ISO.tinted(ISO.T.wood, L(K.segment([-78, -12.95, AXZ + 14], [-78, -12.95, 146], P), { tone: "lo" }) + D([K.iso([-78, -12.95, AXZ + 14], P), K.iso([-78, -12.95, 146], P)], { size: 0.5, tone: "lo" }) + L(minor.join(""), { tone: "lo", free: "end" }) + L(major.join(""), { tone: "mid", free: "end" })));
    if (lab) out.push(ISO.word(K.iso([-112, 0, AXZ + R1 + 6], P), "flow in →", "#1f4f8f", { size: 14, anchor: "start", dy: -6 }));
    return out.join("");
  }
  function pipeSvg(P) {
    const prof = [];
    for (let x = -110; x <= 110; x += 4) prof.push([x, radiusAt(x), 1]);
    const F = xAx([0, 0, AXZ]);
    return ISO.tinted(ISO.T.glass, S(G.lathe([[-112, 0], [-112, R1 + 2], ...prof.map(([s, r]) => [s, r + 0.8, 1]), [112, R1 + 2], [112, 0]], F, P, { smooth: true }), { tone: "hi" })) +
      S(G.disc(-116, -110, R1 + 4, F, P), { tone: "mid" }) + S(G.disc(110, 116, R1 + 4, F, P), { tone: "mid" });
  }
  // A manometer tube standing on the pipe at x, water up to h (world units above the pipe's top).
  function tubeSvg(P, x, h) {
    const base = AXZ + radiusAt(x), top = 146, out = [];
    // Glass first, then the water seen through it.
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(x, 0, 2.6, base, top - base, P, 20), { tone: "hi", crease: "none" })));
    out.push(`<path d="${K.pathOf([[x - 2.2, 2.7, base], [x + 2.2, 2.7, base], [x + 2.2, 2.7, base + h], [x - 2.2, 2.7, base + h]].map((p) => K.iso(p, P)), true)}" fill="#2b6cc4" fill-opacity=".55"/>`);
    out.push(`<path d="${K.pathOf([[x - 2.2, 0.2, base + h], [x + 2.2, 0.2, base + h]].map((p) => K.iso(p, P)))}" stroke="#1f4f8f" stroke-width="1.2"/>`);
    return out.join("");
  }

  ISO.add({
    name: "bernoulli", title: "Venturi tube (Bernoulli)", compare: "bernoulli 480 290 480",
    about: "Water speeds up through the narrow throat and its pressure drops: the middle manometer tube stands lower.",
    line: "bernoulli cx cy width flow=1 lab=1",
    demo: { line: "bernoulli 480 280 480 flow=0", script: [{ set: {}, hold: 1.2 }, { set: { flow: 0.5 }, hold: "settle" }, { set: { flow: 1 }, hold: "settle" }, { set: { flow: 0 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 0.85;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-80, -16, 152], [80, -16, 152]], cx, cy, W, H, { azimuth: 74, elevation: 16 }, parent);
      const s = { f: ISO.clamp(ISO.num(o, "flow", 1), 0, 1), fT: 0 }; s.fT = s.f;
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="tubes"></g><g>${pipeSvg(P)}</g><path data-part="flow" fill="none" stroke="#2b6cc4" stroke-width="1.2" stroke-dasharray="3 6"/><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const head = 60;                                         // static head: water stands 60 above the pipe with no flow
      const heights = () => {
        const v1 = V1_MAX * s.f, v2 = v1 * (R1 / R2) ** 2, drop = (0.5 * RHO * (v2 * v2 - v1 * v1)) / (RHO * G9) * 1000 * MM;   // mm of water → world
        return TUBES.map((x) => (x === 0 ? head - drop : head - x * 0.05 * s.f));   // a little loss along the pipe too
      };
      let phase = 0;
      const draw = () => {
        const hs = heights();
        w.rebuild(el.tubes, hs.map((h) => h.toFixed(2)).join(), () => TUBES.map((x, i) => tubeSvg(P, x, hs[i])).join(""));
        w.attr(el.flow, "d", s.f > 0.02 ? K.pathOf(Array.from({ length: 56 }, (_, i) => K.iso([-108 + i * 4, 0, AXZ], P))) : "");
        w.attr(el.flow, "stroke-dashoffset", String(-phase));
        if (lab) w.rebuild(el.words, hs.map((h) => h.toFixed(0)).join(), () => TUBES.map((x, i) => ISO.word(K.iso([x, 0, AXZ + radiusAt(x) + hs[i]], P), `${Math.round(hs[i] / MM)} mm`, "#1f4f8f", { size: 12, anchor: "start", dy: -4 })).join("") +
          ISO.word(K.iso([0, 0, AXZ - 14], P), "narrow: fast, low pressure", "#1f4f8f", { size: 13, dy: 12 }));
      };
      g.set = (p) => { if (p.flow !== undefined) s.fT = ISO.clamp(+p.flow, 0, 1); };
      g.update = (dt) => { s.f = ISO.follow(s.f, s.fT, dt, 0.6, ISO.still()); phase += dt * 40 * s.f; draw(); return s.f !== s.fT || s.f > 0.02; };
      g.readout = () => {
        const v1 = V1_MAX * s.f, v2 = v1 * (R1 / R2) ** 2, dp = 0.5 * RHO * (v2 * v2 - v1 * v1);
        return s.f < 0.02 ? "no flow · all three tubes level (same pressure)" : `wide part ${v1.toFixed(2)} m/s · throat ${v2.toFixed(2)} m/s (area ¼, so 4× faster) · pressure ${dp.toFixed(0)} Pa lower = ${(dp / (RHO * G9) * 1000).toFixed(0)} mm of water`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
