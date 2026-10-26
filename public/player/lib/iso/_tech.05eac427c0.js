// Shared parts for the tech recipes (phones, computers, drives, chips, audio). Not a recipe: it only defines
// window.TECH, which the tech recipe files call at make time. World units are millimetres unless a file says, z up.
(() => {
  const K = window.K;
  const T = (window.TECH = {});
  T.S = (p, s) => K.solidSvg(p, s);
  T.L = (d, s) => K.lineSvg(d, s);
  T.D = (p, s) => K.dotsSvg(p, s);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  T.add = add; T.mul = mul;

  // ── tints for electronics: colour means a material here (board green, gold contacts, black epoxy, LEDs)
  const tint = ISO.tint;
  T.C = {
    alu: tint("#eceef1", ["#a9aeb5", "#bcc0c6", "#cdd1d6", "#dde0e4"], "#4a5058"),
    dark: tint("#4a4f57", ["#262a30", "#2f343a", "#383d44", "#41464d"], "#101215"),
    black: ISO.T.plastic,
    pcb: tint("#cfe6c9", ["#6f9e66", "#80ad77", "#93bb8a", "#a8c99f"], "#1f4a1a"),
    pcbDark: tint("#5f8f57", ["#2f5a29", "#386632", "#41723a", "#4c7f45"], "#14300f"),
    chip: tint("#3b3f45", ["#1c1f23", "#24272c", "#2c3035", "#34383e"], "#0a0b0d"),
    gold: tint("#f6e3a6", ["#c69b3a", "#d4ad4e", "#e0bf66", "#ebcf82"], "#6b4f0e"),
    steel: ISO.T.steel,
    copper: ISO.T.copper,
    glass: ISO.T.glass,
    rubber: ISO.T.rubber,
    white: tint("#fbfbf9", ["#cfd2d6", "#dcdfe2", "#e7e9eb", "#f1f2f3"], "#5a6068"),
    blue: ISO.T.blue,
    red: ISO.T.red,
    amber: ISO.T.amber,
    green: ISO.T.green,
    magnet: tint("#8e949c", ["#4e535a", "#5a6067", "#676d74", "#757b82"], "#1f2226"),
    battery: tint("#e9e6df", ["#a9a39a", "#b9b3aa", "#c8c3bb", "#d8d4cd"], "#4a453d"),
    paper: tint("#f4ead6", ["#c9b48e", "#d5c29f", "#e0cfb1", "#eadcc4"], "#6b5530"),
  };
  T.LED = { green: "#3cc45a", amber: "#f0a020", blue: "#2f8fe8", red: "#e0463a", off: "#5a5f66" };

  // A box in world coordinates (x, y, z spans), tinted.
  T.box = (P, x, y, z, tone = "mid", c = "", lit = false) => ISO.tinted(c, ISO.wbox(P, x, y, z, tone, lit));
  // A rounded slab (plan {x,y,w,d,r}) from z to z + h, tinted.
  T.slab = (P, plan, z, h, tone = "mid", c = "", steps = 6, bevel = 0, inner = "") => ISO.tinted(c, T.S(K.slabOf(plan, z, h, P, steps, bevel), { tone, inner }));
  T.cyl = (P, x, y, r, z, h, tone = "mid", c = "", steps = 28) => ISO.tinted(c, T.S(K.cylinder(x, y, r, z, h, P, steps), { tone }));
  // A frame for ISO.box: world point = o + u·U + w·W + y·V (U, W, V need not be axis-aligned: a tilted lid, a turned arm).
  T.frame = (o, U, W, V) => (u, w, y) => add(o, add(mul(U, u), add(mul(W, w), mul(V, y))));
  T.obox = (P, at, us, ws, ys, tone = "mid", c = "", lit = false) => ISO.tinted(c, ISO.box(at, P, us, ws, ys, tone, lit));
  // An SVG transform that draws flat artwork (x right along U, y down along V, in world units) at world point o.
  T.mat = (P, o, U, V) => {
    const a = K.iso(o, P), b = K.iso(add(o, U), P), c = K.iso(add(o, V), P);
    return `matrix(${(b[0] - a[0]).toFixed(4)} ${(b[1] - a[1]).toFixed(4)} ${(c[0] - a[0]).toFixed(4)} ${(c[1] - a[1]).toFixed(4)} ${a[0].toFixed(2)} ${a[1].toFixed(2)})`;
  };
  // A flat convex plate cut from a sheet lying in x–y (an arm, a bracket, a magnet), from z0 to z1.
  T.plate = (P, pts, z0, z1, tone = "mid", c = "", lit = false) => {
    const n = pts.length, V = [...pts.map(([x, y]) => [x, y, z0]), ...pts.map(([x, y]) => [x, y, z1])];
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n), ...pts.map((_, i) => [i, (i + 1) % n, ((i + 1) % n) + n, i + n])];
    return ISO.tinted(c, ISO.poly(V, F, P, tone, lit));
  };
  T.flat =(P, o, U, V, svg) => `<g transform="${T.mat(P, o, U, V)}">${svg}</g>`;
  // A closed outline through world points (a slot, a window, a screen edge) with fill and stroke.
  T.quad = (P, pts, fill, stroke = "none", w = 0.6, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"${extra}/>`;
  T.dot = (P, pts, size = 0.45, tone = "mid") => T.D(pts.map((p) => K.iso(p, P)), { size, tone });
  // A label next to a world point, in plain words.
  T.word = (P, p, text, { color = "#444", anchor = "middle", size = 13, dx = 0, dy = 0 } = {}) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], text, color, { anchor, size, dy }); };
  // Lines of code on a screen (flat coordinates, width w, row gap gap): coloured strokes, each a free printed line.
  T.code = (x, y, w, rows, gap, sw) => {
    const cols = ["#9fe0a0", "#ffd84a", "#7fd0ff", "#f7a094"], ind = [0, 1, 1, 2, 2, 1, 0, 1], len = [0.55, 0.7, 0.45, 0.6, 0.35, 0.5, 0.4, 0.62];
    let s = "";
    for (let i = 0; i < rows; i++) { const x0 = x + ind[i % 8] * w * 0.08; s += `<path data-free d="M${x0.toFixed(2)} ${(y + i * gap).toFixed(2)}H${(x0 + len[i % 8] * w).toFixed(2)}" stroke="${cols[i % 4]}" stroke-width="${sw}" stroke-linecap="round"/>`; }
    return s;
  };
  // Screen text: fitted, clipped to the window by the caller, in the machine's own type.
  T.text = (x, y, text, size, color = "#1f3b4d", anchor = "middle", weight = 700) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px 'Helvetica Neue',Arial,sans-serif">${text}</text>`;
  // Highlight: parts named in the `lit` list (data-name) get the lit look.
  T.lit = (g, o) => {
    const names = String(o.lit || "").split(/[|,]/).filter(Boolean);
    if (!names.length) return;
    for (const n of names) g.querySelectorAll(`[data-name="${n}"]`).forEach((e) => { e.classList.add("tc-lit"); e.querySelectorAll(".iso-solid").forEach((s) => s.setAttribute("data-lit", "")); });
  };
  T.uid = 0;
})();
