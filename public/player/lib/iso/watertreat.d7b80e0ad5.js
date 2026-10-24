// "watertreat cx cy width labels=1 step=1..6" — a drinking-water treatment works as a museum cut-away model.
// On a walnut plinth, a concrete apron carries a row of open-topped tanks cut through along their front, so the water
// in each shows in section: the river intake behind its bar screen; the flocculation tank where a paddle stirs in
// alum so the dirt clumps into flocs; the settling tank whose sloped floor collects the sludge; the rapid sand filter
// (water over sand over gravel over the underdrain); the chlorine contact tank with its over-and-under baffles and a
// gas cylinder dosing it; the water tower on its legs; and a house with a tap. Each step lets the water on into the
// next stage and lights it, the water clearing as it goes; the readout gives the turbidity (NTU) and what the stage
// does. World units: about 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -44, CUT = 0, TH = 30, WALL = 2, ZG = -6;
  const PLINTH = { x: -156, y: -52, w: 312, d: 70, r: 4 };
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const waterMat = (c) => [mix(c, "#000000", 0.25), mix(c, "#ffffff", 0.35), c, mix(c, "#000000", 0.55)];
  // the six stages: tank span, water colour (murky → clear), turbidity after it, and what it does
  const ST = [
    { name: "intake", x: [-148, -122], c: "#b9ad7e", ntu: 40, say: "intake: river water in through a bar screen that stops leaves, fish and rubbish" },
    { name: "flocculation", x: [-116, -84], c: "#c2b98c", ntu: 40, say: "flocculation: alum makes the fine dirt stick together into flocs; the paddle stirs gently so they grow" },
    { name: "settling", x: [-78, -34], c: "#bccaa8", ntu: 4, say: "settling: the water moves slowly, the heavy flocs sink and collect as sludge" },
    { name: "filter", x: [-28, 2], c: "#b3d3e6", ntu: 0.3, say: "sand filter: the water trickles down through sand and gravel, which catch the last specks" },
    { name: "chlorine", x: [8, 40], c: "#a9cff0", ntu: 0.3, say: "chlorine: a small dose kills germs; the baffles make every drop stay about 30 minutes" },
    { name: "storage", x: [56, 84], c: "#a9cff0", ntu: 0.3, say: "storage: the water tower holds the clean water high up, so it flows to taps under pressure" },
  ];
  const LW = (x0, x1, h, floor = 0) => [[x0, floor], [x1, floor], [x1, floor + WALL], [x0 + WALL, floor + WALL], [x0 + WALL, h], [x0, h]];
  const RW = (x1, h, floor = 0) => M.rect(x1 - WALL, x1, floor + WALL, h);
  const U = (x0, x1, h, floor = 0) => [[x0, floor], [x1, floor], [x1, h], [x1 - WALL, h], [x1 - WALL, floor + WALL], [x0 + WALL, floor + WALL], [x0 + WALL, h], [x0, h]];
  const TOWER = { x: [56, 84], z0: 34, z1: 54 };

  function baseSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, ZG])}">${M.plinth(P, PLINTH)}</g>`];
    out.push(M.sec(P, M.rect(-150, 140, ZG, 0), Y0, CUT, "concrete"));
    // the river bank on the left, then each tank's back wall and its U of walls cut at the front
    out.push(M.sec(P, [[-150, 0], [-122, 0], [-122, TH], [-124, TH], [-124, 2], [-150, 2]], Y0, CUT, "soil"));
    return out.join("");
  }
  // tank i in three layers, so the water sits between its far (left) wall and its near (right) wall
  function backOf(P, i) {
    const st = ST[i], out = [];
    if (i === 0) return "";
    if (i === 5) return M.sec(P, LW(TOWER.x[0], TOWER.x[1], TOWER.z1, TOWER.z0), -30, CUT - 2, "steel");
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, st.x, [Y0, Y0 + WALL], [0, TH], "lo")));
    out.push(M.sec(P, LW(st.x[0], st.x[1], TH), Y0, CUT, "concrete"));
    if (i === 2) out.push(M.sec(P, [[-76, 2], [-36, 2], [-36, 5], [-56, 2.6], [-76, 6]], Y0 + WALL, CUT, "concrete"));
    if (i === 3) {
      const F = st.x;
      out.push(M.sec(P, M.rect(F[0] + WALL, F[1] - WALL, 2, 4), Y0 + WALL, CUT, "steel"), M.sec(P, M.rect(F[0] + WALL, F[1] - WALL, 4, 8), Y0 + WALL, CUT, "gravel", M.grains(P, M.rect(F[0] + WALL, F[1] - WALL, 4, 8), CUT, 30, "#5f5a52", 0.7, 3)),
        M.sec(P, M.rect(F[0] + WALL, F[1] - WALL, 8, 13), Y0 + WALL, CUT, "sand", M.grains(P, M.rect(F[0] + WALL, F[1] - WALL, 8, 13), CUT, 50, "#8a7440", 0.3, 5)));
      out.push(`<path d="${[-22, -16, -10, -4].map((x) => K.pathOf([K.iso([x, CUT + 0.1, 2.2], P), K.iso([x + 2, CUT + 0.1, 2.2], P)])).join("")}" stroke="#2f343a" stroke-width="1.2"/>`);
    }
    return out.join("");
  }
  function frontOf(P, i) {
    const st = ST[i];
    if (i === 0) return M.sec(P, M.rect(-124, -122, 2, TH), Y0, CUT, "concrete") + K.dotsSvg([...Array(8)].map((_, j) => K.iso([-127, CUT + 0.1, 3 + j * 2], P)), { size: 0.6, tone: "hi" });
    if (i === 5) return M.sec(P, RW(TOWER.x[1], TOWER.z1, TOWER.z0), -30, CUT - 2, "steel");
    let out = M.sec(P, RW(st.x[1], TH), Y0, CUT, "concrete");
    if (i === 4) { const C = st.x; out = M.sec(P, M.rect(C[0] + 9, C[0] + 10.4, 6, TH), Y0 + WALL, CUT, "concrete") + M.sec(P, M.rect(C[0] + 19, C[0] + 20.4, WALL, TH - 6), Y0 + WALL, CUT, "concrete") + out; }
    return out;
  }
  // the water tower: four legs, a cylindrical tank, a conical roof; the riser up from the chlorine tank
  function towerSvg(P) {
    const cx = 70, cy = -16, out = [], tint = ISO.T.steel;
    for (const [dx, dy] of [[-10, -10], [10, -10]]) out.push(ISO.tinted(tint, ISO.wbox(P, [cx + dx - 0.9, cx + dx + 0.9], [cy + dy - 0.9, cy + dy + 0.9], [0, TOWER.z0], "mid")));
    out.push(M.pipe(P, [[40 - 1, -14, 3], [48, -14, 3], [48, -14, TOWER.z0 + 1], [56.2, -14, TOWER.z0 + 1]], 1.2, { body: "#bcd6ee", ink: "#285f98", shine: "#e3f0fa" }));
    out.push(`<g data-name="storage">${backOf(P, 5)}<g data-part="w5"></g>${frontOf(P, 5)}</g>` + ISO.tinted(tint, ISO.poly([[56, -30, 54], [84, -30, 54], [84, -2, 54], [56, -2, 54], [70, -16, 62]], [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [0, 1, 2, 3]], P, "mid")));
    for (const [dx, dy] of [[-10, 10], [10, 10]]) out.push(ISO.tinted(tint, ISO.wbox(P, [cx + dx - 0.9, cx + dx + 0.9], [cy + dy - 0.9, cy + dy + 0.9], [0, TOWER.z0], "mid")));
    // the main down to the house and its tap
    out.push(M.pipe(P, [[78, -8, TOWER.z0 + 0.1], [78, -8, 3], [112, -8, 3], [112, -8, 6.2]], 1, {}));
    out.push(M.named("tap", M.house(P, 126, -18, 0, 24, 20, 17)));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(112, -8, 1.4, 6.2, 5, P, 16), { tone: "hi" }) + ISO.wbox(P, [112, 117], [-8.6, -7.4], [10, 11.2], "hi") + ISO.wbox(P, [116, 117.2], [-8.6, -7.4], [8.4, 10], "hi")));
    // the alum dosing tank over the flocculator, and the chlorine cylinder over the contact tank
    // the alum dosing tank and the chlorine cylinder, each on a steel deck bridging two wall tops
    // (the walls are ISO.prismY sections, which audit.mjs doesn't record, so these and the pipe flanges read "loose")
    const deck = (x0, x1) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [x0, x1], [-40, -30], [TH, TH + 0.8], "mid"));
    out.push(deck(-124, -114), ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 3.4], [5, 3.4], [5.6, 2.8, 1], [6, 0]], M.Z([-119, -35, TH + 0.8]), P, { steps: 28 }), { tone: "hi" })));
    out.push(deck(0, 10), ISO.tinted(ISO.T.green, S(G.lathe([[0, 0], [0, 2.4], [9, 2.4], [10.4, 1.6, 1], [11, 0]], M.Z([5, -35, TH + 0.8]), P, { steps: 28 }), { tone: "hi" })), ISO.tinted(ISO.T.brass, S(K.cylinder(5, -35, 0.8, TH + 11.8, 1.6, P, 12), { tone: "mid" })));
    // the paddle's bridge beam and motor
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-116, -84], [-17, -13], [TH, TH + 1.4], "mid")), ISO.tinted(ISO.T.blue, S(K.cylinder(-100, -15, 2.4, TH + 1.4, 4, P, 20), { tone: "hi" })));
    return out.join("");
  }
  // the paddle: a shaft and two blades turned to angle th (two-fold, so 24 poses over half a turn)
  function paddleSvg(P, th) {
    const cx = -100, cy = -15, out = [ISO.tinted(ISO.T.steel, S(K.cylinder(cx, cy, 0.6, 5, TH - 3.6, P, 12), { tone: "hi" }))];
    const blades = [0, Math.PI].map((a0) => { const a = th + a0, at = (u, w, z) => [cx + u * Math.cos(a) - w * Math.sin(a), cy + u * Math.sin(a) + w * Math.cos(a), z]; return { k: K.depthOf(at(6, 0, 10), P), svg: ISO.tinted(ISO.T.wood, ISO.box(at, P, [1, 11], [-0.4, 0.4], [6, 18], "mid")) }; });
    blades.sort((a, b) => a.k - b.k);
    return blades[0].svg + out[0] + blades[1].svg;
  }
  // the water in stage i, filled to its share of the progress k
  function waterOf(P, i, k) {
    const st = ST[i], f = ISO.clamp(k - i, 0, 1);
    if (i === 0) return M.sec(P, [[-150, 2], [-124, 2], [-124, 18], [-150, 18]], Y0, CUT, waterMat(st.c));
    if (f < 0.02) return i === 2 ? M.sec(P, [[-76, 6], [-56, 2.6], [-36, 5], [-36, 6.4], [-56, 4.2], [-76, 8]], Y0 + WALL, CUT, "sludge") : "";
    if (i === 5) { const top = TOWER.z0 + WALL + (TOWER.z1 - 3 - TOWER.z0 - WALL) * f; return M.sec(P, M.rect(TOWER.x[0] + WALL, TOWER.x[1] - WALL, TOWER.z0 + WALL, top), -28, CUT - 2, waterMat(st.c)); }
    const floor = i === 3 ? 13 : WALL, top = floor + (TH - 4 - floor) * f;
    const pts = i === 2 ? [[-76, 6], [-56, 2.6], [-36, 5], [-36, top], [-76, top]] : M.rect(st.x[0] + WALL, st.x[1] - WALL, floor, top);
    let out = M.sec(P, pts, Y0 + WALL, CUT, waterMat(st.c));
    if (i === 2) out += M.sec(P, [[-76, 6], [-56, 2.6], [-36, 5], [-36, 6.4], [-56, 4.2], [-76, 8]], Y0 + WALL, CUT, "sludge");
    return out;
  }
  // the transfer channels over the walls between tanks, drawn after the water
  function linksSvg(P) {
    const B = { body: "#bcd6ee", ink: "#285f98", shine: "#e3f0fa" };
    return M.pipe(P, [[-121.8, -14, 16], [-116.2, -14, 16]], 1.2, B) + M.pipe(P, [[-83.8, -14, 17], [-78.2, -14, 17]], 1.2, B) + M.pipe(P, [[-33.8, -14, 17], [-28.2, -14, 17]], 1.2, B) + M.pipe(P, [[2.2, -14, 3], [7.8, -14, 3]], 1.2, B);
  }
  const PATHS = [
    [[-146, CUT + 0.2, 12], [-118, CUT + 0.2, 14]],
    [[-114, CUT + 0.2, 14], [-104, CUT + 0.2, 8], [-94, CUT + 0.2, 14], [-86, CUT + 0.2, 16]],
    [[-74, CUT + 0.2, 15], [-38, CUT + 0.2, 15]],
    [[-24, CUT + 0.2, 17], [-24, CUT + 0.2, 4], [-2, CUT + 0.2, 4], [-2, CUT + 0.2, 17]].slice(0, 2).concat([[-10, CUT + 0.2, 3], [6, CUT + 0.2, 3]]),
    [[11, CUT + 0.2, 4], [15, CUT + 0.2, 16], [24, CUT + 0.2, 4], [34, CUT + 0.2, 16], [38, CUT + 0.2, 4]],
    [[48, -14, 4], [48, -14, 34], [60, CUT - 1.8, 38]],
  ];
  function flocsSvg(P, t, k) {
    if (k < 2.05) return "";
    const kk = K.cameraOf(P).k, out = [];
    for (let i = 0; i < 14; i++) { const f = (t * 0.15 + i / 14) % 1, x = -72 + ((i * 37) % 34), z = 17 - f * 11 - (x > -56 ? 0 : 1); out.push(`<circle cx="${K.iso([x, CUT + 0.15, z], P)[0].toFixed(1)}" cy="${K.iso([x, CUT + 0.15, z], P)[1].toFixed(1)}" r="${(0.55 * kk).toFixed(2)}" fill="#6b5a3a" opacity="${(Math.min(1, (1 - f) * 3) * 0.8).toFixed(2)}"/>`); }
    return out.join("");
  }

  ISO.add({
    name: "watertreat", title: "Water treatment works", compare: "watertreat 480 270 560",
    about: "A cut-away model of a water treatment works: intake, flocculation, settling, sand filter, chlorine, storage and tap; each step lets the water into the next stage and it clears.",
    line: "watertreat cx cy width labels=1 step=1..6 lit=intake|flocculation|settling|filter|chlorine|storage|tap",
    steps: ST.map((st, i) => ({ title: st.name, say: st.say, lit: st.name })),
    demo: { line: "watertreat 480 280 600 step=1", script: [2, 3, 4, 5, 6].map((n) => ({ set: { step: n }, hold: 2.4 })) },
    make([cx, cy, size = 560], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.08, H = size * 0.66;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, ZG - 13, ZG), [-150, Y0, TH], [140, CUT, TH], [70, -16, 62]], cx, cy, W, H, { azimuth: 64, elevation: 32 }, parent);
      const tanks = [0, 1, 2, 3, 4].map((i) => `<g data-name="${ST[i].name}">${backOf(P, i)}<g data-part="w${i}"></g>${i === 1 ? '<g data-part="paddle"></g>' : i === 2 ? '<g data-part="flocs"></g>' : ""}${frontOf(P, i)}</g>`).join("");
      g.innerHTML = `<g>${baseSvg(P)}</g>${tanks}<g>${linksSvg(P)}${towerSvg(P)}</g><g data-part="flow"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const step0 = ISO.clamp(Math.round(ISO.num(o, "step", 6)), 1, 6);
      const s = { step: step0, k: step0, th: 0, ph: 0, t: 0 };
      let lit = o.lit;
      const PAD = new Map();
      const draw = () => {
        for (let i = 0; i < 6; i++) { const f = ISO.clamp(s.k - i, 0, 1).toFixed(2); w.rebuild(el["w" + i], f, () => waterOf(P, i, s.k)); }
        w.rebuild(el.flocs, s.k > 2.05 ? (Math.round(s.t * 15) / 15).toFixed(2) : "", () => flocsSvg(P, s.t, s.k));
        const q = Math.round((((s.th % Math.PI) + Math.PI) % Math.PI) / Math.PI * 24) % 24;
        w.rebuild(el.paddle, q, () => { if (!PAD.has(q)) PAD.set(q, paddleSvg(P, (q / 24) * Math.PI)); return PAD.get(q); });
        const fk = `${(Math.round(s.ph * 2) / 2 % 24).toFixed(1)} ${s.k.toFixed(1)}`;
        w.rebuild(el.flow, fk, () => PATHS.map((p, i) => (s.k > i + 0.6 ? M.flow(P, p, s.ph, { color: i < 2 ? "#5f5a32" : "#1f4f8f", gap: 9, dash: 3.5, w: 1.1, amount: ISO.clamp(s.k - i - 0.6, 0, 1) }) : "")).join(""));
        w.rebuild(el.words, lab ? "w" : "", () => !lab ? "" : ST.map((st) => M.label(P, [(st.x[0] + st.x[1]) / 2, CUT, ZG], st.name, "#2b2b2b", { dy: 16 })).join("") + M.label(P, [124, 0, ZG], "tap", "#2b2b2b", { dy: 16 }));
        M.light(g, w, lit !== undefined ? lit : ST[s.step - 1].name);
      };
      g.set = (p) => {
        if (p.step !== undefined) s.step = ISO.clamp(Math.round(+p.step), 1, 6);
        if (p.lit !== undefined) lit = p.lit;
      };
      // each tank fills in about 1.6 s once the step lets the water on; the paddle turns while its tank has water
      g.update = (dt) => {
        const calm = ISO.still();
        s.k = calm ? s.step : s.k + Math.sign(s.step - s.k) * Math.min(Math.abs(s.step - s.k), dt * 0.65);
        s.t += dt;
        if (!calm) { if (s.k > 1.3) s.th += dt * 1.2; s.ph += dt * 10; }
        draw();
        return true;
      };
      g.readout = () => { const st = ST[s.step - 1]; return `${s.step}. ${st.say} · turbidity ${st.ntu} NTU (drinking water must be under 1)`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
