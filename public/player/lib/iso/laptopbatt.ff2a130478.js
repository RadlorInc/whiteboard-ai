// "laptopbatt cx cy k lab=0 lit=cells|tape|board|flex" — a PART (PARTS.md, batch 6): one laptop battery pack as
// laptop.js has two of, lying flat, its origin the surface point under its middle. Three flat lithium-polymer pouch
// cells (38 × 66 × 5.4 mm each) side by side in series, shrink-wrapped in blue film on a backing sheet, held by two
// strips of amber tape across them, a white label on the middle cell; along the back edge the protection board (a
// green strip with its chips and the three cell tabs welded on), and from its right-hand end the amber flex cable
// lying on the surface to a small board-to-board connector (anchor plug, its top). 12 × 7 × 0.6 cm. Static. Built in
// mm (ISO.mm); the anchor in cm. Cells from laptop.js.
(() => {
  const K = window.K;
  const CW = 38, GAP = 2, CD = 66, CH = 5.4, HX = (3 * CW + 2 * GAP) / 2, Y0 = -31, PCB = [-38, -32];
  const FILM = ISO.tint("#c9d8ee", ["#4f6f9e", "#5f7fae", "#7391bd", "#88a4cb"], "#1d3355");
  const TAPE = ISO.tint("#f6d68c", ["#c1902c", "#cd9f40", "#d9b057", "#e3c070"], "#6b4a0c");
  ISO.add({
    name: "laptopbatt", title: "Laptop battery pack (part)", compare: null,
    about: "A laptop battery pack lying flat: three flat lithium cells side by side in blue shrink wrap with amber tape, the protection board along one edge and the flex cable to its connector. anchors: plug",
    line: "laptopbatt cx cy k lab=0 lit=cells|tape|board|flex",
    demo: { line: "laptopbatt 470 290 45 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "cells" }, hold: 1.2 }, { set: { lit: "board" }, hold: 1.2 }, { set: { lit: "flex" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const z0 = 0.3, zt = z0 + CH, plan = { x: -HX - 1, y: -35, w: 2 * HX + 2, d: 70, r: 2 };
      // backing sheet, then the three cells far (−x) to near, each with its pouch seal pressed round the top
      const cells = [T.slab(Pm, plan, 0, z0, "lo", FILM, 3)];
      for (let i = 0; i < 3; i++) {
        const x0 = -HX + i * (CW + GAP), c = { x: x0, y: Y0, w: CW, d: CD, r: 2.5 };
        cells.push(T.slab(Pm, c, z0, CH, "mid", FILM, 4, 0.8, T.L(K.planOutline(K.insetPlan(c, 2.2), zt + 0.01, Pm, 3), { tone: "faint" })));
      }
      // the label on the middle cell, printed upright for someone in front of the pack
      const label = T.quad(Pm, [[-15, -15, zt + 0.02], [15, -15, zt + 0.02], [15, 15, zt + 0.02], [-15, 15, zt + 0.02]], "#f7f7f4", "#6a6f78", 0.5) +
        T.flat(Pm, [0, 0, zt + 0.03], [1, 0, 0], [0, 1, 0], T.text(0, -8, "Li-ion", 5.2, "#24344d") + T.text(0, -2, "11.4 V", 4.2, "#24344d") + T.text(0, 4, "4.4 Ah · 50 Wh", 3, "#4a5568", "middle", 600) + T.text(0, 10, "3S1P", 3.2, "#4a5568", "middle", 600));
      // two strips of tape across all three cells, wrapping down over the outer edges
      const tape = [-27, 18].map((y) => T.box(Pm, [-HX - 0.4, HX + 0.4], [y, y + 9], [zt, zt + 0.15], "hi", TAPE) + T.box(Pm, [HX, HX + 0.4], [y, y + 9], [z0, zt], "mid", TAPE)).join("");
      // the protection board along the back edge: green strip, the cell tabs welded to it, two chips and a fuse
      const board = [T.box(Pm, [-HX, HX], PCB, [z0, z0 + 1.6], "mid", T.C.pcb)];
      for (let i = 0; i < 4; i++) { const x = -HX + 3 + i * (CW + GAP) - (i === 3 ? 6 : 0); board.push(T.box(Pm, [x, x + 6], [-34, Y0 + 3], [z0 + 1.6, z0 + 1.9], "hi", T.C.steel)); }
      board.push(T.box(Pm, [-12, -4], [-37, -33], [z0 + 1.6, z0 + 2.6], "mid", T.C.chip), T.box(Pm, [4, 10], [-37, -33], [z0 + 1.6, z0 + 2.4], "mid", T.C.chip), T.box(Pm, [22, 26], [-36.5, -33.5], [z0 + 1.6, z0 + 2.4], "mid", T.C.black));
      // the flex: a flat amber ribbon off the board's right end, lying on the surface, to the connector
      const FX = [HX - 6, HX + 22], flex = T.box(Pm, [FX[0], FX[1]], [-37, -31], [0, 0.25], "hi", TAPE) + T.box(Pm, [FX[1], FX[1] + 9], [-38.5, -29.5], [0, 2.6], "mid", T.C.dark) +
        T.box(Pm, [FX[1] + 1.5, FX[1] + 7.5], [-37, -31], [2.6, 2.8], "hi", T.C.gold);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 2, y: -40, w: 2 * HX + 36, d: 76, r: 3 }, 0, zt, Pm)}"/>` +
        `<g data-name="board">${board.join("")}</g><g data-name="flex">${flex}</g><g data-name="cells">${cells.join("")}${label}</g><g data-name="tape">${tape}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = T.word(Pm, [HX, 30, zt], "three lithium cells", { anchor: "start", dx: 8 }) + T.word(Pm, [FX[1] + 9, -34, 2.6], "connector", { anchor: "start", dx: 6 }) + T.word(Pm, [-HX, -35, 2], "protection board", { anchor: "end", dx: -6 });
      g.anchors = { plug: [(FX[1] + 4.5) / 10, -3.4, 0.28] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "laptop battery pack · 3 lithium cells in series, 3.8 V each = 11.4 V · 4.4 Ah, about 50 Wh";
      B.light(w, g, lit);
      return g;
    },
  });
})();
