// "wirelead cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 c=red|black|blue|green|yellow sag=0..1 flow=0|1 lab=0 lit=wire|clips"
// — a PART (PARTS.md): a 4 mm insulated test lead with a crocodile clip on each end, its origin the start point (where
// the first clip bites). The end: the player turns to=<id>.<anchor> into tox= toy= (that anchor's board point in this
// part's own frame) and the end is the world point there at height dz; without it, dx dy dz (cm) from the start.
// Each clip: two serrated steel jaws on a pin with its coil spring, the PVC boot in the lead's colour; the clip rises
// from its bite toward the other end and the lead leaves its boot and hangs between them in a soft curve (sag 0 taut,
// 1 slack, lying along the bench 2 cm under the lower end). flow=1: small bright dots run along it from start to end
// (the current), easing in and out. set({ flow, sag, c }). Built in mm (ISO.mm); the end anchor in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  // ponytail: the bench is assumed 2 cm (FLOOR mm) under the lower clip; add a floor= key if leads must lie on other heights
  const CLIP = 44, DIA = 3.6, FLOOR = 20, N = 56;
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : null; };
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);

  // a clip biting at `bite`, its body along unit `a` (away from the bite); `side` is level and square to a
  function clipSvg(P, bite, a, tint) {
    const u = unit([-a[1], a[0], 0]) || [0, 1, 0], v = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
    const at = (s, w, h) => [bite[0] + a[0] * s + u[0] * w + v[0] * h, bite[1] + a[1] * s + u[1] * w + v[1] * h, bite[2] + a[2] * s + u[2] * w + v[2] * h];
    // a jaw: a steel plate from the tip (s 0) back to the pin (s 18), narrow at the tip, opening away from the other jaw
    const jaw = (sg) => {
      const V = [[0, -1.8, 0.5], [0, 1.8, 0.5], [0, 1.8, 2.3], [0, -1.8, 2.3], [19, -2.9, 2.4], [19, 2.9, 2.4], [19, 2.9, 4.8], [19, -2.9, 4.8]].map(([s, w, h]) => at(s, w, h * sg));
      const teeth = []; for (let i = 0; i <= 10; i++) teeth.push(K.iso(at(1 + i * 1.1, i % 2 ? 1.6 : -1.6, sg * (0.6 + i * 0.105 - (i % 2 ? 0 : 0.35))), P));
      return { k: K.depthOf(at(9, 0, sg * 2), P), svg: ISO.tinted(ISO.T.steel, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")) + `<path d="${K.pathOf(teeth)}" fill="none" stroke="#4a4e55" stroke-width="${Math.max(0.4, G.scaleOf(P) * 0.35).toFixed(2)}" stroke-linejoin="bevel"/>` };
    };
    // the pin across the jaws and the coil spring wound on it
    const Fp = G.frameOf(at(18, -4, 0), u, a, v);
    const spring = { k: K.depthOf(at(18, 0, 0), P), svg: ISO.tinted(ISO.T.steel, S(G.disc(0, 8, 1.9, Fp, P), { tone: "mid", inner: L([1.6, 3.2, 4.8, 6.4].map((s) => G.arcOf(Fp, s, 1.9, P)).join(""), { tone: "lo" }) })) };
    // the boot: soft PVC over the handles, grip rings, tapering to the lead
    const Fb = G.frameOf(bite, a, u, v);
    const boot = { k: K.depthOf(at(30, 0, 0), P), svg: ISO.tinted(tint, S(G.solidOf([[15, 4.6], [17, 5.4, 1], [24, 5.6, 1], [33, 4.8, 1], [40, 3.2, 1], [CLIP, DIA / 2]], Fb, P, { steps: 24 }), { tone: "mid", inner: L([21, 24, 27].map((s) => G.arcOf(Fb, s, 5.6, P)).join(""), { tone: "faint" }) })) };
    return [jaw(1), jaw(-1), spring, boot].sort((p, q) => p.k - q.k).map((p) => p.svg).join("");
  }
  // the lead's centre line from one boot to the other: leaving each boot along its clip, hanging by sag, resting on
  // the bench (FLOOR mm under the lower bite) where it would hang lower
  function curveOf(S0, aS, E0, aE, sag) {
    const p0 = add(S0, aS, CLIP), p3 = add(E0, aE, CLIP), span = Math.hypot(...p3.map((x, i) => x - p0[i]));
    const lead = Math.min(span * 0.2, 35) + 4, p1 = add(p0, aS, lead), p2 = add(p3, aE, lead), floor = Math.min(S0[2], E0[2]) - FLOOR, drop = sag * (0.32 * span + 10);
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, m = 1 - t, b = [0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * p3[j]);
      const z = b[2] - drop * Math.sin(Math.PI * t) ** 2, e = 6;
      b[2] = (z + floor + Math.sqrt((z - floor) ** 2 + e * e)) / 2;   // a soft max: the lead lies down on the bench
      pts.push(b);
    }
    return pts;
  }

  ISO.add({
    name: "wirelead", title: "Wire lead with clips (part)", compare: null,
    about: "An insulated test lead with a crocodile clip on each end (serrated jaws, spring, coloured boot), hanging in a soft curve from its start to to=<id>.<anchor> (or dx dy dz cm); flow=1 runs small dots along it for the current. anchors: end",
    line: "wirelead cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 c=red|black|blue|green|yellow sag=0..1 flow=0|1 lab=0 lit=wire|clips",
    demo: { line: "wirelead 250 300 26 dx=22 dy=-4 dz=0 c=red sag=0.5", script: [{ set: {}, hold: 1 }, { set: { flow: 1 }, hold: 2.5 }, { set: { sag: 0.1, lit: "clips" }, hold: 1.5 }, { set: { c: "black", sag: 1, lit: "wire" }, hold: 1.5 }, { set: { flow: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -500, 500), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
      const st = { c: CIRC.LEAD[o.c] ? o.c : "red", sag: ISO.clamp(ISO.num(o, "sag", 0.5), 0, 1), flow: o.flow === "1" ? 1 : 0, lit: o.lit || "", dx: lim(ISO.num(o, "dx", 20)), dy: lim(ISO.num(o, "dy", 0)), dz: lim(ISO.num(o, "dz", 0)), tox: o.tox, toy: o.toy };
      const s = { amt: st.flow, ph: 0 }, w = ISO.writer();
      let dots = [], table = null, scr = [], len = 0, light = null;
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map((v) => lim(v));
      const build = () => {
        const E = endOf(), Em = E.map((v) => v * 10), S0 = [0, 0, 0];
        const h = unit([Em[0], Em[1], 0]) || [1, 0, 0];
        const aS = unit([h[0] * 0.6, h[1] * 0.6, 0.8]), aE = unit([-h[0] * 0.6, -h[1] * 0.6, 0.8]);
        const pts = curveOf(S0, aS, Em, aE, st.sag); scr = pts.map((p) => K.iso(p, Pm));
        const d = K.pathOf(scr), wpx = G.scaleOf(Pm) * DIA;
        // the dots ride the lead by screen length, so they keep an even spacing however it hangs
        table = [0]; for (let i = 1; i < scr.length; i++) table.push(table[i - 1] + Math.hypot(scr[i][0] - scr[i - 1][0], scr[i][1] - scr[i - 1][1]));
        len = pts.reduce((sum, p, i) => (i ? sum + Math.hypot(...p.map((x, j) => x - pts[i - 1][j])) : 0), 0) + 2 * CLIP;
        const n = ISO.clamp(Math.round(table.at(-1) / Math.max(18, wpx * 7)), 3, 40), r = Math.max(0.8, wpx * 0.32);
        const tint = CIRC.leadTint(st.c);
        g.innerHTML = `<g data-name="wire">${CIRC.tube(d, wpx, CIRC.LEAD[st.c])}</g><g data-part="dots" opacity="0">${Array.from({ length: n }, () => `<circle r="${r.toFixed(2)}" fill="#ffe27a" stroke="#8a5a00" stroke-width="0.5"/>`).join("")}</g>` +
          `<g data-name="clips">${clipSvg(Pm, S0, aS, tint)}${clipSvg(Pm, Em, aE, tint)}</g>` + (lab ? CIRC.word(P, pts[N >> 1].map((v) => v / 10), `${st.c} lead`) : "");
        dots = [...g.querySelectorAll('[data-part="dots"] circle')];
        g.anchors = { end: E };
        light = CIRC.lighter(g);
        move(true);
      };
      const move = (fresh) => {
        const grp = g.querySelector('[data-part="dots"]'), total = table.at(-1), n = dots.length;
        w.attr(grp, "opacity", s.amt.toFixed(2));
        if (s.amt < 0.005 && !fresh) return;
        dots.forEach((c, i) => {
          const at = (((i + s.ph) / n) % 1) * total;
          let j = 1; while (j < table.length - 1 && table[j] < at) j++;
          const f = (at - table[j - 1]) / (table[j] - table[j - 1] || 1), a = scr[j - 1], b = scr[j];
          w.attr(c, "cx", (a[0] + (b[0] - a[0]) * f).toFixed(1)); w.attr(c, "cy", (a[1] + (b[1] - a[1]) * f).toFixed(1));
        });
      };
      g.set = (p) => {
        let again = false;
        if (p.c !== undefined && CIRC.LEAD[p.c] && p.c !== st.c) { st.c = p.c; again = true; }
        if (p.sag !== undefined) { const v = ISO.clamp(+p.sag, 0, 1); if (v !== st.sag) { st.sag = v; again = true; } }
        for (const key of ["dx", "dy", "dz"]) if (p[key] !== undefined && fin(p[key])) { st[key] = lim(+p[key]); again = true; }
        for (const key of ["tox", "toy"]) if (p[key] !== undefined && fin(p[key])) { st[key] = +p[key]; again = true; }
        if (p.flow !== undefined) st.flow = String(p.flow) === "1" ? 1 : 0;
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build();
        light(st.lit);
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.amt = ISO.follow(s.amt, st.flow, dt, 0.35, calm); if (Math.abs(s.amt - st.flow) < 0.004) s.amt = st.flow;
        // the dots speed up and slow down with the flow: about 3 cm a second at full current
        if (!calm) s.ph = (s.ph + dt * s.amt * (30 / Math.max(len, 30)) * dots.length) % dots.length;
        move(false);
        return s.amt !== st.flow;
      };
      g.readout = () => `${st.c} lead · about ${Math.round(len / 10)} cm clip to clip${st.flow ? " · current flowing along it" : ""}`;
      build();
      light(st.lit);
      return g;
    },
  });
})();
