// Batch b27 helpers (PARTS.md, batch 5): shared by the b27 parts (the resonance tube set of resonance.js: tube, tall
// jar, sound meter, force sensor, motion sensor; the model rocket set of rocket.js: rocket, launch pad, controller).
// Not a recipe: it only defines window.B27.
(() => {
  const B27 = (window.B27 = {});
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B27.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  const fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v), lim = (v) => ISO.clamp(v, -500, 500);
  // a cable's far end (cm, world): to= (the player's tox toy, at height dz) as wirelead, else dx dy dz from the origin
  B27.endOf = (P, o, d) => (fin(o.tox) && fin(o.toy) ? ISO.unproject(P, [+o.tox, +o.toy], lim(ISO.num(o, "dz", d[2]))) : [ISO.num(o, "dx", d[0]), ISO.num(o, "dy", d[1]), ISO.num(o, "dz", d[2])]).map(lim);
  // a soft cable's centre line (cm): leaves a along da, arrives at b along db (unit vectors pointing out of the
  // plugs), sagging by `sag` and lying on the floor `floor` cm where it would hang lower (a soft max, as wirelead)
  B27.cable = (a, da, b, db, sag = 0.5, floor = -1e9, n = 40) => {
    const span = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), lead = Math.min(span * 0.25, 6) + 0.5;
    const p1 = a.map((v, i) => v + da[i] * lead), p2 = b.map((v, i) => v + db[i] * lead), drop = sag * (0.3 * span + 1), pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t, q = [0, 1, 2].map((j) => m * m * m * a[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * b[j]);
      const z = q[2] - drop * Math.sin(Math.PI * t) ** 2, e = 0.6;
      q[2] = (z + floor + Math.sqrt((z - floor) ** 2 + e * e)) / 2;
      pts.push(q);
    }
    return pts;
  };
  // the cable drawn as a round rubber tube (CIRC.tube: an ink outline under the colour, a highlight)
  B27.cableSvg = (P, pts, dia, cols = ["#383b40", "#0c0d0f"]) => window.CIRC.tube(window.K.pathOf(pts.map((p) => window.K.iso(p, P))), window.G.scaleOf(P) * dia, cols);
})();
