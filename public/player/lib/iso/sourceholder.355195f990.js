// "sourceholder cx cy k lab=0 lit=base|post|sleeve" — a PART (PARTS.md, batch 5): the source holder of penetration.js,
// its origin the bench point under its middle. A heavy steel foot 5.6 cm across with a radiation sticker, a 12 mm
// steel post, and on top an aluminium sleeve 2 cm across lying along x, bored for a source handle, with a thumb screw
// that locks it. The sleeve's middle (anchor `sleeve`) is 7 cm up, the absorption set's beam height (B22.BEAM): place
// a sealedsource at=<id>.sleeve ax=-2 and its tip looks out of the sleeve toward −x. Static.
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const RF = 28, HF = 8, RP = 6, Z = 70, RS = 9.5, HS = 18;
  ISO.add({
    name: "sourceholder", title: "Source holder (part)", compare: null,
    about: "A small stand for a radioactive source: heavy steel foot, steel post and an aluminium sleeve along x, 7 cm up, that the source's handle slides into and a thumb screw locks. anchors: sleeve",
    line: "sourceholder cx cy k lab=0 lit=base|post|sleeve",
    demo: { line: "sourceholder 480 400 34 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "sleeve" }, hold: 1.2 }, { set: { lit: "post" }, hold: 1 }, { set: { lit: "base" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const steel = (svg) => ISO.tinted(ISO.T.steel, svg), alu = (svg) => ISO.tinted(B22.ALU, svg);
      const Fx = G.frameOf([0, 0, Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      const base = ISO.tinted(ISO.T.paint, S(K.cylinder(0, 0, RF, 0, HF, Pm, 40, 1), { tone: "mid" })) + B22.trefoil(Pm, [0, 15, HF], 6);
      const post = steel(S(K.cylinder(0, 0, RP + 2, HF, 3, Pm, 24, 0.6), { tone: "mid" }) + S(K.cylinder(0, 0, RP, HF + 3, Z - HF - 3, Pm, 24), { tone: "mid", crease: "none" }));
      // the sleeve: an aluminium tube along x, chamfered ends, the bore's dark mouth on the +x end
      const sleeve = alu(S(G.solidOf([[-HS, RS - 1], [-HS + 1, RS], [HS - 1, RS], [HS, RS - 1]], Fx, Pm), { tone: "hi", inner: L(G.arcOf(Fx, -HS + 1, RS, Pm) + G.arcOf(Fx, HS - 1, RS, Pm), { tone: "faint" }) })) +
        B22.hole(Pm, [HS + 0.05, 0, Z], [0, 1, 0], [0, 0, 1], 4.5);
      // the thumb screw on top: a short shank and a knurled head
      const Fz = G.frameOf([0, 0, Z + RS - 0.5], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
      const screw = steel(S(G.disc(0, 4, 2, Fz, Pm), { tone: "mid" }) + S(G.disc(4, 9, 5, Fz, Pm), { tone: "hi", inner: L(K.knurl(0, 0, 5, Z + RS + 3.6, Z + RS + 8.4, 20, Pm, 0), { tone: "faint" }) }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RF, y: -RF, w: 2 * RF, d: 2 * RF, r: RF }, 0, HF, Pm)}"/>` +
        `<g data-name="base">${base}</g><g data-name="post">${post}</g><g data-name="sleeve">${sleeve}${screw}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, Z + 30], "source holder", "#445", { dy: -6 });
      g.anchors = { sleeve: [0, 0, Z / 10] };
      B22.still(g, o);
      g.readout = () => "source holder · the sleeve holds a source handle 7 cm above the bench, pointing along x";
      return g;
    },
  });
})();
