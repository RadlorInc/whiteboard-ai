// "carwheel cx cy k nuts=0..5 lab=0 lit=tyre|rim|nuts|hub" — a PART (PARTS.md): a car wheel standing upright, its
// face toward +y (the camera), its origin the hub centre (the axle's point). A 205/55 R16 tyre, 63 cm across: tread
// ribs over the crown and two grooves round it, the size moulded into the sidewall, a rim-guard ring; a 16 in pressed
// steel rim: flange, centre disc with eight vent holes and a pressed ring, a raised boss where the nuts seat, the
// valve stem with its cap; the hub's centre cap; five M12 studs on a 114.3 mm circle and a 19 mm wheel nut (conical
// seat, hex) on each. nuts = how many are on, from nut 1 (top) clockwise as you face the wheel; set({ nuts }) takes
// them off or puts them on, each sliding along its stud. Anchors: hub (the centre cap's face), nut1…nut5 (the outer
// face of each nut, on the stud's axis: a socket placed there sits on that nut). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 31.5, H = 10.25, BEAD = 20.6, FL = 21.4, PCD = 5.715, NUT_R = 1.1, SEAT = H - 1.2, NUT_H = 2.2;
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel;
  const DISC = ISO.tint("#e3e5e8", ["#8f949b", "#a3a8ae", "#b7bbc0", "#c9ccd0"], "#3c3f45");
  // the wheel's axis frame: a = +y (out of the face), u = −x, v = +z; a screen angle φ (from the right, anticlockwise
  // as you face the wheel) is the frame angle π − φ
  const F = G.frameOf([0, 0, 0], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
  const PHI = (k) => ((90 - 72 * k) * Math.PI) / 180;                 // nut k (0 = nut 1, top), clockwise
  const NUT = (k) => [Math.cos(PHI(k)) * PCD, 0, Math.sin(PHI(k)) * PCD];
  const axisAt = ([x, , z]) => G.frameOf([x, 0, z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
  let ids = 0;

  function tyreSvg(P) {
    // the section's round shoulder as short straight runs: a soft (curved) meridian costs three times as much to build
    const half = [[-H, BEAD], [-H + 0.35, 24.6], [-H + 0.9, 27.4], [-H + 1.8, 29.5], [-H + 3.1, 30.8], [-H + 5, R]];
    const tyre = G.solidOf([...half, ...half.map(([s, r]) => [-s, r]).reverse()], F, P, { steps: 72 });
    return ISO.tinted(RUBBER, S(tyre, { tone: "hi" }));
  }
  function treadSvg(P) {
    const out = [];
    // tread blocks: ribs across the crown, ending on the shoulders; two grooves round the crown
    out.push(K.fadedSvg(G.ribsOf(F, -H + 4.6, H - 4.6, R + 0.03, 60, P, { fade: [0.1, 0.55], seams: true }), { tone: "faint" }));
    out.push(L(G.arcOf(F, -2.4, R + 0.02, P) + G.arcOf(F, 2.4, R + 0.02, P), { tone: "lo" }));
    // on the sidewall: the rim-guard ring and the moulded size
    out.push(L(G.circleOf(F, H - 0.15, 22.6, P, 96) + G.circleOf(F, H - 0.95, 27.6, P, 112), { tone: "faint" }));
    return ISO.tinted(RUBBER, out.join(""));
  }
  // the moulded words, on an arc over the hub (a textPath in the sidewall's plane)
  function wordsOnTyre(P, id) {
    const m = ISO.faceMatrix(P, [0, H - 0.3, 0], 0.1);
    return `<g transform="${m}"><path id="${id}" d="M -246 0 A 246 246 0 0 1 246 0" fill="none" stroke="none"/>` +
      `<text fill="#2b2c30" style="font:700 22px 'Helvetica Neue',Arial,sans-serif;letter-spacing:2px"><textPath href="#${id}" startOffset="50%" text-anchor="middle">205/55 R16 91V</textPath></text>` +
      `<path id="${id}b" d="M -250 0 A 250 250 0 0 0 250 0" fill="none" stroke="none"/>` +
      `<text fill="#2b2c30" style="font:700 15px 'Helvetica Neue',Arial,sans-serif;letter-spacing:3px" dy="12"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">TUBELESS · RADIAL</textPath></text></g>`;
  }
  function rimSvg(P) {
    const out = [S(G.ringBand(H - 2.6, H + 0.25, BEAD - 1.4, FL, F, P), { tone: "hi", inner: L(G.circleOf(F, H + 0.25, FL - 0.5, P, 112), { tone: "faint" }) })];
    out.push(S(G.disc(H - 3.8, H - 2.2, BEAD - 1.4, F, P), { tone: "mid" }));
    // eight round vent holes between the pressed ring and the flange, and the pressed ring itself
    out.push(L(Array.from({ length: 8 }, (_, i) => G.circleOf(axisAt(G.pointOf(F, 0, 14.2, (i * Math.PI) / 4 + 0.39)), H - 2.2, 1.7, P)).join(""), { tone: "lo" }));
    out.push(L(G.circleOf(F, H - 2.2, 11.4, P, 72) + G.circleOf(F, H - 2.2, 16.6, P, 96), { tone: "faint" }));
    // the valve stem: a rubber stem through the disc near the flange, a steel cap on it
    const vf = axisAt(G.pointOf(F, 0, 17.4, Math.PI - (205 * Math.PI) / 180));
    out.push(ISO.tinted(RUBBER, S(G.solidOf([[H - 2.2, 0.62], [H - 1.9, 0.62], [H - 1.2, 0.42, 1], [H + 0.4, 0.4]], vf, P, { steps: 18 }), { tone: "hi" })));
    out.push(S(G.solidOf([[H + 0.4, 0.42], [H + 1.3, 0.42], [H + 1.45, 0.3]], vf, P, { steps: 18 }), { tone: "hi" }));
    return ISO.tinted(DISC, out.join(""));
  }
  // the raised boss the nuts seat on, the hub's centre cap, the five studs
  function hubSvg(P) {
    const out = [S(G.solidOf([[H - 2.2, 9], [H - 1.6, 8.6, 1], [SEAT, 8.2]], F, P), { tone: "mid" })];
    out.push(S(G.solidOf([[SEAT, 3.6], [SEAT + 0.9, 3.5, 1], [SEAT + 1.3, 3.0, 1], [SEAT + 1.45, 2.2]], F, P), { tone: "hi", inner: L(G.circleOf(F, SEAT + 1.45, 1.4, P), { tone: "faint" }) }));
    for (let k = 0; k < 5; k++) {
      const A = axisAt(NUT(k)), rings = [];
      for (let s = SEAT + 0.5; s < SEAT + NUT_H + 0.4; s += 0.25) rings.push(G.arcOf(A, s, 0.6, P));
      out.push(S(G.solidOf([[SEAT, 0.6], [SEAT + NUT_H + 0.4, 0.6], [SEAT + NUT_H + 0.6, 0.45]], A, P, { steps: 18 }), { tone: "hi", inner: L(rings.join(""), { tone: "faint" }) }));
    }
    return ISO.tinted(STEEL, out.join(""));
  }
  // one wheel nut on stud k: the conical seat, the 19 mm hex, the stud's end showing through it
  function nutSvg(P, k) {
    const A = axisAt(NUT(k)), hex = Array.from({ length: 6 }, (_, i) => [Math.cos(0.3 + k * 0.7 + (i * Math.PI) / 3) * NUT_R, Math.sin(0.3 + k * 0.7 + (i * Math.PI) / 3) * NUT_R]);
    return S(G.solidOf([[SEAT, 1.0], [SEAT + 0.45, 1.25], [SEAT + 0.5, 1.2]], A, P, { steps: 24 }), { tone: "hi" }) +
      S(G.prismOf(A, hex, SEAT + 0.5, SEAT + NUT_H, P), { tone: "hi", inner: L(G.circleOf(A, SEAT + NUT_H, 0.95, P), { tone: "faint" }) }) +
      S(G.disc(SEAT + NUT_H, SEAT + NUT_H + 0.4, 0.6, A, P, { steps: 18 }), { tone: "mid" });
  }

  ISO.add({
    name: "carwheel", title: "Car wheel (part)", compare: null,
    about: "A 63 cm car wheel standing upright, its face toward you: a 205/55 R16 tyre, a steel rim with vent holes, the hub cap and five wheel nuts on a 114.3 mm circle; nuts says how many are on and set({ nuts }) slides them off or on. anchors: hub nut1 nut2 nut3 nut4 nut5",
    line: "carwheel cx cy k nuts=0..5 lab=0 lit=tyre|rim|nuts|hub",
    demo: { line: "carwheel 480 270 5.6 nuts=5 lab=1", script: [{ set: {}, hold: 1 }, { set: { nuts: 2, lit: "nuts" }, hold: "settle" }, { set: { nuts: 0, lit: "hub" }, hold: "settle" }, { set: { nuts: 5, lit: "tyre" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const id = `cwtyre${ids++}`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -15, y: -11, w: 30, d: 22, r: 9 }, -R, 1, P)}"/>` +
        `<g data-name="tyre"></g><g data-name="rim"></g><g data-name="hub"></g>` +
        `<g data-name="nuts" style="${STEEL}">${[0, 1, 2, 3, 4].map((k) => `<g data-nut="${k}"></g>`).join("")}</g><g data-part="words"></g>`;
      // a build in four parts (ISO.later): the tyre alone is most of it
      const fill = (n, svg) => ISO.later(() => { const e = g.querySelector(`[data-name="${n}"]`); e.innerHTML = svg(); e._fresh = true; draw(); });
      let tyreBody = "";
      ISO.later(() => { tyreBody = tyreSvg(P); });
      fill("tyre", () => tyreBody + treadSvg(P) + wordsOnTyre(P, id));
      fill("rim", () => rimSvg(P));
      fill("hub", () => hubSvg(P));
      ISO.later(() => { nutEl.forEach((e, k) => { e.innerHTML = nutSvg(P, k); }); g.querySelector('[data-name="nuts"]')._fresh = true; draw(); });
      const nutEl = [...g.querySelectorAll("[data-nut]")], words = g.querySelector('[data-part="words"]');
      g.anchors = { hub: [0, SEAT + 1.45, 0] };
      for (let k = 0; k < 5; k++) { const [x, , z] = NUT(k); g.anchors[`nut${k + 1}`] = [x, SEAT + NUT_H, z]; }
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const want = (n) => [0, 1, 2, 3, 4].map((k) => (k < n ? 1 : 0));
      const goal = { nuts: Math.round(ISO.clamp(ISO.num(o, "nuts", 5), 0, 5)) }, on = want(goal.nuts);
      let lit = o.lit || "";
      const draw = () => {
        // a nut coming off slides 4 cm out along its stud and fades; off, it is hidden
        nutEl.forEach((e, k) => {
          w.attr(e, "transform", K.translateAlong(P, [0, (1 - on[k]) * 4, 0]));
          w.attr(e, "opacity", on[k].toFixed(2));
          w.shown(e, on[k] > 0.01);
        });
        w.rebuild(words, lab ? "1" : "", () => !lab ? "" : ISO.word(K.iso([R + 3, 0, R * 0.55], P), "car wheel", "#444", { size: 14, anchor: "start" }) +
          ISO.word(K.iso([...NUT(1)].map((v, i) => (i === 1 ? SEAT + NUT_H : v)), P), "wheel nuts", "#444", { size: 13, anchor: "start", dy: 4 }).replace('x="', 'dx="12" x="'));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.nuts !== undefined) goal.nuts = Math.round(ISO.clamp(+p.nuts, 0, 5));
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        const target = want(goal.nuts), calm = ISO.still();
        // one nut at a time, the way a hand does it: on from nut 1 up, off from the last one down
        let k = -1;
        for (let i = 0; i < 5; i++) if (on[i] !== target[i]) { k = i; if (target[i]) break; }
        for (let i = 0; i < 5; i++) {
          if (on[i] === target[i] || (!calm && i !== k)) continue;
          on[i] = ISO.follow(on[i], target[i], dt, 0.12, calm);
          if (Math.abs(on[i] - target[i]) < 0.01) on[i] = target[i];
        }
        draw();
        return on.some((v, i) => v !== target[i]);
      };
      g.readout = () => `car wheel · 205/55 R16 tyre, 63 cm across · five 19 mm nuts on a 114.3 mm circle · ${on.filter((v) => v > 0.5).length} of 5 nuts on`;
      draw();
      return g;
    },
  });
})();
