// "laptopboard cx cy k lab=0 lit=board|cpu|memory|ssd|ports" — a PART (PARTS.md, batch 6): the mainboard of
// laptop.js on its own, lying flat, its origin the surface point under its middle. A green 1.2 mm board 25 × 9 cm
// cut round the battery (a notch in its front edge), six gold-ringed screw holes; the processor (dark substrate and
// its shiny die) in the middle of the back strip, four memory chips beside it, the power stage's row of inductors;
// on the right wing an M.2 storage stick (2242: controller and memory chip, gold fingers in its black socket, a
// screw at its end); on the left wing two USB-C ports and the headphone socket at the edge, the battery and fan
// connectors (white). 25 × 9 × 0.3 cm. Static. Built in mm (ISO.mm); anchors in cm: cpu (the die's top), ssd.
(() => {
  const K = window.K;
  const HX = 125, HY = 45, BZ = 1.2, NX = 45, NY = -5;
  const OUT = [[-HX, -HY], [HX, -HY], [HX, HY], [NX, HY], [NX, NY], [-NX, NY], [-NX, HY], [-HX, HY]];
  ISO.add({
    name: "laptopboard", title: "Laptop mainboard (part)", compare: null,
    about: "A laptop mainboard lying flat: a green board cut round the battery, with the processor, memory chips, the power stage and an M.2 storage stick, and the ports along its edge. anchors: cpu ssd",
    line: "laptopboard cx cy k lab=0 lit=board|cpu|memory|ssd|ports",
    demo: { line: "laptopboard 480 280 28 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "cpu" }, hold: 1.2 }, { set: { lit: "memory" }, hold: 1.2 }, { set: { lit: "ssd" }, hold: 1.2 }, { set: { lit: "ports" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const box = (x, y, z, c, tone = "mid") => T.box(Pm, x, y, z, tone, c), z1 = BZ;
      // the board and its screw holes (a gold pad with the dark hole in it)
      const board = [ISO.tinted(T.C.pcb, T.S(K.extrude(OUT, 0, BZ, Pm, { convex: false }), { tone: "mid" }))];
      for (const [x, y] of [[-118, -38], [118, -38], [-118, 38], [118, 38], [-52, 38], [52, 38]]) board.push(`<path d="${K.ring(x, y, 3, z1 + 0.02, Pm, 18)}" fill="#e0bf66" stroke="#6b4f0e" stroke-width=".4"/><path d="${K.ring(x, y, 1.6, z1 + 0.03, Pm, 14)}" fill="#24282d"/>`);
      // a few rows of tiny parts (resistors and capacitors) round the processor
      for (const [x0, y0, nx] of [[-40, -8, 10], [16, -8, 8], [-14, -44, 10]]) for (let i = 0; i < nx; i++) board.push(box([x0 + i * 2.6, x0 + i * 2.6 + 1.6], [y0, y0 + 0.9], [z1, z1 + 0.5], i % 3 ? T.C.paper : T.C.chip));
      // the power stage: four inductors (grey blocks) and their driver chips on the left of the processor
      const vrm = [];
      for (let i = 0; i < 4; i++) vrm.push(box([-84 + i * 8, -78 + i * 8], [-32, -26], [z1, z1 + 2.6], T.C.magnet), box([-83 + i * 8, -79 + i * 8], [-22, -18], [z1, z1 + 0.8], T.C.chip));
      board.push(...vrm);
      // the connectors: battery (white, near the notch) and fan (small white), on the left wing
      board.push(box([-74, -56], [18, 24], [z1, z1 + 3], T.C.white), box([-73, -57], [19.5, 22.5], [z1 + 3, z1 + 3.2], T.C.gold, "hi"), box([-100, -92], [-6, -2], [z1, z1 + 2.2], T.C.white));
      // the processor: substrate, die; memory chips either side
      const cpu = box([-15, 15], [-40, -10], [z1, z1 + 1], T.C.pcbDark) + box([-9, 9], [-31, -19], [z1 + 1, z1 + 1.8], T.C.chip, "hi") + T.D([[-12, -37], [12, -37], [-12, -13], [12, -13]].map(([x, y]) => K.iso([x, y, z1 + 1.01], Pm)), { size: 0.35, tone: "lo" });
      const memory = [-34, 20].map((x) => box([x, x + 14], [-41, -29], [z1, z1 + 1], T.C.chip) + box([x, x + 14], [-25, -13], [z1, z1 + 1], T.C.chip)).join("");
      // the M.2 stick: socket, the card raised on it with its chips and gold fingers, the screw on its standoff
      const MX = [68, 112], MY = [6, 28], MZ = z1 + 1.6;
      const ssd = [box([62, 68], [MY[0] - 1, MY[1] + 1], [z1, z1 + 3.4], T.C.black), T.cyl(Pm, 114, (MY[0] + MY[1]) / 2, 2.6, z1, MZ - z1, "mid", T.C.gold, 16)];
      ssd.push(box(MX, MY, [MZ, MZ + 0.8], T.C.pcbDark), box([65, 68], [MY[0] + 1, MY[1] - 1], [MZ, MZ + 0.82], T.C.gold, "hi"));
      ssd.push(box([72, 84], [10, 24], [MZ + 0.8, MZ + 1.8], T.C.chip), box([88, 106], [9, 25], [MZ + 0.8, MZ + 2], T.C.chip));
      ssd.push(T.cyl(Pm, 114, (MY[0] + MY[1]) / 2, 2.4, MZ + 0.8, 1, "hi", T.C.steel, 16));
      ssd.push(T.flat(Pm, [97, 17, MZ + 2.02], [1, 0, 0], [0, 1, 0], T.text(0, 1, "NVMe", 3.4, "#c9ccd1")));
      // the ports at the left edge, poking just past it: two USB-C (rounded slots) and the round headphone socket
      const ports = [-30, -16].map((y) => box([-HX - 1.2, -HX + 7], [y, y + 9], [z1, z1 + 3.2], T.C.steel) + T.quad(Pm, [[-HX - 1.22, y + 1.5, z1 + 0.9], [-HX - 1.22, y + 7.5, z1 + 0.9], [-HX - 1.22, y + 7.5, z1 + 2.3], [-HX - 1.22, y + 1.5, z1 + 2.3]], "#1f2226")).join("") +
        T.cyl(Pm, -HX + 5, 8, 3.2, z1, 5, "mid", T.C.black, 18);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 2, y: -HY - 2, w: 2 * HX + 4, d: 2 * HY + 4, r: 3 }, 0, 5, Pm)}"/>` +
        `<g data-name="board">${board.join("")}</g><g data-name="ports">${ports}</g><g data-name="memory">${memory}</g><g data-name="cpu">${cpu}</g><g data-name="ssd">${ssd.join("")}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = T.word(Pm, [0, -40, z1 + 1.8], "processor", { dy: -16 }) + T.word(Pm, [34, -41, z1 + 1], "memory", { anchor: "start", dx: 6, dy: -12 }) +
        T.word(Pm, [112, 28, MZ], "M.2 storage", { anchor: "start", dx: 8, dy: 10 }) + T.word(Pm, [-HX, -16, z1], "USB-C ports", { anchor: "end", dx: -8 }) + T.word(Pm, [0, NY, 0], "cut round the battery", { dy: 22 });
      g.anchors = { cpu: [0, -2.5, (z1 + 1.8) / 10], ssd: [9, 1.7, (MZ + 2) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "laptop mainboard · processor (up to 15 W), 16 GB memory in four chips, 512 GB M.2 storage · cut round the battery";
      B.light(w, g, lit);
      return g;
    },
  });
})();
