// "ringclamp cx cy k reach=6..20 lab=0 lit=ring|boss" — a PART (PARTS.md, batch 5): a retort ring (ring clamp), the
// steel ring on a stand that holds a filter funnel (filtration.js), its origin the stand rod's axis at the height of
// the ring (it clamps onto the rod: place `at=<stand>.top az=-<cm down>`). A boss head with its thumb screw grips the
// rod; a 6 mm steel arm runs `reach` cm out along +y (as the retortstand's clamp does) to a lug welded onto a ring of
// round 5 mm bar, 7.4 cm across inside. Static. Built in mm (LAB.ringClamp, LAB.boss); anchors in cm: `ring` = the
// middle of the ring at its top (a funnel's cone rests there).
(() => {
  const K = window.K, G = window.G;
  const RI = 37, BAR = 2.5, RC = RI + BAR;

  ISO.add({
    name: "ringclamp", title: "Ring clamp (part)", compare: null,
    about: "A retort ring: a steel ring 7.4 cm across on an arm, clamped onto a stand's rod by a boss head, that holds a filter funnel over a flask. anchors: ring",
    line: "ringclamp cx cy k reach=6..20 lab=0 lit=ring|boss",
    demo: { line: "ringclamp 560 210 34 reach=10 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ring" }, hold: 1.4 }, { set: { lit: "boss" }, hold: 1.4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const reach = ISO.clamp(ISO.num(o, "reach", 10), 6, 20) * 10, C = [0, reach, 0];
      // the boss: a block round the rod's place (its bore open, dark), the thumb screw behind
      const bore = `<path d="${K.pathOf(K.circleRing(0, 0, 3.6, 24).map(([x, y]) => K.iso([x, y, 6.51], Pm)), true)}" fill="#2a2e33"/>`;
      const boss = LAB.boss(Pm, [0, 0], -6.5, [0, 1]) + bore + L(K.ring(0, 0, 3.6, 6.5, Pm, 24), { tone: "lo" });
      // the arm out of the boss to the ring's lug: a round bar with a turned collar where it leaves the boss
      const Fa = LAB.A([0, 0, 0], [0, 1, 0]), lugY = reach - RC - BAR;
      const arm = S(G.disc(7.5, lugY + 1, 3, Fa, Pm), { tone: "mid" }) + S(G.disc(7.5, 10, 3.8, Fa, Pm), { tone: "mid" });
      const lug = ISO.wbox(Pm, [-4.5, 4.5], [lugY - 1, lugY + 5], [-3.2, 3.2], "mid");
      // the ring: round bar, drawn as a shaded band along its centre line (as LAB.ringClamp), one closed band, the lug welded on over it
      const Fr = LAB.Z([C[0], C[1], 0]), bw = G.scaleOf(Pm) * 2 * BAR;
      const bar = (d) => `<path d="${d}" fill="none" stroke="#4b525a" stroke-width="${(bw + 1.2).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#c9ced3" stroke-width="${bw.toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f2f4f6" stroke-width="${(bw * 0.25).toFixed(2)}" transform="translate(0 ${(-bw * 0.22).toFixed(2)})"/>`;
      const ring = bar(G.circleOf(Fr, 0, RC, Pm, 72));
      g.innerHTML = `<g data-name="boss">${ISO.tinted(ISO.T.steel, boss)}</g><g data-name="ring">${ISO.tinted(ISO.T.steel, arm + ring + lug)}</g><g data-part="words"></g>`;
      g.anchors = { ring: [0, reach / 10, BAR / 10] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [RC + 8, reach, 0], "ring clamp", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [-12, 0, 8], "boss", "#556", { anchor: "end" });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `ring clamp · steel ring 7.4 cm across, ${reach / 10} cm out from the rod: it holds a filter funnel over a flask`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
