// "waterheater cx cy height tap=0|1 lab=1 lit=tank|diptube|burner|tp|drain|anode|flue" — a gas tank water heater cut open.
// A 40 gallon (151 L) tank cut in half so you see inside: steel jacket, foam insulation and the glass-lined tank; the
// cold inlet's dip tube runs down inside to the bottom, the hot outlet takes water off the top, the flue runs up the
// middle with its baffle, the magnesium anode rod hangs beside it. Below, the burner in its chamber, lit by the gas
// valve's thermostat. Outside: the T&P relief valve with its discharge pipe down the side, and the drain valve.
// Hot water floats on cold: turn a hot tap on (tap=1, 2 gal a minute) and cold enters at the bottom while hot leaves
// the top, so the line between them climbs; once the thermostat (low on the tank) feels cold the 40,000 BTU/h burner
// lights and the hot layer grows back. World units: 1 = 1 cm (a 51 cm × 150 cm heater drawn at true proportions).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 25, Z0 = 12, Z1 = 140, T0 = 22, T1 = 134, IN = 3.2, CH = [4, 20];   // jacket, tank, insulation, burner chamber
  const COLD_X = -11, HOT_X = 11, ANODE_X = 5;
  const STEEL = ISO.T.steel, BRASS = ISO.T.brass, COPPER = ISO.T.copper;
  const JACKET = ISO.tint("#eef1f3", ["#b4bcc4", "#c3cad1", "#d1d7dd", "#dfe4e8"], "#56606a");
  const BASE = { x: -38, y: -32, w: 76, d: 44, r: 3 };
  let uid = 0;
  const yA = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  // The back half of the jacket (a half-cylinder seen from the cut) and its half top, the base pan.
  function shellSvg(P) {
    const half = Array.from({ length: 33 }, (_, i) => { const a = Math.PI + (i / 32) * Math.PI; return [Math.cos(a) * R, Math.sin(a) * R]; });
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -3, 3, P)}"/>`, S(K.slabOf(BASE, -3, 3, P, 3, 0.6), { tone: "lo" })];
    out.push(ISO.tinted(JACKET, S(K.extrude(half, Z0 - 8, 8, P, { convex: true }), { tone: "mid" })));
    out.push(ISO.tinted(JACKET, S(K.extrude(half, Z0, Z1 - Z0, P, { convex: true }), { tone: "hi", inner: L(K.ringSeam(half, Z1 - 6, P), { tone: "faint" }) })));
    return out.join("");
  }
  // The cut face at y = 0, drawn flat: jacket and foam walls, the tank, its water (hot above the line h, cold below),
  // the flue with its baffle, dip tube, anode, and the burner chamber below with the flame.
  function sectionSvg(P, id, h, flame) {
    const m = ISO.faceMatrix(P, [0, 0.02, 0], 1), Y = (z) => -z;
    const line = T0 + (T1 - T0) * (1 - h), band = 6;
    const water = `<linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(T1)}" x2="0" y2="${Y(T0)}">` +
      `<stop offset="0" stop-color="#f3b3a3"/><stop offset="${ISO.clamp((T1 - line - band) / (T1 - T0), 0, 1).toFixed(3)}" stop-color="#f3b3a3"/>` +
      `<stop offset="${ISO.clamp((T1 - line + band) / (T1 - T0), 0, 1).toFixed(3)}" stop-color="#a9c8ef"/><stop offset="1" stop-color="#a9c8ef"/></linearGradient>`;
    const rect = (x0, z0, x1, z1, fill, stroke = "#56606a", sw = 0.6) => `<rect x="${x0}" y="${Y(z1)}" width="${x1 - x0}" height="${z1 - z0}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const out = [`<g transform="${m}">${water}`];
    out.push(rect(-R, Z0 - 8, R, Z1, "#dfe4e8"));                              // jacket section
    out.push(rect(-R + 0.6, Z0, R - 0.6, Z1 - 0.6, "#f2d48a", "none"));       // foam
    out.push(rect(-R + IN, T0 - 2, R - IN, T1 + 2, "#6b7580", "#3c4148"));     // tank steel
    out.push(rect(-R + IN + 0.8, T0, R - IN - 0.8, T1, `url(#${id}w)`, "none"));
    // the burner chamber under the tank: the burner on its tube, and the flame (orange tips over a blue base)
    out.push(rect(-R + 0.6, Z0 - 8, R - 0.6, T0 - 2, "#3a3e44", "none"));
    out.push(rect(-9, CH[0] + 4, 9, CH[0] + 6, "#9aa1a9", "#3c4148"), rect(-R + 0.6, CH[0] + 4.4, -9, CH[0] + 5.6, "#9aa1a9", "#3c4148"));
    if (flame > 0.02) {
      const f = [];
      for (let i = -7; i <= 7; i += 1.4) f.push(`<path d="M${i - 0.6} ${Y(CH[0] + 6)} Q${i} ${Y(CH[0] + 6 + 7 * flame)} ${i + 0.6} ${Y(CH[0] + 6)} Z" fill="#f08a2a" opacity="${flame.toFixed(2)}"/><path d="M${i - 0.4} ${Y(CH[0] + 6)} Q${i} ${Y(CH[0] + 6 + 3 * flame)} ${i + 0.4} ${Y(CH[0] + 6)} Z" fill="#4a7fd6" opacity="${flame.toFixed(2)}"/>`);
      out.push(f.join(""));
    }
    // the flue up the middle with its twisted baffle, the dip tube and the anode rod
    out.push(rect(-3, T0 - 2, 3, Z1 + 0.6, "#4a4f56", "#2b2f35"));
    const zz = []; for (let z = T0 + 2, k = 0; z < T1 - 2; z += 4, k++) zz.push(`${k % 2 ? 2.2 : -2.2},${Y(z)}`);
    out.push(`<polyline points="${zz.join(" ")}" fill="none" stroke="#c9cdd2" stroke-width="0.8"/>`);
    out.push(rect(COLD_X - 1.2, T0 + 8, COLD_X + 1.2, T1 + 2, "#f6f8fa", "#56606a"));
    out.push(rect(ANODE_X - 0.9, T0 + 22, ANODE_X + 0.9, T1 + 2, "#b6bcc3", "#56606a"));
    out.push(rect(HOT_X - 1.4, T1 - 4, HOT_X + 1.4, T1 + 2, "#e7c9a8", "#6e3a1c"));
    // the thermostat's sensor well, low on the tank, through the wall from the gas valve
    out.push(rect(-R + IN - 0.6, 36, -R + 10, 38, "#c9a85a", "#6b5114"));
    out.push("</g>");
    return out.join("");
  }
  // Pipes and fittings outside the cut: cold in and hot out on top, the flue's draft hood and vent, the T&P valve and
  // its discharge pipe, the drain valve, the gas valve with its knob and the gas line.
  function fittingsSvg(P) {
    const out = [];
    for (const [x, tint] of [[COLD_X, COPPER], [HOT_X, COPPER]]) {
      out.push(ISO.tinted(BRASS, S(G.disc(Z1, Z1 + 2.5, 1.9, yA([x, -4, 0]), P), { tone: "hi" })));
      out.push(ISO.tinted(tint, S(G.disc(Z1 + 2.5, Z1 + 14, 1.2, yA([x, -4, 0]), P, { steps: 18 }), { tone: "hi" })));
      out.push(ISO.tinted(tint, S(G.sphereOf([x, -4, Z1 + 14], 1.4, P), { tone: "hi" }) + S(G.disc(0, 12, 1.2, G.frameAlong([x, -4, Z1 + 14], [Math.sign(x), 0, 0]), P, { steps: 18 }), { tone: "hi" })));
    }
    out.push(ISO.tinted(STEEL, S(G.solidOf([[Z1 + 0.6, 4], [Z1 + 4, 7, 1], [Z1 + 6, 7]], yA([0, -2, 0]), P), { tone: "mid" }) + S(G.disc(Z1 + 6, Z1 + 16, 4, yA([0, -2, 0]), P), { tone: "hi" })));
    // T&P valve on the right side near the top, lever up, discharge pipe down the side to 15 cm above the floor
    const tp = [R, -2, Z1 - 12];
    out.push(ISO.tinted(BRASS, S(G.disc(0, 3, 1.4, G.frameAlong(tp, [1, 0, 0]), P), { tone: "hi" }) + S(G.sphereOf([R + 4, -2, Z1 - 12], 2, P), { tone: "hi" })));
    out.push(ISO.tinted(BRASS, ISO.box((u, w, y) => [R + 4 + w, -2 + y, Z1 - 12 + u], P, [1.6, 6], [-0.4, 0.4], [-0.5, 0.5], "hi")));
    out.push(ISO.tinted(COPPER, S(G.disc(0, Z1 - 12 - 2 - 15, 1.1, G.frameAlong([R + 4, -2, Z1 - 14], [0, 0, -1]), P, { steps: 16 }), { tone: "hi" })));
    // drain valve low on the left, gas valve above it with its knob and the black gas pipe
    out.push(ISO.tinted(BRASS, S(G.disc(0, 4, 1.3, G.frameAlong([-R, -2, Z0 + 6], [-1, 0, 0]), P), { tone: "hi" }) + S(G.disc(4, 5.5, 2, G.frameAlong([-R, -2, Z0 + 6], [-1, 0, 0]), P), { tone: "mid" })));
    out.push(ISO.wbox(P, [-R - 6, -R], [-5, 1], [30, 40], "mid"), ISO.tinted(ISO.T.red, S(G.disc(0, 1.5, 2, G.frameAlong([-R - 6, -2, 37], [-1, 0, 0]), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 24, 1, G.frameAlong([-R - 3, -2, 30], [0, 0, -1]), P, { steps: 16 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "waterheater", title: "Tank water heater", compare: "waterheater 470 290 400",
    about: "A gas tank water heater cut open: cold water goes down the dip tube to the bottom, hot leaves from the top, and the burner lights when the thermostat feels the cold coming up.",
    line: "waterheater cx cy height tap=0|1 lab=1 lit=tank|diptube|burner|tp|drain|anode|flue",
    demo: { line: "waterheater 470 290 400", script: [{ set: {}, hold: 1 }, { set: { tap: 1 }, hold: 4 }, { set: { tap: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.9, H = size * 1.18, id = `wh${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -3, 0), [0, 0, Z1 + 18], [COLD_X - 12, -4, Z1 + 16], [HOT_X + 12, -4, Z1 + 16], [-R - 8, 0, 0], [R + 6, 0, 0]], cx, cy, W, H, { azimuth: 76, elevation: 14 }, parent);
      g.innerHTML = `<style>.${id}-f path{stroke-dasharray:2 6;animation:${id}-a 1s linear infinite}@keyframes ${id}-a{to{stroke-dashoffset:-16}}@media (prefers-reduced-motion:reduce){.${id}-f path{animation:none}}</style>` +
        `<g>${shellSvg(P)}</g><g data-name="tank"></g><g data-name="fittings">${fittingsSvg(P)}</g><g class="${id}-f" data-part="flow"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { tank: q("tank"), flow: q("flow"), words: q("words") }, w = ISO.writer();
      // the burner's row of flames on the cut face, as a shader: each jet is the flame field laid in the section's
      // plane. The chamber is dark, so the ink is turned into light: what it would show on white, at its own cover.
      const fx = ISO.gl(g, P, W, H, q("fittings"), `uniform float uF;void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec3 q=onWallY(vb,.02);vec4 c=vec4(0.);
        for(int i=0;i<11;i++){float x=-7.+1.4*float(i);vec4 f=flameUS(q.x-x,q.z-${(CH[0] + 6).toFixed(1)},2.6+2.6*uF,.95,uTime+float(i)*.9);c=over(vec4(pow(clamp(f.rgb+1.-f.a,0.,1.),vec3(2.4))*f.a,f.a),c);}
        gl_FragColor=finish(c*smoothstep(0.,.3,uF));}`, ["uF"]);
      const s = { tap: +(o.tap === "1"), h: 1, burner: false, flame: 0 };
      let lit = o.lit || "";
      const flowD = {
        cold: K.pathOf([[COLD_X - 12, -4, Z1 + 14], [COLD_X, -4, Z1 + 14], [COLD_X, 0.05, T1], [COLD_X, 0.05, T0 + 8]].map((p) => K.iso(p, P))),
        hot: K.pathOf([[HOT_X, 0.05, T1 - 4], [HOT_X, -4, Z1 + 14], [HOT_X + 12, -4, Z1 + 14]].map((p) => K.iso(p, P))),
      };
      const draw = () => {
        if (fx) fx.set({ uF: s.flame }, s.flame > 0.002);
        w.rebuild(el.tank, `${s.h.toFixed(3)} ${fx ? 0 : s.flame.toFixed(2)}`, () => sectionSvg(P, id, s.h, fx ? 0 : s.flame));
        w.rebuild(el.flow, String(s.tap), () => (s.tap ? `<path d="${flowD.cold}" fill="none" stroke="#2b6cc4" stroke-width="1.6" stroke-linecap="round"/><path d="${flowD.hot}" fill="none" stroke="#d0392b" stroke-width="1.6" stroke-linecap="round"/>` : ""));
        w.rebuild(el.words, lab ? `${s.tap} ${s.burner}` : "", () => !lab ? "" : [
          ISO.word(K.iso([COLD_X - 12, -4, Z1 + 14], P), "cold in", "#2b6cc4", { anchor: "end", size: 14, dy: 4 }),
          ISO.word(K.iso([HOT_X + 12, -4, Z1 + 14], P), "hot out", "#c0392b", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([COLD_X, 0, T0 + 30], P), "dip tube", "#444", { anchor: "end", size: 14, dy: 4 }),
          ISO.word(K.iso([R + 5, -2, Z1 - 12], P), "T&P relief valve", "#444", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([-R - 5.5, -2, Z0 + 6], P), "drain valve", "#444", { anchor: "end", size: 14, dy: 4 }),
          ISO.word(K.iso([-R - 6, -2, 40], P), "gas valve and thermostat", "#444", { anchor: "end", size: 14, dy: -6 }),
          ISO.word(K.iso([0, 0, CH[0] + 6], P), s.burner ? "burner on" : "burner", s.burner ? "#b5541a" : "#444", { size: 14, dy: 22 })].join(""));
        const want = lit || (s.burner ? "burner" : s.tap ? "diptube" : "");
        w.light([q("tank"), q("fittings")], want === "tp" || want === "drain" ? [q("fittings")] : want ? [q("tank")] : []);
      };
      g.set = (p) => { if (p.tap !== undefined) s.tap = +p.tap ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        // 2 gal/min out of 40 gal: the hot layer shrinks 5 % a minute; the burner recovers about 1.7 % a minute.
        // Here a minute passes in a second.
        const sensor = (36 - T0) / (T1 - T0);                     // the thermostat feels cold once the line passes it
        if (1 - s.h > sensor) s.burner = true;
        if (s.h >= 1) s.burner = false;
        s.h = ISO.clamp(s.h + ((s.burner ? 0.017 : 0) - (s.tap ? 0.05 : 0)) * dt * (calm ? 0 : 1), 0, 1);
        if (calm) { s.h = s.tap ? s.h : 1; s.burner = !!s.tap; }
        s.flame = ISO.follow(s.flame, s.burner ? 1 : 0, dt, 0.2, calm); if (Math.abs(s.flame - (s.burner ? 1 : 0)) < 0.01) s.flame = s.burner ? 1 : 0;
        draw();
        return s.tap || s.burner || (s.flame > 0 && s.flame < 1);
      };
      g.readout = () => {
        const hot = Math.round(s.h * 40);
        return `${s.tap ? "hot tap running, 2 gal a minute · cold filling from the bottom" : "taps shut"} · about ${hot} of 40 gal still at 120 °F · burner ${s.burner ? "ON, 40,000 BTU/h" : "off"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
