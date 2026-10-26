// "bulldogclip cx cy k lab=0 lit=body|levers" — a PART (PARTS.md, batch 5): the small bulldog clip of the chromatography
// set-up (chroma.js's clip at the top of the paper) at real size, 1.4 × 1 × 1.2 cm. One piece of black japanned spring
// steel bent into a teardrop, its two jaws meeting in a toothed bite along x, and two folding wire levers that pivot in
// holes on its ends, standing up in a loop a glass rod slides through. Origin the middle of the bite (where it grips a
// sheet lying in the x–z plane); `top` = the levers' loop, where a rod goes. Static. Built in mm (ISO.mm).
(() => {
  const K = window.K, G = window.G, D = (p, s) => K.dotsSvg(p, s);
  const HX = 7, T = 0.5, PIV = [4.35, 6.5], TOPZ = 16, PX = HX - 1;
  // the bent sheet's outline in (y, z): a front jaw up and out, round over the back of the spring, the back jaw down
  const curve = (() => {
    const pts = [[0.25, 0], [1.6, 2.2], [3.4, 5], [4.6, 7.4]];
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; pts.push([Math.cos(a) * 4.6, 7.4 + Math.sin(a) * 4.4]); }
    pts.push([-4.6, 7.4], [-3.4, 5], [-1.6, 2.2], [-0.25, 0]);
    return pts;
  })();
  const band = (() => {
    // the sheet as a thin band: the outline, then the same line moved T inward, back the other way
    const inner = curve.map(([y, z], i) => { const p = curve[Math.max(0, i - 1)], q = curve[Math.min(curve.length - 1, i + 1)], ty = q[0] - p[0], tz = q[1] - p[1], l = Math.hypot(ty, tz) || 1; return [y - (tz / l) * T, z + (ty / l) * T]; });
    return [...curve, ...inner.reverse()];
  })();
  const wire = (P, pts) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = Math.max(0.6, G.scaleOf(P) * 0.9);
    return `<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(w + 0.8).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c7c9cd" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  // a lever (side s = +1 front, −1 back): from its pivot on each end of the clip, up and leaning out, across the top
  const lever = (s) => { const y0 = s * PIV[0], y1 = s * 1.6; return [[-PX, y0, PIV[1]], [-PX, y1, TOPZ], [PX, y1, TOPZ], [PX, y0, PIV[1]]]; };
  // the little ear pressed out of a jaw at each end, with the hole a lever's end hooks into
  const ears = (P, s) => [-PX, PX].map((x) => ISO.wbox(P, [x - 0.7, x + 0.7], s > 0 ? [3.9, 4.6] : [-4.6, -3.9], [5.6, 7.4], "mid")).join("");

  function svg(P) {
    const B09 = window.B09, out = [];
    const back = lever(-1), front = lever(1);
    // the back lever (its ends on the back jaw, behind the body), the body with its ears, the front lever
    out.push(`<g data-name="levers">${wire(P, back)}</g>`);
    out.push(`<g data-name="body">${ISO.prismX(P, band, -HX, HX, ["#1c1d20", "#383a3e"], "#2e3034", "#0b0c0d")}` +
      `${D([-5.5, -2.75, 0, 2.75, 5.5].map((x) => K.iso([x, 0.3, 0.3], P)), { size: 0.35, tone: "hi" })}` +
      `${ISO.tinted(B09.BLACK, ears(P, 1))}</g>`);
    out.push(`<g data-name="levers">${wire(P, front)}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "bulldogclip", title: "Bulldog clip (part)", compare: null,
    about: "A small black bulldog clip 1.4 cm wide whose toothed jaws grip the top of a paper strip, its two wire levers folded up in a loop that hangs on a glass rod. anchors: top",
    line: "bulldogclip cx cy k lab=0 lit=body|levers",
    demo: { line: "bulldogclip 480 360 60", script: [{ set: {}, hold: 1 }, { set: { lit: "levers" }, hold: 1.2 }, { set: { lit: "body" }, hold: 1.2 }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = svg(Pm) + (lab ? LAB.word(Pm, lab, [HX + 3, 0, 8], "bulldog clip", "#556", { anchor: "start" }) : "");
      g.anchors = { top: [0, 0, (TOPZ - 1) / 10] };
      return window.B09.still(g, o, "bulldog clip · 14 mm jaws · levers up to hang it on a rod");
    },
  });
})();
