// "carbonpaper cx cy k hit=-13..13 clear=0|1 lab=0 lit=paper|carbon|tape|marks" — a PART (PARTS.md, batch 5): the
// landing sheet of projectile.js, lying flat on the bench, its origin the bench point under its middle. A sheet of
// white paper 30 × 20 cm taped down at both ends, a sheet of carbon paper 26 × 16 cm laid on it, ink side down, and
// strips of masking tape over the carbon's ends. Where a ball lands it presses the carbon onto the paper: a dark dot.
// set({ hit: x }) lands a ball x cm along the sheet (x across the middle, a little scatter in y, as real launches
// give): a dent appears on the carbon (eased in); up to 8 marks stay, set({ clear: 1 }) lifts them all.
// World units: 1 = 1 cm. anchors: centre (the carbon's top middle).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const PW = 15, PD = 10, CW = 13, CD = 8, TP = 0.03, TC = 0.02, ZC = TP + TC;
  const PAPER = ISO.tint("#fbfbf8", ["#d9d9d2", "#e3e3dc", "#ecece6", "#f3f3ee"], "#77756c");
  const CARBON = ISO.tint("#35383f", ["#1c1e22", "#23262b", "#2a2d33", "#31343a"], "#0b0c0e");
  const TAPE = ISO.tint("#efe3bd", ["#cdbb88", "#d8c796", "#e2d3a5", "#eadcb2"], "#8a7a4a");
  // a mark: the pressed spot on the carbon goes glossy grey, a dark pit in its middle, light on its rim;, eased in with its opacity
  const markSvg = (P, x, y, op) => {
    const F = window.B25.Z([x, y, ZC + 0.002]), kS = G.scaleOf(P);
    return `<g opacity="${op.toFixed(2)}"><path d="${G.circleOf(F, 0, 0.32, P, 24)}" fill="#7a8089"/><path d="${G.arcOf(F, 0, 0.36, P, { from: 3.6, to: 5.6 })}" fill="none" stroke="#c3c8ce" stroke-width="${Math.max(0.5, kS * 0.05).toFixed(2)}" stroke-linecap="round"/>` +
      `<path d="${G.circleOf(F, 0, 0.11, P, 16)}" fill="#15171a"/></g>`;
  };

  ISO.add({
    name: "carbonpaper", title: "Carbon paper landing sheet (part)", compare: null,
    about: "White paper 30 × 20 cm taped to the bench with carbon paper on it, where a launched ball lands and leaves a dark mark; each hit adds a mark at x cm along it. anchors: centre",
    line: "carbonpaper cx cy k hit=-13..13 clear=0|1 lab=0 lit=paper|carbon|tape|marks",
    demo: { line: "carbonpaper 480 300 22 hit=4", script: [{ set: {}, hold: 1 }, { set: { hit: 5.2 }, hold: 0.8 }, { set: { hit: 3.6 }, hold: 0.8 }, { set: { hit: -6, lit: "marks" }, hold: 1.2 }, { set: { clear: 1, lit: "carbon" }, hold: 1.4 }, { set: { lit: "tape" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -PW, y: -PD, w: 2 * PW, d: 2 * PD, r: 0.2 }, 0, 0.02, P)}"/>`];
      out.push(`<g data-name="paper">${ISO.tinted(PAPER, S(K.slabOf({ x: -PW, y: -PD, w: 2 * PW, d: 2 * PD, r: 0.1 }, 0, TP, P, 2), { tone: "hi", crease: "none" }))}</g>`);
      out.push(`<g data-name="carbon">${ISO.tinted(CARBON, S(K.slabOf({ x: -CW, y: -CD, w: 2 * CW, d: 2 * CD, r: 0.1 }, TP, TC, P, 2), { tone: "mid", crease: "none" }))}</g>`);
      // tape: over each end of the carbon onto the paper, and a square over each of the paper's corners onto the bench
      const strip = (x0, x1, y0, y1, z) => ISO.tinted(TAPE, S(K.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 0.05 }, z, 0.01, P, 1), { tone: "hi", crease: "none" }));
      out.push(`<g data-name="tape" opacity=".9">${strip(-CW - 1, -CW + 1, -4.5, 4.5, ZC)}${strip(CW - 1, CW + 1, -4.5, 4.5, ZC)}${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => strip(sx * PW - 0.9, sx * PW + 0.9, sy * PD - 0.9, sy * PD + 0.9, TP)).join("")}</g>`);
      out.push(`<g data-name="marks" data-part="marks"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      g.anchors = { centre: [0, 0, ZC] };
      const el = LAB.parts(g);
      // the scatter is fixed per mark number, so a replay draws the same marks
      const marks = [], scatter = (n) => [Math.sin(n * 12.9898) * 0.45, Math.sin(n * 78.233 + 1.3) * 1.1];
      let n = 0, lit = o.lit || "";
      const add = (x) => { const [sx, sy] = scatter(++n); marks.push({ x: ISO.clamp(x + sx, -CW + 1.6, CW - 1.6), y: ISO.clamp(sy, -CD + 0.6, CD - 0.6), op: 0 }); if (marks.length > 8) marks.shift(); };
      if (o.hit !== undefined && Number.isFinite(+o.hit)) { add(+o.hit); marks[0].op = 1; }
      const draw = () => {
        w.rebuild(el.marks, marks.map((m) => `${m.x.toFixed(2)},${m.op.toFixed(2)}`).join(" "), () => marks.map((m) => markSvg(P, m.x, m.y, m.op)).join(""));
        if (lab) w.rebuild(el.words, String(marks.length), () => LAB.word(P, lab, [0, PD, 0], marks.length ? `${marks.length} landing mark${marks.length > 1 ? "s" : ""}` : "carbon paper", "#556", { dy: 18 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.clear !== undefined && +p.clear) marks.length = 0;
        if (p.hit !== undefined && Number.isFinite(+p.hit)) add(ISO.clamp(+p.hit, -13, 13));
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        for (const m of marks) { m.op = calm ? 1 : Math.min(1, m.op + dt / 0.3); moving ||= m.op < 1; }
        draw();
        return moving;
      };
      g.readout = () => {
        if (!marks.length) return "white paper 30 × 20 cm with carbon paper on it · no landing marks yet";
        const xs = marks.map((m) => m.x), mean = xs.reduce((a, b) => a + b, 0) / xs.length;
        return `${marks.length} landing mark${marks.length > 1 ? "s" : ""} · mean ${mean >= 0 ? "+" : ""}${mean.toFixed(1)} cm from the sheet's middle · spread ${(Math.max(...xs) - Math.min(...xs)).toFixed(1)} cm`;
      };
      draw();
      return g;
    },
  });
})();
