// "solarsystem cx cy width n=8 years=0.. lab=1 lit=sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune" — an orrery.
// A turned wooden plinth with each orbit inlaid on its top, a brass column carrying the Sun, and one brass arm per
// planet from a nested collar on the column, each with a post up to its ball. set({ years }) winds the clockwork:
// every arm turns at its planet's true rate (Mercury 4.15 laps a year, Neptune one lap in 164.8 years). Sizes and
// distances are not to scale (Neptune is really 30 × as far out as Earth, the Sun 109 × Earth's width).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const T = (top, d, ink) => ISO.tint(top, d, ink);
  const PL = [
    { id: "mercury", name: "Mercury", period: 0.2408, r: 4.4, tint: T("#e6e2dc", ["#b3aca2", "#c2bcb3", "#d1ccc4", "#dcd8d1"], "#5a5550") },
    { id: "venus", name: "Venus", period: 0.6152, r: 6.4, tint: T("#fbefd2", ["#e2c27e", "#e9cf96", "#f0dcae", "#f5e5c0"], "#9a7030") },
    { id: "earth", name: "Earth", period: 1, r: 6.8, tint: T("#e3f0fb", ["#8fb8e2", "#a7c9ea", "#bdd7f0", "#cfe2f5"], "#1f4f8f") },
    { id: "mars", name: "Mars", period: 1.8808, r: 5.2, tint: T("#f7d2bf", ["#d98a66", "#e19d7c", "#e8b093", "#efc2aa"], "#7a2f18") },
    { id: "jupiter", name: "Jupiter", period: 11.862, r: 14.5, tint: T("#f7ead8", ["#d9b993", "#e2c7a6", "#ead5ba", "#f1e0cb"], "#7a5030") },
    { id: "saturn", name: "Saturn", period: 29.457, r: 11.5, tint: T("#faf0d6", ["#dcc795", "#e4d2a8", "#ecdcba", "#f3e7cc"], "#8a6a3e"), rings: true },
    { id: "uranus", name: "Uranus", period: 84.011, r: 9, tint: T("#e2f6f8", ["#9fd3da", "#b2dde2", "#c5e6ea", "#d4edf0"], "#3a8a96") },
    { id: "neptune", name: "Neptune", period: 164.79, r: 8.8, tint: T("#dde7fb", ["#8fa9e2", "#a5bae8", "#bbcbee", "#cbd7f3"], "#1a3a7a") },
  ];
  const ZT = 14, ZS = 100, SUN = 22;
  const orbitR = (i) => 36 + i * 16.5, armZ = (i) => ZT + 44 - i * 4, start = (i) => (i * 47 + 20) * Math.PI / 180;

  ISO.add({
    name: "solarsystem", title: "Solar system (orrery)", compare: "solarsystem 480 270 560",
    about: "An orrery: the Sun on a column and a brass arm for each planet; wind it on a year and each planet laps at its true rate.",
    line: "solarsystem cx cy width n=8 years=0.. lab=1 lit=sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune",
    demo: { line: "solarsystem 480 280 560", script: [{ set: { lit: "earth" }, hold: 1.4 }, { set: { years: 1 }, hold: "settle" }, { set: { lit: "", years: 2 }, hold: "settle" }] },
    make([cx, cy, w = 520], o, t, parent) {
      const lab = o.lab !== "0", n = ISO.clamp(Math.round(ISO.num(o, "n", 8)), 1, 8), W = w * 1.08, H = Math.min(w * 0.78, 500);
      const ro = orbitR(n - 1) + 12, RB = Math.max(70, ro + 6);
      const { P, g } = ISO.frame([[-RB, -RB, 0], [RB, RB, 0], [RB, -RB, ZT], [-RB, RB, ZT], [0, 0, ZS + SUN + 14], [0, 0, -12]], cx, cy, W, H, { azimuth: 40, elevation: 28 }, parent);
      // the plinth: a turned round base on a foot ring, its top with an inlaid ring per orbit
      const base = ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, RB - 6], [3, RB - 4], [3, RB], [ZT - 3, RB], [ZT - 1.4, RB - 1.2, 1], [ZT, RB - 3], [ZT, 0]], LAB.Z([0, 0, 0]), P, { steps: 120 }), { tone: "mid", halo: true }));
      const rings = `<path d="${PL.slice(0, n).map((_, i) => K.ring(0, 0, orbitR(i), ZT, P, 96)).join("")}" fill="none" stroke="#a88a56" stroke-width=".8"/>`;
      // audit: the collars, posts and balls stand on the arms and the column (ISO.poly arms are not recorded, so it
      // reads them as loose); the Sun sits 2 units down on the column top on purpose
      // the column with its nested collars, one per arm, and the Sun on top
      const col = ISO.tinted(ISO.T.brass, S(G.lathe([[ZT, 0], [ZT, 14], [ZT + 3, 11, 1], [ZT + 7, 8], [ZS - SUN - 6, 4.2], [ZS - SUN + 2, 4.2], [ZS - SUN + 2, 0]], LAB.Z([0, 0, 0]), P, { steps: 48 }), { tone: "mid" }));
      const collars = PL.slice(0, n).map((_, i) => ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 6.4 - i * 0.12, armZ(i) - 1.2, 3.2, P, 28, 0.3), { tone: "mid" }))).join("");
      const sun = ISO.tinted(T("#fff1c4", ["#f0b43c", "#f4c35a", "#f7d27a", "#fadf9a"], "#a8641a"), S(G.sphereOf([0, 0, ZS], SUN, P, { steps: 56 }), { tone: "mid" }));
      g.innerHTML = `<g data-name="plinth">${base}${rings}</g><g data-part="movers"><g data-part="sun" data-name="sun">${col}${collars}${sun}</g>${PL.slice(0, n).map((p) => `<g data-part="${p.id}" data-name="${p.id}"></g>`).join("")}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), wr = ISO.writer(), sort = ISO.sorter(P, el.movers);
      const st = { y: ISO.num(o, "years", 0) }, want = { y: st.y };
      let lit = o.lit || "";
      const unit = (i, a) => {
        const p = PL[i], R = orbitR(i), z = armZ(i), c = [Math.cos(a), Math.sin(a)], s = [-c[1], c[0]], zp = ZS - (i > 3 ? 4 : 0);
        const bar = [[5, -1.3, z], [R + 2, -1.3, z], [R + 2, 1.3, z], [5, 1.3, z], [5, -1.3, z + 1.6], [R + 2, -1.3, z + 1.6], [R + 2, 1.3, z + 1.6], [5, 1.3, z + 1.6]].map(([u, v, zz]) => [c[0] * u + s[0] * v, c[1] * u + s[1] * v, zz]);
        const B = [c[0] * R, c[1] * R, zp], out = [ISO.tinted(ISO.T.brass, ISO.poly(bar, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"))];
        out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(B[0], B[1], 0.9, z + 1.6, zp - p.r - z - 1.2, P, 12), { tone: "mid", crease: "none" })));
        const ball = ISO.tinted(p.tint, S(G.sphereOf(B, p.r, P, { steps: 28 }), { tone: "mid" }));
        if (!p.rings) out.push(ball);
        else {
          // Saturn's ring, tilted 26.7°, as a back half and a front half round the ball
          const V = G.viewOf(P), F = EARTH.frame(B, p.r, [0.45, -0.45, 0.89]), ph = Math.atan2(G.dot3(F.v, V), G.dot3(F.u, V));
          const half = (front) => { const m = 24, ang = (k) => ph + (front ? -Math.PI / 2 : Math.PI / 2) + (k / m) * Math.PI, at = (rr, tt) => K.iso(G.add3(B, G.mul3(G.add3(G.mul3(F.u, Math.cos(tt)), G.mul3(F.v, Math.sin(tt))), rr * p.r)), P);
            return `<path d="${K.pathOf([...Array.from({ length: m + 1 }, (_, k) => at(1.95, ang(k))), ...Array.from({ length: m + 1 }, (_, k) => at(1.3, ang(m - k)))], true)}" fill="#e2cc96" stroke="#8a6a3e" stroke-width=".6"/>`; };
          out.push(half(false), ball, half(true));
        }
        return [out[0], out.slice(1).join("")];
      };
      // the post and ball look the same wherever the arm puts them, so they are drawn once and slid; only the arm is rebuilt
      const bodies = PL.slice(0, n).map((p, i) => { const e = el[p.id]; e.innerHTML = `<g></g><g>${unit(i, 0)[1]}</g>`; return { arm: e.firstChild, body: e.lastChild }; });
      const draw = () => {
        const anchors = { sun: [0, 0, ZS] }, items = { sun: el.sun };
        for (let i = 0; i < n; i++) {
          const a = start(i) + (2 * Math.PI * st.y) / PL[i].period, q = 1.2 / orbitR(i), key = Math.round(a / q) * q;          // a step of about 1.2 units along its orbit
          wr.rebuild(bodies[i].arm, key.toFixed(3), () => unit(i, key)[0]);
          wr.attr(bodies[i].body, "transform", K.translateAlong(P, [Math.cos(key) * orbitR(i) - orbitR(i), Math.sin(key) * orbitR(i), 0]));
          items[PL[i].id] = el[PL[i].id];
          anchors[PL[i].id] = [Math.cos(key) * orbitR(i) * 0.6, Math.sin(key) * orbitR(i) * 0.6, armZ(i)];
        }
        sort(items, anchors);
        if (lab) wr.rebuild(el.words, String(Math.round(st.y * 60)), () => PL.slice(0, n).map((p, i) => { const a = start(i) + (2 * Math.PI * st.y) / p.period; return ISO.word(K.iso([Math.cos(a) * orbitR(i), Math.sin(a) * orbitR(i), ZS + p.r + (p.rings ? 4 : 2)], P), p.name, "#445", { size: 11, dy: -3 }); }).join("") + ISO.word(K.iso([0, 0, ZS + SUN + 4], P), "Sun", "#a8641a", { size: 13, dy: -4 }));
        LAB.light(wr, g, lit);
      };
      g.set = (p) => {
        if (p.years !== undefined) want.y = Math.max(0, +p.years);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.y = ISO.follow(st.y, want.y, dt, 1.4, ISO.still());
        if (Math.abs(st.y - want.y) < 0.001) st.y = want.y;
        draw();
        return st.y !== want.y;
      };
      g.readout = () => `${st.y.toFixed(2)} Earth years · laps: ${PL.slice(0, n).map((p) => `${p.name} ${(st.y / p.period).toFixed(p.period > 20 ? 3 : 2)}`).join(" · ")} · sizes and distances not to scale`;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
