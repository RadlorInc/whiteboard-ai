// "ptrap cx cy width leak=1 lab=1 lit=…" — the drain under a sink, cut open down its middle.
// The tailpipe drops from the sink's strainer into the J-bend's inlet socket; the J-bend's U holds a water seal; its
// outlet socket takes the trap arm, which elbows over and runs into the wall. Both joints are slip joints: a nut on
// the socket's thread squeezes a bevelled washer round the pipe. The pipe is cut in half along its centre plane, so
// the wall sections, washers and the water are seen in section. leak=1 leaves the outlet nut loose: it sits up off its
// thread and water (always there, below the seal level) drips past the washer into a bucket. set({ flow, tight, lit })
// runs the tap and tightens the nut. Local helpers: route (centreline), band (offset outline), halfPipe (the clipped
// back half of a pipe, built from short bands along each leg and bend).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  // World units: 1 = 1 cm. 1½" tubing: 3.8 cm outside, 3.2 inside; sockets 5.4 outside; nuts 6.6 across.
  const RO = 1.9, RI = 1.6, SO = 2.7, SI = 2.3, NO = 3.7;
  const ZU = 18, RU = 4, XO = 8;                 // the U: centre height, bend radius, outlet arm x
  const IN_TOP = 29.5, OUT_TOP = 21.5;           // socket mouths
  const ARM_Z = 25.2, ELBOW = 2.6, WALL_X = 32;
  const WEIR = ARM_Z - RI, DIP = ZU - (RU - RI), SEAL = WEIR - DIP;
  const BUCKET = { x: 12.5, y: -1, r0: 4.4, r1: 5.4, h: 9.5 };
  const C = { pvc: ["#d4d8dc", "#f4f6f7"], wall: "#f3f5f6", inside: "#aeb6be", inside2: "#c3cad0", inside3: "#d3d8dd", ink: "#4a5560", water: "#9cc8ee", waterInk: "#2b6cc4", washer: "#3a3e44", nut: "#dfe3e7", gas: "#8e9a74" };

  // Centrelines in the x–z plane (y = 0 is the cut).
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });
  const J = [[0, IN_TOP], [0, ZU + 0.01], ...arc(RU, ZU, RU, Math.PI, 2 * Math.PI, 16).slice(1, -1), [XO, ZU + 0.01], [XO, OUT_TOP]];
  const ARM = [[XO, 18.8], [XO, 22.6], ...arc(XO + ELBOW, 22.6, ELBOW, Math.PI, Math.PI / 2, 8).slice(1), [29.6, ARM_Z]];
  const TAIL = [[0, 27], [0, 38.6]];
  const SOCK_IN = [[0, 26], [0, IN_TOP]], SOCK_OUT = [[XO, 18.4], [XO, OUT_TOP]];

  // The two offset edges of a centreline at distance r: [left, right], left = +normal.
  function band(pts, r) {
    const left = [], right = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
      const n = [-dz / l, dx / l];
      left.push([p[0] + n[0] * r, p[1] + n[1] * r]); right.push([p[0] - n[0] * r, p[1] - n[1] * r]);
    });
    return [left, right];
  }
  const ring = (pts, r0, r1) => { const [a0, b0] = band(pts, r0), [a1, b1] = band(pts, r1); return [[...a1, ...a0.slice().reverse()], [...b1, ...b0.slice().reverse()]]; };
  const area = (pts, r) => { const [a, b] = band(pts, r); return [...a, ...b.slice().reverse()]; };
  // Clip a polygon to z <= h (Sutherland–Hodgman against one line).
  const below = (poly, h) => {
    const out = [];
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], pin = p[1] <= h, qin = q[1] <= h;
      if (pin) out.push(p);
      if (pin !== qin) { const t = (h - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, h]); }
    });
    return out;
  };
  let uid = 0;
  // The back half of a pipe of radius r along pts: short open bands, each clipped to what lies behind the cut.
  function halfPipe(P, pts, r, style = {}) {
    const out = [], at = ([x, z], y) => K.iso([x, y, z], P);
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      if (l < 1e-3) continue;
      const d = [dx / l, dz / l], n = [-d[1], d[0]], e = 0.25, w = r + 0.3;
      const F = G.frameAlong([a[0] - d[0] * e, 0, a[1] - d[1] * e], [d[0], 0, d[1]]);
      const corners = [];
      for (const [p, s] of [[a, -e], [b, e]]) for (const k of [-w, w]) for (const y of [0.02, -w]) corners.push(at([p[0] + d[0] * s + n[0] * k, p[1] + d[1] * s + n[1] * k], y));
      const id = `pt${uid++}`;
      out.push(`<clipPath id="${id}"><path d="${K.pathOf(ISO.hullOf(corners), true)}"/></clipPath><g clip-path="url(#${id})">${S(G.bandOfProfile([[0, r], [l + 2 * e, r]], F, P, { rims: "none" }), { tone: "mid", ...style })}</g>`);
    }
    return out.join("");
  }
  const flat = (P, poly, fill, stroke = "none", w = 0.6) => (poly.length > 2 ? `<path d="${K.pathOf(poly.map(([x, z]) => K.iso([x, 0, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>` : "");
  const line = (P, pts, stroke, w = 0.7, extra = "") => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 0.02, z], P)))}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
  // A slip nut in section round the socket mouth at `top` on the axis x: skirt on the thread, lip over the washer.
  const nutSection = (P, x, top, lift) => {
    const z0 = top - 2.7 + lift, z1 = top + 0.6 + lift, lip = top + lift;
    return [-1, 1].map((sd) => flat(P, [[x + sd * SO, z0], [x + sd * NO, z0], [x + sd * NO, z1], [x + sd * RO, z1], [x + sd * RO, lip], [x + sd * SO, lip]], C.nut, C.ink)).join("");
  };
  const washerSection = (P, x, top, gap) => [-1, 1].map((sd) => flat(P, [[x + sd * RO, top - 0.9], [x + sd * (RO + 0.12), top - 0.9], [x + sd * SI, top - gap], [x + sd * SI, top], [x + sd * RO, top]], C.washer, C.washer, 0.3)).join("");

  function staticSvg(P, lab) {
    const out = [];
    const floor = { x: -16, y: -14, w: 52, d: 24, r: 1.5 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -2, 2, P)}"/>`, S(K.slabOf(floor, -2, 2, P, 3, 0.5), { tone: "lo" }));
    out.push(ISO.wbox(P, [WALL_X, WALL_X + 4], [-14, 10], [0, 52.5], "mid"));
    // The sink: a steel basin with the strainer body, its locknut and the tailpiece nut under it.
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-13, 13], [-12, 3], [44, 50], "mid")));
    out.push(ISO.wbox(P, [-18, WALL_X], [-14, 5], [50, 52.5], "mid"));
    const up = (z) => G.frameOf([0, 0, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 4, 3.4, up(40), P), { tone: "mid" }) + S(G.prismOf(up(41.4), Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 4.4, Math.sin(i * Math.PI / 3) * 4.4]), 0, 1.2, P), { tone: "mid" })));
    // The bucket on the cabinet floor, its open top a dark void.
    const B = G.frameOf([BUCKET.x, BUCKET.y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(`<g data-name="bucket">${S(G.solidOf([[0, BUCKET.r0], [BUCKET.h, BUCKET.r1]], B, P), { tone: "mid" })}${S(G.ringBand(BUCKET.h - 0.6, BUCKET.h, BUCKET.r1 - 0.3, BUCKET.r1 + 0.3, B, P), { tone: "mid" })}` +
      `<path d="${G.circleOf(B, BUCKET.h, BUCKET.r1 - 0.3, P)}" fill="#6c757d"/>` +
      `<g data-part="bucketwater"></g></g>`);
    // Back halves: tubes first, then the J's body, then its sockets and nuts round them.
    out.push(`<g data-name="tailpipe">${halfPipe(P, TAIL, RO)}</g><g data-name="arm">${halfPipe(P, ARM, RO)}</g>`);
    out.push(`<g data-name="trap">${halfPipe(P, J, RO)}${halfPipe(P, SOCK_IN, SO)}${halfPipe(P, SOCK_OUT, SO)}</g>`);
    out.push(halfPipe(P, [[0, IN_TOP - 2.7], [0, IN_TOP + 0.6]], NO));
    return out.join("");
  }
  // Everything in the cut plane, plus what moves: the outlet nut, the water, the gas and the drips.
  // The cut plane in layers: the insides, then what moves in them (water, gas), then the wall sections over them.
  // The inside of the back half is a hollow: darker at the walls, lighter down the middle where it faces you.
  const insidesSvg = (P) => [area(J, RI), area(SOCK_IN, SI), area(SOCK_OUT, SI), area(TAIL, RI), area(ARM, RI)].map((p) => flat(P, p, C.inside)).join("") +
    [J, TAIL, ARM].map((pts) => flat(P, area(pts, RI * 0.6), C.inside2) + flat(P, area(pts, RI * 0.25), C.inside3)).join("");
  function waterSvg(P, s) {
    const out = [], lv = WEIR + 0.5 * s.flow;
    // The water: everything inside the U up to the weir, and a thin run over the weir while the tap runs.
    const water = [below(area(J, RI), lv), below(area(ARM.slice(0, -1), RI), lv)];
    out.push(`<g data-name="seal">${water.map((p) => flat(P, p, C.water)).join("")}` +
      line(P, [[-RI, lv], [RI, lv]], C.waterInk, 0.8) + line(P, [[XO - RI, lv], [XO + RI + (lv > ARM_Z - RI ? 1.2 : 0), lv]], C.waterInk, 0.8) + `</g>`);
    if (s.flow > 0.01) {
      const o = (s.clock * 22) % 9;
      out.push(`<g opacity="${s.flow.toFixed(2)}">${flat(P, [[-0.8, 38.6], [0.8, 38.6], [0.9, lv], [-0.9, lv]], C.water)}${flat(P, [[XO + RI, WEIR], [29.6, WEIR], [29.6, WEIR + 0.6], [XO + RI + 1, WEIR + 0.6]], C.water)}` +
        line(P, [[0, 38.4], [0, lv + 0.3]], "#ffffff", 0.6, ` stroke-dasharray="2 7" stroke-dashoffset="${-o}"`) + line(P, [[XO + RI + 1.2, WEIR + 0.3], [29.4, WEIR + 0.3]], "#ffffff", 0.5, ` stroke-dasharray="2 7" stroke-dashoffset="${-o}"`) + `</g>`);
    }
    // Sewer gas creeping back up the trap arm, stopped by the water.
    if (s.gas > 0.01) {
      for (let k = 0; k < 7; k++) {
        const f = ((s.clock * 0.12 + k / 7) % 1), x = 29 - f * (29 - (XO + RI + 1.8)), a = Math.min(1, (1 - f) * 4, f * 6) * s.gas;
        const at = K.iso([x, 0.05, ARM_Z + 0.5 + Math.sin(k * 2.1 + s.clock) * 0.5], P);
        out.push(`<circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="${(1.6 + (k % 3) * 0.4).toFixed(1)}" fill="${C.gas}" opacity="${(a * 0.7).toFixed(2)}"/>`);
      }
    }
    return out.join("");
  }
  const wallsSvg = (P) => [...ring(J, RI, RO), ...ring(SOCK_IN, SI, SO), ...ring(SOCK_OUT, SI, SO), ...ring(TAIL, RI, RO), ...ring(ARM, RI, RO)].map((p) => flat(P, p, C.wall, C.ink)).join("") +
    washerSection(P, 0, IN_TOP, 0.1) + washerSection(P, XO, OUT_TOP, 0.1) + nutSection(P, 0, IN_TOP, 0);
  const outNutSvg = (P, lift) => `<g data-name="nut">${halfPipe(P, [[XO, OUT_TOP - 2.7 + lift], [XO, OUT_TOP + 0.6 + lift]], NO)}</g>`;
  // The full (uncut) fittings in front: tailpiece nut under the sink, the wall nut and escutcheon.
  function frontSvg(P) {
    const up = G.frameOf([0, 0, 37.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), X = (x) => G.frameOf([x, 0, ARM_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    return ISO.tinted(ISO.T.steel, S(G.prismOf(up, Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3 + 0.3) * 3, Math.sin(i * Math.PI / 3 + 0.3) * 3]), 0, 2.4, P), { tone: "mid" })) +
      S(G.disc(0, 2, 3.1, X(29.6), P), { tone: "mid" }) + ISO.tinted(ISO.T.steel, S(G.disc(0, 0.4, 4.4, X(31.6), P), { tone: "mid" }));
  }
  const dropPath = (x, y, s = 1) => `M${x.toFixed(1)} ${(y - 2.6 * s).toFixed(1)} Q${(x + 1.7 * s).toFixed(1)} ${(y + 0.4 * s).toFixed(1)} ${x.toFixed(1)} ${(y + 1.3 * s).toFixed(1)} Q${(x - 1.7 * s).toFixed(1)} ${(y + 0.4 * s).toFixed(1)} ${x.toFixed(1)} ${(y - 2.6 * s).toFixed(1)}Z`;

  ISO.add({
    name: "ptrap", title: "Sink trap (P-trap)", compare: "ptrap 480 260 400 leak=1",
    about: "Under-sink drain cut open: tailpipe, J-bend holding its water seal, slip nuts with washers, trap arm into the wall; a loose nut drips into a bucket until it is tightened.",
    line: "ptrap cx cy width leak=1 lab=1 lit=tailpipe|trap|seal|nut|arm|bucket",
    demo: { line: "ptrap 480 260 400 leak=1", script: [{ set: { flow: 1 }, hold: 3.4 }, { set: { flow: 0 }, hold: 3.6 }, { set: { tight: 1, lit: "nut" }, hold: "settle" }, { set: { lit: "seal" }, hold: 2.4 }] },
    make([cx, cy, width = 400], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.55, H = width * 1.15;
      const { P, g } = ISO.frame([[-16, -14, -2], [36, -14, -2], [-16, 10, -2], [36, 10, -2], [-18, -14, 52.5], [36, -14, 52.5], [-18, 5, 52.5]], cx, cy, W, H, { azimuth: 116, elevation: 22 }, parent);
      const leak = o.leak === "1";
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="outnut"></g><g>${insidesSvg(P)}</g><g data-part="cut"></g><g>${wallsSvg(P)}</g><g data-part="nutcut"></g><g data-part="front">${frontSvg(P)}</g><g data-part="drips"></g><g data-part="words"></g>`;
      const cut = g.querySelector('[data-part="cut"]'), outnut = g.querySelector('[data-part="outnut"]'), nutcut = g.querySelector('[data-part="nutcut"]'), drips = g.querySelector('[data-part="drips"]'), bw = g.querySelector('[data-part="bucketwater"]'), w = ISO.writer();
      const s = { flow: 0, flowT: 0, lift: leak ? 0.6 : 0, liftT: leak ? 0.6 : 0, gas: 0, clock: 0, drops: [], next: 0.4, caught: leak ? 2.2 : 0, lit: o.lit || "" };
      const B = G.frameOf([BUCKET.x, BUCKET.y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
      const bucketWater = (h) => {
        const r = BUCKET.r0 + (BUCKET.r1 - BUCKET.r0) * (h / BUCKET.h) - 0.3, d = G.circleOf(B, h, r, P);
        return `<path d="${d}" fill="${C.water}" stroke="${C.waterInk}" stroke-width="0.5"/>`;
      };
      const words = lab ? [["Tailpipe", [0, 0, 34], "end", -6], ["Slip nut", [XO + NO, 0, OUT_TOP - 1], "start", 6], ["Water seal", [-RO, 0, 15], "end", -4], ["Trap arm", [22, 0, ARM_Z + RO], "middle", 0], ["Bucket", [BUCKET.x, BUCKET.y + BUCKET.r1, 0], "middle", 0]] : [];
      g.querySelector('[data-part="words"]').innerHTML = words.map(([txt, p, anchor, dx]) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 12, dy: txt === "Bucket" ? 16 : txt === "Trap arm" ? -6 : 4 }); }).join("");
      const draw = () => {
        w.rebuild(cut, `${s.flow.toFixed(3)} ${s.gas.toFixed(2)} ${s.flow > 0.01 || s.gas > 0.01 ? s.clock.toFixed(2) : ""}`, () => waterSvg(P, s));
        w.rebuild(outnut, s.lift.toFixed(3), () => outNutSvg(P, s.lift));
        w.rebuild(nutcut, s.lift.toFixed(3), () => `<g data-name="nut">${nutSection(P, XO, OUT_TOP, s.lift)}</g>`);
        w.rebuild(bw, s.caught.toFixed(2), () => (s.caught > 0.05 ? bucketWater(Math.min(BUCKET.h - 1.5, s.caught)) : ""));
        w.rebuild(drips, s.drops.map((d) => d.z.toFixed(1)).join(), () => s.drops.map((d) => { const a = K.iso([XO + NO + 0.2, 0.2, d.z], P); return `<path d="${dropPath(a[0], a[1], 1.2)}" fill="${C.water}" stroke="${C.waterInk}" stroke-width="0.6"/>`; }).join(""));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (q) => {
        if (q.flow !== undefined) s.flowT = +q.flow ? 1 : 0;
        if (q.tight !== undefined) s.liftT = +q.tight ? 0 : 0.6;
        if (q.lit !== undefined) s.lit = q.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.clock += dt;
        s.flow = ISO.follow(s.flow, s.flowT, dt, 0.35, calm);
        s.lift = ISO.follow(s.lift, s.liftT, dt, 0.5, calm);
        s.gas = ISO.follow(s.gas, s.flowT ? 0 : 1, dt, 0.6, calm);
        // Drips: the outlet joint is below the seal level, so it is always wet; a loose nut lets a drop go about every
        // 1.2 s (faster while the tap runs). Each drop falls freely into the bucket.
        const loose = s.lift > 0.15;
        if (loose && !calm) { s.next -= dt * (1 + s.flow); if (s.next <= 0) { s.drops.push({ z: OUT_TOP - 3 + s.lift, v: 0 }); s.next = 1.2; } }
        const floorZ = Math.min(BUCKET.h - 1.5, s.caught);
        s.drops = s.drops.filter((d) => { d.v += 981 * 0.25 * dt; d.z -= d.v * dt; if (d.z <= floorZ) { s.caught = Math.min(BUCKET.h - 1.5, s.caught + 0.05); return false; } return true; });
        draw();
        // Running water, gas and drips keep animating, but the pose has settled once these reach their targets.
        return s.flow !== s.flowT || s.lift !== s.liftT || Math.abs(s.gas - (s.flowT ? 0 : 1)) > 1e-3;
      };
      g.readout = () => {
        const seal = `${SEAL.toFixed(1)} cm (${(SEAL / 2.54).toFixed(1)} in) water seal`;
        if (s.flowT) return `tap running · water spills over the weir into the trap arm · ${seal} refills`;
        if (s.lift > 0.15) return `${seal} stays in the bend · blocks sewer gas · outlet slip nut loose: dripping`;
        if (s.liftT === 0 && s.lift > 0.01) return "tightening the slip nut · washer squeezed onto the pipe";
        return `${seal} blocks sewer gas · slip nut tight · no drip`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
