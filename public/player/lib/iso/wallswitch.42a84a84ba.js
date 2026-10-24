// "wallswitch cx cy k on=0|1 lab=0 lit=plate|toggle" — a PART (PARTS.md): a wall light switch, its origin the cover
// plate's centre on the wall face. A standard toggle plate 7.0 × 11.4 cm with bevelled edges and a moulded rim, a
// 0.95 × 2.4 cm slot with the switch's bushing in it, the toggle lever out of the slot (up = on, down = off; a spring
// takes it over centre, so it snaps and never rests half way), and two slotted oval-head screws 6 cm apart into the
// switch's yoke. set({ on }) flips it. World units: 1 = 1 cm (x along the wall, y out of it, z up).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const PW = 7.0, PH = 11.4, PT = 0.55, BEV = 0.35, SW = 0.95, SH = 2.4, ANG = (24 * Math.PI) / 180;
  const IVORY = ISO.tint("#f7f4ec", ["#cbc6b8", "#d6d2c5", "#e1ddd1", "#ebe8de"], "#6f6a5c");
  const at = (x, y, z) => [x, y, z];

  function plateSvg(P) {
    const b = PW / 2, h = PH / 2, f = BEV;
    const V = [at(-b, 0, -h), at(b, 0, -h), at(b, 0, h), at(-b, 0, h), at(-b + f, PT, -h + f), at(b - f, PT, -h + f), at(b - f, PT, h - f), at(-b + f, PT, h - f)];
    const out = [ISO.tinted(IVORY, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "hi"))];
    const face = (pts, y = PT + 0.003) => K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true);
    // the moulded rim: a fine line just inside the front face's edge
    const r = 0.28;
    out.push(`<path d="${face([[-b + f + r, -h + f + r], [b - f - r, -h + f + r], [b - f - r, h - f - r], [-b + f + r, h - f - r]])}" fill="none" stroke="#b9b4a5" stroke-width="0.5"/>`);
    // the slot, its walls and the switch's metal bushing at the bottom of it
    out.push(`<path d="${face([[-SW / 2, -SH / 2], [SW / 2, -SH / 2], [SW / 2, SH / 2], [-SW / 2, SH / 2]])}" fill="#3a3832" stroke="#2b2a26" stroke-width="0.5"/>`);
    out.push(`<path d="${face([[-SW / 2 + 0.12, -SH / 2 + 0.12], [SW / 2 - 0.12, -SH / 2 + 0.12], [SW / 2 - 0.12, SH / 2 - 0.12], [-SW / 2 + 0.12, SH / 2 - 0.12]], 0.1)}" fill="#8d9096" stroke="#55585e" stroke-width="0.4"/>`);
    return out.join("");
  }
  // an oval-head screw: a low dome on the plate with its slot turned to a
  function screwSvg(P, z, a) {
    const F = G.frameOf([0, PT, z], [0, 1, 0], [1, 0, 0], [0, 0, -1]);
    const head = ISO.tinted(IVORY, S(G.solidOf([[0, 0.4], [0.07, 0.38, 1], [0.15, 0.3, 1], [0.21, 0.16, 1], [0.23, 0]], F, P, { steps: 24 }), { tone: "hi" }));
    const c = Math.cos(a), s = Math.sin(a), q = (u, v) => K.iso([u * c - v * s, PT + 0.2, z + u * s + v * c], P);
    return head + `<path d="${K.pathOf([q(-0.34, -0.035), q(0.34, -0.035), q(0.34, 0.035), q(-0.34, 0.035)], true)}" fill="#55524a" stroke="none"/>`;
  }
  // the toggle: a tapered lever from its pivot behind the plate, turned by a about x (+ = up)
  function toggleSvg(P, a) {
    const c = Math.cos(a), s = Math.sin(a), p = (u, w, x) => [x, -0.2 + u * c - w * s, u * s + w * c];
    const V = [[0, -0.4, -0.38], [0, 0.4, -0.38], [0, 0.4, 0.38], [0, -0.4, 0.38], [2.6, -0.27, -0.3], [2.6, 0.27, -0.3], [2.6, 0.27, 0.3], [2.6, -0.27, 0.3]].map(([u, w, x]) => p(u, w, x));
    const tip = [[2.6, -0.27, -0.3], [2.6, 0.27, -0.3], [2.6, 0.27, 0.3], [2.6, -0.27, 0.3], [2.78, -0.2, -0.26], [2.78, 0.2, -0.26], [2.78, 0.2, 0.26], [2.78, -0.2, 0.26]].map(([u, w, x]) => p(u, w, x));
    const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    return ISO.tinted(IVORY, ISO.poly(V, F, P, "hi") + ISO.poly(tip, F, P, "hi"));
  }

  ISO.add({
    name: "wallswitch", title: "Wall switch (part)", compare: null,
    about: "A wall light switch: a bevelled cover plate with two screws, the toggle up for on, down for off; set({ on }) flips it with a snap.",
    line: "wallswitch cx cy k on=0|1 lab=0 lit=plate|toggle",
    demo: { line: "wallswitch 480 270 30", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0, lit: "toggle" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = `<g data-name="plate">${plateSvg(P)}</g><g data-name="toggle"></g><g data-name="plate">${screwSvg(P, 3.0, 0.35) + screwSvg(P, -3.0, 1.2)}</g><g data-part="words"></g>`;
      const el = { toggle: g.querySelector('[data-name="toggle"]'), words: g.querySelector('[data-part="words"]') }, parts = [...g.querySelectorAll("[data-name]")], w = ISO.writer();
      const on0 = o.on === "1", s = { a: on0 ? ANG : -ANG }, goal = { on: on0 };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.toggle, s.a.toFixed(3), () => toggleSvg(P, s.a));
        w.rebuild(el.words, lab ? String(s.a > 0) : "", () => (lab ? ISO.word(K.iso([PW / 2, PT, PH / 2], P), s.a > 0 ? "switch: on" : "switch: off", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="6" x="') : ""));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.on !== undefined) goal.on = String(p.on) === "1"; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const to = goal.on ? ANG : -ANG;
        // slow against the spring up to the middle, then it snaps over
        const rate = Math.sign(to - s.a) === Math.sign(s.a) || s.a === 0 ? 14 : 3;
        s.a = ISO.still() || Math.abs(to - s.a) <= rate * dt ? to : s.a + Math.sign(to - s.a) * rate * dt;
        draw();
        return s.a !== to;
      };
      g.readout = () => (s.a > 0 ? "on · toggle up · the contacts inside are closed and the light gets current" : "off · toggle down · the contacts are apart, no current");
      draw();
      return g;
    },
  });
})();
