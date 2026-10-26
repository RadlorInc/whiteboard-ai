// "heatpump cx cy width on=1 lab=1 lit=outdoor|indoor|compressor|valve|pipes" — an air-source heat pump heating a room.
// Outside the cut-away house wall stands the outdoor unit: a fan behind its grille draws air through the coil, and with
// its service panel off you see the compressor. Two refrigerant lines (the fat insulated gas line and the thin copper
// liquid line, with an expansion valve) run along the ground, through the wall and up to the wall-mounted indoor unit.
// Heating: the compressor squeezes the refrigerant gas hot; it gives its heat to the room in the indoor coil and comes
// back as liquid; the expansion valve drops its pressure so it boils cold in the outdoor coil, taking heat from 5 °C
// air. COP ≈ 3: 1 kW of electricity moves 2 kW from outside and delivers 3 kW indoors. on=1 runs it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FLOOR = { x: -128, y: -50, w: 252, d: 92, r: 4 }, OU = { x: -112, y: -24, w: 72, d: 32, r: 2 }, OUZ = [5, 62];
  const FAN = [-88, OU.y + OU.d, 34], FR = 21, IU = { x: 34, y: -40, w: 70, d: 15, r: 4 }, IUZ = [80, 101], COP = 3, KW = 1;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`, sub = (a, b) => a.map((v, i) => v - b[i]);
  const BRICK = ISO.tint("#f0d9cc", ["#b9826a", "#c89580", "#d6a894", "#e2baa8"], "#6e3a28"), PLASTER = ISO.tint("#f6f3ee", ["#cfc9bf", "#dad4cb", "#e4dfd7", "#ede9e2"], "#6b665e");
  // a pipe route of straight legs joined by ball elbows (no tube module on the page)
  const route = (P, pts, r, style, ball = r * 1.35) => {
    const out = [];
    for (let i = 1; i < pts.length; i++) { const d = sub(pts[i], pts[i - 1]), len = Math.hypot(...d); out.push(S(G.disc(i > 1 ? ball * 0.7 : 0, len - (i < pts.length - 1 ? ball * 0.7 : 0), r, G.frameAlong(pts[i - 1], d.map((v) => v / len)), P), style)); if (i < pts.length - 1) out.push(S(G.sphereOf(pts[i], ball, P), style)); }
    return out.join("");
  };
  const GAS = [[OU.x + OU.w, -4, 14], [-16, -4, 14], [-16, -36, 14], [8, -36, 14], [8, -36, 90], [IU.x, -36, 90]];
  const LIQ = [[OU.x + OU.w, -12, 9], [-22, -12, 9], [-22, -31, 9], [13, -31, 9], [13, -31, 86], [IU.x, -31, 86]];

  function roomSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -6, 6, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -6, 6, P, 4, 0.6), { tone: "mid", inner: L(K.sideSeam(FLOOR, -3, P, 4), { tone: "faint" }) }))];
    // indoor floorboards and the concrete pad outside
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [0, 122], [-40, 40], [0, 1], "hi") + L([-30, -20, -10, 0, 10, 20, 30].map((y) => K.lineOnTop([0, y], [122, y], 1, P)).join(""), { tone: "lo" })));
    out.push(S(K.slabOf({ x: -120, y: -32, w: 88, d: 48, r: 2 }, 0, 3, P, 2, 0.4), { tone: "mid" }));
    // back wall (plastered room face) and the cut side wall: brick, insulation and block in its section
    out.push(ISO.tinted(PLASTER, ISO.wbox(P, [-8, 124], [-50, -40], [0, 112], "hi")));
    out.push(ISO.tinted(BRICK, ISO.wbox(P, [-8, -4], [-40, 30], [0, 112], "hi")), ISO.tinted(ISO.T.amber, ISO.wbox(P, [-4, -2], [-40, 30], [0, 112], "hi")), ISO.tinted(PLASTER, ISO.wbox(P, [-2, 0], [-40, 30], [0, 112], "hi")));
    out.push(`<path d="${Array.from({ length: 12 }, (_, k) => K.pathOf([K.iso([-8, 30.05, k * 9 + 6], P), K.iso([-4, 30.05, k * 9 + 6], P)])).join("")}" fill="none" stroke="#6e3a28" stroke-width="0.5"/>`);
    // a room thermometer on the back wall, and one by the outdoor unit
    for (const [x, y, z, n] of [[112, -39.9, 56, 21]]) out.push(ISO.wbox(P, [x - 3, x + 3], [y, y + 2], [z, z + 16], "hi"), D([K.iso([x, y + 2.05, z + 3], P)], { size: 1.5, tone: "hi" }));
    return out.join("");
  }
  function outdoorSvg(P) {
    const out = [];
    for (const x of [OU.x + 6, OU.x + OU.w - 12]) out.push(ISO.wbox(P, [x, x + 6], [OU.y + 2, OU.y + OU.d - 2], [3, OUZ[0]], "mid"));
    out.push(S(K.slabOf(OU, OUZ[0], OUZ[1] - OUZ[0], P, 2, 0.8), { tone: "hi", inner: L(K.sideSeam(OU, OUZ[1] - 4, P, 2), { tone: "faint" }) }));
    const louvres = []; for (let x = OU.x + 6; x < OU.x + OU.w - 4; x += 4) louvres.push(K.lineOnTop([x, OU.y], [x, OU.y + OU.d], OUZ[1], P));
    out.push(L(louvres.join(""), { tone: "faint" }));
    // the fan opening: a dark round hole in the front face, the grille rings and spokes over the turning blades
    const fy = OU.y + OU.d + 0.05, Ff = yAx([FAN[0], 0, FAN[2]]);
    out.push(`<path d="${G.circleOf(Ff, fy, FR, P)}" fill="#5d636a" stroke="#2f343a" stroke-width="0.8"/>`);
    // the service bay: panel off, the compressor and its pipes in a dark recess
    const bay = [[-62, fy, 8], [-44, fy, 8], [-44, fy, 58], [-62, fy, 58]];
    out.push(`<path d="${K.pathOf(bay.map((p) => K.iso(p, P)), true)}" fill="#6b7178" stroke="#2f343a" stroke-width="0.8"/>`);
    return out.join("");
  }
  function bayInsideSvg(P) {
    const Fc = zAx([-53, -6, 0]), out = [ISO.tinted(ISO.T.plastic, S(G.solidOf([[9, 6], [11, 8, 1], [14, 8.6, 1], [34, 8.6, 1], [37, 8, 1], [39, 6, 1], [40, 0]], Fc, P), { tone: "hi" }))];
    out.push(ISO.tinted(ISO.T.copper, S(G.disc(40, 46, 1.4, Fc, P), { tone: "hi" }) + S(G.sphereOf([-53, -6, 47.5], 2, P), { tone: "hi" }) + S(G.disc(0, 9, 1.4, xAx([-53, -6, 47.5]), P), { tone: "hi" })));
    out.push(ISO.wbox(P, [-58, -48], [-6, 4], [10, 12], "mid"));
    return named("compressor", out.join(""));
  }
  const fanSvg = (P, a) => {
    const fy = OU.y + OU.d - 1.5, out = [];
    for (let i = 0; i < 3; i++) {
      const pts = [];
      for (let j = 0; j <= 8; j++) { const r = 4 + (14 * j) / 8, ph = a + (i * 2 * Math.PI) / 3 + 0.5 * (j / 8); pts.push([FAN[0] + r * Math.cos(ph - 0.25), FAN[2] + r * Math.sin(ph - 0.25)]); }
      for (let j = 8; j >= 0; j--) { const r = 4 + (14 * j) / 8, ph = a + (i * 2 * Math.PI) / 3 + 0.5 * (j / 8) + 0.55 - 0.25 * (j / 8); pts.push([FAN[0] + r * Math.cos(ph), FAN[2] + r * Math.sin(ph)]); }
      out.push(`<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, fy, z], P)), true)}" fill="#c7ccd2" stroke="#2f343a" stroke-width="0.6"/>`);
    }
    out.push(S(G.disc(-1.5, 0, 4, yAx([FAN[0], fy + 1.5, FAN[2]]), P), { tone: "mid" }));
    return out.join("");
  };
  function grilleSvg(P) {
    const Ff = yAx([FAN[0], 0, FAN[2]]), fy = OU.y + OU.d + 0.6;
    return L([6, 10.5, 15, 19.5].map((r) => G.circleOf(Ff, fy, r, P)).join("") + G.spokesOf(Ff, fy, 6, 19.5, 8, P, { phase: Math.PI / 8 }), { tone: "mid" }) + S(G.disc(fy - 0.6, fy + 0.4, 2.4, Ff, P), { tone: "hi" });
  }
  function indoorSvg(P) {
    const out = [S(K.slabOf(IU, IUZ[0], IUZ[1] - IUZ[0], P, 4, 1), { tone: "hi", inner: L(K.sideSeam(IU, IUZ[0] + 6, P, 4), { tone: "faint" }) })];
    out.push(ISO.box((u, w, th) => [u, IU.y + IU.d - 1 + w * 0.6 + th * 0.8, IUZ[0] + 1 - w * 0.8 + th * 0.6], P, [IU.x + 6, IU.x + IU.w - 6], [0, 6], [0, 0.8], "hi"));
    out.push(D([K.iso([IU.x + IU.w - 8, IU.y + IU.d, IUZ[0] + 12], P)], { size: 1.3, tone: "hi" }));
    const slots = []; for (let x = IU.x + 8; x < IU.x + IU.w - 6; x += 4) slots.push(K.lineOnTop([x, IU.y + 1], [x, IU.y + IU.d - 1], IUZ[1], P));
    out.push(L(slots.join(""), { tone: "faint" }), L(K.planOutline({ x: IU.x + 4, y: IU.y + 1, w: IU.w - 8, d: IU.d - 2, r: 2 }, IUZ[1], P, 2), { tone: "lo" }));
    return named("indoor", out.join(""));
  }
  // The expansion valve on the liquid line by the outdoor unit, and the two service valves with their caps.
  function valveSvg(P) {
    const x = -30, F = xAx([0, -12, 9]), out = [ISO.tinted(ISO.T.brass, S(G.solidOf([[x - 4, 1.4], [x - 4, 2.6], [x - 2, 3.4, 1], [x + 2, 3.4, 1], [x + 4, 2.6], [x + 4, 1.4]], F, P), { tone: "hi" }) + S(K.cylinder(x, -12, 1.6, 12, 5, P, 16), { tone: "hi" }))];
    for (const [y, z] of [[-4, 14], [-12, 9]]) out.push(ISO.tinted(ISO.T.brass, S(G.disc(0, 4, 3, xAx([OU.x + OU.w, y, z]), P), { tone: "hi" }) + S(K.cylinder(OU.x + OU.w + 2, y, 1.6, z + 2.6, 2.4, P, 14), { tone: "hi" })));
    return named("valve", out.join(""));
  }
  const pathOf = (P, pts) => K.pathOf(pts.map((p) => K.iso(p, P)));
  const style = `<style>.hp-flow path{opacity:0;transition:opacity .5s;stroke-linecap:round}.hp-flow[data-on="1"] path{opacity:1;animation:hp-flow 1s linear infinite}.hp-flow path.back{animation-direction:reverse}@keyframes hp-flow{to{stroke-dashoffset:-24}}.hp-air path{opacity:0;transition:opacity 1s}.hp-air[data-on="1"] path{opacity:.85;animation:hp-flow 1.4s linear infinite}@media (prefers-reduced-motion:reduce){.hp-flow path,.hp-air path{animation:none}}</style>`;

  ISO.add({
    name: "heatpump", title: "Heat pump", compare: "heatpump 480 270 500",
    about: "An air-source heat pump: the outdoor unit's fan and compressor, refrigerant lines through the wall, the indoor unit blowing warm air; 1 kW of electricity delivers about 3 kW of heat.",
    line: "heatpump cx cy width on=1 lab=1 lit=outdoor|indoor|compressor|valve|pipes",
    demo: { line: "heatpump 480 270 500", script: [{ set: { on: 1 }, hold: 3.5 }, { set: { lit: "compressor" }, hold: 2 }, { set: { lit: "valve" }, hold: 2 }, { set: { on: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.98;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -6, 0), [-8, -50, 112], [124, -50, 112], [-8, 30, 112]], cx, cy, W, H, { azimuth: 64, elevation: 24 }, parent);
      const s = { on: o.on === "1", w: o.on === "1" ? 1 : 0, a: 0 };
      const air = [0, 1, 2].map((i) => { const x = IU.x + 16 + i * 18, pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([x + u * 10, -24 + u * 30, IUZ[0] - 2 - u * 34 + Math.sin(u * 6 + i) * 2]); } return pts; });
      const words = !lab ? "" : [
        ISO.word(K.iso([OU.x + OU.w / 2, OU.y, OUZ[1]], P), "outdoor unit", "#555", { size: 15, dy: -12 }),
        ISO.word(K.iso([IU.x + IU.w / 2, IU.y, IUZ[1]], P), "indoor unit", "#555", { size: 15, dy: -10 }),
        ISO.word(K.iso([-53, OU.y + OU.d, 8], P), "compressor", "#555", { size: 13, dy: 18 }),
        ISO.word(K.iso([-30, -12, 9], P), "expansion valve", "#555", { size: 13, dy: 30, anchor: "start" }),
        ISO.word(K.iso([OU.x, OU.y + OU.d, 20], P), "5 °C outside air", "#2b6cc4", { size: 13, anchor: "end" }),
        ISO.word(K.iso([112, -40, 74], P), "21 °C inside", "#c0392b", { size: 13, dy: -6 }),
      ].join("");
      g.innerHTML = style + `<g>${roomSvg(P)}</g><g data-name="pipes">${route(P, GAS.slice(0, 4), 3, { tone: "hi" }, 3.6)}${route(P, LIQ.slice(0, 4), 1.5, { tone: "hi" }, 2)}</g>` +
        `<g data-name="outdoor">${outdoorSvg(P)}<g data-part="fan"></g>${grilleSvg(P)}</g>${bayInsideSvg(P)}${valveSvg(P)}` +
        `<g data-name="pipes">${route(P, GAS.slice(2), 3, { tone: "hi" }, 3.6)}${ISO.tinted(ISO.T.copper, route(P, LIQ.slice(2), 1.5, { tone: "hi" }, 2))}</g>${indoorSvg(P)}` +
        `<g class="hp-flow" data-part="flow"><path d="${pathOf(P, GAS.map(([x, y, z]) => [x, y + 2, z + 2.2]))}" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 8"/><path class="back" d="${pathOf(P, LIQ.map(([x, y, z]) => [x, y + 1, z + 1.2]))}" fill="none" stroke="#2b6cc4" stroke-width="1.2" stroke-dasharray="3 9"/></g>` +
        `<g class="hp-air" data-part="air">${air.map((pts) => `<path d="${pathOf(P, pts)}" fill="none" stroke="#e8743b" stroke-width="1.6" stroke-dasharray="6 6" stroke-linecap="round"/>`).join("")}</g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.fan, s.a.toFixed(3), () => fanSvg(P, s.a));
        w.attr(el.flow, "data-on", s.w > 0.5 ? "1" : "0"); w.attr(el.air, "data-on", s.w > 0.5 ? "1" : "0");
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = !!+p.on; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, s.on ? 0.6 : 0.9, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.a -= s.w * 1.4 * Math.PI * 2 * dt;
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => s.w < 0.05 ? "off · 5 °C outside, 21 °C inside" :
        `heating · ${(KW * s.w).toFixed(1)} kW of electricity runs the compressor · ${((COP - 1) * KW * s.w).toFixed(1)} kW taken from the 5 °C outside air · ${(COP * KW * s.w).toFixed(1)} kW of heat delivered indoors · COP = heat out ÷ electricity in ≈ ${COP}`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
