// "hydraulic cx cy width k=lift|press pumps=0 lab=1 lit=small|big|lever|oil" — a hydraulic jack on a bench.
// A hand lever (pivot at its end, ratio 4.5) pushes a small piston (bore 20 mm) down a glass cylinder of oil; the oil,
// through a check valve and a pipe, pushes up a big ram (bore 50 mm, 6.25× the area). The pressure is the same
// everywhere in the oil, so the ram's force is 6.25× the small piston's, and it moves 6.25× less far. Each lever stroke
// sucks oil from the reservoir on the way up and the check valve holds the ram. k=lift: the ram lifts a model car on a
// platform; k=press: it squeezes a wooden block against the crosshead of a press frame. set({ pumps }) strokes it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BASE = { x: -118, y: -40, w: 236, d: 80, r: 6 };
  const SX = -58, r1 = 6, BX = 42, r2 = 15, A1 = 314, A2 = 1963, RATIO = A2 / A1, LEV = 4.5, EFFORT = 100;
  const TOP1 = 66, STROKE = 15, ROD = 18, PIV = [-74, TOP1 - 4 + ROD - STROKE / 2], ARM = 16, HANDLE = 74, B0 = 52, Z0 = 6;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const OIL = ISO.T.amber, named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const glass = (P, x, r, z0, z1) => ISO.tinted(ISO.T.glass, S(K.cylinder(x, 0, r, z0, z1 - z0, P, 40), { tone: "hi", inner: L(K.sideArc(x, 0, r, (z0 + z1) / 2, P, 32), { tone: "faint" }) }));

  function staticSvg(P, k) {
    const out = [ISO.baseboard(P, BASE), ISO.plate(P, { x: -110, y: 24, w: 36, d: 11, r: 1 })];
    // reservoir with its filler cap, feeding the small cylinder through the inlet check valve
    out.push(ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -110, y: -32, w: 22, d: 22, r: 3 }, 0, 34, P, 3, 0.6), { tone: "hi", inner: L(K.sideSeam({ x: -110, y: -32, w: 22, d: 22, r: 3 }, 26, P, 3), { tone: "faint" }) })));
    out.push(S(K.cylinder(-99, -21, 4, 34, 3, P, 20, 0.3), { tone: "mid" }));
    // cylinder seats: a block under each cylinder with its bolts
    for (const [x, r] of [[SX, r1], [BX, r2]]) out.push(ISO.wbox(P, [x - r - 4, x + r + 4], [-r - 4, r + 4], [0, Z0], "mid"), D([K.iso([x - r - 1.5, r + 1.5, Z0], P), K.iso([x + r + 1.5, r + 1.5, Z0], P)], { size: 0.6 }));
    // pivot post for the lever
    out.push(ISO.wbox(P, [PIV[0] - 5, PIV[0] + 5], [-5, 5], [0, 3], "mid"), ISO.wbox(P, [PIV[0] - 2.5, PIV[0] + 2.5], [-3.5, -1.5], [3, PIV[1] + 3], "mid"));
    if (k === "press") for (const x of [BX - 26, BX + 26]) out.push(S(K.cylinder(x, 0, 2.8, Z0, 128 - Z0, P, 20), { tone: "mid", crease: "none" }), S(K.cylinder(x, 0, 4.4, 0, Z0, P, 24), { tone: "mid" }));
    return out.join("");
  }
  // The joining pipe at the bottom with the outlet check valve (a ball housing) and the release knob.
  function pipeSvg(P) {
    const F = xAx([0, 0, 10]), out = [S(G.disc(-110 + 22, SX - r1, 2.2, F, P), { tone: "mid", crease: "none" }), S(G.sphereOf([-80, 0, 10], 3.6, P), { tone: "mid" })];
    out.push(S(G.disc(SX + r1, BX - r2, 2.6, F, P), { tone: "hi", crease: "none" }), S(G.sphereOf([-30, 0, 10], 4.6, P), { tone: "hi" }));
    out.push(S(G.disc(0, 8, 1.4, yAx([10, 0, 10]), P), { tone: "mid" }), S(G.disc(8, 12, 3.2, yAx([10, 0, 10]), P), { tone: "hi", inner: L(G.ribsOf(yAx([10, 0, 10]), 8, 12, 3.2, 14, P, { seams: true }), { tone: "lo" }) }));
    return named("oil", out.join(""));
  }
  // One cylinder: glass tube, the oil column up to the piston, the piston, and its rod up to `rodTop`.
  function cylSvg(P, x, r, top, piston, rodR, rodTop, name) {
    const out = [`<g opacity=".85">${ISO.tinted(OIL, S(K.cylinder(x, 0, r - 0.8, Z0 + 1, piston - Z0 - 1, P, 36), { tone: "hi" }))}</g>`];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, 0, r - 0.8, piston, 3, P, 36), { tone: "hi" }) + S(K.cylinder(x, 0, rodR, piston + 3, rodTop - piston - 3, P, 24), { tone: "hi", crease: "none" })));
    out.push(L(K.ring(x, 0, r, top, P, 40), { tone: "mid" }));
    return named(name, out.join(""));
  }
  function capSvg(P, x, r, top) { return S(K.cylinder(x, 0, r + 1.8, top, 2.4, P, 40, 0.4), { tone: "mid" }) + S(K.cylinder(x, 0, r + 1.8, Z0, 2.4, P, 40), { tone: "mid" }); }
  function leverSvg(P, th) {
    const at = (u, w, y) => [PIV[0] + u * Math.cos(th) - w * Math.sin(th), y, PIV[1] + u * Math.sin(th) + w * Math.cos(th)];
    return named("lever", ISO.box(at, P, [-3, HANDLE], [-1.4, 1.4], [-1.4, 1.4], "hi") + ISO.tinted(ISO.T.rubber, ISO.box(at, P, [HANDLE - 16, HANDLE + 1], [-2.4, 2.4], [-2.4, 2.4], "hi")) +
      D([K.iso(at(0, 0, 1.5), P), K.iso(at(ARM, 0, 1.5), P)], { size: 1.1, tone: "hi" }));
  }
  // Lift: platform with a model car on it. Press: platen and the oak block, squashed to `h`.
  function loadSvg(P, k, h) {
    if (k === "press") {
      const out = [ISO.wbox(P, [BX - 18, BX + 18], [-14, 14], [0, 4], "mid")];
      out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [BX - 12, BX + 12], [-9, 9], [4, 4 + h], "hi") + L([0.3, 0.6].map((f) => K.sideSeam({ x: BX - 12, y: -9, w: 24, d: 18, r: 0 }, 4 + h * f, P, 1)).join(""), { tone: "lo" })));
      return out.join("");
    }
    const out = [ISO.wbox(P, [BX - 34, BX + 34], [-18, 18], [0, 3], "mid"), D([[-30, 14], [30, 14], [-30, -14], [30, -14]].map(([dx, dy]) => K.iso([BX + dx, dy, 3], P)), { size: 0.6 })];
    const body = [[-28, 7], [28, 7], [29, 16], [16, 18], [8, 27], [-12, 27], [-20, 18], [-29, 16]].map(([x, z]) => [BX + x, z]);
    const wheel = (x, y) => ISO.tinted(ISO.T.rubber, S(G.disc(-2.5, 2.5, 6, yAx([BX + x, y, 9]), P), { tone: "hi" })) + S(G.disc(-2.6, 2.6, 2.8, yAx([BX + x, y, 9]), P), { tone: "mid" });
    out.push(wheel(-18, -11), wheel(18, -11));
    out.push(ISO.prismY(P, body, -10, 10, ["#9fb4cc", "#dfe9f4"], "#c6d5e5", "#33506f"));
    out.push(ISO.prismY(P, [[BX - 10, 20], [BX + 6, 20], [BX + 9, 25.5], [BX - 9.5, 25.5]], 10, 10.3, ["#b9d4ea", "#eef6fb"], "#d9e8f3", "#5d7f96"));
    out.push(wheel(-18, 11), wheel(18, 11));
    return out.join("");
  }

  ISO.add({
    name: "hydraulic", title: "Hydraulic jack", compare: "hydraulic 480 290 480 k=lift",
    about: "A lever pumps a small piston; the same oil pressure pushes a big ram with 6.25× the area, so it lifts 6.25× the force but moves 6.25× less far.",
    line: "hydraulic cx cy width k=lift|press pumps=0 lab=1 lit=small|big|lever|oil",
    demo: { line: "hydraulic 480 290 480 k=lift", script: [{ set: { pumps: 1 }, hold: "settle" }, { set: { pumps: 4 }, hold: "settle" }, { set: { k: "press", pumps: 0 }, hold: 1 }, { set: { pumps: 3 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -12, 0), [BX, 0, 132], [PIV[0] + HANDLE, 0, PIV[1] + 30]], cx, cy, W, H, { azimuth: 62, elevation: 22 }, parent);
      const m = { k: o.k === "press" ? "press" : "lift" }, s = { p: 0, want: ISO.clamp(Math.round(ISO.num(o, "pumps", 0)), 0, 8) };
      s.p = s.want;
      g.innerHTML = `<g data-part="static"></g><g data-part="pipe">${pipeSvg(P)}</g><g data-part="c1"></g><g>${capSvg(P, SX, r1, TOP1 + 2)}</g><g data-part="lever"></g>` +
        `<g data-part="c2"></g><g>${capSvg(P, BX, r2, B0 + 2)}</g><g data-part="load"></g><g data-part="cross"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const GAP = 128 - (B0 + 22 + 4);                       // press: block fills the gap from platen to crosshead at rest
      // pose from the stroke count p: each stroke the small piston goes down then up; the ram rises on the down part
      const pose = () => {
        const n = Math.floor(s.p + 1e-9), f = s.p - n, down = f < 0.5 ? ISO.ease(f / 0.5) : 1 - ISO.ease((f - 0.5) / 0.5);
        const rise = (n + (f < 0.5 ? ISO.ease(f / 0.5) : 1)) * (STROKE / RATIO);
        return { z1: TOP1 - 4 - STROKE * down, rise };
      };
      const draw = () => {
        const { z1, rise } = pose(), rodTop = z1 + ROD, th = Math.asin(ISO.clamp((rodTop - PIV[1]) / ARM, -1, 1));
        const zb = B0 - 10 + rise, plat = B0 + 22 + rise;
        w.rebuild(el.static, m.k, () => staticSvg(P, m.k));
        w.rebuild(el.c1, z1.toFixed(2), () => cylSvg(P, SX, r1, TOP1 + 2, z1, 1.6, rodTop, "small") + glassTop(SX, r1, TOP1 + 2));
        w.rebuild(el.lever, th.toFixed(4), () => leverSvg(P, th));
        w.rebuild(el.c2, zb.toFixed(2), () => cylSvg(P, BX, r2, B0 + 2, zb, 11, plat, "big") + glassTop(BX, r2, B0 + 2));
        w.rebuild(el.load, m.k === "press" ? `p ${rise.toFixed(2)}` : "lift", () => `<g>${loadSvg(P, m.k, GAP - rise)}</g>`);
        w.attr(el.load.firstChild, "transform", K.translateAlong(P, [0, 0, plat]));
        w.rebuild(el.cross, m.k, () => m.k === "press" ? ISO.wbox(P, [BX - 32, BX + 32], [-8, 8], [128, 136], "mid") + D([K.iso([BX - 26, 8, 132], P), K.iso([BX + 26, 8, 132], P)], { size: 0.9 }) : "");
        w.rebuild(el.words, `${m.k} ${s.p.toFixed(0)}`, () => !lab ? "" : [
          ISO.word(K.iso([SX, 0, Z0], P), "small piston", "#555", { size: 14, dy: 34, anchor: "end" }),
          ISO.word(K.iso([BX + r2, 0, Z0], P), m.k === "press" ? "big ram presses" : "big ram lifts", "#555", { size: 14, dy: 26, anchor: "start" }),
          ISO.word(K.iso([PIV[0], 0, PIV[1] + 6], P), "lever", "#555", { size: 14, anchor: "end", dy: -4 }),
          ISO.word(K.iso([-99, -21, 37], P), "oil tank", "#555", { size: 13, dy: -8 }),
        ].join(""));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((q) => q.dataset.name === lit));
      };
      const glassTop = (x, r, top) => "";
      g.set = (p) => {
        if (p.k && (p.k === "press" ? "press" : "lift") !== m.k) { m.k = p.k === "press" ? "press" : "lift"; s.p = 0; s.want = 0; }
        if (p.pumps !== undefined) s.want = ISO.clamp(Math.round(+p.pumps), 0, 8);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const rate = dt / 1.3;
        s.p = ISO.still() || Math.abs(s.want - s.p) <= rate ? s.want : s.p + Math.sign(s.want - s.p) * (s.want < s.p ? rate * 4 : rate);
        draw();
        return s.p !== s.want;
      };
      g.readout = () => {
        const F1 = EFFORT * LEV, p = F1 / A1, F2 = p * A2, strokes = Math.floor(s.p + 1e-9);
        return `${EFFORT} N on the lever ×${LEV} = ${F1} N on the small piston · pressure ${p.toFixed(2)} N/mm² (${(p * 10).toFixed(1)} bar), the same everywhere in the oil · ram force ${(F2 / 1000).toFixed(2)} kN (×${RATIO.toFixed(2)}) · each 15 mm stroke lifts the ram ${(STROKE / RATIO).toFixed(1)} mm (÷${RATIO.toFixed(2)}) · ${strokes} stroke${strokes === 1 ? "" : "s"}`;
      };
      // glass tubes are static: drawn once over their oil and pistons
      el.c1.insertAdjacentHTML("beforebegin", `<g>${glass(P, SX, r1, Z0, TOP1 + 2)}</g>`);
      el.c2.insertAdjacentHTML("beforebegin", `<g>${glass(P, BX, r2, Z0, B0 + 2)}</g>`);
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
