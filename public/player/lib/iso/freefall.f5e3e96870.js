// "freefall cx cy height k=strobe|forces drop=1 lab=1 lit=magnet|gates|rule|timer" — falling, on a tall clamp stand.
// strobe: an electromagnet lets go of a steel ball beside a metre rule; it falls through two light gates into a sand tray.
// With no air drag worth counting it falls s = ½gt², so the strobe images, 0.05 s apart, get further apart every flash,
// and the gate times give g = 2(h₂ − h₁)/(t₂² − t₁²) = 9.81 m/s². The fall is shown 4× slower than it is.
// forces: a paper cake case is let go instead. Its weight stays the same while air resistance grows as v², so it speeds
// up less and less until the two are equal: terminal velocity (about 1.2 m/s for one case), and the images end evenly
// spaced. Shown at true speed. set({ drop: 1 }) lets go; set({ drop: 0 }) hangs a new one up.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g0 = 9.81, PER_M = 200, BASE = { x: -60, y: -44, w: 132, d: 82, r: 5 }, ROD = [-44, -24], FX = 14, TRAY = 12, H0 = 1.2;
  const ZREL = TRAY + 6 + H0 * PER_M, GATES = [0.2, 0.8], SLOW = 4, VT = 1.2, RB = 5;

  function standSvg(P) {
    const out = [LAB.standBase(P, BASE, ROD), LAB.rod(P, ROD, 14, ZREL + 30)];
    // the metre rule: a wooden strip standing on the base, held at the top by a boss and a short arm
    const rx = [FX + 12, FX + 20], ry = [-4, 4];
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, rx, ry, [7.6, ZREL + 8], "mid")));
    const minor = [], major = [];
    for (let cm = 0; cm <= 120; cm += 2) { const z = ZREL - (cm / 100) * PER_M; (cm % 10 ? minor : major).push(K.segment([rx[0], ry[1] + 0.02, z], [rx[0] + (cm % 10 ? 2.4 : 4.4), ry[1] + 0.02, z], P)); }
    out.push(`<g style="${ISO.T.wood}">${L(minor.join(""), { tone: "lo", free: "end" })}${L(major.join(""), { tone: "mid", free: "end" })}</g>`);
    // its top held by a boss on the rod and an arm that runs behind the magnet
    out.push(LAB.boss(P, ROD, ZREL - 4, [1, 0]), ISO.wbox(P, [ROD[0] + 7.5, rx[1]], [-24.8, -21.2], [ZREL + 0.5, ZREL + 3.5], "mid"), ISO.wbox(P, [rx[0], rx[1]], [-24.8, ry[0]], [ZREL - 1, ZREL + 5], "mid"));
    // the sand tray under the fall line
    out.push(ISO.wbox(P, [FX - 18, FX + 10], [-16, 16], [7.6, TRAY], "mid"), ISO.tinted(ISO.T.wood, ISO.wbox(P, [FX - 16, FX + 8], [-14, 14], [TRAY - 1.2, TRAY - 0.4], "lo")));  // sand sits in the tray
    return out.join("");
  }
  // (LAB.boss blocks are threaded on the rod and their thumb screws stand off it: the audit's sunk/loose lines for
  // them are the helper's design, as in every stand recipe)
  // The electromagnet on a clamp arm above the fall line: a soft-iron core in a copper coil, leads to the timer.
  function magnetSvg(P, ball) {
    const z = ZREL + RB, out = [LAB.boss(P, ROD, z + 8, [1, 0])];
    out.push(S(G.disc(7.5, FX - ROD[0] - 6, 2.2, LAB.A([ROD[0], ROD[1], z + 14.5], [1, 0, 0]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [FX - 6, FX + 6], [ROD[1] - 3, 6], [z + 12, z + 17], "mid"));
    out.push(ISO.tinted(ISO.T.copper, S(K.cylinder(FX, 0, 6.5, z + 2, 10, P, 28), { tone: "mid", inner: L(K.knurl(FX, 0, 6.5, z + 2, z + 12, 22, P), { tone: "faint" }) })));
    out.push(S(K.cylinder(FX, 0, 2.6, z - 0.2, 2.2, P, 18), { tone: "mid" }));
    return out.join("");
  }
  function gateSvg(P, dist) {
    const z = ZREL - dist * PER_M, out = [LAB.boss(P, ROD, z - 8, [1, 0])];
    out.push(S(G.disc(7.5, FX - 23 - ROD[0], 1.8, LAB.A([ROD[0], ROD[1], z - 1.5], [1, 0, 0]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [FX - 24, FX - 18], [-28, 16], [z - 4, z + 1], "mid"));
    for (const y of [-20, 12]) out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [FX - 18, FX + 8], [y - 2, y + 2], [z - 4, z + 4], "hi")));
    out.push(D([K.iso([FX - 4, -17.9, z], P), K.iso([FX - 4, 9.9, z], P)], { size: 0.8, tone: "hi" }));
    return out.join("");
  }
  // The two-gate timer on the bench beside the base, its display and the leads up to the gates.
  const TM = { x0: 84, x1: 130, y0: 4, y1: 32, z1: 22 };
  function timerSvg(P, leads) {
    const out = [ISO.wbox(P, [TM.x0, TM.x1], [TM.y0, TM.y1], [0, TM.z1], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [TM.x0 + 4, TM.x1 - 4], [TM.y1, TM.y1 + 0.6], [7, TM.z1 - 3], "hi"))];
    // the leads drop straight down behind the gates to the base, then run along it to the timer
    if (leads) GATES.forEach((d, i) => { const z = ZREL - d * PER_M, x = FX - 22 + i * 3, c = i ? "#7a2a20" : "#3a3e44"; out.push(`<path d="${K.pathOf(LAB.bend([[x, -28, z - 4], [x, -31, z - 8], [x, -31, 8.4], [TM.x0 + 8 + i * 8, -31, 8.4], [TM.x0 + 8 + i * 8, TM.y0 + 6, TM.z1]], 5).map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`); });
    if (leads) out.push(D([[TM.x0 + 8, TM.y0 + 6, TM.z1], [TM.x0 + 16, TM.y0 + 6, TM.z1], [FX - 22, -28, ZREL - GATES[0] * PER_M - 4], [FX - 19, -28, ZREL - GATES[1] * PER_M - 4]].map((p) => K.iso(p, P)), { size: 0.7 }));
    return out.join("");
  }
  // The cake case: a fluted paper cup, open side up, as a cheap shaded lathe.
  const caseSvg = (P, z) => ISO.tinted(ISO.T.paint, S(G.lathe([[0, 10], [9, 14.5], [9.2, 13.4], [0.4, 9]], LAB.Z([FX, 0, z]), P, { fill: "facets", steps: 28 }), { tone: "hi" })) +
    L(G.ribsOf(LAB.Z([FX, 0, z]), 0, 9, 10, 18, P, { r1: 14.5 }), { tone: "faint", free: true });
  const arrow = (P, z0, z1, color, x = FX + 32) => {
    const a = K.iso([x, 0, z0], P), b = K.iso([x, 0, z1], P), dir = Math.sign(a[1] - b[1]) || 1;
    return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}M${(b[0] - 4).toFixed(1)} ${(b[1] + dir * 6).toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${(b[0] + 4).toFixed(1)} ${(b[1] + dir * 6).toFixed(1)}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  ISO.add({
    name: "freefall", title: "Free fall and terminal velocity", compare: "freefall 480 270 320 k=forces",
    about: "A ball dropped from an electromagnet through two light gates falls ½gt² (strobe images ever further apart); a paper cake case reaches terminal velocity when air resistance equals its weight.",
    line: "freefall cx cy height k=strobe|forces drop=1 lab=1 lit=magnet|gates|rule|timer",
    demo: { line: "freefall 480 270 320 k=strobe", script: [{ set: { drop: 0, lit: "magnet" }, hold: 1 }, { set: { drop: 1, lit: "" }, hold: 2.6 }, { set: { k: "forces", drop: 0 }, hold: 1 }, { set: { drop: 1 }, hold: 2.4 }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", H = size * 1.55, W = size * 1.45;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), [TM.x1, TM.y1, TM.z1], [ROD[0], ROD[1], ZREL + 32], [FX, 0, ZREL + 30], [FX + 60, 0, ZREL]], cx, cy, W, H, { azimuth: 58, elevation: 18 }, parent);
      const s = { k: o.k === "forces" ? "forces" : "strobe", t: o.drop === "1" ? 99 : -1, v: 0, y: 0, flashes: [] };
      let lit = o.lit || "", built = "";
      const el = {}, w = ISO.writer();
      const build = () => {
        g.innerHTML = `<g data-name="rule">${standSvg(P)}</g><g data-name="timer">${timerSvg(P, s.k === "strobe")}<g data-part="display"></g></g><g data-name="gates">${s.k === "strobe" ? GATES.map((d) => gateSvg(P, d)).join("") : ""}</g><g data-part="ghosts"></g><g data-part="body"></g><g data-name="magnet">${magnetSvg(P)}</g><g data-part="arrows"></g><g data-part="words"></g>`;
        Object.assign(el, LAB.parts(g));
      };
      // fallen distance (m) at time t: ½gt², or the cake case under drag kv² (v = VT·tanh(gt/VT), s = VT²/g·ln cosh(gt/VT))
      const fall = (tt) => (s.k === "strobe" ? 0.5 * g0 * tt * tt : ((VT * VT) / g0) * Math.log(Math.cosh((g0 * tt) / VT)));
      const speed = (tt) => (s.k === "strobe" ? g0 * tt : VT * Math.tanh((g0 * tt) / VT));
      const tEnd = () => (s.k === "strobe" ? Math.sqrt((2 * H0) / g0) : (() => { let a = 0, b = 5; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; fall(m) < H0 ? (a = m) : (b = m); } return a; })());
      const draw = () => {
        if (built !== s.k) { built = s.k; build(); }
        const tt = Math.max(0, Math.min(s.t, tEnd())), d = fall(tt), key = `${s.k}${tt.toFixed(3)}`, step = s.k === "strobe" ? 0.05 : 0.1;
        const zOf = (dd) => (s.k === "strobe" ? ZREL - dd * PER_M : ZREL + RB - 9 - dd * PER_M);
        w.rebuild(el.body, key, () => (s.k === "strobe" ? ISO.tinted(ISO.T.steel, S(G.sphereOf([FX, 0, zOf(d)], RB, P), { tone: "hi" })) : caseSvg(P, zOf(d))));
        w.rebuild(el.ghosts, `${s.k}${Math.floor(tt / step + 1e-6)}`, () => {
          const out = [];
          for (let n = 1; n * step <= tt + 1e-6; n++) {
            const z = zOf(fall(n * step));
            out.push(`<g opacity=".32">${s.k === "strobe" ? ISO.tinted(ISO.T.steel, S(G.sphereOf([FX, 0, z], RB, P), { tone: "hi" })) : caseSvg(P, z)}</g>`);
            if (lab && (s.k === "forces" || n % 2 === 0)) out.push(ISO.word(K.iso([FX - 17, 0, z + (s.k === "strobe" ? 0 : 5)], P), `${(n * step).toFixed(2)} s`, "#778", { size: 11, anchor: "end", dy: 4 }));
          }
          return out.join("");
        });
        w.rebuild(el.arrows, s.k === "forces" ? key : "", () => {
          if (s.k !== "forces") return "";
          const v = speed(tt), z = zOf(d) + 4, Wt = 34, drag = Wt * (v / VT) ** 2;
          return arrow(P, z, z - Wt, "#c0392b") + (drag > 2 ? arrow(P, z + 10, z + 10 + drag, "#2b6cc4") : "") +
            (lab ? ISO.word(K.iso([FX + 36, 0, z - Wt / 2], P), "weight", "#c0392b", { size: 13, anchor: "start" }) + (drag > 2 ? ISO.word(K.iso([FX + 36, 0, z + 10 + drag / 2], P), "air resistance", "#2b6cc4", { size: 13, anchor: "start" }) : "") : "");
        });
        // the timer's display: the two gate times once the ball has passed them
        w.rebuild(el.display, `${s.k}${GATES.map((h) => fall(tt) >= h).join()}`, () => {
          const out = [];
          if (s.k === "strobe") GATES.forEach((h, i) => { if (fall(tt) >= h) out.push(LAB.faceText(P, [(TM.x0 + TM.x1) / 2, TM.y1 + 0.7, TM.z1 - 7 - i * 6], [1, 0, 0], `t${i + 1}  ${Math.sqrt((2 * h) / g0).toFixed(3)} s`, 4.4, "#7fe08a")); });
          return out.join("");
        });
        w.rebuild(el.words, lab ? `${s.k}${tt > 0}` : "", () => !lab ? "" :
          ISO.word(K.iso([FX, 0, ZREL + 24], P), "electromagnet", "#555", { size: 13, dy: -6 }) + ISO.word(K.iso([FX + 20, 4, ZREL - 0.5 * PER_M], P), "metre rule", "#555", { size: 13, anchor: "start" }) +
          (s.k === "strobe" ? ISO.word(K.iso([FX - 22, 16, ZREL - GATES[1] * PER_M + 6], P), "light gates", "#555", { size: 13, anchor: "end" }) : "") + ISO.word(K.iso([(TM.x0 + TM.x1) / 2, TM.y1, TM.z1 + 2], P), "timer", "#555", { size: 13, dy: -6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k && (p.k === "forces") !== (s.k === "forces")) { s.k = p.k === "forces" ? "forces" : "strobe"; s.t = -1; }
        if (p.drop !== undefined) s.t = +p.drop ? 0 : -1;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (s.t >= 0 && s.t < tEnd()) s.t = ISO.still() ? 99 : s.t + dt / (s.k === "strobe" ? SLOW : 1);
        draw();
        return s.t >= 0 && s.t < tEnd();
      };
      g.readout = () => {
        const tt = Math.max(0, Math.min(s.t, tEnd())), d = fall(tt), v = speed(tt);
        if (s.k === "strobe") {
          const [t1, t2] = GATES.map((h) => Math.sqrt((2 * h) / g0));
          return `fallen ${(d * 100).toFixed(0)} cm in ${tt.toFixed(2)} s, speed ${v.toFixed(2)} m/s · gates at 20 cm and 80 cm: t₁ = ${t1.toFixed(3)} s, t₂ = ${t2.toFixed(3)} s → g = 2(0.80 − 0.20)/(t₂² − t₁²) = ${((2 * 0.6) / (t2 * t2 - t1 * t1)).toFixed(2)} m/s² (shown 4× slower)`;
        }
        return `paper case · speed ${v.toFixed(2)} m/s · air resistance = ${((v / VT) ** 2 * 100).toFixed(0)}% of its weight · ${v > 0.98 * VT ? "terminal velocity: forces balance, steady speed" : "still speeding up"}`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
