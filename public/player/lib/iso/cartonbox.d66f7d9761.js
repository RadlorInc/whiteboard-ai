// "cartonbox cx cy k lab=0 lit=box" — a PART (PARTS.md, batch 6): a small cardboard carton 28 × 28 × 20 cm, the
// kind a robot arm picks and places, standing on the floor or a table, origin the point under its middle. Brown
// board, the two top flaps meeting along x, packing tape over the seam and down the ends, "this way up" arrows and a
// white label on one side. The same carton robotarm carries in its fingers (carry=1). Static. anchors: top
(() => {
  const K = window.K;
  ISO.add({
    name: "cartonbox", title: "Cardboard carton (part)", compare: null,
    about: "A small cardboard carton 28 × 28 × 20 cm with taped flaps, the kind a robot picks and places; static. anchors: top",
    line: "cartonbox cx cy k lab=0 lit=box",
    demo: { line: "cartonbox 480 380 9 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "box" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const halo = { x: -15, y: -15, w: 30, d: 30, r: 1 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 20, P)}"/><g data-name="box">${B36.carton(P)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B36.word(P, [14, 14, 20], "carton, 2 kg");
      g.anchors = { top: [0, 0, 20] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B36.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "cardboard carton 28 × 28 × 20 cm · about 2 kg";
      B36.light(w, g, lit);
      return g;
    },
  });
})();
