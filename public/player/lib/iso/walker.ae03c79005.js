// "walker cx cy height k=walker h=71-91 roll=cm lab=1 lit=grip|button|wheel|foot|frame" — a two-wheeled walking frame.
// An aluminium frame: two side frames with foam hand grips, a front cross-bar, four legs whose lower tubes slide in
// the upper ones, a spring button in each leg that clicks into one of nine holes 2.5 cm apart (handle height 71–91 cm),
// 5-inch wheels on the front legs and rubber feet on the back. Set the grips level with the wrist crease.
// set({ h }) presses the buttons and slides the frame to that height (it snaps to a hole); set({ roll }) pushes it
// forward that far, the front wheels turning and the back feet sliding.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Forward is +x; legs at x = ±22, sides at y = ±29.
  const LX = 22, SY = 29, RO = 1.35, RI = 1.05, WR = 6.3, H0 = 71, STEP = 2.5, HOLES = 9;
  const SLEEVE = 34, AL = ISO.T.steel;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const legs = [[-LX, -SY], [LX, -SY], [-LX, SY], [LX, SY]];
  // inner tube's top: the button sits in hole k; sleeve bottom = handle − SLEEVE
  const sleeveZ = (h) => h - SLEEVE;

  // The lower parts, fixed to the floor: inner tubes with their holes, wheels in forks at the front, feet at the back.
  function lowerSvg(P, x, y, front) {
    const out = [], base = front ? WR * 2 + 3 : 3.2, top = sleeveZ(H0 + (HOLES - 1) * STEP) + 6;
    if (front) {
      const F = yAx([x + 2.4, y, WR]);
      out.push(ISO.tinted(AL, ISO.wbox(P, [x - 1.4, x + 5], [y - 2.6, y - 2], [WR, WR * 2 + 3], "mid")));
      out.push(ISO.tinted(ISO.T.rubber, S(G.disc(-1.4, 1.4, WR, F, P), { tone: "mid" })), `<g transform="${ISO.faceMatrix(P, [x + 2.4, y + 1.45, WR], 1)}"><g data-spin><circle r="3.4" fill="#c9ccd1" stroke="#3c3f45" stroke-width=".4"/><path d="M-3.2 0H3.2M0 -3.2V3.2" stroke="#7d838b" stroke-width=".7"/></g></g>`);
      out.push(ISO.tinted(AL, ISO.wbox(P, [x - 1.4, x + 5], [y + 2, y + 2.6], [WR, WR * 2 + 3], "mid") + ISO.wbox(P, [x - 1.8, x + 5.4], [y - 2.6, y + 2.6], [WR * 2 + 3, WR * 2 + 4.4], "mid")));
    } else {
      out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 2.1, 0, 3.4, P, 20, 0.3), { tone: "mid", inner: L(K.sideArc(x, y, 2.1, 1.4, P, 16), { tone: "lo" }) })));
    }
    // the inner tube with its row of holes facing you
    out.push(ISO.tinted(AL, S(K.cylinder(x, y, RI, base, top - base, P, 16), { tone: "mid", crease: "none" })));
    const face = Math.atan2(...[K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P)].reverse());
    const hx = x + Math.cos(face) * RI, hy = y + Math.sin(face) * RI;
    out.push(D(Array.from({ length: HOLES }, (_, k) => K.iso([hx, hy, sleeveZ(H0 + k * STEP) + 2.5], P)), { size: 0.75, tone: "hi" }));
    return out.join("");
  }
  // The frame that rides up and down: sleeves with their buttons, side bars, the front cross-bar, handles and grips.
  function upperSvg(P, h, pressed) {
    const out = [], items = [];
    const face = Math.atan2(...[K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P)].reverse());
    for (const [x, y] of legs) {
      items.push({ k: K.depthOf([x, y, h], P), svg: () => {
        const z0 = sleeveZ(h), bx = x + Math.cos(face) * (RO + 0.2), by = y + Math.sin(face) * (RO + 0.2), parts = [];
        parts.push(ISO.tinted(AL, S(K.cylinder(x, y, RO, z0, h - z0, P, 18, 0.2), { tone: "mid", crease: "none", inner: L(K.sideArc(x, y, RO, z0 + 4, P, 14), { tone: "faint" }) })));
        parts.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, y, RO + 0.5, z0, 2.2, P, 18), { tone: "mid" })));
        parts.push(pressed ? "" : `<g data-name="button">${ISO.tinted(ISO.T.blue, S(G.sphereOf([bx, by, z0 + 2.5 + 2.2], 0.8, P), { tone: "hi" }))}</g>`);
        return parts.join("");
      } });
    }
    items.sort((a, b) => a.k - b.k);
    const sideBars = (y) => ISO.tinted(AL, S(G.disc(0, 2 * LX, 1.1, xAx([-LX, y, h - 22]), P), { tone: "mid", crease: "none" }) + S(G.disc(0, 2 * LX, 1.25, xAx([-LX, y, h - 1.3]), P), { tone: "mid", crease: "none" }));
    const grip = (y) => ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 1.9], [1, 2.2, 1], [13, 2.2, 1], [14, 1.9]], xAx([-LX + 3, y, h + 0.9]), P), { tone: "hi" }));
    // far side, the front cross-bar, near side
    out.push(items[0].svg(), items[1].svg(), sideBars(-SY), `<g data-name="grip-far">${grip(-SY)}</g>`);
    out.push(ISO.tinted(AL, S(G.disc(0, 2 * SY, 1.15, yAx([LX, -SY, h - 12]), P), { tone: "mid", crease: "none" }) + S(G.disc(0, 2 * SY, 1.15, yAx([LX, -SY, h - 28]), P), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-2.4, 2.4, 1.9, yAx([LX, 0, h - 12]), P), { tone: "hi" })));
    out.push(items[2].svg(), items[3].svg(), sideBars(SY), `<g data-name="grip">${grip(SY)}</g>`);
    return out.join("");
  }

  // k=crutch: a pair of underarm crutches standing side by side. Each has two uprights from the underarm pad that
  // meet at a clamp over a telescoping leg; the hand grip bolts across the uprights; the leg slides in 2.5 cm holes.
  function crutches([cx, cy, height = 320], o, t, parent) {
    const lab = o.lab !== "0" && o.lbl !== "0", W = height * 1.2, H = height * 1.35;
    const { P, g } = ISO.frame([[-30, -40, -3], [30, 40, -3], [0, 0, 140]], cx, cy, W, H, { azimuth: 40, elevation: 16 }, parent);
    const FL = { x: -30, y: -40, w: 60, d: 80, r: 4 }, YS = [-16, 16];
    const along = (a, b) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d); return { F: G.frameAlong(a, d.map((v) => v / l)), l }; };
    const rod = (a, b, r, tone = "hi") => { const { F, l } = along(a, b); return S(G.disc(0, l, r, F, P, { steps: 16 }), { tone }); };
    const upper = (y) => {
      const out = [];
      for (const sx of [-5, 5]) out.push(ISO.tinted(ISO.T.steel, rod([sx, y, 128], [0, y, 70], 1.1)));
      out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: -7, y: y - 2.5, w: 14, d: 5, r: 2.4 }, 127, 5, P, 4), { tone: "hi" })));
      out.push(`<g data-name="grip">${ISO.tinted(ISO.T.plastic, rod([-4.4, y, 100], [4.4, y, 100], 1.6))}</g>`);
      out.push(S(K.cylinder(0, y, 1.8, 66, 6, P, 16), { tone: "mid" }));
      return out.join("");
    };
    const leg = (y, ext) => {
      // The leg runs from its rubber foot up into the clamp under the uprights.
      const out = [ISO.tinted(ISO.T.steel, S(K.cylinder(0, y, 1.3, 4, 66 + ext + 3 - 4, P, 14), { tone: "hi", crease: "none" }))];
      const holes = [];
      for (let k = 0; k < 9; k++) holes.push(K.iso([1.31 * Math.cos(0.9), y + 1.31 * Math.sin(0.9), 40 + k * 2.5], P));
      out.push(D(holes, { size: 0.45, tone: "lo" }), ISO.tinted(ISO.T.plastic, S(K.cylinder(0, y, 2.4, 0, 4, P, 18), { tone: "hi" })));
      return `<g data-name="foot">${out.join("")}</g>`;
    };
    const H0 = 112, STEP = 2.5;
    const s = { len: ISO.clamp(ISO.num(o, "h", 117), H0, H0 + 8 * STEP), z: 0 }; s.z = s.len;
    g.innerHTML = `<g>${ISO.tinted(ISO.T.road, S(K.slabOf(FL, -3, 3, P, 4, 0.5), { tone: "lo" }))}</g><g data-part="legs"></g><g data-part="tops"></g><g data-part="words"></g>`;
    const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer();
    const draw = () => {
      const ext = s.z - H0;
      w.rebuild(q("legs"), ext.toFixed(2), () => YS.map((y) => leg(y, ext)).join(""));
      w.attr(q("tops"), "transform", K.translateAlong(P, [0, 0, ext]));
      if (!q("tops").firstChild) q("tops").innerHTML = YS.map(upper).join("");
      if (lab) w.rebuild(q("words"), Math.round(s.z), () => ISO.word(K.iso([6, 16, 130 + ext], P), "underarm pad", "#444", { size: 13, anchor: "start" }) + ISO.word(K.iso([6, 16, 100 + ext], P), "hand grip", "#444", { size: 13, anchor: "start" }) + ISO.word(K.iso([6, 16, 40], P), "leg: 2.5 cm holes", "#444", { size: 13, anchor: "start" }));
    };
    g.set = (p) => { if (p.h !== undefined) s.len = ISO.clamp(H0 + Math.round((+p.h - H0) / STEP) * STEP, H0, H0 + 8 * STEP); };
    g.update = (dt) => { s.z = ISO.still() ? s.len : Math.abs(s.len - s.z) < 6 * dt ? s.len : s.z + Math.sign(s.len - s.z) * 6 * dt; draw(); return s.z !== s.len; };
    g.readout = () => `crutches ${s.z.toFixed(1)} cm long · set so the pad sits two to three fingers below the armpit and the grip at the wrist crease`;
    draw();
    if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
    return g;
  }

  ISO.add({
    name: "walker", title: "Walking frame", compare: "walker 480 270 320 k=walker",
    about: "A two-wheeled walking frame: press the spring buttons to slide the legs to a new hole (2.5 cm a step, grips 71–91 cm high), then push it ahead on its front wheels.",
    line: "walker cx cy height k=walker|crutch h=71-91 (crutch 112-132) roll=cm lab=1 lit=grip|button|wheel|foot|frame",
    demo: { line: "walker 480 270 320 k=walker h=81", script: [{ set: { h: 86, lit: "button" }, hold: "settle" }, { set: { roll: 30, lit: "wheel" }, hold: "settle" }] },
    make([cx, cy, height = 320], o, t, parent) {
      if (o.k === "crutch") return crutches([cx, cy, height], o, t, parent);
      const lab = o.lab !== "0" && o.lbl !== "0", W = height * 1.9, H = height * 1.32;
      const snap = (v) => H0 + Math.round(ISO.clamp(v - H0, 0, (HOLES - 1) * STEP) / STEP) * STEP;
      const pts = [[-32, -38, -3], [64, 38, -3], [-32, 38, -3], [64, -38, -3], [-LX, 0, 92], [LX + 30, 0, 92]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 34, elevation: 20 }, parent);
      const FL = { x: -32, y: -38, w: 96, d: 76, r: 4 };
      const order = legs.map((l, i) => i).sort((a, b) => K.depthOf([...legs[a], 0], P) - K.depthOf([...legs[b], 0], P));
      g.innerHTML = `<g>${ISO.tinted(ISO.T.road, S(K.slabOf(FL, -3, 3, P, 4, 0.5), { tone: "lo", inner: L(K.sideSeam(FL, -1.5, P, 4), { tone: "faint" }) }))}</g><g data-part="walker">` +
        `<path class="iso-halo" d="${K.haloOf({ x: -LX - 6, y: -SY - 6, w: 2 * LX + 12, d: 2 * SY + 12, r: 10 }, 0, 6, P)}"/>` +
        order.map((i) => `<g data-name="${legs[i][0] > 0 ? "wheel" : "foot"}">${lowerSvg(P, legs[i][0], legs[i][1], legs[i][0] > 0)}</g>`).join("") + `<g data-part="upper"></g><g data-part="words"></g></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer(), spins = [...g.querySelectorAll("[data-spin]")];
      q("upper").innerHTML = upperSvg(P, H0, false);
      const buttons = [...q("upper").querySelectorAll('[data-name="button"]')], parts = [...g.querySelectorAll("[data-name]")];
      const s = { h: snap(ISO.num(o, "h", 81)), z: 0, roll: ISO.clamp(ISO.num(o, "roll", 0), 0, 80), x: 0, lit: o.lit || "" };
      s.z = s.h; s.x = s.roll;
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([LX + 2, SY, 0], "Front wheel", "start", 18, 4) + word([-LX, SY, 0], "Rubber foot", "end", 18, -4) + word([-LX - 4, SY, 60], "Height button", "end", 4, -8);
      }
      const draw = () => {
        // the frame is built once at the lowest hole and slid up; the buttons hide while pressed in
        const pressed = Math.abs(s.z - s.h) > 0.05;
        w.attr(q("upper"), "transform", K.translateAlong(P, [0, 0, s.z - H0]));
        buttons.forEach((b) => w.shown(b, !pressed));
        w.attr(q("walker"), "transform", K.translateAlong(P, [s.x, 0, 0]));
        spins.forEach((e) => w.attr(e, "transform", `rotate(${((s.x / WR) * 180 / Math.PI).toFixed(1)})`));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => { if (p.h !== undefined) s.h = snap(+p.h); if (p.roll !== undefined) s.roll = ISO.clamp(+p.roll, 0, 80); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.z = calm ? s.h : Math.abs(s.h - s.z) < 6 * dt ? s.h : s.z + Math.sign(s.h - s.z) * 6 * dt;
        s.x = calm ? s.roll : Math.abs(s.roll - s.x) < 0.05 ? s.roll : s.x + Math.sign(s.roll - s.x) * Math.max(4, Math.min(40, Math.abs(s.roll - s.x) * 3)) * dt;
        draw();
        return s.z !== s.h || s.x !== s.roll;
      };
      g.readout = () => {
        const hole = Math.round((s.h - H0) / STEP) + 1;
        return `grips ${s.z.toFixed(1)} cm high · hole ${hole} of ${HOLES} (2.5 cm apart, 71–91 cm) · set them at your wrist crease${s.x > 0 ? ` · pushed ${s.x.toFixed(0)} cm ahead on its front wheels` : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
