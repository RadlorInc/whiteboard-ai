// "lens cx cy size k=convex|concave f=15 screen=35 lab=1 lit=…" — a lens in a holder on an optical bench.
// A ray box throws five parallel rays along the bench; a convex lens (f = 15 cm) bends them to meet at its focal point
// F, a concave one (f = −15 cm) spreads them as if they came from a virtual F on the lamp side. A white screen on a
// carriage slides along the bench: the patch of light on it is 5 cm × |1 − d/f| across (thin lens), smallest — a
// sharp point — when the screen is at F. set({ screen: cm }) slides the screen; the readout gives the focal length.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CM = 4, BOARD = { x: -180, y: -40, w: 360, d: 76, r: 7 }, LX = 30, BEAM = 44, RB = 118, OFF = [-10, -5, 0, 5, 10];
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const ray = (P, pts, color = "#e09a00", w = 1.2, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
  const carriage = (P, x, w = 10) => ISO.wbox(P, [x - w, x + w], [-10, 10], [6, 11], "mid") + ISO.wbox(P, [x - w + 2, x + w - 2], [10, 11.5], [7, 10], "mid") +
    S(K.cylinder(x, 15, 2.6, 7.5, 1, P, 16), { tone: "mid" }) + ISO.tinted(ISO.T.plastic, S(G.disc(11.5, 15, 2.4, G.frameOf([x, 0, 8.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));

  function backSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { ruler: { zero: LX } }), ISO.plate(P, { x: -170, y: -34, w: 38, d: 12, r: 1.2 })];
    // The bench rail: a long bar on two end blocks, with a groove down its top.
    for (const x of [-168, 160]) out.push(ISO.wbox(P, [x, x + 8], [-12, 12], [0, 2], "mid"));
    out.push(ISO.wbox(P, [-172, 172], [-7, 7], [2, 6], "mid"), L(K.lineOnTop([-172, 0], [172, 0], 6, P), { tone: "faint" }));
    return out.join("");
  }
  function lensSvg(P, concave) {
    const F = xAx([LX, 0, BEAM]), out = [carriage(P, LX)];
    out.push(S(K.cylinder(LX, 0, 2, 11, BEAM - 23.5 - 11, P, 18), { tone: "mid", crease: "none" }), S(K.cylinder(LX, 0, 3, BEAM - 26.5, 3, P, 18), { tone: "mid" }));
    const prof = concave ? [[-1, 0], [-1.25, 7, 1], [-2.1, 14, 1], [-3.2, 19, 1], [-3.4, 20], [3.4, 20], [3.2, 19, 1], [2.1, 14, 1], [1.25, 7, 1], [1, 0]]
      : Array.from({ length: 15 }, (_, k) => { const a = ((k + 0.5) / 15) * Math.PI; return [-3.8 * Math.cos(a), 20 * Math.sin(a), 1]; });
    out.push(`<g class="ln-glass" style="${ISO.T.glass}">${S(concave ? G.lathe(prof, F, P) : G.solidOf(prof, F, P), { tone: "hi" })}</g>`);
    out.push(S(G.ringBand(-2.2, 2.2, 20, 22.6, F, P), { tone: "mid" }), D(G.dotsOf(F, 2.2, 21.3, 8, P, { fade: [0.04, 0.42], phase: 0.4 }), { size: 0.45 }));
    return out.join("");
  }
  function boxSvg(P) {
    const out = [carriage(P, RB + 18, 16)];
    out.push(ISO.wbox(P, [RB + 2, RB + 36], [-14, 14], [11, 64], "mid"), ISO.wbox(P, [RB, RB + 2], [-12, 12], [BEAM - 15, BEAM + 15], "hi"));
    for (let k = 0; k < 4; k++) out.push(L(K.planOutline({ x: RB + 6 + k * 7, y: -9, w: 3, d: 18, r: 1.4 }, 64, P, 3), { tone: "lo" }));
    const kF = G.frameOf([RB + 22, 14, 26], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(S(G.disc(0, 1.6, 4.4, kF, P), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(G.disc(1.6, 5, 3.4, kF, P), { tone: "hi" }) + L(G.ribsOf(kF, 1.6, 5, 3.4, 16, P, { seams: true }), { tone: "lo" })));
    out.push(D([[RB + 6, 14, 58], [RB + 32, 14, 58], [RB + 6, 14, 16], [RB + 32, 14, 16]].map((p) => K.iso(p, P)), { size: 0.5 }));
    return out.join("");
  }
  function screenSvg(P) {
    const out = [carriage(P, 0)];
    out.push(S(K.cylinder(0, 0, 2, 11, 2, P, 18), { tone: "mid" }), ISO.wbox(P, [-1, 3], [-4, 4], [13, 16], "mid"));
    out.push(ISO.wbox(P, [-2, 0], [-30, 30], [14, 74], "hi"));
    out.push(D([[-30 + 3, 17], [30 - 3, 17], [-30 + 3, 71], [30 - 3, 71]].map(([y, z]) => K.iso([0.05, y, z], P)), { size: 0.5 }));
    return out.join("");
  }

  ISO.add({
    name: "lens", title: "Lens on an optical bench", compare: "lens 480 270 300",
    about: "Parallel rays from a ray box through a convex lens meet at F (or spread from a virtual F for a concave one); slide the screen to the sharp focus.",
    line: "lens cx cy size k=convex|concave f=15 screen=35 lab=1 lit=lens|screen|raybox",
    demo: { line: "lens 480 280 300", script: [{ set: { screen: 34 }, hold: "settle" }, { set: { screen: 24 }, hold: "settle" }, { set: { screen: 15 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.95, H = size * 1.0, concave = o.k === "concave";
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-30, 0, 76], [RB + 36, 14, 66]], cx, cy, W, H, { azimuth: 62, elevation: 22 }, parent);
      const f = ISO.clamp(ISO.num(o, "f", 15), 8, 20) * (concave ? -1 : 1);
      const s = { d: ISO.clamp(ISO.num(o, "screen", 35), 6, 45) }; s.dT = s.d;
      const style = `<style>.ln-glass .iso-fill{fill-opacity:.55}.ln-glass .iso-shade,.ln-glass .iso-top{opacity:.55}</style>`;
      g.innerHTML = style + `<g>${backSvg(P)}</g><g data-part="screen" data-name="screen">${screenSvg(P)}</g><g data-part="raysL"></g><g data-name="lens">${lensSvg(P, concave)}</g><g data-part="raysR"></g><g data-name="raybox">${boxSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "lens";
      // Rays from the slits to the lens are the same whatever the screen does.
      el.raysR.innerHTML = OFF.map((h) => ray(P, [[RB, 0, BEAM + h], [LX + 1, 0, BEAM + h]])).join("") + D(OFF.map((h) => K.iso([RB, 0, BEAM + h], P)), { size: 0.9, tone: "hi" });
      const at = (h, d) => BEAM + h * (1 - d / (f * CM));              // height of a ray d units past the lens (thin lens)
      const draw = () => {
        const d = s.d * CM, sx = LX - d, key = s.d.toFixed(3);
        w.attr(el.screen, "transform", K.translateAlong(P, [sx, 0, 0]));
        w.rebuild(el.raysL, key, () => {
          const out = OFF.map((h) => ray(P, [[LX - 1, 0, BEAM + h], [sx + 0.1, 0, at(h, d)]]));
          const r = Math.max(0.5, Math.abs(at(10, d) - BEAM)), ring = Array.from({ length: 40 }, (_, k) => K.iso([sx + 0.1, Math.cos((k / 40) * 2 * Math.PI) * r, BEAM + Math.sin((k / 40) * 2 * Math.PI) * r], P));
          out.unshift(`<path d="${K.pathOf(ring, true)}" fill="#ffe7a0" fill-opacity="${ISO.clamp(6 / r, 0.35, 1).toFixed(2)}" stroke="#e09a00" stroke-width="0.6"/>`);
          if (concave) out.push(OFF.filter((h) => h).map((h) => ray(P, [[LX, 0, BEAM + h], [LX - f * CM, 0, BEAM]], "#e09a00", 0.8, ' stroke-dasharray="2 3" opacity=".7"')).join(""));
          out.push(D([K.iso([LX - f * CM, 0, BEAM], P)], { size: 1.3, tone: "hi" }));
          return out.join("");
        });
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" :
          ISO.word(K.iso([LX - f * CM, 0, BEAM], P), concave ? "F (virtual)" : "F", "#c0392b", { size: 15, dy: concave ? 20 : -10 }) +
          ISO.word(K.iso([LX, 0, BEAM + 24], P), concave ? "concave lens" : "convex lens", "#555", { size: 14, dy: -6 }) +
          ISO.word(K.iso([RB + 18, 0, 64], P), "ray box", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([sx, 0, 74], P), "screen", "#555", { size: 14, dy: -8 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.screen !== undefined) s.dT = ISO.clamp(+p.screen, 6, 45); if (p.lit) lit = p.lit; };
      g.update = (dt) => { s.d = ISO.follow(s.d, s.dT, dt, 0.5, ISO.still()); draw(); return s.d !== s.dT; };
      g.readout = () => {
        const spot = 5 * Math.abs(1 - s.d / f);
        if (concave) return `concave lens · f = ${f} cm: rays spread as if from a virtual F ${-f} cm behind it · patch ${spot.toFixed(1)} cm across at ${s.d.toFixed(0)} cm`;
        return Math.abs(s.d - f) < 0.3 ? `sharp focus: screen at F · focal length f = ${f} cm` : `screen ${s.d.toFixed(1)} cm from the lens · patch ${spot.toFixed(1)} cm across · sharp at f = ${f} cm`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
