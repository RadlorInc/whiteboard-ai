// "pool cx cy width at=0..50 lab=1 lit=blocks|ropes|swimmer|ladder" — a 50 m swimming pool, as an architect's model.
// A tiled basin 50 m long and 21 m wide (eight 2.5 m lanes and a 0.5 m margin each side), 2 m deep, sunk in its deck:
// coping round the edge, dark lane lines on the floor that end in a T 2 m before each wall, seven lane ropes of floats
// (red for the last 5 m at each end) hooked to the end walls, eight starting blocks with their lane numbers, a ladder
// down the side wall and the backstroke flags strung across 5 m from each end. One swimmer swims freestyle in lane 4:
// set({ at: 50 }) swims a length (shown five times faster than its 1.8 m/s pace), at: 0 swims back.
// World units: 1 = 10 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 250, Y = 105, DH = 21, WZ = 19, DW = 30;              // half length, half width, deck height, water level, deck width
  const BOARD = { x: -X - DW - 16, y: -Y - DW - 16, w: 2 * (X + DW + 16), d: 2 * (Y + DW + 16), r: 12 };
  const laneY = (n) => -Y + 5 + 25 * (n - 1) + 12.5;                // centre of lane n (1 far … 8 near)
  const ROPES = [1, 2, 3, 4, 5, 6, 7].map((i) => -Y + 5 + 25 * i);
  const SWIM = 4, SY = laneY(SWIM), PACE = 1.8, SHOWN = 5;
  const TILE = ISO.tint("#eef7fb", ["#b4d3e2", "#c3dce8", "#d2e6ef", "#e0eef5"], "#4d7286");
  const STONE = ISO.tint("#f6f4ee", ["#c9c4b6", "#d4d0c3", "#dfdbd0", "#e9e6dd"], "#6b6556");
  const STEEL = ISO.T.steel;
  const poly = (P, pts, z, fill, stroke = "none", w = 0) => `<path d="${K.pathOf(pts.map(([x, y]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;

  // the basin floor with its lane lines, the far and start-end deck (their inner faces are the walls we see into)
  function backSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { h: 7 })];
    out.push(ISO.tinted(TILE, S(K.slabOf({ x: -X, y: -Y, w: 2 * X, d: 2 * Y, r: 0 }, 0, 1, P, 1), { tone: "lo", crease: "none" })));
    // floor tiles: rows every 2.5 m across, ending on the basin's edges
    const rows = [];
    for (let x = -X + 25; x < X; x += 25) rows.push(K.pathOf([K.iso([x, -Y, 1], P), K.iso([x, Y, 1], P)]));
    out.push(`<path d="${rows.join("")}" fill="none" stroke="#9fc3d4" stroke-width=".5"/>`);
    // lane lines: 25 cm wide down each lane's centre, a 1 m T at each end, 2 m short of the wall
    for (let n = 1; n <= 8; n++) {
      const y = laneY(n), a = 1.25, x1 = X - 20;
      out.push(poly(P, [[-x1, y - a], [x1, y - a], [x1, y - 5], [x1 + a * 2, y - 5], [x1 + a * 2, y + 5], [x1, y + 5], [x1, y + a], [-x1, y + a], [-x1, y + 5], [-x1 - a * 2, y + 5], [-x1 - a * 2, y - 5], [-x1, y - 5]], 1.02, "#27466e", "#1b3352", 0.4));
    }
    out.push(ISO.tinted(STONE, ISO.wbox(P, [-X - DW, X + DW], [-Y - DW, -Y], [0, DH], "mid")));
    out.push(ISO.tinted(STONE, ISO.wbox(P, [-X - DW, -X], [-Y, Y], [0, DH], "mid")));
    // targets on the start wall: a dark cross at each lane's centre, under water, lane by lane
    for (let n = 1; n <= 8; n++) { const y = laneY(n); out.push(`<path d="${K.pathOf([[-X + 0.05, y - 1.25, 6], [-X + 0.05, y + 1.25, 6], [-X + 0.05, y + 1.25, 16], [-X + 0.05, y - 1.25, 16]].map((p) => K.iso(p, P)), true)}" fill="#27466e"/>`); }
    // the ladder down the far side wall: two rails curving over the coping, five treads
    for (const x of [150, 162]) {
      const pts = [[x, -Y + 0.8, 6], [x, -Y + 3, 6], [x, -Y + 3, DH + 4], [x, -Y + 1, DH + 7], [x, -Y - 4, DH + 7], [x, -Y - 6, DH + 1]];
      const d = K.pathOf(pts.map((p) => K.iso(p, P)));
      out.push(`<g data-name="ladder"><path d="${d}" fill="none" stroke="#3c3f45" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#d9dadd" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>`);
    }
    for (let z = 8; z <= 20; z += 3) out.push(ISO.tinted(STEEL, ISO.wbox(P, [150, 162], [-Y, -Y + 3.4], [z, z + 0.6], "mid")));
    out.push(ISO.tinted(STEEL, S(K.cylinder(150, -Y - 6, 1.6, DH, 1, P, 14), { tone: "mid" }) + S(K.cylinder(162, -Y - 6, 1.6, DH, 1, P, 14), { tone: "mid" })));
    return out.join("");
  }
  // the water: a pale blue skin at 1.9 m with a few ripple rings, and the coping on the far and start edges
  function waterSvg(P) {
    const out = [poly(P, [[-X, -Y], [X, -Y], [X, Y], [-X, Y]], WZ, "#7cc4ec", "#3d86b8", 0.6).replace('fill="#7cc4ec"', 'fill="#7cc4ec" fill-opacity=".42"')];
    out.push(ISO.tinted(STONE, ISO.wbox(P, [-X - 4, X + 4], [-Y - 4, -Y], [DH, DH + 1.2], "hi")));
    out.push(ISO.tinted(STONE, ISO.wbox(P, [-X - 4, -X], [-Y, Y], [DH, DH + 1.2], "hi")));
    return out.join("");
  }
  // a lane rope: the cable from hook to hook and a float every metre, red in the last 5 m at each end
  function ropeSvg(P, y) {
    const k = K.cameraOf(P).k, out = [], a = K.iso([-X, y, WZ + 0.6], P), b = K.iso([X, y, WZ + 0.6], P);
    out.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#2a2d31" stroke-width=".6"/>`);
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [-X, -X + 1.5], [y - 1, y + 1], [WZ, WZ + 2], "mid")));
    const red = [], blue = [], white = [];
    for (let i = 0, x = -X + 5; x <= X - 5; i++, x += 10) (Math.abs(x) > X - 50 ? red : i % 2 ? blue : white).push(K.iso([x, y, WZ + 0.6], P));
    const dots = (pts, fill) => pts.map(([px, py]) => `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(1.7 * k).toFixed(2)}" ry="${(1.25 * k).toFixed(2)}" fill="${fill}" stroke="#2a2d31" stroke-width=".45"/>`).join("");
    out.push(dots(red, "#d6402f"), dots(blue, "#2f6fd0"), dots(white, "#f5f7fa"));
    return `<g data-name="ropes">${out.join("")}</g>`;
  }
  // the backstroke flags: a line between two posts 5 m in from each end, pennants hanging from it
  function flagsSvg(P, x, near) {
    const out = [], top = DH + 18;
    const post = (y) => ISO.tinted(STEEL, S(K.cylinder(x, y, 1.6, DH, 1.2, P, 14), { tone: "mid" }) + S(K.cylinder(x, y, 0.7, DH + 1.2, 17.6, P, 10), { tone: "hi" }));
    if (!near) {
      out.push(post(-Y - 15));
      const a = K.iso([x, -Y - 15, top], P), b = K.iso([x, Y + 15, top], P);
      out.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#3c3f45" stroke-width=".6"/>`);
      for (let y = -Y - 9; y < Y + 12; y += 6) out.push(`<path d="${K.pathOf([[x, y, top], [x, y + 4, top], [x, y + 2, top - 4]].map((p) => K.iso(p, P)), true)}" fill="${(y / 6) % 2 ? "#d6402f" : "#f5f7fa"}" stroke="#3c3f45" stroke-width=".4"/>`);
    } else out.push(post(Y + 15));
    return out.join("");
  }
  // the right end and the near side of the deck, with their coping and paving joints, drawn over the water's edges
  function frontSvg(P) {
    const out = [ISO.tinted(STONE, ISO.wbox(P, [X, X + DW], [-Y, Y], [0, DH], "mid")), ISO.tinted(STONE, ISO.wbox(P, [-X - DW, X + DW], [Y, Y + DW], [0, DH], "mid"))];
    out.push(ISO.tinted(STONE, ISO.wbox(P, [X, X + 4], [-Y, Y], [DH, DH + 1.2], "hi")), ISO.tinted(STONE, ISO.wbox(P, [-X - 4, X + 4], [Y, Y + 4], [DH, DH + 1.2], "hi")));
    const j = [];
    for (let x = -X + 30; x < X; x += 40) j.push(K.pathOf([K.iso([x, Y + 4, DH], P), K.iso([x, Y + DW, DH], P)]));
    out.push(L(j.join(""), { tone: "faint" }));
    return out.join("");
  }
  // a starting block: a pedestal, the sloped top with its grip, the number plate facing the pool
  function blockSvg(P, n) {
    const y = laneY(n), x0 = -X - 20, x1 = -X - 2, out = [];
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [x0 + 4, x1 - 4], [y - 3, y + 3], [DH, DH + 5], "mid")));
    out.push(ISO.tinted(ISO.T.paint, ISO.poly([[x0, y - 3.5, DH + 5], [x1, y - 3.5, DH + 5], [x1, y + 3.5, DH + 5], [x0, y + 3.5, DH + 5], [x0, y - 3.5, DH + 7.4], [x1, y - 3.5, DH + 6.2], [x1, y + 3.5, DH + 6.2], [x0, y + 3.5, DH + 7.4]], ISO.BOX_F, P, "mid")));
    // backstroke grip bar across the front on two short posts (they stand on the sloped top, an ISO.poly the audit
    // does not record, so audit.mjs lists these three boxes as loose)
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [x1 - 1, x1], [y - 3, y - 2.2], [DH + 6.2, DH + 8.6], "mid") + ISO.wbox(P, [x1 - 1, x1], [y + 2.2, y + 3], [DH + 6.2, DH + 8.6], "mid") + ISO.wbox(P, [x1 - 1.2, x1 + 0.2], [y - 3.2, y + 3.2], [DH + 8.6, DH + 9.4], "hi")));
    out.push(`<g transform="${K.sideMatrix([x1 - 3.99, y], DH + 4.6, P, "right")}"><rect x="-2.2" y="0" width="4.4" height="3.8" fill="#fdfdfb" stroke="#3c3f45" stroke-width=".3"/><text x="0" y="3.2" text-anchor="middle" fill="#1b3352" style="font:800 3.4px 'Helvetica Neue',Arial,sans-serif">${n}</text></g>`);
    return out.join("");
  }
  // the swimmer at metre m heading +x (dir 1) or -x: body under the surface, cap, arms in turn, a white wake
  function swimmerSvg(P, m, dir, ph) {
    const k = K.cameraOf(P).k, x = -X + m * 10, at = (u, v, z = WZ + 0.2) => K.iso([x + u * dir, SY + v, z], P), out = [];
    const body = [[2, -2.2], [-4, -2.4], [-11, -1.6], [-17, -1.2], [-17, 1.2], [-11, 1.6], [-4, 2.4], [2, 2.2]];
    // the wake: two arms of a V behind, fading
    for (const s of [-1, 1]) out.push(`<path d="${K.pathOf([at(-18, s * 2), at(-30, s * 6)])}" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`);
    out.push(`<path d="${K.pathOf(body.map(([u, v]) => at(u, v, WZ - 0.6)), true)}" fill="#294a74" stroke="#1b3352" stroke-width=".6"/>`);
    // kicking feet: two short strokes beating up and down
    for (const s of [-1, 1]) { const f = Math.sin(ph * 3 + (s > 0 ? Math.PI : 0)); out.push(`<path d="${K.pathOf([at(-17, s * 0.8, WZ - 0.4), at(-21, s * 1, WZ + f * 0.8)])}" stroke="#e2b48c" stroke-width="${(1.3 * k).toFixed(2)}" stroke-linecap="round"/>`); }
    // arms: one reaching forward above the water while the other pulls back under it
    const reach = (s, q) => { const c = Math.cos(q), u = -4 + c * 8, z = WZ + Math.max(0, Math.sin(q)) * 4; return K.pathOf([at(-1.5, s * 2.2, WZ + 0.3), at(u, s * 3.2, z), at(u + c * 3, s * 3, z - 0.5)]); };
    for (const [s, q] of [[-1, ph], [1, ph + Math.PI]]) out.push(`<path d="${reach(s, q)}" fill="none" stroke="#e2b48c" stroke-width="${(1.3 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    const c = at(3.4, 0, WZ + 1.4);
    out.push(`<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(2.4 * k).toFixed(2)}" ry="${(1.9 * k).toFixed(2)}" fill="#f08a1a" stroke="#8a4a08" stroke-width=".7"/>`);
    // splash rings at the hand going in
    const h = at(4 + Math.cos(ph) * 2, (Math.sin(ph) > 0 ? -1 : 1) * 3.2);
    out.push(`<ellipse cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" rx="${(2.6 * k).toFixed(2)}" ry="${(1.3 * k).toFixed(2)}" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".8"/>`);
    return out.join("");
  }

  ISO.add({
    name: "pool", title: "Swimming pool", compare: "pool 480 270 540",
    about: "A model of a 50 m pool: eight 2.5 m lanes with lane lines, lane ropes, starting blocks and a ladder; a swimmer swims a length of lane 4.",
    line: "pool cx cy width at=0..50 lab=1 lit=blocks|ropes|swimmer|ladder",
    demo: { line: "pool 480 275 560", script: [{ set: {}, hold: 1 }, { set: { at: 50 }, hold: "settle" }, { set: { at: 0 }, hold: "settle" }] },
    make([cx, cy, size = 540], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.2, H = size * 0.86;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -11, 0), [0, -Y - 15, DH + 20]], cx, cy, W, H, { azimuth: 38, elevation: 36 }, parent);
      const far = ROPES.filter((y) => y < SY), near = ROPES.filter((y) => y > SY);
      g.innerHTML = `<g>${backSvg(P)}</g><g>${waterSvg(P)}</g><g data-k="far">${far.map((y) => ropeSvg(P, y)).join("")}</g><g data-name="swimmer"></g>` +
        `<g data-k="near">${near.map((y) => ropeSvg(P, y)).join("")}${flagsSvg(P, -X + 50, false)}${flagsSvg(P, X - 50, false)}</g>` +
        `<g>${frontSvg(P)}${flagsSvg(P, -X + 50, true)}${flagsSvg(P, X - 50, true)}</g><g data-name="blocks">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => blockSvg(P, n)).join("")}</g><g data-part="words"></g>`;
      const q = (s) => g.querySelector(s), el = { swimmer: q('[data-name="swimmer"]'), words: q('[data-part="words"]'), blocks: q('[data-name="blocks"]') };
      const w = ISO.writer(), start = ISO.clamp(ISO.num(o, "at", 0), 0, 50);
      const s = { m: start, want: start, dir: 1, ph: 0, clock: 0 };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.swimmer, `${s.m.toFixed(2)} ${s.dir} ${s.ph.toFixed(1)}`, () => swimmerSvg(P, s.m, s.dir, s.ph));
        w.rebuild(el.words, lab ? "1" : "", () => !lab ? "" : [
          ISO.word(K.iso([0, Y + DW, 0], P), "50 m", "#444", { size: 15, dy: 22 }),
          ISO.word(K.iso([X + DW, Y - 20, 0], P), "lanes 2.5 m wide", "#444", { size: 13, anchor: "start", dy: 14 }),
          ISO.word(K.iso([-X - DW, laneY(1), DH + 8], P), "starting blocks", "#444", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso([156, -Y - 6, DH + 8], P), "ladder", "#444", { size: 13, dy: -6 }),
          ISO.word(K.iso([X - 110, ROPES[6], WZ], P), "lane rope", "#1f4f8f", { size: 13, anchor: "end", dy: 4 })].join(""));
        const groups = { blocks: [el.blocks], ropes: [...g.querySelectorAll('[data-name="ropes"]')], swimmer: [el.swimmer], ladder: [...g.querySelectorAll('[data-name="ladder"]')] };
        w.light(Object.values(groups).flat(), groups[lit] || []);
      };
      g.set = (p) => { if (p.at !== undefined) s.want = ISO.clamp(+p.at, 0, 50); if (p.lit !== undefined) lit = p.lit; };
      // steady freestyle pace (1.8 m/s, shown 5× faster), easing in from the push-off and gliding into the wall
      g.update = (dt) => {
        const calm = ISO.still(), gap = s.want - s.m;
        if (gap === 0) { draw(); return false; }
        s.dir = Math.sign(gap);
        const v = PACE * SHOWN * Math.min(1, 0.25 + Math.abs(gap) / 4);
        const step = calm ? Math.abs(gap) : Math.min(Math.abs(gap), v * dt);
        s.m += s.dir * step; s.clock += step / PACE; s.ph += dt * 7;
        if (Math.abs(s.want - s.m) < 1e-3) s.m = s.want;
        draw();
        return s.m !== s.want;
      };
      g.readout = () => s.clock === 0 ? "50 m × 21 m · eight lanes, each 2.5 m wide · 2 m deep · lane lines end in a T 2 m from the wall"
        : `lane 4 · ${s.m.toFixed(1)} m from the start wall · swim time ${s.clock.toFixed(1)} s at 1.8 m/s (a length in about 28 s)`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
