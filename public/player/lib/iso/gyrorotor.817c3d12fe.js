// "gyrorotor cx cy k rpm=0..8000 deg=0..360 lab=0 lit=rotor|frame|axle" — a PART (PARTS.md, batch 5): the toy gyroscope
// of gyroscope.js, its origin the pivot point: the bottom of the ball on its axle's end, which rests on a pivottower's
// `tip` (place it at=<id>.tip). A brass rotor 7 cm across with its web, spokes and hub, spinning on a steel axle 12 cm
// long inside a steel hoop frame, two bearing bosses where the axle meets the hoop. The axle lies level along the
// heading deg (0 = +x, 90 = +y) with the rotor's middle 6 cm from the pivot. Spinning at rpm, it does not fall: it swings
// round the pivot (precession) at Ω = m·g·r / (I·ω), m = 0.15 kg, r = 6 cm, I = ½·0.12 kg·(3.5 cm)²: about once round
// every 3.3 s at 6000 rpm, faster as the rotor slows. rpm=0: not spinning, held level (no precession). set({ rpm }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const STEP = Math.PI / 60, g9 = 9.81, M = 0.15, R_ARM = 0.06, I = 0.5 * 0.12 * 0.035 * 0.035, AXZ = 3, MID = 60, RR = 35, HR = 44;
  const omegaOf = (rpm) => (rpm * 2 * Math.PI) / 60, precOf = (rpm) => (rpm > 0 ? (M * g9 * R_ARM) / (I * omegaOf(rpm)) : 0);
  // a cheap n-sided prism along F's axis (as gyroscope.js), for the parts rebuilt while the body swings
  const quickDisc = (F, s0, s1, r, P, tone, n = 32) => {
    const V = [];
    for (const sx of [s0, s1]) for (let i = 0; i < n; i++) V.push(G.pointOf(F, sx, r, (i / n) * Math.PI * 2));
    const faces = [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => n + i)];
    for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
    return ISO.poly(V, faces, P, tone);
  };

  // the body along heading phi: { back, front } svg (painted before / after the rotor), F, the near face's s
  function bodySvg(P, phi) {
    const a = [Math.cos(phi), Math.sin(phi), 0], b = [-a[1], a[0], 0], O = [0, 0, AXZ];
    const F = G.frameOf(O, a, b, [0, 0, 1]);
    const W = (s, bb, z) => [O[0] + a[0] * s + b[0] * bb, O[1] + a[1] * s + b[1] * bb, O[2] + z];
    const nearFree = K.depthOf(W(MID + 10, 0, 0), P) > K.depthOf(W(MID - 10, 0, 0), P);   // is the free end nearer us?
    const free = [], pivot = [];                                                            // items on each side of the rotor
    const put = (side, at, svg) => side.push({ k: K.depthOf(at, P), svg });
    const steel = (svg) => ISO.tinted(ISO.T.steel, svg);
    // the axle in two pieces, the ball on its pivot end, the hub's two halves
    put(pivot, W(28, 0, 0), `<g data-name="axle">${steel(quickDisc(F, 0, 52, 2.2, P, "mid", 8))}</g>`);
    put(pivot, W(0, 0, 0), `<g data-name="axle">${steel(K.solidSvg(G.sphereOf(O, 3, P, { steps: 20 }), { tone: "mid" }))}</g>`);
    put(free, W(94, 0, 0), `<g data-name="axle">${steel(quickDisc(F, 68, 120, 2.2, P, "mid", 8) + quickDisc(F, 118, 121, 2.8, P, "mid", 8))}</g>`);
    put(pivot, W(53, 0, 0), `<g data-name="rotor">${ISO.tinted(ISO.T.brass, quickDisc(F, 50, 55, 7, P, "mid", 12))}</g>`);
    put(free, W(67, 0, 0), `<g data-name="rotor">${ISO.tinted(ISO.T.brass, quickDisc(F, 65, 70, 7, P, "mid", 12))}</g>`);
    // the hoop frame in the axle's upright plane: 16 short square-section pieces, split at its top and bottom
    const n = 16;
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2, tm = (t0 + t1) / 2;
      const at = (t, r, bb) => W(MID + r * Math.cos(t), bb, r * Math.sin(t));
      put(Math.cos(tm) > 0 ? free : pivot, at(tm, HR, 0), `<g data-name="frame">${steel(ISO.box(at, P, [t0, t1], [HR - 2, HR + 2], [-3, 3], "mid"))}</g>`);
    }
    // the bearing bosses where the axle passes the hoop
    put(pivot, W(16, 0, 0.1), `<g data-name="frame">${steel(quickDisc(F, 11, 21, 4.4, P, "mid", 10))}</g>`);
    put(free, W(104, 0, 0.1), `<g data-name="frame">${steel(quickDisc(F, 99, 109, 4.4, P, "mid", 10))}</g>`);
    const paint = (side) => side.sort((p, q) => p.k - q.k).map((p) => p.svg).join("");
    const rotor = `<g data-name="rotor">${ISO.tinted(ISO.T.brass, quickDisc(F, MID - 5, MID + 5, RR, P, "hi", 28))}</g>`;
    const [far, near] = nearFree ? [pivot, free] : [free, pivot];
    return { back: paint(far) + rotor, front: paint(near), F, sNear: nearFree ? MID + 5.02 : MID - 5.02 };
  }
  // the rotor's face: the web's recess, the hub's ring and six spokes (the visible turn is slowed, as a camera sees it)
  const spokesSvg = (P, F, s, spin) => window.LAB.L(G.circleOf(F, s, RR - 5, P) + G.circleOf(F, s, 9, P) + G.spokesOf(F, s, 9, RR - 5, 6, P, { phase: spin }), { tone: "lo" });

  ISO.add({
    name: "gyrorotor", title: "Gyroscope rotor (part)", compare: null,
    about: "A toy gyroscope: a brass rotor 7 cm across spinning on a 12 cm steel axle in a steel hoop; resting one end on a pivot it swings slowly round instead of falling (precession, Ω = mgr/Iω). anchors: pivot",
    line: "gyrorotor cx cy k rpm=0..8000 deg=0..360 lab=0 lit=rotor|frame|axle",
    demo: { line: "gyrorotor 480 300 28 rpm=6000 lab=1", script: [{ set: {}, hold: 2 }, { set: { rpm: 3000, lit: "rotor" }, hold: 2.5 }, { set: { rpm: 6000, lit: "frame" }, hold: 2 }, { set: { rpm: 0, lit: "axle" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { rpm: ISO.clamp(ISO.num(o, "rpm", 6000), 0, 8000), phi: (ISO.num(o, "deg", 30) * Math.PI) / 180, spin: 0 }; s.rpmT = s.rpm;
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="back"></g><g data-part="spokes"></g><g data-part="front"></g><g data-part="words"></g>`;
      g.anchors = { pivot: [0, 0, 0] };
      const el = LAB.parts(g), w = ISO.writer();
      // ponytail: every 3° of the swing is built and parsed once and kept (120 poses at most), so steady precession costs no builds
      let body = null, key = -1;
      const poses = new Map();
      const draw = () => {
        const q = ((Math.round(s.phi / STEP) % 120) + 120) % 120;
        if (q !== key) { key = q; 
          if (!poses.has(q)) {   // parsed once into kept <g>s; later visits only swap the nodes in
            const b = bodySvg(Pm, q * STEP), mkG = (html) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = html; return e; };
            poses.set(q, { F: b.F, sNear: b.sNear, back: mkG(b.back), front: mkG(b.front) });
          }
          body = poses.get(q); el.back.replaceChildren(body.back); el.front.replaceChildren(body.front);
        }
        w.rebuild(el.spokes, `${q} ${s.spin.toFixed(2)}`, () => `<g data-name="rotor">${spokesSvg(Pm, body.F, body.sNear, s.spin)}</g>`);
        if (lab) w.rebuild(el.words, String(Math.round(s.rpm / 100)), () => LAB.word(Pm, lab, [0, 0, 70], `${Math.round(s.rpm / 100) * 100} rpm`, "#6b5114", { dy: -6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.rpm !== undefined && Number.isFinite(+p.rpm)) s.rpmT = ISO.clamp(+p.rpm, 0, 8000);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.rpm = ISO.follow(s.rpm, s.rpmT, dt, 0.8, calm); if (Math.abs(s.rpm - s.rpmT) < 5) s.rpm = s.rpmT;
        // below about 1500 rpm a real one wobbles and drops; here it eases to rest, held level
        const spinning = s.rpm >= 1500;
        if (!calm && spinning) { s.phi = (s.phi + precOf(s.rpm) * dt) % (2 * Math.PI); s.spin = (s.spin + Math.min(omegaOf(s.rpm), 40) * dt * 0.3) % (Math.PI * 2); }
        draw();
        return spinning || s.rpm !== s.rpmT;
      };
      g.readout = () => {
        if (s.rpm < 1500) return `rotor ${Math.round(s.rpm)} rpm · too slow to hold itself up: it is held level (a real one would topple)`;
        const W0 = precOf(s.rpm);
        return `rotor ${Math.round(s.rpm)} rpm · precession Ω = mgr/(Iω) = ${W0.toFixed(2)} rad/s · once round every ${((2 * Math.PI) / W0).toFixed(1)} s`;
      };
      draw();
      return g;
    },
  });
})();
