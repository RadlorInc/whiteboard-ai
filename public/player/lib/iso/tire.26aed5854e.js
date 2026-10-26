// "tire cx cy size k=good|flat psi=N lab=1 lit=tyre|rim|nuts|valve|nail" — a road wheel standing on the road.
// A 205/55 R16 tyre (63 cm across, 20.5 cm wide) on a steel rim: tread blocks and grooves, sidewall rings, the rim
// with its vent holes, hub, five lug nuts and the valve stem. The tyre's footprint carries the wheel's load:
// contact area = load ÷ pressure, so at 32 psi a 350 kg corner sits on about 156 cm² and the tyre is barely flattened.
// k=flat puts a nail in the tread and lets the air out: as the pressure falls the footprint grows, the bottom squashes
// and bulges, and the rim sinks toward the road (stopped where the sidewall pinches, 7 cm down). set({ k, psi }).
// World units: 1 = 1 cm. The tyre outline is a prism along the axle (y), rebuilt only when its squash changes.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 31.6, RIM_R = 19.5, W = 20.5, H = W / 2, BOLT_R = 5.6, NUT_R = 1.1, DMAX = 7;
  const LOAD = 350 * 9.81, PSI = 6894.76, GOOD = 32, FLAT = 3;
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, ROAD = ISO.T.road;
  const ROAD_PLAN = { x: -42, y: -20, w: 84, d: 42, r: 4 };
  const NAIL_A = -0.42;                                 // where the nail sits on the tread (angle from +x, in x–z)
  const yAxis = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);

  // The model: the footprint is load ÷ pressure; its length is that over the tread width; the squash is the sagitta.
  const area = (psi) => (LOAD / (Math.max(psi, 0.5) * PSI)) * 1e4;       // cm²
  const squash = (psi) => { const half = Math.min(R - 0.01, area(psi) / W / 2); return Math.min(DMAX, R - Math.sqrt(R * R - half * half)); };
  const patch = (d) => 2 * Math.sqrt(Math.max(0, R * R - (R - d) ** 2));

  // The tyre's outline in x–z for squash d: a circle about the lowered axle, pushed out near the bottom and cut flat
  // on the road. f scales it toward the axle (sidewall rings).
  function outline(d, f = 1, n = 120) {
    const cz = R - d, k = d / DMAX, out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, s = Math.sin(a), r = R + 2.6 * k * Math.max(0, -s) ** 2.5;
      let x = Math.cos(a) * r, z = cz + s * r;
      if (z < 0) z = 0;
      out.push([x * f, cz + (z - cz) * f]);
    }
    return out;
  }
  function tyreSvg(P, d) {
    const pts = outline(d), view = G.viewOf(P), cz = R - d;
    // Tread: a block line across the full width at every third outline point that faces you, and three grooves.
    const blocks = [], grooves = [[], [], []];
    pts.forEach(([x, z], i) => {
      const [x2, z2] = pts[(i + 1) % pts.length], nx = z2 - z, nz = -(x2 - x), seen = nx * view[0] + nz * view[2] > 0.05 * Math.hypot(nx, nz);
      if (seen && i % 3 === 0) blocks.push(K.pathOf([K.iso([x, H, z], P), K.iso([x, -H, z], P)]));
      [-4.5, 0, 4.5].forEach((y, j) => grooves[j].push(seen ? K.iso([x, y, z], P) : null));
    });
    const runs = grooves.flatMap((g) => {
      const i0 = g.indexOf(null);
      if (i0 < 0) return [[...g, g[0]]];
      const out = []; let cur = [];
      for (const p of [...g.slice(i0), ...g.slice(0, i0), null]) { if (p) cur.push(p); else { if (cur.length > 1) out.push(cur); cur = []; } }
      return out;
    });
    const ink = "#121214", face = "#4a4c51";
    const extra = `<path d="${blocks.join("")}" stroke="#25272b" stroke-width="0.6" fill="none"/>` +
      `<path d="${runs.map((r) => K.pathOf(r)).join("")}" stroke="#1a1b1e" stroke-width="0.9" fill="none"/>` +
      // the sidewall: bead ring, a raised rib and the lettering band, all squashed with the tyre
      [0.9, 0.82, 0.72].map((f, i) => `<path d="${K.pathOf(outline(d, f, 96).map(([x, z]) => K.iso([x, H + 0.05, z], P)), true)}" fill="none" stroke="${i === 1 ? "#6a6c71" : "#2b2c30"}" stroke-width="${i === 1 ? 1.4 : 0.6}"/>`).join("");
    return ISO.prismY(P, pts, -H, H, ["#202125", "#55575c"], face, ink, extra) + `<path d="${K.pathOf(G.arcPoints(yAxis(0, H, cz), 0, RIM_R + 0.4, 0, Math.PI * 2, 64).map((p) => K.iso(p, P)), true)}" fill="#2a2b2f"/>`;
  }
  // The rim at the axle (moved down with the squash): rim lip, dish, eight vents, hub, five nuts and the valve stem.
  function rimSvg(P) {
    const F = yAxis(0, 0, R), out = [];
    out.push(S(G.ringBand(H - 2.4, H + 0.3, 17.4, RIM_R, F, P), { tone: "hi", inner: L(G.arcOf(F, H - 1, RIM_R, P), { tone: "faint" }) }));
    out.push(S(G.disc(H - 3.4, H - 2, 17.4, F, P), { tone: "mid" }));
    out.push(L(G.circleOf(F, H - 2, 15.6, P) + G.circleOf(F, H - 2, 9.2, P), { tone: "faint" }));
    out.push(Array.from({ length: 8 }, (_, i) => `<path d="${G.circleOf(yAxis(...G.pointOf(F, H - 2, 12.4, (i * Math.PI) / 4 + 0.39)), 0, 1.8, P)}" fill="#2f3338" stroke="#1b1d20" stroke-width="0.5"/>`).join(""));
    out.push(S(G.disc(H - 2, H - 0.6, 7.6, F, P), { tone: "mid" }), S(G.disc(H - 0.6, H + 0.6, 3.6, F, P), { tone: "hi" }), L(G.circleOf(F, H + 0.6, 2, P), { tone: "faint" }));
    return ISO.tinted(STEEL, out.join(""));
  }
  function nutsSvg(P) {
    const F = yAxis(0, 0, R), out = [];
    for (let k = 0; k < 5; k++) {
      const c = G.pointOf(F, 0, BOLT_R, (k * 2 * Math.PI) / 5 + 0.3), N = yAxis(c[0], 0, c[2]);
      out.push(S(G.prismOf(N, Array.from({ length: 6 }, (_, i) => [Math.cos(0.3 + k + (i * Math.PI) / 3) * NUT_R, Math.sin(0.3 + k + (i * Math.PI) / 3) * NUT_R]), H - 0.6, H + 1.4, P), { tone: "hi" }), S(G.disc(H + 1.4, H + 1.8, 0.5, N, P), { tone: "mid" }));
    }
    return ISO.tinted(STEEL, out.join(""));
  }
  function valveSvg(P) {
    const c = G.pointOf(yAxis(0, 0, R), 0, 16.6, -2.2), F = yAxis(c[0], 0, c[2]);
    return ISO.tinted(RUBBER, S(G.disc(H - 2, H + 1.6, 0.8, F, P), { tone: "hi" })) + ISO.tinted(ISO.T.plastic, S(G.disc(H + 1.6, H + 3, 0.95, F, P), { tone: "hi" }));
  }
  // The nail: its head flush on the tread, the shank in at a slant; placed on the outline for squash d.
  function nailSvg(P, d) {
    const cz = R - d, k = d / DMAX, s = Math.sin(NAIL_A), r = R + 2.6 * k * Math.max(0, -s) ** 2.5 + 0.05;
    const at = [Math.cos(NAIL_A) * r, 4, Math.max(0.6, cz + s * r)], n = [Math.cos(NAIL_A), 0, s];
    return ISO.tinted(STEEL, S(G.disc(0, 0.5, 1.9, G.frameAlong(at, n), P), { tone: "hi" }) + D([K.iso(G.add3(at, G.mul3(n, 0.45)), P)], { size: 0.5, tone: "mid" }));
  }

  ISO.add({
    name: "tire", title: "Road wheel and tyre", compare: "tire 480 270 260",
    about: "A wheel on the road; its footprint is load ÷ pressure, so a nail that lets the air out squashes the tyre until the rim nearly sits on the road.",
    line: "tire cx cy size k=good|flat psi=0-50 lab=1 lit=tyre|rim|nuts|valve|nail",
    demo: { line: "tire 480 270 260", script: [{ set: {}, hold: 1.4 }, { set: { k: "flat" }, hold: "settle" }, { set: { k: "good" }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 2.7, BH = size * 1.8;
      const { P, g } = ISO.frame([...K.boxCorners(ROAD_PLAN, -5, 0), [-R, 0, 2 * R + 2], [R, 0, 2 * R + 2], [-R, H, 2 * R], [R, -H, 2 * R]], cx, cy, BW, BH, { azimuth: 62, elevation: 18 }, parent);
      const names = ["tyre", "nail", "rim", "valve", "nuts"];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(ROAD_PLAN, -5, 5, P)}"/>` + ISO.tinted(ROAD, S(K.slabOf(ROAD_PLAN, -5, 5, P, 4, 0.8), { tone: "mid" }) +
        S(K.slabOf({ x: -40, y: 17, w: 80, d: 2.6, r: 0.4 }, 0, 0.25, P, 2), { tone: "lo", crease: "none" })) +
        `<path class="iso-halo" data-part="shadow"/><g data-part="axle">${names.map((n) => `<g data-name="${n}"></g>`).join("")}</g><g data-part="words"></g>`;
      const el = Object.fromEntries(names.map((n) => [n, g.querySelector(`[data-name="${n}"]`)]));
      const axle = g.querySelector('[data-part="axle"]'), words = g.querySelector('[data-part="words"]'), shadow = g.querySelector('[data-part="shadow"]'), w = ISO.writer();
      el.rim.innerHTML = rimSvg(P); el.nuts.innerHTML = nutsSvg(P); el.valve.innerHTML = valveSvg(P);
      const flat0 = o.k === "flat";
      const s = { psi: ISO.num(o, "psi", flat0 ? FLAT : GOOD), nail: flat0 ? 1 : 0 }, goal = { psi: s.psi, nail: s.nail };
      let lit = o.lit || "";
      const draw = () => {
        const d = squash(s.psi), dk = d.toFixed(2);
        w.rebuild(el.tyre, dk, () => tyreSvg(P, d));
        // The tyre is drawn about the lowered axle already; only the rim, nuts and valve move down with it.
        for (const n of ["rim", "nuts", "valve"]) w.attr(el[n], "transform", K.translateAlong(P, [0, 0, -d]));
        w.rebuild(el.nail, s.nail > 0.5 ? dk : "", () => (s.nail > 0.5 ? nailSvg(P, d) : ""));
        const len = patch(d);
        w.attr(shadow, "d", K.haloOf({ x: -len / 2 - 3, y: -H - 1, w: len + 6, d: W + 2, r: 3 }, 0, 1, P));
        w.rebuild(words, lab ? `${dk} ${s.nail > 0.5}` : "", () => {
          if (!lab) return "";
          const cz = R - d;
          return [ISO.word(K.iso([R + 1, 0, cz + 14], P), "tread", "#444", { anchor: "start", size: 15 }),
            ISO.word(K.iso([-R * 0.72, H, cz + R * 0.62], P), "sidewall", "#444", { anchor: "end", size: 15 }),
            ISO.word(K.iso([0, H, cz + RIM_R], P), "rim and lug nuts", "#444", { size: 15, dy: -8 }),
            s.nail > 0.5 ? ISO.word(K.iso([R + 3, 4, Math.max(4, cz + Math.sin(NAIL_A) * R)], P), "nail", "#c0392b", { anchor: "start", size: 15, dy: 4 }) : "",
            d > 1 ? ISO.word(K.iso([len / 2 + 2, H, 0], P), `${Math.round(len)} cm on the road`, "#c0392b", { anchor: "start", size: 14, dy: 16 }) : ""].join("");
        });
        const want = lit || (s.psi < goal.psi - 0.5 || s.psi > goal.psi + 0.5 ? (goal.nail ? "nail" : "valve") : "");
        w.light(Object.values(el), want ? [el[want]].filter(Boolean) : []);
      };
      g.set = (p) => {
        if (p.k) { goal.nail = p.k === "flat" ? 1 : 0; goal.psi = goal.nail ? FLAT : GOOD; if (goal.nail) s.nail = 1; }
        if (p.psi !== undefined) goal.psi = ISO.clamp(+p.psi, 0, 50);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // Air escapes past the nail in a few seconds; pumping back up is a steady 6 psi a second.
        if (calm) s.psi = goal.psi;
        else if (goal.psi < s.psi) s.psi = ISO.follow(s.psi, goal.psi, dt, 1.1, false);
        else s.psi = Math.min(goal.psi, s.psi + dt * 6);
        if (Math.abs(s.psi - goal.psi) < 0.05) s.psi = goal.psi;
        if (!goal.nail && s.psi > FLAT + 4) s.nail = 0;
        draw();
        return s.psi !== goal.psi;
      };
      g.readout = () => {
        const d = squash(s.psi), a = area(s.psi), on = d >= DMAX - 0.01;
        const head = `${s.psi.toFixed(s.psi < 10 ? 1 : 0)} psi · 350 kg on this wheel`;
        if (on) return `${head} · nail in the tread · tyre squashed ${DMAX} cm, rim nearly on the road: don't drive on it`;
        return `${head} · footprint ${Math.round(a)} cm² (${patch(d).toFixed(1)} cm long) · squashed ${d.toFixed(1)} cm${goal.nail ? " · air leaking past the nail" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
