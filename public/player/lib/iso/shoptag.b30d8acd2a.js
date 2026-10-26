// "shoptag cx cy k price=0..999 item=apples|bread|rice|milk|eggs|tea|beans|cereal|water sale=0..1 lab=0 lit=rail|label|sale" — a PART
// (batch 6, economy): a shelf-edge price label in its clear plastic rail strip, the strip clipped to a shelf's front
// edge, its origin the middle of the strip's back (on the shelf's front face, y = 0); the label faces the room (+y).
// A 12 cm piece of the grey C-channel rail with its two lips and end caps, the 8 × 4 cm white card slid in behind the
// clear front: the item and its pack size, the big price, the price per kg worked out from them, a printed code; sale
// 0 → 1 slides a red "SALE" strip down over the card's top. price counts to a new value (inflation). set({ price,
// sale, item }). World: 1 = 1 cm. anchors: face
(() => {
  const K = window.K;
  const W = 8, H = 4, RL = 6, RZ = 2.35, D = 0.9;   // card, rail half length, rail half height, rail depth
  ISO.add({
    name: "shoptag", title: "Shelf price label (part)", compare: null,
    about: "A shelf-edge price label in its plastic rail strip: the item, the price, the price per kg and an optional red SALE strip; price counts to a new value. anchors: face",
    line: "shoptag cx cy k price=0..999 item=apples|bread|rice|milk|eggs|tea|beans|cereal|water sale=0..1 lab=0 lit=rail|label|sale",
    demo: { line: "shoptag 480 290 50 price=2.40 item=apples lab=1", script: [{ set: {}, hold: 1 }, { set: { price: 2.9, lit: "label" }, hold: "settle" }, { set: { sale: 1, lit: "sale" }, hold: "settle" }, { set: { price: 1.99, item: "rice", lit: "" }, hold: "settle" }, { set: { sale: 0, lit: "rail" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const ITEMS = Object.keys(B.ITEMS);
      const st = { price: B.num(o, "price", 2.4, 0, 999), sale: B.num(o, "sale", 0, 0, 1), item: B.pick(o.item, ITEMS, "apples"), lit: o.lit || "" };
      st.wp = st.price; st.ws = st.sale;
      const RAIL = ISO.tint("#e4e6e8", ["#9ea3a8", "#b0b4b9", "#c2c5c9", "#d2d5d8"], "#4a4f55");
      // the rail: back web on the shelf face, a top and a bottom lip curling forward, end caps
      const rail = ISO.tinted(RAIL, ISO.wbox(P, [-RL, RL], [0, 0.15], [-RZ, RZ], "mid") + ISO.wbox(P, [-RL, RL], [0.15, D], [-RZ, -RZ + 0.3], "mid") +
        ISO.wbox(P, [-RL, RL], [0.15, D], [RZ - 0.3, RZ], "mid"));
      const lipTop = ISO.tinted(RAIL, ISO.wbox(P, [-RL, RL], [D - 0.18, D], [RZ - 0.42, RZ - 0.3], "mid") + ISO.wbox(P, [-RL, RL], [D - 0.18, D], [-RZ + 0.3, -RZ + 0.42], "mid"));
      const caps = ISO.tinted(RAIL, ISO.wbox(P, [RL - 0.12, RL + 0.1], [0, D + 0.05], [-RZ, RZ], "mid"));
      // the clear front window over the card, with two long glints
      const yG = D - 0.1;
      const glass = B.poly(P, [[-RL, yG, -RZ + 0.42], [RL - 0.12, yG, -RZ + 0.42], [RL - 0.12, yG, RZ - 0.42], [-RL, yG, RZ - 0.42]], "#e8f2f8", "#8fa6b6", 0.4, ' fill-opacity=".18"') +
        B.free(P, [[[-RL + 1, yG + 0.01, RZ - 0.8], [-RL + 4.5, yG + 0.01, RZ - 0.8]], [[-RL + 1.6, yG + 0.01, RZ - 1.1], [-RL + 3.2, yG + 0.01, RZ - 1.1]]], "#ffffff", 0.9, ' opacity=".8" stroke-linecap="round"');
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RL - 0.5, y: 0, w: 2 * RL + 1, d: D + 0.4, r: 0.2 }, -RZ, 2 * RZ, P)}"/>` +
        `<g data-name="rail">${rail}</g><g data-name="label"><g data-part="card"></g></g><g data-name="sale"><g data-part="strip"></g></g><g data-name="rail">${lipTop}${glass}${caps}</g><g data-part="words"></g>`;
      g.anchors = { face: [0, D, 0] };
      const el = B.parts(g), w = ISO.writer(), o0 = [-W / 2, 0.5, H / 2];
      const draw = () => {
        const pr = Math.round(st.price * 100) / 100, sl = Math.round(st.sale * 40) / 40;
        w.rebuild(el.card, `${pr} ${st.item}`, () => B.front(P, o0, B.tagArt(W, H, pr, st.item, 0)));
        w.rebuild(el.strip, `${sl}`, () => (sl > 0 ? B.front(P, [o0[0], 0.52, o0[2]], B.saleArt(W, H, sl)) : ""));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [RL + 0.4, D, 1], "shelf price label"));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.price !== undefined) st.wp = B.num(p, "price", st.wp, 0, 999);
        if (p.sale !== undefined) st.ws = B.num(p, "sale", st.ws, 0, 1);
        if (p.item !== undefined) st.item = B.pick(p.item, ITEMS, st.item);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the price counts to its new value over about a second; the strip slides in
      g.update = (dt) => {
        const calm = ISO.still();
        st.price = ISO.follow(st.price, st.wp, dt, 0.3, calm); if (Math.abs(st.price - st.wp) < 0.005) st.price = st.wp;
        st.sale = ISO.follow(st.sale, st.ws, dt, 0.25, calm); if (Math.abs(st.sale - st.ws) < 0.01) st.sale = st.ws;
        draw();
        return st.price !== st.wp || st.sale !== st.ws;
      };
      g.readout = () => { const kg = B.ITEMS[st.item][1]; return `price label · ${B.ITEMS[st.item][0]} ${kg} kg · ${st.wp.toFixed(2)} · ${(st.wp / kg).toFixed(2)} per kg${st.ws > 0.5 ? " · on sale" : ""}`; };
      draw();
      return g;
    },
  });
})();
