// "vial cx cy size k=vial|dose ml=0.1-3 lbl=0 lab=0 lit=vial|stopper|cap|syringe|plunger|needle |text" — a medicine vial.
// A 10 mL glass vial: liquid inside, a printed label (`text`, default Vaccine), the grey rubber stopper held on by an
// aluminium crimp cap, its coloured flip-off top on. k=dose: the flip-off top is gone and a 3 mL syringe stands in the
// stopper, its needle tip in the liquid. Done the proper way: the plunger first pushes in as much air as the dose
// (so the vial doesn't pull back), then draws the dose; ml= sets it (default 0.5). Read the dose at the plunger's
// front edge. 1 mL of the barrel is 17 mm long; 1 mL in the vial is 2.6 mm of depth.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. Vial on the table at the origin, axis up.
  const VR = 12, RI = 10.8, FULL = 10, B0 = 2, PER_ML = 1000 / (Math.PI * RI * RI), STOP = 45;
  const HUB = 52, BAR0 = 60, BR = 4.8, BRI = 4.3, PER = 1000 / (Math.PI * BRI * BRI), TIP = 14;
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const STYLE = `<style>.vl-clear .iso-fill{fill-opacity:.22}.vl-clear .iso-shade{fill-opacity:.42}.vl-clear .iso-top{fill-opacity:.3}</style>`;
  const LIQ = ISO.tint("#e8f1fa", ["#b4cce4", "#c3d6ea", "#d1e0ef", "#dde8f4"], "#3d6488");
  const RUBBER = ISO.tint("#8c9198", ["#53585e", "#5e6369", "#6a6f75", "#767b81"], "#25282c");

  function liquidSvg(P, ml) {
    const h = B0 + ml * PER_ML;
    return ISO.tinted(LIQ, S(K.cylinder(0, 0, RI, B0, h - B0, P, 48), { tone: "hi", crease: "none" }));
  }
  function glassSvg(P, text, lab) {
    const F = up(0, 0, 0), out = [];
    out.push(`<g class="vl-clear">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, VR - 2], [1, VR - 0.4, 1], [2.4, VR], [32, VR], [34, VR - 1, 1], [37, 7.6, 1], [38.5, 6.8]], F, P), { tone: "hi" }))}</g>`);
    // the label: a paper band round the body, its print facing you
    out.push(ISO.tinted(ISO.tint("#fbfbfa", ["#d9dbdd", "#e3e5e6", "#ecedee", "#f4f4f5"], "#6b7480"), S(G.disc(8, 28, VR + 0.15, F, P), { tone: "hi", inner: L(G.arcOf(F, 12, VR + 0.15, P) + G.arcOf(F, 24, VR + 0.15, P), { tone: "faint" }) })));
    const a = G.angleToward(F, G.viewOf(P)), at = (s, t) => G.pointOf(F, s, VR + 0.3, a + t / VR);
    const [O, X, Y] = [at(22, 8), at(22, 7), at(21, 8)].map((p) => K.iso(p, P));
    const m = `matrix(${X[0] - O[0]} ${X[1] - O[1]} ${Y[0] - O[0]} ${Y[1] - O[1]} ${O[0]} ${O[1]})`;
    out.push(`<g transform="${m}">${lab ? `<text x="8" y="0.4" text-anchor="middle" fill="#1f3550" style="font:700 3.6px 'Helvetica Neue',Arial,sans-serif">${text}</text>` : ""}<text x="8" y="5.6" text-anchor="middle" fill="#55606b" style="font:600 2.6px 'Helvetica Neue',Arial,sans-serif">10 mL · 0.5 mL dose</text></g>`);
    return out.join("");
  }
  // Rubber stopper, aluminium crimp, and (k=vial) the coloured flip-off top.
  function capSvg(P, flip) {
    const F = up(0, 0, 0), out = [];
    out.push(ISO.tinted(RUBBER, S(G.disc(38.5, 41, 7, F, P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[38, 8], [43.6, 8.2], [44.6, 7.6, 1], [45, 6.6]], F, P), { tone: "hi", inner: L(G.arcOf(F, 40, 8.05, P) + G.arcOf(F, 42, 8.1, P), { tone: "faint" }) })));
    out.push(ISO.tinted(RUBBER, S(G.disc(43.6, 45.2, 4.8, F, P), { tone: "mid" })), L(G.circleOf(F, 45.2, 1.6, P), { tone: "lo" }));
    if (flip) out.push(ISO.tinted(ISO.T.red, S(G.solidOf([[45, 8.6], [49, 8.6], [50.4, 8, 1], [50.8, 6.6]], F, P), { tone: "hi", inner: L(G.ribsOf(F, 45, 49, 8.6, 30, P, { seams: true }), { tone: "lo" }) })));
    return out.join("");
  }
  // The syringe above the stopper: needle (lower part inside the vial drawn earlier), hub, barrel with marks, plunger.
  const needleLow = (P) => S(G.disc(TIP, STOP + 0.2, 0.35, up(0, 0, 0), P), { tone: "hi" });
  function syringeSvg(P) {
    const F = up(0, 0, 0), out = [];
    out.push(S(G.disc(45.2, HUB, 0.35, F, P), { tone: "hi" }));
    out.push(ISO.tinted(ISO.T.blue, S(G.solidOf([[HUB, 1.4], [HUB + 3, 2.4], [HUB + 6, 2.4], [HUB + 6, 3.4], [HUB + 8, 3.4]], F, P), { tone: "hi" })));
    return out.join("");
  }
  // In the barrel: the column (air or liquid) up to the plunger, the plunger (built at 0 mL and slid up), the clear
  // barrel over them with its finger flange and the printed marks every 0.1 mL (long every 0.5).
  const columnSvg = (P, vol, air) => (vol > 0.005 ? ISO.tinted(air ? ISO.T.glass : LIQ, S(K.cylinder(0, 0, BRI, BAR0 + 0.6, 1.4 + vol * PER, P, 28), { tone: "hi", crease: "none" })) : "");
  function plungerSvg(P) {
    const F = up(0, 0, 0), out = [], tipZ = BAR0 + 2;
    out.push(ISO.tinted(RUBBER, S(G.disc(tipZ, tipZ + 4, BRI, F, P), { tone: "mid", inner: L(G.arcOf(F, tipZ + 1.3, BRI, P) + G.arcOf(F, tipZ + 2.7, BRI, P), { tone: "lo" }) })));
    const top = tipZ + 64;
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [-3.4, 3.4], [-0.5, 0.5], [tipZ + 4, top], "mid") + ISO.wbox(P, [-0.5, 0.5], [-3.4, 3.4], [tipZ + 4, top], "mid")));
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(top, top + 1.6, 6.2, F, P), { tone: "hi" })));
    return out.join("");
  }
  function barrelSvg(P) {
    const F = up(0, 0, 0), out = [];
    out.push(`<g class="vl-clear">${ISO.tinted(ISO.T.glass, S(G.solidOf([[BAR0 - 2, 3.4], [BAR0, BR], [BAR0 + 56, BR]], F, P), { tone: "hi" }))}</g>`);
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [-11, 11], [-4.4, 4.4], [BAR0 + 56, BAR0 + 57.6], "hi")));
    const a = G.angleToward(F, G.viewOf(P)), marks = [], nums = [];
    for (let i = 0; i <= 30; i++) {
      const z = BAR0 + 2 + (i / 10) * PER, half = i % 5 ? 0.18 : 0.42, arc = Array.from({ length: 7 }, (_, k) => K.iso(G.pointOf(F, z, BR + 0.05, a - 0.5 + (k / 6) * half * 2.2), P));
      marks.push(K.pathOf(arc));
      if (i % 5 === 0 && i) { const q = K.iso(G.pointOf(F, z, BR, a + 0.75), P); nums.push(`<text x="${q[0].toFixed(1)}" y="${(q[1] + 1.4).toFixed(1)}" fill="#1f3550" style="font:600 4px 'Helvetica Neue',Arial,sans-serif">${i / 10}</text>`); }
    }
    out.push(`<path d="${marks.join("")}" stroke="#1f3550" stroke-width="0.5" fill="none"/>${nums.join("")}`);
    return out.join("");
  }

  ISO.add({
    name: "vial", title: "Medicine vial and syringe", compare: "vial 480 270 300 k=vial |Vaccine",
    about: "A 10 mL vial with its rubber stopper and crimp cap; with k=dose a syringe pushes in air equal to the dose, then draws the dose, read at the plunger's front edge.",
    line: "vial cx cy size k=vial|dose ml=0.1-3 lbl=0 lab=0 lit=vial|stopper|cap|syringe|plunger|needle |text",
    demo: { line: "vial 480 270 300 k=dose ml=0.5 |Vaccine", script: [{ set: { step: "air", lit: "plunger" }, hold: "settle" }, { set: { step: "draw", lit: "syringe" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", dose = o.k === "dose", dl = ISO.clamp(ISO.num(o, "ml", 0.5), 0.1, 3);
      const W = size * (dose ? 1.25 : 1.15), H = size * (dose ? 1.5 : 1.05);
      const top = dose ? BAR0 + 2 + dl * PER + 68 : 52;
      const pts = [[-30, -30, -3], [30, 30, -3], [-30, 30, -3], [30, -30, -3], [0, 0, top], ...(dose ? [[11, 4, BAR0 + 57]] : [])];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 45, elevation: 18 }, parent);
      const T = { x: -30, y: -30, w: 60, d: 60, r: 6 };
      g.innerHTML = STYLE + `<g>${ISO.tinted(ISO.T.wood, S(K.slabOf(T, -3, 3, P, 4, 0.6), { tone: "lo", inner: L(K.sideSeam(T, -1.5, P, 4), { tone: "faint" }) }))}<path class="iso-halo" d="${K.haloOf({ x: -VR, y: -VR, w: 2 * VR, d: 2 * VR, r: VR }, 0, 4, P)}"/></g>` +
        `<g data-name="needle-low">${dose ? needleLow(P) : ""}</g><g data-name="liquid"></g><g data-name="vial">${glassSvg(P, text || "Vaccine", lab)}</g><g data-name="stopper">${capSvg(P, !dose)}</g>` +
        `<g data-name="needle">${dose ? syringeSvg(P) : ""}</g><g data-name="syringe">${dose ? `<g data-part="col"></g><g data-name="plunger" data-part="plunger">${plungerSvg(P)}</g>${barrelSvg(P)}` : ""}</g><g data-part="words"></g>`;
      const nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      // vol: what is in the barrel (air first, then liquid); vial: what is left in the vial
      const s = { step: dose ? "ready" : "none", vol: dose ? dl : 0, want: dose ? dl : 0, air: true, vial: 8, lit: o.lit || "" };
      if (lab) {
        const word = (p, t2, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t2, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([-VR, 0, 20], "Vial", "end", 4, -6) + word([VR, 0, 42], dose ? "Rubber stopper" : "Crimp cap and stopper", "start", 4, 6) +
          (dose ? word([-BR, 0, BAR0 + 30], "Syringe", "end", 4, -8) + word([BR, 0, HUB - 2], "Needle", "start", 4, 6) + word([-6.2, 0, BAR0 + 67 + dl * PER], "Plunger", "end", 4, -6) : "");
      }
      const draw = () => {
        w.rebuild(nm("liquid"), s.vial.toFixed(2), () => liquidSvg(P, s.vial));
        if (dose) {
          w.rebuild(g.querySelector('[data-part="col"]'), `${s.vol.toFixed(3)} ${s.air}`, () => columnSvg(P, s.vol, s.air));
          w.attr(g.querySelector('[data-part="plunger"]'), "transform", K.translateAlong(P, [0, 0, s.vol * PER]));
        }
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => {
        if (p.step === "air" && dose) { s.step = "air"; s.want = 0; }
        if (p.step === "draw" && dose) { s.step = "draw"; s.want = dl; s.air = false; }
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), before = s.vol;
        // the plunger moves at about 0.25 mL a second
        s.vol = calm ? s.want : Math.abs(s.want - s.vol) < 0.25 * dt ? s.want : s.vol + Math.sign(s.want - s.vol) * 0.25 * dt;
        if (s.step === "draw") s.vial = 8 - s.vol;
        draw();
        return s.vol !== s.want || before !== s.vol;
      };
      g.readout = () => {
        if (!dose) return `${s.vial} mL in a 10 mL vial · flip off the coloured top and wipe the rubber with alcohol before drawing a dose`;
        if (s.step === "ready") return `${dl} mL of air drawn into the syringe · needle through the stopper`;
        if (s.step === "air") return s.vol > 0 ? "pushing the air into the vial…" : `${dl} mL of air pushed in · now the vial won't suck the plunger back`;
        return `${s.vol.toFixed(2)} mL drawn up (read at the plunger's front edge) · ${s.vial.toFixed(2)} mL left in the vial`;
      };
      draw();
      return g;
    },
  });
})();
