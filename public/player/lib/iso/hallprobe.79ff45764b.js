// "hallprobe cx cy k lab=0 lit=slab|stick|leads|stand" — a PART (PARTS.md, batch 5): the Hall probe of halleffect.js. Its
// origin is its working tip: the middle of the germanium slab, which sits 8 cm above the bench its stand stands on
// (place it at=<magnet>.gap and the stand lands on the bench, the slab in a celectromagnet's gap). A thin slab of n-type
// germanium 28 × 18 × 1 mm lying flat on the paddle end of a white probe stick 15 cm long and 1 cm wide that runs out
// along +y to a stand: a holder block with a thumbscrew on a rod and a heavy round foot. Four brass solder pads on the
// slab: the current pads on its two short ends, the Hall pads on its two long edges; four fine leads (red and black
// for the current, yellow and blue for the Hall voltage) run along the stick into the block, and a round 4-pin socket on
// the block's back takes the cable to the meters (anchor `out`). Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const WHITE = ISO.tint("#f7f7f4", ["#c9c9c3", "#d6d6d0", "#e2e2dc", "#ecece7"], "#55534c");
  const GE = ISO.tint("#5b616b", ["#2c3037", "#353a42", "#40454e", "#4b515a"], "#15181c");
  const SL = { x: 14, y: 9 }, ZS = -0.6, YB = 140, YE = 160, ZF = -80;

  ISO.add({
    name: "hallprobe", title: "Hall probe (part)", compare: null,
    about: "A Hall probe: a thin germanium slab with four solder pads and fine leads on the tip of a white stick, held 8 cm up by a stand; in a magnetic field it gives the Hall voltage. anchors: slab out",
    line: "hallprobe cx cy k lab=0 lit=slab|stick|leads|stand",
    demo: { line: "hallprobe 580 170 24 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "slab" }, hold: 1.2 }, { set: { lit: "leads" }, hold: 1.2 }, { set: { lit: "stick" }, hold: 1.2 }, { set: { lit: "stand" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      // the stand: a heavy foot, the rod, the holder block with its thumbscrew and the cable socket on its back
      const yc = (YB + YE) / 2;
      const foot = ISO.tinted(ISO.T.steel, S(K.cylinder(0, yc, 25, ZF, 6, Pm, 48, 1), { tone: "mid" }));
      const rod = ISO.tinted(ISO.T.steel, S(K.cylinder(0, yc, 3, ZF + 6, -12 - ZF - 6, Pm, 20), { tone: "mid", crease: "none", inner: L(K.sideArc(0, yc, 3, -50, Pm, 10), { tone: "faint" }) }));
      const block = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [-9, 9], [YB, YE], [-12, 6], "mid"));
      const Fx = LAB.A([9, yc, -3], [1, 0, 0]), Fs = LAB.A([0, YE, -3], [0, 1, 0]);
      const screw = ISO.tinted(ISO.T.steel, S(G.disc(0, 3, 2, Fx, Pm), { tone: "mid" }) + S(G.disc(3, 8, 5, Fx, Pm), { tone: "hi", inner: L(G.ribsOf(Fx, 3, 8, 5, 16, Pm, { seams: true }), { tone: "faint" }) }));
      const socket = ISO.tinted(ISO.T.steel, S(G.disc(0, 2, 6, Fs, Pm), { tone: "mid" })) + `<path d="${G.circleOf(Fs, 2.02, 4.4, Pm)}" fill="#14171a"/>` +
        K.dotsSvg([0.4, 1.97, 3.54, 5.11].map((a) => K.iso(G.pointOf(Fs, 2.05, 2.6, a), Pm)), { size: 0.35, tone: "hi" });
      // the stick: a white strip into the block, widening to the paddle the slab is glued on
      const stick = ISO.tinted(WHITE, ISO.wbox(Pm, [-5, 5], [12, YB + 4], [ZS - 2.4, ZS], "hi") + ISO.wbox(Pm, [-17, 17], [-12, 12], [ZS - 2.4, ZS], "hi")) +
        LAB.faceText(Pm, [0, 76, ZS + 0.05], [0, 1, 0], "HALL PROBE · Ge", 3, "#55534c", [-1, 0, 0]);
      // the slab and its four pads (current at the short ends, Hall at the long edges)
      const pad = (x0, x1, y0, y1) => ISO.wbox(Pm, [x0, x1], [y0, y1], [0.5, 0.8], "mid");
      const slab = ISO.tinted(GE, ISO.wbox(Pm, [-SL.x, SL.x], [-SL.y, SL.y], [-0.5, 0.5], "hi")) +
        ISO.tinted(ISO.T.brass, pad(-SL.x, -SL.x + 3, -3, 3) + pad(SL.x - 3, SL.x, -3, 3) + pad(-3, 3, -SL.y, -SL.y + 3) + pad(-3, 3, SL.y - 3, SL.y));
      // the fine leads: from each pad onto the paddle and along the stick's top into the block
      const lead = (pts, c) => `<path d="${K.pathOf(LAB.bend(pts, 3).map((p) => K.iso(p, Pm)))}" fill="none" stroke="${c}" stroke-width="${Math.max(0.6, G.scaleOf(Pm) * 0.8).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      const zt = ZS + 0.1, run = (x) => [[x, 14, zt], [x, YB, zt]];
      const leads = lead([[-SL.x + 1.5, 0, 0.8], [-SL.x - 1, 0, zt], [-SL.x - 1, 11, zt], [-3.5, 13, zt], ...run(-3.5)], "#c0392b") +
        lead([[SL.x - 1.5, 0, 0.8], [SL.x + 1, 0, zt], [SL.x + 1, 11, zt], [3.5, 13, zt], ...run(3.5)], "#2a2b2f") +
        lead([[0, SL.y - 1.5, 0.8], [0, SL.y + 1, zt], [-1.2, 13, zt], ...run(-1.2)], "#e09a00") +
        lead([[0, -SL.y + 1.5, 0.8], [0, -SL.y - 1, zt], [SL.x + 2.5, -SL.y - 1, zt], [SL.x + 2.5, 10, zt], [1.2, 13, zt], ...run(1.2)], "#2b6cc4");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -25, y: yc - 25, w: 50, d: 50, r: 25 }, ZF, 6, Pm)}"/>` +
        `<g data-name="stand">${foot}${rod}</g><g data-name="stick">${stick}</g><g data-name="slab">${slab}</g><g data-name="leads">${leads}</g>` +
        `<g data-name="stand">${block}${screw}${socket}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, 4], "germanium slab", "#445", { dy: -10 }) + LAB.word(Pm, lab, [0, YE, ZF], "Hall probe", "#445", { dy: 16 });
      g.anchors = { slab: [0, 0, 0], out: [0, (YE + 2) / 10, -0.3] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "Hall probe · n-type germanium slab 28 × 18 × 1 mm, 8 cm above the bench · current leads on its ends, Hall leads on its edges";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
