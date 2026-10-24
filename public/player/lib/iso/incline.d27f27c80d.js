// "incline cx cy width angle=10 mu=0.4 forces=1 lab=1" and "friction cx cy width mu=0.4 lab=1" — one ramp rig.
// A hinged ramp on a base with a quadrant scale and a screw post under it, a 0.5 kg wooden block, and a winch at the
// top end that pulls the block through a newton meter. incline: raise the angle; the block holds while tan θ ≤ μs
// (wood on wood ≈ 0.4, about 22°) and slides with a = g(sin θ − μk cos θ) once it is steeper. friction: flat ramp; the
// winch winds, the meter climbs to μs·m·g while the block sticks, then drops to μk·m·g as it slides (stick and slip).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, MASS = 0.5, UNIT_M = 0.004;      // a world unit is 4 mm along the ramp
  const BOARD = { x: -120, y: -40, w: 240, d: 80, r: 6 }, HINGE = [-96, 0, 8], RAMP = { len: 190, w: 22, t: 4 };
  const BLOCK = { l: 26, h: 14, w: 16 }, POST_X = 64, WINCH_U = RAMP.len + 6;
  const onRamp = (th) => (u, w, y) => [HINGE[0] + u * Math.cos(th) - w * Math.sin(th), y, HINGE[2] + u * Math.sin(th) + w * Math.cos(th)];
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function baseSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 60, y: -34, w: 40, d: 14, r: 1.2 })];
    // Hinge: two knuckles on the base either side of the ramp's own, and the pin.
    for (const y of [-RAMP.w - 4, RAMP.w]) out.push(ISO.wbox(P, [HINGE[0] - 6, HINGE[0] + 6], [y, y + 4], [0, HINGE[2] + 2], "mid"));
    out.push(S(G.disc(-RAMP.w - 4, RAMP.w + 4, 1.6, yAx(HINGE), P), { tone: "mid" }));
    // The quadrant: a plate standing beside the hinge with degree ticks every 5° from 0 to 45, hanging from its arc.
    const R = 70, arc = [], minor = [], major = [];
    out.push(ISO.prismY(P, [[HINGE[0], HINGE[2]], ...ISO.arc(HINGE[0], HINGE[2], R + 4, 0, Math.PI / 4 + 0.06, 30)], RAMP.w + 5, RAMP.w + 6.2, ["#c9dde9", "#eef6fb"], "#eef6fb", "#5d7f96"));
    for (let d = 0; d <= 46; d++) arc.push(K.iso([HINGE[0] + Math.cos((d * Math.PI) / 180) * R, RAMP.w + 6.3, HINGE[2] + Math.sin((d * Math.PI) / 180) * R], P));
    for (let d = 0; d <= 45; d += 5) (d % 15 ? minor : major).push(K.segment([HINGE[0] + Math.cos((d * Math.PI) / 180) * R, RAMP.w + 6.3, HINGE[2] + Math.sin((d * Math.PI) / 180) * R], [HINGE[0] + Math.cos((d * Math.PI) / 180) * (R + (d % 15 ? 2.5 : 4)), RAMP.w + 6.3, HINGE[2] + Math.sin((d * Math.PI) / 180) * (R + (d % 15 ? 2.5 : 4))], P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.6, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    // The screw post's foot.
    out.push(S(K.cylinder(POST_X, 0, 7, 0, 3, P, 32, 0.4), { tone: "mid" }));
    if (lab) out.push(ISO.word(K.iso([HINGE[0], RAMP.w + 6, -8], P), "Hinge", "#555", { size: 14, dy: 22 }));
    return out.join("");
  }

  // The ramp and what rides it: block, string, meter and the winch at its top end. pos = block's foot from the hinge.
  function rampSvg(P, th, pos, wind, force, forces, lab, mode, fric) {
    const at = onRamp(th), at3 = (p) => K.iso(p, P), out = [];
    // Screw post: from its foot up to the ramp's underside at x = POST_X.
    const top = HINGE[2] + (POST_X - HINGE[0]) * Math.tan(th) - RAMP.t * 0;
    out.push(S(K.cylinder(POST_X, 0, 2.2, 3, Math.max(1, top - 4.5), P, 20), { tone: "mid", crease: "none" }), S(K.cylinder(POST_X, 0, 4, Math.max(3.5, top - 4.5), 1.6, P, 24), { tone: "mid" }));
    const ramp = [ISO.box(at, P, [0, RAMP.len], [0, RAMP.t], [-RAMP.w, RAMP.w])];
    const minor = [], major = [];
    for (let u = 10; u <= RAMP.len - 10; u += 5) (u % 25 ? minor : major).push(K.segment(at(u, RAMP.t, RAMP.w), at(u, RAMP.t, RAMP.w - (u % 25 ? 2.2 : 4)), P));
    ramp.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    out.push(`<g data-name="ramp">${ISO.tinted(ISO.T.wood, ramp.join(""))}</g>`);
    out.push(ISO.box(at, P, [0, 4], [RAMP.t, RAMP.t + 6], [-RAMP.w, RAMP.w]));                       // end stop at the bottom
    // Winch at the top end, on a bracket; the string runs from its drum to the meter and on to the block's eye.
    if (mode === "friction") {
    const drumC = at(WINCH_U, RAMP.t + 9, 0), F = yAx(drumC);
    out.push(ISO.box(at, P, [RAMP.len - 6, RAMP.len], [RAMP.t, RAMP.t + 14], [-10, -8]), ISO.box(at, P, [RAMP.len - 6, RAMP.len], [RAMP.t, RAMP.t + 14], [8, 10]));
    out.push(`<g data-name="winch">${S(G.disc(-8, 8, 4, F, P), { tone: "mid" })}${L(G.ribsOf(F, -8, 8, 4, 12, P, { phase: wind / 4, seams: true }), { tone: "lo" })}</g>`);
    const eye = at(pos + BLOCK.l, RAMP.t + BLOCK.h / 2, 0), meterA = at(pos + BLOCK.l + 30, RAMP.t + BLOCK.h / 2, 0), meterB = at(pos + BLOCK.l + 62, RAMP.t + BLOCK.h / 2, 0);
    out.push(`<path d="${K.pathOf([at3(eye), at3(meterA)])}${K.pathOf([at3(meterB), at3(at(WINCH_U - 4, RAMP.t + 9 - 4 * 0, 0))])}" fill="none" stroke="#6b5a3a" stroke-width="1.2" stroke-linecap="round"/>`);
    // Newton meter lying along the string: tube, scale, pointer at `force` on 0–5 N.
    const mF = G.frameOf(meterA, [Math.cos(th), 0, Math.sin(th)], [0, 1, 0], [-Math.sin(th), 0, Math.cos(th)]);
    out.push(`<g data-name="meter">${S(G.disc(0, 32, 3.4, mF, P), { tone: "hi" })}`);
    const mt = [], mj = [];
    for (let i = 0; i <= 10; i++) (i % 2 ? mt : mj).push(K.segment(G.pointOf(mF, 4 + i * 2.4, 3.45, Math.PI / 2), G.pointOf(mF, 4 + i * 2.4, 3.45, Math.PI / 2 - (i % 2 ? 0.25 : 0.5)), P));
    out.push(L(mt.join(""), { tone: "lo", free: "end" }) + L(mj.join(""), { tone: "mid", free: "end" }));
    const fp = 4 + ISO.clamp(force / 5, 0, 1) * 24;
    out.push(`<path class="iso-line" data-tone="lit" data-free="" d="${K.segment(G.pointOf(mF, fp, 3.5, Math.PI / 2 + 0.3), G.pointOf(mF, fp, 3.5, Math.PI / 2 - 0.6), P)}" style="stroke-width:1.4"/></g>`);
    }
    // The block: a wooden block with a screw eye.
    const blk = [ISO.box(at, P, [pos, pos + BLOCK.l], [RAMP.t, RAMP.t + BLOCK.h], [-BLOCK.w / 2, BLOCK.w / 2], "hi")];
    blk.push(S(G.disc(0, 3, 0.8, G.frameOf(at(pos + BLOCK.l, RAMP.t + BLOCK.h / 2, 0), [Math.cos(th), 0, Math.sin(th)], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(`<g data-name="block">${ISO.tinted(ISO.T.wood, blk.join(""))}</g>`);
    // Forces on the block, from its centre, drawn to scale in the ramp's front plane (1 N = 9 units).
    if (forces) {
      const c = at(pos + BLOCK.l / 2, RAMP.t + BLOCK.h / 2, BLOCK.w / 2 + 2), N = MASS * g9, k = 9;
      const arrow = (dir, len, color, name) => {
        const tip = [c[0] + dir[0] * len, c[1], c[2] + dir[1] * len], a = K.iso(c, P), b = K.iso(tip, P), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const head = [0.45, -0.45].map((d) => [b[0] - 6 * Math.cos(ang + d), b[1] - 6 * Math.sin(ang + d)]);
        return `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${head[0][0]} ${head[0][1]} L${b[0]} ${b[1]} L${head[1][0]} ${head[1][1]}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
          (lab ? ISO.word([b[0] + 6, b[1] + 4], name, color, { anchor: "start", size: 13 }) : "");
      };
      const normal = N * Math.cos(th), along = N * Math.sin(th);
      out.push(arrow([0, -1], N * k, "#7a1f1f", `weight ${N.toFixed(1)} N`));
      out.push(arrow([-Math.sin(th), Math.cos(th)], normal * k, "#1f4f8f", `normal ${normal.toFixed(1)} N`));
      if (mode === "incline" && fric > 0.01) out.push(arrow([Math.cos(th), Math.sin(th)], fric * k, "#2c6a22", `friction ${fric.toFixed(1)} N`));
    }
    if (lab && !forces) out.push(ISO.word(at3(at(pos + BLOCK.l / 2, RAMP.t + BLOCK.h, 0)), `${MASS} kg`, "#7a5a2e", { dy: -6, size: 14 }));
    return out.join("");
  }

  const make = (mode) => ([cx, cy, size = 440], o, t, parent) => {
    const lab = o.lab !== "0", W = size * 1.25, H = size * (mode === "incline" ? 0.85 : 0.6);
    const tall = mode === "incline" ? HINGE[2] + RAMP.len * Math.sin((40 * Math.PI) / 180) : 60;
    const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [HINGE[0], 0, tall], [HINGE[0] + RAMP.len * 0.77, 0, tall]], cx, cy, W, H, { azimuth: 70, elevation: 22 }, parent);
    const mu = { s: ISO.clamp(ISO.num(o, "mu", 0.4), 0.1, 0.9) }; mu.k = mu.s * 0.75;
    const s = { fric: 0, th: mode === "incline" ? (ISO.num(o, "angle", 10) * Math.PI) / 180 : 0, thT: 0, pos: mode === "incline" ? 120 : 40, v: 0, wind: 0, windT: 0, force: 0, slipping: false };
    s.thT = s.th;
    const forces = mode === "incline" && o.forces !== "0";
    g.innerHTML = `<g>${baseSvg(P, lab)}</g><g data-part="ramp"></g>`;
    const el = g.querySelector('[data-part="ramp"]'), w = ISO.writer();
    let lit = o.lit || "block";
    const draw = () => {
      w.rebuild(el, `${s.th.toFixed(4)} ${s.pos.toFixed(2)} ${s.wind.toFixed(2)} ${s.force.toFixed(2)} ${lit}`, () => rampSvg(P, s.th, s.pos, s.wind, s.force, forces, lab, mode, s.fric));
      const parts = [...el.querySelectorAll("[data-name]")];
      w.light(parts, parts.filter((p) => p.dataset.name === lit));
    };
    g.set = (p) => {
      if (p.angle !== undefined) s.thT = (ISO.clamp(+p.angle, 0, 40) * Math.PI) / 180;
      if (p.wind !== undefined) s.windT = +p.wind;
      if (p.reset) { s.pos = mode === "incline" ? 120 : 40; s.v = 0; s.wind = s.windT = 0; s.slipping = false; }
      if (p.lit) lit = p.lit;
    };
    g.update = (dt) => {
      const calm = ISO.still();
      s.th = ISO.follow(s.th, s.thT, dt, 0.5, calm);
      const N = MASS * g9 * Math.cos(s.th), down = MASS * g9 * Math.sin(s.th);
      let moving = s.th !== s.thT;
      if (mode === "incline") {
        // Holds while the pull down the slope is within static friction; slides once it isn't, until the end stop.
        if (!s.slipping && down > mu.s * N + 1e-9) s.slipping = true;
        if (s.slipping && s.pos > 4) {
          const a = (down - mu.k * N) / MASS;
          s.v = Math.max(0, s.v + a * dt); s.pos = Math.max(4, s.pos - (s.v * dt) / UNIT_M);
          moving = true;
          if (s.pos === 4) { s.v = 0; s.slipping = false; }
        }
        // Friction on the block: whatever holds it (up to μs·N), or μk·N while it slides, nothing once it rests on the stop.
        s.fric = s.slipping ? mu.k * N : s.pos <= 4 ? Math.max(0, Math.min(down, mu.s * N) - down) : Math.min(down, mu.s * N);
        s.force = 0;
      } else {
        // The string is a stiff spring between the winch and the block: it sticks until the pull beats μs·N, then slips.
        s.wind = ISO.follow(s.wind, s.windT, dt, 1.4, calm);
        const stretch = s.wind - (s.pos - 40), pull = Math.max(0, stretch * 0.08);
        if (!s.slipping && pull > mu.s * N) s.slipping = true;
        if (s.slipping) {
          const a = (pull - mu.k * N) / MASS;
          s.v = Math.max(0, s.v + a * dt * 0.2); s.pos += (s.v * dt) / UNIT_M * 0.2;
          if (s.v === 0 && pull <= mu.s * N) s.slipping = false;
        }
        s.force = pull;
        moving = moving || s.wind !== s.windT || s.slipping;
      }
      draw();
      return moving;
    };
    g.readout = () => {
      const deg = (s.th * 180) / Math.PI;
      if (mode === "incline") return `angle ${deg.toFixed(0)}° · tan θ = ${Math.tan(s.th).toFixed(2)} vs μ = ${mu.s} · ${s.slipping ? "sliding" : s.pos <= 4 ? "at the stop" : "holding"}`;
      return `meter ${s.force.toFixed(2)} N · static limit μs·m·g = ${(mu.s * MASS * g9).toFixed(2)} N · sliding needs ${(mu.k * MASS * g9).toFixed(2)} N · ${s.slipping ? "sliding" : "stuck"}`;
    };
    draw();
    if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
    return g;
  };
  ISO.add({
    name: "incline", title: "Ramp (incline)", compare: "incline 480 290 400",
    about: "Hinged ramp with a quadrant: the block holds until tan θ passes μ (about 22° for wood), then slides to the stop.",
    line: "incline cx cy width angle=10 mu=0.4 forces=1 lab=1", make: make("incline"),
    demo: { line: "incline 480 290 400", script: [{ set: { angle: 15 }, hold: "settle" }, { set: { angle: 20 }, hold: "settle" }, { set: { angle: 26 }, hold: "settle" }, { set: { angle: 10, reset: 1 }, hold: "settle" }] },
  });
  ISO.add({
    name: "friction", title: "Friction (stick and slip)", compare: "friction 480 280 440",
    about: "Flat ramp, a winch pulling a block through a newton meter: the reading climbs to the static limit, then drops as it slides.",
    line: "friction cx cy width mu=0.4 lab=1", make: make("friction"),
    demo: { line: "friction 480 280 440", script: [{ set: { wind: 20 }, hold: 2.5 }, { set: { wind: 45 }, hold: 3 }, { set: { wind: 80 }, hold: 3.5 }, { set: { reset: 1 }, hold: 1 }] },
  });
})();
