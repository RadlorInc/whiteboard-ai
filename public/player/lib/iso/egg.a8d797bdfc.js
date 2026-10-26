// "egg cx cy height k=whole|cracked crack=0..1 lab=1 lit=shell|white|yolk|bowl|carton" — a hen's egg cracked into a bowl.
// A 57 × 44 mm brown hen's egg (about 58 g: shell 10 %, white 58 %, yolk 32 %) held over a porcelain bowl, beside a
// six-cup pulp carton with four more eggs in it, all on a wooden board. set({ crack: 1 }) (or k=cracked): the shell
// splits round its waist, the halves tip open, the clear white with the yolk inside falls 9 cm into the bowl as a real
// fall (distance grows with the square of time, shown slower) and spreads; the thick white holds the yolk up in a dome.
// World units: 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const LEN = 57, B = 44, W0 = 4, XC = -2;                                  // length, breadth, Hügelschäffer offset, crack
  const rEgg = (x) => (B / 2) * Math.sqrt(Math.max(0, (LEN * LEN - 4 * x * x) / (LEN * LEN + 8 * W0 * x + 4 * W0 * W0)));
  const BOARD = { x: -198, y: -100, w: 325, d: 200, r: 10 };
  const BW = [58, 4], RIM = 60, BH = 42, BOT = 8, RBOT = 28, E = [58, 4, 122];  // bowl centre, rim radius, height, inside floor
  const CART = { x: -184, y: -82, w: 112, d: 164 }, CH = 30, CUPS = [];
  for (const cx of [-156, -100]) for (const cy of [-55, 0, 55]) CUPS.push([cx, cy]);
  const FULL = [0, 1, 2, 4];                                                // cups that still hold an egg
  const SHELL = ISO.tint("#f6e2c8", ["#cf9f72", "#dbb187", "#e5c39e", "#eed3b4"], "#7a4a24"), PULP = ISO.tint("#e3e1dc", ["#b3b0a8", "#bfbcb5", "#cbc8c2", "#d6d4cf"], "#5f5c56");
  const PORC = ISO.tint("#f7f9fb", ["#c9d3dc", "#d6dee5", "#e2e8ed", "#edf1f4"], "#4a5a6a"), YOLK = ISO.tint("#ffd36a", ["#e8920c", "#efa524", "#f5b83a", "#f9c850"], "#9a5a06");
  const WHITE = ISO.tint("#fcfbf5", ["#d6d1bd", "#e0dccb", "#e9e6d8", "#f2f0e6"], "#958d70");
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const smoothRun = (from, to, f, n = 14) => Array.from({ length: n - 1 }, (_, i) => { const s = from + ((to - from) * (i + 1)) / n; return [s, f(s), 1]; });

  // An egg standing in a carton cup, blunt end up, cut where it goes into the cup (that cut faces down, out of sight).
  const standing = (P, [x, y]) => {
    const z0 = 8, cut = CH - z0, f = (s) => rEgg(LEN / 2 - s);
    return ISO.tinted(SHELL, S(G.lathe([[cut, 0], [cut, f(cut)], ...smoothRun(cut, LEN, f), [LEN, 0]], zAx([x, y, z0]), P, { steps: 40 }), { tone: "hi" }));
  };
  // The carton: its lid standing open at the back, the tray with six cup openings in its top, then the eggs.
  function cartonSvg(P) {
    const out = [], { x, y, w, d } = CART;
    // the lid, hinged along the back (−x) edge and stood up, leaning back 8°: its shell and the snap tab
    const lean = 0.14, at = (u, v, h) => [x - 2 - h * Math.sin(lean) - u, v, CH + h * Math.cos(lean)];
    out.push(`<g data-name="carton">` + ISO.tinted(PULP, ISO.box((u, v, h) => at(u, v, h), P, [0, 3], [y, y + d], [0, 104], "mid")));
    out.push(ISO.tinted(PULP, ISO.box((u, v, h) => at(u, v, h), P, [-6, 0], [y + 8, y + d - 8], [10, 96], "mid")));
    out.push(ISO.tinted(PULP, ISO.wbox(P, [x - 3, x], [y, y + d], [CH - 3, CH], "lo")));
    // the tray: a slab with the six cup mouths (closed rings) and the pressed ribs between them
    out.push(ISO.tinted(PULP, S(K.slabOf({ x, y, w, d, r: 6 }, 0, CH, P, 6, 1), { tone: "mid", inner: L(K.sideSeam({ x, y, w, d, r: 6 }, 12, P, 6), { tone: "faint" }) })));
    out.push(L(CUPS.map(([cx, cy]) => K.ring(cx, cy, 21, CH, P, 28)).join(""), { tone: "lo" }));
    // the two empty cups show their dark hollows
    for (const i of [3, 5]) { const [cx, cy] = CUPS[i]; out.push(`<path d="${K.pathOf(K.circleRing(cx, cy, 19, 28).map(([a, b]) => K.iso([a, b, CH + 0.05], P)), true)}" fill="#bdb9b1" stroke="#5f5c56" stroke-width=".6"/>`); }
    out.push(`</g>`);
    const eggs = FULL.map((i) => CUPS[i]).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    out.push(eggs.map((c) => standing(P, c)).join(""));
    return out.join("");
  }
  // The bowl: foot ring, a smooth flared body with a rolled rim and a blue band, its open mouth and the floor inside.
  const prof = (s) => RBOT + 6 + (RIM - RBOT - 6) * Math.sin(((s - 6) / (BH - 6)) * (Math.PI / 2)) ** 0.8;
  function bowlSvg(P) {
    const F = zAx([BW[0], BW[1], 0]), body = [[6, 0], [6, RBOT + 6]];
    for (let i = 1; i <= 14; i++) { const s = 6 + ((BH - 6) * i) / 14; body.push([s, prof(s), 1]); }
    body.push([BH + 1.4, RIM + 0.6, 1], [BH + 2.4, RIM - 2], [BH + 2.4, 0]);
    const band = `<path d="${G.arcOf(F, BH - 9, prof(BH - 9) + 0.2, P) + G.arcOf(F, BH - 12, prof(BH - 12) + 0.2, P)}" fill="none" stroke="#2b5a8a" stroke-width="1"/>`;
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: BW[0] - RIM, y: BW[1] - RIM, w: 2 * RIM, d: 2 * RIM, r: RIM }, 0, 2, P)}"/>`];
    out.push(ISO.tinted(PORC, S(G.lathe([[0, 0], [0, RBOT + 2], [1.4, RBOT + 4, 1], [6, RBOT + 5], [6, 0]], F, P, { steps: 56 }), { tone: "mid" })));
    out.push(ISO.tinted(PORC, S(G.lathe(body, F, P, { steps: 80 }), { tone: "hi", inner: band })));
    // inside: the mouth, then the floor, a little lighter where the light falls into it
    out.push(`<path d="${G.circleOf(F, BH + 2.42, RIM - 2.4, P, 72)}" fill="#e3e9ee" stroke="#4a5a6a" stroke-width=".6"/>`);
    return out.join("");
  }
  // Clip for anything inside the bowl: everything above the near half of the rim (the near wall hides the rest).
  function clipOf(P, W, H) {
    const pts = Array.from({ length: 73 }, (_, i) => K.iso([BW[0] + (RIM - 2.4) * Math.cos((i / 72) * Math.PI * 2), BW[1] + (RIM - 2.4) * Math.sin((i / 72) * Math.PI * 2), BH + 2.4], P));
    let lo = 0, hi = 0; pts.forEach((p, i) => { if (p[0] < pts[lo][0]) lo = i; if (p[0] > pts[hi][0]) hi = i; });
    const arc = (a, b) => { const r = []; for (let i = a; ; i = (i + 1) % 72) { r.push(pts[i]); if (i === b) break; } return r; };
    const A = arc(lo, hi), Bk = arc(hi, lo), near = A.reduce((s, p) => s + p[1], 0) / A.length > Bk.reduce((s, p) => s + p[1], 0) / Bk.length ? A : Bk.reverse();
    return K.pathOf([[near[0][0], -H], ...near, [near[near.length - 1][0], -H]], true);
  }
  // A fork lying on the board in front, ready to beat the egg: handle, neck, and four tines off a flat bridge.
  function forkSvg(P) {
    const y = 78, Z = ISO.T.steel, out = [ISO.tinted(Z, ISO.wbox(P, [-70, -20], [y - 4, y + 4], [0, 2.4], "hi"))];
    out.push(ISO.tinted(Z, ISO.wbox(P, [-20, 2], [y - 2, y + 2], [0, 1.8], "hi")), ISO.tinted(Z, ISO.wbox(P, [2, 10], [y - 6.5, y + 6.5], [0, 1.4], "hi")));
    for (let i = 0; i < 4; i++) out.push(ISO.tinted(Z, ISO.wbox(P, [10, 30], [y - 6.5 + i * 3.6, y - 4.5 + i * 3.6], [0, 1.4], "hi")));
    return out.join("");
  }
  // A shell half (it hangs in the air as if held over the bowl, so the audit reads both halves as loose): side −1 is the blunt half, +1 the pointed one, d apart from the crack, tipped by th so it opens down.
  function halfSvg(P, side, d, th, open = d > 0.4) {
    const span = side < 0 ? XC + LEN / 2 : LEN / 2 - XC, f = (s) => rEgg(XC + side * s), R0 = f(0);
    const a = [side * Math.cos(th), 0, Math.sin(th)], o = [E[0] + XC + side * d, E[1], E[2]];
    const F = G.frameOf(o, a, [0, 1, 0], G.cross3(a, [0, 1, 0]));
    const out = [ISO.tinted(SHELL, S(G.lathe([[0, 0], [0, R0], ...smoothRun(0, span, f, 9), [span, 0]], F, P, { steps: 28 }), { tone: "hi" }))];
    // seen through its opening: the pale membrane inside and the broken edge, a ring of jagged teeth
    const V = G.viewOf(P);
    if (open && -(a[0] * V[0] + a[1] * V[1] + a[2] * V[2]) > -0.08) {
      const teeth = Array.from({ length: 24 }, (_, i) => { const p = (i / 24) * Math.PI * 2, r = R0 - (i % 2 ? 2.4 : 0.6); return K.iso(G.pointOf(F, 0.05, r, p), P); });
      out.push(`<path class="teeth" d="${K.pathOf(teeth, true)}" fill="#f8f1e4" stroke="#7a4a24" stroke-width=".7"/>`);
    }
    return out.join("");
  }
  // The white and the yolk: falling (a clear drop round the yolk), then spread on the bowl's floor.
  function contentsSvg(P, z, spread) {
    const out = [];
    if (spread <= 0) {
      const F = zAx([E[0], E[1], z]), drop = [[0, 0], [0, 12], ...smoothRun(0, 46, (s) => 12 + 12 * Math.sin((s / 46) * Math.PI) ** 0.7 - s * 0.18, 12), [46, 0]];
      out.push(`<g data-name="white">` + ISO.tinted(WHITE, S(G.lathe(drop, F, P, { steps: 36 }), { tone: "hi" })) + `</g>`);
      out.push(`<g data-name="yolk">` + ISO.tinted(YOLK, S(G.sphereOf([E[0], E[1], z + 17], 15, P, { steps: 40 }), { tone: "mid" })) + `</g>`);
      return out.join("");
    }
    // the pool: built once at its full 10 cm; while it spreads it is scaled about its centre in its own plane (a
    // uniform scale in a flat plane is a uniform scale on screen too), and the yolk dome sits on it
    const c = [BW[0] + 4, BW[1] - 2, BOT], F = zAx(c), rw = 50, hw = 4, ry = 14, hy = 10, k = (22 + 28 * spread) / 50, C = K.iso(c, P);
    out.push(`<g data-name="white" transform="translate(${C[0].toFixed(2)} ${C[1].toFixed(2)}) scale(${k.toFixed(3)}) translate(${(-C[0]).toFixed(2)} ${(-C[1]).toFixed(2)})">` + ISO.tinted(WHITE, S(G.lathe([[0, 0], [0, rw], ...smoothRun(0, hw, (s) => rw * Math.cos((s / hw) * (Math.PI / 2)) ** 0.35, 6), [hw, 0]], F, P, { steps: 56 }), { tone: "hi" })) + `</g>`);
    const FY = zAx([c[0], c[1], BOT + hw * 0.7]);
    out.push(`<g data-name="yolk">` + ISO.tinted(YOLK, S(G.lathe([[0, 0], [0, ry * 0.92], ...smoothRun(0, hy, (s) => ry * Math.cos((s / hy) * (Math.PI / 2)) ** 0.6, 10), [hy, 0]], FY, P, { steps: 40 }), { tone: "mid" })) + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "egg", title: "Hen's egg", compare: "egg 480 270 220 k=cracked",
    about: "A hen's egg over a bowl: the shell splits round its waist, the halves tip open, and the white with the yolk inside falls into the bowl and spreads.",
    line: "egg cx cy height k=whole|cracked crack=0..1 lab=1 lit=shell|white|yolk|bowl|carton",
    demo: { line: "egg 480 270 220", script: [{ set: {}, hold: 1.2 }, { set: { crack: 1 }, hold: "settle" }, { set: { lit: "yolk" }, hold: 1.4 }] },
    make([cx, cy, size = 220], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.9, H = size * 2;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -26, 0), [E[0] - 50, E[1], E[2] + 40], [E[0] + 50, E[1], E[2] + 40], [CART.x - 18, CART.y, CH + 104], [CART.x - 18, CART.y + CART.d, CH + 104]], cx, cy, W, H, { azimuth: 52, elevation: 38 }, parent);
      const id = `eggclip${Math.random().toString(36).slice(2, 8)}`;
      // the board: a thick end-grain chopping board on four rubber feet, a juice groove round its top
      const board = ISO.baseboard(P, BOARD, { h: 18, feet: 8, tint: ISO.T.wood });
      g.innerHTML = `<defs><clipPath id="${id}"><path d="${clipOf(P, W, H)}"/></clipPath></defs>${board}<g>${cartonSvg(P)}${forkSvg(P)}</g><g data-name="bowl">${bowlSvg(P)}</g>` +
        `<g clip-path="url(#${id})"><path d="${G.circleOf(zAx([BW[0], BW[1], 0]), BOT, RBOT + 4, P, 56)}" fill="#edf1f5" stroke="#b9c4ce" stroke-width=".6"/><g data-k="inside"></g></g><g data-k="fwrap"><g data-k="falling"></g></g><g data-name="shell"><g data-k="h0"></g><g data-k="h1"></g></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-k="${n}"],[data-part="${n}"]`), w = ISO.writer();
      const el = { h: [q("h0"), q("h1")], fwrap: q("fwrap"), inside: q("inside"), falling: q("falling"), shell: q("shell"), words: q("words"), bowl: q("bowl"), carton: q("carton") };
      const halfOrder = [-1, 1].sort((a, b) => K.depthOf([E[0] + XC + a * 20, E[1], E[2]], P) - K.depthOf([E[0] + XC + b * 20, E[1], E[2]], P));
      const cache = new Map(), memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
      const start = o.k === "cracked" ? 1 : ISO.clamp(ISO.num(o, "crack", 0), 0, 1);
      const s = { f: start, goal: start };
      let lit = o.lit || "", lastLight = "";
      // the crack's phases: 0–0.3 the halves part and tip, 0.3–0.6 the contents fall (z ∝ t²), 0.6–1 they spread
      const pose = (f) => {
        const p = ISO.smooth(0, 0.3, f), u = ISO.clamp((f - 0.3) / 0.3, 0, 1);
        return { d: 16 * p, th: 0.75 * p, out: f > 0.28, z: E[2] - 12 - (E[2] - 12 - BOT) * u * u, spread: ISO.smooth(0.6, 1, f), inBowl: u >= 1 };
      };
      const draw = () => {
        const ps = pose(s.f), spk = Math.round(ps.spread * 60);
        // memo: each shell pose and each spread step is built once, the falling drop is built once and slides
        // each half is built at five tip angles (0, 11, 22, 32, 43°); between them the small rest of the turn about the
        // y axis is drawn as the screen map that turns its axis and its x–z normal exactly (close for the rest), then it
        // slides apart; the broken edge seen through the opening fades as the opening turns away from the viewer
        const V = G.viewOf(P), th = 0.75 * ISO.smooth(0, 0.3, s.f), step = Math.min(4, Math.round(th / (0.75 / 4))), th0 = step * (0.75 / 4);
        for (const [i, side] of halfOrder.entries()) {
          const o = [E[0] + XC, E[1], E[2]], O = K.iso(o, P), at = (v) => { const q = K.iso(G.add3(o, v), P); return [q[0] - O[0], q[1] - O[1]]; };
          const rot = (t) => [[side * Math.cos(t), 0, Math.sin(t)], [-side * Math.sin(t), 0, Math.cos(t)]];
          const [A0, N0] = rot(th0).map(at), [A1, N1] = rot(th).map(at), det = A0[0] * N0[1] - A0[1] * N0[0];
          const inv = [N0[1] / det, -A0[1] / det, -N0[0] / det, A0[0] / det];
          const m = [A1[0] * inv[0] + N1[0] * inv[1], A1[1] * inv[0] + N1[1] * inv[1], A1[0] * inv[2] + N1[0] * inv[3], A1[1] * inv[2] + N1[1] * inv[3]];
          const T = K.iso([o[0] + side * ps.d, o[1], o[2]], P), f = (v) => v.toFixed(4);
          w.rebuild(el.h[i], s.f > 0 ? `o${step}` : "shut", () => memo(`h${side}${s.f > 0}${step}`, () => halfSvg(P, side, 0, th0, s.f > 0)));
          w.attr(el.h[i], "transform", `translate(${f(T[0])} ${f(T[1])}) matrix(${m.map(f).join(" ")} 0 0) translate(${f(-O[0])} ${f(-O[1])})`);
          const teeth = el.h[i].querySelector(".teeth");
          if (teeth) w.attr(teeth, "opacity", (ISO.smooth(0, 3, ps.d) * ISO.smooth(-0.02, 0.12, -(side * Math.cos(th) * V[0] + Math.sin(th) * V[2]))).toFixed(2));
        }
        const below = ps.out && ps.z < BH + 2;
        const pool = below && ps.inBowl;
        w.rebuild(el.inside, pool ? "pool" : "", () => (pool ? contentsSvg(P, 0, 1) : ""));
        if (pool) { const wh = el.inside.firstChild, C = K.iso([BW[0] + 4, BW[1] - 2, BOT], P), k = ((22 + 28 * (spk / 60)) / 50).toFixed(3); w.attr(wh, "transform", `translate(${C[0].toFixed(2)} ${C[1].toFixed(2)}) scale(${k}) translate(${(-C[0]).toFixed(2)} ${(-C[1]).toFixed(2)})`); }
        w.rebuild(el.falling, ps.out && !pool ? "drop" : "", () => (ps.out && !pool ? memo("drop", () => contentsSvg(P, E[2] - 12, 0)) : ""));
        w.attr(el.falling, "transform", K.translateAlong(P, [0, 0, ps.z - (E[2] - 12)]));
        w.attr(el.fwrap, "clip-path", below ? `url(#${id})` : "");
        w.rebuild(el.words, lab ? `${ps.out} ${ps.inBowl}` : "", () => !lab ? "" : [
          ISO.word(K.iso([E[0] - 30, E[1], E[2] + 24], P), "shell", "#7a4a24", { anchor: "end", size: 15 }),
          ps.inBowl ? ISO.word(K.iso([BW[0] + 4, BW[1] - 2, BOT + 16], P), "yolk", "#9a5a06", { size: 14, dy: -6 }) + ISO.word(K.iso([BW[0] + RIM, BW[1], BH], P), "white", "#5d7f96", { size: 14, anchor: "start" })
            : ps.out ? ISO.word(K.iso([E[0] + 30, E[1] + 45, ps.z], P), "yolk inside the white", "#9a5a06", { size: 13, anchor: "start" }) : "",
          ISO.word(K.iso([BW[0], BW[1] + RIM, 0], P), "bowl", "#4a5a6a", { size: 14, dy: 18 }),
          ISO.word(K.iso([CART.x + CART.w / 2, CART.y + CART.d, 0], P), "egg carton", "#5f5c56", { size: 14, dy: 18 }),
        ].join(""));
        const want = lit || (ps.out && !ps.inBowl ? "yolk" : s.f > 0 && s.f < 0.3 ? "shell" : "");
        const lk = `${want} ${el.h[0]._key} ${el.inside._key} ${el.falling._key}`;
        if (lk === lastLight) return;
        lastLight = lk;
        const groups = { shell: [el.shell], bowl: [el.bowl], carton: [el.carton], white: [...g.querySelectorAll('[data-name="white"]')], yolk: [...g.querySelectorAll('[data-name="yolk"]')] };
        w.light(Object.values(groups).flat(), groups[want] || []);
      };
      g.set = (p) => {
        if (p.k !== undefined) s.goal = p.k === "cracked" ? 1 : 0;
        if (p.crack !== undefined) s.goal = ISO.clamp(+p.crack, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
        if (s.goal < s.f) s.f = s.goal;                                       // an egg doesn't uncrack: going back resets it
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (s.f !== s.goal) s.f = calm ? s.goal : Math.min(s.goal, s.f + dt / 3.2);
        draw();
        return s.f !== s.goal;
      };
      g.readout = () => {
        const ps = pose(s.f);
        if (s.f <= 0) return "hen's egg · 57 × 44 mm, about 58 g · shell 10 %, white 58 %, yolk 32 %";
        if (!ps.out) return "the shell splits round its waist and the two halves tip open";
        if (!ps.inBowl) return "falling 10 cm takes about 0.14 s (shown slower): the white holds the yolk as it drops";
        return "in the bowl · the thick white spreads to about 10 cm and holds the yolk up in a dome";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
