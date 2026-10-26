// "penetration cx cy width src=alpha|beta|gamma abs=none|paper|aluminium|lead lab=1 lit=source|absorber|tube|counter"
// Absorbing radiation, as it is done in class: a sealed source on a long handle sits in a holder behind lead bricks, a
// sheet of absorber stands in a slotted block, and a Geiger–Müller tube 3 cm from the source counts what gets through
// on a counter. Alpha (2 protons + 2 neutrons, slow, heavy) is stopped by a sheet of paper (and by a few cm of air);
// beta (fast electrons) gets through paper but 3 mm of aluminium stops it; gamma (a wave) gets through both and is only
// cut down by lead: 1 cm of lead lets about 55% through (Co-60). The counter always shows about 20 counts a minute of
// background. set({ src, abs }) swaps the source or the sheet.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -168, y: -64, w: 336, d: 128, r: 7 }, Z = 52, XS = -86, XA = -40, XG = 4, BG = 20;
  const RATE = { alpha: 1500, beta: 1100, gamma: 450 };                       // counts a minute at the tube with no sheet
  const PASS = { alpha: { none: 1, paper: 0, aluminium: 0, lead: 0 }, beta: { none: 1, paper: 0.95, aluminium: 0, lead: 0 }, gamma: { none: 1, paper: 1, aluminium: 0.97, lead: 0.55 } };
  const COL = { alpha: "#c0392b", beta: "#2c8a2c", gamma: "#7a4ab0" }, NAME = { alpha: "alpha α", beta: "beta β", gamma: "gamma γ" };
  const SHEET = { none: 0, paper: 0.6, aluminium: 3, lead: 10 }, SHEETTINT = { paper: ISO.tint("#ffffff", ["#e6e6e2", "#ececea", "#f2f2ef", "#f8f8f6"], "#8a8a84"), aluminium: ISO.T.steel, lead: ISO.tint("#9aa0a8", ["#5d636b", "#6a7078", "#787e86", "#868c94"], "#2a2d33") };
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 112, y: -58, w: 44, d: 12, r: 1.2 })];
    // the lead castle: bricks round the source holder, open toward the tube
    const lead = ISO.tint("#a3a8ae", ["#62676f", "#6f747c", "#7d828a", "#8a8f97"], "#2a2d33"), brick = (list) => ISO.tinted(lead, list.map(([x0, x1, y0, y1, z0, z1]) => ISO.wbox(P, [x0, x1], [y0, y1], [z0, z1], "mid")).join(""));
    out.push(brick([[-150, -100, -40, -22, 0, 24], [-150, -132, -22, 22, 0, 24], [-150, -100, -40, -22, 24, 48]]));
    // the source holder: a post and an aluminium sleeve between the bricks
    out.push(S(K.cylinder(-112, 0, 7, 0, 2, P, 24), { tone: "mid" }), S(K.cylinder(-112, 0, 2.4, 2, Z - 8, P, 16), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 30, 6, G.frameOf([-124, 0, Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" })));
    return out.join("");
  }
  // the near bricks, drawn after the source and its handle
  function frontBricks(P) {
    const lead = ISO.tint("#a3a8ae", ["#62676f", "#6f747c", "#7d828a", "#8a8f97"], "#2a2d33");
    return ISO.tinted(lead, ISO.wbox(P, [-150, -100], [22, 40], [0, 24], "mid") + ISO.wbox(P, [-150, -100], [22, 40], [24, 48], "mid"));
  }
  // The sealed source on its handle, sitting in the sleeve; its tip faces the tube. Coloured by what it gives out.
  function sourceSvg(P, src) {
    const F = G.frameOf([-176, 0, Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [];
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 4], [14, 4.6], [16, 3]], F, P), { tone: "hi" })));
    out.push(S(G.disc(16, 82, 2, F, P), { tone: "mid" }), ISO.tinted(ISO.T.brass, S(G.solidOf([[82, 4.2], [90, 4.2], [91, 3.4]], F, P), { tone: "hi" })));
    out.push(`<circle cx="${K.iso([XS, 0, Z], P)[0].toFixed(1)}" cy="${K.iso([XS, 0, Z], P)[1].toFixed(1)}" r="2" fill="${COL[src]}"/>`);
    return out.join("");
  }
  function holderSvg(P) {
    return ISO.tinted(ISO.T.wood, ISO.wbox(P, [XA - 10, XA + 22], [-30, 30], [0, 10], "mid")) + L(K.planOutline({ x: XA - 1, y: -26, w: 12, d: 52, r: 0.5 }, 10, P, 2), { tone: "lo" });
  }
  const sheetSvg = (P, abs) => (abs === "none" ? "" : ISO.tinted(SHEETTINT[abs], ISO.wbox(P, [XA, XA + Math.max(0.8, SHEET[abs])], [-26, 26], [10, 84], "hi")));
  // The Geiger–Müller tube in a clamp on a stand, its thin mica window toward the source; a cable to the counter.
  // (the tube's boss is threaded on its rod and its clamp arm runs into the tube's side: the audit's sunk lines)
  const CT = { x0: 96, x1: 160, y0: 8, y1: 52, z1: 34 };
  function tubeSvg(P) {
    const out = [S(K.cylinder(58, -34, 9, 0, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(58, -34, 2.4, 2.4, Z + 18, P, 16), { tone: "mid", crease: "none" })];
    out.push(LAB.boss(P, [58, -34], Z - 6, [0, 1]), S(G.disc(7.5, 26, 2, LAB.A([58, -34, Z + 0.5], [0, 1, 0]), P), { tone: "mid" }));
    const F = G.frameOf([XG, 0, Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(S(G.solidOf([[0, 7.2], [3, 8.4], [70, 8.4], [76, 6], [86, 3]], F, P), { tone: "hi" }));
    out.push(S(G.ringBand(48, 60, 8.4, 10, F, P), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(G.ringBand(0, 3, 7.2, 9, F, P), { tone: "hi" })));
    out.push(`<path d="${K.pathOf(LAB.bend([[XG + 86, 0, Z], [XG + 96, 0, Z], [CT.x0 + 10, 30, 30], [CT.x0 + 10, 30, CT.z1]], 8).map((p) => K.iso(p, P)))}" fill="none" stroke="#2a2b2f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
    out.push(D([K.iso([CT.x0 + 10, 30, CT.z1], P)], { size: 0.8 }));
    return out.join("");
  }
  function counterSvg(P) {
    const out = [ISO.wbox(P, [CT.x0, CT.x1], [CT.y0, CT.y1], [0, CT.z1], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [CT.x0 + 5, CT.x1 - 18], [CT.y1, CT.y1 + 0.6], [14, CT.z1 - 5], "hi"))];
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, 3, 3, G.frameOf([CT.x1 - 9, CT.y1, 24], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })), ISO.tinted(ISO.T.plastic, S(G.disc(0, 3, 3, G.frameOf([CT.x1 - 9, CT.y1, 11], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "penetration", title: "Absorbing alpha, beta, gamma", compare: "penetration 480 270 460",
    about: "A sealed source, a sheet of absorber and a Geiger–Müller tube with a counter: paper stops alpha, aluminium stops beta, lead only cuts gamma down.",
    line: "penetration cx cy width src=alpha|beta|gamma abs=none|paper|aluminium|lead lab=1 lit=source|absorber|tube|counter",
    demo: { line: "penetration 480 270 460 src=alpha abs=none", script: [{ set: { abs: "none" }, hold: 2 }, { set: { abs: "paper", lit: "absorber" }, hold: 2.4 }, { set: { src: "beta", lit: "" }, hold: 2 }, { set: { abs: "aluminium" }, hold: 2.4 }, { set: { src: "gamma", abs: "lead", lit: "counter" }, hold: 2.6 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.82;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [XA, 0, 86], [-150, 0, 50]], cx, cy, W, H, { azimuth: 62, elevation: 26 }, parent);
      const s = { src: RATE[o.src] ? o.src : "alpha", abs: SHEET[o.abs] !== undefined ? o.abs : "none", clock: 0, counts: 0, shown: 0 };
      let lit = o.lit || "";
      const rate = () => RATE[s.src] * PASS[s.src][s.abs] + BG;
      s.shown = rate();
      g.innerHTML = `<g>${benchSvg(P)}</g><g data-part="source" data-name="source"></g><g>${frontBricks(P)}</g><g data-name="tube">${tubeSvg(P)}</g><g data-name="counter">${counterSvg(P)}<g data-part="display"></g></g><g data-part="far"></g><g data-name="absorber">${holderSvg(P)}<g data-part="sheet"></g></g><g data-part="near"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.source, s.src, () => sourceSvg(P, s.src));
        w.rebuild(el.sheet, s.abs, () => sheetSvg(P, s.abs));
        // particles: a dozen or two in flight, each with its own fate; those the sheet stops end at its face, alpha also dies in air
        const tq = Math.round(s.clock * 30) / 30, speed = { alpha: 70, beta: 170, gamma: 260 }[s.src], stop = XA, airEnd = XS + 4.5 * 30;
        const dots = { far: [], near: [] };
        for (let k = 0, n = { alpha: 12, beta: 18, gamma: 24 }[s.src]; k < n; k++) {
          const span = XG + 40 - XS, f = (tq * speed / span + hash(k)) % 1, x = XS + f * span, y = (hash(k + 50) - 0.5) * 10 * f, z = Z + (hash(k + 90) - 0.5) * 8 * f;
          const through = hash(k + 7 + Math.floor(tq * speed / span + hash(k)) * 13) < PASS[s.src][s.abs];
          if ((!through && x > stop) || x > XG + 2 || (s.src === "alpha" && x > airEnd)) continue;
          (x < XA ? dots.far : dots.near).push(s.src === "gamma" ? `<path d="${K.pathOf([-6, -4, -2, 0, 2, 4, 6].map((dx, i) => K.iso([x + dx, y, z + (i % 2 ? 1.8 : -1.8)], P)))}" fill="none" stroke="${COL.gamma}" stroke-width="1.5" stroke-linejoin="round"/>` : `<circle cx="${K.iso([x, y, z], P)[0].toFixed(1)}" cy="${K.iso([x, y, z], P)[1].toFixed(1)}" r="${s.src === "alpha" ? 3.2 : 2}" fill="${COL[s.src]}" stroke="#fff" stroke-width="0.6"/>`);
        }
        w.rebuild(el.far, `${tq}${s.src}${s.abs}`, () => dots.far.join(""));
        w.rebuild(el.near, `${tq}${s.src}${s.abs}`, () => dots.near.join(""));
        const shownQ = Math.round(s.shown);
        w.rebuild(el.display, `${shownQ} ${Math.floor(s.counts)}`, () => LAB.faceText(P, [(CT.x0 + CT.x1 - 13) / 2, CT.y1 + 0.7, 23], [1, 0, 0], `${shownQ} /min`, 5.6, "#7fe08a") + LAB.faceText(P, [(CT.x0 + CT.x1 - 13) / 2, CT.y1 + 0.7, 16.5], [1, 0, 0], `count ${Math.floor(s.counts)}`, 3.6, "#7fe08a"));
        w.rebuild(el.words, lab ? `${s.src}${s.abs}` : "", () => !lab ? "" :
          ISO.word(K.iso([-130, 0, Z + 22], P), `${NAME[s.src]} source`, COL[s.src], { size: 14, dy: -4 }) + ISO.word(K.iso([XA + 4, 0, 88], P), s.abs === "none" ? "no sheet" : s.abs === "aluminium" ? "aluminium 3 mm" : s.abs === "lead" ? "lead 1 cm" : "paper", "#555", { size: 14, dy: -6 }) +
          ISO.word(K.iso([XG + 40, 0, Z + 14], P), "GM tube", "#555", { size: 13, dy: -6 }) + ISO.word(K.iso([(CT.x0 + CT.x1) / 2, CT.y1, CT.z1 + 2], P), "counter", "#555", { size: 13, dy: -6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.src && RATE[p.src]) s.src = p.src;
        if (p.abs && SHEET[p.abs] !== undefined) s.abs = p.abs;
        if (p.src || p.abs) s.counts = 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (!ISO.still()) s.clock += dt;
        s.counts += (rate() / 60) * dt;
        s.shown = ISO.follow(s.shown, rate(), dt, 0.6, ISO.still());
        draw();
        return true;
      };
      g.readout = () => {
        const pass = PASS[s.src][s.abs], what = s.abs === "none" ? "no sheet" : s.abs;
        const verdict = pass === 0 ? `${what} stops it: only background is counted` : pass < 1 ? `${what} lets ${Math.round(pass * 100)}% through` : `${what} hardly stops it`;
        return `${NAME[s.src]} · ${verdict} · about ${Math.round(rate())} counts a minute (background ${BG})`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
