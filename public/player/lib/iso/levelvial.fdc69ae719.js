// "levelvial cx cy k tilt=-10..10 lab=0 lit=vial" — a PART (PARTS.md, batch 5): the spirit-level vial set into the
// lever plank, alone: a 6 × 1.2 cm glass vial of yellow spirit in a brass seat 6.6 × 1.8 cm, two rings round its middle
// and the bubble. Its origin is the surface point under its middle. tilt (degrees, + = the +x end high) turns it about
// the origin and the bubble drifts to the high end, 5 mm per degree (vial curve 30 cm), to the vial's end at about
// ±4°; set({ tilt }) eases it. leverplank carries the same vial. Taken from lever.js. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "levelvial", title: "Spirit level vial (part)", compare: null,
    about: "A spirit-level vial (6 × 1.2 cm) in a brass seat; tilt it and the bubble drifts to the high end. anchors: none",
    line: "levelvial cx cy k tilt=-10..10 lab=0 lit=vial",
    demo: { line: "levelvial 480 300 60 tilt=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { tilt: 3 }, hold: "settle" }, { set: { tilt: -8, lit: "vial" }, hold: "settle" }, { set: { tilt: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B19 = window.B19, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const rad = (d) => (d * Math.PI) / 180, st = { t: rad(ISO.clamp(ISO.num(o, "tilt", 0), -10, 10)) };
      st.b = B19.bubbleOf(st.t); const want = { t: st.t };
      let lit = o.lit || "";
      const w = ISO.writer();
      g.innerHTML = `<g data-name="vial"></g><g data-part="words"></g>`;
      const el = g.querySelector('[data-name="vial"]'), words = g.querySelector('[data-part="words"]');
      const draw = () => {
        const tt = Math.round(st.t * 1000) / 1000, b = Math.round(st.b * 50) / 50, c = Math.cos(tt), s = Math.sin(tt);
        const at = (u, wz, y) => [u * c - wz * s, y, u * s + wz * c];
        w.rebuild(el, `${tt} ${b}`, () => `<path class="iso-halo" d="${K.haloOf({ x: -3.3, y: -0.9, w: 6.6, d: 1.8, r: 0.2 }, 0, 1.2, P)}"/>` + B19.vial(at, P, b));
        if (lab) w.rebuild(words, "w", () => ISO.word(K.iso([0, 0, 1.3], P), "spirit level vial", "#555", { size: 14, dy: -12 }));
        B19.light(w, g, lit);
      };
      g.set = (p) => { if (p.tilt !== undefined && Number.isFinite(+p.tilt)) want.t = rad(ISO.clamp(+p.tilt, -10, 10)); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        st.t = ISO.follow(st.t, want.t, dt, 0.35, calm);
        st.b = ISO.follow(st.b, B19.bubbleOf(st.t), dt, 0.25, calm);   // the bubble lags its glass a little
        if (Math.abs(st.b - B19.bubbleOf(want.t)) < 0.005 && st.t === want.t) st.b = B19.bubbleOf(want.t);
        draw();
        return st.t !== want.t || st.b !== B19.bubbleOf(want.t);
      };
      g.readout = () => `vial tilted ${((st.t * 180) / Math.PI).toFixed(1)}° · bubble ${(st.b * 10).toFixed(0)} mm toward the ${st.b > 0.01 ? "+x (high) end" : st.b < -0.01 ? "−x (high) end" : "middle: level"}`;
      draw();
      return g;
    },
  });
})();
