// "curvedmirror cx cy size k=concave|convex rays=1-5 R=14 lab=1 lit=mirror|raybox|F" — a curved mirror strip on a sheet.
// A ray box with a five-slit comb lies on a sheet of paper on the bench and throws rays parallel to the principal axis
// at a curved mirror strip standing in a slotted wooden block. Each ray is reflected by the true law at the circle it
// meets (angle in = angle out about the radius, which is the normal): a concave strip brings them together at F, half
// way to the centre of curvature C (f = R/2); a convex strip spreads them as if from a virtual F behind it (dashed).
// set({ rays }) opens more slits, set({ k }) swaps the strip; the light runs out of the box again each time.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -170, y: -66, w: 330, d: 132, r: 7 }, PAPER = { x: -156, y: -54, w: 302, d: 108, r: 1 };
  const MX = 70, BOXX = -128, RAY = "#e09a00", SLITS = [-28, -14, 0, 14, 28], HALF = 40, ZP = 0.5;
  const pick = (n) => ({ 1: [0], 2: [-14, 14], 3: [-14, 0, 14], 4: [-28, -14, 14, 28] }[n] || SLITS);

  // The strip's face: x on the circle of radius R through the vertex (MX, 0), centre C on the side it curves round.
  const faceX = (y, R, cave) => (cave ? MX - R + Math.sqrt(R * R - y * y) : MX + R - Math.sqrt(R * R - y * y));
  // One ray from the slit at height y: to the strip, reflected about the radius there, then on until it leaves the paper
  // or comes back to the box. Returns the polyline and, for a convex strip, the dashed line back to where it seems to come from.
  function trace(y, R, cave) {
    const hx = faceX(y, R, cave), C = [cave ? MX - R : MX + R, 0];
    let n = [hx - C[0], y - C[1]]; const l = Math.hypot(...n); n = [n[0] / l, n[1] / l];
    const d = [1, 0], dn = d[0] * n[0] + d[1] * n[1], r = [d[0] - 2 * dn * n[0], d[1] - 2 * dn * n[1]];
    const lim = [r[0] < 0 ? (BOXX + 16 - hx) / r[0] : 1e9, r[1] > 0 ? (PAPER.y + PAPER.d - 3 - y) / r[1] : r[1] < 0 ? (PAPER.y + 3 - y) / r[1] : 1e9];
    const len = Math.min(...lim), end = [hx + r[0] * len, y + r[1] * len];
    let back = null;
    if (!cave && Math.abs(r[1]) > 1e-6) { const s = -y / r[1]; back = [[hx, y], [hx + r[0] * s, 0]]; }
    return { pts: [[BOXX + 15, y], [hx, y], end], back };
  }
  const iso = (P, x, y, z = ZP) => K.iso([x, y, z], P);
  // A polyline cut at length `p` (0..total), as a path, with an arrow head at the middle of each finished leg.
  function rayPath(P, pts, p) {
    let d = "", left = p;
    for (let i = 1; i < pts.length && left > 0; i++) {
      const a = pts[i - 1], b = pts[i], seg = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.min(1, left / seg), e = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      const A = iso(P, ...a), B = iso(P, ...e);
      d += `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
      if (k > 0.55) {
        const m = iso(P, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), q = iso(P, a[0] + (b[0] - a[0]) * 0.5 - (b[0] - a[0]) / seg, a[1] + (b[1] - a[1]) * 0.5 - (b[1] - a[1]) / seg), ang = Math.atan2(m[1] - q[1], m[0] - q[0]);
        d += [0.5, -0.5].map((t) => `M${(m[0] - 5 * Math.cos(ang + t)).toFixed(1)} ${(m[1] - 5 * Math.sin(ang + t)).toFixed(1)}L${m[0].toFixed(1)} ${m[1].toFixed(1)}`).join("");
      }
      left -= seg;
    }
    return d;
  }
  const lengthOf = (pts) => pts.slice(1).reduce((s, b, i) => s + Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]), 0);

  function sheetSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 104, y: -62, w: 44, d: 12, r: 1.2 })];
    out.push(S(K.slabOf(PAPER, 0, 0.4, P, 2), { tone: "hi", crease: "none" }));
    for (const [x, y] of K.corners(PAPER, 6)) out.push(S(K.cylinder(x, y, 2.4, 0.4, 0.8, P, 16), { tone: "mid" }), D([iso(P, x, y, 1.2)], { size: 0.5 }));
    // the principal axis ruled on the sheet, with a centimetre scale along it from the mirror
    out.push(L(K.segment([PAPER.x + 8, 0, ZP], [PAPER.x + PAPER.w - 8, 0, ZP], P), { tone: "faint", dashed: true, free: true }));
    const ticks = [];
    for (let x = MX - 10; x > PAPER.x + 30; x -= 10) ticks.push(K.segment([x, 0, ZP], [x, (MX - x) % 50 ? 2.2 : 4, ZP], P));
    out.push(L(ticks.join(""), { tone: "faint", free: true }));
    return out.join("");
  }
  // The strip: a thin curved band of polished steel, its bright face toward the box, standing in a slotted block.
  function mirrorSvg(P, R, cave) {
    const n = 24, front = [], back = [];
    for (let i = 0; i <= n; i++) { const y = -HALF + (2 * HALF * i) / n; front.push([faceX(y, R, cave), y]); back.push([faceX(y, R, cave) + 2.4, y]); }
    const ring = [...front, ...back.slice().reverse()];
    // the holder: a wooden block behind the strip, its front cut to the strip's curve, two screws in its top
    const out = [ISO.tinted(ISO.T.wood, S(K.extrude([...back, [MX + 16, HALF], [MX + 16, -HALF]], 0.4, 10, P, { convex: false }), { tone: "mid" }))];
    out.push(`<g data-name="mirror">${ISO.tinted(ISO.T.steel, S(K.extrude(ring, 0.4, 36, P, { convex: false }), { tone: "hi", lit: true }))}` +
      `<path d="${K.pathOf([[faceX(-26, R, cave) - 0.2, -26, 32], [faceX(-10, R, cave) - 0.2, -10, 6]].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/></g>`);
    out.push(D([iso(P, MX + 10, -HALF + 8, 10.4), iso(P, MX + 10, HALF - 8, 10.4)], { size: 0.5 }));
    return out.join("");
  }
  // The ray box: a lamp housing on a foot, its front comb of five slits, a cable gland and a switch on top.
  function boxSvg(P) {
    const out = [ISO.wbox(P, [BOXX - 26, BOXX + 10], [-40, 40], [0.4, 4], "mid"), ISO.wbox(P, [BOXX - 24, BOXX + 8], [-36, 36], [4, 30], "mid")];
    out.push(ISO.wbox(P, [BOXX + 8, BOXX + 12], [-36, 36], [4, 26], "hi"));
    const sl = SLITS.map((y) => K.pathOf([[BOXX + 12.05, y - 1.3, 8], [BOXX + 12.05, y - 1.3, 22], [BOXX + 12.05, y + 1.3, 22], [BOXX + 12.05, y + 1.3, 8]].map((p) => K.iso(p, P)), true)).join("");
    out.push(`<path d="${sl}" fill="#2a2b2f"/>`);
    for (let k = 0; k < 4; k++) out.push(L(K.planOutline({ x: BOXX - 20 + k * 6, y: -24, w: 2.6, d: 48, r: 1.2 }, 30, P, 3), { tone: "lo" }));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [BOXX - 4, BOXX + 4], [22, 30], [30, 33], "hi")));
    out.push(S(G.disc(0, 4, 3, G.frameOf([BOXX - 24, 0, 16], [-1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(D([[BOXX - 22, -38, 4], [BOXX + 6, -38, 4], [BOXX - 22, 38, 4], [BOXX + 6, 38, 4]].map((p) => K.iso(p, P)), { size: 0.5 }));
    return out.join("");
  }

  ISO.add({
    name: "curvedmirror", title: "Curved mirror and ray box", compare: "curvedmirror 480 270 300 k=concave",
    about: "A ray box throws parallel rays at a curved mirror strip on a sheet: a concave strip brings them to F (f = R/2), a convex one spreads them from a virtual F.",
    line: "curvedmirror cx cy size k=concave|convex rays=1-5 R=14 lab=1 lit=mirror|raybox|F",
    demo: { line: "curvedmirror 480 270 300 k=concave rays=1", script: [{ set: { rays: 1 }, hold: "settle" }, { set: { rays: 5, lit: "F" }, hold: "settle" }, { set: { k: "convex", lit: "" }, hold: "settle" }, { set: { k: "concave", lit: "mirror" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.15, H = size * 1.3;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [MX, 0, 40], [BOXX, 0, 34]], cx, cy, W, H, { azimuth: 114, elevation: 46 }, parent);
      const R = ISO.clamp(ISO.num(o, "R", 14), 10, 18) * 10;   // radius of curvature in mm (cm in the line)
      const s = { cave: o.k !== "convex", n: ISO.clamp(Math.round(ISO.num(o, "rays", 5)), 1, 5), p: 0 };
      let lit = o.lit || "", built = "";
      g.innerHTML = `<g>${sheetSvg(P)}</g><g data-part="mirror"></g><g data-part="rays"></g><g data-name="raybox">${boxSvg(P)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      let paths = [], total = 1;
      const plan = () => {
        paths = pick(s.n).map((y) => trace(y, R, s.cave));
        total = Math.max(...paths.map((r) => lengthOf(r.pts)));
      };
      plan();
      const draw = () => {
        const key = `${s.cave}`;
        if (built !== key) { built = key; el.mirror.innerHTML = mirrorSvg(P, R, s.cave); }
        const p = Math.round(s.p * 200) / 200, F = s.cave ? MX - R / 2 : MX + R / 2, Cx = s.cave ? MX - R : MX + R;
        w.rebuild(el.rays, `${key}${s.n}${p}`, () => {
          const out = paths.map((r) => `<path d="${rayPath(P, r.pts, p * total)}" fill="none" stroke="${RAY}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`);
          if (p >= 1) {
            for (const r of paths) if (r.back) out.push(`<path d="${K.pathOf(r.back.map(([x, y]) => iso(P, x, y)))}" fill="none" stroke="${RAY}" stroke-width="1" stroke-dasharray="3 3" opacity=".8" data-free=""/>`);
            out.push(`<g data-name="F">${D([iso(P, F, 0)], { size: 1.4, tone: "hi" })}</g>`);
            if (Cx > PAPER.x + 4 && Cx < PAPER.x + PAPER.w - 4) out.push(D([iso(P, Cx, 0)], { size: 1, tone: "mid" }));
          }
          return out.join("");
        });
        w.rebuild(el.words, lab ? `${key}${p >= 1}` : "", () => !lab ? "" :
          ISO.word(K.iso([MX, 0, 40], P), s.cave ? "concave mirror" : "convex mirror", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([BOXX - 8, 0, 34], P), "ray box", "#555", { size: 14, dy: -6 }) +
          (p >= 1 ? ISO.word(iso(P, F, 0), s.cave ? "F" : "F (virtual)", "#c0392b", { size: 15, dy: 18 }) + (Cx > PAPER.x + 4 && Cx < PAPER.x + PAPER.w - 4 ? ISO.word(iso(P, Cx, 0), "C", "#555", { size: 14, dy: 18 }) : "") : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        let again = false;
        if (p.k && (p.k === "convex") === s.cave) { s.cave = p.k !== "convex"; again = true; }
        if (p.rays !== undefined) { const n = ISO.clamp(Math.round(+p.rays), 1, 5); if (n !== s.n) { s.n = n; again = true; } }
        if (p.lit !== undefined) lit = p.lit;
        if (again) { plan(); s.p = 0; }
      };
      g.update = (dt) => {
        s.p = ISO.still() ? 1 : Math.min(1, s.p + dt / 1.6);
        draw();
        return s.p < 1;
      };
      g.readout = () => {
        const f = R / 20;
        return s.cave ? `concave mirror · R = ${R / 10} cm · rays parallel to the axis reflect through F · f = R/2 = ${f} cm in front of the mirror`
          : `convex mirror · R = ${R / 10} cm · rays spread out as if from a virtual F ${f} cm behind the mirror · f = −${f} cm`;
      };
      s.p = ISO.still() ? 1 : 0;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
