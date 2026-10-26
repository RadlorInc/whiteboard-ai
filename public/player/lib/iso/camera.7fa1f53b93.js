// "camera cx cy width shoot=1 flash=0|1 lab=1 lit=lens|aperture|shutter|sensor|button|dial|flash|battery" — a
// mirrorless camera cut in half down the lens's axis, so the inside shows. The kept half has the grip with the shutter
// button, the mode dial, the viewfinder hump with the hot shoe and the flash window, and the lens release button.
// Cut open: the lens barrel (mount, zoom ring, focus ring, front ring) holds five glass elements in their retaining
// rings and the aperture blades; in the body, the shutter unit with its curtain of four blades, the sensor on its
// stabiliser plate, the main circuit board and the battery in the grip. Light from the scene runs through the
// elements and stops at the closed shutter; set({ shoot: 1 }) presses the button, the curtain drops open, the light
// lands on the sensor (an upside-down image), and the curtain closes again. flash=1 fires the flash with it.
// 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const AXZ = 46, FRONT = 86, RAY_X = 106;
  const DARK = [["#1f2226", "#4a4f56"], "#33373c", "#0d0e10"], RUB = [["#16181b", "#3a3e44"], "#2a2d31", "#0d0e10"], STEEL = [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"];
  // the barrel as rings along the axis: [x0, x1, outer radius, wall, kind]
  const RINGS = [[10, 14, 31, 3, STEEL, "mount"], [14, 30, 33, 3, DARK], [30, 50, 35.5, 3, RUB, "zoom"], [50, 55, 34, 3, DARK], [55, 70, 35.5, 3, RUB, "focus"], [70, FRONT, 37, 4, DARK]];
  // glass elements: centre x, radius, front and back sag (+ bulges out, − hollows in), edge thickness
  const LENSES = [[79, 31, 3.2, 3, 3], [67, 26, 2.6, -1.8, 3], [53, 22, 3, 3, 2.4], [42, 19, -1.8, -1.8, 5], [27, 22, 2.6, 2.6, 3]];
  const AP = [47, 9];                                                      // aperture: blades at x 47, opening radius 9 (about f/4)
  const SENSOR_X = -17, CURTAIN = [-9.6, -8.4];
  const halfRing = (R, r) => [...ISO.arc(0, AXZ, R, Math.PI / 2, (3 * Math.PI) / 2, 24), ...ISO.arc(0, AXZ, r, (3 * Math.PI) / 2, Math.PI / 2, 24)];
  const ease = ISO.smooth;

  ISO.add({
    name: "camera", title: "Camera (cut open)", compare: "camera 480 270 400",
    about: "A camera cut in half: light passes through the lens's glass elements and the aperture, and when the shutter button is pressed the shutter opens and the light lands on the sensor, which records the picture.",
    line: "camera cx cy width shoot=1 flash=0|1 lab=1 lit=lens|aperture|shutter|sensor|button|dial|flash|battery",
    demo: { line: "camera 480 270 400", script: [{ set: {}, hold: 1 }, { set: { shoot: 1 }, hold: "settle" }, { set: { shoot: 1, flash: 1 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.9, H = size * 1.2;
      const { P, g } = ISO.frame([[-30, -65, 0], [30, -65, 0], [-30, 0, 0], [FRONT, 0, AXZ - 37], [FRONT, -37, AXZ], [FRONT, 0, AXZ + 37], [-30, -22, 102], [-30, 0, 102], [RAY_X, 0, AXZ + 20], [RAY_X, 0, AXZ - 20]], cx, cy, W, H, { azimuth: 58, elevation: 20, pad: size * 0.05 }, parent);
      const box = (x, y, z, tone = "mid", c = T.C.dark, lit = false) => T.box(P, x, y, z, tone, c, lit), out = [];
      const V = [K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([0, 0, 1], P) - K.depthOf([0, 0, 0], P)];
      const cut = (pts, fill, stroke = "#0d0e10", w = 0.6) => T.quad(P, pts.map(([x, z]) => [x, 0.05, z]), fill, stroke, w);
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -30, y: -65, w: 60, d: 65, r: 4 }, 0, 4, P)}"/>`);
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
      // ── top plate, front wall round the lens opening, the grip with the shutter button, the lens release button
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
      // ── the lens barrel, far end first: each ring is half a tube, its cut faces on the plane y = 0
      const rings = RINGS.map(([x0, x1, R, wall, [sh, face, ink], kind]) => {
        let s = ISO.prismX(P, halfRing(R, R - wall), x0, x1, sh, face, ink);
        if (kind === "zoom" || kind === "focus") {
          // grip ridges: thin raised strips along the ring on the side that faces the viewer, each a closed outline
          for (let a = Math.PI / 2 + 0.12; a < 1.5 * Math.PI - 0.06; a += 0.13) {
            if (Math.cos(a) * V[0] + Math.sin(a) * V[1] <= 0.05) continue;
            const p = (x, da) => [x, (R + 0.05) * Math.cos(a + da), AXZ + (R + 0.05) * Math.sin(a + da)];
            s += T.quad(P, [p(x0 + 0.6, -0.025), p(x1 - 0.6, -0.025), p(x1 - 0.6, 0.025), p(x0 + 0.6, 0.025)], "#0d0e10", "#0d0e10", 0.3);
          }
        }
        return s;
      });
      out.push(`<g data-name="lens">${rings.join("")}</g>`);
      // the glass elements cut through: lens-shaped sections, each held to the barrel by a retaining ring
      const inner = (x) => { const r = RINGS.find(([a, b]) => x >= a && x <= b); return r[2] - r[3]; };
      const lens = LENSES.map(([xc, r, s1, s2, te]) => {
        const pts = [];
        for (let i = 0; i <= 16; i++) { const z = -r + (2 * r * i) / 16, u = z / r; pts.push([xc + te / 2 + s1 * (1 - u * u), AXZ + z]); }
        for (let i = 16; i >= 0; i--) { const z = -r + (2 * r * i) / 16, u = z / r; pts.push([xc - te / 2 - s2 * (1 - u * u), AXZ + z]); }
        const ri = inner(xc), hold = [[r, ri], [-ri, -r]].map(([a, b]) => cut([[xc - te / 2 - 0.8, AXZ + a], [xc + te / 2 + 0.8, AXZ + a], [xc + te / 2 + 0.8, AXZ + b], [xc - te / 2 - 0.8, AXZ + b]], "#2a2d31"));
        return hold.join("") + cut(pts, "#d8ecf7", "#5d7f96", 0.7);
      });
      out.push(`<g data-name="lens">${lens.join("")}</g>`);
      const ri = inner(AP[0]);
      out.push(`<g data-name="aperture">${[[AP[1], ri], [-ri, -AP[1]]].map(([a, b]) => cut([[AP[0] - 0.6, AXZ + a], [AP[0] + 0.6, AXZ + a], [AP[0] + 0.6, AXZ + b], [AP[0] - 0.6, AXZ + b]], "#3a3e44")).join("")}</g>`);
      out.push(`<g data-part="light"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      // the curtain: four blades over the window when closed, stacked in the slot below it when open
      const bladesMemo = [], bladesSvg = (q) => bladesMemo[q] || (bladesMemo[q] = [3, 2, 1, 0].map((i) => {
        const z0 = 30 + 8 * i - q / 40 * (30 + 8 * i - (21 + 1.6 * i));
        return box(CURTAIN, [-18, 0], [z0, z0 + 8.4], "hi", T.C.dark);
      }).join(""));
      // the light: three rays from the scene, bent by the front element to meet on the sensor; they stop at the
      // curtain until it opens. Light, not a texture: the rays start in the open air, so they are marked data-free.
      const lightMemo = [], lightSvg = (q) => lightMemo[q] || (lightMemo[q] = (() => {
        const open = q / 40, end = open > 0.6 ? SENSOR_X : CURTAIN[1];
        const zAt = (h, x) => AXZ + h * ((x - SENSOR_X) / (LENSES[0][0] - SENSOR_X));
        const p = (x, z) => K.iso([x, 0.1, z], P), fade = 0.25 + 0.5 * ease(0.6, 1, open);
        const cone = [p(RAY_X, AXZ + 20), p(LENSES[0][0], AXZ + 20), p(end, zAt(20, end)), p(end, zAt(-20, end)), p(LENSES[0][0], AXZ - 20), p(RAY_X, AXZ - 20)];
        let s = `<path d="${K.pathOf(cone, true)}" fill="#f6c14a" fill-opacity="${(0.18 * fade + 0.06).toFixed(2)}" stroke="none"/>`;
        for (const h of [20, 0, -20]) s += `<path data-free d="${K.pathOf([p(RAY_X, AXZ + h), p(LENSES[0][0], AXZ + h), p(end, zAt(h, end))])}" fill="none" stroke="#e08a10" stroke-width="1.3" stroke-opacity="${(0.5 + 0.4 * fade).toFixed(2)}"/>`;
        return s;
      })());
      const chipSvg = (lit) => T.quad(P, [[SENSOR_X + 0.03, -14, 34], [SENSOR_X + 0.03, 0, 34], [SENSOR_X + 0.03, 0, 58], [SENSOR_X + 0.03, -14, 58]], lit ? "#c7b8f5" : "#4a3f78", "#1c1830", 0.5);
      const flashSvg = (on) => T.quad(P, [[-3.98, -18, 88], [-3.98, -4, 88], [-3.98, -4, 97], [-3.98, -18, 97]], on ? "#fffbe6" : "#e6e8ea", on ? "#f0a020" : "#5a6068", on ? 1.2 : 0.6) +
        (on ? (() => { const c = K.iso([-3, -11, 92.5], P), k = K.cameraOf(P).k; return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(16 * k).toFixed(1)}" ry="${(11 * k).toFixed(1)}" fill="#ffe9a8" opacity=".45"/>`; })() : "");

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
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        w.rebuild(el.words, lab ? "1" : "", () => !lab ? "" : [
          T.word(P, [LENSES[0][0], 0, AXZ + 37], "lens elements", { dy: -10 }),
          T.word(P, [AP[0], 0, AXZ - 34], "aperture", { dy: 18 }),
          T.word(P, [-9, 0, 20], "shutter", { dy: 18 }),
          T.word(P, [SENSOR_X - 2, 0, 72], "sensor", { anchor: "end", dx: -8, dy: -4 }),
          T.word(P, [20, -52, 84], "shutter button", { anchor: "end", dx: -6, dy: -10 }),
          T.word(P, [-14, -44, 92], "mode dial", { dy: -14 }),
          T.word(P, [-4, -18, 92], "flash", { anchor: "end", dx: -8, dy: 4 }),
          T.word(P, [62, -35.5, AXZ - 35.5], "focus ring", { anchor: "end", dx: -6, dy: 16 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.flash !== undefined) st.flash = !!+p.flash;
        if (p.shoot) st.tau = 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        if (st.tau >= 0) { st.tau += ISO.still() ? 10 : dt; if (st.tau > 1.8) { st.tau = -1; st.shots++; } }
        draw();
        return st.tau >= 0;
      };
      g.readout = () => {
        const open = openAt(st.tau);
        if (st.tau >= 0 && open > 0.6) return `shutter open · 1/125 s (shown about 100× slower) · aperture f/4 · the lens focuses an upside-down image on the sensor's 24 million pixels${st.flash ? " · flash fires" : ""}`;
        if (st.tau >= 0) return "shutter button pressed · the curtain moves";
        return st.shots ? "click · picture taken: each pixel measured how much light reached it" : "ready · light comes through five glass elements and the aperture, and stops at the closed shutter";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
