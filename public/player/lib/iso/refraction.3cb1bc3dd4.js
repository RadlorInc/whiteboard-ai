// "refraction cx cy size k=slab|bent|tir|fibre i=40 n=1.5 lab=1 lit=block|raybox|normal" — light bending, on the bench.
// slab: a ray box aims one narrow ray at a rectangular glass block on a sheet of paper; at each face it bends by Snell's
// law, n₁ sin i = n₂ sin r, toward the normal going in and away coming out, and leaves parallel to how it came, shifted
// sideways. tir: the ray goes through the curved side of a semicircular block straight to the centre of the flat face;
// below the critical angle (sin c = 1/n, 41.8° for n = 1.5) it leaves bent away from the normal, above it every bit of
// it reflects back inside (total internal reflection). fibre: a ray enters the end of a long perspex strip and reflects
// totally off its walls all the way along. bent: a pencil in a beaker of water looks bent where it enters the water,
// because the part under water looks raised (apparent depth = real depth / 1.33). set({ i }) turns the ray box,
// set({ k }) changes the set-up.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -130, y: -125, w: 260, d: 230, r: 8 }, PAPER = { x: -118, y: -113, w: 236, d: 206, r: 1 };
  const RAY = "#e09a00", ZP = 0.5, BOX = 78, rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
  const SLAB = { x: -50, y: -24, w: 100, d: 56 }, SEMI = 50, STRIP = { x: -24, y: -12, w: 134, d: 24 };
  let ZR = 10;   // the height the light sheet is drawn at: the middle of the block
  const iso = (P, x, y, z = ZR) => K.iso([x, y, z], P);
  const inPaper = ([x, y]) => x > PAPER.x + 2 && x < PAPER.x + PAPER.w - 2 && y > PAPER.y + 2 && y < PAPER.y + PAPER.d - 2;
  const toEdge = (p, d) => { const t = Math.min(d[0] > 0 ? (PAPER.x + PAPER.w - 3 - p[0]) / d[0] : d[0] < 0 ? (PAPER.x + 3 - p[0]) / d[0] : 1e9, d[1] > 0 ? (PAPER.y + PAPER.d - 3 - p[1]) / d[1] : d[1] < 0 ? (PAPER.y + 3 - p[1]) / d[1] : 1e9); return [p[0] + d[0] * t, p[1] + d[1] * t]; };
  // Snell's law in vector form: d meets a face with normal nn (pointing back toward where d comes from), n1 → n2.
  const bend = (d, nn, eta) => { const c = -(d[0] * nn[0] + d[1] * nn[1]), k = 1 - eta * eta * (1 - c * c); return k < 0 ? null : [eta * d[0] + (eta * c - Math.sqrt(k)) * nn[0], eta * d[1] + (eta * c - Math.sqrt(k)) * nn[1]]; };
  const mirror = (d, nn) => { const c = d[0] * nn[0] + d[1] * nn[1]; return [d[0] - 2 * c * nn[0], d[1] - 2 * c * nn[1]]; };
  const arrowed = (P, pts, color = RAY, w = 1.5, extra = "") => {
    let d = K.pathOf(pts.map((p) => iso(P, ...p)));
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 24) continue;
      const m = iso(P, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), q = iso(P, (a[0] + b[0]) / 2 - (b[0] - a[0]) / len, (a[1] + b[1]) / 2 - (b[1] - a[1]) / len), ang = Math.atan2(m[1] - q[1], m[0] - q[0]);
      d += [0.5, -0.5].map((t) => `M${(m[0] - 5 * Math.cos(ang + t)).toFixed(1)} ${(m[1] - 5 * Math.sin(ang + t)).toFixed(1)}L${m[0].toFixed(1)} ${m[1].toFixed(1)}`).join("");
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  };
  // An angle arc on the paper about c from direction a0 to a1 (radians, atan2 on the paper).
  const arcAt = (P, c, r, a0, a1, color) => `<path d="${K.pathOf(Array.from({ length: 21 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / 20; return iso(P, c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); }))}" fill="none" stroke="${color}" stroke-width="1.1"/>`;

  function sheetSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 74, y: -122, w: 44, d: 10, r: 1.2 })];
    out.push(S(K.slabOf(PAPER, 0, 0.4, P, 2), { tone: "hi", crease: "none" }));
    for (const [x, y] of K.corners(PAPER, 6)) out.push(S(K.cylinder(x, y, 2.4, 0.4, 0.8, P, 16), { tone: "mid" }), D([K.iso([x, y, 1.2], P)], { size: 0.5 }));
    return out.join("");
  }
  // The ray box lying on the paper, its slit at `slit`, pointing along d: a foot, the housing with vents, a cap with one
  // slit, a switch and a cable gland at the back.
  function boxSvg(P, slit, d) {
    const u = [-d[0], -d[1]], v = [-u[1], u[0]], c = [slit[0] + u[0] * 14, slit[1] + u[1] * 14];
    const at = (a, z, b) => [c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b, z];
    const out = [ISO.box(at, P, [-16, 20], [0.4, 3], [-11, 11], "mid"), ISO.box(at, P, [-12, 18], [3, 24], [-9, 9], "mid"), ISO.box(at, P, [-14, -12], [3, 21], [-7, 7], "hi")];
    for (let k = 0; k < 3; k++) out.push(L(K.pathOf([[-5 + k * 6, -5], [-2.5 + k * 6, -5], [-2.5 + k * 6, 5], [-5 + k * 6, 5]].map(([a, b]) => K.iso(at(a, 24, b), P)), true), { tone: "lo" }));
    out.push(`<path d="${K.pathOf([[-14.05, 5, 1], [-14.05, 19, 1], [-14.05, 19, -1], [-14.05, 5, -1]].map(([a, z, b]) => K.iso(at(a, z, b), P)), true)}" fill="#2a2b2f"/>`);
    out.push(ISO.tinted(ISO.T.plastic, ISO.box(at, P, [11, 16], [24, 26.5], [-3.5, 3.5], "hi")));
    out.push(D([at(-14, 3, -11), at(18, 3, -11), at(-14, 3, 11), at(18, 3, 11)].map((p) => K.iso(p, P)), { size: 0.5 }));
    return out.join("");
  }
  const glassStyle = `<style>.rf-glass .iso-fill{fill-opacity:.5}.rf-glass .iso-shade,.rf-glass .iso-top{opacity:.5}</style>`;
  const glass = (svg) => `<g class="rf-glass" data-name="block" style="${ISO.T.glass}">${svg}</g>`;

  // ── the set-ups: each returns the slit, the ray's direction, the rays (polylines), dashed normals, arcs, words and numbers.
  function slab(i, n) {
    const d = [Math.sin(rad(i)), Math.cos(rad(i))], H = [-22, SLAB.y], r = Math.asin(Math.sin(rad(i)) / n);
    const din = bend(d, [0, -1], 1 / n), E = [H[0] + din[0] * (SLAB.d / din[1]), SLAB.y + SLAB.d], dout = bend(din, [0, -1], n), F = toEdge(E, dout);
    const shift = (SLAB.d / Math.cos(r)) * Math.sin(rad(i) - r);
    return {
      slit: [H[0] - d[0] * BOX, H[1] - d[1] * BOX], d, rays: [[[H[0] - d[0] * BOX, H[1] - d[1] * BOX], H, E, F]],
      normals: [[[H[0], H[1] - 44], [H[0], H[1] + 30]], [[E[0], E[1] - 30], [E[0], E[1] + 44]]],
      arcs: [[H, 26, Math.atan2(-1, 0), Math.atan2(-d[1], -d[0]), "#2b6cc4"], [H, 22, Math.atan2(1, 0), Math.atan2(din[1], din[0]), "#c0392b"]],
      words: [[[H[0] - 14, H[1] - 26], `i = ${i.toFixed(0)}°`, "#2b6cc4", "end"], [[H[0] + 16, H[1] + 26], `r = ${deg(r).toFixed(0)}°`, "#c0392b", "start"], [[SLAB.x + SLAB.w + 6, SLAB.y + 20], "glass block", "#555", "start"], [[E[0] + 26, E[1] + 34], "leaves parallel", "#8a5a10", "start"]],
      read: `glass block · i = ${i.toFixed(0)}° · r = ${deg(r).toFixed(1)}° inside · n = sin i / sin r = ${n.toFixed(2)} · it bends toward the normal going in, away coming out, and leaves parallel, ${(shift / 10).toFixed(1)} cm to the side`,
    };
  }
  function tir(i, n) {
    const d = [Math.sin(rad(i)), Math.cos(rad(i))], O = [0, 0], c = deg(Math.asin(1 / n)), start = [-d[0] * BOX, -d[1] * BOX];
    const out = bend(d, [0, -1], n), back = mirror(d, [0, 1]);
    const rays = [[start, O, out ? toEdge(O, out) : [back[0] * (SEMI + 40), back[1] * (SEMI + 40)]]];
    const weak = out ? [O, [back[0] * (SEMI + 40), back[1] * (SEMI + 40)]] : null;
    return {
      slit: start, d, rays, weak, normals: [[[0, -SEMI - 8], [0, 60]]],
      arcs: [[O, 24, Math.atan2(-1, 0), Math.atan2(-d[1], -d[0]), "#2b6cc4"], ...(out ? [[O, 30, Math.atan2(1, 0), Math.atan2(out[1], out[0]), "#c0392b"]] : [])],
      words: [[[-14, -34], `i = ${i.toFixed(0)}°`, "#2b6cc4", "end"], ...(out ? [[[22, 36], `${deg(Math.asin(n * Math.sin(rad(i)))).toFixed(0)}°`, "#c0392b", "start"]] : [[[40, -30], "total internal reflection", "#c0392b", "start"]]), [[-SEMI - 4, 14], "semicircular block", "#555", "end"]],
      read: out ? `semicircular block · i = ${i.toFixed(0)}° is less than the critical angle c = ${c.toFixed(1)}° · the ray leaves at ${deg(Math.asin(n * Math.sin(rad(i)))).toFixed(1)}° from the normal (a faint part reflects)`
        : `semicircular block · i = ${i.toFixed(0)}° is more than the critical angle c = ${c.toFixed(1)}° (sin c = 1/n) · total internal reflection: all the light reflects back inside`,
    };
  }
  function fibre(i, n) {
    const d = [Math.cos(rad(i)), Math.sin(rad(i))], H = [STRIP.x, 0], pts = [[H[0] - d[0] * 62, H[1] - d[1] * 62], H];
    let p = H, dir = bend(d, [-1, 0], 1 / n), hits = 0;
    while (hits < 40) {
      const ty = dir[1] > 0 ? (STRIP.y + STRIP.d - p[1]) / dir[1] : (STRIP.y - p[1]) / dir[1], tx = (STRIP.x + STRIP.w - p[0]) / dir[0];
      if (tx <= ty) { p = [p[0] + dir[0] * tx, p[1] + dir[1] * tx]; pts.push(p); pts.push(toEdge(p, bend(dir, [-1, 0], n))); break; }
      p = [p[0] + dir[0] * ty, p[1] + dir[1] * ty]; pts.push(p); dir = [dir[0], -dir[1]]; hits++;
    }
    const wall = 90 - deg(Math.asin(Math.sin(rad(i)) / n));
    return {
      slit: pts[0], d, rays: [pts], normals: [], arcs: [], words: [[[40, STRIP.y + STRIP.d + 44], "perspex strip: light reflects all the way along", "#555", "middle"]],
      read: `light pipe · the ray hits each wall at ${wall.toFixed(0)}°, more than the critical angle ${deg(Math.asin(1 / n)).toFixed(1)}°, so it reflects totally ${hits} times and comes out of the far end (an optical fibre works the same way)`,
    };
  }

  ISO.add({
    name: "refraction", title: "Refraction with a ray box", compare: "refraction 480 270 300 k=slab",
    about: "A ray box and glass blocks on paper: the ray bends at each face (Snell's law), and past the critical angle it reflects totally inside.",
    line: "refraction cx cy size k=slab|bent|tir|fibre i=40 n=1.5 lab=1 lit=block|raybox|normal",
    demo: { line: "refraction 480 270 300 k=slab i=30", script: [{ set: { i: 30 }, hold: 1.2 }, { set: { i: 60 }, hold: "settle" }, { set: { k: "tir", i: 30 }, hold: "settle" }, { set: { i: 50, lit: "block" }, hold: "settle" } ] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, 30]], cx, cy, W, H, { azimuth: 112, elevation: 44 }, parent);
      const n = ISO.clamp(ISO.num(o, "n", 1.5), 1.2, 2.4), lim = { slab: [5, 70], tir: [5, 75], fibre: [20, 50], bent: [0, 0] };
      const s = { k: lim[o.k] ? o.k : "slab", i: ISO.num(o, "i", 40) }; s.i = ISO.clamp(s.i, ...lim[s.k]); s.iT = s.i;
      let lit = o.lit || "", built = "";
      const el = {}, w = ISO.writer();
      const build = () => {
        let block = "";
        if (s.k === "slab") block = glass(ISO.wbox(P, [SLAB.x, SLAB.x + SLAB.w], [SLAB.y, SLAB.y + SLAB.d], [0.4, 20], "hi", false));
        if (s.k === "tir") block = glass(S(K.extrude([...ISO.arc(0, 0, SEMI, Math.PI, 2 * Math.PI, 40)], 0.4, 20, P), { tone: "hi" }));
        if (s.k === "fibre") block = glass(ISO.wbox(P, [STRIP.x, STRIP.x + STRIP.w], [STRIP.y, STRIP.y + STRIP.d], [0.4, 10], "hi"));
        if (s.k === "bent") block = bentSvg(P, lab);
        g.innerHTML = glassStyle + `<g>${sheetSvg(P)}</g><g data-part="boxBack" data-name="raybox"></g><g data-part="marks" data-name="normal"></g>${block}<g data-part="rays"></g><g data-part="boxFront" data-name="raybox"></g><g data-part="words"></g>`;
        Object.assign(el, LAB.parts(g));
      };
      const draw = () => {
        if (built !== s.k) { built = s.k; ZR = s.k === "fibre" ? 5 : 10; build(); }
        if (s.k === "bent") { LAB.light(w, g, lit); return; }
        const key = s.i.toFixed(2), m = (s.k === "slab" ? slab : s.k === "tir" ? tir : fibre)(s.i, n);
        const near = K.depthOf([m.slit[0], m.slit[1], 0], P) > K.depthOf([0, 0, 0], P);
        w.rebuild(el.boxBack, key, () => (near ? "" : boxSvg(P, m.slit, m.d)));
        w.rebuild(el.boxFront, key, () => (near ? boxSvg(P, m.slit, m.d) : ""));
        w.rebuild(el.marks, key, () => m.normals.map(([a, b]) => L(K.pathOf([iso(P, ...a), iso(P, ...b)]), { tone: "lo", dashed: true, free: true })).join(""));
        w.rebuild(el.rays, key, () => m.rays.map((r) => arrowed(P, r)).join("") + (m.weak ? arrowed(P, m.weak, RAY, 0.8, ' opacity=".55"') : "") + m.arcs.map(([c, r, a0, a1, col]) => arcAt(P, c, r, a0, a1, col)).join(""));
        w.rebuild(el.words, lab ? key : "", () => (lab ? m.words.map(([at, tx, col, anchor]) => ISO.word(iso(P, ...at), tx, col, { size: 14, anchor })).join("") + ISO.word(iso(P, m.slit[0] - m.d[0] * 30, m.slit[1] - m.d[1] * 30, 30), "ray box", "#555", { size: 13, dy: -8 }) : ""));
        LAB.light(w, g, lit);
        s.read = m.read;
      };
      // bent: a beaker of water on the board with a pencil leaning in it; the part under water drawn where it is seen.
      function bentSvg(P, lab) {
        const V = LAB.vessel(P, [0, 0, 0.4], [[0, 37], [0.7, 38.8, 1], [2.2, 39.8, 1], [4, 40], [104, 40]], { spout: true });
        const WL = 70, foot = [-30, 9, 4], top = [44, -12, 118], at = (z) => { const f = (z - foot[2]) / (top[2] - foot[2]); return [foot[0] + (top[0] - foot[0]) * f, foot[1] + (top[1] - foot[1]) * f, z]; };
        // Looking in at 46° from the vertical (this view), a point h under the surface is seen at h·cos³α / (n·cos³β), with
        // sin β = sin α / n: about 0.42 h for water (0.75 h looking straight down).
        const al = rad(46), be = Math.asin(Math.sin(al) / 1.333), f = Math.cos(al) ** 3 / (1.333 * Math.cos(be) ** 3);
        const seen = (p) => [p[0], p[1], WL - (WL - p[2]) * f];
        const pencil = (a, b, r = 3.2) => { const dv = b.map((v, i) => v - a[i]), len = Math.hypot(...dv); return S(G.solidOf([[0, r], [len, r]], LAB.A(a, dv.map((v) => v / len)), P, { steps: 6 }), { tone: "hi" }); };
        const tipLen = 12, dTop = top.map((v, i) => v - at(WL)[i]), lt = Math.hypot(...dTop), u = dTop.map((v) => v / lt);
        const above = ISO.tinted(ISO.T.amber, pencil(at(WL), top.map((v, i) => v - u[i] * tipLen))) + ISO.tinted(ISO.T.wood, S(G.solidOf([[0, 3.2], [tipLen - 3, 0.9], [tipLen, 0.3]], LAB.A(top.map((v, i) => v - u[i] * tipLen), u), P, { steps: 6 }), { tone: "hi" }));
        const under = ISO.tinted(ISO.T.amber, pencil(seen(at(foot[2] + 6)), seen(at(WL)))) + ISO.tinted(ISO.T.rubber, pencil(seen(foot), seen(at(foot[2] + 6)), 3.3));
        const real = L(K.pathOf([K.iso(at(WL), P), K.iso(foot, P)]), { tone: "lo", dashed: true, free: true });
        return `<g data-name="block">${V.back()}${V.liquid(WL, "clear")}${real}${under}${V.front()}${above}</g>` +
          (lab ? ISO.word(K.iso([42, 0, WL + 6], P), "seen bent here", "#c0392b", { size: 14, anchor: "start" }) + ISO.word(K.iso([-30, 8, 20], P), "really here (dashed)", "#555", { size: 13, anchor: "end" }) + ISO.word(K.iso([0, 0, 150], P), "light bends as it leaves the water", "#2b6cc4", { size: 14 }) : "");
      }
      g.set = (p) => {
        if (p.k && lim[p.k] && p.k !== s.k) { s.k = p.k; s.i = s.iT = ISO.clamp(p.i !== undefined ? +p.i : s.i, ...lim[s.k]); }
        if (p.i !== undefined) s.iT = ISO.clamp(+p.i, ...lim[s.k]);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { s.i = ISO.follow(s.i, s.iT, dt, 0.5, ISO.still()); draw(); return s.i !== s.iT; };
      g.readout = () => (s.k === "bent" ? "pencil in water · the part under the water looks raised (apparent depth = real depth ÷ 1.33), so the pencil looks bent at the surface" : s.read);
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
