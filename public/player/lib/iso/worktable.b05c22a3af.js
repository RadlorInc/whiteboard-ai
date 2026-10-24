// "worktable cx cy k w=60..160 d=40..90 wobble=0|1 lab=0 lit=top|legs|apron" — a PART (PARTS.md): a plain wooden work
// table 75 cm tall, standing on the floor; its origin is the floor point under its middle. A 3 cm top glued up from
// boards about 12 cm wide (edges eased), four 5 × 5 cm legs on felt glides, a 10 cm apron tenoned into the legs (two
// pegs at each joint, a bead line along its bottom) and a triangular corner block screwed across each inside corner.
// wobble=1: the front right leg is 0.8 cm short, so it stands clear of the floor and the table rocks.
// World units: 1 = 1 cm (x along the wall, y into the room, z up).
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const H = 75, TT = 3, LEG = 5, OVER = 4, AT = 2.2, AH = 10, SET = 1, GLIDE = 0.6, E = 0.4;
  const OAK = ISO.tint("#f6e4c4", ["#c99a62", "#d6ab74", "#e0bb88", "#ead0a6"], "#6e4a1e");
  const path = (P, pts, closed) => K.pathOf(pts.map((p) => K.iso(p, P)), closed);
  const wood = (svg) => ISO.tinted(OAK, svg);
  function tableSvg(P, w, d, short) {
    const X = w / 2, Y = d / 2, lx = X - OVER, ly = Y - OVER, ix = lx - LEG, iy = ly - LEG, z0 = H - TT - AH, z1 = H - TT;
    const kp = K.cameraOf(P).k, out = { legs: [], apron: [], top: [] };
    const halo = { x: -lx - 1, y: -ly - 1, w: 2 * lx + 2, d: 2 * ly + 2, r: 2 };
    out.legs.push(`<path class="iso-halo" d="${K.haloOf(halo, -1, 1, P)}"/>`);
    // one leg at (sx, sy): its felt glide, the leg, and two tenon pegs on each face that shows
    const leg = (sx, sy, gap = 0) => {
      const xa = sx > 0 ? ix : -lx, xb = sx > 0 ? lx : -ix, ya = sy > 0 ? iy : -ly, yb = sy > 0 ? ly : -iy, m = [(xa + xb) / 2, (ya + yb) / 2];
      let s = `<path d="${K.ring(m[0], m[1], 2.4, 0, P, 18)}" fill="#3a2a14" fill-opacity="${gap ? 0.1 : 0.28}"/>` + ISO.tinted(ISO.T.rubber, K.solidSvg(K.cylinder(m[0], m[1], 1.9, gap, GLIDE, P, 18), { tone: "lo" }));
      s += wood(ISO.wbox(P, [xa, xb], [ya, yb], [gap + GLIDE, z1], "mid"));
      const pegs = [];
      if (sx > 0) for (const y of [ya + 1.6, yb - 1.6]) pegs.push(K.iso([xb + 0.01, y, z0 + 3], P), K.iso([xb + 0.01, y, z0 + 7], P));
      if (sy > 0) for (const x of [xa + 1.6, xb - 1.6]) pegs.push(K.iso([x, yb + 0.01, z0 + 3], P), K.iso([x, yb + 0.01, z0 + 7], P));
      return s + (pegs.length ? `<g style="--anatomy-dot:#6e4a1e">${D(pegs, { size: Math.max(0.4, 0.4 * kp), tone: "mid" })}</g>` : "");
    };
    // an apron board between two legs: along x at y-face yf, or along y at x-face xf; a bead line near its bottom edge
    const apronX = (yOut, yIn) => wood(ISO.wbox(P, [-ix, ix], [Math.min(yOut, yIn), Math.max(yOut, yIn)], [z0, z1], "mid")) +
      (yOut > 0 ? wood(L(path(P, [[-ix, yOut + 0.01, z0 + 1.2], [ix, yOut + 0.01, z0 + 1.2]]), { tone: "faint" })) : "");
    const apronY = (xOut, xIn) => wood(ISO.wbox(P, [Math.min(xOut, xIn), Math.max(xOut, xIn)], [-iy, iy], [z0, z1], "mid")) +
      (xOut > 0 ? wood(L(path(P, [[xOut + 0.01, -iy, z0 + 1.2], [xOut + 0.01, iy, z0 + 1.2]]), { tone: "faint" })) : "");
    const ax = lx - SET, ay = ly - SET;
    // a corner block across each inside corner: a triangle 9 cm on its legs, 6 cm tall, two screws into each apron
    const block = (sx, sy) => {
      const cx = sx * (ax - AT), cy = sy * (ay - AT), bz0 = z1 - 7, bz1 = z1;
      const tri = [[cx, cy], [cx - sx * 9, cy], [cx, cy - sy * 9]];
      const V = [...tri.map(([x, y]) => [x, y, bz0]), ...tri.map(([x, y]) => [x, y, bz1])];
      return wood(ISO.poly(V, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid"));
    };
    out.legs.push(leg(-1, -1));
    out.apron.push(apronX(-ay, -ay + AT) + apronY(-ax, -ax + AT) + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => block(a, b)).join(""));
    out.legs.push(leg(1, -1));
    out.apron.push(apronY(ax, ax - AT));
    out.legs.push(leg(-1, 1));
    out.apron.push(apronX(ay, ay - AT));
    out.legs.push(leg(1, 1, short ? 0.8 : 0));
    // the top: glued-up boards; each glue line runs end to end on the top and down the cut end
    const top = [wood(K.solidSvg(K.slabOf({ x: -X, y: -Y, w, d, r: E }, z1, TT, P, 3, E), { tone: "mid" }))];
    const n = Math.max(3, Math.round(d / 12)), seams = [], grain = [], ends = [];
    for (let i = 1; i < n; i++) { const y = -Y + (d * i) / n; seams.push(path(P, [[-X + E * 0.5, y, H], [X - E * 0.5, y, H]]), path(P, [[X + 0.01, y, z1], [X + 0.01, y, H]])); }
    for (let i = 0; i < n; i++) {
      const ya = -Y + (d * i) / n, yb = -Y + (d * (i + 1)) / n;
      for (const f of [0.3, 0.7]) { const pts = []; for (let j = 0; j <= 16; j++) { const x = -X + E + (w - 2 * E) * (j / 16); pts.push([x, ya + (yb - ya) * f + 0.5 * Math.sin(x * 0.07 + i * 2), H]); } grain.push(path(P, pts)); }
      // end grain: one ring arc per board on the cut end, from its lower edge up to its top edge
      const pts = []; for (let j = 0; j <= 6; j++) { const z = z1 + (TT * j) / 6; pts.push([X + 0.01, ya + (yb - ya) * (0.35 + 0.25 * ((z - z1) / TT) ** 2), z]); }
      ends.push(path(P, pts));
    }
    top.push(`<path d="${grain.join("")}" fill="none" stroke="#a5804e" stroke-width="0.4" stroke-opacity=".4"/>`, wood(L(seams.join("") + ends.join(""), { tone: "lo" })));
    out.top.push(top.join(""));
    return out;
  }
  ISO.add({
    name: "worktable", title: "Work table (part)", compare: null,
    about: "A plain wooden work table 75 cm tall: glued-up top, apron, four legs on felt glides and corner blocks; wobble=1 makes one front leg 0.8 cm short so it rocks; a part to place in any scene. anchors: top",
    line: "worktable cx cy k w=60..160 d=40..90 wobble=0|1 lab=0 lit=top|legs|apron",
    demo: { line: "worktable 480 425 3 w=120 d=70 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "apron" }, hold: 1.5 }, { set: { wobble: 1, lit: "legs" }, hold: 1.5 }] },
    make([cx = 480, cy = 425, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const w = ISO.clamp(ISO.num(o, "w", 120), 60, 160), d = ISO.clamp(ISO.num(o, "d", 70), 40, 90);
      let short = o.wobble === "1", lit = o.lit || "";
      g.innerHTML = `<g data-part="body"></g><g data-part="words"></g>`;
      const body = g.querySelector('[data-part="body"]'), words = g.querySelector('[data-part="words"]'), wr = ISO.writer();
      g.anchors = { top: [0, 0, H] };
      let parts = [];
      const draw = () => {
        wr.rebuild(body, String(short), () => {
          const s = tableSvg(P, w, d, short);
          // painter's order is mixed between legs and apron, so each piece is its own group under its part's name
          const seq = [["", s.legs[0]], ["legs", s.legs[1]], ["apron", s.apron[0]], ["legs", s.legs[2]], ["apron", s.apron[1]], ["legs", s.legs[3]], ["apron", s.apron[2]], ["legs", s.legs[4]], ["top", s.top[0]]];
          return seq.map(([n, svg]) => (n ? `<g data-name="${n}">${svg}</g>` : svg)).join("");
        });
        if (body._fresh) { body._fresh = false; parts = [...body.querySelectorAll("[data-name]")]; }
        wr.rebuild(words, lab ? String(short) : "", () => !lab ? "" :
          ISO.word(K.iso([w / 2, 0, H], P), "table top", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') +
          (short ? ISO.word(K.iso([w / 2 - OVER, d / 2 - OVER, 0], P), "0.8 cm gap", "#8f2a22", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') : ""));
        wr.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.wobble !== undefined) short = String(p.wobble) === "1"; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = () => false;
      g.readout = () => (short ? "one leg 0.8 cm short · the table rests on three legs and rocks across the diagonal" : `work table · ${Math.round(w)} × ${Math.round(d)} cm top, 75 cm tall · solid wood, corner blocks in each corner`);
      draw();
      return g;
    },
  });
})();
