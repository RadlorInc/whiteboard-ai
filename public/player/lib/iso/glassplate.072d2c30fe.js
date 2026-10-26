// "glassplate cx cy k split=0..1 lab=0 lit=plate|deposit|holder" — a PART (PARTS.md, batch 5): the collector plate
// of sterngerlach.js. A 5 × 5 cm glass plate, 3 mm thick, standing in a slotted holder on a post and foot, its face
// toward +x (the way the atoms come, from an atomoven on the +x side). The silver that lands on it shows as a grey
// deposit across its middle, 5 cm over the surface: split=0 one line (magnet off); split → 1 it opens into the famous
// "lips", two lines that meet at their ends (the field's pull is strongest along the middle of the knife-edge pole).
// Stern and Gerlach's split was only about 0.2 mm; it is drawn about 50 times wider so it reads. set({ split }) eases.
// Origin the surface under its middle. anchors: centre (the deposit's middle, on the face) top. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const T = 0.15, HY = 2.5, Z0 = 2.5, Z1 = 7.5, BEAM = 5, OPEN = 0.55, HALF = 1.9;
  const X = (o) => window.B29.X(o);
  // the deposit at split f: one line, or two curves that meet at y = ±HALF
  function depositSvg(P, f, kS) {
    const x = T + 0.02, n = 24, up = [], dn = [];
    for (let i = 0; i <= n; i++) { const y = -HALF + (2 * HALF * i) / n, h = OPEN * f * Math.sqrt(Math.max(0, 1 - (y / HALF) ** 2)); up.push(K.iso([x, y, BEAM + h], P)); dn.push(K.iso([x, y, BEAM - h], P)); }
    const d = f < 0.02 ? K.pathOf(up) : K.pathOf([...up, ...dn.reverse()], true), wd = Math.max(1, kS * 0.12);
    return `<path d="${d}" fill="none" stroke="#9a9ca1" stroke-width="${(wd * 1.8).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round" opacity=".55" data-free=""/><path d="${d}" fill="none" stroke="#4a4c51" stroke-width="${wd.toFixed(2)}" stroke-linejoin="round" stroke-linecap="round" data-free=""/>`;
  }

  ISO.add({
    name: "glassplate", title: "Glass collector plate (part)", compare: null,
    about: "A 5 cm glass plate in a holder, facing +x, where the silver atoms land: one grey line with the magnet off, two lines (the lips) with it on, because each atom's spin is up or down, nothing in between. anchors: centre top",
    line: "glassplate cx cy k split=0..1 lab=0 lit=plate|deposit|holder",
    demo: { line: "glassplate 480 430 42 split=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { split: 1, lit: "deposit" }, hold: "settle" }, { set: { lit: "plate" }, hold: 1.2 }, { set: { split: 0, lit: "holder" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const st = { f: B29.num(o, "split", 0, 0, 1) }, want = { f: st.f };
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -1.6, y: -1.6, w: 3.2, d: 3.2, r: 1.6 }, 0, 0.2, P)}"/>`;
      const foot = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.6, 0, 0.4, P, 32, 0.08), { tone: "mid" }) + S(K.cylinder(0, 0, 0.35, 0.4, 1.5, P, 16), { tone: "hi", crease: "none" }) + ISO.wbox(P, [-0.6, 0.6], [-1.6, 1.6], [1.9, Z0], "mid") + ISO.wbox(P, [-0.6, -T], [-1.6, 1.6], [Z0, 2.95], "mid"));
      const jaw = ISO.tinted(ISO.T.steel, ISO.wbox(P, [T, 0.6], [-1.6, 1.6], [Z0, 2.95], "mid") + S(G.disc(0.6, 0.85, 0.22, X([0, 0.9, 2.45]), P), { tone: "mid" }) + S(G.disc(0.85, 1.1, 0.42, X([0, 0.9, 2.45]), P, { steps: 14 }), { tone: "hi" }) + L(G.ribsOf(X([0, 0.9, 2.45]), 0.85, 1.1, 0.42, 14, P, { seams: true }), { tone: "lo" }));
      const plate = `<g class="b29-glass" style="${ISO.T.glass}">${ISO.wbox(P, [-T, T], [-HY, HY], [Z0, Z1], "hi")}</g>` +
        `<path d="${K.pathOf([[T + 0.01, HY - 0.5, Z1 - 0.4], [T + 0.01, HY - 1.6, Z1 - 1.3]].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="${Math.max(0.7, kS * 0.06).toFixed(2)}" stroke-linecap="round" opacity=".9" data-free=""/>`;
      g.innerHTML = window.B29.GLASS + halo + `<g data-name="holder">${foot}</g><g data-name="plate">${plate}</g><g data-name="deposit" data-part="deposit"></g><g data-name="holder">${jaw}</g>` +
        `<g data-part="words">${lab ? ISO.word(K.iso([T, -HY, Z1], P), "glass plate", "#555", { size: 13, anchor: "start", dy: -6 }) : ""}</g>`;
      g.anchors = { centre: [T + 0.02, 0, BEAM], top: [0, 0, Z1] };
      const el = window.LAB.parts(g);
      let lit = o.lit || "";
      const draw = () => { w.rebuild(el.deposit, st.f.toFixed(3), () => depositSvg(P, st.f, kS)); B29.light(w, g, lit); };
      g.set = (p) => {
        if (p.split !== undefined && Number.isFinite(+p.split)) want.f = ISO.clamp(+p.split, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.f = ISO.follow(st.f, want.f, dt, 0.4, ISO.still()); draw(); return st.f !== want.f; };
      g.readout = () => (st.f > 0.5 ? "two lines of silver, meeting at their ends: each atom went up or down (spin up or spin down), none in between · the real gap is about 0.2 mm, drawn wider" : st.f > 0.02 ? "the deposit is opening into two lines" : "one line of silver: the atoms went straight (no field)");
      draw();
      return g;
    },
  });
})();
