// "globe cx cy r hours=0..24 spin=0|1 lab=1 lit=axis|meridian|stand" — a desk globe on its tilted stand.
// A turned wooden foot, a brass pillar, and a brass half-meridian that holds the ball by two pins at the poles, the
// axis leaning 23.4° from upright as Earth's does. set({ hours }) turns the ball west to east, 15° an hour (one full
// turn in 24 h of solar time; 23 h 56 min against the stars); spin=1 keeps it turning.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const { add3, sub3, mul3, unit3, cross3, dot3 } = G;
  const TILT = 23.4, RB = 50, ZC = 96;

  ISO.add({
    name: "globe", title: "Desk globe", compare: "globe 480 270 130",
    about: "A desk globe on its stand: the axis leans 23.4° like Earth's, and the ball turns west to east, 15° every hour.",
    line: "globe cx cy r hours=0..24 spin=0|1 lab=1 lit=axis|meridian|stand",
    demo: { line: "globe 480 270 130", script: [{ set: { lit: "axis" }, hold: 1.6 }, { set: { lit: "", hours: 12 }, hold: "settle" }, { set: { hours: 24 }, hold: "settle" }] },
    make([cx, cy, r = 130], o, t, parent) {
      const lab = o.lab !== "0", W = r * 3.4, H = r * 3.5;
      const { P, g } = ISO.frame([[-RB - 6, -RB - 6, 0], [RB + 6, RB + 6, 0], [0, 0, ZC + RB + 12], [0, 0, ZC - RB], [-30, 30, 0], [30, -30, 0]], cx, cy, W, H, { azimuth: 45, elevation: 24 }, parent);
      const cam = K.cameraOf(P), dirH = [cam.sinA, -cam.cosA, 0], V = G.viewOf(P);
      const a = unit3(add3(mul3(dirH, Math.sin(TILT * EARTH.R)), [0, 0, Math.cos(TILT * EARTH.R)]));
      const C = [0, 0, ZC], RM = RB + 4.5, SP = sub3(C, mul3(a, RM + 2)), NP = add3(C, mul3(a, RM + 2));
      // the half-meridian's plane holds the axis, turned 12° from the picture plane so it reads round
      let v0 = unit3(cross3(a, cross3(dirH, a))); if (dot3(v0, dirH) > 0) v0 = mul3(v0, -1);
      const ph = 12 * EARTH.R, mv = unit3(add3(mul3(v0, Math.cos(ph)), mul3(cross3(a, v0), Math.sin(ph))));
      const pieces = EARTH.bandArc(P, C, mv, a, RM, 1.6, 1.4, -Math.PI / 2 - 0.02, Math.PI / 2 + 0.02, 44);
      // meridian degree marks every 10° on its face: short ticks hanging from its outer edge
      const nrm = unit3(cross3(mv, a)), tick = (deg) => { const t = deg * EARTH.R, d = add3(mul3(mv, Math.cos(t)), mul3(a, Math.sin(t))), k = deg % 30 ? 1.2 : 2.4; return K.pathOf([add3(C, add3(mul3(d, RM + 1.6), mul3(nrm, 1.45))), add3(C, add3(mul3(d, RM + 1.6 - k), mul3(nrm, 1.45)))].map((p) => K.iso(p, P))); };
      const ticks = (front) => `<path d="${Array.from({ length: 17 }, (_, i) => -80 + i * 10).filter((d) => (K.depthOf(add3(C, mul3(add3(mul3(mv, Math.cos(d * EARTH.R)), mul3(a, Math.sin(d * EARTH.R))), RM)), P) > K.depthOf(C, P)) === front && dot3(nrm, V) > 0).map(tick).join("")}" fill="none" stroke="#6b5114" stroke-width=".6"/>`;
      const back = ISO.tinted(ISO.T.brass, pieces.filter((p) => p.depth <= K.depthOf(C, P)).map((p) => p.svg).join("")), front = ISO.tinted(ISO.T.brass, pieces.filter((p) => p.depth > K.depthOf(C, P)).map((p) => p.svg).join(""));
      // foot: a turned wooden base under the south pin, a brass pillar and a collar that grips the meridian's end
      const B = [SP[0], SP[1]], foot = ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, 30], [1.5, 30], [2.2, 29, 1], [4, 26, 1], [5, 21], [6.5, 20], [7.5, 15, 1], [9, 10], [9, 0]], LAB.Z([B[0], B[1], 0]), P, { steps: 72 }), { tone: "mid" }));
      const pillar = ISO.tinted(ISO.T.brass, S(G.lathe([[9, 0], [9, 6], [11, 6], [12, 4.4, 1], [16, 3.4, 1], [SP[2] - 12, 3], [SP[2] - 10, 4.4], [SP[2] - 6, 4.4], [SP[2] - 6, 0]], LAB.Z([B[0], B[1], 0]), P, { steps: 40 }), { tone: "mid" }));
      // audit: the pole pins run into the ball and the hubs on purpose (pins in sockets)
      const mEnd = (end, sgn) => EARTH.rod(P, add3(C, mul3(a, sgn * (RB - 1))), add3(C, mul3(a, sgn * (RM + 3))), 1.3);
      const hub = (end, sgn) => ISO.tinted(ISO.T.brass, S(G.disc(0, 2.2, 3.2, G.frameAlong(add3(C, mul3(a, sgn * (RM + 1.6))), mul3(a, sgn)), P, { steps: 28 }), { tone: "mid" }));
      const neck = EARTH.rod(P, [B[0], B[1], SP[2] - 6], add3(SP, mul3(a, -1.2)), 2.6);
      g.innerHTML = `<g data-name="stand">${foot}${pillar}${neck}</g><g data-name="meridian">${back}${ticks(false)}${mEnd(SP, -1)}${hub(SP, -1)}</g><g data-part="ball"></g>` +
        `<g data-name="axis">${mEnd(NP, 1)}${hub(NP, 1)}</g><g data-name="meridianFront">${front}${ticks(true)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.querySelector('[data-name="meridianFront"]').dataset.name = "meridian";
      const st = { h: ISO.clamp(ISO.num(o, "hours", 0), 0, 48), spin: o.spin === "1" }, want = { h: st.h };
      let lit = o.lit || "";
      const draw = () => {
        const key = Math.round(st.h * 4) / 4, F = EARTH.frame(C, RB, a, -0.6 + key * 15 * EARTH.R);
        w.rebuild(el.ball, String(key), () => EARTH.ball(P, F, { tint: ISO.tint("#e3f0fb", ["#a9c9e8", "#bcd6ee", "#cfe2f4", "#dceaf7"], "#1f4f8f"), land: "#cfe7b9", lats: [[0, "#4d7fb8"], [23.4, "#7fa5cf"], [-23.4, "#7fa5cf"]] }));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso(add3(NP, [0, 0, 8]), P), "axis tilted 23.4°", "#6b5114", { size: 14, anchor: "start", dy: -2 }) + ISO.word(K.iso([B[0], B[1], 0], P), "stand", "#7a5a2e", { size: 13, dy: 22 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.hours !== undefined) want.h = ISO.clamp(+p.hours, 0, 48);
        if (p.spin !== undefined) st.spin = String(p.spin) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (st.spin && !ISO.still()) want.h += dt * 1.5;
        st.h = ISO.follow(st.h, want.h, dt, 0.9, ISO.still());
        if (Math.abs(st.h - want.h) < 0.01) st.h = want.h;
        draw();
        return st.spin || st.h !== want.h;
      };
      g.readout = () => `turned ${Math.round(st.h * 15)}° in ${st.h.toFixed(1)} h · 15° an hour, west to east (a spot on the equator moves 1,670 km/h) · axis 23.4° from upright`;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
