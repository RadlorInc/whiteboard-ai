// "halleffect cx cy width B=0.25 I=30 lab=1 lit=magnet|probe|meter|supply" — a Hall probe between the poles of an electromagnet.
// A C-shaped iron electromagnet makes a field B straight up across the gap between its poles. A thin slab of n-type
// germanium (1 mm thick) on a probe stick sits in the gap with a current I along it. The electrons that carry the
// current drift the other way, and the field pushes each sideways (F = evB): they pile up on one long edge, leaving the
// other short of electrons, until that charge pushes back as hard as the field. The voltage across the slab is the Hall
// voltage V_H = IB/(net) (n = 1.0 × 10²¹ per m³): 47 mV at 30 mA and 0.25 T. Reverse B and V_H changes sign; double I
// and it doubles. set({ B: tesla }), set({ I: mA }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const Q = 1.602e-19, N = 1e21, T = 1e-3, MAT = { x: -150, y: -84, w: 300, d: 168, r: 6 }, Z0 = 82, GAP = 17, RPOLE = 22, SL = { x: 14, y: 9 };
  const IRON = ISO.tint("#c9ccd2", ["#7d828a", "#8d9299", "#9da2a9", "#adb2b8"], "#2f3338");

  // (each pole piece runs inside its coil and into the yoke, as on the real magnet: the audit's sunk lines)
  function magnetSvg(P, top) {
    const out = [];
    if (!top) {
      out.push(LAB.mat(P, MAT, 3, "lo", ISO.T.wood));
      // the C frame: a foot, the back column and the lower arm, all laminated iron (a few seam lines)
      out.push(ISO.tinted(IRON, ISO.wbox(P, [-96, 30], [-30, 30], [3, 26], "mid") + ISO.wbox(P, [-96, -64], [-30, 30], [26, Z0 + GAP + 40], "mid")));
      out.push(ISO.tinted(IRON, S(K.cylinder(0, 0, RPOLE + 4, 26, 6, P, 48), { tone: "mid" })), ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, 34, 32, Z0 - GAP - 40, P, 56), { tone: "mid", inner: L(K.knurl(0, 0, 34, 32, Z0 - GAP - 8, 40, P), { tone: "faint" }) })));
      out.push(ISO.tinted(IRON, S(G.solidOf([[0, RPOLE], [Z0 - GAP - 3 - 32, RPOLE], [Z0 - GAP - 32, RPOLE - 3]], LAB.Z([0, 0, 32]), P, { steps: 48 }), { tone: "hi" })));
    } else {
      out.push(ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, 34, Z0 + GAP + 8, 32, P, 56), { tone: "mid", inner: L(K.knurl(0, 0, 34, Z0 + GAP + 8, Z0 + GAP + 40, 40, P), { tone: "faint" }) })));
      out.push(ISO.tinted(IRON, ISO.wbox(P, [-96, 30], [-30, 30], [Z0 + GAP + 40, Z0 + GAP + 62], "mid")));
    }
    return out.join("");
  }
  // the upper pole piece: drawn after the slab only where it is nearer (it hangs above the gap)
  const upperPole = (P) => ISO.tinted(IRON, S(G.solidOf([[0, RPOLE - 3], [3, RPOLE], [GAP + 40, RPOLE]], LAB.Z([0, 0, Z0 + GAP]), P, { steps: 48 }), { tone: "hi" }));
  // the probe: a white stick on a little stand, the slab at its tip with four solder pads and their leads
  function probeSvg(P) {
    const out = [S(K.cylinder(0, 92, 10, 3, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(0, 92, 2.4, 5.4, Z0 - 10, P, 16), { tone: "mid", crease: "none" })];
    out.push(ISO.wbox(P, [-5, 5], [86, 98], [Z0 - 6, Z0 + 2], "mid"));
    out.push(ISO.wbox(P, [-4, 4], [SL.y, 88], [Z0 - 2, Z0 - 0.6], "hi"));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-SL.x, SL.x], [-SL.y, SL.y], [Z0 - 0.6, Z0 + 0.4], "hi")));
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [-SL.x - 2, -SL.x + 2], [-3, 3], [Z0 + 0.4, Z0 + 0.8], "mid") + ISO.wbox(P, [SL.x - 2, SL.x + 2], [-3, 3], [Z0 + 0.4, Z0 + 0.8], "mid") + ISO.wbox(P, [-3, 3], [-SL.y - 1, -SL.y + 2], [Z0 + 0.4, Z0 + 0.8], "mid") + ISO.wbox(P, [-3, 3], [SL.y - 2, SL.y + 1], [Z0 + 0.4, Z0 + 0.8], "mid")));
    const lead = (pts, c, wd = 1.1) => `<path d="${K.pathOf(LAB.bend(pts, 4).map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // four fine leads from the pads along the top of the stick to the stand's block: current (red in, black out) at
    // the slab's ends, Hall leads (yellow, blue) from its two long edges
    const zt = Z0 - 0.4, run = (dx) => [[dx, SL.y + 2, zt], [dx, 86, zt]];
    out.push(lead([[-SL.x, 0, Z0 + 0.8], [-SL.x, SL.y + 2, zt], ...run(-3)], "#c0392b"), lead([[SL.x, 0, Z0 + 0.8], [SL.x, SL.y + 2, zt], ...run(3)], "#2a2b2f"));
    out.push(lead([[0, SL.y, Z0 + 0.8], [0, SL.y + 2, zt], ...run(-1)], "#e09a00"), lead([[0, -SL.y, Z0 + 0.8], [6, -SL.y - 2, zt], [SL.x + 4, -SL.y - 2, zt], [SL.x + 4, SL.y + 4, zt], ...run(1)], "#2b6cc4"));
    // from the block, two cables down to the boxes on the mat
    out.push(lead([[3, 98, Z0 - 3], [3, 104, Z0 - 6], [3, 104, 6], [BX.mv[0] + 8, 104, 6], [BX.mv[0] + 8, (BX.mv[2] + BX.mv[3]) / 2, BX.mv[4]]], "#3a3e44", 1.6));
    out.push(lead([[-3, 98, Z0 - 3], [-3, 106, Z0 - 8], [-3, 106, 5], [BX.cs[0] + 8, 106, 5], [BX.cs[0] + 8, (BX.cs[2] + BX.cs[3]) / 2, BX.cs[4]]], "#3a3e44", 1.6));
    return out.join("");
  }
  // the coil supply behind the magnet, its leads to the lower coil
  function coilSupply(P) {
    const [x0, x1, y0, y1, z1] = BX.ps;
    return ISO.wbox(P, [x0, x1], [y0, y1], [3, z1], "mid") + ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x0 + 4, x1 - 4], [y1, y1 + 0.6], [16, 34], "hi")) +
      `<path d="${K.pathOf(LAB.bend([[x1 - 6, y1 - 4, z1], [x1 - 6, -36, z1 + 4], [-60, -36, 40], [-24, -24, 40]], 8).map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>` + D([K.iso([-24, -24, 40], P), K.iso([x1 - 6, y1 - 4, z1], P)], { size: 0.8 });
  }
  // the two boxes on the right: the probe's current supply (back) and the millivoltmeter (front), and the coil supply
  const BX = { mv: [36, 86, 56, 80, 26], cs: [96, 144, 56, 80, 30], ps: [-140, -100, -76, -40, 40] };
  function boxesSvg(P) {
    const out = [], box = ([x0, x1, y0, y1, z1], tint = "") => ISO.tinted(tint, ISO.wbox(P, [x0, x1], [y0, y1], [3, z1], "mid"));
    out.push(box(BX.cs), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [BX.cs[0] + 4, BX.cs[1] - 4], [BX.cs[3], BX.cs[3] + 0.6], [12, 26], "hi")));
    out.push(box(BX.mv, ISO.T.amber), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [BX.mv[0] + 5, BX.mv[1] - 5], [BX.mv[3], BX.mv[3] + 0.6], [10, 22], "hi")));
    return out.join("");
  }

  ISO.add({
    name: "halleffect", title: "Hall probe in a magnet", compare: "halleffect 470 270 460",
    about: "A current-carrying germanium slab between the poles of an electromagnet: the field pushes the electrons to one edge and a millivoltmeter reads the Hall voltage V_H = IB/(net).",
    line: "halleffect cx cy width B=0.25 I=30 lab=1 lit=magnet|probe|meter|supply",
    demo: { line: "halleffect 470 270 460 B=0", script: [{ set: { B: 0 }, hold: 1.4 }, { set: { B: 0.25, lit: "meter" }, hold: 2.6 }, { set: { B: -0.25, lit: "" }, hold: 2.6 }, { set: { I: 15, lit: "probe" }, hold: 2.6 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.25, H = size * 0.98;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [-96, -30, Z0 + GAP + 62], [30, 30, Z0 + GAP + 62]], cx, cy, W, H, { azimuth: 62, elevation: 26 }, parent);
      const s = { B: ISO.clamp(ISO.num(o, "B", 0.25), -0.4, 0.4), I: ISO.clamp(ISO.num(o, "I", 30), 0, 50), clock: 0 }; s.BT = s.B; s.IT = s.I;
      let lit = o.lit || "";
      const VH = () => ((s.I / 1000) * s.B) / (N * Q * T);
      g.innerHTML = `<g data-name="supply">${coilSupply(P)}<g data-part="coilread"></g></g><g data-name="magnet">${magnetSvg(P, false)}</g><g data-name="meter">${boxesSvg(P)}<g data-part="displays"></g></g><g data-part="field"></g><g data-name="probe">${probeSvg(P)}</g><g data-part="carriers"></g><g data-name="magnet">${upperPole(P)}${magnetSvg(P, true)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const bq = Math.round(s.B * 100) / 100, iq = Math.round(s.I), vh = VH();
        // field lines across the gap: dashed arrows up (or down), as many as the field is strong
        w.rebuild(el.field, String(bq), () => {
          const n = Math.round(Math.abs(bq) / 0.05), out = [];
          for (let k = 0; k < n; k++) { const a = (k / Math.max(n, 1)) * 2 * Math.PI + 0.3, x = Math.cos(a) * 16, y = Math.sin(a) * 16; if (Math.abs(y) < SL.y + 2 && Math.abs(x) < SL.x + 2) continue; const z0 = Z0 - GAP + 1, z1 = Z0 + GAP - 1, up = bq > 0, A = K.iso([x, y, up ? z0 : z1], P), B2 = K.iso([x, y, up ? z1 : z0], P), dir = up ? 1 : -1; out.push(`<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B2[0].toFixed(1)} ${B2[1].toFixed(1)}M${(B2[0] - 3).toFixed(1)} ${(B2[1] + dir * 5).toFixed(1)}L${B2[0].toFixed(1)} ${B2[1].toFixed(1)}L${(B2[0] + 3).toFixed(1)} ${(B2[1] + dir * 5).toFixed(1)}" fill="none" stroke="#6a3d9a" stroke-width="1" stroke-dasharray="3 2"/>`); }
          return out.join("");
        });
        // electrons drifting against the current along the slab, pushed toward the −y edge for B up (+y edge for B down);
        // the charges piled on the edges: − where they gather, + on the edge they left
        const tq = Math.round(s.clock * 20) / 20;
        w.rebuild(el.carriers, `${tq} ${bq} ${iq}`, () => {
          const out = [], push = Math.max(-1, Math.min(1, bq / 0.3)), sp = iq / 30;
          for (let k = 0; k < 14; k++) { const f = (tq * 0.5 * sp + k / 14) % 1, x = SL.x - 2 - f * (2 * SL.x - 4), y = ((k % 5) - 2) * 3 * (1 - Math.abs(push) * 0.5) - push * 3.5, p = K.iso([x, y, Z0 + 0.45], P); if (iq > 0) out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.2" fill="#2b6cc4"/>`); }
          const m = Math.round(Math.abs(push) * 6 * (iq / 30));
          for (let k = 0; k < m; k++) { const x = -SL.x + 4 + (k * (2 * SL.x - 8)) / Math.max(m - 1, 1); const neg = K.iso([x, -Math.sign(push) * (SL.y - 1.6), Z0 + 0.45], P), pos = K.iso([x, Math.sign(push) * (SL.y - 1.6), Z0 + 0.45], P); out.push(`<text x="${neg[0].toFixed(1)}" y="${(neg[1] + 3).toFixed(1)}" text-anchor="middle" fill="#2b6cc4" style="font:700 9px sans-serif">−</text><text x="${pos[0].toFixed(1)}" y="${(pos[1] + 3).toFixed(1)}" text-anchor="middle" fill="#c0392b" style="font:700 9px sans-serif">+</text>`); }
          return out.join("");
        });
        w.rebuild(el.displays, `${bq} ${iq} ${(vh * 1000).toFixed(1)}`, () =>
          LAB.faceText(P, [(BX.mv[0] + BX.mv[1]) / 2, BX.mv[3] + 0.7, 13], [1, 0, 0], `${(vh * 1000).toFixed(1)} mV`, 6, "#7fe08a") +
          LAB.faceText(P, [(BX.cs[0] + BX.cs[1]) / 2, BX.cs[3] + 0.7, 16], [1, 0, 0], `${iq} mA`, 5, "#7fe08a"));
        w.rebuild(el.coilread, String(bq), () => LAB.faceText(P, [(BX.ps[0] + BX.ps[1]) / 2, BX.ps[3] + 0.7, 22], [1, 0, 0], `B ${bq.toFixed(2)} T`, 4.6, "#7fe08a"));
        w.rebuild(el.words, lab ? `${Math.sign(bq)}` : "", () => !lab ? "" :
          ISO.word(K.iso([-80, 0, Z0 + GAP + 64], P), "electromagnet", "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([0, 92, Z0 + 4], P), "Hall probe", "#555", { size: 13, dy: -8 }) +
          ISO.word(K.iso([(BX.mv[0] + BX.mv[1]) / 2, BX.mv[3], 3], P), "V_H", "#555", { size: 13, dy: 16 }) + ISO.word(K.iso([(BX.cs[0] + BX.cs[1]) / 2, BX.cs[3], 3], P), "probe current", "#555", { size: 13, dy: 16 }) + (bq ? ISO.word(K.iso([28, -20, Z0 + 12], P), bq > 0 ? "B up" : "B down", "#6a3d9a", { size: 14, anchor: "start" }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.B !== undefined) s.BT = ISO.clamp(+p.B, -0.4, 0.4);
        if (p.I !== undefined) s.IT = ISO.clamp(+p.I, 0, 50);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (!calm) s.clock += dt;
        s.B = ISO.follow(s.B, s.BT, dt, 0.35, calm); if (Math.abs(s.B - s.BT) < 0.002) s.B = s.BT;
        s.I = ISO.follow(s.I, s.IT, dt, 0.35, calm); if (Math.abs(s.I - s.IT) < 0.2) s.I = s.IT;
        draw();
        return true;
      };
      g.readout = () => {
        const vh = VH() * 1000;
        return Math.abs(s.B) < 0.005 ? `no field: the electrons go straight along the slab, V_H = 0 · I = ${Math.round(s.I)} mA` : `B = ${s.B.toFixed(2)} T, I = ${Math.round(s.I)} mA · electrons pushed to one edge · V_H = IB/(net) = ${vh.toFixed(1)} mV (n = 1.0 × 10²¹ /m³, t = 1 mm) · ${s.B > 0 ? "" : "reversed field, reversed sign"}`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
