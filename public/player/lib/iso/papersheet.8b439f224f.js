// "papersheet cx cy k axis=0|1 pins=0|1 lab=0 lit=paper|axis|pins" — a PART (PARTS.md, batch 5): a sheet of white A4
// paper (29.7 × 21 cm, long side along x) lying on the bench, its origin the middle of the sheet on the surface. The
// optics benches (curvedmirror, refraction) draw rays on it: axis=1 rules the principal axis in pencil along x through
// the middle, dashed, with a centimetre scale either side of the centre (5 cm ticks longer) and a cross at the centre;
// pins=1 holds it down with four brass drawing pins 1.5 cm in from the corners. The sheet's edge shows its 0.1 mm
// thickness as a hairline. Static. Anchors middle (the centre cross), left and right (the axis's ends). 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const W = 29.7, Dp = 21, H = 0.03, AX = 13.5;
  const PAPER = ISO.tint("#ffffff", ["#d9dcdf", "#e3e5e8", "#eceef0", "#f4f5f6"], "#8a9098");

  function sheetSvg(P, axis, pins, lab) {
    const plan = { x: -W / 2, y: -Dp / 2, w: W, d: Dp, r: 0.08 }, z = H + 0.002, at = (x, y) => K.iso([x, y, z], P), out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, H, P)}"/>`);
    out.push(`<g data-name="paper">${ISO.tinted(PAPER, S(K.slabOf(plan, 0, H, P, 2), { tone: "hi", crease: "none" }))}`);
    // a faint pencilled margin line down the left side, as a student's sheet has
    out.push(`<path d="${K.pathOf([at(-W / 2 + 2.5, -Dp / 2 + 0.4), at(-W / 2 + 2.5, Dp / 2 - 0.4)])}" stroke="#e7a9a9" stroke-width="0.6" fill="none"/></g>`);
    if (axis) {
      // the principal axis, ruled dashed in pencil, a cm scale hanging off it toward +y, a small cross at the centre
      const minor = [], major = [];
      for (let x = -AX; x <= AX + 1e-9; x += 1) { if (!Math.round(x)) continue; (Math.round(x) % 5 ? minor : major).push(K.segment([x, 0, z], [x, Math.round(x) % 5 ? 0.25 : 0.5, z], P)); }
      out.push(`<g data-name="axis">${L(K.segment([-AX - 0.6, 0, z], [AX + 0.6, 0, z], P), { tone: "lo", dashed: true, free: true })}` +
        L(minor.join(""), { tone: "faint", free: true }) + L(major.join(""), { tone: "lo", free: true }) +
        L(K.segment([0, -0.5, z], [0, 0.5, z], P) + K.segment([-0.5, 0, z], [0.5, 0, z], P), { tone: "mid", free: true }) +
        [-10, -5, 5, 10].map((x) => LAB.faceText(P, [x, 0.95, z], [1, 0, 0], String(Math.abs(x)), 0.45, "#6d737a", [0, -1, 0])).join("") + "</g>");
    }
    if (pins) {
      // a drawing pin: its point is through the sheet; a brass cap 1.1 cm across, domed, with a rolled rim
      const pin = (x, y) => { const F = G.frameOf([x, y, H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
        return ISO.tinted(ISO.T.brass, S(G.disc(0, 0.08, 0.55, F, P), { tone: "mid" }) + S(G.lathe([[0.08, 0.5], [0.12, 0.42, 1], [0.17, 0.2, 1], [0.18, 0]], F, P), { tone: "hi" })); };
      out.push(`<g data-name="pins">${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => pin(sx * (W / 2 - 1.5), sy * (Dp / 2 - 1.5))).join("")}</g>`);
    }
    if (lab) out.push(CIRC.word(P, [W / 2, Dp / 2, 0.5], "sheet of paper"), axis ? CIRC.word(P, [AX + 0.8, 0, 0.5], "principal axis") : "");
    return out.join("");
  }

  ISO.add({
    name: "papersheet", title: "Sheet of paper (part)", compare: null,
    about: "A white A4 sheet lying on the bench (long side along x), the principal axis ruled in pencil through its middle with a cm scale, held by four drawing pins; ray boxes, mirrors and blocks stand on it. anchors: middle left right",
    line: "papersheet cx cy k axis=0|1 pins=0|1 lab=0 lit=paper|axis|pins",
    demo: { line: "papersheet 480 290 21 axis=1 pins=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "axis" }, hold: 1.4 }, { set: { lit: "pins" }, hold: 1.4 }, { set: { lit: "paper" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const axis = o.axis !== "0", pins = o.pins !== "0";
      g.innerHTML = sheetSvg(P, axis, pins, lab);
      g.anchors = { middle: [0, 0, H], left: [-AX, 0, H], right: [AX, 0, H] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `A4 sheet 29.7 × 21 cm${axis ? " · principal axis ruled along its middle, cm scale" : ""}${pins ? " · four drawing pins" : ""}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
