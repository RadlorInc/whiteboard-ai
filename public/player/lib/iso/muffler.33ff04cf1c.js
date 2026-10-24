// "muffler cx cy width lab=0 lit=downpipe|cat|middle|muffler|tailpipe" — a car's exhaust as it hangs under the floor.
// From the engine's manifold flange: the downpipe with its flex joint, the catalytic converter with an oxygen sensor
// before and after it, the middle box, the muffler, and the tailpipe with its tip; band clamps at the joints and
// rubber hangers up to the body rail. Exhaust pulses travel along it as warm rings (slowed down: at 800 rpm a
// four-cylinder engine sends about 27 a second) and puff out at the tip. set({ lit }) lights one part and the readout
// gives its true numbers. Local helpers: tubeSvg (a pipe route as disc segments with balls at the bends), ovalArc.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. A 5 cm pipe, a 40 cm converter, a 70 × 26 × 15 cm muffler; the exhaust centre 12 cm up.
  const Z = 12, R = 2.5, X = { flange: -196, cat: [-150, -110], mid: [-44, -4], muf: [52, 122], tip: [176, 190] };
  const STEEL = ISO.T.steel, RUBBER = ISO.T.rubber, PAINT = ISO.T.paint;
  const HOT = ISO.tint("#e6d6c3", ["#a58c72", "#b39a80", "#c1a88f", "#cfb79e"], "#5a4430");
  const DOWN = G.fillet([[X.flange, 0, 34], [-186, 0, 34], [-176, 0, Z], [-150, 0, Z]], 8, 7);
  const ROUTE = [...DOWN, [X.tip[1], 0, Z]];
  const CAT_P = [[0, 2.7], [2, 2.7], [6, 6.4, 1], [8, 7], [32, 7], [34, 6.4, 1], [38, 2.7], [40, 2.7]];
  const MID_P = [[0, 2.7], [1.5, 2.7], [3.5, 6.2, 1], [4.5, 6.6], [35.5, 6.6], [36.5, 6.2, 1], [38.5, 2.7], [40, 2.7]];
  const MUF = { a: 13, b: 7.5 }, HANGERS = [-75, 22, 87, 150], CLAMPS = [-100, 2, 50, 128], RAIL_Y = -26;
  const PARTS = [
    { id: "downpipe", word: "downpipe", say: "downpipe · gas leaves the engine at about 600–800 °C · the flex joint lets the engine rock on its mounts", at: -178 },
    { id: "cat", word: "catalytic converter", say: "catalytic converter · hot (400–800 °C), it turns about 90% of the CO, unburnt fuel and NOx into CO₂, water and nitrogen", at: -130 },
    { id: "middle", word: "middle box", say: "middle box · cancels the drone you would hear at steady cruising revs", at: -24 },
    { id: "muffler", word: "muffler", say: "muffler · baffles and perforated tubes make the pulses cancel · about 20–30 dB quieter", at: 87 },
    { id: "tailpipe", word: "tailpipe", say: "tailpipe · the gas comes out at about 100–200 °C", at: 160 },
  ];
  const xAx = (x) => G.frameOf([x, 0, Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  // A pipe along a route: short disc segments, a ball at each joint so the bends stay round.
  function tubeSvg(P, pts, r, tint = STEEL) {
    const out = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = G.sub3(b, a), len = G.len3(d);
      if (len < 1e-6) continue;
      if (i > 1) out.push(S(G.sphereOf(a, r, P, { steps: 20 }), { tone: "hi" }));
      out.push(S(G.disc(0, len, r, G.frameAlong(a, G.unit3(d)), P, { steps: 20 }), { tone: "hi" }));
    }
    return ISO.tinted(tint, out.join(""));
  }
  const pipe = (P, x0, x1) => ISO.tinted(STEEL, S(G.disc(x0, x1, R, xAx(0), P), { tone: "hi" }));
  // The visible part of an oval ring around the muffler at x, as screen points.
  function ovalArc(P, x, a, b) {
    const V = G.viewOf(P), pts = [];
    for (let i = 0; i <= 96; i++) {
      const f = (i / 96) * Math.PI * 2, n = [0, Math.cos(f) / a, Math.sin(f) / b];
      pts.push(n[1] * V[1] + n[2] * V[2] > 0.02 ? K.iso([x, a * Math.cos(f), Z + b * Math.sin(f)], P) : null);
    }
    // The visible side is one run; start from a hidden sample so a run through angle 0 stays whole.
    const k = Math.max(0, pts.findIndex((p) => !p));
    return K.pathOf([...pts.slice(k), ...pts.slice(0, k)].filter(Boolean));
  }

  function staticSvg(P, lab) {
    const parts = Object.fromEntries(PARTS.map((p) => [p.id, []])), back = [], front = [], at3 = (p) => K.iso(p, P);
    // Floor pan and the body rail the hangers bolt to, behind the exhaust.
    const pan = { x: -244, y: -64, w: 450, d: 30, r: 3 };
    back.push(ISO.tinted(PAINT, S(K.slabOf(pan, 36, 2, P, 3, 0.5), { tone: "mid" })));
    back.push(L([-200, -120, -40, 40, 120].map((x) => K.planOutline({ x, y: -58, w: 64, d: 18, r: 4 }, 38, P, 4)).join(""), { tone: "faint" }));
    back.push(ISO.tinted(PAINT, ISO.wbox(P, [-240, 204], [RAIL_Y - 4, RAIL_Y + 4], [28, 36], "mid")));
    back.push(D([-220, -140, -60, 20, 100, 180].map((x) => at3([x, RAIL_Y + 4, 32])), { size: 0.7, tone: "lo" }));
    // Engine end: block and head, the manifold flange with its studs.
    back.push(ISO.wbox(P, [-238, X.flange], [-18, 18], [18, 50], "mid"), ISO.wbox(P, [-236, X.flange - 2], [-16, 16], [50, 58], "mid"));
    back.push(L([24, 30, 36, 42].map((z) => K.segment([X.flange, 18, z], [-238, 18, z], P)).join(""), { tone: "faint" }));
    parts.downpipe.push(ISO.tinted(HOT, S(G.disc(0, 1.6, 5.2, G.frameAlong([X.flange, 0, 34], [1, 0, 0]), P), { tone: "mid" })));
    parts.downpipe.push(D([0.8, 2.37, 3.94, 5.51].map((a) => at3([X.flange + 1.6, Math.cos(a) * 3.8, 34 + Math.sin(a) * 3.8])), { size: 0.8, tone: "lo" }));
    // Downpipe: the bend off the manifold, then the flex joint (a run of thin rings) on the straight.
    const bend = DOWN.filter((p) => p[0] <= -168);
    parts.downpipe.push(tubeSvg(P, [...bend, [-168, 0, Z]], R, HOT));
    for (let i = 0; i < 10; i++) parts.downpipe.push(ISO.tinted(STEEL, S(G.disc(-168 + i, -167 + i, i % 2 ? 2.8 : 3.2, xAx(0), P, { steps: 24 }), { tone: "hi" })));
    parts.downpipe.push(pipe(P, -158, X.cat[0] + 0.5));
    // Converter: a turned can with its seams; oxygen sensors screwed in before and after it.
    const catF = xAx(X.cat[0]);
    parts.cat.push(ISO.tinted(HOT, S(G.solidOf(CAT_P, catF, P), { tone: "hi", inner: L(G.arcOf(catF, 8, 7, P) + G.arcOf(catF, 32, 7, P) + G.arcOf(catF, 20, 7, P), { tone: "faint" }) })));
    for (const x of [-155, -105]) {
      const F = G.frameAlong([x, 0, Z + R - 0.2], [0, 0, 1]);
      parts.cat.push(ISO.tinted(STEEL, S(G.disc(0, 1.6, 1.8, F, P, { steps: 16 }), { tone: "mid" }) + S(G.prismOf(F, Array.from({ length: 6 }, (_, k) => [Math.cos(k * 1.047) * 1.6, Math.sin(k * 1.047) * 1.6]), 1.6, 3.4, P), { tone: "hi" })));
      parts.cat.push(ISO.tinted(RUBBER, S(G.disc(3.4, 7.4, 1.1, F, P, { steps: 14 }), { tone: "mid" })), D([at3([x, 0, Z + R + 7.2])], { size: 0.6, tone: "lo" }));
    }
    parts.cat.push(pipe(P, X.cat[1] - 0.5, X.mid[0] + 0.5));
    const midF = xAx(X.mid[0]);
    parts.middle.push(ISO.tinted(STEEL, S(G.solidOf(MID_P, midF, P), { tone: "hi", inner: L(G.arcOf(midF, 4.5, 6.6, P) + G.arcOf(midF, 35.5, 6.6, P), { tone: "faint" }) })));
    parts.middle.push(pipe(P, X.mid[1] - 0.5, X.muf[0] + 0.2));
    // Muffler: an oval box with rolled seams round it and its end plates.
    const oval = Array.from({ length: 48 }, (_, i) => { const f = (i / 48) * Math.PI * 2; return [MUF.a * Math.cos(f), Z + MUF.b * Math.sin(f)]; });
    const seams = [X.muf[0] + 2.5, X.muf[1] - 2.5, (X.muf[0] + X.muf[1]) / 2].map((x) => ovalArc(P, x, MUF.a + 0.05, MUF.b + 0.05)).join("");
    parts.muffler.push(ISO.prismX(P, oval, X.muf[0], X.muf[1], ["#8d9096", "#e3e5e8"], "#c7c9cd", "#3c3f45") + `<path d="${seams}" fill="none" stroke="#6c7076" stroke-width="0.7"/>`);
    parts.muffler.push(ISO.tinted(STEEL, S(G.ringBand(0, 0.6, 2.6, 4.4, xAx(X.muf[1]), P), { tone: "mid" })));
    parts.tailpipe.push(pipe(P, X.muf[1] + 0.6, X.tip[0]));
    parts.tailpipe.push(ISO.tinted(STEEL, S(G.lathe([[X.tip[0], 2.6], [X.tip[0] + 1, 3.3], [X.tip[1], 3.3]], xAx(0), P, { hole: [X.tip[1], 2.6] }), { tone: "hi" })));
    parts.tailpipe.push(`<path d="${K.pathOf(ISO.arc(0, Z, 2.6, 0, Math.PI * 2, 32).map(([y, z]) => at3([X.tip[1] + 0.02, y, z])), true)}" fill="#2b2f34"/>`);
    // Band clamps at the joints (each with its bolt lug), hangers: rod, rubber, bracket off the rail.
    for (const x of CLAMPS) {
      front.push(ISO.tinted(STEEL, S(G.ringBand(x - 1.2, x + 1.2, R, R + 0.9, xAx(0), P, { steps: 28 }), { tone: "mid" })));
      front.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 1.2, x + 1.2], [-1.4, 1.4], [Z + R + 0.6, Z + R + 2.4], "mid")), D([at3([x + 1.22, 0, Z + R + 1.5])], { size: 0.6, tone: "lo" }));
    }
    for (const x of HANGERS) {
      const top = x === 87 ? Z + MUF.b : Z + R;
      front.push(ISO.tinted(STEEL, S(K.cylinder(x, 0, 0.55, top - 0.4, 24 - top, P, 12), { tone: "mid", crease: "none" })));
      front.push(ISO.tinted(RUBBER, S(G.ringBand(-1.6, 1.6, 1.1, 3.2, G.frameAlong([x, 0, 26.6], [0, 1, 0]), P, { steps: 28 }), { tone: "mid" })));
      front.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 1.4, x + 1.4], [RAIL_Y + 4, 2], [29.8, 31.4], "mid")), D([at3([x, -2, 31.4])], { size: 0.6, tone: "lo" }));
    }
    if (lab) PARTS.forEach((p) => front.push(ISO.word(at3([p.at, 18, 0]), p.word, "#555", { dy: p.id === "cat" ? 38 : 18, size: 14 })));
    if (lab) { const e = at3([-238, 18, 34]); back.push(ISO.word([e[0] - 8, e[1]], "engine", "#555", { anchor: "end", size: 14 })); }
    return { back: back.join(""), parts, front: front.join("") };
  }
  const LEN = G.pathLength(ROUTE);
  // Radius of the body round the route at x (for the travelling rings).
  const bodyR = (x) => {
    const inP = (prof, x0) => { const s = x - x0; for (let i = 1; i < prof.length; i++) if (s <= prof[i][0]) { const [a, ra] = prof[i - 1], [b, rb] = prof[i]; return ra + ((rb - ra) * (s - a)) / (b - a || 1); } return R; };
    if (x >= X.cat[0] && x <= X.cat[1]) return inP(CAT_P, X.cat[0]);
    if (x >= X.mid[0] && x <= X.mid[1]) return inP(MID_P, X.mid[0]);
    if (x >= X.tip[0]) return 3.3;
    return R;
  };

  ISO.add({
    name: "muffler", title: "Exhaust system", compare: "muffler 460 280 460",
    about: "A car's exhaust as it hangs under the floor: downpipe, catalytic converter, middle box, muffler and tailpipe on rubber hangers; exhaust pulses travel along it and each part lights in turn.",
    line: "muffler cx cy width lab=0 lit=downpipe|cat|middle|muffler|tailpipe",
    demo: { line: "muffler 460 280 460", script: PARTS.map((p) => ({ set: { lit: p.id }, hold: 2.6 })) },
    make([cx, cy, W = 460], o, t, parent) {
      const lab = o.lab !== "0", Wd = W * 1.75, H = Wd * 0.56;
      const { P, g } = ISO.frame([[-244, -64, 38], [206, -64, 38], [-244, 18, 0], [206, 18, 0], [-238, 18, 58], [X.tip[1], 4, 4]], cx, cy, Wd, H, { azimuth: 70, elevation: 30 }, parent);
      const st = staticSvg(P, lab);
      g.innerHTML = st.back + PARTS.map((p) => `<g data-name="${p.id}">${st.parts[p.id].join("")}</g>`).join("") + st.front + `<g data-part="pulses"></g>`;
      const pulses = g.querySelector('[data-part="pulses"]'), parts = [...g.querySelectorAll("[data-name]")], w = ISO.writer();
      const s = { lit: PARTS.some((p) => p.id === o.lit) ? o.lit : "downpipe", clock: 0 };
      const SPEED = 42, GAP = 34, fx = ISO.puffsFx(g, P, Wd, H, ISO.end(g), 4);
      const pulseSvg = () => {
        const rings = [], puffs = [];
        for (let k = 0; k * GAP < LEN + GAP; k++) {
          const at = (s.clock * SPEED + k * GAP) % (LEN + GAP);
          if (at > LEN) continue;
          const p = G.pointAlong(ROUTE, at), tan = G.tangentAlong(ROUTE, at), alpha = ISO.smooth(0, 20, at) * (1 - ISO.smooth(LEN - 16, LEN, at));
          if (alpha < 0.03) continue;
          const d = p[0] >= X.muf[0] && p[0] <= X.muf[1] ? ovalArc(P, p[0], MUF.a + 0.1, MUF.b + 0.1) : G.arcOf(G.frameAlong(p, tan), 0, bodyR(p[0]) + 0.15, P);
          rings.push(`<path d="${d}" opacity="${alpha.toFixed(2)}"/>`);
        }
        if (fx) fx(Array.from({ length: 4 }, (_, k) => { const f = ((s.clock * SPEED) / GAP + k / 4) % 1; return [X.tip[1] + 3 + f * 26, 0, Z + f * 3, 2.2 + f * 6, 0.5 * Math.sin(Math.PI * f)]; }));
        else for (let k = 0; k < 4; k++) {
          const f = ((s.clock * SPEED) / GAP + k / 4) % 1, c = K.iso([X.tip[1] + 3 + f * 26, 0, Z + f * 3], P), r = (2.2 + f * 6) * G.scaleOf(P);
          puffs.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" opacity="${(0.4 * Math.sin(Math.PI * f)).toFixed(2)}"/>`);
        }
        return `<g fill="none" stroke="#f2a33a" stroke-width="1.6" stroke-linecap="round">${rings.join("")}</g><g fill="#cfd6dd" stroke="#9aa3ad" stroke-width="0.5">${puffs.join("")}</g>`;
      };
      const draw = () => {
        w.rebuild(pulses, ISO.still() ? "still" : s.clock.toFixed(3), pulseSvg);
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.lit && PARTS.some((q) => q.id === p.lit)) s.lit = p.lit; };
      g.update = (dt) => { if (!ISO.still()) s.clock += dt; draw(); return !ISO.still(); };
      g.readout = () => `${PARTS.find((p) => p.id === s.lit).say} · idle 800 rpm, 4 cylinders: about 27 pulses a second (shown slowed)`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
