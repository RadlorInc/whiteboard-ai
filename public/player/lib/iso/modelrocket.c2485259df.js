// "modelrocket cx cy k launch=0|1 lab=0 lit=nose|body|fins|motor|lug" — a PART (PARTS.md, batch 5): the model rocket
// of rocket.js, 45 cm long and 3 cm across, standing upright; origin the end of its motor's nozzle on the axis (place
// it at= a launchpad's `rocket` anchor: its launch lug then rides the pad's rod, 1.75 cm to +x). A white cardboard body
// tube with two black bands, a red ogive nose cone, three swept balsa fins, the launch lug, an Estes C6 motor's end with
// its clay nozzle and the engine hook, and the igniter's two leads hanging from the nozzle (anchor `igniter`, where
// the controller's clips bite). set({ launch: 1 }) fires it, shown 20× slower: the C6's thrust rises to 14 N in 0.2 s
// (then settles near 4.5 N); the 100 g rocket (weight 0.98 N) rises because thrust > weight, a = (T − W)/m integrated
// from that curve, with its exhaust flame and smoke (WebGL, an SVG flame and puffs without it); it freezes 0.16 s after
// ignition, 35 cm up. launch=0 puts it back. The smoke spreads over the blast deflector 3 cm under the nozzle.
// World units: 1 = 1 cm. anchors: top lug igniter
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 1.5, B0 = 1.2, B1 = 32.2, TIP = 45, LUG = [R + 0.25, 0], PADZ = -3, MASS = 0.1, G9 = 9.81, SLOW = 20, TMAX = 0.16, N = 26;
  const thrust = (t) => (t < 0 ? 0 : t < 0.2 ? 14 * (t / 0.2) : t < 0.3 ? 14 - 95 * (t - 0.2) : t < 1.8 ? 4.5 : t < 1.9 ? 4.5 * (1.9 - t) / 0.1 : 0);
  const NOSE = (s) => { const q = (s - B1) / (TIP - B1); return R * Math.sqrt(Math.max(0, 1 - q * q)) * (1 - 0.18 * q); };
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const BALSA = ISO.tint("#f6e9cf", ["#d8c094", "#e0cba3", "#e8d6b4", "#efe0c4"], "#7a6036");

  // the rocket at rest (moved as a whole while it flies): fins behind, motor, body, nose, lug, fins in front
  function rocketSvg(P) {
    const F = zAx([0, 0, 0]), view = G.viewOf(P), front = [], back = [];
    for (const a of [Math.PI / 3, Math.PI, (5 * Math.PI) / 3]) {
      const d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], at = (s, r, w) => [r * d[0] + w * t[0], r * d[1] + w * t[1], s];
      const plan = [[B0 + 0.5, R - 0.05], [B0 + 10, R - 0.05], [B0 + 5, R + 6], [B0 - 0.6, R + 6]], V = [...plan.map(([s, r]) => at(s, r, -0.16)), ...plan.map(([s, r]) => at(s, r, 0.16))];
      const fin = ISO.tinted(BALSA, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "hi"));
      (d[0] * view[0] + d[1] * view[1] > 0 ? front : back).push(fin);
    }
    const nose = []; for (let i = 0; i <= 24; i++) { const s = B1 + ((TIP - B1) * i) / 24; nose.push([s, NOSE(s), 1]); }
    nose[0] = [B1, R]; nose[nose.length - 1] = [TIP, 0];
    // the motor: its kraft casing below the tube, the clay nozzle, the steel engine hook over its end
    const motor = ISO.tinted(ISO.T.amber, S(G.disc(0, B0 + 0.4, 0.9, F, P, { steps: 24 }), { tone: "hi" })) + `<path d="${G.circleOf(F, 0, 0.62, P)}" fill="#8b8172" stroke="#5a5246" stroke-width="0.5"/><path d="${G.circleOf(F, 0, 0.22, P)}" fill="#2f343a"/>` +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [-1.06, -0.9], [-0.18, 0.18], [-0.15, B0 + 2.2], "mid") + ISO.wbox(P, [-1.06, -0.55], [-0.18, 0.18], [-0.15, 0.02], "mid"));
    const body = S(G.solidOf([[B0, R], [B1, R]], F, P), { tone: "hi", inner: L([8, 16, 24].map((s) => G.arcOf(F, s, R, P)).join(""), { tone: "faint" }) });
    const band = `<path d="${G.arcOf(F, 26, R, P)}${G.arcOf(F, 28.5, R, P)}" fill="none" stroke="#2f343a" stroke-width="${Math.max(1, G.scaleOf(P) * 0.5).toFixed(2)}"/>`;
    const cone = ISO.tinted(ISO.T.red, S(G.solidOf([[B1 - 0.2, R * 0.92], ...nose], F, P), { tone: "hi" }));
    const lug = ISO.tinted(ISO.T.amber, S(G.disc(12, 18, 0.25, zAx([LUG[0], LUG[1], 0]), P, { steps: 14 }), { tone: "mid" }));
    return named("fins", back.join("")) + named("motor", motor) + named("body", body + band) + named("nose", cone) + named("lug", lug) + named("fins", front.join(""));
  }
  // the igniter: its tip up in the nozzle, two copper leads bent down out of it to where the clips bite
  const igniterSvg = (P) => `<path d="${K.pathOf([[-0.1, 0, 0.05], [-0.35, 0, -0.6], [-0.35, 0, -1.6]].map((p) => K.iso(p, P)))}${K.pathOf([[0.1, 0, 0.05], [0.35, 0, -0.6], [0.35, 0, -1.6]].map((p) => K.iso(p, P)))}" fill="none" stroke="#b5652e" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.07).toFixed(2)}" data-free=""/>`;
  const flameSvg = (P, z, T, clock) => {
    if (T < 0.05) return "";
    const n = K.iso([0, 0, z], P), k = G.scaleOf(P), len = (4 + T * 1.3) * k * (1 + 0.07 * Math.sin(clock * 47) + 0.04 * Math.sin(clock * 83)), wd = 1.3 * k;
    const shape = (l, w) => `M${n[0] - w} ${n[1]}C${n[0] - w} ${n[1] + l * 0.35} ${n[0] - w * 0.3} ${n[1] + l * 0.7} ${n[0]} ${n[1] + l}C${n[0] + w * 0.3} ${n[1] + l * 0.7} ${n[0] + w} ${n[1] + l * 0.35} ${n[0] + w} ${n[1]}Z`;
    return `<path d="${shape(len, wd)}" fill="#f28c28" opacity=".85"/><path d="${shape(len * 0.62, wd * 0.62)}" fill="#ffd34d"/><path d="${shape(len * 0.3, wd * 0.36)}" fill="#fffbe6"/>`;
  };

  ISO.add({
    name: "modelrocket", title: "Model rocket (part)", compare: null,
    about: "A model rocket 45 cm long: nose cone, body tube, three fins, launch lug and a C6 motor with its igniter leads; fired, it lifts off because the thrust (up to 14 N) is bigger than its weight (0.98 N). anchors: top lug igniter",
    line: "modelrocket cx cy k launch=0|1 lab=0 lit=nose|body|fins|motor|lug",
    demo: { line: "modelrocket 480 470 5", script: [{ set: { launch: 0 }, hold: 1.2 }, { set: { lit: "fins" }, hold: 1 }, { set: { lit: "" , launch: 1 }, hold: 3.4 }, { set: { launch: 0, lit: "motor" }, hold: 1 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const s = { on: false, t: 0, v: 0, h: 0, clock: 0, puffs: [] };
      g.innerHTML = `<g data-part="smoke">${Array.from({ length: N }, () => `<circle r="0" fill="#c9ced4" opacity="0"/>`).join("")}</g><g data-part="ign">${igniterSvg(P)}</g>` +
        `<g data-part="fly"><g data-part="flame"></g>${rocketSvg(P)}${lab ? LAB.word(P, lab, [0, -R, 40], "nose cone", "#555", { anchor: "end", size: 14 }) + LAB.word(P, lab, [0, -R, 20], "body tube", "#555", { anchor: "end", size: 14 }) + LAB.word(P, lab, [-2, R + 6, 3], "fins", "#555", { anchor: "end", size: 14 }) : ""}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, TIP], lug: [LUG[0], LUG[1], 15], igniter: [0, 0, -1.6] };
      const el = LAB.parts(g), w = ISO.writer(), puffs = [...el.smoke.children];
      let lit = o.lit || "", spawn = 0;
      // the exhaust and the smoke as one shader layer under the rocket (rocket.js's); without WebGL, SVG puffs and flame
      const fx = ISO.gl(g, P, 960, 540, el.fly, `uniform float uZ;uniform float uT;uniform vec4 uP[${N}];uniform float uA[${N}];
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=vec4(0.);
          for(int i=0;i<${N};i++)c=over(puffInk(vb,uP[i],uA[i],uTime,float(i),0.),c);
          vec2 ax=axisOf(vb,vec3(0.,0.,uZ),vec3(0.,0.,-1.));
          c=over(exhaustInk(vb,vec3(0.,0.,uZ),vec3(0.,0.,-1.),15.,1.3,uT,uTime)*smoothstep(${(PADZ - 0.6).toFixed(1)},${(PADZ + 0.2).toFixed(1)},uZ-ax.y),c);
          gl_FragColor=finish(c);}`, ["uZ", "uT", "uP", "uA"]);
      const pP = new Float32Array(N * 4), pA = new Float32Array(N);
      if (fx) puffs.forEach((c) => c.remove());
      const rise = () => s.h * 100;   // metres → cm
      const draw = () => {
        const T = s.on ? thrust(s.t) : 0;
        w.attr(el.fly, "transform", K.translateAlong(P, [0, 0, rise()]));
        if (fx) {
          pA.fill(0);
          s.puffs.forEach((p, i) => { pP.set([p.x, p.y, p.z, 1 + p.age * 2.25], i * 4); pA[i] = Math.max(0, 0.55 * (1 - p.age / 2.6)); });
          fx.set({ uZ: rise(), uT: T / 14, uP: pP, uA: pA }, T > 0.05 || pA.some((a) => a > 0));
        } else {
          w.rebuild(el.flame, `${T.toFixed(2)} ${s.clock.toFixed(2)}`, () => flameSvg(P, 0, T, s.clock));
          s.puffs.forEach((p, i) => { const c = K.iso([p.x, p.y, p.z], P), a = Math.max(0, 0.55 * (1 - p.age / 2.6)); w.attr(puffs[i], "cx", c[0].toFixed(1)); w.attr(puffs[i], "cy", c[1].toFixed(1)); w.attr(puffs[i], "r", ((1 + p.age * 2.25) * G.scaleOf(P)).toFixed(1)); w.attr(puffs[i], "opacity", a.toFixed(2)); });
        }
        B27.light(w, g, lit);
      };
      const reset = () => { s.t = 0; s.v = 0; s.h = 0; s.puffs = []; puffs.forEach((c) => c.setAttribute("opacity", "0")); };
      g.set = (p) => {
        if (p.launch !== undefined) { const on = String(p.launch) === "1"; if (on !== s.on) reset(); s.on = on; }
        if (p.lit !== undefined) lit = p.lit;
      };
      // one step of real (not shown) time: thrust, weight, and the climb from rest once thrust beats weight
      const step = (h) => { const T = thrust(s.t), a = (T - MASS * G9) / MASS; if (s.h > 0 || a > 0) { s.v = Math.max(0, s.v + a * h); s.h += s.v * h; } s.t += h; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.clock += dt;
        if (s.on && s.t < TMAX) {
          if (calm) while (s.t < TMAX) step(0.001);
          else { const real = Math.min(dt, 0.1) / SLOW; for (let i = 0; i < 4; i++) step(real / 4); }
          spawn -= dt;
          if (spawn <= 0 && thrust(s.t) > 0.5) { spawn = 0.06; const i = s.puffs.length, ang = i * 2.4; s.puffs.push({ x: Math.cos(ang) * 1, y: Math.sin(ang) * 1, z: rise() - 2, age: 0, vx: Math.cos(ang) * 2.5, vy: Math.sin(ang) * 2.5 }); if (s.puffs.length > N) s.puffs.shift(); }
        }
        for (const p of s.puffs) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(PADZ, p.z - dt * 1.5); }
        draw();
        return s.on && s.t < TMAX;
      };
      g.readout = () => {
        const T = s.on ? thrust(s.t) : 0, W9 = MASS * G9;
        if (!s.on) return `C6 motor: thrust up to 14 N · rocket ${MASS * 1000} g, weight ${W9.toFixed(2)} N · thrust > weight, so it will lift off`;
        return `t = ${s.t.toFixed(3)} s · thrust ${T.toFixed(1)} N > weight ${W9.toFixed(2)} N · net ${(T - W9).toFixed(1)} N · a = ${((T - W9) / MASS).toFixed(0)} m/s² · v = ${s.v.toFixed(1)} m/s · up ${rise().toFixed(0)} cm (shown ${SLOW}× slower${s.t >= TMAX ? ", frozen here" : ""})`;
      };
      draw();
      return g;
    },
  });
})();
