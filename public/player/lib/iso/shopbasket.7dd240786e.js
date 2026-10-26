// "shopbasket cx cy k up=0..1 items=0..6 lab=0 lit=basket|handles|items" — a PART (batch 6, groceries): a plastic shop
// hand basket standing on the floor or a counter, its origin the surface point under its middle, its long side along
// x. 42 × 30 cm at the rim, 36 × 24 at the base, 22 cm deep: four tapered mesh walls (rows of slots), a thick rim, a
// foot ring, and two folding handles pivoting on rivets in the long rims. up 0 = both handles folded down outside the
// walls, 1 = swung up to meet over the middle (to carry it). items 0..6 puts groceries in one by one (each drops in):
// a loaf, a tin, a cereal box, an apple, a milk carton, a water bottle. set({ up, items }). World: 1 = 1 cm.
// anchors: inside (the middle of the floor), grip (the handles' grips when up)
(() => {
  const K = window.K, G = window.G;
  const TX = 21, TY = 15, BX = 18, BY = 12, ZF = 1, ZR = 20, ZT = 22, HP = 13, ARM = 16;
  const RED = ISO.tint("#ec7a6a", ["#a8291c", "#bb3527", "#cc4434", "#dc5a49"], "#5a120b");
  const ITEMS = [["loaf", -6.5, -6], ["tin", 9, -7], ["box", -1, 7.5], ["apple", -15, 6], ["carton", 12, 6], ["bottle", 14.5, -7.5]];
  ISO.add({
    name: "shopbasket", title: "Shopping basket (part)", compare: null,
    about: "A plastic hand shopping basket, 42 × 30 × 22 cm, mesh sides and two folding handles; up swings the handles up, items 0..6 drops groceries in one by one (to compare a basket's cost then and now). anchors: inside grip",
    line: "shopbasket cx cy k up=0..1 items=0..6 lab=0 lit=basket|handles|items",
    demo: { line: "shopbasket 480 400 9 up=0 items=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { items: 3, lit: "items" }, hold: "settle" }, { set: { items: 6 }, hold: "settle" }, { set: { up: 1, lit: "handles" }, hold: "settle" }, { set: { up: 0, items: 2, lit: "basket" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { up: B.num(o, "up", 0, 0, 1), n: Math.round(B.num(o, "items", 0, 0, 6)), lit: o.lit || "" };
      st.wantUp = st.up; st.shown = st.n;
      const at = (p) => K.iso(p, P), view = G.viewOf(P);
      // a wall between two base corners and two rim corners, a thin slab with its rows of slots
      const wall = (b0, b1, t0, t1, outside) => {
        const n = [b1[1] - b0[1], -(b1[0] - b0[0])], len = Math.hypot(...n), inward = [-n[0] / len * 0.5 * outside, -n[1] / len * 0.5 * outside];
        const V = [b0, b1, t1, t0].flatMap((p) => [p, [p[0] + inward[0], p[1] + inward[1], p[2]]]);
        const slab = ISO.poly([V[0], V[2], V[4], V[6], V[1], V[3], V[5], V[7]], ISO.BOX_F, P, "mid");
        const W = (s, h) => { const a = [0, 1, 2].map((i) => b0[i] + (b1[i] - b0[i]) * s), b = [0, 1, 2].map((i) => t0[i] + (t1[i] - t0[i]) * s); return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * h); };
        const cols = Math.max(3, Math.round(Math.hypot(b1[0] - b0[0], b1[1] - b0[1]) / 4.2)), slots = [];
        for (const [h0, h1] of [[0.12, 0.34], [0.42, 0.64], [0.72, 0.9]])
          for (let c = 0; c < cols; c++) { const s0 = 0.06 + (0.88 * c) / cols + 0.12 / cols, s1 = 0.06 + (0.88 * (c + 1)) / cols - 0.12 / cols; slots.push(K.pathOf([W(s0, h0), W(s1, h0), W(s1, h1), W(s0, h1)].map(at), true)); }
        const front = outside === 1;
        return slab + `<path d="${slots.join("")}" fill="${front ? "#3a1410" : "#fdfdfb"}" fill-opacity="${front ? 0.45 : 0.75}" stroke="#7a1d12" stroke-width="0.5"/>`;
      };
      const c = (sx, sy, z, big) => [sx * (big ? TX : BX), sy * (big ? TY : BY), z];
      const back = wall(c(1, -1, ZF), c(-1, -1, ZF), c(1, -1, ZR, 1), c(-1, -1, ZR, 1), -1) + wall(c(-1, -1, ZF), c(-1, 1, ZF), c(-1, -1, ZR, 1), c(-1, 1, ZR, 1), -1);
      const front = wall(c(-1, 1, ZF), c(1, 1, ZF), c(-1, 1, ZR, 1), c(1, 1, ZR, 1), 1) + wall(c(1, 1, ZF), c(1, -1, ZF), c(1, 1, ZR, 1), c(1, -1, ZR, 1), 1);
      const rim = (x0, x1, y0, y1) => ISO.wbox(P, [x0, x1], [y0, y1], [ZR, ZT], "mid");
      const floor = ISO.wbox(P, [-BX + 1, BX - 1], [-BY + 1, BY - 1], [0, ZF], "lo") + `<path d="${K.pathOf([c(-1, -1, ZF + 0.01), c(1, -1, ZF + 0.01), c(1, 1, ZF + 0.01), c(-1, 1, ZF + 0.01)].map(at), true)}" fill="#8f2418" stroke="#5a120b" stroke-width="0.6"/>` +
        `<path d="${[-12, -6, 0, 6, 12].map((x) => K.pathOf([at([x, -BY + 1, ZF + 0.02]), at([x, BY - 1, ZF + 0.02])])).join("")}" stroke="#6e1a10" stroke-width="0.6" opacity=".6"/>`;
      const rivet = (y) => [-HP, HP].map((x) => { const p = at([x, y, ZR + 1]); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${Math.max(1, G.scaleOf(P) * 0.7).toFixed(2)}" fill="#c9cbcf" stroke="#3c3f45" stroke-width="0.5"/>`; }).join("");
      // a handle on the long rim at side sg (+1 front, −1 back): two arms from its rivets and the grip between their ends
      const handle = (sg, up) => {
        const th = (165 - 215 * up) * (Math.PI / 180), d = [0, Math.sin(th) * sg, Math.cos(th)], y = TY * sg + 0.6 * sg, kS = G.scaleOf(P);
        const p0 = [-HP, y, ZR + 1], p1 = [HP, y, ZR + 1], e0 = B.add(p0, d, ARM), e1 = B.add(p1, d, ARM);
        const bar = K.pathOf([p0, e0, e1, p1].map(at)), grip = K.pathOf([B.add(e0, [1, 0, 0], 5), B.add(e1, [-1, 0, 0], 5)].map(at));
        return `<path d="${bar}" fill="none" stroke="#5a120b" stroke-width="${(kS * 1.5).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/><path d="${bar}" fill="none" stroke="#d24a39" stroke-width="${(kS * 1.0).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/>` +
          `<path d="${grip}" fill="none" stroke="#121214" stroke-width="${(kS * 2.4).toFixed(2)}" stroke-linecap="round"/><path d="${grip}" fill="none" stroke="#4a4b50" stroke-width="${(kS * 1.6).toFixed(2)}" stroke-linecap="round"/>` + rivet(y);
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -BX, y: -BY, w: 2 * BX, d: 2 * BY, r: 2 }, 0, ZT, P)}"/>` +
        `<g data-name="handles" data-part="hBackLo"></g>` +
        `<g data-name="basket">${ISO.tinted(RED, back + rim(-TX, TX, -TY - 0.6, -TY + 0.6) + rim(-TX - 0.6, -TX + 0.6, -TY, TY) + floor)}</g>` +
        `<g data-name="items" data-part="items"></g><g data-name="handles" data-part="hBackHi"></g>` +
        `<g data-name="basket">${ISO.tinted(RED, front + rim(TX - 0.6, TX + 0.6, -TY, TY) + rim(-TX, TX + 0.6, TY - 0.6, TY + 0.6))}</g>` +
        `<g data-name="handles" data-part="hFront"></g><g data-part="words"></g>`;
      g.anchors = { inside: [0, 0, ZF], grip: [0, 0, ZR + 1 + ARM * Math.cos((50 * Math.PI) / 180)] };
      const el = LAB.parts(g), w = ISO.writer();
      // each item is built once (when it first goes in) at its place, and dropped by a flat screen move
      const order = ITEMS.map((it, i) => i).sort((a, b) => K.depthOf([ITEMS[a][1], ITEMS[a][2], 0], P) - K.depthOf([ITEMS[b][1], ITEMS[b][2], 0], P));
      const slots = []; order.forEach((i) => { slots[i] = mk("g", {}, el.items); });
      const rise = K.iso([0, 0, 1], P)[1] - K.iso([0, 0, 0], P)[1];
      const placeItems = (shown) => ITEMS.forEach(([kind, x, y], i) => {
        const on = shown > i, e = slots[i];
        if (on && !e._built) { e._built = true; e.innerHTML = B.item(P, kind, [x, y, ZF], i); }
        w.shown(e, on);
        if (on) w.attr(e, "transform", `translate(0 ${(rise * 18 * ISO.ease(1 - ISO.clamp(shown - i, 0, 1))).toFixed(2)})`);
      });
      const draw = () => {
        const u = Math.round(st.up * 200) / 200, lo = u < 0.4, s = Math.round(st.shown * 30) / 30;
        w.rebuild(el.hBackLo, lo ? `${u}` : "", () => (lo ? handle(-1, u) : ""));
        w.rebuild(el.hBackHi, lo ? "" : `${u}`, () => (lo ? "" : handle(-1, u)));
        w.rebuild(el.hFront, `${u}`, () => handle(1, u));
        placeItems(s);
        if (lab) w.rebuild(el.words, `${st.n}`, () => ISO.word(at([TX + 2, 0, ZT + 2]), st.n ? `basket, ${st.n} items` : "shopping basket", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.up !== undefined) st.wantUp = B.num(p, "up", st.wantUp, 0, 1);
        if (p.items !== undefined) st.n = Math.round(B.num(p, "items", st.n, 0, 6));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.up = ISO.follow(st.up, st.wantUp, dt, 0.3, calm); if (Math.abs(st.up - st.wantUp) < 0.003) st.up = st.wantUp;
        // items drop in one after another, about two a second; taken out, they go at once
        if (calm || st.shown > st.n) st.shown = st.n;
        else if (st.shown < st.n) st.shown = Math.min(st.n, st.shown + dt * 2);
        draw();
        return st.up !== st.wantUp || st.shown !== st.n;
      };
      g.readout = () => `shopping basket · ${st.n} item${st.n === 1 ? "" : "s"} · handles ${st.wantUp > 0.5 ? "up" : "down"}`;
      draw();
      return g;
    },
  });
})();
