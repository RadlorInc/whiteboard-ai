// "cricketbat cx cy height rot=deg swing=0|1 lab=1 lit=bat|ball|stumps" — a willow cricket bat, a red ball, a wicket.
// The bat at its legal limits (Law 5): 965 mm long, the blade 108 mm wide and 67 mm deep at the spine, a cane handle
// in a ribbed rubber grip, the splice where the handle enters the blade, flat face, rounded toe, the spine down the
// back. Behind it the wicket: three 711 mm stumps 228.6 mm across, two bails, on a pitch with its popping crease.
// rot= leans the bat at rest. set({ swing: 1 }): the bat lifts back and swings through, meets the ball (156 g,
// 72 mm) low on the blade and drives it off its tee back up the pitch (shown slowed, so the
// ball's flight is a true parabola in slowed time). World units: 1 = 1 mm.
// (The ball waits on a practice batting tee, whose rubber stem the bat knocks forward and which springs back.)
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const LEN = 965, BLADE = 610, HW = 54, BR = 36, PIV = [0, 0, LEN + 60];     // pivot: the hands, the bat hangs from them
  const PITCH = { x: -860, y: -420, w: 2120, d: 840, r: 20 }, STUMPX = -700, CREASE = 520;
  const SLOW = 6, GS = 9810 / (SLOW * SLOW);                                  // gravity in slowed time
  const T_HIT = 1.0, HIT = [58, 0, 192], TEE = [HIT[0], HIT[1]], TEEH = HIT[2] - BR - 4;   // the ball sits on a batting tee
  const OUTV = [300, 0, 520];                                                 // after the hit, mm/s in slowed time
  const outAt = (t) => { const tt = t - T_HIT, land = (OUTV[2] + Math.sqrt(OUTV[2] ** 2 + 2 * GS * (HIT[2] - BR))) / GS; if (tt <= land) return [HIT[0] + OUTV[0] * tt, HIT[1], HIT[2] + OUTV[2] * tt - 0.5 * GS * tt * tt]; const roll = Math.min(tt - land, 1.2), v = OUTV[0] * 0.6; return [HIT[0] + OUTV[0] * land + v * roll - 0.5 * (v / 1.2) * roll * roll, HIT[1], BR]; };
  const ballAt = (t) => (t < T_HIT ? HIT : outAt(t));
  // the tee's rubber stem: knocked forward by the bat as it follows through, then springing back (damped)
  const stemAt = (t) => { const u = t - T_HIT; return u <= 0 ? 0 : Math.exp(-2.5 * u) * Math.sin(10 * u); };
  // the swing: angle of the bat about the hands (0 hanging straight, + lifted back, − followed through)
  const swingAt = (t, rest) => {
    if (t < 0) return rest;
    if (t < 0.55) return rest + (1.35 - rest) * ISO.ease(t / 0.55);
    if (t < T_HIT) { const f = (t - 0.55) / (T_HIT - 0.55); return 1.35 * (1 - f * f); }   // speeding up into the ball
    if (t < 1.4) { const f = (t - T_HIT) / 0.4; return -1.7 * Math.sin((f * Math.PI) / 2); }
    if (t < 2.4) return -1.7;
    if (t < 3.4) return -1.7 + (rest + 1.7) * ISO.ease(t - 2.4);
    return rest;
  };
  const RUBBER = ["#7e1a12", "#d0402e"], WILLOW = ["#c9a463", "#f6e3b8"];

  function batSvg(P, th) {
    const d = [-Math.sin(th), 0, -Math.cos(th)], n = [Math.cos(th), 0, -Math.sin(th)], up = G.mul3(d, -1), toe = G.add3(PIV, G.mul3(d, LEN));
    const F = G.frameOf(toe, up, [0, 1, 0], n), out = [];
    const face = G.dot3(n, G.viewOf(P)) > 0;
    // the blade: flat face (v +20), shoulders sloping into the handle, a rounded toe; the spine stacked on the back
    const blade = [[-HW + 10, 0], [HW - 10, 0], [HW - 2, 6], [HW, 18], [HW, BLADE - 70], [HW - 8, BLADE - 30], [20, BLADE], [-20, BLADE], [-HW + 8, BLADE - 30], [-HW, BLADE - 70], [-HW, 18], [-HW + 2, 6]];
    const spine = (w, s0, s1) => [[-w, s0], [w, s0], [w * 0.9, s1], [-w * 0.9, s1]];
    const back = [DAILY.prism(P, F, spine(40, 50, BLADE - 110), -32, -20, WILLOW, "#f2dca8", "#7a5a2e"), DAILY.prism(P, F, spine(27, 80, BLADE - 150), -42, -32, WILLOW, "#f2dca8", "#7a5a2e"), DAILY.prism(P, F, spine(14, 110, BLADE - 190), -47, -42, WILLOW, "#f2dca8", "#7a5a2e")];
    const handle = () => {
      const ring = Array.from({ length: 12 }, (_, i) => [Math.cos((i * Math.PI) / 6) * 16, Math.sin((i * Math.PI) / 6) * 16]);
      const grip = Array.from({ length: 12 }, (_, i) => [Math.cos((i * Math.PI) / 6) * 18.5, Math.sin((i * Math.PI) / 6) * 18.5]);
      const Fh = G.frameOf(toe, [0, 1, 0], n, up);                        // outline in (n, y), extruded along the bat
      return DAILY.prism(P, Fh, ring, BLADE - 40, BLADE + 40, ["#a8743e", "#e9c690"], "#d9b07a", "#5a3a1a") +
        DAILY.prism(P, Fh, grip, BLADE + 40, LEN - 6, RUBBER, "#c0392b", "#4a0c06",
          // the grip's ribs: rings round it, each a closed ring
          [0.2, 0.35, 0.5, 0.65, 0.8].map((f) => { const s = BLADE + 40 + (LEN - 6 - BLADE - 40) * f; return `<path d="${K.pathOf(grip.map(([a, b]) => K.iso(G.add3(G.add3(G.add3(toe, G.mul3(n, a * 1.01)), [0, b * 1.01, 0]), G.mul3(up, s)), P)), true)}" fill="none" stroke="#5a0e08" stroke-width=".7"/>`; }).join("")) +
        DAILY.prism(P, Fh, grip.map(([a, b]) => [a * 1.08, b * 1.08]), LEN - 6, LEN, RUBBER, "#a8301f", "#4a0c06");
    };
    if (face) out.push(...back, handle());
    out.push(DAILY.prism(P, F, blade, -20, 20, WILLOW, face ? "#f9ebc8" : "#efd7a2", "#7a5a2e",
      face ? `<path d="${K.pathOf([[-20, BLADE], [0, BLADE - 120], [20, BLADE]].map(([u, s]) => K.iso(DAILY.at(F, u, s, 20.2), P)))}" fill="none" stroke="#9a7440" stroke-width=".8"/>` +
        // the grain of the willow: straight lines down the face, from the toe to the shoulders
        `<path d="${[-36, -22, -9, 5, 18, 31, 43].map((u) => K.pathOf([[u, 2], [u, BLADE - 72]].map(([a, b]) => K.iso(DAILY.at(F, a, b, 20.2), P)))).join("")}" fill="none" stroke="#e2c690" stroke-width=".6"/>` : ""));
    if (!face) out.push(handle(), ...back);
    return out.join("");
  }
  function ballSvg(P) {
    const c = [0, 0, 0], V = G.viewOf(P), k = K.cameraOf(P).k;
    const seam = Array.from({ length: 49 }, (_, i) => { const t = (i / 48) * Math.PI * 2; return G.unit3([Math.cos(t) * 0.55, Math.sin(t), Math.cos(t) * 0.83]); }).filter((n) => G.dot3(n, V) > 0.02).map((n) => K.iso(G.mul3(n, BR * 1.01), P));
    return ISO.tinted(ISO.tint("#e8766a", ["#7e1a12", "#931f16", "#a8281d", "#bd3627"], "#4a0c06"), S(G.sphereOf(c, BR, P, { steps: 40 }), { tone: "hi" })) +
      (seam.length > 1 ? `<path d="${K.pathOf(seam)}" fill="none" stroke="#f4ead8" stroke-width="${(2.4 * k).toFixed(2)}" stroke-dasharray="${(1.2 * k).toFixed(2)} ${(1.4 * k).toFixed(2)}"/>` : "");
  }
  function teeSvg(P, a) {
    const F = G.frameOf([TEE[0], TEE[1], 4], [Math.sin(a), 0, Math.cos(a)], [Math.cos(a), 0, -Math.sin(a)], [0, 1, 0]);
    return ISO.tinted(ISO.T.rubber, S(G.disc(0, TEEH - 14, 9, F, P, { steps: 20 }), { tone: "mid" }) + S(G.lathe([[TEEH - 14, 0], [TEEH - 14, 9], [TEEH - 2, 20, 1], [TEEH, 21], [TEEH, 0]], F, P, { steps: 28 }), { tone: "mid" }));
  }
  function pitchSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(PITCH, -30, 30, P)}"/>`, DAILY.prism(P, G.frameOf([0, 0, -30], [0, 1, 0], [1, 0, 0], [0, 0, 1]), DAILY.rrect(PITCH.x, PITCH.y, PITCH.x + PITCH.w, PITCH.y + PITCH.d, PITCH.r, 3), 0, 30, ["#a88a5a", "#e8d5a8"], "#e2cf9c", "#6e5a30")];
    // the bowling crease through the stumps, the popping crease 1.22 m in front, the return creases
    const line = (a, b) => K.pathOf([K.iso([a[0], a[1], 0.2], P), K.iso([b[0], b[1], 0.2], P)]);
    out.push(`<path d="${line([STUMPX, -PITCH.d / 2], [STUMPX, PITCH.d / 2]) + line([CREASE, -PITCH.d / 2], [CREASE, PITCH.d / 2])}" fill="none" stroke="#fdfdfb" stroke-width="${(25 * K.cameraOf(P).k).toFixed(2)}" opacity=".9"/>`);
    return out.join("");
  }
  // (audit: the stumps stand on the pitch, a DAILY.prism the audit does not record, so they read as "loose"; the ball
  // is drawn at the origin and moved by a group transform, so it reads as "sunk" into the tee's foot.)
  function stumpsSvg(P) {
    const out = [];
    for (const y of [-114.3, 0, 114.3].sort((a, b) => K.depthOf([STUMPX, a, 0], P) - K.depthOf([STUMPX, b, 0], P))) {
      out.push(ISO.tinted(ISO.T.wood, S(K.cylinder(STUMPX, y, 18, 0, 700, P, 28), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.wood, S(G.solidOf([[700, 18], [705, 14, 1], [711, 6]], DAILY.zAx([STUMPX, y, 0]), P, { steps: 20 }), { tone: "hi" })));
    }
    // two bails resting in the grooves across the tops
    for (const [y0, y1] of [[-114.3, 0], [0, 114.3]]) out.push(ISO.tinted(ISO.T.wood, S(G.solidOf([[0, 4], [12, 7, 1], [44, 7, 1], [56, 4]], DAILY.yAx([STUMPX, y0 + (y1 - y0) / 2 - 28 + 0.01, 711 + 3]), P, { steps: 16 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "cricketbat", title: "Cricket bat", compare: "cricketbat 480 270 320 rot=20",
    about: "A willow cricket bat in front of the wicket: a ball comes down the pitch, the bat lifts back, swings through and drives the ball back up the pitch.",
    line: "cricketbat cx cy height rot=deg swing=0|1 lab=1 lit=bat|ball|stumps",
    demo: { line: "cricketbat 480 270 320 rot=10", script: [{ set: {}, hold: 1 }, { set: { swing: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", rest = (ISO.clamp(ISO.num(o, "rot", 0), -60, 60) * Math.PI) / 180;
      const W = size * 2.7, Hh = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(PITCH, -30, 0), [0, 0, PIV[2] + 60], [STUMPX, 0, 760], [-950, 0, 860], [960, 0, 1190]], cx, cy, W, Hh, { azimuth: 44, elevation: 16 }, parent);
      g.innerHTML = pitchSvg(P) + `<path data-k="shadow" fill="#1d2126" opacity=".16"/><g data-name="stumps">${stumpsSvg(P)}</g>` +
        `${ISO.tinted(ISO.T.rubber, S(K.cylinder(TEE[0], TEE[1], 34, 0, 4, P, 32, 0.8), { tone: "lo" }))}<g data-name="tee"></g><g data-k="a"></g><g data-k="b"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["shadow", "stumps", "tee", "a", "b", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const bat = mk("g", { "data-name": "bat" }, el.a), ball = mk("g", { "data-name": "ball" }, el.b);
      ball.innerHTML = ballSvg(P);
      const sort = ISO.sorter(P, el.a), memo = DAILY.memo(600);
      const s = { t: -1, on: false };
      let lit = o.lit || "";
      const draw = () => {
        const th = swingAt(s.on ? s.t : -1, rest), key = (Math.round(th * 150) / 150).toFixed(4);
        w.rebuild(bat, key, () => memo(key, () => batSvg(P, +key)));
        const b = ballAt(s.on ? s.t : -1), st = s.on ? stemAt(s.t) : 0;
        const sk = (Math.round(st * 50) / 50).toFixed(2);
        w.rebuild(el.tee, sk, () => memo("t" + sk, () => teeSvg(P, +sk)));
        w.shown(ball, !!b);
        if (b) {
          w.attr(ball, "transform", K.translateAlong(P, b));
          const p = K.iso([b[0], b[1], 0], P), r = BR * K.cameraOf(P).k * (1 - Math.min(0.5, b[2] / 1500));
          w.attr(el.shadow, "d", `M${(p[0] - r).toFixed(1)} ${p[1].toFixed(1)}a${r.toFixed(1)} ${(r * 0.3).toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${(r * 0.3).toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z`);
          // the ball in front of the bat or behind it, by depth
          sort({ bat, ball }, { bat: G.add3(PIV, G.mul3([-Math.sin(th), 0, -Math.cos(th)], LEN * 0.8)), ball: b });
        } else w.attr(el.shadow, "d", "");
        if (ball.parentNode !== el.a) el.a.append(ball);
        const hit = s.on && s.t >= T_HIT;
        const still = !s.on || s.t < 0 || s.t >= 3.4;
        w.rebuild(el.words, lab ? `${still}` : "", () => !lab ? "" : [
          ISO.word(K.iso([STUMPX, -114, 760], P), "stumps and bails", "#7a5a2e", { anchor: "middle", size: 14, dy: -6 }),
          still ? ISO.word(K.iso([0, HW, PIV[2] - BLADE - 120], P), "willow blade", "#7a5a2e", { anchor: "start", size: 14 }) : "",
          still ? ISO.word(K.iso([0, 20, PIV[2] - 120], P), "rubber grip", "#8f2a22", { anchor: "start", size: 13 }) : "",
          ISO.word(K.iso([TEE[0], TEE[1] + 40, 0], P), "batting tee", "#444", { anchor: "start", size: 13, dy: 12 }),
          ISO.word(K.iso([CREASE, PITCH.d / 2, 0], P), "popping crease", "#555", { anchor: "middle", size: 13, dy: 16 })].join(""));
        const want = lit || (s.on && s.t > 0 && s.t < 1.5 ? (s.t < T_HIT ? "bat" : "ball") : "");
        const groups = { bat: [bat], ball: [ball], stumps: [el.stumps] };
        w.light([bat, ball, el.stumps], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => {
        if (p.swing !== undefined) { if (+p.swing > 0.5) { s.on = true; s.t = -0.3; } else { s.on = false; } }
        if (p.lit !== undefined) lit = p.lit;
      };
      const END = 4.6;
      g.update = (dt) => {
        if (!s.on) { draw(); return false; }
        s.t = ISO.still() ? END : Math.min(END, s.t + dt);
        draw();
        return s.t < END;
      };
      g.readout = () => {
        if (!s.on || s.t < 0) return "bat 965 mm long, blade 108 mm wide and 67 mm deep (Law 5) · willow, about 1.2 kg · ball 156–163 g, 72 mm across, on a batting tee";
        if (s.t < T_HIT) return "bat lifted back, then swung down into the ball's line (shown slowed down)";
        if (s.t < 1.5) return "contact low on the blade, about 15–20 cm above the toe: the sweet spot, where the bat jars least";
        return "driven back up the pitch · in slowed time its flight is still a parabola: steady speed along, gravity pulling it down";
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
