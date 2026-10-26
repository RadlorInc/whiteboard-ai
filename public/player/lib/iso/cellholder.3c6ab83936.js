// "cellholder cx cy k cells=1..4 lab=0 lit=holder|clips|cells" — a PART (PARTS.md, batch 5): a black plastic holder
// for AA cells lying side by side, each along x, its origin the surface point under its middle. Each slot is 6 cm
// long, 1.5 cm wide; the tray has a floor, low side walls (so the cells show) and tall end walls. In each slot the
// cell's − base presses a steel coil spring and its + button a flat brass tab; the cells lie head to tail and brass
// straps on the end walls join them in series, so the holder gives cells × 1.5 V between its two brass solder tags.
// Anchors plus and minus: the tops of those tags, where a crocodile clip bites. Static. Built in mm; anchors in cm.
// The layout follows the holder in circuit.js ("cell"), the cells the drycell part's AA cell.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const LEN = 50.5, R = 7.25, IN = 28.75, WALL = 2, FL = 1.5, PITCH = 15, ZS = 9, ZE = 16, CZ = FL + R, SPR = 7;
  const LABEL = ISO.tint("#5585c2", ["#2f5f9c", "#3a6caa", "#4a7cba", "#5e8fca"], "#173a66");
  const BAND = ISO.tint("#e8b48e", ["#c98258", "#d6956d", "#e2a985", "#edbd9e"], "#6e3a1c");
  const plastic = (svg) => ISO.tinted(ISO.T.plastic, svg);

  // one AA cell lying at y along x, + toward sx (±1): steel can, label sleeve, + band, the raised button
  function cellSvg(P, x, y, sx) {
    const F = G.frameOf([x, y, CZ], [sx, 0, 0], [0, 1, 0], [0, 0, 1]), h = LEN / 2, c = 0.45, l0 = -h + 1.4, l1 = h - 2.2, b0 = l1 - 8;
    const out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[-h, 0], [-h, R - 0.9], [-h + c, R - 0.3, 1], [-h + 1.1, R], [h - 1.1, R], [h - c, R - 0.3, 1], [h, R - 0.9], [h, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    out.push(ISO.tinted(LABEL, S(G.lathe([[l0, R - 0.1], [l0, R + 0.15], [b0, R + 0.15], [b0, R - 0.1]], F, P, { steps: 28 }), { tone: "mid" })));
    out.push(ISO.tinted(BAND, S(G.lathe([[b0, R - 0.1], [b0, R + 0.16], [l1, R + 0.16], [l1, R - 0.1]], F, P, { steps: 28 }), { tone: "mid" })));
    // the print reads along +x whichever way the cell lies (a right-handed frame for the words)
    const Ft = G.frameOf([x, y, CZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), ft = G.angleToward(Ft, G.viewOf(P)), up = G.tangentOf(Ft, ft);
    out.push(LAB.faceText(P, G.pointOf(Ft, -sx * h * 0.25, R + 0.2, ft), Ft.a, "AA 1.5 V", 4, "#f4f8fc", up), LAB.faceText(P, G.pointOf(Ft, (sx * (b0 + l1)) / 2, R + 0.2, ft), Ft.a, "+", 5, "#5a2a10", up));
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[h, 3], [h, 5.8], [h + 0.2, 5.8], [h + 0.2, 3]], F, P, { steps: 20 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[h, 0], [h, 2.75], [h + 0.7, 2.75, 1], [h + 1, 2.2], [h + 1, 0]], F, P, { steps: 20 }), { tone: "hi" })));
    return out.join("");
  }
  // the coil spring from the end wall's inner face (x = ex) to a cell's − base, along sx (into the slot)
  function springSvg(P, ex, y, sx) {
    const pts = [], n = 90, turns = 4;
    for (let i = 0; i <= n; i++) { const u = i / n, a = u * turns * 2 * Math.PI; pts.push(K.iso([ex + sx * u * SPR, y + 4 * Math.cos(a), CZ + 4 * Math.sin(a)], P)); }
    const w = Math.max(0.6, G.scaleOf(P) * 0.7).toFixed(2), d = K.pathOf(pts);
    return `<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(+w + 0.8).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c7c9cd" stroke-width="${w}" stroke-linejoin="round"/>` +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, sx > 0 ? [ex, ex + 0.6] : [ex - 0.6, ex], [y - 4.5, y + 4.5], [CZ - 4.5, CZ + 4.5], "mid"));
  }
  // the flat brass tab on the inner face of the end wall at ex, the + button presses it
  const tabSvg = (P, ex, y, sx) => ISO.tinted(ISO.T.brass, ISO.wbox(P, sx > 0 ? [ex, ex + 0.6] : [ex - 0.6, ex], [y - 4, y + 4], [FL + 1.5, CZ + 5], "hi"));

  ISO.add({
    name: "cellholder", title: "Cell holder (part)", compare: null,
    about: "A black plastic holder of 1 to 4 AA cells lying side by side, head to tail: coil springs and brass tabs at the ends, brass straps joining the cells in series, and two brass solder tags giving cells × 1.5 V. anchors: plus minus",
    line: "cellholder cx cy k cells=1..4 lab=0 lit=holder|clips|cells",
    demo: { line: "cellholder 480 330 52 cells=2 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "clips" }, hold: 1.2 }, { set: { lit: "cells" }, hold: 1.2 }, { set: { lit: "holder" }, hold: 1 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const n = ISO.clamp(Math.round(ISO.num(o, "cells", 2)), 1, 4), HY = (n * PITCH) / 2 + 1.5, OX = IN + WALL;
      const ys = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * PITCH), sxOf = (i) => (i % 2 ? -1 : 1);
      // the series chain: cell 0's − at −x is the minus tag; each + joins the next cell's − at the same end; the last + is plus
      const lastEnd = sxOf(n - 1), tagAt = (ex, y) => ISO.tinted(ISO.T.brass, ISO.wbox(Pm, [ex - 0.4, ex + 0.4], [y - 2.5, y + 2.5], [ZE, ZE + 7], "hi")) +
        `<path d="${G.circleOf(G.frameAlong([ex + 0.45, y, ZE + 4.5], [1, 0, 0]), 0, 1, Pm, 14)}" fill="#2a2216"/>`;
      const strapAt = (ex, y0, y1) => ISO.tinted(ISO.T.brass, ISO.wbox(Pm, ex > 0 ? [ex, ex + 0.5] : [ex - 0.5, ex], [y0 - 2, y1 + 2], [ZE - 5, ZE - 1], "hi"));
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -OX, y: -HY, w: 2 * OX, d: 2 * HY, r: 2 }, 0, ZE, Pm)}"/>`];
      // the tray, back to front: floor, far end wall (−x), back side wall
      out.push(`<g data-name="holder">${plastic(ISO.wbox(Pm, [-OX, OX], [-HY, HY], [0, FL], "lo") + ISO.wbox(Pm, [-OX, -IN], [-HY, HY], [FL, ZE], "mid") + ISO.wbox(Pm, [-IN, IN], [-HY, -HY + 1.5], [FL, ZS], "mid"))}`);
      // the floor's moulded ribs between the slots (printed: they end on the walls)
      out.push(L(ys.slice(1).map((y) => K.pathOf([[-IN, y - PITCH / 2, FL + 0.05], [IN, y - PITCH / 2, FL + 0.05]].map((p) => K.iso(p, Pm)))).join(""), { tone: "faint", free: true }), "</g>");
      out.push(`<g data-name="clips">${tagAt(-OX, ys[0])}${lastEnd < 0 ? tagAt(-OX, ys[n - 1]) : ""}</g>`);
      // each slot: the contact at −x, the cell, the contact at +x
      ys.forEach((y, i) => {
        const sx = sxOf(i), minusX = sx > 0 ? -IN : IN;
        const cMinus = springSvg(Pm, minusX, y, -Math.sign(minusX)), cPlus = tabSvg(Pm, -minusX, y, Math.sign(minusX));
        out.push(`<g data-name="clips">${minusX < 0 ? cMinus : cPlus}</g>`, `<g data-name="cells" data-part="cell${i}"></g>`, `<g data-name="clips">${minusX < 0 ? cPlus : cMinus}</g>`);
      });
      // the near end wall (+x), its straps and tag, then the low front wall
      out.push(`<g data-name="holder">${plastic(ISO.wbox(Pm, [IN, OX], [-HY, HY], [FL, ZE], "mid"))}</g>`);
      const straps = [];
      for (let i = 0; i < n - 1; i++) if (sxOf(i) > 0) straps.push(strapAt(OX, ys[i], ys[i + 1]));
      out.push(`<g data-name="clips">${straps.join("")}${lastEnd > 0 ? tagAt(OX, ys[n - 1]) : ""}</g>`);
      out.push(`<g data-name="holder">${plastic(ISO.wbox(Pm, [-IN, IN], [HY - 1.5, HY], [FL, ZS], "mid"))}</g>`);
      g.innerHTML = out.join("") + (lab ? CIRC.word(P, [OX / 10 + 0.6, 0, 0.4], `${n} × 1.5 V = ${n * 1.5} V`) : "");
      g.anchors = { minus: [-OX / 10, ys[0] / 10, (ZE + 7) / 10], plus: [(lastEnd * OX) / 10, ys[n - 1] / 10, (ZE + 7) / 10] };
      let light = CIRC.lighter(g), lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      // the cells (smooth cans and labels) in a second slice of the build budget, into their places between the contacts
      ISO.later(() => {
        ys.forEach((y, i) => { const e = g.querySelector(`[data-part="cell${i}"]`); e.innerHTML = cellSvg(Pm, (sxOf(i) * SPR) / 2, y, sxOf(i)); e._fresh = true; });
        light = CIRC.lighter(g); light(lit);
      });
      g.update = () => false;
      g.readout = () => `${n} AA cell${n > 1 ? "s" : ""} in series · ${n} × 1.5 V = ${n * 1.5} V between the tags`;
      light(lit);
      return g;
    },
  });
})();
