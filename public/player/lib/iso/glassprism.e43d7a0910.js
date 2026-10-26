// "glassprism cx cy k deg=0..360 lab=0 lit=prism" — a PART (PARTS.md, batch 5): the 60° equilateral flint-glass prism
// of prism.js, 5 cm sides and 3 cm tall (n = 1.615 red to 1.650 violet), standing on its triangular end, its origin
// the surface point under its middle. deg turns it about its upright axis (eased): at 0 the apex points +y and the base
// face runs along x, so a beam along −x meets two faces 60° apart. On a turntable that turns, use turntable prism=1
// (it carries this prism and turns it with the table). Static apart from deg. World units: 1 = 1 cm. anchors: centre top.
(() => {
  const K = window.K;
  ISO.add({
    name: "glassprism", title: "Glass prism (part)", compare: null,
    about: "A 60° flint-glass prism, 5 cm sides, 3 cm tall, standing on its end; deg turns it (0 = apex toward +y); white light through two faces splits into colours. anchors: centre top",
    line: "glassprism cx cy k deg=0..360 lab=0 lit=prism",
    demo: { line: "glassprism 480 330 52", script: [{ set: {}, hold: 1 }, { set: { deg: 30 }, hold: "settle" }, { set: { deg: 60, lit: "prism" }, hold: "settle" }, { set: { deg: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const B25 = window.B25, LAB = window.LAB, { side, h } = B25.PRISM;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { d: ISO.num(o, "deg", 0) % 360 }, want = { d: st.d }, w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = B25.GLASS + `<path class="iso-halo" d="${K.haloOf({ x: -2.6, y: -1.6, w: 5.2, d: 4.6, r: 2 }, 0, 0.02, P)}"/>` +
        `<g data-name="prism" data-part="prism"></g><g data-part="words">${LAB.word(P, lab, [0, 0, h + 0.8], "60° glass prism", "#556")}</g>`;
      const el = LAB.parts(g);
      const draw = () => {
        const q = Math.round(st.d * 4) / 4;
        w.rebuild(el.prism, String(q), () => B25.prism(P, 0, B25.rad(q)));
        B25.light(w, g, lit);
      };
      g.anchors = { centre: [0, 0, h / 2], top: [0, 0, h] };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) want.d = +p.deg;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.d = ISO.follow(st.d, want.d, dt, 0.45, ISO.still());
        if (Math.abs(st.d - want.d) < 0.05) st.d = want.d;
        draw();
        return st.d !== want.d;
      };
      g.readout = () => `60° flint prism, ${side} cm sides, ${h} cm tall · turned ${Math.round(st.d)}° · least deviation ${(2 * Math.asin(B25.PRISM.n * Math.sin(Math.PI / 6)) * 180 / Math.PI - 60).toFixed(1)}° for green when the beam passes through it symmetrically`;
      draw();
      return g;
    },
  });
})();
