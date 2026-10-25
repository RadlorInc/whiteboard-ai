// "hand cx cy k side=right|left pose=open|grip|point|pinch aim=down|wall|flat lab=0 lit=hand" — a PART (PARTS.md): an
// adult hand and wrist (no sleeve, no rings, short plain nails, one neutral skin tone), built by ISO.hand (cpr.js): a
// bevelled palm, four two-part fingers, a two-part thumb, and here a forearm that fades out a hand-span past the
// wrist. Its origin is the working point of the pose:
//   grip  — the middle of the closed fist: a handle goes through it along the aim (wall: −y, down: −z, flat: +x), so
//           placed at= a tool's handle (a screwdriver's grip, a wrench's arm) the hand holds it, thumb toward the tip;
//   point — the index fingertip, the finger pointing along the aim (flat: forward and down onto a surface);
//   pinch — between the index finger's tip and the thumb's;
//   open  — the middle of the palm's face: wall = palm on the wall, down = palm facing down (reaching down from above),
//           flat = lying palm down on a surface.
// side=left mirrors it. set({ pose, side, aim }) rebuilds it (a jump). Anchors: grip (the fist's middle, where a handle
// sits in the grip pose), tip (the index fingertip). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G;
  // ISO.hand's own skeleton (cpr.js), so the working point (a fingertip, the thumb's tip) is known before it is drawn
  const LEN = [[4.2, 3.6], [4.6, 4.0], [4.3, 3.7], [3.4, 2.9]], RAD = [0.84, 0.88, 0.84, 0.74], VS = [2.9, 0.95, -1.0, -2.9];
  const rot = (v, k, th) => { const c = Math.cos(th), s = Math.sin(th), d = G.dot3(k, v), x = G.cross3(k, v); return [0, 1, 2].map((i) => v[i] * c + x[i] * s + k[i] * d * (1 - c)); };
  function bonesOf({ o, a, n, side, curl, spread, shift = 0, thumb = {} }) {
    a = G.unit3(a); n = G.unit3(n);
    const t = side === "R" ? G.unit3(G.cross3(a, n)) : G.unit3(G.cross3(n, a)), k = G.unit3(G.cross3(a, n));
    const at = (u, v, w) => G.add3(o, G.add3(G.mul3(a, u), G.add3(G.mul3(t, v), G.mul3(n, w))));
    const fingers = [0, 1, 2, 3].map((i) => {
      let d0 = G.unit3(G.add3(a, G.mul3(t, Math.tan(spread[i]))));
      d0 = rot(d0, k, curl[i][0]);
      const b = at(9.1, VS[i] * (i === 3 ? 0.97 : 1) + shift, 0), m = G.add3(b, G.mul3(d0, LEN[i][0])), d1 = rot(d0, k, curl[i][1]), e = G.add3(m, G.mul3(d1, LEN[i][1]));
      return { m, e, d1, back: G.unit3(rot(G.mul3(n, -1), k, curl[i][0] + curl[i][1])) };
    });
    const { out = 0.7, down = 0.45, bend = 0.35 } = thumb;
    let d0 = G.unit3(G.add3(G.mul3(a, Math.cos(out)), G.mul3(t, Math.sin(out))));
    d0 = G.unit3(G.add3(d0, G.mul3(n, Math.tan(down))));
    const tb = at(2.0, 3.2, 0.5), tm = G.add3(tb, G.mul3(d0, 4.4)), d1 = G.unit3(rot(d0, G.unit3(G.cross3(d0, n)), bend)), te = G.add3(tm, G.mul3(d1, 3.1));
    return { at, a, n, t, fingers, thumb: { m: tm, e: te, d1, back: G.unit3(G.cross3(d1, G.cross3(G.mul3(n, -1), d1))) } };
  }
  const C = (c0, c1, n = 4) => Array.from({ length: n }, () => [c0, c1]);
  // the hand's own pose (curl, spread, thumb) and its working point in the hand's frame
  const POSES = {
    open: { curl: C(0.06, 0.08), spread: [0.1, 0.03, -0.05, -0.14], thumb: { out: 0.85, down: 0.1, bend: 0.12 }, work: (b) => b.at(4.8, 0, 1.3) },
    point: { curl: [[0.03, 0.05], [1.5, 1.7], [1.55, 1.7], [1.5, 1.65]], spread: [0.02, 0, -0.03, -0.06], thumb: { out: 0.35, down: 0.85, bend: 0.75 }, work: (b) => b.fingers[0].e },
    pinch: { curl: [[0.55, 0.62], [0.95, 1.05], [1.15, 1.2], [1.25, 1.25]], spread: [0.04, 0, -0.04, -0.08], thumb: { out: 0.5, down: 0.55, bend: 0.35 }, work: (b) => G.lerp3(b.fingers[0].e, b.thumb.e, 0.5) },
    grip: { curl: [[1.4, 1.5], [1.45, 1.55], [1.45, 1.55], [1.35, 1.5]], spread: [0.01, 0, -0.01, -0.03], thumb: { out: 0.1, down: 1.05, bend: 0.55 }, work: (b) => b.at(7.2, 0, 2.8) },
  };
  // the hand's frame in the world for a pose and an aim: a = toward the fingers, n = out of the palm; arm = the forearm
  function frameOf(pose, aim, left) {
    const v = (x, y, z) => G.unit3([x, y, z]);
    if (pose === "grip") {
      // H: the handle's axis (toward the tool's tip, where the thumb points), B: from the handle to the back of the hand
      const [H, B] = { wall: [v(0, -1, 0), v(0.25, 0, 1)], down: [v(0, 0, -1), v(0.35, 1, 0)], flat: [v(1, 0, 0), v(0, 0.2, 1)] }[aim];
      const a = left ? G.cross3(B, H) : G.cross3(H, B);
      return { a, n: G.mul3(B, -1), arm: v(...G.add3(G.mul3(a, -0.82), G.mul3(H, -0.57))) };
    }
    if (pose === "open") return { wall: { a: v(0, 0, 1), n: v(0, -1, 0), arm: v(0, 0.35, -1) }, down: { a: v(0, -1, 0), n: v(0, 0, -1), arm: v(0, 1, 0.75) }, flat: { a: v(0, -1, 0), n: v(0, 0, -1), arm: v(0, 1, 0.08) } }[aim];
    // point and pinch: the fingers along the aim, the back of the hand up (down: toward the room)
    return { wall: { a: v(0, -1, -0.12), n: v(0, 0, -1), arm: v(0, 1, 0.3) }, down: { a: v(0, -0.25, -1), n: v(0, -1, 0.25), arm: v(0, 0.6, 1) }, flat: { a: v(0, -1, -0.38), n: v(0, -0.38, -1), arm: v(0, 1, 0.2) } }[aim];
  }
  // ISO.hand draws in cpr.js's skin tint; this part swaps in a mid, neutral one
  const CPR_SKIN = ISO.tint("#f2d5bc", ["#c4916b", "#d1a27d", "#ddb491", "#e8c5a6"], "#6e4527");
  const SKIN = ISO.tint("#e3b892", ["#a9764f", "#b8865e", "#c79870", "#d5a982"], "#5c381c");
  let ids = 0;
  // everything of one hand: depth-sorted items (ISO.hand's parts, a forearm, the nails), the working point and anchors
  function handOf(P, pose, aim, left, k) {
    const ps = POSES[pose], fr = frameOf(pose, aim, left), side = left ? "L" : "R";
    const opts = { a: fr.a, n: fr.n, side, curl: ps.curl, spread: ps.spread, thumb: ps.thumb };
    const w = ps.work(bonesOf({ ...opts, o: [0, 0, 0] })), o = G.mul3(w, -1), b = bonesOf({ ...opts, o });
    const items = [...ISO.hand(P, { ...opts, o })];
    // the forearm: a tapering limb out of the wrist, fading out (no sleeve, no cut end)
    const id = `handfade${ids++}`, w0 = b.at(0.4, 0, 0), w1 = G.add3(w0, G.mul3(fr.arm, 16)), f0 = K.iso(G.add3(w0, G.mul3(fr.arm, 6)), P), f1 = K.iso(G.add3(w0, G.mul3(fr.arm, 14.5)), P);
    items.push({ c: G.lerp3(w0, w1, 0.5), svg: `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${f0[0].toFixed(1)}" y1="${f0[1].toFixed(1)}" x2="${f1[0].toFixed(1)}" y2="${f1[1].toFixed(1)}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="10000" height="10000"><rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#${id}g)"/></mask></defs><g mask="url(#${id})">${ISO.capsule(w0, w1, 2.35, 3.0, P)}</g>` });
    // short plain nails on the fingertips' backs, where they face you
    const view = G.viewOf(P);
    for (const [i, f] of [...b.fingers.map((f, i) => [i, f]), [4, b.thumb]]) {
      if (G.dot3(f.back, view) < 0.35) continue;
      const r = i === 4 ? 1.0 : RAD[i] * 0.88, s = G.unit3(G.cross3(f.d1, f.back)), c = G.add3(G.add3(f.e, G.mul3(f.d1, -0.85 * r)), G.mul3(f.back, r * 0.95));
      const pts = [[-0.5, -0.8], [0.15, -0.82], [0.38, -0.62], [0.48, -0.3], [0.5, 0], [0.48, 0.3], [0.38, 0.62], [0.15, 0.82], [-0.5, 0.8]].map(([u, q]) => K.iso(G.add3(c, G.add3(G.mul3(f.d1, u * r * 0.95), G.mul3(s, q * r * 0.52))), P));
      items.push({ c: G.add3(c, G.mul3(f.back, 0.3)), svg: `<path d="${K.pathOf(pts, true)}" fill="#ecc6a8" stroke="#8a5c3a" stroke-width="${Math.min(0.6, 0.09 * k).toFixed(2)}" stroke-linejoin="round"/>` });
    }
    return { items, anchors: { grip: b.at(7.2, 0, 2.8), tip: b.fingers[0].e }, wrist: w0 };
  }

  ISO.add({
    name: "hand", title: "Hand (part)", compare: null,
    about: "An adult hand and wrist in a neutral skin tone, posed open, gripping, pointing or pinching; its origin is the working point (the middle of the fist, the fingertip, between finger and thumb, or the palm), so placed at= a tool's handle it holds the tool. anchors: grip tip",
    line: "hand cx cy k side=right|left pose=open|grip|point|pinch aim=down|wall|flat lab=0 lit=hand",
    demo: { line: "hand 480 250 13 pose=open aim=wall lab=1", script: [{ set: {}, hold: 1 }, { set: { pose: "grip", lit: "hand" }, hold: 1.2 }, { set: { pose: "point", lit: "" }, hold: 1.2 }, { set: { pose: "pinch", aim: "down" }, hold: 1.2 }, { set: { side: "left", pose: "grip", aim: "flat" }, hold: 1.2 }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const s = { pose: POSES[o.pose] ? o.pose : "open", aim: ["down", "wall", "flat"].includes(o.aim) ? o.aim : "down", left: o.side === "left" };
      g.innerHTML = `<g data-name="hand"></g><g data-part="words"></g>`;
      const el = g.querySelector('[data-name="hand"]'), words = g.querySelector('[data-part="words"]'), w = ISO.writer();
      let lit = o.lit || "", hand = null;
      const draw = () => {
        w.light([el], lit === "hand" ? [el] : []);
        w.rebuild(words, lab ? `${s.pose} ${s.aim} ${s.left}` : "", () => !lab ? "" : ISO.word(K.iso(hand.wrist, P), `${s.left ? "left" : "right"} hand · ${s.pose}`, "#444", { size: 14, anchor: "start", dy: 34 }).replace('x="', 'dx="18" x="'));
      };
      // the hand's parts are made when first read (ISO.hand), one per idle slice in the first build (ISO.later)
      const build = () => {
        hand = handOf(P, s.pose, s.aim, s.left, k);
        g.anchors = hand.anchors;
        for (const x of hand.items) ISO.later(() => x.svg);
        ISO.later(() => { el.innerHTML = ISO.drawItems(P, hand.items).split(CPR_SKIN).join(SKIN); el._fresh = true; draw(); });
      };
      g.set = (p) => {
        let again = false;
        if (p.pose !== undefined && POSES[p.pose] && p.pose !== s.pose) { s.pose = p.pose; again = true; }
        if (p.aim !== undefined && p.aim !== s.aim && ["down", "wall", "flat"].includes(p.aim)) { s.aim = p.aim; again = true; }
        if (p.side !== undefined && (p.side === "left") !== s.left) { s.left = p.side === "left"; again = true; }
        if (p.lit !== undefined) lit = p.lit;
        if (again) build();
        draw();
      };
      g.update = () => false;
      g.readout = () => `${s.left ? "left" : "right"} hand · ${{ open: "open, palm flat", grip: "gripping a handle", point: "pointing", pinch: "pinching between finger and thumb" }[s.pose]} · ${{ wall: "toward the wall", down: "down", flat: "on a flat surface" }[s.aim]}`;
      build();
      draw();
      return g;
    },
  });
})();
