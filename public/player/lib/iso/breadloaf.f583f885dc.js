// "breadloaf cx cy k lab=0 lit=loaf|bag" — a PART (batch 6, groceries): a sliced loaf of bread in a clear plastic bag,
// lying on a table or a shelf, its origin the surface point under its middle, its length along x. 25 × 12 × 12 cm:
// a baked crust with the slice cuts across its domed top, the cut end at +x showing the crumb with its air holes, and
// the bag: a loose clear skin with two highlights, gathered past the end into a neck with a blue twist tie and a
// short flared tail, and a plain sticker ("BREAD 800 g", no brand). Static. World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const LEN = 25, W = 12, H = 12;
  ISO.add({
    name: "breadloaf", title: "Bread loaf (part)", compare: null,
    about: "A sliced bread loaf, 25 × 12 × 12 cm, in a clear bag with a twist tie; a basic grocery item to price or put in a basket. anchors: top",
    line: "breadloaf cx cy k lab=0 lit=loaf|bag",
    demo: { line: "breadloaf 450 380 22 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "loaf" }, hold: 1.5 }, { set: { lit: "bag" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const loaf = B.loaf(P, [0, 0, 0], { len: LEN, w: W, h: H, detail: true, parts: true });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -LEN / 2, y: -W / 2, w: LEN + 5, d: W, r: 3 }, 0, H, P)}"/>` +
        `<g data-name="loaf">${loaf.loaf}</g><g data-name="bag">${loaf.bag}</g>` +
        (lab ? ISO.word(K.iso([0, 0, H + 2.5], P), "sliced loaf in a bag", "#556", { size: 13 }) : "");
      g.anchors = { top: [0, 0, H] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "sliced loaf in a clear bag · 25 × 12 × 12 cm · 800 g";
      B.light(w, g, lit);
      return g;
    },
  });
})();
