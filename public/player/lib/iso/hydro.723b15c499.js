// "hydro cx cy width labels=1 gate=0..1 level=0..1" — a hydroelectric station as a museum cut-away model.
// A walnut plinth carries a block of valley cut open along its front: the reservoir behind a concrete gravity dam,
// the intake with its trash rack and a gate that slides up in a slot (hoist on the crest), the penstock through the
// dam and the rock, and the powerhouse at the dam's toe opened up: the scroll case cut in half so the Francis runner
// shows, the shaft up to the generator with its exciter, the draft tube under the floor out to the tailrace river,
// the transformer on the roof and the line out over a pylon. Open the gate (gate=1) and water runs down the penstock,
// the runner spins up and the readout gives P = η ρ g Q H from the real head. World units: 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S, D = M.D;
  const Y0 = -50, CUT = 0, AX = [30, -10], TAIL = -14, FLOOR = -20;
  const PLINTH = { x: -136, y: -58, w: 272, d: 80, r: 4 };
  const ROCK = [[-130, -44], [130, -44], [130, -4], [104, -4], [96, -30], [52, -30], [52, FLOOR], [8, FLOOR], [8, -6], [-130, -6]];
  const DAM = [[-56, -6], [8, -6], [-40, 46], [-56, 46]];
  const PEN = [[-56, 14], [-2, -15], [12, -15]];                 // penstock centreline on the cut face
  const QMAX = 120, ETA = 0.9;                                    // m³/s at full gate, turbine-generator efficiency
  const lvlZ = (lv) => 20 + 24 * lv;                              // level 0..1 → reservoir surface 20..44 m
  // a band of half-width r round a polyline in x–z (the penstock's lining and bore on the cut face)
  const band = (pts, r) => {
    const L = [], R = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      let nx = -dz / l, nz = dx / l, s = 1;
      if (i > 0 && i < pts.length - 1) { const d1 = [p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]], l1 = Math.hypot(...d1), n1 = [-d1[1] / l1, d1[0] / l1]; s = 1 / Math.max(0.5, n1[0] * nx + n1[1] * nz); }
      L.push([p[0] + nx * r * s, p[1] + nz * r * s]); R.push([p[0] - nx * r * s, p[1] - nz * r * s]);
    });
    return [...L, ...R.reverse()];
  };
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;

  function staticBack(P) {
    const out = [M.plinth(P, PLINTH, { z: -44 })];
    // the far valley side: a grassy ridge behind everything, with a few trees on it
    const RIDGE = [[-130, -6], [130, -6], [130, 8], [104, 12], [70, 20], [30, 26], [-10, 40], [-40, 54], [-80, 60], [-130, 56]];
    out.push(M.sec(P, RIDGE, Y0, Y0 + 5, "grass"), M.tree(P, -100, Y0 + 2.5, 59, 1.1), M.tree(P, -64, Y0 + 2.5, 57.5, 1), M.tree(P, 80, Y0 + 2.5, 18.4, 0.9));
    out.push(M.sec(P, ROCK, Y0, CUT, "rock", M.grains(P, ROCK, CUT, 60, "#8d939a", 0.7, 3)));
    // the draft tube cut through the rock under the powerhouse floor, out to the tailrace
    out.push(face(P, band([[30, FLOOR], [30, -26], [40, -27], [52, -25]], 3.6), "#7f8890", "#3c3f45"));
    out.push(M.named("dam", M.sec(P, DAM, Y0, CUT, "concrete") + face(P, [[-56, 46], [-40, 46], [-40, 44.6], [-56, 44.6]], "#d0cec7", "#5f5f5c", 0.5)));
    // the gate slot through the dam from the intake to the crest
    out.push(face(P, M.rect(-51, -48.6, 9, 46), "#8f8d86", "#5f5f5c", 0.6));
    out.push(M.named("penstock", face(P, band(PEN, 4.6), "#5a6068", "#2f343a")));
    // the powerhouse: walls and roof in section, the back wall inside, the machine floor with its pit
    out.push(M.sec(P, M.rect(8, 12, FLOOR, 18), Y0, CUT, "concrete"), M.sec(P, M.rect(48, 52, FLOOR, 18), Y0, CUT, "concrete"));
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [12, 48], [Y0, Y0 + 3], [FLOOR, 18], "lo")));
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [12, 48], [Y0 + 3, -21], [FLOOR - 0.01, FLOOR + 1.6], "lo")));
    // crane rail along the back wall
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [12, 48], [Y0 + 3, Y0 + 5], [12, 13.4], "mid")));
    return out.join("");
  }
  // audit.mjs notes: the plinth is drawn through a group transform (lowered to the block's bottom), so its slab reads
  // as sunk into parts at z 0; trees, the flange and the transformer stand on prismY sections it doesn't record; the
  // runner's hub and the shaft sit inside the scroll case on purpose (it is cut in half to show them).
  // the scroll case's back half (cut through the axis) and the stay ring, drawn before the runner
  function caseBack(P) {
    const F = G.frameOf([AX[0], AX[1], FLOOR + 1.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    const half = Array.from({ length: 25 }, (_, i) => { const a = Math.PI + (i / 24) * Math.PI; return [Math.cos(a) * 11, Math.sin(a) * 11]; });
    const out = [ISO.tinted(ISO.T.steel, S(G.prismOf(F, half, 0, 7.4, P), { tone: "mid" }))];
    // the pipe from the wall to the case inlet
    out.push(M.pipe(P, [[12, -6, FLOOR + 5.2], [19.4, -6, FLOOR + 5.2]], 3, {}));
    return out.join("");
  }
  // the Francis runner: hub, crown and 13 swept blades turned to angle th, sorted far to near round the hub
  const RUN = new Map();
  function runnerSvg(P, th, hubSvg) {
    const n = 13, z0 = FLOOR + 2.2, z1 = FLOOR + 6.6, cx = AX[0], cy = AX[1];
    const blades = [];
    for (let i = 0; i < n; i++) {
      const a0 = th + (i / n) * Math.PI * 2;
      const at = (u, w, y) => { const f = a0 + 0.55 * (y - z0) / (z1 - z0) + 0.25 * (u - 2.6) / 4; return [cx + u * Math.cos(f) - w * Math.sin(f), cy + u * Math.sin(f) + w * Math.cos(f), y]; };
      blades.push({ k: K.depthOf(at(4.6, 0, (z0 + z1) / 2), P), svg: ISO.box(at, P, [2.6, 6.6], [-0.25, 0.25], [z0, z1], "mid") });
    }
    blades.sort((a, b) => a.k - b.k);
    const hk = K.depthOf([cx, cy, z0], P);
    return ISO.tinted(ISO.T.brass, blades.filter((b) => b.k < hk).map((b) => b.svg).join("")) + hubSvg[0] + ISO.tinted(ISO.T.brass, blades.filter((b) => b.k >= hk).map((b) => b.svg).join("")) + hubSvg[1];
  }
  // hub and crown are round, so they never change as the runner turns: built once
  const hubOf = (P) => { const z0 = FLOOR + 2.2, z1 = FLOOR + 6.6, F = M.Z([AX[0], AX[1], z0 - 0.4]);
    return [ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 2.8], [3.4, 2.4, 1], [5, 1.4, 1], [5.4, 0]], F, P, { steps: 28 }), { tone: "hi" })),
      ISO.tinted(ISO.T.steel, S(G.disc(z1 - z0 + 0.4, z1 - z0 + 1.2, 6.9, F, P, { steps: 36 }), { tone: "mid" }))]; };
  // shaft, generator (stator housing with cooling ribs), exciter; the rotor's marks on the top turn with the runner
  function genSvg(P) {
    const [cx, cy] = AX, out = [];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(cx, cy, 1.3, FLOOR + 7.8, 13, P, 16), { tone: "hi" })));
    // the generator floor: two side strips cut at the front and a back strip, with the pit for the machine
    out.push(M.sec(P, M.rect(12, 19, -2.4, 0), Y0 + 3, CUT, "concrete"), ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [19, 41], [Y0 + 3, -21], [-2.4, 0], "mid")), M.sec(P, M.rect(41, 48, -2.4, 0), Y0 + 3, CUT, "concrete"));
    for (const [x, y] of [[cx - 8, cy - 6], [cx + 8, cy - 6]]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 1.2, x + 1.2], [y - 1.2, y + 1.2], [0, 1.4], "mid")));
    const F = M.Z([cx, cy, 1.4]);
    out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 9.6], [0.6, 10.2, 1], [8.4, 10.2, 1], [9, 9.6], [9, 0]], F, P, { steps: 56 }), { tone: "hi", inner: `<path d="${G.arcOf(F, 3, 10.22, P) + G.arcOf(F, 6, 10.22, P)}" fill="none" stroke="#33506f" stroke-width=".6"/>` })));
    out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[9, 0], [9, 4.2], [12.4, 4.2], [12.4, 3.4, 1], [12.8, 0]], F, P, { steps: 32 }), { tone: "mid" })));
    return M.named("generator", out.join(""));
  }
  function rotorMarks(P, th) {
    const F = M.Z([AX[0], AX[1], 1.4 + 9.02]);
    return `<path d="${G.spokesOf(F, 0, 5, 8.6, 6, P, { phase: th })}" fill="none" stroke="#33506f" stroke-width=".8"/>`;
  }
  function staticFront(P) {
    const out = [];
    // the roof slab in section, the transformer on it with its cooling fins and bushings
    out.push(M.sec(P, M.rect(6, 54, 18, 21), Y0, CUT, "concrete"));
    const tx = [34, 46], ty = [-42, -30];
    out.push(M.named("transformer", ISO.tinted(ISO.T.paint, ISO.wbox(P, tx, ty, [21, 29], "mid")) +
      [36, 39, 42].map((x) => ISO.tinted(ISO.T.paint, ISO.wbox(P, [x, x + 0.8], [ty[1], ty[1] + 2.4], [22, 28], "lo"))).join("") +
      [36.5, 40, 43.5].map((x) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, -36, 0.8, 29, 3, P, 12), { tone: "mid" }))).join("")));
    // the dam crest: road, parapets and the gate hoist over the slot
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [-56, -54.6], [Y0, CUT], [46, 47.4], "mid") + ISO.wbox(P, [-41.4, -40], [Y0, CUT], [46, 47.4], "mid")));
    out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [-53, -46.6], [-14, -4], [46, 52], "mid")), ISO.tinted(ISO.T.steel, S(K.cylinder(-49.8, -9, 1.6, 52, 1.2, P, 16), { tone: "hi" })));
    // right bank and the pylon taking the line away
    out.push(M.pylon(P, 116, -26, -4, 40), M.tree(P, 122, -8, -4, 1), M.tree(P, 108, -44, -4, 1.2));
    return out.join("");
  }

  ISO.add({
    name: "hydro", title: "Hydroelectric station", compare: "hydro 480 270 520",
    about: "A cut-away model of a hydro station: reservoir, dam, intake gate, penstock, Francis turbine, generator and tailrace; open the gate and the runner spins up.",
    line: "hydro cx cy width labels=1 gate=0..1 level=0..1 lit=dam|penstock|gate|turbine|generator|transformer",
    demo: { line: "hydro 480 275 560 gate=0", script: [{ set: { gate: 1 }, hold: 6 }, { set: { level: 0.3 }, hold: 4 }] },
    make([cx, cy, size = 520], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.1, H = size * 0.66;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -57, -44), [-130, Y0, 54], [130, CUT, 54], [116, -26, 40]], cx, cy, W, H, { azimuth: 64, elevation: 27 }, parent);
      g.innerHTML = `<g>${staticBack(P)}</g><g data-part="water"></g><g data-part="bore"></g><g data-part="gate"></g><g>${caseBack(P)}</g><g data-name="turbine" data-part="runner"></g><g>${genSvg(P)}</g><g data-part="marks"></g><g>${staticFront(P)}</g><g data-part="flow"></g><g data-part="line"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), hub = hubOf(P);
      RUN.clear();
      const s = { gate: ISO.clamp(ISO.num(o, "gate", 1), 0, 1), lv: ISO.clamp(ISO.num(o, "level", 1), 0, 1), q: 0, th: 0, ph: 0 };
      const want = { gate: s.gate, lv: s.lv };
      s.q = s.gate;
      let lit = o.lit || "";
      const draw = () => {
        const L = lvlZ(s.lv);
        w.rebuild(el.water, L.toFixed(1), () => {
          const res = [[-130, -6], [-56, -6], [-56, L], [-130, L]], tail = [[52, -30], [96, -30], [104, -4], [104, TAIL], [52, TAIL]];
          return M.sec(P, res, Y0, CUT, "water", M.grains(P, [[-130, -6], [-56, -6], [-56, -3], [-130, -3]], CUT, 26, "#6b5a3a", 0.6, 7)) + M.sec(P, [[52, -30], [96, -30], [100.6, TAIL], [52, TAIL]], Y0, CUT, "water") +
            // trash rack in front of the intake: its bars cut, a row of dots
            D([...Array(7)].map((_, i) => K.iso([-58.5, CUT + 0.1, 8.4 + i * 1.9], P)), { size: 0.7, tone: "hi" });
        });
        w.rebuild(el.bore, s.q.toFixed(2), () => face(P, band(PEN, 3.4), `color-mix(in srgb,#7fb7ea ${Math.round(25 + 75 * s.q)}%,#d9dde1)`, "#2f343a", 0.6));
        const gz = 9 + 13 * s.gate;
        w.rebuild(el.gate, gz.toFixed(2), () => M.named("gate", face(P, M.rect(-51.4, -48.2, gz, gz + 10.5), "#e2c986", "#6b5114", 0.8) + face(P, M.rect(-50.2, -49.4, gz + 10.5, 52), "#3c3f45", "#2f343a", 0.3)));
        // the runner repeats every 1/13 turn: 20 poses, each built once
        const pitch = (Math.PI * 2) / 13, q = Math.round((((s.th % pitch) + pitch) % pitch) / pitch * 20) % 20;
        w.rebuild(el.runner, q, () => { if (!RUN.has(q)) RUN.set(q, runnerSvg(P, (q / 20) * pitch, hub)); return RUN.get(q); });
        const mq = Math.round((((s.th % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) / (Math.PI / 3) * 24) % 24;
        w.rebuild(el.marks, mq, () => rotorMarks(P, (mq / 24) * (Math.PI / 3)));
        const fk = s.q > 0.02 ? `${(Math.round(s.ph * 2) / 2 % 14).toFixed(1)} ${s.q.toFixed(2)}` : "";
        w.rebuild(el.flow, fk, () => fk && (M.flow(P, [[-120, CUT + 0.2, L - 8], [-64, CUT + 0.2, 15]], s.ph * 0.5, { amount: s.q, color: "#1f4f8f" }) +
          M.flow(P, PEN.map(([x, z]) => [x, CUT + 0.2, z]), s.ph, { amount: s.q, color: "#fdfdfb", w: 1.4 }) +
          M.flow(P, [[30, CUT + 0.2, FLOOR - 1], [30, CUT + 0.2, -26], [40, CUT + 0.2, -27], [52, CUT + 0.2, -25], [96, CUT + 0.2, -22]], s.ph * 0.7, { amount: s.q, color: "#1f4f8f" })));
        w.rebuild(el.line, "l", () => {
          const k = K.cameraOf(P).k, a = K.iso([43.5, -36, 32], P), b = K.iso([116 - 12, -26, -4 + 40 * 0.78 - 2.4], P), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 10 * k];
          return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="#3c3f45" stroke-width="${(0.5 * k).toFixed(2)}"/>`;
        });
        w.rebuild(el.words, lab ? L.toFixed(0) : "", () => !lab ? "" : [
          M.label(P, [-96, CUT, L + 3], "reservoir", "#1f4f8f"), M.label(P, [-48, CUT, 58], "dam"), M.label(P, [-20, CUT, -1], "penstock", "#444", { anchor: "start" }),
          M.label(P, [30, CUT, FLOOR - 13], "turbine"), M.label(P, [30, -10, 18], "generator", "#33506f", { dy: -22 }), M.label(P, [78, CUT, TAIL + 3], "river", "#1f4f8f"), M.label(P, [116, -26, 40], "to the grid", "#444", { dy: -8 })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.gate !== undefined) want.gate = ISO.clamp(+p.gate, 0, 1);
        if (p.level !== undefined) want.lv = ISO.clamp(+p.level, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      // the gate travels at a hoist's pace; the water column and the runner follow it with their own lag
      g.update = (dt) => {
        const calm = ISO.still();
        s.gate = calm ? want.gate : s.gate + Math.sign(want.gate - s.gate) * Math.min(Math.abs(want.gate - s.gate), dt * 0.5);
        s.lv = ISO.follow(s.lv, want.lv, dt, 0.8, calm);
        s.q = ISO.follow(s.q, s.gate, dt, 0.9, calm);
        if (!calm) { s.th += dt * 4.2 * s.q; s.ph += dt * 22 * s.q; }
        draw();
        return s.q > 0.01 || s.gate !== want.gate || Math.abs(s.lv - want.lv) > 1e-3;
      };
      g.readout = () => {
        const H = lvlZ(s.lv) - TAIL, Q = QMAX * s.q, Pw = (ETA * 1000 * 9.81 * Q * H) / 1e6;
        return `gate ${Math.round(s.gate * 100)}% · head ${H.toFixed(0)} m · flow ${Q.toFixed(0)} m³/s · power = η ρ g Q H = 0.9 × 1000 × 9.81 × ${Q.toFixed(0)} × ${H.toFixed(0)} ≈ ${Pw.toFixed(0)} MW`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
