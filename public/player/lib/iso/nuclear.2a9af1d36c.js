// "nuclear cx baseY width rods=0..1 lab=1" — a pressurised-water nuclear power station as a museum cut-away model.
// On a walnut plinth: the site cut open along its front. The containment (concrete wall and dome, cut in half) holds
// the pressure vessel with its core of fuel and the control rods above it, the pressuriser, the steam generator with
// its U-tubes and the reactor coolant pump on the primary loop. The main steam line runs out through the wall to the
// turbine hall (high- and low-pressure turbines, generator, condenser under them), and a cooling-water loop runs to a
// hyperbolic cooling tower whose plume of water vapour is a WebGL layer (SVG puffs without WebGL). Pull the rods out
// (rods=0) and the core glows Cherenkov blue, the loops flow, the turbine turns and the tower steams; drop them
// (rods=1) and the chain reaction stops. Readout: 3000 MW of heat, about a third of it as electricity. World units: 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -50, CUT = 0, CX = -92, RC = 30, ZW = 34, IN = 2.6, YE = -12;   // containment centre, radius, wall top, wall, equipment plane
  const PLINTH = { x: -156, y: -58, w: 282, d: 80, r: 4 }, ZG = -20;     // the plinth sits under the ground block
  const TW = [86, -26], QTH = 3000;                                           // tower axis, full thermal MW
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const domeR = (z, r) => (z <= ZW ? r : Math.sqrt(Math.max(0, r * r - (z - ZW) * (z - ZW))));
  const outline = (r, z0) => { const pts = [[CX - r, z0], [CX + r, z0]]; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; pts.push([CX + Math.cos(a) * r, ZW + Math.sin(a) * r]); } return pts; };
  // a capsule (vessel) outline in x–z: centre x, bottom z0, top z1, radius r
  const capsule = (x, z0, z1, r) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; p.push([x + Math.cos(a) * r, z0 + r + Math.sin(a) * r]); } for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; p.push([x + Math.cos(a) * r, z1 - r + Math.sin(a) * r]); } return p; };

  function siteSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, ZG])}">${M.plinth(P, PLINTH)}</g>`];
    const ROCK = M.rect(-150, 120, ZG, -9), SOIL = M.rect(-150, 120, -9, 0);
    out.push(M.sec(P, ROCK, Y0, CUT, "rock", M.grains(P, ROCK, CUT, 40, "#8d939a", 0.7, 5)), M.sec(P, SOIL, Y0, CUT, "soil", M.grains(P, SOIL, CUT, 40, "#9a7a50", 0.5, 2)));
    // the cooling tower's pond and the tower itself (hyperbolic shell on a ring of legs), behind the cut
    const T = M.Z([TW[0], TW[1], 0]);
    out.push(ISO.tinted(M.tintOf("concrete"), S(G.lathe([[0, 0], [0, 23.5], [2, 23.5], [2, 0]], T, P, { steps: 64 }), { tone: "mid" })));
    out.push(`<path d="${G.circleOf(T, 2.02, 21.5, P, 64)}" fill="#a9cff0" stroke="#2f6fae" stroke-width=".6"/>`);
    const r = (z) => 13.5 + 8.5 * Math.pow((z - 46) / 39, 2) * (z < 46 ? 1 : 0.55);
    const prof = [[5.5, 0], [5.5, r(5.5), 1], [20, r(20), 1], [36, r(36), 1], [46, r(46), 1], [56, r(56), 1], [62, r(62), 1], [62, 0]];
    // legs: short posts round the base under the shell
    const legs = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; legs.push({ a, k: K.depthOf([TW[0] + Math.cos(a) * 21, TW[1] + Math.sin(a) * 21, 3], P) }); }
    const legSvg = (a) => ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [TW[0] + Math.cos(a) * r(5.5) - 0.6, TW[0] + Math.cos(a) * r(5.5) + 0.6], [TW[1] + Math.sin(a) * r(5.5) - 0.6, TW[1] + Math.sin(a) * r(5.5) + 0.6], [2, 5.5], "lo"));
    const kc = K.depthOf([TW[0], TW[1], 3], P);
    out.push(legs.filter((l) => l.k < kc).map((l) => legSvg(l.a)).join(""));
    out.push(M.named("tower", ISO.tinted(M.tintOf("concrete"), S(G.lathe(prof, T, P, { steps: 72 }), { tone: "hi", inner: `<path d="${G.arcOf(T, 58, r(58), P)}" fill="none" stroke="#8a8880" stroke-width=".6"/>` }))));
    out.push(legs.filter((l) => l.k >= kc).map((l) => legSvg(l.a)).join(""));
    out.push(`<path d="${G.circleOf(T, 62.02, r(62) - 0.6, P, 64)}" fill="#6f6d68" stroke="#5f5f5c" stroke-width=".6"/>`);
    return out.join("");
  }
  // the turbine hall: back wall, the condenser, turbines and generator on their axis, walls and roof in section
  function hallSvg(P) {
    const out = [ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [-34, 42], [Y0 + 4, Y0 + 7], [0, 30], "lo"))];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-34, 42], [Y0 + 7, Y0 + 9], [24, 25.4], "mid")));      // crane rail
    out.push(M.named("condenser", ISO.tinted(ISO.T.paint, ISO.wbox(P, [-24, 8], [-26, -10], [0, 5.5], "mid")) +
      [-20, -14, -8, -2, 4].map((x) => ISO.tinted(ISO.T.paint, ISO.wbox(P, [x, x + 1], [-10, -9.4], [1, 4.5], "lo"))).join("")));
    const ax = (x) => G.frameOf([x, -18, 14], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 1.2], [44, 1.2], [44, 0]], ax(-28), P, { steps: 16 }), { tone: "mid" })));
    out.push(M.named("turbine", ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 3], [1.5, 4.6, 1], [6, 5.6, 1], [10, 5.6], [11, 3.4], [11, 0]], ax(-27), P, { steps: 40 }), { tone: "hi" })) +
      ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 4], [2, 7.6, 1], [8, 8.6, 1], [14, 8.6], [16, 7.6, 1], [18, 4], [18, 0]], ax(-15), P, { steps: 48 }), { tone: "hi", inner: `<path d="${G.arcOf(ax(-15), 9, 8.62, P)}" fill="none" stroke="#33506f" stroke-width=".6"/>` }))));
    out.push(M.named("generator", ISO.tinted(ISO.T.green, S(G.lathe([[0, 0], [0, 5.4], [0.6, 6, 1], [13.4, 6, 1], [14, 5.4], [14, 0]], ax(6), P, { steps: 40 }), { tone: "hi" })) +
      ISO.tinted(ISO.T.green, ISO.wbox(P, [8, 18], [-24, -12], [0, 8.2], "mid"))));
    return out.join("");
  }
  function hallFront(P) {
    return M.sec(P, M.rect(-38, -34, 0, 30), Y0 + 4, CUT, "concrete") + M.sec(P, M.rect(42, 46, 0, 30), Y0 + 4, CUT, "concrete") + M.sec(P, M.rect(-40, 48, 30, 33), Y0 + 4, CUT, "concrete") +
      [-30, -20, -10, 0, 10, 20, 30, 38].map((x) => face(P, M.rect(x, x + 4, 31, 32.2), "#cfe6f6", "#5d7f96", 0.4)).join("");
  }
  // audit.mjs reads each half-disc slice as solid, so the plant inside the containment shows as "sunk" in it (false
  // positive: the real shell is hollow); the shaft through the turbine casings is sunk on purpose too.
  // the containment: its back half as stacked half-discs, then the cut face (wall and dome in section) and the hole
  function containSvg(P) {
    const out = [], F = (z) => G.frameOf([CX, 0, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    const half = (r) => Array.from({ length: 33 }, (_, i) => { const a = Math.PI + (i / 32) * Math.PI; return [Math.cos(a) * r, Math.sin(a) * r]; });
    const zs = [0, ZW]; for (let i = 1; i <= 14; i++) zs.push(ZW + RC * Math.sin((i / 14) * (Math.PI / 2)));
    const CONC = M.tintOf("concrete");
    // slices without their own edges (no staircase), then one outline round the whole half dome
    const hull = [];
    for (let i = 0; i < zs.length - 1; i++) {
      const r = domeR(zs[i + 1], RC); if (r < 0.5) break;
      half(r).forEach(([u, v]) => hull.push(K.iso([CX + u, v, zs[i]], P), K.iso([CX + u, v, zs[i + 1]], P)));
      out.push(ISO.tinted(CONC, S({ ...G.prismOf(F(zs[i]), half(r), 0, zs[i + 1] - zs[i], P), outline: "" }, { tone: "mid", crease: "none" })));
    }
    out.push(`<path d="${K.pathOf(ISO.hullOf(hull), true)}" fill="none" stroke="#5f5f5c" stroke-width=".9"/>`);
    out.push(face(P, outline(RC, 0), "#e6e4de", "#5f5f5c", 0.9), face(P, outline(RC - IN, 1.2), "#d7d3ca", "#7a766e", 0.6));
    // the inside: floor, the vessel pit's shield wall, polar crane rail
    out.push(ISO.tinted(CONC, S(G.prismOf(F(1.2), half(RC - IN - 0.4), 0, 1.2, P), { tone: "lo" })));
    out.push(ISO.tinted(CONC, ISO.wbox(P, [CX - 22, CX - 19], [-18, -2], [2.4, 16], "lo")), ISO.tinted(CONC, ISO.wbox(P, [CX - 5, CX - 2], [-18, -2], [2.4, 16], "lo")));
    return out.join("");
  }
  // the reactor vessel, pressuriser and steam generator, each cut on the plane y = YE, with the pipes between them
  const VX = CX - 12, SGX = CX + 12;
  function plantSvg(P) {
    const out = [];
    const sec = (pts, mat, d = 6) => M.sec(P, pts, YE - d, YE, mat);
    // primary loop behind the vessels: hot leg out at z 18 to the steam generator, cold leg back low through the pump
    out.push(M.pipe(P, [[VX + 5, YE - 3, 18], [SGX - 4.6, YE - 3, 18], [SGX - 4.6, YE - 3, 9]], 1.5, { body: "#e4a49a", ink: "#8f2a22", shine: "#f6d0ca" }));
    out.push(M.pipe(P, [[SGX + 4.6, YE - 3, 8], [SGX + 8, YE - 3, 8], [SGX + 8, YE - 3, 4], [VX + 3, YE - 3, 4], [VX + 3, YE - 3, 10]], 1.3, { body: "#e9c2bc", ink: "#8f2a22", shine: "#f7dcd8" }));
    out.push(M.named("pump", ISO.tinted(ISO.T.paint, S(K.cylinder(SGX + 8, YE - 3, 2.6, 1.8, 6, P, 24), { tone: "hi" }))));
    // the pressure vessel in section: steel wall, the core of fuel assemblies, the rod drives on the head
    out.push(M.named("reactor", sec(capsule(VX, 3, 28, 5.6), "steel") + face(P, capsule(VX, 3.8, 27.2, 4.6), "#bcdcf5", "#5d7f96", 0.5, YE + 0.06)));
    out.push(M.named("pressuriser", sec(capsule(CX - 26 + 30, 18, 34, 2.6), "steel")));
    out.push(M.named("steam generator", sec(capsule(SGX, 5, 40, 5), "steel") + face(P, capsule(SGX, 5.8, 39.2, 4.1), "#dfe6ec", "#5d7f96", 0.5, YE + 0.06) +
      // the tube bundle: U-tubes rising from the tube sheet
      `<path d="${[1, 2, 3].map((k) => K.pathOf([[SGX - k, YE + 0.1, 10], [SGX - k, YE + 0.1, 26], ...ISO.arc(SGX, 26, k, Math.PI, 0, 8).map(([x, z]) => [x, YE + 0.1, z]), [SGX + k, YE + 0.1, 10]].map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="#c0533a" stroke-width=".7"/>` +
      face(P, M.rect(SGX - 4.1, SGX + 4.1, 9.4, 10.2), "#8d9096", "#3c3f45", 0.4, YE + 0.12)));
    // control rod drive housings on the vessel head
    out.push([-2.4, -0.8, 0.8, 2.4].map((dx) => face(P, M.rect(VX + dx - 0.4, VX + dx + 0.4, 28, 32), "#9aa1a9", "#3c3f45", 0.4, YE + 0.06)).join(""));
    return out.join("");
  }
  function coreSvg(P, rods, glow) {
    const out = [], c = `color-mix(in srgb,#5fb4ff ${Math.round(glow * 85)}%,#e8d9a0)`;
    if (glow > 0.03) out.push(face(P, capsule(VX, 6, 21, 4.4), `color-mix(in srgb,#9fd2ff ${Math.round(glow * 70)}%,#bcdcf5)`, "none", 0, YE + 0.07));
    for (let i = 0; i < 5; i++) out.push(face(P, M.rect(VX - 3.6 + i * 1.5, VX - 2.6 + i * 1.5, 8, 18), c, "#6b5114", 0.4, YE + 0.09));
    const tip = 8.4 + (1 - rods) * 10;                                     // rods 1: tips at the core's bottom
    out.push(M.named("control rods", [-2.85, -0.6, 1.65].map((dx) => face(P, M.rect(VX + dx - 0.3, VX + dx + 0.3, tip, 31), "#2f343a", "#121214", 0.3, YE + 0.11)).join("")));
    return out.join("");
  }
  // steam line out through the wall to the turbine, the feedwater back; the cooling loop to the tower pond
  const STEAM = [[SGX, YE - 3, 40], [SGX, YE - 3, 44], [-50, -18, 44], [-31, -18, 44], [-31, -18, 14], [-27, -18, 14]];
  const FEED = [[-24, -16, 2.6], [-46, -16, 2.6], [SGX + 5.4, YE - 6, 2.6], [SGX + 5.4, YE - 6, 30]];
  const COOL_OUT = [[8, -16, 2.6], [56, -16, 2.6], [56, -16, 4.2], [64.6, -16, 4.2]];
  function pipesSvg(P) {
    return M.named("steam line", M.pipe(P, STEAM, 1.8, { body: "#e1e4e8" })) + M.pipe(P, FEED, 1.1, {}) +
      M.pipe(P, COOL_OUT, 1.8, { body: "#bcd6ee", ink: "#285f98", shine: "#e3f0fa" });
  }
  function puffsSvg(P, t, amount) {
    if (amount < 0.03) return "";
    const k = K.cameraOf(P).k, out = [];
    for (let i = 0; i < 5; i++) { const f = (t * 0.12 + i / 5) % 1, p = K.iso([TW[0] + f * 22, TW[1], 64 + f * 50], P), r = (9 + f * 14) * k; out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}" fill="#f2f4f6" stroke="#c3c9cf" stroke-width=".8" opacity="${(amount * (1 - f) * 0.9).toFixed(2)}"/>`); }
    return out.join("");
  }

  ISO.add({
    name: "nuclear", title: "Nuclear power station", compare: "nuclear 480 420 480",
    about: "A cut-away model of a pressurised-water reactor station: core and control rods, steam generator, turbine, condenser and a cooling tower that steams.",
    line: "nuclear cx baseY width rods=0..1 lab=1 lit=reactor|control rods|steam generator|pump|steam line|turbine|generator|condenser|tower",
    demo: { line: "nuclear 480 450 600 rods=1", script: [{ set: { rods: 0.15 }, hold: 7 }, { set: { rods: 1 }, hold: 5 }] },
    make([cx, by, size = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.05, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, ZG - 13, ZG), [-150, Y0, 64], [120, CUT, 40], [TW[0] + 30, TW[1], 112]], cx, by - H / 2, W, H, { azimuth: 64, elevation: 25 }, parent);
      g.innerHTML = `<g>${siteSvg(P)}</g><g>${hallSvg(P)}</g><g data-part="spin"></g><g>${pipesSvg(P)}</g><g>${hallFront(P)}</g><g>${containSvg(P)}</g><g>${plantSvg(P)}</g><g data-part="core"></g><g data-part="flow"></g><g data-part="puffs"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const top = [TW[0], TW[1], 63].map((v) => v.toFixed(2)).join(",");
      const fx = ISO.gl(g, P, W, H, el.puffs, `uniform float uS;void main(){gl_FragColor=finish(steamInk(viewOf(gl_FragCoord.xy),vec3(${top}),normalize(vec3(.3,0.,1.)),70.,12.,uS,uTime));}`, ["uS"]);
      const rods0 = ISO.clamp(ISO.num(o, "rods", 0.15), 0, 1);
      const s = { rods: rods0, want: rods0, p: 1 - rods0, th: 0, ph: 0, t: 0 };
      let lit = o.lit || "";
      const SPIN = new Map(), gen = G.frameOf([20, -18, 14], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      const draw = () => {
        const rk = `${s.rods.toFixed(3)} ${s.p.toFixed(2)}`;
        w.rebuild(el.core, rk, () => coreSvg(P, s.rods, s.p));
        const q = Math.round((((s.th % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) / (Math.PI / 3) * 16) % 16;
        w.rebuild(el.spin, q, () => { if (!SPIN.has(q)) SPIN.set(q, `<path d="${G.spokesOf(gen, 0.02, 1.6, 5, 6, P, { phase: (q / 16) * (Math.PI / 3) })}" fill="none" stroke="#2c6a22" stroke-width=".8"/>`); return SPIN.get(q); });
        const fk = s.p > 0.02 ? `${(Math.round(s.ph * 2) / 2 % 28).toFixed(1)} ${s.p.toFixed(2)}` : "";
        w.rebuild(el.flow, fk, () => fk && (
          M.flow(P, [[VX + 5, YE - 3, 18], [SGX - 4.6, YE - 3, 18], [SGX - 4.6, YE - 3, 9]], s.ph * 0.6, { amount: s.p, color: "#c0392b", gap: 7, dash: 3, w: 1.1 }) +
          M.flow(P, [[SGX + 4.6, YE - 3, 8], [SGX + 8, YE - 3, 8], [SGX + 8, YE - 3, 4], [VX + 3, YE - 3, 4], [VX + 3, YE - 3, 10]], s.ph * 0.6, { amount: s.p, color: "#c0392b", gap: 7, dash: 3, w: 1 }) +
          M.flow(P, STEAM, s.ph, { amount: s.p, color: "#5f666e", gap: 10, dash: 4, w: 1.3 }) +
          M.flow(P, COOL_OUT, s.ph, { amount: s.p, color: "#1f4f8f", gap: 10, dash: 4, w: 1.3 })));
        if (fx) fx.set({ uS: s.p }, s.p > 0.01);
        else w.rebuild(el.puffs, s.p > 0.03 ? `${(Math.round(s.t * 10) / 10).toFixed(1)} ${s.p.toFixed(2)}` : "", () => puffsSvg(P, s.t, s.p));
        w.rebuild(el.words, lab ? "w" : "", () => !lab ? "" : [
          M.label(P, [CX, CUT, RC + ZW + 4], "containment"), M.label(P, [VX - 6, CUT, 26], "reactor", "#1f4f8f", { anchor: "end" }), M.label(P, [SGX + 6, CUT, 36], "steam generator", "#444", { anchor: "start" }),
          M.label(P, [-4, CUT, 22], "turbine", "#33506f"), M.label(P, [26, CUT, 14], "generator", "#2c6a22"), M.label(P, [-8, CUT, -4], "condenser", "#444", { dy: 4 }),
          M.label(P, [TW[0], -4, 30], "cooling tower", "#444", { anchor: "start" })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.rods !== undefined) s.want = ISO.clamp(+p.rods, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      // rods move at drive speed (dropped rods fall fast: a scram); power follows the rods, the turbine follows power
      g.update = (dt) => {
        const calm = ISO.still(), v = s.want > s.rods ? 1.2 : 0.18;
        s.rods = calm ? s.want : s.rods + Math.sign(s.want - s.rods) * Math.min(Math.abs(s.want - s.rods), dt * v);
        const target = ISO.clamp((1 - s.rods) / 0.85, 0, 1);
        s.p = ISO.follow(s.p, target, dt, s.rods > 0.97 ? 0.6 : 1.4, calm); if (s.p < 0.004 && target === 0) s.p = 0;
        s.t += dt;
        if (!calm) { s.th += dt * 5 * s.p; s.ph += dt * 18 * s.p; }
        draw();
        return s.p > 0 || s.rods !== s.want;
      };
      g.readout = () => {
        const th = QTH * s.p, hot = 290 + 35 * s.p;
        return s.p < 0.01 ? "rods in · no chain reaction · the core still makes decay heat, so the pumps keep cooling it"
          : `rods ${Math.round(s.rods * 100)}% in · heat ${th.toFixed(0)} MW · electricity ≈ ${(th * 0.33).toFixed(0)} MW (about 33%) · coolant 290 → ${hot.toFixed(0)} °C at 155 bar, kept from boiling`;
      };
      draw();
      if (t) label(parent, cx, by - H - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
