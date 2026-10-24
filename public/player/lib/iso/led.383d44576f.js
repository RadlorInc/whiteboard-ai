// "led cx cy height c=red|green|blue|yellow k=on|off lab=1 lit=lens|die|anode|cathode|resistor|power" — a 5 mm LED.
// A 5 mm LED stands in a breadboard, wired the real way: the + rail feeds a 150 Ω resistor into the long leg (anode),
// the short leg (cathode, beside the flat on the rim) goes by a black jumper to the − rail, and a USB power module
// on the end of the board feeds the rails with 5 V. Seen through the tinted epoxy lens: the cathode's anvil with its
// reflector cup, the tiny chip (the die) sitting in the cup, and the hair-thin gold bond wire from the chip to the
// anode post. Switched on, electrons cross the chip and drop into holes, giving off light of one colour; the cup and
// the domed lens send it up. Each colour needs its own voltage (red 2.0 V … blue 3.1 V), so the same resistor lets
// a different current through ((5 V − Vf) ÷ 150 Ω). set({ c, k, lit }). World units: 1 = 0.1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const PITCH = 25.4, BOARD = { x: -128, y: -78, w: 256, d: 218, r: 5 }, LY = 38.1, AX = 12.7, CX = -12.7, FL = 100, LZ = 110;
  const COL = {
    red: { vf: 2.0, light: "#ff3b2f", tint: ISO.tint("#f7b4ad", ["#d4473b", "#df5d52", "#e9776d", "#f19a91"], "#7a1810"), on: ISO.tint("#ffd0c8", ["#ff5a48", "#ff6f5e", "#ff8a7c", "#ffaa9e"], "#8f1a10") },
    green: { vf: 2.2, light: "#38d24a", tint: ISO.tint("#b9e8b2", ["#46a83c", "#5bb752", "#77c66f", "#98d690"], "#1c5a14"), on: ISO.tint("#d8ffd0", ["#4ed244", "#66dc5c", "#84e57b", "#a8ee9f"], "#1c6a14") },
    blue: { vf: 3.1, light: "#3a7bff", tint: ISO.tint("#b5c9f2", ["#3e66c4", "#5479cf", "#6f91da", "#93ade6"], "#16306e"), on: ISO.tint("#d4e2ff", ["#4a7cff", "#6290ff", "#7ea5ff", "#a2bfff"], "#16308a") },
    yellow: { vf: 2.1, light: "#ffcc1a", tint: ISO.tint("#f6e3a2", ["#d2a42a", "#dcb444", "#e6c562", "#efd688"], "#6b5108"), on: ISO.tint("#fff2c0", ["#ffc928", "#ffd247", "#ffdc6a", "#ffe692"], "#7a5a08") },
  };
  const amps = (c) => (5 - COL[c].vf) / 150;
  const holeAt = (i, j) => [(i - 4.5) * PITCH, (j - 2.5) * PITCH];
  const RAILP = 100, RAILN = 125, BZ = 44;             // the − rail (blue), the + rail (red), the board's thickness

  function boardSvg(P) {
    const out = [ISO.tinted(ISO.tint("#f4f2ec", ["#c9c6bd", "#d4d1c8", "#dedbd3", "#e8e6de"], "#6f6b60"), S(K.slabOf(BOARD, -BZ, BZ, P, 6, 2), { tone: "mid", halo: true }))];
    // the centre groove the chips straddle, edge to edge
    out.push(`<path d="${K.pathOf([[BOARD.x, -5], [BOARD.x + BOARD.w, -5], [BOARD.x + BOARD.w, 5], [BOARD.x, 5]].map(([x, y]) => K.iso([x, y, 0.05], P)), true)}" fill="#d9d6cd" stroke="#8d897d" stroke-width=".5"/>`);
    // the holes: 10 × 6 in the main field, two rails of holes along the front, red and blue rail lines
    const sq = (x, y) => K.pathOf([[x - 4, y - 4], [x + 4, y - 4], [x + 4, y + 4], [x - 4, y + 4]].map(([a, b]) => K.iso([a, b, 0.05], P)), true), holes = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) holes.push(sq(...holeAt(i, j)));
    for (let i = 2; i < 10; i++) for (const y of [RAILP, RAILN]) holes.push(sq((i - 4.5) * PITCH, y));
    out.push(`<path d="${holes.join("")}" fill="#3a3a38" stroke="#1d1d1c" stroke-width=".3"/>`);
    for (const [y, c] of [[RAILP - 12, "#2f5fbf"], [RAILN + 11, "#c0392b"]]) out.push(`<path d="${K.pathOf([K.iso([-76, y, 0.05], P), K.iso([BOARD.x + BOARD.w - 6, y, 0.05], P)])}" stroke="${c}" stroke-width="1.2"/>`);
    // the USB power module at the left end, plugged into both rails: a green board, its USB socket, a switch, a lamp
    out.push(ISO.tinted(ISO.T.green, ISO.wbox(P, [-128, -78], [84, 140], [0, 12], "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-124, -100], [114, 140], [12, 30], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-96, -84], [92, 106], [12, 19], "mid")) + ISO.tinted(ISO.T.steel, ISO.wbox(P, [-93, -87], [96, 102], [19, 24], "hi")));
    out.push(ISO.tinted(ISO.T.green, S(K.cylinder(-90, 124, 3.6, 12, 4, P, 16), { tone: "hi" })));
    return out.join("");
  }
  // (its leads are drawn as strokes, so audit.mjs reads the body as loose: it hangs on them)
  // the 150 Ω resistor (brown, green, brown, gold) lying from the + rail to the anode's strip, its leads in the holes
  function resistorSvg(P) {
    const y0 = 63.5, y1 = RAILN, yc = (y0 + y1) / 2, z = 20, F = yAx([AX, yc, z]), out = [];
    out.push(`<path d="${K.pathOf([[AX, y0, 0], [AX, y0, z], [AX, y1, z], [AX, y1, 0]].map((p) => K.iso(p, P)))}" fill="none" stroke="#7d8187" stroke-width="1.6" stroke-linejoin="round"/>`);
    out.push(ISO.tinted(ISO.T.wood, S(G.lathe([[-30, 0], [-30, 7], [-27, 9.6, 1], [-20, 9.6, 1], [-16, 8.2, 1], [16, 8.2, 1], [20, 9.6, 1], [27, 9.6, 1], [30, 7], [30, 0]], F, P, { steps: 32 }), { tone: "hi" })));
    for (const [s, c] of [[-22, "#7a4a24"], [-14, "#2c8a3a"], [-4, "#7a4a24"], [21, "#c9a85a"]]) out.push(`<path d="${K.pathOf([...G.arcPoints(F, s - 2, s < -18 || s > 18 ? 9.7 : 8.3, Math.PI * 0.2, Math.PI * 1.25, 14), ...G.arcPoints(F, s + 2, s < -18 || s > 18 ? 9.7 : 8.3, Math.PI * 1.25, Math.PI * 0.2, 14)].map((p) => K.iso(p, P)), true)}" fill="${c}" stroke="none"/>`);
    return out.join("");
  }
  // the black jumper: cathode strip to the − rail, an arch with stiff ends
  function jumperSvg(P) {
    const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([CX, 63.5 + (RAILP - 63.5) * u, 2 + 22 * Math.sin(Math.PI * u)]); }
    const d = K.pathOf([[CX, 63.5, 0], ...pts, [CX, RAILP, 0]].map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#111" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#3a3e44" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  // the legs: anode straight and long, cathode with its kink, both out of the flange into their holes
  function legsSvg(P) {
    return ISO.tinted(ISO.T.steel, ISO.wbox(P, [AX - 2.5, AX + 2.5], [LY - 2.5, LY + 2.5], [0, FL], "mid")) +
      `<path d="${K.pathOf([[CX, LY, 0], [CX, LY, 40], [CX - 8, LY, 52], [CX, LY, 64], [CX, LY, FL]].map((p) => K.iso(p, P)))}" fill="none" stroke="#7d8187" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
  function flangeSvg(P, c, on) {
    const ring = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI * 0.84 + (i / 40) * Math.PI * 1.68; ring.push([29 * Math.cos(a), 29 * Math.sin(a)]); }
    return ISO.tinted(on ? COL[c].on : COL[c].tint, S(G.prismOf(zAx([0, LY, 0]), ring.map(([x, y]) => [x, y]), FL, LZ, P), { tone: "mid" }));
  }
  function lensSvg(P, c, on) {
    return ISO.tinted(on ? COL[c].on : COL[c].tint, S(G.lathe([[LZ, 0], [LZ, 24.6], [158, 24.6], [174, 22, 1], [186, 15.6, 1], [193, 7.6, 1], [195.4, 0]], zAx([0, LY, 0]), P, { steps: 56 }), { tone: "mid" }));
  }
  // inside the epoxy, seen through it: the anvil and cup (cathode), the post (anode), the die, the bond wire.
  // audit.mjs reports these as sunk in the lens: they are cast inside it.
  function insideSvg(P, c, on) {
    const out = [], fade = (svg) => `<g opacity=".82">${svg}</g>`;
    out.push(fade(ISO.tinted(ISO.T.steel, ISO.wbox(P, [CX - 2.5, CX + 2.5], [LY - 2.5, LY + 2.5], [LZ, 128], "mid") + ISO.wbox(P, [-22, -2], [LY - 2.5, LY + 2.5], [128, 146], "mid"))));
    out.push(fade(ISO.tinted(ISO.T.steel, S(G.lathe([[146, 0], [146, 3.4], [152, 6.6], [152, 5.4], [147.6, 2.6], [147.6, 0]], zAx([-9, LY, 0]), P, { steps: 28 }), { tone: "mid" }))));
    out.push(fade(ISO.tinted(ISO.T.steel, ISO.wbox(P, [AX - 2.5, AX + 2.5], [LY - 2.5, LY + 2.5], [LZ, 140], "mid") + ISO.wbox(P, [AX - 4, AX + 4], [LY - 2.5, LY + 2.5], [140, 148], "mid"))));
    const die = on ? ISO.tint("#ffffff", ["#ffffff", "#ffffff", "#ffffff", "#ffffff"], COL[c].light) : ISO.tint("#d8d4c8", ["#8a8678", "#9a9688", "#aaa698", "#bab6a8"], "#3a382f");
    out.push(ISO.tinted(die, ISO.wbox(P, [-11, -7], [LY - 2, LY + 2], [147.6, 150.6], "hi")));
    const bw = []; for (let i = 0; i <= 14; i++) { const u = i / 14; bw.push(K.iso([-9 + (AX + 9) * u, LY, 150.6 + (148 - 150.6) * u + 12 * Math.sin(Math.PI * u)], P)); }
    out.push(`<path d="${K.pathOf(bw)}" fill="none" stroke="#c9a85a" stroke-width=".8"/>`);
    return out.join("");
  }
  function glowSvg(P, c, amt, id) {
    if (amt < 0.02) return "";
    const p = K.iso([-9, LY, 152], P), k = K.cameraOf(P).k, col = COL[c].light;
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#ffffff" stop-opacity="${(0.95 * amt).toFixed(2)}"/><stop offset=".18" stop-color="${col}" stop-opacity="${(0.7 * amt).toFixed(2)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${p[0].toFixed(1)}" cy="${(p[1] - 10 * k).toFixed(1)}" rx="${(46 * k).toFixed(1)}" ry="${(56 * k).toFixed(1)}" fill="url(#${id})"/>`;
  }
  let uid = 0;

  ISO.add({
    name: "led", title: "LED on a breadboard", compare: "led 480 270 320 c=green",
    about: "A 5 mm LED on a breadboard with its resistor: current through the tiny chip inside makes light of one colour; each colour needs its own voltage, so the current changes.",
    line: "led cx cy height c=red|green|blue|yellow k=on|off lab=1 lit=lens|die|anode|cathode|resistor|power",
    demo: { line: "led 480 270 340 c=red k=off", script: [{ set: {}, hold: 1.2 }, { set: { k: "on" }, hold: "settle" }, { set: { c: "blue" }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.1, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -BZ, 0), [0, LY, 250], [-30, LY, 160], [30, LY, 160]], cx, cy, W, H, { azimuth: 38, elevation: 28 }, parent);
      const id = ++uid;
      g.innerHTML = `<g>${boardSvg(P)}</g><g data-name="power"></g><g data-name="resistor">${resistorSvg(P)}</g><g data-name="cathode">${jumperSvg(P)}</g>
        <g data-name="anode">${legsSvg(P)}</g><g data-part="flange"></g><g data-name="lens"></g><g data-name="die"></g><g data-part="glow"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { flange: q("flange"), lens: q("lens"), die: q("die"), glow: q("glow"), words: q("words") }, w = ISO.writer();
      const s = { c: COL[o.c] ? o.c : "red", on: o.k === "on", amt: o.k === "on" ? 1 : 0 };
      let lit = o.lit || "";
      const bright = () => amps(s.c) / 0.02;
      const draw = () => {
        const aq = Math.round(s.amt * 30) / 30, on = aq > 0.3;
        w.rebuild(el.flange, `${s.c} ${on}`, () => flangeSvg(P, s.c, on));
        w.rebuild(el.lens, `${s.c} ${on}`, () => lensSvg(P, s.c, on));
        w.rebuild(el.die, `${s.c} ${on}`, () => insideSvg(P, s.c, on));
        w.rebuild(el.glow, `${s.c} ${aq}`, () => glowSvg(P, s.c, aq * Math.min(1, 0.45 + 0.55 * bright()), `ledglow${id}`));
        w.rebuild(el.words, lab ? `${s.c} ${on}` : "", () => !lab ? "" : [
          ISO.word(K.iso([34, LY, 196], P), on ? `${s.c} light from the chip` : "epoxy lens", on ? "#333" : "#444", { size: 14, anchor: "start" }),
          ISO.word(K.iso([-28, LY, 150], P), "chip in its cup", "#444", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso([AX + 4, LY, 60], P), "long leg +", "#c0392b", { size: 13, anchor: "start" }),
          ISO.word(K.iso([CX - 10, LY, 48], P), "short leg −", "#2f5fbf", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso([AX + 12, 109, 24], P), "150 Ω resistor", "#6b4a1c", { size: 13, anchor: "start", dy: 10 }),
          ISO.word(K.iso([-103, 140, 0], P), "5 V power", "#2c6a22", { size: 13, anchor: "middle", dy: 20 })].join(""));
        w.light(["lens", "die", "anode", "cathode", "resistor", "power"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.c && COL[p.c]) s.c = p.c;
        if (p.k !== undefined) s.on = p.k === "on";
        if (p.lit !== undefined) lit = p.lit;
      };
      // an LED lights in nanoseconds; the eased glow just lets the eye follow the change
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.amt = ISO.follow(s.amt, target, dt, 0.08, ISO.still()); if (Math.abs(s.amt - target) < 0.01) s.amt = target;
        draw();
        return s.amt !== target;
      };
      g.readout = () => !s.on ? `${s.c} LED · off · it needs about ${COL[s.c].vf.toFixed(1)} V across it before current flows`
        : `${s.c} LED · ${COL[s.c].vf.toFixed(1)} V across it · ${(amps(s.c) * 1000).toFixed(1)} mA = (5 V − ${COL[s.c].vf.toFixed(1)} V) ÷ 150 Ω · electrons drop into holes in the chip and give off ${s.c} light`;
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
