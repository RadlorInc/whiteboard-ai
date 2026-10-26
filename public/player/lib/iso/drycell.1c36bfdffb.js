// "drycell cx cy k kind=AA|D aim=flat|up v=1.5 lab=0 lit=cell|plus|minus" — a PART (PARTS.md): a real dry cell, its
// origin the surface point under its middle. aim=flat lies it along x with + toward +x, up stands it on its − end.
// A steel can with crimped ends, a printed label sleeve (its voltage v, its size, a + and a −, a band at the + end),
// the insulating ring and the raised + button on one end, the flat − base on the other. AA: 50.5 mm × 14.5 mm,
// D: 61.5 mm × 34.2 mm. Anchors plus (the button's top) and minus (the middle of the base): where a clip bites.
// set({ kind, aim, v }) rebuilds it. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const SIZE = { AA: { len: 5.05, r: 0.725, br: 0.275, bh: 0.1 }, D: { len: 6.15, r: 1.71, br: 0.475, bh: 0.15 } };
  const LABEL = ISO.tint("#5585c2", ["#2f5f9c", "#3a6caa", "#4a7cba", "#5e8fca"], "#173a66");
  const BAND = ISO.tint("#e8b48e", ["#c98258", "#d6956d", "#e2a985", "#edbd9e"], "#6e3a1c");

  function cellSvg(P, kind, aim, v, lab) {
    const { len, r, br, bh } = SIZE[kind], h = len / 2;
    // the frame: s along the axis from the middle (− at −h, + at +h); flat lies at height r, up stands on its base
    const F = aim === "up" ? G.frameOf([0, 0, h], [0, 0, 1], [1, 0, 0], [0, 1, 0]) : G.frameOf([0, 0, r], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    const face = G.angleToward(F, G.viewOf(P)), at = (s, a = face, rr = r + 0.03) => G.pointOf(F, s, rr, a);
    const c = r * 0.06, l0 = -h + 0.14, l1 = h - 0.22, b0 = l1 - len * 0.16;
    const out = [];
    const plan = aim === "up" ? { x: -r, y: -r, w: 2 * r, d: 2 * r, r } : { x: -h, y: -r * 0.8, w: len, d: r * 1.6, r: r * 0.6 };
    out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>`);
    // the − base is the can's own flat end; the can is crimped round both ends
    const can = [[-h, 0], [-h, r - c * 2], [-h + c, r - c * 0.6, 1], [-h + c * 2.5, r], [h - c * 2.5, r], [h - c, r - c * 0.6, 1], [h, r - c * 2], [h, 0]];
    out.push(`<g data-name="minus">${ISO.tinted(ISO.T.steel, S(G.disc(-h - 0.01, -h, r * 0.8, F, P), { tone: "mid" }))}</g>`);
    out.push(`<g data-name="cell">${ISO.tinted(ISO.T.steel, S(G.lathe(can, F, P), { tone: "hi", inner: L(G.arcOf(F, -h + c * 2.5, r, P), { tone: "faint" }) }))}`);
    // the label sleeve and its band at the + end
    out.push(`${ISO.tinted(LABEL, S(G.lathe([[l0, r - 0.01], [l0, r + 0.02], [b0, r + 0.02], [b0, r - 0.01]], F, P), { tone: "mid" }))}` +
      ISO.tinted(BAND, S(G.lathe([[b0, r - 0.01], [b0, r + 0.021], [l1, r + 0.021], [l1, r - 0.01]], F, P), { tone: "mid" })));
    // printed along the label, on the side that faces us: size, voltage, the + and − signs
    const up = G.tangentOf(F, face), ax = F.a;
    const txt = (s, text, size, color = "#f4f8fc") => LAB.faceText(P, at(s), ax, text, size, color, up);
    const big = Math.min(r * 0.62, 0.62);
    out.push(txt(-h * 0.42, `${v} V`, big), txt(h * 0.2, kind, big * 0.8), txt(-h + 0.45 + big * 0.2, "−", big * 1.2), txt((b0 + l1) / 2, "+", big * 1.1, "#5a2a10"));
    out.push(L(G.arcOf(F, b0, r + 0.022, P), { tone: "faint" }), "</g>");
    // the + end: an insulating ring round the shoulder and the raised button on it
    out.push(`<g data-name="plus">${ISO.tinted(ISO.T.plastic, S(G.lathe([[h, br * 1.15], [h, r * 0.8], [h + 0.02, r * 0.8], [h + 0.02, br * 1.15]], F, P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.steel, S(G.lathe([[h, 0], [h, br], [h + bh * 0.7, br, 1], [h + bh, br * 0.8], [h + bh, 0]], F, P), { tone: "hi" })) + "</g>");
    const anchors = { plus: G.pointOf(F, h + bh, 0, 0).map((x) => +x.toFixed(3)), minus: G.pointOf(F, -h, 0, 0).map((x) => +x.toFixed(3)) };
    const word = lab ? CIRC.word(P, aim === "up" ? [r, 0, len + 0.4] : [h, 0, 2 * r + 0.3], `${kind} cell, ${v} V`) : "";
    return { svg: out.join("") + word, anchors };
  }

  ISO.add({
    name: "drycell", title: "Dry cell (part)", compare: null,
    about: "A real AA or D dry cell: steel can, printed label with its voltage, a raised + button and a flat − base; lies flat along x (+ toward +x) or stands up on its − end. anchors: plus minus",
    line: "drycell cx cy k kind=AA|D aim=flat|up v=1.5 lab=0 lit=cell|plus|minus",
    demo: { line: "drycell 480 380 60 kind=D", script: [{ set: {}, hold: 1 }, { set: { lit: "plus" }, hold: 1.2 }, { set: { kind: "AA", lit: "minus" }, hold: 1.2 }, { set: { kind: "D", aim: "up", lit: "" }, hold: 1.2 }, { set: { lit: "cell", v: 9 }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { kind: o.kind === "D" ? "D" : "AA", aim: o.aim === "up" ? "up" : "flat", v: ISO.clamp(ISO.num(o, "v", 1.5), 0, 99), lit: o.lit || "" };
      const build = () => {
        const c = cellSvg(P, st.kind, st.aim, +st.v.toFixed(2), lab);
        g.innerHTML = c.svg;
        g.anchors = c.anchors;
        CIRC.lighter(g)(st.lit);
      };
      g.set = (p) => {
        let again = false;
        if (p.kind !== undefined && SIZE[p.kind] && p.kind !== st.kind) { st.kind = p.kind; again = true; }
        if (p.aim !== undefined && (p.aim === "up" || p.aim === "flat") && p.aim !== st.aim) { st.aim = p.aim; again = true; }
        if (p.v !== undefined && Number.isFinite(+p.v)) { st.v = ISO.clamp(+p.v, 0, 99); again = true; }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build(); else CIRC.lighter(g)(st.lit);
      };
      g.update = () => false;
      g.readout = () => `${st.kind} dry cell · ${+st.v.toFixed(2)} V between + and − · ${SIZE[st.kind].len * 10} mm long`;
      build();
      return g;
    },
  });
})();
