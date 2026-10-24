// "collision cx cy width k=stick|bounce m1=1 m2=1 v=0.6 lab=1" — two trolleys colliding on a dynamics track.
// Trolley 1 (m1 kg) rolls at v m/s into trolley 2 (m2) at rest. stick: Velcro pads join them and they move on
// together at m1·v/(m1+m2). bounce: repelling magnets make it elastic: v1' = (m1−m2)/(m1+m2)·v, v2' = 2m1/(m1+m2)·v.
// Momentum before = momentum after in both. Each extra kilogram is a steel block on top. set({ k, m1, m2, go }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -125, y: -32, w: 250, d: 64, r: 6 }, TRACK = { x0: -116, x1: 116, z: 14, w: 11 }, CART = { l: 44, w: 24, h: 12 }, PER_M = 110;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function trackSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD, { h: 6 }), ISO.plate(P, { x: 66, y: -27, w: 40, d: 11, r: 1.2 })];
    for (const x of [-95, 95]) out.push(ISO.wbox(P, [x - 5, x + 5], [-TRACK.w - 4, TRACK.w + 4], [0, TRACK.z - 3], "mid"));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [TRACK.x0, TRACK.x1], [-TRACK.w, TRACK.w], [TRACK.z - 3, TRACK.z], "hi")));
    // Two guide lips along the track, a centimetre scale on its near side, and buffers at both ends.
    for (const y of [-TRACK.w, TRACK.w - 1.6]) out.push(ISO.wbox(P, [TRACK.x0, TRACK.x1], [y, y + 1.6], [TRACK.z, TRACK.z + 2], "mid"));
    const minor = [], major = [];
    for (let x = TRACK.x0 + 10; x <= TRACK.x1 - 10; x += 4) ((x - TRACK.x0) % 20 ? minor : major).push(K.segment([x, TRACK.w + 0.05, TRACK.z], [x, TRACK.w + 0.05, TRACK.z - ((x - TRACK.x0) % 20 ? 1.2 : 2.2)], P));
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    for (const x of [TRACK.x0, TRACK.x1 - 6]) out.push(ISO.wbox(P, [x, x + 6], [-TRACK.w - 1, TRACK.w + 1], [TRACK.z, TRACK.z + 10], "mid"));
    return out.join("");
  }
  // A trolley with its back end at x: body, four wheels, a plunger or pad at the front, and kg blocks on top.
  function cartSvg(P, x, kg, face, padKind, tint, name) {
    const out = [], z = TRACK.z + 2, body = [x, x + CART.l];
    for (const y of [-CART.w / 2 - 1.2]) for (const wx of [x + 7, x + CART.l - 7]) out.push(S(G.disc(-1.6, 0, 3.2, yAx([wx, y, z + 3.2]), P), { tone: "lo" }));
    out.push(ISO.tinted(tint, ISO.wbox(P, body, [-CART.w / 2, CART.w / 2], [z + 2.4, z + 2.4 + CART.h], "hi")));
    for (const wx of [x + 7, x + CART.l - 7]) out.push(S(G.disc(CART.w / 2, CART.w / 2 + 1.6, 3.2, yAx([wx, 0, z + 3.2]), P), { tone: "lo" }), D([K.iso([wx, CART.w / 2 + 1.7, z + 3.2], P)], { size: 0.6 }));
    const fx = face > 0 ? x + CART.l : x;
    out.push(padKind === "stick" ? ISO.tinted(ISO.T.amber, ISO.wbox(P, face > 0 ? [fx, fx + 2] : [fx - 2, fx], [-6, 6], [z + 4, z + 9], "hi")) : ISO.tinted(ISO.T.red, ISO.wbox(P, face > 0 ? [fx, fx + 3] : [fx - 3, fx], [-4, 4], [z + 4.5, z + 8.5], "hi")));
    for (let i = 0; i < Math.round(kg) - 1; i++) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x + 7, x + CART.l - 7], [-7, 7], [z + 2.4 + CART.h + i * 6, z + 2.4 + CART.h + 5.6 + i * 6], "hi")));
    return `<g data-name="${name}">${out.join("")}</g>`;
  }

  ISO.add({
    name: "collision", title: "Trolley collision", compare: "collision 480 280 440 k=stick",
    about: "Two trolleys on a dynamics track: they stick (Velcro) or bounce (magnets), and the total momentum stays the same.",
    line: "collision cx cy width k=stick|bounce m1=1 m2=1 v=0.6 lab=1",
    demo: { line: "collision 480 280 440 k=stick", script: [{ set: { go: 1 }, hold: "settle" }, { set: { k: "bounce", reset: 1 }, hold: 0.8 }, { set: { go: 1 }, hold: "settle" }, { set: { m1: 2, reset: 1 }, hold: 0.8 }, { set: { go: 1 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.75;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -10, 0), [TRACK.x0, 0, 46], [TRACK.x1, 0, 46]], cx, cy, W, H, { azimuth: 66, elevation: 28 }, parent);
      const m = { k: o.k === "bounce" ? "bounce" : "stick", m1: ISO.clamp(ISO.num(o, "m1", 1), 1, 3), m2: ISO.clamp(ISO.num(o, "m2", 1), 1, 3), v: ISO.clamp(ISO.num(o, "v", 0.6), 0.2, 1) };
      const start = () => ({ x1: -104, x2: -6, v1: 0, v2: 0, hit: false, moving: false, after: null });
      let s = start();
      g.innerHTML = `<g>${trackSvg(P, lab)}</g><g data-part="carts"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.carts, `${s.x1.toFixed(2)} ${s.x2.toFixed(2)} ${m.k} ${m.m1} ${m.m2}`, () =>
          cartSvg(P, s.x1, m.m1, 1, m.k, ISO.T.blue, "cart1") + cartSvg(P, s.x2, m.m2, -1, m.k, ISO.T.red, "cart2"));
        if (lab) w.rebuild(el.words, `${Math.round(s.x1)} ${Math.round(s.x2)} ${m.m1} ${m.m2}`, () =>
          ISO.word(K.iso([s.x1 + CART.l / 2, 0, TRACK.z + 14 + (m.m1 - 1) * 6], P), `${m.m1} kg`, "#2b6cc4", { dy: -6, size: 14 }) +
          ISO.word(K.iso([s.x2 + CART.l / 2, 0, TRACK.z + 14 + (m.m2 - 1) * 6], P), `${m.m2} kg`, "#c0392b", { dy: -6, size: 14 }));
      };
      g.set = (p) => {
        if (p.k) m.k = p.k === "bounce" ? "bounce" : "stick";
        for (const k of ["m1", "m2"]) if (p[k] !== undefined) m[k] = ISO.clamp(+p[k], 1, 3);
        if (p.reset) s = start();
        if (p.go) { s = start(); s.v1 = m.v; s.moving = true; }
      };
      g.update = (dt) => {
        if (!s.moving) { draw(); return false; }
        const h = ISO.still() ? 3 : dt;
        s.x1 += s.v1 * PER_M * h; s.x2 += s.v2 * PER_M * h;
        const gap = s.x2 - (s.x1 + CART.l) - 5;            // the pads' depth between the bodies
        if (!s.hit && gap <= 0) {
          s.hit = true; s.x1 = s.x2 - CART.l - 5;
          const u = s.v1, a = m.m1, b = m.m2;
          if (m.k === "stick") { s.v1 = s.v2 = (a * u) / (a + b); }
          else { s.v1 = ((a - b) / (a + b)) * u; s.v2 = ((2 * a) / (a + b)) * u; }
          s.after = { v1: s.v1, v2: s.v2 };
        }
        // Buffers at the far end stop whatever reaches them.
        if (s.x2 + CART.l > TRACK.x1 - 6) { s.x2 = TRACK.x1 - 6 - CART.l; s.v2 = 0; if (m.k === "stick") { s.v1 = 0; s.x1 = s.x2 - CART.l - 5; } }
        if (s.x1 + CART.l + 5 > s.x2 && s.hit && m.k !== "stick") s.x1 = s.x2 - CART.l - 5;
        if (s.x1 < TRACK.x0 + 6) { s.x1 = TRACK.x0 + 6; s.v1 = 0; }
        if (s.v1 === 0 && s.v2 === 0) s.moving = false;
        if (s.hit && s.x2 + CART.l >= TRACK.x1 - 6.01) s.moving = s.v1 !== 0 && m.k !== "stick" && s.x1 > TRACK.x0 + 6;
        draw();
        return s.moving;
      };
      g.readout = () => {
        const p0 = m.m1 * m.v, a = s.after;
        if (!a) return `before: ${m.m1} kg × ${m.v} m/s + ${m.m2} kg × 0 = ${p0.toFixed(2)} kg·m/s`;
        const p1 = m.m1 * a.v1 + m.m2 * a.v2;
        return `before ${p0.toFixed(2)} kg·m/s · after ${m.m1}×${a.v1.toFixed(2)} + ${m.m2}×${a.v2.toFixed(2)} = ${p1.toFixed(2)} kg·m/s · ${m.k === "stick" ? "stuck together" : "bounced (elastic)"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
