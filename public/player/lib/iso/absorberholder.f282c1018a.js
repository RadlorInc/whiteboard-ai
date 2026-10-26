// "absorberholder cx cy k lab=0 lit=block|screw" — a PART (PARTS.md, batch 5): the slotted block of penetration.js that
// an absorber sheet stands in, its origin the bench point under its middle. A hardwood block 3 cm (x) × 6 cm (y) ×
// 2 cm tall with a slot 11 mm wide and 1 cm deep along y (room for up to 1 cm of lead), and a brass thumb screw in
// its +x cheek that pinches a thin sheet. Anchor `slot`: the middle of the slot's floor, where an absorbersheet stands
// (its middle is then at 5 cm, the beam at B22.BEAM = 7 cm still crosses it). Static. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const HX = 15, HY = 30, H = 20, SW = 5.5, SD = 10;
  const OAK = ISO.tint("#f1dcb9", ["#c9a06a", "#d4ae7c", "#ddbc8f", "#e7cba4"], "#6e4a1e");
  ISO.add({
    name: "absorberholder", title: "Absorber holder (part)", compare: null,
    about: "A slotted hardwood block 6 × 3 × 2 cm that an absorber sheet (paper, aluminium or lead) stands in across the beam, a thumb screw pinching thin sheets. anchors: slot",
    line: "absorberholder cx cy k lab=0 lit=block|screw",
    demo: { line: "absorberholder 480 330 50 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "block" }, hold: 1.2 }, { set: { lit: "screw" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const wood = (svg) => ISO.tinted(OAK, svg);
      // far cheek, the slot's floor, near cheek: the slot is seen from above between them
      const block = wood(ISO.wbox(Pm, [-HX, -SW], [-HY, HY], [0, H], "mid") + ISO.wbox(Pm, [-SW, SW], [-HY, HY], [0, H - SD], "mid") + ISO.wbox(Pm, [SW, HX], [-HY, HY], [0, H], "mid"));
      // grain on the near cheek's +y end: a few rings that run edge to edge
      const grain = L([4, 8, 12, 16].map((z) => K.segment([SW, HY + 0.05, z], [HX, HY + 0.05, z - 1.5], Pm)).join(""), { tone: "faint" });
      const Fs = G.frameOf([HX, 0, 14], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      const screw = ISO.tinted(ISO.T.brass, S(G.disc(0, 2, 2.2, Fs, Pm), { tone: "mid" }) + S(G.disc(2, 6, 5, Fs, Pm), { tone: "hi", inner: L(G.arcOf(Fs, 4, 5, Pm), { tone: "faint" }) }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1 }, 0, H, Pm)}"/><g data-name="block">${block}${grain}</g><g data-name="screw">${screw}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, H + 18], "absorber holder", "#445", { dy: -6 });
      g.anchors = { slot: [0, 0, (H - SD) / 10] };
      B22.still(g, o);
      g.readout = () => "absorber holder · a slot 11 mm wide holds paper, aluminium or lead upright across the beam";
      return g;
    },
  });
})();
