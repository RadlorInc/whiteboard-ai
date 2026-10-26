// "statechange cx cy width e=0..1 state=solid|liquid|gas lab=1 lit=beaker|thermometer|burner|graph" — heating ice
// to steam on the lab bench. A Bunsen burner under a tripod and gauze heats a 250 mL beaker holding ice cubes; a
// thermometer hangs in it from a clamp on a retort stand; beside it a card on an easel plots the heating curve, with a
// dot for now. set({ e }) is the heat put in so far (0 → 1, the burner gives heat at a steady rate): the ice warms
// from −20 °C to 0 °C, then MELTS at 0 °C (the temperature stays put while the ice turns to water), the water warms
// to 100 °C, then BOILS at 100 °C (bubbles, steam, the level falls) until it has all gone. The flat parts are true to
// scale for 1 g: warming ice 42 J, melting 334 J, warming water 418 J, boiling 2260 J. state= jumps to the start of
// the solid, liquid or gas stage. lab=0 hides the words.
(() => {
  const K = window.K, G = window.G;
  const MAT = { x: -122, y: -74, w: 300, d: 140, r: 4 }, ROD = [-62, -44], ZG = 112, BR = 30, BH = 70, L0 = 46;
  // energy per gram for each stage, and where each stage ends as a share of the total
  const J = [42, 334, 418, 2260], TOT = J.reduce((a, b) => a + b, 0), B = J.map(((s) => (v) => (s += v) / TOT)(0));
  const stage = (e) => (e < B[0] ? 0 : e < B[1] ? 1 : e < B[2] ? 2 : e < 0.999 ? 3 : 4);
  const tempOf = (e) => (e < B[0] ? -20 + 20 * (e / B[0]) : e < B[1] ? 0 : e < B[2] ? 100 * ((e - B[1]) / (B[2] - B[1])) : 100);
  const iceOf = (e) => (e < B[0] ? 1 : e < B[1] ? 1 - (e - B[0]) / (B[1] - B[0]) : 0);
  const goneOf = (e) => (e < B[2] ? 0 : Math.min(1, (e - B[2]) / (1 - B[2])));
  const NAMES = ["solid: ice warming", "melting at 0 °C", "liquid: water warming", "boiling at 100 °C", "all boiled away: gas"];
  const CUBES = [[-11, -9, 0, 0.3], [11, -8, 0, 1.1], [-3, 11, 0, 2.0], [14, 9, 0, 0.7], [1, -1, 13, 1.6]];
  let nfx = 0;

  ISO.add({
    name: "statechange", title: "Melting and boiling", compare: "statechange 480 290 600",
    about: "Ice heated in a beaker over a Bunsen burner: it warms, melts at 0 °C, the water warms, then boils at 100 °C; the card plots the heating curve.",
    line: "statechange cx cy width e=0..1 state=solid|liquid|gas lab=1 lit=beaker|thermometer|burner|graph",
    demo: { line: "statechange 480 285 600", script: [{ set: { e: B[1], lit: "thermometer" }, hold: "settle" }, { set: { e: B[2], lit: "graph" }, hold: "settle" }, { set: { e: 0.55, lit: "beaker" }, hold: "settle" }, { set: { lit: "" }, hold: 1.4 }] },
    make([cx, cy, size = 600], o, t, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S, L = LAB.L;
      const lab = o.lab !== "0", W = size * 0.95, H = size * 0.72, id = `sc${nfx++}`;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, -4, 0), [ROD[0], ROD[1], 262], [0, 0, ZG + 120], [170, 40, 150]], cx, cy, W, H, { azimuth: 62, elevation: 18 }, parent);
      const st = { e: ISO.clamp(ISO.num(o, "e", o.state === "liquid" ? B[1] : o.state === "gas" ? B[2] : 0), 0, 1), want: 0, clock: 0, lit: o.lit || "", litDrawn: null };
      st.want = st.e;
      const heat = ISO.tint("#e7e2d8", ["#b9b2a4", "#c6bfb1", "#d2ccbf", "#ddd8cc"], "#6d6658");
      const bun = LAB.bunsen(P, [0, 0], 1, { h: 72 }), tri = LAB.tripod(P, [0, 0], ZG, 36);
      const V = LAB.vessel(P, [0, 0, ZG + 0.8], CHEM.beaker(BR, BH), { spout: true });
      const cl = LAB.clamp(P, ROD, 214, [0.82, 0.57], Math.hypot(-8 - ROD[0], -6 - ROD[1]) * 1, 3.2);
      const foot = [-8 + 0, -6 + 0, ZG + 6], TLEN = 150, PER = 0.85;   // thermometer: 0.85 mm per °C, −20 °C at 20 mm up
      const sAt = (T) => 20 + (T + 20) * PER;
      // the card on its easel: plots temperature against heat put in, on a 120 × 84 mm card
      const CX0 = 64, CY = 30, CZ0 = 22, CWd = 104, CHt = 82;
      const gx = (e) => 14 + e * (CWd - 22), gy = (T) => CHt - 14 - ((T + 20) / 130) * (CHt - 26);
      const curve = [];
      for (let k = 0; k <= 60; k++) { const e = k / 60; curve.push([gx(e), gy(tempOf(e))]); }
      [B[0], B[1], B[2]].forEach((e) => curve.push([gx(e), gy(tempOf(e))]));
      curve.sort((a, b) => a[0] - b[0]);
      const card = () => {
        const out = [];
        // easel: two legs and a back strut, a ledge the card stands on
        out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [CX0 + 6, CX0 + 10], [CY - 2, CY + 2], [0, CZ0 + 70], "mid") + ISO.wbox(P, [CX0 + CWd - 10, CX0 + CWd - 6], [CY - 2, CY + 2], [0, CZ0 + 70], "mid") + ISO.wbox(P, [CX0 + 2, CX0 + CWd - 2], [CY + 2, CY + 7], [CZ0 - 4, CZ0], "mid")));
        out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [CX0, CX0 + CWd], [CY + 2, CY + 3.2], [CZ0, CZ0 + CHt], "hi")));
        const m = ISO.faceMatrix(P, [CX0, CY + 3.25, CZ0 + CHt], 1);
        const axes = `M14 8 V${CHt - 14} H${CWd - 6}`, path = "M" + curve.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L");
        const tag = (x, y, s, c = "#33404c", a = "start", f = 4.4) => `<text x="${x}" y="${y}" text-anchor="${a}" fill="${c}" style="font:600 ${f}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;
        out.push(`<g transform="${m}"><path d="${axes}" fill="none" stroke="#33404c" stroke-width="0.6"/><path d="M14 ${gy(0)} H${CWd - 6} M14 ${gy(100)} H${CWd - 6}" stroke="#9fb0c2" stroke-width="0.35" stroke-dasharray="1.5 1.5"/>` +
          `<path d="${path}" fill="none" stroke="#2f6fae" stroke-width="1"/>${tag(12, gy(0) + 1.4, "0 °C", "#33404c", "end", 3.6)}${tag(12, gy(100) + 1.4, "100 °C", "#33404c", "end", 3.6)}${tag(12, gy(-20) + 1.4, "−20", "#33404c", "end", 3.4)}` +
          `${tag(gx(B[0] + 0.02), gy(0) - 2, "melting", "#2f6fae", "start", 3.6)}${tag(gx(B[2] + 0.18), gy(100) - 2, "boiling", "#a8382a", "start", 3.6)}${tag(CWd / 2 + 4, CHt - 6, "heat put in →", "#33404c", "middle", 3.8)}${tag(6, 6, "temperature", "#33404c", "start", 3.8)}</g>`);
        return out.join("");
      };
      // (the audit lists the gauze and the clamped thermometer as loose: they rest on the tripod ring and in the clamp's
      // jaws, which it doesn't record; the burner's and the boss's own overlaps come from the shared _lab.js parts)
      g.innerHTML = LAB.flameDefs(id) + `<g style="${heat}"><path class="iso-halo" d="${K.haloOf(MAT, -4, 4, P)}"/>${S(K.slabOf(MAT, -4, 4, P, 3, 0.5), { tone: "lo" })}</g>`   /* heat-proof mat, its top at z = 0 */ +
        `<g data-name="stand">${LAB.standBase(P, { x: ROD[0] - 26, y: ROD[1] - 22, w: 52, d: 40, r: 3 }, ROD)}${LAB.rod(P, ROD, 14, 262)}${LAB.boss(P, ROD, 214, [0.82, 0.57])}${cl.back}</g>` +
        `<g data-name="burner">${bun.svg}${bun.collar(1)}</g>${tri.back}<g data-part="flame"></g><g>${tri.front}${tri.gauze}</g>` +
        `<g data-name="beaker" data-part="beaker"></g><g data-name="thermometer">${LAB.thermometer(P, foot, [0, 0, 1], TLEN, 0, { r: 2.8, thread: false, ticks: [sAt(-20), sAt(110), 10 * PER, 5] })}</g><g data-name="thermometer" data-part="therm"></g><g data-part="bubbles"></g><g data-name="beaker">${V.front()}${V.scale(20, 60, 5, 2, { side: -0.6 })}</g><g>${cl.front}</g><g data-name="graph">${card()}</g><g data-part="dot"></g><g data-part="steam"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const fx = ISO.flameFx(g, P, W, H, el.flame.nextSibling, [0, 0, 72.5], 24), steam = ISO.puffsFx(g, P, W, H, el.words, 6, 1);
      const cube = ([x, y, z, a], s) => {
        const c = Math.cos(a), n = Math.sin(a), h = s / 2, zc = ZG + 3 + z + h;
        const at = (u, v, ww) => [x + u * c - v * n, y + u * n + v * c, zc + ww];
        return ISO.tinted(ISO.tint("#f4fbff", ["#bcd8ea", "#cbe2f0", "#dbebf5", "#e8f3fa"], "#5d8fb0"), ISO.box(at, P, [-h, h], [-h, h], [-h, h], "mid"));
      };
      const bubbles = (n, lvl) => { const out = []; for (let k = 0; k < n; k++) { const f = (st.clock * 0.9 + k * 0.137) % 1, a = k * 2.4, r = 6 + (k * 7) % 18; out.push(LAB.bubble(P, [Math.cos(a) * r, Math.sin(a) * r, ZG + 4 + f * (lvl - 4)], 1 + f * 1.6)); } return out.join(""); };
      const puffs = (amt) => Array.from({ length: 6 }, (_, k) => { const f = (st.clock * 0.35 + k / 6) % 1; return [Math.sin(k * 2.1) * 6 + f * 8, Math.cos(k * 1.7) * 6, ZG + BH + 4 + f * 70, 7 + f * 16, amt * 0.75 * Math.sin(Math.PI * f)]; });
      const draw = () => {
        const eq = Math.round(st.e * 400) / 400, T = tempOf(eq), ice = iceOf(eq), gone = goneOf(eq), sg = stage(eq);
        const lvl = ZG + 2 + (L0 * (1 - ice) + 12 * ice) * (1 - gone);
        const boil = sg === 3, tq = boil ? Math.round(st.clock * 20) : 0;
        w.rebuild(el.beaker, String(eq), () => {
          const cubes = ice > 0.01 ? CUBES.slice().sort((p, q) => K.depthOf([p[0], p[1], 0], P) - K.depthOf([q[0], q[1], 0], P)).map((c) => cube(c, 15 * Math.cbrt(ice))).join("") : "";
          return V.back() + cubes + (lvl > ZG + 3.5 ? V.liquid(lvl - ZG - 0.8, "#cfe6f6", { opacity: 0.6 }) : "");
        });
        w.rebuild(el.bubbles, `${eq} ${tq}`, () => (boil && gone < 0.98 ? bubbles(14, lvl - ZG) : sg === 2 && T > 75 ? bubbles(3, lvl - ZG) : ""));
        w.rebuild(el.therm, T.toFixed(1), () => LAB.thread(P, foot, [0, 0, 1], sAt(T), 2.8));
        w.rebuild(el.dot, String(eq), () => { const m = ISO.faceMatrix(P, [CX0, CY + 3.3, CZ0 + CHt], 1); return `<g transform="${m}"><circle cx="${gx(eq).toFixed(2)}" cy="${gy(T).toFixed(2)}" r="2.2" fill="#d0392b" stroke="#fff" stroke-width="0.6"/></g>`; });
        const amt = boil ? 1 - gone * 0.5 : sg === 2 ? ISO.smooth(70, 100, T) * 0.35 : 0;
        if (steam) steam(amt > 0.01 ? puffs(amt) : []);
        else w.rebuild(el.steam, amt > 0.01 ? `${Math.round(st.clock * 20)} ${amt.toFixed(2)}` : "off", () => amt > 0.01 ? puffs(amt).map(([x, y, z, r, a]) => { const c = K.iso([x, y, z], P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * G.scaleOf(P)).toFixed(1)}" fill="#f4f7fa" stroke="#9fb0c2" stroke-width="0.7" opacity="${a.toFixed(2)}"/>`; }).join("") : "");
        const heating = st.e < st.want - 1e-4 || st.e < 0.999;
        if (fx) fx.flame(1, 1);
        else w.rebuild(el.flame, String(Math.round(st.clock * 24)), () => LAB.flame(P, [0, 0, 72.5], 1, 24, Math.round(st.clock * 24) / 24, id));
        if (lab) w.rebuild(el.words, `${sg} ${Math.round(T)}`, () => LAB.word(P, lab, [0, 0, ZG + BH + 64], sg === 1 || sg === 3 ? NAMES[sg] : `${NAMES[sg]} · ${Math.round(T)} °C`, sg === 0 || sg === 1 ? "#2f6fae" : sg === 2 ? "#2c6a22" : "#a8382a", { size: 15 }) +
          LAB.word(P, lab, [foot[0], foot[1], ZG + TLEN + 14], "thermometer", "#556", { size: 12 }) + LAB.word(P, lab, [CX0 + CWd / 2, CY, CZ0 + CHt + 8], "heating curve", "#556", { size: 12 }));
        if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
        return heating;
      };
      g.set = (p) => {
        if (p.state) st.want = p.state === "liquid" ? B[1] : p.state === "gas" ? B[2] : 0;
        if (p.e !== undefined) st.want = ISO.clamp(+p.e, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
        if (st.want < st.e) st.e = st.want;   // heat can't be taken back: going back starts that stage afresh
      };
      // the burner gives heat at a steady rate, so the stages take time in proportion to the heat they need
      g.update = (dt) => {
        const calm = ISO.still();
        if (!calm) st.clock += dt;
        st.e = calm ? st.want : Math.min(st.want, st.e + dt * 0.055);
        draw();
        return st.e !== st.want;
      };
      g.readout = () => {
        const T = tempOf(st.e), sg = stage(st.e);
        return `${NAMES[sg]} · ${T.toFixed(0)} °C · heat put in ≈ ${Math.round(st.e * TOT)} J per gram${sg === 1 ? ` · ${Math.round((1 - iceOf(st.e)) * 100)}% melted, temperature stays at 0 °C` : sg === 3 ? ` · ${Math.round(goneOf(st.e) * 100)}% boiled away, temperature stays at 100 °C` : ""}`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
