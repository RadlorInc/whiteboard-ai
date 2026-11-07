// "sunglasses cx cy k polar=0..1" — a pair of sunglasses on the table, the sun, and a wet road. Sunlight shakes every
// way (crossed marks); bouncing off the flat wet road it comes away shaking mostly side to side (flat marks): glare.
// A polarized lens has very fine up-and-down lines that only let up-and-down shaking through, so the glare stops at
// the lens. polar=0 a plain tinted lens: the glare goes through. polar=1 polarized: blocked.
(() => {
  const F = { class: "free", "data-free": "1" };
  const SUN = [-280, -190], HIT = [-185, 150], LENS = [90, -20];
  const LENSD = (x) => `M${x - 68} -62 Q${x} -70 ${x + 68} -62 Q${x + 74} -10 ${x + 50} 22 Q${x} 40 ${x - 50} 22 Q${x - 74} -10 ${x - 68} -62 Z`;
  ISO.add({
    name: "sunglasses", title: "Polarized sunglasses", compare: null,
    about: "Sunglasses on the table, the sun and a wet road. Sunlight shakes every way (crossed marks); off the flat wet road it shakes mostly side to side (flat marks): that is glare. polar=1: the lens's fine up-and-down lines block the side-to-side glare, it stops at the lens. polar=0: a plain tinted lens, the glare goes through. Parts: sun, road, glare, lens, frame.",
    line: "sunglasses cx cy k=0.2..1.5 polar=0..1",
    demo: { line: "sunglasses 480 270 0.72 polar=0", script: [{ set: { polar: 0 }, hold: 1.5 }, { set: { polar: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(131);
      const g = P.base(parent, cx, cy, k);
      // the sun
      const sun = P.el("g", { "data-name": "sun" }, g), sl = P.layer(sun);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; sl.stroke(SUN[0] + Math.cos(a) * 46, SUN[1] + Math.sin(a) * 46, SUN[0] + Math.cos(a) * 66, SUN[1] + Math.sin(a) * 66, 6, "#e9b93a", 0.9); }
      sl.dab(SUN[0], SUN[1], 36, "#f2c84b"); sl.dab(SUN[0] - 8, SUN[1] - 8, 18, "#f8dc80", 0.8); sl.done();
      P.el("circle", { cx: SUN[0], cy: SUN[1], r: 36, fill: "none", stroke: P.INK, "stroke-width": 2.6 }, sun);
      // the wet road: dark, with a bright puddle sheen
      const road = P.el("g", { "data-name": "road" }, g), rd = "M-330 210 L-40 210 L-110 100 L-290 100 Z";
      const rc = P.clip(road, rd), ra = P.layer(road, rc); P.el("path", { d: rd, fill: "#4f545c" }, ra.g);
      for (let i = 0; i < 10; i++) { const y = P.rr(100, 210); ra.stroke(-340, y, -40, y + P.rr(-4, 4), P.rr(8, 18), P.pick(["#5d636c", "#454950"]), 0.8); }
      ra.stroke(-250, 140, -130, 142, 16, "#aebfcf", 0.75, 3); ra.stroke(-230, 160, -150, 162, 8, "#dfe8ef", 0.8, 2); ra.stroke(-280, 185, -200, 188, 10, "#9fb2c4", 0.6, -2);
      ra.done(); P.ink(rd, road, 3);
      P.el("path", { d: "M-205 205 L-200 180 M-195 150 L-192 130 M-188 115 L-186 104", stroke: "#e8d78a", "stroke-width": 5, "stroke-linecap": "round", ...F }, road);
      // the rays: sun to road (shaking every way), road to lens (side to side), and on past the lens
      const ray = (a, b, par) => P.el("path", { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, stroke: "#e39a22", "stroke-width": 4.5, "stroke-linecap": "round", ...F }, par);
      const marks = (a, b, every, cross) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); let d = ""; for (let s = every; s < L - every / 2; s += every) { const x = a[0] + ((b[0] - a[0]) * s) / L, y = a[1] + ((b[1] - a[1]) * s) / L; d += `M${(x - 11).toFixed(1)} ${y.toFixed(1)}h22`; if (cross) d += `M${x.toFixed(1)} ${(y - 11).toFixed(1)}v22`; } return d; };
      const glare = P.el("g", { "data-name": "glare" }, g), S0 = [SUN[0] + 20, SUN[1] + 40];
      ray(S0, HIT, glare); P.el("path", { d: marks(S0, HIT, 44, true), stroke: "#b8741a", "stroke-width": 3, "stroke-linecap": "round", ...F }, glare);
      ray(HIT, LENS, glare); P.el("path", { d: marks(HIT, LENS, 40, false), stroke: "#b8741a", "stroke-width": 3, "stroke-linecap": "round", ...F }, glare);
      const dir = [LENS[0] - HIT[0], LENS[1] - HIT[1]], dl = Math.hypot(dir[0], dir[1]), END = [LENS[0] + (dir[0] / dl) * 200, LENS[1] + (dir[1] / dl) * 200];
      // the sunglasses: frame, two lenses, arms folded back
      const frame = P.el("g", { "data-name": "frame" }, g);
      P.el("path", { d: "M14 -50 L-8 -36 M326 -50 L348 -36", stroke: P.INK, "stroke-width": 10, "stroke-linecap": "round", ...F }, frame);
      const lines = [];
      for (const x of [90, 250]) {
        const d = LENSD(x), lc = P.clip(frame, d), la = P.layer(frame, lc), lens = P.el("g", { "data-name": "lens" }, frame);
        P.el("path", { d, fill: "#4a4038", opacity: 0.88 }, la.g);
        for (let i = 0; i < 6; i++) { const y = P.rr(-66, 30); la.stroke(x - 80, y, x + 80, y + P.rr(-6, 6), P.rr(10, 22), P.pick(["#5a4e44", "#3e352e"]), 0.6); }
        la.stroke(x - 50, -46, x - 10, -54, 9, "#f1e6d4", 0.5, -3); la.done();
        let vl = ""; for (let xx = x - 74; xx <= x + 74; xx += 7) vl += `M${xx} -74V42`;
        lines.push(P.el("path", { d: vl, stroke: "#c9c0b4", "stroke-width": 1.6, opacity: 0, "clip-path": `url(#${lc})`, ...F }, lens));
        P.el("path", { d, fill: "none", stroke: P.INK, "stroke-width": 9, "stroke-linejoin": "round" }, frame);
      }
      P.el("path", { d: "M152 -54 Q170 -66 188 -54", fill: "none", stroke: P.INK, "stroke-width": 9, "stroke-linecap": "round", ...F }, frame);
      // past the lens: the glare that gets through, and the stop mark where it is blocked
      const past = P.el("g", {}, g); ray(LENS, END, past); P.el("path", { d: marks(LENS, END, 40, false), stroke: "#b8741a", "stroke-width": 3, "stroke-linecap": "round", ...F }, past);
      const stop = P.el("path", { d: `M${LENS[0] - 14} ${LENS[1] - 14}L${LENS[0] + 14} ${LENS[1] + 14}M${LENS[0] + 14} ${LENS[1] - 14}L${LENS[0] - 14} ${LENS[1] + 14}`, stroke: "#d9463f", "stroke-width": 6, "stroke-linecap": "round", opacity: 0, ...F }, g);
      const st = { polar: ISO.clamp(+o.polar || 0, 0, 1) }; let v = st.polar;
      const draw = () => {
        for (const l of lines) l.setAttribute("opacity", (0.85 * v).toFixed(2));
        past.setAttribute("opacity", (1 - 0.92 * v).toFixed(2)); stop.setAttribute("opacity", ISO.smooth(0.6, 1, v).toFixed(2));
      };
      draw();
      g.set = (q) => { if (q.polar !== undefined) st.polar = ISO.clamp(+q.polar || 0, 0, 1); };
      g.update = (dt) => { const was = v; v = ISO.still() ? st.polar : ISO.follow(v, st.polar, dt, 0.45); if (Math.abs(v - st.polar) < 0.002) v = st.polar; if (v !== was) draw(); return v !== st.polar; };
      g.readout = () => (st.polar >= 0.5 ? "polarized lens: side-to-side glare blocked" : "plain tinted lens: glare goes through");
      return g;
    },
  });
})();
