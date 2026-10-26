// "pendulumclamp cx cy k lab=0 lit=jaws|screw|arm" — a PART (PARTS.md, batch 5): the split clamp of pendulum.js that
// holds the thread, real size (4 × 2 × 2 cm). Two steel cheeks 2 × 0.8 × 2 cm with a hairline slit between them (in the
// x–z plane, so a pendulum hung from it swings along x, parallel to the cheeks), pinched by a knurled thumb screw
// through both from the +y side; the thread comes out of the top of the slit as a short tail. A 7 mm steel arm runs
// back from the far cheek toward −y (into a retort stand's boss: anchor `rod`). The origin is the pivot: the point
// where the thread leaves the bottom of the slit (place a pendulumbob or a steelball line there). Static.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 1, CH = 2, CY = 0.8, SL = 0.025, ZS = 1.4, ZA = 1.35;
  const STEEL = ["#8d9096", "#d3d5d9"];

  function clampSvg(P) {
    const out = [], cheek = [[-HX, 0.12], [-HX + 0.12, 0], [HX - 0.12, 0], [HX, 0.12], [HX, CH], [-HX, CH]];
    // the arm (far side), its end chamfered
    const Fa = G.frameOf([0, -CY, ZA], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(`<g data-name="arm">${ISO.tinted(ISO.T.steel, S(G.disc(0, 2.2, 0.35, Fa, P, { bevel: 0.05 }), { tone: "hi" }))}</g>`);
    // the far cheek, the slit (dark), the thread's tail out of its top, the near cheek
    out.push(`<g data-name="jaws">${ISO.prismY(P, cheek, -CY, -SL, STEEL, "#e2e4e7", "#3c3f45")}`);
    out.push(ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-HX + 0.03, HX - 0.03], [-SL, SL], [0.05, CH - 0.02], "lo")) + `</g>`);
    out.push(`<g data-name="thread"><path d="${K.pathOf([[0, 0, CH - 0.05], [0, 0, CH + 0.25], [0.25, 0, CH + 0.5], [0.6, 0.1, CH + 0.55]].map((p) => K.iso(p, P)))}" fill="none" stroke="#6b5a3a" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.04).toFixed(2)}" stroke-linecap="round"/></g>`);
    let near = ISO.prismY(P, cheek, SL, CY, STEEL, "#e2e4e7", "#3c3f45");
    // a scribed pivot mark at the bottom middle of the near cheek's face
    near += K.lineSvg(K.pathOf([[0, CY + 0.005, 0.02], [0, CY + 0.005, 0.35]].map((p) => K.iso(p, P))), { tone: "mid", free: true });
    out.push(`<g data-name="jaws">${near}</g>`);
    // the thumb screw: its shank out of the near cheek, a collar and the knurled head
    const Fs = G.frameOf([0, CY, ZS], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    const knurl = K.lineSvg(G.ribsOf(Fs, 0.35, 0.75, 0.42, 16, P, { seams: true }), { tone: "lo" });
    out.push(`<g data-name="screw">${ISO.tinted(ISO.T.steel, S(G.disc(0, 0.3, 0.13, Fs, P), { tone: "mid" }) + S(G.disc(0.28, 0.36, 0.25, Fs, P), { tone: "hi" }))}` +
      ISO.tinted(ISO.T.plastic, S(G.disc(0.35, 0.75, 0.42, Fs, P, { bevel: 0.05 }), { tone: "hi", inner: knurl })) + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "pendulumclamp", title: "Pendulum split clamp (part)", compare: null,
    about: "A split clamp that grips a pendulum's thread between two steel cheeks with a thumb screw, on an arm that goes into a stand's boss; the thread leaves the slit's bottom at a sharp, fixed pivot, so the length L is measured from there. anchors: pivot rod",
    line: "pendulumclamp cx cy k lab=0 lit=jaws|screw|arm",
    demo: { line: "pendulumclamp 470 330 70", script: [{ set: {}, hold: 1 }, { set: { lit: "jaws" }, hold: 1.2 }, { set: { lit: "screw" }, hold: 1.2 }, { set: { lit: "arm" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = clampSvg(P) + LAB.word(P, lab, [HX + 0.3, CY, CH + 0.4], "clamp", "#445", { anchor: "start" });
      g.anchors = { pivot: [0, 0, 0], rod: [0, -CY - 2.2, ZA] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B21.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "split clamp: the thread is pinched between the cheeks · it bends at the slit's bottom edge, the pendulum's fixed pivot";
      B21.light(w, g, lit);
      return g;
    },
  });
})();
