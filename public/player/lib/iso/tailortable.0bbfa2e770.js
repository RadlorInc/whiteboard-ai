// "tailortable cx cy k" — the whole board as a tailor's table: pattern paper with its printed crosses, a measuring tape
// down the left edge. The fashion shelf's backdrop: draw it first, everything else sits on it.
(() => {
  ISO.add({
    name: "tailortable", title: "Tailor's table", compare: null,
    about: "A tailor's table that fills the whole board: pattern paper with printed crosses and a measuring tape down the left edge. Draw it first; clothes and fabric sit on it.",
    line: "tailortable cx cy k=0.5..2",
    demo: { line: "tailortable 480 270 1", script: [{ set: {}, hold: 1 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(11);
      const g = P.base(parent, cx, cy, k), paper = P.el("g", { transform: "translate(-480 -270)" }, g), tape = P.el("g", { transform: "translate(-480 -270)" }, g);
      P.el("rect", { x: -10, y: -10, width: 980, height: 560, fill: "#eadfc8" }, paper);
      const l = P.layer(paper);
      for (let i = 0; i < 22; i++) { const y = P.rr(-10, 550), x = P.rr(-90, 760); l.stroke(x, y, x + P.rr(130, 300), y + P.rr(-7, 7), P.rr(22, 44), P.pick(["#efe5d1", "#e4d7bd", "#f1e8d6"]), 0.5, P.rr(-4, 4)); }
      l.flecks(220, 0, 0, 960, 540, "#a98f68", 0.3); l.done();
      let dots = ""; for (let y = 25; y < 540; y += 45) for (let x = 60; x < 960; x += 45) dots += `M${x - 3} ${y}h6M${x} ${y - 3}v6`;
      P.el("path", { d: dots, stroke: "#bda67d", "stroke-width": 1, opacity: 0.55, fill: "none", class: "free", "data-free": "1" }, paper);
      P.el("rect", { x: 8, y: -10, width: 26, height: 560, fill: "#e3b647" }, tape);
      let ticks = ""; for (let i = 0; i * 10 < 550; i++) ticks += `M8 ${i * 10}h${i % 4 === 0 ? 11 : i % 2 === 0 ? 7 : 4}`;
      P.el("path", { d: ticks, stroke: P.INK, "stroke-width": 1.2, fill: "none", class: "free", "data-free": "1" }, tape);
      P.el("path", { d: "M8 -10V550M34 -10V550", stroke: P.INK, "stroke-width": 1.4, fill: "none", class: "free", "data-free": "1" }, tape);
      return g;
    },
  });
})();
