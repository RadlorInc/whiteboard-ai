// "leverplank cx cy k kg=0..5 kgat=6..30 n=0..8 e=13..60 rider=0|1 cheek=0|1 lab=0 lit=plank|vial|load|rider|pin" — a
// PART (PARTS.md, batch 5): the lab lever's wooden plank 95 × 5 × 1.5 cm with steel end caps, a 5 cm scale from the
// pivot (numbers every 10) and peg holes, the spirit-level vial set in 7 cm right of the pivot, hung on its pin. Its
// origin is the pin's axis: place it at= a fulcrum's `pin`. What tilts together is one part (anchors don't follow), so
// it carries the cast load (kg at `at` cm left of the pin, kg=0 none) and the red rider with n 250 g masses (`e` cm
// right; the rider itself is 250 g; rider=0 none). The plank turns toward the side that turns harder (mass × distance)
// until an end lands on a rubber stop (at the fulcrum's lstop / rstop); equal turning settles level, the pin sitting
// just over the plank's centre of mass (the empty plank is trimmed to balance). cheek=1 redraws the fulcrum's near
// cheek and the pin's end in front of the plank. set({ kg, at, n, e }) changes the load or slides them. Taken from
// lever.js (scaled 1:4, the vial's bubble now runs to the high end). World units: 1 = 1 cm.
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s);
  const PHYS = { right: 1.5, inertia: 1, drag: 2.2, bounce: 0.3 };   // kg·cm per rad of righting, kg·cm²-ish, 1/s
  const VIAL = 7;

  function plankSvg(P, tilt, m) {
    const B19 = window.B19, Lv = B19.LEVER, c = Math.cos(tilt), s = Math.sin(tilt), TOP = Lv.thick - Lv.under, BOT = -Lv.under, H = Lv.half;
    const at = (u, w, y) => [u * c - w * s, y, u * s + w * c], iso = (u, w, y) => K.iso(at(u, w, y), P);
    const shift = (u0, w0) => (u, w, y) => at(u0 + u, w0 + w, y);
    const rider = m.rider ? B19.rider(shift(m.e, TOP), P, m.n) : null, out = [];
    if (rider) out.push(`<g data-name="rider">${rider.back}</g>`);
    const wood = [ISO.box(at, P, [Lv.from + 0.7, Lv.to - 0.7], [BOT, TOP], [-H, H], "mid")];
    // the scale: a tick every 5 cm from the pivot hanging from the near top edge, longer every 10, the zero longest
    const minor = [], major = [], nums = [];
    for (let u = -30; u <= 60; u += 5) if (u) {
      (u % 10 ? minor : major).push(K.pathOf([iso(u, TOP, H), iso(u, TOP, H - (u % 10 ? 0.6 : 1))]));
      if (!(u % 10)) nums.push(LAB.faceText(P, at(u, TOP + 0.005, H - 1.55), [c, 0, s], String(Math.abs(u)), 0.75, "#7a5a2e", [0, -1, 0]));
    }
    wood.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }), L(K.pathOf([iso(0, TOP, H), iso(0, TOP, H - 1.4)]), { tone: "hi", free: "end" }), nums.join(""));
    const holes = []; for (let u = -30; u <= 60; u += 5) if (Math.abs(u - VIAL) > 4 && u) holes.push(iso(u, TOP, -0.6));
    wood.push(K.dotsSvg(holes, { size: 0.55, tone: "lo" }));
    // two grain lines along the near face, cap to cap
    wood.push(`<path d="${[0.25, 0.65].map((f) => K.pathOf([iso(Lv.from + 0.7, BOT + Lv.thick * f, H + 0.005), iso(Lv.to - 0.7, BOT + Lv.thick * f, H + 0.005)])).join("")}" stroke="#7a5a2e" stroke-opacity=".3" stroke-width="0.5"/>`);
    out.push(`<g data-name="plank">${ISO.tinted(ISO.T.wood, wood.join(""))}${ISO.tinted(ISO.T.steel, ISO.box(at, P, [Lv.from, Lv.from + 0.8], [BOT - 0.15, TOP + 0.15], [-H - 0.15, H + 0.15], "mid") + ISO.box(at, P, [Lv.to - 0.8, Lv.to], [BOT - 0.15, TOP + 0.15], [-H - 0.15, H + 0.15], "mid"))}</g>`);
    if (m.kg > 0) out.push(`<g data-name="load">${B19.castweight(shift(-m.at, TOP), P, m.kg)}</g>`);
    out.push(`<g data-name="vial">${B19.vial(shift(VIAL, TOP), P, B19.bubbleOf(tilt))}</g>`);
    if (rider) out.push(`<g data-name="rider">${rider.front}</g>`);
    return { svg: out.join(""), load: at(-m.at, TOP + 8, 0), effort: at(m.e, TOP + (rider ? rider.top + 0.7 : 0), 0) };
  }

  ISO.add({
    name: "leverplank", title: "Lever plank (part)", compare: null,
    about: "The lab lever's 95 cm wooden plank on its pivot pin, with a cm scale, a spirit-level vial, a cast load on the left and a red rider with slotted masses on the right; it tilts toward the side that turns harder until it lands on a stop. anchors: load effort",
    line: "leverplank cx cy k kg=0..5 kgat=6..30 n=0..8 e=13..60 rider=0|1 cheek=0|1 lab=0 lit=plank|vial|load|rider|pin",
    demo: { line: "leverplank 470 300 8 kg=2 kgat=20 n=3 e=40 cheek=0 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { e: 55 }, hold: "settle" }, { set: { e: 40, lit: "vial" }, hold: "settle" }, { set: { e: 25, lit: "rider" }, hold: "settle" }, { set: { kg: 1, kgat: 30, lit: "load" }, hold: "settle" }, { set: { n: 1, e: 30, lit: "plank" }, hold: "settle" }, { set: { lit: "pin" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B19 = window.B19, Lv = B19.LEVER, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const STOPS = { left: B19.stopAngle(Lv.stops[0]), right: B19.stopAngle(Lv.stops[1]) };
      const m = { kg: ISO.clamp(ISO.num(o, "kg", 2), 0, 5), at: ISO.clamp(ISO.num(o, "kgat", 20), 6, 30), n: Math.round(ISO.clamp(ISO.num(o, "n", 3), 0, 8)), rider: o.rider !== "0" };
      const s = { e: ISO.clamp(ISO.num(o, "e", 40), 13, 60), a: m.at, rate: 0 }, want = { e: s.e, at: m.at };
      // turning (kg·cm): + turns the load (left) end down, which is tilt + (the right end up)
      const turnOf = () => m.kg * s.a - (m.rider ? 0.25 * (m.n + 1) : 0) * s.e;
      const restOf = () => ISO.clamp(Math.atan(turnOf() / PHYS.right), STOPS.right, STOPS.left);
      s.tilt = restOf();
      let lit = o.lit || "";
      const cheek = o.cheek !== "0";
      g.innerHTML = `<g data-part="plank"></g><g data-name="pin">${cheek ? B19.cheek(P, 2.6, 3.1, -Lv.pinZ) : ""}${B19.pinEnd(P, 0)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const key = `${s.tilt.toFixed(4)} ${s.e.toFixed(2)} ${s.a.toFixed(2)} ${m.kg} ${m.n} ${m.rider}`;
        w.rebuild(el.plank, key, () => { const r = plankSvg(P, s.tilt, { ...m, at: s.a, e: s.e }); el.plank._a = { load: r.load, effort: r.effort }; return r.svg; });
        g.anchors = el.plank._a;
        if (lab) w.rebuild(el.words, key, () => (m.kg > 0 ? ISO.word(K.iso(g.anchors.load, P), `load ${m.kg} kg`, "#2b6cc4", { size: 14, dy: -10 }) : "") +
          (m.rider ? ISO.word(K.iso(g.anchors.effort, P), `effort ${(0.25 * (m.n + 1)).toFixed(2)} kg`, "#c0392b", { size: 14, dy: -10 }) : ""));
        B19.light(w, g, lit);
      };
      g.set = (p) => {
        const n = (k2) => p[k2] !== undefined && Number.isFinite(+p[k2]);
        if (n("e")) want.e = ISO.clamp(+p.e, 13, 60);
        if (n("kgat")) want.at = ISO.clamp(+p.kgat, 6, 30);
        if (n("kg")) m.kg = ISO.clamp(+p.kg, 0, 5);
        if (n("n")) m.n = Math.round(ISO.clamp(+p.n, 0, 8));
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1;
        s.e = ISO.follow(s.e, want.e, dt, 0.45, calm); s.a = ISO.follow(s.a, want.at, dt, 0.45, calm);
        let moving = s.e !== want.e || s.a !== want.at;
        if (calm) { s.tilt = restOf(); s.rate = 0; }
        else for (let i = 0; i < 8; i++) {
          const h = dt / 8;
          s.rate += ((turnOf() * Math.cos(s.tilt) - PHYS.right * Math.sin(s.tilt)) / PHYS.inertia - PHYS.drag * s.rate) * h;
          s.tilt += s.rate * h;
          if (s.tilt > STOPS.left) { s.tilt = STOPS.left; s.rate = -s.rate * PHYS.bounce; }
          if (s.tilt < STOPS.right) { s.tilt = STOPS.right; s.rate = -s.rate * PHYS.bounce; }
        }
        const rest = restOf();
        if (Math.abs(s.rate) < 5e-4 && Math.abs(s.tilt - rest) < 5e-4) { s.rate = 0; s.tilt = rest; } else moving = true;
        draw();
        return moving;
      };
      g.readout = () => {
        const ef = m.rider ? 0.25 * (m.n + 1) : 0, l = m.kg * s.a, r = ef * s.e;
        return `load ${m.kg} kg × ${s.a.toFixed(0)} cm = ${l.toFixed(0)} · effort ${ef} kg × ${s.e.toFixed(0)} cm = ${r.toFixed(0)} kg·cm · ${s.tilt > 1e-3 ? "load side down" : s.tilt < -1e-3 ? "load lifted" : "level"}`;
      };
      draw();
      return g;
    },
  });
})();
