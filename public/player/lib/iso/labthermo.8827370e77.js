// "labthermo cx cy k aim=down|up t=-10..110 lab=0 lit=bulb|stem|scale" — a PART (PARTS.md): a 300 mm liquid-in-glass
// lab thermometer, origin the bulb's tip. aim=down: the bulb points down (as it stands in a beaker), aim=up: it points
// up. A 6 mm glass stem, a slim red spirit bulb and thread, a scale printed every 2 °C from −10 to 110 °C (long and
// numbered every 10; 1.9 mm per °C) whose ticks hang from a rule on the stem, and the 76 mm immersion line. The whole
// part is drawn with a multiply blend, as clear glass is: placed at a beaker's `inside`, the beaker's front glass and
// liquid show through the stem, so it reads as standing in the liquid. Built in mm; anchors in cm. set({ t }).
(() => {
  const K = window.K, G = window.G;
  const LEN = 300, S0 = 50, MM = 1.9, IMM = 76;   // length, helper radius, s of −10 °C, mm per °C, immersion
  const sOf = (T) => S0 + (T + 10) * MM;

  ISO.add({
    name: "labthermo", title: "Lab thermometer (part)", compare: null,
    about: "A 30 cm glass lab thermometer, −10 to 110 °C, its red thread standing at the temperature; a part to stand in a beaker or hold in a clamp. anchors: top",
    line: "labthermo cx cy k aim=down|up t=-10..110 lab=0 lit=bulb|stem|scale",
    demo: { line: "labthermo 480 500 15 t=20", script: [{ set: { t: 80 }, hold: "settle" }, { set: { lit: "bulb" }, hold: 1.5 }, { set: { t: 5, lit: "scale" }, hold: "settle" }, { set: { lit: "stem" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ax = o.aim === "up" ? [0, 0, -1] : [0, 0, 1], foot = [0, 0, 0], F = G.frameAlong(foot, ax), at = (s) => ax.map((v) => v * s);
      const st = { T: ISO.clamp(ISO.num(o, "t", 20), -10, 110) }, want = { T: st.T };
      let lit = o.lit || "";
      g.style.mixBlendMode = "multiply";
      // the glass: a slim bulb, a neck, the 6 mm stem, a rounded top; the red spirit filling the bulb (as LAB.thermometer,
      // with real proportions: the bulb is narrower than the stem)
      const S = LAB.S, RS = 3, rc = RS * 0.78;   // stem radius, the printed face's radius (the stem's flat front)
      const glass = `<g style="${ISO.T.glass}">${S(G.solidOf([[0, 0.1], [0.6, 1.6, 1], [1.8, 2.4, 1], [3.5, 2.6], [13, 2.6], [16, 2.3, 1], [20, RS], [LEN - 3, RS], [LEN - 1.4, RS * 0.82, 1], [LEN - 0.4, RS * 0.45, 1], [LEN, 0.1]], F, Pm), { tone: "lo" })}</g>`;
      const bulb = `<g style="${ISO.T.red}">${S(G.solidOf([[0.7, 0.2], [1.4, 1.5, 1], [2.6, 1.95, 1], [12.4, 1.95], [13.6, 1.3, 1], [14.6, 0.45]], F, Pm), { tone: "hi", crease: "none" })}</g>`;
      // the printed scale on the stem's front: a rule just right of the thread, ticks every 2 °C hanging from it (long
      // every 10), the numbers to the thread's left, and the immersion line
      const face = G.angleToward(F, G.viewOf(Pm)), tan = (a) => G.mul3(G.tangentOf(F, a), -1), up = ax[2] > 0 ? ax : ax.map((v) => -v);
      const pt = (s, a) => K.iso(G.pointOf(F, s, rc, face + a), Pm), rule = [], minor = [], major = [], scale = [];
      for (let T = -10; T <= 110; T += 1) rule.push(pt(sOf(T), 0.42));
      for (let T = -10; T <= 110; T += 2) (T % 10 ? minor : major).push(K.pathOf([pt(sOf(T), 0.42), pt(sOf(T), T % 10 ? 0.8 : 1.15)]));
      scale.push(L(K.pathOf(rule), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
      for (let T = -10; T <= 110; T += 10) scale.push(LAB.faceText(Pm, G.pointOf(F, sOf(T) + (ax[2] > 0 ? -0.65 : 0.65), rc + 0.05, face - 0.78), tan(face - 0.78), String(T).replace("-", "−"), 1.8, "#3d4650", up));
      scale.push(L(G.arcOf(F, IMM, RS + 0.02, Pm), { tone: "lo", free: true }), LAB.faceText(Pm, G.pointOf(F, IMM + (ax[2] > 0 ? 1.6 : -1.6), rc + 0.05, face - 0.8), tan(face - 0.8), "76 mm", 1.1, "#3d4650", up));
      g.innerHTML = `<g data-name="stem">${glass}</g><g data-name="bulb">${bulb}</g><g data-name="stem" data-part="thread"></g><g data-name="scale">${scale.join("")}</g><g data-part="words"></g>`;
      g.anchors = { top: at(LEN / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const Tq = Math.round(st.T * 4) / 4;
        w.rebuild(el.thread, String(Tq), () => LAB.thread(Pm, foot, ax, sOf(Tq), 2.6));
        if (lab) w.rebuild(el.words, String(Math.round(st.T)), () => LAB.word(Pm, lab, at(sOf(st.T)).map((v, i) => v + [0, 12, 0][i]), `${Math.round(st.T)} °C`, "#c0392b", { anchor: "start", size: 14 }) + LAB.word(Pm, lab, at(LEN + 10), "thermometer", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.t !== undefined) want.T = ISO.clamp(+p.t, -10, 110); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // the thread moves at most 25 °C a second, easing in at the end (as beakertherm.js)
        const d = want.T - st.T, step = Math.sign(d) * Math.min(Math.abs(d), dt * 25, Math.abs(d) * dt * 4 + dt * 2);
        st.T = ISO.still() ? want.T : st.T + step;
        if (Math.abs(want.T - st.T) < 0.05) st.T = want.T;
        draw();
        return st.T !== want.T;
      };
      g.readout = () => `thermometer reads ${st.T.toFixed(0)} °C · −10 to 110 °C, marks every 2 °C · thread ${(sOf(st.T) - 5).toFixed(0)} mm long`;
      draw();
      return g;
    },
  });
})();
