// "circulation cx cy size flow=1 lab=1" — a working model of the double circulation.
// Two pumps sit side by side on a board as the heart: the right pump (blue) sends blood up to the lungs, a coil of
// fine tubes where it picks up oxygen and turns red, back to the left pump (red), which sends it to the body coil,
// where it gives up oxygen and turns blue, back to the right pump. The blood goes through the heart twice per
// round. The pumps squeeze at 72 beats a minute (shown slower) and the flow marches with each beat.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RED = "#c0392b", BLUE = "#2b6cc4", PANEL_Y = -20;
  const LUNG = [0, PANEL_Y, 128], BODY = [0, PANEL_Y, 22], RP = [-34, 0, 70], LP = [34, 0, 70];

  // A coil of capillaries in a frame: a zigzag of thin tubes that changes colour from inlet to outlet.
  function coilSvg(P, c, from, to, label, lab) {
    const out = [ISO.tinted(ISO.T.paint, ISO.wbox(P, [c[0] - 46, c[0] + 46], [c[1] - 3, c[1]], [c[2] - 14, c[2] + 14], "mid"))];
    const pts = [];
    for (let i = 0; i <= 10; i++) { const x = c[0] - 38 + i * 7.6; pts.push([x, c[1] + 0.5, c[2] + (i % 2 ? 9 : -9)]); }
    for (let i = 0; i < pts.length - 1; i++) { const f = i / (pts.length - 2), col = f < 0.5 ? from : to; out.push(`<path d="${K.pathOf([K.iso(pts[i], P), K.iso(pts[i + 1], P)])}" stroke="${col}" stroke-width="2.2" stroke-linecap="round" opacity="${(0.6 + 0.4 * Math.abs(f - 0.5) * 2).toFixed(2)}"/>`); }
    if (lab) out.push(ISO.word(K.iso([c[0] + 50, c[1], c[2]], P), label, "#444", { size: 14, anchor: "start" }));
    return out.join("");
  }
  // A pump: a squeezable chamber on a block with valves in and out, squeezed by s (0..1).
  function pumpSvg(P, c, color, s, name) {
    const tint = color === RED ? ISO.T.red : ISO.T.blue, r = 13 - 3 * s;
    // On a slim post, so the body coil behind stays in view.
    return `<g data-name="${name}">${S(K.cylinder(c[0], 0, 6, 0, 3, P, 24, 0.4), { tone: "mid" })}${S(K.cylinder(c[0], 0, 2, 3, c[2] - 15, P, 14), { tone: "mid", crease: "none" })}${ISO.tinted(tint, S(G.sphereOf(c, r, P), { tone: "hi" }))}</g>`;
  }
  // Tubes: four big vessels as thick strokes with marching dashes in the flow direction.
  const vessels = () => [
    { pts: [[RP[0], 0, RP[2] + 12], [RP[0], 0, LUNG[2] - 20], [-46, PANEL_Y, LUNG[2] - 9]], c: BLUE, name: "to lungs" },
    { pts: [[46, PANEL_Y, LUNG[2] - 9], [LP[0], 0, LUNG[2] - 20], [LP[0], 0, LP[2] + 12]], c: RED, name: "from lungs" },
    { pts: [[LP[0], 0, LP[2] - 12], [LP[0], 0, BODY[2] + 20], [46, PANEL_Y, BODY[2] + 9]], c: RED, name: "to body" },
    { pts: [[-46, PANEL_Y, BODY[2] + 9], [RP[0], 0, BODY[2] + 20], [RP[0], 0, RP[2] - 12]], c: BLUE, name: "from body" },
  ];

  ISO.add({
    name: "circulation", title: "Double circulation (model)", compare: "circulation 480 280 400",
    about: "Two pumps (the heart) drive blood up through the lungs, where it turns red, back, then out round the body, where it turns blue.",
    line: "circulation cx cy size flow=1 lab=1",
    demo: { line: "circulation 480 280 400 flow=0", script: [{ set: { flow: 1 }, hold: 6 }, { set: { flow: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.25, H = size * 1.0;
      const { P, g } = ISO.frame([[-70, -40, -10], [70, 30, -10], [-60, PANEL_Y, 150], [100, PANEL_Y, 150]], cx, cy, W, H, { azimuth: 72, elevation: 14 }, parent);
      g.innerHTML = `<g>${ISO.baseboard(P, { x: -70, y: -34, w: 140, d: 64, r: 6 }, { h: 6 })}${ISO.tinted(ISO.tint("#f4f7fa", ["#d8dee5", "#e0e6ec", "#e8edf2", "#eff3f7"], "#6b7a88"), ISO.wbox(P, [-60, 60], [PANEL_Y - 6, PANEL_Y - 3], [0, 150], "lo"))}` +
        `${coilSvg(P, LUNG, BLUE, RED, "lungs: blood picks up oxygen", lab)}${coilSvg(P, BODY, RED, BLUE, "body: oxygen used, CO₂ picked up", lab)}</g>` +
        `<g data-part="vessels"></g><g data-part="pumps"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      el.vessels.innerHTML = vessels().map((v) => { const d = K.pathOf(v.pts.map((p) => K.iso(p, P))); return `<path d="${d}" stroke="${v.c}" stroke-width="6" fill="none" stroke-linejoin="round" opacity=".85"/><path class="cr-flow" d="${d}" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-dasharray="3 7"/>`; }).join("");
      if (lab) el.words.innerHTML = ISO.word(K.iso([RP[0], 12, RP[2] - 18], P), "right side (to lungs)", BLUE, { size: 13, dy: 16 }) + ISO.word(K.iso([LP[0], 12, LP[2] - 18], P), "left side (to body)", RED, { size: 13, dy: 16 });
      const flows = [...el.vessels.querySelectorAll(".cr-flow")];
      const s = { on: o.flow !== "0", t: 0, sq: 0 };
      const SLOW = 3, period = 60 / 72;
      const draw = () => {
        w.rebuild(el.pumps, s.sq.toFixed(2), () => pumpSvg(P, RP, BLUE, s.sq, "right pump") + pumpSvg(P, LP, RED, s.sq, "left pump"));
        flows.forEach((f) => w.attr(f, "stroke-dashoffset", (-s.t * 18).toFixed(1)));
      };
      g.set = (p) => { if (p.flow !== undefined) s.on = !!+p.flow; };
      g.update = (dt) => {
        if (s.on && !ISO.still()) { s.t += dt * (0.4 + Math.max(0, Math.sin((s.t / (period * SLOW)) * Math.PI * 2))); const ph = ((s.t / (period * SLOW)) % 1); s.sq = ISO.smooth(0, 0.1, ph) * (1 - ISO.smooth(0.3, 0.4, ph)); }
        else s.sq = ISO.follow(s.sq, 0, dt, 0.2, ISO.still());
        draw();
        return s.on || s.sq > 0;
      };
      g.readout = () => (s.on ? "72 beats a minute (shown 3× slower) · right pump → lungs → left pump → body → back · each round passes the heart twice" : "pumps stopped");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
