// "tubecradle cx cy k lab=0 lit=cradle|pads" — a PART (PARTS.md, batch 5): a V-cradle (3 × 6 × 6 cm) that holds the
// He-Ne laser tube, standing on its board, origin the surface point under its middle. A painted steel foot plate with
// two screws, an aluminium block with a 90° V cut in its top (2 cm deep), and two cork pads lining the V. A 3 cm tube
// resting in it has its axis 6.1 cm over the surface (the laser set's beam height: lasermirror centres match).
// Reused from laser.js (its cradles). Static. anchors: axis (the tube's axis point over the cradle)
(() => {
  const K = window.K;
  const ALU = ["#9aa1a8", "#d6d9dc"], HX = 1.5;
  const V = [[-3, 0.4], [3, 0.4], [3, 6], [2, 6], [0, 4], [-2, 6], [-3, 6]];
  const CORK = ISO.tint("#e6c79a", ["#a87a48", "#b88a56", "#c89c68", "#d6ae7c"], "#5e3e1a");

  ISO.add({
    name: "tubecradle", title: "Laser tube V-cradle (part)", compare: null,
    about: "A V-cradle (3 × 6 × 6 cm) with cork pads that holds a 3 cm laser tube with its axis 6.1 cm over the board; two of them carry the He-Ne tube. anchors: axis",
    line: "tubecradle cx cy k lab=0 lit=cradle|pads",
    demo: { line: "tubecradle 480 380 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "pads" }, hold: 1.4 }, { set: { lit: "cradle" }, hold: 1.2 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, S = LAB.S, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const plate = { x: -2, y: -3.5, w: 4, d: 7, r: 0.3 };
      // a cork pad on each face of the V: a thin slab lying on the face, from the V's bottom to 0.3 short of its top
      const pad = (s) => { const at = (u, w, v) => { const y = s * (0.15 + v * 1.7), z = 4.15 + v * 1.7; return [u, y + s * -0.7071 * w, z + 0.7071 * w]; }; return ISO.box(at, P, [-HX + 0.1, HX - 0.1], [0, 0.18], [0, 1], "mid"); };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plate, 0, 0.4, P)}"/>` +
        `<g data-name="cradle">${ISO.tinted(ISO.T.paint, S(K.slabOf(plate, 0, 0.4, P, 3, 0.1), { tone: "lo" }))}${ISO.tinted(ISO.T.steel, D([[0, -2.8, 0.4], [0, 2.8, 0.4]].map((p) => K.iso(p, P)), { size: 0.7 }))}` +
        `${ISO.prismX(P, V, -HX, HX, ALU, "#e4e7ea", "#3f464d")}</g>` +
        `<g data-name="pads">${ISO.tinted(CORK, pad(-1) + pad(1))}</g><g data-part="words"></g>`;
      g.anchors = { axis: [0, 0, B18.LASER_Z] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [0, 3, 6], "V-cradle", "#556", { anchor: "start", dy: -6 });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B18.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "V-cradle 3 × 6 × 6 cm · cork-lined 90° V · holds a 3 cm tube with its axis 6.1 cm up";
      B18.light(w, g, lit);
      return g;
    },
  });
})();
