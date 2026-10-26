// "beamsplitter cx cy k aim=+45|-45 lab=0 lit=plate|holder|post" — a PART (PARTS.md, batch 5): the beam splitter of
// michelson.js, its origin the table point under its post. A 3 × 3 cm glass plate, 5 mm thick, half-silvered on its
// front face, stands at 45° in a holder: a base bar with a V-groove and two side clamps, each with a nylon-tipped
// screw that holds the plate's edge. The holder sits on a 12 mm post in a post holder with a thumbscrew, on a slotted
// clamping fork. The plate's centre is 13.5 cm over the foot (the library's beam height). aim=+45: the plate's face
// normal is (1, 1)/√2, so light travelling −x is half passed straight on (−x) and half turned to +y; aim=−45: the
// normal is (1, −1)/√2 and the turned half goes −y. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const Z = 13.5, HW = 1.5, HT = 0.25, ANOD = ISO.tint("#4a4e55", ["#24272c", "#2d3036", "#363a40", "#41454c"], "#0f1012");
  const COAT = ISO.tint("#e9eef6", ["#b9c6d6", "#c7d2df", "#d5dde8", "#e2e8f0"], "#5d6f86");

  function splitterSvg(P, sg) {
    const r = Math.SQRT1_2, n = [r, sg * r], at = B20.frame(n), st = B20.stand(P, Z - HW - 0.8, { fork: [1, 0] }), items = [];
    const put = (a, svg, name) => items.push([at(a, 0, Z), `<g data-name="${name}">${svg}</g>`]);
    // the base bar under the plate (on the post's top) and the two side clamps at the plate's edges
    const bar = ISO.tinted(ANOD, ISO.box(at, P, [-0.7, 0.7], [-HW - 0.45, HW + 0.45], [Z - HW - 0.8, Z - HW], "mid"));
    items.push([at(0, 0, Z - 10), `<g data-name="holder">${bar}</g>`]);
    const tops = [];
    for (const sb of [-1, 1]) {
      const b0 = sb > 0 ? HW : -HW - 0.45, b1 = sb > 0 ? HW + 0.45 : -HW;
      const clamp = ISO.tinted(ANOD, ISO.box(at, P, [-0.55, 0.55], [b0, b1], [Z - HW, Z + HW + 0.4], "mid"));
      // the top lug over the plate's edge and its nylon-tipped screw pressing down on it (drawn last: they sit on top)
      const lug = ISO.tinted(ANOD, ISO.box(at, P, [-0.55, 0.55], [sb > 0 ? HW - 0.3 : -HW, sb > 0 ? HW : -HW + 0.3], [Z + HW, Z + HW + 0.4], "mid"));
      const screw = B20.knob(P, at(0, sb * (HW - 0.12), Z + HW + 0.4), [0, 0, 1], 0, 0.35, 0.16, 8, ISO.T.steel);
      items.push([at(0, sb * (HW + 0.2), Z), `<g data-name="holder">${clamp}</g>`]);
      tops.push([at(0, sb * HW, Z), `<g data-name="holder">${lug}${screw}</g>`]);
    }
    // the plate: glass, its front (+n) face half-silvered, a pale streak across the coating
    const glass = ISO.tinted(ISO.T.glass, ISO.box(at, P, [-HT, HT - 0.02], [-HW, HW], [Z - HW, Z + HW], "hi"));
    const coat = ISO.tinted(COAT, ISO.box(at, P, [HT - 0.02, HT], [-HW, HW], [Z - HW, Z + HW], "hi", true));
    const streak = `<path d="${K.pathOf([at(HT + 0.01, -1.0, Z + 1.1), at(HT + 0.01, 0.2, Z - 1.0)].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.1).toFixed(2)}" stroke-linecap="round" opacity=".75" data-free=""/>`;
    put(0, `<g style="opacity:.92">${glass}</g>${coat}${streak}`, "plate");
    items.sort((a, b) => K.depthOf(a[0], P) - K.depthOf(b[0], P));
    return `<path class="iso-halo" d="${K.haloOf({ x: -4.4, y: -1.4, w: 5.8, d: 2.8, r: 0.6 }, 0, 0.6, P)}"/><g data-name="post">${st.all}</g>` + items.map((x) => x[1]).join("") + B20.sorted(tops, P);
  }

  ISO.add({
    name: "beamsplitter", title: "Beam splitter on a post (part)", compare: null,
    about: "A 3 × 3 cm half-silvered glass plate standing at 45° in a holder on a post, centre 13.5 cm up: half the light goes straight through, half is turned 90° (to +y for aim=+45, −y for −45). anchors: centre",
    line: "beamsplitter cx cy k aim=+45|-45 lab=0 lit=plate|holder|post",
    demo: { line: "beamsplitter 480 420 22 aim=+45", script: [{ set: {}, hold: 1 }, { set: { lit: "plate" }, hold: 1.2 }, { set: { lit: "holder" }, hold: 1.2 }, { set: { aim: "-45", lit: "post" }, hold: 1.2 }, { set: { aim: "+45", lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let sg = o.aim === "-45" ? -1 : 1, lit = o.lit || "";
      const build = () => {
        g.innerHTML = splitterSvg(P, sg) + (lab ? window.LAB.word(P, lab, [0, 0, Z + HW + 1.6], "beam splitter", "#556") : "");
        g.anchors = { centre: [0, 0, Z] };
        B20.light(w, g, lit);
      };
      g.set = (p) => {
        if ((p.aim === "+45" || p.aim === "-45") && (p.aim === "-45" ? -1 : 1) !== sg) { sg = -sg; build(); }
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
      };
      g.update = () => false;
      g.readout = () => `beam splitter · half-silvered plate at 45° · light travelling −x: half goes on (−x), half turns to ${sg > 0 ? "+y" : "−y"}`;
      build();
      return g;
    },
  });
})();
