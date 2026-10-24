// "oilbottle cx cy height cap=0|1 pour=0-4 lab=1 lit=jug" — topping up the engine oil from a 5 L jug.
// A yellow 5-litre jug with a moulded handle, a screw cap on an offset spout, a printed grade label (5W-30) and a
// see-through level stripe with litre marks. Beside it, the top of the engine: block, rocker cover with bolts and the
// oil filler neck, its yellow cap lying upside down, and a funnel standing in the neck. set({ cap: 1 }) takes the jug's
// cap off; set({ pour: L }) lifts and tips the jug over the funnel and pours until L litres have gone in (about
// 0.25 L a second), then stands it back up. The oil in the stripe stays level with the world as the jug tips: its height
// is solved from the oil's volume against the jug's own outline. World units are millimetres.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // the jug's side outline (y, z), spout at -y, handle at +y; x is its thickness
  const BODY = [[-92, 0], [92, 0], [100, 8], [100, 226], [92, 236], [-34, 236], [-50, 250], [-100, 250], [-100, 8]];
  const HANDLE = [[20, 235], [24, 282], [40, 296], [92, 296], [106, 282], [110, 250], [100, 226], [92, 240], [92, 268], [82, 278], [50, 278], [40, 268], [40, 235]];
  const JX = [-62, 62], SPOUT = [-75, 272], CAPACITY = 5.6, FULL = 5, RATE = 0.25, TIP = 72 * Math.PI / 180;
  const STRIPE = { y0: 62, y1: 80, z0: 16, z1: 220 };
  const BLOCK = { x: -100, y: -190, w: 200, d: 210, r: 4 }, COVER = { x: -80, y: -170, w: 160, d: 170, r: 8 }, NECK = [0, -62], TOPZ = 140;
  const FLOOR = { x: -130, y: -220, w: 290, d: 540, r: 8 };
  const REST = [0, 190, 0], FUNNEL_TOP = TOPZ + 12 + 104, CAP_OFF = [96, 330, 0];
  const YELLOW = ISO.tint("#ffe27a", ["#c9a21c", "#d8b22a", "#e6c23a", "#f2d24f"], "#6b5208");
  const OIL = "#c98a1a", GREY = ISO.tint("#8a9097", ["#454a51", "#535960", "#62686f", "#71777e"], "#1d2024");

  // polygon helpers: area, and the part below the line a·y + b·z = c
  const area = (pts) => Math.abs(pts.reduce((s, [y, z], i) => { const [y2, z2] = pts[(i + 1) % pts.length]; return s + y * z2 - y2 * z; }, 0)) / 2;
  function below(pts, a, b, c) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
      if (fp <= 0) out.push(p);
      if ((fp < 0) !== (fq < 0) && fp !== fq) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  }
  const A_BODY = area(BODY);
  // the oil surface in jug coordinates for `litres` at tilt θ: the line sinθ·y + cosθ·z = c
  function surfaceOf(litres, th) {
    const a = Math.sin(th), b = Math.cos(th), want = A_BODY * litres / CAPACITY;
    let lo = Math.min(...BODY.map(([y, z]) => a * y + b * z)), hi = Math.max(...BODY.map(([y, z]) => a * y + b * z));
    for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; area(below(BODY, a, b, mid)) < want ? (lo = mid) : (hi = mid); }
    return [a, b, (lo + hi) / 2];
  }
  const rot = (th, off) => ([y, z]) => [y * Math.cos(th) - z * Math.sin(th) + off[1], y * Math.sin(th) + z * Math.cos(th) + off[2]];

  function engineSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BLOCK, 0, TOPZ, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -6, 6, P, 6, 0.6), { tone: "lo" }))];
    out.push(S(K.slabOf(BLOCK, 0, 100, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BLOCK, 70, P, 3), { tone: "faint" }) }));
    const fins = [];
    for (let y = BLOCK.y + 14; y < BLOCK.y + BLOCK.d - 6; y += 16) fins.push(K.segment([BLOCK.x + BLOCK.w, y, 0], [BLOCK.x + BLOCK.w, y, 70], P));
    out.push(L(fins.join(""), { tone: "faint" }));
    out.push(S(K.slabOf(K.insetPlan(BLOCK, 12), 100, 6, P, 4, 0.4), { tone: "lo" }));
    out.push(S(K.slabOf(COVER, 106, TOPZ - 106, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(COVER, 116, P, 8), { tone: "faint" }) }));
    const bolts = [[-66, -156], [66, -156], [-66, -14], [66, -14], [-66, -85], [66, -85]];
    out.push(L(bolts.map(([x, y]) => K.ring(x, y, 5, TOPZ, P, 16)).join(""), { tone: "lo" }), D(bolts.map(([x, y]) => K.iso([x, y, TOPZ], P)), { size: 0.6 }));
    for (const y of [-140, -110]) out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: -14, y: y - 9, w: 28, d: 18, r: 3 }, TOPZ, 14, P, 3, 0.6), { tone: "hi" })));
    // filler neck with its thread, and the yellow cap lying upside down beside it
    const neck = [S(K.cylinder(NECK[0], NECK[1], 26, TOPZ, 4, P, 48), { tone: "mid" }), S(K.cylinder(NECK[0], NECK[1], 22, TOPZ + 4, 12, P, 48, 0.4), { tone: "hi", inner: L([TOPZ + 7, TOPZ + 10, TOPZ + 13].map((z) => K.sideArc(NECK[0], NECK[1], 22, z, P, 32)).join(""), { tone: "lo" }) })];
    neck.push(`<path d="${K.pathOf(K.circleRing(NECK[0], NECK[1], 16, 40).map(([x, y]) => K.iso([x, y, TOPZ + 16], P)), true)}" fill="#3a3324"/>`, L(K.ring(NECK[0], NECK[1], 16, TOPZ + 16, P, 40), { tone: "lo" }));
    out.push(`<g data-name="neck">${neck.join("")}</g>`);
    const cap = [46, -100];
    out.push(`<g data-name="oilcap">${ISO.tinted(YELLOW, S(K.cylinder(cap[0], cap[1], 24, TOPZ, 12, P, 48, 0.5), { tone: "hi", inner: L(K.knurl(cap[0], cap[1], 24, TOPZ, TOPZ + 12, 40, P, 0), { tone: "lo" }) }) +
      S(K.cylinder(cap[0], cap[1], 17, TOPZ + 12, 6, P, 40), { tone: "hi" }) + L(K.ring(cap[0], cap[1], 12, TOPZ + 18, P, 32), { tone: "lo" }))}</g>`);
    // the funnel: stem down into the neck, the cone, a rolled rim and the dark oil in its throat
    const F = G.frameOf([NECK[0], NECK[1], TOPZ + 12], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    const funnel = [S(G.solidOf([[0, 8], [26, 9.5], [32, 13, 1], [38, 20, 1], [100, 52]], F, P, { rims: "last" }), { tone: "hi" })];
    funnel.push(S(G.ringBand(100, 104, 49, 55, F, P), { tone: "hi" }), `<path d="${G.circleOf(F, 104, 49, P)}" fill="#4a3a1c"/>`, L(G.circleOf(F, 104, 49, P), { tone: "lo" }));
    funnel.push(S(K.slabOf({ x: -3, y: NECK[1] + 50, w: 6, d: 16, r: 1 }, TOPZ + 88, 16, P, 2), { tone: "mid" }));
    out.push(`<g data-name="funnel">${ISO.tinted(GREY, funnel.join(""))}</g>`);
    if (lab) {
      out.push(ISO.word(K.iso([NECK[0], NECK[1] - 60, FUNNEL_TOP - 20], P), "Funnel", "#555", { anchor: "start", size: 15 }));
      out.push(ISO.word(K.iso([BLOCK.x + BLOCK.w, BLOCK.y + 60, 0], P), "Engine, oil filler", "#555", { dy: 26, size: 15 }));
    }
    return out.join("");
  }

  // The jug at tilt th and offset off: handle, body, the label and the level stripe on its near face.
  function jugSvg(P, th, off, litres, lab) {
    const T = rot(th, off), at = ([y, z], x = JX[1]) => K.iso([x + off[0], ...T([y, z])], P);
    const face = ["#c9a21c", "#ffe27a"], fill = "#f7d754", ink = "#6b5208";
    const out = [ISO.prismX(P, HANDLE.map(T), JX[0] + 22 + off[0], JX[1] - 22 + off[0], face, fill, ink), ISO.prismX(P, BODY.map(T), JX[0] + off[0], JX[1] + off[0], face, fill, ink)];
    // parting line round the shoulder, and the round spout neck with its thread and open mouth
    out.push(`<path d="${K.pathOf([[-100, 222], [100, 222]].map((p) => at(p)))}" stroke="${ink}" stroke-width="0.7"/>`);
    const base = T([SPOUT[0], 250]), Fn = G.frameOf([off[0], base[0], base[1]], [0, -Math.sin(th), Math.cos(th)], [1, 0, 0], [0, Math.cos(th), Math.sin(th)]);
    out.push(S(G.disc(0, 22, 20, Fn, P), { tone: "hi", inner: L(G.arcOf(Fn, 8, 20, P) + G.arcOf(Fn, 13, 20, P), { tone: "lo" }) }));
    out.push(`<path d="${G.circleOf(Fn, 22, 15, P)}" fill="#7a5410"/>`, L(G.circleOf(Fn, 22, 15, P), { tone: "lo" }));
    const o = at([0, 0], JX[1] + 0.3), a = at([-1, 0], JX[1] + 0.3), b = at([0, -1], JX[1] + 0.3);
    const m = `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`;
    let lbl = `<rect x="-42" y="-176" width="128" height="112" rx="8" fill="#2f3a45"/><rect x="-34" y="-168" width="112" height="2.5" fill="#ffd84a"/>`;
    if (lab) lbl += `<text x="22" y="-130" text-anchor="middle" fill="#fff" style="font:700 30px 'Helvetica Neue',Arial,sans-serif">OIL</text><text x="22" y="-92" text-anchor="middle" fill="#ffd84a" style="font:700 24px 'Helvetica Neue',Arial,sans-serif">5W-30</text>`;
    lbl += `<text x="22" y="-72" text-anchor="middle" fill="#c9d1d9" style="font:600 10px 'Helvetica Neue',Arial,sans-serif">5 L</text>`;
    out.push(`<g transform="${m}">${lbl}</g>`);
    // the see-through stripe: empty part pale, the oil below the world-level surface, litre marks hanging off its edge
    const stripe = [[STRIPE.y0, STRIPE.z0], [STRIPE.y1, STRIPE.z0], [STRIPE.y1, STRIPE.z1], [STRIPE.y0, STRIPE.z1]];
    const [sa, sb, sc] = surfaceOf(litres, th), oil = below(stripe, sa, sb, sc);
    const at2 = (p) => at(p, JX[1] + 0.4);
    out.push(`<path d="${K.pathOf(stripe.map(at2), true)}" fill="#fff4cc"/>`);
    if (oil.length > 2) out.push(`<path d="${K.pathOf(oil.map(at2), true)}" fill="${OIL}"/>`);
    const ticks = [];
    for (let l = 1; l <= FULL; l++) {
      const z = levelZ(l);
      ticks.push(K.pathOf([at2([STRIPE.y1, z]), at2([STRIPE.y1 + (l % 5 ? 7 : 11), z])]));
    }
    out.push(L(K.pathOf(stripe.map(at2), true), { tone: "mid" }), L(ticks.join(""), { tone: "mid", free: "end" }));
    return `<g data-name="jug">${ISO.tinted(YELLOW, out.join(""))}</g>`;
  }
  // upright oil height for a volume, for the litre marks
  const levelZ = (l) => surfaceOf(l, 0)[2];
  function jugCapSvg(P, at) {
    const [x, y, z] = at;
    return ISO.tinted(ISO.T.plastic, S(K.cylinder(x, y, 23, z, 24, P, 40, 0.5), { tone: "hi", inner: L(K.knurl(x, y, 23, z, z + 24, 40, P, 0), { tone: "lo" }) }) + L(K.ring(x, y, 15, z + 24, P, 28), { tone: "lo" }));
  }

  ISO.add({
    name: "oilbottle", title: "Motor oil jug", compare: "oilbottle 480 270 260",
    about: "A 5 L jug of 5W-30 beside the engine's filler neck: cap off, tip it over the funnel, and the level in its stripe drops as a litre goes in.",
    line: "oilbottle cx cy height cap=0|1 pour=0-4 lab=1 lit=jug|funnel|neck|oilcap",
    demo: { line: "oilbottle 480 270 260", script: [{ set: { cap: 1, lit: "jug" }, hold: "settle" }, { set: { pour: 1, lit: "funnel" }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0";
      const pourOff = (() => { const p = rot(TIP, [0, 0, 0])(SPOUT); return [0, NECK[1] - p[0], FUNNEL_TOP + 70 - p[1]]; })();
      const pourPts = BODY.concat(HANDLE).map(rot(TIP, pourOff));
      const W = size * 2.9, H = size * 1.62;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -6, 0), ...K.boxCorners(BLOCK, 0, TOPZ), [JX[1], REST[1] + 110, 300], ...pourPts.map(([y, z]) => [JX[1], y, z]), ...pourPts.map(([y, z]) => [JX[0], y, z])], cx, cy, W, H, { azimuth: 24, elevation: 24 }, parent);
      g.innerHTML = `<g>${engineSvg(P, lab)}</g><g data-part="jug"></g><g data-part="stream"></g><g data-part="cap"></g>`;
      const q = (s) => g.querySelector(`[data-part="${s}"]`), jug = q("jug"), cap = q("cap"), stream = q("stream"), w = ISO.writer();
      const s = { cap: +(o.cap === "1"), k: 0, poured: 0, flow: 0 };
      const want = { cap: s.cap, poured: ISO.clamp(ISO.num(o, "pour", 0), 0, 4) };
      if (want.poured > 0) { want.cap = s.cap = 1; s.poured = want.poured; }
      let lit = o.lit || "jug";
      const pose = () => {
        const e = ISO.ease(s.k), th = TIP * e;
        const off = REST.map((v, i) => v + (pourOff[i] - v) * e + (i === 2 ? Math.sin(Math.PI * e) * 60 : 0));
        return { th, off };
      };
      const draw = () => {
        const { th, off } = pose(), litres = FULL - s.poured;
        w.rebuild(jug, `${th.toFixed(4)} ${off.map((v) => v.toFixed(1))} ${litres.toFixed(3)}`, () => jugSvg(P, th, off, litres, lab));
        // the cap rides the spout while it is on; off, it goes up, across and down to the floor
        const c = s.cap, onSpout = [REST[0], REST[1] + SPOUT[0], SPOUT[1]];
        const capAt = onSpout.map((v, i) => v + (CAP_OFF[i] - v) * ISO.ease(c) + (i === 2 ? Math.sin(Math.PI * c) * 50 : 0));
        w.rebuild(cap, capAt.map((v) => v.toFixed(1)).join(), () => jugCapSvg(P, capAt));
        const tip = rot(th, off)(SPOUT);
        w.rebuild(stream, s.flow > 0.02 ? `${s.flow.toFixed(2)} ${tip.map((v) => v.toFixed(1))}` : "", () => {
          if (s.flow <= 0.02) return "";
          const F = G.frameOf([0, NECK[1], FUNNEL_TOP + 2], [0, 0, 1], [1, 0, 0], [0, 1, 0]), r = 5 * s.flow;
          return `<g opacity="${Math.min(1, s.flow * 1.4).toFixed(2)}" style="${ISO.tint("#e6a63c", ["#9c5f0c", "#b06f14", "#c4821f", "#d6942c"], "#6a3f06")}">${S(G.disc(0, Math.max(1, tip[1] - FUNNEL_TOP - 4), r, F, P), { tone: "hi" })}</g>`;
        });
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.cap !== undefined) want.cap = +p.cap ? 1 : 0;
        if (p.pour !== undefined) { want.poured = ISO.clamp(+p.pour, 0, 4); if (want.poured > s.poured) want.cap = 1; }
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) { s.cap = want.cap; s.poured = Math.max(s.poured, want.poured); s.k = 0; s.flow = 0; draw(); return false; }
        s.cap = ISO.follow(s.cap, want.cap, dt, 0.3);
        if (Math.abs(s.cap - want.cap) < 2e-3) s.cap = want.cap;
        const pouring = s.cap === 1 && s.poured < want.poured - 1e-4;
        // tip while there is oil to pour; pour only once the spout is over the funnel; stand up when done
        const kTarget = pouring ? 1 : 0, speed = dt / 1.4;
        s.k = Math.abs(kTarget - s.k) <= speed ? kTarget : s.k + Math.sign(kTarget - s.k) * speed;
        const flowing = pouring && s.k > 0.97;
        if (flowing) s.poured = Math.min(want.poured, s.poured + RATE * dt);
        s.flow = ISO.follow(s.flow, flowing ? 1 : 0, dt, 0.15);
        if (s.flow < 0.01 && !flowing) s.flow = 0;
        draw();
        return s.cap !== want.cap || pouring || s.k !== 0 || s.flow > 0;
      };
      g.readout = () => {
        const left = FULL - s.poured;
        if (s.flow > 0.02) return `pouring · ${s.poured.toFixed(2)} L in · ${left.toFixed(2)} L left in the jug`;
        if (s.poured > 0) return `${s.poured.toFixed(1)} L poured in · jug ${left.toFixed(1)} of 5 L · wait 2 min, then check the dipstick`;
        return s.cap ? "cap off · 5W-30, 5 L full" : "5 L jug of 5W-30 · cap on";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
