// "cashregister cx cy k on=0|1 show=ready|item|total|change amt=0..9999 out=0..1 rcpt=0..1 lab=0
// lit=drawer|keys|screen|pole|printer|receipt" — a PART (batch 6, money): a shop till 40 × 45 × 30 cm standing on a
// counter, its origin the counter point under its middle, the cashier's side toward the room (+y). Its base is a
// black steel cash drawer (five note slots, eight coin cups, on rails); on top: a sloped keyboard (number pad, 00 and
// point, CLEAR / CARD / CASH / TOTAL), the cashier's screen on a short post, the customer's pole display facing the
// customer's side (+x), and a receipt printer whose paper rises out of its slot. The screens show fixed modes, each
// with its own built-in word (READY, ITEM, TOTAL, CHANGE) and the amount amt to 2 places; on=0 they are dark.
// out slides the drawer open, rcpt runs the receipt out (0 none, 1 about 14 cm). set({ on, show, amt, out, rcpt }).
// World: 1 = 1 cm. anchors: top receipt drawer
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const W = 40, D = 45, H = 10, SHOWS = ["ready", "item", "total", "change"], WORD = { ready: "READY", item: "ITEM", total: "TOTAL", change: "CHANGE" };
  const BODY = ISO.tint("#e4e3df", ["#9d9b94", "#afada6", "#c1bfb8", "#d2d0ca"], "#45433d");
  const KEY = ISO.tint("#f4f3ef", ["#b9b7b0", "#c9c7c0", "#d8d6d0", "#e6e4de"], "#55534c");
  const PX0 = 11, PX1 = 19, PY0 = -2, PY1 = 12, PZ = 18, SLOT = 1.5, RX0 = 12, RX1 = 18, RMAX = 14;
  ISO.add({
    name: "cashregister", title: "Cash register (part)", compare: null,
    about: "A shop till 40 × 45 × 30 cm: cash drawer base with note slots and coin cups, sloped keyboard, the cashier's screen and the customer's pole display (fixed modes READY, ITEM, TOTAL, CHANGE with the amount), and a receipt printer; out opens the drawer, rcpt runs the receipt out. anchors: top receipt drawer",
    line: "cashregister cx cy k on=0|1 show=ready|item|total|change amt=0..9999 out=0..1 rcpt=0..1 lab=0 lit=drawer|keys|screen|pole|printer|receipt",
    demo: { line: "cashregister 480 330 9 on=1 show=ready amt=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { show: "item", amt: 3.5, lit: "keys" }, hold: 1.4 }, { set: { show: "total", amt: 12.75, lit: "screen" }, hold: 1.4 }, { set: { show: "change", amt: 7.25, out: 1, lit: "drawer" }, hold: "settle" }, { set: { rcpt: 1, lit: "receipt" }, hold: "settle" }, { set: { lit: "pole" }, hold: 1 }, { set: { out: 0, rcpt: 0, show: "ready", amt: 0, lit: "printer" }, hold: "settle" }, { set: { on: 0, lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { on: o.on === "0" ? 0 : 1, show: B.pick(o.show, SHOWS, "ready"), amt: B.num(o, "amt", 0, 0, 9999), out: B.num(o, "out", 0, 0, 1), rcpt: B.num(o, "rcpt", 0, 0, 1), lit: o.lit || "" };
      st.wOut = st.out; st.wR = st.rcpt;
      const dr = B.drawer(P, W, D, H), q = (pts, fill, stroke = "#2a2c30", w = 0.5) => B.quad(P, pts, fill, stroke, w);
      // the sloped keyboard deck: its top plane from (y = -6, z = 14) down to (y = 20, z = 11.2)
      const KY0 = -6, KY1 = 20, KZ0 = 14, KZ1 = 11.2, kx0 = -18, kx1 = 9, zAt = (y) => KZ0 + ((y - KY0) / (KY1 - KY0)) * (KZ1 - KZ0);
      const slopeUp = (() => { const a = [0, -(KY1 - KY0), KZ0 - KZ1], l = Math.hypot(a[1], a[2]); return [0, a[1] / l, a[2] / l]; })(), nrm = [0, -slopeUp[2], slopeUp[1]].map((v) => -v);
      const onDeck = (x, y, h = 0) => [x + nrm[0] * h, y + nrm[1] * h, zAt(y) + nrm[2] * h];
      const key = (x0, x1, y0, y1, label, tint = KEY, size = 0.9, color = "#3a3a36") => {
        const hk = 0.55, a = onDeck(x0, y0, hk), b = onDeck(x1, y0, hk), c = onDeck(x1, y1, hk), d = onDeck(x0, y1, hk), c0 = onDeck(x1, y1), d0 = onDeck(x0, y1), b0 = onDeck(x1, y0);
        return `<g style="${tint}">${q([d, c, c0, d0], "var(--anatomy-shade-1)", "var(--anatomy-hi)")}${q([b, c, c0, b0], "var(--anatomy-shade-0)", "var(--anatomy-hi)")}${q([a, b, c, d], "var(--anatomy-top)", "var(--anatomy-hi)")}</g>` +
          (label ? LAB.faceText(P, onDeck((x0 + x1) / 2, (y0 + y1) / 2 + 0.35, hk + 0.01), [1, 0, 0], B.say(label), size, color, slopeUp) : "");
      };
      const keys = () => {
        const out = [], pad = [["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"], ["0", "00", "."]], s = 2.3, gx = 0.45;
        pad.forEach((row, r) => row.forEach((lbl, c) => { const x0 = -6 + c * (s + gx), y0 = -1.5 + r * (s + gx + 0.6); out.push(key(x0, x0 + s, y0, y0 + s + 0.4, lbl)); }));
        // the big keys on the right of the pad, the function keys on the left
        const GREEN = ISO.tint("#d9efd6", ["#8fbf88", "#a2cb9b", "#b5d7af", "#c7e1c2"], "#2c5a22"), RED = ISO.tint("#f6d9d4", ["#d68a7e", "#df9d92", "#e8b0a7", "#efc4bc"], "#7a2a1e");
        out.push(key(2.6, 7.6, -1.5, 3.2, "CLEAR", RED, 0.7), key(2.6, 7.6, 4.1, 8.8, "CARD", KEY, 0.7), key(2.6, 7.6, 9.7, 17.2, "CASH", GREEN, 0.75));
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x0 = -17 + c * 3.4, y0 = -1.5 + r * 3.35; out.push(key(x0, x0 + 2.9, y0, y0 + 2.7, r === 3 && c === 2 ? "TOTAL" : "", KEY, 0.55)); }
        return out.join("");
      };
      const deck = ISO.tinted(BODY, ISO.prismX(P, [[KY0, H], [KY1, H], [KY1, KZ1], [KY0, KZ0]], kx0, kx1, ["#9d9b94", "#d2d0ca"], "#e4e3df", "#45433d"));
      // the back block, the screen's post and panel, the pole and its display, the printer
      const block = ISO.tinted(BODY, ISO.wbox(P, [-W / 2 + 0.5, W / 2 - 0.5], [-D / 2 + 0.5, -6], [H, 15], "mid")) + L(K.pathOf([K.iso([-W / 2 + 2, -8, 15], P), K.iso([W / 2 - 2, -8, 15], P)]), { tone: "faint", free: true });
      const post = ISO.tinted(BODY, S(K.cylinder(-5, -15, 1.4, 15, 1.6, P, 16), { tone: "mid" }));
      const panel = ISO.tinted(BODY, ISO.wbox(P, [-16, 6], [-15, -13.2], [16.5, 29], "mid"));
      const SX0 = -15, SX1 = 5, SZ0 = 17.6, SZ1 = 27.9, SY = -13.15;
      const glassQ = (x0, x1, z0, z1, y, fill) => q([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, "#15171a", 0.6);
      const pole = ISO.tinted(ISO.T.steel, S(K.cylinder(15, -17, 0.8, 15, 9.5, P, 14), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(K.cylinder(15, -17, 2.2, 15, 0.6, P, 18), { tone: "mid" }) + ISO.wbox(P, [13, 16], [-22, -12], [24, 28.6], "mid"));
      const PDY0 = -21.3, PDY1 = -12.7, PDZ0 = 24.7, PDZ1 = 27.9, PDX = 16.02;
      const printer = ISO.tinted(BODY, ISO.wbox(P, [PX0, PX1], [PY0, PY1], [H, PZ], "mid")) +
        ISO.tinted(ISO.T.plastic, ISO.wbox(P, [PX0 + 0.5, PX1 - 0.5], [SLOT + 0.6, PY1 - 0.5], [PZ, PZ + 0.3], "mid")) +
        q([[RX0 - 0.3, SLOT - 0.25, PZ + 0.01], [RX1 + 0.3, SLOT - 0.25, PZ + 0.01], [RX1 + 0.3, SLOT + 0.25, PZ + 0.01], [RX0 - 0.3, SLOT + 0.25, PZ + 0.01]], "#101113", "#101113") +
        LAB.faceText(P, [(PX0 + PX1) / 2, PY1 + 0.02, PZ - 2.5], [1, 0, 0], B.say("PRINT"), 0.9, "#55534c") +
        `<path d="${G.circleOf(LAB.Y([PX1 - 1.4, PY1, PZ - 2.8]), 0.03, 0.35, P)}" fill="#5fd06a" stroke="#1d3a20" stroke-width="0.4"/>`;
      const rc = B.receipt(RX1 - RX0, { items: 5, seed: 4 }), rLen = Math.min(RMAX, rc.len);
      // the receipt: its artwork laid with its top RMAX above the slot, shifted down by (RMAX - shown length), clipped at the slot
      const [rDefs, rOpen] = B.clip(B.above(P, [RX0 - 1, SLOT, PZ], [RX1 + 1, SLOT, PZ]));
      const paper = `<rect width="${RX1 - RX0}" height="${rc.len.toFixed(2)}" fill="#fbfbf7" stroke="#8d949c" stroke-width="0.05"/>${rc.svg}`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -W / 2 - 1, y: -D / 2 - 1, w: W + 2, d: D + 2 + dr.travel, r: 1 }, 0, 0.1, P)}"/>` +
        `<g data-name="drawer">${dr.back}</g><g data-part="tray"></g><g data-name="drawer">${dr.fore}</g>` +
        `<g data-name="screen">${block}${post}${panel}<g data-part="screen"></g></g><g data-name="pole">${pole}<g data-part="pole"></g></g>` +
        `<g data-name="keys">${deck}${keys()}</g><g data-name="printer">${printer}</g>` +
        `<defs>${rDefs}</defs><g data-name="receipt">${rOpen}<g data-part="rcpt">${B.flat(P, [RX0, SLOT, PZ + RMAX], [1, 0, 0], [0, 0, -1], paper)}</g></g></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, 30], receipt: [(RX0 + RX1) / 2, SLOT, PZ], drawer: [0, D / 2 + 1, H / 2] };
      const el = LAB.parts(g), w = ISO.writer(), o0 = K.iso([0, 0, 0], P), oy = K.iso([0, 1, 0], P), oz = K.iso([0, 0, 1], P);
      const money = (v) => v.toFixed(2);
      const screenSvg = (on, show, amt) => {
        if (!on) return glassQ(SX0, SX1, SZ0, SZ1, SY, "#1e2226");
        const art = [`<rect width="20" height="10.3" fill="#e9f1f6"/><rect width="20" height="1.6" fill="#2f6fae"/>`, B.text(0.6, 1.15, WORD[show], 0.95, "#ffffff", "start", 800)];
        for (let i = 0; i < 4; i++) art.push(`<rect x="0.8" y="${(2.5 + i * 1.2).toFixed(2)}" width="${(7 + B.rand(i + 9) * 5).toFixed(2)}" height="0.45" rx="0.2" fill="#a9b6c0"/><rect x="16" y="${(2.5 + i * 1.2).toFixed(2)}" width="3.2" height="0.45" rx="0.2" fill="#a9b6c0"/>`);
        art.push(`<rect x="0" y="7.3" width="20" height="3" fill="#ffffff"/>`, B.text(0.8, 9.4, WORD[show], 0.85, "#2f6fae", "start", 800), `<text x="19.2" y="9.6" text-anchor="end" fill="#15232e" style="font:800 2.1px 'Helvetica Neue',Arial,sans-serif">${money(amt)}</text>`);
        return glassQ(SX0, SX1, SZ0, SZ1, SY, "#e9f1f6") + B.flat(P, [SX0, SY + 0.01, SZ1], [1, 0, 0], [0, 0, -1], art.join(""));
      };
      // the pole display faces +x: its artwork runs along −y, upright
      const poleSvg = (on, show, amt) => {
        const back = q([[PDX, PDY1, PDZ0], [PDX, PDY0, PDZ0], [PDX, PDY0, PDZ1], [PDX, PDY1, PDZ1]], on ? "#0f2a22" : "#16191c", "#060708");
        if (!on) return back;
        const w8 = PDY1 - PDY0, art = B.text(0.3, 0.95, WORD[show], 0.7, "#62f2c4", "start", 800) + B.seg(w8 - 0.3, 2.9, money(amt), 1.15, "#62f2c4", "#173d33", 6);
        return back + B.flat(P, [PDX + 0.01, PDY1, PDZ1], [0, -1, 0], [0, 0, -1], art);
      };
      const draw = () => {
        w.rebuild(el.tray, "1", () => dr.tray(4));
        const s = st.out * dr.travel;
        w.attr(el.tray, "transform", `translate(${((oy[0] - o0[0]) * s).toFixed(2)} ${((oy[1] - o0[1]) * s).toFixed(2)})`);
        const key = `${st.on} ${st.show} ${money(st.amt)}`;
        w.rebuild(el.screen, key, () => screenSvg(st.on, st.show, st.amt));
        w.rebuild(el.pole, key, () => poleSvg(st.on, st.show, st.amt));
        const lift = (st.rcpt * rLen) - RMAX;
        w.attr(el.rcpt, "transform", `translate(${((oz[0] - o0[0]) * lift).toFixed(2)} ${((oz[1] - o0[1]) * lift).toFixed(2)})`);
        w.shown(el.rcpt, st.rcpt > 0.003);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([-W / 2, -D / 2, 32], P), "cash register", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = String(p.on) === "0" ? 0 : 1;
        if (p.show !== undefined) st.show = B.pick(p.show, SHOWS, st.show);
        if (p.amt !== undefined) st.amt = B.num(p, "amt", st.amt, 0, 9999);
        if (p.out !== undefined) st.wOut = B.num(p, "out", st.wOut, 0, 1);
        if (p.rcpt !== undefined) st.wR = B.num(p, "rcpt", st.wR, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.out = ISO.follow(st.out, st.wOut, dt, 0.3, calm); if (Math.abs(st.out - st.wOut) < 0.002) st.out = st.wOut;
        // the printer feeds paper at a steady 6 cm a second
        const step = (dt * 6) / rLen;
        st.rcpt = calm ? st.wR : st.rcpt < st.wR ? Math.min(st.wR, st.rcpt + step) : Math.max(st.wR, st.rcpt - step * 2);
        draw();
        return st.out !== st.wOut || st.rcpt !== st.wR;
      };
      g.readout = () => `cash register · ${st.on ? `${WORD[st.show]} ${money(st.amt)}` : "screens off"} · drawer ${st.wOut > 0.05 ? "open" : "shut"} · receipt ${st.wR > 0.01 ? `${(st.wR * rLen).toFixed(0)} cm out` : "in"}`;
      draw();
      return g;
    },
  });
})();
