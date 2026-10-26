// "lugorder cx cy size step=0..5 lab=1" — tighten the wheel nuts in a star. A wheel stands on the road with five nuts
// numbered 1 to 5 clockwise from the top; a click-type torque wrench visits them in the star order 1, 3, 5, 2, 4 so the
// wheel is pulled flat onto the hub evenly. Each step moves the socket across the face to the next nut (the star line
// is drawn behind it as it goes), slides it on, pulls the handle down until the wrench clicks at 110 N·m, and backs it
// off; a tightened nut turns green. set({ step }) plays step n from the pose the steps before it leave.
// World units: 1 = 1 cm (64 cm tyre on a 40 cm rim; nuts drawn larger than life so the order reads).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TYRE_R = 32, RIM_R = 19.5, TYRE_W = 22, BOLT_R = 10, NUT_R = 2.1, FACE = TYRE_W / 2;
  const STAR = [0, 2, 4, 1, 3], TORQUE = 110, HANDLE = 30, OFF = 5, SWING = 0.32;
  const T = { move: 0.75, on: 0.4, pull: 0.9, off: 0.4, park: 0.8 };
  const STEP_T = (n) => T.move + T.on + T.pull + T.off + (n === 5 ? T.park : 0);
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, ROAD = ISO.T.road, GREEN = ISO.T.green;
  const yAxis = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
  const WHEEL = yAxis(0, 0, TYRE_R);
  // Frame angles run clockwise as you see the wheel face: nut p sits p × 72° clockwise from the top.
  const ANG = (p) => Math.PI / 2 + (p * 2 * Math.PI) / 5;
  const nutAt = (p, s = FACE) => G.pointOf(WHEEL, s, BOLT_R, ANG(p));
  const PARK = [12, 0, TYRE_R + 21];                       // where the wrench waits before step 1 (x, -, z on the face)
  const ROAD_PLAN = { x: -38, y: -15, w: 76, d: 36, r: 4 };
  // A word with a paper-coloured rim, so it reads over the dark tyre.
  const rimmed = (svg) => svg.replace("<text ", '<text stroke="#fdfdfb" stroke-width="4" stroke-linejoin="round" paint-order="stroke" ');
  const ease = ISO.ease, lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

  function roadSvg(P) {
    return `<path class="iso-halo" d="${K.haloOf(ROAD_PLAN, -4, 4, P)}"/>` + ISO.tinted(ROAD, S(K.slabOf(ROAD_PLAN, -4, 4, P, 4, 0.8), { tone: "mid" })) +
      `<path class="iso-halo" d="${K.haloOf({ x: -14, y: -12, w: 28, d: 24, r: 8 }, 0, 1, P)}"/>`;
  }
  function wheelSvg(P) {
    const F = WHEEL, h = FACE;
    const tyre = G.solidOf([[-h, 25], [-h + 0.8, 29.5, 1], [-h + 3, 31.6, 1], [-h + 6, 32, 1], [h - 6, 32, 1], [h - 3, 31.6, 1], [h - 0.8, 29.5, 1], [h, 25]], F, P);
    const out = [ISO.tinted(RUBBER, S(tyre, { tone: "hi" }) + K.fadedSvg(G.ribsOf(F, -h + 4, h - 4, 32.05, 44, P, { fade: [0.1, 0.55], seams: true }), { tone: "faint" }) +
      L(G.circleOf(F, h, 27.5, P) + G.circleOf(F, h, 26.2, P), { tone: "faint" }))];
    const metal = [S(G.ringBand(h - 2, h + 0.2, 17, RIM_R, F, P), { tone: "hi" }), S(G.disc(h - 3.2, h - 1.8, 17, F, P), { tone: "mid" })];
    metal.push(L(Array.from({ length: 10 }, (_, i) => G.circleOf(yAxis(...G.pointOf(F, h - 1.8, 14.6, (i * Math.PI) / 5 + 0.31)), 0, 1.3, P)).join(""), { tone: "lo" }));
    metal.push(L(G.circleOf(F, h - 1.8, 12.6, P), { tone: "faint" }));
    // A valve stem at the rim's edge, and the hub cap with its centre ring.
    const valve = G.frameAlong(G.pointOf(F, h - 1, 18.2, ANG(2.5)), G.radialOf(F, ANG(2.5)));
    metal.push(ISO.tinted(RUBBER, S(G.disc(-1, 1.6, 0.7, valve, P), { tone: "mid" })), S(G.disc(1.6, 2.4, 0.5, valve, P), { tone: "mid" }));
    metal.push(S(G.disc(h - 1.8, h - 0.4, 6.6, F, P), { tone: "mid" }), L(G.circleOf(F, h - 0.4, 3, P) + G.circleOf(F, h - 0.4, 5.2, P), { tone: "faint" }));
    out.push(ISO.tinted(STEEL, metal.join("")));
    return out.join("");
  }
  // A wheel nut on its stud: washer collar, the hex at angle `turn`, the stud's tip.
  function nutSvg(P, p, turn) {
    const F = yAxis(...nutAt(p, FACE - 0.4));
    return S(G.disc(0, 0.5, NUT_R + 0.35, F, P), { tone: "mid" }) +
      S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(turn + (i * Math.PI) / 3) * NUT_R, Math.sin(turn + (i * Math.PI) / 3) * NUT_R]), 0.5, 3.4, P), { tone: "hi" }) +
      S(G.disc(3.4, 3.9, 0.62, F, P), { tone: "mid" });
  }
  // The torque wrench, built at the face centre (x = z = 0) and moved with a translate: socket, extension, round
  // ratchet head with its reversing lever, then the handle with the scale window and the knurled grip at angle a.
  function wrenchSvg(P, a, lab) {
    const F = yAxis(0, FACE + 0.6, 0), head = G.pointOf(F, 8, 0, 0), arm = G.frameAlong(head, G.radialOf(F, a)), view = G.viewOf(P);
    const out = [S(G.solidOf([[0, 1.55], [3.6, 1.55], [4.2, 1.1], [4.6, 0.75], [6.6, 0.75]], F, P, { steps: 24, smooth: false }), { tone: "hi", inner: L(G.arcOf(F, 1.2, 1.55, P) + G.arcOf(F, 2, 1.55, P), { tone: "faint" }) })];
    const handle = G.solidOf([[0, 1], [HANDLE - 11, 1.15], [HANDLE - 10.4, 1.35], [HANDLE - 0.8, 1.35], [HANDLE, 1.05]], arm, P, { steps: 22, smooth: false });
    const grip = K.fadedSvg(G.ribsOf(arm, HANDLE - 10, HANDLE - 1.4, 1.36, 24, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" });
    // Scale window: a slot on the handle's face toward you, with its index line.
    const n = G.unit3(G.cross3(arm.a, [0, 1, 0])), up = G.dot3(n, view) > 0 ? n : G.mul3(n, -1);
    const win = [[6, -0.45], [14, -0.45], [14, 0.45], [6, 0.45]].map(([s, w]) => K.iso(G.add3(G.add3(G.pointOf(arm, s, 0, 0), G.mul3(up, 1.08)), G.mul3([0, 1, 0], w)), P));
    const handleSvg = S(handle, { tone: "hi" }) + grip + `<path d="${K.pathOf(win, true)}" fill="#f5f1dd" stroke="#3c3f45" stroke-width="0.6"/>`;
    const headSvg = S(G.disc(6.6, 9.4, 2.5, F, P), { tone: "hi", inner: L(G.arcOf(F, 8, 2.5, P), { tone: "faint" }) }) + S(G.disc(9.4, 9.9, 1.2, F, P), { tone: "mid" }) +
      D([K.iso(G.pointOf(F, 9.9, 0, 0), P)], { size: 0.5, tone: "hi" });
    out.push(G.dot3(arm.a, view) < 0 ? handleSvg + headSvg : headSvg + handleSvg);
    if (lab) out.push(rimmed(ISO.word(K.iso(G.pointOf(arm, HANDLE, 0, 0), P), "torque wrench", "#444", { anchor: "start", size: 15, dy: 18 })));
    return ISO.tinted(STEEL, out.join(""));
  }

  // The pose at time t into step n (1..5): tool position on the face, how far it is backed off, the handle's swing,
  // which nuts are done and which is being tightened.
  function poseAt(n, t) {
    const prev = n > 1 ? nutAt(STAR[n - 2]) : PARK, to = nutAt(STAR[n - 1]);
    const k = (a, d) => ease((t - a) / d), t1 = T.move, t2 = t1 + T.on, t3 = t2 + T.pull;
    const t4 = t3 + T.off, at = n === 5 && t > t4 ? lerp(to, PARK, k(t4, T.park)) : lerp(prev, to, k(0, T.move));
    const shift = n === 0 ? OFF : t < t1 ? OFF : t < t2 ? OFF * (1 - k(t1, T.on)) : t < t3 ? 0 : OFF * k(t3, T.off);
    const swing = t < t2 ? 0 : t < t3 ? SWING * k(t2, T.pull) : SWING * (1 - k(t3, T.off));
    const done = STAR.slice(0, Math.max(0, n - 1)).concat(t >= t3 ? [STAR[n - 1]] : []);
    const pull = t >= t2 && t < t3 ? k(t2, T.pull) : t >= t3 ? 1 : 0;
    return { at, shift, swing, done, active: t >= t1 && t < t3 + T.off ? STAR[n - 1] : -1, line: k(0, T.move), pull, phase: t < t1 ? "move" : t < t2 ? "on" : t < t3 ? "pull" : "off" };
  }

  ISO.add({
    name: "lugorder", title: "Tighten in a star", compare: "lugorder 480 270 260",
    about: "Wheel with five numbered nuts; a torque wrench tightens them in the star order 1-3-5-2-4 to 110 N·m, each nut turning green when it clicks.",
    line: "lugorder cx cy size step=0..5 lab=1",
    demo: { line: "lugorder 480 270 260", script: [1, 2, 3, 4, 5].map((n) => ({ set: { step: n }, hold: "settle" })) },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.4, H = size * 1.9;
      const { P, g } = ISO.frame([...K.boxCorners(ROAD_PLAN, -4, 0), [-33, 0, 2 * TYRE_R + 1], [33, 0, 2 * TYRE_R + 1], [PARK[0] + HANDLE + 1, FACE + OFF, PARK[2]], [PARK[0], FACE + OFF + 10, PARK[2] + 3]], cx, cy, W, H, { azimuth: 64, elevation: 18 }, parent);
      g.innerHTML = `<g>${roadSvg(P)}${wheelSvg(P)}</g><g data-name="star"></g>` + [0, 1, 2, 3, 4].map((p) => `<g data-nut="${p}"></g>`).join("") +
        `<g data-name="wrench"></g><g data-name="numbers"></g>`;
      const nuts = [...g.querySelectorAll("[data-nut]")], star = g.querySelector('[data-name="star"]'), wrench = g.querySelector('[data-name="wrench"]'), w = ISO.writer();
      // The numbers, clockwise from the top, just outside each nut on the rim.
      g.querySelector('[data-name="numbers"]').innerHTML = [0, 1, 2, 3, 4].map((p) => {
        const q = K.iso(G.pointOf(WHEEL, FACE, BOLT_R + 5.2, ANG(p)), P);
        return rimmed(ISO.word(q, String(p + 1), "#c0392b", { size: 19, dy: 7 }));
      }).join("");
      const cur = { step: ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 5), t: 1e9 };
      const segment = (a, b, f) => { const p0 = K.iso(nutAt(a, FACE - 0.3), P), p1 = K.iso(lerp(nutAt(a, FACE - 0.3), nutAt(b, FACE - 0.3), f), P); return K.pathOf([p0, p1]); };
      const draw = (s) => {
        // Star: finished legs solid, the leg being drawn follows the socket, the leg back to 1 dashed once all are done.
        const legs = [];
        for (let i = 1; i < 5; i++) {
          const f = i < cur.step - 1 || (i === cur.step - 1 && s.done.length >= i + 1) ? 1 : i === cur.step - 1 ? s.line : 0;
          if (i <= cur.step - 1 && f > 0) legs.push(segment(STAR[i - 1], STAR[i], f));
        }
        const closing = s.done.length === 5 ? `<path d="${segment(STAR[4], STAR[0], 1)}" stroke="#2b6cc4" stroke-width="2" stroke-dasharray="5 5" fill="none" opacity="0.7"/>` : "";
        w.rebuild(star, legs.join("") + closing, () => `<path d="${legs.join("")}" stroke="#2b6cc4" stroke-width="2.4" stroke-linecap="round" fill="none"/>${closing}`);
        nuts.forEach((el, p) => {
          const turn = -(s.done.includes(p) ? 1 : p === s.active ? s.pull : 0) * SWING * 1.1 - p * 0.21;
          w.rebuild(el, `${Math.round(turn / 0.025)} ${s.done.includes(p)}`, () => ISO.tinted(s.done.includes(p) ? GREEN : STEEL, nutSvg(P, p, turn)));
        });
        w.rebuild(wrench, String(Math.round(s.swing / 0.012)), () => wrenchSvg(P, Math.PI + s.swing, lab));
        w.attr(wrench, "transform", K.translateAlong(P, [s.at[0], s.shift, s.at[2]]));
        w.light([wrench, ...nuts], s.active >= 0 ? [nuts[s.active]] : []);
        cur.pose = s;
      };
      g.set = (q) => { if (q.step !== undefined) { cur.step = ISO.clamp(Math.round(+q.step), 0, 5); cur.t = 0; } };
      g.update = (dt) => {
        cur.t += dt;
        const n = cur.step;
        draw(n ? poseAt(n, ISO.still() ? 1e9 : cur.t) : { at: PARK, shift: OFF, swing: 0, done: [], active: -1, line: 0, pull: 0, phase: "park" });
        return n > 0 && cur.t < STEP_T(n) + 0.1;
      };
      g.readout = () => {
        const s = cur.pose, n = cur.step;
        if (!n) return "five nuts, numbered clockwise · tighten in a star: 1, 3, 5, 2, 4 · torque wrench set to 110 N·m";
        const nut = STAR[n - 1] + 1, nth = ["1st", "2nd", "3rd", "4th", "5th"][n - 1];
        if (s.phase === "move") return `across to nut ${nut} · ${nth} of 5 in the star`;
        if (s.phase === "on") return `socket on nut ${nut}`;
        if (s.phase === "pull") return `pulling nut ${nut} · ${Math.round(TORQUE * s.pull)} N·m of ${TORQUE}`;
        return n === 5 ? `all five at ${TORQUE} N·m · order 1, 3, 5, 2, 4 · go round once more to check` : `click · nut ${nut} at ${TORQUE} N·m · ${n} of 5 done`;
      };
      g.update(0);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
