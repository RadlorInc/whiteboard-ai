// "atxpsu cx cy k spin=0|1 lab=0 lit=case|fan|socket|switch|cables" — a PART (batch 6): an ATX power supply standing on
// its feet, its origin the surface point under its middle, its back panel toward the room (+y). A black steel box
// 150 × 140 × 86 mm with folded seams and four screws on the back, a 120 mm fan under a wire grille on top, the back
// panel's honeycomb vent, the mains socket (three pins) and the rocker switch (I/O); a rating sticker on its side;
// the bundle of sleeved cables leaves the far end through a grommet and comes round the side to its plugs (24-pin
// board plug, 8-pin processor plug, a SATA plug). spin=1 turns the fan. From computer.js (its power supply).
// Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HX = 75, HY = 70, H = 86, FC = [0, -4, H + 0.05], FR = 58;
  ISO.add({
    name: "atxpsu", title: "ATX power supply (part)", compare: null,
    about: "An ATX power supply: black steel box, fan under a grille, mains socket and switch on the back, a bundle of cables to its plugs; spin=1 turns the fan. anchors: socket plug",
    line: "atxpsu cx cy k spin=0|1 lab=0 lit=case|fan|socket|switch|cables",
    demo: { line: "atxpsu 460 360 20 spin=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1, lit: "fan" }, hold: 3 }, { set: { lit: "socket" }, hold: 1.4 }, { set: { lit: "switch" }, hold: 1.2 }, { set: { spin: 0, lit: "cables" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
      const body = T.box(Pm, [-HX, HX], [-HY, HY], [3, H], "mid", T.C.dark) +
        K.lineSvg(K.pathOf([[-HX, HY, H - 6], [HX, HY, H - 6], [HX, -HY, H - 6]].map((p) => K.iso(p, Pm))), { tone: "faint" });
      const feet = [[-HX + 10, HY - 10], [HX - 10, HY - 10], [-HX + 10, -HY + 10], [HX - 10, -HY + 10]].map(([x, y]) => K.solidSvg(K.cylinder(x, y, 5, 0, 3, Pm, 14), { tone: "lo" })).join("");
      // the back panel: honeycomb vent, four screws, the mains socket and the switch
      const bp = (x, z) => K.iso([x, HY + 0.05, z], Pm);
      const vent = []; for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) vent.push(bp(-64 + c * 8 + (r % 2) * 4, 14 + r * 9));
      const screws = [[-HX + 6, 6], [HX - 6, 6], [-HX + 6, H - 10], [HX - 6, H - 10]].map(([x, z]) => B.circle(Pm, [x, HY + 0.06, z], X, Z, 2, 10)).join("");
      const back = `<path d="${K.pathOf([bp(-68, 9), bp(2, 9), bp(2, 73), bp(-68, 73)], true)}" fill="#24272c" stroke="#101215" stroke-width=".5"/>${T.D(vent, { size: 0.5, tone: "lo" })}<path d="${screws}" fill="#8d9096" stroke="#3c3f45" stroke-width=".4"/>`;
      const socket = `<path d="${K.pathOf([bp(14, 34), bp(42, 34), bp(42, 52), bp(36, 58), bp(20, 58), bp(14, 52)], true)}" fill="#14161a" stroke="#3a3e44" stroke-width=".6"/>` +
        `<path d="${[[21, 47], [28, 47], [35, 47]].map(([x, z]) => K.pathOf([bp(x - 1, z - 4), bp(x + 1, z - 4), bp(x + 1, z + 4), bp(x - 1, z + 4)], true)).join("")}" fill="#c9ccd1" stroke="#55595f" stroke-width=".3"/>`;
      const sw = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [50, 64], [HY, HY + 3], [36, 56], "mid")) +
        LAB.faceText(Pm, [57, HY + 3.1, 49], X, "I", 5, "#e8eaed") + LAB.faceText(Pm, [57, HY + 3.1, 39], X, "O", 5, "#e8eaed");
      // the rating sticker on the +x side
      const side = (y, z) => K.iso([HX + 0.05, y, z], Pm), sideText = (y, z, s, size) => LAB.faceText(Pm, [HX + 0.06, y, z], [0, -1, 0], B.say(s), size, "#2b2f35");
      const sticker = `<path d="${K.pathOf([side(40, 18), side(-40, 18), side(-40, 66), side(40, 66)], true)}" fill="#e4e6e9" stroke="#7d838b" stroke-width=".5"/>` +
        sideText(0, 52, "POWER SUPPLY", 7) + sideText(0, 40, "650 W", 10) + sideText(0, 27, "230 V ~ 50 Hz · ATX", 4.5);
      // the fan on top: bore, rotor (spins), hub, then the wire grille over it (rings and four spokes)
      const ring = (r) => B.circle(Pm, [FC[0], FC[1], H + 0.3], X, Y, r, 44);
      const grille = ring(FR) + ring(46) + ring(34) + ring(22) + [0.785, 2.356, 3.927, 5.498].map((a) => K.pathOf([K.iso(B.pt([FC[0], FC[1], H + 0.3], X, Y, a, 13), Pm), K.iso(B.pt([FC[0], FC[1], H + 0.3], X, Y, a, FR), Pm)])).join("");
      // the cables: from the grommet in the far end, round the +x side, to their plugs
      const run = (dy, dz) => [[30, -HY, 40 + dz], [32, -HY - 22, 30 + dz], [48, -HY - 38, 8 + dz], [100, -HY - 30, 6 + dz], [118 + dy, -10, 6 + dz], [122 + dy, 60, 6 + dz], [124 + dy, 92 + dy, 6 + dz]];
      const runs = [[0, 0, "#2b2e33"], [9, 1, "#2b2e33"], [18, 0, "#3a3e44"], [-9, 1, "#2b2e33"]].map(([dy, dz, c]) => ({ pts: run(dy, dz), c }));
      const cableSvg = (far) => runs.map(({ pts, c }) => B.cable(Pm, pts.filter((p) => (far ? p[0] <= 100 : p[0] >= 100)), 4.2, c)).join("");
      const plug = (x, y, w, d, h, c) => T.box(Pm, [x - w / 2, x + w / 2], [y, y + d], [1, h], "mid", c);
      const plugs = plug(124, 92, 24, 48, 18, T.C.white) + plug(133, 101, 16, 22, 14, T.C.dark) + plug(142, 110, 14, 26, 12, T.C.dark) + plug(115, 83, 10, 22, 9, T.C.dark);
      const grommet = T.cyl(Pm, 30, -HY, 9, 34, 12, "lo", ISO.T.rubber, 14);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY - 40, w: 2 * HX + 80, d: 2 * HY + 80, r: 10 }, 0, H, Pm)}"/><g data-name="cables">${grommet}${cableSvg(true)}</g>` +
        `<g data-name="case">${ISO.tinted(ISO.T.rubber, feet)}${body}${back}${sticker}</g><g data-name="socket">${socket}</g><g data-name="switch">${sw}</g>` +
        `<g data-name="fan">${B.bore(Pm, FC, X, Y, FR)}<g data-part="rotor"></g>${B.hub(Pm, FC, Z, 16, 0.2)}${T.L(grille, { tone: "mid", free: true })}</g>` +
        `<g data-name="cables">${cableSvg(false)}${plugs}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [-HX, HY, H], "power supply", "#556", { anchor: "end", dx: -8 }) + LAB.word(Pm, lab, [28, HY, 30], "mains socket", "#556", { dy: 24 });
      g.anchors = { socket: [2.8, HY / 10, 4.6], plug: [12.4, 14, 1.8] };
      const el = LAB.parts(g), w = ISO.writer(), memo = {};
      const st = { spin: o.spin === "1", a: 0, lit: o.lit || "" };
      const draw = () => {
        const q = B.pose(st.a);
        w.rebuild(el.rotor, String(q), () => (memo[q] ||= B.rotor(Pm, FC, X, Y, FR - 1, B.angle(q))));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => { const go = st.spin && !ISO.still(); if (go) st.a += dt * 3; draw(); return go; };
      g.readout = () => `650 W ATX power supply · mains in at the back, 12 V, 5 V and 3.3 V out on its cables · fan ${st.spin ? "spinning" : "still"}`;
      draw();
      return g;
    },
  });
})();
