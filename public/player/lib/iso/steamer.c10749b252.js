// "steamer cx cy k steam=0..1" — a hand-held garment steamer, its side window showing the water tank and the heater,
// puffing steam at a hanging cloth. As the steam reaches the cloth its wrinkles relax; nothing touches it.
(() => {
  const free = { class: "free", "data-free": "1" };
  const f1 = (v) => v.toFixed(1);
  const sm = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const CL = "M40 -228H316L318 40Q322 140 326 236Q250 248 178 238Q104 248 30 236Q34 140 38 40Z";
  const NOZ = [-138, -150], N = 10;
  ISO.add({
    name: "steamer", title: "Garment steamer", compare: null,
    about: "A hand-held garment steamer with a see-through side: water tank at the bottom (part tank), heater in the middle (part heater), steam plate at the top. steam=0..1: the heater glows, steam puffs reach the hanging cloth (part cloth) and its wrinkles relax without anything touching it.",
    line: "steamer cx cy k=0.2..1.5 steam=0..1",
    demo: { line: "steamer 480 275 0.62 steam=0", script: [{ set: { steam: 0 }, hold: 1 }, { set: { steam: 0.5 }, hold: "settle" }, { set: { steam: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT;
      P.seed(127);
      const g = P.base(parent, cx, cy, k), body = "#2f6f78";
      // the hanging cloth on a wooden hanger bar
      const cloth = P.el("g", { "data-name": "cloth" }, g), col = P.COLORS.rose, cc = P.clip(cloth, CL);
      P.el("path", { d: "M178 -236L178 -262Q178 -282 196 -286Q214 -292 206 -308Q196 -320 176 -308", fill: "none", stroke: "#8c8a86", "stroke-width": 7, "stroke-linecap": "round", ...free }, cloth);
      P.brush("cotton", cloth, cc, [30, 330, -230, 250], col, { density: 1.3 });
      const folds = P.layer(cloth, cc); for (const x of [90, 160, 230, 290]) { folds.stroke(x, -220, x + 6, 240, 22, P.dk(col, 0.18), 0.35, 8); folds.stroke(x + 18, -210, x + 22, 240, 9, P.lt(col, 0.3), 0.35, 6); } folds.done();
      const wr = P.el("g", { "data-name": "wrinkles" }, cloth), wl = P.layer(wr, cc); let wi = "";
      for (let i = 0; i < 14; i++) { const x = P.rr(60, 290), y = P.rr(-190, 210), l = P.rr(60, 120), a = P.rr(-0.6, 0.6) + (i % 2 ? 0.3 : -0.3), dx = Math.cos(a) * l, dy = Math.sin(a) * l;
        wl.stroke(x, y, x + dx, y + dy, P.rr(9, 13), P.dk(col, 0.4), 0.7, P.rr(-10, 10)); wl.stroke(x + 6, y + 8, x + dx + 6, y + dy + 8, P.rr(5, 8), P.lt(col, 0.45), 0.7, P.rr(-10, 10));
        wi += `M${f1(x + dx * 0.15)} ${f1(y + dy * 0.15)}L${f1(x + dx * 0.5 + 6)} ${f1(y + dy * 0.5 - 6)}L${f1(x + dx * 0.85)} ${f1(y + dy * 0.85)}`; }
      wl.done(); P.el("path", { d: wi, fill: "none", stroke: P.INK, "stroke-width": 2, opacity: 0.55, "stroke-linejoin": "round", "clip-path": `url(#${cc})`, ...free }, wr);
      P.ink(CL, cloth, 3.6);
      const bar = P.layer(cloth); bar.thread(26, -232, 330, -232, 20, "#a97f4f"); bar.stroke(34, -236, 322, -236, 4, "#c9a77a", 0.8); bar.done(); P.ink("M26 -242H330V-222H26Z", cloth, 3);
      // the steamer: tank, see-through body with heater, handle, head and plate
      const S = P.el("g", {}, g);
      P.el("path", { d: "M-282 214Q-286 260 -330 270Q-380 280 -400 300", fill: "none", stroke: "#3a3d44", "stroke-width": 9, "stroke-linecap": "round", ...free }, S);
      P.el("path", { d: "M-344 -90Q-410 -86 -410 -30Q-410 22 -344 26", fill: "none", stroke: P.INK, "stroke-width": 30, "stroke-linecap": "round", ...free }, S);
      P.el("path", { d: "M-344 -90Q-410 -86 -410 -30Q-410 22 -344 26", fill: "none", stroke: body, "stroke-width": 22, "stroke-linecap": "round", ...free }, S);
      P.el("path", { d: "M-350 -84Q-400 -80 -402 -36", fill: "none", stroke: P.lt(body, 0.35), "stroke-width": 5, "stroke-linecap": "round", ...free }, S);
      const tank = P.el("g", { "data-name": "tank" }, S), TD = "M-338 50H-226V196Q-226 214 -244 214H-320Q-338 214 -338 196Z", tc = P.clip(tank, TD);
      P.el("path", { d: TD, fill: "#dfeaf0" }, tank);
      const wa = P.layer(tank, tc); wa.stroke(-350, 152, -214, 152, 132, "#7fb2d6"); wa.stroke(-350, 92, -214, 90, 8, "#b8d6ea", 0.9); for (let i = 0; i < 7; i++) wa.dab(P.rr(-325, -240), P.rr(110, 200), P.rr(3, 6), "#d6e9f5", 0.9); wa.stroke(-326, 60, -320, 200, 8, "#ffffff", 0.5); wa.done();
      P.ink(TD + "M-338 88H-226", tank, 3.2);
      const BD = "M-344 50V-108Q-344 -122 -330 -122H-234Q-220 -122 -220 -108V50Z", bc = P.clip(S, BD), bl = P.layer(S, bc);
      bl.stroke(-344, -36, -220, -36, 180, body); bl.stroke(-334, -110, -334, 40, 10, P.lt(body, 0.35), 0.7); bl.stroke(-228, -110, -228, 40, 12, P.dk(body, 0.3), 0.6); bl.done();
      const heater = P.el("g", { "data-name": "heater" }, S);
      P.el("rect", { x: -318, y: -92, width: 72, height: 118, rx: 10, fill: "#34363c" }, heater);
      const coil = Array.from({ length: 7 }, (_, i) => `${i ? "L" : "M"}${i % 2 ? -258 : -306} ${-80 + i * 15}`).join("");
      P.el("path", { d: coil, fill: "none", stroke: "#8c8a86", "stroke-width": 6, "stroke-linejoin": "round", ...free }, heater);
      const glow = P.el("g", { opacity: 0 }, heater); P.el("rect", { x: -318, y: -92, width: 72, height: 118, rx: 10, fill: "#e0662c", opacity: 0.35 }, glow);
      P.el("path", { d: coil, fill: "none", stroke: "#ffb24a", "stroke-width": 5, "stroke-linejoin": "round", ...free }, glow);
      P.el("path", { d: "M-282 50V26M-282 -92V-118", fill: "none", stroke: "#a9c9dc", "stroke-width": 6, ...free }, heater);
      P.ink("M-318 -92H-246V26H-318Z", heater, 2.6, false);
      P.ink(BD, S, 3.4);
      const HD = "M-332 -122V-174Q-332 -196 -310 -196H-170Q-150 -196 -150 -176V-124Q-150 -104 -170 -104H-226", hc = P.clip(S, HD + "Z"), hl = P.layer(S, hc);
      hl.stroke(-340, -150, -140, -150, 110, body); hl.stroke(-320, -186, -170, -186, 9, P.lt(body, 0.35), 0.7); hl.done();
      P.ink(HD, S, 3.4);
      const plate = P.layer(S); plate.thread(-140, -204, -140, -96, 22, "#b9bec4"); plate.done();
      P.ink("M-151 -206H-129V-94H-151Z", S, 3);
      let holes = ""; for (let y = -192; y <= -108; y += 14) holes += `M-140 ${y}m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`; P.el("path", { d: holes, fill: "#4a4d55" }, S);
      P.el("circle", { cx: -282, cy: -160, r: 12, fill: "#d9463f", stroke: P.INK, "stroke-width": 2.6 }, S);
      // steam puffs, rebuilt as they spread
      const puffShade = P.el("path", { fill: "#c3d0d8", opacity: 0.8 }, g), puff = P.el("path", { fill: "#ffffff", opacity: 0.88 }, g);
      const PU = Array.from({ length: N }, (_, i) => { const s = (i + 0.5) / N; return { s, y: P.rr(-1, 1), c: Array.from({ length: 4 }, () => [P.rr(-1, 1), P.rr(-0.7, 0.7), P.rr(0.55, 0.9)]) }; });
      const st = { steam: ISO.clamp(+o.steam || 0, 0, 1) }; let v = st.steam;
      const circ = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
      const paint = () => {
        let d = "", ds = "";
        for (let i = 0; i < N; i++) { const p = PU[i], a = ISO.clamp(v * N * 1.1 - i, 0, 1); if (a <= 0) continue;
          const s = p.s * (0.25 + 0.75 * sm(0, 0.8, v)), x = NOZ[0] + 20 + s * 190, y = NOZ[1] + p.y * s * 70, R = (12 + s * 34) * a;
          for (const [dx, dy, q] of p.c) { d += circ(x + dx * R * 0.8, y + dy * R, R * q); ds += circ(x + dx * R * 0.8 + 3, y + dy * R + 6, R * q); } }
        puff.setAttribute("d", d); puffShade.setAttribute("d", ds);
        glow.setAttribute("opacity", sm(0, 0.3, v).toFixed(3)); wr.setAttribute("opacity", (1 - sm(0.45, 1, v)).toFixed(3));
      };
      paint();
      g.anchors = { tank: [-282, 130], heater: [-282, -33], cloth: [178, 0] };
      g.set = (p) => { if (p.steam !== undefined) st.steam = ISO.clamp(+p.steam || 0, 0, 1); };
      g.update = (dt) => { v = ISO.still() ? st.steam : ISO.follow(v, st.steam, dt, 0.8); if (Math.abs(v - st.steam) < 0.002) v = st.steam; paint(); return v !== st.steam; };
      g.readout = () => (st.steam < 0.05 ? "steamer off, cloth wrinkled" : st.steam < 0.9 ? "hot steam reaching the cloth" : "wrinkles relaxed by steam");
      return g;
    },
  });
})();
