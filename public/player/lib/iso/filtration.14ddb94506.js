// "filtration cx cy size c=brown lab=1 lit=paper|ring|stand" — filtering a muddy mixture.
// A 60° glass filter funnel with a folded (fluted) filter paper sits in a ring clamp on a stand, its stem inside the
// neck of a conical flask. The mixture in the paper drains: the liquid and anything dissolved pass through the paper's
// tiny pores and drip from the stem as clear filtrate; the insoluble solid stays on the paper as residue.
// set({ filter: 1 }) lets it run (about 60 mL over 9 s here); set({ filter: 0 }) puts the fresh mixture back.
(() => {
  const K = window.K, G = window.G;
  const BASE = { x: -60, y: -96, w: 120, d: 150, r: 5 }, ROD = [0, -76];
  const CONE = [[0, 33], [0.8, 35, 1], [2.6, 36.2, 1], [5, 36.4, 1], [8, 35.2], [80, 13.5, 1], [86, 11.6, 1], [88, 11], [112, 11], [113, 12.4, 1], [115, 12.6, 1], [116.5, 11.8]];
  const FZ = 8, STEM0 = FZ + 82, FUN = [[0, 3.4], [60, 3.6], [63, 5.2, 1], [133, 45], [134.5, 46.6, 1], [136, 46.2]];
  const CS0 = 63, CS1 = 133, PAPER = [72, 126], MIX = 60, FILT = 52;
  const rCone = (s) => 5.2 + ((45 - 5.2) * (s - CS0)) / (CS1 - CS0);

  ISO.add({
    name: "filtration", title: "Filtration", compare: "filtration 480 265 260",
    about: "A funnel with folded filter paper over a flask: liquid drips through as clear filtrate, the solid stays on the paper as residue.",
    line: "filtration cx cy size c=brown filter=0|1 lab=1 lit=paper|ring|stand",
    demo: { line: "filtration 480 270 260", script: [{ set: { filter: 1, lit: "paper" }, hold: "settle" }, { set: { lit: "ring" }, hold: 1.5 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", c = o.c || "brown", W = size * 1.45, H2 = size * 1.4;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), [0, -76, STEM0 + 160], [-48, 0, STEM0 + 140], [48, 0, STEM0 + 140]], cx, cy, W, H2, { azimuth: 52, elevation: 22 }, parent);
      const st = { p: +o.filter ? 1 : 0, want: +o.filter ? 1 : 0, drops: [], spawn: 0 };
      let lit = o.lit || "";
      const flask = LAB.vessel(P, [0, 0, FZ], CONE, { base: 2 });
      const fun = LAB.vessel(P, [0, 0, STEM0], FUN, { base: 0, wall: 1 });
      const ringZ = STEM0 + 118;
      // the folded paper: a cone just inside the glass, with its fold lines
      const paperProf = [[PAPER[0], rCone(PAPER[0]) - 1.6], [PAPER[1], rCone(PAPER[1]) - 1.2]];
      const paperF = fun.F;
      const paper = () => {
        const pv = LAB.vessel(P, [0, 0, STEM0 + PAPER[0]], [[0, paperProf[0][1]], [PAPER[1] - PAPER[0], paperProf[1][1]]]);
        // fluted paper: sixteen folds from the tip to the rim, seen all round through the open mouth
        const apex = K.iso(G.pointOf(pv.F, 0, 0, 0), P), folds = [];
        for (let i = 0; i < 16; i++) { const q = K.iso(G.pointOf(pv.F, pv.H, pv.rTop * (i % 2 ? 0.94 : 1), (i / 16) * Math.PI * 2), P); folds.push(`M${apex[0].toFixed(1)} ${apex[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`); }
        const rimPts = []; for (let i = 0; i <= 32; i++) rimPts.push(K.iso(G.pointOf(pv.F, pv.H, pv.rTop * (i % 2 ? 0.94 : 1), (i / 32) * Math.PI * 2), P));
        return `<path d="${pv.sil}" fill="#efe7d2" fill-opacity=".5"/><path d="${folds.join("")}" stroke="#b5ad98" stroke-width="0.6" fill="none"/><path d="${K.pathOf(rimPts, true)}" fill="none" stroke="#9a968c" stroke-width="0.8"/>`;
      };
      const ring = LAB.ringClamp(P, ROD, ringZ, [0, 0], 37);
      g.innerHTML = `<g data-name="stand">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, STEM0 + 160)}${LAB.boss(P, ROD, ringZ - 4, [0, 1])}</g>` +
        `<g data-name="flask">${flask.back()}<g data-part="filtrate"></g>${flask.front()}</g><g data-part="drops"></g>` +
        `<g data-name="ring">${ring.back}</g><g data-name="funnel">${fun.back()}</g><g data-name="paper">${paper()}</g><g data-part="mix"></g><g data-name="funnel">${fun.front()}</g><g data-name="ring">${ring.front}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const resH = () => 4 + 9 * ISO.ease(st.p);     // residue depth above the paper's tip
      const draw = () => {
        const left = MIX * (1 - st.p), filt = FILT * st.p, pq = Math.round(st.p * 200) / 200;
        w.rebuild(el.mix, String(pq), () => {
          const out = [], s0 = PAPER[0] + 0.5, sr = s0 + resH();
          // residue: the solid packed in the bottom of the cone, speckled
          out.push(fun.liquid(sr, c, { from: s0, opacity: 0.92, meniscus: false }));
          const dots = [];
          for (let i = 0; i < 26; i++) { const s = s0 + 1 + ((i * 7) % 11) / 11 * (sr - s0 - 1.5), r = rCone(s) - 2.5, a = i * 2.39; dots.push(K.iso(G.pointOf(fun.F, s, r * (0.3 + 0.6 * ((i * 5) % 7) / 7), a), P)); }
          out.push(D(dots, { size: 0.8, tone: "hi" }));
          // the muddy mixture above it, a volume set by what is left
          if (left > 0.5) { let lo = sr, hi = PAPER[1]; const vAt = (s) => fun.vol(s) - fun.vol(sr); for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; vAt(m) < left ? (lo = m) : (hi = m); } out.push(fun.liquid(lo, LAB.mix(LAB.col(c), "#d8c9a8", 0.35), { from: sr, opacity: 0.75 })); }
          return out.join("");
        });
        w.rebuild(el.filtrate, String(Math.round(filt * 2)), () => flask.liquid(flask.levelFor(filt), "#e9f2d8", { opacity: 0.8 }));
        w.rebuild(el.drops, st.drops.map((z) => z.toFixed(0)).join(), () => st.drops.map((z) => LAB.drop(P, [0, 0, z], 1.5, "#e9f2d8")).join(""));
        if (lab) w.rebuild(el.words, st.p > 0.5 ? "1" : "0", () => [
          LAB.word(P, lab, [48, 0, STEM0 + 126], "filter paper", "#556", { anchor: "start" }),
          LAB.word(P, lab, [40, 0, STEM0 + 74], st.p > 0.5 ? "residue (solid)" : "mixture", LAB.ink(c), { anchor: "start" }),
          LAB.word(P, lab, [40, 0, FZ + 20], "filtrate", "#3f7f25", { anchor: "start" }),
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.filter !== undefined) { st.want = +p.filter ? 1 : 0; if (!st.want) { st.p = 0; st.drops = []; } } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) { st.p = st.want; st.drops = []; draw(); return false; }
        const running = st.p < st.want;
        if (running) {
          st.p = Math.min(st.want, st.p + dt / 9 * (1.2 - 0.6 * st.p));   // drains faster while the head of liquid is high
          st.spawn += dt * (6 - 4 * st.p);
          if (st.spawn > 1) { st.spawn = 0; st.drops.push(STEM0 - 2); }
        }
        const surf = FZ + flask.levelFor(FILT * st.p);
        st.drops = st.drops.map((z) => z - (STEM0 - z + 5) * 9 * dt).filter((z) => z > surf);
        draw();
        return running || st.drops.length > 0;
      };
      g.readout = () => `${(MIX * (1 - st.p)).toFixed(0)} mL of mixture left in the paper · filtrate ${(FILT * st.p).toFixed(0)} mL, clear · ${st.p > 0.95 ? "residue: the insoluble solid stays on the paper" : st.p > 0 ? "filtering…" : "pour the mixture into the paper"}`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
