// Shared lab apparatus for the chemistry recipes (glassware, stands, clamps, burners, liquids). Not a recipe: it only
// defines window.LAB, which the chemistry recipe files call at make time. World units are millimetres, z up.
(() => {
  const K = window.K, G = window.G;
  const S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const LAB = (window.LAB = {});
  LAB.S = S; LAB.L = L; LAB.D = D;
  LAB.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  LAB.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  LAB.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  LAB.A = (o, a) => G.frameAlong(o, a);

  // ── colours: the app's liquid palette; a tint (kit tokens) for a liquid solid, and its surface ink
  // a colour from a script may be anything: a palette name, #rgb, #rrggbb, or junk (then the clear-water colour)
  const norm = (h) => { h = String(h ?? ""); if (/^#[0-9a-f]{6}$/i.test(h)) return h; if (/^#[0-9a-f]{3}$/i.test(h)) return "#" + [...h.slice(1)].map((c) => c + c).join(""); return null; };
  const hex = (h) => { const n = norm(h) || norm(LAB.LQ?.[h]) || "#d3eaf8"; return [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  LAB.mix = mix;
  LAB.LQ = { blue: "#8cc4ef", green: "#a6d872", red: "#f0806e", orange: "#f6b34e", yellow: "#ffe066", purple: "#b88ade", pink: "#f6a8c8", clear: "#d3eaf8", brown: "#b98a5a", white: "#f4f4f0", colourless: "#dcecf6" };
  LAB.LI = { blue: "#2f6fae", green: "#3f7f25", red: "#a8382a", orange: "#b0701a", yellow: "#a88a10", purple: "#6a3d9a", pink: "#b0507a", clear: "#6f9cc0", brown: "#6e4a28", white: "#8a8a84", colourless: "#7fa6c4" };
  const tints = {};
  LAB.tintOf = (base, ink) => {
    const key = base + ink;
    if (!tints[key]) tints[key] = ISO.tint(mix(base, "#ffffff", 0.35), [mix(base, "#000000", 0.12), mix(base, "#000000", 0.05), base, mix(base, "#ffffff", 0.18)], ink);
    return tints[key];
  };
  LAB.liq = (c) => LAB.tintOf(LAB.col(c), LAB.ink(c));
  // a colour part-way from one liquid colour to another (indicator changes, mixing)
  LAB.blend = (c0, c1, t) => mix(LAB.col(c0), LAB.col(c1), ISO.clamp(t, 0, 1));
  LAB.ink = (c) => LAB.LI[c] || mix(LAB.col(c), "#000000", 0.5);
  LAB.col = (c) => LAB.LQ[c] || norm(c) || LAB.LQ.clear;
  LAB.GLASS = "#5d7f96";

  // ── glassware turned on a vertical axis at o. outer = meridian [[s, r, smooth?], …] from the base (s = 0) to the rim.
  // back(): the far wall (a pale shaded glass body). front(): the near outline, the rim and a highlight streak.
  // liquid(level, c): a tinted volume of revolution inside, wall `wall` in from the outer profile, up to `level` (mm).
  LAB.vessel = (P, o, outer, { wall = 1.2, base = 2, spout = false, rim = true, axis = null } = {}) => {
    const F = axis ? LAB.A(o, axis) : LAB.Z(o), AX = F.a, H = outer[outer.length - 1][0], rTop = outer[outer.length - 1][1];
    const merid = [[0, 0], ...outer];
    const rAt = (s) => {
      for (let i = 1; i < outer.length; i++) {
        const [s0, r0] = outer[i - 1], [s1, r1] = outer[i];
        if (s <= s1 + 1e-9) return s1 === s0 ? r1 : r0 + (r1 - r0) * ((s - s0) / (s1 - s0));
      }
      return rTop;
    };
    const facing = G.angleToward(F, G.viewOf(P));
    // the true silhouette of an upright turned body (necks stay necks): side edges at ± r·scale, the bottom's front arc
    // and the rim's back arc
    const kS = G.scaleOf(P), ctr = (s) => K.iso([o[0] + AX[0] * s, o[1] + AX[1] * s, o[2] + AX[2] * s], P);
    const c0 = ctr(0), c1 = ctr(10), dl = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) || 1, dS = [(c1[0] - c0[0]) / dl, (c1[1] - c0[1]) / dl], nS = [-dS[1], dS[0]];
    const sil = (() => {
      const ss = [];
      for (let i = 0; i < outer.length; i++) { ss.push(outer[i][0]); if (i < outer.length - 1) { const n = Math.ceil((outer[i + 1][0] - outer[i][0]) / 2); for (let k = 1; k < n; k++) ss.push(outer[i][0] + ((outer[i + 1][0] - outer[i][0]) * k) / n); } }
      const side = (sg) => ss.map((s) => { const c = ctr(s), r = rAt(s) * kS * sg; return [c[0] + nS[0] * r, c[1] + nS[1] * r]; });
      // a ring's ellipse split at its extremes across the axis; the base keeps the half away from the body, the rim too
      const halves = (s, r) => {
        const pts = []; for (let i = 0; i < 64; i++) pts.push(K.iso(G.pointOf(F, s, r, (i / 64) * Math.PI * 2), P));
        const dot = (p) => p[0] * nS[0] + p[1] * nS[1];
        let iMax = 0, iMin = 0; pts.forEach((p, i) => { if (dot(p) > dot(pts[iMax])) iMax = i; if (dot(p) < dot(pts[iMin])) iMin = i; });
        const walk = (i, j) => { const out = []; for (let k = i; ; k = (k + 1) % 64) { out.push(pts[k]); if (k === j) break; } return out; };
        const A = walk(iMax, iMin), B = walk(iMin, iMax), along = (q) => q.reduce((t, p) => t + p[0] * dS[0] + p[1] * dS[1], 0) / q.length;
        return along(A) < along(B) ? [A, B] : [B, A];   // [away from +axis, toward +axis]
      };
      const plusFirst = (q) => { const d = (p) => p[0] * nS[0] + p[1] * nS[1]; return d(q[0]) > d(q[q.length - 1]) ? q : q.slice().reverse(); };
      const bottom = plusFirst(halves(outer[0][0], Math.max(0.05, outer[0][1]))[0]).reverse();   // −n side → +n side
      const top = plusFirst(halves(H, rTop)[1]);                                                   // +n side → −n side
      return K.pathOf([...bottom, ...side(1), ...top, ...side(-1).reverse()], true);
    })();
    // cumulative millilitres every 0.5 mm up the inside, built once
    let tab = null;
    const table = () => { if (tab) return tab; tab = [0]; for (let z = base; z < H; z += 0.5) { const r = rAt(z + 0.25) - wall; tab.push(tab[tab.length - 1] + (Math.PI * r * r * 0.5) / 1000); } return tab; };
    const v = {
      F, H, rTop, rAt, sil,
      back: () => {
        // the far wall: the silhouette filled with a pale glass gradient (cheap enough to rebuild every frame)
        const out = [`<defs><linearGradient id="glassbk" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#c9dde9"/><stop offset=".3" stop-color="#f4f9fc"/><stop offset=".75" stop-color="#e2eef5"/><stop offset="1" stop-color="#bcd3e2"/></linearGradient></defs><path d="${sil}" fill="url(#glassbk)" fill-opacity=".7"/>`];
        // the inside of the far wall seen through the mouth
        out.push(`<path d="${G.arcOf(F, H, rTop - wall, P, { inward: true })}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.7" opacity=".7"/>`);
        return out.join("");
      },
      liquid: (level, c, { opacity = 0.55, meniscus = true, from = base } = {}) => {
        if (level <= from + 0.2) return "";
        // a cheap volume: points on the inner surface below the level plane (horizontal, through the axis at s = level),
        // hulled and shaded across by a gradient, with the flat surface as a lighter sheet
        const zl = o[2] + AX[2] * level, sMax = AX[2] > 0.999 ? level : H - 0.5, pts = [], surf = [], NA = AX[2] > 0.999 ? 32 : 24;
        const rings = [];
        if (AX[2] > 0.999) { rings.push(from); for (const [s] of outer) if (s > from && s < sMax) rings.push(s); }   // upright: straight runs need only their ends
        else { const rM = Math.max(...outer.map((q) => q[1])), cut = AX[2] > 0.05 ? Math.min(sMax, (zl - o[2] + rM * Math.hypot(AX[0], AX[1])) / AX[2] + 3) : sMax; for (let s = from; s < cut; s += 5) rings.push(s); rings.push(cut); }
        if (AX[2] > 0.999) rings.push(sMax);
        const zOf = (s, a) => G.pointOf(F, s, Math.max(0.4, rAt(s) - wall), a);
        for (let k = 0; k < NA; k++) {
          const a = (k / NA) * Math.PI * 2;
          let prev = null;
          for (const s of rings) {
            const p = zOf(s, a);
            if (p[2] <= zl + 1e-6) pts.push(K.iso(p, P));
            if (prev && (prev[2] <= zl) !== (p[2] <= zl)) { const t = (zl - prev[2]) / (p[2] - prev[2]), q = prev.map((v, i) => v + (p[i] - v) * t); pts.push(K.iso(q, P)); surf.push(q); }
            prev = p;
          }
          if (prev && prev[2] <= zl && AX[2] > 0.999) surf.push(prev);
        }
        if (pts.length < 3) return "";
        const col = LAB.col(c), ink = LAB.ink(c), id = "lq" + col.slice(1);
        const sd = surf.length > 2 ? K.pathOf(ISO.hullOf(surf.map((q) => K.iso(q, P))), true) : "";
        const out = [`<defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${mix(col, "#000000", 0.16)}"/><stop offset=".32" stop-color="${mix(col, "#ffffff", 0.22)}"/><stop offset=".7" stop-color="${col}"/><stop offset="1" stop-color="${mix(col, "#000000", 0.2)}"/></linearGradient></defs>`];
        out.push(`<g opacity="${opacity}"><path d="${K.pathOf(ISO.hullOf(pts), true)}" fill="url(#${id})"/>${sd ? `<path d="${sd}" fill="${mix(col, "#ffffff", 0.45)}"/>` : ""}</g>`);
        if (rAt(from) - wall > 2) out.push(`<path d="${G.arcOf(F, from, Math.max(0.4, rAt(from) - wall), P)}" fill="none" stroke="${ink}" stroke-width="0.6" opacity=".45"/>`);
        if (meniscus && sd) out.push(`<path d="${sd}" fill="none" stroke="${ink}" stroke-width="0.9" opacity=".8"/>`);
        return out.join("");
      },
      front: ({ shine = true } = {}) => {
        const out = [`<path d="${sil}" fill="none" stroke="${LAB.GLASS}" stroke-width="1.1" stroke-linejoin="round"/>`];
        if (rim) out.push(`<path d="${G.circleOf(F, H, rTop, P)}" fill="none" stroke="${LAB.GLASS}" stroke-width="1.1"/>`, `<path d="${G.arcOf(F, H - 1.6, rTop + 0.15, P)}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.6" opacity=".7"/>`);
        if (shine) {
          const a = facing + 1.05, pts = [];
          for (let s = H * 0.14; s <= H * 0.8; s += H / 30) pts.push(K.iso(G.pointOf(F, s, rAt(s) + 0.1, a), P));
          out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`);
        }
        if (spout) out.push(LAB.spout(P, F, H, rTop, facing + Math.PI * 0.62));
        return out.join("");
      },
      // graduations printed on the near wall: a rule up the glass with ticks hanging from it
      scale: (s0, s1, step, every, { side = 0.5, tone = "mid", len = [2.4, 4.4] } = {}) => {
        const a = facing + side, rule = [], minor = [], major = [];
        for (let s = s0; s <= s1 + 1e-6; s += step / 4) rule.push(K.iso(G.pointOf(F, s, rAt(s) + 0.15, a), P));
        let i = 0;
        for (let s = s0; s <= s1 + 1e-6; s += step, i++) {
          const r = rAt(s) + 0.15, big = i % every === 0, n = big ? len[1] : len[0], da = n / r;
          const arc = [0, 0.5, 1].map((k) => K.iso(G.pointOf(F, s, r, a - da * k), P));
          (big ? major : minor).push(K.pathOf(arc));
        }
        return L(K.pathOf(rule), { tone }) + L(minor.join(""), { tone: "lo", free: "end" }) + L(major.join(""), { tone, free: "end" });
      },
      // a point on the near surface at height s, turned `side` radians from the view direction
      // millilitres held up to height s (inside the wall, above the glass base), and the height that holds ml
      vol: (s) => { const t = table(), i = Math.min(t.length - 2, Math.max(0, Math.floor((s - base) / 0.5))); if (s <= base) return 0; const f = ISO.clamp((s - base) / 0.5 - i, 0, 1); return t[i] + (t[i + 1] - t[i]) * f; },
      levelFor: (ml) => { const t = table(); let lo = 0, hi = t.length - 1; if (ml <= 0) return base; while (hi - lo > 1) { const m = (lo + hi) >> 1; t[m] < ml ? (lo = m) : (hi = m); } const f = (ml - t[lo]) / ((t[hi] - t[lo]) || 1); return base + (lo + ISO.clamp(f, 0, 1)) * 0.5; },
      at: (s, side = 0.5, out = 0) => G.pointOf(F, s, rAt(s) + out, facing + side),
      facing,
    };
    return v;
  };
  // A pouring lip: a small pulled-out wedge of glass on the rim at angle a.
  LAB.spout = (P, F, H, r, a) => {
    const pts = [[-0.32, 0, 0], [-0.16, 1.2, 0.8], [0, 3.2, 1.6], [0.16, 1.2, 0.8], [0.32, 0, 0]].map(([da, dr, dz]) => K.iso(G.pointOf(F, H + dz, r + dr, a + da), P));
    return `<path d="${K.pathOf(pts)}" fill="#eef6fb" stroke="${LAB.GLASS}" stroke-width="1" stroke-linejoin="round"/>`;
  };

  // ── stand: a cast base plate with a rod screwed in at its back
  LAB.standBase = (P, plan, rod, { tint = "" } = {}) => {
    const out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, 8, P)}"/>`];
    const feet = K.corners(plan, 6).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    for (const [x, y] of feet) out.push(S(K.cylinder(x, y, 3.6, 0, 1.6, P, 18), { tone: "lo" }));
    out.push(S(K.slabOf(plan, 1.6, 6, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(plan, 4.6, P, 4), { tone: "faint" }) }));
    out.push(L(K.planOutline(K.insetPlan(plan, 3.5), 7.6, P, 4), { tone: "faint" }));
    // the rod's boss on the plate, with its lock nut
    out.push(S(K.cylinder(rod[0], rod[1], 8, 7.6, 3, P, 32, 0.4), { tone: "mid" }), S(K.cylinder(rod[0], rod[1], 6, 10.6, 3.5, P, 6), { tone: "mid" }));
    return ISO.tinted(tint, out.join(""));
  };
  LAB.rod = (P, rod, z0, z1, r = 3.4) => S(K.cylinder(rod[0], rod[1], r, z0, z1 - z0, P, 24), { tone: "mid", crease: "none", inner: L(K.sideArc(rod[0], rod[1], r, z1 - 0.01, P, 16), { tone: "lo" }) }) + S(K.cylinder(rod[0], rod[1], r + 0.2, z1, 1.2, P, 24, 0.3), { tone: "mid" });
  // A boss head on the rod at height z: a block with the rod hole and a thumb screw on its far side.
  LAB.boss = (P, rod, z, toward = [1, 0]) => {
    const [x, y] = rod, h = 13, s = 7.5, out = [];
    // thumb screw on the side away from the clamp arm (drawn first: it is usually behind)
    const back = [x - toward[0] * (s + 4), y - toward[1] * (s + 4)];
    out.push(S(G.disc(-4, 0, 1.6, LAB.A([x - toward[0] * s, y - toward[1] * s, z + h / 2], [-toward[0], -toward[1], 0]), P), { tone: "mid" }));
    out.push(S(G.disc(0, 3, 4, LAB.A([back[0] + toward[0] * 0, back[1] + toward[1] * 0, z + h / 2], [-toward[0], -toward[1], 0]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [x - s, x + s], [y - s, y + s], [z, z + h], "mid"));
    out.push(L(K.ring(x, y, 3.6, z + h, P, 16), { tone: "lo" }));
    return out.join("");
  };
  // A clamp arm from the boss along `dir` (unit floor vector) for `reach`, ending in two cork-lined jaws round a
  // vertical object of radius `r` centred at the arm's end. Returns { back, front } so the object goes between.
  LAB.clamp = (P, rod, z, dir, reach, r, { jawH = 10 } = {}) => {
    const [x, y] = rod, n = [-dir[1], dir[0]], end = [x + dir[0] * reach, y + dir[1] * reach], zc = z + 6.5;
    const arm = S(G.disc(7.5, reach - r - 6, 2.2, LAB.A([x, y, zc], [dir[0], dir[1], 0]), P), { tone: "mid" });
    const jaw = (side) => {
      const c = [end[0] + n[0] * side * (r + 2), end[1] + n[1] * side * (r + 2)];
      const at = (u, w, zz) => [c[0] + dir[0] * u + n[0] * w, c[1] + dir[1] * u + n[1] * w, zz];
      return ISO.box(at, P, [-r - 4, r + 2], [-1.6 * side, 1.6 * side].sort((a, b) => a - b), [zc - jawH / 2, zc + jawH / 2], "mid") +
        ISO.tinted(ISO.T.wood, ISO.box(at, P, [-r * 0.7, r * 0.7], side > 0 ? [-2.6, -1.6] : [1.6, 2.6], [zc - jawH / 2 + 1, zc + jawH / 2 - 1], "mid"));
    };
    // the yoke joining the jaws behind the object, and a wing screw across the jaws' front
    const yokeAt = (u, w, zz) => [end[0] + dir[0] * u + n[0] * w, end[1] + dir[1] * u + n[1] * w, zz];
    const yoke = ISO.box(yokeAt, P, [-r - 6, -r - 3], [-(r + 3.6), r + 3.6], [zc - 2.5, zc + 2.5], "mid");
    const parts = [{ k: K.depthOf([...yokeAt(-r - 4, 0, zc)], P), svg: arm + yoke }, { k: K.depthOf([end[0] + n[0] * (r + 2), end[1] + n[1] * (r + 2), zc], P), svg: jaw(1) }, { k: K.depthOf([end[0] - n[0] * (r + 2), end[1] - n[1] * (r + 2), zc], P), svg: jaw(-1) }];
    const objK = K.depthOf([end[0], end[1], zc], P);
    parts.sort((a, b) => a.k - b.k);
    return { back: parts.filter((p) => p.k <= objK).map((p) => p.svg).join(""), front: parts.filter((p) => p.k > objK).map((p) => p.svg).join("") };
  };
  // A ring clamp (retort ring) on an arm: a flat steel ring of radius r round (cx, cy) at height z.
  LAB.ringClamp = (P, rod, z, centre, r) => {
    const dx = centre[0] - rod[0], dy = centre[1] - rod[1], len = Math.hypot(dx, dy), dir = [dx / len, dy / len];
    const arm = S(G.disc(7.5, len - r, 1.8, LAB.A([rod[0], rod[1], z + 1.2], [dir[0], dir[1], 0]), P), { tone: "mid" });
    // the ring itself: a round steel bar, its far half drawn before what it holds and its near half after
    const F = LAB.Z([centre[0], centre[1], z + 1.2]), w = G.scaleOf(P) * 2.4;
    const bar = (d) => `<path d="${d}" fill="none" stroke="#5a6068" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#c9ced3" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
    return { back: arm + bar(G.arcOf(F, 0, r + 1.1, P, { inward: true, trim: 0 })), front: bar(G.arcOf(F, 0, r + 1.1, P, { trim: 0 })) };
  };
  // ── a flame on a vertical axis: luminous (yellow, wavy, tall) to roaring (blue with a pale inner cone), as world
  // profiles projected each frame. air = 0 (collar shut) … 1 (open). size scales it; t flickers it.
  LAB.flameDefs = (id) => `<defs><linearGradient id="${id}y" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6d8fe0" stop-opacity=".7"/><stop offset=".18" stop-color="#ffd257" stop-opacity=".95"/><stop offset=".7" stop-color="#ffb02e" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a1c" stop-opacity=".15"/></linearGradient>` +
    `<linearGradient id="${id}b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3f6fe6" stop-opacity=".95"/><stop offset=".6" stop-color="#6f8ff2" stop-opacity=".6"/><stop offset="1" stop-color="#9fb4ff" stop-opacity=".05"/></linearGradient>` +
    `<linearGradient id="${id}c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b8f0ff" stop-opacity=".95"/><stop offset="1" stop-color="#5fd0f0" stop-opacity=".7"/></linearGradient></defs>`;
  LAB.flame = (P, o, air, size, t, id) => {
    const sc = K.screenRise(1, P), [x0, y0] = K.iso(o, P), out = [];
    const shape = (h, w, wob, phase) => {
      const left = [], right = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18, r = w * Math.sin(Math.PI * Math.pow(u, 0.55)) * (1 - 0.25 * u) * (u > 0.97 ? 0.3 : 1);
        const sway = wob * Math.sin(phase + u * 5.5 + t * 9) * u * u;
        left.push([x0 + (sway - r) * sc, y0 - u * h * sc]); right.push([x0 + (sway + r) * sc, y0 - u * h * sc]);
      }
      return K.pathOf([...left, ...right.reverse()], true);
    };
    const yel = 1 - air, fl = 1 + 0.06 * Math.sin(t * 17) + 0.04 * Math.sin(t * 29);
    if (yel > 0.02) out.push(`<path d="${shape(size * (1.2 + 0.9 * yel) * fl, size * 0.2, size * 0.09 * yel, 0)}" fill="url(#${id}y)" opacity="${Math.min(1, yel * 1.6).toFixed(2)}"/>`);
    if (air > 0.02) {
      out.push(`<path d="${shape(size * (1.0 + 0.25 * air) * fl, size * 0.17, size * 0.015, 1)}" fill="url(#${id}b)" opacity="${Math.min(1, air * 1.4).toFixed(2)}"/>`);
      out.push(`<path d="${shape(size * 0.42 * fl, size * 0.1, 0, 2)}" fill="url(#${id}c)" opacity="${air.toFixed(2)}"/>`);
    }
    return out.join("");
  };

  // ── a bunsen burner standing at (x, y): heavy base, gas tap on a side inlet, barrel with an air-hole collar.
  // Returns the burner and the flame origin. collar: 0 shut … 1 open (the hole in the collar lines up with the barrel's).
  LAB.bunsen = (P, [x, y], collar, { h = 92 } = {}) => {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: x - 26, y: y - 26, w: 52, d: 52, r: 26 }, 0, 6, P)}"/>`];
    out.push(S(K.cylinder(x, y, 26, 0, 4, P, 56, 0.6), { tone: "mid", inner: L(K.sideArc(x, y, 26, 2, P, 40), { tone: "faint" }) }));
    out.push(S(G.solidOf([[4, 24], [6, 22, 1], [9, 14, 1], [12, 10]], LAB.Z([x, y, 0]), P), { tone: "mid" }));
    // gas inlet: a ribbed hose nozzle off the bottom of the barrel, toward -y (away from view at az ~ 50)
    const Fi = LAB.A([x, y, 18], [-0.5, 0.86, 0].map((v) => v / Math.hypot(-0.5, 0.86)));
    out.push(S(G.disc(6, 16, 3.2, Fi, P), { tone: "mid" }), S(G.solidOf([[16, 3.6], [19, 3.6], [19, 3], [22, 3.4], [22, 2.8], [25, 3.2], [25, 2.5], [30, 2.5]], Fi, P), { tone: "mid" }));
    out.push(S(K.cylinder(x, y, 7, 12, 10, P, 32, 0.4), { tone: "mid" }));
    // barrel and the collar with its air hole
    out.push(S(K.cylinder(x, y, 5.2, 22, h - 22, P, 32), { tone: "hi", crease: "none", inner: L(K.sideArc(x, y, 5.2, h - 6, P, 24), { tone: "faint" }) }));
    const Fz = LAB.Z([x, y, 0]), face = G.angleToward(Fz, G.viewOf(P));
    out.push(S(K.cylinder(x, y, 6.4, 24, 12, P, 32, 0.4), { tone: "mid", inner: L(K.knurl(x, y, 6.4, 32, 36, 30, P, 0.2), { tone: "lo" }) }));
    out.push(S(K.cylinder(x, y, 5.6, h - 1.6, 1.6, P, 32, 0.3), { tone: "mid" }), `<path d="${K.pathOf(K.circleRing(x, y, 3.8, 24).map(([a, b]) => K.iso([a, b, h], P)), true)}" fill="#2a2e33"/>`);
    // gas tap on the base, with a lever
    out.push(S(K.cylinder(x + 15, y + 12, 3, 4, 6, P, 16), { tone: "mid" }));
    // the collar's air hole and lever, redrawn as it turns
    const collarSvg = (collar) => {
      const out = [];
        // the hole: a window in the collar; its opening is the overlap of the collar hole and the barrel hole
        const open = 0.15 + 0.85 * collar, a0 = face - 0.45 * open, a1 = face + 0.45 * open, hole = [];
        for (let i = 0; i <= 8; i++) hole.push(K.iso(G.pointOf(Fz, 26.5, 6.45, a0 + ((a1 - a0) * i) / 8), P));
        for (let i = 8; i >= 0; i--) hole.push(K.iso(G.pointOf(Fz, 30.5, 6.45, a0 + ((a1 - a0) * i) / 8), P));
        out.push(`<path d="${K.pathOf(hole, true)}" fill="#1f2328" stroke="#3a3f46" stroke-width="0.6"/>`);
        // the collar's lever
        const la = face + 1.25 - 1.0 * collar;
        out.push(S(G.disc(6.4, 12, 1.1, LAB.A([x, y, 30], [Math.cos(la) , Math.sin(la), 0].map((v, i) => i === 2 ? 0 : v)), P), { tone: "mid" }));
        return out.join("");
      };
    return { svg: out.join(""), collar: collarSvg, top: [x, y, h] };
  };

  // ── a tripod with a gauze mat (for heating over a burner): three legs and a ring at height z
  LAB.tripod = (P, [x, y], z, r = 34) => {
    const back = [], front = [], Fz = LAB.Z([x, y, 0]), view = G.angleToward(Fz, G.viewOf(P));
    [0, 1, 2].forEach((i) => {
      const a = view + Math.PI + (i * Math.PI * 2) / 3, top = G.pointOf(Fz, z - 1.5, r - 2, a), foot = G.pointOf(Fz, 0, r + 8, a);
      const d = [foot[0] - top[0], foot[1] - top[1], foot[2] - top[2]], len = Math.hypot(...d);
      const svg = S(G.disc(0, len, 1.6, LAB.A(top, d.map((v) => v / len)), P), { tone: "mid" });
      (Math.cos(a - view) > 0.2 ? front : back).push(svg);
    });
    const ring = S(G.ringBand(z - 3, z, r - 3, r, Fz, P), { tone: "mid" });
    const gauze = [S(K.slabOf({ x: x - r - 4, y: y - r - 4, w: 2 * r + 8, d: 2 * r + 8, r: 2 }, z, 0.8, P, 2), { tone: "lo" })];
    gauze.push(`<path d="${K.pathOf(K.circleRing(x, y, r * 0.55, 40).map(([a, b]) => K.iso([a, b, z + 0.81], P)), true)}" fill="#e9e4dc" stroke="#9a9488" stroke-width="0.6"/>`);
    const grid = [];
    for (let k = -r; k <= r; k += 6) grid.push(K.lineOnTop([x + k, y - r - 3.2], [x + k, y + r + 3.2], z + 0.8, P), K.lineOnTop([x - r - 3.2, y + k], [x + r + 3.2, y + k], z + 0.8, P));
    gauze.push(L(grid.join(""), { tone: "faint" }));
    return { back: back.join("") + ring, front: front.join(""), gauze: gauze.join("") };
  };

  // ── small things
  LAB.drop = (P, at, r, c) => {
    const [x, y] = K.iso(at, P), s = K.screenRise(1, P) * r;
    return `<path d="M${x} ${y - s * 1.9} C${x - s * 0.2} ${y - s * 1.2} ${x - s} ${y - s * 0.6} ${x - s} ${y} A${s} ${s} 0 0 0 ${x + s} ${y} C${x + s} ${y - s * 0.6} ${x + s * 0.2} ${y - s * 1.2} ${x} ${y - s * 1.9} Z" fill="${LAB.col(c)}" stroke="${LAB.ink(c)}" stroke-width="0.7"/>`;
  };
  LAB.bubble = (P, at, r) => {
    const [x, y] = K.iso(at, P), s = Math.max(0.6, K.screenRise(1, P) * r);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="#ffffff" fill-opacity=".55" stroke="#4d7590" stroke-width="0.6"/>`;
  };
  // A rubber stopper (bung) in a neck of radius r at height z, with up to two holes for tubes.
  LAB.bung = (P, [x, y], z, r, h = 9) => ISO.tinted(ISO.T.rubber, S(G.solidOf([[0, r * 0.92], [h, r * 1.12]], LAB.Z([x, y, z]), P), { tone: "hi" }));
  // A thermometer: a glass stem with a red (alcohol) thread to height `level` (mm along it), bulb at the bottom.
  // axis may lean; scale: [s0, s1, step] for printed ticks.
  LAB.thermometer = (P, foot, axis, len, level, { r = 2.4, ticks = null, thread = true, body = true } = {}) => {
    const F = LAB.A(foot, axis), out = [];
    if (body) {
    out.push(`<g style="${ISO.T.glass}">${S(G.solidOf([[0, 0.1], [0.8, r * 0.95, 1], [2.6, r * 1.15, 1], [5, r * 0.9, 1], [7, r * 0.75], [len - 2, r * 0.75], [len - 0.5, r * 0.6, 1], [len, 0.1]], F, P), { tone: "lo" })}</g>`);
    out.push(`<g style="${ISO.T.red}">${S(G.solidOf([[0.6, 0.2], [1.2, r * 0.75, 1], [2.6, r * 0.9, 1], [4.4, r * 0.62, 1], [5.6, 0.45]], F, P), { tone: "hi", crease: "none" })}</g>`);
    }
    if (thread) out.push(LAB.thread(P, foot, axis, level, r));
    if (ticks) {
      const [s0, s1, step, every] = ticks, face = G.angleToward(F, G.viewOf(P)) + 0.55, minor = [], major = [], rule = [];
      for (let s = s0; s <= s1 + 1e-6; s += step / 2) rule.push(K.iso(G.pointOf(F, s, r * 0.76, face), P));
      let i = 0;
      for (let s = s0; s <= s1 + 1e-6; s += step, i++) { const big = i % every === 0; (big ? major : minor).push(K.pathOf([K.iso(G.pointOf(F, s, r * 0.76, face), P), K.iso(G.pointOf(F, s, r * 0.76, face + (big ? 0.9 : 0.5)), P)])); }
      out.push(L(K.pathOf(rule), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    }
    return out.join("");
  };
  // The alcohol thread of a thermometer, from its bulb to `level` along the axis: a red stroke (cheap to redraw).
  LAB.thread = (P, foot, axis, level, r = 2.4) => { const a = K.iso([foot[0] + axis[0] * 4.5, foot[1] + axis[1] * 4.5, foot[2] + axis[2] * 4.5], P), b = K.iso([foot[0] + axis[0] * level, foot[1] + axis[1] * level, foot[2] + axis[2] * level], P); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#d0392b" stroke-width="${(G.scaleOf(P) * r * 0.4).toFixed(2)}" stroke-linecap="round"/>`; };
  // A glass tube along a polyline of world points (delivery tube, side arm): a pale band with a dark edge.
  LAB.tube = (P, pts, r = 2.2, { fill = "#e8f2f8", ink = LAB.GLASS, inner = null } = {}) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = K.screenRise(1, P) * r * 2;
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1.4).toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w.toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/>` +
      (inner ? `<path d="${d}" fill="none" stroke="${inner}" stroke-width="${(w * 0.45).toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round" opacity=".8"/>` : "");
  };
  LAB.hose = (P, pts, r = 3, color = "#d24f3c") => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = K.screenRise(1, P) * r * 2;
    return `<path d="${d}" fill="none" stroke="#5a1f17" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(w * 0.25).toFixed(2)}" stroke-linecap="round" opacity=".35" transform="translate(-0.4 -0.6)"/>`;
  };
  // Smooth a polyline's corners for a hose or a glass bend.
  LAB.bend = (pts, r = 6) => G.fillet(pts, r, 7);
  // A plain bench mat (white tile or a ceramic heat mat) under a set-up.
  LAB.mat = (P, plan, h = 3, tone = "lo", tint = ISO.T.steel) => ISO.tinted(tint, `<path class="iso-halo" d="${K.haloOf(plan, 0, h, P)}"/>` + S(K.slabOf(plan, 0, h, P, 3, 0.5), { tone }));
  // Text printed on a curved or flat surface: at world point p, running along unit tangent u, up = world z. size in mm.
  LAB.faceText = (P, p, u, text, size = 4, color = "#3d5a70", up = [0, 0, 1]) => {
    const o = K.iso(p, P), a = K.iso([p[0] + u[0], p[1] + u[1], p[2] + u[2]], P), b = K.iso([p[0] - up[0], p[1] - up[1], p[2] - up[2]], P);
    return `<text transform="matrix(${(a[0] - o[0]).toFixed(3)} ${(a[1] - o[1]).toFixed(3)} ${(b[0] - o[0]).toFixed(3)} ${(b[1] - o[1]).toFixed(3)} ${o[0].toFixed(1)} ${o[1].toFixed(1)})" text-anchor="middle" fill="${color}" style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif">${text}</text>`;
  };
  // An opaque turned body on any axis drawn cheaply: its silhouette filled with a gradient across it (rubber bulbs,
  // stoppers, bungs that change shape every frame). colours = [dark, light]
  let gradN = 0;
  LAB.turned = (P, o, outer, [dark, light], ink, { axis = null, rims = [] } = {}) => {
    const v = LAB.vessel(P, o, outer, { axis }), id = "tg" + (gradN++);
    return `<defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${dark}"/><stop offset=".35" stop-color="${light}"/><stop offset=".8" stop-color="${mix(dark, light, 0.5)}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>` +
      `<path d="${v.sil}" fill="url(#${id})" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/>` + rims.map((s) => `<path d="${G.arcOf(v.F, s, v.rAt(s), P)}" fill="none" stroke="${ink}" stroke-width="0.6" opacity=".6"/>`).join("");
  };
  LAB.word = (P, lab, at, text, color = "#445", opts = {}) => (lab ? ISO.word(K.iso(at, P), text, color, { size: 13, ...opts }) : "");
  LAB.parts = (g) => Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
  // Light the named part(s) in `lit` (comma list) among every [data-name] in g.
  LAB.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(","); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  LAB.title = (parent, cx, y, t) => { if (t) label(parent, cx, y, t, TXT.blue, 22, "middle"); };
})();
