// "radiator cx cy width temp=20-110 lab=1 lit=core|cap|tank|hoses" — a car radiator with its hoses and overflow tank.
// An aluminium core (flat tubes, wavy fins between them) between two plastic end tanks, standing on rubber mounts on
// the cross member. Hot coolant comes from the engine's thermostat housing down the top hose into the left tank,
// crosses the core, and returns from the right tank's bottom outlet to the water pump. The filler neck carries the
// pressure cap (1.1 bar spring); a small hose runs from the neck to the see-through overflow tank with MIN and MAX.
// As the engine warms, 6 litres of coolant swell about 4.5 % (270 ml); the sealed system rises to 1.1 bar, the cap's
// spring lifts and the extra goes to the tank, whose level climbs 3.4 cm. Cooling, it is drawn back. set({ temp }).
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CORE = { x0: -28, x1: 28, z0: 8, z1: 42, y0: -1.6, y1: 1.6 }, TW = 4.5;
  const TANK = { x0: 46, x1: 56, y0: -6, y1: 2, z0: 12, z1: 34 }, NECK = 28 + 4.5 / 2, MIN = 17, MAX = 25, LEVEL0 = 18;
  const VOL = 6000, BETA = 0.0006, AREA = (TANK.x1 - TANK.x0) * (TANK.y1 - TANK.y0), CAP = 1.1;
  const ENG = { x: -54, y: -26, w: 18, d: 14, r: 2 };
  const PLASTIC = ISO.T.plastic, ALU = ISO.tint("#e3e6ea", ["#9aa1a9", "#adb3ba", "#c0c5cb", "#d1d5da"], "#4a525b"), RUBBER = ISO.T.rubber, STEEL = ISO.T.steel;
  const BASE = { x: -58, y: -30, w: 120, d: 40, r: 4 };
  const swell = (t) => VOL * BETA * Math.max(0, t - 20);                                // ml pushed out
  const level = (t) => LEVEL0 + swell(t) / AREA;                                         // cm in the tank
  const press = (t) => Math.min(CAP, Math.max(0, (t - 20) / 60) * CAP);                  // bar, held by the cap
  const xA = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), zA = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  let uid = 0;

  // A hose: straight runs between points joined by balls, ending in clamps; returns svg and its centreline.
  const hose = (P, pts, r) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], d = G.sub3(b, a), l = G.len3(d);
      out.push(S(G.disc(0, l, r, G.frameAlong(a, G.unit3(d)), P), { tone: "hi" }));
      if (i < pts.length - 2) out.push(S(G.sphereOf(b, r, P), { tone: "hi" }));
    }
    return ISO.tinted(RUBBER, out.join(""));
  };
  const clamp = (P, at, dir, r) => ISO.tinted(STEEL, S(G.disc(-0.6, 0.6, r + 0.3, G.frameAlong(at, dir), P), { tone: "mid" }));

  function staticSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -4, 4, P)}"/>`, S(K.slabOf(BASE, -4, 4, P, 4, 0.8), { tone: "lo", inner: L(K.sideSeam(BASE, -2, P, 4), { tone: "faint" }) })];
    // the engine's corner behind, with the thermostat housing on top and the water-pump inlet low down
    out.push(S(K.slabOf(ENG, 0, 40, P, 2, 0.8), { tone: "mid", inner: L(K.sideSeam(ENG, 30, P, 2), { tone: "faint" }) }));
    out.push(ISO.tinted(ALU, S(G.disc(0, 3, 3.2, xA([ENG.x + ENG.w, -19, 34]), P), { tone: "hi" }) + S(G.disc(0, 3, 3.2, xA([ENG.x + ENG.w, -19, 8]), P), { tone: "hi" })));
    // the cross member and two rubber mounts the radiator's pegs sit in
    out.push(ISO.wbox(P, [-38, 40], [-4, 4], [0, 4], "mid"));
    for (const x of [-32, 32]) out.push(ISO.tinted(RUBBER, S(K.cylinder(x, 0, 2.2, 4, 2.4, P, 18), { tone: "hi" })));
    // the hoses, routed behind the radiator first: the top hose from the thermostat housing round to the left tank's
    // inlet, the bottom hose from the right tank's outlet back along the cross member to the water pump
    const top = [[ENG.x + ENG.w + 3, -19, 34], [CORE.x0 - TW - 4, -19, 34], [CORE.x0 - TW - 4, 0, 38], [CORE.x0 - TW - 0.6, 0, 38]];
    const bottom = [[CORE.x1 + TW + 3, 0, 6], [CORE.x1 + TW + 6, 0, 6], [CORE.x1 + TW + 6, -12, 6.2], [-30, -12, 6.2], [ENG.x + ENG.w + 3, -19, 8]];
    out.push(`<g data-name="hoses">${hose(P, bottom.slice(1), 1.8)}${S(G.sphereOf(bottom[1], 1.8, P), { tone: "hi" }).replace("<g", `<g style="${RUBBER}"`)}${clamp(P, [ENG.x + ENG.w + 4, -19.3, 7.9], G.unit3(G.sub3(bottom[3], bottom[4])), 1.8)}` +
      hose(P, top, 1.8) + clamp(P, [CORE.x0 - TW - 1.6, 0, 38], [1, 0, 0], 1.8) + clamp(P, [ENG.x + ENG.w + 3.8, -19, 34], [1, 0, 0], 1.8) + "</g><g data-part=\"flowback\" class=\"FLOWCLASS\"></g>");
    // the core: front face with fin waves (fine verticals) and the flat tubes (horizontals), on an aluminium frame
    out.push(ISO.tinted(ALU, ISO.wbox(P, [CORE.x0, CORE.x1], [CORE.y0, CORE.y1], [CORE.z0, CORE.z1], "mid")));
    const fins = [], tubes = [];
    for (let x = CORE.x0 + 0.6; x < CORE.x1 - 0.3; x += 0.7) fins.push(K.segment([x, CORE.y1, CORE.z0], [x, CORE.y1, CORE.z1], P));
    for (let z = CORE.z0 + 1.7; z < CORE.z1 - 1; z += 1.7) tubes.push(K.segment([CORE.x0, CORE.y1, z], [CORE.x1, CORE.y1, z], P));
    out.push(`<g data-name="core">${L(fins.join(""), { tone: "faint" })}${L(tubes.join(""), { tone: "lo" })}</g>`);
    // the side tanks, crimped to the core's header plates; left: inlet; right: outlet, drain plug and filler neck
    for (const [x0, x1] of [[CORE.x0 - TW, CORE.x0], [CORE.x1, CORE.x1 + TW]]) {
      out.push(ISO.tinted(PLASTIC, ISO.wbox(P, [x0, x1], [-2.6, 2.6], [CORE.z0 - 2, CORE.z1 + 2], "hi")));
      out.push(ISO.tinted(ALU, ISO.wbox(P, [x0 - 0.3, x1 + 0.3], [-2.9, 2.9], [CORE.z0 - 2.6, CORE.z0 - 2], "mid") + ISO.wbox(P, [x0 - 0.3, x1 + 0.3], [-2.9, 2.9], [CORE.z1 + 2, CORE.z1 + 2.6], "mid")));
      const crimps = []; for (let z = CORE.z0; z <= CORE.z1; z += 3.4) crimps.push(K.iso([x0 < 0 ? x1 : x0, 2.6, z], P));
      out.push(D(crimps, { size: 0.5, tone: "mid" }));
    }
    out.push(ISO.tinted(PLASTIC, S(G.disc(0, 3, 2.4, G.frameAlong([CORE.x1 + TW, 0, 6], [1, 0, 0]), P), { tone: "hi" })));
    out.push(ISO.tinted(PLASTIC, S(G.prismOf(G.frameAlong([CORE.x1 + 1.5, 2.6, CORE.z0 - 0.4], [0, 1, 0]), Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 0.9, Math.sin(i * 1.047) * 0.9]), 0, 1, P), { tone: "mid" })));
    out.push(ISO.tinted(RUBBER, hose(P, bottom.slice(0, 2), 1.8)) + clamp(P, [CORE.x1 + TW + 3.8, 0, 6], [1, 0, 0], 1.8));
    // the filler neck on the right tank, and the overflow tank on its stand beside the radiator
    out.push(ISO.tinted(ALU, S(K.cylinder(NECK, 0, 1.8, CORE.z1 + 2.6, 2.2, P, 24), { tone: "hi" })));
    out.push(ISO.wbox(P, [TANK.x0 - 1, TANK.x1 + 1], [TANK.y0 - 1, TANK.y1 + 1], [4, TANK.z0], "mid"));
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [TANK.x0, TANK.x1], [TANK.y0, TANK.y1], [TANK.z0, TANK.z1], "hi")));
    out.push(ISO.tinted(PLASTIC, S(K.cylinder(TANK.x0 + 6, TANK.y0 + 4, 2.2, TANK.z1, 2, P, 24, 0.4), { tone: "hi", inner: L(K.knurl(TANK.x0 + 6, TANK.y0 + 4, 2.2, TANK.z1, TANK.z1 + 2, 16, P, 0), { tone: "lo" }) })));
    // the overflow line: from the neck's side spout over to the tank's top nipple
    const ov = [[NECK, 1.8, CORE.z1 + 3.6], [NECK, 4.4, CORE.z1 + 3.6], [NECK, 4.4, CORE.z1 + 6], [TANK.x0 + 2.4, 4.4, CORE.z1 + 6], [TANK.x0 + 2.4, TANK.y1 - 2, TANK.z1 + 1]];
    out.push(ISO.tinted(PLASTIC, S(K.cylinder(TANK.x0 + 2.4, TANK.y1 - 2, 0.8, TANK.z1, 1, P, 14), { tone: "hi" })));
    out.push(`<g data-part="overflow">${hose(P, ov, 0.5)}</g>`);
    return { svg: out.join(""), flow: [top, bottom, ov] };
  }
  // The coolant seen through the tank's front, MIN and MAX marks hanging off its right edge.
  function levelSvg(P, z) {
    const f = TANK.y1 + 0.05, x0 = TANK.x0 + 0.6, x1 = TANK.x1 - 0.6;
    return `<path d="${K.pathOf([[x0, f, TANK.z0 + 0.6], [x1, f, TANK.z0 + 0.6], [x1, f, z], [x0, f, z]].map((p) => K.iso(p, P)), true)}" fill="#b9e2a6" fill-opacity=".85" stroke="#4d8a3a" stroke-width="0.6"/>` +
      L(K.segment([TANK.x1, f, TANK.z0], [TANK.x1, f, TANK.z1], P), { tone: "lo" }) + L([MIN, MAX].map((m) => K.segment([TANK.x1, f, m], [TANK.x1 - 3, f, m], P)).join(""), { tone: "mid", free: "end" });
  }
  // The pressure cap: a ribbed cap on the neck, lifted a little while its spring is open.
  function capSvg(P, lift) {
    const x = NECK, z = CORE.z1 + 4.8 + lift;
    return ISO.tinted(STEEL, S(K.cylinder(x, 0, 2.6, z, 1.4, P, 28, 0.4), { tone: "hi", inner: L(K.knurl(x, 0, 2.6, z, z + 1.4, 22, P, 0), { tone: "lo" }) }) + L(K.ring(x, 0, 1.2, z + 1.4, P, 18), { tone: "lo" }));
  }

  ISO.add({
    name: "radiator", title: "Radiator and overflow tank", compare: "radiator 470 280 420",
    about: "A radiator with its hoses and pressure cap: as the coolant warms it swells, the sealed system rises to 1.1 bar, the cap lets the extra into the overflow tank and draws it back as it cools.",
    line: "radiator cx cy width temp=20-110 lab=1 lit=core|cap|tank|hoses",
    demo: { line: "radiator 470 280 420", script: [{ set: {}, hold: 1 }, { set: { temp: 95 }, hold: "settle" }, { set: { temp: 20 }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 1.75, BH = size * 1.05, id = `rd${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -4, 0), [CORE.x0 - TW, 0, CORE.z1 + 12], [TANK.x1 + 6, 4, CORE.z1 + 8], [ENG.x, ENG.y, 40]], cx, cy, BW, BH, { azimuth: 62, elevation: 22 }, parent);
      const st = staticSvg(P, lab);
      const flowD = st.flow.map((pts) => K.pathOf(pts.map((p) => K.iso(p, P))));
      g.innerHTML = `<style>.${id}-f path{stroke-dasharray:2 7;animation:${id}-a 1.4s linear infinite}@keyframes ${id}-a{to{stroke-dashoffset:-18}}@media (prefers-reduced-motion:reduce){.${id}-f path{animation:none}}</style>` +
        `<g>${st.svg.replace("FLOWCLASS", `${id}-f`)}</g><g data-name="tank"></g><g data-name="cap"></g><g class="${id}-f" data-part="flow"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { flowback: q("flowback"), core: q("core"), hoses: q("hoses"), tank: q("tank"), cap: q("cap"), flow: q("flow"), words: q("words") }, w = ISO.writer();
      const s = { temp: ISO.clamp(ISO.num(o, "temp", 20), 20, 110) }, goal = { temp: s.temp };
      let lit = o.lit || "";
      const draw = () => {
        const z = level(s.temp), open = press(s.temp) >= CAP - 1e-6 && goal.temp > s.temp + 0.3, back = goal.temp < s.temp - 0.3;
        w.rebuild(el.tank, z.toFixed(2), () => levelSvg(P, z));
        w.rebuild(el.cap, String(open), () => capSvg(P, open ? 0.35 : 0));
        // flow marks: coolant circulates once the thermostat opens (above 88 °C); the overflow line runs while it fills or empties
        const hot = s.temp > 88, over = open || back;
        const mark = (d, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`;
        w.rebuild(el.flowback, String(hot), () => (hot ? mark(flowD[0], "#e3826f") + mark(flowD[1], "#e3826f") : ""));
        w.rebuild(el.flow, `${over} ${back}`, () => (over ? mark(back ? K.pathOf(st.flow[2].map((p) => K.iso(p, P)).reverse()) : flowD[2], "#7fbf6a") : ""));
        w.rebuild(el.words, lab ? `${Math.round(s.temp / 5)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([0, CORE.y1, CORE.z0], P), "core: tubes and fins", "#444", { size: 15, dy: 22 }),
          ISO.word(K.iso([NECK, 0, CORE.z1 + 7], P), "pressure cap", "#444", { anchor: "end", size: 15, dy: -10 }),
          ISO.word(K.iso([TANK.x1, TANK.y1, TANK.z1 + 2], P), "overflow tank", "#444", { anchor: "start", size: 15, dy: -4 }),
          ISO.word(K.iso([TANK.x1, TANK.y1, MAX], P), "MAX", "#2c6a22", { anchor: "start", size: 11, dy: 4 }), ISO.word(K.iso([TANK.x1, TANK.y1, MIN], P), "MIN", "#c0392b", { anchor: "start", size: 11, dy: 4 }),
          ISO.word(K.iso([ENG.x + ENG.w / 2, ENG.y + ENG.d, 40], P), "engine", "#555", { size: 14, dy: -8 }),
          ISO.word(K.iso([CORE.x0 - TW - 4, -10, 36], P), "top hose", "#555", { anchor: "end", size: 13, dy: -8 })].join(""));
        const want = lit || (s.temp !== goal.temp ? "tank" : "");
        w.light([el.core, el.hoses, el.tank, el.cap], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.temp !== undefined) goal.temp = ISO.clamp(+p.temp, 20, 110); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        // warming takes a few minutes in a car; here a calm 30 °C a second
        const step = 30 * dt;
        s.temp = ISO.still() || Math.abs(goal.temp - s.temp) <= step ? goal.temp : s.temp + Math.sign(goal.temp - s.temp) * step;
        draw();
        return s.temp !== goal.temp;
      };
      g.readout = () => {
        const ml = Math.round(swell(s.temp)), p = press(s.temp);
        if (s.temp < 30) return `cold, 20 °C · tank at its cold line, just above MIN · 0 bar`;
        return `${Math.round(s.temp)} °C · coolant swelled ${ml} ml · system at ${p.toFixed(2)} bar${p >= CAP - 1e-6 ? " (cap's spring open, extra goes to the tank)" : ""} · boils at ${Math.round(107 + p * 20)} °C, not 107`;
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
