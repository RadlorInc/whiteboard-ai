// "tiregauge cx cy size psi=0-60 on=0|1 lab=1 lit=gauge|bar|stem|piston" — a pencil tyre gauge on a valve stem.
// The top of a wheel, cut away: tyre and steel rim with the rubber valve stem standing out of the rim. The gauge is a
// chrome tube with an angled chuck at one end and a pocket clip; a window in the tube shows what is inside: a piston
// and a spring. Pressed onto the stem, the tyre's air pushes the piston against the spring, and the piston pushes the
// white bar out of the far end; 1 psi moves it 1.1 mm. Lifted off, the spring takes the piston back, but the bar
// stays out by friction: that is the reading, written below it. set({ on, psi, reset }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 31.6, RIM = 19.5, Y0 = 9, STEM = [-6.6, 0, Math.sqrt(17.4 ** 2 - 6.6 ** 2)], HEAD = [STEM[0], 13.1, STEM[2]], TUBE = [STEM[0] + 1.6, 13.4], ROD_R = 0.42, PER = 0.11;
  const ARC = [0.76, 2.02], WIN = [STEM[0] + 3.4, STEM[0] + 9.4], SPRING_END = STEM[0] + 9.2, LIFT = 2.6;
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, BRASS = ISO.T.brass;
  const BAR = ISO.tint("#fbfbf7", ["#d3d3cc", "#dcdcd5", "#e6e6df", "#efefe9"], "#6d6d64");
  const xAxis = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAxis = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  let uid = 0;

  // A slice of the wheel's top, cut on two radii as a display piece: tyre (tread blocks, sidewall rings, the hollow
  // rim's flange and well, and the valve stem through the rim.
  function wheelSvg(P, lab) {
    const [a0, a1] = ARC, view = G.viewOf(P), out = [];
    const sector = (r0, r1, n = 40) => [...ISO.arc(0, 0, r1, a0, a1, n), ...ISO.arc(0, 0, r0, a1, a0, n)];
    const blocks = [];
    for (let i = 0; i <= 18; i++) {
      const a = a0 + ((a1 - a0) * i) / 18, n = [Math.cos(a), 0, Math.sin(a)];
      if (n[0] * view[0] + n[2] * view[2] > 0.05) blocks.push(K.pathOf([K.iso([Math.cos(a) * R, 10, Math.sin(a) * R], P), K.iso([Math.cos(a) * R, -10, Math.sin(a) * R], P)]));
    }
    const rings = [27.5, 26.3].map((r) => `<path d="${K.pathOf(ISO.arc(0, 0, r, a0, a1, 40).map(([x, z]) => K.iso([x, 10.05, z], P)))}" fill="none" stroke="#2b2c30" stroke-width="0.6"/>`).join("");
    out.push(ISO.prismY(P, sector(RIM, R, 48), -10, 10, ["#202125", "#55575c"], "#4a4c51", "#121214", `<path d="${blocks.join("")}" stroke="#25272b" stroke-width="0.6" fill="none"/>` + rings));
    // rim: the well (a band under the tyre's beads) and the outer flange you see, with the stem hole's boss
    out.push(ISO.prismY(P, sector(RIM - 3.2, RIM - 1.6, 40), -8.6, 8.6, ["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"));
    out.push(ISO.prismY(P, sector(RIM - 1.6, RIM + 0.6, 40), 7.2, Y0, ["#8d9096", "#e4e5e7"], "#d9dadd", "#3c3f45"));
    out.push(ISO.prismY(P, sector(13, RIM - 3.2, 40), 5.6, 7.2, ["#8d9096", "#d9dadd"], "#cfd1d4", "#3c3f45"));
    const F = yAxis(STEM);
    out.push(ISO.tinted(STEEL, S(G.disc(7.2, Y0, 1.5, F, P), { tone: "mid" })));
    out.push(ISO.tinted(RUBBER, S(G.solidOf([[Y0, 1.05], [Y0 + 0.6, 1.05], [Y0 + 0.9, 0.8, 1], [11.4, 0.66]], F, P), { tone: "hi" })));
    out.push(ISO.tinted(BRASS, S(G.disc(11.4, 12.5, 0.42, F, P), { tone: "hi", inner: L([11.7, 11.95, 12.2].map((s) => G.arcOf(F, s, 0.42, P)).join(""), { tone: "lo" }) })));
    if (lab) out.push(ISO.word(K.iso([STEM[0] - 1.6, Y0 + 1, STEM[2] - 0.5], P), "valve stem", "#444", { anchor: "end", size: 15, dy: 8 }));
    return out.join("");
  }
  // The gauge body: chuck down onto the stem, head, chrome tube with its window and clip, end cap with the bar's hole.
  function bodySvg(P) {
    const out = [], Fc = yAxis([HEAD[0], HEAD[1], HEAD[2]]);
    out.push(S(G.solidOf([[-1.5, 0.95], [-1.2, 1.1], [0.6, 1.1], [0.9, 0.9]], Fc, P), { tone: "hi" }));
    out.push(ISO.tinted(RUBBER, S(G.disc(-1.75, -1.5, 0.8, Fc, P), { tone: "hi" })));
    const Ft = xAxis([0, TUBE[1], HEAD[2]]), Fh = xAxis([STEM[0], TUBE[1], HEAD[2]]);
    out.push(S(G.solidOf([[-1, 1.2, 1], [-0.4, 1.35, 1], [0.6, 1.3, 1], [1.6, 0.95]], Fh, P), { tone: "hi" }));
    out.push(S(G.disc(TUBE[0], TUBE[1], 0.85, Ft, P), { tone: "hi", inner: L(G.arcOf(Ft, STEM[0] + 2.4, 0.85, P), { tone: "faint" }) }));
    out.push(S(G.disc(TUBE[1], TUBE[1] + 0.5, 0.95, Ft, P), { tone: "mid" }), `<path d="${G.circleOf(Ft, TUBE[1] + 0.5, ROD_R + 0.12, P)}" fill="#2f3338"/>`);
    // pocket clip: a strip standing on the tube's top, from a collar ring toward the end
    out.push(S(G.disc(STEM[0] + 10.6, STEM[0] + 11.4, 0.98, Ft, P), { tone: "mid" }), ISO.wbox(P, [STEM[0] + 5.2, STEM[0] + 11], [TUBE[1] - 0.35, TUBE[1] + 0.35], [HEAD[2] + 0.98, HEAD[2] + 1.3], "mid"));
    return out.join("");
  }
  // The window: a slot cut in the tube's near side, the piston at x and the spring from it to the end stop, clipped.
  function windowSvg(P, x, id) {
    const Ft = xAxis([0, TUBE[1], HEAD[2]]), mid = G.angleToward(Ft, G.viewOf(P));
    const slot = [...Array.from({ length: 9 }, (_, i) => G.pointOf(Ft, WIN[0], 0.86, mid - 0.9 + (i * 1.8) / 8)), ...Array.from({ length: 9 }, (_, i) => G.pointOf(Ft, WIN[1], 0.86, mid + 0.9 - (i * 1.8) / 8))].map((p) => K.iso(p, P));
    const d = K.pathOf(slot, true), c = K.coil(x + 0.4, SPRING_END, [TUBE[1], HEAD[2]], 0.55, 7, "x", P);
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#3a3e44"/><g clip-path="url(#${id})">` +
      `<path d="${c.back}" fill="none" stroke="#7d8189" stroke-width="0.7"/>` + S(G.disc(x - 0.4, x + 0.4, 0.72, xAxis([0, TUBE[1], HEAD[2]]), P), { tone: "hi" }) +
      S(G.disc(x + 0.4, TUBE[1] + 1, ROD_R * 0.6, xAxis([0, TUBE[1], HEAD[2]]), P), { tone: "mid" }) + `<path d="${c.front}" fill="none" stroke="#e8e9eb" stroke-width="0.8"/></g>` +
      `<path d="${d}" fill="none" stroke="#1b1d20" stroke-width="0.7"/>`;
  }

  ISO.add({
    name: "tiregauge", title: "Pencil tyre gauge", compare: "tiregauge 480 260 300 psi=32",
    about: "A pencil gauge on a valve stem: the air pushes a piston against a spring and the piston pushes the marked bar out; the bar stays out to show the reading.",
    line: "tiregauge cx cy size psi=0-60 on=0|1 lab=1 lit=gauge|bar|stem|piston",
    demo: { line: "tiregauge 480 260 300 psi=32 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0 }, hold: "settle" }, { set: { reset: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 2.6, BH = size * 1.45;
      const { P, g } = ISO.frame([...ARC.flatMap((a) => [[Math.cos(a) * R, -10, Math.sin(a) * R], [Math.cos(a) * R, 10, Math.sin(a) * R], [Math.cos(a) * 13, 10, Math.sin(a) * 13]]), [0, 10, R + 1], [TUBE[1] + 7, TUBE[1], HEAD[2] + 2], [TUBE[1] + 7, TUBE[1], HEAD[2] - 4]], cx, cy, BW, BH, { azimuth: 76, elevation: 20 }, parent);
      const id = `tg${++uid}`, Ft = xAxis([0, TUBE[1], HEAD[2]]);
      const ROD = G.rodOut(Ft, TUBE[1] + 0.5, TUBE[1] + 0.9, ROD_R, P, { stroke: 60 * PER, smooth: false });
      const marks = [];
      for (let p = 0; p <= 60; p += 2) marks.push(G.arcOf(Ft, TUBE[1] + 0.8 - p * PER, ROD_R, P));
      const major = [];
      for (let p = 10; p <= 60; p += 10) major.push(G.arcOf(Ft, TUBE[1] + 0.8 - p * PER, ROD_R, P));
      g.innerHTML = `<g data-name="stem">${wheelSvg(P, lab)}</g><g data-part="lift"><g data-name="bar" style="${BAR}"><clipPath id="${id}r"><path data-hold d="${ROD.clip}"/></clipPath>` +
        `<g clip-path="url(#${id}r)">${S(ROD.paths, { tone: "hi", inner: L(marks.join(""), { tone: "lo" }) + `<path class="iso-line" data-tone="hi" style="stroke-width:1.1" d="${major.join("")}"/>` })}</g></g>` +
        `<g data-name="gauge" style="${STEEL}">${bodySvg(P)}</g><g data-name="piston" style="${STEEL}"></g></g><g data-part="words"></g>`;
      const q = (s) => g.querySelector(`[data-name="${s}"],[data-part="${s}"]`), el = { stem: q("stem"), bar: q("bar"), gauge: q("gauge"), piston: q("piston"), lift: q("lift"), words: q("words") }, w = ISO.writer();
      const on0 = o.on === "1";
      const s = { psi: ISO.clamp(ISO.num(o, "psi", 32), 0, 60), on: on0 ? 1 : 0, piston: on0 ? 1 : 0, bar: on0 ? 1 : 0 };
      const goal = { on: s.on };
      let lit = o.lit || "";
      const sx = (d) => { const a = K.iso([0, 0, 0], P), b = K.iso([d, 0, 0], P); return [b[0] - a[0], b[1] - a[1]]; };
      const draw = () => {
        w.attr(el.lift, "transform", K.translateAlong(P, [0, LIFT * (1 - s.on), 0]));
        const out = s.bar * s.psi * PER, [dx, dy] = sx(out);
        w.attr(el.bar, "transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`); K.holdStill(el.bar, [dx, dy]);
        const px = WIN[0] + 0.6 + s.piston * s.psi * PER;
        w.rebuild(el.piston, px.toFixed(3), () => windowSvg(P, px, id));
        w.rebuild(el.words, lab ? `${out.toFixed(2)} ${s.on.toFixed(2)}` : "", () => {
          if (!lab) return "";
          const lift = LIFT * (1 - s.on), tip = [TUBE[1] + 0.9 + out, TUBE[1] + lift, HEAD[2]];
          return [s.bar > 0.05 ? ISO.word(K.iso(tip, P), `${Math.round(s.psi * s.bar)} psi`, "#c0392b", { size: 17, dy: 24 }) : "",
            ISO.word(K.iso([(WIN[0] + WIN[1]) / 2, TUBE[1] + lift, HEAD[2] + 1.4], P), "piston and spring", "#555", { size: 13, dy: -6 }),
            ISO.word(K.iso([TUBE[1] + 2, TUBE[1] + lift, HEAD[2] + 1.6], P), "bar", "#555", { anchor: "start", size: 13, dy: -6 })].join("");
        });
        const parts = [el.stem, el.bar, el.gauge, el.piston];
        const want = lit ? q(lit) : s.on > 0.5 && s.piston < 0.99 ? el.piston : s.bar > 0.05 ? el.bar : el.gauge;
        w.light(parts, want ? [want] : []);
      };
      g.set = (p) => {
        if (p.on !== undefined) goal.on = +p.on ? 1 : 0;
        if (p.psi !== undefined) s.psi = ISO.clamp(+p.psi, 0, 60);
        if (p.reset) goal.reset = true;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.on = ISO.follow(s.on, goal.on, dt, 0.25, calm);
        if (Math.abs(s.on - goal.on) < 2e-3) s.on = goal.on;
        // seated on the stem, the air shoots the piston out (it carries the bar); off it, only the piston springs back
        const seated = s.on > 0.98;
        s.piston = ISO.follow(s.piston, seated ? 1 : 0, dt, seated ? 0.12 : 0.08, calm);
        if (Math.abs(s.piston - (seated ? 1 : 0)) < 2e-3) s.piston = seated ? 1 : 0;
        if (goal.reset && s.on === 0) { s.bar = ISO.follow(s.bar, 0, dt, 0.25, calm); if (s.bar < 2e-3) { s.bar = 0; goal.reset = false; } }
        else s.bar = Math.max(s.bar, s.piston);
        draw();
        return s.on !== goal.on || s.piston !== (seated ? 1 : 0) || !!goal.reset;
      };
      g.readout = () => {
        const mm = (s.psi * PER * 10).toFixed(0);
        if (s.on > 0.5) return `on the valve · ${s.psi} psi pushes the piston ${mm} mm against the spring · the bar comes out with it`;
        if (s.bar > 0.05) return `off the valve · the spring took the piston back, the bar stayed out: reads ${Math.round(s.psi * s.bar)} psi`;
        return "bar pushed back in · press the chuck straight onto the valve stem";
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
