// "batterypack cx cy k lab=0 lit=case|plus|minus" — a PART (PARTS.md, batch 5): the boxed 6 V battery of the bell-jar
// set-up (belljar.js's battery box at real size), standing on the bench, origin the bench point under its middle.
// A 4R25-style lantern battery 9 × 7 × 8 cm: a red moulded case on a black base rim, a black lid with a raised panel,
// moulded grip ribs on the end, a printed label on the front (6 V), and two screw terminals on the lid (red +, black −)
// with brass studs, hex nuts and knurled caps. Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 45, HY = 35, HZ = 72, LID = 8, TX = 24;   // half sizes, case height to the lid, the lid, terminals at x ±TX

  function packSvg(P) {
    const B08 = window.B08, out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 2, r: 3 }, 0, 4, P)}"/>`];
    out.push('<g data-name="case">');
    // the black base rim, the red case, the lid with its raised panel and a seam under it
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 2, r: 3 }, 0, 4, P, 4, 0.6), { tone: "mid" })));
    out.push(ISO.tinted(B08.RED, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 2.5 }, 4, HZ - 4, P, 4, 0.4), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 2, r: 3 }, HZ, LID, P, 4, 0.8), { tone: "mid" }) +
      S(K.slabOf({ x: -HX + 6, y: -HY + 6, w: 2 * HX - 12, d: 2 * HY - 12, r: 2 }, HZ + LID, 1.2, P, 4, 0.4), { tone: "mid" })));
    // grip ribs moulded on the +x end: small solids from the base rim to the lid
    for (const y of [-21, -10.5, 0, 10.5, 21]) out.push(ISO.tinted(B08.RED, ISO.wbox(P, [HX, HX + 1.4], [y - 2, y + 2], [14, HZ - 10], "mid")));
    // the label on the front (+y): a cream sheet with its border, the voltage, the type, the + and − ends
    const f = HY + 0.15, at = (x, z) => [x, f, z], u = [1, 0, 0];
    out.push(ISO.tinted(B08.CREAM, ISO.wbox(P, [-HX + 6, HX - 6], [HY, HY + 0.1], [10, HZ - 8], "hi")));
    out.push(`<path d="${K.pathOf([at(-HX + 9, 13), at(HX - 9, 13), at(HX - 9, HZ - 11), at(-HX + 9, HZ - 11)].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#c0392b" stroke-width="${(G.scaleOf(P) * 0.9).toFixed(2)}"/>`);
    out.push(ISO.tinted(B08.RED, ISO.wbox(P, [-HX + 9, HX - 9], [HY + 0.1, HY + 0.2], [HZ - 23, HZ - 11], "mid")));
    out.push(LAB.faceText(P, at(0, HZ - 20), u, "DRY BATTERY", 7, "#ffffff"), LAB.faceText(P, at(-3, 25), u, "6 V", 22, "#2a2b2f"),
      LAB.faceText(P, at(0, 16.5), u, "4R25 · 6 volt lantern", 4.6, "#5f574a"), LAB.faceText(P, at(-HX + 17, 27), u, "−", 12, "#2a2b2f"), LAB.faceText(P, at(HX - 15, 27), u, "+", 12, "#c0392b"));
    // the polarity marks moulded into the lid beside each terminal (flat on top: text along x, its up toward −y)
    const top = HZ + LID + 1.25;
    out.push(LAB.faceText(P, [-TX, 15, top], u, "−", 9, "#8a8d93", [0, -1, 0]), LAB.faceText(P, [TX, 15, top], u, "+", 9, "#d0584a", [0, -1, 0]));
    out.push("</g>");
    const minus = B08.terminal(P, [-TX, -2, top], ISO.T.plastic), plus = B08.terminal(P, [TX, -2, top], B08.RED);
    out.push(`<g data-name="minus">${minus.svg}</g><g data-name="plus">${plus.svg}</g>`);
    return { svg: out.join(""), anchors: { plus: [TX / 10, -0.2, +(plus.top / 10).toFixed(2)], minus: [-TX / 10, -0.2, +(minus.top / 10).toFixed(2)] } };
  }

  ISO.add({
    name: "batterypack", title: "6 V battery (part)", compare: null,
    about: "A boxed 6 V lantern battery 9 × 7 × 8 cm: red case, black lid, printed label, two screw terminals on top (red +, black −) where the leads are clamped. anchors: plus minus",
    line: "batterypack cx cy k lab=0 lit=case|plus|minus",
    demo: { line: "batterypack 480 390 36", script: [{ set: {}, hold: 1 }, { set: { lit: "plus" }, hold: 1.2 }, { set: { lit: "minus" }, hold: 1.2 }, { set: { lit: "case" }, hold: 1.2 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const p = packSvg(Pm);
      g.innerHTML = p.svg + (lab ? CIRC.word(P, [HX / 10, 0, (HZ + LID) / 10 + 1], "6 V battery") : "");
      g.anchors = p.anchors;
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (q) => { if (q.lit !== undefined) { lit = q.lit; window.B08.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "6 V battery · + (red) and − (black) screw terminals on top";
      window.B08.light(w, g, lit);
      return g;
    },
  });
})();
