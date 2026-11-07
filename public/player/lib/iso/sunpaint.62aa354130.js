// "sunpaint cx cy k shine=0..1" — the sun painted as a round disc with rays. shine=0 is a pale, weak sun with short
// rays; shine=1 a bright one with long rays and a glow around it.
(() => {
  const R = 120, N = 12;
  ISO.add({
    name: "sunpaint", title: "Sun", compare: null,
    about: "The sun painted as a round disc with rays. shine=0 a pale, weak sun with short rays; shine=1 a bright sun with long rays and a warm glow. Parts: disc rays glow.",
    line: "sunpaint cx cy k=0.2..1.5 shine=0..1",
    demo: { line: "sunpaint 480 270 0.75 shine=0.3", script: [{ set: {}, hold: 1 }, { set: { shine: 1 }, hold: "settle" }, { set: { shine: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(71);
      const g = P.base(parent, cx, cy, k);
      const glow = P.el("g", { "data-name": "glow" }, g), gl = P.layer(glow);
      for (let i = 0; i < 14; i++) { const a = (i / 14) * 2 * Math.PI; gl.dab(Math.cos(a) * 150, Math.sin(a) * 150, P.rr(60, 80), "#f7d77a", 0.18); } gl.dab(0, 0, 200, "#f9e3a0", 0.25); gl.done();
      const rays = P.el("g", { "data-name": "rays" }, g), rl = P.layer(rays); let ri = "";
      for (let i = 0; i < N; i++) { const a = (i / N) * 2 * Math.PI, L = i % 2 ? 230 : 275, w = 0.11, c = Math.cos(a), s = Math.sin(a);
        const p1 = [Math.cos(a - w) * 148, Math.sin(a - w) * 148], p2 = [Math.cos(a + w) * 148, Math.sin(a + w) * 148], tip = [c * L, s * L];
        const d = `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z`;
        P.el("path", { d, fill: "#eba530" }, rays); rl.stroke(c * 154, s * 154, c * (L - 30), s * (L - 30), 9, "#ffe08a", 0.7); ri += d; }
      rl.done(); P.ink(ri, rays, 2.8, false);
      const D = `M${-R} 0A${R} ${R} 0 1 0 ${R} 0A${R} ${R} 0 1 0 ${-R} 0Z`, disc = P.el("g", { "data-name": "disc" }, g), cl = P.clip(disc, D);
      P.brush("cotton", disc, cl, [-R, R, -R, R], "#e2a43c");
      const hot = P.el("g", { "clip-path": `url(#${cl})` }, disc), hl = P.layer(hot);
      hl.dab(0, 0, R + 10, "#ffd24a", 1); for (let i = 0; i < 18; i++) { const a = P.rr(0, 6.28), r = P.rr(0, 90); hl.stroke(Math.cos(a) * r - 30, Math.sin(a) * r, Math.cos(a) * r + 30, Math.sin(a) * r + P.rr(-10, 10), P.rr(12, 22), P.pick(["#ffe58a", "#f6b93b", "#ffd24a"]), 0.7, P.rr(-8, 8)); }
      hl.stroke(-60, -50, 10, -86, 16, "#fff3c4", 0.8, -10); hl.done();
      P.ink(D, disc, 3.6);
      const st = { shine: ISO.clamp(o.shine === undefined ? 1 : +o.shine || 0, 0, 1) }; let v = st.shine;
      const paint = () => { const s = (0.72 + 0.32 * v).toFixed(3); rays.setAttribute("transform", `scale(${s})`); rays.setAttribute("opacity", (0.4 + 0.6 * v).toFixed(3)); glow.setAttribute("opacity", v.toFixed(3)); hot.setAttribute("opacity", (0.15 + 0.85 * v).toFixed(3)); };
      paint();
      g.set = (p) => { if (p.shine !== undefined) st.shine = ISO.clamp(+p.shine || 0, 0, 1); };
      g.update = (dt) => { v = ISO.still() ? st.shine : ISO.follow(v, st.shine, dt, 0.4); if (Math.abs(v - st.shine) < 0.003) v = st.shine; paint(); return v !== st.shine; };
      g.readout = () => `sun shining at ${Math.round(st.shine * 100)}%`;
      return g;
    },
  });
})();
