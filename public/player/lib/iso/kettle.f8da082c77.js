// "kettle cx cy height on=1 lift=0 lab=1" — a jug kettle on its power base.
// A waisted steel jug on a black plastic skirt, its hinged lid with a knob, a hollow spout with a lip, the handle with
// grip ridges, the on/off rocker at the handle's foot that lights amber while it heats, and the water window with its
// level marks and the water inside. The jug sits on a round power base (feet, a 360° centre connector, the cord out of
// the back). Lift it (lift=1) and the connector shows: the element only gets power when the jug sits on it. Switched
// on, a 3 kW element heats 1 L from 20 °C to 100 °C (shown faster), it bubbles and steams from the spout, and the
// thermostat clicks the rocker off. set({ on, lift }). World units: about 3 mm each.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TOP = { x: -72, y: -46, w: 144, d: 92, r: 6 }, ZB = 8.5, LIFT = 24;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const BLACK = ISO.T.plastic, STEEL = ISO.T.steel;
  // the jug's waisted body: radius 25.6 at the skirt and the collar, 22.8 at the waist
  const Z0 = 13, Z1 = 64, rb = (z) => 25.6 - 2.8 * Math.sin((Math.PI * (z - Z0)) / (Z1 - Z0));
  const on = (a, z, off = 0.15) => [(rb(z) + off) * Math.cos(a), (rb(z) + off) * Math.sin(a), z];
  // the water window: a rounded slot round the body at angle AW, in (arc length u, height z)
  const AW = (115 * Math.PI) / 180, RW = 24, WIN = { u: 2.4, z0: 23.5, z1: 56.5 }, FRAME = { u: 3.4, z0: 22, z1: 58 };
  const MIN = 27, MAX = 54, LEVEL = 44;                     // 0.5 L, 1.7 L and the 1 L in it
  // the spout: a tapered hollow tube from the body at z 50, pointing out and up
  const SP = G.frameAlong([rb(50) - 0.9, 0, 50], G.unit3([0.75, 0, 0.66])), SPL = 15, TIP = G.pointOf(SP, SPL, 0, 0);
  const slot = ({ u, z0, z1 }, r = 1.6) => {
    const pts = [], arc = (cu, cz, a0) => { for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * (Math.PI / 2); pts.push([cu + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
    arc(u - r, z1 - r, 0); arc(-u + r, z1 - r, Math.PI / 2); arc(-u + r, z0 + r, Math.PI); arc(u - r, z0 + r, Math.PI * 1.5);
    return pts;
  };
  // keep the part of a 2D outline below (or above) height c (Sutherland–Hodgman against one line)
  const cut = (pts, c, below) => {
    const inside = (p) => (below ? p[1] <= c : p[1] >= c), out = [];
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      if (inside(p)) out.push(p);
      if (inside(p) !== inside(q)) { const t = (c - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, c]); }
    });
    return out;
  };
  const onWin = (P, pts, off = 0.15) => K.pathOf(pts.map(([u, z]) => K.iso(on(AW + u / RW, z, off), P)), true);
  const steam = (P, base, t, k = 1) => Array.from({ length: 3 }, (_, i) => {
    const f = (t * 0.5 + i / 3) % 1, pts = Array.from({ length: 8 }, (_, j) => [base[0] + j * 1.2 + Math.sin(j * 0.9 + i + t * 2) * 3 * k, base[1], base[2] + j * 4 + f * 10]);
    return `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#b7c4cf" stroke-width="${2.2 * (1 - f)}" opacity="${(0.7 * (1 - f)).toFixed(2)}" stroke-linecap="round"/>`;
  }).join("");

  // The worktop, the cord out to the back edge, and the power base on its feet with the centre connector.
  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(TOP, -10, 10, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(TOP, -10, 10, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(TOP, -5, P, 8), { tone: "faint" }) })), L(K.planOutline(K.insetPlan(TOP, 4), 0, P), { tone: "faint" })];
    // the cord: out of its strain relief at the back left of the base, over the worktop and off its back edge
    const ex = (165 * Math.PI) / 180, E = G.frameAlong([30 * Math.cos(ex), 30 * Math.sin(ex), 4.4], [Math.cos(ex), Math.sin(ex), 0]), end = G.pointOf(E, 6, 0, 0);
    const bez = (a, b, c, d, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1, 2].map((j) => v * v * v * a[j] + 3 * v * v * u * b[j] + 3 * v * u * u * c[j] + u * u * u * d[j]); });
    const run = [...bez(end, [end[0] - 6, end[1] + 1.6, 2.6], [end[0] - 12, end[1] + 3, 1.2], [-52, 4, 1.2]), ...bez([-52, 4, 1.2], [-62, 1, 1.2], [-60, -30, 1.2], [-54, TOP.y, 1.2]).slice(1)];
    const k = K.cameraOf(P).k, d = K.pathOf(run.map((p) => K.iso(p, P)));
    out.push(`<path d="${d}" fill="none" stroke="#0d0e10" stroke-width="${(2.4 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#4a4f56" stroke-width="${(1.4 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    // four rubber feet, then the base: a round plastic puck with a rolled edge and a groove round its side
    for (const a of [225, 315, 135, 45].map((d) => (d * Math.PI) / 180)) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(24 * Math.cos(a), 24 * Math.sin(a), 3.2, 0, 1.6, P, 20), { tone: "lo" })));
    out.push(ISO.tinted(BLACK, S(G.lathe([[1.6, 0], [1.6, 30], [5, 30.4, 1], [7.4, 29.4, 1], [ZB, 27.6], [ZB, 0]], zAx([0, 0, 0]), P, { steps: 64 }), { tone: "mid", inner: `<path d="${G.arcOf(zAx([0, 0, 0]), 3.4, 30.2, P)}" fill="none" stroke="#5a5f66" stroke-width=".7"/>` })));
    out.push(ISO.tinted(BLACK, S(G.solidOf([[0, 2.4], [4, 1.7, 1], [6, 1.3]], E, P, { steps: 16 }), { tone: "mid" }) + S(G.disc(-0.6, 0, 3, E, P, { steps: 20 }), { tone: "mid" })));
    // a mug on a cork coaster, waiting for the water
    const MG = [44, 26], mF = zAx([MG[0], MG[1], 0]);
    out.push(ISO.tinted(ISO.T.wood, S(K.cylinder(MG[0], MG[1], 14, 0, 1, P, 40, 0.3), { tone: "lo" })));
    out.push(ISO.prismY(P, [[MG[0] + 9.2, 16.6], [MG[0] + 12.6, 16], [MG[0] + 14.6, 13], [MG[0] + 14.4, 8], [MG[0] + 12, 5], [MG[0] + 9.2, 4.6], [MG[0] + 9.2, 6.6], [MG[0] + 11.4, 7.2], [MG[0] + 12.4, 9], [MG[0] + 12.4, 12.4], [MG[0] + 11.4, 14], [MG[0] + 9.2, 14.4]].map(([x, z]) => [x, z]), MG[1] - 1.3, MG[1] + 1.3, ["#9fb4cc", "#e6eef7"], "#dfe9f4", "#33506f"));
    out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[1, 0], [1, 8.6], [1.8, 9.4, 1], [20, 9.6], [20, 0]], mF, P, { steps: 48 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(mF, 20.02, 8.6, P)}" fill="#c6d5e5" stroke="#33506f" stroke-width=".6"/>`);
    // the 360° connector: a sleeve with three contact rings and a centre pin, so the jug fits any way round
    out.push(ISO.tinted(BLACK, S(G.lathe([[ZB, 5.6], [ZB, 8.4], [ZB + 2.6, 8.4], [ZB + 2.6, 5.6]], zAx([0, 0, 0]), P, { steps: 40 }), { tone: "mid" })));
    for (const [r0, r1] of [[5.9, 6.7], [7.3, 8.1]]) out.push(ISO.tinted(ISO.T.brass, S(G.ringBand(ZB + 2.6, ZB + 2.9, r0, r1, zAx([0, 0, 0]), P, { steps: 40 }), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, S(K.cylinder(0, 0, 2.2, ZB, 3.6, P, 20), { tone: "hi" }) + S(G.solidOf([[0, 2.2], [0.5, 1.9, 1], [0.9, 1.1, 1], [1.05, 0]], zAx([0, 0, ZB + 3.6]), P, { steps: 20 }), { tone: "hi" })));
    return out.join("");
  }
  // The handle (behind the body, so drawn first): a loop from the collar down to the skirt with finger ridges on the
  // grip and the lid-release button on top. It is a concave prism (ISO.prismY), which audit.mjs doesn't record, so
  // the switch housing and the button on it read as "loose" there: they sit on this handle.
  const HANDLE = [[-23.6, 67.4], [-35, 67.6], [-40.5, 65.6], [-43.2, 61], [-44, 54], [-44, 30], [-42.6, 22.4], [-38.4, 17.6], [-32, 15.6], [-23.8, 15.4],
    [-23.6, 23.2], [-34, 23.2], [-36.6, 25.4], [-37.2, 29], [-37.2, 55], [-36.4, 58.4], [-34, 60.6], [-23.6, 60.8]];
  function handleSvg(P) {
    const out = [ISO.prismY(P, HANDLE, -3.4, 3.4, ["#1f2226", "#4a4f56"], "#33373c", "#0d0e10")];
    // finger ridges across the grip's face, edge to edge
    const r = []; for (let z = 31; z <= 53; z += 2.75) r.push(K.pathOf([K.iso([-44, 3.42, z], P), K.iso([-37.2, 3.42, z], P)]));
    out.push(`<path d="${r.join("")}" fill="none" stroke="#5a5f66" stroke-width=".7"/>`);
    out.push(ISO.tinted(BLACK, ISO.wbox(P, [-31.5, -27], [-2, 2], [67.6, 68.8], "hi")));
    out.push(ISO.tinted(BLACK, ISO.wbox(P, [-34, -26.4], [-2.6, 2.6], [23.2, 24.6], "mid")));
    return out.join("");
  }
  // The rocker in its housing on the handle's foot: tipped forward and lit amber while on.
  function switchSvg(P, lit) {
    const th = lit ? -0.2 : 0.2, c = [-30.2, 0, 24.6], at = (u, w, v) => [c[0] + u * Math.cos(th) - v * Math.sin(th), w, c[2] + u * Math.sin(th) + v * Math.cos(th)];
    const lens = lit ? ISO.tint("#ffd28a", ["#f08a1a", "#f39a2e", "#f6ad48", "#f9c066"], "#8a4a08") : ISO.tint("#6b5a44", ["#3a3128", "#43392e", "#4c4134", "#56493a"], "#1a140e");
    const glow = lit ? (() => { const p = K.iso([c[0], 0, c[2] + 2], P); return `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(7 * K.cameraOf(P).k).toFixed(1)}" ry="${(4.5 * K.cameraOf(P).k).toFixed(1)}" fill="#ffb347" opacity=".35"/>`; })() : "";
    return glow + ISO.tinted(lens, ISO.box(at, P, [-2.6, 2.6], [-1.8, 1.8], [-0.3, 1.2], "hi"));
  }
  // Skirt, waisted body, collar, the lid with its hinge and knob.
  function bodySvg(P) {
    const F = zAx([0, 0, 0]), out = [];
    out.push(ISO.tinted(BLACK, S(G.lathe([[ZB, 9], [ZB, 25.4], [ZB + 0.8, 26.4, 1], [Z0, 26.4], [Z0, 9]], F, P, { steps: 64 }), { tone: "mid" })));
    // a bright trim ring where the steel meets the skirt (under the body, so drawn before it)
    out.push(ISO.tinted(STEEL, S(G.ringBand(Z0, Z0 + 1, rb(Z0), 26.3, F, P, { steps: 64 }), { tone: "mid" })));
    // one analytic waisted profile, so the steel shades smoothly with no tone steps
    const prof = [[Z0, 0], [Z0, rb(Z0), 1], [Z1, rb(Z1), 1], [Z1, 0]], drb = (z) => -2.8 * Math.cos((Math.PI * (z - Z0)) / (Z1 - Z0)) * (Math.PI / (Z1 - Z0));
    out.push(ISO.tinted(STEEL, S(G.lathe(prof, F, P, { steps: 72, smooth: { radius: rb, slope: drb } }), { tone: "hi", inner: `<path d="${G.arcOf(F, Z0 + 1.2, rb(Z0 + 1.2), P) + G.arcOf(F, Z1 - 1.2, rb(Z1 - 1.2), P)}" fill="none" stroke="#8d9096" stroke-width=".6"/>` })));
    // and one under the collar
    out.push(ISO.tinted(STEEL, S(G.ringBand(Z1 - 1, Z1, rb(Z1), 26.1, F, P, { steps: 64 }), { tone: "mid" })));
    out.push(ISO.tinted(BLACK, S(G.lathe([[Z1, 0], [Z1, 26], [Z1 + 1.6, 26, 1], [Z1 + 3, 24.8], [Z1 + 3, 0]], F, P, { steps: 64 }), { tone: "mid" })));
    return out.join("");
  }
  function windowSvg(P, level, bubbles, t) {
    const out = [`<path d="${onWin(P, slot(FRAME, 2.2), 0.05)}" fill="#26292e" stroke="#0d0e10" stroke-width=".8"/>`, `<path d="${onWin(P, slot(WIN))}" fill="#e8f2f8" stroke="#3a4a5a" stroke-width=".7"/>`];
    out.push(`<path d="${onWin(P, cut(slot(WIN), level, true), 0.2)}" fill="#a9c8ef" stroke="#5d7f96" stroke-width=".6"/>`);
    if (bubbles > 0.02) for (let i = 0; i < 7; i++) {
      const f = (t * (0.8 + (i % 3) * 0.25) + i / 7) % 1, z = WIN.z0 + 2 + f * (level - WIN.z0 - 3), u = -1.4 + ((i * 0.61) % 1) * 2.8 + Math.sin(t * 3 + i) * 0.3, p = K.iso(on(AW + u / RW, z, 0.25), P);
      out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(0.5 + f * 0.6) * K.cameraOf(P).k * bubbles}" fill="#f4f8fc" stroke="#5d7f96" stroke-width=".5"/>`);
    }
    // level marks rooted on the window's right edge: every 0.25 L, long at MIN and MAX
    const ticks = { minor: [], major: [] };
    for (let z = MIN; z <= MAX + 0.01; z += 3.375) { const big = Math.abs(z - MIN) < 0.1 || Math.abs(z - MAX) < 0.1; (big ? ticks.major : ticks.minor).push(K.pathOf([K.iso(on(AW + WIN.u / RW, z, 0.25), P), K.iso(on(AW + (WIN.u - (big ? 1.8 : 1)) / RW, z, 0.25), P)])); }
    out.push(L(ticks.minor.join(""), { tone: "lo" }), L(ticks.major.join(""), { tone: "mid" }));
    return out.join("");
  }
  function topSvg(P) {
    const F = zAx([0, 0, 0]), out = [];
    // the lid's hinge barrel at the back, lid (its own outline is the seam round it), knob
    out.push(ISO.tinted(BLACK, S(G.disc(-5.6, -3.7, 1.6, yAx([-23.6, 0, Z1 + 4.6]), P, { steps: 16 }), { tone: "lo" }) + S(G.disc(-3.6, 3.6, 1.4, yAx([-23.6, 0, Z1 + 4.4]), P, { steps: 16 }), { tone: "mid" })));
    out.push(ISO.tinted(BLACK, S(G.lathe([[Z1 + 3, 0], [Z1 + 3, 22.6], [Z1 + 4.6, 21.8, 1], [Z1 + 6.2, 17, 1], [Z1 + 7, 9, 1], [Z1 + 7.2, 0]], F, P, { steps: 64 }), { tone: "hi" })));
    out.push(ISO.tinted(BLACK, S(G.disc(3.7, 5.6, 1.6, yAx([-23.6, 0, Z1 + 4.6]), P, { steps: 16 }), { tone: "lo" })));
    out.push(`<path d="${G.circleOf(F, Z1 + 3.02, 20.6, P)}" fill="none" stroke="#5a5f66" stroke-width=".6"/>`);
    out.push(ISO.tinted(STEEL, S(G.ringBand(Z1 + 7.1, Z1 + 7.5, 0, 6.4, F, P, { steps: 32 }), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, S(G.lathe([[Z1 + 7.5, 0], [Z1 + 7.5, 5], [Z1 + 8.3, 5.6, 1], [Z1 + 10.9, 5, 1], [Z1 + 12.3, 3.4, 1], [Z1 + 12.7, 0]], F, P, { steps: 40 }), { tone: "hi" })));
    return out.join("");
  }
  // The spout: a hollow taper with a rolled lip, its bore dark inside the tip. It is moulded into the body, so its
  // root is sunk into the body's wall on purpose (audit.mjs reports that join).
  function spoutSvg(P) {
    const out = [ISO.tinted(STEEL, S(G.lathe([[0, 0], [0, 6.6], [3, 6, 1], [9, 4.6, 1], [SPL - 1.4, 4], [SPL - 0.6, 4.7, 1], [SPL, 4.6], [SPL, 0]], SP, P, { steps: 40 }), { tone: "hi" }))];
    out.push(`<path d="${G.circleOf(SP, SPL + 0.02, 3.3, P, 28)}" fill="#2a2d31" stroke="#3c3f45" stroke-width=".6"/>`);
    // the limescale filter's mesh across the bore, each wire ending on the rim
    const mesh = [];
    for (let u = -2.4; u <= 2.41; u += 0.8) { const h = Math.sqrt(3.3 * 3.3 - u * u); mesh.push([[u, -h], [u, h]], [[-h, u], [h, u]]); }
    const at = ([a, b]) => K.iso(G.add3(G.pointOf(SP, SPL + 0.03, 0, 0), G.add3(G.mul3(SP.u, a), G.mul3(SP.v, b))), P);
    out.push(`<path d="${mesh.map(([p, q]) => K.pathOf([at(p), at(q)])).join("")}" fill="none" stroke="#6b7078" stroke-width=".45"/>`);
    return out.join("");
  }

  ISO.add({
    name: "kettle", title: "Electric kettle", compare: "kettle 480 280 260",
    about: "A jug kettle on its power base: the element heats the water to 100 °C, it bubbles and steams, and the thermostat clicks it off.",
    line: "kettle cx cy height on=1 lift=0 lab=1",
    demo: { line: "kettle 480 280 300 on=0", script: [{ set: { lift: 1 }, hold: "settle" }, { set: { lift: 0, on: 1 }, hold: "settle" }, { set: {}, hold: 2 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.1, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -10, 0), [0, 0, Z1 + 12 + LIFT], [TIP[0] + 18, 0, TIP[2] + 46]], cx, cy, W, H, { azimuth: 70, elevation: 20 }, parent);
      g.innerHTML = `<g>${baseSvg(P)}</g><g data-part="jug"><g>${handleSvg(P)}</g><g data-part="switch"></g><g data-part="body"></g><g data-part="window"></g><g data-part="top"></g></g><g data-part="steam"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      // steam from the spout's tip as a shader layer over everything; without WebGL the SVG wisps draw instead
      // the body, the lid and spout, and the shader are parts of their own (see ISO.later); the shader compiles last
      let fx = null;
      ISO.later(() => { el.body.innerHTML = bodySvg(P); });
      ISO.later(() => { el.top.innerHTML = topSvg(P) + spoutSvg(P); });
      ISO.later(() => { fx = ISO.gl(g, P, W, H, ISO.end(g), `uniform float uS;void main(){gl_FragColor=finish(steamInk(viewOf(gl_FragCoord.xy),vec3(${TIP.map((v) => v.toFixed(2)).join(",")}),normalize(vec3(.35,0.,1.)),48.,3.,uS,uTime));}`, ["uS"]); if (fx) el.steam.innerHTML = ""; draw(); });
      const lifted = ISO.clamp(ISO.num(o, "lift", 0), 0, 1);
      const s = { on: o.on === "1", lift: lifted, wantLift: lifted, temp: 20, after: 0, sv: 0, t: 0 };
      const seated = () => s.lift < 0.02;
      const draw = () => {
        const dz = s.lift * LIFT, heating = s.on && seated();
        w.attr(el.jug, "transform", K.translateAlong(P, [0, 0, dz]));
        w.rebuild(el.switch, String(heating), () => switchSvg(P, heating));
        const boil = ISO.smooth(85, 100, s.temp) * (s.temp >= 100 && !s.on ? Math.max(0, 1 - s.after / 2) : 1);
        w.rebuild(el.window, boil > 0.02 ? `b${(s.t % 20).toFixed(2)} ${boil.toFixed(2)}` : "still", () => windowSvg(P, LEVEL, boil, s.t));
        if (fx) fx.set({ uS: s.sv }, s.sv > 0.002);
        else w.rebuild(el.steam, s.sv > 0.02 ? (s.t % 20).toFixed(2) : "", () => (s.sv > 0.02 ? `<g opacity="${s.sv.toFixed(2)}">${steam(P, TIP, s.t, 1.4)}</g>` : ""));
        w.rebuild(el.words, lab ? `${Math.round(s.temp)} ${heating} ${s.lift.toFixed(2)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([TIP[0] + 4, 0, TIP[2] - 18], P), `${Math.round(s.temp)} °C`, s.temp > 99 ? "#a3271b" : "#1f4f8f", { size: 15, anchor: "start" }),
          ISO.word(K.iso([-48, 0, 21 + dz], P), heating ? "switch on: light glows" : "on/off switch", heating ? "#b5541a" : "#444", { size: 13, anchor: "end" }),
          ISO.word(K.iso(on(AW - 0.42, 40 + dz), P), "water window", "#1f4f8f", { size: 13, anchor: "start" }),
          ISO.word(K.iso([0, 30, 0], P), s.lift > 0.5 ? "power base: round connector, open" : "power base", "#555", { size: 13, dy: 16 })].join(""));
      };
      g.set = (p) => {
        if (p.lift !== undefined) s.wantLift = +p.lift ? 1 : 0;
        if (p.on !== undefined) { s.on = !!+p.on; if (s.on) { s.temp = 20; s.after = 0; } }
      };
      // After it clicks off at 100 °C it steams for a few seconds, then the loop can rest.
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.lift = ISO.follow(s.lift, s.wantLift, dt, 0.18, calm); if (Math.abs(s.lift - s.wantLift) < 0.004) s.lift = s.wantLift;
        if (s.on && seated()) { s.temp = calm ? 100 : Math.min(100, s.temp + dt * 26); if (s.temp >= 100) s.on = false; }
        else if (s.temp >= 100) s.after += dt;
        const steaming = s.temp > 90 && s.after < 3;
        s.sv = ISO.follow(s.sv, steaming ? 1 : 0, dt, 0.5, calm); if (!steaming && s.sv < 0.01) s.sv = 0;
        draw();
        return s.lift !== s.wantLift || s.on || steaming || s.sv > 0;
      };
      g.readout = () => (!seated() ? "jug lifted · the base's round connector is open, so the element can't get power (360°: the jug sits on it any way round)"
        : s.on ? `heating · ${Math.round(s.temp)} °C · a 3 kW element boils 1 L from 20 °C in about 2 minutes (4.2 kJ per kg per °C)` : s.temp >= 100 ? "100 °C · the thermostat clicked off" : "off");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
