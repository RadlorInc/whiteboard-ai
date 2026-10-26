// "ballonrod cx cy k d=3..6 x=-70..70 lab=0 lit=carriage|rod|ball" — a PART (PARTS.md, batch 5): an opaque ball on a
// rod in an optical bench carriage, the object whose shadow shadow.js throws on the screen. Origin: the rail's top
// under the carriage (place it at=bench.zero ax=<cm>), like a benchrider. The black saddle and clamp screw of the
// bench's own rider (B03.rider), its steel rod, a collar, and a matt black ball `d` cm across with its centre at the
// beam height, 13.5 cm over the rail. set({ x }) slides it along the rail (cm, eased); the `ball` anchor is where it
// ends up. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const ZB = 13.5;
  ISO.add({
    name: "ballonrod", title: "Ball on a rod (part)", compare: null,
    about: "An opaque black ball (3 to 6 cm) on a rod in an optical bench carriage, its centre at the 13.5 cm beam height; it slides along the rail to make a shadow bigger or smaller. anchors: ball",
    line: "ballonrod cx cy k d=3..6 x=-70..70 lab=0 lit=carriage|rod|ball",
    demo: { line: "ballonrod 470 400 22 d=4 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ball" }, hold: 1.2 }, { set: { x: 6, lit: "carriage" }, hold: "settle" }, { set: { x: -4, lit: "rod" }, hold: "settle" }, { set: { x: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const r = ISO.clamp(ISO.num(o, "d", 4), 3, 6) / 2, st = { x: ISO.clamp(ISO.num(o, "x", 0), -70, 70) }, want = { x: st.x };
      // the rider's post is the rod: it goes up into the ball (its top hidden inside it)
      const rd = B03.rider(P, ZB - r * 0.6);
      const collar = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.85, ZB - r - 0.15, 0.4, P, 20), { tone: "mid" }));
      const ball = ISO.tinted(ISO.T.rubber, S(G.sphereOf([0, 0, ZB], r, P), { tone: "hi" }));
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="move"><g data-name="carriage">${rd.carriage}${rd.screw}</g><g data-name="rod">${rd.post}${collar}</g><g data-name="ball">${ball}</g>` +
        `<g data-part="words">${LAB.word(P, lab, [0, 0, ZB + r + 1.2], "opaque ball", "#556") + LAB.word(P, lab, [0, 3.9, -1.6], "carriage", "#556", { anchor: "start", dy: 12 })}</g></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.attr(el.move, "transform", K.translateAlong(P, [st.x, 0, 0]));
        g.anchors = { ball: [+st.x.toFixed(3), 0, ZB] };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.x !== undefined && Number.isFinite(+p.x)) want.x = ISO.clamp(+p.x, -70, 70);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.x = ISO.follow(st.x, want.x, dt, 0.4, ISO.still());
        if (Math.abs(st.x - want.x) < 0.01) st.x = want.x;
        draw();
        return st.x !== want.x;
      };
      g.readout = () => `opaque ball ${(2 * r).toFixed(1)} cm across, centre 13.5 cm over the rail · ${st.x >= 0 ? "+" : ""}${st.x.toFixed(1)} cm along it`;
      draw();
      return g;
    },
  });
})();
