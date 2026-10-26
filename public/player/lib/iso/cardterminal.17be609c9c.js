// "cardterminal cx cy k amt=0..9999 card=0..1 receipt=0..1 tick=0..1 lab=0 lit=body|screen|keypad|printer|receipt|card"
// — a PART (batch 6, money): a handheld card payment terminal, 8 × 17 cm and 5 cm high at its printer, lying on a
// counter, its origin the counter point under its middle, the printer end toward the wall (−y) and the chip slot
// toward the room (+y). A dark plastic body, the printer housing with its paper slot and the contactless tap mark on
// top, a colour screen in its bezel, a rubber keypad (1–9, * 0 #, and the red, yellow and green keys), the chip slot
// in the front end. The screen shows fixed words only: PRESENT CARD with TOTAL and the amount (amt, two decimals, no
// currency sign); ENTER PIN with four dots once the card is in; APPROVED with a tick drawn as tick goes 0 → 1.
// card 0 → 1 pushes a plain bank card into the chip slot (no brand); receipt 0 → 1 feeds a printed slip up out of
// the printer, curling back. set({ amt, card, receipt, tick }). 1 = 1 cm.
// anchors: slot (the chip slot's mouth) tap (the tap mark, where a phone or card is held) paper (the printer slot)
(() => {
  const K = window.K;
  const HX = 4, HY = 8.5, BZ = 2.6, PZ = 4.8, PY = -3, SL = -7.9;
  const BODY = ISO.tint("#4a4e55", ["#24272b", "#2c2f34", "#34373c", "#3d4046"], "#101113");
  const KEY = ISO.tint("#d9dbde", ["#8f9399", "#a1a5ab", "#b3b6bb", "#c6c8cc"], "#3c3f45");
  const COLK = { red: ISO.tint("#e0574d", ["#8f2a22", "#a2342b", "#b43e34", "#c5483e"], "#4a120d"), yellow: ISO.tint("#f2c94c", ["#a8811a", "#b98f22", "#c99d2c", "#d9ad3a"], "#5a4206"), green: ISO.tint("#4caf6a", ["#1f6a36", "#26793f", "#2e8848", "#379853"], "#0e3a1b") };
  const CARD = ISO.tint("#4b7fc0", ["#1c3a63", "#24477a", "#2f5f9e", "#3a6fb0"], "#10233d");
  const SW = 6.0, SD = 4.4, SY = -2.5;
  function screenArt(B, mode, amt) {
    const bg = mode === "ok" ? "#e8f6ec" : "#eaf2fb", ink = "#1d2b3a";
    let s = `<rect width="${SW}" height="${SD}" rx="0.15" fill="${bg}"/><rect width="${SW}" height="0.6" fill="#2f5f9e"/>` + B.text(0.25, 0.43, "PAYMENT", 0.32, "#ffffff", "start", 800);
    if (mode === "present") s += B.text(SW / 2, 1.5, "TOTAL", 0.4, "#55606b", "middle", 700) + B.num(SW / 2, 2.55, amt, 0.85, ink, "middle", 800, "'Helvetica Neue',Arial,sans-serif") + B.text(SW / 2, 3.7, "PRESENT CARD", 0.45, ink, "middle", 800);
    else if (mode === "pin") s += B.text(SW / 2, 1.5, "ENTER PIN", 0.5, ink, "middle", 800) + [0, 1, 2, 3].map((i) => `<circle cx="${(SW / 2 - 1.2 + i * 0.8).toFixed(2)}" cy="2.6" r="0.18" fill="${ink}"/>`).join("") + B.num(SW / 2, 3.7, amt, 0.45, "#55606b", "middle", 700, "'Helvetica Neue',Arial,sans-serif");
    else s += B.tick(SW / 2, 2.0, 0.85) + B.text(SW / 2, 3.75, "APPROVED", 0.55, "#1f6a36", "middle", 800);
    return s;
  }
  ISO.add({
    name: "cardterminal", title: "Card terminal (part)", compare: null,
    about: "A handheld card payment terminal on a counter: colour screen (PRESENT CARD, ENTER PIN, APPROVED with a tick, and the total), rubber keypad, chip slot with a card going in, a tap mark on top and a paper receipt feeding out of its printer. anchors: slot tap paper",
    line: "cardterminal cx cy k amt=0..9999 card=0..1 receipt=0..1 tick=0..1 lab=0 lit=body|screen|keypad|printer|receipt|card",
    demo: { line: "cardterminal 470 330 22 amt=12.5 lab=1", script: [{ set: {}, hold: 1.4 }, { set: { card: 1, lit: "card" }, hold: 2.4 }, { set: { lit: "keypad" }, hold: 1.4 }, { set: { tick: 1, lit: "screen" }, hold: 2.2 }, { set: { receipt: 1, lit: "receipt" }, hold: 3 }, { set: { card: 0, receipt: 0, tick: 0, amt: 40, lit: "" }, hold: 3 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const B = window.B42, S = (p, s) => K.solidSvg(p, s);
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { card: B.val(o, "card", 0, 0, 1), receipt: B.val(o, "receipt", 0, 0, 1), tick: B.val(o, "tick", 0, 0, 1), amt: B.val(o, "amt", 0, 0, 9999) };
      st.wc = st.card; st.wr = st.receipt; st.wt = st.tick;
      const fx = (x, y, z) => K.iso([x, y, z], P);
      // the body, the printer housing (its outline in y–z, extruded along x) and the paper slot on its top
      const hump = [[-HY, 0.3], [PY, 0.3], [PY, BZ], [PY - 0.7, PZ - 0.5], [PY - 1.6, PZ], [-HY + 1.0, PZ], [-HY, PZ - 0.9]];
      const body = ISO.tinted(BODY, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.2 }, 0, BZ, P, 6, 0.3), { tone: "mid" }));
      const printer = ISO.prismX(P, hump, -HX + 0.15, HX - 0.15, ["#24272b", "#4a4e55"], "#3d4046", "#101113") +
        B.quad(P, [[-2.9, SL - 0.12, PZ + 0.003], [2.9, SL - 0.12, PZ + 0.003], [2.9, SL + 0.12, PZ + 0.003], [-2.9, SL + 0.12, PZ + 0.003]], "#0c0d0f") +
        B.flat(P, [-1.1, -6.6, PZ + 0.004], [1, 0, 0], [0, 1, 0], `<circle cx="1.1" cy="1.1" r="1.05" fill="none" stroke="#9aa3ad" stroke-width="0.06"/>` +
          [0.25, 0.45, 0.65].map((r) => `<path d="M${(0.8 + r * 0.6).toFixed(2)} ${(1.1 - r).toFixed(2)}A${r} ${r} 0 0 1 ${(0.8 + r * 0.6).toFixed(2)} ${(1.1 + r).toFixed(2)}" fill="none" stroke="#c9d1d9" stroke-width="0.09" stroke-linecap="round"/>`).join(""));
      // the screen bezel and glass; the picture is a fixed mode, rebuilt only when it changes
      const bezel = B.quad(P, [[-SW / 2 - 0.35, SY - 0.35, BZ + 0.004], [SW / 2 + 0.35, SY - 0.35, BZ + 0.004], [SW / 2 + 0.35, SY + SD + 0.35, BZ + 0.004], [-SW / 2 - 0.35, SY + SD + 0.35, BZ + 0.004]], "#16181b", "#0a0b0c", 0.5);
      // the keypad: 4 rows of 3 and the coloured row, each key a small box with its sign on top
      const keys = [];
      const signs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
        const x = (c - 1) * 2.1, y = 2.95 + r * 1.05, col = r === 4 ? ["red", "yellow", "green"][c] : "";
        const box = ISO.tinted(col ? COLK[col] : KEY, ISO.wbox(P, [x - 0.8, x + 0.8], [y - 0.36, y + 0.36], [BZ, BZ + 0.28], "hi"));
        const sign = col ? (col === "red" ? "X" : col === "yellow" ? "<" : "O") : signs[r * 3 + c];
        keys.push(box + B.flat(P, [x, y, BZ + 0.283], [1, 0, 0], [0, 1, 0], B.num(0, 0.17, sign, 0.5, col ? "#ffffff" : "#1d2b3a", "middle", 800, "'Helvetica Neue',Arial,sans-serif")));
      }
      // the chip slot in the front end face
      const slot = B.quad(P, [[-2.9, HY + 0.003, 1.0], [2.9, HY + 0.003, 1.0], [2.9, HY + 0.003, 1.4], [-2.9, HY + 0.003, 1.4]], "#0c0d0f", "#000", 0.4);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.2 }, 0, 1, P)}"/>` +
        `<g data-name="body">${body}${slot}</g><g data-name="printer">${printer}</g><g data-name="receipt"><g data-part="receipt"></g></g>` +
        `<g data-name="screen">${bezel}<g data-part="screen"></g></g><g data-name="keypad">${keys.join("")}</g><g data-name="card"><g data-part="card"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { slot: [0, HY, 1.2], tap: [0, -5.5, PZ], paper: [0, SL, PZ] };
      // the receipt: a 5.6 cm strip rising out of the slot and curling back, sampled along its length
      const receiptSvg = (L) => {
        const pts = [], R = 2.4;
        for (let i = 0; i <= 20; i++) { const s = (L * i) / 20; pts.push(s < 3 ? [SL, PZ + s] : ((a) => [SL - R + R * Math.cos(a), PZ + 3 + R * Math.sin(a)])(Math.min(Math.PI * 0.95, (s - 3) / R))); }
        const out = [];
        for (let i = 0; i < 20; i++) {
          const [y0, z0] = pts[i], [y1, z1] = pts[i + 1], up = (z1 - z0) / (Math.hypot(y1 - y0, z1 - z0) || 1);
          const shade = Math.round(82 + 18 * up);
          out.push(B.quad(P, [[-2.8, y0, z0], [2.8, y0, z0], [2.8, y1, z1], [-2.8, y1, z1]], `color-mix(in srgb, #ffffff ${shade}%, #9aa1a9)`, `color-mix(in srgb, #ffffff ${shade}%, #9aa1a9)`, 0.4));
        }
        // the printed lines on its face, each across the strip
        const lines = []; for (let i = 2; i < 20; i += 2) { const [y, z] = pts[i]; if (pts[i][1] <= PZ + 0.2) continue; const ww = i % 6 ? 2.0 : 1.2; lines.push(K.pathOf([fx(-ww, y + 0.02, z), fx(ww, y + 0.02, z)])); }
        return out.join("") + `<path d="${lines.join("")}" stroke="#7d848c" stroke-width="0.6" fill="none"/>` +
          `<path d="${K.pathOf(pts.map(([y, z]) => fx(-2.8, y, z)))}M${K.pathOf(pts.map(([y, z]) => fx(2.8, y, z))).slice(1)}" stroke="#8a9098" stroke-width="0.6" fill="none"/>`;
      };
      const cardSvg = (c) => {
        const lead = HY + 3 * (1 - c) - 5.2 * c, y0 = Math.max(lead, HY), y1 = lead + 8.56, z = 1.16;
        let s = ISO.tinted(CARD, S(K.slabOf({ x: -2.7, y: y0, w: 5.4, d: y1 - y0, r: 0.1 }, z, 0.08, P, 2), { tone: "mid" }));
        // the stripe and the chip (if out of the slot) on its face
        const chip = lead + 1.0;
        if (chip > HY) s += B.quad(P, [[-1.0, chip, z + 0.083], [-0.1, chip, z + 0.083], [-0.1, chip + 1.15, z + 0.083], [-1.0, chip + 1.15, z + 0.083]], "#e6c76a", "#8a6a1c", 0.4);
        s += B.quad(P, [[1.2, Math.max(y0, lead + 3), z + 0.083], [1.9, Math.max(y0, lead + 3), z + 0.083], [1.9, y1 - 0.4, z + 0.083], [1.2, y1 - 0.4, z + 0.083]], "#6f98cc");
        return s;
      };
      let lit = o.lit || "";
      const draw = () => {
        const mode = st.wt > 0 || st.tick > 0.01 ? "ok" : st.card > 0.97 ? "pin" : "present", amt = st.amt.toFixed(2);
        w.rebuild(el.screen, mode + amt, () => B.flat(P, [-SW / 2, SY, BZ + 0.006], [1, 0, 0], [0, 1, 0], screenArt(B, mode, amt)));
        if (mode === "ok") { const tk = el.screen.querySelector("[data-sig]"); if (tk) B.sign(w, tk, st.tick); }
        w.rebuild(el.card, st.card > 0.01 ? st.card.toFixed(3) : "-", () => (st.card > 0.01 ? cardSvg(st.card) : ""));
        w.rebuild(el.receipt, st.receipt > 0.01 ? st.receipt.toFixed(3) : "-", () => (st.receipt > 0.01 ? receiptSvg(9 * st.receipt) : ""));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(fx(HX, -HY, PZ), "card terminal", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => {
        st.wc = B.pick(p, "card", st.wc, 0, 1); st.wr = B.pick(p, "receipt", st.wr, 0, 1); st.wt = B.pick(p, "tick", st.wt, 0, 1);
        st.amt = Math.round(B.pick(p, "amt", st.amt, 0, 9999) * 100) / 100;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still(), was = st.card + st.receipt + st.tick;
        st.card = ISO.follow(st.card, st.wc, dt, 0.35, calm);
        st.receipt = calm || Math.abs(st.wr - st.receipt) < 0.004 ? st.wr : st.receipt + Math.sign(st.wr - st.receipt) * Math.min(Math.abs(st.wr - st.receipt), dt * 0.5);
        st.tick = ISO.follow(st.tick, st.wt, dt, 0.25, calm);
        if (st.card + st.receipt + st.tick !== was) draw();
        return st.card !== st.wc || st.receipt !== st.wr || st.tick !== st.wt;
      };
      g.readout = () => `card terminal · total ${st.amt.toFixed(2)} · ${st.wt > 0.5 ? "APPROVED" : st.wc > 0.5 ? "card in: ENTER PIN" : "PRESENT CARD"}${st.wr > 0.5 ? " · receipt printed" : ""}`;
      draw();
      return g;
    },
  });
})();
