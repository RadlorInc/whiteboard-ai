// "watchcradle cx cy k lab=0 lit=base|blocks|felt" — a PART (PARTS.md, batch 5): the display cradle of stopwatch.js
// that holds a stopwatch upright. A walnut base 8 × 4 cm on four cork pads with a small brass plate on its front, and
// two blocks whose tops are cut to one curve (radius 2.8 cm, lined with green felt), the seat a 5.5 cm watch's rim
// rests in. 8 × 4 × 3 cm; origin the surface under its middle. Static.
// anchors: seat (where a handstopwatch aim=up stands: its rim's lowest point) top. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RS = 2.8, ZC = 4.05, HB = 0.8, BX = [1.0, 2.6], BY = 1.4, WATCH = 2.75;
  const WALNUT = ISO.tint("#d9b996", ["#8a5d3b", "#9a6b47", "#ab7c56", "#bb8e68"], "#3e2412");
  const seatZ = (x) => ZC - Math.sqrt(RS * RS - x * x);
  // a block in x–z: flat bottom on the base, outer side straight up, its top following the seat's curve
  const blockPts = (sg) => { const pts = [[sg * BX[1], HB], [sg * BX[0], HB]]; for (let i = 0; i <= 10; i++) { const x = BX[0] + ((BX[1] - BX[0]) * i) / 10; pts.push([sg * x, seatZ(x)]); } return sg > 0 ? pts : pts.reverse(); };
  const block = (P, sg) => ISO.prismY(P, blockPts(sg), -BY, BY, ["#8a5d3b", "#bb8e68"], "#d9b996", "#3e2412");
  // the felt: a thin band along the seat's curve on each block, from the far face to the near face
  function felt(P, sg) {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const x = BX[0] + ((BX[1] - BX[0]) * i) / 10; pts.push([sg * x, seatZ(x) + 0.06]); }
    for (let i = 10; i >= 0; i--) { const x = BX[0] + ((BX[1] - BX[0]) * i) / 10; pts.push([sg * x, seatZ(x) - 0.01]); }
    return ISO.prismY(P, pts, -BY + 0.05, BY - 0.05, ["#2f4a2c", "#5c7d55"], "#4a6a44", "#1f331d");
  }

  ISO.add({
    name: "watchcradle", title: "Stopwatch cradle (part)", compare: null,
    about: "A small walnut display cradle 8 × 4 × 3 cm: a base and two felt-lined blocks cut to one curve, the seat a stopwatch stands upright in. anchors: seat top",
    line: "watchcradle cx cy k lab=0 lit=base|blocks|felt",
    demo: { line: "watchcradle 480 360 50 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "felt" }, hold: 1.2 }, { set: { lit: "blocks" }, hold: 1.2 }, { set: { lit: "base" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), B29 = window.B29;
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -4, y: -2, w: 8, d: 4, r: 0.3 }, 0, 0.2, P)}"/>`;
      const pads = ISO.tinted(ISO.T.amber, [[-3.4, -1.4], [2.6, -1.4], [-3.4, 0.9], [2.6, 0.9]].map(([x, y]) => ISO.wbox(P, [x, x + 0.8], [y, y + 0.5], [0, 0.12], "lo")).join(""));
      const base = ISO.prismX(P, [[-2, 0.12], [2, 0.12], [2, HB - 0.15], [1.85, HB], [-1.85, HB], [-2, HB - 0.15]], -4, 4, ["#8a5d3b", "#bb8e68"], "#d9b996", "#3e2412") +
        L(K.segment([-4, 2, 0.45], [4, 2, 0.45], P), { tone: "faint", free: true });
      const plate = ISO.tinted(ISO.T.brass, ISO.prismY(P, [[-1.3, 0.24], [1.3, 0.24], [1.3, 0.6], [-1.3, 0.6]], 2, 2.04, ["#c9a85a", "#eed8a0"], "#f6e7bf", "#6b5114")) +
        D([K.iso([-1.15, 2.05, 0.42], P), K.iso([1.15, 2.05, 0.42], P)], { size: 0.4 }) + window.LAB.faceText(P, [0, 2.05, 0.34], [1, 0, 0], "stopwatch", 0.2, "#6b5114");
      g.innerHTML = halo + `<g data-name="base">${ISO.tinted(WALNUT, pads + base)}${plate}</g>` +
        `<g data-name="blocks" style="${WALNUT}">${block(P, -1)}</g><g data-name="felt">${felt(P, -1)}</g><g data-name="blocks" style="${WALNUT}">${block(P, 1)}</g><g data-name="felt">${felt(P, 1)}</g>` +
        `<g data-part="words">${lab ? ISO.word(K.iso([4, 2, HB], P), "cradle", "#555", { size: 13, anchor: "start", dy: 10 }) : ""}</g>`;
      g.anchors = { seat: [0, 0, ZC - WATCH], top: [0, 0, seatZ(BX[1])] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B29.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "stopwatch cradle · a felt-lined seat holds a 5.5 cm watch upright, dial to the front";
      B29.light(w, g, lit);
      return g;
    },
  });
})();
