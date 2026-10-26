// "circular cx cy size M=0.1 spin=1 cut=0 lab=1 lit=bung|tube|hanger" — the whirling bung.
// A rubber bung on a nylon line goes round in a horizontal circle. The line runs down through a short glass tube held
// in a clamp to a hanger of slotted masses, so its tension is the hanger's weight Mg; a paper clip on the line under the
// tube keeps the length the same. The line dips below level by sin θ = m/M (it also holds the bung up), and its level
// part, Mg cos θ, is the force to the centre: Mg cos θ = m v²/r. The velocity is always along the circle. Cut the line
// and the bung flies off along that velocity (falling as it goes), not outward. Shown 4× slower than it is.
// set({ spin: 1|0 }), set({ M: kg }) for a heavier hanger (faster), set({ cut: 1 }) cuts the line.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g0 = 9.81, m = 0.02, LEN = 0.5, PER_M = 220, TT = 196, TB = 136, ROD = [-94, -78], SLOW = 4, RBUNG = 10;
  const BENCH = { x: -128, y: -122, w: 176, d: 160, r: 6 }, BASE = { x: -120, y: -112, w: 66, d: 58, r: 5 };
  const geo = (M) => { const th = Math.asin(m / M), r = LEN * Math.cos(th); return { th, r, v: Math.sqrt((M * g0 * Math.cos(th) * r) / m) }; };

  function standSvg(P) {
    const out = [LAB.mat(P, BENCH, 3, "lo", ISO.T.wood), `<g transform="${K.translateAlong(P, [0, 0, 3])}">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, 212)}</g>`];
    return out.join("");
  }
  // (the tube is held by the clamp's jaws, drawn as ISO.box parts the audit can't see; the bung and the hanger hang
  // on the line, a stroke: those are its "loose" lines; the stand is lifted onto the mat by a transform)
  function tubeSvg(P, back) {
    const dir = [-ROD[0], -ROD[1]], len = Math.hypot(...dir), c = LAB.clamp(P, [ROD[0], ROD[1]], 150, [dir[0] / len, dir[1] / len], len, 4.6);
    if (back) return LAB.boss(P, ROD, 150, [dir[0] / len, dir[1] / len]) + c.back;
    // the glass tube with fire-polished ends
    const tube = `<g style="${ISO.T.glass}">${S(G.lathe([[0, 3.2], [TT - TB, 3.2], [TT - TB, 1.6], [0, 1.6]], LAB.Z([0, 0, TB]), P, { steps: 24 }), { tone: "hi" })}</g>`;
    return tube + c.front;
  }
  // The hanger under the tube: line, paper clip marker, a hook, the hanger's disc and the slotted masses (100 g each).
  function hangerSvg(P, M, drop = 0) {
    const zc = TB - 14, top = 78 - drop, n = Math.round(M / 0.1) - 1, out = [];
    out.push(`<path d="${K.pathOf([K.iso([0, 0, TB], P), K.iso([0, 0, top + 12], P)])}" stroke="#2a2b2f" stroke-width="0.9" fill="none"/>`);
    if (!drop) out.push(ISO.wbox(P, [-2.6, 2.6], [-0.8, 0.8], [zc - 4, zc + 4], "mid"));
    out.push(`<path d="${K.pathOf([[0, 0, top + 12], [0, 0, top + 9], [2.4, 0, top + 7.6], [0, 0, top + 5.4]].map((p) => K.iso(p, P)))}" stroke="#5a6068" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
    out.push(S(K.cylinder(0, 0, 1.2, top - 26, 32, P, 12), { tone: "mid", crease: "none" }), S(K.cylinder(0, 0, 9, top - 30, 4, P, 32), { tone: "mid" }));
    for (let k = 0; k < n; k++) out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 9, top - 26 + k * 4.2, 4, P, 32), { tone: "mid" })));
    return out.join("");
  }
  const arrow = (P, a, b, color, w2 = 2.4) => {
    const A = K.iso(a, P), B = K.iso(b, P), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    return `<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}M${(B[0] - 7 * Math.cos(ang - 0.45)).toFixed(1)} ${(B[1] - 7 * Math.sin(ang - 0.45)).toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}L${(B[0] - 7 * Math.cos(ang + 0.45)).toFixed(1)} ${(B[1] - 7 * Math.sin(ang + 0.45)).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${w2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  ISO.add({
    name: "circular", title: "Whirling bung (circular motion)", compare: "circular 480 270 300",
    about: "A bung whirled on a line through a tube, held taut by a hanger: the line's pull is the force to the centre, the velocity is along the circle, and a cut line sends the bung off along it.",
    line: "circular cx cy size M=0.1 spin=1 cut=0 lab=1 lit=bung|tube|hanger",
    demo: { line: "circular 480 270 300 M=0.1", script: [{ set: { spin: 1 }, hold: 3 }, { set: { M: 0.3, lit: "hanger" }, hold: 3 }, { set: { cut: 1, lit: "" }, hold: 3.2 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.95, H = size * 1.7;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -3, 3), [0, 0, 220], [ROD[0], ROD[1], 214], [118, 0, 196], [0, 118, 196], [-118, 0, 196], [0, -118, 196]], cx, cy, W, H, { azimuth: 56, elevation: 36 }, parent);
      const s = { M: ISO.clamp(ISO.num(o, "M", 0.1), 0.1, 0.4), spin: o.spin !== "0", phi: 0.6, cut: null, drop: 0 };
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="b0"></g><g>${standSvg(P)}</g><g data-name="tube">${tubeSvg(P, true)}</g><g data-part="path"></g><g data-part="b1"></g><g data-part="hanger" data-name="hanger"></g><g data-name="tube">${tubeSvg(P, false)}</g><g data-part="b2"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), slots = [el.b0, el.b1, el.b2];
      const kRod = K.depthOf([ROD[0], ROD[1], 150], P), kTube = K.depthOf([0, 0, 150], P);
      const bungAt = () => {
        const q = geo(s.M), zb = TT - LEN * Math.sin(q.th) * PER_M, R = q.r * PER_M;
        if (!s.cut) return { p: [Math.cos(s.phi) * R, Math.sin(s.phi) * R, zb], vdir: [-Math.sin(s.phi), Math.cos(s.phi)], q, R, zb };
        const c = s.cut, tt = c.t / SLOW, d = Math.min(tt * q.v * PER_M, 170), fall = 0.5 * g0 * tt * tt * PER_M;
        return { p: [c.p[0] + c.v[0] * d, c.p[1] + c.v[1] * d, Math.max(3 + RBUNG * 0.6, c.p[2] - fall)], vdir: c.v, q, R, zb, gone: ISO.clamp((d - 120) / 50, 0, 1) };
      };
      const draw = () => {
        const b = bungAt(), key = `${b.p.map((v) => v.toFixed(1)).join()}`, k = K.depthOf(b.p, P), slot = k < kRod ? 0 : k < kTube ? 1 : 2;
        // the circle the bung keeps to, ruled faintly in the air
        w.rebuild(el.path, `${s.M}`, () => { const pts = []; for (let i = 0; i <= 72; i++) { const a = (i / 72) * 2 * Math.PI; pts.push(K.iso([Math.cos(a) * b.R, Math.sin(a) * b.R, b.zb], P)); } return `<path d="${K.pathOf(pts, true)}" fill="none" stroke="#9aa0a8" stroke-width="1" stroke-dasharray="4 5"/>`; });
        w.rebuild(el.hanger, `${s.M}${s.drop.toFixed(1)}`, () => hangerSvg(P, s.M, s.drop));
        slots.forEach((e, i) => w.rebuild(e, i === slot ? key : "", () => {
          if (i !== slot) return "";
          const out = [];
          if (!s.cut) out.push(`<path d="${K.pathOf([K.iso([0, 0, TT], P), K.iso(b.p, P)])}" stroke="#2a2b2f" stroke-width="0.9" fill="none"/>`);
          else out.push(`<path d="${K.pathOf([K.iso(s.cut.p, P), K.iso([s.cut.p[0] + s.cut.v[0] * 170, s.cut.p[1] + s.cut.v[1] * 170, s.cut.p[2]], P)])}" stroke="#2c8a2c" stroke-width="1" stroke-dasharray="3 4" fill="none"/>`);
          const ax = s.cut ? [b.vdir[0], b.vdir[1], 0] : G.unit3([-b.p[0], -b.p[1], TT - b.p[2]]);
          out.push(`<g data-name="bung" opacity="${(1 - (b.gone || 0)).toFixed(2)}">${ISO.tinted(ISO.T.red, S(G.solidOf([[-5, RBUNG], [5, RBUNG * 0.75]], G.frameAlong(b.p, ax), P, { steps: 20 }), { tone: "hi" }))}</g>`);
          const v = [b.vdir[0] * 60, b.vdir[1] * 60, 0];
          out.push(arrow(P, [b.p[0] + b.vdir[0] * 8, b.p[1] + b.vdir[1] * 8, b.p[2]], [b.p[0] + v[0], b.p[1] + v[1], b.p[2]], "#2c8a2c"));
          if (!s.cut) { const r0 = Math.hypot(b.p[0], b.p[1]), u = [-b.p[0] / r0, -b.p[1] / r0]; out.push(arrow(P, [b.p[0] + u[0] * 9, b.p[1] + u[1] * 9, b.p[2] + 1], [b.p[0] + u[0] * 52, b.p[1] + u[1] * 52, b.p[2] + 1], "#c0392b")); }
          return out.join("");
        }));
        w.rebuild(el.words, lab ? `${key}${!!s.cut}` : "", () => {
          if (!lab) return "";
          const out = [ISO.word(K.iso([b.p[0] + b.vdir[0] * 66, b.p[1] + b.vdir[1] * 66, b.p[2] + 4], P), "velocity", "#2c8a2c", { size: 14 })];
          if (!s.cut) { const r0 = Math.hypot(b.p[0], b.p[1]); out.push(ISO.word(K.iso([b.p[0] * (1 - 28 / r0), b.p[1] * (1 - 28 / r0), b.p[2] - 12], P), "force to the centre", "#c0392b", { size: 13 })); }
          else out.push(ISO.word(K.iso([0, 0, TT + 22], P), "line cut: it flies off along its velocity", "#c0392b", { size: 14 }));
          out.push(ISO.word(K.iso([10, 0, 40 - s.drop], P), `hanger ${(s.M * 1000).toFixed(0)} g`, "#555", { size: 13, anchor: "start" }), ISO.word(K.iso([-6, 0, TB + 20], P), "glass tube", "#555", { size: 13, anchor: "end" }));
          return out.join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.M !== undefined) s.M = ISO.clamp(+p.M, 0.1, 0.4);
        if (p.spin !== undefined) { s.spin = !!+p.spin; if (s.spin && s.cut) { s.cut = null; s.drop = 0; } }
        if (p.cut !== undefined) {
          if (+p.cut && !s.cut) { const b = bungAt(); s.cut = { p: b.p, v: b.vdir, t: 0 }; }
          if (!+p.cut) { s.cut = null; s.drop = 0; }
        }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), q = geo(s.M);
        if (s.cut) { s.cut.t += calm ? 2 : dt; s.drop = Math.min(44, s.drop + (calm ? 44 : dt * 80)); }
        else if (s.spin && !calm) s.phi += ((q.v / q.r) * dt) / SLOW;
        draw();
        return (s.spin && !s.cut) || (s.cut && s.cut.t < 3);
      };
      g.readout = () => {
        const q = geo(s.M), T = s.M * g0;
        if (s.cut) return `line cut: no force to the centre, so the bung carries straight on at ${q.v.toFixed(1)} m/s along the line it was moving (and falls)`;
        return `hanger ${(s.M * 1000).toFixed(0)} g → tension Mg = ${T.toFixed(2)} N · bung 20 g on r = ${q.r.toFixed(2)} m, line ${((q.th * 180) / Math.PI).toFixed(0)}° below level · Mg cos θ = mv²/r → v = ${q.v.toFixed(1)} m/s, one turn in ${((2 * Math.PI * q.r) / q.v).toFixed(2)} s`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
