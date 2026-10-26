// "helmet cx cy width buckle=0|1 hit=0|1 lab=1 lit=…" — a bicycle helmet on a test headform, in an impact rig.
// The helmet in true construction, with a quarter cut away on the side facing us: the thin hard shell, the thick EPS
// foam liner under it (seen in the two cut faces and at the walls of every vent), comfort pads between foam and head,
// the side straps with their dividers below the ears, the chin buckle, the visor, and the fit band round the back of
// the head with its dial. The rig: a base plate on feet, a load cell under the headform's neck, two guide rods, a
// crossbar with a release latch, and a 5 kg striker on a yoke. A readout box beside it plots the force on the head.
// set({ buckle: 1 }) clicks the buckle shut. set({ hit: 1 }) drops the striker: it meets the crown at 5.4 m/s (the
// speed of a 1.5 m fall, the EN 1078 flat-anvil test; the rig is drawn shortened), the foam under it crushes 15 mm,
// stretching the stop from about 1 ms to about 6 ms and spreading the push over a flat patch, so the peak force on the
// head drops from about 43 kN to about 7 kN. Crushed foam stays crushed. set({ hit: 0 }) puts in a new helmet.
// The helmet, liner and headform are curved surfaces drawn as shaded meshes (mesh()); the rig is kit solids.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const { add3, sub3, mul3, dot3, cross3, unit3, lerp3 } = G;
  const PI = Math.PI, RAD = PI / 180;
  // World units: 1 = 1 cm. Camera azimuth AZ; the helmet's front points across the view, its left side toward us.
  const AZ = 50, EL = 22, THF = (AZ - 90) * RAD, FW = [Math.cos(THF), Math.sin(THF), 0], SW = [-Math.sin(THF), Math.cos(THF), 0];
  const ZH = 19;                                         // the helmet's rim plane sits on the headform's widest line
  const W = ([x, y, z]) => [FW[0] * x + SW[0] * y, FW[1] * x + SW[1] * y, ZH + z];
  // Shell: 28–30 cm long, 21 cm wide, 13 cm tall over the rim; liner 2.5 cm (EPS) under a 1 mm shell.
  const AF = 14.2, AB = 15.6, B = 10.6, H = 13, T = 2.5;
  const CUT = [50 * RAD, 130 * RAD];                     // the cut-away wedge, in helmet angle (0 front, 90 toward us)
  const rimZ = (th) => { const c = Math.cos(th); return c >= 0 ? 1.6 * c * c : -2.4 * c * c; };   // high over the brow, low at the back
  const domeL = (th, ph, aF, aB, b, h, crush = 0) => {
    const c = Math.cos(th), co = Math.cos(ph), s = Math.sin(ph);
    return [co * c * (c >= 0 ? aF : aB), co * Math.sin(th) * b, Math.min(rimZ(th) * (1 - s) + h * s, H - crush)];
  };
  const outerL = (th, ph, crush) => domeL(th, ph, AF, AB, B, H, crush);
  const innerL = (th, ph) => domeL(th, ph, AF - T, AB - T, B - T, H - T);
  // The headform: an egg 22.6 × 14.8 cm, 18.7 cm tall, 0.8 cm inside the liner (the pads' thickness).
  const HA = [11, 12], HB = 7.4, HC = [9.7, 9];
  const headL = (th, ph) => { const c = Math.cos(th), co = Math.cos(ph), s = Math.sin(ph); return [co * c * (c >= 0 ? HA[0] : HA[1]), co * Math.sin(th) * HB, s * (s > 0 ? HC[0] : HC[1])]; };
  const headN = (p) => unit3([p[0] / (p[0] >= 0 ? HA[0] : HA[1]) ** 2, p[1] / HB ** 2, p[2] / (p[2] >= 0 ? HC[0] : HC[1]) ** 2]);
  const headOff = (th, ph, off) => { const p = headL(th, ph); return add3(p, mul3(headN(p), off)); };
  const inCut = (th) => { const a = ((th % (2 * PI)) + 2 * PI) % (2 * PI); return a > CUT[0] && a < CUT[1]; };
  // Impact model: 5 kg striker, 1.5 m drop. A half-sine pulse of length t stops it: peak force = π·m·v / (2t), and the
  // distance it takes is v·t/2 (6 ms → 16 mm, the foam's crush; 1 ms → 2.7 mm, a bare head's give).
  const MASS = 5, V = Math.sqrt(2 * 9.81 * 1.5), E = 0.5 * MASS * V * V, T_BARE = 0.001, T_HELM = 0.006, CRUSH = 1.5;
  const peak = (t) => (PI * MASS * V) / (2 * t), gees = (t) => peak(t) / MASS / 9.81;
  // The flat patch the striker presses on the shell: where the dome stands higher than H − crush.
  const patch = (c) => { const k = Math.sqrt(1 - (1 - c / H) ** 2); return PI * ((AF + AB) / 2) * k * B * k; };
  const BARE_AREA = PI * 2 * 9 * 0.27;                   // a 9 cm-radius head giving 2.7 mm
  const DROP = 8;                                       // drawn travel to the crown

  const SHELL = { dark: "#2f63a3", light: "#93bdea", ink: "#1b3a63" }, FOAM = { dark: "#cbcbc5", light: "#f6f6f3", ink: "#86867f" };
  const HEAD = { dark: "#949aa3", light: "#e6e8ec", ink: "#4a4f57" }, STRAP = { dark: "#202226", light: "#4d5056", ink: "#0e0f11" };
  const BAND = { dark: "#2a2c31", light: "#5a5e65", ink: "#111214" };

  // ── a curved surface as a grid of world points (rows along u, columns along v), drawn as shaded quads with an
  // outline on its silhouette and on its open edges. keep(i, j) leaves out quads hidden behind other parts (no edge
  // is drawn where a kept quad meets a left-out one). sign −1 draws the inside of a shell.
  function mesh(P, grid, { centre, sign = 1, col, keep = null, closed = false, edges = { j0: true, j1: true, i: true }, width = 0.9 }) {
    const view = G.viewOf(P), light = G.lightOf(P), ni = grid.length - 1, nj = grid[0].length - 1;
    const at = grid.map((row) => row.map((p) => K.iso(p, P)));
    const quad = [], buckets = new Map(), edge = [];
    for (let i = 0; i < ni; i++) {
      quad[i] = [];
      for (let j = 0; j < nj; j++) {
        const a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
        let n = cross3(sub3(c, a), sub3(d, b));
        const len = Math.hypot(...n) || 1, mid = mul3(add3(add3(a, b), add3(c, d)), 0.25);
        if (dot3(n, sub3(mid, centre(mid))) < 0) n = mul3(n, -1);
        n = mul3(n, sign / len);
        const front = dot3(n, view) > 1e-4, kept = !keep || keep(i, j, mid);
        quad[i][j] = { front, kept };
        if (!front || !kept) continue;
        const q = Math.round(ISO.clamp(0.5 + 0.5 * dot3(n, light), 0, 1) * 50) * 2;
        buckets.set(q, (buckets.get(q) || "") + K.pathOf([at[i][j], at[i + 1][j], at[i + 1][j + 1], at[i][j + 1]], true));
      }
    }
    const nb = (i, j) => { if (closed) i = (i + ni) % ni; return i < 0 || i >= ni || j < 0 || j >= nj ? null : quad[i][j]; };
    const side = (o, open) => (!o ? open : !o.front);
    for (let i = 0; i < ni; i++) for (let j = 0; j < nj; j++) {
      const f = quad[i][j];
      if (!f.front || !f.kept) continue;
      if (side(nb(i, j - 1), edges.j0)) edge.push(K.pathOf([at[i][j], at[i + 1][j]]));
      if (side(nb(i, j + 1), edges.j1)) edge.push(K.pathOf([at[i][j + 1], at[i + 1][j + 1]]));
      if (side(nb(i - 1, j), edges.i)) edge.push(K.pathOf([at[i][j], at[i][j + 1]]));
      if (side(nb(i + 1, j), edges.i)) edge.push(K.pathOf([at[i + 1][j], at[i + 1][j + 1]]));
    }
    const fills = [...buckets].map(([q, d]) => { const c = `color-mix(in srgb, ${col.light} ${q}%, ${col.dark})`; return `<path d="${d}" fill="${c}" stroke="${c}" stroke-width="0.5"/>`; }).join("");
    return fills + `<path d="${edge.join("")}" fill="none" stroke="${col.ink}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  const gridOf = (fn, u0, u1, nu, v0, v1, nv) => Array.from({ length: nu + 1 }, (_, i) => Array.from({ length: nv + 1 }, (_, j) => W(fn(u0 + ((u1 - u0) * i) / nu, v0 + ((v1 - v0) * j) / nv))));
  const O = W([0, 0, 0]), fromO = () => O;
  const poly = (P, pts, fill, ink, w = 0.8) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  // Clip a convex screen polygon by another (Sutherland–Hodgman).
  const clipConvex = (subject, clip) => {
    let out = subject;
    let area = 0;
    clip.forEach((p, i) => { const q = clip[(i + 1) % clip.length]; area += p[0] * q[1] - q[0] * p[1]; });
    const inside = (p, a, b) => ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) * Math.sign(area) >= 0;
    for (let i = 0; i < clip.length && out.length; i++) {
      const a = clip[i], b = clip[(i + 1) % clip.length], src = out;
      out = [];
      src.forEach((p, k) => {
        const q = src[(k + 1) % src.length], pin = inside(p, a, b), qin = inside(q, a, b);
        if (pin) out.push(p);
        if (pin !== qin) {
          const d1 = [q[0] - p[0], q[1] - p[1]], d2 = [b[0] - a[0], b[1] - a[1]], den = d1[0] * d2[1] - d1[1] * d2[0];
          const t = ((a[0] - p[0]) * d2[1] - (a[1] - p[1]) * d2[0]) / den;
          out.push([p[0] + d1[0] * t, p[1] + d1[1] * t]);
        }
      });
    }
    return out;
  };

  // ── the inside: the liner's far inner face, the two cut faces (shell line, foam with its beads, pads)
  function insideSvg(P, crush) {
    const out = [mesh(P, gridOf(innerL, CUT[1], CUT[0] + 2 * PI, 40, 0, PI / 2, 10), { centre: fromO, sign: -1, col: FOAM, edges: { j0: true, j1: false, i: true } })];
    const view = G.viewOf(P);
    for (const th of CUT) {
      const n = 14, outer = [], inner = [];
      for (let k = 0; k <= n; k++) { const ph = (k / n) * (PI / 2); outer.push(W(outerL(th, ph, crush))); inner.push(W(innerL(th, ph))); }
      // the face's normal points into the wedge
      const toward = W([Math.cos((CUT[0] + CUT[1]) / 2), Math.sin((CUT[0] + CUT[1]) / 2), 0]);
      let nrm = unit3(cross3(sub3(outer[0], outer[n]), [0, 0, 1]));
      if (dot3(nrm, sub3(toward, O)) < 0) nrm = mul3(nrm, -1);
      if (dot3(nrm, view) <= 0) continue;
      const band = [...outer, ...inner.slice().reverse()];
      out.push(poly(P, band, "#f1f0eb", FOAM.ink, 0.8));
      // EPS beads: a light scatter of dots between the liner's faces
      const dots = [];
      for (let k = 1; k < n; k++) for (const f of [0.28, 0.62]) { const p = lerp3(inner[k], outer[k], f + ((k * 37) % 7) * 0.02); dots.push(K.iso(p, P)); }
      out.push(`<path d="${dots.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0.01`).join("")}" stroke="#b8b7b0" stroke-width="1.6" stroke-linecap="round"/>`);
      // comfort pads on the liner's inner face, 8 mm thick, touching the head
      for (const [p0, p1] of [[0.18, 0.55], [1.0, 1.42]]) {
        const edge = Array.from({ length: 7 }, (_, k) => innerL(th, p0 + ((p1 - p0) * k) / 6));
        const back = edge.map((p) => add3(p, mul3(unit3(sub3([0, 0, p[2] * 0.25], p)), 0.8))).reverse();
        out.push(poly(P, [...edge, ...back].map(W), "#5d6168", "#2c2e33", 0.7));
      }
      // the shell: a 1 mm skin over the foam, drawn as a heavy line along the outer edge
      out.push(`<path d="${K.pathOf(outer.map((p) => K.iso(p, P)))}" fill="none" stroke="${SHELL.dark}" stroke-width="2.4" stroke-linecap="round"/>`);
    }
    return `<g data-name="foam">${out.join("")}</g>`;
  }
  // ── the headform: whatever of it isn't hidden behind the shell (below the rim, or inside the cut-away)
  const headSvg = (P) => {
    const nU = 48, nV = 22, th = (i) => (i + 0.5) * ((2 * PI) / nU);
    return mesh(P, gridOf(headL, 0, 2 * PI, nU, -PI / 2, PI / 2, nV), { centre: fromO, col: HEAD, closed: true,
      keep: (i, j, mid) => inCut(th(i)) || mid[2] - ZH < rimZ(th(i)) + 0.4 });
  };
  // ── a flat strap or band along points on the head, as a ribbon facing out (only the side we can see)
  function ribbon(P, pts, normals, w, col, all = false) {
    const view = G.viewOf(P), light = G.lightOf(P), L0 = [], R0 = [], out = [];
    pts.forEach((p, k) => {
      const t = unit3(sub3(pts[Math.min(k + 1, pts.length - 1)], pts[Math.max(k - 1, 0)]));
      const s = mul3(unit3(cross3(t, normals[k])), w / 2);
      L0.push(add3(p, s)); R0.push(sub3(p, s));
    });
    let run = [];
    const flush = () => {
      if (run.length < 2) { run = []; return; }
      const left = run.map((k) => K.iso(L0[k], P)), right = run.map((k) => K.iso(R0[k], P)).reverse();
      out.push(`<path d="${K.pathOf([...left, ...right], true)}" fill="${col.light}" stroke="${col.ink}" stroke-width="0.8" stroke-linejoin="round"/>`);
      run = [];
    };
    for (let k = 0; k < pts.length; k++) {
      const f = all || dot3(normals[k], view) > 0;
      if (f) run.push(k); else flush();
      if (f && k > 0 && !run.includes(k - 1)) run.unshift(k - 1);
    }
    flush();
    return out.join("");
  }
  const along = (a, b, n) => Array.from({ length: n + 1 }, (_, k) => a.map((v, i) => v + (b[i] - v) * (k / n)));
  const onHead = (spec) => { const pts = spec.map(([th, ph, off]) => headOff(th * RAD, ph, off)); return { pts: pts.map(W), nrm: spec.map(([th, ph]) => headN(headL(th * RAD, ph))).map((n) => [FW[0] * n[0] + SW[0] * n[1], FW[1] * n[0] + SW[1] * n[1], n[2]]) }; };
  // A box on a local frame (o, along t, across s, out n), in world points.
  const fbox = (P, o, t, n, [u0, u1], [w0, w1], [y0, y1], tone = "hi") => { const s = unit3(cross3(n, t)); return ISO.box((u, w, y) => add3(add3(add3(o, mul3(t, u)), mul3(s, w)), mul3(n, y)), P, [u0, u1], [w0, w1], [y0, y1], tone); };
  const toW = (v) => [FW[0] * v[0] + SW[0] * v[1], FW[1] * v[0] + SW[1] * v[1], v[2]];

  // ── the fit band round the back of the head, and its dial
  function backSvg(P) {
    const spec = [[138, 0.0, 0.8], [144, -0.22, 0.45], ...along([150, -0.41, 0.25], [210, -0.41, 0.25], 10), [216, -0.22, 0.45], [222, 0.0, 0.8]];
    const { pts, nrm } = onHead(spec);
    const out = [ribbon(P, pts, nrm, 1.3, BAND)];
    // the dial: a knurled wheel on the band at the back, its axle pointing straight back
    const c = W(headOff(PI, -0.41, 0.3)), ax = toW(headN(headL(PI, -0.41)));
    const F = G.frameAlong(c, ax);
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.5, 1.4, F, P), { tone: "mid" }) +
      S(G.disc(0.5, 1.5, 2.0, F, P), { tone: "hi", inner: K.fadedSvg(G.ribsOf(F, 0.5, 1.5, 2.0, 22, P, { fade: [0.08, 0.4], seams: true }), { tone: "lo" }) })));
    // (the dial sits on the band, a mesh drawn without kit solids, so the audit counts it as loose)
    return `<g data-name="dial">${out.join("")}</g>`;
  }
  // ── straps: on each side a front and a rear strap from under the rim to the divider below the ear, and a chin strap
  // from the divider to the buckle. The near (left) half ends in the buckle's tongue, the far half in its socket.
  function strapsSvg(P, b) {
    const out = [], parts = [];
    const thM = 7 + 30 * (1 - b);                          // the tongue's place: 7° when clicked in, pulled away when open
    for (const side of [-1, 1]) {
      const div = [96 * side, -0.62, 0.45];
      for (const anchor of [[42 * side, 0.05, 0.75], [138 * side, -0.18, 0.9]]) {
        const { pts, nrm } = onHead(along(anchor, div, 10));
        out.push(ribbon(P, pts, nrm, 1.5, STRAP));
      }
      const end = side > 0 ? [thM, -1.22, 0.5] : [-7, -1.22, 0.5];
      const { pts, nrm } = onHead(along(div, end, 14));
      out.push(ribbon(P, pts, nrm, 1.5, STRAP));
      // the divider: a small plastic slider where the three straps meet
      const d = W(headOff(div[0] * RAD, div[1], div[2])), dn = toW(headN(headL(div[0] * RAD, div[1])));
      const dt = unit3(sub3(pts[1], pts[0]));
      if (dot3(dn, G.viewOf(P)) > 0) parts.push(fbox(P, d, dt, dn, [-1.5, 1.5], [-1.2, 1.2], [0, 0.6], "hi"));
    }
    // the buckle under the chin: the tongue (near strap) and the socket (far strap), the socket drawn over the tongue
    const at = (th) => W(headOff(th * RAD, -1.22, 0.5)), nAt = (th) => toW(headN(headL(th * RAD, -1.22)));
    const tAt = (th) => unit3(sub3(at(th + 2), at(th - 2)));
    const buckle = fbox(P, at(thM), tAt(thM), nAt(thM), [-2.2, 1.2], [-0.8, 0.8], [0, 0.55], "hi") + fbox(P, at(-7), tAt(-7), nAt(-7), [-1.6, 1.4], [-1.1, 1.1], [0, 0.95], "hi");
    return `<g data-name="strap">${out.join("")}${ISO.tinted(ISO.T.plastic, parts.join(""))}</g><g data-name="buckle">${ISO.tinted(ISO.T.plastic, buckle)}</g>`;
  }
  // ── the shell outside the cut, its vents (foam walls and the dark gap down to the head) and the visor
  // Vents: long slots, front to back. Each is a ring of (angle, height) points on the dome; its wall runs straight
  // through the foam to the same point on the liner's inner face. The top rows are laid out in plan (cm), the side
  // rows by angle.
  const fromPlan = (X, Y) => { const a = X >= 0 ? AF : AB, u = X / a, v = Y / B; return [Math.atan2(v, u), Math.acos(Math.min(0.999, Math.hypot(u, v)))]; };
  const slot = (X, Y, Lh, Wh) => Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * 2 * PI, c = Math.cos(a), s = Math.sin(a); return fromPlan(X + Lh * Math.sign(c) * Math.abs(c) ** 0.5, Y + Wh * Math.sign(s) * Math.abs(s) ** 0.5); });
  const sideSlot = (th, ph, dth, dph) => Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * 2 * PI, c = Math.cos(a), s = Math.sin(a); return [(th + dth * Math.sign(c) * Math.abs(c) ** 0.5) * RAD, ph + dph * Math.sign(s) * Math.abs(s) ** 0.5]; });
  const VENTS = [[-8.6, 0, 2.4, 1.0], [-2.8, 0, 2.4, 1.0], [3.0, 0, 2.4, 1.0], [8.6, 0, 2.2, 1.0],
    ...[-1, 1].flatMap((s) => [[-7, 3.7 * s, 2.3, 0.95], [-1.2, 3.7 * s, 2.3, 0.95], [4.6, 3.7 * s, 2.2, 0.95]])].map((v) => slot(...v))
    .concat([-1, 1].flatMap((s) => [[22, 0.55, 11, 0.09], [158, 0.52, 11, 0.09], [38, 0.3, 10, 0.07], [146, 0.28, 10, 0.07], [90, 0.42, 14, 0.08]].map(([th, ph, a, b]) => sideSlot(th * s, ph, a, b))));
  function shellSvg(P, crush) {
    const out = [mesh(P, gridOf((th, ph) => outerL(th, ph, crush), CUT[1], CUT[0] + 2 * PI, 64, 0, PI / 2, 16), { centre: fromO, col: SHELL, edges: { j0: true, j1: false, i: true } })];
    const view = G.viewOf(P);
    for (const ring of VENTS) {
      if (ring.some(([th]) => { const a = ((th % (2 * PI)) + 2 * PI) % (2 * PI); return a > CUT[0] - 5 * RAD && a < CUT[1] + 5 * RAD; })) continue;   // none across the cut
      const mid = ring.reduce((m, [th, ph]) => [m[0] + th / ring.length, m[1] + ph / ring.length], [0, 0]);
      const c = W(outerL(mid[0], mid[1], crush)), cn = unit3(sub3(c, sub3(O, [0, 0, 4])));
      if (dot3(cn, view) <= 0.08) continue;
      const top = ring.map(([th, ph]) => K.iso(W(outerL(th, ph, crush)), P));
      const bottom = ring.map(([th, ph]) => K.iso(W(innerL(th, ph)), P));
      const hole = clipConvex(bottom, top);
      out.push(`<path d="${K.pathOf(top, true)}" fill="#ecebe5" stroke="${SHELL.ink}" stroke-width="0.8" stroke-linejoin="round"/>`);
      if (hole.length > 2) out.push(`<path d="${K.pathOf(hole, true)}" fill="#3a3d42" stroke="#3a3d42" stroke-width="0.4"/>`);
    }
    // the visor: a thin peak clipped on over the brow, drooping a little, with its front edge and two clip pegs
    const vis = (th, t) => { const base = outerL(th, 0.16), e = 4 * Math.max(0, Math.cos(th * 1.9)) ** 0.6; return add3(base, [e * t * Math.cos(th), e * t * Math.sin(th), -0.7 * t * t - 0.6 * t]); };
    const vg = gridOf(vis, -46 * RAD, 46 * RAD, 22, 0, 1, 3);
    const lip = vg.map((row) => [row[3], add3(row[3], [0, 0, -0.4])]);
    const vout = [mesh(P, lip, { centre: (m) => W([0, 0, m[2] - ZH]), col: STRAP, edges: { j0: true, j1: true, i: true }, width: 0.7 })];
    vout.push(mesh(P, vg, { centre: (m) => sub3(m, [0, 0, 1]), col: STRAP, edges: { j0: true, j1: true, i: true } }));
    vout.push(K.dotsSvg([-30, 30].map((a) => K.iso(W(vis(a * RAD, 0.18)), P)), { size: 0.55, tone: "mid" }));
    out.push(`<g data-name="visor">${vout.join("")}</g>`);
    return `<g data-name="shell">${out.join("")}</g>`;
  }

  // ── the rig
  const RODS = [24, -24].map((d) => [FW[0] * d, FW[1] * d]);
  const BASE = { x: -32, y: -27, w: 64, d: 54, r: 4 };
  const BOX = { x: [8, 28], y: [13, 22], z: [0, 9] };
  const STRIKE_Z = ZH + H + DROP;                        // the striker's face at rest
  const obox = (P, o, a, u, [s0, s1], [u0, u1], [v0, v1], tone = "mid") => S(G.prismOf(G.frameOf(o, a, u, cross3(a, u)), [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], s0, s1, P), { tone });
  function rigBackSvg(P) {
    const out = [ISO.baseboard(P, BASE, { h: 5, feet: 3, tint: ISO.T.steel })];
    out.push(ISO.plate(P, { x: -28, y: 14, w: 18, d: 9, r: 1 }));
    // load cell under the neck, the neck flange and post up into the headform
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 4.6, 0, 3, P, 40, 0.4), { tone: "mid", inner: L(K.sideArc(0, 0, 4.6, 1.5, P, 28), { tone: "faint" }) }) +
      S(K.cylinder(0, 0, 3.4, 3, 1.4, P, 32, 0.3), { tone: "mid" }) + S(K.cylinder(0, 0, 2.3, 4.4, ZH - HC[1] + 0.6 - 4.4, P, 28), { tone: "hi", crease: "none" })));
    // the cable from the load cell to the readout box, lying on the plate
    const cable = [[3.2, 2.6, 1.5], [5.5, 5, 0.35], [9, 10, 0.35], [12, 13, 0.35], [14, 13, 2]].map((p) => K.iso(p, P));
    out.push(`<path d="${K.pathOf(cable)}" fill="none" stroke="#2a2c30" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
    // the two guide rods with their foot collars
    for (const [x, y] of RODS) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 2.4, 0, 2, P, 28, 0.3), { tone: "mid" }) + S(K.cylinder(x, y, 1.1, 2, STRIKE_Z + 12.5 - 2, P, 20), { tone: "hi", crease: "none" })));
    return out.join("");
  }
  function rigTopSvg(P) {
    const top = STRIKE_Z + 12.5, out = [];
    // crossbar on the rod tops, with end caps, and the release latch hanging from its middle
    out.push(ISO.tinted(ISO.T.steel, obox(P, [0, 0, top], FW, SW, [-27, 27], [-1.8, 1.8], [0, 4]) +
      RODS.map(([x, y]) => S(K.cylinder(x, y, 1.5, top + 4, 0.6, P, 20), { tone: "mid" })).join("")));
    out.push(ISO.tinted(ISO.T.plastic, obox(P, [0, 0, STRIKE_Z + 6.6], FW, SW, [-2, 2], [-1.6, 1.6], [0, top - STRIKE_Z - 6.6], "mid")));
    return out.join("");
  }
  // The striker, built at rest: a 13 cm × 5 cm steel disc (5.2 kg), the yoke across to the rods and its two bushings.
  function strikerSvg(P) {
    const z = STRIKE_Z, out = [];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 6.5, z, 5, P, 56, 0.5), { tone: "hi", inner: L(K.sideArc(0, 0, 6.5, z + 1, P, 40), { tone: "faint" }) }) +
      obox(P, [0, 0, z + 5], FW, SW, [-22.1, 22.1], [-1.3, 1.3], [0, 1.6], "hi")));
    // bushings round the rods: rings (the rod runs through them), so they aren't recorded as solids by the audit
    for (const [x, y] of RODS) out.push(ISO.tinted(ISO.T.brass, S(G.ringBand(0, 3.6, 1.15, 1.9, G.frameOf([x, y, z + 3.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid" })));
    return `<g data-name="striker">${out.join("")}</g>`;
  }
  // The readout box: a steel case with a screen on its front (the +y face) and two knobs on top.
  function boxSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, ISO.wbox(P, BOX.x, BOX.y, BOX.z, "mid"))];
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [10, 26], [22, 22.4], [1.6, 8.2], "mid")));
    for (const x of [12, 16]) out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, 17.5, 1.1, 9, 1, P, 20), { tone: "mid" })));
    return out.join("");
  }
  // The trace on the screen: force on the head against time, the bare-head pulse for comparison, the helmet's as it happens.
  function traceSvg(P, k) {
    const m = ISO.faceMatrix(P, [10.6, 22.42, 7.8], 1), u = (t) => 0.5 + (t / 10) * 13.8, v = (f) => 5.6 - (f / 45) * 4.9;
    const curve = (len, pk, upto) => Array.from({ length: 41 }, (_, i) => { const t = 1 + len * Math.min(i / 40, upto); return `${u(t).toFixed(2)},${v(pk * Math.sin(PI * Math.min(1, (t - 1) / len))).toFixed(2)}`; }).join(" ");
    const kn = (peak(T_HELM) / 1000).toFixed(0), kb = (peak(T_BARE) / 1000).toFixed(0);
    return `<g transform="${m}"><rect x="0" y="0" width="14.8" height="6.2" fill="#e9efe6" stroke="#4d5a4a" stroke-width="1" vector-effect="non-scaling-stroke"/>` +
      [10, 20, 30, 40].map((f) => `<path d="M0.5 ${v(f).toFixed(2)}H14.3" stroke="#c7d2c3" stroke-width="0.6" vector-effect="non-scaling-stroke"/>`).join("") +
      `<path d="M0.5 0.5V${v(0)}H14.3" fill="none" stroke="#4d5a4a" stroke-width="0.8" vector-effect="non-scaling-stroke"/>` +
      `<polyline points="${curve(1, peak(T_BARE) / 1000, 1)}" fill="none" stroke="#9a9f97" stroke-width="1.4" stroke-dasharray="3 2" vector-effect="non-scaling-stroke"/>` +
      `<text x="2.4" y="1.2" font-size="0.75" font-family="Helvetica Neue,Arial,sans-serif" font-weight="600" fill="#6b7068">no helmet ${kb} kN</text>` +
      (k > 0.01 ? `<polyline points="${curve(6, peak(T_HELM) / 1000, k)}" fill="none" stroke="${SHELL.dark}" stroke-width="2" vector-effect="non-scaling-stroke"/>` : "") +
      (k > 0.99 ? `<text x="7.6" y="${(v(peak(T_HELM) / 1000) - 0.35).toFixed(2)}" font-size="0.75" font-family="Helvetica Neue,Arial,sans-serif" font-weight="600" fill="${SHELL.ink}">helmet ${kn} kN</text>` : "") +
      `<text x="13.8" y="${(v(0) + 0.5).toFixed(2)}" text-anchor="end" font-size="0.6" font-family="Helvetica Neue,Arial,sans-serif" fill="#4d5a4a">10 ms</text></g>`;
  }

  ISO.add({
    name: "helmet", title: "Bicycle helmet", compare: "helmet 480 280 320",
    about: "A bicycle helmet cut away on a test headform: hard shell, thick EPS foam, comfort pads, straps, buckle, visor and fit dial; a striker hits it and the foam crushes to stretch the stop and cut the force.",
    line: "helmet cx cy width buckle=0|1 hit=0|1 lab=1 lit=shell|foam|strap|buckle|dial|visor|striker",
    demo: { line: "helmet 480 280 340", script: [{ set: { buckle: 1 }, hold: "settle" }, { set: { hit: 1 }, hold: "settle" }] },
    make([cx, cy, width = 340], o, t, parent) {
      const lab = o.lab !== "0", Wd = width * 2.6, Hd = width * 1.46;
      const pts = [...K.boxCorners(BASE, -8, 0), ...RODS.map(([x, y]) => [x, y, STRIKE_Z + 17.6])];
      const { P, g } = ISO.frame(pts, cx, cy, Wd, Hd, { azimuth: AZ, elevation: EL }, parent);
      g.innerHTML = `<g>${rigBackSvg(P)}</g><g data-part="inside"></g><g>${headSvg(P)}</g><g>${backSvg(P)}</g><g data-part="straps"></g><g data-part="shell"></g>` +
        `<g>${rigTopSvg(P)}</g><g data-part="striker">${strikerSvg(P)}</g><g>${boxSvg(P)}</g><g data-part="trace"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const st = { b: ISO.num(o, "buckle", 0) ? 1 : 0, bT: 0, hitT: ISO.num(o, "hit", 0) ? 1 : 0, ph: 0, crush: 0, dz: 0, k: 0, lit: o.lit || "" };
      st.bT = st.b;
      const done = () => { st.ph = 2; st.crush = CRUSH; st.dz = -DROP * 0.5; st.k = 1; };   // the rig's catch holds the striker on its rebound, off the dent
      if (st.hitT) done();
      const word = (p, text, anchor = "middle", dy = 0) => ISO.word(K.iso(p, P), text, "#444", { anchor, size: 13, dy });
      if (lab) el.words.innerHTML = word(W(outerL(205 * RAD, 0.55)), "Hard shell", "end", -6) + word(W(innerL(CUT[0], 0.75)), "Foam liner", "start", 0) +
        word(W(headOff(100 * RAD, -1.0, 0.5)), "Strap", "middle", 18) + word(W(headOff(PI, -0.5, 2.5)), "Fit dial", "end", 14) +
        word(W(add3(outerL(0, 0.1), [5, 0, -1])), "Visor", "start", 4) + word([RODS[0][0], RODS[0][1], STRIKE_Z + 2], "Striker 5 kg", "start", 0) +
        word([(BOX.x[0] + BOX.x[1]) / 2, BOX.y[1], 0], "Force on the head", "middle", 16);
      let lastLit = null;
      const draw = () => {
        const ck = (Math.round(st.crush * 10) / 10).toFixed(1);
        w.rebuild(el.inside, ck, () => insideSvg(P, +ck));
        w.rebuild(el.shell, ck, () => shellSvg(P, +ck));
        w.rebuild(el.straps, st.b.toFixed(1), () => strapsSvg(P, st.b));
        w.attr(el.striker, "transform", K.translateAlong(P, [0, 0, st.dz]));
        w.rebuild(el.trace, st.k.toFixed(1), () => traceSvg(P, st.k));
        if (st.lit !== lastLit || el.shell._fresh || el.inside._fresh || el.straps._fresh) {
          lastLit = st.lit;
          const all = [...g.querySelectorAll("[data-name]")], on = String(st.lit).split(",");
          w.light(all, all.filter((p) => on.includes(p.dataset.name)));
        }
      };
      g.set = (p) => {
        if (p.buckle !== undefined) st.bT = +p.buckle ? 1 : 0;
        if (p.hit !== undefined) { st.hitT = +p.hit ? 1 : 0; if (st.hitT) st.ph = 0; }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.b = ISO.follow(st.b, st.bT, dt, 0.25, calm);
        if (Math.abs(st.b - st.bT) < 0.004) st.b = st.bT;
        let moving = st.b !== st.bT;
        if (st.hitT && st.ph < 2) {
          // fall (as from rest, slowed to be seen), crush and the trace, then the rebound, caught halfway up
          st.ph = calm ? 2 : st.ph + dt;
          const tt = st.ph, fall = 0.55, crushT = 0.6, back = 0.6;
          if (tt < fall) { st.dz = -DROP * (tt / fall) ** 2; st.crush = 0; st.k = 0; }
          else if (tt < fall + crushT) { const k = ISO.smooth(0, 1, (tt - fall) / crushT); st.k = k; st.crush = CRUSH * k; st.dz = -DROP - st.crush; }
          else if (tt < fall + crushT + back) { st.k = 1; st.crush = CRUSH; st.dz = -DROP - CRUSH + (DROP * 0.5 + CRUSH) * ISO.smooth(0, 1, (tt - fall - crushT) / back); }
          else done();
          moving = moving || st.ph < 2;
        } else if (!st.hitT && (st.crush > 0 || st.dz < 0)) {
          st.crush = 0; st.k = 0; st.dz = ISO.follow(st.dz, 0, dt, 0.3, calm);
          if (st.dz > -0.01) st.dz = 0;
          moving = moving || st.dz < 0;
        }
        draw();
        return moving;
      };
      g.readout = () => {
        const strap = st.b > 0.95 ? "buckled" : st.b < 0.05 ? "strap open" : "buckling…";
        if (!st.hitT) return `${strap} · 1 mm hard shell over 25 mm of EPS foam · 5 kg striker set for a 1.5 m drop (${V.toFixed(1)} m/s)`;
        if (st.k < 0.99) return st.k > 0 ? "impact · the foam is crushing…" : "striker falling…";
        return `hit at ${V.toFixed(1)} m/s (${E.toFixed(0)} J) · foam crushed ${(CRUSH * 10).toFixed(0)} mm · stop takes ${T_HELM * 1000} ms, not ${T_BARE * 1000} ms · peak force ${(peak(T_HELM) / 1000).toFixed(0)} kN (${gees(T_HELM).toFixed(0)} g), not ${(peak(T_BARE) / 1000).toFixed(0)} kN (${gees(T_BARE).toFixed(0)} g) · spread over ~${patch(CRUSH).toFixed(0)} cm², not ~${BARE_AREA.toFixed(0)} cm² · crushed foam stays crushed: replace the helmet`;
      };
      draw();
      if (t) label(parent, cx, cy - Hd / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
