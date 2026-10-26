// "gpucard cx cy k aim=down|up spin=0|1 lab=0 lit=shroud|fans|backplate|bracket|fingers" — a PART (batch 6): a graphics
// card lying flat, its origin its middle on the surface. A dark shroud 260 × 112 mm with three fans facing down (as it
// sits in a tower), the green board above it, a steel backplate with vents and screws on top, the gold edge connector
// (PCIe x16 fingers) on the board's tab toward −y, and the steel bracket at the +x end with three display ports, one
// HDMI port and a vent, its screw tab bent over. aim=up lays it on its back so the fans face up and show. spin=1 turns
// the fans. From computer.js (its graphics card). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const X0 = -133, X1 = 127, HY = 56, FANS = [-86, -2, 82], FR = 37;
  ISO.add({
    name: "gpucard", title: "Graphics card (part)", compare: null,
    about: "A graphics card: shroud with three fans facing down, the metal backplate on top, the gold edge connector and the steel bracket with display ports; aim=up shows the fans; spin=1 turns them. anchors: fingers bracket",
    line: "gpucard cx cy k aim=down|up spin=0|1 lab=0 lit=shroud|fans|backplate|bracket|fingers",
    demo: { line: "gpucard 470 330 20 aim=up spin=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1, lit: "fans" }, hold: 3 }, { set: { lit: "fingers" }, hold: 1.4 }, { set: { lit: "bracket" }, hold: 1.4 }, { set: { spin: 0, lit: "shroud" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", up = o.aim === "up";
      const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
      // the card's layers bottom to top (aim=down): shroud 0–26, board 26–28, backplate 28–31; aim=up mirrors them
      const zz = ([a, b]) => (up ? [31 - b, 31 - a] : [a, b]), SH = zz([0, 26]), PCB = zz([26, 28]), BP = zz([28, 31]);
      const box = (x, y, z, c, tone = "mid") => T.box(Pm, x, y, z, tone, c);
      const shroud = box([X0, X1 - 4], [-HY, HY], SH, T.C.dark) + K.lineSvg(K.pathOf([[X0, HY, (SH[0] + SH[1]) / 2], [X1 - 4, HY, (SH[0] + SH[1]) / 2]].map((p) => K.iso([p[0], p[1] + 0.05, p[2]], Pm))), { tone: "faint" });
      const board = box([X0, X1], [-HY - 4, HY], PCB, T.C.pcbDark) + box([-24, 66], [-HY - 12, -HY - 4], PCB, T.C.pcbDark);
      // gold fingers on the tab's top face, a key gap after the first eleven
      const zt = PCB[1] + 0.05, fingers = []; for (let i = 0; i < 40; i++) { const x = -22 + i * 2.2 + (i > 10 ? 2.4 : 0); fingers.push(K.pathOf([K.iso([x, -HY - 11.5, zt], Pm), K.iso([x, -HY - 5, zt], Pm)])); }
      const gold = `<path data-free d="${fingers.join("")}" stroke="#d4ad4e" stroke-width="${(K.screenRise(1, Pm) * 1.2).toFixed(2)}"/>`;
      // backplate: plate, vent slots near the bracket, screws round the processor's square
      const bz = up ? BP[0] - 0.05 : BP[1] + 0.05, top = (x, y) => K.iso([x, y, bz], Pm);
      const slots = Array.from({ length: 6 }, (_, i) => K.pathOf([top(78 + i * 7, -36), top(82 + i * 7, -36), top(82 + i * 7, 36), top(78 + i * 7, 36)], true)).join("");
      const screws = [[-36, -26], [-4, -26], [-36, 6], [-4, 6]].map(([x, y]) => B.circle(Pm, [x, y, bz], X, Y, 2, 10)).join("");
      const back = box([X0, X1 - 4], [-HY + 2, HY - 2], BP, T.C.steel) + (up ? "" : `<path d="${slots}" fill="#2a2d31"/><path d="${screws}" fill="#6a6e75" stroke="#3c3f45" stroke-width=".4"/>`);
      // the fans on the shroud's face (seen with aim=up): bores, rotors, hubs
      const fz = up ? SH[1] + 0.05 : SH[0] - 0.05, fanBase = up ? FANS.map((x) => B.bore(Pm, [x, 0, fz], X, Y, FR)).join("") : "";
      const hubs = up ? FANS.map((x) => B.hub(Pm, [x, 0, fz], Z, 13, 0.6)).join("") : "";
      // the bracket at +x: steel plate with ports, a vent, its screw tab bent over toward +x
      const BX = [X1, X1 + 2], bf = (y, z) => K.iso([X1 + 2.05, y, z], Pm), rect = (y0, y1, z0, z1) => K.pathOf([bf(y0, z0), bf(y1, z0), bf(y1, z1), bf(y0, z1)], true);
      const ports = [-46, -26, -6].map((y) => rect(y, y + 15, 6, 12)).join("") + rect(14, 30, 6, 12);
      const vent = Array.from({ length: 5 }, (_, i) => rect(-50 + i * 20, -36 + i * 20, 20, 34)).join("");
      const bracket = box(BX, [-HY - 6, HY + 4], [0, 40], T.C.steel) + box([X1 + 2, X1 + 10], [HY + 4, HY + 12], [38, 40], T.C.steel) +
        `<path d="${ports}" fill="#14161a" stroke="#3a3e44" stroke-width=".5"/><path d="${vent}" fill="#3a3e44"/>`;
      const fansG = `<g data-name="fans">${fanBase}<g data-part="rotor"></g>${hubs}</g>`;
      // drawn bottom to top: aim=down shroud, board, backplate; aim=up backplate, board, shroud and fans
      const layers = up ? `<g data-name="backplate">${back}</g>${board}<g data-name="fingers">${gold}</g><g data-name="shroud">${shroud}</g>${fansG}`
        : `${fansG}<g data-name="shroud">${shroud}</g>${board}<g data-name="fingers">${gold}</g><g data-name="backplate">${back}</g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0, y: -HY - 12, w: X1 - X0 + 10, d: 2 * HY + 24, r: 4 }, 0, 31, Pm)}"/>${layers}<g data-name="bracket">${bracket}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [20, -HY - 12, PCB[1]], "edge connector", "#556", { anchor: "start", dx: 10, dy: -8 }) + LAB.word(Pm, lab, [X1 + 2, HY, 40], "bracket", "#556", { anchor: "start", dx: 8 });
      g.anchors = { fingers: [2.1, -(HY + 12) / 10, PCB[1] / 10], bracket: [(X1 + 2) / 10, 0, 2] };
      const el = LAB.parts(g), w = ISO.writer(), memo = {};
      const st = { spin: o.spin === "1", a: 0, lit: o.lit || "" };
      const draw = () => {
        if (up) { const q = B.pose(st.a); w.rebuild(el.rotor, String(q), () => (memo[q] ||= FANS.map((x, i) => B.rotor(Pm, [x, 0, fz], X, Y, FR - 1, B.angle(q) + i * 0.3)).join(""))); }
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => { const go = st.spin && !ISO.still(); if (go) st.a += dt * 4; draw(); return go && up; };
      g.readout = () => `graphics card · three fans ${st.spin ? "spinning, blowing onto the heatsink" : "still"}${up ? "" : " (facing down)"} · PCIe x16 edge connector · 3 display ports + HDMI`;
      draw();
      return g;
    },
  });
})();
