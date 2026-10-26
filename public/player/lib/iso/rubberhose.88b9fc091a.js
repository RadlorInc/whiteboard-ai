// "rubberhose cx cy k to=<id>.<anchor> dx= dy= dz= c=red|orange|black|grey|blue sag=0..1 lab=0 lit=hose|ends" — a PART
// (PARTS.md, batch 5): a thick-walled rubber hose (10 mm across, a 6 mm bore) pushed onto a nozzle at each end, its
// origin the start point (the first nozzle's tip, at=tap.nozzle). The end: to=<id>.<anchor> (the player passes tox
// toy, as for wirelead) at height dz, or dx dy dz cm from the start. It leaves each nozzle level, toward the other end,
// and hangs between them; sag 0 runs it taut, 1 lets it lie on the bench (bench= cm under the start, default the lower
// end less 4 cm). Each end: a pushed-on cuff a little fatter than the hose and its cut face with the dark bore.
// c: red (gas, a Bunsen hose), orange (laboratory tubing), black or grey (vacuum, a bell jar or a pump), blue (water to
// a condenser). Static. Built in mm; the end anchor in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 5, BORE = 3, CUFF = 14, N = 48;
  const COL = { red: ["#c9442f", "#5a1f17"], orange: ["#e0823a", "#6e3510"], black: ["#3a3c40", "#0e0f11"], grey: ["#77797e", "#2e3034"], blue: ["#4a7fc0", "#173a66"] };
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : null; };
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);
  const tintOf = ([col, ink]) => ISO.tint(LAB.mix(col, "#ffffff", 0.3), [LAB.mix(col, "#000000", 0.25), LAB.mix(col, "#000000", 0.12), col, LAB.mix(col, "#ffffff", 0.15)], ink);

  // the centre line: level out of each nozzle, a cubic between, hanging by sag, lying on the bench where it would hang lower
  function curveOf(E, sag, bench) {
    const h = unit([E[0], E[1], 0]) || [1, 0, 0], span = Math.hypot(...E), lead = Math.min(span * 0.3, 120) + 10;
    const p0 = [0, 0, 0], p1 = add(p0, h, lead), p2 = add(E, h, -lead), drop = sag * (0.35 * span + 30), pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, m = 1 - t, b = [0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * E[j]);
      const z = b[2] - drop * Math.sin(Math.PI * t) ** 2, e = 8;
      b[2] = (z + bench + R + Math.sqrt((z - bench - R) ** 2 + e * e)) / 2;
      pts.push(b);
    }
    return { pts, h };
  }
  // the hose's end pushed back over a nozzle whose tip is p (a = into the hose): the stretched cuff and its cut face
  const cuffSvg = (P, p, a, tint) => {
    const F = G.frameAlong(p, a);
    return ISO.tinted(tint, S(G.solidOf([[-CUFF, R + 0.9], [0, R + 0.9], [4, R]], F, P, { steps: 24 }), { tone: "mid" })) +
      `<path d="${G.circleOf(F, -CUFF - 0.05, BORE, P, 20)}" fill="#1b1414" opacity=".85"/>`;
  };

  ISO.add({
    name: "rubberhose", title: "Rubber hose (part)", compare: null,
    about: "A thick-walled rubber hose, 10 mm across, pushed onto a nozzle at each end and hanging between them: gas from a bench tap to a Bunsen burner, a vacuum line to a bell jar, or cooling water to a condenser. anchors: end",
    line: "rubberhose cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 c=red|orange|black|grey|blue sag=0..1 bench=-100..0 lab=0 lit=hose|ends",
    demo: { line: "rubberhose 300 260 16 dx=24 dy=4 dz=-3 c=red sag=0.6 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ends" }, hold: 1.2 }, { set: { sag: 0.1, lit: "hose" }, hold: 1.2 }, { set: { c: "black", sag: 1, lit: "" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -500, 500), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
      const st = { c: COL[o.c] ? o.c : "red", sag: ISO.clamp(ISO.num(o, "sag", 0.5), 0, 1), dx: lim(ISO.num(o, "dx", 20)), dy: lim(ISO.num(o, "dy", 0)), dz: lim(ISO.num(o, "dz", 0)), tox: o.tox, toy: o.toy, bench: fin(o.bench) ? ISO.clamp(+o.bench, -100, 0) : null };
      let lit = o.lit || "", light = null, len = 0;
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map(lim);
      const build = () => {
        const E = endOf(), Em = E.map((v) => v * 10), bench = (st.bench ?? Math.min(0, E[2]) - 4) * 10;
        const { pts, h } = curveOf(Em, st.sag, bench), col = COL[st.c], tint = tintOf(col);
        const d = K.pathOf(pts.map((p) => K.iso(p, Pm))), w = G.scaleOf(Pm) * R * 2;
        len = pts.reduce((s, p, i) => (i ? s + Math.hypot(...p.map((x, j) => x - pts[i - 1][j])) : 0), 0);
        // the hose: its ink outline, the rubber, a dull sheen along the top (rubber is matt), a faint moulding line
        const hose = `<path d="${d}" fill="none" stroke="${col[1]}" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/>` +
          `<path d="${d}" fill="none" stroke="${col[0]}" stroke-width="${w.toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/>` +
          `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(w * 0.22).toFixed(2)}" stroke-linecap="butt" opacity=".22" transform="translate(${(-w * 0.1).toFixed(2)} ${(-w * 0.22).toFixed(2)})"/>` +
          `<path d="${d}" fill="none" stroke="${col[1]}" stroke-width="0.5" opacity=".35" transform="translate(${(w * 0.18).toFixed(2)} ${(w * 0.12).toFixed(2)})"/>`;
        // the far end first when it is further back (painter's order), so the near cuff covers the hose's end
        const c0 = cuffSvg(Pm, [0, 0, 0], h, tint), c1 = cuffSvg(Pm, Em, h.map((v) => -v), tint);
        const back = K.depthOf([0, 0, 0], Pm) < K.depthOf(Em, Pm);
        g.innerHTML = `<g data-name="ends">${back ? c0 : c1}</g><g data-name="hose">${hose}</g><g data-name="ends">${back ? c1 : c0}</g>` +
          (lab ? CIRC.word(P, pts[N >> 1].map((v) => v / 10), `${st.c === "blue" ? "water" : st.c === "red" ? "gas" : "rubber"} hose`) : "");
        g.anchors = { end: E };
        light = CIRC.lighter(g); light(lit);
      };
      g.set = (p) => {
        let again = false;
        if (p.c !== undefined && COL[p.c] && p.c !== st.c) { st.c = p.c; again = true; }
        if (p.sag !== undefined && fin(p.sag)) { const v = ISO.clamp(+p.sag, 0, 1); if (v !== st.sag) { st.sag = v; again = true; } }
        if (p.bench !== undefined && fin(p.bench)) { st.bench = ISO.clamp(+p.bench, -100, 0); again = true; }
        for (const key of ["dx", "dy", "dz"]) if (p[key] !== undefined && fin(p[key])) { st[key] = lim(+p[key]); again = true; }
        for (const key of ["tox", "toy"]) if (p[key] !== undefined && fin(p[key])) { st[key] = +p[key]; again = true; }
        if (p.lit !== undefined) lit = p.lit;
        if (again) build(); else light(lit);
      };
      g.update = () => false;
      g.readout = () => `${st.c} rubber hose · 10 mm across, 6 mm bore · about ${Math.round(len / 10)} cm nozzle to nozzle`;
      build();
      return g;
    },
  });
})();
