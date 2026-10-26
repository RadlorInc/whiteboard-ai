// "lensholder cx cy k type=convex|concave f=5..50 mount=carriage|post lab=0 lit=lens|holder|carriage" — a PART
// (PARTS.md, batch 5): a 5 cm lens in its ring. mount=carriage: on a post on its own carriage, origin the rail-top
// point under the carriage's middle, lens axis 13.5 cm up; mount=post: just the ring with a socket that slides over a
// benchrider's post, origin = the post's top (at=rider.post), lens axis 3.5 cm up (13.5 over the rail with post=10).
// The lens's axis is x: on the optical bench light travels toward −x. The glass is
// cut true to f: a symmetric lens of n = 1.5 has both faces of radius |f|, so its bulge (or dish) is |f| − √(f² − r²).
// A steel ring with two screws, a post in a collar, a holder stub with a thumb screw, the carriage with its clamp knob
// and a tag printed with f. Reused from lens.js and raydiagram.js (lensSvg, carriage). set({ type }) swaps the lens.
// World units: 1 = 1 cm. anchors: centre, focus (the focal point for light travelling −x: real at −f for convex,
// virtual at +f for concave), top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RL = 2.5, RO = 2.85, ZCAR = 13.5, ZPOST = 0.65 + RO, CX = 3, CY = 2.2, CH = 1.4;
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  // the carriage on the rail, the holder stub and the post (static)
  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -CX, y: -CY, w: 2 * CX, d: 2 * CY, r: 0.4 }, 0, 0.02, P)}"/>`];
    out.push(`<g data-name="carriage">${ISO.tinted(ISO.T.paint, S(K.slabOf({ x: -CX, y: -CY, w: 2 * CX, d: 2 * CY, r: 0.3 }, 0, CH, P, 3, 0.12), { tone: "mid", inner: L(K.sideSeam({ x: -CX, y: -CY, w: 2 * CX, d: 2 * CY, r: 0.3 }, 0.35, P, 3), { tone: "faint" }) }))}` +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [-0.2, 2.4], [CY, CY + 0.3], [0.25, 1.15], "mid") + S(G.disc(CY + 0.3, CY + 0.9, 0.22, Y([1.2, 0, 0.7]), P), { tone: "mid" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(CY + 0.9, CY + 1.6, 0.6, Y([1.2, 0, 0.7]), P), { tone: "hi", inner: L(G.ribsOf(Y([1.2, 0, 0.7]), CY + 0.9, CY + 1.6, 0.6, 12, P, { seams: true }), { tone: "lo" }) })) +
      D([[-CX + 0.5, -CY + 0.5], [CX - 0.5, -CY + 0.5], [-CX + 0.5, CY - 0.5], [CX - 0.5, CY - 0.5]].map(([x, y]) => K.iso([x, y, CH], P)), { size: 0.4 }) + `</g>`);
    out.push(`<g data-name="holder">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.75, CH, 1.8, P, 24, 0.1), { tone: "mid" }) + S(G.disc(0.75, 1.2, 0.18, Y([0, 0, CH + 1.1]), P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.plastic, S(G.disc(1.2, 1.6, 0.45, Y([0, 0, CH + 1.1]), P), { tone: "hi" })) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.45, CH + 1.8, 9.2 - CH - 1.8, P, 18), { tone: "hi", crease: "none" }) + S(K.cylinder(0, 0, 0.7, 9.2, 0.6, P, 20, 0.1), { tone: "mid" })) + `</g>`);
    return out.join("");
  }
  // the tag on the carriage's near face: what lens this is
  const tagSvg = (P, f) => {
    const y = CY + 0.02, at = (x, z) => K.iso([x, y, z], P);
    return `<path d="${K.pathOf([at(-2.8, 0.25), at(-0.5, 0.25), at(-0.5, 1.15), at(-2.8, 1.15)], true)}" fill="#fbfbf8" stroke="#55534c" stroke-width="0.5"/>` +
      window.LAB.faceText(P, [-1.65, y + 0.01, 0.5], [1, 0, 0], `f ${f > 0 ? "+" : "−"}${Math.abs(f)} cm`, 0.48, "#33506f");
  };
  // the lens in its ring: the glass cut to f, the ring with its two screws and the stem down into the collar
  function lensSvg(P, concave, f, ZC, post) {
    const F = X([0, 0, ZC]), R = Math.abs(f), sag = R - Math.sqrt(R * R - RL * RL), e = 0.06, out = [];
    const z0 = post ? 0.6 : 9.8;
    if (post) out.push(`<path class="iso-halo" d="${K.haloOf({ x: -0.8, y: -0.8, w: 1.6, d: 1.6, r: 0.8 }, -1.4, 0.02, P)}"/>`, ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.85, -1.4, 2, P, 24, 0.1), { tone: "mid" }) + S(G.disc(0.85, 1.25, 0.18, Y([0, 0, -0.6]), P), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(G.disc(1.25, 1.65, 0.45, Y([0, 0, -0.6]), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.35, z0, ZC - RO - z0 + 0.2, P, 14), { tone: "mid", crease: "none" })));
    const n = 7, prof = [];
    if (concave) { for (let i = 0; i <= n; i++) { const r = (RL * i) / n; prof.push([-(e + R - Math.sqrt(R * R - r * r)), r, 1]); } for (let i = n; i >= 0; i--) { const r = (RL * i) / n; prof.push([e + R - Math.sqrt(R * R - r * r), r, 1]); } }
    else { for (let i = 0; i <= n; i++) { const r = (RL * i) / n; prof.push([-(e + sag - (R - Math.sqrt(R * R - r * r))), r, 1]); } for (let i = n; i >= 0; i--) { const r = (RL * i) / n; prof.push([e + sag - (R - Math.sqrt(R * R - r * r)), r, 1]); } }
    const w = (concave ? e + sag : e) + 0.12;
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(-w, w, RL - 0.05, RO, F, P), { tone: "mid" })));
    out.push(`<g class="lh-glass" style="${ISO.T.glass}">${S(G.lathe(prof, F, P, { steps: 48 }), { tone: "hi" })}</g>`);
    out.push(D([G.pointOf(F, w, (RL + RO) / 2, Math.PI / 2 + 0.6), G.pointOf(F, w, (RL + RO) / 2, Math.PI / 2 - 0.6)].map((p) => K.iso(p, P)), { size: 0.4 }));
    out.push(`<path d="${G.arcOf(F, concave ? e + sag * 0.6 : e + sag * 0.7, RL * 0.62, P, { from: 1.9, to: 2.9 })}" fill="none" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 0.1).toFixed(2)}" stroke-linecap="round" opacity=".85"/>`);
    return out.join("");
  }

  ISO.add({
    name: "lensholder", title: "Lens in a holder (part)", compare: null,
    about: "A 5 cm convex or concave lens (f = 10 cm, glass cut true to f) in a ring, on its own carriage (axis 13.5 cm up) or on a bench rider's post; light travels −x. anchors: centre focus top",
    line: "lensholder cx cy k type=convex|concave f=5..50 mount=carriage|post lab=0 lit=lens|holder|carriage",
    demo: { line: "lensholder 480 460 26 type=convex f=10", script: [{ set: {}, hold: 1 }, { set: { lit: "lens" }, hold: 1.3 }, { set: { type: "concave", lit: "" }, hold: 1.5 }, { set: { lit: "carriage" }, hold: 1.3 }, { set: { type: "convex", lit: "holder" }, hold: 1.3 }] },
    make([cx = 480, cy = 430, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { concave: o.type === "concave", f: ISO.clamp(ISO.num(o, "f", 10), 5, 50) }, w = ISO.writer(), post = o.mount === "post", ZC = post ? ZPOST : ZCAR;
      let lit = o.lit || "";
      g.innerHTML = `<style>.lh-glass .iso-fill{fill-opacity:.85}.lh-glass .iso-shade,.lh-glass .iso-top{opacity:.7}</style>${post ? "" : standSvg(P)}<g data-name="carriage" data-part="tag"></g><g data-name="lens" data-part="lens"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      const draw = () => {
        const fs = st.concave ? -st.f : st.f;
        w.rebuild(el.lens, String(fs), () => lensSvg(P, st.concave, st.f, ZC, post));
        if (!post) w.rebuild(el.tag, String(fs), () => tagSvg(P, fs));
        if (lab) w.rebuild(el.words, String(fs), () => LAB.word(P, lab, [0, 0, ZC + RO + 1.4], `${st.concave ? "concave" : "convex"} lens, f = ${fs} cm`, "#556"));
        g.anchors = { centre: [0, 0, ZC], focus: [-fs, 0, ZC], top: [0, 0, ZC + RO] };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.type === "convex" || p.type === "concave") st.concave = p.type === "concave";
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `${st.concave ? "concave" : "convex"} lens · 5 cm across · f = ${st.concave ? "−" : "+"}${st.f} cm · ${st.concave ? "spreads parallel light as if from a virtual focus" : "brings parallel light to a focus"} ${st.f} cm away`;
      draw();
      return g;
    },
  });
})();
