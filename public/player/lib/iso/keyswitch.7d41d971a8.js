// "keyswitch cx cy k cap=0..1 press=0..1 lab=0 lit=cap|housing|stem|spring|contacts|board" — a PART (b34): one
// mechanical key switch of keyboard.js at real size (14 mm housing, 18.4 mm keycap), standing on a scrap of circuit
// board, its origin the bench point under its middle; its front half cut away. The bottom and top housings, the red
// cross stem, the coil spring under it, the two gold contact leaves at the back, and on the board the two copper
// traces that the leaves are soldered to. cap=1 lifts the keycap off; press=1 pushes the stem 4 mm down: the spring
// squeezes, and 2 mm down the stem's leg lets the moving leaf spring across to touch the fixed one. Anchor `top` = the
// keycap's top when it is on. Built in mm.
(() => {
  const K = window.K, T = window.TECH;
  const U = 19.05, LIFT = 14, Z0 = 5, CAP = { name: "A", mid: true, x0: -U / 2, x1: U / 2, y0: -U / 2, y1: U / 2 };
  ISO.add({
    name: "keyswitch", title: "Key switch, cut open (part)", compare: null,
    about: "One mechanical key switch cut open on a scrap of circuit board: lift the keycap, press the stem 4 mm and at 2 mm the two gold contacts touch and close the circuit; the spring pushes it back up. anchors: top",
    line: "keyswitch cx cy k cap=0..1 press=0..1 lab=0 lit=cap|housing|stem|spring|contacts|board",
    demo: { line: "keyswitch 480 400 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { cap: 1 }, hold: "settle" }, { set: { press: 1, lit: "contacts" }, hold: "settle" }, { set: { press: 0, lit: "spring" }, hold: "settle" }, { set: { cap: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), Q = B34.shift(Pm, [0, 0, Z0]), lab = o.lab === "1";
      const { CB, CT, BASE, TRAVEL } = B34.SW, out = [], PCB = { x: -13, y: -13, w: 26, d: 26, r: 1.5 };
      out.push(`<path class="iso-halo" d="${K.haloOf(PCB, Z0, 2, Q)}"/>`);
      // the board: green, its two copper traces from the leaves' pads out to the near edges, the pads round the pins
      const zt = BASE + 0.02, tr = (pts) => T.quad(Q, pts.map(([x, y]) => [x, y, zt]), "#d6956d", "#6e3a1c", 0.4);
      out.push(`<g data-name="board">${T.slab(Q, PCB, Z0, BASE - Z0, "mid", T.C.pcb, 3)}`);
      out.push(tr([[3.4, -4.6], [4.4, -4.6], [4.4, 12.9], [3.4, 12.9]]), tr([[5.6, -4.6], [12.9, -4.6], [12.9, -3.2], [5.6, -3.2]]));
      out.push(T.L(K.ring(3.9, -3.9, 1.1, zt, Q, 12) + K.ring(6.1, -3.9, 1.1, zt, Q, 12), { tone: "mid" }), "</g>");
      out.push(`<g data-part="sw"></g><g data-name="cap" data-part="cap"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      g.anchors = { top: [0, 0, +((CT - Z0) / 10).toFixed(2)] };
      const memo = new Map(), sw = (q) => memo.get(q) || (memo.set(q, B34.switchSvg(Q, q / 40, true)), memo.get(q));
      const st = { cap: B34.num(o.cap, 0, 0, 1), capT: 0, press: B34.num(o.press, 0, 0, 1), pressT: 0, lit: o.lit || "" };
      st.capT = st.cap; st.pressT = st.press;
      const draw = () => {
        const q = Math.round(st.press * 40);
        w.rebuild(el.sw, String(q), () => sw(q));
        const dz = Math.round((st.cap * LIFT - TRAVEL * st.press * (1 - st.cap)) * 8) / 8;
        w.rebuild(el.cap, String(dz), () => B34.capSvg(Q, CAP, dz));
        B34.light(w, g, st.lit);
        const closed = st.press > 0.47, open = st.cap > 0.5;
        w.rebuild(el.words, lab ? `${open} ${closed}` : "", () => !lab ? "" : open ? [
          T.word(Q, [0, 0, CT + LIFT], "keycap", { dy: -12 }),
          T.word(Q, [-3, 0, 19], "stem", { anchor: "end", dx: -40, dy: -4 }),
          T.word(Q, [-3, 0, 10], "spring", { anchor: "end", dx: -40, dy: 6 }),
          T.word(Q, [7, -4, 10], closed ? "contacts touch: key sent" : "contacts open", { color: closed ? "#2c6a22" : "#6b4f0e", anchor: "start", dx: 30, dy: 4 }),
        ].join("") : T.word(Q, [0, 0, CT], "key switch", { dy: -14 }));
      };
      g.set = (p) => {
        if (p.cap !== undefined) st.capT = B34.num(p.cap, st.capT, 0, 1);
        if (p.press !== undefined) st.pressT = B34.num(p.press, st.pressT, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.cap = ISO.follow(st.cap, st.capT, dt, 0.25, calm); if (Math.abs(st.cap - st.capT) < 0.002) st.cap = st.capT;
        st.press = ISO.follow(st.press, st.pressT, dt, 0.3, calm); if (Math.abs(st.press - st.pressT) < 0.002) st.press = st.pressT;
        draw();
        return st.cap !== st.capT || st.press !== st.pressT;
      };
      g.readout = () => {
        const mm = st.press * TRAVEL;
        if (st.press > 0.005) return `stem down ${mm.toFixed(1)} of 4 mm · ${mm >= 2 ? "the contacts touch: the circuit closes and the key is sent" : "the spring pushes back with about 45 g; the contacts close at 2 mm"}`;
        return st.cap > 0.5 ? "keycap off · the switch cut open: stem, spring, two gold contact leaves" : "a mechanical key switch with its keycap";
      };
      draw();
      return g;
    },
  });
})();
