// "pinholecamera cx cy k d=15..100 lab=0 lit=camera|screen|pinhole" — a PART (PARTS.md, batch 5): the box camera of
// pinhole.js, 15 × 10 × 10 cm on two feet, standing on the bench, origin the bench point under its middle. Its near
// side (+y) is cut away to show inside. The pinhole, in a brass foil disc, is in the +x end 6 cm up (light comes from
// +x on a bench); the tracing-paper screen in its frame is the −x end, 14.6 cm behind the hole. On the paper: the
// upside-down image of a 12.5 cm candle standing d cm in front of the hole on the same bench (the candle part), each
// point traced straight through the hole, so it is 12.5 × 14.6 ÷ d cm tall; set({ d }) eases it as the candle moves.
// World units: 1 = 1 cm. anchors: pinhole screen
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const X0 = -7.5, X1 = 7.5, Y0 = -5, Y1 = 5, Z0 = 1, Z1 = 11, WT = 0.4, ZH = 6, XS = X0 + WT + 0.02, DIST = X1 - XS;
  const PAPER = { y0: -4.0, y1: 4.4, z0: 2.0, z1: 10.0 };
  const BOARD = ISO.tint("#4a4643", ["#24211f", "#2c2926", "#35322e", "#3e3a36"], "#0f0d0c");
  // the candle (candle.js): holder dish, wax body, flame; [half width, z0, z1]
  const CAND = { dish: [2.5, 0, 0.4], wax: [1, 0.75, 10.2], flameZ: [10.4, 12.5], fw: 0.55 };
  let seq = 0;
  const wb = (P, x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);

  function backSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 0.5 }, 0, Z1, P)}"/>`, `<g data-name="camera">`];
    for (const x of [-5, 5]) out.push(ISO.tinted(ISO.T.wood, wb(P, [x - 1, x + 1], [Y0 + 1, Y1 - 1], [0, Z0])));
    // the floor and the far wall (−y), black inside
    out.push(ISO.tinted(BOARD, wb(P, [X0, X1], [Y0, Y1], [Z0, Z0 + WT], "hi") + wb(P, [X0, X1], [Y0, Y0 + WT], [Z0 + WT, Z1 - WT], "hi")), `</g>`);
    // the screen at the −x end: a frame round a sheet of tracing paper (its inside face toward +x, where the image is)
    out.push(`<g data-name="screen">${ISO.tinted(ISO.T.wood, wb(P, [X0, X0 + WT], [Y0 + WT, Y1], [Z0 + WT, PAPER.z0]) + wb(P, [X0, X0 + WT], [Y0 + WT, Y1], [PAPER.z1, Z1 - WT]) +
      wb(P, [X0, X0 + WT], [Y0 + WT, PAPER.y0], [PAPER.z0, PAPER.z1]) + wb(P, [X0, X0 + WT], [PAPER.y1, Y1], [PAPER.z0, PAPER.z1]))}` +
      `<path d="${K.pathOf([[XS, PAPER.y0, PAPER.z0], [XS, PAPER.y1, PAPER.z0], [XS, PAPER.y1, PAPER.z1], [XS, PAPER.y0, PAPER.z1]].map((p) => K.iso(p, P)), true)}" fill="#f4efe2" fill-opacity=".9" stroke="#8a8f96" stroke-width="0.5"/></g>`);
    return out.join("");
  }
  function frontSvg(P) {
    const out = [`<g data-name="camera">`];
    // the +x end with the hole, the near strips left of the cut-away wall, the lid with its pins
    out.push(ISO.tinted(BOARD, wb(P, [X1 - WT, X1], [Y0 + WT, Y1], [Z0 + WT, Z1 - WT], "hi") + wb(P, [X0 + WT, X1 - WT], [Y1 - WT, Y1], [Z0 + WT, Z0 + 1.1], "hi") + wb(P, [X0 + WT, X1 - WT], [Y1 - WT, Y1], [Z1 - 1.1, Z1 - WT], "hi")));
    out.push(ISO.tinted(BOARD, wb(P, [X0, X1], [Y0, Y1], [Z1 - WT, Z1], "hi")), D([[X0 + 0.6, Y0 + 0.6], [X1 - 0.6, Y0 + 0.6], [X0 + 0.6, Y1 - 0.6], [X1 - 0.6, Y1 - 0.6], [0, Y0 + 0.6], [0, Y1 - 0.6]].map(([x, y]) => K.iso([x, y, Z1], P)), { size: 0.45, tone: "hi" }), `</g>`);
    // the pinhole: a brass foil disc taped over a larger hole, the pin's hole in its middle
    const F = G.frameOf([X1 + 0.01, 0, ZH], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(`<g data-name="pinhole">${ISO.tinted(ISO.T.brass, S(G.disc(0, 0.03, 1.1, F, P), { tone: "mid" }))}` +
      `<path d="${G.circleOf(F, 0.04, 0.09, P)}" fill="#0c0b0a"/>` + `</g>`);
    return out.join("");
  }
  // the image on the paper: the candle traced through the hole, upside down and m times as big, clipped to the paper
  function imageSvg(P, d, id) {
    const m = DIST / d, at = (y, z) => K.iso([XS + 0.01, -y * m, ZH - (z - ZH) * m], P);
    const quad = (w, z0, z1) => K.pathOf([at(-w, z0), at(w, z0), at(w, z1), at(-w, z1)], true);
    const fl = []; const [f0, f1] = CAND.flameZ;
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * 2 * Math.PI, r = Math.sin(a / 2), y = Math.sin(a) * CAND.fw * (1 - Math.cos(a / 2) * 0.3); fl.push(at(y, f0 + (f1 - f0) * (1 - Math.cos(a)) * 0.5 * (0.35 + 0.65 * r))); }
    const core = fl.map((q, i) => { const c = at(0, f0 + (f1 - f0) * 0.4); return [c[0] + (q[0] - c[0]) * 0.5, c[1] + (q[1] - c[1]) * 0.5]; });
    const clip = K.pathOf([[XS, PAPER.y0, PAPER.z0], [XS, PAPER.y1, PAPER.z0], [XS, PAPER.y1, PAPER.z1], [XS, PAPER.y0, PAPER.z1]].map((p) => K.iso(p, P)), true);
    return `<clipPath id="${id}"><path d="${clip}"/></clipPath><g clip-path="url(#${id})" opacity=".85">` +
      `<path d="${quad(CAND.dish[0], CAND.dish[1], CAND.dish[2])}" fill="#d9c48a" opacity=".7"/><path d="${quad(CAND.wax[0], CAND.wax[1], CAND.wax[2])}" fill="#e3cd98" stroke="#a88a4e" stroke-width="0.5"/>` +
      `<path d="${K.pathOf(fl, true)}" fill="#f6b73c"/><path d="${K.pathOf(core, true)}" fill="#fff3c4"/></g>`;
  }

  ISO.add({
    name: "pinholecamera", title: "Pinhole camera (part)", compare: null,
    about: "A 15 × 10 × 10 cm box pinhole camera, near side cut away: the pinhole in its +x end (light from +x) and a tracing-paper screen at the −x end showing the upside-down image of a candle d cm in front, 12.5 × 14.6 ÷ d cm tall. anchors: pinhole screen",
    line: "pinholecamera cx cy k d=15..100 lab=0 lit=camera|screen|pinhole",
    demo: { line: "pinholecamera 480 390 22 d=25", script: [{ set: {}, hold: 1 }, { set: { d: 18 }, hold: "settle" }, { set: { d: 40, lit: "screen" }, hold: "settle" }, { set: { lit: "pinhole" }, hold: 1.2 }, { set: { d: 25, lit: "camera" }, hold: "settle" }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), id = `phcam${++seq}`;
      const st = { d: ISO.clamp(ISO.num(o, "d", 25), 15, 100) }, want = { d: st.d };
      let lit = o.lit || "";
      g.innerHTML = backSvg(P) + `<g data-name="screen" data-part="image"></g>` + frontSvg(P) + `<g data-part="words"></g>`;
      const el = window.LAB.parts(g);
      g.anchors = { pinhole: [X1, 0, ZH], screen: [XS, 0, ZH] };
      const draw = () => {
        const key = st.d.toFixed(2);
        w.rebuild(el.image, key, () => imageSvg(P, st.d, id));
        if (lab) w.rebuild(el.words, "w", () => window.LAB.word(P, lab, [X1, Y1, Z1 + 1.5], "pinhole", "#556", { anchor: "start" }) + window.LAB.word(P, lab, [X0, Y1, 0], "screen (tracing paper)", "#556", { dy: 16 }));
      };
      g.set = (p) => {
        if (p.d !== undefined && p.d !== "" && Number.isFinite(+p.d)) want.d = ISO.clamp(+p.d, 15, 100);
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
        draw();
      };
      g.update = (dt) => { st.d = ISO.follow(st.d, want.d, dt, 0.6, ISO.still()); draw(); return st.d !== want.d; };
      g.readout = () => `candle ${st.d.toFixed(0)} cm from the hole · screen 14.6 cm behind it · image = 12.5 × 14.6 ÷ ${st.d.toFixed(0)} = ${((12.5 * DIST) / st.d).toFixed(1)} cm, upside down`;
      draw(); B20.light(w, g, lit);
      return g;
    },
  });
})();
