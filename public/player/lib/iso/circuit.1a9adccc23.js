// "circuit cx cy width k=closed|open cells=2 lab=1" — a simple circuit on a kit board; also "cell", "switch",
// "resistor" (each component on its own small board). Two 1.5 V cells in a holder, a knife switch, a 2.5 V bulb in a
// holder, a 1 Ω resistor and an ammeter, wired in one loop. Closed: I = V / R = 3 V / (5 Ω bulb + 1 Ω) = 0.5 A, the
// ammeter needle reads it, current marches along the wires and the bulb glows; open: no current anywhere.
// set({ k: "closed"|"open", cells }) switches it or changes the cells.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const BULB_R = 5, RES = 1;

  // ── components, each drawn at its own origin [x, y] on the board top (z = 0); `pins` are where wires land.
  function cellHolder(P, [x, y], cells) {
    const out = [ISO.wbox(P, [x - 30, x + 30], [y - 9, y + 9], [0, 3], "mid")];
    for (const e of [x - 30, x + 26]) out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [e, e + 4], [y - 6, y + 6], [3, 14], "hi")));
    for (let i = 0; i < cells; i++) {
      const cx0 = x - 26 + i * (52 / cells), len = 52 / cells - 2, F = xAx([cx0, y, 9]);
      out.push(ISO.tinted(ISO.T.copper, S(G.disc(0, len * 0.15, 5, F, P), { tone: "hi" })), S(G.disc(len * 0.15, len - 1, 5, F, P), { tone: "hi" }), S(G.disc(len - 1, len, 2, F, P), { tone: "mid" }));
      out.push(L(G.arcOf(F, len * 0.15, 5, P), { tone: "lo" }));
    }
    return { svg: out.join(""), pins: { neg: [x - 28, y, 14], pos: [x + 28, y, 14] } };
  }
  function knifeSwitch(P, [x, y], open) {
    const out = [ISO.wbox(P, [x - 18, x + 18], [y - 8, y + 8], [0, 4], "mid")];
    out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [x - 15, x - 9], [y - 3, y + 3], [4, 12], "hi") + ISO.wbox(P, [x + 9, x + 15], [y - 3.5, y - 1.5], [4, 11], "hi") + ISO.wbox(P, [x + 9, x + 15], [y + 1.5, y + 3.5], [4, 11], "hi")));
    // The blade hinges at the left post and swings up when open.
    const a = open * 1.0, at = (u, w, yy) => [x - 12 + u * Math.cos(a) - w * Math.sin(a), yy, 10 + u * Math.sin(a) + w * Math.cos(a)];
    out.push(ISO.tinted(ISO.T.copper, ISO.box(at, P, [0, 25], [-0.8, 0.8], [y - 1.2, y + 1.2], "hi", true)));
    out.push(S(G.disc(-1, 1, 2.4, G.frameOf(at(25, 0, y), [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi", lit: true }));
    out.push(D([K.iso([x - 12, y + 3.1, 10], P)], { size: 0.7, tone: "hi" }));
    return { svg: out.join(""), pins: { a: [x - 12, y - 3, 6], b: [x + 12, y - 3.5, 6] } };
  }
  function bulbHolder(P, [x, y], on) {
    const out = [ISO.wbox(P, [x - 12, x + 12], [y - 10, y + 10], [0, 4], "mid")];
    for (const e of [x - 10, x + 6]) out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [e, e + 4], [y + 4, y + 8], [4, 7], "hi")));
    out.push(S(K.cylinder(x, y, 5, 4, 6, P, 28, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 3.4, 10, 5, P, 24), { tone: "hi" }) + L(K.knurl(x, y, 3.4, 10.4, 14.6, 10, P), { tone: "lo" })));
    const c = [x, y, 15 + BULB_R + 2];
    if (on > 0.01) out.push(`<circle cx="${K.iso(c, P)[0]}" cy="${K.iso(c, P)[1]}" r="${(16 * on).toFixed(1)}" fill="url(#bulbglow)" opacity="${on.toFixed(2)}"/>`);
    out.push(ISO.tinted(on > 0.5 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf(c, BULB_R + 1.5, P), { tone: "hi" })));
    out.push(`<path d="${K.pathOf([[x - 1.6, y, 16], [x - 1.6, y, c[2] - 1], [x - 0.6, y, c[2] + 1], [x + 0.6, y, c[2] - 1], [x + 1.6, y, c[2] + 1], [x + 1.6, y, 16]].map((p) => K.iso([p[0], p[1] + 1, p[2]], P)))}" fill="none" stroke="${on > 0.3 ? "#c45a00" : "#55575c"}" stroke-width="${on > 0.3 ? 1.2 : 0.7}"/>`);
    return { svg: out.join(""), pins: { a: [x - 8, y + 6, 7], b: [x + 8, y + 6, 7] } };
  }
  function resistor(P, [x, y]) {
    const out = [ISO.wbox(P, [x - 16, x + 16], [y - 7, y + 7], [0, 3], "mid")];
    for (const e of [x - 15, x + 11]) out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [e, e + 4], [y - 3, y + 3], [3, 8], "hi")));
    const F = xAx([x - 11, y, 7]);
    out.push(S(G.disc(0, 22, 0.5, F, P), { tone: "mid" }), ISO.tinted(ISO.tint("#f2e2c4", ["#c9ae7d", "#d6bd90", "#e2cca5", "#ecd8b6"], "#6e5530"), S(G.disc(5, 17, 2.6, F, P), { tone: "hi" })));
    // Colour bands for 1 Ω: brown, black, gold (multiplier), gold (5%).
    [["#7a4a1c", 7], ["#222", 9], ["#c9a640", 11.6], ["#c9a640", 14.6]].forEach(([c, s]) => out.push(`<path d="${G.arcOf(F, s, 2.65, P)}" stroke="${c}" stroke-width="1.6" fill="none"/>`));
    return { svg: out.join(""), pins: { a: [x - 13, y, 8], b: [x + 13, y, 8] } };
  }
  function ammeter(P, [x, y], amps) {
    const out = [ISO.wbox(P, [x - 15, x + 15], [y - 10, y + 10], [0, 18], "mid")];
    // The dial in the front face (y + 10): an arc 0–1 A with ticks hanging from it and the needle.
    const c = [x, y + 10.05, 5], rr = 9, arc = [], minor = [], major = [];
    for (let d = -50; d <= 50; d += 2) arc.push(K.iso([c[0] + Math.sin((d * Math.PI) / 180) * rr, c[1], c[2] + Math.cos((d * Math.PI) / 180) * rr], P));
    out.push(`<path d="${K.pathOf([[x - 12, y + 10.05, 2], [x + 12, y + 10.05, 2], [x + 12, y + 10.05, 16], [x - 12, y + 10.05, 16]].map((p) => K.iso(p, P)), true)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.6"/>`);
    for (let i = 0; i <= 10; i++) { const d = -50 + i * 10, p0 = [c[0] + Math.sin((d * Math.PI) / 180) * rr, c[1], c[2] + Math.cos((d * Math.PI) / 180) * rr], p1 = [c[0] + Math.sin((d * Math.PI) / 180) * (rr + (i % 5 ? 1.6 : 2.6)), c[1], c[2] + Math.cos((d * Math.PI) / 180) * (rr + (i % 5 ? 1.6 : 2.6))]; (i % 5 ? minor : major).push(K.segment(p0, p1, P)); }
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    const d = ((-50 + ISO.clamp(amps, 0, 1) * 100) * Math.PI) / 180;
    out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, [c[0] + Math.sin(d) * (rr + 1), c[1], c[2] + Math.cos(d) * (rr + 1)], P)}" style="stroke-width:1.2"/>`, D([K.iso(c, P)], { size: 0.8, tone: "hi" }));
    for (const e of [x - 11, x + 7]) out.push(ISO.tinted(e < x ? ISO.T.plastic : ISO.T.red, S(K.cylinder(e + 2, y - 4, 2.4, 18, 3, P, 18), { tone: "hi" })));
    return { svg: out.join(""), pins: { a: [x - 9, y - 4, 21], b: [x + 9, y - 4, 21] } };
  }
  // A wire: a red or black lead along waypoints at its own height, with a terminal dot at each end.
  const wire = (P, pts, color) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#1d1f22" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path class="cx-flow" d="${d}" fill="none" stroke="#ffe08a" stroke-width="1" stroke-linecap="round"/>` + D([K.iso(pts[0], P), K.iso(pts[pts.length - 1], P)], { size: 1, tone: "hi" });
  };

  const BOARD = { x: -110, y: -60, w: 220, d: 120, r: 6 };
  const AT = { cell: [-50, -30], sw: [-60, 30], bulb: [55, -30], res: [5, 34], amp: [65, 30] };
  // The wires between the components' pins, and the words; the components themselves are drawn one by one.
  function wiresSvg(P, pins) {
    const { cell: c, bulb: b, ammeter: a, resistor: r, switch: s } = pins, lift = (p, h = 0) => [p[0], p[1], p[2] + h];
    return [
      wire(P, [c.pos, lift(c.pos, 6), [b.a[0], c.pos[1], c.pos[2] + 6], lift(b.a, 3), b.a], "#c0392b"),
      wire(P, [b.b, lift(b.b, 3), [a.b[0], b.b[1], 10], [a.b[0], a.b[1], 24], a.b], "#c0392b"),
      wire(P, [a.a, [a.a[0], a.a[1], 24], [r.b[0], r.b[1], 12], r.b], "#1d1f22"),
      wire(P, [r.a, [r.a[0], r.a[1], 12], [s.b[0], s.b[1], 10], s.b], "#1d1f22"),
      wire(P, [s.a, [s.a[0], s.a[1], 10], [c.neg[0], c.neg[1] + 10, 18], c.neg], "#1d1f22"),
    ].join("");
  }
  function wordsSvg(P, st) {
    return [
      ISO.word(K.iso([AT.cell[0], AT.cell[1], 18], P), `${st.cells} × 1.5 V cells`, "#555", { size: 13, dy: -6 }),
      ISO.word(K.iso([AT.bulb[0], AT.bulb[1], 30], P), "bulb", "#555", { size: 13, dy: -6 }),
      ISO.word(K.iso([AT.sw[0], AT.sw[1] + 10, 0], P), st.closed ? "switch closed" : "switch open", "#555", { size: 13, dy: 16 }),
      ISO.word(K.iso([AT.res[0], AT.res[1] + 8, 0], P), "1 Ω resistor", "#555", { size: 13, dy: 16 }),
      ISO.word(K.iso([AT.amp[0], AT.amp[1] + 10, 0], P), `ammeter ${st.needle.toFixed(2)} A`, "#c0392b", { size: 13, dy: 16 }),
    ].join("");
  }

  const defs = `<defs><radialGradient id="bulbglow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd84a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient></defs>`;
  const style = `<style>.cx-wires .cx-flow{stroke-dasharray:3 9;opacity:0}.cx-wires[data-on="1"] .cx-flow{opacity:1;animation:cx-flow .9s linear infinite}@keyframes cx-flow{to{stroke-dashoffset:-24}}@media (prefers-reduced-motion:reduce){.cx-wires .cx-flow{animation:none}}</style>`;

  const make = (only) => ([cx, cy, size = 440], o, t, parent) => {
    const lab = o.lab !== "0";
    const st = { closed: only ? true : o.k !== "open", cells: ISO.clamp(Math.round(ISO.num(o, "cells", 2)), 1, 3), open: 0, glow: 0, needle: 0 };
    st.open = st.closed ? 0 : 1;
    if (only) {
      // One component on its own small board.
      const W = size * 1.1, H = size * 0.7, B = { x: -40, y: -26, w: 80, d: 52, r: 5 };
      const { P, g } = ISO.frame([...K.boxCorners(B, -10, 0), [0, 0, 34]], cx, cy, W, H, { azimuth: 62, elevation: 28 }, parent);
      const c = only === "cell" ? cellHolder(P, [0, 0], st.cells) : only === "switch" ? knifeSwitch(P, [0, 0], o.k === "open" ? 1 : 0) : resistor(P, [0, 0]);
      g.innerHTML = defs + ISO.baseboard(P, B, { h: 5, feet: 3 }) + c.svg + (lab ? ISO.word(K.iso([0, 26, -6], P), only === "cell" ? `${st.cells} × 1.5 V = ${st.cells * 1.5} V` : only === "switch" ? (o.k === "open" ? "open: no current" : "closed: current flows") : "1 Ω: brown, black, gold, gold", "#555", { size: 14, dy: 18 }) : "");
      g.set = () => {}; g.update = () => false; g.readout = () => "";
      return g;
    }
    const W = size * 1.3, H = size * 0.85;
    const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, 40]], cx, cy, W, H, { azimuth: 58, elevation: 34 }, parent);
    const names = ["cell", "resistor", "ammeter", "bulb", "switch", "wires", "words"];
    g.innerHTML = defs + style + `<g>${ISO.baseboard(P, BOARD)}${ISO.plate(P, { x: -100, y: 40, w: 36, d: 12, r: 1 })}</g>` + names.map((n) => `<g data-name="${n}"${n === "wires" ? ' class="cx-wires"' : ""}></g>`).join("");
    const el = Object.fromEntries(names.map((n) => [n, g.querySelector(`[data-name="${n}"]`)])), w = ISO.writer();
    const amps = () => (st.closed ? (st.cells * 1.5) / (BULB_R + RES) : 0);
    const comp = {
      cell: () => cellHolder(P, AT.cell, st.cells), resistor: () => resistor(P, AT.res), ammeter: () => ammeter(P, AT.amp, st.needle),
      bulb: () => bulbHolder(P, AT.bulb, st.glow), switch: () => knifeSwitch(P, AT.sw, st.open),
    };
    const pins = Object.fromEntries(Object.entries(comp).map(([n, f]) => [n, f().pins]));
    const keyOf = { cell: () => st.cells, resistor: () => 1, ammeter: () => st.needle.toFixed(3), bulb: () => st.glow.toFixed(2), switch: () => st.open.toFixed(3), wires: () => 1, words: () => `${st.closed} ${st.cells} ${st.needle.toFixed(2)}` };
    const draw = () => {
      for (const n of names) w.rebuild(el[n], String(keyOf[n]()), () => (comp[n] ? comp[n]().svg : n === "wires" ? wiresSvg(P, pins) : lab ? wordsSvg(P, st) : ""));
      w.attr(el.wires, "data-on", st.closed && st.open < 0.05 ? "1" : "0");
    };
    g.set = (p) => { if (p.k) st.closed = p.k !== "open"; if (p.cells !== undefined) st.cells = ISO.clamp(Math.round(+p.cells), 1, 3); };
    g.update = (dt) => {
      const calm = ISO.still();
      st.open = ISO.follow(st.open, st.closed ? 0 : 1, dt, 0.18, calm);
      const live = st.closed && st.open < 0.05;
      st.needle = ISO.follow(st.needle, live ? amps() : 0, dt, 0.25, calm);
      st.glow = ISO.follow(st.glow, live ? ISO.clamp((st.cells * 1.5) / 3, 0, 1.3) : 0, dt, 0.12, calm);
      draw();
      return Math.abs(st.open - (st.closed ? 0 : 1)) > 0 || Math.abs(st.needle - (live ? amps() : 0)) > 0;
    };
    g.readout = () => (st.closed ? `I = V ÷ R = ${(st.cells * 1.5).toFixed(1)} V ÷ (${BULB_R} Ω bulb + ${RES} Ω) = ${amps().toFixed(2)} A · bulb lit` : "switch open · no current · bulb off");
    draw();
    if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
    return g;
  };
  ISO.add({ name: "circuit", title: "Simple circuit", compare: "circuit 480 280 440", about: "Cells, a knife switch, a bulb, a resistor and an ammeter wired in one loop: close it and 0.5 A flows.", line: "circuit cx cy width k=closed|open cells=2 lab=1", make: make(null),
    demo: { line: "circuit 480 280 440 k=open", script: [{ set: {}, hold: 1 }, { set: { k: "closed" }, hold: 3 }, { set: { cells: 3 }, hold: 3 }, { set: { k: "open" }, hold: 2 }] } });
  ISO.add({ name: "cell", title: "Cells in a holder", compare: "cell 480 270 300", about: "AA cells in a holder with brass end clips.", line: "cell cx cy length cells=2 lab=1", make: make("cell"), demo: { line: "cell 480 270 300", script: [{ set: {}, hold: 1 }] } });
  ISO.add({ name: "switch", title: "Knife switch", compare: "switch 480 260 260 k=open", about: "A knife switch: the copper blade drops into its clip to close the circuit.", line: "switch cx cy length k=open|closed lab=1", make: make("switch"), demo: { line: "switch 480 260 260 k=open", script: [{ set: {}, hold: 1 }] } });
  ISO.add({ name: "resistor", title: "Resistor", compare: "resistor 480 270 300", about: "A 1 Ω resistor on a mount, with its colour bands.", line: "resistor cx cy length lab=1", make: make("resistor"), demo: { line: "resistor 480 270 300", script: [{ set: {}, hold: 1 }] } });
})();
