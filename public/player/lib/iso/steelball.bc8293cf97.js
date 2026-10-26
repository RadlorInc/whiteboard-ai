// "steelball cx cy k d=1..5 line=0..100 span=0..20 swing=-40..40 z=0..200 eye=0|1 lab=0 lit=ball|eye|line" — a PART
// (PARTS.md, batch 5): a polished steel ball (cradle, freefall, projectile), 2.5 cm by default, 7.85 g/cm³.
// line=0: it rests on a surface, its origin the surface point under it; z = the height of its bottom above that point
// (held by a magnet, a hand): set z lower and it falls under real gravity (g = 981 cm/s², it stops dead where it lands,
// as in a sand tray); set it higher and it is lifted, eased. line>0: it hangs, its origin the hanging point; `line` =
// the pendulum length to the ball's centre; span>0 hangs it on two threads from two points span cm apart along y
// (as in Newton's cradle, so it swings only along x). swing = the angle it is let go from: it swings at its true
// period T = 2π√(L/g) with a little air drag; swing=0 brings it back to rest. eye=1: a screw eye on top (the threads tie
// to it). set({ swing, z, line, span, d, eye }). The swing and the fall redraw only the ball's own group. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), g9 = 981;
  const NYLON = { ink: "#7d848c", body: "#eef1f4", shine: "#ffffff" };
  const rad = (d) => (d * Math.PI) / 180;

  ISO.add({
    name: "steelball", title: "Steel ball (part)", compare: null,
    about: "A polished steel ball: rests on a surface and falls under real gravity when its height z drops, or hangs on a line (two threads with span) and swings at its true period T = 2π√(L/g). anchors: top bottom",
    line: "steelball cx cy k d=1..5 line=0..100 span=0..20 swing=-40..40 z=0..200 eye=0|1 lab=0 lit=ball|eye|line",
    demo: { line: "steelball 480 190 26 line=6 span=4 eye=1", script: [{ set: {}, hold: 1 }, { set: { swing: 25, lit: "ball" }, hold: 4 }, { set: { swing: 0, lit: "line" }, hold: "settle" }, { set: { line: 0, z: 4, lit: "eye" }, hold: "settle" }, { set: { z: 0, lit: "" }, hold: "settle" }, { set: { d: 4, eye: 0, span: 0 }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { d: ISO.clamp(ISO.num(o, "d", 2.5), 1, 5), line: ISO.clamp(ISO.num(o, "line", 0), 0, 100), span: ISO.clamp(ISO.num(o, "span", 0), 0, 20), eye: o.eye === "1", lit: o.lit || "" };
      const s = { A: rad(ISO.clamp(ISO.num(o, "swing", 0), -40, 40)), th: 0, t: 0, back: false, z: ISO.clamp(ISO.num(o, "z", 0), 0, 200), zT: 0, v: 0 };
      s.th = s.A; s.zT = s.z;
      g.innerHTML = `<g data-part="shadow"></g><g data-part="body"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const R = () => st.d / 2, EYE = () => (st.eye ? 0.15 + R() * 0.28 : 0);   // shank + ring height
      // the ball's pose: centre and its up axis (hanging: tilted by th about the y axis through the origin)
      const pose = () => {
        if (st.line > 0) { const L = Math.max(st.line, R() + 0.5), a = [-Math.sin(s.th), 0, Math.cos(s.th)]; return { c: [L * Math.sin(s.th), 0, -L * Math.cos(s.th)], a }; }
        return { c: [0, 0, s.z + R()], a: [0, 0, 1] };
      };
      const bodySvg = () => {
        const r = R(), { c, a } = pose(), out = [], at = (k2) => c.map((v, i) => v + a[i] * k2);
        const top = at(r + EYE());
        // the threads: from the hanging point(s) to the eye (or the ball's top); the far thread first
        const tops = st.line > 0 ? (st.span > 0 ? [[0, -st.span / 2, 0], [0, st.span / 2, 0]] : [[0, 0, 0]]) : [];
        const thread = (p) => PHYS.wire(P, PHYS.path(P, [p, top]), 0.03, NYLON);
        if (tops.length === 2) out.push(`<g data-name="line">${thread(tops[0])}</g>`);
        out.push(`<g data-name="ball">${ISO.tinted(ISO.T.steel, S(G.sphereOf(c, r, P), { tone: "hi", lit: true }))}`);
        // the polish: a small bright window highlight up and toward the light, and the bench's dark reflection low down
        const hi = K.iso(c.map((v, i) => v + [-0.35, 0.25, 0.5][i] * r), P), lo = K.iso(c.map((v, i) => v + [0.2, 0.55, -0.62][i] * r), P), px = r * G.scaleOf(P);
        out.push(`<ellipse cx="${hi[0].toFixed(1)}" cy="${hi[1].toFixed(1)}" rx="${(px * 0.22).toFixed(2)}" ry="${(px * 0.14).toFixed(2)}" fill="#fff" opacity=".85" transform="rotate(-30 ${hi[0].toFixed(1)} ${hi[1].toFixed(1)})"/>` +
          `<ellipse cx="${lo[0].toFixed(1)}" cy="${lo[1].toFixed(1)}" rx="${(px * 0.42).toFixed(2)}" ry="${(px * 0.12).toFixed(2)}" fill="#5f646b" opacity=".35"/></g>`);
        if (st.eye) {
          // a threaded shank screwed into the top and a ring in the y–z plane (square to the swing) for the threads
          const Fs = G.frameOf(at(r - 0.05), a, [0, 1, 0], G.unit3([a[2], 0, -a[0]]));
          const rr = r * 0.14, ring = []; for (let i = 0; i <= 24; i++) { const q = (i / 24) * Math.PI * 2; ring.push(G.pointOf(Fs, 0.2 + rr + Math.cos(q) * rr, Math.sin(q) * rr, 0)); }
          out.push(`<g data-name="eye">${ISO.tinted(ISO.T.steel, S(G.disc(0, 0.2, Math.max(0.05, r * 0.06), Fs, P), { tone: "mid" }) + S(G.disc(0, 0.04, r * 0.1, Fs, P), { tone: "lo" }))}${PHYS.wire(P, PHYS.path(P, ring), Math.max(0.025, r * 0.025), { ink: "#3c3f45", body: "#b6b9be", shine: "#eef0f2" })}</g>`);
        }
        if (tops.length) out.push(`<g data-name="line">${thread(tops.at(-1))}</g>`);
        return out.join("");
      };
      const draw = () => {
        const key = `${st.d} ${st.line} ${st.span} ${st.eye} ${s.th.toFixed(4)} ${s.z.toFixed(2)}`;
        w.rebuild(el.body, key, bodySvg);
        // a soft contact shadow on the surface while it rests on one, fading as it rises
        w.rebuild(el.shadow, st.line > 0 ? "none" : `${st.d} ${s.z.toFixed(1)}`, () => {
          if (st.line > 0) return "";
          const r = R(), op = ISO.clamp(0.28 - s.z * 0.012, 0.04, 0.28), sp = 1 + s.z * 0.04, pts = [];
          for (let i = 0; i < 32; i++) { const q = (i / 32) * Math.PI * 2; pts.push(K.iso([Math.cos(q) * r * 0.8 * sp, Math.sin(q) * r * 0.8 * sp, 0], P)); }
          return `<path d="${K.pathOf(pts, true)}" fill="#3a3e44" opacity="${op.toFixed(2)}"/>`;
        });
        const { c, a } = pose(), r = R();
        g.anchors = { top: c.map((v, i) => +(v + a[i] * (r + EYE())).toFixed(3)), bottom: c.map((v, i) => +(v - a[i] * r).toFixed(3)) };
        if (lab) w.rebuild(el.words, key, () => CIRC.word(P, [c[0] + r, c[1], c[2] + r * 0.4], `steel ball ${st.d} cm`));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        const fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
        if (fin(p.d)) st.d = ISO.clamp(+p.d, 1, 5);
        if (fin(p.line)) { const L = ISO.clamp(+p.line, 0, 100); if (L !== st.line) { st.line = L; s.th = 0; s.A = 0; s.back = false; } }
        if (fin(p.span)) st.span = ISO.clamp(+p.span, 0, 20);
        if (p.eye !== undefined) st.eye = String(p.eye) === "1";
        if (fin(p.swing)) { const A = rad(ISO.clamp(+p.swing, -40, 40)); if (A) { s.A = A; s.th = A; s.t = 0; s.back = false; } else { s.A = 0; s.back = s.th !== 0; } }
        if (fin(p.z)) { s.zT = ISO.clamp(+p.z, 0, 200); if (s.zT > s.z) s.v = 0; }
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1;
        let moving = false;
        if (st.line > 0) {
          if (s.A && !calm) {
            // let go from A: θ = A cos(ωt) with a little air drag; it settles after about a minute, so stop when tiny
            const wn = Math.sqrt(g9 / Math.max(st.line, R() + 0.5));
            s.t += dt; s.th = s.A * Math.cos(wn * s.t) * Math.exp(-0.03 * s.t);
            if (Math.abs(s.A) * Math.exp(-0.03 * s.t) < 0.002) { s.A = 0; s.th = 0; }
            moving = !!s.A;
          } else if (s.A && calm) s.th = s.A;
          else if (s.back) { s.th = ISO.follow(s.th, 0, dt, 0.3, calm); if (s.th === 0) s.back = false; moving = s.back; }
        } else if (s.z !== s.zT) {
          if (calm) { s.z = s.zT; s.v = 0; }
          else if (s.zT < s.z) { s.v += g9 * dt; s.z = Math.max(s.zT, s.z - s.v * dt); if (s.z === s.zT) s.v = 0; }   // a real fall, from rest
          else { s.z = ISO.follow(s.z, s.zT, dt, 0.3, false); s.v = 0; }
          moving = s.z !== s.zT;
        }
        draw();
        return moving;
      };
      g.readout = () => {
        const r = R(), m = 7.85 * (4 / 3) * Math.PI * r ** 3, head = `steel ball ${st.d} cm · ${m.toFixed(0)} g`;
        if (st.line > 0) { const L = Math.max(st.line, r + 0.5), T = 2 * Math.PI * Math.sqrt(L / g9); return `${head} · on a ${L} cm line: T = 2π√(L/g) = ${T.toFixed(2)} s · now ${((s.th * 180) / Math.PI).toFixed(0)}° from the vertical`; }
        return `${head} · ${s.z.toFixed(1)} cm up${s.v ? ` · falling at ${(s.v / 100).toFixed(2)} m/s (v = gt)` : ""}${s.zT < s.z ? ` · lands in ${(Math.sqrt((2 * (s.z - s.zT)) / g9 + (s.v / g9) ** 2) - s.v / g9).toFixed(2)} s` : ""}`;
      };
      draw();
      return g;
    },
  });
})();
