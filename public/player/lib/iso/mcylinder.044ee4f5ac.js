// "mcylinder cx cy size c=blue level=0.6 lab=1 lit=cylinder|scale|card" — a 100 mL measuring cylinder, read at eye level.
// Glass tube on a hexagonal foot with a pouring lip, marks every 1 mL (long every 5, numbered every 10) printed up the
// near side. Water curves up at the glass, so the reading is taken at the bottom of the meniscus, with the eye level with
// it: we look from almost level (elevation 9°), and a reading card behind the cylinder (white with a black band) slides
// so its band's top sits just under the meniscus, making the curve stand out. Inside radius 13 mm: 1 mL = 1.88 mm.
// set({ level }) fills it; level = fraction of 100 mL.
(() => {
  const K = window.K, G = window.G;
  const R = 14.2, RIN = 13, BASEZ = 7, BOT = 3, H = 214, MM = 1000 / (Math.PI * RIN * RIN);
  const OUTER = [[0, R - 1], [1, R, 1], [H - 3, R], [H - 2, R + 1, 1], [H, R + 0.8]];
  const zOf = (ml) => BOT + ml * MM;   // along the cylinder, from its base
  const HEX = Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * 40, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * 40]);
  const AZ = (55 * Math.PI) / 180, VW = [Math.cos(AZ), Math.sin(AZ)], UW = [-Math.sin(AZ), Math.cos(AZ)];
  const CARD = { x0: -22, x1: 22, d: -36, z0: 20, z1: 220 };   // a plane facing the viewer, 36 mm behind the axis
  const onCard = (u, z, back = 0) => [VW[0] * (CARD.d - back) + UW[0] * u, VW[1] * (CARD.d - back) + UW[1] * u, z];

  ISO.add({
    name: "mcylinder", title: "Measuring cylinder", compare: "mcylinder 480 250 270",
    about: "A 100 mL measuring cylinder read at eye level: the reading is the bottom of the meniscus, against a reading card.",
    line: "mcylinder cx cy size c=blue level=0.6 lab=1 lit=cylinder|scale|card",
    demo: { line: "mcylinder 480 270 300 level=0.3", script: [{ set: { level: 0.62, lit: "card" }, hold: "settle" }, { set: { level: 0.87, lit: "scale" }, hold: "settle" }, { set: { level: 0.45, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 270], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.3, H2 = size * 1.35;
      const { P, g } = ISO.frame([[-44, -44, 0], [44, 44, 0], [0, 0, BASEZ + H + 6], [-40, -40, 230], [30, 40, 0]], cx, cy, W, H2, { azimuth: 55, elevation: 9 }, parent);
      const V = LAB.vessel(P, [0, 0, BASEZ], OUTER, { base: BOT, spout: true });
      const st = { ml: ISO.clamp(ISO.num(o, "level", 0.6), 0, 1) * 100, c: o.c || "blue" }, want = { ml: st.ml };
      let lit = o.lit || "";
      const foot = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf({ x: -40, y: -40, w: 80, d: 80, r: 30 }, 0, 6, P)}"/>`];
        out.push(`<g style="${ISO.T.glass}">${S(K.extrude(HEX, 0, 5, P, { bevel: 0.6 }), { tone: "mid" })}</g>`);
        out.push(`<g style="${ISO.T.glass}">${S(K.cylinder(0, 0, 18, 5, 2, P, 40), { tone: "mid" })}</g>`);
        return out.join("");
      };
      // the reading card on its own little stand behind the cylinder
      const cardStand = () => {
        const b = onCard(0, 0, 6), out = [S(K.cylinder(b[0], b[1], 9, 0, 3, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(b[0], b[1], 1.6, 3, 224, P, 14), { tone: "mid", crease: "none" })];
        return out.join("");
      };
      const cardSvg = (zLevel) => {
        const q = (x, z) => K.iso(onCard(x, z), P), band0 = zLevel - 2, band1 = zLevel - 18;
        const out = [`<path d="${K.pathOf([q(CARD.x0, CARD.z0), q(CARD.x1, CARD.z0), q(CARD.x1, CARD.z1), q(CARD.x0, CARD.z1)], true)}" fill="#ffffff" stroke="#8a929a" stroke-width="0.8"/>`];
        out.push(`<path d="${K.pathOf([q(CARD.x0, Math.max(CARD.z0, band1)), q(CARD.x1, Math.max(CARD.z0, band1)), q(CARD.x1, band0), q(CARD.x0, band0)], true)}" fill="#22262b"/>`);
        // the clip that holds the card to the rod (it slides with the band)
        out.push(ISO.box((u, w, y) => onCard(u, w, y), P, [-4, 4], [band0 + 2, band0 + 10], [0.6, 8], "mid"));
        return out.join("");
      };
      const scale = () => {
        const a = V.facing - 0.25, rule = [], minor = [], mid = [], major = [], nums = [];
        for (let s = zOf(0); s <= zOf(100) + 0.01; s += MM / 2) rule.push(K.iso(G.pointOf(V.F, s, R + 0.15, a), P));
        for (let m = 0; m <= 100; m++) {
          const s = zOf(m), n = m % 10 === 0 ? 7 : m % 5 === 0 ? 5 : 3, arc = [0, 0.5, 1].map((k) => K.iso(G.pointOf(V.F, s, R + 0.15, a + (k * n) / R), P));
          (m % 10 === 0 ? major : m % 5 === 0 ? mid : minor).push(K.pathOf(arc));
          if (m % 10 === 0 && m) nums.push(LAB.faceText(P, G.pointOf(V.F, s + 1.4, R + 0.3, a + 10 / R), G.mul3(G.tangentOf(V.F, a + 10 / R), -1), String(m), 4.2));
        }
        return L(K.pathOf(rule), { tone: "mid" }) + L(minor.join(""), { tone: "lo", free: "end" }) + L(mid.join(""), { tone: "mid", free: "end" }) + L(major.join(""), { tone: "hi", free: "end" }) + nums.join("") +
          LAB.faceText(P, G.pointOf(V.F, zOf(100) + 12, R + 0.3, V.facing), G.mul3(G.tangentOf(V.F, V.facing), -1), "100 mL  20 °C", 4.6);
      };
      g.innerHTML = `<g>${foot()}</g><g data-name="card">${cardStand()}<g data-part="card"></g></g><g data-name="cylinder">${V.back()}</g><g data-part="liquid"></g><g>${V.front()}</g>` +
        `<g data-name="scale">${scale()}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const s = zOf(st.ml), key = st.ml.toFixed(2);
        w.rebuild(el.liquid, `${key} ${st.c}`, () => {
          // the liquid to the meniscus bottom, then the meniscus: a thin crescent climbing 1.6 mm up the wall
          const col = LAB.col(st.c), ink = LAB.ink(st.c), lo = G.arcOf(V.F, s, RIN, P, { least: -0.3 }), hi = G.arcOf(V.F, s + 1.6, RIN, P, { least: -0.3 });
          return V.liquid(s, st.c, { meniscus: false }) + (st.ml > 0.5 ? `<path d="${G.circleOf(V.F, s + 1.6, RIN, P)}" fill="none" stroke="${ink}" stroke-width="0.6" opacity=".55"/><path d="${hi}" fill="none" stroke="${ink}" stroke-width="1" opacity=".75"/><path d="${lo}" fill="none" stroke="${ink}" stroke-width="1.4"/>` : "");
        });
        w.rebuild(el.card, key, () => cardSvg(BASEZ + s));
        if (lab) w.rebuild(el.words, key, () => LAB.word(P, lab, V.at(s, -1.4, 10), `${st.ml.toFixed(1)} mL`, LAB.ink(st.c), { anchor: "start", size: 14 }) + LAB.word(P, lab, onCard(CARD.x0, 120), "reading card", "#556", { anchor: "end", dy: 0 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.level !== undefined) want.ml = ISO.clamp(+p.level, 0, 1) * 100;
        if (p.c) st.c = p.c;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.ml = ISO.follow(st.ml, want.ml, dt, 0.45, ISO.still());
        if (Math.abs(st.ml - want.ml) < 0.02) st.ml = want.ml;
        draw();
        return st.ml !== want.ml;
      };
      g.readout = () => `bottom of the meniscus at ${st.ml.toFixed(1)} mL · read with the eye level with it · marks every 1 mL (±0.5 mL)`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
