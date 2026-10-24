// "toaster cx cy width shade=1-6 lab=1" — a two-slot pop-up toaster on a worktop.
// A steel shell with rounded ends on a black base and rubber feet; the crumb tray slides out under the front. Look down
// a slot and you see the bread guides and, on the mica card behind them, the coiled nichrome element. On the end
// panel: the lever in its track, the browning dial (1–6) and the cancel button. Push the lever (set({ go: 1 })): it
// latches down with the bread, the elements glow orange-red at about 1100 °C, the bread browns, and when the timer
// runs out the latch lets go and the spring pops the toast up. Setting 3 is about 2½ minutes (shown 60 times faster).
// World units: about 3 mm each.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TOP = { x: -78, y: -46, w: 156, d: 92, r: 6 }, BODY = { x: -44, y: -24, w: 88, d: 48, r: 12 }, TZ = 52, X1 = 44;
  const SLOTS = [-7.5, 7.5].map((c) => ({ c, plan: { x: -32, y: c - 4.5, w: 64, d: 9, r: 1.6 } }));
  const PANEL = { y0: -11, y1: 11, z0: 7, z1: 47, t: 2.2 }, TRACK = { z0: 25, z1: 45 }, DIAL = [0, 14], BUTTONS = [[7.4, 26], [7.4, 32], [7.4, 38]];
  const UP = TZ + 18 - 40, DOWN = TZ - 4 - 40;                     // the bread's bottom when up and when down
  const BLACK = ISO.T.plastic, STEEL = ISO.T.steel;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  let uid = 0;
  // a slice: square sides and a domed crown, in (x, height above its bottom)
  const BREAD = (() => {
    const hw = 26, hs = 31, top = 40, pts = [[-hw + 1.6, 0], [hw - 1.6, 0], [hw, 1.6]];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push([(hw + 1.4 * Math.sin(a)) * Math.cos(a), hs + (top - hs) * Math.pow(Math.sin(a), 0.6)]); }
    pts.push([-hw, 1.6]);
    return pts;
  })();
  const cut = (pts, c, below) => {
    const inside = (p) => (below ? p[1] <= c : p[1] >= c), out = [];
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      if (inside(p)) out.push(p);
      if (inside(p) !== inside(q)) { const t = (c - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, c]); }
    });
    return out;
  };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * ISO.clamp(t, 0, 1)).toString(16).padStart(2, "0")).join("");

  // Worktop, cord, feet, base, crumb tray, the shell and its end panel with the dial and the cancel button.
  function bodySvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(TOP, -10, 10, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(TOP, -10, 10, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(TOP, -5, P, 8), { tone: "faint" }) })), L(K.planOutline(K.insetPlan(TOP, 4), 0, P), { tone: "faint" })];
    // the cord out of the back end, over the worktop and off its back edge
    const k = K.cameraOf(P).k, cord = K.pathOf([[-44.6, -14, 3.4], [-50, -15, 1.2], [-56, -20, 1.2], [-60, -32, 1.2], [-60, TOP.y, 1.2]].map((p) => K.iso(p, P)));
    out.push(`<path d="${cord}" fill="none" stroke="#0d0e10" stroke-width="${(2.3 * k).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/><path d="${cord}" fill="none" stroke="#4a4f56" stroke-width="${(1.3 * k).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/>`);
    out.push(ISO.tinted(BLACK, S(G.solidOf([[0, 1.9], [3, 1.3, 1], [4, 1.1]], G.frameAlong([-43, -14, 3.4], [-1, 0, 0]), P, { steps: 16 }), { tone: "mid" })));
    for (const [x, y] of [[-34, -16], [34, -16], [-34, 16], [34, 16]]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 3, 0, 2, P, 20), { tone: "lo" })));
    out.push(ISO.tinted(BLACK, S(K.slabOf({ x: -43, y: -23, w: 86, d: 45, r: 11 }, 2, 3, P, 8, 0.6), { tone: "lo" })));
    // the crumb tray, out under the front with its pull
    out.push(ISO.tinted(BLACK, S(K.slabOf({ x: -30, y: 22, w: 60, d: 3.4, r: 0.6 }, 2, 2.6, P, 3), { tone: "mid" }) + S(K.slabOf({ x: -6, y: 25.4, w: 12, d: 1.8, r: 0.6 }, 2.4, 1.8, P, 3), { tone: "mid" })));
    // the shell: rounded ends, a bevelled top, trim lines round it
    out.push(ISO.tinted(STEEL, S(K.slabOf(BODY, 5, TZ - 5, P, 10, 2), { tone: "hi", inner: L(K.sideSeam(BODY, 9, P, 10) + K.sideSeam(BODY, TZ - 5, P, 10), { tone: "lo" }) })));
    out.push(L(K.planOutline(K.insetPlan(BODY, 4.5), TZ, P, 10), { tone: "faint" }));
    // the end panel, flat on the shell's +x end: lever track, browning dial with its six marks, cancel button
    const fx = X1 + PANEL.t;
    out.push(ISO.tinted(BLACK, S(G.prismOf(xAx([X1, 0, 0]), [[PANEL.y0, PANEL.z0 + 2], [PANEL.y0 + 2, PANEL.z0], [PANEL.y1 - 2, PANEL.z0], [PANEL.y1, PANEL.z0 + 2], [PANEL.y1, PANEL.z1 - 2], [PANEL.y1 - 2, PANEL.z1], [PANEL.y0 + 2, PANEL.z1], [PANEL.y0, PANEL.z1 - 2]], 0, PANEL.t, P), { tone: "mid" })));
    const track = []; for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI; track.push([1.1 * Math.cos(a), TRACK.z1 + 1.1 * Math.sin(a)]); } for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; track.push([1.1 * Math.cos(a), TRACK.z0 + 1.1 * Math.sin(a)]); }
    out.push(`<path d="${K.pathOf(track.map(([y, z]) => K.iso([fx + 0.02, y, z], P)), true)}" fill="#111316" stroke="#0d0e10" stroke-width=".7"/>`);
    out.push(ISO.tinted(STEEL, S(G.disc(PANEL.t, PANEL.t + 0.5, 5.2, xAx([X1, DIAL[0], DIAL[1]]), P, { steps: 32 }), { tone: "mid" })));
    out.push(D([1, 2, 3, 4, 5, 6].map((n) => { const a = Math.PI * (1.25 - (n - 1) * 0.3); return K.iso([fx + 0.5, DIAL[0] + 4.4 * Math.cos(a), DIAL[1] + 4.4 * Math.sin(a)], P); }), { size: 0.45, tone: "lo" }));
    // reheat, defrost and cancel buttons beside the track (cancel lights while it toasts)
    for (const [y, z] of BUTTONS) out.push(ISO.tinted(STEEL, S(G.disc(0, 1, 1.8, xAx([fx, y, z]), P, { steps: 20 }), { tone: "hi" })));
    out.push(D([[PANEL.y0 + 1.4, PANEL.z0 + 1.4], [PANEL.y1 - 1.4, PANEL.z0 + 1.4], [PANEL.y0 + 1.4, PANEL.z1 - 1.4], [PANEL.y1 - 1.4, PANEL.z1 - 1.4]].map(([y, z]) => K.iso([fx + 0.02, y, z], P)), { size: 0.45 }));
    // a plate and a butter knife, ready for the toast
    const pF = G.frameOf([-60, 28, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 10], [0.8, 11, 1], [1.8, 15, 1], [2.2, 15.4], [2.2, 14.4], [1.2, 10.4], [1.2, 0]], pF, P, { steps: 56 }), { tone: "hi" })));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [-68, -56], [27, 28.6], [1.2, 1.5], "hi")) + ISO.tinted(BLACK, ISO.wbox(P, [-56, -47.5], [26.8, 28.8], [1.2, 2.5], "mid")));
    return out.join("");
  }
  // The browning knob on its plate: knurled round its rim, the pointer on its face at setting n.
  function knobSvg(P, n) {
    const F = xAx([X1 + PANEL.t + 0.5, DIAL[0], DIAL[1]]), a = Math.PI * (1.25 - (n - 1) * 0.3), face = 2.6;
    const out = [ISO.tinted(BLACK, S(G.disc(0, face, 3.4, F, P, { steps: 32 }), { tone: "hi", inner: K.lineSvg(G.ribsOf(F, 0, face, 3.4, 24, P, { seams: true }), { tone: "faint" }) }))];
    const tip = K.iso([F.o[0] + face + 0.02, DIAL[0] + 2.8 * Math.cos(a), DIAL[1] + 2.8 * Math.sin(a)], P), c = K.iso([F.o[0] + face + 0.02, DIAL[0], DIAL[1]], P);
    out.push(`<path d="M${c[0].toFixed(1)} ${c[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}" stroke="#e8eaed" stroke-width="1.2" stroke-linecap="round"/>`);
    return out.join("");
  }
  // The cancel button's light: amber while it toasts.
  function lampSvg(P, on) {
    const [y, z] = BUTTONS[2], F = xAx([X1 + PANEL.t + 1, y, z]);
    return `<path d="${G.circleOf(F, 0.02, 1.1, P, 20)}" fill="${on ? "#ffb347" : "#9aa0a8"}" stroke="${on ? "#b5541a" : "#5a5f66"}" stroke-width=".6"/>`;
  }
  // The lever at height z: a stem through the track and a black knob.
  function leverSvg(P, z) {
    const fx = X1 + PANEL.t;
    return ISO.tinted(STEEL, ISO.wbox(P, [fx, fx + 3], [-0.8, 0.8], [z - 0.8, z + 0.8], "mid")) + ISO.tinted(BLACK, ISO.wbox(P, [fx + 3, fx + 9], [-4.4, 4.4], [z - 2.2, z + 2.6], "hi"));
  }
  // One slot from above: the dark well, the mica card on its far wall with the coiled element, the bread guides, the
  // bread's lower part (all clipped to the opening), then the rim. h is the element's heat 0–1.
  function slotSvg(P, id, slot, h, zb, brown) {
    const { plan, c } = slot, y0 = plan.y + 0.05, d = K.planOutline(plan, TZ, P, 4), k = K.cameraOf(P).k, out = [`<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">`];
    out.push(`<path d="${d}" fill="${mix("#26231f", "#6a2a10", h)}"/>`);
    out.push(`<path d="${K.pathOf([[-34, y0, TZ + 1], [34, y0, TZ + 1], [34, y0, TZ - 14], [-34, y0, TZ - 14]].map((p) => K.iso(p, P)), true)}" fill="${mix("#5a5246", "#c06a34", h)}" stroke="none"/>`);
    // the nichrome ribbon wound round the mica card: a zigzag across it, glowing as it heats
    const zz = []; for (let x = -31, i = 0; x <= 31.01; x += 1.55, i++) zz.push(K.iso([x, y0 + 0.1, TZ - (i % 2 ? 2 : 9)], P));
    const wire = K.pathOf(zz);
    if (h > 0.02) out.push(`<path d="${wire}" fill="none" stroke="#ff8a3d" stroke-width="${(2.6 * k).toFixed(2)}" stroke-linejoin="round" opacity="${(0.55 * h).toFixed(2)}"/>`);
    out.push(`<path d="${wire}" fill="none" stroke="${mix("#77736c", "#ff4a14", h)}" stroke-width="${(0.55 * k).toFixed(2)}" stroke-linejoin="round"/>`);
    // bread guides: wires down the far side of the slot, between the element and the bread
    const gd = []; for (let x = -28; x <= 28.01; x += 8) gd.push(K.pathOf([K.iso([x, y0 + 1.2, TZ + 0.5], P), K.iso([x, y0 + 1.2, TZ - 16], P)]));
    out.push(`<path d="${gd.join("")}" fill="none" stroke="#9aa0a8" stroke-width="${(0.45 * k).toFixed(2)}"/>`);
    out.push(breadSvg(P, zb, c, brown, true));
    out.push(`</g>`, L(d, { tone: "mid" }), L(K.planOutline(K.insetPlan(plan, -1.4), TZ, P, 4), { tone: "faint" }));
    return out.join("");
  }
  function breadSvg(P, zb, c, brown, below) {
    const poly = cut(BREAD.map(([x, z]) => [x, z + zb]), TZ, below);
    if (poly.length < 3) return "";
    return ISO.prismY(P, poly, c - 1.8, c + 1.8, [mix("#c99a5c", "#5e3510", brown), mix("#ead0a0", "#9a6028", brown)], mix("#f6e6c4", "#b0702f", brown), mix("#7a5a2e", "#3a2008", brown));
  }

  ISO.add({
    name: "toaster", title: "Toaster", compare: "toaster 480 290 300",
    about: "Push the lever: the bread drops between glowing nichrome elements, browns, and pops up when the timer runs out.",
    line: "toaster cx cy width shade=1-6 lab=1",
    demo: { line: "toaster 480 290 320", script: [{ set: { go: 1 }, hold: "settle" }, { set: {}, hold: 1.5 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.2, H = size * 1.5, id = `ts${uid++}`;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -10, 0), [0, 0, UP + 48], [X1 + 11, 0, 50]], cx, cy, W, H, { azimuth: 55, elevation: 32 }, parent);
      g.innerHTML = `<g>${bodySvg(P)}</g><g data-part="knob"></g><g data-part="lamp"></g><g data-part="lever"></g><g data-part="slot0"></g><g data-part="slot1"></g><g data-part="bread0"></g><g data-part="bread1"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const shade = ISO.clamp(Math.round(ISO.num(o, "shade", 3)), 1, 6), T = (50 * shade) / 60;   // 50 s a step, shown 60× faster
      const s = { phase: 0, t: 0, pos: 0, v: 0, h: 0, brown: 0 };
      const draw = () => {
        const zb = UP + (DOWN - UP) * s.pos, lz = TRACK.z1 + (TRACK.z0 - TRACK.z1) * ISO.clamp(s.pos, 0, 1), hq = Math.round(s.h * 40) / 40, bq = Math.round(s.brown * 40) / 40, zq = zb.toFixed(2);
        w.rebuild(el.knob, String(shade), () => knobSvg(P, shade));
        w.rebuild(el.lamp, String(s.phase === 1), () => lampSvg(P, s.phase === 1));
        w.rebuild(el.lever, lz.toFixed(2), () => leverSvg(P, lz));
        SLOTS.forEach((sl, i) => {
          w.rebuild(el[`slot${i}`], `${hq} ${zq} ${bq}`, () => slotSvg(P, `${id}s${i}`, sl, hq, zb, bq));
          w.rebuild(el[`bread${i}`], `${zq} ${bq}`, () => breadSvg(P, zb, sl.c, bq, false));
        });
        w.rebuild(el.words, lab ? `${s.h > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([X1 + 12, -6, TRACK.z1 + 1], P), "lever", "#444", { size: 13, anchor: "start" }),
          ISO.word(K.iso([X1 + 6, DIAL[0] - 7, DIAL[1] - 4], P), "browning dial", "#444", { size: 13, anchor: "start", dy: 6 }),
          ISO.word(K.iso([30, 27, 2], P), "crumb tray", "#444", { size: 13, anchor: "start", dy: 12 }),
          ISO.word(K.iso([-32, -12, TZ], P), s.h > 0.5 ? "nichrome elements glowing" : "nichrome elements inside", s.h > 0.5 ? "#b5541a" : "#444", { size: 13, anchor: "end" })].join(""));
      };
      g.set = (p) => { if (p.go && s.phase !== 1) { s.phase = 1; s.t = 0; s.brown = 0; s.v = 0; } };
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        const done = 0.2 + 0.13 * shade;                                     // how brown this setting leaves it
        if (s.phase === 1) {
          s.pos = ISO.follow(s.pos, 1, dt, 0.06, calm);
          s.brown = calm ? done : Math.min(done, done * (s.t / T));
          if (s.t >= T || calm) { s.phase = 2; s.t = 0; s.v = 0; s.brown = done; }
        } else if (s.phase === 2) {
          // the latch lets go: a stiff spring throws the carriage up past its rest; it settles with a bounce
          if (calm) s.pos = 0, s.v = 0;
          else { const a = -260 * s.pos - 9 * s.v; s.v += a * dt; s.pos += s.v * dt; }
          if (Math.abs(s.pos) < 0.002 && Math.abs(s.v) < 0.02) { s.pos = 0; s.v = 0; s.phase = 3; }
        }
        s.h = ISO.follow(s.h, s.phase === 1 ? 1 : 0, dt, s.phase === 1 ? 0.5 : 0.9, calm);
        if (s.phase !== 1 && s.h < 0.01) s.h = 0;
        draw();
        return s.phase === 1 || s.phase === 2 || s.h > 0;
      };
      g.readout = () => (s.phase === 1 ? `elements glowing at about 1100 °C · the bread's surface browns (the Maillard reaction) · setting ${shade}: about ${["", "1", "1¾", "2½", "3⅓", "4", "5"][shade]} minutes, shown faster`
        : s.phase >= 2 ? "timer done: the spring pops the toast up" : "push the lever down");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
