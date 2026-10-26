// "pencilcase cx cy width open=0..1 take=0|1 lab=1 lit=case|zip|pencils|ruler" — a zipped fabric pencil case on a desk.
// A 21 × 7.6 × 6.4 cm blue pouch with bound seams at both ends, a pull loop, a name label, and a zip along the top
// with its slider, pull tab and end stops. Inside: four hexagonal pencils (7 mm across, sharpened), a 15 cm wooden
// ruler with its millimetre ticks, an eraser and a sharpener. set({ open }) runs the slider along the zip and the
// top parts as far as it has gone; set({ take: 1 }) slides the yellow pencil out of the opening. 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 105, HY = 38, HZ = 64, ZX0 = -92, ZX1 = 92, GAP = 16;               // zip from ZX0 to ZX1; opening up to ±GAP
  const DESK = { x: -170, y: -110, w: 340, d: 220, r: 8 };
  const BLUE = ["#2b6cc4", "#8fc1ef"], BLUEF = "#7fb7ea", INK = "#1d4a80";
  const FX = G.frameOf([0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]);          // outline in (y, z), extruded along x
  const SECTION = DAILY.rrect(-HY, 0, HY, HZ, 26, 6);
  const lensAt = (f) => { const xs = ZX0 + (ZX1 - ZX0) * f, n = 24, top = [], bot = []; for (let i = 0; i <= n; i++) { const x = ZX0 + ((xs - ZX0) * i) / n, w = GAP * Math.sin((Math.PI * i) / n) ** 0.7 * Math.min(1, f * 3); top.push([x, -w]); bot.push([x, w]); } return { xs, pts: [...top, ...bot.reverse()] }; };
  const pencilSvg = (...a) => DAILY.pencil(...a);
  const YELLOW = [["#c9961a", "#ffe066"], "#ffd84a", "#7a5a08"], RED = [["#a8301f", "#f07a62"], "#e04b3a", "#6e140a"], GREEN = [["#3f7f25", "#9fd77c"], "#5fae3a", "#24561c"], BLUEP = [["#1f4f8f", "#7fb0ea"], "#4a85d6", "#173a66"];
  const YP0 = [-92, 5, 55], YD = [1, 0, 0], YL = 175, TIP = G.add3(YP0, G.mul3(YD, YL)), LIFT = (32 * Math.PI) / 180, PULL = 16;
  const pose = (f) => {
    const a = LIFT * ISO.ease(ISO.smooth(0, 0.5, f)), d = [Math.cos(a), 0, -Math.sin(a)], out = PULL * ISO.ease(ISO.smooth(0.45, 1, f));
    return [G.sub3(G.sub3(TIP, G.mul3(d, YL)), G.mul3(d, out)), d];
  };

  // The desk, then the pouch: body, end bindings, label, pull loop.
  function caseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 26 }, 0, 10, P)}"/>`];
    out.push(DAILY.prism(P, FX, SECTION, -HX, HX, BLUE, BLUEF, INK));
    for (const x0 of [-HX - 1.5, HX - 1.5]) out.push(DAILY.prism(P, FX, DAILY.rrect(-HY - 1.2, -0.0, HY + 1.2, HZ + 1.2, 27, 6), x0, x0 + 3, ["#173a66", "#4a7fbd"], "#3a6fae", "#0f2a4a"));
    // the pull loop at the right end: a webbing band out of the end binding
    const F = G.frameOf([HX + 1.5, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(DAILY.prism(P, F, DAILY.band(DAILY.bez([0, 22], [18, 20], [18, 44], [0, 42], 12), 4), -6, 6, ["#173a66", "#4a7fbd"], "#3a6fae", "#0f2a4a"));
    return out.join("");
  }
  // (audit: the ruler, eraser, sharpener and zip parts sit on or in the pouch, a DAILY.prism the audit does not record.)
  function labelSvg(P) {
    const pts = DAILY.rrect(-40, 14, 30, 36, 3, 2).map(([x, z]) => K.iso([x, HY + 0.2, z], P));
    const lines = [20, 27].map((z, i) => K.pathOf([K.iso([-34, HY + 0.3, z], P), K.iso([i ? 4 : 22, HY + 0.3, z], P)])).join("");
    return `<path d="${K.pathOf(pts, true)}" fill="#fdfdfb" stroke="${INK}" stroke-width=".7"/>` + L(lines, { tone: "lo", free: true });
  }
  // What lies inside: pencils, the ruler with its ticks, an eraser and a sharpener (far to near).
  function insideSvg(P) {
    const out = [];
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-80, 74], [-24, 0], [44, 47], "mid")));
    const t = K.topTicks(-75, 70, 1, 5, 0, 47, [-2, -4], P);
    out.push(L(t.minor, { tone: "faint" }), L(t.major, { tone: "lo" }));
    out.push(pencilSvg(P, [-70, -12, 52], YD, RED));
    out.push(pencilSvg(P, [-64, -4, 54], YD, GREEN, 160));
    out.push(ISO.tinted(ISO.tint("#fbfbf6", ["#c9ccd1", "#d5d8dc", "#e0e2e5", "#eaecee"], "#5b6670"), ISO.wbox(P, [60, 82], [4, 18], [42, 54], "mid")));
    out.push(ISO.tinted(ISO.T.red, ISO.wbox(P, [-92, -76], [6, 18], [42, 52], "mid")));
    out.push(pencilSvg(P, [-58, 13, 50], YD, BLUEP, 150));
    return out.join("");
  }
  // The zip: the open part as a lens (the lining showing through), the shut part as a tape, the slider at xs.
  function zipSvg(P, f) {
    const { xs, pts } = lensAt(f), k = K.cameraOf(P).k, out = [];
    const shut = K.pathOf([[xs, 0], [ZX1, 0]].map(([x, y]) => K.iso([x, y, HZ + 0.3], P)));
    out.push(`<path d="${shut}" fill="none" stroke="#1f2226" stroke-width="${(5 * k).toFixed(2)}"/><path d="${shut}" fill="none" stroke="#8a8f96" stroke-width="${(1.8 * k).toFixed(2)}" stroke-dasharray="${(1.2 * k).toFixed(2)} ${(1.2 * k).toFixed(2)}"/>`);
    if (f > 0.005) out.push(`<path d="${K.pathOf(pts.map(([x, y]) => K.iso([x, y, HZ + 0.3], P)), true)}" fill="none" stroke="#1f2226" stroke-width="${(3 * k).toFixed(2)}" stroke-linejoin="round"/>`);
    for (const x of [ZX0 - 5, ZX1 + 5]) out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 3, x + 3], [-3, 3], [HZ, HZ + 3], "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [xs - 2, xs + 12], [-4.5, 4.5], [HZ, HZ + 5], "hi")));
    // the pull tab lying on the top, hinged on the slider
    out.push(ISO.tinted(ISO.T.plastic, ISO.poly([[xs + 10, -3, HZ + 5], [xs + 30, -3, HZ + 1.6], [xs + 30, 3, HZ + 1.6], [xs + 10, 3, HZ + 5], [xs + 10, -3, HZ + 7.2], [xs + 30, -3, HZ + 3.8], [xs + 30, 3, HZ + 3.8], [xs + 10, 3, HZ + 7.2]], ISO.BOX_F, P, "mid")));
    return out.join("");
  }

  let clipN = 0;
  ISO.add({
    name: "pencilcase", title: "Pencil case", compare: "pencilcase 480 300 360",
    about: "A zipped pencil case: the slider runs along the zip, the top parts to show the pencils, ruler, eraser and sharpener inside, and the yellow pencil slides out.",
    line: "pencilcase cx cy width open=0..1 take=0|1 lab=1 lit=case|zip|pencils|ruler",
    demo: { line: "pencilcase 480 290 360", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { take: 1 }, hold: "settle" }, { set: { take: 0, open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, Hh = size * 1.05, id = `pc-${++clipN}`;
      const [out] = pose(1);
      const { P, g } = ISO.frame([...K.boxCorners(DESK, -10, 0), [0, 0, HZ + 10], out], cx, cy, W, Hh, { azimuth: 64, elevation: 36 }, parent);
      g.innerHTML = DAILY.table(P, DESK) + `<g data-name="case">${caseSvg(P)}${labelSvg(P)}</g>` +
        `<clipPath id="${id}-in"><path/></clipPath><clipPath id="${id}-up"><path/></clipPath>` +
        `<g data-k="inside" clip-path="url(#${id}-in)"><path data-k="lining" fill="#26364d" stroke="none"/><g data-name="pencils">${insideSvg(P)}</g></g>` +
        `<g data-name="zip"></g><g data-k="yellow" clip-path="url(#${id}-up)"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["case", "inside", "lining", "pencils", "zip", "yellow", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const [clipIn, clipUp] = g.querySelectorAll("clipPath path"), memo = DAILY.memo();
      const op = ISO.num(o, "open", 0) > 0.5, tk = ISO.num(o, "take", 0) > 0.5 && op;
      const s = { open: op ? 1 : 0, take: tk ? 1 : 0 }, goal = { open: op ? 1 : 0, take: tk ? 1 : 0 };
      let lit = o.lit || "";
      const draw = () => {
        const fk = (Math.round(s.open * 100) / 100).toFixed(2), tk2 = (Math.round(s.take * 100) / 100).toFixed(2);
        w.rebuild(el.zip, fk, () => zipSvg(P, +fk));
        if (el.inside._f !== fk) {
          el.inside._f = fk;
          const { pts } = lensAt(+fk), ring = pts.map(([x, y]) => K.iso([x, y, HZ + 0.3], P)), d = +fk > 0.005 ? K.pathOf(ring, true) : "";
          clipIn.setAttribute("d", d); el.lining.setAttribute("d", d);
          // what the pulled pencil may cover: everything above the opening's near edge
          let lo = 0, hi = 0; ring.forEach((p, i) => { if (p[0] < ring[lo][0]) lo = i; if (p[0] > ring[hi][0]) hi = i; });
          const n = ring.length, dir = ring[(lo + 1) % n][1] > ring[(lo + n - 1) % n][1] ? 1 : -1, chain = [];
          for (let i = lo; ; i = (i + dir + n) % n) { chain.push(ring[i]); if (i === hi) break; }
          clipUp.setAttribute("d", d ? K.pathOf([[ring[lo][0] - 3000, ring[lo][1]], ...chain, [ring[hi][0] + 3000, ring[hi][1]], [ring[hi][0] + 3000, -3000], [ring[lo][0] - 3000, -3000]], true) : "");
        }
        w.rebuild(el.yellow, +fk > 0.6 ? tk2 : "", () => (+fk > 0.6 ? memo(tk2, () => {
          // first the back end lifts (the pencil turns about its point, still inside), then it slides out
          const [p0, dir] = pose(+tk2);
          return pencilSvg(P, p0, dir, YELLOW);
        }) : ""));
        w.rebuild(el.words, lab ? `${+fk > 0.5} ${s.take > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([ZX1, 0, HZ + 4], P), "zip", "#444", { anchor: "start", size: 14, dy: -6 }),
          ISO.word(K.iso([0, HY, 0], P), "pencil case", INK, { size: 14, dy: 18 }),
          +fk > 0.5 ? ISO.word(K.iso([-HX, -10, HZ], P), "pencils and ruler inside", "#7a5a2e", { anchor: "end", size: 14, dy: -6 }) : "",
          s.take > 0.5 ? ISO.word(K.iso(pose(1)[0], P), "pencil", "#7a5a08", { anchor: "end", size: 14, dy: -8 }) : "",
        ].join(""));
        const want = lit || (s.open > 0.02 && s.open < 0.98 ? "zip" : s.take > 0.02 ? "pencils" : "");
        const groups = { case: [el.case], zip: [el.zip], pencils: [el.pencils, el.yellow], ruler: [el.pencils] };
        w.light([el.case, el.zip, el.pencils, el.yellow], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => {
        if (p.open !== undefined) goal.open = +p.open > 0.5 ? 1 : 0;
        if (p.take !== undefined) goal.take = +p.take > 0.5 ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        const take = goal.take && goal.open;
        // the pencil comes out only through an open zip, and goes back in before the zip shuts
        if (take) { s.open = step(s.open, 1, 0.7); if (s.open >= 1) s.take = step(s.take, 1, 0.8); }
        else { s.take = step(s.take, 0, 1); if (s.take <= 0) s.open = step(s.open, goal.open, 0.7); }
        draw();
        return s.open !== goal.open || s.take !== (take ? 1 : 0);
      };
      g.readout = () => {
        if (s.take > 0) return `pulling the yellow pencil out · 17.5 cm long, 7 mm across its six flat sides, sharpened to a graphite point`;
        if (s.open <= 0) return "21 × 7.6 × 6.4 cm pencil case · zipped shut";
        return `zip ${Math.round(s.open * 100)}% open${s.open >= 1 ? " · inside: four pencils, a 15 cm ruler (ticks every 1 mm, long every 5), an eraser and a sharpener" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
