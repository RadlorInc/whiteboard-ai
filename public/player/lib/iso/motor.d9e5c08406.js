// "motor cx cy width k=motor|generator lab=1" — a classroom DC motor kit (or the same machine as a generator).
// Two curved magnets (N and S) face each other across a rectangular copper coil on an axle; a split-ring commutator
// at the axle's end touches two carbon brushes. motor: a 3 V battery drives current round the coil, the magnets push
// its two long sides opposite ways, and the commutator reverses the current every half turn so it keeps turning.
// generator: a crank turns the coil instead, and the bulb lights (brighter the faster you turn).
// set({ on: 1|0, speed: rev/s }) starts, stops or speeds it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -100, y: -56, w: 200, d: 112, r: 6 }, AXZ = 48, COIL = { x0: -24, x1: 24, h: 15 }, MAG_Y = 22;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  // A curved magnet standing on a block on one side (sign = −1 back, +1 front), its inner face concave toward the coil.
  function magnetSvg(P, sign, colors, letter) {
    const y0 = sign * MAG_Y, y1 = sign * (MAG_Y + 10), out = [];
    out.push(ISO.wbox(P, [-30, 30], [Math.min(y0, y1) - 2, Math.max(y0, y1) + 2], [0, AXZ - 22], "mid"));
    const prof = [...Array.from({ length: 13 }, (_, i) => { const a = -0.9 + (i / 12) * 1.8; return [sign * (MAG_Y + 2 - Math.cos(a) * 2) , AXZ + Math.sin(a) * 18]; })];
    const shape = [...prof, [y1, AXZ + 18], [y1, AXZ - 18]].map(([y, z]) => [y, z]);
    out.push(ISO.prismX(P, sign > 0 ? shape.reverse() : shape, -26, 26, colors.sides, colors.face, colors.ink));
    out.push(ISO.word(K.iso([27, (y0 + y1) / 2, AXZ + 4], P), letter, sign > 0 ? "#1f4f8f" : "#8a1d16", { size: 15, anchor: "start" }));
    return out.join("");
  }
  // The coil at angle a about the axle: a rectangle of thick copper, its two long sides parallel to the axle.
  function coilSvg(P, a) {
    const pt = (x, s) => [x, Math.cos(a) * s * COIL.h, AXZ + Math.sin(a) * s * COIL.h];
    const loop = [pt(COIL.x0, 1), pt(COIL.x1, 1), pt(COIL.x1, -1), pt(COIL.x0, -1), pt(COIL.x0, 1)];
    const d = K.pathOf(loop.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#6e3a1c" stroke-width="4.2" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#d6956d" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="${K.pathOf([pt(COIL.x1, 1), [COIL.x1 + 12, 0, AXZ]].map((p) => K.iso(p, P)))}${K.pathOf([pt(COIL.x1, -1), [COIL.x1 + 12, 0, AXZ]].map((p) => K.iso(p, P)))}" fill="none" stroke="#b87346" stroke-width="1.6"/>`;
  }
  // The split ring: two copper half-rings on the axle with gaps, turning with it; and the brushes pressing on it.
  function commutatorSvg(P, a) {
    const F = G.frameOf([COIL.x1 + 12, 0, AXZ], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]), out = [];
    out.push(ISO.tinted(ISO.T.copper, S(G.disc(0, 8, 4.4, F, P), { tone: "hi" })));
    const gap = [0.18, Math.PI + 0.18].map((ang) => K.pathOf([G.pointOf(F, 0, 4.4, ang), G.pointOf(F, 8, 4.4, ang)].map((p) => K.iso(p, P))));
    out.push(`<path d="${gap.join("")}" stroke="#3a2010" stroke-width="1.2"/>`);
    return out.join("");
  }

  ISO.add({
    name: "motor", title: "DC motor", compare: "motor 480 260 340",
    about: "Magnets, a copper coil on an axle, a split-ring commutator and brushes: current makes the coil turn; turn it and it makes current.",
    line: "motor cx cy width k=motor|generator lab=1",
    demo: { line: "motor 480 270 360", script: [{ set: { on: 1 }, hold: 4 }, { set: { on: 0 }, hold: "settle" }, { set: { k: "generator", on: 1 }, hold: 4 }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 1.05;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, AXZ + 26]], cx, cy, W, H, { azimuth: 24, elevation: 30 }, parent);
      const m = { k: o.k === "generator" ? "generator" : "motor" }, s = { a: 0.4, w: 0, on: o.on === "1" };
      const statics = () => {
        const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: -92, y: -50, w: 36, d: 12, r: 1 })];
        // Bearings: two posts carrying the axle.
        for (const x of [-46, 52]) out.push(ISO.wbox(P, [x - 4, x + 4], [-5, 5], [0, AXZ - 4], "mid"), S(G.disc(-1, 1, 5, G.frameOf([x, 0, AXZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
        out.push(S(G.disc(-50, 56, 1.4, xAx([0, 0, AXZ]), P), { tone: "mid" }));
        // Brushes on spring arms either side of the commutator, leads to the battery (motor) or the bulb (generator).
        for (const sgn of [-1, 1]) out.push(ISO.wbox(P, [COIL.x1 + 13, COIL.x1 + 19], [sgn * 5 - 1.5, sgn * 5 + 1.5], [AXZ - 2, AXZ + 2], "lo"), ISO.wbox(P, [COIL.x1 + 13, COIL.x1 + 19], [sgn * 5 - 1, sgn * 5 + 1], [0, AXZ - 2], "mid"));
        if (m.k === "motor") out.push(ISO.wbox(P, [50, 90], [24, 44], [0, 4], "mid"), ISO.tinted(ISO.T.copper, S(G.disc(0, 8, 6, xAx([54, 34, 10]), P), { tone: "hi" })), S(G.disc(8, 34, 6, xAx([54, 34, 10]), P), { tone: "hi" }));
        else out.push(ISO.wbox(P, [60, 80], [26, 42], [0, 4], "mid"), S(K.cylinder(70, 34, 4, 4, 6, P, 24), { tone: "mid" }));
        out.push(`<path d="${K.pathOf([[COIL.x1 + 16, -5, 2], [COIL.x1 + 16, -5, 0.5], [56, 26, 0.5]].map((p) => K.iso(p, P)))}${K.pathOf([[COIL.x1 + 16, 5, 2], [COIL.x1 + 16, 5, 0.5], [70, 42, 0.5]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="1.4"/>`);
        if (lab) out.push(ISO.word(K.iso([70, 50, 0], P), m.k === "motor" ? "3 V battery" : "bulb", "#555", { size: 13, dy: 18 }), ISO.word(K.iso([COIL.x1 + 16, 12, 0], P), "brushes", "#555", { size: 13, dy: 16 }));
        return out.join("");
      };
      g.innerHTML = `<g data-part="static"></g><g data-part="back"></g><g data-part="coil"></g><g data-part="comm"></g><g data-part="front"></g><g data-part="bulb"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.static, m.k, statics);
        w.rebuild(el.back, "b", () => magnetSvg(P, -1, { sides: ["#c05a4e", "#f4b8ae"], face: "#e88e82", ink: "#8a1d16" }, "N"));
        w.rebuild(el.front, "f", () => magnetSvg(P, 1, { sides: ["#5d80b8", "#bacde8"], face: "#91afd8", ink: "#1f4f8f" }, "S"));
        w.rebuild(el.coil, s.a.toFixed(3), () => coilSvg(P, s.a));
        w.rebuild(el.comm, s.a.toFixed(3), () => commutatorSvg(P, s.a));
        const glow = m.k === "generator" ? ISO.clamp(s.w / 2.5, 0, 1) : 0;
        w.rebuild(el.bulb, `${m.k} ${glow.toFixed(2)}`, () => (m.k === "generator" ? ISO.tinted(glow > 0.4 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf([70, 34, 15], 5, P), { tone: "hi" })) + (glow > 0.05 ? `<circle cx="${K.iso([70, 34, 15], P)[0]}" cy="${K.iso([70, 34, 15], P)[1]}" r="${(14 * glow).toFixed(1)}" fill="#ffd84a" opacity="${(0.45 * glow).toFixed(2)}"/>` : "") : ""));
      };
      g.set = (p) => { if (p.k) m.k = p.k === "generator" ? "generator" : "motor"; if (p.on !== undefined) s.on = !!+p.on; };
      g.update = (dt) => {
        const target = s.on ? 2.5 : 0;                        // rev/s
        s.w = ISO.follow(s.w, target, dt, s.on ? 0.6 : 0.9, ISO.still());
        if (!ISO.still()) s.a += s.w * Math.PI * 2 * dt;
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => m.k === "motor" ? `${s.on ? "current on" : "off"} · coil turning at ${s.w.toFixed(1)} rev/s · the split ring flips the current every half turn` : `turning the coil at ${s.w.toFixed(1)} rev/s · the moving wire cuts the field and makes current · bulb ${s.w > 1 ? "lit" : "dim"}`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
