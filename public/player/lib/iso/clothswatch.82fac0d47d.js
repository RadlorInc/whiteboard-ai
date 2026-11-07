// "clothswatch cx cy k fabric=… c=… wrinkle=0..1 yellow=0..1 fade=0..1" — a cut piece of cloth, zigzag edge and a pin,
// painted with its own fabric's brush, so denim, silk and wool look different before any label is read.
(() => {
  const FAB = "denim|silk|satin|linen|cotton|polyester|wool|cashmere|flannel|velvet|corduroy|fleece";
  const W = 330, H = 390, T = 15, X0 = -W / 2, Y0 = -H / 2;
  const zig = []; for (let x = 0; x < W; x += T * 2) zig.push([x, 0], [x + T, -T]);
  for (let y = 0; y < H; y += T * 2) zig.push([W, y], [W + T, y + T]);
  for (let x = W; x > 0; x -= T * 2) zig.push([x, H], [x - T, H + T]);
  for (let y = H; y > 0; y -= T * 2) zig.push([0, y], [-T, y - T]);
  const D = "M" + zig.map(([x, y]) => `${x + X0} ${y + Y0}`).join("L") + "Z";
  ISO.add({
    name: "clothswatch", title: "Piece of cloth", compare: null,
    about: `A cut piece of cloth with a zigzag edge, pinned to the table, painted so each fabric looks like itself. Set wrinkle, yellow or fade to show creases, a yellowed white or worn-out dye.`,
    line: `clothswatch cx cy k=0.2..1.5 fabric=${FAB} c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red wrinkle=0..1 yellow=0..1 fade=0..1 pin=0|1`,
    demo: { line: "clothswatch 480 270 0.95 fabric=linen", script: [{ set: { wrinkle: 0 }, hold: 1 }, { set: { wrinkle: 1 }, hold: "settle" }, { set: { wrinkle: 0, fade: 1 }, hold: "settle" }, { set: { fade: 0, yellow: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, fabric = P.FABRICS.includes(o.fabric) ? o.fabric : "cotton", col = P.colorOf(fabric, o.c);
      P.seed(5 + P.FABRICS.indexOf(fabric) * 7);
      const g = P.base(parent, cx, cy, k), S = P.el("g", { transform: "rotate(3)" }, g), cl = P.clip(S, D);
      P.brush(fabric, S, cl, [X0, X0 + W, Y0, Y0 + H], col);
      // the three states lie on top as finished layers; only their opacity moves
      const over = (build) => { const f = P.el("g", { opacity: 0, "clip-path": `url(#${cl})` }, S), a = P.layer(f); build(a); a.done(); return f; };
      const crease = over((a) => { for (let i = 0; i < 9; i++) { const x = P.rr(X0, X0 + W), y = P.rr(Y0, Y0 + H), l = P.rr(90, 220), r = P.rr(-0.8, 0.8), dx = Math.cos(r) * l, dy = Math.sin(r) * l; a.stroke(x, y, x + dx, y + dy, P.rr(9, 15), P.dk(col, 0.42), 0.6, P.rr(-18, 18)); a.stroke(x + 8, y + 9, x + dx + 8, y + dy + 9, P.rr(5, 9), P.lt(col, 0.5), 0.6, P.rr(-18, 18)); } });
      const worn = over((a) => { for (let i = 0; i < 44; i++) { const x = P.rr(X0, X0 + W), y = P.rr(Y0 - 40, Y0 + H); a.stroke(x, y, x + P.rr(-14, 14), y + P.rr(80, 220), P.rr(9, 24), P.lt(col, 0.45), 0.42); } });
      const yel = over((a) => { a.stroke(X0 - 30, 0, X0 + W + 30, 0, H + 60, "#dcc15a", 0.3); for (let i = 0; i < 26; i++) a.dab(P.rr(X0, X0 + W), P.rr(Y0, Y0 + H), P.rr(24, 56), "#d0ab3c", 0.32); });
      P.el("path", { d: D, fill: "none", stroke: P.INK, "stroke-width": 3.4, "stroke-linejoin": "round", class: "free", "data-free": "1" }, S);
      if (o.pin !== "0" && o.pin !== 0) { const p = P.el("g", {}, S); P.el("path", { d: `M${X0 + 26} ${Y0 + 30}l64 60`, stroke: "#8a8680", "stroke-width": 5, "stroke-linecap": "round", class: "free", "data-free": "1" }, p); P.el("circle", { cx: X0 + 24, cy: Y0 + 28, r: 9, fill: "#d9463f", stroke: P.INK, "stroke-width": 2.5 }, p); }
      const st = { wrinkle: +o.wrinkle || 0, fade: +o.fade || 0, yellow: +o.yellow || 0 }, now = { ...st };
      const paint = () => { crease.setAttribute("opacity", now.wrinkle.toFixed(3)); worn.setAttribute("opacity", now.fade.toFixed(3)); yel.setAttribute("opacity", now.yellow.toFixed(3)); };
      paint();
      g.set = (p) => { for (const q of ["wrinkle", "fade", "yellow"]) if (p[q] !== undefined) st[q] = ISO.clamp(+p[q] || 0, 0, 1); };
      g.update = (dt) => { let on = false; for (const q in st) { now[q] = ISO.still() ? st[q] : ISO.follow(now[q], st[q], dt, 0.25); if (Math.abs(now[q] - st[q]) < 0.004) now[q] = st[q]; else on = true; } paint(); return on; };
      g.readout = () => `${fabric}: wrinkle ${st.wrinkle.toFixed(1)}, fade ${st.fade.toFixed(1)}, yellow ${st.yellow.toFixed(1)}`;
      return g;
    },
  });
})();
