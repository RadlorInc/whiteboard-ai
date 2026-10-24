// "cpr cx cy size run=0|1 depth=5..6 rate=100..120 lab=0 lit=hands|chest|meter |text" — chest compressions on a
// training manikin. A plain, gender-neutral CPR manikin (a torso shell with no face and no arms) lies on a blue foam
// mat. Two hands, one on top of the other with the fingers interlaced and lifted off the ribs, press on the centre of
// the chest (the lower half of the breastbone), arms straight. The chest section of the shell really goes down by the
// depth and comes all the way back up between pushes. A feedback box on the mat counts the pushes and shows the depth
// on a bar with its 5–6 cm band. set({ run: 1 }) pushes at `rate` a minute to `depth` cm: 30 pushes, then a pause for
// 2 rescue breaths (the chest rises twice), then again. run: 0 stops with the hands resting on the chest.
// World units: 1 = 1 cm.
//
// ISO.hand (defined here, also used by handwash.js) builds a plain hand from solids: a forearm, a bevelled palm, four
// two-part fingers and a two-part thumb, as depth-sortable items.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const SKIN = ISO.tint("#f2d5bc", ["#c4916b", "#d1a27d", "#ddb491", "#e8c5a6"], "#6e4527");
  const SLEEVE = ISO.tint("#dfe6ee", ["#8ea2b8", "#a2b4c7", "#b6c5d4", "#c8d4e0"], "#34495e");
  const rot = (v, k, th) => { const c = Math.cos(th), s = Math.sin(th), d = G.dot3(k, v), x = G.cross3(k, v); return [0, 1, 2].map((i) => v[i] * c + x[i] * s + k[i] * d * (1 - c)); };
  // A capsule from A to B, radius r0 at A and r1 at B, rounded at both ends.
  const capsule = (A, B, r0, r1, P, tint = SKIN, tone = "hi") => {
    const d = G.sub3(B, A), len = G.len3(d), F = G.frameAlong(A, d), prof = [];
    for (let i = 1; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); prof.push([r0 - r0 * Math.cos(a), r0 * Math.sin(a), 1]); }
    for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); prof.push([len - r1 + r1 * Math.sin(a), r1 * Math.cos(a) + (i === 5 ? 0 : 0), i < 5 ? 1 : 0]); }
    prof[prof.length - 1][1] = 0.001;
    return ISO.tinted(tint, S(G.solidOf(prof, F, P, { steps: 20 }), { tone }));
  };
  ISO.capsule = capsule;
  // A hand: o = the heel of the palm (wrist), a = toward the fingers, n = out of the palm, side "R" or "L".
  // curl: [[base, middle] × 4] in radians toward the palm (negative lifts); spread: radians per finger toward the
  // thumb; shift: moves the fingers across the palm (to sit between another hand's); thumb: { out, down, bend };
  // arm: a world direction for the forearm out of the wrist (or null for none), armLen its length.
  const LEN = [[4.2, 3.6], [4.6, 4.0], [4.3, 3.7], [3.4, 2.9]], RAD = [0.84, 0.88, 0.84, 0.74], VS = [2.9, 0.95, -1.0, -2.9];
  ISO.hand = (P, { o, a, n, side = "R", curl = [[0.15, 0.2], [0.15, 0.2], [0.15, 0.2], [0.15, 0.2]], spread = [0.06, 0.02, -0.03, -0.08], shift = 0, thumb = {}, arm = null, armLen = 22, armAt = 0 }) => {
    a = G.unit3(a); n = G.unit3(n);
    const t = side === "R" ? G.unit3(G.cross3(a, n)) : G.unit3(G.cross3(n, a)), k = G.unit3(G.cross3(a, n));
    const at = (u, v, w) => G.add3(o, G.add3(G.mul3(a, u), G.add3(G.mul3(t, v), G.mul3(n, w))));
    // each part's svg is made the first time it is read: a caller that only wants where the hand is (tip, palm,
    // thumb) builds nothing, and a split build can make the parts one at a time (see ISO.later)
    const items = [], lazy = (c, f) => { let v; return { c, get svg() { return (v ??= f()); } }; };
    let tip;
    // palm: a bevelled octagon section, narrower and thicker at the heel
    const sec = (u, hw, hh) => [[-hw, -hh + 0.6], [-hw + 0.6, -hh], [hw - 0.6, -hh], [hw, -hh + 0.6], [hw, hh - 0.6], [hw - 0.6, hh], [-hw + 0.6, hh], [-hw, hh - 0.6]].map(([v, w]) => at(u, v, w));
    const V = [...sec(0, 3.5, 1.35), ...sec(9.5, 4.25, 1.1)], F = [[0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15]];
    for (let i = 0; i < 8; i++) F.push([i, (i + 1) % 8, 8 + ((i + 1) % 8), 8 + i]);
    items.push({ c: at(4.8, 0, 0), svg: ISO.tinted(SKIN, ISO.poly(V, F, P, "mid")) });
    for (let i = 0; i < 4; i++) {
      let d0 = G.unit3(G.add3(a, G.mul3(t, Math.tan(spread[i]))));
      d0 = rot(d0, k, curl[i][0]);
      const b = at(9.1, VS[i] * (i === 3 ? 0.97 : 1) + shift, 0), m = G.add3(b, G.mul3(d0, LEN[i][0]));
      const d1 = rot(d0, k, curl[i][1]), e = G.add3(m, G.mul3(d1, LEN[i][1]));
      items.push(lazy(G.lerp3(b, m, 0.5), () => capsule(b, m, RAD[i], RAD[i] * 0.95, P)), lazy(G.lerp3(m, e, 0.5), () => capsule(m, e, RAD[i] * 0.95, RAD[i] * 0.85, P)));
      if (i === 1) tip = e;
    }
    const { out = 0.7, down = 0.45, bend = 0.35 } = thumb;
    let d0 = G.unit3(G.add3(G.mul3(a, Math.cos(out)), G.mul3(t, Math.sin(out))));
    d0 = G.unit3(G.add3(d0, G.mul3(n, Math.tan(down))));
    const tb = at(2.0, 3.2, 0.5), tm = G.add3(tb, G.mul3(d0, 4.4)), d1 = G.unit3(G.add3(rot(d0, G.unit3(G.cross3(d0, n)), bend), [0, 0, 0])), te = G.add3(tm, G.mul3(d1, 3.1));
    items.push(lazy(G.lerp3(tb, tm, 0.5), () => capsule(tb, tm, 1.25, 1.05, P)), lazy(G.lerp3(tm, te, 0.5), () => capsule(tm, te, 1.05, 0.92, P)));
    if (arm) {
      const w0 = at(0.4, armAt, 0), dir = G.unit3(arm), w1 = G.add3(w0, G.mul3(dir, armLen)), s1 = G.add3(w0, G.mul3(dir, armLen + 5));
      items.push(lazy(G.lerp3(w0, w1, 0.5), () => capsule(w0, w1, 2.3, 2.9, P)));
      items.push(lazy(G.lerp3(w1, s1, 0.5), () => ISO.tinted(SLEEVE, S(G.solidOf([[0, 3.0], [1, 3.35, 1], [5, 3.4, 1], [6.6, 2.95, 1], [7.6, 2.0, 1], [8, 0.7]], G.frameAlong(G.add3(w1, G.mul3(dir, -0.4)), dir), P, { steps: 24 }), { tone: "mid" }))));
    }
    items.tip = tip; items.thumb = [tb, tm, te]; items.palm = at(4.8, 0, 1.3);   // where things touch, for placing another hand
    return items;
  };
  ISO.drawItems = (P, items) => items.sort((x, y) => K.depthOf(x.c, P) - K.depthOf(y.c, P)).map((x) => x.svg).join("");

  // ── the scene
  const MAT = { x: -60, y: -32, w: 124, d: 64, r: 4 }, ZM = 2.4;
  const SH = ISO.tint("#e9edf0", ["#a9b3bc", "#bac3cb", "#cad1d8", "#d9dfe4"], "#3f4b56");
  const FOAM = ISO.tint("#cfe0f4", ["#7fa3cc", "#93b3d7", "#a7c2e0", "#bad0e8"], "#24476e");
  const HW = 16.5, ZC = 11, TOPZ = 20.5, X0 = -22, XC0 = -11, XC1 = 12, X1 = 30, HX = 0;   // the heels of the hands sit on the lower half of the breastbone (the nipple line)
  const outline = (drop = 0) => {
    const pts = [[-HW, ZM], [HW, ZM]];
    for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI; pts.push([HW * Math.cos(a), ZC + (TOPZ - ZC - drop) * Math.sin(a)]); }
    return pts;
  };
  const shell = (P, x0, x1, drop) => ISO.tinted(SH, ISO.prismX(P, outline(drop), x0, x1, ["#a9b3bc", "#eef1f4"], "#dde3e8", "#3f4b56"));
  function matSvg(P) {
    return `<path class="iso-halo" d="${K.haloOf(MAT, 0, 4, P)}"/>` + ISO.tinted(FOAM, S(K.slabOf(MAT, 0, ZM, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(MAT, ZM / 2, P, 4), { tone: "faint" }) })) +
      L(K.planOutline(K.insetPlan(MAT, 4), ZM, P, 3), { tone: "faint" });
  }
  // audit.mjs reads the head, neck, shoulders and both hands' fingers, thumbs and forearms as "loose": they sit on
  // the torso shell (ISO.prismX) and on the palms (ISO.poly), which it does not record.
  // The head (a plain round form, no face), the neck and the far shoulder: behind the torso.
  function backSvg(P) {
    const out = [];
    out.push(ISO.tinted(SH, S(G.sphereOf([-17, -HW + 1.5, ZC - 1], 5.6, P), { tone: "mid" })));
    out.push(ISO.tinted(SH, S(G.disc(0, 7, 4.6, G.frameAlong([X0 - 7, 0, ZC + 0.5], [1, 0, 0]), P), { tone: "mid" })));
    out.push(ISO.tinted(SH, S(G.sphereOf([X0 - 15.5, 0, ZC + 1.5], 9.4, P), { tone: "hi" })));
    return out.join("");
  }
  function frontSvg(P) {
    const out = [ISO.tinted(SH, S(G.sphereOf([-17, HW - 1.5, ZC - 1], 5.6, P), { tone: "mid" }))];
    // the waist rim where the shell ends, and the shell's joint line round it
    out.push(ISO.tinted(SH, ISO.prismX(P, outline(-0.5).map(([y, z]) => [y * 1.03, z]), X1, X1 + 1.2, ["#94a0ab", "#dfe5ea"], "#c9d1d8", "#3f4b56")));
    return out.join("");
  }
  // The feedback box: counts pushes and shows the depth on a bar, the 5–6 cm cells green.
  const BOX = [36, 58, -29, -18, ZM, ZM + 17];
  function boxSvg(P) {
    const [x0, x1, y0, y1, z0, z1] = BOX, out = [];
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x0 + 1, x0 + 3], [y0 + 1, y1 - 1], [ZM, ZM + 0.8], "lo") + ISO.wbox(P, [x1 - 3, x1 - 1], [y0 + 1, y1 - 1], [ZM, ZM + 0.8], "lo")));
    out.push(ISO.tinted(SH, ISO.wbox(P, [x0, x1], [y0, y1], [z0 + 0.8, z1], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x0 + 1.2, x1 - 1.2], [y1, y1 + 0.3], [z0 + 2, z1 - 1.2], "mid")));
    return out.join("");
  }
  function screenSvg(P, depth, count, pause) {
    const [x0, , , y1, z0] = BOX, m = ISO.faceMatrix(P, [x0 + 2, y1 + 0.32, z0 + 2], 0.1);
    // drawn flat in a 140 × 115 box (0.1 cm per unit), x right, y down from the top of the screen's lower-left corner
    const out = [`<g transform="${m} translate(0 -116)">`];
    for (let i = 0; i < 7; i++) {
      const y = 104 - i * 14, on = depth >= i + 0.5, band = i === 4 || i === 5;
      out.push(`<rect x="8" y="${y}" width="34" height="11" rx="1.5" fill="${on ? (band ? "#4cc46a" : i > 5 ? "#e8664f" : "#f2c14a") : band ? "#1f4a2a" : "#2c3036"}" stroke="${band ? "#4cc46a" : "#555b62"}" stroke-width="0.8"/>`);
    }
    out.push(`<text x="98" y="58" text-anchor="middle" fill="#e9f3ff" style="font:700 46px 'Helvetica Neue',Arial,sans-serif">${pause ? "✓" : count}</text>`);
    out.push(`<text x="98" y="90" text-anchor="middle" fill="#9fc3e6" style="font:600 15px 'Helvetica Neue',Arial,sans-serif">${pause ? "2 breaths" : "of 30"}</text>`);
    out.push(`<text x="98" y="110" text-anchor="middle" fill="#9fc3e6" style="font:600 13px 'Helvetica Neue',Arial,sans-serif">${depth.toFixed(1)} cm</text></g>`);
    return out.join("");
  }
  // Arms straight, vertical and parallel: the shoulders are directly above the hands.
  // The two hands and straight arms: the lower hand's heel on the breastbone, the upper hand on it, fingers between.
  function handItems(P) {
    const top = TOPZ + 1.2, a = [0, 1, 0], n = [0, 0, -1];
    const low = ISO.hand(P, { o: [HX - 0.5, -1.6, top], a, n, side: "L", curl: [[-0.12, 0.05], [-0.12, 0.05], [-0.12, 0.05], [-0.1, 0.05]], thumb: { out: 0.55, down: -0.15, bend: 0.2 }, arm: [0, 0, 1], armLen: 26, armAt: -3 });
    const up = ISO.hand(P, { o: [HX + 0.5, -1.8, top + 2.5], a, n, side: "R", curl: [[0.55, 0.75], [0.6, 0.8], [0.6, 0.8], [0.55, 0.75]], thumb: { out: 0.5, down: 0.25, bend: 0.3 }, arm: [0, 0, 1], armLen: 23.5, armAt: -3 });
    return [...low, ...up];
  }

  ISO.add({
    name: "cpr", title: "CPR chest compressions", compare: "cpr 480 270 320",
    about: "Hands-on chest compressions on a training manikin: the heel of the hand on the lower half of the breastbone, push 5–6 cm, 100–120 a minute, let the chest come all the way back up; 30 pushes, then 2 breaths.",
    line: "cpr cx cy size run=0|1 depth=5..6 rate=100..120 lab=0 lit=hands|chest|meter |text",
    demo: { line: "cpr 480 280 320", script: [{ set: {}, hold: 1 }, { set: { run: 1 }, hold: 6 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.15, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 0), [HX, -2, TOPZ + 37], [X0 - 25, 0, 0], [MAT.x + MAT.w, MAT.y + MAT.d, 0]], cx, cy, W, H, { azimuth: 38, elevation: 32 }, parent);
      g.innerHTML = `<g>${matSvg(P)}</g><g data-name="meter">${boxSvg(P)}<g data-part="screen"></g></g><g>${backSvg(P)}${shell(P, X0, XC0, 0)}</g><g data-name="chest"></g><g>${shell(P, XC1, X1, 0)}${frontSvg(P)}</g><g data-name="hands"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { meter: q("meter"), screen: q("screen"), chest: q("chest"), hands: q("hands"), words: q("words") }, w = ISO.writer();
      const depth = ISO.clamp(ISO.num(o, "depth", 5.5), 5, 6), rate = ISO.clamp(ISO.num(o, "rate", 110), 100, 120);
      const s = { run: o.run === "1", phase: 0, count: 0, pause: 0, d: 0, lift: 0, rise: 0, shown: 0 };
      let lit = o.lit || "";
      const chestMemo = new Map();
      const draw = () => {
        const drop = s.d - s.rise, key = (Math.round(drop * 10) / 10).toFixed(1);
        if (!chestMemo.has(key)) chestMemo.set(key, shell(P, XC0, XC1, +key));
        w.rebuild(el.chest, key, () => chestMemo.get(key));
        w.attr(el.hands, "transform", K.translateAlong(P, [0, 0, -s.d + s.lift]));
        const shownDepth = s.pause ? 0 : s.shown;
        w.rebuild(el.screen, `${shownDepth.toFixed(1)} ${s.count} ${!!s.pause}`, () => screenSvg(P, shownDepth, s.count, !!s.pause));
        w.rebuild(el.words, lab ? `${!!s.pause}` : "", () => !lab ? "" : [
          ISO.word(K.iso([HX - 6, 14, TOPZ], P), "centre of the chest", "#8f2a22", { anchor: "end", size: 14, dy: 6 }),
          ISO.word(K.iso([HX - 6, 14, TOPZ], P), "(lower half of the breastbone)", "#555", { anchor: "end", size: 12, dy: 21 }),
          ISO.word(K.iso([HX + 12, -6, TOPZ + 22], P), "arms straight · push 5–6 cm", "#444", { anchor: "start", size: 14 }),
          ISO.word(K.iso([HX + 12, -6, TOPZ + 22], P), t || "100–120 a minute", "#c0392b", { anchor: "start", size: 15, dy: 18 }),
          ISO.word(K.iso([(BOX[0] + BOX[1]) / 2, BOX[3], BOX[5]], P), s.pause ? "2 rescue breaths" : "feedback: count and depth", "#555", { size: 13, dy: -26 }),
        ].join(""));
        const want = lit || (s.run ? "chest" : "");
        const groups = { hands: el.hands, chest: el.chest, meter: el.meter };
        w.light(Object.values(groups), groups[want] ? [groups[want]] : []);
      };
      g.set = (p) => {
        if (p.run !== undefined) { s.run = !!+p.run; if (s.run) { s.count = 0; s.phase = 0; s.pause = 0; } }
        if (p.lit !== undefined) lit = p.lit;
      };
      const PERIOD = 60 / rate, BREATHS = 5;     // 2 breaths of about 1 s each, with the hands off and back: under 10 s
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) { s.d = 0; s.lift = 0; s.rise = 0; draw(); return false; }
        if (s.run && s.pause) {
          s.pause += dt;
          const u = s.pause - 1, f = (x) => Math.max(0, Math.sin(Math.PI * ISO.clamp(x, 0, 1)));
          s.lift = 8 * ISO.smooth(0, 0.6, s.pause - 0) * (1 - ISO.smooth(BREATHS - 0.6, BREATHS, s.pause));
          s.rise = 1.2 * (f(u / 1.2) + f((u - 1.5) / 1.2));
          s.d = ISO.follow(s.d, 0, dt, 0.08);
          if (s.pause >= BREATHS) { s.pause = 0; s.count = 0; s.phase = 0; s.lift = 0; s.rise = 0; }
        } else if (s.run) {
          const before = s.phase;
          s.phase += dt / PERIOD;
          // down in the first half, all the way back up in the second (full recoil)
          s.d = depth * (0.5 - 0.5 * Math.cos(2 * Math.PI * (s.phase % 1)));
          if (Math.floor(s.phase + 0.5) > Math.floor(before + 0.5)) { s.count++; s.shown = depth; }
          if (s.count >= 30 && s.phase % 1 > 0.95) { s.pause = 1e-6; s.d = 0; }
        } else {
          s.d = ISO.follow(s.d, 0, dt, 0.08); if (s.d < 0.02) s.d = 0;
          s.lift = 0; s.rise = 0;
        }
        draw();
        return s.run || s.d > 0;
      };
      g.readout = () => !s.run && s.count === 0 ? `hands ready on the centre of the chest · push ${depth.toFixed(1)} cm deep, ${rate} a minute, 30 pushes then 2 breaths`
        : s.pause ? "2 rescue breaths, about 1 second each: watch the chest rise · hands back on within 10 seconds"
        : s.run ? `push ${s.count} of 30 · ${s.d.toFixed(1)} cm now (aim 5–6) · ${rate} a minute = one every ${(60 / rate).toFixed(2)} s · let it come all the way back up`
        : "stopped · hands resting on the chest";
      draw();
      // the two hands are half the build: a part of their own (see ISO.later)
      const hands = handItems(P);
      for (const x of hands) ISO.later(() => x.svg);
      ISO.later(() => { el.hands.innerHTML = ISO.drawItems(P, hands); });
      return g;
    },
  });
})();
