// "windtunnel cx cy width aoa=0-18 lab=1 lit=wing|fan|honeycomb|balance" — an open-circuit school wind tunnel.
// Air is drawn in through a honeycomb straightener in the big inlet, sped up by the contraction into the glass-sided
// test section, slowed in the diffuser and pushed out by the fan (its duct cut away). In the test section a wing sits
// on a rod that runs down to a lift balance with a dial; a smoke rake upstream sends streams that bend over the wing.
// set({ aoa }) pitches the wing. Model: 20 m/s, ρ = 1.2 kg/m³, wing 150 mm × 300 mm; CL ≈ 2π·α (thin aerofoil) up to
// about 14°, then the flow separates (stall), the upper smoke breaks up and the lift falls. Lift = ½ρv²S·CL.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FLOOR = { x: -168, y: -54, w: 324, d: 108, r: 4 }, TS = { x0: -80, x1: 60, y: 20, z0: 40, z1: 80 }, ZC = 60, CHORD = 32, SMOKE_Y = 9;
  const RHO = 1.2, V = 20, AREA = 0.15 * 0.3, AZ = 112;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`, rad = (d) => (d * Math.PI) / 180;
  const CL = (a) => (a <= 14 ? 2 * Math.PI * rad(a) : 2 * Math.PI * rad(14) - 0.09 * (a - 14) ** 1.3);
  const PAINT = ISO.T.paint;
  // NACA-like section (12% thick, a little camber), chord along +x from the leading edge, pitched nose-up by a about c/4
  const section = (a) => {
    const up = [], lo = [];
    for (let i = 0; i <= 16; i++) { const x = (1 - Math.cos((Math.PI * i) / 16)) / 2, t = 0.6 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4), c = 0.04 * x * (1 - x) * 4; up.push([x, c + t]); lo.push([x, c - t]); }
    const pt = ([x, z]) => { const u = (x - 0.25) * CHORD, w = z * CHORD, r = -rad(a); return [u * Math.cos(r) - w * Math.sin(r), ZC + u * Math.sin(r) + w * Math.cos(r)]; };
    return { up: up.map(pt), lo: lo.map(pt), outline: [...up.map(pt), ...lo.slice(1, -1).reverse().map(pt)] };
  };
  const surf = (list, x) => { for (let i = 1; i < list.length; i++) { const [x0, z0] = list[i - 1], [x1, z1] = list[i]; if ((x - x0) * (x - x1) <= 0 && x0 !== x1) return z0 + ((z1 - z0) * (x - x0)) / (x1 - x0); } return null; };

  function groundSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -6, 6, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -6, 6, P, 4, 0.6), { tone: "lo" }))];
    for (const x of [-140, -96, -30, 40, 96, 128]) out.push(ISO.wbox(P, [x - 3, x + 3], [-20, -14], [0, x < -80 ? 18 : x > 95 ? 28 : 36], "mid"), ISO.wbox(P, [x - 3, x + 3], [14, 20], [0, x < -80 ? 18 : x > 95 ? 28 : 36], "mid"));
    return out.join("");
  }
  // Fan duct, cut away on the near side: the back half of the drum, the motor nacelle on its struts, and the blades.
  function fanBackSvg(P) {
    const half = [...ISO.arc(0, 60, 32, Math.PI * 0.5, Math.PI * 1.5, 24).map(([y, z]) => [y, z]), ...ISO.arc(0, 60, 30, Math.PI * 1.5, Math.PI * 0.5, 24)];
    return ISO.tinted(PAINT, ISO.prismX(P, half, 100, 142, ["#8fa6c0", "#dfe9f4"], "#c6d5e5", "#33506f"));
  }
  function nacelleSvg(P) {
    const F = xAx([0, 0, ZC]);
    return S(G.solidOf([[104, 0], [104, 5, 1], [108, 8, 1], [112, 9], [134, 9], [138, 6, 1], [140, 0]], F, P), { tone: "mid", inner: L(G.arcOf(F, 124, 9, P), { tone: "faint" }) }) +
      `<path d="${K.pathOf([[124, -1, ZC - 9], [124, -1, 30]].map((p) => K.iso(p, P)))}${K.pathOf([[124, -9, ZC], [124, -30, ZC]].map((p) => K.iso(p, P)))}" stroke="#3c3f45" stroke-width="2.2"/>`;
  }
  const bladesSvg = (P, a) => {
    const out = [], fx = 112;
    for (let i = 0; i < 5; i++) {
      const pts = [];
      for (let j = 0; j <= 6; j++) { const r = 6 + (22 * j) / 6, ph = a + (i * 2 * Math.PI) / 5 + 0.3 * (j / 6); pts.push([r * Math.cos(ph - 0.22), ZC + r * Math.sin(ph - 0.22)]); }
      for (let j = 6; j >= 0; j--) { const r = 6 + (22 * j) / 6, ph = a + (i * 2 * Math.PI) / 5 + 0.3 * (j / 6) + 0.42 - 0.18 * (j / 6); pts.push([r * Math.cos(ph), ZC + r * Math.sin(ph)]); }
      out.push({ k: Math.sin(a + (i * 2 * Math.PI) / 5), d: K.pathOf(pts.map(([y, z]) => K.iso([fx, y, z], P)), true) });
    }
    return out.sort((p, q) => q.k - p.k).map((b) => `<path d="${b.d}" fill="#c7ccd2" stroke="#2f343a" stroke-width="0.6"/>`).join("");
  };
  function diffuserSvg(P) {
    const V8 = [[60, -22, 36], [100, -34, 26], [100, 34, 26], [60, 22, 36], [60, -22, 84], [100, -34, 94], [100, 34, 94], [60, 22, 84]];
    return ISO.tinted(PAINT, ISO.poly(V8, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")) + D([[60, 22, 40], [60, 22, 80], [100, 34, 30], [100, 34, 90]].map((p) => K.iso(p, P)), { size: 0.7 });
  }
  // Test section: floor, ceiling and the dark back wall (smoke shows up against it); the glass and frame go on later.
  function testBackSvg(P) {
    const out = [ISO.tinted(PAINT, ISO.wbox(P, [TS.x0, TS.x1], [-22, 22], [TS.z0 - 4, TS.z0], "mid"))];
    out.push(`<path d="${K.pathOf([[TS.x0, -20, TS.z0], [TS.x1, -20, TS.z0], [TS.x1, -20, TS.z1], [TS.x0, -20, TS.z1]].map((p) => K.iso(p, P)), true)}" fill="#3a3f46" stroke="#1f2328" stroke-width="0.6"/>`);
    out.push(`<path d="${K.pathOf([[TS.x0, -20, TS.z0], [TS.x1, -20, TS.z0], [TS.x1, 20, TS.z0], [TS.x0, 20, TS.z0]].map((p) => K.iso(p, P)), true)}" fill="#4a5058"/>`);
    out.push(`<path d="${G.circleOf(G.frameOf([0, -2, TS.z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0.05, 9, P)}" fill="#6b7178" stroke="#2f343a" stroke-width="0.6"/>`);
    return out.join("");
  }
  function testFrontSvg(P) {
    const f = TS.y + 0.05, out = [ISO.tinted(PAINT, ISO.wbox(P, [TS.x0, TS.x1], [-22, 22], [TS.z1, TS.z1 + 4], "mid"))];
    out.push(`<path d="${K.pathOf([[TS.x0, f, TS.z0], [TS.x1, f, TS.z0], [TS.x1, f, TS.z1], [TS.x0, f, TS.z1]].map((p) => K.iso(p, P)), true)}" fill="#dfeef7" fill-opacity=".16" stroke="none"/>`);
    out.push(`<path d="${K.pathOf([[-50, f, TS.z1], [-62, f, TS.z0]].map((p) => K.iso(p, P)))}${K.pathOf([[-40, f, TS.z1], [-46, f, TS.z0 + 18]].map((p) => K.iso(p, P)))}" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2"/>`);
    for (const [x0, x1, z0, z1] of [[TS.x0, TS.x1, TS.z0 - 4, TS.z0 + 1.5], [TS.x0, TS.x0 + 3, TS.z0, TS.z1], [TS.x1 - 3, TS.x1, TS.z0, TS.z1], [TS.x0, TS.x1, TS.z1 - 1.5, TS.z1]]) out.push(ISO.tinted(PAINT, ISO.wbox(P, [x0, x1], [TS.y, TS.y + 2], [z0, z1], "hi")));
    const bolts = []; for (let x = TS.x0 + 8; x < TS.x1 - 4; x += 12) bolts.push(K.iso([x, TS.y + 2.05, TS.z0 - 1.2], P), K.iso([x, TS.y + 2.05, TS.z1 - 0.8], P));
    out.push(D(bolts, { size: 0.5 }));
    return out.join("");
  }
  function inletSvg(P) {
    const V8 = [[-150, -46, 14], [-80, -22, 36], [-80, 22, 36], [-150, 46, 14], [-150, -46, 106], [-80, -22, 84], [-80, 22, 84], [-150, 46, 106]];
    const out = [ISO.tinted(PAINT, ISO.poly(V8, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"))];
    // the honeycomb in the inlet face: rows of closed hexagon cells, and the face's rim
    const cells = [], r = 4.2, f = -150.05;
    for (let row = 0; row < 21; row++) for (let col = 0; col < 11; col++) {
      const y = -40 + col * 7.4 + (row % 2) * 3.7, z = 18 + row * 4.2;
      if (y > 42 || z > 102) continue;
      cells.push(K.pathOf(Array.from({ length: 6 }, (_, i) => K.iso([f, y + Math.cos(i * Math.PI / 3) * r * 0.85, z + Math.sin(i * Math.PI / 3) * r * 0.85], P)), true));
    }
    out.push(`<path d="${K.pathOf([[f, -46, 14], [f, 46, 14], [f, 46, 106], [f, -46, 106]].map((p) => K.iso(p, P)), true)}" fill="#e9edf1" stroke="#33506f" stroke-width="0.8"/>`, L(cells.join(""), { tone: "lo" }));
    out.push(ISO.tinted(PAINT, ISO.wbox(P, [-153, -150], [-48, 48], [12, 16], "hi") + ISO.wbox(P, [-153, -150], [-48, 48], [104, 108], "hi")));
    return named("honeycomb", out.join(""));
  }
  // The lift balance under the test section, with its dial; the rod up through the floor to the wing.
  function balanceSvg(P) {
    const out = [ISO.wbox(P, [-18, 18], [-14, 14], [6, 30], "mid"), ISO.wbox(P, [-22, 22], [-18, 18], [0, 6], "mid")];
    const F = yAx([0, 14, 18]);
    out.push(S(G.disc(0, 1.2, 9, F, P), { tone: "hi" }), `<path d="${G.circleOf(F, 1.25, 8, P)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.5"/>`);
    const at = (deg, rr) => [Math.sin(rad(deg)) * rr, 15.3, 18 + Math.cos(rad(deg)) * rr], arc = [], minor = [], major = [];
    for (let d = -120; d <= 120; d += 6) arc.push(K.iso(at(d, 6.6), P));
    for (let i = 0; i <= 12; i++) { const d = -120 + i * 20; (i % 3 ? minor : major).push(K.segment(at(d, 6.6), at(d, i % 3 ? 5.6 : 5), P)); }
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    return named("balance", out.join(""));
  }
  const needle = (P, N) => { const d = -120 + ISO.clamp(N / 16, 0, 1) * 240, c = [0, 15.35, 18]; return `<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, [Math.sin(rad(d)) * 6, 15.35, 18 + Math.cos(rad(d)) * 6], P)}" style="stroke-width:1.2"/>` + D([K.iso(c, P)], { size: 0.9, tone: "hi" }); };
  function wingSvg(P, a) {
    const sec = section(a), rod = S(K.cylinder(0, -2, 1.4, TS.z0, ZC - TS.z0 - 2, P, 14), { tone: "mid", crease: "none" });
    return rod + named("wing", ISO.prismY(P, sec.outline, -18, SMOKE_Y - 0.5, ["#8d9096", "#e9ecef"], "#d3d5d9", "#3c3f45"));
  }
  // Smoke streams at the near tip's plane: upwash ahead, flow along the surfaces, downwash behind; broken up in a stall.
  function smokeSvg(P, a, clock) {
    const sec = section(a), cl = CL(a), stall = a > 14, out = [];
    const xs = []; for (let x = -74; x <= 58; x += 2) xs.push([x, surf(sec.up, x), surf(sec.lo, x)]);
    for (let i = 0; i < 9; i++) {
      const z0 = 44 + i * 4, d = z0 - ZC, f = Math.exp(-Math.abs(d) / 10), pts = [];
      for (const [x, u, l] of xs) {
        let z = z0 + f * cl * 7 * (0.5 - Math.atan(x / 9) / Math.PI) - cl * 7 * f * (0.5 + Math.atan(x / 12) / Math.PI);
        if (d > 0 && u !== null) z = Math.max(z, u + 0.8 + 3 * (1 - f));
        if (d <= 0 && l !== null) z = Math.min(z, l - 0.8 - 3 * (1 - f));
        if (stall && d > 0 && x > 0) z += f * Math.sin(x * 0.35 - clock * 7 + i) * Math.min(1, x / 14) * 3.2;
        pts.push([x, SMOKE_Y, ISO.clamp(z, TS.z0 + 1, TS.z1 - 1)]);
      }
      out.push(K.pathOf(pts.map((p) => K.iso(p, P))));
    }
    return `<path d="${out.join("")}" fill="none" stroke="#f4f6f8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
  }
  function rakeSvg(P) {
    const out = [ISO.wbox(P, [-79, -76], [SMOKE_Y - 3, SMOKE_Y + 3], [TS.z0, TS.z1], "mid")];
    for (let i = 0; i < 9; i++) out.push(S(G.disc(-76, -72, 0.9, xAx([0, SMOKE_Y, 44 + i * 4]), P, { steps: 12 }), { tone: "hi" }));
    return out.join("");
  }
  const style = "";

  ISO.add({
    name: "windtunnel", title: "Wind tunnel", compare: "windtunnel 480 270 500",
    about: "A wind tunnel: honeycomb inlet, contraction, glass test section with a wing on a lift balance, diffuser and fan; smoke streams bend over the wing, and the lift rises with the angle until the wing stalls.",
    line: "windtunnel cx cy width aoa=0-18 lab=1 lit=wing|fan|honeycomb|balance",
    demo: { line: "windtunnel 480 270 500", script: [{ set: { aoa: 0 }, hold: 1.6 }, { set: { aoa: 6 }, hold: "settle" }, { set: { aoa: 12 }, hold: "settle" }, { set: { aoa: 17 }, hold: 2.4 }, { set: { aoa: 4 }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 0.9;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -6, 0), [-150, -46, 108], [-150, 46, 108], [100, -34, 94], [142, 32, 92]], cx, cy, W, H, { azimuth: AZ, elevation: 20 }, parent);
      const s = { a: ISO.clamp(ISO.num(o, "aoa", 4), 0, 18), want: 0, clock: 0, fan: 0 };
      s.want = s.a;
      g.innerHTML = style + `<g>${groundSvg(P)}${fanBackSvg(P)}${nacelleSvg(P)}</g><g data-name="fan"><g data-part="blades"></g>${S(G.disc(108, 114, 6, xAx([0, 0, ZC]), P), { tone: "hi" })}</g><g>${diffuserSvg(P)}${balanceSvg(P)}</g><g data-part="needle"></g><g>${testBackSvg(P)}${rakeSvg(P)}</g>` +
        `<g data-part="wing"></g><g class="wt-smoke" data-part="smoke"></g><g>${testFrontSvg(P)}${inletSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const lift = () => 0.5 * RHO * V * V * AREA * CL(s.a);
      const draw = () => {
        w.rebuild(el.blades, s.fan.toFixed(3), () => bladesSvg(P, s.fan));
        w.rebuild(el.wing, s.a.toFixed(2), () => wingSvg(P, s.a));
        w.rebuild(el.smoke, `${s.a.toFixed(2)} ${s.a > 14 ? s.clock.toFixed(2) : ""}`, () => smokeSvg(P, s.a, s.clock));
        w.rebuild(el.needle, lift().toFixed(2), () => needle(P, lift()));
        w.rebuild(el.words, "w", () => !lab ? "" : [
          ISO.word(K.iso([-150, 0, 108], P), "honeycomb inlet", "#555", { size: 14, dy: -8 }), ISO.word(K.iso([121, 0, 94], P), "fan", "#555", { size: 14, dy: -6 }),
          ISO.word(K.iso([0, 18, 0], P), "lift balance", "#555", { size: 14, dy: 22 }), ISO.word(K.iso([-10, 20, TS.z1 + 4], P), "test section", "#555", { size: 14, dy: -8 }),
        ].join(""));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.aoa !== undefined) s.want = ISO.clamp(+p.aoa, 0, 18); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        s.a = ISO.follow(s.a, s.want, dt, 0.45, ISO.still());
        if (Math.abs(s.a - s.want) < 0.02) s.a = s.want;
        s.clock += dt;
        if (!ISO.still()) s.fan += dt * 2.2 * Math.PI * 2;
        draw();
        return s.a !== s.want;
      };
      g.readout = () => `air ${V} m/s · wing at ${s.a.toFixed(1)}° · CL ${s.a > 14 ? "falls: stalled, the flow has left the top surface" : `≈ 2πα = ${CL(s.a).toFixed(2)}`} · lift = ½ρv²S·CL = ${lift().toFixed(1)} N`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
