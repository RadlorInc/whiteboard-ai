// "towercooler cx cy k spin=0|1 lab=0 lit=base|pipes|fins|fan" — a PART (batch 6): a processor tower cooler standing on
// the processor, its origin the middle of its copper base's contact face, its fan toward the room (+y). The copper base
// with its steel mounting bar and two screws, four heat pipes bending up and out into a tower of thin horizontal
// aluminium fins (120 × 50 × 120 mm, a fin every 4 mm), the pipe ends showing through the top plate, and a 120 mm fan
// clipped on the front by two wire clips. spin=1 turns the fan (it pushes air through the fins toward −y). From
// computer.js (its processor cooler). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HX = 60, Y0 = -25, Y1 = 25, Z0 = 35, Z1 = 152, FY = 50, FC = [0, FY - 2, 94], FR = 57;
  const PIPES = [[-12, -45], [-4, -15], [4, 15], [12, 45]];
  ISO.add({
    name: "towercooler", title: "Processor tower cooler (part)", compare: null,
    about: "A processor tower cooler: copper base, heat pipes up into a tower of aluminium fins, a 120 mm fan clipped on the front; spin=1 turns the fan. anchors: fan top base",
    line: "towercooler cx cy k spin=0|1 lab=0 lit=base|pipes|fins|fan",
    demo: { line: "towercooler 480 440 22 spin=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1, lit: "fan" }, hold: 3 }, { set: { lit: "pipes" }, hold: 1.5 }, { set: { lit: "fins" }, hold: 1.4 }, { set: { spin: 0, lit: "base" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const X = [1, 0, 0], Z = [0, 0, 1];
      // base: copper block, the steel mounting bar across it with a screw at each end
      const base = T.box(Pm, [-20, 20], [-20, 20], [0, 7], "hi", T.C.copper) + T.box(Pm, [-42, 42], [-9, 9], [7, 11], "mid", T.C.steel) +
        [-36, 36].map((x) => T.cyl(Pm, x, 0, 3.6, 11, 2.5, "hi", T.C.steel, 14)).join("");
      // heat pipes: out of the base, bending up and out into the fins
      const pipes = PIPES.map(([a, b]) => B.cable(Pm, [[a, 0, 9], [a, 0, 14], [(a + b) / 2, 0, 24], [b, 0, 30], [b, 0, Z0 + 1]], 3, "#e2a985", "#6e3a1c")).join("");
      // the fin tower: one block whose visible side shows a fin edge every 4 mm, the top plate, the pipe ends
      const finLines = []; for (let z = Z0 + 4; z < Z1 - 1; z += 4) finLines.push(K.pathOf([K.iso([HX, Y0, z], Pm), K.iso([HX, Y1, z], Pm)]));
      const fins = T.box(Pm, [-HX, HX], [Y0, Y1], [Z0, Z1], "hi", T.C.alu) + T.L(finLines.join(""), { tone: "lo" }) + T.box(Pm, [-HX, HX], [Y0, Y1], [Z1, Z1 + 3], "mid", T.C.steel) +
        `<path d="${PIPES.map(([, b]) => K.ring(b, 0, 3, Z1 + 3.05, Pm, 16)).join("")}" fill="#e2a985" stroke="#6e3a1c" stroke-width=".6"/>`;
      // the fan on the front: its frame, bore, rotor (spins), hub, four screw holes; two wire clips onto the fins
      const holes = [[-52.5, Z0 + 7], [52.5, Z0 + 7], [-52.5, Z0 + 113], [52.5, Z0 + 113]];
      const fan = T.box(Pm, [-HX, HX], [Y1, FY], [Z0 - 1, Z0 + 119], "mid", T.C.dark) + `<path d="${holes.map(([x, z]) => B.circle(Pm, [x, FY + 0.05, z], X, Z, 2.2, 14)).join("")}" fill="#0c0d0f"/>` + B.bore(Pm, FC, X, Z, FR);
      const clip = (z) => `<path data-free d="${K.pathOf([[HX + 0.6, FY - 6, z], [HX + 0.6, Y1, z], [HX + 0.6, Y1 - 30, z + 2], [HX + 0.6, Y1 - 34, z - 2]].map((p) => K.iso(p, Pm)))}" fill="none" stroke="#9ca1a8" stroke-width="${(K.screenRise(1, Pm) * 2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: Y0, w: 2 * HX, d: FY - Y0, r: 3 }, 0, Z1, Pm)}"/><g data-name="base">${base}</g><g data-name="pipes">${pipes}</g><g data-name="fins">${fins}</g>` +
        `<g data-name="fan">${fan}<g data-part="rotor"></g>${B.hub(Pm, [FC[0], FY - 1, FC[2]], [0, 1, 0], 18, 1.4)}${clip(Z1 - 4)}${clip(Z0 + 4)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [HX, Y0, Z1 + 3], "fins", "#556", { anchor: "start", dx: 8 }) + LAB.word(Pm, lab, [-HX, FY, Z0 + 60], "fan", "#556", { anchor: "end", dx: -8 }) + LAB.word(Pm, lab, [45, 0, 26], "heat pipes", "#556", { anchor: "start", dx: 14 });
      g.anchors = { fan: [0, FY / 10, FC[2] / 10], top: [0, 0, (Z1 + 3) / 10], base: [0, 0, 0] };
      const el = LAB.parts(g), w = ISO.writer(), memo = {};
      const st = { spin: o.spin === "1", a: 0, lit: o.lit || "" };
      const draw = () => {
        const q = B.pose(st.a);
        w.rebuild(el.rotor, String(q), () => (memo[q] ||= B.rotor(Pm, FC, X, Z, FR - 1, B.angle(q))));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => { const go = st.spin && !ISO.still(); if (go) st.a += dt * 4; draw(); return go; };
      g.readout = () => `tower cooler · heat flows from the processor into the copper base, up the heat pipes into the fins · fan ${st.spin ? "blowing air through the fins" : "still"}`;
      draw();
      return g;
    },
  });
})();
