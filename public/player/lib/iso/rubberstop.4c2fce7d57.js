// "rubberstop cx cy k lab=0 lit=pad|plate" — a PART (PARTS.md, batch 5): the rubber stop under each end of the lab
// lever's plank, its origin the bench point under its middle. A steel base plate 4.5 × 5 cm screwed down with two
// screws and a black rubber button 3 cm across, 1 cm tall in all, with a moulded ring on its top. The plank's end lands
// on `top`. Static (the plank lands on it). Taken from lever.js (scaled 1:4). World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  ISO.add({
    name: "rubberstop", title: "Rubber stop (part)", compare: null,
    about: "A rubber stop pad 3 cm across and 1 cm tall on a screwed-down steel plate; the lever plank's end lands on it; static. anchors: top",
    line: "rubberstop cx cy k lab=0 lit=pad|plate",
    demo: { line: "rubberstop 480 300 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "pad" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const plate = { x: -2.25, y: -2.5, w: 4.5, d: 5, r: 0.3 };
      const screws = [[-1.6, -1.85], [1.6, 1.85]];
      const heads = screws.map(([x, y]) => S(K.cylinder(x, y, 0.32, 0.3, 0.08, P, 14), { tone: "mid" })).join("") +
        `<path d="${screws.map(([x, y]) => K.pathOf([[x - 0.22, y, 0.381], [x + 0.22, y, 0.381]].map((p) => K.iso(p, P)))).join("")}" stroke="#3c3f45" stroke-width="0.5"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plate, 0, 0.3, P)}"/>` +
        `<g data-name="plate">${ISO.tinted(ISO.T.steel, S(K.slabOf(plate, 0, 0.3, P, 3, 0.06), { tone: "mid" }) + heads)}</g>` +
        `<g data-name="pad">${ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 1.5, 0.3, 0.6, P, 32), { tone: "mid" }) + S(K.cylinder(0, 0, 1.38, 0.9, 0.1, P, 32, 0.08), { tone: "mid" }) +
          L(K.ring(0, 0, 0.85, 1.0, P, 24), { tone: "lo" }))}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([0, 2.5, 0], P), "rubber stop", "#555", { size: 14, dy: 20 });
      g.anchors = { top: [0, 0, 1] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; window.B19.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "rubber stop · 3 cm across, 1 cm tall · the plank's end lands on it";
      window.B19.light(w, g, lit);
      return g;
    },
  });
})();
