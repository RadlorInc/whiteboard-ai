// "notebundle cx cy k count=0..100 value=1..100 band=0..1 lab=0 lit=notes|band" — a PART (batch 6, money): a stack of
// generic banknotes held by a paper band, lying flat on a table, its origin the table point under its middle. Notes
// 15 × 7 cm, each 0.12 mm, so 100 notes stand 1.2 cm; the band 3.5 cm wide with the count and value printed on it.
// count = how many notes (the pile's height follows), value = the printed value (note colour as the banknote part).
// band 0 → 1 slides the band off along +x until it stands empty beside the pile; once it is off, the top notes fan
// out round the near-left corner. set({ count, value, band }). World: 1 = 1 cm. anchors: top band
(() => {
  const K = window.K;
  const W = 15, D = 7, HW = W / 2, HD = D / 2, FAN = 6, OFF = 12.5;
  ISO.add({
    name: "notebundle", title: "Note bundle (part)", compare: null,
    about: "A stack of generic banknotes held by a paper band, 15 × 7 cm, 100 notes = 1.2 cm tall; count sets the pile, band slides the band off and the top notes fan out. anchors: top band",
    line: "notebundle cx cy k count=0..100 value=1..100 band=0..1 lab=0 lit=notes|band",
    demo: { line: "notebundle 400 290 28 count=100 value=20 band=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "band" }, hold: 1 }, { set: { band: 1 }, hold: "settle" }, { set: { lit: "notes", count: 40 }, hold: "settle" }, { set: { band: 0, count: 100, value: 50, lit: "" }, hold: "settle" }, { set: { count: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { count: Math.round(A.num(o, "count", 100, 0, 100)), value: Math.round(A.num(o, "value", 20, 1, 100)), band: A.num(o, "band", 0, 0, 1), lit: o.lit || "" };
      st.bWant = st.band; st.n = st.count;
      g.innerHTML = `<path class="iso-halo" data-part="halo"/>` +
        `<g data-name="notes"><g data-part="pile"></g><g data-part="fan"></g></g><g data-name="band" data-part="band"></g><g data-part="words"></g>`;
      const el = B.parts(g), w = ISO.writer();
      const fanOf = () => ISO.smooth(0.82, 1, st.band);
      const draw = () => {
        const n = Math.round(st.n), f = Math.round(fanOf() * 60) / 60, nf = f > 0 ? Math.min(FAN, n) : 0, h = Math.max(0.02, n * B.NOTE_T);
        w.rebuild(el.pile, `${n - nf} ${st.value}`, () => B.stack(P, [0, 0, 0], n - nf, st.value, { w: W, d: D }));
        // the fanned top notes: each turned a little more about the pile's near-left corner, a sheet of art
        w.rebuild(el.fan, `${nf} ${f} ${st.value} ${n}`, () => {
          let s = "";
          for (let i = 0; i < nf; i++) {
            const a = (i + 1) * 0.07 * f, u = [Math.cos(a), Math.sin(a), 0], v = [-Math.sin(a), Math.cos(a), 0], z = (n - nf + i + 1) * B.NOTE_T;
            const o3 = [-HW - 7 * v[0], HD - 7 * v[1], z];
            s += `<g transform="${A.plane(P, o3, u, v)}">${A.note(W, D, st.value)}</g>`;
          }
          return s;
        });
        const bx = Math.round(st.band * OFF * 40) / 40, off = bx > HW + 1.75, bh = off ? Math.max(0.6, h) : h;
        w.rebuild(el.band, `${bx} ${bh} ${st.value} ${n}`, () => B.band(P, [bx, 0, 0], bh, { w: 3.5, d: D, words: ["100", `× ${st.value}`] }));
        w.attr(el.halo, "d", K.haloOf({ x: -HW - 0.3, y: -HD - 0.3, w: Math.max(W, bx + HW + 1.75) + 0.6, d: D + 0.6, r: 0.3 }, 0, Math.max(h, bh), P));
        g.anchors = { top: [0, 0, h], band: [bx, 0, bh] };
        if (lab) w.rebuild(el.words, `${n} ${st.value} ${st.bWant > 0.5}`, () => B.word(P, [HW, HD, h], `${n} notes of ${st.value}${st.bWant > 0.5 ? ", band off" : ""}`));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.count !== undefined) st.count = Math.round(A.num(p, "count", st.count, 0, 100));
        if (p.value !== undefined) st.value = Math.round(A.num(p, "value", st.value, 1, 100));
        if (p.band !== undefined) st.bWant = A.num(p, "band", st.bWant, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.band = ISO.follow(st.band, st.bWant, dt, 0.35, calm);
        if (Math.abs(st.band - st.bWant) < 0.002) st.band = st.bWant;
        st.n = ISO.follow(st.n, st.count, dt, 0.25, calm);
        if (Math.abs(st.n - st.count) < 0.5) st.n = st.count;
        draw();
        return st.band !== st.bWant || st.n !== st.count;
      };
      g.readout = () => `${st.count} notes of ${st.value} = ${st.count * st.value} · pile ${(st.count * 0.012).toFixed(2)} cm · band ${st.bWant > 0.5 ? "off" : "on"}`;
      draw();
      return g;
    },
  });
})();
