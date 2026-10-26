// "imagesensor cx cy k lab=0 lit=plate|chip|glass|flex" — a PART (batch 6): camera.js's image sensor on its own, at
// real size, lying flat: a steel stabiliser plate 4 × 3 cm with three mounting ears (a screw in each), the sensor's
// ceramic package on it with its ring of gold bond pads, the chip (an APS-C size, 2.35 × 1.56 cm, its pixel area with
// the red, green and blue filter grid), the cover glass in its frame over it, and the amber flex cable leaving one
// side with its printed traces and the connector on its end. About 0.5 cm thick. Origin: the surface point under its
// middle. Static. World: 1 = 1 cm. anchors: face (the middle of the cover glass, where the light lands).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const T = window.TECH, ZP = 0.15, ZC = 0.4, ZG = 0.47, DW = 1.175, DH = 0.78;
  const CERAMIC = ISO.tint("#6d6a66", ["#3e3c39", "#474542", "#504e4b", "#5a5855"], "#1c1b1a");
  const FLEX = ISO.tint("#e9b04a", ["#b57a1c", "#c48a28", "#d29a36", "#dea845"], "#6b4408");

  function sensorSvg(P, lab) {
    const q = (pts, fill, stroke = "none", sw = 0.5, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra}/>`;
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -2.3, y: -1.7, w: 4.6, d: 5.2, r: 0.4 }, 0, 0.02, P)}"/>`];
    // the flex: from under the plate's front edge, down onto the surface and out to its connector
    let flex = ISO.tinted(FLEX, ISO.wbox(P, [-0.8, 0.8], [1.2, 1.5], [0, ZP], "mid") + ISO.wbox(P, [-0.8, 0.8], [1.5, 3.1], [0, 0.02], "hi"));
    flex += `<path d="${[-0.5, -0.25, 0, 0.25, 0.5].map((x) => K.pathOf([K.iso([x, 1.5, 0.021], P), K.iso([x, 2.8, 0.021], P)])).join("")}" stroke="#a06a12" stroke-width="0.5" data-free=""/>`;
    flex += ISO.tinted(T.C.black, ISO.wbox(P, [-0.95, 0.95], [2.8, 3.4], [0, 0.22], "mid"));
    flex += `<path d="${[-0.6, -0.3, 0, 0.3, 0.6].map((x) => K.pathOf([[x - 0.07, 3.401, 0.06], [x + 0.07, 3.401, 0.06], [x + 0.07, 3.401, 0.16], [x - 0.07, 3.401, 0.16]].map((p) => K.iso(p, P)), true)).join("")}" fill="#d4ad4e" stroke="#6b4f0e" stroke-width="0.25"/>`;
    out.push(`<g data-name="flex">${flex}</g>`);
    // the stabiliser plate with its three ears and their screws
    let plate = ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -2, y: -1.5, w: 4, d: 3, r: 0.25 }, 0, ZP, P, 4), { tone: "mid" }));
    for (const [x, y] of [[-2.25, -1.1], [2.25, -1.1], [2.25, 1.1]]) {
      plate += ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 0.32, 0, ZP, P, 18), { tone: "mid" }));
      plate += ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 0.18, ZP, 0.08, P, 14), { tone: "hi", inner: K.lineSvg(K.lineOnTop([x - 0.18, y], [x + 0.18, y], ZP + 0.08, P), { tone: "mid" }) }));
    }
    out.push(`<g data-name="plate">${plate}</g>`);
    // the ceramic package, its ring of bond pads, the chip with its pixel area and filter grid
    let chip = ISO.tinted(CERAMIC, S(K.slabOf({ x: -1.6, y: -1.2, w: 3.2, d: 2.4, r: 0.1 }, ZP, ZC - ZP, P, 3), { tone: "mid" }));
    const pads = [];
    for (let i = 0; i < 18; i++) { const x = -1.36 + i * 0.16; pads.push([x, -1.06], [x, 1.06]); }
    for (let i = 0; i < 12; i++) { const y = -0.88 + i * 0.16; pads.push([-1.46, y], [1.46, y]); }
    chip += `<path d="${pads.map(([x, y]) => K.pathOf([[x - 0.04, y - 0.04], [x + 0.04, y - 0.04], [x + 0.04, y + 0.04], [x - 0.04, y + 0.04]].map(([a, b]) => K.iso([a, b, ZC + 0.002], P)), true)).join("")}" fill="#e0bf66" stroke="#6b4f0e" stroke-width="0.25"/>`;
    chip += ISO.tinted(T.C.chip, ISO.wbox(P, [-DW - 0.08, DW + 0.08], [-DH - 0.08, DH + 0.08], [ZC, ZC + 0.03], "mid"));
    const cols = ["#6a3a4a", "#2f5a3c", "#2f5a3c", "#2e3f70"], cells = [[], [], [], []], N = 12, M = 8;
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const x0 = -DW + (2 * DW * i) / N, y0 = -DH + (2 * DH * j) / M, x1 = x0 + (2 * DW) / N, y1 = y0 + (2 * DH) / M;
      cells[(i % 2) + 2 * (j % 2)].push(K.pathOf([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([a, b]) => K.iso([a, b, ZC + 0.031], P)), true));
    }
    chip += cells.map((c, i) => `<path d="${c.join("")}" fill="${cols[i]}" stroke="#15121c" stroke-width="0.3"/>`).join("");
    out.push(`<g data-name="chip">${chip}</g>`);
    // the cover glass in its black frame, a soft highlight across it
    let glass = ISO.tinted(T.C.black, ISO.wbox(P, [-1.42, 1.42], [-1.0, -0.9], [ZC, ZG], "mid") + ISO.wbox(P, [-1.42, -1.3], [-0.9, 0.9], [ZC, ZG], "mid") + ISO.wbox(P, [1.3, 1.42], [-0.9, 0.9], [ZC, ZG], "mid") + ISO.wbox(P, [-1.42, 1.42], [0.9, 1.0], [ZC, ZG], "mid"));
    glass += q([[-1.3, -0.9, ZG + 0.002], [1.3, -0.9, ZG + 0.002], [1.3, 0.9, ZG + 0.002], [-1.3, 0.9, ZG + 0.002]], "#cfe0ea", "#5d7f96", 0.5, ' fill-opacity=".28"');
    glass += q([[-1.1, 0.75, ZG + 0.003], [-0.75, 0.75, ZG + 0.003], [0.3, -0.75, ZG + 0.003], [-0.05, -0.75, ZG + 0.003]], "#ffffff", "none", 0, ' fill-opacity=".35"');
    out.push(`<g data-name="glass">${glass}</g>`);
    if (lab) out.push(ISO.word(K.iso([2, 0, ZG + 0.3], P), "image sensor", "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="6" x="'));
    return out.join("");
  }

  ISO.add({
    name: "imagesensor", title: "Camera image sensor (part)", compare: null,
    about: "A camera image sensor lying flat: a glass-covered chip with its red-green-blue pixel grid on a ceramic package, on a steel stabiliser plate with three ears, an amber flex cable to its connector. anchors: face",
    line: "imagesensor cx cy k lab=0 lit=plate|chip|glass|flex",
    demo: { line: "imagesensor 480 300 56", script: [{ set: {}, hold: 1 }, { set: { lit: "chip" }, hold: 1.2 }, { set: { lit: "flex" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = sensorSvg(P, lab);
      g.anchors = { face: [0, 0, ZG] };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) B31.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => "image sensor · an APS-C chip, 2.35 × 1.56 cm, millions of pixels each under a red, green or blue filter · on its stabiliser plate";
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
