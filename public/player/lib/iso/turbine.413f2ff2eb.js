// "turbine cx cy height spin=1 wind=0-30 lab=1 lit=blades|hub|shaft|gearbox|brake|generator|tower" — a wind turbine.
// A three-blade 2 MW turbine on a tapered steel tower (door at its foot, a concrete foundation). The nacelle's cover
// is cut away to show the drive train: the hub and its spinner on the slow main shaft, the main bearing, the gearbox
// (about 1 : 100), the brake disc on the fast shaft, the coupling and the generator, with the control cabinet behind
// it, all on a bedplate that turns on the yaw ring to face the wind, and a wind vane on the roof rail. The wind turns
// the blades at 10–18 rpm; the gearbox spins the generator near 1500 rpm. Power grows with the cube of the wind
// speed from 3 m/s to the rated 2 MW at 12 m/s; above 25 m/s it brakes to a stop. spin=0 holds the rotor still.
// set({ wind, spin, lit }). World units: 1 = 1 m (the tower is drawn shorter and the nacelle larger than life).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // The nacelle, hub and blades are drawn with a second projection NS times larger about the tower top (orthographic, so
  // that is the same as building them NS times bigger), so the drive train reads; the tower keeps the first.
  const TOP = 50, AXZ = TOP + 3.6, HUBX = -9.2, NS = 1.75, RW = 32, R = RW / NS;
  const big = (v) => [v[0] * NS, v[1] * NS, TOP + (v[2] - TOP) * NS];
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const WHITE = ISO.tint("#f7f8f9", ["#c3c7cc", "#cfd2d6", "#dadde0", "#e6e8ea"], "#5a5f66");
  const rpmOf = (v) => (v < 3 || v > 25 ? 0 : Math.min(17.8, (7 * v * 60) / (2 * Math.PI * 45)));
  const kwOf = (v) => (v < 3 || v > 25 ? 0 : v >= 12 ? 2000 : (2000 * (v ** 3 - 27)) / (1728 - 27));
  // one blade in the rotor plane (x along the blade, y across it): root cylinder, the widest chord near the root,
  // a straight trailing edge, tapering to a narrow tip
  const BLADE = (() => { const lead = [], trail = []; for (let i = 0; i <= 14; i++) { const r = 1.8 + ((R - 1.8) * i) / 14, f = (r - 1.8) / (R - 1.8), c = i === 0 ? 1 : 0.55 + 2.4 * Math.exp(-f * 3.2) * Math.min(1, f * 6 + 0.35); lead.push([r, c * 0.62]); trail.push([r, -c * 0.38]); } return [...lead, ...trail.reverse()]; })();
  const bladePath = (a) => { const c = Math.cos(a), s = Math.sin(a); return "M" + BLADE.map(([x, y]) => `${(x * c - y * s).toFixed(2)} ${(x * s + y * c).toFixed(2)}`).join("L") + "Z"; };
  const edgePath = (a) => { const c = Math.cos(a), s = Math.sin(a); return "M" + BLADE.slice(0, 15).map(([x, y]) => `${(x * c - (y * 0.55) * s).toFixed(2)} ${(x * s + y * 0.55 * c).toFixed(2)}`).join("L"); };

  function towerSvg(P) {
    const out = [ISO.tinted(ISO.tint("#e3ead8", ["#aab597", "#b7c1a5", "#c4cdb4", "#d1d9c3"], "#56604a"), S(K.slabOf({ x: -12, y: -12, w: 24, d: 24, r: 2 }, -1.2, 1.2, P, 4), { tone: "lo", halo: true }))];
    out.push(ISO.tinted(ISO.T.road, S(K.cylinder(0, 0, 6, 0, 0.9, P, 40), { tone: "lo" })));
    out.push(`<g data-name="tower">${ISO.tinted(WHITE, S(G.lathe([[0.9, 0], [0.9, 2.5], [TOP, 1.45], [TOP, 0]], zAx([0, 0, 0]), P, { steps: 48 }), { tone: "mid", inner: `<path d="${G.arcOf(zAx([0, 0, 0]), 16, 2.5 - (1.05 * 13.5) / (TOP - 2.5), P) + G.arcOf(zAx([0, 0, 0]), 30, 2.5 - (1.05 * 27.5) / (TOP - 2.5), P)}" fill="none" stroke="#b8bcc2" stroke-width=".6"/>` }))}</g>`);
    // the door at the tower's foot, up two steps
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [-0.8, 0.8], [2.3, 3.1], [0.9, 1.3], "mid")));
    out.push(`<path d="${K.pathOf([[-0.55, 1.3], [0.55, 1.3], [0.55, 3.4], [-0.55, 3.4]].map(([x, z]) => K.iso([x, Math.sqrt((2.5 - 0.02 * z) ** 2 - x * x) + 0.02, z], P)), true)}" fill="#c3c7cc" stroke="#5a5f66" stroke-width=".6"/>`);
    // the yaw ring on the tower top
    return out.join("");
  }
  // the nacelle with its cover and near side cut away: bedplate, far wall, rear wall, the drive train on the bedplate
  function nacelleSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, S(G.disc(TOP, TOP + 0.5, 1.9, zAx([0, 0, 0]), P, { steps: 40 }), { tone: "mid" }))], Z0 = TOP + 0.5, Z1 = Z0 + 6, wall = (x, y, z, t = WHITE) => ISO.tinted(t, ISO.wbox(P, x, y, z, "mid"));
    out.push(wall([-6.4, 8.4], [-2.8, 2.8], [Z0, Z0 + 1], ISO.T.steel));
    out.push(wall([-6.4, 8.4], [-2.8, -2.55], [Z0 + 1, Z1]), wall([8.15, 8.4], [-2.55, 2.8], [Z0 + 1, Z1]));
    // the roof rail along the far wall, the wind vane's mast on it
    out.push(wall([-6.4, 8.4], [-2.8, -2.2], [Z1, Z1 + 0.25]));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(6.6, -2.5, 0.08, Z1 + 0.25, 2.2, P, 8), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [6.2, 7.6], [-2.52, -2.48], [Z1 + 2.2, Z1 + 2.8], "hi")));
    // control cabinet against the rear wall
    out.push(`<g data-name="cabinet">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [7.2, 8.15], [-2.2, 0.6], [Z0 + 1, Z0 + 4.4], "mid"))}</g>`);
    // generator: a finned drum on two feet, its shaft toward the gearbox
    const gen = xAx([3.9, 0, AXZ]);
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [4.2, 6.6], [-1, 1], [Z0 + 1, AXZ - 0.9], "mid")));
    out.push(`<g data-name="generator">${ISO.tinted(ISO.T.blue, S(G.lathe([[0, 0], [0, 1.0], [0.3, 1.25], [2.9, 1.25], [3.2, 1.0], [3.2, 0]], gen, P, { steps: 40 }), { tone: "hi", inner: `<path d="${G.ribsOf(gen, 0.4, 2.8, 1.26, 22, P) || ""}" fill="none" stroke="#5b84b8" stroke-width=".5"/>` }))}</g>`);
    // fast shaft, coupling, the brake disc and its caliper
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(2.5, 3.9, 0.2, xAx([0, 0, AXZ]), P, { steps: 16 }), { tone: "mid" }) + S(G.disc(3.4, 3.8, 0.42, xAx([0, 0, AXZ]), P, { steps: 20 }), { tone: "mid" })));
    out.push(`<g data-name="brake">${ISO.tinted(ISO.T.steel, S(G.disc(2.85, 3.0, 0.95, xAx([0, 0, AXZ]), P, { steps: 32 }), { tone: "hi" }))}${ISO.tinted(ISO.T.red, ISO.wbox(P, [2.7, 3.15], [-0.35, 0.35], [AXZ + 0.62, AXZ + 1.15], "mid"))}</g>`);
    // gearbox: a ribbed casing on the bedplate with torque arms
    out.push(`<g data-name="gearbox">${ISO.tinted(ISO.T.steel, ISO.wbox(P, [-0.6, 2.5], [-1.5, 1.5], [Z0 + 1, AXZ + 1.3], "mid"))}${ISO.tinted(ISO.T.steel, S(G.disc(-0.9, -0.6, 1.25, xAx([0, 0, AXZ]), P, { steps: 32 }), { tone: "mid" }))}${ISO.tinted(ISO.T.steel, ISO.wbox(P, [0.2, 1.4], [-2.1, 2.1], [Z0 + 1, Z0 + 1.6], "mid"))}</g>`);
    // main shaft and its bearing block
    out.push(`<g data-name="shaft">${ISO.tinted(ISO.T.steel, S(G.disc(-9.05, -0.9, 0.55, xAx([0, 0, AXZ]), P, { steps: 24 }), { tone: "hi" }))}</g>`);
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-4.6, -3.4], [-1.1, 1.1], [Z0 + 1, AXZ - 0.4], "mid")) + ISO.tinted(ISO.T.steel, S(G.disc(-4.6, -3.4, 0.95, xAx([0, 0, AXZ]), P, { steps: 28 }), { tone: "mid" })));
    return out.join("");
  }
  // marks on the turning shafts: a stripe on the main shaft, one on the coupling (shown 6× the rotor's speed)
  function marksSvg(P, a) {
    const mk = (x0, x1, r, ang, w) => { const p = (x) => K.iso([x, r * Math.cos(ang), AXZ + r * Math.sin(ang)], P); return `<path d="${K.pathOf([p(x0), p(x1)])}" stroke="#2a2d31" stroke-width="${w}" stroke-linecap="round"/>`; };
    const vis = (ang) => K.depthOf([0, Math.cos(ang), Math.sin(ang)], P) - K.depthOf([0, 0, 0], P) > 0.05;
    const out = [];
    for (let k = 0; k < 3; k++) { const ang = a + (k * 2 * Math.PI) / 3; if (vis(ang)) out.push(mk(-3.2, -1.2, 0.57, ang, 0.8)); }
    for (let k = 0; k < 2; k++) { const ang = a * 6 + k * Math.PI; if (vis(ang)) out.push(mk(3.42, 3.78, 0.44, ang, 0.7)); }
    return out.join("");
  }

  ISO.add({
    name: "turbine", title: "Wind turbine", compare: "turbine 480 270 440 spin=1",
    about: "A wind turbine with its nacelle cut open: the blades turn a slow shaft, the gearbox speeds it up about 100 times for the generator, and power climbs with the cube of the wind speed.",
    line: "turbine cx cy height spin=1 wind=0-30 lab=1 lit=blades|hub|shaft|gearbox|brake|generator|tower",
    demo: { line: "turbine 480 270 440 spin=1 wind=5", script: [{ set: {}, hold: 3 }, { set: { wind: 12, lit: "gearbox" }, hold: 4 }, { set: { wind: 27, lit: "brake" }, hold: 5 }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 1.02;
      const { P, g } = ISO.frame([[-12, -12, -1.2], [12, 12, -1.2], [12, -12, 0], [-12, 12, 0], ...[[HUBX, -R, AXZ], [HUBX, R, AXZ], [HUBX, 0, AXZ + R], [HUBX, 0, AXZ - R], [8.4, 2.8, TOP + 9]].map(big)], cx, cy, W, H, { azimuth: -50, elevation: 16 }, parent);
      const T0 = K.iso([0, 0, TOP], P), P2 = { ...P, scale: P.scale * NS, origin: [T0[0] - NS * (T0[0] - P.origin[0]), T0[1] - NS * (T0[1] - P.origin[1])] };
      // the rotor plane (y across, z up) as an SVG matrix: blades are flat artwork in it, turned by rotate()
      const o0 = K.iso([HUBX, 0, AXZ], P2), ay = K.iso([HUBX, 1, AXZ], P2), az = K.iso([HUBX, 0, AXZ + 1], P2);
      const M = `matrix(${(ay[0] - o0[0]).toFixed(4)} ${(ay[1] - o0[1]).toFixed(4)} ${(az[0] - o0[0]).toFixed(4)} ${(az[1] - o0[1]).toFixed(4)} ${o0[0].toFixed(2)} ${o0[1].toFixed(2)})`;
      const blades = [0, 1, 2].map((i) => (i * 2 * Math.PI) / 3);
      const hub = xAx([HUBX + 0.2, 0, AXZ]);
      g.innerHTML = `<g>${towerSvg(P)}</g><g>${nacelleSvg(P2)}</g><g data-part="marks"></g>
        <g transform="${M}"><g data-name="blades" data-part="rotor"><path d="${blades.map(bladePath).join("")}" fill="#f4f5f6" stroke="#5a5f66" stroke-width="0.09" stroke-linejoin="round"/><path d="${blades.map(edgePath).join("")}" fill="none" stroke="#c3c7cc" stroke-width="0.06"/></g></g>
        <g data-name="hub">${ISO.tinted(WHITE, S(G.lathe([[-0.2, 0], [-0.2, 2.2], [-1.2, 2.1, 1], [-2.6, 1.5, 1], [-3.4, 0.6, 1], [-3.6, 0]], hub, P2, { steps: 40 }), { tone: "hi" }))}</g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { rotor: q("rotor"), marks: q("marks"), words: q("words") }, w = ISO.writer();
      const wind0 = ISO.clamp(ISO.num(o, "wind", 9), 0, 30);
      const s = { wind: wind0, spin: o.spin !== "0", rpm: o.spin !== "0" ? rpmOf(wind0) : 0, a: 0.3 };
      let lit = o.lit || "";
      const draw = () => {
        w.attr(el.rotor, "transform", `rotate(${((s.a * 180) / Math.PI).toFixed(2)})`);
        w.rebuild(el.marks, (Math.round(s.a * 60) / 60).toFixed(3), () => marksSvg(P2, s.a));
        const stop = s.wind > 25, v = Math.round(s.wind);
        w.rebuild(el.words, lab ? `${v} ${stop}` : "", () => !lab ? "" : [
          ISO.word(K.iso([1, -2.8, TOP + 7], P2), "gearbox", "#444", { size: 13, anchor: "start", dy: -4 }),
          ISO.word(K.iso([5.2, -2.8, TOP + 7], P2), "generator", "#1f4f8f", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso([-4, 2.8, TOP + 0.5], P2), "main shaft", "#444", { size: 13, anchor: "start", dy: 16 }),
          ISO.word(K.iso([2.9, 2.8, TOP + 0.5], P2), stop ? "brake on" : "brake disc", stop ? "#a3271b" : "#444", { size: 13, anchor: "end", dy: 16 }),
          ISO.word(K.iso([0, 2.5, 12], P), "tower", "#555", { size: 13, anchor: "start" }).replace('x="', 'dx="10" x="'),
          ISO.word(K.iso([-12, 12, 0], P), `wind ${v} m/s`, "#1f4f8f", { size: 14, anchor: "start", dy: 22 })].join(""));
        w.light(["blades", "hub", "shaft", "gearbox", "brake", "generator", "tower"].map(q).filter(Boolean), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.wind !== undefined) s.wind = ISO.clamp(+p.wind, 0, 30);
        if (p.spin !== undefined) s.spin = !!+p.spin;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the rotor's inertia eases it toward the speed the wind gives it (or to a stop on the brake)
      g.update = (dt) => {
        const target = s.spin ? rpmOf(s.wind) : 0, calm = ISO.still();
        s.rpm = ISO.follow(s.rpm, target, dt, 1.2, calm); if (Math.abs(s.rpm - target) < 0.02) s.rpm = target;
        if (!calm) s.a = (s.a + ((s.rpm * 2 * Math.PI) / 60) * dt) % (2 * Math.PI);
        draw();
        return s.rpm > 0 || s.rpm !== target;
      };
      g.readout = () => {
        if (s.wind > 25) return `wind ${Math.round(s.wind)} m/s · too strong: blades turned edge-on and the brake stops the rotor · ${s.rpm.toFixed(1)} rpm`;
        if (s.wind < 3) return `wind ${s.wind.toFixed(0)} m/s · below the 3 m/s cut-in: no power`;
        return `wind ${Math.round(s.wind)} m/s · rotor ${s.rpm.toFixed(1)} rpm · generator ≈ ${Math.round(s.rpm * 100)} rpm (gearbox 1 : 100) · ${Math.round(kwOf(s.wind))} kW of 2000 kW (grows as wind³ up to 12 m/s)`;
      };
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
