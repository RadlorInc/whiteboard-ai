// "clock cx cy size h=3 m=0 run=0|1 lab=1 lit=escape|anchor|pendulum|centre|third|hands" — a skeleton wall clock.
// The movement is open: a brass plate on a wooden backboard carries the train, and a skeleton chapter ring sits in front
// of it, so every wheel can be seen. The centre wheel (64 teeth, once an hour) carries the minute hand; it drives the
// third arbor's 8-leaf pinion (×8), whose 60-tooth wheel drives the escape pinion (×7.5): the 30-tooth escape wheel
// turns 64/8 × 60/8 = 60 times an hour, once a minute, and carries the seconds hand. The pendulum (a seconds pendulum,
// 0.99 m) rocks the anchor; each swing lets one tooth slip half a pitch past a jewelled pallet (6°, one tick a second),
// and the tooth pushes back on the pallet to keep the pendulum swinging. run=1 runs it; set h=, m= winds the hands on.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TAU = Math.PI * 2, M = 1, C = [0, 0], E = [0, 66], PV = [0, 90], RING = [40, 50], ROD_Y = -8;
  const T = (() => { const z = (36 * 36 - 34 * 34 + 66 * 66) / (2 * 66); return [Math.sqrt(36 * 36 - z * z), z]; })();   // 36 from C, 34 from E
  const BOARD = { x: -62, y: -18, w: 124, d: 6, r: 1 }, PLATE = { x: -44, y: -4, w: 88, d: 4, r: 0 };
  const BRASS = ["#b8913f", "#f0d68e"], BFACE = "#f5e3ad", BINK = "#6b5114", STEELC = ["#9a9da3", "#e3e4e7"], SFACE = "#eef0f2", SINK = "#3c3f45";
  const GILT = ISO.tint("#cdb67a", ["#8a7230", "#9c8440", "#ad9552", "#bea665"], "#4d3a0c");   // the plate, darker than the wheels
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const brass = (svg) => ISO.tinted(ISO.T.brass, svg), steel = (svg) => ISO.tinted(ISO.T.steel, svg), wood = (svg) => ISO.tinted(ISO.T.wood, svg);
  const hex = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r]);

  // tooth outlines in x–z round a centre
  function spur(c, n, a) {
    const r = (M * n) / 2, ra = r + M, rf = r - 1.25 * M, p = TAU / n, pts = [];
    for (let i = 0; i < n; i++) {
      const t = a + i * p;
      for (const [f, rr] of [[-0.5, rf], [-0.3, rf], [-0.17, ra], [0.17, ra], [0.3, rf]]) pts.push([c[0] + Math.cos(t + f * p) * rr, c[1] + Math.sin(t + f * p) * rr]);
    }
    return pts;
  }
  // the escape wheel's pointed teeth: a long sloped back up to the tip, a nearly radial locking face back down
  function escapeTeeth(c, a) {
    const n = 30, ra = 16, rf = 12.4, p = TAU / n, pts = [];
    for (let i = 0; i < n; i++) { const t = a + i * p; for (const [f, rr] of [[-0.5, rf], [0.3, ra], [0.36, ra], [0.42, rf]]) pts.push([c[0] + Math.cos(t - f * p) * rr, c[1] + Math.sin(t - f * p) * rr]); }
    return pts;
  }
  // a screen matrix that turns artwork drawn in the plane y round centre c (x–z) by angle a: the projection is linear,
  // so a turn in a plane is M·R·M⁻¹ on screen
  function turn(P, y, c, a) {
    const o = K.iso([c[0], y, c[1]], P), ux = K.iso([c[0] + 1, y, c[1]], P), uz = K.iso([c[0], y, c[1] + 1], P);
    const m = [ux[0] - o[0], ux[1] - o[1], uz[0] - o[0], uz[1] - o[1]], det = m[0] * m[3] - m[2] * m[1];
    const inv = [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det], cs = Math.cos(a), sn = Math.sin(a);
    const r = [m[0] * cs + m[2] * sn, m[1] * cs + m[3] * sn, -m[0] * sn + m[2] * cs, -m[1] * sn + m[3] * cs];   // M·R (columns)
    const n = [r[0] * inv[0] + r[2] * inv[1], r[1] * inv[0] + r[3] * inv[1], r[0] * inv[2] + r[2] * inv[3], r[1] * inv[2] + r[3] * inv[3]];
    return `matrix(${n.map((v) => v.toFixed(4)).join(" ")} ${(o[0] - n[0] * o[0] - n[2] * o[1]).toFixed(2)} ${(o[1] - n[1] * o[0] - n[3] * o[1]).toFixed(2)})`;
  }
  const flat = (P, y, pts) => K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true);
  // crossings: four windows in a wheel's web, drawn at angle 0 in its plane (they turn with turn())
  function windows(P, y, c, r0, r1, fill) {
    const d = [];
    for (let k = 0; k < 4; k++) {
      const a0 = k * TAU / 4 + 0.16 * (8 / r1) + 0.12, a1 = (k + 1) * TAU / 4 - 0.16 * (8 / r1) - 0.12;
      const pts = [...ISO.arc(c[0], c[1], r1, a0, a1, 14), ...ISO.arc(c[0], c[1], r0, a1 - 0.1, a0 + 0.1, 6)];
      d.push(flat(P, y, pts));
    }
    return `<path d="${d.join("")}" fill="${fill}" stroke="${BINK}" stroke-width="0.8" stroke-linejoin="round"/>`;
  }

  ISO.add({
    name: "clock", title: "Pendulum clock", compare: "clock 480 270 380 h=3 m=0",
    about: "An open (skeleton) pendulum clock: the pendulum rocks the anchor, the anchor lets the escape wheel slip one tick a second, and the gear train turns that into the seconds, minute and hour hands.",
    line: "clock cx cy size h=3 m=0 run=0|1 lab=1 lit=escape|anchor|pendulum|centre|third|hands",
    demo: { line: "clock 480 270 380 h=3 m=0", script: [{ set: { run: 1 }, hold: 4 }, { set: { lit: "escape" }, hold: 3 }, { set: { h: 4, m: 40, lit: "" }, hold: 3.5 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", H = size * 1.36, W = size * 1.6;
      const { P, g } = ISO.frame([[-62, -18, -156], [62, -18, -156], [62, -12, 134], [-62, -18, 134], [62, 28, -156], [-62, 28, 134], [70, 0, 70], [-70, 0, 70]], cx, cy, W, H, { azimuth: 70, elevation: 14, pad: 4 }, parent);
      const th1 = Math.atan2(T[1] - C[1], T[0] - C[0]), th2 = Math.atan2(E[1] - T[1], E[0] - T[0]), p8 = TAU / 8;
      const angles = (sec) => {
        const ac = -TAU * sec / 3600;
        const at = th1 + Math.PI + p8 / 2 - (ac - th1) * (64 / 8);
        const ae = th2 + Math.PI + p8 / 2 - (at - th2) * (60 / 8);
        return { ac, at, ae };
      };
      // ── static parts, back to front
      const back = [];
      // backboard with a cresting on top (the cresting is an ISO.prismY outline, which the audit can't see)
      back.push(wood(S(K.slabOf(BOARD, -156, 272, P, 2, 0.6), { tone: "lo", inner: L(K.sideSeam(BOARD, -152, P, 2), { tone: "faint" }) })));
      back.push(ISO.prismY(P, [...ISO.arc(0, 116, 62, 0, Math.PI, 30)].map(([x, z]) => [x, Math.min(z, 116 + 18)]), -18, -12, ["#d9b483", "#f0dcbf"], "#f7e8d0", "#7a5a2e"));
      // brass hanger plate at the top, and the beat scale at the foot of the board
      back.push(brass(ISO.wbox(P, [-6, 6], [-12, -11], [104, 112], "mid")), D([K.iso([0, -11, 108], P)], { size: 1.4, tone: "hi" }));
            back.push(ISO.prismY(P, [...ISO.arc(0, 90, 230, -Math.PI / 2 - 0.1, -Math.PI / 2 + 0.1, 16), ...ISO.arc(0, 90, 240, -Math.PI / 2 + 0.1, -Math.PI / 2 - 0.1, 16)], -12, -11, BRASS, BFACE, BINK));
      const ticks = [];
      for (let i = -6; i <= 6; i++) { const a = -Math.PI / 2 + i * 0.014; ticks.push(K.pathOf([K.iso([PV[0] + Math.cos(a) * (240 - (i % 3 ? 3 : 6)), -11, PV[1] + Math.sin(a) * (240 - (i % 3 ? 3 : 6))], P), K.iso([PV[0] + Math.cos(a) * 240, -11, PV[1] + Math.sin(a) * 240], P)])); }
      back.push(L(ticks.join(""), { tone: "mid", free: "start" }));
      const pend = [];
      // pendulum: rod from the suspension (a stroke, so the audit reports the bob and nut on it as loose) (behind the plate) down past the bob to a pointer over the beat scale
      const k = K.cameraOf(P).k, rod = K.pathOf([K.iso([0, ROD_Y, PV[1]], P), K.iso([0, ROD_Y, -128], P)]);
      pend.push(`<path d="${rod}" fill="none" stroke="${SINK}" stroke-width="${(2.2 * k).toFixed(2)}"/><path d="${rod}" fill="none" stroke="#d5d7db" stroke-width="${(1.3 * k).toFixed(2)}"/>`);
      pend.push(`<path d="${K.pathOf([K.iso([-0.8, ROD_Y, -128], P), K.iso([0, ROD_Y, -138], P), K.iso([0.8, ROD_Y, -128], P)], true)}" fill="#d5d7db" stroke="${SINK}" stroke-width="0.8"/>`);
      pend.push(brass(S(G.disc(ROD_Y - 3, ROD_Y + 3, 17, yAx([0, 0, -108]), P), { tone: "hi", inner: L(G.circleOf(yAx([0, 0, -108]), ROD_Y + 3.02, 12, P), { tone: "faint" }) })));
      pend.push(steel(S(G.prismOf(G.frameOf([0, ROD_Y, -129], [0, 0, 1], [1, 0, 0], [0, 1, 0]), hex(2.6), 0, 4, P), { tone: "mid" })));
      // standoffs hold the plate off the board (the pendulum swings between them)
      const offs = [[-38, -34], [38, -34], [-38, 94], [38, 94]];
      const plate = offs.map(([x, z]) => brass(S(G.disc(-12, -4, 3, yAx([x, 0, z]), P), { tone: "mid" })));
      plate.push(ISO.tinted(GILT, S(K.slabOf(PLATE, -40, 140, P, 2, 0.4), { tone: "mid" })));
      plate.push(D(offs.map(([x, z]) => K.iso([x, 0, z], P)), { size: 1.1, tone: "mid" }));
      // arbors: the steel pins behind the first wheel on each
      const arb = (c, y0, y1, r = 1.3) => steel(S(G.disc(y0, y1, r, yAx([c[0], 0, c[1]]), P), { tone: "hi" }));
      plate.push(arb(C, 0, 4, 1.8), arb(T, 0, 3), arb(E, 0, 9), arb(PV, 0, 17.2));
      // bushes on the plate's face round each arbor
      for (const c of [C, T, E, PV]) plate.push(brass(S(G.disc(0, 0.8, 3.4, yAx([c[0], 0, c[1]]), P), { tone: "hi" })));

      // ── the wheels: walls (tooth-periodic, cached by pose) and their crossings (turned by a matrix)
      const memo = new Map(), Q = 12;
      const node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
      const wheel = (id, c, n, y0, y1, steelPart, escape) => ({ id, c, n, y0, y1, p: TAU / n, svg: (a) => ISO.prismY(P, escape ? escapeTeeth(c, a) : spur(c, n, a), y0, y1, steelPart ? STEELC : BRASS, steelPart ? SFACE : BFACE, steelPart ? SINK : BINK) });
      const WH = [wheel("cw", C, 64, 4, 6), wheel("tp", T, 8, 3, 7.5, true), wheel("tw", T, 60, 10, 12), wheel("ep", E, 8, 9, 13.5, true), wheel("ew", E, 30, 15, 17, false, true)];
      const crossing = { cw: windows(P, 6.02, C, 7, 26, "#b39b5c"), tw: windows(P, 12.02, T, 6, 24, "#b39b5c"), ew: windows(P, 17.02, E, 3.6, 10.6, "#b39b5c") };
      const nameOf = { cw: "centre", tp: "third", tw: "third", ep: "escape", ew: "escape" };
      const slot = (w) => `<g data-name="${nameOf[w.id]}"><g data-part="${w.id}"></g>${crossing[w.id] ? `<g data-part="${w.id}x">${crossing[w.id]}</g>` : ""}</g>`;
      // collets and front pivots that sit on the wheels (the wheels are ISO.prismY outlines, which the audit can't
      // see, so it reports these and the arbor ends beyond them as loose)
      const coll = (c, y, r = 3.2) => brass(S(G.disc(y, y + 1.4, r, yAx([c[0], 0, c[1]]), P), { tone: "hi" }));
      // anchor, drawn at rest in its plane (it turns with turn()); the pallets carry red jewels
      const AY = 19.5, anc = [[-5, 4], [5, 4], [6, 0], [13, -9], [12.5, -13.5], [10, -14.5], [8.5, -11], [3, -5], [0, -6.5], [-3, -5], [-8.5, -11], [-10, -14.5], [-12.5, -13.5], [-13, -9], [-6, 0]].map(([x, z]) => [PV[0] + x, PV[1] + z]);
      const jewel = (s) => flat(P, AY + 0.02, [[s * 9.9, -14.3], [s * 11.4, -13.9], [s * 10.5, -12.2], [s * 9.3, -12.6]].map(([x, z]) => [PV[0] + x, PV[1] + z]));
      const anchor = ISO.prismY(P, anc, 17.2, AY, STEELC, SFACE, SINK) + `<path d="${jewel(1)}${jewel(-1)}" fill="#c4382c" stroke="#7a1d14" stroke-width="0.6"/>`;
      // the dial: feet, chapter ring with hour and minute marks and numerals
      const feet = [150, 210, 330, 10].map((d) => { const a = d * Math.PI / 180; return brass(S(G.disc(0, 24, 1.6, yAx([C[0] + Math.cos(a) * 45, 0, C[1] + Math.sin(a) * 45]), P), { tone: "mid" })); });
      const RF = yAx([C[0], 0, C[1]]), RY = 25.5;
      const marks = [], minor = [];
      for (let i = 0; i < 60; i++) {
        const a = Math.PI / 2 - i * TAU / 60, r0 = i % 5 ? RING[1] - 2.5 : RING[1] - 6;
        (i % 5 ? minor : marks).push(K.pathOf([K.iso([Math.cos(a) * r0, RY + 0.02, Math.sin(a) * r0], P), K.iso([Math.cos(a) * RING[1], RY + 0.02, Math.sin(a) * RING[1]], P)]));
      }
      const ring = `<g style="fill-rule:evenodd">${ISO.tinted(ISO.T.steel, S(G.ringBand(24, RY, RING[0], RING[1], RF, P, { hole: [RY, RING[0]] }), { tone: "hi" }))}</g>` + L(minor.join(""), { tone: "lo", free: "start" }) + L(marks.join(""), { tone: "hi", free: "start" }) +
        [[12, 0], [3, 3], [6, 6], [9, 9]].map(([nm, i]) => { const a = Math.PI / 2 - i * TAU / 12; return ISO.word(K.iso([Math.cos(a) * 43.2, RY, Math.sin(a) * 43.2], P), String(nm), "#2a3340", { size: 11, dy: 4, halo: false }); }).join("");
      // hands at 12 in their planes (turned with turn()); the cannon pipe carries the hour hand
      const handPath = (y, pts, fill, w = 0.7) => `<path d="${flat(P, y, pts)}" fill="${fill}" stroke="#14171c" stroke-width="${w}" stroke-linejoin="round"/>`;
      const HY = 26.6, MY = 27.6, SY = 22;
      const hourHand = handPath(HY, [[-2.2, -6], [2.2, -6], [1.8, 17], [3.6, 21], [0, 29], [-3.6, 21], [-1.8, 17]], "#2b2f36");
      const minHand = handPath(MY, [[-1.5, -9], [1.5, -9], [1.1, 32], [0, 44], [-1.1, 32]], "#2b2f36");
      const secHand = handPath(SY, [[-0.5, -5], [0.5, -5], [0.3, 14.5], [-0.3, 14.5]].map(([x, z]) => [E[0] + x, E[1] + z]), "#c4382c", 0.5);
      const words = !lab ? "" : [
        ISO.word(K.iso([PV[0] - 16, AY, PV[1] - 4], P), "anchor", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([E[0] + 18, 17, E[1] + 4], P), "escape wheel", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([T[0] + 32, 12, T[1] - 8], P), "third wheel", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([20, ROD_Y, -108], P), "pendulum", "#555", { size: 13, anchor: "start", dy: 4 }),
        ISO.word(K.iso([-34, 6, -28], P), "centre wheel", "#555", { size: 13, anchor: "end", dy: 16 }),
      ].join("");
      g.innerHTML = `<g>${back.join("")}</g><g data-name="pendulum" data-part="pend">${pend.join("")}</g><g>${plate.join("")}</g>` +
        slot(WH[0]) + `<g>${coll(C, 6)}</g>` + slot(WH[1]) + `<g>${arb(C, 7.4, 22, 1.8)}</g>` + slot(WH[2]) + `<g>${coll(T, 12)}</g>` + slot(WH[3]) + slot(WH[4]) +
        `<g>${coll(E, 17)}${arb(E, 18.4, 22.8, 1.1)}</g><g data-name="anchor" data-part="anchor">${anchor}</g><g>${coll(PV, AY, 2.6)}${feet.join("")}</g>` +
        `<g data-name="hands" data-part="sec">${secHand}</g><g>${ring}</g>` +
        `<g data-name="hands">${steel(S(G.disc(22, HY, 3.2, RF, P), { tone: "hi" }))}<g data-part="hour">${hourHand}</g><g data-part="min">${minHand}</g>${steel(S(G.disc(MY, MY + 1.6, 2, RF, P), { tone: "hi" }))}</g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      // the pendulum and anchor turn round the suspension in their own planes
      el.pend.innerHTML = `<g>${el.pend.innerHTML}</g>`; el.anchor.innerHTML = `<g>${el.anchor.innerHTML}</g>`;
      const pendG = el.pend.firstChild, ancG = el.anchor.firstChild;

      const s = {
        run: o.run === "1", amp: o.run === "1" ? 1 : 0, ph: 0, e: 0,
        base: (Math.round(ISO.num(o, "h", 3)) % 12) * 3600 + Math.round(ISO.clamp(ISO.num(o, "m", 0), 0, 59)) * 60,
        ff: null,
      };
      let lit = o.lit || "";
      const AMP = 2.4 * Math.PI / 180;                      // the pendulum's swing each side
      const stepped = (sec) => { const f = Math.floor(sec), fr = sec - f; return f + ISO.ease(Math.min(1, fr / 0.12)); };   // the escape wheel drops quickly, then rests
      const draw = () => {
        const sec = s.base + s.e, sd = stepped(sec), A = angles(sd);
        [A.ac, A.at, A.at, A.ae, A.ae].forEach((a, i) => {
          const wh = WH[i], q = Math.round((((a % wh.p) + wh.p) % wh.p) / wh.p * Q) % Q, aq = Math.round(a / wh.p * Q) * wh.p / Q, key = `${wh.id}${q}`;
          if (!memo.has(key)) memo.set(key, node(wh.svg((q / Q) * wh.p)));
          const e = el[wh.id];
          if (e._key !== key) { e._key = key; e.replaceChildren(memo.get(key)); e.parentNode._fresh = true; }
          if (el[`${wh.id}x`]) w.attr(el[`${wh.id}x`], "transform", turn(P, wh.y1 + 0.02, wh.c, aq));
        });
        const phi = s.amp * AMP * Math.cos(Math.PI * s.ph);
        w.attr(pendG, "transform", turn(P, ROD_Y, PV, phi));
        w.attr(ancG, "transform", turn(P, AY, PV, phi));
        w.attr(el.min, "transform", turn(P, MY, C, -TAU * sec / 3600));
        w.attr(el.hour, "transform", turn(P, HY, C, -TAU * sec / 43200));
        w.attr(el.sec, "transform", turn(P, SY, E, -TAU * sd / 60));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.run !== undefined) s.run = !!+p.run;
        if (p.lit !== undefined) lit = p.lit;
        if (p.h !== undefined || p.m !== undefined) {
          const cur = s.base + s.e, hh = p.h !== undefined ? +p.h : Math.floor(cur / 3600), mm = p.m !== undefined ? +p.m : Math.floor(cur / 60) % 60;
          let to = ((Math.round(hh) % 12) * 3600 + ISO.clamp(Math.round(mm), 0, 59) * 60) - Math.floor(s.e);
          while (to < s.base) to += 43200;                  // hands are wound forwards
          s.ff = { from: s.base, to, p: 0, dur: 2.6 };
        }
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.amp = ISO.follow(s.amp, s.run ? 1 : 0, dt, s.run ? 0.5 : 1.1, calm);
        if (!s.run && s.amp < 0.01) s.amp = 0;
        if (s.amp > 0 && !calm) s.ph += dt;
        if (s.run && !calm) s.e += dt;
        if (s.ff) {
          s.ff.p = calm ? 1 : Math.min(1, s.ff.p + dt / s.ff.dur);
          s.base = s.ff.from + (s.ff.to - s.ff.from) * ISO.ease(s.ff.p);
          if (s.ff.p >= 1) { s.base = s.ff.to; s.ff = null; }
        }
        draw();
        return s.run || s.amp > 0 || !!s.ff;
      };
      g.readout = () => {
        const sec = Math.floor(s.base + s.e), hh = Math.floor(sec / 3600) % 12 || 12, mm = Math.floor(sec / 60) % 60, ss = sec % 60;
        return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")} · pendulum 0.99 m, one swing a second (T = 2π√(L/g) = 2 s) · escape wheel 30 teeth: 1 turn a minute · 64/8 × 60/8 = 60 turns an hour · hour hand 12:1 behind the dial${s.ff ? " · winding the hands on" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
