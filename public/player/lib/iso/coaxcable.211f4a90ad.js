// "coaxcable cx cy k to=<id>.<anchor> dx=-300..300 dy=-300..300 dz=-300..300 leave=down|up|side enter=down|up|side
// c=black|white sag=0..1 lab=0 lit=cable|plugs" — a PART (PARTS.md): the 7 mm coax of satdish.js (LNB down to the
// meter), run between two parts like wirelead. Its origin is the start plug's mouth (place it at= a dishaerial's
// `lnb`); the end: to=<id>.<anchor> (the player passes tox toy; the end is the world point there at the start's
// height plus dz) or dx dy dz cm. Each end is an F plug (centre pin, hex nut, crimp ferrule, boot); the cable leaves
// the start plug along leave (down out of an LNB, up out of a socket on top, or side: level toward the other end) and
// comes into the end plug along enter, hanging between them by sag. Static: set() only moves its ends. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G;
  const DIA = 0.7, PLUG = 3, N = 48, LIM = 600;
  const COL = { black: ["#2c2f33", "#08090a"], white: ["#eceeed", "#7a7f86"] };
  const DIRS = ["down", "up", "side"];
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : null; };
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);
  // the way the cable leaves a plug: straight down, straight up, or level toward the other end
  const dirOf = (kind, toward) => (kind === "up" ? [0, 0, 1] : kind === "side" ? unit([toward[0], toward[1], 0]) || [1, 0, 0] : [0, 0, -1]);
  function curveOf(p0, aS, p3, aE, sag) {
    const span = Math.hypot(...p3.map((x, i) => x - p0[i])), lead = Math.min(span * 0.35, 40) + 3;
    const p1 = add(p0, aS, lead), p2 = add(p3, aE, lead), drop = sag * (0.25 * span + 6), pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, m = 1 - t, b = [0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * p3[j]);
      b[2] -= drop * Math.sin(Math.PI * t) ** 2;
      pts.push(b);
    }
    return pts;
  }

  ISO.add({
    name: "coaxcable", title: "Coax cable (part)", compare: null,
    about: "A black 7 mm coax cable with an F plug on each end (centre pin, hex nut, crimp ferrule), run from one part's socket to another's (to=<id>.<anchor> or dx dy dz cm), hanging in a soft curve. anchors: end",
    line: "coaxcable cx cy k to=<id>.<anchor> dx=-300..300 dy=-300..300 dz=-300..300 leave=down|up|side enter=down|up|side c=black|white sag=0..1 lab=0 lit=cable|plugs",
    demo: { line: "coaxcable 340 130 14 dx=16 dy=4 dz=-20 leave=down enter=up sag=0.4 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "plugs" }, hold: 1.2 }, { set: { sag: 0.9, lit: "cable" }, hold: 1.2 }, { set: { c: "white", leave: "side", enter: "side", sag: 0.2, lit: "" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v), lim = (v) => ISO.clamp(v, -LIM, LIM);
      const st = { c: COL[o.c] && Object.hasOwn(COL, o.c) ? o.c : "black", sag: B37.num(o, "sag", 0.4, 0, 1), leave: DIRS.includes(o.leave) ? o.leave : "down", enter: DIRS.includes(o.enter) ? o.enter : "up",
        dx: B37.num(o, "dx", 30, -LIM, LIM), dy: B37.num(o, "dy", 0, -LIM, LIM), dz: B37.num(o, "dz", -30, -LIM, LIM), tox: o.tox, toy: o.toy, lit: o.lit || "" };
      const w = ISO.writer();
      let len = 0;
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map(lim);
      const build = () => {
        const E = endOf(), S0 = [0, 0, 0], aS = dirOf(st.leave, E), aE = dirOf(st.enter, E.map((v) => -v));
        const pts = curveOf(add(S0, aS, PLUG), aS, add(E, aE, PLUG), aE, st.sag);
        len = pts.reduce((s, p, i) => (i ? s + Math.hypot(...p.map((x, j) => x - pts[i - 1][j])) : 0), 0) + 2 * PLUG;
        const d = K.pathOf(pts.map((p) => K.iso(p, P))), sheath = st.c === "white" ? ISO.tint("#f4f5f4", ["#b9bdc2", "#c8ccd0", "#d7dadd", "#e5e7e9"], "#6a6f76") : ISO.T.rubber;
        // the plug nearer the viewer is drawn last
        const plugs = [[S0, aS], [E, aE]].sort((a, b) => K.depthOf(a[0], P) - K.depthOf(b[0], P)).map(([p, a]) => B37.fplug(P, p, a, sheath)).join("");
        g.innerHTML = `<g data-name="cable">${CIRC.tube(d, Math.max(1, G.scaleOf(P) * DIA), COL[st.c])}</g><g data-name="plugs">${plugs}</g><g data-part="words"></g>`;
        if (lab) g.querySelector('[data-part="words"]').innerHTML = CIRC.word(P, pts[N >> 1], "coax cable");
        g.anchors = { end: E };
        B37.light(w, g, st.lit);
      };
      g.set = (p) => {
        let again = false;
        if (p.c !== undefined && Object.hasOwn(COL, p.c) && p.c !== st.c) { st.c = p.c; again = true; }
        if (p.sag !== undefined) { const v = B37.num(p, "sag", st.sag, 0, 1); if (v !== st.sag) { st.sag = v; again = true; } }
        for (const key of ["leave", "enter"]) if (p[key] !== undefined && DIRS.includes(p[key]) && p[key] !== st[key]) { st[key] = p[key]; again = true; }
        for (const key of ["dx", "dy", "dz"]) if (p[key] !== undefined && fin(p[key])) { st[key] = lim(+p[key]); again = true; }
        for (const key of ["tox", "toy"]) if (p[key] !== undefined && fin(p[key])) { st[key] = +p[key]; again = true; }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build(); else B37.light(w, g, st.lit);
      };
      g.update = () => false;
      g.readout = () => `${st.c} coax cable · about ${Math.round(len)} cm plug to plug · F plugs: the centre pin carries the signal, the braid under the sheath is the shield`;
      build();
      return g;
    },
  });
})();
