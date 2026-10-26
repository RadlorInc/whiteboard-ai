// "shoptrolley cx cy k roll=0..1 items=0..10 lab=0 lit=basket|gate|seat|frame|handle|wheels|items" — a PART (batch 6,
// groceries): a wire supermarket trolley standing on the shop floor, its origin the floor point under its middle, its
// length along x (push handle at −x, nose at +x). 90 long × 55 wide × 100 cm tall: four swivel castors (12.5 cm
// wheels on forks and swivel plates), a steel chassis with a wire tray underneath, two side posts rising to the push
// handle with its plastic grip, and a deep wire basket (38 cm deep, its nose leaning out) whose back is a hinged gate
// carrying the folded child-seat flap (two leg holes). roll 0 → 1 pushes it 100 cm forward (+x), the wheels turning
// as they roll (2.5 turns); items 0..10 drop groceries into the basket one by one. set({ roll, items }).
// World: 1 = 1 cm. anchors: inside (the basket floor's middle), handle (the grip's middle) — placed at roll 0
(() => {
  const K = window.K, G = window.G;
  const WR = 6.25, ZB = 52, ZT = 88, ZH = 100, RUN = 100;
  const BOT = { b: -36, f: 30, yb: 24, yf: 20 }, TOP = { b: -40, f: 44, yb: 27, yf: 23 };
  const CASTORS = [[-35, -21], [30, -16], [-35, 21], [30, 16]];
  const ITEMS = [["loaf", -22, -9], ["tin", -8, -12], ["box", 6, -11], ["apple", 20, -8], ["carton", -26, 8], ["bottle", -14, 10], ["tin", -4, 4], ["loaf", 10, 8], ["apple", 24, 12], ["carton", -21, 0.5]];
  ISO.add({
    name: "shoptrolley", title: "Shopping trolley (part)", compare: null,
    about: "A wire supermarket trolley, 90 × 55 × 100 cm: deep wire basket with a hinged back gate and folded child seat, push handle, four castor wheels; roll pushes it forward with the wheels turning, items 0..10 fill the basket. anchors: inside handle",
    line: "shoptrolley cx cy k roll=0..1 items=0..10 lab=0 lit=basket|gate|seat|frame|handle|wheels|items",
    demo: { line: "shoptrolley 330 470 3.6 roll=0 items=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { items: 5, lit: "items" }, hold: "settle" }, { set: { items: 10, lit: "seat" }, hold: "settle" }, { set: { roll: 0.6, lit: "wheels" }, hold: "settle" }, { set: { roll: 0, items: 3, lit: "gate" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { roll: B.num(o, "roll", 0, 0, 1), n: Math.round(B.num(o, "items", 0, 0, 10)), lit: o.lit || "" };
      st.want = st.roll; st.shown = st.n;
      const kS = G.scaleOf(P), at = (p) => K.iso(p, P);
      // a steel tube along world points: dark outline, light core, a thin highlight
      const tube = (pts, r = 1.1, core = "#c7c9cd", ink = "#3c3f45") => { const d = K.pathOf(pts.map(at)), wd = Math.max(1.2, kS * 2 * r); return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${wd.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${core}" stroke-width="${(wd * 0.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`; };
      const wireCol = "#7d8189", wireW = Math.max(0.6, kS * 0.45).toFixed(2);
      // a wire mesh over a quad (bilinear in s along a→b, h from the bottom edge to the top edge)
      const mesh = (b0, b1, t1, t0, ns, nh) => {
        const W = (s, h) => [0, 1, 2].map((i) => { const a = b0[i] + (b1[i] - b0[i]) * s, c = t0[i] + (t1[i] - t0[i]) * s; return a + (c - a) * h; });
        const d = [];
        for (let i = 0; i <= ns; i++) d.push(K.pathOf([at(W(i / ns, 0)), at(W(i / ns, 1))]));
        for (let j = 0; j <= nh; j++) d.push(K.pathOf([at(W(0, j / nh)), at(W(1, j / nh))]));
        return `<path d="${d.join("")}" fill="none" stroke="${wireCol}" stroke-width="${wireW}" stroke-linecap="round"/>`;
      };
      const c = (end, sy, top) => { const q = top ? TOP : BOT; return [end === "b" ? q.b : q.f, sy * (end === "b" ? q.yb : q.yf), top ? ZT : ZB]; };
      // ── the castors (far side first): swivel plate, fork, rubber wheel turning by `turn`, hub, three spoke marks
      const castor = ([x, y]) => {
        const F = LAB.Y([x, y, WR]), out = [];
        out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 3.5, x + 3.5], [y - 2.5, y + 2.5], [13.2, 14], "mid") + ISO.wbox(P, [x - 1, x + 1], [y - 2.2, y - 1.6], [WR, 13.2], "mid")));
        out.push(ISO.tinted(ISO.T.rubber, K.solidSvg(G.disc(-1.2, 1.2, WR, F, P), { tone: "mid" })));
        out.push(`<path d="${G.circleOf(F, 1.25, WR * 0.55, P, 24)}" fill="#9a9da3" stroke="#3c3f45" stroke-width="0.6"/>`);
        // the near fork arm stops above the hub cap (the axle nut shows on the cap)
        out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 1, x + 1], [y + 1.6, y + 2.2], [WR + WR * 0.58, 13.2], "mid")));
        return out.join("");
      };
      // the three spoke marks on a wheel's cap, turned by `turn` (radians), and the axle nut
      const spokes = (list, turn) => list.map(([x, y]) => {
        const hub = at([x, y + 1.3, WR]), d = [0, 1, 2].map((i) => { const a = turn + (i * Math.PI * 2) / 3; return K.pathOf([hub, at([x + Math.cos(a) * WR * 0.5, y + 1.26, WR + Math.sin(a) * WR * 0.5])]); }).join("");
        return `<path d="${d}" stroke="#55575c" stroke-width="${Math.max(0.6, kS * 0.5).toFixed(2)}" stroke-linecap="round"/><circle cx="${hub[0].toFixed(1)}" cy="${hub[1].toFixed(1)}" r="${Math.max(0.8, kS * 0.6).toFixed(2)}" fill="#c7c9cd" stroke="#3c3f45" stroke-width="0.5"/>`;
      }).join("");
      // ── the chassis: side rails, cross bars, the wire tray, the side posts, struts to the basket
      const frameSvg = (side) => {
        const sy = side, out = [];
        out.push(tube([[-37, 21 * sy, 14], [32, 16 * sy, 14]], 1.2));
        out.push(tube([[-37, 21 * sy, 14], [-41, 25 * sy, 58], [-44, 25 * sy, ZH]], 1.3));
        out.push(tube([[30, 16 * sy, 14], [30, 19 * sy, ZB]], 0.9));
        return out.join("");
      };
      const tray = () => mesh([-34, -18, 17], [28, -14, 17], [28, 14, 17], [-34, 18, 17], 12, 6) + tube([[-37, -21, 14], [-37, 21, 14]], 1.2) + tube([[32, -16, 14], [32, 16, 14]], 1.2);
      const handleSvg = () => {
        const F = LAB.Y([-44, 0, ZH]);
        return tube([[-44, -25, ZH], [-44, 25, ZH]], 1.1) + ISO.tinted(ISO.T.blue, K.solidSvg(G.disc(-19, 19, 1.8, F, P), { tone: "mid", inner: K.lineSvg(G.ribsOf(F, -19, 19, 1.8, 10, P, { seams: true }), { tone: "faint" }) }));
      };
      // ── the basket: far side wall, gate (back), floor, then near side wall and the nose (front)
      const sideWall = (sy) => mesh(c("b", sy), c("f", sy), c("f", sy, 1), c("b", sy, 1), 18, 7) + tube([c("b", sy, 1), c("f", sy, 1)], 0.6) + tube([c("b", sy), c("f", sy)], 0.5);
      const gate = () => mesh(c("b", -1), c("b", 1), c("b", 1, 1), c("b", -1, 1), 12, 7) + tube([c("b", -1, 1), c("b", 1, 1)], 0.7) + tube([c("b", -1), c("b", 1)], 0.5) +
        // the hinge loops at the gate's top corners
        [-1, 1].map((sy) => { const p = at(c("b", sy * 0.92, 1)); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(kS * 1.2).toFixed(2)}" fill="none" stroke="#3c3f45" stroke-width="${(kS * 0.5).toFixed(2)}"/>`; }).join("");
      const seat = () => {
        // the folded child-seat flap: a plastic panel lying against the gate's inside, with two leg holes
        const W = (s, h) => { const b0 = c("b", -1), b1 = c("b", 1), t1 = c("b", 1, 1), t0 = c("b", -1, 1); return [0, 1, 2].map((i) => { const a = b0[i] + (b1[i] - b0[i]) * s, cc = t0[i] + (t1[i] - t0[i]) * s; return a + (cc - a) * h + (i === 0 ? 1.2 : 0); }); };
        const q = (s0, s1, h0, h1) => K.pathOf([W(s0, h0), W(s1, h0), W(s1, h1), W(s0, h1)].map(at), true);
        const hole = (sc) => { const pts = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; pts.push(at(W(sc + Math.cos(a) * 0.07, 0.42 + Math.sin(a) * 0.08))); } return K.pathOf(pts, true); };
        return `<path d="${q(0.18, 0.82, 0.3, 0.92)}${hole(0.38)}${hole(0.62)}" fill="#3d7fc4" fill-rule="evenodd" stroke="#1f4f8f" stroke-width="0.8"/><path d="${q(0.24, 0.76, 0.62, 0.86)}" fill="none" stroke="#bad6f2" stroke-width="0.6" opacity=".8"/>`;
      };
      const floor = mesh(c("b", -1), c("f", -1), c("f", 1), c("b", 1), 14, 8);
      const nose = mesh(c("f", -1), c("f", 1), c("f", 1, 1), c("f", -1, 1), 10, 7) + tube([c("f", -1, 1), c("f", 1, 1)], 0.6) + tube([c("f", -1), c("f", 1)], 0.5);
      g.innerHTML = `<g data-part="move"><path class="iso-halo" d="${K.haloOf({ x: -42, y: -24, w: 82, d: 48, r: 6 }, 0, ZH, P)}"/>` +
        `<g data-name="wheels">${CASTORS.slice(0, 2).map(castor).join("")}<g data-part="sFar"></g></g><g data-name="frame">${frameSvg(-1)}${ISO.tinted(ISO.T.steel, tray())}</g>` +
        `<g data-name="handle">${handleSvg()}</g>` +
        `<g data-name="basket">${sideWall(-1)}</g><g data-name="gate">${gate()}</g><g data-name="seat">${seat()}</g><g data-name="basket">${floor}</g>` +
        `<g data-name="items" data-part="items"></g>` +
        `<g data-name="frame">${frameSvg(1)}</g><g data-name="wheels">${CASTORS.slice(2).map(castor).join("")}<g data-part="sNear"></g></g><g data-name="basket">${sideWall(1)}${nose}</g><g data-part="words"></g></g>`;
      g.anchors = { inside: [-3, 0, ZB], handle: [-44, 0, ZH] };
      const el = LAB.parts(g), w = ISO.writer();
      const order = ITEMS.map((it, i) => i).sort((a, b) => K.depthOf([ITEMS[a][1], ITEMS[a][2], 0], P) - K.depthOf([ITEMS[b][1], ITEMS[b][2], 0], P));
      const slots = []; order.forEach((i) => { slots[i] = mk("g", {}, el.items); });
      const rise = K.iso([0, 0, 1], P)[1] - K.iso([0, 0, 0], P)[1], step = [K.iso([1, 0, 0], P)[0] - K.iso([0, 0, 0], P)[0], K.iso([1, 0, 0], P)[1] - K.iso([0, 0, 0], P)[1]];
      const draw = () => {
        const r = Math.round(st.roll * 500) / 500, turn = -(r * RUN) / WR, s = Math.round(st.shown * 30) / 30;
        w.rebuild(el.sFar, `${r}`, () => spokes(CASTORS.slice(0, 2), turn));
        w.rebuild(el.sNear, `${r}`, () => spokes(CASTORS.slice(2), turn));
        w.attr(el.move, "transform", `translate(${(step[0] * r * RUN).toFixed(2)} ${(step[1] * r * RUN).toFixed(2)})`);
        ITEMS.forEach(([kind, x, y], i) => {
          const on = s > i, e = slots[i];
          if (on && !e._built) { e._built = true; e.innerHTML = B.item(P, kind, [x, y, ZB + 0.5], i); }
          w.shown(e, on);
          if (on) w.attr(e, "transform", `translate(0 ${(rise * 25 * ISO.ease(1 - ISO.clamp(s - i, 0, 1))).toFixed(2)})`);
        });
        if (lab) w.rebuild(el.words, `${st.n}`, () => ISO.word(at([0, 0, ZH + 6]), st.n ? `trolley, ${st.n} items` : "shopping trolley", "#556", { size: 13 }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.roll !== undefined) st.want = B.num(p, "roll", st.want, 0, 1);
        if (p.items !== undefined) st.n = Math.round(B.num(p, "items", st.n, 0, 10));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.roll = ISO.follow(st.roll, st.want, dt, 0.5, calm); if (Math.abs(st.roll - st.want) < 0.001) st.roll = st.want;
        if (calm || st.shown > st.n) st.shown = st.n;
        else if (st.shown < st.n) st.shown = Math.min(st.n, st.shown + dt * 2.5);
        draw();
        return st.roll !== st.want || st.shown !== st.n;
      };
      g.readout = () => `shopping trolley · ${st.n} item${st.n === 1 ? "" : "s"} · pushed ${Math.round(st.want * RUN)} cm`;
      draw();
      return g;
    },
  });
})();
