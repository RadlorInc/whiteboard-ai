// "springlauncher cx cy k angle=0..90 fire=0|1 lab=0 lit=block|plates|barrel|plunger|ball" — a PART (PARTS.md, batch
// 5): the spring launcher of projectile.js, clamped to the bench, its origin the bench point under the clamp block's
// middle; it fires toward +x. A clamp block with its thumb screw, two bracket plates (the far one printed with a
// protractor, 0 to 90°), the barrel on a pivot bolt between them with a red pointer on the protractor, a muzzle ring,
// the spring's plunger out of the back with its pull ring and a trigger under it, and a 1.6 cm steel ball in the muzzle.
// angle = the barrel's elevation (eased). fire=1 pulls the trigger: the plunger snaps forward and the ball leaves at
// 2.6 m/s (follow it with steelball or a path); fire=0 cocks it again and loads a ball. World units: 1 = 1 cm.
// anchors: muzzle (the ball's centre at the muzzle, at the angle it was built with) pivot.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const XP = 2, ZP = 6.8, BARREL = 9.2, RO = 1.4, RI = 0.92, RB = 0.8, V0 = 2.6;
  const PLATE = ["#9aa0a8", "#d9dadd"], PFACE = "#e9eaec", PINK = "#3c3f45";
  const BODY = ISO.tint("#e4e8ec", ["#8f99a3", "#a1aab3", "#b3bbc3", "#c6cdd3"], "#2f3840");
  const TUBE = ISO.tint("#d7e3ef", ["#5f7d9c", "#7190ad", "#84a2bd", "#98b3cc"], "#1f3550");
  const rad = (d) => (d * Math.PI) / 180;
  const dirOf = (a) => [Math.cos(rad(a)), 0, Math.sin(rad(a))];

  function backSvg(P) {
    const B03 = window.B03, out = [`<path class="iso-halo" d="${K.haloOf({ x: XP - 5.2, y: -2.5, w: 8, d: 5, r: 0.3 }, 0, 0.02, P)}"/>`];
    // the clamp block, its jaw slot on the front and the thumb screw (toward +y)
    out.push(`<g data-name="block">${ISO.tinted(BODY, ISO.wbox(P, [XP - 5.2, XP + 2.8], [-2.5, 2.5], [0, 1.6], "mid"))}` +
      `<path d="${K.pathOf([[XP - 4.6, 2.51, 0.35], [XP + 2.2, 2.51, 0.35], [XP + 2.2, 2.51, 0.75], [XP - 4.6, 2.51, 0.75]].map((p) => K.iso(p, P)), true)}" fill="#59616a" stroke="#2f3840" stroke-width="0.5"/>` +
      ISO.tinted(ISO.T.steel, S(G.disc(2.5, 2.8, 0.25, window.B25.Y([XP - 3.6, 0, 1.1]), P), { tone: "mid" })) + B03.knob(P, window.B25.Y([XP - 3.6, 0, 1.1]), 2.8, 3.6, 0.62) + `</g>`);
    // the far bracket plate with the protractor printed on its inner face (ticks hang from the arc's rule)
    out.push(`<g data-name="plates">${ISO.prismY(P, [[-4.8, 1.6], [4, 1.6], ...ISO.arc(0, ZP, 5.8, rad(-20), rad(100), 24), [-4.8, 4.4]].map(([x, z]) => [XP + x, z]), -2.4, -1.8, PLATE, PFACE, PINK)}`);
    const y = -1.79, minor = [], major = [];
    for (let d = 0; d <= 90; d += 5) { const r1 = d % 15 ? 4.6 : 4.2; (d % 15 ? minor : major).push(K.segment([XP + Math.cos(rad(d)) * 5.2, y, ZP + Math.sin(rad(d)) * 5.2], [XP + Math.cos(rad(d)) * r1, y, ZP + Math.sin(rad(d)) * r1], P)); }
    out.push(L(K.pathOf(ISO.arc(0, ZP, 5.2, rad(-2), rad(92), 30).map(([x, z]) => K.iso([XP + x, y, z], P))), { tone: "lo", free: true }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    for (let d = 0; d <= 90; d += 30) out.push(window.LAB.faceText(P, [XP + Math.cos(rad(d)) * 3.65, y + 0.01, ZP + Math.sin(rad(d)) * 3.65 - 0.15], [1, 0, 0], String(d), 0.42, "#3c3f45"));
    out.push(`</g>`);
    return out.join("");
  }
  function frontSvg(P) {
    return `<g data-name="plates">${ISO.prismY(P, [[-2.6, 1.6], [2.6, 1.6], [1.0, ZP + 0.9], [-1.0, ZP + 0.9]].map(([x, z]) => [XP + x, z]), 1.8, 2.4, PLATE, PFACE, PINK)}` +
      ISO.tinted(ISO.T.steel, S(G.disc(2.4, 2.75, 0.62, window.B25.Y([XP, 0, ZP]), P, { steps: 6 }), { tone: "mid" }) + S(G.disc(2.75, 2.95, 0.3, window.B25.Y([XP, 0, ZP]), P), { tone: "hi" })) +
      D([K.iso([XP - 1.6, 2.41, 2.3], P), K.iso([XP + 1.6, 2.41, 2.3], P)], { size: 0.45 }) + `</g>`;
  }
  // the barrel at angle a; cock 1 = plunger drawn back (loaded), 0 = fired; ball = whether a ball sits in the muzzle
  function barrelSvg(P, a, cock, ball) {
    const F = G.frameAlong([XP, 0, ZP], dirOf(a)), at = (s) => [XP + Math.cos(rad(a)) * s, 0, ZP + Math.sin(rad(a)) * s], out = [];
    out.push(`<path d="${K.pathOf([[XP, -1.78, ZP], [XP + Math.cos(rad(a)) * 5.3, -1.78, ZP + Math.sin(rad(a)) * 5.3]].map((p) => K.iso(p, P)))}" stroke="#c0392b" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.07).toFixed(2)}" data-free=""/>`);
    // plunger rod and pull ring behind the end cap (out 1.6 cm when cocked), and the trigger lever under the cap
    const back = -5.5, pull = back - 0.4 - 1.6 * cock;
    out.push(`<g data-name="plunger">${ISO.tinted(ISO.T.steel, S(G.disc(pull + 0.3, back, 0.22, F, P), { tone: "hi", crease: "none" }))}${ISO.tinted(ISO.T.plastic, S(G.ringBand(pull, pull + 0.4, 0.3, 0.62, F, P, { steps: 20 }), { tone: "mid" }))}</g>`);
    out.push(`<g data-name="barrel">${ISO.tinted(TUBE, S(G.lathe([[-4.5, RO], [BARREL, RO], [BARREL, RI], [-4.5, RI]], F, P, { steps: 32 }), { tone: "hi" }))}` +
      ISO.tinted(ISO.T.steel, S(G.ringBand(BARREL - 0.8, BARREL, RO, RO + 0.24, F, P, { steps: 32 }), { tone: "mid" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(back, -4.5, 1.0, F, P, { steps: 24 }), { tone: "hi" })) +
      `<path d="${G.circleOf(F, BARREL - 0.02, RI, P, 32)}" fill="#2a2d31" stroke="#16181b" stroke-width="0.5"/></g>`);
    // the trigger: a short black lever hanging from the cap's underside, swung back when fired
    const tr = (u, w, v) => { const d = dirOf(a), n = [-Math.sin(rad(a)), 0, Math.cos(rad(a))], p0 = at(-5); return [p0[0] + d[0] * u + n[0] * w, v, p0[2] + d[2] * u + n[2] * w]; };
    const sw = 0.35 * (1 - cock);
    out.push(`<g data-name="plunger">${ISO.tinted(ISO.T.plastic, ISO.box((u, w, v) => tr(u - sw * (-(w + 1)), w, v), P, [-0.2, 0.2], [-2.1, -0.95], [-0.25, 0.25], "mid"))}</g>`);
    if (ball) out.push(`<g data-name="ball">${ISO.tinted(ISO.T.steel, S(G.sphereOf(at(BARREL - 0.35), RB, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "springlauncher", title: "Spring launcher (part)", compare: null,
    about: "A spring launcher clamped to the bench: a barrel on a pivot between two bracket plates with a protractor, a steel ball in its muzzle; angle tilts it, fire=1 releases the spring and the ball leaves at 2.6 m/s toward +x. anchors: muzzle pivot",
    line: "springlauncher cx cy k angle=0..90 fire=0|1 lab=0 lit=block|plates|barrel|plunger|ball",
    demo: { line: "springlauncher 470 430 22 angle=30", script: [{ set: {}, hold: 1 }, { set: { angle: 50, lit: "barrel" }, hold: "settle" }, { set: { fire: 1, lit: "plunger" }, hold: 1.2 }, { set: { fire: 0, lit: "ball" }, hold: "settle" }, { set: { angle: 15, lit: "plates" }, hold: "settle" }] },
    make([cx = 470, cy = 380, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const st = { a: ISO.clamp(ISO.num(o, "angle", 30), 0, 90), cock: o.fire === "1" ? 0 : 1, ball: o.fire !== "1" }, want = { a: st.a, cock: st.cock };
      let lit = o.lit || "";
      g.innerHTML = backSvg(P) + `<g data-part="barrel"></g>` + frontSvg(P) + `<g data-part="words"></g>`;
      const el = LAB.parts(g);
      const m = (a) => [XP + Math.cos(rad(a)) * (BARREL - 0.35), 0, ZP + Math.sin(rad(a)) * (BARREL - 0.35)];
      g.anchors = { muzzle: m(st.a).map((v) => +v.toFixed(3)), pivot: [XP, 0, ZP] };
      const draw = () => {
        const aq = Math.round(st.a * 4) / 4;
        w.rebuild(el.barrel, `${aq} ${st.cock.toFixed(2)} ${st.ball}`, () => barrelSvg(P, aq, st.cock, st.ball));
        if (lab) w.rebuild(el.words, String(Math.round(st.a)), () => LAB.word(P, lab, [XP - 3, 0, ZP + 6], `launcher at ${Math.round(st.a)}°`, "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.angle !== undefined && Number.isFinite(+p.angle)) want.a = ISO.clamp(+p.angle, 0, 90);
        if (p.fire !== undefined) want.cock = +p.fire ? 0 : 1;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.a = ISO.follow(st.a, want.a, dt, 0.35, calm);
        if (Math.abs(st.a - want.a) < 0.05) st.a = want.a;
        // the spring lets go in a few hundredths of a second; cocking it again is a slow pull
        st.cock = ISO.follow(st.cock, want.cock, dt, want.cock < st.cock ? 0.015 : 0.3, calm);
        if (Math.abs(st.cock - want.cock) < 0.01) st.cock = want.cock;
        if (st.cock < 0.5) st.ball = false;
        if (st.cock === 1) st.ball = true;
        draw();
        return st.a !== want.a || st.cock !== want.cock;
      };
      g.readout = () => {
        const a = rad(st.a);
        return `spring launcher at ${Math.round(st.a)}° · ${st.ball ? "cocked, ball loaded" : "fired"} · the ball leaves at ${V0} m/s: ${(V0 * Math.cos(a)).toFixed(2)} m/s along, ${(V0 * Math.sin(a)).toFixed(2)} m/s up`;
      };
      draw();
      return g;
    },
  });
})();
