// "cameramodule cx cy k lab=0 lit=block|lenses|flex" — a PART (PARTS.md, batch 6): a phone's dual camera module lying
// lenses up, its origin the surface point under the middle of its block, 25 × 13 × 6 mm: a black block with a steel
// bracket round its top, two raised sensor housings, each with its lens barrel and glass (the wide one larger), and the
// flex ribbon that leaves the block's end to a board-to-board connector (plugs into the logic board). Static.
// Built in mm; anchors in cm.
(() => {
  ISO.add({
    name: "cameramodule", title: "Phone camera module (part)", compare: null,
    about: "A phone's dual camera module: a block with two sensor housings and their lenses, and the flex ribbon to the logic board. anchors: plug lens",
    line: "cameramodule cx cy k lab=0 lit=block|lenses|flex",
    demo: { line: "cameramodule 440 300 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "lenses" }, hold: 1.2 }, { set: { lit: "flex" }, hold: 1.2 }, { set: { lit: "block" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, K = window.K, T = window.TECH;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = ISO.mm(Pc), lab = o.lab === "1";
      const box = (x, y, z, tone, c) => T.box(P, x, y, z, tone, c);
      // the flex first (it runs on along +x, low), then the block and its bracket, then the housings far to near
      const flex = box([12, 24], [-2.6, 2.6], [1.2, 1.4], "mid", T.C.copper) + box([24, 31], [-3.6, 3.6], [1.2, 1.5], "mid", T.C.pcbDark) + box([24.5, 30.5], [-3.1, 3.1], [1.5, 2.4], "mid", T.C.dark);
      const block = box([-12.5, 12.5], [-6.5, 6.5], [0, 3.6], "mid", T.C.dark) + box([-12.5, 12.5], [-6.5, 6.5], [3.6, 4], "hi", T.C.steel);
      // each lens: a black housing, the barrel, the glass with a blue coating and its highlight, the barrel's rim
      const lens = (x, r) => T.cyl(P, x, 0, r + 1.2, 4, 1, "mid", T.C.black, 32) + T.cyl(P, x, 0, r, 5, 0.8, "hi", T.C.steel, 32) +
        `<path d="${K.ring(x, 0, r - 0.5, 5.82, P, 32)}" fill="#24384c" stroke="#101215" stroke-width=".5"/><path d="${K.ring(x, 0, (r - 0.5) * 0.55, 5.83, P, 24)}" fill="#3f6a92" stroke="#1f2226" stroke-width=".4"/>` +
        T.dot(P, [[x - r * 0.25, r * 0.2, 5.84]], 0.5, "hi");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -12.5, y: -6.5, w: 43.5, d: 13, r: 1 }, 0, 0.5, P)}"/><g data-name="flex">${flex}</g><g data-name="block">${block}</g>` +
        `<g data-name="lenses">${lens(-6, 4.6)}${lens(6, 3.8)}</g><g data-part="words">${lab ? T.word(P, [-12.5, 0, 6], "camera module", { anchor: "end", dx: -12 }) : ""}</g>`;
      g.anchors = { plug: [2.75, 0, 0.24], lens: [-0.6, 0, 0.58] };
      const w = ISO.writer(); let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "phone camera module · two cameras: wide (bigger lens) and ultra-wide · each lens focuses light onto its image sensor · 25 × 13 × 6 mm";
      B.light(w, g, lit);
      return g;
    },
  });
})();
