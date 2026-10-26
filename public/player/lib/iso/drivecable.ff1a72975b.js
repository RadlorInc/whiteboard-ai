// "drivecable cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 lab=0 lit=cable|nuts" — a PART
// (PARTS.md, batch 5): a speedometer drive cable, 8 mm across (gauge.js's cable, real size), its origin the start
// point (place at= a speedometer's `cable`). It leaves the start along −y (out of the instrument's back) and comes
// down into its end from above (a gearbox's `cable` spigot): to=<id>.<anchor> as wirelead (the player passes tox toy
// and dz), or dx dy dz cm from the start. Each end: a knurled steel nut over the spigot's thread and a crimped ferrule
// where the black casing starts; the casing runs between them in a smooth stiff bend. Static. Built in mm; the end
// anchor in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const DIA = 8, N = 40;
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);

  // the nut and the ferrule at one end, along unit a (from the spigot out toward the casing)
  function endSvg(P, at, a) {
    const F = G.frameAlong(at, a);
    return ISO.tinted(ISO.T.steel, S(G.disc(-12, 3, 7.4, F, P), { tone: "mid", inner: L(G.ribsOf(F, -11.4, 2.4, 7.4, 14, P, { seams: true }), { tone: "lo" }) }) +
      S(G.solidOf([[3, 5.6], [6, 5.6], [8, 5.2, 1], [16, 5.2], [19, DIA / 2]], F, P), { tone: "hi", inner: L([9, 12, 15].map((s) => G.arcOf(F, s, 5.2, P)).join(""), { tone: "faint" }) }));
  }

  ISO.add({
    name: "drivecable", title: "Speedometer drive cable (part)", compare: null,
    about: "A speedometer drive cable: black 8 mm casing in a stiff smooth bend, a knurled nut and ferrule at each end; leaves its start along −y (a speedometer's back) and comes down onto its end (a gearbox's spigot) from to=<id>.<anchor> or dx dy dz cm; put it in the scene before the speedometer so the case hides its start. anchors: end",
    line: "drivecable cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 lab=0 lit=cable|nuts",
    demo: { line: "drivecable 380 380 20 dx=-6 dy=-26 dz=-4", script: [{ set: {}, hold: 1 }, { set: { lit: "nuts" }, hold: 1.2 }, { set: { lit: "cable" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(Number.isFinite(v) ? v : 0, -200, 200), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
      const st = { dx: lim(ISO.num(o, "dx", -6)), dy: lim(ISO.num(o, "dy", -26)), dz: lim(ISO.num(o, "dz", -4)), tox: o.tox, toy: o.toy, lit: o.lit || "" };
      let len = 0;
      const build = () => {
        const E = (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map(lim), Em = E.map((v) => v * 10);
        const aS = [0, -1, 0], aE = [0, 0, 1], p0 = add([0, 0, 0], aS, 19), p3 = add(Em, aE, 19);
        const span = Math.hypot(...p3.map((x, i) => x - p0[i])), Lb = Math.max(20, span * 0.45), p1 = add(p0, aS, Lb), p2 = add(p3, aE, Lb);
        const pts = [];
        for (let i = 0; i <= N; i++) { const t = i / N, m = 1 - t; pts.push([0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * p3[j])); }
        len = pts.reduce((sum, p, i) => (i ? sum + Math.hypot(...p.map((x, j) => x - pts[i - 1][j])) : 0), 0) + 38;
        const d = K.pathOf(pts.map((p) => K.iso(p, Pm))), wpx = G.scaleOf(Pm) * DIA;
        const ends = [[0, 0, 0], aS, Em, aE].reduce((acc, v, i, a) => (i % 2 ? acc : [...acc, { k: K.depthOf(add(v, a[i + 1], 8), Pm), svg: endSvg(Pm, v, a[i + 1]) }]), []).sort((p, q) => p.k - q.k);
        g.innerHTML = `<g data-name="cable">${CIRC.tube(d, wpx, ["#2c2e33", "#0b0c0e"])}<path d="${d}" fill="none" stroke="#8a8f97" stroke-width="${(wpx * 0.16).toFixed(2)}" stroke-linecap="round" opacity=".55" transform="translate(-0.3 -${(wpx * 0.22).toFixed(2)})"/></g>` +
          `<g data-name="nuts">${ends.map((e) => e.svg).join("")}</g>` + (lab ? CIRC.word(P, pts[N >> 1].map((v) => v / 10), "drive cable") : "");
        g.anchors = { end: E };
      };
      const w = ISO.writer();
      g.set = (p) => {
        let again = false;
        for (const key of ["dx", "dy", "dz", "tox", "toy"]) if (p[key] !== undefined && fin(p[key])) { st[key] = key[0] === "d" ? lim(+p[key]) : +p[key]; again = true; }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build();
        B15.light(w, g, st.lit);
      };
      g.update = () => false;
      g.readout = () => `speedometer drive cable · about ${Math.round(len / 10)} cm end to end · it turns inside its casing at the wheel's speed`;
      build();
      B15.light(w, g, st.lit);
      return g;
    },
  });
})();
