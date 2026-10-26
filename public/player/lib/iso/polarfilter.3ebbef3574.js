// "polarfilter cx cy k deg=0..360 mount=post|stand lab=0 lit=filter|ring|scale|post" — a PART (PARTS.md, batch 24):
// a polarising filter 8 cm across in a rotating ring mount, its axis along x (light travels −x on the bench).
// A fixed black outer ring with a white degree scale on its +x face (a tick every 10°, long every 30°, numbers every
// 90), the inner ring that turns with the grey polaroid sheet (its pass direction drawn as fine lines), a white index
// on the inner ring and a knurled grip pin. A block carries the ring 1.6 cm ahead (+x) of a sleeve over the post
// (B24.mount: mount=post slides over a benchrider's post, origin = the post's top; mount=stand has its own 10 cm post
// and foot, origin = the bench). Optical centre 3.5 cm over the post top (13.5 over the foot). deg = the pass
// direction from vertical, turned toward +y; set({ deg }) turns it, eased. Reused from polarisation.js (filterSvg).
// World units: 1 = 1 cm. anchors: centre top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const XO = 1.6, RF = 2.8, RI = 3.2, RO = 4.0, T = 0.6;      // ring offset, film, inner ring, outer ring radii, ring half-thickness
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const BLACK = ISO.T.plastic;

  // the fixed parts: the block from the sleeve to the ring, the outer ring and its printed scale
  function ringSvg(P, z0, ZC) {
    const F = X([XO, 0, ZC]), out = [];
    out.push(`<g data-name="post">${ISO.tinted(BLACK, ISO.wbox(P, [0.5, XO - T + 0.02], [-0.6, 0.6], [z0 - 0.9, z0 + 0.6], "mid"))}</g>`);
    out.push(`<g data-name="ring">${ISO.tinted(BLACK, S(G.ringBand(-T, T, RI - 0.02, RO, F, P, { steps: 72 }), { tone: "mid" }))}</g>`);
    // the scale: ticks hang inward from the ring's outer edge, numbers at 0, 90, 180, 270 (0 = up, turning toward +y)
    const tick = [], big = [];
    for (let d = 0; d < 360; d += 10) {
      const a = Math.PI / 2 - (d * Math.PI) / 180, n = d % 30 ? 0.16 : 0.3;
      (d % 30 ? tick : big).push(K.pathOf([G.pointOf(F, T + 0.01, RO - 0.06, a), G.pointOf(F, T + 0.01, RO - 0.06 - n, a)].map((p) => K.iso(p, P))));
    }
    const nums = [0, 90, 180, 270].map((d) => { const a = Math.PI / 2 - (d * Math.PI) / 180; return window.LAB.faceText(P, G.pointOf(F, T + 0.02, RO - 0.66, a), [0, -1, 0], String(d), 0.26, "#f4f4f0", [0, 0, 1]); });
    out.push(`<g data-name="scale"><path d="${tick.join("")}" stroke="#e8e8e2" stroke-width="${(G.scaleOf(P) * 0.05).toFixed(2)}"/><path d="${big.join("")}" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 0.08).toFixed(2)}"/>${nums.join("")}</g>`);
    return out.join("");
  }
  // the turning parts at pass angle th (radians from vertical): film with its lines, inner ring, index, grip pin
  function turnSvg(P, ZC, th) {
    const F = X([XO, 0, ZC]), a = Math.PI / 2 - th, out = [];
    out.push(`<g data-name="ring">${ISO.tinted(ISO.T.steel, S(G.ringBand(-T + 0.1, T + 0.12, RF - 0.05, RI, F, P, { steps: 64 }), { tone: "mid" }))}`);
    out.push(`</g><g data-name="filter"><path d="${G.circleOf(F, T + 0.1, RF + 0.02, P)}" fill="#6f7780" fill-opacity=".55" stroke="#3a3f45" stroke-width="0.5"/>`);
    // the pass direction: chords parallel to it, ending on the film's edge (drawn as print, not as solid edges)
    const ux = [Math.cos(a), Math.sin(a)], nx = [-ux[1], ux[0]], ch = [];
    for (let i = -4; i <= 4; i++) {
      const c = i * 0.62, h = Math.sqrt(RF * RF - c * c) - 0.05, at = (t) => [XO + T + 0.11, nx[0] * c + ux[0] * t, ZC + nx[1] * c + ux[1] * t];
      ch.push(K.pathOf([K.iso(at(-h), P), K.iso(at(h), P)]));
    }
    out.push(`<path d="${ch.join("")}" stroke="#3d434a" stroke-width="${(G.scaleOf(P) * 0.035).toFixed(2)}" opacity=".8"/>`);
    out.push(`<path d="${G.arcOf(F, T + 0.11, RF * 0.7, P, { from: 2.0, to: 2.9 })}" fill="none" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 0.08).toFixed(2)}" stroke-linecap="round" opacity=".7"/></g><g data-name="ring">`);
    // the index: a white wedge on the inner ring at the pass direction, pointing at the scale
    const w = 0.09, tip = [G.pointOf(F, T + 0.13, RI - 0.02, a), G.pointOf(F, T + 0.13, RF + 0.08, a + w), G.pointOf(F, T + 0.13, RF + 0.08, a - w)];
    out.push(`<path d="${K.pathOf(tip.map((p) => K.iso(p, P)), true)}" fill="#ffffff" stroke="#26282c" stroke-width="0.4"/>`);
    // the grip pin, square to the index, standing out of the inner ring's face over the outer ring
    const pa = a - Math.PI / 2, Fp = G.frameAlong(G.pointOf(F, T + 0.32, RI - 0.2, pa), [0, Math.cos(pa), Math.sin(pa)]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 1.3, 0.2, Fp, P), { tone: "mid" })) + ISO.tinted(BLACK, S(G.disc(1.3, 2.0, 0.34, Fp, P), { tone: "hi", inner: L(G.ribsOf(Fp, 1.3, 2.0, 0.34, 10, P, { seams: true }), { tone: "lo" }) })));
    out.push(D([G.pointOf(F, T + 0.13, (RF + RI) / 2, a + 1.9), G.pointOf(F, T + 0.13, (RF + RI) / 2, a - 1.9)].map((p) => K.iso(p, P)), { size: 0.35 }) + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "polarfilter", title: "Polarising filter (part)", compare: null,
    about: "A polarising filter 8 cm across in a rotating ring mount with a degree scale, on a benchrider's post or its own stand; its centre 13.5 cm over the foot, light travels −x; deg turns the pass direction. anchors: centre top",
    line: "polarfilter cx cy k deg=0..360 mount=post|stand lab=0 lit=filter|ring|scale|post",
    demo: { line: "polarfilter 470 470 22 mount=stand deg=0", script: [{ set: {}, hold: 1 }, { set: { deg: 45 }, hold: "settle" }, { set: { deg: 90, lit: "filter" }, hold: "settle" }, { set: { lit: "scale" }, hold: 1.2 }, { set: { deg: 0, lit: "ring" }, hold: "settle" }, { set: { lit: "post" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", stand = o.mount === "stand";
      const m = window.B24.mount(P, stand), ZC = m.z0 + 3.5, w = ISO.writer();
      const st = { th: (ISO.clamp(ISO.num(o, "deg", 0), 0, 360) * Math.PI) / 180 }; st.thT = st.th;
      let lit = o.lit || "";
      g.innerHTML = m.svg + ringSvg(P, m.z0, ZC) + `<g data-part="turn"></g><g data-part="words"></g>`;
      g.anchors = { centre: [XO, 0, ZC], top: [XO, 0, ZC + RO] };
      const el = LAB.parts(g), deg = () => Math.round((st.th * 180) / Math.PI);
      const draw = () => {
        w.rebuild(el.turn, st.th.toFixed(3), () => turnSvg(P, ZC, st.th));
        if (lab) w.rebuild(el.words, String(deg()), () => LAB.word(P, lab, [XO, 0, ZC + RO + 1.2], `polariser at ${deg()}°`, "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) st.thT = (ISO.clamp(+p.deg, 0, 360) * Math.PI) / 180;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => { st.th = ISO.follow(st.th, st.thT, dt, 0.45, ISO.still()); draw(); return st.th !== st.thT; };
      g.readout = () => `polarising filter · pass direction ${deg()}° from vertical · passes only light vibrating that way (half of unpolarised light; cos²θ of polarised light θ off it)`;
      draw();
      return g;
    },
  });
})();
