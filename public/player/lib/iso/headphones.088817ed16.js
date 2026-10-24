// "headphones cx cy width open=0..1 play=0|1 lab=1 lit=headband|cushion|cup|driver|diaphragm|coil|magnet" — over-ear
// headphones resting on a stand. The headband (a sprung band over a leather pad) rests on the stand's padded saddle;
// at each end a steel slider runs into the yoke, a fork that holds the ear cup on two pivots. Each cup: the plastic
// shell with an aluminium cap, the baffle plate carrying the driver, and the leather ear cushion. On the far cup you
// see into the cushion: the fabric over the driver. open=1 cuts the near cup through its middle: the 40 mm driver in
// the baffle, its thin dome diaphragm with the voice coil glued behind it, hanging in the gap of the magnet (a
// neodymium disc, pole plate and steel pot). play=1 sends music through the coil and the diaphragm moves.
// set({ open, play, lit }). 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const ZC = 110, XI = 60, BX = 94, BZ = 182, BH = 86;                   // cup axis height, cushion face, band arc
  const M = {
    shell: [["#262a30", "#5a6068"], "#40454c", "#101215"], leather: [["#2a2b2f", "#6a6c72"], "#4a4c52", "#121214"],
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], film: [["#9db6c6", "#eef6fb"], "#d4e5ef", "#3f6178"],
    alu: [["#a9aeb5", "#eceef1"], "#d6d9dd", "#4a5058"],
  };
  // a section face in the plane y = 0 through the near cup's axis, in (s out from the cushion face, r from the axis)
  const sec = (P, pts, m) => ISO.prismY(P, pts.map(([s, r]) => [XI + s, ZC + r]), -1.2, 0, ...M[m]);
  const both = (P, pts, m) => sec(P, pts, m) + sec(P, pts.map(([s, r]) => [s, -r]), m);
  const rect = (s0, s1, r0, r1) => [[s0, r0], [s1, r0], [s1, r1], [s0, r1]];
  const SHELL = [[20, 52], [32, 52], [42, 46], [50, 32], [50, 29.5], [40, 43.5], [30, 49.5], [22, 49.5], [22, 22], [20, 22]];
  const CUSH = [...ISO.arc(4, 46, 4, Math.PI, Math.PI / 2, 4), ...ISO.arc(18, 46, 4, Math.PI / 2, 0, 4), [20, 30], ...ISO.arc(4, 34, 4, -Math.PI / 2, -Math.PI, 4)];
  const DOME = [...ISO.arc(58.5, 0, 42.5, 2.705, 3.578, 16), ...ISO.arc(58.5, 0, 41.7, 3.578, 2.705, 16)];
  const band = (t, n) => [BX * Math.sin(t) + n * Math.sin(t), BZ + BH * Math.cos(t) + n * Math.cos(t)];   // n: out along the normal (an approximation for an ellipse)

  ISO.add({
    name: "headphones", title: "Over-ear headphones", compare: "headphones 480 270 400",
    about: "Over-ear headphones on a stand: cut the near ear cup open to see the driver (a thin diaphragm with a coil behind it, in a magnet's gap), then play music and the diaphragm moves the air by your ear.",
    line: "headphones cx cy width open=0..1 play=0|1 lab=1 lit=headband|cushion|cup|driver|diaphragm|coil|magnet",
    demo: { line: "headphones 480 270 400", script: [{ set: { open: 1 }, hold: "settle" }, { set: { play: 1 }, hold: 3 }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 1.26;
      const BASE = { x: -80, y: -60, w: 160, d: 120, r: 50 };
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 0), [-XI - 56, 0, ZC - 55], [XI + 56, 0, ZC - 55], [-BX - 8, 0, BZ + BH + 8], [BX + 8, 0, BZ + BH + 8], [0, 58, ZC], [0, -58, ZC]], cx, cy, W, H, { azimuth: 62, elevation: 20, pad: size * 0.04 }, parent);
      const S = T.S, box = (x, y, z, tone = "mid", c = T.C.dark) => T.box(P, x, y, z, tone, c);
      const out = [];
      // ── the stand: base slab on rubber feet, the post, the padded saddle the band rests on
      out.push(`<path class="iso-halo" d="${K.haloOf(BASE, 0, 4, P)}"/>`, T.slab(P, BASE, 4, 10, "lo", T.C.dark, 12, 1));
      out.push(T.L(K.planOutline(K.insetPlan(BASE, 5), 14, P, 12), { tone: "faint" }));
      const post = BZ + BH - 9 - 12;
      out.push(T.cyl(P, 0, 0, 12, 14, 4, "mid", T.C.alu, 28), T.cyl(P, 0, 0, 7, 18, post - 18, "hi", T.C.alu, 24));
      out.push(T.slab(P, { x: -22, y: -16, w: 44, d: 32, r: 6 }, post, 12, "mid", T.C.rubber, 6, 1.5));
      // ── a cup assembly on side sg (+1 near, -1 far): yoke arms and top bar, pivots, slider, and the cup itself
      const cupF = (sg) => G.frameAlong([sg * XI, 0, ZC], [sg, 0, 0]);
      const arm = (sg, side) => box(sg > 0 ? [BX - 6, BX + 6] : [-BX - 6, -BX + 6], side > 0 ? [53, 59] : [-59, -53], [ZC - 6, 172]) +
        ISO.tinted(T.C.steel, S(G.disc(side * 51, side * 53, 5, G.frameAlong([sg * BX, 0, ZC], [0, 1, 0]), P), { tone: "mid" }));
      const top = (sg) => box(sg > 0 ? [BX - 6, BX + 6] : [-BX - 6, -BX + 6], [-59, 59], [172, 178]) + T.box(P, sg > 0 ? [BX - 2, BX + 2] : [-BX - 2, -BX + 2], [-10, 10], [178, BZ + 1], "hi", T.C.steel) +
        T.dot(P, [0, 1, 2].map((i) => [sg * (BX + 2.02), 0, 179 + i * 1.6]), 0.4);
      const cup = (sg) => {
        const F = cupF(sg), s = [];
        s.push(ISO.tinted(T.C.dark, S(G.lathe([[20, 0], [20, 52], [32, 52, 1], [42, 46, 1], [50, 32], [50, 0]], F, P, { steps: 64 }), { tone: "mid", inner: `<path d="${G.arcOf(F, 26, 52, P)}" fill="none" stroke="#5a6068" stroke-width=".6"/>` })));
        s.push(ISO.tinted(T.C.alu, S(G.lathe([[50, 0], [50, 30], [53, 28, 1], [55, 20, 1], [56, 0]], F, P, { steps: 56 }), { tone: "hi" })));
        // the far cup shows its cushion face: the fabric over the driver inside the cushion's ring
        if (sg < 0) s.push(`<path d="${G.circleOf(F, 0.2, 30, P)}" fill="#3a3d42" stroke="#121214" stroke-width=".6"/><path d="${G.circleOf(F, 0.25, 18, P)}" fill="none" stroke="#5a5f66" stroke-width=".5"/>`);
        s.push(ISO.tinted(T.C.rubber, S(G.lathe([[20, 30], [2, 30], [0, 34, 1], [0, 46, 1], [2, 50], [20, 50]], F, P, { steps: 64 }), { tone: "mid" })));
        return s.join("");
      };
      // (ISO.poly pieces aren't recorded by audit.mjs, so everything hanging from the band, yokes, sliders and cups,
      // reads as loose there: it rests on the stand through the band)
      // ── the headband: 22 pieces of sprung band over the leather pad, each a true slice of the arc, sorted by depth
      const pieces = [];
      const N = 22;
      for (let i = 0; i < N; i++) {
        const t0 = -Math.PI / 2 + (i / N) * Math.PI, t1 = -Math.PI / 2 + ((i + 1) / N) * Math.PI;
        const slice = (n0, n1, wy, c, tone) => {
          const V = [];
          for (const [tt, n] of [[t0, n0], [t1, n0], [t1, n1], [t0, n1]]) { const [x, z] = band(tt, n); V.push([x, -wy, z]); }
          for (const [tt, n] of [[t0, n0], [t1, n0], [t1, n1], [t0, n1]]) { const [x, z] = band(tt, n); V.push([x, wy, z]); }
          return ISO.tinted(c, ISO.poly(V, ISO.BOX_F, P, tone));
        };
        const [mx, mz] = band((t0 + t1) / 2, 0);
        pieces.push({ k: K.depthOf([mx, 0, mz - 4], P), svg: slice(-9, -1, 15, T.C.rubber, "mid") });
        pieces.push({ k: K.depthOf([mx, 0, mz + 1], P) + 0.01, svg: slice(-1, 4, 19, T.C.dark, "hi") });
      }
      pieces.sort((a, b) => a.k - b.k);
      // ── the near cup cut open: far half of the cushion's bore and of the shell's inside, then the section faces
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [XI + s, r * Math.cos(a), ZC + r * Math.sin(a)]; });
      const fill = (a, b, f, st) => `<path d="${K.pathOf([...a, ...b.reverse()].map((p) => K.iso(p, P)), true)}" fill="${f}" stroke="${st}" stroke-width=".5"/>`;
      const cutCup = [fill(halfRing(20, 52), halfRing(50, 32), "#40454c", "#101215"), fill(halfRing(22, 49.5), halfRing(50, 29.5), "#8a8f96", "#2a2e33"), fill(halfRing(0, 30), halfRing(20, 30), "#5f6167", "#121214")];
      cutCup.push(`<g data-name="cushion">${both(P, CUSH, "leather")}</g>`, `<g data-name="cup">${both(P, SHELL, "shell")}${both(P, [[50, 30], [53, 28], [55, 20], [56, 0], [54, 0], [53, 19], [51.5, 27], [50, 28]], "alu")}</g>`);
      cutCup.push(`<g data-name="driver">${both(P, rect(19, 22, 18, 22), "shell")}${sec(P, [[21, 11.5], [32, 11.5], [32, -11.5], [21, -11.5], [21, -10], [30, -10], [30, 10], [21, 10]], "steel")}</g>`);
      cutCup.push(`<g data-name="magnet">${sec(P, rect(24, 30, -5, 5), "magnet")}${sec(P, rect(22, 24, -5.8, 5.8), "steel")}</g>`);
      cutCup.push(`<g data-part="mov"><g data-name="coil">${both(P, rect(18.8, 26, 6.4, 8.2), "copper")}</g><g data-name="diaphragm">${sec(P, DOME, "film")}${both(P, [[19, 17], [19, 19], [20, 19], [20, 17]], "film")}</g></g>`);
      out.push(`<g data-name="cup">${arm(-1, -1)}${cup(-1)}${arm(-1, 1)}${top(-1)}</g>`);
      out.push(`<g data-name="headband">${pieces.map((p) => p.svg).join("")}</g>`);
      out.push(`<g>${arm(1, -1)}${top(1)}</g><g data-part="cut">${cutCup.join("")}</g><g data-part="whole"><g data-name="cup">${cup(1)}${arm(1, 1)}</g></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const st = { open: ISO.clamp(ISO.num(o, "open", 0), 0, 1), openT: 0, play: o.play === "1", amp: 0, ph: 0, lit: o.lit || "" };
      st.openT = st.open;
      const draw = () => {
        w.attr(el.whole, "opacity", (1 - ISO.smooth(0, 0.6, st.open)).toFixed(2)); w.shown(el.whole, st.open < 0.6);
        w.attr(el.cut, "opacity", ISO.smooth(0.3, 1, st.open).toFixed(2)); w.shown(el.cut, st.open > 0.3);
        // beat-like motion: a fast wiggle under a slower swell
        w.attr(el.mov, "transform", K.translateAlong(P, [st.amp * Math.sin(st.ph) * (0.6 + 0.4 * Math.sin(st.ph * 0.23)) * 1.4, 0, 0]));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const open = st.open > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : [
          T.word(P, [0, 0, BZ + BH + 5], "headband", { dy: -10 }), T.word(P, [-BX - 6, 0, 176], "slider", { anchor: "end", dx: -10 }),
          ...(open ? [T.word(P, [XI + 16, 0, ZC + 12], "diaphragm", { anchor: "end", dx: -10, dy: -16 }), T.word(P, [XI + 24, 0, ZC - 8], "coil", { color: "#8f4a1c", anchor: "end", dx: -14, dy: 18 }),
            T.word(P, [XI + 32, 0, ZC], "magnet", { anchor: "start", dx: 44 }), T.word(P, [XI + 10, 0, ZC - 50], "ear cushion", { anchor: "end", dx: -6, dy: 16 })]
            : [T.word(P, [XI + 56, 0, ZC], "ear cup", { anchor: "start", dx: 12 }), T.word(P, [-XI, 0, ZC - 52], "cushion", { dy: 18 })]),
        ].join(""));
      };
      g.set = (p) => {
        if (p.open !== undefined) st.openT = ISO.clamp(+p.open, 0, 1);
        if (p.play !== undefined) st.play = !!+p.play;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // Music is shown slowed (the diaphragm really moves 20 to 20 000 times a second) and its travel drawn large.
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.openT, dt, 0.3, calm); if (Math.abs(st.open - st.openT) < 0.002) st.open = st.openT;
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.3, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) st.ph += dt * Math.PI * 5;
        draw();
        return st.open !== st.openT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "playing · the music's current flows in the voice coil; in the magnet's field that pushes the coil and the diaphragm back and forth, 20 to 20 000 times a second (shown slowed), and it moves the air by your ear"
        : st.open > 0.5 ? "near cup cut open · a 40 mm driver: the diaphragm on the front, the voice coil glued behind it, hanging in the magnet's narrow gap" : "over-ear headphones on a stand");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
