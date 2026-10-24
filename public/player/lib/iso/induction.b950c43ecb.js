// "induction cx cy width lab=1" — a bar magnet pushed into a coil wired to a centre-zero galvanometer.
// The needle moves only while the magnet moves: in one way for "in", the other for "out", and further the faster it
// goes (the current follows the rate of change of the field through the coil, Faraday's law). Held still, inside or
// out, it reads zero. set({ at: 0..1, speed }) moves the magnet in (1) or out (0) at a speed (cm/s).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -120, y: -50, w: 240, d: 100, r: 6 }, AXZ = 24, COIL = { x0: -40, x1: 30, r: 12 }, MAG = { l: 60, w: 10 };
  const OUT_X = COIL.x1 + MAG.l / 2 + 26, IN_X = COIL.x1 - MAG.l / 2 + 8, GAL = [-80, 20];
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // How much of the magnet's field threads the coil, from how far its north end has gone in (0 = none, 1 = full).
  const fluxAt = (mx) => { const tip = mx - MAG.l / 2, inside = ISO.clamp((COIL.x1 - tip) / (COIL.x1 - COIL.x0), 0, 1); return ISO.smooth(0, 1, inside); };

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 70, y: -44, w: 40, d: 12, r: 1 })];
    // The coil: a plastic former with end cheeks on two saddles, wound with copper.
    for (const x of [COIL.x0 + 6, COIL.x1 - 6]) out.push(ISO.wbox(P, [x - 4, x + 4], [-12, 12], [0, AXZ - COIL.r + 2], "mid"));
    out.push(S(G.disc(COIL.x0 - 2, COIL.x0, COIL.r + 3, xAx([0, 0, AXZ]), P), { tone: "mid" }));
    return out.join("");
  }
  const coilFront = (P) => {
    const c = K.coil(COIL.x0, COIL.x1, [0, AXZ], COIL.r, 22, "x", P);
    return { back: `<path d="${c.back}" fill="none" stroke="#9a5a22" stroke-width="1.8"/>`, front: `<path d="${c.front}" fill="none" stroke="#c97a3a" stroke-width="2"/>` + S(G.disc(COIL.x1, COIL.x1 + 2, COIL.r + 3, xAx([0, 0, AXZ]), P), { tone: "mid" }) +
      `<path d="${K.pathOf([[COIL.x1, 0, AXZ + 12 + 2], [COIL.x1, 0, AXZ + 18], [COIL.x1 + 6, 22, 4], [GAL[0] + 10, GAL[1] + 4, 22]].map((p) => K.iso(p, P)))}${K.pathOf([[COIL.x0, 0, AXZ + 14], [COIL.x0, 0, AXZ + 18], [COIL.x0 - 10, 18, 4], [GAL[0] - 10, GAL[1] + 4, 22]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="1.3"/>` };
  };
  // A centre-zero galvanometer: a case with a dial in its front face, the needle at `v` (−1..1).
  function galvoSvg(P, v) {
    const [x, y] = GAL, out = [ISO.wbox(P, [x - 16, x + 16], [y - 10, y + 10], [0, 22], "mid")];
    const c = [x, y + 10.05, 6], rr = 11, arc = [], ticks = [];
    out.push(`<path d="${K.pathOf([[x - 13, y + 10.05, 3], [x + 13, y + 10.05, 3], [x + 13, y + 10.05, 20], [x - 13, y + 10.05, 20]].map((p) => K.iso(p, P)), true)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.6"/>`);
    for (let d = -45; d <= 45; d += 3) arc.push(K.iso([c[0] + Math.sin((d * Math.PI) / 180) * rr, c[1], c[2] + Math.cos((d * Math.PI) / 180) * rr], P));
    for (let d = -45; d <= 45; d += 15) ticks.push(K.segment([c[0] + Math.sin((d * Math.PI) / 180) * rr, c[1], c[2] + Math.cos((d * Math.PI) / 180) * rr], [c[0] + Math.sin((d * Math.PI) / 180) * (rr + (d ? 1.8 : 3)), c[1], c[2] + Math.cos((d * Math.PI) / 180) * (rr + (d ? 1.8 : 3))], P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(ticks.join(""), { tone: "mid", free: "end" }));
    const d = ISO.clamp(v, -1, 1) * 45 * (Math.PI / 180);
    out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, [c[0] + Math.sin(d) * (rr + 1), c[1], c[2] + Math.cos(d) * (rr + 1)], P)}" style="stroke-width:1.3"/>`, D([K.iso(c, P)], { size: 0.8, tone: "hi" }));
    for (const e of [x - 10, x + 10]) out.push(S(K.cylinder(e, y + 4, 2.2, 22, 3, P, 16), { tone: "hi" }));
    return out.join("");
  }
  function magnetSvg(P, mx) {
    const red = ISO.tint("#f9dcd7", ["#e07a6c", "#e88e82", "#efa398", "#f4b8ae"], "#8a1d16"), blue = ISO.tint("#dde8f6", ["#7d9fcf", "#91afd8", "#a6bfe0", "#bacde8"], "#1f4f8f");
    return ISO.tinted(red, ISO.wbox(P, [mx - MAG.l / 2, mx], [-MAG.w / 2, MAG.w / 2], [AXZ - MAG.w / 2, AXZ + MAG.w / 2], "hi")) +
      ISO.tinted(blue, ISO.wbox(P, [mx, mx + MAG.l / 2], [-MAG.w / 2, MAG.w / 2], [AXZ - MAG.w / 2, AXZ + MAG.w / 2], "hi")) +
      K.faceTextSvg(K.topMatrix([mx - MAG.l / 2 + 4, 3], AXZ + MAG.w / 2, P, "x"), "N", { size: 7, tone: "hi" }) + K.faceTextSvg(K.topMatrix([mx + MAG.l / 2 - 10, 3], AXZ + MAG.w / 2, P, "x"), "S", { size: 7, tone: "hi" });
  }

  ISO.add({
    name: "induction", title: "Electromagnetic induction", compare: "induction 480 260 440",
    about: "A bar magnet moved into and out of a coil: the galvanometer swings only while it moves, opposite ways for in and out, further when faster.",
    line: "induction cx cy width lab=1",
    demo: { line: "induction 480 270 440", script: [{ set: { at: 1, speed: 10 }, hold: "settle" }, { set: {}, hold: 1.4 }, { set: { at: 0, speed: 30 }, hold: "settle" }, { set: {}, hold: 1.2 }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.25, H = size * 0.7;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, AXZ + 24]], cx, cy, W, H, { azimuth: 62, elevation: 30 }, parent);
      const s = { mx: OUT_X, target: OUT_X, speed: 10, v: 0, needle: 0, flux: fluxAt(OUT_X) };
      const c = coilFront(P);
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g>${c.back}</g><g data-part="magnet"></g><g>${c.front}</g><g data-part="galvo"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.attr(el.magnet, "transform", K.translateAlong(P, [s.mx - OUT_X, 0, 0]));
        if (!el.magnet.firstChild) el.magnet.innerHTML = `<g data-name="magnet">${magnetSvg(P, OUT_X)}</g>`;
        w.rebuild(el.galvo, s.needle.toFixed(3), () => galvoSvg(P, s.needle));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([GAL[0], GAL[1] + 10, 0], P), "galvanometer (zero in the middle)", "#555", { size: 13, dy: 18 }) + ISO.word(K.iso([(COIL.x0 + COIL.x1) / 2, 0, AXZ + 16], P), "coil", "#9a5a22", { size: 13, dy: -6 }));
      };
      g.set = (p) => { if (p.at !== undefined) s.target = +p.at ? IN_X : OUT_X; if (p.speed !== undefined) s.speed = ISO.clamp(+p.speed, 2, 60); };
      g.update = (dt) => {
        const step = (s.speed * 2) * dt, before = fluxAt(s.mx);
        if (ISO.still()) s.mx = s.target; else s.mx += Math.sign(s.target - s.mx) * Math.min(step, Math.abs(s.target - s.mx));
        const rate = dt > 0 ? (fluxAt(s.mx) - before) / dt : 0;            // change of flux per second
        s.needle = ISO.follow(s.needle, ISO.clamp(rate * 1.6, -1, 1), dt, 0.08, ISO.still());
        draw();
        return s.mx !== s.target || Math.abs(s.needle) > 1e-3;
      };
      g.readout = () => `${s.mx === s.target ? "magnet still" : s.target === IN_X ? `pushing in at ${s.speed} cm/s` : `pulling out at ${s.speed} cm/s`} · needle ${s.needle > 0.02 ? "right" : s.needle < -0.02 ? "left" : "at zero"} · current only while the field through the coil changes`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
