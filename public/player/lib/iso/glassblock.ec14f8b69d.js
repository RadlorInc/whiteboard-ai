// "glassblock cx cy k lab=0 lit=block|frosted" — a PART (PARTS.md, batch 5): the rectangular glass (or perspex) block
// of refraction.js, lying flat on the paper or the bench, its origin the surface point under its middle. 10 × 6 ×
// 1.5 cm, long side along x: clear faces polished for a ray to pass through, its edges slightly eased, one end (+x)
// ground frosted the way school blocks are (so the block can be seen and handled), its far edges seen through it.
// A ray box's ray passes through it at its middle height (0.75 cm), as refraction.js draws it. Static.
// Anchors (cm): top (the middle of the top face), left, right, back, front (the middle of each side face, at the
// ray's height). Built in mm (ISO.mm).
(() => {
  const K = window.K, HX = 50, HY = 30, H = 15;

  ISO.add({
    name: "glassblock", title: "Glass block (part)", compare: null,
    about: "A rectangular glass block 10 × 6 × 1.5 cm for refraction: polished clear faces, one frosted end; a ray box's ray bends going in and out of it. anchors: top left right back front",
    line: "glassblock cx cy k lab=0 lit=block|frosted",
    demo: { line: "glassblock 480 300 44 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "block" }, hold: 1.2 }, { set: { lit: "frosted" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, B26 = window.B26;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.8 };
      // the frosted end: a matt white skin over the +x face (seen from this side, so drawn over the block)
      const end = (x) => K.pathOf([[x, -HY + 0.5, 0.4], [x, HY - 0.5, 0.4], [x, HY - 0.5, H - 0.6], [x, -HY + 0.5, H - 0.6]].map((p) => K.iso(p, Pm)), true);
      const grain = []; for (let i = 0; i < 90; i++) { const y = -HY + 1.5 + ((i * 37) % 97) / 97 * (2 * HY - 3), z = 1.2 + ((i * 53) % 89) / 89 * (H - 2.6); grain.push(K.iso([HX + 0.08, y, z], Pm)); }
      const frosted = `<path d="${end(HX + 0.05)}" fill="#dfe6eb" fill-opacity=".9" stroke="#9fb6c6" stroke-width="0.5"/>` + LAB.D(grain, { size: Math.max(0.3, 0.12 * window.G.scaleOf(Pm)), tone: "faint" });
      g.innerHTML = B26.GLASS_CSS + `<path class="iso-halo" d="${K.haloOf(plan, 0, 0.1, Pm)}"/>` +
        B26.glass("block", B26.farEdges(Pm, [[-HX, -HY], [HX, -HY], [HX, HY], [-HX, HY]], H) + S(K.slabOf(plan, 0, H, Pm, 2, 0.6), { tone: "hi" }) + B26.glint(Pm, [-HX + 14, HY - 6], [-HX + 34, -HY + 6], H, 2.2)) +
        `<g data-name="frosted">${frosted}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, -HY, H + 6], "glass block", "#556") + LAB.word(Pm, lab, [HX, 0, 0], "frosted end", "#556", { anchor: "start", dy: 14 });
      g.anchors = { top: [0, 0, H / 10], left: [-HX / 10, 0, H / 20], right: [HX / 10, 0, H / 20], back: [0, -HY / 10, H / 20], front: [0, HY / 10, H / 20] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B26.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "glass block 10 × 6 × 1.5 cm · n ≈ 1.5 · light bends toward the normal going in, away from it coming out";
      B26.light(w, g, lit);
      return g;
    },
  });
})();
