// "taxform cx cy k fill=0..1 lab=0 lit=form|fields|signature|payslip|clip" — a PART (batch 6, money): a tax return
// form on A4 (21 × 29.7 cm) lying on a desk, its origin the middle of the form on the surface, its top toward the wall
// (−y). A plain header (TAX RETURN, tax year, a neutral round mark: no state crest), name and tax number boxes, four
// numbered boxed fields: 1 Income 32000.00, 2 Deductions 4000.00, 3 Taxable income (1 − 2) 28000.00, 4 Tax due at
// 15 % of 3 = 4200.00, then the declaration with a signature and date line. A payslip is clipped behind it with a
// steel paper clip over the top edge, its header showing above the form. fill 0 → 1 writes the boxes in blue ink one
// after another (name, number, the four amounts) and then the signature. No currency signs. 1 = 1 cm.
// anchors: sign (the signature line) due (box 4, tax due) clip (the paper clip)
(() => {
  const K = window.K;
  const W = 21, D = 29.7, T = 0.012, X0 = -W / 2, Y0 = -D / 2, INK = "#2b3440", PEN = "#1f3f8f";
  const FIELDS = [["1", "Income", "32000.00"], ["2", "Deductions", "4000.00"], ["3", "Taxable income (1 - 2)", "28000.00"], ["4", "Tax due (15 % of 3)", "4200.00"]];
  function formArt(B) {
    let s = `<rect width="${W}" height="${D}" fill="#ffffff" stroke="#b0b6bc" stroke-width="0.03"/>`;
    s += `<circle cx="2.4" cy="2.2" r="1.1" fill="none" stroke="#3a5f7a" stroke-width="0.12"/><circle cx="2.4" cy="2.2" r="0.6" fill="#3a5f7a" opacity=".25"/>`;
    s += B.text(4.0, 2.2, "TAX RETURN", 0.9, INK, "start", 800) + B.text(4.0, 3.0, "Individual · tax year 2026", 0.42, "#55606b", "start", 600);
    s += `<rect x="0.8" y="3.8" width="${W - 1.6}" height="0.12" fill="#3a5f7a"/>`;
    // name and the tax number's boxes
    s += B.text(1.2, 5.2, "Name", 0.4, INK, "start", 700) + `<rect x="3.4" y="4.55" width="9" height="0.95" fill="#f4f7fa" stroke="#55606b" stroke-width="0.04"/>`;
    s += B.text(1.2, 6.7, "Tax number", 0.4, INK, "start", 700) + Array.from({ length: 9 }, (_, i) => `<rect x="${(4.4 + i * 0.85).toFixed(2)}" y="6.05" width="0.75" height="0.9" fill="#f4f7fa" stroke="#55606b" stroke-width="0.04"/>`).join("");
    // the four numbered fields: number, words, the box for the amount
    FIELDS.forEach(([n, name], i) => {
      const y = 9 + i * 3.1;
      s += `<rect x="0.8" y="${y - 0.9}" width="${W - 1.6}" height="2.6" fill="${i === 3 ? "#eef4f9" : "#fafbfc"}" stroke="#c3c8ce" stroke-width="0.03"/>`;
      s += `<circle cx="1.8" cy="${y + 0.35}" r="0.5" fill="#3a5f7a"/>` + B.num(1.8, y + 0.53, n, 0.55, "#ffffff", "middle", 800, "'Helvetica Neue',Arial,sans-serif");
      s += B.text(2.8, y + 0.55, name, 0.48, INK, "start", 700) + `<rect x="12.6" y="${y - 0.3}" width="7.2" height="1.3" fill="#ffffff" stroke="#55606b" stroke-width="0.05"/>`;
    });
    s += B.text(1.2, 22.2, "Declaration", 0.5, INK, "start", 800) + B.bars(1.2, 22.8, W - 2.4, 2, 0.55, 0.18, "#9aa1a9", 3);
    s += B.rule(1.2, 26.4, 10.6) + B.text(1.2, 27.0, "signature", 0.36, "#7d848c", "start", 600) + B.rule(13, 26.4, 19.8) + B.text(13, 27.0, "date", 0.36, "#7d848c", "start", 600);
    s += B.text(W / 2, D - 0.9, "page 1 of 1", 0.36, "#9aa1a9", "middle", 600);
    // the written entries, each its own group so they appear one by one
    const hand = (x, y, v, size = 0.62) => B.num(x, y, v, size, PEN, "start", 400, B.HAND);
    const step = (i, svg) => `<g data-step="${i}">${svg}</g>`;
    s += `<g data-name="fields">` + step(0, B.text(3.6, 5.25, "A. Student", 0.6, PEN, "start", 400, B.HAND)) +
      step(1, Array.from({ length: 9 }, (_, i) => B.num(4.78 + i * 0.85, 6.78, "0", 0.62, PEN, "middle", 400, B.HAND)).join("")) +
      FIELDS.map(([, , v], i) => step(i + 2, B.num(19.5, 9 + i * 3.1 + 0.68, v, 0.75, PEN, "end", 400, B.HAND))).join("") +
      step(6, hand(13.3, 26.2, "31.10.2026", 0.55)) + "</g>";
    s += `<g data-name="signature">${B.signature(1.6, 26.3, 7.4, PEN, 3)}</g>`;
    return s;
  }
  function slipArt(B) {
    let s = `<rect width="21" height="14.8" fill="#ffffff" stroke="#b0b6bc" stroke-width="0.03"/>`;
    s += `<rect x="1" y="0.9" width="1.4" height="1.4" rx="0.2" fill="#3a6f8f"/>` + B.text(2.8, 1.5, "COMPANY", 0.55, INK, "start", 800) + B.bars(2.8, 1.85, 5, 2, 0.4, 0.15, "#9aa1a9", 2);
    s += B.text(20, 1.6, "PAYSLIP", 0.75, INK, "end", 800) + B.text(20, 2.5, "Month 10", 0.36, "#55606b", "end", 700);
    s += B.bars(1.2, 4.2, 18.5, 6, 0.8, 0.2, "#c3c8ce", 5);
    return s;
  }
  ISO.add({
    name: "taxform", title: "Tax return form (part)", compare: null,
    about: "A tax return form on a desk: plain header, name and tax number boxes, four boxed fields (income 32000.00, deductions 4000.00, taxable income 28000.00, tax due at 15 % = 4200.00), a declaration and signature line, a payslip clipped behind it; fill writes the boxes in and signs it. anchors: sign due clip",
    line: "taxform cx cy k fill=0..1 lab=0 lit=form|fields|signature|payslip|clip",
    demo: { line: "taxform 480 300 16 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "payslip" }, hold: 1.2 }, { set: { fill: 1, lit: "" }, hold: 5 }, { set: { lit: "signature" }, hold: 1.4 }, { set: { lit: "clip" }, hold: 1.2 }, { set: { fill: 0, lit: "fields" }, hold: 3 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { fill: B.val(o, "fill", 0, 0, 1) }; st.want = st.fill;
      // the payslip behind: turned 5°, its top 6 cm above the form's top edge
      const r = (5 * Math.PI) / 180, so = [X0 + 2.5, Y0 - 6, 0.004];
      const slip = B.flat(P, so, [Math.cos(r), Math.sin(r), 0], [-Math.sin(r), Math.cos(r), 0], slipArt(B));
      // the gem paper clip over the top edge: one steel wire, three bends, drawn as a tube (dark rim, light core)
      const cx0 = 4, sc = G.scaleOf(P), wire = [[0, -2.4], [0, 0.4], [0.75, 0.4], [0.75, -2.9], [0.15, -2.9], [0.15, 0], [0.55, 0], [0.55, -1.8]];
      const wd = K.pathOf(wire.map(([x, y]) => K.iso([cx0 + x, Y0 + 1.2 + y, T * 2 + 0.03], P)));
      const clip = `<path d="${wd}" fill="none" stroke="#3c3f45" stroke-width="${(0.1 * sc + 1.1).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/><path d="${wd}" fill="none" stroke="#d9dadd" stroke-width="${(0.1 * sc).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0 - 0.6, y: Y0 - 6, w: W + 2, d: D + 6.6, r: 0.4 }, 0, 0.05, P)}"/>` +
        `<g data-name="payslip">${slip}</g>` +
        `<g data-name="form">${B.sheet(P, X0, Y0, W, D, 0.004, T, formArt(B))}</g><g data-name="clip">${clip}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), steps = [...g.querySelectorAll("[data-step]")], sig = g.querySelector('[data-name="signature"] [data-sig]');
      g.anchors = { sign: [X0 + 6, Y0 + 26.4, T * 2], due: [X0 + 16.2, Y0 + 9 + 3 * 3.1 + 0.35, T * 2], clip: [cx0 + 0.4, Y0 + 0.2, T * 2 + 0.03] };
      let lit = o.lit || "";
      // seven entries then the signature: each takes one eighth of fill
      const draw = () => {
        const f = st.fill * 8;
        steps.forEach((s, i) => { const a = ISO.clamp(f - i, 0, 1); w.attr(s, "opacity", a.toFixed(2)); w.shown(s, a > 0.01); });
        B.sign(w, sig, f - 7);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([-X0, Y0, 0.1], P), "tax return form", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => { st.want = B.pick(p, "fill", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.fill;
        st.fill = ISO.still() || Math.abs(st.want - st.fill) < 0.002 ? st.want : st.fill + Math.sign(st.want - st.fill) * Math.min(Math.abs(st.want - st.fill), dt * 0.28);
        if (st.fill !== was) draw();
        return st.fill !== st.want;
      };
      g.readout = () => `tax return · income 32000.00 − deductions 4000.00 = taxable 28000.00 · tax due at 15 % = 4200.00 · ${st.want >= 1 ? "filled in and signed" : st.want > 0 ? "being filled in" : "blank"}`;
      draw();
      return g;
    },
  });
})();
