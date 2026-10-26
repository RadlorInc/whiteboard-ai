// "candle cx cy k x=0..60 lab=0 lit=candle|holder|flame" — a PART (PARTS.md, batch 5): the lit candle of pinhole.js,
// 12.5 cm from the bench to the flame's tip, in a brass holder, origin the bench point under it at x = 0. A brass dish
// with a rolled rim and a socket, a 2 cm wax candle with its melted pool and a drip down its side, the black wick and a
// flame from 10.4 to 12.5 cm: a WebGL flame (ISO.gl flameUS, as pinhole.js) that keeps flickering, or an SVG flame
// without it. x = how far it has been slid along the bench (toward +x, cm), eased; set({ x }) slides it (a pinhole or a
// lens at the −x side sees it move away). World units: 1 = 1 cm. anchors: flame base (taken where it was built).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RW = 1, Z0 = 0.75, ZW = 10.2, ZF = 10.4, ZT = 12.5, XMAX = 60;
  const WAX = ISO.tint("#fbf3df", ["#e3d3ae", "#ead9b8", "#f0e2c6", "#f5ead3"], "#8a7340");
  // the scene's flame outline (pinhole.js), in the x–z plane through the wick; k narrows it (the bright core)
  const flame = (x, z0, z1, k = 1) => {
    const h = z1 - z0, pts = [];
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * 2 * Math.PI, r = Math.sin(a / 2), y = Math.sin(a) * 0.55 * k * (1 - Math.cos(a / 2) * 0.3); pts.push([x + y * 0.3, y, z0 + h * (1 - Math.cos(a)) * 0.5 * (0.35 + 0.65 * r)]); }
    return pts;
  };
  // the SVG flame (no WebGL): the scene's outline, a pale core, a blue root; t sways it
  function flameSvg(P, t) {
    const sw = 0.06 * Math.sin(t * 9), sq = 1 + 0.04 * Math.sin(t * 17);
    const p = (pts) => K.pathOf(pts.map(([a, b, c]) => K.iso([a + sw * (c - ZF), b, c], P)), true);
    return `<path d="${p(flame(0, ZF, ZF + (ZT - ZF) * sq))}" fill="#f6b73c" stroke="#d9861a" stroke-width="0.5" opacity=".95"/>` +
      `<path d="${p(flame(0, ZF + 0.25, ZT - 0.65, 0.5))}" fill="#fff3c4"/><path d="${p(flame(0, ZF, ZF + 0.45, 0.55))}" fill="#7d97e8" opacity=".6"/>`;
  }
  // the candle and its holder, built once at x = 0 (sliding it is a flat move on the board)
  function candleSvg(P) {
    const x = 0;
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: x - 2.6, y: -2.6, w: 5.2, d: 5.2, r: 2.6 }, 0, 0.4, P)}"/>`];
    // holder: dish with a rolled rim, a socket the candle stands in
    out.push(`<g data-name="holder">${ISO.tinted(ISO.T.brass, S(G.lathe([[0, 0], [0, 2.2], [0.12, 2.45, 1], [0.32, 2.5, 1], [0.42, 2.35]], G.frameOf([x, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 40 }), { tone: "mid" }) +
      S(K.cylinder(x, 0, 1.35, 0.3, Z0 - 0.3 + 0.25, P, 28, 0.08), { tone: "hi" }))}</g>`);
    // the candle: wax body (a drip down its near side), the melted pool on top, the wick
    const drip = []; for (let i = 0; i <= 10; i++) { const a = 0.5 + (i / 10) * 0.3, len = 0.3 + 2.8 * Math.sin(Math.PI * (i / 10)) ** 0.6; drip.push([a, len]); }
    const dripPts = [...drip.map(([a]) => [x + Math.cos(a) * (RW + 0.02), Math.sin(a) * (RW + 0.02), ZW - 0.1]), ...drip.slice().reverse().map(([a, len]) => [x + Math.cos(a) * (RW + 0.03), Math.sin(a) * (RW + 0.03), ZW - 0.1 - len])];
    out.push(`<g data-name="candle">${ISO.tinted(WAX, S(K.cylinder(x, 0, RW, Z0, ZW - Z0, P, 28, 0.12), { tone: "hi", crease: "none" }))}` +
      `<path d="${K.pathOf(dripPts.map((p) => K.iso(p, P)), true)}" fill="#f8eed6" stroke="#c9b585" stroke-width="0.5"/>` +
      `<path d="${G.circleOf(G.frameOf([x, 0, ZW + 0.01], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, 0.62, P)}" fill="#efe0bd" stroke="#c9b585" stroke-width="0.4"/>` +
`<path d="${K.segment([x, 0, ZW], [x + 0.04, 0, ZF + 0.25], P)}" stroke="#2a2b2f" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.06).toFixed(2)}" stroke-linecap="round"/>` + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "candle", title: "Lit candle (part)", compare: null,
    about: "A lit wax candle in a brass holder, 12.5 cm to the flame's tip; it slides along the bench (x cm toward +x) and its flame flickers; the bright object for a pinhole camera or a lens. anchors: flame base",
    line: "candle cx cy k x=0..60 lab=0 lit=candle|holder|flame",
    demo: { line: "candle 380 420 30", script: [{ set: {}, hold: 1.2 }, { set: { lit: "flame" }, hold: 1.2 }, { set: { x: 6, lit: "" }, hold: "settle" }, { set: { lit: "holder" }, hold: 1.2 }, { set: { x: 0, lit: "candle" }, hold: "settle" }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const st = { x: ISO.clamp(ISO.num(o, "x", 0), 0, XMAX) }, want = { x: st.x };
      let lit = o.lit || "", clock = 0;
      g.innerHTML = `<g data-part="move">${candleSvg(P)}<g data-name="flame" data-part="flame"></g></g><g data-part="words"></g>`;
      const el = window.LAB.parts(g);
      // the flame layer (its own build part: the shader is the slow bit): each pixel is traced back to the flame
      // (flameUS), its axis on the wick at uX; until it runs, or without WebGL, the SVG flame shows
      let fx = null;
      const flameGl = () => ISO.gl(g, P, 960, 540, el.words, `uniform float uX;void main(){vec2 vb=viewOf(gl_FragCoord.xy);
        gl_FragColor=finish(flameInk(vb,vec3(uX,0.,${ZF.toFixed(2)}),vec3(0.,0.,1.),${((ZT - ZF) / 2.15).toFixed(3)},0.,uTime));}`, ["uX"]);
      g.anchors = { flame: [st.x, 0, ZF + 0.9], base: [st.x, 0, 0] };
      const o0 = K.iso([0, 0, 0], P), ex = K.iso([1, 0, 0], P);
      const draw = () => {
        const x = Math.round(st.x * 100) / 100, tq = fx ? -1 : Math.round(clock * 20) / 20;
        if (fx) fx.set({ uX: x });
        w.attr(el.move, "transform", `translate(${((ex[0] - o0[0]) * x).toFixed(2)} ${((ex[1] - o0[1]) * x).toFixed(2)})`);
        w.rebuild(el.flame, String(tq), () => (fx ? "" : flameSvg(P, tq)));
        if (lab) w.rebuild(el.words, String(x), () => window.LAB.word(P, lab, [x, 0, ZT + 1.2], "candle", "#556"));
      };
      g.set = (p) => {
        if (p.x !== undefined && p.x !== "" && Number.isFinite(+p.x)) want.x = ISO.clamp(+p.x, 0, XMAX);
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.x = ISO.follow(st.x, want.x, dt, 0.6, calm);
        const moving = st.x !== want.x;
        if (moving && !calm) clock += dt;
        draw();
        return moving;
      };
      g.readout = () => `lit candle · 12.5 cm to the flame's tip · slid ${st.x.toFixed(1)} cm along the bench`;
      draw(); B20.light(w, g, lit);
      ISO.later(() => { fx = flameGl(); draw(); });
      return g;
    },
  });
})();
