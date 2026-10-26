// "scaleboard cx cy k w=20..60 h=20..60 lab=0 lit=board|scale|feet" — a PART (PARTS.md, batch 5): the upright wooden
// backboard that stands behind manometer or barometer tubes, its origin the bench point under its middle. A 1 cm
// board (w × h cm, default 40 × 30) in the x–z plane, its front face toward +y, on two feet; a white printed strip
// down each side with a millimetre scale (ticks hang from the strip's rule line: every mm, longer every 5, longest every
// 10 with the cm number), zero 3 cm above the bench; four brass screws hold the strips. Static. Built in mm; anchors in
// cm: zero = the left scale's zero on the front face, front = the middle of the front face at zero (where tubes stand).
// The scale follows the backboards in bernoulli.js and pressure.js.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const T = 10, FOOT = 20, Z0 = 30, SW = 26;

  function boardSvg(P, W, H) {
    const x0 = -W / 2, x1 = W / 2, yf = T / 2, out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: x0 - 4, y: -45, w: W + 8, d: 90, r: 6 }, 0, 6, P)}"/>`);
    // two feet across the board's bottom, the board standing in their slots
    // (each foot in two halves, behind and in front of the board, so the board stands through it)
    const foot = (y0, y1) => [x0 + 30, x1 - 30].map((x) => ISO.tinted(ISO.T.wood, S(K.slabOf({ x: x - 12, y: y0, w: 24, d: y1 - y0, r: 1.5 }, 0, FOOT, P, 3, 0.8), { tone: "mid" }))).join("");
    out.push(`<g data-name="feet">${foot(-40, -yf)}</g>`);
    // the board: a slab with eased edges, a faint grain on its front face (printed, so it may end in the wood)
    out.push(`<g data-name="board">${ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0, x1], [-yf, yf], [8, H], "mid"))}`);
    const grain = [0.22, 0.47, 0.71].map((f) => K.pathOf([[x0 + W * 0.3, yf + 0.05, 8 + (H - 8) * f], [x0 + W * 0.7, yf + 0.05, 8 + (H - 8) * f + 6]].map((p) => K.iso(p, P)))).join("");
    out.push(`<path d="${grain}" fill="none" stroke="#b48a52" stroke-width="0.6" opacity=".45"/>`, "</g>");
    out.push(`<g data-name="feet">${foot(yf, 40)}</g>`);
    return out.join("");
  }
  // a printed scale strip on the front face at x (its rule line at xr), mm ticks hanging toward +x from it
  function stripSvg(P, xs, H) {
    const yf = T / 2 + 0.3, top = H - 12, out = [], at = (x, z) => K.iso([x, yf, z], P);
    out.push(`<path d="${K.pathOf([at(xs, Z0 - 6), at(xs + SW, Z0 - 6), at(xs + SW, top + 4), at(xs, top + 4)], true)}" fill="#fbfaf5" stroke="#8a7a5a" stroke-width="0.5"/>`);
    const xr = xs + 3, minor = [], mid = [], major = [];
    for (let mm = 0; Z0 + mm <= top; mm++) (mm % 10 === 0 ? major : mm % 5 === 0 ? mid : minor).push(K.pathOf([at(xr, Z0 + mm), at(xr + (mm % 10 === 0 ? 8 : mm % 5 === 0 ? 5.5 : 3.5), Z0 + mm)]));
    out.push(`<g style="${ISO.T.wood}">`, L(K.pathOf([at(xr, Z0), at(xr, Z0 + Math.floor(top - Z0))]), { tone: "mid" }), L(minor.join(""), { tone: "lo", free: "end" }), L(mid.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }), "</g>");
    for (let cm = 0; Z0 + cm * 10 <= top; cm++) out.push(LAB.faceText(P, [xr + 15, yf + 0.05, Z0 + cm * 10 - 1.6], [1, 0, 0], String(cm), 4.6, "#3a3226"));
    // two brass screws hold each strip, their heads on the face (a slot across each)
    for (const z of [Z0 - 3.5, top + 1.5]) {
      const c = [xs + SW / 2, yf, z];
      out.push(ISO.tinted(ISO.T.brass, S(G.disc(0, 0.7, 1.5, G.frameAlong(c, [0, 1, 0]), P), { tone: "hi" })), `<path d="${K.pathOf([[c[0] - 1, yf + 0.75, z - 0.4], [c[0] + 1, yf + 0.75, z + 0.4]].map((q) => K.iso(q, P)))}" stroke="#6b5114" stroke-width="0.6"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "scaleboard", title: "Scale backboard (part)", compare: null,
    about: "An upright wooden backboard (40 × 30 cm) on two feet, with a millimetre scale printed down each side, to stand behind manometer or barometer tubes and read their levels. anchors: zero front",
    line: "scaleboard cx cy k w=20..60 h=20..60 lab=0 lit=board|scale|feet",
    demo: { line: "scaleboard 480 440 11 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.2 }, { set: { lit: "feet" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const W = ISO.clamp(ISO.num(o, "w", 40), 20, 60) * 10, H = ISO.clamp(ISO.num(o, "h", 30), 20, 60) * 10;
      g.innerHTML = boardSvg(Pm, W, H) + `<g data-name="scale">${stripSvg(Pm, -W / 2 + 12, H)}${stripSvg(Pm, W / 2 - 12 - SW, H)}</g>` +
        (lab ? CIRC.word(P, [W / 20, 0, H / 10], "scale board (mm)") : "");
      g.anchors = { zero: [(-W / 2 + 15) / 10, T / 20, Z0 / 10], front: [0, T / 20, Z0 / 10] };
      const light = CIRC.lighter(g);
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `scale board ${W / 10} × ${H / 10} cm · millimetre scale from 0 (3 cm above the bench) to ${Math.floor((H - 12 - Z0) / 10)} cm`;
      light(lit);
      return g;
    },
  });
})();
