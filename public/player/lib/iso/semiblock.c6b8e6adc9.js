// "semiblock cx cy k lab=0 lit=block|mark" — a PART (PARTS.md, batch 5): the semicircular glass block of refraction.js
// (total internal reflection), lying flat on the paper, its origin the centre of its flat face, on the surface. 10 cm
// across, 1.5 cm thick: the flat face along x facing the room (+y), the curved face round the back (−y), every face
// polished, the edges eased, a small etched mark at the middle of the flat face (aim the ray there: a ray aimed at
// the centre meets the curved face square on, so it bends only at the flat face), its far edges seen through it.
// Static. Anchors (cm): centre (the flat face's middle, at mid height), curve (the curved face on the axis, at mid
// height), top (the top face over the centre). Built in mm (ISO.mm).
(() => {
  const K = window.K, R = 50, H = 15;

  ISO.add({
    name: "semiblock", title: "Semicircular glass block (part)", compare: null,
    about: "A semicircular glass block 10 cm across, 1.5 cm thick, for total internal reflection: a ray aimed through the curved side at the centre mark meets the flat face; past 42° it reflects back inside. anchors: centre curve top",
    line: "semiblock cx cy k lab=0 lit=block|mark",
    demo: { line: "semiblock 480 320 44 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "mark" }, hold: 1.2 }, { set: { lit: "block" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, B26 = window.B26;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ring = ISO.arc(0, 0, R, Math.PI, 2 * Math.PI, 48);
      // the etched centre mark: a short upright line on the flat face, and its tick on the top edge
      const mark = `<path d="${K.pathOf([K.iso([0, 0.05, 1.5], Pm), K.iso([0, 0.05, H - 1.5], Pm)])}${K.pathOf([K.iso([0, -0.1, H + 0.02], Pm), K.iso([0, -3, H + 0.02], Pm)])}" stroke="#3d5a70" stroke-width="0.8" data-free=""/>`;
      g.innerHTML = B26.GLASS_CSS + `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: R, r: 2 }, 0, 0.1, Pm)}"/>` +
        B26.glass("block", B26.farEdges(Pm, ring, H) + S(K.extrude(ring, 0, H, Pm), { tone: "hi" }) + B26.glint(Pm, [-24, -4], [-12, -36], H, 2.2)) +
        `<g data-name="mark">${mark}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, -R, H + 6], "semicircular block", "#556") + LAB.word(Pm, lab, [0, 0, 0], "centre", "#556", { dy: 16 });
      g.anchors = { centre: [0, 0, H / 20], curve: [0, -R / 10, H / 20], top: [0, 0, H / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B26.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "semicircular glass block, 10 cm across · n ≈ 1.5, critical angle 42° · aim the ray at the centre mark";
      B26.light(w, g, lit);
      return g;
    },
  });
})();
