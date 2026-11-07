// "handbag cx cy k open=0..1 material=leather|canvas c=…" — a structured handbag seen from the front. open slides its
// layers apart like cards: outer leather or canvas, stiffening board, foam padding, lining, and the base with its feet
// drops below, so you see what keeps the bag's shape.
(() => {
  const D = "M-130 -90 L130 -90 Q141 -90 142 -79 L150 96 Q151 110 137 110 L-137 110 Q-151 110 -150 96 L-142 -79 Q-141 -90 -130 -90 Z";
  const BOX = [-152, 152, -92, 112], FAN = 118;
  const F = { class: "free", "data-free": "1" };
  // a painted fill: the colour, a few loose brush strokes over it, an ink edge
  const wash = (P, par, d, [x0, x1, y0, y1], col, n = 10) => {
    const cl = P.clip(par, d), a = P.layer(par, cl), W = x1 - x0, H = y1 - y0;
    P.el("path", { d, fill: col }, a.g);
    for (let i = 0; i < n; i++) { const y = P.rr(y0, y1), x = P.rr(x0 - W * 0.3, x1 - W * 0.2); a.stroke(x, y, x + W * P.rr(0.4, 0.9), y + P.rr(-H * 0.12, H * 0.12), P.rr(14, 34), P.pick([P.dk(col, 0.1), P.lt(col, 0.12), P.lt(col, 0.22)]), 0.5, P.rr(-10, 10)); }
    a.done(); return cl;
  };
  ISO.add({
    name: "handbag", title: "Handbag layers", compare: null,
    about: "A structured handbag from the front. open=0 the bag as you see it; open=1 its layers slide apart like cards: outer (leather or canvas), stiffening board, foam padding, lining, and the base with its metal feet drops below. Parts: outer, board, padding, lining, base, feet, handles.",
    line: "handbag cx cy k=0.2..1.5 open=0..1 material=leather|canvas c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "handbag 480 290 0.72 open=0", script: [{ set: { open: 0 }, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { open: 0.4 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, canvas = o.material === "canvas";
      const col = P.COLORS[o.c] || (canvas ? P.COLORS.cream : "#8a5634");
      P.seed(canvas ? 71 : 67);
      const g = P.base(parent, cx, cy, k), root = P.el("g", { transform: "translate(0 -6)" }, g);
      const part = (name) => P.el("g", { "data-name": name }, root);
      // the base board with its four feet, under everything
      const base = part("base");
      P.el("path", { d: "M-150 106 H150 Q156 106 156 113 V122 Q156 128 150 128 H-150 Q-156 128 -156 122 V113 Q-156 106 -150 106 Z", fill: P.dk(col, 0.25) }, base);
      const bl = P.layer(base); bl.stroke(-140, 113, 140, 114, 6, P.lt(col, 0.15), 0.5); bl.done();
      P.ink("M-150 106 H150 Q156 106 156 113 V122 Q156 128 150 128 H-150 Q-156 128 -156 122 V113 Q-156 106 -150 106 Z", base, 3);
      const feet = P.el("g", { "data-name": "feet" }, base);
      for (const x of [-118, -40, 40, 118]) { P.el("path", { d: `M${x - 11} 128 Q${x - 10} 142 ${x} 142 Q${x + 10} 142 ${x + 11} 128 Z`, fill: "#c9a24e", stroke: P.INK, "stroke-width": 2.4, "stroke-linejoin": "round" }, feet); P.el("path", { d: `M${x - 5} 132 L${x - 3} 137`, stroke: "#f3e2b0", "stroke-width": 2.4, "stroke-linecap": "round", ...F }, feet); }
      // lining: smooth satin, the back of the stack
      const lining = part("lining"), lin = P.COLORS.rose;
      P.brush("satin", lining, P.clip(lining, D), BOX.slice(0, 4), lin, { density: 0.7 }); P.ink(D, lining, 3);
      // padding: foam with its little holes
      const pad = part("padding"), fc = "#e6d68c", pc = wash(P, pad, D, BOX, fc, 6), pl = P.layer(pad, pc);
      for (let i = 0; i < 70; i++) pl.dab(P.rr(-150, 150), P.rr(-88, 108), P.rr(2.5, 6), P.pick([P.dk(fc, 0.22), P.dk(fc, 0.12)]), 0.7);
      pl.done(); P.ink(D, pad, 3);
      // stiffening board: a stiff gray-brown sheet, pressed fibers
      const board = part("board"), bc = "#b9a17a", cc = wash(P, board, D, BOX, bc, 8), bf = P.layer(board, cc);
      bf.flecks(240, -150, -90, 150, 110, P.dk(bc, 0.3), 0.5); bf.flecks(120, -150, -90, 150, 110, P.lt(bc, 0.4), 0.5); bf.done();
      P.ink(D, board, 3.4);
      // the outer: leather (smooth, soft shine, stitched edge) or canvas (woven), with handles and a clasp
      const outer = part("outer");
      const handles = P.el("g", { "data-name": "handles" }, outer);
      const hd = "M-92 -88 C-92 -206 92 -206 92 -88";
      P.el("path", { d: hd, fill: "none", stroke: P.INK, "stroke-width": 21, "stroke-linecap": "round", ...F }, handles);
      P.el("path", { d: hd, fill: "none", stroke: P.dk(col, 0.12), "stroke-width": 15, "stroke-linecap": "round", ...F }, handles);
      P.el("path", { d: "M-84 -104 C-82 -180 -20 -190 10 -186", fill: "none", stroke: P.lt(col, 0.3), "stroke-width": 3, opacity: 0.6, "stroke-linecap": "round", ...F }, handles);
      for (const s of [-1, 1]) P.el("rect", { x: s * 92 - 12, y: -100, width: 24, height: 14, rx: 4, fill: "#c9a24e", stroke: P.INK, "stroke-width": 2.4 }, handles);
      const oc = P.clip(outer, D);
      if (canvas) P.brush("linen", outer, oc, BOX.slice(0, 4), col, { density: 0.8 });
      else { wash(P, outer, D, BOX, col, 7); const sh = P.layer(outer, oc); sh.stroke(-120, -60, 40, -70, 26, P.lt(col, 0.3), 0.35, -8); sh.stroke(-100, -52, -10, -58, 8, P.lt(col, 0.55), 0.5, -4); sh.stroke(-150, 80, 150, 90, 30, P.dk(col, 0.25), 0.35, 6); sh.done(); }
      P.el("path", { d: "M-128 -78 L128 -78 L138 98 L-138 98 Z", fill: "none", stroke: canvas ? P.dk(col, 0.4) : "#ead6a8", "stroke-width": 2.6, "stroke-dasharray": "9 7", "stroke-linejoin": "round", ...F }, outer);
      P.ink(D, outer, 3.6);
      P.el("path", { d: "M-16 -90 H16 V-62 Q16 -52 0 -48 Q-16 -52 -16 -62 Z", fill: "#c9a24e", stroke: P.INK, "stroke-width": 2.6, "stroke-linejoin": "round" }, outer);
      P.el("circle", { cx: 0, cy: -64, r: 5, fill: "#8d6c2a" }, outer);
      const layers = [[outer, -1.5, 0], [board, -0.5, -12], [pad, 0.5, -24], [lining, 1.5, -36]];
      const st = { open: ISO.clamp(+o.open || 0, 0, 1) }; let p = st.open;
      const draw = () => {
        const e = ISO.smooth(0, 1, p);
        for (const [el, i, dy] of layers) el.setAttribute("transform", `translate(${(i * FAN * e).toFixed(1)} ${(dy * e).toFixed(1)})`);
        base.setAttribute("transform", `translate(0 ${(70 * e).toFixed(1)})`);
      };
      draw();
      g.set = (q) => { if (q.open !== undefined) st.open = ISO.clamp(+q.open || 0, 0, 1); };
      g.update = (dt) => { const was = p; p = ISO.still() ? st.open : ISO.follow(p, st.open, dt, 0.45); if (Math.abs(p - st.open) < 0.002) p = st.open; if (p !== was) draw(); return p !== st.open; };
      g.readout = () => `${canvas ? "canvas" : "leather"} handbag, layers ${Math.round(st.open * 100)}% apart`;
      return g;
    },
  });
})();
