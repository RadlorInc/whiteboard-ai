// "lungmodel cx cy height pull=0..1 lab=1" — the bell-jar model of breathing (a new recipe beside "breathing").
// A glass bell jar stands on a ring; a rubber stopper carries a glass Y-tube (the windpipe and two bronchi) with a
// balloon on each branch (the lungs); a rubber sheet across the bottom with a knob is the diaphragm. Pull the sheet
// down: the space in the jar grows, the pressure in it drops below the room's, and air flows in to inflate the
// balloons (breathing in). Let it go and they empty (breathing out). set({ pull: 0..1 }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const JAR = { r: 40, z0: 30, z1: 120 }, ROOM = 101.3;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  function standSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -64, y: -60, w: 128, d: 120, r: 8 }, { h: 6 })];
    // Three legs and a ring that holds the jar up, so the sheet can be pulled down under it.
    for (let i = 0; i < 3; i++) { const a = (i * 2 * Math.PI) / 3 + 0.5; out.push(S(K.cylinder(Math.cos(a) * 44, Math.sin(a) * 44, 2.6, 0, JAR.z0, P, 16), { tone: "mid", crease: "none" })); }
    out.push(S(G.ringBand(JAR.z0 - 3, JAR.z0, JAR.r - 2, JAR.r + 6, zAx([0, 0, 0]), P, { steps: 48 }), { tone: "mid" }));
    if (lab) out.push(ISO.word(K.iso([0, 60, 0], P), "bell jar on a ring stand", "#555", { size: 13, dy: 18 }));
    return out.join("");
  }
  // The rubber sheet across the jar's mouth, pulled down at its middle by d, with a knob.
  function sheetSvg(P, d) {
    const F = zAx([0, 0, JAR.z0]), prof = [];
    for (let i = 0; i <= 10; i++) { const r = (JAR.r * (10 - i)) / 10; prof.push([-d * (1 - (r / JAR.r) ** 2), r, 1]); }
    const out = [ISO.tinted(ISO.T.red, S(G.lathe([[0.4, 0], [0.4, JAR.r], ...prof.reverse().map(([s, r]) => [s, r, 1])].reverse(), F, P, { steps: 48 }), { tone: "hi" }))];
    out.push(S(K.cylinder(0, 0, 3, JAR.z0 - d - 8, 8, P, 20), { tone: "mid" }), S(G.sphereOf([0, 0, JAR.z0 - d - 10], 4, P), { tone: "hi", lit: true }));
    return out.join("");
  }
  // The Y-tube and the two balloons at radius br.
  function lungsSvg(P, br) {
    const top = JAR.z1 + 6, fork = JAR.z1 - 26, out = [];
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(0, 0, 2.2, fork, top - fork, P, 16), { tone: "hi", crease: "none" })));
    for (const sx of [-1, 1]) {
      const end = [sx * 12, 0, fork - 12];
      out.push(`<path d="${K.pathOf([K.iso([0, 0, fork], P), K.iso(end, P)])}" stroke="#7ea6c4" stroke-width="3.4" stroke-linecap="round"/>`);
      out.push(ISO.tinted(ISO.tint("#fde6ec", ["#e88aa2", "#ee9fb3", "#f3b4c4", "#f7c8d4"], "#8a2a44"), S(G.sphereOf([end[0] + sx * br * 0.2, 0, end[2] - br * 0.9], br, P), { tone: "hi" })));
    }
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, 8, JAR.z1 - 2, 8, P, 28, 0.5), { tone: "hi" })));
    return out.join("");
  }
  // The jar's glass, drawn over everything inside it.
  const jarSvg = (P) => `<g opacity=".38">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, JAR.r], [60, JAR.r, 1], [76, JAR.r - 6, 1], [86, 16, 1], [90, 9]], zAx([0, 0, JAR.z0]), P, { smooth: true }), { tone: "hi" }))}</g>`;

  ISO.add({
    name: "lungmodel", title: "Bell-jar lung model", compare: "breathing 470 290 420",
    about: "Pull the rubber diaphragm down: the jar's space grows, its pressure drops and the balloon lungs fill — the same way we breathe in.",
    line: "lungmodel cx cy height pull=0..1 lab=1",
    demo: { line: "lungmodel 480 270 420", script: [{ set: { pull: 1 }, hold: "settle" }, { set: { pull: 0 }, hold: "settle" }, { set: { pull: 1 }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 0.95, H = size * 1.05;
      const { P, g } = ISO.frame([[-64, -60, -10], [64, 60, -10], [-40, -40, JAR.z1 + 14], [40, 40, JAR.z1 + 14]], cx, cy, W, H, { azimuth: 50, elevation: 18 }, parent);
      const s = { p: ISO.clamp(ISO.num(o, "pull", 0), 0, 1), pT: 0 }; s.pT = s.p;
      g.innerHTML = `<g>${standSvg(P, lab)}</g><g data-part="sheet"></g><g data-part="lungs"></g><g>${jarSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      // The sheet and balloons are drawn in 2% steps of the pull and kept, so a breath only builds each step once.
      const memo = new Map(), at = (q) => { if (!memo.has(q)) memo.set(q, [sheetSvg(P, 18 * q), `<g data-name="lungs">${lungsSvg(P, 9 + 9 * q)}</g>`]); return memo.get(q); };
      const draw = () => {
        const q = Math.round(s.p * 50) / 50;
        w.rebuild(el.sheet, q, () => at(q)[0]);
        w.rebuild(el.lungs, q, () => at(q)[1]);
        if (lab) w.rebuild(el.words, s.p > 0.5, () => ISO.word(K.iso([24, 0, JAR.z1 - 46], P), "balloons = lungs", "#8a2a44", { size: 13, anchor: "start" }) + ISO.word(K.iso([0, 0, JAR.z0 - 24], P), s.p > 0.5 ? "diaphragm pulled down" : "diaphragm up", "#a3271b", { size: 13, anchor: "start", dy: 6 }));
      };
      g.set = (p) => { if (p.pull !== undefined) s.pT = ISO.clamp(+p.pull, 0, 1); };
      g.update = (dt) => { s.p = ISO.follow(s.p, s.pT, dt, 0.5, ISO.still()); draw(); return s.p !== s.pT; };
      g.readout = () => { const moving = Math.abs(s.p - s.pT) > 0.01, inn = s.pT > s.p; return moving ? (s.pT > 0.5 ? `breathing in · jar pressure about ${(ROOM - 0.3).toFixed(1)} kPa, below the room's ${ROOM} kPa, so air rushes in` : `breathing out · the sheet springs back, jar pressure rises above ${ROOM} kPa, air is pushed out`) : s.p > 0.5 ? "lungs full · pressures equal again" : "lungs empty · pressures equal"; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
