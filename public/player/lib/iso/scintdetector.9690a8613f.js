// "scintdetector cx cy k angle=0..170 lab=0 lit=base|arm|screen|scope" — a PART (PARTS.md, batch 5): the detector of
// goldfoil.js, its origin the point it turns round: the middle of its ring, on the floor it stands on, where a foilframe
// stands (place the foil at=<id>.pivot; the foil's foot fits inside the ring). A fixed base ring 12 cm across printed
// with a degree scale (a tick every 10°, longer every 30°, 0 on the straight-through line), a ring that turns on it and
// an 18 cm arm; at its end a riser and a clamp hold a microscope 2 cm across and 8 cm long pointing back at the pivot,
// a zinc-sulphide screen on its front end, 4.5 cm up (the alpha beam's height). angle = how far the detector is turned
// from straight through (alphas travel toward −x, so 0 puts it on the −x side, 90 on the +y side), eased; the readout
// gives the flashes a minute there, as the gold-foil count falls off: ∝ 1/sin⁴(θ/2). set({ angle }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const BZ = 45, RI = 32, RO = 62, ARM = 180, ZB = 4;
  const ZNS = ISO.tint("#eaf6e6", ["#9fcf95", "#b2d9a9", "#c5e3be", "#d5ebd0"], "#2c6a22");
  const countAt = (deg) => { const th = (Math.max(deg, 4) * Math.PI) / 180; return Math.round(5 / Math.pow(Math.sin(th / 2), 4)); };
  const dirOf = (deg) => { const a = (deg * Math.PI) / 180; return [-Math.cos(a), Math.sin(a), 0]; };

  // a flat ring as short box pieces sorted far to near (a lathe would fill its middle; the floor must show there)
  const annulus = (P, r0, r1, z0, z1, n, tone = "mid") => {
    const at = (t, r, z) => [Math.cos(t) * r, Math.sin(t) * r, z], out = [];
    for (let i = 0; i < n; i++) { const t0 = (i / n) * 2 * Math.PI, t1 = ((i + 1) / n) * 2 * Math.PI; out.push({ k: K.depthOf(at((t0 + t1) / 2, (r0 + r1) / 2, z1), P), svg: ISO.box(at, P, [t0, t1], [r0, r1], [z0, z1], tone) }); }
    return out.sort((a, b) => a.k - b.k).map((q) => q.svg).join("");
  };
  function baseSvg(P, S, L) {
    const out = [ISO.tinted(ISO.T.plastic, annulus(P, RI, RO, 0, ZB, 48))];
    const minor = [], major = [];
    for (let d = -170; d <= 170; d += 10) {
      const [x, y] = dirOf(d), big = d % 30 === 0, r1 = big ? RO - 9 : RO - 5;
      (big ? major : minor).push(K.segment([x * (RO - 0.3), y * (RO - 0.3), ZB + 0.05], [x * r1, y * r1, ZB + 0.05], P));
    }
    out.push(`<path d="${minor.join("")}" stroke="#d9dde1" stroke-width="0.6" fill="none"/><path d="${major.join("")}" stroke="#f4f6f8" stroke-width="1" fill="none"/>`);
    return out.join("");
  }
  // the turning ring, arm, riser, clamp and the microscope with its screen, at angle deg
  function detectorSvg(P, deg, S) {
    const d = dirOf(deg), p = [-d[1], d[0], 0];
    const at = (u, w, v) => [d[0] * u + p[0] * v, d[1] * u + p[1] * v, w];
    const steel = (svg) => ISO.tinted(ISO.T.steel, svg), out = [];
    out.push(`<g data-name="arm">`);
    out.push(ISO.tinted(ISO.T.rubber, ISO.box(at, P, [168, 178], [0, ZB + 4], [-4, 4], "mid")));   // the end's runner on the floor
    out.push(steel(ISO.box(at, P, [38, ARM], [ZB + 4, ZB + 9], [-10, 10], "mid")));
    out.push(`<path d="${K.pathOf([K.iso(at(43, ZB + 4.05, 0), P), K.iso(at(48, ZB + 4.05, 0), P)])}" stroke="#c0392b" stroke-width="1.4"/>`);
    out.push(steel(ISO.box(at, P, [140, 168], [ZB + 9, BZ - 9], [-6, 6], "mid") + ISO.box(at, P, [146, 162], [BZ - 11, BZ - 7], [-10, 10], "mid")), "</g>");
    const F = G.frameOf([0, 0, BZ], d, p, [0, 0, 1]);
    const pieces = [
      [119.5, `<g data-name="screen">${ISO.tinted(ZNS, S(G.disc(118, 121, 12, F, P, { steps: 28 }), { tone: "hi" }))}</g>`],
      [130, `<g data-name="scope">${ISO.tinted(ISO.T.plastic, S(G.disc(121, 136, 10, F, P, { steps: 28 }), { tone: "mid" }))}</g>`],
      [163, `<g data-name="scope">${ISO.tinted(ISO.T.plastic, S(G.disc(136, 190, 8, F, P, { steps: 28 }), { tone: "mid" }))}${steel(S(G.disc(150, 158, 9.5, F, P, { steps: 28 }), { tone: "mid" }))}</g>`],
      [196, `<g data-name="scope">${ISO.tinted(ISO.T.rubber, S(G.disc(190, 202, 6.5, F, P, { steps: 28 }), { tone: "mid" }))}</g>`],
    ];
    const kOf = (u) => K.depthOf([d[0] * u, d[1] * u, BZ], P);
    out.push(pieces.sort((a, b) => kOf(a[0]) - kOf(b[0])).map((q) => q[1]).join(""));
    return out.join("");
  }

  ISO.add({
    name: "scintdetector", title: "Scintillation detector on an arm (part)", compare: null,
    about: "A zinc-sulphide screen and a microscope on an 18 cm arm that turns round the gold foil on a degree ring, counting alpha flashes at any angle (fewer and fewer at bigger angles). anchors: pivot",
    line: "scintdetector cx cy k angle=0..170 lab=0 lit=base|arm|screen|scope",
    demo: { line: "scintdetector 480 300 18 angle=10 lab=1", script: [{ set: {}, hold: 1 }, { set: { angle: 45, lit: "screen" }, hold: "settle" }, { set: { angle: 90, lit: "scope" }, hold: "settle" }, { set: { angle: 150, lit: "arm" }, hold: "settle" }, { set: { lit: "base" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { a: ISO.clamp(ISO.num(o, "angle", 10), 0, 170) }; s.aT = s.a;
      let lit = o.lit || "";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RO, y: -RO, w: 2 * RO, d: 2 * RO, r: RO }, 0, ZB, Pm)}"/><g data-name="base">${baseSvg(Pm, S, L)}</g><g data-name="arm">${ISO.tinted(ISO.T.steel, annulus(Pm, RI, 42, ZB, ZB + 4, 40))}</g><g data-part="det"></g><g data-part="words"></g>`;
      g.anchors = { pivot: [0, 0, 0] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(s.a * 4) / 4;   // rebuilt every ¼°
        w.rebuild(el.det, String(q), () => detectorSvg(Pm, q, S));
        if (lab) w.rebuild(el.words, s.a.toFixed(0), () => { const [x, y] = dirOf(s.a); return LAB.word(Pm, lab, [x * 200, y * 200, BZ + 16], `${s.a.toFixed(0)}° · ${countAt(s.a)} /min`, "#2c6a22", { dy: -4 }); });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.angle !== undefined && Number.isFinite(+p.angle)) s.aT = ISO.clamp(+p.angle, 0, 170);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { s.a = ISO.follow(s.a, s.aT, dt, 0.6, ISO.still()); if (Math.abs(s.a - s.aT) < 0.02) s.a = s.aT; draw(); return s.a !== s.aT; };
      g.readout = () => `detector at ${s.a.toFixed(0)}° from straight through · about ${countAt(s.a)} flashes a minute (∝ 1/sin⁴(θ/2)) · at 10°: ${countAt(10)}, at 90°: ${countAt(90)}, at 150°: ${countAt(150)}`;
      draw();
      return g;
    },
  });
})();
