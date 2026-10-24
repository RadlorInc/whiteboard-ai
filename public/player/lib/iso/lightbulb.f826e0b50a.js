// "lightbulb cx cy k aim=down|up|flat on=0|1 lab=0 lit=glass|base" — a PART (PARTS.md): an A19 bulb (60 mm across,
// 108 mm long) with an E26 screw base, its origin the base's contact point (aim=flat: its middle on the surface it
// lies on). The base: a brass foot contact, a black glass insulator, an aluminium shell with five rounded turns of
// thread (3.6 mm a turn). The glass: a clear pear, inside it the glass stem with its flare, two lead-in wires, three
// support wires from the stem's button and the coiled tungsten filament. on=1 heats the coil white and the glass
// glows (SVG, no WebGL). aim=down hangs it from its base (a lamp's socket), up stands it on its base, flat lies it on
// its side, resting on the insulator and the glass. set({ on }). World units: 1 = 1 cm.
// Placed at a pendantlamp's socket (aim=down), it moves itself just under that lamp in the drawing order, so the
// socket and shade cover its base the way they do in a real lamp.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const NECK = 2.62, LEN = 10.8;
  // the glass from bulb.js's 60 W pear: z mm → s cm from the contact, radius mm → cm
  const GLASS = [[50, 0], [50, 12.6], [58, 13.6, 1], [70, 17.4, 1], [86, 25.6, 1], [102, 29.6, 1], [120, 30, 1], [138, 26.4, 1], [150, 18.4, 1], [157, 9, 1], [159, 0]].map(([z, r, sm]) => (sm ? [NECK + (z - 50) * 0.0752, r / 10, 1] : [NECK + (z - 50) * 0.0752, r / 10]));
  const SHELL = (() => {
    const p = [[0.62, 1.12], [0.7, 1.22]];
    for (let s = 0.78; s < 2.3; s += 0.363) p.push([s + 0.09, 1.31, 1], [s + 0.18, 1.33, 1], [s + 0.27, 1.31, 1], [s + 0.363, 1.21, 1]);
    p.push([2.42, 1.28], [2.5, 1.34], [NECK, 1.34], [NECK, 1.24]);
    return p;
  })();
  const zs = (z) => NECK + (z - 50) * 0.0752, xs = (x) => x / 10;
  // lying flat it rests on the insulator's rim and the glass's widest ring: the axis rises toward the glass
  const TILT = Math.atan2(3.0 - 1.12, zs(120) - 0.62);
  const tempOf = (on) => (on ? 2700 : 20);
  let uid = 0;

  // the bulb in three pieces (built in two slices of the build budget): the base, the glass, what is inside it
  function baseSvg(P, F, near) {
    const pieces = [ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 0.4], [0.1, 0.46, 1], [0.24, 0.5]], F, P, { steps: 24 }), { tone: "hi" })),
      ISO.tinted(ISO.T.plastic, S(G.lathe([[0.2, 0], [0.2, 0.62], [0.36, 0.9, 1], [0.62, 1.12], [0.62, 0]], F, P, { steps: 24 }), { tone: "mid" })),
      ISO.tinted(ISO.T.steel, S(G.lathe([[0.62, 0], ...SHELL, [NECK, 0]], F, P, { steps: 32, smooth: false }), { tone: "hi" }))];
    return (near ? pieces : pieces.reverse()).join("");   // far piece first: contact, insulator, shell, or the reverse
  }
  // the glass's tint is a style on its own group, so switching on swaps the style and rebuilds nothing
  const glassSvg = (P, F) => `<g data-part="tint" style="${ISO.T.glass}">${S(G.lathe(GLASS, F, P, { steps: 40 }), { tone: "mid" })}</g>`;
  function innerSvg(P, F, id) {
    const at = (s, x, y = 0) => K.iso(F.o.map((o, i) => o + F.a[i] * s + F.u[i] * x + F.v[i] * y), P);
    // inside, as seen through the glass: stem flare, button rod, lead-ins, supports, the coil
    const inner = [ISO.tinted(ISO.T.glass, S(G.lathe([[zs(50), 0], [zs(50), 0.84], [zs(56), 0.76, 1], [zs(64), 0.4, 1], [zs(76), 0.28], [zs(82), 0.26, 1], [zs(84), 0]], F, P, { steps: 20 }), { tone: "lo" }) +
      S(G.disc(zs(84), zs(98), 0.1, F, P, { steps: 12 }), { tone: "lo" }) + S(G.disc(zs(98), zs(99.6), 0.2, F, P, { steps: 14 }), { tone: "lo" }))];
    const W = (pts, c, w) => `<path d="${K.pathOf(pts.map(([s, x]) => at(zs(s), xs(x))))}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    const FZ = 116;
    inner.push(W([[80, -1.6], [92, -4.4], [FZ + 0.4, -14]], "#6b5a3a", 1), W([[80, 1.6], [92, 4.4], [FZ + 0.4, 14]], "#6b5a3a", 1));
    for (const x of [-7, 0, 7]) inner.push(W([[99.6, 0], [106, x * 0.6], [FZ - 0.9, x]], "#7d8187", 0.6));
    const coil = [];
    for (let i = 0; i <= 200; i++) { const u = i / 200, x = -14 + 28 * u, sag = -1.1 * Math.sin(Math.PI * ((u * 4) % 1)), a = u * 2 * Math.PI * 26; coil.push(at(zs(FZ + sag + 1.1 * Math.sin(a)), xs(x), xs(1.1 * Math.cos(a)))); }
    const cd = K.pathOf(coil), cw = Math.max(0.7, Math.min(2.4, G.scaleOf(P) * 0.08));
    // the coil cold (data-part="cold") and white hot (data-part="hot"): one of them shows
    inner.push(`<g data-part="cold"><path d="${cd}" fill="none" stroke="#5a5048" stroke-width="0.6" stroke-linejoin="round"/></g>`,
      `<g data-part="hot" style="visibility:hidden"><path d="${cd}" fill="none" stroke="#f08a1c" stroke-width="${cw.toFixed(2)}" stroke-linejoin="round"/><path d="${cd}" fill="none" stroke="#fffdf2" stroke-width="${(cw * 0.42).toFixed(2)}" stroke-linejoin="round"/></g>`);
    inner.push(`<g style="--anatomy-dot:#6b5a3a">${D([at(zs(FZ + 0.4), xs(-14)), at(zs(FZ + 0.4), xs(14))], { size: 0.35 })}</g>`);
    // the glow: built once, its opacity follows the filament (data-part="glow")
    const c = at(zs(112), 0), r = G.scaleOf(P) * 6.5;
    const halo = `<g data-part="glow"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#fffbe8" stop-opacity=".9"/><stop offset=".35" stop-color="#ffe7a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id})"/></g>`;
    return halo + inner.join("");
  }

  ISO.add({
    name: "lightbulb", title: "Light bulb (part)", compare: null,
    about: "An A19 light bulb with an E26 screw base: brass foot contact, black glass insulator, threaded shell, clear glass with the stem, lead-in wires and coiled filament inside; on=1 the filament glows white; aim=down hangs from a socket, up stands on its base, flat lies on its side.",
    line: "lightbulb cx cy k aim=down|up|flat on=0|1 lab=0 lit=glass|base",
    demo: { line: "lightbulb 480 130 30 aim=down", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0, lit: "base" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", id = `lbglow${++uid}`;
      const aim = ["down", "up", "flat"].includes(o.aim) ? o.aim : "down";
      let F;
      if (aim === "flat") {
        const c = Math.cos(TILT), s = Math.sin(TILT), d = [c, 0, s];
        const pts = [[0.62, 1.12], ...SHELL, ...GLASS.filter(([, r]) => r > 0)];
        const h = Math.max(...pts.map(([sv, r]) => r * c - sv * s));
        F = G.frameOf([-(LEN / 2) * c, 0, h], d, [-s, 0, c], [0, -1, 0]);
      } else F = G.frameAlong([0, 0, 0], aim === "up" ? [0, 0, 1] : [0, 0, -1]);
      const halo = aim === "flat" ? `<path class="iso-halo" d="${K.haloOf({ x: -LEN / 2, y: -2.4, w: LEN, d: 4.8, r: 2.4 }, -0.01, 0.02, P)}"/>` : "";
      const near = K.depthOf(F.o.map((v, i) => v + F.a[i]), P) > K.depthOf(F.o, P);   // the glass end nearer us
      const base = `<g data-name="base"></g>`, glass = `<g data-name="glass"><g data-part="envelope"></g><g data-part="inner"></g></g>`;
      g.innerHTML = `${halo}${near ? base + glass : glass + base}<g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"],[data-name="${n}"]`), w = ISO.writer();
      const el = { base: q("base"), glass: q("envelope"), inner: q("inner"), words: q("words") }, parts = [q("base"), q("glass")];
      el.base.innerHTML = baseSvg(P, F, near);
      el.glass.innerHTML = glassSvg(P, F);
      const s = { glow: o.on === "1" ? 1 : 0, on: o.on === "1" };
      let lit = o.lit || "";
      const draw = () => {
        const hot = s.glow > 0.5, tint = q("tint"), glow = q("glow");
        if (tint) w.attr(tint, "style", hot ? ISO.T.amber : ISO.T.glass);
        if (glow) { w.attr(glow, "opacity", s.glow.toFixed(2)); w.shown(q("hot"), hot); w.shown(q("cold"), !hot); }
        w.rebuild(el.words, lab ? "1" : "", () => (lab ? ISO.word(K.iso(F.o.map((v, i) => v + F.a[i] * LEN * 0.6 + F.u[i] * 3.4), P), "light bulb", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="6" x="') : ""));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = String(p.on) === "1"; if (p.lit !== undefined) lit = p.lit; };
      // a tungsten coil heats and cools in about a tenth of a second
      g.update = (dt) => {
        const to = s.on ? 1 : 0;
        s.glow = ISO.follow(s.glow, to, dt, 0.12, ISO.still()); if (Math.abs(s.glow - to) < 0.01) s.glow = to;
        draw();
        return s.glow !== to;
      };
      g.readout = () => (s.on ? `on · filament ≈ ${tempOf(true)} °C, glowing white · about 800 lumens from 60 W` : "off · A19 bulb, E26 screw base (26 mm), 60 mm across");
      draw();
      ISO.later(() => { el.inner.innerHTML = innerSvg(P, F, id); draw(); });
      // hung at a pendant lamp's socket: go just under that lamp in the drawing order, so its socket and shade hide
      // the base and the top of the glass (the lamp is drawn first, since this bulb is placed at its anchor)
      if (aim === "down") seat(g, cx, cy);
      return g;
    },
  });

  function seat(g, cx, cy) {
    const root = g.ownerSVGElement;
    if (!root) return;
    const toRoot = (el, x, y) => { const m = el.getCTM?.(); if (!m) return [x, y]; const p = root.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(m); return [q.x, q.y]; };
    const me = toRoot(g, cx, cy);
    for (const lamp of root.querySelectorAll("g[data-socket]")) {
      if (lamp === g || lamp.contains(g) || g.contains(lamp)) continue;
      const [x, y] = lamp.dataset.socket.split(",").map(Number), at = toRoot(lamp, x, y);
      if (Math.hypot(at[0] - me[0], at[1] - me[1]) > 1.5) continue;
      // the lowest common ancestor, and the child of it on each side; put the bulb's side first
      let mine = g;
      while (mine.parentNode && !mine.parentNode.contains(lamp)) mine = mine.parentNode;
      const lca = mine.parentNode;
      if (!lca) return;
      let theirs = lamp;
      while (theirs.parentNode !== lca) theirs = theirs.parentNode;
      if (theirs.compareDocumentPosition(mine) & Node.DOCUMENT_POSITION_FOLLOWING) lca.insertBefore(mine, theirs);
      return;
    }
  }
})();
