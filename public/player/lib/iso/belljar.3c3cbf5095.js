// "belljar cx cy size air=0|1 lab=1 lit=…" — an electric bell ringing inside a glass bell jar on a vacuum-pump plate.
// A battery drives the bell's electromagnet, so the hammer keeps striking the gong. The pump draws the air out through a
// hose (pressure falls as p = p0·e^(−t/τ)); the hammer goes on striking, but with less and less air to carry it the
// sound reaching you fades to nothing: sound needs a medium. set({ pump: 1 }) pumps it down, set({ air: 1 }) lets air in.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -150, y: -70, w: 330, d: 140, r: 8 }, P0 = 101.3, TOP = 14, GONG = [8, 0, 60], PIV = [14, 0, 38];
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const lead = (P, pts, color, w = 1.8) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="${w + 1}" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` + D([K.iso(pts[0], P), K.iso(pts[pts.length - 1], P)], { size: 1, tone: "hi" });

  function baseSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 120, y: 40, w: 40, d: 14, r: 1.2 })];
    // Battery box with two terminals, back left.
    out.push(`<g data-name="battery">`, ISO.tinted(ISO.T.red, ISO.wbox(P, [-138, -104], [-40, -14], [0, 30], "hi")), ISO.wbox(P, [-138, -104], [-40, -14], [30, 32], "mid"));
    for (const [x, c] of [[-128, ISO.T.red], [-114, ISO.T.plastic]]) out.push(ISO.tinted(c, S(K.cylinder(x, -27, 2.6, 32, 3, P, 18), { tone: "hi" })));
    out.push(`</g>`);
    // Vacuum pump, right: a motor lying on a foot, the pump block with a vacuum gauge on its face, a switch.
    out.push(`<g data-name="pump">`, ISO.wbox(P, [112, 176], [-34, 6], [0, 6], "mid"));
    const mF = xAx([150, -14, 22]);
    out.push(S(G.disc(-4, 26, 14, mF, P), { tone: "mid" }), L(G.ribsOf(mF, 2, 20, 14, 22, P, { seams: true }), { tone: "lo" }), S(G.disc(26, 28, 9, mF, P), { tone: "mid" }));
    out.push(ISO.wbox(P, [116, 146], [-30, 2], [6, 44], "mid"), ISO.wbox(P, [118, 144], [-28, 0], [44, 47], "mid"));
    const gF = yAx([131, 2, 28]);
    out.push(S(G.disc(0, 2, 11, gF, P), { tone: "mid" }), S(G.disc(2, 2.6, 9.6, gF, P), { tone: "hi" }));
    out.push(`</g>`);
    // Pedestal and the ground plate, its greased seat ring, the hose port on the right, two terminals on the left rim.
    out.push(S(K.cylinder(0, 0, 22, 0, 6, P, 48, 0.5), { tone: "mid" }), S(K.cylinder(0, 0, 60, 6, TOP - 6, P, 96, 1), { tone: "mid", inner: L(K.sideArc(0, 0, 60, 10, P, 72), { tone: "faint" }) }));
    out.push(L(K.ring(0, 0, 49, TOP, P, 96) + K.ring(0, 0, 45.5, TOP, P, 96), { tone: "faint" }));
    out.push(S(G.disc(0, 8, 3, xAx([59, 0, 10]), P), { tone: "mid" }), S(G.disc(8, 11, 4, xAx([59, 0, 10]), P), { tone: "mid" }));
    for (const y of [-8, 8]) out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(-54, y, 2.4, TOP, 5, P, 18), { tone: "hi" })));
    // The hose from the port down to the pump's inlet.
    const hose = [[70, 0, 10], [84, 0, 10], [92, 0, 8], [104, 0, 8], [116, -8, 16]];
    out.push(lead(P, hose, "#55575c", 3.2));
    out.push(lead(P, [[-128, -27, 35], [-128, -13, 33], [-128, -12, 1], [-66, -8, 1], [-64, -8, 14], [-54, -8, 19]], "#c0392b"), lead(P, [[-114, -27, 35], [-114, -13, 33], [-114, -12, 1], [-90, 8, 1], [-66, 8, 1], [-64, 8, 14], [-54, 8, 19]], "#2a2b2f"));
    return out.join("");
  }
  // The electric bell inside: a base block, the electromagnet's two coils, a post and arm holding the gong, wires.
  function bellSvg(P) {
    const out = [`<g data-name="bell">`, ISO.tinted(ISO.T.wood, ISO.wbox(P, [-24, 22], [-12, 12], [TOP, TOP + 6], "mid"))];
    out.push(S(K.cylinder(-18, 0, 2.4, TOP + 6, 54, P, 18), { tone: "mid", crease: "none" }), ISO.wbox(P, [-20, GONG[0] + 2], [-2, 2], [TOP + 60, TOP + 63], "mid"));
    for (const y of [-5, 5]) {
      out.push(ISO.tinted(ISO.T.copper, S(K.cylinder(-2, y, 4.4, TOP + 6, 16, P, 24), { tone: "hi" }) + L(K.knurl(-2, y, 4.4, TOP + 6, TOP + 22, 14, P), { tone: "lo" })));
      out.push(S(K.cylinder(-2, y, 4.8, TOP + 22, 1.2, P, 24), { tone: "mid" }));
    }
    out.push(S(K.cylinder(GONG[0], 0, 1.4, GONG[2] + 11, TOP + 60 - GONG[2] - 11, P, 12), { tone: "mid" }));
    const F = zAx(GONG);
    out.push(ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 16], [0.8, 16, 1], [4, 15, 1], [8, 11.5, 1], [10.5, 6, 1], [11.4, 0]], F, P), { tone: "hi" })));
    out.push(ISO.wbox(P, [-20, 8], [-3, 3], [TOP + 23, TOP + 25], "mid"));
    out.push(`</g>`);
    return out.join("");
  }
  function hammerSvg(P, th) {
    const tip = [PIV[0] + 12 * Math.cos(th) + 23 * Math.sin(th), 0, PIV[2] - 12 * Math.sin(th) + 23 * Math.cos(th)];
    const out = [ISO.wbox(P, [2, PIV[0] + 1], [-3, 3], [PIV[2] - 1.2, PIV[2] + 0.4], "mid")];
    out.push(`<path d="${K.segment(PIV, tip, P)}" stroke="#55575c" stroke-width="1.6" stroke-linecap="round"/>`, S(G.sphereOf(tip, 3.4, P), { tone: "hi", lit: true }));
    return out.join("");
  }
  function jarSvg(P) {
    const F = zAx([0, 0, TOP]), prof = [[0, 47], [56, 47, 1]];
    for (let k = 1; k <= 11; k++) { const a = (k / 12) * (Math.PI / 2); prof.push([56 + 40 * Math.sin(a), 47 * Math.cos(a), 1]); }
    prof.push([95.8, 4.5]);
    return `<g class="bj-glass" data-name="jar" style="${ISO.T.glass}">${S(G.solidOf(prof, F, P), { tone: "hi" })}` +
      S(G.ringBand(0, 3, 46, 50, F, P), { tone: "hi" }) + S(G.disc(95.5, 101, 4.5, F, P), { tone: "hi" }) + S(G.sphereOf([0, 0, TOP + 106], 6.5, P), { tone: "hi" }) +
      `<path d="${K.pathOf([[-26, 39, 30], [-26, 39, 60], [-24, 40, 74]].map((p) => K.iso(p, P)))}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/></g>`;
  }

  ISO.add({
    name: "belljar", title: "Bell in a bell jar", compare: "belljar 450 260 300",
    about: "An electric bell rings inside a bell jar; pump the air out and the hammer still strikes but the sound fades away: sound needs a medium.",
    line: "belljar cx cy size air=0|1 lab=1 lit=jar|bell|pump|battery",
    demo: { line: "belljar 480 270 320 air=1", script: [{ set: {}, hold: 2.5 }, { set: { pump: 1 }, hold: "settle" }, { set: { air: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.25;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, TOP + 113], [150, 0, 48]], cx, cy, W, H, { azimuth: 55, elevation: 22 }, parent);
      const s = { p: o.air === "1" ? P0 : 0.2, pump: false, vent: false, clock: 0 };
      const style = `<style>.bj-glass .iso-fill{fill-opacity:.12}.bj-glass .iso-shade,.bj-glass .iso-top{opacity:.28}</style>`;
      g.innerHTML = style + `<g>${baseSvg(P)}${bellSvg(P)}</g><g data-part="hammer" data-name="bell"></g><g data-part="needle"></g><g>${jarSvg(P)}</g><g data-part="rings"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "bell";
      const gongAt = K.iso([GONG[0], 0, GONG[2] + 6], P), sc = K.screenRise(1, P);
      const draw = () => {
        const beat = (s.clock * 7) % 1, th = ISO.still() ? 0 : 0.28 * Math.max(0, Math.sin(beat * 2 * Math.PI));
        w.rebuild(el.hammer, th.toFixed(3), () => hammerSvg(P, th));
        const vac = 1 - s.p / P0, a = (-135 + 270 * vac) * (Math.PI / 180), F = yAx([131, 4.7, 28]);
        w.rebuild(el.needle, vac.toFixed(3), () => {
          const ticks = [];
          for (let k = 0; k <= 10; k++) { const b = (-135 + 27 * k) * (Math.PI / 180); ticks.push(K.segment(G.pointOf(F, 0, 8.4, b - Math.PI / 2), G.pointOf(F, 0, k % 5 ? 7.2 : 6.4, b - Math.PI / 2), P)); }
          return L(G.circleOf(F, 0, 8.4, P), { tone: "lo" }) + L(ticks.join(""), { tone: "mid" }) +
            L(K.segment(G.pointOf(F, 0.1, 1.6, a + Math.PI / 2), G.pointOf(F, 0.1, 7.6, a - Math.PI / 2), P), { tone: "hi", free: true }) + D([K.iso(G.pointOf(F, 0.1, 0, 0), P)], { size: 1, tone: "hi" });
        });
        const loud = ISO.clamp(s.p / P0, 0, 1);
        w.rebuild(el.rings, loud < 0.01 ? "none" : `${loud.toFixed(2)} ${(s.clock % 10).toFixed(2)}`, () => {
          if (loud < 0.01) return "";
          let d = "";
          const out = [];
          for (let k = 0; k < 4; k++) {
            const f = ((s.clock * 0.9 + k / 4) % 1), r = (18 + f * 90) * sc, op = loud * Math.sin(f * Math.PI) * 0.9;
            for (const [a0, a1] of [[-40, 40], [140, 220]]) { const p0 = (a0 * Math.PI) / 180, p1 = (a1 * Math.PI) / 180; d = `M${gongAt[0] + r * Math.cos(p0)} ${gongAt[1] + r * Math.sin(p0)}A${r} ${r} 0 0 1 ${gongAt[0] + r * Math.cos(p1)} ${gongAt[1] + r * Math.sin(p1)}`; out.push(`<path d="${d}" fill="none" stroke="#2b6cc4" stroke-width="2" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`); }
          }
          return out.join("");
        });
        w.rebuild(el.words, lab ? (loud < 0.05 ? "q" : "l") : "", () => !lab ? "" :
          ISO.word(K.iso([0, 0, TOP + 113], P), "bell jar", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([0, 12, TOP], P), "electric bell", "#555", { size: 13, dy: 22 }) +
          ISO.word(K.iso([146, 6, 47], P), "vacuum pump", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([-121, -27, 38], P), "battery", "#555", { size: 13, dy: -8 }) +
          ISO.word(K.iso([0, 60, 0], P), loud < 0.05 ? "air pumped out: no sound" : "air inside: we hear the bell", loud < 0.05 ? TXT.red : TXT.blue, { size: 15, dy: 26 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.pump !== undefined) { s.pump = !!+p.pump; if (s.pump) s.vent = false; }
        if (p.air !== undefined) { s.vent = !!+p.air; if (s.vent) s.pump = false; else s.p = 0.2; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt, clock) => {
        s.clock = clock ?? s.clock + dt;
        let moving = false;
        if (s.pump && s.p > 0.2) { s.p = ISO.still() ? 0.2 : Math.max(0.2, s.p * Math.exp(-dt / 1.6)); moving = s.p > 0.2; }
        if (s.vent && s.p < P0) { s.p = ISO.still() ? P0 : P0 - (P0 - s.p) * Math.exp(-dt / 0.5); if (P0 - s.p < 0.05) s.p = P0; moving = s.p < P0; }
        draw();
        return moving;
      };
      g.readout = () => {
        const pc = (100 * s.p) / P0;
        return `air in the jar ${s.p.toFixed(1)} kPa (${pc.toFixed(0)}% of ${P0} kPa) · hammer still striking · ${pc < 2 ? "no sound reaches you: sound needs a medium" : pc < 60 ? "sound fading: less air to carry it" : "you hear the bell through the air"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
