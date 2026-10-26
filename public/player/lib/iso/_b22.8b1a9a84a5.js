// Batch b22 helpers (PARTS.md, batch 5): shared by the b22 parts (the absorption set of penetration.js: sealed source,
// source holder, lead brick, absorber sheet and holder, GM tube, counter; and the box periscope). Not a recipe: it only
// defines window.B22. The absorption parts put the beam at BEAM = 7 cm over the bench (the holder's sleeve, the middle
// of an absorber standing in its holder, the GM tube's window on its own stand); radiation travels toward −x.
(() => {
  const B22 = (window.B22 = {});
  B22.BEAM = 7;
  B22.LEAD = ISO.tint("#a9aeb5", ["#5f646c", "#6c717a", "#7a7f88", "#878c95"], "#24272c");
  B22.ALU = ISO.tint("#e4e6e9", ["#a3a7ad", "#b3b7bc", "#c3c6ca", "#d2d4d8"], "#4a4e55");
  B22.PAPER = ISO.tint("#ffffff", ["#e2e2dd", "#e9e9e5", "#f0f0ec", "#f7f7f4"], "#8a8a84");
  B22.SRC = { alpha: { iso: "Am-241", sym: "α", col: "#c0392b" }, beta: { iso: "Sr-90", sym: "β", col: "#2c8a2c" }, gamma: { iso: "Co-60", sym: "γ", col: "#7a4ab0" } };
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B22.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // a radiation-trefoil sticker lying on a top face at c (mm), r its blades' outer radius
  B22.trefoil = (P, [cx, cy, z], r) => {
    const K = window.K, G = window.G, top = (x, y) => K.iso([x, y, z + 0.05], P), q = r * 1.25;
    const blades = [0, 1, 2].map((i) => {
      const a0 = (i * 2 * Math.PI) / 3 - Math.PI / 6 + Math.PI / 2, pts = [];
      for (let j = 0; j <= 6; j++) { const a = a0 + (j / 6) * (Math.PI / 3); pts.push(top(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
      for (let j = 6; j >= 0; j--) { const a = a0 + (j / 6) * (Math.PI / 3); pts.push(top(cx + Math.cos(a) * r * 0.33, cy + Math.sin(a) * r * 0.33)); }
      return K.pathOf(pts, true);
    }).join("");
    const c = top(cx, cy);
    return `<path d="${K.pathOf([top(cx - q, cy - q), top(cx + q, cy - q), top(cx + q, cy + q), top(cx - q, cy + q)], true)}" fill="#f2c62e" stroke="#6b5114" stroke-width="0.5"/>` +
      `<path d="${blades}" fill="#1b1d20"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(G.scaleOf(P) * r * 0.2).toFixed(2)}" fill="#1b1d20"/>`;
  };
  // a dark round hole (a bore's mouth) on a face: centre c, the face's two directions u v, radius r (all world units)
  B22.hole = (P, c, u, v, r, fill = "#1c1e22") => {
    const pts = []; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; pts.push(window.K.iso(c.map((x, j) => x + (u[j] * Math.cos(a) + v[j] * Math.sin(a)) * r), P)); }
    return `<path d="${window.K.pathOf(pts, true)}" fill="${fill}" stroke="#0d0e10" stroke-width="0.5"/>`;
  };
  // the usual static part's set/update: only lit changes
  B22.still = (g, o) => {
    const w = ISO.writer();
    let lit = o.lit || "";
    const draw = () => B22.light(w, g, lit);
    g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
    g.update = () => false;
    draw();
  };
})();
