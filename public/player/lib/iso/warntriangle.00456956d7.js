// "warntriangle cx cy size open=0|1 lit=triangle|stand lab=1" — a red reflective warning triangle on its folding stand,
// on the road shoulder. Folded it is one flat bar: the two side arms lie along the base. Unfolding is three moves, each
// the lit part while it moves: the arms swing up about the base corners and clip together at the top (arms 0 → 1), the
// two steel legs swing out from the stand (legs 0 → 1), and the triangle tips up from flat to standing (stand 0 → 1).
// set({ arms, legs, stand }) or set({ open }) for all three. World units: 1 = 1 cm (ECE R27 size: sides about 43 cm).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const ROAD_PLAN = { x: -37, y: -44, w: 74, d: 64, r: 3 };
  // Grit in the asphalt: a fixed scatter of faint dots on the road top.
  const GRIT = Array.from({ length: 70 }, (_, i) => [-35 + ((i * 37.3) % 70), -42 + ((i * 53.7) % 56)]).filter(([x, y]) => Math.abs(x) > 11 || Math.abs(y) > 7);
  const LEG_OPEN = (72 * Math.PI) / 180, L = 43, HT = (L * Math.sqrt(3)) / 2, BAND = 4.5, FLUO = 3.6, HZ = 5.2, LEG = 19;
  const T_LAYERS = { base: [0, 1.3], left: [1.3, 2.6], right: [2.6, 3.9] };
  const UP = (84 * Math.PI) / 180, REST = -Math.asin(HZ / HT);   // standing lean, and lying with its tip on the road
  const RED = ISO.tint("#e04a36", ["#9c2416", "#b02c1c", "#c33825", "#d2422f"], "#5e120a");
  const ORANGE = ISO.tint("#ff9873", ["#d9573f", "#e4664c", "#ee755a", "#f68667"], "#7d2412");
  const PAINT = ISO.tint("#f6f6f3", ["#cfcfcb", "#d8d8d4", "#e1e1dd", "#eaeae6"], "#8d8d89");
  const ROAD = ISO.T.road, RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, PLASTIC = ISO.T.plastic;

  // The flat triangle in its own plane: u along the base, w up the triangle; vertices A (left), B (right), C (top).
  const V = [[-L / 2, 0], [L / 2, 0], [0, HT]], C0 = [0, HT / 3];
  const inset = (p, d) => { const dx = C0[0] - p[0], dy = C0[1] - p[1], n = Math.hypot(dx, dy); return [p[0] + (dx / n) * 2 * d, p[1] + (dy / n) * 2 * d]; };
  const O = V, I = V.map((p) => inset(p, BAND)), J = V.map((p) => inset(p, BAND + FLUO));
  const rot = ([u, w], [cu, cw], a) => [cu + (u - cu) * Math.cos(a) - (w - cw) * Math.sin(a), cw + (u - cu) * Math.sin(a) + (w - cw) * Math.cos(a)];
  // Each arm: its two quads (red band, orange band), the corner it turns on and its angle when folded.
  const ARMS = {
    base: { i: 0, j: 1, pivot: V[0], fold: 0 },
    right: { i: 1, j: 2, pivot: V[1], fold: Math.PI / 3 },
    left: { i: 2, j: 0, pivot: V[0], fold: -Math.PI / 3 },
  };
  // A point of the triangle (u, w, t: t is the thickness, toward the face you see) for tilt th about the hinge line.
  const onTri = (th) => ([u, w], t) => [u, -w * Math.cos(th) + t * Math.sin(th), HZ + w * Math.sin(th) + t * Math.cos(th)];
  const slab = (P, at, quad, [t0, t1], tone) => ISO.poly([...quad.map((p) => at(p, t0)), ...quad.map((p) => at(p, t1))], ISO.BOX_F, P, tone);

  function triangleSvg(P, arms, th, lab) {
    const at = onTri(th), out = [];
    for (const name of ["base", "left", "right"]) {
      const { i, j, pivot, fold } = ARMS[name], a = fold * (1 - arms), mv = (p) => rot(p, pivot, a), tt = T_LAYERS[name];
      const red = [O[i], O[j], I[j], I[i]].map(mv), band = [I[i], I[j], J[j], J[i]].map(mv);
      out.push(ISO.tinted(RED, slab(P, at, red, tt, "hi")), ISO.tinted(ORANGE, slab(P, at, band, tt, "hi")));
      // Prism reflector cells in two staggered rows across the red band, and the rivet at each end of the arm.
      const across = (f, end) => { const o = O[end], q = I[end]; return mv([o[0] + (q[0] - o[0]) * f, o[1] + (q[1] - o[1]) * f]); };
      const cells = [], n = 16;
      for (const [f, off] of [[0.3, 0], [0.7, 0.5]]) {
        const a0 = across(f, i), a1 = across(f, j);
        for (let k = 2; k < n - 1; k++) { const q = (k + off) / n; cells.push(K.iso(at([a0[0] + (a1[0] - a0[0]) * q, a0[1] + (a1[1] - a0[1]) * q], tt[1]), P)); }
      }
      out.push(`<g style="--anatomy-dot:#ffe1d8">${D(cells, { size: 0.85, tone: "hi" })}</g>`);
      const m0 = across(0.5, i), m1 = across(0.5, j);
      out.push(D([m0, m1].map((p) => K.iso(at(p, tt[1]), P)), { size: 0.75, tone: "lo" }));
    }
    // The clip that holds the two arms together at the top, over the right arm.
    const top = V[2];
    if (arms > 0.98) {
      const clip = [[top[0] - 2.4, top[1] - 10.5], [top[0] + 2.4, top[1] - 10.5], [top[0] + 1.4, top[1] - 6], [top[0] - 1.4, top[1] - 6]];
      out.push(ISO.tinted(PLASTIC, slab(P, at, clip, [3.9, 4.8], "mid")), D([K.iso(at([top[0], top[1] - 8.2], 4.8), P)], { size: 0.6, tone: "hi" }));
    }
    if (lab && th > 1.2) out.push(ISO.word(K.iso(at([-L / 2 + (HT * 0.45) / Math.sqrt(3) - 2.5, HT * 0.45], 0), P), "reflector", "#8f2a22", { anchor: "end", size: 15 }));
    return out.join("");
  }
  // The stand: a moulded block with the hinge knuckles on top, and two steel legs that swing out from under it.
  function blockSvg(P) {
    const knuckles = [-6.5, 3].map((x) => S(G.disc(0, 3.5, 1.2, G.frameOf([x, 0, HZ - 0.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    return ISO.tinted(PLASTIC, ISO.wbox(P, [-8, 8], [-3, 3], [0.4, HZ - 1.2], "mid") + ISO.wbox(P, [-7, 7], [-2.2, 2.2], [HZ - 1.2, HZ - 0.8], "mid") + knuckles.join("") +
      D([[-6, 3], [6, 3]].map(([x, y]) => K.iso([x, y, 2.8], P)), { size: 0.55, tone: "hi" }));
  }
  function legSvg(P, side, phi, lab) {
    const [px, py] = side < 0 ? [-5, -3.6] : [5, 3.6], a = side < 0 ? Math.PI + phi : phi;
    const at = (u, w, y) => [px + u * Math.cos(a) - y * Math.sin(a), py + u * Math.sin(a) + y * Math.cos(a), w];
    const tip = [px + Math.cos(a) * LEG, py + Math.sin(a) * LEG];
    const out = [ISO.tinted(STEEL, ISO.box(at, P, [-1.4, LEG], [0.5, 1.4], [-0.9, 0.9], "mid")),
      ISO.tinted(STEEL, S(K.cylinder(px, py, 1.2, 1.4, 0.6, P, 16), { tone: "mid" })), D([K.iso([px, py, 2], P)], { size: 0.5, tone: "hi" }),
      ISO.tinted(RUBBER, S(K.cylinder(tip[0], tip[1], 1.6, 0, 2.2, P, 18), { tone: "mid" }))];
    if (lab && side > 0 && phi > 1) out.push(ISO.word(K.iso([tip[0], tip[1], 0], P), "stand", "#444", { size: 15, dy: 22 }));
    return out.join("");
  }
  function roadSvg(P) {
    const road = ROAD_PLAN;
    return `<path class="iso-halo" d="${K.haloOf(road, -4, 4, P)}"/>` + ISO.tinted(ROAD, S(K.slabOf(road, -4, 4, P, 4, 0.8), { tone: "mid" }) +
      ISO.tinted(PAINT, S(K.slabOf({ x: -35, y: 15, w: 70, d: 3, r: 0.4 }, 0, 0.25, P, 2), { tone: "lo", crease: "none" }))) +
      `<g style="--anatomy-dot:#6f6f6b">${D(GRIT.map(([x, y]) => K.iso([x, y, 0], P)), { size: 0.45, tone: "mid" })}</g>` +
      `<path class="iso-halo" d="${K.haloOf({ x: -10, y: -6, w: 20, d: 12, r: 3 }, 0, 1, P)}"/>`;
  }

  ISO.add({
    name: "warntriangle", title: "Warning triangle", compare: "warntriangle 480 270 240",
    about: "Red reflective warning triangle on its folding stand: the arms swing up and clip, the legs swing out, the triangle stands up.",
    line: "warntriangle cx cy size open=0|1 lit=triangle|stand lab=1",
    demo: { line: "warntriangle 480 270 240 open=0", script: [{ set: { arms: 1 }, hold: "settle" }, { set: { legs: 1 }, hold: "settle" }, { set: { stand: 1 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", open = ISO.num(o, "open", 1) ? 1 : 0;
      const W = size * 2.4, H = size * 1.8;
      const { P, g } = ISO.frame([...K.boxCorners(ROAD_PLAN, -4, 0), [0, -4, HZ + HT * Math.sin(UP) + 2]], cx, cy, W, H, { azimuth: 64, elevation: 24 }, parent);
      g.innerHTML = `<g>${roadSvg(P)}</g><g data-name="stand"><g data-leg="back"></g><g>${blockSvg(P)}</g><g data-leg="front"></g></g><g data-name="triangle"></g>`;
      const tri = g.querySelector('[data-name="triangle"]'), stand = g.querySelector('[data-name="stand"]');
      const back = g.querySelector('[data-leg="back"]'), front = g.querySelector('[data-leg="front"]'), w = ISO.writer();
      const s = { arms: open, legs: open, stand: open }, goal = { ...s };
      let lit = o.lit || "";
      const tilt = () => REST * s.arms * (1 - s.stand) + UP * s.stand;
      const draw = () => {
        const phi = s.legs * LEG_OPEN;
        w.rebuild(tri, `${s.arms.toFixed(4)} ${tilt().toFixed(4)}`, () => triangleSvg(P, s.arms, tilt(), lab));
        w.rebuild(back, phi.toFixed(4), () => legSvg(P, -1, phi, lab));
        w.rebuild(front, phi.toFixed(4), () => legSvg(P, 1, phi, lab));
        const moving = ["arms", "legs", "stand"].find((k) => s[k] !== goal[k]);
        const on = lit || (moving === "legs" ? "stand" : moving ? "triangle" : "");
        w.light([tri, stand], on === "stand" ? [stand] : on === "triangle" ? [tri] : []);
      };
      g.set = (p) => {
        if (p.open !== undefined) goal.arms = goal.legs = goal.stand = +p.open ? 1 : 0;
        for (const k of ["arms", "legs", "stand"]) if (p[k] !== undefined) goal[k] = ISO.clamp(+p[k], 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        let moving = false;
        for (const k of ["arms", "legs", "stand"]) { s[k] = ISO.follow(s[k], goal[k], dt, 0.38, ISO.still()); moving ||= s[k] !== goal[k]; }
        draw();
        return moving;
      };
      g.readout = () => {
        const deg = (r) => Math.round((r * 180) / Math.PI);
        if (s.stand > 0.995) return `standing, leaning back ${90 - deg(UP)}° · sides ${L} cm · put it at least 45 m behind the car (UK Highway Code), never on a motorway`;
        return `arms ${Math.round(s.arms * 60)}° of 60° · legs out ${Math.round((s.legs * LEG_OPEN * 180) / Math.PI)}° · tilt ${deg(tilt())}° · sides ${L} cm, red band ${BAND} cm`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
