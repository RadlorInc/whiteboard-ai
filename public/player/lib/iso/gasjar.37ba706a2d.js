// "gasjar cx cy k gas=0..1 lab=0 lit=trough|water|shelf|jar|gas" — a PART (PARTS.md, batch 4): collecting a gas over
// water, as one part (anchors are placed once, so what must stay together is one part). Its origin is the bench point
// under the middle of a glass pneumatic trough 26 × 16 × 11 cm (5 mm walls, a 7 mm base) holding water 8.5 cm deep. On
// its floor stands an earthenware beehive shelf 9 cm across and 5 cm tall, a hole in its top and an arched hole in its
// side; upside down on the shelf stands a 500 mL gas jar (64 mm across, 18 cm tall, a ground flange at its mouth). At
// gas 0 the jar is full of water (the air outside holds it up); as gas 0 → 1 comes in through the side hole it rises
// through the top hole and pushes the water down out of the jar, bubbles rising in it while the level moves, until
// only a little water is left above the mouth. `inlet` = just inside the side hole, where a delivery tube ends; the readout gives
// the gas collected (mL). Built in mm; anchors in cm. set({ gas }).
(() => {
  const K = window.K, G = window.G;
  const TX = 130, TY = 80, TW = 5, TB = 7, TH = 110, WL = 85;                       // trough (outer half sizes), water level
  const SX = 20, SY = 0, SH = 50, INA = (100 * Math.PI) / 180, IW = 0.26, IH = 18;      // shelf centre, height, side hole
  const SHELF = [[0, 45], [3, 45.2, 1], [24, 43, 1], [38, 39.5, 1], [46, 34, 1], [SH, 28]];
  const JR = 32, JH = 180, JB = 2, JZ = TB + SH, NB = 8;                              // jar: outer radius, height, glass end, mouth height
  const JAR = [[0, JR - 6], [1.5, JR - 2, 1], [5, JR, 1], [JH - 5, JR], [JH - 4.5, JR + 4], [JH, JR + 4]];
  const CLAY = ISO.tint("#e9b48e", ["#b8714a", "#c6825a", "#d3936b", "#dea47d"], "#6e3a1f");
  const WATER = "#a9d3f2", RIN = JR - 2;

  ISO.add({
    name: "gasjar", title: "Gas jar over water (part)", compare: null,
    about: "Collecting a gas over water: a glass trough of water, a beehive shelf and a gas jar upside down on it, full of water; gas 0 → 1 pushes the water down out of the jar with bubbles rising in it. anchors: inlet",
    line: "gasjar cx cy k gas=0..1 lab=0 lit=trough|water|shelf|jar|gas",
    demo: { line: "gasjar 480 440 15 gas=0 lab=1", script: [{ set: { gas: 0.5, lit: "gas" }, hold: "settle" }, { set: { lit: "shelf" }, hold: 1.4 }, { set: { gas: 1, lit: "jar" }, hold: "settle" }, { set: { lit: "water" }, hold: 1.4 }, { set: { gas: 0.2, lit: "trough" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { g: ISO.clamp(ISO.num(o, "gas", 0), 0, 1) }, want = { g: st.g }, s = { amt: 0, ph: 0 };
      let lit = o.lit || "";
      const quad = (pts, fill, op, stroke = "none", sw = 0.8) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)), true)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      const x0 = -TX + TW, x1 = TX - TW, y0 = -TY + TW, y1 = TY - TW;
      // ── the trough: a thick glass base, the far walls (their inside faces), the far half of the rim
      const GL = LAB.GLASS, rimBand = (a, b) => quad([[a[0], a[1], TH], [b[0], b[1], TH], [b[2], b[3], TH], [a[2], a[3], TH]], "#dcebf4", 0.9, GL, 0.7);
      const troughBack = ISO.tinted(ISO.T.glass, ISO.wbox(Pm, [-TX, TX], [-TY, TY], [0, TB], "mid")) +
        quad([[-TX, -TY, TB], [TX, -TY, TB], [TX, -TY, TH], [-TX, -TY, TH]], "#eef6fb", 0.55, GL) + quad([[-TX, -TY, TB], [-TX, TY, TB], [-TX, TY, TH], [-TX, -TY, TH]], "#e7f1f8", 0.55, GL) +
        quad([[x0, y0, TB], [x1, y0, TB], [x1, y0, TH], [x0, y0, TH]], "#f4f9fc", 0.35, GL, 0.5) + quad([[x0, y0, TB], [x0, y1, TB], [x0, y1, TH], [x0, y0, TH]], "#f4f9fc", 0.35, GL, 0.5) +
        rimBand([-TX, -TY, x0, y0], [TX, -TY, x1, y0]) + rimBand([-TX, -TY, x0, y0], [-TX, TY, x0, y1]);
      // ── the beehive shelf: a turned earthenware dome, the top hole, the arched side hole, a foot seam
      const Fs = LAB.Z([SX, SY, TB]);
      const arch = []; for (let i = 0; i <= 16; i++) { const q = Math.PI * (i / 16); arch.push(K.iso(G.pointOf(Fs, Math.sin(q) * IH, 45.4, INA + Math.cos(q) * IW), Pm)); }
      const shelf = ISO.tinted(CLAY, LAB.S(G.solidOf(SHELF, Fs, Pm), { tone: "mid", inner: LAB.L(G.arcOf(Fs, 3, 45.25, Pm), { tone: "faint" }) })) +
        `<path d="${G.circleOf(Fs, SH + 0.05, 8, Pm)}" fill="#3b2418"/><path d="${K.pathOf(arch, true)}" fill="#3b2418" stroke="#6e3a1f" stroke-width="0.8" stroke-linejoin="round"/>`;
      // ── the water: its surface (the jar stands through it), and the near faces that tint what is under them
      const surface = quad([[x0, y0, WL], [x1, y0, WL], [x1, y1, WL], [x0, y1, WL]], "#cfe6f8", 0.55, "#6aa6d8", 0.9);
      const waterFront = quad([[x0, y1, TB], [x1, y1, TB], [x1, y1, WL], [x0, y1, WL]], "#5a9ed8", 0.2) + quad([[x1, y0, TB], [x1, y1, TB], [x1, y1, WL], [x1, y0, WL]], "#3b7fc4", 0.22);
      // ── the trough's near walls and rim, over everything in it
      const e = (a, b) => K.segment ? K.segment(a, b, Pm) : K.pathOf([K.iso(a, Pm), K.iso(b, Pm)]);
      const troughFront = quad([[-TX, TY, TB], [TX, TY, TB], [TX, TY, TH], [-TX, TY, TH]], "#eef6fb", 0.16) + quad([[TX, -TY, TB], [TX, TY, TB], [TX, TY, TH], [TX, -TY, TH]], "#e6f0f7", 0.16) +
        rimBand([-TX, TY, x0, y1], [TX, TY, x1, y1]) + rimBand([TX, -TY, x1, y0], [TX, TY, x1, y1]) +
        `<path d="${[e([-TX, TY, 0], [TX, TY, 0]), e([TX, TY, 0], [TX, -TY, 0]), e([-TX, TY, 0], [-TX, TY, TH]), e([TX, TY, 0], [TX, TY, TH]), e([TX, -TY, 0], [TX, -TY, TH]), e([-TX, TY, TB], [TX, TY, TB]), e([TX, TY, TB], [TX, -TY, TB])].join("")}" fill="none" stroke="${GL}" stroke-width="1.2" stroke-linecap="round"/>` +
        `<path d="${K.pathOf([[x0 + 6, y1, TB + 8], [x0 + 6, y1, TH - 8]].map((p) => K.iso([p[0], TY + 0.2, p[2]], Pm)))}" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`;
      // ── the jar, upside down: its axis points down from the closed end
      const top = JZ + JH, J = LAB.vessel(Pm, [SX, SY, top], JAR, { axis: [0, 0, -1], base: JB, wall: 2 });
      const Fj = J.F, ringPts = (sz, r) => Array.from({ length: 24 }, (_, i) => K.iso(G.pointOf(Fj, sz, r, (i / 24) * Math.PI * 2), Pm));
      const sub = K.pathOf(ISO.hullOf([...ringPts(top - WL, JR + 0.2), ...ringPts(JH, JR + 4.2)]), true);   // the jar below the water's surface
      const lowest = JH - 14, gasLen = (q) => JB + (lowest - JB) * q;   // the gas column, from the closed end down
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -TX, y: -TY, w: 2 * TX, d: 2 * TY, r: 4 }, 0, 4, Pm)}"/>` +
        `<g data-name="trough">${troughBack}</g><g data-name="shelf">${shelf}</g><g data-name="water">${surface}</g>` +
        `<g data-name="jar">${J.back()}</g><g data-name="water" data-part="jwater"></g><g data-name="gas" data-part="gas"></g><g data-part="bubbles">${Array.from({ length: NB }, () => `<circle r="1" fill="#ffffff" fill-opacity=".6" stroke="#4d7590" stroke-width="0.6" opacity="0"/>`).join("")}</g>` +
        `<g data-name="jar">${J.front()}<path d="${sub}" fill="${WATER}" fill-opacity=".22"/><path d="${G.circleOf(LAB.Z([SX, SY, WL]), 0, JR + 0.3, Pm)}" fill="none" stroke="#6aa6d8" stroke-width="0.9"/></g>` +
        `<g data-name="water">${waterFront}</g><g data-name="trough">${troughFront}</g><g data-part="words"></g>`;
      g.anchors = { inlet: G.pointOf(Fs, IH * 0.5, 41, INA).map((v) => v / 10) };
      const el = LAB.parts(g), w = ISO.writer(), bubbles = [...el.bubbles.children];
      const draw = () => {
        const gl = Math.round(gasLen(st.g) * 2) / 2;
        w.rebuild(el.jwater, String(gl), () => J.liquid(gl, WATER, { opacity: 0.62 }));
        w.rebuild(el.gas, String(gl), () => (gl > JB + 1 ? `<path d="${K.pathOf(ISO.hullOf([...ringPts(JB + 0.3, RIN - 0.3), ...ringPts(gl, RIN - 0.3)]), true)}" fill="#fdf9ee" fill-opacity=".85" stroke="#e0d6b8" stroke-width="0.5"/>` : ""));
        if (lab) w.rebuild(el.words, String(Math.round(st.g * 20)), () => [LAB.word(Pm, lab, [SX + JR + 8, SY, top - gl / 2], st.g > 0.04 ? `gas ${Math.round(Math.PI * RIN * RIN * (gl - JB) / 1000)} mL` : "full of water", "#2b6cc4", { anchor: "start", size: 14 }),
          LAB.word(Pm, lab, [SX, SY, top + 12], "gas jar", "#556"), LAB.word(Pm, lab, [TX, TY, 0], "trough of water", "#556", { anchor: "start", dy: 14 }),
          LAB.word(Pm, lab, [SX - 60, TY, TB + 30], "beehive shelf", "#6e3a1f", { anchor: "end" })].join(""));
        LAB.light(w, g, lit);
      };
      // bubbles: from the shelf's top hole up through the water in the jar to the gas above it, while the level moves
      const move = () => {
        const sc = G.scaleOf(Pm), zTop = top - gasLen(st.g) - 2, z0 = JZ + 2;
        bubbles.forEach((c, i) => {
          const ph = (s.ph * 0.8 + i / NB) % 1, z = z0 + ph * Math.max(0, zTop - z0), p = K.iso([SX + Math.sin(ph * 7 + i * 2.1) * 4, SY + Math.cos(i * 1.3) * 3, z], Pm);
          w.attr(c, "cx", p[0].toFixed(1)); w.attr(c, "cy", p[1].toFixed(1)); w.attr(c, "r", Math.max(0.6, sc * (1.6 + ph * 1.8)).toFixed(2));
          w.attr(c, "opacity", (s.amt * Math.min(1, ph * 8) * (1 - ph ** 4)).toFixed(2));
        });
      };
      g.set = (p) => {
        if (p.gas !== undefined) want.g = ISO.clamp(+p.gas, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // the gas comes in at a steady rate (about 60 mL a second here); the bubbles run while it does
        const d = want.g - st.g;
        st.g = calm ? want.g : st.g + Math.sign(d) * Math.min(Math.abs(d), dt * 0.12);
        const on = !calm && st.g !== want.g ? 1 : 0;
        s.amt = ISO.follow(s.amt, on, dt, 0.3, calm); if (Math.abs(s.amt - on) < 0.004) s.amt = on;
        if (!calm) s.ph += dt;
        draw(); move();
        return st.g !== want.g || s.amt !== on;
      };
      g.readout = () => `gas jar over water · ${Math.round(Math.PI * RIN * RIN * (gasLen(st.g) - JB) / 1000 * (st.g > 0 ? 1 : 0))} mL of gas collected, the water pushed down out of the jar${st.g !== want.g ? " · bubbles rising" : ""}`;
      draw(); move();
      return g;
    },
  });
})();
