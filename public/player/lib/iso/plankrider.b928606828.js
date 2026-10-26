// "plankrider cx cy k n=0..8 x=-40..60 lab=0 lit=rider" — a PART (PARTS.md, batch 5): the lever's effort rider, a red
// steel clamp 3 × 6 × 3 cm (250 g with its stem) that grips a 5 × 1.5 cm plank, with a thumb screw on the near cheek
// and a stem carrying n slotted 250 g brass masses. Its origin is the plank's top under its middle (it hangs 2 cm
// below that, round the plank). x slides it along the plank (+x, cm): set({ x, n }) eases it there. The same drawing
// rides the tilting plank in leverplank (n=, e=). Taken from lever.js. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "plankrider", title: "Plank rider with masses (part)", compare: null,
    about: "A red rider that clamps the lever plank and carries slotted 250 g masses on its stem; it slides along the plank (x). anchors: top",
    line: "plankrider cx cy k n=0..8 x=-40..60 lab=0 lit=rider",
    demo: { line: "plankrider 480 360 26 n=3 lab=1", script: [{ set: {}, hold: 1 }, { set: { x: 4, lit: "rider" }, hold: "settle" }, { set: { x: -3, n: 5, lit: "" }, hold: "settle" }, { set: { x: 0, n: 1 }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const B19 = window.B19, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { x: ISO.clamp(ISO.num(o, "x", 0), -40, 60), n: Math.round(ISO.clamp(ISO.num(o, "n", 3), 0, 8)) }, want = { x: st.x };
      let lit = o.lit || "";
      const w = ISO.writer();
      g.innerHTML = `<g data-name="rider"></g><g data-part="words"></g>`;
      const el = g.querySelector('[data-name="rider"]'), words = g.querySelector('[data-part="words"]');
      // a slide along x is a flat screen move: build the rider once per n at x = 0 and translate it (powerline.js)
      const draw = () => {
        const x = Math.round(st.x * 100) / 100, r = { top: 0.8 + st.n * B19.MASS_T };
        w.rebuild(el, String(st.n), () => { const b = B19.rider(B19.flat, P, st.n); return `<path class="iso-halo" d="${K.haloOf({ x: -2.4, y: -3, w: 4.8, d: 6, r: 0.3 }, -2, 3, P)}"/>` + b.back + b.front; });
        w.attr(el, "transform", K.translateAlong(P, [x, 0, 0]));
        g.anchors = { top: [x, 0, r.top + 0.7] };
        if (lab) w.rebuild(words, `${x} ${st.n}`, () => ISO.word(K.iso([x, 0, r.top + 0.7], P), `effort ${(0.25 * (st.n + 1)).toFixed(2)} kg`, "#c0392b", { size: 14, dy: -10 }));
        B19.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.x !== undefined && Number.isFinite(+p.x)) want.x = ISO.clamp(+p.x, -40, 60);
        if (p.n !== undefined && Number.isFinite(+p.n)) st.n = Math.round(ISO.clamp(+p.n, 0, 8));
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.x = ISO.follow(st.x, want.x, dt, 0.4, ISO.still()); draw(); return st.x !== want.x; };
      g.readout = () => `rider 250 g + ${st.n} × 250 g = ${(0.25 * (st.n + 1)).toFixed(2)} kg · at ${st.x.toFixed(1)} cm`;
      draw();
      return g;
    },
  });
})();
