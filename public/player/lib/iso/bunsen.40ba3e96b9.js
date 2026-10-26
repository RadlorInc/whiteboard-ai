// "bunsen cx cy size k=blue|yellow air=0-1 lab=1 lit=collar|burner|tap|hose" — a Bunsen burner on a heat-proof mat.
// Heavy base, gas inlet with a ribbed nozzle, a red rubber hose to the bench gas tap, the barrel and its turning collar.
// The collar's hole lines up with a hole in the barrel: shut, no air mixes in and the gas burns with a tall, wavy,
// yellow (luminous) safety flame, about 300 °C and sooty; open, air premixes and it roars with a short blue flame with a
// pale inner cone, about 1500 °C just above the cone. set({ k: "yellow"|"blue" }) or set({ air: 0–1 }) turns the collar.
(() => {
  const K = window.K, G = window.G;
  const MAT = { x: -70, y: -60, w: 140, d: 130, r: 4 }, TAP = [-48, 46];
  let n = 0;

  ISO.add({
    name: "bunsen", title: "Bunsen burner", compare: "bunsen 480 270 260",
    about: "A Bunsen burner: turn the collar to open the air hole and the yellow safety flame becomes a hot blue roaring flame.",
    line: "bunsen cx cy size k=blue|yellow air=0-1 lab=1 lit=collar|burner|tap|hose",
    demo: { line: "bunsen 480 270 270 k=yellow", script: [{ set: { lit: "collar" }, hold: 1.6 }, { set: { air: 0.5 }, hold: "settle" }, { set: { k: "blue" }, hold: "settle" }, { set: { k: "yellow", lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const lab = o.lab !== "0", W = size * 1.9, H2 = size * 1.75, id = `bf${n++}`;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 4), [0, 0, 220], [TAP[0], TAP[1], 60]], cx, cy, W, H2, { azimuth: 55, elevation: 22 }, parent);
      const st = { air: o.air !== undefined ? ISO.clamp(+o.air, 0, 1) : o.k === "yellow" ? 0 : 1 }, want = { air: st.air };
      let lit = o.lit || "";
      const b = LAB.bunsen(P, [0, 0], st.air, { h: 96 });
      // the bench gas tap: a turret on a flange with a nozzle and a yellow lever
      const tap = () => {
        const [x, y] = TAP, out = [S(K.cylinder(x, y, 10, 4, 3, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(x, y, 6, 7, 38, P, 24), { tone: "mid", inner: L(K.sideArc(x, y, 6, 30, P, 20), { tone: "faint" }) }), S(K.cylinder(x, y, 7, 45, 6, P, 24, 0.4), { tone: "mid" })];
        const Fn = LAB.A([x, y, 36], G.unit3([0.55, -0.83, 0]));
        out.push(S(G.solidOf([[5, 3.4], [9, 3.4], [9, 2.8], [12, 3.2], [12, 2.6], [15, 3], [15, 2.4], [19, 2.4]], Fn, P), { tone: "mid" }));
        out.push(`<g style="${ISO.T.amber}">${ISO.wbox(P, [x - 2, x + 2], [y - 3, y + 3], [51, 54], "hi")}${ISO.wbox(P, [x - 2, x + 2], [y - 22, y + 3], [54, 57], "hi")}</g>`);
        return out.join("");
      };
      // the hose from the burner's inlet nozzle to the tap's nozzle
      const inEnd = [-0.5 / 0.995 * 29, 0.86 / 0.995 * 29, 18], tapEnd = G.pointOf(LAB.A([TAP[0], TAP[1], 36], G.unit3([0.55, -0.83, 0])), 18, 0, 0);
      const hose = LAB.hose(P, LAB.bend([inEnd, [inEnd[0] - 4, inEnd[1] + 7, 16], [inEnd[0] - 9, inEnd[1] + 13, 7.5], [tapEnd[0] + 9, tapEnd[1] - 13, 7.5], [tapEnd[0] + 4, tapEnd[1] - 6, 34], tapEnd], 7), 3.2);
      g.innerHTML = LAB.flameDefs(id) + `<g>${LAB.mat(P, MAT, 4, "lo", ISO.tint("#e7e2d8", ["#b9b2a4", "#c6bfb1", "#d2ccbf", "#ddd8cc"], "#6d6658"))}</g><g data-name="tap">${tap()}</g><g data-name="hose">${hose}</g>` +
        `<g data-name="burner"><g transform="${K.translateAlong(P, [0, 0, 4])}">${b.svg}</g></g><g data-name="collar" transform="${K.translateAlong(P, [0, 0, 4])}"><g data-part="collar"></g></g><g data-part="flame"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      // the flame as a shader; without WebGL the SVG flame below draws instead
      const fx = ISO.flameFx(g, P, W, H2, el.flame, [0, 0, 100.5], 50);
      let clock = 0;
      const draw = () => {
        const a = Math.round(st.air * 40) / 40;
        w.rebuild(el.collar, String(a), () => b.collar(a));
        const tq = Math.round(clock * 24) / 24;
        if (fx) fx.flame(a);
        else w.rebuild(el.flame, `${a} ${tq}`, () => LAB.flame(P, [0, 0, 100.5], a, 50, tq, id));
        if (lab) w.rebuild(el.words, String(a), () => LAB.word(P, lab, [0, 0, 222], a > 0.6 ? "blue roaring flame" : a < 0.25 ? "yellow safety flame" : "air hole half open", a > 0.6 ? "#2b5cc4" : "#b0701a", { size: 14 }) +
          LAB.word(P, lab, [22, -10, 30], "collar (air hole)", "#556", { anchor: "start" }) + LAB.word(P, lab, [TAP[0], TAP[1], 64], "gas tap", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k) want.air = p.k === "yellow" ? 0 : 1;
        if (p.air !== undefined) want.air = ISO.clamp(+p.air, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt, c) => {
        clock = ISO.still() ? 0 : c || clock + dt;
        st.air = ISO.follow(st.air, want.air, dt, 0.4, ISO.still());
        if (Math.abs(st.air - want.air) < 0.003) st.air = want.air;
        draw();
        return st.air !== want.air;
      };
      g.readout = () => (st.air > 0.6 ? `air hole open ${Math.round(st.air * 100)}% · blue roaring flame · about 1500 °C above the inner cone · clean, no soot` : st.air < 0.25 ? "air hole shut · yellow safety flame · about 300 °C · easy to see, sooty" : `air hole ${Math.round(st.air * 100)}% open · flame turning blue and hotter`);
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
