// "insulation cx cy width labels=1 ins=0..1" — a cavity wall as a museum section model. On a walnut plinth stands a
// piece of house wall cut through: the room's floor and a radiator on the warm side, then plaster, the inner leaf of
// concrete blocks, the cavity with its steel wall ties, the outer leaf of brick (stretcher bond on its outside face)
// and the garden on the cold side, all on a concrete footing. Mineral-wool board fills the cavity as ins goes 0 → 1
// (0 → 100 mm), leaving a 50 mm air gap at full fill. Heat flows through as orange dashes and arrows that thin out,
// a temperature line falls across each layer, and the readout gives the U-value from the summed resistances
// R = d/λ (+0.13 inside, +0.04 outside surface) and the heat lost per square metre at 20 °C inside, 0 °C outside.
// World units: 1 cm.
(() => {
  const K = window.K, M = window.MODEL, S = M.S;
  const Y0 = -32, CUT = 0, TOP = 60, BOT = -14;
  // the wall's layers are drawn 1.8× their true thickness across (a section model's usual stretch), heights true
  const XS = 1.8, X = { pl: 0, bl: 1.3 * XS, cav: 11.3 * XS, br: 26.3 * XS, out: 36.5 * XS }, GX = X.out + 46;
  const LAYERS = [["plaster", 0.013, 0.57], ["block", 0.1, 0.51], ["insulation", 0, 0.035], ["cavity", 0, 0], ["brick", 0.102, 0.77]];
  const PLINTH = { x: -48, y: -42, w: 36.5 * 1.8 + 96, d: 56, r: 4 };
  const f1 = (v) => v.toFixed(1);
  // the wall's resistances for insulation thickness t (m): the air gap keeps R 0.18 while it is 25 mm or more
  const resist = (t) => { const gap = 0.15 - t; return [0.13, 0.013 / 0.57, 0.1 / 0.51, t / 0.035, gap >= 0.025 ? 0.18 : 0.18 * gap / 0.025, 0.102 / 0.77, 0.04]; };
  const face = (P, pts, fill, ink, w = 0.7) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, CUT + 0.06, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const strokes = (P, segs, color, w, y = CUT + 0.08) => `<path d="${segs.map(([a, b]) => K.pathOf([K.iso([a[0], y, a[1]], P), K.iso([b[0], y, b[1]], P)])).join("")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

  // audit.mjs notes: the radiator hangs on the plaster, its pipe and the shrub stand on prismY sections, which the
  // audit doesn't record (loose); the shrub's trunk runs into its crown (MODEL.tree, sunk on purpose).
  function staticSvg(P) {
    const out = [M.plinth(P, PLINTH, { z: BOT })];
    // the room's floor (slab, screed, boards), the footing under the wall, the garden soil
    out.push(M.sec(P, M.rect(-42, -2, BOT, -2), Y0, CUT, "concrete", M.grains(P, M.rect(-42, -2, BOT, -2), CUT, 20, "#9a978e", 0.5, 4)));
    out.push(M.sec(P, M.rect(-42, X.pl, -2, 2), Y0, CUT, "sand"), M.sec(P, M.rect(-42, X.pl, 2, 4), Y0, CUT, [ "#b88a4e", "#e2c398", "#e9d0ad", "#7a5a2e"]));
    out.push(M.sec(P, M.rect(-2, X.out + 4, BOT, 0), Y0, CUT, "concrete", M.grains(P, M.rect(-2, X.out + 4, BOT, 0), CUT, 16, "#9a978e", 0.5, 6)));
    out.push(M.sec(P, [[X.out + 4, BOT], [GX, BOT], [GX, 1], [X.out + 4, 0]], Y0, CUT, "soil", M.grains(P, [[X.out + 4, BOT], [GX, BOT], [GX, 1], [X.out + 4, 0]], CUT, 30, "#8a6a45", 0.5, 9)));
    out.push(M.sec(P, [[X.out, 0], [GX, 1], [GX, 2.2], [X.out, 1.4]], Y0, CUT, "grass"));
    // the radiator hangs on the room side, behind the cut, so the wall's section hides most of it
    out.push(radiatorSvg(P));
    // plaster, the block leaf with its bed joints, the brick leaf with its courses
    out.push(M.named("plaster", M.sec(P, M.rect(X.pl, X.bl, 4, TOP), Y0, CUT, "plaster")));
    const block = M.rect(X.bl, X.cav, 0, TOP);
    out.push(M.named("block", M.sec(P, block, Y0, CUT, "concrete", M.grains(P, block, CUT, 40, "#8f8d86", 0.45, 2) +
      strokes(P, [21.5, 43].map((z) => [[X.bl, z], [X.cav, z]]), "#fdfdfb", 0.9))));
    return out.join("");
  }
  // the brick leaf and the garden's shrub, drawn after the cavity they stand in front of
  function frontSvg(P) {
    const out = [];
    const brick = M.rect(X.br, X.out, 0, TOP);
    const courses = Array.from({ length: 7 }, (_, i) => 7.5 * (i + 1));
    out.push(M.named("brick", M.sec(P, brick, Y0, CUT, "brick", strokes(P, courses.map((z) => [[X.br, z], [X.out, z]]), "#f2e6cf", 0.9))));
    // stretcher bond on the outside face (the plane x = 36.5): courses edge to edge, perpends between them
    const k = K.cameraOf(P).k, xo = X.out + 0.05, d = [];
    for (const z of courses) d.push(K.pathOf([K.iso([xo, Y0, z], P), K.iso([xo, CUT, z], P)]));
    for (let i = 0; i <= courses.length; i++) { const z0 = i * 7.5, z1 = Math.min(TOP, z0 + 7.5); for (let y = Y0 + (i % 2 ? 11.25 : 0) + 22.5; y < CUT - 0.5; y += 22.5) d.push(K.pathOf([K.iso([xo, y, z0], P), K.iso([xo, y, z1], P)])); }
    out.push(`<path d="${d.join("")}" fill="none" stroke="#f2e6cf" stroke-width="${f1(0.35 * k)}"/>`);
    out.push(M.tree(P, X.out + 26, -20, 1.6, 2));
    return out.join("");
  }
  function radiatorSvg(P) {
    const out = [];
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [-7, -3], [-28, -8], [10, 34], "hi")));
    for (let y = -26; y <= -10; y += 2.75) out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [-7.8, -7], [y - 0.5, y + 0.5], [11, 33], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(-5, -9, 0.7, 4, 6, P, 12), { tone: "hi" }) + ISO.wbox(P, [-6, -4], [-8.6, -6.6], [9.4, 10.6], "mid")));
    return out.join("");
  }
  // the cavity: the wool board (thickness t cm from the block's face), its texture, and the ties across it
  function cavitySvg(P, t) {
    const out = [M.named("cavity", M.sec(P, M.rect(X.cav, X.br, 0, 1.2), Y0, CUT, "concrete"))];
    if (t > 0.05) {
      const tw = t * XS, board = M.rect(X.cav, X.cav + tw, 1.2, TOP);
      const zig = [];
      for (let z = 4; z < TOP - 3; z += 4.5) zig.push(`M${[0, 0.25, 0.5, 0.75, 1].map((f, i) => { const p = K.iso([X.cav + 0.3 + f * (tw - 0.6), CUT + 0.08, z + (i % 2 ? 1.2 : 0)], P); return `${f1(p[0])} ${f1(p[1])}`; }).join("L")}`);
      out.push(M.named("insulation", M.sec(P, board, Y0, CUT, "pink", t > 0.8 ? `<path d="${zig.join("")}" fill="none" stroke="#c0607a" stroke-width=".7" stroke-linejoin="round"/>` : "")));
    }
    return out.join("");
  }
  function tiesSvg(P) {
    const out = [];
    // ties: stainless wires across the cavity every 45 cm up, with a drip kink in the middle so water can't cross
    const ties = [15, 37.5].map((z) => { const m = (X.cav + X.br) / 2; return [[X.cav - 4, z], [m - 1.2, z], [m, z - 1.6], [m + 1.2, z], [X.br + 4, z]]; });
    out.push(M.named("ties", ties.map((pts) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, CUT + 0.1, z], P)))}" fill="none" stroke="#3c3f45" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, CUT + 0.1, z], P)))}" fill="none" stroke="#d0d2d6" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`).join("")));
    return out.join("");
  }
  // the temperature line across the section, the heat arrows, words: all from the same resistances
  function heatSvg(P, t, lab) {
    const R = resist(t / 100), Rt = R.reduce((a, b) => a + b, 0), q = 20 / Rt, zT = (T) => 26 + 1.5 * T;
    const xs = [X.pl, X.bl, X.cav, X.cav + t * XS, X.br, X.out];
    let T = 20 - q * R[0];
    const pts = [[-40, 20], [X.pl, T]];
    for (let i = 1; i < 6; i++) { T -= q * R[i]; pts.push([xs[i], T]); }
    pts.push([GX - 4, 0]);
    const line = pts.map(([x, Tv]) => K.iso([x, CUT + 0.12, zT(Tv)], P)), k = K.cameraOf(P).k;
    const out = [`<path d="${K.pathOf(line)}" fill="none" stroke="#fdfdfb" stroke-width="${f1(2.2 * k)}" stroke-linejoin="round"/><path d="${K.pathOf(line)}" fill="none" stroke="#a3271b" stroke-width="${f1(0.9 * k)}" stroke-linejoin="round"/>`,
      `<g fill="#a3271b">${line.slice(1, -1).map((p) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(0.9 * k)}"/>`).join("")}</g>`];
    const qn = q / 28.5;                                       // 1 = the bare cavity wall
    out.push(M.arrow(P, [-40, CUT + 0.12, 14], [-10, CUT + 0.12, 14], { color: "#e0552b", w: 1 + 4 * qn, head: 4 + 3 * qn }));
    out.push(M.arrow(P, [X.out + 2, CUT + 0.12, 14], [X.out + 8 + 26 * qn, CUT + 0.12, 14], { color: "#e0552b", w: 0.8 + 4 * qn, head: 3 + 3 * qn }));
    if (lab) out.push(M.label(P, [-22, CUT, zT(20) + 7], "warm inside 20 °C", "#a3271b"), M.label(P, [X.out + 28, CUT, zT(0) + 7], "cold outside 0 °C", "#1f4f8f"),
      M.label(P, [-24, CUT, 21], `${q.toFixed(0)} W/m² lost`, "#b5541a", { size: 12 }), M.label(P, [X.pl, CUT, TOP + 3], "plaster", "#555", { size: 11 }),
      M.label(P, [(X.bl + X.cav) / 2, CUT, TOP + 9], "block", "#555", { size: 11 }), M.label(P, [(X.cav + X.br) / 2, CUT, TOP + 3], t > 1 ? "insulation" : "cavity", t > 1 ? "#a0506a" : "#555", { size: 11 }),
      M.label(P, [(X.br + X.out) / 2, CUT, TOP + 9], "brick", "#6a2a18", { size: 11 }));
    return { svg: out.join(""), q, Rt };
  }

  ISO.add({
    name: "insulation", title: "Insulated cavity wall", compare: "insulation 480 270 460",
    about: "A section model of a cavity wall: plaster, block, cavity with wall ties, brick; mineral wool fills the cavity and the heat flow through the wall and its U-value drop.",
    line: "insulation cx cy width labels=1 ins=0..1 lit=plaster|block|insulation|cavity|ties|brick",
    demo: { line: "insulation 480 285 460 ins=0", script: [{ set: { ins: 1 }, hold: "settle" }, { set: {}, hold: 1.5 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.15, H = size * 0.78;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, BOT - 13, BOT), [-42, Y0, TOP + 12], [GX, CUT, TOP + 12]], cx, cy, W, H, { azimuth: 72, elevation: 22 }, parent);
      g.innerHTML = `<g>${staticSvg(P)}</g><g data-part="cavity"></g><g>${frontSvg(P)}${tiesSvg(P)}</g><g data-part="flow"></g><g data-part="heat"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const s = { ins: ISO.clamp(ISO.num(o, "ins", 1), 0, 1), ph: 0, q: 0 };
      let want = s.ins, lit = o.lit || "";
      const memo = new Map();
      const draw = () => {
        const tq = Math.round(s.ins * 40) / 4;                 // board thickness in 2.5 mm steps
        if (!memo.has(tq)) memo.set(tq, { cav: cavitySvg(P, tq), heat: heatSvg(P, tq, lab) });
        const m = memo.get(tq);
        s.q = m.heat.q;
        w.rebuild(el.cavity, tq, () => m.cav);
        w.rebuild(el.heat, tq, () => m.heat.svg);
        const amount = Math.min(1, s.q / 28.5), fk = `${(Math.round(s.ph * 2) / 2 % 12).toFixed(1)} ${tq}`;
        w.rebuild(el.flow, fk, () => [20, 46].map((z) => M.flow(P, [[-12, CUT + 0.14, z], [X.out + 6, CUT + 0.14, z]], s.ph, { gap: 12, dash: 4, color: "#e0552b", w: 0.5 + 1.1 * amount, amount: 0.35 + 0.65 * amount })).join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.ins !== undefined) want = ISO.clamp(+p.ins, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      // the board grows at 25 mm a second; the heat keeps flowing, at a speed set by how much gets through
      g.update = (dt) => {
        const calm = ISO.still(), d = want - s.ins;
        s.ins = calm || Math.abs(d) < 1e-3 ? want : s.ins + Math.sign(d) * Math.min(Math.abs(d), dt * 0.25);
        if (!calm) s.ph += dt * (4 + 14 * Math.min(1, s.q / 28.5));
        draw();
        return s.ins !== want;
      };
      g.readout = () => {
        const tq = Math.round(s.ins * 40) / 4, R = resist(tq / 100), Rt = R.reduce((a, b) => a + b, 0);
        return `insulation ${(tq * 10).toFixed(0)} mm (λ 0.035) · R = 0.13 + plaster ${R[1].toFixed(2)} + block ${R[2].toFixed(2)} + wool ${R[3].toFixed(2)} + air ${R[4].toFixed(2)} + brick ${R[5].toFixed(2)} + 0.04 = ${Rt.toFixed(2)} m²K/W · U = 1/R = ${(1 / Rt).toFixed(2)} W/m²K · at 20 °C difference ${(20 / Rt).toFixed(0)} W lost per m²`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
