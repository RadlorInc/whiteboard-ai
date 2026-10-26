// "phonestand cx cy k lab=0 lit=base|feet|post|saddle" — a PART (b34): the headphone stand of headphones.js at real
// size, its origin the surface point under its middle. A weighted aluminium base slab on four rubber feet, a turned
// collar with its cap screw, a 14 mm post 23 cm tall, a top collar and the padded saddle the headband rests on (a
// rubber pad with a stitched seam). Anchor `saddle` = the saddle's top middle, where overearphones hang (at=stand.saddle).
// Static. Built in mm.
(() => {
  const K = window.K, T = window.TECH;
  const BASE = { x: -60, y: -60, w: 120, d: 120, r: 40 }, PT = 247, ST = 259, SAD = { x: -22, y: -16, w: 44, d: 32, r: 6 };
  ISO.add({
    name: "phonestand", title: "Headphone stand (part)", compare: null,
    about: "A headphone stand: a weighted base slab on rubber feet, a post and a padded saddle on top that the headband rests on. anchors: saddle",
    line: "phonestand cx cy k lab=0 lit=base|feet|post|saddle",
    demo: { line: "phonestand 480 430 13 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "saddle" }, hold: 1.2 }, { set: { lit: "post" }, hold: 1.2 }, { set: { lit: "base" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf(BASE, 0, 14, Pm)}"/>`);
      const feet = K.corners(BASE, 22).sort((a, b) => K.depthOf([...a, 0], Pm) - K.depthOf([...b, 0], Pm));
      out.push(`<g data-name="feet">${feet.map(([x, y]) => T.cyl(Pm, x, y, 7, 0, 4, "lo", T.C.rubber, 20)).join("")}</g>`);
      out.push(`<g data-name="base">${T.slab(Pm, BASE, 4, 10, "lo", T.C.dark, 12, 1.2)}${T.L(K.planOutline(K.insetPlan(BASE, 6), 14, Pm, 12), { tone: "faint" })}`);
      out.push(T.cyl(Pm, 0, 0, 14, 14, 4, "mid", T.C.alu, 32), T.cyl(Pm, 0, 0, 10, 18, 2, "hi", T.C.alu, 28), "</g>");
      out.push(`<g data-name="post">${T.cyl(Pm, 0, 0, 7, 20, PT - 8 - 20, "hi", T.C.alu, 24)}${T.cyl(Pm, 0, 0, 9, PT - 8, 8, "mid", T.C.alu, 28)}${T.L(K.ring(0, 0, 9, PT - 4, Pm, 28), { tone: "faint" })}</g>`);
      out.push(`<g data-name="saddle">${T.box(Pm, [-18, 18], [-12, 12], [PT, PT + 2], "mid", T.C.alu)}${T.slab(Pm, SAD, PT + 2, ST - PT - 2, "mid", T.C.rubber, 6, 1.5)}`);
      out.push(T.L(K.planOutline(K.insetPlan(SAD, 2.5), ST, Pm, 6), { tone: "faint" }), `<path d="${K.sideSeam(SAD, PT + 6, Pm, 6)}" fill="none" stroke="#8a8c92" stroke-width=".6" stroke-dasharray="1.5 1.5"/>`, "</g>");
      if (lab) out.push(T.word(Pm, [0, 0, ST], "headphone stand", { dy: -14 }));
      g.innerHTML = out.join("");
      g.anchors = { saddle: [0, 0, ST / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B34.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "headphone stand · 12 × 12 cm base, 26 cm tall · the band rests on the padded saddle, so the ear cushions are not squashed";
      B34.light(w, g, lit);
      return g;
    },
  });
})();
