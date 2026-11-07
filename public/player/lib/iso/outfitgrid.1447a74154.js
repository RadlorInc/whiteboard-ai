// "outfitgrid cx cy k tops=1..5 bottoms=1..5 fill=0..1" — tops along the top, bottoms down the left side, and a grid
// with one card for every top-and-bottom pair, filling in card by card as fill goes from 0 to 1.
(() => {
  const CW = 132, CH = 104, HW = 112, HH = 120;
  const free = { class: "free", "data-free": "1" };
  // small flat modest pieces: long-sleeved high-neck tops, full-length pants and long skirts, about 100 x 76
  const TOP = "M-13 -36L13 -36L20 -30L40 -24L52 22L40 26L32 -4L30 36L-30 36L-32 -4L-40 26L-52 22L-40 -24L-20 -30Z";
  const PANTS = "M-25 -38L25 -38L31 38L7 38L0 -4L-7 38L-31 38Z";
  const SKIRT = "M-21 -38L21 -38L36 36Q0 44 -36 36Z";
  const TOPS = ["rose", "teal", "mustard", "cream", "plum"];
  const BOTTOMS = [["pants", "blue"], ["skirt", "camel"], ["pants", "black"], ["skirt", "grey"], ["pants", "olive"]];
  let uid = 0;
  ISO.add({
    name: "outfitgrid", title: "Outfit grid", compare: null,
    about: "Tops in a row along the top, bottoms in a column down the left (long pants and long skirts), and a grid with one card for each top-and-bottom pair, so 3 tops and 2 bottoms make 6 cards. fill runs from 0 (empty grid) to 1 (every pair shown), card by card. Named parts: tops, bottoms, grid.",
    line: "outfitgrid cx cy k=0.2..1.5 tops=1..5 bottoms=1..5 fill=0..1",
    demo: { line: "outfitgrid 480 270 0.62 tops=5 bottoms=3 fill=0", script: [{ set: { fill: 0 }, hold: 1 }, { set: { fill: 0.5 }, hold: "settle" }, { set: { fill: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(37);
      const nt = ISO.clamp(Math.round(+o.tops) || 3, 1, 5), nb = ISO.clamp(Math.round(+o.bottoms) || 2, 1, 5);
      const g = P.base(parent, cx, cy, k), defs = P.el("defs", {}, g), ids = {};
      const piece = (key, d, col) => {
        const id = `of${++uid}`, p = P.el("g", { id }, defs), cl = P.clip(p, d);
        P.el("path", { d, fill: col }, p);
        const a = P.layer(p, cl);
        for (let i = 0; i < 6; i++) { const x = P.rr(-40, 40); a.stroke(x, -40, x + P.rr(-6, 6), 40, P.rr(8, 16), P.pick([P.dk(col, 0.12), P.lt(col, 0.12)]), 0.7, P.rr(-4, 4)); }
        a.stroke(-40, -30, 40, -30, 7, P.dk(col, 0.25), 0.6); a.done();
        P.ink(d, p, 2.6, false);
        ids[key] = id;
      };
      TOPS.forEach((c, i) => piece("t" + i, TOP, P.COLORS[c]));
      BOTTOMS.forEach(([kind, c], i) => piece("b" + i, kind === "pants" ? PANTS : SKIRT, P.COLORS[c]));
      const use = (key, x, y, s, p) => P.el("use", { href: `#${ids[key]}`, transform: `translate(${x} ${y}) scale(${s})` }, p);
      const L = -(HW + nt * CW) / 2, T = -(HH + nb * CH) / 2, gx = L + HW, gy = T + HH;
      const tops = P.el("g", { "data-name": "tops" }, g), bottoms = P.el("g", { "data-name": "bottoms" }, g), grid = P.el("g", { "data-name": "grid" }, g);
      for (let i = 0; i < nt; i++) use("t" + i, gx + CW * (i + 0.5), T + HH / 2 - 4, 1.15, tops);
      for (let j = 0; j < nb; j++) use("b" + j, L + HW / 2 - 4, gy + CH * (j + 0.5), 1.1, bottoms);
      // empty slots, then the cards that fill them
      let slots = "";
      for (let j = 0; j < nb; j++) for (let i = 0; i < nt; i++) slots += `M${gx + CW * i + 6} ${gy + CH * j + 6}h${CW - 12}v${CH - 12}h${-(CW - 12)}Z`;
      P.el("path", { d: slots, fill: "none", stroke: "#a99c80", "stroke-width": 2, "stroke-dasharray": "7 6", ...free }, grid);
      P.ink(`M${gx - 4} ${T + 10}V${gy + nb * CH} M${L + 10} ${gy - 4}H${gx + nt * CW}`, grid, 3, false);
      const cards = [];
      for (let j = 0; j < nb; j++) for (let i = 0; i < nt; i++) {
        const x = gx + CW * (i + 0.5), y = gy + CH * (j + 0.5), c = P.el("g", { opacity: 0 }, grid);
        P.el("rect", { x: x - CW / 2 + 6, y: y - CH / 2 + 6, width: CW - 12, height: CH - 12, rx: 8, fill: "#f6efdf", stroke: P.INK, "stroke-width": 2.2, ...free }, c);
        use("t" + i, x - 22, y, 0.72, c); use("b" + j, x + 27, y, 0.72, c);
        cards.push({ c, op: 0 });
      }
      const N = cards.length, st = { fill: ISO.clamp(+o.fill || 0, 0, 1) }; let f = st.fill;
      const paint = () => { cards.forEach((q, i) => { const v = ISO.clamp(f * N - i, 0, 1); if (v !== q.op) { q.op = v; q.c.setAttribute("opacity", v.toFixed(3)); } }); };
      paint();
      g.set = (p) => { if (p.fill !== undefined) st.fill = ISO.clamp(+p.fill || 0, 0, 1); };
      g.update = (dt) => { f = ISO.still() ? st.fill : ISO.follow(f, st.fill, dt, 0.5); if (Math.abs(f - st.fill) < 0.5 / N / 100) f = st.fill; paint(); return f !== st.fill; };
      g.readout = () => `${nt} tops x ${nb} bottoms = ${N} outfits, ${Math.floor(st.fill * N + 1e-6)} shown`;
      return g;
    },
  });
})();
