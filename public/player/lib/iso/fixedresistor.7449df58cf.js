// "fixedresistor cx cy k ohms=0.1..10000000 lab=0 lit=board|resistor|terminals" — a PART (PARTS.md, batch 5): a carbon
// film resistor on a small wooden mount (8 × 3 cm), its origin the surface point under the mount's middle. The
// resistor (11 mm body, 22 mm lead to lead) has its value in colour bands, read from the end they crowd: two digits,
// the multiplier, then the gold 5 % band apart (1 Ω = brown, black, gold, gold); its tinned leads bend down into two
// brass solder pillars, brass strips run on to two terminal posts (washer, hex nut, knurled cap). Anchors a (left) and
// b (right): the posts' tops, where a crocodile clip bites. Static. Built in mm; anchors in cm. The body and bands
// follow the resistor in circuit.js.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const BASE = { x: -40, y: -15, w: 80, d: 30, r: 3 }, BH = 8, PX = 15, TX = 30, PH = 9, RZ = BH + 12, HB = 5.5;
  const COLS = ["#1e1e1e", "#7a4a1c", "#c8322a", "#e07a1f", "#f1cc2a", "#3f9a46", "#2f62c4", "#7a46b0", "#8a8a8a", "#f4f4f0"];
  const GOLD = "#c9a640", SILVER = "#b9bcc1", BODY = ISO.tint("#f2e2c4", ["#c9ae7d", "#d6bd90", "#e2cca5", "#ecd8b6"], "#6e5530");
  // two digits and a multiplier (gold ×0.1, silver ×0.01) for a value in ohms
  const bandsOf = (ohm) => {
    let e = Math.floor(Math.log10(ohm)) - 1, d = Math.round(ohm / 10 ** e);
    if (d >= 100) { d = 10; e++; }
    return [COLS[Math.floor(d / 10)], COLS[d % 10], e === -1 ? GOLD : e === -2 ? SILVER : COLS[e], GOLD];
  };
  const nice = (ohm) => (ohm >= 1e6 ? `${+(ohm / 1e6).toPrecision(2)} MΩ` : ohm >= 1e3 ? `${+(ohm / 1e3).toPrecision(2)} kΩ` : `${+ohm.toPrecision(2)} Ω`);

  function resistorSvg(P, ohm) {
    const F = G.frameOf([0, 0, RZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [];
    // the tinned leads: out of each end cap, level to the pillar, then down into its top
    const lw = Math.max(0.6, G.scaleOf(P) * 0.6).toFixed(2), lead = (sx) => K.pathOf([[sx * HB, 0, RZ], [sx * (PX - 1.2), 0, RZ], [sx * PX, 0, RZ - 1.4], [sx * PX, 0, BH + PH - 0.2]].map((p) => K.iso(p, P)));
    out.push([-1, 1].map((sx) => `<path d="${lead(sx)}" fill="none" stroke="#55585e" stroke-width="${(+lw + 0.7).toFixed(2)}" stroke-linejoin="round"/><path d="${lead(sx)}" fill="none" stroke="#c9ccd1" stroke-width="${lw}" stroke-linejoin="round"/>`).join(""));
    // the body: a dog-bone with two end caps, then the bands painted round it
    out.push(ISO.tinted(BODY, S(G.lathe([[-HB, 0], [-HB, 1.5], [-HB + 0.4, 2.1, 1], [-3.6, 2.25, 1], [-2.8, 1.95, 1], [2.8, 1.95, 1], [3.6, 2.25, 1], [HB - 0.4, 2.1, 1], [HB, 1.5], [HB, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    // each band paint round the body: the half that faces us, from one edge of the band and back along the other
    const face = G.angleToward(F, G.viewOf(P)), half = (s, r, back) => Array.from({ length: 17 }, (_, i) => K.iso(G.pointOf(F, s, r, face + (back ? 1 - i / 8 : i / 8 - 1) * (Math.PI / 2)), P));
    bandsOf(ohm).forEach((c, i) => { const s = [-3.9, -1.9, -0.2, 3.9][i], r = Math.abs(s) > 3 ? 2.27 : 1.97; out.push(`<path d="${K.pathOf([...half(s - 0.45, r, false), ...half(s + 0.45, r, true)], true)}" fill="${c}" stroke="${LAB.mix(c, "#000000", 0.5)}" stroke-width="0.4" stroke-linejoin="round"/>`); });
    return out.join("");
  }
  const pillar = (P, x) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, 0, 2.6, BH, 0.6, P, 18), { tone: "mid" }) + S(K.cylinder(x, 0, 1.6, BH + 0.6, PH - 0.6, P, 16), { tone: "hi" })) +
    `<path d="${K.pathOf(K.circleRing(x, 0, 0.6, 10).map(([a, b]) => K.iso([a, b, BH + PH], P)), true)}" fill="#3a2e12"/>`;

  ISO.add({
    name: "fixedresistor", title: "Fixed resistor on a mount (part)", compare: null,
    about: "A carbon resistor (1 Ω by default) with its colour bands, its leads soldered to brass pillars on a small wooden mount with two terminal posts; a part to wire into a circuit. anchors: a b",
    line: "fixedresistor cx cy k ohms=0.1..10000000 lab=0 lit=board|resistor|terminals",
    demo: { line: "fixedresistor 480 330 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "resistor" }, hold: 1.2 }, { set: { lit: "terminals" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ohm = ISO.clamp(ISO.num(o, "ohms", 1), 0.1, 1e7);
      const a = CIRC.post(Pm, [-TX, 0, BH + 0.04], { r: 4.2, h: 9.5 }), b = CIRC.post(Pm, [TX, 0, BH + 0.04], { r: 4.2, h: 9.5 });
      const base = [`<path class="iso-halo" d="${K.haloOf(BASE, 0, BH, Pm)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(BASE, 0, BH, Pm, 4, 1), { tone: "mid" }))];
      // a paper label on the front edge with the value
      base.push(`<path d="${K.pathOf([[-12, 15.05, 1.6], [12, 15.05, 1.6], [12, 15.05, 6.4], [-12, 15.05, 6.4]].map((p) => K.iso(p, Pm)), true)}" fill="#fbf7ec" stroke="#8a7a5a" stroke-width=".5"/>`, LAB.faceText(Pm, [0, 15.1, 2.7], [1, 0, 0], `${nice(ohm)} ±5 %`, 3.4, "#3d4a5a"));
      g.innerHTML = `<g data-name="board">${base.join("")}</g><g data-name="terminals">${CIRC.strip(Pm, [-TX, 0], [-PX, 0], BH, 3)}${CIRC.strip(Pm, [PX, 0], [TX, 0], BH, 3)}${a.svg}${pillar(Pm, -PX)}</g>` +
        `<g data-name="resistor">${resistorSvg(Pm, ohm)}</g><g data-name="terminals">${pillar(Pm, PX)}${b.svg}</g>` + (lab ? CIRC.word(P, [TX / 10 + 0.4, 0, 1.6], `${nice(ohm)} resistor`) : "");
      g.anchors = { a: a.top.map((v) => v / 10), b: b.top.map((v) => v / 10) };
      const light = CIRC.lighter(g);
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `${nice(ohm)} carbon resistor ±5 % · bands ${bandsOf(ohm).map((c) => (c === GOLD ? "gold" : c === SILVER ? "silver" : ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"][COLS.indexOf(c)])).join(", ")}`;
      light(lit);
      return g;
    },
  });
})();
