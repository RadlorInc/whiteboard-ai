// "whitecard cx cy k w=10..40 d=8..30 posts=0|1 hole=none|wire|coil lab=0 lit=card|posts" — a PART (PARTS.md,
// batch 5): a stiff white card 22 × 14 cm, 1 mm thick, that a magnet's field is plotted on (compasses, iron filings).
// posts=0: it lies on the bench, origin its middle on the surface; posts=1: it is raised 5.6 cm on four brass posts
// with feet (as round a current-carrying wire), origin the bench point under its middle. hole=wire: a 7 mm hole in the
// middle for a straight wire to pass up through; hole=coil: two rows of 21 holes 3 cm apart for a solenoid's turns
// (20 turns over 8 cm, along x). A printed border and a north arrow in a corner (north toward −y, as wirefield's).
// `top` = the middle of the card's top face. Static. magnet.js's and wirefield.js's card. Built in mm; anchors in cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const T = 1, ZP = 56, SOL = { a: 40, R: 15, n: 21 };
  const PAPER = ISO.tint("#ffffff", ["#d9dadc", "#e3e4e6", "#ecedef", "#f4f5f6"], "#8a8f96");

  function cardSvg(P, plan, z, hole, lab) {
    const out = [ISO.tinted(PAPER, S(K.slabOf(plan, z, T, P, 3), { tone: "hi" }))], zt = z + T, at = (x, y) => K.iso([x, y, zt + 0.02], P);
    // the printed border, the north arrow and its letter in the far right corner
    out.push(L(K.planOutline(K.insetPlan(plan, 6), zt + 0.02, P, 3), { tone: "lo", free: true }));
    const ax = plan.x + plan.w - 16, ay0 = plan.y + 42, ay1 = plan.y + 24;
    out.push(`<path d="${K.pathOf([at(ax, ay0), at(ax, ay1)])}M${at(ax - 3, ay1 + 6)}L${at(ax, ay1)}L${at(ax + 3, ay1 + 6)}" fill="none" stroke="#556" stroke-width="${(K.cameraOf(P).k * 1.1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    out.push(LAB.faceText(P, [ax, ay1 - 3, zt + 0.02], [1, 0, 0], "N", 8, "#556", [0, -1, 0]));
    const dark = (x, y, r) => `<path d="${K.ring(x, y, r, zt + 0.03, P, 18)}" fill="#3c4148" fill-opacity=".75"/>`;
    if (hole === "wire") out.push(dark(0, 0, 3.5), L(K.ring(0, 0, 3.5, zt + 0.03, P, 18), { tone: "lo" }));
    if (hole === "coil") for (let i = 0; i < SOL.n; i++) { const x = -SOL.a + (2 * SOL.a * i) / (SOL.n - 1); out.push(dark(x, -SOL.R, 0.9), dark(x, SOL.R, 0.9)); }
    if (lab) out.push(CIRC.word(P, [(plan.x + plan.w) / 10, 0, zt / 10], "white card"));
    return out.join("");
  }
  // a brass post: a round foot, a pillar up to the card's underside, a cap screw on the card's top
  const postsSvg = (P, plan) => K.corners(plan, 8).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P)).map(([x, y]) =>
    ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 5, 0, 2.5, P, 20, 0.5), { tone: "mid" }) + S(K.cylinder(x, y, 2.4, 2.5, ZP - 2.5, P, 14), { tone: "mid", crease: "none" }))).join("");
  const capsSvg = (P, plan) => ISO.tinted(ISO.T.brass, K.corners(plan, 8).map(([x, y]) => S(K.cylinder(x, y, 3, ZP + T, 1, P, 14, 0.3), { tone: "hi" })).join(""));

  ISO.add({
    name: "whitecard", title: "White card (part)", compare: null,
    about: "A stiff white card 22 × 14 cm to plot a magnetic field on: lies on the bench, or stands 5.6 cm up on four brass posts with a hole for a wire or two rows of holes for a coil. anchors: top",
    line: "whitecard cx cy k w=10..40 d=8..30 posts=0|1 hole=none|wire|coil lab=0 lit=card|posts",
    demo: { line: "whitecard 480 330 26 posts=1 hole=wire", script: [{ set: {}, hold: 1 }, { set: { lit: "card" }, hold: 1.2 }, { set: { lit: "posts" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const W = ISO.clamp(ISO.num(o, "w", 22), 10, 40) * 10, Dp = ISO.clamp(ISO.num(o, "d", 14), 8, 30) * 10, posts = o.posts === "1";
      const hole = o.hole === "wire" || o.hole === "coil" ? o.hole : "none", plan = { x: -W / 2, y: -Dp / 2, w: W, d: Dp, r: 3 }, z = posts ? ZP : 0;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, T, Pm)}"/>` + (posts ? `<g data-name="posts">${postsSvg(Pm, plan)}</g>` : "") +
        `<g data-name="card">${cardSvg(Pm, plan, z, hole, lab)}</g>` + (posts ? `<g data-name="posts">${capsSvg(Pm, plan)}</g>` : "");
      g.anchors = { top: [0, 0, +((z + T) / 10).toFixed(2)] };
      const light = CIRC.lighter(g);
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `white card ${W / 10} × ${Dp / 10} cm${posts ? `, on four posts ${ZP / 10} cm up` : ", flat on the bench"}${hole === "wire" ? " · a hole in the middle for a wire" : hole === "coil" ? " · holes for a 20-turn coil" : ""}`;
      light(lit);
      return g;
    },
  });
})();
