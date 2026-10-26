// "mineralrock cx cy k lab=0 lit=rock|chips" — a PART (PARTS.md, batch 5): the broken rock matrix a crystal cluster
// grows from (crystals.js), 8.4 × 7 × 1.8 cm, its origin the surface point under its middle (it sits on a
// displayplinth's `top`). Three broken chunks of grey-brown rock stacked as the scene has them (a wide foot, a crown,
// a small side knob), each a tapering solid with an irregular outline, flecks of darker mineral on the crown and a few
// loose chips round the foot. Place a crystalcluster at its origin (at=<rock>): the crystals' feet are set into it.
// Static. Built in mm (ISO.mm); anchors in cm. World units: 1 = 1 mm.
(() => {
  const K = window.K;
  const ROCK = ISO.tint("#c9c1b5", ["#8a8075", "#9a9085", "#aaa196", "#bab1a6"], "#4a4238");
  // a broken chunk: two irregular rings (foot z0, top z1) joined by side faces (crystals.js)
  const chunk = (P, cx0, cy0, z0, z1, r0, r1, seed, dx = 0, dy = 0, n = 9) => {
    const V = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + seed, k = 0.8 + 0.25 * Math.sin(seed * 3 + i * 2.1); V.push([cx0 + Math.cos(a) * r0 * k, cy0 + Math.sin(a) * r0 * k * 0.85, z0]); }
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + seed + 0.2, k = 0.8 + 0.2 * Math.cos(seed * 2 + i * 1.7); V.push([cx0 + dx + Math.cos(a) * r1 * k, cy0 + dy + Math.sin(a) * r1 * k * 0.85, z1 - Math.min(2, (z1 - z0) * 0.34) * Math.sin(i + seed)]); }
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => n + i)];
    for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
    return ISO.poly(V, F, P, "mid");
  };

  ISO.add({
    name: "mineralrock", title: "Mineral rock (part)", compare: null,
    about: "A broken grey-brown rock matrix in three chunks with darker flecks and loose chips, the base a crystal cluster grows from; sits on a display plinth. anchors: top",
    line: "mineralrock cx cy k lab=0 lit=rock|chips",
    demo: { line: "mineralrock 480 330 55", script: [{ set: {}, hold: 1 }, { set: { lit: "rock" }, hold: 1.2 }, { set: { lit: "chips" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -46, y: -34, w: 84, d: 70, r: 20 }, 0, 2, Pm)}"/>`;
      // loose chips behind and in front of the foot (drawn in depth order with the rock between)
      const chipsBack = chunk(Pm, -34, -26, 0, 3, 4, 2.6, 0.7, 0, 0, 6) + chunk(Pm, 22, -30, 0, 2.4, 3, 2, 1.9, 0, 0, 5);
      const chipsFront = chunk(Pm, 30, 24, 0, 3.4, 4.4, 3, 2.8, 0, 0, 6) + chunk(Pm, -24, 30, 0, 2.2, 2.8, 1.8, 0.4, 0, 0, 5) + chunk(Pm, 38, 4, 0, 2, 2.4, 1.6, 1.3, 0, 0, 5);
      const rock = chunk(Pm, -6, 2, 0, 12, 42, 36, 0.3) + chunk(Pm, -2, 0, 12, 18, 34, 26, 1.1, 1, -1) + chunk(Pm, 18, -10, 10, 16, 14, 9, 2.2);
      // darker mineral flecks on the crown (its top ring sits at about 16..18 mm)
      const fl = [[-14, -6], [-6, 8], [4, -4], [10, 10], [-18, 6], [0, 14], [8, -14], [-10, -14]].map(([x, y], i) => K.iso([x, y, 16.6 + (i % 3) * 0.4], Pm));
      g.innerHTML = halo + `<g data-name="chips">${chipsBack}</g><g data-name="rock" style="${ROCK}">${rock}${K.dotsSvg(fl, { size: 0.7, tone: "lo" })}</g><g data-name="chips">${chipsFront}</g>` +
        (lab ? LAB.word(Pm, lab, [0, 0, 30], "rock", "#4a4238") : "");
      for (const c of g.querySelectorAll('[data-name="chips"]')) c.setAttribute("style", ROCK);
      g.anchors = { top: [0, 0, 1.8] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B10.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "broken rock matrix · 8.4 × 7 cm, 1.8 cm high · crystals grow from cavities in it";
      B10.light(w, g, lit);
      return g;
    },
  });
})();
