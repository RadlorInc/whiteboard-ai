// "gauge cx cy size k=speed|pressure val=0.6 lab=1 lit=…" — a real dial instrument with case, glass, scale and needle.
// k=speed: a car speedometer (0–120 km/h) on a bench bracket, its drive cable leaving the back, with an odometer window.
// k=pressure: a Bourdon-tube pressure gauge (0–10 bar, red above 8) screwed by its brass stem into a tee on an air line
// from a tank, with a hand valve. val is the reading as a fraction of full scale; the needle swings to it on a damped
// spring, as a real movement does. set({ val }) changes the reading.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 40, ZC = 70, KINDS = { speed: { max: 120, unit: "km/h", major: 20, minor: 5 }, pressure: { max: 10, unit: "bar", major: 1, minor: 0.2 } };
  const F = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const ang = (f) => Math.PI / 2 - ((-135 + 270 * f) * Math.PI) / 180;      // 0 at bottom left, clockwise through the top
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  function mountSvg(P, kind) {
    const out = [];
    if (kind === "speed") {
      const B = { x: -56, y: -40, w: 112, d: 70, r: 6 };
      out.push(ISO.baseboard(P, B, { h: 6, feet: 3 }), ISO.plate(P, { x: 10, y: 14, w: 36, d: 10, r: 1 }));
      // U-bracket from the base up behind the case, and the drive cable from the case back to a gearbox block.
      out.push(`<g data-name="mount">`, ISO.wbox(P, [-14, 14], [-24, -8], [0, 4], "mid"), ISO.wbox(P, [-4, 4], [-20, -14], [4, ZC - 10], "mid"), ISO.wbox(P, [-10, 10], [-20, -10], [ZC - 14, ZC - 6], "mid"));
      out.push(ISO.wbox(P, [-48, -24], [-34, -14], [0, 12], "mid"), S(G.disc(0, 6, 4, xAx([-24, -24, 6]), P), { tone: "mid" }));
      const cable = [[0, -20, ZC], [0, -30, ZC], [0, -34, ZC - 8], [0, -34, 30], [-6, -30, 10], [-18, -24, 6]];
      out.push(`<path d="${K.pathOf(cable.map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(cable.map((p) => K.iso(p, P)))}" fill="none" stroke="#55575c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`);
      const nF = G.frameOf([0, -8, ZC], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
      out.push(S(G.disc(0, 4, 6, nF, P), { tone: "mid" }), L(G.ribsOf(nF, 0, 4, 6, 6, P, { seams: true }), { tone: "lo" }), S(G.disc(4, 12, 3, nF, P), { tone: "mid" }), `</g>`);
    } else {
      const B = { x: -96, y: -40, w: 170, d: 70, r: 6 };
      out.push(ISO.baseboard(P, B, { h: 6, feet: 3 }), ISO.plate(P, { x: 30, y: 14, w: 36, d: 10, r: 1 }));
      // Air tank on two cradles, the line to the tee, a hand valve, the tee and the gauge's brass stem and hex.
      out.push(`<g data-name="mount">`);
      for (const x of [-84, -54]) out.push(ISO.wbox(P, [x, x + 8], [-22, 2], [0, 14], "mid"));
      const tF = xAx([-92, -10, 22]);
      out.push(ISO.tinted(ISO.T.red, S(G.solidOf([[0, 6], [2, 11, 1], [5, 13, 1], [37, 13], [40, 11, 1], [42, 6]], tF, P), { tone: "hi" })));
      const pF = xAx([-50, -10, 22]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 46, 2.4, pF, P), { tone: "hi" }) + S(G.disc(4, 12, 4.4, pF, P), { tone: "hi" }) + S(G.disc(36, 46, 3.6, pF, P), { tone: "hi" })));
      const vF = zAx([-32, -10, 26]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 8, 1.4, vF, P), { tone: "hi" })), ISO.tinted(ISO.T.red, S(G.ringBand(8, 10, 5, 7, vF, P), { tone: "hi" }) + L(G.spokesOf(vF, 9.9, 1.4, 5, 3, P), { tone: "lo" })));
      out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, -10, 4.4, 17, 13, P, 20), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, -10, 4.4, 30, 5, P, 6), { tone: "hi" }) + S(K.cylinder(0, -10, 2.4, 35, ZC - R - 35 + 2, P, 16), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(4, 30, 2.4, xAx([0, -10, 22]), P), { tone: "hi" }) + S(G.disc(30, 36, 3.6, xAx([0, -10, 22]), P), { tone: "hi" })), `</g>`);
    }
    return out.join("");
  }
  function caseSvg(P, kind) {
    const out = [`<g data-name="case">`];
    const tint = kind === "speed" ? ISO.T.plastic : ISO.T.steel;
    out.push(ISO.tinted(tint, S(G.disc(-8, 5, R, F, P), { tone: "hi", inner: L(G.arcOf(F, -1.5, R, P), { tone: "faint" }) }) + S(G.ringBand(5, 8, R - 4, R + 1, F, P), { tone: "hi" })));
    out.push(S(G.disc(5, 5.6, R - 4, F, P), { tone: "hi" }), `</g>`);
    if (kind === "pressure") out.push(D(G.dotsOf(F, 8, R - 1.5, 6, P, { all: true, phase: 0.5 }), { size: 0.6 }));
    return out.join("");
  }
  function scaleSvg(P, kind, lab) {
    const k = KINDS[kind], s = 5.65, rr = R - 7, minor = [], major = [], out = [];
    if (kind === "pressure") {
      const red = [];
      for (let i = 0; i <= 20; i++) { const a = ang(0.8 + 0.2 * (i / 20)); red.push(K.iso(G.pointOf(F, s, rr - 1.5, a), P)); }
      out.push(`<path d="${K.pathOf(red)}" fill="none" stroke="#d63e2a" stroke-width="3" stroke-linecap="butt"/>`);
    }
    const arc = Array.from({ length: 61 }, (_, i) => K.iso(G.pointOf(F, s, rr, ang(i / 60)), P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[60]], { size: 0.6, tone: "lo" }));
    const n = Math.round(k.max / k.minor), every = Math.round(k.major / k.minor);
    for (let i = 0; i <= n; i++) { const a = ang(i / n); (i % every ? minor : major).push(K.segment(G.pointOf(F, s, rr, a), G.pointOf(F, s, rr - (i % every ? 2.4 : 4.6), a), P)); }
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    for (let v = 0; v <= k.max + 1e-9; v += k.major) { const p = K.iso(G.pointOf(F, s, rr - 11, ang(v / k.max)), P); out.push(ISO.word(p, String(+v.toFixed(1)), "#2a2b2f", { size: kind === "speed" ? 9 : 10, dy: 3 })); }
    out.push(ISO.word(K.iso(G.pointOf(F, s, 12, -Math.PI / 2), P), k.unit, "#55575c", { size: 9, dy: 3 }));
    if (kind === "speed") {
      // Odometer window: a recessed slot with six digit drums, the last one white on red.
      const W2 = 12, H2 = 2.6, c = G.pointOf(F, s, 21, -Math.PI / 2), at = (x, z) => K.iso([c[0] + x, c[1] + 0.02, c[2] + z], P);
      out.push(`<path d="${K.pathOf([at(-W2, -H2), at(W2, -H2), at(W2, H2), at(-W2, H2)], true)}" fill="#1d1f22" stroke="#55575c" stroke-width="0.5"/>`);
      "042716".split("").forEach((dg, i) => { const x = -W2 + 2 + i * 4; if (i === 5) out.push(`<path d="${K.pathOf([at(x - 1.8, -H2), at(x + 1.8, -H2), at(x + 1.8, H2), at(x - 1.8, H2)], true)}" fill="#c0392b"/>`); const p = at(x, 0); out.push(`<text x="${p[0].toFixed(1)}" y="${(p[1] + 2.4).toFixed(1)}" text-anchor="middle" fill="#f4f4f2" style="font:700 7px ui-monospace,monospace">${dg}</text>`); });
    }
    if (lab) out.push(ISO.word(K.iso([0, 0, ZC + R + 4], P), kind === "speed" ? "speedometer" : "pressure gauge", "#555", { size: 14, dy: -6 }));
    return out.join("");
  }
  function needleSvg(P, f) {
    const a = ang(ISO.clamp(f, -0.01, 1.02)), s = 6.2, tip = G.pointOf(F, s, R - 9, a), tail = G.pointOf(F, s, 7, a + Math.PI);
    const side = (d) => G.pointOf(F, s, 1.6, a + d);
    return `<g data-name="needle"><path d="${K.pathOf([tail, side(Math.PI / 2), tip, side(-Math.PI / 2)].map((p) => K.iso(p, P)), true)}" fill="#d63e2a" stroke="#7a1f1f" stroke-width="0.6" stroke-linejoin="round"/>` +
      S(G.disc(s, s + 1.2, 3.4, F, P), { tone: "mid", lit: true }) + `</g>`;
  }
  const glass = (P) => `<g style="${ISO.T.glass}" class="ga-glass">${S(G.solidOf([[8, R - 4], [9.4, R - 12, 1], [10, 0]], F, P), { tone: "hi" })}<path d="${K.pathOf(Array.from({ length: 9 }, (_, i) => K.iso(G.pointOf(F, 8.6, R - 7, 2.0 + i * 0.07), P)))}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/></g>`;

  ISO.add({
    name: "gauge", title: "Dial gauge (speed / pressure)", compare: "gauge 480 260 240 k=speed val=0.55",
    about: "A real dial instrument: a speedometer on a bench bracket with its drive cable, or a Bourdon pressure gauge on an air line; the needle swings to the reading.",
    line: "gauge cx cy size k=speed|pressure val=0.6 lab=1 lit=needle|case|mount",
    demo: { line: "gauge 480 265 300 k=speed val=0.1", script: [{ set: { val: 0.45 }, hold: "settle" }, { set: { val: 0.9 }, hold: "settle" }, { set: { val: 0.25 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", kind = o.k === "pressure" ? "pressure" : "speed", W = size * (kind === "speed" ? 1.3 : 1.7), H = size * 1.2;
      const ext = kind === "speed" ? [[-56, -40, -9], [56, 30, -9], [0, 0, ZC + R + 14], [-R, 0, ZC]] : [[-96, -40, -9], [74, 30, -9], [0, 0, ZC + R + 14]];
      const { P, g } = ISO.frame(ext, cx, cy, W, H, { azimuth: 72, elevation: 14 }, parent);
      const k = KINDS[kind], s = { f: ISO.clamp(ISO.num(o, "val", 0.6), 0, 1), v: 0 }; s.fT = s.f;
      const style = `<style>.ga-glass .iso-fill{fill-opacity:.1}.ga-glass .iso-shade,.ga-glass .iso-top{opacity:.22}</style>`;
      g.innerHTML = style + `<g>${mountSvg(P, kind)}${caseSvg(P, kind)}${scaleSvg(P, kind, lab)}</g><g data-part="needle"></g><g>${glass(P)}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "needle";
      const draw = () => {
        w.rebuild(el.needle, s.f.toFixed(4), () => needleSvg(P, s.f));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.val !== undefined) s.fT = ISO.clamp(+p.val, 0, 1); if (p.lit) lit = p.lit; };
      g.update = (dt) => {
        if (ISO.still()) { s.f = s.fT; s.v = 0; }
        else for (let i = 0; i < 4; i++) { const h = dt / 4; s.v += (60 * (s.fT - s.f) - 9 * s.v) * h; s.f += s.v * h; }   // ζ ≈ 0.58: a small overshoot
        const moving = Math.abs(s.f - s.fT) > 5e-4 || Math.abs(s.v) > 5e-3;
        if (!moving) { s.f = s.fT; s.v = 0; }
        draw();
        return moving;
      };
      g.readout = () => {
        const v = s.f * k.max;
        return kind === "speed" ? `${v.toFixed(0)} km/h = ${(v / 3.6).toFixed(1)} m/s` : `${v.toFixed(1)} bar = ${(v * 100).toFixed(0)} kPa ≈ ${(v * 14.5).toFixed(0)} psi above atmospheric${v > 8 ? " · in the red: over the safe limit" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
