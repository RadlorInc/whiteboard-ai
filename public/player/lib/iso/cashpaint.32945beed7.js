// "cashpaint cx cy k value=1..100 fold=0..1" — a generic painted US-style dollar note (no real note art, no portraits):
// pale green paper, border band, the value in its corners and big on the right, a leaf in a round window, a thread.
// fold folds the right half over the left.
(() => {
  const free = { class: "free", "data-free": "1" }, W = 300, H = 140, GREEN = "#3f6b4a"; let uid = 0;
  const NOTE = `M${-W} ${-H} L${W} ${-H} L${W} ${H} L${-W} ${H} Z`;
  ISO.add({
    name: "cashpaint", title: "Dollar bill", compare: null,
    about: "A generic paper dollar bill, painted: pale green paper, a patterned border, the value in the corners and large on the right, a leaf in a round window, a thin thread. value sets the number; fold=1 folds the right half over the left. Parts: left right.",
    line: "cashpaint cx cy k=0.2..1.5 value=1..100 fold=0..1",
    demo: { line: "cashpaint 480 270 0.72 value=20", script: [{ set: {}, hold: 1 }, { set: { fold: 1 }, hold: "settle" }, { set: { fold: 0, value: 50 }, hold: "settle" }, { set: { value: 5 }, hold: 1.5 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(43);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "cotton") => P.brush(f, par, P.clip(par, d), box, col);
      const val = (v) => String(ISO.clamp(Math.round(+v) || 1, 1, 100));
      const sh = P.layer(g); sh.stroke(-W + 10, H + 12, W + 10, H + 12, 18, "#5b4a36", 0.15); sh.done();
      // the whole face once, shown twice through a left and a right clip
      const defs = P.el("defs", {}, g), id = "cash" + ++uid, art = P.el("g", { id }, defs);
      fill(art, NOTE, [-W, W, -H, H], "#d4e0c4");
      const pat = P.layer(art, P.clip(art, NOTE));
      for (let i = 0; i < 9; i++) { const y = -H + 30 + i * 30; pat.stroke(-W, y, W, y + P.rr(-6, 6), 10, P.dk("#d4e0c4", 0.07), 0.6, P.rr(-14, 14)); }
      pat.stroke(-W, -H + 12, W, -H + 12, 22, "#8fae86", 0.9); pat.stroke(-W, H - 12, W, H - 12, 22, "#8fae86", 0.9);
      pat.stroke(-W + 12, -H, -W + 12, H, 22, "#8fae86", 0.9); pat.stroke(W - 12, -H, W - 12, H, 22, "#8fae86", 0.9);
      pat.thread(60, -H, 60, H, 6, "#6f7f8f", 0.7);
      pat.dab(-150, 0, 70, "#e6eedc", 1); pat.dab(-150, 0, 54, "#c4d6b4", 0.7);
      pat.dab(150, 0, 82, "#c4d6b4", 0.55); pat.done();
      let lace = ""; for (let x = -W + 26; x < W - 26; x += 18) lace += `M${x} ${-H + 12}q9 -8 18 0M${x} ${H - 12}q9 8 18 0`;
      P.el("path", { d: lace, fill: "none", stroke: GREEN, "stroke-width": 2, opacity: 0.7, ...free }, art);
      P.el("path", { d: `M${-W + 24} ${-H + 24} L${W - 24} ${-H + 24} L${W - 24} ${H - 24} L${-W + 24} ${H - 24} Z`, fill: "none", stroke: GREEN, "stroke-width": 2.4, ...free }, art);
      P.el("path", { d: "M-150 -70 A70 70 0 1 1 -150 70 A70 70 0 1 1 -150 -70 Z M-180 34 Q-150 -2 -116 -36", fill: "none", stroke: GREEN, "stroke-width": 2.4, ...free }, art);
      P.el("path", { d: "M-182 36 Q-196 -22 -116 -38 Q-112 22 -182 36 Z", fill: "#4f8a55" }, art);
      const T = (x, y, size, anchor = "middle") => P.el("text", { x, y, "text-anchor": anchor, fill: "#24402c", style: `font:700 ${size}px Georgia,'Times New Roman',serif` }, art);
      const nums = [T(-W + 40, -H + 66, 40, "start"), T(W - 40, -H + 66, 40, "end"), T(150, 40, 112)];
      T(150, 84, 22).textContent = "DOLLARS"; T(-W + 44, H - 40, 34, "start").textContent = "$";
      P.ink(NOTE, art, 3.6);
      const half = (s) => { const c = P.el("g", { "data-name": s < 0 ? "left" : "right", "clip-path": `url(#${P.clip(g, s < 0 ? `M${-W - 10} ${-H - 10}L0 ${-H - 10}L0 ${H + 10}L${-W - 10} ${H + 10}Z` : `M0 ${-H - 10}L${W + 10} ${-H - 10}L${W + 10} ${H + 10}L0 ${H + 10}Z`)})` }, g); P.el("use", { href: `#${id}` }, c); return c; };
      half(-1);
      const flap = P.el("g", {}, g), front = half(1); flap.appendChild(front);
      const back = P.el("g", { opacity: 0 }, flap), BK = `M0 ${-H} L${W} ${-H} L${W} ${H} L0 ${H} Z`;
      fill(back, BK, [0, W, -H, H], "#b9cba8"); const bl = P.layer(back); bl.dab(150, 0, 60, "#a9bf98", 0.8); bl.done(); P.ink(BK, back, 3.6);
      const st = { value: val(o.value ?? 20), fold: ISO.clamp(+o.fold || 0, 0, 1) }; let f = st.fold;
      const paint = () => { const c = Math.cos(f * Math.PI); flap.setAttribute("transform", `scale(${(Math.abs(c) < 0.004 ? 0.004 : c).toFixed(3)} 1)`); front.setAttribute("opacity", c >= 0 ? 1 : 0); back.setAttribute("opacity", c < 0 ? 1 : 0); };
      const write = () => { for (const n of nums) n.textContent = st.value; };
      write(); paint();
      g.set = (p) => { if (p.value !== undefined) { st.value = val(p.value); write(); } if (p.fold !== undefined) st.fold = ISO.clamp(+p.fold || 0, 0, 1); };
      g.update = (dt) => { f = ISO.still() ? st.fold : ISO.follow(f, st.fold, dt, 0.35); if (Math.abs(f - st.fold) < 0.002) f = st.fold; paint(); return f !== st.fold; };
      g.readout = () => `a ${st.value} dollar bill${st.fold > 0.5 ? ", folded" : ""}`;
      return g;
    },
  });
})();
