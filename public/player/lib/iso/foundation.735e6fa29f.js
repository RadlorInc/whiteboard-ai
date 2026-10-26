// "foundation cx cy width k=pile|raft labels=1 load=0..1" — a house's foundation as a museum cut-away model.
// A walnut plinth carries a block of ground cut open along its front: grass and topsoil, soft clay, sand and gravel,
// bedrock. On it stands a two-storey house. k=pile: a ground beam on bored concrete piles (reinforcing cage drawn in
// section) down through the clay to a socket in the rock; k=raft: a thick reinforced slab with downstand edges that
// spreads the house over the clay. load=1 puts the house's weight on: an arrow on the roof, the force running down the
// piles and shared between friction up the shaft and bearing at the toe, or the soil pushing up under the raft and the
// pressure bulb spreading below it, and a small settlement (drawn 40× larger than true). World units: 0.1 m.
(() => {
  const K = window.K, M = window.MODEL;
  const Y0 = -60, CUT = 0, BOT = -84, PILE_TOE = -66;
  const PLINTH = { x: -106, y: -68, w: 212, d: 84, r: 4 };
  const LAYERS = [
    ["bedrock", "rock", -62, BOT, "#565c63"], ["sand and gravel", "gravel", -38, -62, "#5f5a52"],
    ["soft clay", "clay", -5, -38, "#7a4a28"], ["topsoil", "topsoil", -1, -5, "#4f3a22"],
  ];
  const PILES = [-38, -13, 13, 38];
  const W_KN = 1200, AREA = 8.6 * 5.6, RAFT_T = 0.6, ALLOW = 100;        // house weight, raft plan m², slab m, clay kPa
  const NP = 8, PILE_D = 0.3, CU = 25, ALPHA = 0.8, FS_SAND = 30;         // piles, m, clay cu kPa, α, sand friction kPa
  const face = (P, pts, fill, ink, w = 0.8, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const top = (P, x0, x1, y0, y1, z, fill, ink) => `<path d="${K.pathOf([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width=".8"/>`;
  const stroke = (P, pts, color, w, y = CUT + 0.12) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)))}" fill="none" stroke="${color}" stroke-width="${w}"/>`;

  function groundSvg(P) {
    const out = [M.plinth(P, PLINTH, { z: BOT })];
    for (const [, mat, z0, z1] of LAYERS) {
      const pts = M.rect(-100, 100, z1, z0);
      const grains = mat === "gravel" ? M.grains(P, pts, CUT, 90, "#8a847a", 0.9, 5) : mat === "rock" ? M.grains(P, pts, CUT, 30, "#8d939a", 1.2, 2) : mat === "clay" ? M.grains(P, pts, CUT, 40, "#b98a62", 0.5, 9) : "";
      out.push(M.named(mat === "rock" ? "bedrock" : mat, M.sec(P, pts, Y0, CUT, mat, grains)));
    }
    // cracks in the rock, roots in the topsoil (on the cut face, ending on the layer lines)
    out.push(stroke(P, [[-80, -62], [-74, -70], [-76, -78], [-70, -84]], "#6b737c", 0.7), stroke(P, [[60, -62], [66, -72], [62, -84]], "#6b737c", 0.7));
    out.push(M.sec(P, M.rect(-100, 100, -1, 0), Y0, CUT, "grass"));
    // a garden fence along the back edge (posts and two rails), and the drain pipe cut across in the clay
    for (let x = -96; x <= 96; x += 16) out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x - 0.8, x + 0.8], [-58.8, -57.2], [0, 14], "mid")));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-96.8, 96.8], [-57.4, -56.8], [5, 7], "mid") + ISO.wbox(P, [-96.8, 96.8], [-57.4, -56.8], [10, 12], "mid")));
    const pipe = (r) => [...Array(24)].map((_, i) => [70 + Math.cos((i / 24) * Math.PI * 2) * r, -14 + Math.sin((i / 24) * Math.PI * 2) * r]);
    out.push(face(P, pipe(3.2), "#c86a3e", "#6e3a1c", 0.8), face(P, pipe(2.3), "#5a4632", "#6e3a1c", 0.5));
    out.push(M.tree(P, -84, -44, 0, 1.4), M.tree(P, 82, -50, 0, 1.2), M.tree(P, 88, -20, 0, 0.9));
    return out.join("");
  }
  // The foundation in section on the cut face (its top shows at ground level), drawn for k.
  function footSvg(P, k) {
    const out = [];
    if (k === "raft") {
      out.push(top(P, -48, 48, -56, CUT, 0.06, "#dedcd5", "#5f5f5c"));
      out.push(M.named("raft", face(P, [[-48, 0], [48, 0], [48, -14], [40, -14], [36, -6], [-36, -6], [-40, -14], [-48, -14]], "#e6e4de", "#5f5f5c", 1)));
      // the reinforcing bars cut across: a top and a bottom mat of dots, and the downstands' links
      out.push(M.D([...Array(23)].flatMap((_, i) => { const x = -44 + i * 4; return [K.iso([x, CUT + 0.15, -1.4], P), K.iso([x, CUT + 0.15, Math.abs(x) > 38 ? -12.6 : -4.6], P)]; }), { size: 0.55, tone: "hi" }));
    } else {
      out.push(top(P, -46, 46, -56, CUT, 0.06, "#dedcd5", "#5f5f5c"));
      out.push(M.named("ground beam", face(P, M.rect(-46, 46, -7, 0), "#e6e4de", "#5f5f5c", 1)));
      out.push(M.named("piles", PILES.map((x) => face(P, [[x - 3, -7], [x + 3, -7], [x + 3, PILE_TOE + 1], [x, PILE_TOE], [x - 3, PILE_TOE + 1]], "#dcdad3", "#5f5f5c", 0.9) +
        stroke(P, [[x - 1.8, -5], [x - 1.8, PILE_TOE + 2]], "#7a7870", 0.6) + stroke(P, [[x + 1.8, -5], [x + 1.8, PILE_TOE + 2]], "#7a7870", 0.6) +
        [...Array(12)].map((_, i) => stroke(P, [[x - 1.8, -9 - i * 4.8], [x + 1.8, -9 - i * 4.8]], "#9a988f", 0.45)).join("")).join("")));
    }
    // (the chimney stands on the roof, an ISO.poly the audit doesn't record: its "loose" is a false positive)
    out.push(M.named("house", M.house(P, 0, -27, 0, 80, 50, 46, { roof: "#c0533a" }) + ISO.tinted(M.tintOf("brick"), ISO.wbox(P, [22, 28], [-36, -30], [70, 80], "mid"))));
    return out.join("");
  }
  // forces for load v (0..1): the weight on the roof, then the load path into the ground
  function forceSvg(P, k, v, sink) {
    if (v < 0.02) return "";
    const red = "#c0392b", blue = "#1f4f8f", y = CUT + 0.3, out = [];
    out.push(M.arrow(P, [0, -2, 104 + 26 * v], [0, -2, 98], { color: red, w: 3.4, head: 7 }));
    if (k === "raft") {
      for (let x = -42; x <= 42; x += 7) out.push(M.arrow(P, [x, y, -16 - sink - 14 * v], [x, y, (Math.abs(x) > 38 ? -14 : -6) - sink - 0.6], { color: blue, w: 1.6, head: 3.6 }));
      // the pressure bulb: lines of equal stress in the clay, 50%, 25% and 10% of the pressure under the slab
      const bulb = (b, d) => [...Array(25)].map((_, i) => { const a = Math.PI * (i / 24); return [-Math.cos(a) * b, -6 - Math.sin(a) * d]; });
      for (const [b, d, o] of [[40, 30, 0.8], [52, 46, 0.6], [62, 62, 0.4]]) out.push(`<g opacity="${(o * v).toFixed(2)}">${stroke(P, bulb(b, d), "#a8382a", 1.1, y)}</g>`);
    } else {
      for (const x of PILES) {
        out.push(M.arrow(P, [x, y, -8 - sink], [x, y, -8 - sink - 22 * v], { color: red, w: 1.8, head: 4 }));
        for (let z = -14; z > PILE_TOE + 6; z -= 9) for (const sx of [-1, 1]) out.push(M.arrow(P, [x + sx * 4.6, y, z - 4 * v], [x + sx * 4.6, y, z], { color: blue, w: 1.1, head: 2.6 }));
        out.push(M.arrow(P, [x, y, PILE_TOE - 3 - 8 * v], [x, y, PILE_TOE - 1], { color: blue, w: 1.8, head: 3.4 }));
      }
    }
    return `<g opacity="${Math.min(1, v * 2).toFixed(2)}">${out.join("")}</g>`;
  }
  // true numbers for the readout
  const raftKPa = (v) => (W_KN * v) / AREA + RAFT_T * 25;
  const pileSplit = (v) => {
    const per = (W_KN * v) / NP, per2 = Math.PI * PILE_D;
    const capF = per2 * (ALPHA * CU * 3.3 + FS_SAND * 2.4);              // clay 3.3 m, sand and gravel 2.4 m of shaft
    const f = Math.min(per, capF * 0.6);                                 // friction is mobilised first
    return [per, f, per - f];
  };

  ISO.add({
    name: "foundation", title: "House foundation", compare: "foundation 480 290 460 k=pile",
    about: "A cut-away model of the ground under a house: soil layers to bedrock, the house on piles or on a raft; load it and the forces run into the ground.",
    line: "foundation cx cy width k=pile|raft labels=1 load=0..1 lit=house|piles|ground beam|raft|clay|gravel|bedrock",
    demo: { line: "foundation 480 280 500 k=pile load=0", script: [{ set: { load: 1 }, hold: "settle" }, { set: { k: "raft", load: 0 }, hold: "settle" }, { set: { load: 1 }, hold: "settle" }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.1, H = size * 0.88;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, BOT - 13, BOT), [-100, Y0, 0], [100, CUT, 0], [0, -27, 108], [0, -2, 132]], cx, cy, W, H, { azimuth: 62, elevation: 24 }, parent);
      g.innerHTML = `<g>${groundSvg(P)}</g><g data-part="foot"></g><g data-part="force"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const s = { k: o.k === "raft" ? "raft" : "pile", v: ISO.clamp(ISO.num(o, "load", 1), 0, 1) }, want = { v: s.v };
      let lit = o.lit || "";
      const sinkOf = () => s.v * (s.k === "raft" ? 1.0 : 0.3) * 4;        // 25 mm raft, 7 mm piles, ×40 (1 unit = 0.1 m)
      const draw = () => {
        const sink = sinkOf();
        w.rebuild(el.foot, s.k, () => footSvg(P, s.k));
        w.attr(el.foot, "transform", K.translateAlong(P, [0, 0, -sink]));
        w.rebuild(el.force, `${s.k} ${s.v.toFixed(2)}`, () => forceSvg(P, s.k, s.v, sink));
        w.rebuild(el.words, lab ? s.k : "", () => !lab ? "" : [
          ...LAYERS.map(([n, , z0, z1]) => M.label(P, [100, CUT, n === "topsoil" ? -2 : (z0 + z1) / 2 - 1.5], n, "#333", { anchor: "end", dy: n === "topsoil" ? 0 : 4 })),
          M.label(P, [0, -2, 132], "weight of the house", "#a3271b", { dy: -6 }),
          s.k === "raft" ? M.label(P, [-48, CUT, -10], "raft slab", "#444", { anchor: "end", dy: 4 }) : M.label(P, [-46, CUT, -36], "piles", "#444", { anchor: "end" })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.k !== undefined) s.k = p.k === "raft" ? "raft" : "pile";
        if (p.load !== undefined) want.v = ISO.clamp(+p.load, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.v = ISO.follow(s.v, want.v, dt, 0.5, ISO.still());
        if (Math.abs(s.v - want.v) < 0.004) s.v = want.v;
        draw();
        return s.v !== want.v;
      };
      g.readout = () => {
        if (s.v < 0.01) return s.k === "raft" ? "raft: a 0.6 m slab under the whole house · no load yet" : "8 piles, 0.3 m across, 6.6 m down to rock · no load yet";
        if (s.k === "raft") { const q = raftKPa(s.v); return `house ${Math.round(W_KN * s.v)} kN over ${AREA.toFixed(0)} m² + slab ${RAFT_T * 25} kPa = ${q.toFixed(0)} kPa on the clay (it can take about ${ALLOW} kPa) · settles about ${Math.round(25 * s.v)} mm`; }
        const [per, f, e] = pileSplit(s.v);
        return `house ${Math.round(W_KN * s.v)} kN on ${NP} piles = ${per.toFixed(0)} kN each: ${f.toFixed(0)} kN by friction up the shaft, ${e.toFixed(0)} kN bearing on the rock · settles about ${Math.round(7 * s.v)} mm`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
