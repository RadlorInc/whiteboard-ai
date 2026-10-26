// "filterwheel cx cy k color=red|green|blue|uv lab=0 lit=wheel|filters|stand" — a PART (PARTS.md, batch 5): the
// colour filter wheel of photoelectric.js, a 10 cm black disc with four filter windows (red 680 nm, green 530, blue 450,
// ultraviolet 300) on a stand, origin the bench point under the window that is in the beam. The disc turns on an axle
// along x (light travels −x through it); the chosen window sits at the bottom, its centre 13.5 cm up (the library's beam
// height), the hub 3 cm above it. A knurled rim, the hub knob, each window's gel in a ring with its letter, the axle on
// an arm from a post at the side (−y, clear of the beam) on a base plate. set({ color }) turns the wheel, eased the
// short way round. World units: 1 = 1 cm. anchors: window (the beam point)
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BEAM = 13.5, RWIN = 3, HUB = BEAM + RWIN, RD = 5, T = 0.15, WR = 1.25, PY = -6.2, PX = -0.9;
  const LIGHT = { red: { nm: 680, c: "#e5302a", t: "R" }, green: { nm: 530, c: "#22b04b", t: "G" }, blue: { nm: 450, c: "#2b6cc4", t: "B" }, uv: { nm: 300, c: "#8a4fd6", t: "UV" } };
  const ORDER = Object.keys(LIGHT);
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -2.2, y: PY - 1.6, w: 3.6, d: -PY + 3.2, r: 0.6 }, 0, 0.8, P)}"/>`];
    out.push(`<g data-name="stand">${ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-1.9, -1.1], [PY - 1.3, PY - 0.5], [0, 0.15], "lo") + ISO.wbox(P, [0.5, 1.3], [0.6, 1.4], [0, 0.15], "lo"))}` +
      ISO.tinted(ISO.T.paint, S(K.slabOf({ x: -2, y: PY - 1.4, w: 3.4, d: -PY + 3, r: 0.4 }, 0.15, 0.65, P, 3, 0.1), { tone: "mid" })) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(PX, PY, 0.7, 0.8, 1.6, P, 20, 0.08), { tone: "mid" }) + S(K.cylinder(PX, PY, 0.4, 2.4, HUB - 2.4 + 0.4, P, 16), { tone: "hi", crease: "none" }) +
        ISO.wbox(P, [PX - 0.45, PX + 0.45], [PY - 0.45, PY + 0.45], [HUB - 0.5, HUB + 0.5], "mid") + S(G.disc(0, -PY - 0.45, 0.3, G.frameAlong([PX, PY + 0.45, HUB], [0, 1, 0]), P), { tone: "hi", crease: "none" }) +
        S(G.disc(0, -PX - T, 0.32, X([PX, 0, HUB]), P), { tone: "mid" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.5, 0.4, G.frameAlong([PX, PY - 0.45, HUB], [0, -1, 0]), P), { tone: "hi", inner: L(G.ribsOf(G.frameAlong([PX, PY - 0.45, HUB], [0, -1, 0]), 0, 0.5, 0.4, 10, P, { seams: true }), { tone: "lo" }) })) + `</g>`);
    // the disc itself (round, so it looks the same at any turn)
    out.push(`<g data-name="wheel">${ISO.tinted(ISO.T.plastic, S(G.disc(-T, T, RD, X([0, 0, HUB]), P), { tone: "mid" }))}</g>`);
    return out.join("");
  }
  // what turns: the knurling round the rim (rebuilt as it turns), and the windows with their gels and letters, built
  // once and turned as a flat affine map (they lie in the disc's plane, so a turn in it is a fixed 2 × 2 on the board)
  const A0 = -Math.PI / 2;
  const rimSvg = (P, a) => L(G.ribsOf(G.frameOf([0, 0, HUB], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]), -T, T, RD, 48, P, { seams: true }), { tone: "lo" });
  function windowsSvg(P) {
    const out = [];
    ORDER.forEach((n, i) => {
      const th = (i * Math.PI) / 2, d = [0, Math.cos(A0 + th), Math.sin(A0 + th)], c = [T + 0.01, RWIN * d[1], HUB + RWIN * d[2]];
      const Fw = X(c);
      out.push(`<path d="${G.circleOf(Fw, 0, WR + 0.18, P)}" fill="#55595f" stroke="#0d0e10" stroke-width="0.5"/>`);
      out.push(`<path d="${G.circleOf(Fw, 0.01, WR, P)}" fill="${LIGHT[n].c}" fill-opacity=".78" stroke="#1d1f22" stroke-width="0.5"/>`);
      out.push(`<path d="${G.arcOf(Fw, 0.02, WR * 0.62, P, { from: 1.9, to: 2.9 })}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.08).toFixed(2)}" stroke-linecap="round" opacity=".6"/>`);
      const tp = [T + 0.02, (RWIN - WR - 0.55) * d[1], HUB + (RWIN - WR - 0.55) * d[2]];
      out.push(window.LAB.faceText(P, tp, [0, -d[2], d[1]], LIGHT[n].t, 0.42, "#e9ecef", d));
    });
    return out.join("");
  }
  // the board matrix that turns the disc's face by da about the hub
  function turnOf(P, da) {
    const o = K.iso([T, 0, HUB], P), ey = K.iso([T, 1, HUB], P), ez = K.iso([T, 0, HUB + 1], P);
    const E = [ey[0] - o[0], ez[0] - o[0], ey[1] - o[1], ez[1] - o[1]], det = E[0] * E[3] - E[1] * E[2], c = Math.cos(da), s = Math.sin(da);
    const Ei = [E[3] / det, -E[1] / det, -E[2] / det, E[0] / det];
    const ER = [E[0] * c + E[1] * s, -E[0] * s + E[1] * c, E[2] * c + E[3] * s, -E[2] * s + E[3] * c];
    const M = [ER[0] * Ei[0] + ER[1] * Ei[2], ER[0] * Ei[1] + ER[1] * Ei[3], ER[2] * Ei[0] + ER[3] * Ei[2], ER[2] * Ei[1] + ER[3] * Ei[3]];
    const e = o[0] - (M[0] * o[0] + M[1] * o[1]), f = o[1] - (M[2] * o[0] + M[3] * o[1]);
    return `matrix(${[M[0], M[2], M[1], M[3], e, f].map((v) => v.toFixed(5)).join(" ")})`;
  }
  const knobSvg = (P) => `<g data-name="wheel">${ISO.tinted(ISO.T.steel, S(G.disc(T, T + 0.25, 0.9, X([0, 0, HUB]), P), { tone: "mid" }))}` +
    ISO.tinted(ISO.T.plastic, S(G.disc(T + 0.25, T + 0.85, 0.6, X([0, 0, HUB]), P), { tone: "hi", inner: L(G.ribsOf(X([0, 0, HUB]), T + 0.25, T + 0.85, 0.6, 12, P, { seams: true }), { tone: "lo" }) })) + `</g>`;

  ISO.add({
    name: "filterwheel", title: "Colour filter wheel (part)", compare: null,
    about: "A 10 cm filter wheel with red, green, blue and UV windows on a stand; it turns the chosen colour into the beam (window centre 13.5 cm up, light travelling −x). anchors: window",
    line: "filterwheel cx cy k color=red|green|blue|uv lab=0 lit=wheel|filters|stand",
    demo: { line: "filterwheel 470 490 21 color=red", script: [{ set: {}, hold: 1 }, { set: { color: "green" }, hold: "settle" }, { set: { color: "blue", lit: "filters" }, hold: "settle" }, { set: { color: "uv", lit: "" }, hold: "settle" }, { set: { color: "red", lit: "stand" }, hold: "settle" }] },
    make([cx = 480, cy = 450, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const st = { color: LIGHT[o.color] ? o.color : "red" };
      st.a = st.aT = -Math.PI / 2 - ORDER.indexOf(st.color) * (Math.PI / 2);
      let lit = o.lit || "";
      g.innerHTML = standSvg(P) + `<g data-name="wheel" data-part="rim"></g><g data-name="filters" data-part="turn">${windowsSvg(P)}</g>` + knobSvg(P) + `<g data-part="words"></g>`;
      const el = window.LAB.parts(g);
      g.anchors = { window: [0, 0, BEAM] };
      const draw = () => {
        const a = st.a.toFixed(3);
        w.rebuild(el.rim, st.a.toFixed(2), () => rimSvg(P, st.a));
        w.attr(el.turn, "transform", turnOf(P, +a - A0));
        if (lab) w.rebuild(el.words, st.color, () => window.LAB.word(P, lab, [0, 0, HUB + RD + 1.2], `${st.color === "uv" ? "UV" : st.color} filter, ${LIGHT[st.color].nm} nm`, LIGHT[st.color].c));
      };
      g.set = (p) => {
        if (LIGHT[p.color] && p.color !== st.color) {
          st.color = p.color;
          const want = -Math.PI / 2 - ORDER.indexOf(p.color) * (Math.PI / 2);
          st.aT = st.a + ((((want - st.a) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;   // the short way round
        }
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
        draw();
      };
      g.update = (dt) => { st.a = ISO.follow(st.a, st.aT, dt, 0.35, ISO.still()); draw(); return st.a !== st.aT; };
      g.readout = () => { const l = LIGHT[st.color]; return `${st.color === "uv" ? "ultraviolet" : st.color} filter in the beam · ${l.nm} nm · photons of ${(1240 / l.nm).toFixed(1)} eV`; };
      draw(); B20.light(w, g, lit);
      return g;
    },
  });
})();
