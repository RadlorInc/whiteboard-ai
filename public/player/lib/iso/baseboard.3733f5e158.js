// "baseboard cx cy k lab=0 lit=board|plate" — a PART (PARTS.md, batch 5): the varnished wooden baseboard the gas-law
// apparatus stands on (gaslaw.js's board, real size): 30 × 14.6 cm, 6 mm thick, on four turned feet 3 mm tall with
// rubber pads, its origin the bench point under its middle. A routed groove round the top, a countersunk screw in each
// corner, two brass threaded inserts at the back (where a retort rod screws in) and a small maker's plate at the front
// right. Static. Built in mm (ISO.mm); the anchor in cm: top = the middle of its top face.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const BOARD = { x: -150, y: -73, w: 300, d: 146, r: 4 }, H = 6, FEET = 3, TOP = H + FEET;

  ISO.add({
    name: "baseboard", title: "Apparatus baseboard (part)", compare: null,
    about: "The wooden baseboard a gas-law (or any bench) apparatus stands on: 30 × 14.6 cm, 6 mm thick on four feet, a groove round the top, corner screws, brass inserts at the back. anchors: top",
    line: "baseboard cx cy k lab=0 lit=board|plate",
    demo: { line: "baseboard 480 300 24 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "board" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), Pt = B15.shift(Pm, [0, 0, TOP]), lab = o.lab === "1";
      const inserts = [-110, -70].map((x) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, -50, 4.2, 0, 0.4, Pt, 20), { tone: "hi", inner: K.lineSvg(K.ring(x, -50, 2, 0.4, Pt, 14), { tone: "mid" }) }))).join("");
      g.innerHTML = `<g data-name="board">${ISO.baseboard(Pt, BOARD, { h: H, feet: FEET, tint: ISO.T.wood })}${inserts}</g>` +
        `<g data-name="plate">${ISO.tinted(ISO.T.brass, ISO.plate(Pt, { x: 92, y: 44, w: 40, d: 16, r: 1.5 }))}</g>` +
        (lab ? ISO.word(K.iso([150, 0, TOP + 20], Pm), "baseboard", "#444", { size: 13, anchor: "start" }) : "");
      g.anchors = { top: [0, 0, TOP / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "wooden baseboard · 30 × 14.6 cm · top 9 mm above the bench";
      B15.light(w, g, lit);
      return g;
    },
  });
})();
