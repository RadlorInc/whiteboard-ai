// "oscilloscope cx cy k echo=0.05..0.55 go=0|1 lab=0 lit=case|screen|knobs|inputs|trace" — a PART (PARTS.md, batch 5):
// a two-channel school oscilloscope used as a timer, standing on the bench, its origin the bench point under its middle.
// A grey case 30 cm wide (x), 25 deep (y), 15 tall on four rubber feet, a carry handle on top and vent slots; the front
// panel faces +y: a 10 × 8 cm screen with a 1 cm graticule (10 divisions = 0.6 s), the TIME/DIV and VOLTS/DIV knobs,
// two BNC inputs (CH1, CH2) and the power switch with its lamp. The green trace shows a sharp blip when the sound goes
// out (CH1) and a smaller ringing blip `echo` seconds later when it comes back. set({ go: 1 }) sweeps the trace across
// (slowed: 2.4 s on screen for 0.6 s); set({ echo }) moves the second blip. Reused from echo.js (its scope, its trace
// and blip shapes, SWEEP). World units: 1 = 1 cm. anchors: ch1 ch2 (the BNC inputs' fronts).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 15, HY = 12.5, Z0 = 0.8, Z1 = 15, SWEEP = 0.6, SHOW = 2.4;
  const SCR = { x0: -13, x1: -3, z0: 3.6, z1: 11.6 }, FY = HY + 0.3;
  const CASE = ISO.tint("#e4e6e3", ["#a9ada8", "#b9bdb8", "#c8cbc6", "#d6d8d3"], "#4c504b");
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const on = (x, z, d = 0) => [x, FY + d, z];

  function caseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1 }, 0, 2, P)}"/>`];
    for (const [x, y] of [[-HX + 2, -HY + 2], [HX - 2, -HY + 2], [-HX + 2, HY - 2], [HX - 2, HY - 2]]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 1, 0, Z0, P, 16), { tone: "lo" })));
    out.push(ISO.tinted(CASE, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1 }, Z0, Z1 - Z0, P, 3, 0.5), { tone: "hi" })));
    // vent slots on the top, toward the back
    const vents = []; for (let i = 0; i < 9; i++) { const x = -9 + i * 2.2; vents.push(K.pathOf([K.iso([x, -HY + 2.5, Z1 + 0.01], P), K.iso([x, -HY + 8, Z1 + 0.01], P)])); }
    out.push(`<path d="${vents.join("")}" stroke="#4c504b" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.35).toFixed(2)}" stroke-linecap="round" opacity=".55"/>`);
    // the front bezel: a dark panel set on the front face
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-HX + 0.6, HX - 0.6], [HY - 0.02, FY], [Z0 + 0.6, Z1 - 0.6], "mid")));
    return out.join("");
  }
  // the carry handle: two lugs on the top's ends and the bar between them
  const handleSvg = (P) => ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-12, -10.6], [-1, 1], [Z1, Z1 + 2.4], "mid") + ISO.wbox(P, [10.6, 12], [-1, 1], [Z1, Z1 + 2.4], "mid") + ISO.wbox(P, [-12, 12], [-0.7, 0.7], [Z1 + 2.4, Z1 + 3.2], "mid"));
  // the screen: a dark glass face in a bezel, its graticule (lines end on the screen's edges), the centre ticks
  function screenSvg(P) {
    const out = [];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [SCR.x0 - 0.6, SCR.x1 + 0.6], [FY, FY + 0.25], [SCR.z0 - 0.6, SCR.z1 + 0.6], "mid")));
    const sy = FY + 0.27, s = (x, z) => K.iso([x, sy, z], P);
    out.push(`<path d="${K.pathOf([s(SCR.x0, SCR.z0), s(SCR.x1, SCR.z0), s(SCR.x1, SCR.z1), s(SCR.x0, SCR.z1)], true)}" fill="#14261b" stroke="#0b130e" stroke-width="0.6"/>`);
    const grid = [];
    for (let i = 1; i < 10; i++) grid.push(K.pathOf([s(SCR.x0 + i, SCR.z0), s(SCR.x0 + i, SCR.z1)]));
    for (let i = 1; i < 8; i++) grid.push(K.pathOf([s(SCR.x0, SCR.z0 + i), s(SCR.x1, SCR.z0 + i)]));
    const zc = (SCR.z0 + SCR.z1) / 2, xc = (SCR.x0 + SCR.x1) / 2, ticks = [];
    for (let i = 1; i < 50; i++) { const x = SCR.x0 + i * 0.2; ticks.push(K.pathOf([s(x, zc - 0.12), s(x, zc + 0.12)])); }
    for (let i = 1; i < 40; i++) { const z = SCR.z0 + i * 0.2; ticks.push(K.pathOf([s(xc - 0.12, z), s(xc + 0.12, z)])); }
    out.push(`<path d="${grid.join("")}" stroke="#3f6b4e" stroke-width="0.5" opacity=".8"/><path d="${ticks.join("")}" stroke="#3f6b4e" stroke-width="0.4" opacity=".7"/>`);
    return out.join("");
  }
  // the controls: two knobs with pointer lines, two BNC inputs, the power switch and its lamp, the printed names
  function knobsSvg(P) {
    const out = [];
    for (const x of [3, 10]) {
      const F = Y([x, 0, 9]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(FY, FY + 0.3, 1.9, F, P), { tone: "mid" })), window.B03.knob(P, F, FY + 0.3, FY + 1.6, 1.4));
      out.push(`<path d="${K.pathOf([K.iso([x, FY + 1.61, 9], P), K.iso([x - 0.7, FY + 1.61, 9.9], P)])}" stroke="#ffffff" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.12).toFixed(2)}" stroke-linecap="round"/>`);
    }
    return out.join("");
  }
  function inputsSvg(P) {
    const out = [];
    for (const x of [3, 10]) {
      const F = Y([x, 0, 4]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(FY, FY + 0.25, 1, F, P), { tone: "mid" }) + S(G.disc(FY + 0.25, FY + 1.4, 0.6, F, P), { tone: "hi" })));
      out.push(D([K.iso(G.pointOf(F, FY + 0.9, 0.62, Math.PI * 0.5), P)], { size: 0.35 }), `<circle cx="${K.iso([x, FY + 1.41, 4], P)[0].toFixed(1)}" cy="${K.iso([x, FY + 1.41, 4], P)[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.2).toFixed(2)}" fill="#1d1f22"/>`);
    }
    return out.join("");
  }
  function printSvg(P) {
    const LAB = window.LAB, t = (x, z, s, sz, c = "#d9dcd6") => LAB.faceText(P, on(x, z, 0.03), [1, 0, 0], s, sz, c);
    const F = Y([13.2, 0, 12.8]);
    return t(3, 11.6, "TIME/DIV", 0.5) + t(10, 11.6, "VOLTS/DIV", 0.5) + t(3, 1.9, "CH1", 0.55) + t(10, 1.9, "CH2", 0.55) + t(-8, 12.5, "2-CHANNEL TIMER · 0.06 s/div", 0.42) +
      ISO.tinted(ISO.T.red, S(G.disc(FY, FY + 0.5, 0.45, F, P), { tone: "hi" })) + `<circle cx="${K.iso([13.2, FY + 0.03, 11.3], P)[0].toFixed(1)}" cy="${K.iso([13.2, FY + 0.03, 11.3], P)[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.22).toFixed(2)}" fill="#7fe08a"/>`;
  }
  // the trace across the screen up to `sweep` (0..1): a blip at 0.012 s, a ringing blip at tE + 0.012 s
  function traceSvg(P, sweep, tE) {
    const sy = FY + 0.29, zc = (SCR.z0 + SCR.z1) / 2, pts = [];
    for (let k = 0; k <= 120 * sweep; k++) {
      const f = k / 120, tt = f * SWEEP, blip = Math.exp(-(((tt - 0.012) / 0.006) ** 2)) * 2.6 + Math.exp(-(((tt - tE - 0.012) / 0.006) ** 2)) * 1.9 * Math.sin(tt * 700);
      pts.push(K.iso([SCR.x0 + 0.05 + (SCR.x1 - SCR.x0 - 0.1) * f, sy, zc - 1.5 + blip], P));
    }
    if (pts.length < 2) return "";
    const d = K.pathOf(pts);
    return `<path d="${d}" fill="none" stroke="#7fe08a" stroke-width="2.6" opacity=".25" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#b8ffbf" stroke-width="0.9" stroke-linejoin="round"/>`;
  }

  ISO.add({
    name: "oscilloscope", title: "Oscilloscope timer (part)", compare: null,
    about: "A two-channel oscilloscope used as a timer (30 × 25 × 15 cm): its trace shows a blip when a click goes out and a second blip when the echo comes back; 10 divisions = 0.6 s. anchors: ch1 ch2",
    line: "oscilloscope cx cy k echo=0.05..0.55 go=0|1 lab=0 lit=case|screen|knobs|inputs|trace",
    demo: { line: "oscilloscope 480 380 14 echo=0.29 lab=1", script: [{ set: {}, hold: 1 }, { set: { go: 1, lit: "trace" }, hold: 3 }, { set: { echo: 0.47, go: 1, lit: "screen" }, hold: 3 }, { set: { lit: "knobs" }, hold: 1 }, { set: { lit: "inputs" }, hold: 1 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { tE: ISO.clamp(ISO.num(o, "echo", 0.29), 0.05, 0.55), s: o.go === "1" ? 0 : 1, run: o.go === "1" };
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="case">${caseSvg(P)}${handleSvg(P)}</g><g data-name="screen">${screenSvg(P)}</g><g data-name="trace" data-part="trace"></g>` +
        `<g data-name="case">${printSvg(P)}</g><g data-name="knobs">${knobsSvg(P)}</g><g data-name="inputs">${inputsSvg(P)}</g><g data-part="words"></g>`;
      g.anchors = { ch1: [3, FY + 1.4, 4], ch2: [10, FY + 1.4, 4] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const s = Math.round(st.s * 120) / 120;
        w.rebuild(el.trace, `${s} ${st.tE}`, () => traceSvg(P, s, st.tE));
        if (lab) w.rebuild(el.words, st.s >= 1 ? String(st.tE) : "", () => LAB.word(P, lab, [0, HY, Z1 + 3.4], "oscilloscope (timer)", "#556", { dy: -6 }) +
          (st.s >= 1 ? LAB.word(P, lab, [SCR.x0, FY, 0], `echo after ${st.tE.toFixed(3)} s`, "#2f7d3a", { anchor: "start", dy: 14 }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.echo !== undefined && Number.isFinite(+p.echo)) st.tE = Math.round(ISO.clamp(+p.echo, 0.05, 0.55) * 1000) / 1000;
        if (p.go !== undefined && +p.go) { st.s = 0; st.run = true; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (st.run) { st.s = ISO.still() ? 1 : Math.min(1, st.s + dt / SHOW); if (st.s >= 1) st.run = false; }
        draw();
        return st.run;
      };
      g.readout = () => `timer screen 10 div = ${SWEEP} s · out-going click at 0 s, echo ${st.tE.toFixed(3)} s later (${(st.tE / (SWEEP / 10)).toFixed(1)} div)${st.run ? " · sweeping" : ""}`;
      draw();
      return g;
    },
  });
})();
