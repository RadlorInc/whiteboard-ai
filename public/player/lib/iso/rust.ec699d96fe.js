// "rust cx cy length k=rusty|clean lab=1 lit=tube1|tube2|tube3|rack" — what iron needs to rust: three boiling tubes in a rack.
// 1: an iron nail in tap water, open to the air — it has both air (oxygen) and water, so it rusts.
// 2: a nail in boiled water (the boiling drives out dissolved air) under a layer of oil that keeps air out — no rust.
// 3: a nail on cotton wool over anhydrous calcium chloride (a drying agent) with a bung — dry air, no water — no rust.
// set({ days: 0–7 }) runs the week; rust (hydrated iron(III) oxide) spreads over nail 1 and flakes darken the water,
// worst at the waterline where air and water meet. k=rusty starts at day 7, k=clean at day 0.
(() => {
  const K = window.K, G = window.G;
  const R = 11, TL = 150, GAP = 46, XS = [-GAP, 0, GAP], SHELF = 44, X0 = -GAP - 30, XW = 2 * GAP + 60;
  const tubeProfile = () => {
    const out = [];
    for (let i = 1; i <= 7; i++) { const s = (i / 7) * R; out.push([s, Math.sqrt(Math.max(0.09, R * R - (R - s) ** 2)), 1]); }
    return [[0, 0.3], ...out, [TL - 2, R], [TL - 1, R + 1, 1], [TL, R + 0.8]];
  };
  const NAIL = [[0, 0.2], [6, 1.7], [64, 1.7], [64, 3.8], [65.6, 3.8]];

  ISO.add({
    name: "rust", title: "Rusting: air and water", compare: "rust 480 270 400",
    about: "Three nails for a week: in water and air it rusts; in boiled water under oil, or in dry air over a drying agent, it does not.",
    line: "rust cx cy length k=rusty|clean days=0-7 lab=1 lit=tube1|tube2|tube3|rack",
    demo: { line: "rust 480 270 400 k=clean", script: [{ set: { days: 3, lit: "tube1" }, hold: "settle" }, { set: { days: 7, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.1, H2 = size * 0.95, wood = ISO.T.wood;
      const { P, g } = ISO.frame([[X0, -26, 0], [X0 + XW, 26, 0], [0, 0, TL + 24], [X0, 0, TL], [X0 + XW, 0, TL]], cx, cy, W, H2, { azimuth: 62, elevation: 18 }, parent);
      const st = { d: o.k === "rusty" ? 7 : ISO.clamp(ISO.num(o, "days", 0), 0, 7) }, want = { d: st.d };
      let lit = o.lit || "";
      const tubes = XS.map((x) => LAB.vessel(P, [x, 0, 8], tubeProfile(), { base: 1, wall: 1 }));
      const k = G.scaleOf(P), tag = `${Math.round(cx)}_${Math.round(cy)}`;
      const nail = (x, z, lean, days) => {
        const ax = G.unit3([lean, 0.25 * lean, 1]), o0 = [x - ax[0] * 6, -ax[1] * 6, z];
        const out = [LAB.turned(P, o0, NAIL, ["#6f757c", "#d9dde1"], "#2e3338", { axis: ax })];
        if (days > 0.05) {
          const f = ISO.clamp(days / 7, 0, 1), spots = [];
          for (let i = 0; i < 14; i++) {
            const s = 8 + ((i * 37) % 53), p = K.iso([o0[0] + ax[0] * s, o0[1] + ax[1] * s, o0[2] + ax[2] * s], P);
            const near = Math.abs(s - 44) < 10 ? 1 : 0.55, r = (1.6 + (i % 3) * 0.7) * k * Math.min(1, f * 1.4 * near + 0.1);
            spots.push(`<ellipse cx="${(p[0] + ((i % 2) - 0.5) * 0.8 * k).toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(r * 0.9).toFixed(2)}" ry="${(r * 1.3).toFixed(2)}" fill="${["#b5562a", "#c9662e", "#a84a22", "#d9792e"][i % 4]}" opacity="${Math.min(0.95, f * 1.3 * near).toFixed(2)}"/>`);
          }
          out.push(spots.join(""));
        }
        return out.join("");
      };
      // tube contents: 1 tap water; 2 boiled water under oil; 3 drying agent, cotton wool, bung
      const contents = (i, days) => {
        const T = tubes[i], out = [];
        if (i === 0) {
          out.push(nail(XS[0], 10, 0.12, days));
          out.push(T.liquid(52, LAB.blend("#cfe6f5", "#d7a46a", days / 7 * 0.6), { opacity: 0.55 }));
          if (days > 0.5) out.push(D([0, 1, 2, 3, 4].map((j) => K.iso([XS[0] - 5 + j * 2.4, 0, 9.5 + (j % 2)], P)), { size: 1.1 + days / 7, tone: "hi" }).replace('class="iso-dots"', 'class="iso-dots" style="--anatomy-hi:#a84a22"'));
        } else if (i === 1) {
          out.push(nail(XS[1], 10, 0.1, 0));
          out.push(T.liquid(86, "#cfe6f5", { opacity: 0.55 }), T.liquid(96, "#f2d35a", { from: 86, opacity: 0.75 }));
        } else {
          const lumps = [];
          for (let j = 0; j < 18; j++) lumps.push(ISO.poly([[-2, -2, 0], [2, -1.6, 0], [1.8, 2, 0], [-1.6, 2, 0], [0, 0, 3]].map(([x, y, z]) => [XS[2] + Math.cos(j * 2.4) * (2 + (j % 4) * 2.2) + x, Math.sin(j * 2.4) * (2 + (j % 4) * 2.2) + y, 9 + Math.floor(j / 6) * 5 + z]), [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]], P, "lo"));
          out.push(lumps.join(""), T.liquid(42, "#ffffff", { from: 30, opacity: 0.9, meniscus: false }));
          out.push(nail(XS[2], 43, 0.06, 0));
        }
        return out.join("");
      };
      const tubeSvg = (i, days) => tubes[i].back() + contents(i, days) + tubes[i].front();
      const shelf = () => {
        const plan = { x: X0 + 8, y: -16, w: XW - 16, d: 32, r: 2 };
        return S(K.slabOf(plan, SHELF, 6, P, 3, 0.5), { tone: "mid" }) + XS.map((x) => `<path d="${K.pathOf(K.circleRing(x, 0, R + 1, 32).map(([a, b]) => K.iso([a, b, SHELF + 6], P)), true)}" fill="#5a4022" stroke="#7a5a2e" stroke-width="0.6"/>`).join("");
      };
      const clipAbove = (i) => { const c = K.iso([XS[i], 0, SHELF + 6], P); return `<clipPath id="ru${i}_${tag}"><path d="M${c[0] - 60} ${c[1] - 500} H${c[0] + 60} V${c[1]} H${c[0] - 60} Z ${K.pathOf(K.circleRing(XS[i], 0, R + 0.2, 32).map(([a, b]) => K.iso([a, b, SHELF + 6], P)), true)}"/></clipPath>`; };
      const base = { x: X0, y: -26, w: XW, d: 52, r: 3 };
      g.innerHTML = `<defs>${XS.map((_, i) => clipAbove(i)).join("")}</defs><path class="iso-halo" d="${K.haloOf(base, 0, 8, P)}"/>` +
        `<g data-name="rack" style="${wood}">${S(K.slabOf(base, 0, 8, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(base, 4, P, 3), { tone: "faint" }) })}${S(K.slabOf({ x: X0 + 2, y: -16, w: 6, d: 32, r: 1 }, 8, SHELF - 2, P, 2, 0.4), { tone: "mid" })}</g>` +
        XS.map((_, i) => `<g data-name="tube${i + 1}" data-part="lo${i}"></g>`).join("") + `<g data-name="rack" style="${wood}">${shelf()}</g>` +
        XS.map((_, i) => `<g data-name="tube${i + 1}" clip-path="url(#ru${i}_${tag})" data-part="hi${i}"></g>`).join("") +
        `<g data-name="rack" style="${wood}">${S(K.slabOf({ x: X0 + XW - 8, y: -16, w: 6, d: 32, r: 1 }, 8, SHELF - 2, P, 2, 0.4), { tone: "mid" })}</g><g>${LAB.bung(P, [XS[2], 0], 8 + TL - 6, R - 0.6, 12)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const dq = Math.round(st.d * 10) / 10;
        XS.forEach((_, i) => { const key = i === 0 ? String(dq) : "s"; const svg = () => tubeSvg(i, dq); w.rebuild(el["lo" + i], key, svg); w.rebuild(el["hi" + i], key, svg); });
        if (lab) w.rebuild(el.words, String(Math.round(st.d)), () => [
          LAB.word(P, lab, [XS[0] + R, 0, 8 + TL + 6], st.d > 2 ? "1 air + water: rusts" : "1 air + water", "#a84a22", { size: 12, dy: -4, anchor: "end" }),
          LAB.word(P, lab, [XS[1], 0, 8 + TL + 6], "2 no air (oil)", "#556", { size: 12, dy: -22 }),
          LAB.word(P, lab, [XS[2] - R, 0, 8 + TL + 20], "3 no water", "#556", { size: 12, dy: -4, anchor: "start" }),
          LAB.word(P, lab, [XS[2] + R + 4, 0, 22], "drying agent", "#556", { anchor: "start", size: 11 }), LAB.word(P, lab, [XS[1] + R + 4, 0, 92], "oil", "#8a6a10", { anchor: "start", size: 11 }),
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.days !== undefined) want.d = ISO.clamp(+p.days, 0, 7); if (p.k) want.d = p.k === "rusty" ? 7 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // a day every 0.6 s
        const d = want.d - st.d;
        st.d = ISO.still() ? want.d : Math.abs(d) < dt / 0.6 ? want.d : st.d + Math.sign(d) * (dt / 0.6);
        draw();
        return st.d !== want.d;
      };
      g.readout = () => `day ${st.d.toFixed(0)} of 7 · 1 air + water: ${st.d > 2 ? "rusting" : st.d > 0.5 ? "first brown spots" : "shiny"} · 2 no air: shiny · 3 no water: shiny · iron needs both oxygen and water to rust`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
