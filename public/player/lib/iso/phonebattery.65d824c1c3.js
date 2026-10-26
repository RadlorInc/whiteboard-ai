// "phonebattery cx cy k lab=0 lit=cell|label|flex" — a PART (PARTS.md, batch 6): the phone's pouch battery lying flat,
// its origin the surface point under its middle, 50 × 90 × 5 mm: a silver laminate cell with soft sealed edges, a
// printed label (chemistry, 3.85 V, 3279 mAh, 12.6 Wh and the warning lines), and its flex leaving the near end with
// the board-to-board connector that plugs into the logic board. The same cell as in phone (B39.battery). Static.
// Built in mm, seen from the phone's bottom end (as phone and phoneboard) so the label reads; anchors in cm.
(() => {
  ISO.add({
    name: "phonebattery", title: "Phone battery (part)", compare: null,
    about: "A phone's flat lithium-ion pouch battery: silver cell, printed label with its voltage and capacity, and the flex connector that plugs into the logic board. anchors: plug",
    line: "phonebattery cx cy k lab=0 lit=cell|label|flex",
    demo: { line: "phonebattery 480 290 42 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "label" }, hold: 1.2 }, { set: { lit: "flex" }, hold: 1.2 }, { set: { lit: "cell" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, K = window.K;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = B.cam(ISO.mm(Pc), 180), lab = o.lab === "1";
      const c = B.battery(P, { x0: -25, x1: 25, y0: -45, y1: 45, z0: 0, h: 5, fx: 9, flen: 9 });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -25, y: -45, w: 50, d: 90, r: 3 }, 0, 1, P)}"/>${c.svg}<g data-part="words">${lab ? window.TECH.word(P, [-25, -20, 5], "phone battery, 3.85 V", { anchor: "start", dx: 10 }) : ""}</g>`;
      g.anchors = { plug: c.plug.map((v) => +(v / 10).toFixed(3)) };
      const w = ISO.writer(); let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "phone battery · lithium-ion pouch cell, 3.85 V × 3.279 Ah = 12.6 Wh · 50 × 90 × 5 mm, about 47 g";
      B.light(w, g, lit);
      return g;
    },
  });
})();
