// "canstand cx cy k lab=0 lit=legs|rails|top" — a PART (PARTS.md, batch 24): a wooden stand 15 × 15 cm and 30 cm tall
// that lifts a can (spoutcan) so its jets have room to fall, origin the floor point under its middle. Four 2 cm square
// legs on rubber feet, a rail between each pair 7 cm up, an apron under the top, and a 1.5 cm top plate screwed to
// the legs (anchor top: its middle, where the can stands). Reused from pressure.js (the stand). Static.
// World units: 1 = 1 cm. anchors: top.
(() => {
  const K = window.K;
  const HW = 7.5, LG = 2, H = 30, TOP = 1.5, AP = 2.2, RZ = [6, 7.4];

  ISO.add({
    name: "canstand", title: "Can stand (part)", compare: null,
    about: "A four-leg wooden stand 15 × 15 × 30 cm with rails, an apron and a top plate, to lift a can of water above a tray. anchors: top",
    line: "canstand cx cy k lab=0 lit=legs|rails|top",
    demo: { line: "canstand 480 420 10", script: [{ set: {}, hold: 1 }, { set: { lit: "legs" }, hold: 1.2 }, { set: { lit: "rails" }, hold: 1.2 }, { set: { lit: "top" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const W = (x, y, z, tone = "mid") => ISO.tinted(ISO.T.wood, ISO.wbox(P, x, y, z, tone)), a = HW - LG, items = [];
      // legs (rubber foot under each), rails and apron boards between them, each sorted by depth
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        const x = sx > 0 ? [a, HW] : [-HW, -a], y = sy > 0 ? [a, HW] : [-HW, -a];
        items.push({ at: [(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, 0], name: "legs", svg: ISO.tinted(ISO.T.rubber, ISO.wbox(P, [x[0] + 0.15, x[1] - 0.15], [y[0] + 0.15, y[1] - 0.15], [0, 0.4], "lo")) + W(x, y, [0.4, H - TOP]) });
      }
      for (const s of [-1, 1]) {
        const y = s > 0 ? [HW - 1.2, HW - 0.2] : [-HW + 0.2, -HW + 1.2], x = s > 0 ? [HW - 1.2, HW - 0.2] : [-HW + 0.2, -HW + 1.2];
        items.push({ at: [0, s * HW, 0], name: "rails", svg: W([-a, a], y, RZ) + W([-a, a], y, [H - TOP - AP, H - TOP]) });
        items.push({ at: [s * HW, 0, 0], name: "rails", svg: W(x, [-a, a], RZ) + W(x, [-a, a], [H - TOP - AP, H - TOP]) });
      }
      items.sort((p, q) => K.depthOf(p.at, P) - K.depthOf(q.at, P));
      const plan = { x: -HW - 0.3, y: -HW - 0.3, w: 2 * HW + 0.6, d: 2 * HW + 0.6, r: 0.4 };
      const screws = K.dotsSvg([-1, 1].flatMap((sx) => [-1, 1].map((sy) => K.iso([sx * (HW - 1), sy * (HW - 1), H], P))), { size: 0.5 });
      const grain = K.lineSvg([-3.2, -0.6, 2.4].map((y) => K.pathOf([K.iso([-HW + 0.5, y, H + 0.005], P), K.iso([HW - 0.5, y + 0.6, H + 0.005], P)])).join(""), { tone: "faint", free: true });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HW, y: -HW, w: 2 * HW, d: 2 * HW, r: 0.5 }, 0, 0.02, P)}"/>` + items.map((p) => `<g data-name="${p.name}">${p.svg}</g>`).join("") +
        `<g data-name="top">${ISO.tinted(ISO.T.wood, K.solidSvg(K.slabOf(plan, H - TOP, TOP, P, 3, 0.15), { tone: "hi" }))}${grain}${screws}</g>` +
        (lab ? window.CIRC.word(P, [HW, HW, H * 0.6], "stand") : "");
      g.anchors = { top: [0, 0, H] };
      let lit = o.lit || "";
      const light = window.CIRC.lighter(g);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => "wooden can stand · 15 × 15 cm top, 30 cm high · lifts the can so its jets fall 30 cm";
      light(lit);
      return g;
    },
  });
})();
