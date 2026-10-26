// "foamcup cx cy k lab=0 lit=outer|inner" — a PART (PARTS.md, batch 5): the coffee-cup calorimeter's two nested
// expanded-polystyrene cups (calorimeter.js's cups, without the beaker) standing on the bench, origin the bench point
// under the middle. A 225 mL cup tapering from 5.8 cm at the foot to 8.1 cm with a rolled rim, and a second one pushed
// inside it standing 6 mm proud, its own rolled rim 8.3 cm across: 9.9 cm tall. The trapped air between them and the
// foam's beads keep the heat in. Static. Built in mm (ISO.mm); anchors in cm: rim = the top middle (a card lid sits
// there), inside = the inner cup's floor.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const OUT = [[0, 29], [1.6, 30.4, 1], [3, 30.8], [91, 40.4]], OTOP = 93, ITOP = 99, RI = 39.2, FLOOR = 7;

  function svg(P) {
    const B09 = window.B09, F = B09.Z([0, 0, 0]), out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -42, y: -42, w: 84, d: 84, r: 42 }, 0, 4, P)}"/>`);
    // the outer cup: its tapered wall, the foot ring moulded under it, the rolled rim; a few foam beads on the near side
    const beads = [];
    const face = G.angleToward(F, G.viewOf(P));
    for (let s = 12; s < 88; s += 9) for (let k = -3; k <= 3; k++) { const a = face + k * 0.32 + ((s / 9) % 2) * 0.16, r = 30.8 + ((s - 3) / 88) * 9.6; beads.push(K.iso(G.pointOf(F, s, r + 0.1, a), P)); }
    out.push(`<g data-name="outer">${ISO.tinted(B09.FOAM, S(G.solidOf(OUT, F, P), { tone: "hi" }) + S(G.ringBand(OTOP - 2.4, OTOP, 39.4, 41.6, F, P), { tone: "hi" }))}${D(beads, { size: 0.35, tone: "faint" })}</g>`);
    // the inner cup standing proud of the outer one: its wall above the outer rim, its rim, and the dark mouth
    const mouth = G.circleOf(F, ITOP - 0.1, RI - 0.6, P), back = G.arcOf(F, ITOP - 14, RI - 2.4, P, { inward: true });
    out.push(`<g data-name="inner">${ISO.tinted(B09.FOAM, S(G.lathe([[OTOP - 1, 0], [OTOP - 1, 39.6], [ITOP - 2, 40.3], [ITOP - 2, 0]], F, P), { tone: "mid" }) + S(G.ringBand(ITOP - 2.2, ITOP, RI - 0.4, 41.5, F, P), { tone: "hi" }))}` +
      `<path d="${mouth}" fill="#d9d9d3" stroke="#8f908a" stroke-width="0.6"/><path d="${back}" fill="none" stroke="#b9bab4" stroke-width="0.7"/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "foamcup", title: "Nested foam cups (part)", compare: null,
    about: "Two polystyrene cups pushed one inside the other, 9.9 cm tall and 8.3 cm across the rim: the insulated pot of a coffee-cup calorimeter, keeping the heat of a reaction in. anchors: rim inside",
    line: "foamcup cx cy k lab=0 lit=outer|inner",
    demo: { line: "foamcup 480 430 30", script: [{ set: {}, hold: 1 }, { set: { lit: "inner" }, hold: 1.2 }, { set: { lit: "outer" }, hold: 1.2 }] },
    make([cx = 480, cy = 430, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = svg(Pm) + (lab ? LAB.word(Pm, lab, [0, 48, 40], "two foam cups", "#556") : "");
      g.anchors = { rim: [0, 0, ITOP / 10], inside: [0, 0, FLOOR / 10] };
      return window.B09.still(g, o, "two nested polystyrene cups · 9.9 cm tall · 8.3 cm rim · about 200 mL inside");
    },
  });
})();
