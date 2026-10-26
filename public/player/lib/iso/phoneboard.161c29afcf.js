// "phoneboard cx cy k lab=0 lit=board|soc|chips|sim|motor|speaker|usb" — a PART (PARTS.md, batch 6): the phone's logic
// board lying flat, its origin the surface point under the middle of its 60 × 90 mm bounding box, 4 mm high with its
// parts. An L of green board: the long strip carries the processor under its steel shield can, the storage and modem
// chips, the power chips, a row of small capacitors and the SIM reader with the tray's head and its eject-pin hole at the
// edge; the foot carries the battery connector, the vibration motor, the loudspeaker (its grille on the end) and the
// USB-C port. Gold screw pads with their screws. The same board as in phone (B39.board). Static. Built in mm, seen
// from the port end so USB-C faces you; anchors in cm.
(() => {
  ISO.add({
    name: "phoneboard", title: "Phone logic board (part)", compare: null,
    about: "A phone's L-shaped logic board: the processor under its shield can, storage, modem and power chips, the SIM reader, vibration motor, loudspeaker and the USB-C port. anchors: plug usb sim",
    line: "phoneboard cx cy k lab=0 lit=board|soc|chips|sim|motor|speaker|usb",
    demo: { line: "phoneboard 480 280 42 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "soc" }, hold: 1.2 }, { set: { lit: "sim" }, hold: 1.2 }, { set: { lit: "usb" }, hold: 1.2 }, { set: { lit: "board" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, K = window.K, T = window.TECH;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = B.cam(ISO.mm(Pc), 180), lab = o.lab === "1";
      const b = B.board(P, 0, 0, 0, 0);
      const words = lab ? [T.word(P, [22, 22, 2.3], "processor", { anchor: "end", dx: -14, dy: -10 }), T.word(P, [0, -45, 2], "USB-C", { dy: 22 }), T.word(P, [30, -20, 2], "SIM", { anchor: "end", dx: -12 })].join("") : "";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: 12, y: -25, w: 18, d: 70, r: 2 }, 0, 1, P)}${K.haloOf({ x: -30, y: -45, w: 60, d: 20, r: 2 }, 0, 1, P)}"/><g data-name="board">${b.svg}</g><g data-part="words">${words}</g>`;
      const cm = (p) => p.map((v) => +(v / 10).toFixed(3));
      g.anchors = { plug: cm(b.plug), usb: cm([0, -45.4, 2.6]), sim: cm([30.4, -21.2, 1.75]) };
      const w = ISO.writer(); let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "phone logic board · processor (under the shield can), storage, modem and power chips · SIM reader, vibration motor, loudspeaker, USB-C port · 60 × 90 mm";
      B.light(w, g, lit);
      return g;
    },
  });
})();
