// Batch b30 helpers (PARTS.md, batch 5): shared by straightwire and solenoidcoil (wirefield.js's wire and coil, each
// through its own white card on four posts, as whitecard.js draws it). Not a recipe: it only defines window.B30.
// Card bits are built in mm (ISO.mm); everything else says its units.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B30 = (window.B30 = {});
  // the card of whitecard.js: 22 × 14 cm, 1 mm thick, 5.6 cm up on four brass posts (mm)
  B30.ZP = 56; B30.T = 1; B30.PLAN = { x: -110, y: -70, w: 220, d: 140, r: 3 };
  const PAPER = ISO.tint("#ffffff", ["#d9dadc", "#e3e4e6", "#ecedef", "#f4f5f6"], "#8a8f96");
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B30.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B30.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // posts, split into the two behind the card's middle and the two in front, so a wire's foot paints between them
  const post = (P, [x, y]) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 5, 0, 2.5, P, 20, 0.5), { tone: "mid" }) + S(K.cylinder(x, y, 2.4, 2.5, B30.ZP - 2.5, P, 14), { tone: "mid", crease: "none" }));
  const corners = (P) => K.corners(B30.PLAN, 8).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
  // the whole card: far posts, `under` (what stands under the card), near posts, card with its print and holes, caps
  // holes: [[x, y, r], …] in mm
  B30.card = (P, holes, under = "") => {
    const cs = corners(P), z = B30.ZP, zt = z + B30.T, at = (x, y) => K.iso([x, y, zt + 0.02], P), plan = B30.PLAN;
    const out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, zt, P)}"/>`, `<g data-name="card">${cs.slice(0, 2).map((c) => post(P, c)).join("")}</g>`, under, `<g data-name="card">${cs.slice(2).map((c) => post(P, c)).join("")}`];
    out.push(ISO.tinted(PAPER, S(K.slabOf(plan, z, B30.T, P, 3), { tone: "hi" })));
    out.push(L(K.planOutline(K.insetPlan(plan, 6), zt + 0.02, P, 3), { tone: "lo", free: true }));
    const ax = plan.x + plan.w - 16, ay0 = plan.y + 42, ay1 = plan.y + 24;
    out.push(`<path d="${K.pathOf([at(ax, ay0), at(ax, ay1)])}M${at(ax - 3, ay1 + 6)}L${at(ax, ay1)}L${at(ax + 3, ay1 + 6)}" fill="none" stroke="#556" stroke-width="${(K.cameraOf(P).k * 1.1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" data-free=""/>`);
    out.push(LAB.faceText(P, [ax, ay1 - 3, zt + 0.02], [1, 0, 0], "N", 8, "#556", [0, -1, 0]));
    for (const [x, y, r] of holes) out.push(`<path d="${K.ring(x, y, r, zt + 0.03, P, 18)}" fill="#3c4148" fill-opacity=".75"/>`);
    out.push(ISO.tinted(ISO.T.brass, cs.map(([x, y]) => S(K.cylinder(x, y, 3, zt, 1, P, 14, 0.3), { tone: "hi" })).join("")), "</g>");
    return out.join("");
  };
  // a red current arrow from a to b (world points), its ends free (it stands in the air beside the conductor)
  B30.arrow = (P, a, b) => {
    const A = K.iso(a, P), B = K.iso(b, P), an = Math.atan2(B[1] - A[1], B[0] - A[0]), f = (v) => v.toFixed(1);
    return `<path d="M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}M${f(B[0] - 7 * Math.cos(an - 0.5))} ${f(B[1] - 7 * Math.sin(an - 0.5))}L${f(B[0])} ${f(B[1])}L${f(B[0] - 7 * Math.cos(an + 0.5))} ${f(B[1] - 7 * Math.sin(an + 0.5))}" fill="none" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" data-free=""/>`;
  };
  B30.COPPER = { ink: "#6e3a1c", body: "#d6956d", shine: "#f7d9c4" };
  B30.MU = 4e-7 * Math.PI;
})();
