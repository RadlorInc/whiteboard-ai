// "snapbutton cx cy k close=0..1" — a metal snap cut in half. The ball stud on the top cloth comes down into the
// socket on the bottom cloth; the socket's spring ring (two wire ends seen in the cut) is pushed apart by the ball,
// then springs back in above the ball's widest part and holds it: the click. A small ring seen from above shows the
// same spreading.
(() => {
  const R = 34, RW = 8, S0 = 28, WY = 56, B0 = -84, B1 = 82, F = { class: "free", "data-free": "1" };
  const BRASS = "#c9a24e", CUT = "#e2c27a", WIRE = "#aeb6bf";
  ISO.add({
    name: "snapbutton", title: "Metal snap button", compare: null,
    about: "A metal snap cut in half from the side: the ball stud on the top cloth goes into the socket on the bottom cloth. The socket's spring ring (its two wire ends seen in the cut, and as a ring from above) spreads as the ball pushes past, then closes back over it with a click. close=0 apart, about 0.84 ring widest, 1 snapped. Parts: stud, socket, ring.",
    line: "snapbutton cx cy k=0.2..1.5 close=0..1 c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "snapbutton 480 270 0.95 close=0", script: [{ set: { close: 0 }, hold: 1 }, { set: { close: 0.84 }, hold: "settle" }, { set: { close: 1 }, hold: "settle" }, { set: { close: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, col = P.colorOf("denim", o.c);
      P.seed(91);
      const g = P.base(parent, cx, cy, k), root = P.el("g", { transform: "translate(-60 10)" }, g);
      const cloth = (par, y0, y1) => { const d = `M-220 ${y0} H220 V${y1} H-220 Z`; P.brush("denim", par, P.clip(par, d), [-220, 220, y0, y1], col, { density: 1.4 }); P.ink(`M-220 ${y0} H220 M-220 ${y1} H220`, par, 3, false); };
      // a cut metal face: brass with a few lighter strokes along it
      const cut = (par, d, box) => { const cl = P.clip(par, d), a = P.layer(par, cl); P.el("path", { d, fill: CUT }, a.g); for (let i = 0; i < 6; i++) { const x = P.rr(box[0], box[1]), y = P.rr(box[2], box[3]); a.stroke(x - 30, y - 30, x + 30, y + 30, 5, P.pick([P.lt(CUT, 0.4), P.dk(CUT, 0.12)]), 0.6); } a.done(); P.el("path", { d, fill: "none", stroke: P.INK, "stroke-width": 3, "stroke-linejoin": "round" }, par); };
      // socket, fixed, on the bottom cloth: a cup with an inward lip; the wire ends sit in grooves under the lip
      const socket = P.el("g", { "data-name": "socket" }, root);
      cloth(socket, 132, 162);
      P.el("path", { d: "M-52 20 H52 V124 H-52 Z", fill: "#5a4a2c" }, socket);   // the dark hollow inside
      cut(socket, "M-92 120 H-52 V36 H-42 V20 H-66 V120 Z M92 120 H52 V36 H42 V20 H66 V120 Z", [-92, 92, 20, 132]);
      cut(socket, "M-92 120 H92 V132 H-92 Z", [-92, 92, 120, 132]);
      // stud, moving, on the top cloth: cap above the cloth, flange under it, neck, ball
      const stud = P.el("g", { "data-name": "stud" }, root);
      cloth(stud, -30, 0);
      cut(stud, "M-70 -30 Q-66 -62 0 -66 Q66 -62 70 -30 Z", [-70, 70, -66, -30]);
      cut(stud, "M-70 0 H70 V10 H-70 Z", [-70, 70, 0, 10]);
      cut(stud, `M-16 10 H16 V46 A${R} ${R} 0 1 1 -16 46 Z`, [-34, 34, 10, 110]);
      P.el("path", { d: "M-14 64 Q-22 74 -16 90", stroke: "#fff3cf", "stroke-width": 4, "stroke-linecap": "round", ...F }, stud);
      // spring ring: two wire ends in the cut, and the ring from above
      const ring = P.el("g", { "data-name": "ring" }, root);
      const wl = P.el("circle", { r: RW, cy: WY, fill: WIRE, stroke: P.INK, "stroke-width": 2.6 }, ring), wr = P.el("circle", { r: RW, cy: WY, fill: WIRE, stroke: P.INK, "stroke-width": 2.6 }, ring);
      const top = P.el("g", { transform: "translate(250 -120)" }, ring);
      P.el("ellipse", { rx: 90, ry: 38, fill: CUT, stroke: P.INK, "stroke-width": 3 }, top);
      P.el("ellipse", { rx: 58, ry: 24, fill: "#5a4a2c" }, top);
      const loopO = P.el("ellipse", { fill: "none", stroke: P.INK, "stroke-width": 10 }, top), loop = P.el("ellipse", { fill: "none", stroke: WIRE, "stroke-width": 6 }, top);
      P.el("path", { d: "M-6 -26 L6 -20", stroke: "#5a4a2c", "stroke-width": 7, ...F }, top);   // the ring's open end
      P.ink("M190 -86 L60 44", root, 2.4);   // from the top view to the cut wire
      const click = P.el("path", { d: "M-110 46 L-132 36 M-112 60 L-138 62 M110 46 L132 36 M112 60 L138 62", stroke: "#d9862b", "stroke-width": 4, "stroke-linecap": "round", opacity: 0, ...F }, root);
      const st = { close: ISO.clamp(+o.close || 0, 0, 1) }; let c = st.close;
      const draw = () => {
        const by = B0 + (B1 - B0) * c, dy = by - WY;
        const s = Math.abs(dy) < R ? Math.max(S0, Math.sqrt(R * R - dy * dy) + RW) : S0;
        stud.setAttribute("transform", `translate(0 ${(by - 76).toFixed(1)})`);   // the ball's centre is 76 below the stud's cloth
        wl.setAttribute("cx", (-s).toFixed(1)); wr.setAttribute("cx", s.toFixed(1));
        const rx = (s * 1.75).toFixed(1), ry = (s * 0.75).toFixed(1);
        for (const e of [loopO, loop]) { e.setAttribute("rx", rx); e.setAttribute("ry", ry); }
        click.setAttribute("opacity", ISO.smooth(0.9, 1, c).toFixed(2));
      };
      draw();
      g.set = (q) => { if (q.close !== undefined) st.close = ISO.clamp(+q.close || 0, 0, 1); };
      g.update = (dt) => { const was = c; c = ISO.still() ? st.close : ISO.follow(c, st.close, dt, 0.45); if (Math.abs(c - st.close) < 0.002) c = st.close; if (c !== was) draw(); return c !== st.close; };
      g.readout = () => { const by = B0 + (B1 - B0) * st.close; return by > WY + 20 ? "snapped: the spring ring holds the ball" : Math.abs(by - WY) < R + RW ? "ring spreading as the ball pushes through" : "snap open"; };
      return g;
    },
  });
})();
