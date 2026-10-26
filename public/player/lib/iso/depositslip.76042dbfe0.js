// "depositslip cx cy k fill=0..1 lab=0 lit=slip|notes|coins|total" — a PART (batch 6, money): a paper bank paying-in
// slip lying on a counter, its origin the counter point under its middle. 20 × 9 cm: a printed form with boxes for the
// date, the account number, the notes by value (50, 20, 10, 5: how many and how much), the coins, the total and a
// "paid in by" line. fill 0 → 1 writes the boxes in blue ink one after another, in the order a person fills them
// (date, account, each note row, coins, total, signature): 2 × 50, 3 × 20, 4 × 10, 1 × 5, coins 7, total 212.
// Generic: no bank name or logo. set({ fill }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const W = 20, H = 9, NOTES = [[50, 2], [20, 3], [10, 4], [5, 1]], COINS = 7;
  const TOTAL = NOTES.reduce((s, [v, n]) => s + v * n, 0) + COINS;
  const HAND = "'Bradley Hand','Segoe Print','Comic Sans MS',cursive";
  ISO.add({
    name: "depositslip", title: "Paying-in slip (part)", compare: null,
    about: "A paper bank paying-in slip, 20 × 9 cm: boxes for date, account, notes by value, coins and total; fill writes them in blue ink one by one (total 212). anchors: top",
    line: "depositslip cx cy k fill=0..1 lab=0 lit=slip|notes|coins|total",
    demo: { line: "depositslip 480 290 38 fill=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { fill: 0.6, lit: "notes" }, hold: "settle" }, { set: { fill: 1, lit: "total" }, hold: "settle" }, { set: { fill: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { fill: A.num(o, "fill", 0, 0, 1), lit: o.lit || "" };
      st.want = st.fill;
      const T = (x, y, s, z, c = "#2b4a6b", a = "start", wt = 700) => A.text(x, y, s, z, c, a, wt);
      const box = (x, y, w, h, sw = 0.03) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" stroke="#5a7fa8" stroke-width="${sw}"/>`;
      const rule = (x0, x1, y) => `<path data-free d="M${x0} ${y}H${x1}" stroke="#5a7fa8" stroke-width="0.03"/>`;
      // the printed form (x right, y down, 1 = 1 cm): header, date, account boxes, the note table, coins, total
      const form = [`<rect width="${W}" height="${H}" fill="#eef4f8" stroke="#5a7fa8" stroke-width="0.04"/>`, `<rect width="${W}" height="1.3" fill="#d6e3ee"/>`,
        T(0.5, 0.95, "PAYING-IN SLIP", 0.62, "#25476f", "start", 800), T(12.2, 0.95, "Date", 0.42, "#25476f"), box(13.6, 0.3, 5.9, 0.8),
        T(0.5, 2.15, "Account", 0.42, "#25476f")];
      for (let i = 0; i < 8; i++) form.push(box(2.5 + i * 0.85, 1.6, 0.75, 0.8));
      form.push(T(10.2, 2.15, "Paid in by", 0.42, "#25476f"), rule(12.6, 19.5, 2.3));
      // the note table: a header row, then value × how many = amount
      form.push(T(0.5, 3.3, "Notes", 0.46, "#25476f", "start", 800), T(4.1, 3.3, "how many", 0.34, "#25476f", "middle", 600), T(7.6, 3.3, "amount", 0.34, "#25476f", "middle", 600));
      NOTES.forEach(([v], i) => { const y = 3.6 + i * 1.05; form.push(T(0.9, y + 0.68, `${v}  ×`, 0.42, "#25476f", "start", 700), box(3.1, y, 2, 0.85), box(6.4, y, 2.4, 0.85)); });
      form.push(`<path data-free d="M9.6 3V8.4" stroke="#9fb4cc" stroke-width="0.03"/>`);
      form.push(T(10.3, 4.3, "Coins", 0.46, "#25476f", "start", 800), box(13.6, 3.6, 5.9, 1));
      form.push(T(10.3, 6.4, "TOTAL", 0.56, "#25476f", "start", 800), box(13.6, 5.6, 5.9, 1.3, 0.07));
      form.push(T(10.3, 8.3, "Please count your cash before you pay it in", 0.3, "#5a7fa8", "start", 600));
      // the handwriting, one field at a time (blue ink); each field fades in while fill passes its share
      const ink = (s, x, y, z = 0.62, a = "start") => A.text(x, y, s, z, "#1d3fa8", a, 400, HAND);
      const fields = [ink("26 . 10", 14.1, 0.95, 0.6), "04127788".split("").map((d, i) => ink(d, 2.875 + i * 0.85, 2.2, 0.6, "middle")).join("")];
      NOTES.forEach(([v, n], i) => { const y = 3.6 + i * 1.05 + 0.68; fields.push(ink(String(n), 4.1, y, 0.62, "middle") + ink(String(v * n), 8.5, y, 0.62, "end")); });
      fields.push(ink(String(COINS), 19.2, 4.4, 0.66, "end"), ink(String(TOTAL), 19.2, 6.6, 0.95, "end"), `<path d="M13 2.1c0.4-0.6 0.7 0.3 1.1-0.2s0.5-0.5 0.8 0c0.3 0.4 0.6-0.6 1-0.1s0.9 0.1 1.3-0.1" fill="none" stroke="#1d3fa8" stroke-width="0.05" stroke-linecap="round"/>`);
      const FIELD_PART = ["slip", "slip", "notes", "notes", "notes", "notes", "coins", "total", "slip"];
      const plane = A.plane(P, [-W / 2, -H / 2, 0.012], [1, 0, 0], [0, 1, 0]);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -W / 2, y: -H / 2, w: W, d: H, r: 0.1 }, 0, 0.02, P)}"/>` +
        `<g data-name="slip">${B.box(P, [-W / 2, W / 2], [-H / 2, H / 2], [0, 0.01], B.PAPER, "lo")}<g transform="${plane}">${form.join("")}</g></g>` +
        fields.map((f, i) => `<g data-name="${FIELD_PART[i]}"><g data-part="f${i}" transform="${plane}">${f}</g></g>`).join("") +
        (lab ? B.word(P, [W / 2, H / 2, 0], "paying-in slip") : "");
      g.anchors = { top: [0, 0, 0.012] };
      const el = B.parts(g), w = ISO.writer(), n = fields.length;
      const draw = () => {
        for (let i = 0; i < n; i++) { const a = ISO.clamp(st.fill * n - i, 0, 1); w.attr(el["f" + i], "opacity", a.toFixed(2)); w.shown(el["f" + i], a > 0.01); }
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) st.want = A.num(p, "fill", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        // a steady hand: about one field a second while writing, quick when wiped
        const calm = ISO.still(), dir = Math.sign(st.want - st.fill);
        st.fill = calm ? st.want : st.fill + dir * Math.min(Math.abs(st.want - st.fill), dt * (dir > 0 ? 1.1 / n : 2));
        draw();
        return st.fill !== st.want;
      };
      g.readout = () => `paying-in slip · ${st.want > 0.99 ? `filled in: notes ${TOTAL - COINS}, coins ${COINS}, total ${TOTAL}` : st.want < 0.01 ? "blank" : "being filled in"}`;
      draw();
      return g;
    },
  });
})();
