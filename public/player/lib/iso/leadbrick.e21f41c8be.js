// "leadbrick cx cy k aim=x|y lab=0 lit=brick" — a PART (PARTS.md, batch 5): a lead castle brick from penetration.js,
// its origin the bench point under its middle. A cast lead brick 10 × 5 × 5 cm (about 2.8 kg), the long side along
// aim (x or y), its edges eased, a thin grey epoxy coat, the casting's parting line round its middle, "Pb" and the
// weight stamped on its +y (or +x) face. Several stacked round a source holder make the castle. Static.
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K;
  ISO.add({
    name: "leadbrick", title: "Lead brick (part)", compare: null,
    about: "A cast lead castle brick 10 × 5 × 5 cm (about 2.8 kg), lying with its long side along x or y; stack them round a radioactive source to shield it. anchors: top",
    line: "leadbrick cx cy k aim=x|y lab=0 lit=brick",
    demo: { line: "leadbrick 480 330 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "brick" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const along = o.aim === "y", hx = along ? 25 : 50, hy = along ? 50 : 25, H = 50;
      const plan = { x: -hx, y: -hy, w: 2 * hx, d: 2 * hy, r: 2 };
      const body = ISO.tinted(B22.LEAD, S(K.slabOf(plan, 0, H, Pm, 4, 1.2), { tone: "mid" }));
      // the parting line runs round the two faces we see and ends on the vertical edges
      const part = L(K.pathOf([[-hx + 0.07, hy - 1.5, H / 2], [hx, hy + 0.05, H / 2], [hx + 0.05, hy, H / 2], [hx + 0.05, -hy + 2, H / 2]].map((p) => K.iso(p, Pm))), { tone: "faint" });
      // the stamp on the long face that faces us
      const face = along ? [hx + 0.1, 0, 32] : [0, hy + 0.1, 32], u = along ? [0, -1, 0] : [1, 0, 0];
      const stamp = LAB.faceText(Pm, face, u, "Pb", 11, "#3a3e44") + LAB.faceText(Pm, [face[0], face[1], 14], u, "2.8 kg", 6, "#3a3e44");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, H, Pm)}"/><g data-name="brick">${body}${part}${stamp}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, H + 22], "lead brick", "#445", { dy: -6 });
      g.anchors = { top: [0, 0, H / 10] };
      B22.still(g, o);
      g.readout = () => "lead brick 10 × 5 × 5 cm · about 2.8 kg · 5 cm of lead cuts gamma rays to about a twentieth";
      return g;
    },
  });
})();
