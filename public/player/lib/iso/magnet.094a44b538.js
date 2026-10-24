// "magnet cx cy length k=bar|horseshoe lines=1 lab=1" — a magnet on a white card with plotting compasses.
// A bar magnet (red north, blue south) or a horseshoe lies on a card; iron filings (lines=1) trace the field from N
// to S, and eight small compasses round it point along the field, worked out from the two poles (each pole a point
// source, like charges). set({ spin: deg }) turns the magnet on the card and every needle swings to follow.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CARD = { x: -110, y: -72, w: 220, d: 144, r: 3 }, CARD_Z = 1.2, MAG = { l: 90, w: 22, h: 10 };
  const RED = ISO.tint("#f9dcd7", ["#e07a6c", "#e88e82", "#efa398", "#f4b8ae"], "#8a1d16"), BLUE = ISO.tint("#dde8f6", ["#7d9fcf", "#91afd8", "#a6bfe0", "#bacde8"], "#1f4f8f");
  const COMPASS = [[-80, -40], [0, -54], [80, -40], [96, 0], [80, 40], [0, 54], [-80, 40], [-96, 0]];
  // Poles: bar = ends of the bar; horseshoe = tips of its two arms, side by side.
  const polesOf = (k, a) => {
    const rot = ([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    return k === "horseshoe" ? { n: rot([36, -20]), s: rot([36, 20]) } : { n: rot([MAG.l / 2 - 6, 0]), s: rot([-MAG.l / 2 + 6, 0]) };
  };
  const field = ([x, y], p) => {
    const f = (q, sign) => { const dx = x - q[0], dy = y - q[1], r3 = Math.pow(dx * dx + dy * dy + 30, 1.5); return [(sign * dx) / r3, (sign * dy) / r3]; };
    const a = f(p.n, 1), b = f(p.s, -1);
    return [a[0] + b[0], a[1] + b[1]];
  };
  // Field lines traced from the north pole by small steps until they reach the south pole or leave the card.
  function filings(P, p) {
    const out = [];
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2, pts = [], start = [p.n[0] + Math.cos(ang) * 7, p.n[1] + Math.sin(ang) * 7];
      let q = start;
      for (let k = 0; k < 400; k++) {
        const f = field(q, p), m = Math.hypot(f[0], f[1]) || 1;
        q = [q[0] + (f[0] / m) * 2.2, q[1] + (f[1] / m) * 2.2];
        if (Math.abs(q[0]) > 106 || Math.abs(q[1]) > 68) break;
        if (Math.hypot(q[0] - p.s[0], q[1] - p.s[1]) < 7) break;
        pts.push(q);
      }
      // Draw each line as short dashes, like filings lying along the field; skip the stretch under the magnet.
      if (pts.length > 4) out.push(`<path d="${K.pathOf(pts.map(([x, y]) => K.iso([x, y, CARD_Z + 0.05], P)))}" fill="none" stroke="#5b5f66" stroke-width="0.9" stroke-dasharray="1.6 2.2" opacity=".75"/>`);
    }
    return out.join("");
  }
  function magnetSvg(P, k, a) {
    const rot = ([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)], out = [];
    if (k === "horseshoe") {
      const ring = [...Array.from({ length: 25 }, (_, i) => { const t = Math.PI / 2 + (i / 24) * Math.PI; return [Math.cos(t) * 30 - 6, Math.sin(t) * 30]; }), [42, 30], [42, 12], ...Array.from({ length: 25 }, (_, i) => { const t = (3 * Math.PI) / 2 - (i / 24) * Math.PI; return [Math.cos(t) * 12 - 6, Math.sin(t) * 12]; }).reverse().reverse(), [42, -12], [42, -30]];
      const outer = Array.from({ length: 25 }, (_, i) => { const t = Math.PI / 2 + (i / 24) * Math.PI; return [Math.cos(t) * 30 - 6, Math.sin(t) * 30]; });
      const inner = Array.from({ length: 25 }, (_, i) => { const t = (3 * Math.PI) / 2 - (i / 24) * Math.PI; return [Math.cos(t) * 12 - 6, Math.sin(t) * 12]; });
      const shape = [...outer, [42, -30], [42, -12], ...inner, [42, 12], [42, 30]].map(rot);
      out.push(ISO.tinted(ISO.T.steel, K.solidSvg(K.extrude(shape, CARD_Z, MAG.h, P, { convex: false }), { tone: "hi" })));
      out.push(ISO.tinted(RED, K.solidSvg(K.extrude([[30, -30], [42, -30], [42, -12], [30, -12]].map(rot), CARD_Z + MAG.h, 0.4, P), { tone: "hi" })));
      out.push(ISO.tinted(BLUE, K.solidSvg(K.extrude([[30, 12], [42, 12], [42, 30], [30, 30]].map(rot), CARD_Z + MAG.h, 0.4, P), { tone: "hi" })));
      void ring;
    } else {
      const half = (x0, x1) => [[x0, -MAG.w / 2], [x1, -MAG.w / 2], [x1, MAG.w / 2], [x0, MAG.w / 2]].map(rot);
      out.push(ISO.tinted(BLUE, K.solidSvg(K.extrude(half(-MAG.l / 2, 0), CARD_Z, MAG.h, P), { tone: "hi" })));
      out.push(ISO.tinted(RED, K.solidSvg(K.extrude(half(0, MAG.l / 2), CARD_Z, MAG.h, P), { tone: "hi" })));
      const tN = rot([MAG.l / 2 - 12, 0]), tS = rot([-MAG.l / 2 + 12, 0]);
      out.push(K.faceTextSvg(K.topMatrix([tN[0] - 3, tN[1] + 3.5], CARD_Z + MAG.h, P, "x"), "N", { size: 9, tone: "hi" }), K.faceTextSvg(K.topMatrix([tS[0] - 3, tS[1] + 3.5], CARD_Z + MAG.h, P, "x"), "S", { size: 9, tone: "hi" }));
    }
    return out.join("");
  }
  // A plotting compass: a short brass case, glass, and a needle (red end north) along the field there.
  function compassSvg(P, [x, y], dir) {
    const out = [ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 6, CARD_Z, 3, P, 32, 0.4), { tone: "hi" })), S(K.cylinder(x, y, 5, CARD_Z + 3, 0.1, P, 28), { tone: "lo", flat: true })];
    const a = Math.atan2(dir[1], dir[0]), tip = [x + Math.cos(a) * 4.2, y + Math.sin(a) * 4.2], tail = [x - Math.cos(a) * 4.2, y - Math.sin(a) * 4.2], z = CARD_Z + 3.2;
    out.push(`<path d="${K.pathOf([K.iso([x, y, z], P), K.iso([...tip, z], P)])}" stroke="#c0392b" stroke-width="1.6" stroke-linecap="round"/>`);
    out.push(`<path d="${K.pathOf([K.iso([x, y, z], P), K.iso([...tail, z], P)])}" stroke="#55575c" stroke-width="1.6" stroke-linecap="round"/>`, D([K.iso([x, y, z], P)], { size: 0.7, tone: "hi" }));
    return out.join("");
  }

  ISO.add({
    name: "magnet", title: "Magnet and its field", compare: "magnet 480 270 300",
    about: "A bar or horseshoe magnet on a card with iron filings and plotting compasses that point along the field.",
    line: "magnet cx cy length k=bar|horseshoe lines=1 lab=1",
    demo: { line: "magnet 480 270 320", script: [{ set: { spin: 0 }, hold: 1.5 }, { set: { spin: 90 }, hold: "settle" }, { set: { spin: 0 }, hold: "settle" }, { set: { k: "horseshoe" }, hold: 2 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.15;
      const { P, g } = ISO.frame([...K.boxCorners(CARD, -6, 12)], cx, cy, W, H, { azimuth: 55, elevation: 42 }, parent);
      const m = { k: o.k === "horseshoe" ? "horseshoe" : "bar", lines: o.lines !== "0" }, s = { a: 0, target: 0, needles: COMPASS.map(() => 0) };
      g.innerHTML = `<g>${S(K.slabOf({ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, d: CARD.d + 12, r: 5 }, -6, 6, P, 6, 1), { tone: "mid" })}${S(K.slabOf(CARD, 0, CARD_Z, P, 3), { tone: "hi", crease: "none" })}</g>` +
        `<g data-part="filings"></g><g data-part="magnet"></g><g data-part="compasses"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        const p = polesOf(m.k, s.a);
        // While the magnet turns, the filings are traced again only every 2° (and settle exactly at the end).
        const coarse = s.a === s.target ? s.a.toFixed(4) : (Math.round(s.a / 0.035) * 0.035).toFixed(3);
        w.rebuild(el.filings, `${m.k} ${coarse} ${m.lines}`, () => (m.lines ? filings(P, polesOf(m.k, +coarse)) : ""));
        w.rebuild(el.magnet, `${m.k} ${s.a.toFixed(2)}`, () => magnetSvg(P, m.k, +s.a.toFixed(2)));   // 0.01 rad steps
        w.rebuild(el.compasses, s.needles.map((v) => v.toFixed(2)).join(), () => COMPASS.map((c, i) => compassSvg(P, c, [Math.cos(s.needles[i]), Math.sin(s.needles[i])])).join(""));
        if (lab) w.rebuild(el.words, m.k, () => ISO.word(K.iso([0, CARD.y + CARD.d + 8, -6], P), m.k === "bar" ? "bar magnet · compasses point N → S" : "horseshoe magnet · field strongest between the poles", "#555", { size: 14, dy: 26 }));
      };
      g.set = (q) => {
        if (q.spin !== undefined) s.target = (+q.spin * Math.PI) / 180;
        if (q.k) m.k = q.k === "horseshoe" ? "horseshoe" : "bar";
        if (q.lines !== undefined) m.lines = !!+q.lines;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.a = ISO.follow(s.a, s.target, dt, 0.5, calm);
        const p = polesOf(m.k, s.a);
        let moving = s.a !== s.target;
        s.needles = s.needles.map((v, i) => {
          const f = field(COMPASS[i], p), want = Math.atan2(f[1], f[0]);
          let d = want - v; d = Math.atan2(Math.sin(d), Math.cos(d));
          if (Math.abs(d) > 1e-3) moving = true;
          return calm ? want : v + d * (1 - Math.exp(-dt / 0.15));
        });
        draw();
        return moving;
      };
      g.readout = () => `${m.k} magnet turned ${Math.round((s.a * 180) / Math.PI)}° · each compass needle lines up with the field there; red end points away from N, toward S`;
      g.update(10);
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
