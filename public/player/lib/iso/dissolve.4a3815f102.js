// "dissolve cx cy size c=purple|blue|green t=0..1 lab=1 lit=crystal|beaker|bottle|particles |text" — a crystal
// dissolving in still water, on a white tile. A 250 mL beaker of water; at its foot a crystal (purple: potassium
// permanganate KMnO₄, blue: copper(II) sulfate, green: nickel(II) sulfate); its reagent bottle, a spatula and a
// stirring rod beside it. set({ t }) runs time on: the crystal shrinks as its particles leave its surface, coloured
// streaks rise, the coloured layer at the bottom deepens and thins as the particles spread out (diffusion) until the
// whole beaker is evenly, palely coloured; the dots are the dissolved particles (drawn hugely enlarged).
// Undisturbed this takes hours; stirring makes it minutes.
(() => {
  const K = window.K, G = window.G;
  const MAT = { x: -96, y: -62, w: 200, d: 124, r: 4 }, R = 34, H = 92, LEVEL = 66;
  const CHEMS = { purple: ["potassium permanganate", "KMnO₄", "#7b2fa8"], blue: ["copper(II) sulfate", "CuSO₄", "#2f7fd0"], green: ["nickel(II) sulfate", "NiSO₄", "#4fa86a"] };
  const PART = Array.from({ length: 56 }, (_, i) => {
    const a = i * 2.39996, f1 = (0.5 + i * 0.7548777) % 1, f2 = (0.5 + i * 0.5698403) % 1, rr = Math.sqrt(f2) * (R - 4);
    return { s: [Math.cos(a) * 3 * f2, Math.sin(a) * 3 * f2, 3 + 4 * f1], e: [Math.cos(a) * rr, Math.sin(a) * rr, 4 + f1 * (LEVEL - 8)], k: 0.6 + 0.8 * f1 };
  });

  ISO.add({
    name: "dissolve", title: "Dissolving", compare: "dissolve 480 260 230 c=purple",
    about: "A crystal dissolving in still water: its particles spread out through the water until the colour is even.",
    line: "dissolve cx cy size c=purple|blue|green t=0..1 lab=1 lit=crystal|beaker|bottle|particles |text",
    demo: { line: "dissolve 480 270 240 c=purple", script: [{ set: { lit: "crystal" }, hold: 1.2 }, { set: { t: 0.4, lit: "particles" }, hold: "settle" }, { set: { t: 1, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 230], o, tx, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S;
      const lab = o.lab !== "0", [cname, formula, col] = CHEMS[o.c] || CHEMS.purple, W = size * 1.9, Hh = size * 1.4;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 4), [0, 0, H + 40], [-70, -40, 70]], cx, cy, W, Hh, { azimuth: 56, elevation: 24 }, parent);
      const st = { t: ISO.clamp(ISO.num(o, "t", 0), 0, 1), want: 0, lit: o.lit || "", litDrawn: null };
      st.want = st.t;
      const tile = ISO.tint("#f6f7f8", ["#c9ccd1", "#d5d8dc", "#e0e2e5", "#eaecee"], "#6c737c");
      const V = LAB.vessel(P, [0, 0, 4], CHEM.beaker(R, H), { spout: true });
      // reagent bottle (brown glass, white label) behind, a steel spatula and a glass rod on the tile
      const BX = -70, BY = 6;
      const bottle = LAB.turned(P, [BX, BY, 4], [[0, 15], [1, 16, 1], [34, 16], [40, 9, 1], [44, 7], [48, 7]], ["#5a3414", "#a8692c"], "#3a200a", { rims: [34] }) + LAB.turned(P, [BX, BY, 52], [[0, 8.5], [10, 8.5], [11, 7.6]], ["#2a2c30", "#5a5e66"], "#111") +
        `<path d="${K.pathOf([[BX - 11, BY + 15.9, 12], [BX + 11, BY + 15.9, 12], [BX + 11, BY + 15.9, 28], [BX - 11, BY + 15.9, 28]].map((p) => K.iso(p, P)), true)}" fill="#fbfbf7" stroke="#8a8a84" stroke-width="0.5"/>` + LAB.faceText(P, [BX, BY + 16, 21.5], [1, 0, 0], formula, 4.6, "#3a200a") + LAB.faceText(P, [BX, BY + 16, 15.5], [1, 0, 0], "solid", 3.2, "#6a4a2a");
      const spatula = ISO.tinted(ISO.T.steel, ISO.wbox(P, [44, 86], [36, 39], [4, 5], "hi") + ISO.poly([[38, 34.5, 4], [46, 33.5, 4], [46, 41.5, 4], [38, 40.5, 4], [38, 34.5, 5], [46, 33.5, 5], [46, 41.5, 5], [38, 40.5, 5]], ISO.BOX_F, P, "mid"));
      const rod = `<g style="${ISO.T.glass}">${S(G.solidOf([[0, 0.2], [0.6, 2.4, 1], [2, 2.8], [108, 2.8], [109, 1.4, 1]], G.frameAlong([-22, -52, 6.8], G.unit3([1, 0.18, 0])), P), { tone: "lo" })}</g>`;
      g.innerHTML = `<g>${LAB.mat(P, MAT, 4, "lo", tile)}</g><g data-name="bottle">${bottle}</g><g>${rod}${spatula}</g><g data-name="beaker">${V.back()}</g><g data-part="water"></g><g data-name="crystal" data-part="crystal"></g><g data-name="particles" data-part="parts"></g><g data-name="beaker">${V.front()}${V.scale(4 + 2 + 50 * 0.296, 4 + 2 + 200 * 0.296, 50 * 0.296, 2, { side: -0.5 })}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const crystal = (s) => {
        if (s < 0.05) return "";
        const c = Math.cos(0.5), n = Math.sin(0.5), at = (u, v, z) => [u * c - v * n, u * n + v * c, z];
        return ISO.tinted(ISO.tint(LAB.mix(col, "#ffffff", 0.2), [LAB.mix(col, "#000000", 0.45), LAB.mix(col, "#000000", 0.3), LAB.mix(col, "#000000", 0.15), col], LAB.mix(col, "#000000", 0.6)),
          ISO.poly([at(-5 * s, -3.6 * s, 6), at(5 * s, -3.6 * s, 6), at(6.6 * s, 3.6 * s, 6), at(-3.4 * s, 3.6 * s, 6), at(-4.2 * s, -2.8 * s, 6 + 4.2 * s), at(4.4 * s, -2.8 * s, 6 + 4.2 * s), at(5.6 * s, 2.8 * s, 6 + 4.2 * s), at(-2.8 * s, 2.8 * s, 6 + 4.2 * s)], ISO.BOX_F, P, "mid"));
      };
      const draw = () => {
        const tq = Math.round(st.t * 100) / 100, spread = Math.sqrt(tq);
        w.rebuild(el.water, String(tq), () => {
          const even = LAB.mix("#e4f0f8", col, 0.42 * tq), out = [V.liquid(LEVEL, even, { opacity: 0.5 })];
          // the strong layer at the foot: it deepens and fades as the particles spread up through the water
          const hl = 6 + (LEVEL - 6) * (0.12 + 0.88 * spread), a = 0.75 * (1 - tq) * (tq > 0 ? 1 : 0);
          if (a > 0.02) out.push(V.liquid(hl, LAB.mix(col, "#ffffff", 0.15 * tq), { opacity: a * 0.7, meniscus: false }));
          // coloured streaks rising from the crystal early on
          if (tq > 0 && tq < 0.7) {
            const streak = [], fade = Math.sin(Math.PI * (tq / 0.7));
            for (let k = 0; k < 5; k++) { const q = [], a0 = k * 1.3; for (let z = 8; z <= 8 + 50 * Math.min(1, tq * 3); z += 3) q.push(K.iso([Math.cos(a0) * (2 + z * 0.12) + Math.sin(z * 0.25 + k) * 2.2, Math.sin(a0) * (2 + z * 0.1), 4 + z], P)); streak.push(K.pathOf(q)); }
            out.push(`<path d="${streak.join("")}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" opacity="${(0.55 * fade).toFixed(2)}"/>`);
          }
          return out.join("");
        });
        w.rebuild(el.crystal, String(tq), () => crystal(Math.cbrt(1 - tq) * 1.15));
        w.rebuild(el.parts, String(tq), () => {
          if (tq <= 0) return "";
          const n = Math.round(PART.length * Math.min(1, tq * 2.2)), pts = [];
          for (let i = 0; i < n; i++) { const p = PART[i], f = Math.min(1, spread * p.k); pts.push(K.iso([0, 1, 2].map((j) => p.s[j] + (p.e[j] - p.s[j]) * f).map((v, j) => (j === 2 ? v + 4 : v)), P)); }
          return K.dotsSvg(pts, { size: 0.8, tone: "hi" }).replace("<g", `<g style="--anatomy-hi:${LAB.mix(col, "#000000", 0.3)}"`);
        });
        if (lab) w.rebuild(el.words, String(tq >= 1), () => LAB.word(P, lab, [0, 0, H + 26], tq >= 1 ? "dissolved: colour even all through" : `${cname} dissolving`, LAB.mix(col, "#000000", 0.2), { size: 14 }) + LAB.word(P, lab, [BX, BY, 72], formula, "#6a4a2a", { size: 12 }));
        if (st.litDrawn !== st.lit || el.crystal._fresh || el.parts._fresh) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => { if (p.t !== undefined) st.want = ISO.clamp(+p.t, 0, 1); if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        st.t = calm ? st.want : st.t + Math.sign(st.want - st.t) * Math.min(Math.abs(st.want - st.t), dt * 0.12);
        draw();
        return st.t !== st.want;
      };
      g.readout = () => `${cname} (${formula}) in still water · ${Math.round(st.t * 100)}% dissolved · ${st.t < 1 ? "particles leave the crystal and spread out by diffusion (hours if not stirred)" : "the particles are spread evenly: a solution"}`;
      draw();
      LAB.title(parent, cx, cy - Hh / 2 - 8, tx);
      return g;
    },
  });
})();
