// "pivottower cx cy k lab=0 lit=foot|column|tip" — a PART (PARTS.md, batch 5): the pivot tower a toy gyroscope rests
// on (gyroscope.js), standing on the bench, its origin the bench point under its middle. A heavy cast-iron round foot
// 5 cm across on a felt pad, a raised boss, a polished steel column with a knurled collar, a cup head and a hardened
// pointed tip 12 cm up: anchor `tip`, where the gyrorotor's pivot end sits (place gyrorotor at=<id>.tip). Static.
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const IRON = ISO.tint("#c9ccd2", ["#5e636b", "#6d7279", "#7d828a", "#8d9299"], "#24272c");
  const FELT = ISO.tint("#6a5b4a", ["#3e342a", "#463b30", "#4f4336", "#584b3d"], "#1e1813");
  const TIP = 120;

  ISO.add({
    name: "pivottower", title: "Pivot tower (part)", compare: null,
    about: "The pivot tower a gyroscope rests on: a heavy round iron foot 5 cm across, a steel column and a pointed tip 12 cm up; static. anchors: tip",
    line: "pivottower cx cy k lab=0 lit=foot|column|tip",
    demo: { line: "pivottower 480 420 26 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "tip" }, hold: 1.2 }, { set: { lit: "foot" }, hold: 1.2 }, { set: { lit: "column" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const Z = LAB.Z([0, 0, 0]);
      const foot = ISO.tinted(FELT, S(K.cylinder(0, 0, 24, 0, 1.5, Pm, 48), { tone: "lo" })) +
        ISO.tinted(IRON, S(G.lathe([[1.5, 0], [1.5, 25], [7, 25, 1], [10, 21], [10, 0]], Z, Pm), { tone: "mid", inner: L(G.arcOf(Z, 7.6, 24.6, Pm), { tone: "faint" }) }) +
          S(K.cylinder(0, 0, 9, 10, 4, Pm, 32, 0.6), { tone: "mid" }));
      // the column: a polished rod with a highlight, a knurled collar, the cup head and the hardened point
      const column = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 4, 14, 96, Pm, 24), { tone: "mid", crease: "none", inner: L(K.sideArc(0, 0, 4, 60, Pm, 12), { tone: "faint" }) }) +
        S(K.cylinder(0, 0, 6.5, 60, 7, Pm, 32), { tone: "mid", inner: L(K.knurl(0, 0, 6.5, 60, 67, 28, Pm, 0), { tone: "faint" }) }));
      const tip = ISO.tinted(ISO.T.steel, S(G.lathe([[110, 0], [110, 6], [113, 6, 1], [114, 4.2], [TIP, 0.35], [TIP, 0]], Z, Pm), { tone: "hi" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -25, y: -25, w: 50, d: 50, r: 25 }, 0, 14, Pm)}"/>` +
        `<g data-name="foot">${foot}</g><g data-name="column">${column}</g><g data-name="tip">${tip}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, TIP + 8], "pivot", "#445", { dy: -4 }) + LAB.word(Pm, lab, [0, 25, 0], "pivot tower", "#445", { dy: 16 });
      g.anchors = { tip: [0, 0, TIP / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "pivot tower · foot 5 cm across · tip 12 cm up";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
