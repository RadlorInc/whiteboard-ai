// "gearbox cx cy k lab=0 lit=housing|cover|shaft|socket" — a PART (PARTS.md, batch 5): the small drive gearbox a
// speedometer cable runs to (gauge.js's block, real size): a cast-aluminium housing 6 × 5 × 3 cm on a bolted mounting
// flange, cast ribs on its front, the input shaft with its key and oil seal on the +x side, a cover plate with four
// screws and a fill plug on top, and the threaded output spigot on a boss where the drive cable's nut screws on
// (anchor cable, its top, pointing up). Origin = the bench point under its middle. Static. Built in mm (ISO.mm);
// the anchor in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const ALU = ISO.tint("#e6e4de", ["#9e9b94", "#b0ada6", "#c2bfb8", "#d3d0ca"], "#45433e");
  const SX = 8, ZT = 30;
  const up = (x, y, z) => G.frameAlong([x, y, z], [0, 0, 1]);
  const bolt = (P, x, y, z) => ISO.tinted(ISO.T.steel, B15.hex(P, up(x, y, z), 0, 3.4, 8) + S(G.disc(3.4, 4, 3.6, up(x, y, z), P), { tone: "hi" }));

  ISO.add({
    name: "gearbox", title: "Small gearbox (part)", compare: null,
    about: "The small cast gearbox a speedometer drive cable runs to: 6 × 5 × 3 cm housing on a bolted flange, input shaft and seal on its side, a screwed cover, and a threaded output spigot on top for the cable's nut. anchors: cable",
    line: "gearbox cx cy k lab=0 lit=housing|cover|shaft|socket",
    demo: { line: "gearbox 480 330 50 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "socket" }, hold: 1.2 }, { set: { lit: "shaft" }, hold: 1.2 }, { set: { lit: "cover" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -40, y: -27, w: 90, d: 54, r: 4 }, 0, 2, Pm)}"/>`);
      // the flange, its far bolt, the housing with a parting line, its cast ribs on the front
      out.push(`<g data-name="housing">${ISO.tinted(ALU, S(K.slabOf({ x: -40, y: -15, w: 80, d: 30, r: 4 }, 0, 6, Pm, 6, 0.8), { tone: "mid" }))}${bolt(Pm, -34, 0, 6)}`);
      out.push(ISO.tinted(ALU, S(K.slabOf({ x: -30, y: -25, w: 60, d: 50, r: 5 }, 6, 22, Pm, 6, 1.2), { tone: "hi", inner: L(K.sideSeam({ x: -30, y: -25, w: 60, d: 50, r: 5 }, 17, Pm, 6), { tone: "faint" }) })));
      for (const x of [-16, 0, 16]) out.push(ISO.tinted(ALU, ISO.wbox(Pm, [x - 1.6, x + 1.6], [25, 27.5], [8, 26], "mid")));
      out.push(`${bolt(Pm, 34, 0, 6)}</g>`);
      // the input shaft on +x: an oil seal ring in a boss, the shaft with its keyway
      const xF = G.frameAlong([30, -4, 17], [1, 0, 0]);
      out.push(`<g data-name="shaft">${ISO.tinted(ALU, S(G.disc(0, 3, 10, xF, Pm), { tone: "mid" }))}${ISO.tinted(ISO.T.rubber, S(G.disc(3, 4.5, 7.5, xF, Pm), { tone: "mid" }))}` +
        `${ISO.tinted(ISO.T.steel, S(G.disc(4.5, 18, 5, xF, Pm), { tone: "hi" }))}<path d="${K.pathOf([[9, -0.3], [15, -0.3], [15, 0.3], [9, 0.3]].map(([s, a]) => K.iso(G.pointOf(xF, s, 5.03, G.angleToward(xF, G.viewOf(Pm)) + a), Pm)), true)}" fill="#55585e" stroke="#3c3f45" stroke-width="0.5"/></g>`);
      // the cover: a plate with four screws and a hex fill plug
      const CV = { x: -26, y: -21, w: 52, d: 42, r: 3 };
      out.push(`<g data-name="cover">${ISO.tinted(ISO.T.steel, S(K.slabOf(CV, 28, 2, Pm, 4, 0.4), { tone: "hi" }))}` +
        ISO.tinted(ISO.T.steel, K.corners(CV, 4).map(([x, y]) => S(K.cylinder(x, y, 2.3, ZT, 1.2, Pm, 14), { tone: "mid", inner: L(K.segment([x - 2.3, y, ZT + 1.2], [x + 2.3, y, ZT + 1.2], Pm), { tone: "lo" }) })).join("")) +
        ISO.tinted(ALU, B15.hex(Pm, up(-14, 8, ZT), 0, 4, 9)) + "</g>");
      // the output: a boss, the threaded spigot the cable nut screws onto
      const sF = up(SX, 0, ZT);
      out.push(`<g data-name="socket">${ISO.tinted(ALU, S(G.disc(0, 4, 9, sF, Pm), { tone: "mid" }))}${ISO.tinted(ISO.T.brass, S(G.disc(4, 14, 6, sF, Pm), { tone: "hi", inner: L(G.ribsOf(sF, 5, 13.4, 6, 7, Pm, { seams: true }), { tone: "lo" }) }) + K.lineSvg(K.ring(SX, 0, 2.6, ZT + 14, Pm, 16), { tone: "mid" }))}</g>`);
      if (lab) out.push(CIRC.word(P, [4.6, 0, 4], "gearbox"));
      g.innerHTML = out.join("");
      g.anchors = { cable: [SX / 10, 0, (ZT + 14) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "small gearbox · 6 × 5 × 3 cm · the speedometer cable screws onto its spigot";
      B15.light(w, g, lit);
      return g;
    },
  });
})();
