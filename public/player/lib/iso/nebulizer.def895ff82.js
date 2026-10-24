// "nebulizer cx cy size on=0|1 lbl=0 lab=0 lit=compressor|switch|tubing|cup|mouthpiece|mist" — a compressor nebuliser.
// A small compressor with a carry handle, a rocker switch, an air filter and an outlet nozzle; tubing from the nozzle
// to the medicine cup held in its bracket on the side. In the cup a jet of air pulls the liquid medicine up and breaks
// it on a baffle into a fine mist (droplets 1–5 µm, small enough to reach the lungs), which drifts out through the
// T-piece and its mouthpiece. set({ on: 1 }) switches it on: air runs along the tubing and mist rises; the medicine
// goes down at about 0.3 mL a minute (a 4 mL dose takes 12–15 minutes).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm.
  const BOX = { x: -12, y: -7.5, w: 19, d: 15, r: 2.6 }, BH = 9, CUP = { x: 14.2, y: 1, z: 10.5 }, RATE = 0.3, DOSE = 4;
  const MIST = 26, FY = BOX.y + BOX.d;
  const CASE = ISO.tint("#eef3f7", ["#b5c2cd", "#c5d0d9", "#d4dde4", "#e1e8ed"], "#3e4c59");
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const STYLE = `<style>.nb-clear .iso-fill{fill-opacity:.3}.nb-clear .iso-shade{fill-opacity:.5}.nb-clear .iso-top{fill-opacity:.4}</style>`;
  const tube = (P, pts) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 0.7 * G.scaleOf(P); return { d, svg: `<path d="${d}" fill="none" stroke="#5d7f96" stroke-width="${(w + 1).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#eef6fb" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/>` }; };
  const MOUTH = [CUP.x + 1.6, CUP.y, CUP.z + 9.2], MOUTH_DIR = [0.8, 0.6, 0], MOUTH_LEN = 6.4;

  function compressorSvg(P) {
    const T = { x: -16, y: -11, w: 38, d: 32, r: 3 };
    const out = [ISO.tinted(ISO.T.wood, S(K.slabOf(T, -3, 3, P, 4, 0.6), { tone: "lo", inner: L(K.sideSeam(T, -1.2, P, 4), { tone: "faint" }) }))];
    out.push(`<path class="iso-halo" d="${K.haloOf(BOX, 0, BH, P)}"/>`);
    for (const [x, y] of K.corners(BOX, 2.6)) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 1.3, 0, 0.8, P, 16), { tone: "mid" })));
    out.push(ISO.tinted(CASE, S(K.slabOf(BOX, 0.8, BH - 0.8, P, 6, 0.8), { tone: "mid", inner: L(K.sideSeam(BOX, 3.4, P, 6), { tone: "faint" }) })));
    // vent slots on the right side, closed outlines
    const side = (y0, y1, z0, z1) => K.pathOf([[y0, z0], [y1, z0], [y1, z1], [y0, z1]].map(([y, z]) => K.iso([BOX.x + BOX.w + 0.05, y, z], P)), true);
    out.push(`<path d="${Array.from({ length: 6 }, (_, i) => side(-6 + i * 1.3, -5.4 + i * 1.3, 4.6, 7.6)).join("")}" fill="#55606b"/>`);
    // handle: two posts and a bar across the top
    out.push(ISO.tinted(CASE, ISO.wbox(P, [-9.5, -8], [-1.1, 1.1], [BH, BH + 3.6], "mid") + ISO.wbox(P, [2, 3.5], [-1.1, 1.1], [BH, BH + 3.6], "mid") + ISO.wbox(P, [-9.5, 3.5], [-1.1, 1.1], [BH + 3.6, BH + 4.7], "mid")));
    // front panel: a dark strip and the round air-filter cap with its holes
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-10, 5], [FY, FY + 0.3], [4, 8], "mid")));
    const ff = yAx([-7.4, FY + 0.3, 6]);
    out.push(ISO.tinted(CASE, S(G.disc(0, 0.7, 1.6, ff, P), { tone: "hi" })), `<path d="${G.circleOf(ff, 0.7, 0.9, P)}" fill="none" stroke="#5c6873" stroke-width="0.5"/>`, D(G.dotsOf(ff, 0.7, 0.55, 6, P, { all: true }), { size: 0.45, tone: "lo" }));
    return out.join("");
  }
  const switchSvg = (P, on) => {
    const a = on ? 0.25 : -0.25, tilt = (u, w, y) => [-3 + u, FY + 0.3 + y + w * Math.sin(a), 6 + w];
    return ISO.tinted(on ? ISO.T.green : ISO.T.plastic, ISO.box(tilt, P, [-1.1, 1.1], [-1.2, 1.2], [0, 0.8], "hi"));
  };
  // The nozzle on the front, the bracket on the right side that holds the cup.
  function nozzleSvg(P) {
    const F = yAx([2.4, FY + 0.3, 5.8]);
    return ISO.tinted(ISO.T.steel, S(G.disc(0, 0.7, 1, F, P), { tone: "mid" }) + S(G.solidOf([[0.7, 0.45], [2, 0.45], [2, 0.34], [2.4, 0.48], [3, 0.28]], F, P), { tone: "hi" }));
  }
  function bracketSvg(P) {
    return ISO.tinted(CASE, ISO.wbox(P, [BOX.x + BOX.w, CUP.x - 2.4], [CUP.y - 1.2, CUP.y + 1.2], [6, BH - 0.6], "mid")) +
      ISO.tinted(CASE, S(G.ringBand(0, 1.6, 2.5, 3.3, up(CUP.x, CUP.y, CUP.z + 0.6), P), { tone: "mid" }));
  }
  // The cup: clear bowl with the medicine, the jet in the middle, the clear top, the chimney and the T-piece.
  function cupSvg(P, ml) {
    const F = up(CUP.x, CUP.y, CUP.z), out = [];
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(-1.4, 0.2, 0.5, F, P), { tone: "hi" })));
    const level = 0.6 + (ml / DOSE) * 2.4;
    out.push(ISO.tinted(ISO.T.amber, S(G.solidOf([[0, 1.0], [0.6, 1.9, 1], [level, 2.3]], F, P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(level, 3.6, 0.35, F, P), { tone: "mid" })));
    out.push(`<g class="nb-clear">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0.6], [0.6, 1.9, 1], [1.6, 2.4, 1], [4, 2.5], [4, 0]], F, P, { rims: "first" }), { tone: "hi", inner: L(G.arcOf(F, 3.2, 2.5, P), { tone: "faint" }) }))}</g>`);
    out.push(`<g class="nb-clear">${ISO.tinted(ISO.T.glass, S(G.solidOf([[4, 2.7], [5, 2.7], [6, 1.4, 1], [6.4, 1.2], [8.4, 1.2]], F, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }
  function teeSvg(P) {
    const out = [], c = [CUP.x, CUP.y, CUP.z + 9.2];
    out.push(`<g class="nb-clear">${ISO.tinted(ISO.T.glass, S(G.sphereOf(c, 1.5, P), { tone: "hi" }))}</g>`);
    const back = G.frameAlong(c, [-MOUTH_DIR[0], -MOUTH_DIR[1], 0]);
    out.push(`<g class="nb-clear">${ISO.tinted(ISO.T.glass, S(G.disc(1.2, 4.4, 1.15, back, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }
  // The mouthpiece: a flattened tube from the T toward you.
  function mouthSvg(P) {
    const F = G.frameAlong([CUP.x + MOUTH_DIR[0] * 1.2, CUP.y + MOUTH_DIR[1] * 1.2, CUP.z + 9.2], MOUTH_DIR), out = [];
    const oval = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [Math.cos(a) * 1.25, Math.sin(a) * 0.75]; });
    out.push(`<g class="nb-clear">${ISO.tinted(ISO.T.glass, S(G.prismOf(F, oval, 0, MOUTH_LEN, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "nebulizer", title: "Nebuliser", compare: "nebulizer 490 270 320",
    about: "A compressor pushes air down the tubing into the medicine cup; the jet turns the liquid into a fine mist that drifts out of the mouthpiece.",
    line: "nebulizer cx cy size on=0|1 lbl=0 lab=0 lit=compressor|switch|tubing|cup|mouthpiece|mist",
    demo: { line: "nebulizer 490 270 320 on=0", script: [{ set: {}, hold: 1.2 }, { set: { on: 1, lit: "switch" }, hold: 2.5 }, { set: { lit: "cup" }, hold: 4 }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 2.05, H = size * 1.4;
      const pts = [[BOX.x, BOX.y, 0], [BOX.x + BOX.w, BOX.y + BOX.d, 0], [BOX.x, BOX.y + BOX.d, 0], [BOX.x + BOX.w, BOX.y, 0], [BOX.x, 0, BH + 6], [CUP.x + 3, CUP.y, CUP.z + 20], [MOUTH[0] + MOUTH_DIR[0] * MOUTH_LEN, MOUTH[1] + MOUTH_DIR[1] * MOUTH_LEN, CUP.z + 9], [8, FY + 8, 0], [-16, -11, -3], [22, 21, -3], [-16, 21, -3], [22, -11, -3]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 52, elevation: 26 }, parent);
      const route = G.fillet([[2.4, FY + 3.3, 5.8], [2.4, FY + 6, 5.8], [2.4, FY + 6, 0.4], [CUP.x, FY + 6, 0.4], [CUP.x, CUP.y + 4, 0.4], [CUP.x, CUP.y, 4], [CUP.x, CUP.y, CUP.z - 1.4]], 2.2, 9);
      const tb = tube(P, route);
      const ml0 = o.on === "0" ? DOSE : 2.8;
      const mouthEnd = [CUP.x + MOUTH_DIR[0] * (MOUTH_LEN + 1.2), CUP.y + MOUTH_DIR[1] * (MOUTH_LEN + 1.2), CUP.z + 9.2];
      g.innerHTML = STYLE + `<g data-name="compressor">${compressorSvg(P)}</g><g data-name="switch"></g><g data-name="bracket">${bracketSvg(P)}</g><g data-name="cup"></g>` +
        `<g data-name="tubing">${tb.svg}<path data-part="air" d="${tb.d}" fill="none" stroke="#2b6cc4" stroke-width="0.8" stroke-dasharray="1.6 4" stroke-linecap="round"/>${nozzleSvg(P)}</g>` +
        `<g data-name="tee">${teeSvg(P)}</g><g data-name="mouthpiece">${mouthSvg(P)}</g><g data-name="mist">${Array.from({ length: MIST }, () => `<circle fill="#a9bccb"/>`).join("")}</g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const puffs = [...nm("mist").children], air = q("air"), sc = G.scaleOf(P);
      const s = { on: o.on !== "0", m: o.on !== "0" ? 1 : 0, ml: ml0, run: o.on === "0" ? 0 : 240, t: 0, off: 0, lit: o.lit || "" };
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([BOX.x, BOX.y + BOX.d, 0], "Compressor", "middle", 22) + word([CUP.x - 2.6, CUP.y, CUP.z + 2], "Medicine cup", "end", 4, -4) +
          word(mouthEnd, "Mouthpiece", "start", 10, 6) + word([CUP.x, CUP.y, CUP.z + 17], "Mist", "middle", -6) + word([8, FY + 6, 0], "Tubing", "middle", 18);
      }
      const draw = () => {
        w.rebuild(nm("switch"), String(s.on), () => switchSvg(P, s.on));
        w.rebuild(nm("cup"), s.ml.toFixed(1), () => cupSvg(P, Math.round(s.ml * 10) / 10));
        w.attr(air, "stroke-dashoffset", (-s.off).toFixed(1)); w.attr(air, "opacity", s.m.toFixed(2));
        // mist: each puff leaves the mouthpiece end (most) or the back of the T, drifts out, rises and spreads
        puffs.forEach((c, i) => {
          const ph = (s.t * 0.45 + i / MIST) % 1, back = i % 4 === 3, o0 = back ? [CUP.x - MOUTH_DIR[0] * 4.6, CUP.y - MOUTH_DIR[1] * 4.6, CUP.z + 9.2] : mouthEnd;
          const dir = back ? [-MOUTH_DIR[0], -MOUTH_DIR[1]] : MOUTH_DIR, wob = Math.sin(i * 2.3 + s.t) * 0.6;
          const p = K.iso([o0[0] + dir[0] * ph * 3 + wob * 0.4, o0[1] + dir[1] * ph * 3 - wob * 0.3, o0[2] + ph * ph * 6], P);
          w.attr(c, "cx", p[0].toFixed(1)); w.attr(c, "cy", p[1].toFixed(1)); w.attr(c, "r", ((0.25 + ph * 0.9) * sc).toFixed(1));
          w.attr(c, "opacity", (s.m * 0.5 * Math.sin(Math.PI * ph) * (back ? 0.6 : 1)).toFixed(2));
        });
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = !!+p.on; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        s.t += dt;
        s.m = ISO.follow(s.m, s.on ? 1 : 0, dt, 0.6, ISO.still());
        if (s.on) { s.off += dt * 14; s.run += dt; s.ml = Math.max(0, s.ml - (RATE / 60) * dt); }
        draw();
        return true;
      };
      g.readout = () => {
        if (!s.on) return `switched off · ${s.ml.toFixed(1)} mL of medicine in the cup`;
        const m = Math.floor(s.run / 60), sec = Math.floor(s.run % 60);
        return `on ${m}:${String(sec).padStart(2, "0")} · air jet turns the medicine into a 1–5 µm mist · ${s.ml.toFixed(2)} mL left, about ${Math.ceil(s.ml / RATE)} min to go at ${RATE} mL/min`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
