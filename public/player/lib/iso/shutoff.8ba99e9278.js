// "shutoff cx cy height k=open|closed lab=1 lit=valve|handle|hose|tap" — the water shutoff valve under a sink.
// The cold supply comes out of the wall as a copper stub through a chrome escutcheon into a quarter-turn angle stop: a
// brass body with a ball inside, its oval lever, the compression nut on the pipe and the outlet up to the braided hose,
// which climbs to the tap's tail under the counter. The lever in line with the outlet means the hole through the ball
// lines up with the flow: open, and the tap runs (about 6 litres a minute). A quarter turn clockwise turns the ball's
// hole across the flow: closed, and the tap stops. set({ k }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const WY = -20, C = [0, -8, 8], TOPZ = 26, SINK = { x: -26, y: -20, w: 52, d: 30, r: 2 };
  const CHROME = ISO.tint("#eef0f2", ["#9ea4ab", "#b1b7bd", "#c4c9ce", "#d6dadd"], "#4a5058"), BRASS = ISO.T.brass, COPPER = ISO.T.copper;
  const WALL = ISO.tint("#f1efe9", ["#c9c6be", "#d3d0c8", "#dddad2", "#e7e4dc"], "#7a776f"), WOOD = ISO.T.wood;
  const fa = (o, a) => G.frameAlong(o, a), hex = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * r, Math.sin(i * 1.047) * r]);

  function staticSvg(P) {
    const out = [ISO.tinted(WALL, ISO.wbox(P, [-16, 16], [WY - 1.4, WY], [0, TOPZ + 18], "hi"))];
    // cabinet floor, the counter with the sink cut out of it
    // supply: escutcheon, copper stub, the valve body round its ball, compression nut, inlet, outlet and its nut
    out.push(ISO.tinted(CHROME, S(G.disc(0, 0.6, 3.4, fa([0, WY, C[2]], [0, 1, 0]), P), { tone: "hi" })));
    out.push(ISO.tinted(COPPER, S(G.disc(0.6, 8.6, 0.95, fa([0, WY, C[2]], [0, 1, 0]), P, { steps: 20 }), { tone: "hi", inner: L(G.arcOf(fa([0, WY, C[2]], [0, 1, 0]), 4, 0.95, P), { tone: "faint" }) })));
    out.push(ISO.tinted(BRASS, S(G.prismOf(fa([0, WY + 8.6, C[2]], [0, 1, 0]), hex(1.9), 0, 1.6, P), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.disc(1.6, 3.2, 1.6, fa([0, WY + 8.6, C[2]], [0, 1, 0]), P), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.sphereOf(C, 2.4, P), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.disc(1.6, 4.2, 1.5, fa(C, [0, 0, 1]), P), { tone: "hi" }) + S(G.prismOf(fa([C[0], C[1], C[2] + 4.2], [0, 0, 1]), hex(1.5), 0, 1.4, P), { tone: "hi" })));
    // the braided hose up to the tap's tail under the counter, and the tail's nut
    return out.join("");
  }
  function counterSvg(P) {
    const out = [ISO.tinted(WOOD, ISO.wbox(P, [-16, 16], [WY, 6], [TOPZ, TOPZ + 3], "hi"))];
    out.push(`<path d="${K.pathOf(G.arcPoints(G.frameOf([0, -2, TOPZ + 3.01], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, 7, 0, Math.PI * 2, 40).map((p) => K.iso([p[0], p[1] * 0.75 - 0.5, p[2]], P)), true)}" fill="#c9cdd2" stroke="#4a5058" stroke-width="0.7"/>`);
    // the tap: its base and body on the counter, the spout reaching over the sink, the lever on top
    const base = [0, -13, TOPZ + 3];
    out.push(ISO.tinted(CHROME, S(G.disc(0, 1, 2.6, fa(base, [0, 0, 1]), P), { tone: "hi" }) + S(G.disc(1, 9, 1.6, fa(base, [0, 0, 1]), P), { tone: "hi" })));
    const sp0 = [0, -13, TOPZ + 10], sp1 = [0, -4, TOPZ + 12], sp2 = [0, -2, TOPZ + 9];
    out.push(ISO.tinted(CHROME, S(G.sphereOf(sp0, 1.3, P), { tone: "hi" }) + S(G.disc(0, G.len3(G.sub3(sp1, sp0)), 1.1, fa(sp0, G.unit3(G.sub3(sp1, sp0))), P, { steps: 18 }), { tone: "hi" }) +
      S(G.sphereOf(sp1, 1.1, P), { tone: "hi" }) + S(G.disc(0, G.len3(G.sub3(sp2, sp1)), 1.1, fa(sp1, G.unit3(G.sub3(sp2, sp1))), P, { steps: 18 }), { tone: "hi" }) + S(G.disc(0, 0.8, 1.25, fa(sp2, [0, 0, -1]), P), { tone: "mid" })));
    out.push(ISO.tinted(CHROME, ISO.box((u, w, y) => [w, -13 - u * 0.4 + y, TOPZ + 12 + u * 0.4], P, [0, 5], [-0.5, 0.5], [-0.6, 0.6], "hi")));
    return out.join("");
  }
  function hoseSvg(P) {
    const a = [C[0], C[1], C[2] + 5.6], b = [0, -13, TOPZ - 2];
    const pts = [a, [0, -8, 18], [0, -13, 18], b].map((p) => K.iso(p, P)), d = `M${pts[0][0]} ${pts[0][1]} C${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]} ${pts[3][0]} ${pts[3][1]}`;
    const w = 1.8 * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="#5b6168" stroke-width="${(w + 1).toFixed(1)}" stroke-linecap="butt"/><path d="${d}" fill="none" stroke="#d3d7db" stroke-width="${w.toFixed(1)}"/>` +
      `<path d="${d}" fill="none" stroke="#8d939a" stroke-width="${w.toFixed(1)}" stroke-dasharray="0.7 1.4" opacity=".8"/>` +
      ISO.tinted(CHROME, S(G.prismOf(fa(b, [0, 0, 1]), hex(1.4), 0, 2, P), { tone: "hi" }));
  }
  // The oval lever on the stem in front of the body, at a quarter turn q (0 open: in line with the outlet; 1 closed).
  function handleSvg(P, q) {
    const a = (q * Math.PI) / 2, dir = [-Math.sin(a), 0, Math.cos(a)], side = [Math.cos(a), 0, Math.sin(a)], y0 = C[1] + 2.6;
    const out = [ISO.tinted(CHROME, S(G.disc(2.2, 2.9, 0.7, fa(C, [0, 1, 0]), P), { tone: "mid" }))];
    const at = (u, w, y) => [C[0] + dir[0] * u + side[0] * w, y0 + y, C[2] + dir[2] * u + side[2] * w];
    const V = [[-1.4, -1.1, 0], [4.8, -0.9, 0], [4.8, 0.9, 0], [-1.4, 1.1, 0], [-1.4, -1.1, 0.8], [4.8, -0.9, 0.8], [4.8, 0.9, 0.8], [-1.4, 1.1, 0.8]].map(([u, w, y]) => at(u, w, y));
    out.push(`<g data-name="handle">${ISO.tinted(ISO.tint("#f2b1a8", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a"), ISO.poly(V, ISO.BOX_F, P, "hi"))}</g>`);
    out.push(D([K.iso([C[0], y0 + 0.81, C[2]], P)], { size: 0.6, tone: "hi" }));
    return out.join("");
  }
  // The tap's stream: a column from the aerator into the sink, as wide as the flow.
  function streamSvg(P, f) {
    if (f < 0.02) return "";
    const top = K.iso([0, -2, TOPZ + 8.2], P), bot = K.iso([0, -2, TOPZ + 3], P), w = 1.6 * G.scaleOf(P) * Math.sqrt(f);
    return `<path d="M${(top[0] - w / 2).toFixed(1)} ${top[1].toFixed(1)} L${(top[0] + w / 2).toFixed(1)} ${top[1].toFixed(1)} L${(bot[0] + w * 0.4).toFixed(1)} ${bot[1].toFixed(1)} L${(bot[0] - w * 0.4).toFixed(1)} ${bot[1].toFixed(1)} Z" fill="#9cc6ee" fill-opacity=".8" stroke="#4d7fb0" stroke-width="0.5"/>`;
  }

  ISO.add({
    name: "shutoff", title: "Shutoff valve", compare: "shutoff 480 270 300",
    about: "The quarter-turn shutoff valve under a sink: lever in line with the pipe is open and the tap runs; a quarter turn clockwise closes it and the tap stops.",
    line: "shutoff cx cy height k=open|closed lab=1 lit=valve|handle|hose|tap",
    demo: { line: "shutoff 480 270 300", script: [{ set: {}, hold: 1.4 }, { set: { k: "closed" }, hold: "settle" }, { set: { k: "open" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.4, H = size * 1.55;
      const { P, g } = ISO.frame([[-16, WY - 1.4, 0], [16, 6, 0], [-16, WY, TOPZ + 18], [16, 6, TOPZ + 3], [0, 0, TOPZ + 14]], cx, cy, W, H, { azimuth: 58, elevation: 18 }, parent);
      g.innerHTML = `<g data-name="valve">${staticSvg(P)}</g><g data-name="hose">${hoseSvg(P)}</g><g data-k="handle"></g><g data-name="tap">${counterSvg(P)}</g><g data-part="stream"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"],[data-k="${n}"]`), el = { valve: q("valve"), hose: q("hose"), handle: q("handle"), tap: q("tap"), stream: q("stream"), words: q("words") }, w = ISO.writer();
      const s = { q: o.k === "closed" ? 1 : 0 }, goal = { q: s.q };
      let lit = o.lit || "";
      const flow = () => Math.max(0, Math.cos((s.q * Math.PI) / 2) ** 2 * 1.15 - 0.15);
      const draw = () => {
        w.rebuild(el.handle, s.q.toFixed(3), () => handleSvg(P, s.q));
        w.rebuild(el.stream, flow().toFixed(2), () => streamSvg(P, flow()));
        w.rebuild(el.words, lab ? `${s.q > 0.5} ${flow() > 0.05}` : "", () => !lab ? "" : [
          ISO.word(K.iso([3, C[1] + 3, C[2] + 3], P), s.q > 0.5 ? "closed: lever across" : "open: lever in line", s.q > 0.5 ? "#c0392b" : "#2c6a22", { anchor: "start", size: 15, dy: 0 }),
          ISO.word(K.iso([0, WY + 4, C[2] - 3], P), "shutoff valve", "#444", { anchor: "end", size: 14, dy: 22 }),
          ISO.word(K.iso([0, -11, 19], P), "braided hose", "#444", { anchor: "end", size: 14, dy: 0 }),
          ISO.word(K.iso([0, -2, TOPZ + 12], P), flow() > 0.05 ? "tap running" : "tap stopped", "#444", { anchor: "start", size: 14, dy: -6 }).replace('x="', 'dx="14" x="')].join(""));
        const want = lit || (s.q !== goal.q ? "handle" : flow() > 0.05 ? "" : "handle");
        w.light([el.valve, el.hose, el.handle, el.tap], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.k) goal.q = p.k === "closed" ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const st = 1.4 * dt;      // a hand turns it a quarter in about 0.7 s
        s.q = ISO.still() || Math.abs(goal.q - s.q) <= st ? goal.q : s.q + Math.sign(goal.q - s.q) * st;
        draw();
        return s.q !== goal.q;
      };
      g.readout = () => {
        if (s.q <= 0) return "open · the ball's hole lines up with the pipe · the tap runs, about 6 L a minute";
        if (s.q >= 1) return "closed · a quarter turn clockwise put the ball's hole across the flow · no water to the tap";
        return `turning · ${Math.round(s.q * 90)}° of the quarter turn · flow ${Math.round(flow() * 100)} %`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
