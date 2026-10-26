// "cakecase cx cy k z=0..200 lab=0 lit=case" — a PART (PARTS.md, batch 5): a fluted paper cake case, the light thing
// let go in the terminal-velocity experiment (freefall.js k=forces), open side up, its origin the surface point under
// it. 5 cm across the base, 7 cm across the rim, 3 cm tall, of greaseproof paper pressed into 24 pleats (they run from
// the base's edge to the rim) round a flat base; about 0.4 g. z = the height of its base above the origin: set z lower
// and it falls the way a real case does, its weight against air resistance that grows as v², dv/dt = g(1 − v²/vt²),
// so it soon stops speeding up at its terminal velocity vt = 1.2 m/s (95% of it about 0.2 s and 17 cm after it is let go) and
// falls steadily, at true speed, until it lands; set z higher and it is lifted, eased. A soft shadow sits on the
// surface under it. set({ z }). Built in mm; anchors in cm: `top` = the middle of the rim, `bottom` = the base.
(() => {
  const K = window.K, G = window.G;
  let n = 0;
  const RB = 25, RT = 35, H = 30, PLEATS = 24, VT = 120, g9 = 981, TH = 0.4;
  const PAPER = ISO.tint("#fdf1f3", ["#d7a9b4", "#e4bcc6", "#efcfd6", "#f7e2e6"], "#8a4f5e");

  ISO.add({
    name: "cakecase", title: "Paper cake case (part)", compare: null,
    about: "A fluted paper cake case that falls at a steady terminal velocity (about 1.2 m/s) once air resistance grows to equal its weight. anchors: top bottom",
    line: "cakecase cx cy k z=0..200 lab=0 lit=case",
    demo: { line: "cakecase 480 480 26 z=12 lab=1", script: [{ set: {}, hold: 1 }, { set: { z: 0, lit: "case" }, hold: "settle" }, { set: { z: 6 }, hold: "settle" }, { set: { z: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = "b14cc" + ++n;
      const s = { z: ISO.clamp(ISO.num(o, "z", 0), 0, 200), v: 0 };
      s.zT = s.z;
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="shadow"></g><g data-name="case" data-part="body"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      // the case at height zz (mm), built by hand (a lathe can't hide a thin shell's inside): first what is seen
      // through the rim (the far inside wall, the base, their creases), then the outside's front pleats, one facet per
      // pleat shaded by how it faces the light, then the rim's crimped edge
      const Lt = G.lightOf(Pm), V = G.viewOf(Pm), tilt = Math.atan2(RT - RB, H), SH = ["#d7a9b4", "#e4bcc6", "#efcfd6", "#f7e2e6"];
      const caseSvg = (zz) => {
        const F = LAB.Z([0, 0, zz]), at = (sz, r, a) => K.iso(G.pointOf(F, sz, r, a), Pm), N = PLEATS * 2;
        const ell = (sz, r) => K.pathOf(Array.from({ length: N }, (_, i) => at(sz, r, (i / N) * Math.PI * 2)), true);
        const rim = ell(H, RT - TH), out = [`<clipPath id="${id}"><path d="${rim}"/></clipPath>`];
        const crease = [];
        for (let i = 0; i < PLEATS; i++) { const a = (i / PLEATS) * Math.PI * 2; crease.push(K.pathOf([at(TH, RB - TH, a), at(H, RT - TH, a)])); }
        out.push(`<path d="${rim}" fill="#dcb1bc"/><g clip-path="url(#${id})"><path d="${ell(TH, RB - TH)}" fill="#f3dde2" stroke="#b98794" stroke-width="0.6"/><path d="${crease.join("")}" stroke="#b98794" stroke-width="0.5" fill="none"/></g>`);
        // the outside: the facets that face us
        const quads = [[], [], [], []];
        for (let i = 0; i < N; i++) {
          const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
          const nrm = G.add3(G.mul3(G.radialOf(F, am), Math.cos(tilt)), G.mul3(F.a, -Math.sin(tilt)));
          if (G.dot3(nrm, V) <= 0) continue;
          const pleat = i % 2 ? 0.12 : -0.12, b = ISO.clamp(Math.floor((G.dot3(nrm, Lt) + pleat + 0.6) * 2.6), 0, 3);
          quads[b].push(K.pathOf([at(0, RB, a0), at(0, RB, a1), at(H, RT, a1), at(H, RT, a0)], true));
        }
        out.push(quads.map((q, i) => (q.length ? `<path d="${q.join("")}" fill="${SH[i]}" stroke="${SH[i]}" stroke-width="0.4"/>` : "")).join(""));
        // the outline: the base's front edge, the two sides, the rim's crimp (a fine zigzag all round)
        const crimp = Array.from({ length: PLEATS * 4 + 1 }, (_, i) => at(H, RT - (i % 2 ? 0.9 : 0), (i / (PLEATS * 4)) * Math.PI * 2));
        out.push(`<path d="${K.pathOf(crimp)}" fill="none" stroke="#8a4f5e" stroke-width="0.7" stroke-linejoin="round"/>`);
        out.push(L(G.ribsOf(F, 0, H, RB, PLEATS, Pm, { r1: RT, seams: true }), { tone: "faint", free: true }));
        out.push(`<path d="${G.outlineOf([[0, 0], [0, RB], [H, RT], [H, 0]], F, Pm, { steps: N }).outline}" fill="none" stroke="#8a4f5e" stroke-width="0.9" stroke-linejoin="round"/>`);
        return ISO.tinted(PAPER, out.join(""));
      };
      const draw = () => {
        const zz = s.z * 10, key = zz.toFixed(1);
        w.rebuild(el.body, key, () => caseSvg(zz));
        w.rebuild(el.shadow, s.z.toFixed(1), () => {
          const op = ISO.clamp(0.22 - s.z * 0.01, 0.03, 0.22), sp = 1 + s.z * 0.03;
          return `<path d="${K.pathOf(K.circleRing(0, 0, RB * 0.95 * sp, 40).map(([x, y]) => K.iso([x, y, 0], Pm)))}Z" fill="#3a3e44" opacity="${op.toFixed(2)}"/>`;
        });
        g.anchors = { top: [0, 0, +(s.z + H / 10).toFixed(3)], bottom: [0, 0, +s.z.toFixed(3)] };
        if (lab) w.rebuild(el.words, key, () => LAB.word(Pm, lab, [RT + 6, 0, zz + H * 0.6], "paper cake case", "#8a6f58", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.z !== undefined && p.z !== "" && Number.isFinite(+p.z)) { s.zT = ISO.clamp(+p.z, 0, 200); if (s.zT > s.z) s.v = 0; }
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (s.z === s.zT) { draw(); return false; }
        if (ISO.still() || dt > 1) { s.z = s.zT; s.v = 0; }
        else if (s.zT < s.z) {
          // weight minus air resistance (∝ v²), in small steps; it lands and stops (paper does not bounce)
          for (let n = 0, h = dt / 4; n < 4; n++) { s.v += g9 * (1 - (s.v / VT) ** 2) * h; s.z = Math.max(s.zT, s.z - s.v * h); }
          if (s.z === s.zT) s.v = 0;
        } else { s.z = ISO.follow(s.z, s.zT, dt, 0.3, false); s.v = 0; }
        draw();
        return s.z !== s.zT;
      };
      g.readout = () => {
        const head = "paper cake case, 7 cm across, about 0.4 g";
        if (!s.v) return `${head} · ${s.z.toFixed(1)} cm up${s.z === 0 ? " · on the surface" : ""}`;
        const f = (s.v / VT) ** 2;
        return `${head} · falling at ${(s.v / 100).toFixed(2)} m/s · air resistance ${(f * 100).toFixed(0)}% of its weight · ${f > 0.96 ? "terminal velocity: the forces balance, it falls at a steady speed" : "still speeding up"}`;
      };
      draw();
      return g;
    },
  });
})();
