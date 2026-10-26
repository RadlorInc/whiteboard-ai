// "balloon cx cy k c=red|blue|yellow|green line=10..150 swing=-40..40 charge=0|1 lab=0 lit=balloon|thread|charge" — a
// PART (PARTS.md, batch 5): a blown-up rubber balloon, 25 cm across, hanging by its knot on a thread, as static.js
// hangs two of them (rubbed on wool, they push each other apart). Origin: the hanging point (place it at= a support's
// underside); the thread runs `line` cm down to the knot and the balloon hangs under it, the whole thing swung
// `swing` degrees from the vertical in the x–z plane (+ toward +x). set({ swing }) eases it (a charged pair hangs at
// −a and +a). charge=1 prints "−" signs on its near side. It carries its own thread, since anchors don't follow.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  // the body's meridian from its round bottom (s = 0) up to the neck, then the neck and the rolled knot
  const BODY = [[0, 0], [1.2, 5.2, 1], [4.5, 10, 1], [10, 12.5, 1], [16, 12.2, 1], [22, 9, 1], [26.5, 4.2, 1], [28.6, 1.2, 1], [29.4, 0.75]];
  const KNOT = [[0, 0.75], [0.35, 1.25, 1], [0.8, 1.35, 1], [1.2, 0.9, 1], [1.4, 0.3]];
  // glossy rubber: saturated colours, a light top band and a dark rim
  const COL = {
    red: ISO.tint("#ff9c8c", ["#c8352a", "#d9463a", "#e85a4c", "#f47a6b"], "#6e1610"),
    blue: ISO.tint("#9cc8ff", ["#2f62b8", "#3a74cc", "#4d88dc", "#6aa0ea"], "#14305e"),
    green: ISO.tint("#a8e6a0", ["#2f8a3a", "#3c9c46", "#4fb058", "#6cc474"], "#154a1c"),
    yellow: ISO.tint("#fff2a8", ["#d9a514", "#e6b524", "#f0c63c", "#f7d65e"], "#6e4e06"),
  };
  const TOP = 30.8;

  ISO.add({
    name: "balloon", title: "Balloon on a thread (part)", compare: null,
    about: "A 25 cm rubber balloon hanging by its knot on a thread from a support; rubbed on wool it carries charge, and two such balloons swing apart. anchors: knot",
    line: "balloon cx cy k c=red|blue|yellow|green line=10..150 swing=-40..40 charge=0|1 lab=0 lit=balloon|thread|charge",
    demo: { line: "balloon 480 70 6.5 c=red line=24 charge=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { swing: 20, lit: "balloon" }, hold: "settle" }, { set: { swing: -12, lit: "thread" }, hold: "settle" }, { set: { swing: 0, lit: "charge" }, hold: "settle" }] },
    make([cx = 480, cy = 120, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", charge = o.charge === "1";
      const tint = COL[o.c] || ISO.T.red, len = ISO.clamp(ISO.num(o, "line", 50), 10, 150);
      const st = { a: ISO.clamp(ISO.num(o, "swing", 0), -40, 40) }, want = { a: st.a };
      let lit = o.lit || "";
      const knotAt = (a) => [len * Math.sin(a), 0, -len * Math.cos(a)];
      const build = (deg) => {
        const a = (deg * Math.PI) / 180, kn = knotAt(a), down = [Math.sin(a), 0, -Math.cos(a)];
        // the balloon's axis points up the thread, from its bottom to the knot
        const base = [kn[0] + down[0] * TOP, 0, kn[2] + down[2] * TOP], up = [-down[0], 0, -down[2]];
        const F = G.frameOf(base, up, [Math.cos(a), 0, Math.sin(a)], [0, 1, 0]), Fk = G.frameOf(G.pointOf(F, 29.4, 0, 0), up, F.u, F.v);
        const body = ISO.tinted(tint, S(G.lathe(BODY, F, P, { steps: 64 }), { tone: "hi" }) + S(G.lathe(KNOT, Fk, P, { steps: 24 }), { tone: "mid" }));
        // a soft window highlight on the shoulder toward the light
        const hl = K.iso(G.pointOf(F, 17, 10.5, Math.PI * 0.75), P), kS = G.scaleOf(P);
        const shine = `<ellipse cx="${hl[0].toFixed(1)}" cy="${hl[1].toFixed(1)}" rx="${(2.2 * kS).toFixed(1)}" ry="${(3.6 * kS).toFixed(1)}" fill="#ffffff" opacity=".45"/>`;
        const face = G.angleToward(F, G.viewOf(P)), fs = Math.max(12, k * 4);
        const signs = charge ? [[8, -0.5], [13, 0.1], [18, -0.3], [11, 0.6], [16, 0.8]].map(([s, da]) => ISO.word(K.iso(G.pointOf(F, s, 11.6, face + da), P), "−", "#1f4f8f", { size: fs, halo: false, dy: fs * 0.35 })).join("") : "";
        return { body: body + shine, signs, kn };
      };
      // a small screw eye at the hanging point that the thread is tied to
      const eye = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.45, -0.5, 0.5, P, 14), { tone: "mid" }));
      // the balloon is built once hanging straight; a swing is a rigid turn about the hanging point, and a body of
      // revolution seen by a parallel camera turns on screen as a turn plus a stretch along its axis (the axis's own
      // foreshortening), so that is all a swing needs: the knot's screen point moves, the body follows by a matrix
      const b0 = build(0), sc = (p) => K.iso(p, P), O = sc([0, 0, 0]);
      const axisOf = (a) => { const e = sc([-Math.sin(a), 0, Math.cos(a)]); return [e[0] - O[0], e[1] - O[1]]; };
      const v0 = axisOf(0), l0 = Math.hypot(...v0), u0 = [v0[0] / l0, v0[1] / l0], n0 = [-u0[1], u0[0]];
      const matrixOf = (a) => {
        const v = axisOf(a), la = Math.hypot(...v), u = [v[0] / la, v[1] / la], n = [-u[1], u[0]], s = la / l0;
        // L = [u·s n] · [u0 n0]^T (u0, n0 orthonormal)
        const A = u[0] * s * u0[0] + n[0] * n0[0], C = u[0] * s * u0[1] + n[0] * n0[1], B = u[1] * s * u0[0] + n[1] * n0[0], D = u[1] * s * u0[1] + n[1] * n0[1];
        const k0 = sc(b0.kn), k1 = sc(knotAt(a));
        return `matrix(${A.toFixed(5)} ${B.toFixed(5)} ${C.toFixed(5)} ${D.toFixed(5)} ${(k1[0] - A * k0[0] - C * k0[1]).toFixed(2)} ${(k1[1] - B * k0[0] - D * k0[1]).toFixed(2)})`;
      };
      g.innerHTML = `<g data-name="thread">${eye}</g><g data-name="thread" data-part="thread"></g><g data-part="swing"><g data-name="balloon">${b0.body}</g><g data-name="charge">${b0.signs}</g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.a * 20) / 20, a = (q * Math.PI) / 180, kn = knotAt(a);
        w.rebuild(el.thread, String(q), () => `<path d="${K.pathOf([sc([0, 0, -0.5]), sc(kn)])}" stroke="#55575c" stroke-width="${Math.max(0.6, k * 0.12).toFixed(2)}" fill="none"/>`);
        w.attr(el.swing, "transform", q === 0 ? "" : matrixOf(a));
        if (lab) w.rebuild(el.words, String(Math.round(q)), () => LAB.word(P, lab, [kn[0] + 15, 0, kn[2] - 1], "balloon", "#556", { anchor: "start" }));
        g.anchors = { knot: kn.map((v) => +v.toFixed(3)) };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.swing !== undefined && Number.isFinite(+p.swing)) want.a = ISO.clamp(+p.swing, -40, 40);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.a = ISO.follow(st.a, want.a, dt, 0.5, ISO.still()); draw(); return st.a !== want.a; };
      g.readout = () => `balloon 25 cm across on a ${len} cm thread · hanging ${Math.abs(st.a).toFixed(0)}° from the vertical${charge ? " · rubbed on wool, it has gained electrons (−)" : ""}`;
      draw();
      return g;
    },
  });
})();
