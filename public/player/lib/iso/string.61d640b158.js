// "string cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 sag=0..1 kind=nylon|thread|cotton knots=0|1 lab=0 lit=line|knots"
// — a PART (PARTS.md, batch 5): a length of line between two points, its origin the start point. kind=nylon: 1 mm
// clear-white fishing line (the whirling bung, the pulley, the ramp's winch); thread: 0.6 mm black thread (a cradle's
// threads, a pendulum); cotton: 1.6 mm twisted cotton string, its twist drawn along it. The end: to=<id>.<anchor> (the
// player passes tox= toy=, the end at height dz, as wirelead) or dx dy dz cm from the start. sag=0: pulled taut, a
// straight line; up to 1: slack, hanging in a curve that dips about a third of its span. knots=1: a knot at each end
// with its short cut tail. set({ dx, dy, dz, tox, toy, sag }) moves the end and the slack, eased, so a line goes taut,
// winds in (the end comes closer) or is drawn aside. (A swinging pendulum's line is steelball line=, which swings with
// its ball.) World: 1 = 1 cm.
(() => {
  const K = window.K, N = 40;
  const KIND = {
    nylon: { r: 0.05, ink: "#8a9199", body: "#f1f4f7", shine: "#ffffff", name: "nylon line" },
    thread: { r: 0.03, ink: "#121315", body: "#3a3d42", shine: "#6c7178", name: "black thread" },
    cotton: { r: 0.08, ink: "#7d6a43", body: "#eadfc3", shine: "#fbf6e8", name: "cotton string" },
  };
  const lim = (v) => ISO.clamp(v, -500, 500), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);

  // the line's centre line: straight from a to b, sagging (down −z) by sag × a third of its span, deepest in the middle
  function curveOf(a, b, sag) {
    const span = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), drop = sag * span * 0.32, pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - drop * 4 * t * (1 - t)]); }
    return pts;
  }
  const lenOf = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) : 0), 0);

  ISO.add({
    name: "string", title: "String / line (part)", compare: null,
    about: "A length of nylon line, black thread or cotton string from its start to to=<id>.<anchor> (or dx dy dz cm): taut and straight at sag=0, hanging slack up to sag=1, a knot and cut tail at each end; set the end or the sag and it moves there, eased. anchors: end",
    line: "string cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 sag=0..1 kind=nylon|thread|cotton knots=0|1 lab=0 lit=line|knots",
    demo: { line: "string 300 200 24 dx=16 dy=-4 dz=-6 sag=0.6 kind=cotton lab=1", script: [{ set: {}, hold: 1 }, { set: { sag: 0, lit: "line" }, hold: "settle" }, { set: { dx: 9, dz: -12, lit: "knots" }, hold: "settle" }, { set: { kind: "nylon", sag: 0.4, dx: 16, dz: -6, lit: "" }, hold: "settle" }, { set: { kind: "thread", knots: 0 }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { kind: KIND[o.kind] ? o.kind : "nylon", knots: o.knots !== "0", sag: ISO.clamp(ISO.num(o, "sag", 0.3), 0, 1), dx: lim(ISO.num(o, "dx", 20)), dy: lim(ISO.num(o, "dy", 0)), dz: lim(ISO.num(o, "dz", 0)), tox: o.tox, toy: o.toy, lit: o.lit || "" };
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map(lim);
      const s = { e: endOf(), sag: st.sag };
      g.innerHTML = `<g data-part="line" data-name="line"></g><g data-part="knots" data-name="knots"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      let len = 0;
      const draw = () => {
        const E = s.e.map((v) => Math.round(v * 100) / 100), sag = Math.round(s.sag * 1000) / 1000, kd = KIND[st.kind], key = `${st.kind} ${E} ${sag}`;
        const pts = curveOf([0, 0, 0], E, sag);
        len = lenOf(pts);
        w.rebuild(el.line, key, () => {
          const d = PHYS.path(P, pts), wpx = kd.r * 2 * K.screenRise(1, P);
          // cotton: its twist, short dark slants along it (a dash pattern sized to the line's width)
          return PHYS.wire(P, d, kd.r, kd) + (st.kind === "cotton" && wpx > 1.2 ? `<path d="${d}" fill="none" stroke="${kd.ink}" stroke-opacity=".55" stroke-width="${(wpx * 0.8).toFixed(2)}" stroke-dasharray="${(wpx * 0.35).toFixed(2)} ${(wpx * 0.9).toFixed(2)}"/>` : "");
        });
        w.rebuild(el.knots, st.knots ? `${key} k` : "", () => {
          if (!st.knots) return "";
          // a knot: a small lump where the line is tied, and its cut tail, a short end hanging off it
          const knot = (p, toward) => {
            const u = toward.map((v, i) => v - p[i]), l = Math.hypot(...u) || 1, tail = [p, [p[0] - (u[0] / l) * 0.25, p[1] - (u[1] / l) * 0.25 + 0.15, p[2] - 0.55]];
            return PHYS.wire(P, PHYS.path(P, tail), kd.r * 0.9, kd) + K.solidSvg(window.G.sphereOf(p, kd.r * 2.4, P), { tone: "mid" });
          };
          return `<g style="${ISO.tint(kd.body, [kd.ink, kd.ink, kd.body, kd.body], kd.ink)}">${knot(pts[0], pts[2])}${knot(pts[N], pts[N - 2])}</g>`;
        });
        g.anchors = { end: endOf() };
        if (lab) w.rebuild(el.words, key, () => CIRC.word(P, pts[N >> 1], kd.name));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.kind !== undefined && KIND[p.kind]) st.kind = p.kind;
        if (p.knots !== undefined) st.knots = String(p.knots) !== "0";
        if (fin(p.sag)) st.sag = ISO.clamp(+p.sag, 0, 1);
        for (const key of ["dx", "dy", "dz"]) if (fin(p[key])) st[key] = lim(+p[key]);
        for (const key of ["tox", "toy"]) if (fin(p[key])) st[key] = +p[key];
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1, E = endOf();
        s.e = s.e.map((v, i) => ISO.follow(v, E[i], dt, 0.35, calm));
        s.sag = ISO.follow(s.sag, st.sag, dt, 0.3, calm);
        draw();
        return s.e.some((v, i) => v !== E[i]) || s.sag !== st.sag;
      };
      g.readout = () => `${KIND[st.kind].name}, ${(KIND[st.kind].r * 20).toFixed(1)} mm · ${len.toFixed(1)} cm from end to end · ${s.sag < 0.02 ? "taut" : "slack"}`;
      draw();
      return g;
    },
  });
})();
