// "windlass cx cy k turns=0..6 rope=0..120 lab=0 lit=frame|drum|wheel|handle|rope" — a PART (PARTS.md, batch 5): the
// wheel and axle of wheelaxle.js, as it stands over a well. Two oak posts on chamfered sills with raking struts, a beam
// across their tops, bearing blocks with brass bushes at axle height (44 cm); a steel axle carries a 6 cm staved drum
// with iron bands between the posts and, outside the +x post, a 26 cm steel handwheel (six spokes, hub) with a crank
// handle on its rim. R/r = 13/3: an effort on the handle lifts 4.3 times as much on the rope. The rope is wound on the
// drum and hangs `rope` cm from its front (+y) side to a hook; turns winds it in (2πr = 18.8 cm per turn, eased) and
// the wheel, the staves and the handle turn with it. 60 × 30 × 60 cm; origin the ground under the middle.
// anchors: hook (the rope's hook, where it is when built) drum handle top. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const AZ = 44, R = 13, r = 3, WX = 26.5, PX = 20, DR = [-15, 15], ROPE_D = 0.9, X0 = -13.5;
  const OAK = ISO.tint("#f2dfc0", ["#c39861", "#cfa874", "#dab98b", "#e5c9a1"], "#6a4618");
  const IRON = ISO.tint("#9a9da3", ["#4d5056", "#5b5e64", "#6a6d73", "#7a7d83"], "#1f2124");
  const X = (o) => window.B29.X(o);
  // one post: sill (chamfered ends, seen from +x), two raking struts, the post, its bearing block and brass bush
  function postSvg(P, x) {
    const out = [ISO.prismX(P, [[-15, 0], [15, 0], [15, 2.4], [12.5, 4], [-12.5, 4], [-15, 2.4]], x - 3.5, x + 3.5, ["#c39861", "#e5c9a1"], "#f2dfc0", "#6a4618")];
    out.push(ISO.prismX(P, [[-12, 4], [-8.5, 4], [-2.5, 20], [-2.5, 24]], x - 1.5, x + 1.5, ["#c39861", "#e5c9a1"], "#f2dfc0", "#6a4618"));
    out.push(ISO.wbox(P, [x - 2.5, x + 2.5], [-2.5, 2.5], [4, 54], "mid"));
    out.push(ISO.prismX(P, [[12, 4], [2.5, 24], [2.5, 20], [8.5, 4]], x - 1.5, x + 1.5, ["#c39861", "#e5c9a1"], "#f2dfc0", "#6a4618"));
    out.push(L([[-1.2, 2.5], [1.1, 2.5]].map(([dx, y]) => K.segment([x + dx, y, 4], [x + dx, y, 54], P)).join(""), { tone: "faint", free: true }));
    out.push(ISO.wbox(P, [x - 3, x + 3], [-3.5, 3.5], [AZ - 4, AZ + 4], "mid"), D([[x - 2, AZ + 2.6], [x + 2, AZ - 2.6]].map(([a, c]) => K.iso([a, 3.51, c], P)), { size: 0.5 }));
    out.push(ISO.tinted(ISO.T.brass, S(G.ringBand(x + 3, x + 3.3, 1.25, 2, X([0, 0, AZ]), P), { tone: "hi" })));
    return ISO.tinted(OAK, out.join(""));
  }
  // the drum body, its iron end bands (static), and the staves (lines along it between the bands, turned by a)
  const drumBody = (P) => ISO.tinted(OAK, S(G.disc(DR[0], DR[1], r, X([0, 0, AZ]), P), { tone: "hi" }));
  const bands = (P) => [DR[0], DR[1] - 0.9].map((s) => ISO.tinted(IRON, S(G.ringBand(s, s + 0.9, r - 0.05, r + 0.18, X([0, 0, AZ]), P), { tone: "mid" }))).join("");
  const staves = (P, a) => ISO.tinted(OAK, L(G.ribsOf(X([0, 0, AZ]), DR[0] + 0.9, DR[1] - 0.9, r, 12, P, { phase: a, seams: true }), { tone: "faint" }));
  // rope: a dark core under a lighter strand, width wd px
  const ropeD = (d, wd, dash = "") => `<path d="${d}" fill="none" stroke="#4a3d26" stroke-width="${(wd + 0.8).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a48b5c" stroke-width="${wd.toFixed(2)}" stroke-linecap="round"${dash}/>`;
  // the wraps wound on the drum's front (n of them from X0, each a half turn seen from the front)
  const coil = (P, n, wd) => n > 0.02 ? ropeD(Array.from({ length: Math.ceil(n) }, (_, i) => G.arcOf(X([0, 0, AZ]), X0 + ROPE_D * (i + 0.5), r + ROPE_D / 2, P, { from: -Math.PI / 2, to: Math.PI / 2 })).join(""), wd) : "";
  // the rope's hook: an iron ferrule and a J hook, drawn with its top at the origin's [x, y, 0] (moved by translate)
  function hookSvg(P, x, y, kS) {
    const hk = []; for (let i = 0; i <= 14; i++) { const t = Math.PI * 1.2 * (i / 14); hk.push(K.iso([x + 0.9 - Math.cos(t) * 0.9, y, -1.3 - Math.sin(t) * 0.9], P)); }
    const hd = K.pathOf([K.iso([x, y, -0.4], P), ...hk]);
    return ISO.tinted(IRON, S(G.disc(-0.7, 0.2, 0.6, window.B29.Z([x, y, 0]), P), { tone: "mid" })) +
      `<path d="${hd}" fill="none" stroke="#1f2124" stroke-width="${Math.max(1.4, kS * 0.32).toFixed(2)}" stroke-linecap="round"/><path d="${hd}" fill="none" stroke="#9a9da3" stroke-width="${Math.max(0.8, kS * 0.2).toFixed(2)}" stroke-linecap="round"/>`;
  }
  // the handwheel's spokes (turned by a) between its hub and rim circles
  const spokes = (P, a) => { const F = X([WX, 0, AZ]); return ISO.tinted(ISO.T.steel, L(G.spokesOf(F, 0.75, 2.2, R - 1.3, 6, P, { phase: a }) + G.circleOf(F, 0.75, R - 1.3, P) + G.circleOf(F, 0.75, 2.2, P), { tone: "mid" })); };
  const hub = (P) => { const F = X([WX, 0, AZ]); return ISO.tinted(ISO.T.steel, S(G.disc(-0.3, 1.8, 2.2, F, P), { tone: "mid" }) + S(G.disc(1.8, 2.4, 1.3, F, P, { steps: 6 }), { tone: "hi" })); };
  // the crank handle at the rim's angle 0 (moved round by translate: it stands along x, so turning only moves it)
  function handleSvg(P) {
    const F = X([WX, R - 0.65, AZ]);
    return ISO.tinted(ISO.T.steel, S(G.disc(0.8, 2.4, 0.45, F, P), { tone: "hi" })) + ISO.tinted(OAK, S(G.solidOf([[2.4, 0.9], [3.2, 1.25, 1], [7.4, 1.25, 1], [8.2, 0.9]], F, P), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(8.2, 8.6, 0.6, F, P), { tone: "mid" }));
  }

  ISO.add({
    name: "windlass", title: "Windlass, wheel and axle (part)", compare: null,
    about: "A windlass: two oak posts carry a steel axle with a small drum (r 3 cm) the rope winds on and a big handwheel (R 13 cm) with a crank handle; turning the handle winds the rope in, so a small effort lifts a load 4.3 times bigger. anchors: hook drum handle top",
    line: "windlass cx cy k turns=0..6 rope=0..120 lab=0 lit=frame|drum|wheel|handle|rope",
    demo: { line: "windlass 480 440 6 rope=34 lab=1", script: [{ set: {}, hold: 1 }, { set: { turns: 1, lit: "wheel" }, hold: "settle" }, { set: { turns: 1.6, lit: "drum" }, hold: "settle" }, { set: { turns: 0, lit: "rope" }, hold: "settle" }, { set: { lit: "handle" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const rope = B29.num(o, "rope", 30, 0, 120), most = rope / (2 * Math.PI * r);
      const st = { turns: B29.num(o, "turns", 0, 0, most) }, want = { turns: st.turns };
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -PX - 4, y: -15, w: 2 * PX + 8, d: 30, r: 2 }, 0, 1, P)}"/>`;
      const axle = ISO.tinted(ISO.T.steel, S(G.disc(-PX - 3.6, WX + 2.4, 1.2, X([0, 0, AZ]), P), { tone: "mid" }));
      // painted back to front: −x post, the axle, the drum, its staves, bands and rope, the +x post, the beam, the
      // handwheel's rim, hub and spokes, the handle
      g.innerHTML = halo + `<g data-name="frame">${postSvg(P, -PX)}</g><g data-name="drum">${axle}${drumBody(P)}<g data-part="staves"></g>${bands(P)}</g>` +
        `<g data-name="rope"><g data-part="coil"></g><g data-part="hang"></g><g data-part="hook"></g></g>` +
        `<g data-name="frame">${postSvg(P, PX)}${ISO.tinted(OAK, ISO.wbox(P, [-PX - 4, PX + 4], [-3, 3], [54, 59], "mid") + L(K.segment([-PX - 4, 1.2, 59], [PX + 4, 1.2, 59], P) + K.segment([-PX - 4, 3, 56.5], [PX + 4, 3, 56.5], P), { tone: "faint", free: true }))}</g>` +
        `<g data-name="wheel">${ISO.tinted(ISO.T.steel, S(G.ringBand(-0.3, 1.2, R - 1.3, R, X([WX, 0, AZ]), P), { tone: "hi" }))}${hub(P)}<g data-part="spokes"></g></g><g data-name="handle" data-part="handle">${handleSvg(P)}</g><g data-part="words"></g>`;
      const el = window.LAB.parts(g), wd = Math.max(1, kS * ROPE_D * 0.7), y = r + ROPE_D / 2;
      const hang = () => Math.max(0, rope - st.turns * 2 * Math.PI * r), xr = () => Math.min(X0 + ROPE_D * (2.5 + st.turns) - ROPE_D / 2, DR[1] - 1.5);
      g.anchors = { hook: [xr(), y, AZ - hang() - 2.2], drum: [0, 0, AZ], handle: [WX + 5.3, R - 0.65, AZ], top: [0, 0, 59] };
      el.hook.innerHTML = hookSvg(P, 0, y, kS);
      const draw = () => {
        const a = st.turns * 2 * Math.PI, q = st.turns.toFixed(3), x = xr(), z1 = AZ - hang();
        w.rebuild(el.staves, q, () => staves(P, -a));
        w.rebuild(el.coil, Math.ceil(2.5 + st.turns - 0.02), () => coil(P, Math.min(2.5 + st.turns, (DR[1] - 1 - X0) / ROPE_D), wd));
        // the hanging rope: from the drum's front tangent straight down to the hook
        w.rebuild(el.hang, q, () => hang() > 0.05 ? ropeD(K.pathOf([K.iso([x, y, AZ], P), K.iso([x, y, z1], P)]), wd, ` stroke-dasharray="${(kS * 0.5).toFixed(2)} ${(kS * 0.25).toFixed(2)}"`) : "");
        w.attr(el.hook, "transform", K.translateAlong(P, [x, 0, z1]));
        w.rebuild(el.spokes, q, () => spokes(P, -a));
        w.attr(el.handle, "transform", K.translateAlong(P, [0, Math.cos(-a) * (R - 0.65) - (R - 0.65), Math.sin(-a) * (R - 0.65)]));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([WX, 0, AZ + R + 2], P), "wheel R 13 cm", "#555", { size: 13, anchor: "start", dy: -4 }) + ISO.word(K.iso([-PX + 4, 0, AZ + 6], P), "drum r 3 cm", "#555", { size: 13, anchor: "end", dy: -4 }));
        B29.light(w, g, lit);
      };
      let lit = o.lit || "";
      g.set = (p) => {
        if (p.turns !== undefined && Number.isFinite(+p.turns)) want.turns = ISO.clamp(+p.turns, 0, most);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.turns = ISO.follow(st.turns, want.turns, dt, 0.7, ISO.still());
        draw();
        return st.turns !== want.turns;
      };
      g.readout = () => `windlass R/r = ${R}/${r} = ${(R / r).toFixed(1)} · effort = load × ${r}/${R} · ${st.turns.toFixed(2)} turns: rope wound in ${(st.turns * 2 * Math.PI * r).toFixed(0)} cm, handle travelled ${(st.turns * 2 * Math.PI * R).toFixed(0)} cm · ${hang().toFixed(0)} cm of rope hanging`;
      draw();
      return g;
    },
  });
})();
