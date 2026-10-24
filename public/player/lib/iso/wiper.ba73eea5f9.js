// "wiper cx cy width sweep=0-1 lift=0-1 lab=1" — a windscreen wiper on the lower corner of a car's windscreen.
// The glass is raked back 30° behind the cowl panel; the arm comes off its pivot shaft (nut under a flip cover), the
// spring pulls the arm down onto the glass through the hinge, and the blade rides on the arm's hook with a rubber edge
// on the glass and a release tab on its adapter. set({ sweep }) swings the arm across the glass (rain drops in the
// swept band are wiped off); set({ lift }) tips the arm up off the glass on its hinge, where the spring holds it.
// Local helpers: armSvg (arm and blade in any pose), springPath (a coil between two points in any direction).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. A 50 cm arm, a 55 cm blade centred on its hook, a 95° sweep from park.
  const RAKE = (30 * Math.PI) / 180, O = [0, 22, 10];
  const E1 = [1, 0, 0], E2 = [0, -Math.cos(RAKE), Math.sin(RAKE)], N = G.unit3(G.cross3(E2, E1));
  const onGlass = (u, v, h = 0) => G.add3(O, G.add3(G.mul3(E1, u), G.add3(G.mul3(E2, v), G.mul3(N, h))));
  const GLASS = { u: [-44, 64], v: [0, 82] }, PIV = [44, -4], ARM = 50, BLADE = 55, SWEEP = 95, PARK = 7, HINGE = 6, LIFT = 68;
  const RUBBER = ISO.T.rubber, PLASTIC = ISO.T.plastic, RED = ISO.tint("#e3685c", ["#a3271b", "#b8342a", "#cc4639", "#dc5649"], "#5e140d");
  // Rain on the glass: fixed drops, wiped where the blade has passed.
  const DROPS = [];
  for (let i = 0; i < 200; i++) {
    const r = (Math.sin(i * 12.9898) * 43758.5453) % 1, q = (Math.sin(i * 78.233) * 12345.678) % 1;
    DROPS.push([GLASS.u[0] + 4 + Math.abs(r) * (GLASS.u[1] - GLASS.u[0] - 8), 5 + Math.abs(q) * (GLASS.v[1] - 10), 0.35 + ((i * 7) % 5) * 0.12]);
  }
  const swept = (u, v, upTo) => {
    const du = u - PIV[0], dv = v - PIV[1], r = Math.hypot(du, dv), a = (Math.atan2(dv, -du) * 180) / Math.PI;
    return r > ARM - BLADE / 2 - 1 && r < ARM + BLADE / 2 + 1 && a > PARK - 3 && a < upTo + 2;
  };

  // A coil between two points, as one stroked path with its ends dotted onto the anchors.
  function springPath(P, A, B, r, turns) {
    const ax = G.sub3(B, A), F = G.frameAlong(A, G.unit3(ax)), len = G.len3(ax), pts = [];
    for (let i = 0; i <= turns * 14; i++) { const t = i / (turns * 14); pts.push(K.iso(G.pointOf(F, t * len, r, t * turns * Math.PI * 2), P)); }
    return `<path d="${K.pathOf(pts)}" fill="none" stroke="#4b5057" stroke-width="0.8"/>` + D([K.iso(A, P), K.iso(B, P)], { size: 0.7, tone: "lo" });
  }
  // The arm and blade at sweep angle th (degrees from pointing along −u) and lift angle ph (radians).
  const b0Of = () => ARM - BLADE / 2, headCache = new WeakMap();
  function armSvg(P, th, ph, lab) {
    const a = (th * Math.PI) / 180, d = [-Math.cos(a), Math.sin(a)], q = [Math.sin(a), Math.cos(a)];
    const base = (x, y, z) => onGlass(PIV[0] + x * d[0] + y * q[0], PIV[1] + x * d[1] + y * q[1], z);
    const hz = 2.6, lifted = (x, y, z) => base(HINGE + (x - HINGE) * Math.cos(ph) - (z - hz) * Math.sin(ph), y, hz + (x - HINGE) * Math.sin(ph) + (z - hz) * Math.cos(ph));
    const box = (at, x, y, z, tone = "hi") => ISO.box((u, w, v) => at(u, v, w), P, x, z, y, tone);
    const out = [];
    // Its shadow on the glass once it lifts off.
    if (ph > 0.01) out.push(`<path d="${K.pathOf([base(b0Of(), 0, 0), base(ARM + BLADE / 2, 0, 0)].map((p) => K.iso(p, P)))}" stroke="#1d2a36" stroke-opacity="${(0.22 * Math.min(1, ph * 3)).toFixed(2)}" stroke-width="${(3 * G.scaleOf(P)).toFixed(1)}" stroke-linecap="round"/>`);
    // Blade: rubber edge on the glass, the beam over it with end caps, the adapter with its release tab.
    const b0 = ARM - BLADE / 2, b1 = ARM + BLADE / 2;
    out.push(ISO.tinted(RUBBER, box(lifted, [b0 + 0.6, b1 - 0.6], [-0.45, 0.45], [0, 0.9])));
    out.push(ISO.tinted(PLASTIC, box(lifted, [b0, b1], [-1.3, 1.3], [0.9, 2.0], "mid")));
    for (const x of [[b0, b0 + 2.4], [b1 - 2.4, b1]]) out.push(ISO.tinted(PLASTIC, box(lifted, x, [-1.5, 1.5], [0.9, 2.5], "mid")));
    out.push(ISO.tinted(PLASTIC, box(lifted, [ARM - 3.4, ARM + 3.4], [-1.9, 1.9], [2.0, 3.6], "mid")));
    out.push(`<g data-name="tab">${ISO.tinted(RED, box(lifted, [ARM - 0.6, ARM + 2.4], [-1.2, 1.2], [3.6, 4.2], "hi"))}</g>`);
    // Head on the pivot shaft, the flip cover over the nut, the hinge pin.
    // The round boss under the head looks the same at every sweep angle: built once.
    out.push(headCache.get(P) || headCache.set(P, ISO.tinted(PLASTIC, S(G.disc(-0.6, 0.6, 4.4, G.frameAlong(base(0, 0, 0), N), P), { tone: "mid" }))).get(P));
    out.push(ISO.tinted(PLASTIC, box(base, [-4.2, HINGE + 1.4], [-2.6, 2.6], [0.6, 3.8], "mid")));
    out.push(`<g data-name="cover">${ISO.tinted(PLASTIC, box(base, [-3.8, 2.6], [-2.2, 2.2], [3.8, 5.0], "mid"))}</g>`);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-3, 3, 0.7, G.frameAlong(base(HINGE, 0, hz), G.sub3(base(0, 1, 0), base(0, 0, 0))), P, { steps: 12 }), { tone: "hi" })));
    // Arm: a channel from the hinge, then the rod down to the hook over the adapter.
    out.push(ISO.tinted(PLASTIC, box(lifted, [HINGE - 0.4, 24], [-1.8, 1.8], [1.6, 3.6], "mid")));
    out.push(springPath(P, base(-2.4, 0, 4.4), lifted(14, 0, 4.0), 0.75, 9));
    out.push(ISO.tinted(PLASTIC, box(lifted, [24, ARM - 2], [-0.9, 0.9], [2.4, 3.4], "mid")));
    out.push(ISO.tinted(PLASTIC, box(lifted, [ARM - 2.4, ARM + 0.4], [-1.1, 1.1], [3.4, 4.6], "mid")));
    if (lab) {
      out.push(ISO.word(K.iso(base(0, 0, 0), P), "pivot", "#555", { dy: 30, size: 14 }));
      out.push(ISO.word(K.iso(lifted(ARM + 1, 0, 4.2), P), "release tab", "#b8342a", { dy: -12, size: 14 }));
    }
    return out.join("");
  }

  function sceneSvg(P) {
    const out = [], at3 = (p) => K.iso(p, P);
    const glassAt = (u, w, y) => onGlass(u, y, w);
    // Bonnet edge and cowl in front, the glass behind them, A-pillars at its sides with the frit band.
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -60, y: -40, w: 138, d: 96, r: 6 }, 0, 4, P)}"/>`);
    out.push(ISO.tinted(ISO.T.paint, ISO.box((u, w, y) => onGlass(u, y, w), P, [GLASS.u[0] - 12, GLASS.u[0]], [-3, 0], [-2, GLASS.v[1] + 2], "mid")));
    out.push(ISO.tinted(ISO.T.glass, ISO.box(glassAt, P, GLASS.u, [-0.6, 0], GLASS.v, "hi")));
    const frit = [[GLASS.u[0] + 3, 3], [GLASS.u[1] - 3, 3], [GLASS.u[1] - 3, GLASS.v[1] - 3], [GLASS.u[0] + 3, GLASS.v[1] - 3]].map(([u, v]) => at3(onGlass(u, v, 0.02)));
    out.push(`<path d="${K.pathOf(frit, true)}" fill="none" stroke="#2f3a45" stroke-width="2.2" stroke-opacity="0.55"/>`);
    out.push(`<g data-part="drops"></g>`);
    out.push(ISO.tinted(ISO.T.paint, ISO.box((u, w, y) => onGlass(u, y, w), P, [GLASS.u[1], GLASS.u[1] + 12], [-3, 0.8], [-2, GLASS.v[1] + 2], "mid")));
    // Cowl: a plastic panel along the glass foot with a row of vent slots and two clips.
    const cowlAt = (u, w, y) => [u, 22 + y, 10 - 1.6 + w - y * 0.18];
    out.push(ISO.tinted(PLASTIC, ISO.box(cowlAt, P, [-58, 78], [-1.2, 1.4], [0, 14], "mid")));
    const slots = [];
    for (let u = -50; u <= 22; u += 7) slots.push(K.pathOf([[u, 4], [u + 4.6, 4], [u + 4.6, 10.5], [u, 10.5]].map(([a, b]) => at3(cowlAt(a, 1.42, b))), true));
    out.push(`<g style="--anatomy-lo:#7b8088">${L(slots.join(""), { tone: "lo" })}</g>`, D([-54, 74].map((u) => at3(cowlAt(u, 1.42, 7))), { size: 0.8, tone: "lo" }));
    // Bonnet: its back edge over the cowl, with a shut line.
    const hood = { x: -62, y: 37, w: 142, d: 20, r: 2 };
    out.push(ISO.tinted(ISO.T.paint, S(K.slabOf(hood, 5, 4.6, P, 3, 0.6), { tone: "mid", inner: L(K.sideSeam(hood, 7.4, P, 3), { tone: "faint" }) })));
    // The pivot boss on the cowl that the shaft comes out of.
    out.push(ISO.tinted(PLASTIC, S(G.disc(-1.6, 0, 5.6, G.frameAlong(onGlass(PIV[0], PIV[1], 0), N), P), { tone: "mid" })));
    return out.join("");
  }

  ISO.add({
    name: "wiper", title: "Windscreen wiper", compare: "wiper 480 270 420",
    about: "Wiper arm on its pivot with the spring, hinge and nut cover; blade with its rubber edge and release tab; it sweeps the wet glass, then lifts off it.",
    line: "wiper cx cy width sweep=0-1 lift=0-1 lab=1",
    demo: { line: "wiper 480 270 420", script: [{ set: { sweep: 1 }, hold: "settle" }, { set: { sweep: 0 }, hold: "settle" }, { set: { sweep: 0.5 }, hold: "settle" }, { set: { lift: 1 }, hold: "settle" }] },
    make([cx, cy, W = 420], o, t, parent) {
      const lab = o.lab !== "0", Wd = W * 1.6, H = Wd * 0.6;
      const pts = [onGlass(GLASS.u[0] - 12, 0, 0), onGlass(GLASS.u[1] + 12, 0, 0), onGlass(GLASS.u[0] - 12, GLASS.v[1], 0), onGlass(GLASS.u[1] + 12, GLASS.v[1], 0), [-62, 57, 5], [80, 57, 5]];
      const { P, g } = ISO.frame(pts, cx, cy, Wd, H, { azimuth: 36, elevation: 26 }, parent);
      g.innerHTML = sceneSvg(P) + `<g data-part="arm"></g>`;
      const arm = g.querySelector('[data-part="arm"]'), drops = g.querySelector('[data-part="drops"]'), w = ISO.writer();
      const s = { th: PARK + SWEEP * ISO.clamp(ISO.num(o, "sweep", 0), 0, 1), lift: ISO.clamp(ISO.num(o, "lift", 0), 0, 1), max: PARK };
      s.thT = s.th; s.liftT = s.lift; s.max = s.th;
      const dropSvg = () => {
        const d = [], hi = [];
        for (const [u, v, r] of DROPS) {
          if (swept(u, v, s.max)) continue;
          const [x, y] = K.iso(onGlass(u, v, 0.05), P), k = r * G.scaleOf(P);
          d.push(`M${(x - k).toFixed(1)} ${y.toFixed(1)}a${k.toFixed(2)} ${(k * 0.8).toFixed(2)} 0 1 0 ${(2 * k).toFixed(2)} 0a${k.toFixed(2)} ${(k * 0.8).toFixed(2)} 0 1 0 ${(-2 * k).toFixed(2)} 0`);
          hi.push(`M${(x - k * 0.3).toFixed(1)} ${(y - k * 0.25).toFixed(1)}h0.01`);
        }
        return `<path d="${d.join("")}" fill="#d7e9f5" stroke="#6f93ad" stroke-width="0.5"/><path d="${hi.join("")}" stroke="#fff" stroke-width="${(0.5 * G.scaleOf(P)).toFixed(2)}" stroke-linecap="round"/>`;
      };
      const draw = () => {
        s.max = Math.max(s.max, s.th);
        w.rebuild(drops, Math.round(s.max / 3), dropSvg);
        w.rebuild(arm, `${s.th.toFixed(2)} ${s.lift.toFixed(3)}`, () => armSvg(P, s.th, ISO.ease(s.lift) * (LIFT * Math.PI) / 180, lab));
        const lit = s.liftT > 0 ? "tab" : null;
        const parts = [...arm.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
        arm.classList.toggle("tc-lit", !lit && Math.abs(s.th - s.thT) > 0.05);
      };
      g.set = (p) => {
        if (p.sweep !== undefined) s.thT = PARK + SWEEP * ISO.clamp(+p.sweep, 0, 1);
        if (p.lift !== undefined) s.liftT = ISO.clamp(+p.lift, 0, 1);
      };
      g.update = (dt) => {
        // A calm sweep (real low speed is about 45 wipes a minute; this one is slowed to follow by eye).
        if (s.lift > 0.001 || s.liftT > 0) s.th = ISO.follow(s.th, s.thT, dt, 0.4, ISO.still());
        else { const dir = Math.sign(s.thT - s.th), step = dt * (40 + 70 * Math.sin(Math.PI * ISO.clamp((s.th - PARK) / SWEEP, 0.05, 0.95))); s.th = Math.abs(s.thT - s.th) <= step || ISO.still() ? s.thT : s.th + dir * step; }
        s.lift = ISO.still() ? s.liftT : Math.abs(s.liftT - s.lift) < dt / 1.4 ? s.liftT : s.lift + Math.sign(s.liftT - s.lift) * (dt / 1.4);
        draw();
        return s.th !== s.thT || s.lift !== s.liftT;
      };
      g.readout = () => {
        if (s.lift > 0.001) return `arm lifted ${Math.round(ISO.ease(s.lift) * LIFT)}° on its hinge · the spring holds it up · press the red tab to slide the blade off the hook`;
        const deg = Math.round(s.th - PARK);
        if (s.th !== s.thT) return `sweeping · ${deg}° of ${SWEEP}° · low speed is about 45 wipes a minute`;
        return deg ? `stopped at ${deg}° · the swept band is clear of rain` : "parked · the spring presses the blade onto the glass with about 8 N";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
