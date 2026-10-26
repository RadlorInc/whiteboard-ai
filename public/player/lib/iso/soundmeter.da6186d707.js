// "soundmeter cx cy k db=40..100 lab=0 lit=case|dial|needle|mic|controls" — a PART (PARTS.md, batch 5): the sound
// meter of resonance.js (the box with a dial window whose needle swings with how loud it is), standing on the bench,
// origin the bench point under its middle, its dial facing the room (+y). A grey case 10 wide × 4 deep × 6 cm tall on
// two rubber feet; a dark bezel and a cream dial card behind its window, printed 40 to 100 dB (a tick every 2, numbered
// every 10, the 90–100 band red), the red needle on its pivot cap; under the window a range knob, a FAST/SLOW slide
// and the power key; on top a microphone on a short neck in its grey foam windball (anchor `mic`). The needle is a real
// damped pointer: set({ db }) swings it there with a small overshoot. World units: 1 = 1 cm. anchors: mic
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 5, HY = 2, Z0 = 0.4, Z1 = 6.4, FY = HY + 0.02, PIV = [0, 2.75], RA = 2.7, A0 = (-48 * Math.PI) / 180, A1 = (48 * Math.PI) / 180;
  const MIC = [-2.6, 0, Z1 + 2.05], ang = (db) => A0 + ((ISO.clamp(db, 40, 100) - 40) / 60) * (A1 - A0);
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function caseSvg(P) {
    const LAB = window.LAB, plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 }, f = (x, z, dy = 0) => K.iso([x, FY + dy, z], P), out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>`);
    out.push(ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-HX + 0.6, -HX + 2.6], [-HY + 0.3, HY - 0.3], [0, Z0], "lo") + ISO.wbox(P, [HX - 2.6, HX - 0.6], [-HY + 0.3, HY - 0.3], [0, Z0], "lo")));
    out.push(`<g data-name="case">${ISO.tinted(ISO.T.steel, S(K.slabOf(plan, Z0, Z1 - Z0, P, 4, 0.3), { tone: "mid", inner: window.K.lineSvg(K.sideSeam(plan, Z0 + 0.7, P, 4), { tone: "faint" }) }))}`);
    // four case screws in the face's corners and the maker's line on the top, by the front edge
    out.push(D([[-HX + 0.45, Z0 + 0.45], [HX - 0.45, Z0 + 0.45], [-HX + 0.45, Z1 - 0.45], [HX - 0.45, Z1 - 0.45]].map(([x, z]) => f(x, z)), { size: 0.35, tone: "lo" }));
    out.push(LAB.faceText(P, [1.6, 0.9, Z1 + 0.01], [1, 0, 0], "SOUND LEVEL METER · TYPE 2", 0.3, "#4c5560", [0, -1, 0]), "</g>");
    return out.join("");
  }
  // the window: a dark bezel, the cream card, the printed arc scale (ticks hang inward from the arc), the red band
  function dialSvg(P) {
    const LAB = window.LAB, f = (x, z, dy = 0.01) => K.iso([x, FY + dy, z], P), pa = (a, r) => f(PIV[0] + Math.sin(a) * r, PIV[1] + Math.cos(a) * r, 0.02), out = [];
    out.push(`<path d="${K.pathOf([f(-4.4, 2.2), f(4.4, 2.2), f(4.4, 6.0), f(-4.4, 6.0)], true)}" fill="#3a3e44" stroke="#1f2226" stroke-width="0.6"/>`);
    out.push(`<path d="${K.pathOf([f(-4.1, 2.45, 0.015), f(4.1, 2.45, 0.015), f(4.1, 5.75, 0.015), f(-4.1, 5.75, 0.015)], true)}" fill="#f6f0dc" stroke="#9a937c" stroke-width="0.5"/>`);
    const arc = (r, a0, a1) => { const p = []; for (let i = 0; i <= 24; i++) p.push(pa(a0 + ((a1 - a0) * i) / 24, r)); return K.pathOf(p); };
    const minor = [], major = [];
    for (let db = 40; db <= 100; db += 2) { const a = ang(db), big = db % 10 === 0; (big ? major : minor).push(K.pathOf([pa(a, RA), pa(a, RA - (big ? 0.42 : 0.22))])); }
    out.push(`<path d="${arc(RA - 0.12, ang(90), ang(100))}" fill="none" stroke="#c0392b" stroke-width="${(G.scaleOf(P) * 0.2).toFixed(2)}"/>`);
    out.push(`<path d="${arc(RA, A0, A1)}${major.join("")}" fill="none" stroke="#2a2b2f" stroke-width="0.8"/><path d="${minor.join("")}" fill="none" stroke="#2a2b2f" stroke-width="0.5"/>`);
    for (let db = 40; db <= 100; db += 10) { const a = ang(db), at = [PIV[0] + Math.sin(a) * (RA + 0.32), FY + 0.03, PIV[1] + Math.cos(a) * (RA + 0.32) - 0.1]; out.push(LAB.faceText(P, at, [1, 0, 0], String(db), 0.36, db >= 90 ? "#a8382a" : "#2a2b2f")); }
    out.push(LAB.faceText(P, [0, FY + 0.03, PIV[1] + 1.15], [1, 0, 0], "dB", 0.5, "#2a2b2f"), LAB.faceText(P, [0, FY + 0.03, PIV[1] + 0.6], [1, 0, 0], "A · FAST", 0.28, "#6b6a60"));
    return out.join("");
  }
  // under the window: the range knob, the FAST/SLOW slide in its slot, the power key; their names printed under them
  function controlsSvg(P) {
    const LAB = window.LAB, f = (x, z, dy = 0.02) => K.iso([x, FY + dy, z], P), out = [];
    const knob = Y([-3, HY, 1.35]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.25, 0.62, knob, P), { tone: "mid" }) + S(G.disc(0.25, 0.55, 0.5, knob, P), { tone: "hi" })));
    out.push(`<path d="${K.pathOf([K.iso([-3, HY + 0.57, 1.35], P), K.iso([-3 + 0.33, HY + 0.57, 1.35 + 0.33], P)])}" stroke="#f6f0dc" stroke-width="0.7"/>`);
    out.push(`<path d="${K.pathOf([f(-0.6, 1.25), f(0.9, 1.25), f(0.9, 1.5), f(-0.6, 1.5)], true)}" fill="#1f2226"/>`, ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-0.55, 0.05], [HY, HY + 0.3], [1.18, 1.57], "hi")));
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, 0.22, 0.42, Y([3, HY, 1.35]), P), { tone: "mid" })));
    out.push(LAB.faceText(P, [-3, FY, 0.6], [1, 0, 0], "RANGE", 0.26, "#4c5560"), LAB.faceText(P, [0.15, FY, 0.8], [1, 0, 0], "FAST  SLOW", 0.26, "#4c5560"), LAB.faceText(P, [3, FY, 0.65], [1, 0, 0], "POWER", 0.26, "#4c5560"));
    return out.join("");
  }
  // the microphone: a steel neck out of the top, a grey foam windball with its open-cell texture
  function micSvg(P) {
    const out = [ISO.tinted(ISO.T.plastic, S(K.cylinder(MIC[0], MIC[1], 0.7, Z1, 0.3, P, 20), { tone: "mid" })), ISO.tinted(ISO.T.steel, S(K.cylinder(MIC[0], MIC[1], 0.4, Z1 + 0.3, 0.75, P, 16), { tone: "mid" }))];
    out.push(ISO.tinted(ISO.T.road, S(G.sphereOf(MIC, 1.2, P, { steps: 32 }), { tone: "mid" })));
    // the foam's open cells: dots on the half of the ball that faces the camera
    const view = G.viewOf(P), pts = []; let q = 11;
    for (let i = 0; i < 60 && pts.length < 26; i++) {
      q = (q * 16807) % 2147483647; const a = (q % 628) / 100; q = (q * 16807) % 2147483647; const e = (q % 150) / 100 - 0.75;
      const n = [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
      if (G.dot3(n, view) > 0.25) pts.push(K.iso(MIC.map((c, j) => c + n[j] * 1.1), P));
    }
    out.push(`<g opacity=".55">${D(pts, { size: 0.25, tone: "lo" })}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "soundmeter", title: "Sound level meter (part)", compare: null,
    about: "A sound level meter: a case with a dial window printed 40 to 100 dB and a needle that swings with how loud it is, a microphone in a foam ball on top, range, speed and power controls. anchors: mic",
    line: "soundmeter cx cy k db=40..100 lab=0 lit=case|dial|needle|mic|controls",
    demo: { line: "soundmeter 480 400 34 db=45", script: [{ set: {}, hold: 1 }, { set: { db: 92, lit: "needle" }, hold: "settle" }, { set: { db: 60, lit: "mic" }, hold: "settle" }, { set: { lit: "controls" }, hold: 1.2 }, { set: { db: 75, lit: "dial" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { a: ang(ISO.num(o, "db", 45)), v: 0 }, want = { db: ISO.clamp(ISO.num(o, "db", 45), 40, 100) };
      let lit = o.lit || "";
      g.innerHTML = caseSvg(P) + `<g data-name="mic">${micSvg(P)}</g><g data-name="dial">${dialSvg(P)}</g><g data-name="needle" data-part="needle"></g><g data-name="controls">${controlsSvg(P)}</g>` +
        (lab ? LAB.word(P, lab, [HX + 0.5, 0, Z1 + 0.6], "sound meter", "#556", { anchor: "start" }) : "");
      g.anchors = { mic: MIC };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const a = Math.round(ISO.clamp(st.a, A0 - 0.06, A1 + 0.06) * 300) / 300;
        w.rebuild(el.needle, String(a), () => {
          const f = (r, dy) => K.iso([PIV[0] + Math.sin(a) * r, FY + dy, PIV[1] + Math.cos(a) * r], P), c = K.iso([PIV[0], FY + 0.05, PIV[1]], P);
          return `<path d="${K.pathOf([f(-0.35, 0.04), f(RA + 0.05, 0.04)])}" stroke="#c0392b" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.06).toFixed(2)}" stroke-linecap="round"/>` +
            ISO.tinted(ISO.T.plastic, S(G.disc(0.04, 0.16, 0.24, Y([PIV[0], FY, PIV[1]]), P, { steps: 16 }), { tone: "mid" })) + `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.06).toFixed(2)}" fill="#8d9096"/>`;
        });
        B27.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.db !== undefined && Number.isFinite(+p.db)) want.db = ISO.clamp(+p.db, 40, 100);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const tgt = ang(want.db);
        if (ISO.still()) { st.a = tgt; st.v = 0; }
        else for (let i = 0; i < 4; i++) { const h = Math.min(dt, 0.1) / 4; st.v += ((tgt - st.a) * 55 - st.v * 8) * h; st.a += st.v * h; }
        if (Math.abs(st.a - tgt) < 0.002 && Math.abs(st.v) < 0.01) { st.a = tgt; st.v = 0; }
        draw();
        return st.a !== tgt;
      };
      g.readout = () => { const db = 40 + ((st.a - A0) / (A1 - A0)) * 60; return `sound level meter · ${Math.round(db)} dB · a quiet room is about 40, talking 60, a loud shout 90`; };
      draw();
      return g;
    },
  });
})();
