// "mirrorless cx cy k shoot=0|1 flash=0|1 lab=0 lit=lens|aperture|shutter|sensor|button|dial|flash|battery|board" — a
// PART (batch 6): camera.js's mirrorless camera, cut in half down the lens's axis, at real size (body 13 × 4 × 10 cm,
// 15 cm long with its lens). Its origin is the table point under the middle of the body, on the cut. The kept half:
// grip with the shutter button, mode dial, viewfinder hump with the hot shoe and the flash window, lens release
// button; inside, the main board with its chips, the battery in the grip, the stabiliser plate with the sensor, the
// shutter unit with its four-blade curtain; the lens on the mount (B31.lens: five glass elements in retaining rings,
// the aperture's seven blades at f/4). Light from the scene stops at the closed shutter; set({ shoot: 1 }) presses the
// button, the curtain drops open, the light lands upside-down on the sensor, and it closes again; flash=1 fires the
// flash with it. Built in mm (ISO.mm), anchors in cm: lens (the front of the lens on its axis), shoe (the hot shoe's
// top), button.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const AXZ = 46, FRONT = B31.FRONT, RAY_X = 106, OFF = [-10, 0, 0];
  const SENSOR_X = -17, CURTAIN = [-9.6, -8.4], AP = 9;
  const ease = ISO.smooth;
  let uid = 0;

  ISO.add({
    name: "mirrorless", title: "Mirrorless camera, cut open (part)", compare: null,
    about: "A mirrorless camera cut in half down the lens: light through five glass elements and the aperture stops at the shutter; pressed, the curtain opens and an upside-down image lands on the sensor. anchors: lens shoe button",
    line: "mirrorless cx cy k shoot=0|1 flash=0|1 lab=0 lit=lens|aperture|shutter|sensor|button|dial|flash|battery|board",
    demo: { line: "mirrorless 400 390 32 lab=1", script: [{ set: {}, hold: 1 }, { set: { shoot: 1 }, hold: "settle" }, { set: { shoot: 1, flash: 1 }, hold: "settle" }, { set: { lit: "sensor" }, hold: 1.2 }, { set: { lit: "battery" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const P = B31.shift(ISO.mm(Pc), OFF), id = ++uid;
      const box = (x, y, z, tone = "mid", c = T.C.dark) => T.box(P, x, y, z, tone, c), out = [];
      const cut = (pts, fill, stroke = "#0d0e10", w = 0.6) => T.quad(P, pts.map(([x, z]) => [x, 0.05, z]), fill, stroke, w);
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -30, y: -65, w: 40, d: 65, r: 4 }, 0, 4, P)}"/>`);
      // ── the body's shell: base, the far side wall, the back wall
      out.push(box([-30, 10], [-65, 0], [0, 4], "lo"), box([-30, 10], [-65, -62], [4, 80]), box([-30, -27], [-62, 0], [4, 80]));
      // inside, back to front: main board with its chips, battery, stabiliser plate, sensor
      const chips = [[18, 30], [40, 56], [62, 72]].map(([z0, z1], i) => box([-24.4, -23.2], [-50 + i * 14, -38 + i * 14], [z0, z1], "mid", T.C.chip)).join("");
      out.push(`<g data-name="board">${box([-26, -24.4], [-58, 0], [4, 76], "lo", T.C.pcb)}${chips}</g>`);
      out.push(`<g data-name="battery">${box([-22, 4], [-61, -42], [4, 64], "mid", T.C.battery)}</g>`);
      // the stabiliser plate hangs from a bracket on the board; the shutter unit hangs from a bracket on the plate
      out.push(box([-24.4, -21], [-26, 0], [20, 24], "mid", T.C.alu), box([-21, -19], [-26, 0], [20, 72], "mid", T.C.steel), box([-19, -12], [-26, -18], [62, 70], "mid", T.C.alu));
      out.push(`<g data-name="sensor">${box([-19, SENSOR_X], [-18, 0], [30, 62], "mid", T.C.chip)}<g data-part="chip"></g></g>`);
      // the shutter unit: a frame round the window (z 30–62) with a slot below it that the opened blades drop into
      out.push(`<g data-name="shutter">${box([-12, -6], [-26, -18], [30, 62], "mid", T.C.alu)}${box([-12, -9.8], [-26, 0], [20, 30], "mid", T.C.alu)}<g data-part="blades"></g>${box([-8.2, -6], [-26, 0], [20, 30], "mid", T.C.alu)}${box([-12, -6], [-26, 0], [62, 70], "mid", T.C.alu)}</g>`);
      // ── top plate, front wall round the lens opening
      out.push(box([-30, 10], [-65, 0], [80, 84]));
      out.push(box([7, 10], [-62, -31], [4, 80]), box([7, 10], [-31, 0], [4, 15]), box([7, 10], [-31, 0], [77, 80]));
      // the mode dial and the grip with the shutter button are on the far side, so they go before the hump
      out.push(`<g data-name="dial">${T.cyl(P, -14, -44, 9, 84, 8, "mid", T.C.dark, 40)}${T.L(K.knurl(-14, -44, 9, 84, 92, 40, P, 0), { tone: "lo" })}${T.L(K.lineOnTop([-14, -44], [-14 + 9, -44], 92, P), { tone: "hi" })}${T.dot(P, [[-14, -44, 92]], 0.6)}</g>`);
      out.push(T.slab(P, { x: 10, y: -65, w: 20, d: 26, r: 9 }, 4, 76, "mid", T.C.rubber, 8, 1));
      out.push(ISO.tinted(T.C.dark, T.S(G.disc(0, 2, 3.4, G.frameAlong([10, -35, 22], [1, 0, 0]), P), { tone: "hi" })));
      out.push(T.cyl(P, 20, -52, 5.2, 80, 2, "mid", T.C.dark, 24), `<g data-part="button" data-name="button">${T.cyl(P, 20, -52, 3.8, 82, 2.6, "hi", T.C.steel, 24)}</g>`);
      // the viewfinder hump with the hot shoe, and the flash window on its front
      out.push(box([-30, -4], [-22, 0], [84, 100]), box([-22, -8], [-13, 0], [100, 101.6], "hi", T.C.steel));
      out.push(`<g data-part="flash" data-name="flash"></g>`);
      // ── the lens on the mount: barrel rings, the iris (seen through the cut), the glass sections
      const lens = B31.lens(P, AXZ);
      out.push(`<g data-name="lens">${lens.rings}</g><g data-name="aperture">${B31.iris(P, AXZ, AP, `mlis${id}`)}</g><g data-name="lens">${lens.glass}</g>`);
      out.push(`<g data-part="light"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      g.anchors = { lens: [(FRONT - OFF[0]) / 10, 0, AXZ / 10], shoe: [(-15 - OFF[0]) / 10, -0.65, 10.16], button: [(20 - OFF[0]) / 10, -5.2, 8.46] };
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();

      // the curtain: four blades over the window when closed, stacked in the slot below it when open
      const bladesMemo = [], bladesSvg = (q) => bladesMemo[q] || (bladesMemo[q] = [3, 2, 1, 0].map((i) => {
        const z0 = 30 + 8 * i - q / 40 * (30 + 8 * i - (21 + 1.6 * i));
        return box(CURTAIN, [-18, 0], [z0, z0 + 8.4], "hi", T.C.dark);
      }).join(""));
      // the light: three rays from the scene, bent by the front element to meet on the sensor; they stop at the
      // curtain until it opens. Light, not a texture: the rays start in the open air, so they are marked data-free.
      const LX = B31.LENSES[0][0];
      const lightMemo = [], lightSvg = (q) => lightMemo[q] || (lightMemo[q] = (() => {
        const open = q / 40, end = open > 0.6 ? SENSOR_X : CURTAIN[1];
        const zAt = (h, x) => AXZ + h * ((x - SENSOR_X) / (LX - SENSOR_X));
        const p = (x, z) => K.iso([x, 0.1, z], P), fade = 0.25 + 0.5 * ease(0.6, 1, open);
        const cone = [p(RAY_X, AXZ + 20), p(LX, AXZ + 20), p(end, zAt(20, end)), p(end, zAt(-20, end)), p(LX, AXZ - 20), p(RAY_X, AXZ - 20)];
        let s = `<path d="${K.pathOf(cone, true)}" fill="#f6c14a" fill-opacity="${(0.18 * fade + 0.06).toFixed(2)}" stroke="none"/>`;
        for (const h of [20, 0, -20]) s += `<path data-free d="${K.pathOf([p(RAY_X, AXZ + h), p(LX, AXZ + h), p(end, zAt(h, end))])}" fill="none" stroke="#e08a10" stroke-width="1.3" stroke-opacity="${(0.5 + 0.4 * fade).toFixed(2)}"/>`;
        return s;
      })());
      const chipSvg = (on) => T.quad(P, [[SENSOR_X + 0.03, -14, 34], [SENSOR_X + 0.03, 0, 34], [SENSOR_X + 0.03, 0, 58], [SENSOR_X + 0.03, -14, 58]], on ? "#c7b8f5" : "#4a3f78", "#1c1830", 0.5);
      const flashSvg = (on) => T.quad(P, [[-3.98, -18, 88], [-3.98, -4, 88], [-3.98, -4, 97], [-3.98, -18, 97]], on ? "#fffbe6" : "#e6e8ea", on ? "#f0a020" : "#5a6068", on ? 1.2 : 0.6) +
        (on ? (() => { const c = K.iso([-3, -11, 92.5], P), kk = K.cameraOf(P).k; return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(16 * kk).toFixed(1)}" ry="${(11 * kk).toFixed(1)}" fill="#ffe9a8" opacity=".45"/>`; })() : "");

      // A shot, in seconds from the press: button down, curtain opens, the exposure (1/125 s shown slowed), closes.
      const st = { tau: -1, flash: o.flash === "1", lit: o.lit || "", shots: 0 };
      const openAt = (u) => (u < 0 ? 0 : ease(0.2, 0.45, u) * (1 - ease(1.25, 1.5, u)));
      const pressAt = (u) => (u < 0 ? 0 : ease(0, 0.15, u) * (1 - ease(1.5, 1.7, u)));
      const draw = () => {
        const open = openAt(st.tau), q = Math.round(open * 40);
        w.rebuild(el.blades, String(q), () => bladesSvg(q));
        w.rebuild(el.light, String(q), () => lightSvg(q));
        const exposing = open > 0.6;
        w.rebuild(el.chip, String(exposing), () => chipSvg(exposing));
        const fl = exposing && st.flash;
        w.rebuild(el.flash, String(fl), () => flashSvg(fl));
        w.attr(el.button, "transform", K.translateAlong(P, [0, 0, -1.4 * pressAt(st.tau)]));
        B31.light(w, g, st.lit);
        w.rebuild(el.words, lab ? "1" : "", () => !lab ? "" : [
          T.word(P, [LX, 0, AXZ + 37], "lens elements", { dy: -10 }),
          T.word(P, [B31.APX, 0, AXZ - 34], "aperture", { dy: 18 }),
          T.word(P, [-9, 0, 20], "shutter", { dy: 18 }),
          T.word(P, [SENSOR_X - 2, 0, 72], "sensor", { anchor: "end", dx: -8, dy: -4 }),
          T.word(P, [20, -52, 84], "shutter button", { anchor: "end", dx: -6, dy: -10 }),
          T.word(P, [-14, -44, 92], "mode dial", { dy: -14 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.flash !== undefined) st.flash = String(p.flash) === "1";
        if (String(p.shoot) === "1") st.tau = 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        if (st.tau >= 0) { st.tau += ISO.still() ? 10 : Math.min(Math.max(+dt || 0, 0), 0.1); if (st.tau > 1.8) { st.tau = -1; st.shots++; } }
        draw();
        return st.tau >= 0;
      };
      g.readout = () => {
        const open = openAt(st.tau);
        if (st.tau >= 0 && open > 0.6) return `shutter open · 1/125 s (shown about 100× slower) · aperture f/4 · the lens makes an upside-down image on the sensor${st.flash ? " · flash fires" : ""}`;
        if (st.tau >= 0) return "shutter button pressed · the curtain moves";
        return st.shots ? "click · picture taken: each pixel measured how much light reached it" : "ready · light comes through five glass elements and the aperture, and stops at the closed shutter";
      };
      if (String(o.shoot) === "1") st.tau = 0;
      draw();
      return g;
    },
  });
})();
