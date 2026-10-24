// "ladder cx cy height open=0-1 lab=1 lit=steps|rails|spreader|cap|feet" — an A-frame step ladder that opens.
// A 1.8 m aluminium step ladder: the front section's two rails carry five ribbed treads, the rear section's rails are
// tied by round braces, both hinge under the red top cap (with its tool tray), and two folding spreader bars join
// them at mid-height. Rubber shoes on all four feet. Opening swings the rear section out until the front rails stand at
// 75° to the floor (out 1 for every 4 up) and the spreaders pull straight and snap into their lock: then, and only then,
// it is safe to climb. set({ open }) folds or opens it. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const LF = 180, LR = 180, FA = (15 * Math.PI) / 180, RA = FA, YW = 21, RW = 7, RT = 2.4;
  const STEPS = [36, 64, 92, 120, 148], SPR = 0.52, SA = 0.5;   // spreader pivots at 52 % up both rails
  const ALU = ISO.tint("#e6e9ec", ["#9aa1a9", "#aeb4bb", "#c1c6cc", "#d2d6da"], "#4a525b"), RED = ISO.tint("#f4a59a", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a"), RUBBER = ISO.T.rubber;
  const FLOOR = { x: -70, y: -40, w: 140, d: 80, r: 4 };
  // The pose for open fraction f: the front and rear rails' angles from vertical, the hinge height.
  const pose = (f) => { const a = FA * f, b = RA * f, top = LF * Math.cos(a); return { a, b, top, front: LF * Math.sin(a), rear: -LR * Math.sin(b) }; };
  // A point along a rail: s from the foot (0) to the top, w across its depth (x-ish), at side y.
  const railAt = (p, side) => (s, w, y) => {
    const ang = side > 0 ? p.a : -p.b, foot = side > 0 ? p.front : p.rear;
    return [foot - Math.sin(ang) * s + Math.cos(ang) * w, y, Math.cos(ang) * s + Math.sin(ang) * w];
  };

  function railSvg(P, p, side, y) {
    const at = railAt(p, side), len = side > 0 ? LF : LR, out = [];
    out.push(ISO.tinted(ALU, ISO.box(at, P, [0, len - 4], [-RW / 2, RW / 2], [y - RT / 2, y + RT / 2], "hi")));
    out.push(ISO.tinted(RUBBER, ISO.box(at, P, [-1, 5], [-RW / 2 - 0.6, RW / 2 + 0.6], [y - RT / 2 - 0.4, y + RT / 2 + 0.4], "hi")));
    return out.join("");
  }
  function treadsSvg(P, p) {
    const out = [];
    for (const s of STEPS) {
      const c = railAt(p, 1)(s, 0, 0), x0 = c[0] - 4.5, x1 = c[0] + 4.5;
      out.push(ISO.tinted(ALU, ISO.wbox(P, [x0, x1], [-YW + RT / 2, YW - RT / 2], [c[2] - 2.2, c[2]], "hi")));
      out.push(`<path d="${[-2.5, 0, 2.5].map((dx) => K.pathOf([K.iso([c[0] + dx, -YW + RT / 2, c[2]], P), K.iso([c[0] + dx, YW - RT / 2, c[2]], P)])).join("")}" stroke="#7d858e" stroke-width="0.6" fill="none"/>`);
    }
    return out.join("");
  }
  function bracesSvg(P, p) {
    return [40, 90, 140].map((s) => { const c = railAt(p, -1)(s, 0, 0); return ISO.tinted(ALU, S(G.disc(-YW + RT / 2, YW - RT / 2, 1.2, G.frameOf(c, [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 16 }), { tone: "hi" })); }).join("");
  }
  // A spreader at side y: two flat bars from the front and rear rails meeting at a knee that drops below the line
  // until the bars pull straight (locked).
  function spreaderSvg(P, p, y) {
    const A = railAt(p, 1)(LF * SPR, -RW / 2, 0), B = railAt(p, -1)(LR * SPR, RW / 2, 0), mx = (A[0] + B[0]) / 2, mz = (A[2] + B[2]) / 2;
    const half = Math.hypot(A[0] - B[0], A[2] - B[2]) / 2, a = Math.max(half, spanOpen() / 2), drop = Math.sqrt(Math.max(0, a * a - half * half));
    const knee = [mx, y, mz - drop], out = [];
    for (const E of [A, B]) {
      const dx = knee[0] - E[0], dz = knee[2] - E[2], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
      out.push(ISO.tinted(ALU, ISO.box((u, w, yy) => [E[0] + ux * u - uz * w, yy, E[2] + uz * u + ux * w], P, [-0.8, l + 0.8], [-1, 1], [y - 0.3, y + 0.3], "mid")));
    }
    out.push(ISO.tinted(ALU, S(G.disc(-0.4, 0.4, 1.3, G.frameOf(knee, [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 16 }), { tone: "hi" })), D([A, B, knee].map((q) => K.iso([q[0], y + 0.4, q[2]], P)), { size: 0.6, tone: "hi" }));
    return out.join("");
  }
  const spanOpen = () => { const p = pose(1), A = railAt(p, 1)(LF * SPR, -RW / 2, 0), B = railAt(p, -1)(LR * SPR, RW / 2, 0); return Math.hypot(A[0] - B[0], A[2] - B[2]); };
  function capSvg(P, p) {
    const x = (railAt(p, 1)(LF, 0, 0)[0] + railAt(p, -1)(LR, 0, 0)[0]) / 2, z = p.top;
    return ISO.tinted(RED, ISO.wbox(P, [x - 9, x + 9], [-YW - 2, YW + 2], [z - 6, z], "hi") + `<path d="${K.pathOf([[x - 6, -YW + 3], [x + 6, -YW + 3], [x + 6, YW - 3], [x - 6, YW - 3]].map(([a, b]) => K.iso([a, b, z], P)), true)}" fill="#a3271b" stroke="#5e120a" stroke-width="0.6"/>`) +
      D([[x + 9, YW + 2.01], [x - 9, YW + 2.01]].map(([a, b]) => K.iso([a, b, z - 3], P)), { size: 0.6, tone: "hi" });
  }

  ISO.add({
    name: "ladder", title: "Step ladder", compare: "ladder 480 280 400",
    about: "An A-frame step ladder: the rear legs swing out until the front rails stand at 75° and the spreaders lock straight.",
    line: "ladder cx cy height open=0-1 lab=1 lit=steps|rails|spreader|cap|feet",
    demo: { line: "ladder 480 280 400 open=0", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.8, H = size * 1.15;
      const p1 = pose(1);
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -3, 0), [0, -YW, LF + 2], [0, YW, LF + 2], [p1.front + 6, YW, 0], [p1.rear - 6, -YW, 0]], cx, cy, W, H, { azimuth: 62, elevation: 16 }, parent);
      const names = ["far", "sprfar", "braces", "treads", "sprnear", "near", "cap", "words"];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(FLOOR, -3, 3, P)}"/>` + ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -3, 3, P, 4, 0.6), { tone: "mid" })) + `<path class="iso-halo" data-part="shadow"/>` + names.map((n) => `<g data-k="${n}"></g>`).join("");
      const el = Object.fromEntries([...names, "shadow"].map((n) => [n, g.querySelector(`[data-k="${n}"],[data-part="${n}"]`)])), w = ISO.writer();
      const s = { open: ISO.clamp(ISO.num(o, "open", 1), 0, 1) }, goal = { open: s.open };
      let lit = o.lit || "";
      const draw = () => {
        const q = Math.round(s.open * 60) / 60, p = pose(q), key = q.toFixed(4);   // 60 poses: rebuilt only when the pose steps
        w.rebuild(el.far, key, () => railSvg(P, p, -1, -YW) + railSvg(P, p, 1, -YW));
        w.rebuild(el.sprfar, key, () => spreaderSvg(P, p, -YW + RT / 2 + 0.4));
        w.rebuild(el.braces, key, () => bracesSvg(P, p));
        w.rebuild(el.treads, key, () => treadsSvg(P, p));
        w.rebuild(el.sprnear, key, () => spreaderSvg(P, p, YW - RT / 2 - 0.4));
        w.rebuild(el.near, key, () => railSvg(P, p, -1, YW) + railSvg(P, p, 1, YW));
        w.rebuild(el.cap, key, () => capSvg(P, p));
        w.attr(el.shadow, "d", K.haloOf({ x: p.rear - 4, y: -YW - 3, w: p.front - p.rear + 8, d: 2 * YW + 6, r: 4 }, 0, 1, P));
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" : [
          ISO.word(K.iso([0, YW + 2, p.top + 1], P), "top cap", "#8f2a22", { size: 15, dy: -10 }),
          ISO.word(K.iso(railAt(p, 1)(STEPS[1], 4.5, YW), P), "steps", "#444", { anchor: "start", size: 15, dy: 5 }),
          ISO.word(K.iso(railAt(p, -1)(LR * SPR, 0, YW), P), s.open > 0.995 ? "spreader locked" : "spreader", s.open > 0.995 ? "#2c6a22" : "#444", { anchor: "end", size: 15, dy: 18 }),
          s.open > 0.9 ? ISO.word(K.iso([(p.front + p.rear) / 2, YW + 4, 0], P), `${Math.round(90 - (p.a * 180) / Math.PI)}° to the floor`, "#444", { size: 14, dy: 22 }) : ""].join(""));
        const moving = s.open !== goal.open, want = lit || (moving ? "rails" : s.open > 0.995 ? "spreader" : "");
        const groups = { rails: [el.far, el.near], spreader: [el.sprfar, el.sprnear], steps: [el.treads], cap: [el.cap], feet: [el.far, el.near] };
        w.light(Object.values(groups).flat(), groups[want] || []);
      };
      g.set = (p) => { if (p.open !== undefined) goal.open = ISO.clamp(+p.open, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        s.open = ISO.follow(s.open, goal.open, dt, 0.45, ISO.still());
        if (Math.abs(s.open - goal.open) < 1e-3) s.open = goal.open;
        draw();
        return s.open !== goal.open;
      };
      g.readout = () => {
        const p = pose(s.open);
        if (s.open < 0.02) return `folded · ${Math.round(LF)} cm long, both sections together`;
        return `front rails at ${(90 - (p.a * 180) / Math.PI).toFixed(1)}° · feet ${Math.round(p.front - p.rear)} cm apart · top ${Math.round(p.top)} cm up${s.open > 0.995 ? " · spreaders locked: safe to climb (out 1 for every 4 up)" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
