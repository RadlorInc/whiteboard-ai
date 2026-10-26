// "datalogger cx cy k curve=charge|discharge|damped|sine run=0|1 lab=0 lit=case|screen|trace|buttons|sockets" — a PART
// (PARTS.md, batch 5): a school data logger standing on the bench, its origin the bench point under its middle, its
// screen facing the room (+y). A grey case 15 × 3 × 10 cm on two rubber feet, a bezel, a dark screen with a grid,
// axes and a live trace, four keys, a green start key and a power lamp, two sensor sockets on top (CH1, CH2) and a USB
// port in its side. The trace is the real curve: charge V₀(1 − e^(−t/τ)), discharge V₀e^(−t/τ) (τ = 2 s), a damped
// oscillation e^(−0.25t)·cos(2πt/1.6) or a sine at 0.5 Hz, drawn left to right over a 10 s window, then scrolling.
// Reused from rccircuit.js and resonance.js (their loggers and traces). set({ curve }) starts a new run, set({ run })
// pauses or goes on. World units: 1 = 1 cm. anchors: in1 in2 (the tops of the two sockets).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 7.5, HY = 1.5, Z0 = 0.4, Z1 = 10.4, SC = { x0: -6.6, x1: 3.2, z0: 2.2, z1: 9.2 }, WIN = 10, TAU = 2;
  const GR = { x0: SC.x0 + 0.9, x1: SC.x1 - 0.4, z0: SC.z0 + 0.7, z1: SC.z1 - 1.1 };
  const CURVES = {
    charge: { f: (t) => 1 - Math.exp(-t / TAU), lo: 0, title: "V against t · charging", unit: "V", v0: 6 },
    discharge: { f: (t) => Math.exp(-t / TAU), lo: 0, title: "V against t · discharging", unit: "V", v0: 6 },
    damped: { f: (t) => Math.exp(-0.25 * t) * Math.cos((2 * Math.PI * t) / 1.6), lo: -1, title: "x against t · damped", unit: "cm", v0: 4 },
    sine: { f: (t) => Math.sin(Math.PI * t), lo: -1, title: "V against t · 0.5 Hz", unit: "V", v0: 2 },
  };
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), FY = HY + 0.02;
  const at = (P, x, z, dy = 0) => K.iso([x, FY + dy, z], P);

  function caseSvg(P, lab) {
    const LAB = window.LAB, plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.7 }, out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>`];
    out.push(ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-HX + 0.8, -HX + 3.4], [-HY + 0.3, HY - 0.3], [0, Z0], "lo") + ISO.wbox(P, [HX - 3.4, HX - 0.8], [-HY + 0.3, HY - 0.3], [0, Z0], "lo")));
    out.push(`<g data-name="case">${ISO.tinted(ISO.T.steel, S(K.slabOf(plan, Z0, Z1 - Z0, P, 4, 0.35), { tone: "mid", inner: L(K.sideSeam(plan, Z0 + 0.6, P, 4), { tone: "faint" }) }))}`);
    // the bezel round the screen, the maker's line under it, the USB port in the +x side
    out.push(`<path d="${K.pathOf([at(P, SC.x0 - 0.35, SC.z0 - 0.35), at(P, SC.x1 + 0.35, SC.z0 - 0.35), at(P, SC.x1 + 0.35, SC.z1 + 0.35), at(P, SC.x0 - 0.35, SC.z1 + 0.35)], true)}" fill="#5f646b" stroke="#3c3f45" stroke-width="0.6"/>`);
    out.push(LAB.faceText(P, [(SC.x0 + SC.x1) / 2, FY, SC.z0 - 1.15], [1, 0, 0], "DATA LOGGER · 2 CH", 0.5, "#4c5560"));
    const ux = HX + 0.02, u = (y, z) => K.iso([ux, y, z], P);
    out.push(`<path d="${K.pathOf([u(-0.45, 5.6), u(0.45, 5.6), u(0.45, 5.95), u(-0.45, 5.95)], true)}" fill="#2a2b2f" stroke="#3c3f45" stroke-width="0.5"/>`, "</g>");
    // the keys: four grey keys in a block, the green start key under them, the power lamp
    const keys = [[4.6, 7.6], [6.0, 7.6], [4.6, 6.2], [6.0, 6.2]].map(([x, z]) => ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.25, 0.42, Y([x, HY, z]), P), { tone: "hi" }))).join("");
    out.push(`<g data-name="buttons">${keys}${ISO.tinted(ISO.T.green, S(G.disc(0, 0.3, 0.6, Y([5.3, HY, 4.2]), P), { tone: "mid" }))}` +
      `<path d="${G.circleOf(Y([5.3, HY, 8.9]), 0.03, 0.18, P)}" fill="#3fd06a" stroke="#1d5f2c" stroke-width="0.4"/>${LAB.faceText(P, [5.3, FY + 0.3, 3.15], [1, 0, 0], "START", 0.38, "#3c4a40")}</g>`);
    // the sensor sockets on top with their names
    const sock = (x) => ISO.tinted(ISO.T.plastic, S(K.cylinder(x, 0, 0.75, Z1, 0.5, P, 24, 0.08), { tone: "mid" })) + ISO.tinted(ISO.T.steel, S(K.cylinder(x, 0, 0.45, Z1 + 0.5, 0.15, P, 20), { tone: "hi" })) + D([K.iso([x, 0, Z1 + 0.66], P)], { size: 0.4, tone: "lo" });
    out.push(`<g data-name="sockets">${sock(-4)}${sock(-1.2)}${LAB.faceText(P, [-4, FY, Z1 - 0.55], [1, 0, 0], "CH1", 0.42, "#4c5560")}${LAB.faceText(P, [-1.2, FY, Z1 - 0.55], [1, 0, 0], "CH2", 0.42, "#4c5560")}</g>`);
    if (lab) out.push(LAB.word(P, lab, [HX, 0, Z1 + 1.4], "data logger", "#556", { anchor: "start" }));
    return out.join("");
  }
  // the screen: dark glass, grid, axes with their names and the run's title
  function screenSvg(P, c) {
    const LAB = window.LAB, C = CURVES[c], out = [];
    out.push(`<path d="${K.pathOf([at(P, SC.x0, SC.z0, 0.01), at(P, SC.x1, SC.z0, 0.01), at(P, SC.x1, SC.z1, 0.01), at(P, SC.x0, SC.z1, 0.01)], true)}" fill="#1b262e" stroke="#0d1216" stroke-width="0.5"/>`);
    const grid = [];
    for (let i = 1; i <= 4; i++) { const x = GR.x0 + ((GR.x1 - GR.x0) * i) / 5; grid.push(`M${at(P, x, GR.z0, 0.02)}L${at(P, x, GR.z1, 0.02)}`); }
    for (let i = 1; i <= 3; i++) { const z = GR.z0 + ((GR.z1 - GR.z0) * i) / 4; grid.push(`M${at(P, GR.x0, z, 0.02)}L${at(P, GR.x1, z, 0.02)}`); }
    out.push(`<path d="${grid.join("")}" stroke="#34505f" stroke-width="0.5" stroke-dasharray="1.5 1.5"/>`);
    const zAx = C.lo < 0 ? (GR.z0 + GR.z1) / 2 : GR.z0;
    out.push(`<path d="M${at(P, GR.x0, GR.z1, 0.02)}L${at(P, GR.x0, GR.z0, 0.02)}M${at(P, GR.x0, zAx, 0.02)}L${at(P, GR.x1, zAx, 0.02)}" stroke="#9aa8b2" stroke-width="0.7"/>`);
    out.push(LAB.faceText(P, [GR.x0 + 0.1, FY + 0.03, SC.z1 - 0.7], [1, 0, 0], C.title, 0.42, "#cfe3ee").replace('text-anchor="middle"', 'text-anchor="start"'));
    out.push(LAB.faceText(P, [GR.x1 - 0.1, FY + 0.03, SC.z0 + 0.15], [1, 0, 0], "t / s", 0.36, "#9aa8b2").replace('text-anchor="middle"', 'text-anchor="end"'));
    out.push(LAB.faceText(P, [GR.x0 - 0.45, FY + 0.03, GR.z1 - 0.35], [1, 0, 0], C.unit, 0.36, "#9aa8b2"));
    return out.join("");
  }
  // the trace: the curve from max(0, t − WIN) to t, newest at the right edge of what is drawn
  function traceSvg(P, c, t) {
    const C = CURVES[c], t0 = Math.max(0, t - WIN), n = Math.max(2, Math.ceil(((t - t0) / WIN) * 120)), pts = [];
    if (t <= 0.02) return "";
    for (let i = 0; i <= n; i++) { const tt = t0 + ((t - t0) * i) / n, v = C.f(tt); pts.push(at(P, GR.x0 + ((tt - t0) / WIN) * (GR.x1 - GR.x0), GR.z0 + ((v - C.lo) / (1 - C.lo)) * (GR.z1 - GR.z0) * 0.92, 0.03)); }
    const end = pts[pts.length - 1];
    return `<path d="${K.pathOf(pts)}" fill="none" stroke="#7fe08a" stroke-width="${(G.scaleOf(P) * 0.07).toFixed(2)}" stroke-linejoin="round"/><circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.09).toFixed(2)}" fill="#c9ffd0"/>`;
  }

  ISO.add({
    name: "datalogger", title: "Data logger (part)", compare: null,
    about: "A school data logger: a case with a live graph on its screen (a capacitor charging or discharging, a damped spring, a sine), keys and two sensor sockets on top. anchors: in1 in2",
    line: "datalogger cx cy k curve=charge|discharge|damped|sine run=0|1 lab=0 lit=case|screen|trace|buttons|sockets",
    demo: { line: "datalogger 480 390 30 curve=charge run=1", script: [{ set: {}, hold: 4 }, { set: { lit: "trace" }, hold: 3 }, { set: { curve: "damped", lit: "" }, hold: 5 }, { set: { run: 0, lit: "buttons" }, hold: 1.4 }, { set: { curve: "discharge", run: 1, lit: "sockets" }, hold: 4 }, { set: { curve: "sine", lit: "screen" }, hold: 4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { c: CURVES[o.curve] ? o.curve : "charge", run: o.run !== "0", t: o.run === "0" ? WIN : 0 };
      let lit = o.lit || "";
      g.innerHTML = caseSvg(P, lab) + `<g data-name="screen" data-part="screen"></g><g data-name="trace" data-part="trace"></g>`;
      g.anchors = { in1: [-4, 0, Z1 + 0.65], in2: [-1.2, 0, Z1 + 0.65] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.screen, st.c, () => screenSvg(P, st.c));
        const tq = Math.round(st.t * 30) / 30;
        w.rebuild(el.trace, `${st.c} ${tq}`, () => traceSvg(P, st.c, tq));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.curve !== undefined && CURVES[p.curve] && p.curve !== st.c) { st.c = p.curve; st.t = 0; }
        if (p.run !== undefined) st.run = !!+p.run;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) st.t = Math.max(st.t, WIN);
        else if (st.run) st.t = Math.min(st.t + dt, 3600);
        draw();
        return st.run && !ISO.still();
      };
      g.readout = () => { const C = CURVES[st.c], v = C.f(st.t) * C.v0; return `data logger · ${C.title} · t = ${st.t.toFixed(1)} s · reading ${v.toFixed(2)} ${C.unit}${st.run ? "" : " (paused)"}`; };
      draw();
      return g;
    },
  });
})();
