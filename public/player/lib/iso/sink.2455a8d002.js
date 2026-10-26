// "sink cx cy width flow=0..1 plug=0|1 lab=1 lit=tap|bowl|trap|valves" — a kitchen sink on its base cabinet, doors off.
// The worktop carries a stainless sink: its deck, the bowl with the rolled rim round its opening, the strainer basket
// in the drain (or the plug) and the overflow slot in the back wall. Behind the bowl a single-lever mixer: its base,
// body, cartridge cap, the lever on its side, the swan-neck spout and the aerator. In the cabinet: the two shut-off
// (angle) valves on the back panel, red for hot and blue for cold, with the braided hoses up to the tap's tails; under
// the bowl the strainer body and its locknut, the overflow tube coming down behind the bowl to the waste, the
// tailpiece, the trap with its slip nuts and the trap arm into the wall. set({ flow }) lifts the lever: about 8 L/min
// leaves the aerator at 0.4 m/s and the stream thins as it falls (2.7 m/s at the bowl, so √(0.4/2.7) ≈ 0.4 of its
// width). set({ plug: 1 }) puts the plug in and the bowl fills (shown 15× fast) up to the overflow, which then takes
// the extra water; plug 0 lets it drain. World units: 1 cm. Bowl 40 × 32 × 18 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const WT = 86, DECK = 89.8, FLOOR = 71.8;                          // worktop underside, sink deck, bowl floor
  const BOWL = { x: -20, y: -14, w: 40, d: 32, r: 4 }, TAPER = 1.5;
  const DRAIN = [0, 2], TAP = [0, -20], AER = [0, -3, 110.4], VZ = 30;            // VZ: shut-off valves' height
  const OVER = 84.4, Q = 8, FAST = 15;                                 // overflow level, L/min, fill shown fast
  const AREA = 40 * 32 - (4 - Math.PI) * 16;                          // cm²
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const hex = (r, ph = 0) => Array.from({ length: 6 }, (_, i) => [Math.cos(ph + (i * Math.PI) / 3) * r, Math.sin(ph + (i * Math.PI) / 3) * r]);
  let uid = 0;

  // A pipe through points, bends rounded with G.fillet, drawn as short cylinders far to near; no rim lines at the
  // joints, so it reads as one bent pipe.
  function run(P, pts, r, bend, style = { tone: "hi" }) {
    const path = G.fillet(pts, bend, 6), segs = [];
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1], d = b.map((v, k) => v - a[k]), l = Math.hypot(...d);
      if (l < 1e-3) continue;
      segs.push({ a, d: d.map((v) => v / l), l });
    }
    return segs.map((sg, i) => ({ sg, i, k: K.depthOf(sg.a.map((v, k) => v + sg.d[k] * sg.l / 2), P) })).sort((p, q) => p.k - q.k)
      .map(({ sg, i }) => S(G.disc(i ? -0.1 : 0, sg.l, r, G.frameAlong(sg.a, sg.d), P, { rims: segs.length === 1 ? "all" : i === 0 ? "first" : i === segs.length - 1 ? "last" : "none" }), { ...style, crease: "none" })).join("");
  }
  // a slip nut: a ring round the pipe (its hole is the pipe), hex-ish by a ribbed band
  const nut = (P, F, s0, r) => S(G.ringBand(s0, s0 + 1.8, r, r + 0.9, F, P), { tone: "mid" });

  function cabinetSvg(P) {
    const out = [], floor = { x: -52, y: -40, w: 104, d: 84, r: 3 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -2, 2, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(floor, -2, 2, P, 4, 0.5), { tone: "lo", crease: "none" })));
    out.push(ISO.wbox(P, [-38, 38], [-27.8, 24], [0, 10], "lo"));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-38.2, 38.2], [-29, -27.8], [10, WT], "mid") + ISO.wbox(P, [-40, -38.2], [-29, 29], [0, WT], "mid") + ISO.wbox(P, [-38.2, 38.2], [-27.8, 29], [10, 11.8], "mid")));
    // the hinge cups on the left side panel, where the doors hung
    for (const z of [20, 74]) out.push(S(G.disc(0, 0.5, 1.8, G.frameOf([-38.2, 25, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    // the waste pipe out of the back panel, with its cover ring
    const Bk = yAx([0, -27.8, 57]);
    out.push(S(G.disc(0, 0.5, 4.2, Bk, P), { tone: "mid" }));
    return out.join("");
  }
  // Shut-off valves: a cover ring, the stub from the wall, the valve body, the outlet turning up, the oval handle.
  function valvesSvg(P) {
    const out = [];
    for (const [x, tint] of [[-12, ISO.T.red], [12, ISO.T.blue]]) {
      const F = yAx([x, -27.8, VZ]);
      out.push(S(G.disc(0, 0.4, 2.8, F, P), { tone: "mid" }), ISO.tinted(ISO.T.steel, S(G.disc(0.4, 3.2, 0.8, F, P), { tone: "hi" }) + S(G.disc(3.2, 6.6, 1.7, F, P), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 4, 0.75, zAx([x, -22.8, VZ + 1.6]), P), { tone: "hi" })));
      out.push(ISO.tinted(tint, S(G.prismOf(yAx([x, -21.2, VZ]), [[-2.4, -1], [2.4, -1], [2.4, 1], [-2.4, 1]], 0, 1.2, P), { tone: "hi" })));
      // the braided hose from the valve's outlet to the tap's tail under the worktop
      out.push(ISO.tinted(ISO.T.steel, run(P, [[x, -22.8, VZ + 5.6], [x, -22.8, 52], [x * 0.12, -20, 76], [x * 0.12, -20, 83.4]], 0.7, 6, { tone: "mid" })));
      out.push(ISO.tinted(ISO.T.steel, S(G.prismOf(zAx([x * 0.12, -20, 83.4]), hex(1.1), 0, 1.4, P), { tone: "hi" })));
    }
    return named("valves", out.join(""));
  }
  // Under the bowl: the overflow tube behind it, the bowl's underside, the strainer body, locknut, tailpiece, trap.
  function wasteSvg(P) {
    const out = [], up = zAx([DRAIN[0], DRAIN[1], 0]);
    out.push(run(P, [[0, -15, OVER + 1], [0, -17, OVER + 1], [0, -17, 66.4], [0, DRAIN[1] - 4.4, 66.4]], 0.95, 2.5, { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-20.6, 20.6], [-14.6, 18.6], [FLOOR - 0.8, WT], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(65, FLOOR - 0.8, 4.4, up, P), { tone: "hi" }) + S(G.ringBand(68.2, 70.4, 4.4, 5.6, up, P), { tone: "mid" })));
    // tailpiece, the slip nut at its joint, the J-bend (its U holds the water seal), the outlet nut and the trap arm
    const back = G.frameOf([0, -14, 57], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(named("trap", run(P, [[0, DRAIN[1], 65], [0, DRAIN[1], 58]], 1.9, 1) + run(P, [[0, DRAIN[1], 58], [0, DRAIN[1], 50], [0, -8, 50], [0, -8, 57], [0, -15, 57]], 1.9, 4) +
      nut(P, up, 56.2, 1.9) + nut(P, back, 0, 1.9) + run(P, [[0, -15, 57], [0, -27.8, 57]], 1.9, 1)));
    return out.join("");
  }
  const frontSvg = (P) => ISO.tinted(ISO.T.wood, ISO.wbox(P, [38.2, 40], [-29, 29], [0, WT], "mid") + ISO.wbox(P, [-38.2, 38.2], [27.4, 29], [80, WT], "mid"));
  // Worktop, the sink's deck with the opening's rolled rim, and the drainer grooves on the right.
  function topSvg(P) {
    const out = [ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -44, y: -31, w: 88, d: 62, r: 1.5 }, WT, 3.2, P, 4, 0.6), { tone: "mid" }))];
    out.push(ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -38, y: -27, w: 76, d: 52, r: 4 }, WT + 3.2, 0.6, P, 6, 0.3), { tone: "hi", crease: "none" })));
    for (let y = -10; y <= 14; y += 4) out.push(L(K.planOutline({ x: 23.5, y, w: 11, d: 1.4, r: 0.7 }, DECK, P, 3), { tone: "lo" }));
    return out.join("");
  }
  // The bowl's inside, seen through its opening: floor, the far walls (shaded by facing), overflow slot, strainer.
  function bowlSvg(P, id) {
    const top = K.roundedPlan(BOWL, 4), bot = K.roundedPlan(K.insetPlan(BOWL, TAPER), 4), { sinA, cosA } = K.cameraOf(P);
    const cx = BOWL.x + BOWL.w / 2, cy = BOWL.y + BOWL.d / 2, out = [];
    const ring = (pts, z) => K.pathOf(pts.map(([x, y]) => K.iso([x, y, z], P)), true);
    out.push(`<clipPath id="${id}b"><path d="${ring(top, DECK)}"/></clipPath>`);
    const inner = [`<path d="${ring(bot, FLOOR)}" fill="#c5cad0"/>`];
    for (let i = 0; i < top.length; i++) {
      const j = (i + 1) % top.length, m = [(top[i][0] + top[j][0]) / 2, (top[i][1] + top[j][1]) / 2];
      const n = [cx - m[0], cy - m[1]], ln = Math.hypot(...n) || 1, f = (n[0] * cosA + n[1] * sinA) / ln;
      if (f <= 0.01) continue;
      const shade = Math.round(55 + 40 * f);
      inner.push(`<path d="${K.pathOf([[...top[i], DECK], [...top[j], DECK], [...bot[j], FLOOR], [...bot[i], FLOOR]].map((p) => K.iso(p, P)), true)}" fill="color-mix(in srgb, #e3e6e9 ${shade}%, #8d9096)" stroke="color-mix(in srgb, #e3e6e9 ${shade}%, #8d9096)" stroke-width="0.4"/>`);
    }
    // the overflow slot in the back wall (on the tapered wall's plane)
    const wy = (z) => BOWL.y + TAPER * (DECK - z) / (DECK - FLOOR);
    inner.push(`<path d="${K.pathOf([[-3.5, OVER], [3.5, OVER], [3.5, OVER + 1.6], [-3.5, OVER + 1.6]].map(([x, z]) => K.iso([x, wy(z) + 0.02, z], P)), true)}" fill="#3a3e44" stroke="#3a3e44" stroke-width="0.4"/>`);
    out.push(`<g clip-path="url(#${id}b)">${inner.join("")}<g data-part="drain"></g><g data-part="water"></g><g data-part="low"></g></g>`);
    // the rolled rim: the opening's edge and the bead just inside it
    out.push(`<path d="${ring(top, DECK)}" fill="none" stroke="#3c3f45" stroke-width="0.9"/>`, `<path d="${ring(K.roundedPlan(K.insetPlan(BOWL, -1.2), 4), DECK)}" fill="none" stroke="#8d9096" stroke-width="0.6"/>`);
    return named("bowl", out.join(""));
  }
  // The strainer basket (holes round a centre post) or, plug in, the plug with its knob.
  const drainSvg = (P, plug) => {
    const F = zAx([DRAIN[0], DRAIN[1], FLOOR]);
    if (plug) return `<path d="${G.circleOf(F, 0.05, 4.4, P)}" fill="#d9dadd" stroke="#3c3f45" stroke-width="0.7"/><path d="${G.circleOf(F, 0.6, 1.2, P)}" fill="#a2a5ab" stroke="#3c3f45" stroke-width="0.6"/>`;
    const holes = [];
    [[1.8, 8], [3, 14]].forEach(([r, n]) => { for (let i = 0; i < n; i++) holes.push(K.iso(G.pointOf(F, 0.05, r, (i / n) * Math.PI * 2), P)); });
    return `<path d="${G.circleOf(F, 0.05, 4.4, P)}" fill="#b6b9be" stroke="#3c3f45" stroke-width="0.7"/><path d="${G.circleOf(F, 0.05, 3.7, P)}" fill="none" stroke="#8d9096" stroke-width="0.5"/>` +
      D(holes, { size: 0.55, tone: "hi" }) + `<path d="${G.circleOf(F, 0.05, 0.8, P)}" fill="#8d9096" stroke="#3c3f45" stroke-width="0.5"/>`;
  };
  // The mixer: base, body, cartridge cap, the swan-neck spout and its aerator. The lever is live.
  function tapSvg(P) {
    const F = zAx([TAP[0], TAP[1], DECK]), out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.8, 3.3, F, P), { tone: "mid" }) + S(G.disc(0.8, 12, 2.4, F, P), { tone: "hi" }) + S(G.disc(12, 13.6, 2.6, F, P), { tone: "hi" }) + S(G.disc(13.6, 14.8, 1.6, F, P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, run(P, [[TAP[0], TAP[1], DECK + 14.8], [TAP[0], TAP[1], 121], [AER[0], AER[1] - 1, 121], [AER[0], AER[1], 112]], 1.15, 6, { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 1.6, 1.4, zAx([AER[0], AER[1], AER[2]]), P), { tone: "mid" })));
    return out.join("");
  }
  // The lever: a blade from a hub on the body's right side, lifted by angle `lift` about the x axis... turned in the
  // y–z plane so it rises toward you.
  function leverSvg(P, lift) {
    const pv = [TAP[0] + 2.4, TAP[1], DECK + 9.4], c = Math.cos(lift), s = Math.sin(lift);
    const F = G.frameOf(pv, [1, 0, 0], [0, c, s], [0, -s, c]);
    return ISO.tinted(ISO.T.steel, S(G.disc(0, 1.2, 1.5, G.frameOf(pv, [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }) + S(G.prismOf(G.frameOf([pv[0] + 0.3, pv[1], pv[2]], [1, 0, 0], [0, c, s], [0, -s, c]), [[-0.6, -0.5], [9.5, -0.3], [9.5, 0.5], [-0.6, 0.7]], 0, 0.9, P), { tone: "hi" }));
  }
  // The stream: a tapered column (the water speeds up as it falls, so it thins), its moving glints, the splash ring.
  function streamSvg(P, f, bottom, clock, from, to) {
    if (f < 0.02 || from <= to) return "";
    const top = AER[2] - 1.6, h = top - bottom, kk = K.cameraOf(P).k, w0 = 0.9 * Math.sqrt(f);
    const v0 = 0.42 * f, edge = (sd) => Array.from({ length: 9 }, (_, i) => { const z = from - ((from - to) * i) / 8, v = Math.sqrt(v0 * v0 + 2 * 9.81 * (top - z) / 100); const q = K.iso([AER[0], AER[1], z], P); return [q[0] + sd * w0 * kk * Math.sqrt(Math.max(v0, 0.05) / v), q[1]]; });
    const l = edge(-1), r = edge(1), out = [`<path d="${K.pathOf([...l, ...r.reverse()], true)}" fill="#9cc8ee" fill-opacity="${(0.8 * Math.min(1, f * 3)).toFixed(2)}" stroke="#2b6cc4" stroke-width="0.5" stroke-opacity="${Math.min(1, f * 3).toFixed(2)}"/>`];
    for (let i = 0; i < 3; i++) { const t = ((clock * 1.6 + i / 3) % 1), z = top - h * t * t; if (z > from || z < to) continue; const q = K.iso([AER[0], AER[1], z], P), wq = w0 * kk * 0.35; out.push(`<path d="M${(q[0] - wq).toFixed(1)} ${q[1].toFixed(1)}q${wq.toFixed(1)} ${(-3).toFixed(1)} ${(2 * wq).toFixed(1)} 0q${(-wq).toFixed(1)} 3 ${(-2 * wq).toFixed(1)} 0z" fill="#ffffff" opacity=".8"/>`); }
    const F = zAx([AER[0], AER[1], bottom]), rr = 1.6 + 1.4 * f + 0.6 * Math.sin(clock * 9);
    if (to <= bottom + 0.01) out.push(`<path d="${G.circleOf(F, 0.05, rr, P)}" fill="#cfe5f7" fill-opacity=".7" stroke="#2b6cc4" stroke-width="0.5"/>`);
    return out.join("");
  }
  const waterSvg = (P, level) => {
    if (level < 0.05) return "";
    const z = FLOOR + level, k = level / (DECK - FLOOR), pts = K.roundedPlan(K.insetPlan(BOWL, TAPER * (1 - k)), 4);
    return `<path d="${K.pathOf(pts.map(([x, y]) => K.iso([x, y, z], P)), true)}" fill="#9cc8ee" fill-opacity=".55" stroke="#2b6cc4" stroke-width="0.7"/>`;
  };

  ISO.add({
    name: "sink", title: "Kitchen sink", compare: "sink 480 280 380",
    about: "A kitchen sink on its cabinet with the doors off: lift the mixer's lever and about 8 L/min runs from the aerator into the bowl and out through the strainer and trap; with the plug in it fills to the overflow.",
    line: "sink cx cy width flow=0..1 plug=0|1 lab=1 lit=tap|bowl|trap|valves",
    demo: { line: "sink 480 280 380 flow=0", script: [{ set: { flow: 1 }, hold: 3 }, { set: { plug: 1 }, hold: 5 }, { set: { flow: 0, plug: 0 }, hold: "settle" }] },
    make([cx, cy, width = 380], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.4, H = width * 1.2;
      const { P, g } = ISO.frame([[-52, -40, -2], [52, -40, -2], [-52, 44, -2], [52, 44, -2], [-44, -31, 89], [44, 31, 89], [0, -20, 123]], cx, cy, W, H, { azimuth: 70, elevation: 30 }, parent);
      const id = `sk${uid++}`;
      const s = { f: ISO.clamp(ISO.num(o, "flow", 0), 0, 1), fT: 0, plug: o.plug === "1", level: 0, clock: 0, lit: o.lit || "" };
      s.fT = s.f;
      const words = !lab ? "" : [
        ISO.word(K.iso([TAP[0], TAP[1], 123], P), "mixer tap", "#555", { size: 13, dy: -8 }),
        ISO.word(K.iso([44, 31, 87], P), "worktop", "#555", { size: 13, anchor: "start", dy: 6 }),
        ISO.word(K.iso([-40, 29, VZ], P), "shut-off valves", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([-40, 29, 56], P), "trap", "#555", { size: 13, anchor: "end" }),
      ].join("");
      g.innerHTML = `<g>${cabinetSvg(P)}${valvesSvg(P)}${wasteSvg(P)}${frontSvg(P)}${topSvg(P)}${bowlSvg(P, id)}</g><g data-part="stream"></g>` +
        `<g data-name="tap">${tapSvg(P)}<g data-part="lever"></g></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const levers = new Map();
      const draw = () => {
        const lift = Math.round(s.f * 40) / 40;
        w.rebuild(el.lever, lift.toFixed(3), () => levers.get(lift) ?? (levers.set(lift, leverSvg(P, lift * 0.45)), levers.get(lift)));
        w.rebuild(el.drain, `${s.plug}`, () => drainSvg(P, s.plug));
        w.rebuild(el.water, s.level.toFixed(2), () => waterSvg(P, s.level));
        const sk = s.f > 0.02 ? `${s.f.toFixed(2)} ${s.level.toFixed(1)} ${s.clock.toFixed(2)}` : "";
        w.rebuild(el.stream, sk, () => streamSvg(P, s.f, FLOOR + s.level, s.clock, AER[2] - 1.6, DECK));
        w.rebuild(el.low, sk, () => streamSvg(P, s.f, FLOOR + s.level, s.clock, DECK, FLOOR + s.level));
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.flow !== undefined) s.fT = ISO.clamp(+p.flow || 0, 0, 1); if (p.plug !== undefined) s.plug = !!+p.plug; if (p.lit !== undefined) s.lit = p.lit; };
      const max = OVER - FLOOR;
      // cm/s of level: inflow Q·f L/min over the bowl's area; out through the open drain at up to 25 L/min
      const rate = () => {
        const qin = (Q * s.f * 1000) / 60, qout = s.plug ? (s.level >= max - 0.05 ? qin : 0) : s.level > 0 ? (25 * 1000) / 60 : 0;
        return (qin - qout) / AREA;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (!calm) s.clock += dt;
        s.f = ISO.follow(s.f, s.fT, dt, 0.3, calm);
        if (Math.abs(s.f - s.fT) < 0.002) s.f = s.fT;
        const target = s.plug ? (s.f > 0 ? max : s.level) : 0;
        s.level = calm ? target : ISO.clamp(s.level + rate() * dt * FAST, 0, max);
        draw();
        const filling = (s.plug && s.f > 0 && s.level < max) || (!s.plug && s.level > 0);
        return s.f !== s.fT || filling;
      };
      g.readout = () => {
        const q = (Q * s.f).toFixed(1), litres = (s.level * AREA / 1000).toFixed(1), full = (max * AREA / 1000).toFixed(0);
        if (s.plug && s.level >= max - 0.05 && s.f > 0.02) return `full to the overflow (about ${full} L) · the slot in the back of the bowl takes the extra ${q} L/min down to the trap`;
        if (s.plug && s.f > 0.02) return `plug in · filling · ${litres} L of about ${full} L · at ${q} L/min that takes about ${(full / Q).toFixed(1)} minutes (shown fast)`;
        if (!s.plug && s.level > 0.05) return `plug out · draining · ${litres} L left, down the strainer into the trap`;
        if (s.f > 0.02) return `lever up · about ${q} L/min leaves the aerator at 0.4 m/s and thins as it speeds up to 2.7 m/s · down the strainer into the trap`;
        return s.plug && s.level > 0.05 ? `tap off · ${litres} L held by the plug` : "tap off";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
