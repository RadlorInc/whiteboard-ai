// "moments cx cy width m1=200 d1=20 m2=100 d2=40 lab=1" — the principle of moments on a metre rule.
// A metre rule balances at its 50 cm mark on a knife edge in a stirrup; hangers of 100 g slotted masses hang from
// loops at distances d1 (left) and d2 (right) from the pivot, in cm. It settles level when m1·d1 = m2·d2
// (anticlockwise = clockwise) and tips toward the bigger moment until it rests on a stop. set({ m1, d1, m2, d2 }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, CM = 2, BOARD = { x: -120, y: -36, w: 240, d: 72, r: 6 }, PIV = [0, 0, 120], STOP = (9 * Math.PI) / 180;
  const RULE = { half: 50 * CM, h: 6, t: 3 };
  const onRule = (th) => (u, w, y) => [PIV[0] + u * Math.cos(th) - w * Math.sin(th), y, PIV[2] + u * Math.sin(th) + w * Math.cos(th)];

  function standSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 60, y: -30, w: 40, d: 14, r: 1.2 })];
    out.push(S(K.cylinder(0, -14, 8, 0, 3, P, 32, 0.5), { tone: "mid" }), S(K.cylinder(0, -14, 3, 3, PIV[2] - 14, P, 24), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [-4, 4], [-16, -12], [PIV[2] - 12, PIV[2] - 6], "mid"), ISO.wbox(P, [-2, 2], [-12, 4], [PIV[2] - 9, PIV[2] - 6], "mid"));
    // The stirrup's cheeks stop the rule at 9° either way (its tilt is limited where it sits).
    if (lab) out.push(ISO.word(K.iso([0, 12, PIV[2] - 14], P), "pivot", "#555", { size: 13, anchor: "start", dy: 4 }));
    return out.join("");
  }
  function ruleSvg(P, th, m, lab) {
    const at = onRule(th), at3 = (p) => K.iso(p, P), out = [];
    // The knife edge: a small steel wedge under the rule's middle, the stirrup round it.
    out.push(ISO.poly([[-3, -4, PIV[2] - 6], [3, -4, PIV[2] - 6], [0, -4, PIV[2]], [-3, 4, PIV[2] - 6], [3, 4, PIV[2] - 6], [0, 4, PIV[2]]], [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid"));
    const rule = [ISO.box(at, P, [-RULE.half, RULE.half], [0, RULE.h], [-RULE.t, RULE.t])], minor = [], major = [], words = [];
    for (let c = -50; c <= 50; c++) if (Math.abs(c) < 50) (c % 10 ? minor : major).push(K.segment(at(c * CM, RULE.h, RULE.t), at(c * CM, RULE.h - (c % 10 ? (c % 5 ? 1.4 : 2.2) : 3.2), RULE.t), P));
    rule.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    out.push(`<g data-name="rule">${ISO.tinted(ISO.T.wood, rule.join(""))}</g>`);
    // A hanger at distance d (cm, negative = left): a wire loop over the rule, a hook rod and n slotted masses.
    const hanger = (d, grams, name, color) => {
      const top = at(d * CM, 0, 0), loop = [], n = Math.max(1, Math.round(grams / 100));
      for (let a = 0; a <= 16; a++) { const ang = Math.PI * (a / 16); loop.push(at3(at(d * CM + Math.cos(ang) * 0.1, RULE.h / 2 + Math.cos(ang) * (RULE.h / 2 + 1), Math.sin(ang) * (RULE.t + 1) - 0))); }
      const bottom = top[2] - 14 - n * 3.2, h = [];
      h.push(`<path d="${K.pathOf([at3([top[0], -RULE.t - 1, top[2] + RULE.h + 1]), at3([top[0], RULE.t + 1, top[2] + RULE.h + 1])])}" stroke="#4e535a" stroke-width="1" fill="none"/>`);
      h.push(S(K.cylinder(top[0], 0, 0.8, bottom, top[2] - bottom, P, 12), { tone: "mid", crease: "none" }));
      for (let i = 0; i < n; i++) h.push(ISO.tinted(ISO.T.steel, S(K.cylinder(top[0], 0, 6, bottom + 1.4 + i * 3.2, 2.8, P, 36, 0.4), { tone: "hi" })));
      h.push(S(K.cylinder(top[0], 0, 6.6, bottom, 1.4, P, 36), { tone: "mid" }));
      if (lab) h.push(ISO.word(at3([top[0], 0, bottom - 2]), `${grams} g at ${Math.abs(d)} cm`, color, { dy: 16, size: 14 }));
      return `<g data-name="${name}">${h.join("")}</g>`;
    };
    out.push(hanger(-m.d1, m.m1, "left", "#2b6cc4"), hanger(m.d2, m.m2, "right", "#c0392b"));
    return out.join("");
  }

  ISO.add({
    name: "moments", title: "Principle of moments", compare: "moments 480 280 440",
    about: "Metre rule on a knife edge with hangers: level when mass × distance is the same on both sides.",
    line: "moments cx cy width m1=200 d1=20 m2=100 d2=40 lab=1",
    demo: { line: "moments 480 280 440 d2=28", script: [{ set: {}, hold: "settle" }, { set: { d2: 34 }, hold: "settle" }, { set: { d2: 40 }, hold: "settle" }, { set: { d2: 46 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.25, H = size * 0.78;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-RULE.half, 0, PIV[2] + 22], [RULE.half, 0, PIV[2] + 22]], cx, cy, W, H, { azimuth: 72, elevation: 18 }, parent);
      const M = (v) => ISO.clamp(Math.round(v), 10, 1000);   // a slotted-mass hanger: 10 g to 1 kg (a script can send anything)
      const m = { m1: M(ISO.num(o, "m1", 200)), d1: ISO.clamp(ISO.num(o, "d1", 20), 5, 48), m2: M(ISO.num(o, "m2", 100)), d2: ISO.clamp(ISO.num(o, "d2", 40), 5, 48) };
      const s = { th: 0, v: 0, d2: m.d2 };
      g.innerHTML = `<g>${standSvg(P, lab)}</g><g data-part="rule"></g>`;
      const el = g.querySelector('[data-part="rule"]'), w = ISO.writer();
      const turn = () => (m.m1 * m.d1 - m.m2 * s.d2) * 0.001 * g9;   // N·cm·0.01 → sign gives the side
      const draw = () => w.rebuild(el, `${s.th.toFixed(4)} ${s.d2.toFixed(2)} ${m.m1} ${m.d1} ${m.m2}`, () => ruleSvg(P, s.th, { ...m, d2: s.d2 }, lab));
      g.set = (p) => { for (const k of ["m1", "d1", "m2", "d2"]) if (p[k] !== undefined) m[k] = k[0] === "d" ? ISO.clamp(+p[k], 5, 48) : M(+p[k]); };
      g.update = (dt) => {
        s.d2 = ISO.follow(s.d2, m.d2, dt, 0.4, ISO.still());
        const target = Math.abs(turn()) < 1e-6 ? 0 : Math.sign(turn()) * STOP;
        if (ISO.still()) { s.th = target; s.v = 0; }
        else for (let i = 0; i < 6; i++) { const h = dt / 6; s.v += ((target - s.th) * 30 - s.v * 6) * h; s.th = ISO.clamp(s.th + s.v * h, -STOP, STOP); }
        const moving = s.d2 !== m.d2 || Math.abs(s.th - target) > 1e-4 || Math.abs(s.v) > 1e-3;
        if (!moving) { s.th = target; s.v = 0; }
        draw();
        return moving;
      };
      g.readout = () => {
        const a = m.m1 * m.d1, c = m.m2 * Math.round(s.d2);
        return `anticlockwise ${m.m1} g × ${m.d1} cm = ${a} · clockwise ${m.m2} g × ${Math.round(s.d2)} cm = ${c} · ${a === c ? "balanced" : a > c ? "tips left" : "tips right"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
