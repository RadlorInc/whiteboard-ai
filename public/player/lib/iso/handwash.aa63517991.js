// "handwash cx cy size k=1|2|3|4|5|6|strip step=1..6 run=0|1 lab=0 lit=hands|tap|soap|basin" — washing hands, the
// six rubbing moves. A pair of plain hands (built by ISO.hand from cpr.js) over a wash basin on a counter, the pillar
// tap behind it (turned off while you rub) and a pump soap bottle beside it, lather between the hands. Seen over the
// washer's shoulder. Each step is one of the six moves, and the moving hand rubs back and forth or round:
// 1 palm to palm · 2 right palm over the back of the left, fingers interlaced (then swap) · 3 palm to palm, fingers
// interlaced · 4 backs of the fingers against the opposite palm, fingers hooked · 5 each thumb turned in the other
// hand's fist · 6 fingertips rubbed round in the other palm. The rubbing takes about 20 seconds in all.
// k=strip draws all six side by side. set({ step }) changes the move; set({ run: 1 }) goes through all six.
// World units: 1 = 1 cm. f is forward from the washer (toward the tap), r is to the washer's right.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const C = [3, 0, 27], W3 = (f, r, z) => [f, -r, z], at = (f, r, z) => G.add3(C, W3(f, r, z));
  const NAMES = ["", "palm to palm", "backs of the hands, fingers interlaced", "palm to palm, fingers interlaced", "backs of the fingers in the other palm", "thumbs, rubbed round in the other fist", "fingertips, rubbed round in the other palm"];
  const STEPS = [
    { title: "Palm to palm", say: "Wet your hands, take soap, and rub palm against palm." },
    { title: "Backs of the hands", say: "Right palm over the back of the left hand, fingers interlaced; then swap." },
    { title: "Between the fingers", say: "Palm to palm with the fingers interlaced." },
    { title: "Backs of the fingers", say: "Hook the fingers together and rub the backs of the fingers in the other palm." },
    { title: "Thumbs", say: "Hold each thumb in the other fist and rub it round." },
    { title: "Fingertips", say: "Rub the fingertips round in the other palm, then rinse and dry." },
  ];
  const straight = (c = 0.05) => [[c, c], [c, c], [c, c], [c, c]], bent = (a, b) => [[a, b], [a, b], [a, b], [a, b]];
  const wider = [0.11, 0.04, -0.05, -0.13];
  // Each pose: the left hand (still), the right hand (it moves by path(phase)) and where the lather gathers.
  function pose(k, P) {
    const v = (f, r, z) => W3(f, r, z);
    if (k === 1) {
      const a = v(1, 0, 0.55);
      return { L: { o: at(-5, -1.35, -2), a, n: v(0, 1, 0), side: "L", curl: straight(), thumb: { out: 0.45, down: 0, bend: 0.1 }, arm: v(-1, -0.35, -0.4), armLen: 9 },
        R: { o: at(-5, 1.35, -2), a, n: v(0, -1, 0), side: "R", curl: straight(), thumb: { out: 0.45, down: 0, bend: 0.1 }, arm: v(-1, 0.35, -0.4), armLen: 9 },
        path: (p) => G.mul3(G.unit3(a), 1.5 * Math.sin(p * 2 * Math.PI)), rub: "back and forth" };
    }
    if (k === 2) {
      return { L: { o: at(-5, 0, -1.5), a: v(1, 0, 0), n: v(0, 0, -1), side: "L", curl: straight(0.08), spread: wider, thumb: { out: 0.6, down: 0.1 }, arm: v(-1, -0.3, -0.35), armLen: 9 },
        R: { o: at(-7, 0.3, 1.25), a: v(1, 0, -0.06), n: v(0, 0, -1), side: "R", curl: bent(0.32, 0.3), spread: wider, shift: 1, thumb: { out: 0.55, down: 0.2 }, arm: v(-1, 0.3, 0.05), armLen: 9 },
        path: (p) => v(1.6 * Math.sin(p * 2 * Math.PI), 0, 0), rub: "back and forth" };
    }
    if (k === 3) {
      const a = v(1, 0, 0.3);
      return { L: { o: at(-5, -1.35, -2), a, n: v(0, 1, 0), side: "L", curl: bent(0.28, 0.2), spread: wider, thumb: { out: 0.5, down: 0 }, arm: v(-1, -0.35, -0.35), armLen: 9 },
        R: { o: at(-5.5, 1.35, -2), a, n: v(0, -1, 0), side: "R", curl: bent(0.28, 0.2), spread: wider, shift: 1, thumb: { out: 0.5, down: 0 }, arm: v(-1, 0.35, -0.35), armLen: 9 },
        path: (p) => G.mul3(G.unit3(a), 1.2 * Math.sin(p * 2 * Math.PI)), rub: "back and forth" };
    }
    if (k === 4) {
      return { L: { o: at(-1, -9.1, -4.5), a: v(0, 1, 0), n: v(0, 0, 1), side: "L", curl: bent(1.05, 1.0), thumb: { out: 0.35, down: 0.5, bend: 0.3 }, arm: v(-0.75, -0.6, -0.25), armLen: 9 },
        R: { o: at(-1.2, 8.6, 4.2), a: v(0, -1, -0.08), n: v(0, 0, -1), side: "R", curl: bent(1.05, 1.0), shift: 1, thumb: { out: 0.35, down: 0.5, bend: 0.3 }, arm: v(-0.75, 0.6, -0.3), armLen: 9 },
        path: (p) => v(1.3 * Math.sin(p * 2 * Math.PI), 0, 0), rub: "side to side" };
    }
    if (k === 5) {
      const Lh = { o: at(-6, -1.6, -4), a: v(1, 0, 0.12), n: v(0, 1, 0), side: "L", curl: bent(0.2, 0.15), thumb: { out: 1.2, down: -0.05, bend: 0.08 }, arm: v(-1, -0.35, -0.4), armLen: 9 };
      const th = ISO.hand(P, Lh).thumb, mid = G.lerp3(th[0], th[2], 0.55), aR = G.unit3(v(1, 0, 0));
      return { L: Lh, R: { o: G.add3(mid, G.add3(G.mul3(v(0, 1, 0), 2.5), G.mul3(aR, -7.6))), a: aR, n: v(0, -1, 0), side: "R", curl: [[1.25, 1.3], [1.3, 1.3], [1.3, 1.3], [1.25, 1.3]], thumb: { out: 0.25, down: -0.35, bend: 0.2 }, arm: v(-1, 0.45, -0.25), armLen: 9 },
        path: (p) => v(0.7 * Math.cos(p * 2 * Math.PI) - 0.7, 0.7 * Math.sin(p * 2 * Math.PI), 0), rub: "round" };
    }
    // 6: the left palm cupped up, the right hand's fingertips bunched into it
    const Lh = { o: at(-4, -2.5, -6), a: v(1, 0.15, 0.05), n: v(0, 0, 1), side: "L", curl: bent(0.4, 0.3), thumb: { out: 0.75, down: 0.2 }, arm: v(-1, -0.4, -0.3), armLen: 9 };
    const target = G.add3(ISO.hand(P, Lh).palm, [0, 0, 0.9]);
    const aR = G.unit3(v(-0.3, 0, -1)), nR = G.unit3(v(-1, 0, 0.3)), Rh = { o: [0, 0, 0], a: aR, n: nR, side: "R", curl: bent(0.62, 0.55), spread: [-0.07, -0.02, 0.03, 0.08], thumb: { out: 0.3, down: 0.45, bend: 0.4 }, arm: v(-0.55, 0.3, 0.8), armLen: 9 };
    Rh.o = G.sub3(target, ISO.hand(P, Rh).tip);
    return { L: Lh, R: Rh, path: (p) => v(0.9 * Math.cos(p * 2 * Math.PI) - 0.9, 0.9 * Math.sin(p * 2 * Math.PI), 0), rub: "round" };
  }
  // audit.mjs reads the fingers, thumbs and forearms as "loose": they sit on the palms (ISO.poly, not recorded) and the
  // arms are held by the washer, who is out of the picture.
  // The pair as depth-sorted items; the right hand's items carry data-mv so the loop can move them together.
  function pairSvg(P, k) {
    const ps = pose(k, P), Lh = ISO.hand(P, ps.L), R0 = ISO.hand(P, ps.R), Rh = R0.map((x) => ({ c: x.c, get svg() { return `<g data-mv="">${x.svg}</g>`; } }));
    // lather where the hands meet: small bubbles, seeded so they stay put
    const m = G.lerp3(Lh.palm, R0.palm, 0.5), kk = K.cameraOf(P).k, foam = [];
    let seed = k * 97;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 16; i++) {
      const p = G.add3(m, [(rnd() - 0.5) * 12, (rnd() - 0.5) * 12, (rnd() - 0.5) * 7]), q = K.iso(p, P), r = (0.35 + rnd() * 0.75) * kk;
      foam.push({ c: G.add3(p, [0, 0, 6]), svg: `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r.toFixed(2)}" fill="#fbfdff" fill-opacity=".85" stroke="#7d9ab3" stroke-width=".5"/>` });
    }
    // the hands' parts are made when first read (ISO.hand), so `parts` can be built one at a time before `svg`
    let svg;
    return { parts: [...Lh, ...R0], get svg() { return (svg ??= ISO.drawItems(P, [...Lh, ...Rh, ...foam])); }, path: ps.path, rub: ps.rub };
  }

  // ── the basin, tap and soap
  const TOP = { x: -20, y: -21, w: 41, d: 42, r: 3 }, ZB = 11, RB = 15;
  const CERAMIC = ISO.tint("#fbfcfd", ["#c9d1d8", "#d6dce2", "#e2e7eb", "#edf0f3"], "#4a5560");
  const STONE = ISO.tint("#ecebe6", ["#b9b7ae", "#c6c4bb", "#d2d0c8", "#dddbd4"], "#55534c");
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  function sceneSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(TOP, -5, 5, P)}"/>`];
    out.push(ISO.tinted(STONE, S(K.slabOf(TOP, -5, 5, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(TOP, -2.5, P, 3), { tone: "faint" }) })));
    out.push(L(K.planOutline(K.insetPlan(TOP, 3), 0, P, 2), { tone: "faint" }));
    // the tap: base rosette, pillar, lever (down: off), spout over the bowl with its aerator
    const TX = 15.5, TY = -15, tap = [];
    tap.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 3.4], [0.8, 3.3, 1], [1.4, 2.6, 1], [1.6, 0]], zAx([TX, TY, 0]), P, { steps: 32 }), { tone: "mid" })));
    tap.push(ISO.tinted(ISO.T.steel, S(G.disc(1.5, 19, 1.8, zAx([TX, TY, 0]), P), { tone: "hi" })));
    tap.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 2.3], [2.2, 2.3, 1], [2.8, 1.6, 1], [3, 0]], zAx([TX, TY, 19]), P, { steps: 28 }), { tone: "hi" })));
    tap.push(ISO.capsule([TX + 0.8, TY - 0.8, 22.3], [TX + 4.4, TY - 4.4, 23.4], 0.75, 0.6, P, ISO.T.steel, "hi"));
    tap.push(ISO.capsule([TX - 0.6, TY + 0.6, 16.5], [TX - 7.6, TY + 7.6, 16.8], 1.35, 1.15, P, ISO.T.steel, "hi"));
    tap.push(ISO.tinted(ISO.T.steel, S(G.disc(15.2, 16.6, 1.25, zAx([TX - 7.3, TY + 7.3, 0]), P), { tone: "mid" })));
    // the soap pump bottle
    const SX = -13, SY = 14, soap = [];
    soap.push(ISO.tinted(ISO.T.amber, S(G.lathe([[0, 0], [0, 3.6], [0.6, 3.8, 1], [10, 3.8, 1], [11.4, 3, 1], [12, 1.6], [12, 0]], zAx([SX, SY, 0]), P, { steps: 40 }), { tone: "hi" })));
    soap.push(ISO.tinted(ISO.T.plastic, S(G.disc(12, 13.6, 1.6, zAx([SX, SY, 0]), P), { tone: "mid" }) + S(G.disc(13.6, 16, 0.6, zAx([SX, SY, 0]), P), { tone: "mid" }) + S(G.disc(16, 17.6, 1.5, zAx([SX, SY, 0]), P), { tone: "hi" })));
    soap.push(ISO.capsule([SX + 0.6, SY, 16.8], [SX + 4.4, SY, 16.6], 0.55, 0.45, P, ISO.T.plastic, "hi"));
    // the bowl: a round vessel basin on the counter, its glaze, the inside seen over the near rim
    const F = zAx([0, 0, 0]), bowl = [];
    bowl.push(ISO.tinted(CERAMIC, S(G.lathe([[0, 0], [0, 5.6], [0.7, 6.8, 1], [3, 10.8, 1], [6.4, 13.6, 1], [9.2, 14.8, 1], [ZB - 0.5, RB], [ZB, RB - 0.3], [ZB, 0]], F, P, { steps: 72 }), { tone: "hi" })));
    bowl.push(`<path d="${G.circleOf(F, ZB + 0.02, RB - 1.6, P, 72)}" fill="#e6ecf1" stroke="#7d8a96" stroke-width=".6"/>`);
    bowl.push(`<path d="${G.circleOf(F, ZB + 0.03, RB - 4.4, P, 72)}" fill="#dbe3ea" stroke="none"/>`);
    return { tap: tap.join(""), soap: soap.join(""), base: out.join(""), bowl: `<g data-name="basin">${bowl.join("")}</g>` };
  }

  ISO.add({
    name: "handwash", title: "Handwashing: six moves", compare: "handwash 480 260 260 k=1", steps: STEPS,
    about: "Two hands over a wash basin doing the six rubbing moves of handwashing (palms, backs, between the fingers, backs of the fingers, thumbs, fingertips): about 20 seconds of rubbing with soap.",
    line: "handwash cx cy size k=1|2|3|4|5|6|strip step=1..6 run=0|1 lab=0 lit=hands|tap|soap|basin",
    demo: { line: "handwash 480 262 260 k=1", script: [{ set: { step: 1 }, hold: 2.5 }, { set: { step: 2 }, hold: 2.5 }, { set: { step: 3 }, hold: 2.5 }, { set: { step: 4 }, hold: 2.5 }, { set: { step: 5 }, hold: 2.5 }, { set: { step: 6 }, hold: 2.5 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0";
      if (o.k === "strip") {
        const g = mk("g", { class: "iso-strip" }, parent), cw = size * 1.18, ch = size * 0.95, SHORT = ["", "palm to palm", "backs of hands", "between fingers", "backs of fingers", "thumbs", "fingertips"];
        for (let i = 0; i < 6; i++) {
          const x = cx + ((i % 3) - 1) * cw, y = cy + (Math.floor(i / 3) - 0.5) * ch;
          const { P, g: c } = ISO.frame([at(-15, -12, -9), at(10, 12, 13), at(-15, 12, 13), at(10, -12, -9)], x, y - 10, cw * 0.95, ch * 0.8, { azimuth: 28, elevation: 32 }, g);
          c.innerHTML = pairSvg(P, i + 1).svg;
          if (lab) c.insertAdjacentHTML("beforeend", ISO.word([cw * 0.475, ch * 0.8 + 12], `${i + 1} ${SHORT[i + 1]}`, "#2b4a6a", { size: 14 }));
        }
        g.set = () => {}; g.update = () => false;
        g.readout = () => "the six rubbing moves, about 3 seconds each: some 20 seconds of rubbing with soap in all, then rinse and dry";
        return g;
      }
      const Wd = size * 2.9, Hd = size * 2.05;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -5, 0), at(-14, 0, 18), at(0, -14, 12), at(0, 14, 12), at(8, 0, 18)], cx, cy, Wd, Hd, { azimuth: 28, elevation: 32 }, parent);
      const sc = sceneSvg(P);
      g.innerHTML = `<g>${sc.base}</g><g data-name="soap">${sc.soap}</g>${sc.bowl}<g data-name="hands"></g><g data-name="tap">${sc.tap}</g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { hands: q("hands"), tap: q("tap"), soap: q("soap"), basin: q("basin"), words: q("words") }, w = ISO.writer();
      const k0 = ISO.clamp(Math.round(ISO.num(o, "step", ISO.num(o, "k", 1))), 1, 6);
      const s = { step: k0, want: k0, phase: 0, vis: 1, run: o.run === "1", timer: 0 };
      const memo = new Map(), pairOf = (k) => { if (!memo.has(k)) memo.set(k, pairSvg(P, k)); return memo.get(k); };
      let lit = o.lit || "", movers = [];
      let ready = false;
      const draw = () => {
        if (ready) {
          const pr = pairOf(s.step);
          w.rebuild(el.hands, String(s.step), () => pr.svg);
          if (el.hands._fresh !== false || !movers.length) movers = [...el.hands.querySelectorAll("[data-mv]")];
          const tr = K.translateAlong(P, pr.path(s.phase));
          for (const m of movers) w.attr(m, "transform", tr);
          w.attr(el.hands, "opacity", s.vis.toFixed(2));
        }
        w.rebuild(el.words, lab ? String(s.step) : "", () => !lab ? "" : ISO.word(K.iso(at(-6, 0, 18), P), `${s.step} · ${NAMES[s.step]}`, "#2b4a6a", { size: 17 }) +
          ISO.word(K.iso([-13, 14, 18], P), "soap", "#8a5a10", { size: 13, dy: -6 }) + ISO.word(K.iso([TOP.x + TOP.w, 0, 0], P), "tap off while you rub", "#555", { size: 13, anchor: "start", dy: 6 }));
        const groups = { hands: el.hands, tap: el.tap, soap: el.soap, basin: el.basin };
        w.light(Object.values(groups), groups[lit] ? [groups[lit]] : []);
      };
      g.set = (p) => {
        if (p.step !== undefined) s.want = ISO.clamp(Math.round(+p.step), 1, 6);
        if (p.k !== undefined && p.k !== "strip") s.want = ISO.clamp(Math.round(+p.k), 1, 6);
        if (p.run !== undefined) { s.run = !!+p.run; s.timer = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      // About 3.3 s a move, 6 moves: some 20 s of rubbing. A move takes 0.8 s back and forth.
      g.update = (dt) => {
        const calm = ISO.still();
        if (s.run) { s.timer += dt; if (s.timer > 3.3) { s.timer = 0; s.want = (s.want % 6) + 1; } }
        if (s.want !== s.step) { s.vis = calm ? 0 : Math.max(0, s.vis - dt / 0.18); if (s.vis <= 0) { s.step = s.want; movers = []; } }
        else s.vis = calm ? 1 : Math.min(1, s.vis + dt / 0.18);
        if (!calm) s.phase = (s.phase + dt / 0.8) % 1;
        draw();
        return !calm;
      };
      g.readout = () => `move ${s.step} of 6 · ${NAMES[s.step]} (${pairOf(s.step).rub}) · about 3 seconds a move, some 20 seconds of rubbing in all · tap off, then rinse and dry`;
      draw();
      if (t) label(parent, cx, cy - Hd / 2 - 8, t, TXT.blue, 22, "middle");
      // the hands are built as parts of their own (see ISO.later): this move's pair first, then the other five, so a
      // change of move never builds a pair while the board is playing
      const order = [k0, ...[1, 2, 3, 4, 5, 6].filter((k) => k !== k0)];
      for (const k of order) {
        for (const x of pairOf(k).parts) ISO.later(() => x.svg);
        ISO.later(k === k0 ? () => { ready = true; draw(); } : () => pairOf(k).svg);
      }
      return g;
    },
  });
})();
