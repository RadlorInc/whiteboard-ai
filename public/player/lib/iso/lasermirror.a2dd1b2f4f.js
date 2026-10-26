// "lasermirror cx cy k kind=full|output lab=0 lit=mount|mirror|screws" — a PART (PARTS.md, batch 5): a laser-cavity
// mirror in its mount, standing on the laser's board, origin the surface point under its middle. A 6 cm wide, 1 cm
// thick, 12 cm tall aluminium plate on a foot, the 2.5 cm mirror set in a hole square to x with its centre 6.1 cm up
// (on a tubecradle's axis), a bezel ring, and two knurled adjusting screws on the +x face. kind=full: the 100 % mirror
// (silvered) at the back of the cavity; kind=output: the 99 % mirror at the front, faintly see-through: the beam
// leaves through it toward −x (the bench rule). Reused from laser.js (its mirror mounts). Static. anchors: centre
(() => {
  const K = window.K, G = window.G;
  const ALU = ISO.tint("#e4e7ea", ["#9aa1a8", "#adb3b9", "#bfc4c9", "#d0d4d8"], "#3f464d");
  const OUTPUT = ISO.tint("#f6e3ea", ["#c9a9b6", "#d6b9c4", "#e2c9d2", "#ecd8df"], "#6a4a58");
  const HX = 0.5, HY = 3, ZT = 12, RM = 1.25;

  ISO.add({
    name: "lasermirror", title: "Laser mirror in mount (part)", compare: null,
    about: "A laser-cavity mirror in a 6 × 1 × 12 cm mount, centre 6.1 cm up: kind=full the 100 % mirror, kind=output the 99 % mirror the beam leaves through. anchors: centre",
    line: "lasermirror cx cy k kind=full|output lab=0 lit=mount|mirror|screws",
    demo: { line: "lasermirror 480 400 30 kind=output lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "mirror" }, hold: 1.4 }, { set: { lit: "screws" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", out = o.kind === "output", Z = B18.LASER_Z;
      const F = B18.X([0, 0, Z]), foot = { x: -1.5, y: -HY, w: 3, d: 2 * HY, r: 0.3 };
      const ring = (s, r, n = 32) => Array.from({ length: n }, (_, i) => G.pointOf(F, s, r, (i / n) * Math.PI * 2));
      const face = (s, r, fill, ink) => `<path d="${K.pathOf(ring(s, r).map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="0.6"/>`;
      // the mirror in the plate's hole, seen on the +x face (the camera's side): the coating colour, a highlight streak
      const glass = (s) => face(s, RM, out ? "#efd7e0" : "#d7dbe0", out ? "#8a6474" : "#5c636b") + `<path d="${K.pathOf([G.pointOf(F, s, RM * 0.7, 2.2), G.pointOf(F, s, RM * 0.7, 2.9)].map((p) => K.iso(p, P)))}" stroke="#ffffff" stroke-width="0.8" opacity=".8"/>`;
      const screw = (y, z) => { const Fs = B18.X([0, y, z]); return ISO.tinted(ISO.T.steel, S(G.disc(HX, HX + 0.6, 0.18, Fs, P), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(G.disc(HX + 0.6, HX + 1.1, 0.5, Fs, P), { tone: "hi", inner: L(G.ribsOf(Fs, HX + 0.6, HX + 1.1, 0.5, 12, P, { seams: true }), { tone: "lo" }) })); };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(foot, 0, 0.6, P)}"/>` +
        `<g data-name="mount">${ISO.tinted(ALU, S(K.slabOf(foot, 0, 0.6, P, 3, 0.1), { tone: "lo" }) + ISO.wbox(P, [-HX, HX], [-HY, HY], [0.6, ZT], "mid"))}` +
        `${D([[1.1, -2.2, 0.6], [1.1, 2.2, 0.6]].map((p) => K.iso(p, P)), { size: 0.5 })}${face(HX + 0.01, RM + 0.35, "#c3c8cd", "#3f464d")}` +
        `${LAB.faceText(P, [HX + 0.02, 0, ZT - 1.4], [0, -1, 0], out ? "R 99 %" : "R 100 %", 0.8, "#33404c")}</g>` +
        `<g data-name="mirror">${ISO.tinted(out ? OUTPUT : ISO.T.steel, glass(HX + 0.02))}</g>` +
        `<g data-name="screws">${screw(-2, Z + 3.2)}${screw(2, Z + 3.2)}</g><g data-part="words"></g>`;
      g.anchors = { centre: [0, 0, Z] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [0, 0, ZT + 1.5], out ? "99 % mirror (output)" : "100 % mirror", "#556");
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B18.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => (out ? "output mirror · reflects 99 %, lets 1 % through as the beam (toward −x)" : "back mirror · reflects 100 %") + " · centre 6.1 cm over the board";
      B18.light(w, g, lit);
      return g;
    },
  });
})();
