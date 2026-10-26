// "applecrate cx cy k apples=0..20 c=red|green|yellow lab=0 lit=crate|apples" — a PART (batch 6, economy): a slatted
// wooden crate of apples standing on the floor, a stall or a shelf, its origin the floor point under its middle. 50 × 30
// × 30 cm: four corner posts, three slats on each long side with gaps between, solid end boards with a hand hole and
// nail heads, a slatted floor; up to 20 apples packed in it, the second layer nested in the first layer's hollows. The
// supply count: apples 0 → 20 fills it one apple at a time, or empties it. set({ apples }). World: 1 = 1 cm.
// anchors: top (the rim's middle), inside (the floor's middle)
(() => {
  const K = window.K;
  const W = 50, D = 30, H = 30, R = 4.3, ZT = 12;   // the pulp tray insert's top
  ISO.add({
    name: "applecrate", title: "Crate of apples (part)", compare: null,
    about: "A slatted wooden crate 50 × 30 × 30 cm holding up to 20 apples; apples fills or empties it one by one (packed on a pulp tray to the rim), for stock and supply counts. anchors: top inside",
    line: "applecrate cx cy k apples=0..20 c=red|green|yellow lab=0 lit=crate|apples",
    demo: { line: "applecrate 480 390 8.5 apples=20 lab=1", script: [{ set: {}, hold: 1 }, { set: { apples: 6, lit: "apples" }, hold: "settle" }, { set: { apples: 0, lit: "crate" }, hold: "settle" }, { set: { apples: 20, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const c0 = B.pick(o.c, Object.keys(B.APPLE_C), "red");
      const st = { n: Math.round(B.num(o, "apples", 20, 0, 20)), lit: o.lit || "", t: 0 };
      st.want = st.n;
      const tones = c0 === "red" ? ["#cf3b2c", "#b8322a", "#d8502e"] : c0 === "green" ? ["#7cb342", "#6ea23a", "#8fbf4c"] : ["#e2b531", "#d6a62a", "#e8c24a"];
      const MARK = "<!--in-->", shell = B.crate(P, [0, 0, 0], { w: W, d: D, h: H, inside: MARK, label: "APPLES" });
      const [far, near] = shell.split(MARK);
      // a moulded pulp tray resting on cleats, lifting the apples up to the rim (the crate is packed full)
      const PULP = ISO.tint("#e4e0d6", ["#a8a398", "#b6b1a6", "#c4bfb4", "#d2cdc2"], "#5f5a50");
      const tray = ISO.tinted(PULP, ISO.wbox(P, [-W / 2 + 1.6, W / 2 - 1.6], [-D / 2 + 1.6, D / 2 - 1.6], [ZT - 1, ZT], "mid"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -W / 2 - 1, y: -D / 2 - 1, w: W + 2, d: D + 2, r: 1 }, 0, H, P)}"/>` +
        `<g data-name="crate">${far}</g><g data-name="crate">${tray}</g><g data-name="apples"><g data-part="apples"></g></g><g data-name="crate">${near}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H], inside: [0, 0, ZT] };
      const el = B.parts(g), w = ISO.writer();
      // all 20 apples built once in paint order; the count shows the first n in packing order
      el.apples.innerHTML = B.appleSpots(-W / 2 + 1.8, W / 2 - 1.8, -D / 2 + 1.8, D / 2 - 1.8, ZT + 0.4, 20, 5, 3, R).map(([x, y, z, i, n]) => `<g data-i="${n}">${B.apple(P, [x, y, z], { r: R, c: tones[i] })}</g>`).join("");
      const each = [...el.apples.children];
      const draw = () => {
        for (const a of each) w.shown(a, +a.dataset.i < st.n);
        if (lab) w.rebuild(el.words, `${st.n}`, () => B.word(P, [W / 2, D / 2, H + 4], `crate, ${st.n} apples`));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.apples !== undefined) st.want = Math.round(B.num(p, "apples", st.want, 0, 20));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // one apple in (or out) every 0.12 s, as hands would pack it
      g.update = (dt) => {
        if (ISO.still()) st.n = st.want;
        else if (st.n !== st.want && (st.t += dt) >= 0.12) { st.t = 0; st.n += Math.sign(st.want - st.n); }
        draw();
        return st.n !== st.want;
      };
      g.readout = () => `apple crate · ${st.want} of 20 apples · 50 × 30 × 30 cm`;
      draw();
      return g;
    },
  });
})();
