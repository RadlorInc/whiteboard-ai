// "castweight cx cy k kg=0.5..5 lab=0 lit=weight" — a PART (PARTS.md, batch 5): the lever's load, a cast block
// 8 × 6 × 8 cm (to the top of its lifting handle) standing on the bench or a plank, its origin the surface point
// under its middle; its mass is cast on the near face. set({ kg }) changes the block (the number changes). The same
// drawing rides the plank in leverplank (kg=, kgat=). Taken from lever.js. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "castweight", title: "Cast load weight (part)", compare: null,
    about: "A cast load block 8 × 6 × 8 cm with a lifting handle and its mass cast on the front, standing on the bench or a lever plank. anchors: top",
    line: "castweight cx cy k kg=0.5..5 lab=0 lit=weight",
    demo: { line: "castweight 480 330 30 kg=2 lab=1", script: [{ set: {}, hold: 1 }, { set: { kg: 1, lit: "weight" }, hold: 1.2 }, { set: { kg: 5, lit: "" }, hold: 1.2 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const B19 = window.B19, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      let kg = ISO.clamp(ISO.num(o, "kg", 2), 0.5, 5), lit = o.lit || "";
      const w = ISO.writer();
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -4, y: -3, w: 8, d: 6, r: 0.3 }, 0, 8, P)}"/><g data-name="weight"></g><g data-part="words"></g>`;
      const el = g.querySelector('[data-name="weight"]'), words = g.querySelector('[data-part="words"]');
      g.anchors = { top: [0, 0, 8] };
      const draw = () => {
        w.rebuild(el, String(kg), () => B19.castweight(B19.flat, P, kg));
        if (lab) w.rebuild(words, String(kg), () => ISO.word(K.iso([0, 0, 8], P), `load ${kg} kg`, "#2b6cc4", { size: 14, dy: -10 }));
        B19.light(w, g, lit);
      };
      g.set = (p) => { if (p.kg !== undefined && Number.isFinite(+p.kg)) kg = ISO.clamp(+p.kg, 0.5, 5); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = () => false;
      g.readout = () => `cast load ${kg} kg · weight ${(kg * 9.8).toFixed(1)} N`;
      draw();
      return g;
    },
  });
})();
