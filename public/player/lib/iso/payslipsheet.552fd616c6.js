// "payslipsheet cx cy k slide=0..1 lab=0 lit=envelope|window|flap|payslip|netpay" — a PART (batch 6, money): a printed
// payslip (A5, 21 × 14.8 cm, paper-thin) in its opened window envelope (C5, 22.9 × 16.2 cm), standing upright on a
// desk facing the room (+y), its origin the desk point under the envelope's bottom middle. The envelope: back panel,
// its flap opened up behind (a gummed strip along it), the front with a clear film window over the employee's name
// and address. The payslip: a company block, PAYSLIP with the month and the employee number, the employee block
// (seen through the window), EARNINGS (basic 2000.00, overtime 150.00, gross 2150.00) and DEDUCTIONS (tax 215.00,
// pension 64.50, total 279.50) rows, and the NET PAY box: 2150.00 − 279.50 = 1870.50. slide 0 → 1 draws the payslip
// up out of the envelope by 15.2 cm (its foot stays just inside), so its rows and net pay show. No currency signs, no real company. 1 = 1 cm.
// anchors: top (the envelope's top edge, middle) net (the net pay box with the payslip drawn out)
(() => {
  const K = window.K;
  const EW = 22.9, EH = 16.2, SW = 21, SH = 14.8, SZ = 0.7, RISE = 15.2, FY = 0.12;
  const WIN = { x0: -9.6, x1: -1.0, z0: 6.3, z1: 10.2 };
  const ENV = "#f4efe3", ENVD = "#e3dccb", INK = "#2b3440", GREY = "#9aa1a9";
  function slipArt(B) {
    let s = `<rect width="${SW}" height="${SH}" fill="#ffffff" stroke="#b0b6bc" stroke-width="0.03"/>`;
    // the company block: a plain square mark and the name lines
    s += `<rect x="1" y="0.9" width="1.4" height="1.4" rx="0.2" fill="#3a6f8f"/>` + B.text(2.8, 1.5, "COMPANY", 0.55, INK, "start", 800) + B.bars(2.8, 1.85, 5, 2, 0.4, 0.15, GREY, 2);
    s += B.text(SW - 1, 1.6, "PAYSLIP", 0.75, INK, "end", 800) + B.text(SW - 1, 2.5, "Month 10", 0.36, "#55606b", "end", 700) + B.text(SW - 1, 3.1, "Employee No. 0117", 0.36, "#55606b", "end", 700);
    // the employee's name and address, where the window shows them
    s += B.text(1.4, 6.3, "EMPLOYEE NAME", 0.45, INK, "start", 800) + B.bars(1.4, 6.75, 6.8, 3, 0.55, 0.18, "#6d747c", 4);
    // the two tables side by side, each row a name and an amount, ruled under
    const row = (x, y, n, v, bold) => B.text(x, y, n, 0.36, INK, "start", bold ? 800 : 600) + B.num(x + 8.2, y, v, 0.4, INK, "end", bold ? 800 : 700) + B.rule(x, y + 0.2, x + 8.2, "#c3c8ce", 0.025);
    s += `<rect x="1" y="9.6" width="8.6" height="0.7" fill="#e8eef3"/><rect x="11.2" y="9.6" width="8.8" height="0.7" fill="#e8eef3"/>`;
    s += B.text(1.2, 10.12, "EARNINGS", 0.38, INK, "start", 800) + B.text(11.4, 10.12, "DEDUCTIONS", 0.38, INK, "start", 800);
    s += row(1.2, 11.0, "Basic pay", "2000.00") + row(1.2, 11.75, "Overtime", "150.00") + row(1.2, 12.5, "Gross pay", "2150.00", true);
    s += row(11.4, 11.0, "Income tax", "215.00") + row(11.4, 11.75, "Pension", "64.50") + row(11.4, 12.5, "Total", "279.50", true);
    s += `<g data-name="netpay"><rect x="11.2" y="13.05" width="8.8" height="1.25" rx="0.12" fill="#e6f2ea" stroke="#2f7a4a" stroke-width="0.06"/>` + B.text(11.45, 13.9, "NET PAY", 0.45, "#1f5a33", "start", 800) + B.num(19.8, 13.95, "1870.50", 0.6, "#1f5a33", "end", 800) + "</g>";
    s += B.text(1.2, 13.9, "Paid by bank transfer", 0.32, "#7d848c", "start", 600);
    return s;
  }
  ISO.add({
    name: "payslipsheet", title: "Payslip in envelope (part)", compare: null,
    about: "A printed payslip standing in its opened window envelope: company block, employee details through the window, earnings and deductions rows and the NET PAY box (2150.00 gross − 279.50 deductions = 1870.50); slide draws it up out of the envelope. anchors: top net",
    line: "payslipsheet cx cy k slide=0..1 lab=0 lit=envelope|window|flap|payslip|netpay",
    demo: { line: "payslipsheet 480 450 13 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "window" }, hold: 1.2 }, { set: { slide: 1, lit: "" }, hold: 3 }, { set: { lit: "netpay" }, hold: 1.6 }, { set: { lit: "flap" }, hold: 1.2 }, { set: { slide: 0, lit: "envelope" }, hold: 3 }] },
    make([cx = 480, cy = 450, k = 3], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { slide: B.val(o, "slide", 0, 0, 1) }; st.want = st.slide;
      const at = (x, z, y = FY) => K.iso([x, y, z], P), X0 = -EW / 2, X1 = EW / 2;
      const rect = (x0, x1, z0, z1, y) => K.pathOf([at(x0, z0, y), at(x1, z0, y), at(x1, z1, y), at(x0, z1, y)], true);
      // the back panel and the opened flap above it (its inside toward us, a gummed strip near its edge)
      const back = `<path d="${rect(X0, X1, 0, EH, -FY)}" fill="${ENVD}" stroke="#8a826e" stroke-width="0.6"/>`;
      const flapPts = [[X0, EH], [X1, EH], [X1 - 2.2, EH + 6.5], [X0 + 2.2, EH + 6.5]];
      const flap = `<path d="${K.pathOf(flapPts.map(([x, z]) => at(x, z, -FY)), true)}" fill="${ENVD}" stroke="#8a826e" stroke-width="0.6"/>` +
        `<path d="${K.pathOf([at(X0 + 2.6, EH + 5.6, -FY + 0.01), at(X1 - 2.6, EH + 5.6, -FY + 0.01), at(X1 - 2.9, EH + 6.2, -FY + 0.01), at(X0 + 2.9, EH + 6.2, -FY + 0.01)], true)}" fill="#efe2b8" stroke="none"/>`;
      // the front: one sheet with the window cut out (even-odd), the film over the hole, the side folds' edges
      const front = `<path d="${rect(X0, X1, 0, EH, FY)}${rect(WIN.x0, WIN.x1, WIN.z0, WIN.z1, FY)}" fill-rule="evenodd" fill="${ENV}" stroke="#8a826e" stroke-width="0.7"/>`;
      const film = `<g data-name="window"><path d="${rect(WIN.x0, WIN.x1, WIN.z0, WIN.z1, FY + 0.005)}" fill="#cfe3ef" fill-opacity=".22" stroke="#9fb4c4" stroke-width="0.5"/>` +
        `<path d="${K.pathOf([at(WIN.x0 + 0.5, WIN.z1 - 0.4, FY + 0.006), at(WIN.x0 + 3, WIN.z1 - 0.4, FY + 0.006)])}" stroke="#ffffff" stroke-opacity=".8" stroke-width="0.8" fill="none"/></g>`;
      // the envelope's thickness at its sides and bottom, and a printed return line in its top corner
      const edge = ISO.tinted(ISO.tint(ENV, [ENVD, ENVD, ENV, ENV], "#8a826e"), ISO.wbox(P, [X1 - 0.01, X1], [-FY, FY], [0, EH], "hi"));
      const ret = B.flat(P, [X1 - 7.2, FY + 0.004, EH - 1.0], [1, 0, 0], [0, 0, -1], B.text(0, 0, "If not delivered, please return", 0.32, "#7d848c", "start", 600));
      const slip = B.flat(P, [-SW / 2, 0, SZ + SH], [1, 0, 0], [0, 0, -1], slipArt(B));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0, y: -1, w: EW, d: 2, r: 0.6 }, 0, 0.2, P)}"/>` +
        `<g data-name="flap">${flap}</g><g data-name="envelope">${back}</g><g data-name="payslip"><g data-part="slip">${slip}</g></g>` +
        `<g data-name="envelope">${front}${edge}${ret}</g>${film}<g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { top: [0, 0, EH], net: [-SW / 2 + 15.6, 0, SZ + SH - 13.7 + RISE] };
      const o0 = K.iso([0, 0, 0], P), o1 = K.iso([0, 0, 1], P), up = [o1[0] - o0[0], o1[1] - o0[1]];
      let lit = o.lit || "";
      const draw = () => {
        const z = RISE * B.smooth(0, 1, st.slide);
        w.attr(el.slip, "transform", `translate(${(up[0] * z).toFixed(2)} ${(up[1] * z).toFixed(2)})`);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(at(X1 + 0.5, EH), "payslip in its envelope", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => { st.want = B.pick(p, "slide", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.slide;
        st.slide = ISO.follow(st.slide, st.want, dt, 0.45, ISO.still());
        if (st.slide !== was) draw();
        return st.slide !== st.want;
      };
      g.readout = () => `payslip · month 10 · gross 2150.00 − deductions 279.50 = net pay 1870.50 · ${st.want > 0.5 ? "drawn out of its envelope" : "in its window envelope"}`;
      draw();
      return g;
    },
  });
})();
