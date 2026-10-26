// "wirefield cx cy size k=wire|solenoid I=5 lab=1 lit=wire|coil|compasses|supply" — plotting compasses round a current.
// wire: a thick copper wire goes straight up through a hole in a white card, carrying a current from a power supply.
// Plotting compasses stand on the card in two rings. Each needle points along the field where it is: the Earth's
// (about 18 µT, toward north on the card) plus the wire's, B = μ₀I/(2πr), in circles round it (right-hand grip: thumb
// along the current, fingers round with the field). With no current every needle points north; at 5 A the inner ring
// (2.5 cm out, 40 µT) swings nearly round the circle; reverse the current and they all turn the other way.
// solenoid: a coil wound through the card (20 turns over 8 cm). Inside, B = μ₀nI along the axis; outside it spreads
// from the N end round to the S end like a bar magnet's. set({ I }) changes the current (negative reverses it).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const MU = 4e-7 * Math.PI, BE = 18e-6, ZC = 56, CARD = { x: -92, y: -82, w: 184, d: 164, r: 3 }, BOARD = { x: -112, y: -100, w: 290, d: 200, r: 7 };
  const NORTH = [0, -1], SOL = { a: 40, R: 15, turns: 20 }, CR = 7.6;
  const COMP = {
    wire: [...[0, 1, 2, 3, 4, 5].map((k) => [25 * Math.cos((k * Math.PI) / 3 + 0.3), 25 * Math.sin((k * Math.PI) / 3 + 0.3)]), ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => [55 * Math.cos((k * Math.PI) / 4 + 0.2), 55 * Math.sin((k * Math.PI) / 4 + 0.2)])],
    solenoid: [[0, 0], [-60, 0], [60, 0], [-80, 0], [80, 0], [0, 38], [0, -38], [-50, 34], [50, 34], [-50, -34], [50, -34], [-78, 50], [78, 50], [0, 66], [-30, 60], [30, 60]],
  };
  // The field on the card at (x, y) in mm, in tesla: [Bx, By].
  function field(k, I, x, y) {
    let b = [BE * NORTH[0], BE * NORTH[1]];
    if (k === "wire") { const r = Math.max(Math.hypot(x, y), 4) / 1000, B = (MU * I) / (2 * Math.PI * r), u = [-y / Math.hypot(x, y), x / Math.hypot(x, y)]; b = [b[0] + B * u[0], b[1] + B * u[1]]; }
    else {
      const n = SOL.turns / (2 * SOL.a / 1000), Bin = MU * n * I;
      if (Math.abs(x) < SOL.a && Math.abs(y) < SOL.R) b = [b[0] + Bin, b[1]];
      else {
        // outside: the coil's ends as two poles of strength Bin·A/(4π) (A = πR²), N at +x for a positive current
        const A = Math.PI * (SOL.R / 1000) ** 2;
        for (const [px, sg] of [[SOL.a, 1], [-SOL.a, -1]]) { const dx = (x - px) / 1000, dy = y / 1000, d = Math.max(Math.hypot(dx, dy), 0.006); b = [b[0] + (sg * Bin * A * dx) / (4 * Math.PI * d ** 3), b[1] + (sg * Bin * A * dy) / (4 * Math.PI * d ** 3)]; }
      }
    }
    return b;
  }

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 120, y: 74, w: 44, d: 12, r: 1.2 })];
    // four posts hold the card up
    for (const [x, y] of K.corners(CARD, 8)) out.push(S(K.cylinder(x, y, 4, 0, 2, P, 20), { tone: "mid" }), S(K.cylinder(x, y, 2.2, 2, ZC - 2, P, 16), { tone: "mid", crease: "none" }));
    return out.join("");
  }
  function cardSvg(P, k) {
    const out = [S(K.slabOf(CARD, ZC, 1.4, P, 3), { tone: "hi" })];
    // a printed north arrow in the corner
    const a = (x, y) => K.iso([x, y, ZC + 1.4], P);
    out.push(`<path d="${K.pathOf([a(78, -40), a(78, -70)])}M${a(74, -62)}L${a(78, -70)}L${a(82, -62)}" fill="none" stroke="#556" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" data-free=""/>`);
    out.push(ISO.word(a(78, -74), "north", "#556", { size: 10, dy: -2, halo: false }));
    if (k === "wire") out.push(L(K.ring(0, 0, 3.4, ZC + 1.4, P, 16), { tone: "lo" }));
    else for (let i = 0; i <= SOL.turns; i++) { const x = -SOL.a + (2 * SOL.a * i) / SOL.turns; out.push(D([a(x, -SOL.R), a(x, SOL.R)], { size: 0.6, tone: "lo" })); }
    return out.join("");
  }
  // One plotting compass: a brass cup, a white dial with a north tick, a glass rim. The needle is drawn separately.
  const compassSvg = (P, [x, y]) => ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, CR, ZC + 1.4, 3, P, 24), { tone: "mid" })) + S(K.cylinder(x, y, CR - 1, ZC + 4.4, 0.3, P, 24), { tone: "hi" }) + L(K.ring(x, y, CR - 1.6, ZC + 4.7, P, 20), { tone: "faint" });
  const needleSvg = (P, [x, y], ang) => {
    const z = ZC + 5.2, c = Math.cos(ang), s = Math.sin(ang), l = CR - 1.6, wd = 1.1;
    const p = (u, v) => K.iso([x + c * u - s * v, y + s * u + c * v, z], P);
    return `<path d="${K.pathOf([p(l, 0), p(0, wd), p(0, -wd)], true)}" fill="#d0392b" stroke="#7a1f1f" stroke-width="0.5" stroke-linejoin="round"/><path d="${K.pathOf([p(-l, 0), p(0, wd), p(0, -wd)], true)}" fill="#e8e8e8" stroke="#555" stroke-width="0.5" stroke-linejoin="round"/>` + `<circle cx="${p(0, 0)[0].toFixed(1)}" cy="${p(0, 0)[1].toFixed(1)}" r="0.9" fill="#555"/>`;
  };
  // The power supply on the bench, with its ammeter window, and the leads to the wire or the coil.
  const PS = { x0: 108, x1: 166, y0: -84, y1: -40, z1: 40 };
  function supplySvg(P, k) {
    const out = [ISO.wbox(P, [PS.x0, PS.x1], [PS.y0, PS.y1], [0, PS.z1], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [PS.x0 + 6, PS.x1 - 20], [PS.y1, PS.y1 + 0.6], [20, PS.z1 - 5], "hi"))];
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, 4, 2.6, G.frameOf([PS.x0 + 12, PS.y1, 10], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })), ISO.tinted(ISO.T.plastic, S(G.disc(0, 4, 2.6, G.frameOf([PS.x0 + 26, PS.y1, 10], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 3, 4.4, G.frameOf([PS.x1 - 10, PS.y1, 26], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    const lead = (pts, c) => `<path d="${K.pathOf(LAB.bend(pts, 6).map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (k === "wire") out.push(lead([[PS.x0 + 12, PS.y1 + 4, 10], [PS.x0 + 4, -20, 6], [40, 0, 2], [8, 0, 2], [0, 0, 10]], "#c0392b"), lead([[PS.x0 + 26, PS.y1 + 4, 10], [PS.x0 + 30, -10, 60], [60, -6, 150], [0, 0, 150]], "#2a2b2f"));
    else out.push(lead([[PS.x0 + 12, PS.y1 + 4, 10], [PS.x0 + 4, -20, 30], [SOL.a + 20, -SOL.R, ZC + 20], [SOL.a, -SOL.R, ZC + 1.4]], "#c0392b"), lead([[PS.x0 + 26, PS.y1 + 4, 10], [PS.x0 + 20, -30, 60], [-SOL.a - 20, -SOL.R - 30, ZC + 40], [-SOL.a, -SOL.R, ZC + 1.4]], "#2a2b2f"));
    return out.join("");
  }
  // The wire: a copper rod through the card, a terminal post at its foot; the coil: copper arcs over the card.
  // drawn in two pieces, under the card and over it (the card hides the wire where it passes through)
  function wireSvg(P, upper) {
    if (!upper) return S(K.cylinder(0, 0, 6, 0, 8, P, 24, 0.4), { tone: "mid" }) + ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, 2.2, 8, ZC - 8, P, 18), { tone: "mid", crease: "none" }));
    return ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, 2.2, ZC + 1.4, 150 - ZC - 1.4, P, 18), { tone: "mid", crease: "none", inner: L(K.sideArc(0, 0, 2.2, 149.9, P, 12), { tone: "lo" }) }));
  }
  function coilSvg(P) {
    const out = [], arcs = [];
    for (let i = 0; i < SOL.turns; i++) {
      const x0 = -SOL.a + (2 * SOL.a * i) / SOL.turns, x1 = -SOL.a + (2 * SOL.a * (i + 1)) / SOL.turns, pts = [];
      for (let k = 0; k <= 16; k++) { const th = (k / 16) * Math.PI; pts.push([x0 + (x1 - x0) * (k / 16), -SOL.R * Math.cos(th), ZC + 1.4 + SOL.R * Math.sin(th)]); }
      arcs.push({ k: K.depthOf([x0, 0, ZC], P), d: K.pathOf(pts.map((p) => K.iso(p, P))) });
    }
    arcs.sort((a, b) => a.k - b.k);
    const w = K.screenRise(1, P) * 2.4;
    for (const a of arcs) out.push(`<path d="${a.d}" fill="none" stroke="#6e3a1c" stroke-width="${(w + 1).toFixed(2)}" stroke-linecap="round"/><path d="${a.d}" fill="none" stroke="#e2a985" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`);
    return out.join("");
  }
  const arrow = (P, a, b, color) => { const A = K.iso(a, P), B = K.iso(b, P), an = Math.atan2(B[1] - A[1], B[0] - A[0]); return `<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}M${(B[0] - 6 * Math.cos(an - 0.5)).toFixed(1)} ${(B[1] - 6 * Math.sin(an - 0.5)).toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}L${(B[0] - 6 * Math.cos(an + 0.5)).toFixed(1)} ${(B[1] - 6 * Math.sin(an + 0.5)).toFixed(1)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`; };

  ISO.add({
    name: "wirefield", title: "Magnetic field of a current", compare: "wirefield 480 280 300 k=solenoid",
    about: "Plotting compasses on a card round a current-carrying wire (field in circles, B = μ₀I/2πr) or a solenoid (like a bar magnet, B = μ₀nI inside).",
    line: "wirefield cx cy size k=wire|solenoid I=5 lab=1 lit=wire|coil|compasses|supply",
    demo: { line: "wirefield 480 280 300 k=wire I=0", script: [{ set: { I: 0 }, hold: 1 }, { set: { I: 5, lit: "compasses" }, hold: "settle" }, { set: { I: -5, lit: "" }, hold: "settle" }, { set: { k: "solenoid", I: 3 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.8, H = size * 1.4;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, 152]], cx, cy, W, H, { azimuth: 60, elevation: 34 }, parent);
      const s = { k: o.k === "solenoid" ? "solenoid" : "wire", I: ISO.clamp(ISO.num(o, "I", 5), -6, 6) }; s.IT = s.I;
      let lit = o.lit || "", built = "", ang = [];
      const el = {}, w = ISO.writer();
      const target = () => COMP[s.k].map(([x, y]) => { const b = field(s.k, s.I, x, y); return Math.atan2(b[1], b[0]); });
      const build = () => {
        g.innerHTML = `<g>${benchSvg(P)}</g><g data-name="supply">${supplySvg(P, s.k)}<g data-part="meter"></g></g>${s.k === "wire" ? `<g data-name="wire">${wireSvg(P, false)}</g>` : ""}<g>${cardSvg(P, s.k)}</g><g data-part="filings"></g>` +
          `<g data-name="compasses">${COMP[s.k].map((c) => compassSvg(P, c)).join("")}<g data-part="needles"></g></g>${s.k === "wire" ? `<g data-name="wire">${wireSvg(P, true)}</g>` : `<g data-name="coil">${coilSvg(P)}</g>`}<g data-part="current"></g><g data-part="words"></g>`;
        Object.assign(el, LAB.parts(g));
        ang = target();
      };
      const draw = (dt = 0) => {
        if (built !== s.k) { built = s.k; build(); }
        const want = target(), calm = ISO.still();
        ang = ang.map((a, i) => { let d = want[i] - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d) < 0.002 || calm ? want[i] : a + d * (1 - Math.exp(-dt / 0.25)); });
        const key = ang.map((a) => a.toFixed(3)).join();
        w.rebuild(el.needles, key, () => COMP[s.k].map((c, i) => needleSvg(P, c, ang[i])).join(""));
        // iron-filing rings: faint dotted circles that come up with the current (wire only)
        w.rebuild(el.filings, s.k === "wire" ? (Math.abs(s.I) > 0.5 ? "on" : "") : "", () => s.k === "wire" && Math.abs(s.I) > 0.5 ? [14, 38, 70].map((r) => `<path d="${K.pathOf(Array.from({ length: 73 }, (_, k) => K.iso([r * Math.cos((k / 72) * 2 * Math.PI), r * Math.sin((k / 72) * 2 * Math.PI), ZC + 1.45], P)))}" fill="none" stroke="#8a8f96" stroke-width="0.8" stroke-dasharray="0.6 2.2" stroke-linecap="round"/>`).join("") : "");
        const Iq = s.I.toFixed(1);
        w.rebuild(el.meter, Iq, () => LAB.faceText(P, [(PS.x0 + PS.x1 - 14) / 2, PS.y1 + 0.7, 26], [1, 0, 0], `${Math.abs(s.I).toFixed(1)} A`, 6, "#7fe08a"));
        w.rebuild(el.current, `${s.k}${Math.sign(Math.round(s.I * 10))}`, () => {
          const sg = Math.sign(Math.round(s.I * 10));
          if (!sg) return "";
          if (s.k === "wire") return arrow(P, [6, 0, sg > 0 ? 100 : 130], [6, 0, sg > 0 ? 130 : 100], "#c0392b");
          return arrow(P, [0, sg * 8, ZC + 1.4 + SOL.R + 3], [0, -sg * 8, ZC + 1.4 + SOL.R + 3], "#c0392b");
        });
        w.rebuild(el.words, lab ? `${s.k}${Math.sign(Math.round(s.I * 10))}` : "", () => {
          if (!lab) return "";
          const sg = Math.sign(Math.round(s.I * 10)), out = [ISO.word(K.iso([PS.x0 + 30, PS.y0, PS.z1], P), "power supply", "#555", { size: 13, dy: -6 }), ISO.word(K.iso([-60, 70, ZC + 6], P), "plotting compasses", "#555", { size: 13 })];
          if (s.k === "wire") out.push(ISO.word(K.iso([10, 0, 120], P), sg ? (sg > 0 ? "current up" : "current down") : "no current", "#c0392b", { size: 14, anchor: "start" }));
          else if (sg) out.push(ISO.word(K.iso([sg * (SOL.a + 14), 0, ZC + 22], P), "N", "#c0392b", { size: 22 }), ISO.word(K.iso([-sg * (SOL.a + 14), 0, ZC + 22], P), "S", "#2b6cc4", { size: 22 }), ISO.word(K.iso([0, 0, ZC + SOL.R + 10], P), "current", "#c0392b", { size: 13, dy: -8 }));
          return out.join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k && (p.k === "solenoid") !== (s.k === "solenoid")) s.k = p.k === "solenoid" ? "solenoid" : "wire";
        if (p.I !== undefined) s.IT = ISO.clamp(+p.I, -6, 6);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.I = ISO.follow(s.I, s.IT, dt, 0.3, ISO.still());
        draw(dt);
        const want = target();
        return s.I !== s.IT || ang.some((a, i) => Math.abs(Math.atan2(Math.sin(want[i] - a), Math.cos(want[i] - a))) > 0.002);
      };
      g.readout = () => {
        if (s.k === "wire") {
          const B = (MU * Math.abs(s.I)) / (2 * Math.PI * 0.025);
          return Math.abs(s.I) < 0.05 ? "no current: every compass points north (the Earth's field, about 18 µT)" : `I = ${Math.abs(s.I).toFixed(1)} A ${s.I > 0 ? "up" : "down"} the wire · B = μ₀I/(2πr) = ${(B * 1e6).toFixed(0)} µT at 2.5 cm, ${((B * 25) / 55 * 1e6).toFixed(0)} µT at 5.5 cm, in circles ${s.I > 0 ? "anticlockwise" : "clockwise"} seen from above · plus the Earth's 18 µT`;
        }
        const n = SOL.turns / (2 * SOL.a / 1000);
        return `solenoid · ${SOL.turns} turns over ${(2 * SOL.a / 10).toFixed(0)} cm, n = ${n.toFixed(0)} /m · I = ${Math.abs(s.I).toFixed(1)} A · inside B = μ₀nI = ${(MU * n * Math.abs(s.I) * 1000).toFixed(2)} mT along the axis · outside like a bar magnet, N at the ${s.I >= 0 ? "right" : "left"} end`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
