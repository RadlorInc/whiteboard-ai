// "axialres cx cy k ohms=1..10000000 dir=x|y lab=0 lit=body|leads" — a PART (PARTS.md, batch 6): the bare carbon-film
// resistor of led.js (fixedresistor.js is the same resistor on a wooden mount), lying just above a surface with its
// tinned leads bent down into two holes 9 × 2.54 mm apart (a breadboard's pitch), its origin the surface point between
// the holes. An 11 mm dog-bone body with two end caps, its value in colour bands read from the end they crowd (two
// digits, the multiplier, then the gold 5 % band apart; 150 Ω = brown, green, brown, gold). dir = which way it runs
// (along x, or y into the room). Static. Built in mm; anchors a b (the leads' holes) in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HB = 5.5, PX = 11.43, RZ = 2.6;
  const BODY = ISO.tint("#f2e2c4", ["#c9ae7d", "#d6bd90", "#e2cca5", "#ecd8b6"], "#6e5530");
  ISO.add({
    name: "axialres", title: "Resistor, bare (part)", compare: null,
    about: "A bare carbon-film resistor with its colour bands, its leads bent down into two holes (as it sits in a breadboard); the bands give its value. anchors: a b",
    line: "axialres cx cy k ohms=1..10000000 dir=x|y lab=0 lit=body|leads",
    demo: { line: "axialres 480 300 60 ohms=150 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "body" }, hold: 1.2 }, { set: { lit: "leads" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", alongY = o.dir === "y";
      // built along x; dir=y turns it a quarter round (build +x → room −y), so its colour bands still face the camera
      const Pm = B.cam(P, { div: 10, az: alongY ? 90 : 0 }), turn = (p) => (alongY ? [p[1], -p[0], p[2]] : p);
      const ohm = B.num(o, "ohms", 150, 1, 1e7), F = G.frameOf([0, 0, RZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      // the tinned leads: out of each end cap, level, a round bend, then straight down into the hole
      const lw = Math.max(0.6, G.scaleOf(Pm) * 0.6), lead = (sx) => K.pathOf([[sx * HB, 0, RZ], [sx * (PX - 1.2), 0, RZ], [sx * (PX - 0.35), 0, RZ - 0.35], [sx * PX, 0, RZ - 1.2], [sx * PX, 0, 0]].map((p) => K.iso(p, Pm)));
      const leads = [-1, 1].map((sx) => `<path d="${lead(sx)}" fill="none" stroke="#55585e" stroke-width="${(lw + 0.7).toFixed(2)}" stroke-linejoin="round"/><path d="${lead(sx)}" fill="none" stroke="#c9ccd1" stroke-width="${lw.toFixed(2)}" stroke-linejoin="round"/>`);
      const body = [ISO.tinted(BODY, S(G.lathe([[-HB, 0], [-HB, 1.5], [-HB + 0.4, 2.1, 1], [-3.6, 2.25, 1], [-2.8, 1.95, 1], [2.8, 1.95, 1], [3.6, 2.25, 1], [HB - 0.4, 2.1, 1], [HB, 1.5], [HB, 0]], F, Pm, { steps: 28 }), { tone: "hi" }))];
      // each band painted round the half of the body that faces the camera
      const face = G.angleToward(F, G.viewOf(Pm)), half = (s, r, back) => Array.from({ length: 17 }, (_, i) => K.iso(G.pointOf(F, s, r, face + (back ? 1 - i / 8 : i / 8 - 1) * (Math.PI / 2)), Pm));
      const bands = B.bandsOf(ohm);
      bands.forEach((c, i) => { const s = [-3.9, -1.9, -0.2, 3.9][i], r = Math.abs(s) > 3 ? 2.27 : 1.97; body.push(`<path d="${K.pathOf([...half(s - 0.45, r, false), ...half(s + 0.45, r, true)], true)}" fill="${c}" stroke="${LAB.mix(c, "#000000", 0.5)}" stroke-width="0.4" stroke-linejoin="round"/>`); });
      // far lead, body, near lead (the far one is the one further from the camera)
      const far = K.depthOf([-PX, 0, 0], Pm) < K.depthOf([PX, 0, 0], Pm) ? 0 : 1;
      g.innerHTML = `<g data-name="leads">${leads[far]}</g><g data-name="body">${body.join("")}</g><g data-name="leads">${leads[1 - far]}</g>` + (lab ? ISO.word(K.iso([0, 0, RZ + 2.4], Pm), `${B.ohmsText(ohm)} resistor`, "#444", { size: 13, dy: -6 }) : "");
      g.anchors = { a: turn([-PX / 10, 0, 0]), b: turn([PX / 10, 0, 0]) };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `${B.ohmsText(ohm)} carbon-film resistor ±5 % · bands ${bands.map((c) => (c === B.GOLD ? "gold" : c === B.SILVER ? "silver" : B.BANDNAMES[B.BANDS.indexOf(c)])).join(", ")}`;
      B.light(w, g, lit);
      return g;
    },
  });
})();
