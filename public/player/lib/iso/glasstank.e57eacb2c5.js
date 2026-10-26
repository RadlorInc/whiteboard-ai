// "glasstank cx cy k depth=0..23 lab=0 lit=glass|frame|water|scale" — a PART (PARTS.md, batch 5): the density scene's
// glass tank, 30 × 20 × 25 cm, standing on the bench, origin the bench point under its middle. Five 4 mm glass panes
// sealed with silicone beads in the inside corners, an aluminium angle frame on all twelve edges with rubber feet, a
// depth scale etched on the back pane (a tick every 1 cm, numbers every 5, read from the front), and water `depth` cm
// deep. Things are dropped in at= its `water` anchor (plasticball, stone, woodblock water=1) or stood on its `floor`.
// Static. World: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 15, Y = 10, H = 25, A = 0.8, GT = 0.4, FLOOR = A + 0.6;   // half length, half width, height, frame angle leg, glass, inside floor
  const x0 = -X + A * 0.5, x1 = X - A * 0.5, y0 = -Y + A * 0.5, y1 = Y - A * 0.5;   // the glass lies inside the angles
  const ALU = ISO.tint("#e3e6ea", ["#9aa1a9", "#aab1b8", "#bcc2c8", "#ced3d8"], "#4a5058");
  const pane = (P, pts, fill, op) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" fill-opacity="${op}" stroke="#5d7f96" stroke-width="0.7" stroke-linejoin="round"/>`;
  // an L-section frame angle along one edge: two thin boxes meeting at the corner
  const bar = (P, [xa, xb], [ya, yb], [za, zb]) => ISO.wbox(P, [xa, xb], [ya, yb], [za, zb], "mid");

  ISO.add({
    name: "glasstank", title: "Glass tank (part)", compare: null,
    about: "A 30 × 20 × 25 cm glass tank in an aluminium frame with an etched depth scale, holding water depth cm deep; things dropped in float or sink at its water anchor. anchors: water floor rim",
    line: "glasstank cx cy k depth=0..23 lab=0 lit=glass|frame|water|scale",
    demo: { line: "glasstank 480 400 12 depth=16 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.5 }, { set: { lit: "water" }, hold: 1.5 }, { set: { lit: "frame|glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const depth = ISO.clamp(ISO.num(o, "depth", 16), 0, H - FLOOR - 1.5), zw = FLOOR + depth;
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -X - 1, y: -Y - 1, w: 2 * X + 2, d: 2 * Y + 2, r: 1 }, 0, 1, P)}"/>`];
      // rubber feet under the four corners, then the far frame: the back-left post and the back and left bottom rails
      out.push(ISO.tinted(ISO.T.rubber, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ISO.wbox(P, [sx * (X - 2.4) - 1, sx * (X - 2.4) + 1], [sy * (Y - 2.4) - 1, sy * (Y - 2.4) + 1], [0, 0.4], "lo")).join("")));
      const far = bar(P, [-X, -X + A], [-Y, -Y + A], [0.4, H]) + bar(P, [-X + A, X], [-Y, -Y + A], [0.4, 0.4 + A]) + bar(P, [-X, -X + A], [-Y + A, Y], [0.4, 0.4 + A]);
      out.push(`<g data-name="frame">${ISO.tinted(ALU, far)}</g>`);
      // the glass floor and the two far panes (back y−, left x−), each a pale sheet with its cut edge
      const glassBack = [
        pane(P, [[x0, y0, A], [x1, y0, A], [x1, y1, A], [x0, y1, A]], "#e7f1f8", 0.9),
        pane(P, [[x0, y0, A], [x1, y0, A], [x1, y0, H], [x0, y0, H]], "#eef6fb", 0.92),
        pane(P, [[x0, y0, A], [x0, y1, A], [x0, y1, H], [x0, y0, H]], "#e7f1f8", 0.92),
        // the panes' top cut edges (4 mm of glass) and the silicone beads in the far inside corners
        L(K.segment([x0, y0 + GT, H], [x1, y0 + GT, H], P) + K.segment([x0 + GT, y0, H], [x0 + GT, y1, H], P), { tone: "faint" }),
        `<path d="${K.segment([x0 + GT, y0 + GT, FLOOR], [x0 + GT, y0 + GT, H - 0.2], P) + K.segment([x0 + GT, y0 + GT, FLOOR], [x1 - GT, y0 + GT, FLOOR], P) + K.segment([x0 + GT, y0 + GT, FLOOR], [x0 + GT, y1 - GT, FLOOR], P)}" stroke="#a9c3d3" stroke-width="${Math.max(0.6, k * 0.12).toFixed(2)}" stroke-linecap="round"/>`,
      ];
      out.push(`<g data-name="glass">${glassBack.join("")}</g>`);
      // the etched scale on the back pane's inside: a rule, a tick every 1 cm (5 cm ones longer), numbers every 5 from the floor
      const sx = X - 5, sy = y0 + GT + 0.02, minor = [], major = [], nums = [];
      for (let d = 0; d <= H - FLOOR - 1; d++) {
        const z = FLOOR + d, big = d % 5 === 0;
        (big ? major : minor).push(K.segment([sx, sy, z], [sx - (big ? 1.4 : 0.8), sy, z], P));
        if (big && d) nums.push(LAB.faceText(P, [sx + 1.3, sy, z - 0.35], [1, 0, 0], String(d), 1.1, "#6f8ea3"));
      }
      out.push(`<g data-name="scale">${L(K.segment([sx, sy, FLOOR], [sx, sy, FLOOR + Math.floor(H - FLOOR - 1)], P), { tone: "lo", free: true })}${L(minor.join(""), { tone: "lo", free: "end" })}${L(major.join(""), { tone: "mid", free: "end" })}${nums.join("")}${LAB.faceText(P, [sx + 1.3, sy, FLOOR + 2.15], [1, 0, 0], "cm", 1, "#6f8ea3")}</g>`);
      // the water: its near faces and its surface, inside the glass (the far faces lie behind them)
      const wx0 = x0 + GT, wx1 = x1 - GT, wy0 = y0 + GT, wy1 = y1 - GT;
      if (depth > 0.05) {
        const box = (pts) => K.pathOf(pts.map((p) => K.iso(p, P)), true);
        out.push(`<g data-name="water"><path d="${box([[wx0, wy1, FLOOR], [wx1, wy1, FLOOR], [wx1, wy1, zw], [wx0, wy1, zw]])}" fill="#4f93d6" fill-opacity=".2"/>` +
          `<path d="${box([[wx1, wy0, FLOOR], [wx1, wy1, FLOOR], [wx1, wy1, zw], [wx1, wy0, zw]])}" fill="#2b6cc4" fill-opacity=".24"/>` +
          `<path d="${box([[wx0, wy0, zw], [wx1, wy0, zw], [wx1, wy1, zw], [wx0, wy1, zw]])}" fill="#bfdcf5" fill-opacity=".5" stroke="#4f93d6" stroke-width="0.8"/>` +
          // the meniscus: a thin brighter line where the water climbs the near glass
          `<path d="${K.pathOf([[wx0, wy1, zw + 0.12], [wx1, wy1, zw + 0.12], [wx1, wy0, zw + 0.12]].map((p) => K.iso(p, P)))}" fill="none" stroke="#2b6cc4" stroke-width="0.6" opacity=".7" data-free=""/></g>`);
      }
      // the two near panes (front y+, right x+): nearly clear, a highlight streak on each
      out.push(`<g data-name="glass">${pane(P, [[x0, y1, A], [x1, y1, A], [x1, y1, H], [x0, y1, H]], "#eef6fb", 0.12)}${pane(P, [[x1, y0, A], [x1, y1, A], [x1, y1, H], [x1, y0, H]], "#e2eef6", 0.14)}` +
        `<path d="${K.segment([x0 + 4, y1 + 0.01, 6], [x0 + 9, y1 + 0.01, 21], P) + K.segment([x1 + 0.01, y0 + 3, 8], [x1 + 0.01, y0 + 6, 19], P)}" stroke="#fff" stroke-width="${Math.max(1, k * 0.25).toFixed(2)}" stroke-linecap="round" opacity=".7"/>` +
        L(K.segment([x0, y1 - GT, H], [x1, y1 - GT, H], P) + K.segment([x1 - GT, y0, H], [x1 - GT, y1, H], P), { tone: "faint" }) + `</g>`);
      // the near frame: the front and right bottom rails, the three near posts, the four top rails, corner gussets with rivets
      const near = bar(P, [-X + A, X], [Y - A, Y], [0.4, 0.4 + A]) + bar(P, [X - A, X], [-Y + A, Y - A], [0.4, 0.4 + A]) +
        bar(P, [X - A, X], [-Y, -Y + A], [0.4, H]) + bar(P, [-X, -X + A], [Y - A, Y], [0.4, H]) +
        bar(P, [-X + A, X - A], [-Y, -Y + A], [H - A, H]) + bar(P, [-X, -X + A], [-Y + A, Y - A], [H - A, H]) +
        bar(P, [X - A, X], [Y - A, Y], [0.4, H]) + bar(P, [-X, X], [Y - A, Y], [H - A, H]) + bar(P, [X - A, X], [-Y, Y], [H - A, H]);
      const rivets = [[X, Y - 0.4, 1.6], [X, Y - 0.4, H - 1.6], [X - 0.4, Y, 1.6], [X - 0.4, Y, H - 1.6], [X, -Y + 0.4, 1.6], [X, -Y + 0.4, H - 1.6], [-X + 0.4, Y, 1.6], [-X + 0.4, Y, H - 1.6]];
      out.push(`<g data-name="frame">${ISO.tinted(ALU, near)}${K.dotsSvg(rivets.map((p) => K.iso(p, P)), { size: 0.4 })}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([X, Y, H + 2], P), "glass tank", "#445", { size: 14, anchor: "start" }) +
        (depth > 0.05 ? ISO.word(K.iso([X, Y, zw], P), `water ${depth.toFixed(0)} cm deep`, "#2b6cc4", { size: 13, anchor: "start", dy: 4 }) : "");
      g.anchors = { water: [0, 0, +zw.toFixed(3)], floor: [0, 0, FLOOR], rim: [0, 0, H] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B11.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `glass tank 30 × 20 × 25 cm · water ${depth.toFixed(1)} cm deep (${((wx1 - wx0) * (wy1 - wy0) * depth / 1000).toFixed(1)} L) · 1.0 g/cm³: lighter things float, denser ones sink`;
      B11.light(w, g, lit);
      return g;
    },
  });
})();
