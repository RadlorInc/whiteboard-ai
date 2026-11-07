// "fiberview cx cy k kind=… dyed=… wet=0..1 felted=0..1 chewed=0|1 tips=0|1 press=0..1" — one fiber seen through a
// round lens, its cut end turned toward us. Each kind keeps its true shape: cotton a flat twisted ribbon, linen straight
// with nodes, wool crimped with scales, cashmere finer with smoother scales, silk a smooth glassy strand, polyester an
// even rod, rayon a rod with lengthwise grooves. dyed= cuts a whole thread to show where the dye sits; tips=1 shows
// thick stiff tips against fine bending ones under a pressing plate.
(() => {
  const R = 300, BG = "#c6d6dd", KINDS = ["cotton", "linen", "wool", "cashmere", "silk", "polyester", "rayon"];
  const COL = { cotton: "#f2ede0", linen: "#cdb98f", wool: "#ead9b8", cashmere: "#d9c2a2", silk: "#f6eedb", polyester: "#e9eef2", rayon: "#efe8dc" };
  const free = { class: "free", "data-free": "1" }, f1 = (v) => v.toFixed(1);
  const frac = (v) => v - Math.floor(v);
  // centre line c(x) and half width w(x) per kind; scale spacing S
  const SPEC = {
    cotton: { c: (x) => 6 * Math.sin(x / 90), w: (x) => 42 * (0.32 + 0.68 * Math.abs(Math.cos((Math.PI * x) / 120))) },
    linen: { c: (x) => 2 * Math.sin(x / 140), w: (x) => { let n = 0; for (let k = -4; k <= 4; k++) n += Math.exp(-(((x - k * 130 - 20) / 9) ** 2)); return 32 + 6 * n; } },
    wool: { c: (x) => 26 * Math.sin((x * 2 * Math.PI) / 200), w: (x) => 38 + 5 * frac(x / 26), S: 26 },
    cashmere: { c: (x) => 14 * Math.sin((x * 2 * Math.PI) / 170), w: (x) => 23 + 2 * frac(x / 42), S: 42 },
    silk: { c: (x) => 4 * Math.sin(x / 150), w: () => 25 },
    polyester: { c: () => 0, w: () => 30 },
    rayon: { c: (x) => 3 * Math.sin(x / 100), w: () => 32 },
  };
  const pl = (A) => A.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
  const band = (s, x0, x1, a, b) => { const T = [], B = []; for (let x = x0; x <= x1 + 0.1; x += 6) { const c = s.c(x), w = s.w(x); T.push([x, c + w * a]); B.push([x, c + w * b]); } return "M" + pl(T) + "L" + pl(B.reverse()) + "Z"; };
  const edge = (s, x0, x1, a) => { const T = []; for (let x = x0; x <= x1 + 0.1; x += 6) T.push([x, s.c(x) + s.w(x) * a]); return "M" + pl(T); };
  // the cut face of one fiber, size s (its half height), centred on 0 0
  const face = (kind, s) => {
    const ring = (n, f) => { const p = []; for (let i = 0; i < n; i++) { const t = (i / n) * 2 * Math.PI, r = f(t); p.push([Math.sin(t) * r * 0.62, -Math.cos(t) * r]); } return "M" + pl(p) + "Z"; };
    if (kind === "cotton") return `M0 ${-s}C${s * 0.75} ${-s} ${s * 0.75} ${s} 0 ${s}C${-s * 0.6} ${s} ${-s * 0.15} ${s * 0.3} ${-s * 0.15} 0C${-s * 0.15} ${-s * 0.3} ${-s * 0.6} ${-s} 0 ${-s}Z`;
    if (kind === "linen") return ring(6, (t) => s * (0.9 + 0.12 * Math.sin(t * 3 + 1)));
    if (kind === "silk") { const p = [0, 1, 2].map((i) => [Math.sin((i * 2 * Math.PI) / 3) * s * 0.7, -Math.cos((i * 2 * Math.PI) / 3) * s * 1.05]), m = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      return "M" + [0, 1, 2].map((i) => { const a = p[i], b = p[(i + 1) % 3], c = p[(i + 2) % 3], u = m(a, c, 0.2), v = m(a, b, 0.2); return `${u[0].toFixed(1)} ${u[1].toFixed(1)}Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${v[0].toFixed(1)} ${v[1].toFixed(1)}`; }).join("L") + "Z"; }
    if (kind === "rayon") return ring(40, (t) => s * (0.93 + 0.07 * Math.cos(14 * t)));
    return ring(28, () => s);
  };

  // one fiber lying from x0 to x1, its cut face at x1; returns the outline for wet drops and bites
  function fiber(parent, kind, x0, x1, P, faint, cap = true) {
    const s = SPEC[kind], col = COL[kind], g = P.el("g", {}, parent), outline = band(s, x0, x1, -1, 1);
    P.el("path", { d: outline, fill: col }, g);
    if (kind === "cotton") { let d = ""; for (let m = -5; m < 5; m++) { const a = m * 120 + 60, b = a + 120; if (m % 2 === 0 && b > x0 && a < x1) d += band(s, Math.max(a, x0), Math.min(b, x1), -1, 1); } P.el("path", { d, fill: P.dk(col, 0.09) }, g); }
    P.el("path", { d: band(s, x0, x1, 0.35, 1), fill: P.dk(col, 0.16), opacity: 0.7 }, g);
    P.el("path", { d: band(s, x0, x1, -0.72, -0.4), fill: "#ffffff", opacity: kind === "silk" || kind === "polyester" ? 0.85 : 0.45 }, g);
    if (kind === "silk" || kind === "polyester") P.el("path", { d: band(s, x0 + 20, x1 - 30, -0.6, -0.5), fill: "#ffffff" }, g);
    let lines = "";
    if (s.S) for (let x = Math.ceil(x0 / s.S) * s.S; x < x1 - 6; x += s.S) { const c = s.c(x), w = s.w(x - 0.5); lines += `M${x} ${(c - w).toFixed(1)}Q${x + w * 0.35} ${c.toFixed(1)} ${x} ${(c + w).toFixed(1)}`; }
    if (kind === "linen") for (let k = -4; k <= 4; k++) { const n = k * 130 + 20; if (n > x0 + 10 && n < x1 - 10) lines += `M${n - 9} ${s.c(n) - 30}L${n + 7} ${s.c(n) + 30}M${n + 9} ${s.c(n) - 30}L${n - 5} ${s.c(n) + 30}`; }
    if (kind === "cotton") for (let m = -5; m < 5; m++) { const a = m * 120 + 60; if (a > x0 + 10 && a < x1 - 10) lines += `M${a - 12} ${s.c(a) - 20}L${a + 12} ${s.c(a) + 20}`; }
    if (kind === "rayon") lines += [-0.5, -0.05, 0.4].map((a) => edge(s, x0, x1 - 4, a)).join("");
    if (lines) P.el("path", { d: lines, fill: "none", stroke: P.INK, "stroke-width": kind === "cashmere" ? 1.6 : 2.2, opacity: kind === "cashmere" ? 0.45 : 0.75, "stroke-linecap": "round", ...free }, g);
    if (kind === "rayon") P.el("path", { d: [-0.42, 0.03, 0.48].map((a) => edge(s, x0, x1 - 4, a)).join(""), fill: "none", stroke: "#ffffff", "stroke-width": 2, opacity: 0.7, ...free }, g);
    if (faint) P.el("path", { d: outline, fill: "none", stroke: P.INK, "stroke-width": 2, ...free }, g);
    else P.ink(edge(s, x0, x1, -1) + edge(s, x0, x1, 1), g, 3);
    if (!cap) return { s, x0, x1, outline };
    const c = s.c(x1), w = s.w(x1), f = P.el("g", { transform: `translate(${x1} ${c.toFixed(1)})` }, g);
    P.el("path", { d: face(kind, w * 1.04), fill: P.lt(col, 0.35), stroke: P.INK, "stroke-width": faint ? 2 : 3 }, f);
    if (kind === "cotton") P.el("path", { d: `M${-w * 0.02} ${-w * 0.5}Q${w * 0.22} 0 ${-w * 0.02} ${w * 0.5}`, fill: "none", stroke: P.INK, "stroke-width": 2, ...free }, f);
    if (kind === "linen") P.el("circle", { r: 4, fill: P.dk(col, 0.4) }, f);
    return { s, x0, x1, outline };
  }

  ISO.add({
    name: "fiberview", title: "One fiber close up", compare: null,
    about: "One fiber in a round lens, cut end toward us: cotton (flat twisted ribbon), linen (straight with nodes), wool (crimped, overlapping scales), cashmere (finer, smoother scales), silk (smooth glassy strand, rounded-triangle end), polyester (smooth even rod), rayon (rod with lengthwise grooves). wet: water soaks in (cotton, linen, rayon), goes into the core under a water-shedding surface (wool, cashmere, silk) or only sits on top (polyester). felted locks wool scales into a tangle. chewed=1 shows bites and crumbs. dyed=outside cuts a dyed thread: color only on the outer ring, white core. tips=1: thick stiff tips (part thick) next to fine ones (part fine); press brings a flat plate down: thick ones stay straight and poke, fine ones bend.",
    line: "fiberview cx cy k=0.2..1.5 kind=cotton|linen|wool|cashmere|silk|polyester|rayon dyed=0|outside|through c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red wet=0..1 felted=0..1 chewed=0|1 tips=0|1 press=0..1",
    demo: { line: "fiberview 480 270 0.8 kind=wool", script: [{ set: { wet: 0, felted: 0 }, hold: 1 }, { set: { wet: 1 }, hold: "settle" }, { set: { wet: 0, felted: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = KINDS.includes(o.kind) ? o.kind : "cotton", dyed = ["outside", "through"].includes(o.dyed) ? o.dyed : "";
      const tips = +o.tips === 1, dye = P.COLORS[o.c] || P.COLORS.blue;
      P.seed(61 + KINDS.indexOf(kind) * 5);
      const g = P.base(parent, cx, cy, k), cid = P.clip(g, `M${-R} 0A${R} ${R} 0 1 0 ${R} 0A${R} ${R} 0 1 0 ${-R} 0Z`);
      const body = P.el("g", { "clip-path": `url(#${cid})` }, g);
      P.el("rect", { x: -R - 10, y: -R - 10, width: 2 * R + 20, height: 2 * R + 20, fill: BG }, body);
      const st = { wet: ISO.clamp(+o.wet || 0, 0, 1), felted: ISO.clamp(+o.felted || 0, 0, 1), press: ISO.clamp(+o.press || 0, 0, 1) }, now = { ...st };
      let paint = () => {};

      if (dyed) {
        // a thread cut across: its outside is dyed, the cut face shows every fiber
        const T = P.el("g", { transform: "rotate(-30)" }, body), side = P.layer(T);
        side.stroke(-520, 0, 0, 0, 380, P.dk(dye, 0.1)); for (let x = -520; x < 0; x += 46) side.stroke(x, -190, x + 60, 190, 20, P.dk(dye, 0.35), 0.6, 8); for (let x = -500; x < 0; x += 46) side.stroke(x + 14, -170, x + 64, 160, 6, P.lt(dye, 0.3), 0.5, 6);
        side.done(); P.ink("M-520 -190L0 -190M-520 190L0 190", T, 3.4);
        const F = P.el("g", { "data-name": "cut" }, T);
        P.el("ellipse", { rx: 118, ry: 190, fill: "#cfc3ab", stroke: P.INK, "stroke-width": 3.4 }, F);
        let core = "", outer = "";
        for (let y = -168; y <= 168; y += 28) for (let x = -104; x <= 104; x += 26) { const xx = x + (Math.round(y / 28) % 2 ? 13 : 0), q = (xx / 106) ** 2 + (y / 176) ** 2; if (q > 1) continue;
          const d = `<path transform="translate(${xx} ${y}) rotate(${Math.round(P.rr(0, 360))}) scale(0.95)" d="${face(kind, 14)}"/>`; if (dyed === "through" || q > 0.4) outer += d; else core += d; }
        const add = (html, fill) => { const e = P.el("g", { fill, stroke: P.INK, "stroke-width": 1.6 }, F); e.innerHTML = html; };
        add(core, "#fbf8f0"); add(outer, dye);
        g.anchors = { cut: [0, 0] };
        g.readout = () => `${kind} thread cut across, dyed ${dyed === "outside" ? "only on the outside" : "all the way through"}`;
      } else if (tips) {
        // thick stiff tips (left) and fine ones (right) standing out of a knit, a flat plate coming down on them
        const knit = P.clip(body, `M${-R} 110 Q-150 90 0 112 Q150 92 ${R} 110 V${R} H${-R} Z`);
        P.brush("wool", body, knit, [-R, R, 100, R], "#c9a77a", { density: 0.8 });
        P.ink(`M${-R} 110 Q-150 90 0 112 Q150 92 ${R} 110`, body, 3.4);
        const thick = P.el("g", { "data-name": "thick" }, body), tl = P.layer(thick); let td = "";
        for (const x of [-230, -170, -105, -50]) { tl.thread(x, 110, x + 4, -112, 26, "#e2c79a"); tl.stroke(x - 5, 100, x - 3, -100, 6, "#fff4dc", 0.6); td += `M${x - 13} 108L${x - 9} -112M${x + 13} 108L${x + 17} -112`; }
        tl.done(); P.ink(td, thick, 2.8, false);
        const fine = P.el("g", { "data-name": "fine" }, body), fineInk = P.el("path", { fill: "none", stroke: P.INK, "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, fine), fineCol = P.el("path", { fill: "none", stroke: "#f0dfc4", "stroke-width": 6.5, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, fine);
        const FX = [30, 62, 94, 126, 158, 190, 222, 254].map((x) => [x + P.rr(-5, 5), -192 - P.rr(0, 30)]);
        const plate = P.el("g", { "data-name": "plate" }, body);
        P.el("rect", { x: -R, y: -420, width: 2 * R, height: 190, fill: "#9fb6c4", opacity: 0.8 }, plate);
        P.ink(`M${-R} -230 H${R}`, plate, 3.4); P.el("path", { d: `M${-R} -244H${R}`, stroke: "#ffffff", "stroke-width": 5, opacity: 0.5, ...free }, plate);
        const poke = P.el("path", { d: [-230, -170, -105, -50].map((x) => `M${x - 18} -126L${x - 4} -140M${x + 18} -126L${x + 4} -140M${x} -122L${x} -144`).join(""), fill: "none", stroke: P.INK, "stroke-width": 2.6, "stroke-linecap": "round", ...free }, body);
        paint = () => {
          const dy = now.press * 116, bottom = -230 + dy; plate.setAttribute("transform", `translate(0 ${dy.toFixed(1)})`); poke.setAttribute("opacity", ISO.clamp((now.press - 0.85) * 7, 0, 1).toFixed(2));
          let d = ""; for (const [x, top] of FX) { if (bottom <= top) { d += `M${x} 110L${x} ${top.toFixed(1)}`; continue; }
            const over = bottom - top, h = Math.min(22, over), b = bottom + 8, L = Math.min(over * 0.9, 70); d += `M${x} 110L${x} ${f1(b + h)}Q${x} ${f1(b)} ${f1(x + h)} ${f1(b)}L${f1(x + h + L)} ${f1(b + 2)}`; }
          fineInk.setAttribute("d", d); fineCol.setAttribute("d", d);
        };
        g.readout = () => `thick fibers stay straight, fine fibers bend; plate ${Math.round(st.press * 100)}% down`;
      } else {
        // faint fibers behind, the main fiber, then its states on top
        for (const [y, r] of [[-185, 8], [190, -6]]) fiber(P.el("g", { transform: `translate(0 ${y}) rotate(${r}) scale(0.62)`, opacity: 0.32 }, body), kind, -620, 620, P, true);
        const main = P.el("g", { transform: "translate(-30 0) rotate(-9) scale(1.2)", "data-name": "fiber" }, body), F = fiber(main, kind, -420, 190, P), s = F.s;
        if (+o.chewed === 1) {
          const bites = P.el("g", { "data-name": "bites" }, main), fc = P.clip(main, F.outline), B = [[-170, -1, 34], [-50, 1, 28], [80, -1, 26], [-250, 1, 24]];
          for (const [x, side, r] of B) P.el("circle", { cx: x, cy: s.c(x) + side * (s.w(x) + r * 0.35), r, fill: BG }, bites);
          P.el("path", { d: B.map(([x, side, r]) => { const y = s.c(x) + side * (s.w(x) + r * 0.35); return `M${x - r} ${y}A${r} ${r} 0 1 0 ${x + r} ${y}A${r} ${r} 0 1 0 ${x - r} ${y}`; }).join(""), fill: "none", stroke: P.INK, "stroke-width": 2.8, "clip-path": `url(#${fc})`, ...free }, bites);
          const cr = P.layer(bites); for (let i = 0; i < 16; i++) { const x = P.rr(-300, 100); cr.dab(x, s.c(x) + s.w(x) + P.rr(20, 90), P.rr(4, 8), P.pick([COL[kind], P.dk(COL[kind], 0.2)])); } cr.done();
        }
        const wet = P.el("g", { opacity: 0, "data-name": "water" }, main), W = "#4d8fc4";
        const soaks = ["cotton", "linen", "rayon"].includes(kind), beads = ["wool", "cashmere", "polyester"].includes(kind);
        if (soaks) { P.el("path", { d: F.outline, fill: W, opacity: 0.42 }, wet); P.el("path", { d: band(s, -420, 190, -0.25, 0.25), fill: W, opacity: 0.3 }, wet); }
        else if (kind !== "polyester") P.el("path", { d: band(s, -420, 190, -0.32, 0.32), fill: W, opacity: 0.5 }, wet);
        if (beads || kind === "silk") { const dl = P.layer(wet), hi = P.layer(wet); let d = "";
          for (const x of kind === "silk" ? [-200] : [-300, -170, -40, 90]) { const r = kind === "polyester" ? 20 : 15, y = s.c(x) - s.w(x) - r * 0.8; dl.dab(x, y, r, "#9cc8e6", 0.95); hi.dab(x - r * 0.35, y - r * 0.35, r * 0.28, "#ffffff", 0.9); d += `M${x - r} ${y}A${r} ${r} 0 1 1 ${x + r} ${y}A${r} ${r} 0 1 1 ${x - r} ${y}`; }
          dl.done(); hi.done(); P.el("path", { d, fill: "none", stroke: P.INK, "stroke-width": 2.2, ...free }, wet); }
        // felted: five wool fibers crossing, their scales caught on each other
        const felt = P.el("g", { opacity: 0, "data-name": "felt" }, body);
        for (const [x, y, r] of [[0, -40, -14], [10, 30, 22], [-20, 0, 64], [30, 10, -52], [-10, 50, 4]]) fiber(P.el("g", { transform: `translate(${x} ${y}) rotate(${r}) scale(0.8)` }, felt), "wool", -440, 440, P, false, false);
        P.el("path", { d: [[-40, -30], [40, 20], [-10, 60], [60, -60], [-90, 40], [10, -10]].map(([x, y]) => `M${x - 8} ${y - 8}l8 8l-4 10M${x + 4} ${y - 10}l-4 10`).join(""), fill: "none", stroke: P.INK, "stroke-width": 2.6, "stroke-linecap": "round", ...free }, felt);
        paint = () => { wet.setAttribute("opacity", now.wet.toFixed(3)); felt.setAttribute("opacity", now.felted.toFixed(3)); main.setAttribute("opacity", (1 - now.felted).toFixed(3)); };
        g.anchors = { fiber: [0, 0] };
        g.readout = () => `${kind} fiber${st.wet ? ", wet " + st.wet.toFixed(1) : ""}${st.felted ? ", felted " + st.felted.toFixed(1) : ""}${+o.chewed === 1 ? ", chewed" : ""}`;
      }
      const ring = P.el("g", {}, g);
      P.el("circle", { r: R + 2, fill: "none", stroke: "#6d4a2c", "stroke-width": 18 }, ring);
      P.el("circle", { r: R + 2, fill: "none", stroke: "#b98f5f", "stroke-width": 5 }, ring);
      paint();
      g.set = (p) => { for (const q in st) if (p[q] !== undefined) st[q] = ISO.clamp(+p[q] || 0, 0, 1); };
      g.update = (dt) => { let on = false; for (const q in st) { now[q] = ISO.still() ? st[q] : ISO.follow(now[q], st[q], dt, 0.3); if (Math.abs(now[q] - st[q]) < 0.004) now[q] = st[q]; else on = true; } paint(); return on; };
      return g;
    },
  });
})();
