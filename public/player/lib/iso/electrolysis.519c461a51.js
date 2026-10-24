// "electrolysis cx cy size k=water|nacl lab=1 lit=cathode|anode|supply|cell" — electrolysis with the gases collected.
// A glass cell on a base with two carbon electrodes coming up through its floor, each under an upturned test tube
// full of the electrolyte. A DC power pack (6 V) drives the current through red and black leads. Gas bubbles off each
// electrode and collects at the top of its tube, pushing the liquid down.
// water (dilute sulfuric acid): hydrogen at the cathode (−) comes off twice as fast as oxygen at the anode (+), because
// 2H₂O → 2H₂ + O₂. nacl (concentrated brine, NaCl solution): hydrogen at the cathode and pale yellow-green chlorine at
// the anode, about the same volume (a little chlorine dissolves). set({ on: 1|0 }); 1 cm³ of gas fills 5 mm of tube.
(() => {
  const K = window.K, G = window.G;
  const R = 46, H = 112, OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  const BASEZ = 14, LIQ = 88, TR = 9, TLEN = 92, TBOT = 6, EX = 20, TUBE = [[0, 0.4], ...Array.from({ length: 7 }, (_, i) => { const s = ((i + 1) / 7) * TR; return [s, Math.sqrt(Math.max(0.1, TR * TR - (TR - s) ** 2)), 1]; }), [TLEN, TR]];
  const MMCM3 = 1000 / (Math.PI * (TR - 0.9) ** 2), PACK = { x: 62, y: -40, w: 70, d: 56 };

  ISO.add({
    name: "electrolysis", title: "Electrolysis", compare: "electrolysis 480 280 360 k=water",
    about: "Electrolysis of water with the gases caught in upturned tubes: hydrogen at the cathode, twice the volume of oxygen at the anode.",
    line: "electrolysis cx cy size k=water|nacl on=0|1 lab=1 lit=cathode|anode|supply|cell",
    demo: { line: "electrolysis 480 280 360 k=water", script: [{ set: { on: 1, lit: "supply" }, hold: 5 }, { set: { lit: "" }, hold: 4 }, { set: { on: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", brine = o.k === "nacl", W = size * 1.45, H2 = size * 1.05;
      const BENCH = { x: -70, y: -70, w: 210, d: 150, r: 4 };
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, 0, 3), [0, 0, BASEZ + H + 30], [PACK.x + PACK.w, PACK.y, 60]], cx, cy, W, H2, { azimuth: 60, elevation: 22 }, parent);
      const st = { on: +o.on ? 1 : 0, gas: 0, clock: 0 };
      let lit = o.lit || "";
      const cell = LAB.vessel(P, [0, 0, BASEZ + 3], OUTER, { base: 3 });
      const tube = (x) => LAB.vessel(P, [x, 0, BASEZ + TBOT + TLEN], TUBE, { axis: [0, 0, -1], base: 0, wall: 0.9, rim: true });
      const tubes = { cat: tube(-EX), an: tube(EX) };
      const elec = (x) => `<g style="${ISO.T.plastic}">${S(K.cylinder(x, 0, 2.8, BASEZ + 3, 44, P, 16), { tone: "hi", crease: "none" })}</g>`;
      // base with its terminals; the power pack with a voltage dial, switch and terminals
      const base = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf({ x: -54, y: -54, w: 108, d: 108, r: 4 }, 0, BASEZ, P)}"/>`, ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: -54, y: -54, w: 108, d: 108, r: 4 }, 3, BASEZ - 3, P, 3, 0.6), { tone: "hi" }))];
        for (const [x, col] of [[-EX, ISO.T.plastic], [EX, ISO.T.red]]) out.push(ISO.tinted(col, S(K.cylinder(x, 50, 4, BASEZ, 6, P, 18, 0.4), { tone: "hi" })));
        return out.join("");
      };
      const pack = () => {
        const { x, y, w, d } = PACK, out = [ISO.tinted(ISO.T.paint, S(K.slabOf({ x, y, w, d, r: 3 }, 3, 44, P, 3, 0.8), { tone: "mid" }))];
        out.push(`<path d="${K.pathOf([[x + 8, y + 10, 47.05], [x + 40, y + 10, 47.05], [x + 40, y + 26, 47.05], [x + 8, y + 26, 47.05]].map((p) => K.iso(p, P)), true)}" fill="#2e3a2e" stroke="#1d2329" stroke-width="0.6"/>`);
        out.push(LAB.faceText(P, [x + 24, y + 18, 47.1], [1, 0, 0], "6.0 V", 7, "#9ff08a", [0, -1, 0]));
        out.push(S(K.cylinder(x + 54, y + 18, 7, 47, 6, P, 28, 0.4), { tone: "hi", inner: L(K.knurl(x + 54, y + 18, 7, 48, 52.5, 24, P), { tone: "lo" }) }));
        for (const [xx, col] of [[x + 16, ISO.T.red], [x + 34, ISO.T.plastic]]) out.push(ISO.tinted(col, S(K.cylinder(xx, y + 44, 3.6, 47, 6, P, 18, 0.4), { tone: "hi" })));
        return out.join("");
      };
      const lead = (tx, bx, col, lane) => LAB.hose(P, LAB.bend([[tx, PACK.y + 44, 53], [tx, PACK.y + 44, 60], [tx, 62 + lane, 4.5], [bx, 62 + lane, 4.5], [bx, 50, 19]], 7), 1.4, col);
      const leads = lead(PACK.x + 16, EX, "#d0392b", 0) + lead(PACK.x + 34, -EX, "#26282c", 6);
      g.innerHTML = `<g>${LAB.mat(P, BENCH, 3, "lo", ISO.T.wood)}</g><g data-name="supply">${pack()}</g><g data-name="cell">${base()}${cell.back()}</g>` +
        `<g data-name="cathode">${elec(-EX)}</g><g data-name="anode">${elec(EX)}</g><g>${cell.liquid(LIQ, "#a9d3f2", { opacity: 0.55 })}</g>` +
        `<g data-part="cat" data-name="cathode"></g><g data-part="an" data-name="anode"></g><g data-part="bub"></g><g>${cell.front()}</g><g data-name="supply">${leads}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const gasLen = (which) => st.gas * (which === "cat" ? 1 : brine ? 0.9 : 0.5);
      const tubeSvg = (which) => {
        const T = tubes[which], gl = gasLen(which);
        const gasCol = which === "an" && brine ? "#d9e86a" : null;
        return T.back() + T.liquid(Math.max(0.5, gl), "#a9d3f2", { opacity: 0.8, meniscus: true }) +
          (gasCol && gl > 1 ? `<path d="${LAB.vessel(P, [T.F.o[0], 0, T.F.o[2]], TUBE.filter((q) => q[0] <= gl).concat([[gl, TR]]), { axis: [0, 0, -1] }).sil}" fill="${gasCol}" fill-opacity=".45"/>` : "") +
          T.front({ shine: true }) + T.scale(4, 74, 5, 2, { side: -0.5 });
      };
      const draw = () => {
        const gq = Math.round(st.gas * 4) / 4;
        w.rebuild(el.cat, String(gq), () => tubeSvg("cat"));
        w.rebuild(el.an, String(gq), () => tubeSvg("an"));
        const tq = Math.round(st.clock * 24) / 24;
        w.rebuild(el.bub, st.on ? `${tq} ${gq}` : "", () => {
          if (!st.on) return "";
          const out = [];
          for (const [which, x, n] of [["cat", -EX, 8], ["an", EX, brine ? 7 : 4]]) {
            const top = BASEZ + TBOT + TLEN - gasLen(which) - 1, bot = BASEZ + 3 + 44;
            for (let i = 0; i < n; i++) { const ph = (tq * 1.3 + i / n) % 1, z = bot + ph * (top - bot); if (z < top) out.push(LAB.bubble(P, [x + Math.sin(i * 2.1 + ph * 3) * 3.5, Math.cos(i * 1.3) * 3, z], 0.9 + ph * 0.6)); }
            for (let i = 0; i < 5; i++) out.push(LAB.bubble(P, [x + Math.cos(i * 1.26) * 3, Math.sin(i * 1.26) * 3, bot - 4 - ((tq * 3 + i * 0.2) % 1) * 30 * 0], 0.7));
          }
          return out.join("");
        });
        if (lab) w.rebuild(el.words, String(Math.round(st.gas)), () => {
          const v = (x) => (x / MMCM3).toFixed(1);
          return [
            LAB.word(P, lab, [-EX, 0, BASEZ + TBOT + TLEN + 6], `${brine ? "hydrogen" : "hydrogen"} ${v(gasLen("cat"))} cm³`, "#2b6cc4", { anchor: "end", size: 13, dy: -4 }),
            LAB.word(P, lab, [EX, 0, BASEZ + TBOT + TLEN + 6], `${brine ? "chlorine" : "oxygen"} ${v(gasLen("an"))} cm³`, brine ? "#7a8a10" : "#c0392b", { anchor: "start", size: 13, dy: -4 }),
            LAB.word(P, lab, [-EX, 54, 0], "cathode (−)", "#2b6cc4", { anchor: "end", dy: 16, size: 12 }), LAB.word(P, lab, [EX, 54, 0], "anode (+)", "#c0392b", { anchor: "start", dy: 16, size: 12 }),
          ].join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.on !== undefined) st.on = +p.on ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt, c) => {
        st.clock = c || st.clock + dt;
        if (st.on) st.gas = Math.min(70, st.gas + dt * (ISO.still() ? 70 : 6.5));
        draw();
        return false;
      };
      g.readout = () => {
        const a = gasLen("cat") / MMCM3, b = gasLen("an") / MMCM3;
        return `${st.on ? "current on, 6 V" : "switched off"} · cathode (−): hydrogen ${a.toFixed(1)} cm³ · anode (+): ${brine ? "chlorine" : "oxygen"} ${b.toFixed(1)} cm³${a > 0.5 ? ` · ratio ${(a / b).toFixed(1)} : 1` : ""}`;
      };
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
