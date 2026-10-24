// "track cx cy width race=0..1 lab=1 lit=runners|kerb|starts|finish|stand" — a 400 m running track, as a model.
// The standard oval: two 84.39 m straights joined by bends whose kerb has a 36.5 m radius, so the line 30 cm out from
// the kerb in lane 1 measures exactly 400 m. Four lanes (drawn 2.5× their real 1.22 m so you can see them) with white
// lane lines, the raised kerb round a grass infield with a football pitch and goals, the common finish line at the end
// of the home straight with the lane numbers, and the staggered start lines of a 400 m race: each outer lane starts
// further round so every runner covers 400 m. A grandstand on the far side, four floodlight masts and a finish-judges'
// hut. set({ race: 1 }) runs a 400 m race anticlockwise (inside on the left), shown eight times faster.
// World units: 1 = 1 m.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const ST = 84.39, R0 = 36.5, LW = 3.05, REAL = 1.22, N = 4, HL = ST / 2;
  const BOARD = { x: -104, y: -74, w: 208, d: 136, r: 8 };
  const runR = (n) => R0 + (n - 1) * LW + (n === 1 ? 0.3 : 0.2);           // each lane's measured running line
  const stagger = (n, w = LW) => 2 * Math.PI * ((n - 1) * w + (n === 1 ? 0.3 : 0.2) - 0.3);
  const lap = (n) => 2 * Math.PI * runR(n) + 2 * ST;
  const TIMES = [49.2, 49.9, 50.6, 51.4], SHOWN = 8;                       // finishing times of lanes 1–4
  const RED = ISO.tint("#f1b59a", ["#b8583a", "#c66748", "#d27a5a", "#de8e70"], "#6e2a14");
  const GRASS = ISO.T.green, WHITE = ISO.tint("#fbfbf8", ["#c9cac6", "#d6d7d3", "#e2e3df", "#ecede9"], "#5f605c"), STEEL = ISO.T.steel, PAINT = ISO.T.paint;
  // a point s metres round the line of radius r from the finish (x = −HL, home straight y = +r), running anticlockwise
  const along = (r, s) => {
    const b = Math.PI * r, c = ((s % (2 * b + 2 * ST)) + 2 * b + 2 * ST) % (2 * b + 2 * ST);
    if (c < b) { const a = c / r; return [-HL - r * Math.sin(a), r * Math.cos(a), a + Math.PI]; }
    if (c < b + ST) return [-HL + (c - b), -r, 0];
    if (c < 2 * b + ST) { const a = (c - b - ST) / r; return [HL + r * Math.sin(a), -r * Math.cos(a), a]; }
    return [HL - (c - 2 * b - ST), r, Math.PI];
  };
  const oval = (r, n = 48) => {
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI; pts.push([HL + r * Math.cos(a), r * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * Math.PI; pts.push([-HL + r * Math.cos(a), r * Math.sin(a)]); }
    return pts;
  };
  const flat = (P, pts, z) => K.pathOf(pts.map(([x, y]) => K.iso([x, y, z], P)), true);
  const band = (P, r, half, z) => `<path d="${flat(P, oval(r + half), z)}${flat(P, oval(r - half).reverse(), z)}" fill="#fdfdfb" fill-rule="evenodd" stroke="#8a8a85" stroke-width=".3"/>`;
  // a white strip across lane n at s metres along its running line (a start or the finish), as a closed quad
  const across = (P, r0, r1, s, w, z) => {
    const mid = (r0 + r1) / 2, [x, y, a] = along(mid, s), tx = Math.cos(a), ty = Math.sin(a), nx = -ty, ny = tx, h = (r1 - r0) / 2;
    const q = [[-h, -w], [h, -w], [h, w], [-h, w]].map(([u, v]) => [x + nx * u + tx * v, y + ny * u + ty * v]);
    return `<path d="${flat(P, q, z)}" fill="#fdfdfb" stroke="#8a8a85" stroke-width=".3"/>`;
  };

  function groundSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { h: 5, tint: ISO.T.wood })];
    out.push(ISO.tinted(GRASS, S(K.slabOf({ x: -100, y: -70, w: 200, d: 128, r: 6 }, 0, 0.4, P, 6), { tone: "lo" })));
    const outer = R0 + N * LW + 0.6;
    out.push(ISO.tinted(RED, S(K.extrude(oval(outer), 0.4, 0.8, P), { tone: "mid" })));
    // lane lines between the lanes and the outer line, 5 cm paint (drawn 25 cm)
    for (let n = 1; n <= N; n++) out.push(band(P, R0 + n * LW, 0.2, 1.21));
    // the raised kerb (white) round the infield, the grass inset on its top
    out.push(ISO.tinted(WHITE, S(K.extrude(oval(R0), 0.4, 1.3, P), { tone: "mid" })));
    out.push(`<path d="${flat(P, oval(R0 - 0.6), 1.71)}" fill="#cfe8c6" stroke="#2c6a22" stroke-width=".5"/>`);
    // the football pitch on the infield: touchlines, halfway line and centre circle, painted
    const px = 52, py = 34, pz = 1.72, pitch = [[-px, -py], [px, -py], [px, py], [-px, py]];
    out.push(`<path d="${flat(P, pitch, pz)}" fill="none" stroke="#fdfdfb" stroke-width="1.1"/><path d="${K.pathOf([K.iso([0, -py, pz], P), K.iso([0, py, pz], P)])}" fill="none" stroke="#fdfdfb" stroke-width="1.1"/>`);
    out.push(`<path d="${flat(P, Array.from({ length: 32 }, (_, i) => [9.15 * Math.cos((i / 32) * 2 * Math.PI), 9.15 * Math.sin((i / 32) * 2 * Math.PI)]), pz)}" fill="none" stroke="#fdfdfb" stroke-width="1.1"/>`);
    for (const s of [-1, 1]) out.push(`<path d="${flat(P, [[s * px, -20], [s * (px - 16.5), -20], [s * (px - 16.5), 20], [s * px, 20]], pz)}" fill="none" stroke="#fdfdfb" stroke-width="1.1"/>`);
    // the finish line across all four lanes, the staggered 400 m starts, the lane numbers before the finish
    out.push(`<g data-name="finish">${across(P, R0, R0 + N * LW, 0, 0.35, 1.22)}</g>`);
    const starts = [];
    for (let n = 2; n <= N; n++) starts.push(across(P, R0 + (n - 1) * LW, R0 + n * LW, stagger(n), 0.3, 1.22));
    out.push(`<g data-name="starts">${starts.join("")}</g>`);
    for (let n = 1; n <= N; n++) {
      const r = R0 + (n - 0.5) * LW;
      out.push(`<g transform="${K.topMatrix([-HL + 2.4, r + 1], 1.22, P, "x")}"><text x="0" y="0" text-anchor="middle" fill="#fdfdfb" stroke="#8a3a1a" stroke-width=".1" style="font:800 2.8px 'Helvetica Neue',Arial,sans-serif">${n}</text></g>`);
    }
    return out.join("");
  }
  // goals on the infield, the far floodlights and the grandstand behind the far straight
  function farSvg(P) {
    const out = [];
    for (const s of [-1, 1]) {
      const x = s * 52;
      // the goal stands on the infield grass (the kerb's extruded block, which the audit does not record)
      out.push(ISO.tinted(WHITE, ISO.wbox(P, [x - 0.3, x + 0.3], [-3.96, -3.36], [1.72, 4.2], "mid") + ISO.wbox(P, [x - 0.3, x + 0.3], [3.36, 3.96], [1.72, 4.2], "mid") + ISO.wbox(P, [x - 0.3, x + 0.3], [-3.96, 3.96], [4.2, 4.8], "hi")));
    }
    out.push(mastSvg(P, -HL - 50, -46), mastSvg(P, HL + 50, -46));
    // the stand: a concrete base, four stepped tiers of seats rising away from the track, a roof on columns
    const y0 = -R0 - N * LW - 5, x0 = -50, x1 = 50;
    out.push(ISO.tinted(PAINT, ISO.wbox(P, [x0 - 2, x1 + 2], [y0 - 18, y0], [0.4, 1.4], "lo")));
    for (let i = 3; i >= 0; i--) out.push(ISO.tinted(PAINT, ISO.wbox(P, [x0, x1], [i === 3 ? y0 - 18 : y0 - (i + 1) * 4, y0 - i * 4], [1.4, 3 + i * 2.2], "mid")));
    const rows = [];
    for (let i = 0; i < 4; i++) { const z = 3 + i * 2.2, y = y0 - i * 4 - 1.2; rows.push(K.pathOf([K.iso([x0, y, z], P), K.iso([x1, y, z], P)])); }
    out.push(`<path d="${rows.join("")}" fill="none" stroke="#2f6fd0" stroke-width="1.1"/>`);
    for (let x = x0 + 2; x <= x1 - 2; x += 24) out.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 0.4, x + 0.4], [y0 - 17.6, y0 - 16.8], [9.6, 16], "mid")));
    out.push(ISO.tinted(PAINT, ISO.poly([[x0 - 2, y0 - 19, 16], [x1 + 2, y0 - 19, 16], [x1 + 2, y0 - 2, 14], [x0 - 2, y0 - 2, 14], [x0 - 2, y0 - 19, 16.8], [x1 + 2, y0 - 19, 16.8], [x1 + 2, y0 - 2, 14.8], [x0 - 2, y0 - 2, 14.8]], ISO.BOX_F, P, "mid")));
    return `<g data-name="stand">${out.join("")}</g>`;
  }
  // a floodlight mast: a footing, the pole and a head of lamps facing the track
  function mastSvg(P, x, y) {
    return ISO.tinted(STEEL, S(K.cylinder(x, y, 1.6, 0.4, 0.8, P, 16), { tone: "mid" }) + S(K.cylinder(x, y, 0.5, 1.2, 30, P, 12), { tone: "hi" }) + ISO.wbox(P, [x - 3, x + 3], [y - 0.6, y + 0.6], [31.2, 34.6], "mid")) +
      ISO.tinted(ISO.T.amber, ISO.wbox(P, [x - 2.6, x + 2.6], [y + 0.6, y + 0.9], [31.6, 34.2], "hi"));
  }
  function nearSvg(P) {
    const out = [mastSvg(P, -HL - 50, 46), mastSvg(P, HL + 50, 46)];
    // the finish-judges' hut beside the finish line, with its camera on a post on the roof
    const x = -HL, y = R0 + N * LW + 5;
    out.push(ISO.tinted(PAINT, ISO.wbox(P, [x - 3, x + 3], [y, y + 4], [0.4, 4.4], "mid") + ISO.wbox(P, [x - 3.4, x + 3.4], [y - 0.4, y + 4.4], [4.4, 5], "hi")));
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [x - 2.2, x + 2.2], [y - 0.05, y], [2, 3.8], "hi")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 0.2, x + 0.2], [y + 1.8, y + 2.2], [5, 6.4], "mid") + ISO.wbox(P, [x - 0.6, x + 0.6], [y + 1.2, y + 2.6], [6.4, 7.4], "mid")));
    return out.join("");
  }
  const SKIN = ISO.tint("#f2d3b6", ["#c99a74", "#d4a985", "#deb897", "#e8c7a9"], "#6e4a2a"), VESTS = [ISO.T.blue, ISO.T.red, ISO.T.green, ISO.T.amber];
  // a runner as a model peg: a vest-coloured body and a head, standing on its lane
  const runnerSvg = (P, n, x, y) => `<g data-name="runners">${ISO.tinted(VESTS[n - 1], S(K.cylinder(x, y, 1.05, 1.21, 3.6, P, 16, 0.3), { tone: "mid" }))}${ISO.tinted(SKIN, S(K.cylinder(x, y, 0.8, 4.81, 1.5, P, 14, 0.4), { tone: "mid" }))}</g>`;

  ISO.add({
    name: "track", title: "Running track", compare: "track 480 270 620",
    about: "A model of a 400 m running track: four lanes, the kerb and infield, the common finish line and the staggered starts; four runners run a 400 m race.",
    line: "track cx cy width race=0..1 lab=1 lit=runners|kerb|starts|finish|stand",
    demo: { line: "track 480 275 620", script: [{ set: {}, hold: 1 }, { set: { race: 1 }, hold: "settle" }, { set: {}, hold: 1.5 }] },
    make([cx, cy, size = 620], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.0, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -5, 0), [0, -70, 17]], cx, cy, W, H, { azimuth: 72, elevation: 36 }, parent);
      g.innerHTML = `<g data-name="kerb">${groundSvg(P)}</g><g>${farSvg(P)}</g><g data-k="runners"></g><g>${nearSvg(P)}</g><g data-part="words"></g>`;
      const el = { runners: g.querySelector('[data-k="runners"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const items = {}, anchors = {};
      // (the audit sees the pegs at the origin, before their transform, so it lists them as loose)
      // a peg looks the same wherever it stands (the camera is orthographic), so each is built once and slid about
      for (let n = 1; n <= N; n++) { items[n] = document.createElementNS("http://www.w3.org/2000/svg", "g"); items[n].innerHTML = runnerSvg(P, n, 0, 0); el.runners.append(items[n]); }
      const sort = ISO.sorter(P, el.runners), tmax = Math.max(...TIMES);
      const s = { clock: ISO.clamp(ISO.num(o, "race", 0), 0, 1) * tmax, want: 0 };
      s.want = s.clock;
      let lit = o.lit || "";
      const posOf = (n) => along(runR(n), stagger(n) + 400 * Math.min(1, s.clock / TIMES[n - 1]));
      const draw = () => {
        for (let n = 1; n <= N; n++) {
          const [x, y] = posOf(n);
          w.attr(items[n], "transform", K.translateAlong(P, [x, y, 0]));
          anchors[n] = [x, y, 2];
        }
        sort(items, anchors);
        w.rebuild(el.words, lab ? String(s.clock >= tmax) : "", () => !lab ? "" : [
          ISO.word(K.iso([-HL, R0 + N * LW + 1, 0], P), "finish", "#444", { size: 14, anchor: "end", dy: 18 }),
          ISO.word(K.iso(along(R0 + N * LW + 3, stagger(4) * 1.12), P), "staggered starts", "#444", { size: 13, anchor: "end", dy: 4 }),
          ISO.word(K.iso([0, 0, 2], P), "infield", "#2c6a22", { size: 14, dy: 26 }),
          ISO.word(K.iso([0, R0 + N * LW, 1], P), "lane 1 = 400 m", "#8f2a22", { size: 14, dy: 20 })].join(""));
        const groups = { runners: [...el.runners.children], kerb: [g.querySelector('[data-name="kerb"]')], starts: [g.querySelector('[data-name="starts"]')], finish: [g.querySelector('[data-name="finish"]')], stand: [g.querySelector('[data-name="stand"]')] };
        w.light(Object.values(groups).flat(), groups[lit] || []);
      };
      g.set = (p) => { if (p.race !== undefined) { const v = ISO.clamp(+p.race, 0, 1) * tmax; if (v > s.clock) s.want = v; else { s.clock = s.want = v; } } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        if (s.clock === s.want) { draw(); return false; }
        s.clock = ISO.still() ? s.want : Math.min(s.want, s.clock + dt * SHOWN);
        draw();
        return s.clock !== s.want;
      };
      g.readout = () => {
        const real = [2, 3, 4].map((n) => stagger(n, REAL).toFixed(2)).join(" / ");
        if (s.clock <= 0) return `400 m in lane 1 (straights 84.39 m, kerb radius 36.5 m) · lanes 1.22 m · starts in lanes 2/3/4 are ${real} m ahead`;
        if (s.clock >= tmax) return `finished · lane 1 ${TIMES[0]} s, lane 2 ${TIMES[1]} s, lane 3 ${TIMES[2]} s, lane 4 ${TIMES[3]} s · every runner ran 400 m`;
        return `race clock ${s.clock.toFixed(1)} s · each runner covers 400 m: the outer lanes start ahead because their bends are longer`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
