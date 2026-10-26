// "drivebelt cx cy k to=<id>.<anchor> dy= dz= r1=0.3..3 r2=0.3..3 pulleys=0|1 rpm=-600..600 lab=0 lit=belt|pulleys" — a
// PART (PARTS.md): a round rubber drive belt (4 mm) looped over two pulleys whose axles run along x, origin the first
// (driving) pulley's centre. The second pulley's centre is in the same upright plane: the player turns
// to=<id>.<anchor> (a Stirling engine's `pulley`) into tox= toy= and the belt finds that point in the plane x = 0;
// without it, dy dz (cm) from the origin. r1, r2 = the pulleys' groove radii (cm, default 0.5 and 0.8: a motor's
// and the engine's). pulleys=1 draws both pulleys (each a grooved brass wheel on a stub of shaft); pulleys=0 only the
// belt, to ride the motor's and the engine's own pulleys. rpm = the driving pulley's turns a minute, eased: the belt
// runs at 2π·r1·rpm and the driven pulley turns rpm·r1/r2. Reused from heatengine.js (its belt), in mm; anchors in cm.
// set({ rpm }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BW = 2, GAP = 12;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // the belt's centre line round two circles (y, z) of radii a and b: arc on the first, straight, arc on the second
  function loop(c1, a, c2, b) {
    const dy = c2[0] - c1[0], dz = c2[1] - c1[1], d = Math.hypot(dy, dz) || 1, t0 = Math.atan2(dz, dy), gam = Math.acos(ISO.clamp((a - b) / d, -1, 1));
    const pts = [], arc = (c, r, f, to, n) => { for (let i = 0; i <= n; i++) { const t = f + ((to - f) * i) / n; pts.push([c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r]); } };
    arc(c1, a, t0 + gam, t0 + 2 * Math.PI - gam, 40);
    arc(c2, b, t0 - gam, t0 + gam, 40);
    pts.push(pts[0]);
    return pts;
  }

  ISO.add({
    name: "drivebelt", title: "Drive belt with pulleys (part)", compare: null,
    about: "A round rubber drive belt looped over two grooved pulleys on axles along x, from its origin (the driving pulley) to to=<id>.<anchor> (or dy dz cm); rpm runs it (the belt moves, both pulleys turn). pulleys=0 draws only the belt, to ride a motor's and an engine's own pulleys. anchors: end",
    line: "drivebelt cx cy k to=<id>.<anchor> dy=-50..50 dz=-50..50 r1=0.3..3 r2=0.3..3 pulleys=0|1 rpm=-600..600 lab=0 lit=belt|pulleys",
    demo: { line: "drivebelt 420 390 60 dy=-5.6 dz=2.8", script: [{ set: {}, hold: 1 }, { set: { rpm: 120, lit: "belt" }, hold: 3 }, { set: { lit: "pulleys" }, hold: 2 }, { set: { rpm: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -50, 50), r1 = ISO.clamp(ISO.num(o, "r1", 0.5), 0.3, 3) * 10, r2 = ISO.clamp(ISO.num(o, "r2", 0.8), 0.3, 3) * 10, wheels = o.pulleys !== "0";
      let E = B17.fin(o.tox) && B17.fin(o.toy) ? B17.onPlaneX(P, [+o.tox, +o.toy], 0) : [0, lim(ISO.num(o, "dy", -5.6)), lim(ISO.num(o, "dz", 2.8))];
      E = [0, lim(E[1]), lim(E[2])].map((v) => v * 10);
      if (Math.hypot(E[1], E[2]) < r1 + r2 + 4) E = [0, -(r1 + r2 + 4), 0];   // pulleys may not overlap
      const st = { rpm: ISO.clamp(ISO.num(o, "rpm", 0), -600, 600), lit: o.lit || "", s: 0, th: 0 }, want = { rpm: st.rpm }, w = ISO.writer();
      const C = loop([0, 0], r1 + BW / 2, [E[1], E[2]], r2 + BW / 2), seg = [0];
      for (let i = 1; i < C.length; i++) seg.push(seg[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
      const len = seg[seg.length - 1], at = (s) => { s = ((s % len) + len) % len; let i = 1; while (seg[i] < s) i++; const f = (s - seg[i - 1]) / (seg[i] - seg[i - 1] || 1); return [0, C[i - 1][0] + (C[i][0] - C[i - 1][0]) * f, C[i - 1][1] + (C[i][1] - C[i - 1][1]) * f]; };
      const bw = Math.max(1.2, K.screenRise(1, Pm) * 4), bd = K.pathOf(C.map(([y, z]) => K.iso([0, y, z], Pm)), true);
      const belt = `<path d="${bd}" fill="none" stroke="#111214" stroke-width="${(bw + 1).toFixed(2)}" stroke-linejoin="round"/><path d="${bd}" fill="none" stroke="#3a3c41" stroke-width="${bw.toFixed(2)}" stroke-linejoin="round"/>`;
      const marks = (s0) => { const out = []; for (let s = s0 % GAP; s < len; s += GAP) { const a = K.iso(at(s), Pm), b = K.iso(at(s + 2.5), Pm); out.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`); } return `<path d="${out.join("")}" stroke="#8a8d94" stroke-width="${(bw * 0.4).toFixed(2)}" stroke-linecap="round"/>`; };
      const wheel = (c, r) => { const F = xAx(c); return ISO.tinted(ISO.T.steel, S(G.disc(-7, -4, 1.4, F, Pm, { steps: 10 }), { tone: "mid", crease: "none" })) + ISO.tinted(ISO.T.brass, S(G.disc(-4, 4, r, F, Pm, { steps: 24 }), { tone: "mid" }) + S(G.disc(-4, -2.5, r + 2.5, F, Pm, { steps: 28 }), { tone: "mid" }) + S(G.disc(2.5, 4, r + 2.5, F, Pm, { steps: 28 }), { tone: "hi" })) + S(G.disc(-4, 4.02, 1.4, F, Pm, { steps: 10 }), { tone: "mid" }); };
      // the far half of each pulley under the belt would need a cut; the belt runs in the groove, so the near flange
      // (drawn after it) hides it there, as on a real pulley
      g.innerHTML = `<g data-name="belt">${belt}<g data-part="marks"></g></g>` + (wheels ? `<g data-name="pulleys">${[[`${wheel([0, 0, 0], r1)}<g data-part="sp1"></g>`, [0, 0, 0]], [`${wheel(E, r2)}<g data-part="sp2"></g>`, E]].sort((p, q) => K.depthOf(p[1], Pm) - K.depthOf(q[1], Pm)).map((p) => p[0]).join("")}</g>` : "") + `<g data-part="words"></g>`;
      g.anchors = { end: E.map((v) => +(v / 10).toFixed(3)) };
      const el = LAB.parts(g);
      const draw = () => {
        const sq = Math.round(st.s * 2) / 2, tq = Math.round(st.th * 40) / 40;
        w.rebuild(el.marks, String(sq % GAP), () => marks(sq));
        if (wheels) {
          w.rebuild(el.sp1, String(tq), () => L(G.spokesOf(xAx([0, 0, 0]), 4, 1.4, r1 + 2.5, 3, Pm, { phase: tq }), { tone: "mid" }));
          w.rebuild(el.sp2, String(tq), () => L(G.spokesOf(xAx(E), 4, 1.4, r2 + 2.5, 3, Pm, { phase: (tq * r1) / r2 }), { tone: "mid" }));
        }
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([0, E[1] / 2, E[2] / 2 + 14], Pm), "drive belt", "#445", { size: 13 }));
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.rpm !== undefined && Number.isFinite(+p.rpm)) want.rpm = ISO.clamp(+p.rpm, -600, 600);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.rpm = ISO.follow(st.rpm, want.rpm, dt, 0.5, calm);
        if (Math.abs(st.rpm - want.rpm) < 0.2) st.rpm = want.rpm;
        if (!calm) { const turn = (st.rpm / 60) * dt; st.th += turn * 2 * Math.PI; st.s = (st.s + turn * 2 * Math.PI * (r1 + BW / 2) + len * 100) % len; }
        draw();
        return st.rpm !== 0 || st.rpm !== want.rpm;
      };
      g.readout = () => `drive belt ${(len / 10).toFixed(1)} cm round, pulleys ${r1 / 10} and ${r2 / 10} cm · ${st.rpm ? `driving pulley ${Math.round(st.rpm)} turns a minute, belt ${((2 * Math.PI * r1 * Math.abs(st.rpm)) / 60 / 10).toFixed(1)} cm/s, driven pulley ${Math.round((st.rpm * r1) / r2)} turns a minute` : "at rest"}`;
      draw();
      return g;
    },
  });
})();
