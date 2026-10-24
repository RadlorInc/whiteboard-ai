// Home appliances with the app's signatures: kettle (boils and clicks off at 100 °C), toaster (lever down, elements
// glow, toast pops), lamp (k=on|off), ceilingfan (spin=1), washer (spin=1). Each on a worktop or floor slab.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const TOP = { x: -90, y: -50, w: 180, d: 100, r: 6 };
  const worktop = (P, tint = ISO.T.wood) => `<path class="iso-halo" d="${K.haloOf(TOP, -10, 10, P)}"/>` + ISO.tinted(tint, S(K.slabOf(TOP, -10, 10, P, 8, 1.2), { tone: "mid" })) + L(K.planOutline(K.insetPlan(TOP, 4), 0, P), { tone: "faint" });
  const steam = (P, base, t, k = 1) => Array.from({ length: 3 }, (_, i) => {
    const f = (t * 0.5 + i / 3) % 1, pts = Array.from({ length: 8 }, (_, j) => [base[0] + Math.sin(j * 0.9 + i + t * 2) * 3 * k, base[1], base[2] + j * 4 + f * 10]);
    return `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#b7c4cf" stroke-width="${2.2 * (1 - f)}" opacity="${(0.7 * (1 - f)).toFixed(2)}" stroke-linecap="round"/>`;
  }).join("");
  // Common wrapper: a static drawing, a live part rebuilt on a quantised key and kept, a readout.
  const recipe = (def) => ISO.add({
    ...def,
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", { P, g } = ISO.frame(def.points, cx, cy, size * (def.w || 1.4), size * (def.h || 1.05), def.cam, parent);
      const st = def.init(o), w = ISO.writer(), memo = new Map();
      g.innerHTML = `<g>${def.still(P, lab, o)}</g><g data-part="live"></g>`;
      const el = g.querySelector('[data-part="live"]');
      // def.fx(g, P, W, H, el) may add WebGL layers and return a function that feeds them the state each frame
      const fx = def.fx && def.fx(g, P, size * (def.w || 1.4), size * (def.h || 1.05), el);
      st.gl = !!fx;
      const draw = () => { if (fx) fx(st); const key = def.key(st); w.rebuild(el, key, () => (def.memo === false ? def.live(P, st, lab) : (memo.has(key) || memo.set(key, def.live(P, st, lab)), memo.get(key)))); };
      g.set = (p) => def.set(st, p);
      g.update = (dt) => { const moving = def.step(st, dt, ISO.still()); draw(); return moving; };
      g.readout = () => def.readout(st);
      draw();
      if (t) label(parent, cx, cy - size * 0.55, t, TXT.blue, 22, "middle");
      return g;
    },
  });

  // lamp: a table lamp on/off: base, stem, shade and the bulb's glow.
  recipe({
    name: "lamp", title: "Table lamp", compare: "lamp 480 270 300 k=on", about: "A table lamp: switch it on and the bulb lights the shade and the table below it.",
    line: "lamp cx cy height k=on|off lab=1", demo: { line: "lamp 480 270 320 k=off", script: [{ set: { k: "on" }, hold: "settle" }, { set: { k: "off" }, hold: "settle" }] },
    points: [...K.boxCorners(TOP, -10, 0), [0, 0, 120]], cam: { azimuth: 50, elevation: 20 }, w: 1.2, h: 1.1,
    still: (P) => {
      const F = zAx([0, 0, 0]);
      return worktop(P) + `<g data-part="lampbase">${S(G.lathe([[0, 0], [0, 22], [4, 20, 1], [6, 6], [70, 3], [70, 0]], F, P, { smooth: true, steps: 40 }), { tone: "mid" }) + ISO.wbox(P, [14, 22], [-3, 3], [0, 6], "mid")}</g>`;
    },
    // the bulb's light on the worktop: warm, brightest under the lamp, falling off as cos/d², stopping at the edge
    fx: (g, P, W, H) => {
      const fx = ISO.gl(g, P, W, H, g.querySelector('[data-part="lampbase"]'), `uniform float uV;void main(){gl_FragColor=finish(poolInk(viewOf(gl_FragCoord.xy),vec3(0.,0.,82.),0.,vec4(0.,0.,90.,50.),6.,vec3(1.,.84,.5),1.)*uV);}`, ["uV"]);
      return fx && ((st) => fx.set({ uV: st.v }, st.v > 0.002));
    },
    init: (o) => ({ on: o.k !== "off" ? 1 : 0, v: o.k !== "off" ? 1 : 0 }),
    key: (st) => st.v.toFixed(2),
    live: (P, st) => {
      const F = zAx([0, 0, 70]), out = [];
      if (!st.gl && st.v > 0.02) out.push(`<path d="${K.ring(0, 0, 46, 0.1, P, 48)}" fill="#ffe9a8" opacity="${(0.45 * st.v).toFixed(2)}"/>`);
      out.push(ISO.tinted(st.v > 0.5 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf([0, 0, 82], 7, P), { tone: "hi" })));
      out.push(`<g opacity=".85">${ISO.tinted(ISO.tint(st.v > 0.5 ? "#fff3cf" : "#f1ece2", st.v > 0.5 ? ["#f2d48a", "#f5dc9e", "#f8e4b2", "#fbecc6"] : ["#cfc6b4", "#d9d1c0", "#e2dbcc", "#ebe5d8"], "#7a6a4a"), S(G.lathe([[2, 0], [2, 32], [36, 18], [36, 0]], F, P, { steps: 48 }), { tone: "hi" }))}</g>`);
      return out.join("");
    },
    set: (st, p) => { if (p.k) st.on = p.k === "on" ? 1 : 0; },
    step: (st, dt, calm) => { st.v = ISO.follow(st.v, st.on, dt, 0.15, calm); return st.v !== st.on; },
    readout: (st) => (st.on ? "on · a 9 W LED gives about as much light as a 60 W filament bulb" : "off"),
  });

  // ceilingfan: seen from below and a little to the side: canopy, downrod, motor, four blades turning.
  recipe({
    name: "ceilingfan", title: "Ceiling fan", compare: "ceilingfan 480 270 340 spin=1", about: "A ceiling fan: the motor turns four tilted blades that push air down.",
    line: "ceilingfan cx cy size spin=1 lab=1", demo: { line: "ceilingfan 480 270 340 spin=0", script: [{ set: { spin: 1 }, hold: 4 }, { set: { spin: 0 }, hold: "settle" }] },
    points: [[-110, -110, 0], [110, 110, 0], [0, 0, 50]], cam: { azimuth: 45, elevation: 30 }, w: 1.5, h: 0.95,
    // Only the canopy where it meets the ceiling: a whole ceiling would sit between the camera (above) and the fan.
    still: (P) => S(K.cylinder(0, 0, 12, 46, 3, P, 36, 0.5), { tone: "mid" }) + S(K.cylinder(0, 0, 9, 40, 6, P, 32), { tone: "mid" }) + S(K.cylinder(0, 0, 2, 26, 14, P, 14), { tone: "mid", crease: "none" }),
    init: (o) => ({ on: o.spin !== "0", w: o.spin !== "0" ? 3 : 0, a: 0 }),
    key: (st) => (Math.round(st.a / 0.04) * 0.04).toFixed(2), memo: false,
    live: (P, st) => {
      const out = [S(K.cylinder(0, 0, 14, 16, 10, P, 40, 0.6), { tone: "hi" })];
      for (let i = 0; i < 4; i++) { const a = st.a + (i * Math.PI) / 2; out.push(ISO.tinted(ISO.T.wood, ISO.box((u, wv, y) => [Math.cos(a) * u - Math.sin(a) * y, Math.sin(a) * u + Math.cos(a) * y, 18 + wv + y * 0.15], P, [14, 100], [0, 1.4], [-9, 9], "hi"))); }
      return out.join("");
    },
    set: (st, p) => { if (p.spin !== undefined) st.on = !!+p.spin; },
    step: (st, dt, calm) => { st.w = ISO.follow(st.w, st.on ? 3 : 0, dt, 0.9, calm); if (!calm) st.a += st.w * dt; return st.w > 0.001 || st.on; },
    readout: (st) => `${(st.w / (2 * Math.PI) * 60).toFixed(0)} rpm on the display · the blades are tilted, so turning pushes air down; it feels cooler because moving air carries heat off the skin`,
  });

})();
