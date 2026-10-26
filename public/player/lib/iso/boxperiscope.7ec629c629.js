// "boxperiscope cx cy k up=0..30 ray=0|1 lab=0 lit=lower|upper|mirrors|ray" — a PART (PARTS.md, batch 5): the
// telescopic box periscope of periscope.js, standing, its origin the surface point under its middle. A lower tube
// 8 × 8 cm and 42 cm tall and an upper tube 7.2 cm square that slides up inside it (50 cm tall closed, 80 cm at
// up=30); their near (+y) walls are cut away to show the two plane mirrors at 45°. Light travels toward −x (the bench
// rule): it enters the top window on the +x face, the top mirror turns it 90° down the tube, the bottom mirror turns it
// 90° again, out of the eyepiece on the −x face 5 cm up (anchor `eye`, where a model eye looks in). ray=1 draws that
// path. set({ up }) slides the upper tube (eased); `window` = the top window's middle as built. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G;
  const A = 4, T = 0.4, B = A - T, H1 = 42, U = 3.6, UI = U - T, EZ = 5, UPMAX = 30, RAY = "#e09a00";
  const winOf = (up) => 46 + up, botOf = (up) => 9 + up, topOf = (up) => 50 + up;
  const LOWER = ISO.T.paint, UPPER = ISO.tint("#eef2e4", ["#b8c49c", "#c6d0ae", "#d3dcbf", "#e0e7d1"], "#4a5a2a");
  const wb = (P, x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);
  // a 45° mirror in the x–z plane round (0, cz): glass toward n (face +1: toward +x and down, −1: toward −x and up),
  // a dark backing behind it; half-width a along the slope, half-depth b across y
  const mirror = (P, cz, face, a, b) => {
    const n = [face / Math.SQRT2, 0, -face / Math.SQRT2], u = [1 / Math.SQRT2, 0, 1 / Math.SQRT2];
    const at = (s, d, y) => [u[0] * s + n[0] * d, y, cz + u[2] * s + n[2] * d];
    return ISO.tinted(ISO.T.plastic, ISO.box(at, P, [-a, a], [-0.35, -0.1], [-b, b], "lo")) + ISO.tinted(ISO.T.glass, ISO.box(at, P, [-a, a], [-0.1, 0.08], [-b, b], "hi", true));
  };
  const line = (P, pts, arrow = true) => {
    const s = pts.map((p) => K.iso(p, P));
    let d = K.pathOf(s);
    if (arrow) for (let i = 0; i < s.length - 1; i++) {
      const p = s[i], q = s[i + 1], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 24) continue;
      d += `M${(m[0] - 5 * Math.cos(ang + 0.5)).toFixed(1)} ${(m[1] - 5 * Math.sin(ang + 0.5)).toFixed(1)}L${m[0].toFixed(1)} ${m[1].toFixed(1)}L${(m[0] - 5 * Math.cos(ang - 0.5)).toFixed(1)} ${(m[1] - 5 * Math.sin(ang - 0.5)).toFixed(1)}`;
    }
    return `<path d="${d}" fill="none" stroke="${RAY}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  // the lower tube behind the light: back wall, the −x wall round the eyepiece, the floor, the bottom mirror
  const lowerBack = (P) => ISO.tinted(LOWER, wb(P, [-A, A], [-A, -B], [0, H1]) + wb(P, [-A, -B], [-B, B], [0, EZ - 3.2]) + wb(P, [-A, -B], [-B, B], [EZ + 3.2, H1]) +
    wb(P, [-A, -B], [-B, -3], [EZ - 3.2, EZ + 3.2]) + wb(P, [-A, -B], [3, B], [EZ - 3.2, EZ + 3.2]) + wb(P, [-B, A - T], [-B, B], [0, T], "lo")) +
    `<g data-name="mirrors">${mirror(P, EZ, -1, B * Math.SQRT2 - 0.3, B - 0.05)}</g>`;
  // the lower tube in front: its +x wall and what is left of its cut-away +y wall (a strip at the foot and the top)
  const lowerFront = (P) => ISO.tinted(LOWER, wb(P, [B, A], [-A, A], [0, H1]) + wb(P, [-A, B], [B, A], [0, 1.6]) + wb(P, [-A, B], [B, A], [H1 - 1.6, H1]) + wb(P, [-A, -B], [B, A], [1.6, H1 - 1.6]));
  // the sliding upper tube at up: back and −x walls, the top mirror, (the ray inside), its +x wall round the window,
  // the cap, and the strips left of its +y wall
  function upperSvg(P, up, ray) {
    const z0 = botOf(up), z1 = topOf(up), zw = winOf(up), out = [];
    out.push(ISO.tinted(UPPER, wb(P, [-U, U], [-U, -UI], [z0, z1]) + wb(P, [-U, -UI], [-UI, UI], [z0, z1])));
    out.push(`<g data-name="mirrors">${mirror(P, zw, 1, UI * Math.SQRT2 - 0.3, UI - 0.05)}</g>`);
    if (ray) out.push(`<g data-name="ray">${line(P, [[UI, 0, zw], [0, 0, zw], [0, 0, EZ], [-0.01, 0, EZ]])}</g>`);
    out.push(ISO.tinted(UPPER, wb(P, [UI, U], [-U, U], [z0, zw - 3]) + wb(P, [UI, U], [-U, U], [zw + 3, z1 - T]) + wb(P, [UI, U], [-U, -2.8], [zw - 3, zw + 3]) + wb(P, [UI, U], [2.8, U], [zw - 3, zw + 3]) +
      wb(P, [-U, U], [-U, U], [z1 - T, z1]) + wb(P, [-UI, UI], [UI, U], [z0, z0 + 1.2]) + wb(P, [-UI, UI], [UI, U], [z1 - 0.8, z1 - T]) + wb(P, [-U, -UI], [UI, U], [z0, z1 - T])));
    return out.join("");
  }

  ISO.add({
    name: "boxperiscope", title: "Box periscope (part)", compare: null,
    about: "A telescopic box periscope 8 × 8 cm, 50 to 80 cm tall, its near wall cut away: two plane mirrors at 45° turn light entering the top window (+x) down the tube and out of the eyepiece (−x); the upper tube slides up. anchors: eye window",
    line: "boxperiscope cx cy k up=0..30 ray=0|1 lab=0 lit=lower|upper|mirrors|ray",
    demo: { line: "boxperiscope 480 490 5.5 up=0 ray=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { up: 30, lit: "upper" }, hold: "settle" }, { set: { lit: "mirrors" }, hold: 1.2 }, { set: { up: 12, ray: 0, lit: "lower" }, hold: "settle" }, { set: { ray: 1, lit: "ray" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const s = { up: ISO.clamp(ISO.num(o, "up", 0), 0, UPMAX), ray: o.ray !== "0" }; s.upT = s.up;
      let lit = o.lit || "";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -A, y: -A, w: 2 * A, d: 2 * A, r: 0.3 }, 0, H1, P)}"/><g data-part="rayOut" data-name="ray"></g>` +
        `<g data-name="lower">${lowerBack(P)}</g><g data-part="rayLow" data-name="ray"></g><g data-part="upper" data-name="upper"></g><g data-name="lower">${lowerFront(P)}</g><g data-part="rayIn" data-name="ray"></g><g data-part="words"></g>`;
      g.anchors = { eye: [-A, 0, EZ], window: [U, 0, winOf(s.up)] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const key = s.up.toFixed(2), zw = winOf(s.up);
        w.rebuild(el.rayOut, String(s.ray), () => (s.ray ? line(P, [[-A, 0, EZ], [-A - 12, 0, EZ]]) : ""));
        w.rebuild(el.rayLow, String(s.ray), () => (s.ray ? line(P, [[0, 0, EZ], [-A, 0, EZ]], false) : ""));
        w.rebuild(el.upper, key + s.ray, () => upperSvg(P, s.up, s.ray));
        w.rebuild(el.rayIn, key + s.ray, () => (s.ray ? line(P, [[U + 14, 0, zw], [U, 0, zw]]) : ""));
        w.rebuild(el.words, lab ? key + s.ray : "", () => !lab ? "" :
          ISO.word(K.iso([U, U, zw], P), "mirror at 45°", "#555", { size: 13, anchor: "start", dy: -14 }) + ISO.word(K.iso([A, A, EZ], P), "mirror at 45°", "#555", { size: 13, anchor: "start", dy: 4 }) +
          (s.ray ? ISO.word(K.iso([-A - 12, 0, EZ], P), "to the eye", "#555", { size: 13, anchor: "end", dy: -6 }) : ""));
        B22.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.up !== undefined && p.up !== "" && Number.isFinite(+p.up)) s.upT = ISO.clamp(+p.up, 0, UPMAX);
        if (p.ray !== undefined) s.ray = String(p.ray) !== "0";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { s.up = ISO.follow(s.up, s.upT, dt, 0.6, ISO.still()); draw(); return s.up !== s.upT; };
      g.readout = () => `periscope ${topOf(s.up).toFixed(0)} cm tall · the top window is ${(winOf(s.up) - EZ).toFixed(0)} cm above the eyepiece · each 45° mirror turns the light 90°`;
      draw();
      return g;
    },
  });
})();
