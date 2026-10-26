// Batch b29 helpers (PARTS.md, batch 5): shared by the b29 parts (the Stern–Gerlach set of sterngerlach.js: vacuum
// tube, atom oven, magnet, glass plate; the stopwatch and its cradle of stopwatch.js; the windlass of wheelaxle.js;
// the balloon frame of static.js). Not a recipe: it only defines window.B29. World units: 1 = 1 cm.
(() => {
  const G = window.G;
  const B29 = (window.B29 = {});
  // frames whose axis runs along x, y or z (pointOf(F, s, r, a): s along the axis, a = 0 toward the next axis)
  B29.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  B29.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  B29.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B29.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // see-through glass: wrap solids in <g class="b29-glass" style="${ISO.T.glass}">; the style goes once per part
  B29.GLASS = `<style>.b29-glass .iso-fill{fill-opacity:.14}.b29-glass .iso-shade,.b29-glass .iso-top{opacity:.3}</style>`;
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B29.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
})();
