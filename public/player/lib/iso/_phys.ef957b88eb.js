// Shared physics-bench pieces for the batch-3 parts (coilspring, massset, forcemeter). Not a recipe: it only defines
// window.PHYS. World units are millimetres, z up (the parts draw with Pm = ISO.mm(P)). The helix split (back half /
// front half for painter's order), the slotted masses and the hanger are hooke.js's, made real size: 100 g brass
// slotted masses Ø 40 × 9 mm with a 6 mm slot toward +x, on a hanger (Ø 40 base disc, Ø 5 rod, a bent hook on top).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const PHYS = (window.PHYS = {});
  const MR = 20, MT = 9, SLOT = 3, BASE = 4, ROD = 2.5, ROD_H = BASE + 6 * MT + 12, HOOK = 7;
  PHYS.MASS = { r: MR, t: MT, base: BASE };
  // the hanger's height from its base's underside to the inside of its hook's crown (where it hangs from a loop)
  PHYS.HANG = ROD_H + 2 * HOOK - ROD;

  // the horizontal direction toward the viewer, as an angle round z (front/back splits, stamps that face us)
  const viewAngle = (P) => { const d0 = K.depthOf([0, 0, 0], P); return Math.atan2(K.depthOf([0, 1, 0], P) - d0, K.depthOf([1, 0, 0], P) - d0); };
  PHYS.viewAngle = viewAngle;

  // a round steel wire along world points: dark edge, steel body, a thin light streak (plain strokes, no texture)
  PHYS.wire = (P, d, r, { ink = "#3c4148", body = "#a4a8ae", shine = "#eef0f2" } = {}) => {
    const w = K.screenRise(1, P) * r * 2;
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${body}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      (w > 1.6 ? `<path d="${d}" fill="none" stroke="${shine}" stroke-width="${(w * 0.28).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>` : "");
  };
  PHYS.path = (P, pts) => K.pathOf(pts.map((p) => K.iso(p, P)));

  // A vertical helix about (x, y) from zTop down to zBot, split into the runs behind its axis and in front of it.
  // `per` points per turn, starting at angle `phase`; the split depends only on the angle, so a stretched coil splits at the same places.
  PHYS.helix = (P, x, y, zTop, zBot, r, turns, per = 20, phase = 0) => {
    const back = [], front = [], n = Math.max(2, Math.round(turns * per)), va = viewAngle(P);
    let run = [], side = null;
    for (let i = 0; i <= n; i++) {
      const a = phase + (i / n) * turns * Math.PI * 2, q = K.iso([x + Math.cos(a) * r, y + Math.sin(a) * r, zTop + (zBot - zTop) * (i / n)], P);
      const s = Math.cos(a - va) >= 0 ? "f" : "b";
      if (side && s !== side) { (side === "f" ? front : back).push(K.pathOf([...run, q])); run = []; }
      side = s; run.push(q);
    }
    (side === "f" ? front : back).push(K.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  };

  // ── a slotted-mass hanger standing at o = [x, y, z] (its base's underside), with n 100 g masses on it.
  // Returns the pieces in painter's order so a part can name them: base (hanger), masses, rod and hook (hanger).
  PHYS.hanger = (P, [x, y, z], n, { stamp = true } = {}) => {
    const va = viewAngle(P), sx = Math.sqrt(MR * MR - SLOT * SLOT), at = (dx, dy, dz) => K.iso([x + dx, y + dy, z + dz], P);
    const base = ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, MR, z, BASE, P, 48, 0.5), { tone: "mid" }) + S(K.cylinder(x, y, ROD + 1.6, z + BASE, 1.2, P, 20, 0.3), { tone: "mid" }));
    const masses = [];
    for (let i = 0; i < n; i++) {
      const z0 = z + BASE + i * MT, z1 = z0 + MT - 0.3, top = i === n - 1;
      const m = [S(K.cylinder(x, y, MR, z0, MT - 0.3, P, 48, 0.6), { tone: "mid" })];
      // the slot's mouth on the near side (+x faces us) and, on the top mass, the slot across its top face
      m.push(`<path d="${K.pathOf([at(sx, -SLOT, z0 - z + 0.4), at(sx, SLOT, z0 - z + 0.4), at(sx, SLOT, z1 - z - 0.3), at(sx, -SLOT, z1 - z - 0.3)], true)}" fill="#5c4512" fill-opacity=".9"/>`);
      if (top) {
        const pts = [at(sx, -SLOT, z1 - z)];
        for (let j = 0; j <= 12; j++) { const a = -Math.PI / 2 - (j / 12) * Math.PI; pts.push(at(Math.cos(a) * SLOT, Math.sin(a) * SLOT, z1 - z)); }
        pts.push(at(sx, SLOT, z1 - z));
        m.push(`<path d="${K.pathOf(pts, true)}" fill="#5c4512" fill-opacity=".9"/>`);
        if (stamp) m.push(window.LAB.faceText(P, [x + Math.cos(va + 1.75) * 11, y + Math.sin(va + 1.75) * 11, z1 + 0.05], [Math.cos(va - Math.PI / 2), Math.sin(va - Math.PI / 2), 0], "100 g", 4.2, "#6b5114", [-Math.cos(va), -Math.sin(va), 0]));
      }
      // "100 g" stamped on every mass's rim, turned a little away from the slot
      if (stamp) { const a = va + 0.55, p = [x + Math.cos(a) * (MR + 0.1), y + Math.sin(a) * (MR + 0.1), z0 + MT * 0.33]; m.push(window.LAB.faceText(P, p, [Math.sin(a), -Math.cos(a), 0], "100 g", 3.4, "#7a5c1a")); }
      masses.push(ISO.tinted(ISO.T.brass, m.join("")));
    }
    // the rod from the stack's top to the hook, then the hook: a near-full loop in the x–z plane, its crown over the rod
    const zs = z + BASE + n * MT, zr = z + ROD_H, hook = [];
    for (let j = 0; j <= 28; j++) { const t = (j / 28) * Math.PI * 1.32; hook.push([x + Math.sin(t) * HOOK, y, zr + HOOK - Math.cos(t) * HOOK]); }
    const rod = ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, ROD, zs, zr - zs, P, 16), { tone: "mid", crease: "none" })) + PHYS.wire(P, PHYS.path(P, hook), ROD);
    return { base, masses: masses.join(""), rod, crown: zr + 2 * HOOK - ROD };
  };

  // A damped spring toward a rest point: x and v in metres, ω in rad/s, ζ the damping ratio (a small real bounce).
  // Sub-stepped so a stiff spring stays stable at 30 fps. Returns true while it still moves.
  PHYS.bounce = (s, rest, dt, w, zeta) => {
    if (ISO.still() || !(w > 0)) { s.x = ISO.follow(s.x, rest, dt, 0.25, ISO.still()); s.v = 0; }
    else { const n = Math.min(40, Math.max(8, Math.ceil(dt * w * 4))), h = dt / n; for (let i = 0; i < n; i++) { s.v += (-(w * w) * (s.x - rest) - 2 * zeta * w * s.v) * h; s.x += s.v * h; } }
    const moving = Math.abs(s.x - rest) > 2e-4 || Math.abs(s.v) > 2e-3;
    if (!moving) { s.x = rest; s.v = 0; }
    return moving;
  };
})();
