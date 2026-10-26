// "gasbubbles cx bottomY height w=60 lab=1 lit=tube|stand|trough | Gas" — collecting a gas over water.
// Marble chips (calcium carbonate) fizz in dilute hydrochloric acid in a conical flask: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂.
// A bung and delivery tube carry the gas over the rim of a glass trough of water and up into an upturned 100 cm³
// measuring cylinder, full of water and held by a clamp. Bubbles rise into it and push the water down; the gas volume is
// read on its scale. The rate falls as the acid is used up: V = 80 × (1 − e^(−t/12)) cm³ (sped up 3× here).
// set({ react: 1|0 }). w (the app's bubble-column width) sets nothing here.
(() => {
  const K = window.K, G = window.G;
  const CONE = [[0, 33], [0.8, 35, 1], [2.6, 36.2, 1], [5, 36.4, 1], [8, 35.2], [80, 13.5, 1], [86, 11.6, 1], [88, 11], [112, 11], [113, 12.4, 1], [115, 12.6, 1], [116.5, 11.8]];
  const FXP = -100, TR = { x0: 10, x1: 130, y0: -40, y1: 40, z0: 4, z1: 62 }, WL = 48, CX = 74, CR = 14, CLEN = 210, CZ0 = 14;
  const MM = 1000 / (Math.PI * (CR - 1) ** 2), VMAX = 80, TAU = 12;
  const ROD = [CX, -72], BENCH = { x: -150, y: -96, w: 300, d: 150, r: 4 };

  ISO.add({
    name: "gasbubbles", title: "Collecting gas over water", compare: "gasbubbles 480 420 300 w=70",
    about: "Marble chips fizz in acid; the carbon dioxide bubbles into an upturned measuring cylinder full of water and is read off its scale.",
    line: "gasbubbles cx bottomY height react=0|1 lab=1 lit=tube|stand|trough",
    demo: { line: "gasbubbles 480 470 400", script: [{ set: { react: 1, lit: "tube" }, hold: 5 }, { set: { lit: "stand" }, hold: 6 }] },
    make([cx, yb, size = 300], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.5, H2 = size * 1.0, cy = yb - H2 / 2;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, 0, 3), [CX, 0, CZ0 + CLEN + 10], [ROD[0], ROD[1], CZ0 + CLEN + 20], [FXP, 0, 170]], cx, cy, W, H2, { azimuth: 60, elevation: 20 }, parent);
      const st = { on: +o.react ? 1 : 0, t: +o.react ? 60 : 0, clock: 0 };
      let lit = o.lit || "";
      const flask = LAB.vessel(P, [FXP, 0, 3], CONE, { base: 2 });
      const cyl = LAB.vessel(P, [CX, 0, CZ0 + CLEN], [[0, CR - 1.5], [1.2, CR, 1], [CLEN - 2, CR], [CLEN - 1, CR + 0.8, 1], [CLEN, CR + 0.6]], { axis: [0, 0, -1], base: 1.5, wall: 1 });
      const box = (pts, fill, op, stroke = "none") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="0.8"/>`;
      const { x0, x1, y0, y1, z0, z1 } = TR;
      const troughBack = ISO.wbox(P, [x0 - 2, x1 + 2], [y0 - 2, y1 + 2], [0, z0], "mid") + box([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], "#eef6fb", 1, LAB.GLASS) + box([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], "#e7f1f8", 1, LAB.GLASS) +
        // a beehive shelf the cylinder stands on, with the tube's notch
        ISO.wbox(P, [CX - 22, CX + 22], [-18, 18], [z0, CZ0 - 2], "mid");
      const water = box([[x0, y1, z0], [x1, y1, z0], [x1, y1, WL], [x0, y1, WL]], "#4f93d6", 0.2) + box([[x1, y0, z0], [x1, y1, z0], [x1, y1, WL], [x1, y0, WL]], "#2b6cc4", 0.22) + box([[x0, y0, WL], [x1, y0, WL], [x1, y1, WL], [x0, y1, WL]], "#bfdcf5", 0.45, "#4f93d6");
      const e = (a, b) => K.segment(a, b, P);
      const troughFront = `<path d="${[e([x0, y1, z0], [x1, y1, z0]), e([x1, y1, z0], [x1, y0, z0]), e([x0, y1, z1], [x1, y1, z1]), e([x1, y1, z1], [x1, y0, z1]), e([x0, y0, z1], [x0, y1, z1]), e([x1, y0, z1], [x0, y0, z1]), e([x0, y1, z0], [x0, y1, z1]), e([x1, y1, z0], [x1, y1, z1]), e([x1, y0, z0], [x1, y0, z1])].join("")}" fill="none" stroke="${LAB.GLASS}" stroke-width="1.4" stroke-linecap="round"/>`;
      // bung and delivery tube: up out of the flask, over the trough's rim, down and under the cylinder's mouth
      const neckTop = 3 + 116.5;
      const route = LAB.bend([[FXP, 0, neckTop - 6], [FXP, 0, neckTop + 34], [x0 + 12, 0, neckTop + 34], [x0 + 12, 0, z0 + 6], [CX - 4, 0, z0 + 6], [CX - 4, 0, CZ0 + 6]], 8);
      const tube = LAB.tube(P, route, 2.2, { inner: "#ffffff" });
      const cl = LAB.clamp(P, ROD, CZ0 + 140, [0, 1], 72, CR + 0.4, { jawH: 14 });
      const chips = () => {
        const out = [];
        for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 6 + (i % 3) * 8; out.push(ISO.tinted(ISO.T.road, ISO.poly([[-3, -3, 0], [3, -2.5, 0], [3.4, 3, 0], [-2.6, 3.2, 0], [0, 0, 4.4]].map(([x, y, z]) => [FXP + Math.cos(a) * r + x, Math.sin(a) * r + y, 5 + z]), [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]], P, "hi"))); }
        return out.join("");
      };
      g.innerHTML = `<g>${LAB.mat(P, BENCH, 3, "lo", ISO.T.wood)}</g><g data-name="stand">${LAB.standBase(P, { x: ROD[0] - 30, y: ROD[1] - 22, w: 60, d: 40, r: 4 }, ROD)}${LAB.rod(P, ROD, 14, CZ0 + CLEN + 20)}${LAB.boss(P, ROD, CZ0 + 140, [0, 1])}${cl.back}</g>` +
        `<g data-name="trough">${troughBack}</g><g data-name="cylinder"><g data-part="cyl"></g></g><g data-part="cbub"></g><g data-name="tube">${tube}</g><g data-name="trough">${water}${troughFront}</g><g data-name="stand">${cl.front}</g>` +
        `<g data-name="flask">${flask.back()}${chips()}<g data-part="fbub"></g>${flask.liquid(50, "colourless", { opacity: 0.5 })}${flask.front()}${LAB.bung(P, [FXP, 0], neckTop - 7, 11, 10)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const vol = () => VMAX * (1 - Math.exp(-st.t / TAU));
      const draw = () => {
        const v = Math.round(vol() * 4) / 4, gl = 1.5 + v * MM;
        w.rebuild(el.cyl, String(v), () => cyl.back() + cyl.liquid(Math.max(2, gl), "#a9d3f2", { opacity: 0.7 }) + cyl.front() + cyl.scale(1.5 + 10 * MM, 1.5 + 100 * MM, 2 * MM, 5, { side: -0.4 }));
        const tq = Math.round(st.clock * 24) / 24, rate = st.on ? Math.exp(-st.t / TAU) : 0;
        w.rebuild(el.cbub, rate > 0.03 ? String(tq) : "", () => {
          if (rate <= 0.03) return "";
          const out = [], top = CZ0 + CLEN - gl - 1;
          for (let i = 0; i < Math.ceil(7 * rate); i++) { const ph = (tq * 1.6 + i / 7) % 1, z = CZ0 + 4 + ph * (top - CZ0 - 4); out.push(LAB.bubble(P, [CX - 4 + Math.sin(i * 2 + ph * 4) * 4, Math.cos(i) * 3, z], 1.2 + ph)); }
          return out.join("");
        });
        w.rebuild(el.fbub, rate > 0.03 ? String(tq) : "", () => {
          if (rate <= 0.03) return "";
          const out = [];
          for (let i = 0; i < Math.ceil(16 * rate); i++) { const ph = (tq * 1.2 + i * 0.137) % 1, a = i * 2.4, r = 4 + (i % 4) * 6; out.push(LAB.bubble(P, [FXP + Math.cos(a) * r, Math.sin(a) * r, 10 + ph * 38], 0.8 + ph * 0.8)); }
          return out.join("");
        });
        if (lab) w.rebuild(el.words, String(Math.round(vol())), () => [
          LAB.word(P, lab, [CX + CR + 4, 0, CZ0 + CLEN - gl], `${vol().toFixed(0)} cm³ gas`, "#2b6cc4", { anchor: "start", size: 14 }),
          LAB.word(P, lab, [FXP, 36, 0], "marble chips + acid", "#556", { dy: 16, size: 12 }), LAB.word(P, lab, [x1, y1, 0], "water trough", "#556", { anchor: "start", dy: 14, size: 12 }),
          t ? LAB.word(P, lab, [CX, 0, CZ0 + CLEN + 6], t, "#2b6cc4", { dy: -6, size: 14 }) : "",
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.react !== undefined) { st.on = +p.react ? 1 : 0; if (!st.on) st.t = 0; } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt, c) => {
        st.clock = c || st.clock + dt;
        if (st.on) st.t = ISO.still() ? 60 : st.t + dt * 3;
        draw();
        return false;
      };
      g.readout = () => (st.on ? `CO₂ collected ${vol().toFixed(1)} cm³ after ${(st.t).toFixed(0)} s · rate ${(VMAX / TAU * Math.exp(-st.t / TAU)).toFixed(1)} cm³/s and falling` : "marble chips in acid · cylinder full of water");
      draw();
      return g;
    },
  });
})();
