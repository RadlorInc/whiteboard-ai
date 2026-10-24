// "headlight cx cy width k=on|off beam=low|high lab=1 lit=lens|reflector|bulb|indicator|beam" — a car headlight unit.
// A black housing on its mounting tabs, with the clear lens in front. Through the lens: the chrome reflector bowl with
// an H4 bulb at its focus (two filaments: low beam 55 W, high beam 60 W, a black cap over the tip so only reflected
// light leaves), the amber indicator in its own small bowl and the row of LED day-running lights. Two aiming screws on
// top. on lights the low filament and the beam leaves the lens dipped 1 % with its flat cut-off; beam=high lights the
// other filament and the beam lifts and reaches further. set({ k, beam }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const X0 = 0, X1 = 16, DEEP = 6.5, MAIN = { y: -5.5, z: 8.4, r: 6.4 }, IND = { y: 9.6, z: 8, r: 3.2 };
  const OUT = [[-15, 1.5], [15, 1.5], [15, 11.5], [12, 15.5], [-13, 15.5], [-15, 13.5]];
  const BASE = { x: -3, y: -18, w: 22, d: 36, r: 3 };
  const BEAM = { low: { reach: 38, up: [-3, 8.6], w: [-20, 9] }, high: { reach: 46, up: [2, 17], w: [-18, 7] } };
  const SPEC = { low: [55, 1000], high: [60, 1650] };
  const PLASTIC = ISO.T.plastic, STEEL = ISO.T.steel;
  const xAxis = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  let uid = 0;

  // A matrix that draws 2D art (x → +y, y → −z, in cm) on the plane x = x0.
  const planeX = (P, x0) => { const o = K.iso([x0, 0, 0], P), a = K.iso([x0, 1, 0], P), b = K.iso([x0, 0, -1], P); return `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`; };

  function staticSvg(P, id) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -4, 4, P)}"/>`, S(K.slabOf(BASE, -4, 4, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(BASE, -2, P, 4), { tone: "faint" }) }), L(K.planOutline(K.insetPlan(BASE, 2.5), 0, P), { tone: "faint" })];
    // brackets bolted to the board, and the housing's tabs on them
    for (const y of [-12, 12]) out.push(ISO.wbox(P, [2, 12], [y - 2.5, y + 2.5], [0, 1.5], "mid"), D([4, 10].map((x) => K.iso([x, y, 1.5], P)), { size: 0.55, tone: "hi" }));
    // the housing: sides and top shaded, its open front dark inside
    out.push(ISO.tinted(PLASTIC, ISO.prismX(P, OUT, X0, X1, ["#1f2226", "#4a4f56"], "#26292d", "#0d0e10")));
    // aiming screws on the top, each a knurled knob on a collar; a vent cap at the back
    for (const y of [-9, 6]) {
      out.push(ISO.tinted(STEEL, S(K.cylinder(3.5, y, 1.5, 15.5, 0.8, P, 18), { tone: "mid" }) + S(K.cylinder(3.5, y, 1.1, 16.3, 1.6, P, 18), { tone: "hi", inner: L(K.knurl(3.5, y, 1.1, 16.3, 17.9, 12, P, 0), { tone: "lo" }) })));
    }
    out.push(ISO.tinted(PLASTIC, S(K.cylinder(9, -1, 1.4, 15.5, 1.2, P, 18), { tone: "hi" })));
    // inside, clipped to the opening: the reflector bowls (chrome, bright toward the focus) and the bulbs
    const front = K.pathOf(OUT.map(([y, z]) => K.iso([X1, y, z], P)), true);
    out.push(`<clipPath id="${id}c"><path d="${front}"/></clipPath>`);
    out.push(`<defs><radialGradient id="${id}r"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfd5dc"/><stop offset=".85" stop-color="#8b939c"/><stop offset="1" stop-color="#5b626a"/></radialGradient>` +
      `<radialGradient id="${id}g"><stop offset="0" stop-color="#fff8d8" stop-opacity="1"/><stop offset=".4" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="${id}b" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0b8" stop-opacity=".5"/><stop offset=".45" stop-color="#fff4cc" stop-opacity=".22"/><stop offset="1" stop-color="#fff3d0" stop-opacity="0"/></linearGradient></defs>`);
    const bowl = (c, color) => `<g transform="${planeX(P, X1 - DEEP)}"><circle cx="${c.y}" cy="${-c.z}" r="${c.r}" fill="url(#${id}r)" stroke="#2a2e33" stroke-width="0.3"/>` +
      [0.8, 0.6, 0.4].map((f) => `<circle cx="${c.y}" cy="${-c.z}" r="${(c.r * f).toFixed(2)}" fill="none" stroke="#9aa2ab" stroke-width="0.06"/>`).join("") + (color ? `<circle cx="${c.y}" cy="${-c.z}" r="${c.r}" fill="${color}" opacity=".25"/>` : "") + "</g>";
    out.push(`<g clip-path="url(#${id}c)" data-name="reflector">${bowl(MAIN)}${bowl(IND, "#f0a020")}` +
      // the inner walls of the housing from the bowls' rims out to the lens
      `<g transform="${planeX(P, X1 - 0.05)}"><path d="M-14.4 -2.1 H14.4" stroke="#3a3e44" stroke-width="0.25"/></g></g>`);
    return out.join("");
  }
  // The H4 bulb along the light's axis: flange in the bowl, glass, two filaments and the black cap. glow 0–1.
  function bulbSvg(P, id, low, high) {
    const F = xAxis([X1 - DEEP, MAIN.y, MAIN.z]), out = [];
    out.push(ISO.tinted(STEEL, S(G.disc(0, 0.5, 1.6, F, P), { tone: "mid" })));
    const glow = Math.max(low, high);
    if (glow > 0.01) { const c = K.iso(G.pointOf(F, 2.4, 0, 0), P); out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(10 + 16 * glow).toFixed(1)}" fill="url(#${id}g)" opacity="${glow.toFixed(2)}"/>`); }
    out.push(ISO.tinted(ISO.T.glass, S(G.solidOf([[0.5, 0.62], [3.4, 0.62, 1], [3.8, 0.45, 1], [4.05, 0]], F, P), { tone: "hi" })));
    const fil = (s0, s1, dz, on) => { const pts = []; for (let i = 0; i <= 24; i++) { const s = s0 + ((s1 - s0) * i) / 24, a = i * 1.4; pts.push(K.iso(G.add3(G.pointOf(F, s, 0.12, a), [0, 0, dz]), P)); } return `<path d="${K.pathOf(pts)}" fill="none" stroke="${on > 0.3 ? "#fff3c0" : "#6d6f74"}" stroke-width="${on > 0.3 ? 0.9 : 0.5}"/>`; };
    out.push(fil(1.4, 2.4, 0.16, low), fil(2.6, 3.4, -0.1, high));
    out.push(ISO.tinted(PLASTIC, S(G.disc(3.45, 4.15, 0.5, F, P), { tone: "hi" })));
    // the amber indicator bulb: a round lamp in the small bowl
    const Fi = xAxis([X1 - DEEP, IND.y, IND.z]);
    out.push(ISO.tinted(STEEL, S(G.disc(0, 0.4, 1, Fi, P), { tone: "mid" })), ISO.tinted(ISO.T.amber, S(G.solidOf([[0.4, 0.55], [1.2, 0.8, 1], [1.9, 0.6, 1], [2.3, 0]], Fi, P), { tone: "hi" })));
    return out.join("");
  }
  function lensSvg(P, drl) {
    const inset = OUT.map(([y, z]) => [y * 0.97, 8.5 + (z - 8.5) * 0.95]);
    const out = [ISO.prismX(P, OUT, X1, X1 + 0.5, ["#5b6670", "#9aa7b2"], "rgba(222,236,246,0.28)", "#1b2530")];
    out.push(`<path d="${K.pathOf(inset.map(([y, z]) => K.iso([X1 + 0.5, y, z], P)), true)}" fill="none" stroke="#7e95a8" stroke-width="0.6"/>`);
    // the day-running LEDs along the lens's lower edge, on a strip
    out.push(ISO.wbox(P, [X1 - 0.6, X1], [-13, 13], [2.4, 3.6], "lo"));
    const leds = Array.from({ length: 12 }, (_, i) => K.iso([X1, -12 + i * (24 / 11), 3], P));
    out.push(`<g style="--anatomy-dot:${drl ? "#ffffff" : "#8a9099"}">${D(leds, { size: drl ? 1 : 0.7, tone: "hi" })}</g>`);
    return out.join("");
  }
  // The beam: from the main bowl's rim at the lens out to its reach, widening, the low one dipped with a flat top.
  function beamSvg(P, id, mode, on) {
    if (on < 0.01) return "";
    const b = BEAM[mode], near = [[MAIN.y - 5, MAIN.z - 5], [MAIN.y + 5, MAIN.z - 5], [MAIN.y + 5, MAIN.z + 5], [MAIN.y - 5, MAIN.z + 5]].map(([y, z]) => [X1 + 0.6, y, z]);
    const far = [[b.w[0], b.up[0]], [b.w[1], b.up[0]], [b.w[1], b.up[1]], [b.w[0], b.up[1]]].map(([y, z]) => [X1 + b.reach, y, z]);
    const hull = ISO.hullOf([...near, ...far].map((p) => K.iso(p, P))), a = K.iso([X1, MAIN.y, MAIN.z], P), c = K.iso([X1 + b.reach, (b.w[0] + b.w[1]) / 2, (b.up[0] + b.up[1]) / 2], P);
    return `<linearGradient id="${id}bb" gradientUnits="userSpaceOnUse" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${c[0].toFixed(1)}" y2="${c[1].toFixed(1)}" href="#${id}b"/><path d="${K.pathOf(hull, true)}" fill="url(#${id}bb)" opacity="${on.toFixed(2)}"/>`;
  }

  ISO.add({
    name: "headlight", title: "Car headlight", compare: "headlight 480 270 380",
    about: "A headlight unit: through the clear lens the chrome reflector with the H4 bulb at its focus; switched on it throws a dipped low beam, then a higher, longer main beam.",
    line: "headlight cx cy width k=on|off beam=low|high lab=1 lit=lens|reflector|bulb|indicator|beam",
    demo: { line: "headlight 480 270 380 k=off", script: [{ set: {}, hold: 1 }, { set: { k: "on" }, hold: 2.4 }, { set: { beam: "high" }, hold: 2.4 }, { set: { k: "off" }, hold: "settle" }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 1.9, BH = size * 1.05, id = `hl${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -7, 0), [X1, -15, 18], [X1 + 26, 9, 4], [X1 + 26, -18, 4], [0, 15, 18]], cx, cy, BW, BH, { azimuth: 34, elevation: 24 }, parent);
      g.innerHTML = `<g>${staticSvg(P, id)}</g><g data-name="bulb" clip-path="url(#${id}c)"></g><g data-name="lens"></g><g data-name="beam"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { reflector: q("reflector"), bulb: q("bulb"), lens: q("lens"), beam: q("beam"), words: q("words") }, w = ISO.writer();
      const s = { on: o.k === "on" ? 1 : 0, high: o.beam === "high" ? 1 : 0 }, goal = { on: s.on, high: s.high };
      let lit = o.lit || "";
      const draw = () => {
        const low = s.on * (1 - s.high), high = s.on * s.high, mode = s.high > 0.5 ? "high" : "low";
        w.rebuild(el.bulb, `${low.toFixed(2)} ${high.toFixed(2)}`, () => bulbSvg(P, id, low, high));
        w.rebuild(el.lens, String(s.on > 0.5), () => lensSvg(P, s.on > 0.5));
        w.rebuild(el.beam, `${mode} ${s.on.toFixed(2)}`, () => beamSvg(P, id, mode, s.on));
        w.rebuild(el.words, lab ? `${mode} ${s.on > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([X1 + 0.5, 15, 1.5], P), "lens", "#444", { anchor: "start", size: 15, dy: 16 }),
          ISO.word(K.iso([X1, MAIN.y, MAIN.z + MAIN.r], P), "reflector and bulb", "#444", { size: 15, dy: -10 }),
          ISO.word(K.iso([X1, IND.y, IND.z - IND.r], P), "indicator", "#8a5a10", { size: 14, dy: 18 }),
          s.on > 0.5 ? ISO.word(K.iso([X1 + BEAM[mode].reach * 0.6, 0, BEAM[mode].up[1] * 0.8], P), mode === "high" ? "high beam" : "low beam", "#8a5a10", { size: 15 }) : ""].join(""));
        const want = lit || (s.on > 0.5 ? "bulb" : "");
        w.light([el.reflector, el.bulb, el.lens, el.beam], want ? [q(want)].filter(Boolean) : []);
      };
      g.set = (p) => {
        if (p.k) goal.on = p.k === "on" ? 1 : 0;
        if (p.beam) { goal.high = p.beam === "high" ? 1 : 0; goal.on = 1; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        // a filament heats to full brightness in about 0.1 s and cools as fast
        const calm = ISO.still();
        s.on = ISO.follow(s.on, goal.on, dt, 0.08, calm); s.high = ISO.follow(s.high, goal.high, dt, 0.06, calm);
        if (Math.abs(s.on - goal.on) < 0.01) s.on = goal.on;
        if (Math.abs(s.high - goal.high) < 0.01) s.high = goal.high;
        draw();
        return s.on !== goal.on || s.high !== goal.high;
      };
      g.readout = () => {
        if (goal.on < 0.5) return "off · H4 bulb: two filaments in one glass, low 55 W and high 60 W";
        const mode = goal.high ? "high" : "low", [W, lm] = SPEC[mode];
        return `${mode} beam · ${W} W at 12 V = ${(W / 12).toFixed(1)} A · about ${lm} lumens · ${mode === "low" ? "dipped 1 % with a flat cut-off so it doesn't dazzle" : "aimed straight ahead, reaches further"}`;
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
