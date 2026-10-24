// "outlet cx cy height k=standard|gfci plug=0|1 lab=1 lit=plate|top|bottom|plug|test|reset" — a US wall outlet.
// A duplex receptacle on a wall section: cover plate and centre screw, two faces, each with a narrow hot slot (right),
// a wide neutral slot (left) and the round-topped ground hole below; the wide neutral only takes the plug one way round.
// k=gfci is a GFCI receptacle: a Decora plate, TEST and RESET buttons between the faces and a status light. It
// compares the current going out on hot with what comes back on neutral and trips if 5 mA goes missing (leaking to
// ground, maybe through a person) within 1/40 s: RESET pops out and the light goes red. set({ plug, test, reset }).
// World units: 1 = 1 cm (plate 7 × 11.4 cm, the 2¾ × 4½ in standard).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CZ = 30, PW = 7, PH = 11.4, FACE = 0.55, TOPF = CZ + 2.3, BOTF = CZ - 2.3;
  const IVORY = ISO.tint("#f7f4ec", ["#cbc6b8", "#d6d2c5", "#e1ddd1", "#ebe8de"], "#6f6a5c"), WALL = ISO.tint("#f1efe9", ["#c9c6be", "#d3d0c8", "#ddDAd2", "#e7e4dc"], "#7a776f");
  const PLASTIC = ISO.T.plastic, BRASS = ISO.T.brass, WOOD = ISO.T.wood;
  const fm = (P, x, y, z) => ISO.faceMatrix(P, [x, y, z], 1);

  function wallSvg(P) {
    // a piece of the wall: the drywall sheet, and the stud it is screwed to showing at its left edge
    return ISO.tinted(WOOD, ISO.wbox(P, [-9.5, -5.7], [-10.2, -1.3], [CZ - 10, CZ + 10], "hi")) + ISO.tinted(WALL, ISO.wbox(P, [-9.5, 9.5], [-1.3, 0], [CZ - 10, CZ + 10], "hi")) +
      D([CZ - 8, CZ + 8].map((z) => K.iso([-7.6, 0.01, z], P)), { size: 0.5, tone: "mid" });
  }
  // One receptacle face: a raised rounded block with its slots and ground hole drawn on its front.
  function faceSvg(P, z, gfci) {
    const w = gfci ? 3.3 : 3.5, h = gfci ? 2.6 : 3.3, out = [ISO.tinted(IVORY, ISO.wbox(P, [-w / 2, w / 2], [0.25, FACE + 0.25], [z - h / 2, z + h / 2], "hi"))];
    const y = FACE + 0.26, slot = (x, wd, ht) => `<path d="${K.pathOf([[x - wd / 2, z + 0.15], [x + wd / 2, z + 0.15], [x + wd / 2, z + 0.15 + ht], [x - wd / 2, z + 0.15 + ht]].map(([a, b]) => K.iso([a, y, b], P)), true)}" fill="#2b2a26"/>`;
    out.push(slot(0.64, 0.17, 0.66), slot(-0.64, 0.17, 0.82));
    const g = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; g.push([Math.cos(a) * 0.24, z - 0.75 - Math.sin(a) * 0.24]); }
    out.push(`<path d="${K.pathOf([[-0.24, z - 1.15], [0.24, z - 1.15], ...g.reverse()].map(([a, b]) => K.iso([a, y, b], P)), true)}" fill="#2b2a26"/>`);
    return out.join("");
  }
  function plateSvg(P, gfci) {
    const out = [ISO.tinted(IVORY, ISO.wbox(P, [-PW / 2, PW / 2], [0, 0.25], [CZ - PH / 2, CZ + PH / 2], "hi"))];
    if (gfci) out.push(ISO.tinted(IVORY, ISO.wbox(P, [-2.1, 2.1], [0.25, 0.4], [CZ - 4.2, CZ + 4.2], "mid")));
    out.push(L(K.sideRing([0, 0.26, gfci ? CZ + 5 : CZ], 0.42, "y", P, 16), { tone: "lo" }), D([K.iso([0, 0.26, gfci ? CZ + 5 : CZ], P)], { size: 0.5, tone: "mid" }));
    if (gfci) out.push(L(K.sideRing([0, 0.26, CZ - 5], 0.42, "y", P, 16), { tone: "lo" }), D([K.iso([0, 0.26, CZ - 5], P)], { size: 0.5, tone: "mid" }));
    return out.join("");
  }
  // GFCI buttons between the faces: TEST (pressed in by p) and RESET (out by r when tripped), and the status light.
  function buttonsSvg(P, p, r, tripped) {
    const out = [];
    out.push(ISO.tinted(PLASTIC, ISO.wbox(P, [-1.5, -0.1], [0.4, 0.85 - 0.3 * p], [CZ - 0.5, CZ + 0.5], "hi")));
    out.push(ISO.tinted(IVORY, ISO.wbox(P, [0.1, 1.5], [0.4, 0.75 + 0.45 * r], [CZ - 0.5, CZ + 0.5], "hi")));
    out.push(`<g transform="${fm(P, -0.8, 0.86 - 0.3 * p, CZ + 0.18)}"><text font-size="0.42" font-weight="700" fill="#f0f0f0" text-anchor="middle" font-family="Helvetica Neue,Arial">TEST</text></g>`);
    out.push(`<g transform="${fm(P, 0.8, 0.76 + 0.45 * r, CZ + 0.18)}"><text font-size="0.38" font-weight="700" fill="#333" text-anchor="middle" font-family="Helvetica Neue,Arial">RESET</text></g>`);
    const c = K.iso([1.6, 0.41, CZ + 3.6], P);
    out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="1.6" fill="${tripped ? "#e04b3a" : "#47b04b"}" stroke="#333" stroke-width="0.4"/>`);
    return out.join("");
  }
  // The plug, coming in along −y to a face (the bottom one on a GFCI, so the buttons stay in view); prongs only drawn in front of the face.
  function plugSvg(P, gap, z) {
    const y0 = FACE + 0.25 + gap, out = [];
    const prong = (x, zc, wx, wz) => { const tip = y0 - 1.6; if (y0 <= FACE + 0.3) return ""; return ISO.tinted(BRASS, ISO.wbox(P, [x - wx / 2, x + wx / 2], [Math.max(FACE + 0.26, tip), y0], [zc - wz / 2, zc + wz / 2], "hi")); };
    out.push(prong(-0.64, z + 0.48, 0.15, 0.78), prong(0.64, z + 0.48, 0.15, 0.62));
    if (y0 > FACE + 0.3) out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, Math.min(1.9, gap + 0.1), 0.24, G.frameOf([0, y0, z - 0.85], [0, -1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 12 }), { tone: "hi" })));
    out.push(ISO.tinted(PLASTIC, ISO.wbox(P, [-1.8, 1.8], [y0, y0 + 2.4], [z - 1.9, z + 1.9], "hi")));
    const F = G.frameOf([0, y0 + 2.4, z - 0.4], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(ISO.tinted(PLASTIC, S(G.solidOf([[0, 1.1], [1.2, 0.8, 1], [2.4, 0.5]], F, P, { steps: 16 }), { tone: "hi" }) + S(G.disc(2.4, 6, 0.45, F, P, { steps: 14 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "outlet", title: "Wall outlet", compare: "outlet 480 270 280",
    about: "A US wall outlet: narrow hot slot, wide neutral, round ground; a GFCI version trips when 5 mA goes missing and is reset with its RESET button.",
    line: "outlet cx cy height k=standard|gfci plug=0|1 lab=1 lit=plate|top|bottom|plug|test|reset",
    demo: { line: "outlet 480 270 280 k=gfci", script: [{ set: { plug: 1 }, hold: "settle" }, { set: { test: 1 }, hold: 2.2 }, { set: { reset: 1 }, hold: 2.2 }] },
    make([cx, cy, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.6, H = size * 1.6;
      const { P, g } = ISO.frame([[-9.5, -10, CZ - 10], [9.5, 0, CZ - 10], [-9.5, -10, CZ + 10], [9.5, 0, CZ + 10], [0, 10, CZ - 2], [0, 10, CZ + 4], [-15, 0, CZ], [15, 0, CZ]], cx, cy, W, H, { azimuth: 70, elevation: 12 }, parent);
      const gfci = o.k === "gfci";
      g.innerHTML = `<g>${wallSvg(P)}</g><g data-name="plate">${plateSvg(P, gfci)}</g><g data-name="bottom">${faceSvg(P, BOTF - (gfci ? 0.6 : 0), gfci)}</g><g data-name="buttons"></g><g data-name="top">${faceSvg(P, TOPF + (gfci ? 0.6 : 0), gfci)}</g><g data-name="plug"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { plate: q("plate"), bottom: q("bottom"), top: q("top"), buttons: q("buttons"), plug: q("plug"), words: q("words") }, w = ISO.writer();
      const s = { plug: o.plug === "1" ? 1 : 0, press: 0, pop: 0, tripped: false, clock: 0, tAt: -1 }, goal = { plug: s.plug };
      let lit = o.lit || "", say = "";
      const draw = () => {
        const gap = 7 * (1 - s.plug);
        w.rebuild(el.plug, gap.toFixed(3), () => plugSvg(P, gap, gfci ? BOTF - 0.6 : TOPF));
        if (gfci) w.rebuild(el.buttons, `${s.press.toFixed(2)} ${s.pop.toFixed(2)} ${s.tripped}`, () => buttonsSvg(P, s.press, s.pop, s.tripped));
        w.rebuild(el.words, lab ? `${gfci} ${s.plug > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([PW / 2 + 0.6, 0.3, TOPF + 1.2], P), "hot: narrow slot", "#c0392b", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([-PW / 2 - 0.6, 0.3, TOPF + 1.2], P), "neutral: wide slot", "#444", { anchor: "end", size: 14, dy: 4 }),
          ISO.word(K.iso([-PW / 2 - 0.6, 0.3, BOTF - 1], P), "ground: round hole", "#2c6a22", { anchor: "end", size: 14, dy: 4 }),
          gfci ? ISO.word(K.iso([PW / 2 + 0.6, 0.3, CZ], P), "TEST · RESET", "#444", { anchor: "start", size: 14, dy: 4 }) : ""].join(""));
        const want = lit || (s.plug !== goal.plug ? "plug" : say === "test" ? "buttons" : say === "reset" ? "buttons" : "");
        w.light([el.plate, el.bottom, el.top, el.buttons, el.plug], [q(want === "test" || want === "reset" ? "buttons" : want)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.plug !== undefined) goal.plug = +p.plug ? 1 : 0;
        if (p.test && gfci) { say = "test"; s.tAt = s.clock; }
        if (p.reset && gfci) { say = "reset"; s.tAt = s.clock; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.clock += dt;
        s.plug = ISO.follow(s.plug, goal.plug, dt, 0.25, calm); if (Math.abs(s.plug - goal.plug) < 1e-3) s.plug = goal.plug;
        // TEST: the button goes in for 0.3 s, the GFCI trips (1/40 s) and RESET springs out; RESET: pushed back in
        const u = s.clock - s.tAt;
        if (say === "test") { s.press = u < 0.3 ? 1 : ISO.follow(s.press, 0, dt, 0.06, calm); if (u > 0.1) { s.tripped = true; s.pop = ISO.follow(s.pop, 1, dt, 0.04, calm); } }
        if (say === "reset") { s.tripped = u < 0.2 && s.tripped; s.pop = ISO.follow(s.pop, 0, dt, 0.08, calm); if (u >= 0.2) s.tripped = false; }
        draw();
        return s.plug !== goal.plug || (s.tAt >= 0 && u < 0.6);
      };
      g.readout = () => {
        if (!gfci) return s.plug > 0.99 ? "plugged in · 120 V between hot and neutral, ground for safety" : "3-prong plug: wide blade to neutral, narrow to hot, round pin to ground";
        if (s.tripped) return "tripped · RESET popped out, light red · power off at both faces until you press RESET";
        if (say === "reset") return "reset · power back on · press TEST once a month";
        return s.plug > 0.99 ? "plugged in · GFCI watching: trips if 5 mA leaks to ground, within 1/40 s" : "GFCI outlet · TEST and RESET between the faces";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
