// "glacier cx baseY width retreat=0..1 lab=1 lit=ice|moraine|lake|front" — a landscape model of a valley glacier.
// A block of mountain cut out and set on a base board: a U-shaped valley falls from snowy peaks to a lake; the
// glacier fills it, cracked by crevasses, a dark stripe of rock (medial moraine) down its middle, its front breaking
// off as icebergs into the lake. The front and right sides of the block are cut faces: rock layers, the ice's
// thickness, the lake's depth. retreat=1: the climate warms, the ice thins and its front melts back up the valley,
// leaving the ridge of rubble (end moraine) that marks how far it once reached. Model: 1 unit = 50 m, heights ×2.
(() => {
  const K = window.K, G = window.G;
  const X0 = -120, X1 = 120, Y0 = -80, Y1 = 80, ZW = 18, NX = 48, NY = 32;
  const yc = (x) => 24 + 10 * Math.sin((x - X0) / 60), base = (x) => 70 - 0.28 * (x - X0);
  // the valley's far side climbs to peaks, its near side is a low ridge, so we look down into it
  const memo = new Map();
  const rock = (x, y) => { const k = x * 4096 + y; let v = memo.get(k); if (v === undefined) memo.set(k, (v = rock0(x, y))); return v; };
  const rock0 = (x, y) => {
    const ds = y - yc(x), d = Math.abs(ds);
    const wall = ds < 0 ? 34 * Math.pow(Math.max(0, -ds - 12) / 55, 1.4) : 18 * Math.pow(Math.max(0, ds - 10) / 40, 1.4);
    const peaks = (ds < 0 ? 7 : 2) * Math.sin(x / 19 + y / 25) * Math.min(1, d / 30) + (ds < 0 ? Math.max(0, -x - 30) * 0.22 * Math.min(1, d / 40) : 0);
    const moraine = 10 * Math.exp(-(((x - 96) / 4.5) ** 2)) * (d < 34 ? 1 : 0);
    return Math.min(130, Math.max(4, base(x) + wall + peaks + moraine));
  };
  const front = (r) => 92 - 70 * r;
  const ice = (x, y, r) => {
    const d = Math.abs(y - yc(x)), xs = front(r);
    if (x > xs || d > 34) return 0;
    return 16 * (1 - 0.35 * r) * (1 - (d / 34) ** 2) * Math.sqrt(Math.min(1, (xs - x) / 22)) * Math.min(1, 0.55 + (xs - x) / 120);
  };
  const C = { water: [127, 192, 238], ice: [238, 247, 253], crev: [176, 211, 238], mor: [150, 140, 128], rock: [176, 170, 162], green: [170, 204, 142], snow: [248, 250, 252], rubble: [184, 164, 132] };
  // a few icebergs calved into the lake: white blocks floating, a ninth above the water
  const BERGS = [[104, 18, 4.4], [112, 30, 3.2], [100, 34, 2.6]];

  ISO.add({
    name: "glacier", title: "Valley glacier (landscape model)", compare: "glacier 480 380 460",
    about: "A landscape model of a glacier filling a U-shaped valley; warm the climate and its front melts back, leaving its end moraine behind.",
    line: "glacier cx baseY width retreat=0..1 lab=1 lit=ice|moraine|lake|front",
    demo: { line: "glacier 480 400 460", script: [{ set: { lit: "front" }, hold: 1.6 }, { set: { lit: "", retreat: 1 }, hold: "settle" }, { set: { lit: "moraine" }, hold: 1.8 }] },
    make([cx, by, w = 440], o, t, parent) {
      const lab = o.lab !== "0", W = w * 1.42, H = w * 0.98, cy = by - w * 0.32;
      const PLB = { x: X0 - 8, y: Y0 - 8, w: X1 - X0 + 16, d: Y1 - Y0 + 16, r: 6 };
      const { P, g } = ISO.frame([[PLB.x, PLB.y, -12], [PLB.x + PLB.w, PLB.y + PLB.d, -12], [PLB.x, PLB.y + PLB.d, -12], [PLB.x + PLB.w, PLB.y, 0], [X0, Y0, 130], [X0, Y1, 80], [0, Y0, 110]], cx, cy, W, H, { azimuth: 36, elevation: 38 }, parent);
      g.innerHTML = `<g>${ISO.baseboard(P, PLB, { h: 6, tint: ISO.T.wood })}</g><g data-part="land" data-name="ice"></g><g data-part="marks" data-name="ice"></g><g data-part="walls"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), wr = ISO.writer();
      const st = { r: ISO.clamp(ISO.num(o, "retreat", 0), 0, 1) }, want = { r: st.r };
      let lit = o.lit || "";
      const surf = (x, y, r) => { const rk = rock(x, y), ic = ice(x, y, r); return ic > 0.3 ? rk + ic : Math.max(rk, ZW); };
      const mixc = (p, q, f) => p.map((v, i) => v + (q[i] - v) * ISO.clamp(f, 0, 1));
      const colour = (r) => (x, y, z, slope) => {
        const d = Math.abs(y - yc(x)), ic = ice(x, y, r), rk = rock(x, y);
        if (ic > 0.3) return C.ice;
        if (rk < ZW) return C.water;
        if (Math.abs(x - 96) < 6 && d < 34 && rk < 40) return C.rubble;
        const ground = mixc(C.green, C.rock, Math.max((slope - 0.15) / 0.3, (z - 40) / 30));
        return mixc(ground, C.snow, (z - 66) / 34);
      };
      // marks on the ice, drawn over it (the near ridge is too low to hide the valley floor from this height):
      // crevasses, curved cracks across the flow bowed downhill because the middle moves fastest, and the medial
      // moraine, a stripe of rock carried down the middle where two ice streams joined
      const marks = (r) => {
        const xs = front(r), on = (x, y, dz = 0.4) => K.iso([x, y, surf(x, y, r) + dz], P), cracks = [];
        for (let xc = -96; xc < xs - 8; xc += 13) for (const side of [-1, 1]) for (let s0 = 0.16; s0 < 0.78; s0 += 0.21) {
          const ss = [s0, s0 + 0.15].map((q) => q * side), pt = (q, dx) => on(xc + 6 * q * q + dx, yc(xc) + q * 30);
          if (ice(xc, yc(xc) + ss[1] * 30, r) < 1.2) continue;
          cracks.push(K.pathOf([pt(ss[0], 0), pt((ss[0] + ss[1]) / 2, -0.3), pt(ss[1], 0), pt(ss[1], 1.1), pt((ss[0] + ss[1]) / 2, 1.5), pt(ss[0], 1.1)], true));
        }
        const xsL = Array.from({ length: Math.max(2, Math.floor((xs - 3 + 116) / 5)) }, (_, i) => -116 + i * 5);
        const band = [...xsL.map((x) => on(x, yc(x) - 1.8)), ...xsL.slice().reverse().map((x) => on(x, yc(x) + 1.8))];
        return `<path d="${cracks.join("")}" fill="#a9cdee" stroke="#2f72b8" stroke-width=".5" stroke-linejoin="round"/><path d="${K.pathOf(band, true)}" fill="#9a8f84" stroke="#6f655c" stroke-width=".5" stroke-linejoin="round"/>`;
      };
      const bergs = (P) => BERGS.map(([x, y, s]) => {
        const V = [], n = 6;
        for (const [z, k] of [[ZW - s * 0.5, 0.92], [ZW + s * 1.3, 0.7]]) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + s; V.push([x + Math.cos(a) * s * k * (1 + 0.25 * Math.sin(i * 2.3)), y + Math.sin(a) * s * k, z]); }
        const F = [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], ...Array.from({ length: n }, (_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i])];
        return { k: K.depthOf([x, y, ZW + s], P), d: ISO.tinted(ISO.tint("#f6fbfe", ["#bcd8ee", "#cde2f3", "#dcebf7", "#e8f2fa"], "#2f72b8"), ISO.poly(V, F, P, "mid")) };
      });
      // the cut faces: rock layers under the surface, then lake water and ice above the rock
      const walls = (r) => {
        const runF = EARTH.run([X0, Y1], [X1, Y1], 60), runR = EARTH.run([X1, Y1], [X1, Y0], 40);
        const bands = [
          { top: (x, y) => Math.min(rock(x, y), 14 + 2 * Math.sin(x / 20 + y / 20)), bot: () => 0, fill: "#b59a78", ink: "#5e4a3c" },
          { top: (x, y) => Math.min(rock(x, y), 34 + 3 * Math.sin(x / 26 - y / 30)), bot: (x, y) => 14 + 2 * Math.sin(x / 20 + y / 20), fill: "#cdb796", ink: "#5e4a3c" },
          { top: (x, y) => rock(x, y), bot: (x, y) => 34 + 3 * Math.sin(x / 26 - y / 30), fill: "#c2b9ad", ink: "#5e4a3c" },
          { top: (x, y) => Math.max(rock(x, y), ice(x, y, r) > 0.3 ? rock(x, y) : ZW), bot: (x, y) => rock(x, y), fill: "#9fd0f5", ink: "#1f5fa8" },
          { top: (x, y) => rock(x, y) + (ice(x, y, r) > 0.3 ? ice(x, y, r) : 0), bot: (x, y) => rock(x, y), fill: "#e4f2fb", ink: "#2f72b8" },
        ];
        return EARTH.wall(P, runF, bands) + EARTH.wall(P, runR, bands);
      };
      const draw = () => {
        const r = Math.round(st.r * 16) / 16;
        wr.rebuild(el.land, String(r), () => EARTH.terrain(P, { x0: X0, x1: X1, y0: Y0, y1: Y1, nx: NX, ny: NY, h: (x, y) => surf(x, y, r), col: colour(r), extras: bergs(P) }).svg);
        wr.rebuild(el.walls, String(r), () => walls(r));
        wr.rebuild(el.marks, String(r), () => marks(r));
        if (lab) wr.rebuild(el.words, String(r), () => {
          const at = (x, y, dz = 0) => K.iso([x, y, surf(x, y, r) + dz], P), xs = front(r);
          return ISO.word(at(-40, yc(-40), 6), "glacier", "#1f4f8f", { size: 15 }) + `<g data-name="front">${ISO.word(at(xs - 4, yc(xs) - 26, 8), "ice front", "#2f72b8", { size: 13 })}</g>` +
            `<g data-name="lake">${ISO.word(at(110, yc(110), 2), "lake", "#1f5fa8", { size: 13, dy: 14 })}</g>` + (r > 0.3 ? `<g data-name="moraine">${ISO.word(at(96, yc(96) + 26, 4), "end moraine", "#6b5134", { size: 13, anchor: "start" })}</g>` : "") +
            ISO.word(at(-60, -70, 6), "snowfield", "#667", { size: 12 });
        });
        LAB.light(wr, g, lit);
      };
      g.set = (p) => {
        if (p.retreat !== undefined) want.r = ISO.clamp(+p.retreat, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.r = ISO.follow(st.r, want.r, dt, 1.2, ISO.still());
        if (Math.abs(st.r - want.r) < 0.003) st.r = want.r;
        draw();
        return st.r !== want.r;
      };
      g.readout = () => { const back = 70 * st.r * 0.05, len = (front(st.r) - X0) * 0.05; return `ice ${len.toFixed(1)} km long, at most ${Math.round(16 * (1 - 0.35 * st.r) * 25)} m thick · front pulled back ${back.toFixed(1)} km${st.r > 0.3 ? " · the end moraine marks where it once reached" : " · its front calves icebergs into the lake"} · ice flows downhill tens to hundreds of metres a year`; };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
