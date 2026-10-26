// "pressuregauge cx cy k bar=0..10 lab=0 lit=case|dial|needle|stem" — a PART (PARTS.md, batch 5): a Bourdon-tube
// pressure gauge, 10 cm across and 4 cm deep, its dial facing +y, screwed in by its brass stem pointing down. Origin
// = the end of the stem's thread (the working tip: where it screws into a tee, a tank or a cylinder's foot).
// A steel case with a rolled bezel, a white dial 0–10 bar (a tick every 0.2, numbers every 1, a red band from 8 to the
// end), a red needle on a brass hub, a domed glass with a glare; below it a brass neck, a 14 mm hex and the thread.
// The needle follows bar on a damped spring, as a real movement does (a small overshoot). gauge.js's dial, real size.
// Built in mm (ISO.mm); anchors in cm. set({ bar }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 50, ZC = 80, MAX = 10, SD = 8.05;                 // case radius, case centre height, full scale, dial plane
  const F = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const ang = (f) => Math.PI / 2 - ((-135 + 270 * f) * Math.PI) / 180;   // 0 at bottom left, clockwise through the top
  const on = (r, a, s = SD) => G.pointOf(F, s, r, a);
  const WHITE = ISO.tint("#fbfbf7", ["#d9d9d2", "#e3e3dc", "#ecece6", "#f4f4ef"], "#55575c");

  function bodySvg(P) {
    const out = [];
    // the stem: thread, hex, neck up into the case's bottom boss
    const thread = [];
    for (let z = 2; z < 12; z += 1.6) thread.push(K.sideArc(0, 0, 6.5, z, P, 16));
    out.push(`<g data-name="stem">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 6.5, 0, 12, P, 20, 0.6), { tone: "mid", crease: "none", inner: L(thread.join(""), { tone: "lo" }) }) +
      S(K.cylinder(0, 0, 9, 12, 10, P, 6, 0.6), { tone: "hi" }) + S(K.cylinder(0, 0, 5, 22, ZC - R - 18, P, 18), { tone: "mid", crease: "none" }) +
      S(K.cylinder(0, 0, 8, ZC - R - 4, 6, P, 24, 0.8), { tone: "mid" }))}</g>`);
    // the case: a deep steel can, its back seam, the rolled bezel and the dial inside it
    out.push(`<g data-name="case">${ISO.tinted(ISO.T.steel, S(G.disc(-26, 8, R, F, P), { tone: "hi", inner: L(G.arcOf(F, -20, R, P), { tone: "faint" }) }) + S(G.ringBand(8, 13, R - 5, R + 1.2, F, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }
  function dialSvg(P, lab) {
    const out = [ISO.tinted(WHITE, S(G.disc(7.4, 8, R - 5, F, P), { tone: "hi" }))];
    const rr = R - 9;
    // the red band 8 → 10 bar, inside the scale arc
    const red = []; for (let i = 0; i <= 20; i++) red.push(K.iso(on(rr - 1.8, ang(0.8 + 0.2 * (i / 20))), P));
    out.push(`<path d="${K.pathOf(red)}" fill="none" stroke="#d63e2a" stroke-width="${(G.scaleOf(P) * 3.2).toFixed(2)}" stroke-linecap="butt"/>`);
    const arc = Array.from({ length: 61 }, (_, i) => K.iso(on(rr, ang(i / 60)), P)), minor = [], major = [];
    out.push(L(K.pathOf(arc), { tone: "lo" }), K.dotsSvg([arc[0], arc[60]], { size: 0.6, tone: "lo" }));
    for (let i = 0; i <= 50; i++) { const a = ang(i / 50), big = i % 5 === 0; (big ? major : minor).push(K.segment(on(rr, a), on(rr - (big ? 5.5 : 3), a), P)); }
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    const txt = (p, s, size, c = "#2a2b2f") => LAB.faceText(P, p, [1, 0, 0], s, size, c);
    for (let v = 0; v <= MAX; v++) { const p = on(rr - 11.5, ang(v / MAX)); out.push(txt([p[0], p[1] + 0.05, p[2] - 2.4], String(v), 6.4)); }
    out.push(txt(on(13, -Math.PI / 2, SD + 0.05), "bar", 6, "#3c3f45"), txt(on(21, -Math.PI / 2, SD + 0.05), "class 1.6", 3.4, "#6a6c70"), txt(on(16, Math.PI / 2, SD + 0.05), "Bourdon", 3.4, "#6a6c70"));
    if (lab) out.push(CIRC.word(P, [R / 10 + 0.4, 0, (ZC + R) / 10], "pressure gauge"));
    return out.join("");
  }
  function needleSvg(P, f) {
    const a = ang(ISO.clamp(f, -0.01, 1.02)), s = SD + 1, tip = on(R - 10, a, s), tail = on(9, a + Math.PI, s), side = (d) => on(1.8, a + d, s);
    return `<path d="${K.pathOf([tail, side(Math.PI / 2), tip, side(-Math.PI / 2)].map((p) => K.iso(p, P)), true)}" fill="#d63e2a" stroke="#7a1f1f" stroke-width="0.6" stroke-linejoin="round"/>` +
      ISO.tinted(ISO.T.brass, S(G.disc(s, s + 1.6, 3.6, F, P), { tone: "mid" }));
  }
  // the domed glass (see-through) and its glare
  const glass = (P) => `<g class="pg-glass" style="${ISO.T.glass}">${S(G.solidOf([[12, R - 5], [13.6, R - 14, 1], [14.4, 0]], F, P), { tone: "hi" })}</g>` +
    `<path d="${K.pathOf(Array.from({ length: 9 }, (_, i) => K.iso(G.pointOf(F, 13.2, R - 9, 2.0 + i * 0.07), P)))}" fill="none" stroke="#fff" stroke-width="${(G.scaleOf(P) * 2.4).toFixed(2)}" stroke-linecap="round" opacity=".7"/>`;

  ISO.add({
    name: "pressuregauge", title: "Pressure gauge (part)", compare: null,
    about: "A Bourdon-tube pressure gauge 0–10 bar, 10 cm across: steel case, white dial with a red band from 8 bar, a needle that swings to the reading and settles, a brass stem and hex below that screws into a tee or a cylinder. anchors: none",
    line: "pressuregauge cx cy k bar=0..10 lab=0 lit=case|dial|needle|stem",
    demo: { line: "pressuregauge 480 445 34 bar=0", script: [{ set: {}, hold: 1 }, { set: { bar: 4 }, hold: "settle" }, { set: { bar: 9, lit: "needle" }, hold: "settle" }, { set: { bar: 2, lit: "stem" }, hold: "settle" }, { set: { lit: "case" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const style = `<style>.pg-glass .iso-fill{fill-opacity:.1}.pg-glass .iso-shade,.pg-glass .iso-top{opacity:.22}</style>`;
      g.innerHTML = style + bodySvg(Pm) + `<g data-name="dial">${dialSvg(Pm, lab)}</g><g data-name="needle"></g>${glass(Pm)}`;
      const el = g.querySelector('[data-name="needle"]'), w = ISO.writer(), light = CIRC.lighter(g);
      const s = { f: ISO.clamp(ISO.num(o, "bar", 0), 0, MAX) / MAX, v: 0 };
      s.to = s.f;
      let lit = o.lit || "";
      const draw = () => { w.rebuild(el, s.f.toFixed(4), () => needleSvg(Pm, s.f)); light(lit); };
      g.set = (p) => {
        if (p.bar !== undefined && Number.isFinite(+p.bar)) s.to = ISO.clamp(+p.bar, 0, MAX) / MAX;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (ISO.still() || dt > 1) { s.f = s.to; s.v = 0; }
        else for (let i = 0; i < 4; i++) { const h = dt / 4; s.v += (60 * (s.to - s.f) - 9 * s.v) * h; s.f += s.v * h; }   // ζ ≈ 0.58: a small overshoot
        if (Math.abs(s.f - s.to) < 5e-4 && Math.abs(s.v) < 5e-3) { s.f = s.to; s.v = 0; }
        draw();
        return s.f !== s.to;
      };
      g.readout = () => { const v = s.f * MAX; return `${v.toFixed(1)} bar = ${(v * 100).toFixed(0)} kPa ≈ ${(v * 14.5).toFixed(0)} psi above atmospheric${v > 8 ? " · in the red: over the safe limit" : ""}`; };
      draw();
      return g;
    },
  });
})();
