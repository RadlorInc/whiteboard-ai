// "crystals cx cy size c=purple|blue|green|white grow=0..1 lab=1 lit=crystals|rock|plinth|plate |text" — a mineral
// specimen on a wooden display plinth with a brass name plate: a cluster of crystals growing out of a broken rock,
// each crystal the true shape for its mineral. purple: amethyst and white: rock crystal (both quartz, SiO₂) grow as
// six-sided prisms ending in six-sided points; blue: copper(II) sulfate (CuSO₄·5H₂O, grown from solution in school)
// as slanted blocks (triclinic); green: fluorite (CaF₂) as cubes. set({ grow }) grows the cluster from small seeds to
// full size, as crystals grow layer by layer from a saturated solution; the readout gives the largest crystal's size.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const PLINTH = { x: -60, y: -46, w: 120, d: 90, r: 4 }, ZT = 26;
  const MIN = {
    purple: { name: "amethyst · quartz, SiO₂", shape: "hex", col: "#a77bd6", ink: "#4b2a7a", say: "six-sided prisms with pointed tips · hardness 7" },
    white: { name: "rock crystal · quartz, SiO₂", shape: "hex", col: "#eef3f8", ink: "#5d7f96", say: "six-sided prisms with pointed tips · hardness 7" },
    blue: { name: "copper(II) sulfate, CuSO₄·5H₂O", shape: "slab", col: "#3f8fe0", ink: "#163f74", say: "slanted blocks (triclinic) · grown from a saturated solution" },
    green: { name: "fluorite, CaF₂", shape: "cube", col: "#7ccf8e", ink: "#22603a", say: "cubes, often twinned · hardness 4" },
  };
  // the crystals: foot on the rock (x, y, z), lean (radians) toward a heading, length, radius, spin, the grow delay
  const SET = [[0, 0, 44, 0.08, 0, 46, 7, 0.2, 0], [-14, 6, 40, 0.42, 2.6, 36, 6, 0.9, 0.08], [12, -6, 40, 0.38, -0.6, 38, 6.4, 0.4, 0.05], [8, 12, 38, 0.6, 1.3, 30, 5.2, 1.2, 0.18],
    [-8, -12, 39, 0.55, -2.2, 32, 5.6, 0.1, 0.12], [20, 6, 34, 0.85, 0.3, 24, 4.6, 0.6, 0.25], [-22, -4, 34, 0.9, 3.3, 22, 4.4, 1.5, 0.3], [2, -18, 34, 0.8, -1.5, 22, 4.4, 0.9, 0.28],
    [-4, 18, 35, 0.75, 1.9, 20, 4, 0.3, 0.35], [24, -10, 30, 1.0, -0.4, 16, 3.6, 0.7, 0.4], [-18, 16, 31, 1.0, 2.3, 15, 3.4, 1.1, 0.42]];

  const frame3 = (a, lean, head) => { const ax = [Math.sin(lean) * Math.cos(head), Math.sin(lean) * Math.sin(head), Math.cos(lean)], u = G.unit3(G.cross3(ax, Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = G.cross3(ax, u); return { ax, u, v }; };
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
    name: "crystals", title: "Crystals on a rock", compare: "crystals 480 260 230 c=purple",
    about: "A cluster of crystals growing out of a rock on a display plinth; each mineral has its own crystal shape.",
    line: "crystals cx cy size c=purple|blue|green|white grow=0..1 lab=1 lit=crystals|rock|plinth|plate |text",
    demo: { line: "crystals 480 270 240 c=purple grow=0.25", script: [{ set: { lit: "rock" }, hold: 1.2 }, { set: { grow: 1, lit: "crystals" }, hold: "settle" }, { set: { lit: "plate" }, hold: 1.4 }] },
    make([cx, cy, size = 230], o, t, parent) {
      const LAB = window.LAB;
      const lab = o.lab !== "0", m = MIN[o.c] || MIN.purple, W = size * 2.1, H = size * 1.55;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, 0, ZT), [0, 0, 100], [-50, 0, 80], [50, 0, 80]], cx, cy, W, H, { azimuth: 55, elevation: 24 }, parent);
      const st = { grow: ISO.clamp(ISO.num(o, "grow", 1), 0, 1), want: 0, lit: o.lit || "", litDrawn: null };
      st.want = st.grow;
      // ── plinth: a turned-edge wooden base, a raised top block, the brass plate on the front
      const out = [`<path class="iso-halo" d="${K.haloOf(PLINTH, 0, ZT, P)}"/>`, `<g data-name="plinth" style="${ISO.T.wood}">${S(K.slabOf(PLINTH, 0, 12, P, 4, 1), { tone: "mid", inner: L(K.sideSeam(PLINTH, 6, P, 4), { tone: "faint" }) })}` +
        `${S(K.slabOf(K.insetPlan(PLINTH, 8), 12, ZT - 12, P, 3, 0.8), { tone: "mid" })}</g>`];
      const plate = { x: -30, y: PLINTH.y + PLINTH.d - 12 - 0.1, w: 60, d: 0.8, r: 0 };
      out.push(`<g data-name="plate" style="${ISO.T.brass}">${ISO.wbox(P, [-30, 30], [PLINTH.y + PLINTH.d - 8, PLINTH.y + PLINTH.d - 7], [14.5, 23.5], "hi")}${K.dotsSvg([K.iso([-27, PLINTH.y + PLINTH.d - 6.9, 19], P), K.iso([27, PLINTH.y + PLINTH.d - 6.9, 19], P)], { size: 0.5 })}` +
        `<g transform="${ISO.faceMatrix(P, [0, PLINTH.y + PLINTH.d - 6.9, 20.4], 1)}"><text text-anchor="middle" style="font:700 3.6px 'Helvetica Neue',Arial,sans-serif" fill="#4a3a10">${m.name.split(" · ")[0].replace(/,.*/, "").toUpperCase()}</text></g>` +
        `<g transform="${ISO.faceMatrix(P, [0, PLINTH.y + PLINTH.d - 6.9, 16.6], 1)}"><text text-anchor="middle" style="font:600 2.4px 'Helvetica Neue',Arial,sans-serif" fill="#6b5114">${(m.name.split(" · ")[1] || m.name.split(", ")[1] || "").replace(/</g, "")}</text></g></g>`);
      // ── the rock: three broken chunks (each a tapering solid with an irregular outline), grey-brown
      const ROCK = ISO.tint("#c9c1b5", ["#8a8075", "#9a9085", "#aaa196", "#bab1a6"], "#4a4238");
      const chunk = (cx0, cy0, z0, z1, r0, r1, seed, dx = 0, dy = 0) => {
        const n = 9, V = [];
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + seed, k = 0.8 + 0.25 * Math.sin(seed * 3 + i * 2.1); V.push([cx0 + Math.cos(a) * r0 * k, cy0 + Math.sin(a) * r0 * k * 0.85, z0]); }
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + seed + 0.2, k = 0.8 + 0.2 * Math.cos(seed * 2 + i * 1.7); V.push([cx0 + dx + Math.cos(a) * r1 * k, cy0 + dy + Math.sin(a) * r1 * k * 0.85, z1 - 2 * Math.sin(i + seed)]); }
        const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => n + i)];
        for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
        return ISO.poly(V, F, P, "mid");
      };
      out.push(`<g data-name="rock" style="${ROCK}">${chunk(-6, 2, ZT, ZT + 12, 42, 36, 0.3)}${chunk(-2, 0, ZT + 12, ZT + 18, 34, 26, 1.1, 1, -1)}${chunk(18, -10, ZT + 10, ZT + 16, 14, 9, 2.2)}</g>`);
      g.innerHTML = out.join("") + `<g data-name="crystals" data-part="crystals"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const tint = ISO.tint(LAB.mix(m.col, "#ffffff", 0.35), [LAB.mix(m.col, "#000000", 0.25), LAB.mix(m.col, "#000000", 0.12), m.col, LAB.mix(m.col, "#ffffff", 0.15)], m.ink);
      const items = SET.map(([x, y, z, lean, head, len, r, spin, delay]) => ({ o: [x, y, z], f: frame3(0, lean, head), len, r, spin, delay }));
      const order = items.slice().sort((a, b) => K.depthOf(at(a.o, a.f, a.len / 2, 0, 0), P) - K.depthOf(at(b.o, b.f, b.len / 2, 0, 0), P));
      const sizeOf = (it, gq) => ISO.ease(ISO.clamp((gq - it.delay) / (1 - it.delay), 0, 1));
      const draw = () => {
        const gq = Math.round(st.grow * 100) / 100;
        w.rebuild(el.crystals, String(gq), () => `<g style="${tint}">${order.map((it) => {
          const f = 0.12 + 0.88 * sizeOf(it, gq), len = it.len * f, r = it.r * (0.35 + 0.65 * f);
          return m.shape === "hex" ? hexSolid(P, it.o, it.f, len, r, it.spin) : m.shape === "cube" ? blockSolid(P, it.o, it.f, Math.max(r * 2.3, len * 0.42), r * 1.1, it.spin, 0) : blockSolid(P, it.o, it.f, len * 0.55, r * 1.05, it.spin, 0.32);
        }).join("")}</g>`);
        if (lab) w.rebuild(el.words, "w", () => LAB.word(P, lab, [0, 0, m.shape === "hex" ? 104 : 86], m.name, m.ink, { size: 14 }));
        if (st.litDrawn !== st.lit || el.crystals._fresh) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => { if (p.grow !== undefined) st.want = ISO.clamp(+p.grow, 0, 1); if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        st.grow = calm ? st.want : st.grow + Math.sign(st.want - st.grow) * Math.min(Math.abs(st.want - st.grow), dt * 0.3);
        draw();
        return st.grow !== st.want;
      };
      g.readout = () => {
        const big = items[0], f = 0.12 + 0.88 * sizeOf(big, st.grow), mm = m.shape === "hex" ? big.len * f : m.shape === "cube" ? Math.max(big.r * 2.3, big.len * 0.42 * f) : big.len * 0.55 * f;
        return `${m.name} · ${m.say} · largest crystal about ${Math.round(mm)} mm${st.grow < 1 ? " · growing a layer of particles at a time" : ""}`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
