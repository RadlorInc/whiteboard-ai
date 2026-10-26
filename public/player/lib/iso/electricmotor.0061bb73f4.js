// "electricmotor cx cy k h=4..30 rpm=0..600 lab=0 lit=base|pillar|motor|pulley|wires" — a PART (PARTS.md): a small DC
// motor on a pillar, origin the bench point under the pillar's middle. A round cast base with a red and a black
// terminal, a steel pillar h cm tall (default 10) with a boss and thumbscrew, a saddle on top and two steel straps
// round the motor: a 4 cm × 6 cm can lying along x, vent slots, a black end bell with its two solder tabs (the leads
// run down to the terminals), a brass bearing, the shaft and a grooved pulley on the +x end, in line with the Stirling
// engine's pulley. rpm = the pulley's turns a minute, eased (0 stops it). Reused from heatengine.js (its fridge motor),
// in mm; anchors in cm. set({ rpm }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RM = 20, XM = 30, XP = 40, RB = 32;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const cable = (P, pts, c) => { const d = K.pathOf(LAB.bend(pts, 8).map((p) => K.iso(p, P))), s = Math.max(0.8, K.screenRise(1, P) * 1.6); return `<path d="${d}" fill="none" stroke="#1a1a1a" stroke-width="${(s + 0.8).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${s.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`; };

  ISO.add({
    name: "electricmotor", title: "Electric motor on a pillar (part)", compare: null,
    about: "A small DC motor (4 cm × 6 cm) strapped on a pillar h cm tall (default 10) on a cast base with two terminals, a grooved pulley on its shaft toward +x; rpm turns the pulley (it drives the Stirling engine backward as a fridge through a drive belt). anchors: pulley top",
    line: "electricmotor cx cy k h=4..30 rpm=0..600 lab=0 lit=base|pillar|motor|pulley|wires",
    demo: { line: "electricmotor 470 420 26", script: [{ set: {}, hold: 1 }, { set: { rpm: 120, lit: "pulley" }, hold: 3 }, { set: { lit: "motor" }, hold: 1.5 }, { set: { lit: "wires" }, hold: 1.2 }, { set: { rpm: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const H = ISO.clamp(ISO.num(o, "h", 10), 4, 30) * 10, A = H + 6 + RM + 1.5;
      const st = { rpm: ISO.clamp(ISO.num(o, "rpm", 0), 0, 600), lit: o.lit || "", th: 0 }, want = { rpm: st.rpm }, w = ISO.writer();
      const F = xAx([0, 0, A]), Fp = xAx([XP, 0, A]);
      const base = ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, RB + 0.5, 0, 1.2, Pm, 40), { tone: "lo" })) + ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RB, 1.2, 5.8, Pm, 40, 1.2), { tone: "mid" })) +
        ISO.tinted(ISO.T.red, S(K.cylinder(20, 14, 3.5, 7, 6, Pm, 16), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(K.cylinder(-6, 24, 3.5, 7, 6, Pm, 16), { tone: "mid" })) +
        LAB.faceText(Pm, [20, 14 + 3.6, 2.6], [1, 0, 0], "+", 4, "#8f2a22") + LAB.faceText(Pm, [-6, 24 + 3.6, 2.6], [1, 0, 0], "−", 4, "#111");
      const pillar = S(K.cylinder(0, 0, 5, 7, H - 7, Pm, 20), { tone: "mid", crease: "none" }) +
        ISO.tinted(ISO.T.steel, ISO.wbox(Pm, [-8, 8], [-8, 8], [H - 30, H - 16], "mid") + S(G.disc(8, 16, 2, xAx([0, 0, H - 23]), Pm, { steps: 12 }), { tone: "mid" }) + S(G.disc(16, 19, 4.5, xAx([0, 0, H - 23]), Pm, { steps: 16 }), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, ISO.wbox(Pm, [-24, 24], [-RM - 4, RM + 4], [H, H + 6], "mid"));
      // the motor: can, vents, straps, end bell with tabs, bearing, shaft
      const motor = ISO.tinted(ISO.T.plastic, S(G.disc(-XM - 6, -XM, RM - 3, F, Pm, { steps: 28 }), { tone: "mid" }) + S(G.disc(-XM - 9, -XM - 6, 5, F, Pm, { steps: 16 }), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, S(G.lathe([[-XM, 0], [-XM, RM - 2], [-XM + 2, RM, 1], [XM - 2, RM], [XM, RM - 2, 1], [XM, 0]], F, Pm, { steps: 40 }), { tone: "hi", inner: L(G.ribsOf(F, -8, 8, RM + 0.05, 10, Pm, { phase: 0.2 }), { tone: "lo", free: true }) })) +
        [-20, 14].map((x) => ISO.tinted(ISO.T.steel, S(G.ringBand(x, x + 6, RM, RM + 1.2, F, Pm, { steps: 40 }), { tone: "mid" }) + ISO.wbox(Pm, [x, x + 6], [-RM - 3, RM + 3], [H + 6, H + 8], "mid"))).join("") +
        ISO.tinted(ISO.T.copper, ISO.wbox(Pm, [-XM - 7, -XM - 5], [-6, -3], [A + RM - 6, A + RM - 1], "mid") + ISO.wbox(Pm, [-XM - 7, -XM - 5], [3, 6], [A + RM - 6, A + RM - 1], "mid")) +
        ISO.tinted(ISO.T.brass, S(G.disc(XM, XM + 3, 6, F, Pm, { steps: 20 }), { tone: "mid" })) + S(G.disc(XM + 3, XP, 1.2, F, Pm, { steps: 10 }), { tone: "mid", crease: "none" }) +
        LAB.faceText(Pm, [0, RM * 0.5, A + RM * 0.87], [1, 0, 0], "6 V DC", 4, "#3c3f45", [0, -0.5, 0.87]);
      const wires = cable(Pm, [[-XM - 6, -4.5, A + RM - 2], [-XM - 16, -4, A + 6], [-14, 10, H - 40], [-6, 24, 13]], "#2a2b2f") + cable(Pm, [[-XM - 6, 4.5, A + RM - 2], [-XM - 12, 12, A + 2], [6, 16, H - 40], [20, 14, 13]], "#c0392b");
      const pulley = ISO.tinted(ISO.T.brass, S(G.disc(0, 8, 5, Fp, Pm, { steps: 24 }), { tone: "mid" }) + S(G.disc(0, 1.5, 7, Fp, Pm, { steps: 28 }), { tone: "mid" }) + S(G.disc(6.5, 8, 7, Fp, Pm, { steps: 28 }), { tone: "hi" })) + S(G.disc(8, 8.6, 1.2, Fp, Pm, { steps: 10 }), { tone: "mid" });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 7, Pm)}"/>` +
        `<g data-name="base">${base}</g><g data-name="pillar">${pillar}</g><g data-name="motor">${motor}</g><g data-name="wires">${wires}</g><g data-name="pulley">${pulley}<g data-part="spokes"></g></g><g data-part="words"></g>`;
      g.anchors = { pulley: [(XP + 4) / 10, 0, A / 10], top: [0, 0, (A + RM + 1.2) / 10] };
      const el = LAB.parts(g);
      const draw = () => {
        const thq = Math.round(st.th * 40) / 40;
        w.rebuild(el.spokes, String(thq), () => L(G.spokesOf(Fp, 8, 1.2, 5, 3, Pm, { phase: thq }), { tone: "mid" }));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([0, 0, A + RM + 16], Pm), "motor", "#445", { size: 13 }));
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.rpm !== undefined && Number.isFinite(+p.rpm)) want.rpm = ISO.clamp(+p.rpm, 0, 600);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.rpm = ISO.follow(st.rpm, want.rpm, dt, 0.5, calm);
        if (Math.abs(st.rpm - want.rpm) < 0.2) st.rpm = want.rpm;
        if (!calm) st.th = (st.th + (st.rpm / 60) * 2 * Math.PI * dt) % (2 * Math.PI);
        draw();
        return st.rpm !== 0 || st.rpm !== want.rpm;
      };
      g.readout = () => (st.rpm > 0.5 ? `motor turning its pulley at ${Math.round(st.rpm)} turns a minute` : "motor at rest") + ` · on a ${H / 10} cm pillar, shaft ${(A / 10).toFixed(1)} cm up`;
      draw();
      return g;
    },
  });
})();
