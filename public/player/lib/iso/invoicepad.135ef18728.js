// "invoicepad cx cy k torn=0..1 paid=0..1 lab=0 lit=board|clip|pad|sheet|copy|stamp" — a PART (batch 6, money): a
// carbonless invoice pad on a clipboard, 22.5 × 31.5 cm and 1.5 cm high at the clip, lying on a desk, its origin the
// middle of the board on the surface, the clip toward the wall (−y). A hardboard clipboard, a steel clip with its
// wire lever and two rivets, the pad's white and pink sheets (their edges show in the side). The top sheet, below a
// perforation: INVOICE and its number, date, bill-to lines, a table (ITEM, QTY, PRICE, TOTAL) with three rows written
// in blue ink, subtotal, tax at 10 % and the TOTAL DUE box (9.00 + 8.00 + 6.00 = 23.00, tax 2.30, due 25.30). The pink
// copy under it carries the same entries in carbon grey. torn 0 → 1 tears the top sheet off along the perforation
// and lays it on the desk to the right, showing the pink copy; paid 0 → 1 stamps a red PAID on the top sheet (it goes
// with the sheet). No currency signs. 1 = 1 cm.
// anchors: clip (the clip's middle top) total (the TOTAL DUE box on the pad) sheet (where the torn sheet lands)
(() => {
  const K = window.K;
  const BW = 22.5, BD = 31.5, BT = 0.35, PW = 20, PY0 = -14.6, PY1 = 14.6, PT = 0.6, ZT = BT + PT, PERF = -11, SH = PY1 - PERF;
  const BOARD = ISO.tint("#c9a06a", ["#8a6232", "#9a6f3c", "#aa7d48", "#b98c56"], "#4e3418");
  const PINK = ISO.tint("#fbe3e6", ["#d9a9b0", "#e3b8be", "#eccbd0", "#f4d9dc"], "#8a5a62");
  const TOTAL = { x: 12.6, y: 21.4 };
  // the sheet's printed form and its written entries (ink colour = blue on the top sheet, carbon grey on the copy)
  function form(B, paper, ink, print) {
    let s = `<rect width="${PW}" height="${SH}" fill="${paper}"/>`;
    s += B.text(1, 1.9, "INVOICE", 1.0, print, "start", 800) + B.text(PW - 1, 1.9, "No. 0042", 0.55, "#b2323a", "end", 800);
    s += B.text(1, 3.3, "Date", 0.4, print, "start", 700) + B.rule(2.4, 3.35, 8.5, print) + B.text(10.5, 3.3, "Bill to", 0.4, print, "start", 700) + B.rule(12.6, 3.35, PW - 1, print) + B.rule(10.5, 4.45, PW - 1, print);
    // the table: a header band, ruled rows, column lines from the header to the last row
    const cols = [1, 9.4, 12, 15.6, PW - 1], y0 = 5.6, rh = 1.3, rows = 7;
    s += `<rect x="1" y="${y0}" width="${PW - 2}" height="${rh}" fill="${print}" opacity=".14"/>`;
    ["ITEM", "QTY", "PRICE", "TOTAL"].forEach((n, i) => { s += B.text(cols[i] + 0.3, y0 + 0.9, n, 0.42, print, "start", 800); });
    for (let r = 0; r <= rows; r++) s += B.rule(1, y0 + rh * (r + 1), PW - 1, print, r ? 0.03 : 0.05);
    s += `<path d="${cols.map((x) => `M${x} ${y0}V${(y0 + rh * (rows + 1)).toFixed(2)}`).join("")}" stroke="${print}" stroke-width="0.04" fill="none"/>`;
    s += `<rect x="1" y="${y0}" width="${PW - 2}" height="${(rh * (rows + 1)).toFixed(2)}" fill="none" stroke="${print}" stroke-width="0.05"/>`;
    const items = [["A4 paper", "2", "4.50", "9.00"], ["Pens", "10", "0.80", "8.00"], ["Folders", "3", "2.00", "6.00"]];
    items.forEach((row, r) => row.forEach((v, i) => { const y = y0 + rh * (r + 1) + 0.95; s += i ? B.num(cols[i + 1] - 0.3, y, v, 0.62, ink, "end", 400, B.HAND) : B.text(cols[0] + 0.3, y, v, 0.6, ink, "start", 400, B.HAND); }));
    const yt = y0 + rh * (rows + 1) + 1.1;
    [["Subtotal", "23.00"], ["Tax 10 %", "2.30"]].forEach(([n, v], i) => { s += B.text(12, yt + i * 1.1, n, 0.42, print, "start", 700) + B.num(PW - 1.3, yt + i * 1.1, v, 0.62, ink, "end", 400, B.HAND); });
    s += `<rect x="${TOTAL.x - 1}" y="${(yt + 1.7).toFixed(2)}" width="${(PW - TOTAL.x).toFixed(2)}" height="1.5" fill="none" stroke="${print}" stroke-width="0.07"/>`;
    s += B.text(TOTAL.x - 0.7, yt + 2.75, "TOTAL DUE", 0.42, print, "start", 800) + B.num(PW - 1.3, yt + 2.8, "25.30", 0.75, ink, "end", 700, B.HAND);
    s += B.text(1, SH - 0.8, "Thank you", 0.4, print, "start", 600);
    return s;
  }
  ISO.add({
    name: "invoicepad", title: "Invoice pad (part)", compare: null,
    about: "A carbonless invoice pad on a clipboard: numbered INVOICE top sheet with items, quantity, price, tax and TOTAL DUE written in, a pink copy under it; the top sheet tears off along its perforation, and a red PAID stamp can mark it. anchors: clip total sheet",
    line: "invoicepad cx cy k torn=0..1 paid=0..1 lab=0 lit=board|clip|pad|sheet|copy|stamp",
    demo: { line: "invoicepad 370 250 16 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "sheet" }, hold: 1.2 }, { set: { paid: 1, lit: "stamp" }, hold: 2 }, { set: { torn: 1, lit: "" }, hold: 3.2 }, { set: { lit: "copy" }, hold: 1.4 }, { set: { torn: 0, paid: 0, lit: "clip" }, hold: 3 }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { torn: B.val(o, "torn", 0, 0, 1), paid: B.val(o, "paid", 0, 0, 1) }; st.wt = st.torn; st.wp = st.paid;
      const x0 = -PW / 2;
      // the pad's side: alternate white and pink sheet edges, each line from corner to corner
      const ed = []; for (let z = BT + 0.05, i = 0; z < ZT - 0.02; z += 0.05, i++) ed.push([i % 2, K.pathOf([K.iso([x0, PY1 + 0.003, z], P), K.iso([-x0, PY1 + 0.003, z], P), K.iso([-x0 + 0.003, PY0, z], P)])]);
      const edges = `<path d="${ed.filter((e) => e[0]).map((e) => e[1]).join("")}" stroke="#e7b9c0" stroke-width="0.4" fill="none"/><path d="${ed.filter((e) => !e[0]).map((e) => e[1]).join("")}" stroke="#d3d7db" stroke-width="0.3" fill="none"/>`;
      const header = `<rect width="${PW}" height="${PERF - PY0}" fill="#ffffff"/>` + Array.from({ length: 40 }, (_, i) => `<circle cx="${(0.25 + i * 0.5).toFixed(2)}" cy="${(PERF - PY0 - 0.05).toFixed(2)}" r="0.07" fill="#9aa1a9"/>`).join("");
      // the clip: a pressed steel plate, rivets, the hinge roll and the wire lever on it
      const clip = ISO.tinted(ISO.T.steel, ISO.wbox(P, [-6, 6], [-BD / 2 + 0.4, -BD / 2 + 4.4], [ZT, ZT + 0.12], "hi") + ISO.wbox(P, [-6.5, 6.5], [-BD / 2 + 0.4, -BD / 2 + 1.4], [BT, ZT + 0.5], "mid")) +
        ISO.tinted(ISO.T.steel, K.dotsSvg([K.iso([-4.5, -BD / 2 + 0.9, ZT + 0.5], P), K.iso([4.5, -BD / 2 + 0.9, ZT + 0.5], P)], { size: 0.6 })) +
        `<path d="${K.pathOf([[-3.5, -BD / 2 + 0.9, ZT + 0.55], [-3.5, -BD / 2 + 1.8, ZT + 1.5], [3.5, -BD / 2 + 1.8, ZT + 1.5], [3.5, -BD / 2 + 0.9, ZT + 0.55]].map((p) => K.iso(p, P)))}" fill="none" stroke="#3c3f45" stroke-width="${(0.35 * G.scaleOf(P) + 0.6).toFixed(2)}" stroke-linejoin="round"/>` +
        `<path d="${K.pathOf([[-3.5, -BD / 2 + 0.9, ZT + 0.55], [-3.5, -BD / 2 + 1.8, ZT + 1.5], [3.5, -BD / 2 + 1.8, ZT + 1.5], [3.5, -BD / 2 + 0.9, ZT + 0.55]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c7c9cd" stroke-width="${(0.35 * G.scaleOf(P)).toFixed(2)}" stroke-linejoin="round"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -BW / 2, y: -BD / 2, w: BW, d: BD, r: 0.8 }, 0, 1, P)}"/>` +
        `<g data-name="board">${ISO.tinted(BOARD, K.solidSvg(K.slabOf({ x: -BW / 2, y: -BD / 2, w: BW, d: BD, r: 0.8 }, 0, BT, P, 4), { tone: "mid" }))}</g>` +
        `<g data-name="pad">${ISO.tinted(B.PAPER, K.solidSvg(K.slabOf({ x: x0, y: PY0, w: PW, d: PY1 - PY0, r: 0.05 }, BT, PT, P, 2), { tone: "hi", crease: "none" }))}${edges}` +
        `${B.flat(P, [x0, PY0, ZT + 0.002], [1, 0, 0], [0, 1, 0], header)}</g>` +
        `<g data-name="copy">${B.flat(P, [x0, PERF, ZT + 0.002], [1, 0, 0], [0, 1, 0], form(B, "#fbe3e6", "#6b6f78", "#b0606a"))}</g>` +
        `<g data-name="clip">${clip}</g><g data-name="sheet"><g data-part="sheet"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const art = form(B, "#ffffff", "#1f3f8f", "#2b3d4f").replace("<rect ", `<rect stroke="#aab0b6" stroke-width="0.03" `);
      const stamp = `<g data-name="stamp"><g data-part="stamp" transform="rotate(-14 ${PW / 2} 11.5)">${B.stampArt(PW / 2, 11.5, 2.2)}</g></g>`;
      g.anchors = { clip: [0, -BD / 2 + 2.4, ZT + 0.12], total: [x0 + TOTAL.x + 3, PERF + 19, ZT], sheet: [BW / 2 + 12, 3, 0] };
      let lit = o.lit || "", stampEl = null;
      const draw = () => {
        const e = B.smooth(0, 1, st.torn), r = (-8 * e * Math.PI) / 180, lift = 2.2 * Math.sin(Math.PI * e);
        const O = [x0 + (BW + 1.5) * e, PERF + 1.2 * e, (ZT + 0.004) * (1 - e) + 0.012 * e + lift], U = [Math.cos(r), Math.sin(r), 0], V = [-Math.sin(r), Math.cos(r), 0];
        w.rebuild(el.sheet, e.toFixed(3), () => B.flat(P, O, U, V, art + stamp));
        stampEl = el.sheet.querySelector('[data-part="stamp"]');
        const s = B.smooth(0, 1, st.paid);
        w.attr(stampEl, "opacity", s.toFixed(3));
        w.attr(stampEl, "transform", `rotate(-14 ${PW / 2} 11.5) translate(${PW / 2} 11.5) scale(${(1 + 0.5 * (1 - s)).toFixed(3)}) translate(${-PW / 2} -11.5)`);
        w.shown(stampEl, s > 0.01);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([BW / 2, -BD / 2, 1], P), "invoice pad", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => { st.wt = B.pick(p, "torn", st.wt, 0, 1); st.wp = B.pick(p, "paid", st.wp, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const calm = ISO.still(), was = st.torn + st.paid;
        st.torn = ISO.follow(st.torn, st.wt, dt, 0.5, calm); st.paid = ISO.follow(st.paid, st.wp, dt, 0.12, calm);
        if (st.torn + st.paid !== was) draw();
        return st.torn !== st.wt || st.paid !== st.wp;
      };
      g.readout = () => `invoice No. 0042 · 3 items 23.00 + tax 10 % 2.30 · total due 25.30${st.wp > 0.5 ? " · stamped PAID" : ""}${st.wt > 0.5 ? " · top sheet torn off, pink copy stays" : ""}`;
      draw();
      return g;
    },
  });
})();
