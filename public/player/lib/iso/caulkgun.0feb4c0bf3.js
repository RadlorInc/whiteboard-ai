// "caulkgun cx cy width squeeze=N lab=1 lit=…" — a caulk gun laying a bead along the seam of a tiled splash.
// The gun: a steel cradle (trough, front cap with its nozzle notch), a rear housing with a fixed grip and a pivoting
// trigger, the plunger rod running through the housing with its drive (ratchet) plate and the release plate, and the
// hook handle at the rod's end. A 300 ml tube sits in the cradle, its nozzle cut at 45°. Each squeeze of the trigger
// tips the drive plate, which bites the rod and pushes it 1.5 mm; the plunger pushes the same volume of caulk out of the
// nozzle as the gun is pulled along the seam at the speed the bead comes out. set({ squeeze: N }) makes N squeezes.
// Local helpers: frame on the gun's axis (at), box on that frame (gbox).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  // World units: 1 = 1 cm. Tube 5 cm across (r 2.4 inside: 18.1 cm²); bead 7 mm across (0.38 cm²).
  const TUBE_R = 2.5, IN_AREA = Math.PI * 2.4 * 2.4, BEAD_R = 0.35, BEAD_AREA = Math.PI * BEAD_R * BEAD_R;
  const CLICK = 0.15, SQUEEZE_T = 1.1, X_START = -20;
  const NOZ = 7, TUBE = [NOZ, NOZ + 21], HOUSE = [NOZ + 21.6, NOZ + 28], ROD_LEN = 40;
  const A = (() => { const v = [0.72, 0.14, 0.68], l = Math.hypot(...v); return v.map((x) => x / l); })();
  const U = (() => { const z = [0, 0, 1], d = A[2]; const v = z.map((x, i) => -(x - d * A[i])); const l = Math.hypot(...v); return v.map((x) => x / l); })();
  const V = [A[1] * U[2] - A[2] * U[1], A[2] * U[0] - A[0] * U[2], A[0] * U[1] - A[1] * U[0]];
  const TIP = (x) => [x, 0.8, 0.8];
  // A point s along the gun from the tip, u down toward the grip, v across.
  const at = (s, u = 0, v = 0) => [0, 1, 2].map((i) => A[i] * s + U[i] * u + V[i] * v);
  const gbox = (P, [s0, s1], [u0, u1], [v0, v1], tone = "mid") => ISO.box((p, w, q) => at(p, w, q), P, [s0, s1], [u0, u1], [v0, v1], tone);
  const axis = (s) => G.frameOf(at(s), A, U, V);

  function benchSvg(P, lab) {
    const out = [];
    // Counter top and the tiled splash behind it; the joint between them is the seam to fill.
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -26, y: -3, w: 60, d: 26, r: 2 }, -4, 4, P)}"/>`);
    out.push(S(K.slabOf({ x: -26, y: -3, w: 60, d: 26, r: 1.5 }, -4, 4, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam({ x: -26, y: -3, w: 60, d: 26, r: 1.5 }, -2, P, 4), { tone: "faint" }) }));
    out.push(ISO.wbox(P, [-26, 34], [-4.5, 0], [0, 30], "mid"));
    // Tile joints on the splash, running edge to edge.
    for (let x = -16; x < 34; x += 10) out.push(ISO.seam(P, [[x, 0.01, 0.4], [x, 0.01, 30]], "#9aa0a6", 0.6));
    for (const z of [10, 20]) out.push(ISO.seam(P, [[-26, 0.01, z], [34, 0.01, z]], "#9aa0a6", 0.6));
    // The open joint: a dark gap along the corner.
    out.push(`<path d="${K.pathOf([[-26, 0.02, 0.02], [34, 0.02, 0.02], [34, 0.5, 0.02], [-26, 0.5, 0.02]].map((p) => K.iso(p, P)), true)}" fill="#5b6066"/>`);
    if (lab) out.push(ISO.word(K.iso([-26, 0, 2], P), "Seam", "#444", { anchor: "end", size: 13, dy: 4 }));
    return out.join("");
  }
  // The gun built with its tip at the origin; moved along the seam by translation.
  function gunSvg(P) {
    const out = [];
    // Nozzle: a cone cut at its tip, on the tube's shoulder.
    out.push(`<g data-name="tube">${S(G.solidOf([[0, 0.35], [1.2, 0.5, 1], [NOZ - 1.2, 1.0, 1], [NOZ - 0.4, 1.4], [NOZ, 1.6]], axis(0), P), { tone: "hi" })}` +
      `${S(G.solidOf([[0, 1.6], [0.8, TUBE_R, 1], [TUBE[1] - TUBE[0], TUBE_R]], axis(TUBE[0]), P), { tone: "hi", inner: L(G.arcOf(axis(TUBE[0]), 8, TUBE_R, P), { tone: "faint" }) + L(G.arcOf(axis(TUBE[0]), 14, TUBE_R, P), { tone: "faint" }) })}</g>`);
    // Cradle: a trough under the tube, a front cap with the nozzle notch, and the end ring at the housing.
    const steel = [gbox(P, [TUBE[0] + 0.4, HOUSE[0]], [TUBE_R + 0.1, TUBE_R + 0.5], [-1.6, 1.6])];
    steel.push(gbox(P, [TUBE[0] - 0.4, TUBE[0] + 0.4], [-0.2, TUBE_R + 0.5], [-2.2, 2.2]));
    out.push(ISO.tinted(ISO.T.steel, steel.join("")));
    return out.join("");
  }
  // Rear housing, fixed grip, release plate (behind the housing, on top) and the trigger at angle k (0 rest – 1 squeezed).
  function rearSvg(P, k) {
    const out = [];
    out.push(ISO.tinted(ISO.T.steel, gbox(P, HOUSE, [-1.6, 3.2], [-1.6, 1.6]) + gbox(P, [HOUSE[1] - 2.4, HOUSE[1]], [3.2, 13], [-1.3, 1.3])));
    out.push(ISO.tinted(ISO.T.plastic, gbox(P, [HOUSE[1] - 2.6, HOUSE[1] + 0.2], [6, 13.4], [-1.5, 1.5])));
    // Release (thumb) plate standing on the rod behind the housing.
    out.push(gbox(P, [HOUSE[1] + 0.4, HOUSE[1] + 0.8], [-2.6, 0.8], [-1.2, 1.2]));
    // Trigger: pivots at the housing's lower front, its lower end swinging back toward the grip.
    const sw = 0.12 + 0.32 * k, piv = [HOUSE[0] + 0.8, 2.6];
    const tr = (s, u) => [piv[0] + (s * Math.cos(sw) + u * Math.sin(sw)), piv[1] + (-s * Math.sin(sw) + u * Math.cos(sw))];
    const pts = [[-0.8, 0], [0.8, 0], [0.8, 10], [-0.8, 10]].map(([s, u]) => tr(s, u));
    const V8 = [];
    for (const v of [-1.1, 1.1]) for (const [s, u] of pts) V8.push(at(s, u, v));
    out.push(`<g data-name="trigger">${ISO.tinted(ISO.T.steel, ISO.poly([V8[0], V8[1], V8[2], V8[3], V8[4], V8[5], V8[6], V8[7]], [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"))}</g>`);
    // Drive (ratchet) plate inside the housing's slot, tipped by the trigger.
    out.push(gbox(P, [HOUSE[0] + 2.4 + k * 0.6, HOUSE[0] + 2.8 + k * 0.6], [-0.9, 2.8], [-1.0, 1.0], "hi"));
    return out.join("");
  }
  // The exposed rod behind the housing, and its hook handle; `adv` is how far it has gone in.
  function rodSvg(P, adv) {
    const s0 = HOUSE[1] + 0.8, end = HOUSE[0] + ROD_LEN - adv - NOZ;
    if (end <= s0) return "";
    return `<g data-name="rod">${ISO.tinted(ISO.T.steel, S(G.disc(0, end - s0, 0.4, axis(s0), P), { tone: "hi" }) +
      gbox(P, [end, end + 0.6], [-0.6, 4.6], [-0.5, 0.5], "hi") + gbox(P, [end - 3.4, end], [3.8, 4.6], [-0.5, 0.5], "hi"))}</g>`;
  }
  const beadSvg = (P, x0, x1) => (x1 - x0 < 0.2 ? "" : `<g data-name="bead">${S(G.disc(0, x1 - x0, BEAD_R, G.frameOf([x0, 0.4, 0.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" })}</g>`);

  ISO.add({
    name: "caulkgun", title: "Caulk gun", compare: "caulkgun 500 270 440",
    about: "Caulk gun (cradle, tube with its nozzle cut at 45°, rod with drive plate, trigger and grip) laying a bead along the seam between a counter and its tiled splash.",
    line: "caulkgun cx cy width squeeze=N lab=1 lit=trigger|rod|tube|bead",
    demo: { line: "caulkgun 500 270 440", script: [{ set: {}, hold: 1 }, { set: { squeeze: 5, lit: "trigger" }, hold: "settle" }, { set: { lit: "bead" }, hold: 2 }] },
    make([cx, cy, width = 440], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.3, H = width * 0.8;
      const { P, g } = ISO.frame([[-26, -4.5, -4], [34, -4.5, -4], [-26, 23, -4], [34, 23, -4], [-26, -4.5, 30], [34, -4.5, 30], ...[X_START, X_START + 50].map((x) => TIP(x).map((v, i) => v + at(HOUSE[1] + 14, 13)[i]))], cx, cy, W, H, { azimuth: 64, elevation: 26 }, parent);
      g.innerHTML = `<g>${benchSvg(P, lab)}</g><g data-part="bead"></g><g data-part="gun"><g>${gunSvg(P)}</g><g data-part="rear"></g><g data-part="rod"></g><g data-part="words"></g></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer();
      const s = { n: 0, target: 0, phase: 0, k: 0, adv: 0, out: 0, lit: o.lit || "" };
      const n0 = Math.max(0, Math.round(ISO.num(o, "squeeze", 0)));
      if (n0) { s.n = s.target = n0; s.adv = n0 * CLICK; s.out = s.adv; }
      const beadLen = (adv) => (adv * IN_AREA) / BEAD_AREA;   // the volume pushed out, laid as a 7 mm bead
      const tipX = () => X_START + beadLen(s.out);
      const draw = () => {
        const x = tipX();
        w.attr(q("gun"), "transform", K.translateAlong(P, TIP(x)));
        w.rebuild(q("rear"), s.k.toFixed(3), () => rearSvg(P, s.k));
        w.rebuild(q("rod"), s.adv.toFixed(3), () => rodSvg(P, s.adv));
        w.rebuild(q("bead"), x.toFixed(2), () => beadSvg(P, X_START, x));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      if (lab) q("words").innerHTML = ISO.word(K.iso(at(HOUSE[0] - 1, 15), P), "Trigger", "#444", { anchor: "end", size: 13, dy: 4 }) +
        ISO.word(K.iso(at(TUBE[0] + 8, -TUBE_R - 2), P), "Tube", "#444", { anchor: "middle", size: 13, dy: -8 });
      g.set = (p) => {
        if (p.squeeze !== undefined) s.target = s.n + Math.max(0, Math.round(+p.squeeze));
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        if (s.n >= s.target) { s.k = ISO.follow(s.k, 0, dt, 0.08, ISO.still()); s.out = ISO.follow(s.out, s.adv, dt, 0.3, ISO.still()); draw(); return s.k > 1e-3 || Math.abs(s.out - s.adv) > 1e-3; }
        if (ISO.still()) { s.adv = s.target * CLICK; s.out = s.adv; s.n = s.target; s.k = 0; draw(); return false; }
        // One squeeze: the trigger closes over 0.45 s (the rod moves with it), then springs back.
        s.phase += dt / SQUEEZE_T;
        const p = Math.min(s.phase, 1), close = ISO.smooth(0, 0.42, p) * (1 - ISO.smooth(0.55, 0.95, p));
        s.k = close;
        s.adv = (s.n + ISO.smooth(0, 0.42, p)) * CLICK;
        // Caulk comes out a little behind the rod (the tube's walls give), so the bead keeps up just after.
        s.out = ISO.follow(s.out, s.adv, dt, 0.3, false);
        if (s.phase >= 1) { s.phase = 0; s.n++; }
        draw();
        return true;
      };
      g.readout = () => {
        const vol = s.out * IN_AREA;
        return `squeeze ${s.n}${s.target > s.n ? ` of ${s.target}` : ""} · rod in ${(s.adv * 10).toFixed(0)} mm (1.5 mm a squeeze) · ${vol.toFixed(1)} cm³ of caulk · ${(vol / BEAD_AREA).toFixed(0)} cm of 7 mm bead`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
