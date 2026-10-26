// "projectile cx cy width angle=45 v=3 fire=1 lab=1 lit=launcher|path|rule" — a spring launcher fires a ball across the bench.
// A spring-loaded launcher on a pivot bracket with a protractor fires a steel ball at v = 2.6 m/s. Once it leaves, only
// gravity acts: its sideways speed v cos θ stays the same (green) while its upward speed v sin θ − gt shrinks, turns
// and grows downward (red), so the path is a parabola. It lands on carbon paper beside a metre rule. Strobe images are
// 0.05 s apart; the fall is shown 4× slower. On level ground 30° and 60° would land together (sin 2θ is the same)
// and 45° furthest; launched from above the bench, the lower angles gain a little.
// Earlier flights stay faintly so ranges can be compared. set({ angle }) turns the barrel, set({ fire: 1 }) fires.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g0 = 9.81, PER_M = 240, XP = -150, ZP = 34, BARREL = 46, RB = 4, SLOW = 4, BOARD = { x: -190, y: -46, w: 396, d: 92, r: 7 };
  const rad = (d) => (d * Math.PI) / 180;
  const flight = (a, v) => {   // muzzle point, velocity components and landing time (ball centre back to RB above the bench)
    const m = [XP + Math.cos(rad(a)) * BARREL, ZP + Math.sin(rad(a)) * BARREL], vx = v * Math.cos(rad(a)), vz = v * Math.sin(rad(a)), h = (m[1] - RB) / PER_M;
    return { m, vx, vz, T: (vz + Math.sqrt(vz * vz + 2 * g0 * h)) / g0, h };
  };
  const posAt = (f, t) => [f.m[0] + f.vx * t * PER_M, f.m[1] + (f.vz * t - 0.5 * g0 * t * t) * PER_M];

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 150, y: -40, w: 44, d: 12, r: 1.2 })];
    // the metre rule along the bench, from under the muzzle out past the landing place
    const R0 = XP, strip = { x: R0, y: 22, w: 330, d: 10, r: 0.5 };
    out.push(ISO.tinted(ISO.T.wood, S(K.slabOf(strip, 0, 1.2, P, 2), { tone: "mid", crease: "none" })));
    const minor = [], major = [];
    for (let cm = 0; cm <= 135; cm += 2.5) { const x = R0 + (cm / 100) * PER_M; if (x > R0 + 329) break; (cm % 10 ? minor : major).push(K.segment([x, 22, 1.2], [x, cm % 10 ? 25 : 27.5, 1.2], P)); }
    out.push(`<g style="${ISO.T.wood}">${L(minor.join(""), { tone: "lo", free: "end" })}${L(major.join(""), { tone: "mid", free: "end" })}</g>`);
    // white paper with a sheet of carbon paper on it, where the ball lands
    out.push(S(K.slabOf({ x: 40, y: -26, w: 96, d: 44, r: 0.5 }, 0, 0.4, P, 2), { tone: "hi", crease: "none" }), ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: 46, y: -20, w: 84, d: 32, r: 0.5 }, 0.4, 0.4, P, 2), { tone: "hi", crease: "none" })));
    // the launcher's clamp block and its two bracket plates with a protractor arc
    out.push(ISO.wbox(P, [XP - 26, XP + 14], [-18, 18], [0, 8], "mid"), ISO.tinted(ISO.T.plastic, S(G.disc(0, 6, 4, G.frameOf([XP - 6, 18, 4], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    // (the barrel and its pivot bolt are held by these plates, which the audit can't see: its "loose" barrel is one)
    out.push(ISO.prismY(P, [[-24, 8], [20, 8], ...ISO.arc(0, ZP, 29, rad(-20), rad(100), 24), [-24, 22]].map(([x, z]) => [XP + x, z]), -12, -9, ["#9aa0a8", "#d9dadd"], "#e9eaec", "#3c3f45"));
    const ticks = [];
    for (let d = 0; d <= 90; d += 5) { const r0 = 26, r1 = d % 15 ? 23 : 21; ticks.push(K.segment([XP + Math.cos(rad(d)) * r0, -8.98, ZP + Math.sin(rad(d)) * r0], [XP + Math.cos(rad(d)) * r1, -8.98, ZP + Math.sin(rad(d)) * r1], P)); }
    out.push(L(K.pathOf(ISO.arc(0, ZP, 26, rad(-8), rad(98), 30).map(([x, z]) => K.iso([XP + x, -8.98, z], P))), { tone: "lo", free: true }), L(ticks.join(""), { tone: "lo", free: "end" }));
    return out.join("");
  }
  function frontPlate(P) {
    return ISO.prismY(P, [[-24, 8], [14, 8], [14, 20], [-6, ZP - 4], [-24, 20]].map(([x, z]) => [XP + x, z]), 9, 12, ["#9aa0a8", "#d9dadd"], "#e9eaec", "#3c3f45") + S(G.disc(-1, 15, 3, G.frameOf([XP, -10, ZP], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" });
  }
  // The barrel at angle a: a tube on the pivot, a cocking slot, a muzzle ring and the trigger ring at its back.
  function barrelSvg(P, a) {
    const dir = [Math.cos(rad(a)), 0, Math.sin(rad(a))], F = G.frameAlong([XP, 0, ZP], dir), out = [];
    // the angle pointer on the protractor, behind the barrel
    out.push(`<path d="${K.pathOf([[XP, -9.6, ZP], [XP + Math.cos(rad(a)) * 27, -9.6, ZP + Math.sin(rad(a)) * 27]].map((p) => K.iso(p, P)))}" stroke="#c0392b" stroke-width="1.2" data-free=""/>`);
    out.push(S(G.lathe([[-16, 7], [BARREL, 7], [BARREL, 4.6], [-16, 4.6]], F, P, { steps: 28 }), { tone: "hi" }), S(G.ringBand(BARREL - 4, BARREL, 7, 8.2, F, P, { steps: 28 }), { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-22, -16, 4, F, P, { steps: 20 }), { tone: "hi" })), S(G.ringBand(-26, -24, 2.4, 3.6, F, P, { steps: 16 }), { tone: "mid" }));
    return out.join("");
  }
  const arrow = (P, a, b, color, w2 = 2.2) => { const A = K.iso(a, P), B = K.iso(b, P), an = Math.atan2(B[1] - A[1], B[0] - A[0]); return `<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}M${(B[0] - 6 * Math.cos(an - 0.5)).toFixed(1)} ${(B[1] - 6 * Math.sin(an - 0.5)).toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}L${(B[0] - 6 * Math.cos(an + 0.5)).toFixed(1)} ${(B[1] - 6 * Math.sin(an + 0.5)).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${w2}" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const ball = (P, x, z, op = 1) => `<g opacity="${op}">${ISO.tinted(ISO.T.steel, S(G.sphereOf([x, 0, z], RB, P), { tone: "hi" }))}</g>`;

  ISO.add({
    name: "projectile", title: "Projectile launcher", compare: "projectile 480 280 460",
    about: "A spring launcher fires a ball across the bench: steady sideways speed, changing upward speed, a parabola; the landing place shows how range depends on angle.",
    line: "projectile cx cy width angle=45 v=2.6 fire=1 lab=1 lit=launcher|path|rule",
    demo: { line: "projectile 480 280 460 angle=45", script: [{ set: { fire: 1 }, hold: 2.6 }, { set: { angle: 30, fire: 1 }, hold: 3 }, { set: { angle: 60, fire: 1, lit: "rule" }, hold: 3.6 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, 130], [XP, 0, ZP + 60]], cx, cy, W, H, { azimuth: 70, elevation: 16 }, parent);
      const v = ISO.clamp(ISO.num(o, "v", 2.6), 1.8, 2.8);
      const s = { a: ISO.clamp(ISO.num(o, "angle", 45), 10, 80), t: -1, pend: o.fire === "1", old: [] }; s.aT = s.a;
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="rule">${benchSvg(P)}</g><g data-part="old"></g><g data-part="barrel" data-name="launcher"></g><g data-name="launcher">${frontPlate(P)}</g><g data-part="ghosts"></g><g data-name="path"><path data-part="trail" fill="none" stroke="#e09a00" stroke-width="1.3" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><g data-part="path"></g></g><g data-part="ball"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), trail = {};
      const draw = () => {
        const f = flight(s.a, v), tt = s.t < 0 ? 0 : Math.min(s.t, f.T), key = `${s.a.toFixed(2)} ${tt.toFixed(3)}`;
        const aq = Math.round(s.a * 2) / 2;
        w.rebuild(el.barrel, String(aq), () => barrelSvg(P, aq));
        w.rebuild(el.old, s.old.map((p) => p.a).join(), () => s.old.map((p) => `<path d="${p.d}" fill="none" stroke="#9aa0a8" stroke-width="1" stroke-dasharray="3 3"/>` + D([K.iso([p.x, 0, 0.9], P)], { size: 1.2, tone: "mid" }) + (lab ? ISO.word(K.iso([p.x, 0, 0.9], P), `${p.a}°`, "#778", { size: 11, dy: 16 }) : "")).join(""));
        // the flight path: built once per flight with its screen lengths, then revealed by a dash offset each frame
        if (trail.a !== s.a.toFixed(2)) {
          const pts = [], cum = [0];
          for (let k = 0; k <= 60; k++) { const [x, z] = posAt(f, (f.T * k) / 60); pts.push(K.iso([x, 0, z], P)); if (k) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); }
          trail.a = s.a.toFixed(2); trail.cum = cum.map((c) => c / cum[60]);
          el.trail.setAttribute("d", K.pathOf(pts));
        }
        const fk = (tt / f.T) * 60, i0 = Math.min(59, Math.floor(fk)), frac = s.t < 0 ? 0 : trail.cum[i0] + (trail.cum[i0 + 1] - trail.cum[i0]) * (fk - i0);
        w.attr(el.trail, "stroke-dashoffset", (1 - frac).toFixed(4));
        w.rebuild(el.path, s.t >= 0 && tt >= f.T ? s.a.toFixed(2) : "", () => {
          if (!(s.t >= 0 && tt >= f.T)) return "";
          // the top of the flight and the range, once it has landed
          const out = [], tTop = f.vz / g0, [xt, zt] = posAt(f, tTop), [xl] = posAt(f, f.T);
          out.push(L(K.pathOf([K.iso([xt, 0, 0.4], P), K.iso([xt, 0, zt - RB - 1], P)]), { tone: "lo", dashed: true, free: true }));
          out.push(`<path d="${K.pathOf([[f.m[0], 34, 1], [xl, 34, 1]].map((p) => K.iso(p, P)))}" fill="none" stroke="#555" stroke-width="1.2"/>`, D([K.iso([f.m[0], 34, 1], P), K.iso([xl, 34, 1], P)], { size: 0.9, tone: "mid" }));
          if (lab) out.push(ISO.word(K.iso([xt + 4, 0, zt / 2], P), `max height ${(((zt - RB) / PER_M) * 100).toFixed(0)} cm`, "#555", { size: 13, anchor: "start" }), ISO.word(K.iso([(f.m[0] + xl) / 2, 34, 1], P), `range ${(((xl - f.m[0]) / PER_M) * 100).toFixed(0)} cm`, "#333", { size: 14, dy: 18 }));
          return out.join("");
        });
        const nG = s.t < 0 ? 0 : Math.ceil(tt / 0.05) - 1;
        w.rebuild(el.ghosts, `${s.a.toFixed(2)} ${nG}`, () => { const out = []; for (let n = 1; n <= nG; n++) { const [x, z] = posAt(f, n * 0.05); out.push(ball(P, x, z, 0.3)); } return out.join(""); });
        w.rebuild(el.ball, key, () => {
          const [x, z] = posAt(f, tt), out = [ball(P, x, Math.max(RB, z))];
          if (s.t >= 0 && tt < f.T) {
            const sc = 18, vz = f.vz - g0 * tt;
            out.push(arrow(P, [x, 0, z], [x + f.vx * sc, 0, z], "#2c8a2c"), arrow(P, [x, 0, z], [x, 0, z + vz * sc], "#c0392b"), arrow(P, [x, 0, z], [x + f.vx * sc, 0, z + vz * sc], "#333", 1.4));
            if (lab) out.push(ISO.word(K.iso([x + f.vx * sc + 3, 0, z], P), "v cos θ (stays)", "#2c8a2c", { size: 12, anchor: "start" }), ISO.word(K.iso([x - 3, 0, z + vz * sc], P), "upward speed", "#c0392b", { size: 12, anchor: "end" }));
          }
          return out.join("");
        });
        w.rebuild(el.words, lab ? `${Math.round(s.a)}` : "", () => !lab ? "" : ISO.word(K.iso([XP - 30, 0, ZP + 40], P), `launcher at ${Math.round(s.a)}°`, "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([90, -26, 1], P), "carbon paper", "#555", { size: 12, dy: -4 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.angle !== undefined) { s.aT = ISO.clamp(+p.angle, 10, 80); if (s.t >= 0) { const f = flight(s.a, v), pts = []; for (let k = 0; k <= 40; k++) { const [x, z] = posAt(f, (f.T * k) / 40); pts.push(K.iso([x, 0, z], P)); } s.old = [...s.old.slice(-2), { a: Math.round(s.a), d: K.pathOf(pts), x: posAt(f, f.T)[0] }]; } s.t = -1; }
        if (p.fire !== undefined && +p.fire) s.pend = true;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.a = ISO.follow(s.a, s.aT, dt, 0.3, calm);
        if (Math.abs(s.a - s.aT) < 0.05) s.a = s.aT;
        if (s.pend && s.a === s.aT) { s.pend = false; s.t = 0; }
        const f = flight(s.a, v);
        if (s.t >= 0 && s.t < f.T) s.t = calm ? f.T : s.t + dt / SLOW;
        draw();
        return s.a !== s.aT || s.pend || (s.t >= 0 && s.t < f.T);
      };
      g.readout = () => {
        const f = flight(s.a, v), R = (f.vx * f.T * 100).toFixed(0), Hm = ((f.vz * f.vz) / (2 * g0) * 100).toFixed(0);
        return `v = ${v} m/s at ${Math.round(s.a)}° · sideways ${f.vx.toFixed(2)} m/s all the way · upward ${f.vz.toFixed(2)} m/s at launch, 0 at the top · rises ${Hm} cm, flies ${f.T.toFixed(2)} s, lands ${R} cm away (launched ${(f.h * 100).toFixed(0)} cm up)`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
