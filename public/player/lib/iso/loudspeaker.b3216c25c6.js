// "loudspeaker cx cy k click=0|1 lab=0 lit=cabinet|cone|yoke|stand" — a PART (PARTS.md, batch 5): a school loudspeaker
// on a pole stand, its origin the floor point under the middle of the stand's round base. A cast base 28 cm across on a
// rubber ring, a steel pole with a telescopic top and its locking knob, a U yoke whose two pivot knobs hold the cabinet,
// and the cabinet itself: 15 cm deep (x), 20 cm wide (y), 22 cm tall, its top 100 cm over the floor, the front baffle
// facing +x with a 16 cm woofer (steel frame with four screws, rubber surround, cone, dust cap), four corner screws and
// a lead from the back down the pole. set({ click: 1 }) sends one click: the cone jumps out and rings down (a damped
// wobble, drawn slower and bigger than true). Reused from echo.js (its stand, yoke, cabinet and woofer).
// World units: 1 = 1 cm. anchors: cone (the dust cap's front, where the sound starts) top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FX = 7.5, HY = 10, Z0 = 78, Z1 = 100, ZP = 89, ZC = 89.5, YK = 11.6, POLE = 74;
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const CAB = ISO.tint("#3a3e44", ["#1f2226", "#272a2f", "#2f3338", "#363a40"], "#0d0e10");
  const PAINT = ISO.tint("#d5dde6", ["#7d8b99", "#909dab", "#a3afbb", "#b8c2cc"], "#2b3640");

  // the stand: rubber ring, cast base, pole, the locking collar with its knob (+y), the inner pole up to the yoke
  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -14, y: -14, w: 28, d: 28, r: 14 }, 0, 3, P)}"/>`];
    out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 13.4, 0, 0.6, P, 40), { tone: "lo" })));
    out.push(ISO.tinted(PAINT, S(G.lathe([[0, 0], [0, 14], [0.8, 14], [2.2, 11, 1], [3, 3], [3, 0]], G.frameOf([0, 0, 0.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 40 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.6, 3.6, 62 - 3.6, P, 20), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(PAINT, S(K.cylinder(0, 0, 2.2, 62, 3, P, 24, 0.2), { tone: "mid" })));
    const F = Y([0, 0, 63.5]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(2.1, 3.2, 0.4, F, P), { tone: "mid" })), window.B03.knob(P, F, 3.2, 4.6, 1.2));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.2, 65, POLE - 65, P, 18), { tone: "hi", crease: "none" })));
    return out.join("");
  }
  // the yoke: a spigot on the pole, the cross bar under the cabinet and an arm up each side; `near` the +y arm + knob
  const arm = (P, y0, y1) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [-1.5, 1.5], [y0, y1], [POLE + 1, ZP + 1.8], "mid"));
  function yokeBack(P) {
    return ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.5, POLE, 1.2, P, 18), { tone: "mid" }) + ISO.wbox(P, [-1.5, 1.5], [-YK - 0.8, YK + 0.8], [POLE + 0.2, POLE + 1.2], "mid")) +
      arm(P, -YK - 0.8, -YK) + ISO.tinted(ISO.T.plastic, S(G.disc(-YK - 2.6, -YK - 0.8, 1.6, Y([0, 0, ZP]), P), { tone: "mid" }));
  }
  function yokeFront(P) {
    const F = Y([0, 0, ZP]);
    return arm(P, YK, YK + 0.8) + ISO.tinted(ISO.T.steel, S(G.disc(YK + 0.8, YK + 1.2, 0.5, F, P), { tone: "mid" })) + window.B03.knob(P, F, YK + 1.2, YK + 3, 1.6);
  }
  // the cabinet (its lead goes out of the back, behind the pole), the baffle's frame screws and corner screws, a badge
  function cabinetSvg(P) {
    const out = [ISO.tinted(CAB, S(K.slabOf({ x: -FX, y: -HY, w: 2 * FX, d: 2 * HY, r: 0.8 }, Z0, Z1 - Z0, P, 3, 0.4), { tone: "hi" }))];
    out.push(ISO.tinted(CAB, ISO.wbox(P, [FX - 0.02, FX + 0.4], [-HY + 0.4, HY - 0.4], [Z0 + 0.4, Z1 - 0.4], "mid")));
    out.push(D([[-HY + 1.4, Z0 + 1.4], [HY - 1.4, Z0 + 1.4], [-HY + 1.4, Z1 - 1.4], [HY - 1.4, Z1 - 1.4]].map(([y, z]) => K.iso([FX + 0.41, y, z], P)), { size: 0.5 }));
    out.push(`<path d="${K.pathOf([[FX + 0.41, -3, Z0 + 1.0], [FX + 0.41, 3, Z0 + 1.0], [FX + 0.41, 3, Z0 + 1.9], [FX + 0.41, -3, Z0 + 1.9]].map((p) => K.iso(p, P)), true)}" fill="#c7cbd0" stroke="#55534c" stroke-width="0.5"/>`);
    return out.join("");
  }
  const lead = (P) => `<path d="${K.pathOf([[-FX + 0.5, 3, Z0 + 3], [-FX - 1.5, 3, Z0 - 1], [-1.9, 1.2, POLE - 4], [-1.9, 1.2, 4], [-3, 0, 3.1]].map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.5).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // the woofer on the baffle (x = FX + 0.4): the cone and dust cap (they move), then the frame ring with its screws
  const B = FX + 0.4;
  // the cone seen through the frame: the rubber surround, then rings further in and darker, the dust cap with its shine
  function coneSvg(P) {
    const F = X([B, 0, ZC]), ell = (s, r) => K.pathOf(Array.from({ length: 40 }, (_, i) => K.iso(G.pointOf(F, s, r, (i / 40) * Math.PI * 2), P)), true);
    const rings = [[0.1, 7.4, "#2c2d31"], [-0.1, 6.5, "#55585e"], [-0.8, 5.2, "#4b4e54"], [-1.5, 3.9, "#43464b"], [-2.1, 2.6, "#3b3e43"]];
    return rings.map(([s, r, c]) => `<path d="${ell(s, r)}" fill="${c}" stroke="#16171a" stroke-width="0.4"/>`).join("") +
      `<path d="${ell(-1.9, 1.9)}" fill="#6b6f76" stroke="#16171a" stroke-width="0.5"/>` +
      `<path d="${G.arcOf(F, -1.85, 1.3, P, { from: 1.9, to: 2.9 })}" fill="none" stroke="#a9adb3" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.18).toFixed(2)}" stroke-linecap="round"/>` +
      `<path d="${G.arcOf(F, 0.12, 7, P, { from: 1.6, to: 3.0 })}" fill="none" stroke="#6d7076" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.2).toFixed(2)}" stroke-linecap="round"/>`;
  }
  function frameSvg(P) {
    const F = X([B, 0, ZC]);
    return ISO.tinted(ISO.T.steel, S(G.ringBand(0, 0.5, 7.4, 8.2, F, P), { tone: "mid" })) +
      D([0.785, 2.356, 3.927, 5.498].map((a) => K.iso(G.pointOf(F, 0.51, 7.8, a), P)), { size: 0.45 });
  }

  ISO.add({
    name: "loudspeaker", title: "Loudspeaker on a stand (part)", compare: null,
    about: "A loudspeaker cabinet (15 × 20 × 22 cm) held in a yoke on a 1 m pole stand with a round base, its woofer facing +x; it sends a short click. anchors: cone top",
    line: "loudspeaker cx cy k click=0|1 lab=0 lit=cabinet|cone|yoke|stand",
    demo: { line: "loudspeaker 480 500 4.4 lab=1", script: [{ set: {}, hold: 1 }, { set: { click: 1, lit: "cone" }, hold: 1.6 }, { set: { lit: "yoke" }, hold: 1.2 }, { set: { click: 1, lit: "stand" }, hold: 1.6 }, { set: { lit: "cabinet" }, hold: 1 }] },
    make([cx = 480, cy = 500, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { t: o.click === "1" ? 0 : -1, e: 0 };
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="cabinet">${lead(P)}</g><g data-name="stand">${standSvg(P)}</g><g data-name="yoke">${yokeBack(P)}</g>` +
        `<g data-name="cabinet">${cabinetSvg(P)}</g><g data-name="cabinet">${frameSvg(P)}</g><g data-name="cone" data-part="cone">${coneSvg(P)}</g><g data-name="yoke">${yokeFront(P)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [0, 0, Z1 + 2], "loudspeaker", "#556", { dy: -6 }) + LAB.word(P, lab, [0, 14, 2], "stand", "#556", { anchor: "start" });
      g.anchors = { cone: [B + 0.1, 0, ZC], top: [0, 0, Z1] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => { w.attr(el.cone, "transform", K.translateAlong(P, [Math.round(st.e * 100) / 100, 0, 0])); LAB.light(w, g, lit); };
      g.set = (p) => {
        if (p.click !== undefined && +p.click) st.t = 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the click: the cone jumps out 0.6 cm (true: under a millimetre) and rings down, a 6 Hz wobble on screen
      g.update = (dt) => {
        if (st.t >= 0) { st.t = ISO.still() ? 9 : st.t + dt; st.e = st.t > 1.2 ? 0 : 0.6 * Math.exp(-st.t / 0.22) * Math.cos(2 * Math.PI * 6 * st.t); if (st.t > 1.2) st.t = -1; }
        draw();
        return st.t >= 0;
      };
      g.readout = () => (st.t >= 0 ? "click! the cone jumps out and back, sending one short pulse of sound" : "loudspeaker on its stand · cabinet 15 × 20 × 22 cm, its top 1 m up · woofer facing +x");
      draw();
      return g;
    },
  });
})();
