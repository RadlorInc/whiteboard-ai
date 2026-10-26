// "goldbar cx cy k n=1..6 lab=0 lit=bars" — a PART (batch 6, money): a cast gold bar lying on a surface, its origin
// the surface point under the middle of the pile. 25 × 8 cm at the bottom, 4 cm tall, its top smaller (the mould's
// draft), a stamp sunk in the top with the fineness 999.9, the weight 12.5 kg and the bar's number (no logo). n bars
// stack as a vault keeps them: up to three side by side, then the next layer crosswise on top. Static.
// World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  ISO.add({
    name: "goldbar", title: "Gold bar (part)", compare: null,
    about: "A cast gold bar, 25 × 8 × 4 cm, smaller top, stamped 999.9, 12.5 kg and a number (no logo); n stacks up to six as a vault keeps them. anchors: top",
    line: "goldbar cx cy k n=1..6 lab=0 lit=bars",
    demo: { line: "goldbar 480 330 22 n=6 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "bars" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const n = Math.round(A.num(o, "n", 1, 1, 6)), n1 = Math.min(3, n), n2 = n - n1;
      // the first layer: bars along x, side by side in y (far ones first); the second crosswise, far (−x) first
      let s = "";
      const ys = n1 === 1 ? [0] : n1 === 2 ? [-4.25, 4.25] : [-8.5, 0, 8.5];
      ys.forEach((y, i) => { s += B.bar(P, [0, y, 0], { detail: n2 === 0, serial: String(4172 + i).padStart(5, "0") }); });
      const xs = n2 === 1 ? [0] : n2 === 2 ? [-4.25, 4.25] : [-8.5, 0, 8.5];
      if (n2) xs.forEach((x, i) => { s += B.bar(P, [x, 0, 4], { alongY: true, detail: true, serial: String(4180 + i).padStart(5, "0") }); });
      const hy = n1 === 1 ? 4 : n1 * 4.25 + 0.5;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -12.8, y: -hy, w: 25.6, d: 2 * hy, r: 0.6 }, 0, n2 ? 8 : 4, P)}"/><g data-name="bars">${s}</g>` +
        (lab ? B.word(P, [12.5, n1 === 1 ? 4 : hy, n2 ? 8 : 4], n === 1 ? "gold bar, 12.5 kg" : `${n} gold bars, ${n * 12.5} kg`) : "");
      g.anchors = { top: [0, 0, n2 ? 8 : 4] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; A.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `${n} gold bar${n > 1 ? "s" : ""} · 12.5 kg each, ${n * 12.5} kg · 999.9 fine`;
      A.light(w, g, lit);
      return g;
    },
  });
})();
