// "battery cx cy width level=0-100 cut=0|1 lab=1 lit=cell|spring|tab|bulb|strip |text" — an AA cell in its holder.
// A 1.5 V alkaline cell lies in a black holder: a coil spring presses its flat − end, a brass tab touches the + nub,
// and two wires run from the holder's ends to a small torch bulb on the bench. Electrons leave the − end, light the
// bulb's filament and come back into +. The tester strip on the label shows the charge (green, amber, red) and the
// bulb dims as the voltage falls (1.55 V full to about 0.9 V flat; light goes roughly as V^3.4). cut=1 lifts the
// + half off to show the slice: steel can, black manganese dioxide (+ side), paper separator, grey zinc gel (− side)
// and the brass collector pin down the middle. set({ level, cut, lit }). World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 7.2, X0 = -25, X1 = 25, CUT = 4, ZC = 2 + R + 0.2, LIFT = 24, SHIFT = 6;
  const BENCH = { x: -48, y: -46, w: 96, d: 70, r: 4 }, BULB = [0, -30];
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const AXIS = xAx([0, 0, ZC]);
  const volts = (lv) => 0.9 + 0.65 * lv, glowOf = (lv) => Math.pow(volts(lv) / 1.55, 3.4);
  const stripCol = (lv) => (lv > 0.5 ? ["#5fae3a", "#2c6a22"] : lv > 0.2 ? ["#f4a531", "#a0600a"] : ["#e04b3a", "#7a1f1f"]);
  const LABEL = ISO.tint("#e6f1fd", ["#5b84b8", "#6c93c4", "#82a6d1", "#9ab8de"], "#1f3f6f");
  // a point on the can at axial x, angle a round the axis (a = 0 toward +y, π/2 straight up)
  const onCan = (x, a, r = R + 0.25) => [x, r * Math.cos(a), ZC + r * Math.sin(a)];
  const SA = 0.95, SW = 0.2;                                    // the tester strip faces up and toward the viewer

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BENCH, { h: 6, feet: 3, tint: ISO.T.wood })];
    // the holder: a floor, two side walls, two end plates (− with a spring, + with a brass tab)
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-31, 31], [-8.6, 8.6], [0, 2], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-31, 31], [-8.6, -7], [2, 9], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-31, -29], [-7, 8.6], [2, 18.5], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [29, 31], [-7, 8.6], [2, 18.5], "mid")));
    // the bulb's holder: a block, a brass screw socket and two terminal screws the wires end on
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [BULB[0] - 9, BULB[0] + 9], [BULB[1] - 6, BULB[1] + 6], [0, 5], "mid")));
    for (const dx of [-6, 6]) out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(BULB[0] + dx, BULB[1] + 2, 1.6, 5, 1, P, 14), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.brass, S(G.lathe([[0, 0], [0, 4.2], [5.6, 4.2], [6, 3.8], [6, 0]], zAx([BULB[0], BULB[1], 5]), P, { steps: 28 }), { tone: "mid", inner: L(G.ribsOf(zAx([BULB[0], BULB[1], 5]), 0.6, 5.4, 4.2, 9, P, { seams: true }) || "", { tone: "faint" }) })));
    return out.join("");
  }
  // the wires: from the end plates' outer faces down to the bench, round to the bulb's terminals
  function wiresSvg(P, k) {
    const run = (pts) => K.pathOf(pts.map((p) => K.iso(p, P)));
    const a = run([[-31, 0, 12], [-34, 0, 12], [-36, -2, 2], [-36, -26, 0.8], [BULB[0] - 6, BULB[1] + 2, 0.8], [BULB[0] - 6, BULB[1] + 2, 6]]);
    const b = run([[31, 0, 12], [34, 0, 12], [36, -2, 2], [36, -26, 0.8], [BULB[0] + 6, BULB[1] + 2, 0.8], [BULB[0] + 6, BULB[1] + 2, 6]]);
    const w = (d, c) => `<path d="${d}" fill="none" stroke="#111" stroke-width="${(1.4 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${(0.8 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return { svg: w(a, "#3a3e44") + w(b, "#c0392b"), a, b };
  }
  // the − end's coil spring (back half, then the cell, then the front half)
  const springOf = (P) => K.coil(-29, -25.2, [0, ZC], 3.4, 4.5, "x", P);
  function cellSvg(P, from, to, lv, t, lab) { return bodySvg(P, from, to, t, lab) + stripSvg(P, from, to, lv); }
  function bodySvg(P, from, to, t, lab) {
    const out = [], neg = from === X0, pos = to === X1;
    const m = [[from, 0], [from, neg ? R - 0.6 : R], ...(neg ? [[from + 0.6, R]] : []), ...(pos ? [[to - 0.6, R], [to, R - 0.6]] : [[to, R]]), [to, 0]];
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe(m, AXIS, P, { steps: 56 }), { tone: "hi" })));
    // the label sleeve over the middle of the can, ending short of both crimped ends
    const l0 = Math.max(from, X0 + 1.6), l1 = Math.min(to, X1 - 2.2);
    out.push(ISO.tinted(LABEL, S(G.lathe([[l0, R - 0.1], [l0, R + 0.2], [l1, R + 0.2], [l1, R - 0.1]], AXIS, P, { steps: 56 }), { tone: "hi" })));
    if (pos) out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[X1, 0], [X1, 2.6], [X1 + 1.5, 2.6], [X1 + 1.8, 2.2], [X1 + 1.8, 0]], AXIS, P, { steps: 28 }), { tone: "hi" })));
    if (lab && neg && to > -6) {
      const word = t || "AA 1.5 V";
      out.push(`<g transform="${ISO.faceMatrix(P, [-16, R + 0.2, ZC - 2.6], 1)}"><text font-size="3.4" font-weight="800" fill="#f2f6fb" font-family="Helvetica Neue,Arial">${word.slice(0, 14)}</text></g>`);
    }
    if (pos) out.push(`<g transform="${ISO.faceMatrix(P, [X1 - 6, R + 0.2, ZC - 1.2], 1)}"><text font-size="4" font-weight="800" fill="#f2f6fb" font-family="Helvetica Neue,Arial">+</text></g>`);
    return out.join("");
  }
  function stripSvg(P, from, to, lv) {
    const out = [];
    // the tester strip: a dark track the length of the label, filled to the level in its colour
    const s0 = Math.max(from, -18), s1 = Math.min(to, 14);
    if (s1 > s0) {
      const band = (x0, x1, r) => { const pts = []; for (let i = 0; i <= 8; i++) pts.push(onCan(x0 + ((x1 - x0) * i) / 8, SA - SW, r)); for (let i = 8; i >= 0; i--) pts.push(onCan(x0 + ((x1 - x0) * i) / 8, SA + SW, r)); return K.pathOf(pts.map((p) => K.iso(p, P)), true); };
      out.push(`<path data-name="strip" d="${band(s0, s1, R + 0.24)}" fill="#26323f" stroke="#0d1722" stroke-width=".5"/>`);
      const fx = -18 + 32 * lv, f1 = Math.min(s1, fx), [fc, fe] = stripCol(lv);
      if (f1 > s0 + 0.05) out.push(`<path d="${band(s0, f1, R + 0.3)}" fill="${fc}" stroke="${fe}" stroke-width=".4"/>`);
    }
    return out.join("");
  }
  // the slice through the cell at x = CUT, seen from the + side: rings from the can in to the pin
  function sliceSvg(P) {
    const F = AXIS, ring = (r, fill, edge) => `<path d="${G.circleOf(F, CUT + 0.03, r, P, 48)}" fill="${fill}" stroke="${edge}" stroke-width=".5"/>`;
    return `<g data-name="inside">${ring(R, "#b6b9be", "#3c3f45")}${ring(R - 0.45, "#2b2b2e", "#111")}${ring(R - 2.5, "#f3eee2", "#8a8370")}${ring(R - 2.9, "#9ea3a8", "#5d6268")}${ring(0.8, "#e2c986", "#6b5114")}</g>`;
  }
  // the glass is built once; the filament and its glow (drawn over the glass, as seen through it) as it changes
  const glassSvg = (P) => ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, 2.8], [2, 3.6, 1], [5, 5.6, 1], [8, 5.2, 1], [10.4, 2.6, 1], [11, 0]], zAx([BULB[0], BULB[1], 11]), P, { steps: 40 }), { tone: "mid" }));
  function bulbSvg(P, glow) {
    const F = zAx([BULB[0], BULB[1], 11]), k = K.cameraOf(P).k, out = [];
    // the filament: two support wires up from the bead to a short coil across the middle of the glass
    const c = (s, r, a) => K.iso(G.pointOf(F, s, r, a), P), sup = [[c(0.6, 0.9, 0), c(6, 2, 0)], [c(0.6, 0.9, Math.PI), c(6, 2, Math.PI)]];
    const coilPts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, x = -2 + 4 * u; coilPts.push(K.iso([BULB[0] + x, BULB[1] + 0.5 * Math.cos(u * 40), 17 + 0.5 * Math.sin(u * 40)], P)); }
    const hot = glow > 0.05 ? `rgb(${Math.round(120 + 135 * glow)},${Math.round(80 + 120 * glow)},40)` : "#6b6f75";
    if (glow > 0.03) { const p = K.iso([BULB[0], BULB[1], 17], P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(9 * k).toFixed(1)}" fill="#ffd36b" opacity="${(0.55 * glow).toFixed(2)}"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(4.5 * k).toFixed(1)}" fill="#fff3c4" opacity="${(0.8 * glow).toFixed(2)}"/>`); }
    out.push(`<path d="${sup.map((s) => K.pathOf(s)).join("")}" fill="none" stroke="#6b6f75" stroke-width=".5"/><path d="${K.pathOf(coilPts)}" fill="none" stroke="${hot}" stroke-width="${(0.5 + glow * 0.5).toFixed(2)}"/>`);
    return out.join("");
  }

  ISO.add({
    name: "battery", title: "AA battery in a circuit", compare: "battery 480 270 420 level=60",
    about: "An AA cell in its holder lighting a bulb: its charge strip and the bulb dim as the level falls; cut=1 lifts the + half to show the zinc and manganese dioxide inside.",
    line: "battery cx cy width level=0-100 cut=0|1 lab=1 lit=cell|spring|tab|bulb|strip |text",
    demo: { line: "battery 480 270 420 level=100", script: [{ set: {}, hold: 1.2 }, { set: { level: 25 }, hold: "settle" }, { set: { cut: 1 }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.82;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -9, 0), [0, 0, ZC + R + LIFT + 4], [X1 + SHIFT, 0, ZC + R + LIFT]], cx, cy, W, H, { azimuth: 52, elevation: 26 }, parent);
      const k = K.cameraOf(P).k, wires = wiresSvg(P, k), sp = springOf(P);
      g.innerHTML = `<g>${benchSvg(P)}</g>${wires.svg}<path data-part="flow" d="${wires.a}${wires.b}" fill="none" stroke="#ffe08a" stroke-width="${(0.5 * k).toFixed(2)}" stroke-dasharray="${(1 * k).toFixed(1)} ${(4 * k).toFixed(1)}" stroke-linecap="round"/>
        <g data-name="bulb">${glassSvg(P)}<g data-part="filament"></g></g><g data-name="spring">${L(sp.back, { tone: "mid", free: true })}</g><g data-name="cell"><g data-part="body"></g><g data-part="strip"></g></g>
        <g data-name="spring2">${L(sp.front, { tone: "hi", free: true })}</g>
        <g data-name="tab">${ISO.tinted(ISO.T.brass, ISO.wbox(P, [27.4, 29], [-3, 3], [ZC - 4, ZC + 4], "hi"))}</g>
        ${ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-31, 31], [7, 8.6], [2, 9], "mid"))}<g data-part="top"><g data-part="topin"></g></g><g data-part="words"></g>`;
      // the near side wall is drawn after the cell (it hides the cell's lower half); the lifted half after it
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { fil: q("filament"), cell: q("cell"), body: q("body"), strip: q("strip"), top: q("top"), topin: q("topin"), bulb: q("bulb"), words: q("words"), flow: q("flow") }, w = ISO.writer();
      const lv0 = ISO.clamp(ISO.num(o, "level", 75), 0, 100) / 100;
      const s = { lv: lv0, cut: o.cut === "1" ? 1 : 0, t: 0, off: 0 }, goal = { lv: lv0, cut: s.cut };
      let lit = o.lit || "";
      const draw = () => {
        const lq = Math.round(s.lv * 100) / 100, cq = Math.round(s.cut * 300) / 300, on = cq < 0.01;
        w.rebuild(el.body, String(cq > 0), () => (cq > 0 ? bodySvg(P, X0, CUT, t, lab) + sliceSvg(P) : bodySvg(P, X0, X1, t, lab)));
        w.rebuild(el.strip, `${lq} ${cq > 0}`, () => stripSvg(P, X0, cq > 0 ? CUT : X1, lq));
        w.rebuild(el.topin, cq > 0 ? String(lq) : "", () => (cq > 0 ? cellSvg(P, CUT, X1, lq, t, lab) : ""));
        w.attr(el.top, "transform", K.translateAlong(P, [SHIFT * ISO.ease(cq), 0, LIFT * ISO.ease(cq)]));
        const glow = on ? glowOf(lq) : 0;
        w.rebuild(el.fil, glow.toFixed(2), () => bulbSvg(P, glow));
        w.attr(el.flow, "stroke-dashoffset", on ? ((s.off * k) % (5 * k)).toFixed(1) : "0");
        w.shown(el.flow, on);
        w.rebuild(el.words, lab ? `${cq > 0.5} ${Math.round(lq * 100)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([X0 - 6, 8.6, 18], P), "− end, spring", "#444", { size: 13, anchor: "end" }),
          ISO.word(K.iso([31, 8.6, 20], P), "+ end", "#444", { size: 13, anchor: "start", dy: -4 }),
          ISO.word(K.iso([BULB[0], BULB[1], 30], P), on ? "bulb lit by the current" : "circuit open: bulb off", on ? "#b5541a" : "#555", { size: 13, dy: -4 }),
          ISO.word(K.iso([-12, -8.6, 18], P), `charge strip: ${Math.round(lq * 100)} %`, stripCol(lq)[1], { size: 13, dy: -8 }),
          ...(cq > 0.5 ? [ISO.word(K.iso([CUT, 8.6, 2], P), "inside: zinc gel (−) · manganese dioxide (+) · brass pin", "#444", { size: 12, anchor: "start", dy: 22 })] : [])].join(""));
        const parts = ["cell", "spring", "tab", "bulb", "strip"].map((n) => q(n)).filter(Boolean);
        w.light(parts, [q(lit === "strip" ? "cell" : lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.level !== undefined) goal.lv = ISO.clamp(+p.level, 0, 100) / 100;
        if (p.cut !== undefined) goal.cut = +p.cut ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.lv = ISO.follow(s.lv, goal.lv, dt, 0.6, calm); if (Math.abs(s.lv - goal.lv) < 0.003) s.lv = goal.lv;
        s.cut = ISO.follow(s.cut, goal.cut, dt, 0.3, calm); if (Math.abs(s.cut - goal.cut) < 0.003) s.cut = goal.cut;
        s.off -= calm ? 0 : dt * 6 * (0.3 + glowOf(s.lv));
        draw();
        return s.lv !== goal.lv || s.cut !== goal.cut;
      };
      g.readout = () => s.cut > 0.5
        ? "cell cut open · zinc gel gives up electrons at −, manganese dioxide takes them at +, the separator keeps them apart · no circuit, no current"
        : `charge ${Math.round(s.lv * 100)} % · about ${volts(s.lv).toFixed(2)} V · bulb at ${Math.round(glowOf(s.lv) * 100)} % of its full light (≈ V^3.4)`;
      draw();
      return g;
    },
  });
})();
