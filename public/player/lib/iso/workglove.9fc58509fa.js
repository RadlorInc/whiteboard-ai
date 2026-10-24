// "workglove cx cy k aim=flat|up lab=0 lit=glove" — a PART (PARTS.md): a yellow household rubber glove (size M, 30 cm
// long), its origin the middle of the glove on the surface it lies on. aim=flat: lying palm up on a surface; aim=up:
// flat against a wall (the plane y = 0), fingers up. Puffed with the air inside it: a flared cuff with a rolled bead
// at its opening, ribs and the size stamp, the palm, four fingers with their knuckle creases and the thumb. The grip
// pattern (raised diamonds) covers the palm and the finger pads, each diamond whole, so the texture stops at the edges.
// Static. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  const T = 1.5;                                            // the glove's thickness lying flat, with the air in it
  const RUB = ISO.tint("#ffe680", ["#d9a400", "#e6b412", "#f0c62a", "#f7d548"], "#7a5a00");
  // the glove in its own plane: u along it (fingers +u, cuff −u), v across (thumb +v); cm, centred on the palm
  const CUFF = { u0: -15, u1: -3.4, w0: 13, w1: 9.6 };      // cuff opening width, wrist width
  const PALM = { u0: -4, u1: 5.2, w: 9.6 };
  const FING = [   // root (u, v), length, width, splay (rad): index to little finger, then the thumb
    { u: 4.2, v: 3.3, l: 7.6, w: 2.1, a: 0.06 },
    { u: 4.6, v: 1.05, l: 8.4, w: 2.15, a: 0.01 },
    { u: 4.4, v: -1.2, l: 7.8, w: 2.1, a: -0.05 },
    { u: 3.7, v: -3.35, l: 6.3, w: 1.9, a: -0.12 },
  ];
  const THUMB = { u: -2, v: 3.6, l: 7.2, w: 2.6, a: 0.95 };
  const rr = (x0, x1, y0, y1, r, n = 4) => {   // a rounded rectangle, counter-clockwise
    const c = [[x1 - r, y1 - r, 0], [x0 + r, y1 - r, 1], [x0 + r, y0 + r, 2], [x1 - r, y0 + r, 3]], pts = [];
    for (const [cx, cy, q] of c) for (let i = 0; i <= n; i++) { const t = ((q + i / n) * Math.PI) / 2; pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    return pts;
  };
  // a finger: a capsule from its root along its splay (in u, v), rounded tip, a squarer root
  const capsule = (f, inset = 0) => {
    const r = f.w / 2 - inset, pts = [], d = [Math.cos(f.a), Math.sin(f.a)], nrm = [-d[1], d[0]], tip = f.l - f.w / 2;
    const at = (s, t) => [f.u + d[0] * s + nrm[0] * t, f.v + d[1] * s + nrm[1] * t];
    for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + (Math.PI * i) / 8; pts.push(at(tip + r * Math.cos(t), r * Math.sin(t))); }
    pts.push(at(inset - 0.6, r), at(-0.9 + inset, r * 0.6), at(-0.9 + inset, -r * 0.6), at(inset - 0.6, -r));
    return { pts, at };
  };
  const inset2 = (pts, k) => { const c = pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]); return pts.map(([x, y]) => [c[0] + (x - c[0]) * k[0], c[1] + (y - c[1]) * (k[1] ?? k[0])]); };
  // a puffed part: the outline at mid height, an inset ring under it and on top, as one convex solid
  function puff(P, map, out, inUnder, inTop, t = T) {
    const n = out.length, V = [...inUnder.map(([u, v]) => map(u, v, 0)), ...out.map(([u, v]) => map(u, v, t * 0.45)), ...inTop.map(([u, v]) => map(u, v, t))];
    const F = [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => 2 * n + i)];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n + j, n + i], [n + i, n + j, 2 * n + j, 2 * n + i]); }
    return ISO.poly(V, F, P, "mid");
  }
  // the grip pattern: whole raised diamonds on a lattice, kept inside a polygon (so none is cut)
  const inside = (pts, [x, y]) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  function diamonds(P, map, poly, step, s, z) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]), d = [];
    for (let u = Math.min(...xs); u <= Math.max(...xs); u += step) for (let v = Math.min(...ys); v <= Math.max(...ys); v += step) {
      for (const [cu, cv] of [[u, v], [u + step / 2, v + step / 2]]) {
        const q = [[cu + s, cv], [cu, cv + s], [cu - s, cv], [cu, cv - s]];
        if (q.every((p) => inside(poly, p))) d.push(K.pathOf(q.map(([a, b]) => K.iso(map(a, b, z), P)), true));
      }
    }
    return d.join("");
  }
  // a line across a convex polygon at u = c (in its own coordinates), ending on the polygon's edges
  function across(poly, c) {
    const hits = [];
    poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; if ((p[0] - c) * (q[0] - c) < 0) hits.push(p[1] + ((q[1] - p[1]) * (c - p[0])) / (q[0] - p[0])); });
    return hits.length >= 2 ? [Math.min(...hits), Math.max(...hits)] : null;
  }

  // the glove's whole outline in (u, v), one closed walk: cuff, the little-finger side of the palm, each finger out to
  // its tip and back (adjacent roots meet at the crotches), the index side, out round the thumb, the wrist, the cuff
  const side = (f, sg, s) => { const d = [Math.cos(f.a), Math.sin(f.a)]; return [f.u + d[0] * s - d[1] * sg * (f.w / 2), f.v + d[1] * s + d[0] * sg * (f.w / 2)]; };
  const tipArc = (f, from, to) => { const r = f.w / 2, tip = f.l - r, d = [Math.cos(f.a), Math.sin(f.a)], out = [];
    for (let i = 1; i < 8; i++) { const t = from + ((to - from) * i) / 8; out.push([f.u + d[0] * (tip + r * Math.cos(t)) - d[1] * r * Math.sin(t), f.v + d[1] * (tip + r * Math.cos(t)) + d[0] * r * Math.sin(t)]); }
    return out; };
  const fingerWalk = (f, s0 = 0, s1 = 0) => { const tip = f.l - f.w / 2; return [side(f, -1, s0), side(f, -1, tip), ...tipArc(f, -Math.PI / 2, Math.PI / 2), side(f, 1, tip), side(f, 1, s1)]; };
  const HW = PALM.w / 2;
  const OUTLINE = (() => {
    const pts = [[CUFF.u0, -CUFF.w0 / 2], [CUFF.u1, -CUFF.w1 / 2], [-1, -HW], [2.4, -HW], [3.2, -HW + 0.25]];
    const fs = [...FING].reverse();   // little to index
    fs.forEach((f, i) => {
      const w = fingerWalk(f);
      if (i > 0) { const prev = pts.pop(); const c = w.shift(); pts.push([(prev[0] + c[0]) / 2, (prev[1] + c[1]) / 2]); }
      pts.push(...w);
    });
    pts.push([3.4, HW - 0.2], [2.6, HW]);
    // the thumb leaves the palm's side where its lower edge crosses it, and comes back where its upper edge does
    const sAt = (sg) => { const d = [Math.cos(THUMB.a), Math.sin(THUMB.a)]; return (HW - (THUMB.v + d[0] * sg * (THUMB.w / 2))) / d[1]; };
    pts.push(...fingerWalk(THUMB, sAt(-1), sAt(1)));
    pts.push([CUFF.u1, CUFF.w1 / 2], [CUFF.u0, CUFF.w0 / 2]);
    return pts;
  })();
  // a flat solid of thickness t from a closed (u, v) outline (concave allowed): seen side walls far to near, shaded by
  // facing in the kit's tones, then the top face and the edges, in the kit's own classes so it lights like kit parts
  function slab(P, map, pts, t) {
    const view = (() => { const d0 = K.depthOf([0, 0, 0], P); return [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0]; })();
    const o = map(0, 0, 0), lin = (du, dv) => map(du, dv, 0).map((x, i) => x - o[i]);
    const { sinA, cosA } = K.cameraOf(P);
    let area = 0; pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; area += x * y2 - x2 * y; });
    const n = pts.length, B = pts.map(([u, v]) => K.iso(map(u, v, 0), P)), Tp = pts.map(([u, v]) => K.iso(map(u, v, t), P)), quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [au, av] = pts[i], [bu, bv] = pts[(i + 1) % n], len = Math.hypot(bu - au, bv - av) || 1, sg = area > 0 ? 1 : -1;
      const nn = lin(((bv - av) / len) * sg, (-(bu - au) / len) * sg);
      vis[i] = nn[0] * view[0] + nn[1] * view[1] + nn[2] * view[2] > 1e-6;
      if (!vis[i]) continue;
      const h = Math.hypot(nn[0], nn[1]) || 1, shade = Math.max(0, Math.min(3, Math.floor((((nn[0] / h) * -sinA + (nn[1] / h) * cosA + 1) / 2) * 4))) || 0;
      quads.push({ i, k: K.depthOf(map((au + bu) / 2, (av + bv) / 2, t / 2), P), d: K.pathOf([B[i], B[(i + 1) % n], Tp[(i + 1) % n], Tp[i]], true), shade });
    }
    quads.sort((a, b) => a.k - b.k);
    // each wall carries its own bottom edge and its silhouette ends, so a wall the top face covers takes them along
    const ink = (i) => { const e = [K.pathOf([B[i], B[(i + 1) % n]])]; if (!vis[(i + n - 1) % n]) e.push(K.pathOf([Tp[i], B[i]])); if (!vis[(i + 1) % n]) e.push(K.pathOf([Tp[(i + 1) % n], B[(i + 1) % n]])); return e.join(""); };
    return `<g class="iso-solid"><path class="iso-fill" d="${K.pathOf(B, true)}${K.pathOf(Tp, true)}"/>${quads.map((q) => `<path class="iso-shade" data-shade="${q.shade}" d="${q.d}" style="stroke:var(--anatomy-shade-${q.shade});stroke-width:.4"/><path class="iso-line iso-edge" data-tone="mid" d="${ink(q.i)}"/>`).join("")}` +
      `<path class="iso-top" d="${K.pathOf(Tp, true)}"/><path class="iso-line iso-edge" data-tone="mid" d="${K.pathOf(Tp, true)}"/></g>`;
  }

  function gloveSvg(P, map) {
    const line = (pts, w = 0.5, c = "#9a7200") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
    const out = [slab(P, map, OUTLINE, T)], top = (u, v) => map(u, v, T + 0.01);
    // the wrist seam where the cuff's flare starts, and ribs across the cuff, each from edge to edge
    const ribs = [];
    for (let u = CUFF.u0 + 2.2; u < CUFF.u0 + 5.4; u += 0.8) { const h = across(OUTLINE.slice(0, 2).concat(OUTLINE.slice(-2)), u); if (h) ribs.push([top(u, h[0]), top(u, h[1])]); }
    ribs.push([top(CUFF.u1, -CUFF.w1 / 2), top(CUFF.u1, CUFF.w1 / 2)]);
    out.push(ribs.map((r) => line(r, 0.55)).join(""));
    // the size stamp on the cuff: a ring with an M, and the maker's lines beside it
    const st = [CUFF.u0 + 8.2, -2.4], ring = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * 2 * Math.PI; return K.iso(top(st[0] + Math.cos(a) * 1.2, st[1] + Math.sin(a) * 1.2), P); });
    const ring2 = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 2 * Math.PI; return K.iso(top(st[0] + Math.cos(a) * 0.7, st[1] + Math.sin(a) * 0.7), P); });
    out.push(`<path d="${K.pathOf(ring, true)}${K.pathOf(ring2, true)}" fill="none" stroke="#9a7200" stroke-width="0.5"/>` + K.lineSvg([0.6, 0, -0.6].map((dv, i) => K.pathOf([K.iso(top(st[0] - 0.6, st[1] + 2.2 + dv), P), K.iso(top(st[0] + 0.6 - i * 0.25, st[1] + 2.2 + dv), P)])).join(""), { tone: "lo", free: true }));
    // the palm: the knuckle line along the finger roots (crotch to crotch), the thumb's crease to the wrist seam,
    // and the grip diamonds, each whole and inside the outline
    const roots = [...FING].reverse().map((f) => [side(f, -1, 0), side(f, 1, 0)]);
    out.push(roots.map(([a, b]) => line([top(...a), top(...b)], 0.5)).join(""));
    const tc = side(THUMB, -1, (HW - (THUMB.v + Math.cos(THUMB.a) * -(THUMB.w / 2))) / Math.sin(THUMB.a));
    out.push(line(Array.from({ length: 9 }, (_, i) => { const f = i / 8; return top(tc[0] + (CUFF.u1 - tc[0]) * f, tc[1] + (0.6 - tc[1]) * f - 1.2 * Math.sin(Math.PI * f)); }), 0.5));
    const palm = rr(PALM.u0 + 0.9, 3.4, -HW + 0.7, HW - 0.7, 1.6), D = [];
    const dia = (poly, step, sz) => { const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      for (let u = Math.min(...xs); u <= Math.max(...xs); u += step) for (let v = Math.min(...ys); v <= Math.max(...ys); v += step) for (const [cu, cv] of [[u, v], [u + step / 2, v + step / 2]]) {
        const q = [[cu + sz, cv], [cu, cv + sz], [cu - sz, cv], [cu, cv - sz]];
        if (q.every((p) => inside(poly, p) && inside(OUTLINE, p))) D.push(K.pathOf(q.map((p) => K.iso(top(...p), P)), true));
      } };
    dia(palm, 0.9, 0.22);
    // fingers and thumb: creases at the knuckles from side to side, and a diamond pad at each tip
    for (const f of [...FING, THUMB]) {
      out.push((f === THUMB ? [0.5] : [0.3, 0.6]).map((k) => line([top(...side(f, -1, f.l * k)), top(...side(f, 1, f.l * k))], 0.5)).join(""));
      const c = { ...f, u: f.u + Math.cos(f.a) * f.l * 0.68, v: f.v + Math.sin(f.a) * f.l * 0.68, l: f.l * 0.3, w: f.w * 0.6 };
      dia(fingerWalk(c), 0.6, 0.15);
    }
    out.push(`<path d="${D.join("")}" fill="#c99a00" stroke="#7a5a00" stroke-width="0.25"/>`);
    // the rolled bead round the cuff's opening, and the white flock lining showing inside it
    const bead = [[CUFF.u0 - 0.5, -CUFF.w0 / 2 - 0.1], [CUFF.u0 + 0.6, -CUFF.w0 / 2 - 0.05], [CUFF.u0 + 0.6, CUFF.w0 / 2 + 0.05], [CUFF.u0 - 0.5, CUFF.w0 / 2 + 0.1]];
    out.push(puff(P, map, bead, inset2(bead, [0.7, 0.97]), inset2(bead, [0.6, 0.96]), T * 1.08));
    out.push(`<path d="${K.pathOf([[-0.15, -0.42], [0.2, -0.42], [0.2, 0.42], [-0.15, 0.42]].map(([a, b]) => K.iso(map(CUFF.u0 - 0.52, b * CUFF.w0, T * 0.5 + a * T * 0.6), P)), true)}" fill="#f6f1e4" stroke="#7a5a00" stroke-width="0.5"/>`);
    return out.join("");
  }

  ISO.add({
    name: "workglove", title: "Rubber glove (part)", compare: null,
    about: "A yellow household rubber glove, 30 cm long: flared cuff with a rolled bead, palm and fingers with a raised diamond grip; lying flat or flat against a wall; a part to place in any scene.",
    line: "workglove cx cy k aim=flat|up lab=0 lit=glove",
    demo: { line: "workglove 480 290 20 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "glove" }, hold: 1.5 }] },
    make([cx = 480, cy = 290, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", up = o.aim === "up";
      // flat: fingers toward −x (away), thumb toward the room, thickness up; up: fingers up, thumb along +x, off the wall
      const map = up ? (u, v, n) => [v, n, u + 1.2] : (u, v, n) => [-(u + 1.2), v, n];   // u = −1.2 is the glove's middle
      const halo = up ? null : { x: -15, y: -7.5, w: 30, d: 15, r: 6 };
      g.innerHTML = (halo ? `<path class="iso-halo" d="${K.haloOf(halo, -0.3, 0.3, P)}"/>` : "") + `<g data-name="glove" style="${RUB}">${gloveSvg(P, map)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso(map(CUFF.u0, -CUFF.w0 / 2, 0), P), "rubber glove", "#444", { size: 13, anchor: "start", dy: 16 });
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => w.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => "rubber glove · size M · 30 cm long · raised diamond grip on the palm and finger pads";
      draw();
      return g;
    },
  });
})();
