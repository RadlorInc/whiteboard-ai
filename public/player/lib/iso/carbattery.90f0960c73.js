// "carbattery cx cy width k=good|dead probe=0|1 lab=1 lit=case|plus|minus|eye|meter" — a 12-volt car battery, tested.
// A lead-acid battery: the case with its lid, six cell caps in two strips (six cells of about 2.1 V in series make
// 12.6 V), the lead posts (red cap on +, black on −) with + and − moulded beside them, the carry strap and the
// charge "eye" (green when charged, dark when it needs charging). A multimeter on the bench, set to 20 V DC, has its
// red probe on + and black on −: a charged battery at rest reads 12.6 V; 12.0 V is about a quarter; 11.9 V or less is
// flat. k=dead shows a flat one (greyed case, dark eye, 11.8 V). set({ k, probe }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOX = { x: -13, y: -8.6, w: 26, d: 17.2, r: 0.8 }, HZ = 20, POS = [-9.6, 5], NEG = [9.6, 5], PH = 2.2;
  const METER = { x: 20, y: -2, w: 9, d: 15, r: 1 };
  const BENCH = { x: -20, y: -16, w: 54, d: 30, r: 3 };
  const charge = (v) => ISO.clamp((v - 11.9) / 0.7, 0, 1);
  const caseTint = (dead) => (dead ? ISO.tint("#c9cbce", ["#7d8187", "#8b8f95", "#999ca2", "#a7aab0"], "#3a3d42") : ISO.tint("#45494f", ["#1f2226", "#272a2f", "#2f3338", "#363a40"], "#0d0e10"));

  function batterySvg(P, dead, lab) {
    const CT = caseTint(dead), out = [`<path class="iso-halo" d="${K.haloOf(BENCH, -3, 3, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(BENCH, -3, 3, P, 3, 0.8), { tone: "mid" }))];
    out.push(ISO.tinted(CT, S(K.slabOf(BOX, 0, HZ - 2, P, 2, 0.4), { tone: "hi", inner: L(K.sideSeam(BOX, 2, P, 2) + K.sideSeam(BOX, HZ - 4, P, 2), { tone: "faint" }) })));
    out.push(ISO.tinted(CT, S(K.slabOf(K.insetPlan(BOX, -0.3), HZ - 2, 2, P, 2, 0.4), { tone: "hi" })));
    // the cell caps: two strips of three, each cap a ring with a vent slot
    for (const y of [-3.5, 0.5]) {
      out.push(ISO.tinted(CT, S(K.slabOf({ x: -6.5, y, w: 13, d: 3, r: 0.6 }, HZ, 0.5, P, 2), { tone: "mid" })));
      out.push(L([-4.3, 0, 4.3].map((x) => K.ring(x, y + 1.5, 1, HZ + 0.5, P, 18)).join(""), { tone: "lo" }));
    }
    // the carry strap lying flat across the lid between its two lugs
    for (const x of [-11.5, 11.5]) out.push(ISO.tinted(CT, S(K.slabOf({ x: x - 0.8, y: -1.4, w: 1.6, d: 2.8, r: 0.3 }, HZ, 1, P, 2), { tone: "mid" })));
    out.push(ISO.tinted(CT, S(K.slabOf({ x: -11, y: -0.9, w: 22, d: 1.8, r: 0.4 }, HZ + 1, 0.25, P, 2), { tone: "hi" })));
    // the posts: a moulded boss, the tapered lead post and its coloured cap
    for (const [[x, y], tint] of [[POS, ISO.T.red], [NEG, ISO.T.plastic]]) {
      out.push(ISO.tinted(CT, S(K.cylinder(x, y, 2.2, HZ, 0.6, P, 24), { tone: "mid" })));
      out.push(ISO.tinted(ISO.tint("#c9cbce", ["#80848a", "#90949a", "#a0a4aa", "#b0b3b8"], "#3a3d42"), S(G.solidOf([[0, 1], [PH, 0.85]], G.frameOf([x, y, HZ + 0.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 20 }), { tone: "hi" })));
      out.push(ISO.tinted(tint, S(G.ringBand(0, 0.6, 1.05, 1.6, G.frameOf([x, y, HZ + 0.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" })));
    }
    // + and − moulded in the lid beside the posts
    const sign = (x, y, s, c) => `<g transform="${K.topMatrix([x, y], HZ, P, "x")}"><text font-size="2.8" font-weight="800" fill="${c}" text-anchor="middle" y="1" font-family="Helvetica Neue,Arial">${s}</text></g>`;
    out.push(sign(POS[0] + 0.2, POS[1] - 3.6, "+", "#d24a3a"), sign(NEG[0] - 0.2, NEG[1] - 3.6, "−", "#e8e8e8"));
    if (lab) out.push(`<g transform="${ISO.faceMatrix(P, [0, BOX.y + BOX.d + 0.02, 10], 1)}"><text font-size="3.2" font-weight="800" fill="${dead ? "#3a3d42" : "#e6e6e6"}" text-anchor="middle" font-family="Helvetica Neue,Arial">12V</text></g>`);
    return out.join("");
  }
  function eyeSvg(P, c) {
    const [x, y] = [5, -6], col = c > 0.5 ? "#3ab54a" : "#26282c";
    return S(K.cylinder(x, y, 1.3, HZ, 0.3, P, 20), { tone: "hi" }) + `<path d="${K.pathOf(G.arcPoints(G.frameOf([x, y, HZ + 0.31], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, 0.8, 0, Math.PI * 2, 20).map((p) => K.iso(p, P)), true)}" fill="${col}" stroke="#111" stroke-width="0.4"/>`;
  }
  function meterSvg(P, v, on) {
    const M = METER, out = [ISO.tinted(ISO.T.amber, S(K.slabOf(M, 0, 3.4, P, 3, 0.6), { tone: "hi" }))];
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf(K.insetPlan(M, 0.8), 3.4, 0.3, P, 3), { tone: "hi" })));
    // the screen near the far end, the range dial in the middle, the probe sockets at the near end
    out.push(`<path d="${K.pathOf([[M.x + 1.6, M.y + 1.6], [M.x + M.w - 1.6, M.y + 1.6], [M.x + M.w - 1.6, M.y + 5.4], [M.x + 1.6, M.y + 5.4]].map(([a, b]) => K.iso([a, b, 3.71], P)), true)}" fill="#c9dcc0" stroke="#222" stroke-width="0.5"/>`);
    out.push(`<g transform="${K.topMatrix([M.x + M.w / 2, M.y + 4.4], 3.72, P, "x")}"><text font-size="2.6" font-weight="700" fill="#1d2a1a" text-anchor="middle" font-family="Helvetica Neue,Arial">${on ? v.toFixed(2) : "0.00"}</text></g>`);
    out.push(S(K.cylinder(M.x + M.w / 2, M.y + 8.6, 2, 3.7, 0.7, P, 24, 0.3), { tone: "mid", inner: L(K.knurl(M.x + M.w / 2, M.y + 8.6, 2, 3.7, 4.4, 18, P, 0), { tone: "lo" }) }));
    out.push(`<path class="iso-line" data-tone="hi" data-free="end" d="${K.lineOnTop([M.x + M.w / 2, M.y + 8.6], [M.x + M.w / 2 - 1.2, M.y + 7.2], 4.4, P)}"/>`, D([K.iso([M.x + M.w / 2, M.y + 8.6, 4.4], P)], { size: 0.6, tone: "hi" }));
    for (const [x, c] of [[M.x + 2.6, "#d24a3a"], [M.x + M.w - 2.6, "#26282c"]]) out.push(ISO.tinted(c === "#d24a3a" ? ISO.T.red : ISO.T.plastic, S(K.cylinder(x, M.y + 12.6, 0.8, 3.7, 0.6, P, 16), { tone: "hi" })));
    return out.join("");
  }
  // The probe leads: from the meter's sockets up and over to the posts' tips (p = 1) or lying beside the meter (p = 0).
  function leadsSvg(P, p) {
    const out = [], M = METER, sc = G.scaleOf(P);
    for (const [[sx, sy], post, color, rest] of [[[M.x + 2.6, M.y + 12.6], POS, "#c0392b", [M.x - 2, M.y + 18]], [[M.x + M.w - 2.6, M.y + 12.6], NEG, "#26282c", [M.x + M.w + 1, M.y + 18]]]) {
      const tip = G.lerp3([rest[0], rest[1], 0.6], [post[0], post[1], HZ + 0.6 + PH], ISO.ease(p)), a = K.iso([sx, sy, 4.3], P), b = K.iso(tip, P);
      const c1 = K.iso([sx, sy + 6, 4.3], P), c2 = K.iso([tip[0], tip[1] + 3, tip[2] + 8 * p], P);
      out.push(`<path d="M${a[0]} ${a[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}" fill="none" stroke="#111" stroke-width="${(0.6 * sc + 0.8).toFixed(1)}" stroke-linecap="round"/><path d="M${a[0]} ${a[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}" fill="none" stroke="${color}" stroke-width="${(0.6 * sc).toFixed(1)}" stroke-linecap="round"/>`);
      const ax = G.unit3(p > 0.5 ? [0, 0.15, 1] : [0, 1, 0.1]);
      out.push(ISO.tinted(color === "#c0392b" ? ISO.T.red : ISO.T.plastic, S(G.disc(0.6, 5, 0.55, G.frameAlong(tip, ax), P, { steps: 14 }), { tone: "hi" })), ISO.tinted(ISO.T.steel, S(G.disc(0, 0.6, 0.15, G.frameAlong(tip, ax), P, { steps: 8 }), { tone: "hi" })));
    }
    return out.join("");
  }

  ISO.add({
    name: "carbattery", title: "12 V car battery", compare: "carbattery 480 280 300",
    about: "A 12-volt car battery with a multimeter on its posts: six 2.1 V cells read 12.6 V when charged; a flat one reads under 12 V and its charge eye goes dark.",
    line: "carbattery cx cy width k=good|dead probe=0|1 lab=1 lit=case|plus|minus|eye|meter",
    demo: { line: "carbattery 480 280 300 probe=0", script: [{ set: {}, hold: 1 }, { set: { probe: 1 }, hold: "settle" }, { set: { k: "dead" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.5, H = size * 1.55;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -3, 0), [0, 0, HZ + 12]], cx, cy, W, H, { azimuth: 52, elevation: 28 }, parent);
      g.innerHTML = `<g data-name="case"></g><g data-name="eye"></g><g data-name="meter"></g><g data-part="leads"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { case: q("case"), eye: q("eye"), meter: q("meter"), leads: q("leads"), words: q("words") }, w = ISO.writer();
      const s = { dead: o.k === "dead", v: o.k === "dead" ? 11.8 : 12.6, p: o.probe === "0" ? 0 : 1 }, goal = { p: s.p };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.case, `${s.dead} ${lab}`, () => batterySvg(P, s.dead, lab));
        w.rebuild(el.eye, String(charge(s.v) > 0.5), () => eyeSvg(P, charge(s.v)));
        const on = s.p > 0.98;
        w.rebuild(el.meter, `${on} ${s.v.toFixed(2)}`, () => meterSvg(P, s.v, on));
        w.rebuild(el.leads, s.p.toFixed(3), () => leadsSvg(P, s.p));
        w.rebuild(el.words, lab ? `${s.dead}` : "", () => !lab ? "" : [
          ISO.word(K.iso([POS[0] - 2, POS[1], HZ + 2], P), "+ red", "#c0392b", { anchor: "end", size: 15, dy: 0 }),
          ISO.word(K.iso([NEG[0], NEG[1] - 2, HZ + 3], P), "− black", "#26282c", { anchor: "start", size: 15, dy: -10 }).replace('x="', 'dx="10" x="'),
          ISO.word(K.iso([5, -8.6, HZ], P), s.dead ? "charge eye: dark" : "charge eye: green", s.dead ? "#444" : "#2c6a22", { anchor: "end", size: 14, dy: -6 }),
          ISO.word(K.iso([METER.x + METER.w, METER.y, 0], P), "multimeter, 20 V DC", "#444", { anchor: "start", size: 14, dy: 8 })].join(""));
        const want = lit || (s.p !== goal.p ? "meter" : on ? "meter" : "");
        w.light([el.case, el.eye, el.meter], [q(want)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.k) { s.dead = p.k === "dead"; s.v = s.dead ? 11.8 : 12.6; }
        if (p.probe !== undefined) goal.p = +p.probe ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.p = ISO.follow(s.p, goal.p, dt, 0.35, ISO.still()); if (Math.abs(s.p - goal.p) < 1e-3) s.p = goal.p;
        draw();
        return s.p !== goal.p;
      };
      g.readout = () => {
        const pct = Math.round(charge(s.v) * 100);
        if (s.p < 0.98) return "12 V lead-acid battery: six cells of 2.1 V in series · probes ready: red to +, black to −";
        return `meter reads ${s.v.toFixed(2)} V · ${s.dead ? "flat (under 11.9 V): charge it, then test again" : `charged, about ${pct} %`} · 12.6 full · 12.2 half · 12.0 a quarter`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
