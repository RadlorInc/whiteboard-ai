// "hanger cx cy k kind=wire|wood|padded rail=0|1" — a clothes hanger, or (rail=1) a closet rail with four of them.
// wire: one thin bent wire with narrow ends (it digs into a sweater's shoulders). wood: wide curved shoulders and a bar.
// padded: fat, soft and covered in satin. Still.
(() => {
  const free = { class: "free", "data-free": "1" };
  const HOOK = "M0 -146L0 -196Q0 -224 24 -232Q50 -242 40 -266Q26 -290 -4 -272";
  const f1 = (v) => v.toFixed(1);
  // the shoulder line from tip to tip; th = half thickness at the neck
  const arms = (th, drop = 0) => { const T = [], B = []; for (let i = 0; i <= 40; i++) { const s = -1 + i / 20, x = 290 * s, y = -140 + 140 * Math.abs(s) ** 1.35 + drop * Math.abs(s), h = th * (1 - 0.28 * Math.abs(s)); T.push([x, y - h]); B.push([x, y + h]); }
    const e = (p) => `${f1(p[0])} ${f1(p[1])}`, l = T[0], r = T[40], lb = B[0], rb = B[40];
    return `M${e(T[0])}` + T.slice(1).map((p) => "L" + e(p)).join("") + `Q${f1(r[0] + 18)} ${f1((r[1] + rb[1]) / 2)} ${e(rb)}` + B.slice(0, 40).reverse().map((p) => "L" + e(p)).join("") + `Q${f1(l[0] - 18)} ${f1((l[1] + lb[1]) / 2)} ${e(l)}Z`; };
  function hanger(P, parent, kind) {
    const g = P.el("g", {}, parent), metal = "#8c8a86";
    const hook = () => { P.el("path", { d: HOOK, fill: "none", stroke: P.INK, "stroke-width": 11, "stroke-linecap": "round", ...free }, g); P.el("path", { d: HOOK, fill: "none", stroke: kind === "padded" ? "#c9a24f" : metal, "stroke-width": 6.5, "stroke-linecap": "round", ...free }, g); P.el("path", { d: HOOK, fill: "none", stroke: "#ffffff", "stroke-width": 2, opacity: 0.55, transform: "translate(-1.5 -1)", ...free }, g); };
    if (kind === "wire") {
      const d = "M0 -146L-282 8Q-296 18 -280 22L280 22Q296 18 282 8Z";
      P.el("path", { d, fill: "none", stroke: P.INK, "stroke-width": 11, "stroke-linejoin": "round", ...free }, g);
      P.el("path", { d, fill: "none", stroke: metal, "stroke-width": 6.5, "stroke-linejoin": "round", ...free }, g);
      P.el("path", { d, fill: "none", stroke: "#ffffff", "stroke-width": 2, opacity: 0.5, transform: "translate(0 -1.5)", ...free }, g);
      hook();
      let tw = ""; for (let i = 0; i < 4; i++) tw += `M-8 ${-150 - i * 9}Q0 ${-160 - i * 9} 8 ${-152 - i * 9}`;
      P.el("path", { d: tw, fill: "none", stroke: P.INK, "stroke-width": 9, "stroke-linecap": "round", ...free }, g);
      P.el("path", { d: tw, fill: "none", stroke: metal, "stroke-width": 5, "stroke-linecap": "round", ...free }, g);
    } else if (kind === "wood") {
      const col = "#a97f4f";
      P.el("path", { d: "M-262 46H262", stroke: P.INK, "stroke-width": 20, "stroke-linecap": "round", ...free }, g);
      P.el("path", { d: "M-262 46H262", stroke: col, "stroke-width": 13, "stroke-linecap": "round", ...free }, g);
      P.el("path", { d: "M-262 43H262", stroke: P.lt(col, 0.4), "stroke-width": 3, opacity: 0.7, ...free }, g);
      P.el("path", { d: "M-278 18Q-282 40 -262 46M278 18Q282 40 262 46", fill: "none", stroke: P.INK, "stroke-width": 16, "stroke-linecap": "round", ...free }, g);
      P.el("path", { d: "M-278 18Q-282 40 -262 46M278 18Q282 40 262 46", fill: "none", stroke: col, "stroke-width": 9, "stroke-linecap": "round", ...free }, g);
      hook();
      const A = arms(24), c = P.clip(g, A), l = P.layer(g, c);
      l.stroke(-300, -60, 300, -60, 260, col);
      for (let i = 0; i < 26; i++) { const s = P.rr(-1, 1), x = 290 * s, y = -140 + 140 * Math.abs(s) ** 1.35 + P.rr(-14, 14); l.stroke(x - 60, y - (s < 0 ? -24 : 24), x + 60, y + (s < 0 ? -24 : 24), P.rr(3, 6), P.pick([P.dk(col, 0.22), P.lt(col, 0.2)]), 0.7, P.rr(-4, 4)); }
      l.stroke(-280, -6, 0, -150, 7, P.lt(col, 0.45), 0.6, -30); l.stroke(0, -150, 280, -6, 7, P.lt(col, 0.45), 0.6, -30);
      l.done(); P.ink(A, g, 3.4);
      P.el("rect", { x: -9, y: -178, width: 18, height: 20, rx: 4, fill: "#b9b6b0", stroke: P.INK, "stroke-width": 2.6 }, g);
    } else {
      const col = P.COLORS.rose;
      hook();
      const A = arms(42, 6), c = P.clip(g, A);
      P.brush("satin", g, c, [-300, 300, -200, 60], col, { density: 1.2 });
      const sh = P.layer(g, c); for (let i = 0; i <= 40; i++) { const s = -1 + i / 20, x = 290 * s, y = -140 + 140 * Math.abs(s) ** 1.35 + 6 * Math.abs(s); sh.stroke(x, y + 14, x + 4, y + 38, 8, P.dk(col, 0.3), 0.45); } sh.done();
      let ru = ""; for (let i = 1; i < 40; i += 2) { const s = -1 + i / 20, x = 290 * s, y = -140 + 140 * Math.abs(s) ** 1.35 + 6 * Math.abs(s), h = 42 * (1 - 0.28 * Math.abs(s)); ru += `M${f1(x - 3)} ${f1(y - h + 6)}Q${f1(x + 5)} ${f1(y)} ${f1(x - 3)} ${f1(y + h - 6)}`; }
      P.el("path", { d: ru, fill: "none", stroke: P.dk(col, 0.45), "stroke-width": 2.4, opacity: 0.8, ...free }, g);
      P.ink(A, g, 3.6);
      const bow = P.layer(g); bow.dab(-22, -186, 16, P.lt(col, 0.15)); bow.dab(22, -186, 16, P.lt(col, 0.15)); bow.dab(0, -186, 9, P.dk(col, 0.2)); bow.stroke(-6, -180, -20, -150, 8, P.lt(col, 0.1)); bow.stroke(6, -180, 20, -150, 8, P.lt(col, 0.1)); bow.done();
      P.ink("M-6 -190Q-30 -212 -38 -190Q-30 -166 -6 -182M6 -190Q30 -212 38 -190Q30 -166 6 -182", g, 2.6, false);
    }
    return g;
  }
  ISO.add({
    name: "hanger", title: "Clothes hanger", compare: null,
    about: "A clothes hanger: kind=wire (one thin bent wire, narrow ends that dig into a sweater's shoulders), wood (wide curved shoulders and a bar), padded (fat, soft, covered in satin). rail=1 shows a closet rail with four of them hanging side by side.",
    line: "hanger cx cy k=0.2..1.5 kind=wire|wood|padded rail=0|1",
    demo: { line: "hanger 480 300 0.8 kind=wood", script: [{ set: {}, hold: 1 }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = ["wire", "wood", "padded"].includes(o.kind) ? o.kind : "wire";
      P.seed(101 + kind.length);
      const g = P.base(parent, cx, cy, k);
      if (+o.rail === 1) {
        const RY = -150, s = 0.32, rod = P.el("g", { "data-name": "rail" }, g);
        for (const x of [-452, 452]) { const b = P.layer(rod); b.stroke(x, RY - 60, x, RY + 34, 40, "#a97f4f"); b.stroke(x - 8, RY - 54, x - 8, RY + 26, 6, "#c9a77a", 0.7); b.done(); P.ink(`M${x - 20} ${RY - 60}H${x + 20}V${RY + 34}H${x - 20}Z`, rod, 3); }
        P.el("path", { d: `M-440 ${RY}H440`, stroke: P.INK, "stroke-width": 20, "stroke-linecap": "round", ...free }, rod);
        P.el("path", { d: `M-440 ${RY}H440`, stroke: "#a9aeb4", "stroke-width": 13, "stroke-linecap": "round", ...free }, rod);
        P.el("path", { d: `M-440 ${RY - 3}H440`, stroke: "#ffffff", "stroke-width": 3, opacity: 0.6, ...free }, rod);
        for (const x of [-300, -100, 100, 300]) { const h = P.el("g", { transform: `translate(${x - 22 * s} ${RY + 264 * s}) scale(${s})` }, g); hanger(P, h, kind); }
        g.anchors = { rail: [0, RY] };
      } else hanger(P, g, kind);
      g.readout = () => `${kind} hanger${+o.rail === 1 ? "s on a closet rail" : ""}`;
      return g;
    },
  });
})();
