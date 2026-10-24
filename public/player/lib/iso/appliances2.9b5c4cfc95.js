// More household things with the app's signatures: stove, fridge, microwave, oven, sink, aircon, door, umbrella,
// toothbrush, helmet. Each is a real object with one demo move and true numbers in the readout.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const TOP = { x: -90, y: -50, w: 180, d: 100, r: 6 };
  const worktop = (P, tint = ISO.T.wood) => `<path class="iso-halo" d="${K.haloOf(TOP, -10, 10, P)}"/>` + ISO.tinted(tint, S(K.slabOf(TOP, -10, 10, P, 8, 1.2), { tone: "mid" })) + L(K.planOutline(K.insetPlan(TOP, 4), 0, P), { tone: "faint" });
  const floor = (P) => `<path class="iso-halo" d="${K.haloOf({ x: -70, y: -60, w: 140, d: 120, r: 4 }, -4, 4, P)}"/>` + ISO.tinted(ISO.T.road, S(K.slabOf({ x: -70, y: -60, w: 140, d: 120, r: 4 }, -4, 4, P, 4), { tone: "mid", crease: "none" }));
  const steam = (P, base, t, k = 1) => Array.from({ length: 3 }, (_, i) => {
    const f = (t * 0.5 + i / 3) % 1, pts = Array.from({ length: 8 }, (_, j) => [base[0] + Math.sin(j * 0.9 + i + t * 2) * 3 * k, base[1], base[2] + j * 4 + f * 10]);
    return `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#b7c4cf" stroke-width="${2.2 * (1 - f)}" opacity="${(0.7 * (1 - f)).toFixed(2)}" stroke-linecap="round"/>`;
  }).join("");
  // Same wrapper as appliances.js: static drawing, a live part on a quantised key (kept unless memo: false), a readout.
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
  const ease = (st, key, target, dt, calm, tau = 0.5) => { st[key] = ISO.follow(st[key], target, dt, tau, calm); return st[key] !== target; };

  // stove: a gas hob burner with its cap and jets, a pan of water, and the knob that sets the flame.
  recipe({
    name: "stove", title: "Gas hob", compare: "stove 480 280 300", about: "A gas burner under a pan: turn the knob and the ring of blue flames grows; the water heats until it steams.",
    line: "stove cx cy size flame=0..1 lab=1", demo: { line: "stove 480 280 320", script: [{ set: { flame: 1 }, hold: 4 }, { set: { flame: 0 }, hold: "settle" }] },
    points: [...K.boxCorners(TOP, -10, 0), [0, 0, 70], [0, 0, 112]], cam: { azimuth: 50, elevation: 26 },
    // the ring of jets under the pan, and the steam over it, as shader layers
    fx: (g, P, W, H, el) => {
      const jets = ISO.gl(g, P, W, H, el, `uniform float uF;void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=vec4(0.);
        for(int i=0;i<16;i++){float a=float(i)/16.*6.2832;c=over(c,flameInk(vb,vec3(cos(a)*10.,sin(a)*10.,6.),normalize(vec3(cos(a)*.45,sin(a)*.45,1.)),(2.4+3.*uF)*(1.+.08*sin(uTime*15.+float(i))),1.,uTime+float(i)*1.3));}
        gl_FragColor=finish(c*smoothstep(0.,.3,uF));}`, ["uF"]);
      const steam = ISO.gl(g, P, W, H, ISO.end(g), `uniform float uS;void main(){gl_FragColor=finish(steamInk(viewOf(gl_FragCoord.xy),vec3(0.,0.,38.),vec3(0.,0.,1.),70.,15.,uS,uTime));}`, ["uS"]);
      return jets && ((st) => { jets.set({ uF: st.f }, st.f > 0.002); if (steam) { const s = ISO.smooth(0.6, 0.9, st.heat); steam.set({ uS: s }, s > 0.002); } });
    },
    still: (P) => worktop(P, ISO.T.steel) + S(K.cylinder(0, 0, 18, 0, 3, P, 40, 0.5), { tone: "mid" }) + S(K.cylinder(0, 0, 11, 3, 3, P, 36), { tone: "lo" }) +
      [0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 2 + 0.4; return ISO.wbox(P, [Math.cos(a) * 14 - 2, Math.cos(a) * 14 + 2], [Math.sin(a) * 14 - 2, Math.sin(a) * 14 + 2], [3, 12], "lo"); }).join(""),
    init: () => ({ f: 0, fT: 0, heat: 0, t: 0 }),
    key: (st) => `${st.f.toFixed(2)} ${Math.round(st.heat * 20)} ${st.heat > 0.7 ? ((st.t * 0.5) % 1).toFixed(2) : ""} ${Math.round(st.t * 8) % 2}`, memo: false,
    live: (P, st) => {
      const out = [];
      if (!st.gl && st.f > 0.02) for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, b = [Math.cos(a) * 10, Math.sin(a) * 10, 6], h = (3 + 4 * st.f) * (1 + 0.15 * Math.sin(st.t * 15 + i)); out.push(`<path d="${K.pathOf([K.iso(b, P), K.iso([b[0] * 1.15, b[1] * 1.15, b[2] + h], P)])}" stroke="#4f93d6" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`); }
      const F = zAx([0, 0, 12]);
      out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 24], [22, 26], [22, 24.5], [1.2, 22.5], [1.2, 0]], F, P, { steps: 48, fill: "facets" }), { tone: "hi" })));
      out.push(`<path d="${K.ring(0, 0, 23, 12 + 16, P, 48)}" fill="#7fb7ea" fill-opacity="${(0.55 + 0.2 * st.heat).toFixed(2)}" stroke="#4f93d6" stroke-width="0.6"/>`);
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(26, 40, 2, xAx([0, 0, 22]), P), { tone: "hi" })));
      if (!st.gl && st.heat > 0.7) out.push(steam(P, [0, 0, 36], st.t, 2));
      out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(64, 34, 6, 0, 6, P, 24), { tone: "hi" })), `<path d="${K.pathOf([[64, 34, 6.1], [64 + Math.cos(-1.6 + st.f * 2.4) * 5, 34 + Math.sin(-1.6 + st.f * 2.4) * 5, 6.1]].map((p) => K.iso(p, P)))}" stroke="#ffffff" stroke-width="1.4"/>`);
      return out.join("");
    },
    set: (st, p) => { if (p.flame !== undefined) st.fT = ISO.clamp(+p.flame, 0, 1); },
    step: (st, dt, calm) => { st.t += dt; const m = ease(st, "f", st.fT, dt, calm, 0.25); st.heat = ISO.clamp(st.heat + (st.f * 0.25 - 0.06) * dt, 0, 1); return m || st.f > 0 || st.heat > 0.01; },
    readout: (st) => (st.f > 0.05 ? `flame ${Math.round(st.f * 100)}% · blue flame = enough air for clean burning (about 1950 °C) · water ${Math.round(20 + st.heat * 80)} °C` : `burner off · water ${Math.round(20 + st.heat * 80)} °C`),
  });

  // door: a door in its frame that opens on its hinges: the lever turns, the latch withdraws, the door swings.
  recipe({
    name: "door", title: "Door with lever and latch", compare: "door 480 270 360 k=closed", about: "Press the lever: it turns the spindle, the sprung latch slides back into the door, and the door swings on its hinges.",
    line: "door cx cy height k=closed|open lab=1", demo: { line: "door 480 270 360", script: [{ set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    points: [[-50, -10, 0], [50, 60, 0], [-50, 0, 130], [50, 0, 130]], cam: { azimuth: 30, elevation: 14 }, w: 1.05, h: 1.1,
    still: (P) => floor(P) + ISO.tinted(ISO.T.paint, ISO.wbox(P, [-50, -40], [-6, 6], [0, 124], "mid") + ISO.wbox(P, [40, 50], [-6, 6], [0, 124], "mid") + ISO.wbox(P, [-50, 50], [-6, 6], [124, 132], "mid")) +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [38.6, 40], [-2, 2], [58, 70], "hi")),
    init: (o) => ({ a: o.k === "open" ? 1 : 0, aT: o.k === "open" ? 1 : 0, lever: 0 }),
    key: (st) => `${st.a.toFixed(2)} ${st.lever.toFixed(2)}`,
    live: (P, st) => {
      const ang = st.a * 1.3, at = (u, w, y) => [-40 + u * Math.cos(ang) - y * Math.sin(ang), u * Math.sin(ang) + y * Math.cos(ang), w];
      const out = [ISO.tinted(ISO.T.wood, ISO.box(at, P, [0, 80], [0, 124], [-2.2, 2.2], "hi"))];
      for (const z of [18, 100]) out.push(L(K.pathOf([[8, z], [72, z], [72, z + 6], [8, z + 6]].map(([u, zz]) => K.iso(at(u, zz, 2.25), P)), true), { tone: "lo" }));
      const lv = st.lever * 0.6, hz = 64, hx = 72;
      out.push(ISO.box((u, w, y) => at(hx - u * Math.cos(lv), hz - u * Math.sin(lv) + w, y), P, [0, 14], [-1, 1], [2.2, 4.6], "hi", true));
      out.push(ISO.box((u, w, y) => at(80 - u, w, y), P, [-3 + 3 * st.lever, 0], [62, 66], [-1, 1], "mid"));
      return out.join("");
    },
    set: (st, p) => { if (p.open !== undefined) st.aT = +p.open ? 1 : 0; },
    step: (st, dt, calm) => {
      // The lever goes down before the door moves, and comes back up once it's open or shut.
      const want = st.a !== st.aT ? 1 : 0;
      ease(st, "lever", want, dt, calm, 0.12);
      if (st.lever > 0.9 || calm) ease(st, "a", st.aT, dt, calm, 0.5);
      return st.a !== st.aT || st.lever > 0.001;
    },
    readout: (st) => (st.a > 0.5 ? "open · the latch springs back out once the lever is let go" : st.lever > 0.5 ? "lever down · latch withdrawn into the door" : "closed · the latch sits in the strike plate on the frame"),
  });

  // umbrella: a folded umbrella opening: the runner slides up the shaft and the ribs spread the canopy.
  recipe({
    name: "umbrella", title: "Umbrella", compare: "umbrella 480 270 300", about: "Slide the runner up the shaft: the stretchers push the ribs out and the canopy opens and locks.",
    line: "umbrella cx cy height open=1 lab=1", demo: { line: "umbrella 480 270 320 open=0", script: [{ set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    points: [[-60, -60, 0], [60, 60, 0], [0, 0, 120]], cam: { azimuth: 50, elevation: 20 }, w: 1.25, h: 1.1,
    still: (P) => floor(P) + S(K.cylinder(0, 0, 1.2, 10, 106, P, 12), { tone: "mid", crease: "none" }) + `<path d="${K.pathOf([[0, 0, 10], [0, 0, 4], [6, 0, 1], [10, 0, 5]].map((p) => K.iso(p, P)))}" fill="none" stroke="#3a3e44" stroke-width="3" stroke-linecap="round"/>`,
    init: (o) => ({ v: o.open === "0" ? 0 : 1, vT: o.open === "0" ? 0 : 1 }),
    key: (st) => st.v.toFixed(2),
    live: (P, st) => {
      const top = 116, spread = 0.15 + st.v * 1.15, len = 56, n = 8, out = [];
      const tips = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * Math.sin(spread) * len, Math.sin(a) * Math.sin(spread) * len, top - Math.cos(spread) * len]; });
      const vis = tips.map((p, i) => ({ p, i, k: K.depthOf(p, P) }));
      // Canopy panels: alternate colours, back ones first.
      const panels = tips.map((p, i) => ({ i, k: K.depthOf([(p[0] + tips[(i + 1) % n][0]) / 2, (p[1] + tips[(i + 1) % n][1]) / 2, top], P) })).sort((a, b) => a.k - b.k);
      for (const { i } of panels) out.push(`<path d="${K.pathOf([[0, 0, top], tips[i], tips[(i + 1) % n]].map((q) => K.iso(q, P)), true)}" fill="${i % 2 ? "#c0392b" : "#f2f4f6"}" stroke="#7a1a10" stroke-width="0.6"/>`);
      void vis;
      const runner = top - 60 + 44 * st.v;
      out.push(S(K.cylinder(0, 0, 2.2, runner, 4, P, 14), { tone: "mid" }), S(K.cylinder(0, 0, 1.8, top, 4, P, 14), { tone: "mid" }));
      return out.join("");
    },
    set: (st, p) => { if (p.open !== undefined) st.vT = +p.open ? 1 : 0; },
    step: (st, dt, calm) => ease(st, "v", st.vT, dt, calm, 0.4),
    readout: (st) => (st.v > 0.9 ? "open and locked · the stretchers hold the ribs out against wind and rain" : st.v < 0.1 ? "closed" : "opening…"),
  });

})();
