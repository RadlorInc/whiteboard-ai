// "silkcocoon cx cy k unwind=0..1" — a silk cocoon hanging from a twig, its one long thread running across to a wooden
// reel. As unwind rises the reel turns, the band of silk on it grows and the cocoon shrinks. A small plain silkworm
// sits on a leaf.
(() => {
  const CX = -180, CY = -40, RX = 190, RY = 40, R = 104;
  const fill = (P, par, d, [x0, x1, y0, y1], col, o = {}) => {
    const id = P.clip(par, d), a = P.layer(par, id);
    P.el("path", { d, fill: col }, a.g);
    const n = Math.min(40, Math.max(5, Math.round(((x1 - x0) * (y1 - y0)) / 700)));
    for (let i = 0; i < n; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1), t = (o.ang || 0) + P.rr(-0.5, 0.5), L = P.rr(14, 40);
      a.stroke(x, y, x + Math.cos(t) * L, y + Math.sin(t) * L, P.rr(5, 12), P.pick([P.dk(col, 0.14), P.lt(col, 0.16), col]), 0.75, P.rr(-5, 5)); }
    a.done(); if (o.ink !== false) P.ink(d, par, o.iw || 2.8);
  };
  // a heart-shaped mulberry leaf from its stalk end (x, y), s long, turned r
  const leafD = (x, y, s, r) => { const c = Math.cos(r) * s / 110, n = Math.sin(r) * s / 110, f = (u, v) => (x + u * c - v * n).toFixed(1) + " " + (y + u * n + v * c).toFixed(1);
    return `M${f(0, 0)}C${f(-14, -34)} ${f(30, -54)} ${f(60, -38)}C${f(86, -26)} ${f(100, -8)} ${f(112, 0)}C${f(100, 8)} ${f(86, 26)} ${f(60, 38)}C${f(30, 54)} ${f(-14, 34)} ${f(0, 0)}Z`; };
  ISO.add({
    name: "silkcocoon", title: "Silk cocoon and reel", compare: null,
    about: "A silk cocoon hanging from a twig, with a small plain silkworm on a leaf. The cocoon is one long thread: unwind=0 the thread is just starting onto the wooden reel; unwind=1 the reel holds a thick band of silk and the cocoon has shrunk. Parts: twig, worm, cocoon, thread, reel.",
    line: "silkcocoon cx cy k=0.2..1.5 unwind=0..1",
    demo: { line: "silkcocoon 480 270 0.6 unwind=0", script: [{ set: { unwind: 0 }, hold: 1 }, { set: { unwind: 0.5 }, hold: "settle" }, { set: { unwind: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(83);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" };
      // twig and mulberry leaves
      const tw = P.el("g", { "data-name": "twig" }, g), tl = P.layer(tw), TC = "#6e5136";
      tl.stroke(-330, -190, -20, -150, 16, TC, 1, -10); tl.stroke(-250, -178, -290, -250, 8, TC, 1, 4); tl.stroke(-90, -158, -60, -230, 7, TC, 1, -4);
      tl.stroke(-330, -194, -20, -154, 4, P.lt(TC, 0.3), 0.7, -10); tl.done();
      fill(P, tw, leafD(-288, -244, 120, -2.3), [-400, -260, -380, -230], "#5d8a45", { ang: -2.3 });
      fill(P, tw, leafD(-62, -226, 120, -0.75), [-70, 50, -330, -210], "#548040", { ang: -0.75 });
      P.el("path", { d: "M-288 -244 L-345 -322 M-62 -226 L18 -298", fill: "none", stroke: "#b8cf8a", "stroke-width": 2, ...free }, tw);
      // the silkworm: a plain pale body of segments on the leaf
      const wg = P.el("g", { "data-name": "worm" }, g), wl = P.layer(wg); let wo = "";
      for (let i = 0; i < 7; i++) { const x = -30 + i * 11, y = -262 - Math.sin(i * 0.6) * 6; wl.dab(x, y, 10 - Math.abs(i - 2) * 0.5, i % 2 ? "#e8e2d2" : "#ddd6c4"); wo += `M${x - 7} ${y - 8}Q${x} ${y + 2} ${x - 7} ${y + 8}`; }
      wl.done(); P.el("circle", { cx: -33, cy: -262, r: 8, fill: "#bfb6a2", stroke: P.INK, "stroke-width": 1.6 }, wg);
      P.el("path", { d: "M-42 -268 Q-6 -290 42 -272 Q48 -258 42 -250 Q-6 -246 -42 -256 Z", fill: "none", stroke: P.INK, "stroke-width": 2, "stroke-linejoin": "round", ...free }, wg);
      P.el("path", { d: wo, fill: "none", stroke: "#a69c86", "stroke-width": 1.2, ...free }, wg);
      // the cocoon: silk wisps to the twig, then the body; it shrinks toward its top
      P.el("path", { d: `M${CX - 14} -170 L${CX - 4} ${CY - 84} M${CX + 6} -168 L${CX + 2} ${CY - 84} M${CX + 18} -166 L${CX + 8} ${CY - 84}`, fill: "none", stroke: "#cfc6b0", "stroke-width": 1.4, ...free }, g);
      const co = P.el("g", { "data-name": "cocoon" }, g), cin = P.el("g", { transform: `translate(${CX} ${CY}) scale(1.6)` }, co), cs = P.el("g", {}, cin);
      const CD = "M0 -54 C30 -54 40 -30 36 -8 C34 6 36 22 30 38 C22 58 -22 58 -30 38 C-36 22 -34 6 -36 -8 C-40 -30 -30 -54 0 -54Z";
      { const id = P.clip(cs, CD), a = P.layer(cs, id); P.el("path", { d: CD, fill: "#efe7d2" }, a.g);
        for (let i = 0; i < 70; i++) { const x = P.rr(-38, 38), y = P.rr(-56, 56), th = P.rr(0, 6.28); a.stroke(x, y, x + Math.cos(th) * 18, y + Math.sin(th) * 18, P.rr(1.6, 3), P.pick(["#d9cdb0", "#fffaf0", "#cbbf9f"]), 0.85, P.rr(-8, 8)); }
        a.stroke(-18, -40, -22, 30, 12, "#fffaf0", 0.6, -6); a.stroke(14, -30, 18, 40, 16, "#d4c7a8", 0.5, 6); a.done(); P.ink(CD, cs, 2.8); }
      // the reel on its stand
      const rg = P.el("g", { "data-name": "reel" }, g), st_ = P.layer(rg), WC = "#9a6a3e";
      st_.stroke(RX - 120, RY + 156, RX + 120, RY + 156, 24, P.dk(WC, 0.15)); st_.stroke(RX - 80, RY + 150, RX - 6, RY, 16, WC); st_.stroke(RX + 80, RY + 150, RX + 6, RY, 16, WC); st_.done();
      P.ink(`M${RX - 120} ${RY + 144}H${RX + 120}V${RY + 168}H${RX - 120}Z`, rg, 2.4, false);
      const turn = P.el("g", {}, rg), hex = (r) => "M" + Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1); }).join("L") + "Z";
      const sp = P.layer(turn); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; sp.stroke(0, 0, Math.cos(a) * R, Math.sin(a) * R, 10, WC); } sp.done();
      P.el("path", { d: hex(R), fill: "none", stroke: P.dk(WC, 0.2), "stroke-width": 9, "stroke-linejoin": "round", ...free }, turn);
      const band = P.el("path", { d: hex(R + 4), fill: "none", stroke: "#f1e2b8", "stroke-linejoin": "round", ...free }, turn);
      const bandHi = P.el("path", { d: hex(R + 4), fill: "none", stroke: "#fff6dc", "stroke-dasharray": "6 14", "stroke-linejoin": "round", ...free }, turn);
      const bandInk = P.el("path", { fill: "none", stroke: P.INK, "stroke-width": 2, "stroke-linejoin": "round", ...free }, turn);
      P.el("circle", { cx: 0, cy: 0, r: 14, fill: "#7c7f86", stroke: P.INK, "stroke-width": 2.4 }, turn);
      turn.setAttribute("transform", `translate(${RX} ${RY})`);
      const th = P.el("path", { "data-name": "thread", fill: "none", stroke: "#e6cf8c", "stroke-width": 4, ...free }, g);
      const thd = P.el("path", { fill: "none", stroke: "#7d6a3e", "stroke-width": 1.2, opacity: 0.7, ...free }, g);
      const s = { unwind: ISO.clamp(+o.unwind || 0, 0, 1) }; let u = s.unwind;
      const draw = () => {
        const sc = 1 - 0.55 * u, bw = 3 + u * 26;
        cs.setAttribute("transform", `translate(0 -54) scale(${sc.toFixed(3)}) translate(0 54)`);
        turn.setAttribute("transform", `translate(${RX} ${RY}) rotate(${(u * 900).toFixed(1)})`);
        band.setAttribute("d", hex(R + 4 + bw / 2)); band.setAttribute("stroke-width", bw.toFixed(1));
        bandHi.setAttribute("d", hex(R + 4 + bw / 2)); bandHi.setAttribute("stroke-width", Math.max(1, bw * 0.3).toFixed(1));
        bandInk.setAttribute("d", hex(R + 5 + bw)); bandInk.setAttribute("opacity", u > 0.04 ? 1 : 0);
        const x0 = CX + 48 * sc, y0 = CY + (-54 + 74 * sc) * 1.6, x1 = RX, y1 = RY - (R + 5 + bw) * 0.87, d = `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${((x0 + x1) / 2).toFixed(1)} ${(Math.max(y0, y1) + 30).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
        th.setAttribute("d", d); thd.setAttribute("d", d);
      };
      draw();
      g.set = (q) => { if (q.unwind !== undefined) s.unwind = ISO.clamp(+q.unwind || 0, 0, 1); };
      g.update = (dt) => { u = ISO.still() ? s.unwind : ISO.follow(u, s.unwind, dt, 0.6); if (Math.abs(u - s.unwind) < 0.002) u = s.unwind; draw(); return u !== s.unwind; };
      g.readout = () => (s.unwind < 0.1 ? "one thread starting onto the reel" : s.unwind < 0.9 ? "the reel turns and the cocoon unwinds" : "most of the thread is on the reel");
      return g;
    },
  });
})();
