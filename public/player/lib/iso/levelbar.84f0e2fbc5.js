// "levelbar cx cy k aim=flat|wall len=20..120 tilt=-5..5 lab=0 lit=level|bubble" — a PART (PARTS.md): an aluminium
// box-section spirit level, its origin the middle of its bottom (measuring) face. A 5.8 × 2.6 cm extruded body
// (4.4 cm under 40 cm long) with milled grooves, rubber end caps, a cm ruler along the top edge, the centre vial in a
// window through the body (read from the side and from the top), a plumb vial near the right end and a hand hole near
// the left. aim=flat: standing on its measuring face on a surface (y −1.3..1.3); aim=wall: held against the wall,
// its back face on the wall (y 0..2.6). tilt (degrees, + = right end high) turns the level about its origin, and the
// bubble runs toward the high end by R·θ (vial radius R = 80 cm: 1° = 14 mm) until it reaches the vial's end at about
// ±1.6°; the bubble sits inside the rings (±0.5 mm) when level to within about 0.6 mm per metre. set({ tilt }) eases it. World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const ALU = ISO.tint("#e6e9ec", ["#9aa1a9", "#aeb4bb", "#c1c6cc", "#d2d6da"], "#4a525b"), RUBBER = ISO.T.rubber;
  const D = 2.6, RV = 80, VL = 5.6, BUB = 1.5, RING = 0.8, CAP = 1.4, SPIRIT = "#dde56a", INK = "#4a525b";

  function levelSvg(P, len, aim, th) {
    const H = len < 40 ? 4.4 : 5.8, y0 = aim === "wall" ? 0 : -D / 2, y1 = y0 + D, half = len / 2, c = Math.cos(th), s = Math.sin(th);
    const m = ([x, y, z]) => [x * c - z * s, y, x * s + z * c];
    const at = (u, w, y) => m([u, y, w]), box = (U, W, Y, tone) => ISO.box(at, P, U, W, Y, tone);
    const pt = (x, y, z) => K.iso(m([x, y, z]), P);
    const side = (pts, fill, stroke = INK, wd = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => pt(x, y1 + 0.01, z)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${wd}"/>`;
    const top = (pts, fill, stroke = INK, wd = 0.6) => `<path d="${K.pathOf(pts.map(([x, y]) => pt(x, y, H + 0.01)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${wd}"/>`;
    const rect = (x0, x1, a0, a1) => [[x0, a0], [x1, a0], [x1, a1], [x0, a1]];
    const out = [];
    // far cap, the body, near cap (back to front along x)
    out.push(ISO.tinted(RUBBER, box([-half, -half + CAP], [-0.05, H + 0.15], [y0 - 0.1, y1 + 0.1], "hi")));
    out.push(ISO.tinted(ALU, box([-half + CAP, half - CAP], [0, H], [y0, y1], "hi")));
    out.push(ISO.tinted(RUBBER, box([half - CAP, half], [-0.05, H + 0.15], [y0 - 0.1, y1 + 0.1], "hi")));
    // the caps' grip ribs across their top, edge to edge
    out.push(`<path d="${[-half + 0.45, -half + 0.9, half - 0.9, half - 0.45].map((x) => K.pathOf([pt(x, y0 - 0.1, H + 0.16), pt(x, y1 + 0.1, H + 0.16)])).join("")}" stroke="#121214" stroke-width="0.5"/>`);
    const x0 = -half + CAP, x1 = half - CAP;
    // milled grooves along the side face and the measuring face's edge line, cap to cap
    out.push(`<path d="${[0.7, H - 0.7].map((z) => K.pathOf([pt(x0, y1 + 0.01, z), pt(x1, y1 + 0.01, z)])).join("")}" stroke="#7d858e" stroke-width="0.5" fill="none"/>`);
    // the cm ruler along the top's front edge: a tick every cm, longer every 5, longest every 10, hanging from the edge
    const vw = VL / 2 + 1.1, ticks = [[], [], []];
    for (let i = Math.ceil(x0 + 0.5); i <= x1 - 0.5; i++) {
      if (Math.abs(i) < vw + 0.4) continue;
      const n = Math.round(i - (-half)), kind = n % 10 === 0 ? 2 : n % 5 === 0 ? 1 : 0, l = [0.35, 0.55, 0.8][kind];
      ticks[kind].push(K.pathOf([pt(i, y1, H), pt(i, y1 - l, H)]));
    }
    out.push(`<path d="${ticks[0].join("")}" stroke="#6a727b" stroke-width="0.35"/><path d="${ticks[1].join("")}" stroke="#4a525b" stroke-width="0.45"/><path d="${ticks[2].join("")}" stroke="#262b31" stroke-width="0.55"/>`);
    // the hand hole near the left end, a closed slot through the body (seen dark)
    if (len >= 50) out.push(side([[x0 + 4, 1.9], [x0 + 12, 1.9], [x0 + 12.9, H / 2], [x0 + 12, H - 1.9], [x0 + 4, H - 1.9], [x0 + 3.1, H / 2]], "#3a3e44"));
    // the plumb vial near the right end: a window, the spirit standing upright, its bubble at the top, two lines
    if (len >= 30) {
      const px = x1 - (len >= 50 ? 6 : 3.4);
      out.push(side(rect(px - 1.3, px + 1.3, 1, H - 1), "#3a3e44"), side(rect(px - 0.75, px + 0.75, 1.4, H - 1.4), SPIRIT, "#6b6410"));
      out.push(`<path d="${[H / 2 - 0.5, H / 2 + 0.5].map((z) => K.pathOf([pt(px - 0.75, y1 + 0.02, z), pt(px + 0.75, y1 + 0.02, z)])).join("")}" stroke="#222" stroke-width="0.5"/>`);
      // its bubble rises to the top of the upright vial (the level is near horizontal, so the plumb vial is near vertical)
      const pb = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; pb.push([px + Math.cos(a) * 0.5, H - 1.4 - 0.55 + Math.sin(a) * 0.4]); }
      out.push(side(pb, "#fbfdf0", "#7c7a20", 0.5));
    }
    // a printed rating plate between the centre window and the plumb vial: three rule lines of text, two rivets
    if (len >= 50) {
      const a0 = vw + 3, a1 = vw + 12;
      out.push(side(rect(a0, a1, H / 2 - 1.2, H / 2 + 1.2), "#eef0f2", "#55534c", 0.5));
      out.push(`<path d="${[0.55, 0, -0.55].map((dz, i) => K.pathOf([pt(a0 + 0.8, y1 + 0.02, H / 2 + dz), pt(a1 - 0.8 - i * 2, y1 + 0.02, H / 2 + dz)])).join("")}" stroke="#8a877f" stroke-width="0.35" data-free=""/>`);
    }
    // a rivet through each rubber cap's side
    out.push(K.dotsSvg([-half + CAP / 2, half - CAP / 2].map((x) => pt(x, y1 + 0.11, H / 2)), { size: 0.5, tone: "hi" }));
    // the centre window, through the body: on the side face and on the top
    out.push(side(rect(-vw, vw, 0.9, H - 0.9), "#3a3e44"), side(rect(-VL / 2, VL / 2, H / 2 - 1.1, H / 2 + 1.1), SPIRIT, "#6b6410"));
    out.push(top(rect(-vw, vw, y0 + 0.55, y1 - 0.55), "#3a3e44"), top(rect(-VL / 2, VL / 2, y0 + 0.8, y1 - 0.8), SPIRIT, "#6b6410"));
    out.push(`<g data-part="bubble"></g>`);
    out.push(`<path d="${[-RING, RING].map((x) => K.pathOf([pt(x, y1 + 0.02, H / 2 - 1.1), pt(x, y1 + 0.02, H / 2 + 1.1)]) + K.pathOf([pt(x, y0 + 0.8, H + 0.02), pt(x, y1 - 0.8, H + 0.02)])).join("")}" stroke="#222" stroke-width="0.6"/>`);
    // the bubble's drawing, at b cm from the middle: an oval on the side and one on the top
    const bubble = (b) => {
      const sideL = [], topL = [];
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; sideL.push([b + Math.cos(a) * BUB / 2, H / 2 + 0.55 + Math.sin(a) * 0.42]); topL.push([b + Math.cos(a) * BUB / 2, (y0 + y1) / 2 + Math.sin(a) * 0.38]); }
      return side(sideL, "#fbfdf0", "#7c7a20", 0.5) + top(topL, "#fbfdf0", "#7c7a20", 0.5);
    };
    return { svg: out.join(""), bubble };
  }

  ISO.add({
    name: "levelbar", title: "Spirit level (part)", compare: null,
    about: "An aluminium spirit level with a centre vial (read from the side and top), a plumb vial, rubber caps and a cm ruler; it stands on a surface (flat) or is held against the wall; tilt turns it and the bubble runs to the high end. anchors: none",
    line: "levelbar cx cy k aim=flat|wall len=20..120 tilt=-5..5 lab=0 lit=level|bubble",
    demo: { line: "levelbar 480 310 9 aim=flat len=60 tilt=1.2 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { tilt: 0, lit: "bubble" }, hold: "settle" }, { set: { tilt: -0.4, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = o.aim === "wall" ? "wall" : "flat", len = ISO.clamp(ISO.num(o, "len", 60), 20, 120);
      const halo = aim === "flat" ? `<path class="iso-halo" d="${K.haloOf({ x: -len / 2 - 1, y: -D / 2 - 1, w: len + 2, d: D + 2, r: 1 }, -0.1, 1, P)}"/>` : "";
      g.innerHTML = `${halo}<g data-name="level"></g><g data-part="words"></g>`;
      const el = { level: g.querySelector('[data-name="level"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const t0 = ISO.clamp(ISO.num(o, "tilt", 0), -5, 5), travel = VL / 2 - BUB / 2;
      const want = (tilt) => ISO.clamp(RV * (tilt * Math.PI) / 180, -travel, travel);   // bubble offset, cm
      const s = { tilt: t0, bub: want(t0) }, goal = { tilt: t0 };
      let lit = o.lit || "", built = null, bubEl = null;
      const draw = () => {
        const key = s.tilt.toFixed(3);
        if (!built || built.key !== key) {
          built = { key, ...levelSvg(P, len, aim, (s.tilt * Math.PI) / 180) };
          el.level.innerHTML = built.svg; el.level._fresh = true;
          bubEl = el.level.querySelector('[data-part="bubble"]'); bubEl.dataset.name = "bubble";
        }
        w.rebuild(bubEl, `${key} ${s.bub.toFixed(3)}`, () => built.bubble(s.bub));
        w.rebuild(el.words, lab ? `${key} ${Math.abs(s.tilt) < 0.05}` : "", () => {
          if (!lab) return "";
          const p = K.iso([0, aim === "wall" ? D : D / 2, (len < 40 ? 4.4 : 5.8) + 1], P);
          return ISO.word(p, Math.abs(s.tilt) < 0.05 ? "level: bubble between the rings" : `bubble toward the high ${s.tilt > 0 ? "right" : "left"} end`, Math.abs(s.tilt) < 0.05 ? "#2c6a22" : "#8f2a22", { size: 14, dy: -14 });
        });
        const parts = [el.level, bubEl];
        w.light(parts, lit === "level" ? [el.level] : lit === "bubble" ? [bubEl] : []);
      };
      g.set = (p) => {
        if (p.tilt !== undefined) goal.tilt = ISO.clamp(+p.tilt, -5, 5);
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        const calm = ISO.still(), step = 1.2 * dt;               // a hand eases it about 1.2° a second
        const target = want(goal.tilt);
        if (s.tilt === goal.tilt && s.bub === target) return false;
        s.tilt = calm || Math.abs(goal.tilt - s.tilt) <= step ? goal.tilt : s.tilt + Math.sign(goal.tilt - s.tilt) * step;
        s.bub = ISO.follow(s.bub, want(s.tilt), dt, 0.3, calm);  // the bubble lags the vial by about 0.3 s
        if (s.tilt === goal.tilt && Math.abs(s.bub - target) < 0.005) s.bub = target;
        draw();
        return s.tilt !== goal.tilt || s.bub !== target;
      };
      g.readout = () => {
        const mm = Math.tan((Math.abs(s.tilt) * Math.PI) / 180) * 1000;
        if (Math.abs(s.tilt) < 0.05) return `${len} cm spirit level · level: bubble between the rings`;
        return `${len} cm spirit level · ${Math.abs(s.tilt).toFixed(1)}° = ${mm.toFixed(0)} mm per metre, ${s.tilt > 0 ? "right" : "left"} end high · bubble ${(Math.abs(s.bub) * 10).toFixed(0)} mm off centre${Math.abs(s.bub) >= travel - 0.01 ? " (at the end of the vial)" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
