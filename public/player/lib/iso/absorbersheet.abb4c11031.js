// "absorbersheet cx cy k mat=paper|aluminium|lead lab=0 lit=sheet|label" — a PART (PARTS.md, batch 5): the absorber of
// penetration.js, standing on its edge, its origin the point under the middle of its bottom edge (stand it at= an
// absorberholder's `slot`). An 8 × 8 cm square in the y–z plane (it faces the beam along x): a sheet of paper
// (0.5 mm), aluminium 3 mm, or lead 1 cm; a small label on its +x face says which. Paper stops alpha, 3 mm of
// aluminium stops beta, 1 cm of lead lets about 55% of Co-60 gamma through. set({ mat }) swaps it. Built in mm
// (ISO.mm); anchors in cm.
(() => {
  const K = window.K;
  const T = { paper: 0.5, aluminium: 3, lead: 10 }, NAME = { paper: "paper", aluminium: "Al 3 mm", lead: "Pb 1 cm" };
  const PASS = { paper: "stops alpha", aluminium: "stops alpha and beta", lead: "lets about 55% of gamma through" };
  const HW = 40, H = 80;
  ISO.add({
    name: "absorbersheet", title: "Absorber sheet (part)", compare: null,
    about: "An 8 × 8 cm absorber standing on its edge across the beam: a sheet of paper, 3 mm of aluminium or 1 cm of lead, labelled. anchors: top",
    line: "absorbersheet cx cy k mat=paper|aluminium|lead lab=0 lit=sheet|label",
    demo: { line: "absorbersheet 480 420 40 mat=paper lab=1", script: [{ set: {}, hold: 1 }, { set: { mat: "aluminium", lit: "sheet" }, hold: 1.2 }, { set: { mat: "lead", lit: "label" }, hold: 1.2 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { mat: T[o.mat] ? o.mat : "paper" };
      let lit = o.lit || "";
      const tint = { paper: B22.PAPER, aluminium: B22.ALU, lead: B22.LEAD };
      const build = () => {
        const m = st.mat, h = T[m] / 2, x1 = h + 0.05;
        const sheet = ISO.tinted(tint[m], ISO.wbox(Pm, [-h, h], [-HW, HW], [0, H], m === "paper" ? "lo" : "mid"));
        // the label: a white sticker with the material on it, near the top corner of the +x face
        const st0 = [x1, 6, 62], f = (y, z) => K.iso([x1, y, z], Pm);
        const label = `<path d="${K.pathOf([f(-16, 56), f(30, 56), f(30, 70), f(-16, 70)], true)}" fill="${m === "paper" ? "#f3e9b8" : "#fbfbf8"}" stroke="#6d6d68" stroke-width="0.5"/>` +
          LAB.faceText(Pm, [st0[0], 7, 60.5], [0, -1, 0], NAME[m], 7, "#2b2f35");
        g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -h - 2, y: -HW, w: 2 * h + 4, d: 2 * HW, r: 1 }, 0, H, Pm)}"/><g data-name="sheet">${sheet}</g><g data-name="label">${label}</g><g data-part="words"></g>`;
        if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, H + 14], m === "paper" ? "paper" : m === "aluminium" ? "aluminium 3 mm" : "lead 1 cm", "#445", { dy: -6 });
        B22.light(ISO.writer(), g, lit);
      };
      g.anchors = { top: [0, 0, H / 10] };
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; if (p.mat !== undefined && T[p.mat]) st.mat = p.mat; build(); };
      g.update = () => false;
      g.readout = () => `absorber: ${st.mat === "paper" ? "paper" : st.mat === "aluminium" ? "aluminium 3 mm" : "lead 1 cm"} · ${PASS[st.mat]}`;
      build();
      return g;
    },
  });
})();
