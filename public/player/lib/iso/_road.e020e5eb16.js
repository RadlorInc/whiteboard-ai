// Shared road-model parts for roundabout, junction and runway (not a recipe: it only defines window.ROAD). World
// units: 1 = 0.25 m on a road model, z up. Paint is drawn as flat filled shapes on the road top (real paint is an area).
(() => {
  const K = window.K, G = window.G;
  const ROAD = (window.ROAD = {});
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  ROAD.mix = mix;
  const tints = {};
  // kit tokens for a painted part of colour c
  ROAD.tint = (c) => tints[c] || (tints[c] = ISO.tint(mix(c, "#ffffff", 0.25), [mix(c, "#000000", 0.3), mix(c, "#000000", 0.2), mix(c, "#000000", 0.1), c], mix(c, "#000000", 0.6)));
  ROAD.CAR = { red: "#d9483b", blue: "#3b78c9", yellow: "#f0b62e", green: "#3f9a5a", white: "#eef0f2", grey: "#8a9099" };
  ROAD.GRASS = ISO.tint("#cfe6b8", ["#8fb877", "#9fc486", "#afcf96", "#bfdaa7"], "#476b2f");
  ROAD.KERB = ISO.tint("#ecebe6", ["#b9b8b2", "#c6c5bf", "#d3d2cc", "#dfded8"], "#6c6b66");
  ROAD.TARMAC = ISO.tint("#9a9da2", ["#6a6d72", "#74777c", "#7f8287", "#8b8e93"], "#3d4044");

  // a flat shape on the plane z: [x, y] points
  ROAD.flat = (P, pts, z, fill, stroke = "none", w = 0) => `<path d="${K.pathOf(pts.map(([x, y]) => K.iso([x, y, z], P)), true)}" fill="${fill}"${stroke !== "none" ? ` stroke="${stroke}" stroke-width="${w}"` : ""}/>`;
  // a painted bar from a to b, width w, on plane z
  ROAD.bar = (P, a, b, w, z, fill = "#fbfbf7") => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2;
    return ROAD.flat(P, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], z, fill);
  };
  // length of a 2D polyline, and the point at distance s along it as [x, y, heading]
  ROAD.len = (pts) => pts.reduce((t, p, i) => (i ? t + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  ROAD.along = (pts, s) => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.hypot(bx - ax, by - ay);
      if (s <= l || i === pts.length - 1) { const f = l ? ISO.clamp(s / l, 0, 1) : 0; return [ax + (bx - ax) * f, ay + (by - ay) * f, Math.atan2(by - ay, bx - ax)]; }
      s -= l;
    }
    return [...pts[0], 0];
  };
  // painted dashes along a polyline (dash, gap in world units)
  ROAD.dashes = (P, pts, z, dash, gap, w, fill = "#fbfbf7") => {
    const out = [];
    const L = ROAD.len(pts);
    for (let s = gap / 2; s + dash <= L; s += dash + gap) out.push(ROAD.bar(P, ROAD.along(pts, s), ROAD.along(pts, s + dash), w, z, fill));
    return out.join("");
  };
  // a car seen from any side: x, y its centre on the road at height z, head its heading (radians, 0 = +x).
  // Wheels, the painted body, a glass cabin with pillars, the roof, head and tail lamps. len ~ 4.4 m.
  ROAD.car = (P, x, y, head, colour, z = 0, s = 1) => {
    const c = Math.cos(head), n = Math.sin(head);
    const at = (u, w, h) => [x + (u * c - w * n) * s, y + (u * n + w * c) * s, z + h * s];
    const paint = ROAD.tint(ROAD.CAR[colour] || colour), out = [];
    const view = K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P), viewY = K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P);
    // the four tyres, far ones first
    const tyres = [[-5.6, -3.9], [-5.6, 3.9], [5.6, -3.9], [5.6, 3.9]].sort((a, b) => K.depthOf(at(a[0], a[1], 0), P) - K.depthOf(at(b[0], b[1], 0), P));
    for (const [u, w] of tyres) out.push(ISO.tinted(ISO.T.rubber, ISO.box(at, P, [u - 1.7, u + 1.7], [w - 0.8, w + 0.8], [0, 3.2], "hi")));
    out.push(ISO.tinted(paint, ISO.box(at, P, [-8.8, 8.8], [-3.6, 3.6], [1.2, 4.4], "mid")));
    // bonnet slope and boot as low wedges, then the glass cabin and the roof
    out.push(ISO.tinted(paint, ISO.poly([at(3.2, -3.5, 4.4), at(8.6, -3.4, 4.4), at(8.6, 3.4, 4.4), at(3.2, 3.5, 4.4), at(3.2, -3.4, 5.0), at(3.2, 3.4, 5.0)], [[0, 1, 2, 3], [0, 1, 4], [3, 2, 5], [1, 2, 5, 4], [0, 3, 5, 4]], P, "mid")));
    out.push(ISO.tinted(ISO.T.glass, ISO.poly([at(-5.6, -3.4, 4.4), at(3.2, -3.4, 4.4), at(3.2, 3.4, 4.4), at(-5.6, 3.4, 4.4), at(-4.4, -2.8, 7.0), at(1.4, -2.8, 7.0), at(1.4, 2.8, 7.0), at(-4.4, 2.8, 7.0)], ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(paint, ISO.box(at, P, [-4.3, 1.3], [-2.75, 2.75], [7.0, 7.5], "mid")));
    // lamps: white at the front, red at the back, on the faces that show
    const lampFront = view * c + viewY * n > 0, lamp = (u, w, col) => ISO.tinted(ROAD.tint(col), ISO.box(at, P, [u - 0.25, u + 0.25], [w - 1, w + 1], [3.2, 4.0], "hi"));
    if (lampFront) for (const w of [-2.4, 2.4]) out.push(lamp(8.85, w, "#fff6c8"));
    else for (const w of [-2.4, 2.4]) out.push(lamp(-8.85, w, "#e0453a"));
    return out.join("");
  };
  // A car that moves: its drawing at the origin for a heading (rounded to 2°) is cached per projection, and the car
  // is put in place with a translate (the projection is affine, so this is exact). place(el, x, y, head, colour).
  const cache = new WeakMap();
  ROAD.place = (P, w, el, x, y, head, colour) => {
    const step = Math.round((((head * 180) / Math.PI) % 360 + 360) % 360 / 2) % 180, key = colour + step;
    let m = cache.get(P); if (!m) cache.set(P, (m = new Map()));
    if (!m.has(key)) m.set(key, ROAD.car(P, 0, 0, (step * 2 * Math.PI) / 180 + 1e-3, colour, 0));   // a hair off the axis: ISO.poly can round a face turned straight from the light to shade -1
    w.rebuild(el, key, () => m.get(key));
    w.attr(el, "transform", K.translateAlong(P, [x, y, 0]));
  };
  // a small round tree: a trunk and a round crown
  ROAD.tree = (P, x, y, h = 22, z0 = 0) =>
    `<g style="${ISO.T.wood}">${K.solidSvg(K.cylinder(x, y, 1.4, z0, h * 0.34, P, 12), { tone: "mid" })}</g><g style="${ROAD.GRASS}">${K.solidSvg(G.sphereOf([x, y, z0 + h * 0.62], h * 0.32, P), { tone: "mid" })}</g>`;
})();
