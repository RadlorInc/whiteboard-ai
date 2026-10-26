// "beaker cx cy size c=blue level=0.55 lab=1 lit=beaker|scale|rod" — a 250 mL borosilicate beaker on a bench mat.
// Turned glass with a rounded heel, a pouring spout, a white enamel marking patch and graduations every 10 mL (major
// every 50 mL) printed up the near wall; a glass stirring rod leans in it. The liquid is a tinted volume with a
// meniscus. level is the fraction of the 250 mL mark: inside radius 32.8 mm, so 1 mL raises it 0.296 mm.
// set({ level, c }) fills or empties it smoothly; the readout is the volume in mL.
(() => {
  const K = window.K, G = window.G;
  const R = 34, H = 92, BASE = 2, RIN = R - 1.2, MLMM = 1000 / (Math.PI * RIN * RIN);   // mm per mL
  const MAT = { x: -58, y: -52, w: 116, d: 104, r: 4 };
  const OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  const zOf = (ml) => BASE + ml * MLMM;

  ISO.add({
    name: "beaker", title: "Beaker (250 mL)", compare: "beaker 480 250 200 c=blue",
    about: "A 250 mL glass beaker with a spout and printed mL marks: fill it and read the volume off the scale.",
    line: "beaker cx cy size c=blue level=0.55 lab=1 lit=beaker|scale|rod",
    demo: { line: "beaker 480 270 230 level=0.2", script: [{ set: { level: 0.6, lit: "rod" }, hold: "settle" }, { set: { level: 0.9, lit: "scale" }, hold: "settle" }, { set: { c: "green", level: 0.4, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 200], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.6, H2 = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [-R, -R, H + 26], [R, R, H + 4]], cx, cy, W, H2, { azimuth: 52, elevation: 24 }, parent);
      const V = LAB.vessel(P, [0, 0, 3], OUTER, { spout: true });
      const st = { ml: ISO.clamp(ISO.num(o, "level", 0.55), 0, 1) * 250, c: o.c || "blue" }, want = { ml: st.ml };
      let lit = o.lit || "";
      // the marking patch: a white enamel area on the near wall, with three printed rule lines and the 250 mL mark
      const patch = () => {
        const a0 = V.facing + 0.15, a1 = V.facing + 0.8, s0 = 30, s1 = 60, pts = [];
        for (let i = 0; i <= 10; i++) pts.push(K.iso(G.pointOf(V.F, s0, R + 0.2, a0 + ((a1 - a0) * i) / 10), P));
        for (let i = 10; i >= 0; i--) pts.push(K.iso(G.pointOf(V.F, s1, R + 0.2, a0 + ((a1 - a0) * i) / 10), P));
        const rule = (s, f) => { const q = []; for (let i = 0; i <= 6; i++) q.push(K.iso(G.pointOf(V.F, s, R + 0.25, a0 + 0.08 + ((a1 - a0 - 0.16) * f * i) / 6), P)); return K.pathOf(q); };
        return `<path d="${K.pathOf(pts, true)}" fill="#ffffff" fill-opacity=".9" stroke="${LAB.GLASS}" stroke-width="0.5"/>` + L(rule(41, 1) + rule(36, 0.6), { tone: "lo", free: true }) +
          LAB.faceText(P, G.pointOf(V.F, 50, R + 0.3, (a0 + a1) / 2), G.mul3(G.tangentOf(V.F, (a0 + a1) / 2), -1), "250 mL", 6.2) + LAB.faceText(P, G.pointOf(V.F, 44.5, R + 0.3, (a0 + a1) / 2), G.mul3(G.tangentOf(V.F, (a0 + a1) / 2), -1), "± 5 %", 3.6, "#6b8496");
      };
      const rodSvg = () => {
        const a = [6, -6, 4.2], b = [-6, 31, H + 30], d = b.map((v, i) => v - a[i]), len = Math.hypot(...d);
        return `<g data-name="rod" style="${ISO.T.glass}">${S(G.solidOf([[0, 0.2], [0.6, 2.2, 1], [2, 2.6], [len - 1, 2.6], [len, 1.2, 1]], LAB.A(a, d.map((v) => v / len)), P), { tone: "lo" })}</g>`;
      };
      g.innerHTML = `<g>${LAB.mat(P, MAT, 3, "lo", "")}${ISO.plate(P, { x: 18, y: 34, w: 34, d: 11, r: 1 }) /* maker plate on the mat */}</g>` +
        `<g data-name="beaker">${V.back()}</g>${rodSvg()}<g data-part="liquid" data-name="liquid"></g>` +
        `<g>${V.front()}${patch()}</g><g data-name="scale">${V.scale(zOf(50) + 3, zOf(250) + 3, 10 * MLMM, 5, { side: -0.45 })}</g><g data-name="spout"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.liquid, `${st.ml.toFixed(1)} ${st.c}`, () => V.liquid(zOf(st.ml) + 3, st.c));
        if (lab) w.rebuild(el.words, `${Math.round(st.ml)}`, () => LAB.word(P, lab, V.at(zOf(st.ml) + 3, -1.25, 6), `${Math.round(st.ml)} mL`, LAB.ink(st.c), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.level !== undefined) want.ml = ISO.clamp(+p.level, 0, 1) * 250;
        if (p.c) st.c = p.c;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.ml = ISO.follow(st.ml, want.ml, dt, 0.45, ISO.still());
        draw();
        return st.ml !== want.ml;
      };
      g.readout = () => `${st.ml.toFixed(0)} mL of 250 mL · liquid ${(zOf(st.ml)).toFixed(0)} mm deep · marks every 10 mL`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
