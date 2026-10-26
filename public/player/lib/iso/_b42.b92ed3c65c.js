// Shared bits for batch 42 (paperwork and paying parts: contract, cheque book, invoice pad, payslip, tax form, stamp,
// pen, card terminal, tap reader, umbrella, house). Not a recipe: it only defines window.B42, which those parts call at
// make time. Money is generic: plain numbers, no currency signs, no real bank or brand. World: 1 = 1 cm.
(() => {
  const K = window.K;
  const B = (window.B42 = {});
  B.add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  B.mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  // built-in words go through the label helper's translator, then into markup
  B.say = (t) => ISO.esc(ISO.say(t));
  // flat text in a flat artwork's units (x right, y down)
  B.text = (x, y, t, size, color = "#2b3440", anchor = "start", weight = 700, font = "'Helvetica Neue',Arial,sans-serif") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${B.say(t)}</text>`;
  // numbers only (no translation needed), in a hand or a print face
  B.num = (x, y, t, size, color = "#2b3440", anchor = "start", weight = 700, font = "'Courier New',monospace") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${ISO.esc(t)}</text>`;
  B.HAND = "'Bradley Hand','Segoe Script','Comic Sans MS',cursive";
  B.light = (w, g, lit) => LAB.light(w, g, String(lit || "").replace(/\|/g, ","));
  B.val = (o, key, fallback, a, b) => ISO.clamp(ISO.num(o, key, fallback), a, b);
  // a set() number, or the old value when it is junk
  B.pick = (p, key, old, a, b) => (p[key] !== undefined && p[key] !== "" && Number.isFinite(+p[key]) ? ISO.clamp(+p[key], a, b) : old);
  B.smooth = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a || 1), 0, 1); return t * t * (3 - 2 * t); };
  // flat artwork (x right along U, y down along V, in world units) drawn at world point o
  B.mat = (P, o, U, V) => {
    const a = K.iso(o, P), b = K.iso(B.add(o, U), P), c = K.iso(B.add(o, V), P);
    return `matrix(${(b[0] - a[0]).toFixed(4)} ${(b[1] - a[1]).toFixed(4)} ${(c[0] - a[0]).toFixed(4)} ${(c[1] - a[1]).toFixed(4)} ${a[0].toFixed(2)} ${a[1].toFixed(2)})`;
  };
  B.flat = (P, o, U, V, svg, extra = "") => `<g transform="${B.mat(P, o, U, V)}"${extra}>${svg}</g>`;
  B.quad = (P, pts, fill, stroke = "none", w = 0.6, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"${extra}/>`;
  B.PAPER = ISO.tint("#ffffff", ["#cfd3d8", "#dadde1", "#e4e6e9", "#eef0f2"], "#7d848c");
  // a sheet (or a stack of sheets) lying flat: top-left corner (x0, y0), w along x, d along y, from z, h thick;
  // its printed face is the flat art (units cm, origin the sheet's top-left corner)
  B.sheet = (P, x0, y0, w, d, z, h, art = "", tint = B.PAPER, r = 0.06) =>
    ISO.tinted(tint, K.solidSvg(K.slabOf({ x: x0, y: y0, w, d, r }, z, h, P, 2), { tone: "hi", crease: "none" })) +
    (art ? B.flat(P, [x0, y0, z + h + 0.003], [1, 0, 0], [0, 1, 0], art) : "");
  // grey bars standing for lines of printed text (a contract clause, an address): n rows from (x, y), width w
  B.bars = (x, y, w, n, gap = 0.55, hgt = 0.18, color = "#9aa1a9", seed = 1) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const f = i === n - 1 && n > 1 ? 0.45 + ((seed * 7 + i * 3) % 4) * 0.08 : 0.86 + ((seed * 5 + i * 11) % 3) * 0.05;
      s += `<rect x="${x.toFixed(2)}" y="${(y + i * gap).toFixed(2)}" width="${(w * Math.min(1, f)).toFixed(2)}" height="${hgt}" rx="${(hgt / 2).toFixed(2)}" fill="${color}"/>`;
    }
    return s;
  };
  // a printed rule (a line to write on)
  B.rule = (x0, y, x1, color = "#55606b", w = 0.04) => `<path d="M${x0.toFixed(2)} ${y.toFixed(2)}H${x1.toFixed(2)}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
  // a signature in ink, w wide from (x, y) on its line; drawn up to frac 0..1 (pathLength 1 so the dash grows)
  B.signature = (x, y, w, color = "#1f3f8f", seed = 0) => {
    const h = w * 0.16, p = [`M${x.toFixed(2)} ${(y - h * 0.2).toFixed(2)}`];
    const n = 7 + (seed % 3);
    for (let i = 0; i < n; i++) {
      const x0 = x + (w * 0.75 * (i + 0.5)) / n, up = i % 2 ? 0.3 : 1 + ((seed + i) % 3) * 0.25;
      p.push(`C${(x0 - w * 0.03).toFixed(2)} ${(y - h * up * 1.4).toFixed(2)} ${(x0 + w * 0.05).toFixed(2)} ${(y - h * up * 1.2).toFixed(2)} ${(x0 + w * 0.02).toFixed(2)} ${(y - h * 0.1).toFixed(2)}`);
    }
    p.push(`C${(x + w * 0.8).toFixed(2)} ${(y + h * 0.3).toFixed(2)} ${(x + w * 0.9).toFixed(2)} ${(y - h * 0.4).toFixed(2)} ${(x + w).toFixed(2)} ${(y - h * 0.5).toFixed(2)}`);
    return `<path data-sig="" d="${p.join("")}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" fill="none" stroke="${color}" stroke-width="${(w * 0.012).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  // show a signature drawn to frac (0 none, 1 whole)
  B.sign = (w, el, frac) => { w.attr(el, "stroke-dashoffset", (1 - ISO.clamp(frac, 0, 1)).toFixed(3)); w.shown(el, frac > 0.002); };
  // a word stamped in red ink inside a rounded frame, centred on (x, y), its height h
  B.stampW = (word) => Math.max(3.2, String(word).length * 0.66 + 0.6);
  B.stampArt = (x, y, h, word = "PAID", color = "#c8322a") => {
    const fw = B.stampW(word) * h, f = (v) => v.toFixed(3);
    return `<g opacity=".88"><rect x="${f(x - fw / 2)}" y="${f(y - h * 0.6)}" width="${f(fw)}" height="${f(h * 1.2)}" rx="${f(h * 0.18)}" fill="none" stroke="${color}" stroke-width="${f(h * 0.09)}"/>` +
      `<rect x="${f(x - fw / 2 + h * 0.15)}" y="${f(y - h * 0.46)}" width="${f(fw - h * 0.3)}" height="${f(h * 0.92)}" rx="${f(h * 0.12)}" fill="none" stroke="${color}" stroke-width="${f(h * 0.035)}"/>` +
      B.text(x, y + h * 0.3, word, h * 0.82, color, "middle", 900, "'Arial Black','Helvetica Neue',Arial,sans-serif") + "</g>";
  };
  // a tick drawn in a circle, to frac
  B.tick = (x, y, r, color = "#2e9a4e") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${(r * 0.14).toFixed(3)}"/><path data-sig="" d="M${(x - r * 0.45).toFixed(2)} ${(y + r * 0.02).toFixed(2)}L${(x - r * 0.1).toFixed(2)} ${(y + r * 0.38).toFixed(2)}L${(x + r * 0.5).toFixed(2)} ${(y - r * 0.38).toFixed(2)}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" fill="none" stroke="${color}" stroke-width="${(r * 0.2).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round"/>`;
})();
