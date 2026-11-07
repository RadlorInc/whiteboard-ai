// "bagclasp cx cy k close=0..1 field=0|1" — a magnetic bag clasp cut open from the side. The top disc, on the bag's
// flap, holds a magnet; the bottom disc, on the bag's front, is a steel plate with a socket. close brings the flap
// down; the pull grows as the gap shrinks, so the last bit snaps shut with a click. field=1 shows the magnet's lines.
(() => {
  const GAP = 150, F = { class: "free", "data-free": "1" };
  const wash = (P, par, d, [x0, x1, y0, y1], col, n = 8) => {
    const cl = P.clip(par, d), a = P.layer(par, cl), W = x1 - x0, H = y1 - y0;
    P.el("path", { d, fill: col }, a.g);
    for (let i = 0; i < n; i++) { const y = P.rr(y0, y1), x = P.rr(x0 - W * 0.3, x1 - W * 0.2); a.stroke(x, y, x + W * P.rr(0.4, 0.9), y + P.rr(-H * 0.1, H * 0.1), P.rr(8, 20), P.pick([P.dk(col, 0.1), P.lt(col, 0.14), P.lt(col, 0.25)]), 0.5, P.rr(-6, 6)); }
    a.done(); P.ink(d, par, 3.2); return cl;
  };
  ISO.add({
    name: "bagclasp", title: "Magnetic bag clasp", compare: null,
    about: "A magnetic bag clasp cut open from the side: the top disc on the flap holds a magnet (red and blue halves), the bottom disc on the bag front is a steel plate with a socket. close=0 apart, close=1 shut: the flap comes down slowly, then the magnet pulls the last bit fast and it clicks. field=1 shows the magnet's field lines. Parts: flap, magnet, plate, front.",
    line: "bagclasp cx cy k=0.2..1.5 close=0..1 field=0|1 c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "bagclasp 480 270 0.95 close=0", script: [{ set: { close: 0 }, hold: 1 }, { set: { close: 0.6 }, hold: "settle" }, { set: { close: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, col = P.COLORS[o.c] || "#7a4b30", showField = o.field !== "0" && o.field !== 0;
      P.seed(83);
      const g = P.base(parent, cx, cy, k);
      // the bag front, cut through, and the steel plate disc on it
      const front = P.el("g", { "data-name": "front" }, g);
      wash(P, front, "M-230 96 H230 V126 H-230 Z", [-230, 230, 96, 126], col);
      const plate = P.el("g", { "data-name": "plate" }, front);
      P.el("path", { d: "M-66 96 V82 Q-66 72 -56 72 H-22 V90 H22 V72 H56 Q66 72 66 82 V96 Z", fill: "#b7bec6", stroke: P.INK, "stroke-width": 3, "stroke-linejoin": "round" }, plate);
      P.el("path", { d: "M-56 79 H-30 M30 79 H56", stroke: "#eef1f4", "stroke-width": 3, "stroke-linecap": "round", ...F }, plate);
      P.el("path", { d: "M-8 126 V146 M8 126 V146", stroke: "#8f979f", "stroke-width": 6, "stroke-linecap": "round", ...F }, plate);
      // field lines (behind the flap): redrawn as the gap changes
      const field = P.el("path", { fill: "none", stroke: "#5b7fb0", "stroke-width": 2.4, "stroke-dasharray": "6 6", "stroke-linecap": "round", ...F }, g);
      // the flap with the magnet disc under it; this whole group moves down
      const flap = P.el("g", { "data-name": "flap" }, g);
      wash(P, flap, "M-200 -40 H190 Q218 -40 218 -20 Q218 0 190 0 H-200 Z", [-200, 218, -40, 0], col);
      P.el("path", { d: "M-190 -20 H186", stroke: "#ead6a8", "stroke-width": 2.4, "stroke-dasharray": "9 7", ...F }, flap);
      P.el("path", { d: "M-66 0 V14 Q-66 24 -56 24 H-16 V34 Q-16 40 -10 40 H10 Q16 40 16 34 V24 H56 Q66 24 66 14 V0 Z", fill: "#c9a24e", stroke: P.INK, "stroke-width": 3, "stroke-linejoin": "round" }, flap);
      const mag = P.el("g", { "data-name": "magnet" }, flap);
      P.el("rect", { x: -44, y: 3, width: 88, height: 9, fill: "#c4483f" }, mag);
      P.el("rect", { x: -44, y: 12, width: 88, height: 9, fill: "#3f6aa8" }, mag);
      P.el("rect", { x: -44, y: 3, width: 88, height: 18, fill: "none", stroke: P.INK, "stroke-width": 2 }, mag);
      P.el("path", { d: "M-52 16 L-46 16 M46 16 L52 16", stroke: "#f2dc9a", "stroke-width": 2.6, "stroke-linecap": "round", ...F }, flap);
      // the click: short marks around the meeting point
      const click = P.el("path", { d: "M-82 60 L-104 50 M-84 72 L-110 74 M-80 84 L-100 96 M82 60 L104 50 M84 72 L110 74 M80 84 L100 96", stroke: "#d9862b", "stroke-width": 4, "stroke-linecap": "round", opacity: 0, ...F }, g);
      const st = { close: ISO.clamp(+o.close || 0, 0, 1) }; let c = st.close;
      const draw = () => {
        const gap = GAP * (1 - c ** 3);   // gap 0: the disc face (24) sits on the plate (72)
        flap.setAttribute("transform", `translate(0 ${(48 - gap).toFixed(1)})`);
        const top = 69 - gap, bot = 76; let d = "";
        if (showField) for (let i = 1; i <= 3; i++) { const x = 12 + i * 10, out = 18 + i * 18 + gap * 0.18; d += `M${-x} ${top.toFixed(1)} C${-x - out} ${(top + 10).toFixed(1)} ${-x - out} ${bot - 16} ${-x - 6} ${bot}M${x} ${top.toFixed(1)} C${x + out} ${(top + 10).toFixed(1)} ${x + out} ${bot - 16} ${x + 6} ${bot}`; }
        field.setAttribute("d", d || "M0 0");
        field.setAttribute("opacity", (0.35 + 0.65 * Math.min(1, 40 / (gap + 40))).toFixed(2));
        click.setAttribute("opacity", ISO.smooth(0.93, 1, c).toFixed(2));
      };
      draw();
      g.set = (q) => { if (q.close !== undefined) st.close = ISO.clamp(+q.close || 0, 0, 1); };
      g.update = (dt) => { const was = c; c = ISO.still() ? st.close : ISO.follow(c, st.close, dt, 0.4); if (Math.abs(c - st.close) < 0.002) c = st.close; if (c !== was) draw(); return c !== st.close; };
      g.readout = () => (st.close >= 0.99 ? "clasp shut: magnet holding the steel plate" : `clasp ${Math.round(st.close * 100)}% of the way closed`);
      return g;
    },
  });
})();
