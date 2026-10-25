// "coilspring cx cy k len=4..20 n=0..6 kn=5..50 lab=0 lit=spring|hanger|masses" — a PART (PARTS.md, batch 3): a
// steel helical spring (coil Ø 16 mm, wire Ø 1.2 mm) hanging from its top loop, origin the inside of that loop's crown
// (the hook point: place it at= a retortstand `clamp`). Natural length len cm from that point to the inside of the
// bottom loop, where a slotted-mass hanger hangs with n 100 g masses (the hanger's own mass not counted). The spring
// carries its hanger and masses itself, since a part placed at= another does not follow it.
// Physics: load F = n × 0.98 N, extension x = F / kn (kn in N/m), reached as a real damped spring does: ω = √(kn / m),
// damping ratio 0.5 (a small bounce, about 16 % past its rest point). Drawn up to 4 × len (past that the readout says it is overstretched).
// set({ n, kn }). Built in mm with PHYS (recipes/_phys.js); the coil is cached per visible step of its length.
(() => {
  const K = window.K;
  const R = 8, WR = 0.6, PITCH = 2, ZETA = 0.5, GAP = 1.5, G9 = 9.8;
  ISO.add({
    name: "coilspring", title: "Coil spring with masses (part)", compare: null,
    about: "A steel coil spring hanging from a clamp with a slotted-mass hanger on it: each 100 g stretches it by 0.98 N ÷ k, and it bounces a little into place. anchors: top",
    line: "coilspring cx cy k len=4..20 n=0..6 kn=5..50 lab=0 lit=spring|hanger|masses",
    demo: { line: "coilspring 480 60 12 len=8 n=0 kn=20", script: [{ set: { n: 1 }, hold: "settle" }, { set: { n: 3, lit: "masses" }, hold: "settle" }, { set: { kn: 40, lit: "spring" }, hold: "settle" }, { set: { n: 0, kn: 20, lit: "hanger" }, hold: "settle" }] },
    make([cx = 480, cy = 70, k = 3], o, t, parent) {
      const LAB = window.LAB, PHYS = window.PHYS;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const len = ISO.clamp(ISO.num(o, "len", 10), 4, 20) * 10, body = len - 2 * (2 * R - WR + GAP), turns = Math.max(2, Math.round(body / PITCH));
      const m = { n: ISO.clamp(Math.round(ISO.num(o, "n", 0)), 0, 6), kn: ISO.clamp(ISO.num(o, "kn", 20), 5, 50) };
      const rest = () => (m.n * 0.1 * G9) / m.kn, limit = (4 * len) / 1000;
      const s = { x: Math.min(rest(), limit), v: 0 };
      let lit = o.lit || "", relight = true;
      const zc = -(R - WR), zTop = zc - R - GAP, step = 5 / Math.max(0.2, k);   // half a board px, in mm
      // the top loop: the last coil turned up into a circle in the y–z plane, rising from the coil's edge
      const loop = (zo, dir) => { const pts = [[0, R, zo - dir * (R + GAP)], [0, R, zo]]; for (let j = 0; j <= 30; j++) { const a = (j / 30) * Math.PI * 1.9; pts.push([0, R * Math.cos(a), zo + dir * R * Math.sin(a)]); } return PHYS.path(Pm, pts); };
      const coil = (xmm) => {
        const zH = -(len + xmm), zb = zH + R - WR, zBot = zb + R + GAP, h = PHYS.helix(Pm, 0, 0, zTop, zBot, R, turns, 20, Math.PI / 2);
        return PHYS.wire(Pm, h.back, WR, { ink: "#2e3237", body: "#7d8187", shine: "#b9bcc1" }) + PHYS.wire(Pm, loop(zc, 1), WR) + PHYS.wire(Pm, loop(zb, -1), WR) + PHYS.wire(Pm, h.front, WR);
      };
      const cache = new Map();
      const coilAt = (q) => { let c = cache.get(q); if (!c) { if (cache.size > 600) cache.clear(); cache.set(q, (c = coil(q * step))); } return c; };
      // the hanger at the spring's unstretched bottom (moved down by a translate as it stretches), a pointer on its rod
      const hang = () => {
        const z0 = -len - PHYS.HANG, hz = z0 + PHYS.HANG - 2 * 7 + 2.5 - 4, h = PHYS.hanger(Pm, [0, 0, z0], m.n);
        const ptr = PHYS.wire(Pm, PHYS.path(Pm, [[2.5, 0, hz], [30, 0, hz]]), 0.5) + `<path d="${PHYS.path(Pm, [[26, 0, hz], [30, 0, hz]])}" stroke="#c0392b" stroke-width="${(K.screenRise(1, Pm) * 1.4).toFixed(2)}" stroke-linecap="round"/>`;
        return `<g data-name="hanger">${h.base}</g><g data-name="masses">${h.masses}</g><g data-name="hanger">${h.rod}${ptr}</g>` +
          (lab ? LAB.word(Pm, lab, [-26, 0, z0 + 4], `${m.n * 100} g`, "#2b6cc4", { anchor: "end", size: 14 }) : "");
      };
      g.innerHTML = `<g data-name="spring" data-part="coil"></g><g data-part="hang"></g><g data-part="words">${lab ? LAB.word(Pm, lab, [0, R + 8, zTop - 10], "spring", "#556", { anchor: "end" }) : ""}</g>`;
      g.anchors = { top: [0, 0, 0] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round((Math.min(s.x, limit) * 1000) / step);
        w.rebuild(el.coil, String(q), () => coilAt(q));
        w.rebuild(el.hang, `${m.n}`, () => { relight = true; return hang(); });
        w.attr(el.hang, "transform", K.translateAlong(Pm, [0, 0, -q * step]));
        if (relight) { relight = false; LAB.light(w, g, lit); }
      };
      g.set = (p) => {
        if (p.n !== undefined) m.n = ISO.clamp(Math.round(+p.n), 0, 6);
        if (p.kn !== undefined) m.kn = ISO.clamp(+p.kn, 5, 50);
        if (p.lit !== undefined) { lit = p.lit; relight = true; }
      };
      g.update = (dt) => {
        const mass = m.n * 0.1, moving = PHYS.bounce(s, rest(), dt, mass > 0 ? Math.sqrt(m.kn / mass) : 0, ZETA);
        draw();
        return moving;
      };
      g.readout = () => {
        const F = m.n * 0.1 * G9, x = rest(), over = x > limit;
        return `${m.n * 100} g · load ${F.toFixed(2)} N · extension ${(Math.min(s.x, limit) * 100).toFixed(1)} cm (x = F ÷ k, k = ${m.kn} N/m)${over ? ` · overstretched: F ÷ k = ${(x * 100).toFixed(0)} cm` : ""}`;
      };
      draw();
      return g;
    },
  });
})();
