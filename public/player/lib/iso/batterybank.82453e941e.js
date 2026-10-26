// "batterybank cx cy width mode=charge|discharge|idle soc=0-100 lab=1 lit=racks|container|inverter|transformer|pole |text"
// Grid battery storage on a concrete pad: two 20-foot containers of lithium-ion racks (the near one with its doors
// open on five racks of modules, each with a charge bar; the other closed, with its air-conditioning unit, because
// the cells like 20–25 °C), the cable tray to the inverter skid that turns the racks' DC into AC and back, the
// transformer that steps 690 V up to 11 kV, and the line out to a pole. In the middle of the day it charges from
// cheap solar power; in the evening peak it discharges back into the grid. The current runs the way the energy goes.
// set({ mode, soc, lit }). World units: 1 = 1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const PAD = { x: -15, y: -5.2, w: 32, d: 7.2, r: 0.6 }, CY = [-3.4, -1.0], CH = 2.6, PZ = 0.4, POLE = [15.4, -2];
  const BOX = ISO.tint("#eef3f7", ["#a9b8c6", "#b8c5d1", "#c7d2dc", "#d6dee6"], "#3e5468"), CAP = 2000, MW = 1000;
  const C1 = [-13.6, -7.4], C2 = [-6.8, -0.6];

  function containerSvg(P, [x0, x1], open) {
    const out = [ISO.tinted(BOX, ISO.wbox(P, [x0, x1], CY, [PZ, PZ + CH], "mid"))];
    // corrugation ribs down the near face, each ending on the top and bottom rails
    const ribs = []; for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.3) ribs.push(K.pathOf([K.iso([x, CY[1] + 0.01, PZ + 0.12], P), K.iso([x, CY[1] + 0.01, PZ + CH - 0.12], P)]));
    out.push(`<path d="${ribs.join("")}" stroke="#a9b8c6" stroke-width=".5"/>`);
    for (const z of [PZ, PZ + CH - 0.12]) out.push(ISO.tinted(BOX, ISO.wbox(P, [x0, x1], [CY[1], CY[1] + 0.04], [z, z + 0.12], "mid")));
    return out.join("");
  }
  // the open container: the near face's doors swung out, the dark inside, five racks with their charge bars
  function openSvg(P, soc) {
    const [x0, x1] = C1, out = [], face = (pts, fill, ink, w = 0.5) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, CY[1] + 0.06, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"/>`;
    out.push(face([[x0 + 0.3, PZ + 0.15], [x1 - 0.3, PZ + 0.15], [x1 - 0.3, PZ + CH - 0.15], [x0 + 0.3, PZ + CH - 0.15]], "#2a2f35", "#121518", 0.7));
    const n = 5, rw = (x1 - x0 - 0.8) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + 0.4 + i * rw + 0.06, b = a + rw - 0.12;
      out.push(face([[a, PZ + 0.2], [b, PZ + 0.2], [b, PZ + CH - 0.25], [a, PZ + CH - 0.25]], "#4a525b", "#1a1e22"));
      for (let m = 0; m < 6; m++) { const z0 = PZ + 0.3 + m * 0.33; out.push(face([[a + 0.08, z0], [b - 0.36, z0], [b - 0.36, z0 + 0.26], [a + 0.08, z0 + 0.26]], "#7d8791", "#2a2f35", 0.3)); }
      const bz = PZ + 0.3, bh = 1.98, fill = ISO.clamp(soc, 0, 1);
      out.push(face([[b - 0.28, bz], [b - 0.1, bz], [b - 0.1, bz + bh], [b - 0.28, bz + bh]], "#1a1e22", "#000", 0.3));
      if (fill > 0.01) out.push(face([[b - 0.27, bz], [b - 0.11, bz], [b - 0.11, bz + bh * fill], [b - 0.27, bz + bh * fill]], soc < 0.2 ? "#e0784a" : "#5fae3a", "none", 0));
    }
    // the two door leaves, swung right out against the container's sides
    out.push(ISO.tinted(BOX, ISO.wbox(P, [x0 - 0.06, x0], [CY[1], CY[1] + 1.2], [PZ + 0.05, PZ + CH - 0.05], "mid")));
    out.push(ISO.tinted(BOX, ISO.wbox(P, [x1, x1 + 0.06], [CY[1], CY[1] + 1.2], [PZ + 0.05, PZ + CH - 0.05], "mid")));
    return out.join("");
  }
  // behind the containers: the pad and the cable tray on its legs
  function farSvg(P) {
    const out = [ISO.tinted(ISO.T.road, S(K.slabOf(PAD, 0, PZ, P, 3), { tone: "lo", halo: true }))];
    for (const x of [-10, -3.2, 1]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 0.08, x + 0.08], [-4.0, -3.84], [PZ, PZ + CH + 0.3], "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-13.6, 3], [-4.3, -3.6], [PZ + CH + 0.3, PZ + CH + 0.45], "mid")));
    return out.join("");
  }
  function plantSvg(P) {
    const out = [];
    // the air-conditioning unit on the closed container's end, a fan grille on its face
    out.push(`<g data-name="container">${containerSvg(P, C2)}${ISO.tinted(ISO.T.paint, ISO.wbox(P, [C2[1], C2[1] + 0.7], [-3.0, -1.4], [PZ + 0.6, PZ + 2.1], "mid"))}`);
    out.push(`<path d="${G.circleOf(G.frameOf([C2[1] + 0.71, -2.2, PZ + 1.35], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 0.5, P, 24)}" fill="#c6d5e5" stroke="#33506f" stroke-width=".5"/></g>`);
    // the inverter skid: a cabinet with louvres, then the transformer with its radiator fins and three bushings
    out.push(`<g data-name="inverter">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [2, 5], [-4, -0.8], [PZ, PZ + 2.3], "mid"))}`);
    const lv = []; for (let z = PZ + 0.4; z < PZ + 2.0; z += 0.25) lv.push(K.pathOf([K.iso([2.3, -0.79, z], P), K.iso([4.7, -0.79, z], P)]));
    out.push(`<path d="${lv.join("")}" stroke="#5b7a9c" stroke-width=".5"/></g>`);
    out.push(`<g data-name="transformer">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [6.4, 9.4], [-3.6, -1.2], [PZ, PZ + 2.2], "mid"))}`);
    for (let y = -3.4; y <= -1.5; y += 0.38) out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [9.4, 9.9], [y, y + 0.12], [PZ + 0.3, PZ + 1.9], "mid")));
    for (const x of [7, 7.9, 8.8]) out.push(ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 0.12], [0.25, 0.1], [0.3, 0.16], [0.55, 0.09], [0.6, 0.14], [0.85, 0.07]], zAx([x, -2.4, PZ + 2.2]), P, { steps: 10 }), { tone: "mid" })));
    out.push("</g>");
    // the pole: a wooden pole with a cross-arm and three pin insulators
    out.push(`<g data-name="pole">${ISO.tinted(ISO.T.wood, S(K.cylinder(POLE[0], POLE[1], 0.16, PZ, 9, P, 14), { tone: "mid" }))}`);
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [POLE[0] - 0.08, POLE[0] + 0.08], [POLE[1] - 1.1, POLE[1] + 1.1], [PZ + 8.2, PZ + 8.4], "mid")));
    for (const dy of [-0.9, 0, 0.9]) out.push(ISO.tinted(ISO.tint("#dfeee6", ["#7fae96", "#90bba5", "#a3c7b4", "#b7d4c4"], "#2e5a46"), S(G.solidOf([[0, 0.06], [0.1, 0.12], [0.18, 0.08], [0.3, 0.05]], zAx([POLE[0], POLE[1] + dy, PZ + 8.4]), P, { steps: 10 }), { tone: "mid" })));
    out.push("</g>");
    return out.join("");
  }
  // the current's path: racks → tray → inverter → transformer → the line up to the pole (reversed when charging)
  function pathsOf(P) {
    const run = (pts) => K.pathOf(pts.map((p) => K.iso(p, P)));
    const tray = run([[-13, -3.95, PZ + CH + 0.46], [2.6, -3.95, PZ + CH + 0.46], [2.6, -3.95, PZ + 2.3]]);
    const link = run([[5, -2.4, PZ + 1.2], [6.4, -2.4, PZ + 1.2]]);
    const lines = [-0.9, 0, 0.9].map((dy, i) => { const a = K.iso([7 + 0.9 * i, -2.4, PZ + 3.05], P), b = K.iso([POLE[0], POLE[1] + dy, PZ + 8.7], P), m = K.iso([(7 + 0.9 * i + POLE[0]) / 2, (-2.4 + POLE[1] + dy) / 2, PZ + 4.4], P); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; }).join("");
    return { tray, link, lines };
  }

  ISO.add({
    name: "batterybank", title: "Grid battery storage", compare: "batterybank 480 260 480",
    about: "Grid battery storage: containers of lithium-ion racks charge from cheap midday power and send it back at the evening peak, through an inverter and a transformer.",
    line: "batterybank cx cy width mode=charge|discharge|idle soc=0-100 lab=1 lit=racks|container|inverter|transformer|pole |text",
    demo: { line: "batterybank 480 260 480 mode=charge soc=30", script: [{ set: {}, hold: 4 }, { set: { mode: "discharge" }, hold: 4 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.78;
      const { P, g } = ISO.frame([...K.boxCorners(PAD, 0, PZ), [POLE[0], POLE[1], PZ + 9]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const k = K.cameraOf(P).k, paths = pathsOf(P);
      g.innerHTML = `<g>${farSvg(P)}</g><path d="${paths.tray}" fill="none" stroke="#2a2d31" stroke-width="${(0.1 * k + 0.6).toFixed(2)}" stroke-linejoin="round"/>
        <g data-name="container2">${containerSvg(P, C1)}</g><g data-name="racks"></g><g>${plantSvg(P)}</g>
        <path d="${paths.link}" fill="none" stroke="#2a2d31" stroke-width="${(0.1 * k + 0.6).toFixed(2)}"/><path d="${paths.lines}" fill="none" stroke="#5a5f66" stroke-width="${(0.04 * k + 0.5).toFixed(2)}"/><path data-part="flow" d="${paths.tray}${paths.link}${paths.lines}" fill="none" stroke="#ffb02e" stroke-width="${(0.06 * k + 0.6).toFixed(2)}" stroke-dasharray="${(0.5 * k).toFixed(1)} ${(1.4 * k).toFixed(1)}" stroke-linecap="round"/><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { racks: q("racks"), flow: q("flow"), words: q("words") }, w = ISO.writer();
      const s = { mode: ["charge", "discharge", "idle"].includes(o.mode) ? o.mode : "idle", soc: ISO.clamp(ISO.num(o, "soc", 50), 0, 100) / 100, off: 0 };
      let lit = o.lit || "";
      const dir = () => (s.mode === "charge" && s.soc < 1 ? -1 : s.mode === "discharge" && s.soc > 0.05 ? 1 : 0);
      const draw = () => {
        const sq = Math.round(s.soc * 100) / 100, d = dir();
        w.rebuild(el.racks, String(sq), () => openSvg(P, sq));
        w.shown(el.flow, d !== 0); w.attr(el.flow, "stroke-dashoffset", (s.off * k).toFixed(1));
        w.rebuild(el.words, lab ? `${s.mode} ${d} ${Math.round(sq * 100)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([(C1[0] + C1[1]) / 2, CY[1], PZ], P), `battery racks · ${Math.round(sq * 100)} % full`, sq < 0.2 ? "#b5541a" : "#2c6a22", { size: 13, dy: 18 }),
          ISO.word(K.iso([3.5, -0.8, PZ + 2.3], P), "inverter: DC ↔ AC", "#1f4f8f", { size: 13, dy: -8 }),
          ISO.word(K.iso([8, -1.2, PZ], P), "transformer", "#444", { size: 13, anchor: "start", dy: 16 }),
          ISO.word(K.iso([POLE[0], POLE[1], PZ + 9], P), d < 0 ? "charging from the grid" : d > 0 ? "sending power to the grid" : "idle", d < 0 ? "#2c6a22" : d > 0 ? "#b5541a" : "#555", { size: 14, anchor: "end", dy: -8 })].join(""));
        w.light([q("racks"), q("container"), q("container2"), q("inverter"), q("transformer"), q("pole")], lit === "container" ? [q("container"), q("container2")] : [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.mode && ["charge", "discharge", "idle"].includes(p.mode)) s.mode = p.mode;
        if (p.soc !== undefined) s.soc = ISO.clamp(+p.soc, 0, 100) / 100;
        if (p.lit !== undefined) lit = p.lit;
      };
      // 1 MW into or out of 2 MWh: about 2 hours from empty to full, shown about 600 times faster
      g.update = (dt) => {
        const d = dir();
        if (!ISO.still()) s.off += d * dt * 5;
        s.soc = ISO.clamp(s.soc - d * dt * (MW / CAP) * 0.17, 0, 1);
        draw();
        return d !== 0;
      };
      g.readout = () => {
        const d = dir(), kwh = Math.round(s.soc * CAP);
        return d < 0 ? `charging at 1 MW from midday solar · ${kwh} kWh of 2000 stored (${Math.round(s.soc * 100)} %) · the inverter turns the grid's AC into DC for the cells`
          : d > 0 ? `discharging 1 MW into the evening peak · ${kwh} kWh left (${Math.round(s.soc * 100)} %) · DC from the racks → AC at 690 V → 11 kV on the line`
          : `idle · ${kwh} kWh stored · ${s.mode === "charge" ? "full" : s.mode === "discharge" ? "empty" : "waiting"}`;
      };
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
