// "microscope cx cy height obj=4|10|40 focus=1 lab=1" — a light microscope, with what you'd see in the eyepiece.
// Base with a lamp, arm, stage with clips and a slide, a turret of three objectives (4×, 10×, 40×), coarse and fine
// focus knobs and a 10× eyepiece. Total magnification = eyepiece × objective (40×, 100×, 400×). The round view beside
// it shows onion cells at that magnification, blurred until the stage is focused. set({ obj, focus }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const OBJ = [4, 10, 40], STAGE_Z = 52, TUBE = [0, 0, 112];
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function bodySvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -34, y: -40, w: 68, d: 70, r: 10 }, 0, 6, P)}"/>`];
    // Heavy base with the lamp in it, the arm rising at the back, and the stage.
    out.push(S(K.slabOf({ x: -34, y: -40, w: 68, d: 70, r: 12 }, 0, 8, P, 10, 1), { tone: "mid" }));
    out.push(S(K.cylinder(0, 0, 7, 8, 4, P, 32, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.amber, S(K.cylinder(0, 0, 5, 12, 1, P, 28), { tone: "hi" })));
    out.push(ISO.prismY(P, [[-6, 8], [6, 8], [10, 40], [8, 100], [2, 118], [-8, 118], [-10, 100], [-14, 40]].map(([x, z]) => [x, z]), -34, -22, ["#8a8a8f", "#d8d8db"], "#c9c9cc", "#3c3f45"));
    out.push(S(K.slabOf({ x: -26, y: -24, w: 52, d: 46, r: 3 }, STAGE_Z - 4, 4, P, 4, 0.8), { tone: "mid" }), L(K.ring(0, 0, 4, STAGE_Z, P, 24), { tone: "lo" }));
    // Stage clips and a glass slide with a stained specimen.
    for (const x of [-16, 16]) out.push(ISO.wbox(P, [x - 2, x + 2], [-14, 4], [STAGE_Z, STAGE_Z + 1], "hi"), D([K.iso([x, -12, STAGE_Z + 1], P)], { size: 0.7 }));
    out.push(ISO.tinted(ISO.T.glass, ISO.wbox(P, [-22, 22], [-6, 6], [STAGE_Z, STAGE_Z + 0.8], "hi")), `<path d="${K.ring(0, 0, 3, STAGE_Z + 0.85, P, 20)}" fill="#c98bc9" fill-opacity=".7"/>`);
    // Focus knobs on the arm: coarse (big) and fine (small), both sides.
    for (const y of [-38, -18]) {
      const F = yAx([-4, y, 66]);
      out.push(S(G.disc(0, 4, 9, F, P), { tone: "mid" }), L(G.ribsOf(F, 0, 4, 9, 24, P, { seams: true }), { tone: "lo" }), S(G.disc(4, 7, 5, F, P), { tone: "mid" }));
    }
    // Body tube, eyepiece at an angle.
    out.push(ISO.wbox(P, [-8, 8], [-22, -6], [TUBE[2] - 6, TUBE[2] + 6], "mid"));
    out.push(S(G.disc(0, 26, 6, G.frameOf([0, -10, TUBE[2] + 6], [0, -0.45, 0.89], [1, 0, 0], [0, 0.89, 0.45]), P), { tone: "mid" }), S(G.disc(26, 34, 7, G.frameOf([0, -10, TUBE[2] + 6], [0, -0.45, 0.89], [1, 0, 0], [0, 0.89, 0.45]), P), { tone: "hi" }));
    if (lab) out.push(ISO.word(K.iso([0, -16, TUBE[2] + 40], P), "eyepiece 10×", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([28, 0, STAGE_Z], P), "stage", "#555", { size: 13, anchor: "start" }), ISO.word(K.iso([-14, -40, 56], P), "focus knobs", "#555", { size: 13, anchor: "end", dy: 14 }), ISO.word(K.iso([0, 30, 4], P), "lamp", "#555", { size: 13, dy: 14 }));
    return out.join("");
  }
  // The turret under the body tube, turned so objective i points down at the slide; a little lower when focused.
  function turretSvg(P, a, which, drop) {
    const c = [0, -2, TUBE[2] - 10 - drop], out = [S(K.cylinder(c[0], c[1], 13, c[2], 4, P, 40, 0.5), { tone: "mid" })];
    OBJ.forEach((m, i) => {
      const ang = a + (i * 2 * Math.PI) / 3, x = Math.cos(ang) * 8, y = Math.sin(ang) * 8 + c[1], len = 8 + i * 5, down = i === which;
      const top = c[2], z0 = top - len - (down ? 0 : -2);
      out.push(S(K.cylinder(x, y, 3.4 - i * 0.4, z0, len, P, 20, 0.3), { tone: down ? "hi" : "mid", lit: down }));
      out.push(L(K.sideArc(x, y, 3.4 - i * 0.4, z0 + 2, P, 14), { tone: ["lo", "mid", "hi"][i] }));
    });
    return out.join("");
  }
  // What you see: a disc of onion cells — brick-shaped walls with nuclei — scaled by the magnification, blurred out of focus.
  function viewSvg(cx, cy, r, mag, blur) {
    const cell = 5.5 * mag / 10, out = [`<defs><clipPath id="mview"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><filter id="mblur"><feGaussianBlur stdDeviation="${(blur * 4).toFixed(2)}"/></filter></defs>`];
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbf3e6" stroke="#3c3f45" stroke-width="2"/>`);
    const walls = [];
    const rows = Math.ceil(r / cell) + 1, cols = Math.ceil(r / (cell * 3)) + 1;
    for (let row = -rows; row <= rows; row++) for (let col = -cols; col <= cols; col++) {
      const w = cell * 3, h = cell, x = cx + col * w + (row % 2 ? w / 2 : 0), y = cy + row * h;
      if (Math.hypot(x - cx, y - cy) > r + w) continue;
      walls.push(`M${x} ${y}h${w}v${h}h${-w}Z`);
      if (cell > 3) walls.push(`M${x + w / 2 + cell / 5} ${y + h / 2}a${cell / 5} ${cell / 5} 0 1 0 ${-cell / 2.5} 0a${cell / 5} ${cell / 5} 0 1 0 ${cell / 2.5} 0`);
    }
    out.push(`<g clip-path="url(#mview)" filter="url(#mblur)"><path d="${walls.join("")}" fill="none" stroke="#9b4b9b" stroke-width="${Math.max(0.6, cell / 10).toFixed(2)}"/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "microscope", title: "Light microscope", compare: "microscope 480 270 440",
    about: "Lamp, stage and slide, a turret of 4×, 10× and 40× objectives and focus knobs; the view shows the cells at 10× each objective.",
    line: "microscope cx cy height obj=4|10|40 focus=1 lab=1",
    demo: { line: "microscope 480 270 440 obj=4 focus=0", script: [{ set: { focus: 1 }, hold: "settle" }, { set: { obj: 10 }, hold: "settle" }, { set: { obj: 40 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 0.75, H = size * 0.95;
      const { P, g } = ISO.frame([[-36, -42, 0], [36, 32, 0], [0, -30, 152], [30, 0, 152]], cx - size * 0.28, cy, W, H, { azimuth: 52, elevation: 22 }, parent);
      const which0 = Math.max(0, OBJ.indexOf(+o.obj || 4));
      // The turret turns so the chosen objective sits at angle 0 under the tube.
      const angleFor = (i) => -(i * 2 * Math.PI) / 3;
      const s = { which: which0, a: angleFor(which0), aT: angleFor(which0), focus: o.focus === "0" ? 0 : 1, fT: o.focus === "0" ? 0 : 1 };
      g.innerHTML = `<g>${bodySvg(P, lab)}</g><g data-part="turret"></g>`;
      const view = mk("g", {}, parent), w = ISO.writer(), el = g.querySelector('[data-part="turret"]');
      const vx = cx + size * 0.32, vy = cy - size * 0.05, vr = size * 0.22;
      const draw = () => {
        w.rebuild(el, `${s.a.toFixed(3)} ${s.focus.toFixed(3)}`, () => turretSvg(P, s.a, s.which, 6 * s.focus));
        const mag = 10 * OBJ[s.which];
        w.rebuild(view, `${mag} ${s.focus.toFixed(2)}`, () => viewSvg(vx, vy, vr, OBJ[s.which], 1 - s.focus) + (lab ? `<text x="${vx}" y="${vy + vr + 22}" text-anchor="middle" style="font:600 15px 'Helvetica Neue',Arial,sans-serif" fill="#444">what you see · ${mag}×</text>` : ""));
      };
      g.set = (p) => {
        if (p.obj !== undefined) { const i = OBJ.indexOf(+p.obj); if (i >= 0) { s.which = i; s.aT = angleFor(i); } }
        if (p.focus !== undefined) s.fT = +p.focus ? 1 : 0;
      };
      g.update = (dt) => { s.a = ISO.follow(s.a, s.aT, dt, 0.35, ISO.still()); s.focus = ISO.follow(s.focus, s.fT, dt, 0.5, ISO.still()); draw(); return s.a !== s.aT || s.focus !== s.fT; };
      g.readout = () => `eyepiece 10× × objective ${OBJ[s.which]}× = ${10 * OBJ[s.which]}× · ${s.focus > 0.95 ? "in focus" : "turn the focus knob"} · field of view about ${(4.5 / OBJ[s.which]).toFixed(2)} mm across`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
