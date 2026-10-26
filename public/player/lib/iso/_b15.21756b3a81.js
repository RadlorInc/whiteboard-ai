// Batch b15 helpers (PARTS.md, batch 5): shared by the gauge-scene parts and the baseboard. Not a recipe: it only
// defines window.B15. World units: whatever camera is passed (the parts build in mm with ISO.mm).
(() => {
  const K = window.K;
  const B15 = (window.B15 = {});
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B15.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the same camera moved so that its world origin lands where world point d was: draw a helper built round z = 0
  // (ISO.baseboard's top) at height d[2]
  B15.shift = (P, d) => { const a = K.iso([0, 0, 0], P), b = K.iso(d, P); return { ...P, origin: [P.origin[0] + b[0] - a[0], P.origin[1] + b[1] - a[1]] }; };
  B15.cm = (p) => p.map((v) => +(v / 10).toFixed(3));
  // a hex nut or hex end on any axis frame F from s0 to s1, across-flats af (a prism of six sides)
  B15.hex = (P, F, s0, s1, af, phase = Math.PI / 6) => {
    const r = af / Math.sqrt(3), poly = Array.from({ length: 6 }, (_, i) => { const a = phase + (i * Math.PI) / 3; return [Math.cos(a) * r, Math.sin(a) * r]; });
    return K.solidSvg(window.G.prismOf(F, poly, s0, s1, P), { tone: "mid" });
  };
})();
