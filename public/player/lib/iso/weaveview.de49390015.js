// "weaveview cx cy k type=… c=…" — a round close-up of cloth, thread by thread. plain, twill and satin come from one
// rule: a lengthwise thread rides over `over` crosswise threads, under the rest of `period`, each neighbour shifted by
// `step`. That rule is what draws twill's diagonal and satin's long smooth floats.
(() => {
  const P_ = 58, R = 300;
  const WOVEN = { plain: { over: 1, period: 2, step: 1, rot: -8 }, twill: { over: 2, period: 3, step: 1, rot: -24 }, satin: { over: 4, period: 5, step: 2, rot: -8 } };
  ISO.add({
    name: "weaveview", title: "Thread close-up", compare: null,
    about: "A round close-up of cloth showing its threads: plain weave, twill (denim's diagonal), satin's long floats, knit loops, corduroy ridges, velvet's standing pile, flannel's brushed fuzz. c colors the top threads; white threads run underneath.",
    line: "weaveview cx cy k=0.2..1.5 type=plain|twill|satin|knit|corduroy|velvet|flannel c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red lean=-1..1",
    demo: { line: "weaveview 480 270 0.82 type=twill c=blue", script: [{ set: {}, hold: 1 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, type = ["plain", "twill", "satin", "knit", "corduroy", "velvet", "flannel"].includes(o.type) ? o.type : "plain";
      const col = P.COLORS[o.c] || { velvet: P.COLORS.plum, corduroy: "#a8672f", flannel: P.COLORS.red, knit: P.COLORS.sage }[type] || P.COLORS.blue;
      P.seed(31);
      const g = P.base(parent, cx, cy, k), cid = "pc" + Math.floor(P.rr(1e5, 1e9)), c = P.el("clipPath", { id: cid }, g); P.el("circle", { r: R }, c);
      const body = P.el("g", {}, g);
      const under = P.layer(body, cid), a = P.layer(body, cid), b = P.layer(body, cid), c2 = P.layer(body, cid), c3 = P.layer(body, cid);
      P.el("rect", { x: -R - 20, y: -R - 20, width: 2 * R + 40, height: 2 * R + 40, fill: type === "velvet" ? "#eadfc8" : type === "corduroy" || type === "knit" ? P.dk(col, 0.3) : "#e8e0cd" }, under.g);
      const w = WOVEN[type === "flannel" ? "plain" : type];
      const rot = ((w?.rot ?? 0) * Math.PI) / 180, Rt = (x, y) => [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
      const seg = (l, f, x1, y1, x2, y2, ...r) => { const p = Rt(x1, y1), q = Rt(x2, y2); l[f](p[0], p[1], q[0], q[1], ...r); };
      if (w) {
        const weft = type === "flannel" ? P.lt(col, 0.55) : "#f2ecdd", weftS = P.dk(weft, 0.22), isOver = (q, r) => ((((r - q * w.step) % w.period) + w.period) % w.period) < w.over;
        for (let q = -9; q < 10; q++) seg(under, "stroke", q * P_, -520, q * P_, 520, P_ * 0.7, P.dk(col, 0.35));
        for (let q = -9; q < 10; q++) for (let r = -10; r < 10; r++) if (!isOver(q, r)) { const y = r * P_; seg(a, "thread", q * P_ - P_ * 0.62, y, q * P_ + P_ * 0.62, y, P_ * 0.82, P.pick([weft, P.dk(weft, 0.05)])); seg(b, "thread", q * P_ - P_ * 0.45, y + P_ * 0.25, q * P_ + P_ * 0.45, y + P_ * 0.25, 5, weftS, 0.6); }
        const tones = [col, P.lt(col, 0.07), P.dk(col, 0.12), P.lt(col, 0.13)];
        for (let q = -8; q < 9; q++) { const x = q * P_;
          for (let r = -10; r < 10; r++) { if ((((r - q * w.step) % w.period) + w.period) % w.period !== 0) continue;
            const y = r * P_ - P_ / 2, e = y + w.over * P_;
            seg(c2, "thread", x, y + P_ * 0.3, x, e - P_ * 0.3, P_ * 0.86, P.pick(tones));
            seg(c3, "thread", x - P_ * 0.2, y + P_ * 0.36, x - P_ * 0.18, e - P_ * 0.36, 6, P.lt(col, 0.4), 0.75);
            seg(c3, "thread", x + P_ * 0.26, y + P_ * 0.36, x + P_ * 0.26, e - P_ * 0.36, 7, P.dk(col, 0.4), 0.55); } }
        if (type === "flannel") for (let i = 0; i < 300; i++) { const x = P.rr(-R, R), y = P.rr(-R, R), t2 = P.rr(0, 6.28), l = P.rr(14, 34); c3.stroke(x, y, x + Math.cos(t2) * l, y + Math.sin(t2) * l, 2.2, P.lt(col, 0.75), 0.7, P.rr(-5, 5)); }
      } else if (type === "knit") {
        // one yarn looping row after row: each loop's head passes through the loop above it
        const LW = 74, LH = 58; let d1 = "", d2 = "";
        for (let r = -6; r < 7; r++) for (let q = -5; q < 6; q++) { const x = q * LW + (r % 2 ? 0 : 0), y = r * LH;
          const s = `M${x - LW / 2} ${y + LH * 0.5}C${x - LW * 0.15} ${y + LH * 0.5} ${x - LW * 0.46} ${y - LH * 0.62} ${x} ${y - LH * 0.62}C${x + LW * 0.46} ${y - LH * 0.62} ${x + LW * 0.15} ${y + LH * 0.5} ${x + LW / 2} ${y + LH * 0.5}`;
          d1 += s; d2 += s; }
        const lp = (d, s, w2, op) => P.el("path", { d, fill: "none", stroke: s, "stroke-width": w2, "stroke-linecap": "round", opacity: op, "clip-path": `url(#${cid})`, class: "free", "data-free": "1" }, body);
        lp(d1, P.dk(col, 0.45), 27, 1); lp(d1, col, 21, 1); lp(d2, P.lt(col, 0.4), 5, 0.7);
      } else if (type === "corduroy") {
        const S = 84; for (let x = -R - S; x < R + S; x += S) { a.stroke(x, -R - 20, x, R + 20, S * 0.32, P.dk(col, 0.55), 1); b.stroke(x + S / 2, -R - 20, x + S / 2, R + 20, S * 0.76, col, 1); b.stroke(x + S * 0.34, -R - 20, x + S * 0.34, R + 20, 10, P.lt(col, 0.42), 0.8);
          for (let y = -R; y < R; y += 15) a.stroke(x + S * 0.2, y, x + S * 0.8, y + P.rr(-2, 2), 2.5, P.dk(col, 0.2), 0.5); }
      } else {
        // velvet from the side: a backing cloth with a thick standing pile; lean turns the pile and changes the shine
        const lean = ISO.clamp(+o.lean || 0, -1, 1), tipTone = lean > 0.2 ? P.lt(col, 0.6) : lean < -0.2 ? P.dk(col, 0.45) : P.lt(col, 0.28);
        P.el("rect", { x: -R - 10, y: -R - 10, width: 2 * R + 20, height: 2 * R + 20, fill: "#eadfc8", "clip-path": `url(#${cid})` }, body);
        const pile = P.layer(body, cid), tips = P.layer(body, cid);
        for (let x = -R - 60; x < R + 60; x += 14) { const j = P.rr(-8, 8), bx = x + j, l = 210 * (1 - Math.abs(lean) * 0.22) + P.rr(-14, 14), tx = bx + lean * 120, ty = 140 - l; pile.stroke(bx, 150, tx, ty, 13, P.pick([P.dk(col, 0.28), col, P.dk(col, 0.12)]), 1, lean * -14); tips.thread(tx - lean * 16, ty + 14, tx, ty, 11, tipTone, 0.95); }
        pile.done(); tips.done();
        P.el("rect", { x: -R - 10, y: 150, width: 2 * R + 20, height: 170, fill: "#3a3442", "clip-path": `url(#${cid})` }, body);
      }
      under.done(); a.done(); b.done(); c2.done(); c3.done();
      const ring = P.el("g", {}, g);
      P.el("circle", { r: R + 2, fill: "none", stroke: "#6d4a2c", "stroke-width": 18 }, ring);
      P.el("circle", { r: R + 2, fill: "none", stroke: "#b98f5f", "stroke-width": 5 }, ring);
      g.readout = () => type;
      return g;
    },
  });
})();
