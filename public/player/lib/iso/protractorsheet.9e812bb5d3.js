// "protractorsheet cx cy k lab=0 lit=sheet|scale|normal" — a PART (PARTS.md, batch 5): the printed sheet of mirror.js,
// a 30 × 20 cm paper sheet lying flat, its origin the sheet's middle on the surface. Printed on it: the mirror line
// along x near its back edge (y = −7 cm) with the protractor's centre mark on it, a half circle of radius 12 cm into
// +y with a tick every degree (longer every 5 and 10), the numbers 0–180 every 10 just inside the arc, and inside them
// in blue the angle from the normal (0 on the normal, 90 on the mirror line), every 10; the normal dashed from the
// centre to 90°, named. A planemirror stands at= its `centre` (on the mirror line); a ray box goes on the arc.
// Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s);
  const HX = 15, HY = 10, C = [0, -7], R = 12, PZ = 0.03;
  const rad = (d) => (d * Math.PI) / 180, on = (x, y) => [x, y, PZ + 0.002];
  const PAPER = ISO.tint("#fbfbf7", ["#d9d9d2", "#e2e2db", "#ebebe5", "#f3f3ee"], "#77776c");
  const polar = (deg, r) => [C[0] + Math.cos(rad(deg)) * r, C[1] + Math.sin(rad(deg)) * r];
  // flat print on the paper, read from the sheet's front (outside the arc): its up points in toward the centre (LAB.faceText reads right way round when u × up points into the face)
  const printAt = (P, deg, r, text, size, color) => { const [x, y] = polar(deg, r), up = [-Math.cos(rad(deg)), -Math.sin(rad(deg)), 0]; return window.LAB.faceText(P, [x, y, PZ + 0.003], [-up[1], up[0], 0], text, size, color, up); };

  function sheetSvg(P, lab) {
    const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.05 }, I = (p) => K.iso(on(...p), P);
    const sheet = `<path class="iso-halo" d="${K.haloOf(plan, 0, PZ, P)}"/><g data-name="sheet">${ISO.tinted(PAPER, K.solidSvg(K.slabOf(plan, 0, PZ, P, 2), { tone: "lo", crease: "none" }))}</g>`;
    const arc = K.pathOf(Array.from({ length: 91 }, (_, i) => I(polar(i * 2, R))));
    const t1 = [], t5 = [], t10 = [];
    for (let d = 1; d < 180; d++) { const len = d % 10 === 0 ? 0.8 : d % 5 === 0 ? 0.55 : 0.32; (d % 10 === 0 ? t10 : d % 5 === 0 ? t5 : t1).push(K.pathOf([I(polar(d, R)), I(polar(d, R - len))])); }
    const base = K.pathOf([I([C[0] - R - 1.5, C[1]]), I([C[0] + R + 1.5, C[1]])]);
    const cross = K.pathOf([I([C[0], C[1] - 0.5]), I([C[0], C[1]])]);
    const nums = [], from = [];
    for (let d = 0; d <= 180; d += 10) nums.push(printAt(P, d === 0 ? 4 : d === 180 ? 176 : d, R - 0.95, String(d), 0.62, "#3d4a57"));
    for (let d = 10; d <= 170; d += 10) if (d !== 90) from.push(printAt(P, d, R - 2.05, String(Math.abs(90 - d)), 0.5, "#2b6cc4"));
    const scale = `<g data-name="scale">${L(base + arc + cross, { tone: "mid", free: true })}${L(t1.join(""), { tone: "faint", free: "end" })}${L(t5.join(""), { tone: "lo", free: "end" })}${L(t10.join(""), { tone: "mid", free: "end" })}${nums.join("")}${from.join("")}` +
      K.dotsSvg([I(C)], { size: 0.7, tone: "hi" }) + `</g>`;
    const normal = `<g data-name="normal">${L(K.pathOf([I(C), I(polar(90, R - 0.8))]), { tone: "mid", dashed: true, free: true })}` +
      window.LAB.faceText(P, [C[0] + 0.35, C[1] + R * 0.42, PZ + 0.003], [0, 1, 0], "NORMAL", 0.5, "#3d4a57", [1, 0, 0]) + `</g>`;
    const words = lab ? window.LAB.word(P, lab, [HX, HY, 0], "protractor sheet", "#556", { anchor: "start", dy: 14 }) : "";
    return sheet + scale + normal + words;
  }

  ISO.add({
    name: "protractorsheet", title: "Protractor sheet (part)", compare: null,
    about: "A 30 × 20 cm paper sheet printed with a 0–180° protractor (a tick every degree), the angles from the normal in blue, the mirror line and the dashed normal; a plane mirror stands on its mirror line. anchors: centre normal",
    line: "protractorsheet cx cy k lab=0 lit=sheet|scale|normal",
    demo: { line: "protractorsheet 480 300 22", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.3 }, { set: { lit: "normal" }, hold: 1.3 }, { set: { lit: "sheet" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = sheetSvg(P, lab);
      g.anchors = { centre: [C[0], C[1], PZ], normal: [C[0], C[1] + R, PZ] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "protractor sheet · mirror line and normal printed · angles of incidence and reflection are read from the normal (blue numbers)";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
