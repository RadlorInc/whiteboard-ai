// "xlrcable cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 sag=0..1 lab=0 lit=cable|plugs" — a PART
// (PARTS.md, batch 6): the microphone cable of mic.js, run between two parts like wirelead. Its origin is the mating
// face of its female XLR plug, which points up (+z) so it goes on under a microphone's plug (at=mic.plug): the steel
// shell with its three pin holes in the face and the latch button, a rubber boot below, the 6 mm black cable out of
// the bottom. The far end: the player turns to=<id>.<anchor> into tox= toy= (that anchor's board point in this part's
// own frame) and the end is the world point there at height dz; without it, dx dy dz (cm) from the start. There a
// male XLR plug lies level, its pins' tip at the end point, pointing on away from the start (into a mixer's
// socket); the cable hangs between the boots in a soft curve (sag 0 taut, 1 slack, lying down on the surface 1.5 cm
// under the lower end). Static. Built in mm (ISO.mm); the end anchor in cm.
(() => {
  const K = window.K, G = window.G;
  const PL = 48, DIA = 6, FLOOR = 15, N = 48;
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : null; };
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // a plug from its face at `o` back along unit `a` (the cable end): steel shell, a grip ring, the tapered boot
  function plugSvg(P, o, a, male) {
    const T = window.TECH, u = unit(cross(a, [0, 0, 1])) || [1, 0, 0], v = cross(a, u), F = G.frameOf(o, a, u, v), out = [];
    const shell = male ? [[0, 0], [0, 9.2], [1, 9.6], [26, 9.6], [28, 9.2], [28, 0]] : [[0, 0], [0, 9.2], [1, 9.8], [27, 9.8], [28, 9.2], [28, 0]];
    out.push(ISO.tinted(T.C.steel, K.solidSvg(G.solidOf(shell, F, P, { steps: 20 }), { tone: "mid", inner: K.lineSvg([7, 20].map((s) => G.arcOf(F, s, 9.62, P)).join(""), { tone: "faint" }) })));
    out.push(ISO.tinted(T.C.rubber, K.solidSvg(G.solidOf([[28, 8.6], [31, 8.4, 1], [40, 6, 1], [PL, DIA / 2 + 0.4]], F, P, { steps: 18 }), { tone: "mid", inner: K.lineSvg([33, 36, 39].map((s) => G.arcOf(F, s, 8.2 - (s - 31) * 0.28, P)).join(""), { tone: "faint" }) })));
    // the face: a female plug's three pin holes, or the ends of the male's three pins in their recess
    const at = (s, x, y) => add(add(add(o, a, s), u, x), v, y), pins = [[-4.2, 2.6], [4.2, 2.6], [0, -4.6]];
    out.push(`<path d="${G.circleOf(F, -0.02, 7.6, P)}" fill="${male ? "#2a2d31" : "#5a5f66"}" stroke="#0b0c0e" stroke-width=".5"/>`);
    out.push(pins.map(([x, y]) => `<path d="${G.circleOf(G.frameOf(at(-0.04, x, y), a, u, v), 0, male ? 1 : 1.2, P)}" fill="${male ? "#e0bf66" : "#111214"}" stroke="${male ? "#6b4f0e" : "#000"}" stroke-width=".3"/>`).join(""));
    // the latch: a small button on the shell's side (female) or a slot (male)
    out.push(ISO.tinted(T.C.dark, ISO.box((s, w, y) => add(add(add(o, a, s), u, w), v, y), P, [6, 12], [-1.4, 1.4], [9.6, 10.8], "mid")));
    return out.join("");
  }
  function curveOf(S0, aS, E0, aE, sag) {
    const p0 = add(S0, aS, PL), p3 = add(E0, aE, PL), span = Math.hypot(...p3.map((x, i) => x - p0[i]));
    const lead = Math.min(span * 0.25, 60) + 8, p1 = add(p0, aS, lead), p2 = add(p3, aE, lead), floor = Math.min(p0[2], p3[2] - 9.6) - FLOOR, drop = sag * (0.32 * span + 10), pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, m = 1 - t, b = [0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * p3[j]);
      const z = b[2] - drop * Math.sin(Math.PI * t) ** 2, e = 8;
      b[2] = (z + floor + Math.sqrt((z - floor) ** 2 + e * e)) / 2;   // a soft max: the cable lies down on the surface
      pts.push(b);
    }
    return pts;
  }
  ISO.add({
    name: "xlrcable", title: "Microphone XLR cable (part)", compare: null,
    about: "A microphone cable: a female XLR plug pointing up (it goes on under a microphone) and a black cable hanging in a soft curve to a male XLR plug at to=<id>.<anchor> (or dx dy dz cm). anchors: end",
    line: "xlrcable cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 sag=0..1 lab=0 lit=cable|plugs",
    demo: { line: "xlrcable 300 170 20 dx=26 dy=-4 dz=-12 sag=0.5 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "plugs" }, hold: 1.2 }, { set: { lit: "cable" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -500, 500), sag = B.num(o, "sag", 0.5, 0, 1);
      const E = (B.fin(o.tox) && B.fin(o.toy) ? ISO.unproject(P, [+o.tox, +o.toy], B.num(o, "dz", 0, -500, 500)) : [B.num(o, "dx", 30, -500, 500), B.num(o, "dy", 0, -500, 500), B.num(o, "dz", -10, -500, 500)]).map(lim);
      const Em = E.map((v) => v * 10), S0 = [0, 0, 0], aS = [0, 0, -1];
      // the male plug lies level, pointing on away from the start, its cable end toward it
      const aE = unit([-Em[0], -Em[1], 0]) || [-1, 0, 0];
      const pts = curveOf(S0, aS, Em, aE, sag), d = K.pathOf(pts.map((p) => K.iso(p, Pm))), wpx = Math.max(1, G.scaleOf(Pm) * DIA);
      const plugs = [[S0, aS, false], [Em, aE, true]].map(([p, a, m]) => ({ k: K.depthOf(add(p, a, PL / 2), Pm), svg: plugSvg(Pm, p, a, m) })).sort((x, y) => x.k - y.k).map((x) => x.svg).join("");
      const len = pts.reduce((sum, p, i) => (i ? sum + Math.hypot(...p.map((x, j) => x - pts[i - 1][j])) : 0), 0) + 2 * PL;
      g.innerHTML = `<g data-name="cable">${B.tube(d, wpx, "#2b2d31", "#0b0c0e", "#6a6e75")}</g><g data-name="plugs">${plugs}</g>` +
        (lab ? ISO.word(K.iso(pts[N >> 1], Pm), "XLR mic cable", "#444", { size: 13, anchor: "start", dy: 16 }).replace('x="', 'dx="6" x="') : "");
      g.anchors = { end: E };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `microphone cable · about ${Math.round(len / 10)} cm plug to plug · 3 wires: two carry the signal, the third is the shield`;
      B.light(w, g, lit);
      return g;
    },
  });
})();
