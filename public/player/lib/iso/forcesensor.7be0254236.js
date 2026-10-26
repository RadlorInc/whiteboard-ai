// "forcesensor cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 lab=0 lit=sensor|hook|cable" — a PART
// (PARTS.md, batch 5): the force sensor of resonance.js's damped spring, hanging from a stand arm, origin its hanging
// point (the top of its steel eye: place it at= a retortstand's `clamp`, or under any arm). A blue case 3 × 3 × 5 cm tall
// hangs from the eye on a threaded stud; a ±10 / ±50 N range slide on its +x side, a TARE key and the printed name on
// its face (+y); under it a steel J hook on a stud (anchor `hook`: where a spring's top loop hangs). The sensor cable
// leaves its +x side through a strain relief and hangs in a soft curve to its plug: to=<id>.<anchor> (the player passes
// tox toy dz, as wirelead), e.g. a datalogger's `in1`, the plug pointing down into it; without to=, dx dy dz (cm) from
// the eye. Static. World units: 1 = 1 cm. anchors: hook plug
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HB = 1.5, ZT = -1.6, ZB = -6.6, FY = HB + 0.02, OUT = [HB + 0.9, 0, -2.6], HOOK = [0, 0, ZB - 2.7];
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // a round steel bar along screen points: outline and body, as LAB.ringClamp's ring
  const bar = (P, pts, r) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = G.scaleOf(P) * 2 * r; return `<path d="${d}" fill="none" stroke="#5a6068" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c9ced3" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`; };

  function sensorSvg(P) {
    const LAB = window.LAB, plan = { x: -HB, y: -HB, w: 2 * HB, d: 2 * HB, r: 0.35 }, out = [];
    // the eye (a steel ring in the x–z plane) and the stud into the case's top
    const ring = []; for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2; ring.push([Math.sin(a) * 0.5, 0, -0.6 + Math.cos(a) * 0.5]); }
    out.push(bar(P, ring, 0.12));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.22, ZT, -1.12 - ZT, P, 12), { tone: "mid", crease: "none" }) + S(K.cylinder(0, 0, 0.42, ZT, 0.3, P, 6), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.blue, S(K.slabOf(plan, ZB, ZT - ZB, P, 4, 0.25), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, ZB + 0.9, P, 4), { tone: "faint" }) })));
    // the face: name, range, the TARE key; the range slide in its slot on the +x side
    out.push(LAB.faceText(P, [0, FY, -2.75], [1, 0, 0], "FORCE", 0.46, "#1f4f8f"), LAB.faceText(P, [0, FY, -3.35], [1, 0, 0], "±10 N · ±50 N", 0.28, "#3d5a70"));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.18, 0.42, Y([0, HB, -4.6]), P, { steps: 18 }), { tone: "mid" })), LAB.faceText(P, [0, FY, -5.45], [1, 0, 0], "TARE", 0.26, "#3d5a70"));
    const sx = HB + 0.02, s = (y, z) => K.iso([sx, y, z], P);
    out.push(`<path d="${K.pathOf([s(-0.25, -5.6), s(0.25, -5.6), s(0.25, -4.0), s(-0.25, -4.0)], true)}" fill="#1f2226"/>`, ISO.tinted(ISO.T.plastic, ISO.wbox(P, [HB, HB + 0.25], [-0.3, 0.3], [-4.3, -3.85], "hi")));
    out.push(LAB.faceText(P, [sx, 0, -3.6], [0, -1, 0], "50", 0.22, "#1f4f8f"), LAB.faceText(P, [sx, 0, -5.95], [0, -1, 0], "10", 0.22, "#1f4f8f"));
    return out.join("");
  }
  // the hook: a stud out of the bottom, a nut, then a steel J bent round to its point
  function hookSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.42, ZB - 0.3, 0.3, P, 6), { tone: "mid" }) + S(K.cylinder(0, 0, 0.18, ZB - 1.2, 0.9, P, 12), { tone: "mid", crease: "none" }))];
    const j = [[0, 0, ZB - 1.2], [0, 0, HOOK[2] + 0.45]];
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI * 1.15; j.push([0.45 + Math.cos(a) * 0.45, 0, HOOK[2] + 0.45 + Math.sin(a) * 0.45]); }
    out.push(bar(P, j, 0.1));
    return out.join("");
  }
  // the strain relief out of the side (a rubber sleeve along +x), the cable, and the plug at its end
  function cableSvg(P, E) {
    const B27 = window.B27, F = G.frameOf([HB, 0, OUT[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [];
    out.push(ISO.tinted(ISO.T.rubber, S(G.solidOf([[0, 0.38], [0.9, 0.22]], F, P, { steps: 18 }), { tone: "mid" })));
    const up = [0, 0, 1], plugTop = [E[0], E[1], E[2] + 2.2];
    const pts = B27.cable(OUT, [1, 0, 0], plugTop, up, 0.55, Math.min(OUT[2], E[2]) - 0.3);
    out.push(B27.cableSvg(P, pts, 0.32));
    // the plug: a black moulded body with grip rings, a steel ferrule and the pin end going down into the socket
    const Fp = LAB_Z(E);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.7, 0.38, Fp, P, { steps: 18 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0.7, 0.55], [1.9, 0.55], [2.2, 0.25]], Fp, P, { steps: 20 }), { tone: "mid", inner: K.lineSvg([1.1, 1.4].map((s) => G.arcOf(Fp, s, 0.55, P)).join(""), { tone: "faint" }) })));
    return out.join("");
  }
  const LAB_Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  ISO.add({
    name: "forcesensor", title: "Force sensor (part)", compare: null,
    about: "A school force sensor hanging from a stand arm by its eye, a hook underneath for a spring or a mass, its cable running to a data logger (to=) or loose (dx dy dz). anchors: hook plug",
    line: "forcesensor cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 lab=0 lit=sensor|hook|cable",
    demo: { line: "forcesensor 420 160 34 dx=7 dy=2 dz=-9", script: [{ set: {}, hold: 1 }, { set: { lit: "hook" }, hold: 1.4 }, { set: { lit: "cable" }, hold: 1.4 }, { set: { lit: "sensor" }, hold: 1.4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const E = B27.endOf(P, o, [7, 2, -9]);
      let lit = o.lit || "";
      // the cable is drawn first when it runs behind (−y), after the sensor when it comes toward the room
      const cab = `<g data-name="cable">${cableSvg(P, E)}</g>`, back = E[1] < -2;
      g.innerHTML = (back ? cab : "") + `<g data-name="sensor">${sensorSvg(P)}</g><g data-name="hook">${hookSvg(P)}</g>` + (back ? "" : cab) +
        (lab ? LAB.word(P, lab, [-HB - 0.5, 0, -3.5], "force sensor", "#556", { anchor: "end" }) : "");
      g.anchors = { hook: HOOK, plug: E };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B27.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "force sensor · ±10 N or ±50 N range · reads the pull on its hook (tare first)";
      B27.light(w, g, lit);
      return g;
    },
  });
})();
