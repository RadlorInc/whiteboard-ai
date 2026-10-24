// "calorimeter cx cy size k=coffee|bomb lab=1 lit=thermometer|stirrer|lid|cups" — a coffee-cup calorimeter.
// Two nested polystyrene cups (they insulate) stand in a glass beaker so they cannot tip; a card lid with two holes
// carries a thermometer (held by a clamp on a stand, scale 10–40 °C) and a loop stirrer. Inside: 50 cm³ of 1.0 mol/dm³
// hydrochloric acid; set({ mix: 1 }) adds 50 cm³ of 1.0 mol/dm³ sodium hydroxide and stirs. The temperature climbs from
// 21.0 °C to 27.8 °C: q = m c ΔT = 100 g × 4.18 J/g°C × 6.8 °C = 2.84 kJ for 0.050 mol of water formed, so
// ΔH = −2.84 ÷ 0.050 = −57 kJ/mol (exothermic). k=bomb is drawn the same way (the app's bomb calorimeter is not built).
(() => {
  const K = window.K, G = window.G;
  const CUP = [[0, 29], [1.5, 30.5, 1], [3, 31], [96, 40.5], [97, 41.6, 1], [99, 41.6]];
  const BK = [[0, 44], [0.7, 45.6, 1], [2.2, 46.6, 1], [4, 46.8], [80, 46.8]];
  const ROD = [0, -80], T0 = 21.0, TMAX = 27.8, TH = { len: 262, s0: 100, per: 4.2, lo: 10 };   // thermometer mm per °C from 10 °C
  const BASE = { x: -48, y: -104, w: 96, d: 60, r: 4 };

  ISO.add({
    name: "calorimeter", title: "Coffee-cup calorimeter", compare: "calorimeter 480 280 340 k=coffee",
    about: "Acid and alkali mixed in nested foam cups: the thermometer climbs 6.8 °C, so q = mcΔT = 2.84 kJ and ΔH ≈ −57 kJ/mol.",
    line: "calorimeter cx cy size k=coffee|bomb mix=0|1 lab=1 lit=thermometer|stirrer|lid|cups",
    demo: { line: "calorimeter 480 280 340", script: [{ set: { lit: "cups" }, hold: 1.2 }, { set: { mix: 1, lit: "thermometer" }, hold: 6 }, { set: { lit: "stirrer" }, hold: 2 }] },
    make([cx, cy, size = 340], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.15, H2 = size * 1.0;
      const { P, g } = ISO.frame([[-60, -110, 0], [60, 60, 0], [0, 0, 296], [0, -80, 290]], cx, cy, W, H2, { azimuth: 50, elevation: 20 }, parent);
      const st = { mix: +o.mix ? 1 : 0, T: +o.mix ? TMAX : T0, t: 0, bob: 0, clock: 0 };
      let lit = o.lit || "";
      const beaker = LAB.vessel(P, [0, 0, 3], BK), CUPZ = 6;
      const cupOuter = LAB.turned(P, [0, 0, CUPZ], CUP, ["#d9dad6", "#ffffff"], "#9a9b95", { rims: [] });
      const cupInnerLip = LAB.turned(P, [0, 0, CUPZ + 92], [[0, 38.6], [5, 39.4], [7, 40.4, 1], [8, 40.4]], ["#dcdcd8", "#ffffff"], "#9a9b95");
      const lidZ = CUPZ + 100, lidR = 46, holeT = [12, 8], holeS = [-14, -6];
      const lid = () => {
        const out = [ISO.tinted(ISO.tint("#e9dcc2", ["#b9a988", "#c7b897", "#d4c6a7", "#dfd2b6"], "#6e5f40"), S(K.cylinder(0, 0, lidR, lidZ, 2, P, 64, 0.4), { tone: "hi" }))];
        for (const [x, y] of [holeT, holeS]) out.push(`<path d="${K.pathOf(K.circleRing(x, y, 4.4, 20).map(([a, b]) => K.iso([a, b, lidZ + 2.05], P)), true)}" fill="#3a3324"/>`);
        return out.join("");
      };
      const thermFoot = [holeT[0], holeT[1], CUPZ + 20], clampZ = lidZ + 140;
      const cl = LAB.clamp(P, ROD, clampZ - 6.5, [0.15, 1].map((v) => v / Math.hypot(0.15, 1)), Math.hypot(holeT[0] - ROD[0], holeT[1] - ROD[1]), 3.4);
      const thermTop = () => LAB.thermometer(P, thermFoot, [0, 0, 1], TH.len, 0, { r: 3.2, thread: false });
      const ticks = () => {
        const out = [LAB.thermometer(P, thermFoot, [0, 0, 1], TH.len, 0, { r: 3.2, thread: false, body: false, ticks: [TH.s0, TH.s0 + 30 * TH.per, TH.per, 5] })];
        const F2 = LAB.Z(thermFoot), face = G.angleToward(F2, G.viewOf(P)) + 0.55;
        for (let T = 10; T <= 40; T += 5) out.push(LAB.faceText(P, G.pointOf(F2, TH.s0 + (T - TH.lo) * TH.per - 1.4, 3.3, face + 1.0), G.mul3(G.tangentOf(F2, face + 1.0), -1), String(T), 3.4, "#3d4650"));
        return out.join("");
      };
      // the part of the thermometer above the lid is drawn after it; below the lid it is hidden in the cups
      const clipAt = (id, [x, y]) => `<clipPath id="${id}"><path d="M-2000 -2000 H4000 V${K.iso([x, y, lidZ + 2], P)[1]} H-2000 Z"/></clipPath>`, cid = `calc${Math.round(cx)}_${Math.round(cy)}`;
      const clipAbove = clipAt(cid + "t", holeT) + clipAt(cid + "s", holeS);
      const stirrer = (bob) => {
        const x = holeS[0], y = holeS[1], z0 = lidZ - 30 + bob, z1 = lidZ + 60 + bob;
        return `<g style="${ISO.T.steel}">${S(K.cylinder(x, y, 1.1, z0, z1 - z0, P, 10), { tone: "mid", crease: "none" })}${S(G.ringBand(z1, z1 + 1.6, 6, 8, LAB.Z([x, y, 0]), P), { tone: "hi" })}</g>`;
      };
      g.innerHTML = `<defs>${clipAbove}</defs><g data-name="stand">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, clampZ + 40)}${LAB.boss(P, ROD, clampZ - 6.5, [0.15, 1].map((v) => v / Math.hypot(0.15, 1)))}${cl.back}</g>` +
        `<g data-name="cups">${beaker.back()}${cupOuter}${cupInnerLip}${beaker.front()}</g><g data-name="lid">${lid()}</g>` +
        `<g data-name="stirrer" clip-path="url(#${cid}s)"><g data-part="stirrer"></g></g>` +
        `<g data-name="thermometer" clip-path="url(#${cid}t)">${thermTop()}<g data-part="thread"></g>${ticks()}</g><g data-name="stand">${cl.front}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const Tq = Math.round(st.T * 20) / 20;
        w.rebuild(el.thread, String(Tq), () => LAB.thread(P, thermFoot, [0, 0, 1], TH.s0 + (Tq - TH.lo) * TH.per, 3.2));
        w.rebuild(el.stirrer, st.bob.toFixed(1), () => stirrer(st.bob));
        if (lab) w.rebuild(el.words, `${Tq} ${st.mix}`, () => [
          LAB.word(P, lab, [thermFoot[0] + 8, thermFoot[1], thermFoot[2] + TH.s0 + (Tq - TH.lo) * TH.per], `${st.T.toFixed(1)} °C`, "#c0392b", { anchor: "start", size: 15 }),
          LAB.word(P, lab, [0, 46, CUPZ + 40], "two foam cups", "#556", { size: 12 }), LAB.word(P, lab, [-46, 0, lidZ + 2], "lid", "#556", { anchor: "end", size: 12 }),
          LAB.word(P, lab, [holeS[0] - 10, holeS[1], lidZ + 66], "stirrer", "#556", { anchor: "end", size: 12 }),
          st.mix ? LAB.word(P, lab, [0, 46, CUPZ + 24], `ΔT = ${(st.T - T0).toFixed(1)} °C`, "#c0392b", { size: 13 }) : "",
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.mix !== undefined) { st.mix = +p.mix ? 1 : 0; st.t = 0; if (!st.mix) st.T = T0; } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt, c) => {
        st.clock = c || st.clock + dt;
        if (ISO.still()) { st.T = st.mix ? TMAX : T0; st.bob = 0; draw(); return false; }
        if (st.mix) {
          st.t += dt;
          st.T = T0 + (TMAX - T0) * (1 - Math.exp(-st.t / 1.1));
          st.bob = st.t < 5 ? Math.sin(st.t * 6) * 8 : ISO.follow(st.bob, 0, dt, 0.2);
        }
        draw();
        return st.mix && st.t < 6;
      };
      g.readout = () => {
        const dT = st.T - T0, q = 100 * 4.18 * dT;
        return st.mix ? `${st.T.toFixed(1)} °C · ΔT = ${dT.toFixed(1)} °C · q = 100 g × 4.18 × ${dT.toFixed(1)} = ${(q / 1000).toFixed(2)} kJ · ΔH = −${(q / 1000 / 0.05).toFixed(0)} kJ/mol` : `50 cm³ HCl at ${T0.toFixed(1)} °C · add 50 cm³ NaOH and stir`;
      };
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
