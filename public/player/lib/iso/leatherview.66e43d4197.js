// "leatherview cx cy k kind=real|vegan" — a small block of leather cut open. real: a grain surface with tiny pores over a
// thick mat of tangled fiber bundles. vegan: a smooth plastic coating stamped with a pretend grain, glued onto a woven
// cloth backing. Still.
(() => {
  const X0 = -330, X1 = 330, DX = 70, DY = -60, TOP = -110;
  const free = { class: "free", "data-free": "1" };
  ISO.add({
    name: "leatherview", title: "Leather cut open", compare: null,
    about: "A small block of leather cut open to show what is inside. kind=real: the grain surface with tiny pores (part grain) over a thick mat of tangled fiber bundles (part fibers). kind=vegan: a smooth plastic coating stamped with a pretend grain (part coating), glued onto a woven cloth backing (part backing). No animal is shown.",
    line: "leatherview cx cy k=0.2..1.5 kind=real|vegan",
    demo: { line: "leatherview 480 280 0.62 kind=real", script: [{ set: {}, hold: 1 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, vegan = o.kind === "vegan";
      P.seed(vegan ? 91 : 83);
      const g = P.base(parent, cx, cy, k), B = vegan ? 40 : 150;
      const topD = `M${X0} ${TOP}L${X0 + DX} ${TOP + DY}L${X1 + DX} ${TOP + DY}L${X1} ${TOP}Z`, sideD = `M${X1} ${TOP}L${X1 + DX} ${TOP + DY}L${X1 + DX} ${B + DY}L${X1} ${B}Z`, frontD = `M${X0} ${TOP}H${X1}V${B}H${X0}Z`;
      const lines = P.el("g", {}, g);
      if (!vegan) {
        const col = "#8a5432";
        // top: grain surface with pores and fine creases
        const tg = P.el("g", { "data-name": "grain" }, g), tc = P.clip(tg, topD), tl = P.layer(tg, tc);
        tl.stroke(X0, TOP - 30, X1 + DX, TOP - 30, 90, P.lt(col, 0.08));
        for (let i = 0; i < 40; i++) { const x = P.rr(X0, X1 + DX), y = P.rr(TOP + DY, TOP); tl.stroke(x, y, x + P.rr(20, 60), y + P.rr(-6, 6), P.rr(3, 6), P.pick([P.dk(col, 0.12), P.lt(col, 0.18)]), 0.6, P.rr(-4, 4)); }
        for (let i = 0; i < 160; i++) { const y = P.rr(TOP + DY + 4, TOP - 4), x = P.rr(X0 + 6, X1) + (TOP - y) * (DX / -DY); tl.dab(x, y, P.rr(1.3, 2.4), P.dk(col, 0.5), 0.85); }
        tl.done();
        // front: a dense grain layer, then tangled bundles getting looser toward the bottom
        const fc = P.clip(g, frontD), fg = P.el("g", { "data-name": "fibers" }, g), base = P.layer(fg, fc), a = P.layer(fg, fc), b = P.layer(fg, fc), c = P.layer(fg, fc);
        base.stroke(X0 - 20, 20, X1 + 20, 20, 300, P.dk(col, 0.28));
        base.stroke(X0 - 20, TOP + 18, X1 + 20, TOP + 18, 40, P.lt(col, 0.05));
        for (let i = 0; i < 70; i++) { const x = P.rr(X0, X1), y = P.rr(TOP + 4, TOP + 34); a.stroke(x - 40, y, x + 40, y + P.rr(-4, 4), P.rr(5, 9), P.pick([col, P.lt(col, 0.12), P.dk(col, 0.1)]), 0.9, P.rr(-4, 4)); }
        for (let i = 0; i < 150; i++) { const y = P.rr(TOP + 40, B), loose = (y - TOP) / (B - TOP), x = P.rr(X0 - 20, X1 + 20), ang = P.rr(-0.9, 0.9) + (i % 2 ? 0 : Math.PI / 2) * P.rr(0.4, 1), l = P.rr(60, 130);
          (i % 3 ? a : b).stroke(x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l, P.rr(9, 16) * (1 - loose * 0.3), P.pick([col, P.lt(col, 0.1), P.dk(col, 0.08), "#9a6440"]), 0.95, P.rr(-26, 26)); }
        for (let i = 0; i < 90; i++) { const y = P.rr(TOP + 40, B), x = P.rr(X0, X1), ang = P.rr(0, 6.28), l = P.rr(40, 80); c.stroke(x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l, 2.4, P.lt(col, 0.35), 0.6, P.rr(-14, 14)); }
        base.done(); a.done(); b.done(); c.done();
        // fuzzy underside
        P.el("path", { d: Array.from({ length: 60 }, (_, i) => { const x = X0 + 6 + i * 11 + P.rr(-3, 3); return `M${x} ${B}q${P.rr(-6, 6).toFixed(1)} 8 ${P.rr(-8, 8).toFixed(1)} ${P.rr(10, 18).toFixed(1)}`; }).join(""), fill: "none", stroke: P.lt(col, 0.2), "stroke-width": 2.6, "stroke-linecap": "round", ...free }, g);
        const sc = P.clip(g, sideD), sl = P.layer(g, sc); sl.stroke(X1, 20, X1 + DX, 20, 400, P.dk(col, 0.42)); for (let i = 0; i < 30; i++) { const y = P.rr(TOP + DY, B); sl.stroke(X1, y, X1 + DX, y - 40, P.rr(5, 10), P.dk(col, 0.3), 0.8, P.rr(-6, 6)); } sl.done();
        P.ink(`M${X0} ${TOP + 38}H${X1}`, lines, 2.2, false);
        P.el("path", { d: `M${X0 + 12} ${TOP + 38}H${X1 - 12}`, stroke: P.lt(col, 0.5), "stroke-width": 2, opacity: 0.6, ...free }, g);
        g.anchors = { grain: [0, TOP + DY / 2], fibers: [0, 40] };
      } else {
        const col = "#3f3a44";
        // top: a glossy coating stamped with a regular pretend grain
        const tg = P.el("g", { "data-name": "coating" }, g), tc = P.clip(tg, topD), tl = P.layer(tg, tc);
        tl.stroke(X0, TOP - 30, X1 + DX, TOP - 30, 90, P.lt(col, 0.1));
        for (let r = 0; r < 6; r++) for (let q = 0; q < 26; q++) { const y = TOP + DY + 6 + r * 9.5, x = X0 + 14 + q * 26 + (r % 2 ? 13 : 0) + (TOP - y) * (DX / -DY); tl.dab(x, y, 3.2, P.dk(col, 0.35), 0.6); }
        tl.stroke(X0 + 120, TOP - 26, X1 - 60, TOP - 38, 14, P.lt(col, 0.6), 0.5);
        tl.done();
        // front: coating, glue line, woven backing
        const fc = P.clip(g, frontD), cg = P.el("g", {}, g), cl = P.layer(cg, fc);
        cl.stroke(X0 - 20, TOP + 24, X1 + 20, TOP + 24, 52, col); cl.stroke(X0 - 20, TOP + 12, X1 + 20, TOP + 12, 8, P.lt(col, 0.35), 0.7); cl.done();
        P.el("rect", { x: X0, y: TOP + 50, width: X1 - X0, height: 10, fill: "#e8dfb8" }, cg);
        const bg = P.el("g", { "data-name": "backing" }, g), y0 = (TOP + 60 + B) / 2, pitch = 44, wc = "#ece5d6";
        P.el("rect", { x: X0, y: TOP + 60, width: X1 - X0, height: B - TOP - 60, fill: "#cfc6b4", "clip-path": `url(#${fc})` }, bg);
        let wave = `M${X0 - pitch} ${y0}`; for (let x = X0; x <= X1 + pitch; x += pitch) wave += `Q${x - pitch / 2} ${y0 + (((x - X0) / pitch) % 2 ? -18 : 18)} ${x} ${y0}`;
        P.el("path", { d: wave, fill: "none", stroke: P.dk(wc, 0.18), "stroke-width": 14, "clip-path": `url(#${fc})`, ...free }, bg);
        let el = ""; const bl = P.layer(bg, fc);
        for (let x = X0 + pitch / 2, i = 0; x < X1 + pitch; x += pitch, i++) { const y = y0 + (i % 2 ? 10 : -10); el += `M${x - 18} ${y}A18 11 0 1 0 ${x + 18} ${y}A18 11 0 1 0 ${x - 18} ${y}Z`; for (let j = 0; j < 6; j++) bl.dab(x + P.rr(-11, 11), y + P.rr(-6, 6), 3, P.dk(wc, 0.15), 0.8); }
        P.el("path", { d: el, fill: wc, "clip-path": `url(#${fc})` }, bg); bl.done(); bg.appendChild(bl.g);
        P.el("path", { d: el, fill: "none", stroke: P.INK, "stroke-width": 1.8, "clip-path": `url(#${fc})`, ...free }, bg);
        const sc = P.clip(g, sideD), sl = P.layer(g, sc); sl.stroke(X1, 0, X1 + DX, 0, 400, P.dk("#cfc6b4", 0.3)); sl.stroke(X1, TOP, X1 + DX, TOP + DY + 50, 120, P.dk(col, 0.3)); sl.stroke(X1, B - 20, X1 + DX, B + DY - 20, 80, P.dk(wc, 0.35)); sl.done();
        P.ink(`M${X0} ${TOP + 50}H${X1}M${X0} ${TOP + 60}H${X1}`, lines, 2.2, false);
        g.anchors = { coating: [0, TOP + 24], backing: [0, y0] };
      }
      g.appendChild(lines);
      P.ink(topD + sideD + frontD, lines, 3.6);
      g.readout = () => (vegan ? "vegan leather: plastic coating on a cloth backing" : "real leather: grain surface over tangled fibers");
      return g;
    },
  });
})();
