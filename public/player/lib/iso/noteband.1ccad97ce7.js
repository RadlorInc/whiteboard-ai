(() => {
  const K = window.K;
  // "noteband cx cy k count=… value=… lab=0 lit=band" — a PART: the paper strap that wraps a bundle of 100 notes,
  // standing empty on the table as it does when slid off a bundle (a loop 3.5 wide, 7.8 deep, 1.2 tall), its origin the
  // table point under its middle. The count and the value are printed on its top (plain numbers), and its total
  // under them, for counting in hundreds. Static. anchors: top
  ISO.add({
    name: "noteband", title: "Note band (part)", compare: null,
    about: "The paper strap that wraps a bundle of 100 notes, 3.5 cm wide, with the count, the value and the total printed on it; static. anchors: top",
    line: "noteband cx cy k count=100|50|25|10 value=1..100 lab=0 lit=band",
    demo: { line: "noteband 480 300 60 count=100 value=20 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "band" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const n = +A.pick(o.count, ["100", "50", "25", "10"], "100"), value = Math.round(A.num(o, "value", 20, 1, 100)), H = 1.2;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -2, y: -4.1, w: 4, d: 8.2, r: 0.3 }, 0, H, P)}"/>` +
        `<g data-name="band">${B.band(P, [0, 0, 0], H, { w: 3.5, d: 7.7, words: [String(n), `× ${value}`] })}` +
        `${B.face(P, [0, 7.7 / 2 + 0.035, H * 0.32], [1, 0, 0], [0, 0, 1], `= ${n * value}`, 0.55, "#5a3d16")}</g>` + (lab ? B.word(P, [1.75, 3.9, H], `band of ${n} notes`) : "");
      g.anchors = { top: [0, 0, H + 0.03] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; A.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `note band · ${n} notes of ${value} = ${n * value}`;
      A.light(w, g, lit);
      return g;
    },
  });
})();
