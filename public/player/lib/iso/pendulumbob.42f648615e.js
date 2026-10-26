// "pendulumbob cx cy k line=5..200 swing=-30..30 lab=0 lit=bob|hook|line" — a PART (PARTS.md, batch 5): the brass bob
// of pendulum.js on its own thread, real size: a polished brass sphere Ø 2.5 cm (about 70 g) with a threaded brass
// stem and a small steel hook on top that the thread ties to. It hangs, so the origin is the hanging point (a
// pendulumclamp's `pivot`, a retortstand's `clamp`); line = the length L from there to the bob's centre (cm, default
// 50). swing = the angle it is let go from (deg): it swings along x at its true period T = 2π√(L/g), with a little air
// drag; swing=0 brings it back to rest. set({ swing, line }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), g9 = 981, R = 1.25, STEM = 0.35;
  const COTTON = { ink: "#6b5a3a", body: "#e9dfc8", shine: "#fffaf0" };
  const rad = (d) => (d * Math.PI) / 180;

  ISO.add({
    name: "pendulumbob", title: "Brass pendulum bob (part)", compare: null,
    about: "A 2.5 cm brass pendulum bob on a cotton thread from its hanging point; it swings at its true period T = 2π√(L/g), whatever its mass. anchors: top bob",
    line: "pendulumbob cx cy k line=5..200 swing=-30..30 lab=0 lit=bob|hook|line",
    demo: { line: "pendulumbob 480 130 26 line=12", script: [{ set: {}, hold: 1 }, { set: { swing: 20, lit: "bob" }, hold: 4 }, { set: { swing: 0, lit: "line" }, hold: "settle" }, { set: { line: 8, lit: "hook" }, hold: 1 }, { set: { swing: -15, lit: "" }, hold: 3 }] },
    make([cx = 480, cy = 130, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const st = { line: ISO.clamp(ISO.num(o, "line", 50), 5, 200), lit: o.lit || "" };
      const s = { A: rad(ISO.clamp(ISO.num(o, "swing", 0), -30, 30)), th: 0, t: 0, back: false };
      s.th = s.A;
      g.innerHTML = `<g data-part="body"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      const pose = () => { const a = [-Math.sin(s.th), 0, Math.cos(s.th)]; return { c: [st.line * Math.sin(s.th), 0, -st.line * Math.cos(s.th)], a }; };
      const bodySvg = () => {
        const { c, a } = pose(), at = (k2) => c.map((v, i) => v + a[i] * k2), out = [];
        const Fs = G.frameOf(at(R - 0.08), a, [0, 1, 0], G.unit3([a[2], 0, -a[0]]));
        // the hook: a ring of wire in the y–z plane (square to the swing) on top of the stem
        const rr = 0.13, ring = []; for (let i = 0; i <= 24; i++) { const q = (i / 24) * Math.PI * 2; ring.push(G.pointOf(Fs, STEM + rr + Math.cos(q) * rr, Math.sin(q) * rr, 0)); }
        const top = G.pointOf(Fs, STEM + 2 * rr, 0, 0);
        out.push(`<g data-name="line">${PHYS.wire(P, PHYS.path(P, [[0, 0, 0], top]), 0.03, COTTON)}</g>`);
        out.push(`<g data-name="bob">${ISO.tinted(ISO.T.brass, S(G.sphereOf(c, R, P), { tone: "hi", lit: true }))}`);
        const hi = K.iso(c.map((v, i) => v + [-0.35, 0.25, 0.5][i] * R), P), px = R * G.scaleOf(P);
        out.push(`<ellipse cx="${hi[0].toFixed(1)}" cy="${hi[1].toFixed(1)}" rx="${(px * 0.2).toFixed(2)}" ry="${(px * 0.12).toFixed(2)}" fill="#fffbe9" opacity=".8" transform="rotate(-30 ${hi[0].toFixed(1)} ${hi[1].toFixed(1)})"/></g>`);
        out.push(`<g data-name="hook">${ISO.tinted(ISO.T.brass, S(G.disc(0, 0.12, 0.3, Fs, P), { tone: "mid" }) + S(G.disc(0.1, STEM, 0.12, Fs, P), { tone: "hi" }))}` +
          PHYS.wire(P, PHYS.path(P, ring), 0.03, { ink: "#3c3f45", body: "#b6b9be", shine: "#eef0f2" }) + `</g>`);
        return out.join("");
      };
      const draw = () => {
        const key = `${st.line} ${s.th.toFixed(4)}`, { c, a } = pose();
        w.rebuild(el.body, key, bodySvg);
        g.anchors = { top: [0, 0, 0], bob: c.map((v) => +v.toFixed(3)) };
        if (lab) w.rebuild(el.words, key, () => LAB.word(P, lab, [c[0] + R + 0.4, c[1], c[2]], `bob, L = ${st.line} cm`, "#445", { anchor: "start" }));
        B21.light(w, g, st.lit);
      };
      g.set = (p) => {
        const fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
        if (fin(p.line)) { const L = ISO.clamp(+p.line, 5, 200); if (L !== st.line) { st.line = L; s.th = 0; s.A = 0; s.back = false; } }
        if (fin(p.swing)) { const A = rad(ISO.clamp(+p.swing, -30, 30)); if (A) { s.A = A; s.th = A; s.t = 0; s.back = false; } else { s.A = 0; s.back = s.th !== 0; } }
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1;
        let moving = false;
        if (s.A && !calm) {
          const wn = Math.sqrt(g9 / st.line);
          s.t += dt; s.th = s.A * Math.cos(wn * s.t) * Math.exp(-0.02 * s.t);
          if (Math.abs(s.A) * Math.exp(-0.02 * s.t) < 0.002) { s.A = 0; s.th = 0; }
          moving = !!s.A;
        } else if (s.A && calm) s.th = s.A;
        else if (s.back) { s.th = ISO.follow(s.th, 0, dt, 0.3, calm); if (s.th === 0) s.back = false; moving = s.back; }
        draw();
        return moving;
      };
      g.readout = () => `brass bob Ø 2.5 cm, about 70 g · L = ${st.line} cm: T = 2π√(L/g) = ${(2 * Math.PI * Math.sqrt(st.line / g9)).toFixed(2)} s · now ${((s.th * 180) / Math.PI).toFixed(0)}° from the vertical`;
      draw();
      return g;
    },
  });
})();
