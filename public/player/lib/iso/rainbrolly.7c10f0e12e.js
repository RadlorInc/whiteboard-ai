// "rainbrolly cx cy k open=0..1 c=blue|red|green|navy lab=0 lit=canopy|ribs|shaft|handle" — a PART (batch 6, money):
// a big umbrella standing upright, 90 cm tall and 110 cm across when open, its origin the floor point under the
// shaft (the handle's crook rests on the floor beside it). Eight steel ribs hinged at the top notch, eight stretchers from the runner on the shaft to each
// rib's middle, eight fabric panels in two tones sagging a little between the ribs (sorted far to near every pose),
// a tip at each rib's end, the ferrule on top, a steel shaft and a curved wooden hook handle. open 0 → 1 pushes the
// runner up the shaft and the ribs swing out from furled to fully open; it can stand over a house or goods to show
// insurance as protection. set({ open }). 1 = 1 cm.
// anchors: top (the ferrule's tip) under (the floor point under the canopy's middle, where the protected thing goes)
(() => {
  const K = window.K, G = window.G;
  const N = 8, H = 90, TOP = 84, RIB = 56, STR = 30, SHAFT_R = 0.6;
  const COL = { blue: ["#2f6fb0", "#e8f0f8"], red: ["#b8392f", "#f6e6e3"], green: ["#2f7a4a", "#e6f2ea"], navy: ["#26355e", "#e3e7f0"] };
  ISO.add({
    name: "rainbrolly", title: "Umbrella (part)", compare: null,
    about: "A big umbrella standing upright, 110 cm across open: eight ribs and stretchers, two-tone fabric panels, a runner that slides up the shaft, a ferrule and a hooked wooden handle; open furls and opens it. anchors: top under",
    line: "rainbrolly cx cy k open=0..1 c=blue|red|green|navy lab=0 lit=canopy|ribs|shaft|handle",
    demo: { line: "rainbrolly 480 440 3.6 open=1 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { open: 0, lit: "ribs" }, hold: 3 }, { set: { open: 0.5, lit: "" }, hold: 2.4 }, { set: { open: 1, lit: "canopy" }, hold: 3 }, { set: { lit: "shaft" }, hold: 1.2 }, { set: { lit: "handle" }, hold: 1.2 }] },
    make([cx = 480, cy = 440, k = 3], o, t, parent) {
      const B = window.B42, S = (p, s) => K.solidSvg(p, s);
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const [dark, pale] = COL[o.c] && Object.hasOwn(COL, o.c) ? COL[o.c] : COL.blue;
      const st = { open: B.val(o, "open", 1, 0, 1) }; st.want = st.open;
      const view = G.viewOf(P), up = G.frameAlong([0, 0, 12], [0, 0, 1]);
      // static: the handle's hook (a bent tube in the x–z plane), the shaft, the ferrule on top
      const hook = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * (i / 14); hook.push([-5 + Math.cos(a) * 5, 0, 12 - Math.sin(a) * 10.5]); }
      const sc = G.scaleOf(P), hd = K.pathOf(hook.map((p) => K.iso(p, P)));
      const hookSvg = [`<path d="${hd}" fill="none" stroke="#7a5a2e" stroke-width="${(3 * sc + 1.4).toFixed(2)}" stroke-linecap="round"/>`, `<path d="${hd}" fill="none" stroke="#e2c398" stroke-width="${(3 * sc).toFixed(2)}" stroke-linecap="round"/>`, `<path d="${hd}" fill="none" stroke="#f7e8d0" stroke-width="${(0.9 * sc).toFixed(2)}" stroke-linecap="round" transform="translate(${(-0.5 * sc).toFixed(2)} ${(-0.4 * sc).toFixed(2)})"/>`];
      const handle = ISO.tinted(ISO.T.wood, S(G.solidOf([[0, 1.6], [0.5, 1.75, 1], [9, 1.7], [10, 1.2]], up, P, { steps: 20 }), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, S(G.solidOf([[10, 1.0], [11, 1.0]], up, P, { steps: 16 }), { tone: "hi" }));
      const shaft = ISO.tinted(ISO.T.steel, S(G.solidOf([[10.5, SHAFT_R], [TOP - 12, SHAFT_R]], up, P, { steps: 12 }), { tone: "hi" }));
      const ferrule = ISO.tinted(ISO.T.steel, S(G.solidOf([[TOP - 12 + 0.5, 0.9], [TOP - 12 + 1.5, 1.1], [TOP - 12 + 4, 0.5], [H - 12, 0.25]], up, P, { steps: 14 }), { tone: "hi" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -12, y: -4, w: 16, d: 8, r: 4 }, 0, 1, P)}"/>` +
        `<g data-name="handle">${hookSvg.join("")}${handle}</g><g data-name="shaft">${shaft}<g data-part="runner"></g></g>` +
        `<g data-name="ribs"><g data-part="under"></g></g><g data-name="canopy"><g data-part="canopy"></g></g><g data-name="shaft">${ferrule}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { top: [0, 0, H], under: [0, 0, 0] };
      // geometry of a pose: rib angle from the shaft, its tip, the runner's height where the stretchers meet
      const pose = (f) => {
        const th = (6 + 74 * B.smooth(0, 1, f)) * (Math.PI / 180), top = [0, 0, TOP];
        const ribs = Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2 + Math.PI / 8, d = [Math.cos(a), Math.sin(a)];
          const at = (s) => [d[0] * Math.sin(th) * s, d[1] * Math.sin(th) * s, TOP - Math.cos(th) * s - (s / RIB) ** 2 * 6 * Math.sin(th)];
          return { a, d, at, tip: at(RIB), mid: at(RIB * 0.45) };
        });
        // the runner: a point on the shaft STR from each rib's middle
        const m = ribs[0].mid, r = Math.hypot(m[0], m[1]), runZ = m[2] - Math.sqrt(Math.max(0, STR * STR - r * r));
        return { th, top, ribs, runZ };
      };
      const draw = () => {
        const f = st.open, key = f.toFixed(3);
        const ps = pose(f);
        w.rebuild(el.canopy, key, () => {
          const { ribs, top } = ps, out = [];
          for (let i = 0; i < N; i++) {
            const A = ribs[i], Bq = ribs[(i + 1) % N];
            // a panel: top → rib A → a sagging middle → rib B; its outer edge scallops in between
            const sag = [(A.tip[0] + Bq.tip[0]) / 2 * 0.95, (A.tip[1] + Bq.tip[1]) / 2 * 0.95, (A.tip[2] + Bq.tip[2]) / 2 + 2.5 * Math.sin(ps.th)];
            const pts = [top, A.at(RIB * 0.5), A.tip, sag, Bq.tip, Bq.at(RIB * 0.5)];
            const c = [(top[0] + A.tip[0] + Bq.tip[0]) / 3, (top[1] + A.tip[1] + Bq.tip[1]) / 3, (top[2] + A.tip[2] + Bq.tip[2]) / 3];
            const u = [A.tip[0] - top[0], A.tip[1] - top[1], A.tip[2] - top[2]], v = [Bq.tip[0] - top[0], Bq.tip[1] - top[1], Bq.tip[2] - top[2]];
            let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
            if (n[2] < 0) n = n.map((x) => -x);
            const nl = Math.hypot(...n) || 1, light = ISO.clamp(0.55 + 0.45 * ((n[0] * -0.3 + n[1] * 0.2 + n[2] * 0.9) / nl), 0, 1);
            const outside = G.dot3(n, view) > 0, base = i % 2 ? pale : dark;
            const fill = `color-mix(in srgb, ${base} ${Math.round((outside ? 0.55 + 0.45 * light : 0.6) * 100)}%, #1b2230)`;
            const P2 = pts.map((p) => K.iso(p, P));
            out.push({ k: K.depthOf(c, P), svg: `<path d="M${P2[0]}L${P2[1]}L${P2[2]}Q${P2[3]} ${P2[4]}L${P2[5]}Z" fill="${fill}" stroke="#1b2230" stroke-width="0.7" stroke-linejoin="round"/>` +
              `<path d="M${P2[0]}L${P2[1]}L${P2[2]}" fill="none" stroke="#2a2f38" stroke-width="0.9"/>` });
          }
          out.sort((a, b) => a.k - b.k);
          // rib tips: small steel caps at each rib's end, drawn over the panels
          const tips = K.dotsSvg(ribs.map((r) => K.iso(r.tip, P)), { size: Math.max(0.6, 0.5 * k / 3) });
          return out.map((p) => p.svg).join("") + tips;
        });
        w.rebuild(el.under, key, () => {
          // under the canopy: the stretchers from the runner to each rib's middle (seen below the rim when partly open)
          const { ribs, runZ } = ps, pts = [];
          for (const r of ribs) pts.push(K.pathOf([K.iso([r.d[0] * SHAFT_R, r.d[1] * SHAFT_R, runZ], P), K.iso(r.mid, P)]));
          return `<path d="${pts.join("")}" stroke="#4b5058" stroke-width="0.9" fill="none"/>`;
        });
        w.rebuild(el.runner, key, () => ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, 1.3, ps.runZ - 3, 4, P, 14), { tone: "mid" })));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([60, -30, 72], P), "umbrella", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      let lit = o.lit || "";
      g.set = (p) => { st.want = B.pick(p, "open", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.open;
        st.open = ISO.follow(st.open, st.want, dt, 0.5, ISO.still());
        if (st.open !== was) draw();
        return st.open !== st.want;
      };
      g.readout = () => { const th = 6 + 74 * B.smooth(0, 1, st.want); return `umbrella · ${st.want > 0.98 ? "open" : st.want < 0.02 ? "furled" : "opening"} · ${Math.round(2 * (Math.sin((th * Math.PI) / 180) * RIB))} cm across · 90 cm tall`; };
      draw();
      return g;
    },
  });
})();
