// "solutecrystal cx cy k c=purple|blue|green t=0..1 lab=0 lit=crystal|streaks" — a PART (PARTS.md, batch 5): the
// dissolve scene's crystal, one crystal of a coloured salt 12 × 7 × 5 mm lying on a surface (a beaker's `inside`),
// origin the point under its middle. purple: potassium permanganate KMnO₄ (near-black prism with a purple sheen),
// blue: copper(II) sulfate CuSO₄·5H₂O, green: nickel(II) sulfate NiSO₄·6H₂O. A six-sided prism with sloping end
// faces, a bright edge on its top facets and a growth step on its top. t = how much has dissolved: the crystal shrinks
// (size ∝ ∛(1 − t)) and, while it goes, coloured streaks rise from it into the still water (to 5 cm). set({ t }) runs
// it at the scene's pace (12 % a second, where still water really takes hours). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const CHEMS = { purple: ["potassium permanganate", "KMnO₄", "#5b1f86", 2.7, "#7b2fa8"], blue: ["copper(II) sulfate", "CuSO₄·5H₂O", "#2f7fd0", 2.29, "#2f7fd0"], green: ["nickel(II) sulfate", "NiSO₄·6H₂O", "#3f9a5c", 2.07, "#4fa86a"] };
  // the section across the prism (y, z), and each end face sloping in by 0.24 mm per mm of height (so it is flat)
  const SEC = [[-3.5, 0], [3.5, 0], [3.5, 3.1], [2.1, 5], [-2.1, 5], [-3.5, 3.1]], HL = 6, SLOPE = 0.24, TURN = 0.5;
  const at = (x, y, z, s) => { const c = Math.cos(TURN), n = Math.sin(TURN); return [(x * c - y * n) * s, (x * n + y * c) * s, z * s]; };
  const solid = (s) => {
    const V = [...SEC.map(([y, z]) => at(-HL + SLOPE * z, y, z, s)), ...SEC.map(([y, z]) => at(HL - SLOPE * z, y, z, s))], n = SEC.length;
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n), ...SEC.map((_, i) => [i, (i + 1) % n, ((i + 1) % n) + n, i + n])];
    return { V, F };
  };

  ISO.add({
    name: "solutecrystal", title: "Salt crystal (part)", compare: null,
    about: "One crystal of a coloured salt (KMnO₄ purple, CuSO₄ blue, NiSO₄ green), 12 × 7 × 5 mm, that shrinks as it dissolves while coloured streaks rise from it into still water. anchors: top",
    line: "solutecrystal cx cy k c=purple|blue|green t=0..1 lab=0 lit=crystal|streaks",
    demo: { line: "solutecrystal 480 380 60 c=purple lab=1", script: [{ set: { lit: "crystal" }, hold: 1.2 }, { set: { t: 0.4, lit: "streaks" }, hold: "settle" }, { set: { c: "blue", t: 0, lit: "" }, hold: "settle" }, { set: { t: 0.85 }, hold: "settle" }] },
    make([cx = 480, cy = 380, k = 3], o, tx, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { c: CHEMS[o.c] ? o.c : "purple", t: ISO.clamp(ISO.num(o, "t", 0), 0, 1), want: 0, lit: o.lit || "" };
      st.want = st.t;
      g.innerHTML = `<g data-part="shadow"></g><g data-name="crystal" data-part="crystal"></g><g data-name="streaks" data-part="streaks"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const crystal = (s, col) => {
        if (s < 0.05) return "";
        const { V, F } = solid(s), dark = col === CHEMS.purple[2];
        const tint = ISO.tint(LAB.mix(col, "#ffffff", dark ? 0.35 : 0.25), [LAB.mix(col, "#000000", 0.5), LAB.mix(col, "#000000", 0.35), LAB.mix(col, "#000000", 0.18), col], LAB.mix(col, "#000000", 0.65));
        // the bright edge along the top ridge, and a growth step: a slightly smaller outline on the top face
        const ridge = [at(-HL + SLOPE * 5 + 0.4, 2.1, 5.01, s), at(HL - SLOPE * 5 - 0.4, 2.1, 5.01, s)].map((p) => K.iso(p, Pm));
        const step = [[-HL + 2.2, -1.2], [HL - 2.4, -1.2], [HL - 2.4, 1.3], [-HL + 2.2, 1.3]].map(([x, y]) => K.iso(at(x, y, 5.01, s), Pm));
        return ISO.tinted(tint, ISO.poly(V, F, Pm, "mid", false)) +
          `<path d="${K.pathOf(ridge)}" stroke="#ffffff" stroke-width="${Math.max(0.5, k * 0.012).toFixed(2)}" stroke-linecap="round" opacity=".7"/>` +
          `<path d="${K.pathOf(step, true)}" fill="none" stroke="${LAB.mix(col, "#000000", 0.6)}" stroke-width="0.5" opacity=".5"/>`;
      };
      const draw = () => {
        const tq = Math.round(st.t * 100) / 100, [, , col, , ink] = CHEMS[st.c], s = Math.cbrt(1 - tq);
        w.rebuild(el.crystal, `${st.c} ${tq}`, () => crystal(s, col));
        w.rebuild(el.shadow, s >= 0.05 ? "s" + Math.round(s * 10) : "", () => s < 0.05 ? "" : `<path class="iso-halo" d="${K.haloOf({ x: -6.5 * s, y: -4.5 * s, w: 13 * s, d: 9 * s, r: 3 * s }, 0, 0.2, Pm)}"/>`);
        // the streaks: coloured threads of strong solution rising and waving, longest early on, gone by t = 0.7
        w.rebuild(el.streaks, `${st.c} ${tq}`, () => {
          if (!(tq > 0 && tq < 0.7)) return "";
          const fade = Math.sin(Math.PI * (tq / 0.7)), top = 50 * Math.min(1, tq * 3), d = [];
          for (let j = 0; j < 5; j++) {
            const q = [], a0 = j * 1.3;
            for (let z = 0; z <= top; z += 2.5) q.push(K.iso([Math.cos(a0) * (2 + z * 0.12) + Math.sin(z * 0.25 + j) * 2.2, Math.sin(a0) * (2 + z * 0.1), 4 * s + z], Pm));
            if (q.length > 1) d.push(K.pathOf(q));
          }
          return `<path d="${d.join("")}" fill="none" stroke="${ink}" stroke-width="${Math.max(1, k * 0.04).toFixed(2)}" stroke-linecap="round" opacity="${(0.55 * fade).toFixed(2)}" data-free=""/>`;
        });
        w.rebuild(el.words, lab ? `${st.c} ${tq >= 1}` : "", () => lab ? ISO.word(K.iso([7, 0, 9], Pm), tq >= 1 ? "all dissolved" : `${CHEMS[st.c][1]} crystal`, LAB.mix(col, "#000000", 0.2), { size: 14, anchor: "start" }) : "");
        g.anchors = { top: [0, 0, +(0.5 * s).toFixed(3)] };
        B11.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.c && CHEMS[p.c]) st.c = p.c;
        if (p.t !== undefined && Number.isFinite(+p.t)) { st.want = ISO.clamp(+p.t, 0, 1); if (st.want < st.t) st.t = st.want; }   // a fresh crystal is put in: no growing back
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1;
        st.t = calm ? st.want : st.t + Math.min(st.want - st.t, dt * 0.12);
        draw();
        return st.t !== st.want;
      };
      g.readout = () => {
        const [name, formula, , rho] = CHEMS[st.c], { V, F } = solid(Math.cbrt(1 - st.t)), mg = Math.round(B11.volume(V, F) * rho);
        return `${name} (${formula}) crystal 12 × 7 × 5 mm · ${Math.round(st.t * 100)} % dissolved, ${mg} mg left · ${st.t < 1 ? "its particles leave its faces and spread through the water (diffusion: hours if not stirred)" : "gone: its particles are spread through the water, a solution"}`;
      };
      draw();
      return g;
    },
  });
})();
