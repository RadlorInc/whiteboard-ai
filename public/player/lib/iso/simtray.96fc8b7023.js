// "simtray cx cy k lab=0 lit=tray|card" — a PART (PARTS.md, batch 6): a phone's SIM tray lying flat with a nano SIM in
// it, its origin the surface point under the tray's middle. A thin steel tray 16 × 10 × 0.8 mm: side and end rails
// round the card's pocket, the head that sits flush in the phone's side with its eject-pin hole (toward +x), and the
// nano SIM (12.3 × 8.8 × 0.67 mm, one corner cut) with its gold contact pad up. Static. Built in mm; anchors in cm.
(() => {
  ISO.add({
    name: "simtray", title: "SIM tray (part)", compare: null,
    about: "A phone's thin steel SIM tray holding a nano SIM card with its gold contacts, the tray's head with the eject-pin hole. anchors: pin card",
    line: "simtray cx cy k lab=0 lit=tray|card",
    demo: { line: "simtray 480 290 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "card" }, hold: 1.2 }, { set: { lit: "tray" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, K = window.K, T = window.TECH;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = ISO.mm(Pc), lab = o.lab === "1";
      const box = (x, y, z, tone, c) => T.box(P, x, y, z, tone, c);
      // the tray: a thin floor lip, the far rails, then the card, then the near rails and the head
      const X0 = -8, X1 = 6.6, Y = 5, cx0 = -6.4, cx1 = 5.9, cy0 = -4.4;
      const lip = box([cx0, cx1], [-Y + 0.6, Y - 0.6], [0, 0.15], "lo", T.C.steel);
      const farRails = box([X0, cx0], [-Y, Y], [0, 0.8], "mid", T.C.steel) + box([cx0, cx1], [-Y, cy0], [0, 0.8], "mid", T.C.steel);
      const nearRails = box([cx0, cx1], [-cy0, Y], [0, 0.8], "mid", T.C.steel) + box([cx1, X1], [-Y, Y], [0, 0.8], "mid", T.C.steel);
      const head = box([X1, X1 + 1.8], [-5.4, 5.4], [-0.1, 1], "hi", T.C.steel) + `<path d="${K.pathOf(K.ringOf({ x: -0.45, y: -0.45, w: 0.9, d: 0.9, r: 0.45 }, 6).map(([a, b]) => K.iso([X1 + 1.82, 2.6 + a, 0.45 + b], P)), true)}" fill="#1f2226" stroke="#101215" stroke-width=".3"/>`;
      // the nano SIM: a plate with one corner cut, its gold pad split into six contacts
      const sx0 = -6.15, sx1 = 6.15, sy0 = -4.4, sy1 = 4.4, cz = [0.15, 0.82];
      const card = T.plate(P, [[sx0, sy0], [sx1, sy0], [sx1, sy1 - 1.4], [sx1 - 1.4, sy1], [sx0, sy1]], cz[0], cz[1], "hi", T.C.white);
      const pad = `<path d="${K.planOutline({ x: -4, y: -3, w: 8, d: 6, r: 0.8 }, cz[1] + 0.01, P, 3)}" fill="#e0bf66" stroke="#6b4f0e" stroke-width=".4"/>` +
        `<path data-free d="${[[-4, 0, 4, 0], [-1.3, -3, -1.3, 3], [1.3, -3, 1.3, 3]].map(([a, b, c, d]) => K.pathOf([K.iso([a, b, cz[1] + 0.02], P), K.iso([c, d, cz[1] + 0.02], P)])).join("")}" stroke="#8a6a1c" stroke-width=".4"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0, y: -5.4, w: X1 + 1.8 - X0, d: 10.8, r: 1 }, 0, 0.2, P)}"/><g data-name="tray">${lip}${farRails}</g><g data-name="card">${card}${pad}</g>` +
        `<g data-name="tray">${nearRails}${head}</g><g data-part="words">${lab ? T.word(P, [X1 + 1.8, -5.4, 1], "SIM tray", { anchor: "start", dx: 10 }) + T.word(P, [-6, 4.4, 0.8], "nano SIM", { anchor: "end", dx: -16, dy: -8 }) : ""}</g>`;
      g.anchors = { pin: [(X1 + 1.82) / 10, 0.26, 0.045], card: [0, 0, 0.082] };
      const w = ISO.writer(); let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "SIM tray · a nano SIM card, 12.3 × 8.8 × 0.67 mm; its chip holds the number the network knows the phone by · push a pin into the hole to eject the tray";
      B.light(w, g, lit);
      return g;
    },
  });
})();
