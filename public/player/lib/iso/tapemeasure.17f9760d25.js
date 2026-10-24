// "tapemeasure cx cy width out=0-100 lock=0|1 lab=1 lit=case|tape|hook|lock|plank" — a tape measure on a plank.
// A 25 mm (1 in) wide steel tape, yellow with black inch marks (quarters, halves and whole inches, numbered), coiled
// in a case with a rubber band round it, a lock button on top and a riveted hook at the tip. The case sits at the
// plank's left end; pulled out, the tape runs along the plank and its hook catches the far end: 11¾ in = 29.8 cm.
// The lock holds it; released, the spring winds it back. set({ out: cm, lock }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const IN = 2.54, PLANK = { x: -11, y: -5, w: 42, d: 10, r: 0.4 }, PT = 2.4, TOP = 4 + PT, MAXL = 34, TW = 2.54, LEN = 11.75 * IN;
  const CASE = [[-7.6, 0], [-0.4, 0], [0, 0.4], [0, 6.2], [-1.4, 7.6], [-6.2, 7.6], [-7.6, 6.2]];
  const YELLOW = "#f5d33b", WOOD = ISO.T.wood, PLASTIC = ISO.T.plastic, STEEL = ISO.T.steel;
  const BASE = { x: -15, y: -9, w: 54, d: 18, r: 3 };
  let uid = 0;

  function caseSvg(P, lock) {
    const at = (x, z) => [x - 0.2, z + TOP];
    const out = [ISO.wbox(P, [-6.4, -2], [-2.8, -2.2], [TOP + 1.5, TOP + 8.2], "mid"), ISO.tinted(PLASTIC, ISO.prismY(P, CASE.map(([x, z]) => at(-3.8 + (x + 3.8) * 1.05, 3.8 + (z - 3.8) * 1.05)), -1.2, 1.2, ["#1f2226", "#4a4f56"], "#33373c", "#0d0e10")), ISO.prismY(P, CASE.map(([x, z]) => at(x, z)), -2.2, 2.2, ["#8a8f96", "#d5d9de"], "#c8cdd3", "#2b2f35")];
    // the rubber band round the case, the badge, its screws, and the belt clip's edge peeking over the top
    out.push(`<path d="${K.pathOf(G.arcPoints(G.frameOf([-4, 2.22, TOP + 3.8], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 2.5, 0, Math.PI * 2, 40).map((p) => K.iso(p, P)), true)}" fill="${YELLOW}" stroke="#2b2f35" stroke-width="0.6"/>`);
    out.push(D([[-6.9, 0.7], [-6.9, 6.9], [-0.9, 0.7]].map(([x, z]) => K.iso([x, 2.22, TOP + z], P)), { size: 0.6, tone: "hi" }));
    // the lock: a slider in a slot on the front of the top, down = locked
    out.push(`<g data-name="lock">${ISO.tinted(ISO.T.red, ISO.wbox(P, [-1.6 - 0.9 * lock, -0.4 - 0.9 * lock], [-0.7, 0.7], [TOP + 6.6 - lock * 0.7, TOP + 7.9 - lock * 0.7], "hi"))}</g>`);
    return out.join("");
  }
  // The tape at full length, from the mouth (x = 0) to MAXL; moved by the pull and clipped at the mouth.
  function tapeSvg(P) {
    const z = TOP + 0.05, z1 = z + 0.12, y0 = -TW / 2, y1 = TW / 2;
    const out = [`<path d="${K.pathOf([[0, y0], [MAXL, y0], [MAXL, y1], [0, y1]].map(([x, y]) => K.iso([x, y, z1], P)), true)}" fill="${YELLOW}" stroke="#6b5a10" stroke-width="0.5"/>`];
    out.push(`<path d="${K.pathOf([[0, y1, z], [MAXL, y1, z], [MAXL, y1, z1], [0, y1, z1]].map((p) => K.iso(p, P)), true)}" fill="#c9a720" stroke="#6b5a10" stroke-width="0.4"/>`);
    // inch marks from the hook end (x = MAXL is 0 in): quarters short, halves longer, inches across with numbers
    const ticks = { q: [], h: [], i: [] }, nums = [];
    for (let k = 0; MAXL - k * IN / 4 > 0.2; k++) {
      const x = MAXL - (k * IN) / 4, kind = k % 4 === 0 ? "i" : k % 2 === 0 ? "h" : "q", len = { q: 0.45, h: 0.75, i: 1.3 }[kind];
      ticks[kind].push(K.pathOf([K.iso([x, y1, z1], P), K.iso([x, y1 - len, z1], P)]));
      if (kind === "i" && k > 0) nums.push(`<g transform="${K.topMatrix([x - 0.15, y0 + 0.35], z1, P, "x")}"><text font-size="0.75" font-weight="700" fill="#222" text-anchor="end" font-family="Helvetica Neue,Arial">${k / 4}</text></g>`);
    }
    out.push(`<path d="${ticks.q.join("")}" stroke="#222" stroke-width="0.35"/><path d="${ticks.h.join("")}" stroke="#222" stroke-width="0.45"/><path d="${ticks.i.join("")}" stroke="#111" stroke-width="0.6"/>`, nums.join(""));
    // the hook: a steel tab riveted on, bent down over the end
    out.push(`<g data-name="hook">${ISO.tinted(STEEL, ISO.wbox(P, [MAXL - 1.4, MAXL], [y0 - 0.1, y1 + 0.1], [z1, z1 + 0.08], "hi") + ISO.wbox(P, [MAXL, MAXL + 0.12], [y0 - 0.1, y1 + 0.1], [TOP - 1.4, z1 + 0.08], "hi"))}` +
      D([K.iso([MAXL - 0.8, -0.6, z1 + 0.09], P), K.iso([MAXL - 0.8, 0.6, z1 + 0.09], P)], { size: 0.45, tone: "hi" }) + "</g>");
    return out.join("");
  }

  ISO.add({
    name: "tapemeasure", title: "Tape measure", compare: "tapemeasure 500 270 420",
    about: "A tape measure on a plank: the yellow tape pulls out of its case, its hook catches the far end and the marks read 11¾ in; the lock holds it and the spring winds it back.",
    line: "tapemeasure cx cy width out=0-100 lock=0|1 lab=1 lit=case|tape|hook|lock|plank",
    demo: { line: "tapemeasure 500 270 420 out=0", script: [{ set: {}, hold: 0.8 }, { set: { out: LEN }, hold: "settle" }, { set: { lock: 1 }, hold: 1.6 }, { set: { lock: 0, out: 0 }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.9, H = size * 1.1, id = `tm${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 1, 4), [-8, 2, TOP + 9], [MAXL, 0, TOP + 4]], cx, cy, W, H, { azimuth: 70, elevation: 28 }, parent);
      const clip = K.pathOf(ISO.hullOf(K.boxCorners({ x: -0.25, y: -TW / 2 - 0.2, w: MAXL + 1, d: TW + 0.4, r: 0 }, TOP - 1.6, TOP + 0.4).map((p) => K.iso(p, P))), true);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(BASE, 1, 3, P)}"/>` + S(K.slabOf(BASE, 1, 3, P, 3, 0.6), { tone: "lo" }) +
        `<g data-name="plank">${ISO.tinted(WOOD, S(K.slabOf(PLANK, 4, PT, P, 2, 0.4), { tone: "mid" }) + L([-2.5, 2.5].map((y) => K.lineOnTop([PLANK.x, y * 1.4], [PLANK.x + PLANK.w, y * 1.4 + 0.6], TOP, P)).join(""), { tone: "faint" }))}</g>` +
        `<g data-name="case"></g><clipPath id="${id}"><path data-hold d="${clip}"/></clipPath><g data-name="tape" clip-path="url(#${id})">${tapeSvg(P)}</g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { plank: q("plank"), case: q("case"), tape: q("tape"), words: q("words") }, w = ISO.writer();
      // the plank's far end sits where the hook lands at 24⅜ in
      el.plank.setAttribute("transform", K.translateAlong(P, [LEN - (PLANK.x + PLANK.w), 0, 0]));
      const s = { out: ISO.clamp(ISO.num(o, "out", LEN), 0, MAXL), lock: o.lock === "1" ? 1 : 0 }, goal = { out: s.out, lock: s.lock };
      let lit = o.lit || "";
      const draw = () => {
        const a = K.iso([0, 0, 0], P), b = K.iso([s.out - MAXL, 0, 0], P), d = [b[0] - a[0], b[1] - a[1]];
        w.attr(el.tape, "transform", `translate(${d[0].toFixed(2)} ${d[1].toFixed(2)})`); K.holdStill(el.tape, d);
        w.rebuild(el.case, s.lock.toFixed(2), () => caseSvg(P, s.lock));
        w.rebuild(el.words, lab ? `${Math.round(s.out)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-4, 2.2, TOP + 9], P), "case", "#444", { size: 15, dy: -10 }),
          s.out > 8 ? ISO.word(K.iso([s.out / 2, TW / 2, TOP], P), "tape", "#444", { size: 15, dy: 22 }) : "",
          s.out > 3 ? ISO.word(K.iso([s.out + 0.4, 0, TOP - 1.2], P), s.out > LEN - 0.3 ? "hook on the end: 11¾ in" : "hook", "#444", { anchor: "end", size: 15, dy: 24 }) : "",
        ].join(""));
        const moving = Math.abs(s.out - goal.out) > 0.01, want = lit || (s.lock !== goal.lock || s.lock > 0.5 ? "lock" : moving ? "tape" : s.out > LEN - 0.3 ? "hook" : "");
        const parts = [el.plank, el.case, el.tape];
        w.light(parts, want === "lock" ? [el.case] : want === "hook" || want === "tape" ? [el.tape] : want ? [q(want)].filter(Boolean) : []);
      };
      g.set = (p) => {
        if (p.lock !== undefined) goal.lock = +p.lock ? 1 : 0;
        if (p.out !== undefined) goal.out = ISO.clamp(+p.out, 0, MAXL);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.lock = ISO.follow(s.lock, goal.lock, dt, 0.08, calm); if (Math.abs(s.lock - goal.lock) < 0.01) s.lock = goal.lock;
        // a hand pulls it out at about 40 cm/s; the spring winds it back at 80 cm/s (the lock stops both)
        if (s.lock < 0.5) { const v = goal.out > s.out ? 40 : 80, st = v * dt; s.out = calm || Math.abs(goal.out - s.out) <= st ? goal.out : s.out + Math.sign(goal.out - s.out) * st; }
        draw();
        return s.out !== goal.out || s.lock !== goal.lock;
      };
      g.readout = () => {
        const inch = s.out / IN, eighths = Math.round(inch * 8), whole = Math.floor(eighths / 8), frac = eighths % 8;
        const f = frac ? ` ${["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"][frac]}` : "";
        return `${whole}${f} in = ${s.out.toFixed(1)} cm out${s.lock > 0.5 ? " · lock on: the tape stays put" : s.out < 0.1 ? " · wound in" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
