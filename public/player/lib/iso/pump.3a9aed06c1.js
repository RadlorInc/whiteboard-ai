// "pump cx cy size spin=1 lab=1 lit=impeller|motor|casing" — an end-suction centrifugal pump on its bedplate.
// A ribbed electric motor drives, through a flexible coupling and a bearing pedestal, an open impeller inside a volute
// casing whose front cover is off, so you see the six backward-curved vanes. Water comes in along the axis into the
// eye, the vanes fling it outward, and the widening spiral (volute) slows it and turns speed into pressure before the
// outlet on top. spin=1 runs it: dashes march in at the eye, round the spiral and up the outlet.
// Model: 1450 rpm, impeller Ø 240 mm → tip speed u = ωr ≈ 18 m/s; ideal head ≈ u²/2g ≈ 17 m. World units: 5 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const AXZ = 56, RPM = 1450, RI = 24, SHOWN = 0.9;                      // shown turning at 0.9 rev/s
  const PLINTH = { x: -140, y: -60, w: 206, d: 120, r: 4 }, BED = { x: -134, y: -24, w: 168, d: 48, r: 2 };
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const rIn = (th) => 30 + (11 * th) / (Math.PI * 2);                    // the volute's inner wall widens round the turn
  const yz = (r, th) => [-r * Math.cos(th), AXZ + r * Math.sin(th)];   // the spiral discharges on the −y side
  const STEEL = ISO.T.steel, BLUE = ISO.T.blue, NOZ = [10, -36];
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const hex = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r]);
  const flange = (P, F, s0, s1, r, n, tone = "mid") => S(G.disc(s0, s1, r, F, P), { tone }) + D(G.dotsOf(F, s1, r * 0.74, n, P, { fade: [0.04, 0.42] }), { size: 0.6 });

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(PLINTH, -20, 20, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(PLINTH, -20, 14, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(PLINTH, -12, P, 4), { tone: "faint" }) }))];
    out.push(S(K.slabOf(BED, -6, 6, P, 2, 0.6), { tone: "mid", inner: L(K.sideSeam(BED, -3, P, 2), { tone: "faint" }) }));
    const bolts = K.corners(BED, 6).concat([[-60, BED.y + 6], [-60, BED.y + BED.d - 6]]);
    out.push(L(bolts.map(([x, y]) => K.ring(x, y, 2.4, 0, P, 14)).join(""), { tone: "lo" }), ...bolts.map(([x, y]) => S(G.prismOf(zAx([x, y, 0]), hex(1.8), 0, 1.6, P), { tone: "mid" })));
    return out.join("");
  }
  function motorSvg(P) {
    const F = xAx([-128, 0, AXZ]), out = [];
    for (const x of [-118, -70]) out.push(ISO.wbox(P, [x, x + 14], [-20, 20], [0, AXZ - 18], "mid"), D([K.iso([x + 4, 16, 0.2], P), K.iso([x + 10, 16, 0.2], P)], { size: 0.6 }));
    out.push(ISO.tinted(ISO.T.paint, S(G.solidOf([[0, 18], [2, 21, 1], [14, 21], [14, 22], [72, 22], [72, 20], [78, 19, 1], [79, 12]], F, P), { tone: "hi" }) +
      K.fadedSvg(G.ribsOf(F, 14, 72, 22.05, 30, P, { fade: [0.1, 0.5] }), { tone: "lo" }) +
      K.fadedSvg(G.ribsOf(F, 3, 13, 21.05, 30, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" })));
    // terminal box with its lid and cable gland
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [-98, -80], [-10, 10], [AXZ + 20, AXZ + 32], "hi") + ISO.wbox(P, [-99, -79], [-11, 11], [AXZ + 32, AXZ + 34], "hi")));
    out.push(S(G.disc(0, 4, 3, yAx([-89, 10, AXZ + 26]), P), { tone: "mid" }));
    // shaft and the flexible coupling (two hubs, a rubber spider between)
    out.push(S(G.disc(79, 92, 3, F, P), { tone: "mid" }));
    const Fc = xAx([-36, 0, AXZ]);
    out.push(S(G.disc(0, 6, 10, Fc, P), { tone: "mid" }), ISO.tinted(ISO.T.rubber, S(G.disc(6, 8, 8.4, Fc, P), { tone: "hi" })), S(G.disc(8, 14, 10, Fc, P), { tone: "mid" }), D(G.dotsOf(Fc, 14, 7, 6, P, { fade: [0.04, 0.42] }), { size: 0.6 }));
    return named("motor", out.join(""));
  }
  function pedestalSvg(P) {
    const out = [ISO.wbox(P, [-20, -6], [-14, 14], [0, AXZ - 9], "mid")], F = xAx([-22, 0, AXZ]);
    out.push(S(G.solidOf([[0, 7], [2, 10], [18, 10], [20, 8], [22, 3]], F, P), { tone: "mid", inner: L(G.arcOf(F, 9, 10, P), { tone: "faint" }) }));
    out.push(S(K.cylinder(-13, 0, 2.6, AXZ + 9.6, 3, P, 18), { tone: "hi" }));
    return out.join("");
  }
  // The volute: back plate (the whole outline), then the spiral wall split into the half under the impeller (drawn
  // before it) and the half over it (after it), with bolt holes round the open front rim.
  const band = (th0, th1) => {
    const n = 40, outer = [], inner = [];
    for (let i = 0; i <= n; i++) { const th = th0 + ((th1 - th0) * i) / n; outer.push(yz(rIn(th) + 3, th)); inner.push(yz(rIn(th), th)); }
    return [...outer, ...inner.reverse()];
  };
  const CAST = ["#8d9096", "#d3d5d9"];
  function casingBackSvg(P) {
    const sil = []; for (let i = 0; i <= 48; i++) sil.push(yz(rIn((Math.PI * 2 * i) / 48) + 3, (Math.PI * 2 * i) / 48));
    const out = [ISO.wbox(P, [-2, 18], [-16, 16], [0, AXZ - 41], "mid")];
    out.push(ISO.prismX(P, sil, -2, 2, CAST, "#b9bcc1", "#3c3f45"));
    out.push(ISO.prismX(P, band(Math.PI * 0.95, Math.PI * 2), 2, 18, CAST, "#c7c9cd", "#3c3f45"));
    return out.join("");
  }
  function casingFrontSvg(P) {
    const out = [ISO.prismX(P, band(0.02, Math.PI * 0.97), 2, 18, CAST, "#c7c9cd", "#3c3f45")];
    const holes = []; for (let i = 0; i < 14; i++) { const th = 0.3 + (i / 14) * Math.PI * 1.85; const [y, z] = yz(rIn(th) + 1.5, th); holes.push(K.iso([18, y, z], P)); }
    out.push(D(holes, { size: 0.55, tone: "lo" }));
    // the outlet nozzle rising tangentially off the end of the spiral, its flange and the riser pipe
    const Fn = zAx([NOZ[0], NOZ[1], AXZ]);
    out.push(S(G.disc(0, 50, 7, Fn, P), { tone: "mid", crease: "none" }), flange(P, Fn, 50, 53, 12, 8), flange(P, Fn, 53, 56, 12, 8, "hi"));
    out.push(S(G.disc(56, 84, 7, Fn, P), { tone: "hi" }), flange(P, Fn, 84, 87, 12, 8, "hi"), `<path d="${G.circleOf(Fn, 87, 6.4, P)}" fill="#3a5a7a"/>`);
    return named("casing", out.join(""));
  }
  // Six backward-curved vanes on the back shroud, turned by angle a; each vane a strip between its back edge (x = 5)
  // and its front edge (x = 14), painted far to near.
  function impellerSvg(P, a) {
    const blades = [];
    for (let i = 0; i < 6; i++) {
      const pts = (x) => Array.from({ length: 7 }, (_, j) => { const r = 7 + (16 * j) / 6, ph = a + (i * Math.PI) / 3 - 0.95 * (j / 6); return [x, r * Math.cos(ph), AXZ + r * Math.sin(ph)]; });
      const f = pts(14), b = pts(5), mid = f[3];
      const nrm = Math.sin(a + (i * Math.PI) / 3 - 0.45);
      blades.push({ k: K.depthOf(mid, P), d: K.pathOf([...f, ...b.reverse()].map((p) => K.iso(p, P)), true), fill: `color-mix(in srgb, #e6e8eb ${Math.round(60 + 35 * nrm)}%, #8d9096)`, edge: K.pathOf(f.map((p) => K.iso(p, P))) });
    }
    blades.sort((p, q) => p.k - q.k);
    return blades.map((b) => `<path d="${b.d}" fill="${b.fill}" stroke="#3c3f45" stroke-width="0.7" stroke-linejoin="round"/><path d="${b.edge}" fill="none" stroke="#2f343a" stroke-width="1"/>`).join("");
  }
  // Suction: a short stub into the eye, an elbow, and the pipe down from the sump flange in the plinth.
  function inletSvg(P) {
    const F = xAx([0, 0, AXZ]), Fz = zAx([37, 0, 0]), out = [];
    out.push(S(G.disc(-6, -3, 13, Fz, P), { tone: "mid" }), S(G.disc(-3, AXZ - 9, 7, Fz, P), { tone: "hi" }), flange(P, Fz, 6, 9, 11, 8, "hi"));
    out.push(S(G.sphereOf([37, 0, AXZ], 9.5, P), { tone: "hi" }));
    out.push(S(G.disc(18, 28.5, 7, F, P), { tone: "hi" }), S(G.disc(18, 20, 8.4, F, P), { tone: "mid" }));
    return named("inlet", out.join(""));
  }
  const flowD = (P) => {
    const run = [[37, 0, 2], [37, 0, AXZ], [10, 0, AXZ]];
    for (let i = 0; i <= 40; i++) { const th = (Math.PI * 2 * i) / 40, r = (RI + rIn(th)) / 2 + 1; const [y, z] = yz(r, th); run.push([10, y, z]); }
    run.push([NOZ[0], NOZ[1], AXZ + 30], [NOZ[0], NOZ[1], AXZ + 88]);
    return K.pathOf(run.map((p) => K.iso(p, P)));
  };
  const style = `<style>.pm-flow path{stroke-dasharray:4 8;opacity:0}.pm-flow[data-on="1"] path{opacity:1;animation:pm-flow .8s linear infinite}@keyframes pm-flow{to{stroke-dashoffset:-24}}@media (prefers-reduced-motion:reduce){.pm-flow path{animation:none}}</style>`;

  ISO.add({
    name: "pump", title: "Centrifugal pump", compare: "pump 480 280 400 spin=1",
    about: "An end-suction centrifugal pump with its front cover off: the motor turns the impeller, water enters at the eye, is flung round the volute and leaves at the top.",
    line: "pump cx cy size spin=1 lab=1 lit=impeller|motor|casing|inlet",
    demo: { line: "pump 480 280 400", script: [{ set: { spin: 1 }, hold: 4 }, { set: { lit: "impeller" }, hold: 2.5 }, { set: { spin: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.7, H = size * 1.08;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -20, 0), [NOZ[0], NOZ[1], AXZ + 88], [-128, 0, AXZ + 34]], cx, cy, W, H, { azimuth: 36, elevation: 24 }, parent);
      const s = { w: 0, a: 0, on: o.spin === "1" };
      if (s.on) s.w = 1;
      const words = !lab ? "" : [
        ISO.word(K.iso([-96, 0, AXZ + 34], P), "motor", "#555", { size: 15, dy: -10 }),
        ISO.word(K.iso([NOZ[0], NOZ[1], AXZ + 88], P), "outlet", "#2b6cc4", { size: 15, dy: -12 }),
        ISO.word(K.iso([37, 0, -6], P), "inlet to the eye", "#2b6cc4", { size: 15, anchor: "start", dy: 22 }),
        ISO.word(K.iso([18, -46, AXZ - 20], P), "casing (cover off)", "#555", { size: 14, anchor: "start" }),
        ISO.word(K.iso([18, 46, AXZ + 4], P), "impeller", "#555", { size: 14, anchor: "end" }),
      ].join("");
      g.innerHTML = style + `<g>${baseSvg(P)}${motorSvg(P)}${pedestalSvg(P)}${casingBackSvg(P)}${S(G.disc(-2, 5, RI, xAx([0, 0, AXZ]), P), { tone: "mid" })}</g>` +
        `<g data-name="impeller"><g data-part="vanes"></g>${S(G.disc(5, 15, 6, xAx([0, 0, AXZ]), P), { tone: "hi" })}<g data-part="nut"></g></g>` +
        `<g>${casingFrontSvg(P)}</g><g class="pm-flow" data-part="flow"><path d="${flowD(P)}" fill="none" stroke="#2b6cc4" stroke-width="1.6" stroke-linecap="round"/></g><g>${inletSvg(P)}</g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.vanes, s.a.toFixed(3), () => impellerSvg(P, s.a));
        w.rebuild(el.nut, s.a.toFixed(2), () => S(G.prismOf(xAx([0, 0, AXZ]), hex(3.6).map(([u, v]) => [u * Math.cos(s.a) - v * Math.sin(s.a), u * Math.sin(s.a) + v * Math.cos(s.a)]), 15, 18, P), { tone: "hi" }));
        w.attr(el.flow, "data-on", s.w > 0.5 ? "1" : "0");
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.spin !== undefined) s.on = !!+p.spin; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, s.on ? 0.5 : 0.8, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.a += s.w * SHOWN * Math.PI * 2 * dt;
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => {
        const rpm = RPM * s.w, u = (rpm / 60) * 2 * Math.PI * 0.12;
        return s.w < 0.01 ? "pump stopped · impeller Ø 240 mm on a 1450 rpm motor" : `impeller ${rpm.toFixed(0)} rpm · tip speed u = ωr = ${u.toFixed(1)} m/s · head ≈ u²/2g = ${(u * u / 19.62).toFixed(1)} m (${(u * u / 19.62 / 10.2).toFixed(2)} bar) · shown slowed`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
