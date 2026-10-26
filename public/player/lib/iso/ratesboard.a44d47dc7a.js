// "ratesboard cx cy k row=0..6 buy=0..99.99 sell=0..99.99 lab=0 lit=board|coins|digits|stand" — a PART (batch 6, money):
// a currency-exchange shop's rates board standing on the booth's counter, its origin the counter point under its
// middle, its face toward the room (+y). 80 wide × 6 deep × 100 cm tall: an aluminium frame on a foot bar, a black
// face printed "EXCHANGE RATES", "BUY" and "SELL", and six rows, each a plain coin icon (six metals and motifs: star,
// leaf, ring, square, triangle, dot; no real currency) with its buy and sell rate in amber LED digits, each digit in
// its own dark cell. row=1..6 highlights that row (0 = none); buy= and sell= set that row's rates (the board's own
// rates are 0.850/0.880, 1.200/1.240, 3.450/3.520, 12.50/12.80, 0.270/0.290, 7.800/7.950): the changed digits blink
// as the board updates them. Built-in words only. set({ row, buy, sell }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const HX = 40, HY = 3, ZF = 3, ZT = 100, AW = 77, AH = 94;
  const RATES = [[0.85, 0.88], [1.2, 1.24], [3.45, 3.52], [12.5, 12.8], [0.27, 0.29], [7.8, 7.95]];
  const COINS = [["#d6b96f", "star"], ["#b6b9be", "leaf"], ["#c98e60", "ring"], ["#e2c986", "square"], ["#a2a5ab", "triangle"], ["#d9a479", "dot"]];
  const LED = "#ffb020", GHOST = "#2c2416", RY0 = 21, RH = 12;
  ISO.add({
    name: "ratesboard", title: "Exchange rates board (part)", compare: null,
    about: "A currency-exchange shop's rates board, 80 × 6 × 100 cm, on its counter: six rows of plain coin icons with buy and sell rates in LED digit cells; row highlights a row, buy and sell change its digits. anchors: top",
    line: "ratesboard cx cy k row=0..6 buy=0..99.99 sell=0..99.99 lab=0 lit=board|coins|digits|stand",
    demo: { line: "ratesboard 480 500 4.4 row=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { row: 2, lit: "coins" }, hold: 1.5 }, { set: { row: 2, buy: 1.25, sell: 1.3, lit: "digits" }, hold: 1.5 }, { set: { row: 4, lit: "board" }, hold: 1.5 }, { set: { row: 0, lit: "stand" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1", S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const rates = RATES.map((r) => r.slice()), blink = [0, 0, 0, 0, 0, 0];
      const st = { row: Math.round(B.num(o, "row", 0, 0, 6)), lit: o.lit || "", hi: 0 };
      const rate = (v) => Math.round(ISO.clamp(v, 0, 99.99) * 1000) / 1000;
      const put = (p) => { if (st.row < 1) return; const r = rates[st.row - 1]; ["buy", "sell"].forEach((key, j) => { if (p[key] !== undefined) { const v = rate(B.num(p, key, r[j], 0, 99.99)); if (v !== r[j]) { r[j] = v; blink[st.row - 1] = 0.6; } } }); };
      put(o);
      st.hi = st.row ? 1 : 0;
      const face = B.plane(P, [-AW / 2, HY + 0.02, ZF + 1.5 + AH], [1, 0, 0], [0, 0, -1]);
      const fmt = (v) => (v < 10 ? v.toFixed(3) : v.toFixed(2));
      const cells = (xr, h) => { const dw = h * 0.52, gap = h * 0.36, out = []; for (let i = 0; i < 4; i++) { const x = xr - 4 * (dw + gap) + gap + i * (dw + gap); out.push(`<rect x="${(x - h * 0.16).toFixed(2)}" y="${(-h * 1.14).toFixed(2)}" width="${(dw + h * 0.32).toFixed(2)}" height="${(h * 1.28).toFixed(2)}" rx=".3" fill="#0d0e10" stroke="#2f3338" stroke-width=".15"/>`); } return out.join(""); };
      const icon = (x, y, r, [c, motif]) => {
        const ink = B.mix(c, "#000000", 0.55), m = r * 0.45;
        const mark = motif === "star" ? `<path d="${B.star(x, y, m)}" fill="${ink}"/>` : motif === "leaf" ? `<path d="${B.leaf(x, y, m * 2, -0.8)}" fill="${ink}"/>` : motif === "ring" ? `<circle cx="${x}" cy="${y}" r="${m * 0.75}" fill="none" stroke="${ink}" stroke-width="${r * 0.12}"/>` :
          motif === "square" ? `<rect x="${x - m * 0.7}" y="${y - m * 0.7}" width="${m * 1.4}" height="${m * 1.4}" fill="${ink}"/>` : motif === "triangle" ? `<path d="M${x} ${y - m}L${x + m * 0.9} ${y + m * 0.6}L${x - m * 0.9} ${y + m * 0.6}Z" fill="${ink}"/>` : `<circle cx="${x}" cy="${y}" r="${m * 0.45}" fill="${ink}"/>`;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${ink}" stroke-width="${r * 0.08}"/><circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="none" stroke="${ink}" stroke-width="${r * 0.05}" opacity=".7"/>${mark}`;
      };
      const BX = 54, SX = 75, DH = 5.2;
      // the cells sit on each row's baseline: rebuild them per row with a translate
      const rowsArt = () => { let s = ""; for (let i = 0; i < 6; i++) { const yb = RY0 + i * RH + RH / 2 + DH / 2; s += `<g transform="translate(0 ${yb.toFixed(2)})">${cells(BX, DH)}${cells(SX, DH)}</g>`; } return s; };
      const iconsArt = () => COINS.map((c, i) => icon(13, RY0 + i * RH + RH / 2, 4.2, c)).join("");
      const plate = () => {
        const s = [`<rect width="${AW}" height="${AH}" fill="#16181c"/>`, `<rect x="1.5" y="1.5" width="${AW - 3}" height="11" rx="1" fill="#1f4f8f"/>`, B.text(AW / 2, 9.6, "EXCHANGE RATES", 6, "#ffffff", "middle", 800)];
        s.push(B.text(BX - 9, 18.4, "BUY", 3.6, "#e8eaed", "middle", 800), B.text(SX - 9, 18.4, "SELL", 3.6, "#e8eaed", "middle", 800));
        for (let i = 0; i < 6; i++) s.push(`<path d="M2 ${(RY0 + i * RH + RH - 0.6).toFixed(2)}H${AW - 2}" stroke="#2f3338" stroke-width=".3"/>`);
        return s.join("");
      };
      const digitsArt = () => rates.map((r, i) => {
        const yb = RY0 + i * RH + RH / 2 + DH / 2, dim = blink[i] > 0 && Math.floor(blink[i] * 10) % 2 === 1;
        return dim ? "" : B.seg(BX, yb, fmt(r[0]), DH, LED, GHOST, 4) + B.seg(SX, yb, fmt(r[1]), DH, LED, GHOST, 4);
      }).join("");
      const hiArt = (row, a) => (row ? `<g opacity="${a.toFixed(2)}"><rect x="1" y="${RY0 + (row - 1) * RH - 0.2}" width="${AW - 2}" height="${RH - 0.4}" rx=".8" fill="#2a3a52" stroke="#ffd34d" stroke-width=".5"/><path d="M1.6 ${RY0 + (row - 1) * RH + RH / 2 - 2}l2.6 2l-2.6 2Z" fill="#ffd34d"/></g>` : "");
      const stand = ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-HX + 4, HX - 4], [-9, 9], [0, 1.2], "lo")) +
        ISO.tinted(ISO.T.steel, [-HX + 12, HX - 12].map((x) => ISO.wbox(P, [x - 2, x + 2], [-4, 4], [1.2, ZF + 4], "mid")).join(""));
      const frame = ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 }, ZF, ZT - ZF, P, 3, 0.4), { tone: "mid" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -9, w: 2 * HX, d: 18, r: 1 }, 0, ZT, P)}"/>` +
        `<g data-name="stand">${stand}</g><g data-name="board">${frame}<g transform="${face}">${plate()}<g data-part="hi"></g>${rowsArt()}</g></g>` +
        `<g data-name="coins"><g transform="${face}">${iconsArt()}</g></g><g data-name="digits"><g transform="${face}" data-part="digits"></g></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZT] };
      const el = LAB.parts(g), w = ISO.writer();
      let shownRow = st.row;
      const draw = () => {
        w.rebuild(el.digits, rates.map((r, i) => `${r} ${blink[i] > 0 ? Math.floor(blink[i] * 10) % 2 : "-"}`).join("|"), () => digitsArt());
        w.rebuild(el.hi, `${shownRow} ${st.hi.toFixed(2)}`, () => hiArt(shownRow, st.hi));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([HX + 3, 0, ZT - 10], P), "exchange rates board", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.row !== undefined) st.row = Math.round(B.num(p, "row", st.row, 0, 6));
        put(p);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the highlight fades to its new row (out, then in); changed digits blink for 0.6 s
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        for (let i = 0; i < 6; i++) if (blink[i] > 0) { blink[i] = calm ? 0 : Math.max(0, blink[i] - dt); moving ||= blink[i] > 0; }
        if (shownRow !== st.row) { st.hi = calm ? 0 : Math.max(0, st.hi - dt * 5); if (st.hi === 0) shownRow = st.row; moving = true; }
        else if (shownRow && st.hi < 1) { st.hi = calm ? 1 : Math.min(1, st.hi + dt * 5); moving = true; }
        draw();
        return moving;
      };
      g.readout = () => `rates board · ${rates.map((r, i) => `${i + 1}: buy ${fmt(r[0])} sell ${fmt(r[1])}`).join(" · ")}${st.row ? ` · row ${st.row} highlighted` : ""}`;
      draw();
      return g;
    },
  });
})();
