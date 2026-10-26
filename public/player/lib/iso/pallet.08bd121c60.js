// "pallet cx cy k cartons=0..12 wrap=0|1 lab=0 lit=pallet|cartons|wrap" — a PART (batch 6, economy): a wooden shipping
// pallet on the floor with taped cartons stacked on it, its origin the floor point under its middle. A 120 × 80 cm,
// 14.4 cm tall pallet: three bottom boards, nine blocks (each with its stamped end), three stringer boards, five top
// deck boards with nail heads. Up to 12 cartons of 60 × 40 × 45 cm, four to a layer in three layers (1.5 m in all),
// stacked as they are loaded, one at a time; wrap=1 winds clear stretch film round the stack's sides. Goods in bulk
// between the factory and the shop. set({ cartons, wrap }). World: 1 = 1 cm. anchors: top (the deck's middle),
// fork (the near side's middle fork opening)
(() => {
  const K = window.K;
  const HX = 60, HY = 40, ZD = 14.4, CW = 60, CD = 40, CH = 45, N = 12;
  ISO.add({
    name: "pallet", title: "Pallet of cartons (part)", compare: null,
    about: "A 120 × 80 cm wooden pallet with up to 12 taped cartons stacked four to a layer (up to 1.5 m) and optional stretch film; goods in bulk between factory and shop. anchors: top fork",
    line: "pallet cx cy k cartons=0..12 wrap=0|1 lab=0 lit=pallet|cartons|wrap",
    demo: { line: "pallet 480 430 2.6 cartons=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { cartons: 12, lit: "cartons" }, hold: "settle" }, { set: { wrap: 1, lit: "wrap" }, hold: "settle" }, { set: { cartons: 5, wrap: 0, lit: "pallet" }, hold: "settle" }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { n: Math.round(B.num(o, "cartons", 6, 0, N)), wrap: o.wrap === "1" ? 1 : 0, f: 0, lit: o.lit || "", t: 0 };
      st.want = st.n; st.f = st.wrap;
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      // ── the pallet, built bottom up: bottom boards along x, blocks, stringers, deck boards along x
      const bx = [-HX, HX], blk = [[-HX, -HX + 14.5], [-7.25, 7.25], [HX - 14.5, HX]], rows = [[-HY, -HY + 10], [-5, 5], [HY - 10, HY]];
      let pal = rows.map((y) => box(bx, y, [0, 2.2])).join("");
      const ends = [];
      for (const y of rows) for (const x of blk) { pal += box(x, y, [2.2, 10]); ends.push([x[1] + 0.01, (y[0] + y[1]) / 2, 6.1]); }
      pal += rows.map((y) => box(bx, y, [10, 12.2])).join("");
      const deck = [-HY, -HY + 17, -7, 13, HY - 14.5].map((y, i) => [y, i === 4 ? HY : y + 14.5]);
      pal += deck.map((y) => box(bx, y, [12.2, ZD])).join("");
      const nails = []; for (const y of deck) for (const x of blk) for (const dy of [0.3, 0.7]) nails.push(K.iso([(x[0] + x[1]) / 2, y[0] + (y[1] - y[0]) * dy, ZD + 0.01], P));
      // the stamp on the near blocks' ends (a small printed square) and the nail heads
      const stamps = ends.filter(([x, y]) => x > HX - 1).map(([x, y, z]) => B.poly(P, [[x, y - 2.5, z - 2.5], [x, y + 2.5, z - 2.5], [x, y + 2.5, z + 2.5], [x, y - 2.5, z + 2.5]], "none", "#5a3e18", 0.5)).join("");
      // ── the cartons, built once in load order, painted far to near and bottom up
      const spots = []; for (let i = 0; i < N; i++) { const L = Math.floor(i / 4), j = i % 4; spots.push({ i, x: j % 2 ? 0 : -CW, y: j < 2 ? -CD : 0, z: ZD + L * CH }); }
      const paint = [...spots].sort((a, b) => a.z - b.z || a.x * 0.435 + a.y * 0.819 - (b.x * 0.435 + b.y * 0.819));
      const cartons = paint.map((s) => `<g data-i="${s.i}">${B.carton(P, [s.x + 0.3, s.x + CW - 0.3], [s.y + 0.3, s.y + CD - 0.3], [s.z, s.z + CH - 0.2])}</g>`).join("");
      g.innerHTML = `<path class="iso-halo" data-part="halo"/><g data-name="pallet">${ISO.tinted(B.OLDWOOD, pal)}${K.dotsSvg(nails, { size: 0.3 })}${stamps}</g>` +
        `<g data-name="cartons" data-part="cartons">${cartons}</g><g data-name="wrap" data-part="wrap"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZD], fork: [0, HY, 6] };
      const el = B.parts(g), w = ISO.writer(), each = [...el.cartons.children];
      // stretch film: a clear sheet round the near sides (+x, +y) of the loaded stack, with wound bands and glints
      const film = (z1, f) => {
        if (z1 <= ZD || f < 0.02) return "";
        const zt = ZD + (z1 - ZD) * f, e = 0.6, xs = HX + e, ys = HY + e;
        const face = (pts) => B.poly(P, pts, "#eaf4fa", "#9cb6c6", 0.5, ' fill-opacity=".32"');
        let s = face([[-HX, ys, ZD - 3], [xs, ys, ZD - 3], [xs, ys, zt], [-HX, ys, zt]]) + face([[xs, -HY, ZD - 3], [xs, ys, ZD - 3], [xs, ys, zt], [xs, -HY, zt]]);
        const bands = []; for (let z = ZD + 12; z < zt - 4; z += 22) bands.push([[-HX, ys, z], [xs, ys, z + 6], [xs, -HY, z + 10]]);
        s += B.free(P, bands, "#b8cdd9", 0.6, ' opacity=".8"') + B.free(P, [[[-HX + 20, ys + 0.02, ZD + 8], [-HX + 60, ys + 0.02, zt - 10]], [[xs + 0.02, -HY + 10, ZD + 20], [xs + 0.02, HY - 30, zt - 6]]], "#ffffff", 1.4, ' opacity=".75" stroke-linecap="round"');
        return s;
      };
      const draw = () => {
        for (const a of each) w.shown(a, +a.dataset.i < st.n);
        const z1 = ZD + Math.ceil(st.n / 4) * CH;
        w.rebuild(el.wrap, `${z1} ${Math.round(st.f * 20)}`, () => film(z1, Math.round(st.f * 20) / 20));
        w.attr(el.halo, "d", K.haloOf({ x: -HX - 2, y: -HY - 2, w: 2 * HX + 4, d: 2 * HY + 4, r: 2 }, 0, z1, P));
        if (lab) w.rebuild(el.words, `${st.n}`, () => B.word(P, [HX, HY, z1 + 8], `pallet, ${st.n} cartons`));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.cartons !== undefined) st.want = Math.round(B.num(p, "cartons", st.want, 0, N));
        if (p.wrap !== undefined) st.wrap = String(p.wrap) === "1" ? 1 : 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // a carton every 0.2 s; the film winds up the stack
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) st.n = st.want;
        else if (st.n !== st.want && (st.t += dt) >= 0.2) { st.t = 0; st.n += Math.sign(st.want - st.n); }
        st.f = ISO.follow(st.f, st.wrap, dt, 0.4, calm); if (Math.abs(st.f - st.wrap) < 0.01) st.f = st.wrap;
        draw();
        return st.n !== st.want || st.f !== st.wrap;
      };
      g.readout = () => `pallet 120 × 80 cm · ${st.want} carton${st.want === 1 ? "" : "s"} of 60 × 40 × 45 cm${st.wrap ? " · stretch-wrapped" : ""}`;
      draw();
      return g;
    },
  });
})();
