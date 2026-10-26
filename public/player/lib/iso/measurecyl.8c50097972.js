// "measurecyl cx cy k ml=10|25|50|100|250 fill=0..1 c=clear|blue|red|green|… lab=0 lit=glass|liquid|scale" — a PART
// (PARTS.md, batch 4): a borosilicate tall-form measuring cylinder (ISO 4788, class B) standing on the bench, origin the
// bench point under its middle. Real sizes (outer diameter × glass height): 10 mL 13 × 128, 25 mL 17 × 165, 50 mL
// 22 × 192, 100 mL 27 × 247, 250 mL 38 × 300 mm, the scale's length worked out from the bore so 1 mL is truly 1 mL.
// A hexagonal polypropylene foot with a socket ring, a pouring spout, graduations printed up the near side (every
// 1 mL for 10, 25, 50 and 100 mL, every 2 mL for 250; numbered every 1, 5, 5, 10, 10 mL), starting at a tenth of the
// capacity, and the cylinder's marking ("100 mL  In 20 °C  ± 1"). The liquid stands at fill × the capacity, its surface
// curved up at the glass: the reading is the bottom of the meniscus (as mcylinder.js). Built in mm; anchors in cm.
// set({ fill, c }).
(() => {
  const K = window.K, G = window.G;
  // ml: [outer diameter, wall, minor step, long every (mL), numbered every (mL), tolerance, foot across corners, first mark]
  const SIZES = { 10: [13, 1, 1, 5, 1, "0.2", 54, 1], 25: [17, 1.1, 1, 5, 5, "0.5", 64, 2], 50: [22, 1.2, 1, 5, 5, "1", 76, 5], 100: [27, 1.3, 1, 5, 10, "1", 92, 10], 250: [38, 1.6, 2, 10, 10, "2", 118, 20] };
  let clipN = 0;
  const FOOT = 6, BOT = 3, SOCK = 10;   // the foot's plate, the glass floor, the socket ring's height (mm)

  ISO.add({
    name: "measurecyl", title: "Measuring cylinder (part)", compare: null,
    about: "A glass measuring cylinder (10 to 250 mL, real sizes) on a hexagonal plastic foot, with a printed mL scale and a curved meniscus read at its bottom; a bench part to measure out a volume of liquid. anchors: rim inside",
    line: "measurecyl cx cy k ml=10|25|50|100|250 fill=0..1 c=clear|blue|red|green|… lab=0 lit=glass|liquid|scale",
    demo: { line: "measurecyl 480 420 13 ml=100 fill=0.3 c=blue", script: [{ set: { fill: 0.62 }, hold: "settle" }, { set: { lit: "scale" }, hold: 1.5 }, { set: { c: "green", fill: 0.45, lit: "liquid" }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ml = SIZES[o.ml] ? +o.ml : 100, [D, wall, step, longEvery, numEvery, tol, HX, m0] = SIZES[ml], R = D / 2, RIN = R - wall;
      const MM = 1000 / (Math.PI * RIN * RIN), zOf = (m) => BOT + m * MM;   // mm along the glass per mL; height of m mL
      const H = Math.round(zOf(ml) + Math.max(14, ml * MM * 0.12));
      const OUTER = [[0, R - 1], [1, R, 1], [H - 3, R], [H - 2, R + 0.9, 1], [H, R + 0.7]];
      const V = LAB.vessel(Pm, [0, 0, FOOT], OUTER, { base: BOT, wall, spout: true });
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.5), 0, 1), c0: o.c || "clear", c1: o.c || "clear", mixT: 1 }, want = { f: st.f };
      let lit = o.lit || "";
      // the foot: a hexagonal plate with a bevel, a raised round boss and the socket ring the glass is set into
      const hex = Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * HX / 2, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * HX / 2]);
      const PP = ISO.tint("#e9f1fb", ["#9fb6d2", "#b2c6de", "#c5d5e8", "#d6e2f0"], "#2f4f78");
      const Fz = LAB.Z([0, 0, 0]);
      const foot = ISO.tinted(PP, S(K.extrude(hex, 0, FOOT - 2, Pm, { bevel: 0.8 }), { tone: "mid" }) + S(K.cylinder(0, 0, R + 5, FOOT - 2, 2, Pm, 40, 0.4), { tone: "mid" }));
      // the socket ring round the glass's foot: a solid ring drawn over the glass, clipped away where the tube rises out
      // of it (the band above the front arc of the tube's circle at the ring's top), so the glass stands in the ring
      const ring = []; for (let i = 0; i < 64; i++) ring.push(K.iso(G.pointOf(Fz, FOOT + SOCK, R, (i / 64) * Math.PI * 2), Pm));
      const iL = ring.reduce((b, p, i) => (p[0] < ring[b][0] ? i : b), 0), iR = ring.reduce((b, p, i) => (p[0] > ring[b][0] ? i : b), 0);
      const walk = (i, j) => { const out = []; for (let n = i; ; n = (n + 1) % 64) { out.push(ring[n]); if (n === j) break; } return out; };
      const A = walk(iL, iR), B = walk(iR, iL), front = A.reduce((t, p) => t + p[1], 0) / A.length > B.reduce((t, p) => t + p[1], 0) / B.length ? A : B.reverse();
      const yTop = Math.min(...ring.map((p) => p[1])) - 4000, cid = `mcclip${clipN++}`;
      const band = K.pathOf([...front, [front.at(-1)[0], yTop], [front[0][0], yTop]], true);
      const socket = `<defs><clipPath id="${cid}"><path clip-rule="evenodd" d="M-1e5 -1e5H1e5V1e5H-1e5Z${band}"/></clipPath></defs><g clip-path="url(#${cid})">` +
        ISO.tinted(PP, S(K.cylinder(0, 0, R + 2.4, FOOT, SOCK, Pm, 48, 0.4), { tone: "mid", inner: L(K.sideArc(0, 0, R + 2.4, FOOT + SOCK - 3, Pm, 32), { tone: "faint" }) })) + "</g>";
      // the printed scale: a rule up the near side, ticks hanging from it (short, long every longEvery), the numbers
      // beside the long ones, and the marking above the top line
      const scale = () => {
        const a = V.facing - 0.35, r = R + 0.15, rule = [], minor = [], major = [], nums = [];
        const tick = (m) => (m % longEvery === 0 ? R * 0.62 : m % (longEvery / 2) === 0 && step === 1 ? R * 0.44 : R * 0.3);
        for (let s = zOf(m0); s <= zOf(ml) + 1e-6; s += (step * MM) / 2) rule.push(K.iso(G.pointOf(V.F, s, r, a), Pm));
        const sz = Math.max(2.6, Math.min(5, R * 0.34, numEvery * MM * 0.55));
        for (let i = 0, m = m0; m <= ml + 1e-6; m = m0 + ++i * step) {
          const s = zOf(m), n = tick(m), big = m % longEvery === 0;
          (big ? major : minor).push(K.pathOf([0, 0.5, 1].map((q) => K.iso(G.pointOf(V.F, s, r, a + (q * n) / R), Pm))));
          if (m % numEvery === 0) { const an = a + (R * 0.62 + sz * 0.9 + 0.8) / R; nums.push(LAB.faceText(Pm, G.pointOf(V.F, s - sz * 0.36, r + 0.1, an), G.mul3(G.tangentOf(V.F, an), -1), String(m), sz, "#2c4a63")); }
        }
        const mid = V.facing + 0.1, u = G.mul3(G.tangentOf(V.F, mid), -1), top = zOf(ml), msz = Math.max(2.4, Math.min(4.4, R * 0.3));
        return L(K.pathOf(rule), { tone: "mid" }) + L(minor.join(""), { tone: "lo", free: "end" }) + L(major.join(""), { tone: "mid", free: "end" }) + nums.join("") +
          LAB.faceText(Pm, G.pointOf(V.F, top + msz * 2.4, r + 0.1, mid), u, `${ml} mL`, msz * 1.15, "#2c4a63") + LAB.faceText(Pm, G.pointOf(V.F, top + msz * 1.15, r + 0.1, mid), u, `In 20 °C  ± ${tol}`, msz * 0.7, "#2c4a63");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX / 2, y: -HX / 2, w: HX, d: HX, r: HX / 4 }, 0, FOOT, Pm)}"/>${foot}` +
        `<g data-name="glass">${V.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-name="glass">${V.front()}</g>${socket}` +
        `<g data-name="scale" style="paint-order:stroke">${scale()}</g><g data-part="words"></g>`;
      g.anchors = { rim: [0, 0, (FOOT + H) / 10], inside: [0, 0, (FOOT + BOT) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      // a visible step: about a third of a board pixel of the surface's rise
      const q = Math.max(0.005, 1 / (3 * MM * G.scaleOf(Pm) * ml));
      const draw = () => {
        const f = Math.round(st.f / q) * q, s = zOf(f * ml), c = colour();
        w.rebuild(el.liquid, `${f.toFixed(4)} ${c}`, () => {
          if (f * ml < 0.05) return "";
          // the liquid to the meniscus bottom, then the meniscus: a thin crescent climbing up the wall
          const ink = LAB.ink(c), rise = Math.min(1.8, RIN * 0.16), lo = G.arcOf(V.F, s, RIN, Pm, { least: -0.3 }), hi = G.arcOf(V.F, s + rise, RIN, Pm, { least: -0.3 });
          return V.liquid(s, c, { meniscus: false }) + `<path d="${G.circleOf(V.F, s + rise, RIN, Pm)}" fill="none" stroke="${ink}" stroke-width="0.6" opacity=".55"/><path d="${hi}" fill="none" stroke="${ink}" stroke-width="0.9" opacity=".75"/><path d="${lo}" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
        });
        if (lab) w.rebuild(el.words, `${(st.f * ml).toFixed(1)} ${st.c1}`, () => LAB.word(Pm, lab, [0, 0, FOOT + H + 14], "measuring cylinder", "#556") + LAB.word(Pm, lab, V.at(Math.max(s, 10), -1.2, R * 0.6), `${(st.f * ml).toFixed(ml <= 25 ? 1 : 0)} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `${ml} mL measuring cylinder (${D} × ${H} mm) · bottom of the meniscus at ${(st.f * ml).toFixed(ml <= 25 ? 1 : 0)} mL of ${st.c1} liquid · marks every ${step} mL (± ${tol} mL)`;
      draw();
      return g;
    },
  });
})();
