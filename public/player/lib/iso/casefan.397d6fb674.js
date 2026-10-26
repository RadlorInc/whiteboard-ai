// "casefan cx cy k spin=0|1 lab=0 lit=frame|rotor|hub" — a PART (batch 6): a 120 mm PC case fan standing on its edge,
// its origin the surface point under its middle, its intake face toward the room (+y). A square black frame 120 × 120
// × 25 mm: two flanges with four screw holes and the round shroud between them, four struts behind the rotor, a
// 7-blade rotor and the hub with a plain round sticker; its lead leaves one corner. spin=1 turns the rotor (shown
// slower than its real ~1200 rpm). Reused from computer.js (its rear and cooler fans). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const R = 60, D = 12.5, C = [0, D, 60], U = [1, 0, 0], V = [0, 0, 1];
  ISO.add({
    name: "casefan", title: "Case fan 120 mm (part)", compare: null,
    about: "A 120 mm PC case fan: square frame with four screw holes, a 7-blade rotor on a hub with a sticker; spin=1 turns the rotor. anchors: face top",
    line: "casefan cx cy k spin=0|1 lab=0 lit=frame|rotor|hub",
    demo: { line: "casefan 480 420 24 spin=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1, lit: "rotor" }, hold: 3 }, { set: { lit: "hub" }, hold: 1.5 }, { set: { spin: 0, lit: "frame" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const box = (x, y, z, tone = "mid") => T.box(Pm, x, y, z, tone, T.C.dark);
      // frame: back flange, the shroud ring between, front flange with its bore and holes, struts in the bore
      const holes = [[-52.5, 7.5], [52.5, 7.5], [-52.5, 112.5], [52.5, 112.5]];
      const frame = [`<path class="iso-halo" d="${K.haloOf({ x: -R, y: -D, w: 2 * R, d: 2 * D, r: 2 }, 0, 2 * R, Pm)}"/>`,
        box([-R, R], [-D, -D + 4], [0, 120]), ISO.tinted(T.C.dark, K.solidSvg(window.G.disc(-D + 4, D - 4, R - 0.5, window.G.frameAlong([0, 0, 60], [0, 1, 0]), Pm), { tone: "mid" })),
        box([-R, R], [D - 4, D], [0, 120]),
        `<path d="${holes.map(([x, z]) => B.circle(Pm, [x, D + 0.05, z], U, V, 2.2, 16)).join("")}" fill="#0c0d0f" stroke="#55595f" stroke-width=".4"/>`,
        `<path d="${holes.map(([x, z]) => B.circle(Pm, [x, D + 0.05, z], U, V, 4.2, 16)).join("")}" fill="none" stroke="#5a6067" stroke-width=".4"/>`];
      const struts = [0.6, 2.17, 3.74, 5.31].map((a) => K.pathOf([K.iso(B.pt([0, D - 3.1, 60], U, V, a, 17), Pm), K.iso(B.pt([0, D - 3.1, 60], U, V, a, R - 2.6), Pm)])).join("");
      // the lead: out of the far top corner, down the frame's side, off along the surface
      const lead = B.cable(Pm, [[R - 4, 0, 118], [R + 3, 0, 116], [R + 4, 0, 60], [R + 6, 2, 3], [R + 40, 10, 1.5]], 1.6);
      g.innerHTML = `${lead}<g data-name="frame">${frame.join("")}</g><g data-name="rotor">${B.bore(Pm, [0, D - 3.2, 60], U, V, R - 2.6)}${T.L(struts, { tone: "lo", free: true })}<g data-part="rotor"></g></g>` +
        `<g data-name="hub">${B.hub(Pm, [0, D - 2, 60], [0, 1, 0], 18, 2.2)}</g><g data-part="words"></g>`;
      g.anchors = { face: [0, D / 10, 6], top: [0, 0, 12] };
      const el = LAB.parts(g), w = ISO.writer(), memo = {};
      const st = { spin: o.spin === "1", a: 0, lit: o.lit || "" };
      if (lab) el.words.innerHTML = LAB.word(Pm, lab, [R, D, 120], "case fan", "#556", { anchor: "start", dx: 6 });
      const draw = () => {
        const q = B.pose(st.a);
        w.rebuild(el.rotor, String(q), () => (memo[q] ||= B.rotor(Pm, [0, D - 3, 60], U, V, R - 3, B.angle(q))));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => { const go = st.spin && !ISO.still(); if (go) st.a += dt * 4; draw(); return go; };
      g.readout = () => `120 mm case fan · ${st.spin ? "spinning: pulls air in through the front" : "stopped"}`;
      draw();
      return g;
    },
  });
})();
