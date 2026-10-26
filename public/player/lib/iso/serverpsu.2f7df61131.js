// "serverpsu cx cy k spin=0|1 lab=0 lit=case|handle|fan|socket" — a PART (batch 6): a hot-swap server power supply, a
// long slim module 8.6 cm wide, 20 cm long, 4 cm tall, lying on its base with its back end (the end you see in a
// server's rear) toward the room (+y); its origin is the surface point under its middle. A steel case with vent slots,
// a blank label on top, the card-edge connector at its far end, and on the near end a fan behind a round wire grille,
// the mains socket with its three pins, a status light, a pull handle and the release latch. spin=1 turns the fan
// (drawn at a readable speed). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 4.3, HY = 10, H = 4, FX = -1.6, FZ = 2, FR = 1.55;
  ISO.add({
    name: "serverpsu", title: "Server power supply (part)", compare: null,
    about: "A hot-swap server power supply: a long slim steel module with a pull handle, a fan behind a round grille that spins, a mains socket and a status light on its near end. Origin: surface under its middle. anchors: socket",
    line: "serverpsu cx cy k spin=0|1 lab=0 lit=case|handle|fan|socket",
    demo: { line: "serverpsu 470 330 22", script: [{ set: {}, hold: 1.5 }, { set: { lit: "fan" }, hold: 1.4 }, { set: { lit: "socket" }, hold: 1.2 }, { set: { lit: "handle", spin: 0 }, hold: 1.4 }, { set: { lit: "", spin: 1 }, hold: 1.4 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const FY = HY + 0.01, at = (x, z, dy = 0) => K.iso([x, FY + dy, z], P), quad = (x0, x1, z0, z1, dy = 0) => K.pathOf([at(x0, z0, dy), at(x1, z0, dy), at(x1, z1, dy), at(x0, z1, dy)], true);
      const ring = (r, x0 = FX, z0 = FZ, n = 40, dy = 0) => K.pathOf(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return at(x0 + Math.cos(a) * r, z0 + Math.sin(a) * r, dy); }), true);
      const top = (x0, x1, y0, y1) => K.pathOf([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => K.iso([x, y, H + 0.01], P)), true);
      // the case: body, vent slots on top near the fan end, a blank label, the gold card edge at the far end
      const caseSvg = ISO.tinted(T.C.pcb, ISO.wbox(P, [-2.5, 2.5], [-HY - 0.8, -HY], [1.2, 1.4], "lo")) + ISO.tinted(T.C.alu, ISO.wbox(P, [-HX, HX], [-HY, HY], [0, H], "mid")) +
        `<path d="${Array.from({ length: 7 }, (_, i) => top(-3.6 + i * 1.05, -3.0 + i * 1.05, 6.4, 9.2)).join("")}" fill="#3a3e44" stroke="#262a30" stroke-width="0.3"/>` +
        `<path d="${top(-3.2, 2.6, -7.5, 1.5)}" fill="#f1f2f3" stroke="#a9aeb5" stroke-width="0.4"/>`;
      // the near end: the fan opening, the socket, the status light, the release latch
      const endSvg = `<path d="${ring(FR + 0.1)}" fill="#141619" stroke="#0d0e10" stroke-width="0.5"/>` +
        `<path d="${quad(1.3, 3.5, 0.9, 2.7)}" fill="#1c1f23" stroke="#0d0e10" stroke-width="0.5"/><path d="${quad(1.55, 3.25, 1.1, 2.5, 0.01)}" fill="#3a3e44" stroke="#0d0e10" stroke-width="0.3"/>` +
        `<path d="${[[1.85, 1.95], [2.4, 1.95], [2.95, 1.95]].map(([x, z]) => quad(x - 0.09, x + 0.09, z - 0.3, z + 0.3, 0.02)).join("")}" fill="#c9b27a" stroke="none"/>` +
        `<path d="${ring(0.12, 3.8, 3.3, 16)}" fill="${T.LED.green}" stroke="#16191d" stroke-width="0.3"/>`;
      const grille = `<path d="${ring(FR, FX, FZ, 40, 0.06)}${ring(FR * 0.66, FX, FZ, 32, 0.06)}${ring(FR * 0.33, FX, FZ, 24, 0.06)}" fill="none" stroke="#9aa0a8" stroke-width="${(G.scaleOf(P) * 0.04).toFixed(2)}"/>` +
        `<path d="M${at(FX - FR, FZ, 0.06)}L${at(FX + FR, FZ, 0.06)}M${at(FX, FZ - FR, 0.06)}L${at(FX, FZ + FR, 0.06)}" stroke="#9aa0a8" stroke-width="${(G.scaleOf(P) * 0.04).toFixed(2)}"/>`;
      // the pull handle: two posts out of the end and a grip across, and the latch tab beside the socket
      const handle = ISO.tinted(T.C.black, ISO.wbox(P, [1.0, 1.4], [HY, HY + 1.6], [3.0, 3.5], "mid") + ISO.wbox(P, [3.8, 4.2], [HY, HY + 1.6], [3.0, 3.5], "mid") + ISO.wbox(P, [1.0, 4.2], [HY + 1.6, HY + 2.1], [2.9, 3.6], "hi")) +
        ISO.tinted(ISO.T.green, ISO.wbox(P, [3.7, 4.2], [HY, HY + 0.6], [0.5, 1.6], "mid"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY - 0.8, w: 2 * HX, d: 2 * HY + 2.9, r: 0.5 }, 0, 0.02, P)}"/>` +
        `<g data-name="case">${caseSvg}</g><g data-name="socket">${endSvg}</g>` +
        `<g data-name="fan"><g transform="${T.mat(P, [FX, FY + 0.03, FZ], [1, 0, 0], [0, 0, -1])}"><g data-part="spin">${B.rotor(FR - 0.05, 0.45, 7)}</g></g>${grille}</g>` +
        `<g data-name="handle">${handle}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = LAB.word(P, lab, [HX, HY, H + 1], "hot-swap power supply", "#445", { anchor: "start" });
      g.anchors = { socket: [2.4, HY, 1.8] };
      const st = { spin: o.spin !== "0", a: 0, v: o.spin !== "0" ? 400 : 0 };
      let lit = o.lit || "";
      const draw = () => { w.attr(el.spin, "transform", `rotate(${(st.a % 360).toFixed(1)})`); LAB.light(w, g, lit); };
      g.set = (p) => { if (p.spin !== undefined) st.spin = !!+p.spin; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        st.v = ISO.follow(st.v, st.spin ? 400 : 0, dt, 0.5, ISO.still());
        if (!ISO.still()) st.a = (st.a + st.v * dt) % 360;
        draw();
        return st.v > 0.5 && !ISO.still();
      };
      g.readout = () => `hot-swap power supply · mains in at the socket, 12 V out at the card edge · fan ${st.v > 1 ? "running" : "stopped"} · slides out by its handle while the other supply carries the server`;
      draw();
      return g;
    },
  });
})();
