// "airfilter cx cy width k=clean|dirty open=0-3 lab=1 lit=filter" — checking the engine air filter.
// A black plastic airbox on rubber mounts: the lower housing with its intake snorkel, the lid with stiffening ribs and
// the outlet duct to the engine (a corrugated hose on a clamp), held shut by three spring clips. Inside sits a pleated
// paper panel filter in a soft rubber frame. set({ open }) runs the check: 1 springs the clips open, 2 lifts the lid,
// 3 lifts the filter out and lays it in front. k=dirty greys the paper with dust; the readout says whether to fit a new
// one (most cars: every 15,000–30,000 km, sooner on dusty roads). World units are millimetres ÷ 2.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOX = { x: -80, y: -55, w: 160, d: 110, r: 8 }, LID = { x: -83, y: -58, w: 166, d: 116, r: 9 }, RIM = 36, LID_H = 18;
  const FILT = { x: -70, y: -46, w: 140, d: 92 }, PLEATS = 22, PLEAT_H = 14, SEAL = 2.5;
  const CLIPS = [-50, 0, 50], HINGE_Z = 24, CLIP_L = 19;
  const BOARD = { x: -150, y: -80, w: 300, d: 230, r: 8 };
  const LID_UP = [0, -40, 44], FILTER_OUT = [0, 128, -RIM + 4];       // where the lid and the filter go
  const BLACK = ISO.T.plastic, SEALC = ISO.tint("#6d7177", ["#3a3d42", "#44474c", "#4f5257", "#5a5d62"], "#1a1b1e");
  const PAPER = { clean: [["#cdb36b", "#f6e7b9"], "#f1e0ac", "#8a7232"], dirty: [["#6f665a", "#a99f8e"], "#9d9483", "#4a4338"] };

  function housingSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD, { h: 6 })];
    // rubber mounts, the lower housing, its open top with the dark plenum inside, and the intake snorkel
    for (const [x, y] of K.corners(BOX, 14)) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 6, 0, 5, P, 20), { tone: "hi" })));
    const box = [S(K.slabOf(BOX, 5, RIM - 5, P, 8, 0.6), { tone: "hi", inner: L(K.sideSeam(BOX, 12, P, 8), { tone: "faint" }) })];
    box.push(`<path d="${K.pathOf(K.ringOf(K.insetPlan(BOX, 5), 6).map(([x, y]) => K.iso([x, y, RIM], P)), true)}" fill="#1c1e22"/>`, L(K.planOutline(K.insetPlan(BOX, 5), RIM, P, 6), { tone: "lo" }));
    box.push(`<path d="${K.pathOf(K.ringOf({ x: -30, y: -20, w: 60, d: 40, r: 12 }, 6).map(([x, y]) => K.iso([x, y, RIM - 0.1], P)), true)}" fill="#0c0d0f"/>`);
    box.push(S(K.slabOf({ x: BOX.x - 46, y: -22, w: 48, d: 44, r: 6 }, 8, 24, P, 6, 0.6), { tone: "hi", inner: L(K.sideSeam({ x: BOX.x - 46, y: -22, w: 48, d: 44, r: 6 }, 20, P, 6), { tone: "faint" }) }));
    box.push(`<path d="${K.pathOf([[BOX.x - 46, -16, 12], [BOX.x - 46, 16, 12], [BOX.x - 46, 16, 28], [BOX.x - 46, -16, 28]].map((p) => K.iso(p, P)), true)}" fill="#0c0d0f"/>`);
    // hinge blocks for the clips on the front face
    for (const x of CLIPS) box.push(S(K.slabOf({ x: x - 6, y: BOX.y + BOX.d - 0.5, w: 12, d: 4, r: 1 }, HINGE_Z - 3, 6, P, 2), { tone: "hi" }));
    out.push(`<g data-name="housing">${ISO.tinted(BLACK, box.join(""))}</g>`);
    if (lab) out.push(ISO.word(K.iso([BOX.x - 46, 22, 8], P), "Air in", "#555", { anchor: "end", dy: 10, size: 15 }));
    return out.join("");
  }
  // One clip: a lever on a hinge at the housing, its hook over the lid's lip; open swings it out by `a`.
  function clipSvg(P, x, a) {
    const y0 = BOX.y + BOX.d + 3.5, at = (u, w, v) => [x + u, y0 + w * Math.sin(a) + v * Math.cos(a), HINGE_Z + w * Math.cos(a) - v * Math.sin(a)];
    return ISO.tinted(ISO.T.steel, ISO.box(at, P, [-5.5, 5.5], [-1, CLIP_L], [0, 1.4], "hi") + ISO.box(at, P, [-5.5, 5.5], [CLIP_L - 2, CLIP_L], [-4.5, 0], "hi") + ISO.box(at, P, [-3, 3], [3, 8], [1.4, 2.6], "hi") +
      S(G.disc(-6.5, 6.5, 1.8, G.frameOf([x, y0 + 0.6, HINGE_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" }));
  }
  function lidSvg(P, lab) {
    const out = [S(K.slabOf(LID, RIM, LID_H, P, 9, 1), { tone: "hi", inner: L(K.sideSeam(LID, RIM + 6, P, 9), { tone: "faint" }) })];
    // stiffening ribs on top, running edge to edge of a raised panel
    const panel = { x: -64, y: -40, w: 96, d: 80, r: 4 };
    out.push(S(K.slabOf(panel, RIM + LID_H, 1.6, P, 4, 0.4), { tone: "hi" }));
    const ribs = [];
    for (let x = panel.x + 12; x < panel.x + panel.w - 6; x += 12) ribs.push(K.lineOnTop([x, panel.y], [x, panel.y + panel.d], RIM + LID_H + 1.6, P));
    out.push(L(ribs.join(""), { tone: "lo" }));
    // the outlet: a boss on the lid, the corrugated hose to the engine, its clamp
    const F = G.frameOf([LID.x + LID.w, 6, RIM + 10], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(S(G.disc(-8, 8, 15, F, P), { tone: "hi" }), S(G.disc(8, 54, 13, F, P), { tone: "hi" }));
    const rings = [];
    for (let s = 16; s <= 50; s += 3) rings.push(G.arcOf(F, s, 13, P));
    out.push(L(rings.join(""), { tone: "lo" }), ISO.tinted(ISO.T.steel, S(G.ringBand(9.5, 13, 13, 14.6, F, P), { tone: "hi" })));
    out.push(S(G.disc(54, 58, 15, F, P), { tone: "hi" }));
    out.push(D([K.iso([LID.x + 4, LID.y + LID.d - 4, RIM + LID_H], P), K.iso([LID.x + LID.w - 4, LID.y + LID.d - 4, RIM + LID_H], P)], { size: 0.6 }));
    let svg = ISO.tinted(BLACK, out.join(""));
    if (lab) svg += ISO.word(K.iso(G.pointOf(F, 58, 0, 0), P), "To engine", "#555", { anchor: "start", dy: -22, size: 15 });
    return `<g data-name="lid">${svg}</g>`;
  }
  // The panel filter: a rubber frame and a pleat pack (a zigzag along x, ridges along y), with dust when dirty.
  function filterSvg(P, k) {
    const [shade, face, ink] = PAPER[k], z0 = RIM - 2, zt = z0 + PLEAT_H, pts = [[FILT.x + SEAL, z0]];
    const step = (FILT.w - 2 * SEAL) / PLEATS;
    for (let i = 0; i <= PLEATS; i++) pts.push([FILT.x + SEAL + i * step, i % 2 ? z0 + 1.5 : zt]);
    pts.push([FILT.x + FILT.w - SEAL, z0]);
    const out = [ISO.tinted(SEALC, ISO.wbox(P, [FILT.x - 2, FILT.x + FILT.w + 2], [FILT.y - 2, FILT.y + FILT.d + 2], [RIM - 0.5, RIM + 2.5], "hi"))];
    out.push(ISO.prismY(P, pts, FILT.y + SEAL, FILT.y + FILT.d - SEAL, shade, face, ink));
    if (k === "dirty") {
      const dots = [];
      for (let i = 0; i < 70; i++) {
        const x = FILT.x + 6 + ((i * 37) % 128), y = FILT.y + 6 + ((i * 53) % 80);
        dots.push(K.iso([x, y, zt - ((Math.round((x - FILT.x - SEAL) / step) % 2) ? 12 : 0) + 0.2], P));
      }
      out.push(D(dots, { size: 1.1, tone: "lo" }));
    }
    return out.join("");
  }

  ISO.add({
    name: "airfilter", title: "Engine air filter", compare: "airfilter 480 270 360",
    about: "Airbox with its lid held by three spring clips: open the clips, lift the lid and take out the pleated filter to see if it is clean or full of dust.",
    line: "airfilter cx cy width k=clean|dirty open=0-3 lab=1 lit=filter|clips|lid|housing",
    demo: { line: "airfilter 480 270 360 k=dirty", script: [{ set: { open: 1, lit: "clips" }, hold: "settle" }, { set: { open: 2, lit: "lid" }, hold: "settle" }, { set: { open: 3, lit: "filter" }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", kind = o.k === "dirty" ? "dirty" : "clean";
      const W = size * 2.05, H = size * 1.18;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), ...K.boxCorners(LID, 0, RIM + LID_H + 2).map(([x, y, z]) => [x + LID_UP[0], y + LID_UP[1], z + LID_UP[2]]), [LID.x + LID.w + 60, 6, RIM + 26]], cx, cy, W, H, { azimuth: 56, elevation: 30 }, parent);
      g.innerHTML = `<g>${housingSvg(P, lab)}</g><g data-name="filter"><g data-part="filter">${filterSvg(P, kind)}</g></g><g data-part="lid">${lidSvg(P, lab)}</g><g data-name="clips">${CLIPS.map(() => "<g></g>").join("")}</g>`;
      const q = (s) => g.querySelector(`[data-part="${s}"]`), lid = q("lid"), filter = q("filter"), clips = [...g.querySelector('[data-name="clips"]').children], w = ISO.writer();
      // clips 0..1 (shut → swung out 110°), lid 0..1 (on → up and back), out 0..1 (filter in → laid in front)
      const goal = (n) => ({ clips: n >= 1 ? 1 : 0, lid: n >= 2 ? 1 : 0, out: n >= 3 ? 1 : 0 });
      const s = goal(ISO.clamp(Math.round(ISO.num(o, "open", 0)), 0, 3));
      let want = { ...s }, lit = o.lit || "filter";
      const draw = () => {
        clips.forEach((c, i) => w.rebuild(c, s.clips.toFixed(3), () => clipSvg(P, CLIPS[i], s.clips * 1.92)));
        const e = ISO.ease(s.lid), lift = Math.sin(Math.PI * Math.min(1, e * 1.5)) * 10;
        w.attr(lid, "transform", K.translateAlong(P, [LID_UP[0] * e, LID_UP[1] * e, LID_UP[2] * e + lift]));
        const f = ISO.ease(s.out), up = Math.sin(Math.PI * f) * 46;
        w.attr(filter, "transform", K.translateAlong(P, [FILTER_OUT[0] * f, FILTER_OUT[1] * f, FILTER_OUT[2] * f + up]));
        // the lid and clips are drawn over the filter until it comes forward past them
        const fg = filter.parentNode;
        if (s.out > 0.5 && g.lastElementChild !== fg) g.append(fg);
        if (s.out <= 0.5 && fg.nextSibling !== lid) g.insertBefore(fg, lid);
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.open !== undefined) want = goal(ISO.clamp(Math.round(+p.open), 0, 3));
        if (p.lit) lit = p.lit;
      };
      // one thing at a time: clips before the lid, the lid before the filter (and the other way when closing)
      g.update = (dt) => {
        const order = want.out < s.out || want.lid < s.lid || want.clips < s.clips ? ["out", "lid", "clips"] : ["clips", "lid", "out"];
        for (const key of order) {
          if (s[key] === want[key]) continue;
          const step = dt / (key === "clips" ? 0.6 : 1.1);
          s[key] = ISO.still() || Math.abs(want[key] - s[key]) <= step ? want[key] : s[key] + Math.sign(want[key] - s[key]) * step;
          break;
        }
        draw();
        return ["clips", "lid", "out"].some((k2) => s[k2] !== want[k2]);
      };
      g.readout = () => {
        if (s.out >= 1) return kind === "dirty" ? "filter out · grey with dust · fit a new one (every 15,000–30,000 km)" : "filter out · paper still clean · tap it and refit";
        if (s.lid >= 1) return "lid lifted · filter sits in its rubber frame";
        if (s.clips >= 1) return "3 clips open · lid free";
        return "airbox shut · 3 spring clips";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
