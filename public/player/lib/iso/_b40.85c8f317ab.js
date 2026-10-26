// Shared bits for batch 40 (money parts: cash machine, card, wallet, purse, coins, notes, calculator, ledger, queue
// post, ticker screen, collection box). Not a recipe: it only defines window.B40, which those parts call at make time.
// Money here is generic: plain numbers, a leaf or a circle, no real currency design, no faces, no brands.
// World units are whatever P is (these parts pass the cm camera unless a file says).
(() => {
  const K = window.K, G = window.G;
  const B = (window.B40 = {});
  // built-in words go through the label helper's translator, then into markup
  B.say = (t) => ISO.esc(ISO.say(t));
  // flat text in a flat artwork's units (x right, y down)
  B.text = (x, y, t, size, color = "#1f3b4d", anchor = "middle", weight = 700, font = "'Helvetica Neue',Arial,sans-serif") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${B.say(t)}</text>`;
  // a dashed stitch line between world points (a printed or sewn line that stops where it stops)
  B.stitch = (P, pts, color = "#3a2414", w = 0.6, dash = "1.6 1.2") =>
    `<path data-free d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
  B.COIN = { gold: ISO.T.brass, silver: ISO.T.steel };
  // one coin lying flat, its bottom face at z: a reeded edge, a raised rim and a plain "1" (no real design)
  B.coin = (P, [x, y, z], r, h, metal = "gold", face = true, ribs = 36) => {
    const F = LAB.Z([x, y, z]), tint = B.COIN[metal] || B.COIN.gold, ink = metal === "silver" ? "#3c3f45" : "#6b5114";
    let s = K.solidSvg(G.disc(0, h, r, F, P), { tone: "mid", inner: ribs ? K.lineSvg(G.ribsOf(F, 0, h, r, ribs, P, { seams: true }), { tone: "faint" }) : "" });
    if (face && G.scaleOf(P) * r > 3) {
      s += `<path d="${G.circleOf(F, h + 0.002, r * 0.82, P)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity=".7"/>`;
      if (G.scaleOf(P) * r > 9) s += LAB.faceText(P, [x, y + r * 0.28, z + h + 0.003], [1, 0, 0], "1", r * 0.9, ink, [0, -1, 0]);
    }
    return ISO.tinted(tint, s);
  };
  // a generic banknote as flat artwork, w × h in its own units: border, a round watermark, a leaf, the value twice
  B.NOTE = { green: ["#dcebd2", "#5f8a4a", "#2f5a22"], blue: ["#d8e4f2", "#5a7fa8", "#25476f"], violet: ["#e6dcef", "#8a6aa8", "#4a2f6b"], amber: ["#f2e6cc", "#b08a3a", "#6b5114"] };
  B.note = (w, h, value = "10", c = "green") => {
    const [bg, mid, ink] = B.NOTE[c] || B.NOTE.green, m = h * 0.08, s = [];
    s.push(`<rect width="${w}" height="${h}" rx="${h * 0.03}" fill="${bg}" stroke="${ink}" stroke-width="${h * 0.012}"/>`);
    s.push(`<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="none" stroke="${mid}" stroke-width="${h * 0.02}"/>`);
    // fine wavy guilloche lines across the middle band, each from border to border
    for (let i = 0; i < 4; i++) {
      const y0 = h * (0.34 + i * 0.1), pts = [];
      for (let j = 0; j <= 16; j++) { const x = m + ((w - 2 * m) * j) / 16; pts.push(`${x.toFixed(2)} ${(y0 + Math.sin(j * 1.3 + i) * h * 0.025).toFixed(2)}`); }
      s.push(`<path data-free d="M${pts.join("L")}" fill="none" stroke="${mid}" stroke-width="${h * 0.008}" opacity=".6"/>`);
    }
    s.push(`<circle cx="${w * 0.72}" cy="${h / 2}" r="${h * 0.24}" fill="${bg}" stroke="${mid}" stroke-width="${h * 0.015}"/>`);
    s.push(`<path d="M${w * 0.72} ${h * 0.32}C${w * 0.79} ${h * 0.42} ${w * 0.77} ${h * 0.6} ${w * 0.72} ${h * 0.68}C${w * 0.67} ${h * 0.6} ${w * 0.65} ${h * 0.42} ${w * 0.72} ${h * 0.32}Z" fill="${mid}" opacity=".55"/>`);
    s.push(B.text(m * 1.6, h * 0.3, value, h * 0.2, ink, "start", 800), B.text(w - m * 1.6, h - m * 1.6, value, h * 0.16, ink, "end", 800));
    return s.join("");
  };
  // words printed on a face: at world point p, along unit u, with up the face's up; translated and escaped
  B.face = (P, p, u, up, text, size, color, { anchor = "middle", font = "'Helvetica Neue',Arial,sans-serif", weight = 700 } = {}) =>
    LAB.faceText(P, p, u, B.say(text), size, color, up).replace(`style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif"`, `style="font:${weight} ${size}px ${font}"`).replace('text-anchor="middle"', `text-anchor="${anchor}"`);
  B.light = (w, g, lit) => LAB.light(w, g, String(lit || "").replace(/\|/g, ","));
  // a value always inside [a, b], numbers only
  B.num = (o, key, fallback, a, b) => ISO.clamp(ISO.num(o, key, fallback), a, b);
})();
