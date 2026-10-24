// "testtube cx cy length c=red level=0.35 rot=deg lab=1 lit=tube|clamp|stand" — a 150 × 16 mm test tube held in a clamp
// on a retort stand. It tilts by rot degrees about the clamp (the clamp swivels); the liquid's surface stays level with
// the bench, not with the tube. level is the fraction of the tube's length that is full (upright).
// "tuberack cx cy width c=red,blue,green,yellow lab=1 lit=tube1|…|rack" — a wooden rack: base, a drilled top shelf and
// a middle shelf the tubes pass through, end posts, drying pegs behind; one 120 mm tube per colour listed.
(() => {
  const K = window.K, G = window.G;
  const R = 8, LEN = 150;
  const tubeProfile = (len) => {
    const out = [];
    for (let i = 1; i <= 7; i++) { const s = (i / 7) * R; out.push([s, Math.sqrt(Math.max(0.09, R * R - (R - s) ** 2)), 1]); }
    return [[0, 0.3], ...out, [len - 2, R], [len - 1, R + 0.9, 1], [len, R + 0.7]];
  };

  // ── single tube in a clamp
  const BASE = { x: -50, y: -78, w: 100, d: 70, r: 4 }, ROD = [0, -62], PIV = 150;
  ISO.add({
    name: "testtube", title: "Test tube in a clamp", compare: "testtube 480 245 220 c=red",
    about: "A test tube clamped on a stand; tilt it and the liquid stays level with the bench.",
    line: "testtube cx cy length c=red level=0.35 rot=deg lab=1 lit=tube|clamp|stand",
    demo: { line: "testtube 480 270 240 c=red level=0.35", script: [{ set: { rot: 35, lit: "stand" }, hold: "settle" }, { set: { rot: -20 }, hold: "settle" }, { set: { rot: 0, c: "blue", lit: "clamp" }, hold: "settle" }] },
    make([cx, cy, size = 200], o, t, parent) {
      const LAB = window.LAB;
      const lab = o.lab !== "0", W = size * 1.6, H2 = size * 1.35;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), [0, -62, 200], [-75, 0, 60], [75, 0, 60], [0, 10, 200]], cx, cy, W, H2, { azimuth: 50, elevation: 20 }, parent);
      const st = { rot: ISO.clamp(ISO.num(o, "rot", 0), -45, 45), f: ISO.clamp(ISO.num(o, "level", 0.35), 0, 0.9), c0: o.c || "red", c1: o.c || "red", mixT: 1 };
      const want = { rot: st.rot };
      let lit = o.lit || "";
      const zc = PIV, cl = LAB.clamp(P, ROD, zc - 6.5, [0, 1], 62, R + 0.5);
      g.innerHTML = `<g data-name="stand">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, 196)}</g><g data-name="clamp">${LAB.boss(P, ROD, zc - 6.5, [0, 1])}${cl.back}</g>` +
        `<g data-part="tube" data-name="tube"></g><g data-name="clamp">${cl.front}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), prof = tubeProfile(LEN);
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const draw = () => {
        const rq = Math.round(st.rot * 4) / 4, th = (rq * Math.PI) / 180, ax = [Math.sin(th), 0, Math.cos(th)], c = colour(), key = `${rq} ${c}`;
        w.rebuild(el.tube, key, () => {
          const o0 = [ax[0] * -(LEN - 30) + 0, 0, PIV - ax[2] * (LEN - 30)];
          const V = LAB.vessel(P, o0, prof, { axis: ax, base: 1, wall: 0.9 });
          return V.back() + V.liquid(LEN * st.f, c) + V.front();
        });
        if (lab) w.rebuild(el.words, `${Math.round(st.rot)}`, () => LAB.word(P, lab, [0, 8, PIV + 14], "clamp", "#556", { anchor: "start" }) + LAB.word(P, lab, [50, 10, 60], `tilted ${Math.round(Math.abs(st.rot))}°`, "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.rot !== undefined) want.rot = ISO.clamp(+p.rot, -45, 45);
        if (p.level !== undefined) st.f = ISO.clamp(+p.level, 0, 0.9);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.rot = ISO.follow(st.rot, want.rot, dt, 0.4, calm);
        if (Math.abs(st.rot - want.rot) < 0.05) st.rot = want.rot;
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.rot !== want.rot || st.mixT < 1;
      };
      g.readout = () => `test tube 150 × 16 mm · tilted ${Math.abs(st.rot).toFixed(0)}° · about ${Math.round(Math.PI * 7.1 * 7.1 * LEN * st.f / 1000)} mL of ${st.c1} liquid · surface stays level`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });

  // ── rack of tubes
  ISO.add({
    name: "tuberack", title: "Test-tube rack", compare: "tuberack 480 280 340",
    about: "A wooden test-tube rack with a drilled top shelf, holding one tube of each solution.",
    line: "tuberack cx cy width c=red,blue,green,yellow lab=1 lit=tube1|tube2|…|rack",
    demo: { line: "tuberack 480 280 360", script: [{ set: { lit: "tube1" }, hold: 1.4 }, { set: { lit: "tube3" }, hold: 1.4 }, { set: { lit: "rack" }, hold: 1.4 }] },
    make([cx, cy, size = 320], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", cs = String(o.c || "red,blue,green,yellow").split(",").map((c) => c.trim()).slice(0, 8), n = cs.length;
      const GAP = 30, XW = n * GAP + 26, X0 = -XW / 2, TL = 120, TOP = 74, MID = 34;
      const W = size * 0.95, H2 = size * 0.8;
      const { P, g } = ISO.frame([[X0, -24, 0], [-X0, 24, 0], [X0, -24, TL + 10], [-X0, 24, TL + 10]], cx, cy, W, H2, { azimuth: 30, elevation: 22 }, parent);
      const xs = cs.map((_, i) => X0 + 13 + GAP / 2 + i * GAP), wood = ISO.T.wood, k = G.scaleOf(P);
      const tubes = cs.map((c, i) => LAB.vessel(P, [xs[i], 0, 8], tubeProfile(TL), { base: 1, wall: 0.9 }));
      const levels = cs.map((_, i) => TL * (0.28 + 0.1 * (i % 3)));
      const plate = (z, h, holeR) => {
        const plan = { x: X0 + 8, y: -14, w: XW - 16, d: 28, r: 2 };
        const holes = xs.map((x) => `<path d="${K.pathOf(K.circleRing(x, 0, holeR, 32).map(([a, b]) => K.iso([a, b, z + h], P)), true)}" fill="#5a4022" stroke="#7a5a2e" stroke-width="0.6"/>`).join("");
        return S(K.slabOf(plan, z, h, P, 3, 0.5), { tone: "mid" }) + holes;
      };
      // the part of tube i above the shelf top at z: clip to the screen above the hole's ellipse
      const above = (i, z) => {
        const c = K.iso([xs[i], 0, z], P), rr = (R + 0.2) * k;
        return `<clipPath id="tr${i}_${Math.round(cx)}"><path d="M${c[0] - 40} ${c[1] - 400} H${c[0] + 40} V${c[1]} H${c[0] - 40} Z ${K.pathOf(K.circleRing(xs[i], 0, R + 0.2, 32).map(([a, b]) => K.iso([a, b, z], P)), true)}"/></clipPath>`;
      };
      const tubeSvg = (i) => tubes[i].back() + tubes[i].liquid(levels[i], cs[i]) + tubes[i].front();
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0, y: -24, w: XW, d: 48, r: 3 }, 0, 8, P)}"/>`];
      out.push(`<g data-name="rack" style="${wood}">${S(K.slabOf({ x: X0, y: -24, w: XW, d: 48, r: 3 }, 0, 8, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam({ x: X0, y: -24, w: XW, d: 48, r: 3 }, 4, P, 3), { tone: "faint" }) })}`);
      // drying pegs along the back of the base
      xs.forEach((x) => out.push(S(K.cylinder(x, -18, 2.2, 8, 34, P, 14), { tone: "mid" })));
      // end posts
      for (const x of [X0 + 2]) out.push(S(K.slabOf({ x, y: -14, w: 6, d: 28, r: 1 }, 8, TOP - 2, P, 2, 0.4), { tone: "mid" }));
      out.push(`</g>`);
      // each tube in three slices: below the middle shelf, between the shelves, above the top shelf (clipped above
      // each hole), so the shelves really hold them
      const clipAbove = (i, z, id) => { const c = K.iso([xs[i], 0, z], P); return `<clipPath id="${id}"><path d="M${c[0] - 40} ${c[1] - 400} H${c[0] + 40} V${c[1]} H${c[0] - 40} Z ${K.pathOf(K.circleRing(xs[i], 0, R + 0.2, 32).map(([a, b]) => K.iso([a, b, z], P)), true)}"/></clipPath>`; };
      const tag = Math.round(cx * 7 + cy);
      xs.forEach((_, i) => out.push(`<g data-name="tube${i + 1}">${tubeSvg(i)}</g>`));
      out.push(`<g data-name="rack" style="${wood}">${plate(MID, 4, R + 1.2)}</g>`);
      xs.forEach((_, i) => out.push(`<defs>${clipAbove(i, MID + 4, `trm${i}_${tag}`)}</defs><g data-name="tube${i + 1}" clip-path="url(#trm${i}_${tag})">${tubeSvg(i)}</g>`));
      out.push(`<g data-name="rack" style="${wood}">${plate(TOP, 6, R + 1)}${D(K.corners({ x: X0 + 8, y: -14, w: XW - 16, d: 28, r: 2 }, 3).map(([x, y]) => K.iso([x, y, TOP + 6], P)), { size: 0.5 })}</g>`);
      xs.forEach((_, i) => out.push(`<defs>${clipAbove(i, TOP + 6, `trt${i}_${tag}`)}</defs><g data-name="tube${i + 1}" clip-path="url(#trt${i}_${tag})">${tubeSvg(i)}</g>`));
      out.push(`<g data-name="rack" style="${wood}">${S(K.slabOf({ x: -X0 - 8, y: -14, w: 6, d: 28, r: 1 }, 8, TOP - 2, P, 2, 0.4), { tone: "mid" })}</g>`);
      if (lab) xs.forEach((x, i) => out.push(LAB.word(P, lab, [x, 0, TL + 8], cs[i], LAB.ink(cs[i]), { dy: -6, size: 12 })));
      g.innerHTML = out.join("");
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; };
      g.update = () => { LAB.light(w, g, lit); return false; };
      g.readout = () => `${n} test tubes · ${cs.join(", ")} · ${lit && lit.startsWith("tube") ? `tube ${lit.slice(4)}: ${cs[+lit.slice(4) - 1] || ""}` : "rack holds them upright"}`;
      LAB.light(w, g, lit);
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
