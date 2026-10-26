// "atxboard cx cy k lab=0 lit=board|socket|memory|slot|chipset|power" — a PART (batch 6): an ATX motherboard lying flat
// on its brass standoffs, its origin its middle on the surface, the processor's end toward +x and the rear ports along
// −y (as it sits in a tower, top to the right). A 305 × 244 mm board, nine mounting screws; the processor socket with
// its steel load frame and lever, two heatsinks over the power stages beside it, the 8-pin processor power plug, four
// memory slots with their latches, the steel-armoured graphics (PCIe x16) slot with a second x16 and an x1 slot, the
// chipset heatsink, the coin battery, four SATA ports and the big 24-pin power socket on the front edge, the rear port
// cover. From computer.js (its motherboard). Static. Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HX = 152.5, HY = 122, ZB = 6, ZT = 7.6;
  ISO.add({
    name: "atxboard", title: "ATX motherboard (part)", compare: null,
    about: "An ATX motherboard on standoffs: processor socket, four memory slots, graphics slot, chipset heatsink and the big 24-pin power socket; static. anchors: socket ram pcie power",
    line: "atxboard cx cy k lab=0 lit=board|socket|memory|slot|chipset|power",
    demo: { line: "atxboard 480 300 15 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "socket" }, hold: 1.3 }, { set: { lit: "memory" }, hold: 1.3 }, { set: { lit: "slot" }, hold: 1.3 }, { set: { lit: "chipset" }, hold: 1.2 }, { set: { lit: "power" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const X = [1, 0, 0], Y = [0, 1, 0], box = (x, y, z, c, tone = "mid") => T.box(Pm, x, y, [ZT + z[0], ZT + z[1]], tone, c);
      const holes = [];
      for (const x of [-142, -22, 142]) for (const y of [-112, 12, 112]) holes.push([x, y]);
      const standoffs = holes.map(([x, y]) => T.cyl(Pm, x, y, 3.2, 0, ZB, "mid", ISO.T.brass, 6)).join("");
      const board = box([-HX, HX], [-HY, HY], [-1.6, 0], T.C.pcbDark) + holes.map(([x, y]) => `<path d="${B.circle(Pm, [x, y, ZT + 0.05], X, Y, 4.2, 14)}" fill="#c9a85a" stroke="#6b5114" stroke-width=".4"/><path d="${B.circle(Pm, [x, y, ZT + 0.1], X, Y, 2.4, 12)}" fill="#a2a5ab" stroke="#3c3f45" stroke-width=".4"/>`).join("") +
        `<path data-free d="${[[-60, -60, 30, -60], [-60, -52, 26, -52], [-120, 80, -40, 80], [-120, 86, -50, 86], [90, 20, 140, 20]].map(([x0, y0, x1, y1]) => K.pathOf([K.iso([x0, y0, ZT + 0.03], Pm), K.iso([x1, y1, ZT + 0.03], Pm)])).join("")}" stroke="#4c7f45" stroke-width=".6"/>`;
      const parts = [];
      const add = (name, x, y, svg) => parts.push({ name, d: K.depthOf([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, 0], Pm), svg });
      // rear port cover and the heatsinks over the power stages (L round the socket), the 8-pin plug
      add("board", [-30, 118], [-122, -102], box([-30, 118], [-122, -102], [0, 36], T.C.dark));
      add("board", [18, 100], [-98, -80], box([18, 100], [-98, -80], [0, 24], T.C.alu, "hi"));
      add("board", [96, 116], [-78, 12], box([96, 116], [-78, 12], [0, 24], T.C.alu, "hi"));
      add("power", [128, 146], [-112, -94], box([128, 146], [-112, -94], [0, 13], T.C.black));
      // the socket: steel load frame round a dark pin field, its lever along +x
      const sockTop = ZT + 5.05, pins = [];
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) pins.push(K.iso([44 + i * 4, -34 + j * 3.6, ZT + 3.05], Pm));
      add("socket", [36, 84], [-44, 4], box([36, 84], [-44, 4], [0, 3], T.C.dark) + T.D(pins, { size: 0.32, tone: "lo" }) +
        box([36, 84], [-44, -38], [3, 5], T.C.steel) + box([36, 41], [-38, -2], [3, 5], T.C.steel) + box([79, 84], [-38, -2], [3, 5], T.C.steel) + box([36, 84], [-2, 4], [3, 5], T.C.steel) +
        box([86, 88.5], [-44, 6], [2, 4.5], T.C.steel) + box([86, 92], [6, 8.5], [2, 4.5], T.C.steel));
      // four memory slots with latches at both ends
      [30, 42, 54, 66].forEach((y, i) => add("memory", [-6, 130], [y, y + 6], box([-2, 126], [y, y + 6], [0, 7], i % 2 ? T.C.dark : T.C.white) + box([-6, -2], [y - 0.5, y + 6.5], [0, 10], T.C.white) + box([126, 130], [y - 0.5, y + 6.5], [0, 10], T.C.white)));
      // the 24-pin power socket on the front edge, its pin holes on top
      const holes24 = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) holes24.push(K.iso([24 + i * 4.2, 106 + j * 5, ZT + 16.05], Pm));
      add("power", [20, 74], [102, 118], box([20, 74], [102, 118], [0, 16], T.C.black) + T.D(holes24, { size: 0.42, tone: "lo" }));
      // the expansion slots (toward −x): armoured x16 for the graphics card, a plain x16, an x1
      add("slot", [-22, -14.5], [-112, -23], box([-22, -14.5], [-112, -23], [0, 11], T.C.steel, "hi") + box([-22, -14.5], [-22, -16], [0, 12], T.C.white));
      add("slot", [-82, -74.5], [-112, -23], box([-82, -74.5], [-112, -23], [0, 11], T.C.dark));
      add("slot", [-52, -44.5], [-112, -87], box([-52, -44.5], [-112, -87], [0, 11], T.C.dark));
      // the chipset heatsink with its fins, the coin battery, four SATA ports
      const fins = [24, 32, 40, 48, 56].map((y) => K.pathOf([K.iso([-80, y, ZT + 12.05], Pm), K.iso([-35, y, ZT + 12.05], Pm)])).join("");
      add("chipset", [-80, -35], [20, 65], box([-80, -35], [20, 65], [0, 12], T.C.alu, "hi") + T.L(fins, { tone: "lo", free: true }));
      add("board", [-120, -100], [-50, -30], T.cyl(Pm, -110, -40, 10, ZT, 3.2, "hi", T.C.steel, 24));
      [-132, -116, -100, -84].forEach((x) => add("board", [x, x + 12], [104, 118], box([x, x + 12], [104, 118], [0, 7], T.C.black)));
      parts.sort((a, b) => a.d - b.d);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 2 }, 0, ZT, Pm)}"/><g data-name="board">${standoffs}${board}</g>` +
        parts.map((p) => `<g data-name="${p.name}">${p.svg}</g>`).join("") + `<g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = [[[60, -20, sockTop], "processor socket", "start", 50], [[130, 48, ZT + 10], "memory", "start", 8], [[-18, -30, ZT + 11], "graphics slot", "end", -10], [[-58, 64, ZT + 12], "chipset", "end", -14], [[74, 118, ZT + 16], "24-pin power", "start", 8]]
        .map(([p, s, a, dx]) => LAB.word(Pm, lab, p, s, "#556", { anchor: a, dx })).join("");
      g.anchors = { socket: [6, -2, sockTop / 10], ram: [6.2, 4.8, (ZT + 7) / 10], pcie: [-1.8, -6.7, (ZT + 11) / 10], power: [4.7, 11.8, (ZT + 8) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "ATX motherboard · 30.5 × 24.4 cm · processor socket, 4 memory slots, graphics slot, chipset, 24-pin power";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
