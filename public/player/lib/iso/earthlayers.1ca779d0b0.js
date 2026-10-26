// "earthlayers cx cy r labels=0 open=0..1 lab=1 lit=crust|mantle|outer|inner" — a cut-away Earth model in its cup.
// The ball sits in a brass cup on a wooden foot. One eighth of it is a separate wedge: lift it out (open=1) and the
// three cut faces show the layers at their true sizes: mantle down to 2,890 km, the liquid outer core to 5,150 km,
// the solid inner core 1,221 km in radius. Only the crust is drawn thicker (really 5–70 km, under a hair's width here).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RB = 50, ZC = 74, C = [0, 0, ZC];
  // radius fraction, colour, ink, name, depth text
  const LAYERS = [
    { id: "crust", r: 1, col: "#c79a62", ink: "#5e3b1c", name: "crust", say: "crust: rock, 5–70 km thick (drawn thicker)" },
    { id: "mantle", r: 0.94, col: "#f0a35e", ink: "#8a3a18", name: "mantle", say: "mantle: hot rock that creeps, down to 2,890 km, about 1,000–3,700 °C" },
    { id: "outer", r: 3481 / 6371, col: "#f6c24e", ink: "#a8641a", name: "outer core", say: "outer core: liquid iron and nickel, 2,890–5,150 km down, about 4,500 °C" },
    { id: "inner", r: 1221 / 6371, col: "#ffe58a", ink: "#c98a10", name: "inner core", say: "inner core: solid iron ball, 1,221 km in radius, about 5,400 °C" },
  ];

  ISO.add({
    name: "earthlayers", title: "Earth's layers (cut-away model)", compare: "earthlayers 400 290 140",
    about: "A cut-away Earth model: lift out the wedge and the cut faces show crust, mantle, outer core and inner core at true depth.",
    line: "earthlayers cx cy r labels=0 open=0..1 lab=1 lit=crust|mantle|outer|inner",
    demo: { line: "earthlayers 480 270 140", script: [{ set: { open: 1 }, hold: "settle" }, { set: { lit: "outer" }, hold: 2.2 }, { set: { lit: "inner" }, hold: 2.2 }, { set: { lit: "" }, hold: 1 }] },
    make([cx, cy, r = 130], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = r * 4.4, H = r * 3.3;
      const { P, g } = ISO.frame([[-RB, -RB, ZC], [RB, RB, ZC], [0, 0, ZC + RB], [-36, 36, 0], [36, -36, 0], [34, 34, -2], [RB * 0.88 + RB, -RB * 0.88, ZC + RB * 0.55], [RB * 0.88, -RB * 0.88 + RB, ZC + RB * 0.55], [RB * 0.88, -RB * 0.88, ZC + RB * 1.6], [-RB * 0.7, RB * 0.7, ZC - RB * 0.7]], cx, cy, W, H, { azimuth: 45, elevation: 24 }, parent);
      const F = EARTH.frame(C, RB, [0, 0, 1], 1.1), at = (v) => K.iso([C[0] + v[0], C[1] + v[1], C[2] + v[2]], P);
      // three quarter-discs in the planes x=0, y=0, z=0, each spanning two positive axes
      const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], FACES = [[1, 2], [0, 2], [0, 1]], SHADE = [0.1, 0.18, 0];
      const quarter = ([i, j], rr, n = 24) => K.pathOf([at([0, 0, 0]), ...Array.from({ length: n + 1 }, (_, s) => { const t = (s / n) * Math.PI / 2; return at(AX[i].map((x, k) => (x * Math.cos(t) + AX[j][k] * Math.sin(t)) * rr * RB)); })], true);
      const faces = LAYERS.map((Ly) => `<g data-name="${Ly.id}">${FACES.map((f, n) => `<path d="${quarter(f, Ly.r)}" fill="${Ly.col}" stroke="${Ly.ink}" stroke-width=".8" stroke-linejoin="round"/><path d="${quarter(f, Ly.r)}" fill="#3a1d08" fill-opacity="${SHADE[n]}" stroke="none"/>`).join("")}</g>`).join("");
      // the wedge's outline on the ball: three quarter great circles round the cut octant
      const arc = (i, j, n = 24) => Array.from({ length: n }, (_, s) => { const t = (s / n) * Math.PI / 2; return at(AX[i].map((x, k) => (x * Math.cos(t) + AX[j][k] * Math.sin(t)) * RB)); });
      const wedgeD = K.pathOf([...arc(0, 1), ...arc(1, 2), ...arc(2, 0)], true), id = `el${Math.random().toString(36).slice(2, 7)}`;
      const ball = EARTH.ball(P, F, { tint: ISO.tint("#e3f0fb", ["#a9c9e8", "#bcd6ee", "#cfe2f4", "#dceaf7"], "#1f4f8f"), land: "#cfe7b9", ink: "#1f3f66" });
      // the stand: a turned wooden foot, a brass stem and a cup the ball rests in
      const foot = ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, 34], [1.5, 34], [2.4, 32.6, 1], [4.4, 29.4, 1], [5.4, 24], [7, 23], [8, 17, 1], [9.5, 12], [9.5, 0]], LAB.Z([0, 0, 0]), P, { steps: 72 }), { tone: "mid" }));
      // audit: the ring and arms are ISO.poly (not recorded), so the ball and the posts that carry it read as loose
      // a cradle ring round the ball's lower half, held on three L-shaped arms from the stem's hub
      const Z0 = ZC - 0.6 * RB, RR = 0.8 * RB + 1.6, dC = K.depthOf(C, P);
      const stem = ISO.tinted(ISO.T.brass, S(G.lathe([[9.5, 0], [9.5, 6], [12, 6], [12.6, 4.6, 1], [13.6, 3.4, 1], [13.6, 5.4], [17.4, 5.4], [17.4, 0]], LAB.Z([0, 0, 0]), P, { steps: 40 }), { tone: "mid" }));
      const ring = EARTH.bandArc(P, [0, 0, Z0], [1, 0, 0], [0, 1, 0], RR, 1.8, 1.4, 0, Math.PI * 2, 56);
      const arms = [0.5, 0.5 + 2.094, 0.5 + 4.189].map((f) => {
        const c = [Math.cos(f), Math.sin(f)], s2 = [-c[1], c[0]], bar = [[4.6, -1.4, 14], [RR + 1.4, -1.4, 14], [RR + 1.4, 1.4, 14], [4.6, 1.4, 14], [4.6, -1.4, 16.6], [RR + 1.4, -1.4, 16.6], [RR + 1.4, 1.4, 16.6], [4.6, 1.4, 16.6]].map(([u, v, z]) => [c[0] * u + s2[0] * v, c[1] * u + s2[1] * v, z]);
        const svg = ISO.poly(bar, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid") + S(K.cylinder(c[0] * RR, c[1] * RR, 1.3, 16.6, Z0 - 18, P, 14), { tone: "mid", crease: "none" });
        return { svg, depth: K.depthOf([c[0] * RR, c[1] * RR, 30], P) };
      });
      const brass = (list, front) => ISO.tinted(ISO.T.brass, list.filter((q) => (q.depth > dC) === front).map((q) => q.svg).join(""));
      g.innerHTML = `<defs><clipPath id="${id}"><path d="${wedgeD}"/></clipPath></defs><g data-name="stand">${foot}${stem}${brass(arms, false)}${brass(ring, false)}</g><g data-name="ball">${ball}</g><g>${faces}</g><g data-name="stand">${brass(ring, true)}${brass(arms, true)}</g>` +
        `<g data-part="wedge" data-name="wedge"><g clip-path="url(#${id})">${ball}</g><path d="${wedgeD}" fill="none" stroke="#1f3f66" stroke-width="1" stroke-linejoin="round"/></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const st = { open: ISO.clamp(ISO.num(o, "open", 0), 0, 1) }, want = { open: st.open };
      let lit = o.lit || "";
      // lifted up and out to the right, clear of the ball, so all three cut faces show
      const cam = K.cameraOf(P), out = [cam.sinA * RB * 1.25, -cam.cosA * RB * 1.25, RB * 0.55];
      const draw = () => {
        const e = Math.round(ISO.ease(st.open) * 200) / 200;
        w.attr(el.wedge, "transform", K.translateAlong(P, out.map((x) => x * e)));
        if (lab) w.rebuild(el.words, String(e > 0.6), () => {
          // words on the y = 0 face, halfway between +x and +z, at each layer's middle; the crust's beside the rim
          const on = (rr) => at([rr * RB * 0.707, 0, rr * RB * 0.707]);
          return (e > 0.6 ? ISO.word(on(0.74), "mantle", "#7a3010", { size: 13 }) + ISO.word(on(0.37), "outer core", "#7a4a0a", { size: 12 }) + ISO.word(at([0, 0, 0]), "inner core", "#7a5a0a", { size: 11, dy: -4 }) +
            ISO.word(at([-RB * 0.15, -RB * 0.15, RB * 1.04]), "crust", "#5e3b1c", { size: 13, anchor: "end", dy: -4 }) : "");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) want.open = ISO.clamp(+p.open, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.open = ISO.follow(st.open, want.open, dt, 0.45, ISO.still());
        if (Math.abs(st.open - want.open) < 0.002) st.open = want.open;
        draw();
        return st.open !== want.open;
      };
      g.readout = () => { const Ly = LAYERS.find((x) => String(lit).split(",").includes(x.id)); return Ly ? Ly.say : st.open > 0.5 ? "Earth is 6,371 km to its centre · crust 5–70 km · mantle to 2,890 km · outer core (liquid) to 5,150 km · inner core (solid) 1,221 km in radius" : "a whole Earth: the wedge sits in place"; };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
