// "handstopwatch cx cy k aim=up|flat sec=0..1799 run=0|1 lab=0 lit=case|dial|hands|crown" — a PART (PARTS.md,
// batch 5): the mechanical stopwatch of stopwatch.js at its real size, 5.5 cm across and 1.5 cm thick. A chrome case
// (back, middle, bezel), a domed glass, a white dial with a 60-second track (major ticks every 5 s, numbers) and a
// 30-minute counter; on top the crown (press: start / stop) inside a wire bow, at 45° the reset button. The seconds
// hand turns once a minute in steps of 1/5 s (the balance beats 5 times a second); the counter hand clicks on each
// minute. aim=up stands it on its rim, dial toward +y (origin = the rim's lowest point: placed at= a watchcradle's
// `seat`); aim=flat lies it on its back, dial up, crown toward −y (origin = the back's middle on the surface).
// sec = the reading. set({ run: 1|0 }) starts or stops it, set({ sec }) runs it to that reading at true speed and
// stops, set({ reset: 1 }) flies both hands back to zero. anchors: centre (the dial's middle) top (the bow's top).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 2.75, BK = -0.75, DIAL = 0.36, SUB = 1.05, SR = 0.5, BOW = 0.62;
  const ang = (f) => Math.PI / 2 - 2 * Math.PI * f;                  // 12 o'clock at the top, clockwise as you face it
  const add = (...v) => [0, 1, 2].map((i) => v.reduce((a, [p, s]) => a + p[i] * s, 0));

  ISO.add({
    name: "handstopwatch", title: "Mechanical stopwatch (part)", compare: null,
    about: "A mechanical stopwatch 5.5 cm across: the crown starts and stops it, the seconds hand goes round once a minute in 1/5 s steps, a small dial counts the minutes, and reset flies both back to zero; stands on its rim or lies flat. anchors: centre top",
    line: "handstopwatch cx cy k aim=up|flat sec=0..1799 run=0|1 lab=0 lit=case|dial|hands|crown",
    demo: { line: "handstopwatch 480 440 54 sec=20 lab=1", script: [{ set: { sec: 27.4, lit: "hands" }, hold: "settle" }, { set: { reset: 1, lit: "crown" }, hold: "settle" }, { set: { run: 1, lit: "dial" }, hold: 2.2 }, { set: { run: 0, lit: "case" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const flat = o.aim === "flat";
      // the watch's own axes: n out of the dial, up toward 12 o'clock, rt toward 3 o'clock; c the case's middle
      const n = flat ? [0, 0, 1] : [0, 1, 0], up = flat ? [0, -1, 0] : [0, 0, 1], rt = [1, 0, 0], c = flat ? [0, 0, -BK] : [0, 0, R];
      const at = (s, x, y) => add([c, 1], [n, s], [rt, x], [up, y]);
      const F = G.frameOf(c, n, rt, up), FS = G.frameOf(at(0, 0, SUB), n, rt, up);
      const d45 = [Math.SQRT1_2, Math.SQRT1_2];
      const along = (o0, dir) => G.frameOf(o0, dir, rt, n);
      // the crown's stem and the bow (a wire loop round it), and the reset button's sleeve at 45°
      function topSvg() {
        const sF = along(at(0, 0, R - 0.05), up), out = [ISO.tinted(ISO.T.steel, S(G.disc(0, 0.42, 0.17, sF, P), { tone: "hi", crease: "none" }))];
        const bow = K.pathOf(Array.from({ length: 40 }, (_, i) => { const q = 0.55 + (i / 39) * (2 * Math.PI - 1.1); return K.iso(at(0, Math.sin(q) * BOW, R + 0.2 + BOW - Math.cos(q) * BOW), P); }));
        out.push(`<path d="${bow}" fill="none" stroke="#3c3f45" stroke-width="${Math.max(1.2, kS * 0.13).toFixed(2)}" stroke-linecap="round"/><path d="${bow}" fill="none" stroke="#e4e5e8" stroke-width="${Math.max(0.6, kS * 0.07).toFixed(2)}" stroke-linecap="round"/>`);
        for (const sx of [-1, 1]) out.push(ISO.tinted(ISO.T.steel, S(G.sphereOf(at(0, sx * Math.sin(0.55) * BOW, R + 0.2 + BOW - Math.cos(0.55) * BOW), 0.1, P), { tone: "hi" })));
        const bF = along(at(0, d45[0] * (R - 0.05), d45[1] * (R - 0.05)), add([rt, d45[0]], [up, d45[1]]));
        out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.32, 0.14, bF, P), { tone: "hi", crease: "none" }) + S(G.disc(0.32, 0.46, 0.2, bF, P), { tone: "hi" })));
        return out.join("");
      }
      // the crown (knurled, pressed in by p) and the reset button's push piece (pressed in by q)
      function buttonsSvg(p, q) {
        const sF = along(at(0, 0, R + 0.37 - 0.12 * p), up), bF = along(at(0, d45[0] * (R + 0.41 - 0.1 * q), d45[1] * (R + 0.41 - 0.1 * q)), add([rt, d45[0]], [up, d45[1]]));
        return `<g data-name="crown">${ISO.tinted(ISO.T.steel, S(G.disc(0, 0.36, 0.3, sF, P), { tone: "hi" }) + L(G.ribsOf(sF, 0, 0.36, 0.3, 18, P, { seams: true }), { tone: "lo" }))}</g>` +
          ISO.tinted(ISO.T.steel, S(G.disc(0, 0.2, 0.17, bF, P), { tone: "hi" }));
      }
      const caseSvg = () => `<g data-name="case">${ISO.tinted(ISO.T.steel, S(G.solidOf([[BK, R - 0.45], [BK + 0.12, R - 0.12, 1], [BK + 0.3, R, 1], [0.2, R, 1], [0.3, R - 0.1]], F, P), { tone: "hi", inner: L(G.arcOf(F, -0.1, R, P), { tone: "faint" }) }) + S(G.ringBand(0.28, 0.5, R - 0.3, R - 0.04, F, P), { tone: "hi" }))}</g>`;
      // the dial: white disc, second track and counter ring, ticks hanging in from the rings, numbers printed flat
      function dialSvg() {
        const s = DIAL + 0.005, minor = [], major = [], sub = [], subM = [];
        for (let i = 0; i < 60; i++) { const a = ang(i / 60); (i % 5 ? minor : major).push(K.segment(at(s, Math.cos(a) * (R - 0.42), Math.sin(a) * (R - 0.42)), at(s, Math.cos(a) * (R - (i % 5 ? 0.56 : 0.68)), Math.sin(a) * (R - (i % 5 ? 0.56 : 0.68))), P)); }
        for (let i = 0; i < 30; i++) { const a = ang(i / 30), r0 = SR, r1 = i % 5 ? SR - 0.07 : SR - 0.13; (i % 5 ? sub : subM).push(K.segment(G.pointOf(FS, s, r0, a), G.pointOf(FS, s, r1, a), P)); }
        const out = [`<g style="${ISO.tint("#fbfbf8", ["#e4e4df", "#ebebe6", "#f1f1ec", "#f6f6f2"], "#6b7078")}">${S(G.disc(0.3, DIAL, R - 0.3, F, P), { tone: "lo" })}</g>`];
        out.push(L(G.circleOf(F, s, R - 0.42, P, 120) + G.circleOf(FS, s, SR, P, 60), { tone: "lo" }), L(minor.join("") + sub.join(""), { tone: "lo", free: "end" }), L(major.join("") + subM.join(""), { tone: "mid", free: "end" }));
        const big = kS * 0.26 >= 3, txt = [];
        if (big) {
          for (let i = 5; i <= 60; i += 5) { const a = ang(i / 60), r0 = R - 0.98; txt.push(window.LAB.faceText(P, at(s, Math.cos(a) * r0, Math.sin(a) * r0 - 0.1), rt, String(i), 0.3, "#33363b", up)); }
          for (const i of [10, 20, 30]) { const a = ang((i % 30) / 30), p = G.pointOf(FS, s, SR - 0.27, a); txt.push(window.LAB.faceText(P, add([p, 1], [up, -0.05]), rt, String(i), 0.14, "#6b7078", up)); }
        }
        return out.join("") + txt.join("");
      }
      // the hands at reading e: the counter hand (minutes), the red seconds hand with its tail, the centre boss
      function handsSvg(e) {
        const q = Math.floor(e * 5 + 1e-6) / 5, a = ang((q % 60) / 60), m = ang((Math.floor(q / 60 + 1e-6) % 30) / 30), s = DIAL + 0.04;
        return L(K.segment(G.pointOf(FS, s, 0.1, m + Math.PI), G.pointOf(FS, s, SR - 0.06, m), P), { tone: "hi", free: true }) + D([K.iso(G.pointOf(FS, s, 0, 0), P)], { size: 0.8, tone: "hi" }) +
          `<path class="iso-line" data-tone="lit" data-free="" d="${K.segment(G.pointOf(F, s, 0.6, a + Math.PI), G.pointOf(F, s, R - 0.46, a), P)}" style="stroke-width:${Math.max(1, kS * 0.05).toFixed(2)};stroke:#c0392b"/>` +
          ISO.tinted(ISO.T.steel, S(G.disc(s - 0.02, s + 0.04, 0.12, F, P), { tone: "mid" }));
      }
      const glass = `<g class="b29-glass" style="${ISO.T.glass}">${S(G.solidOf([[0.48, R - 0.3], [0.62, R - 0.7, 1], [0.75, 0]], F, P), { tone: "hi" })}</g>`;
      const st = { e: B29.num(o, "sec", 0, 0, 1799), run: o.run === "1", to: null, back: false, press: 0, pressR: 0 };
      // painted back to front: aim=up the case, dial, hands, glass, then the crown and bow on top; flat, the crown
      // and bow lie on the far side (−y), so they go first
      const top = `<g data-name="crown">${topSvg()}</g><g data-part="buttons"></g>`;
      const halo = `<path class="iso-halo" d="${flat ? K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 0.2, P) : K.haloOf({ x: -R, y: -0.75, w: 2 * R, d: 1.5, r: 0.7 }, 0, 0.2, P)}"/>`;
      g.innerHTML = B29.GLASS + halo + (flat ? top : "") + caseSvg() + `<g data-name="dial">${dialSvg()}</g><g data-name="hands" data-part="hands"></g><g data-name="case">${glass}</g>` + (flat ? "" : top) + `<g data-part="words"></g>`;
      g.anchors = { centre: at(DIAL, 0, 0), top: at(0, 0, R + 0.2 + 2 * BOW) };
      const el = window.LAB.parts(g);
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.hands, (Math.floor(st.e * 5 + 1e-6) / 5).toFixed(1), () => handsSvg(st.e));
        w.rebuild(el.buttons, `${st.press.toFixed(2)} ${st.pressR.toFixed(2)}`, () => buttonsSvg(st.press, st.pressR));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso(at(0, 0, R + 0.2 + 2 * BOW), P), "crown: start / stop", "#555", { size: 13, dy: -8 }) + ISO.word(K.iso(at(0, d45[0] * (R + 0.5), d45[1] * (R + 0.5)), P), "reset", "#555", { size: 13, anchor: "start", dy: -2 }));
        B29.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.run !== undefined) { const r = p.run === true || +p.run === 1; if (r !== st.run) st.press = 1; st.run = r; st.to = null; }
        if (p.sec !== undefined && Number.isFinite(+p.sec)) { st.to = ISO.clamp(+p.sec, 0, 1799); if (st.to > st.e) { if (!st.run) st.press = 1; st.run = true; } else { st.to = null; } }
        if (p.reset !== undefined && +p.reset) { st.run = false; st.to = null; st.back = true; st.pressR = 1; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        if (st.run) {
          st.e = Math.min(1799, st.e + dt); moving = true;
          if (st.to !== null) { if (st.e >= st.to || calm) { st.e = st.to; st.run = false; st.to = null; st.press = 1; } moving = true; }
          else if (st.e >= 1799) st.run = false;
        }
        if (st.back) { st.e = calm ? 0 : st.e * Math.exp(-dt / 0.06); if (st.e < 0.05) { st.e = 0; st.back = false; } moving = true; }
        st.press = calm ? 0 : Math.max(0, st.press - dt / 0.25); st.pressR = calm ? 0 : Math.max(0, st.pressR - dt / 0.25);
        draw();
        return moving || st.press > 0 || st.pressR > 0;
      };
      g.readout = () => {
        const q = Math.floor(st.e * 5 + 1e-6) / 5, mm = Math.floor(q / 60), ss = (q % 60).toFixed(1);
        return `${mm} min ${ss} s · ${st.run ? "running: the seconds hand turns once in 60 s, in steps of 1/5 s" : st.e === 0 ? "reset to zero" : "stopped"}`;
      };
      draw();
      return g;
    },
  });
})();
