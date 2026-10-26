// Batch b38 helpers (server-room parts: serverrack, server1u, storage2u, netswitch, blankplate, serverpsu,
// serverheatsink, fan40). Not a recipe: it only sets window.B38. The shapes are reused from server.js, which builds in
// mm with x = depth (front toward +x), y = across, z up. B38.view keeps those numbers and draws them on the part camera
// (ISO.part, 1 = 1 cm): part X = scene y, part Y = (scene x + off) × sy, so a unit's front faces the room (+y) and the
// faces the scene's camera saw (+x front, +y side) are the faces the part camera sees, and server.js's order holds.
(() => {
  const K = window.K;
  const B = (window.B38 = {});
  B.U = 44.45;                                           // one rack unit, mm
  B.view = (P, off = 0, sy = 1) => {
    const T = window.TECH, Pm = ISO.mm(P), w = (p) => [p[1], (p[0] + off) * sy, p[2]];
    const r = (a) => { const u = (a[0] + off) * sy, v = (a[1] + off) * sy; return u <= v ? [u, v] : [v, u]; };
    return {
      Pm, w,
      box: (x, y, z, tone = "mid", c = T.C.dark) => T.box(Pm, y, r(x), z, tone, c),
      fq: (x, y0, y1, z0, z1, fill, stroke = "#16191d", sw = 0.5) => T.quad(Pm, [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map(w), fill, stroke, sw),
      dot: (pts, size = 0.55, tone = "lo") => T.dot(Pm, pts.map(w), size, tone),
      iso: (p) => K.iso(w(p), Pm),
      depth: (p) => K.depthOf(w(p), Pm),
      top: (a, b, z) => K.lineOnTop([a[1], (a[0] + off) * sy], [b[1], (b[0] + off) * sy], z, Pm),
      move: (dx) => K.translateAlong(Pm, [0, dx * sy, 0]),
    };
  };

  // A unit's front, drawn at depth x (server.js's front()): drive bays, control panel, ports. Returns the static svg
  // and the light windows [x, y0, y1, z0, z1, kind] that blink.
  B.front = (V, kind, u0 = 0, x = 0.05) => {
    const s = [], L = [], fq = V.fq;
    if (kind === "storage") for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const y0 = -205 + c * 102, z0 = u0 + 6 + r * 27;
      s.push(fq(x, y0, y0 + 98, z0, z0 + 24.5, "#5a6068"), fq(x, y0 + 6, y0 + 70, z0 + 8, z0 + 16, "#3a3e44", "#16191d", 0.4), fq(x, y0 + 74, y0 + 80, z0 + 4, z0 + 20.5, "#2f343a", "#16191d", 0.3));
      L.push([x, y0 + 84, y0 + 92, z0 + 10, z0 + 14, "disk"]);
    }
    if (kind === "server") for (let c = 0; c < 8; c++) {
      const y0 = -210 + c * 41;
      s.push(fq(x, y0, y0 + 38, u0 + 5, u0 + 39, "#5a6068"), fq(x, y0 + 5, y0 + 33, u0 + 9, u0 + 22, "#3a3e44", "#16191d", 0.4));
      L.push([x, y0 + 15, y0 + 23, u0 + 30, u0 + 34, "disk"]);
    }
    if (kind === "server") { s.push(fq(x, 132, 214, u0 + 5, u0 + 39, "#4a4f57"), fq(x, 184, 206, u0 + 12, u0 + 20, "#2a2d31", "#0d0e10", 0.4)); L.push([x, 140, 152, u0 + 26, u0 + 32, "power"], [x, 160, 172, u0 + 26, u0 + 32, "health"]); }
    if (kind === "switch") {
      for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) {
        const y0 = -205 + c * 26 + Math.floor(c / 6) * 10, z0 = u0 + 6 + r * 17;
        s.push(fq(x, y0, y0 + 22, z0, z0 + 13, "#16191d", "#0d0e10"), fq(x, y0 + 8, y0 + 14, z0 + 9.5, z0 + 12, "#3a3e44", "#0d0e10", 0.3));
        L.push([x, y0 + 2, y0 + 7, z0 + 13.6, z0 + 15.6, "port"]);
      }
      for (let c = 0; c < 4; c++) s.push(fq(x, 122 + c * 19, 138 + c * 19, u0 + 14, u0 + 26, "#3a3e44"), fq(x, 124 + c * 19, 136 + c * 19, u0 + 17, u0 + 23, "#16191d", "#0d0e10", 0.3));
      s.push(fq(x, 199, 216, u0 + 14, u0 + 27, "#2f6fb8", "#123a66"), fq(x, 202, 213, u0 + 16, u0 + 25, "#16191d", "#0d0e10", 0.3));   // console port (blue)
      L.push([x, 122, 128, u0 + 29, u0 + 32, "power"], [x, 132, 138, u0 + 29, u0 + 32, "health"]);
    }
    return { s: s.join(""), L };
  };

  // Rack ears, one each side, on the unit's front (x 0..3 mm), with lift handles if asked (server.js's ears()).
  B.ears = (V, h, handle, c) => [-1, 1].map((s) => {
    const y = s > 0 ? [220, 241.5] : [-241.5, -220], top = h * B.U;
    const slot = (z) => V.fq(3.05, s * 229, s * 236, z, z + 6, "#2a2d31", "#16191d", 0.4);
    return V.box([0, 3], y, [1.5, top - 1.5], "mid", c) + slot(top / 2 - 3) +
      (handle ? V.box([3, 14], s > 0 ? [224, 232] : [-232, -224], [7, top - 7], "hi", c) : "");
  }).join("");

  // Status lights: power steady green, health blue, disks and ports flicker with traffic (server.js's colourOf).
  B.lights = (V, el, L, on = () => true) => {
    const T = window.TECH, w = ISO.writer();
    const colourOf = (kind, n, b) => {
      const busy = ((b * 2654435761 + n * 40503) >>> 9) % 4 !== 0;
      return kind === "power" ? T.LED.green : kind === "health" ? T.LED.blue : busy ? (kind === "port" ? T.LED.amber : T.LED.green) : T.LED.off;
    };
    return (t) => {
      const lit = on(), b = lit ? Math.floor(t * 5) : -1;
      w.rebuild(el, String(b), () => L.map(([x, y0, y1, z0, z1, kind], n) => V.fq(x + 0.05, y0, y1, z0, z1, lit ? colourOf(kind, n, b) : T.LED.off, "#16191d", 0.3)).join(""));
    };
  };

  // A fan rotor as flat artwork in a plane (centre o, axes U across and V down, cm): hub and n swept blades. The
  // caller puts it in <g transform=matrix> and turns the inner <g> with rotate().
  B.rotor = (r, hub, n = 7, fill = "#2f3338", stroke = "#0d0e10") => {
    const blades = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, p = (rr, da) => [(Math.cos(a + da) * rr).toFixed(3), (Math.sin(a + da) * rr).toFixed(3)].join(" ");
      blades.push(`M${p(hub * 0.95, -0.28)}Q${p(r * 0.7, -0.05)} ${p(r * 0.96, 0.32)}L${p(r * 0.96, 0.62)}Q${p(r * 0.6, 0.55)} ${p(hub * 0.95, 0.28)}Z`);
    }
    return `<path d="${blades.join("")}" fill="${fill}" stroke="${stroke}" stroke-width="${(r * 0.02).toFixed(3)}" stroke-linejoin="round"/>` +
      `<circle r="${hub}" fill="#3a3e44" stroke="${stroke}" stroke-width="${(r * 0.02).toFixed(3)}"/><circle r="${(hub * 0.55).toFixed(3)}" fill="#e9e3d2" stroke="none"/>`;
  };
})();
