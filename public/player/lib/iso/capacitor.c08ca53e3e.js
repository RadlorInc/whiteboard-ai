// "capacitor cx cy k uf=1..4700 v=6.3..100 q=0..1 tau=0.1..60 lab=0 lit=can|stripe|legs" — a PART (PARTS.md, batch 5):
// the electrolytic capacitor of rccircuit.js, standing on its legs in a breadboard (or on the bench), its origin the
// surface point under its middle. A radial can 8 mm across and 12 mm tall: a blue plastic sleeve rolled over the
// aluminium top (scored with a vent cross), a crimp groove near the rubber bung, a pale stripe printed with − signs
// beside the − leg, the value and voltage printed up the side, two tinned legs 3.5 mm apart (+ at −x, − at +x).
// q = how charged it is (0 empty … 1 full); a real capacitor looks the same either way, so the charge shows as small
// + and − signs by its legs (more as q grows). q follows set({ q }) the way an RC circuit does, with time constant
// tau seconds: after one tau it has gone 63% of the way. Anchors (cm): plus, minus (the legs' feet), top. Built in mm.
(() => {
  const K = window.K, G = window.G, R = 4, H = 12, Z0 = 1.6, PITCH = 3.5;
  const SLEEVE = ISO.tint("#3f74c6", ["#1f4f8f", "#2a5ea4", "#3569b5", "#4a7cc4"], "#11305c");
  const STRIPE = ISO.tint("#dfe9f4", ["#9fb4cc", "#b3c5d9", "#c6d5e5", "#d5e1ee"], "#33506f");

  ISO.add({
    name: "capacitor", title: "Electrolytic capacitor (part)", compare: null,
    about: "A small electrolytic capacitor (blue can, − stripe, two legs) that stores charge: q fills toward its target the way an RC circuit charges, 63% in one time constant. anchors: plus minus top",
    line: "capacitor cx cy k uf=1..4700 v=6.3..100 q=0..1 tau=0.1..60 lab=0 lit=can|stripe|legs",
    demo: { line: "capacitor 480 380 60 uf=100 v=25 q=0 tau=1.2 lab=1", script: [{ set: {}, hold: 1 }, { set: { q: 1, lit: "can" }, hold: 3 }, { set: { lit: "stripe", tau: 0.6 }, hold: 1.2 }, { set: { q: 0, lit: "legs" }, hold: 3 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const uf = ISO.clamp(ISO.num(o, "uf", 100), 1, 4700), volts = ISO.clamp(ISO.num(o, "v", 25), 6.3, 100);
      const st = { q: ISO.clamp(ISO.num(o, "q", 0), 0, 1), tau: ISO.clamp(ISO.num(o, "tau", 4.7), 0.1, 60) };
      st.qT = st.q;
      let lit = o.lit || "";
      const F = LAB.Z([0, 0, Z0]), face = G.angleToward(F, G.viewOf(Pm));
      // the stripe sits toward the − leg (+x) and the camera; the print toward the + leg
      const sA = face - 0.55, pA = face + 0.45;
      const legs = ISO.tinted(ISO.T.steel, [-PITCH / 2, PITCH / 2].map((x) => S(K.cylinder(x, 0, 0.3, 0, Z0 + 0.4, Pm, 10), { tone: "mid" })).join(""));
      const bung = ISO.tinted(ISO.T.rubber, S(G.disc(0, 0.5, R - 0.5, F, Pm, { steps: 28 }), { tone: "lo" }));
      // the sleeve: rolled under at the bottom, a crimp groove 2 mm up, rolled over the top's edge
      const prof = [[0.3, R - 0.4], [0.6, R, 1], [1.7, R], [2, R - 0.35, 1], [2.3, R], [H - 0.6, R], [H - 0.2, R - 0.3, 1], [H, R - 0.8]];
      const sleeve = ISO.tinted(SLEEVE, S(G.solidOf(prof, F, Pm, { steps: 36 }), { tone: "hi", inner: L(G.arcOf(F, 2, R - 0.33, Pm), { tone: "lo" }) }));
      const lid = ISO.tinted(ISO.T.steel, S(G.disc(H - 0.15, H - 0.05, R - 0.8, F, Pm, { steps: 28 }), { tone: "hi" }));
      const tp = (x, y) => K.iso([x, y, Z0 + H - 0.03], Pm), v = R - 1.6;
      const vent = `<path d="${K.pathOf([tp(-v, 0), tp(v, 0)])}${K.pathOf([tp(0, -v), tp(0, v)])}" stroke="#7d8189" stroke-width="0.6" data-free=""/>`;
      // the stripe: a band up the sleeve between the crimp and the top roll, − signs printed down it
      const band = (s0, s1, a0, a1) => { const pts = []; for (let i = 0; i <= 8; i++) pts.push(K.iso(G.pointOf(F, s0, R + 0.03, a0 + ((a1 - a0) * i) / 8), Pm)); for (let i = 8; i >= 0; i--) pts.push(K.iso(G.pointOf(F, s1, R + 0.03, a0 + ((a1 - a0) * i) / 8), Pm)); return K.pathOf(pts, true); };
      const up = (a) => G.tangentOf(F, a);
      let stripe = `<path d="${band(2.5, H - 0.7, sA - 0.4, sA + 0.4)}" fill="#dfe6ee" stroke="#9fb4cc" stroke-width="0.3"/>`;
      for (const s of [4, 6.6, 9.2]) stripe += LAB.faceText(Pm, G.pointOf(F, s - 0.7, R + 0.05, sA), G.mul3(up(sA), -1), "−", 2.4, "#2a5ea4");
      const printed = LAB.faceText(Pm, G.pointOf(F, 6.8, R + 0.05, pA - 0.25), [0, 0, 1], `${+uf.toFixed(1)}µF`, 1.35, "#e8eef6", up(pA - 0.25)) +
        LAB.faceText(Pm, G.pointOf(F, 6.8, R + 0.05, pA + 0.3), [0, 0, 1], `${+volts.toFixed(1)}V`, 1.35, "#e8eef6", up(pA + 0.3));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 0.1, Pm)}"/>` +
        `<g data-name="legs">${legs}</g><g data-name="can">${bung}${sleeve}${lid}${vent}${printed}</g><g data-name="stripe">${stripe}</g><g data-part="charge"></g><g data-part="words"></g>`;
      g.anchors = { plus: [-PITCH / 20, 0, 0], minus: [PITCH / 20, 0, 0], top: [0, 0, (Z0 + H) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      // the charge signs: up to three + by the + leg, three − by the − leg, stacked up from the bench
      const signs = (n) => { let s = ""; for (let i = 0; i < n; i++) s += ISO.word(K.iso([-R - 1.6, 0, Z0 + 2 + i * 3.4], Pm), "+", "#c0392b", { size: 13, anchor: "end", dy: 0 }) + ISO.word(K.iso([R + 1.6, 0, Z0 + 2 + i * 3.4], Pm), "−", "#2b6cc4", { size: 13, anchor: "start", dy: 0 }); return s; };
      const draw = () => {
        const n = Math.round(st.q * 3);
        w.rebuild(el.charge, String(n), () => signs(n));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [0, 0, Z0 + H + 3], "capacitor", "#556"));
        window.B26.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.q !== undefined && Number.isFinite(+p.q)) st.qT = ISO.clamp(+p.q, 0, 1);
        if (p.tau !== undefined && Number.isFinite(+p.tau)) st.tau = ISO.clamp(+p.tau, 0.1, 60);
        if (p.lit !== undefined) lit = p.lit;
      };
      // q → target as e^(−t/τ): the same curve an RC circuit draws (ISO.follow is that exponential)
      g.update = (dt) => { st.q = ISO.follow(st.q, st.qT, dt, st.tau, ISO.still()); draw(); return st.q !== st.qT; };
      g.readout = () => `${+uf.toFixed(1)} µF ${+volts.toFixed(1)} V electrolytic · ${Math.round(st.q * 100)}% charged · τ = ${st.tau.toFixed(1)} s (63% of the way in one τ) · the − leg is by the stripe`;
      draw();
      return g;
    },
  });
})();
