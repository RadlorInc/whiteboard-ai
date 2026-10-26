// Shared bits for batch 46 (bank and vault parts: note bundle, note band, coin roll, home safe, vault door, gold bar,
// deposit box, coin sorter, note counter, paying-in slip, teller window, deposit bag). Not a recipe: it only defines
// window.B46, which those parts call at make time. The banknote artwork, flat planes, seven-segment digits and number
// cleaners come from the batch 41 money helpers (window.B41, looked up at make time). Money is generic: plain numbers,
// no currency signs, no faces, no real bank or brand. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B = (window.B46 = {});
  let uid = 0;
  B.id = () => `b46c${uid++}`;
  B.add = (a, b, f = 1) => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f];
  B.say = (t) => ISO.esc(ISO.say(t));
  B.parts = (g) => Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
  B.word = (P, p, text, { color = "#556", anchor = "start", size = 13, dx = 8 } = {}) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], text, color, { anchor, size }); };
  // printed words on a world plane (built-in English, through the label helper's translator)
  B.face = (P, p, u, up, text, size, color = "#2b3440") => LAB.faceText(P, p, u, B.say(text), size, color, up);
  // a closed outline through world points; an open printed stroke (data-free: print, not an edge)
  B.quad = (P, pts, fill, ink = "none", w = 0.6, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"${extra}/>`;
  B.free = (P, segs, ink, w = 0.5, extra = "") => `<path data-free d="${segs.map((s) => K.pathOf(s.map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="${ink}" stroke-width="${w}"${extra}/>`;
  B.box = (P, x, y, z, c = "", tone = "mid") => ISO.tinted(c, ISO.wbox(P, x, y, z, tone));
  B.obox = (P, at, us, ws, ys, c = "", tone = "mid") => ISO.tinted(c, ISO.box(at, P, us, ws, ys, tone));
  B.cyl = (P, x, y, r, z, h, c = "", tone = "mid", steps = 28) => ISO.tinted(c, S(K.cylinder(x, y, r, z, h, P, steps), { tone }));
  // a frame function for ISO.box: world = o + U·u + W·w + V·y
  B.frame = (o, U, W, V) => (u, w, y) => [0, 1, 2].map((i) => o[i] + U[i] * u + W[i] * w + V[i] * y);

  B.PAPER = ISO.tint("#f6f1e2", ["#cfc6ad", "#dad2bb", "#e5dec9", "#efe9d8"], "#6b6248");
  B.KRAFT = ISO.tint("#ead7b0", ["#b8996a", "#c6a87a", "#d3b78c", "#dfc59e"], "#5e4a26");
  B.STEEL = ISO.tint("#c9cdd2", ["#7d838b", "#8f959c", "#a2a7ad", "#b5b9be"], "#2f343a");
  B.DARK = ISO.tint("#5a6068", ["#2a2e33", "#33373d", "#3d4248", "#484d54"], "#121417");
  B.GOLD = ISO.tint("#f7dc8a", ["#b8892a", "#c99b38", "#d9ae4c", "#e8c466"], "#6b4a0c");
  B.GREY = ISO.tint("#e3e5e8", ["#a3a8ae", "#b3b7bd", "#c3c7cc", "#d3d6da"], "#4a5058");
  // the side tint of a stack of notes of this value (the note's own paper colour)
  B.noteTint = (value) => { const [bg, mid, ink] = window.B41.NOTE[window.B41.noteColour(value)]; return ISO.tint(bg, [window.B41.mix(bg, mid, 0.55), window.B41.mix(bg, mid, 0.4), window.B41.mix(bg, mid, 0.25), window.B41.mix(bg, mid, 0.12)], ink); };

  // ── a stack of n notes lying flat, w × d cm, its bottom middle at [x, y, z]; each note 0.012 cm. The top note's
  // artwork on top (art=false: plain colour, for small stacks far away), paper edge lines along the two seen sides.
  B.NOTE_T = 0.012;
  // m(a, b, c): a along the notes' length, b across, c up; alongY lays them along y (a → +y, b → +x)
  const mapOf = ([x, y, z], alongY) => (alongY ? (a, b, c) => [x + b, y + a, z + c] : (a, b, c) => [x + a, y + b, z + c]);
  const mbox = (P, m, [a0, a1], [b0, b1], [c0, c1], tint, tone) => B.obox(P, (u, w, v) => m(u, v, w), [a0, a1], [c0, c1], [b0, b1], tint, tone);
  B.stack = (P, p, n, value = 20, { w = 15, d = 7, art = true, alongY = false } = {}) => {
    if (n <= 0) return "";
    const m = mapOf(p, alongY), h = Math.max(0.02, n * B.NOTE_T), hw = w / 2, hd = d / 2, T = B.noteTint(value), ink = window.B41.NOTE[window.B41.noteColour(value)][2];
    let s = mbox(P, m, [-hw, hw], [-hd, hd], [0, h], T, "lo");
    const kS = G.scaleOf(P), U = alongY ? [0, -1, 0] : [1, 0, 0], V = alongY ? [1, 0, 0] : [0, 1, 0];
    if (art && kS * w > 40) s += `<g transform="${window.B41.plane(P, m(alongY ? hw : -hw, -hd, h + 0.002), U.map((q) => (q * w) / 15), V.map((q) => (q * d) / 7))}">${window.B41.note(15, 7, value)}</g>`;
    // paper edges: a few faint lines across the two seen sides (the notes' layers), each from corner to corner
    const rows = Math.min(6, Math.floor((kS * h) / 2.5));
    if (rows > 0) {
      const segs = [];
      for (let i = 1; i <= rows; i++) { const c = (h * i) / (rows + 1); segs.push([m(-hw, hd + 0.003, c), m(hw, hd + 0.003, c)], [m(hw + 0.003, -hd, c), m(hw + 0.003, hd, c)]); }
      s += B.free(P, segs, ink, 0.4, ' opacity=".35"');
    }
    return s;
  };
  // the paper band round a bundle: a loop w wide (along the notes' length) round a d-deep, h-tall stack, middle at p;
  // its printed amount on top. Drawn as the far wall, the bottom, the top strip and the near wall, so an empty loop is
  // hollow.
  B.band = (P, p, h, { w = 3.5, d = 7, t = 0.03, words = ["100", ""], tint = B.KRAFT, alongY = false } = {}) => {
    const m = mapOf(p, alongY), hw = w / 2, b0 = -d / 2 - t, b1 = d / 2 + t, X = [-hw, hw];
    let s = mbox(P, m, X, [b0, b0 + t], [0, h + t], tint, "lo") + mbox(P, m, X, [b0, b1], [0, 0.01], tint, "lo") + mbox(P, m, X, [b0, b1], [h, h + t], tint, "mid") + mbox(P, m, X, [b1 - t, b1], [0, h + t], tint, "lo");
    const kS = G.scaleOf(P), ct = h + t + 0.003, U = alongY ? [0, -1, 0] : [1, 0, 0], UP = alongY ? [-1, 0, 0] : [0, -1, 0];
    if (kS * w > 14) {
      // two printed rules across the strip, the amount between them (reads from the room side)
      s += B.free(P, [[m(-hw, -d * 0.36, ct), m(hw, -d * 0.36, ct)], [m(-hw, d * 0.36, ct), m(hw, d * 0.36, ct)]], "#7a5a2e", 0.5, ' opacity=".7"');
      s += B.face(P, m(0, -d * 0.05, ct), U, UP, words[0], Math.min(w * 0.42, 1.6), "#5a3d16");
      if (words[1]) s += B.face(P, m(0, d * 0.22, ct), U, UP, words[1], Math.min(w * 0.2, 0.7), "#5a3d16");
    }
    return s;
  };
  // a whole banded bundle of n notes (100 by default), lying along x (or y), bottom middle at p
  B.bundle = (P, p, { n = 100, value = 20, art = true, w = 15, d = 7, alongY = false } = {}) =>
    B.stack(P, p, n, value, { w, d, art, alongY }) + B.band(P, p, Math.max(0.02, n * B.NOTE_T), { w: w * 0.23, d, alongY, words: [String(n), `× ${value}`] });

  // ── a cast gold bar, bottom L × W, top smaller, H tall, bottom middle at [x, y, z], along x (or y when alongY)
  B.bar = (P, [x, y, z], { L = 25, W = 8, H = 4, alongY = false, detail = false, serial = "04172" } = {}) => {
    const tl = L * 0.86, tw = W * 0.72, f = alongY ? (a, b, c) => [x + b, y + a, z + c] : (a, b, c) => [x + a, y + b, z + c];
    const V = [[-L / 2, -W / 2, 0], [L / 2, -W / 2, 0], [L / 2, W / 2, 0], [-L / 2, W / 2, 0], [-tl / 2, -tw / 2, H], [tl / 2, -tw / 2, H], [tl / 2, tw / 2, H], [-tl / 2, tw / 2, H]].map(([a, b, c]) => f(a, b, c));
    let s = ISO.tinted(B.GOLD, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"));
    if (detail && G.scaleOf(P) * L > 60) {
      // the stamp: a sunk rectangle with the fineness, the weight and the bar's number, read from the room side
      const zt = H + 0.004, u = alongY ? [0, -1, 0] : [1, 0, 0], up = alongY ? [-1, 0, 0] : [0, -1, 0];
      s += B.quad(P, [f(-tl * 0.4, -tw * 0.36, zt), f(tl * 0.4, -tw * 0.36, zt), f(tl * 0.4, tw * 0.36, zt), f(-tl * 0.4, tw * 0.36, zt)], "#e2bd5c", "#8a6514", 0.6);
      s += B.face(P, f(0, -tw * 0.12, zt), u, up, "999.9", tw * 0.24, "#6b4a0c") + B.face(P, f(-tl * 0.2, tw * 0.22, zt), u, up, "12.5 kg", tw * 0.16, "#6b4a0c") + B.face(P, f(tl * 0.2, tw * 0.22, zt), u, up, `No ${serial}`, tw * 0.16, "#6b4a0c");
    }
    return s;
  };

  // ── a pile of coins standing in a column (a tube, a roll): radius r, from z0, height h, coin 0.2 cm thick; the
  // milled edge as ribs, a ring at each few coins, the top coin's face.
  B.coinPile = (P, x, y, r, z0, h, tint = ISO.T.brass, ink = "#6b5114") => {
    if (h <= 0.01) return "";
    const F = LAB.Z([x, y, z0]), kS = G.scaleOf(P), n = Math.max(1, Math.round(h / 0.2));
    const step = kS * 0.2 > 2.2 ? 1 : Math.ceil(2.2 / (kS * 0.2));
    const rings = [];
    for (let i = step; i < n; i += step) rings.push(K.sideArc(x, y, r, z0 + (i * h) / n, P, 24));
    let s = ISO.tinted(tint, S(G.disc(0, h, r, F, P), { tone: "mid", inner: (rings.length ? L(rings.join(""), { tone: "lo" }) : "") }));
    if (kS * r > 4) s += `<path d="${G.circleOf(F, h + 0.002, r * 0.82, P)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity=".6"/>`;
    return s;
  };

  // ── seven-segment digits (the batch 41 ones)
  B.digits = (x, y, str, h, on, ghost, n) => window.B41.seg(x, y, str, h, on, ghost, n);
})();
