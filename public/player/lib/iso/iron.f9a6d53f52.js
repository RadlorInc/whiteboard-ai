// "iron cx cy width dial=off|silk|wool|cotton steam=0|1 glide=0|1 lab=1 lit=soleplate|tank|dial|light|steam" — a steam iron.
// A steam iron on an ironing board over a wrinkled cotton shirt-tail. While it heats it stands on its heel, so you see
// the pointed steel soleplate and its steam holes; on top, the white body that tapers to the nose, the see-through
// water tank with the water in it, the filler flap and the spray nozzle at the tip, the handle loop with the steam and
// spray buttons, the temperature dial (• silk 110 °C, •• wool 150 °C, ••• cotton 200 °C) with the heating light beside
// it, and the cord leaving through its swivel guard to the board's cord holder. Turned to cotton, the 2,000 W element
// heats the plate to 200 °C in about a minute (here, seconds) and the light goes out; the thermostat keeps it there.
// Glide on: the iron tips down onto its plate and passes over the cloth; steam on: water drips from the tank onto the
// hot plate, boils and leaves through the holes, and the heat and steam relax the cotton's fibres flat.
// set({ dial, steam, glide }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const DIAL = { off: [0, 20], silk: [1, 110], wool: [2, 150], cotton: [3, 200] };
  const BZ = 3, CLOTH = { x: -30, y: -11, w: 46, d: 22 }, X0 = -15, X1 = 1, HEEL = -12.8;
  const SOLE = [[-12.8, -5.6], [-12, -6.6], [3, -6.6], [9, -4.2], [13.5, 0], [9, 4.2], [3, 6.6], [-12, 6.6], [-12.8, 5.6]];
  const PLASTIC = ISO.tint("#f4f6f9", ["#b9c1ca", "#c8cfd7", "#d6dce3", "#e3e8ed"], "#4b5560");
  const COTTON = ISO.tint("#e9f0fa", ["#b8c7dc", "#c5d2e4", "#d2ddec", "#dfe7f3"], "#5a6e8a");
  const COVER = ISO.tint("#f3efe4", ["#cfc8b4", "#d9d3c0", "#e3decd", "#ece8da"], "#7a7360");
  const MINDER = [-12, -14.2], CLIP = [MINDER[0], MINDER[1], BZ + 21];
  // the board: a wide rounded end at -x, straight sides, tapering to a round nose at +x
  const BOARD = [...ISO.arc(-26, 0, 15, Math.PI / 2, Math.PI * 1.5, 14), [4, -15], ...ISO.arc(38, 0, 4.4, -Math.PI * 0.42, Math.PI * 0.42, 8), [4, 15]];
  const grow = (pts, by) => pts.map(([x, y], i) => { const [ax, ay] = pts[(i + pts.length - 1) % pts.length], [bx, by2] = pts[(i + 1) % pts.length], dx = bx - ax, dy = by2 - ay, l = Math.hypot(dx, dy) || 1; return [x + (dy / l) * -by, y - (dx / l) * -by]; });
  const COVERED = grow(BOARD, 0.5);
  const zF = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const scale = (pts, fu, fw = fu, cu = 0) => pts.map(([u, w]) => [cu + (u - cu) * fu, w * fw]);
  const cut = (pts, c, below) => {
    const inside = (p) => (below ? p[0] <= c : p[0] >= c), out = [];
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (inside(p)) out.push(p); if (inside(p) !== inside(q)) { const t = (c - p[0]) / (q[0] - p[0]); out.push([c, p[1] + (q[1] - p[1]) * t]); } });
    return out;
  };
  // the body's two halves in plan: the tank in front of u = 0, the dial housing behind it
  const SK = scale(SOLE, 0.94), FRONT = cut(SK, 0, false), REAR = cut(SK, 0, true);
  // the handle loop in side view (u along the iron, v up)
  const HANDLE = [[-10.6, 6.9], ...ISO.arc(-8.6, 11.2, 2.2, Math.PI, Math.PI / 2, 6), ...ISO.arc(3.9, 10.6, 2.4, Math.PI / 2, 0, 6), [6.5, 5.2],
    [4.2, 5.2], ...ISO.arc(3, 9.4, 1.2, 0, Math.PI / 2, 4), ...ISO.arc(-6.6, 9.4, 1.2, Math.PI / 2, Math.PI, 4), [-7.9, 6.9]];
  const grip = (u) => 13.4 - ((u + 8.6) / 12.5) * 0.4;                // the grip's top edge
  const GUARD = { at: [-11.2, 0, 6.4], dir: G.unit3([-0.25, 0, 1]), len: 3.6 };

  // The iron's pose: at x (its soleplate's centre when flat), tipped back onto its heel by th (0 flat, π/2 upright).
  function pose(x, th) {
    const c = Math.cos(th), s = Math.sin(th);
    const W = ([u, w, v]) => [x + HEEL + (u - HEEL) * c - v * s, w, BZ + (u - HEEL) * s + v * c];
    const R = ([u, w, v]) => [u * c - v * s, w, u * s + v * c];
    return { W, R, F: (o, a = [0, 0, 1], uu = [1, 0, 0], vv = [0, 1, 0]) => G.frameOf(W(o), R(a), R(uu), R(vv)) };
  }
  // A convex loft through plan rings (u, w) at rising heights, through the pose: the body's tapering, rounded halves.
  function loft(P, Q, rings, tone = "hi") {
    const n = rings[0][0].length, V = rings.flatMap(([ring, v]) => ring.map(([u, w]) => Q.W([u, w, v])));
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n * (rings.length - 1))];
    for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([r * n + i, r * n + j, (r + 1) * n + j, (r + 1) * n + i]); }
    return ISO.poly(V, F, P, tone);
  }
  // A round part as a 20-sided prism along its frame's axis (a lathe is too slow to redraw every frame of the tip),
  // and the swivel guard as a tapered loft of two rings.
  const puck = (P, F, s0, s1, r) => G.prismOf(F, Array.from({ length: 20 }, (_, i) => [r * Math.cos((i / 20) * Math.PI * 2), r * Math.sin((i / 20) * Math.PI * 2)]), s0, s1, P);
  function taper(P, F, r0, r1, len) {
    const n = 16, V = [...Array.from({ length: n }, (_, i) => G.pointOf(F, 0, r0, (i / n) * Math.PI * 2)), ...Array.from({ length: n }, (_, i) => G.pointOf(F, len, r1, (i / n) * Math.PI * 2))];
    const Fc = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n)];
    for (let i = 0; i < n; i++) Fc.push([i, (i + 1) % n, ((i + 1) % n) + n, i + n]);
    return ISO.poly(V, Fc, P, "mid");
  }
  function boardSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -41, y: -15, w: 83, d: 30, r: 12 }, 0, BZ, P)}"/>`];
    out.push(ISO.tinted(ISO.T.steel, S(G.prismOf(zF, BOARD, 0, 0.9, P), { tone: "mid" })));
    out.push(ISO.tinted(COVER, S(G.prismOf(zF, COVERED, 0.9, BZ, P), { tone: "hi", inner: L(K.ringSeam(COVERED, 1.5, P), { tone: "faint" }) })));
    out.push(ISO.tinted(COTTON, S(K.slabOf({ ...CLOTH, r: 1 }, BZ, 0.2, P, 3), { tone: "hi", crease: "none" })));
    return out.join("");
  }
  // The cord holder at the board's far edge: a clamp over the edge, a wire post, and the eye the cord runs through.
  // Its outer plate and the cord's run down behind the board are drawn before the board, which hides them.
  function minderBackSvg(P) {
    const k = K.cameraOf(P).k, d = K.pathOf([CLIP, [CLIP[0] - 0.6, CLIP[1] - 1.6, BZ + 22], [CLIP[0] - 1, -17.2, BZ + 6], [CLIP[0] - 1, -17.2, -4]].map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#2a2d31" stroke-width="${(0.7 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [MINDER[0] - 1.6, MINDER[0] + 1.6], [-16.1, -15.5], [-0.8, BZ + 0.6], "mid"));
  }
  function minderSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, ISO.wbox(P, [MINDER[0] - 1.6, MINDER[0] + 1.6], [-15.5, -12.8], [BZ, BZ + 0.6], "mid"))];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(MINDER[0], MINDER[1], 0.3, BZ + 0.6, CLIP[2] - BZ - 1.6, P, 12), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.rubber, S(G.ringBand(-0.4, 0.4, 0.5, 1, G.frameOf(CLIP, [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 20 }), { tone: "lo" }) + S(K.cylinder(MINDER[0], MINDER[1], 0.45, CLIP[2] - 1.6, 0.6, P, 12), { tone: "lo" })));
    return out.join("");
  }
  // Wrinkles across the cloth from edge to edge; those the iron has passed over (x < cut) are gone.
  function wrinklesSvg(P, cutX) {
    const out = [];
    for (let i = 0; i < 8; i++) {
      const x = CLOTH.x + 5 + i * 5.6 + (i % 2) * 1.5;
      if (x < cutX) continue;
      const pts = []; for (let k = 0; k <= 12; k++) { const y = CLOTH.y + (k / 12) * CLOTH.d; pts.push(K.iso([x + Math.sin(k * 1.3 + i) * 1.2, y, BZ + 0.21], P)); }
      out.push(K.pathOf(pts));
    }
    return out.length ? `<path d="${out.join("")}" fill="none" stroke="#7d90ab" stroke-width="0.8"/>` : "";
  }
  // The cord from the swivel guard's tip, sagging, up to the holder's eye.
  function cordSvg(P, x, th) {
    const Q = pose(x, th), a = Q.W(G.add3(GUARD.at, G.mul3(GUARD.dir, GUARD.len))), out = Q.R(GUARD.dir), k = K.cameraOf(P).k;
    const b = G.add3(a, G.mul3(out, 7)), c = [CLIP[0] + 3, CLIP[1] + 2, CLIP[2] - 6];
    const pts = Array.from({ length: 25 }, (_, i) => { const t = i / 24, m = 1 - t; return [0, 1, 2].map((j) => m * m * m * a[j] + 3 * m * m * t * b[j] + 3 * m * t * t * c[j] + t * t * t * CLIP[j]); });
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#1a1c1f" stroke-width="${(0.7 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#4a4f56" stroke-width="${(0.36 * k).toFixed(2)}" stroke-linecap="round"/>`;
  }
  // The iron at x, tipped th, dial step d, heating light on/off (the plate's heat tint is set on [data-hot] after).
  // Its parts are painted in one order lying flat and the reverse standing up (then the plate faces you).
  // The tank, body halves (ISO.poly lofts) and the handle (ISO.prismY) aren't recorded by audit.mjs, so the filler
  // flap, nozzle, dial, light and buttons that sit on them read as "loose" there.
  function ironSvg(P, x, th, d, light) {
    const Q = pose(x, th), part = (name, svg) => `<g data-name="${name}">${svg}</g>`;
    const sole = Q.F([0, 0, 0]);
    const plate = part("soleplate", ISO.tinted(ISO.T.steel, `<g data-hot>${S(G.prismOf(sole, SOLE, 0, 0.7, P), { tone: "hi" })}</g>`));
    // the steam holes in the plate's underside, seen only when it stands up: a row round the edge and a field in front
    const holes = [];
    for (const [u, w] of [...scale(SOLE, 0.82).filter(([u]) => u > -11), ...[-4, -1, 2, 5, 8].flatMap((u) => [-3, 0, 3].filter((w) => Math.abs(w) < 5.6 - Math.max(0, u - 3) * 0.6).map((w) => [u, w]))]) holes.push(G.circleOf(Q.F([u, w, -0.02]), 0, 0.3, P, 10));
    const seen = (() => { const n = Q.R([0, 0, -1]), { sinA, cosA, sinE, cosE } = K.cameraOf(P); return n[0] * cosA * cosE + n[1] * sinA * cosE + n[2] * sinE > 0.05; })();
    const plateHoles = seen ? `<path d="${holes.join("")}" fill="#3c3f45" stroke="#2a2d31" stroke-width=".4"/>` : "";
    const skirt = ISO.tinted(PLASTIC, S(G.prismOf(sole, scale(SOLE, 0.965), 0.7, 2.6, P), { tone: "hi", inner: "" }));
    const guard = ISO.tinted(ISO.T.plastic, taper(P, G.frameAlong(Q.W(GUARD.at), Q.R(GUARD.dir)), 1.2, 0.62, GUARD.len));
    const body = ISO.tinted(PLASTIC, loft(P, Q, [[REAR, 2.6], [scale(REAR, 0.97, 0.93, -6), 5.4], [scale(REAR, 0.9, 0.76, -6), 7.2]]));
    // the tank: water in it to its level, then the see-through shell, the filler flap and the spray nozzle
    const water = `<g opacity=".9">${ISO.tinted(ISO.tint("#cfe2f6", ["#8fb6e2", "#a2c3e8", "#b5d0ee", "#c6dbf2"], "#3c6a9e"), loft(P, Q, [[scale(FRONT, 0.86, 0.84, 4), 2.8], [scale(FRONT, 0.82, 0.78, 3.5), 4.7]]))}</g>`;
    const tank = part("tank", `<g opacity=".62">${ISO.tinted(ISO.T.glass, loft(P, Q, [[FRONT, 2.6], [scale(FRONT, 0.94, 0.91), 4.5], [scale(FRONT, 0.8, 0.74), 5.6]]))}</g>` +
      ISO.tinted(PLASTIC, S(G.prismOf(Q.F([0, 0, 5.6]), [[6.2, -1.3], [8.6, -1.1], [8.6, 1.1], [6.2, 1.3]], 0, 0.35, P), { tone: "hi" })) +
      ISO.tinted(PLASTIC, S(puck(P, Q.F([10.9, 0, 4.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 0.8, 0.55), { tone: "mid" })));
    // the temperature dial on the housing's top: knurled rim, pointer at step d, its dots, and the heating light
    const df = Q.F([-4.6, 0, 7.2]), a = Math.PI + d * 0.75, tip = Q.W([-4.6 + 1.8 * Math.cos(a), 1.8 * Math.sin(a), 8.12]), mid = Q.W([-4.6, 0, 8.12]);
    const dial = part("dial", ISO.tinted(PLASTIC, S(puck(P, df, 0, 0.9, 2.2), { tone: "hi", inner: L(G.ribsOf(df, 0, 0.9, 2.2, 22, P, { seams: true }), { tone: "faint" }) })) +
      `<path class="iso-line" data-tone="lit" data-free="end" style="stroke-width:1" d="${K.pathOf([K.iso(mid, P), K.iso(tip, P)])}"/>` + D([K.iso(mid, P)], { size: 0.5, tone: "hi" }) +
      D([1, 2, 3].flatMap((k) => Array.from({ length: k }, (_, j) => { const b = Math.PI + k * 0.75 + (j - (k - 1) / 2) * 0.13; return K.iso(Q.W([-4.6 + 2.9 * Math.cos(b), 2.9 * Math.sin(b), 7.22]), P); })), { size: 0.4, tone: "mid" }));
    const lamp = part("light", ISO.tinted(light ? ISO.tint("#ffb07a", ["#e2561a", "#ea6a2a", "#f07e3e", "#f69456"], "#7a2a08") : ISO.tint("#c9b7ab", ["#8a776b", "#978477", "#a49184", "#b19e91"], "#4a3a30"), S(puck(P, Q.F([-9, 3.2, 7.2]), 0, 0.3, 0.65), { tone: "hi" })));
    // the handle loop, and the steam and spray buttons on its grip
    const handle = ISO.prismY(P, HANDLE.map(([u, v]) => { const p = Q.W([u, 0, v]); return [p[0], p[2]]; }), -1.7, 1.7, ["#b9c1ca", "#f4f6f9"], "#e9edf1", "#4b5560");
    const buttons = part("steam", ISO.tinted(ISO.T.blue, S(puck(P, Q.F([3.2, 0, grip(3.2)]), 0, 0.5, 0.85), { tone: "hi" })) +
      ISO.tinted(PLASTIC, S(puck(P, Q.F([0.6, 0, grip(0.6)]), 0, 0.45, 0.7), { tone: "hi" })));
    const flat = [plate, skirt, body, guard, water, tank, dial, lamp, handle, buttons];
    const standing = [buttons, handle, dial, lamp, guard, body, water, tank, skirt, plate, plateHoles];
    return (seen ? standing : flat).join("");
  }

  ISO.add({
    name: "iron", title: "Steam iron", compare: "iron 480 270 360",
    about: "A steam iron on an ironing board: it stands on its heel while the plate heats to 200 °C for cotton, then tips down and, with steam on, glides over the shirt and leaves it flat.",
    line: "iron cx cy width dial=off|silk|wool|cotton steam=0|1 glide=0|1 lab=1 lit=soleplate|tank|dial|light|steam",
    demo: { line: "iron 480 270 360", script: [{ set: { dial: "cotton" }, hold: "settle" }, { set: { steam: 1, glide: 1 }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.45;
      const { P, g } = ISO.frame([...BOARD.flatMap(([x, y]) => [[x, y, 0], [x, y, BZ]]), [X0 + HEEL, 0, BZ + 27], [X1 + 16, 0, BZ + 16], [CLIP[0], CLIP[1], CLIP[2] + 2]], cx, cy, W, H, { azimuth: 52, elevation: 32 }, parent);
      g.innerHTML = `<g>${minderBackSvg(P)}${boardSvg(P)}</g><g data-part="wrinkles"></g><g>${minderSvg(P)}</g><g data-part="cord"></g><g data-name="iron"></g><g data-name="steam"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { wrinkles: q("wrinkles"), cord: q("cord"), iron: q("iron"), steam: q("steam"), words: q("words") }, w = ISO.writer();
      // steam on the far side of the plate goes behind the iron, on the near side in front of it
      const back = ISO.puffsFx(g, P, W, H, el.iron, 5, 1), front = back && ISO.puffsFx(g, P, W, H, el.steam, 5, 1);
      const fx = front && ((list) => { back(list.filter((p) => p[1] < 0)); front(list.filter((p) => p[1] >= 0)); });
      const d0 = DIAL[o.dial] ? o.dial : "off", glide0 = o.glide === "1";
      const s = { dial: d0, temp: DIAL[d0][1], x: X0, th: glide0 ? 0 : Math.PI / 2, tip: +glide0, steam: 0, swept: CLOTH.x, clock: 0 }, goal = { steam: +(o.steam === "1"), glide: +glide0 };
      let lit = o.lit || "";
      // steam puffs: lying flat they leave round the plate's edges and front; standing, out of the plate's face
      const puffs = () => Array.from({ length: 10 }, (_, i) => {
        const u = (s.clock * 0.7 + i / 10) % 1, side = i % 2 ? 1 : -1, a = 0.55 * s.steam * Math.sin(Math.PI * Math.min(1, u * 1.4));
        if (s.th < 0.3) return [s.x + 10 - (i % 5) * 4, side * (7 + u * 4), BZ + 0.5 + u * 9, 2.4 + u * 5, a];
        return [s.x + HEEL + 1 + u * 8, side * (1 + u * 3), BZ + 3 + (i % 5) * 2.6 + u * 5, 2.2 + u * 4, a];
      });
      const steamSvg = () => puffs().map(([x, y, z, r, a]) => { const p = K.iso([x, y, z], P); return a < 0.02 ? "" : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r * 1.4).toFixed(1)}" fill="#f4f7fa" stroke="#9fb0c2" stroke-width="0.8" opacity="${a.toFixed(2)}"/>`; }).join("");
      const draw = () => {
        const [step, set] = DIAL[s.dial], h = ISO.clamp((s.temp - 20) / 180, 0, 1), light = s.temp < set - 1, pk = `${s.x.toFixed(2)} ${s.th.toFixed(3)}`;
        // lying flat the iron only slides, so it is drawn once at X0 and moved; it is redrawn only while it tips
        w.rebuild(el.iron, `${s.th === 0 ? "flat" : s.th.toFixed(3)} ${step} ${light}`, () => ironSvg(P, s.th === 0 ? X0 : s.x, s.th, step, light));
        w.attr(el.iron, "transform", s.th === 0 ? K.translateAlong(P, [s.x - X0, 0, 0]) : "");
        const hot = Math.round(h * 100);
        w.attr(el.iron.querySelector("[data-hot]"), "style", `--anatomy-top:color-mix(in srgb, #e9b49a ${hot}%, #d9dadd);--anatomy-shade-2:color-mix(in srgb, #c98a6e ${hot}%, #b6b9be)`);
        w.rebuild(el.cord, pk, () => cordSvg(P, s.x, s.th));
        w.rebuild(el.wrinkles, String(Math.floor(s.swept)), () => wrinklesSvg(P, s.swept));
        if (fx) fx(s.steam < 0.02 ? [] : puffs());
        else w.rebuild(el.steam, s.steam > 0.02 ? `${s.x.toFixed(1)} ${(s.clock % 10).toFixed(2)}` : "", () => (s.steam > 0.02 ? steamSvg() : ""));
        const up = s.th > 1, Q = pose(s.x, s.th);
        w.rebuild(el.words, lab ? `${pk} ${light}` : "", () => !lab ? "" : [
          ISO.word(K.iso(Q.W([-4.6, -2.4, 8]), P), "temperature dial", "#444", { anchor: "end", size: 14, dy: up ? 0 : -4 }),
          ISO.word(K.iso(Q.W([8, -6, 3]), P), "water tank", "#1f4f8f", { anchor: up ? "start" : "end", size: 14, dy: up ? -10 : 22 }),
          ISO.word(K.iso(Q.W([-9, 4, 7.2]), P), light ? "light on: heating" : "light", light ? "#b5541a" : "#444", { anchor: "end", size: 14, dy: up ? 18 : -2 }),
          up ? ISO.word(K.iso(Q.W([6, 6.6, 0]), P), "soleplate, steam holes", "#444", { anchor: "start", size: 14, dy: 4 }) : "",
          ISO.word(K.iso([CLOTH.x + CLOTH.w, CLOTH.y + CLOTH.d, BZ], P), "wrinkled cotton", "#5a6e8a", { anchor: "start", size: 14, dy: 14 })].join(""));
        const want = lit || (light ? "light" : s.steam > 0.5 ? "steam" : "");
        const parts = [...el.iron.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === want));
      };
      g.set = (p) => {
        if (p.dial && DIAL[p.dial]) s.dial = p.dial;
        if (p.steam !== undefined) goal.steam = +p.steam ? 1 : 0;
        if (p.glide !== undefined) goal.glide = +p.glide ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), set = DIAL[s.dial][1];
        s.clock += dt;
        // 2,000 W into a 1.2 kg plate: about 3 °C a second; here 60 °C a second. It cools at about a tenth of that.
        s.temp = calm ? set : s.temp < set ? Math.min(set, s.temp + 60 * dt) : Math.max(set, s.temp - 6 * dt);
        const want = goal.steam && s.temp > 100 ? 1 : 0;
        s.steam = ISO.follow(s.steam, want, dt, 0.3, calm); if (Math.abs(s.steam - want) < 0.01) s.steam = want;
        // tip down onto the plate (or back up onto the heel), then a calm pass across the cloth at 12 cm/s
        // the tip takes 0.7 s, eased at both ends (a hand lowers it: slow off the heel, slow onto the cloth)
        const thGoal = goal.glide ? 0 : Math.PI / 2;
        s.tip = calm ? +!!goal.glide : ISO.clamp(s.tip + (goal.glide ? 1 : -1) * dt / 0.7, 0, 1);
        s.th = s.tip >= 1 ? 0 : s.tip <= 0 ? Math.PI / 2 : (Math.PI / 2) * (1 - ISO.ease(s.tip));
        if (goal.glide && s.th === 0) { s.x = calm ? X1 : Math.min(X1, s.x + 12 * dt); s.swept = Math.max(s.swept, s.x + 12); if (s.x >= X1) s.swept = CLOTH.x + CLOTH.w + 1; }
        if (!goal.glide && s.th === thGoal) s.x = X0;
        draw();
        return s.temp !== set || s.th !== thGoal || (goal.glide && s.x < X1);
      };
      g.readout = () => {
        const [, set] = DIAL[s.dial];
        if (s.dial === "off") return "off, standing on its heel · dial: • silk 110 °C · •• wool 150 °C · ••• cotton 200 °C";
        if (s.temp < set - 1) return `heating to ${set} °C (${s.dial}) · plate at ${Math.round(s.temp)} °C · light on`;
        return `${set} °C reached, light off${s.steam > 0.5 ? " · steam: water boils on the plate and leaves through its holes" : ""}${goal.glide ? (s.x >= X1 ? " · cotton pressed flat" : " · gliding") : " · standing on its heel"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
