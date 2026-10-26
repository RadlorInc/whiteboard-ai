// "fan40 cx cy k spin=0|1 lab=0 lit=frame|rotor|lead" — a PART (batch 6): a 40 mm server fan, 4 × 4 cm and 2.8 cm
// thick, standing on its edge with its intake face toward the room (+y); its origin is the surface point under its
// middle. A square plastic frame with a round venturi, a mounting hole in each corner, the seven-blade rotor on its hub
// (a blank sticker on the hub), and its power lead (three wires to a small plug) out of one corner. spin=1 turns the
// rotor (about 15 000 rpm is a blur; it is drawn at a readable 1.5 turns a second). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 2, HY = 1.4, ZC = 2, R = 1.85;
  ISO.add({
    name: "fan40", title: "40 mm server fan (part)", compare: null,
    about: "A 40 mm server fan: square frame with a corner hole each side, a seven-blade rotor that spins, and its power lead to a small plug. Origin: surface under its middle, intake toward the room. anchors: plug",
    line: "fan40 cx cy k spin=0|1 lab=0 lit=frame|rotor|lead",
    demo: { line: "fan40 470 380 50", script: [{ set: {}, hold: 1.5 }, { set: { lit: "rotor" }, hold: 1.4 }, { set: { spin: 0, lit: "lead" }, hold: 1.4 }, { set: { spin: 1, lit: "frame" }, hold: 1.4 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const FY = HY + 0.01, at = (x, z, dy = 0) => K.iso([x, FY + dy, z], P);
      const ring = (r, x0 = 0, z0 = ZC, n = 40) => K.pathOf(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return at(x0 + Math.cos(a) * r, z0 + Math.sin(a) * r); }), true);
      // the lead: three wires from the frame's +x top corner, down to a plug lying on the surface
      const wire = (dy, c) => `<path d="${K.pathOf([[HX + 0.01, 0.4 + dy, 3.6], [HX + 0.5, 0.4 + dy, 3.4], [HX + 1.1, 0.5 + dy, 1.6], [HX + 1.6, 0.6 + dy, 0.12], [HX + 2.6, 0.6 + dy, 0.12]].map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${(G.scaleOf(P) * 0.08).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      const plug = ISO.tinted(T.C.white, ISO.wbox(P, [HX + 2.6, HX + 3.4], [0.2, 1.2], [0, 0.55], "mid"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX + 3.4, d: 2 * HY, r: 0.3 }, 0, 0.02, P)}"/>` +
        `<g data-name="frame">${ISO.tinted(T.C.black, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.25 }, 0, 4, P, 3, 0.05), { tone: "mid" }))}` +
        `<path d="${ring(R + 0.08)}" fill="#141619" stroke="#0d0e10" stroke-width="0.6"/>` +
        `${[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => `<path d="${ring(0.17, sx * 1.6, ZC + sz * 1.6, 20)}" fill="#2a2d31" stroke="#0d0e10" stroke-width="0.4"/>`).join("")}</g>` +
        `<g data-name="rotor"><g transform="${T.mat(P, [0, FY + 0.02, ZC], [1, 0, 0], [0, 0, -1])}"><g data-part="spin">${B.rotor(R - 0.05, 0.7, 7)}</g></g></g>` +
        `<g data-name="lead">${wire(-0.15, "#e0463a")}${wire(0, "#1c1f23")}${wire(0.15, "#f0c020")}${plug}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = LAB.word(P, lab, [-HX, 0, 4.6], "40 mm fan", "#445", { anchor: "end" });
      g.anchors = { plug: [HX + 3, 0.7, 0.55] };
      const st = { spin: o.spin !== "0", a: 0, v: o.spin !== "0" ? 540 : 0 };
      let lit = o.lit || "";
      const draw = () => { w.attr(el.spin, "transform", `rotate(${(st.a % 360).toFixed(1)})`); LAB.light(w, g, lit); };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) lit = p.lit; draw(); };
      // the rotor spins up and runs down on an eased speed, never a snap
      g.update = (dt) => {
        st.v = ISO.follow(st.v, st.spin ? 540 : 0, dt, 0.5, ISO.still());
        if (!ISO.still()) st.a = (st.a + st.v * dt) % 360;
        draw();
        return st.v > 0.5 && !ISO.still();
      };
      g.readout = () => `40 mm fan · ${st.v > 1 ? "spinning, pulling air through from front to back" : "stopped"} · 4 × 4 × 2.8 cm`;
      draw();
      return g;
    },
  });
})();
