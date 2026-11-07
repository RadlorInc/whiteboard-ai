// "tiedye cx cy k kind=spiral|stripes|circles step=0..3 c=…" — tie-dye in four steps: the white cloth folded (0), bound
// tight with string (1), dipped in dye with the string still on (2), opened to show the pattern (3). Where the string
// pressed the cloth, the dye could not reach, so those places stay white. The opened cloth is the clothswatch drawing.
(() => {
  const free = { class: "free", "data-free": "1" };
  const WHITE = "#eef0ee";
  const ring = (cx, cy, r) => `M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}Z`;
  const TUFTS = [[-85, -35], [80, -50], [5, 62]];
  const SHAPES = {
    spiral: { cloth: ring(0, 0, 160), box: [-170, 170, -170, 170],
      folds: (() => { let d = ""; for (let a = 0; a < 3; a++) { const pts = []; for (let r = 12; r < 158; r += 8) { const th = a * 2.09 + r * 0.03; pts.push(`${(Math.cos(th) * r).toFixed(1)} ${(Math.sin(th) * r).toFixed(1)}`); } d += "M" + pts.join("L"); } return d; })(),
      strings: [0, 45, 90, 135].map((a) => { const c = Math.cos((a * Math.PI) / 180) * 168, s = Math.sin((a * Math.PI) / 180) * 168; return `M${(-c).toFixed(1)} ${(-s).toFixed(1)}L${c.toFixed(1)} ${s.toFixed(1)}`; }).join("") },
    stripes: { cloth: "M-150 -62L150 -62Q200 -62 200 0Q200 62 150 62L-150 62Q-200 62 -200 0Q-200 -62 -150 -62Z", box: [-200, 200, -62, 62],
      folds: "M-196 -30Q0 -38 196 -30M-200 0Q0 6 200 0M-196 30Q0 24 196 30",
      strings: [-120, -40, 40, 120].map((x) => `M${x} -68Q${x + 10} 0 ${x} 68`).join("") },
    circles: { cloth: "M-185 -130Q0 -150 185 -130Q200 0 185 130Q0 148 -185 130Q-200 0 -185 -130Z", box: [-200, 200, -150, 150],
      folds: TUFTS.map(([x, y]) => [0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.047; return `M${(x + Math.cos(a) * 14).toFixed(1)} ${(y + Math.sin(a) * 14).toFixed(1)}L${(x + Math.cos(a) * 46).toFixed(1)} ${(y + Math.sin(a) * 46).toFixed(1)}`; }).join("")).join(""),
      strings: TUFTS.map(([x, y]) => ring(x, y, 20) + ring(x, y, 33)).join("") },
  };
  ISO.add({
    name: "tiedye", title: "Tie-dye", compare: null,
    about: "Tie-dye in four steps on a white cloth: step=0 folded (spiral: twisted into a flat round; stripes: pleated into a long roll; circles: small bunches pulled up), step=1 bound tight with string, step=2 dipped in a bowl of dye with the string on, step=3 untied and opened: the dye colors the cloth but leaves white lines wherever the string pressed. Named parts: bundle, string, bowl, pattern.",
    line: "tiedye cx cy k=0.2..1.5 kind=spiral|stripes|circles step=0..3 c=rose|blue|teal|mustard|olive|rust|plum|red|sage",
    demo: { line: "tiedye 480 270 0.85 kind=spiral c=plum", script: [{ set: { step: 0 }, hold: 1 }, { set: { step: 1 }, hold: "settle" }, { set: { step: 2 }, hold: "settle" }, { set: { step: 3 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = Object.hasOwn(SHAPES, o.kind) ? o.kind : "spiral", S_ = SHAPES[kind];
      const dye = P.COLORS[o.c] && !["cream", "white", "black", "grey", "camel"].includes(o.c) ? P.COLORS[o.c] : P.COLORS.rose;
      P.seed(91 + kind.length * 5);
      const g = P.base(parent, cx, cy, k);
      // the bowl of dye: its far side and the dye's surface behind the bundle, its near side in front, so the bundle sits in it
      const bowlD = "M-250 40Q-240 200 0 210Q240 200 250 40Q0 70 -250 40Z";
      const back = P.el("g", { opacity: 0 }, g), pool = P.layer(back);
      pool.stroke(-250, 40, 250, 40, 50, P.dk("#c9cdd2", 0.15)); pool.stroke(-236, 44, 236, 44, 34, dye, 0.95); pool.stroke(-170, 40, 120, 42, 8, P.lt(dye, 0.3), 0.6); pool.done();
      P.ink("M-250 40Q0 12 250 40", back, 3, false);
      // the bundle: white cloth, its folds, the dye it takes, the string
      const bundle = P.el("g", { "data-name": "bundle" }, g), cl = P.clip(bundle, S_.cloth);
      P.brush("cotton", bundle, cl, S_.box, WHITE, { density: 0.8 });
      if (kind === "circles") { const tf = P.layer(bundle); for (const [x, y] of TUFTS) { tf.dab(x, y, 46, P.dk(WHITE, 0.08)); tf.dab(x - 6, y - 6, 30, P.lt(WHITE, 0.5), 0.8); } tf.done(); }
      const dyed = P.el("g", { opacity: 0 }, bundle), [x0, x1, y0, y1] = S_.box;
      P.el("rect", { x: x0 - 10, y: y0 - 10, width: x1 - x0 + 20, height: y1 - y0 + 20, fill: dye, "clip-path": `url(#${cl})` }, dyed);
      const dl = P.layer(dyed, cl);
      for (let i = 0; i < 26; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1); dl.stroke(x - 70, y - 30, x + 70, y + 30, P.rr(30, 60), P.pick([dye, P.dk(dye, 0.15), P.lt(dye, 0.1)]), 0.85, P.rr(-12, 12)); }
      dl.done();
      P.ink(S_.cloth, bundle, 3.6); P.ink(S_.folds, bundle, 2.4, false);
      const string = P.el("g", { "data-name": "string", opacity: 0 }, bundle);
      P.el("path", { d: S_.strings, fill: "none", stroke: WHITE, "stroke-width": 26, "stroke-linecap": "round", "clip-path": `url(#${cl})`, ...free }, string);
      P.el("path", { d: S_.strings, fill: "none", stroke: P.INK, "stroke-width": 10, "stroke-linecap": "round", ...free }, string);
      P.el("path", { d: S_.strings, fill: "none", stroke: "#c9a46a", "stroke-width": 6.5, "stroke-linecap": "round", ...free }, string);
      const bowl = P.el("g", { "data-name": "bowl", opacity: 0 }, g);
      const bl = P.layer(bowl, P.clip(bowl, bowlD)); bl.stroke(-260, 120, 260, 120, 200, "#c9cdd2"); bl.stroke(-200, 90, -120, 190, 18, P.lt("#c9cdd2", 0.4), 0.7); bl.stroke(-250, 52, 250, 52, 12, dye, 0.9); bl.done();
      P.ink(bowlD, bowl, 3.4);
      // step 3: the opened cloth (a clothswatch) with its pattern painted inside the cloth's own edge
      const open = P.el("g", { "data-name": "pattern", opacity: 0 }, g);
      const sw = ISO.all.clothswatch.make([0, 0, 0.82], { fabric: "cotton", c: "white", pin: "0" }, "", open);
      const S = sw.firstChild, id = S.querySelector("clipPath").id, outline = [...S.children].find((e) => e.tagName === "path");
      const pat = P.el("g", { "clip-path": `url(#${id})` }); S.insertBefore(pat, outline);
      P.el("rect", { x: -200, y: -240, width: 400, height: 480, fill: dye }, pat);
      const base = P.layer(pat), edge = P.layer(pat), wh = P.layer(pat);
      for (let i = 0; i < 40; i++) { const x = P.rr(-190, 190), y = P.rr(-220, 220); base.stroke(x - 80, y - 20, x + 80, y + 20, P.rr(40, 70), P.pick([dye, P.dk(dye, 0.12), P.lt(dye, 0.08)]), 0.9, P.rr(-14, 14)); }
      // white where the string pressed; a darker rim of dye along each white line
      const along = (f, w) => { for (let s = 0; s < 1; s += 0.06) { const [ax, ay] = f(s), [bx, by] = f(s + 0.07); edge.stroke(ax, ay, bx, by, w + 10, P.dk(dye, 0.3), 0.45); wh.stroke(ax, ay, bx, by, w * P.rr(0.8, 1.1), WHITE, 0.95); } };
      if (kind === "spiral") for (let a = 0; a < 8; a++) along((s) => { const r = 6 + s * 280, th = a * 0.785 + s * 3.4; return [Math.cos(th) * r, Math.sin(th) * r]; }, 8);
      if (kind === "stripes") for (const x of [-105, -35, 35, 105]) along((s) => [x + Math.sin(s * 9 + x) * 6, -230 + s * 460], 20);
      if (kind === "circles") for (const [x, y] of [[-70, -85], [72, -40], [-15, 100]]) for (const r of [24, 58]) along((s) => [x + Math.cos(s * 6.4) * r, y + Math.sin(s * 6.4) * r], r < 30 ? 11 : 14);
      base.done(); edge.done(); wh.done();
      const st = { step: ISO.clamp(Math.round(+o.step) || 0, 0, 3) }; let s = st.step;
      const c01 = (v) => ISO.clamp(v, 0, 1);
      const paint = () => {
        string.setAttribute("opacity", c01(s).toFixed(3)); dyed.setAttribute("opacity", c01(s - 1).toFixed(3));
        const bw = (c01(s - 1) * (1 - c01(s - 2))).toFixed(3); bowl.setAttribute("opacity", bw); back.setAttribute("opacity", bw);
        bundle.setAttribute("opacity", (1 - c01(s - 2)).toFixed(3)); open.setAttribute("opacity", c01(s - 2).toFixed(3));
      };
      paint();
      g.set = (p) => { if (p.step !== undefined) st.step = ISO.clamp(Math.round(+p.step) || 0, 0, 3); };
      g.update = (dt) => { s = ISO.still() ? st.step : ISO.follow(s, st.step, dt, 0.3); if (Math.abs(s - st.step) < 0.003) s = st.step; paint(); return s !== st.step; };
      g.readout = () => `${kind} tie-dye: ${["folded", "bound with string", "dipped in dye", "opened"][st.step]}`;
      return g;
    },
  });
})();
