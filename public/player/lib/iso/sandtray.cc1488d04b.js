// "sandtray cx cy k lab=0 lit=tray|sand" — a PART (PARTS.md, batch 5): the tray of sand under a fall line (freefall),
// its origin the bench point under its middle. A pressed galvanised-steel tray 20 × 15 × 4 cm: rounded corners, a
// rolled rim, a stiffening bead pressed round its walls, four little rubber feet, and dry sand 3 cm deep inside with
// its grains and the shallow crater where a ball last landed (a falling ball stops dead in it, no bounce). Static.
// Built in mm (the lab helpers' units); anchors in cm: `sand` = the sand's surface at the middle, `rim` = the rim's
// top at the middle of the near edge.
(() => {
  const K = window.K;
  const W = 200, D = 150, H = 40, R = 9, SAND = 30, T = 1.2;
  const PLAN = { x: -W / 2, y: -D / 2, w: W, d: D, r: R }, IN = K.insetPlan(PLAN, T);
  const ZINC = ISO.tint("#e3e7ea", ["#9ea6ae", "#b1b8bf", "#c3c9ce", "#d3d8dc"], "#4b545c");
  let n = 0;

  ISO.add({
    name: "sandtray", title: "Sand tray (part)", compare: null,
    about: "A steel tray of dry sand 20 × 15 × 4 cm that sits under a fall line to catch a dropped ball without a bounce; a bench part. anchors: sand rim",
    line: "sandtray cx cy k lab=0 lit=tray|sand",
    demo: { line: "sandtray 480 330 22 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "sand" }, hold: 1.4 }, { set: { lit: "tray" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D2 = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = "b14st" + ++n;
      const at = (x, y, z) => K.iso([x, y, z], Pm), poly = (pts, z) => K.pathOf(pts.map(([x, y]) => at(x, y, z)), true);
      const ring = K.roundedPlan(IN, 6);
      // the tray: its pressed body, the bead round the walls, the rolled rim (a thin band proud of the wall's top)
      const body = S(K.slabOf(PLAN, 1.5, H - 1.5, Pm, 6, 0.6), { tone: "mid", inner: L(K.sideSeam(PLAN, 19, Pm, 6) + K.sideSeam(PLAN, 22, Pm, 6), { tone: "faint" }) });
      const rim = S(K.slabOf(K.insetPlan(PLAN, -0.8), H - 2.4, 2.4, Pm, 6, 0.8), { tone: "mid" });
      const feet = [[-W / 2 + 16, -D / 2 + 16], [W / 2 - 16, -D / 2 + 16], [-W / 2 + 16, D / 2 - 16], [W / 2 - 16, D / 2 - 16]].map(([x, y]) => S(K.cylinder(x, y, 5, 0, 1.5, Pm, 16), { tone: "lo" })).join("");
      // inside, clipped to the rim's opening: the far walls' inner faces down to the sand, the sand, its crater
      const far = [[[IN.x, IN.y + R], [IN.x, IN.y + IN.d - R]], [[IN.x + R, IN.y], [IN.x + IN.w - R, IN.y]]].map(([a, b]) => `<path d="${K.pathOf([at(a[0], a[1], H), at(b[0], b[1], H), at(b[0], b[1], SAND), at(a[0], a[1], SAND)], true)}" fill="#b9c0c6"/>`).join("");
      const grains = [], dark = [];
      for (let i = 0; i < 150; i++) { const u = (i * 0.618034) % 1, v = (i * 0.754878 + 0.31) % 1, x = IN.x + 6 + u * (IN.w - 12), y = IN.y + 6 + v * (IN.d - 12); if (Math.hypot(x / 34, y / 26) < 1.1) continue; (i % 3 ? grains : dark).push(at(x, y, SAND + 0.05)); }
      const crater = (r, z, fill, op) => `<path d="${poly(K.circleRing(0, 0, r, 40), z)}" fill="${fill}" fill-opacity="${op}"/>`;
      const inside = `<clipPath id="${id}"><path d="${poly(ring, H)}"/></clipPath><g clip-path="url(#${id})"><path d="${poly(ring, H)}" fill="#a7afb6"/>${far}` +
        `<g data-name="sand"><path d="${poly(ring, SAND)}" fill="#e2c995" stroke="#a88a52" stroke-width="0.7"/>${crater(30, SAND + 0.05, "#c9ab70", 0.55)}${crater(18, SAND - 1.2, "#b8975a", 0.6)}` +
        `<path d="${poly(K.circleRing(0, 0, 31.5, 40), SAND + 0.1)}" fill="none" stroke="#f1dfb5" stroke-width="1"/>${D2(grains, { size: 0.35, tone: "faint" })}${D2(dark, { size: 0.45 })}</g></g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(PLAN, 0, H, Pm)}"/><g data-name="tray">${ISO.tinted(ISO.T.rubber, feet)}${ISO.tinted(ZINC, body + rim)}</g>${inside}` +
        `<g data-name="tray"><path d="${poly(ring, H)}" fill="none" stroke="#4b545c" stroke-width="0.8"/></g><g data-part="words"></g>`;
      g.anchors = { sand: [0, 0, SAND / 10], rim: [0, D / 20, H / 10] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [W / 2 + 10, D / 2, H / 2], "sand tray", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [0, 0, SAND + 26], "sand", "#8a6a2e");
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "sand tray 20 × 15 × 4 cm · 3 cm of dry sand: a falling ball lands and stops dead, no bounce";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
