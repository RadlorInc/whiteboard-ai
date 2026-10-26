// "mechkeyboard cx cy k cap=0..1 press=0..1 lab=0 lit=…" — a PART (b34): keyboard.js's 60% mechanical keyboard (61
// keys) at real size, standing on a desk, its origin the desk point under its middle. A dark case on four rubber feet
// with a USB-C socket in its back (anchor `usb`), a steel plate inside its rim over the circuit board, a switch under
// every keycap; white keycaps with their letters, wide Tab, Caps, Shift, Enter, Backspace and the space bar. cap=1 lifts
// the right Alt keycap straight up off, clear of the rows (front row, so nothing hides it) and its switch shows cut open: housings, stem,
// spring, the two gold contact leaves at the back (the case is notched in front of it to show the section). press=1
// pushes the stem 4 mm down; at 2 mm the contacts touch and the key is sent. Anchor `key` = that key's top. Built in mm.
(() => {
  const K = window.K, T = window.TECH;
  const U = 19.05, LIFT = 64;   // the lifted cap rises clear of the rows behind it, into the air over the keyboard
  const ROWS = [
    [["`", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["Backspace", 2]],
    [["Tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1], ["\\", 1.5]],
    [["Caps", 1.75], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], [";", 1], ["'", 1], ["Enter", 2.25]],
    [["Shift", 2.25], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["/", 1], ["Shift", 2.75]],
    [["Ctrl", 1.25], ["Win", 1.25], ["Alt", 1.25], ["", 6.25], ["Alt", 1.25], ["Fn", 1.25], ["Menu", 1.25], ["Ctrl", 1.25]],
  ];
  const XL = -7.5 * U, YT = -2.5 * U, keys = [];
  ROWS.forEach((row, r) => { let x = XL; for (const [name, w] of row) { keys.push({ name, w, x0: x, x1: x + w * U, y0: YT + r * U, y1: YT + (r + 1) * U, r }); x += w * U; } });
  const CASE = { x: XL - 8, y: YT - 8, w: 15 * U + 16, d: 5 * U + 16, r: 5 };
  const KK = keys.filter((k) => k.name === "Alt")[1], XC = (KK.x0 + KK.x1) / 2, YC = (KK.y0 + KK.y1) / 2;

  ISO.add({
    name: "mechkeyboard", title: "Mechanical keyboard (part)", compare: null,
    about: "A 60% mechanical keyboard on a desk: lift one keycap off to see its key switch cut open, then press it: the stem squeezes the spring and at 2 mm lets two gold contacts touch, which closes the circuit for that key. anchors: key usb",
    line: "mechkeyboard cx cy k cap=0..1 press=0..1 lab=0 lit=case|plate|pcb|caps|housing|stem|spring|contacts",
    demo: { line: "mechkeyboard 480 330 16 lab=1", script: [{ set: {}, hold: 1 }, { set: { cap: 1 }, hold: "settle" }, { set: { press: 1, lit: "contacts" }, hold: "settle" }, { set: { press: 0, lit: "" }, hold: "settle" }, { set: { cap: 0, lit: "caps" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), Qs = B34.shift(Pm, [-XC, -YC, 0]), lab = o.lab === "1";
      const { PZ, PT, CB, CT, TRAVEL } = B34.SW, box = (x, y, z, tone = "mid", c = T.C.dark) => T.box(Pm, x, y, z, tone, c), out = [];
      const X1 = CASE.x + CASE.w, YF = CASE.y + CASE.d, H2 = 7, N0 = XC - H2, N1 = XC + H2;
      out.push(`<path class="iso-halo" d="${K.haloOf(CASE, 0, 4, Pm)}"/>`);
      out.push(`<g data-name="case">${K.corners(CASE, 18).sort((a, b) => K.depthOf([...a, 0], Pm) - K.depthOf([...b, 0], Pm)).map(([x, y]) => T.cyl(Pm, x, y, 5, 0, 2, "lo", T.C.rubber, 20)).join("")}</g>`);
      // a strip of the keyboard: floor, circuit board, plate, and the rim where it runs (the strip in front of the
      // open switch is left without its plate, so the section shows floor, circuit board and switch)
      const strip = (x0, x1, y0, y1, hole = false) => {
        const s = [`<g data-name="case">${box([x0, x1], [y0, y1], [2, 5])}`];
        const px = [Math.max(x0, XL), Math.min(x1, XL + 15 * U)], py = [Math.max(y0, YT), Math.min(y1, YT + 5 * U)];
        if (y0 < YT) s.push(box(px, [y0, YT], [5, CB]));
        s.push("</g>");
        if (py[1] > py[0]) {
          s.push(`<g data-name="pcb">${T.box(Pm, px, py, [5, 6.6], "mid", T.C.pcb)}</g>`);
          if (!hole) s.push(`<g data-name="plate">${box(px, py, [PZ, PT], "mid", T.C.alu)}</g>`);
        }
        s.push(`<g data-name="case">`);
        if (x0 < XL) s.push(box([x0, XL], [Math.max(y0, CASE.y), Math.min(y1, YF)], [5, CB]));
        if (x1 > XL + 15 * U) s.push(box([XL + 15 * U, x1], [Math.max(y0, CASE.y), Math.min(y1, YF)], [5, CB]));
        if (y1 > YT + 5 * U) s.push(box(px, [YT + 5 * U, y1], [5, CB]));
        return s.join("") + "</g>";
      };
      out.push(strip(CASE.x, X1, CASE.y, YC - H2), strip(CASE.x, N0, YC - H2, YF), strip(N0, N1, YC - H2, YC, true));
      out.push(`<g data-name="case">${T.quad(Pm, [[-6, CASE.y - 0.02, 7], [6, CASE.y - 0.02, 7], [6, CASE.y - 0.02, 10], [-6, CASE.y - 0.02, 10]], "#16181b", "#0d0e10", 0.5)}</g>`);
      const items = keys.filter((kk) => kk !== KK).map((kk) => ({ k: K.depthOf([(kk.x0 + kk.x1) / 2, (kk.y0 + kk.y1) / 2, CB], Pm), svg: B34.capSvg(Pm, kk) }));
      items.push({ k: K.depthOf([XC, YC, CB], Pm), svg: `<g data-part="sw"></g>` }, { k: K.depthOf([N1, YC, 8], Pm) + 0.01, svg: strip(N1, X1, YC - H2, YF) });
      items.sort((a, b) => a.k - b.k);
      out.push(`<g data-name="caps">${items.map((i) => i.svg).join("")}</g><g data-name="caps" data-part="cap"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      g.anchors = { key: [+(XC / 10).toFixed(2), +(YC / 10).toFixed(2), CT / 10], usb: [0, +(CASE.y / 10).toFixed(2), 0.85] };
      const memo = new Map(), sw = (q) => memo.get(q) || (memo.set(q, B34.switchSvg(Qs, q / 40)), memo.get(q));
      const st = { cap: B34.num(o.cap, 0, 0, 1), capT: 0, press: B34.num(o.press, 0, 0, 1), pressT: 0, lit: o.lit || "" };
      st.capT = st.cap; st.pressT = st.press;
      const draw = () => {
        const q = Math.round(st.press * 40);
        w.rebuild(el.sw, String(q), () => sw(q));
        const dz = Math.round((st.cap * LIFT - TRAVEL * st.press * (1 - st.cap)) * 4) / 4;
        w.rebuild(el.cap, String(dz), () => B34.capSvg(Pm, KK, dz));
        B34.light(w, g, st.lit);
        const closed = st.press > 0.47, open = st.cap > 0.5;
        w.rebuild(el.words, lab ? `${open} ${closed}` : "", () => !lab ? "" : open ? [
          T.word(Pm, [XC, YC, CT + LIFT], "keycap", { dy: -12 }),
          T.word(Pm, [XC + 7, YC, 12], closed ? "contacts touch: key sent" : "switch, cut open", { color: closed ? "#2c6a22" : "#444", anchor: "start", dx: 14, dy: 30 }),
        ].join("") : T.word(Pm, [0, YF, 5], "60% mechanical keyboard", { dy: 24 }));
      };
      g.set = (p) => {
        if (p.cap !== undefined) st.capT = B34.num(p.cap, st.capT, 0, 1);
        if (p.press !== undefined) st.pressT = B34.num(p.press, st.pressT, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // a key press is quick in life (about 1/20 s); here it is eased slow enough to follow
      g.update = (dt) => {
        const calm = ISO.still();
        st.cap = ISO.follow(st.cap, st.capT, dt, 0.25, calm); if (Math.abs(st.cap - st.capT) < 0.002) st.cap = st.capT;
        st.press = ISO.follow(st.press, st.pressT, dt, 0.3, calm); if (Math.abs(st.press - st.pressT) < 0.002) st.press = st.pressT;
        draw();
        return st.cap !== st.capT || st.press !== st.pressT;
      };
      g.readout = () => {
        const mm = st.press * TRAVEL;
        if (st.press > 0.005) return `stem down ${mm.toFixed(1)} of 4 mm · ${mm >= 2 ? "past 2 mm the contacts touch: the circuit for that key closes and the keyboard sends it (it checks every key about 1000 times a second)" : "the spring pushes back with about 45 g; the contacts close at 2 mm"}`;
        return st.cap > 0.5 ? "keycap off · the switch cut open: stem, spring, and the two gold contact leaves at the back" : "a 61-key mechanical keyboard: a switch under every key";
      };
      draw();
      return g;
    },
  });
})();
