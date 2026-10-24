// "aerocar cx cy length v=0..40 k=boxy|sleek lab=1 lit=car|smoke|balance|fan" — a model car in a smoke wind tunnel.
// On the base board: the tunnel floor with a turntable, a glass back wall so the smoke shows, a smoke rake upstream
// (seven nozzles on a pipe, fed by a hose from the smoke generator), the car on the turntable, the fan housing
// downstream and the drag balance's dial on its stand. set({ v }) runs the air (m/s): smoke streams rise over the
// car and leave a wake of swirls behind it. set({ k }) changes the body: boxy (upright screen, flat back: the flow
// breaks away in a big wake, Cd ≈ 0.40, frontal area 2.6 m²) or sleek (raked screen, long tapering tail: a small
// wake, Cd ≈ 0.26, 2.0 m²). Drag = ½ ρ v² Cd A with ρ = 1.2 kg/m³; the dial reads it in newtons.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BOARD = { x: -176, y: -46, w: 352, d: 96, r: 5 }, FLOOR = { x: -168, y: -40, w: 336, d: 72, r: 2 }, FZ = 3, CZ = 3.6, WY = 22;
  const BOXY = [[-50, 8], [-50, 22], [-46, 27], [-22, 30], [-13, 47], [-9, 51], [34, 51], [46, 49], [50, 45], [50, 12], [47, 8]];
  const SLEEK = [[-50, 8], [-53, 15], [-47, 21], [-25, 25], [-8, 37], [2, 40], [14, 39], [36, 29], [52, 21], [52, 12], [47, 8]];
  const WIN_B = [[-12, 31], [-8.5, 47], [32, 47], [32, 31]], WIN_S = [[-21, 26], [-6, 35.5], [13, 35.5], [31, 28]];
  const CD = [0.4, 0.26], AREA = [2.6, 2.0], RHO = 1.2, RAKE = -128, ZS = [14, 24, 34, 44, 54, 64, 74];
  const lerp = (a, b, t) => a + (b - a) * t, mixPts = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const PAINT = ISO.tint("#e8503f", ["#9c2a1f", "#b2372b", "#c64536", "#d84f40"], "#5a140e");

  ISO.add({
    name: "aerocar", title: "Car in a wind tunnel", compare: "aerocar 480 270 480",
    about: "A model car in a smoke wind tunnel: the smoke shows the air flowing over it, and a boxy body leaves a bigger wake and more drag than a sleek one.",
    line: "aerocar cx cy length v=0..40 k=boxy|sleek lab=1 lit=car|smoke|balance|fan",
    demo: { line: "aerocar 480 270 480 k=boxy", script: [{ set: { v: 30, lit: "smoke" }, hold: "settle" }, { set: { k: "sleek", lit: "car" }, hold: "settle" }, { set: { lit: "balance" }, hold: 1.6 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const LAB = window.LAB;
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.78;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -10, 0), [-176, -40, 96], [176, -40, 96], [0, 60, 40]], cx, cy, W, H, { azimuth: 72, elevation: 22 }, parent);
      const st = { v: ISO.clamp(ISO.num(o, "v", 0), 0, 40), b: o.k === "sleek" ? 1 : 0, wantV: 0, wantB: 0, lit: o.lit || "", litDrawn: null };
      st.wantV = st.v; st.wantB = st.b;

      // ── static: board, floor, turntable, glass back wall, smoke generator, rake, fan housing, balance stand
      const out = [ISO.baseboard(P, BOARD, { h: 6, feet: 3, tint: ISO.T.wood })];
      out.push(ISO.tinted(ISO.T.steel, S(K.slabOf(FLOOR, 0, FZ, P, 2, 0.4), { tone: "mid", inner: L(K.sideSeam(FLOOR, FZ / 2, P, 2), { tone: "faint" }) })));
      out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, -4, 44, FZ, CZ - FZ, P, 64), { tone: "hi" })), L(K.ring(0, -4, 40, CZ, P, 64), { tone: "faint" }));
      // back wall: posts, rails and a glass pane at y = -34
      const wall = [ISO.tinted(ISO.T.glass, `<path d="${K.pathOf([[-161, -35, FZ], [130, -35, FZ], [130, -35, 92], [-161, -35, 92]].map((p) => K.iso(p, P)), true)}" fill="#e3eef6" fill-opacity=".75" stroke="#5d7f96" stroke-width="0.8"/>`)];
      for (const x of [-164, -56, 56, 133]) wall.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [x - 3, x + 3], [-39, -33], [FZ, 92], "mid")));
      wall.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [-167, 136], [-39, -33], [92, 97], "mid")));
      // a printed grid on the glass (10 cm squares), for reading the smoke heights
      const grid = [];
      for (let x = -150; x <= 130; x += 20) grid.push(K.segment([x, -35, FZ + 2], [x, -35, 90], P));
      for (let z = 13; z <= 90; z += 10) grid.push(K.segment([-161, -35, z], [130, -35, z], P));
      wall.push(`<path d="${grid.join("")}" stroke="#9db4c6" stroke-width="0.5" fill="none" opacity=".7"/>`);
      out.push(named("wall", wall.join("")));
      // fan housing downstream: a box with a round mouth, the guard and five blades
      const fan = [ISO.tinted(ISO.T.paint, ISO.wbox(P, [140, 166], [-36, 28], [FZ, 90], "mid"))];
      const Ff = xAx([139.9, -4, 48]), rr = 30, fa = G.angleToward(Ff, G.viewOf(P));
      fan.push(`<path d="${G.circleOf(Ff, 0, rr, P)}" fill="#3a3f46" stroke="#1f2328" stroke-width="1"/>`, ISO.tinted(ISO.T.steel, S(G.disc(-4, 0, 5, Ff, P), { tone: "mid" })));
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.3, pts = [[6, a - 0.12], [rr - 2, a - 0.32], [rr - 2, a + 0.12], [6, a + 0.14]].map(([r, aa]) => K.iso([139.8, -4 + Math.cos(aa) * r, 48 + Math.sin(aa) * r], P)); fan.push(`<path d="${K.pathOf(pts, true)}" fill="#8a9099" stroke="#3a3f46" stroke-width="0.6"/>`); }
      fan.push(`<path d="${[10, 20, 30].map((r) => G.circleOf(Ff, -2, r, P)).join("")}${[0, 1, 2, 3].map((k) => K.pathOf([K.iso([137.9, -4, 48], P), K.iso([137.9, -4 + Math.cos(k * Math.PI / 2) * rr, 48 + Math.sin(k * Math.PI / 2) * rr], P)])).join("")}" fill="none" stroke="#c9ced3" stroke-width="0.9"/>`);
      fan.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [136, 140], [-36, -32], [FZ, 90], "mid") + ISO.wbox(P, [136, 140], [24, 28], [FZ, 90], "mid")));
      out.push(named("fan", fan.join("")));
      // smoke generator and the rake: a box, a hose to the foot of the rake pipe, seven nozzles pointing downstream
      out.push(named("smoke", ISO.tinted(ISO.T.paint, ISO.wbox(P, [-168, -148], [14, 30], [FZ, 20], "mid")) + ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-164, -152], [30, 30.6], [12, 17], "hi")) +
        LAB.hose(P, LAB.bend([[-148, 22, 8], [-138, 20, 8], [RAKE - 2, 8, 6], [RAKE, 4, 6]], 6), 1.6, "#55575c") +
        ISO.tinted(ISO.T.steel, S(K.cylinder(RAKE, -4, 6, FZ, 2, P, 20), { tone: "mid" }) + S(K.cylinder(RAKE, -4, 1.8, FZ + 2, 78, P, 14), { tone: "mid" }) + ZS.map((z) => S(G.disc(1.6, 6, 0.9, xAx([RAKE, -4, z]), P), { tone: "mid" })).join(""))));
      // the drag balance: a stand at the front with a round dial facing us, a cable to the turntable
      const BX = 100, BY = 40;
      out.push(named("balance", ISO.tinted(ISO.T.steel, S(K.cylinder(BX, BY, 6, 0, 1.4, P, 20), { tone: "lo" }) + S(K.cylinder(BX, BY, 1.4, 1.4, 20.6, P, 12), { tone: "mid" })) +
        ISO.tinted(ISO.T.paint, ISO.wbox(P, [BX - 13, BX + 13], [BY - 3, BY + 3], [22, 46], "mid")) + LAB.hose(P, LAB.bend([[BX, BY - 3, 26], [BX - 6, BY - 10, 4], [40, 12, 3.5]], 5), 0.8, "#3a3e44")));
      const dialF = yAx([BX, BY + 3.05, 34]);
      out.push(`<path d="${G.circleOf(dialF, 0, 10, P)}" fill="#fbfbf7" stroke="#33506f" stroke-width="0.9"/>`);
      const ticks = [];
      for (let k = 0; k <= 8; k++) { const a = Math.PI * (1.25 - (k / 8) * 1.5), r0 = k % 2 ? 8.4 : 7.4; ticks.push(K.pathOf([K.iso([BX + Math.cos(a) * r0, BY + 3.1, 34 + Math.sin(a) * r0], P), K.iso([BX + Math.cos(a) * 9.4, BY + 3.1, 34 + Math.sin(a) * 9.4], P)])); }
      out.push(`<path d="${ticks.join("")}" stroke="#33506f" stroke-width="0.7" fill="none"/>`, `<g transform="${ISO.faceMatrix(P, [BX, BY + 3.1, 28.6], 1)}"><text text-anchor="middle" style="font:700 2.6px 'Helvetica Neue',Arial,sans-serif" fill="#33506f">N ×100</text></g>`);
      g.innerHTML = out.join("") + `<g data-part="wheelsFar"></g><g data-name="car" data-part="car"></g><g data-part="wheelsNear"></g><g data-name="smoke" data-part="smoke"></g><g data-part="needle"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];

      // ── the car: the side outline blended boxy → sleek, pushed out across its width
      const outline = (b) => mixPts(BOXY, SLEEK, b);
      const topAt = (pts, x) => {
        const up = pts.slice(1, 9);
        if (x <= up[0][0]) return up[0][1];
        for (let i = 1; i < up.length; i++) if (x <= up[i][0]) return lerp(up[i - 1][1], up[i][1], (x - up[i - 1][0]) / (up[i][0] - up[i - 1][0] || 1));
        return up[up.length - 1][1];
      };
      const wheel = (x, y0, y1) => ISO.tinted(ISO.T.rubber, S(G.disc(y0, y1, 10, yAx([x, 0, CZ + 10]), P), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(y1, y1 + 0.4, 6, yAx([x, 0, CZ + 10]), P), { tone: "mid" }));
      el.wheelsFar.innerHTML = wheel(-30, -WY, -WY + 6) + wheel(30, -WY, -WY + 6);
      el.wheelsNear.innerHTML = wheel(-30, WY - 6, WY) + wheel(30, WY - 6, WY);
      const carSvg = (b) => {
        const pts = outline(b).map(([x, z]) => [x, z + CZ]);
        const face = (q, fill, stroke = "none") => `<path d="${K.pathOf(q.map(([x, z]) => K.iso([x, WY + 0.05, z + CZ], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="0.7"/>`;
        const win = mixPts(WIN_B, WIN_S, b), front = outline(b)[1], back = outline(b)[9];
        const extra = face(win, "#2c3a48", "#1a232c") + face([[win[0][0] + (win[3][0] - win[0][0]) * 0.5, win[0][1]], [win[0][0] + (win[3][0] - win[0][0]) * 0.5 + 0.8, win[0][1]], [win[1][0] + (win[2][0] - win[1][0]) * 0.5 + 0.8, win[1][1]], [win[1][0] + (win[2][0] - win[1][0]) * 0.5, win[1][1]]], "#5a140e") +
          `<path d="${K.pathOf([[-4, 12], [-4, 30], [24, 30], [24, 12]].map(([x, z]) => K.iso([x, WY + 0.06, z + CZ], P)))}" fill="none" stroke="#7a2018" stroke-width="0.6"/>` +
          face([[front[0] + 0.5, 16], [front[0] + 6, 16], [front[0] + 6, 19.5], [front[0] + 0.8, 19.5]], "#fff6c8", "#5a140e") + face([[back[0] - 4, 34 - 14 * b], [back[0] - 0.4, 34 - 14 * b], [back[0] - 0.4, 38 - 16 * b], [back[0] - 4, 38 - 16 * b]], "#ff6b5e", "#5a140e");
        return ISO.tinted(PAINT, ISO.prismY(P, pts, -WY + 1, WY - 1, ["#9c2a1f", "#e8604f"], "#e8503f", "#5a140e", extra));
      };
      // ── smoke: streams from each nozzle, lifted over the car (more near the car, less higher up), then a wake
      const smokeSvg = (b, v) => {
        if (v < 0.5) return "";
        const pts = outline(b), nose = Math.min(...pts.map((p) => p[0])), tail = Math.max(...pts.map((p) => p[0])), rearH = topAt(pts, tail - 1);
        const Lw = lerp(110, 40, b), Hc = 40;
        const base = (x) => {
          if (x < nose) return topAt(pts, nose) * Math.exp(-(nose - x) / 14) * 0.6;
          if (x > tail) return rearH * Math.exp(-(x - tail) / Lw);
          let s = 0; for (let k = -2; k <= 2; k++) s += topAt(pts, ISO.clamp(x + k * 5, nose, tail)); return s / 5;
        };
        const lines = [];
        for (const z0 of ZS) {
          const q = [];
          for (let x = RAKE + 6; x <= 134; x += 4) {
            let z = z0 + base(x) * (Hc / (z0 + Hc));
            // never through the body: a soft maximum with the body's top (+3), so the stream bends smoothly over it
            const top = x < nose || x > tail ? 0 : topAt(pts, x) + 3, k = 6;
            z = (z + top + Math.sqrt((z - top) ** 2 + k * k)) / 2;
            // behind a boxy body the low streams are shaken by the wake
            if (x > tail && z0 < rearH * 1.2) z += (1 - b) * 5 * Math.sin(x * 0.22 + z0) * Math.exp(-(x - tail) / Lw) * ISO.smooth(tail, tail + 12, x);
            q.push(K.iso([x, -4, z + CZ], P));
          }
          lines.push(K.pathOf(q));
        }
        // the wake: swirls behind the tail, big for a boxy body, small for a sleek one
        const swirl = [], n = b < 0.5 ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const r = lerp(17, 6, b) * (1 - i * 0.2), xc = tail + r + 2 + i * lerp(30, 13, b), zc = lerp(rearH * 0.5, rearH * 0.5, b) - i * 3, q = [];
          for (let a = 0; a <= Math.PI * 3.4; a += 0.25) { const rr = r * (1 - a / (Math.PI * 4)); q.push(K.iso([xc + Math.cos(-a + i) * rr, -4, zc + CZ + Math.sin(-a + i) * rr], P)); }
          swirl.push(K.pathOf(q));
        }
        const op = ISO.clamp(v / 12, 0, 1).toFixed(2);
        return `<g class="hs-flow" fill="none" stroke-linecap="round" opacity="${op}"><path d="${lines.join("")}" stroke="#7f9bb8" stroke-width="1.5"/><path d="${swirl.join("")}" stroke="#a2b4c6" stroke-width="1.2"/></g>`;
      };
      const drag = () => 0.5 * RHO * st.v * st.v * lerp(CD[0], CD[1], st.b) * lerp(AREA[0], AREA[1], st.b);
      const draw = () => {
        const bq = Math.round(st.b * 50) / 50, vq = Math.round(st.v * 2) / 2;
        w.rebuild(el.car, String(bq), () => carSvg(bq));
        w.rebuild(el.smoke, `${bq} ${vq > 0.5}`, () => smokeSvg(bq, vq));
        const sm = el.smoke.firstChild; if (sm) w.attr(sm, "opacity", ISO.clamp(vq / 12, 0, 1).toFixed(2));
        const F = drag(), fq = Math.round(F / 5) * 5;
        w.rebuild(el.needle, String(fq), () => { const a = Math.PI * (1.25 - Math.min(F, 800) / 800 * 1.5); return `<path d="${K.pathOf([K.iso([BX, BY + 3.2, 34], P), K.iso([BX + Math.cos(a) * 8, BY + 3.2, 34 + Math.sin(a) * 8], P)])}" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>` + K.dotsSvg([K.iso([BX, BY + 3.25, 34], P)], { size: 0.9, tone: "hi" }); });
        if (lab) w.rebuild(el.words, `${bq < 0.5} ${fq}`, () => ISO.word(K.iso([0, 0, 64 + CZ], P), bq < 0.5 ? "boxy body: big wake" : "sleek body: small wake", "#a8382a", { size: 14, dy: -26 }) +
          ISO.word(K.iso([BX, BY, 48], P), `drag ${fq} N`, "#33506f", { size: 13, dy: -4 }) + ISO.word(K.iso([RAKE, -4, 86], P), "smoke rake", "#556", { size: 12 }) + ISO.word(K.iso([152, -4, 94], P), "fan", "#556", { size: 12 }));
        if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => {
        if (p.v !== undefined) st.wantV = ISO.clamp(+p.v, 0, 40);
        if (p.k) st.wantB = p.k === "sleek" ? 1 : 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.v = ISO.follow(st.v, st.wantV, dt, 0.6, calm); if (Math.abs(st.v - st.wantV) < 0.05) st.v = st.wantV;
        st.b = ISO.follow(st.b, st.wantB, dt, 0.5, calm); if (Math.abs(st.b - st.wantB) < 0.004) st.b = st.wantB;
        draw();
        return st.v !== st.wantV || st.b !== st.wantB;
      };
      g.readout = () => {
        const cd = lerp(CD[0], CD[1], st.b), a = lerp(AREA[0], AREA[1], st.b);
        return `air ${st.v.toFixed(0)} m/s (${Math.round(st.v * 3.6)} km/h) · ${st.b < 0.5 ? "boxy" : "sleek"} body, Cd ${cd.toFixed(2)}, frontal area ${a.toFixed(1)} m² · drag = ½ρv²·Cd·A = ${Math.round(drag())} N`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
