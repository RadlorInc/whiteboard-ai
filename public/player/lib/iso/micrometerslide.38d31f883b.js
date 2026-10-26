// "micrometerslide cx cy k d=0..10 lab=0 lit=rails|carriage|mirror|micrometer" — a PART (PARTS.md, batch 5): the
// moving mirror of michelson.js on its linear stage, its origin the table point under the stage's base middle. A
// 6 × 4 cm steel base with two hardened rails along x, a carriage riding on them, and on the carriage a post holder,
// a post and a 25 mm mirror in a plain mount, its centre 13.5 cm over the foot, its face toward +x. A micrometer head
// is held in the base's end block at −x: the sleeve with its mm scale, the thimble with 50 divisions (0.5 mm a turn)
// and a ratchet stop; two return springs at the +x end keep the carriage pressed on the spindle's tip. set({ d }) turns
// the thimble out: the thimble backs off toward −x, uncovering d mm of the sleeve's scale, and the carriage and mirror
// follow it d mm toward −x (true size); the thimble turns d / 0.5 times. A mirror moved d changes the
// light's path by 2d, so N = 2d / λ fringes pass (λ = 633 nm). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const Z = 13.5, AX = 1.8, BX = [-2, 4], BY = 2, BZ = 0.6, RZ = 1.1, CX = [-0.2, 3.4], CZ = 2.4, PX = 1.4, STOP = [3.7, 4.0], LAMBDA = 633e-9;
  const SL = [-4.8, -2], SR = 0.42, TR = 0.72, TL = 1.9, E0 = -3.5;   // sleeve x range, radii; the sleeve's 0 mark (the thimble's edge at d = 0)
  const ANOD = ISO.tint("#4a4e55", ["#24272c", "#2d3036", "#363a40", "#41454c"], "#0f1012");
  const SILVER = ISO.tint("#f4f6f9", ["#a7adb6", "#bcc1c8", "#d0d4d9", "#e3e6ea"], "#3a3e44");
  const CHROME = ISO.tint("#eef0f2", ["#a3a8ae", "#b7bbc0", "#cacdd1", "#dcdee1"], "#3c3f45");
  const XF = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  // the thimble and ratchet (they move and turn): x of the thimble's front edge e, turned by angle a
  // the thimble and ratchet, built once with the edge at x = e (the group is moved as d changes; it is round, so only
  // its graduations and the ratchet's knurl turn: ribsSvg is rebuilt with the angle a)
  function thimbleSvg(P, e) {
    const F = XF([0, 0, AX]);
    const body = ISO.tinted(CHROME, S(G.disc(e - TL, e, TR, F, P), { tone: "hi" }));
    const bevel = ISO.tinted(CHROME, S(G.lathe([[e, SR + 0.04], [e, TR - 0.12], [e - 0.12, TR], [e - 0.3, TR]], F, P), { tone: "mid" }));
    const ratchet = ISO.tinted(CHROME, S(G.disc(e - TL - 0.25, e - TL, 0.28, F, P), { tone: "mid" })) + ISO.tinted(CHROME, S(G.disc(e - TL - 0.85, e - TL - 0.25, 0.42, F, P), { tone: "hi" }));
    return { back: ratchet, body: body + bevel };
  }
  const ribsSvg = (P, e, a) => { const F = XF([0, 0, AX]); return L(G.ribsOf(F, e - 0.45, e - 0.05, TR, 50, P, { phase: a, seams: true }), { tone: "lo" }) + L(G.ribsOf(F, e - TL + 0.1, e - 1.0, TR, 20, P, { phase: a, seams: true }), { tone: "faint" }); };
  const knurlSvg = (P, e, a) => L(G.ribsOf(XF([0, 0, AX]), e - TL - 0.85, e - TL - 0.25, 0.42, 16, P, { phase: a, seams: true }), { tone: "lo" });
  // the sleeve: a chrome tube out of the end block, the reference line along its top and the mm ticks hanging from it
  // (only the part in front of the thimble's edge e is drawn: the rest is inside the thimble; the reading = the
  // marks uncovered, from 0 at the frame end, so the reading grows as the thimble backs off toward −x)
  function sleeveSvg(P, e) {
    const F = XF([0, 0, AX]), top = (x, dy = 0) => K.iso([x, dy, AX + SR + 0.005], P), maj = [], min = [];
    for (let i = 0; i <= 20; i++) { const x = E0 - i * 0.05; if (x > e + 0.01) (i % 2 ? min : maj).push(K.pathOf([top(x), top(x, i % 2 ? -0.12 : (i % 10 ? 0.16 : 0.22))])); }
    return ISO.tinted(CHROME, S(G.disc(e, SL[1], SR, F, P), { tone: "hi", crease: "none" })) + ISO.tinted(CHROME, S(G.disc(SL[1] - 0.5, SL[1], SR + 0.14, F, P), { tone: "mid" })) +
      L(K.pathOf([top(e + 0.02), top(SL[1] - 0.55)]), { tone: "mid", free: "start" }) + L(maj.join(""), { tone: "mid", free: "end" }) + L(min.join(""), { tone: "lo", free: "end" });
  }
  // the return springs: from the carriage's front face (x = f) to the stop block, pushing the carriage onto the spindle
  const springsSvg = (P, f) => [-0.7, 0.7].map((y) => { const c = K.coil(f, STOP[0], [y, 1.75], 0.2, 6, "x", P, 12);
    return `<path d="${c.back}" stroke="#8a4a26" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.05).toFixed(2)}" fill="none"/><path d="${c.front}" stroke="#d6956d" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.06).toFixed(2)}" fill="none"/>`; }).join("");
  function baseSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, ISO.wbox(P, BX, [-BY, BY], [0, BZ], "mid"))];
    for (const y of [-1.3, 1.3]) out.push(ISO.tinted(CHROME, ISO.wbox(P, [BX[0] + 0.6, BX[1] - 0.2], [y - 0.25, y + 0.25], [BZ, RZ], "hi")));
    // the four cap screws holding the base to the table, in counterbores at its corners
    const dots = [[BX[0] + 0.35, -BY + 0.35], [BX[1] - 0.35, -BY + 0.35], [BX[0] + 0.35, BY - 0.35], [BX[1] - 0.35, BY - 0.35]];
    out.push(...dots.map(([x, y]) => ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 0.22, BZ, 0.1, P, 12), { tone: "hi" }))));
    return out.join("");
  }
  const endBlock = (P) => ISO.tinted(ANOD, ISO.wbox(P, [BX[0], BX[0] + 0.6], [-BY, BY], [BZ, 3.0], "mid")) + ISO.tinted(ISO.T.steel, S(G.disc(0, 0.08, 0.22, XF([BX[0] + 0.6, 1.4, 2.6]), P), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(0, 0.08, 0.22, XF([BX[0] + 0.6, -1.4, 2.6]), P), { tone: "hi" }));
  // the carriage and what it carries, at d = 0 (the moving group is translated by d)
  function carriageSvg(P) {
    const st = B20.stand(P, Z - 2 + 0.05, { fork: [1, 0] }), out = [];
    out.push(`<g data-name="carriage">${ISO.tinted(ANOD, ISO.wbox(P, CX, [-BY, BY], [RZ, CZ], "mid"))}` +
      [-1.4, 1.4].map((y) => ISO.tinted(ISO.T.steel, S(K.cylinder(CX[1] - 0.5, y, 0.2, CZ, 0.08, P, 12), { tone: "hi" }))).join("") +
      `<g transform="${K.translateAlong(P, [PX, 0, CZ - 0.6])}">${st.holder}${st.thumb}</g>${ISO.tinted(ISO.T.steel, S(K.cylinder(PX, 0, 0.6, CZ + 5.4, Z - 2 - CZ - 5.4, P, 24), { tone: "hi", crease: "none" }))}</g>`);
    // the plain mirror mount: a plate on the post's top, the mirror in it facing +x
    const Fm = XF([PX + 0.45, 0, Z]);
    out.push(`<g data-name="mirror">${ISO.tinted(ANOD, ISO.wbox(P, [PX - 0.45, PX + 0.45], [-1.8, 1.8], [Z - 2, Z + 1.8], "mid"))}` +
      ISO.tinted(SILVER, S(G.disc(0, 0.2, 1.27, Fm, P), { tone: "hi", lit: true })) +
      `<path d="${K.pathOf([[PX + 0.66, -0.7, Z + 0.6], [PX + 0.66, 0.3, Z - 0.5]].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.12).toFixed(2)}" stroke-linecap="round" opacity=".8" data-free=""/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "micrometerslide", title: "Micrometer slide with mirror (part)", compare: null,
    about: "A linear stage: rails, a carriage carrying a 25 mm mirror (centre 13.5 cm up, facing +x) and a micrometer head (0.5 mm a turn) it rests against, with return springs; moving the mirror d changes the path by 2d, so 2d/λ fringes pass. anchors: face",
    line: "micrometerslide cx cy k d=0..10 lab=0 lit=rails|carriage|mirror|micrometer",
    demo: { line: "micrometerslide 500 430 24", script: [{ set: {}, hold: 1 }, { set: { lit: "micrometer" }, hold: 1.2 }, { set: { d: 4, lit: "carriage" }, hold: "settle" }, { set: { d: 10, lit: "mirror" }, hold: "settle" }, { set: { d: 1.5, lit: "rails" }, hold: "settle" }] },
    make([cx = 480, cy = 430, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const st = { d: ISO.clamp(ISO.num(o, "d", 0), 0, 10) }, want = { d: st.d };
      let lit = o.lit || "";
      const th = thimbleSvg(P, E0);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: BX[0] - 3, y: -BY, w: BX[1] - BX[0] + 3, d: 2 * BY, r: 0.4 }, 0, 0.6, P)}"/>` +
        `<g data-name="micrometer" data-part="thimble">${th.back}<g data-part="knurl"></g>${th.body}<g data-part="ribs"></g></g><g data-name="micrometer" data-part="sleeve"></g><g data-name="rails">${baseSvg(P)}</g>` +
        `<g data-name="micrometer" data-part="spindle">${ISO.tinted(CHROME, S(G.disc(BX[0] - 0.4, CX[0], 0.2, XF([0, 0, AX]), P), { tone: "hi", crease: "none" }))}</g>` +
        `<g data-name="rails">${endBlock(P)}</g><g data-name="carriage" data-part="springs"></g><g data-part="move">${carriageSvg(P)}</g><g data-name="rails">${ISO.tinted(ANOD, ISO.wbox(P, STOP, [-BY, BY], [BZ, 2.4], "mid"))}</g><g data-part="words"></g>`;
      const el = window.LAB.parts(g);
      const draw = () => {
        const dx = st.d / 10, e = E0 - dx, a = -(st.d / 0.5) * Math.PI * 2, key = st.d.toFixed(3);
        w.attr(el.thimble, "transform", K.translateAlong(P, [-dx, 0, 0]));
        w.rebuild(el.ribs, key, () => ribsSvg(P, E0, a));
        w.rebuild(el.knurl, key, () => knurlSvg(P, E0, a));
        w.rebuild(el.sleeve, key, () => sleeveSvg(P, e));
        w.rebuild(el.springs, st.d.toFixed(2), () => springsSvg(P, CX[1] - dx));
        w.attr(el.move, "transform", K.translateAlong(P, [-dx, 0, 0]));
        w.attr(el.spindle, "transform", K.translateAlong(P, [-dx, 0, 0]));
        g.anchors = { face: [+(PX + 0.65 - dx).toFixed(3), 0, Z] };
        if (lab) w.rebuild(el.words, "", () => window.LAB.word(P, lab, [PX, 0, Z + 2.8], "moving mirror", "#556") + window.LAB.word(P, lab, [E0 - 1.5, 0, AX - 1.2], "micrometer", "#556", { dy: 14 }));
        B20.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.d !== undefined && Number.isFinite(+p.d)) want.d = ISO.clamp(+p.d, 0, 10);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.d = ISO.follow(st.d, want.d, dt, 0.5, ISO.still());
        if (Math.abs(st.d - want.d) < 0.002) st.d = want.d;
        draw();
        return st.d !== want.d;
      };
      g.readout = () => `micrometer reads ${st.d.toFixed(2)} mm (${(st.d / 0.5).toFixed(1)} turns) · mirror moved ${st.d.toFixed(2)} mm · path changed ${(2 * st.d).toFixed(2)} mm · N = 2d/λ = ${Math.round((2 * st.d * 1e-3) / LAMBDA)} fringes (λ 633 nm)`;
      draw();
      return g;
    },
  });
})();
