// "distill cx cy width c=purple lab=1 lit=flask|thermometer|condenser|receiver|burner" — simple distillation on the bench.
// A round-bottomed flask of dyed water sits on a gauze on a tripod over a Bunsen burner, clamped by its neck. A still
// head on top carries a thermometer whose bulb sits level with the side arm, so it reads the vapour that leaves. The side
// arm runs down a Liebig condenser: an inner tube inside a water jacket, cold water in at the low end, out at the high
// end (against the vapour). The condensed water drips from an adapter into a conical flask. Heating, the thermometer
// climbs and holds at 100 °C while water boils off; the dye stays behind and the distillate is colourless.
// set({ heat: 1|0 }).
(() => {
  const K = window.K, G = window.G;
  const RB = 40, ROUND = (() => {
    const out = [];
    for (let i = 1; i <= 15; i++) { const s = (i / 16) * (2 * RB - 9); out.push([s, Math.sqrt(Math.max(0, RB * RB - (s - RB) ** 2)), 1]); }
    out.push([2 * RB - 6, 12.4, 1], [2 * RB - 3, 11.8], [2 * RB + 34, 11.8]);
    return [[0, 2]].concat(out);
  })();
  const CONE = [[0, 33], [0.8, 35, 1], [2.6, 36.2, 1], [5, 36.4, 1], [8, 35.2], [80, 13.5, 1], [86, 11.6, 1], [88, 11], [112, 11], [113, 12.4, 1], [115, 12.6, 1], [116.5, 11.8]];
  const BENCH = { x: -242, y: -78, w: 470, d: 160, r: 4 };
  const FX = 140, GZ = 122, FZ = GZ + 1, NECKTOP = FZ + 2 * RB + 34, ARMZ = NECKTOP + 26, SLOPE = (14 * Math.PI) / 180;
  const DIR = [-Math.cos(SLOPE), 0, -Math.sin(SLOPE)], ARM0 = [FX, 0, ARMZ], LEN = 300, J0 = 46, J1 = 262;
  const along = (s) => [ARM0[0] + DIR[0] * s, 0, ARM0[2] + DIR[2] * s];
  const RX = along(LEN)[0] - 14, RZ = 3;
  const ROD1 = [FX, 66], ROD2 = [along(150)[0], 66];

  ISO.add({
    name: "distill", title: "Simple distillation", compare: "distill 480 285 620",
    about: "Heat dyed water in a flask: vapour at 100 °C passes the thermometer, cools in a water-jacketed condenser and drips out colourless.",
    line: "distill cx cy width c=purple heat=0|1 lab=1 lit=flask|thermometer|condenser|receiver|burner",
    demo: { line: "distill 480 285 620", script: [{ set: { heat: 1, lit: "thermometer" }, hold: 6 }, { set: { lit: "condenser" }, hold: 5 }, { set: { lit: "receiver" }, hold: 4 }, { set: { heat: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 620], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", c = o.c || "purple", W = size * 1.0, H2 = size * 0.78, id = `ds${Math.round(cx)}${Math.round(cy)}`;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, 0, 4), [FX, 0, ARMZ + 112], [ROD1[0], ROD1[1], ARMZ + 60], [RX, 0, 0]], cx, cy, W, H2, { azimuth: -70, elevation: 16 }, parent);
      const st = { heat: +o.heat ? 1 : 0, T: 20, boil: 0, ml: 0, drops: [], spawn: 0 };
      let lit = o.lit || "", clock = 0;
      const k = G.scaleOf(P);
      // ── the stands (behind), the bench, the burner on its tripod
      const flask = LAB.vessel(P, [FX, 0, FZ], ROUND, { base: 1.5, rim: false });
      const recv = LAB.vessel(P, [RX, 0, RZ], CONE, { base: 2 });
      const jacket = LAB.vessel(P, along(J0), [[0, 4.6], [5, 14, 1], [8, 15], [J1 - J0 - 8, 15], [J1 - J0 - 5, 14, 1], [J1 - J0, 4.6]], { axis: DIR, rim: false });
      const bun = LAB.bunsen(P, [FX, 0], 1, { h: 70 }), tri = LAB.tripod(P, [FX, 0], GZ, 30);
      const stand = (rod, z0) => LAB.standBase(P, { x: rod[0] - 34, y: rod[1] - 24, w: 68, d: 46, r: 4 }, rod) + LAB.rod(P, rod, 14, ARMZ + 60);
      const c1 = LAB.clamp(P, ROD1, NECKTOP - 22, [0, -1], ROD1[1], 12.4), c2 = LAB.clamp(P, ROD2, along(150)[2] - 6.5, [0, -1], ROD2[1], 15.4, { jawH: 14 });
      // cooling water hoses: in at the low end (under the jacket) from the bench tap, out at the high end to the sink
      const nozIn = along(J1 - 20), nozOut = along(J0 + 20);
      const inStub = [nozIn[0], nozIn[1], nozIn[2] - 15 - 8], outStub = [nozOut[0], nozOut[1], nozOut[2] + 15 + 8];
      const hoses = LAB.hose(P, LAB.bend([inStub, [inStub[0], 0, inStub[2] - 30], [inStub[0] - 4, 40, 40], [inStub[0] - 4, 52, 4]], 10), 3, "#4a7fc0") +
        LAB.hose(P, LAB.bend([outStub, [outStub[0], 0, outStub[2] + 18], [outStub[0] - 25, 46, outStub[2] + 12], [outStub[0] - 45, 52, 4]], 12), 3, "#4a7fc0");
      const benchTaps = S(K.cylinder(nozIn[0] - 4, 52, 6, 4, 3, P, 18), { tone: "mid" }) + S(K.cylinder(nozOut[0] - 45, 52, 6, 4, 3, P, 18), { tone: "mid" });
      const nozzles = LAB.tube(P, [[nozIn[0], 0, nozIn[2] - 13], inStub], 2.4) + LAB.tube(P, [[nozOut[0], 0, nozOut[2] + 13], outStub], 2.4);
      const jacketBody = () => jacket.back() + `<path d="${jacket.sil}" fill="#7fbde8" fill-opacity=".28"/>` + LAB.tube(P, [along(J0 - 10), along(J1 + 10)], 4.4, { inner: "#ffffff" }) + jacket.front({ shine: true });
      // still head with its bung, the side arm, the adapter into the receiver
      const head = LAB.tube(P, [[FX, 0, NECKTOP - 6], [FX, 0, ARMZ + 22]], 9.5) + LAB.tube(P, [ARM0, along(J0 + 2)], 4.4);
      const bung = LAB.bung(P, [FX, 0], ARMZ + 20, 9.8, 10);
      const adapter = LAB.tube(P, LAB.bend([along(J1 - 2), along(LEN), [RX, 0, along(LEN)[2] - 22], [RX, 0, RZ + 108]], 12), 5);
      const thermFoot = [FX, 0, ARMZ - 3], TH = { len: 96, s0: 12, per: 0.7 };
      const out = [LAB.flameDefs(id), `<g>${LAB.mat(P, BENCH, 4, "lo", ISO.T.wood)}</g>`, `<g data-name="stand">${stand(ROD1)}${stand(ROD2)}${benchTaps}</g>`, `<g>${hoses}</g>`];
      out.push(`<g data-name="burner"><g transform="${K.translateAlong(P, [0, 0, 4])}">${bun.svg}${bun.collar(1)}</g>${tri.back}</g><g data-part="flame"></g><g>${tri.gauze}${tri.front}</g>`);
      out.push(`<g data-name="stand">${LAB.boss(P, ROD1, NECKTOP - 22, [0, -1])}${c1.back}${LAB.boss(P, ROD2, along(150)[2] - 6.5, [0, -1])}${c2.back}</g>`);
      out.push(`<g data-name="flask">${flask.back()}<g data-part="liquid"></g><g data-part="bubbles"></g>${flask.front()}</g>`);
      out.push(`<g data-name="condenser">${head}${jacketBody()}${nozzles}</g><g data-name="receiver">${adapter}</g>`);
      out.push(`<g data-name="thermometer">${LAB.thermometer(P, thermFoot, [0, 0, 1], TH.len, 0, { r: 2.6, thread: false })}<g data-part="thread"></g>${LAB.thermometer(P, thermFoot, [0, 0, 1], TH.len, 0, { r: 2.6, thread: false, body: false, ticks: [TH.s0, TH.s0 + 100 * TH.per, 10 * TH.per, 5] })}</g>${bung}`);
      out.push(`<g data-name="stand">${c1.front}${c2.front}</g>`);
      out.push(`<g data-name="receiver">${recv.back()}<g data-part="recliq"></g>${recv.front()}</g><g data-part="drops"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = LAB.parts(g), w = ISO.writer(), fx = ISO.flameFx(g, P, W, H2, el.flame, [FX, 0, 75], 26);
      const level0 = flask.levelFor(150);
      const tipZ = RZ + 108;
      const draw = () => {
        const left = 150 - st.ml;
        w.rebuild(el.liquid, Math.round(left), () => flask.liquid(flask.levelFor(left), c));
        w.rebuild(el.recliq, st.ml.toFixed(1), () => recv.liquid(recv.levelFor(st.ml), "clear", { opacity: 0.7 }));
        w.rebuild(el.thread, Math.round(st.T * 2) / 2 + "", () => LAB.thread(P, thermFoot, [0, 0, 1], TH.s0 + st.T * TH.per, 2.6));
        const tq = Math.round(clock * 24) / 24;
        if (fx) fx.flame(1, st.fl || 0);
        else w.rebuild(el.flame, st.heat ? String(tq) : "", () => (st.heat ? LAB.flame(P, [FX, 0, 75], 1, 32, tq, id) : ""));
        w.rebuild(el.bubbles, st.boil > 0.05 ? String(tq) : "", () => {
          if (st.boil <= 0.05) return "";
          const lv = flask.levelFor(150 - st.ml), bs = [];
          for (let i = 0; i < 12; i++) {
            const ph = (tq * (0.7 + (i % 4) * 0.12) + i * 0.377) % 1, z = 6 + ph * (lv - 8), r = Math.sqrt(Math.max(0, (RB - 3) ** 2 - (z - RB) ** 2)) * 0.8;
            bs.push(LAB.bubble(P, [FX + Math.sin(i * 2.3) * r, Math.cos(i * 1.7) * r * 0.6, FZ + z], 1 + ph * 1.8 * st.boil));
          }
          return bs.join("");
        });
        w.rebuild(el.drops, st.drops.map((z) => z.toFixed(0)).join(), () => st.drops.map((z) => LAB.drop(P, [RX, 0, z], 1.8, "clear")).join(""));
        if (lab) w.rebuild(el.words, `${Math.round(st.T)} ${Math.round(st.ml)}`, () => [
          LAB.word(P, lab, [FX, 0, thermFoot[2] + TH.len + 6], `${Math.round(st.T)} °C`, "#c0392b", { size: 15 }),
          LAB.word(P, lab, along(150).map((v, i) => v + [0, 0, 30][i]), "condenser", "#556"),
          LAB.word(P, lab, [nozIn[0] - 12, 0, nozIn[2] - 24], "cold water in", "#2b6cc4", { anchor: "start" }),
          LAB.word(P, lab, [nozOut[0], 0, outStub[2] + 10], "water out", "#2b6cc4", { anchor: "middle" }),
          LAB.word(P, lab, [RX, 0, 0], `distillate ${Math.round(st.ml)} mL`, "#556", { dy: 16 }),
          LAB.word(P, lab, [FX - 44, 0, FZ + 30], `${c} solution`, LAB.ink(c), { anchor: "start" }),
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.heat !== undefined) st.heat = +p.heat ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt, cl) => {
        const calm = ISO.still();
        clock = calm ? 0 : cl || clock + dt;
        // the flask warms toward 100 °C (about 4 s here) and holds there while it boils; off, it cools
        const Tw = st.heat ? 100 : 20;
        st.T = calm ? Tw : st.T + (Tw - st.T) * (1 - Math.exp(-dt / (st.heat ? 1.2 : 2.5)));
        if (Math.abs(st.T - Tw) < 0.3) st.T = Tw;
        st.fl = ISO.follow(st.fl || 0, st.heat, dt, 0.25, calm);
        st.boil = ISO.follow(st.boil, st.heat && st.T > 99 ? 1 : 0, dt, 0.4, calm);
        if (st.boil < 0.01) st.boil = 0;
        if (st.boil > 0.5 && !calm) { st.spawn += dt * 3 * st.boil; if (st.spawn > 1) { st.spawn = 0; st.drops.push(tipZ - 2); } }
        const surf = RZ + recv.levelFor(st.ml);
        st.drops = st.drops.map((z) => z - (tipZ - z + 5) * 9 * dt).filter((z) => { if (z > surf) return true; st.ml = Math.min(110, st.ml + 0.6); return false; });
        draw();
        return Math.abs(st.T - Tw) > 0 || st.boil > 0 || st.drops.length > 0 || st.fl !== st.heat;
      };
      g.readout = () => (st.boil > 0.5 ? `thermometer ${Math.round(st.T)} °C at the side arm · water boils off, the ${c} dye stays behind · distillate ${Math.round(st.ml)} mL, colourless` : st.heat ? `heating · ${Math.round(st.T)} °C` : `burner off · ${Math.round(st.T)} °C · distillate ${Math.round(st.ml)} mL`);
      void level0; void k;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
