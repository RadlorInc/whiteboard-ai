// "stirlingengine cx cy k rpm=-300..300 lab=0 lit=plates|displacer|piston|post|cranks|flywheel|pulley" — a PART
// (PARTS.md): a low-temperature-difference Stirling engine, origin the point under the middle of its hot plate (it
// stands on a mug's `rim`). 15 cm aluminium hot and cold plates with a clear acrylic ring between them (the foam
// displacer shows through it, riding up and down), eight bolts, a brass gland for the displacer rod, the graphite power
// piston in its glass cylinder, the bearing post with its block carrying the crankshaft 12.5 cm up, two cranks 90°
// apart (the displacer's leads), the connecting rods, a six-spoke flywheel 12.4 cm across on the far end and a small
// pulley on the near end (where a motor's belt drives it as a fridge). rpm = turns a minute, eased: + runs as a heat
// engine, − turns it backward (driven by a motor, it pumps heat: a fridge). Reused from heatengine.js, in mm; anchors
// in cm. set({ rpm }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RP = 75, ZC = 24, ZS = 125, XF = -50, RF = 62, CP = 30, ROD = 75, CR = { d: [0, 5], p: [CP, 6] }, XPU = 40;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const FOAM = ISO.tint("#f4f1ea", ["#c9c3b6", "#d6d1c6", "#e2ded5", "#ece9e2"], "#6f6a5e");
  const GRAPH = ISO.tint("#7a7f86", ["#3e4247", "#4a4e54", "#575b61", "#63676d"], "#202225");

  // where the two cranks put the rod ends at shaft angle th: the pin on each crank and the rod's lower end
  const rods = (th) => [["d", 0], ["p", -Math.PI / 2]].map(([key, ph]) => {
    const [x, r] = CR[key], a = th + ph, pin = [x, r * Math.sin(a), ZS - r * Math.cos(a)];
    return { key, x, r, a, pin, top: [x, 0, pin[2] - Math.sqrt(ROD * ROD - pin[1] * pin[1])] };
  });
  const rod = (P, a, b, w) => { const d = K.pathOf([K.iso(a, P), K.iso(b, P)]), s = K.screenRise(1, P) * w; return `<path d="${d}" stroke="#3c3f45" stroke-width="${(s + 1).toFixed(2)}" stroke-linecap="round"/><path d="${d}" stroke="#d9dadd" stroke-width="${s.toFixed(2)}" stroke-linecap="round"/>`; };

  ISO.add({
    name: "stirlingengine", title: "Stirling engine (part)", compare: null,
    about: "A low-temperature Stirling engine (15 cm plates, 20 cm tall): hot plate, acrylic ring with the displacer inside, cold plate, power piston in a glass cylinder, bearing post, crankshaft with two cranks, rods, spoked flywheel and a pulley; rpm + runs it as an engine, − turns it backward as a fridge. anchors: top pulley shaft",
    line: "stirlingengine cx cy k rpm=-300..300 lab=0 lit=plates|displacer|piston|post|cranks|flywheel|pulley",
    demo: { line: "stirlingengine 480 430 20", script: [{ set: {}, hold: 1 }, { set: { rpm: 90 }, hold: 3 }, { set: { lit: "flywheel" }, hold: 1.5 }, { set: { rpm: -120, lit: "displacer" }, hold: 3 }, { set: { lit: "piston" }, hold: 1.5 }, { set: { rpm: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { rpm: ISO.clamp(ISO.num(o, "rpm", 0), -300, 300), lit: o.lit || "", th: 0.3 }, want = { rpm: st.rpm }, w = ISO.writer();
      const ring = (z, r) => Array.from({ length: 8 }, (_, i) => [Math.cos((i / 8) * 2 * Math.PI + 0.4) * r, Math.sin((i / 8) * 2 * Math.PI + 0.4) * r, z]);
      // hot plate, with the lip of its rim
      const hot = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RP, 0, 4, Pm, 64, 0.6), { tone: "mid" }));
      // acrylic ring (see-through), cold plate, its bolts, the gland
      const glass = `<g style="${ISO.T.glass};opacity:.5">${S(K.cylinder(0, 0, RP - 6, 4, ZC - 4, Pm, 64), { tone: "hi", crease: "faint" })}</g>`;
      const cold = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RP, ZC, 4, Pm, 64, 0.6), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, ring(ZC + 4, RP - 4).sort((a, b) => K.depthOf(a, Pm) - K.depthOf(b, Pm)).map(([x, y, z]) => S(K.cylinder(x, y, 2.6, z, 2, Pm, 12), { tone: "mid" })).join("")) +
        D(ring(4, RP - 4).filter(([x, y]) => K.depthOf([x, y, 0], Pm) > K.depthOf([0, 0, 0], Pm)).map((p) => K.iso(p, Pm)), { size: 0.5 }) +
        ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 5, ZC + 4, 8, Pm, 20), { tone: "mid" }));
      // flywheel (far end of the shaft): rim, web line, hub and its set screw; spokes turn
      const Ff = xAx([XF, 0, ZS]);
      const wheel = ISO.tinted(ISO.T.brass, S(G.ringBand(-3, 3, RF - 6, RF, Ff, Pm, { steps: 64 }), { tone: "hi" }) + L(G.circleOf(Ff, 3, RF - 6, Pm, 64), { tone: "lo" }) + S(G.disc(-3, 3, 7, Ff, Pm, { steps: 24 }), { tone: "mid" }));
      // bearing post on its foot, the bearing block with two cap screws, the shaft both sides of it, the pulley
      const post = ISO.tinted(ISO.T.steel, ISO.wbox(Pm, [-28, -8], [-9, 9], [ZC + 4, ZC + 7], "mid") + ISO.wbox(Pm, [-22, -14], [-5, 5], [ZC + 7, ZS - 8], "mid") + ISO.wbox(Pm, [-24, -12], [-7, 7], [ZS - 8, ZS + 8], "mid")) +
        D([K.iso([-25, 6, ZC + 7], Pm), K.iso([-11, 6, ZC + 7], Pm), K.iso([-18, 5, ZS + 8], Pm)], { size: 0.5 }) +
        S(G.disc(XF + 4, -24, 1.6, xAx([0, 0, ZS]), Pm), { tone: "mid" }) + S(G.disc(-12, XPU + 6, 1.6, xAx([0, 0, ZS]), Pm), { tone: "mid" });
      const Fu = xAx([XPU, 0, ZS]);
      const pulley = ISO.tinted(ISO.T.brass, S(G.disc(0, 6, 6, Fu, Pm, { steps: 24 }), { tone: "mid" }) + S(G.disc(0, 1, 8, Fu, Pm, { steps: 28 }), { tone: "mid" }) + S(G.disc(5, 6, 8, Fu, Pm, { steps: 28 }), { tone: "hi" }));
      // the power cylinder: brass foot ring, glass tube (see-through: the piston shows), brass top ring
      const cylFoot = ISO.tinted(ISO.T.brass, S(K.cylinder(CP, 0, 11, ZC + 4, 3, Pm, 28), { tone: "mid" }));
      const cylGlass = `<g style="${ISO.T.glass};opacity:.5">${S(K.cylinder(CP, 0, 9, ZC + 7, 22, Pm, 28), { tone: "hi" })}</g>` + ISO.tinted(ISO.T.brass, S(K.cylinder(CP, 0, 10, ZC + 27, 2, Pm, 28), { tone: "mid" }));
      // moving: displacer (inside the ring), piston, cranks and rods, spokes
      const dispSvg = (R) => { const zb = R[0].top[2] - (ZS - ROD - 10); return ISO.tinted(FOAM, S(K.cylinder(0, 0, RP - 13, zb, 8, Pm, 48), { tone: "hi" })) + S(K.cylinder(0, 0, 1.2, zb + 8, ZC - zb - 8, Pm, 8), { tone: "mid", crease: "none" }); };
      const pistSvg = (R) => { const zt = R[1].top[2] - 10; return ISO.tinted(GRAPH, S(K.cylinder(CP, 0, 8.6, zt - 7, 7, Pm, 24), { tone: "mid" })) + S(K.cylinder(CP, 0, 1.2, zt, 10, Pm, 8), { tone: "mid", crease: "none" }); };
      const crankSvg = (R) => {
        const out = [S(K.cylinder(0, 0, 1.2, ZC + 12, R[0].top[2] - ZC - 12, Pm, 8), { tone: "mid", crease: "none" })];
        for (const r of R) {
          const rd = [Math.sin(r.a), -Math.cos(r.a)], td = [Math.cos(r.a), Math.sin(r.a)];
          out.push(ISO.tinted(ISO.T.steel, ISO.box((u, v, y) => [r.x + u, rd[0] * y + td[0] * v, ZS + rd[1] * y + td[1] * v], Pm, [-1.6, 1.6], [-2.6, 2.6], [-2.6, r.r + 2.8], "mid")));
          out.push(rod(Pm, r.pin, r.top, 2.4), D([K.iso(r.pin, Pm), K.iso(r.top, Pm)], { size: 0.8 }));
        }
        return out.join("");
      };
      const spokesF = (th) => L(G.spokesOf(Ff, 3, 7, RF - 6, 6, Pm, { phase: th }), { tone: "mid" }), spokesU = (th) => L(G.spokesOf(Fu, 6.1, 1.6, 6, 3, Pm, { phase: th }), { tone: "mid" });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RP, y: -RP, w: 2 * RP, d: 2 * RP, r: RP }, 0, 4, Pm)}"/>` +
        `<g data-name="plates">${hot}</g><g data-name="displacer" data-part="disp"></g><g data-name="plates">${glass}${cold}</g>` +
        `<g data-name="flywheel">${wheel}<g data-part="spokesF"></g></g><g data-name="post">${post}</g><g data-name="pulley">${pulley}<g data-part="spokesU"></g></g><g data-name="piston">${cylFoot}</g><g data-name="piston" data-part="pist"></g><g data-name="piston">${cylGlass}</g>` +
        `<g data-name="cranks" data-part="cranks"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, (ZC + 4) / 10], pulley: [(XPU + 3) / 10, 0, ZS / 10], shaft: [0, 0, ZS / 10] };
      const el = LAB.parts(g);
      const draw = () => {
        const thq = Math.round(st.th * 50) / 50, R = rods(thq);
        w.rebuild(el.disp, String(thq), () => dispSvg(R));
        w.rebuild(el.pist, String(thq), () => pistSvg(R));
        w.rebuild(el.cranks, String(thq), () => crankSvg(R));
        w.rebuild(el.spokesF, String(thq), () => spokesF(thq));
        w.rebuild(el.spokesU, String(thq), () => spokesU(thq));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([XF, 0, ZS + RF + 10], Pm), "flywheel", "#555", { size: 13 }) + ISO.word(K.iso([RP, 0, 10], Pm), "hot plate", "#c0392b", { size: 13, anchor: "start", dy: 4 }) + ISO.word(K.iso([RP, 0, ZC + 4], Pm), "cold plate", "#2b6cc4", { size: 13, anchor: "start", dy: -4 }));
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.rpm !== undefined && Number.isFinite(+p.rpm)) want.rpm = ISO.clamp(+p.rpm, -300, 300);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.rpm = ISO.follow(st.rpm, want.rpm, dt, 0.8, calm);
        if (Math.abs(st.rpm - want.rpm) < 0.2) st.rpm = want.rpm;
        if (!calm) st.th = (st.th + (st.rpm / 60) * 2 * Math.PI * dt) % (2 * Math.PI);
        draw();
        return st.rpm !== 0 || st.rpm !== want.rpm;
      };
      g.readout = () => (st.rpm > 0.5 ? `Stirling engine running at ${Math.round(st.rpm)} turns a minute: heat in at the hot plate, work out at the flywheel, the rest out of the cold plate` : st.rpm < -0.5 ? `Stirling engine turned backward at ${Math.round(-st.rpm)} turns a minute: work in, heat pumped out of what is under the hot plate (a fridge)` : "Stirling engine at rest · 15 cm plates, shaft 12.5 cm up, flywheel 12.4 cm across");
      draw();
      return g;
    },
  });
})();
