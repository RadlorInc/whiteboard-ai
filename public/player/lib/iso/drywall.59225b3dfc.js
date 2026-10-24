// "drywall cx cy width k=hole|patch step=0..3 lab=1 lit=…" — a hole in a drywall panel, patched in three steps.
// The panel (½" gypsum board) is screwed to two studs at 16" centres and stands on the floor; the hole shows the
// board's cut core and the dark cavity behind. Steps: 1 press a 6" self-adhesive fibreglass mesh patch over the hole;
// 2 load the 6" putty knife from the mud pan and spread joint compound over the mesh, 5 cm past its edges; 3 sweep
// again with the knife held flatter, feathering the edges out to nothing so the patch disappears once sanded.
// k=patch shows the finished patch. Local helpers: knife (blade and handle at any spot), feathered rounded patches.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm.
  const DW = 1.27, PANEL = { x0: -30, x1: 30, z0: 0, z1: 54 }, HOLE = [-2, 30], MESH = 15.2, BLADE = 15.2;
  const HOLE_PTS = [[-4.2, 2.6], [-1.2, 4.1], [2.8, 3.5], [4.6, 0.4], [3.4, -3.2], [-0.4, -4.4], [-3.6, -3.0], [-4.9, -0.2]].map(([x, z]) => [HOLE[0] + x, HOLE[1] + z]);
  const PAN = { x: 18, y: 7, w: 22, d: 10 };
  const MUD = "#fbf8ef", MUD_INK = "#a39a82";
  const STEPS = [
    { title: "Mesh patch", say: "Press a self-adhesive mesh patch over the hole, sticky side to the wall, centred so it overlaps the hole on every side.", lit: "mesh" },
    { title: "Spread compound", say: "Load the putty knife with joint compound and spread a thin coat over the mesh, a little past its edges.", lit: "knife" },
    { title: "Feather the edges", say: "Hold the knife flatter and sweep out past the first coat so the edges thin to nothing. Let it dry, then sand smooth.", lit: "mud" },
  ];
  const zero = () => ({ mesh: 0, knife: [PAN.x + 12, PAN.y + 5, 7.5], tilt: 0, mud: 0, wide: 0, load: 0, label: "" });
  const lerp = (a, b, t) => (typeof a === "string" ? (t < 1 ? a : b) : typeof a === "number" ? a + (b - a) * t : Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t)) : Object.fromEntries(Object.keys(a).map((k) => [k, k in b ? lerp(a[k], b[k], t) : a[k]])));
  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  const onWall = (x, z) => [x, DW, z];
  // Each step: moves of { t, set, label }. `mud` is how far the first coat has been spread (0–1), `wide` the feathering.
  function movesOf(step) {
    const m = [], go = (t, set, label) => m.push({ t, set, label });
    if (step === 1) { go(1.2, { mesh: 0.5 }, "peel the backing · mesh patch 15 cm (6 in) square"); go(1.0, { mesh: 1 }, "pressed flat over the hole · 5 cm overlap on every side"); }
    if (step === 2) {
      go(0.7, { knife: [PAN.x + 12, PAN.y + 5, 9], load: 1 }, "load the knife from the mud pan");
      go(0.9, { knife: onWall(HOLE[0] - 16, HOLE[1]), tilt: 0 }, "knife at the left of the patch, held at about 45°");
      go(1.4, { knife: onWall(HOLE[0] + 16, HOLE[1]), mud: 1, load: 0.4 }, "one stroke across · compound pressed through the mesh");
    }
    if (step === 3) {
      go(0.6, { knife: onWall(HOLE[0] + 20, HOLE[1] + 4), tilt: 1 }, "knife flatter, at about 15°");
      go(1.3, { knife: onWall(HOLE[0] - 20, HOLE[1] + 4), wide: 0.6, load: 0.1 }, "sweep past the first coat");
      go(1.3, { knife: onWall(HOLE[0] + 20, HOLE[1] - 4), wide: 1, load: 0 }, "edges feathered to nothing · 30 cm across");
      go(0.8, { knife: [PAN.x + 12, PAN.y + 5, 7.5], tilt: 0 }, "let it dry (about 24 h), then sand smooth");
    }
    return m;
  }
  function poseAt(step, s0, t) {
    let s = { ...s0 }, clock = 0;
    for (const mv of movesOf(step)) {
      const end = { ...s, ...mv.set }, k = ease((t - clock) / mv.t);
      if (t >= clock) { s = k >= 1 ? end : lerp(s, end, k); s.label = mv.label; }
      clock += mv.t;
      if (t < clock) break;
    }
    return s;
  }
  const lengthOf = (step) => movesOf(step).reduce((a, m) => a + m.t, 0);
  const startOf = (step) => { let s = zero(); for (let i = 1; i < step; i++) s = poseAt(i, s, 1e9); return s; };

  function wallSvg(P, lab) {
    const out = [], at3 = (p) => K.iso(p, P);
    const floor = { x: -36, y: -10, w: 80, d: 32, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -3, 3, P)}"/>`, S(K.slabOf(floor, -3, 3, P, 3, 0.6), { tone: "lo" }));
    // Two studs behind the board, at 16" (40.6 cm) centres, on a bottom plate.
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-32, 32], [-8.9, 0], [0, 3.8], "mid") + ISO.wbox(P, [-22.2, -18.4], [-8.9, 0], [3.8, PANEL.z1], "mid") + ISO.wbox(P, [18.4, 22.2], [-8.9, 0], [3.8, PANEL.z1], "mid")));
    out.push(`<g data-name="board">${ISO.wbox(P, [PANEL.x0, PANEL.x1], [0, DW], [PANEL.z0, PANEL.z1], "mid")}</g>`);
    // Screws in rows over the studs.
    const screws = [];
    for (const x of [-20.3, 20.3]) for (const z of [8, 28, 48]) screws.push([x, DW, z]);
    out.push(L(screws.map((p) => K.sideRing(p, 0.55, "y", P, 12)).join(""), { tone: "lo" }), D(screws.map(at3), { size: 0.45 }));
    // The hole: its cut core (lighter) and the dark cavity behind, set back by the board's thickness.
    const back = HOLE_PTS.map(([x, z]) => at3([x, 0, z])), front = HOLE_PTS.map(([x, z]) => at3([x, DW, z]));
    out.push(`<g data-name="hole"><path d="${K.pathOf(front, true)}" fill="#cfc8b4" stroke="#6d6658" stroke-width="0.6"/>` +
      `<path d="${K.pathOf(back.map((p, i) => [p[0] * 0.55 + front[i][0] * 0.45, p[1] * 0.55 + front[i][1] * 0.45]), true)}" fill="#2f3337"/></g>`);
    // Mud pan on the floor with compound in it.
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [PAN.x, PAN.x + PAN.w], [PAN.y, PAN.y + PAN.d], [0, 7], "mid")));
    out.push(`<path d="${K.pathOf([[PAN.x + 0.6, PAN.y + 0.6], [PAN.x + PAN.w - 0.6, PAN.y + 0.6], [PAN.x + PAN.w - 0.6, PAN.y + PAN.d - 0.6], [PAN.x + 0.6, PAN.y + PAN.d - 0.6]].map(([x, y]) => at3([x, y, 7.02])), true)}" fill="${MUD}" stroke="${MUD_INK}" stroke-width="0.6"/>`);
    if (lab) {
      out.push(ISO.word(at3([PANEL.x0, DW, PANEL.z1 - 6]), "Drywall", "#444", { anchor: "end", size: 13 }));
      out.push(ISO.word(at3([PAN.x + PAN.w / 2, PAN.y + PAN.d, 0]), "Joint compound", "#444", { size: 12, dy: 16 }));
    }
    return out.join("");
  }
  // The mesh patch built in place; it arrives from the front (offset along y) and fades in.
  function meshSvg(P) {
    const h = MESH / 2, [cx, cz] = HOLE, y = DW + 0.05, at = (x, z) => K.iso([cx + x, y, cz + z], P);
    const grid = [];
    for (let k = -h + 1.2; k < h; k += 1.2) grid.push(K.pathOf([at(k, -h), at(k, h)]), K.pathOf([at(-h, k), at(h, k)]));
    return `<g data-name="mesh"><path d="${K.pathOf([at(-h, -h), at(h, -h), at(h, h), at(-h, h)], true)}" fill="#f6f4ea" fill-opacity=".55" stroke="#8d8a7c" stroke-width="0.6"/>` +
      `<path d="${grid.join("")}" stroke="#a8a493" stroke-width="0.35" fill="none"/></g>`;
  }
  // Compound on the wall: a coat as wide as the knife's sweep so far, feathered in rings that thin toward the edge.
  function mudSvg(P, mud, wide) {
    if (mud < 0.01) return "";
    const [cx, cz] = HOLE, y = DW + 0.1, x0 = -16, x1 = x0 + 32 * mud, half = BLADE / 2 + 2.4;
    const ring = (grow, op) => {
      const a = x0 - grow, b = x1 + grow, lo = -half - grow, hi = half + grow, r = 2 + grow * 0.8, n = 5, pts = [];
      for (const [qx, qz, a0] of [[b - r, hi - r, 0], [a + r, hi - r, Math.PI / 2], [a + r, lo + r, Math.PI], [b - r, lo + r, Math.PI * 1.5]])
        for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push(K.iso([cx + qx + Math.cos(t) * r, y, cz + qz + Math.sin(t) * r], P)); }
      return `<path d="${K.pathOf(pts, true)}" fill="${MUD}" opacity="${op.toFixed(2)}"/>`;
    };
    const out = [];
    // Feathering spreads the edge rings out (to 30 cm across) and makes the middle thinner, so the mesh shows less.
    for (let i = 4; i >= 1; i--) out.push(ring(i * (1 + 2.6 * wide), 0.16 + 0.08 * (4 - i)));
    out.push(ring(0, 0.7 + 0.25 * wide).replace('/>', ` stroke="${MUD_INK}" stroke-width="0.4" stroke-opacity="${(0.8 * (1 - wide)).toFixed(2)}"/>`));
    return `<g data-name="mud">${out.join("")}</g>`;
  }
  // The putty knife: blade edge on the wall at `at`, its face swung out from the wall by 45° (tilt 0) to 15° (tilt 1).
  function knifeSvg(P, at, tilt, load) {
    const ang = (45 - 30 * tilt) * Math.PI / 180, out = [];
    const dir = [Math.cos(ang), Math.sin(ang)];        // across the blade in x–y, from the edge toward the handle
    const pt = (u, v, w) => [at[0] + dir[0] * u - dir[1] * w, at[1] + dir[1] * u + dir[0] * w, at[2] + v];
    const blade = [];
    for (const w of [0, 0.15]) for (const [u, v] of [[0, -BLADE / 2], [0, BLADE / 2], [9, 2.6], [9, -2.6]]) blade.push(pt(u, v, w));
    out.push(ISO.tinted(ISO.T.steel, ISO.poly(blade, ISO.BOX_F, P, "hi")));
    if (load > 0.05) {
      const mud = [pt(0.2, -BLADE / 2 + 1, -0.05), pt(0.2, BLADE / 2 - 1, -0.05), pt(0.2 + 3 * load, BLADE / 2 - 2, -0.05), pt(0.2 + 3 * load, -BLADE / 2 + 2, -0.05)];
      out.push(`<path d="${K.pathOf(mud.map((p) => K.iso(p, P)), true)}" fill="${MUD}" stroke="${MUD_INK}" stroke-width="0.5"/>`);
    }
    const hd = [];
    for (const [u0, u1, r] of [[9, 10.6, 1.5], [10.6, 21, 1.8]]) for (const w of [-r * 0.6, r * 0.6]) for (const [u, v] of [[u0, -r], [u1, -r], [u1, r], [u0, r]]) hd.push(pt(u, v, w));
    out.push(ISO.poly(hd.slice(0, 8).map((_, i) => hd[i]), [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"));
    out.push(ISO.tinted(ISO.T.plastic, ISO.poly(hd.slice(8), [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")));
    return `<g data-name="knife">${out.join("")}</g>`;
  }

  ISO.add({
    name: "drywall", title: "Patch a drywall hole (3 steps)", compare: "drywall 480 270 400 k=patch", steps: STEPS,
    about: "A hole in a drywall panel on its studs, patched: self-adhesive mesh over the hole, joint compound spread with a putty knife, edges feathered out.",
    line: "drywall cx cy width k=hole|patch step=0..3 lab=1 lit=hole|mesh|knife|mud",
    demo: { line: "drywall 480 270 400", script: [{ set: { step: 0 }, hold: 1.2 }, ...[1, 2, 3].map((n) => ({ set: { step: n }, hold: "settle" }))] },
    make([cx, cy, width = 400], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.4, H = width * 1.0;
      const { P, g } = ISO.frame([[-36, -10, -3], [44, -10, -3], [-36, 22, -3], [44, 22, -3], [PANEL.x0, 0, PANEL.z1], [PANEL.x1, DW, PANEL.z1]], cx, cy, W, H, { azimuth: 68, elevation: 22 }, parent);
      g.innerHTML = `<g>${wallSvg(P, lab)}</g><g data-part="mesh">${meshSvg(P)}</g><g data-part="mud"></g><g data-part="knife"></g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer();
      if (lab) q("words").innerHTML = ISO.word(K.iso([HOLE[0] - MESH / 2 - 14, DW, HOLE[1]], P), "Hole", "#444", { anchor: "end", size: 13, dy: 4 });
      const cur = { step: 0, from: zero(), t: 1e9, label: "" };
      const n0 = o.k === "patch" ? 3 : ISO.clamp(Math.round(ISO.num(o, "step", 0)), 0, 3);
      if (n0) cur.from = poseAt(n0, startOf(n0), 1e9), cur.step = n0;
      let last = cur.from;
      const draw = (s) => {
        w.attr(q("mesh"), "opacity", s.mesh.toFixed(2)); w.shown(q("mesh"), s.mesh > 0.01);
        w.attr(q("mesh"), "transform", K.translateAlong(P, [0, 30 * (1 - Math.min(1, s.mesh * 2)), 0]));
        w.rebuild(q("mud"), `${s.mud.toFixed(3)} ${s.wide.toFixed(3)}`, () => mudSvg(P, s.mud, s.wide));
        w.rebuild(q("knife"), `${s.knife.map((v) => v.toFixed(2))} ${s.tilt.toFixed(3)} ${s.load.toFixed(2)}`, () => knifeSvg(P, s.knife, s.tilt, s.load));
        const want = STEPS[cur.step - 1]?.lit || o.lit || "";
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === want));
      };
      g.set = (p) => {
        if (p.step === undefined) return;
        cur.step = ISO.clamp(Math.round(+p.step), 0, 3); cur.from = startOf(Math.max(1, cur.step)); cur.t = cur.step ? 0 : 1e9;
        if (!cur.step) cur.from = zero();
      };
      g.update = (dt) => {
        cur.t += dt;
        const s = cur.step ? poseAt(cur.step, cur.from, ISO.still() ? 1e9 : cur.t) : cur.from;
        last = s; cur.label = s.label || "";
        draw(s);
        return cur.step > 0 && cur.t < lengthOf(cur.step) + 0.2;
      };
      g.readout = () => cur.label || (last.wide > 0.99 ? "patched · feathered to nothing 30 cm across · sand when dry" : "hole about 9 cm across in ½ in (12.7 mm) drywall, between studs 16 in apart");
      g.update(0);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
