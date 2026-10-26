// Batch b45 helpers (PARTS.md, batch 6: shop + supply-chain parts). Not a recipe: it only defines window.B45, which
// those parts call at make time. World units are cm (the parts use the cm camera). Money is generic: plain numbers,
// no currency signs, no brands. Shared: the apple (apple, applecrate, marketstall, storeshelf), the slatted crate
// (applecrate, marketstall), the taped carton (pallet, deliverytruck), the shelf-edge label artwork (shoptag,
// storeshelf), flat artwork on world planes and the usual number / light helpers.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const B = (window.B45 = {});
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  B.pick = (v, list, d) => (list.includes(String(v)) ? String(v) : d);
  B.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  B.parts = (g) => Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
  B.word = (P, p, text, { color = "#444", anchor = "start", size = 13, dx = 8, dy = 0 } = {}) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], text, color, { anchor, size, dy }); };
  B.say = (t) => ISO.esc(ISO.say(t));
  // flat text in a flat artwork's units (x right, y down)
  B.text = (x, y, t, size, color = "#1f3b4d", anchor = "middle", weight = 700, font = "'Helvetica Neue',Arial,sans-serif") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${B.say(t)}</text>`;
  const add = (a, b, f = 1) => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f];
  B.add = add;
  // flat artwork (x right, y down, 1 unit = 1 cm) on a world plane: o = artwork (0, 0), u / v = world vectors of artwork
  // +x / +y. Upright and unmirrored when u × v faces the viewer. front(): a +y face, artwork top-left at o.
  B.plane = (P, o, u, v) => {
    const O = K.iso(o, P), A = K.iso(add(o, u), P), V = K.iso(add(o, v), P), f = (n) => n.toFixed(4);
    return `matrix(${f(A[0] - O[0])} ${f(A[1] - O[1])} ${f(V[0] - O[0])} ${f(V[1] - O[1])} ${O[0].toFixed(2)} ${O[1].toFixed(2)})`;
  };
  B.front = (P, o, art) => `<g transform="${B.plane(P, o, [1, 0, 0], [0, 0, -1])}">${art}</g>`;
  B.side = (P, o, art) => `<g transform="${B.plane(P, o, [0, -1, 0], [0, 0, -1])}">${art}</g>`;
  B.top = (P, o, art) => `<g transform="${B.plane(P, o, [1, 0, 0], [0, 1, 0])}">${art}</g>`;   // o = the far-left corner, read from the front
  // a closed world polygon with a fill and an ink
  B.poly = (P, pts, fill, ink = "none", w = 0.6, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"${extra}/>`;
  // printed / scored lines on a surface: free (no end needs a root)
  B.free = (P, segs, ink, w = 0.5, extra = "") => `<path data-free d="${segs.map((s) => K.pathOf(s.map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="${ink}" stroke-width="${w}"${extra}/>`;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  B.mix = (a, b, t) => "#" + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * t).toString(16).padStart(2, "0")).join("");
  B.tintOf = (c, ink) => ISO.tint(B.mix(c, "#ffffff", 0.45), [B.mix(c, "#000000", 0.25), B.mix(c, "#000000", 0.12), c, B.mix(c, "#ffffff", 0.2)], ink || B.mix(c, "#000000", 0.6));
  B.PINE = ISO.tint("#f4e2c0", ["#c49a62", "#cfa872", "#dab784", "#e5c898"], "#6e4a1e");
  B.OLDWOOD = ISO.tint("#ead7b4", ["#a98458", "#b69367", "#c3a277", "#d0b38b"], "#5e4220");

  // ── an apple (about 8 cm across), standing on its bottom at `at`: a turned body with dimples top and bottom, a
  // stalk (a thin solid), a blush streak; detail adds a leaf with its vein. r = half its width.
  // the turned profile (s up the axis, radius), sampled from a smooth curve (hard points: soft curves cost 4x to turn)
  const APPLE = (r) => {
    const m = [[r * 0.14, 0]];
    for (let i = 1; i < 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI, rr = r * Math.cos(a) * (1 + 0.08 * Math.sin(a)); m.push([r * 0.9 * (1 + Math.sin(a)), rr]); }
    m.push([r * 1.74, 0]);
    return m;
  };
  B.APPLE_C = { red: "#cf3b2c", green: "#7cb342", yellow: "#e2b531" };
  // turned (lathe) for a big single apple; a sphere with a dimple for crates and shelves, which hold many
  B.apple = (P, [x, y, z], { r = 4, c = "#cf3b2c", detail = false } = {}) => {
    const kS = G.scaleOf(P), out = [];
    if (kS * r < 2.2) return `<circle cx="${K.iso([x, y, z + r * 0.9], P)[0].toFixed(1)}" cy="${K.iso([x, y, z + r * 0.9], P)[1].toFixed(1)}" r="${Math.max(0.6, kS * r * 0.95).toFixed(2)}" fill="${c}" stroke="${B.mix(c, "#000000", 0.55)}" stroke-width=".4"/>`;
    if (kS * r > 40) out.push(ISO.tinted(B.tintOf(c), S(G.lathe(APPLE(r), LAB.Z([x, y, z]), P, { steps: 40 }), { tone: "mid" })));
    else {
      out.push(ISO.tinted(B.tintOf(c), S(G.sphereOf([x, y, z + r * 0.9], r, P, { steps: kS * r > 8 ? 28 : 16 }), { tone: "mid" })));
      const dim = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; dim.push([x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32, z + r * 1.74]); }
      out.push(B.poly(P, dim, B.mix(c, "#000000", 0.3), "none", 0, ' opacity=".55"'));
    }
    if (kS * r > 5) {
      // a soft lighter streak on the lit shoulder (printed on the skin, free)
      const sh = [0.25, 0.55, 0.85].map((f) => { const a = 2.1 + f * 0.5; return [x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, z + r * (0.55 + f * 0.8)]; });
      out.push(B.free(P, [sh], B.mix(c, "#ffffff", 0.45), Math.max(0.5, kS * r * 0.12), ' stroke-linecap="round" opacity=".55"'));
    }
    // the stalk: a short brown rod from the top dimple, leaning a little
    const top = [x, y, z + r * 1.74], tip = [x + r * 0.12, y - r * 0.05, z + r * 2.25];
    out.push(ISO.tinted(ISO.tint("#9a6a3a", ["#4e2e12", "#5e3a1a", "#6e4622", "#7e542c"], "#3a2008"), S(G.disc(0, Math.hypot(tip[0] - top[0], tip[1] - top[1], tip[2] - top[2]), Math.max(0.12, r * 0.06), G.frameAlong(top, [tip[0] - top[0], tip[1] - top[1], tip[2] - top[2]]), P, { steps: 8 }), { tone: "mid" })));
    if (detail) {
      // a leaf from the stalk's middle, lying out toward +y +x, its vein printed
      const m = [x + r * 0.06, y - r * 0.02, z + r * 2.0], A = (u, v, h) => [m[0] + u * 0.6 + v * 0.8, m[1] + u * 0.8 - v * 0.6, m[2] + h];
      const L0 = r * 1.3, edge = [];
      for (let i = 0; i <= 10; i++) { const s = i / 10; edge.push(A(s * L0, Math.sin(s * Math.PI) * r * 0.32, s * r * 0.18 - s * s * r * 0.12)); }
      for (let i = 9; i >= 1; i--) { const s = i / 10; edge.push(A(s * L0, -Math.sin(s * Math.PI) * r * 0.26, s * r * 0.18 - s * s * r * 0.12 + Math.sin(s * Math.PI) * r * 0.05)); }
      out.push(B.poly(P, edge, "#6fa83a", "#2f5a12", 0.6));
      const vein = []; for (let i = 0; i <= 8; i++) { const s = i / 10; vein.push(A(s * L0, 0, s * r * 0.18 - s * s * r * 0.12 + 0.01)); }
      out.push(B.free(P, [vein], "#3f7a1c", 0.5));
    }
    return out.join("");
  };
  // apples packed in a box interior [x0, x1] × [y0, y1] from floor z, n of them, rows of `cols` × `rows` per layer,
  // the next layer nested in the hollows; returned painted far to near, bottom to top, each [x, y, z, tone, fill order]
  B.appleSpots = (x0, x1, y0, y1, z, n, cols, rows, r) => {
    const all = [], sx = (x1 - x0) / cols, sy = (y1 - y0) / rows;
    for (let layer = 0; all.length < n && layer < 8; layer++) {
      const off = layer % 2 ? 0.5 : 0, nc = cols - (layer % 2), nr = rows - (layer % 2);
      for (let j = 0; j < nc * nr; j++) all.push([x0 + sx * ((j % nc) + 0.5 + off), y0 + sy * (Math.floor(j / nc) + 0.5 + off), z + layer * r * 1.45, all.length % 3, all.length]);
    }
    return all.slice(0, n).sort((a, b) => a[2] - b[2] || a[0] * 0.435 + a[1] * 0.819 - (b[0] * 0.435 + b[1] * 0.819));
  };

  // ── a slatted wooden crate (open top) w × d × h standing at [x, y, z] (its floor's middle): four corner posts,
  // three side slats along each long side with gaps, two end boards with a hand hole, a slatted floor. inside = svg of
  // what is in it, painted between the far walls and the near walls. Returns the whole crate.
  B.crate = (P, [x, y, z], { w = 50, d = 30, h = 30, inside = "", tint = B.PINE, label = "" } = {}) => {
    const hx = w / 2, hy = d / 2, t = Math.min(1.6, h * 0.06), post = Math.min(3, w * 0.07), kS = G.scaleOf(P);
    const X = [x - hx, x + hx], Y = [y - hy, y + hy];
    const box = (a, b, c) => ISO.wbox(P, a, b, c, "mid");
    const slats = (side) => {   // the long side at y = side (−1 far, +1 near): three slats with gaps between posts
      const yy = side < 0 ? [Y[0], Y[0] + t] : [Y[1] - t, Y[1]], n = 3, gap = h * 0.09, sh = (h - gap * (n - 1)) / n, out = [];
      for (let i = 0; i < n; i++) out.push(box([X[0] + post * 0.4, X[1] - post * 0.4], yy, [z + i * (sh + gap), z + i * (sh + gap) + sh]));
      return out.join("");
    };
    const end = (sx) => {   // the end board at x = sx side, a hand hole cut through (a dark stadium), its edge
      const xx = sx < 0 ? [X[0], X[0] + t] : [X[1] - t, X[1]], out = [box(xx, [Y[0] + t, Y[1] - t], [z, z + h])];
      if (sx > 0 && kS * h > 30) {
        const xs = X[1] + 0.02, hole = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, c = Math.cos(a); hole.push([xs, y + c * d * 0.18 + Math.sign(c) * d * 0.05, z + h * 0.8 + Math.sin(a) * h * 0.06]); }
        out.push(B.poly(P, hole, "#3c2a14", "#6e4a1e", 0.6, ' fill-opacity=".8"'));
        out.push(K.dotsSvg([[xs, Y[0] + d * 0.12, z + h * 0.15], [xs, Y[1] - d * 0.12, z + h * 0.15], [xs, Y[0] + d * 0.12, z + h * 0.55], [xs, Y[1] - d * 0.12, z + h * 0.55]].map((p) => K.iso(p, P)), { size: 0.4 }));
      }
      return out.join("");
    };
    const posts = (sy) => [X[0], X[1] - post].map((px) => box([px, px + post], sy < 0 ? [Y[0], Y[0] + post] : [Y[1] - post, Y[1]], [z, z + h + 0.4])).join("");
    const floor = [0, 1, 2, 3].map((i) => box([X[0] + t, X[1] - t], [Y[0] + t + i * (d - 2 * t) / 4 + 0.3, Y[0] + t + (i + 1) * (d - 2 * t) / 4 - 0.3], [z, z + t * 0.8])).join("");
    let near = slats(1);
    if (label && kS * h > 40) near += B.front(P, [x - w * 0.14, Y[1] + 0.02, z + h * 0.62], `<rect width="${w * 0.28}" height="${h * 0.16}" rx=".4" fill="#f7f0de" stroke="#8a6a3a" stroke-width=".2"/>${B.text(w * 0.14, h * 0.115, label, h * 0.085, "#5a3e18")}`);
    return ISO.tinted(tint, posts(-1) + slats(-1) + end(-1) + floor) + inside + ISO.tinted(tint, posts(1) + near + end(1));
  };

  // ── a cardboard carton x0..x1 × y0..y1 × z0..z1 (cm): brown board, the top flaps' seam along x with tape over it and
  // down the near end, a printed arrow pair and a white label on the +y face (B36's carton look, any size)
  const CARD = ISO.tint("#ead2a6", ["#b98d52", "#c79c62", "#d3ab74", "#dfbc88"], "#6b4a1e");
  B.carton = (P, [x0, x1], [y0, y1], [z0, z1], { label = true } = {}) => {
    const out = [ISO.tinted(CARD, ISO.wbox(P, [x0, x1], [y0, y1], [z0, z1], "hi"))], ym = (y0 + y1) / 2, tw = Math.min(2.6, (y1 - y0) * 0.1), h = z1 - z0, w = x1 - x0;
    const kS = G.scaleOf(P);
    out.push(B.poly(P, [[x0, ym - tw, z1 + 0.02], [x1, ym - tw, z1 + 0.02], [x1, ym + tw, z1 + 0.02], [x0, ym + tw, z1 + 0.02]], "#cdb48a", "#8a6a3a", 0.4));
    out.push(B.poly(P, [[x1 + 0.02, ym - tw, z1], [x1 + 0.02, ym + tw, z1], [x1 + 0.02, ym + tw, z1 - h * 0.3], [x1 + 0.02, ym - tw, z1 - h * 0.3]], "#cdb48a", "#8a6a3a", 0.4));
    out.push(B.free(P, [[[x0, ym, z1 + 0.03], [x1, ym, z1 + 0.03]]], "#7a5a2e", 0.6));
    if (label && kS * h > 6) {
      const yf = y1 + 0.02, ar = (u) => [[[u, yf, z0 + h * 0.45], [u, yf, z0 + h * 0.78]], [[u - w * 0.03, yf, z0 + h * 0.66], [u, yf, z0 + h * 0.78], [u + w * 0.03, yf, z0 + h * 0.66]]];
      out.push(B.free(P, [...ar(x0 + w * 0.12), ...ar(x0 + w * 0.22)], "#5a3e18", 0.8, ' stroke-linejoin="round"'));
      out.push(B.poly(P, [[x0 + w * 0.55, yf, z0 + h * 0.3], [x0 + w * 0.88, yf, z0 + h * 0.3], [x0 + w * 0.88, yf, z0 + h * 0.62], [x0 + w * 0.55, yf, z0 + h * 0.62]], "#f6f2ea", "#8a7a5a", 0.5));
      out.push(B.free(P, [0.4, 0.5].map((f) => [[x0 + w * 0.59, yf + 0.01, z0 + h * f], [x0 + w * 0.84, yf + 0.01, z0 + h * f]]), "#9a8a6a", 0.5));
    }
    return out.join("");
  };

  // ── the shelf-edge label as flat artwork, w × h (cm, x right, y down): white card, the item line, the big price,
  // the price per kg in a box, a small code line; sale (0..1) slides a red strip with "SALE" down over its top
  B.ITEMS = { apples: ["apples", 1], bread: ["bread", 0.8], rice: ["rice", 2], milk: ["milk", 1], eggs: ["eggs", 0.7], tea: ["tea", 0.25], beans: ["beans", 0.4], cereal: ["cereal", 0.5], water: ["water", 1.5] };
  B.tagArt = (w, h, price, item, sale = 0, { per = true } = {}) => {
    const [word, kg] = B.ITEMS[item] || B.ITEMS.apples, s = [];
    s.push(`<rect width="${w}" height="${h}" rx="${h * 0.04}" fill="#fdfdf8" stroke="#8a8a80" stroke-width="${h * 0.012}"/>`);
    s.push(B.text(w * 0.05, h * 0.37, word, h * 0.15, "#2a2f36", "start", 700));
    s.push(B.text(w * 0.05, h * 0.49, `${kg} kg`, h * 0.09, "#5a6068", "start", 600));
    s.push(B.text(w * 0.95, h * 0.8, price.toFixed(2), h * 0.4, "#1b1f24", "end", 800));
    if (per) {
      s.push(`<rect x="${w * 0.05}" y="${h * 0.56}" width="${w * 0.3}" height="${h * 0.26}" fill="none" stroke="#5a6068" stroke-width="${h * 0.012}"/>`);
      s.push(B.text(w * 0.2, h * 0.68, (price / kg).toFixed(2), h * 0.11, "#2a2f36", "middle", 700), B.text(w * 0.2, h * 0.79, "per kg", h * 0.08, "#5a6068", "middle", 600));
    }
    // a printed bar of code lines along the bottom edge
    const bars = []; for (let i = 0; i < 18; i++) bars.push(`M${(w * 0.05 + i * w * 0.012 + ((i * 7) % 3) * w * 0.002).toFixed(3)} ${h * 0.86}v${h * 0.08}`);
    s.push(`<path d="${bars.join("")}" stroke="#2a2f36" stroke-width="${w * 0.004}"/>`);
    return s.join("") + B.saleArt(w, h, sale);
  };
  B.saleArt = (w, h, sale) => {
    if (sale <= 0.001) return "";
    const sh = h * 0.21 * sale;
    return `<rect y="0" width="${w}" height="${sh.toFixed(3)}" fill="#d83a2a"/>` + (sale > 0.6 ? `<g opacity="${((sale - 0.6) / 0.4).toFixed(2)}">${B.text(w / 2, sh - h * 0.045, "SALE", h * 0.14, "#ffffff", "middle", 800)}</g>` : "");
  };
})();
