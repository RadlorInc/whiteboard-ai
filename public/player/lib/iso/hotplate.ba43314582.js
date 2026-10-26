// "hotplate cx cy k heat=0..1 lab=0 lit=body|top|knob|lamp" — a PART (PARTS.md, batch 5): a lab hot plate standing on
// the bench, its origin the bench point under its middle. A painted steel case 12.4 × 13 cm and 3 cm tall on four
// rubber feet, vent slots in its side, a ceramic top with the heating ring printed on it, a ribbed knob with a 0–6
// scale and a pilot lamp on the front (+y), a maker's plate. Reused from beakertherm.js (its plate and knob), built in
// mm with Pm = ISO.mm(P); anchors in cm. set({ heat }) turns the knob: the ring glows warmer and the lamp lights.
(() => {
  const K = window.K, G = window.G;
  const PLATE = { x: -62, y: -62, w: 124, d: 130, r: 8 }, TOP = 30, KX = 30, LX = -30, KZ = 13, FY = PLATE.y + PLATE.d;
  const CERAMIC = ISO.tint("#e9e4dc", ["#b9b2a4", "#c6bfb1", "#d2ccbf", "#ddd8cc"], "#6d6658");

  ISO.add({
    name: "hotplate", title: "Hot plate (part)", compare: null,
    about: "A lab hot plate: a steel case on rubber feet, a ceramic top with its heating ring, a knob with a 0–6 scale and a pilot lamp; turn it up and the ring glows warmer. anchors: top",
    line: "hotplate cx cy k heat=0..1 lab=0 lit=body|top|knob|lamp",
    demo: { line: "hotplate 480 320 34 heat=0", script: [{ set: {}, hold: 1 }, { set: { heat: 0.5, lit: "knob" }, hold: "settle" }, { set: { heat: 1, lit: "top" }, hold: "settle" }, { set: { heat: 0.2, lit: "lamp" }, hold: "settle" }, { set: { lit: "body" }, hold: 1.2 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const h0 = ISO.clamp(ISO.num(o, "heat", 0), 0, 1), st = { h: h0 }, want = { h: h0 };
      let lit = o.lit || "";
      // the case: feet, the painted body with a seam, vent slots on the +x side, a maker's plate on the front
      const body = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf(PLATE, 0, TOP, Pm)}"/>`];
        for (const [x, y] of K.corners(PLATE, 10).sort((a, b) => K.depthOf([a[0], a[1], 0], Pm) - K.depthOf([b[0], b[1], 0], Pm))) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 4, 0, 2.5, Pm, 16), { tone: "lo" })));
        out.push(ISO.tinted(ISO.T.paint, S(K.slabOf(PLATE, 2.5, TOP - 6, Pm, 6, 0.8), { tone: "mid", inner: L(K.sideSeam(PLATE, 6, Pm, 6), { tone: "faint" }) })));
        const xs = PLATE.x + PLATE.w + 0.05, slots = [];
        for (let i = 0; i < 7; i++) { const y = -40 + i * 11; slots.push(K.pathOf([[xs, y, 11], [xs, y + 5, 11], [xs, y + 5, 21], [xs, y, 21]].map((p) => K.iso(p, Pm)), true)); }
        out.push(`<path d="${slots.join("")}" fill="#2c3b4c" fill-opacity=".55" stroke="#33506f" stroke-width="0.5"/>`);
        // the maker's plate between the lamp and the knob, its two rivets and three printed rows
        const fy = FY + 0.05, at = (x, z) => K.iso([x, fy, z], Pm);
        out.push(`<path d="${K.pathOf([at(-18, 7), at(14, 7), at(14, 19), at(-18, 19)], true)}" fill="#eef0f2" stroke="#55534c" stroke-width="0.5"/>`);
        out.push(`<path d="${[16, 13, 10].map((z, i) => K.pathOf([at(-15, z), at(11 - i * 6, z)])).join("")}" stroke="#8a877f" stroke-width="0.4"/>`, D([at(-16.5, 17.5), at(12.5, 8.5)], { size: 0.35 }));
        return out.join("");
      };
      // the ceramic top on its steel rim; the heating ring and the centre mark printed on it, warmer with heat
      const top = (h) => {
        const ring = (r, z) => K.pathOf(K.circleRing(0, 0, r, 64).map(([a, b]) => K.iso([a, b, z], Pm)), true);
        const out = [ISO.tinted(ISO.T.steel, S(K.slabOf(K.insetPlan(PLATE, 1), TOP - 6, 2.5, Pm, 6, 0.6), { tone: "mid" })), ISO.tinted(CERAMIC, S(K.slabOf(K.insetPlan(PLATE, 3), TOP - 3.5, 3.5, Pm, 6, 0.6), { tone: "hi" }))];
        out.push(`<path d="${ring(46, TOP + 0.05)}" fill="${LAB.mix("#e4ded4", "#f06a3a", h * 0.75)}" stroke="#9a9286" stroke-width="0.6"/>`);
        out.push(`<path d="${ring(36, TOP + 0.06)}${ring(24, TOP + 0.06)}" fill="none" stroke="${LAB.mix("#b9b2a4", "#d8401c", h)}" stroke-width="${(0.6 + h * 0.8).toFixed(2)}"/>`);
        out.push(`<path d="${ring(4, TOP + 0.07)}" fill="${LAB.mix("#c6bfb1", "#c43a18", h)}" stroke="#6d6658" stroke-width="0.5"/>`);
        return out.join("");
      };
      // the knob on the front: its boss, the ribbed cap, a pointer line; scale dots 0..6 round it
      const knob = (h) => {
        const F = LAB.Y([KX, FY, KZ]), a = -2.3 + h * 4.6, out = [];
        const dots = []; for (let i = 0; i <= 6; i++) dots.push(K.iso(G.pointOf(F, 0.05, 10.5, -2.3 + (i / 6) * 4.6), Pm));
        out.push(D(dots, { size: 0.8, tone: "mid" }));
        out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 2, 8.6, F, Pm), { tone: "mid" }) + S(G.disc(2, 8, 7, F, Pm), { tone: "hi", inner: L(G.ribsOf(F, 2, 8, 7, 30, Pm, { seams: true }), { tone: "lo" }) })));
        out.push(`<path d="${K.pathOf([K.iso(G.pointOf(F, 8.05, 1.5, a), Pm), K.iso(G.pointOf(F, 8.05, 6, a), Pm)])}" stroke="#f4f4f0" stroke-width="1.1" stroke-linecap="round"/>`);
        return out.join("");
      };
      // the pilot lamp: a chrome bezel with a red lens, lit while the plate is on
      const lamp = (on) => { const F = LAB.Y([LX, FY, KZ]); return ISO.tinted(ISO.T.steel, S(G.disc(0, 1.5, 4.2, F, Pm), { tone: "hi" })) + `<path d="${G.circleOf(F, 1.55, 3, Pm)}" fill="${on ? "#ff5a2d" : "#7a3a2a"}" stroke="#3a1a10" stroke-width="0.6"/>` + (on ? `<path d="${G.circleOf(F, 1.6, 5.6, Pm)}" fill="#ff8a4a" fill-opacity=".25"/>` : ""); };
      g.innerHTML = `<g data-name="body">${body()}</g><g data-name="top" data-part="top"></g><g data-name="knob" data-part="knob"></g><g data-name="lamp" data-part="lamp"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, TOP / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const h = Math.round(st.h * 50) / 50, on = want.h > 0.02;
        w.rebuild(el.top, String(h), () => top(h));
        w.rebuild(el.knob, String(h), () => knob(h));
        w.rebuild(el.lamp, String(on), () => lamp(on));
        if (lab) w.rebuild(el.words, String(Math.round(want.h * 6)), () => LAB.word(Pm, lab, [PLATE.x + PLATE.w, FY, 0], "hot plate", "#556", { anchor: "start", dy: 14 }) + LAB.word(Pm, lab, [KX, FY, KZ + 14], `setting ${Math.round(want.h * 6)}`, "#8a5a10", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.heat !== undefined && Number.isFinite(+p.heat)) want.h = ISO.clamp(+p.heat, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.h = ISO.follow(st.h, want.h, dt, 0.6, ISO.still());
        if (Math.abs(st.h - want.h) < 0.004) st.h = want.h;
        draw();
        return st.h !== want.h;
      };
      g.readout = () => `hot plate · setting ${(want.h * 6).toFixed(1)} of 6 · ${want.h > 0.02 ? `on, top about ${Math.round(20 + want.h * 330)} °C` : "off"} · 12.4 × 13 cm, 3 cm tall`;
      draw();
      return g;
    },
  });
})();
