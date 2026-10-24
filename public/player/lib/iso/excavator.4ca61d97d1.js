// "excavator cx cy length pose=rest|dig|curl|raise|dump lab=1 lit=boom|stick|bucket|rams|tracks|cab" — a tracked digger.
// Two steel tracks (sprocket, idler, rollers, grousers) carry the slewing upper: engine house, counterweight, the cab
// with its glass, and the digging arm: a bent boom, the stick and a toothed bucket, each worked by a hydraulic ram
// whose chrome rod slides out of its barrel. The demo digs into the trench, curls the bucket full, raises it and dumps
// the soil on the heap. Every ram's length comes from the pin positions, so the readout's lengths are the drawing's.
// 1 unit = 5 cm (boom 4.5 m, stick 2.75 m, bucket 0.5 m³).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const GROUND = { x: -92, y: -46, w: 290, d: 92, r: 4 }, PIT = { x: 96, w: 50, y: -16, d: 26, depth: 26 }, AY = -4, B0 = [22, 46], UNIT = 0.05;
  const POSE = { rest: [30, -110, -40], dig: [10, -105, 35], curl: [12, -82, 115], raise: [46, -60, 100], dump: [40, -32, -78] };
  const Y = ISO.tint("#ffd84d", ["#c99a12", "#d9ab1f", "#e7bd33", "#f2cd45"], "#6b5208"), YC = ["#c99a12", "#ffe27a"], DIRT = ["#7a5a3a", "#b08860"];
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), named = (n, svg) => `<g data-name="${n}">${svg}</g>`, rad = (d) => (d * Math.PI) / 180;
  const loc = (o, th, u, w) => [o[0] + u * Math.cos(th) - w * Math.sin(th), o[1] + u * Math.sin(th) + w * Math.cos(th)];
  const prism = (P, pts, y0, y1, cols, face, ink) => ISO.prismY(P, pts, y0, y1, cols, face, ink);

  function groundSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(GROUND, -10, 10, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(GROUND, -10, 10, P, 4, 0.6), { tone: "mid" }))];
    // the trench: a dark pit with its far and side walls
    const p = PIT, top = (x, y) => K.iso([x, y, 0], P), bot = (x, y) => K.iso([x, y, -p.depth], P);
    out.push(`<path d="${K.pathOf([top(p.x, p.y), top(p.x + p.w, p.y), top(p.x + p.w, p.y + p.d), top(p.x, p.y + p.d)], true)}" fill="#6b5236" stroke="#3d2c1a" stroke-width="0.8"/>`);
    const hole = K.pathOf([top(p.x, p.y), top(p.x + p.w, p.y), top(p.x + p.w, p.y + p.d), top(p.x, p.y + p.d)], true), cid = `ex-pit-${Math.random().toString(36).slice(2, 7)}`;
    out.push(`<defs><clipPath id="${cid}"><path d="${hole}"/></clipPath></defs><g clip-path="url(#${cid})"><path d="${K.pathOf([top(p.x, p.y), top(p.x + p.w, p.y), bot(p.x + p.w, p.y), bot(p.x, p.y)], true)}" fill="#8a6a48"/><path d="${K.pathOf([top(p.x, p.y), top(p.x, p.y + p.d), bot(p.x, p.y + p.d), bot(p.x, p.y)], true)}" fill="#7a5c3c"/><path d="${K.pathOf([bot(p.x, p.y), bot(p.x + p.w, p.y), bot(p.x + p.w, p.y + p.d), bot(p.x, p.y + p.d)], true)}" fill="#5a4430"/></g><path d="${hole}" fill="none" stroke="#3d2c1a" stroke-width="0.8"/>`);
    // the spoil heap beyond the trench
    const F = G.frameOf([172, -4, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(`<g style="${ISO.tint("#d6b48a", ["#8a6a48", "#9c7a56", "#ad8a64", "#bd9a72"], "#4a3420")}">${S(G.solidOf([[0, 24], [6, 18, 1], [12, 10, 1], [15, 4, 1], [16, 0]], F, P), { tone: "hi" })}</g>`);
    return out.join("");
  }
  function trackSvg(P, y0, y1, near) {
    const loop = [...ISO.arc(48, 11, 11, -Math.PI / 2, Math.PI / 2, 14), ...ISO.arc(-48, 12, 12, Math.PI / 2, Math.PI * 1.5, 14)];
    const out = [prism(P, loop, y0, y1, ["#26272b", "#5a5c61"], "#3e3f44", "#121214")];
    const gz = [], k = K.cameraOf(P).k;
    for (let x = -46; x <= 46; x += 6) gz.push(K.pathOf([K.iso([x, y0, 23 - (x + 48) / 96], P), K.iso([x, y1, 23 - (x + 48) / 96], P)]));
    out.push(`<path d="${gz.join("")}" stroke="#121214" stroke-width="${(0.7 * k).toFixed(2)}"/>`);
    if (near) {
      const f = y1 + 0.05, inner = [...ISO.arc(46, 11, 7, -Math.PI / 2, Math.PI / 2, 10), ...ISO.arc(-46, 12, 8, Math.PI / 2, Math.PI * 1.5, 10)];
      out.push(`<path d="${K.pathOf(inner.map(([x, z]) => K.iso([x, f, z], P)), true)}" fill="${"#c9a21c"}" stroke="#6b5208" stroke-width="0.7"/>`);
      for (const [x, z, r] of [[-30, 5, 3.4], [-15, 5, 3.4], [0, 5, 3.4], [15, 5, 3.4], [30, 5, 3.4], [-12, 18, 2.4], [14, 18, 2.4], [46, 11, 6.4], [-46, 12, 7.4]]) {
        const F = yAx([x, 0, z]);
        out.push(S(G.disc(f - 0.4, f + 0.8, r, F, P, { steps: 20 }), { tone: "mid" }), D([K.iso([x, f + 0.85, z], P)], { size: 0.7, tone: "lo" }));
      }
      out.push(D(G.dotsOf(yAx([-46, 0, 12]), f + 0.82, 4.6, 8, P, { all: true }), { size: 0.7, tone: "lo" }));
    }
    return named("tracks", out.join(""));
  }
  function upperSvg(P) {
    const out = [S(K.cylinder(0, 0, 18, 24, 6, P, 40, 0.4), { tone: "mid" })];
    out.push(ISO.tinted(Y, ISO.wbox(P, [-44, 38], [-25, 25], [30, 35], "hi")));
    // engine house with its grille, the curved counterweight at the back, the exhaust stack
    out.push(ISO.tinted(Y, ISO.wbox(P, [-44, -4], [-25, 4], [35, 58], "hi")));
    const slots = []; for (let x = -40; x < -8; x += 4) slots.push(K.pathOf([[x, 4.05, 40], [x + 2, 4.05, 40], [x + 2, 4.05, 53], [x, 4.05, 53]].map((p) => K.iso(p, P)), true));
    out.push(`<path d="${slots.join("")}" fill="#8a6414" stroke="#6b5208" stroke-width="0.4"/>`);
    out.push(prism(P, [[-44, 30], [-44, 56], [-50, 52], [-53, 42], [-51, 33]], -25, 25, ["#6b6e73", "#b6b9be"], "#8d9096", "#2f343a"));
    out.push(S(K.cylinder(-30, -10, 2, 58, 12, P, 16), { tone: "mid" }), S(K.cylinder(-30, -10, 2.6, 70, 1.6, P, 16), { tone: "mid" }));
    return out.join("");
  }
  function cabSvg(P) {
    const out = [ISO.tinted(Y, ISO.wbox(P, [-6, 20], [6, 25], [35, 80], "hi"))];
    const win = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#cfe1ee" stroke="#33506f" stroke-width="0.8"/>`;
    out.push(win([[-3, 25.05, 44], [17, 25.05, 44], [17, 25.05, 77], [-3, 25.05, 77]]), win([[20.05, 8, 46], [20.05, 23, 46], [20.05, 23, 77], [20.05, 8, 77]]));
    out.push(`<path d="${K.pathOf([[7, 25.1, 44], [7, 25.1, 77]].map((p) => K.iso(p, P)))}" stroke="#33506f" stroke-width="1.2"/>`, D([K.iso([4, 25.1, 60], P)], { size: 1, tone: "hi" }));
    out.push(ISO.wbox(P, [-7, 21], [5, 26], [80, 82], "mid"));
    return named("cab", out.join(""));
  }
  // A ram from pin a to pin b (x, z) in the arm plane at y: a fixed barrel and the chrome rod sliding out of it.
  // A round bar drawn as strokes (edge, body, shine): cheap enough to redraw every frame.
  const bar = (P, a, b, r, [edge, body, shine]) => {
    const k = K.cameraOf(P).k, d = K.pathOf([K.iso(a, P), K.iso(b, P)]);
    return `<path d="${d}" stroke="${edge}" stroke-width="${(2 * r * k + 1).toFixed(2)}" stroke-linecap="round"/><path d="${d}" stroke="${body}" stroke-width="${(2 * r * k - 0.4).toFixed(2)}" stroke-linecap="round"/><path d="${d}" stroke="${shine}" stroke-width="${(0.6 * r * k).toFixed(2)}" stroke-linecap="round" transform="translate(0 ${(-0.45 * r * k).toFixed(2)})"/>`;
  };
  // A ram from pin a to pin b (x, z) in the arm plane at y: a fixed-length barrel and the chrome rod sliding out of it.
  function ramSvg(P, a, b, y, rb, rr, barrel) {
    const d = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(...d), bl = Math.min(barrel, len - 3), m = [a[0] + (d[0] * bl) / len, a[1] + (d[1] * bl) / len];
    return bar(P, [m[0], y, m[1]], [b[0], y, b[1]], rr, ["#5d636a", "#e9ecef", "#ffffff"]) + bar(P, [a[0], y, a[1]], [m[0], y, m[1]], rb, ["#6b5208", "#e7bd33", "#ffe27a"]) +
      D([K.iso([a[0], y, a[1]], P), K.iso([b[0], y, b[1]], P)], { size: 1.1, tone: "hi" });
  }
  // The arm at joint angles [boom, stick relative, bucket relative]; returns the svg and the pins for the readout.
  function armSvg(P, [a, b, c], loaded) {
    const ta = rad(a), ts = rad(a + b), tb = rad(a + b + c);
    const T = loc(B0, ta, 90, 0), Sp = loc(T, ts, 55, 0), Bk = (u, w) => loc(Sp, tb, u, w);
    const boom = [[-5, 6], [44, 18], [57, 18], [94, 5], [94, -5], [55, 7], [44, 7], [-5, -6]].map(([u, w]) => loc(B0, ta, u, w));
    const stick = [[-17, 3], [-11, 9], [0, 6], [57, 3], [57, -3], [-4, -5], [-17, -2]].map(([u, w]) => loc(T, ts, u, w));
    const bucket = [[-3, 4], [-4, -3], [1, -10], [10, -13], [18, -10], [24, -3], [26, 1], [5, 6]].map(([u, w]) => Bk(u, w));
    const pins = { boomA: [14, 32], boomB: loc(B0, ta, 40, -7), stickA: loc(B0, ta, 54, 19), stickB: loc(T, ts, -15, 6), bucketA: loc(T, ts, 8, 6), bucketB: Bk(-6, 8) };
    const out = [];
    out.push(named("boom", prism(P, boom, AY - 4, AY + 4, YC, "#f2cd45", "#6b5208")));
    out.push(named("rams", ramSvg(P, pins.boomA, pins.boomB, AY + 6, 3, 1.8, 30)));
    out.push(named("stick", prism(P, stick, AY - 3, AY + 3, YC, "#f2cd45", "#6b5208")));
    out.push(named("rams", ramSvg(P, pins.stickA, pins.stickB, AY, 2.6, 1.5, 34) + ramSvg(P, pins.bucketA, pins.bucketB, AY, 2.2, 1.3, 26)));
    const teeth = [AY - 6, AY - 2, AY + 2, AY + 6].map((y) => ISO.box((u, w, yy) => { const [x, z] = Bk(u, w); return [x, yy, z]; }, P, [25, 30], [-0.6, 1.6], [y - 1.2, y + 1.2], "hi")).join("");
    out.push(named("bucket", prism(P, bucket, AY - 8, AY + 8, ["#4f5257", "#a5a9ae"], "#7d8186", "#2f343a") + ISO.tinted(ISO.T.steel, teeth) +
      (loaded ? prism(P, [[24, 1], [18, 7], [10, 10], [4, 7], [5, 6]].map(([u, w]) => Bk(u, w)), AY - 7, AY + 7, DIRT, "#9c7a56", "#4a3420") : "")));
    out.push(`<path d="${[B0, T, Sp].map((p) => G.circleOf(yAx([p[0], 0, p[1]]), AY + 8.2, 2.6, P)).join("")}" fill="#d9dadd" stroke="#3c3f45" stroke-width="0.8"/>`, D([B0, T, Sp].map((p) => K.iso([p[0], AY + 8.3, p[1]], P)), { size: 0.8, tone: "hi" }));
    return { svg: out.join(""), pins, tip: Bk(28, 0) };
  }

  ISO.add({
    name: "excavator", title: "Excavator", compare: "excavator 480 280 480",
    about: "A tracked digger: tracks with rollers, cab, boom, stick and a toothed bucket, worked by hydraulic rams that extend and retract as it digs the trench and dumps on the heap.",
    line: "excavator cx cy length pose=rest|dig|curl|raise|dump lab=1 lit=boom|stick|bucket|rams|tracks|cab",
    demo: { line: "excavator 480 290 480", script: ["dig", "curl", "raise", "dump", "rest"].map((pose) => ({ set: { pose }, hold: "settle" })) },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(GROUND, -10, 0), [140, 0, 120], [-50, 0, 82]], cx, cy, W, H, { azimuth: 72, elevation: 20 }, parent);
      const s = { j: [...(POSE[o.pose] || POSE.rest)], pose: POSE[o.pose] ? o.pose : "rest", loaded: false };
      g.innerHTML = `<g>${groundSvg(P)}${trackSvg(P, -30, -12, false)}</g><g>${trackSvg(P, 12, 30, true)}</g><g>${upperSvg(P)}${cabSvg(P)}</g><g data-part="armclip"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      // the ground in front of the trench hides whatever of the bucket is below ground: clip the arm there
      const ny = PIT.y + PIT.d, a1 = K.iso([PIT.x, ny, 0], P), a2 = K.iso([PIT.x + PIT.w, ny, 0], P), cid = `ex-${Math.random().toString(36).slice(2, 7)}`;
      el.armclip.innerHTML = `<defs><clipPath id="${cid}"><path clip-rule="evenodd" d="M-2000 -2000H3000V3000H-2000Z${K.pathOf([a1, a2, [a2[0], a2[1] + 2000], [a1[0], a1[1] + 2000]], true)}"/></clipPath></defs><g clip-path="url(#${cid})"></g>`;
      el.arm = el.armclip.lastElementChild;
      let lit = o.lit || "", pins = null;
      const draw = () => {
        w.rebuild(el.arm, `${s.j.map((v) => v.toFixed(2))} ${s.loaded}`, () => { const r = armSvg(P, s.j, s.loaded); pins = r.pins; return r.svg; });
        w.rebuild(el.words, "w", () => !lab ? "" : ISO.word(K.iso([PIT.x + PIT.w / 2, PIT.y + PIT.d, 0], P), "trench", "#555", { size: 14, dy: 30 }) + ISO.word(K.iso([172, 20, 0], P), "spoil heap", "#555", { size: 14, dy: 22 }) +
          ISO.word(K.iso([7, 25, 82], P), "cab", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([0, 30, 0], P), "tracks", "#555", { size: 14, dy: 22 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.pose && POSE[p.pose]) s.pose = p.pose; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const goal = POSE[s.pose];
        let moving = false;
        s.j = s.j.map((v, i) => { const n = ISO.follow(v, goal[i], dt, 0.55, ISO.still()); if (Math.abs(n - goal[i]) < 0.05) return goal[i]; moving = true; return n; });
        // soil goes in as the bucket curls in the trench and falls out as it opens over the heap
        const tb = s.j[0] + s.j[1] + s.j[2];
        if (s.pose === "curl" && s.j[2] > 80) s.loaded = true;
        if (s.pose === "dump" && tb < -40) s.loaded = false;
        draw();
        return moving;
      };
      g.readout = () => {
        if (!pins) return "";
        const len = (a, b) => (Math.hypot(a[0] - b[0], a[1] - b[1]) * UNIT).toFixed(2);
        return `${s.pose} · boom ram ${len(pins.boomA, pins.boomB)} m · stick ram ${len(pins.stickA, pins.stickB)} m · bucket ram ${len(pins.bucketA, pins.bucketB)} m · bucket ${s.loaded ? "full, 0.5 m³ of soil (about 0.9 t)" : "empty"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
