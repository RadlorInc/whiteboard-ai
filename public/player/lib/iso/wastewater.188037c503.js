// "wastewater cx cy width labels=1 step=1..5" — a sewage works as a museum cut-away model.
// On a walnut plinth, a concrete apron carries the works in the order the sewage meets them: the inlet sewer and the
// bar screen (screenings lifted into a skip), the primary settling tank with sludge in its hopper, the aeration tank
// cut open so air from the blower bubbles up through the diffusers on its floor and feeds the microbes, the round
// final clarifier with its scraper bridge turning slowly over the water, and the outfall into the river. Each step
// lets the sewage on into the next stage and lights it; the readout gives the BOD (how much oxygen the dirt in the
// water would use up) after that stage. World units: about 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -44, CUT = 0, TH = 26, WALL = 2, ZG = -6;
  const PLINTH = { x: -160, y: -52, w: 318, d: 70, r: 4 };
  const CL = [24, -22], CR = 20;                                // the round clarifier: centre, outer radius
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const waterMat = (c) => [mix(c, "#000000", 0.25), mix(c, "#ffffff", 0.35), c, mix(c, "#000000", 0.55)];
  const ST = [
    { name: "screen", x: [-150, -122], c: "#8f7a54", bod: 300, say: "screen: bars catch rags, plastic and grit; they are raked off into a skip" },
    { name: "settling", x: [-116, -72], c: "#a0906a", bod: 200, say: "primary settling: the sewage sits still, solids sink as sludge, grease floats off; about a third of the dirt goes" },
    { name: "aeration", x: [-66, -14], c: "#98915e", bod: 200, say: "aeration: air bubbles up from the floor so microbes can breathe while they eat the dissolved dirt" },
    { name: "clarifier", x: [4, 44], c: "#b8d6e6", bod: 15, say: "final clarifier: the microbes settle out (most go back to the aeration tank) and clear water spills over the rim" },
    { name: "river", x: [70, 150], c: "#9fcbea", bod: 15, say: "outfall: the cleaned water goes back to the river, clean enough for fish (under 25 mg/L)" },
  ];
  const LW = (x0, x1, h) => [[x0, 0], [x1, 0], [x1, WALL], [x0 + WALL, WALL], [x0 + WALL, h], [x0, h]];
  const RW = (x1, h) => M.rect(x1 - WALL, x1, WALL, h);

  function baseSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, ZG])}">${M.plinth(P, PLINTH)}</g>`];
    out.push(M.sec(P, M.rect(-154, 70, ZG, 0), Y0, CUT, "concrete"));
    // the river: banks and bed cut on the face, at the right
    out.push(M.sec(P, [[70, ZG], [154, ZG], [154, 6], [146, 6], [136, -2], [84, -2], [76, 6], [70, 6]], Y0, CUT, "soil", M.grains(P, [[70, ZG], [154, ZG], [154, -3], [70, -3]], CUT, 30, "#9a7a50", 0.5, 4)));
    out.push(M.sec(P, [[84, -2], [136, -2], [134, -0.6], [86, -0.6]], Y0, CUT, "gravel"));
    return out.join("");
  }
  function backOf(P, i) {
    const st = ST[i], out = [];
    if (i >= 3) return "";
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, st.x, [Y0, Y0 + WALL], [0, TH], "lo")), M.sec(P, LW(st.x[0], st.x[1], TH), Y0, CUT, "concrete"));
    if (i === 1) out.push(M.sec(P, [[-114, 2], [-74, 2], [-74, 8], [-94, 2.4], [-114, 6]], Y0 + WALL, CUT, "concrete"));
    if (i === 2) {
      // (header, domes, decks and pipe flanges sit on ISO.prismY floors and walls, which audit.mjs doesn't record: "loose" there is a false positive)
      // the air header along the back of the floor and the diffuser domes in rows, cut ones on the face
      out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-62, -18], [-38, -36], [2, 3.4], "mid")));
      for (let x = -60; x <= -20; x += 8) for (const y of [-30, -18, -6]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 1.6, 2, 0.9, P, 16), { tone: "hi" })));
    }
    return out.join("");
  }
  function frontOf(P, i) {
    const st = ST[i];
    if (i === 0) return M.sec(P, RW(st.x[1], TH), Y0, CUT, "concrete") + K.dotsSvg([...Array(9)].map((_, j) => K.iso([-136 + j * 0.9, CUT + 0.1, 3 + j * 2], P)), { size: 0.6, tone: "hi" });
    if (i === 2) return [-60, -52, -44, -36, -28, -20].map((x) => `<path d="${K.pathOf([[x - 1.6, CUT + 0.12, 2], [x + 1.6, CUT + 0.12, 2], [x + 1.6, CUT + 0.12, 2.9], [x - 1.6, CUT + 0.12, 2.9]].map((p) => K.iso(p, P)), true)}" fill="#9aa1a9" stroke="#3c3f45" stroke-width=".5"/>`).join("") + M.sec(P, RW(st.x[1], TH), Y0, CUT, "concrete");
    if (i < 3) return M.sec(P, RW(st.x[1], TH), Y0, CUT, "concrete");
    return "";
  }
  function waterOf(P, i, k) {
    const st = ST[i], f = ISO.clamp(k - i, 0, 1), mat = waterMat(st.c);
    if (i === 0) return M.sec(P, M.rect(st.x[0] + WALL, st.x[1] - WALL, WALL, WALL + 12), Y0 + WALL, CUT, mat);
    if (i === 4) { const top = -2 + 7 * Math.max(0.35, f); return M.sec(P, [[84, -0.6], [136, -0.6], [134 + 4 * (top + 2) / 8, top], [86 - 4 * (top + 2) / 8, top]], Y0, CUT, mat); }
    const sludge = i === 1 ? M.sec(P, [[-114, 6], [-94, 2.4], [-74, 8], [-74, 9.2], [-94, 4.4], [-114, 8]], Y0 + WALL, CUT, "sludge") : "";
    if (i === 3) {
      if (f < 0.02) return "";
      // the tank is seen whole (not cut), brim full: the water shows as its surface, growing in from the rim as it fills
      const F = M.Z([CL[0], CL[1], 0]);
      return `<path d="${G.circleOf(F, TH + 0.04, (CR - WALL - 0.05) * Math.sqrt(f), P, 64)}" fill="${st.c}" stroke="${mix(st.c, "#000000", 0.5)}" stroke-width=".6"/>`;
    }
    if (f < 0.02) return sludge;
    const top = WALL + (TH - 4 - WALL) * f, pts = i === 1 ? [[-114, 6], [-94, 2.4], [-74, 8], [-74, top], [-114, top]] : M.rect(st.x[0] + WALL, st.x[1] - WALL, WALL, top);
    return M.sec(P, pts, Y0 + WALL, CUT, mat) + sludge;
  }
  // the clarifier: floor, a ring wall built as a band round its axis, the centre column
  function clarifierBack(P) {
    const F = M.Z([CL[0], CL[1], 0]), T = M.tintOf("concrete");
    return ISO.tinted(T, S(G.lathe([[0, 0], [0, CR], [TH, CR], [TH, 0]], F, P, { steps: 72 }), { tone: "mid" })) +
      `<path d="${G.circleOf(F, TH + 0.02, CR - WALL, P, 64)}" fill="#a9a59c" stroke="#7a766e" stroke-width=".5"/>`;
  }
  // the scraper bridge: a walkway from the centre column to the rim, turned to angle th (a whole turn: 48 poses)
  function bridgeSvg(P, th) {
    const [cx, cy] = CL, at = (u, w, z) => [cx + u * Math.cos(th) - w * Math.sin(th), cy + u * Math.sin(th) + w * Math.cos(th), z];
    const parts = [
      { k: 0, svg: ISO.tinted(ISO.T.steel, S(K.cylinder(cx, cy, 2.4, TH, 2.6, P, 24), { tone: "hi" })) },
      { k: 1, svg: ISO.tinted(ISO.T.amber, ISO.box(at, P, [1, CR + 0.6], [-1.6, 1.6], [TH + 0.4, TH + 1.6], "mid")) },
      { k: 1, svg: ISO.tinted(ISO.T.paint, ISO.box(at, P, [CR - 2.4, CR + 0.6], [-2, 2], [TH + 1.6, TH + 4], "mid")) },
    ];
    const far = K.depthOf(at(8, 0, TH), P) < K.depthOf([cx, cy, TH], P);
    return far ? parts[1].svg + parts[2].svg + parts[0].svg : parts[0].svg + parts[1].svg + parts[2].svg;
  }
  function kitSvg(P) {
    const B = { body: "#d6c7a6", ink: "#6e4a28", shine: "#efe4cc" }, C = { body: "#bcd6ee", ink: "#285f98", shine: "#e3f0fa" }, out = [];
    // the inlet sewer, the links between tanks, the clarifier's outlet to the river's outfall
    out.push(M.pipe(P, [[-153, -14, 10], [-148.2, -14, 10]], 1.6, B));
    out.push(M.pipe(P, [[-121.8, -14, 13], [-116.2, -14, 13]], 1.3, B), M.pipe(P, [[-71.8, -14, 19], [-66.2, -14, 19]], 1.3, B));
    out.push(M.pipe(P, [[-13.8, -14, 19], [-4, -14, 19], [-4, -22, 19], [4.2, -22, 19]], 1.3, B));
    out.push(M.pipe(P, [[43.8, -22, 20], [56, -22, 20], [56, -22, 3], [80, -22, 3], [80, -22, 6.2]], 1.3, C));
    // the deck and blower over the aeration tank's left wall, the air main down into the tank
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-74, -62], [-42, -32], [TH, TH + 0.8], "mid")));
    out.push(M.named("blower", ISO.tinted(ISO.T.blue, ISO.wbox(P, [-72, -64], [-41, -34], [TH + 0.8, TH + 6], "mid")) + ISO.tinted(ISO.T.blue, S(G.lathe([[0, 0], [0, 2.4], [5, 2.4], [5, 0]], G.frameOf([-68, -37.5, TH + 6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 24 }), { tone: "hi" }))));
    out.push(M.pipe(P, [[-64, -37, TH + 3], [-60, -37, TH + 3], [-60, -37, TH - 3.6]], 1, {}));
    // the screenings skip on its deck by the screen, and the rake's frame over the bars
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-126, -112], [-42, -30], [TH, TH + 0.8], "mid")), ISO.tinted(ISO.T.amber, ISO.poly([[-124, -40, TH + 0.8], [-115, -40, TH + 0.8], [-115, -32, TH + 0.8], [-124, -32, TH + 0.8], [-126, -41, TH + 6], [-113, -41, TH + 6], [-113, -31, TH + 6], [-126, -31, TH + 6]], ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-138, -128], [-40, -36], [TH, TH + 1.2], "mid")));
    return out.join("");
  }
  // bubbles rising through the aeration tank's water on the cut face
  function bubblesSvg(P, t, top) {
    const k = K.cameraOf(P).k, out = [];
    for (let i = 0; i < 26; i++) {
      const f = (t * 0.45 + ((i * 7) % 26) / 26) % 1, x = -60 + (i % 6) * 8 + Math.sin(t * 3 + i) * 0.8 + (i % 3) * 0.6, z = 3.5 + f * (top - 4.5);
      const p = K.iso([x, CUT + 0.15, z], P);
      out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${((0.5 + f * 0.5) * k).toFixed(2)}" fill="#f4f8fc" stroke="#5d7f96" stroke-width=".4" opacity="${Math.min(1, (1 - f) * 5).toFixed(2)}"/>`);
    }
    return out.join("");
  }
  const PATHS = [
    [[-148, CUT + 0.2, 10], [-124, CUT + 0.2, 11]],
    [[-112, CUT + 0.2, 12], [-76, CUT + 0.2, 17]],
    [[-62, CUT + 0.2, 19], [-18, CUT + 0.2, 19]],
    [[-4, -14, 19], [-4, -22, 19], [24, -22, TH - 2.4], [43, -22, TH - 2.4]],
    [[56, -22, 20], [56, -22, 3], [80, -22, 3], [100, CUT + 0.2, 1.5], [150, CUT + 0.2, 1.5]],
  ];

  ISO.add({
    name: "wastewater", title: "Sewage works", compare: "wastewater 480 270 560",
    about: "A cut-away model of a sewage works: screen, primary settling, aeration with bubbles, round clarifier with a turning bridge, and the outfall to the river.",
    line: "wastewater cx cy width labels=1 step=1..5 lit=screen|settling|aeration|blower|clarifier|river",
    steps: ST.map((st) => ({ title: st.name, say: st.say, lit: st.name })),
    demo: { line: "wastewater 480 280 600 step=1", script: [2, 3, 4, 5].map((n) => ({ set: { step: n }, hold: 2.6 })) },
    make([cx, cy, size = 560], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.08, H = size * 0.62;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, ZG - 13, ZG), [-154, Y0, TH + 6], [154, CUT, 6]], cx, cy, W, H, { azimuth: 64, elevation: 32 }, parent);
      const tanks = [0, 1, 2].map((i) => `<g data-name="${ST[i].name}">${backOf(P, i)}<g data-part="w${i}"></g>${i === 2 ? '<g data-part="bubbles"></g>' : ""}${frontOf(P, i)}</g>`).join("");
      g.innerHTML = `<g>${baseSvg(P)}</g>${tanks}<g data-name="clarifier">${clarifierBack(P)}<g data-part="w3"></g><g data-part="bridge"></g></g><g data-name="river"><g data-part="w4"></g></g><g>${kitSvg(P)}</g><g data-part="flow"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const step0 = ISO.clamp(Math.round(ISO.num(o, "step", 5)), 1, 5);
      const s = { step: step0, k: step0, th: 0.6, ph: 0, t: 0 };
      let lit = o.lit;
      const BR = new Map();
      const draw = () => {
        for (let i = 0; i < 5; i++) { const f = ISO.clamp(s.k - i, 0, 1).toFixed(2); w.rebuild(el["w" + i], f, () => waterOf(P, i, s.k)); }
        const air = ISO.clamp(s.k - 2, 0, 1), top = WALL + (TH - 4 - WALL) * air;
        w.rebuild(el.bubbles, air > 0.3 ? (Math.round(s.t * 30) / 30).toFixed(2) + top.toFixed(1) : "", () => (air > 0.3 ? bubblesSvg(P, s.t, top) : ""));
        const q = Math.round((((s.th % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * 48) % 48;
        w.rebuild(el.bridge, q, () => { if (!BR.has(q)) BR.set(q, bridgeSvg(P, (q / 48) * Math.PI * 2)); return BR.get(q); });
        const fk = `${(Math.round(s.ph * 2) / 2 % 24).toFixed(1)} ${s.k.toFixed(1)}`;
        w.rebuild(el.flow, fk, () => PATHS.map((p, i) => (s.k > i + 0.6 ? M.flow(P, p, s.ph, { color: i < 3 ? "#5a3f22" : "#1f4f8f", gap: 9, dash: 3.5, w: 1.1, amount: ISO.clamp(s.k - i - 0.6, 0, 1) }) : "")).join(""));
        w.rebuild(el.words, lab ? "w" : "", () => !lab ? "" : ST.map((st, i) => M.label(P, i === 3 ? [CL[0], -2, ZG] : [(st.x[0] + st.x[1]) / 2, CUT, ZG], st.name, "#2b2b2b", { dy: 16 })).join("") + M.label(P, [-156, CUT, 10], "sewage in", "#6e4a28", { anchor: "end" }));
        M.light(g, w, lit !== undefined ? lit : ST[s.step - 1].name);
      };
      g.set = (p) => {
        if (p.step !== undefined) s.step = ISO.clamp(Math.round(+p.step), 1, 5);
        if (p.lit !== undefined) lit = p.lit;
      };
      // each stage fills in about 1.5 s; the bridge turns once in about a minute (real ones: 20–60 minutes)
      g.update = (dt) => {
        const calm = ISO.still();
        s.k = calm ? s.step : s.k + Math.sign(s.step - s.k) * Math.min(Math.abs(s.step - s.k), dt * 0.65);
        s.t += dt;
        if (!calm) { if (s.k > 3.2) s.th += dt * 0.1; s.ph += dt * 10; }
        draw();
        return true;
      };
      g.readout = () => { const st = ST[s.step - 1]; return `${s.step}. ${st.say} · BOD ${st.bod} mg/L (raw sewage about 300)`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
