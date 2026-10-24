// "river cx cy width labels=1 years=0..1 lab=1 lit=source|meander|oxbow|delta" — a landscape model of a river.
// A block of land cut out and set on a base board: the river starts in the hills at the back, winds across the
// flat plain in loops (meanders) and splits into channels across its delta into the sea; the front and right cut
// faces show the soil and gravel layers and the sea's depth. years=0..1 runs the clock: the outside of the big bend
// wears away and the inside fills with sand, so the loop grows and its neck narrows, until a flood cuts through the
// neck and the river takes the short way, leaving the old loop behind as an oxbow lake (decades to centuries).
(() => {
  const K = window.K, G = window.G;
  const X0 = -120, X1 = 120, Y0 = -80, Y1 = 80, ZW = 10, NX = 52, NY = 36, CUT = 0.82;
  const coast = (y) => 78 + 10 * Math.sin(y / 22);
  const ground = (x, y) => {
    const hills = 46 * Math.pow(Math.max(0, (-x - 30) / 90), 1.3) * (1 + 0.25 * Math.sin(y / 14 + x / 30)) + 30 * Math.pow(Math.max(0, (-y - 36) / 44), 1.4) * Math.max(0, (40 - x) / 160);
    const plain = 15 + 1.5 * Math.sin(x / 31) * Math.cos(y / 27), sea = Math.max(0, x - coast(y)) * 0.5;
    return Math.max(2, plain + hills - sea);
  };
  const surf = (x, y) => Math.max(ground(x, y), ZW);
  const cat = (pts, n = 6) => {               // a smooth curve through the points (Catmull-Rom)
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  // the river for a time t: the big loop between the neck points N1 and N2 grows; after CUT the neck is cut through
  function course(t) {
    const g = ISO.smooth(0, CUT, t), N1 = [-40 + 13 * g, -6], N2 = [-2 - 13 * g, -6], mx = (N1[0] + N2[0]) / 2;
    const Rx = 20 + 9 * g, Ry = 18 + 16 * g, Cm = [mx, -6 + Ry * 0.62 + 4];
    const loop = Array.from({ length: 29 }, (_, i) => { const f = Math.PI + 0.75 - (i / 28) * (Math.PI + 1.5); return [Cm[0] + Rx * Math.cos(f), Cm[1] + Ry * Math.sin(f)]; });
    const head = cat([[-122, -50], [-96, -36], [-80, -40], [-62, -22], N1], 5), tail = cat([N2, [16, -22], [36, -10], [52, 2], [66, 4]], 6);
    const cut = t >= CUT;
    const main = cut ? [...head, ...tail] : [...head, ...cat([N1, ...loop.filter((_, i) => i % 2 === 0), N2], 3).slice(1, -1), ...tail];
    const ox = cut ? loop.slice(3, -3) : null;
    const mouths = [[[66, 4], [80, -10], [96, -18]], [[66, 4], [84, 6], [98, 8]], [[66, 4], [78, 18], [90, 30]]].map((p) => cat(p, 6));
    return { main, ox, mouths, loopMid: [Cm[0], Cm[1] + Ry * 0.4], neck: [(N1[0] + N2[0]) / 2, -6], cut };
  }

  ISO.add({
    name: "river", title: "River (landscape model)", compare: "river 480 270 460 labels=1",
    about: "A landscape model of a river from the hills to the sea: run the years and a meander's neck narrows until the river cuts through and leaves an oxbow lake.",
    line: "river cx cy width labels=1 years=0..1 lab=1 lit=source|meander|oxbow|delta",
    demo: { line: "river 480 270 460 labels=1", script: [{ set: { lit: "meander" }, hold: 1.4 }, { set: { lit: "", years: 0.7 }, hold: "settle" }, { set: { years: 1 }, hold: "settle" }, { set: { lit: "oxbow" }, hold: 1.6 }] },
    make([cx, cy, w = 440], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = w * 1.5, H = w * 0.98;
      const PLB = { x: X0 - 8, y: Y0 - 8, w: X1 - X0 + 16, d: Y1 - Y0 + 16, r: 6 };
      const { P, g } = ISO.frame([[PLB.x, PLB.y, -12], [PLB.x + PLB.w, PLB.y + PLB.d, -12], [PLB.x, PLB.y + PLB.d, -12], [PLB.x + PLB.w, PLB.y, 0], [X0, Y0, 70], [X0, Y1, 50]], cx, cy, W, H, { azimuth: 36, elevation: 40 }, parent);
      const C = { water: [127, 192, 238], green: [176, 212, 146], hill: [150, 184, 122], rock: [178, 170, 158], sand: [236, 214, 160] };
      const mixc = (p, q, f) => p.map((v, i) => v + (q[i] - v) * ISO.clamp(f, 0, 1));
      const land = EARTH.terrain(P, { x0: X0, x1: X1, y0: Y0, y1: Y1, nx: NX, ny: NY, h: surf, col: (x, y, z, slope) => {
        if (ground(x, y) < ZW) return C.water;
        const beach = ISO.clamp((ZW + 3 - ground(x, y)) / 3, 0, 1);
        return mixc(mixc(mixc(C.green, C.hill, (z - 22) / 20), C.rock, (slope - 0.3) / 0.3), C.sand, beach);
      } }).svg;
      // cut faces: gravel, clay and soil under the ground, the sea's water above the sea bed
      const runF = EARTH.run([X0, Y1], [X1, Y1], 60), runR = EARTH.run([X1, Y1], [X1, Y0], 40);
      const bands = [
        { top: (x, y) => Math.min(ground(x, y), 6 + Math.sin(x / 15 + y / 19)), bot: () => 0, fill: "#b8a48a", ink: "#5e4a3c" },
        { top: (x, y) => Math.min(ground(x, y), 11 + Math.sin(x / 23 - y / 17)), bot: (x, y) => 6 + Math.sin(x / 15 + y / 19), fill: "#cdbb9b", ink: "#5e4a3c" },
        { top: (x, y) => ground(x, y), bot: (x, y) => 11 + Math.sin(x / 23 - y / 17), fill: "#9c7f5e", ink: "#5e4a3c" },
        { top: (x, y) => Math.max(ground(x, y), ZW), bot: (x, y) => ground(x, y), fill: "#9fd0f5", ink: "#1f5fa8" },
      ];
      const walls = EARTH.wall(P, runF, bands) + EARTH.wall(P, runR, bands);
      g.innerHTML = `<g>${ISO.baseboard(P, PLB, { h: 6, tint: ISO.T.wood })}</g><g data-name="source">${land}</g><g data-part="water"></g><g>${walls}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), wr = ISO.writer();
      const st = { t: ISO.clamp(ISO.num(o, "years", 0), 0, 1) }, want = { t: st.t };
      let lit = o.lit || "";
      // a band of water along a centre line, widening downstream, lying on the land
      const on = (x, y) => K.iso([x, y, surf(x, y) + 0.4], P);
      const band = (pts, w0, w1, closed = false) => {
        const n = pts.length, L = [], R = [];
        pts.forEach((p, i) => {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, wd = w0 + (w1 - w0) * (i / (n - 1));
          L.push(on(p[0] - (dy / l) * wd, p[1] + (dx / l) * wd)); R.push(on(p[0] + (dy / l) * wd, p[1] - (dx / l) * wd));
        });
        return K.pathOf([...L, ...R.reverse()], true);
      };
      const waterSvg = (tq) => {
        const c = course(tq), delta = K.pathOf(cat([[60, -2], [74, -20], [92, -24], [100, 4], [94, 34], [76, 26], [62, 10]], 4).map(([x, y]) => on(x, y)), true);
        const seaD = K.pathOf([...Array.from({ length: 41 }, (_, i) => { const y = Y0 + (i / 40) * (Y1 - Y0); return K.iso([Math.min(X1, coast(y) + 4), y, ZW + 0.2], P); }), K.iso([X1, Y1, ZW + 0.2], P), K.iso([X1, Y0, ZW + 0.2], P)], true);
        return `<path d="${seaD}" fill="#7fc0ee" stroke="#1f5fa8" stroke-width=".7" stroke-linejoin="round"/><g data-name="delta"><path d="${delta}" fill="#ecd6a0" stroke="#b08a4a" stroke-width=".7" stroke-linejoin="round"/>${c.mouths.map((m) => `<path d="${band(m, 1.6, 2.4)}" fill="#7fc0ee" stroke="#1f5fa8" stroke-width=".6"/>`).join("")}</g>` +
          `<g data-name="meander"><path d="${band(c.main, 1.4, 3)}" fill="#7fc0ee" stroke="#1f5fa8" stroke-width=".7" stroke-linejoin="round"/></g>` +
          (c.ox ? `<g data-name="oxbow"><path d="${band(c.ox, 2.6, 2.6)}" fill="#a9cfe9" stroke="#3a6f9a" stroke-width=".7" stroke-linejoin="round"/></g>` : "");
      };
      const draw = () => {
        const tq = Math.round(st.t * 40) / 40;
        wr.rebuild(el.water, String(tq), () => waterSvg(tq));
        if (lab) wr.rebuild(el.words, String(tq), () => {
          const c = course(tq), at = (x, y, dy = 0) => { const q = on(x, y); return [q[0], q[1] + dy]; };
          return ISO.word(at(-100, -60, -14), "hills (source)", "#3f5a2e", { size: 13 }) + ISO.word(at(c.loopMid[0], c.loopMid[1], 22), c.cut ? "oxbow lake" : "meander", c.cut ? "#3a6f9a" : "#1f5fa8", { size: 14 }) +
            (c.cut ? ISO.word(at(c.neck[0], c.neck[1], -10), "new channel", "#1f5fa8", { size: 12 }) : "") + ISO.word(at(84, 34, 18), "delta", "#8a6414", { size: 14 }) + ISO.word(at(110, -50, 6), "sea", "#1f5fa8", { size: 14 });
        });
        LAB.light(wr, g, lit);
      };
      g.set = (p) => {
        if (p.years !== undefined) want.t = ISO.clamp(+p.years, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.t = ISO.follow(st.t, want.t, dt, 1.1, ISO.still());
        if (Math.abs(st.t - want.t) < 0.003) st.t = want.t;
        draw();
        return st.t !== want.t;
      };
      g.readout = () => st.t < 0.05 ? "a river winds across its flat flood plain from the hills to the sea, and drops its mud and sand as a delta where it slows" : st.t < CUT ? "the outside of the bend wears away (fast water), the inside fills with sand (slow water): the loop grows and its neck narrows" : "a flood cut through the neck: the river takes the short way and the old loop, sealed off with mud, is left as an oxbow lake";
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
