// "satellite cx cy width rot=deg sun=0-360 lab=1 lit=bus|wings|dish|tracker|thrusters" — a communications satellite.
// A box-shaped bus wrapped in gold foil (it keeps the inside at room temperature), with white radiator panels that
// shed the electronics' heat, two solar wings of three panels each on yokes, turned by drive motors so the cells
// always face the sun, the big dish on the Earth-facing side with its feed horn on struts, a small dish and a whip
// antenna on top, the star tracker that finds which way the satellite points, and the engine bell and four small
// thrusters underneath that keep it in its slot. sun= is the sun's direction (degrees round the wings' axis): the
// wings turn to face it and the power follows how square-on they are. rot= turns the whole satellite on the board.
// set({ sun, rot, lit }). World units: 1 = 1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const rad = (d) => (d * Math.PI) / 180, BX = 1, BY = 1, BZ = 1.3, W0 = 2.4, PW = 2.1, PH = 0.9, SUN_D = 7.5;
  const GOLD = ISO.tint("#f6e3a6", ["#c9a24a", "#d4b05c", "#dfc072", "#ead08c"], "#6b5114"), WHITE = ISO.tint("#f7f8f9", ["#c3c7cc", "#cfd2d6", "#dadde0", "#e6e8ea"], "#5a5f66");
  const CELLS = ISO.tint("#3d5f9e", ["#1d2f57", "#243a68", "#2c4679", "#34528a"], "#0f1c3a");
  const kwOf = (off) => 2 * 3 * PW * (PH * 2) * 1.361 * 0.3 * Math.max(0, Math.cos(rad(off)));

  // turn about z by the satellite's own rotation (rot), so a script can show it from any side
  const yaw = (r) => { const c = Math.cos(rad(r)), s = Math.sin(rad(r)); return ([x, y, z]) => [x * c - y * s, x * s + y * c, z]; };
  const boxR = (P, Y, [x0, x1], [y0, y1], [z0, z1], tone) => ISO.box((u, w, v) => Y([u, w, v]), P, [x0, x1], [y0, y1], [z0, z1], tone);

  // The satellite floats in space: every part is fixed to the bus, a turned ISO.box audit.mjs doesn't record, so it
  // reads them all as loose.
  function busSvg(P, Y) {
    const out = [`<g data-name="bus">${ISO.tinted(GOLD, boxR(P, Y, [-BX, BX], [-BY, BY], [-BZ, BZ], "hi"))}`];
    // radiators on the north and south faces, seams of the foil blankets
    for (const y of [-BY - 0.06, BY]) out.push(ISO.tinted(WHITE, boxR(P, Y, [-0.8, 0.8], [y, y + 0.06], [-1.0, 1.0], "mid")));
    out.push("</g>");
    return out.join("");
  }
  function bottomSvg(P, Y) {
    const out = [`<g data-name="thrusters">`];
    const bell = (c, r, len) => { const F = G.frameAlong(Y(c), Y([0, 0, -1]).map((v, i) => v - Y([0, 0, 0])[i])); return ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, r * 0.4], [len * 0.3, r * 0.35], [len, r], [len, 0]], F, P, { steps: 20 }), { tone: "mid" })); };
    out.push(bell([0, 0, -BZ], 0.42, 0.7));
    for (const [x, y] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) out.push(bell([x, y, -BZ], 0.09, 0.22));
    return out.join("") + "</g>";
  }
  // the top deck: the star tracker's box and sun baffle, the small dish, the whip antenna
  function topSvg(P, Y) {
    const out = [`<g data-name="tracker">${ISO.tinted(WHITE, boxR(P, Y, [-0.8, -0.4], [-0.6, -0.2], [BZ, BZ + 0.3], "mid"))}`];
    const up = Y([0, 0, 1]).map((v, i) => v - Y([0, 0, 0])[i]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[0, 0], [0, 0.12], [0.35, 0.16], [0.35, 0]], G.frameAlong(Y([-0.6, -0.4, BZ + 0.3]), up), P, { steps: 16 }), { tone: "mid" })), "</g>");
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 1.4, 0.03, G.frameAlong(Y([0.7, 0.7, BZ]), up), P, { steps: 6 }), { tone: "mid", crease: "none" })));
    const df = G.frameAlong(Y([0.3, 0.2, BZ + 0.5]), G.unit3(G.add3(up, [0.3, 0.2, 0])));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(...Y([0.3, 0.2, 0]).slice(0, 2), 0.05, BZ, 0.5, P, 8), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(WHITE, S(G.lathe([[0, 0], [0, 0.05], [0.08, 0.3, 1], [0.12, 0.4], [0.14, 0.4], [0.14, 0]], df, P, { steps: 24 }), { tone: "hi" })));
    return out.join("");
  }
  // the big dish on the Earth-facing (+y) side, tipped down toward Earth, with its feed on three struts
  function dishSvg(P, Y) {
    const out = [`<g data-name="dish">`], ax = G.unit3(G.sub3(Y([0, 1, -0.55]), Y([0, 0, 0]))), F = G.frameAlong(Y([0, BY + 0.5, 0.3]), ax);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-0.5, 0.02, 0.06, F, P, { steps: 8 }), { tone: "mid" })));
    const shell = []; for (let i = 1; i <= 8; i++) { const r = (1.1 * i) / 8; shell.push([(r * r) / 3 - 0.04, r, 1]); }
    out.push(ISO.tinted(WHITE, S(G.lathe([[-0.04, 0], ...shell, [0.41, 1.14], [0.41, 0]], F, P, { steps: 48 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(F, 0.42, 1.1, P, 48)}" fill="#eef0f2" stroke="#5a5f66" stroke-width=".7"/>`);
    const foc = G.pointOf(F, 0.75 * 1.0 + 0.1, 0, 0);
    for (const a of [0, 2.1, 4.2]) { const tp = G.pointOf(F, 0.4, 1.0, a), d = G.sub3(foc, tp); out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 0.025, G.frameAlong(tp, d), P, { steps: 6 }), { tone: "mid", crease: "none" }))); }
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 0.06], [0.22, 0.13], [0.22, 0]], G.frameAlong(foc, G.mul3(ax, -1)), P, { steps: 16 }), { tone: "hi" })));
    return out.join("") + "</g>";
  }
  // one wing: the drive motor on the bus side, the yoke, three panels turned to angle th about the x axis
  function wingSvg(P, Y, side, th) {
    const out = [], c = Math.cos(rad(th)), s = Math.sin(rad(th));
    const at = (u, w, v) => Y([side * u, w * c - v * s, w * s + v * c]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.35, 0.24, G.frameAlong(Y([side * BX, 0, 0]), G.sub3(Y([side, 0, 0]), Y([0, 0, 0]))), P, { steps: 16 }), { tone: "mid" })));
    // the yoke: two rods from the motor out to the first panel's inner corners
    for (const w of [-PH * 0.7, PH * 0.7]) { const a = Y([side * (BX + 0.35), 0, 0]), b = at(W0, w, 0), d = G.sub3(b, a); out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 0.035, G.frameAlong(a, d), P, { steps: 6 }), { tone: "mid", crease: "none" }))); }
    const cellsOf = (u0) => { const lines = []; for (let i = 1; i < 6; i++) { const u = u0 + (PW * i) / 6; lines.push(K.pathOf([K.iso(at(u, -PH, 0.031), P), K.iso(at(u, PH, 0.031), P)])); } lines.push(K.pathOf([K.iso(at(u0, 0, 0.031), P), K.iso(at(u0 + PW, 0, 0.031), P)])); return lines.join(""); };
    for (let k = 0; k < 3; k++) {
      const u0 = W0 + k * (PW + 0.08);
      out.push(ISO.tinted(CELLS, ISO.box(at, P, side > 0 ? [u0, u0 + PW] : [u0, u0 + PW], [-PH, PH], [-0.03, 0.03], "mid")));
      const front = K.depthOf(at(u0, 0, 1), P) > K.depthOf(at(u0, 0, 0), P);
      if (front) out.push(`<path d="${cellsOf(u0)}" stroke="#7d95c4" stroke-width=".45" fill="none"/>`);
      if (k < 2) out.push(ISO.tinted(ISO.T.steel, ISO.box(at, P, [u0 + PW, u0 + PW + 0.08], [-0.15, 0.15], [-0.03, 0.03], "mid")));
    }
    return out.join("");
  }
  function sunSvg(P, phi, k) {
    const p = K.iso([0, SUN_D * Math.cos(rad(phi)), SUN_D * Math.sin(rad(phi))], P);
    return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(1.6 * k).toFixed(1)}" fill="#ffe7a0" opacity=".45"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(0.75 * k).toFixed(1)}" fill="#ffd34a" stroke="#c98a10" stroke-width=".8"/>`;
  }

  ISO.add({
    name: "satellite", title: "Communications satellite", compare: "satellite 480 270 480 rot=-15",
    about: "A communications satellite: gold foil keeps it warm, its two solar wings turn to face the sun, and the big dish talks to Earth below.",
    line: "satellite cx cy width rot=deg sun=0-360 lab=1 lit=bus|wings|dish|tracker|thrusters",
    demo: { line: "satellite 480 270 480 rot=-15 sun=70", script: [{ set: {}, hold: 1.6 }, { set: { sun: 150, lit: "wings" }, hold: "settle" }, { set: { sun: 30 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.1, H = size * 0.8, span = W0 + 3 * PW + 0.3;
      const { P, g } = ISO.frame([[-span, -2, -2], [span, 2, 2], [span, -2, -2], [-span, 2, 2], [0, 0, SUN_D + 1], [0, SUN_D + 1, 0], [0, -SUN_D - 1, 0], [0, 0, -SUN_D * 0.5]], cx, cy, W, H, { azimuth: 30, elevation: 20 }, parent);
      const k = K.cameraOf(P).k;
      g.innerHTML = `<g data-part="sun"></g><g data-name="wings" data-part="far"></g><g data-part="body"></g><g data-name="wings" data-part="near"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { sun: q("sun"), body: q("body"), far: q("far"), near: q("near"), words: q("words") }, w = ISO.writer();
      const sun0 = ISO.num(o, "sun", 90);
      const s = { rot: ISO.num(o, "rot", 0), sun: sun0, wing: sun0 - 90, wantSun: sun0 };
      let lit = o.lit || "";
      // parts sorted far to near once per pose: the two wings either side of the bus, the top, the dish, the bottom
      // the bus and what's fixed to it are rebuilt only when rot changes; the wings, far one first, as they turn
      const bodySvg = (rot) => {
        const Y = yaw(rot), parts = [[[0, 0, -0.5], bottomSvg(P, Y)], [[0, 0, 0], busSvg(P, Y)], [[0, 0, 1.5], topSvg(P, Y)], [[0, 1.6, 0], dishSvg(P, Y)]];
        return parts.sort((a, b) => K.depthOf(Y(a[0]), P) - K.depthOf(Y(b[0]), P)).map(([, svg]) => svg).join("");
      };
      const farSide = (rot) => (K.depthOf(yaw(rot)([1, 0, 0]), P) > K.depthOf(yaw(rot)([-1, 0, 0]), P) ? -1 : 1);
      const draw = () => {
        const th = Math.round(s.wing / 2) * 2, off = Math.abs(((s.sun - 90 - s.wing + 540) % 360) - 180);
        w.rebuild(el.sun, String(Math.round(s.sun)), () => sunSvg(P, Math.round(s.sun), k));
        const fs = farSide(s.rot);
        w.rebuild(el.body, String(s.rot), () => bodySvg(s.rot));
        w.rebuild(el.far, `${s.rot} ${th}`, () => wingSvg(P, yaw(s.rot), fs, th));
        w.rebuild(el.near, `${s.rot} ${th}`, () => wingSvg(P, yaw(s.rot), -fs, th));
        w.rebuild(el.words, lab ? `${Math.round(off / 2)} ${s.rot}` : "", () => !lab ? "" : [
          ISO.word(K.iso([0, SUN_D * Math.cos(rad(s.sun)), SUN_D * Math.sin(rad(s.sun))], P), "sun", "#8a5a10", { size: 13, dy: -1.7 * k - 6 }),
          ISO.word(K.iso(yaw(s.rot)([span, 0, 0]), P), off < 3 ? "solar wings face the sun" : `wings ${Math.round(off)}° off the sun`, off < 3 ? "#1f3c78" : "#a3271b", { size: 13, anchor: "start", dy: 20 }),
          ISO.word(K.iso(yaw(s.rot)([0, BY + 1, -1.6]), P), "dish points down to Earth", "#444", { size: 13, dy: 26 }),
          ISO.word(K.iso(yaw(s.rot)([-BX, -BY, BZ]), P), "gold foil keeps it warm", "#6b5114", { size: 12, anchor: "end", dy: -10 })].join(""));
        w.light([...g.querySelectorAll('[data-name="bus"],[data-name="wings"],[data-name="dish"],[data-name="tracker"],[data-name="thrusters"]')], [...g.querySelectorAll(`[data-name="${lit}"]`)]);
      };
      g.set = (p) => {
        if (p.sun !== undefined) s.wantSun = +p.sun;
        if (p.rot !== undefined) s.rot = +p.rot;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the sun appears to move as the satellite orbits; the drive motors keep the wings turned square to it
      g.update = (dt) => {
        const calm = ISO.still(), d = ((s.wantSun - s.sun + 540) % 360) - 180;
        s.sun = Math.abs(d) < 0.1 ? s.wantSun : s.sun + (calm ? d : d * (1 - Math.exp(-dt / 0.5)));
        const want = s.sun - 90, e = ((want - s.wing + 540) % 360) - 180;
        s.wing = Math.abs(e) < 0.3 ? want : s.wing + (calm ? e : Math.sign(e) * Math.min(Math.abs(e), dt * 40));
        draw();
        return s.sun !== s.wantSun || s.wing !== want;
      };
      g.readout = () => { const off = Math.abs(((s.sun - 90 - s.wing + 540) % 360) - 180); return `wings ${Math.round(off)}° off the sun · ${kwOf(off).toFixed(1)} kW from 6 panels (sunlight 1.36 kW per m², cells about 30 % efficient) · the dish beams TV and phone signals to Earth from 36 000 km up`; };
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
