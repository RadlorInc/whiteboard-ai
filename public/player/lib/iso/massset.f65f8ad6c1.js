// "massset cx cy k n=1..6 lab=0 lit=masses|hanger" — a PART (PARTS.md, batch 3): a slotted-mass hanger standing on
// the bench with n 100 g brass slotted masses stacked on it (Ø 40 × 9 mm, the slots toward +x, "100 g" stamped on
// each), origin the bench point under its middle. The hanger: a steel base disc, a Ø 5 mm rod and a bent hook on top
// (anchor `top` = the inside of the hook's crown, where it hangs from a loop or a hook). set({ n }) adds or takes masses.
// Built in mm with Pm = ISO.mm(P) and PHYS.hanger (recipes/_phys.js); anchors in cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "massset", title: "Slotted mass set (part)", compare: null,
    about: "A slotted-mass hanger standing on the bench with up to six 100 g brass masses stacked on it, ready to hang on a spring or a lever. anchors: top",
    line: "massset cx cy k n=1..6 lab=0 lit=masses|hanger",
    demo: { line: "massset 480 430 32 n=3", script: [{ set: {}, hold: 1.2 }, { set: { n: 6, lit: "masses" }, hold: 1.5 }, { set: { n: 1, lit: "hanger" }, hold: 1.5 }] },
    make([cx = 480, cy = 430, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      let n = ISO.clamp(Math.round(ISO.num(o, "n", 3)), 1, 6), lit = o.lit || "";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -22, y: -22, w: 44, d: 44, r: 22 }, 0, 4, Pm)}"/><g data-part="body"></g><g data-part="words"></g>`;
      const el = window.LAB.parts(g), w = ISO.writer();
      g.anchors = { top: [0, 0, PHYS.HANG / 10] };
      const draw = () => {
        w.rebuild(el.body, String(n), () => { const h = PHYS.hanger(Pm, [0, 0, 0], n); return `<g data-name="hanger">${h.base}</g><g data-name="masses">${h.masses}</g><g data-name="hanger">${h.rod}</g>`; });
        if (lab) w.rebuild(el.words, String(n), () => window.LAB.word(Pm, lab, [0, 0, PHYS.HANG + 12], `${n * 100} g`, "#2b6cc4", { size: 14 }) + window.LAB.word(Pm, lab, [-26, 0, 2], "hanger", "#556", { anchor: "end" }));
        window.LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.n !== undefined) n = ISO.clamp(Math.round(+p.n), 1, 6);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `slotted masses · ${n} × 100 g = ${n * 100} g · weight ${(n * 0.1 * 9.8).toFixed(2)} N`;
      draw();
      return g;
    },
  });
})();
