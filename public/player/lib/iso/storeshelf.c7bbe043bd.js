// "storeshelf cx cy k items=0..8 lab=0 lit=frame|shelves|rails|stock" — a PART (batch 6, economy): a freestanding shop
// shelf unit standing on the shop floor, its origin the floor point under its middle, its front toward the room (+y).
// 100 × 45 × 180 cm: two side panels with rows of shelf-pin holes, a pegboard back panel, a kick plate across the foot,
// a base deck and three shelves (four shelves for stock) at 14, 54, 94 and 134 cm, a top cap; each shelf has a grey
// price rail on its front edge carrying two printed shelf labels. Stock stands on every shelf: cereal boxes on the
// base, milk cartons, tins, water bottles on top. items 0..8 is how many stand on each shelf (8 = full, a few =
// scarce); they appear or go one at a time, left to right. set({ items }). World: 1 = 1 cm. anchors: top, shelf1..shelf4
// (each shelf's surface at its middle front)
(() => {
  const K = window.K;
  const HX = 50, HY = 22.5, H = 180, T = 2, ZS = [12, 52, 92, 132], ST = 2, N = 8;
  const KINDS = [["box", "cereal", 3.2], ["carton", "milk", 1.15], ["tin", "beans", 0.9], ["bottle", "water", 0.8]];
  ISO.add({
    name: "storeshelf", title: "Shop shelf unit (part)", compare: null,
    about: "A freestanding shop shelf unit 100 × 45 × 180 cm: side panels, back panel, kick plate, four shelves with price rails and labels; items 0..8 per shelf shows full stock or scarcity. anchors: top shelf1 shelf2 shelf3 shelf4",
    line: "storeshelf cx cy k items=0..8 lab=0 lit=frame|shelves|rails|stock",
    demo: { line: "storeshelf 480 490 2.3 items=8 lab=1", script: [{ set: {}, hold: 1 }, { set: { items: 2, lit: "stock" }, hold: "settle" }, { set: { lit: "rails" }, hold: 1.2 }, { set: { items: 0, lit: "shelves" }, hold: "settle" }, { set: { items: 8, lit: "frame" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, B41 = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { n: Math.round(B.num(o, "items", 8, 0, N)), lit: o.lit || "", t: 0 };
      st.want = st.n;
      const MEL = ISO.tint("#f2f2ee", ["#b8b8b2", "#c6c6c0", "#d4d4ce", "#e2e2dc"], "#55554f");
      const RAIL = ISO.tint("#d6d9dc", ["#8e9398", "#a0a5aa", "#b2b6ba", "#c4c7ca"], "#43484d");
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      const yb = -HY + T, yf = HY - 2;   // the back panel's face, the shelves' front edge
      // the far side panel and the back panel with its pegboard holes in a grid (dots on the face)
      const holes = []; for (let z = 20; z < H - 6; z += 10) for (let x = -HX + 8; x < HX - 4; x += 10) holes.push(K.iso([x, yb + 0.01, z], P));
      const farFrame = ISO.tinted(MEL, box([-HX, -HX + T], [-HY, HY], [0, H]) + box([-HX + T, HX - T], [-HY, yb], [0, H])) + K.dotsSvg(holes, { size: 0.35, tone: "faint" });
      // the kick plate and the top cap
      const kick = ISO.tinted(ISO.T.plastic, box([-HX + T, HX - T], [yf - 1, yf + 0.5], [0, ZS[0]]));
      const cap = ISO.tinted(MEL, box([-HX, HX], [-HY, HY], [H - T, H]));
      // a shelf: the board, its rail on the front edge and two labels in the rail
      const shelf = (i) => {
        const z = ZS[i], [kind, item, price] = KINDS[i];
        const board = ISO.tinted(MEL, box([-HX + T, HX - T], [yb, yf], [z, z + ST]));
        const rail = ISO.tinted(RAIL, box([-HX + T, HX - T], [yf, yf + 1.4], [z - 2.2, z + ST + 0.3]));
        const tags = [-36, 14].map((x, j) => B.front(P, [x, yf + 1.42, z + ST - 0.1], B.tagArt(8, 3.6, price + j * 0.4, item, 0, { per: k > 4 }))).join("");
        return { board, rail: rail + tags };
      };
      const itemAt = (i, j) => {
        const x = -HX + T + 6.2 + j * 11.95, [kind] = KINDS[i], at = [x, 4, ZS[i] + ST];
        if (kind === "box") return B41.box(P, at, { c: ["#e08a2a", "#3f7f3a", "#c8553d"][j % 3], w: 10.5, d: 7, h: 27 });
        return B41.item(P, kind, at, j);
      };
      const near = ISO.tinted(MEL, box([HX - T, HX], [-HY, HY], [0, H]));
      const pins = []; for (let z = 20; z < H - 6; z += 5) pins.push(K.iso([HX + 0.01, -HY + 5, z], P), K.iso([HX + 0.01, HY - 5, z], P));
      let inner = "";
      for (let i = 0; i < 4; i++) { const s = shelf(i); inner += `<g data-name="shelves">${s.board}</g><g data-name="stock" data-part="s${i}"></g><g data-name="rails">${s.rail}</g>`; }
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 2, y: -HY - 2, w: 2 * HX + 4, d: 2 * HY + 4, r: 2 }, 0, H, P)}"/>` +
        `<g data-name="frame">${farFrame}${kick}</g>${inner}<g data-name="frame">${cap}${near}${K.dotsSvg(pins, { size: 0.35, tone: "faint" })}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H], ...Object.fromEntries(ZS.map((z, i) => [`shelf${i + 1}`, [0, 6, z + ST]])) };
      const el = B.parts(g), w = ISO.writer(), each = [];
      const draw = () => {
        for (const a of each) w.shown(a, +a.dataset.j < st.n);
        if (lab) w.rebuild(el.words, `${st.n}`, () => B.word(P, [HX, HY, H - 20], "shop shelf") + B.word(P, [HX, HY, H - 34], `${st.n} of ${N} on each shelf`, { size: 12, color: "#667" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.items !== undefined) st.want = Math.round(B.num(p, "items", st.want, 0, N));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) st.n = st.want;
        else if (st.n !== st.want && (st.t += dt) >= 0.15) { st.t = 0; st.n += Math.sign(st.want - st.n); }
        draw();
        return st.n !== st.want;
      };
      g.readout = () => `shop shelf · ${st.want} of ${N} items on each of 4 shelves (${st.want * 4} in all)${st.want <= 2 ? " · nearly empty: scarce" : ""}`;
      // the stock, one build slice per shelf (32 groceries); each item built once and shown by count
      for (let i = 0; i < 4; i++) ISO.later(() => {
        el[`s${i}`].innerHTML = Array.from({ length: N }, (_, j) => `<g data-j="${j}">${itemAt(i, j)}</g>`).join("");
        each.push(...el[`s${i}`].children);
        draw();
      });
      draw();
      return g;
    },
  });
})();
