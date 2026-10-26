// "wheelaxle cx cy size load=2 lab=1" — a wheel and axle (windlass) lifting a bucket.
// A big handwheel (radius R) and a small drum (radius r) turn together on one axle between two posts; the rope winds
// on the drum and lifts a bucket of water. Turning the handle on the rim needs effort = load × r/R (here R/r = 4.25,
// so a 2 kg bucket, 19.6 N, needs 4.6 N), but the handle travels R/r times as far as the bucket rises.
// set({ turns }) winds the rope by that many turns (bucket rises 2πr per turn).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, BOARD = { x: -74, y: -44, w: 160, d: 88, r: 6 }, AX = [0, 0, 112], R = 34, r = 8, WX = 46;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function frameSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 30, y: -38, w: 40, d: 12, r: 1.2 })];
    // A stone well ring under the bucket.
    out.push(ISO.tinted(ISO.T.road, S(K.cylinder(0, r, 24, 0, 14, P, 56, 0.6), { tone: "mid", inner: L(K.sideArc(0, r, 24, 7, P, 40), { tone: "faint" }) }) + S(K.cylinder(0, r, 19, 14, 0.1, P, 48), { tone: "lo", flat: true })));
    // Two posts with a beam across the top and bearing blocks for the axle.
    for (const x of [-34, 26]) out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x, x + 8], [-5, 5], [0, AX[2] + 6], "mid")), ISO.wbox(P, [x - 1, x + 9], [-6, 6], [AX[2] - 5, AX[2] + 5], "mid"));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-38, 38], [-5, 5], [AX[2] + 6, AX[2] + 12], "mid")));
    // The axle through both bearings out to the wheel, and the drum the rope winds on.
    out.push(S(G.disc(-36, WX, 2.2, xAx(AX), P), { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.wood, S(G.disc(-14, 14, r, xAx(AX), P), { tone: "hi" })));
    if (lab) out.push(ISO.word(K.iso([0, 34, 0], P), "well", "#555", { size: 13, dy: 18 }));
    return out.join("");
  }
  const rimSvg = (P) => { const F = xAx([WX, 0, AX[2]]); return ISO.tinted(ISO.T.steel, S(G.ringBand(0, 3, R - 3, R, F, P), { tone: "hi" }) + S(G.disc(0, 4, 5, F, P), { tone: "mid" })); };
  // The handwheel's spokes and its handle, turned by angle a (the wheel stands in the y–z plane at x = WX).
  function wheelSvg(P, a) {
    const F = xAx([WX, 0, AX[2]]), out = [];
    out.push(L(G.spokesOf(F, 3, 5, R - 3, 6, P, { phase: a }) + G.circleOf(F, 3, R - 3, P) + G.circleOf(F, 3, 5, P), { tone: "mid" }));
    const h = [WX, Math.cos(a) * (R - 1.5), AX[2] + Math.sin(a) * (R - 1.5)];
    out.push(S(G.disc(0, 12, 1.8, xAx(h), P), { tone: "hi", lit: true }), S(G.disc(4, 12, 2.6, xAx(h), P), { tone: "hi", lit: true }));
    return out.join("");
  }
  function bucketSvg(P, z, kg, lab) {
    const F = G.frameOf([0, r, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]), out = [];
    out.push(ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, 9], [16, 11], [16, 0]], F, P), { tone: "hi" }) + L(G.arcOf(F, 4, 9.5, P) + G.arcOf(F, 12, 10.5, P), { tone: "lo" })));
    out.push(S(G.disc(15.6, 16, 9.4, F, P), { tone: "lo", flat: true }));
    out.push(`<path d="${K.pathOf(ISO.arc(0, z + 16, 11, 0, Math.PI, 14).map(([x, zz]) => K.iso([x, r, zz], P)))}" fill="none" stroke="#4e535a" stroke-width="1"/>`);
    if (lab) out.push(ISO.word(K.iso([-16, r, z + 8], P), `${kg} kg of water`, "#2b6cc4", { anchor: "end", size: 13 }));
    return out.join("");
  }

  ISO.add({
    name: "wheelaxle", title: "Wheel and axle", compare: "wheelaxle 480 250 280",
    about: "A windlass over a well: the big wheel and small drum turn together, so a small effort on the rim lifts a heavy bucket.",
    line: "wheelaxle cx cy size load=2 lab=1",
    demo: { line: "wheelaxle 480 270 340", script: [{ set: { turns: 1 }, hold: "settle" }, { set: { turns: 2 }, hold: "settle" }, { set: { turns: 0 }, hold: "settle" }] },
    make([cx, cy, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 1.3;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-40, 0, AX[2] + 16], [WX + 12, R, AX[2] + R], [WX, -R, AX[2] + R]], cx, cy, W, H, { azimuth: 58, elevation: 20 }, parent);
      const m = { load: ISO.clamp(ISO.num(o, "load", 2), 0.5, 5) }, s = { turns: 0, target: 0 };
      g.innerHTML = `<g>${frameSvg(P, lab)}</g><path data-part="rope" fill="none" stroke="#6b5a3a" stroke-width="1.3"/><g data-part="bucket">${bucketSvg(P, 4, m.load, lab)}</g><g>${rimSvg(P)}</g><g data-part="wheel"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const bottom0 = 4;                                     // the bucket starts down in the well
      const draw = () => {
        const a = s.turns * Math.PI * 2, rise = s.turns * 2 * Math.PI * r, z = bottom0 + rise;
        w.attr(el.rope, "d", K.pathOf([K.iso([0, r, AX[2]], P), K.iso([0, r, z + 27], P)]));
        w.attr(el.bucket, "transform", K.translateAlong(P, [0, 0, rise]));
        w.rebuild(el.wheel, a.toFixed(3), () => wheelSvg(P, -a));
      };
      g.set = (p) => { if (p.turns !== undefined) s.target = ISO.clamp(+p.turns, 0, 1.6); if (p.load !== undefined) m.load = +p.load; };
      g.update = (dt) => { s.turns = ISO.follow(s.turns, s.target, dt, 0.7, ISO.still()); draw(); return s.turns !== s.target; };
      g.readout = () => {
        const F = m.load * g9;
        return `load ${F.toFixed(1)} N · effort = load × r/R = ${F.toFixed(1)} × ${r}/${R} = ${((F * r) / R).toFixed(1)} N · ${s.turns.toFixed(2)} turns · bucket up ${(s.turns * 2 * Math.PI * r).toFixed(0)}, handle moved ${(s.turns * 2 * Math.PI * R).toFixed(0)}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
