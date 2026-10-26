// "handvalve cx cy k lab=0 lit=body|wheel" — a PART (PARTS.md, batch 5): a brass globe valve with a red handwheel, on
// an air line (gauge.js's valve, real size): 5 cm end to end, the wheel 5 cm across, 6.6 cm tall. Origin = the middle
// of its inlet end (it screws onto a tank's `outlet`); the flow runs along +x to the outlet end (anchor out, where a
// pipetee screws in). Hex ends, a globe body with a cast flow arrow, the bonnet, the packing nut, the stem and the
// handwheel with three spokes, its hub and its nut. Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RED = ISO.tint("#e0574a", ["#9a2a20", "#b0352a", "#c44436", "#d24f40"], "#4a120c");
  const WZ = [40, 45], WR = [19, 25];

  ISO.add({
    name: "handvalve", title: "Hand valve (part)", compare: null,
    about: "A brass globe valve with a red handwheel on an air line: hex ends, a globe body with its flow arrow, bonnet, packing nut, stem and wheel; screws on at its inlet end, the flow leaves along +x. anchors: out",
    line: "handvalve cx cy k lab=0 lit=body|wheel",
    demo: { line: "handvalve 400 330 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "wheel" }, hold: 1.2 }, { set: { lit: "body" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", out = [];
      const xF = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), zF = G.frameAlong([25, 0, 0], [0, 0, 1]);
      out.push(`<g data-name="body">${ISO.tinted(ISO.T.brass, B15.hex(Pm, xF, 0, 10, 22) + S(G.solidOf([[10, 9], [13, 14, 1], [25, 16, 1], [37, 14, 1], [40, 9]], xF, Pm), { tone: "hi" }) + B15.hex(Pm, xF, 40, 50, 22))}`);
      out.push(`<path d="${G.circleOf(xF, 50.05, 6, Pm)}" fill="#4a3a12" stroke="#2a2008" stroke-width="0.6"/>`, LAB.faceText(Pm, [25, 16.2, -1], [1, 0, 0], "→", 12, "#6b5114"));
      out.push(ISO.tinted(ISO.T.brass, S(G.disc(12, 20, 10, zF, Pm), { tone: "mid" }) + B15.hex(Pm, zF, 20, 27, 14)) + ISO.tinted(ISO.T.steel, S(G.disc(27, WZ[0] + 1, 3, zF, Pm), { tone: "hi" })) + "</g>");
      // the handwheel: rim, three spokes, hub, the nut on the stem
      const spokes = [0, 1, 2].map((i) => { const a = (i * 2 * Math.PI) / 3 + 0.4, c = Math.cos(a), s = Math.sin(a); return ISO.box((u, w, y) => [25 + c * u - s * y, s * u + c * y, w], Pm, [4, WR[0] + 0.5], [WZ[0] + 1, WZ[1] - 1], [-2, 2], "mid"); }).join("");
      out.push(`<g data-name="wheel">${ISO.tinted(RED, S(G.ringBand(WZ[0], WZ[1], WR[0], WR[1], zF, Pm, { hole: [WZ[1], WR[0]] }), { tone: "hi" }) + spokes + S(G.disc(WZ[0], WZ[1] + 1, 5.5, zF, Pm), { tone: "hi" }))}${ISO.tinted(ISO.T.steel, B15.hex(Pm, zF, WZ[1] + 1, WZ[1] + 5, 7))}</g>`);
      if (lab) out.push(CIRC.word(P, [5.2, 0, 4.4], "hand valve"));
      g.innerHTML = out.join("");
      g.anchors = { out: [5, 0, 0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "hand valve · turn the wheel to open or shut the air line";
      B15.light(w, g, lit);
      return g;
    },
  });
})();
