// "rocket cx cy size launch=0 arrows=0 lab=1 lit=nose|fins|body|motor|rod|pad" — a model rocket on its launch pad.
// A cardboard body tube with a pointed nose cone, three swept fins and a launch lug sits on the launch rod of a tripod
// pad, its motor's nozzle just above the steel blast deflector; the igniter clips run by a cable to the launch
// controller (safety key, lamp, button). set({ launch: 1 }) fires it: an Estes C6 motor's thrust rises to 14 N in
// 0.2 s and settles near 4.5 N. The rocket (100 g, weight 0.98 N) rises because thrust > weight; the readout integrates
// a = (T − W)/m from the same thrust curve. Shown 20× slower. 1 unit = 0.5 cm (rocket 45 cm long).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FIELD = { x: -66, y: -54, w: 136, d: 108, r: 6 }, ROD = [9.5, 0], Z0 = 14, R = 6, LEN = 90, ROD_TOP = 150, MASS = 0.1, G9 = 9.81, SLOW = 20, CM = 0.5 / 100;
  const TMAX = 0.16;                                                  // the shown flight stops (a freeze frame) 0.16 s after ignition
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const thrust = (t) => (t < 0 ? 0 : t < 0.2 ? 14 * (t / 0.2) : t < 0.3 ? 14 - 95 * (t - 0.2) : t < 1.8 ? 4.5 : t < 1.9 ? 4.5 * (1.9 - t) / 0.1 : 0);
  const NOSE = (s) => R * Math.sqrt(Math.max(0, 1 - ((s - 66) / 28) ** 2) * (1 - 0.18 * (s - 66) / 28));

  function padSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FIELD, -5, 5, P)}"/>`, ISO.tinted(ISO.T.green, S(K.slabOf(FIELD, -5, 5, P, 4, 0.6), { tone: "mid" }))];
    // tripod: three legs from the hub, rubber feet, the blast deflector on the hub and the rod in its clamp
    const hub = [ROD[0], ROD[1], 8];
    for (const a of [Math.PI / 2, Math.PI / 2 + 2.09, Math.PI / 2 + 4.19]) {
      const d = [Math.cos(a), Math.sin(a)];
      out.push(ISO.box((u, w, y) => [hub[0] + u * d[0] - y * d[1], hub[1] + u * d[1] + y * d[0], 8 - (u * 6) / 46 + w], P, [2, 46], [-1.4, 1.4], [-1.6, 1.6], "mid"));
      out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(hub[0] + d[0] * 46, hub[1] + d[1] * 46, 3, 0, 2.4, P, 18), { tone: "hi" })));
    }
    out.push(S(K.cylinder(hub[0], hub[1], 5, 4, 6, P, 28, 0.4), { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 13, 10, 1.2, P, 48, 0.4), { tone: "hi" })), L(K.ring(0, 0, 10, 11.2, P, 40), { tone: "faint" }));
    // launch controller with its key, lamp and button, and the cable to the igniter clips
    const C = { x: 30, y: 24, w: 24, d: 16, r: 2 };
    out.push(S(K.slabOf(C, 0, 8, P, 2, 0.6), { tone: "mid", inner: L(K.sideSeam(C, 3, P, 2), { tone: "faint" }) }));
    out.push(ISO.tinted(ISO.T.red, S(K.cylinder(C.x + 17, C.y + 8, 3, 8, 2.4, P, 20, 0.3), { tone: "hi" })), ISO.tinted(ISO.T.brass, S(K.cylinder(C.x + 6, C.y + 8, 1.8, 8, 2, P, 16), { tone: "hi" })));
    out.push(ISO.wbox(P, [C.x + 5.4, C.x + 6.6], [C.y + 6, C.y + 10], [10, 13], "hi"), S(G.sphereOf([C.x + 11.5, C.y + 4, 9], 1.2, P), { tone: "hi" }));
    out.push(`<path d="${K.pathOf([[C.x, C.y + 8, 3], [20, 24, 0.6], [6, 12, 0.6], [2, 4, 3], [1.5, 2, Z0 - 3]].map((p) => K.iso(p, P)))}" fill="none" stroke="#2f343a" stroke-width="1.2" stroke-linejoin="round"/>`);
    out.push(`<path d="${K.pathOf([[-1.5, 2, Z0 - 3], [-1, 1, Z0 - 1.5]].map((p) => K.iso(p, P)))}${K.pathOf([[1.5, 2, Z0 - 3], [1, 1, Z0 - 1.5]].map((p) => K.iso(p, P)))}" stroke="#c0392b" stroke-width="1"/>`);
    out.push(D([K.iso([C.x, C.y + 8, 3], P), K.iso([1.5, 2, Z0 - 3], P)], { size: 0.9, tone: "hi" }));
    return out.join("");
  }
  const rodSvg = (P) => named("rod", S(K.cylinder(ROD[0], ROD[1], 0.7, 10, ROD_TOP - 10, P, 12), { tone: "mid", crease: "none" }) + ISO.tinted(ISO.T.red, S(K.cylinder(ROD[0], ROD[1], 1.6, ROD_TOP, 2.4, P, 16), { tone: "hi" })));
  // The rocket at rest on the pad (moved as a whole while it flies): fins behind, body and nose, fins in front.
  function rocketSvg(P) {
    const F = zAx([0, 0, Z0]), view = [Math.cos((48 * Math.PI) / 180), Math.sin((48 * Math.PI) / 180)], fins = [], front = [], back = [];
    for (const a of [Math.PI / 3, Math.PI, (5 * Math.PI) / 3]) {
      const d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], at = (s, r, w) => [r * d[0] + w * t[0], r * d[1] + w * t[1], Z0 + s];
      const plan = [[1, R], [22, R], [11, R + 14], [-2, R + 14]], V = [...plan.map(([s, r]) => at(s, r, -0.7)), ...plan.map(([s, r]) => at(s, r, 0.7))];
      const fin = ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "hi");
      ((d[0] * view[0] + d[1] * view[1]) > 0 ? front : back).push(fin);
    }
    fins.push(...back);
    const nose = []; for (let i = 0; i <= 24; i++) { const s = 66 + (28 * i) / 24; nose.push([s, NOSE(s), 1]); }
    nose[0] = [66, R]; nose[nose.length - 1] = [94, 0];
    const body = S(G.solidOf([[0, R], [66, R]], F, P), { tone: "hi", inner: L([30, 46, 64].map((s) => G.arcOf(F, s, R, P)).join(""), { tone: "faint" }) });
    const cone = ISO.tinted(ISO.T.red, S(G.solidOf([[65.5, R * 0.9], ...nose], F, P), { tone: "hi" }));
    const motor = ISO.tinted(ISO.T.steel, S(G.disc(-3, 0.2, 3.4, F, P), { tone: "hi" })) + `<path d="${G.circleOf(F, -3, 2.2, P)}" fill="#2f343a"/>`;
    const lug = S(G.disc(34, 46, 1.4, zAx([R + 1.4, 0, Z0]), P, { steps: 14 }), { tone: "mid" });
    const band = `<path d="${G.arcOf(F, 50, R, P)}${G.arcOf(F, 56, R, P)}" fill="none" stroke="#2f343a" stroke-width="1.6"/>`;
    return named("fins", fins.join("")) + named("motor", motor) + named("body", body + band) + named("nose", cone) + lug + named("fins", front.join(""));
  }
  const flameSvg = (P, z, T, clock) => {
    if (T < 0.05) return "";
    const n = K.iso([0, 0, z - 3], P), k = K.cameraOf(P).k, len = (8 + T * 2.6) * k * (1 + 0.07 * Math.sin(clock * 47) + 0.04 * Math.sin(clock * 83)), wd = 2.6 * k;
    const shape = (l, w) => `M${n[0] - w} ${n[1]}C${n[0] - w} ${n[1] + l * 0.35} ${n[0] - w * 0.3} ${n[1] + l * 0.7} ${n[0]} ${n[1] + l}C${n[0] + w * 0.3} ${n[1] + l * 0.7} ${n[0] + w} ${n[1] + l * 0.35} ${n[0] + w} ${n[1]}Z`;
    return `<path d="${shape(len, wd)}" fill="#f28c28" opacity=".85"/><path d="${shape(len * 0.62, wd * 0.62)}" fill="#ffd34d"/><path d="${shape(len * 0.3, wd * 0.36)}" fill="#fffbe6"/>`;
  };

  ISO.add({
    name: "rocket", title: "Model rocket launch", compare: "rocket 480 250 260",
    about: "A model rocket on its launch pad: nose cone, body tube, fins, launch lug on the rod, igniter wired to the controller; fired, it rises because thrust is bigger than its weight.",
    line: "rocket cx cy size launch=0 arrows=0 lab=1 lit=nose|fins|body|motor|rod|pad",
    demo: { line: "rocket 480 290 440", script: [{ set: { launch: 0 }, hold: 1.5 }, { set: { launch: 1 }, hold: 3.2 }, { set: { launch: 0 }, hold: 1 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", arrows = o.arrows === "1", H = size, W = size * 1.4;
      const { P, g } = ISO.frame([...K.boxCorners(FIELD, -5, 0), [0, 0, Z0 + 94 + 74], [ROD[0], 0, ROD_TOP + 3]], cx, cy, W, H, { azimuth: 48, elevation: 18 }, parent);
      const s = { on: false, t: 0, v: 0, h: 0, clock: 0, puffs: [] };
      const N = 26;
      g.innerHTML = `<g data-name="pad">${padSvg(P)}</g><g data-part="smoke">${Array.from({ length: N }, () => `<circle r="0" fill="#c9ced4" opacity="0"/>`).join("")}</g>` +
        `<g data-part="fly"><g data-part="flame"></g>${rocketSvg(P)}${lab ? ISO.word(K.iso([0, -R, Z0 + 80], P), "nose cone", "#555", { size: 14, anchor: "end", dy: -4 }) + ISO.word(K.iso([-4, R + 10, Z0 + 4], P), "fins", "#555", { size: 14, anchor: "end" }) + ISO.word(K.iso([0, -R, Z0 + 40], P), "body tube", "#555", { size: 14, anchor: "end" }) : ""}</g>${rodSvg(P)}<g data-part="arrows"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), puffs = [...el.smoke.children];
      let lit = o.lit || "", spawn = 0;
      // the exhaust and the smoke as one shader layer between the pad and the rocket; without WebGL, SVG puffs and flame
      const fx = ISO.gl(g, P, W, H, el.fly, `uniform float uZ;uniform float uT;uniform vec4 uP[${N}];uniform float uA[${N}];
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=vec4(0.);
          for(int i=0;i<${N};i++)c=over(puffInk(vb,uP[i],uA[i],uTime,float(i),0.),c);
          vec2 ax=axisOf(vb,vec3(0.,0.,uZ),vec3(0.,0.,-1.));
          c=over(exhaustInk(vb,vec3(0.,0.,uZ),vec3(0.,0.,-1.),30.,2.6,uT,uTime)*smoothstep(11.2,12.4,uZ-ax.y),c);
          gl_FragColor=finish(c);}`, ["uZ", "uT", "uP", "uA"]);
      const pP = new Float32Array(N * 4), pA = new Float32Array(N);
      if (fx) puffs.forEach((c) => c.remove());
      const rise = () => s.h / CM;                                       // metres → world units
      const draw = () => {
        const T = s.on ? thrust(s.t) : 0;
        w.attr(el.fly, "transform", K.translateAlong(P, [0, 0, rise()]));
        if (fx) {
          pA.fill(0);
          s.puffs.forEach((p, i) => { pP.set([p.x, p.y, p.z, 2 + p.age * 4.5], i * 4); pA[i] = Math.max(0, 0.55 * (1 - p.age / 2.6)); });
          fx.set({ uZ: Z0 - 3 + rise(), uT: T / 14, uP: pP, uA: pA }, T > 0.05 || pA.some((a) => a > 0));
        } else w.rebuild(el.flame, `${T.toFixed(2)} ${s.clock.toFixed(2)}`, () => flameSvg(P, Z0, T, s.clock));
        if (!fx) s.puffs.forEach((p, i) => { const c = K.iso([p.x, p.y, p.z], P), a = Math.max(0, 0.55 * (1 - p.age / 2.6)); w.attr(puffs[i], "cx", c[0].toFixed(1)); w.attr(puffs[i], "cy", c[1].toFixed(1)); w.attr(puffs[i], "r", ((2 + p.age * 4.5) * K.cameraOf(P).k).toFixed(1)); w.attr(puffs[i], "opacity", a.toFixed(2)); });
        w.rebuild(el.arrows, arrows ? `${T.toFixed(1)} ${rise().toFixed(0)}` : "", () => {
          if (!arrows) return "";
          const k = K.cameraOf(P).k, c = K.iso([0, 0, Z0 + 40 + rise()], P), n = K.iso([0, 0, Z0 + rise()], P), ar = (x, y, dy, col) => `<path d="M${x} ${y}V${y + dy}" stroke="${col}" stroke-width="2.4"/><path d="M${x - 4} ${y + dy - Math.sign(dy) * 6}L${x} ${y + dy}L${x + 4} ${y + dy - Math.sign(dy) * 6}" fill="none" stroke="${col}" stroke-width="2.4"/>`;
          return ar(n[0] - 22, n[1], -Math.max(6, T * 5 * k), "#c0392b") + ar(c[0] + 22, c[1], MASS * G9 * 5 * k + 6, "#2b6cc4");
        });
        w.rebuild(el.words, "w", () => !lab ? "" : [
          ISO.word(K.iso([ROD[0], 0, ROD_TOP + 3], P), "launch rod", "#555", { size: 14, anchor: "start", dy: -6 }),
          ISO.word(K.iso([42, 32, 8], P), "launch controller", "#555", { size: 13, dy: 24 }),
        ].join(""));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.launch !== undefined) { const on = !!+p.launch; if (on && !s.on) { s.t = 0; s.v = 0; s.h = 0; s.puffs = []; } if (!on) { s.t = 0; s.v = 0; s.h = 0; s.puffs = []; puffs.forEach((c) => c.setAttribute("opacity", "0")); } s.on = on; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.clock += dt;
        if (s.on && s.t < TMAX) {
          const real = (ISO.still() ? 0.15 : dt) / SLOW, steps = 4;
          for (let i = 0; i < steps; i++) { const h = real / steps, T = thrust(s.t), a = Math.max(0, (T - MASS * G9) / MASS); if (s.h > 0 || T > MASS * G9) { s.v += a * h - (s.h > 0 && a === 0 ? G9 * h : 0); s.h = Math.max(0, s.h + s.v * h); } s.t += h; }
          spawn -= dt;
          if (spawn <= 0 && thrust(s.t) > 0.5) { spawn = 0.06; const i = s.puffs.length, ang = i * 2.4; s.puffs.push({ x: Math.cos(ang) * 2, y: Math.sin(ang) * 2, z: Z0 - 4 + rise(), age: 0, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5 }); if (s.puffs.length > N) s.puffs.shift(); }
        }
        for (const p of s.puffs) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(12, p.z - dt * 3); }
        draw();
        return s.on && s.t < TMAX;
      };
      g.readout = () => {
        const T = s.on ? thrust(s.t) : 0, W9 = MASS * G9;
        if (!s.on) return `C6 motor: thrust up to 14 N · rocket ${MASS * 1000} g, weight ${W9.toFixed(2)} N · thrust > weight, so it will lift off`;
        return `t = ${s.t.toFixed(3)} s · thrust ${T.toFixed(1)} N > weight ${W9.toFixed(2)} N · net ${(T - W9).toFixed(1)} N · a = ${((T - W9) / MASS).toFixed(0)} m/s² · v = ${s.v.toFixed(1)} m/s · up ${(s.h * 100).toFixed(0)} cm (shown ${SLOW}× slower${s.t >= TMAX ? ", frozen here" : ""})`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
