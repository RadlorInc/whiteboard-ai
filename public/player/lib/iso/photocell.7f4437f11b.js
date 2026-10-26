// "photocell cx cy k flow=0|1 lab=0 lit=bulb|cathode|anode|socket|stand" — a PART (PARTS.md, batch 5): the vacuum
// photocell of photoelectric.js, standing on the bench, origin the bench point under it. An evacuated glass bulb 4 cm
// across and 8 cm tall with its pinched stem, a curved potassium cathode (a half-cylinder whose hollow faces +x, where
// the light comes from on a bench) and a straight wire anode on its axis, in a black bakelite socket on a rod and a
// round base with two terminals: red + (anode) and black − (cathode), wired up the rod. The cathode's middle is 13.5 cm
// up (the library's beam height). flow=1: freed electrons cross from the cathode to the anode (set it when the light is
// green, blue or UV: potassium needs 2.3 eV, light below 540 nm); set({ flow }). World units: 1 = 1 cm.
// anchors: beam (the cathode's middle) plus minus
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BEAM = 13.5, ZS = 8, ZB = 9.6, ZTOP = 17.6, RC = 1.35, AX = 0.35, TERM = [[1.5, 1.6], [-1.3, 1.9]];
  const POTASSIUM = ISO.tint("#d8d4c4", ["#8e8a7c", "#a19d8f", "#b4b0a2", "#c6c2b4"], "#4a4638");
  const BAKELITE = ISO.tint("#3c3632", ["#1c1916", "#24201d", "#2c2824", "#34302b"], "#0c0a09");
  const Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const scaled = (P, cm) => Math.max(0.5, G.scaleOf(P) * cm).toFixed(2);

  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -3, y: -3, w: 6, d: 6, r: 3 }, 0, 0.8, P)}"/>`];
    out.push(`<g data-name="stand">${ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 2.9, 0, 0.15, P, 36), { tone: "lo" }))}` +
      ISO.tinted(ISO.T.paint, S(K.cylinder(0, 0, 2.8, 0.15, 0.65, P, 36, 0.15), { tone: "mid", inner: L(K.sideArc(0, 0, 2.8, 0.45, P, 36), { tone: "faint" }) })) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, 0.8, 0.5, P, 20, 0.06), { tone: "mid" }) + S(K.cylinder(0, 0, 0.42, 1.3, ZS - 1.3, P, 18), { tone: "hi", crease: "none" })) + `</g>`);
    // the leads from the socket down the rod to the terminals (red to +, black to −)
    TERM.forEach(([x, y], i) => {
      const s = [i ? -0.42 : 0.42, 0.1, ZS], pts = [s, [s[0] * 1.02, 0.25, ZS - 2.2], [x * 0.5, y * 0.4, 1.6], [x, y, 1.5]].map((p) => K.iso(p, P));
      out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#1d1f22" stroke-width="${scaled(P, 0.14)}" stroke-linecap="round"/><path d="${K.pathOf(pts)}" fill="none" stroke="${i ? "#3a3d42" : "#c0392b"}" stroke-width="${scaled(P, 0.09)}" stroke-linecap="round"/>`);
    });
    // the two terminals: a brass stud, a coloured insulating sleeve, a knurled nut on top
    TERM.forEach(([x, y], i) => out.push(`<g data-name="stand">${ISO.tinted(i ? BAKELITE : ISO.T.red, S(K.cylinder(x, y, 0.38, 0.8, 0.55, P, 18, 0.05), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 0.14, 1.35, 0.4, P, 10), { tone: "hi", crease: "none" }) + S(K.cylinder(x, y, 0.3, 1.75, 0.3, P, 16, 0.04), { tone: "mid", inner: L(K.knurl(x, y, 0.3, 1.75, 2.05, 14, P, 0.04), { tone: "lo" }) })) + `</g>`));
    // the socket: a black cup on the rod with a collar and a bayonet slot, the bulb's cap in it
    out.push(`<g data-name="socket">${ISO.tinted(BAKELITE, S(G.lathe([[0, 0.45], [0.15, 0.8, 1], [0.4, 1.35, 1], [1.3, 1.4], [1.6, 1.25]], Z([0, 0, ZS]), P, { steps: 32 }), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 1.1, ZS + 1.6, ZB - ZS - 1.6 + 0.05, P, 28, 0.05), { tone: "hi" })) +
      `<path d="${K.pathOf([[0.9, 0.85, ZS + 0.6], [0.9, 0.85, ZS + 1.25], [0.55, 1.15, ZS + 1.25]].map((p) => K.iso(p, P)))}" fill="none" stroke="#0c0a09" stroke-width="${scaled(P, 0.08)}" stroke-linecap="round"/></g>`);
    return out.join("");
  }
  // inside the glass: the pinch, the cathode on its support wire, the anode wire
  function electrodesSvg(P) {
    const out = [`<g data-name="bulb" style="${ISO.T.glass}">${S(G.lathe([[0, 0.55], [0.6, 0.45, 1], [1.2, 0.3]], Z([0, 0, ZB]), P, { steps: 20 }), { tone: "hi" })}</g>`];
    // cathode: a half-cylinder shell (hollow toward +x), potassium on its inside face
    const arc = (r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [AX + Math.cos(a) * r, Math.sin(a) * r]; });
    const plan = [...arc(RC + 0.08, Math.PI * 0.55, Math.PI * 1.45), ...arc(RC, Math.PI * 1.45, Math.PI * 0.55)];
    out.push(`<g data-name="cathode">${ISO.tinted(ISO.T.steel, S(K.cylinder(AX - RC - 0.04, 0, 0.05, ZB + 1, BEAM - 2.2 - ZB - 1, P, 8), { tone: "mid", crease: "none" }))}` +
      ISO.tinted(POTASSIUM, S(K.extrude(plan, BEAM - 2.2, 4.4, P, { convex: false }), { tone: "mid" })) + `</g>`);
    out.push(`<g data-name="anode">${ISO.tinted(ISO.T.steel, S(K.cylinder(AX, 0, 0.05, ZB + 1, BEAM + 2.6 - ZB - 1, P, 8), { tone: "hi", crease: "none" }) + S(G.sphereOf([AX, 0, BEAM + 2.6], 0.09, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }
  // freed electrons: dots leaving the cathode's inside face for the anode wire, f = 0..1 along each path
  function electronsSvg(P, t) {
    const out = [];
    for (let i = 0; i < 9; i++) {
      const f = (t * 1.3 + i / 9) % 1, a = Math.PI * (0.75 + (i % 3) * 0.25), z = BEAM - 1.4 + ((i * 7) % 9) * 0.35;
      const s = [AX + Math.cos(a) * (RC - 0.1), Math.sin(a) * (RC - 0.1), z], q = K.iso([s[0] + (AX - s[0]) * f, s[1] * (1 - f), z + 0.15 * Math.sin(f * 3)], P);
      out.push(`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${scaled(P, 0.07)}" fill="#1f4f8f" opacity="${(0.4 + 0.6 * Math.sin(Math.PI * f)).toFixed(2)}"/>`);
    }
    return out.join("");
  }
  // the glass bulb, in front of everything inside it, with a highlight and the getter's silvering at the top
  const glassSvg = (P) => `<g data-name="bulb"><g style="${ISO.T.glass}" opacity=".45">${S(G.lathe([[0, 0.55], [0.3, 0.75, 1], [1.3, 1.6, 1], [3.6, 2, 1], [6.2, 1.85, 1], [7.5, 1.1, 1], [8, 0]], Z([0, 0, ZB]), P, { steps: 40 }), { tone: "hi" })}</g>` +
    `<path d="${G.arcOf(Z([0, 0, ZB + 4.4]), 0, 1.9, P, { from: 2.1, to: 2.9 })}" fill="none" stroke="#ffffff" stroke-width="${scaled(P, 0.16)}" stroke-linecap="round" opacity=".8"/>` +
    `<path d="${G.arcOf(Z([0, 0, ZB + 7.2]), 0, 1.2, P, { from: 3.6, to: 5.6 })}" fill="none" stroke="#9aa0a8" stroke-width="${scaled(P, 0.3)}" stroke-linecap="round" opacity=".45"/></g>`;

  ISO.add({
    name: "photocell", title: "Vacuum photocell (part)", compare: null,
    about: "A vacuum photocell: a 4 × 8 cm glass bulb with a curved potassium cathode facing +x and a wire anode, in a black socket on a stand with + and − terminals, cathode 13.5 cm up; flow=1 shows electrons freed by the light crossing to the anode. anchors: beam plus minus",
    line: "photocell cx cy k flow=0|1 lab=0 lit=bulb|cathode|anode|socket|stand",
    demo: { line: "photocell 480 470 24", script: [{ set: {}, hold: 1 }, { set: { flow: 1 }, hold: 2.2 }, { set: { lit: "cathode" }, hold: 1.4 }, { set: { lit: "anode" }, hold: 1.4 }, { set: { flow: 0, lit: "socket" }, hold: 1.4 }, { set: { lit: "stand" }, hold: 1.2 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "", flow = o.flow === "1", clock = 0;
      g.innerHTML = standSvg(P) + electrodesSvg(P) + `<g data-name="cathode" data-part="electrons"></g>` + glassSvg(P) +
        (lab ? window.LAB.word(P, lab, [0, 0, ZTOP + 1.2], "photocell", "#556") + window.LAB.word(P, lab, [TERM[0][0], TERM[0][1], 0], "+", "#c0392b", { dy: 16 }) + window.LAB.word(P, lab, [TERM[1][0], TERM[1][1], 0], "−", "#333", { dy: 16 }) : "");
      const el = window.LAB.parts(g);
      g.anchors = { beam: [AX - RC, 0, BEAM], plus: [TERM[0][0], TERM[0][1], 2.05], minus: [TERM[1][0], TERM[1][1], 2.05] };
      const draw = () => w.rebuild(el.electrons, flow && !ISO.still() ? (Math.round(clock * 30) / 30).toFixed(2) : flow ? "still" : "", () => (flow ? electronsSvg(P, ISO.still() ? 0.3 : clock) : ""));
      g.set = (p) => {
        if (p.flow !== undefined) flow = String(p.flow) === "1";
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
        draw();
      };
      g.update = (dt) => { if (!ISO.still()) clock += dt; draw(); return flow && !ISO.still(); };
      g.readout = () => (flow ? "light frees electrons from the potassium cathode · they cross the vacuum to the anode · a current flows" : "vacuum photocell · potassium cathode needs 2.3 eV per electron (light below 540 nm)");
      draw(); B20.light(w, g, lit);
      return g;
    },
  });
})();
