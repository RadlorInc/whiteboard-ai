// "shadow cx cy width src=point|wide ball=12 lab=1 lit=lamp|ball|screen" — a lamp, a ball and a screen on a bench.
// A bulb in a holder, an opaque ball on a rod on a sliding carriage, and a white screen stand on a rail. Light goes in
// straight lines, so the edge rays that just miss the ball mark the shadow's edge on the screen: by similar triangles
// the shadow is the ball's width × (bulb to screen) ÷ (bulb to ball). A tiny bulb gives one sharp dark shadow (umbra);
// a big frosted bulb gives a dark middle with a part-lit ring round it (penumbra), because some of the bulb can still
// be seen from there. set({ ball: cm from the bulb }) slides the ball; set({ src }) swaps the bulb.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -176, y: -48, w: 330, d: 96, r: 7 }, XL = -150, XS = 124, Z0 = 62, RB = 13, SCR = { y: 56, z0: 10, z1: 114 };
  const RS = { point: 1.6, wide: 10 }, RAY = "#e09a00";
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const carriage = (P, x, w = 10) => ISO.wbox(P, [x - w, x + w], [-10, 10], [6, 11], "mid") + ISO.wbox(P, [x - w + 2, x + w - 2], [10, 11.5], [7, 10], "mid") +
    S(K.cylinder(x, 15, 2.6, 7.5, 1, P, 16), { tone: "mid" }) + ISO.tinted(ISO.T.plastic, S(G.disc(11.5, 15, 2.4, G.frameOf([x, 0, 8.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { ruler: { zero: XL } }), ISO.plate(P, { x: 96, y: -42, w: 44, d: 12, r: 1.2 })];
    for (const x of [-172, 142]) out.push(ISO.wbox(P, [x, x + 8], [-12, 12], [0, 2], "mid"));
    out.push(ISO.wbox(P, [-174, 152], [-7, 7], [2, 6], "mid"), L(K.lineOnTop([-174, 0], [152, 0], 6, P), { tone: "faint" }));
    // a battery box (two cells) behind the lamp, its lead running to the holder
    out.push(ISO.wbox(P, [-168, -128], [-44, -26], [0, 3], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-166, -130], [-42, -28], [3, 16], "hi")));
    for (const x of [-160, -138]) out.push(ISO.tinted(ISO.T.red, S(K.cylinder(x, -35, 2.2, 16, 3, P, 14), { tone: "mid" })));
    return out.join("");
  }
  function lampSvg(P, src) {
    const out = [carriage(P, XL)];
    out.push(S(K.cylinder(XL, 0, 2.2, 11, Z0 - 22, P, 18), { tone: "mid", crease: "none" }), S(K.cylinder(XL, 0, 5.5, Z0 - 13, 2, P, 24), { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(XL, 0, 4.5, Z0 - 11, 6, P, 24), { tone: "hi" })));
    out.push(`<path d="${K.pathOf([[-160, -35, 19], [-160, -18, 30], [XL - 4, -4, Z0 - 9]].map((p) => K.iso(p, P)))}" fill="none" stroke="#7a2a20" stroke-width="1.6" stroke-linecap="round"/>`);
    out.push(D([K.iso([-160, -35, 19], P), K.iso([XL - 4, -4, Z0 - 9], P)], { size: 0.8 }));
    return out.join("");
  }
  // The bulb itself, glowing: a small torch bulb or a big frosted globe, on top of the holder.
  function bulbSvg(P, src) {
    const r = RS[src], c = K.iso([XL, 0, Z0], P), k = G.scaleOf(P), out = [];
    out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${((r + 16) * k).toFixed(1)}" fill="url(#sh-glow)"/>`);
    out.push(S(K.cylinder(XL, 0, Math.max(2.4, r * 0.5), Z0 - 5, 4, P, 18), { tone: "mid" }));
    out.push(ISO.tinted(ISO.tint("#fff7d6", ["#f3d77a", "#f6e08f", "#f9e9a8", "#fcf1c4"], "#8a6a10"), S(G.sphereOf([XL, 0, Z0 - 1 + r], Math.max(r, 2.4), P), { tone: "hi" })));
    return out.join("");
  }
  // (the ball's carriage is slid by a transform, so the audit sees it at x = 0; carriage knobs and screen posts are
  // seated in their blocks by design: those are its "sunk" lines)
  function ballSvg(P) {
    const out = [carriage(P, 0)];
    out.push(S(K.cylinder(0, 0, 1.2, 11, Z0 - RB - 10, P, 14), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.rubber, S(G.sphereOf([0, 0, Z0], RB, P), { tone: "hi" })));
    return out.join("");
  }
  function screenSvg(P) {
    const out = [carriage(P, XS, 12)];
    for (const y of [-SCR.y + 6, SCR.y - 6]) out.push(S(K.cylinder(XS + 2, y, 2, 6, SCR.z0 - 6 + 2, P, 14), { tone: "mid" }));
    out.push(ISO.wbox(P, [XS - 8, XS + 12], [-SCR.y + 2, SCR.y - 2], [4, 6], "mid"));
    out.push(ISO.wbox(P, [XS, XS + 4], [-SCR.y, SCR.y], [SCR.z0, SCR.z1], "hi"));
    out.push(D([[-SCR.y + 4, SCR.z0 + 4], [SCR.y - 4, SCR.z0 + 4], [-SCR.y + 4, SCR.z1 - 4], [SCR.y - 4, SCR.z1 - 4]].map(([y, z]) => K.iso([XS - 0.05, y, z], P)), { size: 0.5 }));
    return out.join("");
  }
  // A disc on the screen's face (x = XS), centred on the axis.
  const disc = (P, r, fill, op) => {
    const pts = [];
    for (let k = 0; k < 48; k++) { const a = (k / 48) * 2 * Math.PI, y = ISO.clamp(Math.cos(a) * r, -SCR.y + 0.5, SCR.y - 0.5), z = ISO.clamp(Z0 + Math.sin(a) * r, SCR.z0 + 0.5, SCR.z1 - 0.5); pts.push(K.iso([XS - 0.1, y, z], P)); }
    return `<path d="${K.pathOf(pts, true)}" fill="${fill}" fill-opacity="${op}"/>`;
  };

  ISO.add({
    name: "shadow", title: "Shadows on a bench", compare: "shadow 480 280 440",
    about: "A bulb, a ball on a sliding carriage and a screen: light goes in straight lines, so the shadow's size follows similar triangles; a big bulb adds a part-lit penumbra.",
    line: "shadow cx cy width src=point|wide ball=12 lab=1 lit=lamp|ball|screen",
    demo: { line: "shadow 480 280 440 ball=16", script: [{ set: { ball: 16 }, hold: 1.2 }, { set: { ball: 9, lit: "ball" }, hold: "settle" }, { set: { ball: 20, lit: "" }, hold: "settle" }, { set: { src: "wide", ball: 12 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.9;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [XS, -SCR.y, SCR.z1], [XS, SCR.y, SCR.z1], [XL, 0, Z0 + 14]], cx, cy, W, H, { azimuth: 130, elevation: 24 }, parent);
      const lim = [8, 22], s = { b: ISO.clamp(ISO.num(o, "ball", 12), ...lim), src: o.src === "wide" ? "wide" : "point" }; s.bT = s.b;
      let lit = o.lit || "";
      const defs = `<defs><radialGradient id="sh-glow"><stop offset="0" stop-color="#fff1a0" stop-opacity=".9"/><stop offset=".35" stop-color="#ffe680" stop-opacity=".35"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient></defs>`;
      g.innerHTML = defs + `<g>${benchSvg(P)}</g><g data-name="screen">${screenSvg(P)}</g><g data-part="patch"></g><g data-part="ball" data-name="ball">${ballSvg(P)}</g><g data-part="raysNear"></g><g data-name="lamp">${lampSvg(P)}<g data-part="bulb"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const sizes = () => {
        const Lb = s.b * 10, Ls = XS - XL, rs = RS[s.src];
        return { Lb, Ls, umbra: RB + (RB - rs) * (Ls - Lb) / Lb, pen: RB + (RB + rs) * (Ls - Lb) / Lb, rs };
      };
      const draw = () => {
        const key = `${s.b.toFixed(2)}${s.src}`, z = sizes(), xb = XL + z.Lb;
        w.attr(el.ball, "transform", K.translateAlong(P, [xb, 0, 0]));
        w.rebuild(el.bulb, s.src, () => bulbSvg(P, s.src));
        w.rebuild(el.patch, key, () => {
          // the lit screen: a pool of light brightest in the middle (cos³ / d² from a point), then the shadow on top
          const out = [50, 38, 26].map((r, i) => disc(P, r, "#ffe9a0", 0.22 + i * 0.08));
          if (s.src === "wide") for (let k = 0; k < 4; k++) out.push(disc(P, z.pen - ((z.pen - z.umbra) * k) / 4, "#3b3f47", 0.12 + k * 0.08));
          out.push(disc(P, Math.max(0.5, z.umbra), "#2a2d33", 0.78));
          return out.join("");
        });
        // the edge rays in the vertical plane through the axis: from the bulb's top and bottom, grazing the ball
        w.rebuild(el.raysNear, key, () => {
          const top = Z0 + z.rs, bot = Z0 - z.rs, out = [];
          const line = (z0, z1, op, w2) => `<path d="${K.pathOf([K.iso([XL, 0, z0], P), K.iso([XS - 0.2, 0, z1], P)])}" fill="none" stroke="${RAY}" stroke-width="${w2}" stroke-linecap="round" opacity="${op}"/>`;
          out.push(line(top, Z0 + z.umbra, 1, 1.3), line(bot, Z0 - z.umbra, 1, 1.3));
          if (z.rs > 2) out.push(line(bot, Z0 + z.pen, 0.6, 1), line(top, Z0 - z.pen, 0.6, 1));
          return out.join("");
        });
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" :
          ISO.word(K.iso([XL, 0, Z0 + 16], P), s.src === "wide" ? "big bulb" : "small bulb", "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([xb, 0, Z0 + RB + 4], P), "opaque ball", "#555", { size: 14, dy: -6 }) +
          ISO.word(K.iso([XS, 0, SCR.z1 + 2], P), "screen", "#555", { size: 14, dy: -24 }) + ISO.word(K.iso([XS, 0, SCR.z1 + 2], P), s.src === "wide" ? "dark umbra, part-lit penumbra" : "sharp shadow", "#c0392b", { size: 14, dy: -6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.ball !== undefined) s.bT = ISO.clamp(+p.ball, ...lim);
        if (p.src) s.src = p.src === "wide" ? "wide" : "point";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { s.b = ISO.follow(s.b, s.bT, dt, 0.5, ISO.still()); draw(); return s.b !== s.bT; };
      g.readout = () => {
        const z = sizes(), D2 = (2 * z.umbra) / 10;
        return s.src === "wide" ? `big bulb · ball ${s.b.toFixed(1)} cm from it · dark umbra ${D2.toFixed(1)} cm across inside a part-lit penumbra ${((2 * z.pen) / 10).toFixed(1)} cm across`
          : `ball ${(2 * RB / 10).toFixed(1)} cm wide, ${s.b.toFixed(1)} cm from the bulb, screen ${(z.Ls / 10).toFixed(1)} cm away · shadow = ${(2 * RB / 10).toFixed(1)} × ${(z.Ls / 10).toFixed(1)} ÷ ${s.b.toFixed(1)} = ${D2.toFixed(1)} cm across`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
