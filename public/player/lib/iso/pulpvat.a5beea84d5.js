// "pulpvat cx cy k cook=0..1" — a log, its wood chips dropping into a tall cooking vat, and soft pulp sheets coming
// out. The vat is cut open at the front: cook=0 brown chips in liquid; cook=1 soft pale pulp, steam over the top and a
// stack of pulp sheets beside it.
(() => {
  const VX = -40, VW = 120, VT = -150, VB = 170;
  const fill = (P, par, d, [x0, x1, y0, y1], col, o = {}) => {
    const id = P.clip(par, d), a = P.layer(par, id);
    P.el("path", { d, fill: col }, a.g);
    const n = Math.min(44, Math.max(5, Math.round(((x1 - x0) * (y1 - y0)) / 900)));
    for (let i = 0; i < n; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1), t = (o.ang || 0) + P.rr(-0.4, 0.4), L = P.rr(16, 46);
      a.stroke(x, y, x + Math.cos(t) * L, y + Math.sin(t) * L, P.rr(6, 14), P.pick([P.dk(col, 0.12), P.lt(col, 0.16), col]), 0.75, P.rr(-5, 5)); }
    a.done(); if (o.ink !== false) P.ink(d, par, o.iw || 2.8);
  };
  const chips = (L, n, x0, x1, y0, y1, slope = 0) => { for (let i = 0; i < n; i++) { const x = window.PAINT.rr(x0, x1), y = window.PAINT.rr(y0, y1) + slope * Math.abs(x - (x0 + x1) / 2), a = window.PAINT.rr(0, 3.14), l = window.PAINT.rr(9, 16);
    L.stroke(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, window.PAINT.rr(6, 9), window.PAINT.pick(["#c9a066", "#b78a50", "#d8b47a", "#a87a44"]), 1); } };
  ISO.add({
    name: "pulpvat", title: "Wood pulp vat", compare: null,
    about: "A log, its wood chips dropping into a tall cooking vat cut open at the front, and pulp sheets coming out. cook=0 the vat holds brown chips in liquid; cook=0.5 the chips soften and break up; cook=1 soft pale pulp, steam over the top and a stack of pulp sheets beside the vat. Parts: log, chips, vat, pulp, sheets.",
    line: "pulpvat cx cy k=0.2..1.5 cook=0..1",
    demo: { line: "pulpvat 480 280 0.55 cook=0", script: [{ set: { cook: 0 }, hold: 1 }, { set: { cook: 0.5 }, hold: "settle" }, { set: { cook: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(97);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" };
      // the log, end on, with its rings
      const lg = P.el("g", { "data-name": "log" }, g);
      fill(P, lg, "M-380 150 L-250 120 L-250 196 L-380 226 Z", [-380, -250, 116, 230], "#7a5434", { ang: -0.23 });
      fill(P, lg, "M-250 120 C-226 120 -226 196 -250 196 C-274 196 -274 120 -250 120Z", [-275, -225, 118, 198], "#d6ad74", { iw: 2.4 });
      P.el("path", { d: "M-250 136 C-238 136 -238 180 -250 180 C-262 180 -262 136 -250 136Z M-250 150 C-245 150 -245 166 -250 166 C-255 166 -255 150 -250 150Z", fill: "none", stroke: "#9b7244", "stroke-width": 1.8, ...free }, lg);
      // chips: a heap by the log and a hopper over the vat
      const ch = P.el("g", { "data-name": "chips" }, g), cl = P.layer(ch); chips(cl, 40, -230, -150, 196, 222, -0.25); cl.done();
      fill(P, ch, `M${VX - 70} -300 H${VX + 70} L${VX + 22} -236 H${VX - 22} Z`, [VX - 70, VX + 70, -300, -236], "#8f949c", { iw: 2.6 });
      const hl = P.layer(ch); chips(hl, 22, VX - 56, VX + 56, -306, -296); chips(hl, 7, VX - 10, VX + 10, -228, -184); hl.done();
      // the vat: legs, body, dome, cut-open window, gauge, outlet pipe
      const vg = P.el("g", { "data-name": "vat" }, g), ML = "#9aa1a8";
      const legs = P.layer(vg); legs.stroke(VX - 90, VB - 10, VX - 104, VB + 50, 14, P.dk(ML, 0.3)); legs.stroke(VX + 90, VB - 10, VX + 104, VB + 50, 14, P.dk(ML, 0.3)); legs.done();
      const body = `M${VX - VW} ${VT} Q${VX - VW} ${VT - 80} ${VX} ${VT - 82} Q${VX + VW} ${VT - 80} ${VX + VW} ${VT} L${VX + VW} ${VB - 30} Q${VX + VW} ${VB + 10} ${VX} ${VB + 12} Q${VX - VW} ${VB + 10} ${VX - VW} ${VB - 30} Z`;
      fill(P, vg, body, [VX - VW, VX + VW, VT - 84, VB + 14], ML, { ang: 1.57 });
      const shine = P.layer(vg); shine.stroke(VX - 92, VT - 30, VX - 92, VB - 40, 12, P.lt(ML, 0.5), 0.6); shine.done();
      P.el("path", { d: `M${VX - 20} ${VT - 82} V${VT - 100} H${VX + 20} V${VT - 82} M${VX - 26} ${VT - 104} H${VX + 26}`, fill: "none", stroke: P.INK, "stroke-width": 2.6, ...free }, vg);
      P.el("path", { d: `M${VX + VW} ${VB - 40} H${VX + 190} V${VB - 8} H${VX + VW}`, fill: "#7f868e", stroke: P.INK, "stroke-width": 2.6, "stroke-linejoin": "round", ...free }, vg);
      const WIN = `M${VX - 86} ${VT - 10} H${VX + 86} V${VB - 36} Q${VX + 86} ${VB - 10} ${VX} ${VB - 8} Q${VX - 86} ${VB - 10} ${VX - 86} ${VB - 36} Z`;
      // inside: the raw state, then the cooked state over it; only the cooked one's opacity moves
      const wid = P.clip(vg, WIN), inside = P.el("g", { "clip-path": `url(#${wid})` }, vg);
      const raw = P.layer(inside); raw.stroke(VX - 100, VT + 40, VX + 100, VT + 40, 600, "#a7783c", 1); for (let i = 0; i < 10; i++) raw.stroke(VX - 90, VT + 30 + i * 30, VX + 90, VT + 30 + i * 30, 16, "#8a5f2e", 0.35, P.rr(-6, 6));
      chips(raw, 80, VX - 86, VX + 86, VT + 10, VB - 10); raw.done();
      const pulp = P.el("g", { "data-name": "pulp", opacity: 0 }, inside), pl = P.layer(pulp);
      pl.stroke(VX - 100, VT + 40, VX + 100, VT + 40, 600, "#e9dfc6", 1);
      for (let i = 0; i < 46; i++) { const x = P.rr(VX - 86, VX + 86), y = P.rr(VT, VB), a = P.rr(0, 6.28); pl.stroke(x, y, x + Math.cos(a) * 30, y + Math.sin(a) * 30, P.rr(10, 22), P.pick(["#f4ecd8", "#ddd0b0", "#efe4c8"]), 0.8, P.rr(-10, 10)); }
      for (let i = 0; i < 60; i++) { const x = P.rr(VX - 86, VX + 86), y = P.rr(VT, VB), a = P.rr(0, 6.28); pl.stroke(x, y, x + Math.cos(a) * 12, y + Math.sin(a) * 12, 1.6, "#b9a67c", 0.6, P.rr(-5, 5)); }
      pl.done();
      P.ink(WIN, vg, 3, false);
      P.el("path", { d: `M${VX - 80} ${VT - 50} V${VT - 80} M${VX - 90} ${VT - 80} H${VX - 70}`, fill: "none", stroke: P.INK, "stroke-width": 4, "stroke-linecap": "round", ...free }, vg);
      const sg = P.el("g", { opacity: 0 }, vg), sl = P.layer(sg);
      for (let i = 0; i < 3; i++) { const x = VX - 84 + i * 12; sl.stroke(x, VT - 84, x + P.rr(-34, 10), VT - 170, P.rr(14, 22), "#ffffff", 0.55, P.rr(-16, 16)); } sl.done();
      // the gauge: its needle swings over as the vat heats
      P.el("circle", { cx: VX + 70, cy: VT - 46, r: 22, fill: "#f3efe4", stroke: P.INK, "stroke-width": 2.6 }, vg);
      P.el("path", { d: `M${VX + 54} ${VT - 40} A17 17 0 0 1 ${VX + 86} ${VT - 40}`, fill: "none", stroke: "#c4553c", "stroke-width": 4, ...free }, vg);
      const needle = P.el("path", { d: "M0 0 L0 -15", stroke: P.INK, "stroke-width": 2.6, "stroke-linecap": "round", ...free }, vg);
      // the sheets: thin pale slabs on a low table, laid one by one
      const sh = P.el("g", { "data-name": "sheets" }, g), TB = P.layer(sh); TB.stroke(150, 188, 360, 188, 14, "#8d6b48"); TB.stroke(166, 192, 166, 236, 10, "#7a5a3c"); TB.stroke(344, 192, 344, 236, 10, "#7a5a3c"); TB.done();
      const sheets = [];
      for (let i = 0; i < 6; i++) { const y = 176 - i * 15, d = `M170 ${y} L330 ${y} L350 ${y - 16} L190 ${y - 16} Z`, s = P.el("g", { opacity: 0 }, sh);
        fill(P, s, d, [170, 350, y - 18, y + 2], P.pick(["#f1e8d2", "#ece2c8", "#f5eedc"]), { ang: 0, iw: 2 }); P.el("path", { d: `M170 ${y}V${y + 6}H330L350 ${y - 10}V${y - 16}`, fill: "#d8cba9", stroke: P.INK, "stroke-width": 1.6, "stroke-linejoin": "round", ...free }, s); sheets.push(s); }
      const st = { cook: ISO.clamp(+o.cook || 0, 0, 1) }; let c = st.cook;
      const paint = () => {
        pulp.setAttribute("opacity", ISO.clamp((c - 0.15) / 0.75, 0, 1).toFixed(3)); sg.setAttribute("opacity", ISO.clamp(c * 1.5, 0, 1).toFixed(3));
        needle.setAttribute("transform", `translate(${VX + 70} ${VT - 40}) rotate(${(-70 + c * 140).toFixed(1)})`);
        sheets.forEach((s, i) => s.setAttribute("opacity", ISO.clamp((c - 0.6 - i * 0.06) / 0.06, 0, 1).toFixed(3)));
      };
      paint();
      g.set = (q) => { if (q.cook !== undefined) st.cook = ISO.clamp(+q.cook || 0, 0, 1); };
      g.update = (dt) => { c = ISO.still() ? st.cook : ISO.follow(c, st.cook, dt, 0.6); if (Math.abs(c - st.cook) < 0.002) c = st.cook; paint(); return c !== st.cook; };
      g.readout = () => (st.cook < 0.2 ? "wood chips in the vat" : st.cook < 0.85 ? "chips cooking soft" : "soft pulp, pressed into sheets");
      return g;
    },
  });
})();
