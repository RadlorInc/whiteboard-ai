// "speedometer cx cy k kmh=0..120 lab=0 lit=case|dial|needle|bracket" — a PART (PARTS.md, batch 5): a car speedometer
// (gauge.js's k=speed, real size): a 10 cm black case 6 cm deep, its dial facing +y, held on a steel U-bracket that
// stands on a foot plate, its origin the bench point under the case. A rounded case back with a boss and the threaded
// nipple the drive cable screws onto (anchor cable, pointing −y), a bezel, a white-on-black dial 0–120 km/h (a tick
// every 5, numbers every 20, ticks hanging from the scale arc), the odometer window with six digit drums, a red needle
// on a hub, a domed glass with a glare. The needle swings to kmh on a damped spring (ζ ≈ 0.6: a small overshoot), as
// a real eddy-current movement does. set({ kmh }). Built in mm (ISO.mm); the anchor in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 49, ZC = 80, MAX = 120, SD = 6.65, BY = [-20, -14];
  const F = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const ang = (f) => Math.PI / 2 - ((-135 + 270 * f) * Math.PI) / 180;      // 0 at bottom left, clockwise through the top
  const face = (P, x, z, svg) => `<g transform="${ISO.faceMatrix(P, [x, SD + 0.05, z], 1)}">${svg}</g>`;
  const txt = (s, size, fill, w = 700) => `<text text-anchor="middle" y="${(size * 0.36).toFixed(2)}" fill="${fill}" style="font:${w} ${size}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;
  const BLACK = ISO.tint("#2a2d31", ["#15171a", "#1b1d21", "#212428", "#272a2e"], "#08090a");

  function bracketSvg(P, near) {
    const arm = (x0, x1) => ISO.wbox(P, [x0, x1], BY, [ZC - R - 10, ZC + 4], "mid");
    const nut = (sg) => ISO.tinted(ISO.T.steel, B15.hex(P, G.frameAlong([sg * (R + 5), (BY[0] + BY[1]) / 2, ZC], [sg, 0, 0]), 0, 4, 8) + S(G.disc(4, 6, 2.4, G.frameAlong([sg * (R + 5), (BY[0] + BY[1]) / 2, ZC], [sg, 0, 0]), P), { tone: "hi" }));
    if (near) return ISO.tinted(ISO.T.steel, arm(R + 1, R + 5)) + nut(1);
    return ISO.tinted(ISO.T.steel, ISO.wbox(P, [-30, 30], [-42, 8], [0, 4], "mid") + ISO.wbox(P, [-6, 6], BY, [4, ZC - R - 10], "mid") +
      ISO.wbox(P, [-R - 5, R + 5], BY, [ZC - R - 10, ZC - R - 6], "mid") + arm(-R - 5, -R - 1)) + nut(-1) +
      K.dotsSvg([[-22, 2, 4], [22, 2, 4], [-22, -34, 4], [22, -34, 4]].map((p) => K.iso(p, P)), { size: 0.6 });
  }
  function caseSvg(P) {
    const out = [];
    // the back: the threaded nipple and its boss, then the rounded case and the bezel
    out.push(ISO.tinted(ISO.T.brass, S(G.disc(-52, -40, 6.5, F, P), { tone: "mid", inner: L(G.ribsOf(F, -51, -41, 6.5, 8, P, { seams: true }), { tone: "lo" }) })));
    out.push(ISO.tinted(BLACK, B15.hex(P, F, -42, -36, 15) + S(G.disc(-36, -33, 12, F, P), { tone: "mid" })));
    out.push(ISO.tinted(BLACK, S(G.solidOf([[-34, 16], [-33, R - 12, 1], [-28, R - 3, 1], [-22, R], [6, R]], F, P), { tone: "hi", inner: L(G.arcOf(F, -12, R, P), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(6, 10, R - 4, R + 1, F, P), { tone: "hi" })));
    return out.join("");
  }
  function dialSvg(P) {
    const s = SD, rr = R - 8.5, minor = [], major = [], out = [];
    out.push(ISO.tinted(BLACK, S(G.disc(6, s, R - 4, F, P), { tone: "lo" })));
    const arc = Array.from({ length: 61 }, (_, i) => K.iso(G.pointOf(F, s + 0.05, rr, ang(i / 60)), P));
    out.push(`<path d="${K.pathOf(arc)}" fill="none" stroke="#f2f2ee" stroke-width="${(G.scaleOf(P) * 0.7).toFixed(2)}"/>`);
    for (let i = 0; i <= MAX / 5; i++) { const a = ang(i / (MAX / 5)), big = i % 4 === 0; (big ? major : minor).push(K.segment(G.pointOf(F, s + 0.05, rr, a), G.pointOf(F, s + 0.05, rr - (big ? 5.6 : 3), a), P)); }
    out.push(`<path d="${minor.join("")}" stroke="#d8d8d2" stroke-width="${(G.scaleOf(P) * 0.6).toFixed(2)}"/><path d="${major.join("")}" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 1.1).toFixed(2)}"/>`);
    for (let v = 0; v <= MAX; v += 20) { const p = G.pointOf(F, s, rr - 12.5, ang(v / MAX)); out.push(face(P, p[0], p[2], txt(v, 6.2, "#f4f4f0"))); }
    out.push(face(P, 0, ZC - 13, txt("km/h", 4.2, "#c9c9c2", 600)));
    // the odometer window: a recessed slot with six digit drums, the last one white on red
    const W2 = 14.6, H2 = 3.3, oz = ZC - 25, at = (x, z) => K.iso([x, s + 0.06, z], P);
    out.push(`<path d="${K.pathOf([at(-W2, oz - H2), at(W2, oz - H2), at(W2, oz + H2), at(-W2, oz + H2)], true)}" fill="#0d0e10" stroke="#6b6e74" stroke-width="${(G.scaleOf(P) * 0.5).toFixed(2)}"/>`);
    "042716".split("").forEach((dg, i) => {
      const x = -W2 + 2.45 + i * 4.85;
      if (i === 5) out.push(`<path d="${K.pathOf([at(x - 2.1, oz - H2), at(x + 2.1, oz - H2), at(x + 2.1, oz + H2), at(x - 2.1, oz + H2)], true)}" fill="#c0392b"/>`);
      out.push(face(P, x, oz, txt(dg, 4.6, "#f4f4f2")));
    });
    return out.join("");
  }
  // the needle, drawn flat on the dial plane with its point up (60 km/h), turned by a rotate
  function needleSvg(P) {
    const k = 1;
    return `<g transform="${ISO.faceMatrix(P, [0, SD + 0.75, ZC], k)}"><g data-part="turn"><path d="M-1.7 8 L-0.9 0 L-0.5 ${-(R - 12)} L0.5 ${-(R - 12)} L0.9 0 L1.7 8 Z" fill="#e0452e" stroke="#7a1f1f" stroke-width="0.4" stroke-linejoin="round"/></g>` +
      `<circle r="4.6" fill="#2a2d31" stroke="#0d0e10" stroke-width="0.5"/><circle cx="-1.2" cy="-1.2" r="1.3" fill="#7c828a"/></g>`;
  }
  const glass = (P) => `<g style="${ISO.T.glass}" class="sp-glass">${S(G.solidOf([[10, R - 4], [11.6, R - 12, 1], [12.4, 0]], F, P), { tone: "hi" })}</g>` +
    `<path d="${K.pathOf(Array.from({ length: 9 }, (_, i) => K.iso(G.pointOf(F, 11.2, R - 9, 2.0 + i * 0.07), P)))}" fill="none" stroke="#fff" stroke-width="${(G.scaleOf(P) * 2.4).toFixed(2)}" stroke-linecap="round" opacity=".6"/>`;

  ISO.add({
    name: "speedometer", title: "Speedometer (part)", compare: null,
    about: "A car speedometer on a bench U-bracket: 10 cm case, dial 0–120 km/h, odometer window, a needle that swings to kmh on a damped spring; its drive cable screws onto the back. anchors: cable",
    line: "speedometer cx cy k kmh=0..120 lab=0 lit=case|dial|needle|bracket",
    demo: { line: "speedometer 480 340 30 kmh=10", script: [{ set: {}, hold: 1 }, { set: { kmh: 55, lit: "needle" }, hold: "settle" }, { set: { kmh: 110, lit: "dial" }, hold: "settle" }, { set: { kmh: 30, lit: "bracket" }, hold: "settle" }, { set: { lit: "case" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { v: ISO.clamp(ISO.num(o, "kmh", 0), 0, MAX), lit: o.lit || "" }, s = { f: st.v / MAX, vf: 0 };
      const style = `<style>.sp-glass .iso-fill{fill-opacity:.1}.sp-glass .iso-shade,.sp-glass .iso-top{opacity:.2}</style>`;
      g.innerHTML = style + `<path class="iso-halo" d="${K.haloOf({ x: -R - 9, y: -52, w: 2 * R + 18, d: 66, r: 4 }, 0, 2, Pm)}"/>` +
        `<g data-name="bracket">${bracketSvg(Pm, false)}</g><g data-name="case">${caseSvg(Pm)}</g><g data-name="dial">${dialSvg(Pm)}</g>` +
        `<g data-name="needle">${needleSvg(Pm)}</g>${glass(Pm)}<g data-name="bracket">${bracketSvg(Pm, true)}</g>` +
        (lab ? CIRC.word(P, [R / 10 + 0.6, 0, (ZC + R) / 10], "speedometer") : "");
      g.anchors = { cable: [0, -5.2, ZC / 10] };
      const turn = g.querySelector('[data-part="turn"]'), w = ISO.writer();
      const draw = () => { w.attr(turn, "transform", `rotate(${(-135 + 270 * ISO.clamp(s.f, -0.01, 1.02)).toFixed(2)})`); B15.light(w, g, st.lit); };
      g.set = (p) => {
        if (p.kmh !== undefined && Number.isFinite(+p.kmh)) st.v = ISO.clamp(+p.kmh, 0, MAX);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const to = st.v / MAX, h = Math.min(dt, 0.05) / 4;
        if (ISO.still()) { s.f = to; s.vf = 0; }
        else for (let i = 0; i < 4; i++) { s.vf += (60 * (to - s.f) - 9 * s.vf) * h; s.f += s.vf * h; }
        if (Math.abs(s.f - to) < 5e-4 && Math.abs(s.vf) < 5e-3) { s.f = to; s.vf = 0; }
        draw();
        return s.f !== to;
      };
      g.readout = () => { const v = s.f * MAX; return `speedometer reads ${v.toFixed(0)} km/h = ${(v / 3.6).toFixed(1)} m/s`; };
      draw();
      return g;
    },
  });
})();
