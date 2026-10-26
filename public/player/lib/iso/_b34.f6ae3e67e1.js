// Batch b34 helpers (computer-science parts): shared by mechkeyboard + keyswitch (keyboard.js's switch and keycap) and
// lockcylinder + brasskey (key.js's key). Not a recipe: it only defines window.B34.
(() => {
  const K = window.K;
  let T;   // window.TECH: _tech.js loads after this file, so it is looked up at draw time
  const B34 = (window.B34 = {});
  // a finite number from a set() or a line value (the cleaner clamps ranges, but a set may skip it), clamped
  B34.num = (v, d, lo, hi) => { const x = v === "" || v == null ? NaN : +v; return ISO.clamp(Number.isFinite(x) ? x : d, lo, hi); };
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups are rebuilt as they move)
  B34.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // a camera moved so world point p lands where the origin did (the scene's drawing kept in its own coordinates)
  B34.shift = (P, p) => { const o = K.iso([0, 0, 0], P), a = K.iso(p, P); return { ...P, origin: [P.origin[0] + o[0] - a[0], P.origin[1] + o[1] - a[1]] }; };
  B34.view = (P) => { const d0 = K.depthOf([0, 0, 0], P); return [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0]; };

  // ── the key switch (keyboard.js), in mm, centred on x = y = 0: housing floor F0, plate PZ..PT, cap CB..CT
  const SW = (B34.SW = { PZ: 14, PT: 15.5, CB: 16, CT: 24.5, TRAVEL: 4, F0: 7.4, BASE: 6.6 });
  const box = (P, x, y, z, tone = "mid", c = T.C.dark, lit) => T.box(P, x, y, z, tone, c, lit);
  const coilPts = (z0, z1, turns = 5, r = 2.6) => Array.from({ length: turns * 24 + 1 }, (_, i) => { const a = (i / 24) * Math.PI * 2 + Math.PI / 2; return [r * Math.cos(a), r * Math.sin(a), z0 + ((z1 - z0) * i) / (turns * 24)]; });
  const coil = (P, pts, front) => { const runs = []; let cur = [];
    for (const p of pts) { const isF = p[1] > 0.2; if (isF === front) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; } }
    if (cur.length) runs.push(cur);
    return `<path d="${runs.filter((r) => r.length > 1).map((r) => K.pathOf(r.map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="${front ? "#4a5058" : "#8d9096"}" stroke-width="${front ? 1.1 : 0.9}" stroke-linecap="round"/>`; };
  // The switch at press pr (0..1), its front half cut away at y = 0: below the plate the bottom housing's back half,
  // the two gold leaves at the back, the spring and the stem's leg and pole; above it the top housing's back half.
  // solid = true (a switch on its own, no plate): the bottom housing's walls run on up through the plate's gap.
  B34.switchSvg = (P, pr, solid = false) => {
    T = window.TECH;
    const { F0, PZ, PT, TRAVEL } = SW, dz = -TRAVEL * pr, sb = 14.5 + dz, zw = solid ? PT : PZ, H = T.C.dark;
    const closed = ISO.smooth(0.4, 0.55, pr), tip = 4.2 + 1.4 * (1 - closed);
    const s = [`<g data-name="housing">${box(P, [-7, 7], [-7, 0], [SW.BASE, F0])}${box(P, [-7, 7], [-7, -6], [F0, zw])}${box(P, [-7, -6], [-6, 0], [F0, zw])}</g>`];
    const leaves = [box(P, [3.6, 4.2], [-5.8, -2], [F0, 11.6], "hi", T.C.gold, closed > 0.5)];
    leaves.push(ISO.tinted(T.C.gold, ISO.poly([[5.8, -5.8, F0], [6.4, -5.8, F0], [tip + 0.6, -5.8, 11.4], [tip, -5.8, 11.4], [5.8, -2, F0], [6.4, -2, F0], [tip + 0.6, -2, 11.4], [tip, -2, 11.4]], ISO.BOX_F, P, "hi", closed > 0.5)));
    s.push(`<g data-name="contacts">${leaves.join("")}</g>`, `<g data-name="spring">${coil(P, coilPts(F0, sb), false)}</g>`);
    const red = ISO.T.red, stem = [box(P, [-0.9, 0.9], [-0.9, 0.9], [Math.max(F0 + 0.4, sb - 6), sb], "hi", red), box(P, [4.5, 5.4], [-1.9, -0.9], [Math.max(F0 + 0.4, sb - 3.4), sb], "hi", red)];
    s.push(`<g data-name="spring">${coil(P, coilPts(F0, sb), true)}</g>`, `<g data-name="housing">${box(P, [6, 7], [-6, 0], [F0, zw])}</g>`);
    s.push(`<g data-name="stem">${stem.join("")}${box(P, [-3, 3], [-3, 3], [sb, 19.6 + dz], "hi", red)}${box(P, [3, 5.4], [-1.9, -0.9], [sb, sb + 1.2], "hi", red)}${box(P, [-2, 2], [-0.6, 0.6], [19.6 + dz, 23.4 + dz], "hi", red)}${box(P, [-0.6, 0.6], [-2, 2], [19.6 + dz, 23.4 + dz], "hi", red)}</g>`);
    const top = [box(P, [-7, 7], [-7, -6], [PT, 20.4]), box(P, [-7, -6], [-6, 0], [PT, 20.4]), box(P, [6, 7], [-6, 0], [PT, 20.4])];
    top.push(box(P, [-6, 6], [-6, -4.6], [19.4, 20.4]), box(P, [-6, -4.6], [-4.6, 0], [19.4, 20.4]), box(P, [4.6, 6], [-4.6, 0], [19.4, 20.4]));
    return s.join("") + `<g data-name="housing">${top.join("")}</g>`;
  };
  // A keycap over the key cell [x0, x1] × [y0, y1] (mm), raised dz: tapered sides, its letters printed on the top.
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  B34.capSvg = (P, k, dz = 0, lit = false) => {
    T = window.TECH;
    const a = [k.x0 + 0.6, k.x1 - 0.6, k.y0 + 0.6, k.y1 - 0.6], b = [a[0] + 2.6, a[1] - 2.6, a[2] + 3.2, a[3] - 1.6], z0 = SW.CB + dz, z1 = SW.CT + dz;
    const V = [[a[0], a[2], z0], [a[1], a[2], z0], [a[1], a[3], z0], [a[0], a[3], z0], [b[0], b[2], z1], [b[1], b[2], z1], [b[1], b[3], z1], [b[0], b[3], z1]];
    const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    const sz = k.name.length > 1 ? 2.6 : 4.2;
    const txt = !k.name ? "" : k.mid ? T.flat(P, [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, z1 + 0.02], [1, 0, 0], [0, 1, 0], T.text(0, 2.2, esc(k.name), 6.5, "#2a2e33", "middle", 600))
      : T.flat(P, [b[0] + 1.6, b[2] + 1.2, z1 + 0.02], [1, 0, 0], [0, 1, 0], T.text(0, sz, esc(k.name), sz, "#2a2e33", "start", 600));
    return ISO.tinted(T.C.white, ISO.poly(V, F, P, "hi", lit)) + txt;
  };

  // ── the key (key.js), in key units of 0.4 mm: the blade along +x from the shoulder (x = 0) to the tip (TIP), its
  // bitting edge up (+z); five V cuts at PX, each to depth 1 (shallow) … 6 (deep); the round bow at −x
  const KY = (B34.KEY = { PX: [14, 31, 48, 65, 82], SL: 30, KF: 3, KT: 24, TIP: 96, BOW: [-36, 13, 26], U: 0.04 });
  KY.hOf = (d) => 22 - 1.6 * d;
  KY.parse = (v) => { const c = String(v || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 6); return c.length === 5 ? c : [2, 5, 3, 6, 4]; };
  KY.edgeOf = (cuts) => (x) => Math.min(22, ...cuts.map((d, i) => KY.hOf(d) + Math.abs(x - KY.PX[i]) * 1.2), 22 - Math.max(0, x - (KY.TIP - 10)) * 1.1);
  const BR = ["#b89545", "#f1dd9f"], BRF = "#f6e7bf", BRI = (KY.INK = "#6b5114");
  KY.blade = (cuts) => { const e = KY.edgeOf(cuts), top = Array.from({ length: KY.TIP + 1 }, (_, x) => [x, e(x)]); return [[-3, KY.KF + 2], [KY.TIP - 4, KY.KF + 2], [KY.TIP, KY.KF + 8], ...top.reverse(), [-3, 22]]; };
  KY.bow = () => { const [bx, bz, br] = KY.BOW; return ISO.hullOf([[-3, 0], [-3, 27], [-10, 30], [-10, -3], ...ISO.arc(bx, bz, br, 0, Math.PI * 2, 32)]); };
  const stroke = (d, w, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  // edge up, along x, its faces at y = ±1.6 (blade) and ±2.2 (bow): the pose in a lock
  KY.edgeSvg = (Q, cuts) => {
    const [bx, bz] = KY.BOW, face = (pts, y) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], Q)), true)}" fill="#fdfdfb" stroke="${BRI}" stroke-width="0.9"/>`;
    const blade = ISO.prismY(Q, KY.blade(cuts), -1.6, 1.6, BR, BRF, BRI,
      stroke(K.pathOf([[0, 1.6, 10], [KY.TIP - 10, 1.6, 10]].map((p) => K.iso(p, Q))), 0.8, BRI) + stroke(K.pathOf([[0, 1.6, 12.4], [KY.TIP - 12, 1.6, 12.4]].map((p) => K.iso(p, Q))), 0.6, "#c9a85a"));
    const bow = ISO.prismY(Q, KY.bow(), -2.2, 2.2, BR, BRF, BRI, face(ISO.arc(bx - 10, bz, 6, 0, Math.PI * 2, 20), 2.2) + stroke(K.pathOf([[-12, 2.2, -1], [-12, 2.2, 27]].map((p) => K.iso(p, Q))), 0.7, BRI));
    return `<g data-name="bow">${bow}</g><g data-name="blade">${blade}</g>`;
  };
  // An outline in (x, y) stood up from z0 to z1 (a flat sheet lying on a surface, concave allowed): the sides that face
  // the camera, far first, shaded by facing, then the top face. extra is drawn on the top.
  B34.prismZ = (P, pts, z0, z1, [dark, light], face, ink, extra = "") => {
    const view = B34.view(P), n = pts.length, quads = [], vis = [];
    let area = 0;
    pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % n]; area += x * y2 - x2 * y; });
    const Tp = pts.map(([x, y]) => K.iso([x, y, z1], P)), Bp = pts.map(([x, y]) => K.iso([x, y, z0], P));
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n], len = Math.hypot(bx - ax, by - ay) || 1;
      let nx = (by - ay) / len, ny = -(bx - ax) / len;
      if (area < 0) { nx = -nx; ny = -ny; }
      vis[i] = nx * view[0] + ny * view[1] > 1e-6;
      if (!vis[i]) continue;
      const lit = ISO.clamp(0.5 + 0.5 * (nx * -0.45 + ny * 0.5), 0, 1);
      quads.push({ k: K.depthOf([(ax + bx) / 2, (ay + by) / 2, z0], P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([Bp[i], Bp[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([Tp[i], Bp[i]]));
    }
    return quads.map(({ i, fill }) => `<path d="${K.pathOf([Tp[i], Tp[(i + 1) % n], Bp[(i + 1) % n], Bp[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`).join("") +
      `<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/><path d="${K.pathOf(Tp, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>${extra}`;
  };
  // lying flat, broad face up: the outline (x, z) of the edge pose becomes (x, y), cuts toward −y (away from us)
  KY.flatSvg = (Q, cuts) => {
    const [bx, bz] = KY.BOW, m = ([x, z]) => [x, bz - z], at = (x, y) => K.iso([x, y, 1.6], Q);
    const hole = `<path d="${K.pathOf(ISO.arc(bx - 10, 0, 6, 0, Math.PI * 2, 20).map(([x, y]) => K.iso([x, y, 2.2], Q)), true)}" fill="#fdfdfb" stroke="${BRI}" stroke-width="0.9"/>`;
    const bow = B34.prismZ(Q, KY.bow().map(m), 0, 2.2, BR, BRF, BRI, hole + stroke(K.pathOf([[-12, bz + 1], [-12, bz - 27]].map(([x, y]) => K.iso([x, y, 2.2], Q))), 0.7, BRI));
    const blade = B34.prismZ(Q, KY.blade(cuts).map(m), 0, 1.6, BR, BRF, BRI,
      stroke(K.pathOf([at(0, bz - 10), at(KY.TIP - 10, bz - 10)]), 0.8, BRI) + stroke(K.pathOf([at(0, bz - 12.4), at(KY.TIP - 12, bz - 12.4)]), 0.6, "#c9a85a"));
    return `<g data-name="bow">${bow}</g><g data-name="blade">${blade}</g>`;
  };
})();
