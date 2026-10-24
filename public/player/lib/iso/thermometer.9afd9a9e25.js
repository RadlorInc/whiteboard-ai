// "thermometer cx cy height level=0.6 temp=… lab=1 lit=…" — a lab thermometer in a beaker of water on a tripod.
// A liquid-in-glass thermometer (−10 to 110 °C) hangs from a retort stand into 250 g of water on a gauze over a Bunsen
// burner. The burner puts about 400 W into the water (dT/dt = P ÷ m·c ≈ 0.38 °C/s, less what the beaker loses), so time
// runs 40× here; at 100 °C the water boils and the reading stays at 100 while it does. level= is the starting reading
// as a fraction of 0–100 °C. set({ temp }) heats to that temperature (100 = boil), set({ heat: 0 }) puts the flame out.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -112, y: -60, w: 214, d: 120, r: 7 }, ROOM = 20, FAST = 40, M = 0.25, C = 4186, PWR = 400, LOSS = 1 / 900;
  const TH = [8, -4], ZB = 92, Z0 = 104, KT = 0.85, GZ = 72, WL = 118;   // thermometer axis, bulb centre, −10 °C mark, units per °C, gauze, water
  const RED = ISO.tint("#f0644f", ["#a8241a", "#c0301f", "#d63e2a", "#e5503b"], "#6e1a12");
  const zOf = (T) => Z0 + (T + 10) * KT;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const rod = (P, a, b, r, tone = "mid") => { const d = b.map((v, i) => v - a[i]), len = Math.hypot(...d); return S(G.disc(0, len, r, G.frameAlong(a, d.map((v) => v / len)), P), { tone }); };

  function rigSvg(P, part) {
    const out = [];
    if (part === "back") {
      out.push(ISO.baseboard(P, BOARD), ISO.plate(P, { x: 52, y: 40, w: 40, d: 14, r: 1.2 }));
      // Retort stand: base plate, rod, boss and the arm reaching to the thermometer clamp.
      out.push(`<g data-name="stand">`, ISO.wbox(P, [-104, -56], [-44, 4], [0, 4], "mid"), D([[-100, -40], [-60, -40], [-100, 0], [-60, 0]].map(([x, y]) => K.iso([x, y, 4], P)), { size: 0.5 }));
      out.push(S(K.cylinder(-84, -20, 2.4, 4, 206, P, 18), { tone: "mid", crease: "none" }), ISO.wbox(P, [-89, -79], [-25, -15], [189, 201], "mid"));
      out.push(rod(P, [-79, -20, 195], [TH[0] - 6, TH[1], 195], 1.6), ISO.wbox(P, [TH[0] - 7, TH[0] - 4], [TH[1] - 5, TH[1] + 5], [190, 200], "mid"), `</g>`);
      // Gas tap and hose to the burner.
      out.push(ISO.wbox(P, [64, 84], [-40, -24], [0, 10], "mid"), S(G.disc(0, 8, 2.4, G.frameOf([74, -24, 6], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
      const hose = [[74, -16, 6], [60, -14, 2.5], [20, -6, 2.5], [12, -2, 4]];
      out.push(`<path d="${K.pathOf(hose.map((p) => K.iso(p, P)))}" fill="none" stroke="#2a2b2f" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(hose.map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
      // Bunsen burner: heavy base, barrel with the air-hole collar, chimney top.
      out.push(`<g data-name="burner">`, S(K.cylinder(0, 0, 13, 0, 4, P, 40, 0.5), { tone: "mid" }), S(G.disc(0, 6, 2.2, G.frameOf([10, 0, 4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
      out.push(S(K.cylinder(0, 0, 4.2, 4, 34, P, 24), { tone: "mid", crease: "none" }), S(K.cylinder(0, 0, 5.4, 10, 7, P, 24, 0.3), { tone: "mid" }), D([K.iso([5.4 * Math.cos(1.1), 5.4 * Math.sin(1.1), 13.5], P)], { size: 1.4, tone: "lo" }));
      out.push(S(K.cylinder(0, 0, 4.8, 36, 3, P, 24), { tone: "mid" }), `</g>`);
    }
    if (part === "tripod") {
      // Tripod: ring and three legs, then the gauze with its wire grid and ceramic centre.
      const feet = [90, 210, 330].map((a) => [Math.cos((a * Math.PI) / 180) * 42, Math.sin((a * Math.PI) / 180) * 42]);
      const tops = [90, 210, 330].map((a) => [Math.cos((a * Math.PI) / 180) * 29, Math.sin((a * Math.PI) / 180) * 29]);
      out.push(`<g data-name="tripod">`);
      feet.map((f, k) => ({ f, t: tops[k], d: K.depthOf([f[0], f[1], 0], P) })).sort((a, b) => a.d - b.d).forEach(({ f, t }) => out.push(rod(P, [f[0], f[1], 0], [t[0], t[1], GZ - 3], 1.8)));
      out.push(S(G.ringBand(GZ - 4, GZ - 1, 27, 31, zAx([0, 0, 0]), P), { tone: "mid" }));
      const G0 = { x: -36, y: -36, w: 72, d: 72, r: 1 }, grid = [];
      out.push(S(K.slabOf(G0, GZ - 1, 1, P, 2), { tone: "mid" }));
      for (let v = -30; v <= 30; v += 6) grid.push(K.lineOnTop([v, -36], [v, 36], GZ, P), K.lineOnTop([-36, v], [36, v], GZ, P));
      out.push(L(grid.join(""), { tone: "faint" }), S(K.cylinder(0, 0, 20, GZ, 0.3, P, 48), { tone: "hi", crease: "none" }), `</g>`);
    }
    return out.join("");
  }
  // The liquid column (rebuilt as it moves) and the glass with its printed scale (built once, drawn over it).
  const columnSvg = (P, T) => ISO.tinted(RED, S(G.sphereOf([TH[0], TH[1], ZB], 3.8, P), { tone: "hi" }) + S(K.cylinder(TH[0], TH[1], 1.7, ZB, zOf(T) - ZB, P, 12), { tone: "hi", crease: "none" }));
  function thermoSvg(P) {
    const [x, y] = TH, F = zAx([x, y, 0]), out = [];
    out.push(`<g class="th-glass" style="${ISO.T.glass}">${S(G.sphereOf([x, y, ZB], 5, P), { tone: "hi" })}${S(G.solidOf([[ZB + 2, 4], [zOf(118), 4], [zOf(118) + 2, 2.8, 1], [zOf(118) + 3.2, 0]], F, P), { tone: "hi" })}</g>`);
    // Scale printed on the stem: a rule up the stem, ticks every 2 °C off it (major every 10), numbers beside it.
    const tv = K.towardViewer(P), face = Math.atan2(tv[1], tv[0]), at = (z, da) => [x + 4.05 * Math.cos(face + da), y + 4.05 * Math.sin(face + da), z];
    const minor = [], major = [];
    for (let c = -10; c <= 110; c += 2) (c % 10 ? minor : major).push(K.segment(at(zOf(c), -0.9), at(zOf(c), c % 10 ? -0.25 : 0.3), P));
    out.push(L(K.segment(at(zOf(-10), -0.9), at(zOf(110), -0.9), P), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    for (let c = 0; c <= 100; c += 20) { const q = K.iso([x, y, zOf(c)], P); out.push(ISO.word([q[0] + 9, q[1]], String(c), "#6b7078", { size: 10, anchor: "start", dy: 3 })); }
    return out.join("");
  }
  function beakerSvg(P, front) {
    const F = zAx([0, 0, 0]);
    if (!front) return `<g class="th-water" style="${ISO.T.blue}">${S(G.solidOf([[GZ + 0.8, 25.4], [WL, 25.4]], F, P), { tone: "hi" })}</g>`;
    const out = [`<g class="th-glass" data-name="beaker" style="${ISO.T.glass}">`, S(G.solidOf([[GZ, 26.6], [GZ + 58, 26.6]], F, P), { tone: "hi" }), S(G.ringBand(GZ + 58, GZ + 60, 25, 27.6, F, P), { tone: "hi" })];
    // Volume marks: printed short arcs on the front of the glass (they stand for printed text, so they may stop).
    const tv = K.towardViewer(P), face = Math.atan2(tv[1], tv[0]) - Math.PI / 2;
    for (let k = 1; k <= 4; k++) out.push(L(G.arcOf(F, GZ + k * 12, 26.7, P, { from: face - 0.75, to: face - (k % 2 ? 0.35 : 0.5), least: -1 }), { tone: "lo", free: true }));
    out.push(`<path d="${K.pathOf([[-18, 19.4, GZ + 20], [-18, 19.4, GZ + 50]].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`, `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "thermometer", title: "Lab thermometer (heating water)", compare: "thermometer 480 270 320 level=0.6",
    about: "A −10 to 110 °C thermometer in a beaker of water over a Bunsen burner: the column climbs as the water heats and stops at 100 °C while it boils.",
    line: "thermometer cx cy height level=0.6 temp=… lab=1 lit=thermometer|beaker|burner|tripod|stand",
    demo: { line: "thermometer 480 270 340 level=0.2", script: [{ set: { temp: 55 }, hold: "settle" }, { set: { temp: 100 }, hold: "settle" }, { set: {}, hold: 2 }, { set: { heat: 0 }, hold: 4 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.05, H = size * 1.0;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-84, -20, 212], [TH[0], TH[1], 214]], cx, cy, W, H, { azimuth: 58, elevation: 20 }, parent);
      const T0 = ISO.clamp(ISO.num(o, "temp", ISO.clamp(ISO.num(o, "level", 0.6), 0, 1) * 100), 0, 100);
      const s = { T: T0, read: T0, target: null, heat: 0, flame: 0, sim: 0, clock: 0 };
      const style = `<style>.th-glass .iso-fill{fill-opacity:.2}.th-glass .iso-shade,.th-glass .iso-top{opacity:.35}.th-water .iso-fill{fill-opacity:.55}.th-water .iso-shade,.th-water .iso-top{opacity:.6}</style>`;
      g.innerHTML = style + `<g>${rigSvg(P, "back")}</g><g data-part="flame"></g><g>${rigSvg(P, "tripod")}</g><g data-name="thermometer"><g data-part="thermo"></g>${thermoSvg(P)}</g><g>${beakerSvg(P, false)}</g><g data-part="bubbles"></g><g>${beakerSvg(P, true)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const base = K.iso([0, 0, 39], P), rise = K.screenRise(1, P), fx = ISO.flameFx(g, P, W, H, el.flame, [0, 0, 39], 24);
      const draw = () => {
        w.rebuild(el.thermo, s.read.toFixed(1), () => columnSvg(P, s.read));
        if (el.thermo._fresh) { el.thermo._fresh = false; el.thermo.parentNode._fresh = true; }
        if (fx) fx.flame(1, s.flame);
        else w.rebuild(el.flame, s.flame.toFixed(2), () => {
          if (s.flame < 0.02) return "";
          const h = 30 * s.flame * rise, wd = 5 * rise, [bx, by] = base;
          const cone = (hh, ww) => `M${bx - ww} ${by}C${bx - ww} ${by - hh * 0.45} ${bx - ww * 0.3} ${by - hh * 0.8} ${bx} ${by - hh}C${bx + ww * 0.3} ${by - hh * 0.8} ${bx + ww} ${by - hh * 0.45} ${bx + ww} ${by}Z`;
          return `<path d="${cone(h, wd)}" fill="#8fc3ff" fill-opacity=".55" stroke="#3d7fd1" stroke-width=".6"/><path d="${cone(h * 0.5, wd * 0.55)}" fill="#3d7fd1" fill-opacity=".75"/>`;
        });
        const boiling = s.T >= 99.95 && s.flame > 0.5;
        w.rebuild(el.bubbles, boiling ? (s.clock % 4).toFixed(2) : "", () => {
          if (!boiling) return "";
          const out = [];
          for (let k = 0; k < 14; k++) {
            const a = k * 2.4, r = 6 + ((k * 7) % 17), f = (s.clock * (0.7 + (k % 3) * 0.2) + k * 0.37) % 1, z = GZ + 3 + f * (WL - GZ - 4);
            const p = K.iso([Math.cos(a) * r, Math.sin(a) * r, z], P);
            out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(0.8 + f * 1.4).toFixed(2)}" fill="#fff" stroke="#1f4f8f" stroke-width=".4" opacity=".9"/>`);
          }
          return out.join("");
        });
        w.rebuild(el.words, lab ? (boiling ? "b" : "n") : "", () => !lab ? "" :
          ISO.word(K.iso([TH[0], TH[1], zOf(118) + 3], P), "thermometer (°C)", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([26, 26, GZ + 40], P), boiling ? "water boiling" : "water", "#1f4f8f", { size: 14, anchor: "start" }) +
          ISO.word(K.iso([0, 13, 0], P), "Bunsen burner", "#555", { size: 13, dy: 22 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.temp !== undefined) { s.target = ISO.clamp(+p.temp, 0, 100); s.heat = s.target > s.T ? 1 : 0; }
        if (p.heat !== undefined) { s.heat = +p.heat ? 1 : 0; s.target = s.heat ? 100 : null; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt, clock) => {
        s.clock = clock ?? s.clock + dt;
        const calm = ISO.still(), h = dt * FAST;
        s.flame = ISO.follow(s.flame, s.heat, dt, s.heat ? 0.35 : 0.08, calm);
        if (calm && s.target !== null) s.T = s.target;
        else for (let k = 0; k < 4; k++) s.T = Math.min(100, s.T + (h / 4) * ((PWR * s.flame) / (M * C) - LOSS * (s.T - ROOM)));
        if (s.heat) s.sim += h;
        if (s.target !== null && s.target < 100 && s.T >= s.target) { s.T = s.target; s.heat = 0; s.target = null; }
        s.read = calm ? s.T : s.read + (s.T - s.read) * (1 - Math.exp(-h / 4));   // the thermometer lags the water by a few seconds
        draw();
        const heating = s.heat && s.T < 99.95, settling = Math.abs(s.read - s.T) > 0.3 || Math.abs(s.flame - s.heat) > 0.01;
        return heating || settling;
      };
      g.readout = () => {
        const mins = Math.floor(s.sim / 60), secs = Math.round(s.sim % 60);
        const boil = s.T >= 99.95 && s.flame > 0.5;
        return `water ${s.T.toFixed(1)} °C · thermometer reads ${s.read.toFixed(0)} °C · heated ${mins} min ${secs} s (shown 40× faster)${boil ? " · boiling: the reading stays at 100 °C" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
