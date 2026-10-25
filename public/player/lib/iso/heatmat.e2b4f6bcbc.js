// "heatmat cx cy k w=15..40 lab=0 lit=mat" — a PART (PARTS.md, batch 2): a square heatproof mat w cm across and 1 cm
// thick lying on the bench, its origin the bench point under its middle. Pressed mineral board (off-white, slightly
// rounded corners) whose sawn edge shows the board's grain and its two pressed layers, with a printed border and a
// small "hot surface" sign in one corner. Burners, tripods and stands stand on its `top`.
// Built in mm (LAB's units) with Pm = ISO.mm(P); anchors in cm.
(() => {
  const K = window.K;
  const T = 10, BOARD = ISO.tint("#f1eee6", ["#c7c1b3", "#d3cec1", "#ded9ce", "#e8e4db"], "#7d776a");

  ISO.add({
    name: "heatmat", title: "Heatproof mat (part)", compare: null,
    about: "A square heatproof mat of pressed mineral board, 1 cm thick, that a burner, tripod or stand stands on so the bench does not scorch. anchors: top",
    line: "heatmat cx cy k w=15..40 lab=0 lit=mat",
    demo: { line: "heatmat 480 300 13 w=30 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "mat" }, hold: 1.5 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const W = ISO.clamp(ISO.num(o, "w", 25), 15, 40) * 10, h = W / 2, plan = { x: -h, y: -h, w: W, d: W, r: 3 };
      // the sawn edge: specks of the board's grain on the two seen sides (+x and +y), seeded so it never shimmers
      let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const specks = [];
      for (let i = 0; i < Math.round(W / 4); i++) {
        const u = -h + 4 + rnd() * (W - 8), z = 1.2 + rnd() * (T - 2.4);
        specks.push(K.iso(i % 2 ? [h + 0.05, u, z] : [u, h + 0.05, z], Pm));
      }
      // the printed border (two rules), and a warning triangle with a flame mark in the near corner
      const rules = L(K.planOutline(K.insetPlan(plan, 12), T, Pm, 3) + K.planOutline(K.insetPlan(plan, 15), T, Pm, 3), { tone: "lo", free: true }) +
        // a printed ring in the middle, where a burner or tripod goes
        L(K.pathOf(K.circleRing(0, 0, Math.min(45, h * 0.4), 48).map(([a, b]) => K.iso([a, b, T], Pm)), true), { tone: "faint", free: true });
      const c = [h - 30, h - 30], tri = [[0, -11], [10, 7], [-10, 7]].map(([a, b]) => K.iso([c[0] + a, c[1] + b, T], Pm));
      const flame = [[0, -5], [3, 0.8], [1.6, 4.4], [-1.6, 4.4], [-3, 0.8]].map(([a, b]) => K.iso([c[0] + a, c[1] + b, T], Pm));
      const sign = `<path d="${K.pathOf(tri, true)}" fill="#f2c94c" stroke="#7a5a10" stroke-width="0.7" stroke-linejoin="round"/><path d="${K.pathOf(flame, true)}" fill="#3a3326"/>`;
      const mat = `<path class="iso-halo" d="${K.haloOf(plan, 0, T, Pm)}"/>` +
        S(K.slabOf(plan, 0, T, Pm, 3, 0.6), { tone: "mid", inner: L(K.sideSeam(plan, T * 0.45, Pm, 3), { tone: "faint" }) + D(specks, { size: 0.45, tone: "lo" }) }) + rules + sign;
      g.innerHTML = `<g data-name="mat">${ISO.tinted(BOARD, mat)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [h, -h, T], "heatproof mat", "#556", { anchor: "start", dy: -6 });
      g.anchors = { top: [0, 0, T / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `heatproof mat · ${W / 10} × ${W / 10} cm · 1 cm mineral board · takes a burner's heat`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
