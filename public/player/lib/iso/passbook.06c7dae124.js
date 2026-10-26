// "passbook cx cy k rows=0..8 lab=0 lit=book|rows" — a PART (batch 6, money): a small bank savings passbook lying open
// on a table, 14 × 9 cm open and 0.5 cm thick, its origin the table point under its middle (flat sheet), its top edge
// away from the room (−y) so the print reads upright. A dark blue card cover, two page blocks meeting at the stitched
// spine; the left page is the account page (SAVINGS ACCOUNT, NAME and ACCOUNT NO lines, the date it was opened), the
// right page the record: DATE · IN · OUT · BALANCE, one printed row for each deposit or withdrawal, the balance always
// the true running sum (no interest line). rows = how many rows are printed (a new one prints in). set({ rows }).
// World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 7, HY = 4.5, ZC = 0.12, ZP = 0.45;
  const COVER = ISO.tint("#41608f", ["#1d3150", "#243a5d", "#2c446a", "#365079"], "#0f1c30");
  const PAGE = ISO.tint("#fbfaf4", ["#cfcdbf", "#dad8cb", "#e4e2d7", "#efeee5"], "#7d7b6e");
  // the record: [date, in, out]; the balance is summed as it is printed
  const DATA = [["01.02", 50, 0], ["08.02", 20, 0], ["15.02", 0, 15], ["22.02", 30, 0], ["01.03", 0, 25], ["08.03", 40, 0], ["15.03", 0, 10], ["22.03", 35, 0]];
  const BAL = DATA.reduce((a, [, i, o]) => [...a, (a.length ? a[a.length - 1] : 0) + i - o], []);
  ISO.add({
    name: "passbook", title: "Savings passbook (part)", compare: null,
    about: "A small bank savings passbook lying open, 14 × 9 cm: the account page and the record page with printed rows of DATE, IN, OUT and the running BALANCE (no interest line); rows sets how many rows are printed. anchors: top",
    line: "passbook cx cy k rows=0..8 lab=0 lit=book|rows",
    demo: { line: "passbook 480 290 36 rows=2 lab=1", script: [{ set: {}, hold: 1 }, { set: { rows: 5, lit: "rows" }, hold: "settle" }, { set: { rows: 8 }, hold: "settle" }, { set: { rows: 0, lit: "book" }, hold: 1 }, { set: { rows: 3, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { want: Math.round(B.num(o, "rows", 3, 0, 8)), lit: o.lit || "" };
      st.shown = st.want;
      const PW = HX - 0.15, ink = "#2b3440", grey = "#8d949c", f = (v) => v.toFixed(2);
      const rule = (y, x0 = 0.3, x1 = PW - 0.3, c = "#c9ced4") => `<path data-free="" d="M${f(x0)} ${f(y)}H${f(x1)}" stroke="${c}" stroke-width="0.03"/>`;
      const mono = (x, y, s, size = 0.34, anchor = "start", color = ink) => `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" fill="${color}" style="font:700 ${size}px ${B.MONO}">${ISO.esc(s)}</text>`;
      const left = B.text(PW / 2, 1.1, "SAVINGS ACCOUNT", 0.5, "#243a5d", "middle", 800) + rule(1.45, 0.8, PW - 0.8, "#243a5d") +
        [["NAME", 2.6], ["ACCOUNT NO", 3.9], ["OPENED", 5.2]].map(([w, y]) => B.text(0.4, y, w, 0.3, grey, "start", 700) + rule(y + 0.55, 0.4, PW - 0.4, "#b7bcc2")).join("") +
        `<rect x="0.4" y="2.85" width="3.2" height="0.22" rx="0.11" fill="#9aa1a9"/>` + mono(0.4, 4.35, "0042 7316 05", 0.36) + mono(0.4, 5.65, "01.02", 0.36) +
        `<circle cx="${f(PW - 1.3)}" cy="7.3" r="0.8" fill="none" stroke="#3f6fb0" stroke-width="0.05" opacity=".7"/>` + B.text(PW - 1.3, 7.42, "BANK", 0.28, "#3f6fb0", "middle", 800);
      const COL = [0.3, 3.0, 4.4, PW - 0.3];
      const head = B.text(COL[0], 1.0, "DATE", 0.3, grey) + B.text(COL[1], 1.0, "IN", 0.3, grey, "end") + B.text(COL[2], 1.0, "OUT", 0.3, grey, "end") + B.text(COL[3], 1.0, "BALANCE", 0.3, grey, "end") +
        rule(1.25, 0.3, PW - 0.3, "#7d848c") + Array.from({ length: 8 }, (_, i) => rule(1.95 + i * 0.85)).join("");
      const rowSvg = (n) => DATA.slice(0, Math.ceil(n)).map(([d, i, o2], r) => {
        const y = 1.8 + r * 0.85, op = ISO.clamp(n - r, 0, 1);
        return `<g opacity="${op.toFixed(2)}">${mono(COL[0], y, d)}${i ? mono(COL[1], y, i.toFixed(2), 0.34, "end") : ""}${o2 ? mono(COL[2], y, o2.toFixed(2), 0.34, "end", "#9b2c24") : ""}${mono(COL[3], y, BAL[r].toFixed(2), 0.34, "end")}</g>`;
      }).join("");
      const pageSlab = (x0, x1) => ISO.tinted(PAGE, S(K.slabOf({ x: x0, y: -HY + 0.15, w: x1 - x0, d: 2 * HY - 0.3, r: 0.1 }, ZC, ZP - ZC, P, 2), { tone: "hi", crease: "none" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.2, y: -HY - 0.2, w: 2 * HX + 0.4, d: 2 * HY + 0.4, r: 0.3 }, 0, ZP, P)}"/>` +
        `<g data-name="book">${ISO.tinted(COVER, S(K.slabOf({ x: -HX - 0.2, y: -HY - 0.2, w: 2 * HX + 0.4, d: 2 * HY + 0.4, r: 0.3 }, 0, ZC, P, 4), { tone: "mid" }))}` +
        `${pageSlab(-HX + 0.05, -0.04)}${B.flat(P, [-HX + 0.05, -HY + 0.15, ZP + 0.004], [1, 0, 0], [0, 1, 0], left)}` +
        `${pageSlab(0.04, HX - 0.05)}${B.flat(P, [0.08, -HY + 0.15, ZP + 0.004], [1, 0, 0], [0, 1, 0], head)}` +
        `<path d="${K.pathOf([K.iso([0, -HY + 0.15, ZP], P), K.iso([0, HY - 0.15, ZP], P)])}" stroke="#7d7b6e" stroke-width="0.8"/>` +
        `<path d="${K.pathOf([K.iso([0, -HY + 0.6, ZP + 0.01], P), K.iso([0, HY - 0.6, ZP + 0.01], P)])}" stroke="#c0392b" stroke-width="0.6" stroke-dasharray="3 2" data-free=""/></g>` +
        `<g data-name="rows" data-part="rows"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZP] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const n = Math.round(st.shown * 20) / 20;
        w.rebuild(el.rows, String(n), () => B.flat(P, [0.08, -HY + 0.15, ZP + 0.006], [1, 0, 0], [0, 1, 0], rowSvg(n)));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([HX + 0.3, -HY, ZP], P), "passbook", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.rows !== undefined) st.want = Math.round(B.num(p, "rows", st.want, 0, 8));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the printer adds about two rows a second; rows taken back vanish at once
      g.update = (dt) => {
        if (ISO.still() || st.want < st.shown) st.shown = st.want;
        else if (st.shown < st.want) st.shown = Math.min(st.want, st.shown + dt * 2);
        draw();
        return st.shown !== st.want;
      };
      g.readout = () => { const n = st.want; if (!n) return "passbook · no rows printed yet"; const [d, i, o2] = DATA[n - 1]; return `passbook · ${n} rows · last ${d} ${i ? `in ${i}` : `out ${o2}`} · balance ${BAL[n - 1]}`; };
      draw();
      return g;
    },
  });
})();
