// Batch b25 helpers (PARTS.md, batch 5): the 60° flint-glass prism shared by glassprism and turntable (prism=1), so a
// prism that turns with its table is drawn by the table itself (anchors don't follow). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const B25 = (window.B25 = {});
  B25.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  B25.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  B25.light = (w, g, lit) => window.LAB.light(w, g, lit);
  B25.rad = (d) => (d * Math.PI) / 180;
  // flint glass (n = 1.62 for green), equilateral, 5 cm sides, 3 cm tall; the glass's see-through look
  B25.PRISM = { side: 5, h: 3, n: 1.627 };
  B25.GLASS = `<style>.b25-glass .iso-fill{fill-opacity:.72}.b25-glass .iso-shade,.b25-glass .iso-top{opacity:.8}</style>`;
  B25.FLINT = ISO.tint("#e6f2f8", ["#a9c8da", "#bcd6e5", "#cde2ee", "#dcebf3"], "#3d6680");
  // the triangle's corners turned phi (rad) about [0, 0]: at phi = 0 the apex points +y and the base face runs along x
  B25.tri = (phi) => [90, 210, 330].map((a) => { const t = B25.rad(a) + phi, r = B25.PRISM.side / Math.sqrt(3); return [r * Math.cos(t), r * Math.sin(t)]; });
  // the prism standing on z0: its body, the three upright edges seen through the glass (faint), the ground top face's
  // edge bevel, and two glints on the faces that face you
  B25.prism = (P, z0, phi) => {
    const V = B25.tri(phi), h = B25.PRISM.h, kS = G.scaleOf(P), out = [];
    out.push(`<g class="b25-glass" style="${B25.FLINT}">${S(K.extrude(V, z0, h, P, { bevel: 0.06 }), { tone: "hi" })}</g>`);
    out.push(`<path d="${V.map(([x, y]) => K.pathOf([K.iso([x, y, z0 + 0.06], P), K.iso([x, y, z0 + h - 0.06], P)])).join("")}" stroke="#3d6680" stroke-width="0.6" opacity=".5" data-free=""/>`);
    const [vx, vy] = K.towardViewer(P);
    for (let e = 0; e < 3; e++) {
      const a = V[e], b = V[(e + 1) % 3], nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx * vx + ny * vy <= 0) continue;   // the corners run anticlockwise, so (dy, −dx) is the face's outward normal
      const p = (f, z) => K.iso([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z0 + z], P);
      out.push(`<path d="${K.pathOf([p(0.22, h * 0.82), p(0.34, h * 0.2)])}M${p(0.4, h * 0.8)}L${p(0.46, h * 0.5)}" stroke="#fff" stroke-width="${Math.max(0.6, kS * 0.07).toFixed(2)}" stroke-linecap="round" opacity=".85" data-free=""/>`);
    }
    return out.join("");
  };
})();
