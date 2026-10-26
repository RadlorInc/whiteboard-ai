// "pipetee cx cy k len=5..60 lab=0 lit=pipe|tee" — a PART (PARTS.md, batch 5): a steel air line (1 cm pipe, len cm,
// 20 by default) ending in a steel tee fitting 4 cm long and 3 cm tall (gauge.js's line and tee, real size). Origin =
// the pipe's start on its axis (it screws into a handvalve's `out`), the line runs along +x. Threads at both pipe ends,
// the tee's beaded ends, its far end shut by a hex plug, the branch pointing up with a threaded port (anchor top: a
// pressuregauge's stem screws in there). Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RP = 5, RT = 8;

  ISO.add({
    name: "pipetee", title: "Air line and tee (part)", compare: null,
    about: "A 1 cm steel air line len cm long ending in a tee fitting: threaded pipe ends, beaded tee, a hex plug on its far end and a threaded branch pointing up for a pressure gauge. anchors: top end",
    line: "pipetee cx cy k len=5..60 lab=0 lit=pipe|tee",
    demo: { line: "pipetee 300 320 30 len=20 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "tee" }, hold: 1.2 }, { set: { lit: "pipe" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const Lm = ISO.clamp(ISO.num(o, "len", 20), 5, 60) * 10, T0 = Lm - 8, TC = T0 + 20, xF = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), bF = G.frameAlong([TC, 0, 0], [0, 0, 1]);
      const thread = (s0, s1) => L(G.ribsOf(xF, s0, s1, RP, Math.max(2, Math.round((s1 - s0) / 1.6)), Pm, { seams: true }), { tone: "lo" });
      const out = [`<g data-name="pipe">${ISO.tinted(ISO.T.steel, S(G.disc(0, T0 + 2, RP, xF, Pm), { tone: "hi", inner: thread(0.6, 10) + thread(T0 - 8, T0 - 0.4) }))}</g>`];
      out.push(`<g data-name="tee">${ISO.tinted(ISO.T.steel, S(G.solidOf([[0, RT - 1], [24, RT - 1], [25, RT + 1, 1], [30, RT + 1]], bF, Pm), { tone: "hi" }))}` +
        `<path d="${G.circleOf(bF, 30.05, 4.6, Pm)}" fill="#2f3237" stroke="#15171a" stroke-width="0.6"/>${L(G.arcOf(bF, 28, RT + 1, Pm), { tone: "faint" })}` +
        ISO.tinted(ISO.T.steel, S(G.solidOf([[T0, RT + 1], [T0 + 5, RT + 1], [T0 + 6, RT, 1], [T0 + 34, RT], [T0 + 35, RT + 1, 1], [T0 + 40, RT + 1]], xF, Pm), { tone: "hi" }) + B15.hex(Pm, xF, T0 + 40, T0 + 47, 14) + S(G.disc(T0 + 47, T0 + 49, 4.4, xF, Pm), { tone: "mid" })) + "</g>");
      if (lab) out.push(CIRC.word(P, [(TC + 14) / 10, 0, 3.4], "tee"), CIRC.word(P, [Lm / 20, 0, 1.6], "air line"));
      g.innerHTML = out.join("");
      g.anchors = { top: [TC / 10, 0, 3], end: [(T0 + 49) / 10, 0, 0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `steel air line ${Lm / 10} cm, 1 cm across, ending in a tee · the branch takes a pressure gauge`;
      B15.light(w, g, lit);
      return g;
    },
  });
})();
