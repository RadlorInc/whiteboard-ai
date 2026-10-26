// "rubberbung cx cy k line=0..60 holes=0|1|2 c=red|black M=0.1..0.4 spin=0|1 cut=0|1 lab=0 lit=bung|line" — a
// PART (PARTS.md, batch 5): a tapered rubber bung, 2.5 cm across the top, 2 cm at the foot, 3 cm tall, with 0–2 bored
// holes (for a delivery tube or a thermometer) and its size moulded on the top. line=0: it stands on its small end,
// its origin the middle of that end (place at= a flask's neck with az= −2: it sits two thirds in). line=10..60: the 20 g
// bung of the circular-motion experiment, tied on a nylon line that many cm long (it carries its own line); its origin is where the line leaves the
// top of the glass tube (place at= the tube's top). spin=1: it goes round in a level circle, the line dipping below
// level by sin θ = m/M (the hanger M kg pulls the line: Mg cos θ = m v²/r), eased up from hanging; shown 4× slower.
// cut=1: the line is cut and the bung flies off along its velocity, falling, not outward; cut=0 ties it again.
// set({ spin, cut, M }). Built in mm; anchors in cm. The whirl follows circular.js, the bung LAB.bung.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RT = 12.5, RF = 10, H = 30, m = 0.02, g0 = 9.81, SLOW = 4;
  const TINT = { red: ISO.tint("#e2735f", ["#9e3324", "#b14231", "#c45541", "#d4664f"], "#4f1409"), black: ISO.T.rubber };
  const geo = (M, L) => { const th = Math.asin(m / M), r = L * Math.cos(th); return { th, r, v: Math.sqrt((M * g0 * Math.cos(th) * r) / m) }; };
  const HOLES = { 0: [], 1: [[0, 0]], 2: [[-4.6, 0], [4.6, 0]] };

  // the bung from its foot at o along unit ax (foot → top): the tapered body, a moulded ring, the top face's holes, the size
  function bungSvg(P, o, ax, tint, holes, words, steps = 28) {
    const F = G.frameAlong(o, ax), out = [ISO.tinted(tint, S(G.solidOf([[0, RF], [H - 2, RT - 0.3], [H - 0.6, RT, 1], [H, RT - 0.8]], F, P, { steps }), { tone: "hi", inner: words ? K.lineSvg(G.arcOf(F, 4, RF + 0.35, P), { tone: "faint" }) : "" }))];
    // the top face's holes (seen when the top faces us) and the moulded size number
    const top = G.pointOf(F, H + 0.05, 0, 0), toward = ax[0] * G.viewOf(P)[0] + ax[1] * G.viewOf(P)[1] + ax[2] * G.viewOf(P)[2];
    if (toward > 0.05) {
      const [u, v] = [F.u, F.v];
      for (const [a, b] of holes) out.push(`<path d="${G.circleOf(G.frameAlong([top[0] + u[0] * a + v[0] * b, top[1] + u[1] * a + v[1] * b, top[2] + u[2] * a + v[2] * b], ax), 0, 3.5, P, 18)}" fill="#1a1010" opacity=".9"/>`);
      if (words && !holes.length) out.push(LAB.faceText(P, [top[0], top[1] + 1.6, top[2]], [1, 0, 0], "21", 5, "#00000055", [0, -1, 0]));
    }
    return out.join("");
  }

  ISO.add({
    name: "rubberbung", title: "Rubber bung (part)", compare: null,
    about: "A tapered rubber bung 2.5 cm across with 0–2 bored holes: standing in a flask's neck (line=0), or the 20 g bung on a line (line= cm) whirled in a level circle (spin=1) that flies off along its velocity when the line is cut (cut=1). anchors: top",
    line: "rubberbung cx cy k line=0..60 holes=0|1|2 c=red|black M=0.1..0.4 spin=0|1 cut=0|1 lab=0 lit=bung|line",
    demo: { line: "rubberbung 480 190 14 line=15 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1 }, hold: 3 }, { set: { M: 0.3, lit: "line" }, hold: 2.5 }, { set: { cut: 1, lit: "bung" }, hold: 3 }, { set: { cut: 0, spin: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const tint = TINT[o.c] || TINT.red, holes = HOLES[o.holes] || (ISO.num(o, "line", 0) > 0 ? HOLES[1] : HOLES[0]), whirl = ISO.num(o, "line", 0) > 0;
      let lit = o.lit || "", lighter = null;
      const light = () => (lighter || (lighter = CIRC.lighter(g)))(lit);
      if (!whirl) {
        g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RF, y: -RF, w: 2 * RF, d: 2 * RF, r: RF }, 0, 2, Pm)}"/><g data-name="bung">${bungSvg(Pm, [0, 0, 0], [0, 0, 1], tint, holes, true)}</g>` + (lab ? CIRC.word(P, [RT / 10, 0, H / 10], "rubber bung") : "");
        g.anchors = { top: [0, 0, H / 10] };
        g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(); } };
        g.update = () => false;
        g.readout = () => `rubber bung · 2.5 cm across the top · ${holes.length ? `${holes.length} hole${holes.length > 1 ? "s" : ""} for glass tubes` : "solid"}`;
        light();
        return g;
      }
      // ── whirled on a line: the state is the hanger M, how far it has wound up from hanging (a 0..1), its angle phi
      const L = ISO.clamp(ISO.num(o, "line", 30), 10, 60);
      const s = { M: ISO.clamp(ISO.num(o, "M", 0.1), 0.1, 0.4), spin: o.spin === "1" ? 1 : 0, a: 0, phi: 0.6, cut: null };
      s.a = s.spin; if (o.cut === "1") s.cut = { p: null, v: null, t: 3 };
      g.innerHTML = `<g data-part="path"></g><g data-part="fly"></g>` + `<g data-name="line" data-part="line"></g><g data-name="bung" data-part="bung"></g><g data-name="line" data-part="line2"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), cache = new Map();
      // where the bung is (cm) and which way it moves; hanging (a 0) the line is straight down, whirling (a 1) it dips θ
      const endOf = (v) => Math.min((1.5 * L) / v, Math.sqrt((2 * L) / (g0 * 100)));
      const at = () => {
        const q = geo(s.M, L / 100), beta = Math.PI / 2 + (q.th - Math.PI / 2) * s.a, R = L * Math.cos(beta), z = -L * Math.sin(beta);
        if (!s.cut) return { p: [Math.cos(s.phi) * R, Math.sin(s.phi) * R, z], vdir: [-Math.sin(s.phi), Math.cos(s.phi), 0], q, R, z };
        // ponytail: the flight stops 1.5 len out or 1 len down (it would land on the floor, which this part does not know)
        const c = s.cut, v = Math.max(q.v * 100 * s.a, 1), tt = Math.min(c.t / SLOW, endOf(v)), d = tt * v, fall = 0.5 * g0 * tt * tt * 100;
        return { p: [c.p[0] + c.v[0] * d, c.p[1] + c.v[1] * d, c.p[2] - fall], vdir: c.v, q, R, z };
      };
      const draw = () => {
        const b = at(), key = b.p.map((v) => v.toFixed(2)).join();
        // the circle it keeps to, ruled faintly in the air (only while it whirls)
        w.rebuild(el.path, s.a > 0.5 && !s.cut ? `${b.R.toFixed(1)} ${b.z.toFixed(1)}` : "", () => {
          if (!(s.a > 0.5 && !s.cut)) return "";
          const pts = []; for (let i = 0; i <= 72; i++) { const u = (i / 72) * 2 * Math.PI; pts.push(K.iso([Math.cos(u) * b.R, Math.sin(u) * b.R, b.z], P)); }
          return `<path d="${K.pathOf(pts, true)}" fill="none" stroke="#9aa0a8" stroke-width="1" stroke-dasharray="4 5"/>`;
        });
        // after a cut: the straight path it leaves along (its velocity at the moment of the cut)
        w.rebuild(el.fly, s.cut ? "cut" : "", () => (s.cut ? `<path d="${K.pathOf([K.iso(s.cut.p, P), K.iso([s.cut.p[0] + s.cut.v[0] * 1.8 * L, s.cut.p[1] + s.cut.v[1] * 1.8 * L, s.cut.p[2]], P)])}" stroke="#2c8a2c" stroke-width="1" stroke-dasharray="3 4" fill="none"/>` : ""));
        const ax = s.cut ? s.cut.v : G.unit3([-b.p[0], -b.p[1], -b.p[2]]), foot = b.p.map((v, i) => v * 10 - ax[i] * H * 0.5);
        // the line runs from the tube to the bung's top: in front of the bung when that top faces us
        const front = !s.cut && G.dot3(ax, G.viewOf(P)) > 0, line = () => `<path d="${K.pathOf([K.iso([0, 0, 0], P), K.iso(foot.map((v, i) => (v + ax[i] * H) / 10), P)])}" stroke="#2a2b2f" stroke-width="0.9" fill="none"/>`;
        w.rebuild(el.line, s.cut || front ? "" : key, () => (s.cut || front ? "" : line()));
        w.rebuild(el.line2, front ? key : "", () => (front ? line() : ""));
        // the bung's shape depends only on its axis: built once per 5° of axis (cached) at the origin, then moved
        const ak = ax.map((v) => Math.round(v * 12)).join(), o0 = K.iso([0, 0, 0], P), pb = K.iso(b.p, P);
        let svg = cache.get(ak);
        if (!svg) { svg = bungSvg(Pm, ax.map((v) => -v * H * 0.5), ax, tint, holes, false, 16); if (cache.size < 400) cache.set(ak, svg); }
        w.rebuild(el.bung, ak, () => `<g>${svg}</g>`);
        const inner = el.bung.firstChild;
        w.attr(inner, "transform", `translate(${(pb[0] - o0[0]).toFixed(2)} ${(pb[1] - o0[1]).toFixed(2)})`);
                if (lab) w.rebuild(el.words, `${!!s.cut} ${s.a > 0.5}`, () => ISO.word(K.iso([0, 0, 4], P), s.cut ? "line cut: it flies off along its velocity" : s.a > 0.5 ? "line pulls it to the centre" : "bung on a line", s.cut ? "#c0392b" : "#555", { size: 14 }));
      };
      g.set = (p) => {
        if (p.M !== undefined && Number.isFinite(+p.M)) s.M = ISO.clamp(+p.M, 0.1, 0.4);
        if (p.spin !== undefined) { s.spin = String(p.spin) === "1" ? 1 : 0; if (s.spin && s.cut) s.cut = null; }
        if (p.cut !== undefined) {
          if (String(p.cut) === "1" && !s.cut) { const b = at(); s.cut = { p: b.p, v: b.vdir, t: 0 }; }
          if (String(p.cut) !== "1") s.cut = null;
        }
        if (p.lit !== undefined) lit = p.lit;
        draw(); light();
      };
      g.update = (dt) => {
        const calm = ISO.still(), q = geo(s.M, L / 100);
        if (s.cut) { if (!s.cut.p) { const b = at(); s.cut.p = b.p; s.cut.v = b.vdir; } s.cut.t += calm ? 3 : dt; }
        else {
          s.a = ISO.follow(s.a, s.spin, dt, 0.7, calm); if (Math.abs(s.a - s.spin) < 0.003) s.a = s.spin;
          if (!calm) s.phi += ((q.v / q.r) * dt * s.a) / SLOW;
        }
        draw();
        return s.cut ? s.cut.t / SLOW < endOf(Math.max(q.v * 100 * s.a, 1)) : s.a > 0 || s.a !== s.spin;
      };
      g.readout = () => {
        const q = geo(s.M, L / 100);
        if (s.cut) return `line cut: no force to the centre, so the bung carries straight on at ${(q.v * s.a).toFixed(1)} m/s along the way it was moving (and falls)`;
        if (s.a < 0.5) return `20 g bung hanging on a ${L} cm line`;
        return `hanger ${(s.M * 1000).toFixed(0)} g pulls the line: Mg = ${(s.M * g0).toFixed(2)} N · line ${((q.th * 180) / Math.PI).toFixed(0)}° below level · v = ${q.v.toFixed(1)} m/s, one turn in ${((2 * Math.PI * q.r) / q.v).toFixed(2)} s (shown 4× slower)`;
      };
      draw(); light();
      return g;
    },
  });
})();
