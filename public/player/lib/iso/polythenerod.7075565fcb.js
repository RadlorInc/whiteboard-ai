// "polythenerod cx cy k aim=x|flat d=0..50 charge=0|1 lab=0 lit=rod|charge" — a PART (PARTS.md, batch 5): a 30 cm
// polythene rod, 1.5 cm thick, rubbed with a cloth so it carries a negative charge, as static.js holds it at the
// electroscope's cap. Origin: its working tip (the rounded end it is brought up with), the rod lying along +x from it;
// aim=x holds it level in the air at the origin's height (place it at= an electroscope's `rim`), aim=flat lays it on a
// surface (origin = the point under the tip). d = how far the tip is drawn back along +x (cm): 0 touches, set({ d })
// eases it in or out. charge=1 prints "−" signs along the rubbed half. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const LEN = 30, R = 0.75;
  const POLY = ISO.tint("#eef0f1", ["#a9adb2", "#babdc2", "#cbcdd1", "#dadcdf"], "#3c3f45");

  ISO.add({
    name: "polythenerod", title: "Polythene rod (part)", compare: null,
    about: "A 30 cm polythene rod, rubbed with a cloth so it is negatively charged, held level with its tip near or touching a cap; it moves in and out along its length. anchors: tip",
    line: "polythenerod cx cy k aim=x|flat d=0..50 charge=0|1 lab=0 lit=rod|charge",
    demo: { line: "polythenerod 230 230 18 d=8 charge=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { d: 0, lit: "rod" }, hold: "settle" }, { set: { d: 14, lit: "charge" }, hold: "settle" }, { set: { d: 4, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", charge = o.charge !== "0";
      const z0 = o.aim === "flat" ? R : 0, st = { d: ISO.clamp(ISO.num(o, "d", 0), 0, 50) }, want = { d: st.d };
      const F = G.frameOf([0, 0, z0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      let lit = o.lit || "";
      // the rod: a rounded working tip, the long body with a faint mould seam, a squared-off back end; the grip half
      // (the end held in the hand) has a matt band
      const rod = S(G.lathe([[0, 0], [0.12, 0.42, 1], [0.45, 0.68, 1], [0.8, R], [LEN - 0.3, R], [LEN, R * 0.82]], F, P), { tone: "hi", inner: L(G.ribsOf(F, 0.8, LEN - 0.3, R, 1, P, { seams: true }), { tone: "faint" }) }) +
        S(G.disc(LEN - 9, LEN - 0.4, R + 0.04, F, P), { tone: "mid" });
      const face = G.angleToward(F, G.viewOf(P)), fs = Math.max(12, k * 1.6);
      const signs = () => !charge ? "" : [2, 5, 8, 11, 14].map((s, i) => ISO.word(K.iso(G.pointOf(F, s, R, face + (face > Math.PI / 2 ? -1 : 1) * (i % 2 ? 0.2 : 0.6)), P), "−", "#1f4f8f", { size: fs, halo: false, dy: fs * 0.35 })).join("");
      g.innerHTML = `<g data-part="move"><g data-name="rod">${ISO.tinted(POLY, rod)}</g><g data-name="charge">${signs()}</g>` +
        `<g data-part="words">${LAB.word(P, lab, [LEN * 0.55, 0, z0 + R + 1.2], charge ? "rubbed polythene rod" : "polythene rod", "#556", { dy: -4 })}</g></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.attr(el.move, "transform", K.translateAlong(P, [st.d, 0, 0]));
        g.anchors = { tip: [+st.d.toFixed(3), 0, z0] };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.d !== undefined && Number.isFinite(+p.d)) want.d = ISO.clamp(+p.d, 0, 50);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.d = ISO.follow(st.d, want.d, dt, 0.35, ISO.still());
        if (Math.abs(st.d - want.d) < 0.01) st.d = want.d;
        draw();
        return st.d !== want.d;
      };
      g.readout = () => `polythene rod 30 × 1.5 cm${charge ? ", rubbed: it has gained electrons (−)" : ""} · tip ${st.d < 0.05 ? "touching" : `${st.d.toFixed(1)} cm away`}`;
      draw();
      return g;
    },
  });
})();
