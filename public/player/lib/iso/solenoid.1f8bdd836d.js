// "solenoid cx cy k lab=0 lit=former|winding|saddles|terminals" — a PART (PARTS.md, batch 5): a school induction coil
// lying along x on two wooden saddles, origin the bench point under its middle. A grey plastic former (a tube, bore
// 5.4 cm, open at both ends so a bar magnet slides in) with two round end cheeks 12.4 cm across, wound between them
// with enamelled copper to 10 cm across and 27 cm long (drawn 60 turns; a real one has a few hundred). The winding's
// two ends come down to a red and a black 4 mm socket on the near face of each saddle. Axis 7.2 cm over the bench.
// Reused from induction.js (former, cheeks, saddles, winding). Static. anchors: axis bore a b (a = the −x socket,
// b = the +x socket, bore = the mouth of the bore at the +x cheek, where a magnet goes in).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const Z = 7.2, RW = 5, RF = 3.1, RB = 2.7, RC = 6.2, X1 = 13.5, CT = 0.6, SX = 9, SH = 4.5;
  const FORMER = ISO.tint("#e8eaec", ["#a4a9ae", "#b5b9be", "#c6c9cd", "#d6d8db"], "#4a5058");
  const RED = ISO.tint("#f08a80", ["#b8322a", "#c8433a", "#d6564c", "#e26a60"], "#6a1410");
  const ENAMEL = ISO.tint("#f2c9a6", ["#a8582a", "#b86a38", "#c97e4c", "#d89262"], "#5a2a10");
  // the saddle's outline in (y, z): a block with a round seat cut for the winding
  const SEAT = (() => { const pts = [[-SH, 0], [SH, 0]], r = RW + 0.1, a0 = Math.asin(SH / r); for (let i = 0; i <= 16; i++) { const a = a0 - (2 * a0 * i) / 16; pts.push([Math.sin(a) * r, Z - Math.cos(a) * r]); } return pts; })();

  const ring = (F, s, r, n) => Array.from({ length: n }, (_, i) => G.pointOf(F, s, r, (i / n) * Math.PI * 2));
  function saddle(P, x) {
    return ISO.prismX(P, SEAT, x - 1.5, x + 1.5, ["#c99a5e", "#ead2a8"], "#f0dcb6", "#6e4a1e") +
      D([[x - 0.8, SH + 0.01, 0.8], [x + 0.8, SH + 0.01, 0.8]].map((p) => K.iso(p, P)), { size: 0.35 });
  }
  const socket = (P, x, tint) => { const F = window.LAB.Y([x, 0, 2.2]); return ISO.tinted(ISO.T.brass, S(G.disc(SH, SH + 0.25, 0.75, F, P), { tone: "mid" })) + ISO.tinted(tint, S(G.disc(SH + 0.25, SH + 1.1, 0.6, F, P), { tone: "hi", inner: `<path d="${K.pathOf(ring(F, SH + 1.11, 0.22, 12).map((p) => K.iso(p, P)), true)}" fill="#222"/>` })); };

  ISO.add({
    name: "solenoid", title: "Coil on saddles (part)", compare: null,
    about: "A school induction coil: a plastic former with end cheeks wound with copper (27 cm long, 10 cm across), lying on two wooden saddles, open bore for a bar magnet, two 4 mm sockets for the leads. anchors: axis bore a b",
    line: "solenoid cx cy k lab=0 lit=former|winding|saddles|terminals",
    demo: { line: "solenoid 480 350 18 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "winding" }, hold: 1.4 }, { set: { lit: "terminals" }, hold: 1.4 }, { set: { lit: "saddles" }, hold: 1.2 }] },
    make([cx = 480, cy = 350, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), F = B18.X([0, 0, Z]);
      const c = K.coil(-X1 + 0.4, X1 - 0.4, [0, Z], RW + 0.05, 60, "x", P);
      const cheek = (x0, x1) => ISO.tinted(FORMER, S(G.disc(x0, x1, RC, F, P, { steps: 40 }), { tone: "mid" }));
      // the bore seen at the +x end: the dark inside of the tube
      const mouth = (s) => `<path d="${K.pathOf(ring(F, s, RB, 32).map((p) => K.iso(p, P)), true)}" fill="#3a3e44" stroke="#4a5058" stroke-width="0.6"/>`;
      // the tube stands 0.5 cm proud of each cheek
      const tubeEnd = (x0, x1) => ISO.tinted(FORMER, S(G.ringBand(x0, x1, RB, RF, F, P, { steps: 32 }), { tone: "mid" }));
      // the winding's two tails: from the bottom turn near each cheek down the saddle's near face to its socket
      const tail = (x) => `<path d="${K.pathOf([[x + 1.2, RW * 0.72, Z - RW * 0.69], [x + 1.2, SH + 0.35, 4.6], [x + 0.6, SH + 0.35, 3.3], [x, SH + 0.6, 2.9]].map((p) => K.iso(p, P)))}" fill="none" stroke="#a8582a" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.15).toFixed(2)}" stroke-linecap="round"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -X1 - CT, y: -RC, w: 2 * (X1 + CT), d: 2 * RC, r: 2 }, 0, 0.02, P)}"/>` +
        `<g data-name="saddles">${saddle(P, -SX)}${saddle(P, SX)}</g>` +
        `<g data-name="former">${tubeEnd(-X1 - CT - 0.5, -X1 - CT)}${cheek(-X1 - CT, -X1)}</g>` +
        `<g data-name="winding">${ISO.tinted(ENAMEL, S(G.disc(-X1, X1, RW, F, P, { steps: 40 }), { tone: "mid", crease: "none" }))}<path d="${c.front}" fill="none" stroke="#8a4520" stroke-width="0.7" opacity=".75"/>${tail(-SX)}${tail(SX)}</g>` +
        `<g data-name="former">${cheek(X1, X1 + CT)}${tubeEnd(X1 + CT, X1 + CT + 0.5)}${mouth(X1 + CT + 0.52)}</g>` +
        `<g data-name="terminals">${socket(P, -SX, RED)}${socket(P, SX, ISO.T.plastic)}</g><g data-part="words"></g>`;
      g.anchors = { axis: [0, 0, Z], bore: [X1 + CT + 0.5, 0, Z], a: [-SX, SH + 1.1, 2.2], b: [SX, SH + 1.1, 2.2] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [0, 0, Z + RC + 1], "coil (copper on a plastic former)", "#9a5a22") + LAB.word(P, lab, [X1 + CT + 0.5, 0, Z - RB], "bore", "#556", { anchor: "start", dy: 16 });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B18.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "induction coil · 27 cm winding, 10 cm across, bore 5.4 cm (a bar magnet slides in) · two 4 mm sockets for the galvanometer leads";
      B18.light(w, g, lit);
      return g;
    },
  });
})();
