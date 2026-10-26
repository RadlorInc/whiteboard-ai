// "ball cx cy size k=football|basketball|cricket|tennis|volleyball h=cm drop=0|1 lab=1 lit=ball|rig|scale" — a ball
// held in a drop rig over its own playing surface. Each ball has its true size and panels: a size-5 football (22 cm,
// 12 black pentagons and 20 white hexagons), a size-7 basketball (24 cm, its eight-panel seams), a cricket ball
// (7.2 cm, red leather and a raised stitched seam), a tennis ball (6.7 cm, felt and its curving seam) and a volleyball
// (21 cm, 18 panels in six groups of three). The rig is a weighted stand with a centimetre scale and an arm whose two
// jaws hold the ball h cm up (default 2 ball widths). set({ drop: 1 }): the jaws open, the ball falls under gravity
// (9.81 m/s², in real time), squashes for a moment on the ground and bounces back up, each bounce e² as high as the
// last (e: the ball's coefficient of restitution on that surface). drop: 0 puts it back in the jaws. 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const GRAV = 9810;
  // r: radius mm, e: restitution, m: mass g, what the rule book says about its bounce
  const KINDS = {
    football: { r: 110, e: 0.85, m: "410–450 g", rule: "size 5 (FIFA: from 2 m it must bounce 1.2–1.65 m)", base: ISO.tint("#fbfbf8", ["#b9bcc0", "#cdd0d3", "#dfe1e3", "#eeeff0"], "#3a3f45"), ground: ["#4f9a33", "#8fd16c", "#7cc35a", "#24561c"], name: "grass" },
    basketball: { r: 120, e: 0.84, m: "567–650 g", rule: "size 7 (from 1.8 m it must bounce 1.2–1.4 m)", base: ISO.tint("#f9b06a", ["#b4561a", "#c86624", "#d97832", "#e88c45"], "#5a2a08"), ground: ["#b07a3a", "#e9c690", "#e2b97c", "#7a5222"], name: "court floor" },
    cricket: { r: 36, e: 0.55, m: "156–163 g", rule: "men's ball, 22.4–22.9 cm round", base: ISO.tint("#e8766a", ["#7e1a12", "#931f16", "#a8281d", "#bd3627"], "#4a0c06"), ground: ["#a88a5a", "#e8d5a8", "#dcc595", "#6e5a30"], name: "pitch" },
    tennis: { r: 33.5, e: 0.75, m: "56–59.4 g", rule: "(ITF: from 254 cm it must bounce 135–147 cm)", base: ISO.tint("#eaf27a", ["#a9b52c", "#bac63c", "#cad64e", "#d9e463"], "#5a6410"), ground: ["#2f6a9c", "#7fb2dd", "#5f97cf", "#173a66"], name: "hard court" },
    volleyball: { r: 105, e: 0.75, m: "260–280 g", rule: "(FIVB: 65–67 cm round)", base: ISO.tint("#fdf8e6", ["#c9c2a8", "#d8d2ba", "#e6e1cc", "#f2eedf"], "#4a4430"), ground: ["#c9a86a", "#f2e2b8", "#ead6a2", "#7a6230"], name: "sand" },
  };
  const unit = (a) => G.unit3(a);
  const slerp = (a, b, t) => unit(G.lerp3(a, b, t));
  // On the ball: a unit direction n becomes a world point; one facing away is pushed to the rim (for filled patches).
  const onBall = (c, R, V) => (n, rim = true) => { let m = n; const d = G.dot3(n, V); if (d < 0 && rim) m = unit(G.sub3(n, G.mul3(V, d))); return G.add3(c, G.mul3(m, R * 1.002)); };
  const patch = (P, c, R, V, ring, fill) => {                      // a filled spherical polygon (unit vectors, in order)
    const pts = []; ring.forEach((a, i) => { const b = ring[(i + 1) % ring.length]; for (let k = 0; k < 6; k++) pts.push(slerp(a, b, k / 6)); });
    if (pts.every((n) => G.dot3(n, V) < 0)) return "";
    const at = onBall(c, R, V);
    return `<path d="${K.pathOf(pts.map((n) => K.iso(at(n), P)), true)}" fill="${fill}" style="mix-blend-mode:multiply"/>`;
  };
  const seam = (P, c, R, V, line) => {                              // a polyline on the ball, cut where it goes round the back
    const at = onBall(c, R, V), runs = [], cur = [];
    for (const n of line) { if (G.dot3(n, V) > 0.01) cur.push(K.iso(at(n, false), P)); else if (cur.length) { runs.push(K.pathOf(cur)); cur.length = 0; } }
    if (cur.length > 1) runs.push(K.pathOf(cur));
    return runs.join("");
  };
  const arc = (a, b, n = 8) => Array.from({ length: n + 1 }, (_, i) => slerp(a, b, i / n));
  const circle = (F, off, n = 72) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI * 2, r = Math.sqrt(1 - off * off); return unit(G.add3(G.add3(G.mul3(F[0], Math.cos(t) * r), G.mul3(F[1], Math.sin(t) * r)), G.mul3(F[2], off))); });
  // a turned frame for the ball's own markings (three unit axes), so the seams aren't lined up with the camera
  const TILT = (() => { const a = 0.5, b = 0.35; const x = [Math.cos(a), Math.sin(a), 0], y0 = [-Math.sin(a), Math.cos(a), 0]; const y = G.add3(G.mul3(y0, Math.cos(b)), G.mul3([0, 0, 1], Math.sin(b))); return [x, y, G.cross3(x, y)]; })();
  const loc = (v) => unit(G.add3(G.add3(G.mul3(TILT[0], v[0]), G.mul3(TILT[1], v[1])), G.mul3(TILT[2], v[2])));

  function markings(P, kind, c, R) {
    const V = G.viewOf(P), k = K.cameraOf(P).k, out = [];
    const ink = (d, color, w, extra = "") => (d ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${(w * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` : "");
    if (kind === "football") {
      const f = (1 + Math.sqrt(5)) / 2, ico = [];
      for (const [a, b] of [[1, f], [1, -f], [-1, f], [-1, -f]]) ico.push([0, a, b], [a, b, 0], [b, 0, a]);
      const edges = []; ico.forEach((a, i) => ico.forEach((b, j) => { if (j > i && Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 2) < 1e-6) edges.push([i, j]); }));
      const third = (i, j, t) => loc(unit(G.lerp3(ico[i], ico[j], t)));
      let hex = "";
      ico.forEach((a, i) => {
        const nb = edges.filter((e) => e.includes(i)).map((e) => (e[0] === i ? e[1] : e[0]));
        const ai = loc(unit(a)), u = unit(G.cross3(ai, Math.abs(ai[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), w = G.cross3(ai, u);
        const ring = nb.map((j) => third(i, j, 1 / 3)).sort((p, q) => Math.atan2(G.dot3(p, w), G.dot3(p, u)) - Math.atan2(G.dot3(q, w), G.dot3(q, u)));
        out.push(patch(P, c, R, V, ring, "#2f3a45"));
      });
      for (const [i, j] of edges) hex += seam(P, c, R, V, arc(third(i, j, 1 / 3), third(i, j, 2 / 3)));
      out.push(ink(hex, "#5d646c", 0.9));
    } else if (kind === "basketball") {
      const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], T = (F) => F.map(loc);
      const d = seam(P, c, R, V, circle(T([X, Y, Z]), 0)) + seam(P, c, R, V, circle(T([Y, Z, X]), 0)) + seam(P, c, R, V, circle(T([Z, X, Y]), 0.68)) + seam(P, c, R, V, circle(T([Z, X, Y]), -0.68));
      out.push(ink(d, "#2a160a", 2.6));
      // the pebbled grip: tiny bumps over the panels
      const dots = [];
      for (let i = 0; i < 260; i++) { const z = 1 - (2 * (i + 0.5)) / 260, r = Math.sqrt(1 - z * z), a = i * 2.399963, n = [Math.cos(a) * r, Math.sin(a) * r, z]; if (G.dot3(n, V) > 0.25) dots.push(K.iso(G.add3(c, G.mul3(n, R)), P)); }
      out.push(`<g fill="#a8501a" opacity=".55">${dots.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.9 * k).toFixed(2)}"/>`).join("")}</g>`);
    } else if (kind === "cricket") {
      const F = [loc([1, 0, 0]), loc([0, 0, 1]), loc([0, 1, 0])];
      out.push(ink(seam(P, c, R, V, circle(F, 0, 96)), "#5a0e08", 2.4));
      // six rows of stitches, three each side of the seam: short marks across it
      let st = "";
      for (const side of [-1, 1]) for (const off of [0.07, 0.1, 0.13]) for (let i = 0; i < 64; i++) {
        const t = (i / 64) * Math.PI * 2, a = [Math.cos(t), Math.sin(t)];
        const p = (o, dt) => unit(G.add3(G.add3(G.mul3(F[0], Math.cos(t + dt)), G.mul3(F[1], Math.sin(t + dt))), G.mul3(F[2], side * o)));
        st += seam(P, c, R, V, [p(off - 0.012, -0.03), p(off + 0.012, 0.03)]);
      }
      out.push(ink(st, "#f4ead8", 0.7));
      // the quarter seam across one half, a fine line
      out.push(ink(seam(P, c, R, V, circle([F[2], F[1], F[0]], 0, 96).slice(0, 49)), "#6e140a", 0.6));
    } else if (kind === "tennis") {
      const a = 0.69, b = 1 - a, line = Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * Math.PI * 2; return loc([a * Math.cos(t) + b * Math.cos(3 * t), a * Math.sin(t) - b * Math.sin(3 * t), 2 * Math.sqrt(a * b) * Math.sin(2 * t)]); });
      const d = seam(P, c, R, V, line);
      out.push(ink(d, "#c9d06a", 3.4), ink(d, "#ffffff", 2.2));
    } else if (kind === "volleyball") {
      const colors = ["#7fb7ea", "#ffd84a", "#fdf8e6"], axes = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
      let d = "";
      axes.forEach((ax, fi) => [1, -1].forEach((sg) => {
        const pt = (u, v) => { const p = [0, 0, 0]; p[ax[0]] = sg; p[ax[1]] = u; p[ax[2]] = v; return loc(unit(p)); };
        for (let s = 0; s < 3; s++) {
          const u0 = -1 + (2 * s) / 3, u1 = u0 + 2 / 3, ring = [];
          for (let i = 0; i <= 6; i++) ring.push(pt(u0 + ((u1 - u0) * i) / 6, -1));
          for (let i = 0; i <= 6; i++) ring.push(pt(u1, -1 + (2 * i) / 6));
          for (let i = 0; i <= 6; i++) ring.push(pt(u1 - ((u1 - u0) * i) / 6, 1));
          for (let i = 0; i <= 6; i++) ring.push(pt(u0, 1 - (2 * i) / 6));
          out.push(patch(P, c, R, V, ring, colors[(fi + s + (sg > 0 ? 0 : 1)) % 3]));
          d += seam(P, c, R, V, ring.concat([ring[0]]));
        }
      }));
      out.push(ink(d, "#3a3f45", 0.9));
    }
    return out.join("");
  }

  ISO.add({
    name: "ball", title: "Sports ball", compare: "ball 480 270 200 k=football",
    about: "A sports ball of its true size and panels, held in a drop rig: the jaws open and it falls, squashes on the ground and bounces, each bounce e² as high as the last.",
    line: "ball cx cy size k=football|basketball|cricket|tennis|volleyball h=cm drop=0|1 lab=1 lit=ball|rig|scale",
    demo: { line: "ball 480 270 200 k=football", script: [{ set: {}, hold: 1 }, { set: { drop: 1 }, hold: "settle" }, { set: { drop: 0 }, hold: "settle" }] },
    make([cx, cy, size = 200], o, t, parent) {
      const kind = KINDS[o.k] ? o.k : "football", B = KINDS[kind], R = B.r, lab = o.lab !== "0";
      const H0 = ISO.clamp(ISO.num(o, "h", (4 * R) / 10), 1, 300) * 10;        // drop height of the ball's bottom, mm
      const POLE = [-2.3 * R, -1.5 * R], PH = H0 + 2.6 * R, AZ = H0 + 2 * R + 0.25 * R;
      const GROUND = { x: -3.3 * R, y: -2.7 * R, w: 5.6 * R, d: 4.6 * R, r: R * 0.12 };
      const W = size * 3, Hh = size * 2.2;
      const { P, g } = ISO.frame([...K.boxCorners(GROUND, -0.3 * R, 0), [POLE[0], POLE[1], PH + 0.2 * R], [R, R, 0], [0, 0, AZ + 0.3 * R]], cx, cy, W, Hh, { azimuth: 50, elevation: 18 }, parent);
      const V = G.viewOf(P), k = K.cameraOf(P).k, step = [5, 10, 20, 50, 100].find((v) => PH / v <= 60) || 100;
      const T = 0.3 * R, gd = B.ground;
      // ground: a slab of the ball's own surface with one painted line (and mown stripes on grass, planks on a court)
      let ground = `<path class="iso-halo" d="${K.haloOf(GROUND, -T, T, P)}"/>` + DAILY.prism(P, G.frameOf([0, 0, -T], [0, 1, 0], [1, 0, 0], [0, 0, 1]), DAILY.rrect(GROUND.x, GROUND.y, GROUND.x + GROUND.w, GROUND.y + GROUND.d, GROUND.r, 3), 0, T, [gd[0], gd[1]], gd[2], gd[3]);
      const across = (y) => K.lineOnTop([GROUND.x, y], [GROUND.x + GROUND.w, y], 0, P);
      if (kind === "basketball") ground += `<path d="${[0.2, 0.4, 0.6, 0.8].map((f) => across(GROUND.y + GROUND.d * f)).join("")}" fill="none" stroke="#b58a52" stroke-width=".8"/>`;
      if (kind === "football") ground += `<path d="${[1, 3].map((i) => K.pathOf([[0, i], [1, i], [1, i + 1], [0, i + 1]].map(([a, b]) => K.iso([GROUND.x + a * GROUND.w, GROUND.y + (b * GROUND.d) / 5, 0], P)), true)).join("")}" fill="#6db84a" opacity=".5"/>`;
      ground += `<path d="${across(GROUND.y + GROUND.d * 0.86)}" fill="none" stroke="#fdfdfb" stroke-width="${(0.05 * R * k).toFixed(2)}"/>`;
      // the rig: a weighted foot, the square post with its scale, the arm, its clamp knob
      const post = 0.09 * R, rig = [];
      rig.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(POLE[0], POLE[1], 0.5 * R, 0, 0.12 * R, P, 40, 0.02 * R), { tone: "lo" })));
      rig.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [POLE[0] - post, POLE[0] + post], [POLE[1] - post, POLE[1] + post], [0.12 * R, PH], "mid")));
      const ticks = { minor: [], major: [] };
      for (let z = 0; z <= PH - 0.1 * R; z += step) { const big = Math.round(z / step) % 5 === 0; (big ? ticks.major : ticks.minor).push(K.pathOf([K.iso([POLE[0] + post, POLE[1] + post, z + 0.12 * R], P), K.iso([POLE[0] + post - (big ? 1.2 : 0.6) * post, POLE[1] + post, z + 0.12 * R], P)])); }
      rig.push(L(ticks.minor.join(""), { tone: "lo" }), L(ticks.major.join(""), { tone: "mid" }));
      // the arm reaches from the post to over the ball; a collar clamps it to the post
      const dirA = G.unit3([-POLE[0], -POLE[1], 0]), side = G.unit3(G.cross3([0, 0, 1], dirA)), FA = G.frameOf([POLE[0], POLE[1], AZ], dirA, side, [0, 0, 1]);
      const armLen = Math.hypot(POLE[0], POLE[1]);
      rig.push(DAILY.box(P, FA, [-0.07 * R, 0.07 * R], [0, armLen + 0.07 * R], [0, 0.1 * R], "mid"));
      // the crossbar under the arm's end, that the jaws slide along
      rig.push(ISO.tinted(ISO.T.steel, ISO.box((u, w, y) => G.add3(G.add3(G.mul3(dirA, u), G.mul3(side, w)), [0, 0, y]), P, [-0.06 * R, 0.06 * R], [-0.9 * R, 0.9 * R], [AZ - 0.07 * R, AZ], "mid")));
      // (audit: the collar wraps the post on purpose, so the two read as "sunk")
      rig.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [POLE[0] - post * 1.6, POLE[0] + post * 1.6], [POLE[1] - post * 1.6, POLE[1] + post * 1.6], [AZ - 0.08 * R, AZ + 0.18 * R], "hi")));
      rig.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.12 * R, 0.08 * R, G.frameOf([POLE[0] + post * 1.6, POLE[1], AZ + 0.05 * R], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 16 }), { tone: "mid" })));
      // the two jaws, far one first: it goes behind the ball, the near one in front
      const jaws = (open) => [-1, 1].sort((a, b) => K.depthOf(G.mul3(side, a), P) - K.depthOf(G.mul3(side, b), P)).map((sg) => { const o0 = G.add3([0, 0, AZ], G.mul3(side, sg * (0.42 * R + open * 0.35 * R))); return ISO.tinted(ISO.T.rubber, ISO.box((u, w, y) => G.add3(G.add3(G.add3(o0, G.mul3(dirA, u)), G.mul3(side, w)), [0, 0, y]), P, [-0.1 * R, 0.1 * R], [-0.05 * R, 0.05 * R], [-0.45 * R, -0.07 * R], "mid")); });
      const ballSvg = ISO.tinted(B.base, S(G.sphereOf([0, 0, R], R, P, { steps: 64 }), { tone: "hi" })) + markings(P, kind, [0, 0, R], R);
      g.innerHTML = ground + `<path data-k="shadow" fill="#1d2126"/>` + `<g data-name="rig">${rig.join("")}</g><g data-k="jaws"></g><g data-name="ball">${ballSvg}</g><g data-k="jaw2"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["shadow", "rig", "jaws", "jaw2", "ball", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const s = { z: H0, v: 0, jaw: 0, drop: ISO.num(o, "drop", 0) > 0.5, squash: 0, bounces: [], resting: false };
      if (s.drop) { s.z = 0; s.jaw = 1; s.resting = true; }
      let lit = o.lit || "";
      const draw = () => {
        const z = Math.max(0, s.z), base = K.iso([0, 0, 0], P), sq = s.squash;
        // squash about the contact point: flatter and wider for the moment it presses into the ground
        const m = `${K.translateAlong(P, [0, 0, z])} translate(${base[0].toFixed(2)} ${base[1].toFixed(2)}) scale(${(1 + sq * 0.5).toFixed(4)} ${(1 - sq).toFixed(4)}) translate(${(-base[0]).toFixed(2)} ${(-base[1]).toFixed(2)})`;
        w.attr(el.ball, "transform", m);
        const near = Math.max(0, 1 - z / (H0 + 1)), rx = R * k * (0.6 + 0.35 * near), ry = rx * 0.32;
        w.attr(el.shadow, "d", `M${(base[0] - rx).toFixed(1)} ${base[1].toFixed(1)}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(2 * rx).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-2 * rx).toFixed(1)} 0Z`);
        w.attr(el.shadow, "opacity", (0.08 + 0.14 * near).toFixed(3));
        const jk = s.jaw.toFixed(2), jw = () => (el.jaws._j === jk ? el.jaws._v : ((el.jaws._j = jk), (el.jaws._v = jaws(+jk))));
        w.rebuild(el.jaws, jk, () => jw()[0]);
        w.rebuild(el.jaw2, jk, () => jw()[1]);
        const top = s.bounces.length ? Math.round(s.bounces.at(-1) / 10) : null;
        w.rebuild(el.words, lab ? `${top}` : "", () => !lab ? "" : [
          ISO.word(K.iso([POLE[0] - post, POLE[1], H0 + 0.12 * R], P), `${Math.round(H0 / 10)} cm`, "#444", { anchor: "end", size: 14, dy: 5 }),
          top !== null ? ISO.word(K.iso([POLE[0] - post, POLE[1], s.bounces.at(-1) + 0.12 * R], P), `${top} cm`, "#1f4f8f", { anchor: "end", size: 14, dy: 5 }) : "",
          ISO.word(K.iso([R, R, 0], P), `${kind} · ${(2 * R / 10).toFixed(1)} cm`, "#444", { anchor: "start", size: 14, dy: 16 }),
          ISO.word(K.iso([GROUND.x + GROUND.w, GROUND.y + GROUND.d, -T], P), B.name, "#555", { anchor: "end", size: 13, dy: 16 })].join(""));
        const want = lit || (s.drop && !s.resting ? "ball" : "");
        const groups = { ball: [el.ball], rig: [el.rig, el.jaws, el.jaw2], scale: [el.rig] };
        w.light([el.ball, el.rig, el.jaws, el.jaw2], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => {
        if (p.drop !== undefined) {
          const d = +p.drop > 0.5;
          if (d && !s.drop) { s.drop = true; s.v = 0; s.bounces = []; s.resting = false; }
          if (!d && s.drop) { s.drop = false; s.resting = false; }
        }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (s.drop) {
          s.jaw = calm ? 1 : Math.min(1, s.jaw + dt * 6);
          if (calm) { s.z = 0; s.v = 0; s.resting = true; s.squash = 0; s.bounces = [H0 * B.e ** 2]; }
          else if (!s.resting) {
            // free fall in small steps; at the ground the speed reverses times e, and the ball squashes for a frame
            s.squash = Math.max(0, s.squash - dt * 9);
            for (let i = 0, n = 4, h = dt / n; i < n; i++) {
              s.v -= GRAV * h; s.z += s.v * h;
              if (s.z <= 0) {
                const vin = -s.v; s.z = 0; s.v = vin * B.e;
                s.squash = Math.min(0.12, vin / 30000);
                const peak = (s.v * s.v) / (2 * GRAV);
                if (peak < 2) { s.v = 0; s.resting = true; break; }
                s.bounces.push(peak);
              }
            }
          } else s.squash = Math.max(0, s.squash - dt * 9);
        } else {
          // back into the jaws: lifted at a calm pace, then the jaws close
          s.squash = 0; s.v = 0; s.bounces = [];
          s.z = calm ? H0 : Math.min(H0, s.z + Math.max(60, (H0 - s.z) * 3) * dt);
          if (s.z >= H0) s.jaw = calm ? 0 : Math.max(0, s.jaw - dt * 5);
        }
        draw();
        return s.drop ? !s.resting || s.squash > 0 || s.jaw < 1 : s.z < H0 || s.jaw > 0;
      };
      g.readout = () => {
        const h = (x) => `${Math.round(x / 10)} cm`, e2 = B.e ** 2;
        if (!s.drop) return `${kind}: ${(2 * R / 10).toFixed(1)} cm, ${B.m}, ${B.rule} · held ${h(H0)} up`;
        if (!s.bounces.length) return `falling · ${(Math.abs(s.v) / 1000).toFixed(1)} m/s`;
        return `bounce ${s.bounces.length}: up to ${h(s.bounces.at(-1))} · each bounce e² = ${e2.toFixed(2)} of the last (e = ${B.e} on ${B.name})${s.resting ? " · at rest" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
