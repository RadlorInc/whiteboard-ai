// "robotarm cx cy k tx=-155..155 ty=-155..155 tz=0..200 grip=0..1 carry=0|1 lab=0 lit=base|shoulder|elbow|wrist|gripper|box"
// — a PART (PARTS.md, batch 6): the yellow four-axis industrial robot arm of robot.js, bolted to its 52 cm pedestal
// plate, origin the floor point under the pedestal's middle. The waist turns on a slewing bearing, the shoulder
// (58 cm up), elbow and wrist each have their own servo motor, the upper arm is 80 cm and the forearm 75 cm (reach
// 155), and a parallel gripper closes two fingers. tx ty tz is where the finger tips go (cm, in the part's world): each
// target is solved backwards (inverse kinematics, elbow up, the wrist keeping the gripper pointing down) and every
// joint moves together, arriving at the same moment; targets out of reach are pulled in. grip 0 closed … 1 open
// (36 cm); carry=1 holds a 28 cm carton (the cartonbox part) between the fingers, which close on it. The fingers move
// first, then the arm. set({ tx, ty, tz, grip, carry }). anchors: tip (at the first pose) base
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const SH = 58, L1 = 80, L2 = 75, OFF = 13.5, GL = 30, OPEN = 36, MINW = 8, BOX = 28, BOXH = 20;
  const Y = ISO.tint("#ffd84d", ["#c99a12", "#d9ab1f", "#e7bd33", "#f2cd45"], "#6b5208");
  const yel = (svg) => ISO.tinted(Y, svg), steel = (svg) => ISO.tinted(ISO.T.steel, svg), dark = (svg) => ISO.tinted(ISO.T.plastic, svg);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const deg = (r) => (r * 180) / Math.PI;
  // a target the arm can reach: at least OFF + 6 from the axis, within the two links' reach of the shoulder
  function reachable([x, y, z]) {
    let r = Math.hypot(x, y);
    if (r < OFF + 6) { const a = r > 1e-6 ? Math.atan2(y, x) : 0; x = Math.cos(a) * (OFF + 6); y = Math.sin(a) * (OFF + 6); r = OFF + 6; }
    z = ISO.clamp(z, 0, SH + L1 + L2 - GL - 2);
    return [x, y, z];
  }
  function solve([x, y, z]) {
    const wz = z + GL, rf = Math.hypot(x, y), rho = Math.sqrt(Math.max(rf * rf - OFF * OFF, 1));
    const psi = Math.atan2(y, x) - Math.asin(ISO.clamp(OFF / rf, -1, 1));
    const dz = wz - SH, d = Math.min(Math.hypot(rho, dz), L1 + L2 - 1);
    const be = -Math.acos(ISO.clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
    const al = Math.atan2(dz, rho) - Math.atan2(L2 * Math.sin(be), L1 + L2 * Math.cos(be));
    return [psi, al, be];
  }
  const tipOf = ([psi, al, be]) => {
    const d = [Math.cos(psi), Math.sin(psi)], q = [-Math.sin(psi), Math.cos(psi)], r = L1 * Math.cos(al) + L2 * Math.cos(al + be);
    return [d[0] * r + q[0] * OFF, d[1] * r + q[1] * OFF, SH + L1 * Math.sin(al) + L2 * Math.sin(al + be) - GL];
  };
  function pedestalSvg(P) {
    const out = [steel(S(K.cylinder(0, 0, 26, 0, 4, P, 48, 0.6), { tone: "lo" })), D(Array.from({ length: 8 }, (_, i) => K.iso([Math.cos((i * Math.PI) / 4) * 22, Math.sin((i * Math.PI) / 4) * 22, 4], P)), { size: 0.7 })];
    out.push(yel(S(K.cylinder(0, 0, 18, 4, 20, P, 44), { tone: "mid" })), steel(S(K.cylinder(0, 0, 21, 24, 4, P, 48, 0.4), { tone: "mid" })));
    return named("base", out.join(""));
  }
  // a cheap turned part (robot.js): side hull in one tone, the cap facing the viewer lighter, one outline
  const COS = Array.from({ length: 24 }, (_, i) => [Math.cos((i / 24) * Math.PI * 2), Math.sin((i / 24) * Math.PI * 2)]);
  function cyl(s0, s1, r, F, P) {
    const o = K.iso(F.o, P), im = (v) => { const p = K.iso([F.o[0] + v[0], F.o[1] + v[1], F.o[2] + v[2]], P); return [p[0] - o[0], p[1] - o[1]]; };
    const Ax = im(F.a), U = im(F.u), V = im(F.v);
    const ring = (s) => COS.map(([c, n]) => [o[0] + Ax[0] * s + r * (c * U[0] + n * V[0]), o[1] + Ax[1] * s + r * (c * U[1] + n * V[1])]);
    const cm = K.cameraOf(P), f = F.a[0] * cm.cosA * cm.cosE + F.a[1] * cm.sinA * cm.cosE + F.a[2] * cm.sinE;
    const a = ring(s0), b = ring(s1), cap = K.pathOf(f > 0 ? b : a, true), hull = K.pathOf(ISO.hullOf([...a, ...b]), true);
    return `<g class="iso-solid"><path class="iso-fill" d="${hull}"/><path class="iso-shade" data-shade="1" d="${hull}"/><path class="iso-top" d="${cap}"/><path class="iso-line iso-edge" data-tone="hi" d="${hull}${cap}"/></g>`;
  }
  // the moving arm at joint angles (psi, al, be) and opening g, with the carton when it hangs in the fingers
  function armSvg(P, view, psi, al, be, g, carried, part) {
    const d = [Math.cos(psi), Math.sin(psi), 0], q = [-Math.sin(psi), Math.cos(psi), 0], z = [0, 0, 1];
    const add = (...v) => v.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]]), mul = (v, k) => v.map((x) => x * k);
    const qNear = q[0] * view[0] + q[1] * view[1] > 0, away = d[0] * view[0] + d[1] * view[1] < 0;
    const Sp = [0, 0, SH], e1 = add(mul(d, Math.cos(al)), mul(z, Math.sin(al))), n1 = add(mul(d, -Math.sin(al)), mul(z, Math.cos(al)));
    const Ep = add(Sp, mul(e1, L1)), e2 = add(mul(d, Math.cos(al + be)), mul(z, Math.sin(al + be))), n2 = add(mul(d, -Math.sin(al + be)), mul(z, Math.cos(al + be)));
    const Wp = add(Ep, mul(e2, L2), mul(q, OFF));
    const frame = (o, a, b, c) => (u, w, y) => add(o, mul(a, u), mul(b, w), mul(c, y));
    const box = (f, u, w, y, tone = "hi") => ISO.box(f, P, u, w, y, tone);
    const qF = (o) => G.frameOf(o, q, d, z);
    const waist = [yel(box(frame([0, 0, 28], d, q, z), [-15, 15], [-14, 14], [0, 10]))];
    for (const s of [-1, 1]) waist.push(yel(box(frame([0, 0, 38], d, q, z), [-11, 11], s > 0 ? [8, 14] : [-14, -8], [0, SH - 38])), yel(cyl(s > 0 ? 8 : -14, s > 0 ? 14 : -8, 11, qF(Sp), P)));
    const shoulderMotor = named("shoulder", dark(cyl(14, 24, 10, qF(Sp), P)) + steel(cyl(24, 26, 6, qF(Sp), P)));
    if (part === "waist") return { waist: named("shoulder", waist.join("")), motor: shoulderMotor, qNear, away };
    const upper = yel(box(frame(Sp, e1, q, n1), [0, L1], [-7.5, 7.5], [-8, 8]) + cyl(-7.5, 7.5, 8, qF(Ep), P));
    const elbowMotor = named("elbow", dark(cyl(-16, -7.5, 8.5, qF(Ep), P)));
    const fore = yel(cyl(7.5, 19.5, 7, qF(Ep), P) + box(frame(Ep, e2, q, n2), [0, L2], [7.5, 19.5], [-6, 6]) + cyl(7.5, 19.5, 6.5, qF(add(Ep, mul(e2, L2))), P));
    const wristMotor = named("wrist", dark(cyl(19.5, 26, 5.5, qF(add(Ep, mul(e2, L2))), P)));
    const dn = frame(Wp, d, q, z);
    const grip = [steel(cyl(-6.5, -4, 7, G.frameOf(Wp, z, d, q), P)), dark(box(dn, [-6, 6], [-OPEN / 2 - 3, OPEN / 2 + 3], [-16, -6.5]))];
    const finger = (s) => steel(box(dn, [-4, 4], s > 0 ? [g / 2, g / 2 + 3] : [-g / 2 - 3, -g / 2], [-GL, -16]));
    const nearF = qNear ? 1 : -1;
    const gripper = named("gripper", grip.join("") + finger(-nearF)) + (carried || "") + named("gripper", finger(nearF));
    const chain = [named("shoulder", upper), named("elbow", fore), gripper];
    const order = away ? [...chain].reverse() : chain;
    return { rest: order.join(""), front: qNear ? wristMotor : elbowMotor, back: qNear ? elbowMotor : wristMotor };
  }

  ISO.add({
    name: "robotarm", title: "Industrial robot arm (part)", compare: null,
    about: "A yellow four-axis industrial robot arm on its pedestal (reach 155 cm): every joint turns together to put the finger tips at tx ty tz (inverse kinematics), grip opens and closes the two fingers, carry=1 holds a carton. anchors: tip base",
    line: "robotarm cx cy k tx=-155..155 ty=-155..155 tz=0..200 grip=0..1 carry=0|1 lab=0 lit=base|shoulder|elbow|wrist|gripper|box",
    demo: { line: "robotarm 470 430 2.1 lab=1", script: [
      { set: { tx: 110, ty: 50, tz: 70 }, hold: "settle" }, { set: { tx: 110, ty: 50, tz: 30 }, hold: "settle" }, { set: { carry: 1, lit: "gripper" }, hold: "settle" },
      { set: { tx: 40, ty: -110, tz: 80, lit: "" }, hold: "settle" }, { set: { carry: 0, grip: 1 }, hold: "settle" }, { set: { tx: 96, ty: 0, tz: 104, grip: 0.5 }, hold: "settle" }] },
    make([cx = 430, cy = 470, k = 2], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const view = K.towardViewer(P);
      const target = reachable([B36.num(o, "tx", 96, -155, 155), B36.num(o, "ty", 0, -155, 155), B36.num(o, "tz", 104, 0, 200)]);
      const st = { carry: o.carry === "1", grip: B36.num(o, "grip", 1, 0, 1), lit: o.lit || "" };
      const gOf = () => (st.carry ? BOX : MINW + st.grip * (OPEN - MINW));
      const j = { v: solve(target), g: gOf() }, mv = { from: j.v, to: j.v, p: 1, dur: 1, g: j.g }, tgt = [...target];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -26, y: -26, w: 52, d: 52, r: 26 }, 0, 4, P)}"/><g>${pedestalSvg(P)}</g><g data-part="shBack"></g><g data-part="mBack"></g><g data-part="waistA"></g><g data-part="rest"></g><g data-part="waistB"></g><g data-part="shFront"></g><g data-part="mFront"></g><g data-part="words"></g>`;
      g.anchors = { tip: tipOf(j.v), base: [0, 0, 4] };
      const el = B36.parts(g), w = ISO.writer();
      let shownLit = null;
      const draw = () => {
        const v = j.v.map((a) => Math.round(deg(a) * 2) / 2), gq = Math.round(j.g * 2) / 2, key = `${v} ${gq} ${st.carry}`;
        const tip = tipOf(j.v), was = el.rest._key + el.waistA._key, wk = String(v[0]);
        // the carton hangs with its top 6 cm above the finger tips, square to the fingers
        const carton = () => (st.carry && j.g <= BOX + 0.5 ? named("box", B36.carton(P, [tip[0], tip[1], tip[2] - (BOXH - 6)], j.v[0], BOX, BOXH)) : "");
        let W0 = null, R0 = null;
        const ws = () => (W0 ||= armSvg(P, view, ...j.v, j.g, "", "waist")), rs = () => (R0 ||= armSvg(P, view, ...j.v, j.g, carton(), "rest"));
        w.rebuild(el.waistA, wk, () => (ws().away ? "" : ws().waist));
        w.rebuild(el.waistB, wk, () => (ws().away ? ws().waist : ""));
        w.rebuild(el.shBack, wk, () => (ws().qNear ? "" : ws().motor));
        w.rebuild(el.shFront, wk, () => (ws().qNear ? ws().motor : ""));
        w.rebuild(el.rest, key, () => rs().rest);
        w.rebuild(el.mBack, key, () => rs().back);
        w.rebuild(el.mFront, key, () => rs().front);
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" : B36.word(P, [0, 26, 4], "pedestal", { dy: 14 }) + B36.word(P, [tip[0], tip[1], tip[2] + GL], "gripper", { dx: 30 }));
        if (was !== el.rest._key + el.waistA._key || st.lit !== shownLit) { shownLit = st.lit; B36.light(w, g, st.lit); }
      };
      g.set = (p) => {
        if (p.carry !== undefined) st.carry = String(p.carry) === "1";
        if (p.grip !== undefined) st.grip = ISO.clamp(+p.grip, 0, 1);
        for (const [i, key] of ["tx", "ty", "tz"].entries()) if (p[key] !== undefined) tgt[i] = +p[key];
        if (p.tx !== undefined || p.ty !== undefined || p.tz !== undefined) {
          const to = solve(reachable(tgt));
          mv.from = j.v; mv.to = to; mv.p = 0;
          // joint move time from the biggest joint change at 60°/s, never under 0.8 s
          mv.dur = Math.max(0.8, Math.max(...to.map((a, i) => Math.abs(a - j.v[i]))) / (Math.PI / 3));
        }
        mv.g = gOf();
        if (p.lit !== undefined) st.lit = p.lit;
      };
      let acc = 0;
      g.update = (dt) => {
        const calm = ISO.still();
        if (Math.abs(j.g - mv.g) > 0.01) {
          j.g = calm ? mv.g : j.g + Math.sign(mv.g - j.g) * Math.min(Math.abs(mv.g - j.g), 24 * dt);
          if (Math.abs(j.g - mv.g) <= 0.01) j.g = mv.g;
          mv.from = j.v;
        } else if (mv.p < 1) {
          mv.p = calm ? 1 : Math.min(1, mv.p + dt / mv.dur);
          const e = ISO.ease(mv.p);
          j.v = mv.from.map((a, i) => a + (mv.to[i] - a) * e);
          if (mv.p >= 1) { j.v = mv.to; mv.from = mv.to; }
        }
        const moving = Math.abs(j.g - mv.g) > 0.01 || mv.p < 1;
        acc += dt;
        if (acc >= 1 / 31 || !moving) { acc = 0; draw(); }
        return moving;
      };
      g.readout = () => {
        const [psi, al, be] = j.v, wr = -90 - deg(al + be), tip = tipOf(j.v);
        return `waist ${deg(psi).toFixed(0)}° · shoulder ${deg(al).toFixed(0)}° · elbow ${deg(be).toFixed(0)}° · wrist ${wr.toFixed(0)}° (keeps the gripper pointing down) · reach ${Math.hypot(tip[0], tip[1]).toFixed(0)} cm · tips ${tip[2].toFixed(0)} cm up · gripper ${(j.g * 10).toFixed(0)} mm${st.carry ? " · holding a 2 kg carton" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
