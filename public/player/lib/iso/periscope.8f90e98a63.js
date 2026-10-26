// "periscope cx cy height up=0 lab=1 lit=…" — a telescopic box periscope, its near wall cut away, behind a brick wall.
// Two plane mirrors sit at 45°: light from the tree enters the top window, the top mirror turns it 90° down the tube,
// the bottom mirror turns it 90° again, out of the eyepiece to a model eye. The eye sees over the wall only when the
// top window is above the wall's top; below that the bricks block the light. set({ up: cm }) slides the upper tube up.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -112, y: -48, w: 236, d: 96, r: 7 }, WALL = { x0: 0, x1: 16, y0: -42, y1: 42, h: 80 }, EYE = [-90, 0, 26], LOW = 26, RAY = "#e09a00";
  const TREE = [84, 6], UPMAX = 50;
  const winOf = (up) => 62 + up;                                    // centre height of the top window (and of the top mirror)
  const wb = (P, x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);
  const ray = (P, pts, arrows = true) => {
    const s = pts.map((p) => K.iso(p, P));
    let d = K.pathOf(s);
    if (arrows) for (let k = 0; k < s.length - 1; k++) {
      const A = s[k], B = s[k + 1], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      if (Math.hypot(B[0] - A[0], B[1] - A[1]) < 20) continue;
      d += `M${m[0] - 5 * Math.cos(ang + 0.5)} ${m[1] - 5 * Math.sin(ang + 0.5)}L${m[0]} ${m[1]}L${m[0] - 5 * Math.cos(ang - 0.5)} ${m[1] - 5 * Math.sin(ang - 0.5)}`;
    }
    return `<path d="${d}" fill="none" stroke="${RAY}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  // A mirror at 45° in the x–z plane: glass face toward `face` (+1: faces +x and down, −1: faces −x and up), dark back.
  const mirror = (P, cx, cz, face) => {
    const n = [face / Math.SQRT2, 0, -face / Math.SQRT2], u = [1 / Math.SQRT2, 0, 1 / Math.SQRT2];
    const at = (a, b, y) => [cx + u[0] * a + n[0] * b, y, cz + u[2] * a + n[2] * b];
    return ISO.box(at, P, [-11, 11], [-1.6, -0.6], [-9.6, 9.6], "lo") + ISO.tinted(ISO.T.glass, ISO.box(at, P, [-11, 11], [-0.6, 0.4], [-9.6, 9.6], "hi", true));
  };

  function backSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 30, y: 26, w: 40, d: 14, r: 1.2 })];
    // Model eye on a post, looking into the eyepiece.
    out.push(`<g data-name="eye">`, S(K.cylinder(EYE[0] - 2, 0, 6, 0, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(EYE[0] - 2, 0, 1.6, 2.4, EYE[2] - 8.4, P, 16), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.paint, S(G.sphereOf(EYE, 6.5, P), { tone: "hi" })));
    const eF = G.frameOf(EYE, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.blue, S(G.disc(5.2, 6.2, 3.4, eF, P), { tone: "hi" })), ISO.tinted(ISO.T.plastic, S(G.disc(6.2, 6.5, 1.5, eF, P), { tone: "hi" })), `</g>`);
    // Stand: a rod behind the tube with a boss and an arm to the tube's back, and a block the tube stands on.
    out.push(S(K.cylinder(-50, -34, 6, 0, 2.4, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(-50, -34, 2, 2.4, 56, P, 16), { tone: "mid", crease: "none" }));
    out.push(wb(P, [-54, -46], [-38, -30], [44, 54]), wb(P, [-52, -48], [-30, -12], [46, 52]));
    out.push(wb(P, [-66, -34], [-16, 16], [0, 10], "mid"));
    // Lower tube, the parts behind the light: back wall, the eyepiece wall with its window cut, the cut lip.
    out.push(`<g data-name="tube">`, wb(P, [-62, -38], [-12, -10], [10, 70]), wb(P, [-62, -60], [-10, 12], [10, 16]), wb(P, [-62, -60], [-10, 12], [36, 70]), `</g>`);
    out.push(`<g data-name="mirrors">${mirror(P, -50, LOW, -1)}</g>`);
    return out.join("");
  }
  function frontSvg(P) {
    // Lower tube's near side: the +x wall and the two strips left of the cut-away near wall.
    return `<g data-name="tube">${wb(P, [-40, -38], [-10, 12], [10, 70])}${wb(P, [-60, -40], [10, 12], [10, 14])}${wb(P, [-60, -40], [10, 12], [66, 70])}</g>`;
  }
  function wallSvg(P, lab) {
    const { x0, x1, y0, y1, h } = WALL, out = [ISO.tinted(ISO.T.red, wb(P, [x0, x1], [y0, y1], [0, h], "mid"))];
    // Brick courses run edge to edge round both visible faces; the head joints stand between two courses.
    const course = [], head = [];
    for (let z = 8; z < h; z += 8) course.push(K.pathOf([[x0, y1, z], [x1, y1, z], [x1, y0, z]].map((p) => K.iso(p, P))));
    for (let k = 0, z = 0; z < h; k++, z += 8) {
      for (let y = y0 + (k % 2 ? 11 : 0) + 22; y < y1 - 2; y += 22) head.push(K.segment([x1, y, z], [x1, y, Math.min(h, z + 8)], P));
      head.push(K.segment([(x0 + x1) / 2 + (k % 2 ? 4 : -4), y1, z], [(x0 + x1) / 2 + (k % 2 ? 4 : -4), y1, Math.min(h, z + 8)], P));
    }
    out.push(ISO.tinted(ISO.T.red, L(course.join(""), { tone: "lo" }) + L(head.join(""), { tone: "lo" })));
    return out.join("");
  }
  function treeSvg(P) {
    const [x, y] = TREE;
    return `<g data-name="tree">${ISO.tinted(ISO.T.wood, S(K.cylinder(x, y, 5, 0, 82, P, 24), { tone: "mid", crease: "none" }))}` +
      ISO.tinted(ISO.T.green, S(G.sphereOf([x + 6, y - 6, 88], 16, P), { tone: "hi" }) + S(G.sphereOf([x - 2, y, 100], 22, P), { tone: "hi" }) + S(G.sphereOf([x + 10, y + 8, 110], 14, P), { tone: "hi" })) + `</g>`;
  }
  // The sliding upper tube with its top mirror, the light inside, and the light outside (split at the wall's far face).
  function upperSvg(P, up) {
    const z0 = 14 + up, z1 = 74 + up, zw = winOf(up), out = [ISO.tinted(ISO.T.paint, wb(P, [-60, -40], [-10, -8], [z0, z1]) + wb(P, [-60, -58], [-8, 10], [z0, z1]))];
    out.push(`<g data-name="mirrors">${mirror(P, -50, zw, 1)}</g>`);
    return out.join("");
  }
  const upperFront = (P, up) => { const z0 = 14 + up, z1 = 74 + up, zw = winOf(up); return ISO.tinted(ISO.T.paint, wb(P, [-42, -40], [-8, 10], [z0, zw - 10]) + wb(P, [-42, -40], [-8, 10], [zw + 10, z1]) + wb(P, [-60, -40], [-10, 10], [z1, z1 + 2]) + wb(P, [-58, -42], [8, 10], [z1 - 4, z1])); };

  ISO.add({
    name: "periscope", title: "Periscope", compare: "periscope 480 280 320",
    about: "A telescopic periscope cut open behind a brick wall: two 45° mirrors turn the light twice; raise it and the eye sees the tree over the wall.",
    line: "periscope cx cy height up=0 lab=1 lit=mirrors|tube|eye|tree",
    demo: { line: "periscope 480 280 320", script: [{ set: { up: 0 }, hold: 1.2 }, { set: { up: 36 }, hold: "settle" }, { set: { up: 14 }, hold: "settle" }, { set: { up: 44 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.35;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-50, -10, 76 + UPMAX], [TREE[0], 0, 124]], cx, cy, W, H, { azimuth: 62, elevation: 16 }, parent);
      const s = { up: ISO.clamp(ISO.num(o, "up", 0), 0, UPMAX) }; s.upT = s.up;
      g.innerHTML = `<g>${backSvg(P, lab)}</g><g data-part="upper" data-name="tube"></g><g data-part="inner"></g><g data-part="upfront" data-name="tube"></g><g>${frontSvg(P)}</g><g data-part="rayA"></g><g>${wallSvg(P, lab)}</g><g data-part="rayB"></g><g>${treeSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "mirrors";
      const clear = () => winOf(s.up) > WALL.h + 1;
      const draw = () => {
        const key = s.up.toFixed(2), zw = winOf(s.up), ok = clear(), treeX = TREE[0] - (zw > 70 ? Math.sqrt(Math.max(0, 22 * 22 - (zw - 100) ** 2)) - 2 : 5);
        w.rebuild(el.upper, key, () => upperSvg(P, s.up));
        w.rebuild(el.upfront, key, () => upperFront(P, s.up));
        w.rebuild(el.inner, key + ok, () => (ok ? ray(P, [[-40, 0, zw], [-50, 0, zw], [-50, 0, LOW], [EYE[0] + 6.5, 0, LOW]]) : ""));
        w.rebuild(el.rayA, key + ok, () => (ok ? ray(P, [[WALL.x0, 0, zw], [-40, 0, zw]], false) : ""));
        w.rebuild(el.rayB, key + ok, () => ray(P, [[treeX, 0, zw], [ok ? WALL.x0 : WALL.x1, 0, zw]]) + (ok ? "" : D([K.iso([WALL.x1, 0, zw], P)], { size: 1.4, tone: "hi" })));
        w.rebuild(el.words, lab ? key + ok : "", () => !lab ? "" :
          ISO.word(K.iso([-38, 12, zw + 2], P), "mirror at 45°", "#555", { size: 13, anchor: "start", dy: -14 }) + ISO.word(K.iso([-38, 12, LOW], P), "mirror at 45°", "#555", { size: 13, anchor: "start", dy: 8 }) +
          ISO.word(K.iso([EYE[0], 0, EYE[2] + 7], P), "eye", "#555", { size: 14, dy: -6 }) + ISO.word(K.iso([WALL.x1, WALL.y1, 0], P), "wall", "#8f2a22", { size: 14, dy: 18 }) +
          (ok ? "" : ISO.word(K.iso([WALL.x1, 0, zw], P), "blocked", "#c0392b", { size: 13, anchor: "start", dy: -8 })));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.up !== undefined) s.upT = ISO.clamp(+p.up, 0, UPMAX); if (p.lit) lit = p.lit; };
      g.update = (dt) => { s.up = ISO.follow(s.up, s.upT, dt, 0.6, ISO.still()); draw(); return s.up !== s.upT; };
      g.readout = () => {
        const zw = winOf(s.up);
        return clear() ? `top window ${(zw - WALL.h).toFixed(0)} cm above the wall · light turned 90° by each 45° mirror · the eye sees the tree` : `top window ${(WALL.h - zw).toFixed(0)} cm below the top of the wall · the bricks block the light`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
