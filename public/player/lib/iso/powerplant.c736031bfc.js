// "powerplant cx cy width run=0|1 load=0-100 lab=1 lit=coal|boiler|turbine|generator|tower|chimney|transformer"
// A coal-fired power station, its parts in the order the energy goes: coal from the pile rides the conveyor up into
// the boiler house, where it burns (seen through the cut-away wall: the fire and the water tubes round it) and boils
// water into steam at about 540 °C. The steam pipe carries it to the turbine hall (roof and near wall cut away): it
// spins the turbine at 3000 rpm and the generator on the same shaft. The used steam is cooled back to water by a
// stream of cooling water; that water gives its heat to the air in the cooling tower, which rises as a white plume
// (WebGL, with an SVG fallback). Flue gas leaves by the tall chimney. The transformer steps the voltage up for the
// line out. run=1 starts it; load= sets the output (500 MW at 100). set({ run, load, lit }). World units: 1 = 1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const SITE = { x: -82, y: -52, w: 184, d: 100, r: 3 }, CT = [-50, -12], CTH = 74, CH = [6, -34], CHH = 104, AXZ = 9;
  const CONC = ISO.tint("#ecebe6", ["#bdbbb3", "#c9c7bf", "#d5d3cc", "#e0ded8"], "#6a685f"), BRICK = ISO.tint("#f1e3d6", ["#c9a88f", "#d4b6a0", "#dec4b1", "#e8d3c3"], "#6e4a32");
  const TOWER = [[6, 0], [6, 25], [24, 19.5, 1], [46, 15.6, 1], [62, 16, 1], [CTH, 17.6], [CTH, 0]];

  function groundSvg(P) {
    const out = [ISO.tinted(ISO.tint("#e6ead9", ["#b3b9a2", "#bec4ae", "#c9cfba", "#d4d9c6"], "#5a604c"), S(K.slabOf(SITE, 0, 2, P, 4), { tone: "lo", halo: true }))];
    // cooling water: the warm pipe out of the condenser to the tower and the cool one back, low along the ground
    for (const y of [-26, -30]) out.push(ISO.tinted(ISO.T.steel, S(G.disc(-30, 40, 1.4, xAx([0, y, 3.4]), P, { steps: 16 }), { tone: "mid" })));
    return out.join("");
  }
  function towerSvg(P) {
    const out = [], F = zAx([CT[0], CT[1], 0]);
    // the ring of raking legs the shell stands on (back ones first), then the shell and its open top
    const legs = Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI * 2).sort((a, b) => K.depthOf([Math.cos(a), Math.sin(a), 0], P) - K.depthOf([Math.cos(b), Math.sin(b), 0], P));
    for (const a of legs) out.push(ISO.tinted(CONC, S(K.cylinder(CT[0] + 24.6 * Math.cos(a), CT[1] + 24.6 * Math.sin(a), 0.7, 2, 4, P, 8), { tone: "mid", crease: "none" })));
    out.push(`<g data-name="tower">${ISO.tinted(CONC, S(G.lathe(TOWER, F, P, { steps: 72 }), { tone: "hi" }))}</g>`);
    out.push(`<path d="${G.circleOf(F, CTH + 0.02, 16.8, P, 64)}" fill="#8f949a" stroke="#4a4f56" stroke-width=".6"/>`);
    return out.join("");
  }
  function chimneySvg(P) {
    const F = zAx([CH[0], CH[1], 0]), out = [ISO.tinted(CONC, S(K.cylinder(CH[0], CH[1], 5, 2, 1.4, P, 28), { tone: "mid" }))];
    out.push(`<g data-name="chimney">${ISO.tinted(CONC, S(G.lathe([[3.4, 0], [3.4, 3.4], [CHH, 2.3], [CHH, 0]], F, P, { steps: 32 }), { tone: "hi" }))}`);
    // two red bands near the top, ending on the shaft's silhouette
    for (const z of [CHH - 12, CHH - 4]) out.push(ISO.tinted(ISO.T.red, S(G.ringBand(z, z + 4, 0, 3.4 - (1.1 * z) / CHH + 0.05, F, P, { steps: 32 }), { tone: "mid" })));
    out.push(`<path d="${G.circleOf(F, CHH + 0.02, 1.8, P, 24)}" fill="#3a3e44"/></g>`);
    return out.join("");
  }
  // the boiler house: a tall brick block with its near wall cut open on the fire and the water tubes
  function boilerSvg(P) {
    const out = [`<g data-name="boiler">${ISO.tinted(BRICK, ISO.wbox(P, [-8, 18], [-22, 4], [2, 54], "mid"))}`];
    out.push(ISO.tinted(BRICK, ISO.wbox(P, [-9, 19], [-23, 5], [54, 56], "mid")));
    const face = (pts, fill, ink, w = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 4.05, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"/>`;
    out.push(face([[-4, 8], [14, 8], [14, 44], [-4, 44]], "#2a2422", "#1a1412", 0.8), "</g>");
    return out.join("");
  }
  // the fire and the tubes through the cut, rebuilt as the fire flickers
  function fireSvg(P, f, t) {
    if (f < 0.01) return "";
    const pts = (z0, h, k) => { const p = []; for (let i = 0; i <= 18; i++) { const x = -3 + (16 * i) / 18, top = z0 + h * (0.5 + 0.5 * Math.sin(i * 1.3 + t * 7 + k)) * (0.55 + 0.45 * Math.sin((Math.PI * i) / 18)); p.push([x, top]); } return [[13, z0], [-3, z0], ...p]; };
    const face = (q, fill, op) => `<path d="${K.pathOf(q.map(([x, z]) => K.iso([x, 4.06, z], P)), true)}" fill="${fill}" opacity="${op}"/>`;
    return face([[-4, 8], [14, 8], [14, 44], [-4, 44]], "#ff9a3a", (0.25 * f).toFixed(2)) + face(pts(9, 22 * f, 0), "#ff8a1a", (0.85 * f).toFixed(2)) + face(pts(9, 13 * f, 2), "#ffd25a", (0.9 * f).toFixed(2));
  }
  function tubesSvg(P) {
    const t = []; for (let x = -3; x <= 13.1; x += 1.6) t.push(K.pathOf([K.iso([x, 4.07, 8], P), K.iso([x, 4.07, 44], P)]));
    return `<path d="${t.join("")}" stroke="#8d9096" stroke-width=".7"/>`;
  }
  function coalSvg(P) {
    const out = [`<g data-name="coal">${ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 13], [3, 11, 1], [7, 6, 1], [9, 1.5]], zAx([-24, 30, 2]), P, { steps: 40 }), { tone: "lo" }))}</g>`];
    // the conveyor gantry from the pile up into the boiler house, on two trestles
    const A = [-18, 24, 6], B = [-8, 2, 40], at = (u, w, v) => [A[0] + (B[0] - A[0]) * u + w * 0.91, A[1] + (B[1] - A[1]) * u + w * 0.41, A[2] + (B[2] - A[2]) * u + v];
    for (const u of [0.25, 0.65]) { const p = at(u, 0, 0); out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [p[0] - 0.6, p[0] + 0.6], [p[1] - 0.6, p[1] + 0.6], [2, p[2] - 1.6], "mid"))); }
    out.push(ISO.tinted(ISO.T.steel, ISO.box(at, P, [0, 1], [-1.4, 1.4], [-1.6, 0.6], "mid")));
    return out.join("");
  }
  // the turbine hall: floor, far wall, the end walls, roof bays at each end; inside, the machine on its plinth
  function hallSvg(P) {
    const out = [], w = (x, y, z, tone = "mid") => ISO.tinted(CONC, ISO.wbox(P, x, y, z, tone));
    out.push(w([20, 74], [-14, 10], [2, 3], "lo"), w([20, 74], [-14, -13], [3, 24]), w([72.8, 74], [-13, 10], [3, 24]), w([20, 21.2], [-13, 10], [3, 24]));
    out.push(w([20, 30], [-14, 10], [24, 25.4]), w([64, 74], [-14, 10], [24, 25.4]));
    out.push(w([26, 70], [-5, 5], [3, 5], "mid"));
    // turbine casings HP, IP, LP (the shaft runs through them all: audit.mjs reports it sunk in each) (growing as the steam expands), then the generator and its exciter
    out.push(`<g data-name="turbine">${ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 2.2], [5, 2.6, 1], [5, 0]], xAx([27, 0, AXZ]), P, { steps: 32 }), { tone: "hi" }))}`);
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 2.8], [6, 3.4, 1], [6, 0]], xAx([32.6, 0, AXZ]), P, { steps: 32 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 3.4], [2, 4.2, 1], [9, 4.2, 1], [11, 3.4], [11, 0]], xAx([39.4, 0, AXZ]), P, { steps: 36 }), { tone: "hi" })), "</g>");
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(26, 66, 0.5, xAx([0, 0, AXZ]), P, { steps: 14 }), { tone: "mid" })));
    out.push(`<g data-name="generator">${ISO.tinted(ISO.T.blue, S(G.lathe([[0, 0], [0, 3], [0.6, 3.6], [11, 3.6], [11.6, 3], [11.6, 0]], xAx([51.4, 0, AXZ]), P, { steps: 36 }), { tone: "hi", inner: `<path d="${G.ribsOf(xAx([51.4, 0, AXZ]), 1, 10.6, 3.62, 20, P) || ""}" fill="none" stroke="#5b84b8" stroke-width=".5"/>` }))}`);
    out.push(ISO.tinted(ISO.T.blue, S(G.disc(63.6, 67, 1.8, xAx([0, 0, AXZ]), P, { steps: 24 }), { tone: "mid" })), "</g>");
    // the steam pipe from the boiler house across to the HP turbine's top
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(18, 29, 0.9, xAx([0, -4, 32]), P, { steps: 14 }), { tone: "mid" }) + S(K.cylinder(29, -4, 0.9, AXZ + 1, 32 - AXZ - 0.1, P, 14), { tone: "mid" })));
    // the near wall, cut low so the machine shows
    out.push(w([21.2, 72.8], [8.8, 10], [3, 5.4]));
    return out.join("");
  }
  function transformerSvg(P) {
    const out = [`<g data-name="transformer">${ISO.tinted(CONC, ISO.wbox(P, [78, 92], [-8, 6], [2, 3], "lo"))}`];
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [80, 90], [-5, 3], [3, 11], "mid")));
    for (let y = -4.2; y <= 2.3; y += 1.3) out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [90, 91.4], [y, y + 0.5], [4, 10], "mid")));
    for (const y of [-3.4, -1, 1.4]) out.push(ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 0.7], [1.2, 0.6], [1.4, 0.9], [2.4, 0.5], [2.6, 0.8], [3.6, 0.4]], zAx([85, y, 11]), P, { steps: 12 }), { tone: "mid" })));
    // the gantry the line leaves from
    for (const y of [-6, 4]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [95, 96], [y, y + 1], [2, 22], "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [94.4, 96.6], [-7, 6], [22, 23.2], "mid")), "</g>");
    return out.join("");
  }
  function wiresSvg(P) {
    const out = [];
    for (const y of [-3.4, -1, 1.4]) { const a = K.iso([85, y, 14.6], P), c = K.iso([95.5, y * 2, 22], P), m = K.iso([90, y * 1.5, 16], P); out.push(`<path d="M${a[0]} ${a[1]}Q${m[0]} ${m[1]} ${c[0]} ${c[1]}" fill="none" stroke="#5a5f66" stroke-width=".7"/>`); }
    return out.join("");
  }
  function marksSvg(P, a) {
    const out = [];
    for (const [x0, x1, r] of [[52.6, 61.6, 3.62], [41.4, 48.4, 4.22]]) for (let k = 0; k < 4; k++) {
      const ang = a + (k * Math.PI) / 2, n = [0, Math.cos(ang), Math.sin(ang)];
      if (K.depthOf(n, P) - K.depthOf([0, 0, 0], P) < 0.1) continue;
      out.push(`<path d="${K.pathOf([K.iso([x0, r * n[1], AXZ + r * n[2]], P), K.iso([x1, r * n[1], AXZ + r * n[2]], P)])}" stroke="#2a3f60" stroke-width=".9"/>`);
    }
    return out.join("");
  }
  // SVG fallback for the plume: soft circles rising from the tower's mouth and the chimney's top
  function puffsSvg(P, amt, t, k) {
    if (amt < 0.02) return "";
    const out = [];
    for (let i = 0; i < 7; i++) { const f = (t * 0.12 + i / 7) % 1, p = K.iso([CT[0] + f * 10, CT[1], CTH + 2 + f * 46], P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${((10 + f * 14) * k).toFixed(1)}" fill="#eef1f4" stroke="#c9ced4" stroke-width=".6" opacity="${(amt * 0.85 * (1 - f)).toFixed(2)}"/>`); }
    for (let i = 0; i < 4; i++) { const f = (t * 0.15 + i / 4) % 1, p = K.iso([CH[0] + f * 6, CH[1], CHH + 1 + f * 22], P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${((2 + f * 5) * k).toFixed(1)}" fill="#d6d9dd" opacity="${(amt * 0.6 * (1 - f)).toFixed(2)}"/>`); }
    return out.join("");
  }

  ISO.add({
    name: "powerplant", title: "Coal power station", compare: "powerplant 480 270 440",
    about: "A coal power station: coal burns in the boiler, its steam spins the turbine and generator, the cooling tower gets rid of the spare heat as a white plume, and a transformer sends the power out.",
    line: "powerplant cx cy width run=0|1 load=0-100 lab=1 lit=coal|boiler|turbine|generator|tower|chimney|transformer",
    demo: { line: "powerplant 480 270 480 run=0", script: [{ set: {}, hold: 1 }, { set: { run: 1, lit: "boiler" }, hold: 3 }, { set: { lit: "turbine" }, hold: 2.5 }, { set: { lit: "tower" }, hold: 3 }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, H = size * 1.08;
      const { P, g } = ISO.frame([...K.boxCorners(SITE, 0, 2), [CT[0] + 10, CT[1], CTH + 62], [CH[0] + 6, CH[1], CHH + 34], [96, 6, 24]], cx, cy, W, H, { azimuth: 36, elevation: 22 }, parent);
      const k = K.cameraOf(P).k;
      // far to near: chimney, cooling tower, boiler house, coal and conveyor, turbine hall, transformer
      const parts = [[CH, chimneySvg(P)], [CT, towerSvg(P)], [[5, -9], boilerSvg(P)], [[-20, 26], coalSvg(P)], [[47, -2], hallSvg(P)], [[86, -1], transformerSvg(P)]]
        .sort((a, b) => K.depthOf([a[0][0], a[0][1], 0], P) - K.depthOf([b[0][0], b[0][1], 0], P));
      g.innerHTML = `<g>${groundSvg(P)}</g>${parts.map(([, svg]) => `<g>${svg}</g>`).join("")}<g>${wiresSvg(P)}</g><g data-part="plume"></g><g data-part="words"></g>`;
      // the fire and tubes go into the boiler's cut, the shaft marks on the machine
      const boiler = g.querySelector('[data-name="boiler"]'), fire = mk("g", {}, boiler);
      const tubes = mk("g", {}, boiler); tubes.innerHTML = tubesSvg(P);
      const marks = mk("g", {}, g.querySelector('[data-name="generator"]'));
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { plume: q("plume"), words: q("words") }, w = ISO.writer();
      const plumeAt = (O, D, len, r0, a) => `steamInk(vb,vec3(${O.map((v) => v.toFixed(1)).join(",")}),normalize(vec3(${D.join(",")})),${len.toFixed(1)},${r0.toFixed(1)},${a},uTime)`;
      const fx = ISO.gl(g, P, W, H, el.plume, `uniform float uA;void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=${plumeAt([CT[0], CT[1], CTH], [0.18, 0, 1], 52, 13, "uA")};c=over(${plumeAt([CH[0], CH[1], CHH], [0.2, 0, 1], 26, 2.2, "uA*.45")},c);gl_FragColor=finish(c);}`, ["uA"]);
      const s = { run: o.run === "1" ? 1 : 0, want: o.run === "1" ? 1 : 0, load: ISO.clamp(ISO.num(o, "load", 100), 0, 100) / 100, a: 0, t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const f = s.run * (0.4 + 0.6 * s.load);
        w.rebuild(fire, f > 0.01 ? `${(Math.round(s.t * 12) / 12).toFixed(2)} ${f.toFixed(2)}` : "", () => fireSvg(P, f, Math.round(s.t * 12) / 12));
        w.rebuild(marks, (Math.round(s.a * 40) / 40).toFixed(3), () => marksSvg(P, s.a));
        if (fx) fx.set({ uA: f }, f > 0.01);
        else w.rebuild(el.plume, f > 0.02 ? `${(Math.round(s.t * 20) / 20).toFixed(2)} ${f.toFixed(2)}` : "", () => puffsSvg(P, f, s.t, k));
        const on = s.run > 0.5;
        w.rebuild(el.words, lab ? `${on}` : "", () => !lab ? "" : [
          ISO.word(K.iso([CT[0], CT[1] + 20, 30], P), "cooling tower", "#444", { size: 13, anchor: "end" }),
          ISO.word(K.iso([CH[0], CH[1], CHH], P), "chimney", "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="8" x="'),
          ISO.word(K.iso([5, 4, 54], P), on ? "boiler: coal fire boils water" : "boiler", on ? "#b5541a" : "#444", { size: 13, dy: -8 }),
          ISO.word(K.iso([-24, 30, 12], P), "coal", "#444", { size: 13, dy: -6 }),
          ISO.word(K.iso([38, 10, 5], P), "turbine", "#444", { size: 13, dy: 18 }),
          ISO.word(K.iso([57, 10, 5], P), "generator", "#1f4f8f", { size: 13, anchor: "start", dy: 18 }),
          ISO.word(K.iso([88, 6, 2], P), "transformer", "#444", { size: 13, anchor: "start", dy: 16 })].join(""));
        const named = ["coal", "boiler", "turbine", "generator", "tower", "chimney", "transformer"].map(q);
        w.light(named, [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.run !== undefined) s.want = +p.run ? 1 : 0;
        if (p.load !== undefined) s.load = ISO.clamp(+p.load, 0, 100) / 100;
        if (p.lit !== undefined) lit = p.lit;
      };
      // a real station takes hours to warm up; here the fire and the turbine come up over a few seconds
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.run = ISO.follow(s.run, s.want, dt, 0.9, calm); if (Math.abs(s.run - s.want) < 0.003) s.run = s.want;
        if (!calm) s.a = (s.a + dt * 2.2 * s.run) % (Math.PI * 2);
        draw();
        return s.run !== s.want || s.run > 0;
      };
      g.readout = () => s.run < 0.02 ? "stopped · no fire, no steam, no power"
        : `${Math.round(500 * s.load * s.run)} MW out · steam ≈ 540 °C spins the turbine at ${Math.round(3000 * Math.min(1, s.run * 1.05))} rpm · about 38 % of the coal's heat becomes electricity, most of the rest leaves in the cooling tower's plume`;
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
