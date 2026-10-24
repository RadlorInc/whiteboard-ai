// "aircon cx cy width set=24 on=0|1 lab=1 lit=louvre|casing|pipes|display|remote|thermometer" — the indoor unit of a split air
// conditioner on a wall cut away as a section (brick core and plaster skin). The casing: a chassis with end caps, the
// hinged front panel, the intake grille slots on top, the display window with the set temperature and the power light.
// Under the front, the outlet slot with its left–right vanes and the swing louvre that opens and sweeps. From the right
// end the gas and liquid pipes (both in white foam insulation), the drain hose and the power-and-signal cable run to
// the wall sleeve's cover ring and through the wall to the outdoor unit. A remote sits in its holder lower left.
// set({ on: 1 }): the louvre opens and swings, cold air (about 12 °C) pours out and sinks, and the room comes down to
// the set point (shown fast). Model: about 3.5 kW of cooling at ~10 m³/min: Q = ρ·c·V̇·ΔT ≈ 1.2 × 1005 × 0.17 × 15.
// World units: 1 cm. Indoor unit 90 × 22 × 29 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const Fx = (x, y = 0, z = 0) => G.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const WALL = { x0: -66, x1: 72, y0: -22, z0: 18, z1: 92 }, SKIN = -1.5;
  // The casing's cross-section in (y, z): flat back on the wall, top, the rounded front panel, the slanted underside.
  const BODY = [[0, 52], [0, 79.5], [15, 79.5], [18.6, 78.6], [20.8, 76], [21.6, 72], [21.6, 60], [20.6, 57], [12, 52.2]];
  const X0 = -45, X1 = 45, CAP = 2;
  const PIV = [16.4, 54.4], FLAP = 3.3, SHUT = Math.atan2(57 - 52.2, 20.6 - 12);   // louvre pivot, half chord, closed angle
  const OPEN = -0.5, SWING = 0.14;                                                     // open: 29° below level, ±8° sweep
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const P3 = (P, p) => K.iso(p, P);
  // a closed outline on the plane y = y0, points in (x, z)
  const onFace = (P, pts, y0, fill, stroke = "none", w = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y0, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  // A pipe along straight legs with a ball at each bend. The audit reads each leg's end as sunk into its bend ball by
  // one radius; it is one continuous pipe, so for the fat insulated pipes that report is a false positive.
  function pipe(P, pts, r, tint = "") {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], d = b.map((v, k) => v - a[k]), l = Math.hypot(...d);
      out.push(S(G.disc(0, l, r, G.frameAlong(a, d.map((v) => v / l)), P), { tone: "hi", crease: "none" }));
      if (i + 2 < pts.length) out.push(S(G.sphereOf(b, r, P), { tone: "hi" }));
    }
    return ISO.tinted(tint, out.join(""));
  }

  // A room thermometer on the wall: bezel, dial face with a dot scale 10–40 °C, centre cap; the needle is live.
  const TH = yAx([-32, 0, 40]), thAngle = (T) => Math.PI * (1.25 - ((ISO.clamp(T, 10, 40) - 10) / 30) * 1.5);
  const thermoSvg = (P) => S(G.disc(0, 1, 6, TH, P), { tone: "mid" }) + S(G.disc(1, 1.4, 5.2, TH, P), { tone: "hi" }) +
    D(Array.from({ length: 16 }, (_, i) => K.iso(G.pointOf(TH, 1.4, 4.4, thAngle(10 + i * 2)), P)), { size: 0.45, tone: "lo" }) +
    D([10, 20, 30, 40].map((T) => K.iso(G.pointOf(TH, 1.4, 4.4, thAngle(T)), P)), { size: 0.8, tone: "mid" });
  const needleSvg = (P, T) => L(K.pathOf([G.pointOf(TH, 1.4, 0.4, thAngle(T) + Math.PI), G.pointOf(TH, 1.4, 3.9, thAngle(T))].map((p) => K.iso(p, P))), { tone: "hi", free: true }) + S(G.disc(1.4, 1.9, 0.8, TH, P), { tone: "mid" });
  function wallSvg(P) {
    const out = [], { x0, x1, y0, z0, z1 } = WALL;
    out.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [x0, x1], [y0, SKIN], [z0, z1], "mid")));
    out.push(ISO.wbox(P, [x0, x1], [SKIN, 0], [z0, z1], "mid"));
    // brick courses on the cut end and the cut top: bed joints edge to edge, head joints between them
    const lines = [];
    for (let z = z0 + 7.5; z < z1; z += 7.5) lines.push(K.pathOf([[x1, y0, z], [x1, SKIN, z]].map((p) => P3(P, p))));
    for (let i = 0, z = z0; z < z1 - 0.1; i++, z += 7.5) { const y = i % 2 ? -11.75 : -6, top = Math.min(z + 7.5, z1); lines.push(K.pathOf([[x1, y, z], [x1, y, top]].map((p) => P3(P, p)))); }
    lines.push(K.pathOf([[x0, -11.75, z1], [x1, -11.75, z1]].map((p) => P3(P, p))));
    for (let x = x0 + 22; x < x1; x += 22) lines.push(K.pathOf([[x, y0, z1], [x, -11.75, z1]].map((p) => P3(P, p))), K.pathOf([[x - 11, -11.75, z1], [x - 11, SKIN, z1]].map((p) => P3(P, p))));
    out.push(L(lines.join(""), { tone: "faint" }));
    // the remote's holder on the wall and the remote in it, with its little screen and buttons
    out.push(ISO.wbox(P, [-61, -55], [0, 0.4], [28, 40], "mid"), ISO.wbox(P, [-61, -55], [0.4, 2.6], [28, 29], "mid"));
    out.push(named("remote", ISO.wbox(P, [-60.2, -55.8], [0.5, 2.1], [29, 45], "hi") + onFace(P, rect(-59.4, -56.6, 41, 43.6), 2.11, "#cfdccb", "#3c3f45", 0.4) +
      D([[-59, 39.4], [-57.8, 39.4], [-56.8, 39.4], [-59, 37.8], [-57.8, 37.8], [-56.8, 37.8]].map(([x, z]) => P3(P, [x, 2.1, z])), { size: 0.7, tone: "lo" })));
    out.push(ISO.wbox(P, [-61, -55], [2.2, 2.6], [29, 35], "mid"));
    out.push(D([P3(P, [-58, 0.4, 38.6]), P3(P, [-58, 0.4, 30.4])], { size: 0.6 }));
    return out.join("");
  }
  // Pipes from the right end cap to the sleeve's cover ring on the wall: gas (fat) and liquid pipes in foam, the drain
  // hose and the cable, side by side, each turning into the sleeve.
  const RUNS = [[59, 1.5, ""], [55.8, 1.1, ""], [53.4, 0.95, ISO.T.rubber], [61.4, 0.45, ISO.T.plastic]];
  function pipesSvg(P) {
    const out = [S(G.disc(0, 0.6, 7, yAx([60, 0, 57]), P), { tone: "mid" }), `<path d="${G.circleOf(yAx([60, 0, 57]), 0.6, 5.4, P)}" fill="#3a3e44"/>`];
    for (const [z, r, tint] of RUNS) out.push(pipe(P, [[X1, 5, z], [60, 5, z], [60, 0.6, z]], r, tint));
    return named("pipes", out.join(""));
  }
  function casingSvg(P) {
    const out = [];
    out.push(S(G.prismOf(Fx(X0), BODY, 0, CAP, P), { tone: "hi" }));
    out.push(S(G.prismOf(Fx(X0 + CAP), BODY, 0, X1 - X0 - 2 * CAP, P), { tone: "hi" }));
    // the outlet slot in the underside, dark, with its left–right vanes
    const slot = [];
    for (let x = -40; x <= 40.01; x += 80 / 12) slot.push(x);
    const lip = (x, t) => [x, 20.6 + (12 - 20.6) * t + 0.05, 57 + (52.2 - 57) * t - 0.06];
    out.push(`<path d="${K.pathOf([lip(-40, 0.1), lip(40, 0.1), lip(40, 0.86), lip(-40, 0.86)].map((p) => P3(P, p)), true)}" fill="#2f3338" stroke="#0d0e10" stroke-width="0.6"/>`);
    out.push(`<path d="${slot.slice(1, -1).map((x) => K.pathOf([lip(x, 0.1), lip(x, 0.86)].map((p) => P3(P, p)))).join("")}" fill="none" stroke="#6b7178" stroke-width="0.8"/>`);
    // the front panel's shut lines and the intake grille on top
    out.push(ISO.seam(P, [[X0 + CAP, 20.8, 76], [X1 - CAP, 20.8, 76]], "#5d6670", 0.6), ISO.seam(P, [[X0 + CAP, 20.6, 57], [X1 - CAP, 20.6, 57]], "#5d6670", 0.6));
    for (let y = 1.6; y < 13.5; y += 2.2) out.push(L(K.planOutline({ x: -40, y, w: 80, d: 1, r: 0.5 }, 79.5, P, 3), { tone: "lo" }));
    // the hinged front panel: three thin strips over the front's curve, then the display bezel, the remote's receiver
    // lens and the two pull tabs of the air filters showing above the panel
    const strip = (a, b) => { const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d), n = [d[1] / l * 0.5, -d[0] / l * 0.5]; return [a, b, [b[0] + n[0], b[1] + n[1]], [a[0] + n[0], a[1] + n[1]]]; };
    for (const [a, b] of [[[20.6, 57], [21.6, 60]], [[21.6, 60], [21.6, 72]], [[21.6, 72], [20.8, 76]]]) out.push(S(G.prismOf(Fx(X0 + CAP), strip(a, b), 0, X1 - X0 - 2 * CAP, P), { tone: "hi" }));
    out.push(ISO.wbox(P, [27.4, 39.6], [22.1, 22.4], [62.6, 68.4], "mid"), ISO.wbox(P, [40, 42], [22.1, 22.5], [64.5, 66.5], "mid"));
    for (const x of [-24, 18]) out.push(ISO.wbox(P, [x, x + 6], [14, 17.4], [79.5, 80.3], "mid"));
    out.push(S(G.prismOf(Fx(X1 - CAP), BODY, 0, CAP, P), { tone: "hi" }));
    return named("casing", out.join(""));
  }
  // The louvre: a thin blade turned about its pivot, with the pins into the end caps.
  function louvreSvg(P, ang) {
    const c = Math.cos(ang), s = Math.sin(ang), n = [-s, c];
    const pt = (u, w) => [PIV[0] + c * u + n[0] * w, PIV[1] + s * u + n[1] * w];
    const blade = [pt(-FLAP, -0.75), pt(FLAP, -0.75), pt(FLAP, -0.2), pt(-FLAP, -0.2)];
    return S(G.disc(0, 3.1, 0.6, Fx(X0 + CAP + 0.0, PIV[0], PIV[1]), P), { tone: "mid" }) + S(G.prismOf(Fx(-40), blade, 0, 80, P), { tone: "hi" }) + S(G.disc(0, 3.1, 0.6, Fx(40 - 0.1 + 0.1, PIV[0], PIV[1]), P), { tone: "mid" });
  }
  // Cold air: soft tapered ribbons leaving along the louvre and sinking as they go (cold air is denser).
  function airSvg(P, ang, v, clock) {
    if (v < 0.03) return "";
    const out = [], d = [Math.cos(ang), Math.sin(ang)];
    for (let i = 0; i < 7; i++) {
      const x = -34 + i * (68 / 6), f = (clock * 0.45 + i * 0.37) % 1, s0 = 1 + f * 20, len = 11 + 4 * Math.sin(i * 1.7);
      const at = (t) => { const sd = s0 + t * len; return [x + Math.sin(i + sd * 0.08) * 1.5, PIV[0] + d[0] * (sd + FLAP), PIV[1] + d[1] * (sd + FLAP) - 0.008 * sd * sd]; };
      const C = Array.from({ length: 9 }, (_, j) => P3(P, at(j / 8)));
      const left = [], right = [];
      C.forEach((p, j) => { const q = C[Math.min(8, j + 1)], o = C[Math.max(0, j - 1)], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, w = (1.2 + 0.12 * j) * Math.sin((Math.PI * j) / 8); left.push([p[0] - (ty / l) * w, p[1] + (tx / l) * w]); right.push([p[0] + (ty / l) * w, p[1] - (tx / l) * w]); });
      const a = v * Math.sin(Math.PI * f) * 0.75;
      out.push(`<path d="${K.pathOf([...left, ...right.reverse()], true)}" fill="#9fcdf2" fill-opacity="${a.toFixed(2)}"/>`);
    }
    return out.join("");
  }

  const def = {
    name: "aircon", title: "Wall air conditioner", compare: "aircon 480 230 420",
    about: "A split system's indoor unit: switched on, the louvre opens and sweeps, cold air at about 12 °C pours out and sinks, and the room cools to its set point while the pipes carry the heat outside.",
    line: "aircon cx cy width set=24 on=0|1 lab=1 lit=louvre|casing|pipes|display|remote|thermometer",
    demo: { line: "aircon 480 240 420", script: [{ set: { on: 1 }, hold: 4 }, { set: { on: 0 }, hold: "settle" }] },
    make([cx, cy, width = 420], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.75, H = width * 1.0;
      const pts = [[WALL.x0, WALL.y0, 0], [WALL.x1, WALL.y0, 0], [WALL.x0, 0, 0], [WALL.x1, 0, 0], [WALL.x0, WALL.y0, WALL.z1], [WALL.x1, WALL.y0, WALL.z1], [WALL.x1, 0, WALL.z1], [0, 44, 30]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 50, elevation: 16 }, parent);
      const setT = ISO.clamp(ISO.num(o, "set", 24), 16, 30);
      const s = { v: o.on === "1" ? 1 : 0, on: o.on === "1" ? 1 : 0, room: o.on === "1" ? setT : 30, clock: 0, lit: o.lit || "" };
      const words = !lab ? "" : [
        ISO.word(P3(P, [-20, 10, 79.5]), "intake grille", "#555", { size: 13, dy: -10 }),
        ISO.word(P3(P, [-45, 21, 56]), "swing louvre", "#555", { size: 13, anchor: "end", dy: 6 }),
        ISO.word(P3(P, [62, 0, 48]), "pipes, drain and cable to the outdoor unit", "#555", { size: 13, anchor: "start", dy: 14 }),
        ISO.word(P3(P, [-61, 2.6, 30]), "remote", "#555", { size: 13, anchor: "end", dy: 4 }),
        ISO.word(P3(P, [-32, 1, 34]), "room thermometer", "#555", { size: 13, dy: 14 }),
      ].join("");
      g.innerHTML = `<g>${wallSvg(P)}${named("thermometer", thermoSvg(P))}</g><g data-part="needle"></g><g>${pipesSvg(P)}${casingSvg(P)}</g><g data-part="display"></g><g data-name="louvre" data-part="louvre"></g><g data-part="air"></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const memo = new Map();
      const angle = () => SHUT + (OPEN + SWING * Math.sin(s.clock * 0.9) * s.v - SHUT) * s.v;
      const draw = () => {
        const a = Math.round(angle() / 0.004) * 0.004, key = a.toFixed(3);
        w.rebuild(el.louvre, key, () => memo.get(key) ?? (memo.set(key, louvreSvg(P, a)), memo.get(key)));
        w.rebuild(el.air, s.v > 0.03 ? `${a.toFixed(3)} ${s.clock.toFixed(2)} ${s.v.toFixed(2)}` : "", () => airSvg(P, a, s.v, s.clock));
        w.rebuild(el.display, `${s.on}`, () => named("display", onFace(P, [[28, 63.2], [39, 63.2], [39, 67.8], [28, 67.8]], 22.41, "#2f3338", "#0d0e10", 0.5) +
          `<g transform="${ISO.faceMatrix(P, [28, 22.42, 67.8], 1)}"><text x="5.5" y="3.9" text-anchor="middle" fill="${s.on ? "#bfe3ff" : "#4b5056"}" style="font:700 3.8px ui-monospace,Menlo,monospace">${setT}°</text></g>` +
          `<circle cx="${P3(P, [41, 22.51, 65.5])[0].toFixed(1)}" cy="${P3(P, [41, 22.51, 65.5])[1].toFixed(1)}" r="0.9" fill="${s.on ? "#2fa84f" : "#9aa0a6"}" stroke="#3c3f45" stroke-width="0.4"/>`));
        w.rebuild(el.needle, s.room.toFixed(1), () => needleSvg(P, s.room));
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = +p.on ? 1 : 0; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        if (!calm) s.clock += dt;
        s.v = ISO.follow(s.v, s.on, dt, 0.6, calm);
        if (Math.abs(s.v - s.on) < 0.002) s.v = s.on;
        // the room: towards the set point while cooling, back towards 30 °C when off (minutes, shown in seconds)
        s.room = ISO.follow(s.room, s.on ? setT : 30, dt, s.on ? 2.5 : 6, calm);
        draw();
        return s.v !== s.on;
      };
      g.readout = () => {
        const room = s.room.toFixed(1);
        if (s.on) return `cooling · about 3.5 kW · air leaves the louvre at about 12 °C and sinks · room ${room} °C → set ${setT} °C (shown fast) · the refrigerant carries the heat out through the pipes to the outdoor unit`;
        return s.v > 0.02 ? "switching off · the louvre closes" : `off · louvre closed · room ${room} °C`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  };
  ISO.add(def);
})();
