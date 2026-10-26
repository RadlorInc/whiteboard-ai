// "tincan cx cy k label=red|green|yellow|blue lab=0 lit=tin|label|lid" — a PART (batch 6, groceries): a food tin standing
// on a shelf or a table, its origin the surface point under its middle. 7.5 cm across, 11 cm tall (a 400 g tin):
// tinplate body with rolled beads near the top and bottom, a double-seamed rim at each end, a plain paper label in one
// colour with two printed bands, "FOOD", "400 g" and a round picture spot (no brand), and a ring-pull lid: the score
// ring, the rivet and the flat tab. Tins stack: the next one stands on `top`. Static. World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const R = 3.75, H = 11, LABELS = { red: "#c8553d", green: "#3f7f3a", yellow: "#d89a2b", blue: "#2f6fae" };
  ISO.add({
    name: "tincan", title: "Food tin (part)", compare: null,
    about: "A 400 g food tin, 7.5 × 11 cm: ribbed tinplate body, a plain paper label, a ring-pull lid; a grocery item to price, count or stack on a shelf. anchors: top",
    line: "tincan cx cy k label=red|green|yellow|blue lab=0 lit=tin|label|lid",
    demo: { line: "tincan 480 420 30 label=red lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "label" }, hold: 1.5 }, { set: { lit: "lid" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const c = LABELS[B.pick(o.label, Object.keys(LABELS), "red")];
      // the helper draws the tin in three layers (body, label, top), each its own glowing part
      const tin = B.tin(P, [0, 0, 0], { r: R, h: H, label: c, detail: true, parts: true });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, H, P)}"/>` +
        `<g data-name="tin">${tin.tin}</g><g data-name="label">${tin.label}</g><g data-name="lid">${tin.lid}</g>` +
        (lab ? ISO.word(K.iso([R + 0.6, 0, H * 0.6], P), "food tin, 400 g", "#556", { size: 13, anchor: "start" }) : "");
      g.anchors = { top: [0, 0, H] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "food tin · 7.5 cm across, 11 cm tall · 400 g";
      B.light(w, g, lit);
      return g;
    },
  });
})();
