// Small medical things, each its own recipe with the app's signature: pill, bandage, syringe, feverthermo,
// bloodtube, stethoscope. Each lies or stands on a small tray so it reads as an object, with one demo move.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const TRAY = { x: -80, y: -40, w: 160, d: 80, r: 8 };
  const tray = (P) => `<path class="iso-halo" d="${K.haloOf(TRAY, 0, 4, P)}"/>` + S(K.slabOf(TRAY, 0, 4, P, 10, 1), { tone: "mid" }) + L(K.planOutline(K.insetPlan(TRAY, 5), 4, P, 10), { tone: "faint" });
  const frameOn = (cx, cy, size, parent, pts, opts = {}) => ISO.frame(pts || [...K.boxCorners(TRAY, 0, 4), [0, 0, 40]], cx, cy, size * 1.85, size * 1.15, { azimuth: 55, elevation: 34, ...opts }, parent);
  const simple = ({ name, title, compare, about, line, demo, build, step, readout }) => ISO.add({
    name, title, compare, about, line, demo,
    make([cx, cy, size = 300], o, t, parent) {
      const { P, g } = frameOn(cx, cy, size, parent, build.points);
      const st = { v: 0, vT: 0, ...build.init(o) }, w = ISO.writer();
      g.innerHTML = `<g>${tray(P)}${build.still ? build.still(P, o) : ""}</g><g data-part="live"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      // The moving part is drawn in 2% steps of its motion and each step kept, so a repeat costs nothing.
      const memo = new Map();
      const draw = () => {
        const q = Math.round(st.v * 50) / 50, key = `${q} ${st.k || ""} ${st.dose || ""}`;
        w.rebuild(el.live, key, () => { if (!memo.has(key)) memo.set(key, build.live(P, { ...st, v: q }, o)); return memo.get(key); });
        if (o.lab !== "0" && build.words) w.rebuild(el.words, `${q.toFixed(1)} ${st.k || ""}`, () => build.words(P, st, o));
      };
      g.set = (p) => step(st, p);
      g.update = (dt) => { st.v = ISO.follow(st.v, st.vT, dt, 0.5, ISO.still()); draw(); return st.v !== st.vT; };
      g.readout = () => readout(st, o);
      draw();
      if (t) label(parent, cx, cy - size * 0.58 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });

  // pill: a two-colour capsule that opens to show its granules, or a round scored tablet.
  simple({
    name: "pill", title: "Capsule or tablet", compare: "pill 480 270 220 k=capsule rot=-20", about: "A two-colour capsule that pulls apart to show the powder inside, or a scored tablet that snaps in half.",
    line: "pill cx cy size k=capsule|tablet lab=1", demo: { line: "pill 480 270 260", script: [{ set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    build: {
      init: (o) => ({ k: o.k === "tablet" ? "tablet" : "capsule" }),
      live: (P, st) => {
        const g = st.v * 14;
        if (st.k === "tablet") return [-1, 1].map((sd) => ISO.tinted(ISO.T.paint, ISO.prismY(P, ISO.arc(0, 0, 24, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : (3 * Math.PI) / 2, 20).map(([x, z]) => [x + sd * g * 0.5, z]), -5, 5, ["#c9cfd6", "#f2f4f6"], "#ffffff", "#5f656c"))).join("");
        const F = xAx([0, 0, 12]), out = [];
        for (let i = 0; i < 9; i++) out.push(S(G.sphereOf([-4 + (i % 3) * 4, -3 + Math.floor(i / 3) * 3, 9 + (i % 2)], 1.6, P), { tone: "lo" }));
        out.push(ISO.tinted(ISO.T.red, S(G.lathe([[-30 - g, 0], [-30 - g, 4, 1], [-27 - g, 9, 1], [-22 - g, 10.5, 1], [2 - g, 10.5], [2 - g, 0]], F, P, { steps: 40 }), { tone: "hi" })));
        out.push(ISO.tinted(ISO.T.amber, S(G.lathe([[-4 + g, 0], [-4 + g, 11], [24 + g, 11, 1], [29 + g, 9.5, 1], [32 + g, 4, 1], [32 + g, 0]], F, P, { steps: 40 }), { tone: "hi" })));
        return out.join("");
      },
      words: (P, st) => ISO.word(K.iso([0, 40, 4], P), st.k === "tablet" ? "scored tablet: snaps into two equal halves" : "capsule: two shells around the medicine powder", "#555", { size: 13, dy: 18 }),
    },
    step: (st, p) => { if (p.open !== undefined) st.vT = +p.open; if (p.k) st.k = p.k; },
    readout: (st) => (st.k === "tablet" ? "the score line lets a tablet be split into an exact half dose" : "the capsule dissolves in the stomach in a few minutes and releases the powder"),
  });

  // bandage: an adhesive strip with a pad and air holes; the backing tabs peel off.
  simple({
    name: "bandage", title: "Adhesive bandage", compare: "bandage 480 270 320 rot=-12", about: "Adhesive strip with an absorbent pad, air holes and two release tabs that peel back.",
    line: "bandage cx cy length lab=1", demo: { line: "bandage 480 270 320", script: [{ set: { peel: 1 }, hold: "settle" }, { set: { peel: 0 }, hold: "settle" }] },
    build: {
      init: () => ({}),
      still: (P) => {
        const strip = { x: -60, y: -14, w: 120, d: 28, r: 12 }, out = [ISO.tinted(ISO.tint("#f3dcc4", ["#d9b28e", "#e2bf9e", "#e9cbae", "#efd6bd"], "#8a6a4a"), S(K.slabOf(strip, 4, 0.8, P, 10), { tone: "hi", crease: "none" }))];
        const holes = [];
        for (let x = -52; x <= 52; x += 6) for (const y of [-8, 0, 8]) if (Math.abs(x) > 20) holes.push(K.iso([x, y, 4.85], P));
        out.push(D(holes, { size: 0.5, tone: "lo" }), ISO.tinted(ISO.T.paint, S(K.slabOf({ x: -18, y: -11, w: 36, d: 22, r: 2 }, 4.8, 1.4, P, 3), { tone: "hi" })));
        return out.join("");
      },
      live: (P, st) => [-1, 1].map((sd) => { const a = st.v * 1.2, at = (u, w, y) => [sd * (18 + u * Math.cos(a)), y, 6.4 + u * Math.sin(a) + w]; return ISO.tinted(ISO.T.glass, ISO.box(at, P, [0, 44], [0, 0.4], [-15, 15], "hi")); }).join(""),
      words: (P) => ISO.word(K.iso([0, 40, 4], P), "pad in the middle, air holes, sticky ends", "#555", { size: 13, dy: 18 }),
    },
    step: (st, p) => { if (p.peel !== undefined) st.vT = +p.peel; },
    readout: () => "the pad touches the cut and soaks it up; only the ends stick to the skin; the holes let it breathe",
  });

  // syringe: barrel with mL marks, plunger, needle; the plunger draws back a dose.
  simple({
    name: "syringe", title: "Syringe", compare: "syringe 480 270 340 rot=-15", about: "A 5 mL syringe: pulling the plunger back draws liquid into the barrel against its mL scale.",
    line: "syringe cx cy length dose=2.5 lab=1", demo: { line: "syringe 480 270 340", script: [{ set: { draw: 1 }, hold: "settle" }, { set: { draw: 0 }, hold: "settle" }] },
    build: {
      init: (o) => ({ dose: ISO.clamp(ISO.num(o, "dose", 2.5), 0.5, 5) }),
      live: (P, st) => {
        const F = xAx([-50, 0, 14]), ml = st.v * st.dose, len = ml * 14, out = [];
        out.push(S(G.disc(-26, -6, 0.5, F, P, { steps: 10 }), { tone: "mid" }), S(G.disc(-6, 0, 2.4, F, P, { steps: 20 }), { tone: "mid" }));
        if (len > 0.2) out.push(`<path d="${K.pathOf([[-49, 0, 14], [-49 + len, 0, 14]].map((p) => K.iso(p, P)))}" stroke="#4f93d6" stroke-width="9" opacity=".55"/>`);
        out.push(`<g opacity=".55">${ISO.tinted(ISO.T.glass, S(G.disc(0, 74, 6, F, P, { steps: 32 }), { tone: "hi" }))}</g>`);
        const ticks = [];
        for (let m = 0; m <= 5; m += 0.5) ticks.push(K.segment(G.pointOf(F, 1 + m * 14, 6.05, Math.PI / 2 + 0.3), G.pointOf(F, 1 + m * 14, 6.05, Math.PI / 2 + (m % 1 ? 0.55 : 0.85)), P));
        out.push(L(ticks.join(""), { tone: "mid", free: "end" }));
        out.push(ISO.tinted(ISO.T.plastic, S(G.disc(1 + len, 4 + len, 5.6, F, P, { steps: 28 }), { tone: "hi" })), S(G.disc(4 + len, 80 + len, 1.6, F, P, { steps: 12 }), { tone: "mid" }), S(G.disc(80 + len, 82 + len, 8, F, P, { steps: 28 }), { tone: "mid", lit: true }));
        out.push(S(G.disc(74, 77, 9, F, P, { steps: 28 }), { tone: "mid" }));
        return out.join("");
      },
      words: (P, st) => ISO.word(K.iso([-10, 0, 24], P), `${(st.v * st.dose).toFixed(1)} mL`, "#1f4f8f", { size: 14, dy: -6 }),
    },
    step: (st, p) => { if (p.draw !== undefined) st.vT = +p.draw; if (p.dose !== undefined) st.dose = +p.dose; },
    readout: (st) => `read the dose at the plunger's front edge: ${(st.v * st.dose).toFixed(1)} of ${st.dose} mL drawn`,
  });

  // feverthermo: a digital body thermometer whose reading climbs to 37 °C (normal) or 39 °C (fever) and beeps.
  simple({
    name: "feverthermo", title: "Fever thermometer", compare: "feverthermo 480 260 300 k=fever", about: "A digital body thermometer: the reading climbs and settles; 37 °C is normal, 38 °C and above is a fever.",
    line: "feverthermo cx cy height k=fever|normal lab=1", demo: { line: "feverthermo 480 260 300", script: [{ set: { read: 1 }, hold: "settle" }, { set: { read: 0 }, hold: "settle" }] },
    build: {
      init: (o) => ({ k: o.k === "normal" ? "normal" : "fever" }),
      still: (P) => {
        const F = xAx([-60, 0, 10]);
        return S(G.lathe([[0, 0], [0, 2.2], [14, 2.6], [20, 4.5, 1], [100, 6], [112, 5.5, 1], [116, 0]], F, P, { steps: 32 }), { tone: "hi" }) + ISO.tinted(ISO.T.steel, S(G.lathe([[-8, 0], [-8, 1.6, 1], [-5, 2.2], [0, 2.2], [0, 0]], F, P, { steps: 20 }), { tone: "hi" })) +
          ISO.tinted(ISO.T.blue, S(G.disc(96, 100, 4, F, P, { steps: 20 }), { tone: "hi" }));
      },
      live: (P, st) => {
        const temp = 35.5 + st.v * ((st.k === "fever" ? 39 : 37) - 35.5), o = K.iso([30, 4.6, 13.5], P), a = K.iso([31, 4.6, 13.5], P), b = K.iso([30, 4.6, 12.5], P);
        const m = `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`;
        return `<path d="${K.pathOf([[22, 4.6, 8], [62, 4.6, 8], [62, 4.6, 15], [22, 4.6, 15]].map((p) => K.iso(p, P)), true)}" fill="#cfe0c8" stroke="#55575c" stroke-width="0.6"/>` + `<g transform="${m}"><text x="0" y="0" style="font:700 7px ui-monospace,monospace" fill="#24331f">${temp.toFixed(1)} °C</text></g>`;
      },
      words: (P, st) => ISO.word(K.iso([0, 30, 4], P), st.k === "fever" ? "39 °C: fever (38 °C and over)" : "37 °C: normal", st.k === "fever" ? "#a3271b" : "#2c6a22", { size: 14, dy: 16 }),
    },
    step: (st, p) => { if (p.read !== undefined) st.vT = +p.read; if (p.k) st.k = p.k; },
    readout: (st) => (st.vT ? `reading ${(35.5 + st.v * ((st.k === "fever" ? 39 : 37) - 35.5)).toFixed(1)} °C · normal body temperature is about 37 °C, fever from 38 °C` : "waiting · tip under the tongue or in the armpit"),
  });

  // bloodtube: a tube of blood that settles in a centrifuge into plasma (55%), the white buffy coat and red cells (45%).
  simple({
    name: "bloodtube", title: "Spun blood tube", compare: "bloodtube 400 270 320", about: "A tube of blood before and after spinning: yellow plasma on top (55%), a thin white layer, red cells below (45%).",
    line: "bloodtube cx cy height lab=1", demo: { line: "bloodtube 480 270 320", script: [{ set: { spin: 1 }, hold: "settle" }, { set: { spin: 0 }, hold: "settle" }] },
    build: {
      points: [[-60, -40, 0], [60, 40, 0], [0, 0, 120]],
      init: () => ({}),
      still: (P) => S(K.cylinder(0, 0, 14, 4, 20, P, 36, 0.5), { tone: "mid" }) + L(K.ring(0, 0, 8, 24, P, 28), { tone: "lo" }),
      live: (P, st) => {
        const F = zAx([0, 0, 24]), H = 80, red = H * (0.45 + 0.55 * (1 - st.v)), out = [];
        const band = (s0, s1, c) => `<path d="${K.pathOf([[-5, 0, 24 + s0], [5, 0, 24 + s0], [5, 0, 24 + s1], [-5, 0, 24 + s1]].map((p) => K.iso([p[0], 6, p[2]], P)), true)}" fill="${c}"/>`;
        out.push(band(0, red, "#a3271b"));
        if (st.v > 0.05) { out.push(band(red, red + 1.4 * st.v, "#f6f2ea"), band(red + 1.4 * st.v, H, `rgba(240,200,90,${(0.85 * st.v).toFixed(2)})`)); }
        out.push(`<g opacity=".5">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, 4, 1], [3, 6], [H + 6, 6], [H + 6, 0]], F, P, { steps: 28 }), { tone: "hi" }))}</g>`);
        out.push(ISO.tinted(ISO.T.red, S(K.cylinder(0, 0, 7, 24 + H + 6, 8, P, 28, 0.5), { tone: "hi" })));
        return out.join("");
      },
      words: (P, st) => (st.v > 0.5 ? ISO.word(K.iso([10, 0, 24 + 66], P), "plasma 55%", "#8a6a10", { size: 13, anchor: "start" }) + ISO.word(K.iso([10, 0, 24 + 37], P), "white cells and platelets <1%", "#555", { size: 12, anchor: "start" }) + ISO.word(K.iso([10, 0, 24 + 16], P), "red cells 45%", "#a3271b", { size: 13, anchor: "start" }) : ISO.word(K.iso([10, 0, 24 + 40], P), "whole blood", "#a3271b", { size: 13, anchor: "start" })),
    },
    step: (st, p) => { if (p.spin !== undefined) st.vT = +p.spin; },
    readout: (st) => (st.v > 0.5 ? "after spinning: plasma 55% on top, a thin white layer, red cells 45% at the bottom (the haematocrit)" : "whole blood, mixed"),
  });

  // stethoscope: ear pieces on a headset, tubing, and a chest piece with diaphragm and bell; the head turns over.
  simple({
    name: "stethoscope", title: "Stethoscope", compare: "stethoscope 460 270 300", about: "Ear pieces on a sprung headset, Y tubing and a chest piece with a diaphragm (high sounds) and a bell (low sounds).",
    line: "stethoscope cx cy size lab=1", demo: { line: "stethoscope 470 270 320", script: [{ set: { turn: 1 }, hold: "settle" }, { set: { turn: 0 }, hold: "settle" }] },
    build: {
      points: [[-80, -40, 0], [80, 40, 0], [-40, 0, 60], [40, 0, 60]],
      init: () => ({}),
      still: (P) => {
        const tube = (pts, w = 3.2) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="${w + 1}" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#3a3e44" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
        const out = [];
        for (const sx of [-1, 1]) out.push(ISO.tinted(ISO.T.steel, `<path d="${K.pathOf([[sx * 10, 0, 56], [sx * 24, 0, 46], [sx * 22, 0, 30], [sx * 8, 0, 22]].map((p) => K.iso(p, P)))}" fill="none" stroke="#8d9096" stroke-width="2.2"/>`), S(G.sphereOf([sx * 10, 0, 57], 2.4, P), { tone: "lo" }));
        out.push(tube([[-8, 0, 22], [0, 0, 16], [8, 0, 22]]), tube([[0, 0, 16], [0, 4, 8], [10, 20, 6], [40, 26, 6]]));
        return out.join("");
      },
      live: (P, st) => {
        const a = st.v * Math.PI, F = G.frameOf([52, 26, 8], [0, Math.sin(a), Math.cos(a)], [1, 0, 0], [0, Math.cos(a), -Math.sin(a)]);
        return ISO.tinted(ISO.T.steel, S(G.disc(-3, 3, 11, F, P, { steps: 36 }), { tone: "hi" }) + S(G.disc(-7, -3, 6, F, P, { steps: 24 }), { tone: "hi" })) + ISO.tinted(ISO.T.plastic, S(G.disc(3, 3.6, 10, F, P, { steps: 32 }), { tone: "hi", lit: true }));
      },
      words: (P, st) => ISO.word(K.iso([52, 26, 0], P), st.v > 0.5 ? "bell side: low sounds" : "diaphragm side: high sounds", "#555", { size: 13, dy: 16 }) + ISO.word(K.iso([0, 0, 62], P), "ear pieces", "#555", { size: 13, dy: -4 }),
    },
    step: (st, p) => { if (p.turn !== undefined) st.vT = +p.turn; },
    readout: (st) => (st.v > 0.5 ? "bell: rest it lightly to hear low sounds (some heart murmurs)" : "diaphragm: press firmly to hear high sounds (breathing, most heart sounds)"),
  });
})();
