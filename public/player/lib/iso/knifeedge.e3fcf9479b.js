// "knifeedge cx cy k lab=0 lit=edge|stirrup|stops" — a PART (PARTS.md, batch 5): the pivot of moments.js, its origin
// the surface point under its middle (it stands on a stand's top or the bench). A steel base 5 × 3 cm, a hardened
// wedge along y whose sharp top edge is 2.6 cm up (where a metre rule standing on its edge balances, its 50 cm mark
// over the edge), and the stirrup: two cheeks either side of the rule (a 0.9 cm gap for a 0.6 cm rule), each a low
// wall screwed to the base with a horn at each end, the horns carrying two stop pins across the gap at x = ±2.1 cm, 5.9 cm up. A 2.8 cm rule tips until its top meets a
// pin: about 9° either way. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 2.5, HY = 1.5, BZ = 0.8, EZ = 2.6, GAP = 0.45, CT = 0.3, CZ = 6.2, PX = 2.1, PZ = 5.9, PR = 0.18;
  const HARD = ISO.tint("#d3d7dc", ["#7f848b", "#959aa1", "#aaaeb4", "#bec2c7"], "#2f3237");

  // a cheek in x–z: a low wall (the wedge's edge shows over it) with a horn at each end that carries a stop pin
  const LOW = 1.7, HW = 0.4, horn = (x) => Array.from({ length: 9 }, (_, i) => { const a = Math.PI - (i / 8) * Math.PI; return [x + Math.cos(a) * HW, CZ - HW + Math.sin(a) * HW]; });
  const cheekPts = [[-HX, BZ], ...horn(-PX), [-PX + HW, LOW], [PX - HW, LOW], ...horn(PX), [HX, BZ]];
  const cheek = (P, y0, y1) => ISO.prismY(P, cheekPts, y0, y1, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45");
  const pin = (P, x, y0, y1) => ISO.tinted(HARD, S(G.disc(y0, y1, PR, G.frameAlong([x, 0, PZ], [0, 1, 0]), P), { tone: "hi" }));
  const head = (P, x, y, s) => ISO.tinted(HARD, S(G.disc(0, 0.12, PR + 0.12, G.frameAlong([x, y, PZ], [0, s, 0]), P), { tone: "hi" }));
  const screw = (P, x, z) => ISO.tinted(ISO.T.steel, S(G.disc(0, 0.06, 0.2, G.frameAlong([x, GAP + CT, z], [0, 1, 0]), P), { tone: "hi" })) +
    `<path d="${K.segment([x - 0.15, GAP + CT + 0.065, z], [x + 0.15, GAP + CT + 0.065, z], P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(P) * 0.04).toFixed(2)}" data-free=""/>`;

  function edgeSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.2 }, 0, BZ, P)}"/>`];
    out.push(`<g data-name="stirrup">${ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.2 }, 0, BZ, P, 3, 0.06), { tone: "mid" }))}</g>`);
    out.push(`<g data-name="stops">${head(P, -PX, -GAP - CT, -1)}${head(P, PX, -GAP - CT, -1)}</g>`, `<g data-name="stirrup">${cheek(P, -GAP - CT, -GAP)}</g>`);
    // the wedge: a triangular prism along y between the cheeks, its sharp edge on top
    const W = 1.0, V = [[-W, -GAP, BZ], [W, -GAP, BZ], [0, -GAP, EZ], [-W, GAP, BZ], [W, GAP, BZ], [0, GAP, EZ]];
    out.push(`<g data-name="edge">${ISO.tinted(HARD, ISO.poly(V, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "hi", true))}</g>`);
    out.push(`<g data-name="stops">${pin(P, -PX, -GAP - CT, GAP + CT)}${pin(P, PX, -GAP - CT, GAP + CT)}</g>`);
    out.push(`<g data-name="stirrup">${cheek(P, GAP, GAP + CT)}${screw(P, -1.6, BZ + 0.5)}${screw(P, 1.6, BZ + 0.5)}</g>`);
    out.push(`<g data-name="stops">${head(P, -PX, GAP + CT, 1)}${head(P, PX, GAP + CT, 1)}</g>`);
    if (lab) out.push(window.LAB.word(P, lab, [HX, 0, EZ], "knife edge", "#556", { anchor: "start" }));
    return out.join("");
  }

  ISO.add({
    name: "knifeedge", title: "Knife-edge pivot in a stirrup (part)", compare: null,
    about: "A hardened steel wedge pivot (its sharp edge 2.6 cm up, along y) in a stirrup whose two cheeks hold stop pins: a metre rule balanced on the edge tips at most about 9° either way. anchors: edge",
    line: "knifeedge cx cy k lab=0 lit=edge|stirrup|stops",
    demo: { line: "knifeedge 480 380 50", script: [{ set: {}, hold: 1 }, { set: { lit: "edge" }, hold: 1.3 }, { set: { lit: "stops" }, hold: 1.2 }, { set: { lit: "stirrup" }, hold: 1.2 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = edgeSvg(P, lab);
      g.anchors = { edge: [0, 0, EZ] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `knife-edge pivot · edge ${EZ} cm up · the stop pins let a 2.8 cm rule tip about ${(Math.atan((PZ - PR - EZ - 2.8) / PX) * 180 / Math.PI).toFixed(0)}° either way`;
      B20.light(w, g, lit);
      return g;
    },
  });
})();
