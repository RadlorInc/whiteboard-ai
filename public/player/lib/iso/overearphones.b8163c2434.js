// "overearphones cx cy k open=0..1 play=0|1 lab=0 lit=…" — a PART (b34): the over-ear headphones of headphones.js at
// real size, hanging: its origin the underside of the headband's top, the point that rests on a stand's saddle
// (at=stand.saddle on a phonestand) or on a hook. A sprung band over a leather pad; at each end a steel slider into the
// yoke, the fork holding the ear cup on two pivots; each cup a plastic shell, an aluminium cap, the baffle and the
// leather cushion. open=1 cuts the near cup (+x) through its middle: the 40 mm driver, its dome diaphragm with the voice
// coil glued behind it in the gap of the magnet (neodymium disc, pole plate, steel pot). play=1 sends music through the
// coil: the diaphragm moves (shown slowed). Anchors: `near` / `far` = the middle of each cushion's face. Built in mm.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const ZC = 110, XI = 60, BX = 94, BZ = 182, BH = 86, TOP = BZ + BH - 9;
  const M = {
    shell: [["#262a30", "#5a6068"], "#40454c", "#101215"], leather: [["#2a2b2f", "#6a6c72"], "#4a4c52", "#121214"],
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], film: [["#9db6c6", "#eef6fb"], "#d4e5ef", "#3f6178"],
    alu: [["#a9aeb5", "#eceef1"], "#d6d9dd", "#4a5058"],
  };
  const sec = (P, pts, m) => ISO.prismY(P, pts.map(([s, r]) => [XI + s, ZC + r]), -1.2, 0, ...M[m]);
  const both = (P, pts, m) => sec(P, pts, m) + sec(P, pts.map(([s, r]) => [s, -r]), m);
  const rect = (s0, s1, r0, r1) => [[s0, r0], [s1, r0], [s1, r1], [s0, r1]];
  const SHELL = [[20, 52], [32, 52], [42, 46], [50, 32], [50, 29.5], [40, 43.5], [30, 49.5], [22, 49.5], [22, 22], [20, 22]];
  const CUSH = [...ISO.arc(4, 46, 4, Math.PI, Math.PI / 2, 4), ...ISO.arc(18, 46, 4, Math.PI / 2, 0, 4), [20, 30], ...ISO.arc(4, 34, 4, -Math.PI / 2, -Math.PI, 4)];
  const DOME = [...ISO.arc(58.5, 0, 42.5, 2.705, 3.578, 16), ...ISO.arc(58.5, 0, 41.7, 3.578, 2.705, 16)];
  const band = (t, n) => [BX * Math.sin(t) + n * Math.sin(t), BZ + BH * Math.cos(t) + n * Math.cos(t)];

  ISO.add({
    name: "overearphones", title: "Over-ear headphones (part)", compare: null,
    about: "Over-ear headphones hanging by their band: cut the near ear cup open to see the 40 mm driver (a thin diaphragm with a voice coil behind it, in a magnet's gap), then play music and the diaphragm moves the air. anchors: near far",
    line: "overearphones cx cy k open=0..1 play=0|1 lab=0 lit=headband|slider|cushion|cup|driver|diaphragm|coil|magnet",
    demo: { line: "overearphones 480 120 15 lab=1", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { play: 1, lit: "diaphragm" }, hold: 3 }, { set: { play: 0, open: 0, lit: "headband" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), Q = B34.shift(Pm, [0, 0, TOP]), lab = o.lab === "1";
      const S = T.S, box = (x, y, z, tone = "mid", c = T.C.dark) => T.box(Q, x, y, z, tone, c);
      const cupF = (sg) => G.frameAlong([sg * XI, 0, ZC], [sg, 0, 0]);
      const arm = (sg, side) => box(sg > 0 ? [BX - 6, BX + 6] : [-BX - 6, -BX + 6], side > 0 ? [53, 59] : [-59, -53], [ZC - 6, 172]) +
        ISO.tinted(T.C.steel, S(G.disc(side * 51, side * 53, 5, G.frameAlong([sg * BX, 0, ZC], [0, 1, 0]), Q), { tone: "mid" }));
      const top = (sg) => box(sg > 0 ? [BX - 6, BX + 6] : [-BX - 6, -BX + 6], [-59, 59], [172, 178]) + `<g data-name="slider">${T.box(Q, sg > 0 ? [BX - 2, BX + 2] : [-BX - 2, -BX + 2], [-10, 10], [178, BZ + 1], "hi", T.C.steel)}` +
        T.dot(Q, [0, 1, 2].map((i) => [sg * (BX + 2.02), 0, 179 + i * 1.6]), 0.4) + "</g>";
      const cup = (sg) => {
        const F = cupF(sg), s = [];
        s.push(ISO.tinted(T.C.dark, S(G.lathe([[20, 0], [20, 52], [32, 52, 1], [42, 46, 1], [50, 32], [50, 0]], F, Q, { steps: 64 }), { tone: "mid", inner: `<path d="${G.arcOf(F, 26, 52, Q)}" fill="none" stroke="#5a6068" stroke-width=".6"/>` })));
        s.push(ISO.tinted(T.C.alu, S(G.lathe([[50, 0], [50, 30], [53, 28, 1], [55, 20, 1], [56, 0]], F, Q, { steps: 56 }), { tone: "hi" })));
        if (sg < 0) s.push(`<path d="${G.circleOf(F, 0.2, 30, Q)}" fill="#3a3d42" stroke="#121214" stroke-width=".6"/><path d="${G.circleOf(F, 0.25, 18, Q)}" fill="none" stroke="#5a5f66" stroke-width=".5"/>`);
        s.push(`<g data-name="cushion">${ISO.tinted(T.C.rubber, S(G.lathe([[20, 30], [2, 30], [0, 34, 1], [0, 46, 1], [2, 50], [20, 50]], F, Q, { steps: 64 }), { tone: "mid" }))}</g>`);
        return s.join("");
      };
      // the headband: 22 true slices of the arc (band over its pad), sorted by depth
      const bandSvg = () => {
      const pieces = [], N = 22;
      for (let i = 0; i < N; i++) {
        const t0 = -Math.PI / 2 + (i / N) * Math.PI, t1 = -Math.PI / 2 + ((i + 1) / N) * Math.PI;
        const slice = (n0, n1, wy, c, tone) => {
          const V = [];
          for (const wv of [-wy, wy]) for (const [tt, n] of [[t0, n0], [t1, n0], [t1, n1], [t0, n1]]) { const [x, z] = band(tt, n); V.push([x, wv, z]); }
          return ISO.tinted(c, ISO.poly(V, ISO.BOX_F, Q, tone));
        };
        const [mx, mz] = band((t0 + t1) / 2, 0);
        pieces.push({ k: K.depthOf([mx, 0, mz - 4], Q), svg: slice(-9, -1, 15, T.C.rubber, "mid") }, { k: K.depthOf([mx, 0, mz + 1], Q) + 0.01, svg: slice(-1, 4, 19, T.C.dark, "hi") });
      }
      pieces.sort((a, b) => a.k - b.k);
      return pieces.map((p) => p.svg).join("");
      };
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [XI + s, r * Math.cos(a), ZC + r * Math.sin(a)]; });
      const fill = (a, b, f, st) => `<path d="${K.pathOf([...a, ...b.reverse()].map((p) => K.iso(p, Q)), true)}" fill="${f}" stroke="${st}" stroke-width=".5"/>`;
      const cutSvg = () => {
      const cutCup = [fill(halfRing(20, 52), halfRing(50, 32), "#40454c", "#101215"), fill(halfRing(22, 49.5), halfRing(50, 29.5), "#8a8f96", "#2a2e33"), fill(halfRing(0, 30), halfRing(20, 30), "#5f6167", "#121214")];
      cutCup.push(`<g data-name="cushion">${both(Q, CUSH, "leather")}</g>`, `<g data-name="cup">${both(Q, SHELL, "shell")}${both(Q, [[50, 30], [53, 28], [55, 20], [56, 0], [54, 0], [53, 19], [51.5, 27], [50, 28]], "alu")}</g>`);
      cutCup.push(`<g data-name="driver">${both(Q, rect(19, 22, 18, 22), "shell")}${sec(Q, [[21, 11.5], [32, 11.5], [32, -11.5], [21, -11.5], [21, -10], [30, -10], [30, 10], [21, 10]], "steel")}</g>`);
      cutCup.push(`<g data-name="magnet">${sec(Q, rect(24, 30, -5, 5), "magnet")}${sec(Q, rect(22, 24, -5.8, 5.8), "steel")}</g>`);
      cutCup.push(`<g data-part="mov"><g data-name="coil">${both(Q, rect(18.8, 26, 6.4, 8.2), "copper")}</g><g data-name="diaphragm">${sec(Q, DOME, "film")}${both(Q, [[19, 17], [19, 19], [20, 19], [20, 17]], "film")}</g></g>`);
      return cutCup.join("");
      };
      // built in four parts (ISO.later), each inside the phone's build budget: far cup, band, near yoke + cup, the cut
      g.innerHTML = `<g data-name="cup" data-part="far"></g><g data-name="headband" data-part="band"></g><g data-name="cup" data-part="yoke"></g><g data-part="cut"></g><g data-part="whole"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      ISO.later(() => { el.far.innerHTML = arm(-1, -1) + cup(-1) + arm(-1, 1) + top(-1); });
      ISO.later(() => { el.band.innerHTML = bandSvg(); });
      ISO.later(() => { el.yoke.innerHTML = arm(1, -1) + top(1); el.whole.innerHTML = `<g data-name="cup">${cup(1)}${arm(1, 1)}</g>`; });
      ISO.later(() => { el.cut.innerHTML = cutSvg(); el.mov = el.cut.querySelector('[data-part="mov"]'); });
      const cm = (p) => [p[0] / 10, p[1] / 10, +((p[2] - TOP) / 10).toFixed(2)];
      g.anchors = { near: cm([XI, 0, ZC]), far: cm([-XI, 0, ZC]) };
      const st = { open: B34.num(o.open, 0, 0, 1), openT: 0, play: o.play === "1", amp: 0, ph: 0, lit: o.lit || "" };
      st.openT = st.open;
      const draw = () => {
        w.attr(el.whole, "opacity", (1 - ISO.smooth(0, 0.6, st.open)).toFixed(2)); w.shown(el.whole, st.open < 0.6);
        w.attr(el.cut, "opacity", ISO.smooth(0.3, 1, st.open).toFixed(2)); w.shown(el.cut, st.open > 0.3);
        if (el.mov) w.attr(el.mov, "transform", K.translateAlong(Q, [st.amp * Math.sin(st.ph) * (0.6 + 0.4 * Math.sin(st.ph * 0.23)) * 1.4, 0, 0]));
        B34.light(w, g, st.lit);
        const open = st.open > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : [
          T.word(Q, [0, 0, BZ + BH + 5], "headband", { dy: -10 }), T.word(Q, [-BX - 6, 0, 176], "slider", { anchor: "end", dx: -10 }),
          ...(open ? [T.word(Q, [XI + 16, 0, ZC + 12], "diaphragm", { anchor: "end", dx: -10, dy: -16 }), T.word(Q, [XI + 24, 0, ZC - 8], "coil", { color: "#8f4a1c", anchor: "end", dx: -14, dy: 18 }),
            T.word(Q, [XI + 32, 0, ZC], "magnet", { anchor: "start", dx: 44 }), T.word(Q, [XI + 10, 0, ZC - 50], "ear cushion", { anchor: "end", dx: -6, dy: 16 })]
            : [T.word(Q, [XI + 56, 0, ZC], "ear cup", { anchor: "start", dx: 12 }), T.word(Q, [-XI, 0, ZC - 52], "cushion", { dy: 18 })]),
        ].join(""));
      };
      g.set = (p) => {
        if (p.open !== undefined) st.openT = B34.num(p.open, st.openT, 0, 1);
        if (p.play !== undefined) st.play = String(p.play) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // music shown slowed (the diaphragm really moves 20 to 20 000 times a second) and its travel drawn large
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.openT, dt, 0.3, calm); if (Math.abs(st.open - st.openT) < 0.002) st.open = st.openT;
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.3, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) st.ph += dt * Math.PI * 5;
        draw();
        return st.open !== st.openT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "playing · the music's current flows in the voice coil; in the magnet's field that pushes the coil and the diaphragm back and forth, 20 to 20 000 times a second (shown slowed), and it moves the air by your ear"
        : st.open > 0.5 ? "near cup cut open · a 40 mm driver: the diaphragm on the front, the voice coil glued behind it, hanging in the magnet's narrow gap" : "over-ear headphones · 40 mm drivers in closed ear cups");
      draw();
      return g;
    },
  });
})();
