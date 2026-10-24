// "toilettank cx cy height k=ok|running lab=1 lit=…" — a toilet tank with its front cut away, on the bowl's deck.
// Inside: the fill valve with its float cup on the right, the overflow tube with the refill tube clipped into it, the
// flush valve seat with the flapper hinged on the overflow tube's ears, and the chain up to the trip lever, whose
// shaft goes through the front wall to the handle. set({ flush: 1 }) presses the handle: the lever lifts the flapper,
// the tank drains through the seat (Torricelli: speed ∝ √depth), the flapper floats open until the water is nearly
// down to it and then drops shut; the float cup falls with the water, which opens the fill valve, and rises again
// until it shuts the valve at the fill line. k=running: the flapper doesn't seal, water trickles past it, and the
// float keeps the valve open a little. Refill is shown 6× faster than real. Local helper: pipe (refill tube).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Inside 40 × 15 cm (600 cm², so 1 cm of depth = 0.6 L), walls 1.2 thick.
  const IN = { x0: -20, x1: 20, y0: -7.5, y1: 7.5 }, WT = 1.2, TOP = 31, FILL = 23.5, CLOSE = 6.5;
  const AREA = (IN.x1 - IN.x0) * (IN.y1 - IN.y0);
  const SEAT = [3, 0.5], OVER = [3, -5.2], HINGE = { y: -2.9, z: 3.2 }, FLAP_R = 3.6;
  const VALVE = [14, 1], SHAFT = { x: -16, z: 26 }, LEVER = 20, LEVER_Y = 4.2;
  const FAST = 6, FILL_RATE = 0.28 * FAST, DRAIN_K = 0.95;     // a real fill valve gives ~10 L/min (0.28 cm/s here)
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const C = { water: "#7fb7ea", waterInk: "#2b6cc4", flap: ISO.T.red };

  // The flapper: a disc hinged on an x-axis line at the back of the seat, swung open by a (radians).
  const onFlap = (a, v, w) => [SEAT[0], HINGE.y + v * Math.cos(a) - w * Math.sin(a), HINGE.z + v * Math.sin(a) + w * Math.cos(a)];
  const leverTip = (b) => [SHAFT.x + LEVER * Math.cos(b), LEVER_Y, SHAFT.z + LEVER * Math.sin(b)];
  // A pipe along straight legs with ball elbows (the refill tube).
  function pipe(P, pts, r, style) {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], d = b.map((v, k) => v - a[k]), l = Math.hypot(...d);
      out.push(S(G.disc(0, l, r, G.frameAlong(a, d.map((v) => v / l)), P), style));
      if (i + 2 < pts.length) out.push(S(G.sphereOf(b, r * 1.25, P), style));
    }
    return out.join("");
  }

  function backSvg(P) {
    const out = [], deck = { x: -22, y: -11, w: 44, d: 22, r: 4 };
    out.push(`<path class="iso-halo" d="${K.haloOf(deck, -9, 9, P)}"/>`, S(K.slabOf(deck, -9, 7.8, P, 6, 1), { tone: "lo", inner: L(K.sideSeam(deck, -5, P, 6), { tone: "faint" }) }));
    out.push(S(K.slabOf({ x: -16, y: -8, w: 32, d: 16, r: 2 }, -1.2, 1.2, P, 4), { tone: "mid" }));
    // Back wall, floor and left wall of the tank (ceramic), and the fill line on the back wall.
    out.push(ISO.wbox(P, [IN.x0 - WT, IN.x1 + WT], [IN.y0 - WT, IN.y0], [0, TOP], "mid"), ISO.wbox(P, [IN.x0, IN.x1], [IN.y0, IN.y1 + WT], [0, WT], "mid"));
    out.push(ISO.wbox(P, [IN.x0 - WT, IN.x0], [IN.y0, IN.y1 + WT], [0, TOP], "mid"));
    out.push(ISO.seam(P, [[IN.x0, IN.y0, FILL], [IN.x1, IN.y0, FILL]], "#7fa4c8", 0.8));
    // Tank bolts through the floor.
    for (const x of [-10, 10]) out.push(S(K.cylinder(x, 3.5, 1.5, WT, 0.6, P, 6), { tone: "mid" }), S(K.cylinder(x, 3.5, 0.7, WT + 0.6, 1, P, 14), { tone: "mid" }));
    // Overflow tube on the flush valve body, its hinge ears and the fill-line mark.
    const O = up(OVER[0], OVER[1], WT);
    out.push(`<g data-name="overflow">${S(G.disc(0, 26 - WT, 1.6, O, P), { tone: "hi", inner: L(G.arcOf(O, FILL - WT, 1.6, P), { tone: "lo" }) })}${S(G.ringBand(26 - WT - 0.6, 26 - WT, 1.2, 1.8, O, P), { tone: "hi" })}</g>`);
    for (const x of [OVER[0] - 2.2, OVER[0] + 1.6]) out.push(ISO.wbox(P, [x, x + 0.6], [OVER[1] + 0.8, HINGE.y + 0.6], [HINGE.z - 0.8, HINGE.z + 0.8], "mid"));
    // Flush valve seat: a ring on the floor round the drain.
    const SF = up(SEAT[0], SEAT[1], WT);
    out.push(S(G.ringBand(0, 1.2, FLAP_R - 0.8, FLAP_R + 0.4, SF, P), { tone: "mid" }), `<path d="${G.circleOf(SF, 1.2, FLAP_R - 0.8, P)}" fill="#3a3e44"/>`);
    return out.join("");
  }
  function flapperSvg(P, a, gap) {
    const n = [0, -Math.sin(a), Math.cos(a)], c = onFlap(a, 2.9 + 0.2, 0.3), F = G.frameAlong(c, n), out = [];
    out.push(ISO.tinted(C.flap, S(G.disc(-0.4, 0.4, FLAP_R, F, P), { tone: "hi" }) + S(G.disc(0.4, 1.6, 2.2, F, P), { tone: "hi" })));
    // The arms back to the hinge ears and the lug at the front for the chain.
    out.push(ISO.tinted(C.flap, ISO.poly([[-1.6, 0, 0], [1.6, 0, 0], [1.6, 2.9, 0], [-1.6, 2.9, 0], [-1.6, 0, 0.5], [1.6, 0, 0.5], [1.6, 2.9, 0.5], [-1.6, 2.9, 0.5]].map(([u, v, w]) => { const p = onFlap(a, v, w); return [p[0] + u, p[1], p[2]]; }), ISO.BOX_F, P, "hi")));
    const lug = onFlap(a, 2.9 + 0.2 + FLAP_R - 0.4, 0.4);
    out.push(S(G.sphereOf(lug, 0.55, P), { tone: "hi" }));
    if (gap > 0.01) out.push(`<path d="${K.pathOf([onFlap(a, 2.9 + 0.2 + FLAP_R, -0.4), [SEAT[0], SEAT[1] + FLAP_R - 0.4, WT + 0.4]].map((p) => K.iso(p, P)))}" stroke="${C.waterInk}" stroke-width="1.2" stroke-dasharray="1.5 1.5" opacity="${Math.min(1, gap)}"/>`);
    return out.join("");
  }
  // The fill valve: shank, body and head (static), the float cup on its rod (moves), and the jet while it is open.
  const HEAD = 26.5;
  function valveSvg(P) {
    const [x, y] = VALVE;
    return S(G.disc(0, HEAD - WT, 1.3, up(x, y, WT), P), { tone: "mid", crease: "none" }) + S(G.disc(0, 1.2, 2.4, up(x, y, WT), P), { tone: "mid" }) +
      S(G.disc(0, 3, 2.8, up(x, y, HEAD), P), { tone: "mid" }) + S(G.disc(3, 3.8, 2.2, up(x, y, HEAD), P), { tone: "mid" }) +
      S(K.cylinder(x + 2.4, y, 0.8, HEAD + 2.2, 1, P, 12), { tone: "mid" }) +
      pipe(P, [[x - 2.8, y, HEAD + 1.6], [OVER[0], y, HEAD + 1.6], [OVER[0], OVER[1], HEAD + 1.6], [OVER[0], OVER[1], 26.2]], 0.45, { tone: "mid" });
  }
  // The cup built at rest with its top at the fill line; it moves down with the water by translation.
  const CUP_REST = FILL - 2;
  const cupSvg = (P) => { const [x, y] = VALVE, cup = up(x, y, CUP_REST); return `<g data-name="float">${S(G.disc(0, 4, 3, cup, P), { tone: "hi", inner: L(G.arcOf(cup, 2, 3, P), { tone: "faint" }) })}` +
    `${S(G.disc(4, HEAD + 2.2 - CUP_REST, 0.35, G.frameAlong([x + 2.4, y, CUP_REST], [0, 0, 1]), P), { tone: "mid" })}</g>`; };
  function jetSvg(P, open, clock) {
    if (open < 0.02) return "";
    const [x, y] = VALVE, o = (clock * 18) % 4, a = K.iso([x - 1.4, y + 1.2, WT + 1.4], P), b = K.iso([x - 5, y + 2.6, WT + 0.4], P);
    return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${C.waterInk}" stroke-width="${(0.6 + open).toFixed(2)}" stroke-dasharray="2 2" stroke-dashoffset="${-o}" opacity=".8"/>`;
  }
  // Trip lever on its shaft, and the chain from its tip down to the flapper's lug (slack hangs in a loop).
  function leverSvg(P, b, a) {
    const tip = leverTip(b), out = [];
    const F = G.frameAlong([SHAFT.x, LEVER_Y, SHAFT.z], [Math.cos(b), 0, Math.sin(b)]);
    out.push(`<g data-name="lever">${ISO.tinted(ISO.T.steel, S(G.prismOf(F, [[-0.9, -0.3], [0.9, -0.3], [0.9, 0.3], [-0.9, 0.3]], 0, LEVER, P), { tone: "hi" }) +
      S(G.disc(-1.2, 0, 1.4, G.frameAlong([SHAFT.x, LEVER_Y, SHAFT.z], [0, 1, 0]), P), { tone: "mid" }))}</g>`);
    const lug = onFlap(a, 2.9 + 0.2 + FLAP_R - 0.4, 0.4), len = 17.5, gapZ = tip[2] - lug[2], sag = Math.max(0, len - Math.hypot(tip[0] - lug[0], tip[1] - lug[1], gapZ));
    const pts = [], n = 26;
    for (let i = 0; i <= n; i++) { const f = i / n; pts.push(K.iso([tip[0] + (lug[0] - tip[0]) * f + Math.sin(f * Math.PI) * sag * 0.35, tip[1] + (lug[1] - tip[1]) * f, tip[2] + (lug[2] - tip[2]) * f], P)); }
    out.push(`<g data-name="chain">${D(pts, { size: 0.55, tone: "hi" })}</g>`);
    return out.join("");
  }
  function frontSvg(P, lab) {
    const out = [];
    // The right wall (nearer than everything inside) and the piece of front wall left round the handle.
    out.push(ISO.wbox(P, [IN.x1, IN.x1 + WT], [IN.y0, IN.y1 + WT], [0, TOP], "mid"));
    out.push(ISO.wbox(P, [IN.x0 - WT, -12], [IN.y1, IN.y1 + WT], [0, TOP], "mid"));
    return out.join("");
  }
  const handleSvg = (P, b) => {
    const F = G.frameAlong([SHAFT.x, IN.y1 + WT, SHAFT.z], [0, 1, 0]), arm = G.frameAlong([SHAFT.x, IN.y1 + WT + 1.6, SHAFT.z], [-Math.cos(b * 0.8), 0, -Math.sin(b * 0.8)]);
    return `<g data-name="handle">${ISO.tinted(ISO.T.steel, S(G.disc(0, 0.6, 2.4, F, P), { tone: "hi" }) + S(G.disc(0.6, 2.2, 1.2, F, P), { tone: "hi" }) +
      S(G.prismOf(arm, [[-0.9, -0.6], [0.9, -0.6], [0.9, 0.6], [-0.9, 0.6]], 0, 6, P), { tone: "hi" }))}</g>`;
  };
  const waterSvg = (P, h) => {
    if (h < 0.05) return "";
    const z = WT + h, at = (x, y, zz) => K.iso([x, y, zz], P);
    const top = [at(IN.x0, IN.y0, z), at(IN.x1, IN.y0, z), at(IN.x1, IN.y1, z), at(IN.x0, IN.y1, z)];
    const front = [at(IN.x0, IN.y1, WT), at(IN.x1, IN.y1, WT), at(IN.x1, IN.y1, z), at(IN.x0, IN.y1, z)];
    return `<path d="${K.pathOf(front, true)}" fill="${C.water}" opacity=".32"/><path d="${K.pathOf(top, true)}" fill="${C.water}" opacity=".2"/>` +
      `<path d="${K.pathOf([top[3], top[2], top[1]])}" fill="none" stroke="${C.waterInk}" stroke-width="0.8" opacity=".8"/>`;
  };

  ISO.add({
    name: "toilettank", title: "Toilet tank", compare: "toilettank 480 270 340",
    about: "Toilet tank cut open: fill valve and float cup, overflow tube, flapper on its chain to the trip lever and handle. A flush lifts the flapper; the float falls, opens the fill valve, and shuts it at the fill line.",
    line: "toilettank cx cy height k=ok|running lab=1 lit=flapper|float|overflow|chain|lever|handle",
    demo: { line: "toilettank 480 270 340", script: [{ set: {}, hold: 1 }, { set: { flush: 1, lit: "flapper" }, hold: 3.2 }, { set: { lit: "float" }, hold: "settle" }, { set: { k: "running", lit: "flapper" }, hold: 5 }] },
    make([cx, cy, height = 340], o, t, parent) {
      const lab = o.lab !== "0", W = height * 1.75, H = height * 1.2;
      const pts = [[-22, -11, -9], [22, -11, -9], [-22, 11, -9], [22, 11, -9], [IN.x0 - WT, IN.y0 - WT, TOP], [IN.x1 + WT, IN.y0 - WT, TOP], [IN.x1 + WT, IN.y1 + WT, TOP], [SHAFT.x, IN.y1 + 8, SHAFT.z]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 62, elevation: 24 }, parent);
      g.innerHTML = `<g>${backSvg(P)}</g><g data-name="flapper"></g><g>${valveSvg(P)}</g><g data-part="cup">${cupSvg(P)}</g><g data-part="jet"></g><g data-part="lever"></g><g data-part="water"></g><g>${frontSvg(P, lab)}</g><g data-part="handle"></g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), flap = g.querySelector('[data-name="flapper"]'), w = ISO.writer();
      const s = { h: FILL - WT, a: 0, b: -0.05, press: 0, open: 0, running: o.k === "running", clock: 0, flushed: 0, lit: o.lit || "", stage: "full" };
      if (lab) {
        const word = (p, txt, anchor = "start", dy = 4) => { const a = K.iso(p, P); return ISO.word(a, txt, "#444", { anchor, size: 12, dy }); };
        q("words").innerHTML = word([IN.x1 + WT + 1, IN.y1, 14], "Float") + word([VALVE[0], VALVE[1], HEAD + 4], "Fill valve", "middle", -8) + word([OVER[0] - 3, OVER[1], 30], "Overflow tube", "end", -2) +
          word([IN.x0 + 0.5, IN.y0, FILL + WT], "Fill line", "start", -4) + word([SHAFT.x - 3, IN.y1 + WT, SHAFT.z + 3], "Handle", "end") + word([SEAT[0], IN.y1 + WT, 0], "Flapper", "middle", 18);
      }
      // Float cup: it rests on the water (floats about half its 5 cm height) and stops on the valve body at the
      // bottom of its travel. The valve shuts when the cup's rod lifts the head lever at the fill line.
      const cupOf = (h) => ISO.clamp(WT + h - 2, WT + 1.4, CUP_REST);
      const openOf = (h) => ISO.clamp((FILL - WT - h) / 1.2, 0, 1);
      const draw = () => {
        w.rebuild(flap, `${s.a.toFixed(3)} ${s.running}`, () => flapperSvg(P, s.a, s.running && s.a < 0.2 ? 1 : 0));
        w.attr(q("cup"), "transform", K.translateAlong(P, [0, 0, cupOf(s.h) - CUP_REST]));
        w.rebuild(q("jet"), s.open > 0.02 ? s.clock.toFixed(2) : "", () => jetSvg(P, s.open, s.clock));
        w.rebuild(q("lever"), `${s.b.toFixed(3)} ${s.a.toFixed(3)}`, () => leverSvg(P, s.b, s.a));
        w.rebuild(q("water"), s.h.toFixed(2), () => waterSvg(P, s.h));
        w.rebuild(q("handle"), s.b.toFixed(3), () => handleSvg(P, s.b));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => {
        if (p.flush) { s.press = 0.9; s.stage = "press"; s.flushed = 0; }
        if (p.k !== undefined) s.running = p.k === "running";
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.clock += dt;
        if (calm && s.stage !== "full") { s.h = FILL - WT; s.a = s.running ? 0.07 : 0; s.b = -0.05; s.stage = "full"; s.press = 0; }
        const before = [s.h, s.a, s.b];
        // Handle held for 0.9 s: the lever's tip rises 7 cm and the chain pulls the flapper up past its float point.
        s.press = Math.max(0, s.press - dt);
        s.b = ISO.follow(s.b, s.press > 0 ? 0.33 : -0.05, dt, 0.12, calm);
        if (s.press > 0) s.a = Math.max(s.a, ISO.clamp((s.b + 0.05) / 0.38, 0, 1) * 1.25);
        else if (s.stage === "press") s.stage = "drain";
        // The flapper floats open while there is water over it; when the level falls near it, it drops shut.
        const rest = s.running ? 0.07 : 0;
        if (s.stage === "drain" && s.h < CLOSE - WT) s.stage = "refill";
        if (s.stage === "refill" || s.stage === "full") s.a = ISO.follow(s.a, rest, dt, 0.08, calm);
        // Outflow through the seat while open (Torricelli), a trickle if it doesn't seal; inflow while the float is down.
        const outRate = s.a > 0.3 ? DRAIN_K * Math.sqrt(Math.max(0, s.h)) * 2.2 : s.running ? 0.05 * FAST : 0;
        s.open = openOf(s.h);
        s.h = Math.max(0, s.h + (s.open * FILL_RATE - outRate) * dt);
        if (s.stage !== "full" && s.a <= rest + 1e-3 && s.open < 1e-3 && s.press === 0) s.stage = "full";
        if (s.stage === "drain" || s.stage === "press") s.flushed = Math.max(s.flushed, (FILL - WT - s.h) * AREA / 1000);
        draw();
        return s.stage !== "full" || Math.abs(before[0] - s.h) > 1e-4 || Math.abs(before[1] - s.a) > 1e-4 || Math.abs(before[2] - s.b) > 1e-4;
      };
      g.readout = () => {
        const litres = ((s.h) * AREA / 1000).toFixed(1);
        if (s.stage === "press") return "handle pressed · lever lifts the flapper by its chain";
        if (s.stage === "drain") return `flapper floats open · tank draining into the bowl · ${litres} L left`;
        if (s.stage === "refill") return `flapper shut · float down, fill valve open · refilling (${FAST}× faster) · ${litres} L`;
        if (s.running) return `flapper not sealing · water trickles into the bowl · fill valve keeps topping up · ${(s.open * 10).toFixed(1)} L/min`;
        return `full at the fill line · ${litres} L in the tank · float up, fill valve shut${s.flushed ? ` · last flush ${s.flushed.toFixed(1)} L` : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
