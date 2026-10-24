// "gaslaw cx cy width k=boyle|charles|gaylussac|ideal p=100..300 T=0..100 lab=1 lit=piston|weights|gauge|bath|hotplate|graph|pin"
// — a fixed amount of air (100 mL at 100 kPa and 20 °C) trapped under a piston in a glass cylinder (inside 33.6 mm
// across: 1 mL = 1.13 mm of height). The cylinder stands in a water bath on a hotplate, held by a clamp; a thin tube
// from its foot runs to a pressure gauge; a thermometer reads the bath; slotted masses on the piston's platform set
// the pressure (each 2.26 kg adds 25 kPa on the piston's 8.87 cm²). A card plots the law. k=boyle (T fixed: add
// masses, the gas squeezes, p × V stays 10 000 kPa·mL), charles (p fixed: heat it, V grows in step with the kelvin
// temperature), gaylussac (a pin locks the piston: heat it, p grows with the kelvin temperature), ideal (pV = nRT,
// n = 4.1 mmol: set both). set({ p }) in kPa, set({ T }) in °C. The dots are the gas molecules; their tails grow as
// they speed up (speed ∝ √T in kelvin). lab=0 hides the words.
(() => {
  const K = window.K, G = window.G;
  const BOARD = { x: -122, y: -76, w: 300, d: 146, r: 4 }, ROD = [-96, -46], CYH = 172, CLZ = 176, RL = 140, BR = 52, BH = 108, ZH = 22, CR = 18, CRIN = 16.8, ZC0 = ZH + 6;
  const MMPERML = 1000 / (Math.PI * CRIN * CRIN), Z0 = ZC0 + 3;   // gas starts 3 mm above the cylinder's outside foot
  const N_MOL = (100 * 100e-6) / (8.314 * 293.15) * 1000;          // mmol of air
  const KS = { boyle: "Boyle's law · T fixed · p × V = constant", charles: "Charles's law · p fixed · V ∝ T (kelvin)", gaylussac: "pressure law · V fixed · p ∝ T (kelvin)", ideal: "ideal gas · pV = nRT" };
  const MOL = Array.from({ length: 38 }, (_, i) => { const a = i * 2.39996, r = Math.sqrt((0.5 + i * 0.5698403) % 1) * (CRIN - 2.5), f = (0.5 + i * 0.7548777) % 1; const d = (i * 1.7) % (Math.PI * 2); return [Math.cos(a) * r, Math.sin(a) * r, f, Math.cos(d), Math.sin(d) * 0.6, Math.sin(d * 1.3) * 0.8]; });

  ISO.add({
    name: "gaslaw", title: "Gas laws: piston and cylinder", compare: "gaslaw 480 270 460 k=boyle",
    about: "Air trapped under a piston in a water bath: add masses (pressure) or heat the bath (temperature) and watch the volume, gauge and graph follow the gas laws.",
    line: "gaslaw cx cy width k=boyle|charles|gaylussac|ideal p=100..300 T=0..100 lab=1 lit=piston|weights|gauge|bath|hotplate|graph|pin",
    demo: { line: "gaslaw 480 270 460 k=boyle", script: [{ set: { p: 200, lit: "weights" }, hold: "settle" }, { set: { p: 300, lit: "gauge" }, hold: "settle" }, { set: { lit: "graph" }, hold: 1.6 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S, L = LAB.L;
      const lab = o.lab !== "0", k = KS[o.k] ? o.k : "boyle", W = size * 1.25, H = size * 1.0;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -10, 0), [ROD[0], ROD[1], 250], [0, 0, ZC0 + 3 + 100 * 1000 / (Math.PI * 16.8 * 16.8) + 10 + RL + 30], [170, 40, 140]], cx, cy, W, H, { azimuth: 60, elevation: 18 }, parent);
      const st = { p: ISO.clamp(ISO.num(o, "p", 100), 100, 300), T: ISO.clamp(ISO.num(o, "T", 20), 0, 100), wp: 0, wT: 0, lit: o.lit || "", litDrawn: null };
      if (k === "charles") st.p = 100; if (k === "boyle") st.T = ISO.clamp(ISO.num(o, "T", 20), 0, 100);
      st.wp = st.p; st.wT = st.T;
      // the state: which two of p, V, T the knobs set, and the third from pV = nRT
      const lockedV = k === "gaylussac";
      const volOf = (p, T) => (lockedV ? 100 : (100 * (100 / p) * (T + 273.15)) / 293.15);
      const presOf = (p, T) => (lockedV ? (100 * (T + 273.15)) / 293.15 : p);
      const out = [ISO.baseboard(P, BOARD, { h: 6, feet: 3, tint: ISO.T.wood })];
      // hotplate: a steel case with a ceramic top, a knob and a lamp
      out.push(`<g data-name="hotplate">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [-62, 62], [-62, 62], [0, ZH - 3], "mid"))}${ISO.tinted(ISO.tint("#e9e4dc", ["#b9b2a4", "#c6bfb1", "#d2ccbf", "#ddd8cc"], "#6d6658"), ISO.wbox(P, [-58, 58], [-58, 58], [ZH - 3, ZH], "hi"))}` +
        `${ISO.tinted(ISO.T.plastic, S(G.disc(62, 68, 6, G.frameOf([0, 40, 9], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" }))}<g data-part="lamp"></g></g>`);
      // retort stand and clamp at the cylinder's top
      const cl = LAB.clamp(P, ROD, CLZ, [0.9, 0.44], Math.hypot(ROD[0], ROD[1]), CR + 0.6);
      out.push(`<g data-name="stand">${LAB.standBase(P, { x: ROD[0] - 22, y: ROD[1] - 22, w: 44, d: 40, r: 3 }, ROD)}${LAB.rod(P, ROD, 14, 250)}${LAB.boss(P, ROD, CLZ, [0.9, 0.44])}${cl.back}</g>`);
      // the gauge on its own little stand, with the tube from the cylinder's foot
      const GX = -86, GY = 40, GZ = 80;
      out.push(`<g data-name="gauge">${ISO.tinted(ISO.T.steel, S(K.cylinder(GX, GY, 8, 0, 2, P, 20), { tone: "lo" }) + S(K.cylinder(GX, GY, 1.6, 2, GZ - 18, P, 12), { tone: "mid" }))}` +
        `${ISO.tinted(ISO.T.steel, S(G.disc(-3, 3, 16, G.frameOf([GX, GY, GZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }))}<path d="${G.circleOf(G.frameOf([GX, GY, GZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 3.05, 14, P)}" fill="#fbfbf7" stroke="#33506f" stroke-width="0.8"/>` +
        `${(() => { const d = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.25 - (i / 8) * 1.5), r0 = i % 2 ? 11.6 : 10.4; d.push(K.pathOf([K.iso([GX + Math.cos(a) * r0, GY + 3.1, GZ + Math.sin(a) * r0], P), K.iso([GX + Math.cos(a) * 13.2, GY + 3.1, GZ + Math.sin(a) * 13.2], P)])); } return `<path d="${d.join("")}" stroke="#33506f" stroke-width="0.7" fill="none"/>`; })()}` +
        `<g transform="${ISO.faceMatrix(P, [GX, GY + 3.12, GZ - 6], 1)}"><text text-anchor="middle" style="font:700 3.4px 'Helvetica Neue',Arial,sans-serif" fill="#33506f">kPa</text></g>` +
        `<g transform="${ISO.faceMatrix(P, [GX - 9.5, GY + 3.12, GZ - 8.5], 1)}"><text text-anchor="middle" style="font:600 2.8px 'Helvetica Neue',Arial,sans-serif" fill="#33506f">0</text></g><g transform="${ISO.faceMatrix(P, [GX + 9.5, GY + 3.12, GZ - 8.5], 1)}"><text text-anchor="middle" style="font:600 2.8px 'Helvetica Neue',Arial,sans-serif" fill="#33506f">400</text></g>` +
        `${LAB.hose(P, LAB.bend([[GX, GY - 3, GZ - 14], [GX + 4, GY - 12, GZ - 40], [-34, -24, ZH + BH + 14], [-30, -22, ZH + BH + 4], [-26, -16, 40], [-19, -11, ZC0 + 6]], 8), 1.3, "#d8dde2")}${ISO.tinted(ISO.T.glass, S(G.disc(CR - 1, CR + 3.5, 2, G.frameAlong([0, 0, ZC0 + 6], G.unit3([-0.86, -0.5, 0])), P), { tone: "lo" }))}</g>`);
      g.innerHTML = out.join("") + `<g data-name="bath" data-part="bathBack"></g><g data-part="cylBack"></g><g data-part="gas"></g><g data-name="piston" data-part="piston"></g><g data-part="cylFront"></g><g data-name="bath" data-part="bathFront"></g><g>${cl.front}</g><g data-name="piston" data-part="ptop"></g><g data-name="weights" data-part="weights"></g><g data-name="pin" data-part="pin"></g><g data-name="graph" data-part="card"></g><g data-part="dot"></g><g data-part="needle"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const bath = LAB.vessel(P, [0, 0, ZH], CHEM.beaker(BR, BH), { spout: true }), cyl = LAB.vessel(P, [0, 0, ZC0], [[0, 2], [1, CR - 1, 1], [2.5, CR, 1], [CYH - 4, CR], [CYH - 2, CR + 1.4, 1], [CYH, CR + 1]], { base: 3, wall: 1.2 });
      const TH_FOOT = [26, 28, ZH + 4], TH_AX = G.unit3([0.06, 0.07, 1]), TH_LEN = 180, sT = (T) => 26 + T * 1.1;
      // (the audit lists the piston, the leaning thermometer and the gauge's nozzle as loose: they sit in the glass
      // cylinder and the bath, which are LAB.vessel outlines it doesn't record; the seals sit in the piston's grooves)
      el.bathBack.innerHTML = bath.back();
      el.cylBack.innerHTML = cyl.back();
      el.cylFront.innerHTML = cyl.front() + cyl.scale(Z0 - ZC0, Z0 - ZC0 + 140 * MMPERML, 10 * MMPERML, 5, { side: 0.5 });
      el.piston.innerHTML = ISO.tinted(ISO.T.steel, S(G.solidOf([[0, CRIN - 0.2], [10, CRIN - 0.2]], LAB.Z([0, 0, Z0]), P), { tone: "mid" })) + ISO.tinted(ISO.T.rubber, S(G.solidOf([[2, CRIN], [3.6, CRIN]], LAB.Z([0, 0, Z0]), P), { tone: "hi" }) + S(G.solidOf([[6.4, CRIN], [8, CRIN]], LAB.Z([0, 0, Z0]), P), { tone: "hi" })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3, Z0 + 10, RL, P, 16), { tone: "mid" }));
      el.ptop.innerHTML = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3, Z0 + 10 + RL, 4, P, 16), { tone: "mid" }) + S(K.cylinder(0, 0, 26, Z0 + 14 + RL, 3, P, 40, 0.4), { tone: "mid" }));
      // the pin through the rod, resting across the cylinder's rim, holds the volume fixed (pressure law)
      if (lockedV) el.pin.innerHTML = ISO.tinted(ISO.T.red, ISO.wbox(P, [-30, 30], [-2, 2], [ZC0 + CYH, ZC0 + CYH + 4], "hi"));
      const statics = bath.front() + bath.scale(20, 100, 10, 5, { side: -0.7 });
      // the card on its easel: the law's graph, with a dot for now
      const CX0 = 72, CY = 34, CZ0 = 22, CWd = 100, CHt = 80;
      const card = () => {
        const out = [ISO.tinted(ISO.T.wood, ISO.wbox(P, [CX0 + 6, CX0 + 10], [CY - 2, CY + 2], [0, CZ0 + 68], "mid") + ISO.wbox(P, [CX0 + CWd - 10, CX0 + CWd - 6], [CY - 2, CY + 2], [0, CZ0 + 68], "mid") + ISO.wbox(P, [CX0 + 2, CX0 + CWd - 2], [CY + 2, CY + 7], [CZ0 - 4, CZ0], "mid"))];
        out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [CX0, CX0 + CWd], [CY + 2, CY + 3.2], [CZ0, CZ0 + CHt], "hi")));
        const m = ISO.faceMatrix(P, [CX0, CY + 3.25, CZ0 + CHt], 1), gx = (u) => 14 + u * (CWd - 22), gy = (v) => CHt - 14 - v * (CHt - 26);
        const tag = (x, y, s, a = "start", f = 3.8, c = "#33404c") => `<text x="${x}" y="${y}" text-anchor="${a}" fill="${c}" style="font:600 ${f}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;
        let path = "", xl = "", yl = "";
        if (k === "boyle" || k === "ideal") { const q = []; for (let V = 30; V <= 130; V += 4) q.push([gx((V - 25) / 110), gy((10000 / V - 50) / 300)]); path = "M" + q.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L"); xl = "volume V (mL) →"; yl = "pressure p"; }
        else if (k === "charles") { path = `M${gx(0)} ${gy(0)} L${gx(1)} ${gy(1)}`; xl = "temperature (K) →"; yl = "volume V"; }
        else { path = `M${gx(0)} ${gy(0)} L${gx(1)} ${gy(1)}`; xl = "temperature (K) →"; yl = "pressure p"; }
        const dash = k === "charles" || k === "gaylussac" ? `<path d="M${gx(0)} ${gy(0)} L14 ${CHt - 14}" stroke="#2f6fae" stroke-width="0.6" stroke-dasharray="1.5 1.5"/>${tag(15, CHt - 9.5, "0 K = −273 °C", "start", 3.2, "#2f6fae")}` : "";
        out.push(`<g transform="${m}"><path d="M14 8 V${CHt - 14} H${CWd - 6}" fill="none" stroke="#33404c" stroke-width="0.6"/><path d="${path}" fill="none" stroke="#2f6fae" stroke-width="1"/>${dash}${tag(CWd / 2 + 4, CHt - 4, xl, "middle")}${tag(6, 6, yl)}</g>`);
        return out.join("");
      };
      el.card.innerHTML = card();
      const dotAt = (p, V, T) => {
        const gx = (u) => 14 + u * (CWd - 22), gy = (v) => CHt - 14 - v * (CHt - 26);
        const [u, v] = k === "boyle" || k === "ideal" ? [(V - 25) / 110, (p - 50) / 300] : k === "charles" ? [(T + 273.15 - 263) / 120, (V - 85) / 50 * 0.9 + 0.05] : [(T + 273.15 - 263) / 120, (p - 85) / 50 * 0.9 + 0.05];
        return `<g transform="${ISO.faceMatrix(P, [CX0, CY + 3.3, CZ0 + CHt], 1)}"><circle cx="${gx(u).toFixed(2)}" cy="${gy(v).toFixed(2)}" r="2.2" fill="#d0392b" stroke="#fff" stroke-width="0.6"/></g>`;
      };
      // the moving parts: gas, molecules, piston, rod, platform and masses; the bath's water; the needle; the lamp
      const draw = () => {
        const p = presOf(st.p, st.T), V = volOf(st.p, st.T), h = V * MMPERML, zp = Z0 + h, T = st.T, nMass = k === "boyle" || k === "ideal" ? Math.round((st.wp - 100) / 25) : 0;
        const hq = Math.round(h * 2) / 2, up = K.translateAlong(P, [0, 0, h]);
        w.rebuild(el.gas, `${hq} ${Math.round(T / 5)}`, () => {
          const out = [cyl.liquid(hq + 3, "#f2f6fa", { opacity: 0.35, meniscus: false })];
          // the molecules: dots spread through the gas, each with a short tail along its motion (longer when hotter)
          const tail = 2.6 * Math.sqrt((T + 273.15) / 293.15), dots = [], tails = [];
          for (const [x, y, f, dx, dy, dz] of MOL) { const z = Z0 + 1.5 + f * (hq - 3), a = K.iso([x, y, z], P), b = K.iso([x - dx * tail, y - dy * tail, z - dz * tail], P); dots.push(a); tails.push(K.pathOf([a, b])); }
          return out.join("") + `<path d="${tails.join("")}" stroke="#8fb3d9" stroke-width="0.9" fill="none" stroke-linecap="round"/>` + K.dotsSvg(dots, { size: 1, tone: "hi" }).replace("<g", '<g style="--anatomy-hi:#2f6fae"');
        });
        // the piston (head, seals, rod, platform) is one rigid part: built once, moved with a translate
        w.attr(el.piston, "transform", up); w.attr(el.ptop, "transform", up); w.attr(el.weights, "transform", up);
        w.rebuild(el.weights, String(nMass), () => { const top = Z0 + 10 + RL, ms = []; for (let i = 0; i < nMass; i++) ms.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 22, top + 7 + i * 7, 6.6, P, 40, 0.6), { tone: "mid", inner: L(K.sideArc(0, 0, 22, top + 10.3 + i * 7, P, 30), { tone: "faint" }) }))); return ms.join(""); });
        // water in the bath (tinted warmer as it heats) over the cylinder's foot, then the bath's near wall
        const tq = Math.round(T);
        w.rebuild(el.bathFront, String(tq), () => bath.liquid(BH * 0.78, LAB.mix("#cfe6f6", "#f6d2c4", tq / 100), { opacity: 0.45 }) + LAB.thermometer(P, TH_FOOT, TH_AX, TH_LEN, sT(tq), { r: 2.6, ticks: [sT(0), sT(110), 11, 5] }) + statics);
        const pq = Math.round(p);
        w.rebuild(el.needle, String(pq), () => { const a = Math.PI * (1.25 - (p / 400) * 1.5); return `<path d="${K.pathOf([K.iso([GX, GY + 3.2, GZ], P), K.iso([GX + Math.cos(a) * 11, GY + 3.2, GZ + Math.sin(a) * 11], P)])}" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>` + K.dotsSvg([K.iso([GX, GY + 3.3, GZ], P)], { size: 0.9 }); });
        w.rebuild(el.dot, `${pq} ${V.toFixed(1)} ${tq}`, () => dotAt(p, V, T));
        w.rebuild(el.lamp, String(tq > 20), () => `<path d="${K.pathOf([[30, 62.05, 7], [36, 62.05, 7], [36, 62.05, 11], [30, 62.05, 11]].map((q) => K.iso(q, P)), true)}" fill="${tq > 20 ? "#e5322b" : "#5a1c19"}"/>`);
        if (lab) w.rebuild(el.words, `${pq} ${V.toFixed(0)} ${tq}`, () => LAB.word(P, lab, [0, 0, ZC0 + CYH + RL + 40], KS[k], "#2f6fae", { size: 14 }) + LAB.word(P, lab, [CR + 4, 0, Z0 + h / 2], `${V.toFixed(0)} mL`, "#33506f", { size: 13, anchor: "start" }) +
          LAB.word(P, lab, [GX, GY, GZ + 22], `${pq} kPa`, "#a8382a", { size: 13 }) + LAB.word(P, lab, [BR * 0.75, BR * 0.75, ZH + BH - 6], `${tq} °C`, "#a8382a", { size: 13, anchor: "start" }));
        const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name)));
      };
      g.set = (q) => {
        if (q.p !== undefined && k !== "charles" && k !== "gaylussac") st.wp = ISO.clamp(+q.p, 100, 300);
        if (q.T !== undefined && k !== "boyle") st.wT = ISO.clamp(+q.T, 0, 100);
        if (q.lit !== undefined) st.lit = q.lit;
      };
      // masses go on one at a time (the pressure steps) and the gas settles; the bath warms slowly
      g.update = (dt) => {
        const calm = ISO.still();
        st.p = ISO.follow(st.p, st.wp, dt, 0.5, calm); if (Math.abs(st.p - st.wp) < 0.2) st.p = st.wp;
        st.T = ISO.follow(st.T, st.wT, dt, 0.9, calm); if (Math.abs(st.T - st.wT) < 0.1) st.T = st.wT;
        draw();
        return st.p !== st.wp || st.T !== st.wT;
      };
      g.readout = () => {
        const p = presOf(st.p, st.T), V = volOf(st.p, st.T), Tk = st.T + 273.15;
        return `p ${p.toFixed(0)} kPa · V ${V.toFixed(1)} mL · T ${st.T.toFixed(0)} °C = ${Tk.toFixed(0)} K · p×V = ${Math.round(p * V)} kPa·mL · p×V÷T = ${((p * V) / Tk).toFixed(1)} (stays ${(10000 / 293.15).toFixed(1)}: n = ${N_MOL.toFixed(2)} mmol of air)`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
