// "marblechips cx cy k n=1..20 fizz=0..1 rise=1..15 lab=0 lit=chips|bubbles" — a PART (PARTS.md, batch 5): a small
// heap of marble chips (calcium carbonate, CaCO₃) lying on a surface — the floor of a flask of acid (gasbubbles.js) —
// its origin the surface point under the heap's middle. n chips, each an irregular lump about 6 × 6 × 4.5 mm, white
// with grey flecks and a few grey veins, lying in one layer. fizz = how fast they react with the acid
// (CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂): carbon-dioxide bubbles form on the chips and stream up `rise` cm (to the acid's
// surface), more and faster as fizz grows, eased; 0 = no acid or used up. set({ fizz, n }). Built in mm; anchors in
// cm: `top` = the top of the heap's middle.
(() => {
  const K = window.K, G = window.G;
  const MARBLE = ISO.tint("#f5f3ee", ["#b9b6ae", "#cac7bf", "#dcd9d2", "#ebe9e3"], "#5f5b53");
  // one chip's shape (unit size, in its own frame): a 7-point bottom ring, a 5-point top ring and a peak
  const CHIP = (() => {
    const V = [], F = [];
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, r = 0.5 * (0.82 + 0.3 * ((i * 0.618) % 1)); V.push([Math.cos(a) * r, Math.sin(a) * r * 0.92, 0.04 + 0.06 * ((i * 0.37) % 1)]); }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.4, r = 0.4 * (0.7 + 0.45 * ((i * 0.754) % 1)); V.push([Math.cos(a) * r + 0.05, Math.sin(a) * r, 0.62 + 0.16 * ((i * 0.41) % 1)]); }
    V.push([0.14, -0.08, 0.86]);
    // sides: join the 7-ring to the 5-ring by nearest angles; the top: a fan to the peak
    const near = (i) => Math.round((i / 7) * 5 - 0.4 / ((2 * Math.PI) / 5)) % 5;
    for (let i = 0; i < 7; i++) { const j = (i + 1) % 7, a = 7 + ((near(i) + 5) % 5), b = 7 + ((near(j) + 5) % 5); F.push(a === b ? [i, j, a] : [i, j, b, a]); }
    for (let i = 0; i < 5; i++) F.push([7 + i, 7 + ((i + 1) % 5), 12]);
    F.push([0, 1, 2, 3, 4, 5, 6]);
    return { V, F };
  })();

  ISO.add({
    name: "marblechips", title: "Marble chips (part)", compare: null,
    about: "A heap of marble chips (calcium carbonate) on the floor of a flask; in acid they fizz, giving off bubbles of carbon dioxide that stream up to the surface. anchors: top",
    line: "marblechips cx cy k n=1..20 fizz=0..1 rise=1..15 lab=0 lit=chips|bubbles",
    demo: { line: "marblechips 470 420 60 n=9 rise=3 lab=1", script: [{ set: {}, hold: 1 }, { set: { fizz: 1, lit: "bubbles" }, hold: 3 }, { set: { fizz: 0.3, lit: "chips" }, hold: 2.5 }, { set: { n: 14, fizz: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { n: Math.round(ISO.clamp(ISO.num(o, "n", 8), 1, 20)), f: ISO.clamp(ISO.num(o, "fizz", 0), 0, 1), rise: ISO.clamp(ISO.num(o, "rise", 4), 1, 15) * 10, clock: 0 };
      st.want = st.f;
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="chips" data-part="chips"></g><g data-name="bubbles" data-part="bubbles"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      // where each chip lies: a sunflower spread, each turned and sized a little differently
      const place = (i) => { const r = 4.7 * Math.sqrt(i + 0.3), a = i * 2.39996, u = (i * 0.618034) % 1, sz = 6 * (0.85 + 0.25 * u); return { x: Math.cos(a) * r, y: Math.sin(a) * r, rot: i * 1.7, sz, sy: sz * (1.12 - 0.3 * ((i * 0.381966) % 1)), h: 4.2 * (0.75 + 0.35 * ((i * 0.7548) % 1)) }; };
      const chipSvg = (c, i) => {
        const cs = Math.cos(c.rot), sn = Math.sin(c.rot), V = CHIP.V.map(([x, y, z]) => [c.x + x * c.sz * cs - y * c.sy * sn, c.y + x * c.sz * sn + y * c.sy * cs, (z * c.h) / 0.86]);
        const fleck = [0, 1, 2].map((j) => { const q = V[7 + ((i + j * 2) % 5)], r = V[12]; return K.iso([(q[0] * 2 + r[0]) / 3, (q[1] * 2 + r[1]) / 3, (q[2] * 2 + r[2]) / 3 + 0.05], Pm); });
        const vein = i % 3 === 0 ? `<path d="${K.pathOf([V[7], V[12], V[9]].map((p) => K.iso([p[0], p[1], p[2] + 0.04], Pm)))}" fill="none" stroke="#9a968d" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>` : "";
        return ISO.poly(V, CHIP.F, Pm, "mid") + D(fleck, { size: 0.3 }) + vein;
      };
      const heapTop = () => Math.max(...Array.from({ length: st.n }, (_, i) => place(i).h * 0.75));
      const draw = () => {
        w.rebuild(el.chips, String(st.n), () => {
          const cs = Array.from({ length: st.n }, (_, i) => ({ ...place(i), i }));
          cs.sort((a, b) => K.depthOf([a.x, a.y, 0], Pm) - K.depthOf([b.x, b.y, 0], Pm));
          return ISO.tinted(MARBLE, cs.map((c) => chipSvg(c, c.i)).join(""));
        });
        // bubbles: each chip streams some (more as fizz grows); tiny ones cling to the chips, the rest rise and grow
        const tq = Math.round(st.clock * 24) / 24, f = Math.round(st.f * 20) / 20;
        w.rebuild(el.bubbles, f > 0.02 ? `${tq} ${f} ${st.n}` : "", () => {
          if (f <= 0.02) return "";
          const out = [], speed = 0.35 + 0.65 * f;
          for (let i = 0; i < st.n; i++) {
            const c = place(i), per = Math.ceil(1 + 3 * f);
            out.push(LAB.bubble(Pm, [c.x + 1.2, c.y - 0.6, c.h * 0.7], 0.35), LAB.bubble(Pm, [c.x - 1.6, c.y + 1, c.h * 0.45], 0.3));
            for (let j = 0; j < per; j++) {
              const ph = (tq * speed * 0.9 + j / per + i * 0.37) % 1, z = c.h * 0.7 + ph * (st.rise - c.h * 0.7);
              out.push(LAB.bubble(Pm, [c.x + Math.sin(i * 3 + ph * 6) * 1.2, c.y + Math.cos(i * 2) * 0.8, z], 0.4 + ph * 0.9));
            }
          }
          return out.join("");
        });
        g.anchors = { top: [0, 0, +(heapTop() / 10).toFixed(3)] };
        if (lab) w.rebuild(el.words, String(f > 0.02), () => LAB.word(Pm, lab, [place(st.n - 1).x + 12, 0, 2], "marble chips", "#556", { anchor: "start" }) + (f > 0.02 ? LAB.word(Pm, lab, [10, 0, st.rise * 0.8], "carbon dioxide bubbles", "#2f6fae", { anchor: "start" }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fizz !== undefined && p.fizz !== "" && Number.isFinite(+p.fizz)) st.want = ISO.clamp(+p.fizz, 0, 1);
        if (p.n !== undefined && p.n !== "" && Number.isFinite(+p.n)) st.n = Math.round(ISO.clamp(+p.n, 1, 20));
        if (p.rise !== undefined && p.rise !== "" && Number.isFinite(+p.rise)) st.rise = ISO.clamp(+p.rise, 1, 15) * 10;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt, clock) => {
        st.clock = clock || st.clock + dt;
        st.f = ISO.follow(st.f, st.want, dt, 0.6, ISO.still());
        draw();
        return st.f !== st.want || st.f > 0.02;
      };
      g.readout = () => `${st.n} marble chips (calcium carbonate) · ${st.want > 0.02 ? `fizzing ${st.want > 0.6 ? "fast" : "slowly"}: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂, bubbles of carbon dioxide rise ${st.rise / 10} cm` : "no reaction (no acid, or it is used up)"}`;
      draw();
      return g;
    },
  });
})();
