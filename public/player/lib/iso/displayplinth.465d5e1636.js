// "displayplinth cx cy k c=purple|blue|green|white lab=0 lit=plinth|plate" — a PART (PARTS.md, batch 5): the wooden
// display plinth a mineral specimen stands on (crystals.js), 12 × 9 cm and 2.6 cm high, its origin the surface point
// under its middle. A base slab with eased corners and a moulding line, a raised top block inset 8 mm, and a brass name
// plate 6 × 0.9 cm pinned to the top block's front with the mineral's name and formula engraved (c: purple amethyst,
// white rock crystal, blue copper(II) sulfate, green fluorite), four felt pads under the corners. Anchor `top` = the
// middle of the top block, where a mineralrock sits. Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const PL = { x: -60, y: -45, w: 120, d: 90, r: 4 }, ZT = 26, ZB = 12, FELT = 1.2;
  const FELTC = ISO.tint("#6b5a4a", ["#3a2f25", "#43372c", "#4d4033", "#57493b"], "#241b13");

  ISO.add({
    name: "displayplinth", title: "Display plinth (part)", compare: null,
    about: "A wooden display plinth with a raised top block and a brass name plate engraved with the mineral's name and formula; a rock specimen sits on its top. anchors: top",
    line: "displayplinth cx cy k c=purple|blue|green|white lab=0 lit=plinth|plate",
    demo: { line: "displayplinth 480 330 40 c=purple", script: [{ set: {}, hold: 1 }, { set: { lit: "plate" }, hold: 1.2 }, { set: { lit: "plinth" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", m = B10.mineral(o.c);
      const top = K.insetPlan(PL, 8), fy = top.y + top.d, out = [`<path class="iso-halo" d="${K.haloOf(PL, 0, ZT, Pm)}"/>`];
      // felt pads (only their near edges show), the base slab with its moulding line, the raised top block
      out.push(ISO.tinted(FELTC, K.corners(PL, 9).map(([x, y]) => S(K.cylinder(x, y, 6, 0, FELT, Pm, 16), { tone: "lo", crease: "none" })).join("")));
      out.push(`<g data-name="plinth" style="${ISO.T.wood}">${S(K.slabOf(PL, FELT, ZB - FELT, Pm, 4, 1), { tone: "mid", inner: L(K.sideSeam(PL, 6.5, Pm, 4), { tone: "faint" }) })}` +
        `${S(K.slabOf(top, ZB, ZT - ZB, Pm, 3, 0.8), { tone: "mid" })}</g>`);
      // the brass plate on the top block's front: 60 × 9 mm, two pins, the name and the formula engraved
      const [name, formula] = m.name.includes(" · ") ? m.name.split(" · ") : m.name.split(", ");
      const face = (z, txt, size, wt) => `<g transform="${ISO.faceMatrix(Pm, [0, fy + 1.1, z], 1)}"><text text-anchor="middle" style="font:${wt} ${size}px 'Helvetica Neue',Arial,sans-serif" fill="${wt === 700 ? "#4a3a10" : "#6b5114"}">${ISO.esc(txt)}</text></g>`;
      out.push(`<g data-name="plate" style="${ISO.T.brass}">${ISO.wbox(Pm, [-30, 30], [fy, fy + 1], [14.5, 23.5], "hi")}` +
        K.dotsSvg([K.iso([-27.5, fy + 1.05, 19], Pm), K.iso([27.5, fy + 1.05, 19], Pm)], { size: 0.5 }) +
        face(20.4, name.toUpperCase(), 3.4, 700) + face(16.6, formula || "", 2.4, 600) + "</g>");
      g.innerHTML = out.join("") + (lab ? LAB.word(Pm, lab, [PL.x + PL.w, 0, ZT + 6], "display plinth", "#556", { anchor: "start" }) : "");
      g.anchors = { top: [0, 0, ZT / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B10.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `display plinth 12 × 9 cm, 2.6 cm high · plate: ${m.name}`;
      B10.light(w, g, lit);
      return g;
    },
  });
})();
