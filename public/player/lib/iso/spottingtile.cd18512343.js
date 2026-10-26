// "spottingtile cx cy k drops=0..20 c=purple|blue|red|green|yellow|orange|pink|brown|clear lab=0 lit=tile|wells|puddle" —
// a PART (PARTS.md, batch 5): a white glazed spotting tile lying on the bench, its origin the bench point under its
// middle. 9.6 × 4 cm, 1 cm thick, a buff clay foot under the glaze, three round hollow wells 2.2 cm across along x
// (2.8 cm apart), each a shallow glazed dish 0.3 cm deep. The middle well takes drops from a dropper above it: the
// puddle in it spreads with the number of drops (about 0.05 mL each) up to the well's edge. set({ drops, c }), eased.
// Reused from dropper.js (its tile, wells and puddle). Built in mm; anchors in cm: well (the middle well's floor,
// where drops land), well1 well3 (the end wells' floors).
(() => {
  const K = window.K, G = window.G;
  const TILE = { x: -48, y: -20, w: 96, d: 40, r: 3 }, H = 10, WELLS = [-28, 0, 28], RW = 11, DEEP = 3;
  const GLAZE = ISO.tint("#ffffff", ["#d9dcdf", "#e3e6e8", "#eceef0", "#f5f6f7"], "#7c8389");
  const BODY = ISO.tint("#efe6d8", ["#cdbfa8", "#d8ccb7", "#e2d7c5", "#ebe2d3"], "#7c8389");
  const COLS = ["purple", "blue", "red", "green", "yellow", "orange", "pink", "brown", "clear"];
  const ring = (x, r, z, P, n = 40) => K.circleRing(x, 0, r, n).map(([a, b]) => K.iso([a, b, z], P));

  // a well: a glazed dish seen through its rim: rings deeper down drawn smaller and paler (the far wall in shade at
  // the top, the floor in light), clipped to the rim so nothing shows outside it; a glint on the near wall
  let clipN = 0;
  function wellSvg(P, x) {
    const id = `st${clipN++}`, rim = K.pathOf(ring(x, RW, H, P), true);
    const rings = [[RW, H, "#c9ced3"], [RW * 0.88, H - 0.9, "#d3d7db"], [RW * 0.76, H - 1.7, "#dde0e3"], [RW * 0.64, H - 2.4, "#e7e9ec"], [RW * 0.52, H - DEEP, "#f0f2f4"]];
    return `<clipPath id="${id}"><path d="${rim}"/></clipPath><g clip-path="url(#${id})">${rings.map(([r, z, c]) => `<path d="${K.pathOf(ring(x, r, z, P), true)}" fill="${c}"/>`).join("")}</g>` +
      `<path d="${rim}" fill="none" stroke="#8a9198" stroke-width="0.7"/>` +
      `<path d="${K.pathOf(K.circleRing(x, 0, RW * 0.8, 40).slice(24, 32).map(([a, b]) => K.iso([a, b, H - 0.6], P)))}" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/>`;
  }

  ISO.add({
    name: "spottingtile", title: "Spotting tile (part)", compare: null,
    about: "A white glazed spotting tile, 9.6 × 4 cm, with three hollow wells for a few drops each; drops from a dropper spread into a puddle in the middle well. anchors: well well1 well3",
    line: "spottingtile cx cy k drops=0..20 c=purple|blue|red|green|yellow|orange|pink|brown|clear lab=0 lit=tile|wells|puddle",
    demo: { line: "spottingtile 480 300 48 c=purple lab=1", script: [{ set: { lit: "wells" }, hold: 1.2 }, { set: { drops: 3, lit: "puddle" }, hold: "settle" }, { set: { drops: 10 }, hold: "settle" }, { set: { c: "blue", lit: "tile" }, hold: "settle" }, { set: { drops: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { n: ISO.clamp(Math.round(ISO.num(o, "drops", 0)), 0, 20), r: 0, c: COLS.includes(o.c) ? o.c : "purple" };
      const want = { n: st.n };
      const rOf = (n) => (n ? Math.min(RW * 0.86, 3 + 2.6 * Math.sqrt(n)) : 0);
      st.r = rOf(st.n);
      let lit = o.lit || "";
      const inset = { x: TILE.x + 1.2, y: TILE.y + 1.2, w: TILE.w - 2.4, d: TILE.d - 2.4, r: 2 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(TILE, 0, H, Pm)}"/><g data-name="tile">` +
        ISO.tinted(BODY, S(K.slabOf({ x: TILE.x + 1, y: TILE.y + 1, w: TILE.w - 2, d: TILE.d - 2, r: 2 }, 0, 1.2, Pm, 3, 0.3), { tone: "lo" })) +
        ISO.tinted(GLAZE, S(K.slabOf(TILE, 1.2, H - 1.2, Pm, 3, 1.2), { tone: "lo" }) + S(K.slabOf(inset, H - 0.01, 0.01, Pm, 3, 0.3), { tone: "faint", crease: "none" })) +
        `</g><g data-name="wells">${WELLS.map((x) => wellSvg(Pm, x)).join("")}</g><g data-part="puddle" data-name="puddle"></g><g data-part="words"></g>`;
      g.anchors = { well: [0, 0, (H - DEEP) / 10], well1: [WELLS[0] / 10, 0, (H - DEEP) / 10], well3: [WELLS[2] / 10, 0, (H - DEEP) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const vol = () => (st.n * 0.05).toFixed(2);
      const draw = () => {
        const r = Math.round(st.r * 10) / 10;
        // the puddle lies in the dish: the wider it spreads the higher up the dish's wall its edge sits
        w.rebuild(el.puddle, `${r} ${st.c}`, () => (r < 0.3 ? "" : `<path d="${K.pathOf(ring(0, r, H - DEEP + (DEEP - 0.5) * (r / RW) ** 2, Pm, 36), true)}" fill="${LAB.col(st.c)}" stroke="${LAB.ink(st.c)}" stroke-width="0.6" opacity=".9"/>` +
          `<path d="${K.pathOf(K.circleRing(-r * 0.3, -r * 0.2, r * 0.35, 12).slice(2, 7).map(([a, b]) => K.iso([a, b, H - DEEP + 0.3], Pm)))}" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>`));
        if (lab) w.rebuild(el.words, `${st.n} ${st.c}`, () => LAB.word(Pm, lab, [TILE.x, TILE.y + TILE.d, 0], "spotting tile", "#556", { anchor: "end", dy: 14 }) +
          LAB.word(Pm, lab, [TILE.x + TILE.w, TILE.y + TILE.d, 0], `${st.n} drop${st.n === 1 ? "" : "s"} · ${vol()} mL`, LAB.ink(st.c), { anchor: "start", dy: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.drops !== undefined && Number.isFinite(+p.drops)) want.n = ISO.clamp(Math.round(+p.drops), 0, 20);
        if (p.c && COLS.includes(p.c)) st.c = p.c;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.n = want.n;
        const target = rOf(st.n);
        st.r = ISO.follow(st.r, target, dt, 0.35, ISO.still());
        if (Math.abs(st.r - target) < 0.05) st.r = target;
        draw();
        return st.r !== target;
      };
      g.readout = () => `spotting tile 9.6 × 4 cm, three wells · ${st.n} drop${st.n === 1 ? "" : "s"} of ${st.c} in the middle well · about ${vol()} mL`;
      draw();
      return g;
    },
  });
})();
