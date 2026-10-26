// "motionsensor cx cy k aim=up|side lab=0 lit=case|face|switch|socket" — a PART (PARTS.md, batch 5): the ultrasonic
// motion sensor of resonance.js (under the hanging spring, looking up at the mass), standing on the bench, origin the
// bench point under its middle. A grey case 8 × 5 × 4 cm on rubber feet; on its face a black bezel round the gold
// transducer foil with its pressed rings (it clicks out ultrasound and times the echo: distance = 343 m/s × t / 2), a
// green status lamp and a two-way sensitivity slide (cart / ball); the cable socket at the back end. aim=up lies it on
// its back with the face up (the scene's use, anchor `face` over the middle); aim=side stands it on its long edge with
// the face looking +x along the bench (at the low end of a road, at a trolley rolling down toward it). Static. World units: 1 = 1 cm.
// anchors: face socket
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HU = 4, HV = 2.5, DW = 4, FC = [-1.2, 0], FR = 1.85;   // half length, half width, depth; the foil's centre and radius on the face

  ISO.add({
    name: "motionsensor", title: "Motion sensor (part)", compare: null,
    about: "An ultrasonic motion sensor: a case with a gold transducer behind a bezel that times the echo off a moving thing, a status lamp, a cart/ball switch and a cable socket; face up (aim=up) or looking along the bench (aim=side). anchors: face socket",
    line: "motionsensor cx cy k aim=up|side lab=0 lit=case|face|switch|socket",
    demo: { line: "motionsensor 480 360 40 aim=up", script: [{ set: {}, hold: 1 }, { set: { lit: "face" }, hold: 1.4 }, { set: { lit: "switch" }, hold: 1.2 }, { set: { lit: "socket" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", side = o.aim === "side";
      // the case's own frame: u along its length, v across, w out of the face (0 at the back, DW at the face)
      const M = side ? (u, v, w) => [w - DW / 2, u, v + HV + 0.3] : (u, v, w) => [u, v, w + 0.3];
      const N = side ? [1, 0, 0] : [0, 0, 1], box = (U, V, W, tone = "mid") => ISO.box((a, b, c) => M(a, b, c), P, U, V, W, tone);
      const Ff = (u, v, s = 0) => G.frameAlong(M(u, v, DW + s), N), on = (u, v, s = 0.02) => K.iso(M(u, v, DW + s), P);
      const out = [];
      // rubber feet under it (on its back, or along its lower long edge)
      out.push(`<path class="iso-halo" d="${K.haloOf(side ? { x: -DW / 2, y: -HU, w: DW, d: 2 * HU, r: 0.4 } : { x: -HU, y: -HV, w: 2 * HU, d: 2 * HV, r: 0.4 }, 0, 0.02, P)}"/>`);
      out.push(ISO.tinted(ISO.T.rubber, side ? box([-HU + 0.4, -HU + 1.6], [-HV - 0.3, -HV], [0.5, DW - 0.5], "lo") + box([HU - 1.6, HU - 0.4], [-HV - 0.3, -HV], [0.5, DW - 0.5], "lo")
        : [[-HU + 0.9, -HV + 0.9], [HU - 0.9, -HV + 0.9], [-HU + 0.9, HV - 0.9], [HU - 0.9, HV - 0.9]].map(([u, v]) => S(K.cylinder(u, v, 0.45, 0, 0.3, P, 14), { tone: "lo" })).join("")));
      // the case: a body, a slightly inset face plate on it, a seam between them
      out.push(`<g data-name="case">${ISO.tinted(ISO.T.steel, box([-HU, HU], [-HV, HV], [0, DW - 0.35]) + box([-HU + 0.15, HU - 0.15], [-HV + 0.15, HV - 0.15], [DW - 0.35, DW]))}`);
      out.push(LAB.faceText(P, M(2.1, -HV + 0.7, DW + 0.02), side ? [0, -1, 0] : [1, 0, 0], "MOTION", 0.36, "#4c5560", side ? [0, 0, 1] : [0, -1, 0]), "</g>");
      // the face: bezel, the foil with its pressed rings and centre button, three bezel screws
      const fz = Ff(FC[0], FC[1]), rings = [0.45, 0.8, 1.15, 1.5].map((r) => `<path d="${G.circleOf(fz, 0.06, r, P)}" fill="none" stroke="#8a6a20" stroke-width="0.6"/>`).join("");
      out.push(`<g data-name="face">${ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.25, FR + 0.35, fz, P, { steps: 40 }), { tone: "mid" }))}` +
        ISO.tinted(ISO.T.brass, S(G.disc(0.25, 0.3, FR, fz, P, { steps: 40 }), { tone: "hi" })) + `<g transform="${K.translateAlong(P, N.map((x) => x * 0.25))}">${rings}</g>` +
        ISO.tinted(ISO.T.brass, S(G.disc(0.3, 0.42, 0.22, fz, P, { steps: 14 }), { tone: "mid" })) +
        D([0, 2.1, 4.2].map((a) => on(FC[0] + Math.cos(a) * (FR + 0.17), FC[1] + Math.sin(a) * (FR + 0.17), 0.27)), { size: 0.3, tone: "lo" }) + "</g>");
      // the status lamp and the sensitivity slide (cart up / ball down) with its icons
      const sw = [2.3, 0.4], f2 = (du, dv, s = 0.02) => on(sw[0] + du, sw[1] + dv, s);
      out.push(`<g data-name="switch"><path d="${G.circleOf(Ff(2.3, 1.6), 0.03, 0.22, P)}" fill="#3fd06a" stroke="#1d5f2c" stroke-width="0.4"/>` +
        `<path d="${K.pathOf([f2(-0.2, -1.0), f2(0.2, -1.0), f2(0.2, 0.9), f2(-0.2, 0.9)], true)}" fill="#1f2226"/>` + ISO.tinted(ISO.T.plastic, box([sw[0] - 0.28, sw[0] + 0.28], [sw[1] + 0.2, sw[1] + 0.8], [DW, DW + 0.25], "hi")) +
        `<path d="${K.pathOf([f2(0.6, 0.55), f2(1.1, 0.55), f2(1.1, 0.8), f2(0.6, 0.8)], true)}" fill="none" stroke="#4c5560" stroke-width="0.6"/>` +
        `<path d="${G.circleOf(Ff(sw[0] + 0.85, sw[1] - 0.6), 0.03, 0.2, P)}" fill="none" stroke="#4c5560" stroke-width="0.6"/></g>`);
      // the cable socket in the back end (+u), a round dark port in a raised collar
      const Fs = G.frameAlong(M(HU, 0, DW / 2), side ? [0, 1, 0] : [1, 0, 0]);
      out.push(`<g data-name="socket">${ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.25, 0.65, Fs, P, { steps: 20 }), { tone: "mid" }))}<path d="${G.circleOf(Fs, 0.26, 0.35, P)}" fill="#0d0e10"/></g>`);
      if (lab) out.push(LAB.word(P, lab, M(-HU, 0, DW + 1.4), "motion sensor", "#556", { anchor: "end" }));
      g.innerHTML = out.join("");
      g.anchors = { face: M(FC[0], FC[1], DW + 0.42), socket: M(HU + 0.25, 0, DW / 2) };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B27.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `ultrasonic motion sensor · ${side ? "looking along the bench (+x)" : "looking up"} · times the echo: distance = 343 m/s × t ÷ 2 · works from about 15 cm to 6 m`;
      B27.light(w, g, lit);
      return g;
    },
  });
})();
