// Batch b11 helpers (PARTS.md, batch 5): bits the density parts (plasticball, stone) and the crystal share. Not a
// recipe: it only defines window.B11.
(() => {
  const K = window.K;
  const B11 = (window.B11 = {});
  // Light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups are rebuilt).
  B11.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // The edges of a face list, each once.
  B11.edges = (F) => { const m = new Map(); for (const f of F) f.forEach((i, k) => { const j = f[(k + 1) % f.length]; m.set(i < j ? `${i},${j}` : `${j},${i}`, [Math.min(i, j), Math.max(i, j)]); }); return [...m.values()]; };
  // The volume of a closed convex solid (faces fanned into triangles from its middle).
  B11.volume = (V, F) => {
    const c = V.reduce((s, v) => s.map((x, i) => x + v[i] / V.length), [0, 0, 0]);
    let vol = 0;
    for (const f of F) for (let k = 1; k < f.length - 1; k++) {
      const [a, b, d] = [V[f[0]], V[f[k]], V[f[k + 1]]].map((p) => p.map((x, i) => x - c[i]));
      vol += Math.abs(a[0] * (b[1] * d[2] - b[2] * d[1]) - a[1] * (b[0] * d[2] - b[2] * d[0]) + a[2] * (b[0] * d[1] - b[1] * d[0])) / 6;
    }
    return vol;
  };
  // The part of a convex solid under the water plane z = zw, as a blue wash over it: the hull of its corners below the
  // plane and of the points where its edges cross it (a convex body's slice is convex, so the hull is exact).
  B11.wet = (P, V, E, zw) => {
    const pts = V.filter((v) => v[2] < zw).map((v) => K.iso(v, P));
    for (const [i, j] of E) {
      const a = V[i], b = V[j];
      if ((a[2] < zw) !== (b[2] < zw)) { const t = (zw - a[2]) / (b[2] - a[2]), q = a.map((x, n) => x + (b[n] - x) * t); pts.push(K.iso(q, P)); }
    }
    if (pts.length < 3) return "";
    return `<path d="${K.pathOf(ISO.hullOf(pts), true)}" fill="#4f93d6" fill-opacity=".26"/>`;
  };
  // A slow-motion factor for the drops into water (a real drop is over in a fifth of a second).
  B11.SLOW = 0.25;
})();
