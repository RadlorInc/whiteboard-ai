// "electrodestrip cx cy k kind=zinc|copper lab=0 lit=strip|terminal" — a PART (PARTS.md, batch 5): a metal electrode
// strip standing upright in a beaker, its origin the middle of its bottom edge (place it at=beaker.inside az=1, so it
// stands clear of the glass floor). 1.8 cm wide, 0.24 cm thick, 14 cm tall, its face square to y (toward the reader):
// sheared edges with a fine bevel, a chemical symbol (Zn or Cu) stamped near the top, a brass terminal (screw, washer
// and knurled nut) through a hole 1.2 cm from the top where a crocodile clip or a lead goes, and the metal's own look:
// zinc a dull blue-grey with a pale crystalline mottle, copper salmon-pink with a darker tarnish. Static.
// Reused from ecell.js (its strips, ZINC tint, clip height). World units: 1 = 1 cm. anchors: top terminal.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HW = 0.9, HT = 0.12, TOP = 14, TZ = TOP - 1.2;
    const KINDS = { zinc: { side: ["#8f959c", "#c2c6cb"], face: "#c9cdd2", sym: "Zn", spot: "#f4f6f8", ink: "#4a5058", name: "zinc" }, copper: { side: ["#b06c45", "#e2a985"], face: "#e3a27c", sym: "Cu", spot: "#9a5332", ink: "#6e3a1c", name: "copper" } };
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function stripSvg(P, kd) {
    const y = HT + 0.004, at = (x, z) => K.iso([x, y, z], P), out = [];
    // the strip: a thin slab, its top corners clipped
    out.push(ISO.prismY(P, [[-HW, 0], [HW, 0], [HW, TOP - 0.25], [HW - 0.25, TOP], [-HW + 0.25, TOP], [-HW, TOP - 0.25]], -HT, HT, kd.side, kd.face, kd.ink));
    // the metal's look on the face: mottle (zinc spangle) or tarnish spots, low and faint
    const spots = [];
    for (let i = 0; i < 26; i++) { const h1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, h2 = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1, x = -HW + 0.2 + h1 * (2 * HW - 0.4), z = 0.4 + h2 * (TOP - 3); spots.push(`<ellipse cx="${at(x, z)[0].toFixed(1)}" cy="${at(x, z)[1].toFixed(1)}" rx="${(G.scaleOf(P) * (0.08 + 0.06 * (i % 3))).toFixed(2)}" ry="${(G.scaleOf(P) * (0.12 + 0.05 * (i % 2))).toFixed(2)}"/>`); }
    out.push(`<g fill="${kd.spot}" opacity=".28">${spots.join("")}</g>`);
    // a long rolling streak down the face (the mill's direction), the stamped symbol under the terminal
    out.push(`<path d="${K.pathOf([at(-HW * 0.45, 0.3), at(-HW * 0.45, TOP - 2.2)])}${K.pathOf([at(HW * 0.3, 0.3), at(HW * 0.3, TOP - 2.4)])}" stroke="#ffffff" stroke-width="${Math.max(0.4, G.scaleOf(P) * 0.05).toFixed(2)}" opacity=".45"/>`);
    out.push(window.LAB.faceText(P, [0, y + 0.002, TZ - 1.6], [1, 0, 0], kd.sym, 0.6, kd.ink));
    return out.join("");
  }
  // the terminal through the hole: the screw's head behind (−y), the washer, the knurled brass nut on the near face
  function terminalSvg(P) {
    const F = Y([0, 0, TZ]), out = [];
    out.push(ISO.tinted(ISO.T.brass, S(G.disc(-HT - 0.18, -HT, 0.42, F, P), { tone: "mid" })));
    return {
      back: out.join(""),
      front: ISO.tinted(ISO.T.brass, S(G.disc(HT, HT + 0.06, 0.5, F, P), { tone: "mid" }) + S(G.disc(HT + 0.06, HT + 0.4, 0.42, F, P), { tone: "hi", inner: L(G.ribsOf(F, HT + 0.06, HT + 0.4, 0.42, 14, P, { seams: true }), { tone: "lo" }) }) +
        S(G.disc(HT + 0.4, HT + 0.62, 0.14, F, P), { tone: "mid" })),
    };
  }

  ISO.add({
    name: "electrodestrip", title: "Electrode strip (part)", compare: null,
    about: "A metal electrode strip (zinc or copper) 1.8 cm wide and 14 cm tall that stands in a beaker of solution, with a brass terminal near the top for a lead. anchors: top terminal",
    line: "electrodestrip cx cy k kind=zinc|copper lab=0 lit=strip|terminal",
    demo: { line: "electrodestrip 480 470 27 kind=zinc lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "strip" }, hold: 1.4 }, { set: { lit: "terminal" }, hold: 1.4 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const kd = KINDS[o.kind] || KINDS.zinc, term = terminalSvg(P);
      g.innerHTML = `<g data-name="terminal">${term.back}</g><g data-name="strip">${stripSvg(P, kd)}</g><g data-name="terminal">${term.front}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [HW + 0.3, 0, TOP * 0.55], `${kd.name} electrode`, kd.ink, { anchor: "start" }) + LAB.word(P, lab, [HW + 0.3, HT, TZ], "terminal", "#556", { anchor: "start" });
      g.anchors = { top: [0, 0, TOP], terminal: [0, HT + 0.62, TZ] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `${kd.name} electrode strip · 1.8 × 14 cm, 0.24 cm thick · ${kd.name === "zinc" ? "the negative electrode in a zinc–copper cell" : "the positive electrode in a zinc–copper cell"}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
