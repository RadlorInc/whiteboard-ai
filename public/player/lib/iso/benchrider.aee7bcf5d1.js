// "benchrider cx cy k x=-70..70 post=6..20 lab=0 lit=carriage|post|screw" — a PART (PARTS.md, batch 5): a rider (carriage)
// on an optical bench's rail, its origin the rail's top under the rider (place it at=bench.zero ax=<cm>). A black
// saddle 5 × 5.4 cm over the rail, its near cheek with a knurled clamp screw and an aluminium index pointer (red line)
// over the bench's scale, a post holder with a thumbscrew, and a 1.2 cm steel post up to `post` cm over the rail top,
// where a lens holder, a slide or a screen goes (`post` anchor). set({ x }) slides it along the rail (cm, eased);
// the anchor is where it ends up. Built from B03.rider (_b03.js). World units: 1 = 1 cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "benchrider", title: "Optical bench rider (part)", compare: null,
    about: "A rider that clamps an optical bench's rail: saddle, clamp screw, index pointer over the scale, and an upright post for a lens, a slide or a screen; slides along the rail. anchors: post",
    line: "benchrider cx cy k x=-70..70 post=6..20 lab=0 lit=carriage|post|screw",
    demo: { line: "benchrider 420 330 26 post=10 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "screw" }, hold: 1.2 }, { set: { x: 8, lit: "carriage" }, hold: "settle" }, { set: { x: 0, lit: "post" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const top = ISO.clamp(ISO.num(o, "post", 10), 6, 20), st = { x: ISO.clamp(ISO.num(o, "x", 0), -70, 70) }, want = { x: st.x };
      const r = B03.rider(P, top);
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="move"><g data-name="carriage">${r.carriage}</g><g data-name="screw">${r.screw}</g><g data-name="post">${r.post}</g>` +
        `<g data-part="words">${LAB.word(P, lab, [2.6, 0, top - 1], "rider", "#556", { anchor: "start" }) + LAB.word(P, lab, [0, 3.9, -1.6], "clamp screw", "#556", { anchor: "start", dy: 12 })}</g></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.attr(el.move, "transform", K.translateAlong(P, [st.x, 0, 0]));
        g.anchors = { post: [+st.x.toFixed(3), 0, top] };
        B03.light(w, g, lit);
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
      g.readout = () => `bench rider · ${st.x >= 0 ? "+" : ""}${st.x.toFixed(1)} cm along the rail · post top ${top} cm over the rail`;
      draw();
      return g;
    },
  });
})();
