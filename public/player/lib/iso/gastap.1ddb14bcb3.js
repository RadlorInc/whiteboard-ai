// "gastap cx cy k lab=0 lit=base|body|nozzle|lever" — a PART (PARTS.md, batch 5): the bench gas tap a Bunsen burner's
// hose is pushed onto, its origin the bench point under its middle. A cast flange screwed to the bench top (three
// screws), a hex gland nut, the brass-coloured riser, the valve head with its turned seams and a printed GAS plate, a
// ribbed hose nozzle out along −x (toward a burner standing to its left) and the yellow lever on its spindle, along the
// nozzle = open. About 6 × 4 × 8 cm. Static. Built in mm (ISO.mm); anchors in cm: nozzle = the nozzle's tip, where a
// rubberhose starts (at=tap.nozzle). The geometry follows the bench tap drawn in bunsen.js, sized to a real tap.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RF = 20, HF = 4, NUT = [HF, 10], RISER = 7.5, HEAD = [52, 68], RH = 12, NZ = 60, NOZ = 34, SP = 72, LEV = [72, 76];
  const IRON = ISO.tint("#c7c3ba", ["#86837c", "#98958d", "#aaa69e", "#b9b6ae"], "#45423c");

  ISO.add({
    name: "gastap", title: "Bench gas tap (part)", compare: null,
    about: "A bench gas tap, about 8 cm tall: a flange screwed to the bench, the riser, the valve head with a GAS plate, a ribbed hose nozzle out along −x and the yellow lever (along the nozzle = open); a hose runs from its nozzle to a Bunsen burner. anchors: nozzle",
    line: "gastap cx cy k lab=0 lit=base|body|nozzle|lever",
    demo: { line: "gastap 480 420 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "nozzle" }, hold: 1.2 }, { set: { lit: "lever" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const Fz = LAB.Z([0, 0, 0]), face = G.angleToward(Fz, G.viewOf(Pm));
      // the flange: a low cast disc with a bevel and three countersunk screws into the bench
      const base = [`<path class="iso-halo" d="${K.haloOf({ x: -RF, y: -RF, w: 2 * RF, d: 2 * RF, r: RF }, 0, HF, Pm)}"/>`,
        ISO.tinted(IRON, S(K.cylinder(0, 0, RF, 0, HF, Pm, 48, 0.8), { tone: "mid" }))];
      for (const a of [face + 0.4, face + 0.4 + (2 * Math.PI) / 3, face + 0.4 - (2 * Math.PI) / 3]) base.push(CIRC.screw(Pm, [Math.cos(a) * 15, Math.sin(a) * 15, HF], 2.2, a + 0.5));
      base.push(ISO.tinted(IRON, S(K.cylinder(0, 0, RISER * 1.55, NUT[0], NUT[1] - NUT[0], Pm, 6, 0.4), { tone: "mid" })));
      // the riser up to the valve head, a turned seam on it
      const body = [ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, RISER, NUT[1], HEAD[0] - NUT[1], Pm, 28), { tone: "mid", crease: "none", inner: L(K.sideArc(0, 0, RISER, 30, Pm, 20), { tone: "faint" }) }))];
      // the ribbed nozzle out of the head along −x (drawn before the head: it is on the head's far-left side)
      const Fn = LAB.A([0, 0, NZ], [-1, 0, 0]);
      const nozzle = ISO.tinted(ISO.T.brass, S(G.disc(RH - 2, RH + 5, 4.2, Fn, Pm), { tone: "mid" }) +
        S(G.solidOf([[RH + 5, 4.6], [RH + 9, 4.6], [RH + 9, 3.6], [RH + 13, 4.2], [RH + 13, 3.4], [RH + 17, 4], [RH + 17, 3.2], [RH + 21, 3.8], [RH + 21, 3], [NOZ, 3]], Fn, Pm, { steps: 24 }), { tone: "mid" }) +
        `<path d="${G.circleOf(Fn, NOZ + 0.02, 1.6, Pm, 18)}" fill="#2a2522"/>`);
      // the valve head: a turned body, two seams, a small enamel plate printed GAS on the side facing us
      const head = [ISO.tinted(ISO.T.brass, S(G.lathe([[HEAD[0], 0], [HEAD[0], RISER + 1], [HEAD[0] + 2, RH, 1], [HEAD[1] - 2, RH, 1], [HEAD[1], RH - 2.5], [HEAD[1], 0]], Fz, Pm, { steps: 36 }),
        { tone: "mid", inner: L(G.arcOf(Fz, HEAD[0] + 5, RH + 0.02, Pm) + G.arcOf(Fz, HEAD[1] - 5, RH + 0.02, Pm), { tone: "faint" }) }))];
      const pc = G.pointOf(Fz, (HEAD[0] + HEAD[1]) / 2, RH + 0.1, face), tan = G.tangentOf(Fz, face).map((v) => -v);
      const corner = (u, v) => K.iso([pc[0] + tan[0] * u, pc[1] + tan[1] * u, pc[2] + v], Pm);
      head.push(`<path d="${K.pathOf([corner(-5.5, -2.6), corner(5.5, -2.6), corner(5.5, 2.6), corner(-5.5, 2.6)], true)}" fill="#f2c230" stroke="#7a5a08" stroke-width="0.5"/>`,
        LAB.faceText(Pm, [pc[0], pc[1], pc[2] - 1.4], tan, "GAS", 3.6, "#3a2a05"));
      // the spindle on top and the lever along the nozzle (open), its round boss and a rubber tip
      const lever = [ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3.4, HEAD[1], SP - HEAD[1], Pm, 16), { tone: "mid" })),
        ISO.tinted(ISO.T.amber, S(K.cylinder(0, 0, 6, LEV[0], LEV[1] - LEV[0], Pm, 24, 0.4), { tone: "hi" }) + ISO.wbox(Pm, [-30, -4], [-3, 3], LEV, "hi") + S(K.cylinder(-30, 0, 3, LEV[0], LEV[1] - LEV[0], Pm, 16, 0.4), { tone: "hi" })),
        D([K.iso([0, 0, LEV[1]], Pm)], { size: 0.5 })];
      g.innerHTML = `<g data-name="base">${base.join("")}</g><g data-name="body">${body.join("")}</g><g data-name="nozzle">${nozzle}</g><g data-name="body">${head.join("")}</g><g data-name="lever">${lever.join("")}</g>` +
        (lab ? CIRC.word(P, [1.4, 0, 6.2], "gas tap") : "");
      g.anchors = { nozzle: [-NOZ / 10, 0, NZ / 10] };
      const light = CIRC.lighter(g);
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => "bench gas tap · lever along the nozzle = open · a rubber hose to the burner pushes onto its ribbed nozzle";
      light(lit);
      return g;
    },
  });
})();
