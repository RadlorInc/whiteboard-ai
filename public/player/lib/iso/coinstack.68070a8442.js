// "coinstack cx cy k n=0..30 metal=gold|silver lab=0 lit=stack|top" — a PART (batch 6, money): a straight stack of
// identical generic coins standing on a table, its origin the table point under its middle. Each coin is 2.4 cm
// across and 0.2 cm thick with a reeded edge; the top coin shows its raised rim and a plain "1" (no real design).
// n is how many coins: set({ n }) adds coins one at a time, each dropping onto the stack and settling, or lifts them
// off the top one at a time. Height = n × 0.2 cm, so the stack's height shows the amount. World: 1 = 1 cm.
// anchors: top (the top coin's middle, where the next coin lands).
(() => {
  const K = window.K, G = window.G;
  const R = 1.2, H = 0.2, MAX = 30, DROP = 3;
  ISO.add({
    name: "coinstack", title: "Coin stack (part)", compare: null,
    about: "A stack of identical generic coins (2.4 cm, 0.2 cm thick, reeded edges, a plain 1 on top) whose height shows the amount; set n to add or take coins one at a time. anchors: top",
    line: "coinstack cx cy k n=0..30 metal=gold|silver lab=0 lit=stack|top",
    demo: { line: "coinstack 480 430 60 n=4 lab=1", script: [{ set: {}, hold: 1 }, { set: { n: 12, lit: "stack" }, hold: "settle" }, { set: { n: 9, lit: "top" }, hold: "settle" }, { set: { metal: "silver", n: 15, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { n: Math.round(B.num(o, "n", 5, 0, MAX)), metal: o.metal === "silver" ? "silver" : "gold", lit: o.lit || "" };
      st.want = st.n; st.shown = st.n; st.fall = 0;   // shown = coins resting; fall = the moving coin's height above its place
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R - 0.3, y: -R - 0.3, w: 2 * R + 0.6, d: 2 * R + 0.6, r: R }, 0, 0.02, P)}"/>` +
        `<g data-name="stack" data-part="stack"></g><g data-name="top" data-part="top"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, st.n * H] };
      const el = LAB.parts(g), w = ISO.writer();
      // the resting stack: one body with a seam between each pair of coins and the reeding all the way up
      const stackSvg = (n, metal) => {
        if (n < 1) return "";
        const F = LAB.Z([0, 0, 0]), tint = B.COIN[metal];
        const seams = Array.from({ length: n - 1 }, (_, i) => K.sideArc(0, 0, R, (i + 1) * H, P, 24)).join("");
        return ISO.tinted(tint, K.solidSvg(G.disc(0, n * H, R, F, P), { tone: "mid", inner: K.lineSvg(G.ribsOf(F, 0, n * H, R, 36, P, { seams: true }), { tone: "faint" }) + K.lineSvg(seams, { tone: "lo" }) })) +
          B.coin(P, [0, 0, (n - 1) * H], R, H, metal);
      };
      const draw = () => {
        const moving = st.fall > 0.001 && st.shown < MAX;
        w.rebuild(el.stack, `${st.shown} ${st.metal}`, () => stackSvg(st.shown, st.metal));
        const fq = Math.round(st.fall * 50) / 50;
        w.rebuild(el.top, moving ? `${st.shown} ${fq} ${st.metal}` : "", () => (moving ? B.coin(P, [0, 0, st.shown * H + fq], R, H, st.metal) : ""));
        if (lab) w.rebuild(el.words, `${st.want}`, () => ISO.word(K.iso([R, 0, st.want * H + 0.6], P), `${st.want} coins`, "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.n !== undefined) st.want = Math.round(ISO.clamp(+p.n, 0, MAX));
        if (p.metal !== undefined) st.metal = p.metal;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // one coin at a time: adding drops a coin from DROP cm onto the stack (it falls, as a coin does); taking lifts
      // the top coin up and away
      g.update = (dt) => {
        if (ISO.still()) { st.shown = st.want; st.fall = 0; draw(); return false; }
        if (st.shown < st.want) {
          if (st.fall <= 0) st.fall = DROP, st.v = 0;
          st.v += 981 * dt * 0.25; st.fall -= st.v * dt;
          if (st.fall <= 0) { st.fall = 0; st.shown++; }
        } else if (st.shown > st.want) {
          if (st.fall <= 0) { st.shown--; st.fall = 0.0011; st.up = true; }
          st.fall += 18 * dt;
          if (st.fall >= DROP) st.fall = 0, st.up = false;
        }
        draw();
        return st.shown !== st.want || st.fall > 0;
      };
      g.readout = () => `coin stack · ${st.want} coins of 1 · ${(st.want * H).toFixed(1)} cm tall`;
      draw();
      return g;
    },
  });
})();
