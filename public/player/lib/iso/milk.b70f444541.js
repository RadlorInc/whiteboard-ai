// "milk cx cy height pour=0..1 lab=1 lit=carton|cap|glass|milk |text" — a 1 L milk carton that pours a glass.
// A gable-top carton (7 × 7 cm, 24 cm to the top of its sealed fin) with its screw cap on the roof slope, a printed
// band reading MILK (or the text given), on a wooden tray beside a tumbler on a cork coaster and a plate of biscuits.
// set({ pour: 1 }): the cap unscrews and is set down, the carton lifts and tips 75° over the glass, a stream of milk
// fills the glass to 250 mL, and the carton is stood back up with 750 mL left. pour: 0 resets it. World units: 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const TRAY = { x: -128, y: -66, w: 256, d: 178, r: 8 };
  const A = 35, BODY = 195, RIDGE = 230, FIN = 242, PIV = [0, 0, 115];      // half width, eave, ridge, fin top, pivot
  const C0 = [-70, 0, 115], C1 = [-47.4, 10, 161.7], TILT = (75 * Math.PI) / 180; // carton centre upright and pouring
  const GL = [75, 10, 4], GH = 105, GB = 8, R0 = 28, R1 = 33;               // the glass: on a 4 mm coaster
  const SLOPE = [17.5, 0, 212.5], NRM = [Math.SQRT1_2, 0, Math.SQRT1_2];   // the cap's seat on the +x roof slope
  const PAPER = ISO.tint("#fbfbf8", ["#cfd3d6", "#dadde0", "#e5e7e9", "#eff0f1"], "#4a5560"), CAP = ISO.tint("#9cc3ee", ["#2f6cb0", "#3f7cc0", "#548ecd", "#6aa0d8"], "#173f70");
  const rIn = (h) => R0 + ((R1 - R0) * h) / (GH - GB);
  const volOf = (h) => (Math.PI / 3) * h * (R0 * R0 + R0 * rIn(h) + rIn(h) ** 2) / 1000;         // mL to level h
  const levelOf = (ml) => { let a = 0, b = GH - GB; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; (volOf(m) < ml ? (a = m) : (b = m)); } return (a + b) / 2; };

  // the carton's pose: tip t (0..1) turns it about y and carries its centre from C0 to C1
  const placeOf = (t) => {
    const th = TILT * t, c = Math.cos(th), s = Math.sin(th), ctr = C0.map((v, i) => v + (C1[i] - v) * t);
    return (p) => { const x = p[0] - PIV[0], z = p[2] - PIV[2]; return [ctr[0] + x * c + z * s, ctr[1] + p[1], ctr[2] - x * s + z * c]; };
  };
  const BOXV = (x0, x1, y0, y1, z0, z1) => [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
  // a round part as a many-sided prism (cheap to rebuild every frame): centre of its base, axis, radius, height
  const cylV = (o, a, r, h, n = 20) => {
    const u = G.unit3(G.cross3(a, Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), v = G.cross3(a, u), V = [], F = [[], []];
    for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, d = G.add3(G.mul3(u, Math.cos(t) * r), G.mul3(v, Math.sin(t) * r)); V.push(G.add3(o, d), G.add3(G.add3(o, d), G.mul3(a, h))); }
    for (let i = 0; i < n; i++) { F[0].push(2 * i); F[1].push(2 * i + 1); const j = (i + 1) % n; F.push([2 * i, 2 * j, 2 * j + 1, 2 * i + 1]); }
    return [V, F];
  };
  const faceMap = (P, T, o, ex, ey) => {               // SVG matrix for flat print: x along ex, y (down) along ey, at o
    const O = K.iso(T(o), P), X = K.iso(T(G.add3(o, ex)), P), Y = K.iso(T(G.add3(o, ey)), P), f = (v) => v.toFixed(4);
    return `matrix(${f(X[0] - O[0])} ${f(X[1] - O[1])} ${f(Y[0] - O[0])} ${f(Y[1] - O[1])} ${f(O[0])} ${f(O[1])})`;
  };

  // The carton at tip t: body, roof, fin, the spout's neck, the print on its front and side.
  function cartonSvg(P, t, word, capOn) {
    const T = placeOf(t), W = (pts) => pts.map(T), out = [];
    out.push(ISO.tinted(PAPER, ISO.poly(W(BOXV(-A, A, -A, A, 0, BODY)), ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(PAPER, ISO.poly(W([[-A, -A, BODY], [A, -A, BODY], [A, A, BODY], [-A, A, BODY], [0, -A, RIDGE], [0, A, RIDGE]]), [[0, 1, 2, 3], [0, 3, 5, 4], [1, 2, 5, 4], [0, 1, 4], [3, 2, 5]], P, "mid")));
    out.push(ISO.tinted(PAPER, ISO.poly(W(BOXV(-1.6, 1.6, -A, A, RIDGE - 2, FIN)), ISO.BOX_F, P, "mid")));
    const [nv, nf] = cylV(G.add3(SLOPE, G.mul3(NRM, -1)), NRM, 11, 5);
    out.push(ISO.tinted(PAPER, ISO.poly(W(nv), nf, P, "mid")));
    const tf = faceMap(P, T, [0, A + 0.1, 0], [1, 0, 0], [0, 0, -1]), sf = faceMap(P, T, [A + 0.1, 0, 0], [0, -1, 0], [0, 0, -1]);
    const size = Math.min(24, 120 / Math.max(3, word.length));
    // front print: the blue band with the name, a drop, the size; a fold V on the gable end above it
    out.push(`<g transform="${tf}"><path d="M-35 -122H35V-76H-35Z" fill="#3f7cc0" stroke="#173f70" stroke-width=".8"/><path d="M-35 -26H35V-16H-35Z" fill="#9cc3ee" stroke="#173f70" stroke-width=".6"/>` +
      `<text x="0" y="${-99 + size * 0.36}" text-anchor="middle" fill="#ffffff" style="font:800 ${size}px 'Helvetica Neue',Arial,sans-serif">${word}</text>` +
      `<path d="M0 -72Q-8 -60 -8 -55A8 8 0 0 0 8 -55Q8 -60 0 -72Z" fill="#cfe1f5" stroke="#173f70" stroke-width=".7"/><text x="0" y="-32" text-anchor="middle" fill="#173f70" style="font:700 9px 'Helvetica Neue',Arial,sans-serif">1 L</text>` +
      `<path d="M-35 -195L0 -207L35 -195" fill="none" stroke="#9aa3ab" stroke-width=".7"/></g>`);
    // side print: a nutrition panel with its rule lines (printed text, so they stop on the panel)
    out.push(`<g transform="${sf}"><path d="M-26 -150H26V-96H-26Z" fill="#fdfdfb" stroke="#4a5560" stroke-width=".6"/><path d="M-26 -140H26M-22 -130H18M-22 -122H22M-22 -114H14M-22 -106H20" fill="none" stroke="#8a939b" stroke-width=".6"/><path d="M-35 -26H35V-16H-35Z" fill="#9cc3ee" stroke="#173f70" stroke-width=".6"/></g>`);
    if (capOn) out.push(capSvg(P, T(G.add3(SLOPE, G.mul3(NRM, 4))), G.unit3(G.sub3(T(G.add3(SLOPE, NRM)), T(SLOPE)))));
    return out.join("");
  }
  // The screw cap: a ribbed blue cylinder 27 mm across (ribs as a closed ring of grip flats on its side).
  function capSvg(P, o, a) {
    const [cv, cf] = cylV(o, a, 13.5, 9, 24);
    return `<g data-name="cap">` + ISO.tinted(CAP, ISO.poly(cv, cf, P, "hi")) + `</g>`;
  }
  // The tumbler, its mouth, and the milk in it at level h (seen through the glass).
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const ring = (P, z, r, n = 48) => Array.from({ length: n }, (_, i) => K.iso([GL[0] + r * Math.cos((i / n) * Math.PI * 2), GL[1] + r * Math.sin((i / n) * Math.PI * 2), z], P));
  function glassSvg(P) {
    const F = zAx(GL), out = [];
    out.push(ISO.tinted(ISO.T.wood, S(K.cylinder(GL[0], GL[1], 46, 0, 4, P, 48, 0.6), { tone: "lo" })));
    out.push(ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, R0 + 1], [1.2, R0 + 2.4, 1], [GB, R0 + 3], [GH - 1, R1 + 3, 1], [GH, R1 + 1.6], [GH, 0]], F, P, { steps: 64 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(F, GH + 0.02, R1, P, 64)}" fill="#e6f0f6" stroke="#5d7f96" stroke-width=".6"/>`);
    out.push(`<path d="${G.circleOf(F, GB, R0, P, 48)}" fill="#dbe8f0" stroke="#9fb6c4" stroke-width=".5"/>`);
    return out.join("");
  }
  function milkSvg(P, h) {
    if (h < 0.3) return "";
    const z0 = GL[2] + GB, z1 = z0 + h, hull = ISO.hullOf([...ring(P, z0, R0 - 0.4), ...ring(P, z1, rIn(h) - 0.4)]);
    return `<g data-name="milk"><path d="${K.pathOf(hull, true)}" fill="#fbfaf4" stroke="#a9a48f" stroke-width=".7"/><path d="${K.pathOf(ring(P, z1, rIn(h) - 0.4), true)}" fill="#ffffff" stroke="#a9a48f" stroke-width=".6"/></g>`;
  }
  // The glass's front lip and a long highlight down its near side, over the milk.
  function lipSvg(P) {
    const pts = ring(P, GL[2] + GH, R1 + 1.6, 64), k = K.cameraOf(P).k;
    const front = pts.filter((_, i) => Math.sin((i / 64) * Math.PI * 2 - 0.9) > 0);
    const a = K.iso([GL[0] + (R1 + 2.8) * Math.cos(1.9), GL[1] + (R1 + 2.8) * Math.sin(1.9), GL[2] + GH - 10], P), b = K.iso([GL[0] + (R0 + 3) * Math.cos(1.9), GL[1] + (R0 + 3) * Math.sin(1.9), GL[2] + 16], P);
    return `<path d="${K.pathOf(front)}" fill="none" stroke="#ffffff" stroke-width="${(1.4 * k).toFixed(2)}" stroke-linecap="round" opacity=".9"/><path d="${K.pathOf([a, b])}" stroke="#ffffff" stroke-width="${(2.6 * k).toFixed(2)}" stroke-linecap="round" opacity=".7"/>`;
  }
  // The stream: from the spout's mouth it falls as a jet (a parabola) to the milk's surface; w 0..1 its thickness.
  function streamSvg(P, from, toZ, w) {
    if (w < 0.02) return "";
    const to = [GL[0] + 2, GL[1], toZ], pts = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(K.iso([from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u * u], P)); }
    const d = K.pathOf(pts), k = K.cameraOf(P).k;
    return `<path d="${d}" fill="none" stroke="#a9a48f" stroke-width="${(7 * w * k + 1.4).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fdfcf6" stroke-width="${(7 * w * k).toFixed(2)}" stroke-linecap="round"/>`;
  }
  // The tray, and the plate of biscuits on it.
  function traySvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(TRAY, -12, 12, P)}"/>`];
    out.push(ISO.tinted(ISO.T.wood, S(K.slabOf(TRAY, -12, 12, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(TRAY, -6, P, 8), { tone: "faint" }) })));
    out.push(L(K.planOutline(K.insetPlan(TRAY, 6), 0, P), { tone: "faint" }));
    const PL = [2, 70];
    out.push(ISO.tinted(PAPER, S(K.cylinder(PL[0], PL[1], 22, 0, 2, P, 40), { tone: "lo" }) + S(K.cylinder(PL[0], PL[1], 34, 2, 3, P, 56, 0.8), { tone: "mid" })));
    out.push(L(K.ring(PL[0], PL[1], 24, 5, P, 40), { tone: "faint" }));
    const BIS = ISO.tint("#f2d9a6", ["#c99a4e", "#d4a961", "#ddb877", "#e6c78e"], "#7a5420");
    for (const [x, y, z] of [[PL[0] - 12, PL[1] - 7, 5], [PL[0] + 12, PL[1] + 7, 5], [PL[0], PL[1], 11]]) {
      out.push(ISO.tinted(BIS, S(K.cylinder(x, y, 13, z, 6, P, 32, 0.8), { tone: "hi" })));
      out.push(K.dotsSvg([[x - 6, y - 3], [x + 4, y - 7], [x + 7, y + 4], [x - 3, y + 6], [x, y]].map(([a, b]) => K.iso([a, b, z + 6], P)), { size: 1.1, tone: "lo" }));
    }
    // a folded paper napkin with a teaspoon on it: the spoon's handle, its neck and its shallow bowl
    out.push(ISO.tinted(ISO.T.blue, S(K.slabOf({ x: -64, y: 48, w: 34, d: 52, r: 1 }, 0, 0.8, P, 3), { tone: "lo" }) + S(K.slabOf({ x: -64, y: 48, w: 34, d: 26, r: 1 }, 0.8, 0.8, P, 3), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-50, -46], [54, 82], [1.6, 2.6], "hi") + ISO.wbox(P, [-49.2, -46.8], [82, 88], [1.6, 2.2], "hi")));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 5], [0.8, 4.6, 1], [1.6, 0]], G.frameOf([-48, 93, 1.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 28 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "milk", title: "Milk carton", compare: "milk 480 270 280",
    about: "A 1 L gable-top milk carton: the cap comes off, the carton tips and pours a 250 mL glass, and stands back up with 750 mL left.",
    line: "milk cx cy height pour=0..1 lab=1 lit=carton|cap|glass|milk |text",
    demo: { line: "milk 480 270 280", script: [{ set: {}, hold: 1 }, { set: { pour: 1 }, hold: "settle" }, { set: { lit: "milk" }, hold: 1.4 }] },
    make([cx, cy, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.75, word = (t || "MILK").toUpperCase().replace(/[<>&]/g, "").slice(0, 12);
      const corners = (tt) => BOXV(-A, A, -A, A, 0, FIN).map(placeOf(tt));
      const { P, g } = ISO.frame([...K.boxCorners(TRAY, -12, 0), ...corners(0), ...corners(1), [GL[0], GL[1], GH + 4]], cx, cy, W, H, { azimuth: 38, elevation: 24 }, parent);
      g.innerHTML = `${traySvg(P)}<g data-k="behind"></g><g data-name="glass">${glassSvg(P)}</g><g data-k="milk"></g><g data-k="lip">${lipSvg(P)}</g><g data-k="front"></g><g data-k="stream"></g><g data-k="cap"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-k="${n}"],[data-part="${n}"]`), w = ISO.writer();
      const el = Object.fromEntries(["behind", "front", "glass", "milk", "stream", "cap", "words"].map((n) => [n, q(n)]));
      const start = ISO.clamp(ISO.num(o, "pour", 0), 0, 1), s = { f: start, goal: start };
      let lit = o.lit || "";
      // phases of one pour: 0–0.12 the cap comes off, 0.12–0.35 the carton tips, 0.36–0.73 the glass fills,
      // 0.75–0.95 the carton is stood back up
      const pose = (f) => ({ cap: ISO.smooth(0, 0.12, f), tip: ISO.smooth(0.12, 0.35, f) - ISO.smooth(0.75, 0.95, f), ml: 250 * ISO.clamp((f - 0.36) / 0.37, 0, 1), flow: ISO.smooth(0.35, 0.39, f) * (1 - ISO.smooth(0.71, 0.75, f)) });
      const REST = [-82, 74, 0];                                           // where the cap is set down, on its top
      const draw = () => {
        const ps = pose(s.f), tk = ps.tip.toFixed(3), above = ps.tip > 0.3, T = placeOf(ps.tip);
        w.rebuild(el.behind, above ? "" : `${tk} ${ps.cap > 0}`, () => (above ? "" : `<g data-name="carton">${cartonSvg(P, ps.tip, word, ps.cap <= 0)}</g>`));
        w.rebuild(el.front, above ? `${tk}` : "", () => (above ? `<g data-name="carton">${cartonSvg(P, ps.tip, word, false)}</g>` : ""));
        const h = levelOf(ps.ml);
        w.rebuild(el.milk, ps.ml.toFixed(1), () => milkSvg(P, h));
        const mouth = T(G.add3(SLOPE, G.mul3(NRM, 12)));
        w.rebuild(el.stream, ps.flow > 0.02 ? `${tk} ${ps.flow.toFixed(2)} ${h.toFixed(1)}` : "", () => streamSvg(P, mouth, GL[2] + GB + h, ps.flow));
        // the cap off: up its axis 12 mm while it unscrews, then over to the tray, set down on its top
        const off = ps.cap > 0 && ps.cap;
        w.rebuild(el.cap, off ? off.toFixed(3) : "", () => {
          if (!off) return "";
          const seat = G.add3(SLOPE, G.mul3(NRM, 4)), up = ISO.smooth(0, 0.4, off), go = ISO.smooth(0.4, 1, off);
          const lifted = G.add3(seat, G.mul3(NRM, 12 * up)), dest = [REST[0], REST[1], 9];
          const pos = [lifted[0] + (dest[0] - lifted[0]) * go, lifted[1] + (dest[1] - lifted[1]) * go, lifted[2] + (dest[2] - lifted[2]) * go + Math.sin(go * Math.PI) * 30];
          const ax = G.unit3(G.add3(G.mul3(NRM, 1 - go), G.mul3([0, 0, -1], go)));
          return capSvg(P, pos, ax);
        });
        w.rebuild(el.words, lab ? `${above} ${ps.ml > 0} ${off >= 1}` : "", () => !lab ? "" : [
          ISO.word(K.iso(T([-A, A, 60]), P), "carton", "#4a5560", { anchor: "end", size: 15, dy: 0 }),
          ISO.word(K.iso([GL[0] + 40, GL[1] + 30, 40], P), ps.ml > 0 ? "milk" : "glass", ps.ml > 0 ? "#7a7360" : "#5d7f96", { anchor: "start", size: 15 }),
          off >= 1 ? ISO.word(K.iso(REST, P), "cap", "#173f70", { size: 14, dy: -26 }) : ISO.word(K.iso(T([A, 0, RIDGE + 6]), P), "cap", "#173f70", { anchor: "start", size: 14, dy: -6 }),
        ].join(""));
        const want = lit || (ps.cap > 0 && ps.cap < 1 ? "cap" : ps.flow > 0.5 ? "milk" : "");
        const groups = { carton: [el.behind, el.front], cap: [el.cap], glass: [el.glass], milk: [el.milk, el.stream] };
        w.light(Object.values(groups).flat(), groups[want] || []);
      };
      g.set = (p) => {
        if (p.pour !== undefined) { s.goal = ISO.clamp(+p.pour, 0, 1); if (s.goal < s.f) s.f = s.goal; }  // poured milk doesn't go back
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (s.f !== s.goal) s.f = ISO.still() ? s.goal : Math.min(s.goal, s.f + dt / 7);
        draw();
        return s.f !== s.goal;
      };
      g.readout = () => {
        const ps = pose(s.f);
        if (s.f <= 0) return "1 L gable-top carton · 7 × 7 × 24 cm · 1000 mL · keep it cold, below 5 °C";
        if (ps.ml <= 0) return ps.tip > 0 ? "lift and tip it: the spout faces the glass" : "unscrew the cap";
        if (s.f < 0.75) return `pouring · glass ${Math.round(ps.ml)} of 250 mL · carton ${Math.round(1000 - ps.ml)} mL left`;
        return "250 mL poured (a tumbler holds about 290 mL to the brim) · 750 mL left in the carton";
      };
      draw();
      return g;
    },
  });
})();
