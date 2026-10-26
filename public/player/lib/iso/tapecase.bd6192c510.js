// "tapecase cx cy k aim=up|right|flat out=0..300 lock=0|1 lab=0 lit=case|tape|hook" — a PART (PARTS.md): a 25 ft
// (7.5 m) tape measure, its origin the end of the blade's hook. A 1 in (2.54 cm) yellow steel blade with inch marks
// (quarters, halves, inches, numbered; every foot longer and red, with an F), a riveted steel hook with its lip, and
// the case: a yellow shell 8.5 × 8.2 × 4.4 cm with a black rubber bumper round it, the drum boss and its screws on
// the side, the lock slider on top, a steel belt clip on the back. The blade runs `out` cm from the hook to the
// case's mouth: aim=up up the wall (z; its face against the wall, the hook's lip on the floor holding it 9 mm off),
// aim=right along the wall (x), aim=flat along a surface (x; the lip over the surface's edge). The case slides
// along as `out` changes: pulled at about 60 cm/s, wound back by the spring at about 100 cm/s; lock=1 holds the
// blade (a set of `out` alone is ignored while locked). set({ out, lock }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const IN = 2.54, BW = IN, MAX = 300, STEEL = ISO.T.steel, RUBBER = ISO.T.rubber;
  const YEL = ISO.tint("#fbe27a", ["#d9a92a", "#e3b93f", "#ecc856", "#f3d56b"], "#6b5114"), BLADE = "#f5d33b";
  // the case's side outline in (f back from the mouth, h up from the surface)
  const CASE = [[0, 0], [7.2, 0], [8.5, 1.3], [8.5, 6.6], [7.0, 8.2], [1.4, 8.2], [0, 6.8]], T = 4.4;
  // e: from the hook toward the case; n: the blade face's normal, out of the surface it lies on; wd = e × n
  const AXES = { up: { e: [0, 0, 1], n: [0, 1, 0] }, right: { e: [1, 0, 0], n: [0, 1, 0] }, flat: { e: [1, 0, 0], n: [0, 0, 1] } };

  ISO.add({
    name: "tapecase", title: "Tape measure (part)", compare: null,
    about: "A 25 ft tape measure: yellow blade with inch marks (feet in red), a riveted hook, the case with its bumper, lock and belt clip; the hook is the origin and the blade runs out cm up the wall, along it or along a surface to the case. anchors: case",
    line: "tapecase cx cy k aim=up|right|flat out=0..300 lock=0|1 lab=0 lit=case|tape|hook",
    demo: { line: "tapecase 470 500 4.6 aim=up out=30.5 lab=1", script: [{ set: {}, hold: 0.8 }, { set: { out: 91.44, lit: "tape" }, hold: "settle" }, { set: { lock: 1, lit: "case" }, hold: 1.4 }, { set: { lock: 0, out: 61, lit: "hook" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = AXES[o.aim] ? o.aim : "up", { e, n } = AXES[aim], wd = G.cross3(e, n), V = G.viewOf(P);
      const hb = aim === "flat" ? 0.05 : 0.9;                       // the blade's height off its surface
      const at = (u, w, y) => [0, 1, 2].map((i) => e[i] * u + n[i] * w + wd[i] * y);
      const box = (U, W, Y, tone = "mid") => ISO.box(at, P, U, W, Y, tone);
      const pt = (u, w, y) => K.iso(at(u, w, y), P);
      const uid = `tc${Math.random().toString(36).slice(2, 8)}`;
      // ── the blade, drawn once at full length from the hook; a clip shows the part that is out
      const blade = [];
      {
        const z = hb, face = [pt(0, z, -BW / 2), pt(MAX, z, -BW / 2), pt(MAX, z, BW / 2), pt(0, z, BW / 2)];
        const sg = G.dot3(wd, V) > 0 ? 1 : -1;                      // the long edge that faces the viewer
        blade.push(`<path d="${K.pathOf([pt(0, z, sg * BW / 2), pt(MAX, z, sg * BW / 2), pt(MAX, z - 0.12, sg * BW / 2), pt(0, z - 0.12, sg * BW / 2)], true)}" fill="#c9a720" stroke="#6b5a10" stroke-width="0.4"/>`);
        blade.push(`<path d="${K.pathOf(face, true)}" fill="${BLADE}" stroke="#6b5a10" stroke-width="0.5"/>`);
        // ticks hang from the top edge (+wd, above the numbers as they read): what the board's scale can show
        const zt = z + 0.01, ticks = { q: [], h: [], i: [], f: [] }, nums = [];
        const showQ = 0.635 * k >= 2.5, showH = 1.27 * k >= 2.5, showN = IN * k >= 9;
        const down = G.mul3(wd, -1);                               // the board's camera is mirrored: text 'down' is −wd
        const mat = (s, w) => { const o0 = pt(s, zt, w), a1 = K.iso(G.add3(at(s, zt, w), e), P), b1 = K.iso(G.add3(at(s, zt, w), down), P); return `matrix(${(a1[0] - o0[0]).toFixed(3)} ${(a1[1] - o0[1]).toFixed(3)} ${(b1[0] - o0[0]).toFixed(3)} ${(b1[1] - o0[1]).toFixed(3)} ${o0[0].toFixed(2)} ${o0[1].toFixed(2)})`; };
        for (let q = 1; q * IN / 4 < MAX - 0.2; q++) {
          const s = (q * IN) / 4, kind = q % 48 === 0 ? "f" : q % 4 === 0 ? "i" : q % 2 === 0 ? "h" : "q";
          if ((kind === "q" && !showQ) || (kind === "h" && !showH)) continue;
          const len = { q: 0.35, h: 0.6, i: 0.95, f: 2.0 }[kind];
          ticks[kind].push(K.pathOf([pt(s, zt, BW / 2), pt(s, zt, BW / 2 - len)]));
          if ((kind === "i" || kind === "f") && showN) {
            const inch = q / 4, foot = kind === "f";
            nums.push(`<g transform="${mat(s - 0.12, -0.55)}"><text font-size="${foot ? 0.85 : 0.75}" font-weight="700" fill="${foot ? "#c0281e" : "#222"}" text-anchor="end" font-family="Helvetica Neue,Arial">${foot ? `${inch / 12}F` : inch}</text></g>`);
          }
        }
        blade.push(`<path d="${ticks.q.join("")}" stroke="#222" stroke-width="0.3"/><path d="${ticks.h.join("")}" stroke="#222" stroke-width="0.4"/><path d="${ticks.i.join("")}" stroke="#111" stroke-width="0.55"/><path d="${ticks.f.join("")}" stroke="#c0281e" stroke-width="0.7"/>`, nums.join(""));
      }
      // ── the hook: a steel tab riveted to the blade's end, bent through 90° into a lip that catches the edge
      const lipLo = aim === "flat" ? -0.9 : 0;
      const hook = ISO.tinted(STEEL, (aim === "flat" ? box([-0.08, 0], [lipLo, hb + 0.08], [-BW / 2 - 0.12, BW / 2 + 0.12], "hi") + box([0, 1.8], [hb, hb + 0.08], [-BW / 2 - 0.12, BW / 2 + 0.12], "hi")
        : box([0, 1.8], [hb, hb + 0.08], [-BW / 2 - 0.12, BW / 2 + 0.12], "hi") + box([-0.08, 0], [lipLo, hb + 0.08], [-BW / 2 - 0.12, BW / 2 + 0.12], "hi"))) +
        D([pt(0.95, hb + 0.09, -0.6), pt(0.95, hb + 0.09, 0.6)], { size: 0.45, tone: "hi" });
      // ── the case at the mouth (built at out = 0, slid along e)
      const caseSvg = (lock) => {
        const sg = G.dot3(wd, V) > 0 ? 1 : -1, Fc = G.frameOf([0, 0, 0], wd, e, n), out = [];
        out.push(ISO.tinted(RUBBER, S(G.prismOf(Fc, CASE.map(([f, h]) => [4.25 + (f - 4.25) * 1.045, 4.1 + (h - 4.1) * 1.045]), -1.1, 1.1, P), { tone: "mid" })));
        out.push(ISO.tinted(YEL, S(G.prismOf(Fc, CASE, -T / 2, T / 2, P), { tone: "mid" })));
        // the steel belt clip on the back, the mouth's hook guard on the front: only where that face is seen
        if (G.dot3(e, V) > 0) out.push(ISO.tinted(STEEL, box([8.5, 8.75], [2, 7.2], [-1.5, 1.5], "hi")));
        else out.push(ISO.tinted(STEEL, box([-0.15, 0], [hb + 0.15, hb + 1.4], [-1.6, 1.6], "hi")));
        // the drum boss on the side, its centre screw, three case screws
        const Fb = G.frameAlong(at(4.3, 4.1, sg * T / 2), G.mul3(wd, sg));
        out.push(ISO.tinted(YEL, S(G.disc(0, 0.3, 2.9, Fb, P, { steps: 40 }), { tone: "hi", inner: K.lineSvg(G.circleOf(Fb, 0.3, 2.2, P), { tone: "lo" }) })));
        out.push(ISO.tinted(STEEL, S(G.disc(0.3, 0.5, 0.75, Fb, P, { steps: 20 }), { tone: "hi" })));
        out.push(D([pt(4.3, 4.1, sg * (T / 2 + 0.52))], { size: 0.45, tone: "hi" }));
        out.push(D([[1.1, 1.0], [7.4, 1.0], [1.4, 7.2]].map(([f, h]) => pt(f, h, sg * (T / 2 + 0.01))), { size: 0.45 }));
        // the lock slider in its slot on top: forward and down = locked
        out.push(`<path d="${K.pathOf([pt(1.3, 8.21, -0.55), pt(4.0, 8.21, -0.55), pt(4.0, 8.21, 0.55), pt(1.3, 8.21, 0.55)], true)}" fill="#3a3216" stroke="#6b5114" stroke-width="0.5"/>`);
        const f0 = 2.4 - 0.9 * lock;
        out.push(`<g data-part="lock">${ISO.tinted(ISO.T.red, box([f0, f0 + 1.5], [8.2, 8.95 - 0.35 * lock], [-0.5, 0.5], "hi"))}</g>`);
        return out.join("");
      };
      g.innerHTML = `<clipPath id="${uid}"><path data-hold=""/></clipPath><g data-name="tape" clip-path="url(#${uid})">${blade.join("")}</g>` +
        `<g data-name="hook">${hook}</g><g data-name="case"></g><g data-part="words"></g>`;
      const q = (s) => g.querySelector(s), el = { clip: q(`#${uid} path`), tape: q('[data-name="tape"]'), hook: q('[data-name="hook"]'), case: q('[data-name="case"]'), words: q('[data-part="words"]') };
      const w = ISO.writer(), parts = [el.tape, el.hook, el.case];
      const s = { out: ISO.clamp(ISO.num(o, "out", 60), 0, MAX), lock: o.lock === "1" ? 1 : 0 }, goal = { out: s.out, lock: s.lock };
      let lit = o.lit || "";
      const draw = () => {
        const L = Math.max(0.01, s.out);
        el.clip.setAttribute("d", K.pathOf(ISO.hullOf([0, L].flatMap((u) => [-1.6, 1.6].flatMap((y) => [-1.5, hb + 0.4].map((wv) => pt(u, wv, y))))), true));
        w.attr(el.case, "transform", K.translateAlong(P, G.mul3(e, s.out)));
        w.rebuild(el.case, s.lock.toFixed(2), () => caseSvg(s.lock));
        g.anchors.case = at(s.out + 4.3, 4.1, (G.dot3(wd, V) > 0 ? 1 : -1) * T / 2);
        const inch = s.out / IN;
        w.rebuild(el.words, lab ? `${Math.round(inch * 4)}` : "", () => {
          if (!lab) return "";
          const p = pt(s.out + 4.3, 4.1, 0), side = aim === "up" ? 1 : 0;
          return ISO.word([p[0] + side * 34, p[1] - (1 - side) * 40 + side * 5], `${(Math.round(inch * 4) / 4).toFixed(2).replace(/\.00$/, "").replace(/\.50$/, "½").replace(/\.25$/, "¼").replace(/\.75$/, "¾")} in`, "#1f4f8f", { size: 15, anchor: aim === "up" ? "start" : "middle" });
        });
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.lock !== undefined) goal.lock = +p.lock ? 1 : 0;
        if (p.out !== undefined && (goal.lock === 0 || p.lock !== undefined)) goal.out = ISO.clamp(+p.out, 0, MAX);
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        if (s.out === goal.out && s.lock === goal.lock) return false;
        const calm = ISO.still(), st = (goal.out > s.out ? 60 : 100) * dt;
        s.out = calm || Math.abs(goal.out - s.out) <= st ? goal.out : s.out + Math.sign(goal.out - s.out) * st;
        // the slider moves once the blade has stopped (the thumb locks it, then lets go before a new pull)
        if (s.out === goal.out || goal.lock === 0) { s.lock = ISO.follow(s.lock, goal.lock, dt, 0.08, calm); if (Math.abs(s.lock - goal.lock) < 0.01) s.lock = goal.lock; }
        draw();
        return s.out !== goal.out || s.lock !== goal.lock;
      };
      g.readout = () => {
        const inch = s.out / IN, eighths = Math.round(inch * 8), whole = Math.floor(eighths / 8), frac = eighths % 8;
        const f = frac ? ` ${["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"][frac]}` : "";
        return `tape out ${whole}${f} in = ${s.out.toFixed(1)} cm ${aim === "up" ? "up the wall" : aim === "right" ? "along the wall" : "along the surface"}${s.lock > 0.5 ? " · locked" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
