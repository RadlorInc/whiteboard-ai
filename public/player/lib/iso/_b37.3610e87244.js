// Batch b37 helpers (PARTS.md, batch 6): shared by dishaerial, signalmeter, coaxcable (the satdish scene's bits) and
// cpuchip, cpusocket (the chip scene's). Not a recipe: it only defines window.B37. Units are said per helper.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const B37 = (window.B37 = {});
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B37.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B37.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  B37.ZINC = ISO.tint("#e9ecef", ["#a4aab1", "#b3b9bf", "#c3c8cd", "#d3d7db"], "#4a5058");
  B37.BRASS = ISO.T.brass || ISO.T.steel;
  // a dish (any units): a paraboloid of radius R and focal length f in frame F (its axis F.a, vertex at F.o), shell
  // thickness th. Drawn by hand, not lathed (a lathe of this size costs ~8 ms): the back's silhouette is the hull of
  // points on the shell, the face is the rim's ellipse (shown when the hollow faces the viewer), a rolled-rim lip
  // stroke. Tint it with ISO.tinted; it lights like a solid.
  B37.dish = (P, F, R, f, th, { steps = 40, lip = 0 } = {}) => {
    const sOf = (r) => (r * r) / (4 * f), pts = [K.iso(G.pointOf(F, -th, 0, 0), P)];
    for (let i = 1; i <= 6; i++) { const r = (R * i) / 6; for (let j = 0; j < steps; j++) pts.push(K.iso(G.pointOf(F, sOf(r) - th, r + (i === 6 ? lip : 0), (j / steps) * Math.PI * 2), P)); }
    const hull = K.pathOf(ISO.hullOf(pts), true), rim = G.circleOf(F, sOf(R), R, P, steps);
    const facing = K.depthOf(G.add3(F.o, F.a), P) > K.depthOf(F.o, P), k = G.scaleOf(P);
    const lipW = Math.max(0.8, k * Math.max(lip, th) * 1.4).toFixed(2);
    return `<g class="iso-solid"><path class="iso-fill" d="${hull}"/><path class="iso-shade" data-shade="1" d="${hull}"/>` +
      (facing ? `<path class="iso-top" d="${rim}"/>` : "") +
      `<path class="iso-line iso-edge" data-tone="mid" d="${hull}${rim}"/>` +
      (lip ? `<path d="${rim}" fill="none" stroke="#9aa0a7" stroke-width="${lipW}" opacity=".6"/>` : "") + `</g>`;
  };
  // an F connector (cm) on a cable, its mouth at `o`, the cable leaving along unit `a`: hex nut, crimp ferrule, the
  // black boot; the copper centre pin sticks out of the mouth along −a
  B37.fplug = (P, o, a, sheath = ISO.T.rubber) => {
    const F = G.frameAlong(o, a), k = G.scaleOf(P);
    const pin = K.pathOf([G.pointOf(F, -0.35, 0, 0), G.pointOf(F, 0, 0, 0)].map((p) => K.iso(p, P)));
    return `<path d="${pin}" stroke="#b8763a" stroke-width="${Math.max(0.5, k * 0.1).toFixed(2)}" stroke-linecap="round"/>` +
      ISO.tinted(B37.ZINC, S(G.solidOf([[0, 0.55], [0.75, 0.55]], F, P, { steps: 6 }), { tone: "mid" }) + S(G.solidOf([[0.75, 0.42], [1.7, 0.42]], F, P, { steps: 14 }), { tone: "hi" })) +
      ISO.tinted(sheath, S(G.solidOf([[1.7, 0.4], [3, 0.35]], F, P, { steps: 12 }), { tone: "mid", crease: "none" }));
  };
  // an F socket (cm) on a face, its foot at `o`, sticking out along unit `a`: hex base and the threaded barrel with
  // its white insulator and the hole for the pin
  B37.fport = (P, o, a) => {
    const F = G.frameAlong(o, a), k = G.scaleOf(P), out = [];
    // the hex base, then the barrel with its thread rings (arcs on its near side)
    out.push(ISO.tinted(B37.ZINC, S(G.solidOf([[0, 0.55], [0.3, 0.55]], F, P, { steps: 6 }), { tone: "mid" })));
    const arcs = [0.5, 0.65, 0.8, 0.95].map((s) => G.arcOf(F, s, 0.48, P)).join("");
    out.push(ISO.tinted(B37.ZINC, S(G.solidOf([[0.3, 0.48], [1.1, 0.48]], F, P, { steps: 16 }), { tone: "mid", inner: K.lineSvg(arcs, { tone: "faint" }) })));
    out.push(`<path d="${G.circleOf(F, 1.11, 0.32, P, 16)}" fill="#f2f0ea" stroke="#6a6f76" stroke-width="${Math.max(0.3, k * 0.03).toFixed(2)}"/>`);
    out.push(`<path d="${G.circleOf(F, 1.12, 0.08, P, 8)}" fill="#2a2e33"/>`);
    return out.join("");
  };
})();
