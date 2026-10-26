// "phchart cx cy k lab=0 lit=card|colours|numbers" — a PART (PARTS.md, batch 5): the laminated universal-indicator
// pH chart lying flat on the bench, origin its middle on the surface. A 20.7 × 2.8 cm card 0.8 mm thick: fifteen
// 12 mm colour squares for pH 0 … 14 (red through green at 7 to violet), the number under each, and a printed line
// "acid · neutral · alkali" along the far edge. Reused from indicator.js (its chart). Static (the scene's pH marker is
// diagram, not part of the card). Built in mm; anchors in cm. anchors: ph0 ph7 ph14 (the middle of those squares).
(() => {
  const K = window.K;
  const SQ = 13, X0 = -7.5 * SQ, Y0 = -10, CARD = { x: X0 - 6, y: -14, w: 15 * SQ + 12, d: 28, r: 2 }, TH = 0.8;
  const CARDT = ISO.tint("#fbfbf9", ["#cfd1d4", "#dadcdf", "#e6e7e9", "#f0f1f2"], "#6c737c");

  ISO.add({
    name: "phchart", title: "pH colour chart (part)", compare: null,
    about: "A laminated universal-indicator chart (20.7 × 2.8 cm) lying on the bench: fifteen colour squares for pH 0 to 14 with their numbers, to match a test tube or a beaker against. anchors: ph0 ph7 ph14",
    line: "phchart cx cy k lab=0 lit=card|colours|numbers",
    demo: { line: "phchart 480 300 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "colours" }, hold: 1.5 }, { set: { lit: "numbers" }, hold: 1.5 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", Z = TH + 0.01;
      const sq = (i, y0, y1, z) => [[X0 + i * SQ + 0.5, y0], [X0 + (i + 1) * SQ - 0.5, y0], [X0 + (i + 1) * SQ - 0.5, y1], [X0 + i * SQ + 0.5, y1]].map(([x, y]) => K.iso([x, y, z], Pm));
      const colours = CHEM.UI.map((c, i) => `<path d="${K.pathOf(sq(i, Y0, Y0 + 12, Z), true)}" fill="${c}" stroke="#ffffff" stroke-width="0.5"/>`).join("");
      const numbers = CHEM.UI.map((c, i) => `<g transform="${K.topMatrix([X0 + (i + 0.5) * SQ, Y0 + 17.5], Z, Pm, "x")}"><text text-anchor="middle" style="font:700 5px 'Helvetica Neue',Arial,sans-serif" fill="#33404c">${i}</text></g>`).join("");
      const words = [["ACID", X0 + 3 * SQ], ["NEUTRAL", 0], ["ALKALI", X0 + 12 * SQ]].map(([s, x]) => `<g transform="${K.topMatrix([x, Y0 + 23], Z, Pm, "x")}"><text text-anchor="middle" style="font:600 3.4px 'Helvetica Neue',Arial,sans-serif;letter-spacing:.4px" fill="#6c737c">${s}</text></g>`).join("");
      // a thin rule between the colour row and the numbers, from the first square's edge to the last's (printed: free)
      const rule = LAB.L(K.pathOf([K.iso([X0 + 0.5, Y0 + 13.2, Z], Pm), K.iso([X0 + 15 * SQ - 0.5, Y0 + 13.2, Z], Pm)]), { tone: "faint", free: true });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(CARD, 0, TH, Pm)}"/>` +
        `<g data-name="card">${ISO.tinted(CARDT, S(K.slabOf(CARD, 0, TH, Pm, 3, 0.2), { tone: "lo", crease: "none" }))}${words}${rule}</g>` +
        `<g data-name="colours">${colours}</g><g data-name="numbers">${numbers}</g><g data-part="words"></g>`;
      g.anchors = { ph0: [(X0 + 0.5 * SQ) / 10, (Y0 + 6) / 10, TH / 10], ph7: [0, (Y0 + 6) / 10, TH / 10], ph14: [(X0 + 14.5 * SQ) / 10, (Y0 + 6) / 10, TH / 10] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, CARD.y + CARD.d, 0], "universal indicator chart", "#556", { dy: 18 });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; window.B18.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "universal indicator chart · pH 0–2 red (strong acid), 3–6 orange to yellow (weak acid), 7 green (neutral), 8–11 blue (weak alkali), 12–14 violet (strong alkali)";
      window.B18.light(w, g, lit);
      return g;
    },
  });
})();
