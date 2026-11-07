// "zipper cx cy k kind=regular|invisible pull=0..1 c=…" — a zipper seen from the front; pull runs the slider down and
// the two tapes spread above it. regular: its metal teeth show. invisible: the edges roll over and meet, so closed
// there is only a seam, and small coils show only on the opened part.
(() => {
  const Y0 = -290, Y1 = 290, TW = 92, STEP = 17;
  ISO.add({
    name: "zipper", title: "Zipper", compare: null,
    about: "A zipper from the front with its slider. pull=0 closed, pull=1 open. kind=regular shows metal teeth locking; kind=invisible has its teeth rolled behind the edges, so closed it shows only a seam.",
    line: "zipper cx cy k=0.2..1.5 kind=regular|invisible pull=0..1 c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "zipper 480 270 0.82 kind=regular pull=0.5", script: [{ set: { pull: 0 }, hold: "settle" }, { set: { pull: 0.5 }, hold: "settle" }, { set: { pull: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, inv = o.kind === "invisible", col = P.colorOf("denim", o.c);
      P.seed(41);
      const g = P.base(parent, cx, cy, k), mk = (a) => P.el("path", { class: "free", "data-free": "1", ...a }, g);
      const tape = [mk({ fill: col }), mk({ fill: col })], band = [mk({ fill: P.dk(col, 0.22), opacity: 0.55 }), mk({ fill: P.dk(col, 0.22), opacity: 0.55 })], shine = [mk({ fill: P.lt(col, 0.3), opacity: 0.4 }), mk({ fill: P.lt(col, 0.3), opacity: 0.4 })];
      const stitch = mk({ fill: "none", stroke: "#e0cc9e", "stroke-width": 3.4, "stroke-dasharray": "12 8" });
      const outline = mk({ fill: "none", stroke: P.INK, "stroke-width": 3.2, "stroke-linejoin": "round" });
      const seam = mk({ fill: "none", stroke: P.INK, "stroke-width": 2.6 });
      const teeth = mk({ fill: inv ? "#9aa3ad" : "#c8a04d", stroke: P.INK, "stroke-width": 1.4 });
      const sl = P.el("g", {}, g), SL = inv ? 16 : 24;
      P.el("path", { d: `M${-SL} -24 L${SL} -24 L${SL * 0.72} 26 L${-SL * 0.72} 26 Z`, fill: inv ? "#b9c0c7" : "#b8924a", stroke: P.INK, "stroke-width": 3, "stroke-linejoin": "round" }, sl);
      P.el("path", { d: `M${-SL * 0.6} -14 L${SL * 0.6} -14`, stroke: "#fff", "stroke-width": 4, opacity: 0.6, class: "free", "data-free": "1" }, sl);
      P.el("rect", { x: inv ? -6 : -9, y: 20, width: inv ? 12 : 18, height: inv ? 46 : 70, rx: 6, fill: inv ? "#b9c0c7" : "#c8a04d", stroke: P.INK, "stroke-width": 3 }, sl);
      const st = { pull: ISO.clamp(+o.pull || 0, 0, 1) }; let p = st.pull;
      const pts = (off) => { const out = []; for (let y = Y0; y <= Y1; y += 24) out.push([y, off(y)]); return out; };
      const draw = () => {
        const ys = Y0 + 16 + p * (Y1 - Y0 - 40);
        const off = (y) => { const d = Math.max(0, ys - 18 - y); return Math.min(120, d * 0.24 + (d > 0 ? 1.5 : 0)); };
        const line = pts(off); let tooth = "", od = "", st_ = "";
        [-1, 1].forEach((s, i) => {
          const inner = line.map(([y, a]) => [s * a, y]), outer = line.map(([y, a]) => [s * (a + TW), y]).reverse();
          const f = (A) => "M" + A.map(([x, y]) => `${x.toFixed(1)} ${y}`).join("L");
          tape[i].setAttribute("d", f([...inner, ...outer]) + "Z"); od += f([...inner, ...outer]) + "Z";
          band[i].setAttribute("d", f([...line.map(([y, a]) => [s * (a + TW * 0.5), y]), ...line.map(([y, a]) => [s * (a + TW * 0.86), y]).reverse()]) + "Z");
          shine[i].setAttribute("d", f([...line.map(([y, a]) => [s * (a + TW * 0.2), y]), ...line.map(([y, a]) => [s * (a + TW * 0.32), y]).reverse()]) + "Z");
          st_ += f(line.map(([y, a]) => [s * (a + TW * 0.62), y]));
        });
        for (let y = Y0 + 6, i = 0; y < Y1 - 4; y += STEP, i++) { const s = i % 2 ? 1 : -1, a = off(y);
          if (inv) { if (a > 1) tooth += `M${(s * a - 6).toFixed(1)} ${y}h12v8h-12Z`; }
          else { const x = a > 0.5 ? s * a : s * 3; tooth += s < 0 ? `M${(x - 13).toFixed(1)} ${y}h${a > 0.5 ? 16 : 22}v10h${a > 0.5 ? -16 : -22}Z` : `M${(x - (a > 0.5 ? 3 : 9)).toFixed(1)} ${y}h${a > 0.5 ? 16 : 22}v10h${a > 0.5 ? -16 : -22}Z`; } }
        teeth.setAttribute("d", tooth); outline.setAttribute("d", od); stitch.setAttribute("d", st_);
        seam.setAttribute("d", `M0 ${ys.toFixed(1)}L0 ${Y1}`); seam.setAttribute("opacity", inv ? 1 : 0);
        sl.setAttribute("transform", `translate(0 ${ys.toFixed(1)})`);
      };
      draw();
      g.set = (q) => { if (q.pull !== undefined) st.pull = ISO.clamp(+q.pull || 0, 0, 1); };
      g.update = (dt) => { p = ISO.still() ? st.pull : ISO.follow(p, st.pull, dt, 0.4); if (Math.abs(p - st.pull) < 0.002) p = st.pull; draw(); return p !== st.pull; };
      g.readout = () => `${inv ? "invisible" : "regular"} zipper, ${Math.round(st.pull * 100)}% open`;
      return g;
    },
  });
})();
