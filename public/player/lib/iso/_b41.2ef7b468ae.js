// Shared bits for batch 41 (money + grocery parts: coin, banknote, UV checker, rates board, grocer's scale, basket,
// trolley, bread, tin, rice sack, egg tray). Not a recipe: it only defines window.B41, which those parts call at make
// time. Money is generic: plain numbers, a star, a leaf or a circle; no real currency design, no faces, no brands.
// World units are cm (these parts use the cm camera).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B = (window.B41 = {});
  const add = (a, b, f = 1) => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f];
  B.add = add;
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  B.pick = (v, list, d) => (list.includes(String(v)) ? String(v) : d);
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // built-in words go through the label helper's translator, then into markup
  B.say = (t) => ISO.esc(ISO.say(t));
  // flat text in a flat artwork's units (x right, y down)
  B.text = (x, y, t, size, color = "#1f3b4d", anchor = "middle", weight = 700, font = "'Helvetica Neue',Arial,sans-serif") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${B.say(t)}</text>`;
  // flat artwork (x right, y down, 1 unit = 1 cm) drawn on a world plane: o = the artwork's (0, 0), u = world vector
  // of artwork +x, v = world vector of artwork +y (both per unit). Upright and unmirrored when u × v faces the viewer.
  B.plane = (P, o, u, v) => {
    const O = K.iso(o, P), A = K.iso(add(o, u), P), V = K.iso(add(o, v), P), f = (n) => n.toFixed(4);
    return `matrix(${f(A[0] - O[0])} ${f(A[1] - O[1])} ${f(V[0] - O[0])} ${f(V[1] - O[1])} ${O[0].toFixed(2)} ${O[1].toFixed(2)})`;
  };
  // does the plane's front (u × v) face the camera?
  B.facing = (P, u, v) => { const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], e = G.viewOf(P); return n[0] * e[0] + n[1] * e[1] + n[2] * e[2] > 0; };
  // a sewn chain stitch between world points (dashes)
  B.stitchPath = (P, pts, color = "#7a705c", w = 0.7) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="1.6 1.1" stroke-linecap="round"/>`;
  // a tint from one colour: light top, four darker shades, an edge ink
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * t).toString(16).padStart(2, "0")).join("");
  B.mix = mix;
  B.tintOf = (c, ink) => ISO.tint(mix(c, "#ffffff", 0.45), [mix(c, "#000000", 0.25), mix(c, "#000000", 0.12), c, mix(c, "#ffffff", 0.2)], ink || mix(c, "#000000", 0.6));
  B.METAL = {
    bronze: ISO.tint("#f2d2b0", ["#a8693c", "#b97b4c", "#c98e60", "#d9a479"], "#5a3216"),
    silver: ISO.T.steel,
    gold: ISO.T.brass,
  };
  B.METAL_INK = { bronze: "#6b3c1a", silver: "#3c3f45", gold: "#6b5114" };
  // a five-point star outline in artwork units, centre (x, y), outer radius r
  B.star = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.42 : r; p.push(`${(x + Math.cos(a) * q).toFixed(3)} ${(y + Math.sin(a) * q).toFixed(3)}`); } return `M${p.join("L")}Z`; };
  // a simple leaf (artwork units), centre (x, y), length l, tilted a radians
  B.leaf = (x, y, l, a = 0) => {
    const c = Math.cos(a), s = Math.sin(a), pt = (u, v) => `${(x + u * c - v * s).toFixed(3)} ${(y + u * s + v * c).toFixed(3)}`;
    return `M${pt(-l / 2, 0)}C${pt(-l / 4, -l * 0.32)} ${pt(l / 4, -l * 0.32)} ${pt(l / 2, 0)}C${pt(l / 4, l * 0.32)} ${pt(-l / 4, l * 0.32)} ${pt(-l / 2, 0)}Z`;
  };

  // ── a generic banknote as flat artwork, w × h cm: border, guilloche band, a round watermark with a leaf, the value
  // twice, a printed security strip. Colour by value. back=true draws its back (a geometric rosette and the value).
  B.NOTE = { amber: ["#f2e6cc", "#b08a3a", "#6b5114"], green: ["#dcebd2", "#5f8a4a", "#2f5a22"], blue: ["#d8e4f2", "#5a7fa8", "#25476f"], violet: ["#e6dcef", "#8a6aa8", "#4a2f6b"] };
  B.noteColour = (v) => (v < 5 ? "amber" : v < 20 ? "green" : v < 50 ? "blue" : "violet");
  B.note = (w, h, value = 10, back = false, strip = 0) => {
    const [bg, mid, ink] = B.NOTE[B.noteColour(value)], m = h * 0.07, s = [], val = String(Math.round(value));
    s.push(`<rect width="${w}" height="${h}" rx="${h * 0.02}" fill="${bg}" stroke="${ink}" stroke-width="${h * 0.008}"/>`);
    s.push(`<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="none" stroke="${mid}" stroke-width="${h * 0.018}"/>`);
    // border pattern: small diamonds all round the frame
    const dia = [];
    for (let i = 0; i <= 24; i++) { const x = m + ((w - 2 * m) * i) / 24; dia.push(`M${x.toFixed(2)} ${(m * 0.5).toFixed(2)}l${m * 0.3} ${m * 0.3}l${-m * 0.3} ${m * 0.3}l${-m * 0.3} ${-m * 0.3}Z`, `M${x.toFixed(2)} ${(h - m * 1.1).toFixed(2)}l${m * 0.3} ${m * 0.3}l${-m * 0.3} ${m * 0.3}l${-m * 0.3} ${-m * 0.3}Z`); }
    s.push(`<path d="${dia.join("")}" fill="${mid}" opacity=".55"/>`);
    for (let i = 0; i < 5; i++) {
      const y0 = h * (0.3 + i * 0.1), pts = [];
      for (let j = 0; j <= 20; j++) { const x = m + ((w - 2 * m) * j) / 20; pts.push(`${x.toFixed(2)} ${(y0 + Math.sin(j * 1.1 + i * 0.9) * h * 0.03).toFixed(2)}`); }
      s.push(`<path d="M${pts.join("L")}" fill="none" stroke="${mid}" stroke-width="${h * 0.007}" opacity=".5"/>`);
    }
    if (!back) {
      s.push(`<circle cx="${w * 0.7}" cy="${h / 2}" r="${h * 0.25}" fill="${bg}" stroke="${mid}" stroke-width="${h * 0.014}"/>`);
      s.push(`<path d="${B.leaf(w * 0.7, h / 2, h * 0.36, -Math.PI / 2.6)}" fill="${mid}" opacity=".6"/><path d="M${w * 0.7 - h * 0.12} ${h / 2 + h * 0.15}L${w * 0.7 + h * 0.12} ${h / 2 - h * 0.15}" stroke="${ink}" stroke-width="${h * 0.01}" opacity=".6"/>`);
      // the printed security thread (dashes) at x = 0.45 w; its hidden UV strip glows over it when strip > 0
      s.push(`<path d="M${w * 0.45} ${m}L${w * 0.45} ${h - m}" stroke="${ink}" stroke-width="${h * 0.02}" stroke-dasharray="${h * 0.05} ${h * 0.04}" opacity=".55"/>`);
      if (strip > 0.01) s.push(`<rect x="${w * 0.45 - h * 0.05}" y="${m}" width="${h * 0.1}" height="${h - 2 * m}" fill="#7dffb8" opacity="${(0.85 * strip).toFixed(2)}"/>`, `<path d="${B.star(w * 0.2, h * 0.62, h * 0.12)}" fill="#a8f5ff" opacity="${(0.8 * strip).toFixed(2)}"/>`);
      s.push(B.text(m * 1.6, h * 0.32, val, h * 0.2, ink, "start", 800), B.text(w - m * 1.6, h - m * 1.7, val, h * 0.15, ink, "end", 800));
      s.push(`<rect x="${m * 1.6}" y="${h * 0.62}" width="${w * 0.22}" height="${h * 0.035}" fill="${mid}" opacity=".5"/><rect x="${m * 1.6}" y="${h * 0.7}" width="${w * 0.16}" height="${h * 0.035}" fill="${mid}" opacity=".5"/>`);
    } else {
      const cx = w * 0.4, cy = h / 2, ring = [];
      for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; ring.push(`<circle cx="${(cx + Math.cos(a) * h * 0.13).toFixed(2)}" cy="${(cy + Math.sin(a) * h * 0.13).toFixed(2)}" r="${h * 0.13}" fill="none" stroke="${mid}" stroke-width="${h * 0.008}" opacity=".7"/>`); }
      s.push(ring.join(""), `<circle cx="${cx}" cy="${cy}" r="${h * 0.05}" fill="${mid}" opacity=".6"/>`);
      s.push(B.text(w - m * 1.6, h * 0.36, val, h * 0.24, ink, "end", 800), B.text(m * 1.6, h - m * 1.7, val, h * 0.13, ink, "start", 800));
    }
    return s.join("");
  };

  // ── seven-segment digits (screens, rate cells): a string of digits, "." and "-" in artwork units, right-aligned at
  // x, baseline y, digit height h. Unlit segments faint behind (ghost colour).
  const SEG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg", "-": "g", " ": "" };
  B.seg = (x, y, str, h, on, ghost, n = 0) => {
    const dw = h * 0.52, gap = h * 0.36, t = h * 0.12, cells = [];
    let s = String(str);
    const chars = [], dots = [];
    for (const c of s) { if (c === ".") dots[chars.length - 1] = true; else chars.push(c); }
    while (chars.length < n) { chars.unshift(" "); dots.unshift(false); }
    let cx = x - chars.length * (dw + gap) + gap;
    const segPath = (c, x0) => {
      const p = { a: [x0, y - h, x0 + dw, y - h], b: [x0 + dw, y - h, x0 + dw, y - h / 2], c: [x0 + dw, y - h / 2, x0 + dw, y], d: [x0, y, x0 + dw, y], e: [x0, y - h / 2, x0, y], f: [x0, y - h, x0, y - h / 2], g: [x0, y - h / 2, x0 + dw, y - h / 2] };
      return Object.entries(p).map(([k, [a, b, c2, d]]) => [k, `M${(a + (c2 - a) * 0.12 + (b - d) * 0.0).toFixed(2)} ${(b + (d - b) * 0.12).toFixed(2)}L${(c2 - (c2 - a) * 0.12).toFixed(2)} ${(d - (d - b) * 0.12).toFixed(2)}`]);
    };
    let lit = "", dim = "";
    chars.forEach((c, i) => {
      const x0 = cx + i * (dw + gap), on2 = SEG[c] ?? "";
      for (const [k, d] of segPath(c, x0)) on2.includes(k) ? (lit += d) : (dim += d);
      if (dots[i]) cells.push(`<circle cx="${(x0 + dw + gap * 0.5).toFixed(2)}" cy="${(y - t / 2).toFixed(2)}" r="${(t * 0.8).toFixed(2)}" fill="${on}"/>`);
    });
    return (ghost ? `<path d="${dim}" stroke="${ghost}" stroke-width="${t}" stroke-linecap="round" fill="none"/>` : "") + `<path d="${lit}" stroke="${on}" stroke-width="${t}" stroke-linecap="round" fill="none"/>` + cells.join("");
  };

  // ── groceries (cm), each standing at its bottom middle `at`: used by the basket and trolley, and by the tincan and
  // breadloaf parts (detail = true adds the printing)
  B.TIN_LABEL = ["#c8553d", "#3f7f3a", "#d89a2b", "#2f6fae"];
  B.tin = (P, [x, y, z], { r = 3.75, h = 11, label = "#c8553d", detail = false, parts = false } = {}) => {
    let out = [];
    const res = {}, STEEL = ISO.T.steel, kS = G.scaleOf(P);
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, y, r - 0.1, z, 0.5, P, 32), { tone: "mid" }) + S(K.cylinder(x, y, r, z + 0.5, h - 1, P, 32), { tone: "mid", inner: L([1.0, 1.4, h - 1.4, h - 1.0].map((s) => K.sideArc(x, y, r, z + s, P, 24)).join(""), { tone: "faint" }) })));
    res.tin = out.join(""); out = [];
    // the paper label, a little proud of the tin, with a printed band
    const LT = B.tintOf(label);
    out.push(ISO.tinted(LT, S(K.cylinder(x, y, r + 0.03, z + 1.7, h - 3.4, P, 32), { tone: "mid", inner: kS * r > 6 ? L(K.sideArc(x, y, r + 0.03, z + h * 0.62, P, 24) + K.sideArc(x, y, r + 0.03, z + h * 0.72, P, 24), { tone: "lo" }) : "" })));
    if (detail) {
      const F = LAB.Z([x, y, z]), facing = G.angleToward(F, G.viewOf(P)), tg = G.tangentOf(F, facing).map((q) => -q), rp = G.pointOf(F, 0, r + 0.05, facing);
      const at = (s) => [rp[0], rp[1], z + s];
      out.push(LAB.faceText(P, at(h * 0.36), tg, "400 g", 1.1, "#fdfaf2"), LAB.faceText(P, at(h * 0.24), tg, "FOOD", 0.9, "#fdfaf2"));
      out.push(`<path d="${G.circleOf(G.frameOf(at(h * 0.52), G.radialOf(F, facing), tg, [0, 0, 1]), 0, 0.75, P, 20)}" fill="#fdfaf2" opacity=".85"/>`);
    }
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, y, r, z + h - 1.7, 1.2, P, 32), { tone: "mid", inner: L([h - 1.4, h - 1.0].map((s) => K.sideArc(x, y, r, z + s, P, 24)).join(""), { tone: "faint" }) })));
    res.label = out.join(""); out = [];
    // the top: rim seam, recessed lid, its score ring, the rivet and the ring-pull tab lying flat
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, y, r, z + h - 0.5, 0.5, P, 32), { tone: "mid" })));
    out.push(`<path d="${K.pathOf(K.circleRing(x, y, r - 0.35, 32).map(([a, b]) => K.iso([a, b, z + h - 0.15], P)), true)}" fill="#c7c9cd" stroke="#6f7278" stroke-width="0.5"/>`);
    out.push(`<path d="${K.pathOf(K.circleRing(x, y, r - 0.7, 32).map(([a, b]) => K.iso([a, b, z + h - 0.15], P)), true)}" fill="none" stroke="#8d9096" stroke-width="0.5"/>`);
    if (kS * r > 5) {
      const tab = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2; tab.push(K.iso([x + 0.9 + Math.cos(a) * 1.3, y + Math.sin(a) * 0.75, z + h - 0.1], P)); }
      const hole = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; hole.push(K.iso([x + 1.25 + Math.cos(a) * 0.7, y + Math.sin(a) * 0.38, z + h - 0.09], P)); }
      out.push(`<path d="${K.pathOf(tab, true)}${K.pathOf(hole, true)}" fill="#dfe1e4" fill-rule="evenodd" stroke="#5f6268" stroke-width="0.5"/>`, `<circle cx="${K.iso([x, y, z + h - 0.1], P)[0].toFixed(1)}" cy="${K.iso([x, y, z + h - 0.1], P)[1].toFixed(1)}" r="${Math.max(0.6, kS * 0.25).toFixed(2)}" fill="#9a9da3" stroke="#5f6268" stroke-width="0.4"/>`);
    }
    res.lid = out.join("");
    return parts ? res : res.tin + res.label + res.lid;
  };
  // a sliced loaf along x, len × w × h, in a clear bag gathered at the +x end with a twist tie
  const LOAF = ISO.tint("#e9b77a", ["#9a5a26", "#ad6b33", "#c07e43", "#d39556"], "#5e3412");
  B.loaf = (P, [x, y, z], { len = 25, w = 12, h = 12, bag = true, detail = false, parts = false } = {}) => {
    const hw = w / 2, res = {};
    let out = [];
    // the loaf's end profile in (y, z): a superellipse, squarer below (it sat in a tin) and domed on top
    const prof = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), n = sn < 0 ? 5 : 2.3;
      prof.push([hw * Math.sign(c) * Math.abs(c) ** (2 / n) * (sn < 0 ? 0.96 : 1), h * 0.42 + Math.sign(sn) * Math.abs(sn) ** (2 / n) * (sn < 0 ? h * 0.42 : h * 0.58)]);
    }
    const pts = prof.map(([py, pz]) => [y + py, z + pz]), x0 = x - len / 2, x1 = x + len / 2;
    out.push(ISO.prismX(P, pts, x0, x1 - 0.6, ["#8a4a1c", "#d69a5c"], "#f3dcb2", "#5e3412"));
    // the cut end slice: crumb inside a crust ring (seen at +x, the camera's side)
    const inner = prof.map(([py, pz]) => [py * 0.9, 0.5 + (pz - 0.5) * 0.92]);
    out.push(`<path d="${K.pathOf(prof.map(([py, pz]) => K.iso([x1 - 0.6, y + py, z + pz], P)), true)}" fill="#b4743c" stroke="#5e3412" stroke-width="0.8"/>`);
    out.push(`<path d="${K.pathOf(inner.map(([py, pz]) => K.iso([x1 - 0.6, y + py, z + pz], P)), true)}" fill="#f6e3c0" stroke="#c99a62" stroke-width="0.5"/>`);
    if (G.scaleOf(P) > 4) {
      const holes = [[-2, 4, 0.5], [1.5, 6, 0.35], [-0.5, 8.5, 0.45], [2.8, 3, 0.3], [-3.2, 7, 0.3]].map(([py, pz, r]) => `<circle cx="${K.iso([x1 - 0.6, y + py, z + pz * h / 12], P)[0].toFixed(1)}" cy="${K.iso([x1 - 0.6, y + py, z + pz * h / 12], P)[1].toFixed(1)}" r="${(r * G.scaleOf(P) * 0.7).toFixed(2)}" fill="#dcc193"/>`);
      out.push(holes.join(""));
      // the slices' cuts across the top crust, each from side to side over the dome
      const cuts = [];
      for (let i = 1; i < 12; i++) { const xc = x0 + (len * i) / 12; cuts.push(K.pathOf(prof.slice(2, 17).map(([py, pz]) => K.iso([xc, y + py, z + pz + 0.02], P)))); }
      out.push(`<path d="${cuts.join("")}" fill="none" stroke="#7a4418" stroke-width="0.5" opacity=".5"/>`);
    }
    res.loaf = out.join(""); out = [];
    if (bag) {
      // the clear bag: a loose skin over the loaf, gathered beyond the end into a neck, a twist tie, a short flared tail
      const bp = prof.map(([py, pz]) => [y + py * 1.05, z + pz * 1.04]);
      const bagOut = ISO.prismX(P, bp, x0 - 0.4, x1, ["#ffffff", "#ffffff"], "#ffffff", "#8fb1c7");
      out.push(`<g opacity=".28">${bagOut}</g>`);
      const ring = (xx, s) => prof.map(([py, pz]) => K.iso([xx, y + py * s, z + h * 0.5 + (pz - h * 0.5) * s], P));
      const neck = (xx, s) => K.pathOf(ring(xx, s), true);
      out.push(`<path d="${neck(x1, 1.04)}" fill="#ffffff" fill-opacity=".25" stroke="#8fb1c7" stroke-width="0.7"/>`);
      const tieX = x1 + 3;
      // the gathered cone: the outline of rings shrinking to the tie
      const cone = ISO.hullOf([...ring(x1, 1.04), ...ring(tieX, 0.06)]);
      out.push(`<path d="${K.pathOf(cone, true)}" fill="#ffffff" fill-opacity=".3" stroke="#8fb1c7" stroke-width="0.7"/>`);
      const folds = []; for (let i = 0; i < 6; i++) { const a = ring(x1, 1.0)[Math.round((i / 6) * (prof.length - 1))]; folds.push(K.pathOf([a, K.iso([tieX, y, z + h * 0.5], P)])); }
      out.push(`<path d="${folds.join("")}" fill="none" stroke="#8fb1c7" stroke-width="0.5" opacity=".7"/>`);
      out.push(ISO.tinted(ISO.T.blue, S(G.disc(-0.25, 0.25, 0.55, LAB.X([tieX, y, z + h * 0.5]), P), { tone: "mid" })));
      const tail = ISO.hullOf([...ring(tieX + 0.3, 0.06), ...ring(tieX + 2.6, 0.32)]);
      out.push(`<path d="${K.pathOf(tail, true)}" fill="#ffffff" fill-opacity=".3" stroke="#8fb1c7" stroke-width="0.7"/>`);
      // two long highlights on the bag's top
      out.push(`<path d="${K.pathOf([K.iso([x0 + 3, y - hw * 0.2, z + h * 1.03], P), K.iso([x1 - 4, y - hw * 0.2, z + h * 1.03], P)])}${K.pathOf([K.iso([x0 + 6, y + hw * 0.55, z + h * 0.92], P), K.iso([x1 - 8, y + hw * 0.55, z + h * 0.92], P)])}" stroke="#ffffff" stroke-width="${Math.max(1, G.scaleOf(P) * 0.35).toFixed(2)}" stroke-linecap="round" opacity=".85"/>`);
      if (detail) {
        // a plain printed sticker on the bag's front (+y side)
        const o = [x - 4, y + hw * 1.05 + 0.02, z + h * 0.5];
        out.push(`<g transform="${B.plane(P, o, [1, 0, 0], [0, 0, -1])}"><rect x="0" y="-1.6" width="7" height="3.2" rx=".4" fill="#fdf7e8" stroke="#b08a3a" stroke-width=".12"/>${B.text(3.5, -0.2, "BREAD", 1.2, "#7a4418")}${B.text(3.5, 1.1, "800 g", 0.9, "#7a4418", "middle", 600)}</g>`);
      }
    }
    res.bag = out.join("");
    return parts ? res : res.loaf + res.bag;
  };
  // a 1 L milk carton (7 × 7 × 20 with a gable top)
  B.carton = (P, [x, y, z], { c = "#2f6fae" } = {}) => {
    const T = ISO.tint("#f8f9fb", ["#c9ccd2", "#d6d9de", "#e2e4e8", "#eceef1"], "#4a5058");
    const V = [[x - 3.5, y - 3.5, z + 17], [x + 3.5, y - 3.5, z + 17], [x + 3.5, y + 3.5, z + 17], [x - 3.5, y + 3.5, z + 17], [x - 3.5, y, z + 20], [x + 3.5, y, z + 20]];
    const roof = ISO.poly(V, [[0, 1, 5, 4], [3, 2, 5, 4], [0, 3, 4], [1, 2, 5]], P, "mid");
    return ISO.tinted(T, ISO.wbox(P, [x - 3.5, x + 3.5], [y - 3.5, y + 3.5], [z, z + 17], "mid") + roof + ISO.wbox(P, [x - 3.6, x + 3.6], [y - 0.15, y + 0.15], [z + 19.8, z + 21], "mid")) +
      `<path d="${K.pathOf([K.iso([x - 3.5, y + 3.51, z + 4], P), K.iso([x + 3.5, y + 3.51, z + 4], P), K.iso([x + 3.5, y + 3.51, z + 9], P), K.iso([x - 3.5, y + 3.51, z + 9], P)], true)}${K.pathOf([K.iso([x + 3.51, y - 3.5, z + 4], P), K.iso([x + 3.51, y + 3.5, z + 4], P), K.iso([x + 3.51, y + 3.5, z + 9], P), K.iso([x + 3.51, y - 3.5, z + 9], P)], true)}" fill="${c}" opacity=".85"/>`;
  };
  // a cereal box 19 × 7 × 27, its wide face toward +y
  B.box = (P, [x, y, z], { c = "#e08a2a", w = 19, d = 7, h = 27 } = {}) =>
    ISO.tinted(B.tintOf(c), ISO.wbox(P, [x - w / 2, x + w / 2], [y - d / 2, y + d / 2], [z, z + h], "mid")) +
    `<g transform="${B.plane(P, [x - w / 2, y + d / 2 + 0.01, z + h], [1, 0, 0], [0, 0, -1])}"><rect x="${w * 0.12}" y="${h * 0.12}" width="${w * 0.76}" height="${h * 0.22}" rx="1" fill="#fff4de"/><circle cx="${w / 2}" cy="${h * 0.62}" r="${w * 0.24}" fill="#fff4de" opacity=".9"/><circle cx="${w / 2}" cy="${h * 0.62}" r="${w * 0.14}" fill="${mix(c, "#000000", 0.25)}" opacity=".5"/></g>`;
  // an apple (8 cm), a water bottle (6.5 × 22)
  B.apple = (P, [x, y, z], { r = 4, c = "#d2402f" } = {}) =>
    ISO.tinted(B.tintOf(c), S(G.sphereOf([x, y, z + r * 0.92], r, P, { steps: 28 }), { tone: "mid" })) +
    `<path d="${K.pathOf([K.iso([x, y, z + r * 1.7], P), K.iso([x + 0.3, y, z + r * 2.15], P)])}" stroke="#5e3412" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.3).toFixed(2)}" stroke-linecap="round"/>`;
  B.bottle = (P, [x, y, z], { r = 3.25, h = 22 } = {}) => {
    const W = ISO.tint("#eef7fc", ["#b9d6e8", "#c8dfee", "#d6e8f3", "#e3f0f8"], "#4f7891");
    return ISO.tinted(W, S(K.cylinder(x, y, r, z, h * 0.7, P, 28), { tone: "mid", inner: L([0.15, 0.25, 0.35].map((f) => K.sideArc(x, y, r, z + h * f, P, 20)).join(""), { tone: "faint" }) }) +
      S(K.cylinder(x, y, r * 0.75, z + h * 0.7, h * 0.12, P, 24), { tone: "mid" }) + S(K.cylinder(x, y, r * 0.42, z + h * 0.82, h * 0.1, P, 20), { tone: "mid" })) +
      ISO.tinted(ISO.T.blue, S(K.cylinder(x, y, r * 0.46, z + h * 0.92, h * 0.08, P, 20), { tone: "mid" })) +
      ISO.tinted(B.tintOf("#3f9bd6"), S(K.cylinder(x, y, r + 0.03, z + h * 0.42, h * 0.16, P, 28), { tone: "mid" }));
  };
  // one grocery by kind, sitting at `at`
  B.ITEMS = ["loaf", "tin", "carton", "apple", "box", "bottle"];
  B.item = (P, kind, at, i = 0) => {
    if (kind === "loaf") return B.loaf(P, at, { len: 24, w: 11, h: 10.5 });
    if (kind === "tin") return B.tin(P, at, { label: B.TIN_LABEL[i % 4] });
    if (kind === "carton") return B.carton(P, at);
    if (kind === "apple") return B.apple(P, at, { c: i % 2 ? "#7ab33a" : "#d2402f" });
    if (kind === "box") return B.box(P, at);
    return B.bottle(P, at);
  };
})();
