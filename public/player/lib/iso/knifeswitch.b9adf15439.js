// "knifeswitch cx cy k on=0|1 lab=0 lit=base|blade|terminals" — a PART (PARTS.md): a school knife switch on a
// porcelain base 10 × 4 cm, its origin the surface point under the base's middle. A brass hinge post (two cheeks and a
// steel pivot pin) at the left, a copper blade with a black turned handle, the brass spring jaw it closes into at the
// right, both on screwed foot plates; brass strips run out to two terminal posts, anchors a (left) and b (right).
// on=1 the blade lies in the jaw (circuit closed); on=0 it swings up 55° on its pin. set({ on }) swings it.
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const PORC = ISO.tint("#f4f1ea", ["#c9c4b8", "#d6d1c6", "#e2ded4", "#ece9e1"], "#6a6458");
  const BASE = { x: -50, y: -20, w: 100, d: 40, r: 3 }, BH = 12, TX = 44, HX = -24, HZ = 25, JX = 22, LEN = 60, OPEN = (55 * Math.PI) / 180;

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, 0, BH, P)}"/>`];
    out.push(`<g data-name="base">${ISO.tinted(PORC, S(K.slabOf(BASE, 0, BH, P, 6, 1.2), { tone: "mid", inner: L(K.sideSeam(BASE, 2, P, 6), { tone: "faint" }) }))}`);
    out.push(L(K.planOutline(K.insetPlan(BASE, 3.5), BH, P, 4), { tone: "faint" }), "</g>");
    out.push(`<g data-name="terminals">${CIRC.strip(P, [-TX, 0], [-31, 0], BH, 5)}${CIRC.strip(P, [27, 0], [TX, 0], BH, 5)}</g>`);
    // the foot plates the hinge and the jaw stand on, two screws each
    for (const x0 of [HX - 7, JX - 7]) {
      out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [x0, x0 + 14], [-6, 6], [BH, BH + 1.4], "mid")));
      for (const y of [-3.6, 3.6]) out.push(CIRC.screw(P, [x0 + (y < 0 ? 2.6 : 11.4), y, BH + 1.4], 1.3, y));
    }
    return out.join("");
  }
  // the cheeks of the hinge and of the jaw on one side (side -1 far, +1 near)
  function cheeksSvg(P, side) {
    const y = side > 0 ? [1.1, 2.5] : [-2.5, -1.1], out = [];
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [HX - 5, HX + 5], y, [BH + 1.4, HZ + 5], "mid")));
    // the jaw's spring cheeks flare out at the top so the blade finds its way in
    const yj = side > 0 ? [1.1, 2.3] : [-2.3, -1.1], f = side * 1.4;
    out.push(ISO.tinted(ISO.T.brass, ISO.poly([[JX - 4, yj[0], BH + 1.4], [JX + 4, yj[0], BH + 1.4], [JX + 4, yj[1], BH + 1.4], [JX - 4, yj[1], BH + 1.4], [JX - 4, yj[0] + f, HZ + 7], [JX + 4, yj[0] + f, HZ + 7], [JX + 4, yj[1] + f, HZ + 7], [JX - 4, yj[1] + f, HZ + 7]], ISO.BOX_F, P, "mid")));
    if (side > 0) out.push(ISO.tinted(ISO.T.steel, S(G.disc(2.5, 3.6, 2.4, G.frameOf([HX, 0, HZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    return out.join("");
  }
  // the blade at angle a (0 closed), and its handle (the pin it turns on is drawn once, before it)
  function bladeSvg(P, a) {
    const c = Math.cos(a), s = Math.sin(a), at = (u, w, y) => [HX + u * c - w * s, y, HZ + u * s + w * c];
    const out = [ISO.tinted(ISO.T.copper, ISO.box(at, P, [-4, LEN], [-3, 3], [-1, 1], "mid"))];
    // the handle: a turned black knob standing off the blade's end, square to it
    const n = [-s, 0, c], F = G.frameOf(at(LEN - 5, 3, 0), n, [c, 0, s], [0, 1, 0]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 2.6], [3, 2.2], [5.5, 2.6], [8, 3.4], [11.5, 4.2], [15, 4.8], [18, 4.9], [20, 4.4], [21.6, 3.6], [22.5, 2.4], [23, 1]], F, P, { steps: 16 }), { tone: "mid" })));
    return out.join("");
  }

  ISO.add({
    name: "knifeswitch", title: "Knife switch (part)", compare: null,
    about: "A knife switch on a porcelain base: brass hinge post, copper blade with a black handle, the spring jaw it closes into, two terminal posts; on=1 the blade is down in the jaw (closed), on=0 swung up (open). anchors: a b",
    line: "knifeswitch cx cy k on=0|1 lab=0 lit=base|blade|terminals",
    demo: { line: "knifeswitch 480 420 44 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { lit: "blade" }, hold: 1 }, { set: { on: 0, lit: "terminals" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const a = CIRC.post(Pm, [-TX, 0, BH + 0.04], { r: 4.2, h: 9.5 }), b = CIRC.post(Pm, [TX, 0, BH + 0.04], { r: 4.2, h: 9.5 });
      g.innerHTML = baseSvg(Pm) + `<g data-name="terminals">${a.svg}</g>${cheeksSvg(Pm, -1)}${ISO.tinted(ISO.T.steel, S(G.disc(-2.5, 2.5, 1.6, G.frameOf([HX, 0, HZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), Pm), { tone: "mid" }))}<g data-name="blade"></g>${cheeksSvg(Pm, 1)}<g data-name="terminals">${b.svg}</g><g data-part="words"></g>`;
      g.anchors = { a: a.top.map((v) => v / 10), b: b.top.map((v) => v / 10) };
      const el = { blade: g.querySelector('[data-name="blade"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer(), light = CIRC.lighter(g);
      const s = { on: o.on === "1" ? 1 : 0, a: 0 };
      s.a = s.on ? 0 : OPEN;
      let lit = o.lit || "";
      const draw = () => {
        const a = Math.round(s.a * 200) / 200;
        w.rebuild(el.blade, String(a), () => bladeSvg(Pm, a));
        w.rebuild(el.words, lab ? String(s.on) : "", () => (lab ? CIRC.word(P, [5, 0, 4], s.on ? "switch closed" : "switch open") : ""));
        light(lit);
      };
      g.set = (p) => { if (p.on !== undefined) s.on = String(p.on) === "1" ? 1 : 0; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { const to = s.on ? 0 : OPEN; s.a = ISO.follow(s.a, to, dt, 0.14, ISO.still()); if (Math.abs(s.a - to) < 0.002) s.a = to; draw(); return s.a !== to; };
      g.readout = () => (s.on ? "knife switch closed · the blade bridges hinge and jaw: current can flow" : "knife switch open · an air gap between blade and jaw: no current");
      draw();
      return g;
    },
  });
})();
