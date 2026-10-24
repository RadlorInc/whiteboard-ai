// "pressure cx cy width k=depth|barometer level=28 p=101.3 lab=1 lit=…" — pressure in a liquid, two set-ups.
// k=depth: a tall can on a stand, kept full by a tap, with three spouts at 5, 13 and 21 cm below the surface. Water
// leaves each at v = √(2gh) (Torricelli) and falls into a tray 30 cm below the can, landing 2√(h·y) away (y = height
// above the tray), so the deeper the hole the faster and further its jet. set({ open: 1 }) opens the spouts,
// set({ level: cm }) lets the water fall to that level (tap off) or refills it.
// k=barometer: Torricelli's mercury barometer, a 90 cm tube upended in a dish of mercury beside a scale: the air holds
// up a column h = p ÷ ρg (760 mm at 101.3 kPa) with a vacuum above it. set({ p: kPa }) changes the air pressure.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CM = 2, g9 = 9.81, CR = 20, ZB = 60, CH = 60, HOLES = [23, 15, 7], WATER = "#3d8fd6";        // can radius, bottom, height; hole heights (cm)
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const stroke = (P, pts, color, w, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

  // ── depth: can, stand, tap, tray
  const DB = { x: -64, y: -52, w: 236, d: 104, r: 7 }, TRAY = { x: 14, y: -22, w: 150, d: 44, r: 3 };
  function depthBack(P) {
    const out = [ISO.baseboard(P, DB), ISO.plate(P, { x: -56, y: 30, w: 36, d: 12, r: 1 })];
    // Tray: floor, water film, back and end walls (the front wall is drawn over the jets).
    out.push(`<g data-name="tray">`, S(K.slabOf(TRAY, 0, 1.2, P, 3), { tone: "mid" }), ISO.wbox(P, [TRAY.x, TRAY.x + TRAY.w], [TRAY.y, TRAY.y + 1.6], [1.2, 7]), ISO.wbox(P, [TRAY.x, TRAY.x + 1.6], [TRAY.y, TRAY.y + TRAY.d], [1.2, 7]), ISO.wbox(P, [TRAY.x + TRAY.w - 1.6, TRAY.x + TRAY.w], [TRAY.y, TRAY.y + TRAY.d], [1.2, 7]));
    out.push(`<path d="${K.pathOf([[TRAY.x + 1.6, TRAY.y + 1.6], [TRAY.x + TRAY.w - 1.6, TRAY.y + 1.6], [TRAY.x + TRAY.w - 1.6, TRAY.y + TRAY.d - 1.6], [TRAY.x + 1.6, TRAY.y + TRAY.d - 1.6]].map(([x, y]) => K.iso([x, y, 2.4], P)), true)}" fill="#cfe4f7" stroke="none"/>`, `</g>`);
    // Riser pipe and arm with the tap over the can.
    out.push(`<g data-name="tap">`, S(K.cylinder(-44, -34, 6, 0, 3, P, 24, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.steel, S(K.cylinder(-44, -34, 2.6, 3, 146, P, 18), { tone: "hi", crease: "none" })));
    const aF = G.frameAlong([-44, -34, 146], [44 / Math.hypot(44, 30), 30 / Math.hypot(44, 30), 0]);
    out.push(ISO.tinted(ISO.T.steel, S(G.sphereOf([-44, -34, 146], 3.6, P), { tone: "hi" }) + S(G.disc(0, Math.hypot(44, 30) - 4, 2.6, aF, P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [-6, 6], [-9, 1], [140, 152], "hi") + S(K.cylinder(0, -4, 2, 134, 6, P, 16), { tone: "hi" }) + S(K.cylinder(0, -4, 1.2, 152, 5, P, 12), { tone: "hi" })));
    out.push(`</g>`);
    // Stand: four legs, two rails, a top plate.
    out.push(`<g data-name="stand">`);
    const legs = [[-24, -24], [24, -24], [-24, 24], [24, 24]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
    for (const [x, y] of legs) out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x - 3, x + 3], [y - 3, y + 3], [0, ZB - 4], "mid")));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-27, 27], [-27, 27], [ZB - 4, ZB], "mid") + ISO.wbox(P, [-21, 21], [21, 24], [18, 23], "mid")), `</g>`);
    // The can: body with its seams and rim, and the sight tube with its cm scale on the side that faces you.
    out.push(`<g data-name="can">`, ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, CR, ZB, CH, P, 64, 0), { tone: "hi", inner: L(K.sideArc(0, 0, CR, ZB + 4, P, 48) + K.sideArc(0, 0, CR, ZB + CH - 4, P, 48), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(ZB + CH - 1, ZB + CH + 1.2, CR - 1, CR + 1, zAx([0, 0, 0]), P), { tone: "hi" })));
    for (const h of HOLES) out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 3, 1.6, xAx([CR - 0.6, 0, ZB + h * CM]), P), { tone: "hi" })));
    out.push(`</g>`);
    return out.join("");
  }
  function sightSvg(P, level) {
    const rim = (r, z) => K.pathOf(Array.from({ length: 48 }, (_, k) => K.iso([Math.cos((k / 48) * 2 * Math.PI) * r, Math.sin((k / 48) * 2 * Math.PI) * r, z], P)), true);
    const top = `<path d="${rim(CR - 1, ZB + CH)}" fill="#5d6168" stroke="#3c3f45" stroke-width="0.5"/>` + (level >= 26 ? `<path d="${rim(CR - 1.4, ZB + level * CM)}" fill="#9ccbf2" stroke="#1f5f9f" stroke-width="0.5"/>` : "");
    const tv = K.towardViewer(P), a = Math.atan2(tv[1], tv[0]) + 0.55, x = Math.cos(a) * (CR + 4), y = Math.sin(a) * (CR + 4), out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 4.4, 1.2, G.frameAlong([Math.cos(a) * CR, Math.sin(a) * CR, ZB + 3], [Math.cos(a), Math.sin(a), 0]), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.blue, S(K.cylinder(x, y, 1.1, ZB + 1.6, level * CM - 1.6 + 0.01, P, 12), { tone: "hi", crease: "none" })));
    out.push(`<g class="pr-glass" style="${ISO.T.glass}">${S(K.cylinder(x, y, 1.8, ZB + 1.6, CH - 3, P, 14), { tone: "hi" })}</g>`, S(K.cylinder(x, y, 2.4, ZB + CH - 1.6, 1.6, P, 14), { tone: "mid" }), S(K.cylinder(x, y, 2.4, ZB, 1.6, P, 14), { tone: "mid" }));
    return top + out.join("");
  }
  // One jet: from the spout, falling under gravity; `reach` (0–1) is how far its front has got since opening.
  function jet(P, h, level, reach) {
    const depth = level - h, y0 = ZB / CM + h;                    // cm
    if (depth <= 0.2 || reach < 0.01) return { svg: "", x: 0, depth: Math.max(0, depth) };
    const pts = [];
    for (let i = 0; i <= 24; i++) { const drop = (i / 24) * y0 * reach; pts.push([CR + 3 + 2 * Math.sqrt(depth * drop) * CM, 0, (y0 - drop) * CM]); }
    const land = CR + 3 + 2 * Math.sqrt(depth * y0) * CM;
    let svg = stroke(P, pts, "#1f5f9f", 3.2) + stroke(P, pts, "#8cc4f2", 1.8);
    if (reach > 0.98) { const c = K.iso([land, 0, 2.4], P), rr = K.screenRise(1, P) * 3; svg += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rr * 1.6}" ry="${rr * 0.7}" fill="none" stroke="#1f5f9f" stroke-width="0.8"/>`; }
    return { svg, x: land, depth };
  }

  // ── barometer
  const BB = { x: -70, y: -48, w: 140, d: 96, r: 7 }, HG = 13595, TUBE = 90, DISH = 10;
  const colOf = (kPa) => (kPa * 1000) / (HG * g9) * 100;                 // cm of mercury
  function barometerSvg(P, lab) {
    const out = [ISO.baseboard(P, BB), ISO.plate(P, { x: 20, y: 30, w: 36, d: 12, r: 1 })];
    // Stand rod and clamp behind; the scale board standing beside the tube, zero at the mercury surface.
    out.push(`<g data-name="stand">`, ISO.wbox(P, [-60, -26], [-40, -14], [0, 4], "mid"), S(K.cylinder(-44, -28, 2.4, 4, 192, P, 18), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [-49, -39], [-33, -23], [96, 106], "mid"), ISO.wbox(P, [-40, -3], [-2, 2], [99, 103], "mid"), ISO.wbox(P, [-4, 4], [-6, -3], [96, 106], "mid"), `</g>`);
    out.push(`<g data-name="scale">`, ISO.wbox(P, [10, 30], [-8, 4], [0, 4], "mid"), ISO.tinted(ISO.T.wood, ISO.wbox(P, [14, 24], [-3, 0], [4, DISH + TUBE * CM + 4], "mid")));
    const minor = [], major = [];
    for (let c = 0; c <= TUBE; c++) { const z = DISH + 2 + c * CM; (c % 10 ? minor : major).push(K.segment([14, 0.05, z], [14 + (c % 10 ? 2 : 4), 0.05, z], P)); }
    out.push(ISO.tinted(ISO.T.wood, L(minor.join(""), { tone: "lo", free: "end" }) + L(major.join(""), { tone: "mid", free: "end" })));
    for (let c = 10; c <= TUBE; c += 10) out.push(ISO.word(K.iso([19, 0.05, DISH + 2 + c * CM], P), String(c), "#7a5a2e", { size: 8, anchor: "start", dy: 3 }));
    out.push(`</g>`);
    // The dish of mercury.
    const F = zAx([0, 0, 0]);
    out.push(`<g data-name="dish">`, S(G.solidOf([[0, 26], [DISH + 2, 28]], F, P), { tone: "mid" }), ISO.tinted(ISO.T.steel, S(G.disc(DISH + 2 - 0.2, DISH + 2, 26.5, F, P), { tone: "hi" })), `</g>`);
    return out.join("");
  }
  function tubeSvg(P, col) {
    const F = zAx([0, 0, 0]), top = DISH + col * CM + 2, out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[DISH - 6, 2.2], [top - 1, 2.2], [top, 1.6, 1], [top + 0.8, 0]], F, P), { tone: "hi" })));
    out.push(`<g class="pr-glass" style="${ISO.T.glass}">${S(G.solidOf([[DISH - 6, 3.4], [DISH + 2 + 88 * CM, 3.4], [DISH + 4 + 88 * CM, 2.4, 1], [DISH + 5.4 + 88 * CM, 0]], F, P), { tone: "hi" })}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "pressure", title: "Pressure in liquids", compare: "pressure 480 290 400 k=depth",
    about: "A can kept full by a tap with spouts at three depths: water leaves at √(2gh), so the deeper jets go faster and further; or Torricelli's mercury barometer.",
    line: "pressure cx cy width k=depth|barometer level=28 p=101.3 lab=1 lit=can|tray|tap|stand|dish|scale",
    demo: { line: "pressure 480 270 400 k=depth", script: [{ set: { open: 1 }, hold: "settle" }, { set: { level: 16 }, hold: "settle" }, { set: { level: 28 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", baro = o.k === "barometer";
      const W = size * (baro ? 0.9 : 1.45), H = size * 1.05;
      if (baro) {
        const { P, g } = ISO.frame([...K.boxCorners(BB, -12, 0), [0, 0, DISH + TUBE * CM + 4], [-44, -28, 196]], cx, cy, W, H, { azimuth: 62, elevation: 16 }, parent);
        const s = { p: ISO.clamp(ISO.num(o, "p", 101.3), 90, 106) }; s.pT = s.p;
        const style = `<style>.pr-glass .iso-fill{fill-opacity:.15}.pr-glass .iso-shade,.pr-glass .iso-top{opacity:.3}</style>`;
        g.innerHTML = style + `<g>${barometerSvg(P, lab)}</g><g data-part="tube" data-name="tube"></g><g data-part="words"></g>`;
        const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
        let lit = o.lit || "";
        const draw = () => {
          const col = colOf(s.p), key = col.toFixed(2);
          w.rebuild(el.tube, key, () => tubeSvg(P, col));
          w.rebuild(el.words, lab ? key : "", () => !lab ? "" :
            ISO.word(K.iso([-4, 0, DISH + 2 + col * CM + (88 - col) * CM * 0.5], P), "vacuum", "#777", { size: 13, anchor: "end" }) + ISO.word(K.iso([-4, 0, DISH + 2 + col * CM], P), `${(col * 10).toFixed(0)} mm of mercury`, "#c0392b", { size: 14, anchor: "end", dy: 4 }) +
            ISO.word(K.iso([-28, 28, DISH], P), "mercury", "#555", { size: 13, dy: 18 }) + ISO.word(K.iso([-26, 20, DISH + 2], P), "air pushes down", TXT.blue, { size: 13, anchor: "end", dy: -6 }));
          const parts = [...g.querySelectorAll("[data-name]")];
          w.light(parts, parts.filter((p) => p.dataset.name === lit));
        };
        g.set = (p) => { if (p.p !== undefined) s.pT = ISO.clamp(+p.p, 90, 106); if (p.lit) lit = p.lit; };
        g.update = (dt) => { s.p = ISO.follow(s.p, s.pT, dt, 0.6, ISO.still()); draw(); return s.p !== s.pT; };
        g.readout = () => `air pressure ${s.p.toFixed(1)} kPa holds up h = p ÷ ρg = ${(colOf(s.p) * 10).toFixed(0)} mm of mercury · vacuum above the column`;
        draw();
        if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
        return g;
      }
      const { P, g } = ISO.frame([...K.boxCorners(DB, -12, 0), [-44, -34, 160], [0, 0, 158]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const s = { level: ISO.clamp(ISO.num(o, "level", 28), 4, 29), open: 0, openT: 0, tap: 1 }; s.levelT = s.level;
      const style = `<style>.pr-glass .iso-fill{fill-opacity:.15}.pr-glass .iso-shade,.pr-glass .iso-top{opacity:.3}</style>`;
      g.innerHTML = style + `<g>${depthBack(P)}</g><g data-part="sight"></g><g data-part="stream"></g><g data-part="jets"></g><g data-name="tray">${ISO.wbox(P, [TRAY.x, TRAY.x + TRAY.w], [TRAY.y + TRAY.d - 1.6, TRAY.y + TRAY.d], [1.2, 7])}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "can", jets = [];
      const draw = () => {
        const key = `${s.level.toFixed(2)} ${s.open.toFixed(3)}`;
        jets = HOLES.map((h) => jet(P, h, s.level, s.open));
        w.rebuild(el.sight, s.level.toFixed(2), () => sightSvg(P, s.level));
        w.rebuild(el.stream, String(s.tap), () => (s.tap ? stroke(P, [[0, -4, 134], [0, -4, ZB + CH + 1.2]], "#1f5f9f", 2.6) + stroke(P, [[0, -4, 134], [0, -4, ZB + CH + 1.2]], "#8cc4f2", 1.4) : ""));
        w.rebuild(el.jets, key, () => jets.map((j) => j.svg).join(""));
        w.rebuild(el.words, lab ? key : "", () => {
          if (!lab) return "";
          const out = [ISO.word(K.iso([6, -4, 146], P), s.tap ? "tap keeps it full" : "tap off", "#555", { size: 13, anchor: "start", dy: -2 })];
          HOLES.forEach((h, i) => { if (jets[i].depth > 0.2 && s.open > 0.98) out.push(ISO.word(K.iso([CR + 4, 0, ZB + h * CM], P), `${jets[i].depth.toFixed(0)} cm deep: ${Math.sqrt(2 * g9 * jets[i].depth / 100).toFixed(1)} m/s`, "#1f4f8f", { size: 12, anchor: "start", dy: -5 })); });
          out.push(ISO.word(K.iso([TRAY.x + TRAY.w / 2, TRAY.y + TRAY.d, 0], P), "deeper: faster, further", TXT.blue, { size: 14, dy: 22 }));
          return out.join("");
        });
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.open !== undefined) s.openT = +p.open ? 1 : 0;
        if (p.level !== undefined) { s.levelT = ISO.clamp(+p.level, 4, 28); s.tap = s.levelT >= s.level ? 1 : 0; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.open = calm ? s.openT : Math.min(1, s.open + (s.openT ? dt / 0.9 : -1));
        s.open = Math.max(0, s.open);
        s.level = ISO.follow(s.level, s.levelT, dt, 1.2, calm);
        if (s.level === s.levelT && s.levelT >= 28) s.tap = 1;
        draw();
        return s.open !== s.openT || s.level !== s.levelT;
      };
      g.readout = () => {
        const parts = HOLES.map((h) => { const d = s.level - h; return d > 0.2 ? `${d.toFixed(0)} cm → ${Math.sqrt((2 * g9 * d) / 100).toFixed(2)} m/s, lands ${(2 * Math.sqrt(d * (ZB / CM + h))).toFixed(0)} cm out` : "dry"; });
        return `water ${s.level.toFixed(0)} cm deep · v = √(2gh): ${s.open > 0.5 ? parts.join(" · ") : "spouts closed"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
