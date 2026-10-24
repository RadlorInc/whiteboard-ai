// "palette cx cy width mix=0|1 lab=1 lit=palette|paints|brush|jar" — an artist's wooden palette on a table.
// A 30 cm plywood palette with its thumb hole, six blobs of paint round the top (red, yellow, green, blue, white,
// purple, as the app has them), a round brush (wooden handle, metal ferrule, bristles) and a jar of rinsing water.
// set({ mix: 1 }): the brush dips into the yellow, dabs it in the open middle of the palette, dips into the blue and
// stirs the two together: the dab turns green (yellow + blue paint: each pigment soaks up some colours of the light,
// and only the green both let through is left). mix: 0 winds it back to the start. 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const TABLE = { x: -200, y: -150, w: 450, d: 320, r: 10 }, PT = 6;
  // the palette's outline (x, y), a kidney shape with a notch for the thumb at the left
  const OUTLINE = (() => {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2, rx = 150, ry = 104, wob = 1 + 0.06 * Math.sin(3 * a + 0.6) - 0.05 * Math.cos(2 * a);
      pts.push([10 + Math.cos(a) * rx * wob, Math.sin(a) * ry * wob]);
    }
    return pts.slice(0, -1);
  })();
  const HOLE = [-96, 44], HR = [17, 13];
  const PAINTS = [["red", "#e04b3a", [-92, -38]], ["yellow", "#ffd84a", [-44, -76]], ["green", "#5fae3a", [16, -88]], ["blue", "#2b6cc4", [76, -74]], ["white", "#fbfbf7", [124, -36]], ["purple", "#8e5bbf", [134, 22]]];
  const MIX = [28, 8], MIXED = "#5f9e3e";
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const shade = (c, k) => mix(c, "#000000", k);
  const JAR = [205, 122];

  function blob(P, [x, y], r, color, h = 5) {
    const F = DAILY.zAx([x, y, PT]), prof = [[0, 0], [0, r]];
    for (let i = 1; i <= 5; i++) { const t = i / 5; prof.push([h * Math.sin((t * Math.PI) / 2), r * Math.cos((t * Math.PI) / 2) ** 0.7, 1]); }
    prof.push([h, 0]);
    return ISO.tinted(ISO.tint(mix(color, "#ffffff", 0.25), [shade(color, 0.35), shade(color, 0.25), shade(color, 0.15), shade(color, 0.05)], shade(color, 0.6)), S(G.lathe(prof, F, P, { steps: 32 }), { tone: "mid" }));
  }
  function paletteSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -140, y: -104, w: 300, d: 208, r: 90 }, 0, 6, P)}"/>`];
    out.push(DAILY.prism(P, G.frameOf([0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), OUTLINE, 0, PT, ["#b88a52", "#ecc98e"], "#f1d6a4", "#7a5a2e",
      // the thumb hole: through the board, its far wall showing, the table under it
      `<path d="${K.pathOf(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return K.iso([HOLE[0] + Math.cos(a) * HR[0], HOLE[1] + Math.sin(a) * HR[1], PT], P); }), true)}" fill="#c99d62" stroke="#7a5a2e" stroke-width=".8"/>` +
      `<path d="${K.pathOf(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return K.iso([HOLE[0] + Math.cos(a) * HR[0], HOLE[1] + Math.sin(a) * HR[1], 0], P); }), true)}" fill="#e9d2a8" stroke="none"/>` +
      // the plywood's grain across the top, ending on the board's edge (clipped by its outline)
      ""));
    for (const [, c, at] of PAINTS) out.push(blob(P, at, 15, c));
    return out.join("");
  }
  // (audit: the paint blobs sit on the palette, a DAILY.prism the audit does not record ("loose"); the water is inside
  // the jar ("sunk").)
  function jarSvg(P) {
    const F = DAILY.zAx([JAR[0], JAR[1], 0]);
    return ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, 30], [2, 32, 1], [84, 32], [86, 30, 1], [88, 30], [88, 0]], F, P, { steps: 48 }), { tone: "hi" })) +
      ISO.tinted(ISO.tint("#d6e6f2", ["#8fb2cc", "#9fbfd6", "#b0cbdf", "#c1d7e8"], "#3f6a8a"), S(G.disc(4, 60, 29.5, F, P, { steps: 48 }), { tone: "hi" })) +
      `<path d="${G.circleOf(F, 88, 29, P, 48)}" fill="none" stroke="#5d7f96" stroke-width=".7"/>`;
  }
  // The brush with its point at tip, leaning back along dir; the bristles carry the paint they last touched.
  function brushSvg(P, tip, dir, paint) {
    const up = Math.abs(dir[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1], u = G.unit3(G.cross3(up, dir)), v = G.cross3(dir, u);
    const F = G.frameOf(tip, v, u, dir), at = (a, b, c) => G.add3(G.add3(G.add3(tip, G.mul3(u, a)), G.mul3(v, b)), G.mul3(dir, c));
    const ring = (r) => Array.from({ length: 8 }, (_, i) => [Math.cos((i * Math.PI) / 4) * r, Math.sin((i * Math.PI) / 4) * r]), out = [];
    // bristles: a tuft swelling from the point to the ferrule
    const b0 = ring(0.6), b1 = ring(4.4), b2 = ring(4.2), col = paint || "#e9dcc0";
    const V = [...b0.map(([a, b]) => at(a, b, 0.5)), ...b1.map(([a, b]) => at(a, b, 12)), ...b2.map(([a, b]) => at(a, b, 22))];
    const quads = [...b0.map((_, i) => [i, (i + 1) % 8, 8 + ((i + 1) % 8), 8 + i]), ...b0.map((_, i) => [8 + i, 8 + ((i + 1) % 8), 16 + ((i + 1) % 8), 16 + i])];
    out.push(ISO.tinted(ISO.tint(mix(col, "#ffffff", 0.2), [shade(col, 0.4), shade(col, 0.3), shade(col, 0.18), shade(col, 0.06)], shade(col, 0.6)), ISO.poly(V, [[0, 1, 2, 3, 4, 5, 6, 7], ...quads, [16, 17, 18, 19, 20, 21, 22, 23]], P, "mid")));
    out.push(DAILY.prism(P, F, ring(4.6), 22, 42, ["#8d9096", "#e4e5e8"], "#c7c9cd", "#3c3f45"));
    out.push(DAILY.prism(P, F, ring(5), 42, 120, ["#8a1f16", "#e0604e"], "#c8402d", "#4a0c06"));
    out.push(DAILY.prism(P, F, ring(3.6), 120, 190, ["#8a1f16", "#e0604e"], "#c8402d", "#4a0c06"));
    return out.join("");
  }
  // The brush's path: keyframes of (time 0…1, point, lift above the palette), plus a stir at the end.
  const REST = [60, 112, PT + 30], KEYS = [
    [0, REST, 0], [0.12, [PAINTS[1][2][0], PAINTS[1][2][1], PT + 40], 0], [0.19, [PAINTS[1][2][0], PAINTS[1][2][1], PT + 4.5], 0], [0.24, [PAINTS[1][2][0], PAINTS[1][2][1], PT + 40], 0],
    [0.34, [MIX[0], MIX[1], PT + 30], 0], [0.4, [MIX[0], MIX[1], PT + 2.5], 0], [0.44, [MIX[0], MIX[1], PT + 30], 0],
    [0.55, [PAINTS[3][2][0], PAINTS[3][2][1], PT + 40], 0], [0.61, [PAINTS[3][2][0], PAINTS[3][2][1], PT + 4.5], 0], [0.66, [PAINTS[3][2][0], PAINTS[3][2][1], PT + 40], 0],
    [0.75, [MIX[0], MIX[1], PT + 30], 0], [0.79, [MIX[0], MIX[1], PT + 2.5], 0], [0.92, [MIX[0], MIX[1], PT + 2.5], 1], [1, [MIX[0], MIX[1] + 30, PT + 40], 0]];
  const tipAt = (f) => {
    let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] < f) i++;
    const [t0, p0, s0] = KEYS[i], [t1, p1, s1] = KEYS[i + 1], e = ISO.ease(ISO.clamp((f - t0) / (t1 - t0), 0, 1)), p = G.lerp3(p0, p1, e);
    if (s1 === 1) { const a = ((f - t0) / (t1 - t0)) * Math.PI * 6, r = 8 * Math.sin(((f - t0) / (t1 - t0)) * Math.PI); return [p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, p[2]]; }
    return p;
  };
  const paintAt = (f) => (f < 0.19 ? null : f < 0.42 ? "#ffd84a" : f < 0.61 ? mix("#ffd84a", "#fbf3c0", 0.4) : f < 0.79 ? "#2b6cc4" : mix("#2b6cc4", MIXED, ISO.smooth(0.79, 0.9, f)));
  // the dab in the middle: yellow when dabbed, swirled to green (r: radius)
  const dabAt = (f) => (f < 0.4 ? null : f < 0.79 ? { r: 9, c: "#ffd84a" } : { r: 9 + 5 * ISO.smooth(0.79, 0.92, f), c: mix("#ffd84a", MIXED, ISO.smooth(0.8, 0.92, f)) });

  ISO.add({
    name: "palette", title: "Artist's palette", compare: "palette 480 270 340",
    about: "An artist's palette with six paints, a brush and a water jar: the brush picks up yellow, then blue, and stirs them together into green.",
    line: "palette cx cy width mix=0|1 lab=1 lit=palette|paints|brush|jar",
    demo: { line: "palette 480 270 340", script: [{ set: {}, hold: 0.8 }, { set: { mix: 1 }, hold: "settle" }, { set: {}, hold: 1 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.8, Hh = size * 1.15;
      const { P, g } = ISO.frame([...K.boxCorners(TABLE, -10, 0), [REST[0] - 120, REST[1] - 80, 200]], cx, cy, W, Hh, { azimuth: 30, elevation: 42 }, parent);
      g.innerHTML = DAILY.table(P, TABLE) + `<g data-name="palette">${paletteSvg(P)}</g><g data-k="dab"></g><g data-name="jar">${jarSvg(P)}</g><g data-name="brush"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["palette", "dab", "jar", "brush", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const memo = DAILY.memo();
      const m0 = ISO.num(o, "mix", 0) > 0.5 ? 1 : 0;
      const s = { f: m0, want: m0 };
      let lit = o.lit || "";
      const DIR = G.unit3([-0.62, 0.42, 0.66]);
      const draw = () => {
        const fk = (Math.round(s.f * 300) / 300).toFixed(4), f = +fk, tip = tipAt(f), dab = dabAt(f), key = `${fk}`;
        w.rebuild(el.brush, key, () => memo(key, () => brushSvg(P, tip, DIR, paintAt(f))));
        w.rebuild(el.dab, dab ? `${dab.r.toFixed(1)} ${dab.c}` : "", () => (dab ? blob(P, MIX, dab.r, dab.c, 2 + dab.r * 0.2) : ""));
        w.rebuild(el.words, lab ? `${f >= 0.92}` : "", () => !lab ? "" : [
          ISO.word(K.iso([PAINTS[1][2][0], PAINTS[1][2][1] - 18, PT], P), "yellow", "#8a6a10", { size: 13, dy: -8 }),
          ISO.word(K.iso([PAINTS[3][2][0], PAINTS[3][2][1] - 18, PT], P), "blue", "#1f4f8f", { size: 13, dy: -8 }),
          f >= 0.92 ? ISO.word(K.iso([MIX[0], MIX[1] + 18, PT], P), "yellow + blue = green", "#2c6a22", { size: 15, dy: 18 }) : "",
          ISO.word(K.iso([HOLE[0], HOLE[1] + 20, 0], P), "thumb hole", "#555", { size: 12, dy: 14 }),
          ISO.word(K.iso([JAR[0] + 30, JAR[1], 60], P), "water jar", "#3f6a8a", { anchor: "start", size: 13 })].join(""));
        const want = lit || (s.f > 0 && s.f < 1 ? "brush" : "");
        const groups = { palette: [el.palette, el.dab], paints: [el.palette, el.dab], brush: [el.brush], jar: [el.jar] };
        w.light([el.palette, el.dab, el.brush, el.jar], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.mix !== undefined) s.want = +p.mix > 0.5 ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      // the whole mix takes about 7 seconds; putting it back is quicker
      g.update = (dt) => {
        const calm = ISO.still();
        s.f = calm ? s.want : s.want > s.f ? Math.min(s.want, s.f + dt / 7) : Math.max(s.want, s.f - dt / 1.5);
        draw();
        return s.f !== s.want;
      };
      g.readout = () => {
        const f = s.f;
        if (f <= 0) return "a 30 cm plywood palette · six paints · a round brush · water to rinse it";
        if (f < 0.42) return "picking up yellow and dabbing it in the middle";
        if (f < 0.79) return "picking up blue";
        if (f < 0.92) return "stirring blue into the yellow";
        return "green: yellow paint soaks up blue light, blue paint soaks up red and yellow, so mixed, mostly green is left to bounce back";
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
