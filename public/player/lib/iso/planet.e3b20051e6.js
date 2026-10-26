// "planet cx cy r k=mercury|venus|earth|mars|jupiter|saturn|uranus|neptune|moon spin=0|1 lab=1 lit=ball|axis|stand|rings"
// One planet (or the Moon) as a classroom model: a turned wooden foot, a brass post, a ball joint and a brass axis
// rod straight through the ball at the body's true tilt (Uranus lies on its side at 97.8°, Venus is upside down at
// 177.4° and turns backwards). Saturn wears its rings (B ring, Cassini gap, A ring) in its equator's plane.
// spin=1 turns it at 1 s of demo per hour of its day: Jupiter goes round in 9.9 s, Venus barely moves.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const { add3, sub3, mul3, unit3, cross3, dot3 } = G;
  const tint = (top, d, ink) => ISO.tint(top, [d[0], d[1], d[2], d[3]], ink);
  // radius km, tilt °, day in hours (negative = turns backwards), colours
  const BODY = {
    mercury: { name: "Mercury", km: 2440, tilt: 0.03, day: 1407.6, tint: tint("#e6e2dc", ["#b3aca2", "#c2bcb3", "#d1ccc4", "#dcd8d1"], "#5a5550"), spots: "crater" },
    venus: { name: "Venus", km: 6052, tilt: 177.4, day: -5832.5, tint: tint("#fbefd2", ["#e2c27e", "#e9cf96", "#f0dcae", "#f5e5c0"], "#9a7030"), bands: [[-60, -35, "#f3e2b8"], [-15, 10, "#f6e8c6"], [30, 55, "#f0dcae"]] },
    earth: { name: "Earth", km: 6371, tilt: 23.4, day: 23.93, tint: tint("#e3f0fb", ["#a9c9e8", "#bcd6ee", "#cfe2f4", "#dceaf7"], "#1f4f8f"), land: true },
    mars: { name: "Mars", km: 3390, tilt: 25.2, day: 24.62, tint: tint("#f7d2bf", ["#d98a66", "#e19d7c", "#e8b093", "#efc2aa"], "#7a2f18"), spots: "mars" },
    jupiter: { name: "Jupiter", km: 69911, tilt: 3.1, day: 9.93, tint: tint("#f7ead8", ["#d9b993", "#e2c7a6", "#ead5ba", "#f1e0cb"], "#7a5030"), bands: [[-40, -28, "#e2b98e"], [-20, -8, "#d9a77a"], [6, 18, "#d9a77a"], [26, 34, "#e2b98e"], [44, 52, "#e8c9a6"]], spots: "jupiter" },
    saturn: { name: "Saturn", km: 58232, tilt: 26.7, day: 10.66, tint: tint("#faf0d6", ["#dcc795", "#e4d2a8", "#ecdcba", "#f3e7cc"], "#8a6a3e"), bands: [[-30, -18, "#efdcae"], [-6, 6, "#ecd59e"], [16, 28, "#efdcae"]], rings: true },
    uranus: { name: "Uranus", km: 25362, tilt: 97.8, day: -17.24, tint: tint("#e2f6f8", ["#9fd3da", "#b2dde2", "#c5e6ea", "#d4edf0"], "#3a8a96") },
    neptune: { name: "Neptune", km: 24622, tilt: 28.3, day: 16.11, tint: tint("#dde7fb", ["#8fa9e2", "#a5bae8", "#bbcbee", "#cbd7f3"], "#1a3a7a"), bands: [[-28, -16, "#b9cbf0"]], spots: "neptune" },
    moon: { name: "Moon", km: 1737, tilt: 6.7, day: 655.7, tint: tint("#efefeb", ["#bdbdb5", "#cacac3", "#d7d7d1", "#e2e2dd"], "#5f5f58"), spots: "crater" },
  };
  const SPOTS = {
    crater: [[20, 30, 9, "#c3c0b8", "#8a867e"], [-40, -10, 13, "#c9c6be", "#8a867e"], [70, -35, 7, "#c3c0b8", "#8a867e"], [130, 15, 11, "#c9c6be", "#8a867e"], [-110, 40, 8, "#c3c0b8", "#8a867e"], [180, -40, 10, "#c9c6be", "#8a867e"], [-160, 5, 6, "#c3c0b8", "#8a867e"]],
    mars: [[0, 90, 14, "#ffffff", "#c9a99a"], [0, -90, 10, "#ffffff", "#c9a99a"], [-60, 10, 18, "#d08463", "none"], [40, -20, 14, "#d08463", "none"], [150, 20, 16, "#d08463", "none"]],
    jupiter: [[30, -22, 7, "#e0866a", "#a0503a"]],
    neptune: [[-40, -20, 8, "#7d94cf", "none"]],
  };

  ISO.add({
    name: "planet", title: "Planet model", compare: "planet 480 260 100 k=saturn",
    about: "One planet or the Moon as a model on a stand, its axis at the true tilt; spin=1 turns it one hour of its day per second.",
    line: "planet cx cy r k=mercury|venus|earth|mars|jupiter|saturn|uranus|neptune|moon spin=0|1 lab=1 lit=ball|axis|stand|rings",
    demo: { line: "planet 480 260 100 k=saturn", script: [{ set: { lit: "axis" }, hold: 1.6 }, { set: { lit: "", spin: 1 }, hold: 6 }, { set: { spin: 0 }, hold: "settle" }] },
    make([cx, cy, r = 90], o, t, parent) {
      const lab = o.lab !== "0", k = BODY[o.k] ? o.k : "mars", B = BODY[k], RB = 40, wide = B.rings ? 2.3 : 1.2;
      const W = r * (B.rings ? 5.4 : 3.2), H = r * 3.6;
      const ZC = 80, C = [0, 0, ZC];
      const { P, g } = ISO.frame([[-RB * wide, -RB * wide, ZC], [RB * wide, RB * wide, ZC], [0, 0, ZC + RB + 14], [-34, 34, 0], [34, -34, 0], [0, 0, ZC - RB * wide * 0.6], [30, 30, -5]], cx, cy, W, H, { azimuth: 45, elevation: 22 }, parent);
      const cam = K.cameraOf(P), dirH = [cam.sinA, -cam.cosA, 0], V = G.viewOf(P);
      const a = unit3(add3(mul3(dirH, Math.sin(B.tilt * EARTH.R)), [0, 0, Math.cos(B.tilt * EARTH.R)]));
      // the axis rod runs through the ball; its lower end sits in a ball joint on top of the post
      const lowSign = a[2] >= 0 ? -1 : 1, RM = RB + 9, J = add3(C, mul3(a, lowSign * RM)), T = add3(C, mul3(a, -lowSign * (B.rings ? RB + 7 : RM)));
      // a brass half-meridian from the low pin round to the top pin (not on Saturn, whose rings it would cut)
      let v0 = unit3(cross3(a, cross3(dirH, a))); if (dot3(v0, dirH) > 0) v0 = mul3(v0, -1);
      const mv = unit3(add3(mul3(v0, Math.cos(0.21)), mul3(cross3(a, v0), Math.sin(0.21))));
      const pieces = B.rings ? [] : EARTH.bandArc(P, C, mv, a, RM, 1.5, 1.3, -Math.PI / 2, Math.PI / 2, 40), dC = K.depthOf(C, P);
      const merid = (front) => ISO.tinted(ISO.T.brass, pieces.filter((q) => (q.depth > dC) === front).map((q) => q.svg).join(""));
      // three ball feet under the wooden foot, and a knurled clamp screw that locks the ball joint
      const feet = [0, 1, 2].map((i) => { const f = (i / 3) * Math.PI * 2 + 0.5; return [J[0] + 25 * Math.cos(f), J[1] + 25 * Math.sin(f)]; }).sort((p, q) => K.depthOf([...p, 0], P) - K.depthOf([...q, 0], P))
        .map(([x, y]) => ISO.tinted(ISO.T.brass, S(G.sphereOf([x, y, -1.8], 2.6, P, { steps: 24 }), { tone: "mid" }))).join("");
      const side = unit3([V[0], V[1], 0]), kF = G.frameAlong(add3(J, mul3(side, 2.6)), side);
      const knob = ISO.tinted(ISO.T.brass, S(G.disc(0, 3, 1, kF, P, { steps: 14 }), { tone: "mid" }) + S(G.disc(3, 5.4, 2.6, kF, P, { steps: 22 }), { tone: "mid", inner: K.lineSvg(G.ribsOf(kF, 3.2, 5.2, 2.6, 16, P, { seams: true }), { tone: "lo" }) }));
      const foot = ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, 32], [1.5, 32], [2.4, 30.6, 1], [4.4, 27.4, 1], [5.4, 22], [7, 21], [8, 16, 1], [9.5, 11], [9.5, 0]], LAB.Z([J[0], J[1], 0]), P, { steps: 72 }), { tone: "mid" }));
      const post = ISO.tinted(ISO.T.brass, S(G.lathe([[9.5, 0], [9.5, 6], [12, 6], [13, 4.6, 1], [17, 3.2, 1], [J[2] - 8, 2.8], [J[2] - 6, 3.6], [J[2] - 3, 3.6], [J[2] - 3, 0]], LAB.Z([J[0], J[1], 0]), P, { steps: 40 }), { tone: "mid" }));
      const joint = ISO.tinted(ISO.T.brass, S(G.sphereOf(J, 3.6, P), { tone: "mid" }));
      const rodLow = EARTH.rod(P, J, add3(C, mul3(a, lowSign * (RB - 2))), 1.2), rodTop = EARTH.rod(P, add3(C, mul3(a, -lowSign * (RB - 2))), T, 1.2);
      const cap = ISO.tinted(ISO.T.brass, S(G.sphereOf(T, 2, P), { tone: "mid" }));
      // audit: the rods end 2 units inside the ball and the ball joint/cap (pins in sockets), on purpose
      // a top end that faces away from us is behind the ball, a low end in front is drawn after it
      const topFront = dot3(sub3(T, C), V) > 0, lowFront = dot3(sub3(J, C), V) > 0;
      // Saturn's rings in its equator's plane, split into the half behind the ball and the half in front
      const ringSvg = (front) => {
        if (!B.rings) return "";
        const F = EARTH.frame(C, RB, a), ph = Math.atan2(dot3(F.v, V), dot3(F.u, V)), half = (r0, r1, col, ink) => {
          const n = 48, ang = (i) => ph + (front ? -Math.PI / 2 : Math.PI / 2) + (i / n) * Math.PI;
          const at = (rr, t) => K.iso(add3(C, mul3(add3(mul3(F.u, Math.cos(t)), mul3(F.v, Math.sin(t))), rr * RB)), P);
          const pts = [...Array.from({ length: n + 1 }, (_, i) => at(r1, ang(i))), ...Array.from({ length: n + 1 }, (_, i) => at(r0, ang(n - i)))];
          return `<path d="${K.pathOf(pts, true)}" fill="${col}" stroke="${ink}" stroke-width=".7" stroke-linejoin="round"/>`;
        };
        return half(1.24, 1.52, "#efe3c4", "#a88a56") + half(1.53, 1.95, "#e2cc96", "#8a6a3e") + half(2.03, 2.27, "#ead9ae", "#8a6a3e");
      };
      g.innerHTML = `<g data-name="stand">${feet}${foot}${post}</g><g data-name="axis">${merid(false)}${joint}${knob}${lowFront ? "" : rodLow}${topFront ? "" : rodTop + cap}</g>` +
        `<g data-name="rings">${ringSvg(false)}</g><g data-part="ball" data-name="ball"></g><g data-name="rings">${ringSvg(true)}</g>` +
        `<g data-name="axis">${lowFront ? rodLow : ""}${topFront ? rodTop + cap : ""}${merid(true)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const st = { turn: 0, spin: o.spin === "1", rate: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const key = Math.round(st.turn / 1.5) * 1.5, F = EARTH.frame(C, RB, a, key * EARTH.R);
        w.rebuild(el.ball, String(key), () => EARTH.ball(P, F, { tint: B.tint, ink: "#3a3a3a", land: B.land ? "#cfe7b9" : null, bands: B.bands, spots: SPOTS[B.spots] }));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([J[0], J[1], 0], P), B.name, "#333", { size: 16, dy: 26 }) + ISO.word(K.iso(T, P), `axis ${B.tilt}°`, "#6b5114", { size: 13, anchor: "start", dy: -8 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.spin !== undefined) st.spin = String(p.spin) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      // 1 s of demo = 1 hour of the body's day; the speed eases up and down like a model on a motor
      g.update = (dt) => {
        const want = st.spin && !ISO.still() ? 360 / B.day : 0;
        st.rate = ISO.follow(st.rate, want, dt, 0.5, ISO.still());
        if (Math.abs(st.rate - want) < 0.02) st.rate = want;
        st.turn += st.rate * dt;
        draw();
        return st.rate !== 0 || st.spin;
      };
      const dayText = () => { const h = Math.abs(B.day); return h > 48 ? `${(h / 24).toFixed(1)} Earth days` : `${h.toFixed(1)} h`; };
      g.readout = () => `${B.name} · radius ${B.km.toLocaleString("en")} km (${(B.km / 6371).toFixed(2)} × Earth) · axis tilted ${B.tilt}° · one turn every ${dayText()}${B.day < 0 ? ", backwards" : ""}${B.rings ? " · rings 2.3 × its radius across, mostly ice" : ""}`;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
