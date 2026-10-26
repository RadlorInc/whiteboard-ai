// "talljar cx cy k fill=0..1 lab=0 lit=glass|water" — a PART (PARTS.md, batch 5): the tall glass jar of water of
// resonance.js (a hydrometer jar), standing on the bench, origin the bench point under its middle. A thick round glass
// foot 11 cm across, a straight borosilicate cylinder 8 cm across and 60 cm tall above it with a rounded heel, a fire-
// polished beaded rim and a pouring lip; water stands at fill × the inside height (0.92 by default, as the scene), its
// meniscus ring on top. A resonance tube is placed at= its `water` anchor (the water surface on the axis) and slides
// there. Static. Built in mm (ISO.mm, LAB.vessel); anchors in cm: rim water inside.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const R = 40, H = 600, FOOT = 10, FR = 55, BASE = 8, WALL = 2.5;

  ISO.add({
    name: "talljar", title: "Tall jar of water (part)", compare: null,
    about: "A tall glass jar (8 cm across, 60 cm tall, on a glass foot) of water, for a resonance tube to stand in; a bench part. anchors: rim water inside",
    line: "talljar cx cy k fill=0..1 lab=0 lit=glass|water",
    demo: { line: "talljar 480 505 7 fill=0.92", script: [{ set: {}, hold: 1 }, { set: { lit: "water" }, hold: 1.5 }, { set: { lit: "glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const fill = ISO.clamp(ISO.num(o, "fill", 0.92), 0, 1);
      const V = LAB.vessel(Pm, [0, 0, FOOT], [[0, R - 3], [1.2, R - 0.8, 1], [3, R], [H, R]], { spout: true, wall: WALL, base: BASE });
      const level = BASE + (H - 4 - BASE) * fill;
      // the foot: a thick moulded glass disc with a bevel, the jar's heel fused into it (a faint ring round the join)
      const foot = ISO.tinted(ISO.T.glass, S(K.cylinder(0, 0, FR, 0, FOOT, Pm, 64, 2.5), { tone: "hi" })) +
        `<path d="${window.G.circleOf(LAB.Z([0, 0, FOOT]), 0, R + 3, Pm)}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.6" opacity=".6"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -FR, y: -FR, w: 2 * FR, d: 2 * FR, r: FR }, 0, FOOT, Pm)}"/>` +
        `<g data-name="glass">${foot}${V.back()}</g><g data-name="water">${V.liquid(level, "clear", { opacity: 0.6 })}</g><g data-name="glass">${V.front()}</g>` +
        (lab ? LAB.word(Pm, lab, [R + 14, 0, level - 60], "water", "#2b6cc4", { anchor: "start" }) + LAB.word(Pm, lab, [0, 0, FOOT + H + 30], "tall jar", "#556") : "");
      g.anchors = { rim: [0, 0, (FOOT + H) / 10], water: [0, 0, (FOOT + level) / 10], inside: [0, 0, (FOOT + BASE) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B27.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `tall glass jar · 8 cm across, 60 cm tall · water ${((level - BASE) / 10).toFixed(0)} cm deep (${Math.round(V.vol(level))} mL)`;
      B27.light(w, g, lit);
      return g;
    },
  });
})();
