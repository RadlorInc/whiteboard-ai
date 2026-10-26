// Batch b31 helpers (batch 6): shared by the camera parts (mirrorless, zoomlens: camera.js's cut-open lens) and the
// mast parts (phonemast, sectorpanel, microwavedish: celltower.js's panels, radios and dish, at real size).
// Not a recipe: it only defines window.B31. The lens is built in mm; the mast bits in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B31 = (window.B31 = {});
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B31.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B31.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the same camera with its origin moved, so world point `at` lands where [0, 0, 0] did (a part's placing point
  // inside a scene's own coordinates)
  B31.shift = (P, at) => { const o = K.iso(at, P); return { ...P, origin: [2 * P.origin[0] - o[0], 2 * P.origin[1] - o[1]] }; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  // a frame for ISO.box: point = o + u·U + w·W + h·V
  B31.frame = (o, U, W, V) => (u, w, h) => add(o, add(mul(U, u), add(mul(W, w), mul(V, h))));

  // ── the lens of camera.js, cut in half down its axis (x), the kept half y < 0, axis at height az (mm).
  // Barrel as rings along the axis: [x0, x1, outer radius, wall, colours, kind]
  const DARK = [["#1f2226", "#4a4f56"], "#33373c", "#0d0e10"], RUB = [["#16181b", "#3a3e44"], "#2a2d31", "#0d0e10"], STEEL = [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"];
  B31.FRONT = 86;
  B31.RINGS = [[10, 14, 31, 3, STEEL, "mount"], [14, 30, 33, 3, DARK], [30, 50, 35.5, 3, RUB, "zoom"], [50, 55, 34, 3, DARK], [55, 70, 35.5, 3, RUB, "focus"], [70, B31.FRONT, 37, 4, DARK]];
  // glass elements: centre x, radius, front and back sag (+ bulges out, − hollows in), edge thickness
  B31.LENSES = [[79, 31, 3.2, 3, 3], [67, 26, 2.6, -1.8, 3], [53, 22, 3, 3, 2.4], [42, 19, -1.8, -1.8, 5], [27, 22, 2.6, 2.6, 3]];
  B31.APX = 47;                                                         // the aperture's plane
  B31.inner = (x) => { const r = B31.RINGS.find(([a, b]) => x >= a && x <= b); return r[2] - r[3]; };
  B31.lens = (P, az) => {
    const V = [K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([0, 0, 1], P) - K.depthOf([0, 0, 0], P)];
    const halfRing = (R, r) => [...ISO.arc(0, az, R, Math.PI / 2, (3 * Math.PI) / 2, 24), ...ISO.arc(0, az, r, (3 * Math.PI) / 2, Math.PI / 2, 24)];
    const cut = (pts, fill, stroke = "#0d0e10", w = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 0.05, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
    const rings = B31.RINGS.map(([x0, x1, R, wall, [sh, face, ink], kind]) => {
      let s = ISO.prismX(P, halfRing(R, R - wall), x0, x1, sh, face, ink);
      if (kind === "zoom" || kind === "focus") {
        // grip ridges: thin raised strips along the ring on the side that faces the viewer, each a closed outline
        for (let a = Math.PI / 2 + 0.12; a < 1.5 * Math.PI - 0.06; a += 0.13) {
          if (Math.cos(a) * V[0] + Math.sin(a) * V[1] <= 0.05) continue;
          const p = (x, da) => K.iso([x, (R + 0.05) * Math.cos(a + da), az + (R + 0.05) * Math.sin(a + da)], P);
          s += `<path d="${K.pathOf([p(x0 + 0.6, -0.025), p(x1 - 0.6, -0.025), p(x1 - 0.6, 0.025), p(x0 + 0.6, 0.025)], true)}" fill="#0d0e10" stroke="#0d0e10" stroke-width="0.3"/>`;
        }
      }
      if (kind === "zoom") {
        // the printed focal-length marks on the zoom ring's top (white), each a short closed bar
        for (const [i, a] of [2.2, 2.0, 1.8].entries()) {
          const p = (x, da) => K.iso([x, (R + 0.08) * Math.cos(a + da), az + (R + 0.08) * Math.sin(a + da)], P);
          if (Math.cos(a) * V[0] + Math.sin(a) * V[1] > 0.05) s += `<path d="${K.pathOf([p(x0 + 2, -0.01), p(x0 + 5 + i, -0.01), p(x0 + 5 + i, 0.01), p(x0 + 2, 0.01)], true)}" fill="#e8e8e2" stroke="#e8e8e2" stroke-width="0.3"/>`;
        }
      }
      return s;
    }).join("");
    // the glass elements cut through: lens-shaped sections, each held to the barrel by a retaining ring
    const glass = B31.LENSES.map(([xc, r, s1, s2, te]) => {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const z = -r + (2 * r * i) / 16, u = z / r; pts.push([xc + te / 2 + s1 * (1 - u * u), az + z]); }
      for (let i = 16; i >= 0; i--) { const z = -r + (2 * r * i) / 16, u = z / r; pts.push([xc - te / 2 - s2 * (1 - u * u), az + z]); }
      const ri = B31.inner(xc), hold = [[r, ri], [-ri, -r]].map(([a, b]) => cut([[xc - te / 2 - 0.8, az + a], [xc + te / 2 + 0.8, az + a], [xc + te / 2 + 0.8, az + b], [xc - te / 2 - 0.8, az + b]], "#2a2d31"));
      return hold.join("") + cut(pts, "#d8ecf7", "#5d7f96", 0.7);
    }).join("");
    return { rings, glass, cut };
  };
  // the iris at opening radius r: seven blades seen through the cut (a half ring in the plane x = APX, clipped to
  // the barrel's opening), and the two blade sections on the cut face
  B31.iris = (P, az, r, id) => {
    const x = B31.APX, ri = B31.inner(x), F = G.frameOf([x, 0, az], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    const half = [...G.arcPoints(F, 0, ri, Math.PI / 2, 1.5 * Math.PI, 28), ...G.arcPoints(F, 0, r, 1.5 * Math.PI, Math.PI / 2, 20)].map((p) => K.iso(p, P));
    const clip = [[30, az - ri], [72, az - ri], [72, az + ri], [30, az + ri]].map(([cx, cz]) => K.iso([cx, 0, cz], P));
    let edges = "";
    for (let i = 0; i < 14; i++) {
      // each blade's edge: a curve from the opening out to the barrel wall, swept round as the blades turn
      const a0 = (i * 2 * Math.PI) / 14 - Math.PI, pts = [];
      for (let j = 0; j <= 10; j++) { const u = j / 10, rr = r + (ri - r) * u, a = a0 + 0.9 * u; if (Math.cos(a) <= 0.01) pts.push(K.iso(G.pointOf(F, 0, rr, a), P)); else break; }
      if (pts.length > 1) edges += K.pathOf(pts);
    }
    const bars = [[r, ri], [-ri, -r]].map(([a, b]) => `<path d="${K.pathOf([[x - 0.6, az + a], [x + 0.6, az + a], [x + 0.6, az + b], [x - 0.6, az + b]].map(([u, z]) => K.iso([u, 0.05, z], P)), true)}" fill="#3a3e44" stroke="#0d0e10" stroke-width="0.6"/>`).join("");
    return `<defs><clipPath id="${id}"><path d="${K.pathOf(clip, true)}"/></clipPath></defs><g clip-path="url(#${id})"><path d="${K.pathOf(half, true)}" fill="#737881" stroke="#1d1f22" stroke-width="0.6"/><path d="${edges}" fill="none" stroke="#2a2d31" stroke-width="0.6" data-free=""/></g>${bars}`;
  };

  // ── mast hardware, in cm. A mount pipe stands at o (its axis), the thing on it faces horizontal unit n.
  const GALV = ISO.tint("#e7e9ec", ["#a6abb2", "#b5b9bf", "#c4c7cc", "#d2d4d8"], "#4a4f56");
  const PANEL = ISO.tint("#f4f5f6", ["#bfc3c8", "#cbcfd3", "#d7dade", "#e3e5e8"], "#4a4f56");
  const RADIO = ISO.tint("#d9dce0", ["#8f959c", "#9fa5ac", "#afb4ba", "#bfc3c8"], "#3a3f46");
  const WHITE = ISO.tint("#ffffff", ["#d4d7da", "#dfe1e4", "#e9ebed", "#f3f4f5"], "#6a7078");
  B31.GALV = GALV; B31.PANEL = PANEL; B31.RADIO = RADIO; B31.WHITE = WHITE;
  const side = (n) => [-n[1], n[0], 0];
  // a vertical pipe from z0 to z1 at (x, y)
  B31.pipe = (P, [x, y], r, z0, z1, tone = "mid") => ISO.tinted(GALV, S(K.cylinder(x, y, r, z0, z1 - z0, P, 18), { tone, crease: "none" }));
  // a clamp band round a vertical pipe
  B31.band = (P, [x, y], r, z, h = 4) => ISO.tinted(GALV, S(K.cylinder(x, y, r + 0.6, z, h, P, 18), { tone: "mid" }));
  // the panel antenna with its radio behind the pipe: pieces with depths, for the caller to sort with its own.
  // o = the pipe's axis at the panel's middle height. on = active (amber radome, green LED). full = small details.
  // Panel 30 wide, 12 deep, 140 tall, its back 9 cm in front of the pipe's axis; radio 26 × 15 × 50 behind the pipe.
  B31.panelItems = (P, o, n, { on = false, full = true, pipeR = 3.8, pipe = [-80, 80] } = {}) => {
    const s = side(n), at = B31.frame(o, s, n, [0, 0, 1]), items = [], dep = (u, w, h) => K.depthOf(at(u, w, h), P);
    const W0 = 9, W1 = 21, HH = 70;
    items.push({ k: dep(0, 0, 0), svg: B31.pipe(P, o, pipeR, o[2] + pipe[0], o[2] + pipe[1]) + [55, -55].map((h) => B31.band(P, o, pipeR, o[2] + h - 2)).join("") });
    // the radio unit behind the pipe, on its own bracket, fins on its sides, connectors under it, a status LED
    const R0 = -pipeR - 17, R1 = -pipeR - 2;
    let radio = ISO.tinted(GALV, ISO.box(at, P, [-6, 6], [R1, -pipeR + 0.2], [-22, -18], "mid") + ISO.box(at, P, [-6, 6], [R1, -pipeR + 0.2], [-58, -54], "mid"));
    radio += ISO.tinted(RADIO, ISO.box(at, P, [-13, 13], [R0, R1], [-62, -12], "mid"));
    if (full) {
      const fins = []; for (let i = 1; i < 8; i++) { const h = -62 + i * 6.25; fins.push(K.pathOf([at(13.02, R0 + 1, h), at(13.02, R1 - 1, h)].map((p) => K.iso(p, P))), K.pathOf([at(-13.02, R0 + 1, h), at(-13.02, R1 - 1, h)].map((p) => K.iso(p, P)))); }
      radio += `<path d="${fins.join("")}" stroke="#7a8088" stroke-width="0.6" data-free=""/>`;
      radio += ISO.tinted(ISO.T.brass, [-6, 0, 6].map((u) => S(K.cylinder(...at(u, (R0 + R1) / 2, -62).slice(0, 2), 1.2, o[2] - 66, 4, P, 10), { tone: "mid" })).join(""));
      radio += ISO.tinted(GALV, ISO.box(at, P, [-6, 6], [R0 - 1.4, R0], [-16, -14], "mid"));      // its handle
    }
    const led = K.iso(at(9, R1 + 0.05, -16), P);
    radio += `<circle cx="${led[0].toFixed(1)}" cy="${led[1].toFixed(1)}" r="${Math.max(0.6, K.cameraOf(P).k * 0.9).toFixed(1)}" fill="${on ? "#3cc45a" : "#5a5f66"}"/>`;
    items.push({ k: dep(0, (R0 + R1) / 2, -37), svg: `<g data-name="radio">${radio}</g>` });
    // the brackets: top one tilts the panel (two arms), bottom one fixed; each from the pipe's band to the panel's back
    const br = [55, -55].map((h) => ISO.tinted(GALV, ISO.box(at, P, [-7, -5], [pipeR, W0], [h - 2, h + 2], "mid") + ISO.box(at, P, [5, 7], [pipeR, W0], [h - 2, h + 2], "mid"))).join("");
    items.push({ k: dep(0, (pipeR + W0) / 2, 0), svg: `<g data-name="bracket">${br}</g>` });
    // jumper cables from the radio's connectors round under the pipe to the panel's connectors
    if (full) {
      const cab = [-6, 6].map((u) => K.pathOf(G.fillet([at(u, (R0 + R1) / 2, -66), at(u, (R0 + R1) / 2, -80), at(u, W0 + 6, -80), at(u, W0 + 6, -HH - 3)], 5, 7).map((p) => K.iso(p, P)))).join("");
      items.push({ k: dep(0, 0, -78), svg: `<path d="${cab}" fill="none" stroke="#26272b" stroke-width="${Math.max(0.6, K.cameraOf(P).k * 1.2).toFixed(2)}" stroke-linecap="round"/>` });
    }
    // the panel: radome with end caps, its connectors under the bottom cap
    let pan = ISO.tinted(on ? ISO.T.amber : PANEL, ISO.box(at, P, [-15, 15], [W0, W1], [-HH + 3, HH - 3], on ? "hi" : "mid"));
    pan += ISO.tinted(GALV, ISO.box(at, P, [-15, 15], [W0, W1], [HH - 3, HH], "mid") + ISO.box(at, P, [-15, 15], [W0, W1], [-HH, -HH + 3], "mid"));
    if (full) {
      pan += `<path d="${K.pathOf([at(-15, W1 + 0.02, -HH + 3), at(-15, W1 + 0.02, HH - 3), at(15, W1 + 0.02, HH - 3), at(15, W1 + 0.02, -HH + 3)].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#9aa0a7" stroke-width="0.5"/>`;
      const lab = [at(-6, W1 + 0.03, -HH + 8), at(6, W1 + 0.03, -HH + 8), at(6, W1 + 0.03, -HH + 13), at(-6, W1 + 0.03, -HH + 13)].map((p) => K.iso(p, P));
      pan += `<path d="${K.pathOf(lab, true)}" fill="#e6e8ea" stroke="#6a7078" stroke-width="0.4"/>`;
      pan += ISO.tinted(ISO.T.brass, [-6, 6].map((u) => S(K.cylinder(...at(u, W0 + 6, 0).slice(0, 2), 1.3, o[2] - HH - 3, 3, P, 10), { tone: "mid" })).join(""));
    }
    items.push({ k: dep(0, (W0 + W1) / 2, 0), svg: `<g data-name="antenna">${pan}</g>` });
    return items;
  };
  // the microwave dish on a short arm from the pipe (o = pipe axis at the dish's height), facing n: a shallow grey
  // shell with a white radome cover held by clips, the round radio (ODU) on its back, an elevation strut
  B31.dishItems = (P, o, n, { full = true, pipeR = 3.8, arm = 22, stub = true } = {}) => {
    const items = [], back = add(o, mul(n, arm)), F = G.frameAlong(back, n), dep = (p) => K.depthOf(p, P), s = side(n);
    const at = B31.frame(o, s, n, [0, 0, 1]);
    if (stub) items.push({ k: dep(o) - 1, svg: B31.pipe(P, o, pipeR, o[2] - 40, o[2] + 30) + B31.band(P, o, pipeR, o[2] - 3, 6) });
    // the arm and the strut, from the pipe's clamp to the dish's back mount
    items.push({ k: dep(add(o, mul(n, arm / 2))), svg: ISO.tinted(GALV, ISO.box(at, P, [-2, 2], [pipeR, arm - 9], [-2, 2], "mid") + ISO.box(at, P, [-1, 1], [pipeR, arm - 9], [-18, -15], "mid") + ISO.box(at, P, [-1, 1], [arm - 11, arm - 9], [-15, -2], "mid")) });
    // the ODU (outdoor radio) on the back, then the shell and the radome, near to far by facing
    const odu = () => ISO.tinted(RADIO, S(G.solidOf([[-9, 9], [-1.2, 9.6], [0, 10]], F, P, { steps: 28 }), { tone: "mid" })) + ISO.tinted(GALV, S(G.disc(-11, -9, 4, F, P, { steps: 16 }), { tone: "mid" }));
    const shell = () => ISO.tinted(GALV, S(G.lathe([[0, 0], [0, 10], [3, 19, 1], [8, 27, 1], [11, 30], [15, 30], [15, 0]], F, P, { steps: 36 }), { tone: "mid" }));
    const facing = dep(n) - dep([0, 0, 0]) > 0;
    // the radome: a white band round the rim, its shallow fabric face (seen only from the front)
    const dome = () => { let dome = ISO.tinted(WHITE, S(G.ringBand(15, 17.2, 26, 30.6, F, P, { steps: 40 }), { tone: "mid" }));
    if (facing) dome += `<path d="${G.circleOf(F, 18.4, 27, P, 40)}" fill="#fbfbfa" stroke="#8a9097" stroke-width="0.5"/>`;
    if (full) dome += ISO.tinted(GALV, Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).filter((a) => G.facingOf(F, a, P) > 0.05).map((a) => S(G.prismOf(F, [[-2, 30.2], [2, 30.2], [2, 31.4], [-2, 31.4]].map(([u, r]) => [r * Math.cos(a) - u * Math.sin(a), r * Math.sin(a) + u * Math.cos(a)]), 14, 17, P), { tone: "mid" })).join(""));
      return dome; };
    // one item each, so a build can fill them in separate slices (ISO.later); near to far by facing
    (facing ? [odu, shell, dome] : [dome, shell, odu]).forEach((f, i) => items.push({ k: dep(back) + i * 1e-3, name: "dish", svg: f }));
    return items;
  };
  // run sorted items far to near (an item's svg may be a function, built when it is drawn)
  const svgOf = (i) => { const s = typeof i.svg === "function" ? i.svg() : i.svg; return i.name ? `<g data-name="${i.name}">${s}</g>` : s; };
  B31.sorted = (items) => items.sort((a, b) => a.k - b.k).map(svgOf).join("");
  // the same, as one empty group per item appended to parent in order, each filled in its own build slice
  B31.place = (parent, items) => {
    for (const it of items.sort((a, b) => a.k - b.k)) {
      const e = document.createElementNS("http://www.w3.org/2000/svg", "g");
      parent.append(e);
      ISO.later(() => { e.innerHTML = svgOf(it); });
    }
  };
})();
