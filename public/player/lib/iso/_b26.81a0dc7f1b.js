// Batch b26 helpers (PARTS.md, batch 5): shared by the b26 parts (the RC breadboard set of rccircuit.js: breadboard,
// slide switch, capacitor, multimeter; the refraction blocks of refraction.js: glass block, semicircular block, perspex
// strip; the tuning fork of resonance.js). Not a recipe: it only defines window.B26.
(() => {
  const B26 = (window.B26 = {});
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B26.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // clear glass or perspex, as refraction.js draws it: the kit's glass tint, fills and shades at half opacity
  B26.GLASS_CSS = `<style>.b26-glass .iso-fill{fill-opacity:.5}.b26-glass .iso-shade,.b26-glass .iso-top{opacity:.5}</style>`;
  B26.glass = (name, svg) => `<g class="b26-glass" data-name="${name}" style="${ISO.T.glass}">${svg}</g>`;
  // a glint across a clear top face: two soft white streaks between (x0,y0) and (x1,y1) at height z
  B26.glint = (P, [x0, y0], [x1, y1], z, w) => {
    const K = window.K, n = [-(y1 - y0), x1 - x0], L = Math.hypot(...n), u = [n[0] / L, n[1] / L];
    const strip = (o, t) => K.pathOf([[x0 + u[0] * o, y0 + u[1] * o], [x1 + u[0] * o, y1 + u[1] * o], [x1 + u[0] * (o + t), y1 + u[1] * (o + t)], [x0 + u[0] * (o + t), y0 + u[1] * (o + t)]].map(([x, y]) => K.iso([x, y, z + 0.03], P)), true);
    return `<path d="${strip(0, w)}${strip(w * 1.6, w * 0.45)}" fill="#ffffff" fill-opacity=".7"/>`;
  };
  // the far edges of a clear solid, seen through it: its outline at the bottom and its far verticals, faint
  B26.farEdges = (P, ring, h) => {
    const K = window.K, view = [Math.cos((62 * Math.PI) / 180), Math.sin((62 * Math.PI) / 180)], out = [];
    out.push(K.pathOf(ring.map(([x, y]) => K.iso([x, y, 0.05], P)), true));
    // a vertical edge is "far" when the camera looks at it past the solid's middle
    const mx = ring.reduce((s, p) => s + p[0], 0) / ring.length, my = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    ring.forEach(([x, y], i) => { if (i % Math.max(1, Math.round(ring.length / 8)) === 0 && (x - mx) * view[0] + (y - my) * view[1] < 0) out.push(K.pathOf([K.iso([x, y, 0.05], P), K.iso([x, y, h - 0.05], P)])); });
    return `<path d="${out.join("")}" fill="none" stroke="#7d9db2" stroke-width="0.6" opacity=".55" data-free=""/>`;
  };
})();
