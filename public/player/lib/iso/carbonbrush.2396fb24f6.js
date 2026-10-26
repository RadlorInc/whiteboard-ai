// "carbonbrush cx cy k aim=-y|+y|down lab=0 lit=carbon|arm|terminal" — a PART (PARTS.md, batch 5): one brush of
// motor.js, real size (3 × 0.5 × 0.5 cm). A graphite block 5 × 5 × 11 mm, its worn face against the commutator, held
// in a brass clip on a bowed phosphor-bronze spring arm, which ends in a fibre terminal block with a brass screw (where
// a lead is fixed, anchor `post`). The origin is the tip: the middle of the carbon's contact face; aim = the way it
// presses (-y: it stands on the +y side of the ring and presses toward −y; +y: from the far side; down: from above).
// Place it at a commutator's b2 (aim=-y), b1 (aim=+y) or top (aim=down). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const CARBON = ISO.tint("#5a5d63", ["#2b2d31", "#33363a", "#3d4045", "#474a50"], "#141517");
  const BRONZE = ISO.tint("#f4dfb0", ["#b88f4a", "#c79f5c", "#d5b273", "#e2c48b"], "#5f4614");
  const FIBRE = ISO.tint("#6b5446", ["#3d2e25", "#47362c", "#523f33", "#5d483b"], "#21170f");
  const AIMS = { "-y": [[0, 1, 0], [0, 0, 1]], "+y": [[0, -1, 0], [0, 0, 1]], down: [[0, 0, 1], [0, -1, 0]] };

  function brushSvg(P, aim) {
    const [back, up] = AIMS[aim], F = G.frameOf([0, 0, 0], back, [1, 0, 0], up), at = B21.at(F), items = [];
    const box = (a, u, v, tint, name, tone = "mid") => [at((a[0] + a[1]) / 2, (u[0] + u[1]) / 2, (v[0] + v[1]) / 2), `<g data-name="${name}">${ISO.tinted(tint, ISO.box(at, P, a, u, v, tone))}</g>`];
    // the carbon block (its face slightly worn to the ring's curve: a darker polished band at the tip)
    items.push(box([0, 1.1], [-0.25, 0.25], [-0.25, 0.25], CARBON, "carbon"));
    items.push(box([-0.01, 0.06], [-0.24, 0.24], [-0.24, 0.24], ISO.T.rubber, "carbon", "lo"));
    // the brass clip round its back end, and the copper pigtail from the carbon to the clip
    items.push(box([0.8, 1.3], [-0.3, 0.3], [-0.3, 0.3], ISO.T.brass, "arm", "hi"));
    // the spring arm: one thin strip along a gentle bow (3 mm off straight), cut as a prism across its width
    const bow = (q) => 0.3 * Math.sin(Math.PI * q), arm = [];
    for (let i = 0; i <= 12; i++) { const q = i / 12; arm.push([1.25 + q * 1.4, bow(q) + 0.03]); }
    for (let i = 12; i >= 0; i--) { const q = i / 12; arm.push([1.25 + q * 1.4, bow(q) - 0.03]); }
    items.push([at(1.95, 0, 0.2), `<g data-name="arm">${ISO.tinted(BRONZE, S(G.prismOf(G.frameOf([0, 0, 0], [1, 0, 0], back, up), arm, -0.2, 0.2, P), { tone: "hi" }))}</g>`]);
    // the fibre terminal block, its brass screw and washer on top, and a solder tag out of its end
    items.push(box([2.55, 3.0], [-0.3, 0.3], [-0.45, 0.2], FIBRE, "terminal"));
    const Fs = G.frameOf(at(2.78, 0, 0.2), up, [1, 0, 0], back);
    const head = ISO.tinted(ISO.T.brass, S(G.disc(0, 0.03, 0.2, Fs, P), { tone: "mid" }) + S(G.disc(0.03, 0.13, 0.14, Fs, P), { tone: "hi" }));
    const slot = K.pathOf([G.pointOf(Fs, 0.135, 0.12, 0.4), G.pointOf(Fs, 0.135, 0.12, 0.4 + Math.PI)].map((p) => K.iso(p, P)));
    items.push([at(2.78, 0, 0.4), `<g data-name="terminal">${head}<path d="${slot}" stroke="#5f4614" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.03).toFixed(2)}" data-free=""/></g>`]);
    items.push(box([3.0, 3.25], [-0.12, 0.12], [-0.12, -0.08], ISO.T.brass, "terminal", "hi"));
    return B21.sorted(items, P);
  }

  ISO.add({
    name: "carbonbrush", title: "Carbon brush on a spring arm (part)", compare: null,
    about: "A carbon brush (graphite block 5 × 5 × 11 mm) in a brass clip on a bowed spring arm with a terminal screw; it presses on a commutator and carries the current into the turning coil. anchors: post",
    line: "carbonbrush cx cy k aim=-y|+y|down lab=0 lit=carbon|arm|terminal",
    demo: { line: "carbonbrush 420 300 60", script: [{ set: {}, hold: 1 }, { set: { lit: "carbon" }, hold: 1.2 }, { set: { lit: "arm" }, hold: 1.2 }, { set: { lit: "terminal" }, hold: 1.2 }, { set: { aim: "down", lit: "" }, hold: 1.2 }, { set: { aim: "+y" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let aim = AIMS[o.aim] ? o.aim : "-y", lit = o.lit || "";
      const build = () => {
        const [back, up] = AIMS[aim], post = [0, 1, 2].map((i) => +(back[i] * 2.78 + up[i] * 0.33).toFixed(3));
        g.innerHTML = brushSvg(P, aim) + LAB.word(P, lab, [0, 1, 2].map((i) => back[i] * 1.5 + up[i] * 0.9), "brush");
        g.anchors = { post };
        B21.light(w, g, lit);
      };
      g.set = (p) => {
        if (AIMS[p.aim] && p.aim !== aim) { aim = p.aim; build(); }
        if (p.lit !== undefined) { lit = p.lit; B21.light(w, g, lit); }
      };
      g.update = () => false;
      g.readout = () => `carbon brush 5 × 5 × 11 mm on a spring arm, pressing ${aim === "down" ? "down" : `toward ${aim}`} · graphite conducts and slides with little wear`;
      build();
      return g;
    },
  });
})();
