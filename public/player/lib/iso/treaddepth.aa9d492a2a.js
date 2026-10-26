// "treaddepth cx cy width k=good|worn lab=1" — a tyre's tread cut through, with a digital depth gauge in the middle
// groove. The cut face shows the carcass (inner liner, body ply and two steel belts as rows of cord ends), the tread
// ribs with their sipes, and a wear bar in each groove standing 1.6 mm off the groove floor. The gauge's foot rests on
// the two ribs either side of the groove; set({ pin: 1 }) pushes its pin down until it touches the groove floor and the
// screen reads the depth. set({ k: "worn" }) wears the ribs down to the top of the wear bars. set({ down: 0|1 }) lifts
// the gauge off or sets it down. World units: 1 = 1 mm. New tread about 8 mm (10/32"); legal minimum 1.6 mm in the
// UK/EU and 2/32" in the US, which is where the wear bars sit.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const BASE = 12, NEW = 8, BAR = 1.6, Y0 = -50, Y1 = 0, GY = -16;          // floor height, depths, section depth, gauge's y
  const RIBS = [[-70, -43], [-33, -5], [5, 33], [43, 70]], GROOVES = [[-43, -33], [-5, 5], [33, 43]];
  const FOOT = { x: -17, y: GY - 6, w: 34, d: 12 }, BODY_H = 44, PIN_R = 0.9;
  const RUBBER = ISO.T.rubber, STEEL = ISO.T.steel, INK = "#121214";
  const RUB = ["#2a2b2f", "#4b4d52"], CUT = "#55585e";              // rubber sides (dark, light) and the cut face
  const LCD = "#dfe6d1", NAVY = "#1f2a36";
  const rimmed = (svg) => svg.replace("<text ", '<text stroke="#fdfdfb" stroke-width="4" stroke-linejoin="round" paint-order="stroke" ');

  // One rib cut through: its outline in x–z (the shoulder ribs round off on the outside), from the floor to `top`.
  function ribOutline([x0, x1], top) {
    const r = Math.min(4, top - BASE - 0.4), pts = [];
    if (x0 === -70) { pts.push([x0, BASE], ...ISO.arc(x0 + r, top - r, r, Math.PI, Math.PI / 2, 6), [x1, top], [x1, BASE]); }
    else if (x1 === 70) { pts.push([x0, BASE], [x0, top], ...ISO.arc(x1 - r, top - r, r, Math.PI / 2, 0, 6), [x1, BASE]); }
    else pts.push([x0, BASE], [x0, top - 0.5], [x0 + 0.5, top], [x1 - 0.5, top], [x1, top - 0.5], [x1, BASE]);
    return pts;
  }
  // Sipes: thin closed slits across the rib top, every 10 mm back from the cut.
  function sipes(P, [x0, x1], top) {
    const out = [];
    for (let y = -8; y > Y0 + 4; y -= 10) out.push(K.planOutline({ x: x0 + 3, y: y - 0.35, w: x1 - x0 - 6, d: 0.7, r: 0.3 }, top, P, 2));
    return K.lineSvg(out.join(""), { tone: "lo" });
  }
  function ribSvg(P, rib, top) {
    return ISO.prismY(P, ribOutline(rib, top), Y0, Y1, RUB, CUT, INK) + sipes(P, rib, top);
  }
  // The carcass under the tread: inner liner, body ply, two steel belts (rows of cord ends) and a nylon cap ply.
  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -72, y: Y0 - 2, w: 144, d: 54, r: 6 }, -1, 1, P)}"/>`];
    out.push(ISO.prismY(P, [[-70, 0], [70, 0], [70, BASE], [-70, BASE]], Y0, Y1, RUB, CUT, INK));
    const at = (x, z) => K.iso([x, Y1 + 0.05, z], P);
    out.push(`<path d="${K.pathOf([at(-70, 1.6), at(70, 1.6)])}" stroke="#6b6e75" stroke-width="0.7" fill="none"/>`);
    out.push(`<path d="${K.pathOf([at(-70, 10.4), at(70, 10.4)])}" stroke="#8a7a5a" stroke-width="0.8" fill="none"/>`);
    const row = (z, from, to, step) => { const p = []; for (let x = from; x <= to + 1e-6; x += step) p.push(at(x, z)); return p; };
    out.push(`<g style="--anatomy-dot:#c9b98f">${D(row(3.6, -66, 66, 2.4), { size: 0.55, tone: "hi" })}</g>`);
    out.push(`<g style="--anatomy-dot:#d9dadd">${D([...row(6.4, -60, 60, 1.6), ...row(8.2, -56, 56, 1.6)], { size: 0.6, tone: "hi" })}</g>`);
    return out.join("");
  }
  // A wear bar: a little bridge across the groove floor, 1.6 mm high, at the cut face.
  const barSvg = (P, [x0, x1]) => ISO.tinted(RUBBER, ISO.wbox(P, [x0, x1], [-7, Y1], [BASE, BASE + BAR], "hi"));
  // The gauge, built standing on z = 0 and lifted with a translate: steel foot, body, screen, two buttons, cap.
  function gaugeSvg(P, lab) {
    const out = [ISO.tinted(STEEL, ISO.wbox(P, [FOOT.x, FOOT.x + FOOT.w], [FOOT.y, FOOT.y + FOOT.d], [0, 3], "mid")),
      ISO.tinted(STEEL, ISO.wbox(P, [-4, 4], [GY - 4, GY + 4], [3, 6], "mid"))];
    out.push(K.solidSvg(K.slabOf({ x: -10, y: GY - 7, w: 20, d: 14, r: 2.5 }, 6, BODY_H, P, 4, 0.8), { tone: "mid", inner: K.lineSvg(K.sideSeam({ x: -10, y: GY - 7, w: 20, d: 14, r: 2.5 }, 6 + BODY_H * 0.22, P, 4), { tone: "faint" }) }));
    out.push(ISO.tinted(STEEL, S(K.cylinder(0, GY, 4.2, 6 + BODY_H, 3, P, 24, 0.4), { tone: "mid" })));
    // Screen: a dark bezel and a pale window in the front face, the reading written in its plane.
    const front = GY + 7, face = (pts, fill, stroke, w = 0.7) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, front + 0.06, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
    out.push(face([[-8, 36], [8, 36], [8, 48], [-8, 48]], "#2f3338", "#1b1d20"), face([[-7, 37.2], [7, 37.2], [7, 46.8], [-7, 46.8]], LCD, "#556048", 0.5));
    out.push(`<g transform="${ISO.faceMatrix(P, [0, front + 0.1, 42.6], 1)}"><text data-lcd x="0" y="0" text-anchor="middle" fill="${NAVY}" style="font:700 5px ui-monospace,Menlo,monospace">0.0</text>` +
      `<text data-lcd2 x="0" y="3.3" text-anchor="middle" fill="${NAVY}" style="font:600 1.9px ui-monospace,Menlo,monospace">mm · 0/32"</text></g>`);
    for (const x of [-4, 4]) out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 1.2, 1.9, G.frameOf([x, front, 28], [0, 1, 0], [-1, 0, 0], [0, 0, 1]), P), { tone: "mid" })));
    out.push(face([[-6, 12], [6, 12], [6, 22], [-6, 22]], "none", "#7d8086", 0.6));
    out.push(D([[-5, 13], [5, 13], [-5, 21], [5, 21]].map(([x, z]) => K.iso([x, front + 0.06, z], P)), { size: 0.5, tone: "mid" }));
    out.push(D([[FOOT.x + 3, FOOT.y + 3], [FOOT.x + FOOT.w - 3, FOOT.y + 3], [FOOT.x + 3, FOOT.y + FOOT.d - 3], [FOOT.x + FOOT.w - 3, FOOT.y + FOOT.d - 3]].map(([x, y]) => K.iso([x, y, 3], P)), { size: 0.55, tone: "hi" }));
    if (lab) out.push(rimmed(ISO.word(K.iso([10, front, 40], P), "depth gauge", "#444", { anchor: "start", size: 15, dy: 4 }).replace("<text ", '<text dx="10" ')));
    return out.join("");
  }

  ISO.add({
    name: "treaddepth", title: "Tread depth", compare: "treaddepth 480 300 400",
    about: "Tyre tread cut through with a digital depth gauge in the middle groove; its pin goes down to the groove floor and the screen reads the depth, new and worn to the wear bar.",
    line: "treaddepth cx cy width k=good|worn lab=1",
    demo: {
      line: "treaddepth 480 300 400",
      script: [{ set: { pin: 1 }, hold: "settle" }, { set: { k: "worn" }, hold: "settle" }, { set: { pin: 1 }, hold: "settle" }, { set: { k: "good" }, hold: "settle" }, { set: { pin: 1 }, hold: "settle" }],
    },
    make([cx, cy, width = 400], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.5, H = width * 1.1;
      const { P, g } = ISO.frame([...K.boxCorners({ x: -72, y: Y0, w: 144, d: 50 }, 0, BASE + NEW), [0, GY, BASE + NEW + 6 + BODY_H + 3], [FOOT.x, FOOT.y + FOOT.d, BASE + NEW + 30]], cx, cy, W, H, { azimuth: 70, elevation: 24 }, parent);
      g.innerHTML = `<g>${baseSvg(P)}</g>` + ["r0", "b0", "r1", "pin", "b1", "r2", "b2", "r3", "words"].map((k) => `<g data-k="${k}"></g>`).join("") + `<g data-name="gauge">${gaugeSvg(P, lab)}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-k]")].map((e) => [e.dataset.k, e]));
      const gauge = g.querySelector('[data-name="gauge"]'), lcd = g.querySelector("[data-lcd]"), lcd2 = g.querySelector("[data-lcd2]"), w = ISO.writer();
      GROOVES.forEach((gr, i) => (el[`b${i}`].innerHTML = barSvg(P, gr)));
      const depthOf = (k) => (k === "worn" ? BAR : NEW);
      const s = { depth: depthOf(o.k), pin: 0, down: 1 }, goal = { ...s };
      const draw = () => {
        const top = BASE + s.depth;
        RIBS.forEach((rib, i) => w.rebuild(el[`r${i}`], top.toFixed(3), () => ribSvg(P, rib, top)));
        // The gauge rides on the rib tops; lifted, it hovers 14 mm above them. The pin reaches s.pin of the way down.
        const lift = (1 - s.down) * 14, ext = s.pin * s.depth;
        w.attr(gauge, "transform", K.translateAlong(P, [0, 0, top + lift]));
        w.rebuild(el.pin, `${(top + lift).toFixed(2)} ${ext.toFixed(3)}`, () => ISO.tinted(STEEL, S(K.cylinder(0, GY, PIN_R, top + lift - ext - 0.01, ext + 3.02, P, 14), { tone: "hi", crease: "none" }) +
          S(K.cylinder(0, GY, 0.5, top + lift - ext - 0.01, 0.01, P, 10), { tone: "hi" })));
        const mm = ext, n32 = Math.round((mm / 25.4) * 32);
        if (lcd.textContent !== mm.toFixed(1)) { lcd.textContent = mm.toFixed(1); lcd2.textContent = `mm · ${n32}/32"`; }
        w.rebuild(el.words, lab ? top.toFixed(2) : "", () => !lab ? "" :
          rimmed(ISO.word(K.iso([-56, Y1, top], P), "tread", "#444", { size: 15, dy: -10 })) + rimmed(ISO.word(K.iso([0, Y1, 0], P), `wear bar ${BAR} mm`, "#444", { size: 15, dy: 20 })));
        w.light([gauge, el.pin], s.pin !== goal.pin ? [el.pin] : []);
      };
      g.set = (p) => {
        if (p.k !== undefined) { goal.depth = depthOf(p.k); goal.pin = 0; }
        if (p.pin !== undefined) goal.pin = ISO.clamp(+p.pin, 0, 1);
        if (p.down !== undefined) goal.down = +p.down ? 1 : 0;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.pin = ISO.follow(s.pin, goal.pin, dt, 0.4, calm);
        if (s.pin < 0.02 || goal.pin > 0) s.depth = ISO.follow(s.depth, goal.depth, dt, 0.5, calm);
        s.down = ISO.follow(s.down, goal.down, dt, 0.35, calm);
        draw();
        return s.pin !== goal.pin || s.depth !== goal.depth || s.down !== goal.down;
      };
      g.readout = () => {
        const mm = s.pin * s.depth, n32 = Math.round((mm / 25.4) * 32);
        const verdict = s.depth <= BAR + 0.05 ? "at the wear bar: the legal limit, change the tyre" : s.depth >= NEW - 0.05 ? "new tread, about 8 mm (10/32\")" : "wearing down";
        return `gauge reads ${mm.toFixed(1)} mm (${n32}/32") · ${verdict} · legal minimum 1.6 mm UK/EU, 2/32" US`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
