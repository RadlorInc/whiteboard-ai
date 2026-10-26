// "lugwrench cx cy length rot=deg turn=deg nut=1 on=1 lit=wrench lab=1" — a four-way cross lug wrench on a wheel nut.
// The wrench is two crossed steel bars welded at the middle, a socket on each arm (17, 19, 21 and 23 mm). The 19 mm
// socket sits on the top nut of a wheel standing on the road; the side arms are the handle. rot is where the handle
// points (degrees from level), turn turns it on the nut (positive = anticlockwise as you face the wheel = loosen) and
// the nut turns with it; nut=0 draws the wrench alone. set({ turn, on }) turns it or puts it on / takes it off.
// World units: 1 = 1 cm. A 40 cm wrench, 20 cm arms; wheel nut on an M12 × 1.5 stud (1.5 mm of thread a turn).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TYRE_R = 32, RIM_R = 19.5, TYRE_W = 22, BOLT_R = 9.5, NUT_R = 2, ARM = 20, ROD = 1.05;
  const AT = (k) => ((90 - k * 72) * Math.PI) / 180;            // nut k's angle as you face the wheel, from the right, anticlockwise
  const FACE = TYRE_W / 2, NUT0 = [0, FACE + 0.4, TYRE_R + BOLT_R];   // the top nut: its axis point where the socket starts
  const SOCKETS = { in: 19, out: 21, a: 17, b: 23 };            // mm across the flats
  const PITCH = 0.15, PUSH = 275;                                // cm of thread a turn; N a hand
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, ROAD = ISO.T.road;
  const yAxis = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
  const ROAD_PLAN = { x: -38, y: -16, w: 76, d: 40, r: 4 };

  function roadSvg(P) {
    return `<path class="iso-halo" d="${K.haloOf(ROAD_PLAN, -4, 4, P)}"/>` + ISO.tinted(ROAD, S(K.slabOf(ROAD_PLAN, -4, 4, P, 4, 0.8), { tone: "mid" })) +
      `<path class="iso-halo" d="${K.haloOf({ x: -14, y: -12, w: 28, d: 24, r: 8 }, 0, 1, P)}"/>`;
  }
  // The wheel standing on the road: tyre with tread ribs, steel rim and centre, vent holes, hub cap and five studs.
  function wheelSvg(P) {
    const F = yAxis(0, 0, TYRE_R), h = FACE;
    const tyre = G.solidOf([[-h, 25], [-h + 0.8, 29.5, 1], [-h + 3, 31.6, 1], [-h + 6, 32, 1], [h - 6, 32, 1], [h - 3, 31.6, 1], [h - 0.8, 29.5, 1], [h, 25]], F, P);
    const out = [ISO.tinted(RUBBER, S(tyre, { tone: "hi" }) + K.fadedSvg(G.ribsOf(F, -h + 4, h - 4, 32.05, 44, P, { fade: [0.1, 0.55], seams: true }), { tone: "faint" }) +
      L(G.circleOf(F, h, 27.5, P), { tone: "faint" }) + L(G.circleOf(F, h, 26.2, P), { tone: "faint" }))];
    const metal = [S(G.ringBand(h - 2, h + 0.2, 17, RIM_R, F, P), { tone: "hi" }), S(G.disc(h - 3.2, h - 1.8, 17, F, P), { tone: "mid" })];
    // Eight round vent holes between the bolt circle and the rim, and the pressed ring the nuts sit on.
    metal.push(L(Array.from({ length: 8 }, (_, i) => { const c = G.pointOf(F, h - 1.8, 13.6, (i * Math.PI) / 4 + 0.39); return G.circleOf(G.frameOf(c, [0, 1, 0], [-1, 0, 0], [0, 0, 1]), 0, 1.6, P); }).join(""), { tone: "lo" }));
    metal.push(L(G.circleOf(F, h - 1.8, 11.6, P), { tone: "faint" }));
    metal.push(S(G.disc(h - 1.8, h - 0.4, 6.4, F, P), { tone: "mid" }), L(G.circleOf(F, h - 0.4, 3, P), { tone: "faint" }));
    out.push(ISO.tinted(STEEL, metal.join("")));
    return out.join("");
  }
  // A wheel nut: a washer collar, the hex turned by `turn`, and the stud's tip in front; hex = false draws the two
  // round parts only, hex = "only" the hex only (so a turning nut rebuilds just its hex).
  function nutSvg(P, k, turn, travel = 0, hex = true) {
    const c = [-Math.cos(AT(k)) * BOLT_R, 0, TYRE_R + Math.sin(AT(k)) * BOLT_R], F = yAxis(c[0], FACE + travel - 0.4, c[2]);
    const collar = hex === "only" ? "" : S(G.disc(0, 0.5, NUT_R + 0.3, F, P), { tone: "mid" });
    const nut = hex ? S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(turn + (i * Math.PI) / 3) * NUT_R, Math.sin(turn + (i * Math.PI) / 3) * NUT_R]), 0.5, 3.4, P), { tone: "hi" }) : "";
    const tip = hex === "only" ? "" : S(G.disc(3.4, 3.9, 0.62, F, P), { tone: "mid" });
    return ISO.tinted(STEEL, hex === true ? collar + nut + tip : hex === "only" ? nut : collar + `<g data-hex></g>` + tip);
  }
  // One arm of the wrench along frame A (from the weld at s = 0 out to the socket mouth at s = ARM): rod, a
  // tapered neck, the socket with its chamfer and stamp rings, and the hex bore if its mouth faces you.
  function armSvg(P, A, mm, view) {
    const r = mm / 20 + 0.5, hex = mm / 20 / Math.cos(Math.PI / 6), s0 = ARM - 6.2;
    const body = G.solidOf([[1.2, ROD], [s0 - 1.6, ROD], [s0, r * 0.82], [s0 + 0.5, r], [ARM - 0.4, r], [ARM, r - 0.3]], A, P, { steps: 22, smooth: false });
    const rings = [s0 + 1.6, s0 + 2.3, ARM - 0.4].map((s) => G.arcOf(A, s, r, P)).join("");
    const out = [S(body, { tone: "hi", inner: L(rings, { tone: "faint" }) })];
    if (G.dot3(A.a, view) > 0.15) {
      const pts = Array.from({ length: 6 }, (_, i) => K.iso(G.pointOf(A, ARM, hex, (i * Math.PI) / 3), P));
      out.push(`<path d="${K.pathOf(pts, true)}" fill="#2f3338" stroke="#1b1d20" stroke-width="0.6"/>`);
    }
    return out.join("");
  }
  // The whole wrench for handle angle th: pieces sorted so arms pointing away are drawn before the weld, the rest after.
  // The wrench in five slots: the arm into the nut, side arms pointing away, the weld, side arms pointing at you, the
  // arm out toward you. The two arms along the nut's axis never change as the handle turns; only the side arms are rebuilt.
  function wrenchParts(P, shift) {
    const F = yAxis(NUT0[0], NUT0[1] + shift, NUT0[2]), mid = G.pointOf(F, ARM, 0, 0), view = G.viewOf(P);
    return {
      F, mid, view,
      back: armSvg(P, G.frameAlong(mid, [0, -1, 0]), SOCKETS.in, view),
      front: armSvg(P, G.frameAlong(mid, [0, 1, 0]), SOCKETS.out, view),
      ball: S(G.sphereOf(mid, 1.55, P), { tone: "hi" }) + D([K.iso(mid, P)], { size: 0.55, tone: "hi" }),
      side: (th) => {
        const arms = [th, th + Math.PI].map((a, i) => { const A = G.frameAlong(mid, G.radialOf(F, a)); return { k: G.dot3(A.a, view), svg: armSvg(P, A, i ? SOCKETS.b : SOCKETS.a, view) }; });
        return { away: arms.filter((a) => a.k < 0).map((a) => a.svg).join(""), near: arms.filter((a) => a.k >= 0).map((a) => a.svg).join("") };
      },
    };
  }

  ISO.add({
    name: "lugwrench", title: "Cross lug wrench", compare: "lugwrench 480 270 300 rot=20",
    about: "Four-way cross wrench with a socket on each arm, sitting on a wheel nut; turning the handle anticlockwise loosens the nut.",
    line: "lugwrench cx cy length rot=deg turn=deg nut=1 on=1 lit=wrench lab=1",
    demo: { line: "lugwrench 480 270 300 on=0", script: [{ set: { on: 1 }, hold: "settle" }, { set: { turn: 90 }, hold: "settle" }, { set: { turn: 180 }, hold: "settle" }, { set: { turn: 0 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", showNut = o.nut !== "0", rot = (ISO.num(o, "rot", 0) * Math.PI) / 180;
      const W = size * 1.85, H = size * 1.45;
      // On its own (nut=0) the wrench is framed by itself, with its shadow on a floor just below the lowest arm.
      const reach = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (ARM + 3), NUT0[1] + ARM, NUT0[2] + sz * (ARM + 3)]));
      const FLOOR = NUT0[2] - ARM - 6, alone = [...reach, [0, NUT0[1] - 1, NUT0[2]], [0, NUT0[1] + 2 * ARM + 1, NUT0[2]], [-ARM, NUT0[1] + ARM, FLOOR], [ARM, NUT0[1] + ARM, FLOOR]];
      const { P, g } = ISO.frame(showNut ? [...K.boxCorners(ROAD_PLAN, -4, 0), [-34, 0, 2 * TYRE_R + 2], [34, 0, 2 * TYRE_R + 2], ...reach] : alone, cx, cy, W, H, { azimuth: 64, elevation: 18 }, parent);
      g.innerHTML = (showNut ? `<g>${roadSvg(P)}${wheelSvg(P)}</g><g data-name="nuts"></g>` : `<path class="iso-halo" d="${K.haloOf({ x: -ARM, y: NUT0[1] + 4, w: 2 * ARM, d: 2 * ARM - 8, r: 12 }, FLOOR, 1, P)}"/>`) +
        `<g data-name="nut"></g><g data-name="wrench" style="${STEEL}"><g data-w="back"></g><g data-w="away"></g><g data-w="ball"></g><g data-w="near"></g><g data-w="front"></g></g><g data-name="words"></g>`;
      const slot = Object.fromEntries([...g.querySelectorAll("[data-w]")].map((e) => [e.dataset.w, e]));
      let parts = null, hexSlot = null;
      const nut = g.querySelector('[data-name="nut"]'), wrench = g.querySelector('[data-name="wrench"]'), words = g.querySelector('[data-name="words"]'), w = ISO.writer();
      if (showNut) g.querySelector('[data-name="nuts"]').innerHTML = [1, 2, 3, 4].map((k) => nutSvg(P, k, 0.3 * k)).join("");
      const s = { turn: ISO.num(o, "turn", 0), on: ISO.num(o, "on", 1) ? 1 : 0, last: 0 }, goal = { turn: s.turn, on: s.on };
      let lit = o.lit || "wrench";
      const travel = () => (s.turn / 360) * PITCH;
      const draw = () => {
        // Frame angles run clockwise as you see the wheel face, so the handle's angle from level is π minus the frame angle.
        const th = Math.PI - rot - (s.turn * Math.PI) / 180, shift = (1 - s.on) * 16 + travel();
        if (showNut) {
          if (!hexSlot) { nut.innerHTML = nutSvg(P, 0, 0, 0, false); hexSlot = nut.querySelector("[data-hex]"); }
          w.rebuild(hexSlot, String(Math.round(s.turn / 1.5)), () => nutSvg(P, 0, (-s.turn * Math.PI) / 180, travel(), "only"));
          if (hexSlot._fresh && nut._lit) hexSlot.querySelectorAll(".iso-solid").forEach((n) => n.toggleAttribute("data-lit", true));
          hexSlot._fresh = false;
        }
        // Sliding on and off (and the nut's tiny travel) is a straight move along the nut's axis: a translate.
        w.attr(wrench, "transform", K.translateAlong(P, [0, shift, 0]));
        if (!parts) {
          parts = wrenchParts(P, 0);
          for (const k of ["back", "ball", "front"]) slot[k].innerHTML = parts[k];
          slot.key = ""; wrench._fresh = true;
        }
        const key = String(Math.round(th / 0.004));
        if (slot.key !== key) {
          slot.key = key; const sd = parts.side(th); slot.away.innerHTML = sd.away; slot.near.innerHTML = sd.near;
          if (wrench._lit) for (const e of [slot.away, slot.near]) e.querySelectorAll(".iso-solid").forEach((n) => n.toggleAttribute("data-lit", true));
        }
        w.attr(wrench, "opacity", Math.min(1, s.on * 1.5 + 0.0001).toFixed(2));
        // While it turns, say which hand pushes down and which pulls up (anticlockwise: the left end goes down).
        const turning = Math.abs(goal.turn - s.turn) > 0.5, dir = Math.sign(goal.turn - s.last), say = lab && dir !== 0 && s.on > 0.99;
        w.rebuild(words, say ? `${dir} ${th.toFixed(2)} ${shift.toFixed(2)}` : "", () => {
          if (!say) return "";
          const F = yAxis(NUT0[0], NUT0[1] + shift, NUT0[2]), mid = G.pointOf(F, ARM, 0, 0);
          return [th, th + Math.PI].map((a) => {
            const tip = G.add3(mid, G.mul3(G.radialOf(F, a), ARM + 2)), right = Math.cos(a) < 0, down = right === dir < 0;
            return ISO.word(K.iso(tip, P), down ? "push down" : "pull up", down ? "#c0392b" : "#2b6cc4", { anchor: right ? "start" : "end", size: 15, dy: down ? 18 : -8 }).replace("<text ", '<text stroke="#fdfdfb" stroke-width="4" stroke-linejoin="round" paint-order="stroke" ');
          }).join("");
        });
        w.light([wrench, nut], lit === "nut" ? [nut] : lit === "wrench" && (turning || s.on !== goal.on) ? [wrench] : []);
      };
      g.set = (p) => {
        if (p.turn !== undefined) { s.last = goal.turn; goal.turn = +p.turn; }
        if (p.on !== undefined) goal.on = +p.on ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.on = ISO.follow(s.on, goal.on, dt, 0.35, calm);
        if (s.on > 0.99 || calm) s.turn = ISO.follow(s.turn, goal.turn, dt, 0.55, calm);
        draw();
        return s.on !== goal.on || s.turn !== goal.turn;
      };
      g.readout = () => {
        const way = goal.turn > s.last ? "anticlockwise · loosening" : goal.turn < s.last ? "clockwise · tightening" : "on the nut";
        const torque = 2 * PUSH * (ARM / 100);
        return `${s.on < 0.99 ? "socket going onto the nut" : way} · turned ${Math.round(Math.abs(s.turn))}° · nut ${(Math.abs(travel()) * 10).toFixed(2)} mm ${s.turn >= 0 ? "out" : "in"} (1.5 mm a turn) · ` +
          `${ARM} cm arms: push ${PUSH} N + pull ${PUSH} N = ${Math.round(torque)} N·m`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
