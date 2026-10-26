// "powerpack cx cy k on=0|1 v=0..12 lab=0 lit=case|display|knob|terminals" — a PART (PARTS.md, batch 5): a small
// school DC power pack 7 × 5.6 × 4.7 cm standing on the bench, origin the bench point under its middle. A grey moulded
// case on four rubber feet, vent slots in its right side, and on its top a green LCD that reads the output voltage, a
// knurled voltage knob with a printed 0–12 V scale and a white pointer line, a power lamp, and the red + and black −
// terminal posts along the front edge (anchors plus and minus: the caps' tops, where a lead clips on). on=0 the LCD is
// blank and the lamp dark; set({ on, v }) switches it or sets the voltage (the knob turns to it). Built in mm from
// the electrolysis scene's power pack; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const W = 70, D = 56, H = 47, X = -W / 2, Y = -D / 2, KX = X + 54, KY = Y + 20, KR = 7, VMAX = 12;
  const PLAN = { x: X, y: Y, w: W, d: D, r: 3 };
  const GREY = ISO.tint("#d9dce0", ["#8e939a", "#a0a5ab", "#b3b7bc", "#c6c9cd"], "#3f444b");
  // the knob's pointer angle for a voltage: 0 V at the lower left, 12 V at the lower right (a 270° sweep)
  const ang = (v) => Math.PI * 1.25 - (ISO.clamp(v, 0, VMAX) / VMAX) * Math.PI * 1.5;
  const top = (x, y) => [x, y, H + 0.05];

  function caseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(PLAN, 0, H, P)}"/>`];
    out.push(ISO.tinted(ISO.T.rubber, [[X + 6, Y + 6], [X + W - 6, Y + 6], [X + 6, Y + D - 6], [X + W - 6, Y + D - 6]].map(([x, y]) => S(K.cylinder(x, y, 3.5, 0, 2, P, 14), { tone: "lo" })).join("")));
    out.push(`<g data-name="case">${ISO.tinted(GREY, S(K.slabOf(PLAN, 2, H - 2, P, 4, 1.2), { tone: "mid", inner: L(K.sideSeam(PLAN, 14, P, 4), { tone: "faint" }) }))}`);
    // vent slots in the right side (+x), each a short dark groove between the seam and the top
    out.push(`<path d="${[0, 1, 2, 3, 4, 5].map((i) => K.pathOf([[X + W + 0.05, Y + 12 + i * 6, 22], [X + W + 0.05, Y + 12 + i * 6, 38]].map((p) => K.iso(p, P)))).join("")}" stroke="#3f444b" stroke-width="${Math.max(0.8, G.scaleOf(P) * 1.6).toFixed(2)}" stroke-linecap="round"/>`);
    // the top: an inset panel line and the printed name
    out.push(L(K.planOutline(K.insetPlan(PLAN, 3), H, P, 4), { tone: "faint" }));
    out.push(LAB.faceText(P, top(X + 56, Y + D - 8), [1, 0, 0], "DC POWER", 2.8, "#4a4f56", [0, -1, 0]), "</g>");
    return out.join("");
  }
  function knobSvg(P, v) {
    const out = [];
    // the printed scale round the knob: a tick every volt, longer and numbered every 3
    const ticks = [], big = [];
    for (let i = 0; i <= VMAX; i++) {
      const a = ang(i), r0 = KR + 1.6, r1 = KR + (i % 3 ? 3 : 4.4);
      (i % 3 ? ticks : big).push(K.pathOf([top(KX + Math.cos(a) * r0, KY - Math.sin(a) * r0), top(KX + Math.cos(a) * r1, KY - Math.sin(a) * r1)].map((p) => K.iso(p, P))));
    }
    out.push(L(ticks.join(""), { tone: "lo", free: true }), L(big.join(""), { tone: "mid", free: true }));
    for (const i of [0, 6, 12]) { const a = ang(i), r = KR + 7.4; out.push(LAB.faceText(P, top(KX + Math.cos(a) * r, KY - Math.sin(a) * r), [1, 0, 0], String(i), 2.6, "#4a4f56", [0, -1, 0])); }
    // the knob: a skirt, the knurled grip, a white line pointing at the setting
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(KX, KY, KR + 0.8, H, 1.2, P, 28, 0.3), { tone: "mid" }) + S(K.cylinder(KX, KY, KR, H + 1.2, 6, P, 28), { tone: "hi", inner: L(K.knurl(KX, KY, KR, H + 1.2, H + 7.2, 24, P, 0.01), { tone: "lo" }) })));
    const a = ang(v);
    out.push(`<path d="${K.pathOf([[KX + Math.cos(a) * 1.5, KY - Math.sin(a) * 1.5, H + 7.25], [KX + Math.cos(a) * (KR - 1), KY - Math.sin(a) * (KR - 1), H + 7.25]].map((p) => K.iso(p, P)))}" stroke="#ffffff" stroke-width="${Math.max(0.8, G.scaleOf(P) * 1.1).toFixed(2)}" stroke-linecap="round"/>`);
    return out.join("");
  }
  function displaySvg(P, on, v) {
    const quad = (x0, y0, x1, y1, z) => K.pathOf([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]].map((p) => K.iso(p, P)), true);
    const out = [`<path d="${quad(X + 7, Y + 9, X + 41, Y + 27, H + 0.04)}" fill="#55595f" stroke="#2a2d31" stroke-width="0.6"/>`];
    out.push(`<path d="${quad(X + 9, Y + 11, X + 39, Y + 25, H + 0.08)}" fill="${on ? "#2e3a2e" : "#3a3f3a"}" stroke="#1d2329" stroke-width="0.5"/>`);
    if (on) out.push(LAB.faceText(P, top(X + 24, Y + 18), [1, 0, 0], `${v.toFixed(1)} V`, 7, "#9ff08a", [0, -1, 0]));
    // the power lamp beside it
    out.push(`<path d="${G.circleOf(LAB.Z([X + 48, Y + 9, H]), 0.1, 1.8, P)}" fill="${on ? "#ff5a3c" : "#7a3a30"}" stroke="#3a1a14" stroke-width="0.5"/>`);
    return out.join("");
  }

  ISO.add({
    name: "powerpack", title: "DC power pack (part)", compare: null,
    about: "A small school DC power pack 7 × 5.6 × 4.7 cm: grey case, green LCD showing the volts, a knurled voltage knob with a 0–12 V scale, a power lamp and red + and black − terminals on the front edge; on=0 it is off. anchors: plus minus",
    line: "powerpack cx cy k on=0|1 v=0..12 lab=0 lit=case|display|knob|terminals",
    demo: { line: "powerpack 480 330 50 on=0 v=6", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "display" }, hold: 1.2 }, { set: { v: 9, lit: "knob" }, hold: 1.2 }, { set: { v: 6, lit: "terminals" }, hold: 1.2 }, { set: { on: 0, lit: "case" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { on: o.on === "0" ? 0 : 1, v: ISO.clamp(ISO.num(o, "v", 6), 0, VMAX), lit: o.lit || "" };
      const plus = CIRC.post(Pm, [X + 16, Y + D - 9, H], { r: 3.6, h: 8, cap: ISO.T.red }), minus = CIRC.post(Pm, [X + 34, Y + D - 9, H], { r: 3.6, h: 8, cap: ISO.T.plastic });
      const signs = LAB.faceText(Pm, top(X + 16, Y + D - 2.5), [1, 0, 0], "+", 4, "#b8202a", [0, -1, 0]) + LAB.faceText(Pm, top(X + 34, Y + D - 2.5), [1, 0, 0], "−", 4, "#26282c", [0, -1, 0]);
      g.innerHTML = `${caseSvg(Pm)}<g data-name="display" data-part="display"></g><g data-name="knob" data-part="knob"></g><g data-name="terminals">${signs}${plus.svg}${minus.svg}</g><g data-part="words"></g>`;
      g.anchors = { plus: plus.top.map((v) => v / 10), minus: minus.top.map((v) => v / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const v = Math.round(st.v * 10) / 10;
        w.rebuild(el.display, `${st.on} ${v}`, () => displaySvg(Pm, st.on, v));
        w.rebuild(el.knob, String(v), () => knobSvg(Pm, v));
        w.rebuild(el.words, lab ? `${st.on} ${v}` : "", () => (lab ? CIRC.word(P, [W / 20, 0, H / 10], st.on ? `power pack, ${v.toFixed(1)} V DC` : "power pack (off)") : ""));
        B13.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = String(p.on) === "1" ? 1 : 0;
        if (p.v !== undefined && p.v !== "" && Number.isFinite(+p.v)) st.v = ISO.clamp(+p.v, 0, VMAX);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => (st.on ? `DC power pack on · ${st.v.toFixed(1)} V between + (red) and − (black)` : "DC power pack off · no voltage at the terminals");
      draw();
      return g;
    },
  });
})();
