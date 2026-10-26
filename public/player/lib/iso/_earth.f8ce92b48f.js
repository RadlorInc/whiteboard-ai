// Shared parts for the earth recipes (globe, planet, earthlayers, seasons, moonphases, eclipse, solarsystem):
// a ball drawn with true geography or bands on a tilted spinning axis, the night side a lamp leaves on it,
// brass rods, a bent band (a globe's meridian), and the bench lamp that stands for the Sun.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const { dot3, add3, sub3, mul3, unit3, cross3 } = G;
  const E = (window.EARTH = {});
  const R = Math.PI / 180;
  E.R = R;

  // Coastlines, coarse but true, as [longitude, latitude] rings.
  E.LAND = [
    [[-168, 66], [-160, 71], [-140, 70], [-125, 72], [-95, 75], [-80, 73], [-65, 62], [-60, 55], [-55, 50], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 21], [-87, 21], [-88, 15], [-83, 9], [-79, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-115, 31], [-118, 34], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-165, 60]],
    [[-50, 60], [-42, 60], [-20, 70], [-18, 80], [-35, 83], [-60, 82], [-72, 78], [-55, 70]],
    [[-80, 8], [-72, 12], [-62, 10], [-50, 0], [-35, -6], [-39, -14], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-66, -50], [-70, -54], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 5]],
    [[-17, 15], [-17, 21], [-13, 28], [-6, 35], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [50, 2], [40, -5], [40, -15], [35, -24], [32, -29], [27, -34], [18, -34], [15, -27], [12, -17], [13, -6], [9, -1], [9, 4], [5, 6], [-8, 4], [-13, 8]],
    [[-10, 36], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [60, 69], [70, 73], [90, 76], [110, 77], [140, 72], [160, 70], [180, 68], [178, 62], [160, 58], [156, 51], [142, 47], [140, 40], [130, 35], [122, 40], [120, 30], [110, 20], [108, 12], [104, 9], [100, 13], [98, 8], [100, 3], [104, 1], [98, 16], [93, 20], [88, 22], [80, 15], [77, 8], [73, 18], [67, 25], [57, 25], [56, 22], [52, 16], [44, 12], [43, 16], [35, 28], [34, 32], [36, 36], [27, 37], [26, 41], [23, 38], [20, 40], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 37]],
    [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [141, -38], [135, -35], [129, -32], [115, -34], [113, -26]],
    [[-5, 50], [1, 51], [-2, 56], [-5, 58], [-6, 55]],
    [[44, -13], [50, -15], [47, -25], [43, -22]],
    [[130, 31], [136, 34], [141, 38], [142, 45], [140, 41], [133, 34]],
    [[-180, -78], [-150, -76], [-120, -73], [-90, -72], [-60, -64], [-30, -76], [0, -70], [30, -69], [60, -67], [90, -66], [120, -66], [150, -70], [180, -78], [180, -90], [-180, -90]],
  ];
  // densify each ring so that no step is more than 3° (a ring hugging the limb stays round)
  const dense = (ring, step = 4) => ring.flatMap((p, i) => {
    const q = ring[(i + 1) % ring.length], n = Math.max(1, Math.ceil(Math.max(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1])) / step));
    return Array.from({ length: n }, (_, k) => [p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  });
  E.LAND_D = E.LAND.map((r) => dense(r));

  // A ball's frame: centre c, radius r, north axis a, spin s (radians, east turns toward the viewer's right).
  E.frame = (c, r, a, s = 0) => {
    const ax = unit3(a), h = Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
    const u0 = unit3(cross3(h, ax)), v0 = cross3(ax, u0);
    const u = add3(mul3(u0, Math.cos(s)), mul3(v0, Math.sin(s))), v = cross3(ax, u);
    return { c, r, a: ax, u, v };
  };
  E.dir = (F, lon, lat) => { const cl = Math.cos(lat * R); return add3(add3(mul3(F.u, cl * Math.cos(lon * R)), mul3(F.v, cl * Math.sin(lon * R))), mul3(F.a, Math.sin(lat * R))); };
  // a surface point seen on screen: a point on the far side is pushed out to the limb, so a ring hugs the outline
  E.seen = (F, d, V) => { const k = dot3(d, V); const q = k >= 0 ? d : unit3(sub3(d, mul3(V, k))); return add3(F.c, mul3(q, F.r)); };
  E.ringOn = (F, P, dirs) => { const V = G.viewOf(P); if (dirs.every((d) => dot3(d, V) < 0)) return ""; return K.pathOf(dirs.map((d) => K.iso(E.seen(F, d, V), P)), true); };
  E.latRing = (F, P, lat, n = 72) => E.ringOn(F, P, Array.from({ length: n }, (_, i) => E.dir(F, (i / n) * 360, lat)));
  // a small round patch (a crater, a storm, a shadow spot) of angular radius rho around the direction d0
  E.spotRing = (F, P, d0, rho, n = 28) => {
    const V = G.viewOf(P); if (dot3(d0, V) < Math.sin(rho)) return "";
    const h = Math.abs(d0[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], p = unit3(cross3(h, d0)), q = cross3(d0, p);
    return E.ringOn(F, P, Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return unit3(add3(mul3(d0, Math.cos(rho)), mul3(add3(mul3(p, Math.cos(t)), mul3(q, Math.sin(t))), Math.sin(rho)))); }));
  };
  // The dark side a lamp in direction Ld (unit, from the centre) leaves on the ball, as one closed outline.
  E.nightOf = (c, r, Ld, P, n = 36) => {
    const V = G.viewOf(P), A0 = cross3(Ld, V);
    if (Math.hypot(...A0) < 1e-3) return dot3(Ld, V) > 0 ? "" : K.pathOf(Array.from({ length: n * 2 }, (_, i) => { const t = (i / (n * 2)) * Math.PI * 2, F = G.frameAlong(c, V); return K.iso(G.pointOf(F, 0, r, t), P); }), true);
    const A = unit3(A0), B = unit3(cross3(Ld, A)), sb = dot3(B, V) >= 0 ? 1 : -1;
    let C = unit3(cross3(V, A)); if (dot3(C, Ld) > 0) C = mul3(C, -1);
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI; pts.push(add3(c, mul3(add3(mul3(A, Math.cos(t)), mul3(B, sb * Math.sin(t))), r))); }
    for (let i = n - 1; i > 0; i--) { const t = (i / n) * Math.PI; pts.push(add3(c, mul3(add3(mul3(A, Math.cos(t)), mul3(C, Math.sin(t))), r))); }
    return K.pathOf(pts.map((p) => K.iso(p, P)), true);
  };
  // the night side with a soft edge: a pale twilight band, then the dark
  E.night = (c, r, Ld, P, dark = 0.5) => {
    const V = G.viewOf(P), A0 = cross3(Ld, V), A = Math.hypot(...A0) < 1e-3 ? unit3(cross3(Ld, [0.3, -0.2, 0.93])) : unit3(A0);
    const turn = (t) => unit3(add3(mul3(Ld, Math.cos(t)), mul3(cross3(A, Ld), Math.sin(t)))), o = 1 - Math.sqrt(1 - dark);
    return [turn(4 * R), turn(-4 * R)].map((l) => { const d = E.nightOf(c, r, l, P); return d ? `<path d="${d}" fill="#16213a" fill-opacity="${o.toFixed(3)}" stroke="none"/>` : ""; }).join("");
  };

  // The ball itself: shaded sphere, tinted; land (a list of rings in lon/lat), bands, spots, rings of latitude.
  // opt: { tint, land: "#…", landInk, bands: [[lat0, lat1, colour]], spots: [[lon, lat, deg, colour, ink]], lats: [deg],
  //        flat (no kit shading: a lamp does the lighting), light (unit direction to a lamp), dark }
  E.ball = (P, F, opt = {}) => {
    const sph = G.sphereOf(F.c, F.r, P, { steps: 64 }), out = [ISO.tinted(opt.tint || ISO.T.blue, S(sph, { tone: "mid", flat: !!opt.flat }))];
    const blend = 'style="mix-blend-mode:multiply"';
    for (const [l0, l1, col] of opt.bands || []) {
      const d = E.latRing(F, P, l0) + E.latRing(F, P, l1);
      if (d) out.push(`<path d="${d}" fill="${col}" fill-rule="evenodd" ${blend}/>`);
    }
    if (opt.land) {
      const d = E.LAND_D.map((ring) => E.ringOn(F, P, ring.map(([lo, la]) => E.dir(F, lo, la)))).join("");
      out.push(`<path d="${d}" fill="${opt.land}" stroke="${opt.landInk || "#3f7a2e"}" stroke-width=".7" stroke-linejoin="round" ${blend}/>`);
    }
    for (const [lo, la, deg, col, ink] of opt.spots || []) {
      const d = E.spotRing(F, P, E.dir(F, lo, la), deg * R);
      if (d) out.push(`<path d="${d}" fill="${col}" stroke="${ink || "none"}" stroke-width=".6" ${blend}/>`);
    }
    for (const [lat, col] of opt.lats || []) out.push(`<path d="${E.latRing(F, P, lat)}" fill="none" stroke="${col}" stroke-width=".8" stroke-dasharray="${lat ? "2.5 2" : "none"}"/>`);
    if (opt.light) out.push(E.night(F.c, F.r, opt.light, P, opt.dark ?? 0.5));
    out.push(`<path d="${sph.outline}" fill="none" stroke="${opt.ink || "#1f3f66"}" stroke-width="1"/>`);
    return out.join("");
  };

  // A brass rod between two world points (an axis pin, an orrery arm), as a turned solid.
  E.rod = (P, a, b, r = 1.2, tint = ISO.T.brass, tone = "mid") => {
    const d = sub3(b, a), len = Math.hypot(...d);
    return ISO.tinted(tint, S(G.disc(0, len, r, G.frameAlong(a, d), P, { steps: 16 }), { tone, crease: "none" }));
  };
  // A band bent round an arc (a globe's meridian, a moon arm's curve) in pieces, each with its depth so the caller
  // can draw the far pieces before a ball and the near ones after. Arc centre c, in the plane of unit vectors u, v.
  E.bandArc = (P, c, u, v, Rr, halfW, halfT, t0, t1, n) => {
    const nrm = unit3(cross3(u, v)), at = (t, dr, dn) => add3(c, add3(mul3(add3(mul3(u, Math.cos(t)), mul3(v, Math.sin(t))), Rr + dr), mul3(nrm, dn)));
    return Array.from({ length: n }, (_, i) => {
      const a = t0 + ((t1 - t0) * i) / n, b = t0 + ((t1 - t0) * (i + 1)) / n;
      const V = [[a, -halfW, -halfT], [b, -halfW, -halfT], [b, halfW, -halfT], [a, halfW, -halfT], [a, -halfW, halfT], [b, -halfW, halfT], [b, halfW, halfT], [a, halfW, halfT]].map(([t, dr, dn]) => at(t, dr, dn));
      return { svg: ISO.poly(V, ISO.BOX_F, P, "mid"), depth: K.depthOf(at((a + b) / 2, 0, 0), P) };
    });
  };

  // The bench lamp that stands for the Sun: a weighted round foot, a stem, a socket and a bare bulb at B.
  E.lamp = (P, B, br = 9) => {
    const [x, y, z] = B, out = [];
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[0, 0], [0, 14], [2.2, 13.4, 1], [3.4, 11, 1], [4, 6], [4, 0]], LAB.Z([x, y, 0]), P, { steps: 48 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 1.8, 4, z - br - 12, P, 18), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 3], [2, 3], [2, 4.6], [9, 4.6], [9, 3.8]], LAB.Z([x, y, z - br - 9]), P, { steps: 28 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 3.6], [1.2, 3.9], [2.4, 3.6], [3.6, 3.9], [4.2, 3.4]], LAB.Z([x, y, z - br - 0.8]), P, { steps: 24 }), { tone: "mid" })));
    return out.join("");
  };
  E.bulb = (P, B, br = 9, on = 1) => ISO.tinted(ISO.tint(on ? "#fff6d6" : "#f4f4f2", on ? ["#f3cf6a", "#f6d982", "#f9e39d", "#fcecba"] : ["#c9cbcf", "#d4d6d9", "#dfe0e2", "#e9eaeb"], "#8a6a10"), S(G.sphereOf(B, br, P, { steps: 48 }), { tone: "mid" }));
  // The bulb's glow on the paper: a WebGL halo, or a soft SVG disc without WebGL. Returns set(on 0..1).
  E.glow = (g, P, W, H, before, B, reach) => {
    const fx = ISO.gl(g, P, W, H, before, `uniform float uOn;void main(){vec2 vb=viewOf(gl_FragCoord.xy);float d=ballOf(vb,vec3(${B.map((v) => v.toFixed(2)).join(",")}))/${reach.toFixed(2)};
      float e=exp(-d*d*2.2)*smoothstep(1.6,.9,d);gl_FragColor=finish(inkFor(mix(vec3(1.),vec3(1.,.8,.32),.85*e*uOn),0.)*.9);}`, ["uOn"]);
    if (fx) return (on) => fx.set({ uOn: on }, on > 0.01);
    const c = K.iso(B, P), rr = reach * K.cameraOf(P).k, id = `eg${Math.random().toString(36).slice(2, 7)}`;
    const el = mk("g", {}, before.parentNode); before.parentNode.insertBefore(el, before);
    el.innerHTML = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#ffd76a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${rr.toFixed(1)}" fill="url(#${id})" stroke="none"/>`;
    return (on) => { el.style.opacity = on; };
  };
  // A printed calendar ring lying on the bench: a thin paper band (the board shows through its middle).
  E.track = (P, c, Rr, w = 4, under = ISO.T.wood) => {
    const out = ISO.tinted(ISO.T.paint, S(K.cylinder(c[0], c[1], Rr + w, c[2], 1.2, P, 160), { tone: "mid" }));
    return out + ISO.tinted(under, `<path d="${K.ring(c[0], c[1], Rr - w, c[2] + 1.2, P, 160)}" fill="var(--anatomy-top)" stroke="var(--anatomy-lo)" stroke-width=".7"/>`);
  };
})();

// ── landscape models (glacier, river): a height field cut out as a block and set on a base board
(() => {
  const K = window.K, G = window.G, E = window.EARTH;
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  E.hex = hex;
  const rgb = ([r, g, b], k = 1) => `rgb(${Math.min(255, Math.round(r * k))},${Math.min(255, Math.round(g * k))},${Math.min(255, Math.round(b * k))})`;
  E.rgb = rgb;
  // The top of the block: nx × ny cells from x0..x1, y0..y1 at height h(x, y), each coloured col(x, y, z, slope)
  // ([r, g, b]) and lit by the kit's light, drawn far to near. A cell may also carry an outline (marks).
  E.terrain = (P, { x0, x1, y0, y1, nx, ny, h, col, extras = [] }) => {
    const Lt = G.lightOf(P), dx = (x1 - x0) / nx, dy = (y1 - y0) / ny, Z = [];
    for (let j = 0; j <= ny; j++) { Z.push([]); for (let i = 0; i <= nx; i++) Z[j].push(h(x0 + i * dx, y0 + j * dy)); }
    const scr = Z.map((row, j) => row.map((z, i) => K.iso([x0 + i * dx, y0 + j * dy, z], P)));
    const cells = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = Z[j][i], b = Z[j][i + 1], c = Z[j + 1][i + 1], d = Z[j + 1][i];
      const n = G.unit3([-((b + c - a - d) / 2) / dx, -((c + d - a - b) / 2) / dy, 1]);
      const x = x0 + (i + 0.5) * dx, y = y0 + (j + 0.5) * dy, z = (a + b + c + d) / 4;
      const k = 0.8 + 0.3 * G.dot3(n, Lt), fill = rgb(col(x, y, z, 1 - n[2]), k);
      cells.push({ k: K.depthOf([x, y, z], P), d: `<path d="${K.pathOf([scr[j][i], scr[j][i + 1], scr[j + 1][i + 1], scr[j + 1][i]], true)}" fill="${fill}" stroke="${fill}" stroke-width=".5"/>` });
    }
    cells.push(...extras);
    cells.sort((p, q) => p.k - q.k);
    return { svg: cells.map((c) => c.d).join(""), Z, dx, dy };
  };
  // A cut face of the block along a run of plan points: bands from the bottom up, each between bot(x, y) and top(x, y).
  E.wall = (P, run, bands) => bands.map(({ top, bot, fill, ink }) => {
    const up = run.map(([x, y]) => [x, y, top(x, y)]), dn = run.map(([x, y]) => [x, y, Math.min(top(x, y), bot(x, y))]).reverse();
    return `<path d="${K.pathOf([...up, ...dn].map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${ink || fill}" stroke-width="${ink ? 0.8 : 0.4}" stroke-linejoin="round"/>`;
  }).join("");
  E.run = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
})();
