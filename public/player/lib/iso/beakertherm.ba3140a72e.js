// "beakertherm cx cy size c=blue level=0.55 v=0.6 lab=1 lit=thermometer|beaker|hotplate | 40 °C" — a beaker of liquid on
// a hot plate with a thermometer resting in it. The thermometer reads −10 to 110 °C (marks every 1 °C, long every 10,
// numbered every 20); its red alcohol thread stands at the liquid's temperature. v is the reading as a fraction of
// 0–100 °C (v=0.6 → 60 °C); the hot plate's knob turns with it. The thread rises at a calm rate, as the liquid warms.
// set({ v }) heats or cools it.
(() => {
  const K = window.K, G = window.G;
  const R = 34, H = 92, OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  const PLATE = { x: -62, y: -62, w: 124, d: 132, r: 8 }, TOP = 30, TLEN = 230, MMC = 1.4, S20 = 26;   // thermometer: mm per °C, s of −10 °C
  const AZ = 52, VW = [Math.cos((AZ * Math.PI) / 180), Math.sin((AZ * Math.PI) / 180)];

  ISO.add({
    name: "beakertherm", title: "Beaker with thermometer", compare: "beakertherm 480 270 280 v=0.6 | 40 °C",
    about: "A beaker on a hot plate with a thermometer resting in it: the red thread climbs as the liquid warms.",
    line: "beakertherm cx cy size c=blue level=0.55 v=0.6 lab=1 lit=thermometer|beaker|hotplate",
    demo: { line: "beakertherm 480 270 280 v=0.2", script: [{ set: { v: 0.6, lit: "thermometer" }, hold: "settle" }, { set: { v: 0.95, lit: "hotplate" }, hold: "settle" }, { set: { v: 0.4, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 280], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.55, H2 = size * 1.5, c = o.c || "blue";
      const foot = [VW[0] * 14, VW[1] * 14, TOP + 3 + 3], lean = [-VW[0] * 0.42 - VW[1] * 0.2, -VW[1] * 0.42 + VW[0] * 0.2, 1], ax = G.unit3(lean);
      const tipAt = (s) => [foot[0] + ax[0] * s, foot[1] + ax[1] * s, foot[2] + ax[2] * s];
      const { P, g } = ISO.frame([...K.boxCorners(PLATE, 0, TOP), tipAt(TLEN), [R, R, TOP + H]], cx, cy, W, H2, { azimuth: AZ, elevation: 22 }, parent);
      const V = LAB.vessel(P, [0, 0, TOP + 3], OUTER, { spout: true });
      const st = { T: ISO.clamp(ISO.num(o, "v", 0.6), 0, 1) * 100 }, want = { T: st.T };
      let lit = o.lit || "";
      const level = V.levelFor(ISO.clamp(ISO.num(o, "level", 0.55), 0.1, 0.95) * 250);
      // the hot plate: a cast body, a ceramic top with a ring, a knob on the front and a pilot lamp
      const plate = (heat) => {
        const out = [`<path class="iso-halo" d="${K.haloOf(PLATE, 0, TOP, P)}"/>`];
        for (const [x, y] of K.corners(PLATE, 10).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P))) out.push(S(K.cylinder(x, y, 4, 0, 2.5, P, 16), { tone: "lo" }));
        out.push(S(K.slabOf(PLATE, 2.5, TOP - 6, P, 6, 0.8), { tone: "mid", inner: L(K.sideSeam(PLATE, 14, P, 6), { tone: "faint" }) }));
        out.push(ISO.tinted(ISO.T.steel, S(K.slabOf(K.insetPlan(PLATE, 2), TOP - 3.5, 3.5, P, 6, 0.6), { tone: "hi" })));
        out.push(`<path d="${K.pathOf(K.circleRing(0, 0, 46, 64).map(([a, b]) => K.iso([a, b, TOP + 0.05], P)), true)}" fill="${LAB.mix("#e9ecef", "#f08a6a", heat * 0.55)}" stroke="#9aa1a8" stroke-width="0.6"/>`);
        return out.join("");
      };
      const knob = (heat) => {
        const kx = 30, ky = PLATE.y + PLATE.d, F = LAB.Y([kx, ky, 13]), a = -2.3 + heat * 4.4;
        const out = [S(G.disc(0, 3, 9, F, P), { tone: "mid" }), S(G.disc(3, 9, 7, F, P), { tone: "hi", inner: L(G.ribsOf(F, 3, 9, 7, 30, P, { seams: true }), { tone: "lo" }) })];
        out.push(`<path d="${K.pathOf([K.iso(G.pointOf(F, 9.05, 1.5, a), P), K.iso(G.pointOf(F, 9.05, 6, a), P)])}" stroke="#26262a" stroke-width="1.3" stroke-linecap="round"/>`);
        const lampOn = heat > 0.02;
        out.push(`<path d="${G.circleOf(LAB.Y([-30, ky, 13]), 0.1, 3, P)}" fill="${lampOn ? "#ff6a3d" : "#7a3a2a"}" stroke="#3a1a10" stroke-width="0.6"/>`);
        return out.join("");
      };
      const thermStatic = () => LAB.thermometer(P, foot, ax, TLEN, 0, { r: 3, thread: false });
      const thermTicks = () => {
        const out = [LAB.thermometer(P, foot, ax, TLEN, 0, { r: 3, thread: false, body: false, ticks: [S20, S20 + 120 * MMC, MMC * 5, 2] })];
        const F2 = G.frameAlong(foot, ax), face = G.angleToward(F2, G.viewOf(P)) + 0.55;
        for (let T = 0; T <= 100; T += 20) out.push(LAB.faceText(P, G.pointOf(F2, S20 + (T + 10) * MMC - 1.2, 3.1, face + 0.95), G.mul3(G.tangentOf(F2, face + 0.95), -1), String(T), 3.2, "#3d4650", ax));
        return out.join("");
      };
      g.innerHTML = `<g data-name="hotplate"><g data-part="plate"></g><g data-part="knob"></g></g><g data-name="beaker">${V.back()}</g><g data-name="thermometer">${thermStatic()}<g data-part="thread"></g>${thermTicks()}</g>` +
        `<g>${V.liquid(level, c)}</g><g>${V.front()}</g><g>${V.scale(V.levelFor(50), V.levelFor(250), V.levelFor(60) - V.levelFor(50), 5, { side: -0.45 })}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const heat = want.T / 100, Tq = Math.round(st.T * 4) / 4;
        w.rebuild(el.plate, heat.toFixed(2), () => plate(heat));
        w.rebuild(el.knob, heat.toFixed(2), () => knob(heat));
        w.rebuild(el.thread, String(Tq), () => LAB.thread(P, foot, ax, S20 + (Tq + 10) * MMC, 3));
        if (lab) w.rebuild(el.words, String(Math.round(st.T)), () => LAB.word(P, lab, tipAt(S20 + (st.T + 10) * MMC).map((v, i) => v + [VW[1] * 9, -VW[0] * 9, 0][i]), `${Math.round(st.T)} °C`, "#c0392b", { anchor: "start", size: 15, dy: 0 }) + LAB.word(P, lab, [PLATE.x, PLATE.y + PLATE.d, 0], "hot plate", "#556", { anchor: "end", dy: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.v !== undefined) want.T = ISO.clamp(+p.v, 0, 1) * 100; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // the thread climbs at most 25 °C a second, easing in at the end
        const d = want.T - st.T, step = Math.sign(d) * Math.min(Math.abs(d), dt * 25, Math.abs(d) * dt * 4 + dt * 2);
        st.T = ISO.still() ? want.T : st.T + step;
        if (Math.abs(want.T - st.T) < 0.05) st.T = want.T;
        draw();
        return st.T !== want.T;
      };
      g.readout = () => `thermometer reads ${st.T.toFixed(0)} °C · thread at the ${st.T.toFixed(0)} mark · hot plate ${want.T > 30 ? "on" : "low"}`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
