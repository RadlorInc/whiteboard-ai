// "factorypaint cx cy k door=0..1 steam=0..1" — a small painted factory from the front: sawtooth roof, chimney, a row
// of windows and a loading bay. door rolls the bay's shutter up to show cartons inside; steam puffs from the chimney.
(() => {
  const free = { class: "free", "data-free": "1" };
  const BODY = "M-300 -120 L300 -120 L300 200 L-300 200 Z";
  const ROOF = "M-306 -116 L-306 -200 L-150 -116 L-150 -200 L0 -116 L0 -200 L150 -116 L150 -200 L306 -116 Z";
  const CHIM = "M192 -318 L236 -318 L236 -150 L192 -150 Z", CAP = "M184 -332 L244 -332 L244 -314 L184 -314 Z";
  const BAY = "M-60 18 L140 18 L140 200 L-60 200 Z", SIDE = "M196 92 L254 92 L254 200 L196 200 Z";
  const WIN = [[-250, -96], [-160, -96], [-70, -96], [20, -96], [110, -96], [200, -96], [-250, 50], [-160, 50]];
  ISO.add({
    name: "factorypaint", title: "Factory", compare: null,
    about: "A small factory painted from the front: sawtooth roof, chimney, windows and a loading bay. door=1 rolls the shutter up to show cartons inside; steam=1 puffs steam from the chimney. Parts: building roof door chimney steam.",
    line: "factorypaint cx cy k=0.2..1.5 door=0..1 steam=0..1",
    demo: { line: "factorypaint 480 290 0.72 door=0 steam=0", script: [{ set: {}, hold: 1 }, { set: { steam: 1 }, hold: "settle" }, { set: { door: 1 }, hold: "settle" }, { set: { door: 0, steam: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(61);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const sh = P.layer(g); sh.stroke(-340, 206, 340, 206, 22, "#5b4a36", 0.16); sh.done();
      const chim = P.el("g", { "data-name": "chimney" }, g);
      fill(chim, CHIM, [192, 236, -330, -150], "#a8562c", "linen"); fill(chim, CAP, [184, 244, -332, -314], "#5a3a2a");
      P.ink(CHIM + CAP, chim, 3.4);
      const steam = P.el("g", { "data-name": "steam", opacity: 0 }, g), sl = P.layer(steam);
      for (const [x, y, r] of [[214, -356, 26], [236, -392, 34], [268, -430, 40], [306, -462, 44]]) { sl.dab(x, y, r, "#d8d3c9", 0.8); sl.dab(x - r * 0.25, y - r * 0.3, r * 0.7, "#f6f3ec", 0.95); }
      sl.done();
      const roof = P.el("g", { "data-name": "roof" }, g);
      fill(roof, ROOF, [-306, 306, -200, -116], "#55657a");
      const gl = P.layer(roof); for (const x of [-300, -144, 6, 156]) gl.stroke(x + 8, -186, x + 8, -126, 9, "#b9cddb", 0.75); gl.done();
      P.ink(ROOF, roof, 3.6);
      const bld = P.el("g", { "data-name": "building" }, g);
      fill(bld, BODY, [-300, 300, -120, 200], "#c07a4f");
      const br = P.layer(bld, P.clip(bld, BODY));
      for (let y = -104; y < 200; y += 22) for (let x = -300 + ((y / 22) % 2 ? 0 : 30); x < 300; x += 60 + P.rr(-8, 8)) br.stroke(x, y, x + P.rr(24, 46), y + P.rr(-1, 1), 4, P.dk("#c07a4f", 0.18), 0.45);
      br.stroke(-300, -112, 300, -112, 14, P.dk("#c07a4f", 0.3), 0.6); br.done();
      for (const [x, y] of WIN) { const d = `M${x - 28} ${y} L${x + 28} ${y} L${x + 28} ${y + 62} L${x - 28} ${y + 62} Z`; fill(bld, d, [x - 28, x + 28, y, y + 62], "#9fb8c8");
        const w = P.layer(bld); w.stroke(x - 18, y + 46, x + 6, y + 10, 7, "#e6eef2", 0.7); w.done(); P.ink(`${d}M${x} ${y}L${x} ${y + 62}M${x - 28} ${y + 31}L${x + 28} ${y + 31}`, bld, 3); }
      fill(bld, SIDE, [196, 254, 92, 200], "#28507f"); P.el("circle", { cx: 242, cy: 150, r: 4.5, fill: "#c79b52" }, bld); P.ink(SIDE, bld, 3.2);
      // the bay: dark inside with cartons, the shutter in front of them
      const bay = P.el("g", {}, bld), bcl = P.clip(bay, BAY);
      fill(bay, BAY, [-60, 140, 18, 200], "#3b3631");
      for (const [x, y, w, h] of [[-46, 152, 56, 46], [14, 152, 56, 46], [74, 152, 56, 46], [-20, 106, 56, 46], [40, 106, 56, 46], [8, 60, 56, 46]]) {
        const d = `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`; fill(bay, d, [x, x + w, y, y + h], "#b08a5e", "linen");
        P.el("path", { d: `M${x + w / 2 - 6} ${y}L${x + w / 2 - 6} ${y + h}M${x + w / 2 + 6} ${y}L${x + w / 2 + 6} ${y + h}`, stroke: "#8d6c47", "stroke-width": 3, fill: "none", ...free }, bay); P.ink(d, bay, 2.6, false); }
      const shut = P.el("g", { "data-name": "door", "clip-path": `url(#${bcl})` }, bay), roll = P.el("g", {}, shut);
      fill(roll, BAY, [-60, 140, 18, 200], "#8d99a6");
      let sl2 = ""; for (let y = 32; y < 200; y += 14) sl2 += `M-60 ${y}L140 ${y}`;
      P.el("path", { d: sl2, stroke: "#5f6b78", "stroke-width": 2.4, fill: "none", ...free }, roll);
      P.el("path", { d: "M-60 193L140 193", stroke: P.INK, "stroke-width": 5, fill: "none", ...free }, roll);
      P.ink("M-68 200 L-68 10 L148 10 L148 200", bld, 4);
      P.ink(BODY, bld, 4.2);
      const st = { door: ISO.clamp(+o.door || 0, 0, 1), steam: ISO.clamp(+o.steam || 0, 0, 1) }, now = { ...st };
      const paint = () => { roll.setAttribute("transform", `translate(0 ${(-now.door * 176).toFixed(1)})`); steam.setAttribute("opacity", now.steam.toFixed(3)); steam.setAttribute("transform", `translate(0 ${((1 - now.steam) * 30).toFixed(1)})`); };
      paint();
      g.set = (p) => { for (const q of ["door", "steam"]) if (p[q] !== undefined) st[q] = ISO.clamp(+p[q] || 0, 0, 1); };
      g.update = (dt) => { let on = false; for (const q in st) { now[q] = ISO.still() ? st[q] : ISO.follow(now[q], st[q], dt, 0.4); if (Math.abs(now[q] - st[q]) < 0.003) now[q] = st[q]; else on = true; } paint(); return on; };
      g.readout = () => `factory: door ${Math.round(st.door * 100)}% open, steam ${st.steam ? "on" : "off"}`;
      return g;
    },
  });
})();
