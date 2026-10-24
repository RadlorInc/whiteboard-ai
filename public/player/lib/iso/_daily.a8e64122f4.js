// Shared helpers for the daily-object recipes (backpack, ball, cricketbat, instrument, lunchbox, measuring, notebook,
// palette, pencilcase, ricebowl, sofa, waterglass). Not a recipe: it only defines window.DAILY.
(() => {
  const K = window.K, G = window.G;
  const DAILY = (window.DAILY = {});
  DAILY.zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  DAILY.xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  DAILY.yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // A world point in frame F: u along F.u, s along F.a, v along F.v.
  DAILY.at = (F, u, s, v = 0) => [F.o[0] + F.u[0] * u + F.a[0] * s + F.v[0] * v, F.o[1] + F.u[1] * u + F.a[1] * s + F.v[1] * v, F.o[2] + F.u[2] * u + F.a[2] * s + F.v[2] * v];
  const LIGHT = G.unit3([-0.45, 0.35, 0.82]);
  // A prism in any frame: an outline (concave allowed) in the (u, s) plane, extruded along v from v0 to v1. Like
  // ISO.prismY, its sides shade smoothly by facing; the cap that faces the viewer is drawn in `face`.
  DAILY.prism = (P, F, pts, v0, v1, [dark, light], face, ink, extra = "") => {
    const view = G.viewOf(P), at = (p, v) => K.iso(DAILY.at(F, p[0], p[1], v), P);
    const near = G.dot3(F.v, view) > 0 ? v1 : v0, far = near === v1 ? v0 : v1;
    const Fr = pts.map((p) => at(p, near)), B = pts.map((p) => at(p, far));
    let area = 0;
    pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length]; area += x * z2 - x2 * z; });
    const n = pts.length, quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], len = Math.hypot(bx - ax, bz - az) || 1;
      let nu = (bz - az) / len, ns = -(bx - ax) / len;
      if (area < 0) { nu = -nu; ns = -ns; }
      const N = G.add3(G.mul3(F.u, nu), G.mul3(F.a, ns));
      vis[i] = G.dot3(N, view) > 1e-6;
      if (!vis[i]) continue;
      const lit = ISO.clamp(0.5 + 0.5 * G.dot3(N, LIGHT), 0, 1);
      quads.push({ k: K.depthOf(DAILY.at(F, (ax + bx) / 2, (az + bz) / 2, (v0 + v1) / 2), P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([B[i], B[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([Fr[i], B[i]]));
    }
    return quads.map(({ i, fill }) => `<path d="${K.pathOf([Fr[i], Fr[(i + 1) % n], B[(i + 1) % n], B[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`).join("") +
      `<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/><path d="${K.pathOf(Fr, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>${extra}`;
  };
  // A box in frame F: u0..u1 × s0..s1 × v0..v1, in the kit's shading (ISO.poly).
  DAILY.box = (P, F, [u0, u1], [s0, s1], [v0, v1], tone = "mid") =>
    ISO.poly([[u0, s0, v0], [u1, s0, v0], [u1, s1, v0], [u0, s1, v0], [u0, s0, v1], [u1, s0, v1], [u1, s1, v1], [u0, s1, v1]].map(([u, s, v]) => DAILY.at(F, u, s, v)), ISO.BOX_F, P, tone);
  // A rounded rectangle outline (u, s) for DAILY.prism: centre-free, corner radius r, n points per corner.
  DAILY.rrect = (u0, s0, u1, s1, r, n = 5) => {
    const out = [], c = [[u1 - r, s1 - r, 0], [u0 + r, s1 - r, 0.5], [u0 + r, s0 + r, 1], [u1 - r, s0 + r, 1.5]];
    for (const [cu, cs, a0] of c) for (let i = 0; i <= n; i++) { const a = (a0 + (i / n) * 0.5) * Math.PI; out.push([cu + Math.cos(a) * r, cs + Math.sin(a) * r]); }
    return out;
  };
  // A thick band following a path of (u, s) points in frame F (a handle, a strap): outline both sides, then a prism.
  DAILY.band = (pts, w) => {
    const L = [], R = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nu = -(b[1] - a[1]) / l, ns = (b[0] - a[0]) / l;
      L.push([p[0] + nu * w / 2, p[1] + ns * w / 2]); R.push([p[0] - nu * w / 2, p[1] - ns * w / 2]);
    });
    return [...L, ...R.reverse()];
  };
  // Cubic Bézier points in any dimension.
  DAILY.bez = (a, b, c, d, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return a.map((_, j) => v * v * v * a[j] + 3 * v * v * u * b[j] + 3 * v * u * u * c[j] + u * u * u * d[j]); });
  // A table or worktop slab with its halo, side seam and inset groove.
  DAILY.table = (P, plan, h = 10, tint = ISO.T.wood) =>
    `<path class="iso-halo" d="${K.haloOf(plan, -h, h, P)}"/>` + ISO.tinted(tint, K.solidSvg(K.slabOf(plan, -h, h, P, 8, 1.2), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, -h / 2, P, 8), { tone: "faint" }) })) +
    K.lineSvg(K.planOutline(K.insetPlan(plan, Math.min(5, plan.d / 20)), 0, P), { tone: "faint" });
  // A pencil from p0 along unit axis d, hex section (7.2 mm across corners), sharpened toward the tip.
  DAILY.hexOf = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * r, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * r]);
  DAILY.pencil = (P, p0, d, color, len = 175) => {
    const up = Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], u = G.unit3(G.cross3(up, d)), v = G.cross3(d, u);
    const F = G.frameOf(p0, v, u, d);                                     // DAILY.prism: outline (u, s=v) extruded along d
    const at = (a, b, c) => G.add3(G.add3(G.add3(p0, G.mul3(u, a)), G.mul3(v, b)), G.mul3(d, c));
    const hx = DAILY.hexOf(3.6), out = [];
    // eraser and ferrule at the back end
    out.push(DAILY.prism(P, F, DAILY.hexOf(3.3), -10, -3, ["#d97a8a", "#f6b8c2"], "#f3a9b6", "#7a2a3a"));
    out.push(DAILY.prism(P, F, DAILY.hexOf(3.75), -4, 1, ["#8d9096", "#e4e5e8"], "#c7c9cd", "#3c3f45"));
    out.push(DAILY.prism(P, F, hx, 0, len - 22, color[0], color[1], color[2]));
    // the sharpened wood cone and the graphite point: six faces from the hex to a point
    const L0 = len - 22, Lg = len - 6, tip = at(0, 0, len), V = [...hx.map(([a, b]) => at(a, b, L0)), ...hx.map(([a, b]) => at(a * 0.3, b * 0.3, Lg))];
    out.push(ISO.tinted(ISO.T.wood, ISO.poly(V, [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], ...hx.map((_, i) => [i, (i + 1) % 6, 6 + ((i + 1) % 6), 6 + i])], P, "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.poly([...hx.map((_, i) => V[6 + i]), tip], [[0, 1, 2, 3, 4, 5], ...hx.map((_, i) => [i, (i + 1) % 6, 6])], P, "mid")));
    return out.join("");
  };
  // A small memo: the same key returns the same string (poses a demo passes through more than once).
  DAILY.memo = (n = 400) => { const m = new Map(); return (key, fn) => { let v = m.get(key); if (v === undefined) { v = fn(); if (m.size > n) m.clear(); m.set(key, v); } return v; }; };
})();
