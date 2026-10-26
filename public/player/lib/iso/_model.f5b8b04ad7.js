// Shared parts for the engineering cut-away models (bridge, dam, hydro, nuclear, geothermal, tidal, watertreat,
// wastewater, glasshouse, insulation, irrigation, foundation, skyframe). Not a recipe: it only defines window.MODEL.
// Every model is a museum model: a walnut plinth on feet with a brass name plate, and on it a block of ground cut
// open along its front face (the plane y = the block's front), so soil, rock, water, pipes and machines show in
// section on that face while the top and the back stay whole. World units: one unit is about a metre of the model's
// subject unless a recipe says otherwise; z is up, the camera looks from +x +y.
(() => {
  const K = window.K, G = window.G;
  const M = (window.MODEL = {});
  M.S = (p, s) => K.solidSvg(p, s); M.L = (d, s) => K.lineSvg(d, s); M.D = (p, s) => K.dotsSvg(p, s);
  M.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  M.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  M.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const f1 = (v) => v.toFixed(1);

  // ── section materials: [dark side, light side, cut face, ink]
  M.MAT = {
    soil: ["#8a6a45", "#c4a173", "#d2b48a", "#6b4f2e"],
    topsoil: ["#6e5233", "#a2805a", "#b08e66", "#4f3a22"],
    grass: ["#5f8f45", "#9cc77f", "#a9d18c", "#3f6a2a"],
    clay: ["#a8714a", "#d9a679", "#e2b78f", "#7a4a28"],
    sand: ["#c7b07a", "#ece0b4", "#f0e6c2", "#8a7440"],
    gravel: ["#9a948a", "#cdc8be", "#d8d3ca", "#5f5a52"],
    rock: ["#8d939a", "#c3c8ce", "#cdd2d7", "#565c63"],
    hotrock: ["#c86a3e", "#f0a273", "#f5b48a", "#8a3a18"],
    magma: ["#b8331a", "#f0763c", "#f68a4e", "#7a1a0a"],
    water: ["#6fa3d3", "#bcdcf5", "#a9cff0", "#2f6fae"],
    sea: ["#5e95c6", "#a9cdea", "#9cc5ea", "#285f98"],
    murky: ["#8f8a62", "#c9c49a", "#bdb68a", "#5f5a32"],
    concrete: ["#a9a7a0", "#dedcd5", "#e6e4de", "#5f5f5c"],
    steel: ["#8d9096", "#d0d2d6", "#dcdee1", "#3c3f45"],
    brick: ["#9a4a2e", "#d0704a", "#d97a52", "#6a2a18"],
    plaster: ["#cfcac0", "#f4f1ea", "#f7f4ee", "#7a766e"],
    wool: ["#d9b24a", "#f6dc8a", "#f8e39c", "#8a6a14"],
    pink: ["#d98ca0", "#f6c6d2", "#f8d0da", "#a0506a"],
    sludge: ["#5a4632", "#8a7050", "#7a6248", "#3a2a1a"],
  };
  // a section piece: outline in x–z, cut face at y1, extruded back to y0
  M.sec = (P, pts, y0, y1, mat, extra = "") => { const [d, l, f, i] = M.MAT[mat] || mat; return ISO.prismY(P, pts, y0, y1, [d, l], f, i, extra); };
  // a flat rectangle on the cut face (a window, a label band), as world points
  M.rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  M.tintOf = (mat) => { const [d, l, f, i] = M.MAT[mat]; return ISO.tint(f, [d, `color-mix(in srgb,${d} 60%,${l})`, `color-mix(in srgb,${d} 30%,${l})`, l], i); };

  // dots scattered inside a polygon on the cut face (pebbles in gravel, grains in sand): deterministic
  M.grains = (P, pts, y, n, color, r = 0.5, seed = 1) => {
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
    const inside = (x, z) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
    const k = K.cameraOf(P).k, out = [];
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n * 4 && out.length < n; i++) {
      const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0), rr = r * (0.6 + rnd() * 0.8);
      if (!inside(x, z)) continue;
      const p = K.iso([x, y + 0.05, z], P);
      out.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${(rr * k).toFixed(2)}" ry="${(rr * k * 0.8).toFixed(2)}"/>`);
    }
    return `<g fill="${color}" opacity=".8">${out.join("")}</g>`;
  };

  // ── the plinth: walnut base on feet, the brass name plate on the front margin
  const WALNUT = ISO.tint("#c9a27a", ["#6e4a2c", "#7d5636", "#8d6442", "#a07650"], "#3e2814");
  // z: where the plinth's top is (a block of ground deeper than 0 stands on a plinth lowered to its bottom)
  M.plinth = (P, plan, { h = 9, z = 0 } = {}) => {
    const out = [ISO.baseboard(P, plan, { h, feet: 4, tint: WALNUT })];
    const pw = Math.min(90, plan.w * 0.32), plate = { x: plan.x + plan.w / 2 - pw / 2, y: plan.y + plan.d - 15, w: pw, d: 10, r: 1 };
    out.push(ISO.tinted(ISO.T.brass, ISO.plate(P, plate)));
    return z ? `<g transform="${K.translateAlong(P, [0, 0, z])}">${out.join("")}</g>` : out.join("");
  };

  // ── moving water and air: dashes travelling along a polyline of world points
  M.lenOf = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]); return s; };
  M.at = (pts, s) => {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (s <= l || i === pts.length - 1) { const t = l ? Math.min(1, s / l) : 0; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
      s -= l;
    }
    return pts[pts.length - 1];
  };
  // phase: distance travelled; gap: spacing; dash: length; fades in and out at both ends of the run
  M.flow = (P, pts, phase, { gap = 14, dash = 6, color = "#2f6fae", w = 1.6, amount = 1 } = {}) => {
    if (amount < 0.02) return "";
    const len = M.lenOf(pts), k = K.cameraOf(P).k, d = [];
    for (let s = ((phase % gap) + gap) % gap; s < len - 0.5; s += gap) {
      const s1 = Math.min(len, s + dash), a = K.iso(M.at(pts, s), P), b = K.iso(M.at(pts, s1), P);
      const fade = Math.min(1, s / (gap * 0.8), (len - s1) / (gap * 0.8));
      if (fade <= 0.05) continue;
      d.push(`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" opacity="${(fade * amount).toFixed(2)}"/>`);
    }
    return `<g stroke="${color}" stroke-width="${(w * k).toFixed(2)}" stroke-linecap="round" fill="none">${d.join("")}</g>`;
  };
  // an arrow on the cut face: shaft and head as one filled shape, length in world units (forces, heat)
  M.arrow = (P, from, to, { color = "#c0392b", w = 2.4, head = 6 } = {}) => {
    const dx = to[0] - from[0], dz = to[2] - from[2], l = Math.hypot(dx, dz);
    if (l < 0.5) return "";
    const ux = dx / l, uz = dz / l, nx = -uz, nz = ux, hl = Math.min(head, l * 0.6), y = from[1];
    const pt = (s, n) => K.iso([from[0] + ux * s + nx * n, y, from[2] + uz * s + nz * n], P);
    const poly = [pt(0, w / 2), pt(l - hl, w / 2), pt(l - hl, hl * 0.55), pt(l, 0), pt(l - hl, -hl * 0.55), pt(l - hl, -w / 2), pt(0, -w / 2)];
    return `<path d="${K.pathOf(poly, true)}" fill="${color}" stroke="#fdfdfb" stroke-width=".8" stroke-linejoin="round"/>`;
  };
  // a round tube along world points (a pipe seen from outside): ink rim, body, a highlight, and flanges at both ends
  M.pipe = (P, pts, r, { body = "#c9ced4", ink = "#3c3f45", shine = "#eef0f2", flange = true } = {}) => {
    const k = K.cameraOf(P).k, d = K.pathOf(pts.map((p) => K.iso(p, P)));
    let out = `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${f1((2 * r + 0.9) * k)}" stroke-linejoin="round" stroke-linecap="butt"/><path d="${d}" fill="none" stroke="${body}" stroke-width="${f1(2 * r * k)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${shine}" stroke-width="${f1(r * 0.45 * k)}" stroke-linejoin="round" transform="translate(0 ${f1(-r * 0.35 * k)})"/>`;
    if (flange) for (const [a, b] of [[pts[0], pts[1]], [pts[pts.length - 1], pts[pts.length - 2]]]) {
      const u = G.unit3(G.sub3(b, a));
      out += ISO.tinted(ISO.T.steel, M.S(G.disc(0, 1.2, r * 1.45, G.frameAlong(a, u), P, { steps: 20 }), { tone: "mid" }));
    }
    return out;
  };

  // ── props
  M.tree = (P, x, y, z, s = 1) => ISO.tinted(ISO.T.wood, M.S(K.cylinder(x, y, 0.9 * s, z, 5 * s, P, 12), { tone: "mid" })) +
    ISO.tinted(ISO.T.green, M.S(G.lathe([[0, 0], [0, 5.6 * s, 1], [4 * s, 5 * s, 1], [9 * s, 3 * s, 1], [12.5 * s, 0]], M.Z([x, y, z + 4 * s]), P, { steps: 24 }), { tone: "mid" }));
  // a lattice pylon: four legs tapering to a waist, cross arms, insulators; strokes in steel grey
  M.pylon = (P, x, y, z, h, { arms = 2 } = {}) => {
    const k = K.cameraOf(P).k, b = h * 0.16, t = h * 0.05, seg = (a, c) => K.pathOf([K.iso(a, P), K.iso(c, P)]);
    const leg = (sx, sy, zz) => { const w = b + (t - b) * Math.min(1, (zz - z) / (h * 0.8)); return [x + sx * w, y + sy * w, zz]; };
    const d = [], br = [];
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) d.push(seg(leg(sx, sy, z), leg(sx, sy, z + h * 0.8)), seg(leg(sx, sy, z + h * 0.8), [x + sx * t, y + sy * t, z + h]));
    for (let i = 0; i < 5; i++) { const z0 = z + (i * h * 0.8) / 5, z1 = z + ((i + 1) * h * 0.8) / 5; for (const [a, c] of [[[-1, 1], [1, 1]], [[1, -1], [1, 1]]]) br.push(seg(leg(a[0], a[1], z0), leg(c[0], c[1], z1)), seg(leg(c[0], c[1], z0), leg(a[0], a[1], z1))); }
    const armZ = Array.from({ length: arms }, (_, i) => z + h * (0.62 + i * 0.16)), aw = h * 0.3;
    for (const az of armZ) d.push(seg([x - aw, y, az], [x + aw, y, az]));
    const ins = armZ.flatMap((az) => [[x - aw + 1, y, az], [x + aw - 1, y, az]]);
    return `<path d="${br.join("")}" fill="none" stroke="#7a8088" stroke-width="${f1(0.45 * k)}"/><path d="${d.join("")}" fill="none" stroke="#4a5058" stroke-width="${f1(0.8 * k)}" stroke-linecap="round"/>` +
      ins.map((p) => `<path d="${seg(p, [p[0], p[1], p[2] - 2.4])}" stroke="#2f6fae" stroke-width="${f1(0.9 * k)}" stroke-linecap="round"/>`).join("");
  };
  // a house: box walls, a pitched roof (gable along x), door and windows on the front (+y) face
  M.house = (P, x, y, z, w, d, h, { roof = "#c0533a", wall = "#f4e6c8" } = {}) => {
    const WALL = ISO.tint(wall, ["#c9b48a", "#d6c39b", "#e2d1ad", "#ecdcbd"], "#7a6440"), ROOF = ISO.tint(roof, ["#7a2a18", "#8f3420", "#a8412a", "#b84a30"], "#5a1a0a");
    const out = [ISO.tinted(WALL, ISO.wbox(P, [x - w / 2, x + w / 2], [y - d / 2, y + d / 2], [z, z + h], "mid"))];
    const e = 1.2, rh = h * 0.55;
    out.push(ISO.tinted(ROOF, ISO.poly([[x - w / 2 - e, y - d / 2 - e, z + h], [x + w / 2 + e, y - d / 2 - e, z + h], [x + w / 2 + e, y + d / 2 + e, z + h], [x - w / 2 - e, y + d / 2 + e, z + h], [x - w / 2 - e, y, z + h + rh], [x + w / 2 + e, y, z + h + rh]], [[0, 1, 5, 4], [3, 2, 5, 4], [0, 1, 2, 3], [0, 3, 4], [1, 2, 5]], P, "mid")));
    const fy = y + d / 2 + 0.05, win = (x0, x1, z0, z1, fill) => `<path d="${K.pathOf([[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]].map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="#4a3a20" stroke-width=".7"/>`;
    out.push(win(x - w * 0.08, x + w * 0.08, z, z + h * 0.62, "#8a6a45"), win(x - w * 0.4, x - w * 0.2, z + h * 0.4, z + h * 0.78, "#cfe6f6"), win(x + w * 0.2, x + w * 0.4, z + h * 0.4, z + h * 0.78, "#cfe6f6"));
    return out.join("");
  };
  // spinning things on a face: a group in the plane y = y0 whose 2D artwork (x right, y down) turns about (ox, oz)
  M.onFace = (P, o, scale, svg) => `<g transform="${ISO.faceMatrix(P, o, scale)}">${svg}</g>`;
  // a turbine runner seen in section (2D, radius r, n blades), drawn about the origin
  M.runner = (r, n = 9, { fill = "#c9ced4", ink = "#3c3f45" } = {}) => {
    const blades = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), p = (rr, da) => `${f1(Math.cos(a + da) * rr)} ${f1(Math.sin(a + da) * rr)}`;
      return `M${p(r * 0.3, 0)} Q${p(r * 0.75, 0.25)} ${p(r, 0.62)} L${p(r * 0.96, 0.78)} Q${p(r * 0.68, 0.42)} ${p(r * 0.3, 0.3)} Z`;
    }).join("");
    return `<circle r="${r}" fill="#e4e8ec" stroke="${ink}" stroke-width=".25"/><path d="${blades}" fill="${fill}" stroke="${ink}" stroke-width=".22" stroke-linejoin="round"/><circle r="${f1(r * 0.3)}" fill="#9aa1a9" stroke="${ink}" stroke-width=".25"/><circle r="${f1(r * 0.1)}" fill="#3c3f45"/>`;
  };
  // the standard live text for a part name (scripts circle parts by data-name)
  M.named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  M.light = (g, w, lit) => { const parts = [...g.querySelectorAll("[data-name]")]; w.light(parts, parts.filter((p) => lit.split("|").includes(p.dataset.name))); };
  M.label = (P, at, text, color = "#444", o = {}) => ISO.word(K.iso(at, P), text, color, { size: 13, ...o });
})();
