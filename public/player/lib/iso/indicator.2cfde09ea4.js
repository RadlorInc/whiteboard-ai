// "indicator cx cy size k=universal|litmus ph=0..14 dip=0..1 lab=1 lit=rack|beaker|chart|bottle|acid|alkali" — lab
// glassware on a white tile. universal: a wooden rack of seven test tubes of universal indicator at pH 1, 3, 5 … 13
// (red, orange, yellow, green, blue-green, blue, violet), a beaker of indicator solution in front, a bottle of dilute
// sodium hydroxide (alkali) and the printed pH chart lying on the tile with a marker at the beaker's pH.
// set({ ph }) changes the beaker's pH (as if acid or alkali were added) and its colour follows the chart.
// litmus: a beaker of dilute hydrochloric acid (pH 1) and one of dilute sodium hydroxide (pH 13), each with a red and a
// blue litmus strip clipped to a splint across its rim; set({ dip: 1 }) lowers them in: in the acid blue litmus turns
// red, in the alkali red litmus turns blue, and the other strip stays as it was. lab=0 hides the words.
(() => {
  const K = window.K, G = window.G;
  const MAT = { x: -172, y: -72, w: 340, d: 150, r: 4 };
  const RED_L = "#e46a62", BLUE_L = "#5b7fd6", ACID_L = "#d8443c", ALK_L = "#3a68cc";
  const say = (ph) => (ph < 3 ? "strong acid" : ph < 6.5 ? "weak acid" : ph <= 7.5 ? "neutral" : ph <= 11 ? "weak alkali" : "strong alkali");

  ISO.add({
    name: "indicator", title: "Universal indicator and litmus", compare: "indicator 480 270 340 k=universal",
    about: "Universal indicator in a rack of test tubes and a beaker: the colour shows the pH on the chart; or litmus strips dipped in acid and alkali.",
    line: "indicator cx cy size k=universal|litmus ph=0..14 dip=0..1 lab=1 lit=rack|beaker|chart|bottle|acid|alkali",
    demo: { line: "indicator 480 270 340 k=universal ph=2", script: [{ set: { lit: "chart" }, hold: 1.6 }, { set: { ph: 7, lit: "beaker" }, hold: "settle" }, { set: { ph: 12, lit: "bottle" }, hold: "settle" }, { set: { lit: "rack" }, hold: 1.2 }] },
    make([cx, cy, size = 340], o, t, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S, L = LAB.L;
      const lab = o.lab !== "0", litmus = o.k === "litmus", W = size * 1.75, H = size * 1.05;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 4), [-90, -40, 130], [150, -40, 130], [-130, 40, 100]], cx, cy, W, H, { azimuth: 62, elevation: 30 }, parent);
      const w = ISO.writer(), tile = ISO.tint("#f6f7f8", ["#c9ccd1", "#d5d8dc", "#e0e2e5", "#eaecee"], "#6c737c");
      const st = { ph: ISO.clamp(ISO.num(o, "ph", 4), 0, 14), wantPh: 0, dip: ISO.clamp(ISO.num(o, "dip", 0), 0, 1), wantDip: 0, wet: 0, lit: o.lit || "", litDrawn: null };
      st.wantPh = st.ph; st.wantDip = st.dip; st.wet = st.dip > 0.6 ? 1 : 0;
      const out = [LAB.mat(P, MAT, 4, "lo", tile)];
      // white tile grout lines (the tile is four squares)
      out.push(`<path d="${K.lineOnTop([-2, MAT.y + 2], [-2, MAT.y + MAT.d - 2], 4.01, P)}${K.lineOnTop([MAT.x + 2, 3], [MAT.x + MAT.w - 2, 3], 4.01, P)}" stroke="#c9ccd1" stroke-width="0.8" fill="none"/>`);
      const BR = 28, BH = 74, bOuter = CHEM.beaker(BR, BH);

      if (!litmus) {
        // ── universal: rack of seven reference tubes
        const xs = [-66, -34, -2, 30, 62, 94, 126], phs = [1, 3, 5, 7, 9, 11, 13];
        out.push(`<g data-name="rack">${CHEM.rack(P, xs, -42, 104, (i) => [52, CHEM.UI[phs[i]], 0.85], { shelf: 60, z0: 4 })}`);
        out.push(xs.map((x, i) => LAB.faceText(P, [x, -19.7, 7.4], [1, 0, 0], `pH ${phs[i]}`, 5.4, "#5a3d1a", [0, 0, 1])).join("") + `</g>`);
        // the chart: a laminated card on the tile, 15 colour squares with their numbers
        const cy0 = 46, sq = 13, cx0 = -7.5 * sq + 34, card = { x: cx0 - 6, y: cy0 - 4, w: 15 * sq + 12, d: 28, r: 2 };
        const chart = [S(K.slabOf(card, 4, 0.8, P, 3, 0.2), { tone: "lo", crease: "none" })];
        CHEM.UI.forEach((c, i) => chart.push(`<path d="${K.pathOf([[cx0 + i * sq, cy0], [cx0 + (i + 1) * sq, cy0], [cx0 + (i + 1) * sq, cy0 + 12], [cx0 + i * sq, cy0 + 12]].map(([x, y]) => K.iso([x, y, 4.81], P)), true)}" fill="${c}" stroke="#ffffff" stroke-width="0.5"/>`,
          `<g transform="${K.topMatrix([cx0 + (i + 0.5) * sq, cy0 + 17.5], 4.81, P, "x")}"><text text-anchor="middle" style="font:700 5px 'Helvetica Neue',Arial,sans-serif" fill="#33404c">${i}</text></g>`));
        out.push(`<g data-name="chart">${chart.join("")}</g><g data-part="marker"></g>`);
        // the beaker and, beside it, the alkali bottle with its dropper cap
        out.push(`<g data-name="beaker" data-part="beaker"></g>`);
        const BX = -132, BY = 54, bot = LAB.turned(P, [BX, BY, 4], [[0, 15], [1, 16, 1], [36, 16], [42, 9, 1], [46, 6], [50, 6]], ["#5a3414", "#a8692c"], "#3a200a", { rims: [36] });
        out.push(`<g data-name="bottle">${bot}${LAB.turned(P, [BX, BY, 54], [[0, 6.6], [10, 6.6], [11, 4], [14, 4]], ["#2a2c30", "#5a5e66"], "#111")}${LAB.turned(P, [BX, BY, 68], [[0, 3.8], [3, 4.6, 1], [12, 4.6, 1], [16, 2]], ["#222", "#55575c"], "#111")}` +
          `<path d="${K.pathOf([[BX - 11, BY + 15.9, 14], [BX + 11, BY + 15.9, 14], [BX + 11, BY + 15.9, 30], [BX - 11, BY + 15.9, 30]].map((p) => K.iso(p, P)), true)}" fill="#fbfbf7" stroke="#8a8a84" stroke-width="0.5"/>` +
          LAB.faceText(P, [BX, BY + 16, 24.5], [1, 0, 0], "NaOH", 5, "#3a200a") + LAB.faceText(P, [BX, BY + 16, 18], [1, 0, 0], "0.1 M", 3.6, "#6a4a2a") + `</g>`);
        out.push(`<g data-part="words"></g>`);
        g.innerHTML = out.join("");
        const el = LAB.parts(g), V = LAB.vessel(P, [-126, 0, 4], bOuter, { spout: true }), namedEls = [...g.querySelectorAll("[data-name]")];
        const draw = () => {
          const pq = Math.round(st.ph * 20) / 20, c = CHEM.ui(pq);
          w.rebuild(el.beaker, String(pq), () => V.back() + V.liquid(46, c, { opacity: 0.8 }) + V.front() + V.scale(20, 65, 5, 2, { side: -0.5 }));
          w.rebuild(el.marker, String(pq), () => { const x = cx0 + (pq + 0.5) * sq; return `<path d="${K.pathOf([[x, cy0 - 0.5], [x - 3, cy0 - 5], [x + 3, cy0 - 5]].map(([a, b]) => K.iso([a, b, 4.82], P)), true)}" fill="#222" />`; });
          if (lab) w.rebuild(el.words, String(Math.round(pq * 2) / 2), () => LAB.word(P, lab, [-126, 0, BH + 22], `pH ${Math.round(pq * 2) / 2} · ${say(pq)}`, c, { size: 15 }) + LAB.word(P, lab, [BX, BY, 92], "alkali", "#6a4a2a") +
            LAB.word(P, lab, [30, -42, 138], "universal indicator at pH 1 … 13", "#556", { size: 12 }));
          if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
        };
        g.set = (p) => { if (p.ph !== undefined) st.wantPh = ISO.clamp(+p.ph, 0, 14); if (p.lit !== undefined) st.lit = p.lit; };
        g.update = (dt) => { st.ph = ISO.follow(st.ph, st.wantPh, dt, 0.7, ISO.still()); if (Math.abs(st.ph - st.wantPh) < 0.02) st.ph = st.wantPh; draw(); return st.ph !== st.wantPh; };
        g.readout = () => `beaker at pH ${st.ph.toFixed(1)}: ${say(st.ph)} · universal indicator: red below 3, orange–yellow 4–6, green 7 (neutral), blue 8–11, violet 12–14`;
        draw();
      } else {
        // ── litmus: two beakers, each with a splint across the rim holding a red and a blue strip
        const beakers = [{ x: -62, name: "acid", c: "#eef3f6", turns: ACID_L, title: "dilute hydrochloric acid (pH 1)" }, { x: 62, name: "alkali", c: "#eef3f6", turns: ALK_L, title: "dilute sodium hydroxide (pH 13)" }];
        beakers.forEach((b) => out.push(`<g data-name="${b.name}" data-part="${b.name}"></g>`));
        out.push(`<g data-part="words"></g>`);
        g.innerHTML = out.join("");
        const el = LAB.parts(g), namedEls = [...g.querySelectorAll("[data-name]")];
        const Vs = beakers.map((b) => LAB.vessel(P, [b.x, 4, 4], bOuter, { spout: true }));
        const LEVEL = 50, TOP = 4 + BH;
        // a strip 7 mm × 66 mm hanging from the splint, lifted by `lift`; the part that went under the surface (when
        // dipped) has soaked and taken the wet colour, and keeps it when lifted out
        const SOAK = 4 + LEVEL - (TOP + 6 - 66);
        const stripSvg = (x, y, col0, col1, lift, wet) => {
          const zTop = TOP + 6 + lift, zBot = zTop - 66, soak = LAB.mix(col0, col1, wet), cut = zBot + (wet > 0 ? SOAK : 0), tint = (c) => LAB.tintOf(c, LAB.mix(c, "#000000", 0.5));
          return (cut > zBot ? ISO.tinted(tint(soak), ISO.wbox(P, [x - 3.5, x + 3.5], [y - 0.3, y + 0.3], [zBot, cut], "mid")) : "") + ISO.tinted(tint(col0), ISO.wbox(P, [x - 3.5, x + 3.5], [y - 0.3, y + 0.3], [cut, zTop], "mid"));
        };
        const draw = () => {
          const dq = Math.round(st.dip * 40) / 40, wq = Math.round(st.wet * 20) / 20;
          beakers.forEach((b, i) => w.rebuild(el[b.name], `${dq} ${wq}`, () => {
            const V = Vs[i], lift = (1 - dq) * 34;
            const strips = stripSvg(b.x - 10, 4, RED_L, b.name === "alkali" ? ALK_L : RED_L, lift, wq) + stripSvg(b.x + 10, 4, BLUE_L, b.name === "acid" ? ACID_L : BLUE_L, lift, wq);
            const sp = ISO.tinted(ISO.T.wood, ISO.wbox(P, [b.x - 40, b.x + 40], [1, 7], [TOP + 6 + lift, TOP + 9 + lift], "mid"));
            return V.back() + strips + V.liquid(LEVEL, b.c, { opacity: 0.55 }) + V.front() + sp;
          }));
          if (lab) w.rebuild(el.words, String(wq > 0.5), () => beakers.map((b) => LAB.word(P, lab, [b.x, 4, TOP + 32], b.name === "acid" ? (wq > 0.5 ? "acid: blue litmus turns red" : "acid (pH 1)") : (wq > 0.5 ? "alkali: red litmus turns blue" : "alkali (pH 13)"), b.turns, { size: 14 })).join(""));
          if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
        };
        g.set = (p) => { if (p.dip !== undefined) st.wantDip = ISO.clamp(+p.dip, 0, 1); if (p.lit !== undefined) st.lit = p.lit; };
        g.update = (dt) => {
          const calm = ISO.still();
          st.dip = ISO.follow(st.dip, st.wantDip, dt, 0.5, calm); if (Math.abs(st.dip - st.wantDip) < 0.004) st.dip = st.wantDip;
          // the strips change colour as the liquid soaks up them (about 1.5 s); a dry strip stays as it was
          const wantWet = st.dip > 0.7 ? 1 : st.wet; st.wet = calm ? wantWet : Math.min(wantWet, st.wet + dt / 1.5);
          draw();
          return st.dip !== st.wantDip || st.wet !== wantWet;
        };
        g.readout = () => (st.wet > 0.5 ? "in the acid (pH 1) blue litmus has turned red, red stays red · in the alkali (pH 13) red litmus has turned blue, blue stays blue · litmus only says acid or alkali, not how strong" : "red and blue litmus strips ready above dilute hydrochloric acid and dilute sodium hydroxide");
        draw();
      }
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
