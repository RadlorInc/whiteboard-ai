// "shelfboard cx cy k w=40..120 lab=0 lit=board" — a PART (PARTS.md): a solid pine shelf board, 2 cm thick and 20 cm
// deep, its back edge against the wall. Its origin is the wall-face point under the middle of its back edge (y = 0,
// z = 0), so it sits on brackets placed at the same point. Edges eased (rounded 3 mm), flat-sawn grain on top with a
// cathedral figure and two small knots, growth rings on its cut end, a faint shadow line on the wall below.
// World units: 1 = 1 cm (x along the wall, y into the room, z up).
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s);
  const D = 20, T = 2, E = 0.3;
  const PINE = ISO.tint("#f8ead2", ["#d8b27c", "#e0bf8f", "#e8cca2", "#efd8b6"], "#7a5a2e");
  const path = (P, pts, closed) => K.pathOf(pts.map((p) => K.iso(p, P)), closed);
  function boardSvg(P, w) {
    const x0 = -w / 2, x1 = w / 2, out = [];
    // the soft shadow it throws on the wall just under its back edge: three steps, darkest at the board
    [[0, 0.8, 0.16], [0.8, 1.8, 0.09], [1.8, 3.2, 0.04]].forEach(([a, b, op]) =>
      out.push(`<path d="${path(P, [[x0 + 1, 0.02, -a], [x1 - 1, 0.02, -a], [x1 - 1, 0.02, -b], [x0 + 1, 0.02, -b]], true)}" fill="#5a4a32" fill-opacity="${op}"/>`));
    const plan = { x: x0, y: 0, w, d: D, r: E };
    out.push(K.solidSvg(K.slabOf(plan, 0, T, P, 3, E), { tone: "mid" }));
    // grain on the top: straight lines end to end (they stop on the eased edge's crease), then the cathedral loops
    const lines = [], xa = x0 + E * 0.5, xb = x1 - E * 0.5;
    for (const f of [0.08, 0.17, 0.29, 0.36, 0.64, 0.73, 0.85, 0.93]) {
      const y = D * f, pts = [];
      for (let i = 0; i <= 24; i++) { const x = xa + (xb - xa) * (i / 24); pts.push([x, y + 0.25 * Math.sin(x * 0.11 + f * 9), T]); }
      lines.push(path(P, pts));
    }
    out.push(L(lines.join(""), { tone: "faint" }));
    // cathedral: nested closed arches (a flat-sawn board's heartwood figure), centred off middle
    const arches = [], cxA = w * 0.12;
    for (const [len, half] of [[w * 0.34, 3.6], [w * 0.26, 2.6], [w * 0.18, 1.7], [w * 0.1, 0.8]]) {
      const pts = [];
      for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2, c = Math.cos(a); pts.push([cxA - len / 2 + len * (0.5 + 0.5 * c) ** 1.6, D / 2 + half * Math.sin(a), T]); }
      arches.push(path(P, pts, true));
    }
    out.push(L(arches.join(""), { tone: "lo" }));
    // two small knots: a dark core and a ring round it
    for (const [kx, ky, r] of [[-w * 0.3, D * 0.3, 0.9], [w * 0.36, D * 0.7, 0.6]]) {
      const ring = (rr) => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [kx + Math.cos(a) * rr * 1.5, ky + Math.sin(a) * rr, T]; });
      out.push(`<path d="${path(P, ring(r), true)}" fill="#a77a44" fill-opacity=".6" stroke="#7a5a2e" stroke-width="0.5"/>`, L(path(P, ring(r * 1.9), true), { tone: "lo" }));
    }
    // the cut end (x = w/2): growth rings, arcs round a pith below the board, each from its bottom edge to its top
    const rings = [], yc = D * 0.42, zc = -2.6;
    for (const R of [4.9, 6, 7.3, 8.8, 10.6, 12.8, 15.4, 18.5]) for (const side of [-1, 1]) {
      const p = [];
      for (let i = 0; i <= 6; i++) { const z = T * (i / 6); p.push([x1 + 0.01, yc + side * Math.sqrt(R * R - (z - zc) ** 2), z]); }
      if (p.every(([, y]) => y > E && y < D - E)) rings.push(path(P, p));
    }
    out.push(L(rings.join(""), { tone: "lo" }));
    return ISO.tinted(PINE, out.join(""));
  }
  ISO.add({
    name: "shelfboard", title: "Shelf board (part)", compare: null,
    about: "A solid pine shelf board, 2 cm thick and 20 cm deep with eased edges, its back edge against the wall; it rests on two brackets; a part to place in any scene. anchors: top",
    line: "shelfboard cx cy k w=40..120 lab=0 lit=board",
    demo: { line: "shelfboard 470 260 7.5 w=80 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "board" }, hold: 1.5 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const w = ISO.clamp(ISO.num(o, "w", 80), 40, 120);
      g.innerHTML = `<g data-name="board">${boardSvg(P, w)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([w / 2, D, T], P), "shelf board", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="');
      g.anchors = { top: [0, D / 2, T] };
      const wr = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => wr.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => `shelf board · ${Math.round(w)} × 20 × 2 cm pine · holds about 20 kg on two brackets`;
      draw();
      return g;
    },
  });
})();
