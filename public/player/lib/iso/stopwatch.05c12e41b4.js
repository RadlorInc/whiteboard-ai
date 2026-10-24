// "stopwatch cx cy size sec=20 lab=1 lit=…" — a mechanical stopwatch standing in a display cradle.
// A chrome case with a crown that starts and stops it, a reset button at 45°, a bow, a 60-second dial and a 30-minute
// counter. The seconds hand turns once a minute in steps of 1/5 s (the balance beats 5 times a second) and the counter
// clicks on each minute. set({ run: 1|0 }) starts or stops it, set({ to: s }) runs it to that reading at true speed and
// stops, set({ reset: 1 }) flies both hands back to zero.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 48, ZC = 66, BASE = { x: -50, y: -26, w: 100, d: 52, r: 5 }, SUB = [0, 0, ZC + 19];
  const F = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]), FS = G.frameOf(SUB, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const ang = (f) => Math.PI / 2 - 2 * Math.PI * f;                  // 12 o'clock at the top, clockwise as you face the dial
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  function caseSvg(P) {
    const out = [ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 6, feet: 3 }))];
    // The cradle: two blocks with a curved seat holding the case's lower rim.
    for (const x of [-26, 14]) out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x, x + 12], [-12, 12], [0, ZC - R + 10 - (Math.abs(x + 6) > 18 ? 0 : 0) - 2], "mid")));
    out.push(ISO.plate(P, { x: -16, y: 14, w: 32, d: 8, r: 1 }));
    // Crown stem, crown (knurled), and the bow ring round it; the reset button at 45°.
    out.push(`<g data-name="case">`);
    const sF = zAx([0, 0, ZC + R - 1]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 7, 3.4, sF, P), { tone: "hi" }) + S(G.disc(7, 13, 6, sF, P), { tone: "hi" }) + L(G.ribsOf(sF, 7, 13, 6, 22, P, { seams: true }), { tone: "lo" })));
    const bow = K.pathOf(Array.from({ length: 48 }, (_, k) => { const t = 0.5 + (k / 47) * (2 * Math.PI - 1); return K.iso([Math.sin(t) * 12, 0, ZC + R + 12 - Math.cos(t) * 12], P); }));
    out.push(`<path d="${bow}" fill="none" stroke="#3c3f45" stroke-width="3.4" stroke-linecap="round"/><path d="${bow}" fill="none" stroke="#e4e5e8" stroke-width="1.9" stroke-linecap="round"/>`);
    for (const sx of [-1, 1]) out.push(ISO.tinted(ISO.T.steel, S(G.sphereOf([sx * Math.sin(0.5) * 12, 0, ZC + R + 12 - Math.cos(0.5) * 12], 1.8, P), { tone: "hi" })));
    const d = [Math.SQRT1_2, 0, Math.SQRT1_2], bF = G.frameAlong([d[0] * (R - 1), 0, ZC + d[2] * (R - 1)], d);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 6, 2.4, bF, P), { tone: "hi" }) + S(G.disc(6, 9, 3.4, bF, P), { tone: "hi" })));
    // The case: back, middle and the bezel; the dial with its printed ring.
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-7, 6, R, F, P), { tone: "hi", inner: L(G.arcOf(F, 0, R, P), { tone: "faint" }) }) + S(G.ringBand(6, 9, R - 5, R + 0.6, F, P), { tone: "hi" })));
    out.push(S(G.disc(6, 6.6, R - 5, F, P), { tone: "hi" }), `</g>`);
    return out.join("");
  }
  // Everything printed on the dial: second ticks hanging in from the outer ring (major every 5 s), numbers, the counter.
  function dialSvg(P, lab) {
    const s = 6.65, minor = [], major = [], sub = [], subM = [];
    for (let k = 0; k < 60; k++) { const a = ang(k / 60); (k % 5 ? minor : major).push(K.segment(G.pointOf(F, s, R - 7, a), G.pointOf(F, s, R - (k % 5 ? 9.4 : 11.4), a), P)); }
    for (let k = 0; k < 30; k++) { const a = ang(k / 30); (k % 5 ? sub : subM).push(K.segment(G.pointOf(FS, s, 9, a), G.pointOf(FS, s, k % 5 ? 7.8 : 6.8, a), P)); }
    const out = [L(G.circleOf(F, s, R - 7, P) + G.circleOf(FS, s, 9, P), { tone: "lo" }), L(minor.join("") + sub.join(""), { tone: "lo", free: "end" }), L(major.join("") + subM.join(""), { tone: "mid", free: "end" })];
    for (let k = 5; k <= 60; k += 5) { const p = K.iso(G.pointOf(F, s, R - 17, ang(k / 60)), P); out.push(ISO.word(p, String(k), "#33363b", { size: 9, dy: 3 })); }
    for (const k of [10, 20, 30]) { const p = K.iso(G.pointOf(FS, s, 4.4, ang((k % 30) / 30)), P); out.push(ISO.word(p, String(k), "#6b7078", { size: 6, dy: 2 })); }
    return out.join("");
  }
  function handsSvg(P, e) {
    const q = Math.floor(e * 5 + 1e-6) / 5, a = ang((q % 60) / 60), m = ang((Math.floor(q / 60 + 1e-6) % 30) / 30), s = 7.2;
    return `<g data-name="hands">` + L(K.segment(G.pointOf(FS, s, 2, m + Math.PI), G.pointOf(FS, s, 7.6, m), P), { tone: "hi", free: true }) + D([K.iso(G.pointOf(FS, s, 0, 0), P)], { size: 1.1, tone: "hi" }) +
      `<path class="iso-line" data-tone="lit" data-free="" d="${K.segment(G.pointOf(F, s, 11, a + Math.PI), G.pointOf(F, s, R - 8, a), P)}" style="stroke-width:1.3;stroke:#c0392b"/>` +
      S(G.disc(s - 0.2, s + 0.8, 3.2, F, P), { tone: "mid" }) + `</g>`;
  }
  const glass = (P) => `<g style="${ISO.T.glass}" class="sw-glass">${S(G.solidOf([[8.4, R - 5], [10.2, R - 12, 1], [11, 0]], F, P), { tone: "hi" })}</g>`;

  ISO.add({
    name: "stopwatch", title: "Mechanical stopwatch", compare: "stopwatch 480 280 240 sec=20",
    about: "A mechanical stopwatch: the crown starts and stops it, the seconds hand goes round once a minute in 1/5 s steps, and reset flies it back to zero.",
    line: "stopwatch cx cy size sec=20 lab=1 lit=hands|crown|case",
    demo: { line: "stopwatch 480 275 280 sec=20", script: [{ set: { to: 26.4 }, hold: "settle" }, { set: { reset: 1 }, hold: "settle" }, { set: { to: 8.6 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 1.25;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -9, 0), [0, 0, ZC + R + 26], [R + 10, 0, ZC + 30], [-R, 0, ZC]], cx, cy, W, H, { azimuth: 74, elevation: 14 }, parent);
      const s = { e: ISO.clamp(ISO.num(o, "sec", 20), 0, 1799), run: false, to: null, back: false, press: 0, pressR: 0 };
      const style = `<style>.sw-glass .iso-fill{fill-opacity:.12}.sw-glass .iso-shade,.sw-glass .iso-top{opacity:.25}</style>`;
      g.innerHTML = style + `<g>${caseSvg(P)}${dialSvg(P, lab)}</g><g data-part="hands"></g><g>${glass(P)}</g><g data-part="buttons"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "hands";
      const draw = () => {
        w.rebuild(el.hands, (Math.floor(s.e * 5 + 1e-6) / 5).toFixed(1), () => handsSvg(P, s.e));
        w.rebuild(el.buttons, `${s.press.toFixed(2)} ${s.pressR.toFixed(2)}`, () => {
          const sF = zAx([0, 0, ZC + R + 12]), d = [Math.SQRT1_2, 0, Math.SQRT1_2], bF = G.frameAlong([d[0] * (R + 8), 0, ZC + d[2] * (R + 8)], d);
          return `<g data-name="crown">${ISO.tinted(ISO.T.steel, S(G.disc(0, 5 - 2 * s.press, 3, sF, P), { tone: "hi", lit: true }))}</g>` + ISO.tinted(ISO.T.steel, S(G.disc(0, 3 - 1.6 * s.pressR, 2.6, bF, P), { tone: "hi" }));
        });
        w.rebuild(el.words, lab ? (s.run ? "r" : s.e === 0 ? "z" : "s") : "", () => !lab ? "" :
          ISO.word(K.iso([0, 0, ZC + R + 30], P), "crown: start / stop", "#555", { size: 13, dy: -6 }) + ISO.word(K.iso([d45(R + 12)[0], 0, d45(R + 12)[2]], P), "reset", "#555", { size: 13, anchor: "start", dy: -2 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      const d45 = (r) => [Math.SQRT1_2 * r, 0, ZC + Math.SQRT1_2 * r];
      g.set = (p) => {
        if (p.run !== undefined) { if (!!+p.run !== s.run) s.press = 1; s.run = !!+p.run; s.to = null; }
        if (p.to !== undefined) { s.to = ISO.clamp(+p.to, 0, 1799); if (!s.run) s.press = 1; s.run = s.to > s.e; }
        if (p.reset) { s.run = false; s.to = null; s.back = true; s.pressR = 1; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        if (s.run) {
          s.e += dt;
          if (s.to !== null) { if (s.e >= s.to || calm) { s.e = s.to; s.run = false; s.to = null; s.press = 1; } moving = true; }
        }
        if (s.back) { s.e = calm ? 0 : s.e * Math.exp(-dt / 0.06); if (s.e < 0.05) { s.e = 0; s.back = false; } moving = true; }
        s.press = Math.max(0, s.press - dt / 0.25); s.pressR = Math.max(0, s.pressR - dt / 0.25);
        draw();
        return moving || s.press > 0 || s.pressR > 0;
      };
      g.readout = () => {
        const q = Math.floor(s.e * 5 + 1e-6) / 5, mm = Math.floor(q / 60), ss = (q % 60).toFixed(1);
        return `${mm} min ${ss} s · ${s.run ? "running: the seconds hand turns once in 60 s, in steps of 1/5 s" : s.e === 0 ? "reset to zero" : "stopped"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
