// Batch b17 helpers (PARTS.md, batch 5): shared by the heat-engine, ramp and litmus parts. Not a recipe: it only
// defines window.B17. World units: whatever camera is passed (the parts build in mm with ISO.mm).
(() => {
  const K = window.K;
  const B17 = (window.B17 = {});
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B17.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the board offset of world vector d (a world move is a flat screen move): "translate(x y)"
  B17.move = (P, d) => { const a = K.iso([0, 0, 0], P), b = K.iso(d, P); return `translate(${(b[0] - a[0]).toFixed(2)} ${(b[1] - a[1]).toFixed(2)})`; };
  // the world point in the plane x = x0 that lands on board point [sx, sy] (two probes solve the linear camera)
  B17.onPlaneX = (P, [sx, sy], x0 = 0) => {
    const o = K.iso([x0, 0, 0], P), ey = K.iso([x0, 1, 0], P), ez = K.iso([x0, 0, 1], P);
    const a = ey[0] - o[0], b = ez[0] - o[0], c = ey[1] - o[1], d = ez[1] - o[1], det = a * d - b * c, u = sx - o[0], v = sy - o[1];
    return [x0, (u * d - b * v) / det, (a * v - c * u) / det];
  };
  B17.fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
  let clipN = 0;
  B17.id = (p) => `${p}${clipN++}`;
})();
