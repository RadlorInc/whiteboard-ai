// "gearstick cx cy size k=manual|auto gear=N lab=0" — the driver's footwell and gear lever of a right-hand-drive car.
// Manual: the lever comes up from a ball pivot inside the tunnel through a pleated gaiter and an H gate (1-5 and R)
// cut in the trim plate; clutch, brake and gas pedals hang from their box on the firewall. Auto: a P R N D lever with
// its lock button, and only brake and gas. set({ gear }) shifts the way a driver does: manual = clutch down, lever along
// the gate through neutral, clutch up (brake first for R); auto = foot on the brake, press the button, move the lever.
// The part being worked is lit. Local helpers: pedalSvg (a hanging pedal turned on its pivot), lever geometry.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Gate lanes 5 cm apart, 5 cm throws; the pivot ball sits 19 cm under the trim plate.
  const FLOOR = { x: -84, y: -48, w: 116, d: 84, r: 3 }, CONSOLE = { x: -78, y: -40, w: 30, d: 70, r: 3 }, PLATE_Z = 21.2;
  const GX = -63, GY = 2, PIV = [GX, GY, 2], LEVER = 47;
  const GATE = { N: [0, 0], 1: [-6, -6], 2: [-6, 6], 3: [0, -6], 4: [0, 6], 5: [6, -6], R: [6, 6] };
  const AUTO = { P: [0, -7.5], R: [0, -2.5], N: [0, 2.5], D: [0, 7.5] };
  const SAY = {
    N: "neutral · the engine turns, the wheels don't", 1: "1st · 3.55 : 1 · pulling away, up to about 20 km/h", 2: "2nd · 1.90 : 1 · about 15–40 km/h",
    3: "3rd · 1.23 : 1 · about 30–60 km/h", 4: "4th · 0.89 : 1 · about 45–80 km/h", 5: "5th · 0.73 : 1 · cruising, 60 km/h and up", R: "reverse · 3.27 : 1 · only when the car has stopped",
  };
  const SAY_AUTO = { P: "P park · the gearbox is locked · start and stop the engine here", R: "R reverse · only when stopped", N: "N neutral · nothing drives the wheels", D: "D drive · the gearbox changes gears by itself" };
  const PEDALS = { clutch: { x: -32, w: 7 }, brake: { x: -14, w: 8 }, gas: { x: 2, w: 4.4 } };
  const PIVOT_P = [-37, 46], TRAVEL = { clutch: 0.36, brake: 0.2, gas: 0.22 };
  const RUBBER = ISO.T.rubber, PLASTIC = ISO.T.plastic, STEEL = ISO.T.steel;
  const CARPET = ISO.tint("#8c9096", ["#55595e", "#61656a", "#6d7176", "#797d82"], "#2b2e32");

  // A hanging pedal: its arm in the y–z plane from the pivot, turned by `press` (0–1 of its travel) about x.
  function pedalSvg(P, name, press, lit, auto) {
    const { x } = PEDALS[name], w = auto && name === "brake" ? 13 : PEDALS[name].w, ang = press * TRAVEL[name], c = Math.cos(ang), s = Math.sin(ang);
    const rot = (y, z) => [PIVOT_P[0] + (y * c + z * s), PIVOT_P[1] + (-y * s + z * c)];
    const seg = ([y0, z0], [y1, z1], ux, t, tone = "mid", tint = STEEL) => {
      const len = Math.hypot(y1 - y0, z1 - z0), dy = (y1 - y0) / len, dz = (z1 - z0) / len;
      const at = (u, a, b) => { const [Y, Z] = rot(y0 + dy * a - dz * b, z0 + dz * a + dy * b); return [x + u, Y, Z]; };
      return ISO.tinted(tint, ISO.box(at, P, ux, [0, len], [-t, t], tone, lit));
    };
    const out = [seg([0, 0], [4, -18], [-0.6, 0.6], 1.1), seg([4, -18], [20, -30], [-0.6, 0.6], 1.1)];
    // The pad: square to the arm's last leg, ribbed rubber, on a steel plate.
    const end = [20, -30], len = Math.hypot(16, 12), nrm = [12 / len, 16 / len], dir = [16 / len, -12 / len];
    const padAt = (u, a, b) => { const [Y, Z] = rot(end[0] + nrm[0] * a + dir[0] * b, end[1] + nrm[1] * a + dir[1] * b); return [x + u, Y, Z]; };
    out.push(ISO.tinted(STEEL, ISO.box(padAt, P, [-w / 2 - 0.4, w / 2 + 0.4], [0, 0.6], [-4.2, 4.2], "mid", lit)));
    out.push(ISO.tinted(RUBBER, ISO.box(padAt, P, [-w / 2, w / 2], [0.6, 1.6], [-3.8, 3.8], "hi", lit)));
    const ribs = [];
    for (let b = -3; b <= 3; b += 1.2) ribs.push(K.pathOf([K.iso(padAt(-w / 2, 1.62, b), P), K.iso(padAt(w / 2, 1.62, b), P)]));
    out.push(`<path d="${ribs.join("")}" stroke="#16171a" stroke-width="0.8" fill="none"/>`);
    return out.join("");
  }
  // The lever through gate point [gx, gy] (cm on the plate): rod from the plate up, knob, and the pleated gaiter.
  function leverSvg(P, gp, auto, button, lit) {
    const top = [GX + gp[0], GY + gp[1], PLATE_Z], dir = G.unit3(G.sub3(top, PIV)), along = (z) => G.add3(PIV, G.mul3(dir, (z - PIV[2]) / dir[2]));
    const out = [], knob = G.add3(PIV, G.mul3(dir, LEVER));
    if (!auto) {
      // A pleated rubber boot rides on the rod just above the gate, so the gate stays in view.
      const F = G.frameAlong(PIV, dir), s0 = (PLATE_Z + 0.4 - PIV[2]) / dir[2];
      out.push(ISO.tinted(STEEL, S(G.disc(s0, LEVER - 3, 1, F, P, { steps: 14 }), { tone: "hi", lit })));
      for (let i = 0; i < 5; i++) out.push(ISO.tinted(RUBBER, S(G.disc(s0 + i * 0.9, s0 + i * 0.9 + 0.9, (i % 2 ? 2.3 : 2.9) - i * 0.12, F, P, { steps: 18 }), { tone: "mid" })));
      out.push(ISO.tinted(PLASTIC, S(G.sphereOf(knob, 4.4, P), { tone: "hi", lit })));
      // The gate pattern printed on the knob's crown.
      const crown = G.add3(knob, [0, 0, 4.42]), pat = [[-1.6, -1.4, -1.6, 1.4], [0, -1.4, 0, 1.4], [1.6, -1.4, 1.6, 1.4], [-1.6, 0, 1.6, 0]];
      out.push(`<path d="${pat.map(([a, b, c, d]) => K.pathOf([K.iso([crown[0] + a, crown[1] + b, crown[2]], P), K.iso([crown[0] + c, crown[1] + d, crown[2]], P)])).join("")}" stroke="#d9dce0" stroke-width="0.7" fill="none" stroke-linecap="round"/>`);
    } else {
      out.push(ISO.tinted(STEEL, S(G.disc((PLATE_Z + 0.2 - PIV[2]) / dir[2], LEVER - 6, 1.1, G.frameAlong(PIV, dir), P, { steps: 14 }), { tone: "hi", lit })));
      const base = G.add3(PIV, G.mul3(dir, LEVER - 6)), F = G.frameAlong(base, dir);
      out.push(ISO.tinted(PLASTIC, S(G.solidOf([[0, 2.4], [6, 3.2, 1], [9, 3.4, 1], [11, 2.8, 1], [12, 0, 1]], F, P), { tone: "hi", lit })));
      // The lock button on the knob's side, pressed in by 0.8 cm.
      const side = G.add3(G.add3(base, G.mul3(dir, 7)), [0, 3.3 - button * 0.8, 0]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 1.2, 1.2, G.frameAlong(side, [0, 1, 0]), P, { steps: 14 }), { tone: "hi" })));
    }
    return out.join("");
  }
  function staticSvg(P, auto, lab) {
    const out = [], at3 = (p) => K.iso(p, P);
    out.push(`<path class="iso-halo" d="${K.haloOf(FLOOR, -4, 4, P)}"/>`);
    out.push(ISO.tinted(CARPET, S(K.slabOf(FLOOR, -4, 4, P, 3, 0.6), { tone: "mid" }) + L(K.planOutline(K.insetPlan(FLOOR, 4), 0, P, 3), { tone: "faint" })));
    // Firewall with the pedal box and its pivot shaft.
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [FLOOR.x, FLOOR.x + FLOOR.w], [-48, -42], [0, 58], "mid")));
    out.push(ISO.wbox(P, [-40, 10], [-42, -36], [42, 54], "mid"), D([[-36, 51], [6, 51], [-36, 45], [6, 45]].map(([x, z]) => at3([x, -36, z])), { size: 0.6, tone: "lo" }));
    out.push(ISO.tinted(STEEL, S(G.disc(-40, 10, 1, G.frameAlong([0, PIVOT_P[0], PIVOT_P[1]], [1, 0, 0]), P, { steps: 16 }), { tone: "hi" })));
    // Tunnel console with its trim plate and the gate cut in it.
    out.push(ISO.tinted(CARPET, S(K.slabOf(CONSOLE, 0, PLATE_Z - 1.2, P, 3, 0.6), { tone: "mid", inner: L(K.sideSeam(CONSOLE, 6, P, 3), { tone: "faint" }) })));
    const plate = { x: GX - 13, y: GY - 16, w: 26, d: 32, r: 2.4 };
    out.push(ISO.tinted(PLASTIC, S(K.slabOf(plate, PLATE_Z - 1.2, 1.2, P, 4, 0.4), { tone: "mid" })));
    out.push(D(K.corners(plate, 2.4).map(([x, y]) => at3([x, y, PLATE_Z])), { size: 0.6, tone: "lo" }));
    const k = G.scaleOf(P), slot = (pts) => K.pathOf(pts.map(([a, b]) => at3([GX + a, GY + b, PLATE_Z])));
    const d = auto ? slot([[0, -7.5], [0, 7.5]]) : [slot([[-6, -6], [-6, 6]]), slot([[0, -6], [0, 6]]), slot([[6, -6], [6, 6]]), slot([[-6, 0], [6, 0]])].join("");
    out.push(`<path d="${d}" stroke="#8a9098" stroke-width="${(2.4 * k).toFixed(2)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#0b0c0e" stroke-width="${(1.7 * k).toFixed(2)}" stroke-linecap="round" fill="none"/>`);
    const marks = auto ? Object.entries(AUTO).map(([n, [a, b]]) => [n, a + 4, b + 1]) : Object.entries(GATE).filter(([n]) => n !== "N").map(([n, [a, b]]) => [n, a, b + Math.sign(b) * 3.6 + 1.3]);
    out.push(`<g style="--anatomy-mid:#e8eaed">${marks.map(([n, a, b]) => K.faceTextSvg(K.topMatrix([GX + a, GY + b], PLATE_Z, P), n, { size: 3.6, tone: "mid", anchor: "middle" })).join("")}</g>`);
    if (lab) {
      out.push(ISO.word(at3([CONSOLE.x + CONSOLE.w / 2, CONSOLE.y + CONSOLE.d, 0]), auto ? "selector" : "gear lever", "#555", { dy: 22, size: 15 }));
      for (const [n, p] of Object.entries(PEDALS)) if (!auto || n !== "clutch") out.push(ISO.word(at3([p.x, -6, 0]), n, "#555", { dy: 22, size: 15 }));
    }
    return out.join("");
  }

  ISO.add({
    name: "gearstick", title: "Gear lever and pedals", compare: "gearstick 470 270 400",
    about: "Footwell of a right-hand-drive car: H-gate lever with its gaiter and the clutch, brake and gas pedals (or a P R N D selector); it shifts the way a driver does.",
    line: "gearstick cx cy size k=manual|auto gear=N|1-5|R (auto: P|R|N|D) lab=0",
    demo: { line: "gearstick 470 270 400", script: ["1", "2", "3", "4", "5", "N", "R"].map((gear) => ({ set: { gear }, hold: "settle" })) },
    make([cx, cy, size = 400], o, t, parent) {
      const auto = o.k === "auto", lab = o.lab !== "0", Wd = size * 1.75, H = Wd * 0.62, map = auto ? AUTO : GATE;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -4, 0), [FLOOR.x, -48, 58], [FLOOR.x + FLOOR.w, -48, 58], [GX, GY + 12, 46]], cx, cy, Wd, H, { azimuth: 52, elevation: 30 }, parent);
      const names = auto ? ["brake", "gas"] : ["clutch", "brake", "gas"];
      g.innerHTML = staticSvg(P, auto, lab) + `<g data-name="knob"></g>` + names.map((n) => `<g data-name="${n}"></g>`).join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-name]")].map((e) => [e.dataset.name, e])), w = ISO.writer();
      let gear = map[o.gear] ? o.gear : auto ? "P" : "N";
      const s = { at: map[gear].slice(), press: { clutch: 0, brake: 0, gas: 0 }, button: 0, plan: null, t: 0, lit: "knob", label: "" };
      // A shift: the moves a driver makes, as a list of { t, foot, to (gate point), button, label }.
      const planOf = (from, to) => {
        const a = map[from], b = map[to], steps = [];
        if (auto) {
          steps.push({ t: 0.6, foot: { brake: 1 }, lit: "brake", label: "foot on the brake" }, { t: 0.4, button: 1, lit: "knob", label: "press the button" });
          steps.push({ t: 0.25 + Math.abs(b[1] - a[1]) * 0.06, to: b, lit: "knob", label: `moving to ${to}` }, { t: 0.3, button: 0, lit: "knob", label: SAY_AUTO[to] });
          if (to === "D" || to === "R") steps.push({ t: 0.7, foot: { brake: 0 }, lit: "brake", label: `brake off · ${SAY_AUTO[to]}` });
          return steps;
        }
        if (to === "R") steps.push({ t: 0.6, foot: { brake: 1 }, lit: "brake", label: "stop the car first: brake on" });
        steps.push({ t: 0.6, foot: { clutch: 1 }, lit: "clutch", label: "clutch down · the engine is disconnected from the gearbox" });
        const via = [[a[0], 0], [b[0], 0], b].filter((p, i, list) => (i ? p[0] !== list[i - 1][0] || p[1] !== list[i - 1][1] : p[0] !== a[0] || p[1] !== a[1]));
        let prev = a;
        for (const p of via) { steps.push({ t: 0.2 + Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 0.07, to: p, lit: "knob", label: `lever to ${to}` }); prev = p; }
        steps.push({ t: 0.8, foot: { clutch: 0 }, lit: "clutch", label: `clutch up gently · ${SAY[to]}` });
        if (to === "R") steps.push({ t: 0.5, foot: { brake: 0 }, lit: "brake", label: SAY.R });
        return steps;
      };
      const start = () => ({ at: s.at.slice(), press: { ...s.press }, button: s.button });
      const draw = () => {
        w.rebuild(el.knob, `${s.at.map((v) => v.toFixed(3))} ${s.button.toFixed(2)}`, () => leverSvg(P, s.at, auto, s.button, false));
        for (const n of names) w.rebuild(el[n], s.press[n].toFixed(3), () => pedalSvg(P, n, s.press[n], false, auto));
        w.light(Object.values(el), s.plan ? [el[s.lit]] : []);
      };
      g.set = (p) => {
        if (p.gear === undefined || !map[p.gear] || p.gear === gear) return;
        s.plan = { steps: planOf(gear, p.gear), from: start(), i: 0 }; s.t = 0; gear = p.gear;
      };
      g.update = (dt) => {
        if (!s.plan) { draw(); return false; }
        if (ISO.still()) dt = 1e3;
        s.t += dt;
        while (s.plan) {
          const st = s.plan.steps[s.plan.i], f = s.plan.from, e = ISO.ease(Math.min(1, s.t / st.t));
          if (st.foot) for (const [n, v] of Object.entries(st.foot)) s.press[n] = f.press[n] + (v - f.press[n]) * e;
          if (st.to) s.at = [f.at[0] + (st.to[0] - f.at[0]) * e, f.at[1] + (st.to[1] - f.at[1]) * e];
          if (st.button !== undefined) s.button = f.button + (st.button - f.button) * e;
          s.lit = st.lit; s.label = st.label;
          if (s.t < st.t) break;
          s.t -= st.t; s.plan.i++; s.plan.from = start();
          if (s.plan.i >= s.plan.steps.length) { s.plan = null; s.label = auto ? SAY_AUTO[gear] : SAY[gear]; }
        }
        draw();
        return !!s.plan;
      };
      g.readout = () => s.label || (auto ? SAY_AUTO[gear] : SAY[gear]);
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
