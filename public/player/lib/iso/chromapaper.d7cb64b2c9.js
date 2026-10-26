// "chromapaper cx cy k run=0..1 lab=0 lit=paper|baseline|front|spots" — a PART (PARTS.md, batch 5): the strip of
// chromatography paper of chroma.js at real size, 3 cm wide and 13 cm long, hanging in the x–z plane (its printed
// face toward +y) from a fold over a glass rod at its top. A pencil start line 2 cm up from the bottom with a spot of
// black ink on it; the bottom 8 mm stands in the solvent. A thing that hangs: origin the top of its front face, where it
// bends back over a 6.4 mm rod. run 0 → 1 lets the solvent soak up the paper to 2 cm from the top, slowing as it climbs (capillary
// rise, distance² ∝ time, about 9 s for all of it): the wet part grows under its front, and the ink splits into blue
// (Rf 0.78), red (0.52) and yellow (0.30), each moving Rf × the solvent's distance. set({ run }). Built in mm;
// anchors in cm: top (the rod's axis inside the fold), line (the spot on the start line), bottom (the strip's bottom edge).
(() => {
  const K = window.K, G = window.G;
  const PW = 15, LEN = 130, TH = 0.25, ROD = 3.2, FLAP = 16, WET0 = 8, BASEL = 20, TOPS = LEN - 20;
  const DYES = [{ c: "#2f5fd0", rf: 0.78, name: "blue" }, { c: "#d0392b", rf: 0.52, name: "red" }, { c: "#e3b21a", rf: 0.3, name: "yellow" }];
  const PAPER = ISO.tint("#fbf9f3", ["#d8d3c6", "#e3dfd3", "#ece9df", "#f4f2eb"], "#a8a294");
  const Z = (h) => -LEN + h;   // height up from the strip's bottom → world z

  function staticSvg(P, lab) {
    const out = [];
    // the flap folded down behind the rod, the fold's curve over the rod, the strip itself (a thin sheet)
    const arch = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arch.push([-ROD - Math.cos(a) * (ROD + TH), Math.sin(a) * (ROD + TH)]); }
    for (let i = 12; i >= 0; i--) { const a = (i / 12) * Math.PI; arch.push([-ROD - Math.cos(a) * ROD, Math.sin(a) * ROD]); }
    out.push(ISO.tinted(PAPER, ISO.wbox(P, [-PW, PW], [-2 * ROD - TH, -2 * ROD], [-FLAP, 0], "lo")));
    out.push(ISO.prismX(P, arch, -PW, PW, ["#d8d3c6", "#f4f2eb"], "#fbf9f3", "#a8a294"));
    out.push(ISO.tinted(PAPER, ISO.wbox(P, [-PW, PW], [0, TH], [-LEN, 0], "hi")));
    return out.join("");
  }

  ISO.add({
    name: "chromapaper", title: "Chromatography paper (part)", compare: null,
    about: "A 3 × 13 cm strip of chromatography paper with a pencil start line and an ink spot, hung over a rod: as the solvent soaks up it, the ink splits into blue, red and yellow dyes, each moving its own fraction (Rf) of the way. anchors: top line bottom",
    line: "chromapaper cx cy k run=0..1 lab=0 lit=paper|baseline|front|spots",
    demo: { line: "chromapaper 480 90 32 run=0", script: [{ set: {}, hold: 1 }, { set: { run: 0.4, lit: "front" }, hold: "settle" }, { set: { run: 1, lit: "spots" }, hold: "settle" }, { set: { lit: "baseline" }, hold: 1.2 }] },
    make([cx = 480, cy = 120, k = 3], o, t, parent) {
      const B09 = window.B09, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const at = (u, h) => K.iso([u, TH + 0.02, Z(h)], Pm), quad = (u0, u1, h0, h1) => K.pathOf([at(u0, h0), at(u1, h0), at(u1, h1), at(u0, h1)], true), kS = G.scaleOf(Pm);
      const st = { f: ISO.clamp(ISO.num(o, "run", 0), 0, 1) }, want = { f: st.f };
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="paper">${staticSvg(Pm)}</g><g data-name="front" data-part="wet"></g>` +
        `<g data-name="baseline"><path d="${K.pathOf([at(-PW, BASEL), at(PW, BASEL)])}" stroke="#55595e" stroke-width="${Math.max(0.5, kS * 0.5).toFixed(2)}"/>` +
        `${LAB.faceText(Pm, [0, TH + 0.03, Z(LEN - 15)], [1, 0, 0], "black ink", 4, "#7d8187")}</g><g data-name="spots" data-part="spots"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const frontH = () => WET0 + (TOPS - WET0) * st.f;
      const spot = (h, col, r, stretch, op) => { const c = at(0, h); return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(r * kS * 0.8).toFixed(2)}" ry="${(r * kS * stretch).toFixed(2)}" fill="${col}" fill-opacity="${op}"/>`; };
      const draw = () => {
        const fh = Math.round(frontH() * 4) / 4, moved = Math.max(0, fh - BASEL), key = fh.toFixed(2);
        // the wet paper under the solvent front, a little darker, and the front itself as a soft wavy edge
        w.rebuild(el.wet, key, () => {
          const edge = []; for (let i = 0; i <= 12; i++) { const u = -PW + (i / 12) * 2 * PW; edge.push(at(u, fh + Math.sin(i * 1.7) * 0.6)); }
          return `<path d="${K.pathOf([at(-PW, 0.2), at(PW, 0.2), ...edge.reverse()], true)}" fill="#c9dbe6" fill-opacity=".5"/>` +
            `<path d="${K.pathOf(edge)}" fill="none" stroke="#7fa6c4" stroke-width="${Math.max(0.5, kS * 0.4).toFixed(2)}"/>`;
        });
        // one black spot that splits, each dye at Rf × the distance the solvent has moved past the start line
        w.rebuild(el.spots, key, () => moved < 2 ? spot(BASEL, "#2a2730", 2.6, 0.9, 0.95) :
          spot(BASEL, "#2a2730", 1.6, 0.8, ISO.clamp(1 - moved / 30, 0.1, 0.9)) + DYES.map((d) => spot(BASEL + d.rf * moved, d.c, 2.6, 0.95 + moved * 0.008, 0.85)).join(""));
        if (lab) w.rebuild(el.words, key, () => LAB.word(Pm, lab, [PW + 4, 0, Z(BASEL)], "start line (pencil)", "#556", { anchor: "start", size: 12 }) +
          (st.f > 0.05 ? LAB.word(Pm, lab, [PW + 4, 0, Z(fh)], "solvent front", "#2b6cc4", { anchor: "start", size: 12 }) : "") +
          (moved > 12 ? DYES.map((d) => LAB.word(Pm, lab, [-PW - 4, 0, Z(BASEL + d.rf * moved)], `Rf ${d.rf.toFixed(2)}`, d.c, { anchor: "end", size: 12, dy: 4 })).join("") : ""));
        B09.light(w, g, lit);
      };
      g.anchors = { top: [0, -ROD / 10, 0], line: [0, TH / 10, Z(BASEL) / 10], bottom: [0, 0, -LEN / 10] };
      g.set = (p) => { if (p.run !== undefined) { const r = ISO.clamp(+p.run, 0, 1); if (r < st.f) st.f = r; want.f = r; } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        if (ISO.still()) st.f = want.f;
        else if (st.f < want.f) st.f = Math.min(want.f, st.f + (dt * 0.11) / (0.25 + st.f));
        draw();
        return st.f < want.f;
      };
      g.readout = () => {
        const moved = Math.max(0, frontH() - BASEL);
        return moved < 1 ? "black ink spot on the pencil line · solvent below the line" : `solvent moved ${moved.toFixed(0)} mm past the line · ${DYES.map((d) => `${d.name} ${(d.rf * moved).toFixed(0)} mm (Rf ${d.rf})`).join(" · ")}`;
      };
      draw();
      return g;
    },
  });
})();
