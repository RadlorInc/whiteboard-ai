// "crystalcluster cx cy k c=purple|blue|green|white grow=0..1 lab=0 lit=crystals" — a PART (PARTS.md, batch 5): the
// cluster of eleven mineral crystals from crystals.js, each the true habit of its mineral: purple amethyst and white
// rock crystal (quartz, SiO₂) as six-sided prisms ending in six-sided points; blue copper(II) sulfate
// (CuSO₄·5H₂O) as slanted triclinic blocks; green fluorite (CaF₂) as cubes. Crystals 1.5 to 4.6 cm long, 0.7 to 1.4 cm
// across, leaning out of a centre. Its origin is the rock's origin (place it at=<mineralrock>): the crystals' feet are
// set 0.4 to 1.8 cm up, into the rock's crown and sides. set({ grow }) grows the cluster from small seeds to full
// size (each crystal starting a little after the last, as layers of particles build on it from a saturated
// solution); the readout gives the largest crystal's size. Built in mm (ISO.mm); anchors in cm. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G;
  // the crystals: foot (x, y, z) mm over the rock's origin, lean (radians) toward a heading, length, radius, spin, delay
  const SET = [[0, 0, 18, 0.08, 0, 46, 7, 0.2, 0], [-14, 6, 14, 0.42, 2.6, 36, 6, 0.9, 0.08], [12, -6, 14, 0.38, -0.6, 38, 6.4, 0.4, 0.05], [8, 12, 12, 0.6, 1.3, 30, 5.2, 1.2, 0.18],
    [-8, -12, 13, 0.55, -2.2, 32, 5.6, 0.1, 0.12], [20, 6, 8, 0.85, 0.3, 24, 4.6, 0.6, 0.25], [-22, -4, 8, 0.9, 3.3, 22, 4.4, 1.5, 0.3], [2, -18, 8, 0.8, -1.5, 22, 4.4, 0.9, 0.28],
    [-4, 18, 9, 0.75, 1.9, 20, 4, 0.3, 0.35], [24, -10, 4, 1.0, -0.4, 16, 3.6, 0.7, 0.4], [-18, 16, 5, 1.0, 2.3, 15, 3.4, 1.1, 0.42]];
  const frame3 = (lean, head) => { const ax = [Math.sin(lean) * Math.cos(head), Math.sin(lean) * Math.sin(head), Math.cos(lean)], u = G.unit3(G.cross3(ax, Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = G.cross3(ax, u); return { ax, u, v }; };
  const at = (o, { ax, u, v }, s, x, y) => [0, 1, 2].map((i) => o[i] + ax[i] * s + u[i] * x + v[i] * y);
  // a quartz crystal: six-sided prism, a six-sided pyramid on top (convex: one solid)
  const hexSolid = (P, o, f, len, r, spin) => {
    const V = [], tip = len * 0.26, ring = (s, rr) => { for (let k = 0; k < 6; k++) { const a = spin + (k * Math.PI) / 3; V.push(at(o, f, s, Math.cos(a) * rr, Math.sin(a) * rr)); } };
    ring(-2, r); ring(len - tip, r); V.push(at(o, f, len, 0, 0));
    const F = [[0, 1, 2, 3, 4, 5]];
    for (let k = 0; k < 6; k++) { const n = (k + 1) % 6; F.push([k, n, 6 + n, 6 + k], [6 + k, 6 + n, 12]); }
    return ISO.poly(V, F, P, "mid");
  };
  // fluorite cube / copper sulfate slanted block: a parallelepiped along the frame (shear makes the block lean)
  const blockSolid = (P, o, f, len, r, spin, shear) => {
    const c = Math.cos(spin), s = Math.sin(spin), corner = (x, y, h) => { const xs = x * c - y * s + shear * h, ys = x * s + y * c; return at(o, f, h - 2, xs, ys); };
    const hw = r * 1.15, V = [corner(-hw, -hw, 0), corner(hw, -hw, 0), corner(hw, -hw, len), corner(-hw, -hw, len), corner(-hw, hw, 0), corner(hw, hw, 0), corner(hw, hw, len), corner(-hw, hw, len)];
    return ISO.poly(V, ISO.BOX_F, P, "mid");
  };

  ISO.add({
    name: "crystalcluster", title: "Crystal cluster (part)", compare: null,
    about: "Eleven mineral crystals in their true habit (quartz hex prisms, copper sulfate slanted blocks, fluorite cubes) leaning out of a centre; they grow from small seeds to full size. Place at a mineralrock's origin. anchors: tip",
    line: "crystalcluster cx cy k c=purple|blue|green|white grow=0..1 lab=0 lit=crystals",
    demo: { line: "crystalcluster 480 400 40 c=purple grow=0.2", script: [{ set: {}, hold: 1 }, { set: { grow: 1, lit: "crystals" }, hold: "settle" }, { set: { c: "blue", lit: "" }, hold: 1.2 }, { set: { c: "green", grow: 0.5 }, hold: "settle" }, { set: { c: "white", grow: 1 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { grow: ISO.clamp(ISO.num(o, "grow", 1), 0, 1), want: 0, lit: o.lit || "", c: B10.MIN[o.c] ? o.c : "purple" };
      st.want = st.grow;
      g.innerHTML = `<g data-name="crystals" data-part="crystals"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const items = SET.map(([x, y, z, lean, head, len, r, spin, delay]) => ({ o: [x, y, z], f: frame3(lean, head), len, r, spin, delay }));
      const order = items.slice().sort((a, b) => K.depthOf(at(a.o, a.f, a.len / 2, 0, 0), Pm) - K.depthOf(at(b.o, b.f, b.len / 2, 0, 0), Pm));
      const sizeOf = (it, gq) => ISO.ease(ISO.clamp((gq - it.delay) / (1 - it.delay), 0, 1));
      const tintOf = (m) => ISO.tint(LAB.mix(m.col, "#ffffff", 0.35), [LAB.mix(m.col, "#000000", 0.25), LAB.mix(m.col, "#000000", 0.12), m.col, LAB.mix(m.col, "#ffffff", 0.15)], m.ink);
      const big = items[0], lenOf = (m, it, f) => (m.shape === "hex" ? it.len * f : m.shape === "cube" ? Math.max(it.r * (0.35 + 0.65 * f) * 2.3, it.len * f * 0.42) : it.len * f * 0.55);
      g.anchors = { tip: at(big.o, big.f, big.len, 0, 0).map((v) => +(v / 10).toFixed(3)) };
      const draw = () => {
        const gq = Math.round(st.grow * 100) / 100, m = B10.mineral(st.c);
        w.rebuild(el.crystals, `${gq} ${st.c}`, () => `<g style="${tintOf(m)}">${order.map((it) => {
          const f = 0.12 + 0.88 * sizeOf(it, gq), len = it.len * f, r = it.r * (0.35 + 0.65 * f);
          return m.shape === "hex" ? hexSolid(Pm, it.o, it.f, len, r, it.spin) : m.shape === "cube" ? blockSolid(Pm, it.o, it.f, Math.max(r * 2.3, len * 0.42), r * 1.1, it.spin, 0) : blockSolid(Pm, it.o, it.f, len * 0.55, r * 1.05, it.spin, 0.32);
        }).join("")}</g>`);
        if (lab) w.rebuild(el.words, st.c, () => LAB.word(Pm, lab, [0, 0, m.shape === "hex" ? 74 : 60], m.name, m.ink, { size: 14 }));
        B10.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.grow !== undefined && Number.isFinite(+p.grow)) st.want = ISO.clamp(+p.grow, 0, 1);
        if (p.c && B10.MIN[p.c]) st.c = p.c;
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        st.grow = ISO.still() || dt > 1 ? st.want : st.grow + Math.sign(st.want - st.grow) * Math.min(Math.abs(st.want - st.grow), dt * 0.3);
        draw();
        return st.grow !== st.want;
      };
      g.readout = () => {
        const m = B10.mineral(st.c), f = 0.12 + 0.88 * sizeOf(big, st.grow);
        return `${m.name} · ${m.say} · largest crystal about ${Math.round(lenOf(m, big, f))} mm${st.grow < st.want ? " · growing a layer of particles at a time" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
