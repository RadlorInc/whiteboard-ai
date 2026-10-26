// "lightgate cx cy k aim=up|side block=0|1 stand=0|1 sz=5..60 lab=0 lit=gate|beam|led|stand" — a PART (PARTS.md,
// batch 5): a school light gate, its origin the middle of its infrared beam (where the ball or the bob passes). A
// U-shaped blue housing 8 × 6 × 2 cm: a back bar with its cable socket and printed name, two arms with the emitter
// window on one inner face (the detector on the other) and a red LED on an arm's tip; a 1 cm steel rod out of the
// back bar to clamp it in a boss (`mount` = the rod's end). aim=up: the arms point up (a pendulum bob swings through
// the gap along x); aim=side: the gate lies level, arms toward +x (a falling ball drops through the gap). The beam
// crosses the gap along y. stand=1 gives it its own foot and rod, the beam sz cm over the foot. set({ block }): 1 =
// something is in the beam (the beam is cut, the LED lights). World units: 1 = 1 cm. anchors: beam mount foot.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const BLUE = ISO.tint("#5b8fd6", ["#2a5598", "#3363a8", "#3d70b6", "#4a7fc4"], "#132a4f");
  const PAINT = ISO.tint("#d5dde6", ["#7d8b99", "#909dab", "#a3afbb", "#b8c2cc"], "#2b3640");
  // the gate's own frame: a along the arms (back bar −4.5..−3, tips at +1.5), b across the gap (the beam), c through it
  const A0 = -4.5, A1 = -3, TIP = 1.5, HB = 4, ARM = 1.2, HC = 1, ROD = 3;

  function gateSvg(P, at, aimUp, stand, sz) {
    const box = (U, V, W, tone = "mid") => ISO.tinted(BLUE, ISO.box(at, P, U, V, W, tone)), out = [], st = [];
    const pt = (a, b, c) => K.iso(at(a, b, c), P), dir = (a, b, c) => { const o = at(0, 0, 0), p = at(a, b, c); return p.map((x, i) => x - o[i]); };
    // the stand (stand=1): foot, rod (straight down under the bar, or up beside it with a boss for aim=side)
    const zf = -sz;
    if (stand) {
      const fx = aimUp ? 0 : A0 - ROD - 1;
      st.push(`<path class="iso-halo" d="${K.haloOf({ x: fx - 4.5, y: -4.5, w: 9, d: 9, r: 4.5 }, zf, 1.2, P)}"/>`);
      st.push(ISO.tinted(PAINT, S(K.cylinder(fx, 0, 4.2, zf, 1.2, P, 32, 0.3), { tone: "mid" })), ISO.tinted(ISO.T.rubber, S(K.cylinder(fx, 0, 4.3, zf - 0.01, 0.25, P, 32), { tone: "lo" })));
      if (aimUp) st.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.5, zf + 1.2, A0 - zf - 1.2, P, 18), { tone: "hi", crease: "none" })));
      else {
        st.push(ISO.tinted(ISO.T.steel, S(K.cylinder(fx, 0, 0.6, zf + 1.2, -zf - 1.2 + 4, P, 18, 0.15), { tone: "hi", crease: "none" })));
        st.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [fx - 1, fx + 1], [-1, 1], [-1, 1], "mid")), window.B03.knob(P, window.B03.Y([fx, 1, 0]), 0, 0.6, 0.45));
      }
    }
    // the mounting rod out of the back bar (for aim=up with a stand the stand's rod is it)
    if (!(aimUp && stand)) {
      const Fr = G.frameAlong(at(A0, 0, 0), dir(-1, 0, 0));
      st.push(ISO.tinted(ISO.T.steel, S(G.disc(0, ROD, 0.5, Fr, P), { tone: "hi" })));
    }
    // the U: back bar, far arm (−b), the emitter window on its inner face, the near arm (+b) with the LED on its tip
    out.push(box([A0, A1], [-HB, HB], [-HC, HC]));
    out.push(window.LAB.faceText(P, at((A0 + A1) / 2 - 0.05, 0, HC + 0.02), dir(0, -1, 0), "LIGHT GATE", 0.5, "#eef4fb", aimUp ? [0, 0, 1] : dir(-1, 0, 0)));
    // cable socket on the bar's near end (+b face): a ring and its pins
    const Fs = G.frameAlong(at((A0 + A1) / 2, HB, 0), dir(0, 1, 0));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(0, 0.25, 0.25, 0.55, Fs, P), { tone: "mid" })), D([0, 1, 2].map((i) => K.iso(G.pointOf(Fs, 0.02, 0.15, i * 2.1), P)), { size: 0.3 }));
    out.push(box([A1, TIP], [-HB, -HB + ARM], [-HC, HC]));
    const Fe = G.frameAlong(at(0, -HB + ARM, 0), dir(0, 1, 0));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.08, 0.5, Fe, P), { tone: "mid" })), `<g style="${ISO.tint("#7a2a3a", ["#3a1018", "#4a1620", "#5a1c28", "#6a2230"], "#1a0508")}">${S(G.lathe([[0.08, 0], [0.08, 0.28], [0.22, 0.2, 1], [0.3, 0]], Fe, P), { tone: "hi" })}</g>`);
    return { stand: st.join(""), back: out.join(""), pt, dir, box };
  }

  ISO.add({
    name: "lightgate", title: "Light gate (part)", compare: null,
    about: "A school light gate: a U-shaped sensor with an infrared beam across its gap, an LED that lights when something cuts the beam, on a rod for a boss or its own stand; arms up (a pendulum) or level (a falling ball). anchors: beam mount foot",
    line: "lightgate cx cy k aim=up|side block=0|1 stand=0|1 sz=5..60 lab=0 lit=gate|beam|led|stand",
    demo: { line: "lightgate 470 230 22 aim=up stand=1 sz=12 lab=1", script: [{ set: {}, hold: 1 }, { set: { block: 1, lit: "led" }, hold: 1.2 }, { set: { block: 0, lit: "beam" }, hold: 1.2 }, { set: { aim: "side", lit: "stand" }, hold: 1.2 }, { set: { block: 1, lit: "gate" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const m = { aim: o.aim === "side" ? "side" : "up", block: o.block === "1", stand: o.stand === "1", sz: ISO.clamp(ISO.num(o, "sz", 10), 5, 60) };
      let lit = o.lit || "", parts = null;
      const build = () => {
        const aimUp = m.aim === "up", sz = Math.max(m.sz, aimUp ? 6.2 : 2.5);
        const at = aimUp ? (a, b, c) => [c, b, a] : (a, b, c) => [a, b, c];
        parts = gateSvg(P, at, aimUp, m.stand, sz);
        g.innerHTML = `<g data-name="stand">${parts.stand}</g><g data-name="gate">${parts.back}</g><g data-name="beam"><g data-part="beam"></g></g>` +
          `<g data-name="gate">${parts.box([A1, TIP], [HB - ARM, HB], [-HC, HC])}</g><g data-name="led"><g data-part="led"></g></g>` +
          `<g data-part="words">${LAB.word(P, lab, at(TIP + 1.2, HB, 0), "light gate", "#556", { anchor: "start" })}</g>`;
        g.anchors = { beam: [0, 0, 0], mount: (aimUp && m.stand) ? [0, 0, -sz] : at(A0 - ROD, 0, 0).map((x) => +x.toFixed(3)), foot: m.stand ? [aimUp ? 0 : A0 - ROD - 1, 0, -sz] : [0, 0, 0] };
        g._k = "";
        draw();
      };
      const draw = () => {
        const el = LAB.parts(g), w = ISO.writer(), key = String(m.block);
        if (g._k !== key) {
          g._k = key;
          const at = m.aim === "up" ? (a, b, c) => [c, b, a] : (a, b, c) => [a, b, c];
          // the beam: a faint red line between the windows while it is clear
          el.beam.innerHTML = m.block ? "" : `<path d="${K.pathOf([K.iso(at(0, -HB + ARM + 0.3, 0), P), K.iso(at(0, HB - ARM, 0), P)])}" stroke="#e5302a" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.06).toFixed(2)}" stroke-dasharray="${(G.scaleOf(P) * 0.3).toFixed(1)} ${(G.scaleOf(P) * 0.2).toFixed(1)}" stroke-opacity=".7" data-free=""/>`;
          const c = m.block ? "#ff3b2a" : "#6a2a26", F = G.frameAlong(at(TIP, HB - ARM / 2, 0), at(1, 0, 0));
          el.led.innerHTML = `<g style="${ISO.tint(c, [c, c, c, c], "#3a1410")}">${S(G.lathe([[0, 0], [0, 0.3], [0.2, 0.24, 1], [0.32, 0]], F, P), { tone: "hi" })}</g>` +
            (m.block ? (() => { const p = K.iso(at(TIP + 0.25, HB - ARM / 2, 0), P); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.75).toFixed(1)}" fill="#ff3b2a" fill-opacity=".28"/>`; })() : "");
        }
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        let again = false;
        if ((p.aim === "up" || p.aim === "side") && p.aim !== m.aim) { m.aim = p.aim; again = true; }
        if (p.stand !== undefined && (String(p.stand) === "1") !== m.stand) { m.stand = String(p.stand) === "1"; again = true; }
        if (p.sz !== undefined && Number.isFinite(+p.sz)) { m.sz = ISO.clamp(+p.sz, 5, 60); again = true; }
        if (p.block !== undefined) m.block = String(p.block) === "1";
        if (p.lit !== undefined) lit = p.lit;
        if (again) build(); else draw();
      };
      g.update = () => false;
      g.readout = () => `light gate, ${m.aim === "up" ? "arms up" : "lying level"} · infrared beam ${m.block ? "cut: something is in the gate" : "clear"}`;
      build();
      return g;
    },
  });
})();
