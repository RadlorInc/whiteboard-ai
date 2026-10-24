// "keyboard cx cy width cap=0..1 press=0..1 lab=1 lit=caps|switch|stem|spring|contacts|plate" — a mechanical
// keyboard (61 keys, the 60% layout). A dark case on rubber feet with a USB-C socket in its back, a steel plate inside
// its rim, and on the plate a key switch under every keycap; white keycaps with their letters, wider keys for Tab,
// Caps, Shift, Enter, Backspace and the space bar. cap=1 lifts one keycap straight off (the right Alt key, front row, so nothing hides it) and its switch shows
// cut open: the top and bottom housings, the stem with its cross on top, the coil spring under it, and at the back the
// two gold contact leaves. press=1 pushes the stem down 4 mm: the spring squeezes, and 2 mm down the stem's leg lets
// the moving leaf spring across to touch the fixed one: the circuit closes and the keyboard sends the key.
// set({ cap, press, lit }). 1 unit = 1 mm; 1 key unit = 19.05 mm.
(() => {
  const K = window.K, T = window.TECH;
  const U = 19.05, PZ = 14, PT = 15.5, CB = 16, CT = 24.5, TRAVEL = 4;       // plate, cap bottom, cap top, travel
  const ROWS = [
    [["`", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["Backspace", 2]],
    [["Tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1], ["\\", 1.5]],
    [["Caps", 1.75], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], [";", 1], ["'", 1], ["Enter", 2.25]],
    [["Shift", 2.25], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["/", 1], ["Shift", 2.75]],
    [["Ctrl", 1.25], ["Win", 1.25], ["Alt", 1.25], ["", 6.25], ["Alt", 1.25], ["Fn", 1.25], ["Menu", 1.25], ["Ctrl", 1.25]],
  ];
  const XL = -7.5 * U, YT = -2.5 * U;                                       // the plate's key grid: 15 × 5 units
  const keys = [];
  ROWS.forEach((row, r) => { let x = XL; for (const [name, w] of row) { keys.push({ name, w, x0: x, x1: x + w * U, y0: YT + r * U, y1: YT + (r + 1) * U, r }); x += w * U; } });
  const CASE = { x: XL - 8, y: YT - 8, w: 15 * U + 16, d: 5 * U + 16, r: 5 };

  ISO.add({
    name: "keyboard", title: "Mechanical keyboard", compare: "keyboard 480 270 520",
    about: "A mechanical keyboard: lift one keycap to see the key switch cut open, then press it: the stem squeezes the spring and lets two gold contacts touch, which closes the circuit for that key.",
    line: "keyboard cx cy width cap=0..1 press=0..1 lab=1 lit=caps|switch|stem|spring|contacts|plate",
    demo: { line: "keyboard 480 270 520", script: [{ set: { cap: 1 }, hold: "settle" }, { set: { press: 1 }, hold: "settle" }, { set: { press: 0 }, hold: "settle" }] },
    make([cx, cy, size = 520], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.62, H = size * 0.86, LIFT = 30;
      const kk = keys.filter((k) => k.name === "Alt")[1], XC = (kk.x0 + kk.x1) / 2, YC = (kk.y0 + kk.y1) / 2;
      const { P, g } = ISO.frame([...K.boxCorners(CASE, 0, CT), [XC, YC, CT + LIFT + 4]], cx, cy, W, H, { azimuth: 66, elevation: 38, pad: size * 0.03 }, parent);
      const box = (x, y, z, tone = "mid", c = T.C.dark, lit) => T.box(P, x, y, z, tone, c, lit), out = [];
      // ── the case: halo, feet, then a hollow tray built in strips: the strip in front of the open switch is cut away
      // (a notch from the switch's middle to the front edge), so the section shows floor, circuit board and plate
      const X1 = CASE.x + CASE.w, YF = CASE.y + CASE.d, H2 = 7, N0 = XC - H2, N1 = XC + H2;
      out.push(`<path class="iso-halo" d="${K.haloOf(CASE, 0, 4, P)}"/>`);
      for (const [x, y] of K.corners(CASE, 18).sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P))) out.push(T.cyl(P, x, y, 5, 0, 2, "lo", T.C.rubber, 20));
      // a strip of the keyboard between x0 and x1 and y0 and y1: floor, circuit board, plate, and the rim where it runs
      const strip = (x0, x1, y0, y1, hole = false) => {
        const s = [box([x0, x1], [y0, y1], [2, 5])];
        const px = [Math.max(x0, XL), Math.min(x1, XL + 15 * U)], py = [Math.max(y0, YT), Math.min(y1, YT + 5 * U)];
        if (y0 < YT) s.push(box(px, [y0, YT], [5, CB]));
        if (py[1] > py[0]) {
          s.push(`<g data-name="pcb">${T.box(P, px, py, [5, 6.6], "mid", T.C.pcb)}</g>`);
          if (!hole) s.push(`<g data-name="plate">${box(px, py, [PZ, PT], "mid", T.C.alu)}</g>`);
        }
        if (x0 < XL) s.push(box([x0, XL], [Math.max(y0, CASE.y), Math.min(y1, YF)], [5, CB]));
        if (x1 > XL + 15 * U) s.push(box([XL + 15 * U, x1], [Math.max(y0, CASE.y), Math.min(y1, YF)], [5, CB]));
        if (y1 > YT + 5 * U) s.push(box(px, [YT + 5 * U, y1], [5, CB]));
        return s.join("");
      };
      out.push(strip(CASE.x, X1, CASE.y, YC - H2), strip(CASE.x, N0, YC - H2, YF), strip(N0, N1, YC - H2, YC, true));
      out.push(T.quad(P, [[-6, CASE.y - 0.02, 7], [6, CASE.y - 0.02, 7], [6, CASE.y - 0.02, 10], [-6, CASE.y - 0.02, 10]], "#16181b", "#0d0e10", 0.5));
      // ── the keycaps: tapered, with their letters on top; sorted far to near with the open switch's upper half
      const capSvg = (k, dz = 0, lit = false) => {
        const a = [k.x0 + 0.6, k.x1 - 0.6, k.y0 + 0.6, k.y1 - 0.6], b = [a[0] + 2.6, a[1] - 2.6, a[2] + 3.2, a[3] - 1.6], z0 = CB + dz, z1 = CT + dz;
        const V = [[a[0], a[2], z0], [a[1], a[2], z0], [a[1], a[3], z0], [a[0], a[3], z0], [b[0], b[2], z1], [b[1], b[2], z1], [b[1], b[3], z1], [b[0], b[3], z1]];
        const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
        const big = k.name.length > 1, sz = big ? 2.6 : 4.2;
        const txt = k.name ? T.flat(P, [b[0] + 1.6, b[2] + 1.2, z1 + 0.02], [1, 0, 0], [0, 1, 0], T.text(0, sz, k.name.replace("&", "&amp;").replace("<", "&lt;"), sz, "#2a2e33", "start", 600)) : "";
        return ISO.tinted(T.C.white, ISO.poly(V, F, P, "hi", lit)) + txt;
      };
      const items = keys.filter((k) => k !== kk).map((k) => ({ k: K.depthOf([(k.x0 + k.x1) / 2, (k.y0 + k.y1) / 2, CB], P), svg: capSvg(k) }));
      items.push({ k: K.depthOf([XC, YC, CB], P), svg: `<g data-part="sw"></g>` }, { k: K.depthOf([N1, YC, 8], P) + 0.01, svg: strip(N1, X1, YC - H2, YF) });
      items.sort((a, b) => a.k - b.k);
      out.push(`<g data-name="caps">${items.map((i) => i.svg).join("")}</g><g data-part="cap"></g>`);
      // the camera zooms in on the opened switch (inside this figure's own frame, clipped to it), so its parts read
      const id = `kbz${T.uid++}`, SW = K.iso([XC, YC, PT], P), FC = [W * 0.5, H * 0.66], ZOOM = 2.6;
      g.innerHTML = `<defs><clipPath id="${id}"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${id})"><g data-part="zoom">${out.join("")}</g></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();

      // ── the switch, its front half cut away at y = YC. Below the plate: the bottom housing's back half (floor, back
      // and side walls), the two contact leaves at the back, the lower spring turns and the stem's leg and pole.
      const coilPts = (z0, z1, turns = 5, r = 2.6) => Array.from({ length: turns * 24 + 1 }, (_, i) => { const a = (i / 24) * Math.PI * 2 + Math.PI / 2; return [XC + r * Math.cos(a), YC + r * Math.sin(a), z0 + ((z1 - z0) * i) / (turns * 24)]; });
      const coil = (pts, front) => { const runs = []; let cur = [];
        for (const p of pts) { const isF = p[1] > YC + 0.2; if (isF === front) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; } }
        if (cur.length) runs.push(cur);
        return `<path d="${runs.filter((r) => r.length > 1).map((r) => K.pathOf(r.map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="${front ? "#4a5058" : "#8d9096"}" stroke-width="${front ? 1.1 : 0.9}" stroke-linecap="round"/>`; };
      const HOUSE = T.C.dark;
      const parts = () => [...g.querySelectorAll("[data-name]")];
      const switchSvg = (pr) => {
        const dz = -TRAVEL * pr, sb = 14.5 + dz, F0 = 7.4;                       // stem's underside, housing floor
        const closed = ISO.smooth(0.4, 0.55, pr), tip = XC + 4.2 + 1.4 * (1 - closed);
        const s = [box([XC - 7, XC + 7], [YC - 7, YC], [6.6, F0], "mid", HOUSE), box([XC - 7, XC + 7], [YC - 7, YC - 6], [F0, PZ], "mid", HOUSE), box([XC - 7, XC - 6], [YC - 6, YC], [F0, PZ], "mid", HOUSE)];
        // the two gold contact leaves at the back right: fixed, and the moving one that springs across when let go
        const leaves = [box([XC + 3.6, XC + 4.2], [YC - 5.8, YC - 2], [F0, 11.6], "hi", T.C.gold, closed > 0.5)];
        leaves.push(ISO.tinted(T.C.gold, ISO.poly([[XC + 5.8, YC - 5.8, F0], [XC + 6.4, YC - 5.8, F0], [tip + 0.6, YC - 5.8, 11.4], [tip, YC - 5.8, 11.4], [XC + 5.8, YC - 2, F0], [XC + 6.4, YC - 2, F0], [tip + 0.6, YC - 2, 11.4], [tip, YC - 2, 11.4]], ISO.BOX_F, P, "hi", closed > 0.5)));
        s.push(`<g data-name="contacts">${leaves.join("")}</g>`, `<g data-name="spring">${coil(coilPts(F0, sb), false)}</g>`);
        // (the stem stands on the spring, a drawn line audit.mjs doesn't record, so it lists the stem's boxes as loose)
        // the stem: centre pole inside the spring, the leg that holds the leaves apart until it slides down, the body,
        // the cross the keycap fits on
        const stem = [box([XC - 0.9, XC + 0.9], [YC - 0.9, YC + 0.9], [Math.max(F0 + 0.4, sb - 6), sb], "hi", ISO.T.red), box([XC + 4.5, XC + 5.4], [YC - 1.9, YC - 0.9], [Math.max(F0 + 0.4, sb - 3.4), sb], "hi", ISO.T.red)];
        s.push(`<g data-name="spring">${coil(coilPts(F0, sb), true)}</g>`, box([XC + 6, XC + 7], [YC - 6, YC], [F0, PZ], "mid", HOUSE));
        s.push(`<g data-name="stem">${stem.join("")}${box([XC - 3, XC + 3], [YC - 3, YC + 3], [sb, 19.6 + dz], "hi", ISO.T.red)}${box([XC + 3, XC + 5.4], [YC - 1.9, YC - 0.9], [sb, sb + 1.2], "hi", ISO.T.red)}${box([XC - 2, XC + 2], [YC - 0.6, YC + 0.6], [19.6 + dz, 23.4 + dz], "hi", ISO.T.red)}${box([XC - 0.6, XC + 0.6], [YC - 2, YC + 2], [19.6 + dz, 23.4 + dz], "hi", ISO.T.red)}</g>`);
        // above the plate: the top housing's back half with the stem's window in its roof
        const top = [box([XC - 7, XC + 7], [YC - 7, YC - 6], [PT, 20.4], "mid", HOUSE), box([XC - 7, XC - 6], [YC - 6, YC], [PT, 20.4], "mid", HOUSE), box([XC + 6, XC + 7], [YC - 6, YC], [PT, 20.4], "mid", HOUSE)];
        top.push(box([XC - 6, XC + 6], [YC - 6, YC - 4.6], [19.4, 20.4], "mid", HOUSE), box([XC - 6, XC - 4.6], [YC - 4.6, YC], [19.4, 20.4], "mid", HOUSE), box([XC + 4.6, XC + 6], [YC - 4.6, YC], [19.4, 20.4], "mid", HOUSE));
        return s.join("") + `<g data-name="switch">${top.join("")}</g>`;
      };
      const memo = new Map(), sw = (q) => memo.get(q) || (memo.set(q, switchSvg(q / 40)), memo.get(q));
      const st = { cap: ISO.clamp(ISO.num(o, "cap", 0), 0, 1), capT: 0, press: ISO.clamp(ISO.num(o, "press", 0), 0, 1), pressT: 0, lit: o.lit || "" };
      st.capT = st.cap; st.pressT = st.press;
      const draw = () => {
        const q = Math.round(st.press * 40), s = sw(q);
        w.rebuild(el.sw, String(q), () => s);
        const dz = st.cap * LIFT - TRAVEL * st.press;
        w.rebuild(el.cap, (dz * 4).toFixed(0), () => `<g data-name="caps">${capSvg(kk, Math.round(dz * 4) / 4)}</g>`);
        const all = parts(); w.light(all, all.filter((p) => p.dataset.name === st.lit));
        const closed = st.press > 0.47, open = st.cap > 0.5, k = ISO.smooth(0, 1, st.cap), z = 1 + (ZOOM - 1) * k;
        const ft = [SW[0] + (FC[0] - SW[0]) * k, SW[1] + (FC[1] - SW[1]) * k];
        w.attr(el.zoom, "transform", k > 0 ? `translate(${ft[0].toFixed(2)} ${ft[1].toFixed(2)}) scale(${z.toFixed(4)}) translate(${(-SW[0]).toFixed(2)} ${(-SW[1]).toFixed(2)})` : "");
        const at = (p) => { const a = K.iso(p, P); return [ft[0] + z * (a[0] - SW[0]), ft[1] + z * (a[1] - SW[1])]; };
        const word = (p, text, { color = "#444", anchor = "middle", dx = 0, dy = 0 } = {}) => { const a = at(p); return ISO.word([a[0] + dx, a[1]], text, color, { anchor, size: 13, dy }); };
        const still = k < 0.01 || k > 0.99;                                       // labels wait until the zoom settles
        w.rebuild(el.words, lab && still ? `${open} ${closed}` : "", () => !lab || !still ? "" : open ? [
          word([XC, YC, CT + LIFT], "keycap", { dy: -14 }),
          word([XC - 3, YC, 20], "stem", { anchor: "end", dx: -30, dy: -6 }),
          word([XC - 3, YC, 10], "spring", { anchor: "end", dx: -30, dy: 6 }),
          word([XC + 7, YC - 4, 10], closed ? "contacts touch: key sent" : "contacts open", { color: closed ? "#2c6a22" : "#6b4f0e", anchor: "start", dx: 18, dy: 10 }),
          word([XC, YC + 9, 4], "circuit board", { anchor: "end", dx: -40, dy: 26 }),
        ].join("") : word([XC, YC, CT], "this key", { dy: -16, color: "#1f4f8f" }));
      };
      g.set = (p) => {
        if (p.cap !== undefined) st.capT = ISO.clamp(+p.cap, 0, 1);
        if (p.press !== undefined) st.pressT = ISO.clamp(+p.press, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
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
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
