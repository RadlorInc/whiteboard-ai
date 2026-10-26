// Batch b08 helpers (PARTS.md, batch 5): bits the bell-jar and venturi parts share. Not a recipe: it only defines
// window.B08. World units here are mm (the parts build with ISO.mm); anchors stay in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B08 = (window.B08 = {});
  B08.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  B08.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  B08.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // a strong red moulded case and a cream enamel (the scene's pale ISO.T.red reads as pink at part size)
  B08.RED = ISO.tint("#e2604f", ["#a8302a", "#b83a32", "#c8463c", "#d65446"], "#5a1410");
  B08.CREAM = ISO.tint("#f4efe2", ["#cfc7b2", "#dbd4c1", "#e6e0cf", "#efeadc"], "#5f574a");
  B08.IRON = ISO.tint("#c4c6ca", ["#6f7379", "#7f838a", "#92969c", "#a6a9ae"], "#2b2e33");
  // see-through glass: a class on the group, its css once per part
  B08.glassCss = (cls, fill = 0.12, shade = 0.28) => `<style>.${cls} .iso-fill{fill-opacity:${fill}}.${cls} .iso-shade,.${cls} .iso-top{opacity:${shade}}</style>`;
  // Light every [data-name] in g that is named in lit ("a|b" or "a,b"); parts are looked up each time (rebuilt groups).
  B08.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // A screw terminal standing on a surface at [x, y, z]: an insulating boss, a brass stud, a hex nut and washer that
  // clamp the wire, a knurled cap nut in the terminal's colour on top. Returns { svg, top } (top = the cap's top, mm).
  B08.terminal = (P, [x, y, z], cap = ISO.T.plastic, { r = 6, boss = true } = {}) => {
    const out = [];
    let h = z;
    if (boss) { out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, y, r * 1.5, h, r * 0.45, P, 24, 0.4), { tone: "mid" }))); h += r * 0.45; }
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, r * 1.15, h, r * 0.2, P, 24), { tone: "hi" }) + S(K.cylinder(x, y, r, h + r * 0.2, r * 0.6, P, 6, 0.3), { tone: "hi" }) +
      S(K.cylinder(x, y, r * 0.42, h + r * 0.8, r * 0.5, P, 14), { tone: "mid", crease: "none" })));
    h += r * 1.3;
    out.push(ISO.tinted(cap, S(K.cylinder(x, y, r * 1.05, h, r * 1.2, P, 24), { tone: "hi" }) + L(K.knurl(x, y, r * 1.05, h, h + r * 1.2, 16, P, 0.02), { tone: "lo" })));
    return { svg: out.join(""), top: h + r * 1.2 };
  };
  // An insulated wire along world points: a dark sleeve with a coloured core, ends dotted (bright copper).
  B08.wire = (P, pts, color, r = 1.2) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = Math.max(0.8, G.scaleOf(P) * r * 2);
    return `<path d="${d}" fill="none" stroke="#1d1f22" stroke-width="${(w + 0.9).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      K.dotsSvg([K.iso(pts[0], P), K.iso(pts[pts.length - 1], P)], { size: 0.8, tone: "hi" });
  };
  // a flat slot-head screw head on a surface facing up (z) at [x, y, z]
  B08.screwHead = (P, [x, y, z], r = 3) => ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, r, z, r * 0.35, P, 16, 0.3), { tone: "hi" })) +
    `<path d="${K.segment([x - r * 0.75, y, z + r * 0.36], [x + r * 0.75, y, z + r * 0.36], P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(P) * r * 0.22).toFixed(2)}" stroke-linecap="butt"/>`;
})();
