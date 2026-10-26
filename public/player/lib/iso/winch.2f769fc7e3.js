// "winch cx cy k wind=0..100 lab=0 lit=bracket|drum|crank|string" — a PART (PARTS.md, batch 5): a small hand winch
// 6 × 5 × 6 cm on a bracket, the kind screwed to a ramp's top end or a pulley stand's base; origin the surface point
// under its middle. A steel base plate with four screws, two cheek plates, a wooden drum Ø 2 cm between flanges on a
// steel axle along y, a ratchet wheel and its pawl outside the near cheek, a crank arm with a wooden knob. wind = cm of
// string wound on (0 = one anchoring turn): the drum and the crank turn wind ÷ r radians and the string's coil widens
// along the drum, a turn per 1.2 mm. `string` = the top of the drum, where the string leaves it toward −x (a block
// or a newton meter on the ramp). pulley.js's and incline.js's winch made real. Built in mm; anchors in cm. set({ wind }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const ZC = 40, RD = 10, RF = 16, HW = 14, CH = [15, 18], ARM = 18, PITCH = 1.2;
  const F = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);           // along y; u = +x, v = +z
  const TWINE = ISO.tint("#fbf6ea", ["#d8ccb0", "#e2d8c0", "#ebe3cf", "#f3eddf"], "#7a6440");
  // a bearing standard: a narrow upright with a round top round the axle, and a foot flange (x, z profile)
  const CHEEK = [[-11, 4], [11, 4], [11, 7], [7, 10], [7, ZC], ...ISO.arc(0, ZC, 7, 0, Math.PI, 14).slice(1, -1), [-7, ZC], [-7, 10], [-11, 7]];
  const turnsOf = (wind) => 1 + (wind * 10) / (2 * Math.PI * (RD + 0.8));
  const cheek = (P, y0, y1) => ISO.tinted(ISO.T.paint, ISO.prismY(P, CHEEK, y0, y1, ["#9fb4cc", "#dfe9f4"], "#c6d5e5", "#33506f"));
  const Fat = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function staticBack(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -30, y: -25, w: 60, d: 50, r: 3 }, 0, 4, P)}"/>`];
    out.push(`<g data-name="bracket">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [-30, 30], [-25, 25], [0, 4], "mid"))}`);
    for (const [x, y] of [[-25, -20], [25, -20], [-25, 20], [25, 20]]) out.push(CIRC.screw(P, [x, y, 4], 2, 0.4 + x * 0.02));
    out.push(cheek(P, -CH[1], -CH[0]), "</g>");
    // the drum: its far flange and its core (the turning grain and the string are drawn over the core)
    out.push(`<g data-name="drum">${ISO.tinted(ISO.T.wood, S(G.disc(-HW - 1, -HW + 1.5, RF, F, P), { tone: "mid" }) + S(G.disc(-HW + 1.5, HW - 1.5, RD, F, P), { tone: "mid" }))}</g>`);
    return out.join("");
  }
  // over the core: its grain lines at phase and the string's coil, wind cm of it
  function coreSvg(P, phase, wind) {
    const n = turnsOf(wind), x0 = -HW + 1.5, span = HW * 2 - 3, run = n * PITCH, layer = Math.floor(run / span), rs = RD + 0.8 + layer * 1.2;
    const x1 = layer ? HW - 1.5 : Math.max(x0 + PITCH, x0 + run);
    return ISO.tinted(ISO.T.wood, L(G.ribsOf(F, x0, HW - 1.5, RD, 10, P, { phase, seams: true }), { tone: "faint" })) +
      `<g data-name="string">${ISO.tinted(TWINE, S(G.disc(x0, x1, rs, F, P), { tone: "hi" }) + L(G.ribsOf(F, x0, x1, rs, 24, P, { phase: phase * 1.3, twist: 0.35, seams: true }), { tone: "mid" }))}</g>`;
  }
  // the near flange and near standard, the ratchet wheel (its teeth turn) and pawl
  const nearStatic = (P) => `<g data-name="drum">${ISO.tinted(ISO.T.wood, S(G.disc(HW - 1.5, HW + 1, RF, F, P), { tone: "mid", inner: L(G.circleOf(F, HW + 1, RD * 0.5, P), { tone: "faint" }) }))}</g>` +
    `<g data-name="bracket">${cheek(P, CH[0], CH[1])}${ISO.tinted(ISO.T.steel, S(G.disc(CH[1], CH[1] + 2.4, 12, F, P), { tone: "mid" }))}</g>`;
  const teethSvg = (P, phase) => ISO.tinted(ISO.T.steel, L(G.ribsOf(F, CH[1], CH[1] + 2.4, 12, 16, P, { phase, seams: true }), { tone: "lo" }));
  // the pawl: a steel tongue pinned to a lug on the standard's foot side, its tip on the teeth; the axle's end
  const pawlSvg = (P) => `<g data-name="bracket">${ISO.tinted(ISO.T.steel, ISO.wbox(P, [-16, -6], [CH[1] + 2.4, CH[1] + 4.4], [ZC - 3, ZC], "mid") + ISO.wbox(P, [-16, -11], [CH[0], CH[1] + 4.4], [4, ZC - 3], "mid") +
    S(G.disc(CH[1] + 4.4, CH[1] + 6, 1.6, Fat([-13.5, 0, ZC - 1.5]), P), { tone: "hi" }) + S(G.disc(CH[1] + 2.4, CH[1] + 8, 3, F, P), { tone: "hi" }))}</g>`;
  // the crank arm and its knob at angle phase, the axle's nut over it
  function crankSvg(P, phase) {
    const c = Math.cos(phase), s = Math.sin(phase), at = (u, w, y) => [u * c - w * s, y, ZC + u * s + w * c];
    return ISO.tinted(ISO.T.steel, ISO.box(at, P, [-3, ARM + 3], [-2.6, 2.6], [CH[1] + 5, CH[1] + 7.5], "mid")) +
      ISO.tinted(ISO.T.wood, S(G.disc(0, 12, 3.2, Fat(at(ARM, 0, CH[1] + 7.5)), P), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(CH[1] + 7.5, CH[1] + 9, 2.2, F, P), { tone: "hi" }));
  }

  ISO.add({
    name: "winch", title: "Hand winch (part)", compare: null,
    about: "A small hand winch on a bracket: a wooden drum between flanges, a ratchet and pawl, a crank; winding it turns the drum and the string's coil grows (wind = cm of string pulled in). anchors: string",
    line: "winch cx cy k wind=0..100 lab=0 lit=bracket|drum|crank|string",
    demo: { line: "winch 480 400 52 wind=0", script: [{ set: {}, hold: 1 }, { set: { wind: 20, lit: "crank" }, hold: "settle" }, { set: { wind: 60, lit: "string" }, hold: "settle" }, { set: { wind: 10, lit: "drum" }, hold: "settle" }, { set: { lit: "bracket" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { w: ISO.clamp(ISO.num(o, "wind", 0), 0, 100) };
      s.to = s.w;
      let lit = o.lit || "";
      g.innerHTML = staticBack(Pm) + `<g data-name="drum" data-part="core"></g>${nearStatic(Pm)}<g data-name="bracket" data-part="teeth"></g>${pawlSvg(Pm)}<g data-name="crank" data-part="crank"></g><g data-part="words">${lab ? CIRC.word(P, [3, 0, 6.2], "winch") : ""}</g>`;
      g.anchors = { string: [0, 0, +((ZC + RD + 0.8) / 10).toFixed(2)] };
      const el = LAB.parts(g), w = ISO.writer(), light = () => CIRC.lighter(g)(lit);
      const draw = () => {
        const q = Math.round(s.w * 5) / 5, phase = (q * 10) / (RD + 0.8), key = String(q);
        if (el.core._key === key) return;
        w.rebuild(el.core, key, () => coreSvg(Pm, phase, q)); w.rebuild(el.teeth, key, () => teethSvg(Pm, phase)); w.rebuild(el.crank, key, () => crankSvg(Pm, phase));
        light();   // the string and crank groups are new: light them again
      };
      g.set = (p) => {
        if (p.wind !== undefined && Number.isFinite(+p.wind)) s.to = ISO.clamp(+p.wind, 0, 100);
        if (p.lit !== undefined) { lit = p.lit; light(); }
      };
      g.update = (dt) => {
        s.w = ISO.follow(s.w, s.to, dt, 0.5, ISO.still()); if (Math.abs(s.w - s.to) < 0.02) s.w = s.to;
        draw();
        return s.w !== s.to;
      };
      g.readout = () => `winch · ${s.w.toFixed(1)} cm of string wound in · ${turnsOf(s.w).toFixed(1)} turns on a ${((RD + 0.8) / 5).toFixed(1)} cm drum (a turn takes ${((2 * Math.PI * (RD + 0.8)) / 10).toFixed(1)} cm)`;
      draw(); light();
      return g;
    },
  });
})();
