// "chroma cx cy size lab=1 lit=paper|beaker|rod" — paper chromatography of a black ink.
// A strip of chromatography paper hangs from a glass rod laid across a tall beaker, clipped at the top. A pencil
// baseline is drawn 20 mm up with a spot of black ink on it; the solvent (water) is 10 mm deep, below the line so the
// ink does not wash off. The solvent soaks up the paper and carries each dye at its own speed: blue (Rf 0.78), red
// (0.52) and yellow (0.30) pull apart; Rf = distance the dye moved ÷ distance the solvent moved.
// set({ run: 0–1 }) lets the solvent front climb that fraction of the way (about 9 s for all of it).
(() => {
  const K = window.K, G = window.G;
  const R = 42, H = 128, OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  const AZ = 50, VW = [Math.cos((AZ * Math.PI) / 180), Math.sin((AZ * Math.PI) / 180)], UW = [VW[1], -VW[0]];
  const Z0 = 3, SOLV = 10, BASEL = 20, TOPS = 100, PW = 15;                   // heights above the beaker floor (mm)
  const DYES = [{ c: "#2f5fd0", rf: 0.78, name: "blue" }, { c: "#d0392b", rf: 0.52, name: "red" }, { c: "#e3b21a", rf: 0.3, name: "yellow" }];
  const on = (u, z, d = 0) => [UW[0] * u - VW[0] * d, UW[1] * u - VW[1] * d, Z0 + z];

  ISO.add({
    name: "chroma", title: "Paper chromatography", compare: "chroma 480 260 260",
    about: "A paper strip in a beaker of solvent: as the solvent climbs, black ink splits into blue, red and yellow, each with its own Rf.",
    line: "chroma cx cy size run=0-1 lab=1 lit=paper|beaker|rod",
    demo: { line: "chroma 480 270 260", script: [{ set: { run: 0.5, lit: "rod" }, hold: "settle" }, { set: { run: 1, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.4, H2 = size * 1.4;
      const MAT = { x: -60, y: -60, w: 120, d: 120, r: 4 };
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), on(-62, H + 10), on(62, H + 10), [0, 0, H + 20]], cx, cy, W, H2, { azimuth: AZ, elevation: 20 }, parent);
      const V = LAB.vessel(P, [0, 0, Z0], OUTER, { spout: true });
      const st = { f: ISO.clamp(ISO.num(o, "run", 0), 0, 1), want: ISO.clamp(ISO.num(o, "run", 0), 0, 1) };
      let lit = o.lit || "";
      const quad = (u0, u1, z0, z1) => K.pathOf([on(u0, z0), on(u1, z0), on(u1, z1), on(u0, z1)].map((p) => K.iso(p, P)), true);
      // the rod across the rim, the strip folded over it and a bulldog clip
      const rodSvg = () => `<g style="${ISO.T.glass}">${S(G.solidOf([[0, 0.3], [0.8, 2.6, 1], [2, 3], [124, 3], [125.2, 2.6, 1], [126, 0.3]], LAB.A(on(-63, H + 3), [UW[0], UW[1], 0]), P), { tone: "mid" })}</g>`;
      const paperBack = () => `<path d="${quad(-PW, PW, H - 6, H + 6)}" fill="#f1ede2" stroke="#a8a294" stroke-width="0.6"/>`;
      const clip = () => ISO.box((u, w, d) => on(u, w, d), P, [-7, 7], [H - 2, H + 8], [-4.5, -3], "mid") + ISO.box((u, w, d) => on(u, w, d), P, [-6, 6], [H + 8, H + 10], [-4.5, 4], "mid");
      g.innerHTML = `<g>${LAB.mat(P, MAT, 3, "lo", "")}</g><g data-name="beaker">${V.back()}</g><g data-name="paper">${paperBack()}<g data-part="paper"></g></g>` +
        `<g>${V.liquid(SOLV, "colourless", { opacity: 0.6 })}</g><g>${V.front()}</g><g data-name="rod">${rodSvg()}</g><g data-name="rod">${clip()}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const frontZ = () => BASEL + (TOPS - BASEL) * st.f;
      const draw = () => {
        const fz = frontZ(), key = fz.toFixed(1);
        w.rebuild(el.paper, key, () => {
          const out = [`<path d="${quad(-PW, PW, 2, H - 2)}" fill="#fbf9f3" stroke="#a8a294" stroke-width="0.7"/>`];
          // the wet part of the paper below the solvent front
          out.push(`<path d="${quad(-PW + 0.3, PW - 0.3, 2.2, Math.max(SOLV + 1, fz))}" fill="#c9dbe6" fill-opacity=".45"/>`);
          if (st.f > 0.01) out.push(`<path d="${K.pathOf([on(-PW, fz), on(PW, fz)].map((p) => K.iso(p, P)))}" stroke="#7fa6c4" stroke-width="0.7" stroke-dasharray="2 1.6"/>`);
          // pencil baseline
          out.push(`<path d="${K.pathOf([on(-PW, BASEL), on(PW, BASEL)].map((p) => K.iso(p, P)))}" stroke="#55595e" stroke-width="0.7"/>`);
          // the dyes: one black spot that splits, each colour at Rf × the distance the solvent has moved
          const spot = (z, col, r, stretch, op) => { const c = K.iso(on(0, z), P), k = G.scaleOf(P); return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(r * k * 0.8).toFixed(2)}" ry="${(r * k * stretch).toFixed(2)}" fill="${col}" fill-opacity="${op}"/>`; };
          const moved = fz - BASEL;
          if (moved < 2) out.push(spot(BASEL, "#2a2730", 2.6, 0.9, 0.95));
          else {
            out.push(spot(BASEL, "#2a2730", 1.6, 0.8, ISO.clamp(1 - moved / 30, 0.1, 0.9)));
            for (const d of DYES) out.push(spot(BASEL + d.rf * moved, d.c, 2.6, 0.95 + moved * 0.012, 0.85));
          }
          return out.join("");
        });
        if (lab) w.rebuild(el.words, key, () => {
          const moved = fz - BASEL;
          return LAB.word(P, lab, on(PW + 4, BASEL), "start line (pencil)", "#556", { anchor: "start", size: 12 }) + LAB.word(P, lab, on(-R - 6, SOLV - 4), "solvent", "#2b6cc4", { anchor: "end", size: 12 }) +
            (st.f > 0.05 ? LAB.word(P, lab, on(PW + 4, fz), "solvent front", "#2b6cc4", { anchor: "start", size: 12 }) : "") +
            (moved > 12 ? DYES.map((d) => LAB.word(P, lab, on(-PW - 4, BASEL + d.rf * moved), `Rf ${d.rf.toFixed(2)}`, d.c, { anchor: "end", size: 12, dy: 4 })).join("") : "");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.run !== undefined) { const r = ISO.clamp(+p.run, 0, 1); if (r < st.f) st.f = r; st.want = r; } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // capillary rise slows as the front climbs (roughly distance² ∝ time)
        if (ISO.still()) st.f = st.want;
        else if (st.f < st.want) st.f = Math.min(st.want, st.f + dt * 0.11 / (0.25 + st.f));
        draw();
        return st.f < st.want;
      };
      g.readout = () => {
        const moved = (TOPS - BASEL) * st.f;
        return moved < 1 ? "black ink spot on the pencil line · solvent below the line" : `solvent moved ${moved.toFixed(0)} mm · ${DYES.map((d) => `${d.name} ${(d.rf * moved).toFixed(0)} mm (Rf ${d.rf})`).join(" · ")}`;
      };
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
