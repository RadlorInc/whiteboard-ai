// "rccircuit cx cy width k=charge|discharge R=47 C=100 lab=1 lit=resistor|capacitor|switch|meter|logger" — RC on a breadboard.
// A 6 V battery pack, a slide switch, a 47 kΩ resistor and a 100 µF electrolytic capacitor on a breadboard, with a
// multimeter across the capacitor and a data logger drawing V_C against time. Switch to charge: current flows through
// R into C and V_C = V₀(1 − e^(−t/RC)), quick at first then slower as C fills; switch to discharge: C empties back
// through R, V_C = V₀e^(−t/RC). The time constant τ = RC = 4.7 s: after one τ, 63% charged (or 37% left). True time.
// set({ k: "charge" | "discharge" }) slides the switch.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const V0 = 6, MAT = { x: -176, y: -92, w: 352, d: 150, r: 6 }, BB = { x: -84, y: -36, w: 168, d: 72, r: 2 }, ZB = 3 + 8, PITCH = 5.08;
  const hole = (c, r) => [BB.x + 8 + c * PITCH, BB.y + 8 + r * PITCH];   // column c (0..31), row r (0..11)
  const LG = { x0: -70, x1: 70, y: -66, z0: 26, z1: 96 }, WIN = 24;          // the logger's screen; 24 s across

  function benchSvg(P) {
    const out = [LAB.mat(P, MAT, 3, "lo", ISO.T.wood)];
    // the breadboard: a white block, its centre channel, red and blue rails printed along both edges, and the holes
    out.push(`<g style="${ISO.tint("#fbfbf8", ["#d8d8d2", "#e0e0da", "#e8e8e2", "#f0f0ea"], "#7a7a74")}">${S(K.slabOf(BB, 3, 8, P, 2, 0.5), { tone: "mid" })}</g>`);
    out.push(L(K.lineOnTop([BB.x, 0], [BB.x + BB.w, 0], ZB, P), { tone: "lo" }), L(K.lineOnTop([BB.x, 1.6], [BB.x + BB.w, 1.6], ZB, P), { tone: "faint" }));   // the centre channel, edge to edge
    for (const [y, c] of [[BB.y + 3, "#c0392b"], [BB.y + BB.d - 3, "#2b6cc4"]]) out.push(`<path d="${K.pathOf([K.iso([BB.x + 6, y, ZB], P), K.iso([BB.x + BB.w - 6, y, ZB], P)])}" stroke="${c}" stroke-width="0.9" data-free=""/>`);
    const holes = [];
    for (let c = 0; c < 31; c++) for (let r = 0; r < 12; r++) if (r !== 5 && r !== 6) holes.push(K.iso([...hole(c, r), ZB], P));
    out.push(D(holes, { size: 0.35, tone: "lo" }));
    // the battery pack: a black holder with four AA cells and a lid tab
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-160, -104], [-56, -8], [3, 9], "mid")));
    for (let k = 0; k < 4; k++) out.push(ISO.tinted(ISO.T.copper, S(G.disc(0, 50, 5, G.frameOf([-156 + k * 13.6 + 5.6, -54, 14], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 20 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-160, -104], [-58, -56], [9, 18], "mid")));
    // its leads into the rails (red to +, black to −) and two jumpers to the switch and the capacitor's row
    const wire = (pts, c, r = 5) => `<path d="${K.pathOf(LAB.bend(pts, r).map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    // battery leads to the rails (red + at the back, blue − at the front); jumpers lie just above the board
    const RP = BB.y + 3, RN = BB.y + BB.d - 3, jump = (a, b, c) => wire([[a[0], a[1], ZB], [a[0], a[1], ZB + 3], [b[0], b[1], ZB + 3], [b[0], b[1], ZB]], c, 2);
    out.push(wire([[-104, -20, 9], [-96, -20, 16], [BB.x + 6, RP, 16], [BB.x + 6, RP, ZB]], "#c0392b"), wire([[-104, -14, 7], [-94, -10, 10], [-94, RN, 16], [BB.x + 6, RN, 16], [BB.x + 6, RN, ZB]], "#2a2b2f"));
    out.push(jump([hole(3, 0)[0], RP], hole(3, 1), "#c0392b"), jump([hole(5, 1)[0], hole(5, 1)[1]], [hole(5, 1)[0] + 0.01, RN], "#2a2b2f"));
    out.push(jump(hole(4, 3), hole(12, 3), "#e09a00"), jump(hole(22, 3), hole(26, 3), "#e09a00"), jump(hole(26, 10), [hole(26, 10)[0] + 0.01, RN], "#2a2b2f"));
    return out.join("");
  }
  // (the resistor and the capacitor stand on their wire legs, drawn as strokes: the audit calls them loose)
  // The resistor: a beige body with yellow-violet-orange-gold bands (47 kΩ), its leads bent down into two holes.
  function resistorSvg(P) {
    const a = hole(12, 4), b = hole(22, 4), F = G.frameOf([a[0] + 12, a[1], ZB + 4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), len = b[0] - a[0] - 24, out = [];
    out.push(`<path d="${K.pathOf([[a[0], a[1], ZB], [a[0], a[1], ZB + 4], [b[0], b[1], ZB + 4], [b[0], b[1], ZB]].map((p) => K.iso(p, P)))}" fill="none" stroke="#8d9096" stroke-width="1" stroke-linejoin="round"/>`);
    out.push(ISO.tinted(ISO.tint("#f1dcb0", ["#c9ad74", "#d6bb85", "#e2c998", "#ecd6ab"], "#6b5114"), S(G.solidOf([[0, 1.6], [1.4, 2.6, 1], [4, 2.8], [len - 4, 2.8], [len - 1.4, 2.6, 1], [len, 1.6]], F, P, { steps: 20 }), { tone: "hi" })));
    [[4.4, "#e0b800"], [7, "#7a3fb0"], [9.6, "#e67e22"], [len - 4.6, "#c9a85a"]].forEach(([s, c]) => out.push(`<path d="${G.arcOf(F, s, 2.85, P)}" stroke="${c}" stroke-width="2" fill="none"/>`));
    return out.join("");
  }
  // The electrolytic capacitor: a blue can with a pale stripe marking its − leg, standing in row 9 and row 4.
  function capacitorSvg(P) {
    const c = [hole(26, 4)[0] + 2.5, hole(26, 4)[1] + 12.7], out = [];
    out.push(`<path d="${K.pathOf([[...hole(26, 4), ZB], [...hole(26, 4), ZB + 2], [c[0] - 1.6, c[1], ZB + 3]].map((p) => K.iso(p, P)))}M${K.iso([...hole(26, 9), ZB], P)}L${K.iso([...hole(26, 9), ZB + 2], P)}L${K.iso([c[0] + 1.6, c[1], ZB + 3], P)}" fill="none" stroke="#8d9096" stroke-width="1" stroke-linejoin="round"/>`);
    out.push(ISO.tinted(ISO.T.blue, S(G.solidOf([[0, 6], [16, 6], [17, 5.2, 1]], LAB.Z([c[0], c[1], ZB + 3]), P, { steps: 28 }), { tone: "hi", inner: L(G.arcOf(LAB.Z([c[0], c[1], ZB + 3]), 15, 6, P), { tone: "lo" }) })));
    out.push(`<path d="${K.pathOf([0, 15].map((z) => K.iso([c[0] + 6 * 0.6, c[1] + 6 * 0.8, ZB + 3 + z], P)))}" stroke="#dfe9f4" stroke-width="2.4"/>`);
    return { svg: out.join(""), top: [c[0], c[1], ZB + 21] };
  }
  // The slide switch at columns 3–5 of row 2: a black body and a sliding knob (charge: to the battery; discharge: to −).
  const switchBody = (P) => ISO.tinted(ISO.T.plastic, ISO.wbox(P, [hole(3, 2)[0] - 2, hole(5, 2)[0] + 2], [hole(3, 2)[1] - 3, hole(3, 2)[1] + 3], [ZB, ZB + 6], "mid"));
  const knobSvg = (P, f) => { const x = hole(3, 2)[0] + 2 + f * 6; return ISO.tinted(ISO.T.amber, ISO.wbox(P, [x - 1.6, x + 1.6], [hole(3, 2)[1] - 1.4, hole(3, 2)[1] + 1.4], [ZB + 6, ZB + 10], "hi")); };
  // The multimeter on the mat with its probe leads to the capacitor's legs.
  const MM = { x0: 104, x1: 150, y0: -56, y1: 6, z1: 12 };
  function meterSvg(P) {
    const out = [ISO.tinted(ISO.T.amber, ISO.wbox(P, [MM.x0, MM.x1], [MM.y0, MM.y1], [3, MM.z1], "mid")), ISO.wbox(P, [MM.x0 + 3, MM.x1 - 3], [MM.y0 + 3, MM.y1 - 3], [MM.z1, MM.z1 + 1], "mid")];
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: MM.x0 + 7, y: MM.y0 + 6, w: MM.x1 - MM.x0 - 14, d: 16, r: 1 }, MM.z1 + 1, 0.4, P, 2), { tone: "hi", crease: "none" })));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder((MM.x0 + MM.x1) / 2, MM.y0 + 38, 9, MM.z1 + 1, 2.4, P, 28), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.red, S(K.cylinder(MM.x0 + 12, MM.y1 - 8, 2.4, MM.z1 + 1, 2, P, 14), { tone: "mid" })), ISO.tinted(ISO.T.plastic, S(K.cylinder(MM.x1 - 12, MM.y1 - 8, 2.4, MM.z1 + 1, 2, P, 14), { tone: "mid" })));
    const lead = (from, to, c) => `<path d="${K.pathOf(LAB.bend([from, [from[0], from[1], from[2] + 10], [to[0] + 10, to[1] + 4, to[2] + 16], [to[0], to[1], to[2] + 4], to], 6).map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    out.push(lead([MM.x0 + 12, MM.y1 - 8, MM.z1 + 3], [...hole(26, 1), ZB], "#c0392b"), lead([MM.x1 - 12, MM.y1 - 8, MM.z1 + 3], [...hole(26, 8), ZB], "#2a2b2f"));
    out.push(D([K.iso([...hole(26, 1), ZB], P), K.iso([...hole(26, 8), ZB], P)], { size: 0.8 }));
    return out.join("");
  }
  // The data logger standing behind the board: a dark screen with axes; the trace is drawn live.
  function loggerSvg(P) {
    const out = [ISO.wbox(P, [-12, 12], [LG.y - 12, LG.y - 6], [6, LG.z0 - 6], "mid"), ISO.wbox(P, [-26, 26], [LG.y - 18, LG.y + 4], [3, 6], "mid")];
    out.push(ISO.wbox(P, [LG.x0 - 6, LG.x1 + 6], [LG.y - 6, LG.y], [LG.z0 - 6, LG.z1 + 6], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [LG.x0, LG.x1], [LG.y, LG.y + 0.6], [LG.z0, LG.z1], "hi")));
    const a = (x, z) => K.iso([x, LG.y + 0.7, z], P), x0 = LG.x0 + 10, z0 = LG.z0 + 8;
    out.push(`<path d="M${a(x0, LG.z1 - 6)}L${a(x0, z0)}L${a(LG.x1 - 6, z0)}" fill="none" stroke="#9aa0a8" stroke-width="0.8" data-free=""/>`);
    const vz = z0 + (LG.z1 - 12 - z0);
    out.push(`<path d="M${a(x0, vz)}L${a(LG.x1 - 6, vz)}" stroke="#9aa0a8" stroke-width="0.5" stroke-dasharray="2 2" data-free=""/>`);
    return out.join("");
  }

  ISO.add({
    name: "rccircuit", title: "RC circuit on a breadboard", compare: "rccircuit 480 270 480 k=charge",
    about: "A battery, switch, resistor and capacitor on a breadboard, a multimeter on the capacitor and a logger drawing V_C: charging V₀(1 − e^(−t/RC)), discharging V₀e^(−t/RC), τ = RC.",
    line: "rccircuit cx cy width k=charge|discharge R=47 C=100 lab=1 lit=resistor|capacitor|switch|meter|logger",
    demo: { line: "rccircuit 480 270 480 k=charge", script: [{ set: { k: "charge" }, hold: 5 }, { set: {}, hold: 6 }, { set: { k: "discharge", lit: "switch" }, hold: 5 }, { set: { lit: "logger" }, hold: 6 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [LG.x0 - 6, LG.y - 6, LG.z1 + 6], [LG.x1 + 6, LG.y, LG.z1 + 6]], cx, cy, W, H, { azimuth: 64, elevation: 30 }, parent);
      const R = ISO.clamp(ISO.num(o, "R", 47), 10, 100) * 1e3, C = ISO.clamp(ISO.num(o, "C", 100), 10, 470) * 1e-6, tau = R * C;
      const s = { k: o.k === "discharge" ? "discharge" : "charge", V: 0, t: 0, f: 0, trace: [] };
      s.V = s.k === "charge" ? 0 : V0; s.f = s.k === "charge" ? 0 : 1; s.fT = s.f;
      let lit = o.lit || "";
      const cap = capacitorSvg(P);
      g.innerHTML = `<g data-name="logger">${loggerSvg(P)}<g data-part="trace"></g></g><g>${benchSvg(P)}</g><g data-name="switch">${switchBody(P)}<g data-part="knob"></g></g><g data-name="resistor">${resistorSvg(P)}</g><g data-name="capacitor">${cap.svg}</g><g data-name="meter">${meterSvg(P)}<g data-part="read"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.knob, s.f.toFixed(2), () => knobSvg(P, s.f));
        const vq = s.V.toFixed(2);
        w.rebuild(el.read, vq, () => LAB.faceText(P, [(MM.x0 + MM.x1) / 2, MM.y0 + 14, MM.z1 + 1.5], [1, 0, 0], `${vq} V`, 7, "#7fe08a", [0, -1, 0]));
        // the logger trace: the last 24 s of V_C, newest at the right edge of what has been drawn
        w.rebuild(el.trace, `${s.trace.length ? s.trace[s.trace.length - 1][0] : 0}`, () => {
          if (s.trace.length < 2) return "";
          const x0 = LG.x0 + 10, z0 = LG.z0 + 8, xs = (LG.x1 - 8 - x0) / WIN, zs = (LG.z1 - 12 - z0) / V0, t0 = Math.max(0, s.t - WIN);
          // charging in red, discharging in blue, each run joined to the one before
          const seen = s.trace.filter(([tt]) => tt >= t0), out = [];
          let run = [];
          seen.forEach((q, i) => { run.push(q); if (i === seen.length - 1 || seen[i + 1][2] !== q[2]) { if (run.length > 1) out.push(`<path d="${K.pathOf(run.map(([tt, v]) => K.iso([x0 + (tt - t0) * xs, LG.y + 0.75, z0 + v * zs], P)))}" fill="none" stroke="${q[2] === "charge" ? "#ff8a7a" : "#8fc4ff"}" stroke-width="1.3" stroke-linejoin="round"/>`); run = [q]; } });
          return out.join("");
        });
        w.rebuild(el.words, lab ? s.k : "", () => !lab ? "" :
          ISO.word(K.iso([...hole(17, 4), ZB + 8], P), "R = 47 kΩ", "#555", { size: 13, dy: -4 }) + ISO.word(K.iso([...cap.top], P), "C = 100 µF", "#555", { size: 13, dy: -4 }) +
          ISO.word(K.iso([...hole(4, 2), ZB + 12], P), s.k === "charge" ? "switch: charge" : "switch: discharge", "#8a5a10", { size: 13, dy: -4 }) + ISO.word(K.iso([-132, -56, 18], P), "6 V battery", "#555", { size: 13, dy: -6 }) +
          ISO.word(K.iso([(MM.x0 + MM.x1) / 2, MM.y1, MM.z1 + 2], P), "voltmeter on C", "#555", { size: 13, dy: 14 }) + ISO.word(K.iso([0, LG.y, LG.z1 + 6], P), "V_C against time", "#555", { size: 13, dy: -6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k && (p.k === "discharge") !== (s.k === "discharge")) { s.k = p.k === "discharge" ? "discharge" : "charge"; s.fT = s.k === "charge" ? 0 : 1; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.f = ISO.follow(s.f, s.fT, dt, 0.08, calm);
        const target = s.k === "charge" ? V0 : 0;
        s.V = calm ? target : target + (s.V - target) * Math.exp(-dt / tau);
        s.t += dt;
        if (!s.trace.length || s.t - s.trace[s.trace.length - 1][0] > 0.2) { s.trace.push([s.t, s.V, s.k]); if (s.trace.length > 200) s.trace.shift(); }
        draw();
        return Math.abs(s.V - target) > 0.005 || s.f !== s.fT;
      };
      g.readout = () => {
        const I = Math.abs((s.k === "charge" ? V0 - s.V : s.V) / R) * 1e6;
        return `${s.k === "charge" ? "charging" : "discharging"} · V_C = ${s.V.toFixed(2)} V (${((s.V / V0) * 100).toFixed(0)}% of 6 V) · current ${I.toFixed(0)} µA through R · τ = RC = ${(R / 1e3).toFixed(0)} kΩ × ${(C * 1e6).toFixed(0)} µF = ${tau.toFixed(1)} s · ${s.k === "charge" ? "63% after one τ" : "37% left after one τ"}`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
