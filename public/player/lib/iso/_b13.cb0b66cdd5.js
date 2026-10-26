// Batch b13 helpers (PARTS.md, batch 5): the paper clip the ironbolt and the shallowdish both draw. Not a recipe: it
// only defines window.B13. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  const B13 = (window.B13 = {});
  // a steel Gem clip's wire centre line in its own plane (u along it 0..3.2 cm, v across), the same as paperclip.js
  const arc = (cu, cv, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });
  const H = Math.PI / 2, RW = 0.045;
  B13.CLIP = [[0.42, -0.355], ...arc(2.8, 0, 0.355, -H, H, 12), ...arc(0.4, 0.075, 0.28, H, 3 * H, 10), ...arc(2.52, 0, 0.205, -H, H, 8), [1.05, 0.205]];
  B13.CLIP_LEN = 3.2;
  const STEEL = { ink: "#3c4148", body: "#b9bcc1", shine: "#f4f5f7" };
  // one clip: at([u, v]) maps the clip's own plane to world points; shadow=1 adds a soft shadow on z = floor
  B13.clip = (P, at, { opacity = 1, floor = null } = {}) => {
    const pts = B13.CLIP.map(at), out = [];
    if (floor !== null) out.push(`<path d="${K.pathOf(pts.map((p) => K.iso([p[0], p[1], floor], P)))}" fill="none" stroke="#3a3e44" stroke-opacity=".16" stroke-width="${(RW * 4 * K.screenRise(1, P) + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    out.push(PHYS.wire(P, PHYS.path(P, pts), RW, STEEL));
    return opacity < 1 ? `<g opacity="${opacity.toFixed(2)}">${out.join("")}</g>` : out.join("");
  };
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups get rebuilt)
  B13.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
})();
