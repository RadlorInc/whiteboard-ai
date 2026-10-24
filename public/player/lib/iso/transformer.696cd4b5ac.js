// "transformer cx cy height k=up|down vp=12 lab=1 lit=core|primary|secondary" — a school bench transformer.
// A laminated iron core (a square ring of thin stacked plates: two limbs and two yokes, clamped by bolted end frames)
// carries the primary coil on its left limb and the secondary on its right, each wound on a bobbin. An AC supply feeds
// the primary; a voltmeter reads each side and a lamp hangs on the secondary. k=up: Np 200, Ns 400 → Vs = 2·Vp;
// k=down: Ns 100 → Vs = Vp/2. Vs/Vp = Ns/Np (ideal transformer). set({ on, k, vp }) switches, rewinds or sets the input.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -120, y: -52, w: 240, d: 104, r: 6 };
  const CY = 0, HY = 12, LIMB = 18, X0 = 50, Z0 = 8, Z1 = 112, YOKE = 18, CXL = -(X0 - LIMB / 2), CXR = X0 - LIMB / 2;
  const COIL = { r: 17, fl: 20, z0: Z0 + YOKE + 4, z1: Z1 - YOKE - 6 }, NP = 200, VMAX = 30;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const COPPER = ISO.T.copper, IRON = ISO.tint("#d3d6da", ["#7c828a", "#8f959d", "#a3a9b0", "#b8bdc3"], "#2f343a");
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;

  // Iron core: bottom yoke, two limbs, top yoke; every plate edge shows on the top and the +x faces (plates stack in y).
  function coreSvg(P) {
    const out = [], lam = (x0, x1, z0, z1, top) => {
      const lines = [];
      for (let y = -HY + 1.5; y < HY - 0.5; y += 1.5) {
        if (top) lines.push(K.lineOnTop([x0, y], [x1, y], z1, P));
        lines.push(K.segment([x1, y, z0], [x1, y, z1], P));
      }
      return L(lines.join(""), { tone: "faint" });
    };
    // end frames (angle iron) clamping the yokes, with bolts through
    const frame = (z0, z1) => ISO.tinted(ISO.T.paint, ISO.wbox(P, [-X0 - 4, X0 + 4], [HY, HY + 3], [z0, z1], "mid"));
    out.push(ISO.tinted(IRON, ISO.wbox(P, [-X0, X0], [-HY, HY], [Z0, Z0 + YOKE], "hi") + lam(-X0, X0, Z0, Z0 + YOKE, true)));
    for (const x of [-X0, X0 - LIMB]) out.push(ISO.tinted(IRON, ISO.wbox(P, [x, x + LIMB], [-HY, HY], [Z0 + YOKE, Z1 - YOKE], "hi") + lam(x, x + LIMB, Z0 + YOKE, Z1 - YOKE, false)));
    out.push(ISO.tinted(IRON, ISO.wbox(P, [-X0, X0], [-HY, HY], [Z1 - YOKE, Z1], "hi") + lam(-X0, X0, Z1 - YOKE, Z1, true)));
    out.push(frame(Z0 + 2, Z0 + YOKE - 2), frame(Z1 - YOKE + 2, Z1 - 2));
    for (const z of [Z0 + YOKE / 2, Z1 - YOKE / 2]) for (const x of [-X0 + 6, -14, 14, X0 - 6]) {
      const F = G.frameOf([x, HY + 3, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      out.push(S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 2.2, Math.sin(i * Math.PI / 3) * 2.2]), 0, 1.4, P), { tone: "mid" }), D([K.iso(G.pointOf(F, 1.4, 0, 0), P)], { size: 0.5 }));
    }
    // feet brackets on the base
    for (const x of [-X0 + 4, X0 - 16]) out.push(ISO.wbox(P, [x, x + 12], [-HY - 4, HY + 4], [0, Z0], "mid"), D([K.iso([x + 3, HY + 3, Z0], P), K.iso([x + 9, HY + 3, Z0], P)], { size: 0.5 }));
    return named("core", out.join(""));
  }
  // A coil on its bobbin around a limb; the visible turns are drawn as rings, one per 20 turns.
  function coilSvg(P, x, turns, name) {
    const out = [], F = zAx([x, CY, 0]);
    out.push(S(G.disc(COIL.z0 - 2, COIL.z0, COIL.fl, F, P), { tone: "mid" }));
    const rings = [], n = Math.round(turns / 20), step = (COIL.z1 - COIL.z0) / n;
    for (let i = 1; i < n; i++) rings.push(G.arcOf(F, COIL.z0 + i * step, COIL.r, P));
    out.push(ISO.tinted(COPPER, S(G.disc(COIL.z0, COIL.z1, COIL.r, F, P), { tone: "hi", inner: L(rings.join(""), { tone: "lo" }) })));
    out.push(S(G.disc(COIL.z1, COIL.z1 + 2, COIL.fl, F, P), { tone: "mid" }));
    return named(name, out.join(""));
  }
  // Terminal block beside a coil: a bakelite strip with two brass posts and knurled caps, the coil's leads to it.
  function terminalsSvg(P, x) {
    const out = [ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 5, x + 5], [-13, 13], [0, 5], "hi"))];
    for (const dy of [-7, 7]) out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(x, dy, 1.6, 5, 4, P, 16), { tone: "hi" }) + S(K.cylinder(x, dy, 3, 9, 3, P, 24, 0.3), { tone: "hi", inner: L(K.knurl(x, dy, 3, 9, 12, 14, P, 0), { tone: "lo" }) })));
    return out.join("");
  }
  const TX = 76, pins = (x) => [[x, -7, 12], [x, 7, 12]];
  // A voltmeter: a case whose front (+y) carries a 0–30 V arc scale and the needle.
  function meterSvg(P, [x, y], volts) {
    const out = [ISO.wbox(P, [x - 17, x + 17], [y - 10, y + 10], [0, 26], "mid")], f = y + 10.05, c = [x, f, 7], rr = 11;
    out.push(`<path d="${K.pathOf([[x - 14, f, 3], [x + 14, f, 3], [x + 14, f, 23], [x - 14, f, 23]].map((p) => K.iso(p, P)), true)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.6"/>`);
    const at = (deg, r) => [c[0] + Math.sin(deg * Math.PI / 180) * r, f, c[2] + Math.cos(deg * Math.PI / 180) * r];
    const arc = [], minor = [], major = [];
    for (let d = -50; d <= 50; d += 2) arc.push(K.iso(at(d, rr), P));
    for (let i = 0; i <= 15; i++) { const d = -50 + i * (100 / 15); (i % 5 ? minor : major).push(K.segment(at(d, rr), at(d, rr + (i % 5 ? 1.6 : 2.8)), P)); }
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    const d = -50 + ISO.clamp(volts / VMAX, 0, 1) * 100;
    out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, at(d, rr + 1.5), P)}" style="stroke-width:1.3"/>`, D([K.iso(c, P)], { size: 0.9, tone: "hi" }));
    for (const [dx, tint] of [[-10, ISO.T.plastic], [10, ISO.T.red]]) out.push(ISO.tinted(tint, S(K.cylinder(x + dx, y - 3, 2.4, 26, 3, P, 18), { tone: "hi" })));
    return out.join("");
  }
  // The AC supply: a case with a mains switch, a voltage knob and a pilot lamp.
  function supplySvg(P, on) {
    const B = SUP, out = [S(K.slabOf(B, 0, 30, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(B, 6, P, 3), { tone: "faint" }) })];
    const vents = [];
    for (let x = B.x + 6; x < B.x + B.w - 4; x += 5) vents.push(K.planOutline({ x, y: B.y + 4, w: 2, d: 10, r: 1 }, 30, P, 2));
    out.push(L(vents.join(""), { tone: "lo" }));
    out.push(S(K.cylinder(B.x + 9, B.y + 21, 4.4, 30, 3, P, 28, 0.4), { tone: "hi", inner: L(K.knurl(B.x + 9, B.y + 21, 4.4, 30, 33, 22, P, 0), { tone: "lo" }) }), L(K.lineOnTop([B.x + 9, B.y + 21], [B.x + 12.6, B.y + 19], 33, P), { tone: "hi", free: true }));
    out.push(ISO.tinted(on ? ISO.T.amber : ISO.T.glass, S(G.sphereOf([B.x + 30, B.y + 9, 31.5], 2.2, P), { tone: "hi" })));
    for (const [dx, tint] of [[22, ISO.T.plastic], [30, ISO.T.red]]) out.push(ISO.tinted(tint, S(K.cylinder(B.x + dx, B.y + B.d - 5, 2.2, 30, 3, P, 18), { tone: "hi" })));
    return out.join("");
  }
  function lampSvg(P, glow) {
    const [x, y] = [100, -36], out = [ISO.wbox(P, [x - 12, x + 12], [y - 10, y + 10], [0, 4], "mid")];
    out.push(S(K.cylinder(x, y, 5, 4, 6, P, 28, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 3.4, 10, 5, P, 24), { tone: "hi", inner: L(K.knurl(x, y, 3.4, 10, 15, 10, P, 0), { tone: "lo" }) })));
    const c = [x, y, 22];
    if (glow > 0.01) out.push(`<circle cx="${K.iso(c, P)[0].toFixed(1)}" cy="${K.iso(c, P)[1].toFixed(1)}" r="${(10 + 12 * glow).toFixed(1)}" fill="url(#tfglow)" opacity="${Math.min(1, glow).toFixed(2)}"/>`);
    out.push(ISO.tinted(glow > 0.35 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf(c, 6.5, P), { tone: "hi" })));
    return out.join("");
  }
  const wire = (P, pts, color) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#1d1f22" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` + D([K.iso(pts[0], P), K.iso(pts[pts.length - 1], P)], { size: 1, tone: "hi" });
  };
  const MP = [-34, 38], MS = [34, 38], SUP = { x: -118, y: -48, w: 36, d: 28, r: 3 };

  ISO.add({
    name: "transformer", title: "Transformer", compare: "transformer 480 270 400",
    about: "A bench transformer: laminated iron core, a 200-turn primary and a secondary of 400 (step up) or 100 (step down) turns, with a voltmeter on each side: Vs/Vp = Ns/Np.",
    line: "transformer cx cy height k=up|down vp=12 lab=1 lit=core|primary|secondary",
    demo: { line: "transformer 480 280 400", script: [{ set: { on: 1 }, hold: "settle" }, { set: { k: "down" }, hold: "settle" }, { set: { k: "up", vp: 6 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.02;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, Z1 + 4]], cx, cy, W, H, { azimuth: 62, elevation: 26 }, parent);
      const m = { k: o.k === "down" ? "down" : "up", vp: ISO.clamp(ISO.num(o, "vp", 12), 2, 15), on: o.on === "1" };
      const s = { v1: m.on ? m.vp : 0, v2: 0 };
      const ns = () => (m.k === "down" ? 100 : 400), vsOf = () => (m.on ? (m.vp * ns()) / NP : 0);
      s.v2 = vsOf();
      g.innerHTML = `<defs><radialGradient id="tfglow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd84a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient></defs>` +
        `<g>${ISO.baseboard(P, BOARD)}${ISO.plate(P, { x: 70, y: 32, w: 38, d: 12, r: 1.2 })}</g><g data-part="supply"></g><g data-part="lamp"></g>` +
        `<g>${coreSvg(P)}</g><g data-part="primary"></g><g data-part="secondary"></g><g>${terminalsSvg(P, -TX)}${terminalsSvg(P, TX)}</g><g data-part="wires"></g><g data-part="m1"></g><g data-part="m2"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const wiresSvg = () => {
        const [a, b] = pins(-TX), [c, d] = pins(TX), sp = [SUP.x + 22, SUP.y + SUP.d - 5, 33], sq = [SUP.x + 30, SUP.y + SUP.d - 5, 33];
        const coilLead = (cx0, y, sign, pin) => { const x = cx0 + sign * Math.sqrt(COIL.r ** 2 - y * y), z = COIL.z0 + 4; return wire(P, [[x, y, z], [pin[0], pin[1], z], pin], "#b87346"); };
        return coilLead(CXL, 16, -1, b) + coilLead(CXL, 11, -1, a) + coilLead(CXR, 4, 1, c) + coilLead(CXR, 12, 1, d) +
          wire(P, [sp, [sp[0], -14, 20], [a[0], -14, 16], a], "#1d1f22") + wire(P, [sq, [sq[0], -10, 22], [b[0] - 3, b[1], 18], b], "#c0392b") +
          wire(P, [a, [a[0] - 4, a[1] + 4, 16], [a[0] - 4, MP[1] - 3, 32], [MP[0] - 10, MP[1] - 3, 32], [MP[0] - 10, MP[1] - 3, 29]], "#1d1f22") + wire(P, [b, [b[0] + 2, b[1] + 8, 20], [MP[0] + 10, MP[1] - 3, 36], [MP[0] + 10, MP[1] - 3, 29]], "#c0392b") +
          wire(P, [c, [c[0] - 2, c[1] + 8, 20], [MS[0] - 10, MS[1] - 3, 36], [MS[0] - 10, MS[1] - 3, 29]], "#1d1f22") + wire(P, [d, [d[0] + 4, d[1] + 4, 16], [d[0] + 4, MS[1] - 3, 32], [MS[0] + 10, MS[1] - 3, 32], [MS[0] + 10, MS[1] - 3, 29]], "#c0392b") +
          wire(P, [c, [c[0] + 4, -18, 16], [96, -24, 12], [96, -24, 10]], "#1d1f22") + wire(P, [d, [d[0] + 10, 0, 18], [104, -24, 12], [104, -24, 10]], "#c0392b");
      };
      const wordsSvg = () => !lab ? "" : [
        ISO.word(K.iso([CXL, -COIL.fl, COIL.z1 + 4], P), `primary ${NP} turns`, "#6e3a1c", { size: 14, dy: -6, anchor: "end" }),
        ISO.word(K.iso([CXR + COIL.fl, 0, COIL.z1 + 4], P), `secondary ${ns()} turns`, "#6e3a1c", { size: 14, dy: -4, anchor: "start" }),
        ISO.word(K.iso([0, -HY, Z1], P), "laminated iron core", "#555", { size: 13, dy: -10 }),
        ISO.word(K.iso([MP[0], MP[1] + 10, 0], P), `in ${s.v1.toFixed(1)} V`, "#c0392b", { size: 14, dy: 18 }),
        ISO.word(K.iso([MS[0], MS[1] + 10, 0], P), `out ${s.v2.toFixed(1)} V`, "#c0392b", { size: 14, dy: 18 }),
        ISO.word(K.iso([SUP.x + 18, SUP.y, 30], P), "AC supply", "#555", { size: 13, dy: -12 }),
      ].join("");
      const draw = () => {
        w.rebuild(el.supply, String(m.on), () => supplySvg(P, m.on));
        w.rebuild(el.primary, "p", () => coilSvg(P, CXL, NP, "primary"));
        w.rebuild(el.secondary, m.k, () => coilSvg(P, CXR, ns(), "secondary"));
        w.rebuild(el.wires, "w", wiresSvg);
        w.rebuild(el.m1, s.v1.toFixed(2), () => meterSvg(P, MP, s.v1));
        w.rebuild(el.m2, s.v2.toFixed(2), () => meterSvg(P, MS, s.v2));
        w.rebuild(el.lamp, (s.v2 / 24).toFixed(2), () => lampSvg(P, s.v2 / 24));
        w.rebuild(el.words, `${m.k} ${s.v1.toFixed(1)} ${s.v2.toFixed(1)}`, wordsSvg);
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.on !== undefined) m.on = !!+p.on;
        if (p.k) m.k = p.k === "down" ? "down" : "up";
        if (p.vp !== undefined) m.vp = ISO.clamp(+p.vp, 2, 15);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), t1 = m.on ? m.vp : 0, t2 = vsOf();
        s.v1 = ISO.follow(s.v1, t1, dt, 0.35, calm); s.v2 = ISO.follow(s.v2, t2, dt, 0.35, calm);
        draw();
        return s.v1 !== t1 || s.v2 !== t2;
      };
      g.readout = () => !m.on ? "supply off · no changing flux in the core, so no output" :
        `Vs/Vp = Ns/Np = ${ns()}/${NP} · Vs = ${m.vp} V × ${ns() / NP} = ${vsOf().toFixed(1)} V (step ${m.k}) · the changing flux in the iron links both coils`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
