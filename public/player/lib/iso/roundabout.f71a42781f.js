// "roundabout cx cy size side=left|right t=0..1 exit=1|2|3 lab=1 lit=island|splitter|giveway|ring" — a model
// roundabout on a base board: four two-lane arms, a raised grass island in the middle, a splitter island on each arm,
// give-way lines and signs at every entry, grass corners behind kerbs. side=left (UK, India: drive on the left, go
// round clockwise, give way to traffic from the right); side=right mirrors it. Three cars follow the rules as t runs
// 0 → 1: the red car drives up to the give-way line and waits while the blue car already on the ring passes, then
// enters, goes round and leaves by exit `exit` (3 = turning right); the yellow car waits for the red car to pass
// before it goes straight on. Scale 1 unit = 0.25 m: lanes 2.75 m, ring 8 m wide, island 15 m across.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const E = 112, HW = 22, RI = 30, RO = 62, RL = 46, LANE = 11, rad = (d) => (d * Math.PI) / 180;
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  // Catmull-Rom through points, sampled every ~2 units
  const spline = (pts) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };

  ISO.add({
    name: "roundabout", title: "Roundabout", compare: "roundabout 480 270 500",
    about: "A model roundabout: cars give way to traffic already on the ring, go round clockwise (driving on the left) and leave by their exit.",
    line: "roundabout cx cy size side=left|right t=0..1 exit=1|2|3 lab=1 lit=island|splitter|giveway|ring",
    demo: { line: "roundabout 480 275 500", script: [{ set: { t: 0.28, lit: "giveway" }, hold: "settle" }, { set: { t: 0.52, lit: "ring" }, hold: "settle" }, { set: { t: 1, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const LAB = window.LAB, ROAD = window.ROAD;
      const lab = o.lab !== "0", W = size * 1.25, H = size * 0.86, sg = o.side === "right" ? -1 : 1, exitN = ISO.clamp(Math.round(ISO.num(o, "exit", 3)), 1, 3);
      const { P, g } = ISO.frame([[-E, -E, -10], [E, E, -10], [-E, E, 0], [E, -E, 0], [0, 0, 40]], cx, cy, W, H, { azimuth: 30, elevation: 40 }, parent);
      const dir = (f) => [Math.cos(rad(f)), Math.sin(rad(f))];
      // the lane centre at distance d out along the arm at angle f: entering (toward the middle) or leaving
      const lane = (f, d, entering) => { const [c, s] = dir(f), k = (entering ? 1 : -1) * sg * LANE; return [c * d + s * k, s * d - c * k]; };
      const ring = (a) => [Math.cos(rad(a)) * RL, Math.sin(rad(a)) * RL];
      // a route in at arm fin and out at arm fout, going round the right way
      const route = (fin, fout) => {
        let span = ((fin - fout) * sg) % 360; if (span <= 20) span += 360;
        const pts = [lane(fin, E + 8, true), lane(fin, 96, true), lane(fin, 78, true)];
        for (let a = 16; a <= span - 16 + 1e-6; a += Math.min(24, (span - 32) / Math.max(1, Math.round((span - 32) / 24)))) pts.push(ring(fin - sg * a));
        pts.push(lane(fout, 78, false), lane(fout, 96, false), lane(fout, E + 8, false));
        return spline(pts);
      };
      const arms = [90, 0, -90, 180];
      const red = route(90, arms[exitN]), blue = route(180, 0), yellow = route(-90, 90);
      const stopAt = (path, d0) => { let s = 0; for (let i = 1; i < path.length; i++) { s += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); if (Math.hypot(...path[i]) < d0) return s; } return s; };
      const sRed = stopAt(red, 75), sYel = stopAt(yellow, 75), lRed = ROAD.len(red), lBlue = ROAD.len(blue), lYel = ROAD.len(yellow);
      const seg = (t, a, b) => ISO.smooth(a, b, t);
      // where each car is at time t (0..1): red waits at the line from 0.25 to 0.5, the blue car passes, yellow waits
      // for red to clear its entry
      const poseAt = (t) => ({
        red: 2 + (sRed - 2) * seg(t, 0, 0.25) + (lRed - 22 - sRed) * seg(t, 0.5, 1),
        blue: 30 + (lBlue - 52) * ((t - 0.02) / 0.62 < 0 ? 0 : Math.min(1, (t - 0.02) / 0.62)),
        yellow: 10 + (sYel - 10) * seg(t, 0.3, 0.55) + (lYel - 22 - sYel) * seg(t, 0.84, 1),
      });

      // ── the static model: base, tarmac, kerbed grass corners, island, splitters, paint, signs
      const base = { x: -E - 6, y: -E - 6, w: 2 * E + 12, d: 2 * E + 12, r: 4 };
      const out = [`<path class="iso-halo" d="${K.haloOf(base, -10, 10, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(base, -10, 8, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(base, -6, P, 4), { tone: "faint" }) }))];
      out.push(ISO.tinted(ROAD.TARMAC, S(K.slabOf({ x: -E, y: -E, w: 2 * E, d: 2 * E, r: 1 }, -2, 2, P, 2), { tone: "hi" })));
      // grass corners: the square outside both arms and the ring, behind a kerb
      const corner = (qx, qy, inset) => {
        const r = RO + inset, h = HW + inset, a0 = Math.asin(h / r), pts = [];
        for (let i = 0; i <= 10; i++) { const a = a0 + ((Math.PI / 2 - 2 * a0) * i) / 10; pts.push([qx * Math.cos(a) * r, qy * Math.sin(a) * r]); }
        pts.push([qx * h, qy * (E - inset * 0)], [qx * (E - 0), qy * E], [qx * E, qy * h]);
        return pts;
      };
      const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
      const cornerSvg = ([qx, qy]) => ISO.tinted(ROAD.KERB, S(K.extrude(corner(qx, qy, 0), 0, 1.6, P, { convex: false }), { tone: "mid" })) + ROAD.flat(P, corner(qx, qy, 1.4), 1.6, "#bcd9a2", "#6f9a55", 0.6);
      corners.forEach((q) => out.push(cornerSvg(q)));
      // the central island: kerb ring, grass, a low planted mound and a tree
      out.push(named("island", ISO.tinted(ROAD.KERB, S(K.cylinder(0, 0, RI, 0, 2, P, 56), { tone: "mid" })) + ISO.tinted(ROAD.GRASS, S(K.cylinder(0, 0, RI - 1.6, 2, 1.2, P, 56), { tone: "hi" })) +
        ISO.tinted(ROAD.GRASS, S(G.solidOf([[0, 18], [3, 14, 1], [5, 7, 1], [5.6, 0]], G.frameOf([0, 0, 3.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid" }))));
      // splitter islands: a kerbed teardrop on each arm, from the ring out along the centre line
      const splitter = (f, inset) => { const [c, s] = dir(f), at = (d, w) => [c * d - s * w, s * d + c * w], pts = []; const w0 = 7 - inset, w1 = 1.6 - inset * 0.3;
        for (const [d, w] of [[RO + 3 + inset, w0], [RO + 12, w0 + 0.4], [94 - inset, w1]]) pts.push(at(d, w)); pts.push(at(96 - inset, 0));
        for (const [d, w] of [[94 - inset, -w1], [RO + 12, -w0 - 0.4], [RO + 3 + inset, -w0]]) pts.push(at(d, w)); return pts; };
      const splitters = arms.map((f) => ISO.tinted(ROAD.KERB, S(K.extrude(splitter(f, 0), 0, 1.6, P), { tone: "mid" })) + ROAD.flat(P, splitter(f, 1.2), 1.6, "#bcd9a2", "#6f9a55", 0.5)).join("");
      // paint: the ring's edge lines, give-way double dashes across each entry, edge lines and a GIVE WAY triangle
      const paint = [], gw = [];
      const arcPts = (r, a0, a1) => Array.from({ length: 25 }, (_, i) => { const a = rad(a0 + ((a1 - a0) * i) / 24); return [Math.cos(a) * r, Math.sin(a) * r]; });
      for (const f of arms) {
        const [c, s] = dir(f), at = (d, w) => [c * d - s * w, s * d + c * w], e = -sg;   // e: the side of the entry lane
        for (const off of [0, 3]) gw.push(ROAD.dashes(P, [at(RO + 1.5 + off, e * 7.5), at(RO + 1.5 + off, e * (HW - 1.5))], 0.02, 2.4, 1.6, 1));
        const tri = [at(RO + 22, e * 6.6), at(RO + 22, e * (HW - 4.4)), at(RO + 34, e * LANE)];
        gw.push(ROAD.flat(P, tri, 0.02, "none") + `<path d="${K.pathOf(tri.map(([x, y]) => K.iso([x, y, 0.02], P)), true)}" fill="none" stroke="#fbfbf7" stroke-width="${(G.scaleOf(P) * 1.1).toFixed(2)}" stroke-linejoin="round"/>`);
        paint.push(ROAD.bar(P, at(94, 0), at(E - 2, 0), 0.8, 0.02), "");
      }
      paint.push(ROAD.dashes(P, arcPts(RL, 0, 359), 0.02, 4, 8, 0.7, "#eef0ea"));
      out.push(named("ring", paint.join("")), named("splitter", splitters), named("giveway", gw.join("")));
      if (lab) out.push(ISO.word(K.iso([RI * 0.5, RI * 0.5, 3.2], P), "island", "#476b2f", { size: 12, dy: 4 }));
      g.innerHTML = out.join("") + `<g data-part="movers"></g><g data-part="words"></g>`;

      // ── things that cars pass behind: signs on posts and the island's tree, sorted with the cars
      const movers = g.querySelector("[data-part=movers]"), words = g.querySelector("[data-part=words]"), items = {}, anchors = {};
      const sign = (f) => {
        const [c, s] = dir(f), x = c * (RO + 28) - s * -sg * (HW + 7), y = s * (RO + 28) + c * -sg * (HW + 7), up = 30;
        const Fz = G.frameOf([x, y, 1.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), face = [c, s, 0];
        const tri = [[0, 6], [-5.4, -3.4], [5.4, -3.4]].map(([u, v]) => K.iso([x + c * 0.8 - s * u, y + s * 0.8 + c * u, up + v], P));
        const inner = [[0, 3.8], [-3.4, -2.2], [3.4, -2.2]].map(([u, v]) => K.iso([x + c * 0.9 - s * u, y + s * 0.9 + c * u, up + v], P));
        const facing = K.depthOf([x + c, y + s, 0], P) > K.depthOf([x, y, 0], P);
        // the post's foot stands on the kerbed grass (K.extrude, which the audit doesn't record: it reads as loose)
        return ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 0.8, 1.6, up + 2, P, 12), { tone: "mid" })) + S(K.cylinder(x, y, 1.8, 1.6, 0.8, P, 16), { tone: "lo" }) +
          `<path d="${K.pathOf(tri, true)}" fill="${facing ? "#d8372c" : "#c9ccd0"}" stroke="#5a1a14" stroke-width="0.7" stroke-linejoin="round"/>` + (facing ? `<path d="${K.pathOf(inner, true)}" fill="#fbfbf7"/>` : "");
      };
      arms.forEach((f, i) => { const e = mk("g", { "data-name": "giveway" }, movers); e.innerHTML = sign(f); items["s" + i] = e; const [c, s] = dir(f); anchors["s" + i] = [c * (RO + 28) + s * sg * (HW + 7), s * (RO + 28) - c * sg * (HW + 7), 0]; });
      const tree = mk("g", { "data-name": "island" }, movers); tree.innerHTML = ROAD.tree(P, -8, 6, 26, 6.8) + ROAD.tree(P, 9, -5, 18, 6.8); items.tree = tree; anchors.tree = [0, 0, 0];
      const cars = { red: [red, "red"], blue: [blue, "blue"], yellow: [yellow, "yellow"] };
      for (const k in cars) { items[k] = mk("g", { "data-car": k }, movers); }
      const sort = ISO.sorter(P, movers), w = ISO.writer();
      const st = { t: ISO.clamp(ISO.num(o, "t", 0), 0, 1), want: 0, lit: o.lit || "" };
      st.want = st.t;
      const pose = {}, namedEls = [...g.querySelectorAll("[data-name]")];
      let drawn = "";
      const draw = () => {
        if (drawn === `${st.t} ${st.lit}`) return;
        const litChanged = !drawn || drawn.split(" ")[1] !== st.lit;
        drawn = `${st.t} ${st.lit}`;
        const s = poseAt(st.t);
        for (const k in cars) {
          const [x, y, h] = ROAD.along(cars[k][0], s[k]);
          pose[k] = [x, y, h]; anchors[k] = [x, y, 0];
          ROAD.place(P, w, items[k], x, y, h, cars[k][1]);
        }
        sort(items, anchors);
        const phase = st.t < 0.22 ? "approaching the give-way line" : st.t < 0.5 ? "waiting: gives way to the blue car coming from the right" : st.t < 0.97 ? "going round clockwise" : `left by exit ${exitN}`;
        if (lab) w.rebuild(words, phase, () => ISO.word(K.iso([sg * 70, 92, 2], P), "red car: " + phase.split(":")[0], "#a8382a", { size: 13 }));
        if (litChanged) { const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => {
        if (p.t !== undefined) st.want = ISO.clamp(+p.t, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // time runs at a steady rate toward its target, so each car moves at a believable speed and eases in its stops
      g.update = (dt) => {
        if (ISO.still()) st.t = st.want;
        else st.t += Math.sign(st.want - st.t) * Math.min(Math.abs(st.want - st.t), dt * 0.16);
        draw();
        return st.t !== st.want;
      };
      g.readout = () => {
        const t = st.t, v = Math.round(48 * 0.25 * 3.6);
        return `drive on the ${sg > 0 ? "left, round clockwise" : "right, round anticlockwise"} · red car ${t < 0.22 ? "slowing for the give-way line" : t < 0.5 ? "stopped at the give-way line: traffic on the ring (from the right) goes first" : t < 0.97 ? `on the ring, about ${v} km/h, signalling for exit ${exitN}` : `has left by exit ${exitN}`} · ring 8 m wide, island 15 m across`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
