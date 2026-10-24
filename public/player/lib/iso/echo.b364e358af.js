// "echo cx cy width d=50 lab=1 lit=speaker|mic|wall|scope" — measuring the speed of sound with an echo.
// A loudspeaker on a stand sends a short click toward a brick wall d metres away; a microphone beside it hears the click
// go out and, later, its echo come back. Both show as blips on a two-channel timer screen, 2d/v apart (v = 343 m/s in
// air at 20 °C). The pulse is drawn as a few wavefronts spreading out and, after the wall, spreading back as if from a
// source behind the wall (the reflection). Distances are drawn shorter than they are; the numbers are true.
// set({ go: 1 }) sends a click; set({ d }) moves the wall.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const V = 343, XS = -146, ZS = 58, FLOOR = { x: -184, y: -64, w: 360, d: 128, r: 6 }, SPEED = 110, SWEEP = 0.6;
  const xwOf = (d) => -112 + d * 3;   // the wall's face for d metres (drawn shorter than true)

  function floorSvg(P) {
    const out = [ISO.baseboard(P, FLOOR, { h: 6, feet: 3 }), ISO.plate(P, { x: -176, y: 46, w: 40, d: 12, r: 1.2 })];
    // the loudspeaker stand: a round base, a pole and a yoke; the cabinet sits in the yoke
    out.push(S(K.cylinder(XS - 6, 0, 14, 0, 3, P, 32, 0.5), { tone: "mid" }), S(K.cylinder(XS - 6, 0, 2.6, 3, ZS - 22, P, 18), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [XS - 12, XS], [-16, 16], [ZS - 19, ZS - 16], "mid"));
    return out.join("");
  }
  // the microphone on its own small stand in front of the speaker
  function micSvg(P) {
    const out = [];
    out.push(S(K.cylinder(XS + 14, -30, 8, 0, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(XS + 14, -30, 1.4, 2.4, ZS - 14, P, 14), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 2.4], [8, 3.2], [10, 2.4, 1], [11.5, 0.8, 1]], G.frameOf([XS + 14, -30, ZS - 11.6], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" })));
    out.push(D(G.dotsOf(G.frameOf([XS + 14, -30, ZS - 11.6], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 9.5, 2.6, 10, P, { fade: [0.04, 0.42] }), { size: 0.4 }));
    return out.join("");
  }
  // (the cone and dust cap sit recessed in the cabinet's front, which the audit reads as sunk)
  function speakerSvg(P) {
    const out = [ISO.tinted(ISO.T.plastic, ISO.wbox(P, [XS - 14, XS + 2], [-18, 18], [ZS - 16, ZS + 20], "hi"))];
    const F = G.frameOf([XS + 2, 0, ZS + 2], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(S(G.ringBand(0, 1.2, 11, 13.5, F, P), { tone: "mid" }), ISO.tinted(ISO.T.rubber, S(G.lathe([[0.2, 11], [-2.5, 6, 1], [-4, 3], [-4, 0]], F, P, { fill: "facets" }), { tone: "hi" })));
    out.push(S(G.sphereOf([XS + 0, 0, ZS + 2], 2.6, P), { tone: "mid" }), D([[XS + 2.1, -15, ZS - 13], [XS + 2.1, 15, ZS - 13], [XS + 2.1, -15, ZS + 17], [XS + 2.1, 15, ZS + 17]].map((p) => K.iso(p, P)), { size: 0.5 }));
    return out.join("");
  }
  // The timer: a two-channel scope on the floor behind the speaker, its screen facing the reader, two knobs, two leads.
  const SC = { x0: -118, x1: -58, y0: 22, y1: 46, z1: 40 };
  function scopeSvg(P) {
    const out = [ISO.wbox(P, [SC.x0, SC.x1], [SC.y0, SC.y1], [0, SC.z1], "mid")];
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [SC.x0 + 3, SC.x1 - 15], [SC.y1, SC.y1 + 0.8], [6, SC.z1 - 4], "hi")));
    for (const z of [12, 24]) out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 2.4, 2.6, G.frameOf([SC.x1 - 7, SC.y1, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    out.push(`<path d="${K.pathOf([[SC.x0 + 6, SC.y0 + 4, SC.z1], [SC.x0 + 2, 0, SC.z1 + 10], [XS + 16, -22, 14], [XS + 14, -30, 6]].map((p) => K.iso(p, P)))}" fill="none" stroke="#3a3e44" stroke-width="1.3" stroke-linecap="round"/>`);
    out.push(`<path d="${K.pathOf([[SC.x0 + 16, SC.y0 + 4, SC.z1], [SC.x0 + 10, 10, SC.z1 + 14], [XS - 6, 16, ZS - 12]].map((p) => K.iso(p, P)))}" fill="none" stroke="#7a2a20" stroke-width="1.3" stroke-linecap="round"/>`);
    out.push(D([[SC.x0 + 6, SC.y0 + 4, SC.z1], [SC.x0 + 16, SC.y0 + 4, SC.z1], [XS + 14, -30, 6], [XS - 6, 16, ZS - 12]].map((p) => K.iso(p, P)), { size: 0.7 }));
    return out.join("");
  }
  // The brick wall: a block of courses with mortar lines that run between its edges, on a footing.
  function wallSvg(P) {
    const out = [ISO.wbox(P, [-4, 20], [-54, 54], [0, 6], "mid"), ISO.tinted(ISO.T.red, ISO.wbox(P, [0, 16], [-50, 50], [6, 102], "mid"))];
    const seams = [];
    // mortar courses on the two faces the reader sees (the back and the near end), wrapping the corner
    for (let z = 14; z < 102; z += 8) seams.push(K.pathOf([[16.02, -50, z], [16.02, 50.02, z], [0, 50.02, z]].map((p) => K.iso(p, P))));
    for (let z = 6, row = 0; z < 100; z += 8, row++) {
      for (let y = -50 + (row % 2 ? 9 : 18); y < 49; y += 18) seams.push(K.segment([16.02, y, z], [16.02, y, Math.min(z + 8, 102)], P));
      seams.push(K.segment([row % 2 ? 5 : 11, 50.02, z], [row % 2 ? 5 : 11, 50.02, Math.min(z + 8, 102)], P));
    }
    out.push(`<g style="${ISO.T.red}">${L(seams.join(""), { tone: "faint" })}</g>`);
    return out.join("");
  }
  // Wavefronts: arcs in the horizontal plane through the speaker's axis, centred on c, facing dir (+1 / −1), kept
  // between xa and xb.
  const front = (P, c, r, dir, xa, xb) => {
    const pts = [];
    for (let k = -14; k <= 14; k++) { const a = (k / 14) * 0.62, x = c + dir * Math.cos(a) * r, y = Math.sin(a) * r; if (x >= xa && x <= xb && Math.abs(y) < 52) pts.push(K.iso([x, y, ZS + 2], P)); }
    return pts.length > 1 ? K.pathOf(pts) : "";
  };

  ISO.add({
    name: "echo", title: "Echo: speed of sound", compare: "echo 480 270 440",
    about: "A loudspeaker clicks at a brick wall; a microphone and a timer catch the click and its echo, 2d/v apart, so v = 2d/t.",
    line: "echo cx cy width d=50 go=1 lab=1 lit=speaker|mic|wall|scope",
    demo: { line: "echo 480 270 440 d=50", script: [{ set: { go: 1 }, hold: 1.1 }, { set: {}, hold: 2.2 }, { set: { d: 80, lit: "wall" }, hold: "settle" }, { set: { go: 1, lit: "scope" }, hold: 6.5 }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -9, 0), [0, -54, 102], [150, 54, 102], [XS, 0, ZS + 22]], cx, cy, W, H, { azimuth: 64, elevation: 24 }, parent);
      const s = { d: ISO.clamp(ISO.num(o, "d", 50), 25, 85), go: o.go === "1" ? 0 : -1, t: 0 }; s.dT = s.d;
      let lit = o.lit || "", shownD = s.d;
      g.innerHTML = `<g>${floorSvg(P)}</g><g data-name="speaker">${speakerSvg(P)}</g><g data-name="mic">${micSvg(P)}</g><g data-name="scope">${scopeSvg(P)}<g data-part="trace"></g></g><g data-part="tape"></g><g data-part="waves"></g><g data-part="wall" data-name="wall">${wallSvg(P)}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const xw = xwOf(s.d), dist = xw - (XS + 2), key = s.d.toFixed(2);
        w.attr(el.wall, "transform", K.translateAlong(P, [xw, 0, 0]));
        // the tape along the floor from the speaker to the wall, with metre ticks every 10 m
        w.rebuild(el.tape, key, () => {
          const y = 44, out = [S(K.slabOf({ x: XS + 2, y: y - 3, w: dist, d: 6, r: 0.5 }, 0, 0.5, P, 2), { tone: "lo", crease: "none" })], ticks = [];
          for (let m = 10; m < s.d; m += 10) { const x = XS + 2 + (dist * m) / s.d; ticks.push(K.segment([x, y - 3, 0.5], [x, y, 0.5], P)); }
          out.push(L(ticks.join(""), { tone: "mid", free: "end" }));
          return out.join("");
        });
        // the pulse: three fronts 6 apart, out to the wall, then back as if from the speaker's image behind it
        const r = s.go >= 0 ? s.go * SPEED : -1, rq = Math.round(r * 2) / 2;
        w.rebuild(el.waves, `${key} ${rq}`, () => {
          if (r < 0 || r > 2 * dist + 30) return "";
          const out = [];
          for (const k of [0, 7, 14]) {
            const rr = rq - k;
            if (rr <= 4) continue;
            if (rr < dist) out.push(front(P, XS + 2, rr, 1, XS + 2, xw));
            else if (rr < 2 * dist + 12) out.push(`<path d="${front(P, 2 * xw - (XS + 2), rr, -1, XS + 18, xw)}" stroke="#c0392b"/>`);
          }
          return `<g fill="none" stroke="#2b6cc4" stroke-width="1.6" stroke-linecap="round">${out.map((d) => (d.startsWith("<") ? d : `<path d="${d}"/>`)).join("")}</g>`;
        });
        // the scope trace: a line sweeping across 10 divisions = 0.6 s, a blip at 0 and a blip at 2d/v
        const tEcho = (2 * s.d) / V, sweep = s.go >= 0 ? Math.min(1, ((s.go * SPEED) / (2 * dist)) * (tEcho / SWEEP)) : shownD ? 1 : 0;
        w.rebuild(el.trace, `${shownD} ${(Math.round(sweep * 80) / 80)}`, () => {
          const x0 = SC.x0 + 5, x1 = SC.x1 - 17, zc = 17, y = SC.y1 + 0.85, out = [], tE = (2 * shownD) / V;
          const pts = [];
          for (let k = 0; k <= 80 * sweep; k++) {
            const f = k / 80, tt = f * SWEEP, blip = Math.exp(-(((tt - 0.012) / 0.006) ** 2)) * 8 + Math.exp(-(((tt - tE - 0.012) / 0.006) ** 2)) * 4.5 * Math.sin(tt * 900);
            pts.push(K.iso([x0 + (x1 - x0) * f, y, zc + blip], P));
          }
          if (pts.length > 1) out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#7fe08a" stroke-width="1" stroke-linejoin="round"/>`);
          return out.join("");
        });
        w.rebuild(el.words, lab ? `${key}${r > 0 && r < dist ? 1 : r >= dist ? 2 : 0}` : "", () => !lab ? "" :
          ISO.word(K.iso([XS - 6, 0, ZS + 22], P), "loudspeaker", "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([XS + 14, -30, ZS - 2], P), "microphone", "#555", { size: 13, dy: -6 }) +
          ISO.word(K.iso([xw + 8, 0, 104], P), "wall", "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([(XS + xw) / 2, 50, 0], P), `d = ${s.d.toFixed(0)} m`, "#333", { size: 15, dy: 18 }) +
          ISO.word(K.iso([(SC.x0 + SC.x1) / 2, SC.y1, SC.z1], P), "timer", "#555", { size: 13, dy: -6 }) +
          (r > 0 && r < dist ? ISO.word(K.iso([(XS + xw) / 2, -40, ZS + 10], P), "sound goes out", "#2b6cc4", { size: 14 }) : r >= dist && r < 2 * dist + 20 ? ISO.word(K.iso([(XS + xw) / 2, -40, ZS + 10], P), "echo comes back", "#c0392b", { size: 14 }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.d !== undefined) { s.dT = ISO.clamp(+p.d, 25, 85); s.go = -1; shownD = 0; }
        if (p.go !== undefined && +p.go) { s.go = 0; shownD = s.dT; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.d = ISO.follow(s.d, s.dT, dt, 0.5, ISO.still());
        if (s.go >= 0) { s.go = ISO.still() ? 99 : s.go + dt; if (s.go * SPEED > 2 * (xwOf(s.d) - XS) + 40) s.go = -1; }
        draw();
        return s.d !== s.dT || s.go >= 0;
      };
      g.readout = () => {
        const tt = (2 * s.d) / V;
        return `wall d = ${s.d.toFixed(0)} m away · the sound goes there and back, 2d = ${(2 * s.d).toFixed(0)} m · echo heard t = 2d/v = ${tt.toFixed(3)} s later · so v = 2d/t = 343 m/s`;
      };
      if (s.go >= 0) shownD = s.d;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
