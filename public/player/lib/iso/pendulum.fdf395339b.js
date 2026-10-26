// "pendulum cx topY length L=0.5 angle=15 lab=1" — a pendulum on a lab stand, swinging at its true rate.
// A brass bob on a thread hangs from a clamp; a protractor behind the pivot reads the angle, and a light gate under
// the bob counts each pass. The period is T = 2π√(L/g): L in metres (0.5 m gives 1.42 s), independent of the bob's
// mass and, for small swings, of the angle. set({ swing: 1|0, L, angle }) releases or stops it, or changes it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, BOARD = { x: -80, y: -44, w: 160, d: 80, r: 6 }, POST = [-58, -30], PIVOT = [0, 0, 150];
  const PER_M = 230;                     // world units per metre of thread (0.5 m ≈ 115 units)
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const bobOf = (len, th) => [PIVOT[0] + Math.sin(th) * len, 0, PIVOT[2] - Math.cos(th) * len];

  function standSvg(P, lab, len) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 30, y: -36, w: 40, d: 14, r: 1.2 })];
    out.push(S(K.cylinder(POST[0], POST[1], 7, 0, 3, P, 32, 0.5), { tone: "mid" }), S(K.cylinder(POST[0], POST[1], 2.6, 3, 162, P, 24), { tone: "mid", crease: "none" }), S(K.cylinder(POST[0], POST[1], 3, 165, 1.4, P, 24), { tone: "mid" }));
    out.push(ISO.wbox(P, [POST[0] - 5, POST[0] + 5], [POST[1] - 5, POST[1] + 5], [PIVOT[2] - 6, PIVOT[2] + 6], "mid"));
    // Arm from the boss to the pivot, a split clamp holding the thread, and a thumb screw.
    out.push(S(G.disc(0, 58, 2, G.frameOf([POST[0] + 5, POST[1], PIVOT[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [-4, 4], [POST[1] + 2, 3], [PIVOT[2] - 2, PIVOT[2] + 4], "mid"));
    // A protractor plate behind the pivot (in the swing plane, just behind it), ticks every 5°, zero at the bottom.
    const pr = 30, ticks = [], major = [], arc = [];
    for (let d = -60; d <= 60; d += 1) arc.push(K.iso([PIVOT[0] + Math.sin((d * Math.PI) / 180) * pr, -1.4, PIVOT[2] - Math.cos((d * Math.PI) / 180) * pr], P));
    out.push(ISO.prismY(P, [[-pr - 3, PIVOT[2] + 2], ...ISO.arc(0, PIVOT[2], pr + 3, -Math.PI / 2 - 1.12, -Math.PI / 2 + 1.12, 30).map(([x, z]) => [x, z]), [pr + 3, PIVOT[2] + 2]].map(([x, z]) => [x, Math.min(z, PIVOT[2] + 2)]), -2.6, -1.6, ["#c9dde9", "#eef6fb"], "#eef6fb", "#5d7f96"));
    for (let d = -60; d <= 60; d += 5) (d % 15 ? ticks : major).push(K.segment([Math.sin((d * Math.PI) / 180) * pr, -1.5, PIVOT[2] - Math.cos((d * Math.PI) / 180) * pr], [Math.sin((d * Math.PI) / 180) * (pr - (d % 15 ? 2.5 : 4.5)), -1.5, PIVOT[2] - Math.cos((d * Math.PI) / 180) * (pr - (d % 15 ? 2.5 : 4.5))], P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), L(ticks.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    // Light gate under the bob's lowest point: a U frame on a foot, an LED and a sensor facing each other.
    const gz = Math.max(8, PIVOT[2] - len - 6);
    // On its own rod behind the swing plane: a foot, the rod, a bar under the bob's path and two arms either side of it.
    out.push(S(K.cylinder(0, -26, 5, 0, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(0, -26, 1.6, 2.4, gz - 6.4, P, 16), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [-3, 3], [-28, 12], [gz - 4, gz - 1], "mid"));
    out.push(ISO.wbox(P, [-3, 3], [-12, -9], [gz - 1, gz + 9], "mid"), ISO.wbox(P, [-3, 3], [9, 12], [gz - 1, gz + 9], "mid"));
    out.push(D([K.iso([0, -8.9, gz + 5], P), K.iso([3.1, 10.5, gz + 5], P)], { size: 0.9, tone: "hi" }));
    if (lab) out.push(ISO.word(K.iso([6, 12, gz - 6], P), "Light gate", "#555", { anchor: "start", dy: 12, size: 14 }));
    return out.join("");
  }

  ISO.add({
    name: "pendulum", title: "Pendulum", compare: "pendulum 480 120 260",
    about: "Pendulum on a lab stand with a protractor and a light gate: it swings at its true period, T = 2π√(L/g).",
    line: "pendulum cx topY length L=0.5 angle=15 lab=1",
    demo: { line: "pendulum 480 60 300", script: [{ set: { swing: 1 }, hold: 6 }, { set: { swing: 0 }, hold: "settle" }, { set: { L: 0.25 }, hold: 1 }, { set: { swing: 1 }, hold: 5 }] },
    make([cx, top, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 1.6;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [POST[0], POST[1], 168], [36, 0, PIVOT[2] + 4]], cx, top + H / 2, W, H, { azimuth: 62, elevation: 20 }, parent);
      const m = { L: ISO.clamp(ISO.num(o, "L", 0.5), 0.2, 0.62), angle: ISO.clamp(ISO.num(o, "angle", 15), 3, 25) };
      const s = { swing: false, t: 0, th: 0, passes: 0, last: 0 };
      const w = ISO.writer();
      let built = "", el = {};
      const build = () => {
        const len = m.L * PER_M;
        g.innerHTML = `<g>${standSvg(P, lab, len)}</g><path data-part="thread" fill="none" stroke="#5b4a2e" stroke-width="1" stroke-linecap="round"/><g data-part="bob"></g>`;
        el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      };
      const draw = () => {
        if (built !== String(m.L)) { built = String(m.L); build(); }
        const len = m.L * PER_M, b = bobOf(len, s.th), hook = bobOf(len - 6.5, s.th);
        w.attr(el.thread, "d", K.pathOf([K.iso([PIVOT[0], 0.5, PIVOT[2] - 1], P), K.iso(hook, P)]));
        w.rebuild(el.bob, s.th.toFixed(4), () => {
          const F = G.frameOf(hook, [-Math.sin(s.th), 0, Math.cos(s.th)], [Math.cos(s.th), 0, Math.sin(s.th)], [0, 1, 0]);
          return S(G.disc(-1.2, 0, 1, F, P), { tone: "mid" }) + ISO.tinted(ISO.T.brass, S(G.sphereOf(b, 5.5, P), { tone: "hi", lit: true })) +
            (lab ? ISO.word(K.iso(bobOf(len / 2, s.th).map((v, i) => v + (i === 0 ? 5 : 0)), P), `L = ${m.L} m`, "#555", { anchor: "start", size: 14 }) : "");
        });
      };
      g.set = (p) => {
        if (p.L !== undefined) { m.L = ISO.clamp(+p.L, 0.2, 0.62); s.swing = false; s.th = 0; }
        if (p.angle !== undefined) m.angle = ISO.clamp(+p.angle, 3, 25);
        if (p.swing !== undefined) { s.swing = !!+p.swing; s.t = 0; s.passes = 0; if (!s.swing) s.stop = true; }
      };
      g.update = (dt) => {
        const w0 = Math.sqrt(g9 / m.L), A = (m.angle * Math.PI) / 180;
        if (s.swing && !ISO.still()) {
          s.t += dt;
          const th = A * Math.cos(w0 * s.t) * Math.exp(-0.02 * s.t);   // a little air drag
          if (Math.sign(th) !== Math.sign(s.th) && s.t > 0.05) s.passes++;
          s.th = th;
        } else if (s.stop) { s.th = ISO.follow(s.th, 0, dt, 0.25, ISO.still()); if (s.th === 0) s.stop = false; }
        else if (ISO.still() && s.swing) s.th = A;
        draw();
        return s.swing || !!s.stop;
      };
      g.readout = () => {
        const T = 2 * Math.PI * Math.sqrt(m.L / g9);
        return `L = ${m.L} m · period T = 2π√(L/g) = ${T.toFixed(2)} s · light gate passes ${s.passes} (${(s.passes / 2).toFixed(1)} swings)`;
      };
      draw();
      if (t) label(parent, cx, top - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
