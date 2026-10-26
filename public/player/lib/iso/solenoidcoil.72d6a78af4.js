// "solenoidcoil cx cy k I=-6..6 lab=0 lit=coil|card|terminals|current" — a PART (PARTS.md, batch 5): wirefield.js's
// solenoid. Bare copper wire 2 mm thick wound 20 turns over 8 cm, 3 cm across, through two rows of holes in a white
// card (whitecard.js's, 22 × 14 cm, 5.6 cm up on four brass posts): the half of each turn above the card shows, the
// half below is hidden by it. The coil's axis runs along x on the card's top face; its two ends run along the card to
// two terminal posts (anchors a at −x, b at +x). Origin: the bench point under the card's middle. I (A) only draws the
// current's arrow across the top turns; positive I makes the +x end N. Inside B = μ₀nI (readout). Built in mm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const SOL = { a: 40, R: 15, turns: 20 }, RW = 1, TX = 55;
  const ZT = () => B30.ZP + B30.T;
  // the half turns above the card and the two leads on the card, painted back to front with the terminal posts
  function coilSvg(P, Pc) {
    const zt = ZT(), items = [];
    for (let i = 0; i < SOL.turns; i++) {
      const x0 = -SOL.a + (2 * SOL.a * i) / SOL.turns, x1 = -SOL.a + (2 * SOL.a * (i + 1)) / SOL.turns, pts = [];
      for (let k = 0; k <= 16; k++) { const th = (k / 16) * Math.PI; pts.push([x0 + (x1 - x0) * (k / 16), -SOL.R * Math.cos(th), zt + SOL.R * Math.sin(th)]); }
      items.push({ k: K.depthOf([(x0 + x1) / 2, 0, zt], P), svg: PHYS.wire(P, PHYS.path(P, pts), RW, B30.COPPER) });
    }
    const posts = {};
    for (const [n, sx] of [["a", -1], ["b", 1]]) {
      const y = sx * SOL.R, p = CIRC.post(Pc, [(sx * TX) / 10, y / 10, zt / 10]);
      posts[n] = p.top;
      items.push({ k: K.depthOf([sx * (SOL.a + TX) / 2, y, zt], P), svg: PHYS.wire(P, PHYS.path(P, [[sx * SOL.a, y, zt], [sx * (TX - 5), y, zt + RW]]), RW, B30.COPPER) });
      items.push({ k: K.depthOf([sx * TX, y, zt], P) + 1e-3, svg: `<g data-name="terminals">${p.svg}</g>` });
    }
    items.sort((a, b) => a.k - b.k);
    return { svg: items.map((it) => it.svg).join(""), posts };
  }

  ISO.add({
    name: "solenoidcoil", title: "Solenoid through a card (part)", compare: null,
    about: "A copper coil of 20 turns over 8 cm, 3 cm across, wound through two rows of holes in a white card on four posts, its ends on two terminal posts; I sets the current's arrow, positive makes the +x end N, B = μ₀nI inside. anchors: a b card",
    line: "solenoidcoil cx cy k I=-6..6 lab=0 lit=coil|card|terminals|current",
    demo: { line: "solenoidcoil 480 330 20 I=0", script: [{ set: {}, hold: 1 }, { set: { I: 3, lit: "coil" }, hold: 1.2 }, { set: { I: -3, lit: "current" }, hold: 1.2 }, { set: { lit: "terminals" }, hold: 1 }, { set: { I: 5, lit: "card" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { I: B30.num(o, "I", 3, -6, 6), lit: o.lit || "" }, zt = ZT();
      const holes = []; for (let i = 0; i <= SOL.turns; i++) { const x = -SOL.a + (2 * SOL.a * i) / SOL.turns; holes.push([x, -SOL.R, 1.2], [x, SOL.R, 1.2]); }
      const coil = coilSvg(Pm, P);
      g.innerHTML = B30.card(Pm, holes) + `<g data-name="coil">${coil.svg}</g><g data-name="current"></g><g data-part="words"></g>`;
      g.anchors = { a: coil.posts.a.map((v) => +v.toFixed(3)), b: coil.posts.b.map((v) => +v.toFixed(3)), card: [0, 0, zt / 10] };
      const el = { cur: g.querySelector('[data-name="current"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const draw = () => {
        const sg = Math.sign(Math.round(st.I * 10)), top = zt + SOL.R + 4;
        w.rebuild(el.cur, String(sg), () => (sg ? B30.arrow(Pm, [0, sg * 14, top], [0, -sg * 14, top]) : ""));
        w.rebuild(el.words, lab ? String(sg) : "", () => {
          if (!lab) return "";
          const out = [CIRC.word(P, [SOL.a / 10, 0, (zt + SOL.R) / 10 + 0.6], "coil, 20 turns")];
          if (sg) out.push(ISO.word(K.iso([sg * (SOL.a + 16), 0, zt + 10], Pm), "N", "#c0392b", { size: 20 }), ISO.word(K.iso([-sg * (SOL.a + 16), 0, zt + 10], Pm), "S", "#2b6cc4", { size: 20 }));
          return out.join("");
        });
        B30.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.I !== undefined && p.I !== "" && Number.isFinite(+p.I)) st.I = ISO.clamp(+p.I, -6, 6);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => {
        const n = SOL.turns / ((2 * SOL.a) / 1000);
        return Math.abs(st.I) < 0.05 ? `solenoid · ${SOL.turns} turns over 8 cm, 3 cm across · no current, no field` : `solenoid · ${SOL.turns} turns over 8 cm, n = ${n.toFixed(0)} /m · I = ${Math.abs(st.I).toFixed(1)} A · inside B = μ₀nI = ${(B30.MU * n * Math.abs(st.I) * 1000).toFixed(2)} mT along the axis · N at the ${st.I > 0 ? "+x" : "−x"} end, like a bar magnet`;
      };
      draw();
      return g;
    },
  });
})();
