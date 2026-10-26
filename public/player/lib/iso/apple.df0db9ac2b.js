// "apple cx cy k c=red|green|yellow lab=0 lit=apple|stalk|leaf" — a PART (batch 6, economy): one apple about 8 cm
// across standing on a table, a shelf or in a hand, its origin the point under its middle. A turned body with a dimple
// at the top and the bottom, a lighter streak on its shoulder, a short stalk leaning out of the top dimple and one
// leaf with its vein. The scarcity / unit-price apple. Static. World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  ISO.add({
    name: "apple", title: "Apple (part)", compare: null,
    about: "One apple about 8 cm across with its stalk and a leaf, red, green or yellow; for scarcity and unit-price examples; static. anchors: top",
    line: "apple cx cy k c=red|green|yellow lab=0 lit=apple|stalk|leaf",
    demo: { line: "apple 480 400 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "apple" }, hold: 1.2 }, { set: { lit: "leaf" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const c = B.APPLE_C[B.pick(o.c, Object.keys(B.APPLE_C), "red")];
      const halo = { x: -4.4, y: -4.4, w: 8.8, d: 8.8, r: 4.4 };
      // the body, then the stalk and the leaf (drawn in one call; split into named groups by building them apart)
      const body = B.apple(P, [0, 0, 0], { r: 4, c });
      const withLeaf = B.apple(P, [0, 0, 0], { r: 4, c, detail: true });
      const leaf = withLeaf.slice(body.length);
      const cut = body.lastIndexOf("<g style");   // the stalk is the last tinted solid of the body
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 7.5, P)}"/><g data-name="apple">${body.slice(0, cut)}</g><g data-name="stalk">${body.slice(cut)}</g><g data-name="leaf">${leaf}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B.word(P, [4, 0, 5], "apple, about 150 g");
      g.anchors = { top: [0, 0, 7] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "apple · about 8 cm across · about 150 g";
      B.light(w, g, lit);
      return g;
    },
  });
})();
