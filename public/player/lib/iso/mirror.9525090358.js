// "mirror cx cy width i=40 lab=1 lit=…" — a plane mirror standing in two slotted feet on a protractor sheet.
// A ray box on the paper aims a narrow ray at the mirror's centre; the normal is printed at 0°. The reflected ray leaves
// on the other side of the normal at the same angle (law of reflection, i = r). set({ i }) turns the ray box round the
// protractor; the reflected ray follows.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -122, y: -40, w: 244, d: 150, r: 7 }, PAPER = { x: -110, y: -14, w: 220, d: 116, r: 1 }, R = 78, BOX = 104, RAY = "#e09a00";
  const rad = (d) => (d * Math.PI) / 180;
  const dirOf = (deg, side) => [side * Math.sin(rad(deg)), Math.cos(rad(deg))];   // side -1: left of the normal, +1: right
  const onP = (x, y) => [x, y, 0.5];
  const ray = (P, a, b, w = 1.6) => {
    const A = K.iso(onP(...a), P), B = K.iso(onP(...b), P), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const head = [0.5, -0.5].map((d) => [m[0] - 6 * Math.cos(ang + d), m[1] - 6 * Math.sin(ang + d)]);
    return `<path d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}M${head[0][0]} ${head[0][1]}L${m[0]} ${m[1]}L${head[1][0]} ${head[1][1]}" fill="none" stroke="${RAY}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const arcAt = (P, r, a0, a1, color) => `<path d="${K.pathOf(Array.from({ length: 25 }, (_, k) => { const a = rad(a0 + ((a1 - a0) * k) / 24); return K.iso(onP(Math.sin(a) * r, Math.cos(a) * r), P); }))}" fill="none" stroke="${color}" stroke-width="1.1"/>`;

  function sheetSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 70, y: -34, w: 40, d: 14, r: 1.2 })];
    out.push(S(K.slabOf(PAPER, 0, 0.4, P, 2), { tone: "hi", crease: "none" }));
    for (const [x, y] of K.corners(PAPER, 6)) out.push(S(K.cylinder(x, y, 2.4, 0.4, 0.8, P, 16), { tone: "mid" }), D([K.iso([x, y, 1.2], P)], { size: 0.5 }));
    return out.join("");
  }
  // The protractor printed on the sheet: the base line along the mirror, the arc, degree ticks hanging inward from the
  // arc (major every 10°), the dashed normal, and the numbers.
  function printSvg(P, lab) {
    const arc = Array.from({ length: 91 }, (_, k) => K.iso(onP(Math.cos(rad(k * 2)) * R, Math.sin(rad(k * 2)) * R), P));
    const minor = [], major = [];
    for (let d = 5; d < 180; d += 5) {
      const a = rad(d), len = d % 10 ? 3 : 5.5;
      (d % 10 ? minor : major).push(K.segment(onP(Math.cos(a) * R, Math.sin(a) * R), onP(Math.cos(a) * (R - len), Math.sin(a) * (R - len)), P));
    }
    const out = [L(K.pathOf(arc) + K.segment(onP(-R - 8, 0.4), onP(R + 8, 0.4), P), { tone: "lo" }), D([K.iso(onP(-R - 8, 0.4), P), K.iso(onP(R + 8, 0.4), P)], { size: 0.6, tone: "lo" })];
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    out.push(L(K.segment(onP(0, 0.4), onP(0, R), P), { tone: "mid", dashed: true }), D([K.iso(onP(0, 0.4), P)], { size: 1, tone: "hi" }));
    for (const d of [30, 60]) for (const sd of [-1, 1]) { const [x, y] = dirOf(d, sd); out.push(ISO.word(K.iso(onP(x * (R - 12), y * (R - 12)), P), String(d), "#8a8f96", { size: 9, dy: 3 })); }
    if (lab) out.push(ISO.word(K.iso(onP(0, R + 6), P), "normal", "#555", { size: 13, dy: 4 }));
    return out.join("");
  }
  function mirrorSvg(P, front) {
    const out = [];
    for (const x of [-44, 44]) out.push(ISO.tinted(ISO.T.wood, front ? ISO.wbox(P, [x - 7, x + 7], [0, 7], [0, 9], "mid") + D([K.iso([x, 3.5, 9], P)], { size: 0.5 }) : ISO.wbox(P, [x - 7, x + 7], [-11, -4], [0, 9], "mid")));
    if (!front) out.push(`<g data-name="mirror">${ISO.wbox(P, [-56, 56], [-4.6, -4], [0, 40], "mid")}${ISO.tinted(ISO.T.glass, ISO.wbox(P, [-56, 56], [-4, 0], [0, 40], "hi", true))}` +
      `<path d="${K.pathOf([[-40, 0.05, 36], [-28, 0.05, 6]].map((p) => K.iso(p, P)))}M${K.iso([-30, 0.05, 36], P)}L${K.iso([-22, 0.05, 16], P)}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/></g>`);
    return out.join("");
  }
  function boxSvg(P, i) {
    const [dx, dy] = dirOf(i, -1), c = [dx * BOX, dy * BOX], u = [-dx, -dy], v = [-u[1], u[0]];
    const at = (a, w, b) => [c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b, w];
    const out = [ISO.box(at, P, [-16, 14], [0.4, 3], [-11, 11], "mid"), ISO.box(at, P, [-14, 12], [3, 24], [-9, 9], "mid"), ISO.box(at, P, [12, 13.6], [3, 20], [-7, 7], "hi")];
    for (let k = 0; k < 3; k++) out.push(L(K.pathOf([[-10 + k * 6, -5], [-8 + k * 6, -5], [-8 + k * 6, 5], [-10 + k * 6, 5]].map(([a, b]) => K.iso(at(a, 24, b), P)), true), { tone: "lo" }));
    out.push(`<path d="${K.pathOf([[13.65, 0.8, 4], [13.65, 0.8, 18], [13.65, -0.8, 18], [13.65, -0.8, 4]].map(([a, b, w]) => K.iso(at(a, w, b), P)), true)}" fill="#2a2b2f"/>`);
    out.push(D([at(-14, 3, -11), at(14, 3, -11), at(-14, 3, 11), at(14, 3, 11)].map((p) => K.iso([p[0], p[1], 3], P)), { size: 0.5 }));
    return { svg: out.join(""), slit: [c[0] + u[0] * 13.6, c[1] + u[1] * 13.6] };
  }

  ISO.add({
    name: "mirror", title: "Plane mirror (reflection)", compare: "mirror 480 270 380",
    about: "A ray box on a protractor sheet aims at a plane mirror: the reflected ray leaves at the same angle to the normal, i = r.",
    line: "mirror cx cy width i=40 lab=1 lit=mirror|raybox|rays",
    demo: { line: "mirror 480 280 380", script: [{ set: { i: 20 }, hold: "settle" }, { set: { i: 45 }, hold: "settle" }, { set: { i: 65 }, hold: "settle" }, { set: { i: 35 }, hold: "settle" }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 1.05;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, -4, 42]], cx, cy, W, H, { azimuth: 58, elevation: 34 }, parent);
      const s = { i: ISO.clamp(ISO.num(o, "i", 40), 10, 70) }; s.iT = s.i;
      g.innerHTML = `<g>${sheetSvg(P, lab)}${mirrorSvg(P, false)}${printSvg(P, lab)}</g><g data-part="rays" data-name="rays"></g><g>${mirrorSvg(P, true)}</g><g data-part="box" data-name="raybox"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "rays";
      const draw = () => {
        const key = s.i.toFixed(2), b = boxSvg(P, s.i);
        w.rebuild(el.box, key, () => b.svg);
        w.rebuild(el.rays, key, () => {
          const [rx, ry] = dirOf(s.i, 1), far = Math.min((PAPER.x + PAPER.w - 2) / Math.abs(rx || 1e-6), (PAPER.y + PAPER.d - 2) / ry);
          return arcAt(P, 24, -s.i, 0, "#2b6cc4") + arcAt(P, 30, 0, s.i, "#c0392b") + ray(P, b.slit, [0, 0.5]) + ray(P, [0, 0.5], [rx * far, ry * far]);
        });
        w.rebuild(el.words, lab ? key : "", () => {
          if (!lab) return "";
          const [ax, ay] = dirOf(s.i / 2, -1), [bx, by] = dirOf(s.i / 2, 1), [rx, ry] = dirOf(s.i, 1), [ix, iy] = dirOf(s.i, -1);
          return ISO.word(K.iso(onP(ax * 40, ay * 40), P), `i = ${s.i.toFixed(0)}°`, "#2b6cc4", { size: 14, anchor: "end" }) + ISO.word(K.iso(onP(bx * 46, by * 46), P), `r = ${s.i.toFixed(0)}°`, "#c0392b", { size: 14, anchor: "start" }) +
            ISO.word(K.iso(onP(ix * 66, iy * 66), P), "incident ray", "#8a5a10", { size: 13, anchor: "middle", dy: -14 }) + ISO.word(K.iso(onP(rx * 96, ry * 96), P), "reflected ray", "#8a5a10", { size: 13, anchor: "start" }) +
            ISO.word(K.iso([0, -4, 40], P), "plane mirror", "#555", { size: 14, dy: -8 });
        });
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.i !== undefined) s.iT = ISO.clamp(+p.i, 10, 70); if (p.lit) lit = p.lit; };
      g.update = (dt) => { s.i = ISO.follow(s.i, s.iT, dt, 0.5, ISO.still()); draw(); return s.i !== s.iT; };
      g.readout = () => `angle of incidence i = ${s.i.toFixed(0)}° · angle of reflection r = ${s.i.toFixed(0)}° · i = r, both from the normal`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
