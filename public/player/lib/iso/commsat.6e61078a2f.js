// "commsat cx cy k rot=-180..180 sun=0..360 sunmark=0|1 lab=0 lit=bus|wings|dish|tracker|thrusters|sun" — a PART
// (PARTS.md): satellite.js's communications satellite at true size, its origin the middle of its bus (it floats; place
// it high on a space board, k about 0.2). A 2.5 × 2.5 × 6 m box bus wrapped in gold foil (it keeps the inside at
// room temperature) with white radiator panels on its north and south faces that shed the electronics' heat; two
// solar wings of three 5.2 × 2.6 m panels each on yokes, turned by drive motors so the cells face the sun (40 m tip
// to tip); the big 2.6 m dish on the Earth-facing (+y) side, tipped down, its feed horn on three struts; a small dish
// and a whip antenna on top, the star tracker that tells which way it points, and underneath the engine bell and four
// small thrusters that keep it in its slot. sun = the sun's direction (degrees round the wings' axis): the wings turn
// to face it and the power follows how square-on they are; rot turns the whole satellite about its long axis.
// sunmark=1 draws the sun's direction as a small sun 12 m off. set({ sun, rot }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const rad = (d) => (d * Math.PI) / 180, BX = 125, BY = 125, BZ = 300, W0 = 425, PW = 520, PH = 130, GAP = 10, SUN_D = 1200;
  const GOLD = ISO.tint("#f6e3a6", ["#c9a24a", "#d4b05c", "#dfc072", "#ead08c"], "#6b5114"), WHITE = ISO.tint("#f7f8f9", ["#c3c7cc", "#cfd2d6", "#dadde0", "#e6e8ea"], "#5a5f66");
  const CELLS = ISO.tint("#3d5f9e", ["#1d2f57", "#243a68", "#2c4679", "#34528a"], "#0f1c3a");
  const kwOf = (off) => 2 * 3 * (PW / 100) * (2 * PH / 100) * 1.361 * 0.3 * Math.max(0, Math.cos(rad(off)));
  const yaw = (r) => { const c = Math.cos(rad(r)), s = Math.sin(rad(r)); return ([x, y, z]) => [x * c - y * s, x * s + y * c, z]; };
  const dirOf = (Y, v) => G.sub3(Y(v), Y([0, 0, 0]));
  const boxR = (P, Y, [x0, x1], [y0, y1], [z0, z1], tone) => ISO.box((u, w, v) => Y([u, w, v]), P, [x0, x1], [y0, y1], [z0, z1], tone);

  function busSvg(P, Y) {
    const out = [`<g data-name="bus">${ISO.tinted(GOLD, boxR(P, Y, [-BX, BX], [-BY, BY], [-BZ, BZ], "hi"))}`];
    for (const y of [-BY - 6, BY]) out.push(ISO.tinted(WHITE, boxR(P, Y, [-100, 100], [y, y + 6], [-240, 240], "mid")));
    return out.join("") + "</g>";
  }
  function bottomSvg(P, Y) {
    const out = [`<g data-name="thrusters">`], down = dirOf(Y, [0, 0, -1]);
    const bell = (c, r, len) => ISO.tinted(ISO.T.steel, S(G.solidOf([[0, r * 0.4], [len * 0.3, r * 0.4]], G.frameAlong(Y(c), down), P, { steps: 12 }), { tone: "mid" }) + S(G.solidOf([[len * 0.3, r * 0.35], [len, r]], G.frameAlong(Y(c), down), P, { steps: 16 }), { tone: "mid" }));
    out.push(bell([0, 0, -BZ], 50, 90));
    for (const [x, y] of [[-100, -100], [100, -100], [-100, 100], [100, 100]]) out.push(bell([x, y, -BZ], 9, 22));
    return out.join("") + "</g>";
  }
  // the top deck: the star tracker's box and sun baffle, the whip antenna, the small dish on its mast
  function topSvg(P, Y) {
    const up = dirOf(Y, [0, 0, 1]), out = [`<g data-name="tracker">${ISO.tinted(WHITE, boxR(P, Y, [-100, -50], [-75, -25], [BZ, BZ + 35], "mid"))}`];
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 14], [40, 19]], G.frameAlong(Y([-75, -50, BZ + 35]), up), P, { steps: 16 }), { tone: "mid" })), "</g>");
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 160, 3, G.frameAlong(Y([90, 90, BZ]), up), P, { steps: 6 }), { tone: "mid", crease: "none" })));
    const df = G.frameAlong(Y([35, 25, BZ + 60]), G.unit3(G.add3(up, G.mul3(dirOf(Y, [0.3, 0.2, 0]), 1))));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 60, 5, G.frameAlong(Y([35, 25, BZ]), up), P, { steps: 8 }), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(WHITE, B37.dish(P, df, 46, 30, 2, { steps: 24 })));
    return out.join("");
  }
  // the big dish on the Earth-facing (+y) side, tipped down toward Earth, its feed on three struts
  function dishSvg(P, Y) {
    const out = [`<g data-name="dish">`], ax = G.unit3(dirOf(Y, [0, 1, -0.55])), F = G.frameAlong(Y([0, BY + 60, 40]), ax), R = 130, f = 89, sOf = (r) => (r * r) / (4 * f);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-60, 2, 7, F, P, { steps: 8 }), { tone: "mid" })));
    out.push(ISO.tinted(WHITE, B37.dish(P, F, R, f, 4, { steps: 36, lip: 4 })));
    const foc = G.pointOf(F, f, 0, 0);
    for (const a of [0, 2.1, 4.2]) { const tp = G.pointOf(F, sOf(R) - 2, R - 10, a), d = G.sub3(foc, tp); out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 3, G.frameAlong(tp, d), P, { steps: 6 }), { tone: "mid", crease: "none" }))); }
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 7], [26, 16]], G.frameAlong(foc, G.mul3(ax, -1)), P, { steps: 16 }), { tone: "hi" })));
    return out.join("") + "</g>";
  }
  // one wing: the drive motor on the bus side, the yoke, three panels turned to angle th about the wing's axis
  function wingSvg(P, Y, side, th) {
    const out = [], c = Math.cos(rad(th)), s = Math.sin(rad(th));
    const at = (u, w, v) => Y([side * u, w * c - v * s, w * s + v * c]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 40, 28, G.frameAlong(Y([side * BX, 0, 0]), dirOf(Y, [side, 0, 0])), P, { steps: 16 }), { tone: "mid" })));
    for (const w of [-PH * 0.7, PH * 0.7]) { const a = Y([side * (BX + 40), 0, 0]), b = at(W0, w, 0), d = G.sub3(b, a); out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 4, G.frameAlong(a, d), P, { steps: 6 }), { tone: "mid", crease: "none" }))); }
    const cellsOf = (u0, h) => { const lines = []; for (let i = 1; i < 8; i++) { const u = u0 + (PW * i) / 8; lines.push(K.pathOf([K.iso(at(u, -PH, h), P), K.iso(at(u, PH, h), P)])); } lines.push(K.pathOf([K.iso(at(u0, 0, h), P), K.iso(at(u0 + PW, 0, h), P)])); return lines.join(""); };
    for (let k = 0; k < 3; k++) {
      const u0 = W0 + k * (PW + GAP);
      out.push(ISO.tinted(CELLS, ISO.box(at, P, [u0, u0 + PW], [-PH, PH], [-3, 3], "mid")));
      const h = K.depthOf(at(u0, 0, 1), P) > K.depthOf(at(u0, 0, 0), P) ? 3.1 : -3.1;
      out.push(`<path d="${cellsOf(u0, h)}" stroke="#7d95c4" stroke-width=".45" fill="none"/>`);
      if (k < 2) out.push(ISO.tinted(ISO.T.steel, ISO.box(at, P, [u0 + PW, u0 + PW + GAP], [-15, 15], [-3, 3], "mid")));
    }
    return out.join("");
  }
  const sunSvg = (P, phi, k) => {
    const p = K.iso([0, SUN_D * Math.cos(rad(phi)), SUN_D * Math.sin(rad(phi))], P), r = Math.max(6, 100 * k), f = (v) => v.toFixed(1);
    return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 1.9)}" fill="#ffe7a0" opacity=".45"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="#ffd34a" stroke="#c98a10" stroke-width=".8"/>`;
  };

  ISO.add({
    name: "commsat", title: "Communications satellite (part)", compare: null,
    about: "A communications satellite at true size: a gold-foil box bus with white radiators, two three-panel solar wings on yokes that turn to face the sun, a big Earth-facing dish with its feed horn on struts, a small dish, a whip antenna, a star tracker, the engine bell and four thrusters; rot turns it. anchors: dish top",
    line: "commsat cx cy k rot=-180..180 sun=0..360 sunmark=0|1 lab=0 lit=bus|wings|dish|tracker|thrusters|sun",
    demo: { line: "commsat 480 300 0.2 rot=-20 sun=70 lab=1", script: [{ set: {}, hold: 1.4 }, { set: { sun: 150, lit: "wings" }, hold: "settle" }, { set: { rot: 25, lit: "dish" }, hold: "settle" }, { set: { sun: 30, lit: "" }, hold: "settle" }, { set: { sunmark: 0, lit: "thrusters" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 0.2], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", kk = g.k;
      g.innerHTML = `<g data-name="sun" data-part="sun"></g><g data-name="wings" data-part="far"></g><g data-part="body"></g><g data-name="wings" data-part="near"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { sun: q("sun"), body: q("body"), far: q("far"), near: q("near"), words: q("words") }, w = ISO.writer();
      const st = { rot: B37.num(o, "rot", 0, -180, 180), sun: B37.num(o, "sun", 90, 0, 360), mark: o.sunmark === "0" ? 0 : 1, lit: o.lit || "" };
      const s = { rot: st.rot, sun: st.sun, wing: st.sun - 90 };
      // the bus and what's fixed to it, sorted far to near, rebuilt only when rot changes (by whole degrees)
      const bodySvg = (rot) => {
        const Y = yaw(rot), parts = [[[0, 0, -BZ], bottomSvg(P, Y)], [[0, 0, 0], busSvg(P, Y)], [[0, 0, BZ + 40], topSvg(P, Y)], [[0, BY + 120, 0], dishSvg(P, Y)]];
        return parts.sort((a, b) => K.depthOf(Y(a[0]), P) - K.depthOf(Y(b[0]), P)).map(([, svg]) => svg).join("");
      };
      const farSide = (rot) => (K.depthOf(yaw(rot)([1, 0, 0]), P) > K.depthOf(yaw(rot)([-1, 0, 0]), P) ? -1 : 1);
      const offOf = () => Math.abs(((s.sun - 90 - s.wing + 540) % 360) - 180);
      const draw = () => {
        const rot = Math.round(s.rot / 2) * 2, th = Math.round(s.wing / 3) * 3, off = offOf(), fs = farSide(rot);
        w.rebuild(el.sun, st.mark ? String(Math.round(s.sun)) : "", () => (st.mark ? sunSvg(P, Math.round(s.sun), kk) : ""));
        w.rebuild(el.body, String(rot), () => bodySvg(rot));
        w.rebuild(el.far, `${rot} ${th}`, () => wingSvg(P, yaw(rot), fs, th));
        w.rebuild(el.near, `${rot} ${th}`, () => wingSvg(P, yaw(rot), -fs, th));
        w.rebuild(el.words, lab ? `${Math.round(off / 2)} ${rot}` : "", () => !lab ? "" : [
          ISO.word(K.iso(yaw(rot)([-fs * (W0 + 1.5 * PW), 0, -PH]), P), off < 3 ? "solar wings face the sun" : `wings ${Math.round(off)}° off the sun`, off < 3 ? "#1f3c78" : "#a3271b", { size: 13, dy: 30 }),
          ISO.word(K.iso(yaw(rot)([0, BY + 100, -200]), P), "dish points down to Earth", "#444", { size: 13, dy: 26 })].join(""));
        B37.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.sun !== undefined) st.sun = B37.num(p, "sun", st.sun, 0, 360);
        if (p.rot !== undefined) st.rot = B37.num(p, "rot", st.rot, -180, 180);
        if (p.sunmark !== undefined) st.mark = String(p.sunmark) === "0" ? 0 : 1;
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // the sun seems to move as it orbits; the drive motors keep the wings square to it (40° a second here), and
      // the whole satellite turns slowly on its thrusters
      g.update = (dt) => {
        const calm = ISO.still(), d = ((st.sun - s.sun + 540) % 360) - 180;
        s.sun = Math.abs(d) < 0.1 ? st.sun : s.sun + (calm ? d : d * (1 - Math.exp(-dt / 0.5)));
        const want = s.sun - 90, e = ((want - s.wing + 540) % 360) - 180;
        s.wing = Math.abs(e) < 0.3 ? want : s.wing + (calm ? e : Math.sign(e) * Math.min(Math.abs(e), dt * 40));
        s.rot = calm ? st.rot : s.rot + ISO.clamp(st.rot - s.rot, -dt * 30, dt * 30);
        draw();
        return s.sun !== st.sun || s.wing !== want || s.rot !== st.rot;
      };
      g.readout = () => `wings ${Math.round(offOf())}° off the sun · ${kwOf(offOf()).toFixed(1)} kW from 6 panels (sunlight 1.36 kW per m², cells about 30 % efficient) · the dish beams TV and phone signals to Earth from 36 000 km up`;
      draw();
      g.anchors = { dish: yaw(st.rot)([0, BY + 60, 40]), top: [0, 0, BZ] };
      return g;
    },
  });
})();
