// "shippaint cx cy k run=0|1" — a painted container ship from the side on a painted sea: hull, stacked containers,
// bridge and funnel. run=1 sails it: the sea streams past, the hull rocks a little, foam at the bow and stern, smoke.
(() => {
  const free = { class: "free", "data-free": "1" };
  const HULL = "M-350 -32 L346 -32 L398 -58 L384 10 Q372 62 330 78 L-326 78 Q-352 40 -350 -32 Z";
  const BRIDGE = "M-334 -168 L-252 -168 L-252 -32 L-334 -32 Z", WING = "M-346 -150 L-240 -150 L-240 -136 L-346 -136 Z";
  const FUN = "M-318 -232 L-282 -232 L-276 -170 L-322 -170 Z", SEA = "M-460 46 L460 46 L460 150 L-460 150 Z";
  const BOX = ["#a8562c", "#1f6f6a", "#28507f", "#c6952f", "#9d3a56", "#7f9a8c", "#a33b36", "#6b7239"];
  const STACKS = [3, 3, 2, 3, 3, 2, 3, 2, 2];
  ISO.add({
    name: "shippaint", title: "Container ship", compare: null,
    about: "A container ship painted from the side on the sea: hull, stacked containers, bridge and funnel. run=1 sails it, with the sea streaming past, foam at bow and stern and smoke from the funnel; run=0 it lies still. Parts: hull containers bridge funnel sea.",
    line: "shippaint cx cy k=0.2..1.5 run=0|1",
    demo: { line: "shippaint 480 280 0.62 run=0", script: [{ set: {}, hold: 1 }, { set: { run: 1 }, hold: 4 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(17);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const ship = P.el("g", {}, g);
      const smoke = P.el("g", { opacity: 0 }, ship), sm = P.layer(smoke);
      for (const [x, y, r] of [[-300, -252, 18], [-322, -282, 24], [-354, -306, 30], [-394, -322, 34]]) { sm.dab(x, y, r, "#a9a59d", 0.55); sm.dab(x + 4, y - 4, r * 0.6, "#d6d2ca", 0.7); } sm.done();
      const fun = P.el("g", { "data-name": "funnel" }, ship);
      fill(fun, FUN, [-322, -276, -232, -170], "#c6952f"); fill(fun, "M-318 -232 L-282 -232 L-281 -218 L-319 -218 Z", [-320, -280, -232, -218], "#23252b"); P.ink(FUN, fun, 3.2);
      const brg = P.el("g", { "data-name": "bridge" }, ship);
      fill(brg, BRIDGE, [-334, -252, -168, -32], "#eef0ee", "cotton"); fill(brg, WING, [-346, -240, -150, -136], "#d7dadb");
      const wl = P.layer(brg); for (let x = -326; x < -258; x += 17) wl.stroke(x, -126, x + 10, -126, 13, "#28507f", 0.9); for (const y of [-96, -66]) for (let x = -324; x < -258; x += 22) wl.stroke(x, y, x + 9, y, 8, "#55657a", 0.75); wl.done();
      P.ink(BRIDGE + WING, brg, 3.2);
      const box = P.el("g", { "data-name": "containers" }, ship); let ci = 0;
      STACKS.forEach((n, i) => { const x = -236 + i * 62; for (let j = 0; j < n; j++) { const y = -32 - (j + 1) * 40, d = `M${x} ${y} L${x + 60} ${y} L${x + 60} ${y + 40} L${x} ${y + 40} Z`, col = BOX[(ci++ * 3 + i) % BOX.length];
        fill(box, d, [x, x + 60, y, y + 40], col); let r = ""; for (let u = x + 8; u < x + 56; u += 8) r += `M${u} ${y + 5}L${u} ${y + 35}`;
        P.el("path", { d: r, stroke: P.dk(col, 0.3), "stroke-width": 2.2, fill: "none", ...free }, box); P.ink(d, box, 2.6, false); } });
      const hull = P.el("g", { "data-name": "hull" }, ship);
      fill(hull, HULL, [-352, 398, -58, 78], "#23395b");
      const hl = P.layer(hull, P.clip(hull, HULL)); hl.stroke(-360, 50, 400, 44, 30, "#a33b36", 0.95); hl.stroke(-360, -24, 400, -26, 7, "#e4d8bf", 0.8); hl.done();
      P.ink(HULL + "M360 -50 L360 -110 L374 -110", hull, 3.6);
      // sea: a painted band on top of the hull's lower part; its streaks are one repeating tile that slides by
      const sea = P.el("g", { "data-name": "sea" }, g), scl = P.clip(sea, SEA);
      fill(sea, SEA, [-460, 460, 46, 150], "#2f6b8f");
      const flow = P.el("g", { "clip-path": `url(#${scl})` }, sea), tile = P.el("g", {}, flow), TL = 120;
      for (let c = -5; c <= 5; c++) { P.seed(77); const l = P.layer(tile); l.stroke(c * TL, 66, c * TL + 54, 64, 7, "#cfe2ea", 0.55, -3); l.stroke(c * TL + 60, 98, c * TL + 100, 97, 6, "#1f5170", 0.6, 2); l.stroke(c * TL + 20, 128, c * TL + 70, 127, 6, "#cfe2ea", 0.4); l.done(); }
      const foam = P.el("g", { opacity: 0 }, sea), fl = P.layer(foam);
      for (let i = 0; i < 10; i++) fl.dab(P.rr(370, 420), P.rr(40, 64), P.rr(7, 13), "#f2f6f6", 0.9);
      for (let i = 0; i < 16; i++) fl.dab(P.rr(-460, -330), P.rr(46, 70), P.rr(6, 14), "#f2f6f6", 0.85); fl.done();
      P.el("path", { d: "M-460 46 Q-430 38 -400 46 T-340 46 T-280 46 T-220 46 T-160 46 T-100 46 T-40 46 T20 46 T80 46 T140 46 T200 46 T260 46 T320 46 T380 46 T440 46 L460 46", fill: "none", stroke: P.INK, "stroke-width": 3, opacity: 0.8, ...free }, sea);
      const st = { run: o.run === "1" || o.run === 1 }; let a = st.run ? 1 : 0, ph = 0, clock = 0;
      const paint = () => { foam.setAttribute("opacity", a.toFixed(3)); smoke.setAttribute("opacity", a.toFixed(3)); tile.setAttribute("transform", `translate(${(-ph).toFixed(1)} 0)`);
        ship.setAttribute("transform", `translate(0 ${(Math.sin(clock * 1.7) * 3 * a).toFixed(2)}) rotate(${(Math.sin(clock * 1.1) * 0.6 * a).toFixed(2)})`); };
      paint();
      g.set = (p) => { if (p.run !== undefined) st.run = p.run === "1" || p.run === 1; };
      g.update = (dt) => {
        const T = st.run ? 1 : 0;
        if (ISO.still()) { a = T; paint(); return false; }
        a = ISO.follow(a, T, dt, 0.6); if (Math.abs(a - T) < 0.003) a = T;
        ph = (ph + dt * 70 * a) % TL; clock += dt; paint(); return st.run || a !== T;
      };
      g.readout = () => (st.run ? "ship sailing" : "ship lying still");
      return g;
    },
  });
})();
