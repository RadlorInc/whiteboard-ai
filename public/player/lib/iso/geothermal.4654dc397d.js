// "geothermal cx cy width labels=1 pump=0|1" — a geothermal power plant as a museum cut-away model.
// A walnut plinth carries a deep block of ground cut open along its front: soil, layered sedimentary rock, hot granite
// cracked into a reservoir of fractures, and the glow of magma far below. Two cased wells go down through it: the
// injection well (cold water, blue) and the production well (hot water, red). On the surface: the wellheads, the
// separator, the turbine house cut open (turbine and generator), the cooling tower with its fan, and the injection
// pump closing the loop. Start the pump (pump=1): cold water goes down, soaks up the rock's heat in the cracks,
// comes up hot, flashes to steam that turns the turbine, and the tower breathes out vapour (WebGL puffs, SVG
// puffs without WebGL). The depth ruler and readout use a normal crust's ~30 °C per km. Vertical scale: 1 unit = 40 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -40, CUT = 0, ZB = -112, KM = 25;                 // block bottom; 25 units = 1 km of depth
  const PLINTH = { x: -108, y: -48, w: 216, d: 66, r: 4 };
  const XI = -70, XP = 60, ZW = -84;                           // injection and production wells, their foot
  const tempAt = (z) => 15 + (30 * -z) / KM;                   // °C at height z (z < 0 is depth)
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const LAYERS = [
    ["magma", M.rect(-100, 100, ZB, -98)],
    ["hotrock", [[-100, -98], [100, -98], [100, -58], [40, -54], [-20, -60], [-100, -56]]],
    ["rock", [[-100, -56], [-20, -60], [40, -54], [100, -58], [100, -26], [30, -22], [-40, -28], [-100, -24]]],
    ["clay", [[-100, -24], [-40, -28], [30, -22], [100, -26], [100, -12], [-100, -12]]],
    ["soil", M.rect(-100, 100, -12, -2)],
    ["topsoil", M.rect(-100, 100, -2, 0)],
  ];
  // the cracked reservoir between the wells' feet: zigzag fractures in the granite
  const CRACKS = [[[-66, -78], [-48, -82], [-30, -76], [-10, -84], [12, -78], [34, -85], [56, -80]], [[-64, -88], [-40, -90], [-18, -86], [6, -92], [28, -88], [54, -90]], [[-60, -70], [-36, -72], [-14, -68], [10, -73]]];

  function groundSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, ZB])}">${M.plinth(P, PLINTH)}</g>`];
    for (const [mat, pts] of LAYERS) out.push(M.sec(P, pts, Y0, CUT, mat, mat === "rock" ? M.grains(P, pts, CUT, 40, "#8d939a", 0.7, 4) : mat === "soil" ? M.grains(P, pts, CUT, 26, "#9a7a50", 0.5, 2) : ""));
    // the magma's glow fading up into the granite
    out.push(`<defs><linearGradient id="gt-glow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a2e" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></linearGradient></defs>`);
    out.push(face(P, M.rect(-100, 100, -98, -82), "url(#gt-glow)", "none", 0, CUT + 0.06));
    out.push(`<path d="${CRACKS.map((c) => K.pathOf(c.map(([x, z]) => K.iso([x, CUT + 0.1, z], P)))).join("")}" fill="none" stroke="#7a2a10" stroke-width="1" stroke-linejoin="round"/>`);
    // depth ruler down the cut face's right edge: a tick each km with its temperature
    const tk = [];
    for (let km = 1; km <= 4; km++) { const z = -km * KM; tk.push(K.pathOf([K.iso([100, CUT + 0.1, z], P), K.iso([94, CUT + 0.1, z], P)])); }
    out.push(`<path d="${tk.join("")}" stroke="#2b2b2b" stroke-width="1"/>`);
    return out.join("");
  }
  // a well in section: steel casing round the bore, from the surface down to its foot
  const wellSvg = (P, x, name) => M.named(name, face(P, [[x - 2.6, 0], [x + 2.6, 0], [x + 2.6, ZW], [x - 2.6, ZW]], "#5a6068", "#2f343a", 0.7) + face(P, [[x - 1.6, 0], [x + 1.6, 0], [x + 1.6, ZW + 1], [x - 1.6, ZW + 1]], "#d9dde1", "#2f343a", 0.4, CUT + 0.1));
  const boreSvg = (P, x, col, a) => face(P, [[x - 1.6, 0], [x + 1.6, 0], [x + 1.6, ZW + 1], [x - 1.6, ZW + 1]], `color-mix(in srgb,${col} ${Math.round(a * 100)}%,#d9dde1)`, "#2f343a", 0.4, CUT + 0.12);

  // the surface plant, back to front: turbine house (back wall, machine, walls and roof), tower, separator, wellheads
  const YM = -16;
  function plantSvg(P) {
    const out = [];
    const tint = M.tintOf("concrete");
    out.push(ISO.tinted(tint, ISO.wbox(P, [-14, 26], [Y0 + 2, Y0 + 5], [0, 26], "lo")));
    // the shaft runs through the turbine and generator casings (audit.mjs: "sunk", on purpose)
    const ax = (x) => G.frameOf([x, YM, 9], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 0.9], [30, 0.9], [30, 0]], ax(-10), P, { steps: 14 }), { tone: "mid" })));
    out.push(M.named("turbine", ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 2.4], [1.4, 4.4, 1], [6, 5.6, 1], [11, 5.6], [12, 3], [12, 0]], ax(10), P, { steps: 40 }), { tone: "hi" }))));
    out.push(M.named("generator", ISO.tinted(ISO.T.green, S(G.lathe([[0, 0], [0, 4], [0.5, 4.5, 1], [9.5, 4.5, 1], [10, 4], [10, 0]], ax(-9), P, { steps: 36 }), { tone: "hi" })) + ISO.tinted(ISO.T.green, ISO.wbox(P, [-8, 0], [YM - 4.5, YM + 4.5], [0, 5], "mid"))));
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [11, 21], [YM - 4, YM + 4], [0, 3.4], "mid")));
    out.push(M.sec(P, M.rect(-18, -14, 0, 26), Y0 + 2, CUT - 4, "concrete"), M.sec(P, M.rect(26, 30, 0, 26), Y0 + 2, CUT - 4, "concrete"), M.sec(P, M.rect(-19, 31, 26, 29), Y0 + 2, CUT - 4, "concrete"));
    // the cooling tower: a box with louvres on its sides and a fan stack on top
    const CT = { x: -50, y: -30, w: 22, d: 20 };
    out.push(M.named("cooling tower", ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [CT.x, CT.x + CT.w], [CT.y, CT.y + CT.d], [0, 20], "mid")) +
      `<path d="${[3, 6, 9, 12, 15].map((z) => K.pathOf([K.iso([CT.x, CT.y + CT.d + 0.05, z], P), K.iso([CT.x + CT.w, CT.y + CT.d + 0.05, z], P)])).join("")}" stroke="#8a8880" stroke-width=".7"/>` +
      ISO.tinted(M.tintOf("concrete"), S(G.lathe([[0, 0], [0, 7.5], [4, 6.6, 1], [6, 7.2], [6, 0]], M.Z([CT.x + 11, CT.y + 10, 20]), P, { steps: 40 }), { tone: "hi" })) +
      `<path d="${G.circleOf(M.Z([CT.x + 11, CT.y + 10, 20]), 6.02, 6.6, P, 40)}" fill="#4a4f56" stroke="#3c3f45" stroke-width=".6"/>`));
    // the separator: a tall vessel on legs by the production well
    out.push(M.named("separator", ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 3], [1.6, 4.4, 1], [3, 4.6], [17, 4.6], [18.4, 4.2, 1], [20, 2.6, 1], [20.6, 0]], M.Z([40, -14, 2]), P, { steps: 40 }), { tone: "hi" })) +
      [[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([dx, dy]) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [40 + dx - 0.5, 40 + dx + 0.5], [-14 + dy - 0.5, -14 + dy + 0.5], [0, 3], "mid"))).join("")));
    // injection pump on its plinth by the injection well
    out.push(M.named("pump", ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [XI - 6, XI + 8], [-14, -4], [0, 1.4], "mid")) + ISO.tinted(ISO.T.blue, S(G.lathe([[0, 0], [0, 3], [6, 3], [6, 0]], G.frameOf([XI - 4, -9, 4.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 28 }), { tone: "hi" }))));
    // wellheads: a flanged spool and a valve wheel on each
    for (const x of [XI, XP]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, -3, 2.6, 0, 1, P, 24), { tone: "mid" }) + S(K.cylinder(x, -3, 1.6, 1, 6, P, 20), { tone: "hi" }) + S(K.cylinder(x, -3, 2.4, 7, 1, P, 24), { tone: "mid" })),
      ISO.tinted(x === XI ? ISO.T.blue : ISO.T.red, S(G.disc(-0.3, 0.3, 2.2, G.frameOf([x + 1.6, -3, 4.5], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 20 }), { tone: "mid" })));
    return out.join("");
  }
  // the surface pipes: hot from the production well to the separator and the turbine; cold from the tower to the pump
  const HOT1 = [[XP, -3, 8], [XP, -3, 12], [44.6, -14, 12]], HOT2 = [[35.4, -14, 16], [24, -14, 16], [24, YM, 12.6], [22, YM, 12.6]];
  const COLD = [[-28, -14, 3], [XI + 6, -9, 3], [XI + 6, -9, 4.4], [XI + 2, -9, 4.4]], DOWN = [[XI, -3, 8], [XI, -3, 11], [XI - 4, -9, 11], [XI - 4, -9, 7.4]];
  const EXH = [[11, YM, 2], [-28, -20, 2]];
  function pipesSvg(P) {
    const H = { body: "#e9b0a6", ink: "#8f2a22", shine: "#f7d8d2" }, C = { body: "#bcd6ee", ink: "#285f98", shine: "#e3f0fa" };
    return M.pipe(P, HOT1, 1.3, H) + M.pipe(P, HOT2, 1.3, H) + M.pipe(P, EXH, 1.3, {}) + M.pipe(P, COLD, 1.2, C) + M.pipe(P, DOWN, 1.1, C);
  }
  // the vapour leaving the fan stack: up to 6 puffs [x, y, z, r, opacity]
  const TOP = [-39, -20, 22];
  const puffs = (t, a) => Array.from({ length: 6 }, (_, i) => { const f = (t * 0.22 + i / 6) % 1; return [TOP[0] + f * 10, TOP[1], TOP[2] + 3 + f * 34, 5 + f * 9, a * Math.sin(Math.PI * Math.min(1, f * 1.4)) * 0.85]; });

  ISO.add({
    name: "geothermal", title: "Geothermal power plant", compare: "geothermal 480 270 480",
    about: "A cut-away model of a geothermal plant: cold water pumped down one well is heated in cracked hot rock and comes up the other to drive a turbine.",
    line: "geothermal cx cy width labels=1 pump=0|1 lit=injection well|production well|separator|turbine|generator|cooling tower|pump",
    demo: { line: "geothermal 480 275 500 pump=0", script: [{ set: { pump: 1 }, hold: 7 }, { set: {}, hold: 2 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.05, H = size * 0.86;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, ZB - 13, ZB), [-100, Y0, 0], [100, CUT, 30], [TOP[0] + 12, TOP[1], 60]], cx, cy, W, H, { azimuth: 62, elevation: 24 }, parent);
      g.innerHTML = `<g>${groundSvg(P)}${wellSvg(P, XI, "injection well")}${wellSvg(P, XP, "production well")}</g><g data-part="bores"></g><g data-part="deep"></g><g>${plantSvg(P)}${pipesSvg(P)}</g><g data-part="flow"></g><g data-part="puffs"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const fx = ISO.puffsFx(g, P, W, H, el.puffs, 6, 1);
      const on0 = o.pump === "0" ? 0 : 1;
      const s = { on: on0, q: on0, ph: 0, t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.bores, s.q.toFixed(2), () => boreSvg(P, XI, "#7fb7ea", 0.3 + 0.7 * s.q) + boreSvg(P, XP, "#f08a6e", 0.3 + 0.7 * s.q));
        const fk = s.q > 0.02 ? `${(Math.round(s.ph * 2) / 2 % 24).toFixed(1)} ${s.q.toFixed(2)}` : "";
        w.rebuild(el.deep, fk, () => fk && (M.flow(P, [[XI, CUT + 0.2, -2], [XI, CUT + 0.2, ZW + 2]], s.ph, { amount: s.q, color: "#1f4f8f", gap: 12 }) +
          CRACKS.slice(0, 2).map((c) => M.flow(P, c.map(([x, z]) => [x, CUT + 0.2, z]), s.ph * 0.6, { amount: s.q, color: "#ffd27a", gap: 12, w: 1.4 })).join("") +
          M.flow(P, [[XP, CUT + 0.2, ZW + 2], [XP, CUT + 0.2, -2]], s.ph, { amount: s.q, color: "#a3271b", gap: 12 })));
        w.rebuild(el.flow, fk, () => fk && (M.flow(P, [...HOT1, ...HOT2], s.ph * 0.5, { amount: s.q, color: "#8f2a22", gap: 8, dash: 3, w: 1 }) + M.flow(P, [...COLD, ...DOWN.slice(2)], s.ph * 0.5, { amount: s.q, color: "#1f4f8f", gap: 8, dash: 3, w: 1 })));
        const list = puffs(s.t, s.q);
        if (fx) fx(s.q > 0.01 ? list : []);
        else w.rebuild(el.puffs, s.q > 0.03 ? (Math.round(s.t * 10) / 10).toFixed(1) + s.q.toFixed(2) : "", () => s.q <= 0.03 ? "" : list.map(([x, y, z, r, a]) => { const p = K.iso([x, y, z], P); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r * K.cameraOf(P).k).toFixed(1)}" fill="#f2f4f6" stroke="#c3c9cf" stroke-width=".8" opacity="${a.toFixed(2)}"/>`; }).join(""));
        w.rebuild(el.words, lab ? "w" : "", () => !lab ? "" : [
          M.label(P, [XI - 4, CUT, -40], "cold water down", "#1f4f8f", { anchor: "end" }), M.label(P, [XP + 4, CUT, -40], "hot water up", "#a3271b", { anchor: "start" }),
          M.label(P, [-6, CUT, -96], "hot rock", "#7a2a10"), M.label(P, [0, CUT, ZB + 4], "magma", "#7a1a0a"), M.label(P, [6, YM, 30], "turbine", "#33506f", { dy: -4 }),
          ...[1, 2, 3, 4].map((km) => M.label(P, [102, CUT, -km * KM], `${km} km · ${Math.round(tempAt(-km * KM))} °C`, "#2b2b2b", { anchor: "start", size: 12, dy: 4 }))].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.pump !== undefined) s.on = +p.pump ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.q = ISO.follow(s.q, s.on, dt, 1.2, calm); if (!s.on && s.q < 0.005) s.q = 0;
        s.t += dt;
        if (!calm) s.ph += dt * 16 * s.q;
        draw();
        return s.q > 0 || s.on > 0;
      };
      g.readout = () => {
        const Tb = tempAt(ZW), kg = 80 * s.q, MW = (kg * 4.18 * (Tb - 40) * 0.12) / 1000;
        return s.q < 0.01 ? `pump off · rock at ${(-ZW / KM).toFixed(1)} km is about ${Math.round(Tb)} °C (15 °C + 30 °C per km)`
          : `${kg.toFixed(0)} kg/s down at 40 °C, up at ${Math.round(Tb)} °C from ${(-ZW / KM).toFixed(1)} km · heat ${(kg * 4.18 * (Tb - 40) / 1000).toFixed(0)} MW · about 12% becomes electricity ≈ ${MW.toFixed(1)} MW`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
