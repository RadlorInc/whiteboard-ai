// "gears cx cy width spin=1 n1=12 n2=24 n3=16 rpm=60 lab=1 lit=driver|idler|driven|crank" — a gear train on a bench plate.
// Three steel spur gears (module 4: pitch radius = 2 × teeth) turn on shafts in an upright plate; a crank turns the
// small driver. Meshing teeth move at the same pitch-line speed, so each gear turns at n1/n × the driver's speed and
// neighbours turn opposite ways: the idler reverses, the driven gear turns the same way as the driver at n1/n3.
// One tooth on each gear is painted so the counting can be seen. spin=1 runs it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const M = 4, Y0 = 3, Y1 = 11, PLATE = [-7, -1], TAU = Math.PI * 2;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const hex = (r, a = 0) => Array.from({ length: 6 }, (_, i) => [Math.cos(a + i * Math.PI / 3) * r, Math.sin(a + i * Math.PI / 3) * r]);
  const STEEL = ["#9a9da3", "#e3e4e7"], FACE = "#eef0f2", INK = "#3c3f45";

  // The tooth outline in x–z round a centre: root arc, flank, tip arc, flank (a trapezoid tooth, true module sizes).
  function outline(c, n, a) {
    const r = (M * n) / 2, ra = r + M, rf = r - 1.25 * M, p = TAU / n, pts = [];
    for (let i = 0; i < n; i++) {
      const t = a + i * p;
      for (const [f, rr] of [[-0.5, rf], [-0.3, rf], [-0.17, ra], [-0.06, ra], [0.06, ra], [0.17, ra], [0.3, rf]]) pts.push([c[0] + Math.cos(t + f * p) * rr, c[1] + Math.sin(t + f * p) * rr]);
    }
    return pts;
  }
  // Face detail that turns with the gear: lightening holes (big gears) or a web ring, the painted tooth, the keyway.
  function faceSvg(P, c, n, a, holes) {
    const r = (M * n) / 2, F = yAx([c[0], 0, c[1]]), out = [];
    const ringPts = (rr, s, cc = [0, 0]) => K.pathOf(Array.from({ length: 33 }, (_, j) => K.iso(G.pointOf({ ...F, o: G.pointOf(F, 0, Math.hypot(...cc), Math.atan2(cc[1], cc[0])) }, s, rr, (j / 32) * TAU), P)), true);
    if (holes) {
      const d = [];
      for (let i = 0; i < holes; i++) { const h = a + (i + 0.5) * TAU / holes, hc = [Math.cos(h) * r * 0.58, Math.sin(h) * r * 0.58]; d.push(ringPts(r * 0.15, Y1 + 0.02, hc)); }
      out.push(`<path d="${d.join("")}" fill="#c9ccd1" stroke="${INK}" stroke-width="0.8"/>`);
    }
    out.push(L(ringPts(r - 1.25 * M - 2.5, Y1 + 0.02), { tone: "faint" }));
    // the painted tooth: a red mark on the tip of tooth 0, drawn on the face
    const tip = [0, 1].map((k) => G.pointOf(F, Y1 + 0.03, r + M * (0.2 + 0.6 * k), a));
    out.push(`<path d="${K.pathOf(tip.map((p) => K.iso(p, P)))}" stroke="#c4382c" stroke-width="3.6" stroke-linecap="round"/>`);
    return out.join("");
  }

  ISO.add({
    name: "gears", title: "Gear train", compare: "gears 480 270 460 spin=1",
    about: "Three spur gears on an upright plate, turned by a crank: each gear turns at (driver teeth ÷ its teeth) × the driver's speed, and neighbours turn opposite ways.",
    line: "gears cx cy width spin=1 n1=12 n2=24 n3=16 rpm=60 lab=1 lit=driver|idler|driven|crank",
    demo: { line: "gears 480 270 460", script: [{ set: { spin: 1 }, hold: 4 }, { set: { lit: "driven" }, hold: 3 }, { set: { spin: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 0.98;
      const N = [ISO.num(o, "n1", 12), ISO.num(o, "n2", 24), ISO.num(o, "n3", 16)].map((v) => Math.round(ISO.clamp(v, 8, 40)));
      const rpm = ISO.clamp(ISO.num(o, "rpm", 60), 5, 200), R = N.map((n) => (M * n) / 2);
      // centres in x–z: driver low left, idler up to the right, driven down to the right; angles along the mesh lines
      const th = [0.42, -0.5], C = [[0, 0]];
      C[1] = [C[0][0] + Math.cos(th[0]) * (R[0] + R[1]), C[0][1] + Math.sin(th[0]) * (R[0] + R[1])];
      C[2] = [C[1][0] + Math.cos(th[1]) * (R[1] + R[2]), C[1][1] + Math.sin(th[1]) * (R[1] + R[2])];
      const zLow = Math.min(...C.map((c, i) => c[1] - R[i])) - M - 14, x0 = Math.min(...C.map((c, i) => c[0] - R[i])) - M - 16, x1 = Math.max(...C.map((c, i) => c[0] + R[i])) + M + 16;
      const zTop = Math.max(...C.map((c, i) => c[1] + R[i])) + M + 10;
      const lift = -zLow;                                                            // the base board's top is z = 0
      C.forEach((c) => (c[1] += lift));
      const BASE = { x: x0 - 6, y: -26, w: x1 - x0 + 12, d: 52, r: 5 };
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -12, 0), [x0, PLATE[0], zTop + lift], [x1, Y1 + 6, zTop + lift], [C[0][0], 34, C[0][1] - 20]], cx, cy, W, H, { azimuth: 64, elevation: 20, pad: 8 }, parent);
      const pitch = N.map((n) => TAU / n), sym = [0, 1, 2].map((i) => TAU / (i === 0 ? N[0] : N[i] % 6 === 0 ? 6 : N[i] % 4 === 0 ? 4 : 1));
      const holes = [0, N[1] >= 20 ? 6 : 0, N[2] >= 16 ? 4 : 0];
      // phase so tooth meets gap on each mesh line: a2 = θ + π + p2/2 − (a1 − θ)·n1/n2
      const angles = (a1) => {
        const a2 = th[0] + Math.PI + pitch[1] / 2 - (a1 - th[0]) * (N[0] / N[1]);
        const a3 = th[1] + Math.PI + pitch[2] / 2 - (a2 - th[1]) * (N[1] / N[2]);
        return [a1, a2, a3];
      };
      const crankF = yAx([C[0][0], 0, C[0][1]]), armLen = R[0] + 10;

      // static: base, plate with its feet and bolts, shaft bosses, spacers, name plate
      const st = [ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 7, feet: 4 }))];
      const plateTop = C[1][1] + 16;
      st.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [x0, x1], PLATE, [0, plateTop], "mid")));
      for (const x of [x0 + 6, x1 - 6]) st.push(ISO.wbox(P, [x - 4, x + 4], [PLATE[1], PLATE[1] + 8], [0, 3], "mid"), D([K.iso([x, PLATE[1] + 4, 3], P)], { size: 0.8 }));
      st.push(D([[x0 + 4, plateTop - 4], [x1 - 4, plateTop - 4]].map(([x, z]) => K.iso([x, PLATE[1], z], P)), { size: 0.7 }));
      st.push(ISO.plate(P, { x: (x0 + x1) / 2 - 22, y: 10, w: 44, d: 10, r: 1.2 }));
      // the hubs and nuts below sit on gear faces drawn by ISO.prismY, which the audit can't see (it reports them loose)
      C.forEach((c) => st.push(S(G.disc(PLATE[1], Y0, 5.5, yAx([c[0], 0, c[1]]), P), { tone: "mid" })));

      const parts = ["driver", "idler", "driven"];
      const layer = (cls) => parts.map((n, i) => `<g data-name="${n}"><g data-part="${cls}${i}"></g></g>`).join("");
      const words = !lab ? "" : [
        ISO.word(K.iso([C[0][0], Y1, C[0][1] - R[0] - M - 4], P), `driver ${N[0]} teeth`, "#555", { size: 14, dy: 16 }),
        ISO.word(K.iso([C[1][0], Y1, C[1][1] + R[1] + M + 2], P), `idler ${N[1]}`, "#555", { size: 14, dy: -6 }),
        ISO.word(K.iso([C[2][0] + R[2] + M + 2, Y1, C[2][1]], P), `driven ${N[2]}`, "#555", { size: 14, anchor: "start", dy: 4 }),
      ].join("");
      g.innerHTML = `<g>${st.join("")}</g>${layer("wall")}${layer("face")}<g data-name="crank"><g data-part="crank"></g></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), lights = [...g.querySelectorAll("[data-name]")];
      const memo = new Map(), Q = 24;
      const gearSvg = (i, a) => {
        const steps = Math.round((Q * sym[i]) / pitch[i]), q = Math.round(((((a % sym[i]) + sym[i]) % sym[i]) / pitch[i]) * Q) % steps;
        const aq = (q / Q) * pitch[i], key = `${i}:${q}`;
        if (!memo.has(key)) {
          const F = yAx([C[i][0], 0, C[i][1]]);
          const wall = ISO.prismY(P, outline(C[i], N[i], aq), Y0, Y1, STEEL, FACE, INK);
          const face = `<path d="${K.pathOf(outline(C[i], N[i], aq).map(([x, z]) => K.iso([x, Y1, z], P)), true)}" fill="${FACE}" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>` + faceSvg(P, C[i], N[i], aq, holes[i]) +
            ISO.tinted(ISO.T.steel, S(G.disc(Y1, Y1 + 3, Math.max(6, R[i] * 0.3), F, P), { tone: "hi" }) + S(G.prismOf(F, hex(3.2, aq), Y1 + 3, Y1 + 6, P), { tone: "mid" }));
          const node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
          memo.set(key, [node(wall), node(face)]);
        }
        return [key, memo.get(key)];
      };
      const crankSvg = (a) => {
        const end = G.pointOf(crankF, 0, armLen, a), arm = [];
        // a flat arm from the hub out to a turned handle
        const u = [Math.cos(a), 0, Math.sin(a)], v = [-Math.sin(a), 0, Math.cos(a)];
        const at = (s, l, y) => [C[0][0] + u[0] * s + v[0] * l, y, C[0][1] + u[2] * s + v[2] * l];
        arm.push(ISO.tinted(ISO.T.steel, ISO.box((s, l, y) => at(s, l, y), P, [-3, armLen + 3], [-3, 3], [Y1 + 6, Y1 + 9], "hi")));
        const hF = yAx([end[0], 0, end[2]]);
        arm.push(S(G.solidOf([[Y1 + 9, 2.4], [Y1 + 11, 3.6, 1], [Y1 + 20, 3.8, 1], [Y1 + 23, 2.6]], hF, P), { tone: "hi" }));
        arm.push(D([K.iso(G.pointOf(crankF, Y1 + 9, 0, 0), P)], { size: 1.2, tone: "hi" }));
        return arm.join("");
      };
      const s = { on: o.spin === "1", w: o.spin === "1" ? 1 : 0, a: 0.2 };
      let lit = o.lit || "";
      const draw = () => {
        const A = angles(Math.round(s.a / pitch[0] * Q) * pitch[0] / Q);
        // cached nodes are swapped in, not re-parsed: a gear cycles through a few dozen poses
        const swap = (e, key, node) => { if (e._key !== key) { e._key = key; e.replaceChildren(node); e.parentNode._fresh = true; } };
        A.forEach((a, i) => { const [key, [wall, face]] = gearSvg(i, a); swap(el[`wall${i}`], key, wall); swap(el[`face${i}`], key, face); });
        const qa = Math.round(s.a / pitch[0] * Q); w.rebuild(el.crank, String(qa), () => crankSvg(qa * pitch[0] / Q));
        w.light(lights, lights.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.spin !== undefined) s.on = !!+p.spin; if (p.lit !== undefined) lit = p.lit; };
      // shown slowed to 0.25 rev/s of the driver so the teeth can be followed; the readout gives the true rpm
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, 0.6, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.a -= s.w * 0.25 * TAU * dt;                          // clockwise as you face it
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => {
        const n1 = rpm * s.w, n2 = n1 * N[0] / N[1], n3 = n1 * N[0] / N[2], v = (Math.PI * M * N[0] * n1) / 60;
        return `driver ${N[0]} teeth ${n1.toFixed(0)} rpm clockwise → idler ${N[1]} ${n2.toFixed(0)} rpm anticlockwise → driven ${N[2]} ${n3.toFixed(0)} rpm clockwise · ratio ${N[0]}:${N[2]} · pitch-line speed ${(v / 1000).toFixed(2)} m/s (module 4 mm)`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
