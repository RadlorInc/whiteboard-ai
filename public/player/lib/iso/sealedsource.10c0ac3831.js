// "sealedsource cx cy k src=alpha|beta|gamma lab=0 lit=source|rod|handle" — a PART (PARTS.md, batch 5): the school
// sealed source of penetration.js, its origin the working tip: the middle of the source's window, on the −x end. The
// radioactive disc (1.5 cm across) is sealed in a steel head behind a thin window that faces −x (radiation goes toward
// −x, the bench's rule), on a 15 cm handle: an aluminium rod that slides into a sourceholder's sleeve, a black grip
// with finger rings, and a coloured band and print that say which source it is: alpha Am-241 (red), beta Sr-90
// (green), gamma Co-60 (purple). set({ src }) swaps it. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const HEAD = 12, ROD = 92, END = 150, RH = 7.5, RR = 4, RG = 6.5;
  ISO.add({
    name: "sealedsource", title: "Sealed radioactive source (part)", compare: null,
    about: "A school sealed radioactive source: the 1.5 cm source disc in a steel head on a 15 cm handle (rod and grip), its window facing −x; alpha Am-241, beta Sr-90 or gamma Co-60, told apart by the band and print. anchors: grip",
    line: "sealedsource cx cy k src=alpha|beta|gamma lab=0 lit=source|rod|handle",
    demo: { line: "sealedsource 300 260 34 src=alpha lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "source" }, hold: 1.2 }, { set: { src: "beta", lit: "handle" }, hold: 1.2 }, { set: { src: "gamma", lit: "rod" }, hold: 1.2 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { src: B22.SRC[o.src] ? o.src : "alpha" };
      let lit = o.lit || "";
      const F = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), face = G.angleToward(F, G.viewOf(Pm)), up = G.tangentOf(F, face);
      const build = () => {
        const s = B22.SRC[st.src], band = ISO.tint(s.col, [s.col, s.col, s.col, s.col].map((c, i) => LAB.mix(c, "#000000", 0.3 - i * 0.07)), LAB.mix(s.col, "#000000", 0.55));
        const head = ISO.tinted(ISO.T.steel, S(G.solidOf([[0, RH - 1], [1, RH], [HEAD - 2, RH], [HEAD, RH - 1.5], [HEAD + 2, RR + 0.6]], F, Pm), { tone: "hi", inner: L(G.arcOf(F, 3, RH, Pm), { tone: "faint" }) }));
        const rod = ISO.tinted(B22.ALU, S(G.disc(HEAD + 1, ROD + 1, RR, F, Pm), { tone: "hi", crease: "none" }));
        const rings = [104, 112, 120, 128, 136].map((x) => G.arcOf(F, x, RG, Pm)).join("");
        // the grip in three pieces, far to near, so each covers the end of the one before (the band is flush)
        const grip = ISO.tinted(ISO.T.plastic, S(G.solidOf([[ROD, RR + 0.5], [ROD + 4, RG - 0.5], [ROD + 6, RG]], F, Pm), { tone: "mid" })) +
          ISO.tinted(band, S(G.disc(ROD + 6, ROD + 10, RG, F, Pm), { tone: "hi", crease: "none" })) +
          ISO.tinted(ISO.T.plastic, S(G.solidOf([[ROD + 10, RG], [END - 3, RG], [END, RG - 2]], F, Pm), { tone: "mid", inner: L(rings, { tone: "faint" }) }));
        const bandSvg = "";
        const at = (x) => G.pointOf(F, x, RG + 0.05, face);
        const print = LAB.faceText(Pm, at(132), [1, 0, 0], `${s.iso} ${s.sym}`, 4.6, "#f4f6f8", up);
        g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: 0, y: -RG, w: END, d: 2 * RG, r: RG }, -RH, 2 * RH, Pm)}"/>` +
          `<g data-name="source">${head}</g><g data-name="rod">${rod}</g><g data-name="handle">${grip}${bandSvg}${print}</g><g data-part="words"></g>`;
        if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [10, 0, 22], `${st.src} source`, s.col, { dy: -6 });
        B22.light(ISO.writer(), g, lit);
      };
      g.anchors = { grip: [12.2, 0, 0] };
      g.set = (p) => {
        if (p.lit !== undefined) lit = p.lit;
        if (p.src !== undefined && B22.SRC[p.src]) st.src = p.src;
        build();
      };
      g.update = () => false;
      g.readout = () => {
        const s = B22.SRC[st.src];
        return `${st.src} source, ${s.iso} · ${{ alpha: "alphas stop in a sheet of paper or a few cm of air", beta: "betas pass paper, 3 mm of aluminium stops them", gamma: "gamma passes paper and aluminium, lead only cuts it down" }[st.src]}`;
      };
      build();
      return g;
    },
  });
})();
