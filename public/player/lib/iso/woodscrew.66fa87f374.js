// "woodscrew cx cy k aim=wall|down|up in=0..1 lab=0 lit=screw" — a PART (PARTS.md): a 5 cm (#8, 4.2 mm) wood screw,
// its origin the entry point on the surface it goes into. A gimlet point, a coarse thread (2.3 mm a turn) over the
// first 3.3 cm that tapers out of the point, a smooth shank, a countersunk head with a Phillips (cross) recess.
// in=0: sticking out its whole length, its point on the surface; in=1: driven home, the head flush. set({ in }) turns
// it in (the cross turns with it: about 22 turns for the full length). aim: wall = into the wall (−y), down, up.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const LEN = 5, R = 0.21, RM = 0.145, PITCH = 0.23, THREAD = 3.3, SHANK = 0.2, HEAD_R = 0.41, HEAD_H = 0.34, PROUD = 0.05;
  const TRAVEL = LEN - PROUD, AIM = { wall: [0, -1, 0], down: [0, 0, -1], up: [0, 0, 1] };
  const DARK = "#2e3136";
  // the turned profile from the point (s = 0) to the head's top (s = LEN): [s, r]
  const PROFILE = (() => {
    const p = [[0, 0.012]], taper = (s) => Math.min(1, s / 0.75);
    for (let s = 0.04; s + PITCH <= THREAD; s += PITCH) p.push([s + PITCH * 0.55, Math.max(0.03, R * taper(s + PITCH * 0.55))], [s + PITCH, Math.max(0.02, RM * taper(s + PITCH))]);
    const t = p.at(-1)[0];
    p.push([t + 0.12, SHANK], [LEN - HEAD_H, SHANK], [LEN - 0.05, HEAD_R], [LEN, HEAD_R - 0.025]);
    return p;
  })();
  // the part of the profile from s = c on (what is still out of the surface)
  const outOf = (c) => {
    const i = PROFILE.findIndex(([s]) => s > c);
    if (i <= 0) return i === 0 ? PROFILE : null;
    const [s0, r0] = PROFILE[i - 1], [s1, r1] = PROFILE[i], f = (c - s0) / (s1 - s0 || 1);
    return [[c, r0 + (r1 - r0) * f], ...PROFILE.slice(i)];
  };
  const frameOf = (aim, travel) => { const dir = AIM[aim] || AIM.wall; return G.frameAlong(dir.map((v) => v * travel), dir.map((v) => -v)); };
  function bodySvg(P, aim, travel) {
    const prof = outOf(travel);
    return prof ? ISO.tinted(ISO.T.steel, S(G.solidOf(prof, frameOf(aim, travel), P, { steps: 28 }), { tone: "hi" })) : "";
  }
  function crossSvg(P, aim, travel) {
    const F = frameOf(aim, travel), back = F.a, out = [];
    // the Phillips recess on the head's top, turned with the screw: a filled cross, seen only when the top faces us
    const d0 = K.depthOf([0, 0, 0], P), view = [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0];
    if (back[0] * view[0] + back[1] * view[1] + back[2] * view[2] > 0.05) {
      const phi = (travel / PITCH) * 2 * Math.PI, at = (u, v) => K.iso(F.o.map((o, i) => o + F.a[i] * (LEN + 0.002) + F.u[i] * u + F.v[i] * v), P);
      const pts = [];
      for (let k = 0; k < 4; k++) {
        const a = phi + (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a), rot = (x, y) => at(x * c - y * s, x * s + y * c);
        pts.push(rot(0.06, -0.05), rot(0.27, -0.045), rot(0.27, 0.045), rot(0.06, 0.05));
      }
      out.push(`<path d="${K.pathOf(pts, true)}" fill="${DARK}" fill-opacity=".85" stroke="none"/>`);
      const c = at(0, 0);
      out.push(`<circle cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="${(G.scaleOf(P) * 0.05).toFixed(2)}" fill="#14161a"/>`);
    }
    return out.join("");
  }
  ISO.add({
    name: "woodscrew", title: "Wood screw (part)", compare: null,
    about: "A 5 cm wood screw: gimlet point, coarse thread, smooth shank, countersunk head with a cross (Phillips) recess; in=0 its point on the surface, in=1 driven home; set({ in }) turns it in. anchors: head",
    line: "woodscrew cx cy k aim=wall|down|up in=0..1 lab=0 lit=screw",
    demo: { line: "woodscrew 470 400 52 aim=down", script: [{ set: {}, hold: 1 }, { set: { in: 0.5 }, hold: "settle" }, { set: { in: 1 }, hold: "settle" }, { set: { in: 0, lit: "screw" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = AIM[o.aim] ? o.aim : "wall", dir = AIM[aim];
      g.innerHTML = `<g data-name="screw"><g data-part="body"></g><g data-part="cross"></g></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"],[data-name="${n}"]`), el = { screw: q("screw"), body: q("body"), cross: q("cross"), words: q("words") }, w = ISO.writer();
      const s = { f: ISO.clamp(ISO.num(o, "in", 0), 0, 1) }, goal = { f: s.f };
      let lit = o.lit || "";
      const out = () => LEN - s.f * TRAVEL;
      const draw = () => {
        // the turned body is rebuilt every 1.25 mm of travel and slid along between (a lathe a frame is too slow);
        // the cross is cheap and follows the true turn
        const tr = s.f * TRAVEL, q5 = Math.floor(tr * 8) / 8;
        w.rebuild(el.body, q5.toFixed(3), () => bodySvg(P, aim, q5));
        w.attr(el.body, "transform", K.translateAlong(P, dir.map((v) => v * (tr - q5))));
        w.rebuild(el.cross, tr.toFixed(4), () => crossSvg(P, aim, tr));
        w.rebuild(el.words, lab ? "1" : "", () => (lab ? ISO.word(K.iso(dir.map((v) => -v * (out() + 0.6)), P), "wood screw", "#444", { size: 13, dy: -6 }) : ""));
        g.anchors.head = dir.map((v) => -v * out());
        w.light([el.screw], lit === "screw" ? [el.screw] : []);
      };
      g.set = (p) => { if (p.in !== undefined) goal.f = ISO.clamp(+p.in, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      // a driver sinks it at about 2 turns a second: 4.6 mm/s, so the whole length takes about 10 s; shown 4× faster
      g.update = (dt) => {
        const st = dt * 1.84 / TRAVEL;
        s.f = ISO.still() || Math.abs(goal.f - s.f) <= st ? goal.f : s.f + Math.sign(goal.f - s.f) * st;
        draw();
        return s.f !== goal.f;
      };
      g.readout = () => `wood screw 5 cm · ${out().toFixed(1)} cm still out · ${((s.f * TRAVEL) / PITCH).toFixed(0)} of ${Math.round(TRAVEL / PITCH)} turns · 2.3 mm a turn`;
      draw();
      return g;
    },
  });
})();
