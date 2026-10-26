// "airplane cx cy length rot=deg pitch=0 roll=0 yaw=0 flaps=0 lab=1 lit=wing|aileron|flap|elevator|rudder|engine" —
// a twin-jet airliner model on a desk stand, nose to the right, with every control surface on its hinge.
// pitch (−1..1) swings both elevators (±20°): trailing edges up push the tail down and the nose up. roll (−1..1) moves
// the ailerons opposite ways (±20°): roll right = left aileron down (more lift on the left wing), right aileron up.
// yaw (−1..1) swings the rudder (±25°): rudder left pushes the tail right and the nose left. flaps (0..1) lower and run
// the flaps back (0–35°) for more lift at low speed. 1 unit ≈ 0.16 m (fuselage 39 m, span 36 m: an A320-sized jet).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const ZC = 64, DEG = Math.PI / 180, UNIT = 0.16;
  const FX = G.frameOf([0, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const BODY = [[-124, 0.6], [-120, 3, 1], [-104, 7, 1], [-76, 11.6, 1], [-54, 13], [84, 13], [102, 12, 1], [113, 9, 1], [120, 4.6, 1], [123, 0.6]];
  const rOf = (x) => { for (let i = 1; i < BODY.length; i++) if (x <= BODY[i][0]) { const [a, ra] = BODY[i - 1], [b, rb] = BODY[i]; return ra + (rb - ra) * (x - a) / (b - a); } return 0.6; };
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const add = (a, b) => a.map((v, i) => v + b[i]), sub = (a, b) => a.map((v, i) => v - b[i]), mul = (a, k) => a.map((v) => v * k);
  const lerp = (a, b, t) => a + (b - a) * t;
  // rotate p about the axis through h along unit u by angle a (Rodrigues)
  const turn = (p, h, u, a) => {
    const v = sub(p, h), c = Math.cos(a), s = Math.sin(a), d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const x = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return add(h, v.map((vi, i) => vi * c + x[i] * s + u[i] * d * (1 - c)));
  };
  const unit = (v) => mul(v, 1 / Math.hypot(...v));
  // A thin slab from four mid-plane corners, each with its own thickness along n: wings, tails, control surfaces.
  const QF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const slabV = (c, th, n) => [...c.map((p, i) => add(p, mul(n, -th[i] / 2))), ...c.map((p, i) => add(p, mul(n, th[i] / 2)))];
  const poly = (P, V, tone = "hi") => ISO.poly(V, QF, P, tone);

  // Surfaces described for the near (left, +y) side; the far side is the mirror (y → −y).
  const WING = { le: [[22, 13], [-46, 120]], te: [[-26, 13], [-62, 120]], z0: ZC - 8, dz: 0.07, th: [4, 1.5] };
  const STAB = { le: [[-92, 7], [-117, 44]], te: [[-114, 7], [-127, 44]], z0: ZC + 3, dz: 0.05, th: [2.6, 1.1] };
  const at = (Wn, f, y) => {
    const t = (y - Wn.le[0][1]) / (Wn.le[1][1] - Wn.le[0][1]);
    const xl = lerp(Wn.le[0][0], Wn.le[1][0], t), xt = lerp(Wn.te[0][0], Wn.te[1][0], t);
    return [lerp(xl, xt, f), y, Wn.z0 + (y - Wn.le[0][1]) * Wn.dz];
  };
  const thick = (Wn, f, y) => lerp(Wn.th[0], Wn.th[1], (y - Wn.le[0][1]) / (Wn.le[1][1] - Wn.le[0][1])) * (1 - 0.65 * f);
  const UP = [0, 0, 1];
  const mirror = (V, side) => (side > 0 ? V : V.map(([x, y, z]) => [x, -y, z]));
  // the fixed part of a planform between chord fractions f0..f1 and spans y0..y1
  const panel = (Wn, f0, f1, y0, y1) => slabV([at(Wn, f0, y0), at(Wn, f1, y0), at(Wn, f1, y1), at(Wn, f0, y1)], [thick(Wn, f0, y0), thick(Wn, f1, y0), thick(Wn, f1, y1), thick(Wn, f0, y1)], UP);
  // a hinged surface behind chord fraction fh, turned by a (positive = trailing edge down), shifted back by `back`
  const flapV = (Wn, fh, y0, y1, a, back = 0) => {
    const V = panel(Wn, fh, 1, y0, y1), h = at(Wn, fh, y0), u = unit(sub(at(Wn, fh, y1), h));
    return V.map((p) => add(turn(p, h, u, -a), [-back, 0, -back * 0.35]));
  };
  // the fin in x–z, thin along y; the rudder behind its hinge line turns about that line
  const FIN = { root: [[-84, ZC + 8], [-119, ZC + 3]], tip: [[-111, ZC + 54], [-126, ZC + 54]] };
  const finAt = (f, top) => { const [l, t] = top ? FIN.tip : FIN.root; return [lerp(l[0], t[0], f), 0, lerp(l[1], t[1], f)]; };
  const finV = (f0, f1) => slabV([finAt(f0, 0), finAt(f1, 0), finAt(f1, 1), finAt(f0, 1)], [2.8 * (1 - 0.6 * f0), 2.8 * (1 - 0.6 * f1), 1.6 * (1 - 0.6 * f1), 1.6 * (1 - 0.6 * f0)], [0, 1, 0]);
  const rudderV = (a) => { const h = finAt(0.68, 0), u = unit(sub(finAt(0.68, 1), h)); return finV(0.68, 1).map((p) => turn(p, h, u, a)); };

  function engineSvg(P, side) {
    const y = 46 * side, wz = at(WING, 0, 46)[2], cz = wz - 12, F = G.frameOf([0, y, cz], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [];
    // the nacelle hangs from this pylon (an ISO.poly the audit can't see, so it reports the nacelle parts loose)
    out.push(poly(P, slabV([[-8, y, cz + 5], [16, y, cz + 5], [12, y, wz - 1], [-6, y, wz - 1]], [2.4, 2.4, 2.4, 2.4], [0, 1, 0]), "mid"));   // pylon
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[-24, 1.2], [-17, 4.4, 1], [-12, 5.6]], F, P), { tone: "mid" })));                      // exhaust cone
    out.push(S(G.solidOf([[-12, 5.8], [-8, 7, 1], [4, 7.6, 1], [20, 7.6], [26, 7.1, 1], [28, 6.6]], F, P), { tone: "hi", inner: K.lineSvg(G.arcOf(F, 4, 7.62, P), { tone: "faint" }) }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(27.9, 28.1, 5.6, F, P), { tone: "mid" })));                                             // the fan behind the lip
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[28, 2.2], [30, 1.4, 1], [31.4, 0.3]], F, P), { tone: "mid" })));                      // spinner
    return named("engine", out.join(""));
  }
  function bodySvg(P) {
    const out = [S(G.solidOf(BODY, FX, P), { tone: "hi" })];
    const k = K.cameraOf(P).k, side = (s, a, z = 0) => K.iso(add(G.pointOf(FX, s, rOf(s) + 0.05, a), [0, 0, z]), P);
    // the cheat line, windows, door, windscreen, belly fairing seam, tail cone APU exhaust
    out.push(`<path d="${K.pathOf(Array.from({ length: 41 }, (_, i) => side(-96 + i * 5, -0.12)))}" fill="none" stroke="#2f6fb5" stroke-width="${(2.2 * k).toFixed(2)}"/>`);
    out.push(D(Array.from({ length: 26 }, (_, i) => side(-78 + i * 6, 0.3)).filter((_, i) => i !== 17), { size: (0.9 * k).toFixed(2), tone: "hi" }));
    const door = [[88, -0.25], [94, -0.25], [94, 0.62], [88, 0.62]].map(([s, a]) => side(s, a));
    out.push(`<path d="${K.pathOf(door, true)}" fill="none" stroke="#3c3f45" stroke-width="0.8" stroke-linejoin="round"/>`);
    out.push(`<path d="${K.pathOf([side(104, 0.42), side(110, 0.5), side(114, 0.75), side(108, 0.85), side(102, 0.75)], true)}" fill="#3e4a5a" stroke="#1d242c" stroke-width="0.8"/>`);
    return named("body", out.join(""));
  }
  function standSvg(P) {
    const BASE = { x: -50, y: -34, w: 100, d: 68, r: 6 };
    return ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 6, feet: 3 })) + ISO.plate(P, { x: -24, y: 18, w: 48, d: 10, r: 1.2 }) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(-6, 0, 7, 0, 3, P, 32), { tone: "mid" }) + S(K.cylinder(-6, 0, 2.4, 3, ZC - 17.4, P, 20), { tone: "hi" }) +
        ISO.wbox(P, [-12, 0], [-5, 5], [ZC - 14.4, ZC - 13], "mid"));            // the cradle under the belly
  }

  ISO.add({
    name: "airplane", title: "Airliner controls", compare: "airplane 480 280 500",
    about: "A twin-jet airliner model whose control surfaces move on their hinges: elevators pitch the nose, ailerons roll it, the rudder yaws it, flaps add lift for landing.",
    line: "airplane cx cy length rot=deg pitch=-1..1 roll=-1..1 yaw=-1..1 flaps=0..1 lab=1 lit=wing|aileron|flap|elevator|rudder|engine",
    demo: { line: "airplane 480 280 500", script: [
      { set: { pitch: 1, lit: "elevator" }, hold: "settle" }, { set: { pitch: 0, roll: 1, lit: "aileron" }, hold: "settle" },
      { set: { roll: 0, yaw: 1, lit: "rudder" }, hold: "settle" }, { set: { yaw: 0, flaps: 1, lit: "flap" }, hold: "settle" }, { set: { flaps: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.82;
      const { P, g } = ISO.frame([[123, 0, ZC], [-127, 0, ZC + 54], [-62, 122, ZC], [-62, -122, ZC], [-46, 122, ZC], [24, -14, ZC], [-50, 34, 0], [50, -34, -9]], cx, cy, W, H, { azimuth: 62, elevation: 24, pad: 10 }, parent);
      if (o.rot) g.setAttribute("transform", `${g.getAttribute("transform")} rotate(${+o.rot || 0} ${W / 2} ${H / 2})`);
      const sv = (V, tone) => poly(P, V, tone);
      const wingFixed = (side) => named("wing", sv(mirror(panel(WING, 0, 0.74, 13, 120), side)) + sv(mirror(panel(WING, 0.74, 1, 64, 80), side)) + sv(mirror(panel(WING, 0.74, 1, 114, 120), side)));
      const stabFixed = (side) => named("elevator", sv(mirror(panel(STAB, 0, 0.7, 7, 44), side)));
      // navigation lights: red on the left wing tip, green on the right
      const tipLight = (side) => { const [x, y] = K.iso(mirror([at(WING, 0.2, 120.4)], side)[0], P); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 * K.cameraOf(P).k).toFixed(2)}" fill="${side > 0 ? "#d6362b" : "#2e9e4a"}" stroke="#3c3f45" stroke-width="0.6"/>`; };
      const slots = (side) => ["flap", "aileron", "elevatorM"].map((n) => `<g data-name="${n === "elevatorM" ? "elevator" : n}"><g data-part="${n}${side > 0 ? "N" : "F"}"></g></g>`);
      const [fFlap, fAil, fElev] = slots(-1), [nFlap, nAil, nElev] = slots(1);
      const words = !lab ? "" : [
        ISO.word(K.iso(at(WING, 1, 96), P), "aileron", "#555", { size: 14, dy: 24, anchor: "end" }),
        ISO.word(K.iso(at(WING, 1, 38), P), "flap", "#555", { size: 14, dy: 22 }),
        ISO.word(K.iso(finAt(1, 1), P), "rudder", "#555", { size: 14, anchor: "end", dy: -6 }),
        ISO.word(K.iso(at(STAB, 1, 44), P), "elevator", "#555", { size: 14, anchor: "end", dy: 16 }),
      ].join("");
      // painter's order: stand, far tail and wing, body, fin, near tail and wing (viewer on the left, +y, side)
      g.innerHTML = `<g>${standSvg(P)}</g>` + stabFixed(-1) + fElev + engineSvg(P, -1) + wingFixed(-1) + fFlap + fAil + tipLight(-1) +
        bodySvg(P) + named("fin", sv(finV(0, 0.68))) + `<g data-name="rudder"><g data-part="rudder"></g></g>` + stabFixed(1) + nElev +
        engineSvg(P, 1) + wingFixed(1) + nFlap + nAil + tipLight(1) + `<g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { pitch: 0, roll: 0, yaw: 0, flaps: 0 }, want = { pitch: 0, roll: 0, yaw: 0, flaps: 0 };
      const take = (p) => { for (const k of ["pitch", "roll", "yaw"]) if (p[k] !== undefined) want[k] = ISO.clamp(+p[k] || 0, -1, 1); if (p.flaps !== undefined) want.flaps = ISO.clamp(+p.flaps || 0, 0, 1); };
      take(o); Object.assign(s, want);
      let lit = o.lit || "";
      const q = (v) => Math.round(v * 100);
      const draw = () => {
        const fl = s.flaps * 35 * DEG, back = s.flaps * 3;
        for (const side of [1, -1]) {
          const n = side > 0 ? "N" : "F";
          w.rebuild(el[`flap${n}`], String(q(s.flaps)), () => sv(mirror(flapV(WING, 0.74, 15, 63, fl, back), side)));
          // roll right: left (near) aileron down, right (far) aileron up
          const ail = s.roll * 20 * DEG * side;
          w.rebuild(el[`aileron${n}`], String(q(s.roll)), () => sv(mirror(flapV(WING, 0.74, 81, 113, ail), side)));
          w.rebuild(el[`elevatorM${n}`], String(q(s.pitch)), () => sv(mirror(flapV(STAB, 0.7, 8, 43, -s.pitch * 20 * DEG), side)));
        }
        // rudder left (yaw > 0, nose left) swings the trailing edge to +y
        w.rebuild(el.rudder, String(q(s.yaw)), () => sv(rudderV(-s.yaw * 25 * DEG)));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { take(p); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        let moving = false;
        for (const k in s) { s[k] = ISO.follow(s[k], want[k], dt, 0.35, ISO.still()); if (s[k] !== want[k]) moving = true; }
        draw();
        return moving;
      };
      g.readout = () => {
        const f = (v, a, pos, neg) => (Math.abs(v) < 0.01 ? "neutral" : `${Math.abs(v * a).toFixed(0)}° ${v > 0 ? pos : neg}`);
        return `elevators ${f(s.pitch, 20, "up → nose pitches up", "down → nose pitches down")} · ailerons ${f(s.roll, 20, "left down / right up → rolls right", "left up / right down → rolls left")} · rudder ${f(s.yaw, 25, "left → nose yaws left", "right → nose yaws right")} · flaps ${(s.flaps * 35).toFixed(0)}° · fuselage ${(247 * UNIT).toFixed(0)} m, span ${(240 * UNIT).toFixed(0)} m`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
