// "powerdrill cx cy k aim=wall|down spin=0|1 lab=0 lit=bit|chuck|body|battery|trigger" — a PART (PARTS.md): an 18 V
// cordless drill/driver, its origin the drill bit's point. A 6 mm twist bit (118° point, two helical flutes, 5 cm of
// flutes and a smooth shank) in a 13 mm keyless chuck (three jaws, a ribbed sleeve, a black rear collar), a 20-step
// clutch ring, the round motor housing with its cooling slots and domed rear cap, a forward/reverse button through
// the body, the pistol grip raked back 6° with a rubber overmould, the trigger, the foot with its LED work light, and
// a 2 Ah slide-on battery pack with a release latch and three charge lights. aim=wall: drilling into the wall (−y),
// the grip hanging down; aim=down: drilling into the floor or a bench (−z), the grip out to −x. spin=1 runs the
// chuck at 1500 rpm (shown slower: the jaws, ribs and flutes visibly turn), spin=0 coasts it to a stop.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const STEEL = ISO.T.steel, RUBBER = ISO.T.rubber, PLASTIC = ISO.T.plastic, TAU = Math.PI * 2;
  const TEAL = ISO.tint("#c4ebe4", ["#1f7f72", "#2a9383", "#38a695", "#55baaa"], "#0b3d36");
  const HSS = ISO.tint("#c9ccd0", ["#6d7178", "#80848b", "#94989e", "#a9acb1"], "#2b2e33");
  const RIM = 3.2;                                   // motor housing radius
  // The drill's frame: a from the bit's point back to the rear cap, up = away from the grip, sd = a × up.
  const AXES = { wall: { a: [0, 1, 0], up: [0, 0, 1] }, down: { a: [0, 0, 1], up: [1, 0, 0] } };

  ISO.add({
    name: "powerdrill", title: "Cordless drill (part)", compare: null,
    about: "An 18 V cordless drill with a 6 mm bit in a keyless chuck, clutch ring, motor body with vents, trigger and a slide-on battery; the bit's point is the origin, aim says where it drills, spin runs the chuck. anchors: none",
    line: "powerdrill cx cy k aim=wall|down spin=0|1 lab=0 lit=bit|chuck|body|battery|trigger",
    demo: { line: "powerdrill 610 160 13 aim=wall lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1, lit: "chuck" }, hold: 2.5 }, { set: { spin: 0, lit: "trigger" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = o.aim === "down" ? "down" : "wall", { a, up } = AXES[aim], sd = G.cross3(a, up);
      const at = (u, w, y) => [0, 1, 2].map((i) => a[i] * u + up[i] * w + sd[i] * y);
      const F = G.frameOf([0, 0, 0], a, up, sd), V = G.viewOf(P);
      const box = (U, Wr, Yr, tone = "mid") => ISO.box(at, P, U, Wr, Yr, tone);
      // a convex solid from (u, w, y) corners: the raked grip, the trigger
      const hexa = (pts, tone = "mid") => ISO.poly(pts.map(([u, w, y]) => at(u, w, y)), ISO.BOX_F, P, tone);
      const depth = (u, w = 0, y = 0) => K.depthOf(at(u, w, y), P);
      // ── the grip end: battery pack, the foot it slides onto, trigger, grip (raked 6° back), its rubber overmould
      const RAKE = Math.tan((6 * Math.PI) / 180), gu = (u, w) => u + (-3 - w) * RAKE;   // the grip's u at height w
      const grip = (u0, u1, w0, w1, y0, y1) => [[gu(u0, w0), w0, y0], [gu(u1, w0), w0, y0], [gu(u1, w1), w1, y0], [gu(u0, w1), w1, y0], [gu(u0, w0), w0, y1], [gu(u1, w0), w0, y1], [gu(u1, w1), w1, y1], [gu(u0, w1), w1, y1]];
      const fixed = [];
      {
        const b = [], u0 = 12.6, u1 = 24.2, wb = -19.2, wt = -14.4;
        b.push(ISO.tinted(PLASTIC, box([u0, u1], [wb, wb + 2.6], [-3.8, 3.8], "mid")));
        b.push(ISO.tinted(TEAL, box([u0 + 0.3, u1 - 0.3], [wb + 2.6, wt], [-3.6, 3.6], "mid")));
        // release latch on the front, charge gauge (button and three lights) on the back, a label plate on the side
        b.push(ISO.tinted(RUBBER, box([u0 - 0.35, u0 + 0.3], [wt - 1.6, wt - 0.4], [-1.6, 1.6], "hi")));
        const back = G.dot3(a, V) > 0, sideOn = G.dot3(sd, V) > 0 ? 1 : -1;
        if (back) {
          b.push(ISO.tinted(PLASTIC, box([u1, u1 + 0.15], [wb + 0.9, wb + 1.9], [-2.6, -0.8], "hi")));
          b.push([0.1, 1.0, 1.9].map((y) => { const c = K.iso(at(u1 + 0.01, wb + 1.4, y), P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(0.28 * k).toFixed(2)}" fill="${y < 1.5 ? "#5fd17a" : "#3a3e44"}" stroke="#0d0e10" stroke-width="0.4"/>`; }).join(""));
        }
        const fy = sideOn * 3.61, lp = (u, w) => K.iso(at(u, w, fy), P);
        b.push(`<path d="${K.pathOf([lp(15, wb + 3.2), lp(21.6, wb + 3.2), lp(21.6, wt - 0.6), lp(15, wt - 0.6)], true)}" fill="#eef0f2" stroke="#0b3d36" stroke-width="0.5"/>`);
        b.push(`<path d="${[0.3, 0.55, 0.8].map((f, i) => K.pathOf([lp(15.7, wb + 3.2 + f * (wt - 0.6 - wb - 3.2)), lp(20.9 - i * 1.4, wb + 3.2 + f * (wt - 0.6 - wb - 3.2))])).join("")}" stroke="#8a877f" stroke-width="0.35" data-free=""/>`);
        b.push(ISO.tinted(PLASTIC, box([u0 + 0.3, u1 - 0.3], [wt, wt + 0.25], [-3.3, 3.3], "lo")));
        fixed.push({ name: "battery", svg: b.join("") });
        // the foot: the rails the pack slides on, the LED work light in its front face
        const f = [ISO.tinted(PLASTIC, box([13.6, 23.2], [wt + 0.25, wt + 1.6], [-2.6, 2.6], "mid"))];
        if (G.dot3(a, V) < 0) f.push(ISO.tinted(ISO.T.amber, S(G.disc(-0.15, 0, 0.55, G.frameAlong(at(13.6, wt + 0.95, 0), G.mul3(a, -1)), P, { steps: 18 }), { tone: "hi" })));
        fixed.push({ name: "body", svg: f.join("") });
        fixed.push({ name: "trigger", svg: ISO.tinted(PLASTIC, hexa(grip(14.0, 15.4, -6.4, -3.6, -0.9, 0.9), "hi")) });
        const h = [ISO.tinted(TEAL, hexa(grip(15.2, 19.6, wt + 1.6, -2.2, -1.75, 1.75), "mid"))];
        h.push(ISO.tinted(RUBBER, hexa(grip(19.0, 19.9, -12.6, -4.2, -1.3, 1.3), "mid")));
        // the overmould's side panel on the grip, with three grip ridges across it, each from edge to edge
        const gy = sideOn * 1.76, gp = (u, w) => K.iso(at(gu(u, w), w, gy), P);
        h.push(`<path d="${K.pathOf([gp(16.9, -11.4), gp(18.7, -11.4), gp(18.7, -5.2), gp(16.9, -5.2)], true)}" fill="#3e3f44" stroke="#121214" stroke-width="0.5"/>`);
        h.push(`<path d="${[-10, -8.3, -6.6].map((w) => K.pathOf([gp(16.9, w), gp(18.7, w)])).join("")}" stroke="#6a6c72" stroke-width="0.5"/>`);
        fixed.push({ name: "body", svg: h.join("") });
      }
      // ── the coaxial pieces, sorted along the axis by depth
      const co = [];
      const add = (name, s, svg) => co.push({ name, s, svg });
      add("bit", 2.5, ISO.tinted(HSS, S(G.solidOf([[0, 0.02], [0.18, 0.3], [5, 0.3], [5.05, 0.29]], F, P, { steps: 20 }), { tone: "hi", inner: L(G.arcOf(F, 0.2, 0.3, P), { tone: "lo" }) })) + '<g data-part="helix"></g>');
      add("bit", 5.8, ISO.tinted(HSS, S(G.disc(5.05, 6.5, 0.29, F, P, { steps: 20 }), { tone: "hi" })));
      add("chuck", 6.25, '<g data-part="jaws"></g>');
      add("chuck", 6.7, ISO.tinted(PLASTIC, S(G.solidOf([[6.3, 0.75], [6.5, 1.1, 1], [7.0, 1.65, 1], [7.2, 1.9]], F, P, { steps: 32 }), { tone: "hi" })));
      add("chuck", 8.6, ISO.tinted(PLASTIC, S(G.solidOf([[7.2, 1.9], [7.4, 2.15, 1], [9.9, 2.2, 1], [10.1, 2.05]], F, P, { steps: 40 }), { tone: "hi" })) + '<g data-part="ribs"></g>');
      add("chuck", 10.5, ISO.tinted(RUBBER, S(G.disc(10.1, 10.9, 1.95, F, P, { steps: 36 }), { tone: "hi" })));
      add("body", 11.6, ISO.tinted(PLASTIC, S(G.solidOf([[10.9, 2.3], [11.05, 2.55, 1], [12.1, 2.6, 1], [12.3, 2.45]], F, P, { steps: 40 }), { tone: "hi", inner: K.fadedSvg(G.ribsOf(F, 11.05, 12.1, 2.56, 20, P, { fade: [0.2, 0.55], seams: true, r1: 2.6 }), { tone: "faint" }) })));
      // the motor housing: gearbox nose, the round body, the domed rear cap with its seam; vents near the rear
      const body = [ISO.tinted(TEAL, S(G.solidOf([[12.3, 2.45], [13, 2.7, 1], [14.4, 3.1, 1], [16, RIM, 1], [21.5, RIM, 1], [22.6, 3.05, 1], [22.8, 2.9]], F, P, { steps: 56 }), { tone: "mid", inner: L(G.arcOf(F, 14.4, 3.1, P, { slope: 0.2 }), { tone: "faint" }) }))];
      body.push(ISO.tinted(PLASTIC, S(G.solidOf([[22.7, 2.95], [23.2, 2.75, 1], [23.8, 2.2, 1], [24.2, 1.2, 1], [24.35, 0]], F, P, { steps: 48 }), { tone: "mid" })));
      // cooling slots: closed slots on the housing, only those that face the viewer
      const face = Math.atan2(G.dot3(V, sd), G.dot3(V, up));
      for (const da of [-0.62, -0.31, 0, 0.31, 0.62]) {
        const t0 = face + da, fac = Math.cos(da);
        if (fac < 0.5) continue;
        const loop = [];
        for (let i = 0; i <= 8; i++) loop.push(G.pointOf(F, 19.2 + (i / 8) * 2.6, RIM + 0.01, t0 - 0.07));
        for (let i = 8; i >= 0; i--) loop.push(G.pointOf(F, 19.2 + (i / 8) * 2.6, RIM + 0.01, t0 + 0.07));
        body.push(`<path d="${K.pathOf(loop.map((p) => K.iso(p, P)), true)}" fill="#10302b" stroke="#0b3d36" stroke-width="0.45"/>`);
      }
      // forward/reverse button through the body above the trigger: one end shows on the side facing the viewer
      const bs = G.dot3(sd, V) > 0 ? 1 : -1;
      body.push(ISO.tinted(PLASTIC, S(G.disc(0, 0.5, 0.55, G.frameAlong(at(15.4, -2.1, bs * 2.0), G.mul3(sd, bs)), P, { steps: 16 }), { tone: "hi" })));
      body.push(ISO.tinted(ISO.T.red, S(G.disc(0.5, 0.75, 0.42, G.frameAlong(at(15.4, -2.1, bs * 2.0), G.mul3(sd, bs)), P, { steps: 16 }), { tone: "hi" })));
      add("body", 18.5, body.join(""));
      co.sort((p, q) => depth(p.s) - depth(q.s) || p.s - q.s);
      const pieces = [...fixed, ...co];
      let html = "";
      for (let i = 0; i < pieces.length; ) {
        const name = pieces[i].name; let b = "";
        while (i < pieces.length && pieces[i].name === name) b += pieces[i++].svg;
        html += `<g data-name="${name}">${b}</g>`;
      }
      g.innerHTML = html + '<g data-part="words"></g>';
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { helix: q("helix"), jaws: q("jaws"), ribs: q("ribs"), words: q("words") };
      const parts = [...g.querySelectorAll("[data-name]")], w = ISO.writer(), cache = {};
      // the bit's flutes: two helices, pitch 2.4 cm, drawn in short pieces that fade as they turn away
      const helixSvg = (ph) => {
        const list = [];
        for (const f of [0, Math.PI]) for (let s = 0.2; s < 4.95; s += 0.25) {
          const s1 = Math.min(5, s + 0.25), t0 = ph + f + (TAU * s) / 2.4, t1 = ph + f + (TAU * s1) / 2.4;
          const fac = G.dot3(G.radialOf(F, (t0 + t1) / 2), V);
          const alpha = G.fadeOf(fac, [0.15, 0.55]);
          if (alpha > 0.02) list.push({ d: K.pathOf([K.iso(G.pointOf(F, s, 0.3, t0), P), K.iso(G.pointOf(F, s1, 0.3, t1), P)]), alpha });
        }
        return ISO.tinted(HSS, K.fadedSvg(list, { tone: "lo" }));
      };
      // the three jaws gripping the bit, 120° apart, their ends showing in the chuck's nose
      const jawsSvg = (ph) => ISO.tinted(STEEL, [0, 1, 2].map((i) => {
        const tj = ph + (i * TAU) / 3, c = G.pointOf(F, 6.0, 0.52, tj), Fj = G.frameAlong(c, a);
        return [K.depthOf(c, P), S(G.prismOf(Fj, [[-0.22, -0.2], [0.22, -0.2], [0.22, 0.2], [-0.22, 0.2]].map(([x, y]) => { const r = G.radialOf(F, tj), tg = G.tangentOf(F, tj); return [x * G.dot3(r, Fj.u) + y * G.dot3(tg, Fj.u), x * G.dot3(r, Fj.v) + y * G.dot3(tg, Fj.v)]; }), 0, 0.5, P), { tone: "hi" })];
      }).sort((x, y) => x[0] - y[0]).map((x) => x[1]).join(""));
      const ribsSvg = (ph) => ISO.tinted(PLASTIC + ";--anatomy-lo:#7c7f86", K.fadedSvg(G.ribsOf(F, 7.45, 9.85, 2.16, 18, P, { phase: ph, fade: [0.2, 0.55], seams: true, r1: 2.2 }), { tone: "lo" }));
      const s = { phase: 0, speed: o.spin === "1" ? 1 : 0 }, goal = { speed: s.speed };
      let lit = o.lit || "";
      const draw = () => {
        const n = 24, key = (per) => Math.round(((((s.phase % per) + per) % per) / per) * n) % n;
        const kh = key(Math.PI), kj = key(TAU / 3), kr = key(TAU / 18);
        w.rebuild(el.helix, `h${kh}`, () => (cache[`h${kh}`] ||= helixSvg((kh / n) * Math.PI)));
        w.rebuild(el.jaws, `j${kj}`, () => (cache[`j${kj}`] ||= jawsSvg((kj / n) * (TAU / 3))));
        w.rebuild(el.ribs, `r${kr}`, () => (cache[`r${kr}`] ||= ribsSvg((kr / n) * (TAU / 18))));
        w.rebuild(el.words, lab ? aim : "", () => {
          if (!lab) return "";
          const p = K.iso(at(21, -17, 0), P);
          return ISO.word([p[0] + 52, p[1] + 30], "cordless drill", "#444", { size: 14, anchor: "start" });
        });
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.spin !== undefined) goal.speed = +p.spin ? 1 : 0;
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        if (s.speed === 0 && goal.speed === 0) return false;
        // spins up in about a quarter second, coasts down in about half (the motor brake); shown at 0.9 turns a second
        s.speed = ISO.follow(s.speed, goal.speed, dt, goal.speed ? 0.12 : 0.22, ISO.still());
        if (Math.abs(s.speed - goal.speed) < 0.01) s.speed = goal.speed;
        s.phase -= s.speed * TAU * 0.9 * Math.min(dt, 0.1);        // clockwise seen from behind: a right-hand bit cuts
        draw();
        return s.speed > 0 || goal.speed > 0;
      };
      g.readout = () => `18 V cordless drill · 6 mm bit · ${aim === "wall" ? "drilling into the wall" : "drilling down"} · ${s.speed > 0.01 ? `chuck at ${Math.round(1500 * s.speed)} rpm` : "chuck still"}`;
      draw();
      return g;
    },
  });
})();
