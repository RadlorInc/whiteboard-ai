// "bulbholder cx cy k on=0..1 lab=0 lit=holder|bulb|terminals" — a PART (PARTS.md): an MES torch bulb (2.5 V 0.3 A,
// E10 screw base, an 11.5 mm glass ball) screwed into a black batten holder on a small wooden base, its origin the
// surface point under the base's middle. The holder's flange is screwed down; two brass strips run from it to two
// terminal posts (washer, hex nut, knurled cap), anchors a (left) and b (right), where a crocodile clip bites. Inside
// the glass: two lead-in wires held by a glass bead and the coiled filament between them. on = brightness 0..1: the
// filament heats from dull red to white and the glass glows (SVG). set({ on }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const BASE = { x: -36, y: -22, w: 72, d: 44, r: 3 }, BH = 10, TX = 25, TY = 7, SOCK = BH + 9, GL = 25.5, FZ = 32.6;
  const THREAD = (() => { const p = [[SOCK, 4.6]]; for (let s = SOCK; s < GL - 1.9; s += 1.8) p.push([s + 0.45, 5, 1], [s + 0.9, 5.05, 1], [s + 1.35, 5, 1], [s + 1.8, 4.6, 1]); p.push([GL - 0.6, 4.8], [GL, 4.6]); return p; })();
  const GLASS = [[GL, 0], [GL, 4.2], [GL + 1.2, 4.5, 1], [GL + 3.5, 5.5, 1], [GL + 7, 5.75, 1], [GL + 10.5, 5, 1], [GL + 12.8, 3, 1], [GL + 13.8, 0]];
  // the filament's colour from cold grey through dull red and orange to white hot
  const hotOf = (b) => b < 0.03 ? "#5a5048" : `rgb(255,${Math.round(70 + 180 * b)},${Math.round(20 + 200 * b * b)})`;
  let uid = 0;

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, 0, BH, P)}"/>`];
    out.push(ISO.tinted(ISO.T.wood, S(K.slabOf(BASE, 0, BH, P, 6, 1), { tone: "mid" })));
    // the grain on its top, printed lines that end on the base's edges
    const grain = [-14, -5, 6, 15].map((y, i) => K.lineOnTop([BASE.x + 1 + i * 0.5, y], [BASE.x + BASE.w - 1 - i, y + 1.2], BH, P)).join("");
    out.push(L(grain, { tone: "faint", free: true }));
    // a paper label on the front edge: what the bulb is rated
    out.push(`<path d="${K.pathOf([[-14, 22.05, 2.5], [14, 22.05, 2.5], [14, 22.05, 7.5], [-14, 22.05, 7.5]].map((p) => K.iso(p, P)), true)}" fill="#fbf7ec" stroke="#8a7a5a" stroke-width=".5"/>`);
    out.push(LAB.faceText(P, [0, 22.1, 3.6], [1, 0, 0], "2.5 V 0.3 A", 3.6, "#3d4a5a"));
    // brass strips from each terminal in under the holder's flange
    out.push(`<g data-name="terminals">${CIRC.strip(P, [-TX, TY], [-11, TY], BH, 5)}${CIRC.strip(P, [11, TY], [TX, TY], BH, 5)}</g>`);
    return out.join("");
  }
  const post = (P, x) => CIRC.post(P, [x, TY, BH + 0.04], { r: 4.2, h: 9.5 });
  function holderSvg(P) {
    const F = zAx([0, 0, BH + 0.04]), out = [];
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[0, 0], [0, 15], [1.6, 15], [1.6, 12.5], [6, 12.5], [6.9, 12.2], [7.6, 11.6], [8.3, 10.6], [9, 9], [9, 0]], F, P, { steps: 48 }), { tone: "mid", inner: L(G.arcOf(F, 1.6, 15, P), { tone: "faint" }) })));
    // the flange's two screws, and the brass collar round the socket's mouth
    for (const y of [-13.7, 13.7]) out.push(CIRC.screw(P, [0, y, BH + 1.64], 1.2, 0.3));
    out.push(ISO.tinted(ISO.T.brass, S(G.ringBand(9, 9.6, 5.3, 6.6, F, P), { tone: "mid" })));
    out.push(`<path d="${G.circleOf(F, 9.62, 5.3, P, 32)}" fill="#1b1d20"/>`);
    return out.join("");
  }
  function bulbSvg(P, id) {
    const F = zAx([0, 0, 0]), out = [];
    out.push(ISO.tinted(ISO.T.brass, S(G.lathe([[SOCK, 0], ...THREAD, [GL, 0]], F, P, { steps: 32, smooth: false }), { tone: "hi" })));
    out.push(`<g data-part="tint" style="${ISO.T.glass}">${S(G.lathe(GLASS, F, P, { steps: 40 }), { tone: "mid" })}</g>`);
    // seen through the glass: the lead-ins, the glass bead that holds them apart, the coil between their tips
    const W = (pts, c, w) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    const lw = Math.max(0.6, G.scaleOf(P) * 0.35);
    out.push(W([[-1.2, 0, GL + 0.5], [-2.4, 0, GL + 3], [-2.6, 0, FZ]], "#6b5a3a", lw), W([[1.2, 0, GL + 0.5], [2.4, 0, GL + 3], [2.6, 0, FZ]], "#6b5a3a", lw));
    out.push(ISO.tinted(ISO.T.glass, S(G.sphereOf([0, 0, GL + 3.2], 1.2, P, { steps: 20 }), { tone: "lo" })));
    const coil = [];
    for (let i = 0; i <= 90; i++) { const u = i / 90, a = u * Math.PI * 2 * 9; coil.push(K.iso([-2.6 + 5.2 * u, 0.45 * Math.cos(a), FZ + 0.45 * Math.sin(a) + 0.5 * Math.sin(Math.PI * u)], P)); }
    const cd = K.pathOf(coil), cw = Math.max(0.6, G.scaleOf(P) * 0.22);
    out.push(`<path data-part="coil" d="${cd}" fill="none" stroke="#5a5048" stroke-width="${cw.toFixed(2)}" stroke-linejoin="round"/>`);
    out.push(`<path data-part="core" d="${cd}" fill="none" stroke="#fffdf2" stroke-width="${(cw * 0.4).toFixed(2)}" stroke-linejoin="round" opacity="0"/>`);
    // the glow over the glass, built once; its opacity follows the brightness
    const c = K.iso([0, 0, FZ], P), r = G.scaleOf(P) * 13;
    out.push(`<g data-part="glow" opacity="0"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".3" stop-color="#ffe7a0" stop-opacity=".6"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id})"/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "bulbholder", title: "Bulb in a holder (part)", compare: null,
    about: "An MES torch bulb (2.5 V 0.3 A) screwed into a batten holder on a small wooden base, two terminal posts wired to it; on = brightness 0..1, the filament glows from dull red to white. anchors: a b",
    line: "bulbholder cx cy k on=0..1 lab=0 lit=holder|bulb|terminals",
    demo: { line: "bulbholder 480 330 58", script: [{ set: {}, hold: 1 }, { set: { on: 0.35 }, hold: "settle" }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0, lit: "terminals" }, hold: "settle" }, { set: { lit: "bulb" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = `bhglow${++uid}`;
      const a = post(Pm, -TX), b = post(Pm, TX);
      g.innerHTML = baseSvg(Pm) + `<g data-name="terminals">${a.svg}</g><g data-name="holder">${holderSvg(Pm)}</g><g data-name="bulb"></g><g data-name="terminals">${b.svg}</g>` +
        (lab ? CIRC.word(P, [3.6, 0, 4], "bulb in a holder") : "");
      g.anchors = { a: a.top.map((v) => v / 10), b: b.top.map((v) => v / 10) };
      const q = (n) => g.querySelector(`[data-part="${n}"]`), w = ISO.writer();
      let el = null, light = CIRC.lighter(g);
      const s = { on: ISO.clamp(ISO.num(o, "on", 0), 0, 1), b: 0 };
      s.b = s.on;
      let lit = o.lit || "";
      const draw = () => {
        light(lit);
        if (!el) return;
        const b = Math.round(s.b * 100) / 100;
        w.attr(el.tint, "style", b > 0.45 ? ISO.T.amber : ISO.T.glass);
        w.attr(el.coil, "stroke", hotOf(b));
        w.attr(el.core, "opacity", ISO.smooth(0.55, 1, b).toFixed(2));
        w.attr(el.glow, "opacity", ISO.smooth(0.08, 1, b).toFixed(2));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = ISO.clamp(+p.on, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      // a thin filament heats and cools in about a tenth of a second
      g.update = (dt) => { s.b = ISO.follow(s.b, s.on, dt, 0.1, ISO.still()); if (Math.abs(s.b - s.on) < 0.005) s.b = s.on; draw(); return s.b !== s.on; };
      g.readout = () => (s.on > 0.01 ? `MES bulb lit at ${Math.round(s.on * 100)} % · rated 2.5 V 0.3 A (about 0.75 W)` : "MES bulb off · 2.5 V 0.3 A, E10 screw base");
      draw();
      // the bulb (smooth glass, thread, filament) in a second slice of the build budget
      ISO.later(() => {
        const bulb = g.querySelector('[data-name="bulb"]');
        bulb.innerHTML = bulbSvg(Pm, id); bulb._fresh = true;   // so a lit bulb lights its new solids too
        el = { tint: q("tint"), coil: q("coil"), core: q("core"), glow: q("glow") }; light = CIRC.lighter(g);
        draw();
      });
      return g;
    },
  });
})();
