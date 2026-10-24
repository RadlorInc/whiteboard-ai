// "flask cx cy size k=conical|round c=green level=0.4 lab=1 lit=flask|scale|ring|stopper" — lab flasks.
// conical: a 250 mL Erlenmeyer, flat base, straight cone to a beaded neck, approximate marks at 50 mL steps printed on
// its side and a white marking spot. round: a 250 mL round-bottomed flask with a long neck, sitting in a cork ring
// (it cannot stand on its own). level is the fraction of the body (below the neck) that is full; the volume in the
// readout is integrated from the glass's own profile. set({ level, c, k }); a colour change blends over a second.
(() => {
  const K = window.K, G = window.G;
  const MAT = { x: -64, y: -60, w: 128, d: 120, r: 4 };
  const CONE = [[0, 39], [0.8, 41, 1], [2.6, 42.4, 1], [5, 42.6, 1], [8, 41.4], [96, 15.5, 1], [102, 13.2, 1], [106, 12.6], [134, 12.6], [135, 14, 1], [137.5, 14.3, 1], [139.5, 13.4]];
  const RB = 41, ROUND = (() => {
    const out = [];
    for (let i = 1; i <= 15; i++) { const s = (i / 16) * (2 * RB - 9); out.push([s, Math.sqrt(Math.max(0, RB * RB - (s - RB) ** 2)), 1]); }
    out.push([2 * RB - 6, 12.4, 1], [2 * RB - 3, 11.8], [2 * RB + 50, 11.8], [2 * RB + 51, 13.2, 1], [2 * RB + 53.5, 13.4, 1], [2 * RB + 55, 12.4]);
    return [[0, 2]].concat(out);
  })();
  const BODY = { conical: 98, round: 2 * RB - 8 };

  ISO.add({
    name: "flask", title: "Flask (conical or round)", compare: "flask 480 250 220 k=conical c=green",
    about: "A 250 mL conical (Erlenmeyer) flask, or a round-bottomed flask in a cork ring, holding a coloured solution.",
    line: "flask cx cy size k=conical|round c=green level=0.4 lab=1 lit=flask|scale|ring",
    demo: { line: "flask 480 270 230 k=conical c=colourless level=0.35", script: [{ set: { c: "pink" }, hold: "settle" }, { set: { level: 0.6, lit: "scale" }, hold: "settle" }, { set: { k: "round", c: "green", level: 0.5, lit: "ring" }, hold: "settle" }] },
    make([cx, cy, size = 220], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const lab = o.lab !== "0", W = size * 1.5, H2 = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [-43, -43, 150], [43, 43, 150]], cx, cy, W, H2, { azimuth: 52, elevation: 22 }, parent);
      const st = { k: o.k === "round" ? "round" : "conical", f: ISO.clamp(ISO.num(o, "level", 0.4), 0, 1), c0: o.c || "green", c1: o.c || "green", mixT: 1 };
      const want = { f: st.f };
      let lit = o.lit || "", V, el, z0, built = "";
      const w = ISO.writer();
      const build = () => {
        const round = st.k === "round";
        z0 = round ? 11 : 3;
        V = LAB.vessel(P, [0, 0, z0], round ? ROUND : CONE, { base: round ? 1.6 : 2 });
        const stat = [LAB.mat(P, MAT, 3, "lo", ""), ISO.plate(P, { x: 20, y: 42, w: 34, d: 11, r: 1 })];
        let ring = "";
        if (round) {
          // a cork ring: a short thick annulus the ball sits in
          ring = `<g data-name="ring" style="${ISO.T.wood}">${S(G.ringBand(3, 13, 17, 27, LAB.Z([0, 0, 0]), P), { tone: "hi" })}</g>`;
        }
        let marks = "";
        if (!round) {
          const ml = [50, 100, 150, 200], ss = ml.map((m) => V.levelFor(m)), face = V.facing - 0.5, minor = [], rule = [];
          for (let s = ss[0]; s <= ss[3] + 1e-6; s += 1) rule.push(K.iso(G.pointOf(V.F, s, V.rAt(s) + 0.15, face), P));
          ss.forEach((s) => minor.push(K.pathOf([0, 0.5, 1].map((k) => K.iso(G.pointOf(V.F, s, V.rAt(s) + 0.15, face - (k * 5) / V.rAt(s)), P)))));
          marks = `<g data-name="scale">${L(K.pathOf(rule), { tone: "mid" })}${L(minor.join(""), { tone: "mid", free: "end" })}${ml.map((m, i) => LAB.faceText(P, G.pointOf(V.F, ss[i] - 1.2, V.rAt(ss[i]) + 0.3, face - 9 / V.rAt(ss[i])), G.mul3(G.tangentOf(V.F, face), -1), String(m), 3.4)).join("")}` +
            `${LAB.faceText(P, G.pointOf(V.F, 22, V.rAt(22) + 0.3, V.facing + 0.45), G.mul3(G.tangentOf(V.F, V.facing + 0.45), -1), "250 mL", 5)}</g>`;
        }
        // round flask: the back half of the cork ring first, the glass, then the front half over the ball's bottom
        g.innerHTML = `<g>${stat.join("")}${round ? ring : ""}</g><g data-name="flask">${V.back()}</g><g data-part="liquid"></g><g>${V.front()}</g>${marks}` +
          `<g data-part="words"></g>`;
        el = LAB.parts(g); built = st.k;
      };
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const levelZ = () => (V.base0 ??= V.levelFor(0)) + (BODY[st.k] - 2) * st.f;
      const draw = () => {
        if (built !== st.k) build();
        const z = levelZ(), c = colour();
        w.rebuild(el.liquid, `${z.toFixed(2)} ${c}`, () => V.liquid(z, c));
        if (lab) w.rebuild(el.words, `${st.k} ${Math.round(V.vol(z))} ${st.c1}`, () => LAB.word(P, lab, [0, 0, z0 + V.H + 12], st.k === "round" ? "round-bottomed flask" : "conical flask", "#556") + LAB.word(P, lab, V.at(z, -1.3, 6), `${Math.round(V.vol(z))} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k) st.k = p.k === "round" ? "round" : "conical";
        if (p.level !== undefined) want.f = ISO.clamp(+p.level, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `${st.k === "round" ? "round-bottomed" : "conical"} flask · ${Math.round(V.vol(levelZ()))} mL of 250 mL · ${st.c1} solution`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
