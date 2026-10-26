// "celectromagnet cx cy k B=-0.4..0.4 lab=0 lit=core|coils|poles|terminals|field" — a PART (PARTS.md, batch 5): the C-shaped
// electromagnet of halleffect.js, standing on the bench, its origin the bench point straight under the gap's middle.
// A C core of laminated iron (the sheets stacked along y, their seams on the top and end faces, four clamping bolts),
// 20 cm along x, 8 cm thick, 17.5 cm tall; two round pole pieces face each other across a 3.6 cm gap whose middle is
// 8 cm above the bench (so a hallprobe's slab, 8 cm up, sits in it: place it at=<id>.gap); a copper coil on a bobbin
// round each pole, wired in series to a terminal block on the foot (anchors a, b: the red and black terminals' tops,
// for wireleads from a supply). B (tesla) is the field across the gap, eased as the current builds: purple dashed
// arrows straight up for B > 0, down for B < 0, as many as the field is strong, none at 0; set({ B }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const IRON = ISO.tint("#c9ccd2", ["#7d828a", "#8d9299", "#9da2a9", "#adb2b8"], "#2f3338");
  const Y = 40, XB = -150, XC = -100, XE = 50, ZF = 28, ZA = 140, ZT = 175, Z0 = 80, GAP = 18, RP = 26, RC = 48;
  const SHEETS = [-30, -20, -10, 0, 10, 20, 30];

  ISO.add({
    name: "celectromagnet", title: "C-core electromagnet (part)", compare: null,
    about: "A C-shaped laminated iron electromagnet with a coil round each pole: a current through the coils makes a field B straight across the 3.6 cm gap between the poles (up, down or off). anchors: gap a b",
    line: "celectromagnet cx cy k B=-0.4..0.4 lab=0 lit=core|coils|poles|terminals|field",
    demo: { line: "celectromagnet 520 420 18 B=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { B: 0.25, lit: "field" }, hold: "settle" }, { set: { B: -0.25, lit: "coils" }, hold: "settle" }, { set: { B: 0, lit: "poles" }, hold: "settle" }, { set: { lit: "terminals" }, hold: 1 }, { set: { B: 0.4, lit: "core" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { B: ISO.clamp(ISO.num(o, "B", 0.25), -0.4, 0.4) }; s.BT = s.B;
      let lit = o.lit || "";
      const iron = (pts, y0, y1) => ISO.prismY(Pm, pts, y0, y1, ["#6f747c", "#b4b9bf"], "#a5aab1", "#2f3338");
      const seam = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)))}" fill="none" stroke="#2f3338" stroke-opacity=".38" stroke-width="0.6"/>`;
      // the lower C: foot and back column, one stack of sheets; the seams run over the foot's top and down its end
      const lowerC = iron([[XB, 0], [XE, 0], [XE, ZF], [XC, ZF], [XC, ZA], [XB, ZA]], -Y, Y) +
        SHEETS.map((y) => seam([[XC, y, ZF], [XE, y, ZF], [XE, y, 0]]) + seam([[XC, y, ZF], [XC, y, ZA]])).join("");
      const topArm = iron([[XB, ZA], [XE, ZA], [XE, ZT], [XB, ZT]], -Y, Y) + SHEETS.map((y) => seam([[XB, y, ZT], [XE, y, ZT], [XE, y, ZA]])).join("");
      // the clamping bolts through the stack (heads on the front sheet), a name plate
      const Fy = (x, z) => LAB.A([x, Y, z], [0, 1, 0]);
      const bolt = (x, z) => ISO.tinted(ISO.T.steel, S(G.disc(0, 2.5, 5, Fy(x, z), Pm), { tone: "mid" }));
      const bolts = [[-138, 14], [30, 14], [-138, ZT - 14], [30, ZT - 14], [-125, 84]].map(([x, z]) => bolt(x, z)).join("");
      const plate = `<path d="${K.pathOf([[-140, Y + 0.1, 40], [-110, Y + 0.1, 40], [-110, Y + 0.1, 60], [-140, Y + 0.1, 60]].map((p) => K.iso(p, Pm)), true)}" fill="#eef0f2" stroke="#3b434b" stroke-width="0.5"/>` +
        LAB.faceText(Pm, [-125, Y + 0.2, 52], [1, 0, 0], "0.4 T max", 3.6, "#3b434b") + LAB.faceText(Pm, [-125, Y + 0.2, 45], [1, 0, 0], "6 V · 2 A", 3, "#3b434b");
      // a coil: a black bobbin (two flanges and the core tube) wound with copper, its turns as fine rows
      const coil = (z0, z1) => {
        let wind = ""; for (let z = z0 + 6; z < z1 - 4; z += 3) wind += K.sideArc(0, 0, RC - 4, z, Pm, 28);
        return ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, RC, z0, 3, Pm, 56), { tone: "mid" })) +
          ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, RC - 4, z0 + 3, z1 - z0 - 6, Pm, 56), { tone: "mid", crease: "none", inner: L(wind, { tone: "faint" }) })) +
          ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, RC, z1 - 3, 3, Pm, 56), { tone: "mid" }));
      };
      // the pole pieces: iron cylinders from the yoke to the gap, chamfered at the face
      const Zf = LAB.Z([0, 0, 0]);
      const lowerPole = ISO.tinted(IRON, S(G.lathe([[ZF, 0], [ZF, RP], [Z0 - GAP - 3, RP], [Z0 - GAP, RP - 3], [Z0 - GAP, 0]], Zf, Pm), { tone: "hi" }));
      const upperPole = ISO.tinted(IRON, S(G.lathe([[Z0 + GAP, 0], [Z0 + GAP, RP - 3], [Z0 + GAP + 3, RP], [ZA, RP], [ZA, 0]], Zf, Pm), { tone: "hi" }));
      // the terminal block on the foot, the two coil leads to it and the link between the coils
      const TB = { x0: -94, x1: -56, y0: 4, y1: 34 }, post = (x, tint) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, 20, 3, ZF + 10, 4, Pm, 14), { tone: "mid" })) + ISO.tinted(tint, S(K.cylinder(x, 20, 5, ZF + 14, 8, Pm, 20, 0.8), { tone: "hi" }));
      const lead = (pts, c) => `<path d="${K.pathOf(LAB.bend(pts, 6).map((p) => K.iso(p, Pm)))}" fill="none" stroke="${c}" stroke-width="${(G.scaleOf(Pm) * 1.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      const c45 = Math.SQRT1_2 * (RC - 4);
      const wires = lead([[-c45, c45, ZF + 16], [-60, 32, ZF + 16], [-66, 20, ZF + 12]], "#8a3b1c") +
        lead([[-(RC - 4), 0, 118], [-70, 4, 118], [-70, 4, ZF + 30], [-82, 20, ZF + 14]], "#8a3b1c") +
        lead([[-(RC - 4) * 0.94, -(RC - 4) * 0.34, 54], [-62, -24, 54], [-62, -24, 110], [-(RC - 4) * 0.94, -(RC - 4) * 0.34, 110]], "#8a3b1c");
      const block = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [TB.x0, TB.x1], [TB.y0, TB.y1], [ZF, ZF + 10], "mid"));
      const terminals = post(-82, ISO.T.red) + post(-66, ISO.T.rubber);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: XB, y: -RC, w: XE - XB, d: 2 * RC, r: 4 }, 0, ZF, Pm)}"/>` +
        `<g data-name="core">${lowerC}${bolts}${plate}</g><g data-name="terminals">${block}</g><g data-name="coils">${wires}${coil(ZF + 2, Z0 - GAP - 6)}</g>` +
        `<g data-name="terminals">${terminals}</g><g data-name="poles">${lowerPole}</g><g data-name="field"><g data-part="field"></g></g>` +
        `<g data-name="poles">${upperPole}</g><g data-name="coils">${coil(Z0 + GAP + 6, ZA - 2)}</g><g data-name="core">${topArm}</g><g data-part="words"></g>`;
      g.anchors = { gap: [0, 0, Z0 / 10], a: [-8.2, 2, (ZF + 22) / 10], b: [-6.6, 2, (ZF + 22) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const bq = Math.round(s.B * 100) / 100;
        // field lines across the gap on a ring 1.6 cm out (a probe's slab, ±1.4 × ±0.9 cm, is left clear)
        w.rebuild(el.field, String(bq), () => {
          const n = Math.round(Math.abs(bq) / 0.04), out = [];
          for (let i = 0; i < n; i++) {
            const a = (i / n) * 2 * Math.PI + 0.3, x = Math.cos(a) * 18, y = Math.sin(a) * 18;
            if (Math.abs(y) < 11 && Math.abs(x) < 16) continue;
            const up = bq > 0, z0 = Z0 - GAP + 1, z1 = Z0 + GAP - 1, A = K.iso([x, y, up ? z0 : z1], Pm), B2 = K.iso([x, y, up ? z1 : z0], Pm), dir = up ? 1 : -1, h = G.scaleOf(Pm) * 3;
            out.push(`<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B2[0].toFixed(1)} ${B2[1].toFixed(1)}M${(B2[0] - h * 0.6).toFixed(1)} ${(B2[1] + dir * h).toFixed(1)}L${B2[0].toFixed(1)} ${B2[1].toFixed(1)}L${(B2[0] + h * 0.6).toFixed(1)} ${(B2[1] + dir * h).toFixed(1)}" fill="none" stroke="#6a3d9a" stroke-width="1" stroke-dasharray="3 2"/>`);
          }
          return out.join("");
        });
        if (lab) w.rebuild(el.words, String(Math.sign(bq)), () => LAB.word(Pm, lab, [XB + 40, 0, ZT + 8], "electromagnet", "#445", { dy: -6 }) + LAB.word(Pm, lab, [-74, TB.y1, ZF], "to the supply", "#445", { dy: 16, size: 12 }) + (bq ? LAB.word(Pm, lab, [RC + 6, 0, Z0], bq > 0 ? "B up" : "B down", "#6a3d9a", { anchor: "start", dy: 0 }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.B !== undefined && Number.isFinite(+p.B)) s.BT = ISO.clamp(+p.B, -0.4, 0.4);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.B = ISO.follow(s.B, s.BT, dt, 0.35, ISO.still()); if (Math.abs(s.B - s.BT) < 0.002) s.B = s.BT;
        draw();
        return s.B !== s.BT;
      };
      g.readout = () => (Math.abs(s.B) < 0.005 ? "electromagnet off · no field in the gap" : `B = ${Math.abs(s.B).toFixed(2)} T ${s.B > 0 ? "up" : "down"} across the 3.6 cm gap · about ${(Math.abs(s.B) / 0.4 * 2).toFixed(1)} A in the coils`);
      draw();
      return g;
    },
  });
})();
