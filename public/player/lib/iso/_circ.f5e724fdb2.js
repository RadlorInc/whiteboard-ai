// Shared bits for the circuit parts (drycell, bulbholder, knifeswitch, dialmeter, wirelead). Not a recipe: it only
// defines window.CIRC, which those files call at make time. World units: 1 = 1 cm, z up (PARTS.md camera).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const C = (window.CIRC = {});
  // A binding post standing on a surface at [x, y, z]: a brass washer, a hex nut and a knurled cap (cap = its tint:
  // brass, or red / black for a meter's + and −). top = the cap's middle, where a crocodile clip bites.
  C.post = (P, [x, y, z], { r = 0.42, h = 0.95, cap = ISO.T.brass } = {}) => {
    const z1 = z + 0.34, hc = h - 0.34;
    const out = ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, r * 1.35, z, 0.06, P, 24), { tone: "mid" }) + S(K.cylinder(x, y, r * 1.05, z + 0.06, 0.28, P, 6), { tone: "mid" })) +
      ISO.tinted(cap, S(K.cylinder(x, y, r, z1, hc, P, 28), { tone: "mid", inner: L(K.knurl(x, y, r, z1, z1 + hc, 16, P, 0.01), { tone: "lo" }) })) +
      ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, r * 0.32, z + h, 0.08, P, 14), { tone: "mid" }));
    return { svg: out, top: [x, y, z + h + 0.08] };
  };
  // A steel screw head sunk flush on a surface at [x, y, z]: a short cylinder and its slot (cheaper than a domed lathe).
  C.screw = (P, [x, y, z], r = 0.13, turn = 0.6) => ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, r, z, r * 0.45, P, 14), { tone: "mid" })) +
    `<path d="${K.pathOf([[x - Math.cos(turn) * r * 0.75, y - Math.sin(turn) * r * 0.75, z + r * 0.46], [x + Math.cos(turn) * r * 0.75, y + Math.sin(turn) * r * 0.75, z + r * 0.46]].map((p) => K.iso(p, P)))}" stroke="#3c3f45" stroke-width="${Math.max(0.5, K.cameraOf(P).k * r * 0.22).toFixed(2)}"/>`;
  // A flat brass strip lying on a surface from a to b (plan points), w wide, at height z.
  C.strip = (P, [x0, y0], [x1, y1], z, w = 0.5) => ISO.tinted(ISO.T.brass, ISO.wbox(P, [Math.min(x0, x1) - (x0 === x1 ? w / 2 : 0), Math.max(x0, x1) + (x0 === x1 ? w / 2 : 0)], [Math.min(y0, y1) - (y0 === y1 ? w / 2 : 0), Math.max(y0, y1) + (y0 === y1 ? w / 2 : 0)], [z, z + 0.04], "mid"));
  // Lead colours: insulation, its ink (the tube's outline), and the boot of its crocodile clips.
  C.LEAD = { red: ["#d8402f", "#6e1a12"], black: ["#383b40", "#0c0d0f"], blue: ["#3478cc", "#123766"], green: ["#3e9e4c", "#154a1d"], yellow: ["#f2c230", "#7a5a08"] };
  C.leadTint = (c) => { const [col, ink] = C.LEAD[c] || C.LEAD.red; return ISO.tint(LAB.mix(col, "#ffffff", 0.3), [LAB.mix(col, "#000000", 0.25), LAB.mix(col, "#000000", 0.12), col, LAB.mix(col, "#ffffff", 0.15)], ink); };
  // A round insulated wire along screen points: outline, colour, a soft highlight along its top.
  C.tube = (d, w, [col, ink]) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(w * 0.28).toFixed(2)}" stroke-linecap="round" opacity=".35" transform="translate(${(-w * 0.12).toFixed(2)} ${(-w * 0.2).toFixed(2)})"/>`;
  // The usual lit= handling: a writer, the named groups, and draw(lit) to light one name.
  C.lighter = (g) => { const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")]; return (lit) => w.light(parts, parts.filter((p) => String(lit || "").split(/[|,]/).includes(p.dataset.name))); };
  // A word beside a world point, starting 6 px to its right (the parts' label style).
  C.word = (P, at, text) => ISO.word(K.iso(at, P), text, "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="6" x="');
})();
