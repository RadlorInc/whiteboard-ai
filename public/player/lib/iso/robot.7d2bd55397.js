// "robot cx cy height step=0..6 lab=1 lit=base|shoulder|elbow|wrist|gripper|box |text" — an industrial robot arm.
// A yellow four-axis arm bolted to a pedestal: the waist turns on a slewing bearing, the shoulder, elbow and wrist each
// have their own servo motor, and a parallel gripper closes two fingers. It picks a box from one table and places it
// on the other. Each target is solved backwards (inverse kinematics: two links of 80 and 75 cm reach the wrist point,
// the wrist keeps the gripper pointing down) and every joint moves together, arriving at the same moment.
// step 0 home · 1 over the box · 2 down to it · 3 grip and lift · 4 swing over table B · 5 lower · 6 release and rise.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const SH = 58, L1 = 80, L2 = 75, OFF = 13.5, GL = 30, TT = 40, BX = 22, BH = 18, OPEN = 36, SHUT = BX;
  const A = [34, -92], B = [34, 92], FLOOR = { x: -110, y: -140, w: 220, d: 280, r: 6 }, CAB = [-80, -60];
  const Y = ISO.tint("#ffd84d", ["#c99a12", "#d9ab1f", "#e7bd33", "#f2cd45"], "#6b5208");
  const yel = (svg) => ISO.tinted(Y, svg), steel = (svg) => ISO.tinted(ISO.T.steel, svg), dark = (svg) => ISO.tinted(ISO.T.plastic, svg);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const deg = (r) => (r * 180) / Math.PI;
  const tipAt = (c, up = 0) => [c[0], c[1], TT + BH - 14 + up];          // finger tips 14 cm down the box's sides
  // poses: [tip point, gripper opening]
  const POSES = [[[96, 0, 104], OPEN], [tipAt(A, 40), OPEN], [tipAt(A), OPEN], [tipAt(A, 40), SHUT], [tipAt(B, 40), SHUT], [tipAt(B), SHUT], [tipAt(B, 40), OPEN]];
  // inverse kinematics: the wrist sits GL above the tip, OFF to the side of the arm's plane (the forearm runs beside
  // the upper arm), elbow up.
  function solve([x, y, z]) {
    const wz = z + GL, rf = Math.hypot(x, y), rho = Math.sqrt(Math.max(rf * rf - OFF * OFF, 1));
    const psi = Math.atan2(y, x) - Math.asin(OFF / rf);
    const dz = wz - SH, d = Math.min(Math.hypot(rho, dz), L1 + L2 - 1);
    const be = -Math.acos(ISO.clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
    const al = Math.atan2(dz, rho) - Math.atan2(L2 * Math.sin(be), L1 + L2 * Math.cos(be));
    return [psi, al, be];
  }
  function tableSvg(P, [x, y], mark) {
    const out = [];
    for (const [dx, dy] of [[-21, -21], [21, -21], [-21, 21], [21, 21]]) out.push(steel(ISO.wbox(P, [x + dx - 2, x + dx + 2], [y + dy - 2, y + dy + 2], [0, TT - 4], "mid")));
    out.push(steel(ISO.wbox(P, [x - 19, x + 19], [y - 2 + 21, y + 2 + 21], [8, 12], "mid")), steel(ISO.wbox(P, [x - 19, x + 19], [y - 2 - 21, y + 2 - 21], [8, 12], "mid")));
    out.push(steel(S(K.slabOf({ x: x - 26, y: y - 26, w: 52, d: 52, r: 2 }, TT - 4, 4, P, 3, 0.6), { tone: "mid" })));
    if (mark) out.push(`<path d="${K.planOutline({ x: x - 14, y: y - 14, w: 28, d: 28, r: 1 }, TT + 0.02, P, 2)}" fill="none" stroke="#d9a400" stroke-width="2.2"/>`);
    return out.join("");
  }
  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -4, 4, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -4, 4, P, 4, 0.6), { tone: "lo" }))];
    // control cabinet with its door, handle and lamps; its cable runs over the floor to the pedestal
    const [cx, cy] = CAB;
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [cx - 14, cx + 14], [cy - 20, cy + 20], [0, 70], "hi")));
    out.push(ISO.seam(P, [[cx + 14, cy - 17, 4], [cx + 14, cy + 17, 4], [cx + 14, cy + 17, 66], [cx + 14, cy - 17, 66]], "#33506f", 0.9, true));
    out.push(ISO.seam(P, [[cx + 14, cy + 12, 30], [cx + 14, cy + 12, 40]], "#33506f", 2.4));
    out.push(`<circle cx="${K.iso([cx + 14, cy - 8, 58], P)[0].toFixed(1)}" cy="${K.iso([cx + 14, cy - 8, 58], P)[1].toFixed(1)}" r="2.2" fill="#3fae4a" stroke="#1f5a25" stroke-width="0.7"/>`);
    out.push(`<circle cx="${K.iso([cx + 14, cy, 58], P)[0].toFixed(1)}" cy="${K.iso([cx + 14, cy, 58], P)[1].toFixed(1)}" r="2.2" fill="#e8b030" stroke="#7a5a10" stroke-width="0.7"/>`);
    const cable = K.pathOf([[cx + 14, cy + 6, 1.5], [-30, -20, 1.5], [-18, -8, 1.5]].map((p) => K.iso(p, P)));
    out.push(`<path d="${cable}" fill="none" stroke="#1f2226" stroke-width="4" stroke-linejoin="round"/><path d="${cable}" fill="none" stroke="#3a3e44" stroke-width="2.4" stroke-linejoin="round"/>`);
    out.push(tableSvg(P, A, false));
    return out.join("");
  }
  function pedestalSvg(P) {
    const out = [steel(S(K.cylinder(0, 0, 26, 0, 4, P, 48, 0.6), { tone: "lo" })), D(Array.from({ length: 8 }, (_, i) => K.iso([Math.cos(i * Math.PI / 4) * 22, Math.sin(i * Math.PI / 4) * 22, 4], P)), { size: 0.7 })];
    out.push(yel(S(K.cylinder(0, 0, 18, 4, 20, P, 44), { tone: "mid" })), steel(S(K.cylinder(0, 0, 21, 24, 4, P, 48, 0.4), { tone: "mid" })));
    return named("base", out.join(""));
  }
  // The moving arm at joint angles (psi, al, be) and opening g, with the box when it hangs in the fingers.
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
    // waist: housing turning on the slewing bearing, with two cheeks carrying the shoulder axis
    const waist = [yel(box(frame([0, 0, 28], d, q, z), [-15, 15], [-14, 14], [0, 10]))];
    for (const s of [-1, 1]) waist.push(yel(box(frame([0, 0, 38], d, q, z), [-11, 11], s > 0 ? [8, 14] : [-14, -8], [0, SH - 38])), yel(cyl(s > 0 ? 8 : -14, s > 0 ? 14 : -8, 11, qF(Sp), P)));
    const shoulderMotor = named("shoulder", dark(cyl(14, 24, 10, qF(Sp), P)) + steel(cyl(24, 26, 6, qF(Sp), P)));
    // the waist and its motor depend on the waist angle only, so they are built apart and kept while it holds still
    if (part === "waist") return { waist: named("shoulder", waist.join("")), motor: shoulderMotor, qNear, away };
    // upper arm between the cheeks (its rounded ends are part of it), elbow motor on its far side
    const upper = yel(box(frame(Sp, e1, q, n1), [0, L1], [-7.5, 7.5], [-8, 8]) + cyl(-7.5, 7.5, 8, qF(Ep), P));
    const elbowMotor = named("elbow", dark(cyl(-16, -7.5, 8.5, qF(Ep), P)));
    // forearm beside the upper arm, wrist motor at its end
    const fore = yel(cyl(7.5, 19.5, 7, qF(Ep), P) + box(frame(Ep, e2, q, n2), [0, L2], [7.5, 19.5], [-6, 6]) + cyl(7.5, 19.5, 6.5, qF(add(Ep, mul(e2, L2))), P));
    const wristMotor = named("wrist", dark(cyl(19.5, 26, 5.5, qF(add(Ep, mul(e2, L2))), P)));
    // gripper: flange and body pointing down, two fingers sliding along q
    const dn = frame(Wp, d, q, z);
    const grip = [steel(cyl(-6.5, -4, 7, G.frameOf(Wp, z, d, q), P)), dark(box(dn, [-6, 6], [-OPEN / 2 - 3, OPEN / 2 + 3], [-16, -6.5]))];
    const finger = (s) => steel(box(dn, [-4, 4], s > 0 ? [g / 2, g / 2 + 3] : [-g / 2 - 3, -g / 2], [-GL, -16]));
    const held = carried || "";
    const nearF = qNear ? 1 : -1;
    const gripper = named("gripper", grip.join("") + finger(-nearF)) + held + named("gripper", finger(nearF));
    // chain order (base outward), reversed when the arm points away; side motors go before or after by their side
    const chain = [named("shoulder", upper), named("elbow", fore), gripper];
    const order = away ? [...chain].reverse() : chain;
    return { rest: order.join(""), front: qNear ? wristMotor : elbowMotor, back: qNear ? elbowMotor : wristMotor };
  }
  // A cheap turned part for the moving arm (G.disc costs ~1.4 ms; this is ~0.02): side hull in one tone, the cap
  // that faces the viewer lighter, one outline. Axis F.a, from s0 to s1, radius r.
  const COS = Array.from({ length: 24 }, (_, i) => [Math.cos((i / 24) * Math.PI * 2), Math.sin((i / 24) * Math.PI * 2)]);
  function cyl(s0, s1, r, F, P) {
    // the projection is linear, so a circle is o + r(cos·U + sin·V) on screen with U, V the images of F.u, F.v
    const o = K.iso(F.o, P), im = (v) => { const p = K.iso([F.o[0] + v[0], F.o[1] + v[1], F.o[2] + v[2]], P); return [p[0] - o[0], p[1] - o[1]]; };
    const Ax = im(F.a), U = im(F.u), V = im(F.v);
    const ring = (s) => COS.map(([c, n]) => [o[0] + Ax[0] * s + r * (c * U[0] + n * V[0]), o[1] + Ax[1] * s + r * (c * U[1] + n * V[1])]);
    const cm = K.cameraOf(P), f = F.a[0] * cm.cosA * cm.cosE + F.a[1] * cm.sinA * cm.cosE + F.a[2] * cm.sinE;
    const a = ring(s0), b = ring(s1), cap = K.pathOf(f > 0 ? b : a, true), hull = K.pathOf(ISO.hullOf([...a, ...b]), true);
    return `<g class="iso-solid"><path class="iso-fill" d="${hull}"/><path class="iso-shade" data-shade="1" d="${hull}"/><path class="iso-top" d="${cap}"/><path class="iso-line iso-edge" data-tone="hi" d="${hull}${cap}"/></g>`;
  }
  const boxSvg = (P, c, yaw, z0) => {
    const d = [Math.cos(yaw), Math.sin(yaw), 0], q = [-Math.sin(yaw), Math.cos(yaw), 0];
    const f = (u, w, y) => [c[0] + d[0] * u + q[0] * w, c[1] + d[1] * u + q[1] * w, z0 + y];
    return named("box", ISO.tinted(ISO.T.wood, ISO.box(f, P, [-BX / 2, BX / 2], [-BX / 2, BX / 2], [0, BH], "hi")) + ISO.seam(P, [f(-BX / 2, 0, BH), f(BX / 2, 0, BH)], "#b08850", 3) + ISO.seam(P, [f(BX / 2, 0, BH), f(BX / 2, 0, BH - 6)], "#b08850", 3));
  };

  ISO.add({
    name: "robot", title: "Robot arm", compare: "robot 480 290 400",
    about: "An industrial robot arm: waist, shoulder, elbow and wrist joints each driven by a servo, and a two-finger gripper; it picks a box off one table and places it on the other.",
    line: "robot cx cy height step=0..6 lab=1 lit=base|shoulder|elbow|wrist|gripper|box |text",
    demo: { line: "robot 480 290 400", script: [1, 2, 3, 4, 5, 6, 0].map((step) => ({ set: { step }, hold: "settle" })) },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", H = size * 1.15, W = size * 1.9, AZ = 30;
      const view = [Math.cos((AZ * Math.PI) / 180), Math.sin((AZ * Math.PI) / 180)];
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -4, 0), [0, 0, SH + L1 + 10], [-80, 40, 150], [80, -40, 150]], cx, cy, W, H, { azimuth: AZ, elevation: 26, pad: 4 }, parent);
      const step0 = Math.round(ISO.clamp(ISO.num(o, "step", 0), 0, 6));
      const j = { v: solve(POSES[step0][0]), g: POSES[step0][1] };
      const box = { held: step0 >= 3 && step0 <= 5, c: A, yaw: solve(tipAt(A))[0], off: 0, z: TT };
      if (step0 === 6) { box.c = B; box.yaw = solve(tipAt(B))[0]; }
      if (box.held) box.off = box.yaw - j.v[0];
      const mv = { from: j.v, to: j.v, p: 1, dur: 1, g: j.g };
      const words = !lab ? "" : [
        ISO.word(K.iso([A[0], A[1] - 26, TT], P), "table A", "#555", { size: 14, anchor: "start", dy: 16 }),
        ISO.word(K.iso([B[0], B[1] + 26, TT], P), "table B", "#555", { size: 14, anchor: "end", dy: 16 }),
        ISO.word(K.iso([CAB[0] + 14, CAB[1] - 20, 0], P), "controller", "#555", { size: 14, anchor: "start", dy: 14 }),
      ].join("");
      g.innerHTML = `<g>${baseSvg(P)}</g><g data-part="boxBack"></g><g>${tableSvg(P, B, true)}</g><g>${pedestalSvg(P)}</g><g data-part="shBack"></g><g data-part="mBack"></g><g data-part="waistA"></g><g data-part="rest"></g><g data-part="waistB"></g><g data-part="shFront"></g><g data-part="mFront"></g><g data-part="boxFront"></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "", shownLit = null;
      const tipOf = ([psi, al, be]) => {
        const d = [Math.cos(psi), Math.sin(psi)], q = [-Math.sin(psi), Math.cos(psi)], r = L1 * Math.cos(al) + L2 * Math.cos(al + be);
        return [d[0] * r + q[0] * OFF, d[1] * r + q[1] * OFF, SH + L1 * Math.sin(al) + L2 * Math.sin(al + be) - GL];
      };
      const draw = () => {
        const v = j.v.map((a) => Math.round(deg(a) * 2) / 2), gq = Math.round(j.g * 2) / 2, key = `${v} ${gq} ${box.held}`;
        const tip = tipOf(j.v);
        const near = Math.hypot(tip[0] - box.c[0], tip[1] - box.c[1]) < 12 && tip[2] < box.z + BH + 4;   // the box sits between the fingers
        const inGrip = box.held || near;
        const boxNow = () => (box.held ? boxSvg(P, [tip[0], tip[1]], j.v[0] + box.off, tip[2] - (BH - 14)) : boxSvg(P, box.c, box.yaw, box.z));
        const was = el.rest._key + el.waistA._key, wk = String(v[0]);
        let W0 = null, R0 = null;
        const ws = () => (W0 ||= armSvg(P, view, ...j.v, j.g, "", "waist")), rs = () => (R0 ||= armSvg(P, view, ...j.v, j.g, inGrip ? boxNow() : "", "rest"));
        w.rebuild(el.waistA, wk, () => (ws().away ? "" : ws().waist));
        w.rebuild(el.waistB, wk, () => (ws().away ? ws().waist : ""));
        w.rebuild(el.shBack, wk, () => (ws().qNear ? "" : ws().motor));
        w.rebuild(el.shFront, wk, () => (ws().qNear ? ws().motor : ""));
        w.rebuild(el.rest, key + near, () => rs().rest);
        w.rebuild(el.mBack, key + near, () => rs().back);
        w.rebuild(el.mFront, key + near, () => rs().front);
        const nearer = K.depthOf([box.c[0], box.c[1], 0], P) > 0;
        w.rebuild(el.boxBack, `${inGrip} ${box.c} ${nearer}`, () => (!inGrip && !nearer ? boxNow() : ""));
        w.rebuild(el.boxFront, `${inGrip} ${box.c} ${nearer}`, () => (!inGrip && nearer ? boxNow() : ""));
        if (was !== el.rest._key + el.waistA._key || lit !== shownLit) { shownLit = lit; const parts = [...g.querySelectorAll("[data-name]")]; w.light(parts, parts.filter((p) => p.dataset.name === lit)); }
      };
      g.set = (p) => {
        if (p.step !== undefined) {
          const [tip, gw] = POSES[Math.round(ISO.clamp(+p.step, 0, 6))], to = solve(tip);
          mv.from = j.v; mv.to = to; mv.p = 0; mv.g = gw;
          // joint move time from the biggest joint change at 60°/s, never under 0.8 s
          mv.dur = Math.max(0.8, Math.max(...to.map((a, i) => Math.abs(a - j.v[i]))) / (Math.PI / 3));
        }
        if (p.lit !== undefined) lit = p.lit;
      };
      let acc = 0;
      g.update = (dt) => {
        const calm = ISO.still();
        // fingers move first (a gripper closes before the arm lifts, and opens before it leaves)
        if (Math.abs(j.g - mv.g) > 0.01) {
          j.g = calm ? mv.g : j.g + Math.sign(mv.g - j.g) * Math.min(Math.abs(mv.g - j.g), 24 * dt);
          if (Math.abs(j.g - mv.g) <= 0.01) {
            j.g = mv.g;
            const tip = tipOf(j.v);
            if (j.g <= SHUT + 0.01 && !box.held && Math.hypot(tip[0] - box.c[0], tip[1] - box.c[1]) < 6) { box.held = true; box.off = box.yaw - j.v[0]; }
            else if (j.g > SHUT + 0.01 && box.held) { box.held = false; box.c = [tip[0], tip[1]]; box.yaw = j.v[0] + box.off; box.z = tip[2] - (BH - 14); }
          }
          mv.from = j.v;
        } else if (mv.p < 1) {
          mv.p = calm ? 1 : Math.min(1, mv.p + dt / mv.dur);
          const e = ISO.ease(mv.p);
          j.v = mv.from.map((a, i) => a + (mv.to[i] - a) * e);
          if (mv.p >= 1) { j.v = mv.to; mv.from = mv.to; }
        }
        // the arm is redrawn at most 30 times a second (plenty for a joint move); the last pose always lands
        const moving = Math.abs(j.g - mv.g) > 0.01 || mv.p < 1;
        acc += dt;
        if (acc >= 1 / 31 || !moving) { acc = 0; draw(); }
        return moving;
      };
      g.readout = () => {
        const [psi, al, be] = j.v, wr = -90 - deg(al + be), tip = tipOf(j.v);
        return `waist ${deg(psi).toFixed(0)}° · shoulder ${deg(al).toFixed(0)}° · elbow ${deg(be).toFixed(0)}° · wrist ${wr.toFixed(0)}° (keeps the gripper pointing down) · reach ${Math.hypot(tip[0], tip[1]).toFixed(0)} cm · gripper ${(j.g * 10).toFixed(0)} mm${box.held ? " · holding the 2 kg box" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
