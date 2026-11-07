// "truckpaint cx cy k door=0..1 roll=0..1" — a painted box delivery truck from the side: cab, cargo box with a roll-up
// side door and a ramp, twin rear wheels. door rolls the door up and lowers the ramp; roll drives it forward.
(() => {
  const free = { class: "free", "data-free": "1" };
  const BOX = "M-330 -176 L112 -176 L112 104 L-330 104 Z", OPEN = "M-250 -140 L10 -140 L10 98 L-250 98 Z";
  const CAB = "M118 -96 L226 -96 Q258 -94 274 -48 L300 14 L304 104 L118 104 Z", WIN = "M196 -80 L228 -80 Q248 -76 260 -40 L272 -6 L196 -6 Z";
  const CHAS = "M-336 102 L306 102 L306 122 L-336 122 Z", RAMP = "M-250 98 L10 98 L32 196 L-272 196 Z";
  const WHEELS = [-246, -170, 214], R = 40, WY = 132;
  ISO.add({
    name: "truckpaint", title: "Delivery truck", compare: null,
    about: "A box delivery truck painted from the side: cab, cargo box, twin rear wheels. door=1 rolls the side door up and lowers a ramp to show cartons inside; roll=1 drives it forward with the wheels turning. Parts: cab box door ramp wheels cartons.",
    line: "truckpaint cx cy k=0.2..1.5 door=0..1 roll=0..1",
    demo: { line: "truckpaint 440 270 0.66 door=0 roll=0", script: [{ set: {}, hold: 1 }, { set: { door: 1 }, hold: "settle" }, { set: { door: 0 }, hold: "settle" }, { set: { roll: 1 }, hold: "settle" }, { set: { roll: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(29);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const truck = P.el("g", {}, g);
      const sh = P.layer(truck); sh.stroke(-350, 176, 330, 176, 18, "#5b4a36", 0.16); sh.done();
      const ch = P.el("g", {}, truck); fill(ch, CHAS, [-336, 306, 102, 122], "#33363d"); P.ink(CHAS, ch, 2.8, false);
      const box = P.el("g", { "data-name": "box" }, truck);
      fill(box, BOX, [-330, 112, -176, 104], "#eceae2");
      const bl = P.layer(box, P.clip(box, BOX)); bl.stroke(-340, -8, 120, -8, 26, "#1f6f6a", 0.95); bl.stroke(-340, 10, 120, 10, 6, "#c6952f", 0.9); bl.done();
      // inside the door: dark, with cartons
      const ins = P.el("g", { "data-name": "cartons" }, box);
      fill(ins, OPEN, [-250, 10, -140, 98], "#3b3631");
      for (const [x, y, w, h] of [[-238, 48, 62, 48], [-172, 48, 62, 48], [-106, 48, 62, 48], [-40, 48, 46, 48], [-212, -2, 62, 48], [-146, -2, 62, 48], [-80, -2, 62, 48], [-184, -52, 62, 48]]) {
        const d = `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`; fill(ins, d, [x, x + w, y, y + h], "#b08a5e", "linen");
        P.el("path", { d: `M${x + w / 2} ${y}L${x + w / 2} ${y + h}`, stroke: "#8d6c47", "stroke-width": 5, fill: "none", ...free }, ins); P.ink(d, ins, 2.4, false); }
      const dcl = P.clip(box, OPEN), door = P.el("g", { "data-name": "door", "clip-path": `url(#${dcl})` }, box), roll = P.el("g", {}, door);
      fill(roll, OPEN, [-250, 10, -140, 98], "#c9ccc8");
      let s = ""; for (let y = -128; y < 98; y += 16) s += `M-250 ${y}L10 ${y}`;
      P.el("path", { d: s, stroke: "#8d918d", "stroke-width": 2.4, fill: "none", ...free }, roll);
      P.el("path", { d: "M-250 92L10 92M-140 78L-100 78", stroke: P.INK, "stroke-width": 5, fill: "none", "stroke-linecap": "round", ...free }, roll);
      P.ink(OPEN, box, 3); P.ink(BOX, box, 4);
      const cab = P.el("g", { "data-name": "cab" }, truck);
      fill(cab, CAB, [118, 304, -96, 104], "#1f6f6a"); fill(cab, WIN, [196, 272, -80, -6], "#a9c3d0");
      const cl = P.layer(cab); cl.stroke(206, -16, 240, -70, 8, "#e6eef2", 0.7); cl.stroke(286, 70, 306, 70, 14, "#e6c66a", 1); cl.stroke(130, 4, 180, 4, 6, "#c79b52", 0.9); cl.done();
      P.ink(CAB + WIN + "M130 -80 L184 -80 L184 96 L130 96 Z", cab, 3.4);
      const wheels = P.el("g", { "data-name": "wheels" }, truck), hubs = [];
      for (const x of WHEELS) { const w = P.el("g", {}, wheels);
        P.el("circle", { cx: x, cy: WY, r: R, fill: "#23252b" }, w); P.el("circle", { cx: x, cy: WY, r: R * 0.52, fill: "#a7abb0" }, w);
        const hub = P.el("g", {}, w), hl = P.layer(hub); for (let i = 0; i < 5; i++) { const a = (i / 5) * 2 * Math.PI; hl.dab(x + Math.cos(a) * 12, WY + Math.sin(a) * 12, 3.6, "#4b4f55"); } hl.stroke(x - 13, WY - 13, x - 4, WY - 4, 4, "#e5e7e9", 0.7); hl.done(); hubs.push([hub, x]);
        P.ink(`M${x - R} ${WY}A${R} ${R} 0 1 0 ${x + R} ${WY}A${R} ${R} 0 1 0 ${x - R} ${WY}Z`, w, 3); }
      const ramp = P.el("g", { "data-name": "ramp" }, truck);
      fill(ramp, RAMP, [-272, 32, 98, 196], "#9aa0a6");
      let rs = ""; for (let i = 1; i < 6; i++) { const t2 = i / 6; rs += `M${-250 - 22 * t2} ${98 + 98 * t2}L${10 + 22 * t2} ${98 + 98 * t2}`; }
      P.el("path", { d: rs, stroke: "#6c7278", "stroke-width": 2.6, fill: "none", ...free }, ramp); P.ink(RAMP, ramp, 3);
      const st = { door: ISO.clamp(+o.door || 0, 0, 1), roll: ISO.clamp(+o.roll || 0, 0, 1) }, now = { ...st };
      const paint = () => {
        roll.setAttribute("transform", `translate(0 ${(-now.door * 232).toFixed(1)})`);
        const r = ISO.smooth(0.55, 1, now.door); ramp.setAttribute("transform", `translate(0 98) scale(1 ${Math.max(r, 0.001).toFixed(3)}) translate(0 -98)`); ramp.setAttribute("opacity", r > 0.01 ? 1 : 0);
        const dx = now.roll * 170; truck.setAttribute("transform", `translate(${dx.toFixed(1)} 0)`);
        for (const [h, x] of hubs) h.setAttribute("transform", `rotate(${((dx / R) * 57.3).toFixed(1)} ${x} ${WY})`);
      };
      paint();
      g.set = (p) => { for (const q of ["door", "roll"]) if (p[q] !== undefined) st[q] = ISO.clamp(+p[q] || 0, 0, 1); };
      g.update = (dt) => { let on = false; for (const q in st) { now[q] = ISO.still() ? st[q] : ISO.follow(now[q], st[q], dt, q === "roll" ? 0.6 : 0.4); if (Math.abs(now[q] - st[q]) < 0.002) now[q] = st[q]; else on = true; } paint(); return on; };
      g.readout = () => `truck: door ${Math.round(st.door * 100)}% open, driven ${Math.round(st.roll * 100)}%`;
      return g;
    },
  });
})();
