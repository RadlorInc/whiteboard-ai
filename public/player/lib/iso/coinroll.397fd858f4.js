// "coinroll cx cy k torn=0..1 metal=bronze|silver|gold lab=0 lit=wrapper|coins" — a PART (batch 6, money): a bank's
// paper-wrapped roll of 40 coins standing on a table, its origin the table point under its middle. 2.6 cm across,
// 9 cm tall: 40 coins of 2.4 cm × 2 mm (8 cm) in a paper wrapper whose ends are crimped over the end coins, the count
// and the total printed round it. torn 0 → 1 tears the top end off and the wrapper back down 3.5 cm, showing the
// coins' milled edges. set({ torn }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 1.3, RC = 1.2, H = 9, C0 = 0.5, C1 = 8.5, METALS = ["bronze", "silver", "gold"];
  const WRAP = { bronze: "#d98c6a", silver: "#8fb3d9", gold: "#7fb87a" };
  ISO.add({
    name: "coinroll", title: "Coin roll (part)", compare: null,
    about: "A bank's paper-wrapped roll of 40 generic coins, 2.6 × 9 cm, crimped ends, the count printed on it; torn tears the top open to show the coins' edges. anchors: top",
    line: "coinroll cx cy k torn=0..1 metal=bronze|silver|gold lab=0 lit=wrapper|coins",
    demo: { line: "coinroll 480 430 34 torn=0 metal=gold lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "wrapper" }, hold: 1 }, { set: { torn: 1, lit: "coins" }, hold: "settle" }, { set: { torn: 0.4, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { torn: A.num(o, "torn", 0, 0, 1), metal: A.pick(o.metal, METALS, "gold"), lit: o.lit || "" };
      st.want = st.torn;
      const F = LAB.Z([0, 0, 0]), view = G.viewOf(P), face = G.angleToward(F, view);
      const PT = A.tintOf(WRAP[st.metal]), ink = A.mix(WRAP[st.metal], "#000000", 0.55), CT = A.METAL[st.metal], CI = A.METAL_INK[st.metal];
      // printed round the wrapper on the side toward the camera: the count, a rule, the total (plain numbers)
      const tg = G.tangentOf(F, face).map((q) => -q), at = (z) => { const p = G.pointOf(F, z, R + 0.01, face); return p; };
      const value = { bronze: 2, silver: 10, gold: 50 }[st.metal];
      const print = (zt) => {
        let s = "";
        const rows = [[6.4, "40 coins", 0.55], [5.4, `of ${value}`, 0.45], [3.2, `= ${40 * value}`, 0.6]];
        for (const [z, txt, sz] of rows) if (z + 0.4 < zt) s += B.face(P, at(z), tg, [0, 0, 1], txt, sz, ink);
        const bands = [7.4, 2.2].filter((z) => z < zt).map((z) => K.sideArc(0, 0, R + 0.01, z, P, 28));
        if (bands.length) s += `<path data-free d="${bands.join("")}" fill="none" stroke="${ink}" stroke-width="0.6" opacity=".6"/>`;
        return s;
      };
      // the crimp: a short cone of folded paper over the end coin, its pleats running to a small hole
      const crimp = (top) => {
        const s0 = top ? C1 : C0, s1 = top ? H : 0, Fc = LAB.Z([0, 0, 0]);
        let s = ISO.tinted(PT, S(G.solidOf([[Math.min(s0, s1), top ? R : 0.95], [Math.max(s0, s1), top ? 0.95 : R]], Fc, P, { steps: 32 }), { tone: "mid" }));
        if (top) {
          const segs = [];
          for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; segs.push([[Math.cos(a) * 0.4, Math.sin(a) * 0.4, H + 0.003], [Math.cos(a + 0.12) * 0.93, Math.sin(a + 0.12) * 0.93, H + 0.003]]); }
          s += B.free(P, segs, ink, 0.45, ' opacity=".55"');
          s += `<path d="${G.circleOf(Fc, H + 0.004, 0.4, P)}" fill="${A.mix(WRAP[st.metal] === "#8fb3d9" ? "#c7c9cd" : "#e2c986", "#ffffff", 0.1)}" stroke="${CI}" stroke-width="0.5"/>`;
        }
        return s;
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R - 0.2, y: -R - 0.2, w: 2 * R + 0.4, d: 2 * R + 0.4, r: R }, 0, H, P)}"/>` +
        `<g data-name="wrapper">${crimp(false)}</g><g data-part="roll"></g><g data-part="words"></g>`;
      const el = B.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.torn * 120) / 120, zt = q > 0 ? C1 - q * 3.5 : C1;
        w.rebuild(el.roll, `${q}`, () => {
          // wrapper to the tear, then the coins above it, then the paper's torn teeth in front of them
          let s = `<g data-name="wrapper">${ISO.tinted(PT, S(G.solidOf([[C0, R], [zt, R]], F, P, { steps: 32 }), { tone: "mid" }))}${print(zt)}</g>`;
          if (q === 0) return s + `<g data-name="wrapper">${crimp(true)}</g>`;
          s += `<g data-name="coins">${B.coinPile(P, 0, 0, RC, zt - 0.005, C1 - zt + 0.005, CT, CI)}</g>`;
          const teeth = [], n = 18;
          for (let i = 0; i < n; i++) {
            const a0 = face - Math.PI / 2 + (i / n) * Math.PI, a1 = face - Math.PI / 2 + ((i + 1) / n) * Math.PI, am = (a0 + a1) / 2, hgt = 0.18 + 0.22 * Math.abs(Math.sin(i * 2.7 + 1.3));
            const p0 = G.pointOf(F, zt - 0.01, R, a0), p1 = G.pointOf(F, zt - 0.01, R, a1), pm = G.pointOf(F, zt + hgt, R, am);
            teeth.push(K.pathOf([p0, pm, p1].map((p) => K.iso(p, P)), true));
          }
          return s + `<g data-name="wrapper"><path d="${teeth.join("")}" fill="${A.mix(WRAP[st.metal], "#ffffff", 0.25)}" stroke="${ink}" stroke-width="0.5" stroke-linejoin="round"/></g>`;
        });
        g.anchors = { top: [0, 0, q > 0 ? C1 : H] };
        if (lab) w.rebuild(el.words, `${st.want > 0.05}`, () => B.word(P, [R, 0, H - 0.5], st.want > 0.05 ? "torn open: 40 coins" : "coin roll, 40 coins"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.torn !== undefined) st.want = A.num(p, "torn", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.torn = ISO.follow(st.torn, st.want, dt, 0.3, ISO.still());
        if (Math.abs(st.torn - st.want) < 0.003) st.torn = st.want;
        draw();
        return st.torn !== st.want;
      };
      g.readout = () => `roll of 40 coins of ${value} = ${40 * value} · ${st.want > 0.05 ? "wrapper torn" : "sealed"}`;
      draw();
      return g;
    },
  });
})();
