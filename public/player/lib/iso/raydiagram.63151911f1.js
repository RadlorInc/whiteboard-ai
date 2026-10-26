// "raydiagram cx cy width k=convex|concave obj=far|2f|mid|near f=10 lab=1 lit=object|lens|screen" — a lens on an optical bench.
// A lamp box with an arrow cut in its front is the object; a lens (f = 10 cm) sits in a holder and a white screen rides
// on its own carriage. The rays are the textbook three from the arrow's tip, traced by the thin-lens rule (every ray
// through the lens at height y turns by −y/f): one parallel to the axis then through F, one straight through the
// centre, one through F then parallel. They meet where 1/u + 1/v = 1/f: far → small, upside-down, real, between F and
// 2F; 2F → same size at 2F; between F and 2F → magnified beyond 2F; inside F → no real image, the rays spread as if from
// a magnified, upright virtual image behind the object (dashed). A concave lens always gives a small upright virtual one.
// set({ obj }) slides the object; the screen follows to the sharp image when there is one.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CM = 3.6, LX = 0, BEAM = 58, HO = 4, RL = 30, BOARD = { x: -176, y: -40, w: 344, d: 78, r: 7 }, RAY = "#e09a00";
  const U = { far: 40, "2f": 20, mid: 15, near: 6 }, PARK = 26;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const wx = (s) => LX - s * CM, wz = (y) => BEAM + y * CM;   // s: cm from the lens toward the screen side (−x); y: cm above the axis
  const carriage = (P, x, w = 10) => ISO.wbox(P, [x - w, x + w], [-10, 10], [6, 11], "mid") + ISO.wbox(P, [x - w + 2, x + w - 2], [10, 11.5], [7, 10], "mid") +
    S(K.cylinder(x, 15, 2.6, 7.5, 1, P, 16), { tone: "mid" }) + ISO.tinted(ISO.T.plastic, S(G.disc(11.5, 15, 2.4, G.frameOf([x, 0, 8.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));

  function backSvg(P, f) {
    const out = [ISO.baseboard(P, BOARD, { ruler: { zero: LX } }), ISO.plate(P, { x: -168, y: -34, w: 38, d: 12, r: 1.2 })];
    for (const x of [-170, 158]) out.push(ISO.wbox(P, [x, x + 8], [-12, 12], [0, 2], "mid"));
    out.push(ISO.wbox(P, [-174, 170], [-7, 7], [2, 6], "mid"), L(K.lineOnTop([-174, 0], [170, 0], 6, P), { tone: "faint" }));
    // F and 2F pins on both sides of the lens: small red pegs standing on the rail's front edge
    for (const m of [-2, -1, 1, 2]) { const x = LX + m * Math.abs(f) * CM; out.push(ISO.tinted(ISO.T.red, S(K.cylinder(x, 8, 1.4, 6, 4, P, 12), { tone: "mid" }))); }
    return out.join("");
  }
  function lensSvg(P, concave) {
    const F = xAx([LX, 0, BEAM]), out = [carriage(P, LX)];
    out.push(S(K.cylinder(LX, 0, 2, 11, BEAM - RL - 3.5 - 11, P, 18), { tone: "mid", crease: "none" }), S(K.cylinder(LX, 0, 3, BEAM - RL - 6.5, 3, P, 18), { tone: "mid" }));
    const prof = (concave ? [[-1, 0], [-1.25, 7, 1], [-2.1, 14, 1], [-3.2, 19, 1], [-3.4, 20], [3.4, 20], [3.2, 19, 1], [2.1, 14, 1], [1.25, 7, 1], [1, 0]]
      : Array.from({ length: 15 }, (_, k) => { const a = ((k + 0.5) / 15) * Math.PI; return [-3.8 * Math.cos(a), 20 * Math.sin(a), 1]; })).map(([a, r, m]) => (m ? [a * 1.3, r * RL / 20, m] : [a * 1.3, r * RL / 20]));
    out.push(`<g class="rd-glass" style="${ISO.T.glass}">${S(concave ? G.lathe(prof, F, P) : G.solidOf(prof, F, P), { tone: "hi" })}</g>`);
    out.push(S(G.ringBand(-2.8, 2.8, RL, RL + 3.6, F, P), { tone: "mid" }), D(G.dotsOf(F, 2.8, RL + 1.8, 10, P, { fade: [0.04, 0.42], phase: 0.4 }), { size: 0.45 }));
    return out.join("");
  }
  // (the object and the screen are built at x = 0 and slid along by a transform: the audit, which ignores transforms,
  // sees them stacked on the lens carriage and reports them sunk; the carriage knob sits in its boss by design)
  // The object: a lamp box on a carriage; its front plate (toward the lens) has an arrow cut in it, lit from inside.
  function objectSvg(P) {
    const x = 0, out = [carriage(P, x, 14)];
    out.push(S(K.cylinder(x + 4, 0, 2, 11, 12, P, 18), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [x + 1, x + 25], [-14, 14], [23, BEAM + 22], "mid"), ISO.wbox(P, [x - 1, x + 1], [-12, 12], [24, BEAM + 21], "hi"));
    for (let k = 0; k < 3; k++) out.push(L(K.planOutline({ x: x + 5 + k * 6.5, y: -9, w: 3, d: 18, r: 1.4 }, BEAM + 22, P, 3), { tone: "lo" }));
    const h = HO * CM, a = (y, z) => K.iso([x - 1.05, y, z], P);
    const arrow = [[-0.9, BEAM], [-0.9, BEAM + h - 3.4], [-2.6, BEAM + h - 3.4], [0, BEAM + h], [2.6, BEAM + h - 3.4], [0.9, BEAM + h - 3.4], [0.9, BEAM]].map(([y, z]) => a(y, z));
    out.push(`<path d="${K.pathOf(arrow, true)}" fill="#ffd257" stroke="#b07a10" stroke-width="0.8" stroke-linejoin="round"/>`);
    out.push(S(G.disc(0, 4, 3, G.frameOf([x + 25, 8, 30], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(D([[x + 3, 14, BEAM + 19], [x + 23, 14, BEAM + 19], [x + 3, 14, 26], [x + 23, 14, 26]].map((p) => K.iso(p, P)), { size: 0.5 }));
    return out.join("");
  }
  function screenSvg(P) {
    const out = [carriage(P, 0)];
    out.push(S(K.cylinder(0, 0, 2, 11, 2, P, 18), { tone: "mid" }), ISO.wbox(P, [-1, 3], [-4, 4], [13, 16], "mid"));
    out.push(ISO.wbox(P, [-2, 0], [-30, 30], [14, 100], "hi"));
    out.push(D([[-27, 17], [27, 17], [-27, 97], [27, 97]].map(([y, z]) => K.iso([0.05, y, z], P)), { size: 0.5 }));
    return out.join("");
  }

  ISO.add({
    name: "raydiagram", title: "Lens ray diagram on a bench", compare: "raydiagram 480 280 480 k=convex obj=far",
    about: "An arrow on a lamp box, a lens and a screen on an optical bench, with the three textbook rays: real or virtual image, bigger or smaller, by 1/u + 1/v = 1/f.",
    line: "raydiagram cx cy width k=convex|concave obj=far|2f|mid|near f=10 lab=1 lit=object|lens|screen",
    demo: { line: "raydiagram 480 280 480 k=convex obj=far", script: [{ set: { obj: "far" }, hold: 1.2 }, { set: { obj: "2f" }, hold: "settle" }, { set: { obj: "mid", lit: "screen" }, hold: "settle" }, { set: { obj: "near", lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.2, H = size * 0.66, concave = o.k === "concave";
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [wx(-40), 0, BEAM + 26], [wx(30), 0, 106], [LX, 0, 100]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const f = ISO.clamp(ISO.num(o, "f", 10), 6, 12) * (concave ? -1 : 1);
      const s = { u: U[o.obj] || U.far }; s.uT = s.u;
      const vOf = (u) => (Math.abs(u - f) < 1e-6 ? Infinity : (u * f) / (u - f));
      s.d = vOf(s.u) > 0 && vOf(s.u) < 32 ? vOf(s.u) : PARK; s.dT = s.d;
      let lit = o.lit || "";
      const style = `<style>.rd-glass .iso-fill{fill-opacity:.55}.rd-glass .iso-shade,.rd-glass .iso-top{opacity:.55}</style>`;
      g.innerHTML = style + `<g>${backSvg(P, f)}</g><g data-part="screen" data-name="screen">${screenSvg(P)}</g><g data-part="img"></g><g data-part="raysL"></g><g data-name="lens">${lensSvg(P, concave)}</g><g data-part="raysR"></g><g data-part="obj" data-name="object">${objectSvg(P)}</g><g data-part="virt"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const ray = (pts, dash = false) => `<path d="${K.pathOf(pts.map(([sx, y]) => K.iso([wx(sx), 0, wz(y)], P)))}" fill="none" stroke="${RAY}" stroke-width="${dash ? 1 : 1.3}" stroke-linecap="round"${dash ? ' stroke-dasharray="3 3" opacity=".85"' : ""}/>`;
      const draw = () => {
        const u = s.u, v = vOf(u), key = `${u.toFixed(2)} ${s.d.toFixed(2)}`;
        w.attr(el.obj, "transform", K.translateAlong(P, [wx(-u), 0, 0]));
        w.attr(el.screen, "transform", K.translateAlong(P, [wx(s.d), 0, 0]));
        // three rays from the tip (s = −u, y = HO): slope in, height at the lens, slope out = slope in − y/f
        const rays = [0, -HO / u, Math.abs(u - f) > 1.2 ? -HO / (u - f) : null].filter((m) => m !== null).map((m) => ({ m, y: HO + m * u })).filter((r) => Math.abs(r.y) < (RL - 1) / CM);
        const sharp = v > 0 && Math.abs(s.d - v) < 0.3, ends = (r) => { const mo = r.m - r.y / f, yd = r.y + mo * s.d; if (yd > -12 && yd < 11.5) return [s.d, yd]; const se = Math.min(46, mo ? Math.abs((Math.sign(mo) * 13 - r.y) / mo) : 46); return [se, r.y + mo * se]; };
        w.rebuild(el.raysR, key, () => rays.map((r) => ray([[-u, HO], [0, r.y]])).join("") + D([K.iso([wx(-u) - 1.1, 0, wz(HO)], P)], { size: 0.8, tone: "hi" }));
        w.rebuild(el.raysL, key, () => {
          const out = rays.map((r) => ray([[0, r.y], ends(r)]));
          out.push(D([f, -f].map((sf) => K.iso([wx(sf), 0, BEAM], P)), { size: 1, tone: "hi" }));
          return out.join("");
        });
        // a virtual image: the rays traced back (dashed) to an upright arrow on the object's side, drawn over the lamp box
        w.rebuild(el.virt, v < 0 && v > -60 ? key : "", () => {
          if (!(v < 0 && v > -60)) return "";
          const tip = -HO * v / u, x = wx(v), hd = Math.min(1.2, tip / 3);
          return rays.map((r) => ray([[0, r.y], [v, r.y + (r.m - r.y / f) * v]], true)).join("") +
            `<path d="${K.pathOf([[x, BEAM], [x, wz(tip)]].map(([a, z]) => K.iso([a, 0, z], P)))}M${K.iso([x + hd * CM, 0, wz(tip - hd * 1.4)], P)}L${K.iso([x, 0, wz(tip)], P)}L${K.iso([x - hd * CM, 0, wz(tip - hd * 1.4)], P)}" fill="none" stroke="#6a3d9a" stroke-width="1.4" stroke-dasharray="3 2.5" stroke-linejoin="round"/>`;
        });
        // the sharp image on the screen: an upside-down glowing arrow, height h·v/u
        w.rebuild(el.img, sharp ? key : "", () => {
          if (!sharp) return "";
          const hi = (HO * v) / u * CM, x = wx(s.d) + 0.1, a = (y, z) => K.iso([x, y, z], P), wd = Math.min(2.6, hi / 3);
          return `<path d="${K.pathOf([[-0.9, BEAM], [-0.9, BEAM - hi + wd * 1.3], [-wd, BEAM - hi + wd * 1.3], [0, BEAM - hi], [wd, BEAM - hi + wd * 1.3], [0.9, BEAM - hi + wd * 1.3], [0.9, BEAM]].map(([y, z]) => a(y, z)), true)}" fill="#ffd257" stroke="#b07a10" stroke-width="0.8" stroke-linejoin="round"/>`;
        });
        w.rebuild(el.words, lab ? key : "", () => {
          if (!lab) return "";
          const out = [[f, "F"], [2 * f, "2F"], [-f, "F"], [-2 * f, "2F"]].map(([sf, tx]) => ISO.word(K.iso([wx(sf), 10, 6], P), tx, "#c0392b", { size: 13, dy: 16 }));
          out.push(ISO.word(K.iso([wx(-u) + 12, 0, BEAM + 24], P), "object", "#2c6a22", { size: 14, dy: -6 }), ISO.word(K.iso([LX, 0, BEAM + RL + 5], P), concave ? "concave lens" : "convex lens", "#555", { size: 14, dy: -6 }));
          if (sharp) out.push(ISO.word(K.iso([wx(s.d), 0, 102], P), v > 2 * Math.abs(f) + 0.3 ? "real image: bigger, upside down" : v < 2 * Math.abs(f) - 0.3 ? "real image: smaller, upside down" : "real image: same size", "#6a3d9a", { size: 14, dy: -6 }));
          else if (v < 0 && v > -60) out.push(ISO.word(K.iso([wx(v), 0, wz(-HO * v / u)], P), "virtual image", "#6a3d9a", { size: 14, dy: -8 }), ISO.word(K.iso([wx(s.d), 0, 102], P), "no image on the screen", "#777", { size: 13, dy: -6 }));
          return out.join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.obj && U[p.obj]) { s.uT = U[p.obj]; const v = vOf(s.uT); s.dT = v > 0 && v < 32 ? v : PARK; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.u = ISO.follow(s.u, s.uT, dt, 0.5, calm);
        s.d = ISO.follow(s.d, s.dT, dt, 0.5, calm);
        draw();
        return s.u !== s.uT || s.d !== s.dT;
      };
      g.readout = () => {
        const u = s.u, v = vOf(u), m = Math.abs(v / u);
        if (!Number.isFinite(v)) return `object at F (u = ${u.toFixed(1)} cm): the rays leave parallel, no image`;
        return v > 0 ? `u = ${u.toFixed(1)} cm, f = ${f} cm → 1/v = 1/f − 1/u, v = ${v.toFixed(1)} cm · real, upside down, ${m.toFixed(2)}× the size · caught on the screen`
          : `u = ${u.toFixed(1)} cm, f = ${f} cm → v = ${v.toFixed(1)} cm · virtual, upright, ${m.toFixed(2)}× the size · seen by looking through the lens, not on a screen`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
