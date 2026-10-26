// "cradle cx cy width n=1 angle=30 lab=1" — Newton's cradle on its stand.
// Five steel balls hang in a row, each on two threads from the top rails so it can only swing along the row. Pull n
// balls back and let go: they swing in and stop dead, and n balls leave the far end with the same speed, because both
// momentum and energy are kept. Each swing takes half a pendulum period, T/2 = π√(L/g). set({ n, go: 1|0 }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, BOARD = { x: -66, y: -34, w: 132, d: 68, r: 6 }, TOPZ = 118, LEN = 78, R = 6.6, RAIL_Y = 15, L_M = 0.2;
  const X = [-2, -1, 0, 1, 2].map((i) => i * 2 * R);
  const ball = (i, th) => [X[i] + Math.sin(th) * LEN, 0, TOPZ - Math.cos(th) * LEN];

  function frameSvg(P, side) {
    // One side's A-frame: two legs from the base to the top rail, with feet, and the rail along x.
    const y = side * RAIL_Y, out = [];
    for (const x of [-52, 52]) {
      out.push(S(K.cylinder(x, y, 4, 0, 2.4, P, 24, 0.4), { tone: "mid" }));
      out.push(S(K.cylinder(x, y, 1.8, 2.4, TOPZ - 2.4, P, 20), { tone: "mid", crease: "none" }));
    }
    out.push(S(G.disc(-55, 55, 2, G.frameOf([0, y, TOPZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    for (const x of [-55, 55]) out.push(S(G.sphereOf([x, y, TOPZ], 2.6, P), { tone: "mid" }));
    return out.join("");
  }
  const threads = (P, pts, side) => pts.map((b, i) => K.pathOf([K.iso([X[i], side * RAIL_Y, TOPZ - 2], P), K.iso([b[0], 0, b[2] + R - 0.6], P)])).join("");

  ISO.add({
    name: "cradle", title: "Newton's cradle", compare: "cradle 480 260 400",
    about: "Five steel balls on paired threads: pull n back and let go, n leave the other end, keeping momentum and energy.",
    line: "cradle cx cy width n=1 angle=30 lab=1",
    demo: { line: "cradle 480 270 400", script: [{ set: { n: 1, go: 1 }, hold: 5 }, { set: { go: 0 }, hold: "settle" }, { set: { n: 2, go: 1 }, hold: 5 }, { set: { go: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.1, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, -RAIL_Y, TOPZ + 3], [70, RAIL_Y, TOPZ + 3], [-70, RAIL_Y, TOPZ + 3]], cx, cy, W, H, { azimuth: 58, elevation: 18 }, parent);
      const m = { n: ISO.clamp(Math.round(ISO.num(o, "n", 1)), 1, 4), A: (ISO.clamp(ISO.num(o, "angle", 30), 10, 40) * Math.PI) / 180 };
      g.innerHTML = `<g>${ISO.baseboard(P, BOARD)}${ISO.plate(P, { x: 20, y: -28, w: 36, d: 12, r: 1.2 })}${frameSvg(P, -1)}</g>` +
        `<path data-part="back" fill="none" stroke="#7d8288" stroke-width="0.7"/><g data-part="balls"></g><path data-part="front" fill="none" stroke="#4e535a" stroke-width="0.8"/><g>${frameSvg(P, 1)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const s = { go: false, t: 0, back: 0, th: [0, 0, 0, 0, 0], swings: 0 };
      const half = Math.PI * Math.sqrt(L_M / g9);       // one swing in or out, seconds
      // Angles at time t after release: the left n swing in for a quarter period, then the right n swing out and back
      // for a half period, and so on, losing a little each time.
      const pose = (t) => {
        const q = half / 2, th = [0, 0, 0, 0, 0], k = Math.floor(t / half), r = (t % half) / half, A = m.A * Math.exp(-0.06 * t);
        const left = (k % 2 === 0), amp = A * Math.sin(Math.PI * r) * (left ? 1 : 1);
        if (t < q) { for (let i = 0; i < m.n; i++) th[i] = -m.A * Math.cos((Math.PI / 2) * (t / q)); return { th, swings: 0 }; }
        const t2 = t - q, k2 = Math.floor(t2 / half), r2 = (t2 % half) / half, a = A * Math.sin(Math.PI * r2);
        if (k2 % 2 === 0) for (let i = 0; i < m.n; i++) th[4 - i] = a; else for (let i = 0; i < m.n; i++) th[i] = -a;
        return { th, swings: k2 + 1 };
      };
      const draw = () => {
        const pts = s.th.map((th, i) => ball(i, th)), key = s.th.map((v) => v.toFixed(4)).join();
        w.attr(el.back, "d", threads(P, pts, -1));
        w.attr(el.front, "d", threads(P, pts, 1));
        w.rebuild(el.balls, key, () => pts.map((b, i) => ({ b, i, k: K.depthOf(b, P) })).sort((a, c) => a.k - c.k)
          .map(({ b }) => ISO.tinted(ISO.T.steel, S(G.sphereOf(b, R, P), { tone: "hi" }))).join(""));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([0, BOARD.y + BOARD.d, -12], P), "5 steel balls, 2 threads each", "#555", { dy: 22, size: 14 }));
      };
      g.set = (p) => {
        if (p.n !== undefined) m.n = ISO.clamp(Math.round(+p.n), 1, 4);
        if (p.go !== undefined) { s.go = !!+p.go; s.t = 0; if (!s.go) s.back = 1; }
      };
      g.update = (dt) => {
        if (s.go) {
          s.t += ISO.still() ? 0 : dt;
          const p = pose(s.t); s.th = p.th; s.swings = p.swings;
          if (ISO.still()) { s.th = s.th.map((_, i) => (i < m.n ? -m.A : 0)); }
        } else if (s.back) {
          s.th = s.th.map((v) => ISO.follow(v, 0, dt, 0.25, ISO.still()));
          if (s.th.every((v) => v === 0)) s.back = 0;
        }
        draw();
        return s.go || !!s.back;
      };
      g.readout = () => `${m.n} pulled back · ${m.n} leave the far end · each swing ${(half).toFixed(2)} s (π√(L/g), L = ${L_M} m) · ${s.swings} hits`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
